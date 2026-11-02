'use client';

import React from 'react';

export function HeroBottomStrip() {
  return (
    <div className="relative mt-12 w-full">
      {/* Translucent Glass Capsule Strip */}
      <div className="bg-surface/85 relative z-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-[var(--border)] px-6 py-3.5 shadow-[var(--shadow-md)] backdrop-blur-xl sm:flex-row sm:gap-2">
        {/* Left: Brand motto */}
        <div className="text-fg-muted flex items-center gap-3 text-xs font-semibold">
          <span>Plan Smarter. Celebrate Better.</span>
          <span className="hidden text-[var(--border-strong)] sm:inline">|</span>
        </div>

        {/* Center: Grounded Engineering Reality */}
        <div className="text-fg flex items-center gap-2 text-xs font-semibold">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          <span>100% Grounded Public Data • Zero Synthetic Drift</span>
        </div>

        {/* Right: GenAI Sparkle Tag */}
        <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--accent)]">
          <svg className="size-3.5 fill-[var(--accent)]" viewBox="0 0 24 24">
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
          </svg>
          <span className="tracking-wide">Your Perfect Event, Powered by GenAI</span>
        </div>
      </div>
    </div>
  );
}
