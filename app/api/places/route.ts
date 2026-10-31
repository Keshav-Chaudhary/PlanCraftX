import { NextResponse } from 'next/server';
import { placesRequestSchema } from '@/lib/schemas/api-schemas';
import { searchOsmPlaces } from '@/lib/api-clients/osm';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
  }

  const parsed = placesRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation Error', details: parsed.error.issues },
      { status: 400 },
    );
  }

  const { query, location, limit } = parsed.data;
  const placesRes = await searchOsmPlaces(query, location, limit);

  if (!placesRes.success) {
    return NextResponse.json(
      { error: placesRes.error.code, message: placesRes.error.message, canRetry: true },
      { status: 502 },
    );
  }

  return NextResponse.json({ places: placesRes.value }, { status: 200 });
}
