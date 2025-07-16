import { beforeAll } from 'vitest';

// Basic test setup for AIDE without React dependencies
beforeAll(() => {
  // Mock console methods for cleaner test output
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  console.error = (...args) => {
    // Filter out React testing library warnings
    if (args[0]?.includes?.('Warning:') || args[0]?.includes?.('act')) {
      return;
    }
    originalConsoleError(...args);
  };

  console.warn = (...args) => {
    // Filter out React warnings
    if (args[0]?.includes?.('Warning:')) {
      return;
    }
    originalConsoleWarn(...args);
  };
});
