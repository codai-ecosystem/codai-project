/**
 * CODAI Configuration
 * Centralized configuration for all integrations and services
 */

export const CODAI_CONFIG = {
  // Service Information
  service: {
    name: 'codai',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  },

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/codai',
    maxConnections: 20,
    ssl: process.env.NODE_ENV === 'production'
  },

  // API Configuration
  api: {
    port: process.env.PORT || 3780,
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }
  },

  // Integration Configuration
  integrations: {
    _OCTOKIT_REST: {
      enabled: process.env._OCTOKIT_REST_ENABLED === 'true',
      apiKey: process.env._OCTOKIT_REST_API_KEY,
      baseUrl: process.env._OCTOKIT_REST_BASE_URL,
      timeout: 30000
    },
    SIMPLE_GIT: {
      enabled: process.env.SIMPLE_GIT_ENABLED === 'true',
      apiKey: process.env.SIMPLE_GIT_API_KEY,
      baseUrl: process.env.SIMPLE_GIT_BASE_URL,
      timeout: 30000
    },
    OPENAI: {
      enabled: process.env.OPENAI_ENABLED === 'true',
      apiKey: process.env.OPENAI_API_KEY,
      baseUrl: process.env.OPENAI_BASE_URL,
      timeout: 30000
    },
    _ANTHROPIC_AI_SDK: {
      enabled: process.env._ANTHROPIC_AI_SDK_ENABLED === 'true',
      apiKey: process.env._ANTHROPIC_AI_SDK_API_KEY,
      baseUrl: process.env._ANTHROPIC_AI_SDK_BASE_URL,
      timeout: 30000
    },
    DOCKERODE: {
      enabled: process.env.DOCKERODE_ENABLED === 'true',
      apiKey: process.env.DOCKERODE_API_KEY,
      baseUrl: process.env.DOCKERODE_BASE_URL,
      timeout: 30000
    },
    _KUBERNETES_CLIENT_NODE: {
      enabled: process.env._KUBERNETES_CLIENT_NODE_ENABLED === 'true',
      apiKey: process.env._KUBERNETES_CLIENT_NODE_API_KEY,
      baseUrl: process.env._KUBERNETES_CLIENT_NODE_BASE_URL,
      timeout: 30000
    },
    VSCODE_LANGUAGESERVER: {
      enabled: process.env.VSCODE_LANGUAGESERVER_ENABLED === 'true',
      apiKey: process.env.VSCODE_LANGUAGESERVER_API_KEY,
      baseUrl: process.env.VSCODE_LANGUAGESERVER_BASE_URL,
      timeout: 30000
    },
    socketIO: {
      enabled: process.env.SOCKET_IO_ENABLED === 'true',
      apiKey: process.env.SOCKET_IO_API_KEY,
      baseUrl: process.env.SOCKET_IO_BASE_URL,
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

export default CODAI_CONFIG;