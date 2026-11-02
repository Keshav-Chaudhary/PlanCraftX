'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Settings,
  DollarSign,
  Clock,
  ClipboardList,
  Lightbulb,
  Bot,
  Download,
  Menu,
  X,
  Edit3,
  Sparkles,
} from 'lucide-react';
import { usePlan } from './plan-context';
import { ThemeToggle } from './theme-toggle';

export interface WorkspaceTab {
  readonly href: string;
  readonly label: string;
  readonly icon: string;
  readonly id: string;
}

export const WORKSPACE_TABS: readonly WorkspaceTab[] = [
  { id: 'overview', href: '/plan', label: 'Overview', icon: 'LayoutDashboard' },
  { id: 'event', href: '/plan/event', label: 'Event Setup', icon: 'Settings' },
  { id: 'budget', href: '/plan/budget', label: 'Budget Planner', icon: 'DollarSign' },
  { id: 'timeline', href: '/plan/timeline', label: 'Timeline', icon: 'Clock' },
  { id: 'vendors', href: '/plan/vendors', label: 'Vendors', icon: 'ClipboardList' },
  { id: 'ideas', href: '/plan/ideas', label: 'AI Ideas', icon: 'Lightbulb' },
  { id: 'assistant', href: '/plan/assistant', label: 'AI Assistant', icon: 'Bot' },
  { id: 'export', href: '/plan/export', label: 'Export & Backup', icon: 'Download' },
] as const;

const TAB_ICONS: Record<string, React.ElementType> = {
  overview: LayoutDashboard,
  event: Settings,
  budget: DollarSign,
  timeline: Clock,
  vendors: ClipboardList,
  ideas: Lightbulb,
  assistant: Bot,
  export: Download,
};

export function WorkspaceNavigation() {
  const pathname = usePathname();
  const { plan } = usePlan();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <div className="space-y-4">
      {/* Workspace Brand Bar & Controls */}
      <div className="border-border/60 flex items-center justify-between border-b pb-3">
        <Link
          href="/"
          className="text-fg hover:text-accent inline-flex items-center gap-2 font-bold no-underline transition-colors"
          title="Return to Home"
        >
          <span
            aria-hidden="true"
            className="border-accent-line bg-accent-subtle text-accent flex size-7 items-center justify-center rounded-full border shadow-xs"
          >
            <Sparkles className="text-accent size-3.5" />
          </span>
          <span className="text-sm font-extrabold tracking-tight">
            PlanCraft<span className="text-accent">X</span>
            <span className="text-fg-muted ml-2 text-xs font-normal">/ Workspace</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle variant="switch" />
        </div>
      </div>

      {/* Event Header Banner (when plan exists) */}
      {plan && (
        <div className="bg-surface-2/80 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--border)] p-4 shadow-[var(--shadow-sm)] backdrop-blur-md sm:p-5">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="border-accent-line bg-accent-subtle text-accent rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase">
                {plan.eventType}
              </span>
              <span className="text-fg-muted text-xs">
                • {plan.eventDate} • {plan.location} • {plan.guestCount} guests
              </span>
              {plan.isOutdoor && (
                <span className="border-caution/30 bg-caution-subtle text-caution rounded-full border px-2 py-0.5 text-[11px] font-semibold">
                  Outdoor Event
                </span>
              )}
            </div>
            <div
              className="text-fg text-xl font-black tracking-tight sm:text-2xl"
              id="workspace-plan-title"
            >
              {plan.title}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href="/plan/event"
              className="bg-surface-3 text-fg hover:text-accent focus-visible:ring-accent inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[var(--border-strong)] px-4 py-2 text-xs font-bold shadow-xs transition-all hover:border-[var(--accent-line)]"
              id="workspace-edit-plan-btn"
            >
              <Edit3 className="size-3.5" />
              <span>Edit Event Details</span>
            </Link>
          </div>
        </div>
      )}

      {/* Navigation Controls */}
      <nav aria-label="Planning Workspace Navigation" className="relative">
        {/* Mobile Toggle Button */}
        <div className="flex items-center justify-between md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="workspace-nav-menu"
            aria-label="Workspace Navigation Menu"
            id="workspace-menu-toggle"
            className="bg-surface-2 text-fg inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--border-strong)] px-4 py-2.5 text-xs font-bold shadow-xs"
          >
            {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            <span>Workspace Sections</span>
          </button>
        </div>

        {/* Tab Items: Desktop Segmented Row & Mobile Drawer */}
        <div
          id="workspace-nav-menu"
          className={`bg-surface-2/90 mt-2 flex flex-col gap-1 rounded-2xl border border-[var(--border)] p-1.5 shadow-[var(--shadow-sm)] backdrop-blur-md md:mt-0 md:flex md:flex-row md:flex-wrap md:items-center ${
            mobileMenuOpen ? 'flex' : 'hidden md:flex'
          }`}
          role="navigation"
        >
          {WORKSPACE_TABS.map((tab) => {
            const isActive = pathname === tab.href;
            const IconComponent = TAB_ICONS[tab.id];
            return (
              <Link
                key={tab.id}
                href={tab.href}
                id={`nav-${tab.id}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex cursor-pointer items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-accent text-accent-fg shadow-[0_0_12px_var(--accent-line)] shadow-xs'
                    : 'text-fg-muted hover:bg-surface-3 hover:text-fg'
                }`}
              >
                {IconComponent ? (
                  <IconComponent className="size-4 shrink-0" aria-hidden="true" />
                ) : (
                  <span aria-hidden="true">{tab.icon}</span>
                )}
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
