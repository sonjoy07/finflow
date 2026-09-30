# FinFlow: Architecture Document

## 1. Overview & Architectural Philosophy

FinFlow is designed as a modular, resilient, and accessible enterprise fintech operations platform built on the **Next.js App Router** framework. The architectural decisions prioritize:

1. **Predictable Data Flow & State Ownership**: Strict separation between server state, client UI state, URL search parameters, and form state.
2. **Performance by Default**: Leveraging React Server Components (RSC) for initial page layouts and streaming data fetching, minimizing client bundle footprint.
3. **Feature-First Modularity**: Co-locating feature code (components, hooks, API callers, schemas, and tests) to promote high cohesion and low coupling.
4. **End-to-End Type Safety**: Unbroken type chain from mock database entities, across API route handlers and Zod validation schemas, into UI components.
5. **Defensive Error Handling**: Layered error boundaries, typed API error envelopes, and graceful degradation ensuring the operations UI never crashes entirely.

---

## 2. Next.js App Router Architecture

### 2.1 Route Tree & Layout Hierarchy

FinFlow utilizes Next.js App Router route groups and nested layouts to provide persistent navigation, nested data streaming, and isolated error boundaries:

```
src/app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx            # Login / Role Switcher view
│   └── layout.tsx              # Clean centered auth layout
├── (dashboard)/
│   ├── layout.tsx              # Primary application shell (Sidebar, Topbar, Drawers)
│   ├── page.tsx                # Redirects to /dashboard
│   ├── dashboard/
│   │   ├── loading.tsx         # Suspense skeleton for analytics cards & charts
│   │   ├── error.tsx           # Dashboard-scoped error boundary
│   │   └── page.tsx            # Executive Dashboard view
│   ├── transactions/
│   │   ├── page.tsx            # Transaction Explorer with data table
│   │   └── [id]/
│   │       └── page.tsx        # Deep-linkable transaction detail view
│   ├── reconciliation/
│   │   └── page.tsx            # Bank vs Ledger reconciliation view
│   ├── workflows/
│   │   ├── page.tsx            # Workflow list and builder
│   │   └── executions/
│   │       └── page.tsx        # Workflow execution audit history
│   ├── activity/
│   │   └── page.tsx            # Operational activity & audit log
│   └── settings/
│       └── page.tsx            # Operator profile, role, and mock configuration
├── api/                        # Next.js Route Handlers (Mock Backend REST API)
│   ├── dashboard/route.ts
│   ├── transactions/route.ts
│   ├── transactions/[id]/route.ts
│   ├── transactions/[id]/retry/route.ts
│   ├── reconciliation/route.ts
│   ├── workflows/route.ts
│   ├── workflows/[id]/route.ts
│   ├── workflows/[id]/executions/route.ts
│   └── notifications/route.ts
├── layout.tsx                  # Root layout: fonts, providers (QueryClient, Theme)
├── not-found.tsx               # 404 handler
└── globals.css                 # Tailwind directives, CSS custom properties
```

---

## 3. Server Component vs. Client Component Boundaries

To maximize performance and minimize JavaScript delivered to the client, FinFlow follows a strict **RSC-first** paradigm:

### 3.1 Responsibilities Matrix

| Capability | React Server Component (RSC) | Client Component (RCC / `'use client'`) |
| :--- | :---: | :---: |
| Static layout & navigation frame | ✅ Primary | ❌ |
| Initial data prefetching & streaming | ✅ Primary | ❌ |
| Access to Node.js / server-only modules | ✅ Primary | ❌ |
| Interactive UI (modals, drawers, tooltips) | ❌ | ✅ Primary |
| Filter inputs, search debouncing, URL sync | ❌ | ✅ Primary |
| High-density data grid (sorting, pagination) | ❌ | ✅ Primary (TanStack Table) |
| SVG Chart rendering and interactions | ❌ | ✅ Primary (Recharts) |
| Form state & validation | ❌ | ✅ Primary (React Hook Form) |
| Browser events (keyboard listeners, clipboard) | ❌ | ✅ Primary |

### 3.2 Leaf Component Architecture

Server components serve as data fetchers and orchestrators. Client components are pushed as far down the component tree as possible ("leaf components"):

