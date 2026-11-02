'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { PlanProvider, usePlan } from '@/features/plan-context';
import { WorkspaceSidebar } from '@/features/workspace/workspace-sidebar';
import { WorkspaceMobileHeader } from '@/features/workspace/workspace-mobile-header';
import { WorkspaceLiveStatusHeader } from '@/features/workspace/workspace-live-status-header';
import { WorkspaceMobileNav } from '@/features/workspace/workspace-mobile-nav';
import { SettingsModal } from '@/features/workspace/settings-modal';

function WorkspaceShell({ children }: { readonly children: React.ReactNode }) {
  const { isLoaded, storageError, clearStorageError, plan } = usePlan();
  const pathname = usePathname();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#settings') {
      setIsSettingsOpen(true);
    }

    const handleOpen = () => setIsSettingsOpen(true);
    window.addEventListener('open-workspace-settings', handleOpen);
    return () => window.removeEventListener('open-workspace-settings', handleOpen);
  }, []);

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
    <div className="bg-bg text-fg relative flex min-h-screen flex-col md:flex-row">
      {/* Desktop Left Sidebar Navigation with Animated Hover Expand */}
      <WorkspaceSidebar
        plan={plan}
        currentPath={pathname}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Mobile Top Header */}
      <WorkspaceMobileHeader plan={plan} />

      {/* Main Content Area */}
      <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        {/* Live Telemetry Status Header */}
        <WorkspaceLiveStatusHeader plan={plan} onOpenSettings={() => setIsSettingsOpen(true)} />

        {/* Scrollable Tab Content Container */}
        <div
          id="main-tab-content"
          className="custom-scrollbar flex-1 space-y-6 overflow-y-auto p-4 pb-24 md:p-6 md:pb-12 lg:p-8"
        >
          {storageError && (
            <div
              role="alert"
              aria-live="polite"
              className="border-warning/30 bg-warning/10 text-warning flex items-center justify-between rounded-xl border p-4 text-xs font-medium"
            >
              <span className="flex items-center gap-2">
                <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
                <span>{storageError}</span>
              </span>
              <button
                type="button"
                onClick={clearStorageError}
                className="font-semibold hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="animate-in fade-in mx-auto w-full max-w-7xl space-y-6 duration-300">
            {children}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <WorkspaceMobileNav plan={plan} currentPath={pathname} />

      {/* Settings Modal Overlay matching ClauseIQX */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
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
