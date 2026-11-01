import { NextResponse } from 'next/server';
import { chatRequestSchema } from '@/lib/schemas/api-schemas';
import { generateGeminiStream } from '@/lib/api-clients/gemini';
import { buildChatSystemPrompt } from '@/lib/prompts/planning-prompts';
import { validateJsonBody } from '@/lib/http/validated-json';

export async function POST(request: Request) {
  const validation = await validateJsonBody(request, chatRequestSchema, {
    maxSizeBytes: 256 * 1024,
  });
  if (!validation.success) {
    return validation.response;
  }

  const { messages, eventContext } = validation.data;
  const systemPrompt = buildChatSystemPrompt(eventContext);

  const formattedHistory = messages
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n\n');

  const fullPrompt = `${systemPrompt}\n\nCONVERSATION HISTORY:\n${formattedHistory}\n\nASSISTANT:`;

  const streamRes = await generateGeminiStream(fullPrompt);
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
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache, no-transform',
    },
  });
}
