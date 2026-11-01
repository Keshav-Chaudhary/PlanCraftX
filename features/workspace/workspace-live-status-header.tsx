'use client';

import React from 'react';
import Link from 'next/link';
import { CalendarDays, MapPin, Layers, Download, Plus, Settings } from 'lucide-react';
import type { EventPlan } from '@/lib/schemas/event-plan';

interface WorkspaceLiveStatusHeaderProps {
  readonly plan: EventPlan | null;
  readonly onOpenSettings?: () => void;
}

export function WorkspaceLiveStatusHeader({
  plan,
  onOpenSettings,
}: WorkspaceLiveStatusHeaderProps) {
  const eventTitle = plan?.title || 'Preview Celebration Plan';
  const location = plan?.location || 'San Francisco, CA';
  const status = plan ? 'READY' : 'PREVIEW';

  return (
    <div className="bg-surface-2 border-border-strong animate-in slide-in-from-top-2 flex w-full shrink-0 flex-col justify-between gap-4 border-b px-4 py-2.5 sm:flex-row sm:items-center md:px-8">
      {/* Left: Live Analysis Status */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-red-500" />
          </span>
          <span className="text-[10px] font-black tracking-widest text-red-500 uppercase">
            Live
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 text-[var(--accent)]" />
            <span
              className="text-fg max-w-[200px] truncate text-sm font-bold lg:max-w-xs"
              title={eventTitle}
            >
              {eventTitle}
            </span>
          </div>
          <div className="bg-surface-3 border-border-strong text-accent rounded-md border px-2.5 py-0.5 text-xs font-black shadow-inner">
            {status} • Grounded Telemetry
          </div>
        </div>

        <div className="bg-border-faint hidden h-5 w-px sm:block" />

        {/* Context metadata */}
        <div className="text-fg-muted hidden items-center gap-4 text-xs font-medium md:flex">
          <div className="flex items-center gap-1.5">
            <MapPin className="text-fg-subtle size-3.5" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Layers className="text-fg-subtle size-3.5" />
            <span>Penny-Accurate Integer Math</span>
          </div>
        </div>
      </div>

      {/* Right: Quick Action Buttons */}
      <div className="flex shrink-0 items-center gap-2 self-stretch sm:self-auto">
        <button
          type="button"
          onClick={() => {
            if (onOpenSettings) onOpenSettings();
            else if (typeof window !== 'undefined') window.location.href = '/settings/privacy';
          }}
          className="bg-surface-2 hover:bg-surface-3 text-fg-muted hover:text-fg inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[var(--border)] px-3 py-1.5 text-xs font-bold transition-all"
          title="Workspace Settings & Account"
        >
          <Settings className="text-accent size-3.5" />
          <span>Settings</span>
        </button>
        <Link
          href="/plan/event"
          className="bg-surface-2 hover:bg-surface-3 text-fg inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] px-3 py-1.5 text-xs font-bold transition-all"
        >
          <Plus className="size-3.5" />
          <span>{plan ? 'Edit Event' : 'New Event'}</span>
        </Link>
        <Link
          href="/plan/export"
          className="bg-accent text-accent-fg hover:bg-accent-strong inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold shadow-xs transition-all"
        >
          <Download className="size-3.5" />
          <span>Export Plan</span>
        </Link>
      </div>
    </div>
  );
}
