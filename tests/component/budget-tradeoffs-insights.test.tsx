import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BudgetTradeoffBanner } from '@/features/budget/budget-tradeoff-banner';
import { OverviewInsightsCard } from '@/features/overview/overview-insights-card';
import { RunsheetView } from '@/features/timeline/runsheet-view';
import type { EventPlan } from '@/lib/schemas/event-plan';

const basePlan: EventPlan = {
  id: 'plan-test-budget-tradeoffs-insights',
  schemaVersion: 1,
  title: 'Test Feature Plan',
  eventType: 'wedding',
  eventDate: '2026-09-15',
  location: 'Carmel, CA',
  guestCount: 100,
  totalBudgetMinor: 2000000,
  currency: 'USD',
  isOutdoor: true,
  budgetItems: [
    { id: 'b1', category: 'Venue', allocatedMinor: 1000000, spentMinor: 0, isEstimate: true },
    { id: 'b2', category: 'Catering', allocatedMinor: 1000000, spentMinor: 0, isEstimate: true },
    {
      id: 'b3',
      category: 'Contingency Reserve',
      allocatedMinor: 300000,
      spentMinor: 0,
      isEstimate: true,
    },
  ],
  timelineItems: [
    {
      id: 't1',
      phase: 'Planning',
      title: 'Book Venue',
      dueDate: '2026-04-01',
      status: 'pending',
      isEstimate: true,
    },
  ],
  vendorItems: [
    {
      id: 'v1',
      category: 'Venue',
      name: 'Carmel Beach Pavilion',
      status: 'to_contact',
      isEstimate: true,
    },
  ],
  ideas: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('Budget Tradeoffs, Insights & Runsheet Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('BudgetTradeoffBanner', () => {
    it('renders over-budget options and applies selection', async () => {
      const onPlanUpdate = vi.fn();
      render(<BudgetTradeoffBanner plan={basePlan} onPlanUpdate={onPlanUpdate} />);

      expect(screen.getByText(/over budget by/i)).toBeDefined();

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          summary: 'Review your recovery options carefully.',
          explanations: [
            {
              optionId: 'reduce_guests',
              plainTextExplanation: 'Reducing guest list creates immediate savings.',
              pros: 'Keeps menu intact',
              cons: 'Fewer attendees',
            },
          ],
        }),
      });

      const explainBtn = screen.getByRole('button', { name: /explain tradeoffs with ai/i });
      fireEvent.click(explainBtn);

      await waitFor(() => {
        expect(screen.getByText(/review your recovery options carefully/i)).toBeDefined();
      });

      const buttons = screen.getAllByRole('button', { name: /apply this option/i });
      const applyContingencyBtn = buttons[0];
      if (applyContingencyBtn) {
        fireEvent.click(applyContingencyBtn);
      }

      expect(onPlanUpdate).toHaveBeenCalled();
    });

    it('handles API error when tradeoff explainer fails', async () => {
      const onPlanUpdate = vi.fn();
      render(<BudgetTradeoffBanner plan={basePlan} onPlanUpdate={onPlanUpdate} />);

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Tradeoff service down' }),
      });

      const explainBtn = screen.getByRole('button', { name: /explain tradeoffs with ai/i });
      fireEvent.click(explainBtn);

      await waitFor(() => {
        expect(screen.getByText(/tradeoff service down/i)).toBeDefined();
      });
    });
  });

  describe('OverviewInsightsCard', () => {
    it('displays ranked findings and handles AI review', async () => {
      render(<OverviewInsightsCard plan={basePlan} />);

      expect(screen.getByText(/over budget by/i)).toBeDefined();

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          summary: 'Your wedding plan is coming together.',
          actionSteps: ['Rebalance your catering budget', 'Finalize Carmel Pavilion'],
        }),
      });

      const reviewBtn = screen.getByRole('button', { name: /ask ai for plan review/i });
      fireEvent.click(reviewBtn);

      await waitFor(() => {
        expect(screen.getByText(/your wedding plan is coming together/i)).toBeDefined();
        expect(screen.getByText(/rebalance your catering budget/i)).toBeDefined();
      });
    });

    it('handles API error when plan review fails', async () => {
      render(<OverviewInsightsCard plan={basePlan} />);

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Review service offline' }),
      });

      const reviewBtn = screen.getByRole('button', { name: /ask ai for plan review/i });
      fireEvent.click(reviewBtn);

      await waitFor(() => {
        expect(screen.getByText(/review service offline/i)).toBeDefined();
      });
    });
  });

  describe('RunsheetView', () => {
    it('toggles event-day run sheet', () => {
      render(<RunsheetView eventType="wedding" />);

      const toggleBtn = screen.getByRole('button', { name: /view day schedule/i });
      fireEvent.click(toggleBtn);

      expect(screen.getByText(/hair, makeup & bridal party preparation/i)).toBeDefined();
    });
  });
});
