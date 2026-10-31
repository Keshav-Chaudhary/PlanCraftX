import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BudgetPlanner } from '../../features/budget/budget-planner';
import type { EventPlan } from '../../lib/schemas/event-plan';

describe('BudgetPlanner Component', () => {
  const mockPlan: EventPlan = {
    id: 'plan-1',
    schemaVersion: 1,
    title: 'Wedding in Boston',
    eventType: 'wedding',
    eventDate: '2026-09-18',
    location: 'Boston, MA',
    guestCount: 100,
    totalBudgetMinor: 1000000, // $10,000.00
    currency: 'USD',
    isOutdoor: false,
    budgetItems: [
      { id: 'b1', category: 'Venue', allocatedMinor: 600000, spentMinor: 100000, isEstimate: true },
      {
        id: 'b2',
        category: 'Catering',
        allocatedMinor: 400000,
        spentMinor: 50000,
        isEstimate: true,
      },
    ],
    timelineItems: [],
    vendorItems: [],
    ideas: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  it('renders budget metrics and category table rows', () => {
    const onPlanUpdate = vi.fn();
    render(<BudgetPlanner plan={mockPlan} onPlanUpdate={onPlanUpdate} />);

    expect(screen.getAllByText(/10,000.00\s+USD/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Venue')[0]).toBeDefined();
    expect(screen.getAllByText('Catering')[0]).toBeDefined();
    expect(screen.getAllByText('AI estimate').length).toBe(2);
  });

  it('allows editing an allocation and rebalances remaining categories', () => {
    const onPlanUpdate = vi.fn();
    render(<BudgetPlanner plan={mockPlan} onPlanUpdate={onPlanUpdate} />);

    const editBtns = screen.getAllByRole('button', { name: /Edit & Rebalance/i });
    expect(editBtns[0]).toBeDefined();
    if (editBtns[0]) {
      fireEvent.click(editBtns[0]);
    }

    const input = screen.getByLabelText(/Edit allocated amount for Venue/i);
    fireEvent.change(input, { target: { value: '7000' } });

    const saveBtn = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveBtn);

    expect(onPlanUpdate).toHaveBeenCalled();
  });

  it('allows cancelling an inline edit', () => {
    const onPlanUpdate = vi.fn();
    render(<BudgetPlanner plan={mockPlan} onPlanUpdate={onPlanUpdate} />);

    const editBtns = screen.getAllByRole('button', { name: /Edit & Rebalance/i });
    if (editBtns[0]) fireEvent.click(editBtns[0]);

    const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelBtn);

    // After cancel, edit input should disappear and save should not have been called
    expect(screen.queryByRole('button', { name: 'Cancel' })).toBeNull();
  });

  it('aborts edit and clears editingId if user enters invalid negative amount', () => {
    const onPlanUpdate = vi.fn();
    render(<BudgetPlanner plan={mockPlan} onPlanUpdate={onPlanUpdate} />);

    const editBtns = screen.getAllByRole('button', { name: /Edit & Rebalance/i });
    if (editBtns[0]) fireEvent.click(editBtns[0]);

    const input = screen.getByLabelText(/Edit allocated amount for Venue/i);
    fireEvent.change(input, { target: { value: '-500' } });

    const saveBtn = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveBtn);

    expect(onPlanUpdate).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Save' })).toBeNull();
  });

  it('handles currency conversion successfully when selecting a new currency', async () => {
    const onPlanUpdate = vi.fn();
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ rate: 0.92 }),
    } as Response);

    render(<BudgetPlanner plan={mockPlan} onPlanUpdate={onPlanUpdate} />);

    const currencySelect = screen.getByLabelText(/Switch Currency:/i);
    fireEvent.change(currencySelect, { target: { value: 'EUR' } });

    await vi.waitFor(() => {
      expect(onPlanUpdate).toHaveBeenCalled();
    });
  });

  it('displays error alert when currency conversion API fails', async () => {
    const onPlanUpdate = vi.fn();
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    render(<BudgetPlanner plan={mockPlan} onPlanUpdate={onPlanUpdate} />);

    const currencySelect = screen.getByLabelText(/Switch Currency:/i);
    fireEvent.change(currencySelect, { target: { value: 'GBP' } });

    await vi.waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert.textContent).toContain('Conversion rate service unavailable');
    });
  });
});
