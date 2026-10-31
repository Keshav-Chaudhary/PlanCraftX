'use client';

import { formatMinorUnits } from '@/lib/domain/budget-math';
import type { EventPlan, BudgetItem } from '@/lib/schemas/event-plan';

interface BudgetTableProps {
  readonly plan: EventPlan;
  readonly editingId: string | null;
  readonly editMajorAmount: string;
  readonly onStartEdit: (item: BudgetItem) => void;
  readonly onSaveEdit: (itemId: string) => void;
  readonly onCancelEdit: () => void;
  readonly onEditAmountChange: (amount: string) => void;
}

export function BudgetTable({
  plan,
  editingId,
  editMajorAmount,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditAmountChange,
}: BudgetTableProps) {
  return (
    <div className="border-border bg-surface overflow-hidden rounded-xl border shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm" aria-label="Budget Allocations by Category">
          <thead className="border-border bg-surface-elevated text-muted border-b text-xs font-semibold uppercase">
            <tr>
              <th scope="col" className="px-6 py-3">
                Category
              </th>
              <th scope="col" className="px-6 py-3">
                Allocated Amount
              </th>
              <th scope="col" className="px-6 py-3">
                Spent Amount
              </th>
              <th scope="col" className="px-6 py-3">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {plan.budgetItems.map((item) => (
              <tr key={item.id} className="hover:bg-surface-elevated/50 transition-colors">
                <td className="text-foreground px-6 py-4 font-medium">{item.category}</td>
                <td className="px-6 py-4">
                  {editingId === item.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        step="any"
                        value={editMajorAmount}
                        onChange={(e) => onEditAmountChange(e.target.value)}
                        className="border-border bg-surface text-foreground w-28 rounded border px-2 py-1 text-xs"
                        aria-label={`Edit allocated amount for ${item.category}`}
                      />
                      <button
                        type="button"
                        onClick={() => onSaveEdit(item.id)}
                        className="bg-primary text-primary-fg rounded px-2 py-1 text-xs font-semibold"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={onCancelEdit}
                        className="border-border text-muted rounded border px-2 py-1 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <span className="text-foreground font-semibold">
                      {formatMinorUnits(item.allocatedMinor, plan.currency)} {plan.currency}
                    </span>
                  )}
                </td>
                <td className="text-muted px-6 py-4">
                  {formatMinorUnits(item.spentMinor, plan.currency)} {plan.currency}
                </td>
                <td className="px-6 py-4">
                  {item.isEstimate ? (
                    <span className="inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                      AI estimate
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                      Verified quote
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {editingId !== item.id && (
                    <button
                      type="button"
                      onClick={() => onStartEdit(item)}
                      className="text-primary hover:text-primary/80 text-xs font-medium underline"
                    >
                      Edit & Rebalance
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
