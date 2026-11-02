'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { CloudSun, AlertTriangle, Bot } from 'lucide-react';
import type { EventPlan } from '@/lib/schemas/event-plan';
import { type ChatMessage, type WeatherData, weatherDataSchema } from '@/lib/schemas/api-schemas';
import { ThinkingTrace } from '../ui/thinking-trace';

interface ChatAssistantProps {
  readonly plan: EventPlan;
}

function OutdoorWeatherBanner({
  weather,
  loading,
}: {
  readonly weather: WeatherData | null;
  readonly loading: boolean;
}) {
  return (
    <div className="border-border bg-surface flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4 shadow-sm">
      <div className="flex items-center space-x-3">
        <div
          className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg"
          aria-hidden="true"
        >
          <CloudSun className="size-5" />
        </div>
        <div>
          <h4 className="text-foreground text-sm font-bold">Outdoor Event Weather Forecast</h4>
          <p className="text-muted text-xs">
            {loading && 'Querying Open-Meteo live weather data...'}
            {weather &&
              `${weather.conditionSummary} • Max: ${weather.maxTempC}°C / Min: ${weather.minTempC}°C • Rain Probability: ${weather.precipitationProbability}%`}
            {!loading && !weather && 'Weather data will update closer to event date.'}
          </p>
        </div>
      </div>
      {weather && weather.precipitationProbability > 30 && (
        <span className="bg-warning/10 text-warning inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold">
          <AlertTriangle className="size-3.5" aria-hidden="true" />
          <span>Rain Contingency Recommended</span>
        </span>
      )}
    </div>
  );
}

async function streamChatResponse(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onChunk: (accumulated: string) => void,
): Promise<void> {
  const decoder = new TextDecoder();
  let accumulated = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    accumulated += decoder.decode(value, { stream: true });
    onChunk(accumulated);
  }
}

export function ChatAssistant({ plan }: ChatAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hello! I am your PlanCraftX assistant for your upcoming ${plan.eventType} in ${plan.location}. How can I assist you with budget allocations, timelines, or vendor preparations today?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  useEffect(() => {
    if (!plan.isOutdoor) return;
    setWeatherLoading(true);
    fetch('/api/weather', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location: plan.location, date: plan.eventDate }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!json) return;
        const parsed = z.object({ weather: weatherDataSchema }).safeParse(json);
        if (parsed.success) setWeather(parsed.data.weather);
      })
      .catch(() => {})
      .finally(() => setWeatherLoading(false));
  }, [plan.isOutdoor, plan.location, plan.eventDate]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMsg: ChatMessage = { role: 'user', content: input.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsStreaming(true);
    setErrorMsg(null);

    const assistantMsgIndex = updatedMessages.length;
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          eventContext: {
            eventType: plan.eventType,
            eventDate: plan.eventDate,
            location: plan.location,
            guestCount: plan.guestCount,
            currency: plan.currency,
            totalBudgetMinor: plan.totalBudgetMinor,
            isOutdoor: plan.isOutdoor,
          },
        }),
      });

      if (!res.ok) throw new Error('Assistant streaming service unavailable.');
      if (!res.body) throw new Error('No streaming body available.');

      await streamChatResponse(res.body.getReader(), (accumulated) => {
        setMessages((prev) =>
          prev.map((m, idx) =>
            idx === assistantMsgIndex ? { role: 'assistant', content: accumulated } : m,
          ),
        );
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Chat error.';
      setErrorMsg(msg);
      setMessages((prev) => prev.filter((_, idx) => idx !== assistantMsgIndex));
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="space-y-6">
      {plan.isOutdoor && <OutdoorWeatherBanner weather={weather} loading={weatherLoading} />}

      <div className="border-border bg-surface flex h-[480px] flex-col rounded-xl border shadow-sm">
        <div
          className="flex-1 space-y-4 overflow-y-auto p-6"
          role="log"
          aria-live="polite"
          aria-label="Assistant Conversation Messages"
        >
          {messages.length === 0 && (
            <div className="py-6 text-center">
              <div
                className="bg-primary/10 text-primary mx-auto flex h-10 w-10 items-center justify-center rounded-xl"
                aria-hidden="true"
              >
                <Bot className="size-5" />
              </div>
              <h3 className="text-foreground mt-3 text-sm font-bold">
                Co-Planning Assistant Ready
              </h3>
              <p className="text-muted mx-auto mt-1 max-w-sm text-xs">
                Ask questions grounded in your {plan.eventType} budget, timeline milestones, or
                vendor negotiation terms.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setInput('Are we currently over budget based on our allocations?')}
                  className="border-border/70 bg-surface text-muted hover:bg-surface-elevated hover:text-foreground rounded-lg border px-2.5 py-1 text-xs transition"
                >
                  &quot;Are we over budget?&quot;
                </button>
                <button
                  type="button"
                  onClick={() => setInput('Which milestones are due next?')}
                  className="border-border/70 bg-surface text-muted hover:bg-surface-elevated hover:text-foreground rounded-lg border px-2.5 py-1 text-xs transition"
                >
                  &quot;Which milestones are due next?&quot;
                </button>
                <button
                  type="button"
                  onClick={() => setInput('How do I negotiate payment milestones with suppliers?')}
                  className="border-border/70 bg-surface text-muted hover:bg-surface-elevated hover:text-foreground rounded-lg border px-2.5 py-1 text-xs transition"
                >
                  &quot;How to negotiate vendor deposits?&quot;
                </button>
              </div>
            </div>
          )}

          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xl rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-primary text-primary-fg rounded-br-sm'
                    : 'bg-surface-elevated text-foreground border-border rounded-bl-sm border'
                }`}
              >
                <span className="sr-only">{m.role === 'user' ? 'You: ' : 'Assistant: '}</span>
                {m.content || <ThinkingTrace isThinking={true} />}
              </div>
            </div>
          ))}

          {errorMsg && (
            <div
              role="alert"
              className="border-danger/30 bg-danger/10 text-danger rounded-lg border p-3 text-xs"
            >
              {errorMsg}
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="border-border border-t p-4">
          <div className="flex space-x-2">
            <label htmlFor="chat-assistant-input" className="sr-only">
              Ask your event planning question
            </label>
            <input
              id="chat-assistant-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask about ${plan.eventType} vendors, schedules, or ideas...`}
              disabled={isStreaming}
              className="border-border bg-surface text-foreground flex-1 rounded-lg border px-4 py-2 text-sm focus:ring-2"
            />
            <button
              type="submit"
              disabled={isStreaming || !input.trim()}
              className="bg-primary text-primary-fg rounded-lg px-5 py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {isStreaming ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
