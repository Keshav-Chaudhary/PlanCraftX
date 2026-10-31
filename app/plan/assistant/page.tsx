'use client';

import { usePlan, PlanEmptyState } from '@/features/plan-context';
import { ChatAssistant } from '@/features/chat/chat-assistant';

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
      <div className="text-center sm:text-left">
        <h1 className="text-foreground text-2xl font-extrabold tracking-tight sm:text-3xl">
          GenAI Planning Assistant
        </h1>
        <p className="text-muted mt-1 text-sm">
          Interactive planning co-pilot grounded in your {plan.eventType} parameters. Ask about
          logistics, budget tradeoffs, or weather contingencies.
        </p>
      </div>

      <ChatAssistant plan={plan} />
    </div>
  );
}
