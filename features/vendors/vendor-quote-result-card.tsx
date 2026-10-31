'use client';

import { useState } from 'react';
import type { QuoteExtractResponse } from '@/lib/schemas/api-schemas';

interface VendorQuoteResultCardProps {
  readonly result: QuoteExtractResponse;
  readonly category: string;
  readonly onSaveToPlan: () => void;
}

export function VendorQuoteResultCard({
  result,
  category,
  onSaveToPlan,
}: VendorQuoteResultCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(result.inquiryDraft);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border-border bg-surface-elevated/40 space-y-3 rounded-xl border p-4 text-xs">
      <div className="flex items-center justify-between border-b pb-2">
        <span className="text-foreground font-bold">
          {result.vendorName || `${category} Supplier`}
        </span>
        <span className="text-muted">{result.effectiveCostVsBudget}</span>
      </div>

      {result.flags.length > 0 && (
        <div className="space-y-1">
          <span className="font-semibold text-amber-500">Notice & Flags:</span>
          <div className="flex flex-wrap gap-1.5">
            {result.flags.map((flag, idx) => (
              <span
                key={idx}
                className="rounded bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-600 dark:text-amber-400"
              >
                ⚠️ {flag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-foreground font-semibold">Inquiry Follow-up Draft:</span>
          <button
            type="button"
            onClick={handleCopy}
            className="text-primary hover:text-primary/80 font-medium"
          >
            {copied ? 'Copied!' : 'Copy Draft'}
          </button>
        </div>
        <div className="border-border bg-surface text-muted rounded-lg border p-2.5 italic">
          {result.inquiryDraft}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="button"
          id="save-verified-quote-btn"
          onClick={onSaveToPlan}
          className="bg-primary text-primary-fg rounded-lg px-4 py-2 font-semibold hover:opacity-90"
        >
          Save as Verified Vendor in Checklist
        </button>
      </div>
    </div>
  );
}
