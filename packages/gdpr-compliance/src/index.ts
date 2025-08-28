/**
 * GDPR Compliance Package Entry Point
 * Main exports for the GDPR compliance system
 */

// Core exports
export { GdprComplianceManager } from './compliance-manager';
export { ConsentManager } from './consent-manager';
export { DataSubjectRightsManager } from './data-subject-rights-manager';
export { AuditTrailManager } from './audit-trail-manager';
export { DataRetentionManager } from './data-retention-manager';
export { ComplianceReporter } from './compliance-reporter';
export { GdprLogger } from './logger';

// Configuration exports
export {
  getDefaultGdprConfig,
  getDevelopmentGdprConfig,
  getProductionGdprConfig,
  getGdprConfigForEnvironment,
  gdprComplianceConfig
} from './config';

// Type exports
export type {
  // Core types
  GdprLegalBasis,
  DataCategory,
  ProcessingPurpose,
  ConsentStatus,
  DataSubjectRightType,
  AuditEventType,
  ComplianceStatus,

  // Configuration interfaces
  GdprComplianceConfig,
  DataRetentionConfig,
  ConsentManagementConfig,
  DataSubjectRightsConfig,
  AuditTrailConfig,
  ReportingConfig,
  NotificationConfig,
  DataProcessingConfig,
  ComplianceSecurityConfig,
  ComplianceMonitoringConfig,

  // Data models
  DataSubject,
  ConsentRecord,
  ConsentProof,
  DataSubjectRight,
  AuditEvent,
  DataProcessingRecord,
  ComplianceViolation,
  ComplianceReport,
  ComplianceMetrics,

  // Essential service configuration
  EssentialServiceGdprProfile,
  DataFlow,

  // API interfaces
  GdprComplianceMiddleware,
  DataSubjectRightRequest,
  ConsentRequest,
  DataExportRequest,
  DataDeletionRequest,

  // Helper types
  GdprComplianceStatus,
  ServiceComplianceProfile
} from './types';

// Utility functions
export {
  getServiceGdprProfile,
  getAllServiceIds,
  getServicesByComplianceLevel,
  getServicesProcessingDataCategory,
  ESSENTIAL_CODAI_GDPR_PROFILES
} from './types';

// CLI export
export { program as gdprCli } from './cli';

// Version
export const version = '1.0.0';

// Quick start function
export async function createGdprCompliance(serviceId: string, customConfig?: Partial<GdprComplianceConfig>) {
  const { GdprComplianceManager } = await import('./compliance-manager');
  const { getGdprConfigForEnvironment } = await import('./config');
  const { getServiceGdprProfile } = await import('./types');

  const config = getGdprConfigForEnvironment();
  const manager = new GdprComplianceManager({ ...config, ...customConfig });

  const profile = getServiceGdprProfile(serviceId);
  if (profile) {
    await manager.initializeCompliance(serviceId, profile);
  }

  return manager;
}

// Default export
export default GdprComplianceManager;