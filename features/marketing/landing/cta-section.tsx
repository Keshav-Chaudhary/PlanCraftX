'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import { ScrollReveal } from '@/features/ui/scroll-reveal';

export function CTASection() {
  return (
    <section className="bg-surface relative overflow-hidden border-t border-[var(--border)]">
      <div className="bg-surface-2 absolute inset-0 -z-20" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_var(--accent-subtle)_0%,_transparent_70%)] opacity-40 mix-blend-screen"
      />

      <ScrollReveal className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8">
        <div className="border-accent-line bg-accent-subtle mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1 text-xs font-bold tracking-widest text-blue-400 uppercase">
          <Sparkles className="size-3.5" />
          Ready to plan
        </div>

        <h2 className="text-fg text-3xl font-black tracking-tight uppercase drop-shadow-sm sm:text-5xl">
          Master the celebration.
          <br />
          <span className="text-[var(--accent)]">Create unforgettable moments.</span>
        </h2>

        <p className="text-fg-muted mx-auto mt-6 max-w-2xl text-base leading-relaxed font-medium sm:text-lg">
          Launch PlanCraftX now. Experience mathematically verified budget allocations,
          reverse-planned timelines, and grounded vendor proposals.
        </p>

        <div className="mt-8 flex justify-center sm:mt-10">
          <Link
            href="/plan"
            className="group relative inline-flex h-14 cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-full bg-[var(--accent)] px-10 text-base font-bold text-[var(--accent-fg)] shadow-[0_0_30px_var(--accent-line)] transition-all hover:scale-105 hover:bg-[var(--accent-strong)] hover:shadow-[0_0_40px_var(--accent-line)] sm:h-16 sm:px-12 sm:text-lg"
          >
            <span>Launch PlanCraftX Workspace</span>
            <ArrowRight
              aria-hidden="true"
              className="size-5 transition-transform group-hover:translate-x-1 sm:size-6"
            />
          </Link>
        </div>
      </ScrollReveal>
    </section>
  );
}
