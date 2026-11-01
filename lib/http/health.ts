import { NextResponse } from 'next/server';

export interface HealthCheckPayload {
  readonly status: 'healthy';
  readonly service: string;
  readonly version: string;
  readonly uptime: number;
  readonly timestamp: string;
  readonly checks: {
    readonly memoryUsageMb: number;
    readonly status: 'operational';
  };
}

export function createHealthResponse(service: string): NextResponse<HealthCheckPayload> {
  const heapMb = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
  const uptimeSeconds = Math.floor(process.uptime());

  return NextResponse.json(
    {
      status: 'healthy',
      service,
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
