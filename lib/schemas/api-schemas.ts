import { z } from 'zod';
import { EVENT_TYPES } from './event-plan';

export const planGenerationRequestSchema = z.object({
  eventType: z.enum(EVENT_TYPES),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  location: z.string().min(1).max(150),
  guestCount: z.number().int().min(1).max(100000),
  totalBudgetMajor: z.number().nonnegative().max(100000000),
  currency: z
    .string()
    .length(3)
    .regex(/^[A-Z]{3}$/),
  isOutdoor: z.boolean().default(false),
  dietaryRequirements: z.string().max(500).optional(),
  accessibilityNeeds: z.string().max(500).optional(),
  priorities: z.string().max(500).optional(),
});
export type PlanGenerationRequest = z.infer<typeof planGenerationRequestSchema>;

export const aiBudgetProposalSchema = z.object({
  proportions: z.array(
    z.object({
      category: z.string().min(1),
      weight: z.number().positive(),
      rationale: z.string().optional(),
    }),
  ),
  rationaleSummary: z.string().optional(),
});
export type AIBudgetProposal = z.infer<typeof aiBudgetProposalSchema>;

export const aiMilestoneProposalSchema = z.object({
  milestones: z.array(
    z.object({
      phase: z.string().min(1),
      title: z.string().min(1),
      daysBeforeEvent: z.number().int(),
      description: z.string().optional(),
    }),
  ),
});
export type AIMilestoneProposal = z.infer<typeof aiMilestoneProposalSchema>;

export const ideasRequestSchema = z.object({
  eventType: z.enum(EVENT_TYPES),
  guestCount: z.number().int().positive(),
  location: z.string().min(1),
  isOutdoor: z.boolean().default(false),
  dietaryRequirements: z.string().optional(),
  accessibilityNeeds: z.string().optional(),
  themeOrVibe: z.string().optional(),
});
export type IdeasRequest = z.infer<typeof ideasRequestSchema>;

export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1).max(2000),
});
export type ChatMessage = z.infer<typeof chatMessageSchema>;

export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(30),
  eventContext: z.object({
    eventType: z.enum(EVENT_TYPES),
    eventDate: z.string(),
    location: z.string(),
    guestCount: z.number(),
    currency: z.string(),
    totalBudgetMinor: z.number(),
    isOutdoor: z.boolean(),
  }),
});
export type ChatRequest = z.infer<typeof chatRequestSchema>;

export const placesRequestSchema = z.object({
  query: z.string().min(2).max(100),
  location: z.string().min(2).max(100),
  limit: z.number().int().min(1).max(20).default(5),
});
export type PlacesRequest = z.infer<typeof placesRequestSchema>;

export const weatherRequestSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
export type WeatherRequest = z.infer<typeof weatherRequestSchema>;

export const holidaysRequestSchema = z.object({
  countryCode: z
    .string()
    .length(2)
    .regex(/^[A-Za-z]{2}$/),
  year: z.number().int().min(2020).max(2040),
});
export type HolidaysRequest = z.infer<typeof holidaysRequestSchema>;

export const currencyRatesRequestSchema = z.object({
  from: z
    .string()
    .length(3)
    .regex(/^[A-Z]{3}$/),
  to: z
    .string()
    .length(3)
    .regex(/^[A-Z]{3}$/),
});
export type CurrencyRatesRequest = z.infer<typeof currencyRatesRequestSchema>;

export const intakeRequestSchema = z.object({
  description: z.string().min(5).max(1000),
});
export type IntakeRequest = z.infer<typeof intakeRequestSchema>;

export const intakeResponseSchema = z.object({
  eventType: z.enum(EVENT_TYPES),
  title: z.string().min(1).max(100).optional(),
  guestCount: z.number().int().positive().max(100000),
  totalBudgetMajor: z.number().positive().max(100000000),
  currency: z
    .string()
    .length(3)
    .regex(/^[A-Z]{3}$/),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  location: z.string().min(1).max(150),
  isOutdoor: z.boolean(),
  priorities: z.string().max(500).optional(),
  dietaryRequirements: z.string().max(500).optional(),
});
export type IntakeResponse = z.infer<typeof intakeResponseSchema>;

export const quoteExtractRequestSchema = z.object({
  quoteText: z.string().min(10).max(4000),
  category: z.string().min(1),
  categoryBudgetMinor: z.number().int().nonnegative(),
});
export type QuoteExtractRequest = z.infer<typeof quoteExtractRequestSchema>;

export const quoteExtractResponseSchema = z.object({
  vendorName: z.string().nullable(),
  totalPriceMinor: z.number().int().nonnegative().nullable(),
  pricePerPersonMinor: z.number().int().nonnegative().nullable(),
  guestMinimum: z.number().int().positive().nullable(),
  advancePercent: z.number().int().min(0).max(100).nullable(),
  taxIncluded: z.boolean().nullable(),
  cancellationPolicy: z.string().nullable(),
  flags: z.array(z.string()),
  inquiryDraft: z.string().min(1),
  effectiveCostVsBudget: z.string().min(1),
});
export type QuoteExtractResponse = z.infer<typeof quoteExtractResponseSchema>;

export const explainTradeoffsRequestSchema = z.object({
  planTitle: z.string(),
  currency: z.string().length(3),
  totalBudgetMinor: z.number().int().positive(),
  allocatedMinor: z.number().int().positive(),
  overAmountMinor: z.number().int().positive(),
  options: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      impactMinor: z.number().int(),
      description: z.string(),
    }),
  ),
});
export type ExplainTradeoffsRequest = z.infer<typeof explainTradeoffsRequestSchema>;

export const explainTradeoffsResponseSchema = z.object({
  summary: z.string().min(1),
  explanations: z.array(
    z.object({
      optionId: z.string(),
      plainTextExplanation: z.string().min(1),
      pros: z.string(),
      cons: z.string(),
    }),
  ),
});
export type ExplainTradeoffsResponse = z.infer<typeof explainTradeoffsResponseSchema>;

export const planReviewRequestSchema = z.object({
  findings: z.array(
    z.object({
      priority: z.enum(['urgent', 'warning', 'suggestion']),
      title: z.string(),
      details: z.string(),
      recommendedAction: z.string(),
    }),
  ),
});
export type PlanReviewRequest = z.infer<typeof planReviewRequestSchema>;

export const planReviewResponseSchema = z.object({
  summary: z.string().min(1),
  actionSteps: z.array(z.string().min(1)).min(1).max(5),
});
export type PlanReviewResponse = z.infer<typeof planReviewResponseSchema>;

export const publicHolidaySchema = z.object({
  date: z.string(),
  name: z.string(),
});
export type PublicHoliday = z.infer<typeof publicHolidaySchema>;

export const osmPlaceSchema = z.object({
  osmId: z.string(),
  name: z.string(),
  displayName: z.string(),
  type: z.string(),
  category: z.string(),
  latitude: z.number(),
  longitude: z.number(),
});
export type OsmPlace = z.infer<typeof osmPlaceSchema>;

export const weatherDataSchema = z.object({
  maxTempC: z.number(),
  minTempC: z.number(),
  precipitationProbability: z.number(),
  weatherCode: z.number(),
  conditionSummary: z.string(),
});
export type WeatherData = z.infer<typeof weatherDataSchema>;
