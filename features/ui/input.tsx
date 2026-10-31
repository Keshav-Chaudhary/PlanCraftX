'use client';

import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  readonly label?: string;
  readonly helperText?: string;
  readonly error?: string;
}

function resolveId(id?: string, label?: string): string | undefined {
  if (id) return id;
  if (label) return label.toLowerCase().replace(/\s+/g, '-');
  return undefined;
}

function resolveDescribedBy(
  inputId?: string,
  error?: string,
  helperText?: string,
): string | undefined {
  if (!inputId) return undefined;
  if (error) return `${inputId}-error`;
  if (helperText) return `${inputId}-helper`;
  return undefined;
}

function getInputClasses(error?: string, customClass = ''): string {
  const base =
    'border-border bg-surface text-foreground placeholder:text-muted/60 focus:border-primary focus:ring-primary w-full rounded-lg border px-3.5 py-2 text-sm shadow-xs transition-colors focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50';
  const errStyle = error ? 'border-danger focus:border-danger focus:ring-danger' : '';
  return `${base} ${errStyle} ${customClass}`.trim();
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, helperText, error, id, className = '', disabled, ...props },
  ref,
) {
  const inputId = resolveId(id, label);
  const describedBy = resolveDescribedBy(inputId, error, helperText);
  const inputClass = getInputClasses(error, className);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="text-foreground block text-xs font-semibold">
          {label}
        </label>
      )}

      <input
        ref={ref}
        id={inputId}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={inputClass}
        {...props}
      />

      {error && (
        <p
          id={inputId ? `${inputId}-error` : undefined}
          className="text-danger text-xs font-medium"
          role="alert"
        >
          {error}
        </p>
      )}

      {!error && helperText && (
        <p id={inputId ? `${inputId}-helper` : undefined} className="text-muted text-xs">
          {helperText}
        </p>
      )}
    </div>
  );
});
