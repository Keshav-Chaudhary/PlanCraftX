import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  validateOutboundUrl,
  secureFetch,
  SsrfSecurityError,
} from '../../lib/security/secure-fetch';

describe('Security: SSRF Outbound Destination Defense', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    vi.restoreAllMocks();
  });

  it('permits approved production upstream destinations', () => {
    process.env.NODE_ENV = 'production';
    const parsed = validateOutboundUrl('https://api.frankfurter.app/latest');
    expect(parsed.hostname).toBe('api.frankfurter.app');
  });

  it('blocks unapproved external domains', () => {
    process.env.NODE_ENV = 'production';
    expect(() => validateOutboundUrl('https://evil-attacker.com/steal')).toThrowError(
      SsrfSecurityError,
    );
  });

  it('blocks subdomain suffix confusion attempts', () => {
    process.env.NODE_ENV = 'production';
    expect(() =>
      validateOutboundUrl('https://generativelanguage.googleapis.com.attacker.com/api'),
    ).toThrowError(SsrfSecurityError);
  });

  it('blocks insecure HTTP in production', () => {
    process.env.NODE_ENV = 'production';
    expect(() => validateOutboundUrl('http://api.frankfurter.app/latest')).toThrowError(
      SsrfSecurityError,
    );
  });

  it('blocks private IPv4 spaces and loopback in production', () => {
    process.env.NODE_ENV = 'production';
    expect(() => validateOutboundUrl('https://127.0.0.1/admin')).toThrowError(SsrfSecurityError);
    expect(() => validateOutboundUrl('https://10.0.0.1/internal')).toThrowError(SsrfSecurityError);
    expect(() => validateOutboundUrl('https://192.168.1.1/router')).toThrowError(SsrfSecurityError);
  });

  it('blocks cloud metadata endpoint (169.254.169.254)', () => {
    expect(() => validateOutboundUrl('http://169.254.169.254/computeMetadata/v1/')).toThrowError(
      SsrfSecurityError,
    );
  });

  it('blocks credential-bearing URLs', () => {
    expect(() => validateOutboundUrl('https://admin:secret@api.frankfurter.app/data')).toThrowError(
      SsrfSecurityError,
    );
  });

  it('blocks non-standard ports in production', () => {
    process.env.NODE_ENV = 'production';
    expect(() => validateOutboundUrl('https://api.frankfurter.app:8443/latest')).toThrowError(
      SsrfSecurityError,
    );
  });

  it('enforces redirect: "error" to defeat redirect-based SSRF', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({}),
    } as Response);

    await secureFetch('https://api.frankfurter.app/latest');
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.frankfurter.app/latest',
      expect.objectContaining({ redirect: 'error' }),
    );
  });

  it('rejects unexpected content-type when expectedContentType is specified', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'text/html' }),
    } as Response);

    await expect(
      secureFetch('https://api.frankfurter.app/latest', {
        expectedContentType: 'application/json',
      }),
    ).rejects.toThrowError(SsrfSecurityError);
  });

  it('rejects oversized responses when content-length exceeds maxBytes', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      headers: new Headers({
        'content-type': 'application/json',
        'content-length': '5000000',
      }),
    } as Response);

    await expect(
      secureFetch('https://api.frankfurter.app/latest', {
        maxResponseSizeBytes: 100000,
      }),
    ).rejects.toThrowError(SsrfSecurityError);
  });

  it('terminates streaming responses in real-time when body byte count exceeds maxBytes', async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        // Enqueue two 1KB chunks (total 2048 bytes > 1024 bytes limit)
        controller.enqueue(new Uint8Array(1024));
        controller.enqueue(new Uint8Array(1024));
        controller.close();
      },
    });

    const mockResponse = new Response(stream, {
      headers: new Headers({ 'content-type': 'application/json' }),
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(mockResponse);

    const res = await secureFetch('https://api.frankfurter.app/latest', {
      maxResponseSizeBytes: 1024,
    });

    await expect(res.arrayBuffer()).rejects.toThrowError(
      /exceeded maximum allowable limit of 1024 bytes/i,
    );
  });

  it('allows localhost in development mode', () => {
    process.env.NODE_ENV = 'development';
    delete process.env['VERCEL_ENV'];
    const parsed = validateOutboundUrl('http://localhost:3000/api/mock');
    expect(parsed.hostname).toBe('localhost');
  });
});
