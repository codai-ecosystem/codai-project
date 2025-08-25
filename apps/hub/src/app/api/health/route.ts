import { createHealthEndpoint, FeatureStatus } from '@codai/shared-ui';

// CODAI Hub Service specific health configuration
const { GET, HEAD } = createHealthEndpoint({
  serviceName: 'CODAI Hub Service',
  version: '1.0.0',
  features: {
    ecosystem_management: FeatureStatus.OPERATIONAL,
    service_orchestration: FeatureStatus.OPERATIONAL,
    dashboard: FeatureStatus.OPERATIONAL,
    monitoring: FeatureStatus.OPERATIONAL,
    analytics: FeatureStatus.OPERATIONAL
  },
  capabilities: [
    'health-monitoring',
    'service-discovery',
    'api-routing',
    'ecosystem-management'
  ],
  systemMetrics: true,
  customChecks: async () => ({
    message: 'Hub service is operational - CND migration in progress',
    migration: {
      status: 'CND to CBD migration 70% complete',
      phase: 'API stabilization'
    }
  })
});

export { GET, HEAD };