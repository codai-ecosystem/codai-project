import { db } from '../../src/lib/database';
import { redis } from '../../src/lib/redis';

export async function setupTestEnvironment() {
  console.log('🧪 Setting up test environment...');

  // Set test environment variables (fix for read-only NODE_ENV)
  if (!process.env.NODE_ENV) {
    (process.env as any).NODE_ENV = 'test';
  }
  process.env.DATABASE_URL =
    process.env.TEST_DATABASE_URL ||
    'postgresql://test:test@localhost:5432/test';
  process.env.REDIS_URL =
    process.env.TEST_REDIS_URL || 'redis://localhost:6379';

  // Setup database
  if (db) {
    try {
      console.log('✅ Database setup complete (mock)');
    } catch (error) {
      console.error('❌ Database setup failed:', error);
    }
  }

  // Setup Redis
  if (redis) {
    try {
      console.log('✅ Redis setup complete (mock)');
    } catch (error) {
      console.error('❌ Redis setup failed:', error);
    }
  }

  console.log('✅ Test environment setup complete');
}

export async function teardownTestEnvironment() {
  console.log('🧹 Tearing down test environment...');

  // Cleanup database
  if (db) {
    try {
      await db.close();
      console.log('✅ Database cleanup complete');
    } catch (error) {
      console.error('❌ Database cleanup failed:', error);
    }
  }

  // Cleanup Redis
  if (redis) {
    try {
      await redis.quit();
      console.log('✅ Redis cleanup complete');
    } catch (error) {
      console.error('❌ Redis cleanup failed:', error);
    }
  }

  console.log('✅ Test environment teardown complete');
}

export function createMockData(type: string, overrides: any = {}) {
  const mockData = {
    user: {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...overrides,
    },
    operation: {
      id: 'op-123',
      type: 'test-operation',
      status: 'pending',
      data: { test: true },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...overrides,
    },
  };

  return mockData[type as keyof typeof mockData] || {};
}

export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function waitForCondition(
  condition: () => Promise<boolean>,
  timeout = 5000,
  interval = 100
) {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    if (await condition()) {
      return true;
    }
    await delay(interval);
  }

  throw new Error(`Condition not met within ${timeout}ms`);
}
