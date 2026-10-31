import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchPublicHolidays } from '../../../lib/api-clients/nager-date';
import { fetchExchangeRate } from '../../../lib/api-clients/frankfurter';
import { searchOsmPlaces } from '../../../lib/api-clients/osm';

describe('External API Clients Unit Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Nager.Date Holidays Client', () => {
    it('parses public holidays array', async () => {
      const mockHolidays = [
        { date: '2026-07-04', name: 'Independence Day', localName: 'Independence Day' },
      ];
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockHolidays,
      } as Response);

      const res = await fetchPublicHolidays(2026, 'US');
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.value).toHaveLength(1);
        expect(res.value[0]?.name).toBe('Independence Day');
      }
    });

    it('handles upstream error, non-array response, and network errors', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);
      const resUp = await fetchPublicHolidays(2026, 'US');
      expect(resUp.success).toBe(false);
      if (!resUp.success) expect(resUp.error.code).toBe('UPSTREAM_ERROR');

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ not: 'an array' }),
      } as Response);
      const resParse = await fetchPublicHolidays(2026, 'US');
      expect(resParse.success).toBe(true);
      if (resParse.success) expect(resParse.value).toHaveLength(0);

      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Timeout'));
      const resNet = await fetchPublicHolidays(2026, 'US');
      expect(resNet.success).toBe(false);
      if (!resNet.success) expect(resNet.error.code).toBe('NETWORK_ERROR');
    });
  });

  describe('Frankfurter Exchange Rate Client', () => {
    it('returns 1 immediately when from and to currencies are identical', async () => {
      const res = await fetchExchangeRate('USD', 'USD');
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.value).toBe(1);
      }
    });

    it('returns fetched rate between two currencies', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ rates: { EUR: 0.92 } }),
      } as Response);

      const res = await fetchExchangeRate('USD', 'EUR');
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.value).toBe(0.92);
      }
    });

    it('handles upstream error, missing currency in response, and network errors', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 502,
      } as Response);
      const res1 = await fetchExchangeRate('USD', 'EUR');
      expect(res1.success).toBe(false);
      if (!res1.success) expect(res1.error.code).toBe('UPSTREAM_ERROR');

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ rates: {} }),
      } as Response);
      const res2 = await fetchExchangeRate('USD', 'EUR');
      expect(res2.success).toBe(false);
      if (!res2.success) expect(res2.error.code).toBe('RATE_NOT_AVAILABLE');

      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('DNS Failure'));
      const res3 = await fetchExchangeRate('USD', 'EUR');
      expect(res3.success).toBe(false);
      if (!res3.success) expect(res3.error.code).toBe('NETWORK_ERROR');
    });
  });

  describe('OpenStreetMap Nominatim Places Client', () => {
    it('parses real places from Nominatim', async () => {
      const mockPlaces = [
        {
          osm_id: 123456,
          name: 'Central Community Hall',
          display_name: 'Central Community Hall, Main Street, Boston',
          type: 'community_centre',
          class: 'amenity',
          lat: '42.3601',
          lon: '-71.0589',
        },
      ];
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlaces,
      } as Response);

      const res = await searchOsmPlaces('community centre', 'Boston', 5);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.value).toHaveLength(1);
        expect(res.value[0]?.name).toBe('Central Community Hall');
        expect(res.value[0]?.osmId).toBe('123456');
      }
    });

    it('handles upstream error, empty non-array response, and network errors', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);
      const res1 = await searchOsmPlaces('bakery', 'Boston');
      expect(res1.success).toBe(false);
      if (!res1.success) expect(res1.error.code).toBe('UPSTREAM_ERROR');

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ error: 'bad request' }),
      } as Response);
      const res2 = await searchOsmPlaces('bakery', 'Boston');
      expect(res2.success).toBe(true);
      if (res2.success) expect(res2.value).toHaveLength(0);

      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Connection reset'));
      const res3 = await searchOsmPlaces('bakery', 'Boston');
      expect(res3.success).toBe(false);
      if (!res3.success) expect(res3.error.code).toBe('NETWORK_ERROR');
    });
  });
});
