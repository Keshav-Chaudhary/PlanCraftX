import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { IdeasStream } from '../../features/ideas/ideas-stream';
import type { EventPlan } from '../../lib/schemas/event-plan';

describe('IdeasStream Component', () => {
  const mockPlan: EventPlan = {
    id: 'plan-1',
    schemaVersion: 1,
    title: 'Birthday in Chicago',
    eventType: 'birthday',
    eventDate: '2026-06-15',
    location: 'Chicago, IL',
    guestCount: 30,
    totalBudgetMinor: 500000,
    currency: 'USD',
    isOutdoor: true,
    budgetItems: [],
    timelineItems: [],
    vendorItems: [],
    ideas: [
      {
        id: 'i1',
        title: 'Retro Arcade Theme',
        category: 'theme',
        description: '80s synthwave music and classic arcade game cabinets.',
      },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  it('renders initial saved ideas', () => {
    const onPlanUpdate = vi.fn();
    render(<IdeasStream plan={mockPlan} onPlanUpdate={onPlanUpdate} />);
    expect(screen.getByText('Retro Arcade Theme')).toBeDefined();
  });

  it('streams ideas and parses NDJSON lines', async () => {
    const onPlanUpdate = vi.fn();
    const ndjsonContent =
      '{"id":"i2","title":"Custom Cupcake Tower","category":"menu","description":"Nut-free cupcakes","dietaryTags":["Nut-Free"]}\n';

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(ndjsonContent));
        controller.close();
      },
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      body: stream,
    } as Response);

    render(<IdeasStream plan={mockPlan} onPlanUpdate={onPlanUpdate} />);
    const streamBtn = screen.getByRole('button', { name: /Stream New Ideas with Gemini/i });
    fireEvent.click(streamBtn);

    await waitFor(() => {
      expect(screen.getByText('Custom Cupcake Tower')).toBeDefined();
      expect(screen.getByText('✓ Nut-Free')).toBeDefined();
      expect(onPlanUpdate).toHaveBeenCalled();
    });
  });

  it('filters ideas by category dropdown', () => {
    const onPlanUpdate = vi.fn();
    render(<IdeasStream plan={mockPlan} onPlanUpdate={onPlanUpdate} />);

    const filterSelect = screen.getByLabelText(/Filter:/i);
    fireEvent.change(filterSelect, { target: { value: 'menu' } });

    expect(screen.queryByText('Retro Arcade Theme')).toBeNull();
  });

  it('displays error message and Retry button when idea stream API fails', async () => {
    const onPlanUpdate = vi.fn();
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    render(<IdeasStream plan={mockPlan} onPlanUpdate={onPlanUpdate} />);
    const streamBtn = screen.getByRole('button', { name: /Stream New Ideas with Gemini/i });
    fireEvent.click(streamBtn);

    await waitFor(() => {
      expect(screen.getByText(/Failed to stream ideas/i)).toBeDefined();
      expect(screen.getByRole('button', { name: 'Retry' })).toBeDefined();
    });
  });
});
