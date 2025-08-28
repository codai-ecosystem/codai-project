/**
 * GDPR Compliance Configuration
 * Environment-aware configuration management for GDPR compliance
 */

import { GdprComplianceConfig } from './types';

export function getDefaultGdprConfig(): GdprComplianceConfig {
  return {
    enabled: process.env.GDPR_COMPLIANCE_ENABLED === 'true' || true,

    dataRetention: {
      enabled: process.env.GDPR_DATA_RETENTION_ENABLED === 'true' || true,
      defaultRetentionPeriodDays: parseInt(process.env.GDPR_DEFAULT_RETENTION_DAYS || '1095'), // 3 years
      categorySpecificRetention: {
        personal_data: parseInt(process.env.GDPR_PERSONAL_DATA_RETENTION_DAYS || '1095'),
        sensitive_data: parseInt(process.env.GDPR_SENSITIVE_DATA_RETENTION_DAYS || '2555'), // 7 years
        biometric_data: parseInt(process.env.GDPR_BIOMETRIC_DATA_RETENTION_DAYS || '1825'), // 5 years
        health_data: parseInt(process.env.GDPR_HEALTH_DATA_RETENTION_DAYS || '3650'), // 10 years
        financial_data: parseInt(process.env.GDPR_FINANCIAL_DATA_RETENTION_DAYS || '2555'), // 7 years
        behavioral_data: parseInt(process.env.GDPR_BEHAVIORAL_DATA_RETENTION_DAYS || '365'), // 1 year
        location_data: parseInt(process.env.GDPR_LOCATION_DATA_RETENTION_DAYS || '365'), // 1 year
        communication_data: parseInt(process.env.GDPR_COMMUNICATION_DATA_RETENTION_DAYS || '1095') // 3 years
      },
      automaticDeletion: process.env.GDPR_AUTOMATIC_DELETION === 'true' || true,
      deletionGracePeriodDays: parseInt(process.env.GDPR_DELETION_GRACE_PERIOD_DAYS || '30'),
      archiveBeforeDeletion: process.env.GDPR_ARCHIVE_BEFORE_DELETION === 'true' || true,
      archiveRetentionYears: parseInt(process.env.GDPR_ARCHIVE_RETENTION_YEARS || '7'),
      notifyBeforeDeletion: process.env.GDPR_NOTIFY_BEFORE_DELETION === 'true' || true,
      notificationDaysBefore: parseInt(process.env.GDPR_DELETION_NOTIFICATION_DAYS || '30')
    },

    consentManagement: {
      enabled: process.env.GDPR_CONSENT_MANAGEMENT_ENABLED === 'true' || true,
      requireExplicitConsent: process.env.GDPR_REQUIRE_EXPLICIT_CONSENT === 'true' || true,
      consentExpirationDays: parseInt(process.env.GDPR_CONSENT_EXPIRATION_DAYS || '730'), // 2 years
      renewalNotificationDays: parseInt(process.env.GDPR_CONSENT_RENEWAL_NOTIFICATION_DAYS || '30'),
      granularConsent: process.env.GDPR_GRANULAR_CONSENT === 'true' || true,
      withdrawalMethods: (process.env.GDPR_CONSENT_WITHDRAWAL_METHODS || 'ui,email,api').split(',') as ('ui' | 'email' | 'api')[],
      consentVersioning: process.env.GDPR_CONSENT_VERSIONING === 'true' || true,
      doubleOptIn: process.env.GDPR_DOUBLE_OPT_IN === 'true' || false,
      consentProofStorage: process.env.GDPR_CONSENT_PROOF_STORAGE === 'true' || true
    },

    dataSubjectRights: {
      enabled: process.env.GDPR_DATA_SUBJECT_RIGHTS_ENABLED === 'true' || true,
      accessRequestResponseDays: parseInt(process.env.GDPR_ACCESS_REQUEST_RESPONSE_DAYS || '30'),
      rectificationResponseDays: parseInt(process.env.GDPR_RECTIFICATION_RESPONSE_DAYS || '30'),
      erasureResponseDays: parseInt(process.env.GDPR_ERASURE_RESPONSE_DAYS || '30'),
      portabilityResponseDays: parseInt(process.env.GDPR_PORTABILITY_RESPONSE_DAYS || '30'),
      restrictionResponseDays: parseInt(process.env.GDPR_RESTRICTION_RESPONSE_DAYS || '30'),
      objectionResponseDays: parseInt(process.env.GDPR_OBJECTION_RESPONSE_DAYS || '30'),
      automatedDecisionMaking: process.env.GDPR_AUTOMATED_DECISION_MAKING === 'true' || false,
      identityVerification: process.env.GDPR_IDENTITY_VERIFICATION === 'true' || true,
      freeOfCharge: process.env.GDPR_FREE_OF_CHARGE === 'true' || true,
      requestLimits: {
        maxRequestsPerMonth: parseInt(process.env.GDPR_MAX_REQUESTS_PER_MONTH || '3'),
        cooldownPeriodDays: parseInt(process.env.GDPR_REQUEST_COOLDOWN_DAYS || '30')
      }
    },

    auditTrail: {
      enabled: process.env.GDPR_AUDIT_TRAIL_ENABLED === 'true' || true,
      auditAllDataAccess: process.env.GDPR_AUDIT_ALL_DATA_ACCESS === 'true' || true,
      auditDataModification: process.env.GDPR_AUDIT_DATA_MODIFICATION === 'true' || true,
      auditConsentChanges: process.env.GDPR_AUDIT_CONSENT_CHANGES === 'true' || true,
      auditRightsExercise: process.env.GDPR_AUDIT_RIGHTS_EXERCISE === 'true' || true,
      retentionPeriodYears: parseInt(process.env.GDPR_AUDIT_RETENTION_YEARS || '7'),
      detailedLogging: process.env.GDPR_DETAILED_LOGGING === 'true' || true,
      realTimeAlerting: process.env.GDPR_REAL_TIME_ALERTING === 'true' || true,
      integrityProtection: process.env.GDPR_AUDIT_INTEGRITY_PROTECTION === 'true' || true,
      encryptAuditLogs: process.env.GDPR_ENCRYPT_AUDIT_LOGS === 'true' || true
    },

    reporting: {
      enabled: process.env.GDPR_REPORTING_ENABLED === 'true' || true,
      automaticReporting: process.env.GDPR_AUTOMATIC_REPORTING === 'true' || true,
      reportingFrequency: (process.env.GDPR_REPORTING_FREQUENCY || 'monthly') as 'daily' | 'weekly' | 'monthly' | 'quarterly',
      reportTypes: (process.env.GDPR_REPORT_TYPES || 'compliance_summary,data_processing,consent_analytics').split(',') as any[],
      exportFormats: (process.env.GDPR_EXPORT_FORMATS || 'json,csv,pdf').split(',') as ('json' | 'csv' | 'pdf' | 'xml')[],
      emailReports: process.env.GDPR_EMAIL_REPORTS === 'true' || true,
      reportRecipients: (process.env.GDPR_REPORT_RECIPIENTS || 'compliance@codai.ro,dpo@codai.ro').split(','),
      customReportTemplates: process.env.GDPR_CUSTOM_REPORT_TEMPLATES === 'true' || false
    },

    notifications: {
      enabled: process.env.GDPR_NOTIFICATIONS_ENABLED === 'true' || true,
      channels: (process.env.GDPR_NOTIFICATION_CHANNELS || 'email,dashboard').split(',') as ('email' | 'sms' | 'webhook' | 'dashboard')[],
      emailConfig: {
        smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
        smtpPort: parseInt(process.env.SMTP_PORT || '587'),
        smtpUser: process.env.SMTP_USER || '',
        smtpPassword: process.env.SMTP_PASSWORD || '',
        fromAddress: process.env.GDPR_FROM_EMAIL || 'compliance@codai.ro',
        fromName: process.env.GDPR_FROM_NAME || 'CodAI Compliance Team'
      },
      webhookConfig: {
        url: process.env.GDPR_WEBHOOK_URL || '',
        secret: process.env.GDPR_WEBHOOK_SECRET || '',
        retryAttempts: parseInt(process.env.GDPR_WEBHOOK_RETRY_ATTEMPTS || '3')
      },
      notificationTypes: {
        consentExpiry: process.env.GDPR_NOTIFY_CONSENT_EXPIRY === 'true' || true,
        dataRetentionWarning: process.env.GDPR_NOTIFY_DATA_RETENTION_WARNING === 'true' || true,
        rightsRequestReceived: process.env.GDPR_NOTIFY_RIGHTS_REQUEST === 'true' || true,
        complianceIssue: process.env.GDPR_NOTIFY_COMPLIANCE_ISSUE === 'true' || true,
        auditAlert: process.env.GDPR_NOTIFY_AUDIT_ALERT === 'true' || true
      }
    },

    dataProcessing: {
      dataMinimization: process.env.GDPR_DATA_MINIMIZATION === 'true' || true,
      purposeLimitation: process.env.GDPR_PURPOSE_LIMITATION === 'true' || true,
      accuracyMaintenance: process.env.GDPR_ACCURACY_MAINTENANCE === 'true' || true,
      storageMinimization: process.env.GDPR_STORAGE_MINIMIZATION === 'true' || true,
      integrityConfidentiality: process.env.GDPR_INTEGRITY_CONFIDENTIALITY === 'true' || true,
      accountability: process.env.GDPR_ACCOUNTABILITY === 'true' || true,
      transparencyReporting: process.env.GDPR_TRANSPARENCY_REPORTING === 'true' || true,
      dataProtectionByDesign: process.env.GDPR_DATA_PROTECTION_BY_DESIGN === 'true' || true,
      dataProtectionByDefault: process.env.GDPR_DATA_PROTECTION_BY_DEFAULT === 'true' || true
    },

    security: {
      encryption: {
        atRest: process.env.GDPR_ENCRYPTION_AT_REST === 'true' || true,
        inTransit: process.env.GDPR_ENCRYPTION_IN_TRANSIT === 'true' || true,
        keyManagement: process.env.GDPR_KEY_MANAGEMENT === 'true' || true
      },
      accessControl: {
        roleBased: process.env.GDPR_ROLE_BASED_ACCESS === 'true' || true,
        attributeBased: process.env.GDPR_ATTRIBUTE_BASED_ACCESS === 'true' || false,
        multiFactorAuth: process.env.GDPR_MULTI_FACTOR_AUTH === 'true' || true
      },
      monitoring: {
        accessLogging: process.env.GDPR_ACCESS_LOGGING === 'true' || true,
        anomalyDetection: process.env.GDPR_ANOMALY_DETECTION === 'true' || true,
        realTimeAlerts: process.env.GDPR_REAL_TIME_ALERTS === 'true' || true
      }
    },

    monitoring: {
      enabled: process.env.GDPR_MONITORING_ENABLED === 'true' || true,
      dashboardEnabled: process.env.GDPR_DASHBOARD_ENABLED === 'true' || true,
      metricsCollection: process.env.GDPR_METRICS_COLLECTION === 'true' || true,
      complianceScoring: process.env.GDPR_COMPLIANCE_SCORING === 'true' || true,
      automatedAssessment: process.env.GDPR_AUTOMATED_ASSESSMENT === 'true' || true,
      riskAssessment: process.env.GDPR_RISK_ASSESSMENT === 'true' || true,
      complianceAlerts: process.env.GDPR_COMPLIANCE_ALERTS === 'true' || true,
      performanceImpactMonitoring: process.env.GDPR_PERFORMANCE_IMPACT_MONITORING === 'true' || true
    }
  };
}

