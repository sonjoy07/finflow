# FinFlow: Technology Stack

This document details the complete technology choices for FinFlow. For each technology, we explain the engineering rationale, the architectural role, boundaries, anti-patterns, and key integration considerations.

> **Note on Versioning**: Specific package versions are omitted here to prevent version locking or premature drift. Compatible semantic version ranges will be pinned in `package.json` during project initialization.

---

## 1. Next.js (App Router)

- **Why it is used**: Modern, production-standard React framework offering hybrid rendering, React Server Components (RSC), nested layouts, streaming SSR via Suspense, and built-in API route handlers.
- **Problem it solves**: Eliminates the dichotomy between single-page app (SPA) client bloat and multi-page application (MPA) full-reload latency. Enables zero-bundle-cost layout rendering while keeping high interactivity on leaf components.
- **Where it belongs**: Core application framework, routing layer (`src/app/`), nested layouts, and mock REST API backend route handlers (`src/app/api/`).
- **What should NOT be implemented with it**: Long-running background cron workers or stateful WebSocket servers. Next.js route handlers are stateless and request-bound.
- **Integration considerations**:
  - Keep route files lightweight; delegate business logic to feature modules.
  - Push `'use client'` directives to the furthest leaves of the component tree.
  - Utilize `output: 'standalone'` in `next.config.mjs` for optimized Docker image builds.

---

## 2. React

- **Why it is used**: Industry standard declarative UI library offering component reusability, concurrent rendering features, hooks, and first-class accessibility primitives.
- **Problem it solves**: Manages complex UI state transitions, responsive user interfaces, and DOM updates predictably across high-density financial interfaces.
- **Where it belongs**: All UI presentation and view orchestration (`src/components/`, `src/features/*/components/`).
- **What should NOT be implemented with it**: Direct imperative DOM mutations outside of React refs; storing large cached server datasets in ad-hoc React Contexts.
- **Integration considerations**:
  - Use React 18/19 concurrent features (`useTransition`, `useDeferredValue`) when filtering large datasets or managing fast search inputs.
  - Strict compliance with React hooks rules and exhaustive dependency linting.

---

## 3. TypeScript (Strict Mode)

- **Why it is used**: Static typing system providing compile-time defect detection, self-documenting codebases, and rich IDE intellisense.
- **Problem it solves**: Prevents runtime `TypeError: Cannot read property of undefined` defects, eliminates ambiguous API payload structures, and guarantees contract alignment across the application.
- **Where it belongs**: Universal across all source files, configurations, tests, and API contracts.
- **What should NOT be implemented with it**: Overly convoluted type-level programming (excessive conditional types or recursive AST mappers) that degrades developer ergonomics or slows compilation.
- **Integration considerations**:
  - Strict compiler flags: `strict: true`, `noImplicitAny: true`, `strictNullChecks: true`, and `noUncheckedIndexedAccess: true`.
  - Ban the `any` keyword; use `unknown`, generics, or Zod schema inference (`z.infer<typeof Schema>`).

---

## 4. Tailwind CSS

- **Why it is used**: Utility-first CSS framework with deterministic compile-time purge, high developer velocity, and token-based design consistency.
- **Problem it solves**: Eliminates style sheet bloat, CSS specificity wars, dead styles, and naming fatigue associated with traditional CSS modules or BEM.
- **Where it belongs**: Styling and design tokens layer (`tailwind.config.ts`, `globals.css`, component class strings).
- **What should NOT be implemented with it**: Hardcoded arbitrary pixel values (`w-[347px]`); all sizing and spacing must align with the defined design system tokens.
- **Integration considerations**:
  - Use `clsx` and `tailwind-merge` (via a shared `cn()` helper) to safely merge dynamic and conditional classes.
  - Configure CSS variables for theme colors to enable instantaneous light/dark mode switching without page reloads.

---

## 5. Zustand

- **Why it is used**: Minimalist, unopinionated client-side state management library with zero boilerplate, hook-based API, and transient update capabilities.
- **Problem it solves**: Eliminates "prop-drilling" and React Context re-render cascades for client-only UI states.
- **Where it belongs**: Client UI state only (`src/stores/`): sidebar collapsed/expanded, notification drawer visibility, active modal states, and temporary UI preferences.
- **What should NOT be implemented with it**: Caching server responses, transactions lists, or API mutations. Server state belongs exclusively in TanStack Query.
- **Integration considerations**:
  - Use atomic selectors (e.g., `useUIStore((state) => state.isSidebarOpen)`) to prevent unnecessary component re-renders.
  - Keep stores small, modular, and focused on specific UI domains.

