'use client';

import { useState } from 'react';
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
    <div className="border-border bg-surface-elevated/40 mb-6 rounded-xl border p-4 text-sm">
      <div className="flex items-center justify-between">
        <span className="text-foreground font-semibold">💡 Have a description in mind?</span>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          id="toggle-ai-intake-btn"
          className="text-primary hover:text-primary/80 text-xs font-semibold underline"
        >
          {isOpen ? 'Close Natural Language Intake' : 'Describe in Natural Language'}
        </button>
      </div>

      {isOpen && (
        <div className="mt-3 space-y-3">
          <p className="text-muted text-xs">
            Type or paste your requirements naturally (e.g. &ldquo;Shaadi in Pune, 200 guests, ₹8
            lakh budget, mid-Feb, simple ceremony with premium food&rdquo;).
          </p>
          <textarea
            id="ai-intake-input"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Type your event description here..."
            className="border-border bg-surface text-foreground w-full rounded-lg border p-2.5 text-xs focus:ring-2"
          />

          {errorMsg && (
            <p className="text-danger text-xs" role="alert">
              {errorMsg}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              id="fill-from-description-btn"
              disabled={loading || description.trim().length < 5}
              onClick={handleParse}
              className="bg-primary text-primary-fg rounded-lg px-4 py-2 text-xs font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'AI Parsing Description...' : 'Fill Form from Description'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
