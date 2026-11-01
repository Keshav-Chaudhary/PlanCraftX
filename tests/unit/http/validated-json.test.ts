import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { validateJsonBody } from '../../../lib/http/validated-json';

const sampleSchema = z.object({
  name: z.string().min(1),
  age: z.number().int().positive().optional(),
  role: z.enum(['admin', 'planner', 'guest']),
  tags: z.array(z.string()).default([]),
});

describe('HTTP Boundary: validateJsonBody Hardened Helper', () => {
  describe('Valid JSON & Schema Ingestion', () => {
    it('accepts valid JSON conforming to the schema', async () => {
      const payload = { name: 'Alice', role: 'planner', tags: ['vip'] };
      const req = new Request('http://localhost/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const res = await validateJsonBody(req, sampleSchema);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.name).toBe('Alice');
        expect(res.data.role).toBe('planner');
        expect(res.data.tags).toEqual(['vip']);
      }
    });

    it('accepts valid JSON with optional fields and charset parameters', async () => {
      const payload = { name: 'Bob', age: 30, role: 'admin' };
      const req = new Request('http://localhost/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload),
      });

      const res = await validateJsonBody(req, sampleSchema);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.age).toBe(30);
      }
    });

    it('permits requests when Content-Type is omitted for client flexibility', async () => {
      const payload = { name: 'Charlie', role: 'guest' };
      const req = new Request('http://localhost/api/test', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const res = await validateJsonBody(req, sampleSchema);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.name).toBe('Charlie');
      }
    });
  });

  describe('Invalid Payloads & Schema Violations', () => {
    it('returns 400 INVALID_JSON on syntactically broken JSON', async () => {
      const req = new Request('http://localhost/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{"name": "broken',
      });

      const res = await validateJsonBody(req, sampleSchema);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error).toBe('INVALID_JSON');
        expect(res.response.status).toBe(400);
        const data = await res.response.json();
        expect(data.error).toBe('Invalid JSON request body');
      }
    });

    it('returns 400 INVALID_JSON on empty body string', async () => {
      const req = new Request('http://localhost/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '   ',
      });

      const res = await validateJsonBody(req, sampleSchema);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error).toBe('INVALID_JSON');
        expect(res.response.status).toBe(400);
      }
    });

    it('returns 400 VALIDATION_ERROR when missing required fields or wrong types', async () => {
      const req = new Request('http://localhost/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Dan', role: 'unknown_role' }),
      });

      const res = await validateJsonBody(req, sampleSchema);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error).toBe('VALIDATION_ERROR');
        expect(res.response.status).toBe(400);
        const data = await res.response.json();
        expect(data.error).toBe('Validation Error');
        expect(Array.isArray(data.details)).toBe(true);
      }
    });

    it('returns 415 UNSUPPORTED_MEDIA_TYPE on non-JSON content types', async () => {
      const req = new Request('http://localhost/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data; boundary=--boundary' },
        body: 'multipart form data',
      });

      const res = await validateJsonBody(req, sampleSchema);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error).toBe('UNSUPPORTED_MEDIA_TYPE');
        expect(res.response.status).toBe(415);
        const data = await res.response.json();
        expect(data.error).toBe('Unsupported Media Type');
      }
    });
  });

  describe('Body Size Limits & Streaming Boundaries', () => {
    it('rejects requests immediately if Content-Length exceeds maxSizeBytes', async () => {
      const req = new Request('http://localhost/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': '20000',
        },
        body: JSON.stringify({ name: 'Eva', role: 'guest' }),
      });

      const res = await validateJsonBody(req, sampleSchema, { maxSizeBytes: 1024 });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error).toBe('PAYLOAD_TOO_LARGE');
        expect(res.response.status).toBe(413);
        const data = await res.response.json();
        expect(data.error).toBe('Payload Too Large');
      }
    });

    it('enforces limit on live streaming chunks even without Content-Length', async () => {
      const encoder = new TextEncoder();
      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          // Send 2 chunks of 1KB each (total 2048 bytes > 1024 limit)
          controller.enqueue(encoder.encode('{"name":"' + 'a'.repeat(1024)));
          controller.enqueue(encoder.encode('b'.repeat(1024) + '","role":"guest"}'));
          controller.close();
        },
      });

      const req = new Request('http://localhost/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // @ts-expect-error duplex required in Node fetch for ReadableStream
        duplex: 'half',
        body: stream,
      });

      const res = await validateJsonBody(req, sampleSchema, { maxSizeBytes: 1024 });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error).toBe('PAYLOAD_TOO_LARGE');
        expect(res.response.status).toBe(413);
      }
    });

    it('accepts payloads exactly at or below size boundary', async () => {
      const exactBody = JSON.stringify({ name: 'Fay', role: 'guest' });
      const exactBytes = new TextEncoder().encode(exactBody).byteLength;

      const req = new Request('http://localhost/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: exactBody,
      });

      const res = await validateJsonBody(req, sampleSchema, { maxSizeBytes: exactBytes });
      expect(res.success).toBe(true);
    });
  });
});
