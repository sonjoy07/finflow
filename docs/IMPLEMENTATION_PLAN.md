# FinFlow: Implementation Plan & Sequential Roadmap

This roadmap defines the 15-phase sequential execution plan for developing FinFlow. Each phase establishes explicit prerequisites, scope, affected files, granular implementation tasks, verification commands, and acceptance criteria.

---

## Roadmap Overview

```
Phase 1: Setup & Tooling ─────────────► Phase 2: Design System & Shell
                                                 │
                                                 ▼
Phase 4: Dashboard ◄────────────── Phase 3: Mock API & Data Layer
       │                                         │
       ▼                                         ▼
Phase 5: Transactions ─────────────► Phase 6: State Refinement
       │                                         │
       ▼                                         ▼
Phase 7: Reconciliation ───────────► Phase 8: Workflow Automation
                                                 │
                                                 ▼
Phase 10: Notifications & Logs ◄─── Phase 9: Auth & RBAC
       │
       ▼
Phase 11: Automated Testing ───────► Phase 12: Accessibility Audit
                                                 │
                                                 ▼
Phase 14: Docker & CI ◄──────────── Phase 13: Performance Optimization
       │
       ▼
Phase 15: Final Documentation Review & Audit
```

---

## Phase 1: Repository Setup and Tooling

- **Prerequisites**: Node.js v20+ LTS installed.
- **Dependencies**: None.
- **Scope**: Initialize Next.js App Router project with TypeScript strict mode, Tailwind CSS, ESLint, Prettier, and Vitest testing framework.
- **Files Expected to Change**:
  - `package.json`
  - `tsconfig.json`
  - `tailwind.config.ts`
  - `postcss.config.mjs`
  - `next.config.mjs`
  - `vitest.config.ts`
  - `.eslintrc.json`
  - `.gitignore`
  - `.env.example`
- **Implementation Tasks**:
  1. Initialize Next.js App Router project structure with TypeScript.
  2. Configure strict TypeScript compiler options (`noImplicitAny`, `strictNullChecks`, `noUncheckedIndexedAccess`).
  3. Install and configure Tailwind CSS and utility helpers (`clsx`, `tailwind-merge`).
  4. Install and configure Vitest with React Testing Library and JSDOM environment.
  5. Setup `.env.example` and validation schema in `src/lib/env.ts`.
- **Verification Commands**:
  - `npm run typecheck`
  - `npm run lint`
  - `npm run test`
- **Acceptance Criteria**: All tooling scripts execute cleanly with zero errors.

---

## Phase 2: Design System and Application Shell

- **Prerequisites**: Phase 1.
- **Dependencies**: Phase 1.
- **Scope**: Implement design tokens, dark/light theme switching, core UI primitives, and responsive layout shell (Sidebar, Topbar, Main frame).
- **Files Expected to Change**:
  - `src/app/globals.css`
  - `src/components/ui/button.tsx`
  - `src/components/ui/input.tsx`
  - `src/components/ui/card.tsx`
  - `src/components/ui/badge.tsx`
  - `src/components/ui/dialog.tsx`
  - `src/components/ui/drawer.tsx`
  - `src/components/layout/sidebar.tsx`
  - `src/components/layout/topbar.tsx`
  - `src/app/(dashboard)/layout.tsx`
  - `src/stores/ui-store.ts`
- **Implementation Tasks**:
  1. Define HSL theme color tokens and typography scale in `globals.css`.
  2. Implement atomic UI components using CVA (`Button`, `Input`, `Badge`, `Card`, `Skeleton`).
  3. Implement headless, accessible `Dialog` and `Drawer` primitives with focus management.
  4. Build responsive `Sidebar` with collapse toggle and keyboard-navigable links.
  5. Build `Topbar` with theme toggle and mobile navigation drawer.
- **Verification Commands**:
  - `npm run test -- src/components/ui`
  - `npm run build`
- **Acceptance Criteria**: UI primitives render cleanly in light/dark modes with full keyboard support and zero layout shifts.

---

## Phase 3: Mock API and Data-Access Architecture

- **Prerequisites**: Phase 1 & 2.
- **Dependencies**: Phase 1, Phase 2.
- **Scope**: Implement typed API client, mock data generators (seeded realistic transactions, reconciliation records, workflows), and Next.js route handlers.
- **Files Expected to Change**:
  - `src/lib/api-client.ts`
  - `src/lib/mock-data/seed-transactions.ts`
  - `src/lib/mock-data/seed-reconciliation.ts`
  - `src/lib/mock-data/seed-workflows.ts`
  - `src/app/api/dashboard/route.ts`
  - `src/app/api/transactions/route.ts`
  - `src/app/api/transactions/[id]/route.ts`
  - `src/app/api/transactions/[id]/retry/route.ts`
  - `src/app/api/reconciliation/route.ts`
  - `src/app/api/workflows/route.ts`
  - `src/app/api/notifications/route.ts`
