'use client';

import { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

export interface FormErrorItem {
  readonly fieldId: string;
  readonly message: string;
}

interface ErrorSummaryProps {
  readonly errors: readonly FormErrorItem[];
  readonly title?: string;
}

export function ErrorSummary({
  errors,
  title = 'There were issues with your submission',
}: ErrorSummaryProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (errors.length > 0 && containerRef.current) {
      containerRef.current.focus();
    }
  }, [errors.length]);

  if (errors.length === 0) {
    return null;
  }

  const handleLinkClick = (fieldId: string) => {
    const el = document.getElementById(fieldId);
    if (el) {
      el.focus();
      if (typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      role="alert"
      aria-labelledby="error-summary-heading"
      className="border-danger/60 bg-danger/10 text-foreground focus:ring-danger mb-6 rounded-lg border-2 p-4 focus:ring-2 focus:outline-none"
    >
      <h2
        id="error-summary-heading"
        className="text-danger flex items-center gap-2 text-base font-semibold"
      >
        <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
        {title}
      </h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
        {errors.map((err) => (
          <li key={err.fieldId}>
            <button
              type="button"
              onClick={() => {
                handleLinkClick(err.fieldId);
              }}
              className="text-danger hover:text-danger/80 focus-visible:ring-danger rounded text-left font-medium underline focus-visible:ring-2 focus-visible:outline-none"
            >
              {err.message}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
