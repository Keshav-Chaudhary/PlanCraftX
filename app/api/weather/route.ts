import { NextResponse } from 'next/server';
import { z } from 'zod';
import { searchCoordinates, fetchWeatherForecast } from '@/lib/api-clients/open-meteo';

const weatherQuerySchema = z.object({
  location: z.string().min(1).max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
  }

  const parsed = weatherQuerySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation Error', details: parsed.error.issues },
      { status: 400 },
    );
  }

  const { location, date } = parsed.data;
  const geoRes = await searchCoordinates(location);

  if (!geoRes.success) {
    return NextResponse.json(
      { error: geoRes.error.code, message: geoRes.error.message, canRetry: true },
      { status: 404 },
    );
  }

  const forecastRes = await fetchWeatherForecast(
    geoRes.value.latitude,
    geoRes.value.longitude,
    date,
  );

  if (!forecastRes.success) {
    return NextResponse.json(
      { error: forecastRes.error.code, message: forecastRes.error.message, canRetry: true },
      { status: 502 },
    );
  }

  return NextResponse.json(
    {
      location: geoRes.value,
      date,
      weather: forecastRes.value,
    },
    { status: 200 },
  );
}
