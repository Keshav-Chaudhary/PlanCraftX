import { eventPlanSchema, type EventPlan } from '@/lib/schemas/event-plan';
import { ok, err, type Result } from '@/lib/result/result';

const MAX_SHARE_PAYLOAD_CHARS = 65_536; // 64 KB limit

export function toBase64Url(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'utf-8').toString('base64url');
  }
  const bytes = new TextEncoder().encode(str);
  let binString = '';
  for (const byte of bytes) {
    binString += String.fromCharCode(byte);
  }
  return btoa(binString).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function fromBase64Url(b64: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(b64, 'base64url').toString('utf-8');
  }
  let base64 = b64.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binString = atob(base64);
  const codePoints = Array.from(binString, (c) => c.charCodeAt(0));
  const bytes = new Uint8Array(codePoints);
  return new TextDecoder().decode(bytes);
}

/**
 * Encodes an EventPlan into a URL-safe base64url string.
 */
export function encodePlanToShareHash(plan: EventPlan): string {
  const json = JSON.stringify(plan);
  return toBase64Url(json);
}

/**
 * Decodes and validates a URL-safe share hash into a verified EventPlan.
 */
export function decodePlanFromShareHash(hash: string): Result<EventPlan, string> {
  if (!hash || hash.trim().length === 0) {
    return err('Share payload is empty.');
  }

  if (hash.length > MAX_SHARE_PAYLOAD_CHARS) {
    return err('Share payload exceeds maximum allowable size (64 KB).');
  }

  try {
    const jsonStr = fromBase64Url(hash.trim());
    const rawParsed: unknown = JSON.parse(jsonStr);

    const validation = eventPlanSchema.safeParse(rawParsed);
    if (!validation.success) {
      return err('Share link contains invalid or outdated plan schema data.');
    }

    return ok(validation.data);
  } catch {
    return err('Failed to decode share payload. Link may be malformed or truncated.');
  }
}
