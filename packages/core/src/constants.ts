// Core constants for the Codai ecosystem

export const APP_NAME = 'Codai';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'AI-Native Development Platform';

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const API_LIMITS = {
  REQUEST_TIMEOUT: 30000, // 30 seconds
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_REQUESTS_PER_MINUTE: 100,
  MAX_MEMORY_ENTRIES_PER_USER: 10000,
} as const;

export const FEATURE_CATEGORIES = {
  AUTH: 'authentication',
  MEMORY: 'memory',
  AI: 'artificial-intelligence',
  DEVELOPMENT: 'development',
  COLLABORATION: 'collaboration',
  ANALYTICS: 'analytics',
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  DEVELOPER: 'developer',
} as const;

export const PERMISSIONS = {
  READ: 'read',
  WRITE: 'write',
  DELETE: 'delete',
  ADMIN: 'admin',
  CREATE_PROJECT: 'create_project',
  MANAGE_USERS: 'manage_users',
  ACCESS_ANALYTICS: 'access_analytics',
} as const;

export const MEMORY_IMPORTANCE_LEVELS = {
  LOW: 1,
  MEDIUM: 5,
  HIGH: 8,
  CRITICAL: 10,
} as const;

export const SESSION_DURATION = {
  SHORT: 15 * 60 * 1000, // 15 minutes
  MEDIUM: 2 * 60 * 60 * 1000, // 2 hours
  LONG: 24 * 60 * 60 * 1000, // 24 hours
  EXTENDED: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const;
