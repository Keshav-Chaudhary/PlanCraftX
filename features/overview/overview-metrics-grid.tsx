'use client';

import Link from 'next/link';
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* 1. Budget Card */}
      <div className="border-border bg-surface hover:border-primary/40 flex flex-col justify-between rounded-2xl border p-5 shadow-xs transition">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xl" aria-hidden="true">
              💰
            </span>
            <span className="text-muted text-xs font-semibold">
              {plan.budgetItems.length} Categories
            </span>
          </div>
          <h3 className="text-foreground mt-3 text-base font-bold">Budget Planner</h3>
          <p className="text-muted mt-1 text-xs">
            Integer-normalized minor units with zero hardcoded percentage tables.
          </p>
          <div className="mt-4 space-y-1">
            <div className="text-foreground font-mono text-lg font-extrabold">
              {formatMinorUnits(plan.totalBudgetMinor, plan.currency)}
            </div>
            <div className="text-muted text-xs">
              Allocated: {formatMinorUnits(totalAllocatedMinor, plan.currency)} • Remaining:{' '}
              {formatMinorUnits(remainingMinor, plan.currency)}
            </div>
          </div>
        </div>
        <div className="pt-4">
          <Link
            href="/plan/budget"
            id="quick-link-budget"
            className="bg-primary/10 text-primary hover:bg-primary/20 inline-flex w-full items-center justify-center rounded-xl py-2.5 text-xs font-semibold transition"
          >
            Manage Allocations & Actuals →
          </Link>
        </div>
      </div>

      {/* 2. Timeline Card */}
      <div className="border-border bg-surface hover:border-primary/40 flex flex-col justify-between rounded-2xl border p-5 shadow-xs transition">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xl" aria-hidden="true">
              📅
            </span>
            <span className="text-muted text-xs font-semibold">
              {timelineProgressPct}% Completed
            </span>
          </div>
          <h3 className="text-foreground mt-3 text-base font-bold">Timeline & Milestones</h3>
          <p className="text-muted mt-1 text-xs">
            Reverse-planned scheduling, holiday clash detection, and RFC 5545 export.
          </p>
          <div className="mt-4 space-y-1">
            <div className="text-foreground font-mono text-lg font-extrabold">
              {completedMilestones} / {totalMilestones} Milestones
            </div>
            <div className="text-muted text-xs">
              Next:{' '}
              {plan.timelineItems.find((t) => t.status !== 'completed')?.title ?? 'All completed!'}
            </div>
          </div>
        </div>
        <div className="pt-4">
          <Link
            href="/plan/timeline"
            id="quick-link-timeline"
            className="bg-primary/10 text-primary hover:bg-primary/20 inline-flex w-full items-center justify-center rounded-xl py-2.5 text-xs font-semibold transition"
          >
            View Milestone Schedule →
          </Link>
        </div>
      </div>

      {/* 3. Vendors Card */}
      <div className="border-border bg-surface hover:border-primary/40 flex flex-col justify-between rounded-2xl border p-5 shadow-xs transition">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xl" aria-hidden="true">
              📋
            </span>
            <span className="text-muted text-xs font-semibold">
              {bookedVendors} / {totalVendors} Booked
            </span>
          </div>
          <h3 className="text-foreground mt-3 text-base font-bold">Vendor Checklist</h3>
          <p className="text-muted mt-1 text-xs">
            Event-specific supplier checklist & live nearby OpenStreetMap venue discovery.
          </p>
          <div className="mt-4 space-y-1">
            <div className="text-foreground font-mono text-lg font-extrabold">
              {totalVendors} Core Categories
            </div>
            <div className="text-muted text-xs">
              Location: {plan.location} (OSM geocoding ready)
            </div>
          </div>
        </div>
        <div className="pt-4">
          <Link
            href="/plan/vendors"
            id="quick-link-vendors"
            className="bg-primary/10 text-primary hover:bg-primary/20 inline-flex w-full items-center justify-center rounded-xl py-2.5 text-xs font-semibold transition"
          >
            Open Vendor Checklist →
          </Link>
        </div>
      </div>

      {/* 4. Personalized Ideas Card */}
      <div className="border-border bg-surface hover:border-primary/40 flex flex-col justify-between rounded-2xl border p-5 shadow-xs transition">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xl" aria-hidden="true">
              💡
            </span>
            <span className="text-muted text-xs font-semibold">{plan.ideas.length} Saved</span>
          </div>
          <h3 className="text-foreground mt-3 text-base font-bold">Personalized Ideas</h3>
          <p className="text-muted mt-1 text-xs">
            Tailored activities, themes, and dietary-respectful menus streamed with Gemini.
          </p>
          <div className="mt-4 space-y-1">
            <div className="text-foreground text-lg font-extrabold">AI Ideation Studio</div>
            <div className="text-muted text-xs">Zero canned replies • Atomic schema validation</div>
          </div>
        </div>
        <div className="pt-4">
          <Link
            href="/plan/ideas"
            id="quick-link-ideas"
            className="bg-primary/10 text-primary hover:bg-primary/20 inline-flex w-full items-center justify-center rounded-xl py-2.5 text-xs font-semibold transition"
          >
            Stream Personalized Ideas →
          </Link>
        </div>
      </div>

      {/* 5. AI Assistant Card */}
      <div className="border-border bg-surface hover:border-primary/40 flex flex-col justify-between rounded-2xl border p-5 shadow-xs transition">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xl" aria-hidden="true">
              🤖
            </span>
            <span className="text-muted text-xs font-semibold">Live Assistant</span>
          </div>
          <h3 className="text-foreground mt-3 text-base font-bold">Planning Assistant</h3>
          <p className="text-muted mt-1 text-xs">
            Context-aware planning chat grounded in your real budget and timeline.
          </p>
          <div className="mt-4 space-y-1">
            <div className="text-foreground text-lg font-extrabold">Interactive Co-Planner</div>
            <div className="text-muted text-xs">
              Supports cancellation, retries & weather context
            </div>
          </div>
        </div>
        <div className="pt-4">
          <Link
            href="/plan/assistant"
            id="quick-link-assistant"
            className="bg-primary/10 text-primary hover:bg-primary/20 inline-flex w-full items-center justify-center rounded-xl py-2.5 text-xs font-semibold transition"
          >
            Consult Planning Assistant →
          </Link>
        </div>
      </div>

      {/* 6. Portability Card */}
      <div className="border-border bg-surface hover:border-primary/40 flex flex-col justify-between rounded-2xl border p-5 shadow-xs transition">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xl" aria-hidden="true">
              💾
            </span>
            <span className="text-muted text-xs font-semibold">Local Storage</span>
          </div>
          <h3 className="text-foreground mt-3 text-base font-bold">Export & Portability</h3>
          <p className="text-muted mt-1 text-xs">
            JSON backup, printable summary, RFC 5545 calendar export, and data controls.
          </p>
          <div className="mt-4 space-y-1">
            <div className="text-foreground text-lg font-extrabold">Complete Data Freedom</div>
            <div className="text-muted text-xs">Zero tracking • Private browser storage</div>
          </div>
        </div>
        <div className="pt-4">
          <Link
            href="/plan/export"
            id="quick-link-export"
            className="bg-primary/10 text-primary hover:bg-primary/20 inline-flex w-full items-center justify-center rounded-xl py-2.5 text-xs font-semibold transition"
          >
            Export, Print & Backup →
          </Link>
        </div>
      </div>
    </div>
  );
}
