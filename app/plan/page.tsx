'use client';

import { usePlan, PlanEmptyState } from '@/features/plan-context';
import { OverviewSnapshotCard } from '@/features/overview/overview-snapshot-card';
import { OverviewMetricsGrid } from '@/features/overview/overview-metrics-grid';
import { OverviewInsightsCard } from '@/features/overview/overview-insights-card';
import { PlanReadinessBar } from '@/features/overview/plan-readiness-bar';

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
      <OverviewSnapshotCard plan={plan} />
      <PlanReadinessBar plan={plan} />
      <OverviewInsightsCard plan={plan} />
      <OverviewMetricsGrid plan={plan} />
    </div>
  );
}
