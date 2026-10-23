import { describe, it, expect } from 'vitest';
import { ok, err, isOk, isErr, mapResult, flatMapResult, matchResult } from '@/lib/result/result';

describe('Functional Result Monad', () => {
  it('correctly constructs and guards Ok and Err', () => {
    const successResult = ok(42);
    expect(isOk(successResult)).toBe(true);
    expect(isErr(successResult)).toBe(false);
    expect(successResult.value).toBe(42);

    const failureResult = err(new Error('Validation error'));
    expect(isOk(failureResult)).toBe(false);
    expect(isErr(failureResult)).toBe(true);
    expect(failureResult.error.message).toBe('Validation error');
  });

  it('maps successful values and leaves errors unchanged', () => {
    const successResult = ok(10);
    const mappedSuccess = mapResult(successResult, (n) => n * 2);
    expect(mappedSuccess).toEqual({ success: true, value: 20 });

    const failureResult = err('Network failure');
    const mappedFailure = mapResult(failureResult, (n: number) => n * 2);
    expect(mappedFailure).toEqual({ success: false, error: 'Network failure' });
  });

  it('flatMaps chained operations returning Results', () => {
    const parseNumber = (s: string) => {
      const num = Number(s);
      return Number.isNaN(num) ? err('Not a number') : ok(num);
    };

    const r1 = flatMapResult(ok('123'), parseNumber);
    expect(r1).toEqual({ success: true, value: 123 });

    const r2 = flatMapResult(ok('abc'), parseNumber);
    expect(r2).toEqual({ success: false, error: 'Not a number' });

    const r3 = flatMapResult(err('Prior error'), parseNumber);
    expect(r3).toEqual({ success: false, error: 'Prior error' });
  });

  it('matches over Result patterns', () => {
    const resSuccess = ok('Hello');
    const formatted1 = matchResult(resSuccess, {
      onOk: (val) => `Success: ${val}`,
      onErr: (error) => `Failure: ${error}`,
    });
    expect(formatted1).toBe('Success: Hello');

    const resFailure = err('Something went wrong');
    const formatted2 = matchResult(resFailure, {
      onOk: (val) => `Success: ${val}`,
      onErr: (error) => `Failure: ${error}`,
    });
    expect(formatted2).toBe('Failure: Something went wrong');
  });
});
