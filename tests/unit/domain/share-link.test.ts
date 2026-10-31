import { describe, it, expect } from 'vitest';
import {
  encodePlanToShareHash,
  decodePlanFromShareHash,
  toBase64Url,
  fromBase64Url,
} from '@/lib/domain/share-link';
import type { EventPlan } from '@/lib/schemas/event-plan';

const MOCK_PLAN: EventPlan = {
  id: 'test-plan-1',
  schemaVersion: 1,
  title: 'Priya & Rahul Wedding',
  eventType: 'wedding',
  eventDate: '2026-11-20',
  location: 'Pune',
  guestCount: 200,
  totalBudgetMinor: 80_000_000,
  currency: 'INR',
  isOutdoor: false,
  budgetItems: [
    {
      id: 'b-1',
      category: 'Catering',
      allocatedMinor: 28_000_000,
      spentMinor: 0,
      isEstimate: true,
    },
  ],
  timelineItems: [
    {
      id: 't-1',
      phase: 'Booking',
      title: 'Book Venue',
      dueDate: '2026-08-01',
      status: 'pending',
      isEstimate: true,
    },
  ],
  vendorItems: [
    {
      id: 'v-1',
      category: 'Catering',
      name: 'Royal Feast',
      status: 'to_contact',
      isEstimate: true,
    },
  ],
  ideas: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('Share Link Domain Logic', () => {
  it('encodes and decodes an EventPlan losslessly', () => {
    const hash = encodePlanToShareHash(MOCK_PLAN);
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(10);

    const result = decodePlanFromShareHash(hash);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.title).toBe(MOCK_PLAN.title);
      expect(result.value.totalBudgetMinor).toBe(80_000_000);
      expect(result.value.budgetItems[0]?.category).toBe('Catering');
    }
  });

  it('rejects empty or whitespace-only share hashes', () => {
    const result1 = decodePlanFromShareHash('');
    expect(result1.success).toBe(false);

    const result2 = decodePlanFromShareHash('   ');
    expect(result2.success).toBe(false);
  });

  it('rejects share hashes exceeding 64 KB size limit', () => {
    const oversized = 'A'.repeat(70_000);
    const result = decodePlanFromShareHash(oversized);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('exceeds maximum allowable size');
    }
  });

  it('rejects malformed non-base64 or invalid JSON content', () => {
    const malformed = 'not-valid-base64-json-content-!@#$%^';
    const result = decodePlanFromShareHash(malformed);
    expect(result.success).toBe(false);
  });

  it('rejects JSON payloads that fail schema validation', () => {
    const invalidSchemaJson = JSON.stringify({
      id: 'bad-plan',
      totalBudgetMinor: -500, // Invalid: negative
    });
    const hash = toBase64Url(invalidSchemaJson);
    const result = decodePlanFromShareHash(hash);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('invalid or outdated plan schema');
    }
  });

  it('correctly handles base64url padding and character conversion', () => {
    const testStr = 'Hello World? Special & chars =+';
    const encoded = toBase64Url(testStr);
    expect(encoded).not.toContain('+');
    expect(encoded).not.toContain('/');
    expect(encoded).not.toContain('=');

    const decoded = fromBase64Url(encoded);
    expect(decoded).toBe(testStr);
  });

  it('falls back to browser btoa and atob when Buffer is undefined', () => {
    const origBuffer = globalThis.Buffer;
    // @ts-expect-error test fallback
    delete globalThis.Buffer;
    try {
      const str = 'Browser Fallback String';
      const encoded = toBase64Url(str);
      const decoded = fromBase64Url(encoded);
      expect(decoded).toBe(str);
    } finally {
      globalThis.Buffer = origBuffer;
    }
  });
});
