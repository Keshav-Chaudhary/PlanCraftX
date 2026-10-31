'use client';

import Link from 'next/link';
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
    <div className="border-border bg-surface rounded-xl border p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-muted text-xs font-semibold tracking-wider uppercase">
            Event Overview • {plan.eventType.toUpperCase()}
          </span>
          <h1 className="text-foreground mt-1 text-2xl font-extrabold tracking-tight">
            {plan.title}
          </h1>
          <p className="text-muted mt-1 text-sm">
            📍 {plan.location} • 👥 {plan.guestCount} Guests • 🗓️ {plan.eventDate} ({countdownText})
          </p>
        </div>
        <Link
          href="/plan/event"
          className="border-border bg-surface hover:bg-surface-elevated text-foreground inline-flex items-center rounded-lg border px-4 py-2 text-xs font-semibold shadow-xs transition-colors"
        >
          ✏️ Reconfigure Parameters
        </Link>
      </div>

      {(plan.dietaryRequirements || plan.accessibilityNeeds || plan.isOutdoor) && (
        <div className="mt-4 flex flex-wrap gap-2 border-t pt-4 text-xs">
          {plan.isOutdoor && (
            <span className="bg-accent/10 text-accent rounded-md px-2 py-1 font-medium">
              🌲 Outdoor Venue
            </span>
          )}
          {plan.dietaryRequirements && (
            <span className="bg-surface-elevated text-foreground rounded-md px-2 py-1 font-medium">
              🥗 Dietary: {plan.dietaryRequirements}
            </span>
          )}
          {plan.accessibilityNeeds && (
            <span className="bg-surface-elevated text-foreground rounded-md px-2 py-1 font-medium">
              ♿ Accessibility: {plan.accessibilityNeeds}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
