import type { Metadata } from 'next';
import { Outfit, Geist_Mono } from 'next/font/google';
import { GlobalHeader } from '@/features/ui/global-header';
import './globals.css';

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

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
    <html
      lang="en"
      data-theme="dark"
      className={`${outfit.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          id="theme-initializer"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('PlanCraftX_theme');if(!t){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`,
          }}
        />
      </head>
      <body className="bg-bg text-fg flex min-h-screen flex-col font-sans antialiased">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <GlobalHeader />

        <main id="main-content" className="flex-1" tabIndex={-1} role="main">
          {children}
        </main>
      </body>
    </html>
  );
}
