'use client';

import { useState } from 'react';
import type { EventPlan, BudgetItem } from '@/lib/schemas/event-plan';
import {
  minorToMajor,
  majorToMinor,
  rebalanceAllocations,
  convertCurrency,
} from '@/lib/domain/budget-math';
import { BudgetMetrics } from './budget-metrics';
import { BudgetTable } from './budget-table';
import { BudgetTradeoffBanner } from './budget-tradeoff-banner';
import { AllocationBar } from './allocation-bar';

interface BudgetPlannerProps {
  readonly plan: EventPlan;
  readonly onPlanUpdate: (updatedPlan: EventPlan) => void;
}

export function BudgetPlanner({ plan, onPlanUpdate }: BudgetPlannerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMajorAmount, setEditMajorAmount] = useState<string>('');
  const [targetCurrency, setTargetCurrency] = useState(plan.currency);
  const [conversionLoading, setConversionLoading] = useState(false);
  const [conversionError, setConversionError] = useState<string | null>(null);

  const totalAllocatedMinor = plan.budgetItems.reduce((acc, it) => acc + it.allocatedMinor, 0);
  const totalSpentMinor = plan.budgetItems.reduce((acc, it) => acc + it.spentMinor, 0);
  const remainingMinor = Math.max(0, plan.totalBudgetMinor - totalSpentMinor);

  const startEdit = (item: BudgetItem) => {
    setEditingId(item.id);
    setEditMajorAmount(String(minorToMajor(item.allocatedMinor, plan.currency)));
  };

  const saveEdit = (itemId: string) => {
    const newMajor = parseFloat(editMajorAmount);
    if (isNaN(newMajor) || newMajor < 0) {
      setEditingId(null);
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
    setEditingId(null);
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

  return (
    <div className="space-y-6">
      <BudgetMetrics
        plan={plan}
        totalAllocatedMinor={totalAllocatedMinor}
        totalSpentMinor={totalSpentMinor}
        remainingMinor={remainingMinor}
      />

      <AllocationBar
        categories={plan.budgetItems.map((b) => ({
          id: b.id,
          name: b.category,
          allocatedMinor: b.allocatedMinor,
        }))}
        totalBudget={plan.totalBudgetMinor}
      />

      <BudgetTradeoffBanner plan={plan} onPlanUpdate={onPlanUpdate} />

      <div className="border-border bg-surface flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4">
        <div>
          <h3 className="text-foreground text-sm font-semibold">Active Currency & Normalization</h3>
          <p className="text-muted text-xs">
            Amounts normalized using exact integer minor units & largest-remainder rounding.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <label htmlFor="budget-currency-select" className="text-foreground text-xs font-medium">
            Switch Currency:
          </label>
          <select
            id="budget-currency-select"
            value={targetCurrency}
            disabled={conversionLoading}
            onChange={(e) => handleCurrencySwitch(e.target.value)}
            className="border-border bg-surface text-foreground rounded-lg border px-2.5 py-1 text-xs focus:ring-2"
          >
            <option value="USD">USD ($) - 2 dec</option>
            <option value="EUR">EUR (€) - 2 dec</option>
            <option value="GBP">GBP (£) - 2 dec</option>
            <option value="JPY">JPY (¥) - 0 dec</option>
            <option value="KWD">KWD (KD) - 3 dec</option>
            <option value="BHD">BHD (BD) - 3 dec</option>
            <option value="INR">INR (₹) - 2 dec</option>
            <option value="CAD">CAD ($) - 2 dec</option>
            <option value="AUD">AUD ($) - 2 dec</option>
          </select>
          {conversionLoading && <span className="text-muted text-xs">Converting...</span>}
        </div>
      </div>

      {conversionError && (
        <div
          role="alert"
          className="border-danger/30 bg-danger/10 text-danger rounded-lg border p-3 text-xs"
        >
          {conversionError}
        </div>
      )}

      <BudgetTable
        plan={plan}
        editingId={editingId}
        editMajorAmount={editMajorAmount}
        onStartEdit={startEdit}
        onSaveEdit={saveEdit}
        onCancelEdit={() => setEditingId(null)}
        onEditAmountChange={setEditMajorAmount}
      />
    </div>
  );
}
