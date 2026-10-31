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
      <div className="flex items-center space-x-2">
        <input
          id="is-outdoor"
          type="checkbox"
          checked={isOutdoor}
          onChange={(e) => setIsOutdoor(e.target.checked)}
          className="text-primary rounded border-gray-300 focus:ring-2"
        />
        <label htmlFor="is-outdoor" className="text-foreground text-sm font-medium">
          Outdoor Event (Enables live weather forecasts & rain contingency planning)
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="dietary-input" className="text-foreground block text-sm font-semibold">
            Dietary Requirements (Optional)
          </label>
          <input
            id="dietary-input"
            type="text"
            placeholder="e.g. Vegan, Halal, Nut Allergies, Gluten-Free"
            value={dietary}
            onChange={(e) => setDietary(e.target.value)}
            className="border-border bg-surface text-foreground mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:ring-2"
          />
        </div>

        <div>
          <label
            htmlFor="accessibility-input"
            className="text-foreground block text-sm font-semibold"
          >
            Accessibility Needs (Optional)
          </label>
          <input
            id="accessibility-input"
            type="text"
            placeholder="e.g. Wheelchair Ramps, Quiet Sensory Space, ASL"
            value={accessibility}
            onChange={(e) => setAccessibility(e.target.value)}
            className="border-border bg-surface text-foreground mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:ring-2"
          />
        </div>
      </div>

      <div>
        <label htmlFor="priorities-input" className="text-foreground block text-sm font-semibold">
          Special Priorities or Theme (Optional)
        </label>
        <input
          id="priorities-input"
          type="text"
          placeholder="e.g. Prioritize high-end photography; budget-conscious on floral decor"
          value={priorities}
          onChange={(e) => setPriorities(e.target.value)}
          className="border-border bg-surface text-foreground mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:ring-2"
        />
      </div>
    </div>
  );
}
