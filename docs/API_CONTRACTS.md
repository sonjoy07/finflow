# FinFlow: API Contracts Specification

> **Status**: Planned Specification.
> These REST contracts represent the planned architectural specification for the FinFlow mock backend. They must be validated against real data models and route handler implementations during development.

---

## 1. Global Conventions & Standards

### 1.1 Base URL & Content Type
- Base path: `/api`
- Content-Type: `application/json; charset=utf-8`

### 1.2 Standard Success Envelope
All successful responses return HTTP `200 OK` (or `201 Created`) wrapped in a standard JSON envelope:

```typescript
export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    pageSize?: number;
    totalItems?: number;
    totalPages?: number;
  };
  timestamp: string; // ISO 8601 UTC
}
```

### 1.3 Standard Error Envelope
All error responses return standard HTTP error codes (`400`, `401`, `403`, `404`, `409`, `422`, `500`):

```typescript
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;       // Machine-readable code (e.g. "INVALID_IDEMPOTENCY_KEY")
    message: string;    // Human-readable message
    details?: Array<{
      field: string;
      issue: string;
    }>;
  };
  timestamp: string;
}
```

---

## 2. Endpoints Specification

### 2.1 GET `/api/dashboard`
- **Purpose**: Retrieves high-level operational KPI metrics and chart series for the Executive Dashboard.
- **Query Parameters**:
  - `timeRange` (string, optional, default: `"7d"`): Allowed: `"24h" | "7d" | "30d" | "90d"`.
- **Authorization**: Roles `admin`, `operations_lead`, `analyst`, `auditor`.
- **Request Body**: None.
- **Response Schema (`200 OK`)**:

```typescript
export interface DashboardMetricsResponse {
  summary: {
    totalVolumeCents: number;
    volumeDeltaPercent: number;
    authorizationRate: number;
    authorizationRateDeltaPercent: number;
    failedTransactionsCount: number;
    failedDeltaPercent: number;
    unreconciledDiscrepancyCents: number;
    discrepancyDeltaPercent: number;
  };
  volumeOverTime: Array<{
    date: string; // ISO 8601
    settledCents: number;
    failedCents: number;
    refundedCents: number;
  }>;
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  volumeByPaymentMethod: Array<{
    method: string;
    volumeCents: number;
    count: number;
  }>;
}
```

