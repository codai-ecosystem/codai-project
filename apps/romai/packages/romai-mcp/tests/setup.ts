/**
 * Jest setup file for ROMAI MCP Server testing
 * Configures global test environment and mocks
 */

import '@jest/globals';

// Global test timeout
jest.setTimeout(30000);

// Mock environment variables
process.env['NODE_ENV'] = 'test';
process.env['ROMAI_SERVER_MODE'] = 'test';
process.env['ROMAI_LOG_LEVEL'] = 'error';

// Global mocks for external dependencies
jest.mock('puppeteer', () => ({
  launch: jest.fn().mockResolvedValue({
    newPage: jest.fn().mockResolvedValue({
      goto: jest.fn(),
      content: jest.fn().mockResolvedValue('<html><body>Mock content</body></html>'),
      close: jest.fn()
    }),
    close: jest.fn()
  })
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

// Global test utilities
global.createMockServer = () => ({
  setRequestHandler: jest.fn(),
  connect: jest.fn(),
  close: jest.fn()
});

global.createMockLogger = () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});
