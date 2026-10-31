'use client';

interface WizardScaleFieldsProps {
  readonly guestCount: number;
  readonly setGuestCount: (val: number) => void;
  readonly totalBudget: number;
  readonly setTotalBudget: (val: number) => void;
  readonly currency: string;
  readonly setCurrency: (val: string) => void;
}

export function WizardScaleFields({
  guestCount,
  setGuestCount,
  totalBudget,
  setTotalBudget,
  currency,
  setCurrency,
}: WizardScaleFieldsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div>
        <label htmlFor="guest-count" className="text-foreground block text-sm font-semibold">
          Expected Guests
        </label>
        <input
          id="guest-count"
          type="number"
          min="1"
          max="50000"
          required
          value={guestCount}
          onChange={(e) => setGuestCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
          className="border-border bg-surface text-foreground mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:ring-2"
        />
      </div>

      <div>
        <label htmlFor="total-budget" className="text-foreground block text-sm font-semibold">
          Total Budget
        </label>
        <input
          id="total-budget"
          type="number"
          min="0"
          step="any"
          required
          value={totalBudget}
          onChange={(e) => setTotalBudget(Math.max(0, parseFloat(e.target.value) || 0))}
          className="border-border bg-surface text-foreground mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:ring-2"
        />
      </div>

      <div>
        <label htmlFor="currency-select" className="text-foreground block text-sm font-semibold">
          Currency
        </label>
        <select
          id="currency-select"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="border-border bg-surface text-foreground mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:ring-2"
        >
          <option value="USD">USD ($) - 2 dec</option>
          <option value="EUR">EUR (€) - 2 dec</option>
          <option value="GBP">GBP (£) - 2 dec</option>
          <option value="JPY">JPY (¥) - 0 dec</option>
          <option value="KWD">KWD (KD) - 3 dec</option>
          <option value="BHD">BHD (BD) - 3 dec</option>
          <option value="INR">INR (₹) - 2 dec</option>
          <option value="CAD">CAD ($) - 2 dec</option>
          <option value="AUD">AUD ($) - 2 dec</option>
        </select>
      </div>
    </div>
  );
}
