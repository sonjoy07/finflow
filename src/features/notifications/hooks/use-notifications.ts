import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationKeys } from '@/lib/query-keys';
import { useToastStore } from '@/stores/toast-store';
import type { ApiSuccessResponse } from '@/types';
import type { NotificationItem } from '../types/notification.types';

export function useNotifications(options: { unreadOnly?: boolean; severity?: string } = {}) {
  const { unreadOnly = false, severity } = options;

  return useQuery<NotificationItem[]>({
    queryKey: notificationKeys.list({ unreadOnly, severity }),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (unreadOnly) params.set('unreadOnly', 'true');
      if (severity && severity !== 'all') params.set('severity', severity);

      const res = await fetch(`/api/notifications?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch operational notifications.');
      }
      const json: ApiSuccessResponse<NotificationItem[]> = await res.json();
      return json.data;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
      });
      if (!res.ok) {
        throw new Error('Failed to update notification state.');
      }
      return res.json();
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });

      // Optimistically update any active notification queries
      queryClient.setQueriesData<NotificationItem[]>(
        { queryKey: notificationKeys.lists() },
        (old) => {
          if (!old) return [];
          return old.map((item) => (item.id === id ? { ...item, read: true } : item));
        }
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);

  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_all_read' }),
      });
      if (!res.ok) {
        throw new Error('Failed to mark all notifications as read.');
      }
      return res.json();
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });

      // Optimistically mark all as read
      queryClient.setQueriesData<NotificationItem[]>(
        { queryKey: notificationKeys.lists() },
        (old) => {
          if (!old) return [];
          return old.map((item) => ({ ...item, read: true }));
        }
      );
    },
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'All Caught Up',
        message: 'All notifications marked as read.',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
