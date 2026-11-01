import type { EventPlan } from '../schemas/event-plan';
import { formatMinorUnits } from './budget-math';

export interface PlanFinding {
  readonly id: string;
  readonly priority: 'urgent' | 'warning' | 'suggestion';
  readonly title: string;
  readonly details: string;
  readonly targetTab: 'budget' | 'timeline' | 'vendors' | 'ideas' | 'event';
  readonly actionLabel: string;
}

function collectBudgetFindings(plan: EventPlan): PlanFinding[] {
  const findings: PlanFinding[] = [];
  const totalBudget = plan.totalBudgetMinor;
  const currentAllocated = plan.budgetItems.reduce((acc, b) => acc + b.allocatedMinor, 0);

  if (currentAllocated > totalBudget) {
    const overDiff = currentAllocated - totalBudget;
    findings.push({
      id: 'budget_over',
      priority: 'urgent',
      title: `Over Budget by ${formatMinorUnits(overDiff, plan.currency)} ${plan.currency}`,
      details:
        'Your category allocations exceed your total budget cap. Rebalance or explore tradeoffs.',
      targetTab: 'budget',
      actionLabel: 'Rebalance Budget',
    });
  } else if (currentAllocated < totalBudget) {
    const unallocatedDiff = totalBudget - currentAllocated;
    findings.push({
      id: 'budget_unallocated',
      priority: 'suggestion',
      title: `${formatMinorUnits(unallocatedDiff, plan.currency)} ${plan.currency} Unallocated Funds Available`,
      details:
        'You have reserve funds not yet assigned to categories. Consider boosting your contingency.',
      targetTab: 'budget',
      actionLabel: 'Allocate Funds',
    });
  }

  const contingency = plan.budgetItems.find((b) =>
    b.category.toLowerCase().includes('contingency'),
  );
  if (!contingency || contingency.allocatedMinor === 0) {
    findings.push({
      id: 'budget_no_contingency',
      priority: 'warning',
      title: 'Zero Contingency Buffer Reserved',
      details:
        'Unexpected costs typically arise in event planning. A prudent emergency reserve is recommended.',
      targetTab: 'budget',
      actionLabel: 'Add Contingency',
    });
  }

  return findings;
}

function collectTimelineFindings(plan: EventPlan, today: string): PlanFinding[] {
  const findings: PlanFinding[] = [];
  const overdueTasks = plan.timelineItems.filter(
    (item) => item.status !== 'completed' && item.dueDate < today,
  );

  if (overdueTasks.length > 0) {
    findings.push({
      id: 'timeline_overdue',
      priority: 'urgent',
      title: `${overdueTasks.length} Milestone${overdueTasks.length > 1 ? 's' : ''} Overdue`,
      details: `Action needed for: ${overdueTasks
        .slice(0, 3)
        .map((t) => t.title)
        .join(', ')}${overdueTasks.length > 3 ? '...' : ''}.`,
      targetTab: 'timeline',
      actionLabel: 'Review Milestones',
    });
  }

  const inProgressCount = plan.timelineItems.filter((item) => item.status === 'in_progress').length;
  if (inProgressCount === 0 && plan.timelineItems.length > 0) {
    findings.push({
      id: 'timeline_no_active',
      priority: 'suggestion',
      title: 'No Milestones Marked In-Progress',
      details: 'Start tracking active progress on current phase milestones.',
      targetTab: 'timeline',
      actionLabel: 'Open Timeline',
    });
  }

  return findings;
}

function collectVendorAndIdeaFindings(plan: EventPlan): PlanFinding[] {
  const findings: PlanFinding[] = [];
  const uncontactedVendors = plan.vendorItems.filter((v) => v.status === 'to_contact');
  if (uncontactedVendors.length > 0) {
    findings.push({
      id: 'vendors_uncontacted',
      priority: 'warning',
      title: `${uncontactedVendors.length} Vendor Categories Need Outreach`,
      details: `Reach out to suppliers for: ${uncontactedVendors
        .slice(0, 3)
        .map((v) => v.category)
        .join(', ')}.`,
      targetTab: 'vendors',
      actionLabel: 'Find Vendors',
    });
  }

  if (plan.ideas.length === 0) {
    findings.push({
      id: 'ideas_empty',
      priority: 'suggestion',
      title: 'Personalized Concept Studio Ready',
      details: 'Generate tailored theme, decor, and accessibility concepts for your occasion.',
      targetTab: 'ideas',
      actionLabel: 'Generate Ideas',
    });
  }

  return findings;
}

/**
 * Deterministically analyzes the entire event plan across budget, timeline, and vendors.
 * Produces prioritized actionable findings in strict priority order.
 */
export function generatePlanFindings(plan: EventPlan, todayDateStr?: string): PlanFinding[] {
  const today = todayDateStr || new Date().toISOString().split('T')[0] || '';
  const findings = [
    ...collectBudgetFindings(plan),
    ...collectTimelineFindings(plan, today),
    ...collectVendorAndIdeaFindings(plan),
  ];

  const priorityOrder = { urgent: 0, warning: 1, suggestion: 2 };
  return findings.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}
