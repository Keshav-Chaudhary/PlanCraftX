import { describe, it, expect, beforeEach } from 'vitest';
import {
  importPlanJson,
  exportPlanJson,
  CURRENT_SCHEMA_VERSION,
} from '../../lib/domain/storage-migration';
import {
  loadPlanFromStorage,
  savePlanToStorage,
  clearPlanFromStorage,
} from '../../features/storage';
import type { EventPlan } from '../../lib/schemas/event-plan';

describe('Security: Storage Tampering & Schema Invariant Defense Matrix', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const validPlan: EventPlan = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    schemaVersion: 1,
    title: 'Sarah & James Wedding',
    eventType: 'wedding',
    eventDate: '2027-06-20',
    location: 'Napa Valley, CA',
    guestCount: 120,
    totalBudgetMinor: 4000000,
    currency: 'USD',
    isOutdoor: true,
    budgetItems: [
      {
        id: 'venue-catering',
        category: 'Venue & Catering',
        allocatedMinor: 2000000,
        spentMinor: 0,
        isEstimate: true,
      },
    ],
    timelineItems: [],
    vendorItems: [],
    ideas: [],
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
  };

  describe('importPlanJson Validation & Integrity Enforcement', () => {
    it('successfully imports valid legitimate EventPlan JSON', () => {
      const json = JSON.stringify(validPlan);
      const result = importPlanJson(json);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.title).toBe('Sarah & James Wedding');
        expect(result.value.eventType).toBe('wedding');
      }
    });

    it('rejects completely invalid JSON text', () => {
      const result = importPlanJson('{ corrupt: json');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_JSON');
      }
    });

    it('rejects JSON primitives (number or string instead of object)', () => {
      expect(importPlanJson('12345').success).toBe(false);
      expect(importPlanJson('"just a string"').success).toBe(false);
      expect(importPlanJson('true').success).toBe(false);
      expect(importPlanJson('null').success).toBe(false);
    });

    it('rejects empty object without required schema fields', () => {
      const result = importPlanJson('{}');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('VALIDATION_FAILED');
      }
    });

    it('neutralizes prototype pollution attempt during plan import', () => {
      const maliciousJson = JSON.stringify({
        ...validPlan,
        __proto__: { isAdmin: true },
      });
      const result = importPlanJson(maliciousJson);
      expect(result.success).toBe(true);
      expect(({} as Record<string, unknown>)['isAdmin']).toBeUndefined();
    });

    it('rejects plans with negative totalBudgetMinor', () => {
      const invalid = { ...validPlan, totalBudgetMinor: -500 };
      expect(importPlanJson(JSON.stringify(invalid)).success).toBe(false);
    });

    it('rejects plans with non-integer guestCount', () => {
      const invalid = { ...validPlan, guestCount: 12.5 };
      expect(importPlanJson(JSON.stringify(invalid)).success).toBe(false);
    });

    it('rejects plans with unsupported event types (e.g. concert)', () => {
      const invalid = { ...validPlan, eventType: 'concert' };
      expect(importPlanJson(JSON.stringify(invalid)).success).toBe(false);
    });

    it('preserves birthday plans across import and export cycle', () => {
      const bdayPlan: EventPlan = {
        ...validPlan,
        eventType: 'birthday',
        title: "Leo's 10th Birthday",
      };
      const json = exportPlanJson(bdayPlan);
      const result = importPlanJson(json);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.eventType).toBe('birthday');
      }
    });

    it('preserves community plans across import and export cycle', () => {
      const commPlan: EventPlan = {
        ...validPlan,
        eventType: 'community',
        title: 'Spring Street Fair',
      };
      const json = exportPlanJson(commPlan);
      const result = importPlanJson(json);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.eventType).toBe('community');
      }
    });

    it('rejects files exceeding MAX_IMPORT_FILE_SIZE_BYTES (1 MB)', () => {
      const padding = 'x'.repeat(1_048_577);
      const oversizedJson = JSON.stringify({ ...validPlan, title: padding });
      const result = importPlanJson(oversizedJson);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('FILE_TOO_LARGE');
      }
    });

    it('rejects invalid currency codes (e.g. TOOLONG)', () => {
      const invalid = { ...validPlan, currency: 'TOOLONG' };
      expect(importPlanJson(JSON.stringify(invalid)).success).toBe(false);
    });

    it('rejects malformed eventDate not conforming to YYYY-MM-DD', () => {
      const invalid = { ...validPlan, eventDate: '06/20/2027' };
      expect(importPlanJson(JSON.stringify(invalid)).success).toBe(false);
    });

    it('rejects imported payloads that violate array boundaries gracefully', () => {
      const hugeArray = Array.from({ length: 1050 }, (_, i) => ({
        id: `v-${i}`,
        category: 'decor',
        name: `Vendor ${i}`,
      }));
      const payload = JSON.stringify({
        ...validPlan,
        schemaVersion: CURRENT_SCHEMA_VERSION,
        vendorItems: hugeArray,
      });
      const result = importPlanJson(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('VALIDATION_FAILED');
        expect(result.error.message).toContain('exceeds allowable collection complexity');
      }
    });
  });

  describe('Storage Resilience & LocalStorage Invariants', () => {
    it('returns null from loadPlanFromStorage when storage is empty', () => {
      expect(loadPlanFromStorage()).toBeNull();
    });

    it('saves and reloads plan with full fidelity', () => {
      savePlanToStorage(validPlan);
      const loaded = loadPlanFromStorage();
      expect(loaded).not.toBeNull();
      expect(loaded?.id).toBe(validPlan.id);
    });

    it('clears plan successfully via clearPlanFromStorage', () => {
      savePlanToStorage(validPlan);
      expect(loadPlanFromStorage()).not.toBeNull();
      clearPlanFromStorage();
      expect(loadPlanFromStorage()).toBeNull();
    });

    it('gracefully returns null if localStorage contains malformed corrupted JSON', () => {
      localStorage.setItem('PlanCraftX_current_plan', '{ corrupted syntax');
      expect(loadPlanFromStorage()).toBeNull();
    });

    it('gracefully returns null if localStorage contains prototype pollution attempt', () => {
      localStorage.setItem(
        'PlanCraftX_current_plan',
        JSON.stringify({ __proto__: { admin: true }, broken: true }),
      );
      expect(loadPlanFromStorage()).toBeNull();
      expect(({} as Record<string, unknown>)['admin']).toBeUndefined();
    });
  });
});
