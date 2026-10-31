import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  PageHeader,
  Input,
  Select,
} from '@/features/ui';

describe('UI Primitives - Design System Components', () => {
  describe('Button', () => {
    it('renders with default props and handles click events', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Submit Plan</Button>);

      const btn = screen.getByRole('button', { name: 'Submit Plan' });
      expect(btn).toBeDefined();
      fireEvent.click(btn);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('renders loading spinner and disables button when isLoading is true', () => {
      render(
        <Button isLoading loadingText="Saving...">
          Save
        </Button>,
      );
      const btn = screen.getByRole('button');
      expect(btn.hasAttribute('disabled')).toBe(true);
      expect(btn.getAttribute('aria-busy')).toBe('true');
      expect(screen.getByText('Saving...')).toBeDefined();
    });

    it('renders spinner with children fallback when loadingText is omitted', () => {
      render(<Button isLoading>Auto Saving</Button>);
      expect(screen.getByText('Auto Saving')).toBeDefined();
    });

    it('renders all variant and size permutations correctly', () => {
      const { rerender } = render(
        <Button variant="danger" size="lg">
          Delete
        </Button>,
      );
      expect(screen.getByRole('button').className).toContain('bg-danger');
      expect(screen.getByRole('button').className).toContain('px-6');

      rerender(
        <Button variant="outline" size="sm">
          Outline
        </Button>,
      );
      expect(screen.getByRole('button').className).toContain('border-primary');
      expect(screen.getByRole('button').className).toContain('px-3');

      rerender(
        <Button variant="secondary" size="md">
          Secondary
        </Button>,
      );
      expect(screen.getByRole('button').className).toContain('bg-surface');

      rerender(<Button variant="ghost">Ghost</Button>);
      expect(screen.getByRole('button').className).toContain('hover:bg-surface-elevated');

      rerender(<Button variant="primary">Primary</Button>);
      expect(screen.getByRole('button').className).toContain('bg-primary');
    });
  });

  describe('Badge', () => {
    it('renders all variants and sizes', () => {
      const { rerender } = render(
        <Badge variant="success" size="sm">
          Booked
        </Badge>,
      );
      expect(screen.getByText('Booked').className).toContain('text-primary');

      rerender(<Badge variant="warning">Estimate</Badge>);
      expect(screen.getByText('Estimate').className).toContain('text-warning');

      rerender(<Badge variant="danger">Overdue</Badge>);
      expect(screen.getByText('Overdue').className).toContain('text-danger');

      rerender(<Badge variant="info">Advisory</Badge>);
      expect(screen.getByText('Advisory').className).toContain('text-info');

      rerender(<Badge variant="outline">Unconfirmed</Badge>);
      expect(screen.getByText('Unconfirmed').className).toContain('bg-transparent');

      rerender(<Badge variant="default">Standard</Badge>);
      expect(screen.getByText('Standard').className).toContain('bg-surface-elevated');
    });
  });

  describe('Card & Structure', () => {
    it('renders Card with header, title, description, content, and footer', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Budget Overview</CardTitle>
            <CardDescription>Breakdown by category</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Main content area</p>
          </CardContent>
          <CardFooter>
            <span>Footer text</span>
          </CardFooter>
        </Card>,
      );

      expect(screen.getByText('Budget Overview')).toBeDefined();
      expect(screen.getByText('Breakdown by category')).toBeDefined();
      expect(screen.getByText('Main content area')).toBeDefined();
      expect(screen.getByText('Footer text')).toBeDefined();
    });
  });

  describe('Input', () => {
    it('renders label, input, and accessible error message', () => {
      render(
        <Input label="Event Name" placeholder="e.g. Annual Gala" error="Event name is required" />,
      );

      expect(screen.getByLabelText('Event Name')).toBeDefined();
      const input = screen.getByPlaceholderText('e.g. Annual Gala');
      expect(input.getAttribute('aria-invalid')).toBe('true');
      expect(screen.getByRole('alert').textContent).toBe('Event name is required');
    });

    it('renders helper text when there is no error', () => {
      render(<Input label="Location" helperText="City and state or venue address" />);

      expect(screen.getByText('City and state or venue address')).toBeDefined();
    });

    it('handles explicit id without label', () => {
      render(<Input id="custom-field" placeholder="Without label" />);
      expect(screen.getByPlaceholderText('Without label').id).toBe('custom-field');
    });
  });

  describe('Select', () => {
    it('renders options array and responds to selection changes', () => {
      const handleChange = vi.fn();
      render(
        <Select
          label="Event Archetype"
          onChange={handleChange}
          options={[
            { value: 'wedding', label: 'Wedding' },
            { value: 'birthday', label: 'Milestone Birthday' },
          ]}
        />,
      );

      const select = screen.getByLabelText('Event Archetype');
      fireEvent.change(select, { target: { value: 'birthday' } });
      expect(handleChange).toHaveBeenCalled();
    });

    it('renders children options with error and helper text branches', () => {
      const { rerender } = render(
        <Select label="Priority" error="Select a priority">
          <option value="high">High</option>
        </Select>,
      );
      expect(screen.getByRole('alert').textContent).toBe('Select a priority');

      rerender(
        <Select id="priority-select" helperText="Choose level">
          <option value="low">Low</option>
        </Select>,
      );
      expect(screen.getByText('Choose level')).toBeDefined();
    });
  });

  describe('PageHeader', () => {
    it('renders title, description, badge, and action elements', () => {
      render(
        <PageHeader
          title="Vendor Matrix"
          description="Manage supplier quotes and contracts"
          badge={<Badge variant="info">OSM Connected</Badge>}
          actions={<Button size="sm">Add Vendor</Button>}
        />,
      );

      expect(screen.getByRole('heading', { name: 'Vendor Matrix' })).toBeDefined();
      expect(screen.getByText('Manage supplier quotes and contracts')).toBeDefined();
      expect(screen.getByText('OSM Connected')).toBeDefined();
      expect(screen.getByRole('button', { name: 'Add Vendor' })).toBeDefined();
    });

    it('renders with minimal props (title only)', () => {
      render(<PageHeader title="Minimal Title" />);
      expect(screen.getByRole('heading', { name: 'Minimal Title' })).toBeDefined();
    });
  });
});
