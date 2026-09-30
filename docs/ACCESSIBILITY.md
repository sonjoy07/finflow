# FinFlow: Accessibility (a11y) Standards

## 1. Compliance Target & Principles

FinFlow is designed and engineered to comply fully with the **Web Content Accessibility Guidelines (WCAG) 2.1 Level AA**. In enterprise financial operations, accessibility is both an inclusive imperative and a prerequisite for high-speed, keyboard-first operational workflows.

### Core Principles
1. **Perceivable**: All visual indicators (status badges, diff highlights, charts) have text equivalents and meet contrast minimums.
2. **Operable**: 100% of the platform can be navigated and controlled using only a keyboard.
3. **Understandable**: Form errors, validation states, and modal dialogs provide predictable, context-rich guidance.
4. **Robust**: Clean semantic HTML ensures reliable interoperability with modern assistive technologies (NVDA, JAWS, VoiceOver).

---

## 2. Semantic HTML & Landmark Roles

We avoid `<div>` soup in favor of native HTML5 structural landmarks:

```html
<header role="banner">        <!-- Topbar navigation, search, persona switcher -->
<nav role="navigation">       <!-- Primary sidebar and pagination controls -->
<main role="main">            <!-- Page-specific content (dashboard, tables) -->
<section>                     <!-- Distinct card groups and chart panels -->
<aside role="complementary">  <!-- Slide-over drawers (details, notifications) -->
<footer role="contentinfo">   <!-- Status bar, footer links -->
```

---

## 3. Keyboard Navigation & Interaction Matrix

Every interactive component supports standard keyboard interaction patterns:

| Component | Key Bindings | Expected Behavior |
| :--- | :--- | :--- |
| **Global Shell** | `Tab` / `Shift + Tab` | Moves focus sequentially through interactive elements. |
| **Command Palette** | `Ctrl + K` / `Cmd + K` | Opens global quick search / command palette. |
| **Data Table** | `Enter` / `Space` | Activates row detail drawer or row selection. |
| **Table Headers** | `Enter` / `Space` | Toggles column sort order (`asc` -> `desc` -> `none`). |
| **Modal / Drawer** | `Escape` | Dismisses the overlay and returns focus to trigger element. |
| **Select / Dropdown** | `ArrowDown` / `ArrowUp` | Traverses dropdown menu items. |
| **Select / Dropdown** | `Enter` / `Space` | Selects the active item and closes the menu. |
| **Toast Alert** | `Alt + T` (optional) | Focuses the newest toast alert. |

### 3.1 Focus Indicators
- All interactive elements display a prominent, high-contrast focus ring:
  ```css
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
  ```
- Focus rings are never hidden with `outline: none` unless replaced by a custom accessible ring.

---

## 4. Focus Management, Modals & Drawers

### 4.1 Focus Trapping in Overlays
When a modal dialog or slide-over drawer opens:
1. **Focus Trap**: Focus is captured within the dialog container. Tabbing past the final element wraps back to the first interactive element.
2. **Background Inactivity**: Background content receives `aria-hidden="true"` and body scrolling is locked (`overflow: hidden`).
3. **Focus Restoration**: When the dialog is dismissed (via close button, `Escape`, or backdrop click), keyboard focus is immediately restored to the button that originally triggered it.

### 4.2 ARIA Attributes on Overlays
```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <h2 id="dialog-title">Retry Failed Transaction</h2>
  <p id="dialog-description">
    Confirming this action will schedule an idempotent retry through the mock gateway.
  </p>
  {/* Dialog Content */}
</div>
```

---

## 5. Accessible Forms & Error Feedback

1. **Explicit Label Association**: Every `<input>`, `<select>`, and `<textarea>` has an associated `<label>` using the `htmlFor` / `id` attribute pair.
2. **Helper & Error Descriptions**: Field error messages are linked to inputs via `aria-describedby`:
   ```tsx
   <label htmlFor="workflow-name" className="text-sm font-medium">
     Workflow Name
   </label>
   <input
     id="workflow-name"
     aria-invalid={!!errors.name}
     aria-describedby={errors.name ? "workflow-name-error" : undefined}
   />
   {errors.name && (
     <p id="workflow-name-error" role="alert" className="text-xs text-destructive">
       {errors.name.message}
     </p>
   )}
   ```
3. **Error Summary Banner**: Complex forms (such as the multi-step Workflow Builder) display a top-level alert banner summarizing all invalid fields if submission fails.

---

## 6. Screen-Reader Announcements & Live Regions

Dynamic DOM updates that occur without a full page reload are communicated to screen readers using ARIA live regions:

- **Toast Notifications**: Wrapped in `<div role="status" aria-live="polite">` so new notifications are voiced without interrupting current speech.
- **Table Search & Filter Updates**: Filter count updates (e.g., *"Showing 14 filtered transactions"*) are announced politely.
- **Sort Changes**: Table column headers emit `aria-sort="ascending"` or `aria-sort="descending"`.

---

## 7. Contrast Requirements & Color Independence

1. **Contrast Minimums**:
   - Standard body text (<= 18px): **Minimum 4.5:1** contrast ratio against background.
   - Large text (>= 18px bold or >= 24px) & UI components/borders: **Minimum 3.0:1** contrast ratio.
2. **Color Never Used as Sole Indicator**:
   - Status badges pair color with text and iconography (e.g. green pill includes checkmark icon and text "Settled"; red pill includes alert icon and text "Failed").
   - Reconciliation diffs pair background color with mathematical signs (`+$10.00` in green, `-$5.00` in red).

---

## 8. Reduced Motion Support

All decorative transitions and animations respect the user's OS-level accessibility preference (`prefers-reduced-motion`):

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Tailwind utility `motion-reduce:*` is applied to slide-over drawers, modal fades, and toast animations.

---

## 9. Accessible Data Tables

FinFlow tables follow WAI-ARIA Table design patterns:
- Proper `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, and `<td>` elements.
- Column headers tagged with `<th scope="col">`.
- Row headers tagged with `<th scope="row">` where applicable for primary transaction IDs.
- Hidden accessible caption for screen-reader orientation:
  ```html
  <caption className="sr-only">
    Recent Transactions Table. Sortable by Date, Customer, and Amount.
  </caption>
  ```

---

## 10. Automated & Manual Verification Checklist

### Automated Audits
- [ ] `vitest-axe` component tests run with 0 violations.
- [ ] `@axe-core/playwright` E2E accessibility assertions run across all primary pages.
- [ ] Lighthouse Accessibility score >= 95.

### Manual Testing Script
- [ ] **Tab Order**: Unplug mouse and verify logical tab traversal through entire page.
- [ ] **Modal Traps**: Open Transaction Details drawer, verify focus stays inside, press `Escape` to close, verify focus returns to table row.
- [ ] **Screen Reader**: Traverse Transaction Explorer using VoiceOver (macOS) or NVDA (Windows); verify amounts, dates, and status pills are voiced accurately.
- [ ] **Zoom**: Zoom browser to 200%; verify no text clipping, overlapping containers, or horizontal scroll breakage.
