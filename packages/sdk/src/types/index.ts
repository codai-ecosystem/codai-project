import { z } from 'zod';

// Universal configuration schema for CODAI ecosystem
export const CodaiConfigSchema = z.object({
  appId: z.string().min(1, 'App ID is required'),
  environment: z.enum(['development', 'staging', 'production']),
  apiVersion: z.string().default('v1'),
  baseUrl: z.string().url().optional(),

  // Service endpoints
  endpoints: z.object({
    auth: z.string().url().default('https://logai.ro/api'),
    storage: z.string().url().default('https://stocai.ro/api'),
    memory: z.string().url().default('https://memorai.ro/api'),
    analytics: z.string().url().default('https://analizai.ro/api'),
    wallet: z.string().url().default('https://bancai.ro/api'),
    marketplace: z.string().url().default('https://marketai.ro/api'),
    legal: z.string().url().default('https://legalizai.ro/api'),
    support: z.string().url().default('https://ajutai.ro/api'),
    identity: z.string().url().default('https://id.codai.ro/api'),
    gateway: z.string().url().default('https://api.codai.ro')
  }).partial(),

  // Authentication configuration
  authentication: z.object({
    enabled: z.boolean().default(true),
    ssoEnabled: z.boolean().default(true),
    sessionTimeout: z.number().default(24 * 60 * 60 * 1000), // 24 hours
    refreshThreshold: z.number().default(5 * 60 * 1000), // 5 minutes
    storage: z.enum(['localStorage', 'sessionStorage', 'memory']).default('localStorage')
  }).partial(),

  // Security configuration
  security: z.object({
    encryption: z.object({
      enabled: z.boolean().default(true),
      algorithm: z.string().default('AES-256-GCM')
    }).partial(),
    rateLimiting: z.object({
      enabled: z.boolean().default(true),
      maxRequests: z.number().default(1000),
      windowMs: z.number().default(60 * 1000) // 1 minute
    }).partial()
  }).partial(),

  // Compliance settings
  compliance: z.object({
    gdpr: z.boolean().default(true),
    ccpa: z.boolean().default(true),
    hipaa: z.boolean().default(false),
    auditLogging: z.boolean().default(true)
  }).partial(),

  // Request settings
  timeout: z.number().default(30000),
  retryAttempts: z.number().default(3),
  retryDelay: z.number().default(1000),

  // Monitoring settings
  debug: z.boolean().default(false),
  telemetry: z.boolean().default(true),
  healthCheckInterval: z.number().default(60000), // 1 minute
  startTime: z.number().optional(),

  // Custom configuration
  custom: z.record(z.string(), z.unknown()).optional()
});

export type CodaiConfig = z.infer<typeof CodaiConfigSchema>;

// Event map for type-safe event handling
export interface CodaiEventMap {
  'sdk:init:start': { version: string; config: CodaiConfig; timestamp: Date };
  'sdk:init:complete': { version: string; successful: number; failed: number; timestamp: Date };
  'sdk:init:error': { error: string; timestamp: Date };
  'sdk:config:updated': { updates: Partial<CodaiConfig>; timestamp: Date };
  'sdk:destroy:start': { timestamp: Date };
  'sdk:destroy:complete': { timestamp: Date };
  'sdk:health:check': any;
  'sdk:health:unhealthy': { services: any; timestamp: Date };
  'app:communication:message': { fromApp: string; toApp: string; data: any; timestamp: Date };
  'app:communication:broadcast': { fromApp: string; data: any; timestamp: Date };
  'app:navigation:route_change': { app: string; route: string; timestamp: Date };
  'app:state:sync': { app: string; state: any; timestamp: Date };
  'user:authentication:login': { userId: string; timestamp: Date };
  'user:authentication:logout': { userId: string; timestamp: Date };
  'system:maintenance:start': { timestamp: Date };
  'system:maintenance:end': { timestamp: Date };
}

// SDK Options
export const CodaiSDKOptionsSchema = z.object({
  config: CodaiConfigSchema,
  plugins: z.array(z.any()).optional(),
  interceptors: z.object({
    request: z.array(z.any()).optional(),
    response: z.array(z.any()).optional()
  }).optional()
});

export type CodaiSDKOptions = z.infer<typeof CodaiSDKOptionsSchema>;

// Service configuration interfaces
export interface ServiceConfig {
  endpoint: string;
  timeout: number;
  retries: number;
  headers: Record<string, string>;
}

export interface AuthConfig extends ServiceConfig {
  clientId: string;
  scopes: string[];
  redirectUri?: string;
}

export interface StorageConfig extends ServiceConfig {
  maxFileSize: number;
  allowedTypes: string[];
  encryption: boolean;
}

export interface MemoryConfig extends ServiceConfig {
  contextSize: number;
  persistenceEnabled: boolean;
  compressionEnabled: boolean;
}

export interface AnalyticsConfig extends ServiceConfig {
  trackingEnabled: boolean;
  anonymizeData: boolean;
  batchSize: number;
}

export interface WalletConfig extends ServiceConfig {
  networks: string[];
  defaultCurrency: string;
  testMode: boolean;
}

export interface MarketplaceConfig extends ServiceConfig {
  commissionsEnabled: boolean;
  escrowEnabled: boolean;
  ratingsEnabled: boolean;
}

export interface LegalConfig extends ServiceConfig {
  jurisdiction: string;
  complianceLevel: 'basic' | 'enterprise' | 'government';
  auditRequired: boolean;
}

export interface SupportConfig extends ServiceConfig {
  channels: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  escalationEnabled: boolean;
}

export interface IdentityConfig extends ServiceConfig {
  verificationLevel: 'basic' | 'enhanced' | 'premium';
  biometricEnabled: boolean;
  socialLinksEnabled: boolean;
}