- **Implementation Tasks**:
  1. Build typed `apiClient` wrapper in `src/lib/api-client.ts` with error normalization.
  2. Create deterministic data seeders providing 500+ realistic transaction records.
  3. Implement Next.js App Router route handlers with Zod schema validation.
  4. Add artificial network delay simulation (100–250ms) to model real-world loading dynamics.
- **Verification Commands**:
  - `npm run test -- src/app/api`
  - `curl -s http://localhost:3000/api/transactions | grep success`
- **Acceptance Criteria**: All mock endpoints conform exactly to `docs/API_CONTRACTS.md`.

---

## Phase 4: Dashboard and Analytics

- **Prerequisites**: Phase 3.
- **Dependencies**: Phase 2, Phase 3.
- **Scope**: Build the Executive Dashboard displaying real-time financial KPI cards and Recharts visualizations.
- **Files Expected to Change**:
  - `src/app/(dashboard)/dashboard/page.tsx`
  - `src/app/(dashboard)/dashboard/loading.tsx`
  - `src/app/(dashboard)/dashboard/error.tsx`
  - `src/features/dashboard/components/metric-card.tsx`
  - `src/features/dashboard/components/volume-time-series-chart.tsx`
  - `src/features/dashboard/components/status-distribution-chart.tsx`
  - `src/features/dashboard/hooks/use-dashboard-metrics.ts`
  - `src/features/dashboard/api/dashboard-api.ts`
- **Implementation Tasks**:
  1. Implement `useDashboardMetrics` query hook with `timeRange` parameter.
  2. Build `MetricCard` with status badges and comparative trend deltas.
  3. Build dynamically imported Recharts time-series and donut charts.
  4. Implement skeleton loaders in `loading.tsx` and error boundary in `error.tsx`.
- **Verification Commands**:
  - `npm run test -- src/features/dashboard`
  - `npm run build`
- **Acceptance Criteria**: Dashboard displays 4 KPI metrics and 3 interactive charts with zero hydration errors.

---

## Phase 5: Transaction Management

- **Prerequisites**: Phase 3 & 4.
- **Dependencies**: Phase 2, Phase 3.
- **Scope**: Build the Transaction Explorer data grid, multi-column sorting, filtering toolbar, search, pagination, and CSV export.
- **Files Expected to Change**:
  - `src/app/(dashboard)/transactions/page.tsx`
  - `src/features/transactions/components/transaction-explorer-client.tsx`
  - `src/features/transactions/components/transaction-table.tsx`
  - `src/features/transactions/components/transaction-filter-toolbar.tsx`
  - `src/features/transactions/components/transaction-pagination.tsx`
  - `src/features/transactions/hooks/use-transactions.ts`
- **Implementation Tasks**:
  1. Configure TanStack Table with multi-column sorting, pagination, and row selection.
  2. Implement debounced search input (300ms) and multi-field filter toolbar.
  3. Implement accessible pagination footer with page size selection.
  4. Implement client-side CSV export utility for filtered rows.
- **Verification Commands**:
  - `npm run test -- src/features/transactions`
- **Acceptance Criteria**: Table loads 25 rows per page, sorts headers, and filters seamlessly without full page reload.

---

## Phase 6: State Management Refinement

- **Prerequisites**: Phase 5.
- **Dependencies**: Phase 4, Phase 5.
- **Scope**: Implement deep-linkable URL search parameter synchronization, TanStack Query cache invalidation policies, request cancellation (`AbortSignal`), and transaction detail drawer with retry simulation.
- **Files Expected to Change**:
  - `src/features/transactions/components/transaction-detail-drawer.tsx`
  - `src/features/transactions/components/retry-transaction-modal.tsx`
  - `src/features/transactions/hooks/use-transaction-detail.ts`
  - `src/features/transactions/hooks/use-retry-transaction.ts`
  - `src/hooks/use-url-filters.ts`
  - `src/lib/query-client.ts`
- **Implementation Tasks**:
  1. Build custom `useUrlFilters` hook linking URL search params with TanStack Query.
  2. Implement `TransactionDetailDrawer` with raw JSON gateway payload viewer.
  3. Implement idempotent `useRetryTransaction` mutation with toast feedback and query invalidation.
  4. Wire `AbortController` signal to all query fetch calls.
- **Verification Commands**:
  - `npm run test -- src/hooks/use-url-filters.test.ts`
  - `npm run test -- src/features/transactions/hooks/use-retry-transaction.test.ts`
