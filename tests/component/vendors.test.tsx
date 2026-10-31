import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VendorChecklist } from '../../features/vendors/vendor-checklist';
import { OsmVendorSearch } from '../../features/vendors/osm-vendor-search';
import type { EventPlan } from '../../lib/schemas/event-plan';

describe('VendorChecklist and OsmVendorSearch Components', () => {
  const mockPlan: EventPlan = {
    id: 'plan-1',
    schemaVersion: 1,
    title: 'Wedding in Boston',
    eventType: 'wedding',
    eventDate: '2026-09-18',
    location: 'Boston, MA',
    guestCount: 100,
    totalBudgetMinor: 1000000,
    currency: 'USD',
    isOutdoor: false,
    budgetItems: [],
    timelineItems: [],
    vendorItems: [
      {
        id: 'v1',
        category: 'Catering',
        name: 'Delicious Catering',
        status: 'to_contact',
        isEstimate: true,
      },
      {
        id: 'v2',
        category: 'Photography',
        name: 'Lens Studio',
        status: 'quoted',
        isEstimate: false,
      },
    ],
    ideas: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  it('renders categorized vendors and allows status update', () => {
    const onPlanUpdate = vi.fn();
    render(<VendorChecklist plan={mockPlan} onPlanUpdate={onPlanUpdate} />);

    expect(screen.getByText('Delicious Catering')).toBeDefined();
    expect(screen.getByText('Lens Studio')).toBeDefined();

    const statusSelects = screen.getAllByRole('combobox');
    const select = statusSelects[1]; // first vendor select
    expect(select).toBeDefined();
    if (select) {
      fireEvent.change(select, { target: { value: 'booked' } });
      expect(onPlanUpdate).toHaveBeenCalled();
    }
  });

  it('searches OpenStreetMap places and adds place as vendor', async () => {
    const onAddPlaceAsVendor = vi.fn();
    const mockPlaces = [
      {
        osmId: '987',
        name: 'Sweet Tooth Bakery',
        displayName: 'Sweet Tooth Bakery, Boston',
        type: 'bakery',
        category: 'shop',
        latitude: 42.36,
        longitude: -71.05,
      },
    ];

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ places: mockPlaces }),
    } as Response);

    render(<OsmVendorSearch location="Boston, MA" onAddPlaceAsVendor={onAddPlaceAsVendor} />);
    const bakeryBtn = screen.getByRole('button', { name: /Bakeries/i });
    fireEvent.click(bakeryBtn);

    await waitFor(() => {
      expect(screen.getByText('Sweet Tooth Bakery')).toBeDefined();
    });

    const addBtn = screen.getByRole('button', { name: /\+ Add to Checklist/i });
    fireEvent.click(addBtn);

    expect(onAddPlaceAsVendor).toHaveBeenCalledWith(mockPlaces[0]);
  });

  it('filters vendor checklist by category', () => {
    const onPlanUpdate = vi.fn();
    render(<VendorChecklist plan={mockPlan} onPlanUpdate={onPlanUpdate} />);

    const filter = screen.getByLabelText(/Category:/i);
    fireEvent.change(filter, { target: { value: 'Catering' } });

    expect(screen.getByText('Delicious Catering')).toBeDefined();
    expect(screen.queryByText('Lens Studio')).toBeNull();
  });

  it('displays error message when OSM places search fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    render(<OsmVendorSearch location="Boston, MA" onAddPlaceAsVendor={vi.fn()} />);
    const bakeryBtn = screen.getByRole('button', { name: /Bakeries/i });
    fireEvent.click(bakeryBtn);

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert.textContent).toContain('Places search service currently unavailable');
    });
  });

  it('integrates OSM vendor addition directly into VendorChecklist', async () => {
    const onPlanUpdate = vi.fn();
    const mockPlaces = [
      {
        osmId: '777',
        name: 'Historic Ballroom',
        displayName: 'Historic Ballroom, Boston',
        type: 'hall',
        category: 'amenity',
        latitude: 42.36,
        longitude: -71.05,
      },
    ];

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ places: mockPlaces }),
    } as Response);

    render(<VendorChecklist plan={mockPlan} onPlanUpdate={onPlanUpdate} />);

    const venuesBtn = screen.getByRole('button', { name: /Venues \/ Centers/i });
    fireEvent.click(venuesBtn);

    await waitFor(() => {
      expect(screen.getByText('Historic Ballroom')).toBeDefined();
    });

    const addBtn = screen.getByRole('button', { name: /\+ Add to Checklist/i });
    fireEvent.click(addBtn);

    expect(onPlanUpdate).toHaveBeenCalled();
  });

  it('supports custom search query and clicking quick category buttons', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ places: [] }),
    } as Response);

    render(<OsmVendorSearch location="Boston, MA" onAddPlaceAsVendor={vi.fn()} />);

    // Click caterers
    fireEvent.click(screen.getByRole('button', { name: /Caterers/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Search' })).toBeDefined();
    });

    // Custom query input and search button
    const searchInput = screen.getByPlaceholderText(/Search custom vendor type/i);
    fireEvent.change(searchInput, { target: { value: 'tent rental' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalled();
    });
  });
});
