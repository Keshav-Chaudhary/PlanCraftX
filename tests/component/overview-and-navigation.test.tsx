import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { WorkspaceNavigation } from '../../features/workspace-navigation';
import { OverviewSnapshotCard } from '../../features/overview/overview-snapshot-card';
import { OverviewMetricsGrid } from '../../features/overview/overview-metrics-grid';
import { PlanProvider } from '../../features/plan-context';
import { savePlanToStorage } from '../../features/storage';
import type { EventPlan } from '../../lib/schemas/event-plan';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/plan',
}));

const samplePlan: EventPlan = {
  id: 'plan-xyz',
  schemaVersion: 1,
  createdAt: '2026-10-30T00:00:00.000Z',
  updatedAt: '2026-10-30T00:00:00.000Z',
  eventType: 'birthday',
  title: 'Leo 10th Birthday Adventure',
  eventDate: '2026-12-15',
  location: 'Austin, TX',
  guestCount: 25,
  totalBudgetMinor: 150000,
  currency: 'USD',
  themeOrCulture: 'Space Exploration',
  targetAgeGroup: 'Children (4-12)',
  dietaryRequirements: 'Nut-free snacks',
  accessibilityNeeds: 'Sensory-friendly quiet area',
  freeTextVision: 'Fun science games',
  isOutdoor: true,
  budgetItems: [
    {
      id: 'b-1',
      category: 'Venue & Entertainment',
      allocatedMinor: 80000,
      spentMinor: 20000,
      isEstimate: false,
    },
    {
      id: 'b-2',
      category: 'Cake & Refreshments',
      allocatedMinor: 70000,
      spentMinor: 10000,
      isEstimate: false,
    },
  ],
  timelineItems: [
    {
      id: 't-1',
      phase: 'Phase 1',
      title: 'Invitations & Theme',
      description: 'Send invites',
      dueDate: '2026-11-01',
      status: 'completed',
      isEstimate: false,
    },
    {
      id: 't-2',
      phase: 'Phase 2',
      title: 'Activity Supplies',
      description: 'Buy rocket kits',
      dueDate: '2026-11-20',
      status: 'pending',
      isEstimate: false,
    },
  ],
  vendorItems: [
    {
      id: 'v-1',
      category: 'Entertainment',
      name: 'Science Party Co',
      status: 'booked',
      notes: 'Science performer booked',
      isEstimate: false,
    },
    {
      id: 'v-2',
      category: 'Catering & Bakery',
      name: 'Cake Studio',
      status: 'to_contact',
      notes: '',
      isEstimate: false,
    },
  ],
  ideas: [
    {
      id: 'idea-1',
      category: 'activity',
      title: 'Rocket Launching',
      description: 'Build mini bottle rockets',
    },
  ],
};

describe('WorkspaceNavigation Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders navigation tabs when no plan exists', () => {
    render(
      <PlanProvider>
        <WorkspaceNavigation />
      </PlanProvider>,
    );

    expect(screen.getByRole('navigation', { name: 'Planning Workspace Navigation' })).toBeDefined();
    expect(screen.getByRole('link', { name: /Overview/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /Budget Planner/i })).toBeDefined();
  });

  it('renders event header banner when plan is present in storage', async () => {
    savePlanToStorage(samplePlan);

    render(
      <PlanProvider>
        <WorkspaceNavigation />
      </PlanProvider>,
    );

    expect(await screen.findByText('Leo 10th Birthday Adventure')).toBeDefined();
    expect(screen.getByText('Outdoor Event')).toBeDefined();
    expect(screen.getByRole('link', { name: /Edit Event Details/i })).toBeDefined();
  });

  it('toggles mobile menu and closes on escape key', () => {
    render(
      <PlanProvider>
        <WorkspaceNavigation />
      </PlanProvider>,
    );

    const toggle = screen.getByRole('button', { name: /Workspace Navigation Menu/i });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');

    // Click to open
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');

    // Press escape
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('closes mobile menu when nav link is clicked', () => {
    render(
      <PlanProvider>
        <WorkspaceNavigation />
      </PlanProvider>,
    );

    const toggle = screen.getByRole('button', { name: /Workspace Navigation Menu/i });
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');

    const budgetTab = screen.getByRole('link', { name: /Budget Planner/i });
    fireEvent.click(budgetTab);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });
});

describe('OverviewSnapshotCard Component', () => {
  it('renders plan title, location, countdown, and constraints', () => {
    render(<OverviewSnapshotCard plan={samplePlan} />);

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      'Leo 10th Birthday Adventure',
    );
    expect(screen.getByText(/Austin, TX/i)).toBeDefined();
    expect(screen.getByText(/Outdoor Venue/i)).toBeDefined();
    expect(screen.getByText(/Nut-free snacks/i)).toBeDefined();
    expect(screen.getByText(/Sensory-friendly quiet area/i)).toBeDefined();
    expect(screen.getByRole('link', { name: /Reconfigure Parameters/i })).toBeDefined();
  });

  it('handles countdown for past and today events', () => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const todayPlan: EventPlan = {
      ...samplePlan,
      eventDate: todayStr,
    };
    const { unmount } = render(<OverviewSnapshotCard plan={todayPlan} />);
    expect(screen.getByText(/Event is today!/i)).toBeDefined();
    unmount();

    const pastPlan: EventPlan = {
      ...samplePlan,
      eventDate: '2020-01-01',
    };
    render(<OverviewSnapshotCard plan={pastPlan} />);
    expect(screen.getByText(/days ago/i)).toBeDefined();
  });
});

describe('OverviewMetricsGrid Component', () => {
  it('renders all 6 metric cards with accurate computed totals and quick links', () => {
    render(<OverviewMetricsGrid plan={samplePlan} />);

    // Budget card
    expect(screen.getByText('Budget Planner')).toBeDefined();
    expect(screen.getAllByText(/1,500\.00/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Remaining:\s*1,200\.00/i)).toBeDefined();
    expect(screen.getByRole('link', { name: /Manage Allocations & Actuals/i })).toBeDefined();

    // Timeline card
    expect(screen.getByText('Timeline & Milestones')).toBeDefined();
    expect(screen.getByText('1 / 2 Milestones')).toBeDefined();
    expect(screen.getByText(/50% Completed/i)).toBeDefined();
    expect(screen.getByText(/Next: Activity Supplies/i)).toBeDefined();
    expect(screen.getByRole('link', { name: /View Milestone Schedule/i })).toBeDefined();

    // Vendors card
    expect(screen.getByText('Vendor Checklist')).toBeDefined();
    expect(screen.getByText('1 / 2 Booked')).toBeDefined();
    expect(screen.getByRole('link', { name: /Open Vendor Checklist/i })).toBeDefined();

    // Ideas, Assistant, Portability
    expect(screen.getByText('Personalized Ideas')).toBeDefined();
    expect(screen.getByText('Planning Assistant')).toBeDefined();
    expect(screen.getByText('Export & Portability')).toBeDefined();
    expect(screen.getByRole('link', { name: /Stream Personalized Ideas/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /Consult Planning Assistant/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /Export, Print & Backup/i })).toBeDefined();
  });

  it('handles empty timeline items gracefully', () => {
    const emptyTimelinePlan: EventPlan = {
      ...samplePlan,
      timelineItems: [],
    };
    render(<OverviewMetricsGrid plan={emptyTimelinePlan} />);
    expect(screen.getByText('0 / 0 Milestones')).toBeDefined();
    expect(screen.getByText(/0% Completed/i)).toBeDefined();
    expect(screen.getByText(/Next: All completed!/i)).toBeDefined();
  });
});
