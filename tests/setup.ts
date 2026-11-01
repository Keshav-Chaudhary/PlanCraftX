import '@testing-library/react';
import * as matchers from 'vitest-axe/matchers';
import { expect } from 'vitest';

expect.extend(matchers);

// Ensure fallback dummy test key is set for unit test environments if unset or empty
if (!process.env['GEMINI_API_KEY']) {
  process.env['GEMINI_API_KEY'] = 'test-gemini-mock-key';
}

// Mock window.matchMedia if not implemented in jsdom
if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}
