'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, ShieldCheck, Award, Zap, Search } from 'lucide-react';
import { HeroCenterVisual } from './hero-center-visual';
import { HeroCommandDeck } from './hero-command-deck';
import { HeroBottomStrip } from './hero-bottom-strip';

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
    <section className="bg-bg text-fg relative overflow-hidden transition-colors duration-300">
      {/* Ambient background glow lighting matching the theme palette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-12 right-1/4 -z-10 h-[520px] w-[620px] rounded-full bg-[var(--accent)] opacity-10 blur-[140px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-10 left-4 -z-10 h-[400px] w-[500px] rounded-full bg-amber-600/10 blur-[130px]"
      />

      <div className="mx-auto max-w-[1400px] px-4 pt-24 pb-12 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32 lg:pb-14">
        {/* Main 2-Column Hero Composition */}
        <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-6 xl:gap-8">
          {/* Left Column (desktop primary) */}
          <div className="stagger flex flex-col justify-center lg:col-span-6 xl:col-span-6 2xl:col-span-5">
            {/* Eyebrow Badge */}
            <div className="mb-3.5 inline-flex w-fit items-center gap-2 rounded-full border border-[var(--accent-line)] bg-[var(--accent-subtle)] px-3 py-1 shadow-[0_0_15px_var(--accent-subtle)] backdrop-blur-md sm:mb-4 sm:px-3.5 sm:py-1.5">
              <svg className="size-3.5 fill-[var(--accent)]" viewBox="0 0 24 24">
                <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
              </svg>
              <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase sm:text-[11px]">
                <span className="text-fg-muted">SMART EVENT PLANNING</span>
                <span className="text-[var(--accent)]">MADE EFFORTLESS</span>
              </div>
            </div>

            {/* Main Headline */}
            <h1
              aria-label="GenAI Event Planning Assistant"
              className="text-fg text-3xl leading-[1.08] font-black tracking-tight sm:text-5xl lg:text-5xl xl:text-[56px] 2xl:text-[64px]"
            >
              <span className="sr-only">GenAI Event Planning Assistant</span>
              <span aria-hidden="true">
                GenAI Event
                <br />
                <span className="bg-gradient-to-r from-[var(--accent)] via-amber-400 to-rose-400 bg-clip-text text-transparent">
                  Planning
                </span>{' '}
                Assistant
              </span>
            </h1>

            {/* Subtitle Description */}
            <p className="text-fg-muted mt-3.5 max-w-[540px] text-xs leading-relaxed font-normal sm:mt-4 sm:text-sm md:text-base">
              The intelligent, stress-free workspace for weddings, milestone celebrations, and
              community festivals. Organize penny-accurate budgets, step-by-step timelines, verified
              vendor checklists, and personalized ideas in minutes.
            </p>

            {/* Inline AI Quick-Prompt Command Bar */}
            <form onSubmit={handleLaunchPrompt} className="mt-5 sm:mt-6">
              <div className="group bg-surface/90 relative flex items-center rounded-2xl border border-[var(--border-strong)] p-1.5 shadow-[var(--shadow-md)] backdrop-blur-xl transition-all focus-within:border-[var(--accent)] focus-within:shadow-[0_0_24px_var(--accent-line)]">
                <div className="text-fg-subtle flex pl-2.5 sm:pl-3">
                  <Search className="size-4 group-focus-within:text-[var(--accent)] sm:size-4.5" />
                </div>
                <input
                  type="text"
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Describe your celebration (e.g. 150-guest garden gala)..."
                  aria-label="Describe your celebration"
                  className="text-fg placeholder:text-fg-subtle/70 w-full bg-transparent px-2.5 py-1.5 text-xs font-medium outline-hidden sm:px-3 sm:py-2 sm:text-sm"
                />
                <button
                  type="submit"
                  id="hero-quick-prompt-btn"
                  className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-[var(--accent)] px-3 text-xs font-bold text-[var(--accent-fg)] shadow-xs transition-all hover:bg-[var(--accent-strong)] sm:h-10 sm:gap-2 sm:px-4 sm:text-sm"
                >
                  <span>Plan Now</span>
                  <Zap className="size-3 sm:size-3.5" />
                </button>
              </div>

              {/* Quick Prompt Suggestion Chips */}
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs sm:mt-3 sm:gap-2">
                <span className="text-fg-subtle text-[10px] font-semibold sm:text-[11px]">
                  Quick Intakes:
                </span>
                {PROMPT_SUGGESTIONS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleSelectPrompt(item.prompt)}
                    className="bg-surface-2/80 text-fg-muted hover:text-fg cursor-pointer rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] font-semibold transition-all hover:border-[var(--accent-line)] sm:px-2.5 sm:py-1 sm:text-[11px]"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </form>

            {/* Dual CTA Actions */}
            <div className="mt-5 flex flex-col gap-2.5 sm:mt-6 sm:flex-row sm:items-center sm:gap-3.5">
              <Link
                href="/plan"
                id="start-planning-btn"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-xs font-bold text-[var(--accent-fg)] shadow-[0_0_24px_var(--accent-line)] transition-all hover:scale-[1.02] hover:bg-[var(--accent-strong)] hover:shadow-[0_0_32px_var(--accent-line)] sm:w-auto sm:px-6 sm:py-3 sm:text-sm"
              >
                <Sparkles className="size-4" />
                <span>Launch Planning Workspace</span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <Link
                href="/plan/event"
                id="create-event-direct-btn"
                className="bg-surface-2 text-fg hover:bg-surface-3 inline-flex w-full cursor-pointer items-center justify-center rounded-full border border-[var(--border-strong)] px-5 py-2.5 text-center text-xs font-semibold backdrop-blur-md transition-all hover:border-[var(--accent-line)] sm:w-auto sm:px-6 sm:py-3 sm:text-sm"
              >
                Create New Event Directly
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="text-fg-muted mt-6 flex flex-col gap-2 text-xs font-semibold sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <span className="text-positive flex items-center gap-1.5">
                <ShieldCheck className="text-positive size-4 shrink-0" />
                100% Zero Synthetic Data Guarantee
              </span>
              <span className="text-caution flex items-center gap-1.5">
                <Award className="text-caution size-4 shrink-0" />
                WCAG 2.2 AA Certified Accessible
              </span>
              <span className="flex items-center gap-1.5 text-[var(--accent)]">
                <Zap className="size-4 shrink-0 text-[var(--accent)]" />
                Lightning Fast & Reliable
              </span>
            </div>
          </div>

          {/* Right Area: Center Decorative Visual + Glassmorphic Command Deck */}
          <div
            className="custom-rise relative flex items-center justify-center gap-2 lg:col-span-6 lg:justify-end xl:col-span-6 xl:gap-3 2xl:col-span-7"
            style={{ animationDelay: '0.24s' }}
          >
            <HeroCenterVisual />
            <div className="w-full max-w-[460px] shrink-0 lg:max-w-[420px] xl:max-w-[440px] 2xl:max-w-[470px]">
              <HeroCommandDeck />
            </div>
          </div>
        </div>

        {/* Bottom Social Proof Strip */}
        <div className="custom-rise" style={{ animationDelay: '0.42s' }}>
          <HeroBottomStrip />
        </div>
      </div>
    </section>
  );
}
