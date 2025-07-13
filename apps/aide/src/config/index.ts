/**
 * AIDE Configuration
 * Centralized configuration for all integrations and services
 */

export const AIDE_CONFIG = {
  // Service Information
  service: {
    name: 'AIDE',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  },

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/AIDE',
    maxConnections: 20,
    ssl: process.env.NODE_ENV === 'production'
  },

  // API Configuration
  api: {
    port: process.env.PORT || 3570,
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }
  },

  // Integration Configuration
  integrations: {
    _TENSORFLOW_TFJS_NODE: {
      enabled: process.env._TENSORFLOW_TFJS_NODE_ENABLED === 'true',
      apiKey: process.env._TENSORFLOW_TFJS_NODE_API_KEY,
      baseUrl: process.env._TENSORFLOW_TFJS_NODE_BASE_URL,
      timeout: 30000
    },
    PYTORCH: {
      enabled: process.env.PYTORCH_ENABLED === 'true',
      apiKey: process.env.PYTORCH_API_KEY,
      baseUrl: process.env.PYTORCH_BASE_URL,
      timeout: 30000
    },
    HUGGINGFACE: {
      enabled: process.env.HUGGINGFACE_ENABLED === 'true',
      apiKey: process.env.HUGGINGFACE_API_KEY,
      baseUrl: process.env.HUGGINGFACE_BASE_URL,
      timeout: 30000
    },
    WANDB: {
      enabled: process.env.WANDB_ENABLED === 'true',
      apiKey: process.env.WANDB_API_KEY,
      baseUrl: process.env.WANDB_BASE_URL,
      timeout: 30000
    }
  },

  // Security Configuration
  security: {
    jwtSecret: process.env.JWT_SECRET || 'default-dev-secret',
    bcryptRounds: 12,
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    csrfProtection: true
  },

  // Monitoring Configuration
  monitoring: {
    enabled: process.env.MONITORING_ENABLED === 'true',
    logLevel: process.env.LOG_LEVEL || 'info',
    metricsInterval: 60000 // 1 minute
  },

  // Feature Flags
  features: {
    advancedAnalytics: process.env.FEATURE_ANALYTICS === 'true',
    realTimeUpdates: process.env.FEATURE_REALTIME === 'true',
    experimentalFeatures: process.env.FEATURE_EXPERIMENTAL === 'true'
  }
};

export default AIDE_CONFIG;