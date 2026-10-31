import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchCoordinates, fetchWeatherForecast } from '../../../lib/api-clients/open-meteo';

describe('Open-Meteo External API Client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns coordinates when geocoding succeeds', async () => {
    const mockResponse = {
      results: [
        { latitude: 41.8781, longitude: -87.6298, name: 'Chicago', country: 'United States' },
      ],
    };
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const res = await searchCoordinates('Chicago');
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.value.latitude).toBe(41.8781);
      expect(res.value.name).toBe('Chicago');
    }
  });

  it('returns LOCATION_NOT_FOUND when results are empty', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [] }),
    } as Response);

    const res = await searchCoordinates('NonExistentPlaceXYZ');
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe('LOCATION_NOT_FOUND');
    }
  });

  it('returns UPSTREAM_ERROR when geocoding API responds with non-ok status', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 503,
    } as Response);

    const res = await searchCoordinates('Chicago');
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe('UPSTREAM_ERROR');
    }
  });

  it('returns NETWORK_ERROR when geocoding fetch throws', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Connection timed out'));

    const res = await searchCoordinates('Chicago');
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe('NETWORK_ERROR');
    }
  });

  it('returns weather forecast data when API succeeds and covers various weather codes', async () => {
    const mockDaily = {
      daily: {
        weathercode: [0],
        temperature_2m_max: [24.5],
        temperature_2m_min: [15.2],
        precipitation_probability_max: [10],
      },
    };
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockDaily,
    } as Response);

    const res = await fetchWeatherForecast(41.8781, -87.6298, '2026-06-15');
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.value.conditionSummary).toBe('Clear sky');
    }

    const codes = [
      { code: 45, summary: 'Foggy' },
      { code: 51, summary: 'Drizzle' },
      { code: 61, summary: 'Rain' },
      { code: 71, summary: 'Snow' },
      { code: 80, summary: 'Rain showers' },
      { code: 95, summary: 'Thunderstorm' },
      { code: 150, summary: 'Overcast' },
    ];
    for (const { code, summary } of codes) {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ daily: { weathercode: [code] } }),
      } as Response);
      const r = await fetchWeatherForecast(10, 10, '2026-06-15');
      if (r.success) {
        expect(r.value.conditionSummary).toBe(summary);
      }
    }
  });

  it('handles weather forecast upstream error, empty daily data, and network error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);
    const res1 = await fetchWeatherForecast(10, 10, '2026-06-15');
    expect(res1.success).toBe(false);
    if (!res1.success) expect(res1.error.code).toBe('UPSTREAM_ERROR');

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ daily: {} }),
    } as Response);
    const res2 = await fetchWeatherForecast(10, 10, '2026-06-15');
    expect(res2.success).toBe(false);
    if (!res2.success) expect(res2.error.code).toBe('NO_FORECAST_DATA');

    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network drop'));
    const res3 = await fetchWeatherForecast(10, 10, '2026-06-15');
    expect(res3.success).toBe(false);
    if (!res3.success) expect(res3.error.code).toBe('NETWORK_ERROR');
  });
});
