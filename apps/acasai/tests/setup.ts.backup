import React from "react";
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { act } from '@testing-library/react';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      div: React.forwardRef(({ children, whileHover, initial, animate, transition, ...props }: any, ref: any) =>
        React.createElement('div', { ...props, ref }, children)
      ),
      h1: React.forwardRef(({ children, whileHover, initial, animate, transition, ...props }: any, ref: any) =>
        React.createElement('h1', { ...props, ref }, children)
      ),
      button: React.forwardRef(({ children, whileHover, initial, animate, transition, ...props }: any, ref: any) =>
        React.createElement('button', { ...props, ref }, children)
      ),
    },
    AnimatePresence: ({ children }: any) => children,
  };
});

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
    const React = require('react');
    return React.createElement('img', { src, alt, ...props });
  },
}));

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Test configuration
export const TEST_TIMEOUT = 10000;

// Wrap setTimeout/setInterval calls in act
const originalSetTimeout = global.setTimeout;
const originalSetInterval = global.setInterval;

(global as any).setTimeout = (...args: any[]) => {
  return originalSetTimeout(() => {
    act(() => {
      args[0]();
    });
  }, args[1]);
};

(global as any).setInterval = (...args: any[]) => {
  return originalSetInterval(() => {
    act(() => {
      args[0]();
    });
  }, args[1]);
};

// Suppress console warnings in tests
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
      args[0].includes('React does not recognize the `whileHover` prop') ||
      args[0].includes('An update to AcasaiPage inside a test was not wrapped in act'))
  ) {
    return;
  }
  originalWarn.call(console, ...args);
};