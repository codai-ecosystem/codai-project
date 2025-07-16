import { app } from '../../src/app';
import { db } from '../../src/lib/database';
import { redis } from '../../src/lib/redis';

export async function createTestApp() {
    // Initialize test database
    await db.migrate.latest();
    await db.seed.run();

    // Initialize test Redis
    await redis.flushall();

    return app;
}

export async function cleanupTestApp() {
    // Cleanup database
    await db.migrate.rollback();

    // Cleanup Redis
    await redis.flushall();
    await redis.quit();
}
