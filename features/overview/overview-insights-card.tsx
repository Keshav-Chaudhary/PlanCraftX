'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { EventPlan } from '@/lib/schemas/event-plan';
import { generatePlanFindings, type PlanFinding } from '@/lib/domain/insights';
import { planReviewResponseSchema, type PlanReviewResponse } from '@/lib/schemas/api-schemas';

interface OverviewInsightsCardProps {
  readonly plan: EventPlan;
}

export function OverviewInsightsCard({ plan }: OverviewInsightsCardProps) {
  const findings = generatePlanFindings(plan);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiReview, setAiReview] = useState<PlanReviewResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleReviewWithAi = async () => {
    setLoadingAi(true);
    setErrorMsg(null);

    try {
      const payloadFindings = findings.map((f) => ({
        priority: f.priority,
        title: f.title,
        details: f.details,
        recommendedAction: f.actionLabel,
      }));

      const res = await fetch('/api/plan/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ findings: payloadFindings }),
      });

      if (!res.ok) {
        const errData = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(errData.message || 'AI Plan Review service unavailable.');
      }
      const json = await res.json();
      const parseResult = planReviewResponseSchema.safeParse(json);
      if (!parseResult.success) {
        throw new Error('AI Plan Review returned an invalid response format.');
      }
      setAiReview(parseResult.data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Review generation failed.');
    } finally {
      setLoadingAi(false);
    }
  };

  const getPriorityBadge = (priority: PlanFinding['priority']) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="bg-danger/10 text-danger rounded px-2 py-0.5 text-[11px] font-bold uppercase">
            Urgent
          </span>
        );
      case 'warning':
        return (
          <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-600 uppercase dark:text-amber-400">
            Needs Attention
          </span>
        );
      case 'suggestion':
        return (
          <span className="bg-primary/10 text-primary rounded px-2 py-0.5 text-[11px] font-bold uppercase">
            Suggestion
          </span>
        );
    }
  };

  return (
    <div className="border-border bg-surface rounded-xl border p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <div>
          <h3 className="text-foreground text-base font-bold">
            🧭 Plan Health & Priority Action Items
          </h3>
          <p className="text-muted text-xs">
            Deterministic ranking of what needs your immediate attention across budget, timeline,
            and vendors.
          </p>
        </div>

        <button
          type="button"
          id="ai-plan-review-btn"
          disabled={loadingAi}
          onClick={handleReviewWithAi}
          className="border-border bg-surface-elevated text-foreground rounded-lg border px-3 py-1.5 text-xs font-semibold shadow-sm hover:opacity-90 disabled:opacity-50"
        >
          {loadingAi ? 'AI Generating Review...' : '✨ Ask AI for Plan Review'}
        </button>
      </div>

      {errorMsg && (
        <p className="text-danger mt-3 text-xs" role="alert">
          {errorMsg}
        </p>
      )}

      {aiReview && (
        <div className="border-border bg-surface-elevated/50 mt-4 space-y-2 rounded-xl border p-4 text-xs">
          <p className="text-foreground leading-relaxed font-medium italic">{aiReview.summary}</p>
          <div className="mt-2 space-y-1">
            <span className="text-foreground font-semibold">Prioritized Next Steps:</span>
            <ul className="text-muted list-disc space-y-0.5 pl-5">
              {aiReview.actionSteps.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="mt-4 space-y-3">
        {findings.map((finding) => (
          <div
            key={finding.id}
            className="border-border bg-surface-elevated/30 flex flex-col justify-between rounded-lg border p-3.5 sm:flex-row sm:items-center"
          >
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                {getPriorityBadge(finding.priority)}
                <strong className="text-foreground text-sm">{finding.title}</strong>
              </div>
              <p className="text-muted text-xs">{finding.details}</p>
            </div>

            <div className="mt-3 sm:mt-0">
              <Link
                href={`/plan/${finding.targetTab}`}
                className="bg-primary text-primary-fg inline-block rounded-md px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-90"
              >
                {finding.actionLabel} &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