- **Acceptance Criteria**: Retrying a transaction triggers optimistic UI update, invalidates dashboard metrics, and reflects active filter state in browser URL.

---

## Phase 7: Reconciliation

- **Prerequisites**: Phase 6.
- **Dependencies**: Phase 3, Phase 5.
- **Scope**: Build bank settlement reconciliation view, mismatch detection table, side-by-side diff viewer, and manual resolution workflow.
- **Files Expected to Change**:
  - `src/app/(dashboard)/reconciliation/page.tsx`
  - `src/features/reconciliation/components/reconciliation-table.tsx`
  - `src/features/reconciliation/components/discrepancy-diff-viewer.tsx`
  - `src/features/reconciliation/components/resolve-discrepancy-modal.tsx`
  - `src/features/reconciliation/hooks/use-reconciliation.ts`
  - `src/features/reconciliation/hooks/use-resolve-reconciliation.ts`
- **Implementation Tasks**:
  1. Build reconciliation data table categorizing matched and mismatched settlement records.
  2. Create side-by-side diff viewer highlighting fee and amount deltas.
  3. Implement optimistic resolution modal with audit notes input.
- **Verification Commands**:
  - `npm run test -- src/features/reconciliation`
- **Acceptance Criteria**: Discrepancies clearly show delta amounts and resolve optimistically with rollback on error.

---

## Phase 8: Workflow Automation

- **Prerequisites**: Phase 7.
- **Dependencies**: Phase 3, Phase 6.
- **Scope**: Build rule-based workflow builder (trigger-condition-action), workflow status toggling, and workflow execution history log.
- **Files Expected to Change**:
  - `src/app/(dashboard)/workflows/page.tsx`
  - `src/app/(dashboard)/workflows/executions/page.tsx`
  - `src/features/workflows/components/workflow-list.tsx`
  - `src/features/workflows/components/workflow-builder-modal.tsx`
  - `src/features/workflows/components/execution-history-table.tsx`
  - `src/features/workflows/hooks/use-workflows.ts`
  - `src/features/workflows/hooks/use-create-workflow.ts`
- **Implementation Tasks**:
  1. Implement React Hook Form workflow builder with dynamic condition arrays (`useFieldArray`).
  2. Implement rule evaluation engine in mock backend to trigger automated actions.
  3. Build workflow execution history table with step log inspection drawer.
- **Verification Commands**:
  - `npm run test -- src/features/workflows`
- **Acceptance Criteria**: New automation rule can be created, saved, toggled, and inspected in execution history.

---

## Phase 9: Authentication and Authorization

- **Prerequisites**: Phase 8.
- **Dependencies**: Phase 2, Phase 3.
- **Scope**: Implement mock session cookie authentication, persona/role switcher (`admin`, `ops_lead`, `analyst`, `auditor`), and permission gates on mutations.
- **Files Expected to Change**:
  - `src/middleware.ts`
  - `src/features/auth/components/role-switcher.tsx`
  - `src/features/auth/hooks/use-auth.ts`
  - `src/features/auth/hooks/use-permission.ts`
  - `src/features/auth/lib/session.ts`
  - `src/app/(auth)/login/page.tsx`
- **Implementation Tasks**:
  1. Implement signed session cookie generation and verification.
  2. Create `middleware.ts` to protect routes and validate session cookies.
  3. Add `RoleSwitcher` component in navigation header to instantly simulate personas.
  4. Enforce permission gates disabling buttons for unauthorized roles (e.g. `analyst` cannot retry).
- **Verification Commands**:
  - `npm run test -- src/features/auth`
- **Acceptance Criteria**: Role switcher instantly updates permissions; unauthorized API calls reject with `403 Forbidden`.

---

## Phase 10: Notifications and Activity Logs

- **Prerequisites**: Phase 9.
- **Dependencies**: Phase 3, Phase 8, Phase 9.
- **Scope**: Build slide-over notification drawer, toast notification manager, and centralized activity/audit log view.
- **Files Expected to Change**:
  - `src/app/(dashboard)/activity/page.tsx`
  - `src/features/notifications/components/notification-drawer.tsx`
  - `src/features/notifications/components/notification-item.tsx`
  - `src/components/feedback/toast-container.tsx`
  - `src/stores/toast-store.ts`
  - `src/features/activity/components/activity-log-table.tsx`
- **Implementation Tasks**:
  1. Build `NotificationDrawer` with badge counter in topbar.
  2. Build accessible toast notification system with auto-dismiss.
  3. Build `ActivityLogTable` tracking operator actions with timestamps, entity IDs, and diff metadata.
