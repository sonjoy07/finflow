'use client';

import * as React from 'react';
import { Search, Download, RotateCcw, Columns3, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import type { UrlFilters } from '@/hooks/use-url-filters';
import type { VisibilityState } from '@tanstack/react-table';

interface TransactionFilterToolbarProps {
  filters: UrlFilters;
  onFilterChange: (updates: Partial<UrlFilters>) => void;
  onResetFilters: () => void;
  columnVisibility: VisibilityState;
  onToggleColumnVisibility: (columnId: string) => void;
  allColumns: Array<{ id: string; label: string }>;
  onExportCsv: () => void;
  isExporting?: boolean;
}

export function TransactionFilterToolbar({
  filters,
  onFilterChange,
  onResetFilters,
  columnVisibility,
  onToggleColumnVisibility,
  allColumns,
  onExportCsv,
  isExporting = false,
}: TransactionFilterToolbarProps) {
  // Local state for debounced search input
  const [localSearch, setLocalSearch] = React.useState(filters.q);
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = React.useState(false);

  React.useEffect(() => {
    setLocalSearch(filters.q);
  }, [filters.q]);

  // Debounce search input by 300ms
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.q) {
        onFilterChange({ q: localSearch });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, filters.q, onFilterChange]);

  const hasActiveFilters = Boolean(
    filters.q ||
    (filters.status && filters.status !== 'all') ||
    (filters.paymentMethod && filters.paymentMethod !== 'all') ||
    filters.minAmount ||
    filters.maxAmount ||
    filters.from ||
    filters.to
  );

  return (
    <div className="space-y-3 bg-card p-4 rounded-xl border border-border shadow-xs">
      {/* Primary Toolbar Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="w-full md:w-80">
          <Input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search by ID, customer name, email..."
            startIcon={<Search className="h-4 w-4" aria-hidden="true" />}
            endIcon={
              localSearch ? (
                <button
                  type="button"
                  onClick={() => {
                    setLocalSearch('');
                    onFilterChange({ q: '' });
                  }}
                  className="p-1 hover:text-foreground"
                  aria-label="Clear search query"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              ) : undefined
            }
            aria-label="Search transactions"
            className="h-9"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Dropdown */}
          <div className="w-36">
            <Select
              value={filters.status}
              onChange={(e) => onFilterChange({ status: e.target.value })}
              aria-label="Filter by transaction status"
              className="h-9 text-xs"
            >
              <option value="all">All Statuses</option>
              <option value="settled">Settled</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
              <option value="disputed">Disputed</option>
            </Select>
          </div>

          {/* Payment Method Dropdown */}
          <div className="w-40">
            <Select
              value={filters.paymentMethod}
              onChange={(e) => onFilterChange({ paymentMethod: e.target.value })}
              aria-label="Filter by payment method"
              className="h-9 text-xs"
            >
              <option value="all">All Rails</option>
              <option value="card">Credit / Debit Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="virtual_account">Virtual Account</option>
              <option value="ach">ACH</option>
              <option value="wire">Fedwire</option>
            </Select>
          </div>

          {/* Toggle Advanced Filters Button */}
          <Button
            variant={isAdvancedFiltersOpen ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setIsAdvancedFiltersOpen(!isAdvancedFiltersOpen)}
            className="h-9 gap-1.5 text-xs"
            aria-expanded={isAdvancedFiltersOpen}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            <span>More Filters</span>
          </Button>

          {/* Column Visibility Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
                <Columns3 className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Columns</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="right" className="w-44 p-1.5">
              <span className="px-2 py-1 text-[10px] uppercase font-semibold text-muted-foreground block">
                Toggle Columns
              </span>
              <DropdownMenuSeparator />
              {allColumns.map((col) => {
                const isVisible = columnVisibility[col.id] !== false;
                return (
                  <DropdownMenuItem
                    key={col.id}
                    onClick={() => onToggleColumnVisibility(col.id)}
                    className="flex items-center justify-between py-1 px-2"
                  >
                    <span>{col.label}</span>
                    <span className="text-xs">{isVisible ? '✓' : ''}</span>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Export CSV Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onExportCsv}
            disabled={isExporting}
            className="h-9 gap-1.5 text-xs"
            aria-label="Export filtered transactions to CSV"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="h-9 gap-1 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
              aria-label="Reset all active filters"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters Panel (Amount & Date Ranges) */}
      {isAdvancedFiltersOpen && (
        <div className="pt-3 border-t border-border/60 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
          <div className="space-y-1">
            <label htmlFor="min-amount" className="font-medium text-foreground">
              Min Amount ($ USD)
            </label>
            <Input
              id="min-amount"
              type="number"
              placeholder="e.g. 50"
              value={filters.minAmount}
              onChange={(e) => onFilterChange({ minAmount: e.target.value })}
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="max-amount" className="font-medium text-foreground">
              Max Amount ($ USD)
            </label>
            <Input
              id="max-amount"
              type="number"
              placeholder="e.g. 5000"
              value={filters.maxAmount}
              onChange={(e) => onFilterChange({ maxAmount: e.target.value })}
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="from-date" className="font-medium text-foreground">
              From Date
            </label>
            <Input
              id="from-date"
              type="date"
              value={filters.from}
              onChange={(e) => onFilterChange({ from: e.target.value })}
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="to-date" className="font-medium text-foreground">
              To Date
            </label>
            <Input
              id="to-date"
              type="date"
              value={filters.to}
              onChange={(e) => onFilterChange({ to: e.target.value })}
              className="h-8 text-xs"
            />
          </div>
        </div>
      )}
    </div>
  );
}
