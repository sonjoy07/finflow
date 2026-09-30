# FinFlow: Performance Engineering & Web Vitals

## 1. Performance Philosophy & Targets

In high-volume fintech operations, user interface lag translates directly to delayed incident response, slower transaction triage, and cognitive fatigue. FinFlow treats performance as a first-class engineering requirement, backed by strict **Core Web Vitals** thresholds and continuous measurement.

### 1.1 Core Web Vitals Targets

| Metric | Target (Good) | Needs Improvement | Poor (Failing Threshold) |
| :--- | :---: | :---: | :---: |
| **Largest Contentful Paint (LCP)** | **<= 1.8s** | 1.8s – 2.5s | > 2.5s |
| **Interaction to Next Paint (INP)** | **<= 100ms** | 100ms – 200ms | > 200ms |
| **Cumulative Layout Shift (CLS)** | **<= 0.05** | 0.05 – 0.10 | > 0.10 |
| **First Contentful Paint (FCP)** | **<= 1.0s** | 1.0s – 1.8s | > 1.8s |
| **Time to First Byte (TTFB)** | **<= 250ms** | 250ms – 600ms | > 600ms |

---

## 2. Baseline Measurement Strategy

To maintain empirical rigor, performance metrics must be measured rather than estimated or assumed.

### 2.1 Measurement Methodology
1. **Local Benchmark Environment**:
   - Production build tested locally: `npm run build && npm run start`.
   - Chrome DevTools CPU Throttling: 4x slowdown (simulating mid-tier enterprise laptops).
   - Network Throttling: "Fast 3G" or "Slow 4G".
2. **Lighthouse Automated Audits**:
   - Run via headless Chrome in CI and Chrome DevTools in development.
   - Target Scores: **Performance >= 90**, **Accessibility >= 95**, **Best Practices >= 95**, **SEO >= 90**.
3. **No Fabricated Benchmarks**: Never record invented millisecond timings or fabricated benchmark scores in documentation. Real benchmark runs must document the exact commit SHA, date, environment, hardware profile, and raw output.

---

## 3. Bundle Size Optimization & Analysis

### 3.1 Bundle Budget
- **Initial Client Bundle**: < 150 KB gzipped for the core application shell.
- **Route Chunks**: < 40 KB gzipped per feature page.

### 3.2 Bundle Analyzer Workflow
We utilize `@next/bundle-analyzer` to inspect and track dependency footprints:

```javascript
// next.config.mjs
import withBundleAnalyzer from '@next/bundle-analyzer';

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default bundleAnalyzer({
  // Next.js configuration
});
```

Run bundle audit:
```bash
ANALYZE=true npm run build
```

---

## 4. Code Splitting & Dynamic Imports

Heavy third-party visualization libraries and infrequently used modals are split out of the initial critical path using Next.js `dynamic()`:

```tsx
// Lazy-loading Recharts to prevent blocking initial Dashboard LCP
import dynamic from 'next/dynamic';
import { ChartSkeleton } from '@/features/dashboard/components/chart-skeleton';

export const VolumeTimeSeriesChart = dynamic(
  () => import('./volume-time-series-chart').then((mod) => mod.VolumeTimeSeriesChart),
  {
    loading: () => <ChartSkeleton height={320} />,
    ssr: false, // Prevents SVG hydration mismatches
  }
);

// Lazy-loading Workflow Builder Modal
export const WorkflowBuilderModal = dynamic(
  () => import('./workflow-builder-modal').then((mod) => mod.WorkflowBuilderModal),
  { ssr: false }
);
```

---

## 5. Table Virtualization Criteria

FinFlow handles datasets spanning thousands of transactions. To prevent DOM bloat while keeping DOM operations lightweight:

1. **Default Strategy (Server-Side Pagination)**: The primary mechanism limits DOM node counts by paging data on the server/mock backend (default: 25 rows, max: 100 rows). 25 table rows create ~250 DOM nodes, well within optimal browser layout budgets.
2. **Virtualization Trigger**: If an operator selects "Show 100+ rows" or client-side batch analysis mode is active without pagination, table rows are virtualized using `@tanstack/react-virtual`. Virtualization renders only the rows visible in the viewport plus an overscan buffer of 5 rows, ensuring scroll performance remains at 60 FPS.

---

## 6. React Profiler & Render Optimization

### 6.1 Identifying Render Cascades
- Use React Developer Tools Profiler to identify components re-rendering unnecessarily during typing in the transaction search input.
- Wrap complex table cell formatters in `React.memo` where row updates are frequent.
- Extract atomic selectors in Zustand stores to prevent subscriber re-renders:
  ```typescript
  // Good: Re-renders ONLY when isSidebarCollapsed changes
  const isSidebarCollapsed = useUIStore((s) => s.isSidebarCollapsed);

  // Bad: Re-renders when ANY store property changes
  const { isSidebarCollapsed } = useUIStore();
  ```

### 6.2 Debounced Search Inputs
Search inputs use a 300ms debounce to prevent firing network requests or query recomputations on every keystroke.

---

## 7. Data-Fetching & Query Cache Optimization

1. **Request Deduplication**: TanStack Query automatically deduplicates simultaneous identical requests across multiple components mounting at the same time.
2. **Stale-While-Revalidate**: Data is served instantly from memory cache while fresh data is revalidated in the background.
3. **Hover Prefetching**: When a user hovers over a transaction row, the detail query is prefetched:
   ```typescript
   const prefetchTransaction = (id: string) => {
     queryClient.prefetchQuery({
       queryKey: transactionKeys.detail(id),
       queryFn: () => fetchTransactionById(id),
       staleTime: 30 * 1000,
     });
   };
   ```

---

## 8. Font, Image & Layout Shift (CLS) Optimization

1. **Next.js Font Optimization**: System fonts or Google Fonts (`Inter`) are loaded via `next/font/google` using `display: 'swap'` and automatic self-hosting, eliminating Flash of Unstyled Text (FOUT) and layout shifts.
2. **Explicit Dimension Skeletons**: Every asynchronous component (cards, charts, table cells) is backed by a skeleton component with exact height and width matching the resolved content. This guarantees a **CLS score of 0.00**.
3. **Optimized SVG Icons**: Inline Lucide icons loaded as lightweight React components without heavy icon-font assets.

---

## 9. Real-User Web Vitals Instrumentation

FinFlow instruments real-user Web Vitals monitoring via Next.js built-in performance hooks:

```typescript
// src/app/web-vitals.ts
export function reportWebVitals(metric: any) {
  if (process.env.NEXT_PUBLIC_ENABLE_WEB_VITALS === 'true') {
    // In production, send metric to telemetry endpoint
    console.info('[Web Vital]', {
      name: metric.name,
      value: Math.round(metric.value * 10) / 10,
      rating: metric.rating, // "good" | "needs-improvement" | "poor"
      id: metric.id,
    });
  }
}
```
