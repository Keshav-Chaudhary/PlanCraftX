import type { Metadata } from 'next';
import Link from 'next/link';
import { ThemeToggle } from '@/features/theme-toggle';
import './globals.css';

export const metadata: Metadata = {
  title: 'PlanCraftX - GenAI Event Planning Assistant',
  description:
    'Organize weddings, birthdays, and community events with AI-driven budgets, timelines, vendor checklists, and personalized ideas.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light">
      <body className="flex min-h-screen flex-col antialiased">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <header className="border-border bg-surface border-b px-4 py-3 sm:px-8" role="banner">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <Link href="/" className="text-decoration-none flex items-center space-x-3">
              <span className="text-primary text-xl font-bold tracking-tight">PlanCraftX</span>
              <span className="bg-surface-elevated text-muted rounded-full px-2.5 py-0.5 text-xs font-semibold">
                GenAI Planning Assistant
              </span>
            </Link>
            <nav aria-label="Main Navigation" className="flex items-center space-x-4">
              <ul className="flex items-center space-x-4 text-sm font-medium">
                <li>
                  <Link href="/" className="hover:text-primary transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/plan"
                    className="hover:text-primary transition-colors"
                    id="nav-workspace-link"
                  >
                    Workspace
                  </Link>
                </li>
                <li>
                  <Link
                    href="/settings/privacy"
                    className="hover:text-primary transition-colors"
                    id="nav-privacy-link"
                  >
                    Privacy
                  </Link>
                </li>
              </ul>
              <div className="border-border border-l pl-3">
                <ThemeToggle />
              </div>
            </nav>
          </div>
        </header>

        <main id="main-content" className="flex-1 px-4 py-8 sm:px-8" tabIndex={-1} role="main">
          {children}
        </main>

        <footer
          className="border-border bg-surface text-muted border-t py-6 text-center text-xs"
          role="contentinfo"
        >
          <div className="mx-auto max-w-7xl space-y-2 px-4">
            <p>
              PlanCraftX Assistant • Built with official Google GenAI SDK & Open Public Data
              (Open-Meteo, Nager.Date, Frankfurter, OpenStreetMap).
            </p>
            <p>Strict Zero Synthetic Data Policy • Accessible WCAG 2.2 AA compliant.</p>
            <div className="flex justify-center space-x-4 pt-1">
              <Link href="/plan" className="hover:underline">
                Planning Workspace
              </Link>
              <span>•</span>
              <Link href="/settings/privacy" className="hover:underline">
                Privacy Policy & Data Controls
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
