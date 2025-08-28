import { LoggingConfig, TransportConfig } from './types.js';
import * as path from 'path';
import * as os from 'os';

/**
 * Centralized Logging Configuration
 * Provides environment-aware configuration for the logging system
 */

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

// Default log levels based on environment
const getDefaultLogLevel = (): string => {
  if (isDevelopment) return 'debug';
  if (process.env.NODE_ENV === 'staging' || process.env.ENVIRONMENT === 'staging') return 'info';
  return 'warn'; // production
};

// Winston transport configurations
const getWinstonTransports = (): TransportConfig[] => {
  const transports: TransportConfig[] = [
    // Console transport for development
    {
      type: 'console',
      level: isDevelopment ? 'debug' : 'info',
      options: {
        format: isDevelopment ? 'simple' : 'json',
        colorize: isDevelopment,
        timestamp: true,
      },
    },
  ];

  // File transports for production
  if (isProduction) {
    transports.push(
      // Daily rotate file for all logs
      {
        type: 'daily-rotate',
        level: 'info',
        options: {
          filename: path.join(process.cwd(), 'logs', 'codai-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          maxSize: '100m',
          maxFiles: '30d',
          compress: true,
          format: 'json',
        },
      },
      // Separate error log file
      {
        type: 'daily-rotate',
        level: 'error',
        options: {
          filename: path.join(process.cwd(), 'logs', 'codai-errors-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          maxSize: '50m',
          maxFiles: '90d',
          compress: true,
          format: 'json',
        },
      }
    );
  }

  // Elasticsearch transport if enabled
  if (process.env.ELASTICSEARCH_ENABLED === 'true') {
    transports.push({
      type: 'elasticsearch',
      level: process.env.ELASTICSEARCH_LOG_LEVEL || 'info',
      options: {
        level: process.env.ELASTICSEARCH_LOG_LEVEL || 'info',
        clientOpts: {
          node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
          maxRetries: 3,
          requestTimeout: 10000,
        },
        index: process.env.ELASTICSEARCH_INDEX || 'codai-logs',
        indexTemplate: {
          name: 'codai-logs-template',
          pattern: 'codai-logs-*',
          settings: {
            number_of_shards: 1,
            number_of_replicas: 0,
            'index.max_result_window': 50000,
          },
          mappings: {
            properties: {
              timestamp: { type: 'date' },
              level: { type: 'keyword' },
              message: { type: 'text', analyzer: 'standard' },
              service: { type: 'keyword' },
              correlationId: { type: 'keyword' },
              traceId: { type: 'keyword' },
              userId: { type: 'keyword' },
              metadata: { type: 'object' },
              context: { type: 'object' },
            },
          },
        },
      },
    });
  }

  return transports;
};

// Default retention policies by service and level
const getDefaultRetentionPolicies = () => [
  { service: '*', level: 'error', retentionDays: 90, archiveEnabled: true, compressionEnabled: true },
  { service: '*', level: 'warn', retentionDays: 30, archiveEnabled: true, compressionEnabled: true },
  { service: '*', level: 'info', retentionDays: 7, archiveEnabled: false, compressionEnabled: true },
  { service: '*', level: 'debug', retentionDays: 1, archiveEnabled: false, compressionEnabled: false },
  { service: 'codai-auth-api', level: 'info', retentionDays: 30, archiveEnabled: true, compressionEnabled: true },
  { service: 'codai-gateway-api', level: 'info', retentionDays: 15, archiveEnabled: true, compressionEnabled: true },
];

/**
 * Create logging configuration from environment variables
 */
export const createLoggingConfig = (): LoggingConfig => {
  return {
    server: {
      port: parseInt(process.env.LOGGING_SERVER_PORT || '4960', 10),
      host: process.env.LOGGING_SERVER_HOST || '0.0.0.0',
      corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:4000,http://localhost:4006,http://localhost:8006').split(','),
    },

    winston: {
      level: process.env.LOG_LEVEL || getDefaultLogLevel(),
      format: (process.env.LOG_FORMAT as 'json' | 'simple') || (isDevelopment ? 'simple' : 'json'),
      transports: getWinstonTransports(),
    },

    elasticsearch: {
      node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
      index: process.env.ELASTICSEARCH_INDEX || 'codai-logs',
      maxRetries: parseInt(process.env.ELASTICSEARCH_MAX_RETRIES || '3', 10),
      requestTimeout: parseInt(process.env.ELASTICSEARCH_REQUEST_TIMEOUT || '10000', 10),
      sniffOnStart: process.env.ELASTICSEARCH_SNIFF_ON_START === 'true',
    },

    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined,
      keyPrefix: process.env.REDIS_KEY_PREFIX || 'codai:logs:',
    },

    database: {
      postgres: {
        host: process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
        database: process.env.POSTGRES_DB || 'codai_logs',
        username: process.env.POSTGRES_USER || 'postgres',
        password: process.env.POSTGRES_PASSWORD || 'postgres',
      },
    },

    retention: getDefaultRetentionPolicies(),

    correlation: {
      enabled: process.env.LOG_CORRELATION_ENABLED !== 'false',
      timeWindow: parseInt(process.env.LOG_CORRELATION_TIME_WINDOW || '30', 10), // 30 minutes
    },

    alerting: {
      enabled: process.env.LOG_ALERTING_ENABLED === 'true',
      checkInterval: parseInt(process.env.LOG_ALERT_CHECK_INTERVAL || '5', 10), // 5 minutes
    },

    security: {
      enableAuth: process.env.LOG_AUTH_ENABLED === 'true',
      apiKey: process.env.LOG_API_KEY || 'codai-logging-dev-key-2025',
      rateLimiting: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10), // 1 minute
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000', 10),
      },
    },
  };
};

