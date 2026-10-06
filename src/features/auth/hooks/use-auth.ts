import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { DEMO_USERS, type UserRole, type DemoUser } from '../types/auth.types';
import { useToastStore } from '@/stores/toast-store';
import type { ApiSuccessResponse } from '@/types';

export const authKeys = {
  all: ['auth'] as const,
  session: () => [...authKeys.all, 'session'] as const,
};

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const addToast = useToastStore((state) => state.addToast);

  const { data, isLoading, error } = useQuery<ApiSuccessResponse<DemoUser>>({
    queryKey: authKeys.session(),
    queryFn: async () => {
      const res = await fetch('/api/auth/session');
      if (!res.ok) {
        throw new Error('Unauthenticated');
      }
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const switchRoleMutation = useMutation({
    mutationFn: async (targetRole: UserRole) => {
      const res = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: targetRole }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || 'Failed to switch role');
      }
      return res.json() as Promise<ApiSuccessResponse<DemoUser>>;
    },
    onSuccess: (response) => {
      queryClient.setQueryData(authKeys.session(), response);
      // Invalidate relevant feature queries to reflect new permissions
      queryClient.invalidateQueries();

      const user = response.data;
      addToast({
        type: 'info',
        title: 'Persona Switched',
        message: `Now acting as ${user.name} (${user.title}).`,
      });
    },
    onError: (err: Error) => {
      addToast({
        type: 'error',
        title: 'Switch Failed',
        message: err.message,
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch('/api/auth/logout', { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.setQueryData(authKeys.session(), null);
      queryClient.clear();
      router.push('/login');
      addToast({
        type: 'info',
        title: 'Signed Out',
        message: 'Your session has ended successfully.',
      });
    },
  });

  const currentUser: DemoUser = data?.data || DEMO_USERS.admin;

  return {
    user: currentUser,
    isAuthenticated: !!data?.data,
    isLoading,
    error,
    role: currentUser.role,
    switchRole: switchRoleMutation.mutate,
    isSwitchingRole: switchRoleMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
