'use client';

import type { EventPlan } from '@/lib/schemas/event-plan';

interface PlanReadinessBarProps {
  readonly plan: EventPlan;
}

function calculateReadiness(plan: EventPlan): number {
  let score = 0;

  // 1. Budget integrity (up to 35 points)
  const totalAllocated = plan.budgetItems.reduce((sum, b) => sum + b.allocatedMinor, 0);
  if (plan.totalBudgetMinor > 0 && totalAllocated <= plan.totalBudgetMinor) {
    score += 35;
  } else if (plan.totalBudgetMinor > 0) {
    score += 15;
  }

  // 2. Timeline progression (up to 35 points)
  if (plan.timelineItems.length > 0) {
    const completedOrActive = plan.timelineItems.filter((t) => t.status !== 'pending').length;
    const timelineRatio = completedOrActive / plan.timelineItems.length;
    score += Math.round(timelineRatio * 35);
  }

  // 3. Vendor coverage (up to 30 points)
  if (plan.vendorItems.length > 0) {
    const engagedVendors = plan.vendorItems.filter((v) => v.status !== 'to_contact').length;
    const vendorRatio = engagedVendors / plan.vendorItems.length;
    score += Math.round(vendorRatio * 30);
  }

  return Math.min(100, Math.max(0, score));
}

export function PlanReadinessBar({ plan }: PlanReadinessBarProps) {
  const readiness = calculateReadiness(plan);

  let statusBadge = 'Initial Setup';
  let badgeColor = 'bg-amber-500/10 text-amber-600 border-amber-500/20';

  if (readiness >= 80) {
    statusBadge = 'High Confidence · Ready for Execution';
    badgeColor = 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
  } else if (readiness >= 50) {
    statusBadge = 'In Progress · Key Milestones Pending';
    badgeColor = 'bg-blue-500/10 text-blue-600 border-blue-500/20';
  }

  return (
    <section
      aria-label="Overall Plan Readiness Index"
      className="border-border/70 bg-surface/50 my-5 rounded-xl border p-4 shadow-sm"
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">
            🎯
          </span>
          <h3 className="text-foreground text-sm font-semibold">Plan Readiness Index</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeColor}`}>
            {statusBadge}
          </span>
          <span className="text-foreground font-mono text-sm font-bold">{readiness}/100</span>
        </div>
      </div>

      <div
        role="progressbar"
        aria-label="Plan completion score"
        aria-valuenow={readiness}
        aria-valuemin={0}
        aria-valuemax={100}
        className="bg-border/40 h-2.5 w-full overflow-hidden rounded-full"
      >
        <div
          style={{ width: `${readiness}%` }}
          className="bg-accent h-full rounded-full transition-all duration-500"
        />
      </div>

      <div className="text-muted mt-3 flex items-center justify-between text-[11px]">
        <span>Budget Aligned: {plan.totalBudgetMinor > 0 ? '✓' : '—'}</span>
        <span>Milestones: {plan.timelineItems.length} scheduled</span>
        <span>Vendors: {plan.vendorItems.length} tracked</span>
      </div>
    </section>
  );
}
