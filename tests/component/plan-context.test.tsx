import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';
import { PlanProvider, usePlan, PlanEmptyState } from '../../features/plan-context';
import { savePlanToStorage } from '../../features/storage';
import type { EventPlan } from '../../lib/schemas/event-plan';

const mockPlan: EventPlan = {
  id: 'test-plan-1',
  schemaVersion: 1,
  createdAt: '2026-10-30T00:00:00.000Z',
  updatedAt: '2026-10-30T00:00:00.000Z',
  eventType: 'wedding',
  title: 'Sarah & Alex Wedding',
  eventDate: '2026-11-20',
  location: 'Chicago, IL',
  guestCount: 120,
  totalBudgetMinor: 2500000,
  currency: 'USD',
  themeOrCulture: 'Modern Classic',
  targetAgeGroup: 'Adults (25-45)',
  dietaryRequirements: 'Vegetarian options',
  accessibilityNeeds: 'Wheelchair access',
  freeTextVision: 'Romantic autumn celebration',
  isOutdoor: true,
  budgetItems: [
    {
      id: 'cat-1',
      category: 'Venue & Rentals',
      allocatedMinor: 1000000,
      spentMinor: 500000,
      isEstimate: true,
    },
  ],
  timelineItems: [
    {
      id: 'time-1',
      phase: 'Phase 1',
      title: 'Vision & Budget',
      description: 'Align on budget',
      dueDate: '2026-10-30',
      status: 'pending',
      isEstimate: true,
    },
  ],
  vendorItems: [
    {
      id: 'vend-1',
      category: 'Catering & Bar',
      name: 'City Caterers',
      status: 'to_contact',
      notes: 'Sample note',
      isEstimate: true,
    },
  ],
  ideas: [],
};

function TestConsumer() {
  const { plan, isLoaded, storageError, updatePlan, resetPlan, clearStorageError } = usePlan();
  return (
    <div>
      <div data-testid="loaded">{String(isLoaded)}</div>
      <div data-testid="error">{storageError ?? 'none'}</div>
      <div data-testid="title">{plan ? plan.title : 'no-plan'}</div>
      <button data-testid="update-btn" onClick={() => updatePlan(mockPlan)}>
        Update
      </button>
      <button data-testid="reset-btn" onClick={resetPlan}>
        Reset
      </button>
      <button data-testid="clear-err-btn" onClick={clearStorageError}>
        Clear Error
      </button>
    </div>
  );
}

describe('PlanContext and PlanProvider', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides null plan initially when storage is empty', () => {
    render(
      <PlanProvider>
        <TestConsumer />
      </PlanProvider>,
    );

    expect(screen.getByTestId('loaded').textContent).toBe('true');
    expect(screen.getByTestId('title').textContent).toBe('no-plan');
    expect(screen.getByTestId('error').textContent).toBe('none');
  });

  it('loads existing plan from localStorage', async () => {
    savePlanToStorage(mockPlan);

    render(
      <PlanProvider>
        <TestConsumer />
      </PlanProvider>,
    );

    expect(await screen.findByText('Sarah & Alex Wedding')).toBeDefined();
  });

  it('updates plan and saves to localStorage', () => {
    render(
      <PlanProvider>
        <TestConsumer />
      </PlanProvider>,
    );

    act(() => {
      screen.getByTestId('update-btn').click();
    });

    expect(screen.getByTestId('title').textContent).toBe('Sarah & Alex Wedding');
    expect(localStorage.getItem('PlanCraftX_current_plan')).toContain('Sarah & Alex Wedding');
  });

  it('resets plan and clears localStorage', async () => {
    savePlanToStorage(mockPlan);

    render(
      <PlanProvider>
        <TestConsumer />
      </PlanProvider>,
    );

    expect(await screen.findByText('Sarah & Alex Wedding')).toBeDefined();

    act(() => {
      screen.getByTestId('reset-btn').click();
    });

    expect(screen.getByTestId('title').textContent).toBe('no-plan');
    expect(localStorage.getItem('PlanCraftX_current_plan')).toBeNull();
  });

  it('handles corrupted localStorage gracefully without crashing', () => {
    localStorage.setItem('PlanCraftX_current_plan', '{"invalid": true');

    render(
      <PlanProvider>
        <TestConsumer />
      </PlanProvider>,
    );

    expect(screen.getByTestId('loaded').textContent).toBe('true');
    expect(screen.getByTestId('title').textContent).toBe('no-plan');
    expect(screen.getByTestId('error').textContent).toContain('Saved plan could not be parsed');

    act(() => {
      screen.getByTestId('clear-err-btn').click();
    });

    expect(screen.getByTestId('error').textContent).toBe('none');
  });

  it('throws error when usePlan is called outside PlanProvider', () => {
    // Suppress console.error for expected error boundary test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow('usePlan must be used within a PlanProvider');
    spy.mockRestore();
  });

  it('loads and saves plan from share hash parameter', () => {
    const hash = Buffer.from(JSON.stringify(mockPlan)).toString('base64url');
    const originalLocation = window.location;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).location;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.location = new URL(`http://localhost:3000/plan?share=${hash}`) as any;

    try {
      render(
        <PlanProvider>
          <TestConsumer />
        </PlanProvider>,
      );
      expect(screen.getByTestId('title').textContent).toBe(mockPlan.title);
    } finally {
      window.location = originalLocation;
    }
  });
});

describe('PlanEmptyState Component', () => {
  it('renders default empty state with action link', () => {
    render(<PlanEmptyState />);
    expect(screen.getByText('No Active Event Plan Found')).toBeDefined();
    expect(screen.getByRole('link', { name: /Create Your First Event/i })).toBeDefined();
  });

  it('renders custom empty state props', () => {
    render(
      <PlanEmptyState
        title="Custom Title"
        description="Custom Description"
        actionLabel="Start Here"
        actionHref="/custom"
      />,
    );
    expect(screen.getByText('Custom Title')).toBeDefined();
    expect(screen.getByText('Custom Description')).toBeDefined();
    const link = screen.getByRole('link', { name: /Start Here/i });
    expect(link.getAttribute('href')).toBe('/custom');
  });
});
