// Redis configuration for Bancai financial platform
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

    async ping() {
        console.log('Mock Redis ping');
        return 'PONG';
    }

    async flushall() {
        console.log('Mock Redis flushall');
        return 'OK';
    }

    async quit() {
        console.log('Mock Redis quit');
        return 'OK';
    }

    async setex(key: string, ttl: number, value: string) {
        console.log(`Mock Redis setex: ${key} = ${value} (TTL: ${ttl})`);
        return 'OK';
    }

    async get(key: string) {
        console.log(`Mock Redis get: ${key}`);
        return null;
    }

    on(event: string, callback: Function) {
        console.log(`Mock Redis event listener: ${event}`);
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

// Enhanced interface with financial-specific methods
export const financeCache = {
    // Set account data with expiration
    setAccountData: async (accountId: string, data: any, ttl = 300) => {
        return redis.setex(`account:${accountId}`, ttl, JSON.stringify(data));
    },

    // Get account data
    getAccountData: async (accountId: string) => {
        const data = await redis.get(`account:${accountId}`);
        return data ? JSON.parse(data) : null;
    },

    // Set user session
    setUserSession: async (userId: string, sessionData: any, ttl = 3600) => {
        return redis.setex(`session:${userId}`, ttl, JSON.stringify(sessionData));
    },

    // Get user session
    getUserSession: async (userId: string) => {
        const data = await redis.get(`session:${userId}`);
        return data ? JSON.parse(data) : null;
    },

    // Transaction cache
    setTransaction: async (txId: string, transaction: any, ttl = 600) => {
        return redis.setex(`tx:${txId}`, ttl, JSON.stringify(transaction));
    },

    getTransaction: async (txId: string) => {
        const data = await redis.get(`tx:${txId}`);
        return data ? JSON.parse(data) : null;
    }
};

export default redis;
