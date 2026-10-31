/**
 * Pure domain logic for plan serialization, strict schema validation,
 * file size enforcement, version migrations, and storage parsing.
 */

import { type EventPlan, eventPlanSchema } from '../schemas/event-plan';
import { type Result, ok, err } from '../result/result';
import { majorToMinor } from './budget-math';

export const MAX_IMPORT_FILE_SIZE_BYTES = 1_048_576; // 1 MB limit

export interface StorageError {
  readonly code:
    | 'FILE_TOO_LARGE'
    | 'INVALID_JSON'
    | 'VALIDATION_FAILED'
    | 'UNSUPPORTED_VERSION'
    | 'CORRUPTED_INVARIANTS';
  readonly message: string;
}

export const CURRENT_SCHEMA_VERSION = 1;

interface RawV0Plan {
  readonly id?: string;
  readonly title?: string;
  readonly eventType?: string;
  readonly eventDate?: string;
  readonly location?: string;
  readonly guestCount?: number;
  readonly totalBudget?: number; // V0 used major units instead of minor
  readonly totalBudgetMinor?: number;
  readonly currency?: string;
  readonly isOutdoor?: boolean;
  readonly budgetItems?: Array<{
    id?: string;
    category?: string;
    allocated?: number;
    allocatedMinor?: number;
    spent?: number;
    spentMinor?: number;
    notes?: string;
  }>;
  readonly timelineItems?: unknown[];
  readonly vendorItems?: unknown[];
  readonly ideas?: unknown[];
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

/**
 * Migrates a legacy V0 raw object (where budget was in major units) to V1 schema.
 */
function migrateV0ToV1(raw: RawV0Plan): Record<string, unknown> {
  const currency = typeof raw.currency === 'string' ? raw.currency.toUpperCase() : 'USD';
  let totalMinor = 0;
  if (typeof raw.totalBudgetMinor === 'number') {
    totalMinor = raw.totalBudgetMinor;
  } else if (typeof raw.totalBudget === 'number') {
    totalMinor = majorToMinor(raw.totalBudget, currency);
  }

  const budgetItems = Array.isArray(raw.budgetItems)
    ? raw.budgetItems.map((item, idx) => {
        let allocMinor = 0;
        if (typeof item.allocatedMinor === 'number') {
          allocMinor = item.allocatedMinor;
        } else if (typeof item.allocated === 'number') {
          allocMinor = majorToMinor(item.allocated, currency);
        }

        let spentMinor = 0;
        if (typeof item.spentMinor === 'number') {
          spentMinor = item.spentMinor;
        } else if (typeof item.spent === 'number') {
          spentMinor = majorToMinor(item.spent, currency);
        }

        return {
          id: item.id || `budget-${idx + 1}`,
          category: item.category || 'General',
          allocatedMinor: allocMinor,
          spentMinor: spentMinor,
          isEstimate: true,
          notes: item.notes,
        };
      })
    : [];

  return {
    ...raw,
    schemaVersion: 1,
    currency,
    totalBudgetMinor: totalMinor,
    budgetItems,
    timelineItems: Array.isArray(raw.timelineItems) ? raw.timelineItems : [],
    vendorItems: Array.isArray(raw.vendorItems) ? raw.vendorItems : [],
    ideas: Array.isArray(raw.ideas) ? raw.ideas : [],
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Safely parses and validates an exported plan JSON string.
 * Enforces file size boundaries, schema migrations, and domain invariants.
 */
export function importPlanJson(rawJsonString: string): Result<EventPlan, StorageError> {
  const encoder = new TextEncoder();
  const byteLength = encoder.encode(rawJsonString).length;

  if (byteLength > MAX_IMPORT_FILE_SIZE_BYTES) {
    return err({
      code: 'FILE_TOO_LARGE',
      message: `Import file size (${byteLength} bytes) exceeds maximum allowable limit of ${MAX_IMPORT_FILE_SIZE_BYTES} bytes.`,
    });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJsonString);
  } catch {
    return err({
      code: 'INVALID_JSON',
      message: 'Failed to parse JSON file. Ensure the file contains valid UTF-8 JSON.',
    });
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return err({
      code: 'VALIDATION_FAILED',
      message: 'Plan file must contain a JSON object at its root.',
    });
  }

  const record = parsed as Record<string, unknown>;
  const version = record['schemaVersion'];

  let candidate: Record<string, unknown> = record;
  if (version === undefined || version === 0) {
    candidate = migrateV0ToV1(record as RawV0Plan);
  } else if (version !== CURRENT_SCHEMA_VERSION) {
    return err({
      code: 'UNSUPPORTED_VERSION',
      message: `Unsupported plan schema version: ${String(version)}. Current supported version is ${CURRENT_SCHEMA_VERSION}.`,
    });
  }

  const validation = eventPlanSchema.safeParse(candidate);
  if (!validation.success) {
    const details = validation.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ');
    return err({
      code: 'VALIDATION_FAILED',
      message: `Schema validation failed: ${details}`,
    });
  }

  return ok(validation.data);
}

/**
 * Serializes an EventPlan to a clean, indented JSON string for export.
 */
export function exportPlanJson(plan: EventPlan): string {
  return JSON.stringify(plan, null, 2);
}
