'use client';

import { Calendar, AlertTriangle, Check, Clock, Circle } from 'lucide-react';
import type { EventPlan } from '@/lib/schemas/event-plan';
import { checkHolidayClash } from '@/lib/domain/timeline-engine';
import { RunsheetView } from './runsheet-view';
import { useTimelineActions } from './use-timeline-actions';

interface TimelineViewProps {
  readonly plan: EventPlan;
  readonly onPlanUpdate: (updatedPlan: EventPlan) => void;
}

export function TimelineView({ plan, onPlanUpdate }: TimelineViewProps) {
  const { filterStatus, setFilterStatus, holidays, toggleStatus, handleExportIcs, filteredItems } =
    useTimelineActions(plan, onPlanUpdate);

  return (
    <div className="space-y-6">
      <RunsheetView eventType={plan.eventType} />

      <div className="border-border bg-surface flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4 shadow-sm">
        <div>
          <h3 className="text-foreground text-base font-bold">
            Reverse-Planned Timeline & Milestones
          </h3>
          <p className="text-muted text-xs">
            Phases scheduled backwards from event day ({plan.eventDate}).
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 text-xs">
            <label htmlFor="timeline-status-filter" className="text-foreground font-medium">
              Filter:
            </label>
            <select
              id="timeline-status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border-border bg-surface text-foreground rounded-lg border px-2 py-1 text-xs"
            >
              <option value="all">All Milestones</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleExportIcs}
            id="export-ics-btn"
            className="bg-primary text-primary-fg relative z-10 inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm transition-opacity hover:opacity-90"
          >
            <Calendar className="size-3.5 shrink-0" aria-hidden="true" />
            <span>Export RFC 5545 Calendar (.ics)</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="border-border bg-surface text-muted rounded-xl border p-8 text-center text-sm">
            No milestones found matching the selected filter.
          </div>
        ) : (
          filteredItems.map((item, idx) => {
            const clash = checkHolidayClash(item.dueDate, holidays);
            const isCompleted = item.status === 'completed';

            return (
              <div
                key={item.id}
                className={`border-border bg-surface flex flex-col justify-between rounded-xl border p-4 shadow-sm transition-colors sm:flex-row sm:items-center ${
                  isCompleted ? 'bg-surface-elevated/40 opacity-70' : ''
                }`}
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-muted font-mono text-xs">#{idx + 1}</span>
                    <span className="bg-surface-elevated text-muted rounded px-2 py-0.5 text-xs font-semibold">
                      {item.phase}
                    </span>
                    <h4
                      className={`text-foreground text-sm font-semibold ${
                        isCompleted ? 'line-through' : ''
                      }`}
                    >
                      {item.title}
                    </h4>
                    {item.isEstimate && (
                      <span className="bg-warning/10 text-warning rounded-full px-2 py-0.5 text-xs font-medium">
                        AI estimate
                      </span>
                    )}
                    {clash.hasClash && (
                      <span className="bg-danger/10 text-danger inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium">
                        <AlertTriangle className="size-3 shrink-0" aria-hidden="true" />
                        <span>Holiday Clash: {clash.holidayName}</span>
                      </span>
                    )}
                  </div>
                  {item.description && <p className="text-muted text-xs">{item.description}</p>}
                  <p className="text-muted text-xs">
                    Target Date: <strong className="text-foreground">{item.dueDate}</strong>
                  </p>
                </div>

                <div className="mt-3 flex items-center space-x-2 sm:mt-0">
                  <button
                    type="button"
                    onClick={() => toggleStatus(item)}
                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      item.status === 'completed'
                        ? 'bg-primary text-primary-fg'
                        : item.status === 'in_progress'
                          ? 'bg-accent text-accent-fg'
                          : 'border-border bg-surface hover:bg-surface-elevated text-foreground border'
                    }`}
                  >
                    {item.status === 'completed' ? (
                      <>
                        <Check className="size-3.5 shrink-0" aria-hidden="true" />
                        <span>Completed</span>
                      </>
                    ) : item.status === 'in_progress' ? (
                      <>
                        <Clock className="size-3.5 shrink-0" aria-hidden="true" />
                        <span>In Progress</span>
                      </>
                    ) : (
                      <>
                        <Circle className="size-3 shrink-0 opacity-70" aria-hidden="true" />
                        <span>Pending</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
