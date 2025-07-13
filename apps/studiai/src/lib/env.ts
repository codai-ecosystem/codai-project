/**
 * Unified Environment Configuration and Validation
 *
 * This is the consolidated environment validation system for the METU Template.
 * It combines the best features from the previous environment validation files
 * and provides comprehensive runtime validation, type safety, and security.
 *
 * @version 2.0.0
 * @author METU Template Team
 */

import { z } from 'zod';

// Conditional logger import with fallback
let logger: {
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
};
try {
  logger = (require('./logger') as { logger: typeof logger }).logger;
} catch {
  // Fallback logger if the logger module doesn't exist
  logger = {
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: console.debug,
  };
}

/**
 * Client-side environment variables schema
 * These variables are available to the browser
 */
const clientEnvSchema = z.object({
  // Firebase Integration Flag
  NEXT_PUBLIC_FIREBASE_ENABLED: z
    .string()
    .optional()
    .transform(val => val === 'true'),

  // Firebase Configuration (Optional based on FIREBASE_ENABLED)
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().optional(),

  // Firebase Optional Configuration
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_DATABASE_URL: z.string().url().optional(),

  // Application Configuration
  NEXT_PUBLIC_APP_NAME: z.string().default('METU Template'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_APP_DESCRIPTION: z.string().optional(),
  NEXT_PUBLIC_APP_VERSION: z.string().optional(),
  NEXT_PUBLIC_APP_ENV: z
    .enum(['development', 'staging', 'production'])
    .default('development'),
  NEXT_PUBLIC_DEFAULT_LOCALE: z.enum(['en', 'ro']).default('en'),

  // Feature Flags
  NEXT_PUBLIC_ENABLE_ANALYTICS: z
    .enum(['true', 'false'])
    .default('false')
    .transform(val => val === 'true'),
  NEXT_PUBLIC_ENABLE_PWA: z
    .enum(['true', 'false'])
    .default('true')
    .transform(val => val === 'true'),
  NEXT_PUBLIC_ENABLE_I18N: z
    .enum(['true', 'false'])
    .default('true')
    .transform(val => val === 'true'),
  NEXT_PUBLIC_DEBUG: z
    .enum(['true', 'false'])
    .default('false')
    .transform(val => val === 'true'),

  // Firebase Emulator Configuration
  NEXT_PUBLIC_USE_EMULATORS: z
    .enum(['true', 'false'])
    .optional()
    .transform(val => val === 'true'),

  // Third-party Service Integrations
  NEXT_PUBLIC_ANALYTICS_ID: z.string().optional(),
  NEXT_PUBLIC_MAPS_API_KEY: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY: z.string().optional(),
});

/**
 * Server-side environment variables schema
 * These variables are only available on the server
 */
const serverEnvSchema = z.object({
  // Node Environment
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  // Firebase Admin SDK (Server-side)
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().email().optional(),
  FIREBASE_PRIVATE_KEY: z
    .string()
    .optional()
    .transform(val => val?.replace(/\\n/g, '\n')), // Fix newlines in private key

  // Database Configuration
  DATABASE_URL: z.string().url().optional(),

  // Email Service Configuration
  RESEND_API_KEY: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().regex(/^\d+$/).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),

  // Authentication Services
  NEXTAUTH_SECRET: z.string().min(32).optional(),
  NEXTAUTH_URL: z.string().url().optional(),

  // API Keys for Server-side Services
  OPENAI_API_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Monitoring & Analytics
  SENTRY_DSN: z.string().url().optional(),
  VERCEL_URL: z.string().optional(),

  // Security
  ENCRYPTION_KEY: z.string().min(32).optional(),
  JWT_SECRET: z.string().min(32).optional(),
});

/**
 * Combined environment schema
 */
const envSchema = clientEnvSchema.merge(serverEnvSchema);

// Type definitions
type ClientEnv = z.infer<typeof clientEnvSchema>;
type ServerEnv = z.infer<typeof serverEnvSchema>;
type Env = z.infer<typeof envSchema>;

/**
 * Environment validation cache to improve performance
 */
class EnvCache {
  private static instance: EnvCache | undefined;
  private clientEnv: ClientEnv | null = null;
  private serverEnv: ServerEnv | null = null;
  private lastValidation = 0;
  private readonly cacheTimeout = 60000; // 1 minute

