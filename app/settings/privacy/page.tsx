'use client';

import { useState } from 'react';
import Link from 'next/link';
import { clearPlanFromStorage, loadPlanFromStorage } from '@/features/storage';
import { exportPlanJson } from '@/lib/domain/storage-migration';

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
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl">
          Privacy Policy & Data Ownership
        </h1>
        <p className="text-muted mt-2 text-base leading-relaxed">
          PlanCraftX is architected with a strict privacy-first and zero-tracking model. You own all
          of your planning data.
        </p>
      </div>

      {clearedNotice && (
        <div
          role="status"
          aria-live="polite"
          className="border-primary/30 bg-primary/10 text-primary rounded-xl border p-4 text-sm font-semibold"
        >
          ✓ All local PlanCraftX data has been permanently cleared from this browser.
        </div>
      )}

      {/* Card 1: What stays in your browser */}
      <section
        aria-labelledby="local-storage-heading"
        className="border-border bg-surface rounded-xl border p-6 shadow-sm sm:p-8"
      >
        <div className="flex items-center space-x-3">
          <span className="text-2xl" aria-hidden="true">
            🔒
          </span>
          <h2 id="local-storage-heading" className="text-foreground text-xl font-bold">
            What Stays in Your Browser
          </h2>
        </div>
        <p className="text-muted mt-3 text-sm leading-relaxed">
          All your event plans, guest counts, custom budget allocations, vendor notes, quotes,
          milestones, and preferences are stored exclusively in your browser&apos;s{' '}
          <code className="text-foreground bg-surface-elevated rounded px-1.5 py-0.5 font-mono text-xs">
            localStorage
          </code>{' '}
          under key{' '}
          <code className="text-foreground bg-surface-elevated rounded px-1.5 py-0.5 font-mono text-xs">
            PlanCraftX_current_plan
          </code>
          . We operate no server-side user database, no authentication cookies, and no tracking
          pixels.
        </p>
      </section>

      {/* Card 2: What is sent to upstream APIs */}
      <section
        aria-labelledby="external-apis-heading"
        className="border-border bg-surface rounded-xl border p-6 shadow-sm sm:p-8"
      >
        <div className="flex items-center space-x-3">
          <span className="text-2xl" aria-hidden="true">
            🌐
          </span>
          <h2 id="external-apis-heading" className="text-foreground text-xl font-bold">
            What Data Leaves Your Browser
          </h2>
        </div>
        <p className="text-muted mt-2 text-sm leading-relaxed">
          To provide real calculations, forecasts, and AI assistance, limited parameters are
          transmitted to the following upstream services over encrypted HTTPS:
        </p>

        <ul className="text-muted mt-4 space-y-3 text-sm">
          <li className="border-border rounded-lg border p-3">
            <strong className="text-foreground">Google Gemini API:</strong> Receives event type,
            budget, guest count, location, and constraints when generating dynamic budget
            proportions, personalized ideas, or chat responses. No personal names or account
            credentials are sent.
          </li>
          <li className="border-border rounded-lg border p-3">
            <strong className="text-foreground">Open-Meteo Weather:</strong> Receives latitude and
            longitude coordinates to supply 7-day temperature and precipitation forecasts for
            outdoor events.
          </li>
          <li className="border-border rounded-lg border p-3">
            <strong className="text-foreground">OpenStreetMap (Nominatim & Overpass):</strong>{' '}
            Receives city/location text to discover real nearby venues, caterers, and florists with
            official attribution.
          </li>
          <li className="border-border rounded-lg border p-3">
            <strong className="text-foreground">Nager.Date Public Holidays:</strong> Receives
            country code and year to flag potential holiday scheduling conflicts.
          </li>
          <li className="border-border rounded-lg border p-3">
            <strong className="text-foreground">Frankfurter Currency Rates:</strong> Receives ISO
            4217 currency pairs to obtain European Central Bank reference exchange rates.
          </li>
        </ul>
      </section>

      {/* Card 3: Data Controls & Deletion */}
      <section
        aria-labelledby="controls-heading"
        className="border-border bg-surface rounded-xl border p-6 shadow-sm sm:p-8"
      >
        <div className="flex items-center space-x-3">
          <span className="text-2xl" aria-hidden="true">
            🗑️
          </span>
          <h2 id="controls-heading" className="text-foreground text-xl font-bold">
            Data Control & Deletion
          </h2>
        </div>
        <p className="text-muted mt-2 text-sm leading-relaxed">
          You can export a full structured JSON backup of your event plan at any time, or
          permanently delete all PlanCraftX-owned local records from this browser.
        </p>

        <div className="mt-6 flex flex-wrap gap-4">
          <button
            type="button"
            onClick={handleExportBackup}
            id="privacy-export-backup-btn"
            className="border-border bg-surface hover:bg-surface-elevated text-foreground inline-flex items-center rounded-lg border px-5 py-2.5 text-sm font-semibold shadow-xs transition-colors"
          >
            💾 Export JSON Backup First
          </button>

          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            id="privacy-delete-all-btn"
            className="border-danger/40 text-danger hover:bg-danger/10 inline-flex items-center rounded-lg border px-5 py-2.5 text-sm font-semibold transition-colors"
          >
            🗑️ Delete All My Data
          </button>

          <Link
            href="/plan"
            className="bg-primary text-primary-fg inline-flex items-center rounded-lg px-5 py-2.5 text-sm font-semibold shadow-xs transition-opacity hover:opacity-90"
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
          className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
        >
          <div className="border-border bg-surface max-w-md rounded-2xl border p-6 shadow-xl sm:p-8">
            <h3 id="confirm-delete-title" className="text-foreground text-xl font-bold">
              Permanently Delete All Data?
            </h3>
            <p className="text-muted mt-2 text-sm leading-relaxed">
              This will erase all saved event plans, budgets, timelines, and vendor records from
              this browser&apos;s local storage. This action cannot be reversed.
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                id="confirm-delete-cancel-btn"
                onClick={() => setShowConfirmModal(false)}
                className="border-border text-foreground hover:bg-surface-elevated rounded-lg border px-4 py-2 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                id="confirm-delete-final-btn"
                className="bg-danger rounded-lg px-4 py-2 text-xs font-semibold text-white shadow-xs transition-opacity hover:opacity-90"
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
