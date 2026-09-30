# FinFlow: Domain Data Models

> **Notice**: All entities, customer identities, payment data, bank accounts, and settlement records defined herein are strictly **synthetic representations** designed for operations simulation and testing.

---

## 1. Currency Handling Standards

FinFlow strictly enforces integer-based currency representations to eliminate JavaScript IEEE 754 floating-point rounding inaccuracies (e.g. `0.1 + 0.2 === 0.30000000000000004`):

1. **Minor Currency Units (Cents)**: All monetary fields are suffixed with `Cents` (e.g. `amountCents`, `feeDeductedCents`) and stored as signed 64-bit safe integers (representing cents: `$10.50` is stored as `1050`).
2. **ISO 4217 Currency Codes**: All monetary quantities carry an accompanying 3-letter currency code (e.g. `"USD"`, `"EUR"`, `"GBP"`).
3. **Formatters**: Presentation formatting is performed exclusively at render time via `formatCurrency(cents, currency)` in `src/lib/formatters.ts`.

---

## 2. Core Entities & TypeScript Definitions

### 2.1 Enums & Shared Types

```typescript
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD';

export type PaymentMethodType =
  | 'card'
  | 'bank_transfer'
  | 'virtual_account'
  | 'ach'
  | 'sepa'
  | 'wire';

export type TransactionStatus =
  | 'settled'
  | 'pending'
  | 'processing'
  | 'failed'
  | 'refunded'
  | 'disputed'
  | 'cancelled';

export type ReconciliationMatchStatus =
  | 'matched'
  | 'mismatched_amount'
  | 'missing_internal'
  | 'missing_external'
  | 'resolved';

export type WorkflowTriggerEventType =
  | 'transaction_failed'
  | 'reconciliation_mismatch'
  | 'high_risk_transaction';

export type WorkflowActionType =
  | 'auto_retry'
  | 'notify_slack'
  | 'create_ticket'
  | 'freeze_account';

export type UserRole = 'admin' | 'operations_lead' | 'analyst' | 'auditor';
```

---

### 2.2 Customer

Represents the end-consumer or business entity initiating transactions.

```typescript
export interface Customer {
  id: string;               // e.g. "cust_99214"
  name: string;             // e.g. "Sarah Connor"
  email: string;            // e.g. "s.connor@cyberdyne.example"
  phone?: string | null;
  riskScore: number;        // Range 0 - 100 (High score indicates higher risk)
  tier: 'standard' | 'premium' | 'enterprise';
  countryCode: string;      // ISO 3166-1 alpha-2 (e.g. "US", "DE")
  createdAt: string;        // ISO 8601 UTC
  updatedAt: string;        // ISO 8601 UTC
}
```

---

### 2.3 Transaction & Transaction Events

Represents a monetary payment lifecycle event.

```typescript
export interface TransactionEvent {
  id: string;
  transactionId: string;
  event:
    | 'created'
    | 'authorized'
    | 'capture_failed'
    | 'retry_scheduled'
    | 'retry_success'
    | 'retry_failed'
    | 'disputed'
    | 'refunded';
  description: string;
  actor: string;             // System or user identifier
  timestamp: string;         // ISO 8601 UTC
  metadata?: Record<string, unknown>;
}

export interface Transaction {
  id: string;                // e.g. "txn_01HZ89K2P001"
  referenceId: string;       // Order reference e.g. "ord_20261101_892"
  customerId: string;        // FK to Customer
  customer?: Customer;       // Populated relation
  amountCents: number;       // Integer cents (e.g. 14900 = $149.00)
  currency: CurrencyCode;
  status: TransactionStatus;
  paymentMethod: PaymentMethodType;
  paymentMethodDetails: {
    brand?: string;          // e.g. "Visa", "Mastercard"
    last4?: string;          // e.g. "4242"
    bankName?: string;       // e.g. "JPMorgan Chase"
    accountLast4?: string;
  };
  failureReason?: string | null;  // e.g. "insufficient_funds", "do_not_honor"
  retryCount: number;        // Max retry attempts: 3
  maxRetriesAllowed: number; // default: 3
  idempotencyKey?: string | null;
  ledgerStatus: 'unreconciled' | 'reconciled' | 'discrepancy';
  gatewayResponse?: {
    gateway: string;         // e.g. "StripeSim", "AdyenMock"
    gatewayTransactionId: string;
    rawCode: string;
    rawMessage: string;
    declineCode?: string;
    networkLatencyMs: number;
    rawPayload: Record<string, unknown>;
  };
  events: TransactionEvent[];
  createdAt: string;
  updatedAt: string;
}
```

