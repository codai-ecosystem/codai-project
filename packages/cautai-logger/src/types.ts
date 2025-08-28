/**
 * @fileoverview Logging and error handling type definitions
 * @author Cautai Team  
 * @version 1.0.0
 */

import { z } from 'zod';

// Log levels enum
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn', 
  INFO = 'info',
  HTTP = 'http',
  VERBOSE = 'verbose',
  DEBUG = 'debug',
  SILLY = 'silly'
}

// Component types for structured logging
export enum ComponentType {
  MCP_SERVER = 'mcp-server',
  CLI = 'cli',
  HTTP_SERVER = 'http-server', 
  VSCODE_EXTENSION = 'vscode-extension',
  WEB_FRONTEND = 'web-frontend',
  SEARCH_ENGINE = 'search-engine',
  CACHE = 'cache',
  I18N = 'i18n',
  LOGGER = 'logger'
}

// Error categories for classification
export enum ErrorCategory {
  VALIDATION = 'validation',
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  RATE_LIMIT = 'rate-limit',
  SEARCH = 'search',
  CACHE = 'cache',
  DATABASE = 'database',
  INTERNAL = 'internal',
  EXTERNAL_API = 'external-api',
  CONFIGURATION = 'configuration',
  PARSING = 'parsing',
  TIMEOUT = 'timeout',
  RESOURCE_LIMIT = 'resource-limit',
  UNKNOWN = 'unknown'
}

// Structured log entry schema
export const LogEntrySchema = z.object({
  timestamp: z.string(),
  level: z.nativeEnum(LogLevel),
  component: z.nativeEnum(ComponentType),
  message: z.string(),
  requestId: z.string().optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  error: z.object({
    name: z.string(),
    message: z.string(),
    stack: z.string().optional(),
    category: z.nativeEnum(ErrorCategory),
    code: z.string().optional(),
    statusCode: z.number().optional(),
    details: z.record(z.unknown()).optional()
  }).optional(),
  performance: z.object({
    duration: z.number(),
    memoryUsage: z.number().optional(),
    cpuUsage: z.number().optional()
  }).optional(),
  context: z.object({
    userAgent: z.string().optional(),
    ip: z.string().optional(),
    method: z.string().optional(),
    url: z.string().optional(),
    query: z.record(z.unknown()).optional(),
    headers: z.record(z.string()).optional()
  }).optional()
});

export type LogEntry = z.infer<typeof LogEntrySchema>;

// Logger configuration schema
export const LoggerConfigSchema = z.object({
  level: z.nativeEnum(LogLevel).default(LogLevel.INFO),
  component: z.nativeEnum(ComponentType),
  enableConsole: z.boolean().default(true),
  enableFile: z.boolean().default(true),
  enableRotation: z.boolean().default(true),
  logDirectory: z.string().default('./logs'),
  maxFileSize: z.string().default('20m'),
  maxFiles: z.string().default('14d'),
  format: z.enum(['json', 'simple', 'combined']).default('json'),
  enableColors: z.boolean().default(true),
  enableTimestamp: z.boolean().default(true),
  enableStackTrace: z.boolean().default(true),
  enablePerformanceTracking: z.boolean().default(true),
  filters: z.array(z.string()).default([]),
  sensitiveFields: z.array(z.string()).default([
    'password', 'token', 'apiKey', 'secret', 'authorization', 'cookie'
  ])
});

export type LoggerConfig = z.infer<typeof LoggerConfigSchema>;

// Error handling configuration
export const ErrorHandlingConfigSchema = z.object({
  enableRetry: z.boolean().default(true),
  maxRetries: z.number().default(3),
  retryDelayMs: z.number().default(1000),
  retryBackoffMultiplier: z.number().default(2),
  retryableErrors: z.array(z.nativeEnum(ErrorCategory)).default([
    ErrorCategory.NETWORK,
    ErrorCategory.TIMEOUT,
    ErrorCategory.EXTERNAL_API,
    ErrorCategory.RATE_LIMIT
  ]),
  enableCircuitBreaker: z.boolean().default(true),
  circuitBreakerThreshold: z.number().default(5),
  circuitBreakerTimeoutMs: z.number().default(60000),
  enableErrorReporting: z.boolean().default(true),
  enableEmailAlerts: z.boolean().default(false),
  alertThresholds: z.object({
    errorRate: z.number().default(0.1),
    timeWindowMs: z.number().default(300000)
  })
});

export type ErrorHandlingConfig = z.infer<typeof ErrorHandlingConfigSchema>;

// Custom error class
export interface CautaiError extends Error {
  category: ErrorCategory;
  code?: string;
  statusCode?: number;
  details?: Record<string, unknown>;
  retryable?: boolean;
  component: ComponentType;
  requestId?: string;
  userId?: string;
}

// Logger interface
export interface ICautaiLogger {
  error(message: string, error?: Error | CautaiError, metadata?: Record<string, unknown>): void;
  warn(message: string, metadata?: Record<string, unknown>): void;
  info(message: string, metadata?: Record<string, unknown>): void;
  http(message: string, metadata?: Record<string, unknown>): void;
  verbose(message: string, metadata?: Record<string, unknown>): void;
  debug(message: string, metadata?: Record<string, unknown>): void;
  silly(message: string, metadata?: Record<string, unknown>): void;

  // Convenience methods
  logRequest(req: any, metadata?: Record<string, unknown>): void;
  logResponse(res: any, duration: number, metadata?: Record<string, unknown>): void;
  logPerformance(operation: string, duration: number, metadata?: Record<string, unknown>): void;

  // Context methods
  setContext(context: Partial<LogEntry['context']>): void;
  setRequestId(requestId: string): void;
  setUserId(userId: string): void;
  setSessionId(sessionId: string): void;

  // Child logger
  child(metadata: Record<string, unknown>): ICautaiLogger;
}

// Error handler interface
export interface IErrorHandler {
  handleError(error: Error | CautaiError, context?: Record<string, unknown>): Promise<void>;
  createError(
    category: ErrorCategory, 
    message: string, 
    details?: Record<string, unknown>,
    originalError?: Error
  ): CautaiError;
  isRetryable(error: Error | CautaiError): boolean;
  shouldAlert(error: Error | CautaiError): boolean;
}

// Metrics interface
export interface IMetricsCollector {
  incrementCounter(name: string, labels?: Record<string, string>): void;
  recordHistogram(name: string, value: number, labels?: Record<string, string>): void;
  recordGauge(name: string, value: number, labels?: Record<string, string>): void;
  startTimer(name: string, labels?: Record<string, string>): () => void;
}

// Health check interface
export interface IHealthChecker {
  checkHealth(): Promise<{
    status: 'healthy' | 'unhealthy' | 'degraded';
    checks: Record<string, {
      status: 'pass' | 'fail' | 'warn';
      message: string;
      details?: Record<string, unknown>;
    }>;
    timestamp: string;
  }>;
}

// Circuit breaker interface
export interface ICircuitBreaker {
  execute<T>(operation: () => Promise<T>): Promise<T>;
  getState(): 'closed' | 'open' | 'half-open';
  getFailureCount(): number;
  reset(): void;
}