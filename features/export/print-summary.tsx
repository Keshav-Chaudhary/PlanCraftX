'use client';

import type { EventPlan } from '@/lib/schemas/event-plan';
import { formatMinorUnits } from '@/lib/domain/budget-math';

interface PrintSummaryProps {
  readonly plan: EventPlan;
}

export function PrintSummary({ plan }: PrintSummaryProps) {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const totalMajor = formatMinorUnits(plan.totalBudgetMinor, plan.currency);

  return (
    <div className="border-border/80 bg-surface/40 my-6 rounded-xl border p-5 shadow-sm print:border-none print:p-0 print:shadow-none">
      <div className="border-border/50 mb-4 flex flex-wrap items-center justify-between gap-3 border-b pb-3 print:hidden">
        <div>
          <h3 className="text-foreground flex items-center gap-2 text-base font-semibold">
            <span>🖨️</span> Executive Printable Summary
          </h3>
          <p className="text-muted text-xs">
            Clean 1-page summary for family members, coordinators, and vendors.
          </p>
        </div>
        <button
          type="button"
          onClick={handlePrint}
          className="bg-accent text-accent-foreground hover:bg-accent/90 focus-visible:ring-accent rounded-lg px-4 py-2 text-xs font-semibold shadow transition focus-visible:ring-2 focus-visible:outline-none"
        >
          Print Summary / PDF
        </button>
      </div>

      <article className="bg-surface border-border/40 text-foreground space-y-4 rounded-lg border p-4 print:border-none print:p-0">
        <header className="border-border/60 border-b pb-3">
          <div className="text-muted text-xs font-semibold tracking-wider uppercase">
            {plan.eventType} Plan Summary
          </div>
          <h2 className="text-foreground mt-0.5 text-xl font-bold">{plan.title}</h2>
          <div className="text-muted mt-2 flex flex-wrap gap-4 text-xs">
            <span>📅 {plan.eventDate}</span>
            <span>📍 {plan.location}</span>
            <span>👥 {plan.guestCount} Guests</span>
            <span>
              💰 {totalMajor} {plan.currency}
            </span>
          </div>
        </header>

        <section aria-label="Budget Overview" className="space-y-2">
          <h4 className="text-foreground text-xs font-bold tracking-wider uppercase">
            Budget Distribution
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
            {plan.budgetItems.slice(0, 6).map((item) => (
              <div key={item.id} className="border-border/40 bg-surface/50 rounded border p-2">
                <div className="text-muted truncate">{item.category}</div>
                <div className="font-mono font-semibold">
                  {formatMinorUnits(item.allocatedMinor, plan.currency)} {plan.currency}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section aria-label="Milestones Overview" className="space-y-2">
          <h4 className="text-foreground text-xs font-bold tracking-wider uppercase">
            Upcoming Milestones
          </h4>
          <ul className="divide-border/30 border-border/40 divide-y rounded border text-xs">
            {plan.timelineItems.slice(0, 5).map((item) => (
              <li key={item.id} className="flex items-center justify-between p-2">
                <span className="text-foreground font-medium">{item.title}</span>
                <span className="text-muted font-mono">{item.dueDate}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-label="Vendor Overview" className="space-y-2">
          <h4 className="text-foreground text-xs font-bold tracking-wider uppercase">
            Key Vendors
          </h4>
          <div className="grid grid-cols-1 gap-2 text-xs md:grid-cols-3">
            {plan.vendorItems.slice(0, 6).map((item) => (
              <div key={item.id} className="border-border/40 bg-surface/50 rounded border p-2">
                <div className="font-semibold">{item.name}</div>
                <div className="text-muted capitalize">
                  {item.category} · {item.status.replace('_', ' ')}
                </div>
              </div>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
}
