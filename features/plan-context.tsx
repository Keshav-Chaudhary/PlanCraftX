'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { EventPlan } from '@/lib/schemas/event-plan';
import { loadPlanFromStorage, savePlanToStorage, clearPlanFromStorage } from './storage';
import { decodePlanFromShareHash } from '@/lib/domain/share-link';
import { PlanEmptyState, type PlanEmptyStateProps } from './ui/plan-empty-state';

export { PlanEmptyState, type PlanEmptyStateProps };

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