- **JSON Example**:
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalVolumeCents": 124508000,
      "volumeDeltaPercent": 8.4,
      "authorizationRate": 96.82,
      "authorizationRateDeltaPercent": 1.2,
      "failedTransactionsCount": 142,
      "failedDeltaPercent": -4.5,
      "unreconciledDiscrepancyCents": 184500,
      "discrepancyDeltaPercent": -12.1
    },
    "volumeOverTime": [
      { "date": "2026-10-26", "settledCents": 18200000, "failedCents": 540000, "refundedCents": 120000 },
      { "date": "2026-10-27", "settledCents": 19400000, "failedCents": 480000, "refundedCents": 80000 }
    ],
    "statusDistribution": [
      { "status": "settled", "count": 8450, "percentage": 94.2 },
      { "status": "failed", "count": 312, "percentage": 3.5 },
      { "status": "refunded", "count": 140, "percentage": 1.5 },
      { "status": "disputed", "count": 72, "percentage": 0.8 }
    ],
    "volumeByPaymentMethod": [
      { "method": "card", "volumeCents": 85000000, "count": 6200 },
      { "method": "bank_transfer", "volumeCents": 32000000, "count": 1800 },
      { "method": "virtual_account", "volumeCents": 7508000, "count": 974 }
    ]
  },
  "timestamp": "2026-11-01T12:00:00Z"
}
```

---

### 2.2 GET `/api/transactions`
- **Purpose**: Returns a paginated, sorted, and filtered list of transactions.
- **Query Parameters**:
  - `page` (integer, optional, default: `1`, min: `1`)
  - `pageSize` (integer, optional, default: `25`, allowed: `10, 25, 50, 100`)
  - `q` (string, optional): Search query matching ID, customer name, or customer email.
  - `status` (string, optional): `"settled" | "pending" | "processing" | "failed" | "refunded" | "disputed"`
  - `paymentMethod` (string, optional): `"card" | "bank_transfer" | "virtual_account" | "ach" | "wire"`
  - `minAmountCents` (integer, optional)
  - `maxAmountCents` (integer, optional)
  - `from` (ISO date string, optional)
  - `to` (ISO date string, optional)
  - `sortBy` (string, optional, default: `"createdAt"`): `"createdAt" | "amountCents" | "status" | "customerName"`
  - `sortOrder` (string, optional, default: `"desc"`): `"asc" | "desc"`
- **Authorization**: Roles `admin`, `operations_lead`, `analyst`, `auditor`.
- **Response Schema (`200 OK`)**:

```typescript
export interface TransactionListItem {
  id: string;
  referenceId: string;
  amountCents: number;
  currency: string;
  status: 'settled' | 'pending' | 'processing' | 'failed' | 'refunded' | 'disputed';
  paymentMethod: 'card' | 'bank_transfer' | 'virtual_account' | 'ach' | 'wire';
  customer: {
    id: string;
    name: string;
    email: string;
    riskScore: number; // 0 - 100
  };
  failureReason?: string | null;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
}
```

- **JSON Example**:
```json
{
  "success": true,
  "data": [
    {
      "id": "txn_01HZ89K2P001",
      "referenceId": "ref_order_99214",
      "amountCents": 24999,
      "currency": "USD",
      "status": "failed",
      "paymentMethod": "card",
      "customer": {
        "id": "cust_8812",
        "name": "Jane Cooper",
        "email": "jane.cooper@example.com",
        "riskScore": 18
      },
      "failureReason": "insufficient_funds",
      "retryCount": 1,
      "createdAt": "2026-11-01T10:14:22Z",
      "updatedAt": "2026-11-01T10:15:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "totalItems": 482,
    "totalPages": 20
  },
  "timestamp": "2026-11-01T12:00:00Z"
}
```

---

### 2.3 GET `/api/transactions/:id`
- **Purpose**: Returns the complete detail payload for a specific transaction.
- **Path Parameters**: `id` (string, required): Transaction unique ID.
- **Authorization**: Roles `admin`, `operations_lead`, `analyst`, `auditor`.
- **Response Schema (`200 OK`)**:

```typescript
export interface TransactionDetail extends TransactionListItem {
  paymentMethodDetails: {
    brand?: string;
    last4?: string;
    expiry?: string;
    bankName?: string;
    accountLast4?: string;
  };
  gatewayResponse: {
    gateway: string;
    gatewayTransactionId: string;
    rawCode: string;
    rawMessage: string;
    declineCode?: string;
    networkLatencyMs: number;
    rawPayload: Record<string, unknown>;
  };
  timeline: Array<{
    id: string;
    event: string;
    description: string;
    actor: string;
    timestamp: string;
  }>;
}
```

- **Error Responses**:
  - `404 Not Found`: `{ "success": false, "error": { "code": "TRANSACTION_NOT_FOUND", "message": "Transaction txn_xyz not found" } }`

---

### 2.4 POST `/api/transactions/:id/retry`
- **Purpose**: Simulates an idempotent smart retry on an eligible failed transaction.
- **Path Parameters**: `id` (string, required).
- **Headers**: `X-Idempotency-Key` (UUID string, required).
- **Authorization**: Roles `admin`, `operations_lead`. Forbidden for `analyst` and `auditor`.
- **Request Body**:

```typescript
export interface RetryTransactionRequest {
  overrideGateway?: string;
  strategy?: 'immediate' | 'exponential_backoff';
  notes?: string;
}
```

- **Response Schema (`200 OK`)**:

```typescript
export interface RetryTransactionResponse {
  transaction: TransactionDetail;
  executionId: string;
  status: 'processing' | 'succeeded' | 'failed';
  gatewayMessage: string;
}
```

- **Error Responses**:
  - `400 Bad Request`: Missing `X-Idempotency-Key`.
  - `403 Forbidden`: Role does not have `TRANSACTION_RETRY` permission.
  - `409 Conflict`: Transaction is already `settled` or in `processing` state.
  - `422 Unprocessable Entity`: Transaction has exceeded maximum retry limit (3 retries).

---

### 2.5 GET `/api/reconciliation`
- **Purpose**: Retrieves a list of bank settlement reconciliation records with status flags.
- **Query Parameters**:
  - `status` (string, optional): `"all" | "matched" | "mismatched_amount" | "missing_internal" | "missing_external" | "resolved"`
  - `page` (integer, optional, default: `1`)
  - `pageSize` (integer, optional, default: `25`)
- **Authorization**: Roles `admin`, `operations_lead`, `analyst`, `auditor`.
- **Response Schema (`200 OK`)**:

```typescript
export interface ReconciliationRecord {
  id: string;
  batchId: string;
  internalTransactionId?: string | null;
  externalGatewayReference: string;
  gatewayName: string;
  internalAmountCents?: number | null;
  externalAmountCents: number;
  feeDeductedCents: number;
  netSettledCents: number;
  currency: string;
  matchStatus: 'matched' | 'mismatched_amount' | 'missing_internal' | 'missing_external' | 'resolved';
  discrepancyDeltaCents: number;
  settledAt: string;
  resolvedAt?: string | null;
  resolutionNotes?: string | null;
}
```

---

### 2.6 GET `/api/workflows`
- **Purpose**: Lists all automation rules with their status and trigger metrics.
- **Authorization**: Roles `admin`, `operations_lead`, `analyst`, `auditor`.
- **Response Schema (`200 OK`)**:

```typescript
export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused';
  trigger: {
    eventType: 'transaction_failed' | 'reconciliation_mismatch' | 'high_risk_transaction';
  };
  conditions: Array<{
    field: string;
    operator: 'eq' | 'neq' | 'gt' | 'lt' | 'in' | 'contains';
    value: string | number | boolean | string[];
  }>;
  actions: Array<{
    type: 'auto_retry' | 'notify_slack' | 'create_ticket' | 'freeze_account';
    params: Record<string, unknown>;
  }>;
  executionCount: number;
  lastExecutedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
```

---

### 2.7 POST `/api/workflows`
- **Purpose**: Creates a new automation workflow.
- **Authorization**: Roles `admin`, `operations_lead`.
- **Request Body**:

```typescript
export interface CreateWorkflowRequest {
  name: string;
  description: string;
  trigger: {
    eventType: 'transaction_failed' | 'reconciliation_mismatch' | 'high_risk_transaction';
  };
  conditions: Array<{
    field: string;
    operator: 'eq' | 'neq' | 'gt' | 'lt' | 'in' | 'contains';
    value: string | number | boolean | string[];
  }>;
  actions: Array<{
    type: 'auto_retry' | 'notify_slack' | 'create_ticket' | 'freeze_account';
    params: Record<string, unknown>;
  }>;
}
```

- **Response Schema (`201 Created`)**: Returns the created `Workflow` object.
- **Validation**: Schema validated via Zod. Returns `422` with field-level errors if validation fails.

---

### 2.8 PATCH `/api/workflows/:id`
- **Purpose**: Updates an existing workflow definition or toggles its `status` (`active` vs `paused`).
- **Path Parameters**: `id` (string, required).
- **Authorization**: Roles `admin`, `operations_lead`.
- **Request Body**: Partial update object conforming to `CreateWorkflowRequest` plus optional `status`.
- **Response Schema (`200 OK`)**: Returns the updated `Workflow` object.

---

### 2.9 GET `/api/workflows/:id/executions`
- **Purpose**: Retrieves execution audit history for a specific workflow.
- **Path Parameters**: `id` (string, required).
- **Query Parameters**: `page`, `pageSize`.
- **Response Schema (`200 OK`)**:

```typescript
export interface WorkflowExecution {
  id: string;
  workflowId: string;
  triggerEntityId: string;
  triggerEntityType: 'transaction' | 'reconciliation_record';
  status: 'success' | 'failed' | 'skipped';
  durationMs: number;
  stepLogs: Array<{
    stepNumber: number;
    stepName: string;
    status: 'success' | 'failed' | 'skipped';
    outputMessage: string;
  }>;
  executedAt: string;
}
```

---

### 2.10 GET `/api/notifications`
- **Purpose**: Fetches operational notifications and unread alert count.
- **Query Parameters**: `unreadOnly` (boolean, optional, default: `false`).
- **Response Schema (`200 OK`)**:

```typescript
export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  linkUrl?: string;
  createdAt: string;
}
```
