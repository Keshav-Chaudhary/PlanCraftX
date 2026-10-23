import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <section className="space-y-4 text-center">
        <h1 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl">
          GenAI Event Planning Assistant
        </h1>
        <p className="text-muted mx-auto max-w-2xl text-base sm:text-lg">
          Plan unforgettable weddings, milestone birthdays, and impactful community events. Get
          tailored budgets, reverse-planned timelines, vendor checklists, and personalized ideas
          powered by Gemini and live public data.
        </p>
        <div className="pt-2">
          <Link
            href="/plan"
            className="bg-primary text-primary-fg inline-flex items-center justify-center rounded-lg px-6 py-3 text-base font-semibold shadow-sm transition-colors hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2"
            id="start-planning-btn"
          >
            Start Planning Now — No Signup Required
          </Link>
        </div>
      </section>

      <section aria-labelledby="features-heading" className="grid gap-6 pt-6 sm:grid-cols-3">
        <h2 id="features-heading" className="sr-only">
          Supported Event Types
        </h2>

        <article className="border-border bg-surface rounded-xl border p-6 shadow-sm">
          <div className="mb-3 text-2xl" aria-hidden="true">
            💍
          </div>
          <h3 className="text-foreground text-lg font-bold">Weddings</h3>
          <p className="text-muted mt-2 text-sm">
            Ceremony logistics, legal marriage requirements, attire, photography, and cultural
            customs with realistic lead-time scheduling.
          </p>
        </article>

        <article className="border-border bg-surface rounded-xl border p-6 shadow-sm">
          <div className="mb-3 text-2xl" aria-hidden="true">
            🎂
          </div>
          <h3 className="text-foreground text-lg font-bold">Birthdays</h3>
          <p className="text-muted mt-2 text-sm">
            Age-tailored entertainment, games, menu selections, cake planning, and party favors
            scaled to your timeline.
          </p>
        </article>

        <article className="border-border bg-surface rounded-xl border p-6 shadow-sm">
          <div className="mb-3 text-2xl" aria-hidden="true">
            🤝
          </div>
          <h3 className="text-foreground text-lg font-bold">Community Events</h3>
          <p className="text-muted mt-2 text-sm">
            Public permits, venue accessibility, crowd safety, volunteer coordination, municipal
            regulations, and logistics.
          </p>
        </article>
      </section>

      <section
        id="about"
        aria-labelledby="pillars-heading"
        className="border-border bg-surface-elevated rounded-xl border p-6"
      >
        <h2 id="pillars-heading" className="text-foreground text-lg font-bold">
          Core Assistant Capabilities
        </h2>
        <ul className="text-muted mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <li className="flex items-start space-x-2">
            <span className="text-primary font-bold" aria-hidden="true">
              ✓
            </span>
            <span>
              <strong>Integer-Normalized Budgets:</strong> Exact sums with largest-remainder
              rounding across real currency exponents.
            </span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-primary font-bold" aria-hidden="true">
              ✓
            </span>
            <span>
              <strong>Reverse-Planned Timelines:</strong> Scaled to time remaining, holiday clash
              checks, and RFC 5545 ICS calendar export.
            </span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-primary font-bold" aria-hidden="true">
              ✓
            </span>
            <span>
              <strong>Real Nearby Places:</strong> Actual venues and suppliers queried live via
              OpenStreetMap Nominatim/Overpass.
            </span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-primary font-bold" aria-hidden="true">
              ✓
            </span>
            <span>
              <strong>Personalized AI Ideas:</strong> Dietary-respectful menus, themes, and
              activities streamed directly with atomic validation.
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}
