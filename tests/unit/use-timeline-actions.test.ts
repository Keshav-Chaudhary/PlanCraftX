import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimelineActions } from '@/features/timeline/use-timeline-actions';
import type { EventPlan, TimelineItem } from '@/lib/schemas/event-plan';

function createMockPlan(): EventPlan {
  const items: TimelineItem[] = [
    {
      id: 't1',
      title: 'Book Venue',
      phase: '9-12 Months Before',
      dueDate: '2026-04-01',
      status: 'pending',
      isEstimate: false,
    },
    {
      id: 't2',
      title: 'Final Guest Count',
      phase: '2 Weeks Before',
      dueDate: '2026-10-01',
      status: 'in_progress',
      isEstimate: false,
    },
  ];

  return {
    schemaVersion: 1,
    id: 'test-timeline-plan',
    title: 'Milestone Gala',
    eventType: 'community',
    eventDate: '2026-10-15',
    guestCount: 200,
    location: 'Chicago, IL',
    isOutdoor: false,
    currency: 'USD',
    totalBudgetMinor: 5000000,
    budgetItems: [],
    timelineItems: items,
    vendorItems: [],
    ideas: [],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };
}

describe('useTimelineActions Hook', () => {
  it('initializes with all items and filter set to all', () => {
    const plan = createMockPlan();
    const onPlanUpdate = vi.fn();
    const { result } = renderHook(() => useTimelineActions(plan, onPlanUpdate));

    expect(result.current.filterStatus).toBe('all');
    expect(result.current.filteredItems).toHaveLength(2);
  });

  it('filters items correctly when filterStatus is updated', () => {
    const plan = createMockPlan();
    const onPlanUpdate = vi.fn();
    const { result } = renderHook(() => useTimelineActions(plan, onPlanUpdate));

    act(() => {
      result.current.setFilterStatus('in_progress');
    });

    expect(result.current.filteredItems).toHaveLength(1);
    expect(result.current.filteredItems[0]?.id).toBe('t2');
  });

  it('cycles milestone status pending -> in_progress -> completed', () => {
    const plan = createMockPlan();
    const targetItem = plan.timelineItems[0];
    if (!targetItem) throw new Error('Target milestone missing');
    const onPlanUpdate = vi.fn();
    const { result } = renderHook(() => useTimelineActions(plan, onPlanUpdate));

    act(() => {
      result.current.toggleStatus(targetItem);
    });

    expect(onPlanUpdate).toHaveBeenCalledTimes(1);
    const firstCall = onPlanUpdate.mock.calls[0];
    if (!firstCall) throw new Error('Call missing');
    const updated = firstCall[0] as EventPlan;
    expect(updated.timelineItems[0]?.status).toBe('in_progress');
  });
});
