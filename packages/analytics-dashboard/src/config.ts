// Analytics Dashboard Configuration Management
import { AnalyticsConfig } from './types.js';

export interface AnalyticsEnv {
  // WebSocket Configuration
  ANALYTICS_WEBSOCKET_PORT: string;
  ANALYTICS_WEBSOCKET_PATH: string;
  ANALYTICS_HEARTBEAT_INTERVAL: string;

  // Metrics Configuration
  METRICS_RETENTION_DAYS: string;
  METRICS_BATCH_SIZE: string;

  // Database Configuration
  POSTGRES_HOST: string;
  POSTGRES_PORT: string;
  POSTGRES_DB: string;
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;

  REDIS_HOST: string;
  REDIS_PORT: string;
  REDIS_PASSWORD?: string;
  REDIS_KEY_PREFIX: string;

  NEO4J_URI?: string;
  NEO4J_USERNAME?: string;
  NEO4J_PASSWORD?: string;

  // Service URLs
  IDENTITY_API_URL: string;
  API_GATEWAY_URL: string;
  HUB_API_URL: string;
  MEMORAI_MCP_URL: string;
  CBD_DATABASE_URL: string;
  MEMORAI_FRONTEND_URL: string;

  // Security Configuration
  ANALYTICS_ENABLE_AUTH: string;
  ANALYTICS_ALLOWED_ORIGINS: string;
  ANALYTICS_RATE_LIMIT_WINDOW_MS: string;
  ANALYTICS_RATE_LIMIT_MAX_REQUESTS: string;

  // Optional Configuration
  NODE_ENV?: string;
  LOG_LEVEL?: string;
}

const requiredEnvVars: (keyof AnalyticsEnv)[] = [
  'ANALYTICS_WEBSOCKET_PORT',
  'POSTGRES_HOST',
  'POSTGRES_PORT',
  'POSTGRES_DB',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'REDIS_HOST',
  'REDIS_PORT',
  'IDENTITY_API_URL',
  'API_GATEWAY_URL',
  'HUB_API_URL',
  'MEMORAI_MCP_URL',
  'CBD_DATABASE_URL',
  'MEMORAI_FRONTEND_URL',
];

export function validateEnvironment(env: NodeJS.ProcessEnv): AnalyticsEnv {
  const errors: string[] = [];

  for (const required of requiredEnvVars) {
    if (!env[required]) {
      errors.push(`Missing required environment variable: ${required}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n${errors.join('\n')}`);
  }

  return env as unknown as AnalyticsEnv;
}

export function createAnalyticsConfig(env: AnalyticsEnv): AnalyticsConfig {
  return {
    websocket: {
      port: parseInt(env.ANALYTICS_WEBSOCKET_PORT) || 4350,
      path: env.ANALYTICS_WEBSOCKET_PATH || '/analytics/ws',
      heartbeat: parseInt(env.ANALYTICS_HEARTBEAT_INTERVAL) || 30,
    },
    metrics: {
      retention: parseInt(env.METRICS_RETENTION_DAYS) || 30,
      aggregationIntervals: [1, 5, 15, 60], // 1min, 5min, 15min, 1hour
      batchSize: parseInt(env.METRICS_BATCH_SIZE) || 100,
    },
    database: {
      postgres: {
        host: env.POSTGRES_HOST,
        port: parseInt(env.POSTGRES_PORT),
        database: env.POSTGRES_DB,
        username: env.POSTGRES_USER,
        password: env.POSTGRES_PASSWORD,
      },
      redis: {
        host: env.REDIS_HOST,
        port: parseInt(env.REDIS_PORT),
        password: env.REDIS_PASSWORD || undefined,
        keyPrefix: env.REDIS_KEY_PREFIX || 'analytics:',
      },
      ...(env.NEO4J_URI && {
        neo4j: {
          uri: env.NEO4J_URI,
          username: env.NEO4J_USERNAME || 'neo4j',
          password: env.NEO4J_PASSWORD || '',
        },
      }),
    },
    services: {
      identityApi: env.IDENTITY_API_URL,
      apiGateway: env.API_GATEWAY_URL,
      hubApi: env.HUB_API_URL,
      memoraiMcp: env.MEMORAI_MCP_URL,
      cbdDatabase: env.CBD_DATABASE_URL,
      memoraiFrontend: env.MEMORAI_FRONTEND_URL,
    },
    security: {
      enableAuth: env.ANALYTICS_ENABLE_AUTH === 'true',
      allowedOrigins: env.ANALYTICS_ALLOWED_ORIGINS?.split(',') || ['*'],
      rateLimiting: {
        windowMs: parseInt(env.ANALYTICS_RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
        maxRequests: parseInt(env.ANALYTICS_RATE_LIMIT_MAX_REQUESTS) || 100,
      },
    },
  };
}

// Default configuration for development
export const defaultConfig: AnalyticsConfig = {
  websocket: {
    port: 4350,
    path: '/analytics/ws',
    heartbeat: 30,
  },
  metrics: {
    retention: 30,
    aggregationIntervals: [1, 5, 15, 60],
    batchSize: 100,
  },
  database: {
    postgres: {
      host: 'localhost',
      port: 4300,
      database: 'codai_analytics',
      username: 'postgres',
      password: 'password',
    },
    redis: {
      host: 'localhost',
      port: 6379,
      keyPrefix: 'analytics:',
    },
  },
  services: {
    identityApi: 'http://localhost:8100',
    apiGateway: 'http://localhost:8010',
    hubApi: 'http://localhost:8110',
    memoraiMcp: 'http://localhost:4950',
    cbdDatabase: 'http://localhost:8180',
    memoraiFrontend: 'http://localhost:8006',
  },
  security: {
    enableAuth: true,
    allowedOrigins: ['http://localhost:3000', 'http://localhost:8006', 'http://localhost:4002'],
    rateLimiting: {
      windowMs: 900000, // 15 minutes
      maxRequests: 100,
    },
  },
};

export const analyticsConfig = process.env.NODE_ENV === 'test'
  ? defaultConfig
  : createAnalyticsConfig(validateEnvironment(process.env));