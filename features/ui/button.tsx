'use client';

import React, { forwardRef } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly isLoading?: boolean;
  readonly loadingText?: string;
}

function getVariantStyle(variant: ButtonVariant): string {
  switch (variant) {
    case 'secondary':
      return 'border-border bg-surface hover:bg-surface-elevated text-foreground border shadow-xs';
    case 'outline':
      return 'border-primary text-primary hover:bg-primary/10 border focus-visible:ring-2 focus-visible:ring-offset-2';
    case 'ghost':
      return 'text-foreground hover:bg-surface-elevated focus-visible:ring-2 focus-visible:ring-offset-1';
    case 'danger':
      return 'bg-danger text-danger-fg hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 shadow-xs';
    case 'primary':
    default:
      return 'bg-primary text-primary-fg hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 shadow-xs';
  }
}

function getSizeStyle(size: ButtonSize): string {
  switch (size) {
    case 'sm':
      return 'px-3 py-1.5 text-xs rounded-md font-medium';
    case 'lg':
      return 'px-6 py-3 text-base rounded-xl font-bold';
    case 'md':
    default:
      return 'px-4 py-2 text-sm rounded-lg font-semibold';
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
    ...props
  },
  ref,
) {
  const baseClasses =
    'inline-flex items-center justify-center transition-all duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 select-none';
  const variantClass = getVariantStyle(variant);
  const sizeClass = getSizeStyle(size);

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={`${baseClasses} ${variantClass} ${sizeClass} ${className}`.trim()}
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
