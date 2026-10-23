import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PlanCraft - GenAI Event Planning Assistant',
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
            <div className="flex items-center space-x-3">
              <span className="text-primary text-xl font-bold tracking-tight">PlanCraft</span>
              <span className="bg-surface-elevated text-muted rounded-full px-2.5 py-0.5 text-xs font-semibold">
                GenAI Planning Assistant
              </span>
            </div>
            <nav aria-label="Main Navigation">
              <ul className="flex items-center space-x-4 text-sm font-medium">
                <li>
                  <a href="#about" className="hover:text-primary">
                    About
                  </a>
                </li>
                <li>
                  <a href="#privacy" className="hover:text-primary">
                    Privacy
                  </a>
                </li>
              </ul>
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
          <div className="mx-auto max-w-7xl px-4">
            <p>
              PlanCraft Assistant • Built with official Google GenAI SDK & Open Public Data
              (Open-Meteo, Nager.Date, Frankfurter, OpenStreetMap).
            </p>
            <p className="mt-1">
              Strict Zero Synthetic Data Policy • Accessible WCAG 2.2 AA compliant.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
