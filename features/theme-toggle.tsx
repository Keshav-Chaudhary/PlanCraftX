'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'high-contrast';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const saved = localStorage.getItem('PlanCraftX_theme') as Theme | null;
    if (saved && (saved === 'light' || saved === 'dark' || saved === 'high-contrast')) {
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    }
  }, []);

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('PlanCraftX_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <div className="flex items-center space-x-1" role="group" aria-label="Visual Theme Options">
      <button
        type="button"
        onClick={() => changeTheme('light')}
        aria-pressed={theme === 'light'}
        className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
          theme === 'light'
            ? 'bg-primary text-primary-fg shadow-sm'
            : 'bg-surface hover:bg-surface-elevated text-muted'
        }`}
      >
        Light
      </button>
      <button
        type="button"
        onClick={() => changeTheme('dark')}
        aria-pressed={theme === 'dark'}
        className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
          theme === 'dark'
            ? 'bg-primary text-primary-fg shadow-sm'
            : 'bg-surface hover:bg-surface-elevated text-muted'
        }`}
      >
        Dark
      </button>
      <button
        type="button"
        onClick={() => changeTheme('high-contrast')}
        aria-pressed={theme === 'high-contrast'}
        className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
          theme === 'high-contrast'
            ? 'bg-primary text-primary-fg shadow-sm'
            : 'bg-surface hover:bg-surface-elevated text-muted'
        }`}
      >
        Contrast (7:1)
      </button>
    </div>
  );
}
