import { createHealthResponse } from '@/lib/http/health';

export const dynamic = 'force-static';

export async function GET() {
  return createHealthResponse('plancraftx-api');
}
