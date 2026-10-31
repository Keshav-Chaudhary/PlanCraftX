import { type EventPlan } from '@/lib/schemas/event-plan';
import { importPlanJson, exportPlanJson } from '@/lib/domain/storage-migration';

const LOCAL_STORAGE_KEY = 'PlanCraftX_current_plan';

/**
 * Loads the active event plan from local storage.
 * Safely parses and validates against schema. Returns null if missing or invalid.
 */
export function loadPlanFromStorage(): EventPlan | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const result = importPlanJson(raw);
    if (result.success) {
      return result.value;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Persists the event plan to local storage.
 */
export function savePlanToStorage(plan: EventPlan): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const serialized = exportPlanJson(plan);
    localStorage.setItem(LOCAL_STORAGE_KEY, serialized);
  } catch {
    // QuotaExceededError or private browsing restrictions handled gracefully
  }
}

/**
 * Clears saved plan data from local storage.
 */
export function clearPlanFromStorage(): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch {
    // ignore
  }
}
