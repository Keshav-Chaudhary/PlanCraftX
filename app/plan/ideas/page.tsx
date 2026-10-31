'use client';

import { usePlan, PlanEmptyState } from '@/features/plan-context';
import { IdeasStream } from '@/features/ideas/ideas-stream';

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
      <div className="text-center sm:text-left">
        <h1 className="text-foreground text-2xl font-extrabold tracking-tight sm:text-3xl">
          Personalized Event Ideas
        </h1>
        <p className="text-muted mt-1 text-sm">
          Stream dynamic, structured suggestions for themes, dietary-conscious menus, and inclusive
          activities tailored to your {plan.eventType} plan.
        </p>
      </div>

      <IdeasStream plan={plan} onPlanUpdate={updatePlan} />
    </div>
  );
}
