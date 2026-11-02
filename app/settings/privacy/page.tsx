'use client';

import { useState } from 'react';
import Link from 'next/link';
import { clearPlanFromStorage, loadPlanFromStorage } from '@/features/storage';
import { exportPlanJson } from '@/lib/domain/storage-migration';
import { PageHeader, Badge } from '@/features/ui';

export default function PrivacySettingsPage() {
  const [clearedNotice, setClearedNotice] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleExportBackup = () => {
    const plan = loadPlanFromStorage();
    if (!plan) {
      alert('No saved event plan found in browser storage to export.');
      return;
    }
    const jsonStr = exportPlanJson(plan);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${plan.eventType}-backup.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleConfirmDelete = () => {
    clearPlanFromStorage();
    setShowConfirmModal(false);
    setClearedNotice(true);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 pt-28 pb-16 sm:px-6">
      <PageHeader
        title="Privacy Policy & Data Ownership"
        description="PlanCraftX is architected with a strict privacy-first and zero-tracking model. You own all of your planning data."
        badge={<Badge variant="success">100% Client-Side Storage</Badge>}
      />

      {clearedNotice && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-xl border border-[var(--accent-line)] bg-[var(--accent-subtle)] p-4 text-sm font-semibold text-[var(--accent)]"
        >
          ✓ All local PlanCraftX data has been permanently cleared from this browser.
        </div>
      )}

      {/* Card 1: What stays in your browser */}
      <section
        aria-labelledby="local-storage-heading"
        className="bg-surface-2 rounded-2xl border border-[var(--border)] p-6 shadow-sm sm:p-8"
      >
        <div className="flex items-center space-x-3">
          <span className="text-2xl" aria-hidden="true">
            🔒
          </span>
          <h2 id="local-storage-heading" className="text-fg text-xl font-bold">
            What Stays in Your Browser
          </h2>
        </div>
        <p className="text-fg-muted mt-3 text-sm leading-relaxed">
          All your event plans, guest counts, custom budget allocations, vendor notes, quotes,
          milestones, and preferences are stored exclusively in your browser&apos;s{' '}
          <code className="bg-surface-3 text-fg rounded px-1.5 py-0.5 font-mono text-xs">
            localStorage
          </code>{' '}
          under key{' '}
          <code className="bg-surface-3 text-fg rounded px-1.5 py-0.5 font-mono text-xs">
            PlanCraftX_current_plan
          </code>
          . We operate no server-side user database, no authentication cookies, and no tracking
          pixels.
        </p>
      </section>

      {/* Card 2: What is sent to upstream APIs */}
      <section
        aria-labelledby="external-apis-heading"
        className="bg-surface-2 rounded-2xl border border-[var(--border)] p-6 shadow-sm sm:p-8"
      >
        <div className="flex items-center space-x-3">
          <span className="text-2xl" aria-hidden="true">
            🌐
          </span>
          <h2 id="external-apis-heading" className="text-fg text-xl font-bold">
            What Data Leaves Your Browser
          </h2>
        </div>
        <p className="text-fg-muted mt-2 text-sm leading-relaxed">
          To provide real calculations, forecasts, and AI assistance, limited parameters are
          transmitted to the following upstream services over encrypted HTTPS:
        </p>

        <ul className="text-fg-muted mt-4 space-y-3 text-sm">
          <li className="rounded-lg border border-[var(--border)] p-3">
            <strong className="text-fg">Google Gemini API:</strong> Receives event type, budget,
            guest count, location, and constraints when generating dynamic budget proportions,
            personalized ideas, or chat responses. No personal names or account credentials are
            sent.
          </li>
          <li className="rounded-lg border border-[var(--border)] p-3">
            <strong className="text-fg">Open-Meteo Weather:</strong> Receives latitude and longitude
            coordinates to supply 7-day temperature and precipitation forecasts for outdoor events.
          </li>
          <li className="rounded-lg border border-[var(--border)] p-3">
            <strong className="text-fg">OpenStreetMap (Nominatim & Overpass):</strong> Receives
            city/location text to discover real nearby venues, caterers, and florists with official
            attribution.
          </li>
          <li className="rounded-lg border border-[var(--border)] p-3">
            <strong className="text-fg">Nager.Date Public Holidays:</strong> Receives country code
            and year to flag potential holiday scheduling conflicts.
          </li>
          <li className="rounded-lg border border-[var(--border)] p-3">
            <strong className="text-fg">Frankfurter Currency Rates:</strong> Receives ISO 4217
            currency pairs to obtain European Central Bank reference exchange rates.
          </li>
        </ul>
      </section>

      {/* Card 3: Data Controls & Deletion */}
      <section
        aria-labelledby="controls-heading"
        className="bg-surface-2 rounded-2xl border border-[var(--border)] p-6 shadow-sm sm:p-8"
      >
        <div className="flex items-center space-x-3">
          <span className="text-2xl" aria-hidden="true">
            🗑️
          </span>
          <h2 id="controls-heading" className="text-fg text-xl font-bold">
            Data Control & Deletion
          </h2>
        </div>
        <p className="text-fg-muted mt-2 text-sm leading-relaxed">
          You can export a full structured JSON backup of your event plan at any time, or
          permanently delete all PlanCraftX-owned local records from this browser.
        </p>

        <div className="mt-6 flex flex-wrap gap-4">
          <button
            type="button"
            onClick={handleExportBackup}
            id="privacy-export-backup-btn"
            className="bg-surface-3 text-fg inline-flex cursor-pointer items-center rounded-xl border border-[var(--border-strong)] px-5 py-2.5 text-sm font-semibold shadow-xs transition-colors hover:border-[var(--accent-line)]"
          >
            💾 Export JSON Backup First
          </button>

          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            id="privacy-delete-all-btn"
            className="inline-flex cursor-pointer items-center rounded-xl border border-red-500/40 px-5 py-2.5 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/10"
          >
            🗑️ Delete All My Data
          </button>

          <Link
            href="/plan"
            className="inline-flex items-center rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-fg)] shadow-xs transition-opacity hover:opacity-90"
          >
            Back to Workspace
          </Link>
        </div>
      </section>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-delete-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
        >
          <div className="bg-surface-2 max-w-md rounded-2xl border border-[var(--border)] p-6 shadow-xl sm:p-8">
            <h3 id="confirm-delete-title" className="text-fg text-xl font-bold">
              Permanently Delete All Data?
            </h3>
            <p className="text-fg-muted mt-2 text-sm leading-relaxed">
              This will erase all saved event plans, budgets, timelines, and vendor records from
              this browser&apos;s local storage. This action cannot be reversed.
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                id="confirm-delete-cancel-btn"
                onClick={() => setShowConfirmModal(false)}
                className="text-fg hover:bg-surface-3 cursor-pointer rounded-lg border border-[var(--border)] px-4 py-2 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                id="confirm-delete-final-btn"
                className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-opacity hover:opacity-90"
              >
                Yes, Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
