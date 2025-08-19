/**
 * @fileoverview Vitest Setup for CODAI UI Components Testing
 * @version 1.0.0
 */

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, vi } from 'vitest';

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock IntersectionObserver
beforeAll(() => {
  global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    root: null,
    rootMargin: '',
    thresholds: []
  }));

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation((callback) => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
  }));

  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  });

  // Mock scrollTo
  Object.defineProperty(window, 'scrollTo', {
    writable: true,
    value: vi.fn()
  });

  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  };
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  });

  // Mock sessionStorage
  const sessionStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  };
  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock
  });
});

// Suppress console errors during tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

// Add custom matchers
expect.extend({
  toHaveAccessibleName(received, expected) {
    const element = received as HTMLElement;
    const accessibleName = element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      element.textContent;

    const pass = accessibleName === expected;

    return {
      message: () =>
        pass
          ? `Expected element not to have accessible name "${expected}"`
          : `Expected element to have accessible name "${expected}", but got "${accessibleName}"`,
      pass
    };
  },

  toBeAccessible(received) {
    const element = received as HTMLElement;
    const hasAriaLabel = element.hasAttribute('aria-label');
    const hasAriaLabelledBy = element.hasAttribute('aria-labelledby');
    const hasRole = element.hasAttribute('role');
    const hasTextContent = element.textContent && element.textContent.trim().length > 0;

    const pass = hasAriaLabel || hasAriaLabelledBy || hasRole || hasTextContent;

    return {
      message: () =>
        pass
          ? 'Expected element not to be accessible'
          : 'Expected element to be accessible (have aria-label, aria-labelledby, role, or text content)',
      pass
    };
  }
});

// Type definitions for custom matchers
declare module 'vitest' {
  interface Assertion<T = any> {
    toHaveAccessibleName(expected: string): T;
    toBeAccessible(): T;
  }
}
