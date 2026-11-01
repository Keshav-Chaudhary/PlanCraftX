'use client';

import React from 'react';
import { cn } from './cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly interactive?: boolean;
}

export function Card({ className = '', interactive, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'group bg-surface-2 text-fg relative overflow-hidden rounded-2xl border border-[var(--border-faint)] shadow-[var(--shadow-sm)] transition-all hover:border-[var(--accent-line)] hover:shadow-[var(--shadow-md)]',
        interactive && 'hover:bg-surface-3 cursor-pointer',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-col space-y-1.5 p-5 pb-0', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className = '',
  children,
  as: Tag = 'h3',
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & { readonly as?: 'h2' | 'h3' | 'h4' }) {
  return (
    <Tag className={cn('text-foreground text-lg font-bold tracking-tight', className)} {...props}>
      {children}
    </Tag>
  );
}

export function CardDescription({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-muted text-xs leading-relaxed sm:text-sm', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-5 pt-3', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'mt-4 flex items-center border-t border-[var(--border-faint)] p-5 pt-0',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
