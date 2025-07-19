// Core package exports
export * from './lib/utils';
export * from './lib/constants';
export * from './lib/auth';
export * from './lib/database';
export * from './lib/env';
export * from './lib/types';

// Main User interface with permissions (overrides lib/types User)
export type { User, Session, ServiceDefinition } from './types';

// Specific exports from utils to avoid conflicts
export { getServiceUrl, createApiResponse, createErrorResponse, isValidUrl, sanitizeInput, sleep, retry } from './utils';

// Re-export commonly used libraries
export { clsx } from 'clsx';
export { twMerge } from 'tailwind-merge';