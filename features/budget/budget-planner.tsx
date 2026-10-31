'use client';

import type { EventPlan } from '@/lib/schemas/event-plan';
import { BudgetMetrics } from './budget-metrics';
import { BudgetTable } from './budget-table';
import { BudgetTradeoffBanner } from './budget-tradeoff-banner';
import { AllocationBar } from './allocation-bar';
import { useBudgetActions } from './use-budget-actions';

interface BudgetPlannerProps {
  readonly plan: EventPlan;
  readonly onPlanUpdate: (updatedPlan: EventPlan) => void;
}

const SUPPORTED_CURRENCIES = [
  { value: 'USD', label: 'USD ($) - 2 dec' },
  { value: 'EUR', label: 'EUR (€) - 2 dec' },
  { value: 'GBP', label: 'GBP (£) - 2 dec' },
  { value: 'JPY', label: 'JPY (¥) - 0 dec' },
  { value: 'KWD', label: 'KWD (KD) - 3 dec' },
  { value: 'BHD', label: 'BHD (BD) - 3 dec' },
  { value: 'INR', label: 'INR (₹) - 2 dec' },
  { value: 'CAD', label: 'CAD ($) - 2 dec' },
  { value: 'AUD', label: 'AUD ($) - 2 dec' },
];

export function BudgetPlanner({ plan, onPlanUpdate }: BudgetPlannerProps) {
  const {
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
  } = useBudgetActions(plan, onPlanUpdate);

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
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          {conversionLoading && <span className="text-muted text-xs">Converting...</span>}
        </div>
      </div>

      {conversionError && (
        <div
          role="alert"
          className="border-danger/20 bg-danger/10 text-danger rounded-xl border p-4 text-xs font-medium"
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
        onCancelEdit={cancelEdit}
        onEditAmountChange={setEditMajorAmount}
      />
    </div>
  );
}
