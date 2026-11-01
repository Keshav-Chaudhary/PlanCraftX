'use client';

import Link from 'next/link';
import { MapPin, Users, Calendar, Sparkles, Edit3, TreePine } from 'lucide-react';
import type { EventPlan } from '@/lib/schemas/event-plan';

function getCountdownText(eventDate: string): string {
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
  const todayDay = String(today.getDate()).padStart(2, '0');
  const todayYMD = `${todayYear}-${todayMonth}-${todayDay}`;

  if (eventDate === todayYMD) {
    return 'Event is today!';
  }

  const todayMid = new Date(`${todayYMD}T00:00:00`);
  const eventDateObj = new Date(`${eventDate}T00:00:00`);
  const diffDays = Math.round(
    (eventDateObj.getTime() - todayMid.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays > 0) return `${diffDays} days remaining`;
  return `${Math.abs(diffDays)} days ago`;
}

export function OverviewSnapshotCard({ plan }: { readonly plan: EventPlan }) {
  const countdownText = getCountdownText(plan.eventDate);

  return (
    <div className="bg-surface-2/85 relative overflow-hidden rounded-2xl border border-[var(--border)] p-6 shadow-[var(--shadow-sm)] backdrop-blur-md transition-all hover:border-[var(--accent-line)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="border-accent-line bg-accent-subtle text-accent inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase">
              <Sparkles className="size-3" />
              Event Overview • {plan.eventType.toUpperCase()}
            </span>
          </div>
          <h1 className="text-fg mt-2 text-2xl font-black tracking-tight sm:text-3xl">
            {plan.title}
          </h1>
          <p className="text-fg-muted mt-2 flex flex-wrap items-center gap-3 text-xs font-medium sm:text-sm">
            <span className="flex items-center gap-1">
              <MapPin className="text-accent size-4" /> {plan.location}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Users className="text-accent size-4" /> {plan.guestCount} Guests
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="text-accent size-4" /> {plan.eventDate} ({countdownText})
            </span>
          </p>
        </div>
        <Link
          href="/plan/event"
          className="bg-surface-3 text-fg hover:text-accent focus-visible:ring-accent inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[var(--border-strong)] px-4 py-2 text-xs font-bold shadow-xs transition-all hover:border-[var(--accent-line)]"
        >
          <Edit3 className="size-3.5" />
          <span>Reconfigure Parameters</span>
        </Link>
      </div>

      {(plan.dietaryRequirements || plan.accessibilityNeeds || plan.isOutdoor) && (
        <div className="mt-5 flex flex-wrap gap-2 border-t border-[var(--border)] pt-4 text-xs">
          {plan.isOutdoor && (
            <span className="border-accent-line bg-accent-subtle text-accent inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-semibold">
              <TreePine className="size-3.5" />
              Outdoor Venue
            </span>
          )}
          {plan.dietaryRequirements && (
            <span className="bg-surface-3 text-fg inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-3 py-1 font-semibold">
              🥗 Dietary: {plan.dietaryRequirements}
            </span>
          )}
          {plan.accessibilityNeeds && (
            <span className="bg-surface-3 text-fg inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-3 py-1 font-semibold">
              ♿ Accessibility: {plan.accessibilityNeeds}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
