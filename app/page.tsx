import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-12 py-4 sm:py-8">
      {/* Editorial Hero */}
      <section className="space-y-6 text-center">
        <div className="border-border bg-surface text-muted inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-semibold shadow-xs">
          <span className="bg-primary h-2 w-2 rounded-full" aria-hidden="true" />
          <span>GenAI Celebration & Event Planner</span>
        </div>

        <h1 className="text-foreground text-4xl font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
          GenAI Event Planning Assistant
        </h1>

        <p className="text-muted mx-auto max-w-2xl text-base leading-relaxed text-pretty sm:text-lg">
          One connected workspace for weddings, birthdays, and community festivals. Organize
          integer-normalized budgets, reverse-planned timelines, vendor checklists, and personalized
          creative ideas powered by Google Gemini and live public data.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/plan"
            className="bg-primary text-primary-fg focus-visible:ring-primary inline-flex items-center justify-center rounded-xl px-7 py-3.5 text-sm font-semibold shadow-sm transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            id="start-planning-btn"
          >
            Launch Planning Workspace
          </Link>
          <Link
            href="/plan/event"
            className="border-border bg-surface text-foreground hover:bg-surface-elevated focus-visible:ring-primary inline-flex items-center justify-center rounded-xl border px-6 py-3.5 text-sm font-semibold shadow-xs transition focus-visible:ring-2 focus-visible:outline-none"
            id="create-event-direct-btn"
          >
            Create New Event Directly
          </Link>
        </div>
      </section>

      {/* Three Differentiated Event Taxonomies */}
      <section aria-labelledby="occasions-heading" className="space-y-4">
        <div className="text-center">
          <h2
            id="occasions-heading"
            className="text-muted text-xs font-bold tracking-widest uppercase"
          >
            Three Thoughtfully Differentiated Occasions
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <article className="border-border bg-surface hover:border-primary/40 flex flex-col justify-between rounded-2xl border p-6 shadow-xs transition">
            <div>
              <div
                className="bg-primary/10 mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl text-xl"
                aria-hidden="true"
              >
                💍
              </div>
              <h3 className="text-foreground text-lg font-bold">Weddings</h3>
              <p className="text-muted mt-2 text-xs leading-relaxed">
                Ceremony coordination, legal registrations, attire, photography, and cultural
                customs with realistic six-month reverse-planned lead times.
              </p>
            </div>
            <div className="border-border/40 text-muted mt-6 border-t pt-3 text-[11px] font-medium">
              Includes catering per-plate math and vendor quotation analyzer.
            </div>
          </article>

          <article className="border-border bg-surface hover:border-primary/40 flex flex-col justify-between rounded-2xl border p-6 shadow-xs transition">
            <div>
              <div
                className="bg-accent/10 mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl text-xl"
                aria-hidden="true"
              >
                🎂
              </div>
              <h3 className="text-foreground text-lg font-bold">Birthdays</h3>
              <p className="text-muted mt-2 text-xs leading-relaxed">
                Milestone celebrations and kids parties with age-appropriate games, custom cakes,
                themed return gifts, and entertainment staging.
              </p>
            </div>
            <div className="border-border/40 text-muted mt-6 border-t pt-3 text-[11px] font-medium">
              Includes interactive game timeline and custom cake due dates.
            </div>
          </article>

          <article className="border-border bg-surface hover:border-primary/40 flex flex-col justify-between rounded-2xl border p-6 shadow-xs transition">
            <div>
              <div
                className="bg-info/10 mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl text-xl"
                aria-hidden="true"
              >
                🤝
              </div>
              <h3 className="text-foreground text-lg font-bold">Community Events</h3>
              <p className="text-muted mt-2 text-xs leading-relaxed">
                Neighborhood festivals, cultural fairs, and charity drives with municipal permits,
                volunteer staffing, public safety, and logistics.
              </p>
            </div>
            <div className="border-border/40 text-muted mt-6 border-t pt-3 text-[11px] font-medium">
              Includes crowd safety checks and volunteer schedule run-sheets.
            </div>
          </article>
        </div>
      </section>

      {/* Four Core Outcomes Grid */}
      <section
        id="about"
        aria-labelledby="outcomes-heading"
        className="border-border bg-surface-elevated/70 rounded-2xl border p-6 sm:p-8"
      >
        <div className="mb-6">
          <h2 id="outcomes-heading" className="text-foreground text-xl font-bold tracking-tight">
            Core Assistant Outcomes
          </h2>
          <p className="text-muted mt-1 text-xs">
            Engineered to serve the PromptWar Challenge 5 requirements with verifiable precision.
          </p>
        </div>

        <ul className="grid gap-4 text-xs sm:grid-cols-2">
          <li className="border-border/50 bg-surface flex items-start gap-3 rounded-xl border p-4">
            <span className="text-primary font-bold" aria-hidden="true">
              ✓
            </span>
            <div>
              <strong className="text-foreground text-sm font-semibold">
                Integer-Normalized Budgets
              </strong>
              <p className="text-muted mt-1 leading-relaxed">
                Hamilton-Hare largest-remainder allocations guarantee exact penny-accurate sums
                across worldwide currency decimal exponents.
              </p>
            </div>
          </li>
          <li className="border-border/50 bg-surface flex items-start gap-3 rounded-xl border p-4">
            <span className="text-primary font-bold" aria-hidden="true">
              ✓
            </span>
            <div>
              <strong className="text-foreground text-sm font-semibold">
                Reverse-Planned Timelines
              </strong>
              <p className="text-muted mt-1 leading-relaxed">
                Dynamic lead times scaled to event runway, Nager.Date holiday clash alerts,
                operational day run-sheets, and RFC 5545 ICS export.
              </p>
            </div>
          </li>
          <li className="border-border/50 bg-surface flex items-start gap-3 rounded-xl border p-4">
            <span className="text-primary font-bold" aria-hidden="true">
              ✓
            </span>
            <div>
              <strong className="text-foreground text-sm font-semibold">
                Live Vendor Checklists & Proposals
              </strong>
              <p className="text-muted mt-1 leading-relaxed">
                Raw quote extractor flagging missing clauses, side-by-side comparison matrix, and
                live OpenStreetMap Nominatim discovery.
              </p>
            </div>
          </li>
          <li className="border-border/50 bg-surface flex items-start gap-3 rounded-xl border p-4">
            <span className="text-primary font-bold" aria-hidden="true">
              ✓
            </span>
            <div>
              <strong className="text-foreground text-sm font-semibold">
                Personalized AI Ideation Studio
              </strong>
              <p className="text-muted mt-1 leading-relaxed">
                Streaming NDJSON ideas respecting cultural traditions, dietary needs, and
                accessibility accommodations.
              </p>
            </div>
          </li>
        </ul>
      </section>
    </div>
  );
}
