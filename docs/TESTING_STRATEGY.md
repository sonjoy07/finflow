# FinFlow: Testing Strategy

## 1. Testing Philosophy & Pyramid

FinFlow follows a rigorous testing strategy designed to ensure high financial fidelity, zero unhandled exceptions, and total confidence during rapid refactoring. We adhere to the standard testing pyramid with focused emphasis on business logic correctness and critical end-to-end user journeys:

```
                  / \
                 /   \
                / E2E \          Playwright (Critical User Flows & a11y)
               /-------\
              /  Integ  \        RTL + MSW / Mock Handlers (Connected Features)
             /-----------\
            /  Component  \      RTL + Vitest (UI Primitives & Leaf Components)
           /---------------\
          /   Unit Tests    \    Vitest (Formatters, Schemas, Rule Engines)
         /-------------------\
```

---

## 2. Testing Layers & Responsibilities

### 2.1 Unit Testing (Vitest)
- **Scope**: Pure TypeScript functions with zero DOM or network dependencies.
- **Targets**:
  - Currency conversion and mathematical calculations (`src/lib/formatters.ts`).
  - Date and time formatting across international locales.
  - Zod validation schemas (`TransactionFiltersSchema`, `WorkflowSchema`).
  - Workflow rule evaluation logic (matching triggers and conditions against entities).
- **Execution**: Fast in-memory execution via Vitest (`npm run test`).

### 2.2 Component Testing (React Testing Library + Vitest)
- **Scope**: Isolated UI primitives (`src/components/ui/`) and feature components.
- **Targets**:
  - Button states (loading, disabled, hover, click dispatch).
  - Modal and Drawer focus traps and escape key handling.
  - Form validation error rendering on invalid input blur.
  - Table column header sorting indicators.
- **Guiding Rule**: Query exclusively by accessibility role (`getByRole`, `findByRole`) or label (`getByLabelText`). Do not query by CSS classes or internal React state.

### 2.3 API Route Handler Testing
- **Scope**: Next.js App Router route handlers (`src/app/api/.../route.ts`).
- **Targets**:
  - Query parameter parsing and default pagination fallbacks.
  - Zod validation rejections (returning `422 Unprocessable Entity` with details).
  - Idempotency key handling and conflict prevention.
  - Role-based authorization enforcement (returning `403 Forbidden`).

### 2.4 Integration Testing
- **Scope**: Connected feature containers combining TanStack Query hooks, Zustand stores, and component trees.
- **Targets**:
  - Fetching transaction list -> applying status filter -> verifying cache update and table re-render.
  - Submitting transaction retry -> verifying optimistic UI update -> verifying toast alert dispatch.

### 2.5 End-to-End Testing (Playwright)
- **Scope**: Full-stack browser automation across Chromium, Firefox, and WebKit against a production build.
- **Targets**:
  - Critical Path 1: Login / Persona Switch -> Filter Transactions by "Failed" -> Open Drawer -> Execute Retry -> Verify Activity Log.
  - Critical Path 2: Navigate to Reconciliation -> Filter Mismatched -> Review Diff -> Mark Resolved.
  - Critical Path 3: Create Workflow -> Trigger Rule -> Verify Execution History Log.

### 2.6 Accessibility Testing (axe-core)
- Integrated into both component tests (`vitest-axe`) and Playwright E2E tests (`@axe-core/playwright`).
- Scans rendered DOM trees for WCAG 2.1 AA violations (contrast, missing labels, invalid ARIA roles).

### 2.7 Performance Testing & Lighthouse CI
- Automated Lighthouse audits running against production build.
- Enforces strict budgets for LCP, INP, CLS, and total JavaScript bundle payload.

---

## 3. Deterministic Test Fixtures & Data Seeding

To prevent flaky tests caused by non-deterministic mock data (e.g. `Math.random()`, floating timestamps, or locale shifts), FinFlow utilizes a deterministic seeding strategy:

