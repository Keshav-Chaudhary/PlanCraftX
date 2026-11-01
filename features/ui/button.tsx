'use client';

import React, { forwardRef } from 'react';
import { cn } from './cn';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly isLoading?: boolean;
  readonly loadingText?: string;
}

function getVariantClasses(variant: ButtonVariant): string {
  switch (variant) {
    case 'secondary':
      return 'border-border bg-surface hover:bg-surface-elevated text-foreground border shadow-xs font-medium';
    case 'outline':
      return 'border-primary text-primary hover:bg-surface-2 border font-medium';
    case 'ghost':
      return 'text-foreground hover:bg-surface-elevated font-medium';
    case 'danger':
      return 'bg-danger text-danger-fg hover:opacity-90 shadow-xs font-semibold';
    case 'primary':
    default:
      return 'bg-primary text-primary-fg hover:bg-[var(--accent-strong)] font-semibold shadow-xs hover:shadow-[0_0_16px_var(--accent-line)]';
  }
}

function getSizeClasses(size: ButtonSize): string {
  switch (size) {
    case 'sm':
      return 'h-8 px-3 text-xs gap-1.5 rounded-lg';
    case 'lg':
      return 'h-12 px-6 text-base gap-2.5 rounded-xl font-semibold';
    case 'md':
    default:
      return 'h-10 px-4 text-sm gap-2 rounded-xl font-medium';
  }
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    isLoading = false,
    loadingText,
    disabled = false,
    children,
    className = '',
    type,
    ...props
  },
  ref,
) {
  const variantClass = getVariantClasses(variant);
  const sizeClass = getSizeClasses(size);

  return (
    <button
      ref={ref}
      type={type ?? 'button'}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={cn(
        'inline-flex cursor-pointer items-center justify-center whitespace-nowrap transition-all duration-150 select-none',
        'focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] focus-visible:outline-none',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        variantClass,
        sizeClass,
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <svg
            className="h-4 w-4 animate-spin text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <span>{loadingText ?? children}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
});
