'use client';

import { usePlan, PlanEmptyState } from '@/features/plan-context';
import { BudgetPlanner } from '@/features/budget/budget-planner';
import { PageHeader, Badge } from '@/features/ui';

export default function BudgetPage() {
  const { plan, updatePlan } = usePlan();

  if (!plan) {
    return (
      <PlanEmptyState
        title="No Active Event Budget"
        description="Please configure an event first to generate category allocations and start tracking planned versus actual expenses."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Budget Planner & Tracking"
        description={`Strict integer-normalized budget allocations across ${plan.currency} minor units. Edit proportions, track actual spending, and convert currencies live with zero hardcoded percentages.`}
        badge={<Badge variant="success">Integer Normalized</Badge>}
      />

      <BudgetPlanner plan={plan} onPlanUpdate={updatePlan} />
    </div>
  );
}
