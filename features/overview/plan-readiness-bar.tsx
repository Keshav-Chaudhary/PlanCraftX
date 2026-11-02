'use client';

import type { EventPlan } from '@/lib/schemas/event-plan';
import { Target, CheckCircle2, Calendar, ClipboardList } from 'lucide-react';
import { ProgressRing } from '@/features/ui/progress-ring';

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
  let badgeTone = 'border-caution/30 bg-caution-subtle text-caution';
  let ringTone: 'positive' | 'accent' | 'caution' = 'caution';

  if (readiness >= 80) {
    statusBadge = 'High Confidence · Ready for Execution';
    badgeTone = 'border-positive/30 bg-positive-subtle text-positive';
    ringTone = 'positive';
  } else if (readiness >= 50) {
    statusBadge = 'In Progress · Key Milestones Pending';
    badgeTone = 'border-accent-line bg-accent-subtle text-accent';
    ringTone = 'accent';
  }

  return (
    <section
      aria-label="Overall Plan Readiness Index"
      className="bg-surface-2/70 my-5 rounded-2xl border border-[var(--border)] p-5 shadow-[var(--shadow-sm)]"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <ProgressRing
            value={readiness}
            size={48}
            strokeWidth={5}
            tone={ringTone}
            ariaLabel="Plan readiness ring gauge"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-surface-3 text-accent flex size-6 items-center justify-center rounded-md border border-[var(--border)]">
                <Target className="size-3.5" />
              </span>
              <h3 className="text-fg text-sm font-bold tracking-tight">Plan Readiness Index</h3>
            </div>
            <p className="text-fg-muted mt-0.5 text-xs">
              Multi-factor health score calculated from budget, milestones, and vendor
              confirmations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <span className={`rounded-full border px-3 py-0.5 text-xs font-bold ${badgeTone}`}>
            {statusBadge}
          </span>
          <span className="text-fg font-mono text-base font-black">{readiness}/100</span>
        </div>
      </div>

      <div
        role="progressbar"
        aria-label="Plan completion score"
        aria-valuenow={readiness}
        aria-valuemin={0}
        aria-valuemax={100}
        className="bg-surface-3 mt-4 h-2 w-full overflow-hidden rounded-full border border-[var(--border-strong)]/40"
      >
        <div
          style={{ width: `${readiness}%` }}
          className="bg-accent h-full rounded-full shadow-[0_0_8px_var(--accent-line)] transition-all duration-700 ease-out"
        />
      </div>

      <div className="text-fg-muted mt-3.5 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="text-positive size-3.5" />
          Budget Aligned: {plan.totalBudgetMinor > 0 ? 'Verified' : 'Pending'}
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar className="text-accent size-3.5" />
          Milestones: {plan.timelineItems.length} scheduled
        </span>
        <span className="flex items-center gap-1.5">
          <ClipboardList className="text-caution size-3.5" />
          Vendors: {plan.vendorItems.length} tracked
        </span>
      </div>
    </section>
  );
}
