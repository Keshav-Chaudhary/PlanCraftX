'use client';

import React from 'react';
import Link from 'next/link';

export interface PlanEmptyStateProps {
  readonly title?: string;
  readonly description?: string;
  readonly actionLabel?: string;
  readonly actionHref?: string;
}

export function PlanEmptyState({
  title = 'No Active Event Plan Found',
  description = 'You have not set up an event plan yet. Create your plan to generate tailored integer-normalized budgets, reverse-planned timelines, vendor checklists, and personalized ideas.',
  actionLabel = 'Create Your First Event',
  actionHref = '/plan/event',
}: PlanEmptyStateProps) {
  return (
    <div
      role="region"
      aria-labelledby="empty-plan-heading"
      className="border-border bg-surface mx-auto max-w-2xl rounded-2xl border p-8 text-center shadow-sm sm:p-12"
    >
      <div
        className="bg-surface-elevated mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
        aria-hidden="true"
      >
        ✨
      </div>
      <h2
        id="empty-plan-heading"
        className="text-foreground mt-4 text-2xl font-bold tracking-tight"
      >
        {title}
      </h2>
      <p className="text-muted mx-auto mt-2 max-w-lg text-sm leading-relaxed sm:text-base">
        {description}
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={actionHref}
          className="bg-primary text-primary-fg inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold shadow-sm transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2"
          id="empty-state-create-btn"
        >
          {actionLabel}
        </Link>
        <Link
          href="/plan/export"
          className="border-border bg-surface hover:bg-surface-elevated text-foreground inline-flex items-center justify-center rounded-lg border px-5 py-3 text-sm font-medium transition-colors"
        >
          Import JSON Backup
        </Link>
      </div>

      <div className="border-border mt-8 border-t pt-6">
        <span className="text-muted block text-xs font-semibold tracking-wider uppercase">
          Supported Event Types
        </span>
        <div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
          <span className="bg-surface-elevated text-foreground rounded-lg p-2 font-medium">
            💍 Weddings
          </span>
          <span className="bg-surface-elevated text-foreground rounded-lg p-2 font-medium">
            🎂 Milestone Birthdays
          </span>
          <span className="bg-surface-elevated text-foreground rounded-lg p-2 font-medium">
            🤝 Community Events
          </span>
        </div>
      </div>
    </div>
  );
}
