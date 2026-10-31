'use client';

import { useState } from 'react';
import type { EventPlan, VendorItem } from '@/lib/schemas/event-plan';
import type { QuoteExtractResponse } from '@/lib/schemas/api-schemas';
import { VendorQuoteForm } from './vendor-quote-form';

interface VendorQuoteAnalyzerProps {
  readonly plan: EventPlan;
  readonly onSaveQuoteVendor: (vendor: VendorItem) => void;
}

function createQuotedVendor(
  result: QuoteExtractResponse,
  category: string,
  currency: string,
): VendorItem {
  return {
    id: `vendor-verified-${Date.now()}`,
    category,
    name: result.vendorName || `${category} Quotation`,
    status: 'quoted',
    estimatedCostMinor: result.totalPriceMinor || undefined,
    contactInfo: `Quoted: ${result.totalPriceMinor ? `${(result.totalPriceMinor / 100).toFixed(2)} ${currency}` : 'Rate per agreement'}`,
    notes: `Advance: ${result.advancePercent ?? 0} pct. Cancellation: ${result.cancellationPolicy ?? 'Unstated'}. Tax: ${result.taxIncluded ? 'Included' : 'Extra'}.`,
    isEstimate: false,
  };
}

async function executeQuoteExtraction(
  quoteText: string,
  category: string,
  categoryBudgetMinor: number,
): Promise<QuoteExtractResponse> {
  const res = await fetch('/api/plan/quote-extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quoteText, category, categoryBudgetMinor }),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message || 'Failed to extract vendor proposal.');
  }

  return (await res.json()) as QuoteExtractResponse;
}

export function VendorQuoteAnalyzer({ plan, onSaveQuoteVendor }: VendorQuoteAnalyzerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const defaultCategory = plan.budgetItems[0] ? plan.budgetItems[0].category : 'Catering';
  const [category, setCategory] = useState(defaultCategory);
  const [quoteText, setQuoteText] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<QuoteExtractResponse | null>(null);

  const budgetItem = plan.budgetItems.find((b) => b.category === category);
  const categoryBudgetMinor = budgetItem ? budgetItem.allocatedMinor : 0;

  const handleAnalyze = async () => {
    if (!quoteText.trim() || quoteText.length < 10) return;
    setLoading(true);
    setErrorMsg(null);
    setResult(null);

    try {
      const data = await executeQuoteExtraction(quoteText, category, categoryBudgetMinor);
      setResult(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToPlan = () => {
    if (!result) return;
    const vendor = createQuotedVendor(result, category, plan.currency);
    onSaveQuoteVendor(vendor);
    setQuoteText('');
    setResult(null);
    setIsOpen(false);
  };

  return (
    <div className="border-border bg-surface rounded-xl border p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-foreground text-base font-bold">
            🧾 Paste Vendor Proposal / Quotation
          </h3>
          <p className="text-muted text-xs">
            Paste raw quotes from emails or messages. AI extracts price, deposit, missing clauses,
            and draft follow-ups.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          id="toggle-quote-analyzer-btn"
          className="text-primary hover:text-primary/80 text-xs font-semibold underline"
        >
          {isOpen ? 'Close Proposal Analyzer' : 'Open Proposal Analyzer'}
        </button>
      </div>

      {isOpen && (
        <VendorQuoteForm
          plan={plan}
          category={category}
          quoteText={quoteText}
          loading={loading}
          errorMsg={errorMsg}
          result={result}
          onCategoryChange={setCategory}
          onQuoteTextChange={setQuoteText}
          onAnalyze={handleAnalyze}
          onSaveToPlan={handleSaveToPlan}
        />
      )}
    </div>
  );
}
