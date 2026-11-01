'use client';

import React from 'react';
import { cn } from './cn';

export interface ProgressRingProps {
  /** 0–100+ percentage value */
  readonly value: number;
  readonly size?: number;
  readonly strokeWidth?: number;
  readonly label?: React.ReactNode;
  readonly sublabel?: string;
  readonly ariaLabel?: string;
  readonly tone?: 'accent' | 'caution' | 'critical' | 'positive';
  readonly className?: string;
  readonly role?: 'progressbar' | 'presentation' | 'none';
}

function getToneColor(tone: NonNullable<ProgressRingProps['tone']>): string {
  switch (tone) {
    case 'caution':
      return 'var(--caution)';
    case 'critical':
      return 'var(--critical)';
    case 'positive':
      return 'var(--positive)';
    case 'accent':
    default:
      return 'var(--accent)';
  }
}

function getProgressAttributes(isProgressbar: boolean, accessibleName: string, value: number) {
  if (!isProgressbar) {
    return { 'aria-hidden': 'true' as const };
  }
  return {
    role: 'progressbar' as const,
    'aria-label': accessibleName,
    'aria-valuenow': Math.round(value),
    'aria-valuemin': 0,
    'aria-valuemax': 100,
  };
}

/**
 * Accessible SVG circular progress ring.
 * Decorative geometry is aria-hidden; role defaults to presentation to avoid
 * conflicting with parent/sibling progressbars unless explicitly requested.
 */
export function ProgressRing({
  value,
  size = 96,
  strokeWidth = 8,
  label,
  sublabel,
  ariaLabel,
  tone = 'accent',
  className = '',
  role,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference - (clamped / 100) * circumference;
  const accessibleName = ariaLabel ?? sublabel ?? 'Progress';
  const strokeColor = getToneColor(tone);
  const progressAria = getProgressAttributes(role === 'progressbar', accessibleName, value);

  return (
    <div
      {...progressAria}
      className={cn('relative inline-flex items-center justify-center select-none', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} aria-hidden="true" className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        {label ?? <span className="text-fg font-mono text-xl font-bold">{Math.round(value)}%</span>}
        {sublabel && <span className="text-fg-muted text-[10px] font-semibold">{sublabel}</span>}
      </div>
    </div>
  );
}
