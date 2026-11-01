'use client';

import React from 'react';
import { Key, Moon, Sun } from 'lucide-react';

export interface AccountFormState {
  fullName: string;
  email: string;
  role: string;
  org: string;
  plan: string;
}

export interface PrivacyFormState {
  localOnly: boolean;
  zeroRetention: boolean;
  autoPurgeDays: number;
  allowTelemetry: boolean;
}

export interface SecurityFormState {
  twoFactor: boolean;
  sessionTimeoutMins: number;
  apiToken: string;
}

export function AccountSettingsTab({
  form,
  onChange,
}: {
  readonly form: AccountFormState;
  readonly onChange: (next: AccountFormState) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="bg-surface-2 space-y-3 rounded-2xl border border-[var(--border)] p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-fg text-xs font-bold tracking-wider uppercase">Current License</h4>
            <p className="text-accent mt-0.5 text-sm font-black">{form.plan}</p>
          </div>
          <span className="bg-positive-subtle border-positive text-positive rounded-full border px-2.5 py-1 text-[10px] font-extrabold">
            Active · Verified
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="settings-full-name"
            className="text-fg-muted mb-1.5 block text-xs font-bold"
          >
            Full Name
          </label>
          <input
            id="settings-full-name"
            type="text"
            value={form.fullName}
            onChange={(e) => onChange({ ...form, fullName: e.target.value })}
            className="bg-surface-3 text-fg focus:ring-accent w-full rounded-xl border border-[var(--border)] px-3 py-2 text-xs font-bold focus:ring-2 focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="settings-work-email"
            className="text-fg-muted mb-1.5 block text-xs font-bold"
          >
            Work Email
          </label>
          <input
            id="settings-work-email"
            type="email"
            value={form.email}
            onChange={(e) => onChange({ ...form, email: e.target.value })}
            className="bg-surface-3 text-fg focus:ring-accent w-full rounded-xl border border-[var(--border)] px-3 py-2 text-xs font-bold focus:ring-2 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="settings-role" className="text-fg-muted mb-1.5 block text-xs font-bold">
            Planning Title / Role
          </label>
          <input
            id="settings-role"
            type="text"
            value={form.role}
            onChange={(e) => onChange({ ...form, role: e.target.value })}
            className="bg-surface-3 text-fg focus:ring-accent w-full rounded-xl border border-[var(--border)] px-3 py-2 text-xs font-bold focus:ring-2 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="settings-org" className="text-fg-muted mb-1.5 block text-xs font-bold">
            Organization
          </label>
          <input
            id="settings-org"
            type="text"
            value={form.org}
            onChange={(e) => onChange({ ...form, org: e.target.value })}
            className="bg-surface-3 text-fg focus:ring-accent w-full rounded-xl border border-[var(--border)] px-3 py-2 text-xs font-bold focus:ring-2 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}

export function PrivacySettingsTab({
  form,
  onChange,
}: {
  readonly form: PrivacyFormState;
  readonly onChange: (next: PrivacyFormState) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="bg-surface-2 flex items-center justify-between rounded-2xl border border-[var(--border)] p-4">
        <div>
          <h4 className="text-fg text-xs font-bold">Local Only Data Processing</h4>
          <p className="text-fg-muted mt-0.5 text-xs">
            Parse celebrations without third-party cloud logging
          </p>
        </div>
        <input
          id="settings-local-only"
          type="checkbox"
          checked={form.localOnly}
          onChange={(e) => onChange({ ...form, localOnly: e.target.checked })}
          className="accent-accent size-4 rounded"
        />
      </div>

      <div className="bg-surface-2 flex items-center justify-between rounded-2xl border border-[var(--border)] p-4">
        <div>
          <h4 className="text-fg text-xs font-bold">Zero Retention Guarantee</h4>
          <p className="text-fg-muted mt-0.5 text-xs">
            Delete temporary AI prompt artifacts immediately after session close
          </p>
        </div>
        <input
          id="settings-zero-retention"
          type="checkbox"
          checked={form.zeroRetention}
          onChange={(e) => onChange({ ...form, zeroRetention: e.target.checked })}
          className="accent-accent size-4 rounded"
        />
      </div>

      <div className="bg-surface-2 space-y-2 rounded-2xl border border-[var(--border)] p-4">
        <label htmlFor="settings-purge-days" className="text-fg block text-xs font-bold">
          Automated Event Purge Schedule
        </label>
        <p className="text-fg-muted text-xs">
          Automatically remove local plan backups after set duration
        </p>
        <select
          id="settings-purge-days"
          value={form.autoPurgeDays}
          onChange={(e) => onChange({ ...form, autoPurgeDays: Number(e.target.value) })}
          className="bg-surface-3 text-fg w-full rounded-xl border border-[var(--border)] px-3 py-2 text-xs font-bold"
        >
          <option value={7}>Purge after 7 days</option>
          <option value={30}>Purge after 30 days (Recommended)</option>
          <option value={90}>Purge after 90 days</option>
          <option value={0}>Manual purge only</option>
        </select>
      </div>
    </div>
  );
}

export function SecuritySettingsTab({ form }: { readonly form: SecurityFormState }) {
  return (
    <div className="space-y-4">
      <div className="bg-surface-2 flex items-center justify-between rounded-2xl border border-[var(--border)] p-4">
        <div className="flex items-center gap-3">
          <Key className="text-accent size-5" />
          <div>
            <h4 className="text-fg text-xs font-bold">Two-Factor Authentication (2FA)</h4>
            <p className="text-fg-muted mt-0.5 text-xs">
              Hardware key or authenticator app required
            </p>
          </div>
        </div>
        <span className="bg-positive-subtle border-positive text-positive rounded-full border px-2.5 py-1 text-[10px] font-extrabold">
          Enabled
        </span>
      </div>

      <div className="bg-surface-2 space-y-2 rounded-2xl border border-[var(--border)] p-4">
        <div className="flex items-center justify-between">
          <label htmlFor="settings-api-token" className="text-fg text-xs font-bold">
            Workspace API Token
          </label>
          <span className="text-accent text-[10px] font-bold">Read / Write Access</span>
        </div>
        <input
          id="settings-api-token"
          type="password"
          readOnly
          value={form.apiToken}
          className="bg-surface-3 text-fg w-full rounded-xl border border-[var(--border)] px-3 py-2 font-mono text-xs"
        />
      </div>
    </div>
  );
}

export function AppearanceSettingsTab({
  theme,
  onChangeTheme,
}: {
  readonly theme: 'light' | 'dark';
  readonly onChangeTheme: (theme: 'light' | 'dark') => void;
}) {
  return (
    <div className="space-y-4">
      <div className="bg-surface-2 space-y-3 rounded-2xl border border-[var(--border)] p-4">
        <h4 className="text-fg text-xs font-bold">Interface Theme</h4>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onChangeTheme('dark')}
            className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition-all ${
              theme === 'dark'
                ? 'border-accent bg-accent-subtle text-accent shadow-xs'
                : 'bg-surface text-fg-muted hover:text-fg border-[var(--border)]'
            }`}
          >
            <Moon className="size-4" />
            <span>Executive Dark Mode</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeTheme('light')}
            className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition-all ${
              theme === 'light'
                ? 'border-accent bg-accent-subtle text-accent shadow-xs'
                : 'bg-surface text-fg-muted hover:text-fg border-[var(--border)]'
            }`}
          >
            <Sun className="size-4" />
            <span>Clean Light Mode</span>
          </button>
        </div>
      </div>

      <div className="bg-surface-2 flex items-center justify-between rounded-2xl border border-[var(--border)] p-4">
        <div>
          <h4 className="text-fg text-xs font-bold">Density Mode</h4>
          <p className="text-fg-muted mt-0.5 text-xs">
            High-density layout for multi-vendor and timeline tracking
          </p>
        </div>
        <span className="bg-surface-3 text-fg rounded border border-[var(--border)] px-2 py-0.5 text-[10px] font-bold">
          Compact
        </span>
      </div>
    </div>
  );
}
