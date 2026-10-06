import { useAuth } from './use-auth';
import { hasPermission } from '../lib/permissions';
import type { Permission, UserRole } from '../types/auth.types';

export function usePermission() {
  const { user, role } = useAuth();

  const can = (permission: Permission): boolean => {
    return hasPermission(user.role, permission);
  };

  return {
    can,
    role: user.role as UserRole,
    isAdmin: user.role === 'admin',
    isOperationsLead: user.role === 'operations_lead',
    isAnalyst: user.role === 'analyst',
    isAuditor: user.role === 'auditor',
  };
}
