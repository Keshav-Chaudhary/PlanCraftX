import { z } from 'zod';
import { getEnv } from '../config/env';
import { type Result, ok, err } from '../result/result';
import { secureFetch } from '../security/secure-fetch';
import type { OsmPlace } from '../schemas/api-schemas';

export type { OsmPlace };

const rawOsmItemSchema = z.object({
  osm_id: z.union([z.string(), z.number()]),
  name: z.string().optional(),
  display_name: z.string(),
  type: z.string().optional(),
  class: z.string().optional(),
  lat: z.string().optional(),
  lon: z.string().optional(),
});

const osmSearchResponseSchema = z.array(rawOsmItemSchema);

type RawOsmItem = z.infer<typeof rawOsmItemSchema>;

function resolvePlaceName(place: RawOsmItem, fallbackQuery: string): string {
  const rawName = place.name;
  if (typeof rawName === 'string' && rawName.trim().length > 0) {
    return rawName.trim();
  }
  const displayName = place.display_name;
  const firstSegment = displayName.split(',')[0]?.trim();
  return firstSegment || fallbackQuery;
}

function mapRawPlaceToOsmPlace(place: RawOsmItem, fallbackQuery: string): OsmPlace {
  return {
    osmId: String(place.osm_id),
    name: resolvePlaceName(place, fallbackQuery),
    displayName: place.display_name,
    type: place.type || 'venue',
    category: place.class || 'place',
    latitude: parseFloat(place.lat || '0'),
    longitude: parseFloat(place.lon || '0'),
  };
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

    const rawJson: unknown = await res.json();
    const parsed = osmSearchResponseSchema.safeParse(rawJson);
    if (!parsed.success) {
      return ok([]);
    }

    const places: OsmPlace[] = parsed.data.map((p) => mapRawPlaceToOsmPlace(p, query));
    return ok(places);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Network error';
    return err({
      code: 'NETWORK_ERROR',
      message: `Failed to query OpenStreetMap: ${msg}`,
    });
  }
}
