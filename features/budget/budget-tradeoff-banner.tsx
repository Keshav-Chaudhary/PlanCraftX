'use client';

import { useState } from 'react';
import { AlertTriangle, Lightbulb, Check, X } from 'lucide-react';
import type { EventPlan } from '@/lib/schemas/event-plan';
import {
  generateOverBudgetTradeoffs,
  applyTradeoffOption,
  type TradeoffOption,
} from '@/lib/domain/tradeoffs';
import { formatMinorUnits } from '@/lib/domain/budget-math';
import {
  explainTradeoffsResponseSchema,
  type ExplainTradeoffsResponse,
} from '@/lib/schemas/api-schemas';

interface BudgetTradeoffBannerProps {
  readonly plan: EventPlan;
  readonly onPlanUpdate: (updatedPlan: EventPlan) => void;
}

export function BudgetTradeoffBanner({ plan, onPlanUpdate }: BudgetTradeoffBannerProps) {
  const options = generateOverBudgetTradeoffs(plan);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<ExplainTradeoffsResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (options.length === 0) return null;

  const totalAllocated = plan.budgetItems.reduce((acc, it) => acc + it.allocatedMinor, 0);
  const overAmount = totalAllocated - plan.totalBudgetMinor;

  const handleExplainWithAi = async () => {
    setLoadingAi(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/plan/explain-tradeoffs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planTitle: plan.title,
          currency: plan.currency,
          totalBudgetMinor: plan.totalBudgetMinor,
          allocatedMinor: totalAllocated,
          overAmountMinor: overAmount,
          options,
        }),
      });

      if (!res.ok) {
        const errData = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(errData.message || 'AI Tradeoff Explainer service unavailable.');
      }
      const json = await res.json();
      const parseResult = explainTradeoffsResponseSchema.safeParse(json);
      if (!parseResult.success) {
        throw new Error('AI Tradeoff Explainer returned an invalid response format.');
      }
      setAiExplanation(parseResult.data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to generate explanation.');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleApply = (option: TradeoffOption) => {
    const updated = applyTradeoffOption(plan, option.id);
    onPlanUpdate(updated);
  };

  return (
    <div
      role="region"
      aria-label="Over-Budget Recovery Options"
      className="border-danger/30 bg-danger/5 rounded-xl border p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-danger flex items-center space-x-2 text-base font-bold">
            <AlertTriangle className="size-5 shrink-0" aria-hidden="true" />
            <span>
              Over Budget by {formatMinorUnits(overAmount, plan.currency)} {plan.currency}
            </span>
          </h3>
          <p className="text-muted text-xs">
            Deterministic options calculated to bring spending back within your cap.
          </p>
        </div>

        <button
          type="button"
          id="explain-tradeoffs-btn"
          disabled={loadingAi}
          onClick={handleExplainWithAi}
          className="border-border bg-surface text-foreground hover:bg-surface-elevated inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold shadow-sm disabled:opacity-50"
        >
          <Lightbulb className="size-3.5 shrink-0" aria-hidden="true" />
          <span>{loadingAi ? 'AI Explaining Tradeoffs...' : 'Explain Tradeoffs with AI'}</span>
        </button>
      </div>

      {errorMsg && (
        <p className="text-danger mt-2 text-xs" role="alert">
          {errorMsg}
        </p>
      )}

      {aiExplanation && (
        <div className="border-border bg-surface text-foreground mt-4 space-y-3 rounded-lg border p-4 text-xs">
          <p className="font-medium italic">{aiExplanation.summary}</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {aiExplanation.explanations.map((exp) => (
              <div
                key={exp.optionId}
                className="border-border bg-surface-elevated/50 rounded border p-2.5"
              >
                <p className="font-semibold">{exp.plainTextExplanation}</p>
                <p className="mt-1 flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <Check className="size-3 shrink-0" aria-hidden="true" />
                  <span>{exp.pros}</span>
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-rose-600 dark:text-rose-400">
                  <X className="size-3 shrink-0" aria-hidden="true" />
                  <span>{exp.cons}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {options.map((opt) => (
          <div
            key={opt.id}
            className="border-border bg-surface flex flex-col justify-between rounded-lg border p-3.5 text-xs shadow-xs"
          >
            <div className="space-y-1">
              <strong className="text-foreground block font-bold">{opt.title}</strong>
              <p className="text-muted leading-relaxed">{opt.description}</p>
            </div>

            <button
              type="button"
              id={`apply-tradeoff-${opt.id}-btn`}
              onClick={() => handleApply(opt)}
              className="bg-primary text-primary-fg mt-3 rounded-md px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-90"
            >
              Apply This Option
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
