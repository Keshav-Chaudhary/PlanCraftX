import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WizardAiIntake } from '@/features/wizard/wizard-ai-intake';
import { VendorQuoteAnalyzer } from '@/features/vendors/vendor-quote-analyzer';
import type { EventPlan } from '@/lib/schemas/event-plan';

const basePlan: EventPlan = {
  id: 'plan-test-wizard-vendors-ai',
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
  ],
  timelineItems: [],
  vendorItems: [],
  ideas: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('Wizard & Vendors AI Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('WizardAiIntake', () => {
    it('toggles natural language intake panel and parses input', async () => {
      const onExtracted = vi.fn();
      render(<WizardAiIntake onExtracted={onExtracted} />);

      const toggleBtn = screen.getByRole('button', { name: /describe in natural language/i });
      fireEvent.click(toggleBtn);

      const textarea = screen.getByPlaceholderText(/type your event description here/i);
      fireEvent.change(textarea, {
        target: { value: 'Wedding in Carmel for 100 guests with 20k budget' },
      });

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          eventType: 'wedding',
          eventDate: '2026-09-15',
          location: 'Carmel, CA',
          guestCount: 100,
          totalBudgetMajor: 20000,
          currency: 'USD',
          isOutdoor: true,
        }),
      });

      const fillBtn = screen.getByRole('button', { name: /fill form from description/i });
      fireEvent.click(fillBtn);

      await waitFor(() => {
        expect(onExtracted).toHaveBeenCalledWith(
          expect.objectContaining({ eventType: 'wedding', guestCount: 100 }),
        );
      });
    });

    it('handles API error when intake parsing fails', async () => {
      const onExtracted = vi.fn();
      render(<WizardAiIntake onExtracted={onExtracted} />);

      const toggleBtn = screen.getByRole('button', { name: /describe in natural language/i });
      fireEvent.click(toggleBtn);

      const textarea = screen.getByPlaceholderText(/type your event description here/i);
      fireEvent.change(textarea, { target: { value: 'Wedding in Carmel for 100 guests' } });

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Intake model error' }),
      });

      const fillBtn = screen.getByRole('button', { name: /fill form from description/i });
      fireEvent.click(fillBtn);

      await waitFor(() => {
        expect(screen.getByText(/intake model error/i)).toBeDefined();
      });
    });
  });

  describe('VendorQuoteAnalyzer', () => {
    it('analyzes pasted vendor proposal and allows saving to plan', async () => {
      const onSaveQuoteVendor = vi.fn();
      render(<VendorQuoteAnalyzer plan={basePlan} onSaveQuoteVendor={onSaveQuoteVendor} />);

      const toggleBtn = screen.getByRole('button', { name: /open proposal analyzer/i });
      fireEvent.click(toggleBtn);

      const textarea = screen.getByPlaceholderText(/catering quote: 65 per guest/i);
      fireEvent.change(textarea, {
        target: { value: 'Catering quote: 8000 for 100 guests, deposit required' },
      });

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          vendorName: 'Gourmet Express',
          totalPriceMinor: 800000,
          pricePerPersonMinor: null,
          guestMinimum: 100,
          advancePercent: 50,
          taxIncluded: true,
          cancellationPolicy: '30 days prior',
          flags: ['Taxes included'],
          inquiryDraft: 'Thank you for the quote',
          effectiveCostVsBudget: '80% of budget',
        }),
      });

      const analyzeBtn = screen.getByRole('button', { name: /analyze proposal with ai/i });
      fireEvent.click(analyzeBtn);

      await waitFor(() => {
        expect(screen.getByText('Gourmet Express')).toBeDefined();
      });

      const copyBtn = screen.getByRole('button', { name: /copy draft/i });
      fireEvent.click(copyBtn);

      const saveBtn = screen.getByRole('button', { name: /save as verified vendor in checklist/i });
      fireEvent.click(saveBtn);

      expect(onSaveQuoteVendor).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Gourmet Express', isEstimate: false }),
      );
    });

    it('handles API error when proposal analysis fails', async () => {
      const onSaveQuoteVendor = vi.fn();
      render(<VendorQuoteAnalyzer plan={basePlan} onSaveQuoteVendor={onSaveQuoteVendor} />);

      const toggleBtn = screen.getByRole('button', { name: /open proposal analyzer/i });
      fireEvent.click(toggleBtn);

      const textarea = screen.getByPlaceholderText(/catering quote: 65 per guest/i);
      fireEvent.change(textarea, {
        target: { value: 'Catering quote: 8000 for 100 guests, deposit required' },
      });

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Quote extractor failed' }),
      });

      const analyzeBtn = screen.getByRole('button', { name: /analyze proposal with ai/i });
      fireEvent.click(analyzeBtn);

      await waitFor(() => {
        expect(screen.getByText(/quote extractor failed/i)).toBeDefined();
      });
    });
  });
});
