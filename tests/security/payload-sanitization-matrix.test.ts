import { describe, it, expect } from 'vitest';
import {
  sanitizePrototypePollution,
  MAX_ARRAY_LENGTH,
  MAX_TOTAL_NODES,
} from '../../lib/domain/storage-migration';

describe('Security: Payload Prototype Pollution & Complexity Defense', () => {
  describe('Prototype Pollution Sanitization across Arbitrary Payloads', () => {
    it('strips top-level __proto__ key from object', () => {
      const payload = JSON.parse('{"__proto__": {"admin": true}, "title": "My Event"}');
      const sanitized = sanitizePrototypePollution(payload) as Record<string, unknown>;
      expect(sanitized['__proto__']).toBeUndefined();
      expect(sanitized['title']).toBe('My Event');
      expect(({} as Record<string, unknown>)['admin']).toBeUndefined();
    });

    it('strips constructor and prototype keys from object', () => {
      const payload = JSON.parse(
        '{"constructor": {"name": "Exploit"}, "prototype": {"hacked": true}, "name": "Safe"}',
      );
      const sanitized = sanitizePrototypePollution(payload) as Record<string, unknown>;
      expect(sanitized['constructor']).toBeUndefined();
      expect(sanitized['prototype']).toBeUndefined();
      expect(sanitized['name']).toBe('Safe');
    });

    it('strips __proto__ nested 2 levels deep inside nested settings', () => {
      const payload = JSON.parse('{"settings": {"preferences": {"__proto__": {"debug": true}}}}');
      const sanitized = sanitizePrototypePollution(payload) as {
        settings: { preferences: Record<string, unknown> };
      };
      expect(sanitized.settings.preferences['__proto__']).toBeUndefined();
      expect(({} as Record<string, unknown>)['debug']).toBeUndefined();
    });

    it('strips __proto__ nested inside an array of objects', () => {
      const payload = JSON.parse('[{"id": 1}, {"__proto__": {"pwned": true}, "id": 2}]');
      const sanitized = sanitizePrototypePollution(payload) as Array<Record<string, unknown>>;
      expect(sanitized).toHaveLength(2);
      expect(sanitized[1]?.['__proto__']).toBeUndefined();
      expect(({} as Record<string, unknown>)['pwned']).toBeUndefined();
    });

    it('strips prototype keys inside arrays within objects', () => {
      const payload = JSON.parse('{"items": [{"name": "item1"}, {"prototype": 123}]}');
      const sanitized = sanitizePrototypePollution(payload) as {
        items: Array<Record<string, unknown>>;
      };
      expect(sanitized.items[1]?.['prototype']).toBeUndefined();
    });

    it('handles primitive values safely without modification', () => {
      expect(sanitizePrototypePollution('test string')).toBe('test string');
      expect(sanitizePrototypePollution(42)).toBe(42);
      expect(sanitizePrototypePollution(true)).toBe(true);
      expect(sanitizePrototypePollution(false)).toBe(false);
      expect(sanitizePrototypePollution(null)).toBeNull();
      expect(sanitizePrototypePollution(undefined)).toBeUndefined();
    });

    it('handles empty objects and empty arrays', () => {
      expect(sanitizePrototypePollution({})).toEqual({});
      expect(sanitizePrototypePollution([])).toEqual([]);
    });

    it('safely handles mixed array with numbers, strings, and booleans', () => {
      const arr = [1, 'two', true, null, [3, 'four']];
      expect(sanitizePrototypePollution(arr)).toEqual(arr);
    });
  });

  describe('Structural Limits (Recursion Depth, Node Count, Array Length)', () => {
    it('throws ARRAY_TOO_LARGE when array exceeds MAX_ARRAY_LENGTH (1000 items)', () => {
      const hugeArray = Array.from({ length: MAX_ARRAY_LENGTH + 5 }, (_, i) => ({ id: i }));
      expect(() => sanitizePrototypePollution(hugeArray)).toThrow('ARRAY_TOO_LARGE');
    });

    it('throws TOO_MANY_NODES when total nodes exceed MAX_TOTAL_NODES (5000)', () => {
      const wide: Record<string, unknown> = {};
      for (let i = 0; i < MAX_TOTAL_NODES + 10; i++) {
        wide[`key_${i}`] = i;
      }
      expect(() => sanitizePrototypePollution(wide)).toThrow('TOO_MANY_NODES');
    });
  });
});
