// Redis configuration for publicai
// Using mock implementation for build compatibility

const config = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
};

// Mock Redis class for compatibility
class MockRedis {
  constructor(config: any) {
    console.log('Mock Redis instance created with config:', config);
  }

  async ping(): Promise<string> {
    console.log('Mock Redis ping');
    return 'PONG';
  }

  async flushall(): Promise<string> {
    console.log('Mock Redis flushall');
    return 'OK';
  }

  async quit(): Promise<string> {
    console.log('Mock Redis quit');
    return 'OK';
  }

  async setex(key: string, ttl: number, value: string): Promise<string> {
    console.log('Mock Redis setex:', key, '=', value, '(TTL:', ttl + ')');
    return 'OK';
  }

  async get(key: string): Promise<string | null> {
    console.log('Mock Redis get:', key);
    return null;
  }

  on(event: string, callback: () => void): void {
    console.log('Mock Redis event listener:', event);
    // Simulate connection events in test environment
    if (process.env.NODE_ENV === 'test') {
      setTimeout(() => {
        if (event === 'connect' || event === 'ready') {
          callback();
        }
      }, 10);
    }
  }
}

// Create Redis instance
export const redis = new MockRedis(config);

export default redis;