/**
 * Get service-specific logging configuration
 */
export const getServiceConfig = (serviceName: string) => {
  const baseConfig = createLoggingConfig();

  // Service-specific overrides
  const serviceOverrides: Record<string, Partial<LoggingConfig>> = {
    'codai-auth-api': {
      retention: [
        { service: 'codai-auth-api', level: 'error', retentionDays: 180, archiveEnabled: true, compressionEnabled: true },
        { service: 'codai-auth-api', level: 'info', retentionDays: 60, archiveEnabled: true, compressionEnabled: true },
      ],
    },
    'codai-gateway-api': {
      retention: [
        { service: 'codai-gateway-api', level: 'error', retentionDays: 90, archiveEnabled: true, compressionEnabled: true },
        { service: 'codai-gateway-api', level: 'info', retentionDays: 30, archiveEnabled: true, compressionEnabled: true },
      ],
    },
    'codai-memorai-mcp': {
      retention: [
        { service: 'codai-memorai-mcp', level: 'error', retentionDays: 90, archiveEnabled: true, compressionEnabled: true },
        { service: 'codai-memorai-mcp', level: 'debug', retentionDays: 3, archiveEnabled: false, compressionEnabled: true },
      ],
    },
  };

  const overrides = serviceOverrides[serviceName];
  if (overrides) {
    return { ...baseConfig, ...overrides };
  }

  return baseConfig;
};

/**
 * Validate configuration and environment
 */
export const validateConfig = (config: LoggingConfig): void => {
  const errors: string[] = [];

  // Validate server configuration
  if (!config.server.port || config.server.port < 1024 || config.server.port > 65535) {
    errors.push('Invalid server port: must be between 1024 and 65535');
  }

  if (!config.server.host) {
    errors.push('Server host is required');
  }

  // Validate Elasticsearch configuration if enabled
  if (process.env.ELASTICSEARCH_ENABLED === 'true') {
    if (!config.elasticsearch.node) {
      errors.push('Elasticsearch node URL is required when Elasticsearch is enabled');
    }

    if (!config.elasticsearch.index) {
      errors.push('Elasticsearch index is required when Elasticsearch is enabled');
    }
  }

  // Validate database configuration
  if (!config.database.postgres.host || !config.database.postgres.database) {
    errors.push('PostgreSQL host and database are required');
  }

  // Validate Redis configuration
  if (!config.redis.host) {
    errors.push('Redis host is required');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
};

/**
 * Get configuration with environment validation
 */
export const getValidatedConfig = (): LoggingConfig => {
  const config = createLoggingConfig();
  validateConfig(config);
  return config;
};

/**
 * Configuration constants
 */
export const CONFIG_CONSTANTS = {
  DEFAULT_LOG_LEVELS: ['error', 'warn', 'info', 'debug', 'trace'],
  DEFAULT_SERVICES: [
    'codai-auth-api',
    'codai-gateway-api',
    'codai-hub-api',
    'codai-memorai-mcp',
    'codai-cbd-database',
    'codai-memorai-frontend',
  ],
  MAX_LOG_ENTRY_SIZE: 64 * 1024, // 64KB
  MAX_BATCH_SIZE: 1000,
  MAX_SEARCH_RESULTS: 10000,
  CORRELATION_MAX_ENTRIES: 5000,
  ALERT_COOLDOWN_MINUTES: 15,
  RETENTION_CHECK_INTERVAL_HOURS: 24,
  ELASTICSEARCH_BULK_SIZE: 500,
  REDIS_CACHE_TTL_SECONDS: 3600, // 1 hour
} as const;

// Environment-specific configurations
export const ENVIRONMENT_CONFIGS = {
  development: {
    logLevel: 'debug',
    enableConsole: true,
    enableFile: false,
    enableElasticsearch: false,
    retentionDays: 1,
  },
  staging: {
    logLevel: 'info',
    enableConsole: true,
    enableFile: true,
    enableElasticsearch: true,
    retentionDays: 7,
  },
  production: {
    logLevel: 'warn',
    enableConsole: false,
    enableFile: true,
    enableElasticsearch: true,
    retentionDays: 30,
  },
} as const;

export type Environment = keyof typeof ENVIRONMENT_CONFIGS;