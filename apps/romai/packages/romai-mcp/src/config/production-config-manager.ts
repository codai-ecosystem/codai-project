/**
 * Production Configuration Manager
 * ROMAI Ultimate MCP Server - Enterprise Grade Configuration System
 * 
 * Features:
 * - Environment-specific configuration loading
 * - Configuration validation and type safety
 * - Hot-reload configuration capabilities
 * - Secrets management integration
 * - Configuration versioning and auditing
 */

import * as fs from 'fs';
import * as path from 'path';
import joi from 'joi';
import { EventEmitter } from 'events';

export interface ServerConfig {
  port: number;
  host: string;
  timeouts: {
    request: number;
    keepAlive: number;
    headersTimeout: number;
  };
  compression: {
    enabled: boolean;
    level?: number;
    threshold?: number;
  };
}

export interface SecurityConfig {
  enabled: boolean;
  jwt: {
    algorithm: string;
    expiresIn: string;
    issuer: string;
    audience: string;
    secret?: string; // Added for runtime secret injection
  };
  rateLimiting: {
    enabled: boolean;
    windowMs: number;
    maxRequests: number;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
    standardHeaders?: boolean;
    legacyHeaders?: boolean;
  };
  cors: {
    enabled: boolean;
    origin: string | string[];
    methods: string[];
    allowedHeaders: string[];
    credentials: boolean;
    maxAge?: number;
  };
  helmet: {
    enabled: boolean;
    contentSecurityPolicy?: any;
    hsts?: any;
  };
  ipBlocking: {
    enabled: boolean;
    maxFailedAttempts: number;
    lockoutDuration: number;
    whitelist: string[];
    blacklist: string[];
  };
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    maxAge?: number;
    preventReuse?: number;
  };
}

export interface MonitoringConfig {
  enabled: boolean;
  metrics: {
    enabled: boolean;
    port: number;
    path: string;
    collectDefaultMetrics: boolean;
    collectProcessMetrics: boolean;
    collectHttpMetrics: boolean;
  };
  healthCheck: {
    enabled: boolean;
    path: string;
    interval: number;
    timeout: number;
    retries: number;
  };
  alerts: {
    enabled: boolean;
    channels: {
      slack?: any;
      email?: any;
      webhook?: any;
    };
    thresholds: {
      errorRate: number;
      responseTime: number;
      memoryUsage: number;
      cpuUsage: number;
      diskUsage: number;
    };
  };
  tracing: {
    enabled: boolean;
    sampleRate: number;
    serviceName: string;
    jaegerEndpoint?: string;
  };
}

export interface LoggingConfig {
  level: string;
  format: string;
  output: {
    console: boolean;
    file: boolean;
    syslog: boolean;
  };
  file: {
    enabled: boolean;
    path: string;
    filename: string;
    maxSize: string;
    maxFiles: number;
    compress: boolean;
  };
  structured: {
    enabled: boolean;
    includeStack?: boolean;
    includeCaller?: boolean;
    includeTimestamp?: boolean;
    includeLevel?: boolean;
  };
  filters: {
    excludeHealthChecks: boolean;
    excludeMetrics: boolean;
    sensitiveFields: string[];
  };
}

export interface DatabaseConfig {
  url?: string; // Added for runtime URL injection
  connection: {
    pool: {
      min: number;
      max: number;
      acquireTimeoutMillis: number;
      createTimeoutMillis: number;
      destroyTimeoutMillis: number;
      idleTimeoutMillis: number;
      reapIntervalMillis?: number;
      createRetryIntervalMillis?: number;
    };
    migrations: {
      directory: string;
      tableName: string;
      schemaName: string;
    };
  };
}

export interface CacheConfig {
  redis: {
    url?: string; // Added for runtime URL injection
    keyPrefix: string;
    ttl: number;
    maxRetries: number;
    retryDelayOnFailover: number;
    enableOfflineQueue?: boolean;
    connectTimeout?: number;
    lazyConnect?: boolean;
    maxRetriesPerRequest?: number;
  };
}

export interface RomaiConfig {
  environment: string;
  server: ServerConfig;
  security: SecurityConfig;
  monitoring: MonitoringConfig;
  logging: LoggingConfig;
  database: DatabaseConfig;
  cache: CacheConfig;
  api: any;
  tools: any;
  performance: any;
  backup?: any;
}

/**
 * Production Configuration Manager
 * Handles loading, validation, and hot-reloading of configuration
 */
export class ProductionConfigManager extends EventEmitter {
  private config: RomaiConfig | null = null;
  private configPath: string;
  private watchers: Map<string, fs.FSWatcher> = new Map();
  private validationSchema: joi.ObjectSchema;
  private lastLoadTime: Date | null = null;
  private configVersion: number = 0;

