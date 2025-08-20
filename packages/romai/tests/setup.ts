import { vi } from 'vitest';

// Global test setup
beforeEach(() => {
  vi.clearAllMocks();
});

// Mock global objects if needed
Object.defineProperty(global, 'fetch', {
  value: vi.fn(),
  writable: true
});
