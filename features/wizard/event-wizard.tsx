'use client';

import { useState } from 'react';
import { Sparkles, Calendar, MapPin, ArrowRight } from 'lucide-react';
import type { EventPlan, EventTypeEnum } from '@/lib/schemas/event-plan';
import { eventPlanSchema } from '@/lib/schemas/event-plan';
import { buildEventPlan, type PlanGenerationInput } from '@/lib/domain/plan-generator';
import { EventTypePicker } from './event-type-picker';
import { WizardScaleFields } from './wizard-scale-fields';
import { WizardPreferencesFields } from './wizard-preferences-fields';
import { WizardAiIntake } from './wizard-ai-intake';

interface EventWizardProps {
  readonly onPlanCreated: (plan: EventPlan) => void;
  readonly isInitialSetup?: boolean;
}

async function fetchOrFallbackPlan(payload: PlanGenerationInput): Promise<EventPlan> {
  let res: Response;
  try {
    res = await fetch('/api/plan/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err: unknown) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return buildEventPlan(payload);
    }
    throw err;
  }

  if (res.ok) {
    const json = await res.json();
    const parsed = eventPlanSchema.safeParse(json);
    if (parsed.success) {
      return parsed.data;
    }
    return buildEventPlan(payload);
  }
  if (res.status === 404) {
    return buildEventPlan(payload);
  }
  const errData = (await res.json().catch(() => ({}))) as { message?: string };
  throw new Error(errData.message || 'Failed to generate plan. Please verify your inputs.');
}

export function EventWizard({ onPlanCreated, isInitialSetup = false }: EventWizardProps) {
  const [eventType, setEventType] = useState<EventTypeEnum>('wedding');
  const [eventDate, setEventDate] = useState('2026-09-15');
  const [location, setLocation] = useState('New York, NY');
  const [guestCount, setGuestCount] = useState<number>(100);
  const [totalBudget, setTotalBudget] = useState<number>(20000);
  const [currency, setCurrency] = useState('USD');
  const [isOutdoor, setIsOutdoor] = useState(false);
  const [dietary, setDietary] = useState('');
  const [accessibility, setAccessibility] = useState('');
  const [priorities, setPriorities] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const payload: PlanGenerationInput = {
        eventType,
        eventDate,
        location,
        guestCount: Number(guestCount),
        totalBudgetMajor: Number(totalBudget),
        currency,
        isOutdoor,
        dietaryRequirements: dietary || undefined,
        accessibilityNeeds: accessibility || undefined,
        priorities: priorities || undefined,
      };

      const plan = await fetchOrFallbackPlan(payload);
      onPlanCreated(plan);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface-2/90 custom-rise mx-auto max-w-3xl rounded-3xl border border-[var(--border)] p-6 shadow-[var(--shadow-md)] backdrop-blur-xl sm:p-10">
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-2">
          <span className="bg-accent-subtle text-accent flex size-7 items-center justify-center rounded-lg border border-[var(--accent-line)]">
            <Sparkles className="size-3.5" />
          </span>
          <span className="text-accent text-xs font-bold tracking-widest uppercase">
            Plan Initialization Wizard
          </span>
        </div>
        <h2 className="text-fg text-2xl font-black tracking-tight sm:text-3xl">
          {isInitialSetup ? 'Create Your Event Plan' : 'Configure New Event Plan'}
        </h2>
        <p className="text-fg-muted mt-2 text-sm leading-relaxed">
          Select an occasion archetype and parameters to generate tailored integer-normalized
          budgets, reverse-planned milestones, and vendor checklists.
        </p>
      </div>

      {errorMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="border-critical/40 bg-critical-subtle/30 text-critical mb-6 rounded-2xl border p-4 text-sm font-semibold"
        >
          <strong>Planning Error: </strong>
          {errorMessage}
        </div>
      )}

      <WizardAiIntake
        onExtracted={(params) => {
          setEventType(params.eventType);
          setEventDate(params.eventDate);
          setLocation(params.location);
          setGuestCount(params.guestCount);
          setTotalBudget(params.totalBudget);
          setCurrency(params.currency);
          setIsOutdoor(params.isOutdoor);
          if (params.priorities) setPriorities(params.priorities);
          if (params.dietary) setDietary(params.dietary);
        }}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <EventTypePicker selected={eventType} onSelect={setEventType} />

        {/* Date & Location */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="event-date"
              className="text-fg block flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase"
            >
              <Calendar className="text-accent size-3.5" />
              Event Date
            </label>
            <input
              id="event-date"
              type="date"
              required
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="bg-surface text-fg focus:border-accent mt-1.5 block w-full rounded-xl border border-[var(--border-strong)] px-3.5 py-2.5 text-sm transition-colors focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="event-location"
              className="text-fg block flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase"
            >
              <MapPin className="text-accent size-3.5" />
              City / Location
            </label>
            <input
              id="event-location"
              type="text"
              required
              placeholder="e.g. Chicago, IL or London, UK"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-surface text-fg focus:border-accent mt-1.5 block w-full rounded-xl border border-[var(--border-strong)] px-3.5 py-2.5 text-sm transition-colors focus:outline-none"
            />
          </div>
        </div>

        {/* Guest Count & Budget */}
        <WizardScaleFields
          guestCount={guestCount}
          setGuestCount={setGuestCount}
          totalBudget={totalBudget}
          setTotalBudget={setTotalBudget}
          currency={currency}
          setCurrency={setCurrency}
        />

        {/* Outdoor and Special Requirements */}
        <WizardPreferencesFields
          isOutdoor={isOutdoor}
          setIsOutdoor={setIsOutdoor}
          dietary={dietary}
          setDietary={setDietary}
          accessibility={accessibility}
          setAccessibility={setAccessibility}
          priorities={priorities}
          setPriorities={setPriorities}
        />

        {/* Submit Button */}
        <div className="pt-6 pb-2">
          <button
            type="submit"
            disabled={loading}
            id="generate-plan-submit-btn"
            className="group flex h-12 w-full cursor-pointer items-center justify-center gap-2.5 rounded-full bg-[var(--accent)] px-8 text-base font-bold text-[var(--accent-fg)] shadow-[0_0_20px_var(--accent-line)] transition-all hover:bg-[var(--accent-strong)] hover:shadow-[0_0_30px_var(--accent-line)] disabled:opacity-50 sm:h-14"
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Generating Tailored Plan with AI...</span>
              </span>
            ) : (
              <>
                <span>Generate Event Plan & Open Assistant</span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
