import { createHealthEndpoint, FeatureStatus } from '@codai/shared-ui';

// CODAI ID Service specific health configuration
const { GET, HEAD } = createHealthEndpoint({
  serviceName: 'CODAI ID Service',
  version: '1.0.0',
  defaultPort: '4004',
  features: {
    authentication: FeatureStatus.OPERATIONAL,
    jwt_tokens: FeatureStatus.OPERATIONAL,
    user_management: FeatureStatus.OPERATIONAL,
    oauth2: FeatureStatus.OPERATIONAL,
    mfa: FeatureStatus.OPERATIONAL
  },
  capabilities: [
    'authentication',
    'authorization',
    'user-management',
    'oauth2',
    'sso'
  ]
});

export { GET, HEAD };
