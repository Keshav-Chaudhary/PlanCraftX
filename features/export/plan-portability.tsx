'use client';

import { useState } from 'react';
import { Share2, Check, Download, Upload, Printer } from 'lucide-react';
import type { EventPlan } from '@/lib/schemas/event-plan';
import { exportPlanJson, importPlanJson } from '@/lib/domain/storage-migration';
import { encodePlanToShareHash } from '@/lib/domain/share-link';
import { clearPlanFromStorage } from '../storage';
import { PrintSummary } from './print-summary';

interface PlanPortabilityProps {
  readonly plan: EventPlan;
  readonly onPlanImported: (importedPlan: EventPlan) => void;
  readonly onResetPlan: () => void;
}

export function PlanPortability({ plan, onPlanImported, onResetPlan }: PlanPortabilityProps) {
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const handleCopyShareLink = () => {
    const hash = encodePlanToShareHash(plan);
    const shareUrl =
      typeof window !== 'undefined' ? `${window.location.origin}/plan?share=${hash}` : '';
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(shareUrl).then(() => {
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 3000);
      });
    }
  };

  const handleExportJson = () => {
    const jsonStr = exportPlanJson(plan);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${plan.eventType}-plan.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(false);

    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content !== 'string') {
        setImportError('Failed to read uploaded file as text.');
        return;
      }

      const result = importPlanJson(content);
      if (result.success) {
        onPlanImported(result.value);
        setImportSuccess(true);
      } else {
        setImportError(`${result.error.code}: ${result.error.message}`);
      }
    };
    reader.onerror = () => {
      setImportError('File reader error occurred.');
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    if (
      window.confirm(
        'Are you sure you want to delete all saved event planning data? This action cannot be undone.',
      )
    ) {
      clearPlanFromStorage();
      onResetPlan();
    }
  };

  return (
    <div className="space-y-6">
      {/* Import & Export Card */}
      <div className="border-border bg-surface rounded-xl border p-6 shadow-sm">
        <h3 className="text-foreground text-base font-bold">Plan Portability & Backups</h3>
        <p className="text-muted mt-1 text-xs">
          Export your plan to structured JSON for backup or migration, or restore an existing plan.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Share Link */}
          <div className="border-border bg-surface-elevated/40 flex flex-col justify-between rounded-lg border p-4">
            <div>
              <strong className="text-foreground text-sm font-semibold">Shareable Link</strong>
              <p className="text-muted mt-1 text-xs">
                Generate a private encoded link to share with family or coordinators.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyShareLink}
              id="copy-share-link-btn"
              className="bg-accent text-accent-foreground hover:bg-accent/90 mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold shadow-sm transition"
            >
              {shareSuccess ? (
                <Check className="size-3.5 shrink-0" aria-hidden="true" />
              ) : (
                <Share2 className="size-3.5 shrink-0" aria-hidden="true" />
              )}
              <span>{shareSuccess ? 'Copied to Clipboard!' : 'Copy Share Link'}</span>
            </button>
          </div>

          {/* Export JSON */}
          <div className="border-border bg-surface-elevated/40 flex flex-col justify-between rounded-lg border p-4">
            <div>
              <strong className="text-foreground text-sm font-semibold">Export JSON File</strong>
              <p className="text-muted mt-1 text-xs">
                Download complete plan data including integer minor-unit budgets and timeline items.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportJson}
              id="export-json-btn"
              className="border-border bg-surface hover:bg-surface-elevated text-foreground mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg border px-4 py-2 text-xs font-semibold transition-colors"
            >
              <Download className="size-3.5 shrink-0" aria-hidden="true" />
              <span>Download Plan JSON</span>
            </button>
          </div>

          {/* Import JSON */}
          <div className="border-border bg-surface-elevated/40 flex flex-col justify-between rounded-lg border p-4">
            <div>
              <strong className="text-foreground text-sm font-semibold">
                Import Existing Plan
              </strong>
              <p className="text-muted mt-1 text-xs">
                Upload a JSON plan file. Max file size: 1 MB. Enforces strict schema validation.
              </p>
            </div>
            <label
              htmlFor="plan-file-upload"
              className="border-border bg-surface hover:bg-surface-elevated text-foreground mt-4 inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-4 py-2 text-xs font-semibold transition-colors"
            >
              <Upload className="size-3.5 shrink-0" aria-hidden="true" />
              <span>Upload JSON File</span>
              <input
                id="plan-file-upload"
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="sr-only"
              />
            </label>
          </div>

          {/* Print Plan */}
          <div className="border-border bg-surface-elevated/40 flex flex-col justify-between rounded-lg border p-4">
            <div>
              <strong className="text-foreground text-sm font-semibold">Printable Summary</strong>
              <p className="text-muted mt-1 text-xs">
                Generate clean, print-friendly view formatted for paper or PDF archiving.
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="border-border bg-surface hover:bg-surface-elevated text-foreground mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg border px-4 py-2 text-xs font-semibold transition-colors"
            >
              <Printer className="size-3.5 shrink-0" aria-hidden="true" />
              <span>Print Plan Summary</span>
            </button>
          </div>
        </div>

        {importSuccess && (
          <div
            role="status"
            className="border-primary/30 bg-primary/10 text-primary mt-4 flex items-center gap-2 rounded-lg border p-3 text-xs"
          >
            <Check className="size-3.5 shrink-0" aria-hidden="true" />
            <span>Plan imported and validated successfully!</span>
          </div>
        )}

        {importError && (
          <div
            role="alert"
            className="border-danger/30 bg-danger/10 text-danger mt-4 rounded-lg border p-3 text-xs"
          >
            {importError}
          </div>
        )}
      </div>

      {/* Privacy & Data Ownership Card */}
      <div id="privacy" className="border-border bg-surface rounded-xl border p-6 shadow-sm">
        <h3 className="text-foreground text-base font-bold">Privacy Controls & Local Data</h3>
        <p className="text-muted mt-1 text-xs leading-relaxed">
          PlanCraftX is designed from first principles with a zero-tracking privacy architecture.
          All event budgets, milestones, and notes are stored strictly in your browser&apos;s local
          storage. No authentication credentials or persistent server-side user databases are
          maintained.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t pt-4">
          <div>
            <span className="text-foreground text-sm font-semibold">Delete Local Plan</span>
            <p className="text-muted text-xs">
              Permanently remove saved event data from this browser.
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onResetPlan}
              className="border-border text-foreground hover:bg-surface-elevated rounded-lg border px-3 py-1.5 text-xs font-semibold"
            >
              Configure New Plan
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              id="clear-all-data-btn"
              className="border-danger/30 text-danger hover:bg-danger/10 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors"
            >
              Clear All Data
            </button>
          </div>
        </div>
      </div>

      <PrintSummary plan={plan} />
    </div>
  );
}
