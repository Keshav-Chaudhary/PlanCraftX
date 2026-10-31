import { chromium } from '@playwright/test';
import path from 'path';

const targetDir = process.argv[2] || 'before';
const outDir = path.resolve(process.cwd(), 'docs', 'frontend-evidence', targetDir);

const routes = [
  { path: '/', name: '01-landing' },
  { path: '/plan', name: '02-workspace-empty', setupEmpty: true },
  { path: '/plan', name: '02-workspace-populated', setupPlan: true },
  { path: '/plan/event', name: '03-event-creation' },
  { path: '/plan/budget', name: '04-budget-planner', setupPlan: true },
  { path: '/plan/timeline', name: '05-timeline-milestones', setupPlan: true },
  { path: '/plan/vendors', name: '06-vendor-checklist', setupPlan: true },
  { path: '/plan/ideas', name: '07-ai-ideas', setupPlan: true },
  { path: '/plan/assistant', name: '08-ai-assistant', setupPlan: true },
  { path: '/plan/export', name: '09-export-portability', setupPlan: true },
  { path: '/settings/privacy', name: '10-privacy-settings' },
];

const MOCK_PLAN = {
  id: 'plan-test-audit',
  schemaVersion: 1,
  title: 'Priya & Arjun Shaadi',
  eventType: 'wedding',
  eventDate: '2026-11-25',
  location: 'Pune, Maharashtra',
  guestCount: 220,
  totalBudgetMinor: 150000000,
  currency: 'INR',
  isOutdoor: false,
  dietaryRequirements: 'Vegetarian and Jain counters required',
  accessibilityNeeds: 'Wheelchair access at reception hall entrance',
  budgetItems: [
    {
      id: 'b-1',
      category: 'Catering & Food',
      allocatedMinor: 52500000,
      spentMinor: 20000000,
      isEstimate: true,
    },
    {
      id: 'b-2',
      category: 'Venue & Staging',
      allocatedMinor: 30000000,
      spentMinor: 30000000,
      isEstimate: false,
    },
    {
      id: 'b-3',
      category: 'Decor & Florals',
      allocatedMinor: 18000000,
      spentMinor: 5000000,
      isEstimate: true,
    },
    {
      id: 'b-4',
      category: 'Photography & Film',
      allocatedMinor: 15000000,
      spentMinor: 0,
      isEstimate: true,
    },
    {
      id: 'b-5',
      category: 'Music & Sound',
      allocatedMinor: 12000000,
      spentMinor: 0,
      isEstimate: true,
    },
    {
      id: 'b-6',
      category: 'Attire & Makeup',
      allocatedMinor: 7500000,
      spentMinor: 0,
      isEstimate: true,
    },
    {
      id: 'b-7',
      category: 'Contingency Reserve',
      allocatedMinor: 15000000,
      spentMinor: 0,
      isEstimate: true,
    },
  ],
  timelineItems: [
    {
      id: 't-1',
      phase: 'Booking',
      title: 'Confirm Reception Venue',
      dueDate: '2026-06-15',
      status: 'completed',
      isEstimate: false,
    },
    {
      id: 't-2',
      phase: 'Shortlisting',
      title: 'Shortlist Master Caterer',
      dueDate: '2026-07-20',
      status: 'completed',
      isEstimate: false,
    },
    {
      id: 't-3',
      phase: 'Design',
      title: 'Finalize Stage Decor Theme',
      dueDate: '2026-09-10',
      status: 'pending',
      isEstimate: true,
    },
    {
      id: 't-4',
      phase: 'Invites',
      title: 'Send Wedding Invitations',
      dueDate: '2026-10-01',
      status: 'pending',
      isEstimate: true,
    },
    {
      id: 't-5',
      phase: 'Execution',
      title: 'Final Venue Handover',
      dueDate: '2026-11-24',
      status: 'pending',
      isEstimate: true,
    },
  ],
  vendorItems: [
    {
      id: 'v-1',
      category: 'Venue',
      name: 'Grand Heritage Pavilion',
      status: 'booked',
      estimatedCostMinor: 30000000,
      contactInfo: '+91 98220 12345',
      isEstimate: false,
    },
    {
      id: 'v-2',
      category: 'Catering',
      name: 'Royal Caterers Pune',
      status: 'quoted',
      estimatedCostMinor: 52500000,
      contactInfo: 'sales@royalcaterers.example',
      notes: 'Per plate quote received',
      isEstimate: true,
    },
    {
      id: 'v-3',
      category: 'Photography',
      name: 'Candid Moments Studio',
      status: 'to_contact',
      contactInfo: 'Pune, FC Road',
      isEstimate: true,
    },
  ],
  ideas: [
    {
      id: 'i-1',
      category: 'theme',
      title: 'Regal Marigold & Sandalwood',
      description: 'Warm sunset palette with brass urlis and traditional live shehnai.',
    },
    {
      id: 'i-2',
      category: 'menu',
      title: 'Live Chat & Mithai Counters',
      description: 'Authentic Maharashtrian street food corner alongside North Indian buffet.',
    },
  ],
  createdAt: '2026-01-15T10:00:00.000Z',
  updatedAt: '2026-01-15T10:00:00.000Z',
};

async function run() {
  const browser = await chromium.launch();

  // Desktop
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await desktopContext.newPage();

  for (const r of routes) {
    if (r.setupPlan) {
      await page.goto('http://localhost:3000');
      await page.evaluate((plan) => {
        localStorage.setItem('PlanCraftX_current_plan', JSON.stringify(plan));
      }, MOCK_PLAN);
    } else if (r.setupEmpty) {
      await page.goto('http://localhost:3000');
      await page.evaluate(() => {
        localStorage.removeItem('PlanCraftX_current_plan');
      });
    }

    await page.goto(`http://localhost:3000${r.path}`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(outDir, `${r.name}-desktop.png`), fullPage: true });
    console.log(`Captured ${r.name}-desktop.png`);
  }

  // Mobile
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 812 },
    isMobile: true,
  });
  const mobilePage = await mobileContext.newPage();

  for (const r of routes.slice(0, 5)) {
    if (r.setupPlan) {
      await mobilePage.goto('http://localhost:3000');
      await mobilePage.evaluate((plan) => {
        localStorage.setItem('PlanCraftX_current_plan', JSON.stringify(plan));
      }, MOCK_PLAN);
    }
    await mobilePage.goto(`http://localhost:3000${r.path}`);
    await mobilePage.waitForLoadState('networkidle');
    await mobilePage.screenshot({
      path: path.join(outDir, `${r.name}-mobile.png`),
      fullPage: false,
    });
    console.log(`Captured ${r.name}-mobile.png`);
  }

  await browser.close();
  console.log('Capture completed successfully.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
