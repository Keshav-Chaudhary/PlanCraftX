'use client';

import { usePlan, PlanEmptyState } from '@/features/plan-context';
import { VendorChecklist } from '@/features/vendors/vendor-checklist';
import { PageHeader, Badge } from '@/features/ui';

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
      <PageHeader
        title="Vendor Checklist & Nearby Places"
        description={`Track vendor statuses, quotes, and contract reminders for ${plan.location}. Search real nearby suppliers via OpenStreetMap with strict zero synthetic data.`}
        badge={<Badge variant="default">OSM Overpass</Badge>}
      />

      <VendorChecklist plan={plan} onPlanUpdate={updatePlan} />
    </div>
  );
}
