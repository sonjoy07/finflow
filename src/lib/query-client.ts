import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './api-client';

/**
 * Creates a configured QueryClient with enterprise fintech caching defaults:
 * - 30s default staleTime to balance real-time freshness against server compute
 * - 5m gcTime for garbage collection of inactive cache segments
 * - Window focus refetch disabled to prevent unexpected layout jumps during triage
 * - 4xx client errors are never retried; other errors retried once
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (error instanceof ApiError && error.statusCode >= 400 && error.statusCode < 500) {
            return false;
          }
          return failureCount < 1;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}
