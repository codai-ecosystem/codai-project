import { vi } from 'vitest';

// Mock global functions for CI/CD automation testing environment
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  debug: vi.fn()
};

// Mock fetch for CI/CD API calls
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    headers: new Map([
      ['content-type', 'application/json']
    ])
  })
) as any;

// Mock Date for consistent CI/CD timestamps but allow Date.now() to progress
const baseTime = new Date('2024-01-24T12:00:00Z').getTime();
let timeOffset = 0;

// Override Date.now() to simulate time progression
const originalDateNow = Date.now;
Date.now = vi.fn(() => {
  timeOffset += Math.random() * 1000 + 100; // Add 100-1100ms each call
  return baseTime + timeOffset;
});

// Mock process environment for CI/CD context
process.env.CI = 'true';
process.env.GITHUB_ACTIONS = 'true';
process.env.NODE_ENV = 'test';
