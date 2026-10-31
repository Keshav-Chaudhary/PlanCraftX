import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatAssistant } from '../../features/chat/chat-assistant';
import type { EventPlan } from '../../lib/schemas/event-plan';

describe('ChatAssistant Component', () => {
  const mockPlan: EventPlan = {
    id: 'plan-1',
    schemaVersion: 1,
    title: 'Community Fair',
    eventType: 'community',
    eventDate: '2026-08-20',
    location: 'Seattle, WA',
    guestCount: 300,
    totalBudgetMinor: 1000000,
    currency: 'USD',
    isOutdoor: true,
    budgetItems: [],
    timelineItems: [],
    vendorItems: [],
    ideas: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  it('renders initial assistant greeting message and outdoor forecast banner', () => {
    render(<ChatAssistant plan={mockPlan} />);
    expect(screen.getByText(/Hello! I am your PlanCraftX assistant/i)).toBeDefined();
    expect(screen.getByText(/Outdoor Event Weather Forecast/i)).toBeDefined();
  });

  it('sends user message and streams assistant response', async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode('For a community event, make sure to get noise permits.'),
        );
        controller.close();
      },
    });

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/weather')) {
        return {
          ok: true,
          json: async () => ({ weather: null }),
        } as Response;
      }
      return {
        ok: true,
        body: stream,
      } as Response;
    });

    render(<ChatAssistant plan={mockPlan} />);
    const input = screen.getByPlaceholderText(/Ask about community vendors/i);
    fireEvent.change(input, { target: { value: 'Do we need permits?' } });

    const sendBtn = screen.getByRole('button', { name: 'Send' });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(screen.getByText(/make sure to get noise permits/i)).toBeDefined();
    });
  });

  it('displays error alert when chat API call fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/weather')) {
        return { ok: true, json: async () => ({ weather: null }) } as Response;
      }
      return { ok: false, status: 500 } as Response;
    });

    render(<ChatAssistant plan={mockPlan} />);
    const input = screen.getByPlaceholderText(/Ask about community vendors/i);
    fireEvent.change(input, { target: { value: 'Trigger error' } });

    const sendBtn = screen.getByRole('button', { name: 'Send' });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert.textContent).toContain('Assistant streaming service unavailable');
    });
  });
});
