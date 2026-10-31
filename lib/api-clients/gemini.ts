import { GoogleGenAI } from '@google/genai';
import { type ZodType } from 'zod';
import { getEnv } from '../config/env';
import { type Result, ok, err } from '../result/result';

export interface GeminiClientError {
  readonly code:
    | 'MISSING_API_KEY'
    | 'UPSTREAM_FAILURE'
    | 'TIMEOUT'
    | 'RATE_LIMITED'
    | 'SCHEMA_VALIDATION_FAILED';
  readonly message: string;
}

function getGeminiClient(): Result<GoogleGenAI, GeminiClientError> {
  const env = getEnv();
  if (!env.GEMINI_API_KEY) {
    return err({
      code: 'MISSING_API_KEY',
      message: 'GEMINI_API_KEY is not configured on the server.',
    });
  }
  return ok(new GoogleGenAI({ apiKey: env.GEMINI_API_KEY }));
}

const FALLBACK_MODELS = [
  'gemini-2.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash-lite',
] as const;

function getModelCandidates(primaryModel: string): string[] {
  return Array.from(new Set([primaryModel, ...FALLBACK_MODELS]));
}

async function querySingleModel<T>(
  ai: GoogleGenAI,
  model: string,
  prompt: string,
  schema: ZodType<T>,
): Promise<Result<T, GeminiClientError>> {
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
    },
  });

  const text = response.text;
  if (!text) {
    return err({
      code: 'UPSTREAM_FAILURE',
      message: 'Empty response returned from Gemini API.',
    });
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(text);
  } catch {
    return err({
      code: 'SCHEMA_VALIDATION_FAILED',
      message: 'Gemini output was not valid JSON.',
    });
  }

  const validation = schema.safeParse(parsedJson);
  if (!validation.success) {
    const details = validation.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ');
    return err({
      code: 'SCHEMA_VALIDATION_FAILED',
      message: `Gemini JSON output did not conform to schema: ${details}`,
    });
  }

  return ok(validation.data);
}

/**
 * Executes a structured content generation query with strict Zod schema validation
 * and automated model fallback chain.
 */
export async function generateGeminiStructured<T>(
  prompt: string,
  schema: ZodType<T>,
): Promise<Result<T, GeminiClientError>> {
  const clientRes = getGeminiClient();
  if (!clientRes.success) {
    return clientRes;
  }

  const env = getEnv();
  const modelsToTry = getModelCandidates(env.GEMINI_MODEL);
  const ai = clientRes.value;

  let lastErrorMsg = 'Unknown upstream error';
  let isRateLimited = false;

  for (const model of modelsToTry) {
    try {
      const res = await querySingleModel(ai, model, prompt, schema);
      return res;
    } catch (error: unknown) {
      lastErrorMsg = error instanceof Error ? error.message : 'Unknown upstream error';
      if (lastErrorMsg.includes('429') || lastErrorMsg.toLowerCase().includes('quota')) {
        isRateLimited = true;
      }
    }
  }

  if (isRateLimited) {
    return err({
      code: 'RATE_LIMITED',
      message: 'Gemini rate limit exceeded across model fallback chain. Please retry shortly.',
    });
  }

  return err({
    code: 'UPSTREAM_FAILURE',
    message: `Gemini API call failed across all candidate models: ${lastErrorMsg}`,
  });
}

/**
 * Initiates streaming content generation from Gemini with model fallback chain.
 */
export async function generateGeminiStream(
  prompt: string,
): Promise<Result<AsyncGenerator<string, void, unknown>, GeminiClientError>> {
  const clientRes = getGeminiClient();
  if (!clientRes.success) {
    return clientRes;
  }

  const env = getEnv();
  const modelsToTry = getModelCandidates(env.GEMINI_MODEL);
  const ai = clientRes.value;

  let lastErrorMsg = 'Unknown upstream error';

  for (const model of modelsToTry) {
    try {
      const stream = await ai.models.generateContentStream({
        model,
        contents: prompt,
      });

      async function* textGenerator() {
        for await (const chunk of stream) {
          if (chunk.text) {
            yield chunk.text;
          }
        }
      }

      return ok(textGenerator());
    } catch (error: unknown) {
      lastErrorMsg = error instanceof Error ? error.message : 'Unknown upstream error';
    }
  }

  return err({
    code: 'UPSTREAM_FAILURE',
    message: `Gemini streaming call failed across all candidate models: ${lastErrorMsg}`,
  });
}
