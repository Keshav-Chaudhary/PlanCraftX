'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Shield,
  Lock,
  Sliders,
  Sparkles,
  Save,
  CheckCircle2,
  ShieldCheck,
  Scale,
} from 'lucide-react';
import { Button } from '@/features/ui/button';
import {
  AccountSettingsTab,
  PrivacySettingsTab,
  SecuritySettingsTab,
  AppearanceSettingsTab,
  type AccountFormState,
  type PrivacyFormState,
  type SecurityFormState,
} from './settings-sections';

interface SettingsModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

type SettingsSection = 'account' | 'privacy' | 'security' | 'appearance';

const navButtons: { id: SettingsSection; label: string; icon: typeof User }[] = [
  { id: 'account', label: 'Account & Profile', icon: User },
  { id: 'privacy', label: 'Privacy & Data', icon: Shield },
  { id: 'security', label: 'Security & Access', icon: Lock },
  { id: 'appearance', label: 'Appearance & Theme', icon: Sparkles },
];

function useThemeSync(isOpen: boolean, setTheme: (theme: 'light' | 'dark') => void) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const syncTheme = () => {
      const savedTheme = (document.documentElement.getAttribute('data-theme') ||
        localStorage.getItem('PlanCraftX_theme')) as 'light' | 'dark' | null;
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setTheme(savedTheme);
      }
    };
    syncTheme();
    window.addEventListener('plancraftx-theme-change', syncTheme);
    return () => window.removeEventListener('plancraftx-theme-change', syncTheme);
  }, [isOpen, setTheme]);
}

interface SettingsContentProps {
  readonly activeSection: SettingsSection;
  readonly accountForm: AccountFormState;
  readonly privacyForm: PrivacyFormState;
  readonly securityForm: SecurityFormState;
  readonly theme: 'light' | 'dark';
  readonly setAccountForm: (form: AccountFormState) => void;
  readonly setPrivacyForm: (form: PrivacyFormState) => void;
  readonly changeTheme: (theme: 'light' | 'dark') => void;
}

