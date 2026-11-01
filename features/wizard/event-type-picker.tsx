'use client';

import { Heart, Cake, Users } from 'lucide-react';
import type { EventTypeEnum } from '@/lib/schemas/event-plan';

interface EventTypePickerProps {
  readonly selected: EventTypeEnum;
  readonly onSelect: (type: EventTypeEnum) => void;
}

export function EventTypePicker({ selected, onSelect }: EventTypePickerProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-fg text-sm font-bold tracking-tight">
        Select Occasion Archetype
      </legend>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => onSelect('wedding')}
          aria-pressed={selected === 'wedding'}
          className={`group flex cursor-pointer flex-col items-center rounded-2xl border p-5 text-center transition-all ${
            selected === 'wedding'
              ? 'border-accent bg-accent-subtle/40 text-accent ring-accent font-bold shadow-[0_0_20px_var(--accent-line)] ring-1'
              : 'bg-surface-3/60 hover:bg-surface-3 hover:border-border text-fg border-[var(--border-strong)]'
          }`}
        >
          <span
            className={`mb-2 flex size-11 items-center justify-center rounded-xl transition-colors ${
              selected === 'wedding' ? 'bg-accent text-white shadow-xs' : 'bg-surface text-fg-muted'
            }`}
            aria-hidden="true"
          >
            <Heart className="size-5" />
          </span>
          <span className="text-fg mt-1 text-sm font-bold">Wedding</span>
          <span className="text-fg-muted mt-0.5 text-xs font-normal">Ceremony & Reception</span>
        </button>

        <button
          type="button"
          onClick={() => onSelect('birthday')}
          aria-pressed={selected === 'birthday'}
          className={`group flex cursor-pointer flex-col items-center rounded-2xl border p-5 text-center transition-all ${
            selected === 'birthday'
              ? 'border-caution bg-caution-subtle/30 text-caution ring-caution font-bold shadow-[0_0_20px_rgba(245,158,11,0.2)] ring-1'
              : 'bg-surface-3/60 hover:bg-surface-3 hover:border-border text-fg border-[var(--border-strong)]'
          }`}
        >
          <span
            className={`mb-2 flex size-11 items-center justify-center rounded-xl transition-colors ${
              selected === 'birthday'
                ? 'bg-caution text-white shadow-xs'
                : 'bg-surface text-fg-muted'
            }`}
            aria-hidden="true"
          >
            <Cake className="size-5" />
          </span>
          <span className="text-fg mt-1 text-sm font-bold">Birthday</span>
          <span className="text-fg-muted mt-0.5 text-xs font-normal">Milestones & Parties</span>
        </button>

        <button
          type="button"
          onClick={() => onSelect('community')}
          aria-pressed={selected === 'community'}
          className={`group flex cursor-pointer flex-col items-center rounded-2xl border p-5 text-center transition-all ${
            selected === 'community'
              ? 'border-positive bg-positive-subtle/30 text-positive ring-positive font-bold shadow-[0_0_20px_rgba(16,185,129,0.2)] ring-1'
              : 'bg-surface-3/60 hover:bg-surface-3 hover:border-border text-fg border-[var(--border-strong)]'
          }`}
        >
          <span
            className={`mb-2 flex size-11 items-center justify-center rounded-xl transition-colors ${
              selected === 'community'
                ? 'bg-positive text-white shadow-xs'
                : 'bg-surface text-fg-muted'
            }`}
            aria-hidden="true"
          >
            <Users className="size-5" />
          </span>
          <span className="text-fg mt-1 text-sm font-bold">Community Event</span>
          <span className="text-fg-muted mt-0.5 text-xs font-normal">Festivals & Gatherings</span>
        </button>
      </div>
    </fieldset>
  );
}
