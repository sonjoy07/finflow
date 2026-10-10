# FinFlow Visual Design System & UI Specification

> **Source of Truth for FinFlow User Interface Implementation**  
> *Derived from Stripe-inspired enterprise fintech ergonomics and tailored for FinFlow's high-density payment operations, automated workflows, and ledger reconciliation.*

---

## 1. Visual Philosophy & Design Principles

FinFlow is a high-volume financial operations and reconciliation platform designed for payment specialists, risk analysts, and compliance managers. Operators spend extended hours tracking high-velocity payments, resolving ledger discrepancies, and managing automated retry workflows. The design must minimize cognitive friction while maximizing information throughput.

### Core Tenets
1. **High Information Density with Visual Breathing Room**
   - Tables, lists, and drawers maintain compact row heights (40–44px) and tight padding without sacrificing visual clarity.
   - Negative space is used strategically to group related transaction metadata and financial audit trails.
2. **Deterministic Semantic Color**
   - Color is strictly functional and informative—never decorative.
   - Green, amber, rose, and purple convey verified transaction states (`settled`, `pending`, `failed`, `disputed`). General layout surfaces remain strictly neutral.
3. **Precision Numerical Presentation**
   - All monetary amounts, transaction hashes, timestamps, and percentages use tabular numerals (`font-mono tabular-nums`) with consistent right-alignment for rapid vertical scanning.
4. **Restrained Depth & Tactile Hierarchy**
   - Clean 1px borders (`border-border`), subtle elevation shadows (`shadow-xs` / `shadow-sm`), and muted background contrasts separate dashboard chrome from interactive content.
5. **Accessible & Keyboard Operable by Default**
   - Every interactive control meets WCAG 2.1 AA contrast requirements (≥ 4.5:1 text, ≥ 3.0:1 UI boundaries). Focus rings (`ring-2 ring-primary ring-offset-2`) are prominent and unambiguous.

---

## 2. Color System & Design Tokens

FinFlow utilizes a slate-tinted neutral foundation paired with an authoritative financial blue (`Electric Cobalt`) primary accent and strict status tokens. Tokens are mapped to CSS custom variables in `globals.css` and integrated via Tailwind CSS.

### 2.1 Neutral Surfaces & Foundation

| Token | Light Value | Dark Value | Purpose |
| :--- | :--- | :--- | :--- |
| `background` | `#f8fafc` (Slate 50) | `#0f172a` (Slate 900) | App canvas background |
| `foreground` | `#0f172a` (Slate 900) | `#f8fafc` (Slate 50) | High-contrast primary text |
| `card` | `#ffffff` (Pure White) | `#1e293b` (Slate 800) | KPI cards, table containers, modals |
| `card-foreground` | `#0f172a` (Slate 900) | `#f8fafc` (Slate 50) | Card typography |
| `popover` | `#ffffff` (Pure White) | `#1e293b` (Slate 800) | Dropdowns, tooltips, select menus |
| `muted` | `#f1f5f9` (Slate 100) | `#334155` (Slate 700) | Table row hover, tab backgrounds |
| `muted-foreground`| `#64748b` (Slate 500) | `#94a3b8` (Slate 400) | Subtitles, helper text, empty states |
| `border` | `#e2e8f0` (Slate 200) | `#334155` (Slate 700) | 1px hairline structural dividers |
| `input` | `#e2e8f0` (Slate 200) | `#334155` (Slate 700) | Form input outlines |

### 2.2 Brand & Interactive Tokens

| Token | Light Value | Dark Value | Purpose |
| :--- | :--- | :--- | :--- |
| `primary` | `#2563eb` (Blue 600) | `#3b82f6` (Blue 500) | Primary actions, active links, brand accents |
| `primary-foreground`| `#f8fafc` (Slate 50) | `#0f172a` (Slate 900) | Primary button label text |
| `secondary` | `#f1f5f9` (Slate 100) | `#334155` (Slate 700) | Neutral buttons, secondary controls |
| `ring` | `#2563eb` (Blue 600) | `#3b82f6` (Blue 500) | WCAG focus indicator outlines |

### 2.3 Semantic Financial Status Tokens

Status badges combine subtle 10% opacity pill backgrounds with rich saturated text and leading status indicator dots:

| Status State | Background (Light/Dark) | Text (Light/Dark) | Indicator Dot | Financial Domain Meaning |
| :--- | :--- | :--- | :--- | :--- |
| **Settled / Matched** | `bg-emerald-500/10` | `text-emerald-700 dark:text-emerald-400` | Emerald 500 (`#10b981`) | Transaction completed, ledger reconciled |
| **Pending / Processing**| `bg-amber-500/10` | `text-amber-700 dark:text-amber-400` | Amber 500 (`#f59e0b`) | Gateway in-flight, batch pending settlement |
| **Failed / Mismatched** | `bg-rose-500/10` | `text-rose-700 dark:text-rose-400` | Rose 500 (`#f43f5e`) | Declined payment, reconciliation discrepancy |
| **Disputed / Refunded** | `bg-purple-500/10` | `text-purple-700 dark:text-purple-400` | Purple 500 (`#a855f7`) | Chargeback opened, funds refunded |
| **Active / Resolved** | `bg-blue-500/10` | `text-blue-700 dark:text-blue-400` | Blue 500 (`#3b82f6`) | Automated workflow enabled, manual fix done |

