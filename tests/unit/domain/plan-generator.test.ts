import { describe, it, expect } from 'vitest';
import { buildEventPlan, type PlanGenerationInput } from '@/lib/domain/plan-generator';
import { updateBudgetItemAllocation } from '@/lib/domain/budget-math';
import { cycleMilestoneStatus } from '@/lib/domain/timeline-engine';
import { updateVendorStatus, addVendorToPlan, buildOsmVendor } from '@/lib/domain/event-rules';
import { createPlanCalendarIcs } from '@/lib/domain/ics-generator';

describe('Domain Plan Generator & Invariant Operations', () => {
  const baseInput: PlanGenerationInput = {
    eventType: 'wedding',
    eventDate: '2026-11-20',
    location: 'Chicago, IL',
    guestCount: 150,
    totalBudgetMajor: 30000,
    currency: 'USD',
    isOutdoor: true,
    themeOrCulture: 'Vintage Rustic',
    dietaryRequirements: 'Vegan options',
    accessibilityNeeds: 'Step-free access',
    freeTextVision: 'Autumn outdoor ceremony',
  };

  it('builds a complete, valid EventPlan with integer minor-unit allocations', () => {
    const plan = buildEventPlan(baseInput);

    expect(plan.eventType).toBe('wedding');
    expect(plan.totalBudgetMinor).toBe(3000000);
    expect(plan.location).toBe('Chicago, IL');
    expect(plan.isOutdoor).toBe(true);
    expect(plan.themeOrCulture).toBe('Vintage Rustic');
    expect(plan.budgetItems.length).toBeGreaterThan(0);

    const sumAllocated = plan.budgetItems.reduce((acc, it) => acc + it.allocatedMinor, 0);
    expect(sumAllocated).toBe(plan.totalBudgetMinor);

    expect(plan.timelineItems.length).toBeGreaterThan(0);
    expect(plan.vendorItems.length).toBeGreaterThan(0);
  });

  it('honors custom category weights when provided', () => {
    const customWeights = [
      { category: 'Venue & Reception', weight: 60 },
      { category: 'Catering & Bar', weight: 40 },
    ];
    const plan = buildEventPlan(baseInput, customWeights);

    const venue = plan.budgetItems.find((b) => b.category === 'Venue & Reception');
    const catering = plan.budgetItems.find((b) => b.category === 'Catering & Bar');

    expect(venue?.allocatedMinor).toBe(1800000);
    expect(catering?.allocatedMinor).toBe(1200000);
    if (venue && catering) {
      expect(venue.allocatedMinor + catering.allocatedMinor).toBe(plan.totalBudgetMinor);
    }
  });

  it('updates budget item allocation and rebalances remaining categories', () => {
    const plan = buildEventPlan(baseInput);
    const firstItem = plan.budgetItems[0];
    if (!firstItem) throw new Error('Missing first item');

    const updated = updateBudgetItemAllocation(plan, firstItem.id, 10000);
    const updatedFirst = updated.budgetItems.find((b) => b.id === firstItem.id);

    expect(updatedFirst?.allocatedMinor).toBe(1000000);
    const totalSum = updated.budgetItems.reduce((acc, it) => acc + it.allocatedMinor, 0);
    expect(totalSum).toBe(plan.totalBudgetMinor);
  });

  it('ignores invalid or negative allocation updates gracefully', () => {
    const plan = buildEventPlan(baseInput);
    const firstItem = plan.budgetItems[0];
    if (!firstItem) throw new Error('Missing item');

    const updatedNegative = updateBudgetItemAllocation(plan, firstItem.id, -500);
    expect(updatedNegative).toEqual(plan);

    const updatedNaN = updateBudgetItemAllocation(plan, firstItem.id, NaN);
    expect(updatedNaN).toEqual(plan);
  });

  it('cycles milestone status pending -> in_progress -> completed -> pending', () => {
    const plan = buildEventPlan(baseInput);
    const milestone = plan.timelineItems[0];
    if (!milestone) throw new Error('Missing milestone');

    const step1 = cycleMilestoneStatus(plan, milestone.id);
    expect(step1.timelineItems[0]?.status).toBe('in_progress');

    const step2 = cycleMilestoneStatus(step1, milestone.id);
    expect(step2.timelineItems[0]?.status).toBe('completed');

    const step3 = cycleMilestoneStatus(step2, milestone.id);
    expect(step3.timelineItems[0]?.status).toBe('pending');
  });

  it('updates vendor status immutably', () => {
    const plan = buildEventPlan(baseInput);
    const vendor = plan.vendorItems[0];
    if (!vendor) throw new Error('Missing vendor');

    const updated = updateVendorStatus(plan, vendor.id, 'booked');
    expect(updated.vendorItems.find((v) => v.id === vendor.id)?.status).toBe('booked');
  });

  it('creates and adds verified OpenStreetMap vendor', () => {
    const plan = buildEventPlan(baseInput);
    const osmVendor = buildOsmVendor(
      '123456',
      'Historic Pavilion',
      'Historic Pavilion, Chicago, IL',
      'Venue & Reception',
    );

    expect(osmVendor.osmId).toBe('123456');
    expect(osmVendor.name).toBe('Historic Pavilion');

    const updated = addVendorToPlan(plan, osmVendor);
    expect(updated.vendorItems[0]?.id).toBe(osmVendor.id);
    expect(updated.vendorItems.length).toBe(plan.vendorItems.length + 1);
  });

  it('generates an RFC 5545 iCalendar payload directly from an EventPlan', () => {
    const plan = buildEventPlan(baseInput);
    const icsString = createPlanCalendarIcs(plan, '2026-10-31T00:00:00.000Z');

    expect(icsString).toContain('BEGIN:VCALENDAR');
    expect(icsString).toContain('END:VCALENDAR');
    expect(icsString).toContain('BEGIN:VEVENT');
    expect(icsString).toContain('END:VEVENT');
    expect(icsString).toContain('Chicago\\, IL');
  });
});
