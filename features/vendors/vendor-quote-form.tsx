'use client';

import type { EventPlan } from '@/lib/schemas/event-plan';
import type { QuoteExtractResponse } from '@/lib/schemas/api-schemas';
import { VendorQuoteResultCard } from './vendor-quote-result-card';

interface VendorQuoteFormProps {
  readonly plan: EventPlan;
  readonly category: string;
  readonly quoteText: string;
  readonly loading: boolean;
  readonly errorMsg: string | null;
  readonly result: QuoteExtractResponse | null;
  readonly onCategoryChange: (cat: string) => void;
  readonly onQuoteTextChange: (text: string) => void;
  readonly onAnalyze: () => void;
  readonly onSaveToPlan: () => void;
}

export function VendorQuoteForm({
  plan,
  category,
  quoteText,
  loading,
  errorMsg,
  result,
  onCategoryChange,
  onQuoteTextChange,
  onAnalyze,
  onSaveToPlan,
}: VendorQuoteFormProps) {
  const isTooShort = quoteText.trim().length < 10;

  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="quote-category" className="text-foreground block text-xs font-medium">
            Category:
          </label>
          <select
            id="quote-category"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="border-border bg-surface text-foreground mt-1 w-full rounded-lg border px-3 py-2 text-xs"
          >
            {plan.budgetItems.map((b) => (
              <option key={b.category} value={b.category}>
                {b.category} (Allocation: {(b.allocatedMinor / 100).toFixed(2)} {plan.currency})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="quote-text-input" className="text-foreground block text-xs font-medium">
          Paste Proposal or WhatsApp Message:
        </label>
        <textarea
          id="quote-text-input"
          rows={4}
          value={quoteText}
          onChange={(e) => onQuoteTextChange(e.target.value)}
          placeholder="e.g. Catering quote: 65 per guest for 100 attendees, advance deposit required on booking, service staff included, taxes extra..."
          className="border-border bg-surface text-foreground mt-1 w-full rounded-lg border p-3 text-xs focus:ring-2"
        />
      </div>

      {errorMsg && (
        <p className="text-danger text-xs" role="alert">
          {errorMsg}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          id="analyze-quote-btn"
          disabled={loading || isTooShort}
          onClick={onAnalyze}
          className="bg-primary text-primary-fg rounded-lg px-4 py-2 text-xs font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'AI Analyzing Quotation...' : 'Analyze Proposal with AI'}
        </button>
      </div>

      {result && (
        <VendorQuoteResultCard result={result} category={category} onSaveToPlan={onSaveToPlan} />
      )}
    </div>
  );
}
