/**
 * Configuration management for AIDE integration
 */

import { z } from 'zod';

export const IntegrationConfigSchema = z.object({
  environment: z.enum(['development', 'staging', 'production']).default('development'),
  region: z.string().default('us-east-1'),

  // Service endpoints
  endpoints: z.object({
    analytics: z.string().optional(),
    auth: z.string().optional(),
    memory: z.string().optional(),
    ai: z.string().optional(),
  }).optional(),

  // Feature flags
  features: z.object({
    realTimeCollaboration: z.boolean().default(true),
    advancedAnalytics: z.boolean().default(true),
    aiAssistant: z.boolean().default(true),
    projectTemplates: z.boolean().default(true),
  }).default({}),

  // Security settings
  security: z.object({
    enableEncryption: z.boolean().default(true),
    sessionTimeout: z.number().default(3600), // 1 hour in seconds
    rateLimiting: z.boolean().default(true),
  }).default({}),

  // Performance settings
  performance: z.object({
    cacheTimeout: z.number().default(300), // 5 minutes
    maxConcurrentRequests: z.number().default(100),
    requestTimeout: z.number().default(30000), // 30 seconds
  }).default({}),
});

export type IntegrationConfig = z.infer<typeof IntegrationConfigSchema>;

/**
 * Load configuration from environment variables or defaults
 */
export function loadConfig(): IntegrationConfig {
  const config = {
    environment: (process.env.NODE_ENV as any) || 'development',
    region: process.env.AIDE_REGION || 'us-east-1',

    endpoints: {
      analytics: process.env.AIDE_ANALYTICS_ENDPOINT,
      auth: process.env.AIDE_AUTH_ENDPOINT,
      memory: process.env.AIDE_MEMORY_ENDPOINT,
      ai: process.env.AIDE_AI_ENDPOINT,
    },

    features: {
      realTimeCollaboration: process.env.AIDE_REALTIME_ENABLED !== 'false',
      advancedAnalytics: process.env.AIDE_ANALYTICS_ENABLED !== 'false',
      aiAssistant: process.env.AIDE_AI_ENABLED !== 'false',
      projectTemplates: process.env.AIDE_TEMPLATES_ENABLED !== 'false',
    },

    security: {
      enableEncryption: process.env.AIDE_ENCRYPTION_ENABLED !== 'false',
      sessionTimeout: parseInt(process.env.AIDE_SESSION_TIMEOUT || '3600'),
      rateLimiting: process.env.AIDE_RATE_LIMITING_ENABLED !== 'false',
    },

    performance: {
      cacheTimeout: parseInt(process.env.AIDE_CACHE_TIMEOUT || '300'),
      maxConcurrentRequests: parseInt(process.env.AIDE_MAX_REQUESTS || '100'),
      requestTimeout: parseInt(process.env.AIDE_REQUEST_TIMEOUT || '30000'),
    },
  };

  return IntegrationConfigSchema.parse(config);
}
