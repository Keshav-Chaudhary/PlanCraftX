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
        <label
          htmlFor="guest-count"
          className="text-fg block text-xs font-bold tracking-wider uppercase"
        >
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
          className="bg-surface text-fg focus:border-accent mt-1.5 block w-full rounded-xl border border-[var(--border-strong)] px-3.5 py-2.5 text-sm transition-colors focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="total-budget"
          className="text-fg block text-xs font-bold tracking-wider uppercase"
        >
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
          className="bg-surface text-fg focus:border-accent mt-1.5 block w-full rounded-xl border border-[var(--border-strong)] px-3.5 py-2.5 text-sm transition-colors focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="currency-select"
          className="text-fg block text-xs font-bold tracking-wider uppercase"
        >
          Currency
        </label>
        <select
          id="currency-select"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="bg-surface text-fg focus:border-accent mt-1.5 block w-full cursor-pointer rounded-xl border border-[var(--border-strong)] px-3.5 py-2.5 text-sm transition-colors focus:outline-none"
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
