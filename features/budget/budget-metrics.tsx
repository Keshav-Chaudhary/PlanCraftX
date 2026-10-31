import type { EventPlan } from '@/lib/schemas/event-plan';
import { formatMinorUnits } from '@/lib/domain/budget-math';

interface BudgetMetricsProps {
  readonly plan: EventPlan;
  readonly totalAllocatedMinor: number;
  readonly totalSpentMinor: number;
  readonly remainingMinor: number;
}

export function BudgetMetrics({
  plan,
  totalAllocatedMinor,
  totalSpentMinor,
  remainingMinor,
}: BudgetMetricsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
      <div className="border-border bg-surface rounded-2xl border p-5 shadow-xs">
        <span className="text-muted text-[11px] font-bold tracking-wider uppercase">
          Total Budget
        </span>
        <p className="text-foreground mt-1 font-mono text-2xl font-bold">
          {formatMinorUnits(plan.totalBudgetMinor, plan.currency)} {plan.currency}
        </p>
      </div>

      <div className="border-border bg-surface rounded-2xl border p-5 shadow-xs">
        <span className="text-muted text-[11px] font-bold tracking-wider uppercase">
          Allocated Sum
        </span>
        <p className="text-primary mt-1 font-mono text-2xl font-bold">
          {formatMinorUnits(totalAllocatedMinor, plan.currency)} {plan.currency}
        </p>
      </div>

      <div className="border-border bg-surface rounded-2xl border p-5 shadow-xs">
        <span className="text-muted text-[11px] font-bold tracking-wider uppercase">
          Total Spent
        </span>
        <p className="text-muted-fg mt-1 font-mono text-2xl font-bold">
          {formatMinorUnits(totalSpentMinor, plan.currency)} {plan.currency}
        </p>
      </div>

      <div className="border-border bg-surface rounded-2xl border p-5 shadow-xs">
        <span className="text-muted text-[11px] font-bold tracking-wider uppercase">
          Remaining Reserve
        </span>
        <p className="text-foreground mt-1 font-mono text-2xl font-bold">
          {formatMinorUnits(remainingMinor, plan.currency)} {plan.currency}
        </p>
      </div>
    </div>
  );
}
