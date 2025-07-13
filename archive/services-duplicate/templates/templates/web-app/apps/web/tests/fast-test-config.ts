/**
 * Global test configuration for fast failure and hang prevention
 * This file should be imported in all test files that need fast failure behavior
 */

// Set aggressive timeouts to prevent hanging
const TEST_TIMEOUT = 8000; // 8 seconds max per test
const ASYNC_TIMEOUT = 3000; // 3 seconds max for async operations

// Override default Jest timeout
jest.setTimeout(TEST_TIMEOUT);

// Global setup for fast failure
beforeAll(() => {
  // Fail fast on unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled promise rejection:', reason);
    console.error('Promise:', promise);
    throw new Error(`Unhandled promise rejection: ${reason}`);
  });

  process.on('uncaughtException', error => {
    console.error('Uncaught exception:', error);
    throw error;
  });
});

// Global afterEach to detect hanging tests
afterEach(() => {
  // Force cleanup of any pending async operations
  if (typeof global.gc === 'function') {
    global.gc();
  }
});

// Export timeout constants for use in tests
export const TIMEOUTS = {
  TEST: TEST_TIMEOUT,
  ASYNC: ASYNC_TIMEOUT,
  COMPONENT_RENDER: 1000,
  USER_INTERACTION: 2000,
  API_CALL: 3000,
} as const;

// Helper to wrap tests with timeout
export function fastTest(
  name: string,
  testFn: () => Promise<void> | void,
  timeout = TEST_TIMEOUT
) {
  return test(name, async () => {
    const promise = Promise.resolve(testFn());
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () =>
          reject(new Error(`Test "${name}" exceeded timeout of ${timeout}ms`)),
        timeout
      );
    });

    await Promise.race([promise, timeoutPromise]);
  });
}

// Helper to wrap describe blocks with bail-on-first-failure
export function fastDescribe(name: string, suiteFn: () => void) {
  return describe(name, () => {
    let shouldSkip = false;

    beforeEach(() => {
      if (shouldSkip) {
        pending('Skipping due to previous test failure in this suite');
      }
    });

    afterEach(() => {
      if (expect.getState().testPath && expect.getState().currentTestName) {
        // Check if current test failed
        const testState = expect.getState();
        if (
          testState.assertionCalls === 0 ||
          testState.suppressedErrors?.length > 0
        ) {
          shouldSkip = true;
        }
      }
    });

    suiteFn();
  });
}
