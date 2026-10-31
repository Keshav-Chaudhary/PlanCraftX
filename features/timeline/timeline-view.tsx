'use client';

import { useState, useEffect } from 'react';
import type { EventPlan, TimelineItem, TimelineStatusEnum } from '@/lib/schemas/event-plan';
import { generateIcsCalendar } from '@/lib/domain/ics-generator';
import { checkHolidayClash, type PublicHoliday } from '@/lib/domain/timeline-engine';
import { RunsheetView } from './runsheet-view';

interface TimelineViewProps {
  readonly plan: EventPlan;
  readonly onPlanUpdate: (updatedPlan: EventPlan) => void;
}

export function TimelineView({ plan, onPlanUpdate }: TimelineViewProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [holidays, setHolidays] = useState<PublicHoliday[]>([]);

  useEffect(() => {
    async function loadHolidays() {
      try {
        const year = parseInt(plan.eventDate.split('-')[0] ?? '2026', 10);
        const res = await fetch('/api/holidays', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ year, countryCode: 'US' }),
        });
        if (res.ok) {
          const data = (await res.json()) as { holidays: PublicHoliday[] };
          setHolidays(data.holidays || []);
        }
      } catch {
        // holidays query is progressive enhancement
      }
    }
    loadHolidays();
  }, [plan.eventDate]);

  const toggleStatus = (item: TimelineItem) => {
    const nextStatus: Record<TimelineStatusEnum, TimelineStatusEnum> = {
      pending: 'in_progress',
      in_progress: 'completed',
      completed: 'pending',
    };

    const updatedItems = plan.timelineItems.map((t) => {
      if (t.id === item.id) {
        return { ...t, status: nextStatus[t.status] };
      }
      return t;
    });

    onPlanUpdate({
      ...plan,
      timelineItems: updatedItems,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleExportIcs = () => {
    const events = plan.timelineItems.map((item) => ({
      id: item.id,
      summary: `${item.title} (${item.phase})`,
      description: item.description ?? `Task for phase: ${item.phase}`,
      startDate: item.dueDate,
      location: plan.location,
    }));

    const icsContent = generateIcsCalendar(
      `${plan.title} Timeline`,
      events,
      new Date().toISOString(),
    );

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${plan.eventType}-timeline.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredItems = plan.timelineItems.filter((item) => {
    if (filterStatus === 'all') return true;
    return item.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
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

        <div className="flex flex-wrap items-center gap-3">
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
            className="bg-primary text-primary-fg inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm transition-opacity hover:opacity-90"
          >
            📅 Export RFC 5545 Calendar (.ics)
          </button>
        </div>
      </div>

      {/* Timeline List */}
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
                      <span className="bg-danger/10 text-danger rounded-full px-2 py-0.5 text-xs font-medium">
                        ⚠️ Holiday Clash: {clash.holidayName}
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
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      item.status === 'completed'
                        ? 'bg-primary text-primary-fg'
                        : item.status === 'in_progress'
                          ? 'bg-accent text-accent-fg'
                          : 'border-border bg-surface hover:bg-surface-elevated text-foreground border'
                    }`}
                  >
                    {item.status === 'completed'
                      ? '✓ Completed'
                      : item.status === 'in_progress'
                        ? '⏳ In Progress'
                        : '○ Pending'}
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
