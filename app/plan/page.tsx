'use client';

import React from 'react';
import Link from 'next/link';
import { Download, Plus } from 'lucide-react';
import { usePlan, PlanEmptyState } from '@/features/plan-context';
import { OverviewSnapshotCard } from '@/features/overview/overview-snapshot-card';
import { OverviewMetricsGrid } from '@/features/overview/overview-metrics-grid';
import { OverviewInsightsCard } from '@/features/overview/overview-insights-card';
import { PlanReadinessBar } from '@/features/overview/plan-readiness-bar';
import { Badge } from '@/features/ui/badge';

export default function PlanOverviewPage() {
  const { plan } = usePlan();

  if (!plan) {
    return (
      <PlanEmptyState
        title="Welcome to PlanCraftX Workspace"
        description="No active event plan found. Choose an event type to start organizing integer-normalized budgets, reverse-planned timelines, and vendor checklists."
        actionLabel="Create Your First Event"
        actionHref="/plan/event"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header: Easy-to-understand Page Overview matching ClauseIQX */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-fg text-2xl font-black tracking-tight sm:text-3xl">
              Celebration Health & Summary
            </h1>
            <Badge tone="positive" className="text-[10px] font-bold tracking-wider uppercase">
              Ready for Review
            </Badge>
          </div>
          <p className="text-fg-muted mt-1 text-xs sm:text-sm">
            An executive breakdown of integer-normalized budget allocations, reverse milestones, and
            grounded telemetry.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex shrink-0 flex-wrap items-center gap-2.5">
          <Link
            href="/plan/export"
            className="text-fg-muted hover:text-fg bg-surface hover:bg-surface-2 inline-flex h-8 items-center gap-1.5 rounded-xl border border-[var(--border)] px-3 text-xs font-bold transition-all"
          >
            <Download className="size-3.5" />
            <span>Export Summary</span>
          </Link>
          <Link
            href="/plan/event"
            className="bg-accent text-accent-fg hover:bg-accent-strong inline-flex h-8 items-center gap-1.5 rounded-xl px-3 text-xs font-bold shadow-xs transition-all"
          >
            <Plus className="size-3.5" />
            <span>Edit Event</span>
          </Link>
          <div className="border-accent-line bg-accent-subtle text-accent hidden items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold shadow-xs sm:inline-flex">
            <span className="bg-accent size-2 animate-pulse rounded-full" />
            <span>100% Checked Against Public APIs</span>
          </div>
        </div>
      </div>

      <OverviewSnapshotCard plan={plan} />
      <PlanReadinessBar plan={plan} />
      <OverviewInsightsCard plan={plan} />
      <OverviewMetricsGrid plan={plan} />
    </div>
  );
}
