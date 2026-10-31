import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export async function GET() {
  const mem = process.memoryUsage();
  const isProd = process.env.NODE_ENV === 'production';
  const nodeMajor = process.version.split('.')[0] || 'v20';

  return NextResponse.json(
    {
      service: 'plancraftx-metrics',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      memory: {
        heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
        heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
        rssMb: Math.round(mem.rss / 1024 / 1024),
      },
      system: {
        nodeVersion: isProd ? `${nodeMajor}.x` : process.version,
        platform: isProd ? 'cloud-runtime' : process.platform,
        arch: isProd ? 'x86_64' : process.arch,
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
