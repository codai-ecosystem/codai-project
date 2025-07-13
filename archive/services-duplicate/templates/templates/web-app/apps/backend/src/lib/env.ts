import * as dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
if (process.env['NODE_ENV'] === 'test') {
  dotenv.config({ path: ['.env.test', '.env.local', '.env'] });
} else {
  dotenv.config({ path: ['.env.local', '.env'] });
}

// Unique identifier for default JWT secret to avoid accidental use in production
const DEFAULT_JWT_SECRET = 'metu-template-dev-secret-CHANGE-IN-PRODUCTION';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z
    .string()
    .transform(val => Number(val))
    .default('3001'), // Use string as default
  HOST: z.string().default('0.0.0.0'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug', 'trace']).default('info'),

  // Firebase Integration Flag
  FIREBASE_ENABLED: z
    .string()
    .optional()
    .transform(val => val === 'true'),

  // Firebase Configuration (Optional based on FIREBASE_ENABLED)
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  FIREBASE_API_KEY: z.string().optional(),

  // JWT Configuration
  JWT_SECRET: z.string().min(1).default(DEFAULT_JWT_SECRET),
  JWT_EXPIRES_IN: z.string().default('3600'),

  // CORS Configuration
  CORS_ORIGIN: z
    .string()
    .transform(str => str.split(',').map(s => s.trim()))
    .default('http://localhost:3000'),

  // Rate Limiting Configuration
  RATE_LIMIT_MAX: z
    .string()
    .transform(val => Number(val))
    .default('100'),
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .transform(val => Number(val))
    .default('60000'), // Default 1 minute

  // Database Configuration (if needed for future use)
  DATABASE_URL: z.string().optional(),

  // Stripe Configuration
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_CONNECT_CLIENT_SECRET: z.string().optional(),
});

type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  try {
    const parsed = envSchema.parse(process.env);

    // Additional validation for Firebase configuration
    if (parsed.FIREBASE_ENABLED === true) {
      const missingFirebaseVars = [];

      if (
        typeof parsed.FIREBASE_PROJECT_ID !== 'string' ||
        parsed.FIREBASE_PROJECT_ID.trim() === ''
      ) {
        missingFirebaseVars.push('FIREBASE_PROJECT_ID');
      }

      if (missingFirebaseVars.length > 0) {
        const errorMessage = `
Firebase is enabled but missing required configuration:
${missingFirebaseVars.map(v => `  - ${v}`).join('\n')}

Either:
1. Set FIREBASE_ENABLED=false to disable Firebase integration, or
2. Provide the required Firebase configuration variables

See .env.example for reference.`;

        console.error(errorMessage);
        throw new Error(`Firebase configuration validation failed.`);
      }
    }

    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Prepare detailed error messages for each issue
      const errorDetails = error.issues
        .map(issue => {
          const path = issue.path.join('.');
          const message = issue.message;
          return `  - ${path}: ${message}`;
        })
        .join('\n');

      // Create a helpful error message that explains what's missing and what to do
      const errorMessage = `
Environment validation failed:
${errorDetails}

Please check your .env.local file or provide the required environment variables.
See .env.example for reference.`;

      console.error(errorMessage);
      throw new Error(`Environment validation failed. Check console for details.`);
    }
    throw error;
  }
}

export const env = validateEnv();
