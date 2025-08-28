// Main exports for the security measures package
export { SecurityManager } from './security-manager';
export { SecurityMiddleware } from './middleware';
export { VulnerabilityScanner } from './vulnerability-scanner';
export { SecurityDashboard } from './dashboard';
export { ThreatDetector } from './threat-detector';

// Export types
export * from './types';

// Export configuration
export { securityConfig, serviceSecurityConfig, environmentVariables } from './config';

// Default configurations for Essential CodAI Services
export { ESSENTIAL_CODAI_SECURITY_PROFILES } from './types';

// Utility functions for quick setup
export const createSecurityManager = (config: any) => {
  const { SecurityManager } = require('./security-manager');
  return new SecurityManager(config);
};

export const getDefaultSecurityConfig = () => {
  const { securityConfig } = require('./config');
  return securityConfig;
};

export const getServiceSecurityProfile = (serviceId: string) => {
  const { serviceSecurityConfig } = require('./config');
  return serviceSecurityConfig.getSecurityProfile(serviceId);
};