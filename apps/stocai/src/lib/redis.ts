// Mock Redis connection for service
interface RedisInterface {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, options?: unknown) => Promise<string>;
  del: (key: string) => Promise<number>;
  hget: (key: string, field: string) => Promise<string | null>;
  hset: (key: string, field: string, value: string) => Promise<number>;
  ping: () => Promise<string>;
  flushall: () => Promise<string>;
  quit: () => Promise<void>;
}

export const redis: RedisInterface = {
  async get(key: string) {
    console.log(`Mock Redis GET: ${key}`);
    return null;
  },

  async set(key: string, value: string, options?: unknown) {
    console.log(`Mock Redis SET: ${key} = ${value}`, options);
    return 'OK';
  },

  async del(key: string) {
    console.log(`Mock Redis DEL: ${key}`);
    return 1;
  },

  async hget(key: string, field: string) {
    console.log(`Mock Redis HGET: ${key}.${field}`);
    return null;
  },

  async hset(key: string, field: string, value: string) {
    console.log(`Mock Redis HSET: ${key}.${field} = ${value}`);
    return 1;
  },

  async ping() {
    console.log('Mock Redis PING');
    return 'PONG';
  },

  async flushall() {
    console.log('Mock Redis FLUSHALL');
    return 'OK';
  },

  async quit() {
    console.log('Mock Redis: Connection closed');
  }
};

export default redis;
