'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { HeroEventCopilotHUD } from '@/features/overview/hero-event-copilot-hud';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-[var(--border)] bg-[radial-gradient(ellipse_at_top_right,_var(--accent-subtle),_transparent_50%),radial-gradient(ellipse_at_bottom_left,_var(--accent-subtle),_transparent_50%)]">
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[var(--accent)] opacity-5 blur-[120px]"
      />

      <div className="mx-auto max-w-7xl px-4 pt-28 pb-16 sm:pt-36 sm:pb-24 lg:px-8 lg:pt-36 lg:pb-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
          {/* Left Column: Headline & Action */}
          <div className="stagger max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--accent-line)] bg-[var(--accent-subtle)] px-3.5 py-1 text-xs font-bold tracking-widest text-[var(--accent)] uppercase">
              <Sparkles className="size-3.5" />
              <span>Next-Gen Celebration Planning</span>
            </div>

            <h1 className="text-fg text-4xl font-black tracking-tight text-balance sm:text-5xl lg:text-6xl xl:text-7xl">
              GenAI Event Planning Assistant
            </h1>

            <p className="text-fg-muted mt-6 text-base leading-relaxed text-pretty sm:text-lg lg:text-xl">
              One connected executive workspace for weddings, milestone birthdays, and community
              festivals. Organize integer-normalized budgets, reverse-planned timelines, vendor
              checklists, and personalized ideas powered by Google Gemini and live public data.
            </p>

            <div className="mt-8 flex flex-col items-stretch gap-4 sm:mt-10 sm:flex-row sm:items-center">
              <Link
                href="/plan"
                id="start-planning-btn"
                className="inline-flex h-12 cursor-pointer items-center justify-center gap-3 rounded-full bg-[var(--accent)] px-8 text-base font-bold text-[var(--accent-fg)] shadow-[var(--shadow-md)] transition-all hover:-translate-y-0.5 hover:bg-[var(--accent-strong)] hover:shadow-[0_0_24px_var(--accent-line)] sm:h-14"
              >
                <span>Launch Planning Workspace</span>
                <ArrowRight aria-hidden="true" className="size-5" />
              </Link>
              <Link
                href="/plan/event"
                id="create-event-direct-btn"
                className="bg-surface-2 text-fg hover:bg-surface-3 inline-flex h-12 cursor-pointer items-center justify-center rounded-full border border-[var(--border-strong)] px-8 text-base font-semibold transition-colors sm:h-14"
              >
                Create New Event Directly
              </Link>
            </div>

            {/* Micro proof badges */}
            <div className="text-fg-muted mt-8 flex flex-wrap items-center gap-4 text-xs font-semibold">
              <span className="text-positive flex items-center gap-1.5">
                <CheckCircle2 className="size-4" /> 100% Zero Synthetic Data Guarantee
              </span>
              <span className="text-accent flex items-center gap-1.5">
                <ShieldCheck className="size-4" /> WCAG 2.2 AA Certified Accessible
              </span>
            </div>
          </div>

          {/* Right Column: Simulated Live Event Copilot HUD */}
          <div className="custom-fade-in relative hidden lg:block">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-10 rounded-xl bg-gradient-to-tr from-[var(--bg)] via-transparent to-transparent"
            />
            <HeroEventCopilotHUD />
          </div>
        </div>
      </div>
    </section>
  );
}
