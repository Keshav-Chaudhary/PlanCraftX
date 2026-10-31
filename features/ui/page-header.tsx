'use client';

import React from 'react';

export interface PageHeaderProps {
  readonly title: string;
  readonly description?: string;
  readonly badge?: React.ReactNode;
  readonly actions?: React.ReactNode;
  readonly className?: string;
}

export function PageHeader({
  title,
  description,
  badge,
  actions,
  className = '',
}: PageHeaderProps) {
  return (
    <div
      className={`border-border bg-surface/60 flex flex-col justify-between gap-4 rounded-xl border p-5 backdrop-blur-xs sm:flex-row sm:items-center sm:p-6 ${className}`.trim()}
    >
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-foreground text-xl font-extrabold tracking-tight sm:text-2xl">
            {title}
          </h1>
          {badge}
        </div>
        {description && <p className="text-muted max-w-2xl text-xs sm:text-sm">{description}</p>}
      </div>

      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}
