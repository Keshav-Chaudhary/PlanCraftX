import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ThinkingTrace } from '@/features/ui/thinking-trace';
import { ErrorSummary } from '@/features/ui/error-summary';
import { AllocationBar } from '@/features/budget/allocation-bar';
import { QuoteComparison } from '@/features/vendors/quote-comparison';
import { PlanReadinessBar } from '@/features/overview/plan-readiness-bar';
import { PrintSummary } from '@/features/export/print-summary';
import type { EventPlan, VendorItem } from '@/lib/schemas/event-plan';

const BASE_PLAN: EventPlan = {
  id: 'plan-1',
  schemaVersion: 1,
  title: 'Community Festival',
  eventType: 'community',
  eventDate: '2026-12-15',
  location: 'City Square',
  guestCount: 300,
  totalBudgetMinor: 50_000_000,
  currency: 'INR',
  isOutdoor: true,
  budgetItems: [
    {
      id: 'b-1',
      category: 'Logistics',
      allocatedMinor: 20_000_000,
      spentMinor: 0,
      isEstimate: true,
    },
    { id: 'b-2', category: 'Permits', allocatedMinor: 10_000_000, spentMinor: 0, isEstimate: true },
  ],
  timelineItems: [
    {
      id: 't-1',
      phase: 'Planning',
      title: 'Permits',
      dueDate: '2026-10-01',
      status: 'completed',
      isEstimate: true,
    },
    {
      id: 't-2',
      phase: 'Execution',
      title: 'Staging',
      dueDate: '2026-12-14',
      status: 'pending',
      isEstimate: true,
    },
  ],
  vendorItems: [
    {
      id: 'v-1',
      category: 'Logistics',
      name: 'Power Rentals',
      status: 'quoted',
      estimatedCostMinor: 15_000_000,
      isEstimate: true,
    },
    {
      id: 'v-2',
      category: 'Staging',
      name: 'Stage Master',
      status: 'booked',
      estimatedCostMinor: 10_000_000,
      isEstimate: true,
    },
  ],
  ideas: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('Advanced Differentiator Components', () => {
  it('renders ThinkingTrace in active state and collapsed trace state', () => {
    const { rerender } = render(<ThinkingTrace isThinking={true} />);
    expect(screen.getByText(/gemini is reasoning/i)).toBeDefined();

    rerender(
      <ThinkingTrace
        isThinking={false}
        summary="Optimized 3 budget categories"
        thoughts={['Calculated catering minimum', 'Cross-referenced guest count']}
      />,
    );
    expect(screen.getByText(/reasoning trace/i)).toBeDefined();
    expect(screen.getByText(/optimized 3 budget categories/i)).toBeDefined();
  });

  it('renders ErrorSummary and allows keyboard click navigation to field', () => {
    const dummyInput = document.createElement('input');
    dummyInput.id = 'target-input-id';
    document.body.appendChild(dummyInput);

    const errors = [{ fieldId: 'target-input-id', message: 'Budget cannot be negative' }];
    render(<ErrorSummary errors={errors} />);

    expect(screen.getByText(/budget cannot be negative/i)).toBeDefined();
    const link = screen.getByRole('button', { name: /budget cannot be negative/i });
    fireEvent.click(link);

    document.body.removeChild(dummyInput);
  });

  it('renders AllocationBar with categories and progressbar semantics', () => {
    const categories = [
      { id: 'c-1', name: 'Venue', allocatedMinor: 3000 },
      { id: 'c-2', name: 'Catering', allocatedMinor: 7000 },
    ];
    render(<AllocationBar categories={categories} totalBudget={10000} />);

    const bar = screen.getByRole('progressbar');
    expect(bar).toBeDefined();
    expect(bar.getAttribute('aria-valuenow')).toBe('100');
    expect(screen.getByText(/visual allocation breakdown/i)).toBeDefined();
  });

  it('renders QuoteComparison and invokes onAcceptQuote callback', () => {
    const onAccept = vi.fn();
    const vendors: VendorItem[] = [
      {
        id: 'v-1',
        category: 'Catering',
        name: 'Spice Craft',
        status: 'quoted',
        estimatedCostMinor: 500000,
        isEstimate: false,
      },
    ];

    render(<QuoteComparison vendors={vendors} currency="INR" onAcceptQuote={onAccept} />);
    expect(screen.getByText(/Side-by-Side Quote Comparison/i)).toBeDefined();

    const toggleBtn = screen.getByRole('button', { name: /compare saved quotes/i });
    fireEvent.click(toggleBtn);

    expect(screen.getByText('Spice Craft')).toBeDefined();

    const acceptBtn = screen.getByRole('button', { name: /accept this quote/i });
    fireEvent.click(acceptBtn);
    expect(onAccept).toHaveBeenCalledWith('v-1');
  });

  it('renders QuoteComparison empty state and category switching', () => {
    const { container } = render(
      <QuoteComparison vendors={[]} currency="INR" onAcceptQuote={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();

    const multiCatVendors: VendorItem[] = [
      { id: 'v-1', category: 'Catering', name: 'Taste 1', status: 'quoted', isEstimate: false },
      { id: 'v-2', category: 'Music', name: 'DJ Sound', status: 'quoted', isEstimate: false },
    ];
    render(<QuoteComparison vendors={multiCatVendors} currency="INR" onAcceptQuote={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /compare saved quotes/i }));
    const musicBtn = screen.getByRole('button', { name: 'Music' });
    fireEvent.click(musicBtn);
    expect(screen.getByText('DJ Sound')).toBeDefined();
  });

  it('handles edge cases in ThinkingTrace, ErrorSummary, and AllocationBar', () => {
    const { container: tContainer } = render(
      <ThinkingTrace isThinking={false} thoughts={[]} summary="" />,
    );
    expect(tContainer.firstChild).toBeNull();

    const { container: eContainer } = render(<ErrorSummary errors={[]} />);
    expect(eContainer.firstChild).toBeNull();

    render(<ErrorSummary errors={[{ fieldId: 'missing-id', message: 'Missing element error' }]} />);
    fireEvent.click(screen.getByRole('button', { name: /missing element error/i }));

    const { container: aContainer } = render(<AllocationBar categories={[]} totalBudget={0} />);
    expect(aContainer.firstChild).toBeNull();

    render(
      <AllocationBar
        categories={[{ id: 'c-1', name: 'Over', allocatedMinor: 15000 }]}
        totalBudget={10000}
      />,
    );
    expect(screen.getByText(/over allocated/i)).toBeDefined();
  });

  it('renders PlanReadinessBar calculating completion metrics and levels', () => {
    render(<PlanReadinessBar plan={BASE_PLAN} />);
    expect(screen.getByText(/plan readiness index/i)).toBeDefined();
    expect(screen.getByRole('progressbar')).toBeDefined();

    const lowPlan: EventPlan = {
      ...BASE_PLAN,
      totalBudgetMinor: 10_000,
      budgetItems: [
        { id: 'b-1', category: 'Venue', allocatedMinor: 50_000, spentMinor: 0, isEstimate: true },
      ],
      timelineItems: [],
      vendorItems: [],
    };
    render(<PlanReadinessBar plan={lowPlan} />);
    expect(screen.getByText(/initial setup/i)).toBeDefined();

    const midPlan: EventPlan = {
      ...BASE_PLAN,
      totalBudgetMinor: 10_000,
      budgetItems: [
        { id: 'b-1', category: 'Venue', allocatedMinor: 10_000, spentMinor: 0, isEstimate: true },
      ],
      timelineItems: [
        {
          id: 't-1',
          phase: 'P',
          title: 'T',
          dueDate: '2026-10-01',
          status: 'in_progress',
          isEstimate: true,
        },
      ],
      vendorItems: [],
    };
    render(<PlanReadinessBar plan={midPlan} />);
    expect(screen.getByText(/Key Milestones Pending/i)).toBeDefined();
  });

  it('renders PrintSummary with all event sections', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    render(<PrintSummary plan={BASE_PLAN} />);

    expect(screen.getByText(/executive printable summary/i)).toBeDefined();
    expect(screen.getByText('Community Festival')).toBeDefined();

    const printBtn = screen.getByRole('button', { name: /print summary \/ pdf/i });
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();
  });
});
