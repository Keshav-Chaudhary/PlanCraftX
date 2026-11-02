'use client';

import React from 'react';
import Image from 'next/image';
import { Check } from 'lucide-react';

/**
 * Center Decorative Floating Visual.
 * Reproduces the 3D purple calendar, rotated venue photograph,
 * elliptical orbital ring, and floating star sparkles, harmonized with
 * the theme palette of the PlanCraftX application and scaled responsively.
 */
export function HeroCenterVisual() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative hidden h-[340px] w-full max-w-[320px] shrink-0 items-center justify-center 2xl:flex 2xl:h-[380px] 2xl:max-w-[340px]"
    >
      {/* Ambient Bloom behind visual */}
      <div className="absolute top-1/2 left-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)] opacity-15 blur-[65px] 2xl:h-64 2xl:w-64 2xl:blur-[75px]" />

      {/* Elliptical Orbital Ring */}
      <div className="absolute h-[260px] w-[260px] [transform:rotateX(65deg)_rotateZ(-25deg)] rounded-full border border-dashed border-[var(--accent-line)] opacity-60 shadow-[0_0_20px_var(--accent-subtle)] 2xl:h-[320px] 2xl:w-[320px]" />

      {/* Background Rotated Venue Photograph */}
      <div className="animate-float-photo absolute top-20 right-2 z-10 w-[170px] rounded-2xl border-[4px] border-white/95 bg-white shadow-2xl transition-transform duration-500 sm:w-[185px] 2xl:top-24 2xl:right-4 2xl:w-[200px] 2xl:border-[5px]">
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-900">
          <Image
            src="/images/gala-banquet.jpg"
            alt="Golden Jubilee Gala banquet reception dinner"
            fill
            sizes="200px"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>
      </div>

      {/* Floating 3D Calendar */}
      <div className="animate-float-calendar bg-surface/95 absolute top-6 left-1 z-20 w-[150px] rounded-2xl border border-[var(--border-strong)] p-2.5 shadow-[var(--shadow-lg),0_0_25px_var(--accent-subtle)] backdrop-blur-xl 2xl:top-8 2xl:left-2 2xl:w-[170px] 2xl:p-3">
        {/* Calendar Spiral Binder Rings */}
        <div className="absolute -top-3 left-0 flex w-full justify-around px-3.5 2xl:px-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-3.5 w-1.5 rounded-full border border-[var(--border-strong)] bg-gradient-to-b from-white to-slate-300 shadow-sm 2xl:h-4 2xl:w-2"
            />
          ))}
        </div>

        {/* Calendar Header */}
        <div className="mt-1 flex items-center justify-between rounded-lg bg-gradient-to-r from-[var(--accent)] via-amber-500 to-orange-500 px-2 py-0.5 text-white shadow-xs 2xl:px-2.5 2xl:py-1">
          <span className="text-[9px] font-black tracking-widest uppercase 2xl:text-[10px]">
            OCTOBER
          </span>
          <span className="text-[8px] font-bold opacity-90 2xl:text-[9px]">2026</span>
        </div>

        {/* Date Grid */}
        <div className="mt-2 grid grid-cols-5 gap-1 text-center 2xl:mt-2.5 2xl:gap-1.5">
          {[12, 13, 14, 15, 16, 17, 18, 19, 20, 21].map((day) => {
            const isTarget = day === 18;
            return (
              <div
                key={day}
                className={`flex size-5 items-center justify-center rounded-md text-[9px] font-bold 2xl:size-6 2xl:text-[10px] ${
                  isTarget
                    ? 'border-orange-300 bg-[var(--accent)] text-white shadow-[0_0_12px_var(--accent-line)]'
                    : 'text-fg-subtle/70 hover:text-fg'
                }`}
              >
                {isTarget ? <Check className="size-3 stroke-[3] 2xl:size-3.5" /> : day}
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating 4-Point Gold Star Sparkles */}
      <div className="absolute -top-2 right-8 z-30 animate-pulse text-[var(--accent)] drop-shadow-[0_0_8px_var(--accent-line)] 2xl:right-12">
        <svg className="size-4 2xl:size-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
        </svg>
      </div>

      <div className="absolute bottom-8 left-4 z-30 animate-pulse text-amber-400 drop-shadow-[0_0_6px_var(--accent-line)] 2xl:bottom-10 2xl:left-6">
        <svg className="size-3 2xl:size-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
        </svg>
      </div>

      <div className="absolute top-40 right-1 z-30 animate-pulse text-[var(--accent)] drop-shadow-[0_0_6px_var(--accent-line)] 2xl:top-44">
        <svg className="size-3.5 2xl:size-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
        </svg>
      </div>
    </div>
  );
}
