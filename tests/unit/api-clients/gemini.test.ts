import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateGeminiStructured, generateGeminiStream } from '../../../lib/api-clients/gemini';
import { resetEnvCache } from '../../../lib/config/env';
import { z } from 'zod';

const mockGenerateContent = vi.fn();
const mockGenerateContentStream = vi.fn();

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class {
      models = {
        generateContent: mockGenerateContent,
        generateContentStream: mockGenerateContentStream,
      };
    },
  };
});

describe('Gemini API Client with @google/genai SDK', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env['GEMINI_API_KEY'] = 'test-gemini-key';
    process.env['GEMINI_MODEL'] = 'gemini-2.5-flash';
    resetEnvCache();
  });

  it('returns MISSING_API_KEY when GEMINI_API_KEY is unset', async () => {
    delete process.env['GEMINI_API_KEY'];
    resetEnvCache();
    const res = await generateGeminiStructured('prompt', z.object({ ok: z.boolean() }));
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe('MISSING_API_KEY');
    }

    const streamRes = await generateGeminiStream('prompt');
    expect(streamRes.success).toBe(false);
    if (!streamRes.success) {
      expect(streamRes.error.code).toBe('MISSING_API_KEY');
    }

    process.env['GEMINI_API_KEY'] = 'test-gemini-key';
    resetEnvCache();
  });

  it('generates structured JSON output and validates schema', async () => {
    const validJson = JSON.stringify({ category: 'Venue', weight: 40 });
    mockGenerateContent.mockResolvedValueOnce({ text: validJson });

    const schema = z.object({ category: z.string(), weight: z.number() });
    const res = await generateGeminiStructured('prompt', schema);

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.value).toEqual({ category: 'Venue', weight: 40 });
    }
  });

  it('returns SCHEMA_VALIDATION_FAILED if returned JSON violates schema', async () => {
    const invalidJson = JSON.stringify({ category: 'Venue', weight: 'forty' });
    mockGenerateContent.mockResolvedValueOnce({ text: invalidJson });

    const schema = z.object({ category: z.string(), weight: z.number() });
    const res = await generateGeminiStructured('prompt', schema);

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe('SCHEMA_VALIDATION_FAILED');
    }
  });

  it('handles rate limit 429 errors gracefully', async () => {
    mockGenerateContent.mockRejectedValueOnce(
      new Error('Resource has been exhausted (e.g. check quota, 429).'),
    );

    const schema = z.object({ ok: z.boolean() });
    const res = await generateGeminiStructured('prompt', schema);

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe('RATE_LIMITED');
    }
  });

  it('streams content chunks as async generator', async () => {
    async function* mockStream() {
      yield { text: 'chunk1 ' };
      yield { text: 'chunk2' };
    }
    mockGenerateContentStream.mockResolvedValueOnce(mockStream());

    const streamRes = await generateGeminiStream('prompt');
    expect(streamRes.success).toBe(true);
    if (streamRes.success) {
      const chunks: string[] = [];
      for await (const chunk of streamRes.value) {
        chunks.push(chunk);
      }
      expect(chunks.join('')).toBe('chunk1 chunk2');
    }
  });

  it('returns UPSTREAM_FAILURE when Gemini returns empty response or throws generic error', async () => {
    // Empty text
    mockGenerateContent.mockResolvedValueOnce({ text: '' });
    const resEmpty = await generateGeminiStructured('prompt', z.object({ ok: z.boolean() }));
    expect(resEmpty.success).toBe(false);
    if (!resEmpty.success) expect(resEmpty.error.code).toBe('UPSTREAM_FAILURE');

    // Syntax-invalid JSON
    mockGenerateContent.mockResolvedValueOnce({ text: 'not json {' });
    const resSyntax = await generateGeminiStructured('prompt', z.object({ ok: z.boolean() }));
    expect(resSyntax.success).toBe(false);
    if (!resSyntax.success) expect(resSyntax.error.code).toBe('SCHEMA_VALIDATION_FAILED');

    // Generic error
    mockGenerateContent.mockRejectedValue(new Error('Internal server error'));
    const resGeneric = await generateGeminiStructured('prompt', z.object({ ok: z.boolean() }));
    expect(resGeneric.success).toBe(false);
    if (!resGeneric.success) expect(resGeneric.error.code).toBe('UPSTREAM_FAILURE');

    // Streaming call throws error
    mockGenerateContentStream.mockRejectedValue(
      new Error('Stream network drop with key=secret_val_123'),
    );
    const resStreamErr = await generateGeminiStream('prompt');
    expect(resStreamErr.success).toBe(false);
    if (!resStreamErr.success) {
      expect(resStreamErr.error.code).toBe('UPSTREAM_FAILURE');
      expect(resStreamErr.error.message).toContain('key=[REDACTED]');
      expect(resStreamErr.error.message).not.toContain('secret_val_123');
    }

    // Streaming call throws 429 rate limit
    mockGenerateContentStream.mockRejectedValue(new Error('Resource exhausted 429 quota exceeded'));
    const resStreamRateLimit = await generateGeminiStream('prompt');
    expect(resStreamRateLimit.success).toBe(false);
    if (!resStreamRateLimit.success) {
      expect(resStreamRateLimit.error.code).toBe('RATE_LIMITED');
    }
  });
});
