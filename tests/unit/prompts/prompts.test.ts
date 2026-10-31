import { describe, it, expect } from 'vitest';
import {
  buildBudgetProposalPrompt,
  buildMilestonesPrompt,
  buildIdeasPrompt,
  buildChatSystemPrompt,
  SYSTEM_SAFETY_PREAMBLE,
} from '../../../lib/prompts/planning-prompts';

describe('Planning Prompt Generators', () => {
  it('includes safety preamble and user parameters in budget proposal prompt', () => {
    const prompt = buildBudgetProposalPrompt({
      eventType: 'wedding',
      eventDate: '2026-09-18',
      location: 'Boston, MA',
      guestCount: 120,
      totalBudgetMajor: 30000,
      currency: 'USD',
      isOutdoor: false,
      dietaryRequirements: 'Vegetarian',
      accessibilityNeeds: 'Wheelchair',
      priorities: 'Photography',
    });

    expect(prompt).toContain(SYSTEM_SAFETY_PREAMBLE);
    expect(prompt).toContain('<user_data>');
    expect(prompt).toContain('EventType: wedding');
    expect(prompt).toContain('Location: Boston, MA');
    expect(prompt).toContain('TotalBudget: 30000 USD');
    expect(prompt).toContain('DietaryRequirements: Vegetarian');
  });

  it('generates milestones prompt with event details', () => {
    const prompt = buildMilestonesPrompt({
      eventType: 'birthday',
      eventDate: '2026-05-10',
      location: 'Chicago, IL',
      guestCount: 30,
      totalBudgetMajor: 1500,
      currency: 'USD',
      isOutdoor: true,
    });

    expect(prompt).toContain('EventType: birthday');
    expect(prompt).toContain('IsOutdoor: Yes');
  });

  it('generates ideas prompt with dietary and accessibility tags', () => {
    const prompt = buildIdeasPrompt({
      eventType: 'community',
      guestCount: 200,
      location: 'Austin, TX',
      isOutdoor: true,
      dietaryRequirements: 'Halal',
      accessibilityNeeds: 'ASL Interpreter',
      themeOrVibe: 'Eco-Friendly',
    });

    expect(prompt).toContain('EventType: community');
    expect(prompt).toContain('DietaryRequirements: Halal');
    expect(prompt).toContain('AccessibilityNeeds: ASL Interpreter');
    expect(prompt).toContain('ThemeOrVibe: Eco-Friendly');
  });

  it('generates chat system prompt with active context', () => {
    const prompt = buildChatSystemPrompt({
      eventType: 'wedding',
      eventDate: '2026-09-18',
      location: 'Boston, MA',
      guestCount: 120,
      currency: 'USD',
      totalBudgetMinor: 3000000,
      isOutdoor: false,
    });

    expect(prompt).toContain('EventType: wedding');
    expect(prompt).toContain('TotalBudgetMinor: 3000000');
  });

  it('covers fallback defaults and isOutdoor branches across all generators', () => {
    // Budget proposal without optional fields and isOutdoor true
    const p1 = buildBudgetProposalPrompt({
      eventType: 'birthday',
      eventDate: '2026-06-01',
      location: 'Miami, FL',
      guestCount: 20,
      totalBudgetMajor: 2000,
      currency: 'USD',
      isOutdoor: true,
    });
    expect(p1).toContain('IsOutdoor: Yes');
    expect(p1).toContain('DietaryRequirements: None');
    expect(p1).toContain('AccessibilityNeeds: None');
    expect(p1).toContain('Priorities: Standard balanced distribution');

    // Milestones with isOutdoor false
    const p2 = buildMilestonesPrompt({
      eventType: 'wedding',
      eventDate: '2026-07-01',
      location: 'Dallas, TX',
      guestCount: 50,
      totalBudgetMajor: 10000,
      currency: 'USD',
      isOutdoor: false,
    });
    expect(p2).toContain('IsOutdoor: No');

    // Ideas with isOutdoor false and missing optional fields
    const p3 = buildIdeasPrompt({
      eventType: 'wedding',
      guestCount: 80,
      location: 'New York, NY',
      isOutdoor: false,
    });
    expect(p3).toContain('IsOutdoor: No');
    expect(p3).toContain('DietaryRequirements: None');
    expect(p3).toContain('AccessibilityNeeds: None');
    expect(p3).toContain('ThemeOrVibe: Open to creative suggestions');

    // Chat system prompt with isOutdoor true
    const p4 = buildChatSystemPrompt({
      eventType: 'community',
      eventDate: '2026-08-01',
      location: 'Portland, OR',
      guestCount: 100,
      currency: 'USD',
      totalBudgetMinor: 500000,
      isOutdoor: true,
    });
    expect(p4).toContain('IsOutdoor: Yes');
  });
});
