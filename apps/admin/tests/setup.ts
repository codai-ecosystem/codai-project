import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock Next.js modules
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => {
    return React.createElement('img', { src, alt, ...props });
  },
}));

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Enhanced window.matchMedia mock for responsive design testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock navigator object for user-event library compatibility
Object.defineProperty(window, 'navigator', {
  value: {
    userAgent: 'jsdom',
    platform: 'jsdom',
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
      readText: vi.fn().mockResolvedValue(''),
    },
  },
  writable: true,
});

// Mock location object for demo mode testing
const mockLocation = {
  search: '',
  href: 'http://localhost:3000/admin',
  pathname: '/admin',
  origin: 'http://localhost:3000',
  host: 'localhost:3000',
  hostname: 'localhost',
  port: '3000',
  protocol: 'http:',
  hash: '',
  reload: vi.fn(),
  replace: vi.fn(),
  assign: vi.fn(),
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// Ensure window object is always available
Object.defineProperty(global, 'window', {
  value: window,
  writable: true,
  configurable: true,
});

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByType: vi.fn(() => []),
    getEntriesByName: vi.fn(() => []),
  },
  writable: true,
});

// Test timeout configuration
export const TEST_TIMEOUT = 10000;

// Suppress console warnings in tests
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
      args[0].includes('Warning: React.createFactory() is deprecated') ||
      args[0].includes('Warning: componentWillReceiveProps has been renamed'))
  ) {
    return;
  }
  originalWarn.call(console, ...args);
};

// Enhanced SSR-compatible window mock for testing edge cases
export const mockSSREnvironment = () => {
  const originalWindow = global.window;
  // @ts-ignore
  delete global.window;
  return () => {
    global.window = originalWindow;
  };
};

// Helper to safely mock window deletion for testing
export const withoutWindow = (callback: () => void) => {
  const originalWindow = global.window;
  try {
    // @ts-ignore
    delete global.window;
    callback();
  } finally {
    global.window = originalWindow;
  }
};