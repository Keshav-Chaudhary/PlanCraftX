'use client';

import React from 'react';
import {
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  CloudSun,
  Layers,
} from 'lucide-react';
import { Badge } from '@/features/ui/badge';

/**
 * Architectural Overlapping Layered Card Deck.
 * Replaces generic macOS window frames with an authentic, luxury
 * multi-layered celebration blueprint.
 */
export function HeroCommandDeck() {
  return (
    <div className="relative mx-auto w-full max-w-lg select-none lg:max-w-none">
      {/* Background Ambient Aura */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-8 -right-8 -bottom-8 -left-8 -z-10 rounded-full bg-[radial-gradient(circle_at_center,_var(--accent-subtle)_0%,_transparent_70%)] blur-2xl"
      />

      {/* Floating Sensor Satellite Pill (Top-Right Offset) */}
      <div className="animate-in fade-in slide-in-from-top-3 bg-surface/95 absolute -top-5 right-2 z-20 hidden items-center gap-2 rounded-full border border-[var(--accent-line)] px-3.5 py-1.5 shadow-[var(--shadow-md)] backdrop-blur-md sm:flex">
        <span className="relative flex size-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
        </span>
        <CloudSun className="text-caution size-3.5" />
        <span className="text-fg text-[11px] font-bold">
          Open-Meteo: 22°C Outdoor Contingency Active
        </span>
      </div>

      {/* ── CARD 1: Primary Blueprint & Budget Allocation Deck ── */}
      <div className="bg-surface/90 relative z-10 rounded-3xl border border-[var(--border-strong)] p-6 shadow-[var(--shadow-lg)] backdrop-blur-xl transition-all duration-300 hover:border-[var(--accent-line)] sm:p-7">
        {/* Card Header & Archetype Identity */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl border border-[var(--accent-line)] bg-[var(--accent-subtle)] text-[var(--accent)] shadow-xs">
              <Calendar className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-fg text-sm font-black tracking-tight">
                  Golden Jubilee Gala
                </span>
                <span className="rounded-md border border-[var(--accent-line)] bg-[var(--accent-subtle)] px-2 py-0.5 text-[9px] font-black tracking-wider text-[var(--accent)] uppercase">
                  PlanCraftX Engine v2.4 · Active Blueprint
                </span>
              </div>
              <p className="text-fg-muted text-xs">
                150 Guests · San Francisco, CA · Outdoor Garden
              </p>
            </div>
          </div>
          <Badge tone="positive" className="hidden text-[10px] font-bold uppercase sm:inline-flex">
            Live Grounded
          </Badge>
        </div>

        {/* Integer Allocation Progress Visualizer (Hamilton-Hare) */}
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-fg-subtle flex items-center gap-1.5 font-bold uppercase">
              <Layers className="size-3.5 text-[var(--accent)]" />
              Hamilton-Hare Budget Allocation
            </span>
            <span className="text-accent font-mono font-black">45,000 USD Total</span>
          </div>

          {/* Segmented Proportional Bar using CSS flex basis (zero percent literals) */}
          <div
            className="bg-surface-3 flex h-3 w-full overflow-hidden rounded-full border border-[var(--border)] p-0.5"
            role="progressbar"
            aria-label="Proportional budget breakdown"
            aria-valuenow={100}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="flex-[42] rounded-l-full bg-[var(--accent)] transition-all"
              title="Venue & Reception (42 points)"
            />
            <div
              className="flex-[31] bg-amber-500 transition-all"
              title="Catering & Bar (31 points)"
            />
            <div
              className="flex-[15] bg-sky-500 transition-all"
              title="Decor & Production (15 points)"
            />
            <div
              className="flex-[12] rounded-r-full bg-emerald-500 transition-all"
              title="Contingency Reserve (12 points)"
            />
          </div>

          {/* Micro legend */}
          <div className="text-fg-subtle flex flex-wrap items-center justify-between pt-1 text-[10px] font-medium">
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-[var(--accent)]" /> Venue (Primary Allocation)
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-amber-500" /> Catering & Bar
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-sky-500" /> Decor & Florals
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-emerald-500" /> Safety Reserve
            </span>
          </div>
        </div>

        {/* Real Grounded Intelligence Highlights */}
        <div className="mt-5 grid grid-cols-2 gap-3 pt-2">
          <div className="bg-surface-2 rounded-2xl border border-[var(--border)] p-3">
            <div className="text-fg-subtle text-[10px] font-bold uppercase">Minor-Unit Math</div>
            <div className="text-positive mt-0.5 font-mono text-xs font-black">
              Integer Normalized
            </div>
            <p className="text-fg-muted mt-1 text-[10px] leading-tight">
              Zero penny loss or allocation drift across all categories.
            </p>
          </div>

          <div className="bg-surface-2 rounded-2xl border border-[var(--border)] p-3">
            <div className="text-fg-subtle text-[10px] font-bold uppercase">Holiday Shield</div>
            <div className="text-accent mt-0.5 font-mono text-xs font-black">
              0 Conflicts Detected
            </div>
            <p className="text-fg-muted mt-1 text-[10px] leading-tight">
              Live Nager.Date verification for scheduling integrity.
            </p>
          </div>
        </div>
      </div>

      {/* ── CARD 2: Layered Offset Timeline Runsheet Deck ── */}
      <div className="bg-surface-2/80 -mt-6 mr-4 ml-4 rounded-3xl border border-[var(--border)] p-5 shadow-[var(--shadow-md)] backdrop-blur-md transition-all sm:mr-8 sm:ml-8 sm:p-6">
        <div className="flex items-center justify-between border-b border-[var(--border-faint)] pb-3">
          <div className="flex items-center gap-2">
            <Clock className="text-accent size-4" />
            <span className="text-fg text-xs font-bold tracking-tight">
              Reverse-Planned Runsheet
            </span>
          </div>
          <span className="text-fg-subtle font-mono text-[10px]">T-Minus 180 Days Sequence</span>
        </div>

        {/* Milestone Steps */}
        <div className="mt-3 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-3.5 text-emerald-400" />
              <span className="text-fg text-[11px] font-medium">
                T-180d: Venue Permit Confirmed
              </span>
            </div>
            <span className="text-positive text-[10px] font-bold">Locked</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="size-3.5 text-[var(--accent)]" />
              <span className="text-fg text-[11px] font-medium">
                T-90d: Catering Menu & Dietary Safe List
              </span>
            </div>
            <span className="text-accent text-[10px] font-bold">In Progress</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-caution size-3.5" />
              <span className="text-fg text-[11px] font-medium">
                T-48h: Weather Radar Rain Protocol
              </span>
            </div>
            <span className="text-caution text-[10px] font-bold">Armed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
