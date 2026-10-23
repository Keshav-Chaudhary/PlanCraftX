'use client';

import { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Structured error logging without PII
    console.error('[Application ErrorBoundary Caught]', {
      name: error.name,
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="border-danger/30 bg-surface mx-auto my-8 max-w-lg space-y-4 rounded-xl border p-6 text-center">
      <h1 className="text-danger text-xl font-bold">Something went wrong</h1>
      <p className="text-muted text-sm">
        We encountered an error processing your event plan. Your local changes are preserved.
      </p>
      <div className="pt-2">
        <button
          type="button"
          onClick={() => reset()}
          className="bg-primary text-primary-fg rounded-md px-4 py-2 text-sm font-semibold hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
