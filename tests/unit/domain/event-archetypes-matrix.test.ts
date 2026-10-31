import { describe, it, expect } from 'vitest';
import {
  EVENT_TYPES,
  EVENT_CATEGORIES,
  TIMELINE_PHASES,
  PHASE_IDEAL_LEAD_DAYS,
  type EventType,
} from '../../../lib/domain/event-rules';
import { generateEventDayRunsheet } from '../../../lib/domain/runsheet';

describe('Event Archetypes Matrix & Domain Differentiation', () => {
  describe('Three Required Problem Statement Archetypes', () => {
    it('supports wedding, birthday, and community event types', () => {
      expect(EVENT_TYPES).toContain('wedding');
      expect(EVENT_TYPES).toContain('birthday');
      expect(EVENT_TYPES).toContain('community');
      expect(EVENT_TYPES).toHaveLength(3);
    });
  });

  describe('Taxonomy Differentiation per Occasion', () => {
    it.each(EVENT_TYPES)('defines exactly 9 categories for %s', (type: EventType) => {
      const cats = EVENT_CATEGORIES[type];
      expect(cats).toHaveLength(9);
      const uniqueCats = new Set(cats);
      expect(uniqueCats.size).toBe(9);
    });

    it('includes marriage licensing and officiant categories exclusively for wedding', () => {
      expect(EVENT_CATEGORIES.wedding).toContain('Officiant & Legal Formalities');
      expect(EVENT_CATEGORIES.birthday).not.toContain('Officiant & Legal Formalities');
      expect(EVENT_CATEGORIES.community).not.toContain('Officiant & Legal Formalities');
    });

    it('includes cake & dessert categories exclusively for birthday', () => {
      expect(EVENT_CATEGORIES.birthday).toContain('Cake & Dessert');
      expect(EVENT_CATEGORIES.birthday).toContain('Party Favors & Gifts');
      expect(EVENT_CATEGORIES.wedding).not.toContain('Cake & Dessert');
      expect(EVENT_CATEGORIES.community).not.toContain('Cake & Dessert');
    });

    it('includes municipal permits and public safety exclusively for community festival', () => {
      expect(EVENT_CATEGORIES.community).toContain('Permits & Municipal Licensing');
      expect(EVENT_CATEGORIES.community).toContain('Public Safety & First Aid');
      expect(EVENT_CATEGORIES.community).toContain('Insurance & Accessibility');
      expect(EVENT_CATEGORIES.wedding).not.toContain('Permits & Municipal Licensing');
      expect(EVENT_CATEGORIES.birthday).not.toContain('Permits & Municipal Licensing');
    });
  });

  describe('Timeline Lead Horizons per Occasion', () => {
    it('assigns 270-day horizon for wedding planning', () => {
      expect(PHASE_IDEAL_LEAD_DAYS.wedding[0]).toBe(270);
      expect(TIMELINE_PHASES.wedding).toHaveLength(6);
    });

    it('assigns 60-day horizon for birthday planning', () => {
      expect(PHASE_IDEAL_LEAD_DAYS.birthday[0]).toBe(60);
      expect(TIMELINE_PHASES.birthday).toHaveLength(5);
    });

    it('assigns 120-day horizon for community festival planning', () => {
      expect(PHASE_IDEAL_LEAD_DAYS.community[0]).toBe(120);
      expect(TIMELINE_PHASES.community).toHaveLength(6);
    });

    it('anchors event day (0) for all event types', () => {
      expect(PHASE_IDEAL_LEAD_DAYS.wedding).toContain(0);
      expect(PHASE_IDEAL_LEAD_DAYS.birthday).toContain(0);
      expect(PHASE_IDEAL_LEAD_DAYS.community).toContain(0);
    });
  });

  describe('Event-Day Runsheet Generator', () => {
    it('generates 9 wedding day runsheet milestones', () => {
      const runsheet = generateEventDayRunsheet('wedding');
      expect(runsheet).toHaveLength(9);
      expect(runsheet[0]?.activity).toContain('Hair, Makeup');
      expect(runsheet[4]?.activity).toContain('Ceremony Processional');
      expect(runsheet[8]?.activity).toContain('Grand Send-Off');
    });

    it('generates 7 birthday runsheet milestones', () => {
      const runsheet = generateEventDayRunsheet('birthday');
      expect(runsheet).toHaveLength(7);
      expect(runsheet[0]?.activity).toContain('Setup');
      const cakeMilestone = runsheet.find((r) => r.activity.toLowerCase().includes('cake'));
      expect(cakeMilestone).toBeDefined();
    });

    it('generates 7 community festival runsheet milestones', () => {
      const runsheet = generateEventDayRunsheet('community');
      expect(runsheet).toHaveLength(7);
      expect(runsheet[0]?.activity).toContain('Site Marshalling');
      const gateMilestone = runsheet.find((r) => r.activity.toLowerCase().includes('gates'));
      expect(gateMilestone).toBeDefined();
    });

    it('ensures all runsheet times are formatted as HH:MM', () => {
      const weddingTimes = generateEventDayRunsheet('wedding').map((r) => r.time);
      for (const time of weddingTimes) {
        expect(time).toMatch(/^\d{2}:\d{2}$/);
      }
    });
  });
});
