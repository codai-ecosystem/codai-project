import type { CodaiConfig } from '../types';

// Default configuration for CODAI ecosystem
export const DEFAULT_CONFIG: Partial<CodaiConfig> = {
  environment: 'development',
  apiVersion: 'v1',

  endpoints: {
    auth: 'https://logai.ro/api',
    storage: 'https://stocai.ro/api',
    memory: 'https://memorai.ro/api',
    analytics: 'https://analizai.ro/api',
    wallet: 'https://bancai.ro/api',
    marketplace: 'https://marketai.ro/api',
    legal: 'https://legalizai.ro/api',
    support: 'https://ajutai.ro/api',
    identity: 'https://id.codai.ro/api',
    gateway: 'https://api.codai.ro'
  },

  authentication: {
    enabled: true,
    ssoEnabled: true,
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    refreshThreshold: 5 * 60 * 1000, // 5 minutes
    storage: 'localStorage'
  },

  security: {
    encryption: {
      enabled: true,
      algorithm: 'AES-256-GCM'
    },
    rateLimiting: {
      enabled: true,
      maxRequests: 1000,
      windowMs: 60 * 1000 // 1 minute
    }
  },

  compliance: {
    gdpr: true,
    ccpa: true,
    hipaa: false,
    auditLogging: true
  },

  debug: false,
  telemetry: true
};

// Environment-specific configurations
export const DEVELOPMENT_CONFIG: Partial<CodaiConfig> = {
  ...DEFAULT_CONFIG,
  environment: 'development',
  debug: true,
  endpoints: {
    auth: 'http://localhost:4001/api',
    storage: 'http://localhost:4002/api',
    memory: 'http://localhost:4003/api',
    analytics: 'http://localhost:4004/api',
    wallet: 'http://localhost:4005/api',
    marketplace: 'http://localhost:4006/api',
    legal: 'http://localhost:4007/api',
    support: 'http://localhost:4008/api',
    identity: 'http://localhost:4009/api',
    gateway: 'http://localhost:4000/api'
  }
};

export const STAGING_CONFIG: Partial<CodaiConfig> = {
  ...DEFAULT_CONFIG,
  environment: 'staging',
  debug: false,
  endpoints: {
    auth: 'https://staging-logai.codai.ro/api',
    storage: 'https://staging-stocai.codai.ro/api',
    memory: 'https://staging-memorai.codai.ro/api',
    analytics: 'https://staging-analizai.codai.ro/api',
    wallet: 'https://staging-bancai.codai.ro/api',
    marketplace: 'https://staging-marketai.codai.ro/api',
    legal: 'https://staging-legalizai.codai.ro/api',
    support: 'https://staging-ajutai.codai.ro/api',
    identity: 'https://staging-id.codai.ro/api',
    gateway: 'https://staging-api.codai.ro'
  }
};

export const PRODUCTION_CONFIG: Partial<CodaiConfig> = {
  ...DEFAULT_CONFIG,
  environment: 'production',
  debug: false,
  telemetry: true
};

/**
 * Create configuration with environment overrides
 */
export function createConfig(
  baseConfig: Partial<CodaiConfig>,
  overrides?: Partial<CodaiConfig>
): CodaiConfig {
  const envConfig = getEnvironmentConfig(baseConfig.environment || 'development');

  return {
    ...envConfig,
    ...baseConfig,
    ...overrides,
    endpoints: {
      ...envConfig.endpoints,
      ...baseConfig.endpoints,
      ...overrides?.endpoints
    },
    authentication: {
      ...envConfig.authentication,
      ...baseConfig.authentication,
      ...overrides?.authentication
    },
    security: {
      ...envConfig.security,
      ...baseConfig.security,
      ...overrides?.security,
      encryption: {
        ...envConfig.security?.encryption,
        ...baseConfig.security?.encryption,
        ...overrides?.security?.encryption
      },
      rateLimiting: {
        ...envConfig.security?.rateLimiting,
        ...baseConfig.security?.rateLimiting,
        ...overrides?.security?.rateLimiting
      }
    },
    compliance: {
      ...envConfig.compliance,
      ...baseConfig.compliance,
      ...overrides?.compliance
    }
  } as CodaiConfig;
}

/**
 * Get environment-specific configuration
 */
export function getEnvironmentConfig(environment: string): Partial<CodaiConfig> {
  switch (environment) {
    case 'development':
      return DEVELOPMENT_CONFIG;
    case 'staging':
      return STAGING_CONFIG;
    case 'production':
      return PRODUCTION_CONFIG;
    default:
      return DEFAULT_CONFIG;
  }
}

/**
 * Validate configuration
 */
export function validateConfig(config: Partial<CodaiConfig>): string[] {
  const errors: string[] = [];

  if (!config.appId) {
    errors.push('appId is required');
  }

  if (config.environment && !['development', 'staging', 'production'].includes(config.environment)) {
    errors.push('environment must be development, staging, or production');
  }

  if (config.endpoints) {
    Object.entries(config.endpoints).forEach(([service, endpoint]) => {
      if (endpoint && !isValidUrl(endpoint)) {
        errors.push(`${service} endpoint must be a valid URL`);
      }
    });
  }

  return errors;
}

/**
 * Check if string is valid URL
 */
function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}