---

## 6. TanStack Query (React Query)

- **Why it is used**: Industry-standard asynchronous state and server-cache management library.
- **Problem it solves**: Eliminates manual `useEffect` data fetching, loading/error flags, race conditions, request deduplication, stale data handling, and manual cache invalidation.
- **Where it belongs**: All data-fetching, caching, synchronization, and mutation workflows (`src/features/*/hooks/`).
- **What should NOT be implemented with it**: Storing ephemeral client UI state (like an open/close toggle for an accordion).
- **Integration considerations**:
  - Establish a strict hierarchical query key factory pattern (e.g., `transactionKeys.all`, `transactionKeys.list(filters)`).
  - Configure predictable `staleTime` (e.g., 30s) and `gcTime` (e.g., 5m) to minimize redundant network traffic.
  - Support request cancellation by passing the `signal` from `queryFn` to `apiClient`.

---

## 7. TanStack Table (React Table)

- **Why it is used**: Headless table utility providing robust sorting, filtering, row selection, pagination, and column visibility without enforcing rigid DOM structures.
- **Problem it solves**: Building accessible, high-density, performant financial data grids while retaining 100% control over semantic HTML markup and Tailwind styling.
- **Where it belongs**: Transaction Explorer, Reconciliation Table, and Workflow Execution History views.
- **What should NOT be implemented with it**: Simple static key-value lists or trivial 2-column cards where native HTML tables or definition lists (`<dl>`) suffice.
- **Integration considerations**:
  - Connect table pagination and sorting handlers to URL search parameters for linkable, bookmarkable grid states.
  - Ensure all table headers emit proper `aria-sort` attributes.

---

## 8. React Hook Form

- **Why it is used**: High-performance, uncontrolled form state management library with minimal re-renders and straightforward validation integration.
- **Problem it solves**: Prevents UI stutter and input lag on complex forms (such as the multi-step Workflow Builder) by avoiding top-level component re-renders on every keystroke.
- **Where it belongs**: All user input forms: Workflow Builder, Filter Modals, and Transaction Retry Parameter dialogs.
- **What should NOT be implemented with it**: Global application state or single standalone search inputs where a simple controlled input with debouncing is simpler.
- **Integration considerations**:
  - Pair exclusively with `@hookform/resolvers/zod` for declarative, schema-driven validation.
  - Wire up field error states directly to ARIA `aria-invalid` and `aria-describedby` attributes.

---

## 9. Zod

- **Why it is used**: TypeScript-first schema declaration and runtime validation library with static type inference.
- **Problem it solves**: Guarantees that untrusted runtime data (incoming API payloads, URL search parameters, user form inputs) matches expected TypeScript contracts.
- **Where it belongs**: Domain entity schemas (`src/features/*/types/`), API request/response validation, form schemas, and environment variable parsing (`src/lib/env.ts`).
- **What should NOT be implemented with it**: Complex database ORM relations; Zod is a runtime validator, not a persistent data store.
- **Integration considerations**:
  - Derive TypeScript interfaces directly from Zod schemas using `z.infer<typeof Schema>` to maintain a single source of truth.
  - Provide human-readable, actionable error messages in all schema constraints.

---

## 10. Recharts

- **Why it is used**: Composable, declarative charting library built specifically for React on top of SVG primitives.
- **Problem it solves**: Renders high-quality financial time-series charts, volume breakdowns, and categorical distributions with smooth animations and responsive containers.
- **Where it belongs**: Executive Analytics Dashboard and transaction metrics summaries.
- **What should NOT be implemented with it**: Real-time canvas-based sub-millisecond trading charts (order books); Recharts is designed for operational and analytics dashboards.
- **Integration considerations**:
  - Dynamically import (`next/dynamic` with `ssr: false`) chart components to prevent SSR hydration mismatches and reduce initial bundle size.
  - Ensure all SVG chart regions have accessible titles, ARIA descriptions, and tabular data fallbacks for screen readers.

---

## 11. Vitest

