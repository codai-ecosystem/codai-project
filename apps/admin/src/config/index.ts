/**
 * ADMIN Configuration
 * Centralized configuration for all integrations and services
 */

export const ADMIN_CONFIG = {
  // Service Information
  service: {
    name: 'admin',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  },

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/admin',
    maxConnections: 20,
    ssl: process.env.NODE_ENV === 'production'
  },

  // API Configuration
  api: {
    port: process.env.PORT || 3345,
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }
  },

  // Integration Configuration
  integrations: {
    GRAFANA_API: {
      enabled: process.env.GRAFANA_API_ENABLED === 'true',
      apiKey: process.env.GRAFANA_API_API_KEY,
      baseUrl: process.env.GRAFANA_API_BASE_URL,
      timeout: 30000
    },
    PROMETHEUS_API_METRICS: {
      enabled: process.env.PROMETHEUS_API_METRICS_ENABLED === 'true',
      apiKey: process.env.PROMETHEUS_API_METRICS_API_KEY,
      baseUrl: process.env.PROMETHEUS_API_METRICS_BASE_URL,
      timeout: 30000
    },
    DATADOG: {
      enabled: process.env.DATADOG_ENABLED === 'true',
      apiKey: process.env.DATADOG_API_KEY,
      baseUrl: process.env.DATADOG_BASE_URL,
      timeout: 30000
    },
    WINSTON: {
      enabled: process.env.WINSTON_ENABLED === 'true',
      apiKey: process.env.WINSTON_API_KEY,
      baseUrl: process.env.WINSTON_BASE_URL,
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

export default ADMIN_CONFIG;