# FinFlow: Development Guidelines & Code Standards

## 1. Core Engineering Tenets

FinFlow is engineered to demonstrate the architectural rigor, discipline, and craftsmanship expected of a Senior Frontend Developer. Every contributor (human or AI) must adhere to these mandatory coding standards.

---

## 2. Mandatory Coding Rules

### Rule 1: Strict TypeScript (Zero `any`)
- `tsconfig.json` enforces `strict: true`, `noImplicitAny: true`, and `noUncheckedIndexedAccess: true`.
- The `any` type is strictly forbidden. Use `unknown`, generics, or Zod-inferred types (`z.infer<typeof Schema>`).

```typescript
// ❌ UNACCEPTABLE:
function processTransaction(data: any) {
  return data.amount * 100;
}

// ✅ ACCEPTABLE:
function processTransaction(transaction: Transaction): number {
  return transaction.amountCents;
}
```

### Rule 2: Component Size & Responsibility Limits
- Keep individual React components under **150–200 lines of code**.
- If a component handles multiple distinct UI sections, extract them into co-located child components.
- Separate view presentation from business logic; push data fetching and mutations into custom feature hooks.

```tsx
// ❌ UNACCEPTABLE: 400-line monolithic TransactionPage with table, drawer, forms, and fetch logic
export default function TransactionPage() { ... }

// ✅ ACCEPTABLE: Composed, single-responsibility leaf components
export default function TransactionPage() {
  return (
    <div className="space-y-6">
      <TransactionHeader />
      <TransactionFilterToolbar />
      <TransactionTableContainer />
      <TransactionDetailDrawer />
    </div>
  );
}
```

### Rule 3: Single Source of Truth for State
- **Server Data**: Must reside in TanStack Query. **Never duplicate server records into Zustand or React Context**.
- **Client UI State**: Toggles, modal visibility, and drawer IDs belong in Zustand.
- **Search & Filters**: Query parameters, sort columns, and page indices belong in the URL via Next.js navigation hooks.

```typescript
// ❌ UNACCEPTABLE: Copying server transactions into a Zustand store
const useTransactionStore = create((set) => ({
  transactions: [], // DON'T DO THIS
  setTransactions: (data) => set({ transactions: data }),
}));

// ✅ ACCEPTABLE: Consuming server data via TanStack Query
const { data: transactions, isLoading } = useTransactions(filters);
```

### Rule 4: Centralized & Typed API Layer
- Direct `fetch()` calls inside UI components are prohibited.
- All API interactions must use typed service methods in `src/features/*/api/` backed by `src/lib/api-client.ts`.

```tsx
// ❌ UNACCEPTABLE:
useEffect(() => {
  fetch('/api/transactions')
    .then((res) => res.json())
    .then((data) => setTransactions(data));
}, []);

// ✅ ACCEPTABLE:
const { data, isLoading } = useTransactions(filters);
```

### Rule 5: Accessible Components by Default
- All interactive controls must have accessible names, proper semantic HTML, and full keyboard navigation support.
- Icons used as buttons must have `aria-label` or visually hidden screen-reader text (`<span className="sr-only">...</span>`).

```tsx
// ❌ UNACCEPTABLE:
<div onClick={handleClose} className="cursor-pointer">
  <XIcon />
</div>

// ✅ ACCEPTABLE:
<button
  type="button"
  onClick={handleClose}
  aria-label="Close transaction details"
  className="rounded-md p-1 hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary"
>
  <XIcon className="h-4 w-4" aria-hidden="true" />
</button>
```

### Rule 6: Consistent Error Handling
- Never swallow promise rejections with empty `catch {}` blocks.
- Distinguish between client validation errors (inline feedback) and network/server failures (error boundaries or toasts).

---

## 3. Naming Conventions

| Entity | Convention | Example |
| :--- | :--- | :--- |
| **Directories** | `kebab-case` | `src/features/transaction-explorer/` |
| **Component Files** | `kebab-case.tsx` | `transaction-table.tsx` |
| **Utility / Hook Files** | `kebab-case.ts` | `use-transactions.ts`, `api-client.ts` |
| **React Components** | `PascalCase` | `TransactionTable`, `MetricCard` |
| **TypeScript Types / Interfaces** | `PascalCase` | `Transaction`, `WorkflowCondition` |
| **Custom Hooks** | `camelCase` with `use` prefix | `useTransactions`, `useDebounce` |
| **Constants / Enums** | `UPPER_SNAKE_CASE` or `as const` | `MAX_RETRY_COUNT`, `DEFAULT_PAGE_SIZE` |

---

## 4. Import Organization Standards

Imports must be organized deterministically into grouped blocks separated by a single blank line:

```typescript
// 1. Built-in Node / React imports
import { useState, useTransition } from 'react';
import Link from 'next/link';

// 2. Third-party library imports
import { useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { z } from 'zod';

// 3. Absolute path internal aliases (@/*)
import { Button } from '@/components/ui/button';
import { useTransactions } from '@/features/transactions/hooks/use-transactions';
import { formatCurrency } from '@/lib/formatters';
import type { Transaction } from '@/features/transactions/types/transaction.types';

// 4. Relative local imports
import { TransactionRow } from './transaction-row';
```

---

## 5. Pull Request & Quality Checklist

Before requesting review or merging any feature branch, verify:

- [ ] `npm run typecheck` passes with 0 errors.
- [ ] `npm run lint` passes with 0 warnings/errors.
- [ ] `npm run test` passes with 100% test success.
- [ ] New business logic and formatters include corresponding unit tests.
- [ ] Components render properly in both Light and Dark themes.
- [ ] No secret keys, credentials, or personal tokens are committed.
- [ ] Commit messages follow Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`).
- [ ] Relevant documentation files in `docs/` and `docs/PROGRESS.md` have been updated.
