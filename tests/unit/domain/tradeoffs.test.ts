import { describe, it, expect } from 'vitest';
import type { EventPlan } from '@/lib/schemas/event-plan';
import { generateOverBudgetTradeoffs, applyTradeoffOption } from '@/lib/domain/tradeoffs';

const mockPlan: EventPlan = {
  id: 'plan-tradeoff-test',
  schemaVersion: 1,
  title: 'Over Budget Wedding',
  eventType: 'wedding',
  eventDate: '2026-09-15',
  location: 'Carmel, CA',
  guestCount: 100,
  totalBudgetMinor: 2000000, // $20,000
  currency: 'USD',
  isOutdoor: true,
  budgetItems: [
    { id: 'b1', category: 'Venue', allocatedMinor: 800000, spentMinor: 0, isEstimate: true },
    { id: 'b2', category: 'Catering', allocatedMinor: 800000, spentMinor: 0, isEstimate: true },
    {
      id: 'b3',
      category: 'Floral & Decor',
      allocatedMinor: 400000,
      spentMinor: 0,
      isEstimate: true,
    },
    {
      id: 'b4',
      category: 'Contingency Reserve',
      allocatedMinor: 300000,
      spentMinor: 0,
      isEstimate: true,
    },
  ], // Total allocated: $23,000 ($3,000 over)
  timelineItems: [],
  vendorItems: [],
  ideas: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('Budget Trade-off Deterministic Engine', () => {
  it('returns empty array when plan is within budget', () => {
    const underBudgetPlan = { ...mockPlan, totalBudgetMinor: 2500000 };
    const options = generateOverBudgetTradeoffs(underBudgetPlan);
    expect(options).toHaveLength(0);
  });

  it('generates 3 deterministic options when over budget', () => {
    const options = generateOverBudgetTradeoffs(mockPlan);
    expect(options.length).toBeGreaterThanOrEqual(2);

    const ids = options.map((o) => o.id);
    expect(ids).toContain('reduce_guests');
    expect(ids).toContain('trim_flexible');
    expect(ids).toContain('use_contingency');
  });

  it('correctly applies the use_contingency option', () => {
    const updated = applyTradeoffOption(mockPlan, 'use_contingency');
    const contingency = updated.budgetItems.find((b) => b.category === 'Contingency Reserve');
    expect(contingency?.allocatedMinor).toBe(0);
  });

  it('handles applyTradeoffOption when overAmount <= 0', () => {
    const underPlan = { ...mockPlan, totalBudgetMinor: 3000000 };
    const res = applyTradeoffOption(underPlan, 'use_contingency');
    expect(res).toEqual(underPlan);
  });

  it('handles contingency missing or zero', () => {
    const noContingencyPlan: EventPlan = {
      ...mockPlan,
      budgetItems: mockPlan.budgetItems.filter((b) => b.category !== 'Contingency Reserve'),
    };
    const res = applyTradeoffOption(noContingencyPlan, 'use_contingency');
    expect(res).toEqual(noContingencyPlan);
  });

  it('handles trim_flexible when no flexible categories exist', () => {
    const rigidPlan: EventPlan = {
      ...mockPlan,
      budgetItems: [
        { id: 'b1', category: 'Venue', allocatedMinor: 2500000, spentMinor: 0, isEstimate: true },
      ],
    };
    const res = applyTradeoffOption(rigidPlan, 'trim_flexible');
    expect(res).toEqual(rigidPlan);
  });

  it('handles reduce_guests when catering is missing or zero', () => {
    const noCateringPlan: EventPlan = {
      ...mockPlan,
      budgetItems: [
        { id: 'b1', category: 'Venue', allocatedMinor: 2500000, spentMinor: 0, isEstimate: true },
      ],
    };
    const res = applyTradeoffOption(noCateringPlan, 'reduce_guests');
    expect(res).toEqual(noCateringPlan);
  });

  it('correctly applies the trim_flexible option', () => {
    const updated = applyTradeoffOption(mockPlan, 'trim_flexible');
    const decor = updated.budgetItems.find((b) => b.category === 'Floral & Decor');
    expect(decor?.allocatedMinor).toBeLessThan(400000);
  });

  it('correctly applies the reduce_guests option', () => {
    const updated = applyTradeoffOption(mockPlan, 'reduce_guests');
    expect(updated.guestCount).toBeLessThan(100);
    const catering = updated.budgetItems.find((b) => b.category === 'Catering');
    expect(catering?.allocatedMinor).toBeLessThan(800000);
  });

  it('handles unknown option gracefully by returning unchanged plan', () => {
    const updated = applyTradeoffOption(mockPlan, 'unknown_id');
    expect(updated).toEqual(mockPlan);
  });
});
