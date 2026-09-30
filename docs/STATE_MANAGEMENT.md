# FinFlow: State Management Architecture

## 1. Overview & State Ownership Taxonomy

In complex financial dashboards, state mismanagement often leads to stale balances, out-of-sync filters, duplicate network requests, and difficult-to-debug UI glitches. FinFlow eliminates these defects by establishing **explicit state ownership rules**.

Every piece of state in the application belongs to exactly one category:

```
+-------------------------------------------------------------------------------------------------+
|                                     STATE OWNERSHIP MATRIX                                      |
+----------------------+--------------------+--------------------------------+--------------------+
| State Category       | Tool / Mechanism   | Primary Responsibilities       | Examples           |
+----------------------+--------------------+--------------------------------+--------------------+
| Server State         | TanStack Query     | Remote entity caching,         | Transactions list, |
|                      |                    | refetching, deduplication,     | dashboard metrics, |
|                      |                    | optimistic updates             | reconciliation diff|
+----------------------+--------------------+--------------------------------+--------------------+
| Client UI State      | Zustand            | Global, ephemeral UI toggles,  | Sidebar collapsed, |
|                      |                    | drawer visibility, active modal| toast alert queue, |
|                      |                    | identifiers                    | theme preference   |
+----------------------+--------------------+--------------------------------+--------------------+
| URL Search Params    | Next.js Navigation | Shareable, bookmarkable,       | ?status=failed     |
|                      | (useSearchParams)  | historical filter/sort/page    | &page=2&sort=desc  |
|                      |                    | parameters                     | &search=acme       |
+----------------------+--------------------+--------------------------------+--------------------+
| Form State           | React Hook Form    | Uncontrolled field inputs,     | Workflow builder   |
|                      | + Zod Resolver     | dirty flags, validation errors | modal, retry form  |
+----------------------+--------------------+--------------------------------+--------------------+
| Local React State    | useState /         | Isolated, non-shared           | Accordion open,    |
|                      | useReducer         | component interactions         | hover tooltip state|
+----------------------+--------------------+--------------------------------+--------------------+
| Session State        | Secure Cookies /   | User identity, active role,    | Current user ID,   |
|                      | Server Middleware  | permissions verification       | role: 'admin'      |
+----------------------+--------------------+--------------------------------+--------------------+
```

### Golden Rules
1. **Never copy server state into Zustand or React Context**. TanStack Query is the single source of truth for remote data.
2. **Never store shareable filter or pagination parameters in local component state**. If reloading the page should preserve the view, the parameter belongs in the URL.
3. **Keep form state local to the form lifecycle**. Do not expose raw keystrokes to global stores.

---

## 2. Server State: TanStack Query

### 2.1 Query Key Factory Pattern
All query keys follow a strict hierarchical array structure managed by centralized key factories. This ensures type safety and predictable cache invalidation:

```typescript
// src/features/transactions/api/transaction-keys.ts
export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (filters: TransactionFilters) => [...transactionKeys.lists(), filters] as const,
  details: () => [...transactionKeys.all, 'detail'] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const,
};

// src/features/dashboard/api/dashboard-keys.ts
export const dashboardKeys = {
  all: ['dashboard'] as const,
  metrics: (timeRange: string) => [...dashboardKeys.all, 'metrics', timeRange] as const,
};
```

### 2.2 Cache Configuration & Stale Data
To balance real-time freshness against unnecessary server load, the following default cache policies are applied:

```typescript
// src/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,          // 30 seconds: Data is considered fresh
      gcTime: 5 * 60 * 1000,         // 5 minutes: Inactive cache entries garbage collected
      refetchOnWindowFocus: false,   // Prevent unexpected layout jumps during triage
      retry: (failureCount, error) => {
        // Do not retry 4xx client errors
        if (error instanceof ApiError && error.statusCode >= 400 && error.statusCode < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});
```

### 2.3 Request Cancellation via AbortSignal
When users rapidly change filters or type search queries, preceding in-flight requests are automatically aborted to prevent race conditions and unnecessary compute:

```typescript
export function useTransactions(filters: TransactionFilters) {
  return useQuery({
    queryKey: transactionKeys.list(filters),
    queryFn: ({ signal }) => fetchTransactions(filters, signal),
  });
}

// In API client:
export async function fetchTransactions(filters: TransactionFilters, signal?: AbortSignal) {
  const query = buildQueryString(filters);
  return apiClient<TransactionListResponse>(`/api/transactions?${query}`, { signal });
}
```

### 2.4 Mutation Handling & Cache Invalidation
When an operator triggers a mutation (e.g., retrying a failed transaction), related query caches are invalidated:

```typescript
export function useRetryTransaction() {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  return useMutation({
    mutationFn: ({ id, idempotencyKey }: { id: string; idempotencyKey: string }) =>
      apiClient<Transaction>(`/api/transactions/${id}/retry`, {
        method: 'POST',
        headers: { 'X-Idempotency-Key': idempotencyKey },
      }),
    onSuccess: (updatedTransaction) => {
      // 1. Immediately update specific transaction detail cache
      queryClient.setQueryData(
        transactionKeys.detail(updatedTransaction.id),
        updatedTransaction
      );

      // 2. Invalidate transactions list and dashboard metrics
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });

      addToast({
        type: 'success',
        title: 'Retry Scheduled',
        message: `Transaction ${updatedTransaction.id} retry initiated successfully.`,
      });
    },
    onError: (error: ApiError) => {
      addToast({
        type: 'error',
        title: 'Retry Failed',
        message: error.message || 'Unable to schedule retry.',
      });
    },
  });
}
```

