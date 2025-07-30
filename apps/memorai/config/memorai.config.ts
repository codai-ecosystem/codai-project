/**
 * MemorAI Configuration Management
 * Centralized configuration for CBD-based MemorAI system
 */

export interface MemorAIConfig {
  cbd: {
    dataPath: string;
    embeddingModel: 'openai' | 'local';
    apiKey?: string;
    dimensions: number;
    cacheSize: number;
    indexType: 'faiss' | 'inmemory';
    similarityMetric: 'cosine' | 'euclidean' | 'dot';
  };
  
  mcp: {
    serverName: string;
    version: string;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
    healthCheckInterval: number;
    maxConcurrentOperations: number;
  };
  
  performance: {
    batchSize: number;
    maxConcurrentOperations: number;
    memoryLimitMB: number;
    responseTimeoutMs: number;
    retryAttempts: number;
  };
  
  security: {
    encryptionEnabled: boolean;
    accessControl: boolean;
    auditLogging: boolean;
    allowedAgents: string[];
    adminAgents: string[];
  };
  
  migration: {
    enableLegacySupport: boolean;
    backupBeforeMigration: boolean;
    validateAfterMigration: boolean;
    legacyDataRetentionDays: number;
  };
}

/**
 * Default MemorAI configuration
 */
export const defaultConfig: MemorAIConfig = {
  cbd: {
    dataPath: process.env.MEMORAI_CBD_PATH || './memorai-cbd-data',
    embeddingModel: 'openai',
    apiKey: process.env.OPENAI_API_KEY,
    dimensions: 1536,
    cacheSize: 10000,
    indexType: 'faiss',
    similarityMetric: 'cosine'
  },
  
  mcp: {
    serverName: 'MemorAI CBD MCP Server',
    version: '8.0.0-cbd',
    logLevel: 'info',
    healthCheckInterval: 30000, // 30 seconds
    maxConcurrentOperations: 100
  },
  
  performance: {
    batchSize: 50,
    maxConcurrentOperations: 10,
    memoryLimitMB: 512,
    responseTimeoutMs: 30000, // 30 seconds
    retryAttempts: 3
  },
  
  security: {
    encryptionEnabled: false, // TODO: Implement encryption
    accessControl: false, // TODO: Implement access control
    auditLogging: true,
    allowedAgents: [], // Empty = allow all
    adminAgents: ['admin', 'system']
  },
  
  migration: {
    enableLegacySupport: true,
    backupBeforeMigration: true,
    validateAfterMigration: true,
    legacyDataRetentionDays: 30
  }
};

/**
 * Load configuration from environment and defaults
 */
export function loadConfig(overrides?: Partial<MemorAIConfig>): MemorAIConfig {
  const config: MemorAIConfig = {
    ...defaultConfig,
    ...overrides
  };

  // Override with environment variables
  if (process.env.MEMORAI_CBD_PATH) {
    config.cbd.dataPath = process.env.MEMORAI_CBD_PATH;
  }

  if (process.env.OPENAI_API_KEY) {
    config.cbd.apiKey = process.env.OPENAI_API_KEY;
  }

  if (process.env.MEMORAI_LOG_LEVEL) {
    config.mcp.logLevel = process.env.MEMORAI_LOG_LEVEL as any;
  }

  if (process.env.MEMORAI_CACHE_SIZE) {
    config.cbd.cacheSize = parseInt(process.env.MEMORAI_CACHE_SIZE, 10);
  }

  if (process.env.MEMORAI_DIMENSIONS) {
    config.cbd.dimensions = parseInt(process.env.MEMORAI_DIMENSIONS, 10);
  }

  return config;
}

/**
 * Validate configuration
 */
export function validateConfig(config: MemorAIConfig): string[] {
  const errors: string[] = [];

  // CBD validation
  if (!config.cbd.dataPath) {
    errors.push('CBD data path is required');
  }

  if (config.cbd.embeddingModel === 'openai' && !config.cbd.apiKey) {
    errors.push('OpenAI API key is required when using OpenAI embedding model');
  }

  if (config.cbd.dimensions < 1 || config.cbd.dimensions > 10000) {
    errors.push('CBD dimensions must be between 1 and 10000');
  }

  if (config.cbd.cacheSize < 100) {
    errors.push('CBD cache size must be at least 100');
  }

  // Performance validation
  if (config.performance.batchSize < 1 || config.performance.batchSize > 1000) {
    errors.push('Batch size must be between 1 and 1000');
  }

  if (config.performance.memoryLimitMB < 64) {
    errors.push('Memory limit must be at least 64MB');
  }

  if (config.performance.responseTimeoutMs < 1000) {
    errors.push('Response timeout must be at least 1 second');
  }

  return errors;
}

/**
 * Export configuration utilities
 */
export { MemorAIConfig };
export default loadConfig;
