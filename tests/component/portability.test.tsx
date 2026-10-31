import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PlanPortability } from '../../features/export/plan-portability';
import type { EventPlan } from '../../lib/schemas/event-plan';

describe('PlanPortability Component', () => {
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
    vendorItems: [],
    ideas: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  it('renders export, import, print, and privacy controls', () => {
    const onPlanImported = vi.fn();
    const onResetPlan = vi.fn();
    render(
      <PlanPortability plan={mockPlan} onPlanImported={onPlanImported} onResetPlan={onResetPlan} />,
    );

    expect(screen.getByRole('button', { name: /Download Plan JSON/i })).toBeDefined();
    expect(screen.getByText(/Upload JSON File/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Print Plan Summary/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Clear All Data/i })).toBeDefined();
  });

  it('triggers JSON export download on button click', () => {
    const onPlanImported = vi.fn();
    const onResetPlan = vi.fn();
    const createObjectURL = vi.fn(() => 'blob:mock-json-url');
    const revokeObjectURL = vi.fn();
    globalThis.URL.createObjectURL = createObjectURL;
    globalThis.URL.revokeObjectURL = revokeObjectURL;

    render(
      <PlanPortability plan={mockPlan} onPlanImported={onPlanImported} onResetPlan={onResetPlan} />,
    );

    const exportBtn = screen.getByRole('button', { name: /Download Plan JSON/i });
    fireEvent.click(exportBtn);

    expect(createObjectURL).toHaveBeenCalled();
  });

  it('calls onResetPlan and clear when Clear All Data is confirmed', () => {
    const onPlanImported = vi.fn();
    const onResetPlan = vi.fn();
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <PlanPortability plan={mockPlan} onPlanImported={onPlanImported} onResetPlan={onResetPlan} />,
    );

    const clearBtn = screen.getByRole('button', { name: /Clear All Data/i });
    fireEvent.click(clearBtn);

    expect(onResetPlan).toHaveBeenCalled();
  });

  it('calls onResetPlan when Configure New Plan is clicked', () => {
    const onPlanImported = vi.fn();
    const onResetPlan = vi.fn();

    render(
      <PlanPortability plan={mockPlan} onPlanImported={onPlanImported} onResetPlan={onResetPlan} />,
    );

    const newBtn = screen.getByRole('button', { name: /Configure New Plan/i });
    fireEvent.click(newBtn);

    expect(onResetPlan).toHaveBeenCalled();
  });

  it('handles JSON file upload', async () => {
    const onPlanImported = vi.fn();
    const onResetPlan = vi.fn();

    const { container } = render(
      <PlanPortability plan={mockPlan} onPlanImported={onPlanImported} onResetPlan={onResetPlan} />,
    );

    const fileInput = container.querySelector('#plan-file-upload') as HTMLInputElement;
    expect(fileInput).toBeDefined();

    const file = new File([JSON.stringify(mockPlan)], 'plan.json', { type: 'application/json' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(onPlanImported).toHaveBeenCalledWith(mockPlan);
    });
  });

  it('triggers window.print when print button is clicked', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    render(<PlanPortability plan={mockPlan} onPlanImported={vi.fn()} onResetPlan={vi.fn()} />);

    const printBtn = screen.getByRole('button', { name: /Print Plan Summary/i });
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();
  });

  it('displays error alert when imported file contains invalid JSON', async () => {
    const { container } = render(
      <PlanPortability plan={mockPlan} onPlanImported={vi.fn()} onResetPlan={vi.fn()} />,
    );

    const fileInput = container.querySelector('#plan-file-upload') as HTMLInputElement;
    const file = new File(['{ broken: invalid'], 'broken.json', { type: 'application/json' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert.textContent).toContain('INVALID_JSON');
    });
  });

  it('does not reset plan when user cancels Clear All Data confirmation', () => {
    const onResetPlan = vi.fn();
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(<PlanPortability plan={mockPlan} onPlanImported={vi.fn()} onResetPlan={onResetPlan} />);

    const clearBtn = screen.getByRole('button', { name: /Clear All Data/i });
    fireEvent.click(clearBtn);

    expect(onResetPlan).not.toHaveBeenCalled();
  });

  it('handles FileReader error event gracefully', async () => {
    const originalFileReader = globalThis.FileReader;
    class MockErrorReader {
      onload: ((ev: ProgressEvent<FileReader>) => unknown) | null = null;
      onerror: (() => unknown) | null = null;
      readAsText() {
        setTimeout(() => {
          if (this.onerror) this.onerror();
        }, 10);
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    globalThis.FileReader = MockErrorReader as any;

    const { container } = render(
      <PlanPortability plan={mockPlan} onPlanImported={vi.fn()} onResetPlan={vi.fn()} />,
    );
    const fileInput = container.querySelector('#plan-file-upload') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [new File(['data'], 'test.json')] } });

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert.textContent).toContain('File reader error occurred');
    });

    globalThis.FileReader = originalFileReader;
  });

  it('copies shareable link when Copy Share Link is clicked', () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText },
    });

    render(<PlanPortability plan={mockPlan} onPlanImported={vi.fn()} onResetPlan={vi.fn()} />);
    const copyBtn = screen.getByRole('button', { name: /Copy Share Link/i });
    fireEvent.click(copyBtn);
    expect(writeText).toHaveBeenCalled();
  });
});
