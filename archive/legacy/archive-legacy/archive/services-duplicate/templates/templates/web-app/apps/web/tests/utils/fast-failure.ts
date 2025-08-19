/**
 * Test utilities for fast failure and timeout management
 * Helps prevent hanging tests and provides quick feedback
 */

/**
 * Creates a test with a timeout that fails fast
 */
export function testWithTimeout(
  name: string,
  testFn: () => Promise<void>,
  timeout: number = 3000
) {
  return test(name, async () => {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error(`Test "${name}" timed out after ${timeout}ms`)),
        timeout
      );
    });

    await Promise.race([testFn(), timeoutPromise]);
  });
}

/**
 * Creates a describe block that fails fast on first error
 */
export function describeWithBail(name: string, suiteFn: () => void) {
  return describe(name, () => {
    let hasFailed = false;

    beforeEach(() => {
      if (hasFailed) {
        throw new Error(
          `Skipping test due to previous failure in suite: ${name}`
        );
      }
    });

    afterEach(() => {
      if (expect.getState().assertionCalls === 0) {
        hasFailed = true;
      }
    });

    suiteFn();
  });
}

/**
 * Wrapper for async operations with built-in timeout
 */
export async function withTimeout<T>(
  operation: Promise<T>,
  timeout: number = 5000,
  errorMessage?: string
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(
        new Error(errorMessage || `Operation timed out after ${timeout}ms`)
      );
    }, timeout);
  });

  return Promise.race([operation, timeoutPromise]);
}

/**
 * Mock implementation that automatically times out to prevent hanging
 */
export function mockWithTimeout<T extends (...args: unknown[]) => unknown>(
  implementation: T,
  timeout: number = 1000
): jest.MockedFunction<T> {
  return jest.fn(async (...args) => {
    return withTimeout(
      Promise.resolve(implementation(...args)),
      timeout,
      `Mock function timed out after ${timeout}ms`
    );
  }) as unknown as jest.MockedFunction<T>;
}

/**
 * Fast-failing test setup for components
 */
export function setupFastFailingTest() {
  // Set shorter timeouts for all async operations
  jest.setTimeout(5000);

  // Auto-cleanup on unhandled promises
  const originalUnhandled = process.listeners('unhandledRejection');
  process.removeAllListeners('unhandledRejection');
  process.on('unhandledRejection', reason => {
    console.error('Unhandled promise rejection in test:', reason);
    throw new Error(`Unhandled promise rejection: ${reason}`);
  });

  // Restore original handlers after test
  afterAll(() => {
    process.removeAllListeners('unhandledRejection');
    originalUnhandled.forEach(listener => {
      process.on('unhandledRejection', listener as NodeJS.UnhandledRejectionListener);
    });
  });
}

/**
 * Helper to detect if a test is likely to hang and fail it early
 */
export function createHangDetector(timeout: number = 8000) {
  let isCompleted = false;

  const hangTimer = setTimeout(() => {
    if (!isCompleted) {
      throw new Error(
        `Test appears to be hanging - exceeded ${timeout}ms without completion`
      );
    }
  }, timeout);

  return {
    markCompleted: () => {
      isCompleted = true;
      clearTimeout(hangTimer);
    },
    cleanup: () => {
      clearTimeout(hangTimer);
    },
  };
}
