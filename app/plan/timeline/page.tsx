'use client';

import { usePlan, PlanEmptyState } from '@/features/plan-context';
import { TimelineView } from '@/features/timeline/timeline-view';
import { PageHeader, Badge } from '@/features/ui';

export default function TimelinePage() {
  const { plan, updatePlan } = usePlan();

  if (!plan) {
    return (
      <PlanEmptyState
        title="No Active Event Timeline"
        description="Please configure an event first to generate reverse-planned milestone dates, holiday clash checks, and calendar exports."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Timeline & Milestones"
        description={`Reverse-planned phase schedule scaled to your event date (${plan.eventDate}), featuring Nager.Date public holiday checks and RFC 5545 calendar export.`}
        badge={<Badge variant="info">RFC 5545 Synced</Badge>}
      />

      <TimelineView plan={plan} onPlanUpdate={updatePlan} />
    </div>
  );
}