export function getDevelopmentGdprConfig(): GdprComplianceConfig {
  const config = getDefaultGdprConfig();

  // Development-specific overrides
  return {
    ...config,
    dataRetention: {
      ...config.dataRetention,
      defaultRetentionPeriodDays: 30, // Shorter retention for development
      automaticDeletion: false, // Don't auto-delete in dev
      notifyBeforeDeletion: false
    },
    consentManagement: {
      ...config.consentManagement,
      consentExpirationDays: 90, // Shorter consent period for dev
      doubleOptIn: false // Skip double opt-in in dev
    },
    notifications: {
      ...config.notifications,
      channels: ['dashboard'], // Only dashboard notifications in dev
      emailConfig: {
        ...config.notifications.emailConfig,
        fromAddress: 'dev-compliance@codai.ro'
      }
    },
    reporting: {
      ...config.reporting,
      automaticReporting: false, // Manual reporting in dev
      reportingFrequency: 'weekly'
    }
  };
}

export function getProductionGdprConfig(): GdprComplianceConfig {
  const config = getDefaultGdprConfig();

  // Production-specific overrides
  return {
    ...config,
    auditTrail: {
      ...config.auditTrail,
      auditAllDataAccess: true,
      detailedLogging: true,
      integrityProtection: true,
      encryptAuditLogs: true
    },
    security: {
      ...config.security,
      encryption: {
        atRest: true,
        inTransit: true,
        keyManagement: true
      },
      accessControl: {
        roleBased: true,
        attributeBased: true,
        multiFactorAuth: true
      },
      monitoring: {
        accessLogging: true,
        anomalyDetection: true,
        realTimeAlerts: true
      }
    },
    notifications: {
      ...config.notifications,
      channels: ['email', 'webhook', 'dashboard'],
      notificationTypes: {
        consentExpiry: true,
        dataRetentionWarning: true,
        rightsRequestReceived: true,
        complianceIssue: true,
        auditAlert: true
      }
    }
  };
}

export function getGdprConfigForEnvironment(): GdprComplianceConfig {
  const environment = process.env.NODE_ENV || 'development';

  switch (environment) {
    case 'production':
      return getProductionGdprConfig();
    case 'staging':
      return getDefaultGdprConfig();
    case 'development':
    case 'test':
    default:
      return getDevelopmentGdprConfig();
  }
}

export const gdprComplianceConfig = getGdprConfigForEnvironment();