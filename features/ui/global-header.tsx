'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, ArrowRight } from 'lucide-react';
import { ThemeToggle } from '@/features/theme-toggle';

export function GlobalHeader() {
  const pathname = usePathname();
  const normalizedPath = (pathname ? pathname.replace(/\/+$/, '') : '') || '/';
  const isWorkspace = normalizedPath.startsWith('/plan');

  // In the workspace, the workspace navigation handles navigation
  if (isWorkspace) {
    return null;
  }

  const navLinks = [
    { href: '/', label: 'Home', id: 'nav-home-link' },
    { href: '/how-it-works', label: 'How It Works', id: 'nav-how-it-works-link' },
    { href: '/developer', label: 'Developer', id: 'nav-developer-link' },
  ];

  return (
    <div className="pointer-events-none fixed top-4 right-0 left-0 z-50 flex justify-center px-4">
      <header
        role="banner"
        className="bg-surface/85 hover:bg-surface/95 pointer-events-auto flex w-full max-w-5xl items-center justify-between rounded-full border border-[var(--border)] px-3 py-2 shadow-[var(--shadow-md)] backdrop-blur-md transition-all hover:border-[var(--accent-line)] sm:px-5 sm:py-2.5"
      >
        {/* Left: Brand Logo & Navigation Pills */}
        <div className="flex items-center gap-3 sm:gap-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 font-bold no-underline"
            aria-label="PlanCraftX home"
          >
            <span
              aria-hidden="true"
              className="flex size-7 items-center justify-center rounded-full border border-[var(--accent-line)] bg-[var(--accent-subtle)] text-[var(--accent)] shadow-xs sm:size-8"
            >
              <Sparkles className="size-4 text-[var(--accent)]" />
            </span>
            <span className="text-fg text-base font-extrabold tracking-tight sm:text-lg">
              PlanCraft<span className="text-[var(--accent)]">X</span>
            </span>
          </Link>

          {/* Nav Links */}
          <nav aria-label="Main Navigation" className="flex items-center gap-1 sm:gap-1.5">
            {navLinks.map((item) => {
              const itemPath = (item.href ? item.href.replace(/\/+$/, '') : '') || '/';
              const isActive =
                itemPath === '/' ? normalizedPath === '/' : normalizedPath.startsWith(itemPath);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  id={item.id}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all sm:px-4 sm:py-2 sm:text-sm ${
                    isActive
                      ? 'bg-accent text-white shadow-sm'
                      : 'text-fg-muted hover:bg-surface-2 hover:text-fg'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Theme Toggle & Launch Workspace CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle variant="switch" />
          <Link
            href="/plan"
            id="nav-workspace-cta"
            className="group flex h-9 items-center justify-center gap-1.5 rounded-full bg-[var(--accent)] px-3.5 text-xs font-bold whitespace-nowrap text-[var(--accent-fg)] shadow-xs transition-all hover:-translate-y-0.5 hover:bg-[var(--accent-strong)] hover:shadow-[0_0_16px_var(--accent-line)] sm:h-10 sm:gap-2 sm:px-5 sm:text-sm"
          >
            <span className="hidden sm:inline">Launch Workspace</span>
            <span className="sm:hidden">Launch</span>
            <ArrowRight
              aria-hidden="true"
              className="size-3.5 transition-transform group-hover:translate-x-1 sm:size-4"
            />
          </Link>
        </div>
      </header>
    </div>
  );
}
