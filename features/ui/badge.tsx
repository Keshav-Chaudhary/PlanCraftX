'use client';

import React from 'react';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  readonly variant?: BadgeVariant;
  readonly size?: BadgeSize;
}

function getBadgeVariantStyle(variant: BadgeVariant): string {
  switch (variant) {
    case 'success':
      return 'bg-primary/10 text-primary border-primary/20 border';
    case 'warning':
      return 'bg-warning/10 text-warning border-warning/20 border';
    case 'danger':
      return 'bg-danger/10 text-danger border-danger/20 border';
    case 'info':
      return 'bg-info/10 text-info border-info/20 border';
    case 'outline':
      return 'bg-transparent text-foreground border-border border';
    case 'default':
    default:
      return 'bg-surface-elevated text-foreground border-border border';
  }
}

function getBadgeSizeStyle(size: BadgeSize): string {
  switch (size) {
    case 'sm':
      return 'px-2 py-0.5 text-[11px] font-medium rounded-full';
    case 'md':
    default:
      return 'px-2.5 py-1 text-xs font-semibold rounded-md';
  }
}

export function Badge({
  variant = 'default',
  size = 'md',
  className = '',
  children,
  ...props
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center gap-1.5 transition-colors select-none';
  const variantClass = getBadgeVariantStyle(variant);
  const sizeClass = getBadgeSizeStyle(size);

  return (
    <span className={`${baseClasses} ${variantClass} ${sizeClass} ${className}`.trim()} {...props}>
      {children}
    </span>
  );
}
