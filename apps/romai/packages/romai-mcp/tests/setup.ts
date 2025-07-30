/**
 * Jest setup file for ROMAI MCP Server testing
 * Configures global test environment and mocks
 */

import '@jest/globals';

// Global test timeout
jest.setTimeout(30000);

// Mock environment variables - using Object.defineProperty to avoid readonly issues
Object.defineProperty(process.env, 'NODE_ENV', { value: 'test', writable: true });
Object.defineProperty(process.env, 'ROMAI_SERVER_MODE', { value: 'test', writable: true });
Object.defineProperty(process.env, 'ROMAI_LOG_LEVEL', { value: 'error', writable: true });

// Global mocks for external dependencies
jest.mock('playwright', () => ({
  chromium: {
    launch: jest.fn().mockResolvedValue({
      newPage: jest.fn().mockResolvedValue({
        goto: jest.fn().mockResolvedValue({
          status: jest.fn().mockReturnValue(200)
        }),
        content: jest.fn().mockResolvedValue('<html><body>Mock content</body></html>'),
        title: jest.fn().mockResolvedValue('Mock Title'),
        close: jest.fn(),
        setDefaultTimeout: jest.fn(),
        waitForSelector: jest.fn()
      }),
      close: jest.fn(),
      isConnected: jest.fn().mockReturnValue(true)
    })
  }
}));

jest.mock('simple-git', () => {
  return jest.fn(() => ({
    status: jest.fn().mockResolvedValue({ current: 'main', files: [] }),
    log: jest.fn().mockResolvedValue({ all: [] }),
    add: jest.fn().mockResolvedValue({}),
    commit: jest.fn().mockResolvedValue({}),
    push: jest.fn().mockResolvedValue({})
  }));
});

// Global test utilities using declare global
declare global {
  var createMockServer: () => any;
  var createMockLogger: () => any;
}

globalThis.createMockServer = () => ({
  setRequestHandler: jest.fn(),
  connect: jest.fn(),
  close: jest.fn()
});

globalThis.createMockLogger = () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});
