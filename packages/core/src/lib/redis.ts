import { Redis } from 'ioredis';
import { env } from './env';

let redis: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redis) {
    redis = new Redis({
      host: env.REDIS_HOST || 'localhost',
      port: parseInt(env.REDIS_PORT || '6379'),
      password: env.REDIS_PASSWORD,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 3,
      lazyConnect: true
    });

    redis.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    redis.on('error', (error) => {
      console.error('❌ Redis connection error:', error);
    });
  }

  return redis;
}

export async function disconnectRedis(): Promise<void> {
  if (redis) {
    await redis.disconnect();
    redis = null;
  }
}

export { redis };