'use client';

import { useState } from 'react';
import { Clock } from 'lucide-react';
import type { EventTypeEnum } from '@/lib/schemas/event-plan';
import { generateEventDayRunsheet } from '@/lib/domain/runsheet';

interface RunsheetViewProps {
  readonly eventType: EventTypeEnum;
}

export function RunsheetView({ eventType }: RunsheetViewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const runsheet = generateEventDayRunsheet(eventType);

  return (
    <div className="border-border bg-surface rounded-xl border p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-foreground flex items-center gap-2 text-sm font-bold">
            <Clock className="text-accent size-4 shrink-0" aria-hidden="true" />
            <span>Event Day Run-Sheet & Schedule</span>
          </h4>
          <p className="text-muted text-xs">
            Suggested chronological run-of-show for event day operations and vendor coordination.
          </p>
        </div>
        <button
          type="button"
          id="toggle-runsheet-btn"
          onClick={() => setIsOpen(!isOpen)}
          className="text-primary hover:text-primary/80 text-xs font-semibold underline"
        >
          {isOpen ? 'Hide Day Schedule' : 'View Day Schedule'}
        </button>
      </div>

      {isOpen && (
        <div className="border-border mt-4 overflow-hidden rounded-lg border">
          <table className="w-full text-left text-xs" aria-label="Event Day Run-Sheet">
            <thead className="bg-surface-elevated text-muted border-border border-b font-semibold uppercase">
              <tr>
                <th scope="col" className="w-20 px-4 py-2.5">
                  Time
                </th>
                <th scope="col" className="px-4 py-2.5">
                  Activity
                </th>
                <th scope="col" className="px-4 py-2.5">
                  Lead Role
                </th>
                <th scope="col" className="px-4 py-2.5">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {runsheet.map((entry, idx) => (
                <tr key={idx} className="hover:bg-surface-elevated/40">
                  <td className="text-primary px-4 py-2.5 font-mono font-bold">{entry.time}</td>
                  <td className="text-foreground px-4 py-2.5 font-medium">{entry.activity}</td>
                  <td className="text-muted px-4 py-2.5">{entry.leadRole}</td>
                  <td className="text-muted px-4 py-2.5 italic">{entry.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