  constructor(environment: string = process.env.NODE_ENV || 'development') {
    super();
    this.configPath = this.resolveConfigPath(environment);
    this.validationSchema = this.createValidationSchema();
    this.setupFileWatching();
  }

  /**
   * Load configuration from file system
   */
  public async loadConfiguration(): Promise<RomaiConfig> {
    try {
      console.log(`[ConfigManager] Loading configuration from: ${this.configPath}`);

      // Load base configuration
      const configData = await this.loadConfigFile(this.configPath);

      // Merge with environment variables
      const mergedConfig = this.mergeEnvironmentVariables(configData);

      // Validate configuration
      const validatedConfig = await this.validateConfiguration(mergedConfig);

      // Process secrets
      const processedConfig = await this.processSecrets(validatedConfig);

      this.config = processedConfig;
      this.lastLoadTime = new Date();
      this.configVersion++;

      console.log(`[ConfigManager] Configuration loaded successfully (version ${this.configVersion})`);
      this.emit('configLoaded', this.config);

      return this.config;
    } catch (error) {
      console.error('[ConfigManager] Failed to load configuration:', error);
      this.emit('configError', error);
      throw error;
    }
  }

  /**
   * Get current configuration
   */
  public getConfiguration(): RomaiConfig {
    if (!this.config) {
      throw new Error('Configuration not loaded. Call loadConfiguration() first.');
    }
    return this.config;
  }

  /**
   * Reload configuration (hot-reload)
   */
  public async reloadConfiguration(): Promise<RomaiConfig> {
    console.log('[ConfigManager] Reloading configuration...');
    const oldVersion = this.configVersion;

    try {
      await this.loadConfiguration();
      console.log(`[ConfigManager] Configuration reloaded successfully (${oldVersion} -> ${this.configVersion})`);
      this.emit('configReloaded', this.config, oldVersion);
      return this.config!;
    } catch (error) {
      console.error('[ConfigManager] Failed to reload configuration:', error);
      this.emit('configReloadError', error);
      throw error;
    }
  }

  /**
   * Get configuration metadata
   */
  public getMetadata() {
    return {
      version: this.configVersion,
      lastLoadTime: this.lastLoadTime,
      configPath: this.configPath,
      environment: process.env.NODE_ENV || 'development',
      watchedFiles: Array.from(this.watchers.keys())
    };
  }

  /**
   * Validate configuration using Joi schema
   */
  private async validateConfiguration(config: any): Promise<RomaiConfig> {
    try {
      const { error, value } = this.validationSchema.validate(config, {
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: true
      });

      if (error) {
        throw new Error(`Configuration validation failed: ${error.details.map((d: any) => d.message).join(', ')}`);
      }

      return value as RomaiConfig;
    } catch (error) {
      console.error('[ConfigManager] Configuration validation failed:', error);
      throw error;
    }
  }

  /**
   * Merge environment variables with configuration
   */
  private mergeEnvironmentVariables(config: any): any {
    const envOverrides = {
      server: {
        port: process.env.PORT ? parseInt(process.env.PORT) : undefined,
        host: process.env.HOST
      },
      security: {
        enabled: process.env.ROMAI_SECURITY_ENABLED === 'true',
        jwt: {
          secret: process.env.JWT_SECRET,
          expiresIn: process.env.JWT_EXPIRES_IN
        },
        rateLimiting: {
          enabled: process.env.RATE_LIMIT_ENABLED === 'true',
          windowMs: process.env.RATE_LIMIT_WINDOW ? parseInt(process.env.RATE_LIMIT_WINDOW) * 60000 : undefined,
          maxRequests: process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX) : undefined
        }
      },
      monitoring: {
        enabled: process.env.ROMAI_MONITORING_ENABLED === 'true',
        metrics: {
          port: process.env.METRICS_PORT ? parseInt(process.env.METRICS_PORT) : undefined
        },
        healthCheck: {
          interval: process.env.HEALTH_CHECK_INTERVAL ? parseInt(process.env.HEALTH_CHECK_INTERVAL) : undefined
        }
      },
      logging: {
        level: process.env.ROMAI_LOG_LEVEL,
        format: process.env.LOG_FORMAT
      }
    };

