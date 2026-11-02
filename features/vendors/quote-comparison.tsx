'use client';

import { useState } from 'react';
import { Scale, Check } from 'lucide-react';
import type { VendorItem } from '@/lib/schemas/event-plan';
import { formatMinorUnits } from '@/lib/domain/budget-math';

interface QuoteComparisonProps {
  readonly vendors: readonly VendorItem[];
  readonly currency: string;
  readonly onAcceptQuote: (vendorId: string) => void;
}

export function QuoteComparison({ vendors, currency, onAcceptQuote }: QuoteComparisonProps) {
  const quotedVendors = vendors.filter(
    (v) => v.status === 'quoted' || v.estimatedCostMinor !== undefined,
  );

  const categories = Array.from(new Set(quotedVendors.map((v) => v.category)));
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0] ?? 'All');
  const [isOpen, setIsOpen] = useState(false);

  if (quotedVendors.length === 0) {
    return null;
  }

  const activeCategory = selectedCategory === 'All' ? (categories[0] ?? '') : selectedCategory;
  const filtered = quotedVendors.filter(
    (v) => selectedCategory === 'All' || v.category === activeCategory,
  );

  return (
    <section
      aria-label="Side-by-Side Quote Comparison"
      className="border-border/70 bg-surface/40 my-6 rounded-xl border p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-foreground flex items-center gap-2 text-base font-semibold">
            <Scale className="text-accent size-4 shrink-0" aria-hidden="true" />
            <span>Side-by-Side Quote Comparison ({quotedVendors.length})</span>
          </h3>
          <p className="text-muted text-xs">
            Compare vendor proposals, unit pricing, and terms side-by-side.
          </p>
        </div>
        <button
          type="button"
          id="toggle-quote-comparison-btn"
          onClick={() => setIsOpen(!isOpen)}
          className="text-primary hover:text-primary/80 text-xs font-semibold underline"
        >
          {isOpen ? 'Collapse Comparison' : 'Compare Saved Quotes'}
        </button>
      </div>

      {isOpen && (
        <div className="border-border/50 mt-4 border-t pt-4">
          {categories.length > 1 && (
            <div className="mb-4 flex items-center gap-1.5 overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                    activeCategory === cat
                      ? 'bg-accent text-accent-foreground shadow-sm'
                      : 'border-border/50 bg-surface text-muted hover:text-foreground border'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((vendor) => {
              const costMajor =
                vendor.estimatedCostMinor !== undefined
                  ? formatMinorUnits(vendor.estimatedCostMinor, currency)
                  : 'Contact for quote';

              return (
                <div
                  key={vendor.id}
                  className="border-border bg-surface hover:border-accent/40 flex flex-col justify-between rounded-xl border p-4 shadow-sm transition"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="bg-accent/10 text-accent rounded-full px-2 py-0.5 text-[11px] font-medium">
                        {vendor.category}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          vendor.status === 'booked'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-amber-500/10 text-amber-600'
                        }`}
                      >
                        {vendor.status === 'booked' ? 'Accepted' : 'Quoted'}
                      </span>
                    </div>

                    <h4 className="text-foreground mt-2 text-base font-bold">{vendor.name}</h4>

                    <div className="border-border/50 bg-surface/70 mt-3 rounded-lg border p-2.5">
                      <div className="text-muted text-xs">Quoted Total</div>
                      <div className="text-foreground font-mono text-lg font-extrabold">
                        {costMajor} {currency}
                      </div>
                    </div>

                    {vendor.notes && (
                      <p className="text-muted mt-3 line-clamp-3 text-xs">{vendor.notes}</p>
                    )}
                  </div>

                  <div className="border-border/40 mt-4 border-t pt-3">
                    {vendor.status !== 'booked' ? (
                      <button
                        type="button"
                        onClick={() => onAcceptQuote(vendor.id)}
                        className="bg-accent/90 text-accent-foreground hover:bg-accent focus-visible:ring-accent w-full rounded-lg px-3 py-1.5 text-xs font-semibold transition focus-visible:ring-2 focus-visible:outline-none"
                      >
                        Accept This Quote
                      </button>
                    ) : (
                      <div className="flex w-full items-center justify-center gap-1.5 py-1 text-xs font-semibold text-emerald-600">
                        <Check className="size-3.5" aria-hidden="true" />
                        <span>Proposal Accepted</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
