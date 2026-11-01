'use client';

import { useState, useMemo } from 'react';
import { z } from 'zod';
import type { EventPlan, BudgetItem } from '@/lib/schemas/event-plan';
import {
  minorToMajor,
  convertCurrency,
  updateBudgetItemAllocation,
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

    const updatedPlan = updateBudgetItemAllocation(plan, itemId, newMajor);
    onPlanUpdate(updatedPlan);
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

      const json = await res.json();
      const parsed = z.object({ rate: z.number().positive() }).safeParse(json);
      if (!parsed.success) {
        throw new Error('Invalid conversion rate format received.');
      }
      const { rate } = parsed.data;
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
