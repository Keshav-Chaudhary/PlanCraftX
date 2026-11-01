'use client';

import React from 'react';
import { Heart, Cake, Users, DollarSign, Calendar, FileText, Lightbulb } from 'lucide-react';
import { Badge } from '@/features/ui/badge';
import { ScrollReveal } from '@/features/ui/scroll-reveal';

export function FeatureSection() {
  return (
    <>
      {/* ── Three Thoughtfully Differentiated Occasions (Bento) ── */}
      <section
        aria-labelledby="occasions-heading"
        className="mx-auto max-w-7xl overflow-hidden px-4 py-20 sm:px-6 lg:px-8"
      >
        <ScrollReveal animation="custom-fade-in" className="mx-auto mb-14 max-w-3xl text-center">
          <div className="mb-3 text-xs font-black tracking-[0.2em] text-[var(--accent)] uppercase">
            Taxonomy & Custom Lead Times
          </div>
          <h2
            id="occasions-heading"
            className="text-fg text-3xl font-black tracking-tight sm:text-5xl"
          >
            Three Thoughtfully Differentiated Occasions
          </h2>
          <p className="text-fg-muted mt-4 text-base leading-relaxed sm:text-lg">
            Every celebration category follows distinct operational workflows, regulatory
            compliance, budget categories, and reverse planning cadences.
          </p>
        </ScrollReveal>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Weddings Card */}
          <ScrollReveal
            delayMs={100}
            className="group bg-surface-2 relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[var(--border-faint)] p-8 shadow-[var(--shadow-sm)] transition-all hover:border-[var(--accent-line)] hover:shadow-[var(--shadow-md)]"
          >
            <div
              aria-hidden="true"
              className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-[var(--accent-subtle)] blur-[70px] transition-all group-hover:scale-150"
            />
            <div>
              <span className="bg-surface-3 text-accent relative mb-6 flex size-12 items-center justify-center rounded-2xl border border-[var(--border)] shadow-inner">
                <Heart className="size-6" />
              </span>
              <div className="text-accent mb-2 text-xs font-bold tracking-wider uppercase">
                Occasion 01
              </div>
              <h3 className="text-fg text-2xl font-bold">Weddings</h3>
              <p className="text-fg-muted mt-3 text-sm leading-relaxed">
                Ceremony coordination, legal registrations, bridal attire, multi-angle photography,
                and cultural customs with realistic six-month reverse-planned lead times.
              </p>
            </div>
            <div className="text-fg-subtle mt-8 flex items-center justify-between border-t border-[var(--border-strong)]/60 pt-4 text-xs font-semibold">
              <span>Per-Plate Catering Math</span>
              <Badge tone="accent">6-Month Runway</Badge>
            </div>
          </ScrollReveal>

          {/* Birthdays Card */}
          <ScrollReveal
            delayMs={200}
            className="group bg-surface-2 relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[var(--border-faint)] p-8 shadow-[var(--shadow-sm)] transition-all hover:border-[var(--accent-line)] hover:shadow-[var(--shadow-md)]"
          >
            <div
              aria-hidden="true"
              className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-[var(--caution-subtle)] blur-[70px] transition-all group-hover:scale-150"
            />
            <div>
              <span className="bg-surface-3 text-caution relative mb-6 flex size-12 items-center justify-center rounded-2xl border border-[var(--border)] shadow-inner">
                <Cake className="size-6" />
              </span>
              <div className="text-caution mb-2 text-xs font-bold tracking-wider uppercase">
                Occasion 02
              </div>
              <h3 className="text-fg text-2xl font-bold">Birthdays</h3>
              <p className="text-fg-muted mt-3 text-sm leading-relaxed">
                Milestone celebrations and kids parties with age-appropriate games, custom bakery
                cakes, themed return favors, and live entertainment staging.
              </p>
            </div>
            <div className="text-fg-subtle mt-8 flex items-center justify-between border-t border-[var(--border-strong)]/60 pt-4 text-xs font-semibold">
              <span>Game & Bakery Deadlines</span>
              <Badge tone="caution">1-Month Runway</Badge>
            </div>
          </ScrollReveal>

          {/* Community Events Card */}
          <ScrollReveal
            delayMs={300}
            className="group bg-surface-2 relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[var(--border-faint)] p-8 shadow-[var(--shadow-sm)] transition-all hover:border-[var(--accent-line)] hover:shadow-[var(--shadow-md)]"
          >
            <div
              aria-hidden="true"
              className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-[var(--positive-subtle)] blur-[70px] transition-all group-hover:scale-150"
            />
            <div>
              <span className="bg-surface-3 text-positive relative mb-6 flex size-12 items-center justify-center rounded-2xl border border-[var(--border)] shadow-inner">
                <Users className="size-6" />
              </span>
              <div className="text-positive mb-2 text-xs font-bold tracking-wider uppercase">
                Occasion 03
              </div>
              <h3 className="text-fg text-2xl font-bold">Community Events</h3>
              <p className="text-fg-muted mt-3 text-sm leading-relaxed">
                Neighborhood festivals, cultural fairs, and charity drives with municipal permits,
                volunteer shift run-sheets, crowd safety checkpoints, and sanitation logistics.
              </p>
            </div>
            <div className="text-fg-subtle mt-8 flex items-center justify-between border-t border-[var(--border-strong)]/60 pt-4 text-xs font-semibold">
              <span>Permit & Volunteer Logistics</span>
              <Badge tone="positive">3-Month Runway</Badge>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Four Core Assistant Outcomes Grid ── */}
      <section
        id="about"
        aria-labelledby="outcomes-heading"
        className="bg-surface-2/40 border-t border-b border-[var(--border)] py-20 sm:py-28"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal animation="custom-fade-in" className="mx-auto mb-14 max-w-3xl text-center">
            <div className="mb-3 text-xs font-black tracking-[0.2em] text-[var(--accent)] uppercase">
              Precision Engineering
            </div>
            <h2
              id="outcomes-heading"
              className="text-fg text-3xl font-black tracking-tight sm:text-5xl"
            >
              Core Assistant Outcomes
            </h2>
            <p className="text-fg-muted mt-4 text-base leading-relaxed sm:text-lg">
              Engineered to serve the PromptWar Challenge 5 requirements with verifiable
              mathematical precision and zero synthetic hallucinations.
            </p>
          </ScrollReveal>

          <div className="grid gap-6 md:grid-cols-2">
            <ScrollReveal
              delayMs={100}
              className="group bg-surface-2 rounded-2xl border border-[var(--border-faint)] p-6 shadow-[var(--shadow-sm)] transition-all hover:border-[var(--accent-line)] hover:shadow-[var(--shadow-md)] sm:p-8"
            >
              <div className="flex items-start gap-4">
                <span className="bg-accent-subtle text-accent flex size-11 shrink-0 items-center justify-center rounded-xl border border-[var(--accent-line)]">
                  <DollarSign className="size-5" />
                </span>
                <div>
                  <h3 className="text-fg text-xl font-bold">Integer-Normalized Budgets</h3>
                  <p className="text-fg-muted mt-2 text-sm leading-relaxed">
                    Hamilton-Hare largest-remainder allocations guarantee exact penny-accurate sums
                    across worldwide currencies. Eliminates IEEE-754 floating-point rounding errors
                    using integer minor units.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal
              delayMs={200}
              className="group bg-surface-2 rounded-2xl border border-[var(--border-faint)] p-6 shadow-[var(--shadow-sm)] transition-all hover:border-[var(--accent-line)] hover:shadow-[var(--shadow-md)] sm:p-8"
            >
              <div className="flex items-start gap-4">
                <span className="bg-accent-subtle text-accent flex size-11 shrink-0 items-center justify-center rounded-xl border border-[var(--accent-line)]">
                  <Calendar className="size-5" />
                </span>
                <div>
                  <h3 className="text-fg text-xl font-bold">Reverse-Planned Timelines</h3>
                  <p className="text-fg-muted mt-2 text-sm leading-relaxed">
                    Dynamic lead times scaled to your event runway, Nager.Date public holiday clash
                    alerts, day-of operational run-sheets, and RFC 5545 iCalendar (.ics) export.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal
              delayMs={300}
              className="group bg-surface-2 rounded-2xl border border-[var(--border-faint)] p-6 shadow-[var(--shadow-sm)] transition-all hover:border-[var(--accent-line)] hover:shadow-[var(--shadow-md)] sm:p-8"
            >
              <div className="flex items-start gap-4">
                <span className="bg-accent-subtle text-accent flex size-11 shrink-0 items-center justify-center rounded-xl border border-[var(--accent-line)]">
                  <FileText className="size-5" />
                </span>
                <div>
                  <h3 className="text-fg text-xl font-bold">Live Vendor Checklists & Proposals</h3>
                  <p className="text-fg-muted mt-2 text-sm leading-relaxed">
                    Raw quotation parser flagging missing indemnification clauses, side-by-side
                    comparison matrix, and live OpenStreetMap Nominatim discovery.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal
              delayMs={400}
              className="group bg-surface-2 rounded-2xl border border-[var(--border-faint)] p-6 shadow-[var(--shadow-sm)] transition-all hover:border-[var(--accent-line)] hover:shadow-[var(--shadow-md)] sm:p-8"
            >
              <div className="flex items-start gap-4">
                <span className="bg-accent-subtle text-accent flex size-11 shrink-0 items-center justify-center rounded-xl border border-[var(--accent-line)]">
                  <Lightbulb className="size-5" />
                </span>
                <div>
                  <h3 className="text-fg text-xl font-bold">Personalized AI Ideation Studio</h3>
                  <p className="text-fg-muted mt-2 text-sm leading-relaxed">
                    Streaming NDJSON creative ideas respecting cultural traditions, dietary
                    requirements, and accessibility accommodations powered by Google Gemini.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
}
