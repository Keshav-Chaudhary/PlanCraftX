'use client';

import React from 'react';
import { HeroSection } from '@/features/marketing/landing/hero-section';
import { FeatureSection } from '@/features/marketing/landing/feature-section';
import { AnalysisJourneySection } from '@/features/marketing/landing/analysis-journey-section';
import { CTASection } from '@/features/marketing/landing/cta-section';
import { MarketingFooter } from '@/features/ui/marketing-footer';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <HeroSection />
      <FeatureSection />
      <AnalysisJourneySection />
      <CTASection />
      <MarketingFooter />
    </div>
  );
}
