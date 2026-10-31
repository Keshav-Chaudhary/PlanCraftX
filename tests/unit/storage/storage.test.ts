import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadPlanFromStorage,
  savePlanToStorage,
  clearPlanFromStorage,
} from '../../../features/storage';
import type { EventPlan } from '../../../lib/schemas/event-plan';

describe('Storage Persistence Feature Helper', () => {
  const mockPlan: EventPlan = {
    id: 'plan-xyz',
    schemaVersion: 1,
    title: 'Test Plan',
    eventType: 'birthday',
    eventDate: '2026-07-20',
    location: 'Denver, CO',
    guestCount: 50,
    totalBudgetMinor: 500000,
    currency: 'USD',
    isOutdoor: false,
    budgetItems: [],
    timelineItems: [],
    vendorItems: [],
    ideas: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it('returns null when storage is empty', () => {
    expect(loadPlanFromStorage()).toBeNull();
  });

  it('saves and loads a valid plan', () => {
    savePlanToStorage(mockPlan);
    const loaded = loadPlanFromStorage();
    expect(loaded).toEqual(mockPlan);
  });

  it('returns null when stored item is corrupted or invalid', () => {
    localStorage.setItem('PlanCraftX_current_plan', '{ corrupted json');
    expect(loadPlanFromStorage()).toBeNull();
  });

  it('clears stored plan', () => {
    savePlanToStorage(mockPlan);
    clearPlanFromStorage();
    expect(loadPlanFromStorage()).toBeNull();
  });

  it('handles localStorage errors gracefully without throwing', () => {
    const originalGetItem = localStorage.getItem;
    localStorage.getItem = () => {
      throw new Error('SecurityError: Access denied');
    };
    expect(loadPlanFromStorage()).toBeNull();
    localStorage.getItem = originalGetItem;
  });
});
