/**
 * Environment Variable Validation Utility
 * Ensures all required environment variables are present and valid
 */

import { z } from 'zod';

// Define the schema for environment variables
const envSchema = z.object({
  // Node environment
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // Server configuration
  PORT: z.string().default('6366').transform(Number),
  WEB_PORT: z.string().default('6366').transform(Number),

  // Database configuration
  QDRANT_URL: z.string().url().optional(),
  QDRANT_API_KEY: z.string().optional(),

  // OpenAI configuration
  OPENAI_API_KEY: z.string().min(1, 'OpenAI API key is required'),
  OPENAI_MODEL: z.string().default('gpt-4'),

  // Azure OpenAI configuration (optional)
  AZURE_OPENAI_API_KEY: z.string().optional(),
  AZURE_OPENAI_ENDPOINT: z.string().url().optional(),
  AZURE_OPENAI_API_VERSION: z.string().optional(),
  AZURE_OPENAI_DEPLOYMENT_NAME: z.string().optional(),

  // System configuration
  SYSTEM_TIER: z.enum(['free', 'pro', 'enterprise']).default('free'),
  MAX_MEMORIES: z.string().default('1000').transform(Number),
  DEFAULT_AGENT_ID: z.string().default('default'),

  // Security
  SESSION_SECRET: z
    .string()
    .min(32, 'Session secret must be at least 32 characters'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // Feature flags
  ENABLE_ANALYTICS: z.string().default('true').transform(Boolean),
  ENABLE_REAL_TIME: z.string().default('true').transform(Boolean),
  ENABLE_CACHING: z.string().default('true').transform(Boolean),

  // Performance
  CACHE_TTL: z.string().default('300').transform(Number), // 5 minutes
  REQUEST_TIMEOUT: z.string().default('10000').transform(Number), // 10 seconds
  MAX_REQUEST_SIZE: z.string().default('10mb'),
});

export type Environment = z.infer<typeof envSchema>;

let validatedEnv: Environment | null = null;

/**
 * Validates and returns the environment configuration
 * @throws {Error} If validation fails
 */
export function getValidatedEnv(): Environment {
  if (validatedEnv) {
    return validatedEnv;
  }

  try {
    validatedEnv = envSchema.parse(process.env);
    return validatedEnv;
  } catch (_error) {
    if (_error instanceof z.ZodError) {
      const errorMessage = _error.issues
        .map((err: any) => `${err.path.join('.')}: ${err.message}`)
        .join('\n');

      throw new Error(
        `Environment validation failed:\n${errorMessage}\n\n` +
        'Please check your .env file and ensure all required variables are set.'
      );
    }
    throw _error;
  }
}

/**
 * Validates environment on application startup
 */
export function validateEnvironmentOnStartup(): void {
  try {
    const env = getValidatedEnv();
    console.log('✅ Environment validation successful');
    console.log(`📝 Running in ${env.NODE_ENV} mode`);
    console.log(`🔧 System tier: ${env.SYSTEM_TIER}`);
    console.log(`🚀 Server will run on port ${env.WEB_PORT}`);

    // Log warnings for optional but recommended variables
    if (!env.QDRANT_URL) {
      console.warn('⚠️  QDRANT_URL not set - using in-memory storage');
    }

    if (!env.AZURE_OPENAI_API_KEY && env.NODE_ENV === 'production') {
      console.warn('⚠️  Azure OpenAI not configured - using OpenAI only');
    }
  } catch (_error) {
    console.error('❌ Environment validation failed:');
    console.error(_error instanceof Error ? _error.message : String(_error));
    process.exit(1);
  }
}

/**
 * Checks if running in production mode
 */
export function isProduction(): boolean {
  return getValidatedEnv().NODE_ENV === 'production';
}

/**
 * Checks if running in development mode
 */
export function isDevelopment(): boolean {
  return getValidatedEnv().NODE_ENV === 'development';
}

/**
 * Checks if running in test mode
 */
export function isTest(): boolean {
  return getValidatedEnv().NODE_ENV === 'test';
}

/**
 * Gets the current system tier
 */
export function getSystemTier(): 'free' | 'pro' | 'enterprise' {
  return getValidatedEnv().SYSTEM_TIER;
}

/**
 * Safely get environment variable with fallback
 */
export function getEnvVar(key: keyof Environment, fallback?: string): string {
  const env = getValidatedEnv();
  const value = env[key];

  if (value === undefined || value === null) {
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error(
      `Environment variable ${key} is not set and no fallback provided`
    );
  }

  return String(value);
}
