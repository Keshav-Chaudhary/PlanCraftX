import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EventWizard } from '../../features/wizard/event-wizard';

describe('EventWizard Component', () => {
  it('renders all form controls and event type buttons', () => {
    const onPlanCreated = vi.fn();
    render(<EventWizard onPlanCreated={onPlanCreated} isInitialSetup={true} />);

    expect(screen.getByRole('button', { name: /Wedding/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Birthday/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Community/i })).toBeDefined();

    expect(screen.getByLabelText(/Event Date/i)).toBeDefined();
    expect(screen.getByLabelText(/City \/ Location/i)).toBeDefined();
    expect(screen.getByLabelText(/Expected Guests/i)).toBeDefined();
    expect(screen.getByLabelText(/Total Budget/i)).toBeDefined();
    expect(screen.getByLabelText(/Currency/i)).toBeDefined();
  });

  it('submits form and calls onPlanCreated on successful API response', async () => {
    const onPlanCreated = vi.fn();
    const mockPlan = {
      id: 'plan-123',
      schemaVersion: 1,
      title: 'WEDDING Planning: New York, NY',
      eventType: 'wedding',
      eventDate: '2026-09-15',
      location: 'New York, NY',
      guestCount: 100,
      totalBudgetMinor: 2000000,
      currency: 'USD',
      isOutdoor: false,
      budgetItems: [],
      timelineItems: [],
      vendorItems: [],
      ideas: [],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockPlan,
    } as Response);

    render(<EventWizard onPlanCreated={onPlanCreated} isInitialSetup={true} />);
    const submitBtn = screen.getByRole('button', { name: /Generate Event Plan/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onPlanCreated).toHaveBeenCalledWith(mockPlan);
    });
  });

  it('displays accessible error message when API call fails', async () => {
    const onPlanCreated = vi.fn();
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Server rate limit exceeded' }),
    } as Response);

    render(<EventWizard onPlanCreated={onPlanCreated} isInitialSetup={true} />);
    const submitBtn = screen.getByRole('button', { name: /Generate Event Plan/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert.textContent).toContain('Server rate limit exceeded');
    });
  });

  it('populates wizard fields from natural language intake', async () => {
    const onPlanCreated = vi.fn();
    render(<EventWizard onPlanCreated={onPlanCreated} isInitialSetup={true} />);

    const toggleBtn = screen.getByRole('button', { name: /describe in natural language/i });
    fireEvent.click(toggleBtn);

    const textarea = screen.getByPlaceholderText(/type your event description here/i);
    fireEvent.change(textarea, { target: { value: 'Community arts festival for 400 people' } });

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        eventType: 'community',
        eventDate: '2026-10-01',
        location: 'Austin, TX',
        guestCount: 400,
        totalBudgetMajor: 15000,
        currency: 'USD',
        isOutdoor: true,
        priorities: 'Art installations',
        dietaryRequirements: 'Vegetarian snacks',
      }),
    } as Response);

    const fillBtn = screen.getByRole('button', { name: /fill form from description/i });
    fireEvent.click(fillBtn);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Austin, TX')).toBeDefined();
    });
  });

  it('allows selecting birthday and community event types and filling all form inputs', async () => {
    const onPlanCreated = vi.fn();
    render(<EventWizard onPlanCreated={onPlanCreated} isInitialSetup={false} />);

    // Select birthday
    const bdayBtn = screen.getByRole('button', { name: /Birthday/i });
    fireEvent.click(bdayBtn);
    expect(bdayBtn.getAttribute('aria-pressed')).toBe('true');

    // Select community
    const commBtn = screen.getByRole('button', { name: /Community/i });
    fireEvent.click(commBtn);
    expect(commBtn.getAttribute('aria-pressed')).toBe('true');

    // Click Wedding button explicitly to test picker branch
    const weddingBtn = screen.getByRole('button', { name: /Wedding/i });
    fireEvent.click(weddingBtn);
    expect(weddingBtn.getAttribute('aria-pressed')).toBe('true');

    // Change fields and test empty fallback handling
    fireEvent.change(screen.getByLabelText(/Expected Guests/i), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/Total Budget/i), { target: { value: '' } });

    fireEvent.change(screen.getByLabelText(/Event Date/i), { target: { value: '2026-10-31' } });
    fireEvent.change(screen.getByLabelText(/City \/ Location/i), {
      target: { value: 'Austin, TX' },
    });
    fireEvent.change(screen.getByLabelText(/Expected Guests/i), { target: { value: '250' } });
    fireEvent.change(screen.getByLabelText(/Total Budget/i), { target: { value: '15000' } });
    fireEvent.change(screen.getByLabelText(/Currency/i), { target: { value: 'EUR' } });

    const outdoorBox = screen.getByLabelText(/Outdoor Event/i);
    fireEvent.click(outdoorBox);

    fireEvent.change(screen.getByLabelText(/Dietary Requirements/i), {
      target: { value: 'Vegan' },
    });
    fireEvent.change(screen.getByLabelText(/Accessibility Needs/i), {
      target: { value: 'Wheelchair access' },
    });
    fireEvent.change(screen.getByLabelText(/Special Priorities/i), {
      target: { value: 'Eco-friendly decor' },
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'plan-custom-1', schemaVersion: 1 }),
    } as Response);

    const submitBtn = screen.getByRole('button', { name: /Generate Event Plan/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onPlanCreated).toHaveBeenCalled();
    });
  });
});
