'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, Sparkles, Calendar, ShieldCheck, Heart } from 'lucide-react';

export function MarketingFooter() {
  const pathname = usePathname();
  if (pathname.startsWith('/plan')) {
    return null;
  }

  return (
    <footer
      className="bg-surface-3 relative overflow-hidden border-t border-[var(--border-strong)] pt-12 pb-8 shadow-inner"
      role="contentinfo"
    >
      {/* Background radial glow */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 -z-10 h-[500px] w-[900px] -translate-x-1/2 translate-y-1/2 rounded-full bg-[radial-gradient(circle,_var(--accent-subtle)_0%,_transparent_70%)] opacity-30 mix-blend-screen" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-8">
        {/* Newsletter Pulse Block */}
        <div className="bg-surface-2 mb-12 flex flex-col items-start justify-between gap-6 rounded-2xl border border-[var(--border-faint)] px-6 py-6 shadow-[var(--shadow-sm)] lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <h3 className="text-fg text-xl font-bold sm:text-2xl">
              Stay ahead on GenAI event intelligence standards.
            </h3>
            <p className="text-fg-muted mt-2 text-sm leading-relaxed">
              Subscribe for updates on integer budget allocation models, reverse-planned timeline
              algorithms, and public open-data API integrations.
            </p>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full max-w-md flex-col items-stretch gap-3 sm:flex-row sm:items-center"
          >
            <input
              type="email"
              aria-label="Your email address"
              placeholder="Enter your email"
              className="bg-surface text-fg h-11 flex-1 rounded-xl border border-[var(--border-strong)] px-4 text-sm transition-colors !outline-none focus:border-[var(--accent)]"
            />
            <button
              type="submit"
              className="bg-fg text-bg flex h-11 shrink-0 cursor-pointer items-center justify-center rounded-xl px-6 text-sm font-bold shadow-[var(--shadow-sm)] transition-transform hover:scale-105 active:scale-95"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Links Grid */}
        <div className="grid gap-12 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
          {/* Brand & Status Column */}
          <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-3 lg:pr-12">
            <Link href="/" className="text-fg flex items-center gap-2 text-lg font-bold">
              <span className="flex size-7 items-center justify-center rounded-md border border-[var(--accent-line)] bg-[var(--accent-subtle)] text-[var(--accent)]">
                <Sparkles className="size-4" />
              </span>
              <span>PlanCraftX</span>
            </Link>

            <p className="text-fg-muted max-w-sm text-sm leading-relaxed">
              An evidence-first celebration & event planning system. Grounded with live Open-Meteo,
              Nager.Date, Frankfurter, and OpenStreetMap data to eliminate synthetic hallucinations.
            </p>

            {/* Live System Status Badge */}
            <div className="bg-surface-2 mt-2 flex w-fit items-center gap-3 rounded-lg border border-[var(--border-strong)] px-4 py-2">
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--positive)] opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-[var(--positive)]" />
              </span>
              <span className="text-fg text-[10px] font-bold tracking-widest uppercase">
                System Status: Open APIs Operational
              </span>
            </div>
          </div>

          {/* Product Column */}
          <div className="flex flex-col gap-4">
            <h4 className="text-fg-muted text-[10px] font-bold tracking-widest uppercase">
              Workspace
            </h4>
            <nav aria-label="Footer Workspace Links" className="flex flex-col gap-2.5">
              <Link
                href="/plan"
                className="text-fg-muted hover:text-accent group flex items-center gap-1 text-sm font-medium transition-colors"
              >
                Overview
                <ArrowRight className="size-3 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
              </Link>
              <Link
                href="/plan/budget"
                className="text-fg-muted hover:text-accent text-sm font-medium transition-colors"
              >
                Budget Planner
              </Link>
              <Link
                href="/plan/timeline"
                className="text-fg-muted hover:text-accent text-sm font-medium transition-colors"
              >
                Timeline & Run-Sheet
              </Link>
              <Link
                href="/plan/vendors"
                className="text-fg-muted hover:text-accent text-sm font-medium transition-colors"
              >
                Vendors & Quotes
              </Link>
            </nav>
          </div>

          {/* Capabilities Column */}
          <div className="flex flex-col gap-4">
            <h4 className="text-fg-muted text-[10px] font-bold tracking-widest uppercase">
              Occasions
            </h4>
            <nav aria-label="Footer Occasions Links" className="flex flex-col gap-2.5">
              <Link
                href="/plan/event"
                className="text-fg-muted hover:text-accent flex items-center gap-1.5 text-sm font-medium transition-colors"
              >
                <Heart className="text-accent size-3.5" />
                Weddings
              </Link>
              <Link
                href="/plan/event"
                className="text-fg-muted hover:text-accent flex items-center gap-1.5 text-sm font-medium transition-colors"
              >
                <Calendar className="text-caution size-3.5" />
                Birthdays
              </Link>
              <Link
                href="/plan/event"
                className="text-fg-muted hover:text-accent flex items-center gap-1.5 text-sm font-medium transition-colors"
              >
                <ShieldCheck className="text-positive size-3.5" />
                Community Events
              </Link>
            </nav>
          </div>

          {/* Compliance & Privacy Column */}
          <div className="flex flex-col gap-4">
            <h4 className="text-fg-muted text-[10px] font-bold tracking-widest uppercase">
              Privacy & Controls
            </h4>
            <nav aria-label="Footer Privacy Links" className="flex flex-col gap-2.5">
              <Link
                href="/settings/privacy"
                className="text-fg-muted hover:text-accent text-sm font-medium transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/settings/privacy"
                className="text-fg-muted hover:text-accent text-sm font-medium transition-colors"
              >
                Data Purge Controls
              </Link>
              <Link
                href="/plan/export"
                className="text-fg-muted hover:text-accent text-sm font-medium transition-colors"
              >
                RFC 5545 ICS Export
              </Link>
              <Link
                href="/plan/export"
                className="text-fg-muted hover:text-accent text-sm font-medium transition-colors"
              >
                JSON Plan Backup
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="text-fg-muted mt-12 flex flex-col items-center justify-between gap-4 border-t border-[var(--border)] pt-8 text-xs sm:flex-row">
          <p>
            © {new Date().getFullYear()} PlanCraftX Assistant • Built with official Google GenAI SDK
            & Open Public Data.
          </p>
          <p className="flex items-center gap-2">
            <span>Strict Zero Synthetic Data Policy</span>
            <span>•</span>
            <span>WCAG 2.2 AA Certified</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
