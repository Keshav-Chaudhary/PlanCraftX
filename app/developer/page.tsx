import type { Metadata } from 'next';
import Image from 'next/image';
import { Code2, GraduationCap, MapPin, Cpu } from 'lucide-react';
import { ScrollReveal } from '@/features/ui/scroll-reveal';
import { MarketingFooter } from '@/features/ui/marketing-footer';

export const metadata: Metadata = {
  title: 'About the Architecture — PlanCraftX',
  description:
    'Meet the lead architect and engineering team behind PlanCraftX celebration intelligence.',
};

const SKILLS = [
  {
    category: 'Languages & Core',
    items: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'SQL'],
  },
  {
    category: 'Frameworks & Web',
    items: ['Next.js 16', 'React 19', 'Node.js', 'Tailwind CSS', 'Express', 'REST APIs'],
  },
  {
    category: 'AI & Event Core',
    items: [
      'Hamilton-Hare Normalization',
      'Reverse Milestone Engines',
      'RFC 5545 iCalendar',
      'Deterministic Telemetry',
    ],
  },
];

export default function DeveloperPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header section with radial background */}
      <section className="relative overflow-hidden border-b border-[var(--border)] bg-[radial-gradient(ellipse_at_top_right,_var(--accent-subtle),_transparent_50%),radial-gradient(ellipse_at_bottom_left,_var(--accent-subtle),_transparent_50%)]">
        <div className="absolute top-0 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[var(--accent)] opacity-5 blur-[100px]" />

        <div className="custom-fade-in mx-auto max-w-5xl px-4 pt-28 pb-20 text-center lg:px-8">
          <p className="mb-6 text-sm font-black tracking-[0.2em] text-[var(--accent)] uppercase drop-shadow-xs">
            Meet the Architect
          </p>
          <div className="group relative mx-auto mb-6 flex justify-center">
            <div className="from-accent to-positive absolute -inset-0.5 rounded-full bg-gradient-to-r opacity-50 blur transition duration-300 group-hover:opacity-75" />
            <Image
              src="/developer_avatar.png"
              alt="Developer Avatar"
              width={128}
              height={128}
              unoptimized
              className="bg-surface relative size-32 rounded-full border-2 border-[var(--border-strong)] object-cover shadow-lg"
            />
          </div>
          <h1 className="text-fg text-4xl font-extrabold tracking-tight text-balance lg:text-6xl">
            The <span className="text-[var(--accent)]">Developer</span>
          </h1>
          <p className="text-fg-muted mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-pretty">
            Engineering student at a premium institute in Delhi, India. Lead Architect & Developer
            of PlanCraftX, specializing in building privacy-first celebration intelligence
            applications, interactive full-stack architectures, and AI-grounded event telemetry
            engines.
          </p>
        </div>
      </section>

      {/* Main Content Layout - Bento Box Grid */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Card 1: Core Profile Info */}
          <ScrollReveal
            delayMs={100}
            className="group bg-surface-2 relative overflow-hidden rounded-3xl border border-[var(--border-faint)] p-8 shadow-[var(--shadow-sm)] transition-all hover:border-[var(--accent-line)] md:col-span-2"
          >
            <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[var(--accent-subtle)] blur-[40px]" />
            <div className="mb-6 flex items-center gap-3">
              <span className="bg-surface-3 text-fg flex size-10 items-center justify-center rounded-xl border border-[var(--border)]">
                <GraduationCap className="size-5 text-[var(--accent)]" />
              </span>
              <h2 className="text-fg text-xl font-bold">Background & Vision</h2>
            </div>
            <p className="text-fg-muted mb-4 leading-relaxed">
              Currently an engineering student at a premium institute in Delhi, India. My research
              interests lie at the intersection of web frameworks, celebration technology, and
              deterministic AI parsing systems.
            </p>
            <p className="text-fg-muted leading-relaxed">
              In building PlanCraftX, my priority was creating a highly interactive interface that
              remains completely transparent. By combining grounded public open data with
              penny-accurate Hamilton-Hare allocation algorithms, we provide users with
              high-integrity event master plans that never hallucinate or compromise user privacy.
            </p>
          </ScrollReveal>

          {/* Card 2: Quick Specs (Education/Location) */}
          <ScrollReveal
            delayMs={200}
            className="group bg-surface-2 relative overflow-hidden rounded-3xl border border-[var(--border-faint)] p-8 shadow-[var(--shadow-sm)] transition-all hover:border-[var(--accent-line)]"
          >
            <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[var(--accent-subtle)] blur-[40px]" />
            <div className="mb-6 flex items-center gap-3">
              <span className="bg-surface-3 text-fg flex size-10 items-center justify-center rounded-xl border border-[var(--border)]">
                <MapPin className="size-5 text-[var(--accent)]" />
              </span>
              <h2 className="text-fg text-xl font-bold">Vital Stats</h2>
            </div>

            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3">
                <MapPin className="text-fg-subtle mt-1 size-4 shrink-0" />
                <div>
                  <h4 className="text-fg text-sm font-bold">Location</h4>
                  <p className="text-fg-muted text-xs">New Delhi, India</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <GraduationCap className="text-fg-subtle mt-1 size-4 shrink-0" />
                <div>
                  <h4 className="text-fg text-sm font-bold">Education</h4>
                  <p className="text-fg-muted text-xs">Engineering Institute, Delhi</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Cpu className="text-fg-subtle mt-1 size-4 shrink-0" />
                <div>
                  <h4 className="text-fg text-sm font-bold">Core Focus</h4>
                  <p className="text-fg-muted text-xs">Full-Stack, Event Telemetry & AI Engines</p>
                </div>
              </li>
            </ul>
          </ScrollReveal>

          {/* Card 3: Skills & Tech Arsenal */}
          <ScrollReveal
            delayMs={300}
            className="group bg-surface-2 relative overflow-hidden rounded-3xl border border-[var(--border-faint)] p-8 shadow-[var(--shadow-sm)] transition-all hover:border-[var(--accent-line)] md:col-span-3"
          >
            <div className="mb-8 flex items-center gap-3">
              <span className="bg-surface-3 text-fg flex size-10 items-center justify-center rounded-xl border border-[var(--border)]">
                <Code2 className="size-5 text-[var(--accent)]" />
              </span>
              <h2 className="text-fg text-xl font-bold">Technical Arsenal</h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {SKILLS.map((skillGroup) => (
                <div
                  key={skillGroup.category}
                  className="bg-surface rounded-2xl border border-[var(--border-faint)] px-5 py-4"
                >
                  <h3 className="mb-3 text-xs font-bold tracking-widest text-[var(--accent)] uppercase">
                    {skillGroup.category}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {skillGroup.items.map((item) => (
                      <span
                        key={item}
                        className="bg-surface-2 text-fg rounded-md border border-[var(--border-faint)] px-2 py-1 text-xs font-medium"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <MarketingFooter />
    </div>
  );
}