### 2.5 Optimistic Updates with Rollback
For instant UI responsiveness during high-frequency operator actions (such as acknowledging an alert or resolving a reconciliation record), FinFlow utilizes optimistic updates:

```typescript
export function useResolveReconciliation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      apiClient(`/api/reconciliation/${id}/resolve`, {
        method: 'PATCH',
        body: JSON.stringify({ notes }),
      }),
    onMutate: async ({ id, notes }) => {
      // Cancel outgoing queries to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: reconciliationKeys.all });

      // Snapshot previous value for rollback
      const previousData = queryClient.getQueryData(reconciliationKeys.lists());

      // Optimistically update cache
      queryClient.setQueriesData({ queryKey: reconciliationKeys.lists() }, (old: any) => ({
        ...old,
        items: old.items.map((item: any) =>
          item.id === id ? { ...item, status: 'resolved', notes } : item
        ),
      }));

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      // Rollback to snapshot if mutation fails
      if (context?.previousData) {
        queryClient.setQueriesData({ queryKey: reconciliationKeys.lists() }, context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: reconciliationKeys.all });
    },
  });
}
```

---

## 3. Client UI State: Zustand

Zustand strictly manages ephemeral, cross-component UI state that does not belong in the server cache or URL search parameters:

```typescript
// src/stores/ui-store.ts
import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system';

interface UIState {
  // Sidebar navigation
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Mobile navigation drawer
  isMobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;

  // Active modal for accessible focus tracking
  activeModalId: string | null;
  setActiveModalId: (id: string | null) => void;

  // Theme preference
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}
```

```typescript
// src/stores/toast-store.ts
import { create } from 'zustand';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}
```

> [!IMPORTANT]
> **Why `selectedId` belongs in URL Search Params, not Zustand:**
> Transaction detail inspection uses `?selectedId=tx_...` in the browser URL. Storing inspection selection in Zustand breaks bookmarkability, prevents teammates from sharing direct links during triage, and breaks native browser Back/Forward navigation. Ephemeral UI toggles without bookmark value (sidebar collapse, theme, toast notifications) remain in Zustand.

---

## 4. URL Search Parameters: Shareable View State

All data grid search queries, filter criteria, active sort column, and pagination offsets are stored directly in the URL search parameters using Next.js `useSearchParams` and `useRouter`.

### 4.1 URL State Mapping

| URL Param | Type | Default | Example |
| :--- | :--- | :--- | :--- |
| `q` | string | `""` | `?q=acme` |
| `status` | string | `"all"` | `?status=failed` |
| `method` | string | `"all"` | `?method=card` |
| `from` | ISO date | `7 days ago` | `?from=2026-10-25` |
| `to` | ISO date | `today` | `?to=2026-11-01` |
| `sortBy` | string | `"createdAt"` | `?sortBy=amount` |
| `sortOrder`| `"asc" \| "desc"`| `"desc"` | `?sortOrder=asc` |
| `page` | number | `1` | `?page=3` |
| `pageSize` | number | `25` | `?pageSize=50` |

### 4.2 Browser Navigation & Popstate Synchronization
- **Shallow Routing**: URL parameter updates utilize `{ scroll: false }` to prevent jarring scroll jumps when changing filters or page indices.
- **Back / Forward Support**: When an operator clicks the browser Back button, `useSearchParams` receives the previous query parameters automatically, triggering TanStack Query with the previous key and reading the cached result instantaneously.

---

## 5. Form State: React Hook Form + Zod

For stateful user inputs (such as the Workflow Builder or Retry Parameter Dialog), React Hook Form maintains uncontrolled inputs with zero root component re-renders:

```typescript
// Example: Workflow Builder Form Hook
const form = useForm<WorkflowFormValues>({
  resolver: zodResolver(workflowSchema),
  defaultValues: {
    name: '',
    trigger: 'transaction_failed',
    conditions: [{ field: 'amount', operator: 'gt', value: 1000 }],
    actions: [{ type: 'auto_retry', maxAttempts: 2 }],
  },
  mode: 'onBlur',
});
```

---

## 6. Concurrent Requests & Race Condition Prevention

1. **Query Key Specialization**: Because query keys include the full filter object (`['transactions', 'list', filters]`), switching filters creates an entirely separate cache entry. The previous request does not overwrite the new view.
2. **Signal Aborting**: The native `AbortSignal` cancels the superseded network request immediately upon key change.
3. **Idempotency Keys for Mutations**: All financial mutations generate a UUID v4 idempotency token before sending. If a user double-clicks "Submit Retry", the client-side disable state prevents the second click, and the backend idempotency key ensures the gateway processes it only once.

---

## 7. Concrete Decision Guide: Which State Mechanism to Use?

| Scenario | Recommended Mechanism | Reason |
| :--- | :--- | :--- |
| Storing 500 transaction records returned by `/api/transactions` | **TanStack Query** | Server data requires caching, background revalidation, and garbage collection. |
| Collapsing or expanding the left navigation sidebar | **Zustand** | Global UI preference that does not belong in the URL or server. |
| Current filter selection for transaction status (`status=failed`) | **URL Search Params** | Allows sharing deep links to colleagues and supports browser back button. |
| Validating field inputs while editing a custom alert workflow | **React Hook Form** | High-performance, isolated input validation without top-level re-renders. |
| Dropdown menu open/closed state on a table row action | **Local React State** (`useState`) | Trivial, ephemeral component-local interaction; no other component cares. |
| Active logged-in user profile & role (`operations_lead`) | **Server-Managed Session** | Security-sensitive; verified on server and read via auth context. |
