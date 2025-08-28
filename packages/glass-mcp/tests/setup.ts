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
export const createMockWorkflow = (id: string) => ({
  id,
  name: `Test Workflow ${id}`,
  description: 'Test automation workflow',
  version: '1.0.0',
  category: 'UI_AUTOMATION' as any,
  priority: 2 as any,
  executionMode: 'SEQUENTIAL' as any,
  timeout: 30000,
  creator: 'test-user',
  createdAt: new Date(),
  updatedAt: new Date(),
  tags: ['test'],
  tasks: [
    {
      id: `${id}-task-1`,
      name: 'Test Task 1',
      description: 'First test task',
      type: 'UI_INTERACTION' as any,
      priority: 2 as any,
      parameters: {
        input: { action: 'click', target: 'button' },
        configuration: {}
      },
      timeout: 5000,
      retryCount: 2,
      dependencies: [],
      preconditions: [],
      operation: {
        provider: 'AI_INTELLIGENCE' as any,
        method: 'processTask',
        parameters: { action: 'click', target: 'button' }
      }
    },
    {
      id: `${id}-task-2`,
      name: 'Test Task 2',
      description: 'Second test task',
      type: 'OCR_EXTRACTION' as any,
      priority: 2 as any,
      parameters: {
        input: { selector: '.data', format: 'json' },
        configuration: {}
      },
      timeout: 3000,
      retryCount: 1,
      dependencies: [],
      preconditions: [],
      operation: {
        provider: 'AI_INTELLIGENCE' as any,
        method: 'processTask',
        parameters: { selector: '.data', format: 'json' }
      }
    }
  ],
  dependencies: []
});

export const createMockTask = (id: string, type: any = 'UI_INTERACTION') => ({
  id,
  name: `Test Task ${id}`,
  description: 'Test task description',
  type,
  priority: 2 as any,
  parameters: {
    input: { mock: true },
    configuration: {}
  },
  timeout: 5000,
  retryCount: 1,
  dependencies: [],
  preconditions: [],
  operation: {
    provider: 'AI_INTELLIGENCE' as any,
    method: 'processTask',
    parameters: { mock: true }
  }
});

export const createMockAutomationContext = () => ({
  sessionId: 'test-session-789',
  executionId: 'test-execution-001',
  userId: 'test-user',
  screenResolution: { width: 1920, height: 1080 },
  activeApplications: [],
  inputData: { testRun: true, mock: true },
  variables: { environment: 'test' },
  configuration: {
    maxConcurrentWorkflows: 3,
    maxConcurrentTasks: 5,
    defaultTimeout: 30000,
    defaultRetryCount: 3,
    providers: {
      'ai_intelligence': {
        enabled: true,
        settings: {},
        timeout: 30000,
        retryCount: 3
      },
      'drawing_intelligence': {
        enabled: true,
        settings: {},
        timeout: 30000,
        retryCount: 3
      }
    },
    performanceSettings: {
      enableCaching: true,
      cacheSize: 100,
      enableOptimizations: true,
      maxResourceUsage: {
        maxCpuUsage: 0.8,
        maxMemoryUsage: 1024,
        maxDiskUsage: 500
      }
    }
  },
  featureFlags: {
    enableAdvancedLogging: true,
    useExperimentalFeatures: false
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