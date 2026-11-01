import { z } from 'zod';

export const EVENT_TYPES = ['wedding', 'birthday', 'community'] as const;
export type EventType = (typeof EVENT_TYPES)[number];
export type EventTypeEnum = EventType;

export const VENDOR_STATUSES = ['to_contact', 'quoted', 'booked', 'paid'] as const;
export type VendorStatus = (typeof VENDOR_STATUSES)[number];
export type VendorStatusEnum = VendorStatus;

export const TIMELINE_STATUSES = ['pending', 'in_progress', 'completed'] as const;
export type TimelineStatus = (typeof TIMELINE_STATUSES)[number];
export type TimelineStatusEnum = TimelineStatus;

export const IDEA_CATEGORIES_ENUM = [
  'theme',
  'menu',
  'activity',
  'accessibility',
  'logistics',
] as const;
export type IdeaCategoryEnum = (typeof IDEA_CATEGORIES_ENUM)[number];

export const budgetItemSchema = z.object({
  id: z.string().min(1),
  category: z.string().min(1),
  allocatedMinor: z.number().int().nonnegative(),
  spentMinor: z.number().int().nonnegative().default(0),
  notes: z.string().optional(),
  isEstimate: z.boolean().default(true),
});
export type BudgetItem = z.infer<typeof budgetItemSchema>;

export const timelineItemSchema = z.object({
  id: z.string().min(1),
  phase: z.string().min(1),
  title: z.string().min(1),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  status: z.enum(TIMELINE_STATUSES).default('pending'),
  description: z.string().optional(),
  isEstimate: z.boolean().default(true),
});
export type TimelineItem = z.infer<typeof timelineItemSchema>;

export const vendorItemSchema = z.object({
  id: z.string().min(1),
  category: z.string().min(1),
  name: z.string().min(1),
  status: z.enum(VENDOR_STATUSES).default('to_contact'),
  estimatedCostMinor: z.number().int().nonnegative().optional(),
  contactInfo: z.string().optional(),
  notes: z.string().optional(),
  isEstimate: z.boolean().default(true),
  osmId: z.string().optional(),
});
export type VendorItem = z.infer<typeof vendorItemSchema>;

export const personalizedIdeaSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  category: z.enum(IDEA_CATEGORIES_ENUM),
  description: z.string().min(1),
  dietaryTags: z.array(z.string()).optional(),
  accessibilityNotes: z.string().optional(),
});
export type PersonalizedIdea = z.infer<typeof personalizedIdeaSchema>;

export const eventPlanSchema = z.object({
  id: z.string().min(1),
  schemaVersion: z.number().int().positive().default(1),
  title: z.string().min(1).max(100),
  eventType: z.enum(EVENT_TYPES),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  location: z.string().min(1).max(150),
  guestCount: z.number().int().positive(),
  totalBudgetMinor: z.number().int().nonnegative(),
  currency: z
    .string()
    .length(3)
    .regex(/^[A-Z]{3}$/),
  isOutdoor: z.boolean().default(false),
  dietaryRequirements: z.string().max(500).optional(),
  accessibilityNeeds: z.string().max(500).optional(),
  budgetItems: z.array(budgetItemSchema),
  timelineItems: z.array(timelineItemSchema),
  vendorItems: z.array(vendorItemSchema),
  ideas: z.array(personalizedIdeaSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type EventPlan = z.infer<typeof eventPlanSchema>;
