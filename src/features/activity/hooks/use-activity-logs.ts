import { useQuery } from '@tanstack/react-query';
import { activityKeys } from '@/lib/query-keys';
import type { ApiSuccessResponse } from '@/types';
import type { ActivityLog, ActivityFilterParams } from '../types/activity.types';

export interface ActivityLogsResponse {
  data: ActivityLog[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export function useActivityLogs(params: ActivityFilterParams = {}) {
  const {
    page = 1,
    pageSize = 10,
    q,
    role,
    action,
    entityType,
    result,
    from,
    to,
  } = params;

  return useQuery<ActivityLogsResponse>({
    queryKey: activityKeys.list({
      page,
      pageSize,
      q,
      role,
      action,
      entityType,
      result,
      from,
      to,
    }),
    queryFn: async () => {
      const search = new URLSearchParams();
      search.set('page', String(page));
      search.set('pageSize', String(pageSize));
      if (q) search.set('q', q);
      if (role && role !== 'all') search.set('role', role);
      if (action && action !== 'all') search.set('action', action);
      if (entityType && entityType !== 'all') search.set('entityType', entityType);
      if (result && result !== 'all') search.set('result', result);
      if (from) search.set('from', from);
      if (to) search.set('to', to);

      const res = await fetch(`/api/activity?${search.toString()}`);
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || 'Failed to fetch activity audit records.');
      }
      const json: ApiSuccessResponse<ActivityLog[]> = await res.json();
      const meta = json.meta;
      return {
        data: json.data,
        meta: {
          page: meta?.page ?? page,
          pageSize: meta?.pageSize ?? pageSize,
          totalItems: meta?.totalItems ?? json.data.length,
          totalPages: meta?.totalPages ?? 1,
        },
      };
    },
    placeholderData: (previousData) => previousData,
    staleTime: 10 * 1000,
  });
}