---

## 3. Typography & Hierarchy

### 3.1 Font Stacks
- **Sans Interface**: `Inter, Geist Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
  - High x-height, clear differentiation between `1`, `l`, and `I`.
- **Monospace Financial**: `ui-monospace, SFMono-Regular, "Roboto Mono", Menlo, Consolas, monospace`
  - Applied via `font-mono tabular-nums` to ensure exact column alignment for numbers, currencies, account IDs, and timestamps.

### 3.2 Type Scale

| Class | Size / Line-Height | Weight | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- |
| `text-xs` | 12px / 16px | 400, 500, 600 | `tracking-wide` | Table headers (uppercase), status pill badges, timestamps |
| `text-sm` | 14px / 20px | 400, 500 | `tracking-normal` | Table cell data, input fields, button labels, body text |
| `text-base` | 16px / 24px | 500, 600 | `tracking-normal` | Section subtitles, dialog headings, drawer headers |
| `text-lg` | 18px / 28px | 600 | `tracking-tight` | Subsection headers, container titles |
| `text-2xl` | 24px / 32px | 700 | `tracking-tight` | Page titles, primary KPI summary values |
| `text-3xl` | 30px / 36px | 700 | `tracking-tight` | Executive macro figures (Total Volume, Settlement Sum) |

---

## 4. Spacing, Elevation & Layout Grid

FinFlow adheres to a strict 4px modular spacing scale:
- `4px` (`space-1`): Micro padding, badge inner spacing, icon-to-label gaps.
- `8px` (`space-2`): Input internal padding (vertical), compact button spacing.
- `12px` (`space-3`): Input internal padding (horizontal), compact card padding.
- `16px` (`space-4`): Standard container padding, form field gaps, table cell padding.
- `24px` (`space-6`): Card content padding, section spacing, toolbar separations.
- `32px` (`space-8`): Major layout block margins, KPI grid gap.

### 4.1 Elevation & Shadows
FinFlow avoids dramatic blur or multi-step drop shadows. Depth is communicated primarily through subtle 1px border lines supplemented by crisp elevation shadows:
- **Level 0 (Flat)**: `border border-border bg-card` (Default cards and table containers)
- **Level 1 (Subtle Lift)**: `shadow-xs border border-border` (Hoverable cards, button states)
- **Level 2 (Dropdown/Popover)**: `shadow-md border border-border` (Select menus, tooltips, comboboxes)
- **Level 3 (Overlays/Modals)**: `shadow-xl border border-border` (Dialogs, slide-over detail drawers)

---

## 5. Component Patterns & Guidelines

### 5.1 Data Tables (High-Density Fintech Standard)
- **Row Height**: 40px to 44px for compact, high-density scanning.
- **Sticky Header**: `sticky top-0 bg-card z-10 border-b border-border font-medium text-xs text-muted-foreground uppercase tracking-wider`.
- **Alignment Rules**:
  - Left: Customer names, transaction IDs, payment methods, timestamps.
  - Center: Status badges, execution chips.
  - Right: Monetary amounts (`font-mono tabular-nums text-right font-medium`), percentage fees, row actions.
- **Row Interaction**:
  - `hover:bg-muted/50 cursor-pointer`
  - Selected state: `bg-primary/5 border-l-2 border-l-primary`

### 5.2 KPI & Analytics Metric Cards
- Container: `rounded-lg border border-border bg-card p-5 shadow-xs`.
- Header: Small uppercase category label (`text-xs font-semibold text-muted-foreground tracking-wider`) with an optional top-right contextual icon or date range selector.
- Primary Value: `text-2xl font-bold font-mono tracking-tight text-foreground`.
- Footer: Trend indicator badge (`+4.2% vs yesterday` in emerald, `-1.8%` in rose) paired with a muted comparative caption.

### 5.3 Buttons & Actions
- **Primary**: `bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs active:scale-[0.99]`
- **Secondary**: `bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border`
- **Destructive**: `bg-destructive text-destructive-foreground hover:bg-destructive/90`
- **Ghost/Icon**: `hover:bg-muted text-muted-foreground hover:text-foreground`
- **Sizes**:
  - Small (`h-8 px-3 text-xs`): Table action buttons (e.g., "Retry", "Resolve").
  - Default (`h-9 px-4 text-sm`): Standard form submit, filter toolbar triggers.
  - Large (`h-11 px-6 text-base`): Primary page-level call to action.

### 5.4 Form Controls & Inputs
- **Height**: 36px (`h-9`) with `px-3 text-sm rounded-md border border-input bg-background`.
- **Focus**: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`.
- **Search Bar**: Built-in leading search icon (`text-muted-foreground w-4 h-4`) and trailing `Esc` / clear button.
- **Error State**: `border-destructive text-destructive focus-visible:ring-destructive` with accessible inline `aria-describedby` error text.

