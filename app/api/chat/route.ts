import { NextResponse } from 'next/server';
import { chatRequestSchema } from '@/lib/schemas/api-schemas';
import { generateGeminiStream } from '@/lib/api-clients/gemini';
import { buildChatSystemPrompt } from '@/lib/prompts/planning-prompts';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation Error', details: parsed.error.issues },
      { status: 400 },
    );
  }

  const { messages, eventContext } = parsed.data;
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
