/**
 * CODAI SDK - Main Entry Point
 * Official JavaScript/TypeScript SDK for CODAI Ecosystem
 * 
 * @version 1.0.0
 * @author CODAI Ecosystem Team
 */

export { CodeaiClient } from './client/CodeaiClient';
export { AdminService } from './services/AdminService';
export { IdService } from './services/IdService';
export { HubService } from './services/HubService';
export { CbdService } from './services/CbdService';
export { GatewayService } from './services/GatewayService';

// Types
export * from './types/common';
export * from './types/auth';
export * from './types/services';

// Utilities
export { CodeaiError } from './utils/errors';
export { CodeaiConfig } from './config/config';

// Constants
export const SDK_VERSION = '1.0.0';
export const DEFAULT_BASE_URL = 'http://localhost:4003';

/**
 * Create a new CODAI client instance
 * @param config Configuration options
 * @returns Configured CODAI client
 */
export function createClient(config?: Partial<CodeaiConfig>) {
    return new CodeaiClient(config);
}
