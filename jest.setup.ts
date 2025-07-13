import '@testing-library/jest-dom';
import { vi, afterEach } from 'vitest';
import React from 'react';

// Make React available globally for all tests
global.React = React;

// React 19 compatibility fixes
// @ts-ignore
global.IS_REACT_ACT_ENVIRONMENT = true;

// Fix for React 19 timer issues
global.setImmediate = global.setImmediate || ((fn: () => void) => setTimeout(fn, 0));

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';

// React 19 cleanup helper
afterEach(() => {
  // Clean up any pending timers or effects
  vi.clearAllTimers();
  vi.clearAllMocks();
});

// Mock Next.js router
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));