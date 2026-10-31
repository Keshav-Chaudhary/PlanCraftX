'use client';

import { usePlan, PlanEmptyState } from '@/features/plan-context';
import { BudgetPlanner } from '@/features/budget/budget-planner';

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
      <div className="text-center sm:text-left">
        <h1 className="text-foreground text-2xl font-extrabold tracking-tight sm:text-3xl">
          Budget Planner & Tracking
        </h1>
        <p className="text-muted mt-1 text-sm">
          Strict integer-normalized budget allocations across {plan.currency} minor units. Edit
          proportions, track actual spending, and convert currencies live with zero hardcoded
          percentages.
        </p>
      </div>

      <BudgetPlanner plan={plan} onPlanUpdate={updatePlan} />
    </div>
  );
}
