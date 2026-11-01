/**
 * Pure domain logic for plan serialization, strict schema validation,
 * file size enforcement, version migrations, and storage parsing.
 */

import { type EventPlan, eventPlanSchema } from '../schemas/event-plan';
import { type Result, ok, err } from '../result/result';
import { majorToMinor } from './budget-math';

export const MAX_IMPORT_FILE_SIZE_BYTES = 1_048_576; // 1 MB limit
export const MAX_SANITIZATION_DEPTH = 32;
export const MAX_ARRAY_LENGTH = 1_000;
export const MAX_TOTAL_NODES = 5_000;

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

function sanitizeArray(arr: unknown[], depth: number, state: { count: number }): unknown[] {
  if (arr.length > MAX_ARRAY_LENGTH) {
    throw new Error('ARRAY_TOO_LARGE');
  }
  return arr.map((item) => sanitizePrototypePollution(item, depth + 1, state));
}

function sanitizeObjectProperties(
  obj: Record<string, unknown>,
  depth: number,
  state: { count: number },
): Record<string, unknown> {
  const cleanObj = Object.create(null) as Record<string, unknown>;
  for (const [key, val] of Object.entries(obj)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }
    Object.assign(cleanObj, { [key]: sanitizePrototypePollution(val, depth + 1, state) });
  }
  return cleanObj;
}

/**
 * Recursively strips dangerous prototype-polluting properties (`__proto__`, `constructor`, `prototype`)
 * from parsed untrusted objects before schema processing.
 * Constrained by MAX_SANITIZATION_DEPTH, MAX_ARRAY_LENGTH, and MAX_TOTAL_NODES.
 */
export function sanitizePrototypePollution<T>(
  input: T,
  depth = 0,
  state: { count: number } = { count: 0 },
): T {
  state.count += 1;
  if (state.count > MAX_TOTAL_NODES) {
    throw new Error('TOO_MANY_NODES');
  }

  if (depth > MAX_SANITIZATION_DEPTH || input === null || typeof input !== 'object') {
    return input;
  }

  if (Array.isArray(input)) {
    return sanitizeArray(input, depth, state) as unknown as T;
  }

  return sanitizeObjectProperties(input as Record<string, unknown>, depth, state) as T;
}

function parseJsonPayload(rawJsonString: string): Result<unknown, StorageError> {
  const encoder = new TextEncoder();
  const byteLength = encoder.encode(rawJsonString).length;

  if (byteLength > MAX_IMPORT_FILE_SIZE_BYTES) {
    return err({
      code: 'FILE_TOO_LARGE',
      message: `Import file size (${byteLength} bytes) exceeds maximum allowable limit of ${MAX_IMPORT_FILE_SIZE_BYTES} bytes.`,
    });
  }

  try {
    const parsed: unknown = JSON.parse(rawJsonString);
    if (typeof parsed !== 'object' || parsed === null) {
      return err({
        code: 'VALIDATION_FAILED',
        message: 'Plan file must contain a JSON object at its root.',
      });
    }
    return ok(parsed);
  } catch {
    return err({
      code: 'INVALID_JSON',
      message: 'Failed to parse JSON file. Ensure the file contains valid UTF-8 JSON.',
    });
  }
}

function preparePlanCandidate(
  record: Record<string, unknown>,
): Result<Record<string, unknown>, StorageError> {
  const version = record['schemaVersion'];
  if (version === undefined || version === 0) {
    return ok(migrateV0ToV1(record as RawV0Plan));
  }
  if (version !== CURRENT_SCHEMA_VERSION) {
    return err({
      code: 'UNSUPPORTED_VERSION',
      message: `Unsupported plan schema version: ${String(version)}. Current supported version is ${CURRENT_SCHEMA_VERSION}.`,
    });
  }
  return ok(record);
}

/**
 * Safely parses and validates an exported plan JSON string.
 * Enforces file size boundaries, schema migrations, and domain invariants.
 */
export function importPlanJson(rawJsonString: string): Result<EventPlan, StorageError> {
  const parseRes = parseJsonPayload(rawJsonString);
  if (!parseRes.success) return parseRes;

  let sanitized: Record<string, unknown>;
  try {
    sanitized = sanitizePrototypePollution(parseRes.value) as Record<string, unknown>;
  } catch (parseError: unknown) {
    const isBoundaryError =
      parseError instanceof Error &&
      (parseError.message === 'TOO_MANY_NODES' || parseError.message === 'ARRAY_TOO_LARGE');
    return err({
      code: 'VALIDATION_FAILED',
      message: isBoundaryError
        ? 'Import rejected: payload exceeds allowable collection complexity boundaries.'
        : 'Failed to process imported object structure.',
    });
  }

  const candidateRes = preparePlanCandidate(sanitized);
  if (!candidateRes.success) return candidateRes;

  const validation = eventPlanSchema.safeParse(candidateRes.value);
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
