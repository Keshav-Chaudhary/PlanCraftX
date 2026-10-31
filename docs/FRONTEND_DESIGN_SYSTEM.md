# PlanCraftX — Frontend Design System & Architecture Specification

## 1. Design Philosophy

PlanCraftX utilizes a bespoke, editorial design language engineered for clarity, warmth, and cognitive calm during high-stress event planning workflows. It departs from generic template aesthetics by prioritizing:

- **Warm Editorial Canvas**: Limestone/sand light background (`#fcfbf9`) paired with deep charcoal typography (`#191817`) to eliminate screen glare.
- **Natural Affirmative Primaries**: Muted forest green (`#1b3d2f` light / `#34d399` dark) for authoritative primary actions.
- **Restrained Semantic Accents**: Terracotta amber (`#b45309`) for warnings/tradeoffs, crimson (`#b91c1c`) for critical limits, and cobalt (`#0369a1`) for informational notices.
- **Honest Feedback Design**: Zero synthetic placeholders, zero stock photo carousels, and explicit distinctions between verified user data and AI estimates.

---

## 2. Color Palette & Semantic Tokens

### 2.1 CSS Custom Properties Matrix

| Semantic Token             | Light Mode (`default`)    | Dark Mode (`[data-theme='dark']`) | High-Contrast Mode (`[data-theme='high-contrast']`) | WCAG Contrast Ratio       |
| -------------------------- | ------------------------- | --------------------------------- | --------------------------------------------------- | ------------------------- |
| `--color-bg`               | `#fcfbf9` (Limestone)     | `#0c0f14` (Deep obsidian)         | `#000000` (Pure black)                              | Base Canvas               |
| `--color-fg`               | `#191817` (Deep charcoal) | `#f4f4f5` (Bright zinc)           | `#ffffff` (Pure white)                              | $\ge 14:1$ (AAA)          |
| `--color-surface`          | `#ffffff` (Clean white)   | `#131720` (Elevated slate)        | `#000000` (Pure black)                              | Surface Card              |
| `--color-surface-elevated` | `#f5f2eb` (Warm sand)     | `#1a202c` (Slate container)       | `#121212` (Elevated black)                          | Subtle Hover / Well       |
| `--color-border`           | `#e3ded6` (Subtle stone)  | `#28303e` (Muted border)          | `#ffffff` (Solid white)                             | Non-text UI $\ge 3:1$     |
| `--color-primary`          | `#1b3d2f` (Deep forest)   | `#34d399` (Emerald accent)        | `#00ff66` (Neon green)                              | $\ge 7:1$ against surface |
| `--color-primary-fg`       | `#ffffff`                 | `#0c0f14`                         | `#000000`                                           | $\ge 10:1$ (AAA)          |
| `--color-accent`           | `#b45309` (Terracotta)    | `#fb923c` (Warm amber)            | `#00ffff` (Cyan)                                    | $\ge 4.5:1$ (AA)          |
| `--focus-ring`             | `#1b3d2f` (3px solid)     | `#34d399` (3px solid)             | `#ffff00` (3px yellow)                              | WCAG 2.4.11 compliant     |

---

## 3. UI Primitive Specifications (`features/ui/`)

### 3.1 `Button`

- **Location**: `features/ui/button.tsx`
- **Variants**:
  - `primary`: Forest green fill, white text, subtle elevation shadow.
  - `secondary`: Sand surface, stone border, dark charcoal text.
  - `outline`: 1px primary border with transparent background and hover tint.
  - `ghost`: Transparent container for toolbar actions.
  - `danger`: Crimson fill for irreversible actions (e.g., plan reset).
- **Sizes**: `sm` (12px text, 28px height), `md` (14px text, 36px height), `lg` (16px text, 48px height).
- **Accessibility**: Includes animated SVG spinner with `aria-busy="true"` and auto-disabled state during asynchronous operations.

### 3.2 `Badge`

- **Location**: `features/ui/badge.tsx`
- **Variants**: `default`, `success`, `warning`, `danger`, `info`, `outline`.
- **Usage**:
  - `success`: Booked vendors, verified quotes, balanced budgets.
  - `warning`: AI-generated estimates, in-progress tasks.
  - `info`: Public holiday advisories, RFC 5545 sync tags.
  - `danger`: Overdue milestones, negative remaining budgets.

### 3.3 `Card` & Structural Containers

- **Location**: `features/ui/card.tsx`
- **Subcomponents**: `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.
- **Styling**: `rounded-xl`, `border border-border`, `bg-surface`, `shadow-xs`.

### 3.4 `PageHeader`

- **Location**: `features/ui/page-header.tsx`
- **Features**: Uniform `h1` typographic hierarchy, descriptive subtitle, optional status badge slot, and trailing action button slot. Adopted across all 10 core routes.

### 3.5 `Input` & `Select`

- **Location**: `features/ui/input.tsx`, `features/ui/select.tsx`
- **Features**: Label pairing, programmatic `id` synthesis, explicit `aria-invalid` and `aria-describedby` wiring for error messages and helper descriptions.

---

## 4. Route Uniformity Matrix

| Route               | Primary Component        | PageHeader Integration                        | Primary Actions & Controls                                |
| ------------------- | ------------------------ | --------------------------------------------- | --------------------------------------------------------- |
| `/`                 | Landing Hero & Occasions | Custom Editorial Hero                         | Launch Workspace (`/plan`), Direct Create (`/plan/event`) |
| `/plan`             | Overview Dashboard       | `OverviewSnapshotCard`                        | Readiness Bar, Advisory Cards, 6-Metric Grid              |
| `/plan/event`       | Multi-step Event Wizard  | Step Indicator Bar                            | Archetype Picker, Budget Scaling, Preferences             |
| `/plan/budget`      | `BudgetPlanner`          | `PageHeader` (with Normalization badge)       | Rebalance Inline, Currency Switch, Tradeoff Analyzer      |
| `/plan/timeline`    | `TimelineView`           | `PageHeader` (with RFC 5545 badge)            | Milestone Status Cycle, Holiday Clash, `.ics` Export      |
| `/plan/vendors`     | `VendorChecklist`        | `PageHeader` (with OSM Overpass badge)        | OSM Search, Quote Analyzer, Vendor Matrix                 |
| `/plan/ideas`       | `IdeasStream`            | `PageHeader` (with Multi-Model badge)         | Dynamic Stream, Theme/Menu/Activity Cards                 |
| `/plan/assistant`   | `ChatAssistant`          | `PageHeader` (with Plan Grounded badge)       | Grounded AI Chat, Quick Suggestion Chips                  |
| `/plan/export`      | `PlanPortability`        | `PageHeader` (with Zero Lock-In badge)        | SHA-256 JSON Backup, Print Summary, Restore               |
| `/settings/privacy` | Privacy Controls         | `PageHeader` (with 100% Client Storage badge) | Storage Audit, Disclosures, Local Purge                   |
