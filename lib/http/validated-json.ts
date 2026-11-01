import { NextResponse } from 'next/server';
import type { z } from 'zod';

export const DEFAULT_MAX_BODY_SIZE_BYTES = 128 * 1024; // 128 KB default limit

export interface ValidateJsonOptions {
  readonly maxSizeBytes?: number;
  readonly allowedMediaTypes?: readonly string[];
}

export type ValidatedJsonFailureError =
  | 'UNSUPPORTED_MEDIA_TYPE'
  | 'PAYLOAD_TOO_LARGE'
  | 'INVALID_JSON'
  | 'VALIDATION_ERROR'
  | 'BODY_READ_ERROR';

export type ValidatedJsonResult<T> =
  | {
      readonly success: true;
      readonly data: T;
    }
  | {
      readonly success: false;
      readonly error: ValidatedJsonFailureError;
      readonly response: NextResponse;
    };

function checkMediaType(request: Request): ValidatedJsonResult<never> | null {
  const contentType = request.headers.get('content-type');
  if (!contentType) return null;

  const lower = contentType.toLowerCase();
  const isPermittedTextOrJson =
    lower.includes('application/json') ||
    lower.includes('text/plain') ||
    lower.includes('text/json');

  if (!isPermittedTextOrJson) {
    return {
      success: false,
      error: 'UNSUPPORTED_MEDIA_TYPE',
      response: NextResponse.json(
        {
          error: 'Unsupported Media Type',
          message: 'Expected Content-Type: application/json',
        },
        { status: 415 },
      ),
    };
  }
  return null;
}

function mergeChunksToUtf8(chunks: readonly Uint8Array[]): string {
  if (chunks.length === 0) return '';
  const totalLength = chunks.reduce((acc, c) => acc + c.byteLength, 0);
  const merged = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder('utf-8', { fatal: false }).decode(merged);
}

async function readStreamBounded(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  maxBytes: number,
): Promise<
  { ok: true; text: string } | { ok: false; code: 'PAYLOAD_TOO_LARGE' | 'BODY_READ_ERROR' }
> {
  const chunks: Uint8Array[] = [];
  let bytesReceived = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        bytesReceived += value.byteLength;
        if (bytesReceived > maxBytes) {
          await reader.cancel('PAYLOAD_TOO_LARGE').catch(() => {});
          return { ok: false, code: 'PAYLOAD_TOO_LARGE' };
        }
        chunks.push(value);
      }
    }
  } catch {
    return { ok: false, code: 'BODY_READ_ERROR' };
  }

  return { ok: true, text: mergeChunksToUtf8(chunks) };
}

async function readFallbackBounded(
  request: Request,
  maxBytes: number,
): Promise<
  { ok: true; text: string } | { ok: false; code: 'PAYLOAD_TOO_LARGE' | 'BODY_READ_ERROR' }
> {
  try {
    const text = await request.text();
    const byteLength = new TextEncoder().encode(text).byteLength;
    if (byteLength > maxBytes) {
      return { ok: false, code: 'PAYLOAD_TOO_LARGE' };
    }
    return { ok: true, text };
  } catch {
    return { ok: false, code: 'BODY_READ_ERROR' };
  }
}

async function readBoundedRequestBody(
  request: Request,
  maxBytes: number,
): Promise<
  { ok: true; text: string } | { ok: false; code: 'PAYLOAD_TOO_LARGE' | 'BODY_READ_ERROR' }
> {
  const contentLength = Number(request.headers.get('content-length'));
  if (!Number.isNaN(contentLength) && contentLength > maxBytes) {
    return { ok: false, code: 'PAYLOAD_TOO_LARGE' };
  }

  if (!request.body) {
    return { ok: true, text: '' };
  }

  if (typeof request.body.getReader === 'function') {
    return readStreamBounded(request.body.getReader(), maxBytes);
  }

  return readFallbackBounded(request, maxBytes);
}

function parseJsonPayload(text: string): { ok: true; data: unknown } | { ok: false } {
  if (!text.trim()) return { ok: false };
  try {
    return { ok: true, data: JSON.parse(text) };
  } catch {
    return { ok: false };
  }
}

/**
 * Hardened HTTP JSON boundary validator.
 * Enforces media-type validation, streaming body-size limits, safe JSON parsing,
 * and strict Zod runtime schema validation.
 */
export async function validateJsonBody<TSchema extends z.ZodTypeAny>(
  request: Request,
  schema: TSchema,
  options?: ValidateJsonOptions,
): Promise<ValidatedJsonResult<z.output<TSchema>>> {
  const mediaTypeError = checkMediaType(request);
  if (mediaTypeError) return mediaTypeError;

  const maxBytes = options?.maxSizeBytes ?? DEFAULT_MAX_BODY_SIZE_BYTES;
  const readResult = await readBoundedRequestBody(request, maxBytes);
  if (!readResult.ok) {
    if (readResult.code === 'PAYLOAD_TOO_LARGE') {
      return {
        success: false,
        error: 'PAYLOAD_TOO_LARGE',
        response: NextResponse.json(
          {
            error: 'Payload Too Large',
            message: `Request body exceeds maximum allowable limit of ${maxBytes} bytes`,
          },
          { status: 413 },
        ),
      };
    }
    return {
      success: false,
      error: 'BODY_READ_ERROR',
      response: NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 }),
    };
  }

  const parsedJson = parseJsonPayload(readResult.text);
  if (!parsedJson.ok) {
    return {
      success: false,
      error: 'INVALID_JSON',
      response: NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 }),
    };
  }

  const validated = schema.safeParse(parsedJson.data);
  if (!validated.success) {
    return {
      success: false,
      error: 'VALIDATION_ERROR',
      response: NextResponse.json(
        { error: 'Validation Error', details: validated.error.issues },
        { status: 400 },
      ),
    };
  }

  return { success: true, data: validated.data };
}
