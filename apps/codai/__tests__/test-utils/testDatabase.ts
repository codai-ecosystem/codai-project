import { db } from '../../src/lib/database';
import { redis } from '../../src/lib/redis';

export async function setupTestDatabase() {
    console.log('🧪 Setting up test database...');

    // Run migrations
    await db.migrate.latest();

    // Run seeds
    await db.seed.run();

    console.log('✅ Test database setup complete');
}

export async function cleanupTestDatabase() {
    console.log('🧹 Cleaning up test database...');

    // Rollback migrations
    await db.migrate.rollback();

    // Clear Redis
    await redis.flushall();

    console.log('✅ Test database cleanup complete');
}

export function createMockProjectData(overrides: any = {}) {
    return {
        id: 'test-project-' + Math.random().toString(36).substr(2, 9),
        name: 'Test Project',
        description: 'Test project description',
        language: 'typescript',
        framework: 'react',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...overrides
    };
}

export function createMockUserData(overrides: any = {}) {
    return {
        id: 'test-user-' + Math.random().toString(36).substr(2, 9),
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...overrides
    };
}
