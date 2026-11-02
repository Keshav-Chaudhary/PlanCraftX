'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Search, Zap } from 'lucide-react';
import { HeroCommandDeck } from './hero-command-deck';

const PROMPT_SUGGESTIONS = [
  {
    label: 'Napa Vineyard Wedding',
    prompt: '120-guest outdoor vineyard wedding in Napa Valley under 35000 USD',
  },
  {
    label: '50th Golden Jubilee',
    prompt: '150-guest milestone anniversary gala with catering and live music',
  },
  {
    label: 'Civic Street Festival',
    prompt: 'Community autumn festival in downtown park with food trucks and permits',
  },
];

export function HeroSection() {
  const [promptText, setPromptText] = useState('');

  const handleLaunchPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    const query = promptText.trim();
    const target = query ? `/plan/event?prompt=${encodeURIComponent(query)}` : '/plan/event';
    if (typeof window !== 'undefined') {
      window.location.href = target;
    }
  };

  const handleSelectPrompt = (prompt: string) => {
    setPromptText(prompt);
  };

  return (
    <section className="relative overflow-hidden border-b border-[var(--border)] bg-[radial-gradient(ellipse_at_top_right,_var(--accent-subtle),_transparent_55%),radial-gradient(ellipse_at_bottom_left,_var(--accent-subtle),_transparent_55%)]">
      {/* Ambient background glow aura */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-10 left-1/2 -z-10 h-[550px] w-[900px] -translate-x-1/2 rounded-full bg-[var(--accent)] opacity-10 blur-[140px]"
      />

      <div className="mx-auto max-w-7xl px-4 pt-28 pb-16 sm:pt-36 sm:pb-24 lg:px-8 lg:pt-36 lg:pb-28">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Command Deck & Inline Prompt (7 cols on lg) */}
          <div className="stagger flex flex-col justify-center lg:col-span-7">
            {/* Editorial Badge */}
            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-[var(--accent-line)] bg-[var(--accent-subtle)] px-3.5 py-1 text-xs font-bold tracking-widest text-[var(--accent)] uppercase">
              <Sparkles className="size-3.5" />
              <span>Architectural Celebration Intelligence</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-fg text-4xl font-black tracking-tight text-balance sm:text-5xl lg:text-6xl xl:text-7xl">
              GenAI Event Planning Assistant
            </h1>

            {/* Sub-description */}
            <p className="text-fg-muted mt-5 text-base leading-relaxed text-pretty sm:text-lg">
              One connected executive command center for weddings, milestone jubilees, and community
              festivals. Organize integer-normalized budgets, reverse-planned timeline runsheets,
              and vendor taxonomies grounded in live telemetry.
            </p>

            {/* Inline AI Quick-Prompt Command Bar */}
            <form onSubmit={handleLaunchPrompt} className="mt-8">
              <div className="group bg-surface/90 relative flex items-center rounded-2xl border border-[var(--border-strong)] p-1.5 shadow-[var(--shadow-md)] backdrop-blur-xl transition-all duration-300 focus-within:border-[var(--accent)] focus-within:shadow-[0_0_24px_var(--accent-line)]">
                <div className="text-fg-subtle flex pl-3">
                  <Search className="size-4.5 group-focus-within:text-[var(--accent)]" />
                </div>
                <input
                  type="text"
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Describe your celebration (e.g. 150-guest garden gala under 40000 USD)..."
                  aria-label="Describe your celebration"
                  className="text-fg placeholder:text-fg-subtle/70 w-full bg-transparent px-3 py-2 text-sm font-medium outline-hidden"
                />
                <button
                  type="submit"
                  id="hero-quick-prompt-btn"
                  className="flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-[var(--accent)] px-4 text-xs font-bold text-[var(--accent-fg)] shadow-xs transition-all hover:bg-[var(--accent-strong)] sm:px-5 sm:text-sm"
                >
                  <span>Plan Now</span>
                  <Zap className="size-3.5" />
                </button>
              </div>

              {/* Quick Prompt Suggestion Chips */}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-fg-subtle text-[11px] font-semibold">Quick Intakes:</span>
                {PROMPT_SUGGESTIONS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleSelectPrompt(item.prompt)}
                    className="bg-surface-2/80 text-fg-muted hover:text-fg cursor-pointer rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] font-semibold transition-all hover:border-[var(--accent-line)]"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </form>

            {/* Dual CTA Actions */}
            <div className="mt-7 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
              <Link
                href="/plan"
                id="start-planning-btn"
                className="inline-flex h-12 cursor-pointer items-center justify-center gap-3 rounded-full bg-[var(--accent)] px-8 text-base font-bold text-[var(--accent-fg)] shadow-[var(--shadow-md)] transition-all hover:-translate-y-0.5 hover:bg-[var(--accent-strong)] hover:shadow-[0_0_24px_var(--accent-line)] sm:h-13"
              >
                <span>Launch Planning Workspace</span>
                <ArrowRight aria-hidden="true" className="size-5" />
              </Link>
              <Link
                href="/plan/event"
                id="create-event-direct-btn"
                className="bg-surface-2 text-fg hover:bg-surface-3 inline-flex h-12 cursor-pointer items-center justify-center rounded-full border border-[var(--border-strong)] px-7 text-sm font-semibold transition-colors sm:h-13"
              >
                Create New Event Directly
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="text-fg-muted mt-8 flex flex-wrap items-center gap-4 text-xs font-semibold">
              <span className="text-positive flex items-center gap-1.5">
                <CheckCircle2 className="size-4" /> 100% Zero Synthetic Data Guarantee
              </span>
              <span className="text-accent flex items-center gap-1.5">
                <ShieldCheck className="size-4" /> WCAG 2.2 AA Certified Accessible
              </span>
            </div>
          </div>

          {/* Right Column: Overlapping Layered Card Deck (5 cols on lg) */}
          <div className="custom-fade-in relative lg:col-span-5">
            <HeroCommandDeck />
          </div>
        </div>
      </div>
    </section>
  );
}
