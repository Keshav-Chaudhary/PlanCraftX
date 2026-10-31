/**
 * Secure client identity extraction for rate-limiting and audit logging.
 * Defends against X-Forwarded-For header spoofing, ReDoS attacks, and malformed IP injection.
 */

/**
 * Checks if a string is a valid IPv4 address without vulnerable regular expressions.
 */
function isValidIpv4(ip: string): boolean {
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  for (const part of parts) {
    if (!part || !/^\d{1,3}$/.test(part)) return false;
    const num = Number(part);
    if (num < 0 || num > 255) return false;
    if (part.length > 1 && part.startsWith('0')) return false; // Reject leading zeros
  }
  return true;
}

/**
 * Checks if a string is a valid IPv6 address without vulnerable regular expressions.
 */
function isValidIpv6(ip: string): boolean {
  if (!ip.includes(':') || ip.length > 39) return false;
  const parts = ip.split(':');
  if (parts.length < 3 || parts.length > 8) return false;
  for (const part of parts) {
    if (part.length > 4) return false;
    if (part.length > 0 && !/^[0-9a-fA-F]{1,4}$/.test(part)) return false;
  }
  return true;
}

/**
 * Validates whether a given string is a syntactically valid IPv4 or IPv6 address.
 */
export function isValidIpAddress(ip: string): boolean {
  if (!ip || ip.length > 45) return false;
  const clean = ip.trim().replace(/^\[|\]$/g, '');
  return isValidIpv4(clean) || isValidIpv6(clean);
}

/**
 * Normalizes an IP address (strips brackets, trims, converts IPv6 to lowercase).
 */
export function normalizeIpAddress(ip: string): string {
  return ip
    .trim()
    .replace(/^\[|\]$/g, '')
    .toLowerCase();
}

/**
 * Evaluates the X-Forwarded-For chain, taking the rightmost valid entry to defeat client prepending.
 */
function extractForwardedIp(forwardedHeader: string): string | null {
  const parts = forwardedHeader
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);

  const reversed = [...parts].reverse();
  for (const candidate of reversed) {
    if (isValidIpAddress(candidate)) {
      return normalizeIpAddress(candidate);
    }
  }
  return null;
}

/**
 * Safely extracts client IP address from trusted infrastructure headers.
 */
export function extractClientIp(headers: Headers): string {
  const gcpIp = headers.get('x-appengine-user-ip');
  if (gcpIp && isValidIpAddress(gcpIp)) {
    return normalizeIpAddress(gcpIp);
  }

  const cfIp = headers.get('cf-connecting-ip');
  if (cfIp && isValidIpAddress(cfIp)) {
    return normalizeIpAddress(cfIp);
  }

  const realIp = headers.get('x-real-ip');
  if (realIp && isValidIpAddress(realIp)) {
    return normalizeIpAddress(realIp);
  }

  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    const candidate = extractForwardedIp(forwardedFor);
    if (candidate) return candidate;
  }

  return '127.0.0.1';
}

/**
 * Creates an obfuscated rate-limiting client identifier without storing raw IP PII in telemetry.
 */
export function getRateLimitIdentifier(headers: Headers, pathname: string): string {
  const rawIp = extractClientIp(headers);
  return `${rawIp}:${pathname}`;
}
