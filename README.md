# FinFlow - Fintech Operations Automation Platform

FinFlow is an enterprise-grade fintech operations automation platform designed to demonstrate the competencies required of a Senior Frontend Developer / Frontend Architect. It provides payment operations teams with real-time analytics, automated transaction failure triage, reconciliation mismatch detection, customizable rule-based workflow execution, and comprehensive auditability.

> **Disclaimer**: This is a portfolio demonstration system. All transactions, customer profiles, bank settlements, and operational logs are strictly **synthetic data** generated for demonstration and testing purposes. The platform does not connect to live banking networks (ACH, Fedwire, SEPA, SWIFT) or process real cardholder data.

---

## Table of Contents

- [Business Problem](#business-problem)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture Overview](#architecture-overview)
- [Planned Milestones](#planned-milestones)
- [Development Setup](#development-setup)
- [Testing Commands](#testing-commands)
- [Environment Configuration](#environment-configuration)
- [Docker Instructions](#docker-instructions)
- [Deployment Overview](#deployment-overview)
- [Documentation Index](#documentation-index)
- [Limitations & Synthetic Data](#limitations--synthetic-data)

---

## Business Problem

Modern payment operations (PayOps) teams at fintechs and high-volume digital merchants handle millions of daily transactions across fragmented payment gateways, acquiring banks, and ledger systems. When transactions fail or external bank statements deviate from internal accounting records, teams face significant operational friction:

1. **High Triage Latency**: Manual inspection of multi-gateway failure codes slows incident response, causing customer churn and delayed cash recognition.
2. **Reconciliation Exceptions**: Ledger discrepancies between internal order records and gateway settlement batches require tedious manual audits across spreadsheets.
3. **Fragmented Remediation**: Operations engineers lack centralized, rule-based automation to schedule smart retries, route failing payment methods, or trigger escalation alerts.
4. **Compliance & Audit Deficits**: Unstructured operations workflows leave incomplete audit trails, violating financial compliance standards (e.g., SOC 2, SOX).

FinFlow addresses these challenges by consolidating payment observability, automated exception handling, and configurable remediation workflows into a single high-performance, accessible web application.

---

## Key Features

- **Executive Analytics Dashboard**: Real-time KPI metrics (gross transaction volume, authorization rates, failure breakdown, settlement discrepancy total), interactive time-series charts, and volume distribution by payment method.
- **Transaction Explorer**: High-density, sortable, filterable transaction table with multi-criteria search, date ranges, status filters, column visibility controls, and batch CSV export.
- **Failure Diagnosis & Retry Simulation**: Detailed transaction timeline, raw gateway payload inspection, idempotency-key management, and simulated smart-retry execution.
- **Bank & Gateway Reconciliation**: Automated mismatch detection between internal ledgers and acquiring bank settlements, with status categorization and side-by-side discrepancy review.
- **Rule-Based Workflow Builder**: Visual trigger-condition-action workflow configuration allowing operators to automate smart retries, notify incident channels, or flag high-risk transactions.
- **Workflow Execution History**: Step-by-step audit logs of triggered automation runs, execution timing, duration, and error diagnostics.
- **Role-Based Access Control (RBAC)**: Role-tailored access (Admin, Operations Lead, Analyst, Auditor) governing mutations, retry approvals, and workflow editing.
- **Notification & Activity Center**: Slide-out alert drawer and historical audit logs tracking operator actions with timestamps, entity IDs, and actor attribution.

---

## Technology Stack

| Layer | Technology | Primary Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | Server-rendered application shell, streaming SSR, optimized layouts, and mock API route handlers |
| **UI Library** | React | Component-driven UI architecture with React Server Components (RSC) and Client Components |
| **Language** | TypeScript (Strict Mode) | End-to-end type safety, domain data modeling, and compile-time contract enforcement |
| **Styling** | Tailwind CSS | Utility-first design tokens, high-density fintech design system, and dark mode |
| **Server State** | TanStack Query | Asynchronous cache management, deduplication, background polling, and optimistic mutations |
| **Client UI State** | Zustand | Global UI state (sidebar navigation, slide-over drawers, active filter presets, modal dialogs) |
| **URL State** | Next.js Navigation | Bookmarkable, shareable search parameters for filters, sorting, and pagination |
| **Data Tables** | TanStack Table | Headless data grid logic: multi-column sorting, pagination, selection, and column filtering |
| **Forms & Validation** | React Hook Form + Zod | Performance-optimized form state with runtime schema validation and error feedback |
| **Data Visualization** | Recharts | Composable SVG financial charts (volume trends, status distribution, payment rail breakdowns) |
| **Unit & Component Tests** | Vitest + RTL | Lightning-fast test runner for domain utilities, custom hooks, and isolated UI components |
| **End-to-End Tests** | Playwright | Browser automation across critical user journeys (triage, retry, reconciliation, workflows) |
| **Containerization** | Docker | Multi-stage production container build with lightweight Alpine runner |
| **CI / Automation** | GitHub Actions | Automated linting, typechecking, unit testing, E2E validation, and bundle auditing |
| **Quality & Vitals** | Lighthouse & Web Vitals | Continuous Core Web Vitals monitoring (LCP <= 2.5s, INP <= 200ms, CLS <= 0.1) |

---

## Architecture Overview

FinFlow is structured using modern Next.js App Router patterns, strictly separating **Server Components (RSC)** for initial data streaming and static layouts from **Client Components (RCC)** for interactive elements (tables, filters, forms, drawers).

```
                      +-----------------------------+
                      |   Next.js App Router Shell  |
                      |  (Layouts, Server Nav, RSC) |
                      +--------------+--------------+
                                     |
              +----------------------+----------------------+
              |                                             |
   +----------v-----------+                      +----------v-----------+
   | Client UI State      |                      | Server State         |
   | (Zustand)            |                      | (TanStack Query)     |
   | - Drawers / Modals   |                      | - Cache & Invalidate |
   | - UI Preferences     |                      | - Optimistic Updates |
   | - Filter Drawer Open |                      | - Deduplication      |
   +----------+-----------+                      +----------+-----------+
              |                                             |
              +----------------------+----------------------+
                                     |
                      +--------------v--------------+
                      |  Typed API Client & Routes  |
                      |  (src/lib/api-client.ts)    |
                      +--------------+--------------+
                                     |
                      +--------------v--------------+
                      | Mock Rest API / Mock Data   |
                      | (Next.js Route Handlers)    |
                      +-----------------------------+
```

Key Architectural Principles:
- **Feature-Driven Directory Structure**: Feature code (`dashboard`, `transactions`, `reconciliation`, `workflows`) encapsulates its own components, hooks, api calls, and types.
- **Single Source of Truth for State**: Server state lives in TanStack Query; client UI state lives in Zustand; filter/pagination state lives in URL search params. No server data is duplicated into Zustand.
- **Strict Boundary Layering**: Presentation depends on feature hooks; feature hooks depend on the centralized API client; API client validates payloads with Zod schemas.

---

## Planned Milestones

The project will be built incrementally following a 15-phase implementation plan:

1. **Phase 1: Repository Setup and Tooling** - Next.js App Router, TypeScript strict, Tailwind, linting, Vitest.
2. **Phase 2: Design System and Application Shell** - High-density design tokens, accessible primitives, responsive shell.
3. **Phase 3: Mock API and Data-Access Architecture** - Typed API client, mock data generators, Next.js route handlers.
4. **Phase 4: Dashboard and Analytics** - KPI stat cards, volume charts, status breakdown, financial formatting.
5. **Phase 5: Transaction Management** - TanStack Table data grid, multi-column filtering, search, pagination.
6. **Phase 6: State Management Refinement** - URL state synchronization, TanStack Query cache invalidation, request aborts.
7. **Phase 7: Reconciliation** - Mismatch detection table, side-by-side diff viewer, manual resolution modal.
8. **Phase 8: Workflow Automation** - Workflow builder (trigger-condition-action), rule evaluator, execution history.
9. **Phase 9: Authentication and Authorization** - Mock session management, role-based guards, permission boundaries.
10. **Phase 10: Notifications and Activity Logs** - Toast alert manager, slide-over notification drawer, audit trail.
11. **Phase 11: Automated Testing** - Unit, component, integration, and Playwright end-to-end tests.
12. **Phase 12: Accessibility Audit** - Keyboard traps, ARIA roles, contrast check, screen-reader validation.
13. **Phase 13: Performance Optimization** - Code splitting, dynamic imports for charts, bundle size auditing, Core Web Vitals.
14. **Phase 14: Docker and CI** - Multi-stage Dockerfile, Docker Compose, GitHub Actions workflow.
15. **Phase 15: Documentation Review and Final Audit** - End-to-end documentation validation and project handover.

---

## Development Setup

### Prerequisites

- **Node.js**: `v20.x` or later (LTS recommended)
- **Package Manager**: `pnpm` (v9+) or `npm` (v10+)
- **Git**

### Installation

```bash
# Clone the repository
git clone https://github.com/example/finflow.git
cd finflow

# Install project dependencies
npm install
# or
pnpm install

# Copy environment configuration
cp .env.example .env.local

# Start the local development server
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to inspect the application.

---

## Testing Commands

FinFlow maintains a comprehensive test suite encompassing unit, component, accessibility, and E2E automation:

```bash
# Run unit and component tests via Vitest
npm run test

# Run tests in watch mode
npm run test:watch

# Run test coverage report
npm run test:coverage

# Run TypeScript static typecheck
npm run typecheck

# Run ESLint validation
npm run lint

# Run Playwright End-to-End tests (headless)
npm run test:e2e

# Run Playwright End-to-End tests with UI mode
npm run test:e2e:ui
```

---

## Environment Configuration

FinFlow uses environment variables for operational toggles, mock data seeding, and API configurations. Create a `.env.local` file based on `.env.example`:

```env
# Application
NEXT_PUBLIC_APP_NAME="FinFlow"
NEXT_PUBLIC_APP_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Mock API & Data Generation
NEXT_PUBLIC_USE_MOCK_DATA="true"
MOCK_DATA_SEED="42"
MOCK_API_DELAY_MS="250"

# Authentication & Session Simulation
AUTH_SECRET="portfolio-demo-session-secret-at-least-32-chars"
NEXT_PUBLIC_DEFAULT_ROLE="admin"

# Telemetry & Monitoring (Simulated)
NEXT_PUBLIC_ENABLE_WEB_VITALS="true"
```

---

## Docker Instructions

FinFlow includes a production-ready, multi-stage Dockerfile configured for standalone Next.js deployment.

### Build the Image

```bash
docker build -t finflow:latest .
```

### Run the Container

```bash
docker run -p 3000:3000 --env-file .env.local finflow:latest
```

### Using Docker Compose

```bash
# Start container in detached mode
docker-compose up -d

# View container logs
docker-compose logs -f

# Stop and remove containers
docker-compose down
```

---

## Deployment Overview

FinFlow can be deployed across several modern hosting targets:

- **Vercel**: Zero-config deployment with edge middleware and automatic preview branches.
- **Node.js Server / Standalone**: Next.js `output: 'standalone'` builds a minimal Node server bundle suitable for AWS ECS, Google Cloud Run, or Kubernetes.
- **Docker Container**: Portable OCI container containing only the minimal production runtime assets.

---

## Documentation Index

Comprehensive engineering documentation is available in the [`docs/`](docs/) directory:

1. [Project Specification (`docs/PROJECT_SPEC.md`)](docs/PROJECT_SPEC.md) - Vision, user personas, functional/non-functional requirements, acceptance criteria, exclusions.
2. [Architecture (`docs/ARCHITECTURE.md`)](docs/ARCHITECTURE.md) - Next.js App Router design, RSC/RCC boundaries, directory tree, caching, error handling.
3. [Tech Stack (`docs/TECH_STACK.md`)](docs/TECH_STACK.md) - Technology evaluations, rationales, architectural responsibilities, and anti-patterns.
4. [State Management (`docs/STATE_MANAGEMENT.md`)](docs/STATE_MANAGEMENT.md) - Explicit ownership rules for server state, client UI state, URL params, and forms.
5. [API Contracts (`docs/API_CONTRACTS.md`)](docs/API_CONTRACTS.md) - Complete mock REST API endpoints, JSON request/response payloads, and error formats.
6. [Data Models (`docs/DATA_MODELS.md`)](docs/DATA_MODELS.md) - TypeScript interfaces, enums, relationship mappings, and currency arithmetic standards.
7. [Design System (`docs/DESIGN_SYSTEM.md`)](docs/DESIGN_SYSTEM.md) - Visual tokens, typography, color semantics, component variants, and accessibility requirements.
8. [Features (`docs/FEATURES.md`)](docs/FEATURES.md) - Detailed breakdown of all 11 core application features with loading, empty, and error states.
9. [Testing Strategy (`docs/TESTING_STRATEGY.md`)](docs/TESTING_STRATEGY.md) - Unit, component, E2E, accessibility, and performance testing standards and fixtures.
10. [Performance (`docs/PERFORMANCE.md`)](docs/PERFORMANCE.md) - Core Web Vitals targets, Lighthouse standards, bundle budgets, and real measurement guidelines.
11. [Accessibility (`docs/ACCESSIBILITY.md`)](docs/ACCESSIBILITY.md) - WCAG 2.1 AA checklist, keyboard interaction contracts, ARIA patterns, and automated checks.
12. [Security (`docs/SECURITY.md`)](docs/SECURITY.md) - Threat model, mock auth assumptions, role-based authorization, input validation, and data masking.
13. [Development Guidelines (`docs/DEVELOPMENT_GUIDELINES.md`)](docs/DEVELOPMENT_GUIDELINES.md) - Strict TypeScript rules, architectural boundaries, code conventions, and pull request requirements.
14. [Implementation Plan (`docs/IMPLEMENTATION_PLAN.md`)](docs/IMPLEMENTATION_PLAN.md) - 15-phase sequential execution roadmap with verification commands.
15. [Progress Tracker (`docs/PROGRESS.md`)](docs/PROGRESS.md) - Phase status dashboard and verification checklists.
16. [AI Workflow (`docs/AI_WORKFLOW.md`)](docs/AI_WORKFLOW.md) - Mandatory execution protocol and completion reporting rules for AI-assisted tasks.

---

## Screenshots & Visual Verification Guide

FinFlow provides an end-to-end simulated operational environment. To capture screenshots or inspect interactive views locally:

1. **Boot Development Server**:
   ```bash
   npm run dev
   ```
2. **Key Route Walkthrough**:
   - **Executive Dashboard** (`http://localhost:3000/dashboard`):
     - Displays 4 real-time KPI metric cards with status trend indicators.
     - Toggle time-horizon filters (`24 Hours`, `7 Days`, `30 Days`, `90 Days`) to observe live chart recalculations.
     - Recharts area volume trends and settlement status donut charts.
   - **Transaction Management & Triage** (`http://localhost:3000/transactions`):
     - High-density TanStack Table with multi-field search, status filtering, and sorting.
     - Click any row to slide out the **Transaction Details Drawer** with JSON payload view and event timeline.
     - Click **Simulate Smart Retry** on failed transactions to review the idempotency key and operator notes modal.
   - **Ledger & Settlement Reconciliation** (`http://localhost:3000/reconciliation`):
     - Summary metrics for matched records, duplicate records, and amount variances.
     - Click any variance row to open the side-by-side **Discrepancy Diff Viewer**.
     - Click **Resolve** to review the optimistic reconciliation settlement dialog.
   - **Rule-Based Workflow Automation** (`http://localhost:3000/workflows`):
     - List of configured automation rules with live active/inactive switches.
     - Click **New Workflow** to test the React Hook Form rule builder with dynamic conditions.
     - Click **Execution History** tab to inspect automated retry audit traces.
   - **Audit Logs & Alerts** (`http://localhost:3000/activity`):
     - Real-time notification drawer via topbar bell icon.
     - Centralized operator activity table tracking timestamps, actors, and entity mutations.

3. **Automated Screenshot Capture via Playwright**:
   ```bash
   npx playwright test --update-snapshots
   ```

---

## Limitations & Synthetic Data

- **Synthetic Mock Data**: All financial records, customer details, and bank references are pseudo-randomly generated via deterministic seeds (`MOCK_DATA_SEED="42"`).
- **No Direct Clearing Integration**: Simulated settlement delays and retries mimic real-world gateway mechanics (Stripe, Adyen, Banking APIs) without executing real money transfers.
- **Session Authentication**: Uses signed, secure mock session cookies for role simulation without requiring an external OAuth provider.
- **PCI-DSS Compliance Scope**: Because no genuine Cardholder Data (CHD) is captured or stored, full PCI-DSS Level 1 certification is not applicable. The UI demonstrates PCI-compliant patterns (PAN truncation and tokenized references).

---

## Production-Readiness Gaps & Enterprise Migration Roadmap

While FinFlow is architected with strict enterprise frontend standards, migrating this demonstration platform to a production banking or payment-rail environment requires addressing the following backend and infrastructure gaps:

1. **Real Payment Gateway Connectors**:
   - Replace in-memory mock repository route handlers (`src/lib/mock-data/mock-repository.ts`) with production webhook listeners and mutual-TLS (mTLS) bank acquiring connections.
2. **Distributed Idempotency Store**:
   - Replace local idempotency key caches with a distributed Redis cluster supporting atomic `SET NX` locks with TTL.
3. **Enterprise Identity Provider (IdP)**:
   - Replace signed demo session cookies with OIDC / SAML 2.0 enterprise single sign-on (e.g. Okta, Azure AD, Auth0) backed by hardware MFA (WebAuthn/FIDO2).
4. **Permanent Audit Log Storage**:
   - Forward activity logs to immutable append-only storage (e.g. AWS CloudTrail, Kafka event stream, or encrypted ClickHouse/BigQuery audit tables).
5. **Real-time WebSockets / Server-Sent Events (SSE)**:
   - Upgrade client polling/refetching to real-time SSE streams for instant incident notifications.
