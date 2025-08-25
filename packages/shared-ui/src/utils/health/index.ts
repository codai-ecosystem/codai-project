export * from './health-endpoint';

// Re-export commonly used types and utilities
export type { HealthConfig, HealthResponse } from './health-endpoint';
export { createHealthEndpoint, FeatureStatus, ServiceStatus, CommonFeatures, CommonCapabilities } from './health-endpoint';