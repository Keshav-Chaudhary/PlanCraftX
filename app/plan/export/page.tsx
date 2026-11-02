'use client';

import { useState } from 'react';
import { FolderOpen, Upload } from 'lucide-react';
import { usePlan } from '@/features/plan-context';
import { PlanPortability } from '@/features/export/plan-portability';
import { importPlanJson } from '@/lib/domain/storage-migration';
import { PageHeader, Badge } from '@/features/ui';

export default function ExportPage() {
  const { plan, updatePlan, resetPlan } = usePlan();
  const [importError, setImportError] = useState<string | null>(null);

  const handleStandaloneUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content !== 'string') {
        setImportError('Failed to read uploaded file.');
        return;
      }
      const result = importPlanJson(content);
      if (result.success) {
        updatePlan(result.value);
      } else {
        setImportError(`${result.error.code}: ${result.error.message}`);
      }
    };
    reader.onerror = () => {
      setImportError('File reading error occurred.');
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Export, Portability & Backups"
        description="Download full JSON plans, generate print-ready summaries, export RFC 5545 calendar files, or restore previous backups."
        badge={<Badge variant="info">Zero Lock-In</Badge>}
      />

      {plan ? (
        <PlanPortability plan={plan} onPlanImported={updatePlan} onResetPlan={resetPlan} />
      ) : (
        <div className="border-border bg-surface mx-auto max-w-xl rounded-xl border p-8 text-center shadow-sm">
          <div
            className="bg-surface-elevated text-accent mx-auto flex h-14 w-14 items-center justify-center rounded-xl"
            aria-hidden="true"
          >
            <FolderOpen className="size-7" />
          </div>
          <h2 className="text-foreground mt-4 text-xl font-bold">Import Plan from JSON Backup</h2>
          <p className="text-muted mt-2 text-sm leading-relaxed">
            You do not currently have an active plan in browser storage. You can restore an event by
            uploading a previously exported PlanCraftX JSON file.
          </p>

          <div className="mt-6">
            <label
              htmlFor="standalone-plan-upload"
              className="bg-primary text-primary-fg inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold shadow-sm transition-opacity hover:opacity-90"
            >
              <Upload className="size-4" aria-hidden="true" />
              <span>Choose JSON File to Restore</span>
              <input
                id="standalone-plan-upload"
                type="file"
                accept=".json,application/json"
                onChange={handleStandaloneUpload}
                className="sr-only"
              />
            </label>
          </div>

          {importError && (
            <div
              role="alert"
              className="border-danger/30 bg-danger/10 text-danger mt-4 rounded-lg border p-3 text-xs"
            >
              {importError}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
