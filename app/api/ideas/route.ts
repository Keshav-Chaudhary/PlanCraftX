import { NextResponse } from 'next/server';
import { ideasRequestSchema } from '@/lib/schemas/api-schemas';
import { generateGeminiStream } from '@/lib/api-clients/gemini';
import { buildIdeasPrompt } from '@/lib/prompts/planning-prompts';
import { validateJsonBody } from '@/lib/http/validated-json';

export async function POST(request: Request) {
  const validation = await validateJsonBody(request, ideasRequestSchema);
  if (!validation.success) {
    return validation.response;
  }

  const prompt = buildIdeasPrompt(validation.data);
  const streamRes = await generateGeminiStream(prompt);

  if (!streamRes.success) {
    return NextResponse.json(
      {
        error: streamRes.error.code,
        message: streamRes.error.message,
        canRetry: true,
      },
      { status: streamRes.error.code === 'MISSING_API_KEY' ? 503 : 502 },
    );
  }

  const generator = streamRes.value;
  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async pull(controller) {
      try {
        const { value, done } = await generator.next();
        if (done) {
          controller.close();
        } else if (value) {
          controller.enqueue(encoder.encode(value));
        }
      } catch (err: unknown) {
        controller.error(err);
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache, no-transform',
    },
  });
}