  static getInstance(): EnvCache {
    if (!EnvCache.instance) {
      EnvCache.instance = new EnvCache();
    }
    return EnvCache.instance;
  }

  isValid(): boolean {
    return Date.now() - this.lastValidation < this.cacheTimeout;
  }

  setClient(env: ClientEnv): void {
    this.clientEnv = env;
    this.lastValidation = Date.now();
  }

  setServer(env: ServerEnv): void {
    this.serverEnv = env;
    this.lastValidation = Date.now();
  }

  getClient(): ClientEnv | null {
    return this.isValid() ? this.clientEnv : null;
  }

  getServer(): ServerEnv | null {
    return this.isValid() ? this.serverEnv : null;
  }

  clear(): void {
    this.clientEnv = null;
    this.serverEnv = null;
    this.lastValidation = 0;
  }
}

/**
 * Validate client-side environment variables
 */
export function validateClientEnv(): ClientEnv {
  const cache = EnvCache.getInstance();
  const cachedEnv = cache.getClient();

  if (cachedEnv != null) {
    return cachedEnv;
  }

  try {
    const rawEnv = {
      NEXT_PUBLIC_FIREBASE_ENABLED: process.env['NEXT_PUBLIC_FIREBASE_ENABLED'],
      NEXT_PUBLIC_FIREBASE_API_KEY: process.env['NEXT_PUBLIC_FIREBASE_API_KEY'],
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
        process.env['NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'],
      NEXT_PUBLIC_FIREBASE_PROJECT_ID:
        process.env['NEXT_PUBLIC_FIREBASE_PROJECT_ID'],
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
        process.env['NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'],
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
        process.env['NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'],
      NEXT_PUBLIC_FIREBASE_APP_ID: process.env['NEXT_PUBLIC_FIREBASE_APP_ID'],
      NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID:
        process.env['NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID'],
      NEXT_PUBLIC_FIREBASE_DATABASE_URL:
        process.env['NEXT_PUBLIC_FIREBASE_DATABASE_URL'],
      NEXT_PUBLIC_APP_NAME: process.env['NEXT_PUBLIC_APP_NAME'],
      NEXT_PUBLIC_APP_URL: process.env['NEXT_PUBLIC_APP_URL'],
      NEXT_PUBLIC_APP_DESCRIPTION: process.env['NEXT_PUBLIC_APP_DESCRIPTION'],
      NEXT_PUBLIC_APP_VERSION: process.env['NEXT_PUBLIC_APP_VERSION'],
      NEXT_PUBLIC_APP_ENV: process.env['NEXT_PUBLIC_APP_ENV'],
      NEXT_PUBLIC_DEFAULT_LOCALE: process.env['NEXT_PUBLIC_DEFAULT_LOCALE'],
      NEXT_PUBLIC_ENABLE_ANALYTICS: process.env['NEXT_PUBLIC_ENABLE_ANALYTICS'],
      NEXT_PUBLIC_ENABLE_PWA: process.env['NEXT_PUBLIC_ENABLE_PWA'],
      NEXT_PUBLIC_ENABLE_I18N: process.env['NEXT_PUBLIC_ENABLE_I18N'],
      NEXT_PUBLIC_DEBUG: process.env['NEXT_PUBLIC_DEBUG'],
      NEXT_PUBLIC_ANALYTICS_ID: process.env['NEXT_PUBLIC_ANALYTICS_ID'],
      NEXT_PUBLIC_MAPS_API_KEY: process.env['NEXT_PUBLIC_MAPS_API_KEY'],
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
        process.env['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'],
      NEXT_PUBLIC_RECAPTCHA_SITE_KEY:
        process.env['NEXT_PUBLIC_RECAPTCHA_SITE_KEY'],
    };

    const validatedEnv = clientEnvSchema.parse(rawEnv);
    cache.setClient(validatedEnv);

    logger.info('Client environment validation successful');
    return validatedEnv;
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
        received: 'received' in issue ? issue.received : undefined,
      }));

      logger.error('Client environment validation failed', {
        context: { issues },
      });

      throw new Error(
        `Client environment validation failed:\n${issues
          .map(i => `  • ${i.path}: ${i.message}`)
          .join(
            '\n'
          )}\n\nPlease check your .env.local file and ensure all required variables are set.`
      );
    }

    logger.error('Client environment validation error', {
      context: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    throw new Error('Invalid client environment configuration');
  }
}

