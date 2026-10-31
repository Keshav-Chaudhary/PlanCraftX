'use client';

import { useState, useMemo } from 'react';
import type { EventPlan, BudgetItem } from '@/lib/schemas/event-plan';
import {
  minorToMajor,
  majorToMinor,
  rebalanceAllocations,
  convertCurrency,
} from '@/lib/domain/budget-math';

export function useBudgetActions(plan: EventPlan, onPlanUpdate: (updatedPlan: EventPlan) => void) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMajorAmount, setEditMajorAmount] = useState<string>('');
  const [targetCurrency, setTargetCurrency] = useState(plan.currency);
  const [conversionLoading, setConversionLoading] = useState(false);
  const [conversionError, setConversionError] = useState<string | null>(null);

  const totalAllocatedMinor = useMemo(
    () => plan.budgetItems.reduce((acc, it) => acc + it.allocatedMinor, 0),
    [plan.budgetItems],
  );

  const totalSpentMinor = useMemo(
    () => plan.budgetItems.reduce((acc, it) => acc + it.spentMinor, 0),
    [plan.budgetItems],
  );

  const remainingMinor = Math.max(0, plan.totalBudgetMinor - totalSpentMinor);

  const startEdit = (item: BudgetItem) => {
    setEditingId(item.id);
    setEditMajorAmount(String(minorToMajor(item.allocatedMinor, plan.currency)));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditMajorAmount('');
  };

  const saveEdit = (itemId: string) => {
    const newMajor = parseFloat(editMajorAmount);
    if (isNaN(newMajor) || newMajor < 0) {
      cancelEdit();
      return;
    }

    const newMinor = majorToMinor(newMajor, plan.currency);
    const updatedItems = plan.budgetItems.map((it) => ({
      category: it.category,
      allocatedMinor: it.id === itemId ? newMinor : it.allocatedMinor,
      isLocked: it.id === itemId,
    }));

    const rebalanced = rebalanceAllocations(plan.totalBudgetMinor, updatedItems);
    const rebalancedMap = new Map(rebalanced.map((r) => [r.category, r.allocatedMinor]));

    const newBudgetItems: BudgetItem[] = plan.budgetItems.map((it) => {
      const updatedAlloc = rebalancedMap.get(it.category);
      return {
        ...it,
        allocatedMinor: updatedAlloc !== undefined ? updatedAlloc : it.allocatedMinor,
      };
    });

    onPlanUpdate({
      ...plan,
      budgetItems: newBudgetItems,
      updatedAt: new Date().toISOString(),
    });
    cancelEdit();
  };

  const handleCurrencySwitch = async (newCurr: string) => {
    if (newCurr === plan.currency) return;
    setConversionLoading(true);
    setConversionError(null);

    try {
      const res = await fetch('/api/currencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: plan.currency, to: newCurr }),
      });

      if (!res.ok) throw new Error('Conversion rate service unavailable.');

      const { rate } = (await res.json()) as { rate: number };
      const convertedTotal = convertCurrency(plan.totalBudgetMinor, plan.currency, newCurr, rate);

      const convertedItems = plan.budgetItems.map((it) => ({
        ...it,
        allocatedMinor: convertCurrency(it.allocatedMinor, plan.currency, newCurr, rate),
        spentMinor: convertCurrency(it.spentMinor, plan.currency, newCurr, rate),
      }));

      onPlanUpdate({
        ...plan,
        currency: newCurr,
        totalBudgetMinor: convertedTotal,
        budgetItems: convertedItems,
        updatedAt: new Date().toISOString(),
      });
      setTargetCurrency(newCurr);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Currency conversion failed.';
      setConversionError(msg);
      setTargetCurrency(plan.currency);
    } finally {
      setConversionLoading(false);
    }
  };

  return {
    editingId,
    editMajorAmount,
    setEditMajorAmount,
    targetCurrency,
    conversionLoading,
    conversionError,
    totalAllocatedMinor,
    totalSpentMinor,
    remainingMinor,
    startEdit,
    cancelEdit,
    saveEdit,
    handleCurrencySwitch,
  };
}
