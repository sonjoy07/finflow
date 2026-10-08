import type { SessionPayload, DemoUser } from '@/features/auth/types/auth.types';
import { DEMO_USERS } from '@/features/auth/types/auth.types';

export const mockAdminSession: SessionPayload = {
  userId: DEMO_USERS.admin.id,
  name: DEMO_USERS.admin.name,
  email: DEMO_USERS.admin.email,
  role: 'admin',
  issuedAt: 1761998400000,
  expiresAt: 1762027200000,
};

export const mockOpsLeadSession: SessionPayload = {
  userId: DEMO_USERS.operations_lead.id,
  name: DEMO_USERS.operations_lead.name,
  email: DEMO_USERS.operations_lead.email,
  role: 'operations_lead',
  issuedAt: 1761998400000,
  expiresAt: 1762027200000,
};

export const mockAnalystSession: SessionPayload = {
  userId: DEMO_USERS.analyst.id,
  name: DEMO_USERS.analyst.name,
  email: DEMO_USERS.analyst.email,
  role: 'analyst',
  issuedAt: 1761998400000,
  expiresAt: 1762027200000,
};

export const mockAuditorSession: SessionPayload = {
  userId: DEMO_USERS.auditor.id,
  name: DEMO_USERS.auditor.name,
  email: DEMO_USERS.auditor.email,
  role: 'auditor',
  issuedAt: 1761998400000,
  expiresAt: 1762027200000,
};