    return this.deepMerge(config, envOverrides);
  }

  /**
   * Process secrets (decrypt, fetch from secret managers, etc.)
   */
  private async processSecrets(config: RomaiConfig): Promise<RomaiConfig> {
    // In production, integrate with secret management systems:
    // - HashiCorp Vault
    // - AWS Secrets Manager
    // - Azure Key Vault
    // - Kubernetes Secrets

    const processedConfig = { ...config };

    // Example: Load JWT secret from environment or secret manager
    if (process.env.JWT_SECRET) {
      processedConfig.security.jwt = {
        ...processedConfig.security.jwt,
        secret: process.env.JWT_SECRET
      };
    }

    // Example: Load database URL from environment
    if (process.env.DATABASE_URL) {
      processedConfig.database.url = process.env.DATABASE_URL;
    }

    // Example: Load Redis URL from environment
    if (process.env.REDIS_URL) {
      processedConfig.cache.redis.url = process.env.REDIS_URL;
    }

    return processedConfig;
  }

  /**
   * Load configuration file
   */
  private async loadConfigFile(filePath: string): Promise<any> {
    try {
      const content = await fs.promises.readFile(filePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        throw new Error(`Configuration file not found: ${filePath}`);
      }
      throw error;
    }
  }

  /**
   * Resolve configuration file path
   */
  private resolveConfigPath(environment: string): string {
    const configDir = path.join(process.cwd(), 'config');
    const configFile = `${environment}.json`;
    return path.join(configDir, configFile);
  }

  /**
   * Setup file watching for hot-reload
   */
  private setupFileWatching(): void {
    try {
      const watcher = fs.watch(this.configPath, (eventType, filename) => {
        if (eventType === 'change') {
          console.log(`[ConfigManager] Configuration file changed: ${filename}`);
          // Debounce rapid file changes
          setTimeout(() => {
            this.reloadConfiguration().catch(error => {
              console.error('[ConfigManager] Hot-reload failed:', error);
            });
          }, 100);
        }
      });

      this.watchers.set(this.configPath, watcher);
      console.log(`[ConfigManager] Watching configuration file: ${this.configPath}`);
    } catch (error) {
      console.warn('[ConfigManager] Failed to setup file watching:', error);
    }
  }

  /**
   * Create Joi validation schema
   */
  private createValidationSchema(): joi.ObjectSchema {
    return joi.object({
      environment: joi.string().required(),
      server: joi.object({
        port: joi.number().port().required(),
        host: joi.string().required(),
        timeouts: joi.object({
          request: joi.number().positive(),
          keepAlive: joi.number().positive(),
          headersTimeout: joi.number().positive()
        }),
        compression: joi.object({
          enabled: joi.boolean(),
          level: joi.number().min(1).max(9),
          threshold: joi.number().positive()
        })
      }).required(),
      security: joi.object({
        enabled: joi.boolean().required(),
        jwt: joi.object({
          algorithm: joi.string(),
          expiresIn: joi.string(),
          issuer: joi.string(),
          audience: joi.string()
        }),
        rateLimiting: joi.object({
          enabled: joi.boolean(),
          windowMs: joi.number().positive(),
          maxRequests: joi.number().positive()
        }),
        cors: joi.object({
          enabled: joi.boolean(),
          origin: joi.alternatives().try(joi.string(), joi.array().items(joi.string())),
          methods: joi.array().items(joi.string()),
          allowedHeaders: joi.array().items(joi.string()),
          credentials: joi.boolean()
        })
      }).required(),
      monitoring: joi.object({
        enabled: joi.boolean().required(),
        metrics: joi.object({
          enabled: joi.boolean(),
          port: joi.number().port(),
          path: joi.string()
        }),
        healthCheck: joi.object({
          enabled: joi.boolean(),
          path: joi.string(),
          interval: joi.number().positive(),
          timeout: joi.number().positive(),
          retries: joi.number().positive()
        })
      }).required(),
      logging: joi.object({
        level: joi.string().valid('error', 'warn', 'info', 'debug', 'trace'),
        format: joi.string().valid('json', 'pretty', 'text'),
        output: joi.object({
          console: joi.boolean(),
          file: joi.boolean(),
          syslog: joi.boolean()
        })
      }).required()
    });
  }

  /**
   * Deep merge objects
   */
  private deepMerge(target: any, source: any): any {
    const result = { ...target };

    for (const key in source) {
      if (source[key] !== undefined && source[key] !== null) {
        if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
          result[key] = this.deepMerge(target[key] || {}, source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }

    return result;
  }

  /**
   * Cleanup watchers
   */
  public destroy(): void {
    for (const [path, watcher] of this.watchers) {
      watcher.close();
      console.log(`[ConfigManager] Stopped watching: ${path}`);
    }
    this.watchers.clear();
    this.removeAllListeners();
  }
}

// Export singleton instance
export const configManager = new ProductionConfigManager();

// Export convenience function
export async function loadConfiguration(): Promise<RomaiConfig> {
  return await configManager.loadConfiguration();
}

export function getConfiguration(): RomaiConfig {
  return configManager.getConfiguration();
}
