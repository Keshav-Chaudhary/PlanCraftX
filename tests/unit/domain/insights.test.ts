import { describe, it, expect } from 'vitest';
import type { EventPlan } from '@/lib/schemas/event-plan';
import { generatePlanFindings } from '@/lib/domain/insights';

const basePlan: EventPlan = {
  id: 'plan-insights-test',
  schemaVersion: 1,
  title: 'Test Plan Insights',
  eventType: 'birthday',
  eventDate: '2026-09-15',
  location: 'Chicago, IL',
  guestCount: 30,
  totalBudgetMinor: 100000, // $1,000
  currency: 'USD',
  isOutdoor: false,
  budgetItems: [
    {
      id: 'b1',
      category: 'Cake & Desserts',
      allocatedMinor: 20000,
      spentMinor: 0,
      isEstimate: true,
    },
    {
      id: 'b2',
      category: 'Contingency Reserve',
      allocatedMinor: 10000,
      spentMinor: 0,
      isEstimate: true,
    },
  ],
  timelineItems: [
    {
      id: 't1',
      phase: 'Prep',
      title: 'Order Cake',
      dueDate: '2026-05-01',
      status: 'pending',
      isEstimate: true,
    },
    {
      id: 't2',
      phase: 'Execution',
      title: 'Pick up Balloons',
      dueDate: '2026-09-14',
      status: 'in_progress',
      isEstimate: true,
    },
  ],
  vendorItems: [
    { id: 'v1', category: 'Bakery', name: 'Corner Bakery', status: 'to_contact', isEstimate: true },
  ],
  ideas: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('Plan Insights & Findings Deterministic Engine', () => {
  it('identifies unallocated funds and uncontacted vendors', () => {
    const findings = generatePlanFindings(basePlan, '2026-04-01');
    expect(findings.some((f) => f.id === 'budget_unallocated')).toBe(true);
    expect(findings.some((f) => f.id === 'vendors_uncontacted')).toBe(true);
    expect(findings.some((f) => f.id === 'ideas_empty')).toBe(true);
  });

  it('ranks urgent budget overruns and overdue milestones at top priority', () => {
    const overduePlan: EventPlan = {
      ...basePlan,
      totalBudgetMinor: 20000, // $200 (allocated is $300)
    };
    // Today is after 2026-05-01, so task t1 is overdue
    const findings = generatePlanFindings(overduePlan, '2026-06-01');

    expect(findings[0]?.priority).toBe('urgent');
    expect(findings.some((f) => f.id === 'budget_over')).toBe(true);
    expect(findings.some((f) => f.id === 'timeline_overdue')).toBe(true);
  });

  it('flags missing contingency reserve buffer as warning', () => {
    const noContingencyPlan: EventPlan = {
      ...basePlan,
      budgetItems: [
        { id: 'b1', category: 'Venue', allocatedMinor: 100000, spentMinor: 0, isEstimate: true },
      ],
    };
    const findings = generatePlanFindings(noContingencyPlan, '2026-04-01');
    expect(findings.some((f) => f.id === 'budget_no_contingency')).toBe(true);
  });
});
