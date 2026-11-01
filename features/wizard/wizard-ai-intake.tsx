'use client';

import { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import type { EventTypeEnum } from '@/lib/schemas/event-plan';
import { intakeResponseSchema } from '@/lib/schemas/api-schemas';

interface WizardAiIntakeProps {
  readonly onExtracted: (params: {
    eventType: EventTypeEnum;
    eventDate: string;
    location: string;
    guestCount: number;
    totalBudget: number;
    currency: string;
    isOutdoor: boolean;
    priorities?: string | undefined;
    dietary?: string | undefined;
  }) => void;
}

export function WizardAiIntake({ onExtracted }: WizardAiIntakeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleParse = async () => {
    if (!description.trim() || description.length < 5) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/plan/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });

      if (!res.ok) {
        const err = (await res.json()) as { message?: string };
        throw new Error(err.message || 'AI intake parsing unavailable.');
      }

      const json = await res.json();
      const parseResult = intakeResponseSchema.safeParse(json);
      if (!parseResult.success) {
        throw new Error('AI intake returned invalid data format.');
      }
      const data = parseResult.data;

      onExtracted({
        eventType: data.eventType,
        eventDate: data.eventDate,
        location: data.location,
        guestCount: data.guestCount,
        totalBudget: data.totalBudgetMajor,
        currency: data.currency,
        isOutdoor: data.isOutdoor,
        priorities: data.priorities,
        dietary: data.dietaryRequirements,
      });

      setIsOpen(false);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to parse description.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface-2/60 mb-6 rounded-2xl border border-[var(--border)] p-4 text-sm transition-all hover:border-[var(--accent-line)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-accent-subtle text-accent flex size-7 items-center justify-center rounded-lg border border-[var(--accent-line)]">
            <Sparkles className="size-3.5" />
          </span>
          <span className="text-fg text-xs font-bold sm:text-sm">Have a description in mind?</span>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          id="toggle-ai-intake-btn"
          className="text-accent hover:text-accent-strong cursor-pointer text-xs font-bold transition-colors"
        >
          {isOpen ? 'Close Natural Language Intake' : 'Describe in Natural Language →'}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 space-y-3 border-t border-[var(--border)] pt-3">
          <p className="text-fg-muted text-xs leading-relaxed">
            Type or paste your requirements naturally (e.g. &ldquo;Shaadi in Pune, 200 guests, ₹8
            lakh budget, mid-Feb, simple ceremony with premium food&rdquo;).
          </p>
          <textarea
            id="ai-intake-input"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Type your event description here..."
            className="bg-surface text-fg focus:border-accent w-full rounded-xl border border-[var(--border-strong)] p-3 text-xs transition-colors focus:outline-none"
          />

          {errorMsg && (
            <p className="text-critical text-xs font-semibold" role="alert">
              {errorMsg}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              id="fill-from-description-btn"
              disabled={loading || description.trim().length < 5}
              onClick={handleParse}
              className="bg-accent text-accent-fg inline-flex cursor-pointer items-center gap-1.5 rounded-full px-5 py-2 text-xs font-bold shadow-xs transition-all hover:bg-[var(--accent-strong)] disabled:opacity-50"
            >
              <span>{loading ? 'AI Parsing Description...' : 'Fill Form from Description'}</span>
              <ArrowRight className="size-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
