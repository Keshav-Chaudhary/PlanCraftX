import { z } from 'zod';
import { getEnv } from '../config/env';
import { type Result, ok, err } from '../result/result';
import { secureFetch } from '../security/secure-fetch';

export interface WeatherData {
  readonly maxTempC: number;
  readonly minTempC: number;
  readonly precipitationProbability: number;
  readonly weatherCode: number;
  readonly conditionSummary: string;
}

export interface GeocodingResult {
  readonly latitude: number;
  readonly longitude: number;
  readonly name: string;
  readonly country: string;
}

interface WeatherCodeRange {
  readonly maxCode: number;
  readonly description: string;
}

const WEATHER_CODE_TABLE: readonly WeatherCodeRange[] = [
  { maxCode: 0, description: 'Clear sky' },
  { maxCode: 3, description: 'Partly cloudy' },
  { maxCode: 48, description: 'Foggy' },
  { maxCode: 55, description: 'Drizzle' },
  { maxCode: 65, description: 'Rain' },
  { maxCode: 75, description: 'Snow' },
  { maxCode: 82, description: 'Rain showers' },
  { maxCode: 99, description: 'Thunderstorm' },
] as const;

export function interpretWeatherCode(code: number): string {
  if (!Number.isFinite(code) || code < 0) {
    return 'Overcast';
  }
  const match = WEATHER_CODE_TABLE.find((entry) => code <= entry.maxCode);
  return match ? match.description : 'Overcast';
}

const geocodingItemSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  name: z.string().optional(),
  country: z.string().optional(),
});

const geocodingResponseSchema = z.object({
  results: z.array(geocodingItemSchema).optional(),
});

/**
 * Searches coordinates for a city or region name using Open-Meteo Geocoding API.
 */
export async function searchCoordinates(
  query: string,
): Promise<Result<GeocodingResult, { code: string; message: string }>> {
  const env = getEnv();
  const url = `${env.OPEN_METEO_GEOCODING_BASE_URL}/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;

  try {
    const res = await secureFetch(url, { timeoutMs: 8000 });
    if (!res.ok) {
      return err({
        code: 'UPSTREAM_ERROR',
        message: `Open-Meteo Geocoding returned status ${res.status}`,
      });
    }

    const rawJson: unknown = await res.json();
    const parsed = geocodingResponseSchema.safeParse(rawJson);
    const first = parsed.success ? parsed.data.results?.[0] : undefined;
    if (!first) {
      return err({
        code: 'LOCATION_NOT_FOUND',
        message: `No geographic coordinates found for "${query}".`,
      });
    }

    return ok({
      latitude: first.latitude,
      longitude: first.longitude,
      name: first.name || query,
      country: first.country || '',
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Network error';
    return err({
      code: 'NETWORK_ERROR',
      message: `Failed to query Open-Meteo Geocoding: ${msg}`,
    });
  }
}

const dailyPayloadSchema = z.object({
  weathercode: z.array(z.number()).optional(),
  temperature_2m_max: z.array(z.number()).optional(),
  temperature_2m_min: z.array(z.number()).optional(),
  precipitation_probability_max: z.array(z.number()).optional(),
});

const forecastResponseSchema = z.object({
  daily: dailyPayloadSchema.optional(),
});

type DailyPayload = z.infer<typeof dailyPayloadSchema>;

function getFirstNumber(arr?: number[], fallback: number = 0): number {
  return arr?.[0] ?? fallback;
}

function parseDailyWeather(daily?: DailyPayload): WeatherData | null {
  if (!daily?.weathercode?.length) {
    return null;
  }
  const weatherCode = getFirstNumber(daily.weathercode, 0);
  return {
    maxTempC: getFirstNumber(daily.temperature_2m_max, 20),
    minTempC: getFirstNumber(daily.temperature_2m_min, 10),
    precipitationProbability: getFirstNumber(daily.precipitation_probability_max, 0),
    weatherCode,
    conditionSummary: interpretWeatherCode(weatherCode),
  };
}

/**
 * Fetches daily weather forecast for specified coordinates and date.
 */
export async function fetchWeatherForecast(
  latitude: number,
  longitude: number,
  date: string,
): Promise<Result<WeatherData, { code: string; message: string }>> {
  const env = getEnv();
  const url = `${env.OPEN_METEO_FORECAST_BASE_URL}/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&start_date=${date}&end_date=${date}`;

  try {
    const res = await secureFetch(url, { timeoutMs: 8000 });
    if (!res.ok) {
      return err({
        code: 'UPSTREAM_ERROR',
        message: `Open-Meteo Forecast returned status ${res.status}`,
      });
    }

    const rawJson: unknown = await res.json();
    const forecastParsed = forecastResponseSchema.safeParse(rawJson);
    const parsed = forecastParsed.success ? parseDailyWeather(forecastParsed.data.daily) : null;

    if (!parsed) {
      return err({
        code: 'NO_FORECAST_DATA',
        message: 'No forecast data available for the requested date and location.',
      });
    }

    return ok(parsed);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Network error';
    return err({
      code: 'NETWORK_ERROR',
      message: `Failed to query Open-Meteo Forecast: ${msg}`,
    });
  }
}
