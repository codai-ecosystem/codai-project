// Mock Redis connection for service
export const redis = {
  async get(key: string): Promise<string | null> {
    console.log(`Mock Redis GET: ${key}`);
    return null;
  },

  async set(key: string, value: string, options?: any): Promise<string> {
    console.log(`Mock Redis SET: ${key} = ${value}`, options);
    return 'OK';
  },

  async del(key: string): Promise<number> {
    console.log(`Mock Redis DEL: ${key}`);
    return 1;
  },

  async hget(key: string, field: string): Promise<string | null> {
    console.log(`Mock Redis HGET: ${key}.${field}`);
    return null;
  },

  async hset(key: string, field: string, value: string): Promise<number> {
    console.log(`Mock Redis HSET: ${key}.${field} = ${value}`);
    return 1;
  },

  async ping(): Promise<string> {
    console.log('Mock Redis PING');
    return 'PONG';
  },

  async flushall(): Promise<string> {
    console.log('Mock Redis FLUSHALL');
    return 'OK';
  },

  async quit(): Promise<void> {
    console.log('Mock Redis: Connection closed');
  }
};

export default redis;
