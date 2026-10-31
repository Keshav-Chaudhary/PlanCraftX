'use client';

import { useState, useEffect, useMemo } from 'react';
import type { EventPlan, TimelineItem, TimelineStatusEnum } from '@/lib/schemas/event-plan';
import { generateIcsCalendar } from '@/lib/domain/ics-generator';
import type { PublicHoliday } from '@/lib/domain/timeline-engine';

const NEXT_STATUS: Record<TimelineStatusEnum, TimelineStatusEnum> = {
  pending: 'in_progress',
  in_progress: 'completed',
  completed: 'pending',
};

export function useTimelineActions(
  plan: EventPlan,
  onPlanUpdate: (updatedPlan: EventPlan) => void,
) {
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
        // progressive enhancement
      }
    }
    loadHolidays();
  }, [plan.eventDate]);

  const toggleStatus = (item: TimelineItem) => {
    const updatedItems = plan.timelineItems.map((t) => {
      if (t.id === item.id) {
        return { ...t, status: NEXT_STATUS[t.status] };
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

  const filteredItems = useMemo(() => {
    return plan.timelineItems.filter((item) => {
      if (filterStatus === 'all') return true;
      return item.status === filterStatus;
    });
  }, [plan.timelineItems, filterStatus]);

  return {
    filterStatus,
    setFilterStatus,
    holidays,
    toggleStatus,
    handleExportIcs,
    filteredItems,
  };
}
