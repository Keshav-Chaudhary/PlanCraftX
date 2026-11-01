'use client';

import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  CalendarDays,
  DollarSign,
  Clock,
  ClipboardList,
  Lightbulb,
  MessageSquare,
  Download,
} from 'lucide-react';
import type { EventPlan } from '@/lib/schemas/event-plan';

interface WorkspaceMobileNavProps {
  readonly plan: EventPlan | null;
  readonly currentPath: string;
}

interface MobileTabDef {
  id: string;
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number | undefined;
}

function getMobileTabs(plan: EventPlan | null): MobileTabDef[] {
  const budgetCount = plan ? plan.budgetItems.length : undefined;
  const timelineCount = plan ? plan.timelineItems.length : undefined;
  const vendorCount = plan ? plan.vendorItems.length : undefined;
  const ideasCount = plan ? plan.ideas.length : undefined;

  return [
    { id: 'overview', href: '/plan', label: 'Overview', icon: LayoutDashboard },
    { id: 'event', href: '/plan/event', label: 'Setup', icon: CalendarDays },
    { id: 'budget', href: '/plan/budget', label: 'Budget', icon: DollarSign, count: budgetCount },
    {
      id: 'timeline',
      href: '/plan/timeline',
      label: 'Timeline',
      icon: Clock,
      count: timelineCount,
    },
    {
      id: 'vendors',
      href: '/plan/vendors',
      label: 'Vendors',
      icon: ClipboardList,
      count: vendorCount,
    },
    { id: 'ideas', href: '/plan/ideas', label: 'Ideas', icon: Lightbulb, count: ideasCount },
    { id: 'assistant', href: '/plan/assistant', label: 'AI Copilot', icon: MessageSquare },
    { id: 'export', href: '/plan/export', label: 'Export', icon: Download },
  ];
}

function MobileTabItem({
  item,
  normalizedPath,
}: {
  readonly item: MobileTabDef;
  readonly normalizedPath: string;
}) {
  const itemPath = item.href.replace(/\/+$/, '') || '/plan';
  const isActive =
    itemPath === '/plan' ? normalizedPath === '/plan' : normalizedPath.startsWith(itemPath);
  const Icon = item.icon;

  return (
    <li className="min-w-[58px] flex-1 snap-start">
      <Link
        href={item.href}
        id={`mobile-tab-${item.id}`}
        className={`flex w-full flex-col items-center gap-1 py-2 text-[10px] font-semibold transition-colors ${
          isActive ? 'font-bold text-[var(--accent)]' : 'text-fg-muted hover:text-fg'
        }`}
      >
        <div className="relative">
          <Icon className="size-4.5" />
          {Boolean(item.count && item.count > 0) && (
            <span className="bg-accent text-accent-fg absolute -top-1 -right-2 rounded-full px-1 py-0.5 text-[8px] leading-none font-bold">
              {item.count}
            </span>
          )}
        </div>
        <span className="max-w-[56px] truncate">{item.label}</span>
      </Link>
    </li>
  );
}

export function WorkspaceMobileNav({ plan, currentPath }: WorkspaceMobileNavProps) {
  const normalizedPath = currentPath.replace(/\/+$/, '') || '/plan';
  const mobileTabs = getMobileTabs(plan);

  return (
    <nav
      aria-label="Workspace mobile navigation"
      className="bg-surface/95 fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border)] pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <ul className="m-0 flex snap-x snap-mandatory list-none items-stretch overflow-x-auto p-0 [&::-webkit-scrollbar]:hidden">
        {mobileTabs.map((item) => (
          <MobileTabItem key={item.id} item={item} normalizedPath={normalizedPath} />
        ))}
      </ul>
    </nav>
  );
}
