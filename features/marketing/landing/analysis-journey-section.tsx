'use client';

import React, { useState } from 'react';
import { Sparkles, DollarSign, Calendar, FileText, Check } from 'lucide-react';
import { Badge } from '@/features/ui/badge';
import { ScrollReveal } from '@/features/ui/scroll-reveal';

interface JourneyStepItem {
  readonly step: string;
  readonly title: string;
  readonly icon: React.ElementType;
  readonly tag: string;
  readonly description: string;
  readonly details: readonly string[];
}

const JOURNEY_STEPS: readonly JourneyStepItem[] = [
  {
    step: '01',
    title: 'Event Setup & Natural Language Intake',
    icon: Sparkles,
    tag: 'GenAI Intake',
    description:
      'Describe your celebration in plain language or use the structured event wizard. Google Gemini extracts guest count, date, location, dietary constraints, and aesthetic themes into validated JSON schemas.',
    details: [
      'Strict Zod runtime schema validation with sanitization',
      'Location geocoding with OpenStreetMap Nominatim',
      'Automatic holiday clash checking via Nager.Date',
    ],
  },
  {
    step: '02',
    title: 'Budget & Hamilton-Hare Allocation',
    icon: DollarSign,
    tag: 'Penny Accurate',
    description:
      'Allocates your total budget across key event categories without rounding drift. Uses the Hamilton-Hare largest-remainder method with integer minor units for mathematically perfect penny-level balance.',
    details: [
      'Integer-minor-unit math eliminates floating-point rounding errors',
      'Dynamic real-time rebalancing with interactive sliders',
      'Frankfurter currency conversion across 30+ global currencies',
    ],
  },
  {
    step: '03',
    title: 'Reverse-Planned Timeline & Run-Sheet',
    icon: Calendar,
    tag: 'Dynamic Milestones',
    description:
      'Builds a reverse-planned chronological schedule from your celebration date backwards. Generates day-of operational run-sheets and alerts you to public holiday conflicts.',
    details: [
      'Dynamic lead times scaled to your event runway (1 to 24 months)',
      'Nager.Date public holiday detection flagging supplier closures',
      'One-click RFC 5545 iCalendar (.ics) export for Google Calendar & Apple iCal',
    ],
  },
  {
    step: '04',
    title: 'Vendor Checklists & Quote Analyzer',
    icon: FileText,
    tag: 'Contract Analysis',
    description:
      'Compares vendor quotations side-by-side, extracts line-item totals, verifies tax rates, and flags missing indemnification or refund clauses before you sign.',
    details: [
      'Side-by-side quote comparison matrix with per-guest unit economics',
      'Extraction of cancellation, overtime, and deposit provisions',
      'Live local vendor directory search via OpenStreetMap Nominatim',
    ],
  },
] as const;

function getJourneyStep(index: number): JourneyStepItem {
  switch (index) {
    case 1:
      return JOURNEY_STEPS[1] as JourneyStepItem;
    case 2:
      return JOURNEY_STEPS[2] as JourneyStepItem;
    case 3:
      return JOURNEY_STEPS[3] as JourneyStepItem;
    case 0:
    default:
      return JOURNEY_STEPS[0] as JourneyStepItem;
  }
}

export function AnalysisJourneySection() {
  const [activeStep, setActiveStep] = useState(0);
  const stepData = getJourneyStep(activeStep);

  return (
    <section className="overflow-hidden py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="mx-auto mb-16 max-w-3xl text-center">
          <div className="mb-3 text-xs font-black tracking-[0.2em] text-[var(--accent)] uppercase">
            Workflow Architecture
          </div>
          <h2 className="text-fg text-3xl font-black tracking-tight sm:text-5xl">
            From celebration concept to reality in 4 steps.
          </h2>
          <p className="text-fg-muted mt-4 text-base sm:text-lg">
            Explore how PlanCraftX orchestrates events with transparent, grounded algorithms.
          </p>
        </ScrollReveal>

        <div className="grid items-start gap-8 lg:grid-cols-12">
          {/* Step Selector Buttons (Left Column) */}
          <div className="space-y-3 lg:col-span-5">
            {JOURNEY_STEPS.map((s, idx) => {
              const isCurrent = activeStep === idx;
              const IconComponent = s.icon;
              return (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => setActiveStep(idx)}
                  className={`flex w-full cursor-pointer items-center justify-between rounded-2xl border p-5 text-left transition-all duration-300 ${
                    isCurrent
                      ? 'bg-surface border-[var(--accent)] shadow-[0_8px_30px_rgba(0,0,0,0.12)] ring-1 ring-[var(--accent)]/40'
                      : 'bg-surface-2 hover:border-border hover:bg-surface-3 border-[var(--border-strong)]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex size-11 items-center justify-center rounded-xl transition-colors ${
                        isCurrent ? 'bg-accent text-white' : 'bg-surface-3 text-fg-muted'
                      }`}
                    >
                      <IconComponent className="size-5" />
                    </div>
                    <div>
                      <div className="text-fg-muted text-[11px] font-bold tracking-wider uppercase">
                        Step {s.step}
                      </div>
                      <div className="text-fg mt-0.5 text-base font-bold">{s.title}</div>
                    </div>
                  </div>
                  <Badge tone={isCurrent ? 'accent' : 'neutral'} className="text-[10px]">
                    {s.tag}
                  </Badge>
                </button>
              );
            })}
          </div>

          {/* Active Step Showcase Card (Right Column) */}
          <div className="lg:col-span-7">
            <div className="bg-surface relative overflow-hidden rounded-3xl border border-[var(--border-strong)] p-8 shadow-[var(--shadow-md)] sm:p-10">
              <div
                aria-hidden="true"
                className="bg-accent-subtle pointer-events-none absolute top-0 right-0 -z-10 size-64 rounded-full blur-[90px]"
              />

              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-accent text-3xl font-black">{stepData.step}</span>
                  <span className="text-fg-muted text-sm font-bold tracking-widest uppercase">
                    / Phase Definition
                  </span>
                </div>
                <Badge tone="accent" className="text-xs font-bold tracking-wider uppercase">
                  {stepData.tag}
                </Badge>
              </div>

              <h3 className="text-fg mb-4 text-2xl font-bold sm:text-3xl">{stepData.title}</h3>

              <p className="text-fg-muted mb-8 text-base leading-relaxed">{stepData.description}</p>

              <div className="space-y-3 border-t border-[var(--border)] pt-6">
                <div className="text-fg-muted text-xs font-bold tracking-wider uppercase">
                  Key Capabilities Delivered:
                </div>
                {stepData.details.map((detail) => (
                  <div key={detail} className="text-fg flex items-center gap-3 text-sm">
                    <div className="bg-positive-subtle text-positive flex size-5 shrink-0 items-center justify-center rounded-full">
                      <Check className="size-3" />
                    </div>
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
