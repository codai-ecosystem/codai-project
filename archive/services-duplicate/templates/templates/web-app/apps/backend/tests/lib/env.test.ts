import { describe, expect, it } from 'vitest';

import { env } from '../../src/lib/env';

const LOG_MESSAGE = 'Starting new test with real services';

describe('Environment Configuration (Real Data)', () => {
  it('should load test environment variables correctly', () => {
    console.log(LOG_MESSAGE);

    // Test that we're in test environment
    expect(env.NODE_ENV).toBe('test'); // Test that required environment variables are loaded
    expect(env.JWT_SECRET).toBeDefined();
    expect(env.JWT_SECRET).toBe('test-jwt-secret-for-testing-only');
    expect(env.FIREBASE_PROJECT_ID).toBeDefined();
    expect(env.FIREBASE_PROJECT_ID).toBe('metu-template');

    expect(env.FIREBASE_CLIENT_EMAIL).toBeDefined();
    expect(env.FIREBASE_CLIENT_EMAIL).toContain('firebase-adminsdk');

    expect(env.FIREBASE_PRIVATE_KEY).toBeDefined();
    expect(env.FIREBASE_PRIVATE_KEY).toContain('BEGIN PRIVATE KEY');

    expect(env.PORT).toBe(3001);
    expect(env.HOST).toBe('localhost');
    expect(env.LOG_LEVEL).toBe('error');
  });

  it('should have proper CORS configuration for test environment', () => {
    console.log(LOG_MESSAGE);

    expect(env.CORS_ORIGIN).toBeDefined();
    expect(Array.isArray(env.CORS_ORIGIN)).toBe(true);
    expect(env.CORS_ORIGIN).toContain('http://localhost:3000');
  });

  it('should have rate limiting configuration', () => {
    console.log(LOG_MESSAGE);

    expect(env.RATE_LIMIT_MAX).toBeDefined();
    expect(env.RATE_LIMIT_MAX).toBe(1000);

    expect(env.RATE_LIMIT_WINDOW_MS).toBeDefined();
    expect(env.RATE_LIMIT_WINDOW_MS).toBe(60000);
  });
});
