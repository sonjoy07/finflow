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
