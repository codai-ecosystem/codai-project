/**
 * Configuration management for MCP Server Template
 */

import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from workspace root
const workspaceRoot = path.resolve(process.cwd(), '../../');
dotenv.config({ path: path.join(workspaceRoot, '.env') });

// Also load local .env if it exists
dotenv.config();

/**
 * Environment schema validation
 */
const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  SERVER_NAME: z.string().default('@codai/ai-mcp'),
  SERVER_VERSION: z.string().default('1.0.0'),
  API_TIMEOUT: z.coerce.number().default(30000),
  ENABLE_CORS: z.string().transform(val => val === 'true').default('true'),
  RATE_LIMIT_WINDOW: z.coerce.number().default(900000), // 15 minutes
  RATE_LIMIT_MAX: z.coerce.number().default(100),

  // OpenAI Configuration
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_BASE_URL: z.string().optional(),

  // Azure OpenAI Configuration
  AZURE_OPENAI_ENDPOINT: z.string().optional(),
  AZURE_OPENAI_API_KEY: z.string().optional(),
  AZURE_OPENAI_API_VERSION: z.string().optional(),
  AZURE_OPENAI_DEPLOYMENTS: z.string().optional(),

  // Anthropic Configuration
  ANTHROPIC_API_KEY: z.string().optional(),

  // Hugging Face Configuration
  HUGGINGFACE_API_KEY: z.string().optional(),
  HUGGINGFACE_MODELS: z.string().optional(),

  // Ollama Configuration
  OLLAMA_ENDPOINT: z.string().optional(),
  OLLAMA_MODELS: z.string().optional(),
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

  // AI Provider Configurations
  openai: env.OPENAI_API_KEY ? {
    apiKey: env.OPENAI_API_KEY,
    baseUrl: env.OPENAI_BASE_URL,
  } : undefined,

  azure: env.AZURE_OPENAI_ENDPOINT && env.AZURE_OPENAI_API_KEY ? {
    endpoint: env.AZURE_OPENAI_ENDPOINT,
    apiKey: env.AZURE_OPENAI_API_KEY,
    apiVersion: env.AZURE_OPENAI_API_VERSION,
    deployments: env.AZURE_OPENAI_DEPLOYMENTS?.split(',').map(d => d.trim()),
  } : undefined,

  anthropic: env.ANTHROPIC_API_KEY ? {
    apiKey: env.ANTHROPIC_API_KEY,
  } : undefined,

  huggingface: env.HUGGINGFACE_API_KEY ? {
    apiKey: env.HUGGINGFACE_API_KEY,
    models: env.HUGGINGFACE_MODELS?.split(',').map(m => m.trim()),
  } : undefined,

  ollama: env.OLLAMA_ENDPOINT ? {
    endpoint: env.OLLAMA_ENDPOINT,
    models: env.OLLAMA_MODELS?.split(',').map(m => m.trim()),
  } : undefined,
} as const;

export type Config = typeof config;
