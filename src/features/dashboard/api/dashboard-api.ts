import { apiClient } from '@/lib/api-client';
import type { DashboardData, TimeRange } from '../types/dashboard.types';

export async function fetchDashboardMetrics(
  timeRange: TimeRange = '7d',
  signal?: AbortSignal
): Promise<DashboardData> {
  return apiClient<DashboardData>(`/api/dashboard?timeRange=${timeRange}`, {
    signal,
  });
}
