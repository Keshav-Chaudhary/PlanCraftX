'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Compass,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import type { EventPlan } from '@/lib/schemas/event-plan';
import { generatePlanFindings, type PlanFinding } from '@/lib/domain/insights';
import { planReviewResponseSchema, type PlanReviewResponse } from '@/lib/schemas/api-schemas';
import { Badge } from '@/features/ui/badge';

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
          <Badge tone="critical" className="text-[10px] font-bold tracking-wider uppercase">
            <AlertCircle className="size-3" /> Urgent
          </Badge>
        );
      case 'warning':
        return (
          <Badge tone="caution" className="text-[10px] font-bold tracking-wider uppercase">
            <AlertTriangle className="size-3" /> Needs Attention
          </Badge>
        );
      case 'suggestion':
        return (
          <Badge tone="accent" className="text-[10px] font-bold tracking-wider uppercase">
            <CheckCircle2 className="size-3" /> Suggestion
          </Badge>
        );
    }
  };

  return (
    <div className="bg-surface-2/80 rounded-2xl border border-[var(--border)] p-6 shadow-[var(--shadow-sm)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div className="flex items-center gap-3">
          <span className="bg-surface-3 text-accent flex size-9 items-center justify-center rounded-xl border border-[var(--border)] shadow-inner">
            <Compass className="size-5" />
          </span>
          <div>
            <h3 className="text-fg text-base font-bold tracking-tight">
              Plan Health & Priority Action Items
            </h3>
            <p className="text-fg-muted text-xs leading-relaxed">
              Deterministic ranking of what needs your immediate attention across budget, timeline,
              and vendors.
            </p>
          </div>
        </div>

        <button
          type="button"
          id="ai-plan-review-btn"
          disabled={loadingAi}
          onClick={handleReviewWithAi}
          className="bg-surface-3 text-fg hover:text-accent flex cursor-pointer items-center gap-1.5 rounded-full border border-[var(--border-strong)] px-4 py-2 text-xs font-bold shadow-xs transition-all hover:border-[var(--accent-line)] disabled:opacity-50"
        >
          <Sparkles className="text-accent size-3.5" />
          <span>{loadingAi ? 'AI Generating Review...' : 'Ask AI for Plan Review'}</span>
        </button>
      </div>

      {errorMsg && (
        <p className="text-critical mt-3 text-xs font-semibold" role="alert">
          {errorMsg}
        </p>
      )}

      {aiReview && (
        <div className="border-accent-line bg-accent-subtle/30 mt-4 space-y-2 rounded-2xl border p-4 text-xs">
          <p className="text-fg leading-relaxed font-semibold italic">{aiReview.summary}</p>
          <div className="mt-3 space-y-1.5">
            <span className="text-fg text-[10px] font-bold tracking-wider uppercase">
              Prioritized Next Steps:
            </span>
            <ul className="text-fg-muted list-disc space-y-1 pl-5">
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
            className="bg-surface-3/50 hover:bg-surface-3 flex flex-col justify-between gap-3 rounded-xl border border-[var(--border)] p-4 transition-all sm:flex-row sm:items-center"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {getPriorityBadge(finding.priority)}
                <strong className="text-fg text-sm font-bold">{finding.title}</strong>
              </div>
              <p className="text-fg-muted text-xs leading-relaxed">{finding.details}</p>
            </div>

            <div className="shrink-0">
              <Link
                href={`/plan/${finding.targetTab}`}
                className="group/btn bg-surface text-fg hover:bg-surface-2 hover:text-accent inline-flex cursor-pointer items-center gap-1 rounded-full border border-[var(--border-strong)] px-3.5 py-1.5 text-xs font-bold transition-all hover:border-[var(--accent-line)]"
              >
                <span>{finding.actionLabel}</span>
                <ArrowRight className="size-3 transition-transform group-hover/btn:translate-x-0.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
