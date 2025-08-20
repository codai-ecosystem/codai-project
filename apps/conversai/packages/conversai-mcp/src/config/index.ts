/**
 * Configuration management for ConversAI MCP Server
 */

import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from workspace root first
const workspaceRoot = path.resolve(process.cwd(), '../../../../');
dotenv.config({ path: path.join(workspaceRoot, '.env') });

// Also load local .env if it exists
dotenv.config();

/**
 * Environment schema validation
 */
const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  SERVER_NAME: z.string().default('@codai/conversai-mcp'),
  SERVER_VERSION: z.string().default('1.0.0'),
  API_TIMEOUT: z.coerce.number().default(30000),
  ENABLE_CORS: z.string().default('true').transform(val => val === 'true'),
  RATE_LIMIT_WINDOW: z.coerce.number().default(900000), // 15 minutes
  RATE_LIMIT_MAX: z.coerce.number().default(100),
});

/**
 * Parse and validate environment variables
 */
const env = configSchema.parse(process.env);

/**
 * Application configuration
 */
export const config = {
  environment: env.NODE_ENV,

  server: {
    name: env.SERVER_NAME,
    version: env.SERVER_VERSION,
    timeout: env.API_TIMEOUT,
  },

  logging: {
    level: env.LOG_LEVEL,
  },

  security: {
    enableCors: env.ENABLE_CORS,
    rateLimit: {
      windowMs: env.RATE_LIMIT_WINDOW,
      max: env.RATE_LIMIT_MAX,
    },
  },
} as const;

export type Config = typeof config;
