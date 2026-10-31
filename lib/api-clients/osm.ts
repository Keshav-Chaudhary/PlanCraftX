import { getEnv } from '../config/env';
import { type Result, ok, err } from '../result/result';
import { secureFetch } from '../security/secure-fetch';

export interface OsmPlace {
  readonly osmId: string;
  readonly name: string;
  readonly displayName: string;
  readonly type: string;
  readonly category: string;
  readonly latitude: number;
  readonly longitude: number;
}

/**
 * Searches real nearby places, venues, and suppliers via OpenStreetMap Nominatim.
 */
export async function searchOsmPlaces(
  query: string,
  location: string,
  limit: number = 5,
): Promise<Result<OsmPlace[], { code: string; message: string }>> {
  const env = getEnv();
  const searchQ = `${query} ${location}`.trim();
  const url = `${env.NOMINATIM_BASE_URL}/search?q=${encodeURIComponent(searchQ)}&format=json&addressdetails=1&limit=${limit}`;

  try {
    const res = await secureFetch(url, {
      headers: {
        'User-Agent':
          'PlanCraftX-Assistant/1.0 (https://PlanCraftX.local; contact@PlanCraftX.local)',
        Accept: 'application/json',
      },
      timeoutMs: 8000,
    });

    if (!res.ok) {
      return err({
        code: 'UPSTREAM_ERROR',
        message: `OpenStreetMap Nominatim returned status ${res.status}`,
      });
    }

    const data = (await res.json()) as Array<Record<string, unknown>>;
    if (!Array.isArray(data)) {
      return ok([]);
    }

    const places: OsmPlace[] = data
      .filter((p) => typeof p['osm_id'] !== 'undefined' && typeof p['display_name'] === 'string')
      .map((p) => {
        const name =
          typeof p['name'] === 'string' && p['name'].trim()
            ? p['name']
            : (p['display_name'] as string).split(',')[0]?.trim() || query;

        return {
          osmId: String(p['osm_id']),
          name,
          displayName: String(p['display_name']),
          type: String(p['type'] || 'venue'),
          category: String(p['class'] || 'place'),
          latitude: parseFloat(String(p['lat'] || '0')),
          longitude: parseFloat(String(p['lon'] || '0')),
        };
      });

    return ok(places);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Network error';
    return err({
      code: 'NETWORK_ERROR',
      message: `Failed to query OpenStreetMap: ${msg}`,
    });
  }
}
