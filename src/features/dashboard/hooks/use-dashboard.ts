import { useQuery } from '@tanstack/react-query';
import { dashboardKeys } from '../api/dashboard-keys';
import { fetchDashboardMetrics } from '../api/dashboard-api';
import type { TimeRange } from '../types/dashboard.types';

export function useDashboard(timeRange: TimeRange = '7d') {
  return useQuery({
    queryKey: dashboardKeys.metrics(timeRange),
    queryFn: ({ signal }) => fetchDashboardMetrics(timeRange, signal),
    staleTime: 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
}
