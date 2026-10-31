'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePlan } from './plan-context';

export interface WorkspaceTab {
  readonly href: string;
  readonly label: string;
  readonly icon: string;
  readonly id: string;
}

export const WORKSPACE_TABS: readonly WorkspaceTab[] = [
  { id: 'overview', href: '/plan', label: 'Overview', icon: '📊' },
  { id: 'event', href: '/plan/event', label: 'Event Setup', icon: '⚙️' },
  { id: 'budget', href: '/plan/budget', label: 'Budget Planner', icon: '💰' },
  { id: 'timeline', href: '/plan/timeline', label: 'Timeline', icon: '📅' },
  { id: 'vendors', href: '/plan/vendors', label: 'Vendors', icon: '📋' },
  { id: 'ideas', href: '/plan/ideas', label: 'AI Ideas', icon: '💡' },
  { id: 'assistant', href: '/plan/assistant', label: 'AI Assistant', icon: '🤖' },
  { id: 'export', href: '/plan/export', label: 'Export & Backup', icon: '💾' },
] as const;

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
      {/* Event Header Banner (when plan exists) */}
      {plan && (
        <div className="border-border bg-surface flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4 shadow-xs sm:p-5">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="border-primary/20 bg-primary/10 text-primary rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase">
                {plan.eventType}
              </span>
              <span className="text-muted text-xs">
                • {plan.eventDate} • {plan.location} • {plan.guestCount} guests
              </span>
              {plan.isOutdoor && (
                <span className="border-accent/20 bg-accent/10 text-accent rounded-full border px-2 py-0.5 text-[11px] font-semibold">
                  Outdoor Event
                </span>
              )}
            </div>
            <div
              className="text-foreground text-xl font-bold tracking-tight sm:text-2xl"
              id="workspace-plan-title"
            >
              {plan.title}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href="/plan/event"
              className="border-border bg-surface text-foreground hover:bg-surface-elevated focus-visible:ring-primary inline-flex items-center rounded-xl border px-3.5 py-2 text-xs font-semibold shadow-xs transition focus-visible:ring-2 focus-visible:outline-none"
              id="workspace-edit-plan-btn"
            >
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
            className="border-border bg-surface text-foreground inline-flex items-center space-x-2 rounded-xl border px-4 py-2.5 text-xs font-semibold shadow-xs"
          >
            <span aria-hidden="true">{mobileMenuOpen ? '✕' : '☰'}</span>
            <span>Workspace Sections</span>
          </button>
        </div>

        {/* Tab Items: Desktop Segmented Row & Mobile Drawer */}
        <div
          id="workspace-nav-menu"
          className={`border-border bg-surface mt-2 flex flex-col gap-1 rounded-2xl border p-1.5 shadow-xs md:mt-0 md:flex md:flex-row md:flex-wrap ${
            mobileMenuOpen ? 'flex' : 'hidden md:flex'
          }`}
          role="navigation"
        >
          {WORKSPACE_TABS.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                id={`nav-${tab.id}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                  isActive
                    ? 'bg-primary text-primary-fg shadow-xs'
                    : 'text-muted hover:bg-surface-elevated hover:text-foreground'
                }`}
              >
                <span aria-hidden="true">{tab.icon}</span>
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
