'use client';

import { useRouter } from 'next/navigation';
import { usePlan } from '@/features/plan-context';
import { EventWizard } from '@/features/wizard/event-wizard';
import type { EventPlan } from '@/lib/schemas/event-plan';

export default function EventWizardPage() {
  const router = useRouter();
  const { plan, updatePlan } = usePlan();

  const handlePlanCreated = (newPlan: EventPlan) => {
    updatePlan(newPlan);
    router.push('/plan');
  };

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <h1 className="text-foreground text-2xl font-extrabold tracking-tight sm:text-3xl">
          {plan ? 'Reconfigure Event Plan' : 'Event Planning Setup Wizard'}
        </h1>
        <p className="text-muted mt-1 text-sm">
          Define event parameters to generate tailored integer-normalized budgets, reverse-planned
          timelines, and vendor checklists.
        </p>
      </div>

      <EventWizard onPlanCreated={handlePlanCreated} isInitialSetup={!plan} />
    </div>
  );
}