/**
 * Validate server-side environment variables
 */
export function validateServerEnv(): ServerEnv {
  const cache = EnvCache.getInstance();
  const cachedEnv = cache.getServer();

  if (cachedEnv != null) {
    return cachedEnv;
  }

  try {
    const rawEnv = {
      NODE_ENV: process.env['NODE_ENV'],
      FIREBASE_PROJECT_ID: process.env['FIREBASE_PROJECT_ID'],
      FIREBASE_CLIENT_EMAIL: process.env['FIREBASE_CLIENT_EMAIL'],
      FIREBASE_PRIVATE_KEY: process.env['FIREBASE_PRIVATE_KEY'],
      DATABASE_URL: process.env['DATABASE_URL'],
      RESEND_API_KEY: process.env['RESEND_API_KEY'],
      SMTP_HOST: process.env['SMTP_HOST'],
      SMTP_PORT: process.env['SMTP_PORT'],
      SMTP_USER: process.env['SMTP_USER'],
      SMTP_PASSWORD: process.env['SMTP_PASSWORD'],
      NEXTAUTH_SECRET: process.env['NEXTAUTH_SECRET'],
      NEXTAUTH_URL: process.env['NEXTAUTH_URL'],
      OPENAI_API_KEY: process.env['OPENAI_API_KEY'],
      STRIPE_SECRET_KEY: process.env['STRIPE_SECRET_KEY'],
      STRIPE_WEBHOOK_SECRET: process.env['STRIPE_WEBHOOK_SECRET'],
      SENTRY_DSN: process.env['SENTRY_DSN'],
      VERCEL_URL: process.env['VERCEL_URL'],
      ENCRYPTION_KEY: process.env['ENCRYPTION_KEY'],
      JWT_SECRET: process.env['JWT_SECRET'],
    };

    const validatedEnv = serverEnvSchema.parse(rawEnv);
    cache.setServer(validatedEnv);

    logger.info('Server environment validation successful');
    return validatedEnv;
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
        received: 'received' in issue ? issue.received : undefined,
      }));

      logger.error('Server environment validation failed', {
        context: { issues },
      });

      throw new Error(
        `Server environment validation failed:\n${issues
          .map(i => `  • ${i.path}: ${i.message}`)
          .join('\n')}`
      );
    }

    logger.error('Server environment validation error', {
      context: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    throw new Error('Invalid server environment configuration');
  }
}

/**
 * Get validated environment variables with proper client/server separation
 */
