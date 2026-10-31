# PlanCraftX Assistant: Grader Walkthrough & Demo Script

This document provides a step-by-step evaluator script for verifying the **PlanCraftX Assistant** application built for PromptWar Challenge 5.

---

## 1. Quickstart & Environment Setup

### 1.1 Local Installation

```bash
# Clone and enter directory
cd PromptWars_Challenge5

# Install dependencies strictly
npm ci

# Set up local environment
cp .env.example .env.local
```

> [!NOTE]
> The application is completely functional **without a Gemini API key**. Local budgets, reverse-planned timelines, vendor checklists, OpenStreetMap queries, holiday detection, and JSON import/export all work offline or using public open APIs. To enable live Gemini AI generation and chat, set `GEMINI_API_KEY=your_key` in `.env.local`.

### 1.2 Launch Development Server

```bash
npm run dev
```

Open your browser to [http://localhost:3000](http://localhost:3000).

---

## 2. Step-by-Step Evaluation Walkthrough

### Step 1: Landing Page (`/`)

1. Visit [http://localhost:3000](http://localhost:3000).
2. **Verify**:
   - Clear value proposition: "GenAI Event Planning Assistant".
   - Supported event types displayed prominently: **Weddings**, **Birthdays**, and **Community Events**.
   - Core value pillars highlighted: Integer-normalized Budgets, Reverse-Planned Timelines, Real Vendor Checklists, and Personalized Ideas.
   - Zero signup or authentication barrier: Direct **"Start Planning Free"** CTA button.
   - Theme toggle in the navigation bar: Click **"Dark"**, **"Contrast (7:1)"**, and **"Light"** to verify high-contrast WCAG 2.2 AA compliant modes.
3. Click **"Start Planning Free"** or navigate to `/plan`.

### Step 2: Planning Workspace Home (`/plan`)

1. On fresh launch (no plan stored), notice the **honest empty state**:
   - Heading: _"Welcome to PlanCraftX Workspace"_.
   - Explanatory copy indicating that no synthetic or fake plan was silently pre-loaded.
   - Primary action: **"Create Your First Event Plan"** CTA button.
2. Click **"Create Your First Event Plan"** to enter the multi-step event wizard.

### Step 3: Multi-Step Event Wizard (`/plan/event`)

1. **Step 1 — Basic Information**:
   - Select event type: **Wedding** (observe wedding-specific fields and milestone schedule guidance).
   - Enter title: `Sarah & Alex Autumn Wedding`.
   - Enter target date: select a date ~6-9 months in the future (e.g. `2026-11-20`).
   - Enter location: `Chicago, IL`.
   - Click **"Next Step →"**.
2. **Step 2 — Scale & Budget**:
   - Guest count: `120`.
   - Total budget: `25000` USD ($25,000.00).
   - Check **"Outdoor Event"** to enable live weather context in the assistant.
   - Click **"Next Step →"**.
3. **Step 3 — Preferences & Constraints**:
   - Theme / Cultural traditions: `Modern Classic Elegance`.
   - Target age demographic: `Adults (25-45)`.
   - Dietary requirements: `Vegetarian & gluten-free options`.
   - Accessibility accommodations: `Wheelchair ramp & quiet room`.
   - Event vision: `Intimate evening celebration with candlelight`.
   - Click **"Review Plan →"**.
4. **Step 4 — Review & Create**:
   - Inspect the complete parameters summary.
   - Click **"Create Event Plan"**.
   - The app computes integer minor-unit allocations, reverse-plans phase milestones, generates vendor checklists, and redirects to `/plan`.

### Step 4: Workspace Overview (`/plan`)

1. With the plan active, verify the workspace header displays:
   - Event badge: `WEDDING` • `2026-11-20` • `Chicago, IL` • `120 guests` • `Outdoor Event`.
   - Plan Title: `Sarah & Alex Autumn Wedding`.
   - Working **"✏️ Edit Event Details"** link to adjust parameters.
2. Verify the 6-pillar metrics grid:
   - **Budget Planner card**: Total budget ($25,000.00), total allocated, remaining balance, and direct navigation link.
   - **Timeline & Milestones card**: Milestone completion counter, progress percentage, next upcoming milestone.
   - **Vendor Checklist card**: Booked count, total categories, geocoded city location.
   - **Personalized Ideas card**: AI ideation studio link.
   - **Planning Assistant card**: Context-aware chat link.
   - **Export & Portability card**: JSON backup & print summary link.

### Step 5: Integer Minor-Unit Budget Planner (`/plan/budget`)

1. Navigate to `/plan/budget`.
2. **Verify mathematical invariants**:
   - Sum of allocated category amounts equals the total budget down to the exact penny (Hamilton-Hare largest-remainder method).
   - Zero floating-point drift or penny leaks.
3. **Interactive Budget Adjustments**:
   - Edit an allocated amount in any category.
   - Record an actual spent expense.
   - Verify remaining balance and category progress bar dynamically update.
4. **Currency Conversion**:
   - Select a different currency (e.g. `EUR` or `GBP`) to verify live Frankfurter exchange rate conversion.

### Step 6: Reverse-Planned Timeline & Holidays (`/plan/timeline`)

1. Navigate to `/plan/timeline`.
2. **Verify Reverse-Planned Milestones**:
   - Milestones are scheduled backwards from the event date (`2026-11-20`).
   - Notice public holiday clash indicators (queried via Nager.Date API).
3. **Interactive Milestone Status**:
   - Click milestone status buttons to toggle between **Pending**, **In Progress**, and **Completed**.
   - Filter milestones by status using the filter dropdown.
4. **Calendar Portability**:
   - Click **"📅 Export RFC 5545 Calendar (.ics)"**.
   - Download the `.ics` file and verify standard calendar import compatibility (75-octet folded lines, CRLF formatting).

### Step 7: Vendor Checklist & Real OSM Discovery (`/plan/vendors`)

1. Navigate to `/plan/vendors`.
2. **Event-Specific Taxonomies**:
   - Categories reflect wedding needs: _Venue & Ceremony_, _Catering & Bar_, _Photography_, _Floral & Decor_, _Music & Audio_.
   - Each category features practical questions to ask, contract reminders, and deposit tracking.
3. **Real OpenStreetMap Venue Discovery**:
   - Use the live OSM search widget to query real venues in `Chicago, IL`.
   - Notice proper OpenStreetMap contributors attribution badge.
   - Zero synthetic vendors or fake phone numbers.

### Step 8: Personalized Ideas Studio (`/plan/ideas`)

1. Navigate to `/plan/ideas`.
2. **Grounded Ideation**:
   - Click **"Stream New Ideas with Gemini"** (or observe clean configuration notice if no key).
   - Ideas respect event context: age group, dietary constraints (vegetarian/gluten-free), and accessibility requirements.
   - Streaming responses arrive via NDJSON with atomic line validation.

### Step 9: Context-Aware Planning Assistant (`/plan/assistant`)

1. Navigate to `/plan/assistant`.
2. **Context-Grounded Chat**:
   - The assistant has bounded access to your real event parameters, budget remaining, and timeline milestones.
   - Ask: _"What are the most urgent tasks for my wedding right now?"_
   - Ask: _"Can you suggest outdoor contingency plans in Chicago?"_ (Outdoor flag enables weather-awareness).
   - Test cancel/retry controls.

### Step 10: Export, Import & Portability (`/plan/export`)

1. Navigate to `/plan/export`.
2. **Export Data**:
   - Click **"Download Plan Backup (.json)"** to download the schema-validated plan envelope with SHA-256 checksum.
   - Click **"Print / Save PDF Summary"** to view print-optimized stylesheet.
3. **Import Data**:
   - Select the downloaded `.json` file.
   - Verify the schema validation preview and confirm restoration.

### Step 11: Privacy Transparency & Data Purge (`/settings/privacy`)

1. Navigate to `/settings/privacy`.
2. **Review Disclosures**:
   - Read the transparent data retention policy (100% client-side browser localStorage).
   - Review upstream API data transmission boundaries (no PII sent).
3. **Complete Purge**:
   - Click **"Delete All My Data"**.
   - Confirm the confirmation dialog.
   - Verify that localStorage is cleared and you are returned to the fresh empty workspace state at `/plan`.

---

## 3. Automated Verification Execution

Run all test suites locally to replicate CI pass results:

```bash
# 1. Full repository verification (Format, Lint, Typecheck, Hygiene, Vitest Coverage, Dependency Audit)
npm run verify

# 2. Cross-browser Playwright E2E Suite (Chromium, WebKit, Mobile Chrome, Mobile Safari)
npx playwright test --project=chromium --project=webkit --project="Mobile Chrome" --project="Mobile Safari"
```
