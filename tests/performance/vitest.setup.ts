import { vi } from 'vitest';

// Mock fetch globally
global.fetch = vi.fn();

// Mock IntersectionObserver for Node.js
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver for Node.js
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock console methods to reduce noise in tests
console.log = vi.fn();
console.warn = vi.fn();
console.error = vi.fn();

export {};
