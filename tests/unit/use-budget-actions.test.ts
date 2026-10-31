import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBudgetActions } from '@/features/budget/use-budget-actions';
import type { EventPlan, BudgetItem } from '@/lib/schemas/event-plan';

function createMockPlan(): EventPlan {
  const budgetItems: BudgetItem[] = [
    { id: 'b1', category: 'Venue', allocatedMinor: 600000, spentMinor: 100000, isEstimate: false },
    {
      id: 'b2',
      category: 'Catering',
      allocatedMinor: 400000,
      spentMinor: 50000,
      isEstimate: false,
    },
  ];

  return {
    schemaVersion: 1,
    id: 'test-plan',
    title: 'Test Wedding',
    eventType: 'wedding',
    eventDate: '2026-10-15',
    guestCount: 120,
    location: 'Denver, CO',
    isOutdoor: false,
    currency: 'USD',
    totalBudgetMinor: 1000000,
    budgetItems,
    timelineItems: [],
    vendorItems: [],
    ideas: [],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };
}

describe('useBudgetActions Hook', () => {
  it('initializes with calculated metrics', () => {
    const plan = createMockPlan();
    const onPlanUpdate = vi.fn();
    const { result } = renderHook(() => useBudgetActions(plan, onPlanUpdate));

    expect(result.current.totalAllocatedMinor).toBe(1000000);
    expect(result.current.totalSpentMinor).toBe(150000);
    expect(result.current.remainingMinor).toBe(850000);
    expect(result.current.editingId).toBeNull();
    expect(result.current.targetCurrency).toBe('USD');
  });

  it('handles startEdit and cancelEdit cleanly', () => {
    const plan = createMockPlan();
    const targetItem = plan.budgetItems[0];
    if (!targetItem) throw new Error('Target item missing');
    const onPlanUpdate = vi.fn();
    const { result } = renderHook(() => useBudgetActions(plan, onPlanUpdate));

    act(() => {
      result.current.startEdit(targetItem);
    });

    expect(result.current.editingId).toBe('b1');
    expect(result.current.editMajorAmount).toBe('6000');

    act(() => {
      result.current.cancelEdit();
    });

    expect(result.current.editingId).toBeNull();
    expect(result.current.editMajorAmount).toBe('');
  });

  it('rebalances budget and calls onPlanUpdate on valid saveEdit', () => {
    const plan = createMockPlan();
    const targetItem = plan.budgetItems[0];
    if (!targetItem) throw new Error('Target item missing');
    const onPlanUpdate = vi.fn();
    const { result } = renderHook(() => useBudgetActions(plan, onPlanUpdate));

    act(() => {
      result.current.startEdit(targetItem);
      result.current.setEditMajorAmount('7000');
    });

    act(() => {
      result.current.saveEdit('b1');
    });

    expect(onPlanUpdate).toHaveBeenCalledTimes(1);
    const firstCall = onPlanUpdate.mock.calls[0];
    if (!firstCall) throw new Error('Call missing');
    const updated = firstCall[0] as EventPlan;
    expect(updated.budgetItems.find((i) => i.id === 'b1')?.allocatedMinor).toBe(700000);
    expect(result.current.editingId).toBeNull();
  });

  it('aborts edit without calling onPlanUpdate if amount is invalid', () => {
    const plan = createMockPlan();
    const targetItem = plan.budgetItems[0];
    if (!targetItem) throw new Error('Target item missing');
    const onPlanUpdate = vi.fn();
    const { result } = renderHook(() => useBudgetActions(plan, onPlanUpdate));

    act(() => {
      result.current.startEdit(targetItem);
      result.current.setEditMajorAmount('-500');
    });

    act(() => {
      result.current.saveEdit('b1');
    });

    expect(onPlanUpdate).not.toHaveBeenCalled();
    expect(result.current.editingId).toBeNull();
  });
});
