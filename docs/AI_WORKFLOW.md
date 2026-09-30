# FinFlow: AI Assistant Workflow & Engineering Protocol

This document establishes the mandatory operational protocol for any AI agent, coding assistant, or developer working on the FinFlow codebase. Adherence to these rules is non-negotiable to maintain enterprise architectural integrity, prevent regressions, and ensure honest, verifiable engineering progress.

---

## 1. Fifteen Mandatory Rules for AI-Assisted Tasks

1. **Read Core Docs First**: Always read `README.md` and the relevant feature specification in `docs/` before implementing or modifying any feature.
2. **Consult Architectural Boundaries**: Read `docs/ARCHITECTURE.md` and `docs/DEVELOPMENT_GUIDELINES.md` before making any structural, layout, or dependency changes.
3. **Check State Ownership Rules**: Read `docs/STATE_MANAGEMENT.md` before touching any data-fetching, caching, store, or state-synchronization code. Never duplicate server state in client stores.
4. **Adhere to Data & API Contracts**: Read `docs/API_CONTRACTS.md` and `docs/DATA_MODELS.md` before implementing or updating any API endpoint, route handler, or data-dependent component.
5. **Follow the Testing Protocol**: Read `docs/TESTING_STRATEGY.md` before adding, modifying, or evaluating tests. All new business logic and formatters require unit tests.
6. **Respect Performance Budgets**: Read `docs/PERFORMANCE.md` before making performance-related changes or introducing third-party packages.
7. **Strict Scope Discipline**: Implement **only** the exact scope requested by the current task. Never prematurely implement downstream phases or add unrequested features.
8. **Avoid Reimplementation**: Inspect existing utilities in `src/lib/` and shared UI components in `src/components/ui/` before creating new ones. Never reinvent existing helpers.
9. **Inspect Before Editing**: Always inspect and understand existing files before modifying them. Never make blind edits or assumptions about existing code.
10. **Execute Real Verifications**: Always run relevant tests, typechecks (`npm run typecheck`), linters (`npm run lint`), and builds (`npm run build`) to verify changes.
11. **Fix All Regressions Immediately**: If your changes introduce lint errors, type failures, or broken tests, fix them immediately within the current task.
12. **Keep Documentation Synchronized**: When implementation details or architectural decisions change, immediately update the corresponding documents in `docs/`.
13. **Verifiable Progress Tracking**: Update `docs/PROGRESS.md` **only after** verification commands have actually run and succeeded. Never mark work complete prematurely.
14. **Structured Task Reporting**: Conclude every task with the mandatory Completion Report specified below. Detail actual files changed, commands executed, and verified results.
15. **Zero Fabrication**: Never fabricate test outputs, invent benchmark numbers, or claim unverified functionality works. If a test or command failed or was skipped, state it clearly.

---

## 2. Mandatory Completion Report Format

Every completed task must conclude with this structured report:

```markdown
### FinFlow Task Completion Report

- **Scope Implemented**: [Summary of the exact tasks completed in this turn]
- **Files Changed**:
  - `path/to/file1.ts` (created/modified)
  - `path/to/file2.tsx` (created/modified)
- **Architecture Decisions**: [Any design patterns, trade-offs, or structural choices made]
- **Tests Executed**:
  - `[command]` -> [Actual output status: passed / failed / skipped]
- **Lint / Type-Check / Build Results**:
  - `npm run typecheck` -> [Passed with 0 errors / Not run]
  - `npm run lint` -> [Passed with 0 errors / Not run]
  - `npm run build` -> [Passed / Not run]
- **Known Issues & Unresolved Decisions**: [Explicitly call out any known gaps or pending choices]
- **Documentation Updates**: [List of documentation files updated to reflect current state]
- **Next Eligible Phase**: [The next sequential phase ready to begin according to IMPLEMENTATION_PLAN.md]
```
