# FinFlow: Design System Specification

## 1. Visual Identity & Design Principles

FinFlow's design language is engineered for high-density financial operations. Payment operations specialists and risk analysts must quickly parse large volumes of tabular data, identify anomalies, and take decisive actions without visual fatigue.

### Core Principles
1. **High Information Density**: Compact vertical padding, tabular figures for currency alignment, and tight typography hierarchies allow operators to review dozens of records per viewport.
2. **Deterministic Status Semantics**: Status colors (success emerald, warning amber, danger rose, info sky) are used strictly for domain states—never for generic decorative styling.
3. **Calm, Neutral Foundation**: High-contrast slate neutrals form the background and chrome, ensuring colorful badges and KPI anomalies command visual hierarchy.
4. **Accessible by Default**: Every component meets WCAG 2.1 Level AA contrast guidelines (>= 4.5:1 text, >= 3:1 graphical controls) across both Light and Dark themes.

---

## 2. Design Tokens

### 2.1 Color Tokens & Theming
Theme tokens are implemented via CSS custom properties mapped in `globals.css` and referenced in Tailwind:

```css
:root {
  /* Light Theme */
  --background: 210 40% 98%;          /* #f8fafc */
  --foreground: 222 47% 11%;          /* #0f172a */

  --card: 0 0% 100%;                  /* #ffffff */
  --card-foreground: 222 47% 11%;

  --popover: 0 0% 100%;
  --popover-foreground: 222 47% 11%;

  --primary: 221 83% 53%;              /* #2563eb */
  --primary-foreground: 210 40% 98%;

  --secondary: 210 40% 96%;            /* #f1f5f9 */
  --secondary-foreground: 222 47% 11%;

  --muted: 210 40% 96%;
  --muted-foreground: 215 16% 47%;     /* #64748b */

  --border: 214 32% 91%;               /* #e2e8f0 */
  --input: 214 32% 91%;
  --ring: 221 83% 53%;

  /* Status Colors */
  --success: 142 71% 45%;              /* #16a34a */
  --success-foreground: 144 61% 20%;
  --warning: 38 92% 50%;               /* #eab308 */
  --warning-foreground: 32 81% 29%;
  --destructive: 0 84% 60%;            /* #ef4444 */
  --destructive-foreground: 0 72% 38%;
  --info: 199 89% 48%;                 /* #0284c7 */
}

.dark {
  /* Dark Theme */
  --background: 222 47% 11%;          /* #0f172a */
  --foreground: 210 40% 98%;          /* #f8fafc */

  --card: 217 33% 17%;                 /* #1e293b */
  --card-foreground: 210 40% 98%;

  --popover: 217 33% 17%;
  --popover-foreground: 210 40% 98%;

  --primary: 217 91% 60%;              /* #3b82f6 */
  --primary-foreground: 222 47% 11%;

  --secondary: 217 19% 27%;            /* #334155 */
  --secondary-foreground: 210 40% 98%;

  --muted: 217 19% 27%;
  --muted-foreground: 215 20% 65%;     /* #94a3b8 */

  --border: 217 19% 27%;
  --input: 217 19% 27%;
  --ring: 217 91% 60%;

  /* Status Colors (Dark mode optimized) */
  --success: 142 76% 36%;
  --warning: 38 92% 50%;
  --destructive: 0 84% 60%;
  --info: 199 89% 48%;
}
```

### 2.2 Typography
- **Primary Font Family**: Inter or Geist Sans (`font-sans`), system fallback `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`.
- **Financial / Tabular Figures**: `font-mono` with CSS `font-variant-numeric: tabular-nums` enforced on all numbers, amounts, dates, and IDs.
- **Scale**:
  - `text-xs`: 12px (0.75rem) / Line-height: 16px (Metadata, status timestamps, table footnotes)
  - `text-sm`: 14px (0.875rem) / Line-height: 20px (Table row data, form labels, body text)
  - `text-base`: 16px (1rem) / Line-height: 24px (Card headers, dialog titles)
  - `text-lg`: 18px (1.125rem) / Line-height: 28px (Section titles)
  - `text-2xl`: 24px (1.5rem) / Line-height: 32px (KPI numbers, page headers)
  - `text-3xl`: 30px (1.875rem) / Line-height: 36px (Macro metrics)

### 2.3 Spacing & 4px Grid
- `space-1`: 4px
- `space-2`: 8px
- `space-3`: 12px
- `space-4`: 16px
- `space-6`: 24px
- `space-8`: 32px
- `space-12`: 48px

### 2.4 Responsive Breakpoints
- `sm`: 640px (Mobile landscape / small tablets)
- `md`: 768px (Tablets / split views)
- `lg`: 1024px (Laptops / primary desktop view with collapsed sidebar)
- `xl`: 1280px (Standard desktop with expanded sidebar and full table columns)
- `2xl`: 1536px (Ultra-wide operations monitor)

---

## 3. UI Component Specifications

