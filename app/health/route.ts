import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export async function GET() {
  const heapMb = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
  const uptimeSeconds = Math.floor(process.uptime());

  return NextResponse.json(
    {
      status: 'healthy',
      service: 'plancraftx',
      version: '2.0.0',
      uptime: uptimeSeconds,
      timestamp: new Date().toISOString(),
      checks: {
        memoryUsageMb: heapMb,
        status: 'operational',
      },
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    },
  );
}
