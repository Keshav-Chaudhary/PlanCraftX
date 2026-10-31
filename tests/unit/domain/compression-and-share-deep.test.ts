import { describe, it, expect } from 'vitest';
import {
  encodePlanToShareHash,
  decodePlanFromShareHash,
  toBase64Url,
  fromBase64Url,
} from '../../../lib/domain/share-link';
import type { EventPlan } from '../../../lib/schemas/event-plan';

describe('Deep Share Link Portability & Safe Compression', () => {
  describe('Base64URL Encoding & Decoding Invariants', () => {
    it('handles empty string roundtrip', () => {
      const encoded = toBase64Url('');
      expect(fromBase64Url(encoded)).toBe('');
    });

    it('replaces plus (+) with hyphen (-)', () => {
      const raw = '>>>???'; // produces + and / in standard base64
      const b64url = toBase64Url(raw);
      expect(b64url).not.toContain('+');
      expect(fromBase64Url(b64url)).toBe(raw);
    });

    it('replaces slash (/) with underscore (_)', () => {
      const raw = '~~~///';
      const b64url = toBase64Url(raw);
      expect(b64url).not.toContain('/');
      expect(fromBase64Url(b64url)).toBe(raw);
    });

    it('strips trailing padding equals signs (=)', () => {
      const raw = 'Hello World!';
      const b64url = toBase64Url(raw);
      expect(b64url).not.toContain('=');
      expect(fromBase64Url(b64url)).toBe(raw);
    });

    it.each([
      'Special Characters: !@#$%^&*()_+{}|:"<>?',
      'Indian Names: आनंद, शादी, जन्मदिन, उत्सव',
      'Accented Letters: Événement, Fête, Noël, Über',
      'Japanese: 祭り, 結婚式, 誕生日',
      'Emoji String: 🎉💍🎂🎪🪔✨🚀',
    ])('reliably roundtrips UTF-8 string "%s"', (str) => {
      const encoded = toBase64Url(str);
      expect(fromBase64Url(encoded)).toBe(str);
    });
  });

  describe('Full Event Plan Hash Serialisation & Deserialisation', () => {
    const fullPlan: EventPlan = {
      id: 'full-wedding-share',
      schemaVersion: 1,
      title: 'Priya & Arjun Royal Wedding',
      eventType: 'wedding',
      eventDate: '2026-12-18',
      location: 'Udaipur, Rajasthan',
      guestCount: 350,
      totalBudgetMinor: 450000000, // ₹45 Lakh
      currency: 'INR',
      isOutdoor: true,
      budgetItems: [
        {
          id: 'b1',
          category: 'Venue & Reception',
          allocatedMinor: 180000000,
          spentMinor: 50000000,
          isEstimate: true,
        },
        {
          id: 'b2',
          category: 'Catering & Bar',
          allocatedMinor: 150000000,
          spentMinor: 0,
          isEstimate: true,
        },
        {
          id: 'b3',
          category: 'Photography & Videography',
          allocatedMinor: 50000000,
          spentMinor: 0,
          isEstimate: true,
        },
        {
          id: 'b4',
          category: 'Contingency Reserve',
          allocatedMinor: 70000000,
          spentMinor: 0,
          isEstimate: true,
        },
      ],
      timelineItems: [
        {
          id: 't1',
          phase: 'Core Booking',
          title: 'Lock Palace Venue',
          dueDate: '2026-06-01',
          status: 'completed',
          isEstimate: true,
        },
        {
          id: 't2',
          phase: 'Attire',
          title: 'Bridal Lehenga Fitting',
          dueDate: '2026-09-01',
          status: 'in_progress',
          isEstimate: true,
        },
        {
          id: 't3',
          phase: 'Ceremony',
          title: 'Sangeet Choreography Practice',
          dueDate: '2026-11-15',
          status: 'pending',
          isEstimate: true,
        },
      ],
      vendorItems: [
        {
          id: 'v1',
          category: 'Venue',
          name: 'City Palace Udaipur',
          status: 'booked',
          estimatedCostMinor: 180000000,
          isEstimate: true,
        },
        {
          id: 'v2',
          category: 'Catering',
          name: 'Royal Mewar Caterers',
          status: 'quoted',
          estimatedCostMinor: 150000000,
          isEstimate: true,
        },
      ],
      ideas: [
        {
          id: 'i1',
          title: 'Heritage Royal Welcome',
          category: 'theme',
          description: 'Traditional Shehnai musicians and rose petal welcome.',
        },
      ],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-15T00:00:00.000Z',
    };

    it('encodes full plan into a clean base64url hash string without padding or special url chars', () => {
      const hash = encodePlanToShareHash(fullPlan);
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(50);
      expect(hash).not.toContain('+');
      expect(hash).not.toContain('/');
      expect(hash).not.toContain('=');
    });

    it('decodes share hash back to identical plan data structure', () => {
      const hash = encodePlanToShareHash(fullPlan);
      const res = decodePlanFromShareHash(hash);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.value.title).toBe(fullPlan.title);
        expect(res.value.guestCount).toBe(350);
        expect(res.value.totalBudgetMinor).toBe(450000000);
        expect(res.value.budgetItems).toHaveLength(4);
        expect(res.value.timelineItems).toHaveLength(3);
        expect(res.value.vendorItems).toHaveLength(2);
        expect(res.value.ideas).toHaveLength(1);
      }
    });

    it('returns error when decoding invalid base64 hash', () => {
      const res = decodePlanFromShareHash('###not-base64###');
      expect(res.success).toBe(false);
    });

    it('returns error when decoding empty string', () => {
      const res = decodePlanFromShareHash('');
      expect(res.success).toBe(false);
    });

    it('returns error when decoding valid base64 that is not JSON', () => {
      const invalidJson = toBase64Url('THIS IS NOT JSON');
      const res = decodePlanFromShareHash(invalidJson);
      expect(res.success).toBe(false);
    });

    it('returns error when decoding valid JSON that fails EventPlan schema validation', () => {
      const invalidPlan = toBase64Url(JSON.stringify({ randomKey: 'no required fields' }));
      const res = decodePlanFromShareHash(invalidPlan);
      expect(res.success).toBe(false);
    });
  });
});
