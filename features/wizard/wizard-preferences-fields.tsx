'use client';

interface WizardPreferencesFieldsProps {
  readonly isOutdoor: boolean;
  readonly setIsOutdoor: (val: boolean) => void;
  readonly dietary: string;
  readonly setDietary: (val: string) => void;
  readonly accessibility: string;
  readonly setAccessibility: (val: string) => void;
  readonly priorities: string;
  readonly setPriorities: (val: string) => void;
}

export function WizardPreferencesFields({
  isOutdoor,
  setIsOutdoor,
  dietary,
  setDietary,
  accessibility,
  setAccessibility,
  priorities,
  setPriorities,
}: WizardPreferencesFieldsProps) {
  return (
    <div className="space-y-4 pt-2">
      <div className="bg-surface-3/50 flex items-center space-x-3 rounded-xl border border-[var(--border)] p-3.5">
        <input
          id="is-outdoor"
          type="checkbox"
          checked={isOutdoor}
          onChange={(e) => setIsOutdoor(e.target.checked)}
          className="size-4 cursor-pointer rounded border-[var(--border-strong)] accent-[var(--accent)]"
        />
        <label
          htmlFor="is-outdoor"
          className="text-fg cursor-pointer text-xs font-semibold sm:text-sm"
        >
          Outdoor Event (Enables live weather forecasts & rain contingency planning)
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="dietary-input"
            className="text-fg block text-xs font-bold tracking-wider uppercase"
          >
            Dietary Requirements (Optional)
          </label>
          <input
            id="dietary-input"
            type="text"
            placeholder="e.g. Vegan, Halal, Nut Allergies, Gluten-Free"
            value={dietary}
            onChange={(e) => setDietary(e.target.value)}
            className="bg-surface text-fg focus:border-accent mt-1.5 block w-full rounded-xl border border-[var(--border-strong)] px-3.5 py-2.5 text-sm transition-colors focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="accessibility-input"
            className="text-fg block text-xs font-bold tracking-wider uppercase"
          >
            Accessibility Needs (Optional)
          </label>
          <input
            id="accessibility-input"
            type="text"
            placeholder="e.g. Wheelchair Ramps, Quiet Sensory Space, ASL"
            value={accessibility}
            onChange={(e) => setAccessibility(e.target.value)}
            className="bg-surface text-fg focus:border-accent mt-1.5 block w-full rounded-xl border border-[var(--border-strong)] px-3.5 py-2.5 text-sm transition-colors focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="priorities-input"
          className="text-fg block text-xs font-bold tracking-wider uppercase"
        >
          Special Priorities or Theme (Optional)
        </label>
        <input
          id="priorities-input"
          type="text"
          placeholder="e.g. Prioritize high-end photography; budget-conscious on floral decor"
          value={priorities}
          onChange={(e) => setPriorities(e.target.value)}
          className="bg-surface text-fg focus:border-accent mt-1.5 block w-full rounded-xl border border-[var(--border-strong)] px-3.5 py-2.5 text-sm transition-colors focus:outline-none"
        />
      </div>
    </div>
  );
}
