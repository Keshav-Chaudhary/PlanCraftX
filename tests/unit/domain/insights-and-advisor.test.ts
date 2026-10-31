import { describe, it, expect } from 'vitest';
import { generatePlanFindings } from '../../../lib/domain/insights';
import type {
  EventPlan,
  BudgetItem,
  TimelineItem,
  VendorItem,
} from '../../../lib/schemas/event-plan';

function makePlan(overrides: Partial<EventPlan> = {}): EventPlan {
  const defaultBudget: BudgetItem[] = [
    {
      id: 'b1',
      category: 'Public Safety',
      allocatedMinor: 15000000,
      spentMinor: 0,
      isEstimate: true,
    },
    { id: 'b2', category: 'Permits', allocatedMinor: 10000000, spentMinor: 0, isEstimate: true },
    {
      id: 'b3',
      category: 'Contingency Reserve',
      allocatedMinor: 5000000,
      spentMinor: 0,
      isEstimate: true,
    },
  ];
  const defaultTimeline: TimelineItem[] = [
    {
      id: 'm1',
      phase: 'Permits',
      title: 'Permit Application',
      dueDate: '2026-06-03',
      status: 'pending',
      isEstimate: true,
    },
    {
      id: 'm2',
      phase: 'Safety',
      title: 'Medical Plan',
      dueDate: '2026-07-03',
      status: 'completed',
      isEstimate: true,
    },
  ];
  const defaultVendors: VendorItem[] = [
    { id: 'v1', category: 'Safety', name: 'Medics', status: 'booked', isEstimate: true },
    { id: 'v2', category: 'Lighting', name: 'StagePro', status: 'to_contact', isEstimate: true },
  ];
  return {
    id: 'test-insights-plan',
    schemaVersion: 1,
    title: 'Community Festival 2026',
    eventType: 'community',
    eventDate: '2026-09-01',
    location: 'Central Park',
    guestCount: 500,
    totalBudgetMinor: 50000000,
    currency: 'INR',
    isOutdoor: true,
    budgetItems: defaultBudget,
    timelineItems: defaultTimeline,
    vendorItems: defaultVendors,
    ideas: [],
    createdAt: '2026-05-01T00:00:00.000Z',
    updatedAt: '2026-05-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('Insights Engine & Deterministic Rule Advisor', () => {
  describe('Budget Health Findings', () => {
    it('flags urgent finding when allocated exceeds total budget', () => {
      const budgetItems: BudgetItem[] = [
        { id: 'b1', category: 'Venue', allocatedMinor: 15000000, spentMinor: 0, isEstimate: true },
        { id: 'b2', category: 'Food', allocatedMinor: 10000000, spentMinor: 0, isEstimate: true },
      ];
      const plan = makePlan({ totalBudgetMinor: 20000000, budgetItems });
      const overFinding = generatePlanFindings(plan, '2026-05-01').find(
        (f) => f.id === 'budget_over',
      );
      expect(overFinding).toBeDefined();
      expect(overFinding?.priority).toBe('urgent');
      expect(overFinding?.targetTab).toBe('budget');
    });

    it('flags suggestion finding when unallocated funds remain', () => {
      const budgetItems: BudgetItem[] = [
        { id: 'b1', category: 'Safety', allocatedMinor: 20000000, spentMinor: 0, isEstimate: true },
        {
          id: 'b2',
          category: 'Contingency',
          allocatedMinor: 5000000,
          spentMinor: 0,
          isEstimate: true,
        },
      ];
      const plan = makePlan({ totalBudgetMinor: 50000000, budgetItems });
      const unalloc = generatePlanFindings(plan, '2026-05-01').find(
        (f) => f.id === 'budget_unallocated',
      );
      expect(unalloc).toBeDefined();
      expect(unalloc?.priority).toBe('suggestion');
    });

    it('warns when contingency buffer is zero or missing', () => {
      const budgetItems: BudgetItem[] = [
        { id: 'b1', category: 'Safety', allocatedMinor: 25000000, spentMinor: 0, isEstimate: true },
        {
          id: 'b2',
          category: 'Permits',
          allocatedMinor: 25000000,
          spentMinor: 0,
          isEstimate: true,
        },
      ];
      const plan = makePlan({ budgetItems });
      const contingency = generatePlanFindings(plan, '2026-05-01').find(
        (f) => f.id === 'budget_no_contingency',
      );
      expect(contingency).toBeDefined();
      expect(contingency?.priority).toBe('warning');
    });
  });

  describe('Timeline Health Findings', () => {
    it('flags overdue milestones when today is past milestone dueDate', () => {
      const timelineItems: TimelineItem[] = [
        {
          id: 'm-past',
          phase: 'Permits',
          title: 'File permit',
          dueDate: '2026-05-01',
          status: 'pending',
          isEstimate: true,
        },
      ];
      const overdue = generatePlanFindings(makePlan({ timelineItems }), '2026-05-15').find(
        (f) => f.id === 'timeline_overdue',
      );
      expect(overdue).toBeDefined();
      expect(overdue?.priority).toBe('urgent');
      expect(overdue?.targetTab).toBe('timeline');
    });

    it('does not flag completed milestones as overdue', () => {
      const timelineItems: TimelineItem[] = [
        {
          id: 'm-done',
          phase: 'Permits',
          title: 'File permit',
          dueDate: '2026-05-01',
          status: 'completed',
          isEstimate: true,
        },
      ];
      const overdue = generatePlanFindings(makePlan({ timelineItems }), '2026-05-15').find(
        (f) => f.id === 'timeline_overdue',
      );
      expect(overdue).toBeUndefined();
    });

    it('suggests starting active work when no milestone is marked in_progress', () => {
      const timelineItems: TimelineItem[] = [
        {
          id: 'm-pending',
          phase: 'Permits',
          title: 'Notice',
          dueDate: '2026-06-05',
          status: 'pending',
          isEstimate: true,
        },
      ];
      const noActive = generatePlanFindings(makePlan({ timelineItems }), '2026-05-01').find(
        (f) => f.id === 'timeline_no_active',
      );
      expect(noActive).toBeDefined();
      expect(noActive?.priority).toBe('suggestion');
    });
  });

  describe('Vendor & Ideas Health Findings', () => {
    it('warns when vendor categories need outreach (to_contact)', () => {
      const vendorItems: VendorItem[] = [
        { id: 'v1', category: 'Decor', name: 'Vendor 1', status: 'to_contact', isEstimate: true },
      ];
      const uncontacted = generatePlanFindings(makePlan({ vendorItems }), '2026-05-01').find(
        (f) => f.id === 'vendors_uncontacted',
      );
      expect(uncontacted).toBeDefined();
      expect(uncontacted?.priority).toBe('warning');
      expect(uncontacted?.targetTab).toBe('vendors');
    });

    it('suggests generating personalized ideas when ideas list is empty', () => {
      const ideasEmpty = generatePlanFindings(makePlan({ ideas: [] }), '2026-05-01').find(
        (f) => f.id === 'ideas_empty',
      );
      expect(ideasEmpty).toBeDefined();
      expect(ideasEmpty?.priority).toBe('suggestion');
      expect(ideasEmpty?.targetTab).toBe('ideas');
    });
  });

  describe('Finding Sorting & Priority Ordering', () => {
    it('sorts urgent findings before warnings and suggestions', () => {
      const plan = makePlan({
        totalBudgetMinor: 20000000,
        budgetItems: [
          {
            id: 'b1',
            category: 'Venue',
            allocatedMinor: 25000000,
            spentMinor: 0,
            isEstimate: true,
          },
        ],
        timelineItems: [
          {
            id: 'm1',
            phase: 'P1',
            title: 'Task',
            dueDate: '2026-04-01',
            status: 'pending',
            isEstimate: true,
          },
        ],
        vendorItems: [
          { id: 'v1', category: 'Decor', name: 'Vendor 1', status: 'to_contact', isEstimate: true },
        ],
      });
      const findings = generatePlanFindings(plan, '2026-05-01');
      const priorities = findings.map((f) => f.priority);
      const urgentIndices = priorities.flatMap((p, idx) => (p === 'urgent' ? [idx] : []));
      const warningIndices = priorities.flatMap((p, idx) => (p === 'warning' ? [idx] : []));
      expect(Math.max(...urgentIndices)).toBeLessThan(Math.min(...warningIndices));
    });
  });
});
