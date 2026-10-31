'use client';

import { usePlan, PlanEmptyState } from '@/features/plan-context';
import { IdeasStream } from '@/features/ideas/ideas-stream';
import { PageHeader, Badge } from '@/features/ui';

export default function IdeasPage() {
  const { plan, updatePlan } = usePlan();

  if (!plan) {
    return (
      <PlanEmptyState
        title="No Active Event Plan for Ideas"
        description="Please configure an event first so Gemini can tailor personalized themes, menus, and activities to your event type, budget, and dietary constraints."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Personalized Event Ideas"
        description={`Stream dynamic, structured suggestions for themes, dietary-conscious menus, and inclusive activities tailored to your ${plan.eventType} plan.`}
        badge={<Badge variant="warning">Gemini Multi-Model</Badge>}
      />

      <IdeasStream plan={plan} onPlanUpdate={updatePlan} />
    </div>
  );
}
