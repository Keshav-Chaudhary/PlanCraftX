'use client';

import { PlanProvider, usePlan } from '@/features/plan-context';
import { WorkspaceNavigation } from '@/features/workspace-navigation';

function WorkspaceShell({ children }: { readonly children: React.ReactNode }) {
  const { isLoaded, storageError, clearStorageError } = usePlan();

  if (!isLoaded) {
    return (
      <div
        className="flex h-64 items-center justify-center space-x-3"
        role="status"
        aria-label="Loading planning workspace"
      >
        <span className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
        <span className="text-muted text-sm font-medium">Preparing planning workspace...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {storageError && (
        <div
          role="alert"
          aria-live="polite"
          className="border-warning/30 bg-warning/10 text-warning flex items-center justify-between rounded-xl border p-4 text-xs font-medium"
        >
          <span>⚠️ {storageError}</span>
          <button
            type="button"
            onClick={clearStorageError}
            className="font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <WorkspaceNavigation />

      <section aria-label="Workspace View" className="pt-2">
        {children}
      </section>
    </div>
  );
}

export default function PlanLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <PlanProvider>
      <WorkspaceShell>{children}</WorkspaceShell>
    </PlanProvider>
  );
}
