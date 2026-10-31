import { describe, it, expect } from 'vitest';
import {
  isValidIpAddress,
  normalizeIpAddress,
  extractClientIp,
  getRateLimitIdentifier,
} from '../../lib/security/client-ip';

describe('Security: Client IP Extraction & Anti-Spoofing', () => {
  it('validates standard IPv4 addresses correctly', () => {
    expect(isValidIpAddress('192.168.1.1')).toBe(true);
    expect(isValidIpAddress('203.0.113.195')).toBe(true);
    expect(isValidIpAddress('256.0.0.1')).toBe(false);
    expect(isValidIpAddress('192.168.1')).toBe(false);
    expect(isValidIpAddress('1.2.3.4.5')).toBe(false);
    expect(isValidIpAddress('malicious<script>')).toBe(false);
  });

  it('validates standard IPv6 addresses correctly', () => {
    expect(isValidIpAddress('2001:db8::1')).toBe(true);
    expect(isValidIpAddress('::1')).toBe(true);
    expect(isValidIpAddress('[::1]')).toBe(true);
    expect(isValidIpAddress('fe80::1ff:fe23:4567:890a')).toBe(true);
    expect(isValidIpAddress('2001:xyz::1')).toBe(false);
  });

  it('normalizes bracketed and uppercase IPv6 addresses', () => {
    expect(normalizeIpAddress(' [2001:DB8::1] ')).toBe('2001:db8::1');
    expect(normalizeIpAddress(' 192.168.1.5 ')).toBe('192.168.1.5');
  });

  it('prioritizes Google Cloud / Firebase verified x-appengine-user-ip', () => {
    const headers = new Headers({
      'x-appengine-user-ip': '203.0.113.50',
      'x-forwarded-for': '1.1.1.1, 2.2.2.2',
    });
    expect(extractClientIp(headers)).toBe('203.0.113.50');
  });

  it('prioritizes Cloudflare verified cf-connecting-ip when present', () => {
    const headers = new Headers({
      'cf-connecting-ip': '198.51.100.22',
      'x-forwarded-for': '1.1.1.1',
    });
    expect(extractClientIp(headers)).toBe('198.51.100.22');
  });

  it('uses x-real-ip when gcp and cloudflare headers are absent', () => {
    const headers = new Headers({
      'x-real-ip': '198.51.100.99',
    });
    expect(extractClientIp(headers)).toBe('198.51.100.99');
  });

  it('resists client-side prepend spoofing in X-Forwarded-For by taking rightmost valid hop', () => {
    // Attacker sends X-Forwarded-For: 10.0.0.1, proxy appends 198.51.100.88
    const headers = new Headers({
      'x-forwarded-for': '10.0.0.1, 198.51.100.88',
    });
    expect(extractClientIp(headers)).toBe('198.51.100.88');
  });

  it('rejects malformed and injection strings in forwarded headers', () => {
    const headers = new Headers({
      'x-forwarded-for': '../../etc/passwd, <script>alert(1)</script>',
    });
    expect(extractClientIp(headers)).toBe('127.0.0.1');
  });

  it('generates consistent rate limit identifier', () => {
    const headers = new Headers({
      'x-appengine-user-ip': '203.0.113.50',
    });
    const id = getRateLimitIdentifier(headers, '/api/plan/generate');
    expect(id).toBe('203.0.113.50:/api/plan/generate');
  });
});