function SettingsContent({
  activeSection,
  accountForm,
  privacyForm,
  securityForm,
  theme,
  setAccountForm,
  setPrivacyForm,
  changeTheme,
}: SettingsContentProps) {
  if (activeSection === 'account')
    return <AccountSettingsTab form={accountForm} onChange={setAccountForm} />;
  if (activeSection === 'privacy')
    return <PrivacySettingsTab form={privacyForm} onChange={setPrivacyForm} />;
  if (activeSection === 'security') return <SecuritySettingsTab form={securityForm} />;
  return <AppearanceSettingsTab theme={theme} onChangeTheme={changeTheme} />;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeSection, setActiveSection] = useState<SettingsSection>('account');
  const [isSaved, setIsSaved] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const [accountForm, setAccountForm] = useState<AccountFormState>({
    fullName: 'The Developer',
    email: 'developer@plancraftx.internal',
    role: 'Lead Event Architect / Executive Planner',
    org: 'PlanCraftX Enterprise Client',
    plan: 'Enterprise Pro Unlimited',
  });

  const [privacyForm, setPrivacyForm] = useState<PrivacyFormState>({
    localOnly: true,
    zeroRetention: true,
    autoPurgeDays: 30,
    allowTelemetry: false,
  });

  const [securityForm] = useState<SecurityFormState>({
    twoFactor: true,
    sessionTimeoutMins: 60,
    apiToken: 'pcx_live_9f83a21bc9048e712...',
  });

  useThemeSync(isOpen, setTheme);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const changeTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('PlanCraftX_theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      window.dispatchEvent(new CustomEvent('plancraftx-theme-change', { detail: newTheme }));
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close backdrop"
        onClick={onClose}
        className="animate-in fade-in fixed inset-0 cursor-default border-none bg-[var(--overlay)] backdrop-blur-md duration-200 outline-none"
      />

      <div className="bg-surface relative z-10 flex h-[580px] max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-[var(--border-strong)] shadow-2xl md:flex-row">
        {/* Modal Sidebar Tabs */}
        <div className="bg-surface-2 flex w-full shrink-0 flex-col border-b border-[var(--border)] p-4 md:w-60 md:border-r md:border-b-0">
          <div className="mb-4 flex items-center gap-2.5 px-3 py-2">
            <span className="bg-accent-subtle border-accent-line text-accent flex size-8 items-center justify-center rounded-xl border">
              <Sliders className="size-4" />
            </span>
            <div>
              <h2
                id="settings-modal-title"
                className="text-fg text-sm font-extrabold tracking-tight"
              >
                Workspace Settings
              </h2>
              <p className="text-fg-muted text-[10px] font-medium">PlanCraftX Preferences</p>
            </div>
          </div>

          <nav
            aria-label="Settings categories"
            className="flex flex-row gap-1 overflow-x-auto md:flex-col md:overflow-visible"
          >
            {navButtons.map((btn) => {
              const Icon = btn.icon;
              const isActive = activeSection === btn.id;
              return (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => setActiveSection(btn.id)}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-accent text-white shadow-xs'
                      : 'text-fg-muted hover:bg-surface-3 hover:text-fg'
                  }`}
                >
                  <Icon className="size-4" />
                  <span>{btn.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto hidden border-t border-[var(--border-faint)] px-3 pt-4 md:block">
            <div className="text-fg-subtle text-[10px]">PlanCraftX v2.4.0-prod</div>
            <div className="text-positive mt-0.5 flex items-center gap-1.5 text-[10px] font-bold">
              <ShieldCheck className="size-3" aria-hidden="true" />
              <span>Telemetry Encrypted</span>
            </div>
          </div>
        </div>

        {/* Content Panel */}
        <div className="bg-surface flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-[var(--border-faint)] px-6 py-4">
            <h3 className="text-fg text-base font-bold capitalize">
              {activeSection === 'account' && 'Account & Profile Settings'}
              {activeSection === 'privacy' && 'Privacy & Data Governance'}
              {activeSection === 'security' && 'Security & Authentication'}
              {activeSection === 'appearance' && 'Appearance & Display Preferences'}
            </h3>
            <button
              onClick={onClose}
              type="button"
              aria-label="Close settings modal"
              className="bg-surface-2 text-fg-muted hover:text-fg hover:bg-surface-3 flex size-8 items-center justify-center rounded-xl border border-[var(--border)] transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="custom-scrollbar flex-1 space-y-6 overflow-y-auto p-6">
            <SettingsContent
              activeSection={activeSection}
              accountForm={accountForm}
              privacyForm={privacyForm}
              securityForm={securityForm}
              theme={theme}
              setAccountForm={setAccountForm}
              setPrivacyForm={setPrivacyForm}
              changeTheme={changeTheme}
            />
          </div>

          <div className="bg-surface-2 flex items-center justify-between border-t border-[var(--border-faint)] px-6 py-4">
            {isSaved ? (
              <div className="text-positive animate-in fade-in flex items-center gap-2 text-xs font-bold">
                <CheckCircle2 className="size-4" />
                <span>Settings saved successfully!</span>
              </div>
            ) : (
              <span className="text-fg-subtle text-xs">
                All changes apply immediately to your active session.
              </span>
            )}

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setIsSaved(true);
                  setTimeout(() => setIsSaved(false), 2500);
                }}
                className="gap-1.5 text-xs"
              >
                <Save className="size-3.5" />
                <span>Save Preferences</span>
              </Button>
            </div>
          </div>

          <div className="bg-surface-3/40 flex items-start gap-2.5 border-t border-[var(--border-faint)] px-6 py-3">
            <Scale className="text-accent mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <div>
              <span className="text-fg block text-[10px] font-bold tracking-wider uppercase">
                Legal Information Notice
              </span>
              <p className="text-fg-muted mt-0.5 text-[11px] leading-relaxed">
                PlanCraftX provides automated celebration planning and budget analysis grounded
                directly in your preferences and verified public open data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
