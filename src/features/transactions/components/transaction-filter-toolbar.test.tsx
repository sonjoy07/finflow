import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import * as React from 'react';
import { TransactionFilterToolbar } from './transaction-filter-toolbar';
import type { UrlFilters } from '@/hooks/use-url-filters';

const defaultFilters: UrlFilters = {
  q: '',
  status: 'all',
  paymentMethod: 'all',
  minAmount: '',
  maxAmount: '',
  from: '',
  to: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  page: 1,
  pageSize: 10,
  selectedId: null,
};

const allColumns = [
  { id: 'select', label: 'Select' },
  { id: 'id', label: 'Transaction ID' },
  { id: 'customer', label: 'Customer' },
  { id: 'amount', label: 'Amount' },
  { id: 'status', label: 'Status' },
];

describe('TransactionFilterToolbar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const defaultProps = {
    filters: defaultFilters,
    onFilterChange: vi.fn(),
    onResetFilters: vi.fn(),
    columnVisibility: {},
    onToggleColumnVisibility: vi.fn(),
    allColumns,
    onExportCsv: vi.fn(),
    isExporting: false,
  };

  it('renders search input and triggers debounced filter change', () => {
    const onFilterChange = vi.fn();
    render(<TransactionFilterToolbar {...defaultProps} onFilterChange={onFilterChange} />);

    const searchInput = screen.getByPlaceholderText(/search by id/i);
    expect(searchInput).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'tx_123' } });

    // Not called immediately before debounce
    expect(onFilterChange).not.toHaveBeenCalled();

    // Fast-forward debounce timer (300ms)
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onFilterChange).toHaveBeenCalledWith({ q: 'tx_123' });
  });

  it('triggers onFilterChange when status select is changed', () => {
    const onFilterChange = vi.fn();
    render(<TransactionFilterToolbar {...defaultProps} onFilterChange={onFilterChange} />);

    const statusSelect = screen.getByLabelText(/filter by transaction status/i);
    fireEvent.change(statusSelect, { target: { value: 'failed' } });

    expect(onFilterChange).toHaveBeenCalledWith({ status: 'failed' });
  });

  it('toggles advanced filters drawer/section', () => {
    render(<TransactionFilterToolbar {...defaultProps} />);

    const filtersButton = screen.getByRole('button', { name: /more filters/i });
    fireEvent.click(filtersButton);

    expect(screen.getByLabelText(/min amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/max amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/from date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/to date/i)).toBeInTheDocument();
  });

  it('calls onExportCsv when export button is clicked', () => {
    const onExportCsv = vi.fn();
    render(<TransactionFilterToolbar {...defaultProps} onExportCsv={onExportCsv} />);

    const exportBtn = screen.getByRole('button', { name: /export/i });
    fireEvent.click(exportBtn);

    expect(onExportCsv).toHaveBeenCalled();
  });

  it('shows and calls onResetFilters when filters are active', () => {
    const onResetFilters = vi.fn();
    render(
      <TransactionFilterToolbar
        {...defaultProps}
        filters={{ ...defaultFilters, q: 'test_filter' }}
        onResetFilters={onResetFilters}
      />
    );

    const resetBtn = screen.getByRole('button', { name: /reset/i });
    expect(resetBtn).toBeInTheDocument();

    fireEvent.click(resetBtn);
    expect(onResetFilters).toHaveBeenCalled();
  });
});
