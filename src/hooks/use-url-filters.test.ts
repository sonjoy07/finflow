import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUrlFilters } from './use-url-filters';
import * as navigation from 'next/navigation';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
}));

describe('useUrlFilters', () => {
  const mockReplace = vi.fn();
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (navigation.useRouter as any).mockReturnValue({
      replace: mockReplace,
      push: mockPush,
    });
    (navigation.usePathname as any).mockReturnValue('/transactions');
  });

  it('parses default filters when query params are absent', () => {
    (navigation.useSearchParams as any).mockReturnValue(new URLSearchParams());

    const { result } = renderHook(() => useUrlFilters());

    expect(result.current.filters).toEqual({
      page: 1,
      pageSize: 25,
      q: '',
      status: 'all',
      paymentMethod: 'all',
      minAmount: '',
      maxAmount: '',
      from: '',
      to: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      selectedId: null,
    });
  });

  it('parses active query params from URL search params', () => {
    const params = new URLSearchParams({
      q: 'acme',
      status: 'failed',
      method: 'card',
      page: '3',
      pageSize: '50',
      sortBy: 'amountCents',
      sortOrder: 'asc',
      selectedId: 'tx_999',
    });
    (navigation.useSearchParams as any).mockReturnValue(params);

    const { result } = renderHook(() => useUrlFilters());

    expect(result.current.filters.q).toBe('acme');
    expect(result.current.filters.status).toBe('failed');
    expect(result.current.filters.paymentMethod).toBe('card');
    expect(result.current.filters.page).toBe(3);
    expect(result.current.filters.pageSize).toBe(50);
    expect(result.current.filters.sortBy).toBe('amountCents');
    expect(result.current.filters.sortOrder).toBe('asc');
    expect(result.current.filters.selectedId).toBe('tx_999');
  });

  it('resets page to 1 when changing search filters', () => {
    const initialParams = new URLSearchParams({
      page: '5',
      status: 'settled',
    });
    (navigation.useSearchParams as any).mockReturnValue(initialParams);

    const { result } = renderHook(() => useUrlFilters());

    act(() => {
      result.current.setFilters({ status: 'failed' });
    });

    expect(mockReplace).toHaveBeenCalledTimes(1);
    const calledUrl = mockReplace.mock.calls[0]![0];
    expect(calledUrl).toContain('status=failed');
    // Page reset to 1
    expect(calledUrl).toContain('page=1');
  });

  it('preserves filters when opening and closing selected transaction detail', () => {
    const initialParams = new URLSearchParams({
      q: 'alpha',
      status: 'failed',
      page: '2',
    });
    (navigation.useSearchParams as any).mockReturnValue(initialParams);

    const { result } = renderHook(() => useUrlFilters());

    act(() => {
      result.current.setSelectedTransactionId('tx_selected_777');
    });

    expect(mockReplace).toHaveBeenCalledTimes(1);
    const detailUrl = mockReplace.mock.calls[0]![0];
    expect(detailUrl).toContain('selectedId=tx_selected_777');
    expect(detailUrl).toContain('q=alpha');
    expect(detailUrl).toContain('status=failed');
    expect(detailUrl).toContain('page=2');
  });
});
