# PlanCraftX — Final Optimization Changelog

## Version 0.2.0 — Code Quality Overhaul & Frontend Redesign

### 1. Architectural Refactoring

- **`features/plan-context.tsx`**:
  - Extracted visual presentation component `PlanEmptyState` into standalone `features/ui/plan-empty-state.tsx`.
  - Re-exported `PlanEmptyState` from `features/plan-context.tsx` for full backwards compatibility.
  - Reduced context provider line count from 162 lines to 94 lines.
- **`features/budget/use-budget-actions.ts`** (NEW):
  - Extracted inline state management, integer minor unit arithmetic, largest-remainder rebalancing, and `/api/currencies` network conversion out of `budget-planner.tsx`.
  - Created isolated custom hook with dedicated test suite (`tests/unit/use-budget-actions.test.ts`).
- **`features/timeline/use-timeline-actions.ts`** (NEW):
  - Extracted milestone status cycling, public holiday query lifecycle, and RFC 5545 `.ics` export out of `timeline-view.tsx`.
  - Created isolated custom hook with dedicated test suite (`tests/unit/use-timeline-actions.test.ts`).
- **`features/vendors/use-vendor-actions.ts`** (NEW):
  - Extracted vendor category filtering, status lifecycle, and OpenStreetMap place ingestion out of `vendor-checklist.tsx`.
  - Created isolated custom hook with dedicated test suite (`tests/unit/use-vendor-actions.test.ts`).

### 2. Design System & Frontend Primitives

- **`features/ui/button.tsx`** (NEW):
  - Created accessible Button primitive with variants (`primary`, `secondary`, `outline`, `ghost`, `danger`) and sizes (`sm`, `md`, `lg`).
  - Added integrated loading spinner state and object-injection immune styles.
- **`features/ui/badge.tsx`** (NEW):
  - Created semantic Badge primitive with variants (`default`, `success`, `warning`, `danger`, `info`, `outline`).
- **`features/ui/card.tsx`** (NEW):
  - Created composable Card system (`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`).
- **`features/ui/page-header.tsx`** (NEW):
  - Created standard PageHeader primitive featuring consistent typography, subtitle, badge tag, and action slots.
- **`features/ui/input.tsx` & `features/ui/select.tsx`** (NEW):
  - Created accessible form primitives with explicit `aria-invalid`, `aria-describedby`, error alert linkage, and low cyclomatic complexity ($\le 5$).
- **`features/ui/index.ts`** (NEW):
  - Created convenient barrel export for all UI primitives.

### 3. Route Layout Upgrades

- Integrated `PageHeader` with semantic badges across all application views:
  - `/app/plan/budget/page.tsx`: Added `PageHeader` with "Integer Normalized" badge.
  - `/app/plan/timeline/page.tsx`: Added `PageHeader` with "RFC 5545 Synced" badge.
  - `/app/plan/vendors/page.tsx`: Added `PageHeader` with "OSM Overpass" badge.
  - `/app/plan/ideas/page.tsx`: Added `PageHeader` with "Gemini Multi-Model" badge.
  - `/app/plan/assistant/page.tsx`: Added `PageHeader` with "Plan Grounded" badge.
  - `/app/plan/export/page.tsx`: Added `PageHeader` with "Zero Lock-In" badge.
  - `/app/settings/privacy/page.tsx`: Added `PageHeader` with "100% Client-Side Storage" badge.

### 4. Test Suite Expansion & Quality Verification

- **Total Test Count**: Increased from 428 passing tests to **451 passing tests** (+23 tests).
- **Test Files**: Increased from 50 to **54 test files** (100% pass rate).
- **New Test Files Added**:
  - `tests/component/ui-primitives.test.tsx` (13 component tests)
  - `tests/unit/use-budget-actions.test.ts` (4 unit tests)
  - `tests/unit/use-timeline-actions.test.ts` (3 unit tests)
  - `tests/unit/use-vendor-actions.test.ts` (3 unit tests)
- **Quality Verification Pipeline (`node scripts/verify-all.mjs`)**:
  - Prettier formatting check: PASSED
  - ESLint strict flat config check: PASSED (0 errors, 0 warnings)
  - TypeScript strict typecheck: PASSED (0 errors)
  - Repo hygiene scan: PASSED (0 forbidden tokens, 3.82 MB size $\le 10\text{ MB}$)
  - Test & coverage suite: PASSED (all coverage thresholds met)
  - Production dependency audit (Knip): PASSED (0 unused/unlisted packages)
