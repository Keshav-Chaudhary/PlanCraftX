import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVendorActions } from '@/features/vendors/use-vendor-actions';
import type { EventPlan, VendorItem } from '@/lib/schemas/event-plan';

function createMockPlan(): EventPlan {
  const vendors: VendorItem[] = [
    {
      id: 'v1',
      category: 'Catering',
      name: 'Artisan Eats',
      status: 'to_contact',
      isEstimate: false,
    },
    {
      id: 'v2',
      category: 'Photography',
      name: 'Lens Masters',
      status: 'booked',
      isEstimate: false,
    },
  ];

  return {
    schemaVersion: 1,
    id: 'test-vendors-plan',
    title: 'Birthday Celebration',
    eventType: 'birthday',
    eventDate: '2026-11-20',
    guestCount: 50,
    location: 'Austin, TX',
    isOutdoor: true,
    currency: 'USD',
    totalBudgetMinor: 200000,
    budgetItems: [],
    timelineItems: [],
    vendorItems: vendors,
    ideas: [],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };
}

describe('useVendorActions Hook', () => {
  it('extracts unique categories and filters vendors by category', () => {
    const plan = createMockPlan();
    const onPlanUpdate = vi.fn();
    const { result } = renderHook(() => useVendorActions(plan, onPlanUpdate));

    expect(result.current.categories).toEqual(['Catering', 'Photography']);
    expect(result.current.selectedCategory).toBe('all');
    expect(result.current.filteredVendors).toHaveLength(2);

    act(() => {
      result.current.setSelectedCategory('Catering');
    });

    expect(result.current.filteredVendors).toHaveLength(1);
    expect(result.current.filteredVendors[0]?.id).toBe('v1');
  });

  it('updates vendor status correctly', () => {
    const plan = createMockPlan();
    const onPlanUpdate = vi.fn();
    const { result } = renderHook(() => useVendorActions(plan, onPlanUpdate));

    act(() => {
      result.current.handleStatusChange('v1', 'quoted');
    });

    expect(onPlanUpdate).toHaveBeenCalledTimes(1);
    const firstCall = onPlanUpdate.mock.calls[0];
    if (!firstCall) throw new Error('Call missing');
    const updated = firstCall[0] as EventPlan;
    expect(updated.vendorItems.find((v) => v.id === 'v1')?.status).toBe('quoted');
  });

  it('adds an OpenStreetMap vendor to the plan', () => {
    const plan = createMockPlan();
    const onPlanUpdate = vi.fn();
    const { result } = renderHook(() => useVendorActions(plan, onPlanUpdate));

    act(() => {
      result.current.handleAddOsmVendor({
        osmId: '998877',
        name: 'The Historic Hall',
        displayName: 'The Historic Hall, Austin, TX',
        type: 'venue',
        category: 'amenity',
        latitude: 30.2672,
        longitude: -97.7431,
      });
    });

    expect(onPlanUpdate).toHaveBeenCalledTimes(1);
    const firstCall = onPlanUpdate.mock.calls[0];
    if (!firstCall) throw new Error('Call missing');
    const updated = firstCall[0] as EventPlan;
    expect(updated.vendorItems).toHaveLength(3);
    expect(updated.vendorItems[0]?.name).toBe('The Historic Hall');
    expect(updated.vendorItems[0]?.osmId).toBe('998877');
  });
});