```tsx
// src/app/(dashboard)/transactions/page.tsx (Server Component)
import { Suspense } from 'react';
import { TransactionTableSkeleton } from '@/features/transactions/components/transaction-table-skeleton';
import { TransactionExplorerClient } from '@/features/transactions/components/transaction-explorer-client';

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Transaction Operations</h1>
        <p className="text-sm text-muted-foreground">Monitor, filter, and remediate payment exceptions in real time.</p>
      </header>

      {/* Client Boundary with Suspense Fallback */}
      <Suspense fallback={<TransactionTableSkeleton />}>
        <TransactionExplorerClient />
      </Suspense>
    </div>
  );
}
```

---

## 4. Feature-Based Directory Structure

FinFlow structures its domain code inside `src/features/` to maintain clean separation of concerns:

```
src/
├── app/                        # App Router routing, layouts, and route handlers
├── components/                 # Shared UI primitives and application chrome
│   ├── ui/                     # Design system atoms (Button, Input, Badge, Table, Modal)
│   ├── feedback/               # ErrorBoundary, EmptyState, SkeletonLoader
│   └── layout/                 # Sidebar, Topbar, UserMenu, NotificationBell
├── features/                   # Domain features
│   ├── dashboard/
│   │   ├── components/         # MetricCard, VolumeChart, StatusDistributionChart
│   │   ├── hooks/              # useDashboardMetrics
│   │   ├── api/                # dashboard-api.ts
│   │   ├── types/              # dashboard.types.ts
│   │   └── __tests__/          # Feature unit & component tests
│   ├── transactions/
│   │   ├── components/         # TransactionTable, TransactionDrawer, RetryModal
│   │   ├── hooks/              # useTransactions, useTransactionDetail, useRetryTransaction
│   │   ├── api/                # transactions-api.ts
│   │   ├── types/              # transaction.types.ts
│   │   └── __tests__/
│   ├── reconciliation/
│   │   ├── components/         # ReconciliationTable, DiscrepancyDiffViewer
│   │   ├── hooks/              # useReconciliationRecords
│   │   ├── api/                # reconciliation-api.ts
│   │   └── types/              # reconciliation.types.ts
│   ├── workflows/
│   │   ├── components/         # WorkflowList, WorkflowBuilderModal, ExecutionHistoryTable
│   │   ├── hooks/              # useWorkflows, useCreateWorkflow, useWorkflowExecutions
│   │   ├── api/                # workflows-api.ts
│   │   └── types/              # workflow.types.ts
│   ├── notifications/
│   │   ├── components/         # NotificationDrawer, NotificationItem
│   │   ├── hooks/              # useNotifications
│   │   ├── api/                # notifications-api.ts
│   │   └── types/              # notification.types.ts
│   └── auth/
│       ├── components/         # RoleSwitcher, UserProfileCard
│       ├── hooks/              # useAuth, usePermission
│       └── types/              # auth.types.ts
├── hooks/                      # Shared global React hooks (useDebounce, useMediaQuery)
├── lib/                        # Cross-cutting utilities & clients
│   ├── api-client.ts           # Unified typed fetch wrapper with error handling
│   ├── formatters.ts           # Currency, date-time, and percentage formatting
│   ├── constants.ts            # Application constants, roles, and limits
│   └── env.ts                  # Zod-validated environment configuration
├── stores/                     # Zustand stores (UI-only state)
│   ├── ui-store.ts             # Sidebar toggle, drawer visibility, active modal
│   └── toast-store.ts          # Toast notifications queue
└── types/                      # Cross-cutting TypeScript definitions
```

---

## 5. Shared Component Architecture

Shared components reside in `src/components/ui/` and adhere to these guidelines:

1. **Headless & Accessible Foundation**: Modeled after Radix UI / shadcn/ui patterns, ensuring zero styling lock-in while preserving accessibility primitives (focus management, ARIA roles, keyboard interactions).
2. **Compound Component Pattern**: Complex widgets (Dialog, Dropdown, Table) expose compound subcomponents (e.g., `<Dialog.Root>`, `<Dialog.Trigger>`, `<Dialog.Content>`) for clear composition.
3. **Class Variance Authority (CVA)**: Visual variants (e.g., button intent, size, badge status) are declared deterministically using `cva` and merged with `clsx` / `tailwind-merge` (`cn` utility).
4. **No Business Logic**: Primitives accept pure props and event handlers. They must not consume feature stores or invoke API hooks directly.

