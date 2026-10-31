import { describe, it, expect } from 'vitest';
import { GET as healthApiRoute } from '../../app/api/health/route';
import { GET as rootHealthRoute } from '../../app/health/route';
import { GET as metricsRoute } from '../../app/api/metrics/route';

describe('Operational Health & Observability Endpoints', () => {
  it('GET /api/health returns healthy JSON status with checks', async () => {
    const res = await healthApiRoute();
    expect(res.status).toBe(200);

    const data = (await res.json()) as {
      status: string;
      service: string;
      version: string;
      uptime: number;
      checks: {
        memoryUsageMb: number;
      };
    };

    expect(data.status).toBe('healthy');
    expect(data.service).toBe('plancraftx-api');
    expect(data.version).toBe('2.0.0');
    expect(typeof data.uptime).toBe('number');
    expect(typeof data.checks.memoryUsageMb).toBe('number');
  });

  it('GET /health returns root healthy JSON status', async () => {
    const res = await rootHealthRoute();
    expect(res.status).toBe(200);

    const data = (await res.json()) as {
      status: string;
      service: string;
      uptime: number;
    };

    expect(data.status).toBe('healthy');
    expect(data.service).toBe('plancraftx');
    expect(typeof data.uptime).toBe('number');
  });

  it('GET /api/metrics returns system and memory observability metrics', async () => {
    const res = await metricsRoute();
    expect(res.status).toBe(200);

    const data = (await res.json()) as {
      service: string;
      memory: {
        heapUsedMb: number;
        heapTotalMb: number;
      };
      system: {
        nodeVersion: string;
        platform: string;
      };
    };

    expect(data.service).toBe('plancraftx-metrics');
    expect(typeof data.memory.heapUsedMb).toBe('number');
    expect(typeof data.memory.heapTotalMb).toBe('number');
    expect(typeof data.system.nodeVersion).toBe('string');
  });
});
