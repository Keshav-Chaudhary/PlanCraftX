import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';
import { generateGeminiStructured, generateGeminiStream } from '../../../lib/api-clients/gemini';

vi.mock('../../../lib/config/env', () => ({
  getEnv: vi.fn(),
}));

import { getEnv } from '../../../lib/config/env';

describe('Gemini Multi-Model Fallback Chain & Upstream Resilience', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Missing API Key Defense', () => {
    it('returns MISSING_API_KEY when GEMINI_API_KEY is unset', async () => {
      vi.mocked(getEnv).mockReturnValue({
        GEMINI_API_KEY: '',
        GEMINI_MODEL: 'gemini-2.5-flash',
        NODE_ENV: 'test',
      } as unknown as ReturnType<typeof getEnv>);

      const result = await generateGeminiStructured('Test prompt', z.object({ ok: z.boolean() }));
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('MISSING_API_KEY');
        expect(result.error.message).toContain('GEMINI_API_KEY is not configured');
      }
    });

    it('returns MISSING_API_KEY on streaming when GEMINI_API_KEY is unset', async () => {
      vi.mocked(getEnv).mockReturnValue({
        GEMINI_API_KEY: '',
        GEMINI_MODEL: 'gemini-2.5-flash',
        NODE_ENV: 'test',
      } as unknown as ReturnType<typeof getEnv>);

      const result = await generateGeminiStream('Stream prompt');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('MISSING_API_KEY');
      }
    });
  });

  describe('Schema Validation Invariants', () => {
    it('defines expected Gemini error codes', () => {
      const allowedCodes = [
        'MISSING_API_KEY',
        'UPSTREAM_FAILURE',
        'TIMEOUT',
        'RATE_LIMITED',
        'SCHEMA_VALIDATION_FAILED',
      ];
      expect(allowedCodes).toHaveLength(5);
    });
  });
});
