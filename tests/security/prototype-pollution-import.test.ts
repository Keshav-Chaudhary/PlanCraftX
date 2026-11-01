import { describe, it, expect } from 'vitest';
import { sanitizePrototypePollution, importPlanJson } from '../../lib/domain/storage-migration';

describe('Security: Prototype Pollution Sanitization', () => {
  it('strips dangerous __proto__, constructor, and prototype keys from parsed objects', () => {
    const malicious = JSON.parse(
      '{"title":"Safe Title","__proto__":{"polluted":true},"nested":{"constructor":{"admin":true},"role":"user"}}',
    );

    const cleaned = sanitizePrototypePollution(malicious) as Record<string, unknown>;
    expect(cleaned['title']).toBe('Safe Title');
    expect(cleaned['__proto__']).toBeUndefined();
    expect((cleaned as Record<string, unknown>)['polluted']).toBeUndefined();
    expect(({} as Record<string, unknown>)['polluted']).toBeUndefined();

    const nested = cleaned['nested'] as Record<string, unknown>;
    expect(nested['role']).toBe('user');
    expect(nested['constructor']).toBeUndefined();
  });

  it('safely neutralizes prototype pollution attempts in importPlanJson', () => {
    const maliciousPayload = JSON.stringify({
      schemaVersion: 1,
      id: 'plan-1',
      title: 'Pollution Test',
      eventType: 'birthday',
      eventDate: '2026-10-15',
      location: 'London, UK',
      guestCount: 20,
      totalBudgetMinor: 500000,
      currency: 'GBP',
      isOutdoor: false,
      budgetItems: [],
      timelineItems: [],
      vendorItems: [],
      ideas: [],
      createdAt: '2026-10-01T12:00:00.000Z',
      updatedAt: '2026-10-01T12:00:00.000Z',
      __proto__: { isAdmin: true },
    });

    const result = importPlanJson(maliciousPayload);
    expect(result.success).toBe(true);
    expect(({} as Record<string, unknown>)['isAdmin']).toBeUndefined();
  });

  it('prevents call stack exhaustion on deeply nested malicious payloads', () => {
    // Construct an object nested 100 levels deep
    let deepObj: Record<string, unknown> = { leaf: 'value' };
    for (let i = 0; i < 100; i++) {
      deepObj = { next: deepObj };
    }

    expect(() => sanitizePrototypePollution(deepObj)).not.toThrow();
  });

  it('rejects oversized arrays exceeding MAX_ARRAY_LENGTH', () => {
    const hugeArray = Array.from({ length: 1005 }, (_, i) => ({ id: `item-${i}` }));
    const payload = JSON.stringify({
      schemaVersion: 1,
      id: 'plan-huge',
      budgetItems: hugeArray,
    });

    const result = importPlanJson(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('VALIDATION_FAILED');
      expect(result.error.message).toContain('exceeds allowable collection complexity boundaries');
    }
  });

  it('rejects payloads exceeding MAX_TOTAL_NODES', () => {
    // Generate object with 5500 keys
    const wideObj: Record<string, number> = {};
    for (let i = 0; i < 5500; i++) {
      wideObj[`key_${i}`] = i;
    }
    const payload = JSON.stringify({
      schemaVersion: 1,
      id: 'plan-wide',
      metadata: wideObj,
    });

    const result = importPlanJson(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('VALIDATION_FAILED');
      expect(result.error.message).toContain('exceeds allowable collection complexity boundaries');
    }
  });
});
