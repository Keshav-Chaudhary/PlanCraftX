'use client';

import { usePlan, PlanEmptyState } from '@/features/plan-context';
import { ChatAssistant } from '@/features/chat/chat-assistant';
import { PageHeader, Badge } from '@/features/ui';

export default function AssistantPage() {
  const { plan } = usePlan();

  if (!plan) {
    return (
      <PlanEmptyState
        title="No Active Event Plan for Assistant"
        description="Please configure an event first so the AI Planning Assistant can ground its advice in your real budget, timeline, and vendor context."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="GenAI Planning Assistant"
        description={`Interactive planning co-pilot grounded in your ${plan.eventType} parameters. Ask about logistics, budget tradeoffs, or weather contingencies.`}
        badge={<Badge variant="success">Plan Grounded</Badge>}
      />

      <ChatAssistant plan={plan} />
    </div>
  );
}
