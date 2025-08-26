/**
 * Glass MCP v7.0 - Test Setup
 * 
 * Global test configuration and setup for Jest testing framework.
 * 
 * @version 7.0.0-alpha.1
 * @since 2025-08-26
 */

// Mock Windows-specific APIs if running on non-Windows
if (process.platform !== 'win32') {
  global.console.warn('⚠️ Running tests on non-Windows platform. Windows UI Automation APIs will be mocked.');
}

// Global test timeout
jest.setTimeout(10000);

// Mock console methods for cleaner test output
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

beforeAll(() => {
  // Silence console output during tests unless DEBUG is set
  if (!process.env.DEBUG) {
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  }
});

afterAll(() => {
  // Restore original console methods
  console.log = originalConsoleLog;
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
});

// Test utilities
export const createMockAutomationContext = () => ({
  workflowId: 'test-workflow-123',
  taskId: 'test-task-456',
  sessionId: 'test-session-789',
  userId: 'test-user',
  timestamp: new Date().toISOString(),
  environment: 'test',
  metadata: {
    testRun: true,
    mock: true
  }
});

export const createMockScreenCapture = () => ({
  width: 1920,
  height: 1080,
  buffer: Buffer.alloc(1920 * 1080 * 4), // Mock RGBA buffer
  format: 'RGBA' as const,
  timestamp: Date.now()
});

export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Performance testing utilities
export const measurePerformance = async (fn: () => Promise<any>, iterations: number = 1) => {
  const start = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    await fn();
  }
  
  const end = performance.now();
  const totalTime = end - start;
  const averageTime = totalTime / iterations;
  
  return {
    totalTime,
    averageTime,
    iterations
  };
};

export default {
  createMockAutomationContext,
  createMockScreenCapture,
  delay,
  measurePerformance
};