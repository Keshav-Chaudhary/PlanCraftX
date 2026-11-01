'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Upload, Heart, Cake, Users } from 'lucide-react';

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
      className="bg-surface-2/80 custom-rise relative mx-auto max-w-2xl overflow-hidden rounded-3xl border border-[var(--border)] p-8 text-center shadow-[var(--shadow-md)] backdrop-blur-xl sm:p-12"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-1/2 -z-10 h-48 w-48 translate-x-1/2 rounded-full bg-[var(--accent-subtle)] blur-[80px]"
      />

      <div
        className="bg-accent-subtle text-accent mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--accent-line)] shadow-xs"
        aria-hidden="true"
      >
        <Sparkles className="size-8" />
      </div>

      <h2
        id="empty-plan-heading"
        className="text-fg mt-6 text-2xl font-black tracking-tight sm:text-3xl"
      >
        {title}
      </h2>

      <p className="text-fg-muted mx-auto mt-3 max-w-lg text-sm leading-relaxed sm:text-base">
        {description}
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={actionHref}
          className="group inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-8 text-sm font-bold text-[var(--accent-fg)] shadow-[var(--shadow-sm)] transition-all hover:-translate-y-0.5 hover:bg-[var(--accent-strong)] hover:shadow-[0_0_20px_var(--accent-line)]"
          id="empty-state-create-btn"
        >
          <span>{actionLabel}</span>
          <ArrowRight
            aria-hidden="true"
            className="size-4 transition-transform group-hover:translate-x-1"
          />
        </Link>
        <Link
          href="/plan/export"
          className="bg-surface-3 text-fg hover:bg-surface inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full border border-[var(--border-strong)] px-6 text-sm font-semibold transition-colors hover:border-[var(--accent-line)]"
        >
          <Upload className="text-fg-muted size-4" />
          <span>Import JSON Backup</span>
        </Link>
      </div>

      <div className="mt-10 border-t border-[var(--border)] pt-6">
        <span className="text-fg-muted block text-xs font-bold tracking-widest uppercase">
          Supported Event Types
        </span>
        <div className="mt-4 grid grid-cols-1 gap-2.5 text-xs sm:grid-cols-3">
          <span className="bg-surface-3 text-fg flex items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] p-3 font-semibold">
            <Heart className="text-accent size-4" />
            <span>Weddings</span>
          </span>
          <span className="bg-surface-3 text-fg flex items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] p-3 font-semibold">
            <Cake className="text-caution size-4" />
            <span>Milestone Birthdays</span>
          </span>
          <span className="bg-surface-3 text-fg flex items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] p-3 font-semibold">
            <Users className="text-positive size-4" />
            <span>Community Events</span>
          </span>
        </div>
      </div>
    </div>
  );
}
