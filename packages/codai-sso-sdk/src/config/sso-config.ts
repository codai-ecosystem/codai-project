import { SSOConfig, ZeroTrustConfig, RBACConfig, SSOConfigSchema, ZeroTrustConfigSchema } from '../auth/types';

/**
 * Default SSO configuration for CODAI ecosystem
 */
export const defaultSSOConfig: Partial<SSOConfig> = {
  scopes: ['openid', 'profile', 'email', 'roles'],
  enableZeroTrust: true,
  enableAuditLogging: true,
  sessionTimeout: 3600, // 1 hour
  refreshTokenRotation: true
};

/**
 * Default Zero Trust configuration
 */
export const defaultZeroTrustConfig: ZeroTrustConfig = {
  enableDeviceFingerprinting: true,
  enableLocationTracking: true,
  enableBehavioralAnalysis: true,
  riskThresholds: {
    low: 0.3,
    medium: 0.6,
    high: 0.8
  },
  challengeOnRisk: true,
  trustedDeviceExpiry: 2592000 // 30 days
};

/**
 * Default RBAC configuration
 */
export const defaultRBACConfig: RBACConfig = {
  defaultRole: 'user',
  hierarchical: true,
  roles: [
    {
      name: 'super_admin',
      description: 'Super Administrator with full system access',
      permissions: ['*'],
      inheritsFrom: []
    },
    {
      name: 'admin',
      description: 'Administrator with user and application management',
      permissions: ['users:read', 'users:write', 'apps:read', 'apps:write', 'system:read'],
      inheritsFrom: []
    },
    {
      name: 'developer',
      description: 'Developer with application development access',
      permissions: ['apps:read', 'apps:write', 'code:read', 'code:write'],
      inheritsFrom: ['user']
    },
    {
      name: 'user',
      description: 'Standard user with basic access',
      permissions: ['profile:read', 'profile:write'],
      inheritsFrom: []
    },
    {
      name: 'viewer',
      description: 'Read-only access user',
      permissions: ['profile:read'],
      inheritsFrom: []
    }
  ],
  permissions: [
    {
      name: 'profile:read',
      description: 'Read user profile',
      resource: 'profile',
      action: 'read'
    },
    {
      name: 'profile:write',
      description: 'Write user profile',
      resource: 'profile',
      action: 'write'
    },
    {
      name: 'users:read',
      description: 'Read user data',
      resource: 'users',
      action: 'read'
    },
    {
      name: 'users:write',
      description: 'Write user data',
      resource: 'users',
      action: 'write'
    },
    {
      name: 'apps:read',
      description: 'Read application data',
      resource: 'apps',
      action: 'read'
    },
    {
      name: 'apps:write',
      description: 'Write application data',
      resource: 'apps',
      action: 'write'
    },
    {
      name: 'code:read',
      description: 'Read code repositories',
      resource: 'code',
      action: 'read'
    },
    {
      name: 'code:write',
      description: 'Write code repositories',
      resource: 'code',
      action: 'write'
    },
    {
      name: 'system:read',
      description: 'Read system configuration',
      resource: 'system',
      action: 'read'
    }
  ]
};

/**
 * Environment-specific SSO configurations
 */
export const environmentConfigs = {
  development: {
    keycloakUrl: 'http://localhost:4080',
    realm: 'codai',
    redirectUri: 'http://localhost:3000/api/auth/callback/keycloak',
    postLogoutRedirectUri: 'http://localhost:3000'
  },
  staging: {
    keycloakUrl: 'https://id-staging.codai.dev',
    realm: 'codai',
    redirectUri: 'https://staging.codai.dev/api/auth/callback/keycloak',
    postLogoutRedirectUri: 'https://staging.codai.dev'
  },
  production: {
    keycloakUrl: 'https://id.codai.dev',
    realm: 'codai',
    redirectUri: 'https://app.codai.dev/api/auth/callback/keycloak',
    postLogoutRedirectUri: 'https://app.codai.dev'
  }
};

/**
 * Create SSO configuration with validation
 */
export function createSSOConfig(config: Partial<SSOConfig>): SSOConfig {
  const mergedConfig = {
    ...defaultSSOConfig,
    ...config
  };

  return SSOConfigSchema.parse(mergedConfig);
}

/**
 * Create Zero Trust configuration with validation
 */
export function createZeroTrustConfig(config: Partial<ZeroTrustConfig> = {}): ZeroTrustConfig {
  const mergedConfig = {
    ...defaultZeroTrustConfig,
    ...config
  };

  return ZeroTrustConfigSchema.parse(mergedConfig);
}

/**
 * Get environment-specific configuration
 */
export function getEnvironmentConfig(env: keyof typeof environmentConfigs = 'development') {
  return environmentConfigs[env];
}

/**
 * Create complete CODAI SSO configuration for an application
 */
export function createCodaiSSOConfig(options: {
  appName: string;
  clientId: string;
  clientSecret: string;
  environment?: keyof typeof environmentConfigs;
  port?: number;
  customConfig?: Partial<SSOConfig>;
}): SSOConfig {
  const { appName, clientId, clientSecret, environment = 'development', port = 3000, customConfig = {} } = options;

  const envConfig = getEnvironmentConfig(environment);
  const baseUrl = environment === 'development' ? `http://localhost:${port}` : envConfig.redirectUri.split('/api/auth')[0];

  return createSSOConfig({
    ...envConfig,
    clientId,
    clientSecret,
    redirectUri: `${baseUrl}/api/auth/callback/keycloak`,
    postLogoutRedirectUri: baseUrl,
    ...customConfig
  });
}
