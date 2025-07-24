import { vi } from 'vitest';

// Mock global functions for security testing environment
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  debug: vi.fn()
};

// Mock fetch for security API calls
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })
) as any;

// Mock crypto methods (avoid overriding the entire crypto object)
if (global.crypto) {
  global.crypto.randomUUID = vi.fn(() => 'mock-uuid-' + Math.random().toString(36).substr(2, 9));
  global.crypto.getRandomValues = vi.fn((array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  });
}

// Mock Date for consistent security scan timestamps
const mockDate = new Date('2024-01-24T10:00:00Z');
vi.setSystemTime(mockDate);
