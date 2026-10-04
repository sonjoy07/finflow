'use client';

import * as React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export interface UrlFilters {
  page: number;
  pageSize: number;
  q: string;
  status: string;
  paymentMethod: string;
  minAmount: string;
  maxAmount: string;
  from: string;
  to: string;
  sortBy: 'createdAt' | 'amountCents' | 'status' | 'customerName';
  sortOrder: 'asc' | 'desc';
  selectedId: string | null;
}

export function useUrlFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read current filters from URL search params
  const filters: UrlFilters = React.useMemo(() => {
    return {
      page: Math.max(1, parseInt(searchParams.get('page') || '1', 10)),
      pageSize: parseInt(searchParams.get('pageSize') || '25', 10),
      q: searchParams.get('q') || '',
      status: searchParams.get('status') || 'all',
      paymentMethod: searchParams.get('method') || 'all',
      minAmount: searchParams.get('minAmount') || '',
      maxAmount: searchParams.get('maxAmount') || '',
      from: searchParams.get('from') || '',
      to: searchParams.get('to') || '',
      sortBy: (searchParams.get('sortBy') as UrlFilters['sortBy']) || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as UrlFilters['sortOrder']) || 'desc',
      selectedId: searchParams.get('selectedId') || null,
    };
  }, [searchParams]);

  // Push updates to URL query string
  const setFilters = React.useCallback(
    (updates: Partial<UrlFilters>, options: { resetPage?: boolean } = {}) => {
      const nextParams = new URLSearchParams(searchParams.toString());

      // Should page reset to 1? (Yes if changing search, filters, or sorting)
      const shouldResetPage = options.resetPage ?? (
        'q' in updates ||
        'status' in updates ||
        'paymentMethod' in updates ||
        'minAmount' in updates ||
        'maxAmount' in updates ||
        'from' in updates ||
        'to' in updates ||
        'sortBy' in updates
      );

      if (shouldResetPage) {
        nextParams.set('page', '1');
      }

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '' || value === 'all') {
          // Map paymentMethod to 'method' in URL for clean, concise query params
          const paramKey = key === 'paymentMethod' ? 'method' : key;
          nextParams.delete(paramKey);
        } else {
          const paramKey = key === 'paymentMethod' ? 'method' : key;
          nextParams.set(paramKey, String(value));
        }
      });

      // Avoid redundant navigation if params did not change
      const queryString = nextParams.toString();
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(targetUrl, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const resetAllFilters = React.useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  const setSelectedTransactionId = React.useCallback(
    (id: string | null) => {
      setFilters({ selectedId: id }, { resetPage: false });
    },
    [setFilters]
  );

  return {
    filters,
    setFilters,
    resetAllFilters,
    setSelectedTransactionId,
  };
}
