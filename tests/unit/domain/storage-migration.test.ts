import { describe, it, expect } from 'vitest';
import {
  importPlanJson,
  exportPlanJson,
  MAX_IMPORT_FILE_SIZE_BYTES,
} from '../../../lib/domain/storage-migration';
import type { EventPlan } from '../../../lib/schemas/event-plan';

describe('Storage Migration, Serialization & File Size Boundaries', () => {
  const validPlan: EventPlan = {
    id: 'test-plan-123',
    schemaVersion: 1,
    title: 'Smith Family Wedding',
    eventType: 'wedding',
    eventDate: '2026-09-18',
    location: 'Boston, MA',
    guestCount: 120,
    totalBudgetMinor: 2500000, // $25,000.00
    currency: 'USD',
    isOutdoor: true,
    budgetItems: [
      {
        id: 'b1',
        category: 'Venue & Reception',
        allocatedMinor: 1200000,
        spentMinor: 200000,
        isEstimate: true,
      },
    ],
    timelineItems: [
      {
        id: 't1',
        phase: 'Venue & Core Vendors',
        title: 'Sign venue contract',
        dueDate: '2026-03-18',
        status: 'pending',
        isEstimate: true,
      },
    ],
    vendorItems: [
      {
        id: 'v1',
        category: 'Venue & Reception',
        name: 'The Harbor Club',
        status: 'quoted',
        estimatedCostMinor: 1200000,
        isEstimate: true,
      },
    ],
    ideas: [
      {
        id: 'i1',
        title: 'Coastal Sunset Theme',
        category: 'theme',
        description: 'Navy and seafoam color palette with oyster shell place cards.',
      },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  describe('File Size Invariants', () => {
    it('rejects files exceeding 1 MB limit with FILE_TOO_LARGE error', () => {
      // Create string of 1.1 MB
      const oversized = 'a'.repeat(MAX_IMPORT_FILE_SIZE_BYTES + 100);
      const result = importPlanJson(oversized);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('FILE_TOO_LARGE');
      }
    });
  });

  describe('Malformed & Invalid Inputs', () => {
    it('rejects syntax-invalid JSON with INVALID_JSON error', () => {
      const result = importPlanJson('{ invalid json: true,');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_JSON');
      }
    });

    it('rejects non-object primitives with VALIDATION_FAILED error', () => {
      const result = importPlanJson('"just a string"');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('VALIDATION_FAILED');
      }
    });

    it('rejects unsupported schema versions with UNSUPPORTED_VERSION error', () => {
      const json = JSON.stringify({ ...validPlan, schemaVersion: 99 });
      const result = importPlanJson(json);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('UNSUPPORTED_VERSION');
      }
    });
  });

  describe('V0 to V1 Migration', () => {
    it('automatically migrates legacy V0 plan (major units) to V1 integer minor units', () => {
      const legacyV0 = {
        id: 'legacy-plan-001',
        title: 'Old Birthday Party',
        eventType: 'birthday',
        eventDate: '2026-05-10',
        location: 'Chicago, IL',
        guestCount: 30,
        totalBudget: 1500, // $1,500 major units in V0
        currency: 'USD',
        budgetItems: [
          {
            id: 'b-old-1',
            category: 'Venue Rental',
            allocated: 500, // $500 major units
            spent: 100,
          },
        ],
      };

      const result = importPlanJson(JSON.stringify(legacyV0));
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.schemaVersion).toBe(1);
        expect(result.value.totalBudgetMinor).toBe(150000); // 1500 * 100 = 150,000 minor units
        expect(result.value.budgetItems[0]?.allocatedMinor).toBe(50000); // 500 * 100 = 50,000
        expect(result.value.budgetItems[0]?.spentMinor).toBe(10000);
      }
    });

    it('handles legacy plan that already has minor units defined and handles empty arrays', () => {
      const v0WithMinor = {
        id: 'plan-v0-minor',
        title: 'Community Clean-up',
        eventType: 'community',
        eventDate: '2026-04-20',
        location: 'Seattle, WA',
        guestCount: 50,
        totalBudgetMinor: 200000,
        currency: 'USD',
        budgetItems: [
          {
            allocatedMinor: 100000,
            spentMinor: 20000,
          },
        ],
      };

      const result = importPlanJson(JSON.stringify(v0WithMinor));
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.totalBudgetMinor).toBe(200000);
        expect(result.value.budgetItems[0]?.allocatedMinor).toBe(100000);
        expect(result.value.budgetItems[0]?.spentMinor).toBe(20000);
      }
    });

    it('rejects schema validation failure when fields violate constraints', () => {
      const invalid = {
        ...validPlan,
        totalBudgetMinor: -500, // Negative budget not allowed
      };
      const result = importPlanJson(JSON.stringify(invalid));
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('VALIDATION_FAILED');
        expect(result.error.message).toContain('totalBudgetMinor');
      }
    });

    it('rejects null literal in JSON', () => {
      const result = importPlanJson('null');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('VALIDATION_FAILED');
      }
    });
  });

  describe('Round-Trip Serialization Integrity', () => {
    it('achieves 100% round-trip lossless integrity (export -> import -> identical)', () => {
      const serialized = exportPlanJson(validPlan);
      const deserializedResult = importPlanJson(serialized);

      expect(deserializedResult.success).toBe(true);
      if (deserializedResult.success) {
        expect(deserializedResult.value).toEqual(validPlan);
      }
    });
  });
});
