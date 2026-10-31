'use client';

import React, { forwardRef } from 'react';

export interface SelectOption {
  readonly value: string;
  readonly label: string;
  readonly disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  readonly label?: string;
  readonly helperText?: string;
  readonly error?: string;
  readonly options?: readonly SelectOption[];
}

function resolveId(id?: string, label?: string): string | undefined {
  if (id) return id;
  if (label) return label.toLowerCase().replace(/\s+/g, '-');
  return undefined;
}

function resolveDescribedBy(
  selectId?: string,
  error?: string,
  helperText?: string,
): string | undefined {
  if (!selectId) return undefined;
  if (error) return `${selectId}-error`;
  if (helperText) return `${selectId}-helper`;
  return undefined;
}

function getSelectClasses(error?: string, customClass = ''): string {
  const base =
    'border-border bg-surface text-foreground focus:border-primary focus:ring-primary w-full rounded-lg border px-3 py-2 text-sm shadow-xs transition-colors focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50';
  const errStyle = error ? 'border-danger focus:border-danger focus:ring-danger' : '';
  return `${base} ${errStyle} ${customClass}`.trim();
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, helperText, error, id, options, children, className = '', disabled, ...props },
  ref,
) {
  const selectId = resolveId(id, label);
  const describedBy = resolveDescribedBy(selectId, error, helperText);
  const selectClass = getSelectClasses(error, className);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="text-foreground block text-xs font-semibold">
          {label}
        </label>
      )}

      <select
        ref={ref}
        id={selectId}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={selectClass}
        {...props}
      >
        {options
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))
          : children}
      </select>

      {error && (
        <p
          id={selectId ? `${selectId}-error` : undefined}
          className="text-danger text-xs font-medium"
          role="alert"
        >
          {error}
        </p>
      )}

      {!error && helperText && (
        <p id={selectId ? `${selectId}-helper` : undefined} className="text-muted text-xs">
          {helperText}
        </p>
      )}
    </div>
  );
});
