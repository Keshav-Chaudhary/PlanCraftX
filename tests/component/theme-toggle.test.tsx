import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '../../features/theme-toggle';

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('renders theme buttons and toggles between light, dark, and high-contrast', () => {
    render(<ThemeToggle />);

    const darkBtn = screen.getByRole('button', { name: 'Dark' });
    fireEvent.click(darkBtn);
    expect(darkBtn.getAttribute('aria-pressed')).toBe('true');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('PlanCraftX_theme')).toBe('dark');

    const hcBtn = screen.getByRole('button', { name: 'Contrast (7:1)' });
    fireEvent.click(hcBtn);
    expect(hcBtn.getAttribute('aria-pressed')).toBe('true');
    expect(document.documentElement.getAttribute('data-theme')).toBe('high-contrast');

    const lightBtn = screen.getByRole('button', { name: 'Light' });
    fireEvent.click(lightBtn);
    expect(lightBtn.getAttribute('aria-pressed')).toBe('true');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('initializes from saved localStorage theme', () => {
    localStorage.setItem('PlanCraftX_theme', 'dark');
    render(<ThemeToggle />);

    const darkBtn = screen.getByRole('button', { name: 'Dark' });
    expect(darkBtn.getAttribute('aria-pressed')).toBe('true');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
