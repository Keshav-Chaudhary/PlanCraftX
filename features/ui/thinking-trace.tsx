'use client';

import { useState, useEffect } from 'react';

interface ThinkingTraceProps {
  readonly isThinking: boolean;
  readonly thoughts?: readonly string[] | undefined;
  readonly summary?: string | undefined;
  readonly modelName?: string | undefined;
}

export function ThinkingTrace({
  isThinking,
  thoughts = [],
  summary,
  modelName = 'Gemini 2.5 Flash',
}: ThinkingTraceProps) {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (!isThinking) {
      return;
    }
    const start = Date.now();
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - start);
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [isThinking]);

  if (isThinking) {
    const seconds = (elapsedMs / 1000).toFixed(1);
    return (
      <div
        className="border-accent/30 bg-accent/5 text-foreground my-3 flex items-center gap-3 rounded-lg border p-3 text-sm"
        role="status"
        aria-live="polite"
      >
        <span className="relative flex h-3 w-3">
          <span className="bg-accent absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
          <span className="bg-accent relative inline-flex h-3 w-3 rounded-full" />
        </span>
        <div className="flex-1">
          <span className="text-foreground font-medium">Gemini is reasoning</span>
          <span className="text-muted ml-2 font-mono text-xs">{seconds}s</span>
        </div>
        <span className="text-muted text-xs">{modelName}</span>
      </div>
    );
  }

  if (thoughts.length === 0 && !summary) {
    return null;
  }

  return (
    <details className="group border-border/60 bg-surface/50 text-muted my-2 rounded-lg border p-2.5 text-xs">
      <summary className="hover:text-foreground focus-visible:ring-accent cursor-pointer font-medium select-none focus-visible:ring-2 focus-visible:outline-none">
        <span>Reasoning Trace ({modelName})</span>
      </summary>
      <div className="border-border/40 text-muted mt-2 space-y-1.5 border-t pt-2 font-mono text-[11px]">
        {summary ? <p className="text-foreground/80 italic">{summary}</p> : null}
        {thoughts.map((thought, idx) => (
          <p key={`thought-${String(idx)}`} className="leading-relaxed">
            • {thought}
          </p>
        ))}
      </div>
    </details>
  );
}