---

## 6. API Client Architecture

All network communication flows through a centralized, typed client wrapper located at `src/lib/api-client.ts`.

### 6.1 Design Principles
- **Predictable Envelope**: Enforces standardized JSON envelopes for responses (`{ success: true, data: T }`) and errors (`{ success: false, error: ApiErrorResponse }`).
- **Typed Error Classes**: Distinguishes between network failures (`NetworkError`), validation errors (`ValidationError`), and authorization failures (`ForbiddenError`).
- **Request Cancellation**: Accepts an `AbortSignal` for cancellation upon unmount or rapid input typing.
- **Idempotency Support**: Enables passing `X-Idempotency-Key` headers on mutations (such as transaction retries).

```typescript
// Conceptual API Client Structure
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorBody.code || 'UNKNOWN_ERROR',
      errorBody.message || 'An unexpected error occurred',
      errorBody.details
    );
  }

  const payload: ApiResponse<T> = await response.json();
  return payload.data;
}
```

---

## 7. Data-Access Layer & Mock Backend

Because FinFlow is a portfolio demonstration platform with no live banking clearinghouse connections, the data-access layer simulates a production backend:

1. **In-Memory Seeded Repository**: `src/lib/mock-data/` houses deterministic seed generators (using seed randomizers) providing 500+ realistic transactions, 50+ reconciliation records, and 10+ automation workflows.
2. **Route Handlers**: Next.js App Router route handlers (`src/app/api/.../route.ts`) act as the REST API endpoints. They parse query parameters, validate request bodies via Zod, apply artificial latency (100–300ms) to simulate real-world networking, and return standardized responses.
3. **Mutation Persistence**: Mutations (retrying a transaction, updating a workflow, marking reconciliation resolved) mutate the in-memory data store for the lifetime of the session, enabling realistic feedback loops.

---

## 8. Error-Handling Strategy

FinFlow enforces a three-tier error handling strategy:

```
+------------------------------------------------------------+
| Tier 1: Application-Level Error Boundary (app/error.tsx)   |
| Catch-all for uncaught client-side rendering crashes       |
+------------------------------+-----------------------------+
                               |
+------------------------------v-----------------------------+
| Tier 2: Feature-Level Error Boundaries & Suspense          |
| Catches localized component failures; rest of page lives   |
+------------------------------+-----------------------------+
                               |
+------------------------------v-----------------------------+
| Tier 3: Query & Mutation Error Handling                    |
| Inline error alerts, retry buttons, and toast notifications|
+------------------------------------------------------------+
```

1. **Root & Segment Error Boundaries**: `app/error.tsx` and nested `(dashboard)/.../error.tsx` present user-friendly error screens with "Try Again" triggers and error reporting hooks.
2. **TanStack Query Error Callbacks**: Query errors render inline `<ErrorState message="..." onRetry={refetch} />` within the affected card or table without unmounting the navigation frame.
3. **Mutation Feedback**: Failed mutations trigger toast notifications detailing the specific rejection reason (e.g., *"Cannot retry: Transaction has exceeded maximum retry limit of 3"*).

---

## 9. Authentication & Authorization Architecture

### 9.1 Session Simulation
Authentication uses a signed, secure cookie storing the active session token:
- User identity (`id`, `name`, `email`, `role`, `avatarUrl`).
- Session expiration timestamp.
- Verified in Next.js `middleware.ts` before allowing access to `(dashboard)` routes.

### 9.2 Role-Based Access Control (RBAC) Matrix
Permissions are verified declaratively in UI components via a custom hook (`usePermission`) and defensively in API route handlers:

