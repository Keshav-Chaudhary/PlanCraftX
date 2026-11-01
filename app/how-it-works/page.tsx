import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  Calculator,
  Calendar,
  CloudSun,
  Database,
  Lock,
  EyeOff,
} from 'lucide-react';
import { ScrollReveal } from '@/features/ui/scroll-reveal';
import { Badge } from '@/features/ui/badge';
import { MarketingFooter } from '@/features/ui/marketing-footer';

export const metadata: Metadata = {
  title: 'How It Works — PlanCraftX Architecture & Principles',
  description:
    'Learn how PlanCraftX delivers deterministic event budgets, reverse-planned timelines, and genuine open-data weather & holiday telemetry.',
};

export default function HowItWorksPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-[var(--border)] bg-[radial-gradient(ellipse_at_top_right,_var(--accent-subtle),_transparent_50%),radial-gradient(ellipse_at_bottom_left,_var(--accent-subtle),_transparent_50%)]">
        <div className="absolute top-0 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[var(--accent)] opacity-5 blur-[100px]" />
        <div className="custom-fade-in mx-auto max-w-7xl px-4 pt-28 pb-20 text-center lg:px-8">
          <Badge tone="accent" className="mb-4 text-xs font-black tracking-[0.2em] uppercase">
            System Architecture
          </Badge>
          <h1 className="text-fg text-4xl font-black tracking-tight text-balance sm:text-5xl lg:text-7xl">
            Evidence-First.
            <br />
            <span className="text-[var(--accent)]">Zero Synthetic Data.</span>
          </h1>
          <p className="text-fg-muted mx-auto mt-6 max-w-3xl text-base leading-relaxed text-pretty sm:text-lg lg:text-xl">
            PlanCraftX is engineered to bridge the gap between complex celebration ideas and
            decisive executive action. By coupling deterministic budget and timeline algorithms with
            live public open-data telemetry, we ensure every plan is mathematically grounded.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/plan"
              className="bg-accent text-accent-fg hover:bg-accent-strong inline-flex h-12 items-center justify-center gap-2 rounded-full px-8 text-sm font-bold shadow-md transition-all"
            >
              Open Planning Workspace
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <ScrollReveal className="mx-auto mb-16 max-w-3xl text-center">
          <div className="mb-2 text-xs font-black tracking-[0.2em] text-[var(--accent)] uppercase">
            The Technology
          </div>
          <h2 className="text-fg text-3xl font-black tracking-tight sm:text-4xl">
            Core Technical Pillars of the Platform
          </h2>
          <p className="text-fg-muted mt-4 text-base">
            Designed to empower event organizers, couples, and community coordinators with trusted
            planning intelligence.
          </p>
        </ScrollReveal>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Pillar 1 */}
          <ScrollReveal
            delayMs={100}
            className="group bg-surface-2 relative overflow-hidden rounded-3xl border border-[var(--border-faint)] p-8 shadow-[var(--shadow-sm)] transition-all hover:border-[var(--accent-line)] hover:shadow-[var(--shadow-md)]"
          >
            <div className="absolute -top-16 -right-16 h-32 w-32 rounded-full bg-[var(--accent-subtle)] blur-[50px] transition-all group-hover:scale-125" />
            <span className="bg-surface-3 relative mb-6 flex size-12 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--accent)]">
              <Calculator className="size-6" />
            </span>
            <h3 className="text-fg mb-3 text-2xl font-bold">Hamilton-Hare Integer Budgeting</h3>
            <p className="text-fg-muted text-sm leading-relaxed sm:text-base">
              Budgets are allocated by category percentages, floored to integer minor units, and
              remaining pennies distributed by largest fractional remainders. Total allocated budget
              never deviates from the target by even a single cent.
            </p>
          </ScrollReveal>

          {/* Pillar 2 */}
          <ScrollReveal
            delayMs={200}
            className="group bg-surface-2 relative overflow-hidden rounded-3xl border border-[var(--border-faint)] p-8 shadow-[var(--shadow-sm)] transition-all hover:border-[var(--accent-line)] hover:shadow-[var(--shadow-md)]"
          >
            <div className="absolute -top-16 -right-16 h-32 w-32 rounded-full bg-[var(--accent-subtle)] blur-[50px] transition-all group-hover:scale-125" />
            <span className="bg-surface-3 relative mb-6 flex size-12 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--accent)]">
              <Calendar className="size-6" />
            </span>
            <h3 className="text-fg mb-3 text-2xl font-bold">
              Reverse-Planned Milestones & Holidays
            </h3>
            <p className="text-fg-muted text-sm leading-relaxed sm:text-base">
              Deadlines are calculated backwards from the celebration date using event-specific
              runway cadences (Weddings 6mo, Birthdays 1mo, Community 3mo) and cross-verified
              against official Nager.Date public holidays.
            </p>
          </ScrollReveal>

          {/* Pillar 3 */}
          <ScrollReveal
            delayMs={300}
            className="group bg-surface-2 relative overflow-hidden rounded-3xl border border-[var(--border-faint)] p-8 shadow-[var(--shadow-sm)] transition-all hover:border-[var(--accent-line)] hover:shadow-[var(--shadow-md)]"
          >
            <div className="absolute -top-16 -right-16 h-32 w-32 rounded-full bg-[var(--accent-subtle)] blur-[50px] transition-all group-hover:scale-125" />
            <span className="bg-surface-3 relative mb-6 flex size-12 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--accent)]">
              <Lock className="size-6" />
            </span>
            <h3 className="text-fg mb-3 text-2xl font-bold">Zero-Knowledge Storage & Privacy</h3>
            <p className="text-fg-muted text-sm leading-relaxed sm:text-base">
              Your celebration details, guest counts, and vendor budgets never train public AI
              models. All event plans are stored locally in the browser with full RFC 5545 iCalendar
              (.ics) and JSON data portability.
            </p>
          </ScrollReveal>

          {/* Pillar 4 */}
          <ScrollReveal
            delayMs={400}
            className="group bg-surface-2 relative overflow-hidden rounded-3xl border border-[var(--border-faint)] p-8 shadow-[var(--shadow-sm)] transition-all hover:border-[var(--accent-line)] hover:shadow-[var(--shadow-md)]"
          >
            <div className="absolute -top-16 -right-16 h-32 w-32 rounded-full bg-[var(--accent-subtle)] blur-[50px] transition-all group-hover:scale-125" />
            <span className="bg-surface-3 relative mb-6 flex size-12 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--accent)]">
              <CloudSun className="size-6" />
            </span>
            <h3 className="text-fg mb-3 text-2xl font-bold">Live Open-Meteo Weather Grounding</h3>
            <p className="text-fg-muted text-sm leading-relaxed sm:text-base">
              Real-time precipitation probabilities and wind envelope forecasts alert planners 48-72
              hours prior to the event, automatically triggering marquee contingencies and rain-safe
              indoor run-sheet adaptations.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Safety & Compliance Checklist */}
      <section className="bg-surface-2 border-border border-t border-b py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h3 className="text-fg text-2xl font-bold sm:text-3xl">
              Enterprise Governance & Open Data Standards
            </h3>
            <p className="text-fg-muted mt-3 text-sm">
              Built from the ground up for strict confidentiality, mathematical precision, and zero
              hallucinations.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="bg-surface border-border rounded-2xl border p-6">
              <EyeOff className="text-accent mb-4 size-8" />
              <h4 className="text-fg mb-2 text-base font-bold">Ephemeral Client Processing</h4>
              <p className="text-fg-muted text-xs leading-relaxed">
                Event data is managed entirely in browser storage and can be instantly purged at any
                time from privacy controls.
              </p>
            </div>

            <div className="bg-surface border-border rounded-2xl border p-6">
              <Database className="text-accent mb-4 size-8" />
              <h4 className="text-fg mb-2 text-base font-bold">Grounded Public Telemetry</h4>
              <p className="text-fg-muted text-xs leading-relaxed">
                Weather, exchange rates, holidays, and vendor map discovery query authentic
                open-data APIs (Open-Meteo, Nager.Date, Frankfurter, OpenStreetMap).
              </p>
            </div>

            <div className="bg-surface border-border rounded-2xl border p-6">
              <ShieldCheck className="text-positive mb-4 size-8" />
              <h4 className="text-fg mb-2 text-base font-bold">
                Strict Zero Synthetic Data Policy
              </h4>
              <p className="text-fg-muted text-xs leading-relaxed">
                No hallucinated quotes, imaginary prices, or fake dates. All vendor proposals
                require explicit user input or verifiable documentation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <h3 className="text-fg text-3xl font-extrabold sm:text-4xl">
            Ready to plan your next event?
          </h3>
          <p className="text-fg-muted mt-4 text-base sm:text-lg">
            Experience PlanCraftX celebration intelligence with integer-accurate budgets and
            reverse-planned milestones.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/plan"
              className="bg-accent text-accent-fg hover:bg-accent-strong inline-flex h-12 items-center justify-center gap-2 rounded-full px-8 text-sm font-bold shadow-md transition-all"
            >
              Launch PlanCraftX Workspace
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <MarketingFooter />
    </div>
  );
}
