import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  searchCoordinates,
  fetchWeatherForecast,
  interpretWeatherCode,
} from '../../../lib/api-clients/open-meteo';

describe('Open-Meteo Extended Weather & Geocoding Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Geocoding Coordinate Lookups', () => {
    it('returns coordinates when geocoding finds city', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [{ latitude: 18.5204, longitude: 73.8567, name: 'Pune', country: 'India' }],
        }),
      } as Response);

      const res = await searchCoordinates('Pune');
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.value.latitude).toBe(18.5204);
        expect(res.value.longitude).toBe(73.8567);
        expect(res.value.name).toBe('Pune');
      }
    });

    it('returns LOCATION_NOT_FOUND when results array is empty', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [] }),
      } as Response);

      const res = await searchCoordinates('NonExistentCityXYZ123');
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe('LOCATION_NOT_FOUND');
      }
    });

    it('returns UPSTREAM_ERROR when geocoding HTTP fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 503,
      } as Response);

      const res = await searchCoordinates('Paris');
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe('UPSTREAM_ERROR');
      }
    });
  });

  describe('Weather Forecast Interpretations & Invariants', () => {
    it('parses clear sky weather code 0', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          daily: {
            weathercode: [0],
            temperature_2m_max: [32],
            temperature_2m_min: [24],
            precipitation_probability_max: [5],
          },
        }),
      } as Response);

      const res = await fetchWeatherForecast(18.52, 73.85, '2026-11-20');
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.value.conditionSummary).toBe('Clear sky');
        expect(res.value.maxTempC).toBe(32);
        expect(res.value.precipitationProbability).toBe(5);
      }
    });

    it('parses thunderstorm code 95', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          daily: {
            weathercode: [95],
            temperature_2m_max: [28],
            temperature_2m_min: [20],
            precipitation_probability_max: [85],
          },
        }),
      } as Response);

      const res = await fetchWeatherForecast(18.52, 73.85, '2026-07-15');
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.value.conditionSummary).toBe('Thunderstorm');
        expect(res.value.precipitationProbability).toBe(85);
      }
    });

    it('returns NO_FORECAST_DATA when daily weathercode array is empty', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ daily: { weathercode: [] } }),
      } as Response);

      const res = await fetchWeatherForecast(18.52, 73.85, '2026-11-20');
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe('NO_FORECAST_DATA');
      }
    });
  });

  describe('Weather Code Interpretation Matrix & Boundaries', () => {
    const testCases: readonly [number, string][] = [
      [-1, 'Overcast'],
      [0, 'Clear sky'],
      [1, 'Partly cloudy'],
      [3, 'Partly cloudy'],
      [4, 'Foggy'],
      [48, 'Foggy'],
      [49, 'Drizzle'],
      [55, 'Drizzle'],
      [56, 'Rain'],
      [65, 'Rain'],
      [66, 'Snow'],
      [75, 'Snow'],
      [76, 'Rain showers'],
      [82, 'Rain showers'],
      [83, 'Thunderstorm'],
      [99, 'Thunderstorm'],
      [100, 'Overcast'],
      [NaN, 'Overcast'],
      [Infinity, 'Overcast'],
    ];

    it.each(testCases)('correctly interprets code %s as %s', (code, expected) => {
      expect(interpretWeatherCode(code)).toBe(expected);
    });
  });
});
