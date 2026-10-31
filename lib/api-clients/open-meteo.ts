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

function interpretWeatherCode(code: number): string {
  if (code === 0) return 'Clear sky';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 48) return 'Foggy';
  if (code <= 55) return 'Drizzle';
  if (code <= 65) return 'Rain';
  if (code <= 75) return 'Snow';
  if (code <= 82) return 'Rain showers';
  if (code <= 99) return 'Thunderstorm';
  return 'Overcast';
}

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

    const data = (await res.json()) as { results?: Array<Record<string, unknown>> };
    const first = data.results?.[0];
    if (!first || typeof first['latitude'] !== 'number' || typeof first['longitude'] !== 'number') {
      return err({
        code: 'LOCATION_NOT_FOUND',
        message: `No geographic coordinates found for "${query}".`,
      });
    }

    return ok({
      latitude: first['latitude'],
      longitude: first['longitude'],
      name: String(first['name'] || query),
      country: String(first['country'] || ''),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Network error';
    return err({
      code: 'NETWORK_ERROR',
      message: `Failed to query Open-Meteo Geocoding: ${msg}`,
    });
  }
}

interface DailyPayload {
  weathercode?: number[];
  temperature_2m_max?: number[];
  temperature_2m_min?: number[];
  precipitation_probability_max?: number[];
}

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

    const data = (await res.json()) as { daily?: DailyPayload };
    const parsed = parseDailyWeather(data.daily);

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