---

### 2.4 Reconciliation Record

Represents a comparison unit between internal transaction ledgers and external bank/clearinghouse statement lines.

```typescript
export interface ReconciliationRecord {
  id: string;                      // e.g. "rec_88319"
  batchId: string;                 // e.g. "batch_2026_10_31_001"
  internalTransactionId?: string | null; // FK to Transaction.id (nullable if missing_internal)
  externalGatewayReference: string; // Acquiring bank reference
  gatewayName: string;             // e.g. "AcquiringBankAlpha"
  internalAmountCents?: number | null; // Nullable if missing_internal
  externalAmountCents: number;     // Reported gross by gateway
  feeDeductedCents: number;        // Gateway processing fees
  netSettledCents: number;         // externalAmountCents - feeDeductedCents
  currency: CurrencyCode;
  matchStatus: ReconciliationMatchStatus;
  discrepancyDeltaCents: number;   // Math.abs(internalAmount - externalAmount)
  settledAt: string;               // Timestamp of bank settlement
  resolvedAt?: string | null;      // Timestamp of manual/auto resolution
  resolvedByActorId?: string | null;
  resolutionNotes?: string | null;
}
```

---

### 2.5 Workflow Automation Entities

Defines rule-based operational automation specifications.

```typescript
export interface WorkflowCondition {
  field: string;                   // e.g. "amountCents", "failureReason", "customer.riskScore"
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'in' | 'contains';
  value: string | number | boolean | string[];
}

export interface WorkflowAction {
  type: WorkflowActionType;
  params: {
    maxAttempts?: number;
    delaySeconds?: number;
    channel?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    assigneeRole?: UserRole;
  };
}

export interface Workflow {
  id: string;                      // e.g. "wf_auto_retry_timeouts"
  name: string;                    // e.g. "Smart Retry on Network Timeouts"
  description: string;
  status: 'active' | 'paused';
  trigger: {
    eventType: WorkflowTriggerEventType;
  };
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  executionCount: number;
  lastExecutedAt?: string | null;
  createdByActorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowExecutionStepLog {
  stepNumber: number;
  stepName: string;
  status: 'success' | 'failed' | 'skipped';
  outputMessage: string;
  executedAt: string;
}

export interface WorkflowExecution {
  id: string;                      // e.g. "wfe_092384"
  workflowId: string;              // FK to Workflow
  workflowName: string;
  triggerEntityId: string;         // e.g. "txn_01HZ89K2P001"
  triggerEntityType: 'transaction' | 'reconciliation_record';
  status: 'success' | 'failed' | 'skipped';
  durationMs: number;
  stepLogs: WorkflowExecutionStepLog[];
  executedAt: string;
}
```

---

### 2.6 Notifications & Activity Logs

```typescript
export interface Notification {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  linkUrl?: string | null;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action:
    | 'TRANSACTION_RETRY'
    | 'RECONCILIATION_RESOLVE'
    | 'WORKFLOW_CREATE'
    | 'WORKFLOW_UPDATE'
    | 'WORKFLOW_TOGGLE'
    | 'EXPORT_DATA';
  entityType: 'transaction' | 'reconciliation' | 'workflow' | 'export';
  entityId: string;
  metadata?: Record<string, unknown>;
  ipAddress: string;
  timestamp: string;
}
```

---

### 2.7 User & Authentication Roles

```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  department: string;
  lastLoginAt: string;
}
```

---

## 3. Entity Relationship Diagram

```
+----------------+          1:N          +------------------+
|    Customer    +----------------------->   Transaction    |
+----------------+                       +--------+---------+
                                                  | 1:N
                                                  |
                                         +--------v---------+
                                         | TransactionEvent |
                                         +------------------+

+------------------+        0..1:1       +----------------------+
|   Transaction    +---------------------> ReconciliationRecord |
+------------------+                     +----------------------+

+------------------+          1:N        +----------------------+
|    Workflow      +--------------------->  WorkflowExecution   |
+------------------+                     +----------------------+

+------------------+          1:N        +----------------------+
|      User        +--------------------->     ActivityLog      |
+------------------+                     +----------------------+
```
