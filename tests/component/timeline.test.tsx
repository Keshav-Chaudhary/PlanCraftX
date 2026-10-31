import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TimelineView } from '../../features/timeline/timeline-view';
import type { EventPlan } from '../../lib/schemas/event-plan';

describe('TimelineView Component', () => {
  const mockPlan: EventPlan = {
    id: 'plan-1',
    schemaVersion: 1,
    title: 'Wedding in Boston',
    eventType: 'wedding',
    eventDate: '2026-09-18',
    location: 'Boston, MA',
    guestCount: 100,
    totalBudgetMinor: 1000000,
    currency: 'USD',
    isOutdoor: false,
    budgetItems: [],
    timelineItems: [
      {
        id: 't1',
        phase: 'Venue & Core Vendors',
        title: 'Sign venue contract',
        dueDate: '2026-03-18',
        status: 'pending',
        isEstimate: true,
      },
      {
        id: 't2',
        phase: 'Catering',
        title: 'Tasting session',
        dueDate: '2026-04-18',
        status: 'in_progress',
        isEstimate: true,
      },
    ],
    vendorItems: [],
    ideas: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  it('renders timeline milestones and allows toggling status', () => {
    const onPlanUpdate = vi.fn();
    render(<TimelineView plan={mockPlan} onPlanUpdate={onPlanUpdate} />);

    expect(screen.getByText('Sign venue contract')).toBeDefined();
    expect(screen.getByText('Venue & Core Vendors')).toBeDefined();

    const toggleBtn = screen.getByRole('button', { name: /Pending/i });
    fireEvent.click(toggleBtn);

    expect(onPlanUpdate).toHaveBeenCalled();
  });

  it('triggers calendar export download on click', () => {
    const onPlanUpdate = vi.fn();
    const createObjectURL = vi.fn(() => 'blob:mock-url');
    const revokeObjectURL = vi.fn();
    globalThis.URL.createObjectURL = createObjectURL;
    globalThis.URL.revokeObjectURL = revokeObjectURL;

    render(<TimelineView plan={mockPlan} onPlanUpdate={onPlanUpdate} />);
    const exportBtn = screen.getByRole('button', { name: /Export RFC 5545 Calendar/i });
    fireEvent.click(exportBtn);

    expect(createObjectURL).toHaveBeenCalled();
  });

  it('loads public holidays and displays holiday notice for milestones', async () => {
    const onPlanUpdate = vi.fn();
    const mockHolidays = [
      { date: '2026-03-18', name: 'St. Patrick Observed', localName: 'St. Patrick' },
    ];
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ holidays: mockHolidays }),
    } as Response);

    render(<TimelineView plan={mockPlan} onPlanUpdate={onPlanUpdate} />);

    await vi.waitFor(() => {
      expect(screen.getByText(/St. Patrick Observed/i)).toBeDefined();
    });
  });

  it('filters milestones by status', () => {
    const onPlanUpdate = vi.fn();
    const multiPlan = {
      ...mockPlan,
      timelineItems: [
        {
          id: 't1',
          phase: 'Phase 1',
          title: 'Task 1',
          dueDate: '2026-03-01',
          status: 'pending' as const,
          isEstimate: true,
        },
        {
          id: 't2',
          phase: 'Phase 2',
          title: 'Task 2',
          dueDate: '2026-04-01',
          status: 'completed' as const,
          isEstimate: true,
        },
      ],
    };

    render(<TimelineView plan={multiPlan} onPlanUpdate={onPlanUpdate} />);

    expect(screen.getByText('Task 1')).toBeDefined();
    expect(screen.getByText('Task 2')).toBeDefined();

    const filterSelect = screen.getByLabelText(/Filter:/i);
    fireEvent.change(filterSelect, { target: { value: 'completed' } });

    expect(screen.queryByText('Task 1')).toBeNull();
    expect(screen.getByText('Task 2')).toBeDefined();
  });
});
