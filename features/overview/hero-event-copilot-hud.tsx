'use client';

import React from 'react';
import { Calendar, Sparkles, CheckCircle2, ShieldCheck, CloudSun } from 'lucide-react';
import { Badge } from '@/features/ui/badge';

export function HeroEventCopilotHUD() {
  return (
    <div className="bg-surface/85 custom-rise relative overflow-hidden rounded-2xl border border-[var(--accent-line)] p-1 shadow-[0_0_50px_var(--accent-subtle)] backdrop-blur-xl">
      {/* Window Top Bar */}
      <div className="bg-surface-2/60 flex items-center justify-between border-b border-[var(--border-strong)] px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5" aria-hidden="true">
            <div className="size-2.5 rounded-full bg-red-500/80" />
            <div className="size-2.5 rounded-full bg-yellow-500/80" />
            <div className="size-2.5 rounded-full bg-green-500/80" />
          </div>
          <span className="text-fg-subtle ml-3 text-[10px] font-bold tracking-widest uppercase">
            PlanCraftX Engine v2.4 · Executive Workspace
          </span>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-[var(--accent-line)] bg-[var(--accent-subtle)] px-2.5 py-0.5 text-[10px] font-bold tracking-widest text-[var(--accent)] uppercase">
          <span className="size-1.5 animate-pulse rounded-full bg-[var(--accent)]" />
          Live Planning Copilot
        </span>
      </div>

      {/* Main Preview Screen */}
      <div className="space-y-4 p-5">
        {/* Event Header Banner */}
        <div className="bg-surface-2 border-border flex items-center justify-between rounded-xl border p-3">
          <div className="flex items-center gap-3">
            <div className="bg-accent-subtle text-accent flex size-9 items-center justify-center rounded-lg">
              <Calendar className="size-5" />
            </div>
            <div>
              <div className="text-fg text-xs font-bold">Golden Jubilee Anniversary Gala</div>
              <div className="text-fg-muted text-[11px]">
                150 Guests · San Francisco, CA · Outdoor Garden Venue
              </div>
            </div>
          </div>
          <Badge tone="positive" className="text-[10px] font-bold uppercase">
            Live Grounded Plan
          </Badge>
        </div>

        {/* Telemetry Metric Badges */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-surface-3 border-border rounded-lg border p-2.5">
            <div className="text-fg-subtle text-[10px] font-bold uppercase">Budget Engine</div>
            <div className="text-accent mt-1 text-sm font-black tracking-tight uppercase">
              Hamilton-Hare
            </div>
            <div className="text-positive text-[9px] font-medium">Exact Minor Units</div>
          </div>
          <div className="bg-surface-3 border-border rounded-lg border p-2.5">
            <div className="text-fg-subtle text-[10px] font-bold uppercase">Timeline Run-Sheet</div>
            <div className="text-caution mt-0.5 font-mono text-xl font-black">14</div>
            <div className="text-caution text-[9px] font-medium">Reverse-Planned</div>
          </div>
          <div className="bg-surface-3 border-border rounded-lg border p-2.5">
            <div className="text-fg-subtle text-[10px] font-bold uppercase">Public Holidays</div>
            <div className="text-neutral mt-0.5 font-mono text-xl font-black">0</div>
            <div className="text-positive text-[9px] font-medium">Nager.Date Verified</div>
          </div>
        </div>

        {/* Live Advisory Stream Item 1: Grounded Open-Meteo Weather */}
        <div className="border-caution/40 bg-caution-subtle/20 space-y-1.5 rounded-xl border p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CloudSun className="text-caution size-3.5" />
              <span className="text-fg text-xs font-bold">
                Open-Meteo Weather Advisory (48h Pre-Event)
              </span>
            </div>
            <Badge tone="caution" className="text-[9px]">
              Rain Contingency Active
            </Badge>
          </div>
          <p className="text-fg-muted line-clamp-2 text-xs leading-relaxed">
            Live telemetry for San Francisco (37.77°N, 122.41°W): 22°C max / 14°C min with elevated
            precipitation probability. Automated indoor backup layout & contingency run-sheet
            scheduled.
          </p>
          <div className="border-border/40 text-fg-subtle flex items-center justify-between border-t pt-1 text-[10px]">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="text-positive size-3" /> Grounded Open-Meteo API
            </span>
            <span className="text-positive font-bold">Confidence: Verified Grounded</span>
          </div>
        </div>

        {/* Live Advisory Stream Item 2: Grounded Vendor Proposal Analysis */}
        <div className="border-border bg-surface-2/70 space-y-1.5 rounded-xl border p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="text-accent size-3.5" />
              <span className="text-fg text-xs font-bold">
                Vendor Quote Analysis (Artisan Catering & Banquet)
              </span>
            </div>
            <Badge tone="accent" className="text-[9px]">
              Extracted Proposal
            </Badge>
          </div>
          <p className="text-fg-muted line-clamp-2 text-xs leading-relaxed">
            Parsed per-guest catering quotation for 150 attendees. Flagged unstated 18-percent
            service fee in subtotal. Auto-generated inquiry draft to confirm deposit & cancellation
            schedule.
          </p>
          <div className="border-border/40 text-fg-subtle flex items-center justify-between border-t pt-1 text-[10px]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="text-accent size-3" /> Gemini Structured Extraction
            </span>
            <span className="text-positive font-bold">Within Budget Envelope</span>
          </div>
        </div>
      </div>
    </div>
  );
}
