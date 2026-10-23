/**
 * Type-safe functional Result type representing either success (Ok) or failure (Err).
 * Ensures explicit handling of errors throughout domain logic and API clients.
 */

export interface Ok<T> {
  readonly success: true;
  readonly value: T;
}

export interface Err<E> {
  readonly success: false;
  readonly error: E;
}

export type Result<T, E = Error> = Ok<T> | Err<E>;

/**
 * Creates a successful Result containing a value.
 */
export function ok<T>(value: T): Ok<T> {
  return { success: true, value };
}

/**
 * Creates an error Result containing an error descriptor.
 */
export function err<E>(error: E): Err<E> {
  return { success: false, error };
}

/**
 * Type guard for successful Result.
 */
export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.success;
}

/**
 * Type guard for error Result.
 */
export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return !result.success;
}

/**
 * Transforms the value of a successful Result using a mapping function.
 */
export function mapResult<T, U, E>(result: Result<T, E>, fn: (val: T) => U): Result<U, E> {
  if (result.success) {
    return ok(fn(result.value));
  }
  return result;
}

/**
 * Chains operations that return Results (monadic bind).
 */
export function flatMapResult<T, U, E>(
  result: Result<T, E>,
  fn: (val: T) => Result<U, E>,
): Result<U, E> {
  if (result.success) {
    return fn(result.value);
  }
  return result;
}

/**
 * Unwraps a Result by pattern matching over success and failure cases.
 */
export function matchResult<T, E, R>(
  result: Result<T, E>,
  patterns: {
    readonly onOk: (val: T) => R;
    readonly onErr: (err: E) => R;
  },
): R {
  return result.success ? patterns.onOk(result.value) : patterns.onErr(result.error);
}
