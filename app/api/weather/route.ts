import { NextResponse } from 'next/server';
import { z } from 'zod';
import { searchCoordinates, fetchWeatherForecast } from '@/lib/api-clients/open-meteo';
import { validateJsonBody } from '@/lib/http/validated-json';

const weatherQuerySchema = z.object({
  location: z.string().min(1).max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function POST(request: Request) {
  const validation = await validateJsonBody(request, weatherQuerySchema);
  if (!validation.success) {
    return validation.response;
  }

  const { location, date } = validation.data;
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
