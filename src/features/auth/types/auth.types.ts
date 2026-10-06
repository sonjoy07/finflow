import type { UserRole } from '@/types';

export type { UserRole };

export type Permission =
  | 'TRANSACTION_VIEW'
  | 'TRANSACTION_RETRY'
  | 'RECONCILIATION_VIEW'
  | 'RECONCILIATION_RESOLVE'
  | 'WORKFLOW_VIEW'
  | 'WORKFLOW_WRITE'
  | 'WORKFLOW_SIMULATE'
  | 'ACTIVITY_VIEW';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  title: string;
}

export interface SessionPayload {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  issuedAt: number;
  expiresAt: number;
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'TRANSACTION_VIEW',
    'TRANSACTION_RETRY',
    'RECONCILIATION_VIEW',
    'RECONCILIATION_RESOLVE',
    'WORKFLOW_VIEW',
    'WORKFLOW_WRITE',
    'WORKFLOW_SIMULATE',
    'ACTIVITY_VIEW',
  ],
  operations_lead: [
    'TRANSACTION_VIEW',
    'TRANSACTION_RETRY',
    'RECONCILIATION_VIEW',
    'RECONCILIATION_RESOLVE',
    'WORKFLOW_VIEW',
    'WORKFLOW_WRITE',
    'WORKFLOW_SIMULATE',
  ],
  analyst: [
    'TRANSACTION_VIEW',
    'RECONCILIATION_VIEW',
    'RECONCILIATION_RESOLVE',
    'WORKFLOW_VIEW',
  ],
  auditor: [
    'TRANSACTION_VIEW',
    'RECONCILIATION_VIEW',
    'WORKFLOW_VIEW',
    'ACTIVITY_VIEW',
  ],
};

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  description: string;
  badgeVariant: 'default' | 'secondary' | 'warning' | 'outline';
}

export const DEMO_USERS: Record<UserRole, DemoUser> = {
  admin: {
    id: 'usr_admin_01',
    name: 'Sarah Connor',
    email: 'admin@finflow.io',
    role: 'admin',
    title: 'System Administrator',
    description: 'Unrestricted administrative access to all financial mutations, ledgers, and configurations.',
    badgeVariant: 'default',
  },
  operations_lead: {
    id: 'usr_ops_02',
    name: 'Elena Vance',
    email: 'operations@finflow.io',
    role: 'operations_lead',
    title: 'Operations Manager',
    description: 'Can schedule transaction retries, resolve reconciliation breaks, and author automated workflows.',
    badgeVariant: 'secondary',
  },
  analyst: {
    id: 'usr_analyst_03',
    name: 'Marcus Brody',
    email: 'analyst@finflow.io',
    role: 'analyst',
    title: 'Financial Analyst',
    description: 'Triage and reporting access. Can resolve discrepancy records, but cannot execute payment retries or edit rules.',
    badgeVariant: 'warning',
  },
  auditor: {
    id: 'usr_auditor_04',
    name: 'Diana Prince',
    email: 'viewer@finflow.io',
    role: 'auditor',
    title: 'Compliance Auditor (Viewer)',
    description: 'Read-only access across ledgers and compliance audit logs. All mutation actions are disabled.',
    badgeVariant: 'outline',
  },
};

export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  admin: 'Admin',
  operations_lead: 'Operations Manager',
  analyst: 'Analyst',
  auditor: 'Viewer',
};
