import { describe, it, expect } from 'vitest';
import {
  isValidIpAddress,
  normalizeIpAddress,
  extractClientIp,
  getRateLimitIdentifier,
} from '../../lib/security/client-ip';

describe('Security: Client IP Extraction Adversarial Matrix & Validation', () => {
  describe('IPv4 Address Syntax & Boundaries', () => {
    it('accepts standard valid public IPv4', () => {
      expect(isValidIpAddress('203.0.113.195')).toBe(true);
      expect(isValidIpAddress('8.8.8.8')).toBe(true);
    });

    it('accepts 0.0.0.0 and 255.255.255.255 edge boundaries', () => {
      expect(isValidIpAddress('0.0.0.0')).toBe(true);
      expect(isValidIpAddress('255.255.255.255')).toBe(true);
    });

    it('rejects IPv4 octets greater than 255', () => {
      expect(isValidIpAddress('256.1.1.1')).toBe(false);
      expect(isValidIpAddress('1.256.1.1')).toBe(false);
      expect(isValidIpAddress('1.1.256.1')).toBe(false);
      expect(isValidIpAddress('1.1.1.256')).toBe(false);
    });

    it('rejects octets with leading zeros (preventing octal confusion)', () => {
      expect(isValidIpAddress('01.02.03.04')).toBe(false);
      expect(isValidIpAddress('192.168.01.1')).toBe(false);
    });

    it('rejects truncated IPv4 addresses with fewer than 4 octets', () => {
      expect(isValidIpAddress('192.168.1')).toBe(false);
      expect(isValidIpAddress('10.0')).toBe(false);
      expect(isValidIpAddress('127')).toBe(false);
    });

    it('rejects extended IPv4 addresses with more than 4 octets', () => {
      expect(isValidIpAddress('192.168.1.1.1')).toBe(false);
    });

    it('rejects negative numbers and non-numeric characters in IPv4', () => {
      expect(isValidIpAddress('-1.0.0.1')).toBe(false);
      expect(isValidIpAddress('192.168.a.1')).toBe(false);
      expect(isValidIpAddress('192.168.1.1; DROP TABLE')).toBe(false);
    });
  });

  describe('IPv6 Address Syntax & Brackets', () => {
    it('accepts standard IPv6 loopback and addresses', () => {
      expect(isValidIpAddress('::1')).toBe(true);
      expect(isValidIpAddress('2001:db8::1')).toBe(true);
      expect(isValidIpAddress('fe80::1ff:fe23:4567:890a')).toBe(true);
    });

    it('accepts bracket-encapsulated IPv6 addresses', () => {
      expect(isValidIpAddress('[::1]')).toBe(true);
      expect(isValidIpAddress('[2001:db8::1]')).toBe(true);
    });

    it('rejects IPv6 addresses with invalid hex characters', () => {
      expect(isValidIpAddress('2001:db8::g123')).toBe(false);
      expect(isValidIpAddress('2001:db8::xyz')).toBe(false);
    });

    it('rejects overly long address strings exceeding 45 characters', () => {
      const longIp = '2001:0db8:0000:0000:0000:0000:0000:0001:extra-padding-string';
      expect(isValidIpAddress(longIp)).toBe(false);
    });

    it('rejects empty or whitespace-only input', () => {
      expect(isValidIpAddress('')).toBe(false);
      expect(isValidIpAddress('   ')).toBe(false);
    });
  });

  describe('normalizeIpAddress', () => {
    it('strips enclosing brackets from IPv6', () => {
      expect(normalizeIpAddress('[2001:db8::1]')).toBe('2001:db8::1');
    });

    it('converts uppercase hex to lowercase', () => {
      expect(normalizeIpAddress('2001:0DB8::ABCD')).toBe('2001:0db8::abcd');
    });

    it('trims leading and trailing whitespace', () => {
      expect(normalizeIpAddress('  192.0.2.1  ')).toBe('192.0.2.1');
    });
  });

  describe('extractClientIp Precedence & Anti-Spoofing', () => {
    it('prioritizes Google Cloud x-appengine-user-ip over all other headers', () => {
      const headers = new Headers({
        'x-appengine-user-ip': '35.190.247.1',
        'cf-connecting-ip': '1.1.1.1',
        'x-real-ip': '2.2.2.2',
        'x-forwarded-for': '3.3.3.3',
      });
      expect(extractClientIp(headers)).toBe('35.190.247.1');
    });

    it('prioritizes cf-connecting-ip when x-appengine-user-ip is absent', () => {
      const headers = new Headers({
        'cf-connecting-ip': '198.51.100.42',
        'x-real-ip': '203.0.113.1',
        'x-forwarded-for': '192.0.2.1',
      });
      expect(extractClientIp(headers)).toBe('198.51.100.42');
    });

    it('prioritizes x-real-ip when edge provider headers are absent', () => {
      const headers = new Headers({
        'x-real-ip': '203.0.113.55',
        'x-forwarded-for': '192.0.2.1',
      });
      expect(extractClientIp(headers)).toBe('203.0.113.55');
    });

    it('selects rightmost valid IP in X-Forwarded-For chain to defeat client prepending', () => {
      // Attacker prepends fake 1.1.1.1, real edge proxy appends 198.51.100.2
      const headers = new Headers({
        'x-forwarded-for': '1.1.1.1, 10.0.0.1, 198.51.100.2',
      });
      expect(extractClientIp(headers)).toBe('198.51.100.2');
    });

    it('skips invalid entries in X-Forwarded-For and picks last valid IP', () => {
      const headers = new Headers({
        'x-forwarded-for': '203.0.113.10, invalid-ip-entry',
      });
      expect(extractClientIp(headers)).toBe('203.0.113.10');
    });

    it('falls back to 127.0.0.1 when all headers are missing', () => {
      const headers = new Headers({});
      expect(extractClientIp(headers)).toBe('127.0.0.1');
    });

    it('falls back to 127.0.0.1 when headers contain only invalid IP strings', () => {
      const headers = new Headers({
        'x-real-ip': 'invalid',
        'x-forwarded-for': 'malformed, bad-host',
      });
      expect(extractClientIp(headers)).toBe('127.0.0.1');
    });

    it('correctly handles bracketed IPv6 in x-forwarded-for', () => {
      const headers = new Headers({
        'x-forwarded-for': '[2001:db8::cafe]',
      });
      expect(extractClientIp(headers)).toBe('2001:db8::cafe');
    });
  });

  describe('getRateLimitIdentifier', () => {
    it('combines extracted IP and pathname into a scoped rate limit key', () => {
      const headers = new Headers({ 'x-real-ip': '198.51.100.99' });
      const key = getRateLimitIdentifier(headers, '/api/plan/generate');
      expect(key).toBe('198.51.100.99:/api/plan/generate');
    });

    it('creates distinct keys for different endpoints under the same IP', () => {
      const headers = new Headers({ 'x-real-ip': '198.51.100.99' });
      const key1 = getRateLimitIdentifier(headers, '/api/chat');
      const key2 = getRateLimitIdentifier(headers, '/api/ideas');
      expect(key1).not.toBe(key2);
      expect(key1).toBe('198.51.100.99:/api/chat');
      expect(key2).toBe('198.51.100.99:/api/ideas');
    });
  });
});
