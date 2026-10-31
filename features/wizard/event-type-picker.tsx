'use client';

import type { EventTypeEnum } from '@/lib/schemas/event-plan';

interface EventTypePickerProps {
  readonly selected: EventTypeEnum;
  readonly onSelect: (type: EventTypeEnum) => void;
}

export function EventTypePicker({ selected, onSelect }: EventTypePickerProps) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-foreground text-sm font-semibold">Event Type</legend>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => onSelect('wedding')}
          aria-pressed={selected === 'wedding'}
          className={`flex flex-col items-center rounded-lg border p-4 text-center transition-colors ${
            selected === 'wedding'
              ? 'border-primary bg-primary/10 text-primary font-bold'
              : 'border-border bg-surface hover:bg-surface-elevated text-foreground'
          }`}
        >
          <span className="text-2xl" aria-hidden="true">
            💍
          </span>
          <span className="mt-1">Wedding</span>
          <span className="text-muted mt-0.5 text-xs font-normal">Ceremony & Reception</span>
        </button>

        <button
          type="button"
          onClick={() => onSelect('birthday')}
          aria-pressed={selected === 'birthday'}
          className={`flex flex-col items-center rounded-lg border p-4 text-center transition-colors ${
            selected === 'birthday'
              ? 'border-primary bg-primary/10 text-primary font-bold'
              : 'border-border bg-surface hover:bg-surface-elevated text-foreground'
          }`}
        >
          <span className="text-2xl" aria-hidden="true">
            🎂
          </span>
          <span className="mt-1">Birthday</span>
          <span className="text-muted mt-0.5 text-xs font-normal">Milestones & Parties</span>
        </button>

        <button
          type="button"
          onClick={() => onSelect('community')}
          aria-pressed={selected === 'community'}
          className={`flex flex-col items-center rounded-lg border p-4 text-center transition-colors ${
            selected === 'community'
              ? 'border-primary bg-primary/10 text-primary font-bold'
              : 'border-border bg-surface hover:bg-surface-elevated text-foreground'
          }`}
        >
          <span className="text-2xl" aria-hidden="true">
            🤝
          </span>
          <span className="mt-1">Community</span>
          <span className="text-muted mt-0.5 text-xs font-normal">Permits & Outreach</span>
        </button>
      </div>
    </fieldset>
  );
}
