# Accessibility (WCAG 2.2 AA & Targeted AAA) Conformance Matrix

PlanCraftX is committed to inclusive event planning for all users regardless of ability, neurodivergence, or assistive technology setup.

---

## 1. Conformance Status & Audit Classification

To maintain verifiable honesty, all accessibility claims are classified into three explicit categories:

- **`[AUTOMATED]`**: Verified by Axe-core (`@axe-core/playwright` and `vitest-axe`) in CI.
- **`[MANUALLY VERIFIED]`**: Verified via keyboard navigation, zoom scaling, and color contrast checks.
- **`[NOT RUN]`**: Checks that have not yet been performed in the current milestone.

---

## 2. WCAG 2.2 AA Compliance Mapping Table

| WCAG Criterion                       | Level | Technical Implementation                                                                                    | Proof Method & Status                          | Files Involved                        |
| :----------------------------------- | :---: | :---------------------------------------------------------------------------------------------------------- | :--------------------------------------------- | :------------------------------------ |
| **1.1.1 Non-text Content**           |   A   | All non-text content (icons, images) provides meaningful `alt` text or `aria-hidden="true"`.                | `[AUTOMATED]` axe-core                         | `app/layout.tsx`<br>`app/page.tsx`    |
| **1.3.1 Info and Relationships**     |   A   | HTML5 semantic landmarks (`<header>`, `<main>`, `<footer>`), heading hierarchy, tables with scoped headers. | `[AUTOMATED]` axe-core                         | `app/layout.tsx`<br>`app/page.tsx`    |
| **1.4.1 Use of Color**               |   A   | Color is never used as the sole conveyor of information; warnings include text badges and icons.            | `[MANUALLY VERIFIED]`                          | `app/globals.css`                     |
| **1.4.3 Contrast (Minimum)**         |  AA   | Text contrast $\ge 4.5:1$ for normal text, $\ge 3:1$ for UI controls and graphical objects.                 | `[AUTOMATED]` axe-core                         | `app/globals.css`                     |
| **1.4.6 Contrast (Enhanced)**        |  AAA  | Dedicated High-Contrast theme achieves $\ge 7:1$ contrast against pure black (`#000000`).                   | `[MANUALLY VERIFIED]`                          | `app/globals.css`                     |
| **1.4.10 Reflow**                    |  AA   | Content reflows down to $320\text{px}$ width without horizontal scrolling or truncation.                    | `[MANUALLY VERIFIED]` (Mobile Chrome viewport) | `app/globals.css`                     |
| **1.4.12 Text Spacing**              |  AA   | Interface accommodates custom line-height, paragraph, letter, and word spacing.                             | `[MANUALLY VERIFIED]`                          | `app/globals.css`                     |
| **2.1.1 Keyboard**                   |   A   | All interactive elements operable via standard keyboard (`Tab`, `Shift+Tab`, `Enter`, `Space`, `Esc`).      | `[MANUALLY VERIFIED]`                          | `app/page.tsx`<br>`app/layout.tsx`    |
| **2.4.1 Bypass Blocks**              |   A   | Top-level "Skip to main content" link accessible immediately on initial Tab press.                          | `[AUTOMATED]` axe-core                         | `app/layout.tsx`                      |
| **2.4.7 Focus Visible**              |  AA   | Visible, unobscured focus indicator with $\ge 3:1$ contrast against adjacent background.                    | `[MANUALLY VERIFIED]`                          | `app/globals.css`                     |
| **2.4.11 / 2.4.13 Focus Appearance** |  AA   | Focus ring utilizes 3px solid outline with 2px offset.                                                      | `[MANUALLY VERIFIED]`                          | `app/globals.css`                     |
| **2.5.7 Dragging Movements**         |  AA   | Reordering in timeline/checklists pairs drag gestures with single-pointer Up/Down buttons.                  | Planned M5                                     | `features/timeline/`                  |
| **2.5.8 Target Size (Minimum)**      |  AA   | Interactive click/touch targets meet minimum $24 \times 24\text{px}$ (preferred $44\text{px}$).             | `[AUTOMATED]` axe-core                         | `app/page.tsx`                        |
| **3.3.7 Redundant Entry**            |   A   | Information entered in wizard steps is automatically populated across budget and timeline views.            | Planned M4                                     | `features/wizard/`                    |
| **4.1.3 Status Messages**            |  AA   | `aria-live="polite"` regions announce generation completion without per-token streaming spam.               | Planned M3/M6                                  | `features/ideas/`<br>`features/chat/` |

---

## 3. Assistive Technology Verification Disclosure

Automated axe-core sweeps do NOT substitute for comprehensive manual screen-reader audits. Formal end-to-end screen reader testing (NVDA on Windows, VoiceOver on macOS/iOS) is scheduled for **Milestone 8 (M8: Accessibility Pass)**. Current claims reflect automated and manual DOM inspection only.
