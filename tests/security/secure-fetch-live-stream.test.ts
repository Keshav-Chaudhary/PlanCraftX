import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import * as http from 'node:http';
import type { AddressInfo } from 'node:net';
import { secureFetch, SsrffSecurityError } from '../../lib/security/secure-fetch';

describe('Security: secureFetch Live HTTP Server Streaming & Timeout Defense', () => {
  let server: http.Server;
  let serverUrl: string;

  beforeAll(async () => {
    server = http.createServer((req, res) => {
      const url = new URL(req.url ?? '/', `http://${req.headers.host}`);

      if (url.pathname === '/stalled-headers') {
        // Do not write headers, stall connection indefinitely
        return;
      }

      if (url.pathname === '/slow-stream') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        // Write one small chunk, then stall indefinitely
        res.write('{"initial":');
        // Do not close; let timeout abort body read
        return;
      }

      if (url.pathname === '/oversized-stream') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        // Write chunks indefinitely until aborted
        const interval = setInterval(() => {
          try {
            res.write('x'.repeat(4096));
          } catch {
            clearInterval(interval);
          }
        }, 10);

        req.on('close', () => {
          clearInterval(interval);
        });
        return;
      }

      if (url.pathname === '/normal') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
        return;
      }

      res.writeHead(404);
      res.end('Not Found');
    });

    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const addr = server.address() as AddressInfo;
        serverUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it('successfully fetches normal response from loopback in development mode', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    try {
      const res = await secureFetch(`${serverUrl}/normal`);
      const body = await res.json();
      expect(body).toEqual({ status: 'ok' });
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  it('aborts stalled connection before headers when timeoutMs is exceeded', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    try {
      await expect(
        secureFetch(`${serverUrl}/stalled-headers`, { timeoutMs: 150 }),
      ).rejects.toThrow();
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  it('aborts stalled streaming body read when timeoutMs is exceeded', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    try {
      const res = await secureFetch(`${serverUrl}/slow-stream`, { timeoutMs: 150 });
      await expect(res.text()).rejects.toThrow();
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  it('terminates live stream when stream byte count exceeds maxResponseSizeBytes', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    try {
      // 8KB limit
      const res = await secureFetch(`${serverUrl}/oversized-stream`, {
        maxResponseSizeBytes: 8192,
      });

      await expect(res.text()).rejects.toThrow(/exceeded maximum allowable limit/i);
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  it('rejects loopback access when NODE_ENV is production', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      await expect(secureFetch(`${serverUrl}/normal`)).rejects.toThrow(SsrffSecurityError);
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });
});