### 3.1 Buttons
- **Variants**:
  - `primary`: Solid brand blue with white text (`bg-primary text-primary-foreground hover:bg-primary/90`).
  - `secondary`: Subtle surface with dark text (`bg-secondary text-secondary-foreground hover:bg-secondary/80`).
  - `outline`: 1px border with transparent background (`border border-border hover:bg-muted`).
  - `ghost`: Transparent background, highlights on hover (`hover:bg-muted text-foreground`).
  - `destructive`: Red accent for high-consequence operations like "Cancel Workflow" (`bg-destructive text-destructive-foreground`).
- **Sizes**:
  - `sm`: Height 32px, text-xs, px-3 (used in table row actions).
  - `md`: Height 38px, text-sm, px-4 (default).
  - `lg`: Height 44px, text-base, px-6 (prominent call to action).
  - `icon`: Square 36x36px for iconography (search dismiss, drawer close).
- **States**: `default`, `hover`, `active`, `focused` (visible `ring-2 ring-primary ring-offset-2`), `disabled` (`opacity-50 pointer-events-none`), `loading` (spinner icon with text preserved).

### 3.2 Inputs & Search Fields
- **Height**: 36px (compact density).
- **States**:
  - `default`: Border `border-input`, text `text-foreground`.
  - `focused`: Border `border-primary`, `ring-2 ring-ring`.
  - `error`: Border `border-destructive`, text `text-destructive`, accompanied by helper icon and text.
  - `disabled`: `bg-muted text-muted-foreground cursor-not-allowed`.
- **Search Variant**: Integrated leading magnifying glass icon, trailing clear button (`Escape` clears text).

### 3.3 Selects & Comboboxes
- Accessible headless select with keyboard navigation (Up/Down arrow traversal, Enter/Space selection, Escape to close).
- Searchable filter variants for long lists (e.g., selecting from 50+ payment gateways or customer lists).

### 3.4 Cards & KPI Containers
- **Border**: 1px solid `border-border`.
- **Background**: `bg-card text-card-foreground`.
- **KPI Stat Card Anatomy**:
  - Metric Label (text-xs uppercase font-medium text-muted-foreground).
  - Primary Metric Value (text-2xl font-bold font-mono tracking-tight).
  - Trend Indicator (Badge with green +% or red -% and arrow icon).
  - Micro-sparkline or comparative benchmark text.

### 3.5 Status Badges
High-contrast pills with subtle background tints and saturated foreground text:

| Status Key | Background Token | Text Token | Indicator Dot |
| :--- | :--- | :--- | :--- |
| `settled` / `matched` | `bg-emerald-500/10` | `text-emerald-700 dark:text-emerald-400` | Emerald 500 |
| `pending` / `processing`| `bg-amber-500/10` | `text-amber-700 dark:text-amber-400` | Amber 500 |
| `failed` / `mismatched` | `bg-rose-500/10` | `text-rose-700 dark:text-rose-400` | Rose 500 |
| `refunded` / `disputed` | `bg-purple-500/10` | `text-purple-700 dark:text-purple-400` | Purple 500 |
| `resolved` / `active` | `bg-blue-500/10` | `text-blue-700 dark:text-blue-400` | Blue 500 |

### 3.6 Data Tables
- **Row Density**: Height 44px per row (compact, high-density).
- **Sticky Header**: `sticky top-0 bg-card z-10 border-b border-border`.
- **Alignment**:
  - Text / IDs / Status: Left-aligned.
  - Monetary Amounts / Quantities: Right-aligned (`font-mono tabular-nums text-right`).
  - Actions: Right-aligned.
- **Hover & Selection**: `hover:bg-muted/50 cursor-pointer`. Selected rows highlighted with `bg-primary/5`.

### 3.7 Dialogs (Modals)
- Centered modal overlay (`bg-black/50 backdrop-blur-sm`).
- Focus trapped within dialog upon open; restored to invoking element upon close.
- Dismissible via `Escape` key or clicking backdrop.
- ARIA: `role="dialog"`, `aria-modal="true"`, `aria-labelledby="dialog-title"`.

### 3.8 Drawers (Slide-Over Panels)
- Anchored to the right viewport edge (width: 480px on desktop, 100vw on mobile).
- Smooth CSS translation animation (`translate-x-0` vs `translate-x-full`).
- Used for Transaction Details, Notification Center, and Execution Step Logs.
- Focus management and keyboard dismiss matching modal dialogs.

### 3.9 Toast Alerts
- Stacked in lower-right viewport (`z-50`).
- Auto-dismiss after 5000ms with manual close button.
- ARIA live region (`aria-live="polite"`).
- Types: `success`, `error`, `warning`, `info`.

### 3.10 Skeletons & Loading States
- Shimmer pulse effect (`animate-pulse bg-muted/80 rounded`).
- Geometry matches target content (Table skeleton mimics exact column counts; KPI skeleton matches card aspect ratios).

### 3.11 Empty & Error States
- **Empty State**: Centered container, muted SVG illustration/icon, clear header ("No transactions found"), explanation ("Try adjusting your search criteria or date filters"), and a primary reset button ("Clear Filters").
- **Error State**: Inline alert banner or full-panel container with warning icon, human-readable error explanation, and a "Retry Request" button.
