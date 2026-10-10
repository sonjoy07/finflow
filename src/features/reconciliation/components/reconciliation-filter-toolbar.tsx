'use client';

import * as React from 'react';
import { Search, RotateCcw, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ReconciliationFilters } from '../types/reconciliation.types';

interface ReconciliationFilterToolbarProps {
  filters: ReconciliationFilters;
  onFilterChange: (updates: Partial<ReconciliationFilters>) => void;
  onResetFilters: () => void;
  summaryCounts?: {
    total: number;
    matched: number;
    mismatchedAmount: number;
    duplicate: number;
    missingProvider: number;
    missingInternal: number;
    unmatched: number;
    resolved: number;
  };
}

export function ReconciliationFilterToolbar({
  filters,
  onFilterChange,
  onResetFilters,
  summaryCounts,
}: ReconciliationFilterToolbarProps) {
  const [localSearch, setLocalSearch] = React.useState(filters.search || '');

  React.useEffect(() => {
    setLocalSearch(filters.search || '');
  }, [filters.search]);

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if ((localSearch || '') !== (filters.search || '')) {
        onFilterChange({ search: localSearch, page: 1 });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, filters.search, onFilterChange]);

  const currentStatus = filters.status || 'all';

  const statusTabs: Array<{ id: string; label: string; count?: number }> = [
    { id: 'all', label: 'All Records', count: summaryCounts?.total },
    { id: 'matched', label: 'Matched', count: summaryCounts?.matched },
    { id: 'mismatched_amount', label: 'Amount Mismatch', count: summaryCounts?.mismatchedAmount },
    { id: 'duplicate_record', label: 'Duplicates', count: summaryCounts?.duplicate },
    { id: 'missing_provider', label: 'Missing in Provider', count: summaryCounts?.missingProvider },
    { id: 'missing_internal', label: 'Missing Internal', count: summaryCounts?.missingInternal },
    { id: 'unmatched', label: 'Unmatched', count: summaryCounts?.unmatched },
    { id: 'resolved', label: 'Resolved', count: summaryCounts?.resolved },
  ];

  const hasActiveFilters = Boolean(
    (filters.status && filters.status !== 'all') ||
    (filters.search && filters.search.trim() !== '')
  );

  return (
    <div className="space-y-3 bg-card p-4 rounded-2xl border border-border/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Top Row: Search & Status Filter Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="w-full md:w-96">
          <Input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search batch ID, transaction ID, external reference..."
            startIcon={<Search className="h-4 w-4" aria-hidden="true" />}
            endIcon={
              localSearch ? (
                <button
                  type="button"
                  onClick={() => {
                    setLocalSearch('');
                    onFilterChange({ search: '', page: 1 });
                  }}
                  className="p-1 hover:text-foreground"
                  aria-label="Clear search input"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              ) : undefined
            }
            aria-label="Search reconciliation records"
            className="h-9 text-xs"
          />
        </div>

        {/* Reset button if filtered */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-9 gap-1 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 shrink-0 self-start md:self-auto"
            aria-label="Reset all reconciliation filters"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Reset Filters</span>
          </Button>
        )}
      </div>

      {/* View Filter Pills */}
      <div
        role="tablist"
        aria-label="Reconciliation record category views"
        className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar border-t border-border/40"
      >
        {statusTabs.map((tab) => {
          const isActive = currentStatus === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onFilterChange({ status: tab.id, page: 1 })}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`inline-flex items-center justify-center rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                    isActive
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