- **Why it is used**: Next-generation, Vite-powered unit test runner with instant hot-module-replacement, native TypeScript support, and full Jest compatibility.
- **Problem it solves**: Dramatically reduces test execution latency compared to legacy test runners while sharing configuration logic.
- **Where it belongs**: Unit tests for pure business logic, formatters, Zod schemas, workflow rule evaluation, and custom hooks.
- **What should NOT be implemented with it**: Multi-page end-to-end browser workflows (delegated to Playwright).
- **Integration considerations**:
  - Configure `happy-dom` or `jsdom` for browser API simulation.
  - Enforce code coverage thresholds on core business utilities and formatters.

---

## 12. React Testing Library (RTL)

- **Why it is used**: DOM-testing utility that encourages testing software from the perspective of real users rather than inspecting internal implementation details.
- **Problem it solves**: Prevents brittle tests that break upon refactoring; verifies that UI components behave correctly and remain accessible.
- **Where it belongs**: Component and integration tests (`src/components/__tests__/`, `src/features/*/__tests__/`).
- **What should NOT be implemented with it**: Testing raw state variables or internal component method invocations.
- **Integration considerations**:
  - Query elements primarily by accessibility roles (`getByRole`, `findByRole`) and accessible names rather than class names or test IDs.
  - Wrap components in test providers (QueryClientProvider, ThemeProvider) using a custom `renderWithProviders` helper.

---

## 13. Playwright

- **Why it is used**: Cross-browser, resilient end-to-end automation framework with auto-waiting, trace viewers, and parallel test execution.
- **Problem it solves**: Validates that all integrated layers (Next.js routing, client state, forms, mock APIs, and browser DOM) work together seamlessly across Chromium, Firefox, and WebKit.
- **Where it belongs**: End-to-end tests directory (`tests/e2e/`).
- **What should NOT be implemented with it**: Testing granular edge cases of mathematical formatters (which belong in Vitest unit tests).
- **Integration considerations**:
  - Run Playwright against a production build or local preview server.
  - Integrate `@axe-core/playwright` to execute automated accessibility scans on critical views.

---

## 14. Docker

- **Why it is used**: Industry standard OS-level containerization platform enabling deterministic builds and reproducible runtime environments.
- **Problem it solves**: Eliminates "it works on my machine" inconsistencies across development, CI, and production deployments.
- **Where it belongs**: Root container configuration (`Dockerfile`, `docker-compose.yml`, `.dockerignore`).
- **What should NOT be implemented with it**: Development live-reload watch loops that introduce virtualization overhead on local developer machines unless specifically required.
- **Integration considerations**:
  - Use multi-stage builds (`deps`, `builder`, `runner`) to keep the production image under 150 MB.
  - Run the container process under an unprivileged user (`nextjs:nodejs`) for security hardening.

---

## 15. GitHub Actions

- **Why it is used**: Native GitHub continuous integration and deployment automation pipeline.
- **Problem it solves**: Enforces automated quality gates on every pull request (typechecking, linting, unit testing, E2E testing, bundle auditing) prior to merging.
- **Where it belongs**: CI workflow definitions (`.github/workflows/ci.yml`).
- **What should NOT be implemented with it**: Manual, non-reproducible deployment steps.
- **Integration considerations**:
  - Leverage caching actions (`actions/cache`, `actions/setup-node`) for node_modules to maintain CI pipeline speeds under 3 minutes.
  - Separate fast checks (lint, typecheck, unit tests) from slower jobs (Playwright E2E).

---

## 16. Lighthouse and Web Vitals

- **Why it is used**: Standardized measurement tools for monitoring web performance, accessibility, SEO, and user experience metrics.
- **Problem it solves**: Detects performance regressions, excessive layout shifts, slow paint times, and accessibility degradation before releasing to production.
- **Where it belongs**: Integrated into development performance monitoring (`useReportWebVitals`) and CI audits.
- **What should NOT be implemented with it**: Serving as a substitute for real-user monitoring (RUM) in high-traffic production environments.
- **Integration considerations**:
  - Establish strict budgets: Performance >= 90, Accessibility >= 95, Best Practices >= 95 on desktop audits.
  - Target Core Web Vitals thresholds: LCP <= 2.5s, INP <= 200ms, CLS <= 0.1.
