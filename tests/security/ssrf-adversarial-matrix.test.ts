import { describe, it, expect, afterEach } from 'vitest';
import { validateOutboundUrl, SsrffSecurityError } from '../../lib/security/secure-fetch';

describe('Security: SSRF Adversarial Matrix & IP Obfuscation Defenses', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe('Production Network Boundary & IP Obfuscation', () => {
    it('blocks decimal (dword) IP representations of loopback (2130706433)', () => {
      process.env.NODE_ENV = 'production';
      expect(() => validateOutboundUrl('http://2130706433/')).toThrow(SsrffSecurityError);
    });

    it('blocks hex IP representations of loopback (0x7f000001)', () => {
      process.env.NODE_ENV = 'production';
      expect(() => validateOutboundUrl('http://0x7f000001/')).toThrow(SsrffSecurityError);
    });

    it('blocks octal IP representations of loopback (0177.0.0.1)', () => {
      process.env.NODE_ENV = 'production';
      expect(() => validateOutboundUrl('http://0177.0.0.1/')).toThrow(SsrffSecurityError);
    });

    it('blocks standard IPv6 loopback [::1] in production', () => {
      process.env.NODE_ENV = 'production';
      expect(() => validateOutboundUrl('https://[::1]/api')).toThrow(SsrffSecurityError);
    });

    it('blocks fully expanded IPv6 loopback [0:0:0:0:0:0:0:1]', () => {
      process.env.NODE_ENV = 'production';
      expect(() => validateOutboundUrl('https://[0:0:0:0:0:0:0:1]/')).toThrow(SsrffSecurityError);
    });

    it('blocks IPv6 link-local addresses [fe80::1]', () => {
      process.env.NODE_ENV = 'production';
      expect(() => validateOutboundUrl('https://[fe80::1]/admin')).toThrow(SsrffSecurityError);
    });

    it('blocks IPv6 unique local addresses [fc00::1]', () => {
      process.env.NODE_ENV = 'production';
      expect(() => validateOutboundUrl('https://[fc00::1]/data')).toThrow(SsrffSecurityError);
    });

    it('blocks IPv6 unique local addresses [fd12:3456:789a::1]', () => {
      process.env.NODE_ENV = 'production';
      expect(() => validateOutboundUrl('https://[fd12:3456:789a::1]/data')).toThrow(
        SsrffSecurityError,
      );
    });

    it('blocks IPv4-mapped IPv6 loopback [::ffff:127.0.0.1]', () => {
      process.env.NODE_ENV = 'production';
      expect(() => validateOutboundUrl('https://[::ffff:127.0.0.1]/')).toThrow(SsrffSecurityError);
    });

    it('blocks IPv4-mapped IPv6 private space [::ffff:10.0.0.1]', () => {
      process.env.NODE_ENV = 'production';
      expect(() => validateOutboundUrl('https://[::ffff:10.0.0.1]/')).toThrow(SsrffSecurityError);
    });

    it('blocks 0.0.0.0 (all interfaces bind target)', () => {
      process.env.NODE_ENV = 'production';
      expect(() => validateOutboundUrl('https://0.0.0.0/')).toThrow(SsrffSecurityError);
    });

    it('blocks 255.255.255.255 (broadcast address)', () => {
      process.env.NODE_ENV = 'production';
      expect(() => validateOutboundUrl('https://255.255.255.255/')).toThrow(SsrffSecurityError);
    });

    it('blocks 127.0.0.2 to 127.255.255.254 loopback subnet', () => {
      process.env.NODE_ENV = 'production';
      expect(() => validateOutboundUrl('https://127.0.0.2/')).toThrow(SsrffSecurityError);
      expect(() => validateOutboundUrl('https://127.255.255.254/')).toThrow(SsrffSecurityError);
    });
  });

  describe('Domain & Hostname Spoofing Defenses', () => {
    it('blocks subdomain suffix spoofing on generativelanguage.googleapis.com', () => {
      process.env.NODE_ENV = 'production';
      expect(() =>
        validateOutboundUrl('https://generativelanguage.googleapis.com.evil-domain.com/v1'),
      ).toThrow(SsrffSecurityError);
    });

    it('blocks prefix spoofing on api.frankfurter.app', () => {
      process.env.NODE_ENV = 'production';
      expect(() => validateOutboundUrl('https://not-api.frankfurter.app/latest')).toThrow(
        SsrffSecurityError,
      );
    });

    it('blocks unapproved subdomains of approved domains (e.g. internal.open-meteo.com)', () => {
      process.env.NODE_ENV = 'production';
      expect(() => validateOutboundUrl('https://internal.open-meteo.com/v1')).toThrow(
        SsrffSecurityError,
      );
    });

    it('allows valid designated subdomains (geocoding-api.open-meteo.com)', () => {
      process.env.NODE_ENV = 'production';
      const parsed = validateOutboundUrl(
        'https://geocoding-api.open-meteo.com/v1/search?name=Paris',
      );
      expect(parsed.hostname).toBe('geocoding-api.open-meteo.com');
    });

    it('allows case-insensitive host matching (API.FRANKFURTER.APP)', () => {
      process.env.NODE_ENV = 'production';
      const parsed = validateOutboundUrl('https://API.FRANKFURTER.APP/latest?from=USD');
      expect(parsed.hostname).toBe('api.frankfurter.app');
    });

    it('allows case-insensitive host matching (GENERATIVELANGUAGE.GOOGLEAPIS.COM)', () => {
      process.env.NODE_ENV = 'production';
      const parsed = validateOutboundUrl(
        'https://GENERATIVELANGUAGE.GOOGLEAPIS.COM/v1beta/models/gemini-2.5-flash',
      );
      expect(parsed.hostname).toBe('generativelanguage.googleapis.com');
    });
  });

  describe('Protocol, Port, and Credential Security', () => {
    it('blocks non-standard port 8080 on approved domains in production', () => {
      process.env.NODE_ENV = 'production';
      expect(() => validateOutboundUrl('https://api.frankfurter.app:8080/latest')).toThrow(
        SsrffSecurityError,
      );
    });

    it('blocks port 22 (SSH) on approved domains in production', () => {
      process.env.NODE_ENV = 'production';
      expect(() => validateOutboundUrl('https://api.frankfurter.app:22/latest')).toThrow(
        SsrffSecurityError,
      );
    });

    it('blocks port 25 (SMTP) on approved domains in production', () => {
      process.env.NODE_ENV = 'production';
      expect(() => validateOutboundUrl('https://api.frankfurter.app:25/latest')).toThrow(
        SsrffSecurityError,
      );
    });

    it('blocks port 6379 (Redis) on approved domains in production', () => {
      process.env.NODE_ENV = 'production';
      expect(() => validateOutboundUrl('https://api.frankfurter.app:6379/latest')).toThrow(
        SsrffSecurityError,
      );
    });

    it('blocks gopher:// protocol', () => {
      expect(() => validateOutboundUrl('gopher://api.frankfurter.app/1')).toThrow(
        SsrffSecurityError,
      );
    });

    it('blocks file:// protocol', () => {
      expect(() => validateOutboundUrl('file:///etc/passwd')).toThrow(SsrffSecurityError);
    });

    it('blocks ftp:// protocol', () => {
      expect(() => validateOutboundUrl('ftp://api.frankfurter.app/file.txt')).toThrow(
        SsrffSecurityError,
      );
    });

    it('blocks javascript: pseudo-protocol', () => {
      expect(() => validateOutboundUrl('javascript:alert(1)')).toThrow(SsrffSecurityError);
    });

    it('blocks data: URI scheme', () => {
      expect(() => validateOutboundUrl('data:text/plain;base64,SGVsbG8=')).toThrow(
        SsrffSecurityError,
      );
    });

    it('blocks embedded password without username (https://:secret@domain)', () => {
      expect(() => validateOutboundUrl('https://:secret@api.frankfurter.app/')).toThrow(
        SsrffSecurityError,
      );
    });

    it('blocks embedded username only (https://admin@domain)', () => {
      expect(() => validateOutboundUrl('https://admin@api.frankfurter.app/')).toThrow(
        SsrffSecurityError,
      );
    });

    it('rejects malformed URLs with control characters', () => {
      expect(() => validateOutboundUrl('https://api.frankfurter.app/\u0000admin')).toThrow();
    });
  });
});
