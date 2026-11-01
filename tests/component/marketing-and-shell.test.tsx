import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { cn } from '@/features/ui/cn';
import { ScrollReveal } from '@/features/ui/scroll-reveal';
import { GlobalHeader } from '@/features/ui/global-header';
import { MarketingFooter } from '@/features/ui/marketing-footer';
import { HeroSection } from '@/features/marketing/landing/hero-section';
import { FeatureSection } from '@/features/marketing/landing/feature-section';
import { AnalysisJourneySection } from '@/features/marketing/landing/analysis-journey-section';
import { CTASection } from '@/features/marketing/landing/cta-section';
import HowItWorksPage from '@/app/how-it-works/page';
import DeveloperPage from '@/app/developer/page';
import { SettingsModal } from '@/features/workspace/settings-modal';

// Mock next/navigation
const mockUsePathname = vi.fn(() => '/');
vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

describe('Marketing & Shell Design System Components', () => {
  describe('cn utility', () => {
    it('merges class strings, arrays, objects, and ignores falsy values', () => {
      expect(cn('base', false && 'hidden', true && 'block')).toBe('base block');
      expect(cn(['foo', 'bar'], { active: true, disabled: false })).toBe('foo bar active');
      expect(cn(undefined, null, '', 'valid')).toBe('valid');
    });
  });

  describe('ScrollReveal Component', () => {
    it('renders children with initial animation classes', () => {
      render(
        <ScrollReveal animation="custom-rise" delayMs={150}>
          <span>Revealed Content</span>
        </ScrollReveal>,
      );
      expect(screen.getByText('Revealed Content')).toBeDefined();
    });
  });

  describe('GlobalHeader Component', () => {
    it('renders PlanCraftX branding, navigation links, and launch workspace CTA', () => {
      render(<GlobalHeader />);
      expect(screen.getByLabelText('PlanCraftX home')).toBeDefined();
      expect(screen.getByRole('link', { name: 'Home' })).toBeDefined();
      expect(screen.getByRole('link', { name: 'How It Works' })).toBeDefined();
      expect(screen.getByRole('link', { name: 'Developer' })).toBeDefined();
      expect(screen.getByText('Launch Workspace')).toBeDefined();
    });

    it('correctly marks navigation links active even with trailing slashes in route', () => {
      mockUsePathname.mockReturnValue('/how-it-works/');
      const { unmount } = render(<GlobalHeader />);
      const howItWorksLink = screen.getByRole('link', { name: 'How It Works' });
      expect(howItWorksLink.className).toContain('bg-accent');
      unmount();

      mockUsePathname.mockReturnValue('/');
    });
  });

  describe('MarketingFooter Component', () => {
    it('renders newsletter subscription, public data disclosures, and links', () => {
      render(<MarketingFooter />);
      expect(screen.getByText(/Stay ahead on GenAI event intelligence standards/i)).toBeDefined();
      expect(screen.getByPlaceholderText('Enter your email')).toBeDefined();
      expect(screen.getByRole('button', { name: 'Subscribe' })).toBeDefined();
      expect(screen.getByText(/Strict Zero Synthetic Data Policy/i)).toBeDefined();
      expect(screen.getByText(/WCAG 2.2 AA Certified/i)).toBeDefined();
    });
  });

  describe('Landing HeroSection', () => {
    it('renders headline, action buttons, and simulated HUD copilot', () => {
      render(<HeroSection />);
      expect(screen.getByText('GenAI Event Planning Assistant')).toBeDefined();
      expect(screen.getByRole('link', { name: /Launch Planning Workspace/i })).toBeDefined();
      expect(screen.getByRole('link', { name: /Create New Event Directly/i })).toBeDefined();
      expect(screen.getByText(/PlanCraftX Engine v2.4/i)).toBeDefined();
      expect(screen.getByText(/Hamilton-Hare/i)).toBeDefined();
    });
  });

  describe('Landing FeatureSection', () => {
    it('renders three differentiated occasions and core assistant outcomes', () => {
      render(<FeatureSection />);
      expect(screen.getByText('Three Thoughtfully Differentiated Occasions')).toBeDefined();
      expect(screen.getByText('Weddings')).toBeDefined();
      expect(screen.getByText('Birthdays')).toBeDefined();
      expect(screen.getByText('Community Events')).toBeDefined();
      expect(screen.getByText('Core Assistant Outcomes')).toBeDefined();
      expect(screen.getByText('Integer-Normalized Budgets')).toBeDefined();
      expect(screen.getByText('Reverse-Planned Timelines')).toBeDefined();
    });
  });

  describe('Landing AnalysisJourneySection', () => {
    it('renders all 4 steps and updates active step on click', () => {
      render(<AnalysisJourneySection />);
      expect(screen.getByText(/From celebration concept to reality in 4 steps/i)).toBeDefined();
      expect(screen.getByText('Step 01')).toBeDefined();
      expect(screen.getByText('Step 02')).toBeDefined();
      expect(screen.getByText('Step 03')).toBeDefined();
      expect(screen.getByText('Step 04')).toBeDefined();

      // Click step 2
      const step2Btn = screen.getByRole('button', { name: /Budget & Hamilton-Hare Allocation/i });
      fireEvent.click(step2Btn);
      expect(screen.getByText(/Uses the Hamilton-Hare largest-remainder method/i)).toBeDefined();

      // Click step 3
      const step3Btn = screen.getByRole('button', { name: /Reverse-Planned Timeline/i });
      fireEvent.click(step3Btn);
      expect(screen.getByText(/Nager.Date public holiday detection/i)).toBeDefined();
    });
  });

  describe('Landing CTASection', () => {
    it('renders call to action headline and workspace link', () => {
      render(<CTASection />);
      expect(screen.getByText(/Master the celebration/i)).toBeDefined();
      expect(screen.getByRole('link', { name: /Launch PlanCraftX Workspace/i })).toBeDefined();
    });
  });

  describe('HowItWorksPage Component', () => {
    it('renders architecture hero, core pillars, and governance standards consistent with ClauseIQX design system', () => {
      render(<HowItWorksPage />);
      expect(screen.getByText('System Architecture')).toBeDefined();
      expect(screen.getByText(/Core Technical Pillars of the Platform/i)).toBeDefined();
      expect(screen.getByText('Hamilton-Hare Integer Budgeting')).toBeDefined();
      expect(screen.getByText('Reverse-Planned Milestones & Holidays')).toBeDefined();
      expect(screen.getByText('Zero-Knowledge Storage & Privacy')).toBeDefined();
      expect(screen.getByText('Live Open-Meteo Weather Grounding')).toBeDefined();
      expect(screen.getByText('Enterprise Governance & Open Data Standards')).toBeDefined();
      expect(
        screen.getAllByText(/Strict Zero Synthetic Data Policy/i).length,
      ).toBeGreaterThanOrEqual(1);
    });
  });

  describe('DeveloperPage Component', () => {
    it('renders architect profile, avatar, background, vital stats, and technical arsenal matching ClauseIQX', () => {
      render(<DeveloperPage />);
      expect(screen.getByText('Meet the Architect')).toBeDefined();
      expect(screen.getByAltText('Developer Avatar')).toBeDefined();
      expect(screen.getByText('Background & Vision')).toBeDefined();
      expect(screen.getByText('Vital Stats')).toBeDefined();
      expect(screen.getByText('New Delhi, India')).toBeDefined();
      expect(screen.getByText('Technical Arsenal')).toBeDefined();
      expect(screen.getByText('Languages & Core')).toBeDefined();
      expect(screen.getByText('Frameworks & Web')).toBeDefined();
    });
  });

  describe('Workspace SettingsModal Component', () => {
    it('renders modal overlay, categories, license info, and closes when close button is clicked', () => {
      const handleClose = vi.fn();
      const { rerender } = render(<SettingsModal isOpen={false} onClose={handleClose} />);
      expect(screen.queryByRole('dialog')).toBeNull();

      rerender(<SettingsModal isOpen={true} onClose={handleClose} />);
      expect(screen.getByRole('dialog')).toBeDefined();
      expect(screen.getByText('Workspace Settings')).toBeDefined();
      expect(screen.getByText('Account & Profile')).toBeDefined();
      expect(screen.getByText('Privacy & Data')).toBeDefined();
      expect(screen.getByText('Security & Access')).toBeDefined();
      expect(screen.getByText('Appearance & Theme')).toBeDefined();
      expect(screen.getByText('Enterprise Pro Unlimited')).toBeDefined();

      // Click Privacy & Data tab
      fireEvent.click(screen.getByRole('button', { name: /Privacy & Data/i }));
      expect(screen.getByText('Local Only Data Processing')).toBeDefined();

      // Click Close
      fireEvent.click(screen.getByLabelText('Close settings modal'));
      expect(handleClose).toHaveBeenCalled();
    });
  });
});
