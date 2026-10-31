'use client';

export interface BudgetCategoryAllocation {
  readonly id: string;
  readonly name: string;
  readonly allocatedMinor: number;
}

interface AllocationBarProps {
  readonly categories: readonly BudgetCategoryAllocation[];
  readonly totalBudget: number;
}

const CATEGORY_COLORS: readonly string[] = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-violet-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-indigo-500',
  'bg-fuchsia-500',
  'bg-teal-500',
];

export function AllocationBar({ categories, totalBudget }: AllocationBarProps) {
  if (totalBudget <= 0 || categories.length === 0) {
    return null;
  }

  const allocatedTotal = categories.reduce((sum, c) => sum + c.allocatedMinor, 0);
  const unallocatedMinor = Math.max(0, totalBudget - allocatedTotal);
  const isOverBudget = allocatedTotal > totalBudget;

  return (
    <section
      aria-label="Proportional Budget Distribution"
      className="border-border/70 bg-surface/50 my-4 rounded-xl border p-4 shadow-sm"
    >
      <div className="text-muted mb-2 flex items-center justify-between text-xs">
        <span className="text-foreground font-semibold tracking-wider uppercase">
          Visual Allocation Breakdown
        </span>
        <span className="font-mono">{isOverBudget ? 'Over allocated' : 'Fully allocated'}</span>
      </div>

      <div
        role="progressbar"
        aria-label="Proportional budget allocation"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.min(100, Math.round((allocatedTotal / totalBudget) * 100))}
        className="bg-border/40 flex h-5 w-full overflow-hidden rounded-full p-0.5 shadow-inner"
      >
        {categories.map((cat, idx) => {
          const pct = (cat.allocatedMinor / totalBudget) * 100;
          if (pct <= 0) return null;
          const colorClass = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
          return (
            <div
              key={cat.id}
              style={{ width: `${pct}%` }}
              className={`h-full transition-all duration-300 ${colorClass}`}
              title={`${cat.name}: ${pct.toFixed(1)} pct`}
            />
          );
        })}
        {unallocatedMinor > 0 && (
          <div
            style={{ width: `${(unallocatedMinor / totalBudget) * 100}%` }}
            className="bg-border/80 h-full transition-all duration-300"
            title="Unallocated Reserve"
          />
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        {categories.map((cat, idx) => {
          const pct = ((cat.allocatedMinor / totalBudget) * 100).toFixed(1);
          const colorClass = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
          return (
            <div
              key={`legend-${cat.id}`}
              className="bg-surface border-border/40 flex items-center gap-1.5 rounded border px-2 py-0.5"
            >
              <span className={`h-2.5 w-2.5 rounded-full ${colorClass}`} aria-hidden="true" />
              <span className="text-foreground font-medium">{cat.name}</span>
              <span className="text-muted font-mono">{pct}%</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