- **Verification Commands**:
  - `npm run test -- src/features/notifications`
  - `npm run test -- src/features/activity`
- **Acceptance Criteria**: Retrying a transaction appends a record to the activity log and dispatches a toast alert.

---

## Phase 11: Automated Testing

- **Prerequisites**: Phase 1 through 10.
- **Dependencies**: All preceding phases.
- **Scope**: Implement full test coverage across unit tests, component tests, integration tests, and Playwright end-to-end specifications.
- **Files Expected to Change**:
  - `tests/e2e/auth.spec.ts`
  - `tests/e2e/dashboard.spec.ts`
  - `tests/e2e/transactions.spec.ts`
  - `tests/e2e/reconciliation.spec.ts`
  - `tests/e2e/workflows.spec.ts`
  - `playwright.config.ts`
- **Implementation Tasks**:
  1. Author unit tests for all currency formatters and Zod schemas.
  2. Author component tests for UI primitives and feature forms.
  3. Author Playwright specs covering 3 critical user journeys (Triage -> Retry -> Verify).
- **Verification Commands**:
  - `npm run test:coverage`
  - `npm run test:e2e`
- **Acceptance Criteria**: Test coverage exceeds defined thresholds; all Playwright E2E specs pass headlessly.

---

## Phase 12: Accessibility Audit

- **Prerequisites**: Phase 11.
- **Dependencies**: Phase 2, Phase 11.
- **Scope**: Perform comprehensive automated (`axe-core`) and manual keyboard accessibility audits across all screens.
- **Files Expected to Change**:
  - Component files with missing ARIA tags or contrast adjustments.
- **Implementation Tasks**:
  1. Run `vitest-axe` across all component tests.
  2. Run `@axe-core/playwright` accessibility checks in E2E tests.
  3. Verify keyboard tab-order, modal focus traps, and screen-reader announcements.
- **Verification Commands**:
  - `npx playwright test tests/e2e/a11y.spec.ts`
- **Acceptance Criteria**: Zero critical or serious WCAG 2.1 AA violations detected.

---

## Phase 13: Performance Optimization

- **Prerequisites**: Phase 11.
- **Dependencies**: Phase 4, Phase 5.
- **Scope**: Execute bundle analysis, configure dynamic imports, audit Core Web Vitals, and eliminate unnecessary re-renders.
- **Files Expected to Change**:
  - `next.config.mjs`
  - Component dynamic imports and React.memo optimizations.
- **Implementation Tasks**:
  1. Run bundle analyzer to verify initial JS bundle < 150 KB gzipped.
  2. Audit Core Web Vitals (LCP <= 1.8s, INP <= 100ms, CLS <= 0.05).
  3. Ensure skeleton geometries match resolved layouts to maintain CLS = 0.00.
- **Verification Commands**:
  - `ANALYZE=true npm run build`
  - `npm run lighthouse`
- **Acceptance Criteria**: Initial bundle meets budget; Lighthouse Performance score >= 90.

---

## Phase 14: Docker and CI

- **Prerequisites**: Phase 1 through 13.
- **Dependencies**: All preceding phases.
- **Scope**: Configure production-ready multi-stage Dockerfile, Docker Compose file, and GitHub Actions CI workflow.
- **Files Expected to Change**:
  - `Dockerfile`
  - `docker-compose.yml`
  - `.dockerignore`
  - `.github/workflows/ci.yml`
- **Implementation Tasks**:
  1. Write multi-stage Dockerfile (`deps`, `builder`, `runner`) with unprivileged `nextjs` user.
  2. Write `docker-compose.yml` for local container testing.
  3. Write GitHub Actions workflow running lint, typecheck, unit tests, and build on PRs.
- **Verification Commands**:
  - `docker build -t finflow:latest .`
  - `docker run --rm -p 3000:3000 finflow:latest`
- **Acceptance Criteria**: Container builds successfully under 150 MB and boots without error.

---

## Phase 15: Documentation Review and Final Audit

- **Prerequisites**: Phase 14.
- **Dependencies**: All preceding phases.
- **Scope**: Validate end-to-end documentation alignment, verify all relative markdown links, update `docs/PROGRESS.md` with final verification records, and complete handover.
- **Files Expected to Change**:
  - `docs/PROGRESS.md`
  - `README.md`
- **Implementation Tasks**:
  1. Verify every link in documentation suite resolves to an existing file.
  2. Ensure API contracts and data models match implemented route handlers.
  3. Record final verification results in `docs/PROGRESS.md`.
- **Verification Commands**:
  - Markdown link checker script / manual inspection.
- **Acceptance Criteria**: All 15 phases verified; documentation suite completely synchronized with working codebase.
