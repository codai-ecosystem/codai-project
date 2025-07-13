import { describe, expect, it } from 'vitest';

describe('Environment Module Test', () => {
  it('should import env module without hanging', async () => {
    console.log('About to import env module...');

    // This will import and validate the environment
    const { env } = await import('../src/lib/env');

    console.log('Env module imported successfully');
    console.log('Firebase enabled:', env.FIREBASE_ENABLED);
    console.log('JWT Secret length:', env.JWT_SECRET.length);

    expect(env).toBeDefined();
    expect(env.NODE_ENV).toBe('test');
  });
});
