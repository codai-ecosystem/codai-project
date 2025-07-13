/**
 * AJUTAI Configuration
 * Centralized configuration for all integrations and services
 */

export const AJUTAI_CONFIG = {
  // Service Information
  service: {
    name: 'ajutai',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  },

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/ajutai',
    maxConnections: 20,
    ssl: process.env.NODE_ENV === 'production'
  },

  // API Configuration
  api: {
    port: process.env.PORT || 3403,
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }
  },

  // Integration Configuration
  integrations: {
    DISCORD_JS: {
      enabled: process.env.DISCORD_JS_ENABLED === 'true',
      apiKey: process.env.DISCORD_JS_API_KEY,
      baseUrl: process.env.DISCORD_JS_BASE_URL,
      timeout: 30000
    },
    SLACK_SDK: {
      enabled: process.env.SLACK_SDK_ENABLED === 'true',
      apiKey: process.env.SLACK_SDK_API_KEY,
      baseUrl: process.env.SLACK_SDK_BASE_URL,
      timeout: 30000
    },
    ZENDESK_NODE_API: {
      enabled: process.env.ZENDESK_NODE_API_ENABLED === 'true',
      apiKey: process.env.ZENDESK_NODE_API_API_KEY,
      baseUrl: process.env.ZENDESK_NODE_API_BASE_URL,
      timeout: 30000
    },
    INTERCOM_CLIENT: {
      enabled: process.env.INTERCOM_CLIENT_ENABLED === 'true',
      apiKey: process.env.INTERCOM_CLIENT_API_KEY,
      baseUrl: process.env.INTERCOM_CLIENT_BASE_URL,
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

export default AJUTAI_CONFIG;