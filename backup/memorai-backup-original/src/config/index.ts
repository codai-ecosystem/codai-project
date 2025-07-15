/**
 * MEMORAI Configuration
 * Centralized configuration for all integrations and services
 */

export const MEMORAI_CONFIG = {
  // Service Information
  service: {
    name: 'memorai',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  },

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/memorai',
    maxConnections: 20,
    ssl: process.env.NODE_ENV === 'production'
  },

  // API Configuration
  api: {
    port: process.env.PORT || 3134,
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }
  },

  // Integration Configuration
  integrations: {
    OPENAI: {
      enabled: process.env.OPENAI_ENABLED === 'true',
      apiKey: process.env.OPENAI_API_KEY,
      baseUrl: process.env.OPENAI_BASE_URL,
      timeout: 30000
    },
    _PINECONE_DATABASE_PINECONE: {
      enabled: process.env._PINECONE_DATABASE_PINECONE_ENABLED === 'true',
      apiKey: process.env._PINECONE_DATABASE_PINECONE_API_KEY,
      baseUrl: process.env._PINECONE_DATABASE_PINECONE_BASE_URL,
      timeout: 30000
    },
    ELASTICSEARCH: {
      enabled: process.env.ELASTICSEARCH_ENABLED === 'true',
      apiKey: process.env.ELASTICSEARCH_API_KEY,
      baseUrl: process.env.ELASTICSEARCH_BASE_URL,
      timeout: 30000
    },
    REDIS: {
      enabled: process.env.REDIS_ENABLED === 'true',
      apiKey: process.env.REDIS_API_KEY,
      baseUrl: process.env.REDIS_BASE_URL,
      timeout: 30000
    },
    IOREDIS: {
      enabled: process.env.IOREDIS_ENABLED === 'true',
      apiKey: process.env.IOREDIS_API_KEY,
      baseUrl: process.env.IOREDIS_BASE_URL,
      timeout: 30000
    },
    FAISS_NODE: {
      enabled: process.env.FAISS_NODE_ENABLED === 'true',
      apiKey: process.env.FAISS_NODE_API_KEY,
      baseUrl: process.env.FAISS_NODE_BASE_URL,
      timeout: 30000
    },
    TRANSFORMERS: {
      enabled: process.env.TRANSFORMERS_ENABLED === 'true',
      apiKey: process.env.TRANSFORMERS_API_KEY,
      baseUrl: process.env.TRANSFORMERS_BASE_URL,
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

export default MEMORAI_CONFIG;