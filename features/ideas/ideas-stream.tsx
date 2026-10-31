'use client';

import { useState } from 'react';
import type { EventPlan, PersonalizedIdea } from '@/lib/schemas/event-plan';
import { personalizedIdeaSchema } from '@/lib/schemas/event-plan';

interface IdeasStreamProps {
  readonly plan: EventPlan;
  readonly onPlanUpdate: (updatedPlan: EventPlan) => void;
}

function tryParseIdea(line: string): PersonalizedIdea | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  try {
    const parsed = JSON.parse(trimmed);
    const validation = personalizedIdeaSchema.safeParse(parsed);
    return validation.success ? validation.data : null;
  } catch {
    return null;
  }
}

async function drainNdjsonStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onIdea: (idea: PersonalizedIdea) => void,
): Promise<PersonalizedIdea[]> {
  const decoder = new TextDecoder();
  let buffer = '';
  const validIdeas: PersonalizedIdea[] = [];

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const idea = tryParseIdea(line);
      if (idea) {
        validIdeas.push(idea);
        onIdea(idea);
      }
    }
  }

  const remaining = tryParseIdea(buffer);
  if (remaining) {
    validIdeas.push(remaining);
    onIdea(remaining);
  }

  return validIdeas;
}

export function IdeasStream({ plan, onPlanUpdate }: IdeasStreamProps) {
  const [streamedIdeas, setStreamedIdeas] = useState<PersonalizedIdea[]>(plan.ideas);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const handleGenerateIdeas = async () => {
    setIsStreaming(true);
    setStreamError(null);

    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: plan.eventType,
          guestCount: plan.guestCount,
          location: plan.location,
          isOutdoor: plan.isOutdoor,
          dietaryRequirements: plan.dietaryRequirements,
          accessibilityNeeds: plan.accessibilityNeeds,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to stream ideas from assistant.');
      }
      if (!res.body) {
        throw new Error('No streaming response body available.');
      }

      const newValidIdeas = await drainNdjsonStream(res.body.getReader(), (idea) => {
        setStreamedIdeas((prev) => [...prev, idea]);
      });

      onPlanUpdate({
        ...plan,
        ideas: [...plan.ideas, ...newValidIdeas],
        updatedAt: new Date().toISOString(),
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Streaming ideas error.';
      setStreamError(msg);
    } finally {
      setIsStreaming(false);
    }
  };

  const filteredIdeas = streamedIdeas.filter((idea) => {
    if (filterCategory === 'all') return true;
    return idea.category === filterCategory;
  });

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="border-border bg-surface flex flex-wrap items-center justify-between gap-4 rounded-xl border p-6 shadow-sm">
        <div>
          <h3 className="text-foreground text-base font-bold">Personalized AI Ideas</h3>
          <p className="text-muted text-xs">
            Tailored themes, dietary-respectful menus, activities, and accessibility accommodations.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-xs">
            <label htmlFor="idea-category-filter" className="text-foreground font-medium">
              Filter:
            </label>
            <select
              id="idea-category-filter"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border-border bg-surface text-foreground rounded-lg border px-2 py-1 text-xs"
            >
              <option value="all">All Categories</option>
              <option value="theme">Themes</option>
              <option value="menu">Menus</option>
              <option value="activity">Activities</option>
              <option value="accessibility">Accessibility</option>
              <option value="logistics">Logistics</option>
            </select>
          </div>

          <button
            type="button"
            disabled={isStreaming}
            onClick={handleGenerateIdeas}
            className="bg-primary text-primary-fg inline-flex items-center rounded-lg px-4 py-2 text-xs font-semibold shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isStreaming ? (
              <span className="flex items-center space-x-2">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Streaming Ideas...</span>
              </span>
            ) : (
              '✨ Stream New Ideas with Gemini'
            )}
          </button>
        </div>
      </div>

      {streamError && (
        <div
          role="alert"
          className="border-danger/30 bg-danger/10 text-danger flex items-center justify-between rounded-lg border p-4 text-xs"
        >
          <span>{streamError}</span>
          <button
            type="button"
            onClick={handleGenerateIdeas}
            className="text-danger ml-2 font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {filteredIdeas.length === 0 ? (
          <div className="border-border bg-surface/50 col-span-2 rounded-2xl border border-dashed p-10 text-center">
            <div
              className="bg-primary/10 mx-auto flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
              aria-hidden="true"
            >
              💡
            </div>
            <h3 className="text-foreground mt-4 text-base font-bold">
              Personalized Creative Briefing
            </h3>
            <p className="text-muted mx-auto mt-2 max-w-md text-xs leading-relaxed">
              Generate themes, menus, party games, and accommodations tailored to your{' '}
              {plan.eventType} for {plan.guestCount} guests in {plan.location}. Click &quot;Stream
              New Ideas with Gemini&quot; to begin.
            </p>
          </div>
        ) : (
          filteredIdeas.map((idea, idx) => (
            <article
              key={`${idea.id}-${idx}`}
              className="border-border bg-surface hover:border-primary/40 flex flex-col justify-between rounded-2xl border p-5 shadow-xs transition"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="border-primary/20 bg-primary/10 text-primary rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase">
                    {idea.category}
                  </span>
                </div>
                <h4 className="text-foreground text-sm font-bold">{idea.title}</h4>
                <p className="text-muted text-xs leading-relaxed">{idea.description}</p>
                {idea.dietaryTags && idea.dietaryTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {idea.dietaryTags.map((tag) => (
                      <span
                        key={tag}
                        className="border-border/60 bg-surface-elevated text-foreground rounded-full border px-2 py-0.5 text-[10px] font-medium"
                      >
                        ✓ {tag}
                      </span>
                    ))}
                  </div>
                )}
                {idea.accessibilityNotes && (
                  <p className="border-border/40 bg-surface-elevated text-muted mt-2 rounded-xl border p-2.5 text-[11px]">
                    ♿ <strong className="text-foreground">Accessibility:</strong>{' '}
                    {idea.accessibilityNotes}
                  </p>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
