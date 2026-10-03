import type { TimeRange } from '../types/dashboard.types';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  metrics: (timeRange: TimeRange) => [...dashboardKeys.all, 'metrics', timeRange] as const,
};
