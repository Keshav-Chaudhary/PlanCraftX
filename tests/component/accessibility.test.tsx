import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { ThemeToggle } from '../../features/theme-toggle';
import { BudgetPlanner } from '../../features/budget/budget-planner';
import { TimelineView } from '../../features/timeline/timeline-view';
import { EventWizard } from '../../features/wizard/event-wizard';
import type { EventPlan } from '../../lib/schemas/event-plan';

describe('WCAG 2.2 Accessibility Automated axe-core Audits', () => {
  const mockPlan: EventPlan = {
    id: 'plan-1',
    schemaVersion: 1,
    title: 'Smith Family Wedding',
    eventType: 'wedding',
    eventDate: '2026-09-18',
    location: 'Boston, MA',
    guestCount: 100,
    totalBudgetMinor: 1000000,
    currency: 'USD',
    isOutdoor: false,
    budgetItems: [
      { id: 'b1', category: 'Venue', allocatedMinor: 600000, spentMinor: 100000, isEstimate: true },
    ],
    timelineItems: [
      {
        id: 't1',
        phase: 'Core Planning',
        title: 'Sign Contract',
        dueDate: '2026-03-18',
        status: 'pending',
        isEstimate: true,
      },
    ],
    vendorItems: [],
    ideas: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  it('ThemeToggle has zero accessibility violations', async () => {
    const { container } = render(<ThemeToggle />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('EventWizard has zero accessibility violations', async () => {
    const { container } = render(<EventWizard onPlanCreated={vi.fn()} isInitialSetup={true} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('BudgetPlanner has zero accessibility violations', async () => {
    const { container } = render(<BudgetPlanner plan={mockPlan} onPlanUpdate={vi.fn()} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('TimelineView has zero accessibility violations', async () => {
    const { container } = render(<TimelineView plan={mockPlan} onPlanUpdate={vi.fn()} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
