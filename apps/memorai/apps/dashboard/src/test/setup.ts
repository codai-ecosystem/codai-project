import React from 'react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Setup function with proper return type
export const setup = (): void => {
  // Setup code here
};

// Cleanup function with proper return type
export const cleanup = (): void => {
  // Cleanup code here
};

// Mock function with proper return type
export const mockFn = (): void => {
  // Mock implementation
};

// Test setup function with proper return type  
export const setupTests = (): void => {
  // Test setup code
};

// Environment setup function with proper return type
export const setupEnvironment = (): void => {
  // Environment setup code
};

// DOM setup function with proper return type
export const setupDOM = (): void => {
  // DOM setup code
};

// Global fetch mock
global.fetch = vi.fn();

// Mock performance observer function with proper return type  
export const mockPerformanceObserver = (): void => {
  // Mock performance observer implementation
};

// Mock API responses
export const mockApiResponse = (data: unknown, ok = true): Promise<Response> => {
  return Promise.resolve({
    ok,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    status: ok ? 200 : 500,
    statusText: ok ? 'OK' : 'Internal Server Error',
  } as Response);
};

// Mock memory store data
export const mockMemoryData = [
  {
    id: 'mem-1',
    content: 'Test memory 1',
    timestamp: '2024-01-01T00:00:00Z',
    agentId: 'agent-1',
    metadata: { test: true },
    tags: ['test'],
    importance: 0.8,
  },
  {
    id: 'mem-2',
    content: 'Test memory 2',
    timestamp: '2024-01-02T00:00:00Z',
    agentId: 'agent-2',
    metadata: { test: true },
    tags: ['test', 'example'],
    importance: 0.9,
  },
];

// Mock search results
export const mockSearchResults = {
  memories: mockMemoryData,
  total: mockMemoryData.length,
  hasMore: false,
};

// Mock analytics data
export const mockAnalyticsData = {
  totalMemories: 100,
  totalAgents: 5,
  averageImportance: 0.75,
  memoryGrowth: 10,
  topTags: [
    { name: 'work', count: 25 },
    { name: 'personal', count: 20 },
    { name: 'learning', count: 15 },
  ],
};

// Test cleanup
export const resetMocks = (): void => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
};

// Global mocks setup
beforeEach(() => {
  resetMocks();
});

afterEach(() => {
  resetMocks();
});
