import {
  ROLE_PERMISSIONS,
  type Permission,
  type UserRole,
  type SessionPayload,
} from '../types/auth.types';

export function hasPermission(role: UserRole, permission: Permission): boolean {
  const allowed = ROLE_PERMISSIONS[role] || [];
  return allowed.includes(permission);
}

export function assertPermission(session: SessionPayload, permission: Permission): void {
  if (!hasPermission(session.role, permission)) {
    throw new Error(`Role '${session.role}' lacks permission '${permission}'.`);
  }
}

export function getPermissionsForRole(role: UserRole): Permission[] {
  return [...(ROLE_PERMISSIONS[role] || [])];
}

export const ROUTE_PERMISSION_MAP: Record<string, Permission> = {
  '/transactions': 'TRANSACTION_VIEW',
  '/reconciliation': 'RECONCILIATION_VIEW',
  '/workflows': 'WORKFLOW_VIEW',
  '/activity': 'ACTIVITY_VIEW',
};

export function getRequiredPermissionForPath(pathname: string): Permission | null {
  for (const [route, permission] of Object.entries(ROUTE_PERMISSION_MAP)) {
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      return permission;
    }
  }
  return null;
}

