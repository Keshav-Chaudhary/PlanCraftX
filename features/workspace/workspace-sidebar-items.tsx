'use client';

import React from 'react';
import Link from 'next/link';
import { PlusCircle, SquareArrowOutUpRight, Settings } from 'lucide-react';
import type { EventPlan } from '@/lib/schemas/event-plan';

export interface SidebarAnalysisItemDef {
  id: string;
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number | undefined;
}

export function ActiveTargetCard({
  plan,
  eventTitle,
}: {
  readonly plan: EventPlan | null;
  readonly eventTitle: string;
}) {
  return (
    <div className="border-b border-[var(--border-faint)] px-4 py-3 opacity-0 transition-all duration-300 group-hover:opacity-100">
      <div className="bg-surface/80 rounded-xl border border-[var(--border)] p-2.5">
        <div className="text-fg-subtle mb-1 flex items-center justify-between text-[10px] font-bold tracking-wider uppercase">
          <span>Active Target</span>
          <span className="text-positive font-extrabold">100% Grounded</span>
        </div>
        <div className="text-fg truncate text-xs font-bold" title={eventTitle}>
          {eventTitle}
        </div>
        <div className="text-fg-muted mt-0.5 truncate text-[10px]">
          {plan ? `${plan.guestCount} Guests • ${plan.eventType}` : 'No active plan loaded'}
        </div>
        <Link
          href="/plan/event"
          className="text-accent hover:text-accent-strong bg-accent-subtle/50 hover:bg-accent-subtle border-accent-line mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border py-1 text-[11px] font-bold transition-colors"
        >
          <PlusCircle className="size-3" />
          <span>{plan ? 'Edit Event Details' : 'Create New Event'}</span>
        </Link>
      </div>
    </div>
  );
}

export function SidebarAnalysisList({
  items,
  normalizedPath,
}: {
  readonly items: SidebarAnalysisItemDef[];
  readonly normalizedPath: string;
}) {
  return (
    <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
      {items.map((item) => {
        const itemPath = (item.href ? item.href.replace(/\/+$/, '') : '') || '/plan';
        const active =
          itemPath === '/plan' ? normalizedPath === '/plan' : normalizedPath.startsWith(itemPath);
        const Icon = item.icon;
        return (
          <li key={item.id}>
            <Link
              href={item.href}
              id={`sidebar-tab-${item.id}`}
              className={`group/link relative flex w-full items-center gap-3.5 rounded-xl px-3 py-2.5 text-left text-sm transition-all ${
                active
                  ? 'text-fg bg-gradient-to-r from-[var(--accent-subtle)] to-transparent font-bold shadow-xs'
                  : 'text-fg-muted hover:bg-surface-3 hover:text-fg font-medium'
              }`}
            >
              <div
                className={`flex size-7 shrink-0 items-center justify-center rounded-lg transition-all ${
                  active
                    ? 'bg-[var(--accent)] text-white shadow-[0_0_12px_var(--accent-line)]'
                    : 'text-fg-subtle group-hover/link:text-fg'
                }`}
              >
                <Icon className="size-4 shrink-0" />
              </div>

              <span className="font-bold whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {item.label}
              </span>

              {item.count !== undefined && (
                <span
                  className={`ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-black opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${
                    active
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-surface-3 text-fg-muted border border-[var(--border)]'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function SidebarSecondaryList({
  items,
  onOpenSettings,
}: {
  readonly items: {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
  readonly onOpenSettings?: (() => void) | undefined;
}) {
  return (
    <ul className="m-0 flex list-none flex-col gap-1 p-0">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className="group/link text-fg-muted hover:bg-surface-3 hover:text-fg flex items-center gap-3 rounded-lg px-2.5 py-2 text-xs font-medium transition-all"
            >
              <span className="bg-surface-3 flex size-7 shrink-0 items-center justify-center rounded-md border border-[var(--border)] shadow-xs transition-colors group-hover/link:border-[var(--accent)] group-hover/link:text-[var(--accent)]">
                <Icon className="size-3.5 transition-transform group-hover/link:scale-110" />
              </span>
              <span className="whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {item.label}
              </span>
              <SquareArrowOutUpRight className="text-fg-subtle ml-auto size-3 opacity-0 transition-all group-hover:opacity-100 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 group-hover/link:text-[var(--accent)]" />
            </Link>
          </li>
        );
      })}
      <li>
        <button
          type="button"
          onClick={() => {
            if (onOpenSettings) onOpenSettings();
            else if (typeof window !== 'undefined') window.location.href = '/settings/privacy';
          }}
          className="group/link text-accent hover:bg-surface-3 flex w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-left text-xs font-bold transition-all"
        >
          <span className="bg-accent-subtle border-accent-line text-accent flex size-7 shrink-0 items-center justify-center rounded-md border shadow-xs transition-colors">
            <Settings className="size-3.5 transition-transform group-hover/link:rotate-90" />
          </span>
          <span className="whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            Workspace Settings
          </span>
        </button>
      </li>
    </ul>
  );
}
