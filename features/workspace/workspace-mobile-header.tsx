'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, PlusCircle } from 'lucide-react';
import { ThemeToggle } from '@/features/theme-toggle';
import type { EventPlan } from '@/lib/schemas/event-plan';

interface WorkspaceMobileHeaderProps {
  readonly plan: EventPlan | null;
}

export function WorkspaceMobileHeader({ plan }: WorkspaceMobileHeaderProps) {
  const eventTitle = plan?.title || 'PlanCraftX Workspace';

  return (
    <header className="bg-surface/95 sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-[var(--border)] px-4 backdrop-blur-md md:hidden">
      <Link href="/" className="text-fg flex items-center gap-2 text-sm font-bold">
        <span className="border-accent-line bg-accent-subtle text-accent flex size-7 shrink-0 items-center justify-center rounded-md border text-xs font-bold">
          <Sparkles className="size-3.5" />
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-xs leading-tight font-bold">PlanCraftX</span>
          <span className="text-fg-muted max-w-[140px] truncate text-[10px] font-normal">
            {eventTitle}
          </span>
        </div>
      </Link>

      <div className="flex items-center gap-2">
        <Link
          href="/plan/event"
          className="border-accent-line bg-accent-subtle text-accent flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-bold"
        >
          <PlusCircle className="size-3" />
          <span>Setup</span>
        </Link>
        <ThemeToggle variant="switch" />
      </div>
    </header>
  );
}
