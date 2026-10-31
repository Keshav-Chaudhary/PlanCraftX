'use client';

import { usePlan, PlanEmptyState } from '@/features/plan-context';
import { VendorChecklist } from '@/features/vendors/vendor-checklist';

export default function VendorsPage() {
  const { plan, updatePlan } = usePlan();

  if (!plan) {
    return (
      <PlanEmptyState
        title="No Active Vendor Checklist"
        description="Please configure an event first to generate event-specific vendor categories and discover live nearby OpenStreetMap places."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <h1 className="text-foreground text-2xl font-extrabold tracking-tight sm:text-3xl">
          Vendor Checklist & Nearby Places
        </h1>
        <p className="text-muted mt-1 text-sm">
          Track vendor statuses, quotes, and contract reminders for {plan.location}. Search real
          nearby suppliers via OpenStreetMap with strict zero synthetic data.
        </p>
      </div>

      <VendorChecklist plan={plan} onPlanUpdate={updatePlan} />
    </div>
  );
}
