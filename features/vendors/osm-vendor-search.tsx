'use client';

import { useState } from 'react';
import type { OsmPlace } from '@/lib/api-clients/osm';

interface OsmVendorSearchProps {
  readonly location: string;
  readonly onAddPlaceAsVendor: (place: OsmPlace) => void;
}

export function OsmVendorSearch({ location, onAddPlaceAsVendor }: OsmVendorSearchProps) {
  const [osmQuery, setOsmQuery] = useState('caterer');
  const [osmResults, setOsmResults] = useState<OsmPlace[]>([]);
  const [osmLoading, setOsmLoading] = useState(false);
  const [osmError, setOsmError] = useState<string | null>(null);

  const handleSearchOsm = async (queryTerm: string) => {
    setOsmLoading(true);
    setOsmError(null);
    setOsmQuery(queryTerm);

    try {
      const res = await fetch('/api/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryTerm,
          location,
          limit: 5,
        }),
      });

      if (!res.ok) {
        throw new Error('Places search service currently unavailable.');
      }

      const data = (await res.json()) as { places: OsmPlace[] };
      setOsmResults(data.places || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Search failed.';
      setOsmError(msg);
    } finally {
      setOsmLoading(false);
    }
  };

  return (
    <div className="border-border bg-surface rounded-xl border p-6 shadow-sm">
      <h3 className="text-foreground text-base font-bold">
        Find Real Local Vendors via OpenStreetMap
      </h3>
      <p className="text-muted mt-1 text-xs">
        Search verified local suppliers, venues, and municipal facilities around{' '}
        <strong>{location}</strong> using live OpenStreetMap Nominatim.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => handleSearchOsm('bakery')}
          className="border-border bg-surface hover:bg-surface-elevated text-foreground rounded-lg border px-3 py-1 text-xs font-medium"
        >
          🍰 Bakeries
        </button>
        <button
          type="button"
          onClick={() => handleSearchOsm('caterer')}
          className="border-border bg-surface hover:bg-surface-elevated text-foreground rounded-lg border px-3 py-1 text-xs font-medium"
        >
          🍽️ Caterers
        </button>
        <button
          type="button"
          onClick={() => handleSearchOsm('florist')}
          className="border-border bg-surface hover:bg-surface-elevated text-foreground rounded-lg border px-3 py-1 text-xs font-medium"
        >
          💐 Florists
        </button>
        <button
          type="button"
          onClick={() => handleSearchOsm('community centre')}
          className="border-border bg-surface hover:bg-surface-elevated text-foreground rounded-lg border px-3 py-1 text-xs font-medium"
        >
          🏛️ Venues / Centers
        </button>
      </div>

      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={osmQuery}
          onChange={(e) => setOsmQuery(e.target.value)}
          placeholder="Search custom vendor type (e.g. sound equipment, tent rental)"
          className="border-border bg-surface text-foreground flex-1 rounded-lg border px-3 py-1.5 text-xs"
        />
        <button
          type="button"
          onClick={() => handleSearchOsm(osmQuery)}
          disabled={osmLoading}
          className="bg-primary text-primary-fg rounded-lg px-4 py-1.5 text-xs font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {osmLoading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {osmError && (
        <div
          role="alert"
          className="border-danger/30 bg-danger/10 text-danger mt-3 flex items-center justify-between rounded-lg border p-3 text-xs"
        >
          <span>{osmError}</span>
          <button
            type="button"
            onClick={() => handleSearchOsm(osmQuery)}
            className="text-danger ml-2 font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {osmResults.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-foreground text-xs font-semibold tracking-wider uppercase">
            Discovered Places ({osmResults.length})
          </h4>
          <div className="divide-border divide-y rounded-lg border">
            {osmResults.map((place) => (
              <div key={place.osmId} className="flex items-center justify-between p-3 text-xs">
                <div>
                  <strong className="text-foreground">{place.name}</strong>
                  <p className="text-muted max-w-lg truncate text-[11px]">{place.displayName}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onAddPlaceAsVendor(place)}
                  className="bg-surface hover:bg-surface-elevated border-border text-primary rounded border px-2.5 py-1 text-xs font-semibold"
                >
                  + Add to Checklist
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
