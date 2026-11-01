import { NextResponse } from 'next/server';
import { placesRequestSchema } from '@/lib/schemas/api-schemas';
import { searchOsmPlaces } from '@/lib/api-clients/osm';
import { validateJsonBody } from '@/lib/http/validated-json';

export async function POST(request: Request) {
  const validation = await validateJsonBody(request, placesRequestSchema);
  if (!validation.success) {
    return validation.response;
  }

  const { query, location, limit } = validation.data;
  const placesRes = await searchOsmPlaces(query, location, limit);

  if (!placesRes.success) {
    return NextResponse.json(
      { error: placesRes.error.code, message: placesRes.error.message, canRetry: true },
      { status: 502 },
    );
  }

  return NextResponse.json({ places: placesRes.value }, { status: 200 });
}
