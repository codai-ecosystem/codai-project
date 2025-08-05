// Main SDK exports
export { MemorAI as default, MemorAI } from './client';

// Type exports
export type {
  Memory,
  MemoryInput,
  MemoryUpdate,
  SearchOptions,
  SearchResult,
  AnalyticsData,
  WebSocketMessage,
  ApiResponse,
  SDKOptions,
  PerformanceMetrics,
  RateLimitInfo,
  Category,
  Tag,
  UserSession,
  HealthStatus,
  BatchOperation,
  BatchResult,
  EventHandler,
  EventMap
} from './types';

// Utility functions
export * from './utils';

// Constants
export const SDK_VERSION = '1.0.0';
export const DEFAULT_BASE_URL = 'http://localhost:4006';
export const DEFAULT_TIMEOUT = 30000;
export const DEFAULT_RETRIES = 3;
