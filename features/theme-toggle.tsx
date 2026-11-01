'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

type Theme = 'light' | 'dark' | 'high-contrast';

interface ThemeToggleProps {
  readonly variant?: 'group' | 'switch';
  readonly className?: string;
}

interface SwitchProps {
  readonly theme: Theme;
  readonly mounted: boolean;
  readonly className: string;
  readonly onToggle: () => void;
}

function ThemeToggleSwitch({ theme, mounted, className, onToggle }: SwitchProps) {
  const isDark = theme === 'dark' || theme === 'high-contrast';

  if (!mounted) {
    return (
      <div
        className={`bg-surface-3 relative flex h-8 w-16 items-center rounded-full border border-[var(--border-strong)] p-0.5 opacity-80 ${className}`}
      >
        <div className="text-fg-muted relative z-10 flex w-1/2 justify-center">
          <Moon className="size-3.5" />
        </div>
        <div className="text-fg-subtle relative z-10 flex w-1/2 justify-center">
          <Sun className="size-3.5" />
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      className={`bg-surface-3 relative flex h-8 w-16 cursor-pointer items-center rounded-full border border-[var(--border-strong)] p-0.5 shadow-inner transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${className}`}
    >
      <span
        aria-hidden="true"
        className={`absolute top-0.5 h-7 w-7 rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isDark
            ? 'left-0.5 border border-[var(--accent-line)] bg-[var(--accent-subtle)] shadow-none'
            : 'left-[33px] border border-transparent bg-[var(--surface,#fff)] shadow-sm'
        }`}
      />
      <span
        aria-hidden="true"
        className={`relative z-10 flex w-1/2 items-center justify-center transition-all duration-300 ${
          isDark ? 'text-[var(--accent)]' : 'text-fg-muted'
        }`}
      >
        <Moon className="size-3.5" />
      </span>
      <span
        aria-hidden="true"
        className={`relative z-10 flex w-1/2 items-center justify-center transition-all duration-300 ${
          !isDark ? 'text-fg' : 'text-fg-subtle'
        }`}
      >
        <Sun className="size-3.5" />
      </span>
    </button>
  );
}

interface GroupProps {
  readonly theme: Theme;
  readonly className: string;
  readonly onChange: (theme: Theme) => void;
}

function ThemeToggleGroup({ theme, className, onChange }: GroupProps) {
  return (
    <div
      className={`bg-surface-2/80 inline-flex items-center rounded-full border border-[var(--border)] p-0.5 shadow-xs ${className}`}
      role="group"
      aria-label="Visual Theme Options"
    >
      <button
        type="button"
        onClick={() => onChange('light')}
        aria-pressed={theme === 'light'}
        className={`cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-bold transition-all ${
          theme === 'light' ? 'bg-accent text-accent-fg shadow-xs' : 'text-fg-muted hover:text-fg'
        }`}
      >
        Light
      </button>
      <button
        type="button"
        onClick={() => onChange('dark')}
        aria-pressed={theme === 'dark'}
        className={`cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-bold transition-all ${
          theme === 'dark' ? 'bg-accent text-accent-fg shadow-xs' : 'text-fg-muted hover:text-fg'
        }`}
      >
        Dark
      </button>
      <button
        type="button"
        onClick={() => onChange('high-contrast')}
        aria-pressed={theme === 'high-contrast'}
        className={`cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-bold transition-all ${
          theme === 'high-contrast'
            ? 'bg-accent text-accent-fg shadow-xs'
            : 'text-fg-muted hover:text-fg'
        }`}
      >
        Contrast (7:1)
      </button>
    </div>
  );
}

export function ThemeToggle({ variant = 'group', className = '' }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const syncTheme = () => {
      const saved = (document.documentElement.getAttribute('data-theme') ||
        localStorage.getItem('PlanCraftX_theme')) as Theme | null;
      if (saved && (saved === 'light' || saved === 'dark' || saved === 'high-contrast')) {
        setTheme(saved);
        document.documentElement.setAttribute('data-theme', saved);
      }
    };
    syncTheme();
    window.addEventListener('plancraftx-theme-change', syncTheme);
    return () => window.removeEventListener('plancraftx-theme-change', syncTheme);
  }, []);

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('PlanCraftX_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    window.dispatchEvent(new CustomEvent('plancraftx-theme-change', { detail: newTheme }));
  };

  if (variant === 'switch') {
    const isDark = theme === 'dark' || theme === 'high-contrast';
    return (
      <ThemeToggleSwitch
        theme={theme}
        mounted={mounted}
        className={className}
        onToggle={() => changeTheme(isDark ? 'light' : 'dark')}
      />
    );
  }

  return <ThemeToggleGroup theme={theme} className={className} onChange={changeTheme} />;
}
