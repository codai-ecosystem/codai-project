/**
 * Common types and interfaces for CODAI SDK
 */

export interface CODAIConfig {
  gatewayUrl: string;
  endpoints: ServiceEndpoints;
  timeout: number;
  retries: number;
  retryDelay: number;
  auth?: AuthConfig;
  debug?: boolean;
}

export interface ServiceEndpoints {
  gateway: string;
  cbd: string;
  admin: string;
  id: string;
  hub: string;
  controlai: string;
  romai: string;
  bancai: string;
  memorai: string;
  codai: string;
}

export interface AuthConfig {
  type: 'bearer' | 'api-key' | 'basic';
  token?: string;
  apiKey?: string;
  username?: string;
  password?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  meta?: {
    requestId?: string;
    duration?: number;
    version?: string;
  };
}

export interface ServiceHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  service: string;
  version: string;
  uptime: number;
  timestamp: string;
  details?: Record<string, any>;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface RequestConfig {
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
  auth?: AuthConfig;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface RequestOptions extends RequestConfig {
  method: HttpMethod;
  url: string;
  data?: any;
  params?: Record<string, any>;
}

export interface ClientOptions {
  baseURL: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  auth?: AuthConfig;
  headers?: Record<string, string>;
}

export interface WebSocketConfig {
  url: string;
  protocols?: string[];
  reconnect?: boolean;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
}

export interface EventData {
  type: string;
  payload: any;
  timestamp: string;
  source: string;
}

export type EventHandler<T = any> = (data: T) => void;
export type ErrorHandler = (error: Error) => void;

export interface ClientConfig extends ClientOptions {
  config: CODAIConfig;
}

export class CODAIError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;
  public readonly details?: any;

  constructor(
    message: string,
    code: string = 'CODAI_ERROR',
    statusCode?: number,
    details?: any
  ) {
    super(message);
    this.name = 'CODAIError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class NetworkError extends CODAIError {
  constructor(message: string, details?: any) {
    super(message, 'NETWORK_ERROR', undefined, details);
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends CODAIError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends CODAIError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class ServiceUnavailableError extends CODAIError {
  constructor(service: string) {
    super(`Service ${service} is unavailable`, 'SERVICE_UNAVAILABLE', 503);
    this.name = 'ServiceUnavailableError';
  }
}