### 5.5 Modal Dialogs & Slide-Over Drawers
- **Backdrop**: `bg-black/50 backdrop-blur-xs transition-opacity`.
- **Dialogs**: Centered, max-width `max-w-lg`, `rounded-xl border border-border bg-card p-6 shadow-xl`. Used for confirming irreversible actions (e.g., manual discrepancy reconciliation, retry payment).
- **Slide-Over Drawers**: Anchored to right viewport (`w-full sm:max-w-md md:max-w-lg border-l border-border bg-card shadow-2xl`). Used for deep inspection (Transaction details, workflow execution logs, notifications). Focus is strictly trapped within the drawer.

---

## 6. Responsive Dashboard Layout Architecture

```text
+-------------------------------------------------------------------------------------------------------------------+
| Topbar: FinFlow Logo | [Search Omnibar /] | [Mock Gateways Active]       [Role Switcher]  [Notifications] [Avatar]|
+------------------+------------------------------------------------------------------------------------------------+
|  📊 Dashboard    | Operations Command Center                                          [Horizon: 24h | 7d | 30d]   |
|  💳 Transactions |------------------------------------------------------------------------------------------------|
|  ⚖️ Reconcile    | [ UNIFIED TREASURY SUMMARY STRIP: Total Volume $1.24M | Settled | Exceptions | Pending | Rate ]   |
|  ⚡ Workflows    |------------------------------------------------------------------------------------------------|
|  🔔 Alerts       | +-- PRIMARY STAGE (68%) -------------------------------+ +-- TRIAGE COMMAND RAIL (32%) -------+   |
|  📋 Audit Logs   | | Processing Volume Velocity Trend (Daily Gross/Net)   | | Operational Exceptions & P1 Queue   |   |
|                  | | Area chart with hairline gridlines & latency bounds  | | • Ledger Variance Break ($1,845)   |   |
|  [Sidebar 256px] | |------------------------------------------------------| | • Decline Triage Queue (42 items)   |   |
|  [Ops Lead Desk] | | Live Transaction Stream (Recent Cleared Events)      | | • Gateway Rails (Stripe/Adyen/ACH)  |   |
|  [Collapse <]    | | High-density ledger table with inline actions        | | Status Distribution Donut           |   |
|                  | | [Ledger View ->]                                     | | Operational Activity Feed           |   |
|                  | +------------------------------------------------------+ +-------------------------------------+   |
+------------------+------------------------------------------------------------------------------------------------+
```

### Breakpoint Matrix
- **Mobile (< 768px)**:
  - Sidebar collapses into an off-canvas drawer opened via hamburger button in topbar.
  - Multi-column ledger strips adapt to stacked priority views with horizontal overflow indicators.
  - Asymmetric layout collapses cleanly into a single vertical stream (Primary metrics -> Exception queue -> Velocity chart -> Recent transactions).
- **Tablet (768px – 1023px)**:
  - Sidebar displays in condensed icon-only mode (72px width) with accessible tooltips.
  - Treasury strip splits into 2x2 grid; primary charts and tables span 100% width.
- **Desktop (1024px – 1439px)**:
  - Permanent 256px navigation sidebar with institutional operator desk status.
  - Asymmetrical 68/32 split (8 cols / 4 cols) maximizing dual operational oversight.
- **Wide Display (1440px+)**:
  - Container fluidly expands up to `max-w-[1600px]`, eliminating dead whitespace margins while preserving optimal 65–75ch readability on text blocks.

---

## 7. Accessibility & Compliance (WCAG 2.1 AA)

1. **Color Independence**: Status badges never rely on color alone. Each status badge displays an explicit text label (`Settled`, `Failed`, `Pending`) and distinct semantic iconography or indicator dot.
2. **Accessible Contrast Ratios**:
   - Normal text: ≥ 4.5:1 against card background.
   - Large text / KPI numbers: ≥ 3.0:1 against background.
   - Interactive borders and focus indicators: ≥ 3.0:1 against adjacent surfaces.
3. **Keyboard Operability**:
   - Every interactive control (table rows, modal triggers, pagination, filters) can be reached and activated via `Tab`, `Space`, or `Enter`.
   - Modals and drawers capture keyboard focus and restore it cleanly upon dismissal (`Escape`).
4. **Reduced Motion**:
   - Respects `prefers-reduced-motion: reduce` by disabling non-essential slide animations and transition delays.
