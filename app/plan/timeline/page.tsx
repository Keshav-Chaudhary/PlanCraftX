'use client';

import { usePlan, PlanEmptyState } from '@/features/plan-context';
import { TimelineView } from '@/features/timeline/timeline-view';

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
      <div className="text-center sm:text-left">
        <h1 className="text-foreground text-2xl font-extrabold tracking-tight sm:text-3xl">
          Timeline & Milestones
        </h1>
        <p className="text-muted mt-1 text-sm">
          Reverse-planned phase schedule scaled to your event date ({plan.eventDate}), featuring
          Nager.Date public holiday checks and RFC 5545 calendar export.
        </p>
      </div>

      <TimelineView plan={plan} onPlanUpdate={updatePlan} />
    </div>
  );
}
