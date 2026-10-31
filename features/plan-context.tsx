'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import type { EventPlan } from '@/lib/schemas/event-plan';
import { loadPlanFromStorage, savePlanToStorage, clearPlanFromStorage } from './storage';
import { decodePlanFromShareHash } from '@/lib/domain/share-link';

interface PlanContextValue {
  readonly plan: EventPlan | null;
  readonly isLoaded: boolean;
  readonly storageError: string | null;
  readonly updatePlan: (updatedPlan: EventPlan) => void;
  readonly resetPlan: () => void;
  readonly clearStorageError: () => void;
}

const PlanContext = createContext<PlanContextValue | undefined>(undefined);

export function PlanProvider({ children }: { readonly children: React.ReactNode }) {
  const [plan, setPlan] = useState<EventPlan | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const shareHash = urlParams.get('share');
        if (shareHash) {
          const decoded = decodePlanFromShareHash(shareHash);
          if (decoded.success) {
            setPlan(decoded.value);
            savePlanToStorage(decoded.value);
            setIsLoaded(true);
            return;
          }
        }
      }

      const stored = loadPlanFromStorage();
      if (stored) {
        setPlan(stored);
      } else if (typeof window !== 'undefined' && localStorage.getItem('PlanCraftX_current_plan')) {
        setStorageError(
          'Saved plan could not be parsed. Storage data may be corrupted or outdated.',
        );
      }
    } catch {
      setStorageError('Saved plan could not be parsed. Storage data may be corrupted or outdated.');
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const updatePlan = (updatedPlan: EventPlan) => {
    setPlan(updatedPlan);
    savePlanToStorage(updatedPlan);
  };

  const resetPlan = () => {
    setPlan(null);
    clearPlanFromStorage();
  };

  const clearStorageError = () => {
    setStorageError(null);
  };

  const value = useMemo(
    () => ({
      plan,
      isLoaded,
      storageError,
      updatePlan,
      resetPlan,
      clearStorageError,
    }),
    [plan, isLoaded, storageError],
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) {
    throw new Error('usePlan must be used within a PlanProvider');
  }
  return ctx;
}

interface PlanEmptyStateProps {
  readonly title?: string;
  readonly description?: string;
  readonly actionLabel?: string;
  readonly actionHref?: string;
}

export function PlanEmptyState({
  title = 'No Active Event Plan Found',
  description = 'You have not set up an event plan yet. Create your plan to generate tailored integer-normalized budgets, reverse-planned timelines, vendor checklists, and personalized ideas.',
  actionLabel = 'Create Your First Event',
  actionHref = '/plan/event',
}: PlanEmptyStateProps) {
  return (
    <div
      role="region"
      aria-labelledby="empty-plan-heading"
      className="border-border bg-surface mx-auto max-w-2xl rounded-2xl border p-8 text-center shadow-sm sm:p-12"
    >
      <div
        className="bg-surface-elevated mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
        aria-hidden="true"
      >
        ✨
      </div>
      <h2
        id="empty-plan-heading"
        className="text-foreground mt-4 text-2xl font-bold tracking-tight"
      >
        {title}
      </h2>
      <p className="text-muted mx-auto mt-2 max-w-lg text-sm leading-relaxed sm:text-base">
        {description}
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={actionHref}
          className="bg-primary text-primary-fg inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold shadow-sm transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2"
          id="empty-state-create-btn"
        >
          {actionLabel}
        </Link>
        <Link
          href="/plan/export"
          className="border-border bg-surface hover:bg-surface-elevated text-foreground inline-flex items-center justify-center rounded-lg border px-5 py-3 text-sm font-medium transition-colors"
        >
          Import JSON Backup
        </Link>
      </div>

      <div className="border-border mt-8 border-t pt-6">
        <span className="text-muted block text-xs font-semibold tracking-wider uppercase">
          Supported Event Types
        </span>
        <div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
          <span className="bg-surface-elevated text-foreground rounded-lg p-2 font-medium">
            💍 Weddings
          </span>
          <span className="bg-surface-elevated text-foreground rounded-lg p-2 font-medium">
            🎂 Milestone Birthdays
          </span>
          <span className="bg-surface-elevated text-foreground rounded-lg p-2 font-medium">
            🤝 Community Events
          </span>
        </div>
      </div>
    </div>
  );
}
