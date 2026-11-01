/**
 * Hardened Outbound HTTP Fetch Client.
 * Defends against Server-Side Request Forgery (SSRF), unapproved destination egress,
 * redirect-based metadata exfiltration, and unbounded response memory consumption.
 */

import { ALLOWED_UPSTREAM_HOSTS } from '../config/env';

export interface SecureFetchOptions extends RequestInit {
  readonly maxResponseSizeBytes?: number;
  readonly timeoutMs?: number;
  readonly expectedContentType?: string;
}

export class SsrffSecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SsrffSecurityError';
  }
}

export { SsrffSecurityError as SsrfSecurityError };

const DEFAULT_MAX_RESPONSE_SIZE = 2 * 1024 * 1024; // 2 MB
const DEFAULT_TIMEOUT_MS = 8000; // 8 seconds

// Private and loopback IP ranges to prevent SSRF against internal infrastructure
const PRIVATE_IP_PATTERNS = [
  /^127\./, // 127.0.0.0/8 (Loopback)
  /^10\./, // 10.0.0.0/8 (Private)
  /^172\.(1[6-9]|2\d|3[01])\./, // 172.16.0.0/12 (Private)
  /^192\.168\./, // 192.168.0.0/16 (Private)
  /^169\.254\./, // 169.254.0.0/16 (Link-Local / Cloud Metadata)
  /^0\./, // 0.0.0.0/8
  /^::1$/, // IPv6 loopback
  /^fc00:/i, // IPv6 Unique Local
  /^fe80:/i, // IPv6 Link-Local
];

function validateProtocolAndCredentials(parsed: URL, isProd: boolean): void {
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new SsrffSecurityError(`Unsupported outbound protocol: ${parsed.protocol}`);
  }
  if (isProd && parsed.protocol !== 'https:') {
    throw new SsrffSecurityError(
      `Insecure HTTP protocol disallowed in production: ${parsed.protocol}`,
    );
  }
  if (parsed.username || parsed.password) {
    throw new SsrffSecurityError('Credential-bearing URLs are strictly forbidden');
  }
  if (isProd && parsed.port && parsed.port !== '443') {
    throw new SsrffSecurityError(
      `Non-standard port ${parsed.port} is strictly disallowed in production`,
    );
  }
}

function validateTargetHost(hostname: string, isProd: boolean): void {
  for (const pattern of PRIVATE_IP_PATTERNS) {
    if (pattern.test(hostname)) {
      if (!isProd && (hostname === 'localhost' || hostname === '127.0.0.1')) {
        break; // Allowed in local dev/test
      }
      throw new SsrffSecurityError(
        `Outbound request to private/internal host ${hostname} is blocked`,
      );
    }
  }

  if (isProd || (!hostname.includes('localhost') && hostname !== '127.0.0.1')) {
    const isApproved = (ALLOWED_UPSTREAM_HOSTS as readonly string[]).includes(hostname);
    if (!isApproved) {
      throw new SsrffSecurityError(
        `Destination hostname "${hostname}" is not in the approved upstream allowlist`,
      );
    }
  }
}

/**
 * Validates a target URL against SSRF rules before dispatching.
 */
export function validateOutboundUrl(targetUrl: string): URL {
  if (/[\u0000-\u001F\u007F]/.test(targetUrl)) {
    throw new SsrffSecurityError('URL contains disallowed control characters');
  }

  let parsed: URL;
  try {
    parsed = new URL(targetUrl);
  } catch {
    throw new SsrffSecurityError(`Malformed outbound URL: ${targetUrl}`);
  }

  const isProd = process.env['NODE_ENV'] === 'production' || Boolean(process.env['VERCEL_ENV']);
  validateProtocolAndCredentials(parsed, isProd);
  validateTargetHost(parsed.hostname.toLowerCase(), isProd);

  return parsed;
}

function validateResponseContentType(response: Response, expectedType?: string): void {
  if (!expectedType || !response.headers?.get) return;
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes(expectedType.toLowerCase())) {
    throw new SsrffSecurityError(
      `Unexpected upstream content-type "${contentType}". Expected: "${expectedType}"`,
    );
  }
}

function validateResponseSize(response: Response, maxBytes?: number): void {
  const contentLength = response.headers?.get?.('content-length');
  const limit = maxBytes ?? DEFAULT_MAX_RESPONSE_SIZE;
  if (contentLength && Number(contentLength) > limit) {
    throw new SsrffSecurityError(
      `Upstream response length (${contentLength} bytes) exceeds maximum allowable limit of ${limit} bytes`,
    );
  }
}

/**
 * Creates a stream transform that tracks byte consumption in real-time,
 * immediately terminating upstream streaming if it exceeds the maximum allowable limit.
 */
function createBoundedStream(
  body: ReadableStream<Uint8Array>,
  maxBytes: number,
): ReadableStream<Uint8Array> {
  let bytesRead = 0;
  return body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        bytesRead += chunk.byteLength;
        if (bytesRead > maxBytes) {
          controller.error(
            new SsrffSecurityError(
              `Upstream response body exceeded maximum allowable limit of ${maxBytes} bytes while streaming`,
            ),
          );
          return;
        }
        controller.enqueue(chunk);
      },
    }),
  );
}

/**
 * Dispatches an outbound HTTP request with SSRF validations, redirect locks,
 * response size bounding, and timeouts.
 */
export async function secureFetch(
  targetUrl: string,
  options: SecureFetchOptions = {},
): Promise<Response> {
  const validatedUrl = validateOutboundUrl(targetUrl);
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const timeoutSignal = AbortSignal.timeout(timeoutMs);

  const signal = options.signal ? AbortSignal.any([options.signal, timeoutSignal]) : timeoutSignal;

  const response = await fetch(validatedUrl.toString(), {
    ...options,
    redirect: 'error',
    signal,
  });

  validateResponseContentType(response, options.expectedContentType);
  validateResponseSize(response, options.maxResponseSizeBytes);

  const limit = options.maxResponseSizeBytes ?? DEFAULT_MAX_RESPONSE_SIZE;
  if (response.body && typeof response.body.pipeThrough === 'function') {
    const boundedBody = createBoundedStream(response.body, limit);
    return new Response(boundedBody, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  }

  return response;
}
