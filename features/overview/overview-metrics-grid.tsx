'use client';

import Link from 'next/link';
import {
  DollarSign,
  Clock,
  ClipboardList,
  Lightbulb,
  Bot,
  Download,
  ArrowRight,
} from 'lucide-react';
import type { EventPlan } from '@/lib/schemas/event-plan';
import { formatMinorUnits } from '@/lib/domain/budget-math';

export function OverviewMetricsGrid({ plan }: { readonly plan: EventPlan }) {
  const totalAllocatedMinor = plan.budgetItems.reduce((acc, it) => acc + it.allocatedMinor, 0);
  const totalSpentMinor = plan.budgetItems.reduce((acc, it) => acc + it.spentMinor, 0);
  const remainingMinor = Math.max(0, plan.totalBudgetMinor - totalSpentMinor);

  const completedMilestones = plan.timelineItems.filter((t) => t.status === 'completed').length;
  const totalMilestones = plan.timelineItems.length;
  const timelineProgressPct =
    totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  const bookedVendors = plan.vendorItems.filter(
    (v) => v.status === 'booked' || v.status === 'paid',
  ).length;
  const totalVendors = plan.vendorItems.length;

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {/* 1. Budget Card */}
      <div className="group bg-surface-2 relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--border-faint)] p-6 shadow-[var(--shadow-sm)] transition-all hover:border-[var(--accent-line)] hover:shadow-[var(--shadow-md)]">
        <div>
          <div className="flex items-center justify-between">
            <span className="bg-surface-3 text-accent flex size-10 items-center justify-center rounded-xl border border-[var(--border)] shadow-inner">
              <DollarSign className="size-5" />
            </span>
            <span className="text-fg-muted text-xs font-bold tracking-wider uppercase">
              {plan.budgetItems.length} Categories
            </span>
          </div>
          <h3 className="text-fg mt-4 text-lg font-bold">Budget Planner</h3>
          <p className="text-fg-muted mt-1 text-xs leading-relaxed">
            Integer-normalized minor units with Hamilton-Hare allocation & zero rounding errors.
          </p>
          <div className="mt-4 space-y-1">
            <div className="text-fg font-mono text-xl font-black">
              {formatMinorUnits(plan.totalBudgetMinor, plan.currency)}
            </div>
            <div className="text-fg-muted text-xs font-medium">
              Allocated: {formatMinorUnits(totalAllocatedMinor, plan.currency)} • Remaining:{' '}
              {formatMinorUnits(remainingMinor, plan.currency)}
            </div>
          </div>
        </div>
        <div className="mt-4 border-t border-[var(--border)]/60 pt-5">
          <Link
            href="/plan/budget"
            id="quick-link-budget"
            className="group/btn bg-surface-3 text-fg hover:bg-surface hover:text-accent inline-flex w-full cursor-pointer items-center justify-between rounded-xl border border-[var(--border-strong)] px-4 py-2.5 text-xs font-bold transition-all hover:border-[var(--accent-line)]"
          >
            <span>Manage Allocations & Actuals</span>
            <ArrowRight className="size-3.5 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* 2. Timeline Card */}
      <div className="group bg-surface-2 relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--border-faint)] p-6 shadow-[var(--shadow-sm)] transition-all hover:border-[var(--accent-line)] hover:shadow-[var(--shadow-md)]">
        <div>
          <div className="flex items-center justify-between">
            <span className="bg-surface-3 text-caution flex size-10 items-center justify-center rounded-xl border border-[var(--border)] shadow-inner">
              <Clock className="size-5" />
            </span>
            <span className="text-fg-muted text-xs font-bold tracking-wider uppercase">
              {timelineProgressPct}% Completed
            </span>
          </div>
          <h3 className="text-fg mt-4 text-lg font-bold">Timeline & Milestones</h3>
          <p className="text-fg-muted mt-1 text-xs leading-relaxed">
            Reverse-planned scheduling, public holiday clash detection, and RFC 5545 export.
          </p>
          <div className="mt-4 space-y-1">
            <div className="text-fg font-mono text-xl font-black">
              {completedMilestones} / {totalMilestones} Milestones
            </div>
            <div className="text-fg-muted truncate text-xs font-medium">
              Next:{' '}
              {plan.timelineItems.find((t) => t.status !== 'completed')?.title ?? 'All completed!'}
            </div>
          </div>
        </div>
        <div className="mt-4 border-t border-[var(--border)]/60 pt-5">
          <Link
            href="/plan/timeline"
            id="quick-link-timeline"
            className="group/btn bg-surface-3 text-fg hover:bg-surface hover:text-accent inline-flex w-full cursor-pointer items-center justify-between rounded-xl border border-[var(--border-strong)] px-4 py-2.5 text-xs font-bold transition-all hover:border-[var(--accent-line)]"
          >
            <span>View Milestone Schedule</span>
            <ArrowRight className="size-3.5 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* 3. Vendors Card */}
      <div className="group bg-surface-2 relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--border-faint)] p-6 shadow-[var(--shadow-sm)] transition-all hover:border-[var(--accent-line)] hover:shadow-[var(--shadow-md)]">
        <div>
          <div className="flex items-center justify-between">
            <span className="bg-surface-3 text-positive flex size-10 items-center justify-center rounded-xl border border-[var(--border)] shadow-inner">
              <ClipboardList className="size-5" />
            </span>
            <span className="text-fg-muted text-xs font-bold tracking-wider uppercase">
              {bookedVendors} / {totalVendors} Booked
            </span>
          </div>
          <h3 className="text-fg mt-4 text-lg font-bold">Vendor Checklist</h3>
          <p className="text-fg-muted mt-1 text-xs leading-relaxed">
            Event-specific supplier checklist & live nearby OpenStreetMap venue discovery.
          </p>
          <div className="mt-4 space-y-1">
            <div className="text-fg font-mono text-xl font-black">
              {totalVendors} Core Categories
            </div>
            <div className="text-fg-muted text-xs font-medium">
              Location: {plan.location} (OSM geocoding ready)
            </div>
          </div>
        </div>
        <div className="mt-4 border-t border-[var(--border)]/60 pt-5">
          <Link
            href="/plan/vendors"
            id="quick-link-vendors"
            className="group/btn bg-surface-3 text-fg hover:bg-surface hover:text-accent inline-flex w-full cursor-pointer items-center justify-between rounded-xl border border-[var(--border-strong)] px-4 py-2.5 text-xs font-bold transition-all hover:border-[var(--accent-line)]"
          >
            <span>Open Vendor Checklist</span>
            <ArrowRight className="size-3.5 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* 4. Personalized Ideas Card */}
      <div className="group bg-surface-2 relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--border-faint)] p-6 shadow-[var(--shadow-sm)] transition-all hover:border-[var(--accent-line)] hover:shadow-[var(--shadow-md)]">
        <div>
          <div className="flex items-center justify-between">
            <span className="bg-surface-3 text-accent flex size-10 items-center justify-center rounded-xl border border-[var(--border)] shadow-inner">
              <Lightbulb className="size-5" />
            </span>
            <span className="text-fg-muted text-xs font-bold tracking-wider uppercase">
              {plan.ideas.length} Saved
            </span>
          </div>
          <h3 className="text-fg mt-4 text-lg font-bold">Personalized Ideas</h3>
          <p className="text-fg-muted mt-1 text-xs leading-relaxed">
            Tailored activities, themes, and dietary-respectful menus streamed with Gemini.
          </p>
          <div className="mt-4 space-y-1">
            <div className="text-fg font-mono text-xl font-black">AI Ideation Studio</div>
            <div className="text-fg-muted text-xs font-medium">
              Zero canned replies • Atomic schema validation
            </div>
          </div>
        </div>
        <div className="mt-4 border-t border-[var(--border)]/60 pt-5">
          <Link
            href="/plan/ideas"
            id="quick-link-ideas"
            className="group/btn bg-surface-3 text-fg hover:bg-surface hover:text-accent inline-flex w-full cursor-pointer items-center justify-between rounded-xl border border-[var(--border-strong)] px-4 py-2.5 text-xs font-bold transition-all hover:border-[var(--accent-line)]"
          >
            <span>Stream Personalized Ideas</span>
            <ArrowRight className="size-3.5 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* 5. AI Assistant Card */}
      <div className="group bg-surface-2 relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--border-faint)] p-6 shadow-[var(--shadow-sm)] transition-all hover:border-[var(--accent-line)] hover:shadow-[var(--shadow-md)]">
        <div>
          <div className="flex items-center justify-between">
            <span className="bg-surface-3 text-neutral flex size-10 items-center justify-center rounded-xl border border-[var(--border)] shadow-inner">
              <Bot className="size-5" />
            </span>
            <span className="text-fg-muted text-xs font-bold tracking-wider uppercase">
              Live Assistant
            </span>
          </div>
          <h3 className="text-fg mt-4 text-lg font-bold">Planning Assistant</h3>
          <p className="text-fg-muted mt-1 text-xs leading-relaxed">
            Context-aware planning chat grounded in your real budget and timeline.
          </p>
          <div className="mt-4 space-y-1">
            <div className="text-fg font-mono text-xl font-black">Interactive Co-Planner</div>
            <div className="text-fg-muted text-xs font-medium">
              Supports cancellation, retries & weather context
            </div>
          </div>
        </div>
        <div className="mt-4 border-t border-[var(--border)]/60 pt-5">
          <Link
            href="/plan/assistant"
            id="quick-link-assistant"
            className="group/btn bg-surface-3 text-fg hover:bg-surface hover:text-accent inline-flex w-full cursor-pointer items-center justify-between rounded-xl border border-[var(--border-strong)] px-4 py-2.5 text-xs font-bold transition-all hover:border-[var(--accent-line)]"
          >
            <span>Consult Planning Assistant</span>
            <ArrowRight className="size-3.5 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* 6. Portability Card */}
      <div className="group bg-surface-2 relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--border-faint)] p-6 shadow-[var(--shadow-sm)] transition-all hover:border-[var(--accent-line)] hover:shadow-[var(--shadow-md)]">
        <div>
          <div className="flex items-center justify-between">
            <span className="bg-surface-3 text-fg flex size-10 items-center justify-center rounded-xl border border-[var(--border)] shadow-inner">
              <Download className="size-5" />
            </span>
            <span className="text-fg-muted text-xs font-bold tracking-wider uppercase">
              Local Storage
            </span>
          </div>
          <h3 className="text-fg mt-4 text-lg font-bold">Export & Portability</h3>
          <p className="text-fg-muted mt-1 text-xs leading-relaxed">
            JSON backup, printable summary, RFC 5545 calendar export, and data controls.
          </p>
          <div className="mt-4 space-y-1">
            <div className="text-fg font-mono text-xl font-black">Complete Data Freedom</div>
            <div className="text-fg-muted text-xs font-medium">
              Zero tracking • Private browser storage
            </div>
          </div>
        </div>
        <div className="mt-4 border-t border-[var(--border)]/60 pt-5">
          <Link
            href="/plan/export"
            id="quick-link-export"
            className="group/btn bg-surface-3 text-fg hover:bg-surface hover:text-accent inline-flex w-full cursor-pointer items-center justify-between rounded-xl border border-[var(--border-strong)] px-4 py-2.5 text-xs font-bold transition-all hover:border-[var(--accent-line)]"
          >
            <span>Export, Print & Backup</span>
            <ArrowRight className="size-3.5 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
