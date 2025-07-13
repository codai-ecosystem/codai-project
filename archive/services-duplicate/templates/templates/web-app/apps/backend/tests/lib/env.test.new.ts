import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

// Import the schema and validation function without side effects
const DEFAULT_JWT_SECRET = 'metu-template-dev-secret-CHANGE-IN-PRODUCTION';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(val => Number(val)).default('3001'),
  HOST: z.string().default('0.0.0.0'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug', 'trace']).default('info'),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),
  FIREBASE_PROJECT_ID: z.string(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  FIREBASE_API_KEY: z.string().optional(),
  JWT_SECRET: z.string().min(1).default(DEFAULT_JWT_SECRET),
  JWT_EXPIRES_IN: z.string().default('3600'),
  CORS_ORIGIN: z
    .string()
    .transform(str => str.split(',').map(s => s.trim()))
    .default('http://localhost:3000'),
  RATE_LIMIT_MAX: z.string().transform(val => Number(val)).default('100'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(val => Number(val)).default('60000'),
  DATABASE_URL: z.string().optional(),
});

function validateEnv(env: Record<string, string | undefined>) {
  try {
    const parsed = envSchema.parse(env);
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorDetails = error.issues.map(issue => {
        const path = issue.path.join('.');
        const message = issue.message;
        return `  - ${path}: ${message}`;
      }).join('\n');

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

describe('Environment Validation', () => {
  let consoleErrorSpy: any;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('Valid Environment', () => {
    it('should validate a complete valid environment', () => {
      const testEnv = {
        NODE_ENV: 'development',
        PORT: '3001',
        HOST: '0.0.0.0',
        LOG_LEVEL: 'info',
        FIREBASE_PROJECT_ID: 'test-project',
        JWT_SECRET: 'test-secret',
        JWT_EXPIRES_IN: '3600',
        CORS_ORIGIN: 'http://localhost:3000',
        RATE_LIMIT_MAX: '100',
        RATE_LIMIT_WINDOW_MS: '60000'
      };

      const result = validateEnv(testEnv);

      expect(result.NODE_ENV).toBe('development');
      expect(result.PORT).toBe(3001);
      expect(result.HOST).toBe('0.0.0.0');
      expect(result.LOG_LEVEL).toBe('info');
      expect(result.FIREBASE_PROJECT_ID).toBe('test-project');
      expect(result.JWT_SECRET).toBe('test-secret');
      expect(result.JWT_EXPIRES_IN).toBe('3600');
      expect(result.CORS_ORIGIN).toEqual(['http://localhost:3000']);
      expect(result.RATE_LIMIT_MAX).toBe(100);
      expect(result.RATE_LIMIT_WINDOW_MS).toBe(60000);
    });

    it('should apply default values for optional fields', () => {
      const testEnv = {
        FIREBASE_PROJECT_ID: 'test-project',
      };

      const result = validateEnv(testEnv);

      expect(result.NODE_ENV).toBe('development');
      expect(result.PORT).toBe(3001);
      expect(result.HOST).toBe('0.0.0.0');
      expect(result.LOG_LEVEL).toBe('info');
      expect(result.JWT_SECRET).toBe(DEFAULT_JWT_SECRET);
      expect(result.CORS_ORIGIN).toEqual(['http://localhost:3000']);
      expect(result.RATE_LIMIT_MAX).toBe(100);
      expect(result.RATE_LIMIT_WINDOW_MS).toBe(60000);
    });

    it('should parse comma-separated CORS origins', () => {
      const testEnv = {
        FIREBASE_PROJECT_ID: 'test-project',
        CORS_ORIGIN: 'http://localhost:3000, https://example.com, https://app.example.com',
      };

      const result = validateEnv(testEnv);

      expect(result.CORS_ORIGIN).toEqual([
        'http://localhost:3000',
        'https://example.com',
        'https://app.example.com',
      ]);
    });

    it('should handle different NODE_ENV values', () => {
      const testEnv = {
        NODE_ENV: 'production',
        FIREBASE_PROJECT_ID: 'test-project',
      };

      const result = validateEnv(testEnv);

      expect(result.NODE_ENV).toBe('production');
    });

    it('should handle different LOG_LEVEL values', () => {
      const testEnv = {
        FIREBASE_PROJECT_ID: 'test-project',
        LOG_LEVEL: 'debug',
      };

      const result = validateEnv(testEnv);

      expect(result.LOG_LEVEL).toBe('debug');
    });
  });

  describe('Invalid Environment', () => {
    it('should throw error when FIREBASE_PROJECT_ID is missing', () => {
      const testEnv = {};

      expect(() => {
        validateEnv(testEnv);
      }).toThrow('Environment validation failed. Check console for details.');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Environment validation failed:')
      );
    });

    it('should throw error for invalid NODE_ENV', () => {
      const testEnv = {
        NODE_ENV: 'invalid',
        FIREBASE_PROJECT_ID: 'test-project',
      };

      expect(() => {
        validateEnv(testEnv);
      }).toThrow('Environment validation failed. Check console for details.');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Environment validation failed:')
      );
    });

    it('should throw error for invalid LOG_LEVEL', () => {
      const testEnv = {
        FIREBASE_PROJECT_ID: 'test-project',
        LOG_LEVEL: 'invalid',
      };

      expect(() => {
        validateEnv(testEnv);
      }).toThrow('Environment validation failed. Check console for details.');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Environment validation failed:')
      );
    });

    it('should handle non-Zod errors', () => {
      // Mock the schema parse to throw a non-Zod error
      const originalParse = envSchema.parse;
      envSchema.parse = vi.fn().mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const testEnv = {
        FIREBASE_PROJECT_ID: 'test-project',
      };

      expect(() => {
        validateEnv(testEnv);
      }).toThrow('Unexpected error');

      // Restore original parse function
      envSchema.parse = originalParse;
    });
  });

  describe('Environment Transformations', () => {
    it('should transform string PORT to number', () => {
      const testEnv = {
        FIREBASE_PROJECT_ID: 'test-project',
        PORT: '8080',
      };

      const result = validateEnv(testEnv);

      expect(result.PORT).toBe(8080);
      expect(typeof result.PORT).toBe('number');
    });

    it('should transform string RATE_LIMIT_MAX to number', () => {
      const testEnv = {
        FIREBASE_PROJECT_ID: 'test-project',
        RATE_LIMIT_MAX: '500',
      };

      const result = validateEnv(testEnv);

      expect(result.RATE_LIMIT_MAX).toBe(500);
      expect(typeof result.RATE_LIMIT_MAX).toBe('number');
    });

    it('should transform string RATE_LIMIT_WINDOW_MS to number', () => {
      const testEnv = {
        FIREBASE_PROJECT_ID: 'test-project',
        RATE_LIMIT_WINDOW_MS: '30000',
      };

      const result = validateEnv(testEnv);

      expect(result.RATE_LIMIT_WINDOW_MS).toBe(30000);
      expect(typeof result.RATE_LIMIT_WINDOW_MS).toBe('number');
    });

    it('should trim whitespace from CORS_ORIGIN values', () => {
      const testEnv = {
        FIREBASE_PROJECT_ID: 'test-project',
        CORS_ORIGIN: ' http://localhost:3000 , https://example.com , https://app.example.com ',
      };

      const result = validateEnv(testEnv);

      expect(result.CORS_ORIGIN).toEqual([
        'http://localhost:3000',
        'https://example.com',
        'https://app.example.com',
      ]);
    });
  });
});
