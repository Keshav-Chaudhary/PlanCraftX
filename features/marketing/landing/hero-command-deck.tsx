'use client';

import React from 'react';
import {
  Calendar,
  Users,
  MapPin,
  Clock,
  CloudSun,
  Crown,
  Layers,
  Crosshair,
  Check,
  ShieldCheck,
} from 'lucide-react';

/**
 * Event Dashboard & Timeline Cards (Right Column).
 * Pixel-accurate reproduction of the reference glassmorphic dashboard
 * and separate timeline milestones card, dynamically bound to the
 * PlanCraftX design system theme palette (Light, Dark, and High-Contrast)
 * with robust mobile-to-desktop responsiveness.
 */
export function HeroCommandDeck() {
  return (
    <div className="relative mx-auto flex w-full max-w-lg flex-col gap-4 select-none lg:max-w-none">
      {/* ── CARD 1: MAIN EVENT DASHBOARD ── */}
      <div className="bg-surface/90 relative rounded-3xl border border-[var(--border-strong)] p-4 shadow-[var(--shadow-lg)] backdrop-blur-xl transition-all duration-300 hover:border-[var(--accent-line)] sm:p-5.5 md:p-6">
        {/* Floating Weather Status Pill (Top-Right) */}
        <div className="bg-surface-2/95 absolute -top-3.5 right-3 z-20 flex items-center gap-1.5 rounded-full border border-[var(--border-strong)] px-2.5 py-0.5 shadow-md backdrop-blur-md sm:right-4 sm:px-3 sm:py-1">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          <CloudSun className="size-3 text-amber-500" />
          <span className="text-fg-muted text-[10px] font-medium sm:text-[11px]">
            <span className="xs:inline hidden">Open-Meteo: </span>22°C Clear • Outdoor Ready
          </span>
        </div>

        {/* Event Header */}
        <div className="mt-1 flex items-start justify-between border-b border-[var(--border)] pb-3.5 sm:pb-4">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-[var(--accent-line)] bg-[var(--accent-subtle)] text-[var(--accent)] shadow-inner sm:size-11">
              <Crown className="size-5 stroke-[2.2] sm:size-5.5" />
            </div>
            <div>
              <h2 className="text-fg text-sm font-extrabold tracking-tight sm:text-base md:text-lg">
                Golden Jubilee Gala
              </h2>
              <div className="text-fg-subtle mt-1 flex flex-wrap items-center gap-2 text-[11px] sm:gap-3 sm:text-xs">
                <span className="flex items-center gap-1">
                  <Users className="text-fg-subtle size-3" /> 150 Guests
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="text-fg-subtle size-3" /> San Francisco, CA
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="text-fg-subtle size-3" /> Garden Venue
                </span>
              </div>
            </div>
          </div>
          <span className="bg-surface-2 text-fg-muted hidden rounded-full border border-[var(--border)] px-2.5 py-1 text-[10px] font-black tracking-wider uppercase md:inline-block">
            PLANCRAFTX ENGINE V2.4
          </span>
        </div>

        {/* Budget Allocation Section */}
        <div className="mt-3.5 space-y-2 sm:mt-4">
          <div className="flex flex-col gap-1 text-xs sm:flex-row sm:items-center sm:justify-between">
            <span className="text-fg flex items-center gap-1.5 font-bold tracking-wide">
              <Layers className="size-4 text-[var(--accent)]" />
              Hamilton-Hare Budget Allocation
            </span>
            <span className="font-mono font-black text-[var(--accent)]">{'$'}45,000 USD Total</span>
          </div>

          {/* Segmented Proportional Progress Bar */}
          <div
            className="bg-surface-2 flex h-2.5 w-full overflow-hidden rounded-full border border-[var(--border)] p-0.5"
            role="progressbar"
            aria-label="Proportional budget breakdown"
            aria-valuenow={100}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="flex-[42] rounded-l-full bg-[#f97316]" title="Venue & Space" />
            <div className="flex-[31] bg-[#a855f7]" title="Food & Beverage" />
            <div className="flex-[15] bg-[#0ea5e9]" title="Decor & Florals" />
            <div className="flex-[12] rounded-r-full bg-[#10b981]" title="Safety Buffer" />
          </div>

          {/* Legend: Grid on mobile, flex on desktop */}
          <div className="text-fg-subtle grid grid-cols-2 gap-1.5 pt-1 text-[10px] font-medium sm:flex sm:flex-wrap sm:items-center sm:justify-between">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[#f97316]" /> Venue & Space
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[#a855f7]" /> Food & Beverage
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[#0ea5e9]" /> Decor & Florals
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[#10b981]" /> Safety Buffer
            </span>
          </div>
        </div>

        {/* Two Metric Cards Side-by-Side */}
        <div className="mt-3.5 grid grid-cols-1 gap-2.5 sm:mt-4 sm:grid-cols-2 sm:gap-3">
          {/* Card 1: Budget Precision */}
          <div className="bg-surface-2/70 relative overflow-hidden rounded-2xl border border-[var(--border)] p-3 sm:p-3.5">
            <div className="text-fg-muted flex items-center gap-1.5 text-[11px] font-bold">
              <Crosshair className="text-positive size-3.5" />
              Budget Precision
            </div>
            <div className="text-positive mt-1 flex items-center gap-1.5 text-xs font-black">
              <span>Penny-Accurate Balance</span>
              <Check className="text-positive size-3.5 stroke-[3]" />
            </div>
            <p className="text-fg-subtle mt-1 text-[10px] leading-tight">
              Every category perfectly balanced down to the cent with zero drift.
            </p>
            {/* Decorative bottom wave */}
            <svg
              className="absolute right-0 bottom-0 left-0 h-4 w-full opacity-35"
              viewBox="0 0 100 20"
              preserveAspectRatio="none"
              fill="none"
            >
              <path d="M0 15 C 30 5, 70 25, 100 12 L 100 20 L 0 20 Z" fill="var(--positive)" />
            </svg>
          </div>

          {/* Card 2: Schedule Protection */}
          <div className="bg-surface-2/70 relative overflow-hidden rounded-2xl border border-[var(--border)] p-3 sm:p-3.5">
            <div className="text-fg-muted flex items-center gap-1.5 text-[11px] font-bold">
              <Calendar className="size-3.5 text-[var(--accent)]" />
              Schedule Protection
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs font-black text-[var(--accent)]">
              <span>0 Holiday Conflicts</span>
              <ShieldCheck className="size-3.5 text-[var(--accent)]" />
            </div>
            <p className="text-fg-subtle mt-1 text-[10px] leading-tight">
              Verified against official public holidays and venue closure dates.
            </p>
            {/* Decorative bottom wave */}
            <svg
              className="absolute right-0 bottom-0 left-0 h-4 w-full opacity-35"
              viewBox="0 0 100 20"
              preserveAspectRatio="none"
              fill="none"
            >
              <path d="M0 15 C 30 5, 70 25, 100 12 L 100 20 L 0 20 Z" fill="var(--accent)" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── CARD 2: EVENT TIMELINE & MILESTONES ── */}
      <div className="bg-surface/90 rounded-3xl border border-[var(--border-strong)] p-4 shadow-[var(--shadow-lg)] backdrop-blur-xl transition-all duration-300 hover:border-[var(--accent-line)] sm:p-4.5">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-[var(--accent)]" />
            <span className="text-fg text-xs font-extrabold">Event Timeline & Milestones</span>
          </div>
          <span className="bg-surface-2 text-fg-muted rounded-full border border-[var(--border)] px-2.5 py-0.5 text-[10px] font-semibold">
            6-Month Runway
          </span>
        </div>

        {/* Milestone Steps with connecting vertical track */}
        <div className="mt-3.5 space-y-3">
          {/* Entry 1 */}
          <div className="relative flex items-center justify-between pl-6 text-xs">
            {/* Connecting line to Entry 2 */}
            <div className="absolute top-1/2 bottom-[-16px] left-[7px] w-[2px] bg-gradient-to-b from-emerald-500/60 to-amber-500/60" />
            {/* Milestone Dot 1 */}
            <span className="absolute top-1/2 left-1 z-10 size-2 -translate-y-1/2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
            <span className="text-fg-muted pr-2 text-[10px] font-medium sm:text-[11px]">
              6 Months: Venue Permits & Deposit Confirmed
            </span>
            <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-500">
              Confirmed
            </span>
          </div>

          {/* Entry 2 */}
          <div className="relative flex items-center justify-between pl-6 text-xs">
            {/* Connecting line to Entry 3 */}
            <div className="absolute top-1/2 bottom-[-16px] left-[7px] w-[2px] bg-gradient-to-b from-amber-500/60 to-orange-500/60" />
            {/* Milestone Dot 2 */}
            <span className="absolute top-1/2 left-1 z-10 size-2 -translate-y-1/2 rounded-full bg-amber-500 ring-4 ring-amber-500/20" />
            <span className="text-fg-muted pr-2 text-[10px] font-medium sm:text-[11px]">
              3 Months: Catering Tasting & Custom Menus
            </span>
            <span className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold text-amber-500">
              In Progress
            </span>
          </div>

          {/* Entry 3 */}
          <div className="relative flex items-center justify-between pl-6 text-xs">
            {/* Milestone Dot 3 */}
            <span className="absolute top-1/2 left-1 z-10 size-2 -translate-y-1/2 rounded-full bg-orange-500 ring-4 ring-orange-500/20" />
            <span className="text-fg-muted pr-2 text-[10px] font-medium sm:text-[11px]">
              48 Hours: Final Run-Sheet & Rain Backup Ready
            </span>
            <span className="shrink-0 rounded-full border border-orange-500/30 bg-orange-500/15 px-2.5 py-0.5 text-[10px] font-bold text-orange-500">
              Ready
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