```typescript
export type UserRole = 'admin' | 'operations_lead' | 'analyst' | 'auditor';

export const PERMISSIONS = {
  TRANSACTION_RETRY: ['admin', 'operations_lead'] as UserRole[],
  WORKFLOW_EDIT: ['admin', 'operations_lead'] as UserRole[],
  RECONCILIATION_RESOLVE: ['admin', 'operations_lead', 'analyst'] as UserRole[],
  VIEW_AUDIT_LOGS: ['admin', 'auditor'] as UserRole[],
} as const;
```

---

## 10. Dependency Boundaries & Anti-Corruption Rules

To maintain codebase health and prevent architectural erosion, the following import boundaries are strictly enforced:

1. **UI Primitives (`src/components/ui/`)** may **NOT** import from `src/features/` or `src/stores/`.
2. **Feature Components (`src/features/*/components/`)** may import from their own feature directory, `src/components/ui/`, `src/lib/`, and shared stores, but may **NOT** import internal components from other features directly. Cross-feature integration must happen through top-level page composition or shared hooks.
3. **Zustand Stores (`src/stores/`)** may **NOT** import TanStack Query client instances or store cached server data.
4. **Domain Types (`src/types/` & `src/features/*/types/`)** must contain pure TypeScript interfaces and types, with zero dependencies on React or DOM APIs.

---

## 11. Recommended Rendering & Caching Strategies

| Route / Asset | Strategy | Rationale |
| :--- | :--- | :--- |
| **Root Layout & Shell** | Static RSC | Header, sidebar frame, and base layout are static and cached indefinitely. |
| **Dashboard Metrics** | Dynamic RSC + TanStack Query | Initial snapshot can stream via Suspense; client TanStack Query polls every 60s for live updates. |
| **Transaction Explorer** | Client-Rendered with URL Sync | Highly dynamic tabular data requiring client-side sorting, filtering, selection, and pagination. |
| **Workflow Builder** | Client Component | High-interactivity stateful modal with complex nested conditions. |
| **Static Assets & Icons** | Static / Bundled SVG | SVGs bundled as inline icons or optimized via Next.js asset pipeline. |
| **API Responses** | `Cache-Control: no-store` | Financial transaction data must never be stale or served from shared intermediary caches. |

---

## 12. Complete Folder Tree Specification

```
finflow/
├── .github/
│   └── workflows/
│       ├── ci.yml                     # Lint, typecheck, test, e2e, build
│       └── bundle-audit.yml           # Bundle size analysis
├── docs/                              # Project documentation suite
│   ├── PROJECT_SPEC.md
│   ├── ARCHITECTURE.md
│   ├── TECH_STACK.md
│   ├── STATE_MANAGEMENT.md
│   ├── API_CONTRACTS.md
│   ├── DATA_MODELS.md
│   ├── DESIGN_SYSTEM.md
│   ├── FEATURES.md
│   ├── TESTING_STRATEGY.md
│   ├── PERFORMANCE.md
│   ├── ACCESSIBILITY.md
│   ├── SECURITY.md
│   ├── DEVELOPMENT_GUIDELINES.md
│   ├── IMPLEMENTATION_PLAN.md
│   ├── PROGRESS.md
│   └── AI_WORKFLOW.md
├── public/                            # Static favicon, logos, mock avatar assets
├── src/
│   ├── app/                           # App Router routes and layouts
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   ├── api/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── feedback/
│   │   ├── layout/
│   │   └── ui/
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── notifications/
│   │   ├── reconciliation/
│   │   ├── transactions/
│   │   └── workflows/
│   ├── hooks/
│   ├── lib/
│   │   ├── api-client.ts
│   │   ├── constants.ts
│   │   ├── env.ts
│   │   ├── formatters.ts
│   │   ├── mock-data/
│   │   └── utils.ts
│   ├── stores/
│   └── types/
├── tests/
│   ├── e2e/                           # Playwright E2E test specs
│   │   ├── auth.spec.ts
│   │   ├── dashboard.spec.ts
│   │   ├── transactions.spec.ts
│   │   └── workflows.spec.ts
│   ├── fixtures/                      # Deterministic test fixtures & seeds
│   └── setup/                         # Vitest setup & DOM extensions
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── next.config.mjs
├── package.json
├── playwright.config.ts
├── postcss.config.mjs
├── README.md
├── tailwind.config.ts
├── tsconfig.json
└── vitest.config.ts
```