export function getEnv(): Partial<Env> {
  try {
    const client = validateClientEnv();

    // Only validate server env on server side
    if (typeof window === 'undefined') {
      const server = validateServerEnv();
      return { ...client, ...server };
    }

    return client;
  } catch (error: unknown) {
    logger.warn('Environment validation failed, using partial environment', {
      context: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    return {
      NODE_ENV: 'development',
    };
  }
}

/**
 * Check if Firebase configuration is complete and valid
 */
export function isFirebaseConfigComplete(): boolean {
  try {
    const env = validateClientEnv();
    return Boolean(
      env.NEXT_PUBLIC_FIREBASE_API_KEY &&
        env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
        env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
        env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
        env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
        env.NEXT_PUBLIC_FIREBASE_APP_ID
    );
  } catch {
    return false;
  }
}

/**
 * Check if Firebase integration is enabled
 */
export function isFirebaseEnabled(): boolean {
  try {
    const env = validateClientEnv();
    return env.NEXT_PUBLIC_FIREBASE_ENABLED === true;
  } catch {
    return false; // Default to disabled if validation fails
  }
}

/**
 * Environment helper functions
 */
export function isDevelopment(): boolean {
  return process.env['NODE_ENV'] === 'development';
}

export function isProduction(): boolean {
  return process.env['NODE_ENV'] === 'production';
}

export function isTest(): boolean {
  return process.env['NODE_ENV'] === 'test';
}

/**
 * Feature flag helpers with proper type safety
 */
export function isAnalyticsEnabled(): boolean {
  try {
    const env = validateClientEnv();
    return env.NEXT_PUBLIC_ENABLE_ANALYTICS;
  } catch {
    return false;
  }
}

export function isPwaEnabled(): boolean {
  try {
    const env = validateClientEnv();
    return env.NEXT_PUBLIC_ENABLE_PWA;
  } catch {
    return true; // Default to enabled
  }
}

export function isI18nEnabled(): boolean {
  try {
    const env = validateClientEnv();
    return env.NEXT_PUBLIC_ENABLE_I18N;
  } catch {
    return true; // Default to enabled
  }
}

export function isDebugEnabled(): boolean {
  try {
    const env = validateClientEnv();
    return env.NEXT_PUBLIC_DEBUG;
  } catch {
    return isDevelopment(); // Default to dev mode
  }
}

/**
 * Get Firebase configuration object for SDK initialization
 * Returns null if Firebase is disabled or not configured
 */
export function getFirebaseConfig(): {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
  databaseURL?: string;
} | null {
  const env = validateClientEnv();

  // Check if Firebase is enabled and configured
  if (!env.NEXT_PUBLIC_FIREBASE_ENABLED) {
    return null;
  }

  // Validate required Firebase configuration
  const requiredFields = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ];

  const missingFields = requiredFields.filter(
    field => !env[field as keyof typeof env]
  );

  if (missingFields.length > 0) {
    console.warn(
      `Firebase is enabled but missing required configuration: ${missingFields.join(', ')}`
    );
    return null;
  }

  const config: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
    databaseURL?: string;
  } = {
    apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  };

  if (env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID !== undefined) {
    config.measurementId = env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;
  }

  if (env.NEXT_PUBLIC_FIREBASE_DATABASE_URL !== undefined) {
    config.databaseURL = env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
  }

  return config;
}

/**
 * Runtime environment validation for critical startup
 * Call this early in your application lifecycle
 */
export function validateRuntimeEnvironment(): void {
  if (typeof window !== 'undefined') {
    // Client-side validation
    try {
      validateClientEnv();
      logger.info('Runtime environment validation successful');
    } catch (error: unknown) {
      logger.error('Runtime environment validation failed', {
        context: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      // In production, this should potentially stop the app
      if (isProduction()) {
        throw error;
      }
    }
  } else {
    // Server-side validation (minimal for startup)
    try {
      validateClientEnv(); // Client env is needed on server for SSR
      logger.info('Server runtime environment validation successful');
    } catch (error: unknown) {
      logger.error('Server runtime environment validation failed', {
        context: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      if (isProduction()) {
        throw error;
      }
    }
  }
}

/**
 * Clear environment cache (useful for testing or dynamic config changes)
 */
export function clearEnvCache(): void {
  EnvCache.getInstance().clear();
}

/**
 * Get app metadata from environment
 */
export function getAppMetadata(): {
  name: string;
  version: string;
  description: string;
  author: string;
  url: string;
  environment: string;
  locale: string;
} {
  const env = validateClientEnv();

  return {
    name: env.NEXT_PUBLIC_APP_NAME,
    url: env.NEXT_PUBLIC_APP_URL,
    description: env.NEXT_PUBLIC_APP_DESCRIPTION ?? '',
    version: env.NEXT_PUBLIC_APP_VERSION ?? '1.0.0',
    author: 'METU Template',
    environment: env.NEXT_PUBLIC_APP_ENV,
    locale: env.NEXT_PUBLIC_DEFAULT_LOCALE,
  };
}

/**
 * Main environment validation function for backward compatibility
 * @deprecated Use validateClientEnv() or validateServerEnv() instead
 */
export function validateEnvironment(): Env {
  if (typeof window !== 'undefined') {
    // Client-side
    return validateClientEnv() as Env;
  } else {
    // Server-side
    return validateServerEnv() as Env;
  }
}

// Export types for external use
export type { ClientEnv, Env, ServerEnv };

// Export schemas for external validation if needed
export { clientEnvSchema, envSchema, serverEnvSchema };

// Export cache class for advanced use cases
export { EnvCache };
