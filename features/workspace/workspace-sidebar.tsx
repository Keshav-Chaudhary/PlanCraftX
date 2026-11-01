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
  Home,
  BookOpen,
  Shield,
  Code2,
  Sparkles,
} from 'lucide-react';
import { ThemeToggle } from '@/features/theme-toggle';
import type { EventPlan } from '@/lib/schemas/event-plan';
import {
  ActiveTargetCard,
  SidebarAnalysisList,
  SidebarSecondaryList,
  type SidebarAnalysisItemDef,
} from './workspace-sidebar-items';

interface WorkspaceSidebarProps {
  readonly plan: EventPlan | null;
  readonly currentPath: string;
  readonly onOpenSettings?: (() => void) | undefined;
}

const secondaryItems = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'How It Works', href: '/how-it-works', icon: BookOpen },
  { label: 'Developer', href: '/developer', icon: Code2 },
  { label: 'Privacy & Data', href: '/settings/privacy', icon: Shield },
];

function getAnalysisItems(plan: EventPlan | null): SidebarAnalysisItemDef[] {
  const budgetCount = plan ? plan.budgetItems.length : undefined;
  const timelineCount = plan ? plan.timelineItems.length : undefined;
  const vendorCount = plan ? plan.vendorItems.length : undefined;
  const ideasCount = plan ? plan.ideas.length : undefined;

  return [
    { id: 'overview', href: '/plan', label: 'Overview & Summary', icon: LayoutDashboard },
    { id: 'event', href: '/plan/event', label: 'Event Setup', icon: CalendarDays },
    {
      id: 'budget',
      href: '/plan/budget',
      label: 'Budget & Math',
      icon: DollarSign,
      count: budgetCount,
    },
    {
      id: 'timeline',
      href: '/plan/timeline',
      label: 'Timeline & Dates',
      icon: Clock,
      count: timelineCount,
    },
    {
      id: 'vendors',
      href: '/plan/vendors',
      label: 'Vendors & Quotes',
      icon: ClipboardList,
      count: vendorCount,
    },
    {
      id: 'ideas',
      href: '/plan/ideas',
      label: 'AI Ideas Studio',
      icon: Lightbulb,
      count: ideasCount,
    },
    { id: 'assistant', href: '/plan/assistant', label: 'AI Copilot', icon: MessageSquare },
    { id: 'export', href: '/plan/export', label: 'Export & Backup', icon: Download },
  ];
}

export function WorkspaceSidebar({ plan, currentPath, onOpenSettings }: WorkspaceSidebarProps) {
  const normalizedPath = currentPath.replace(/\/+$/, '') || '/plan';
  const analysisItems = getAnalysisItems(plan);
  const eventTitle = plan ? plan.title : 'Sample Celebration Plan';

  return (
    <>
      <div className="hidden h-screen w-20 shrink-0 transition-[width] duration-300 md:block" />

      <aside
        aria-label="Planning Workspace Navigation"
        className="group bg-surface-2 fixed top-0 left-0 z-40 hidden h-screen w-20 overflow-hidden border-r border-[var(--border)] transition-all duration-300 hover:w-64 hover:shadow-2xl md:block"
      >
        <div className="relative flex h-full w-64 flex-col">
          <div className="pointer-events-none absolute -top-0 -left-20 -z-10 h-64 w-64 rounded-full bg-[var(--accent-subtle)] opacity-40 blur-[100px]" />

          <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-[var(--border-faint)] px-6">
            <div className="flex w-auto items-center">
              <Link
                href="/"
                className="inline-flex items-center gap-3 font-semibold"
                aria-label="PlanCraftX — home"
              >
                <span
                  aria-hidden="true"
                  className="flex size-8 shrink-0 items-center justify-center rounded-[var(--r-sm)] border border-[var(--accent-line)] bg-[var(--accent-subtle)] shadow-xs"
                >
                  <Sparkles className="text-accent size-4.5" />
                </span>
                <span className="text-fg text-base font-black tracking-tight whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  PlanCraft<span className="text-[var(--accent)]">X</span>
                </span>
              </Link>
            </div>
            <div className="absolute right-4 flex items-center gap-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <ThemeToggle variant="switch" />
            </div>
          </div>

          <ActiveTargetCard plan={plan} eventTitle={eventTitle} />

          <nav
            aria-label="Workspace document analysis navigation"
            className="custom-scrollbar flex-1 overflow-y-auto px-4 py-4"
          >
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-fg-subtle mb-3 px-3 text-[10px] font-bold tracking-widest whitespace-nowrap uppercase opacity-0 drop-shadow-xs transition-opacity duration-300 group-hover:opacity-100">
                  Celebration Planning
                </h3>
                <SidebarAnalysisList items={analysisItems} normalizedPath={normalizedPath} />
              </div>

              <div>
                <h3 className="text-fg-subtle mb-3 px-3 text-[10px] font-bold tracking-widest whitespace-nowrap uppercase opacity-0 drop-shadow-xs transition-opacity duration-300 group-hover:opacity-100">
                  Navigation & Resources
                </h3>
                <SidebarSecondaryList items={secondaryItems} onOpenSettings={onOpenSettings} />
              </div>
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
}