```typescript
// tests/fixtures/transactions.fixture.ts
export const mockFailedCardTransaction = {
  id: 'txn_test_001',
  referenceId: 'ref_test_001',
  amountCents: 15000,
  currency: 'USD',
  status: 'failed',
  paymentMethod: 'card',
  customer: {
    id: 'cust_test_1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    riskScore: 24,
  },
  failureReason: 'insufficient_funds',
  retryCount: 1,
  maxRetriesAllowed: 3,
  createdAt: '2026-11-01T10:00:00.000Z',
  updatedAt: '2026-11-01T10:05:00.000Z',
};
```

All timestamps in fixtures use fixed ISO 8601 UTC strings. Tests must not call `new Date()` directly without mocking the system clock via `vi.setSystemTime()`.

---

## 4. Test Naming Conventions

FinFlow enforces the **Behavior-Driven Development (BDD)** naming convention:

```typescript
describe('Feature / Component / Utility Name', () => {
  describe('when [context / condition]', () => {
    it('should [expected outcome / behavior]', async () => {
      // Arrange
      // Act
      // Assert
    });
  });
});

// Example:
describe('formatCurrency', () => {
  it('should format cents as USD currency string with tabular decimals', () => {
    expect(formatCurrency(12450, 'USD')).toBe('$124.50');
  });

  it('should handle zero cents accurately', () => {
    expect(formatCurrency(0, 'USD')).toBe('$0.00');
  });
});
```

---

## 5. Mocking Strategy

- **Mock Boundaries**: Mock at the network layer (`fetch` / API client level) using Mock Service Worker (MSW) or standardized route handler responses.
- **Do Not Mock**:
  - Do not mock React Hook Form internals.
  - Do not mock TanStack Table sorting algorithms.
  - Do not mock Zustand stores unless testing a pure isolation scenario.
- **Spies**: Use Vitest spies (`vi.fn()`) exclusively for callback verification (e.g. verifying an `onRetry` prop was invoked with the correct ID).

---

## 6. Coverage Reporting & Quality Gates

Code coverage is generated using Vitest v8 coverage tooling (`npm run test:coverage`):

| Scope | Minimum Branch Coverage | Minimum Function Coverage | Minimum Line Coverage |
| :--- | :---: | :---: | :---: |
| Business Logic & Formatters (`src/lib/`) | 90% | 95% | 95% |
| Zod Schemas & Validators | 90% | 95% | 95% |
| UI Primitives (`src/components/ui/`) | 80% | 85% | 85% |
| Feature Components & Hooks | 80% | 80% | 80% |

CI pipelines fail automatically if pull requests drop coverage below these thresholds.

---

## 7. Critical Test Scenarios & Feature Definition of Done

### 7.1 Dashboard
- **Scenarios**:
  - Renders all 4 KPI cards with positive/negative trend badges.
  - Switching time range triggers query with new time parameter and renders updated series.
- **DoD**: Tested with 0 transactions, 10,000 transactions; zero rendering errors.

### 7.2 Transaction Explorer & Filtering
- **Scenarios**:
  - Typing in search filters results by customer name and updates URL `?q=...`.
  - Column sorting toggles ascending/descending and retains current active filters.
  - Pagination updates page index and disables 'Previous' on page 1.
- **DoD**: Full unit test of URL sync hook, component test of table, and Playwright spec for filter combination.

### 7.3 Transaction Retry Simulation
- **Scenarios**:
  - Clicking "Retry" opens confirmation modal with pre-generated idempotency key.
  - Successful retry updates status badge to `processing` and dispatches success toast.
  - Retry attempt on transaction with `retryCount >= 3` is disabled.
  - Non-authorized role (`analyst`) sees disabled button.
- **DoD**: Integration test verifying mutation, cache invalidation, and role gate.

### 7.4 Reconciliation Mismatch Resolution
- **Scenarios**:
  - Table highlights delta between internal ledger and external bank record.
  - Submitting resolution note updates record status to `resolved` optimistically.
- **DoD**: Form validation test (note min length 10 chars) and optimistic rollback test on simulated error.

### 7.5 Workflow Builder & Execution
- **Scenarios**:
  - Builder form enforces required name, at least one condition, and at least one action.
  - Dynamic addition and deletion of condition rows.
  - Execution history logs list duration and individual step pass/fail messages.
- **DoD**: E2E spec creating a workflow and checking execution log.
