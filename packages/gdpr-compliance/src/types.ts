/**
 * GDPR Compliance Types
 * Comprehensive type definitions for GDPR compliance features
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

// ============================================================================
// Core GDPR Types
// ============================================================================

export type GdprLegalBasis =
  | 'consent'
  | 'contract'
  | 'legal_obligation'
  | 'vital_interests'
  | 'public_task'
  | 'legitimate_interests';

export type DataCategory =
  | 'personal_data'
  | 'sensitive_data'
  | 'biometric_data'
  | 'health_data'
  | 'financial_data'
  | 'behavioral_data'
  | 'location_data'
  | 'communication_data';

export type ProcessingPurpose =
  | 'service_provision'
  | 'marketing'
  | 'analytics'
  | 'security'
  | 'legal_compliance'
  | 'customer_support'
  | 'product_improvement'
  | 'research';

export type ConsentStatus = 'given' | 'withdrawn' | 'pending' | 'expired';
export type DataSubjectRightType = 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction' | 'objection';
export type AuditEventType = 'data_access' | 'data_modification' | 'data_deletion' | 'consent_given' | 'consent_withdrawn' | 'right_exercised';
export type ComplianceStatus = 'compliant' | 'non_compliant' | 'pending_review' | 'remediation_required';

// ============================================================================
// Configuration Interfaces
// ============================================================================

export interface GdprComplianceConfig {
  enabled: boolean;
  dataRetention: DataRetentionConfig;
  consentManagement: ConsentManagementConfig;
  dataSubjectRights: DataSubjectRightsConfig;
  auditTrail: AuditTrailConfig;
  reporting: ReportingConfig;
  notifications: NotificationConfig;
  dataProcessing: DataProcessingConfig;
  security: ComplianceSecurityConfig;
  monitoring: ComplianceMonitoringConfig;
}

export interface DataRetentionConfig {
  enabled: boolean;
  defaultRetentionPeriodDays: number;
  categorySpecificRetention: Record<DataCategory, number>;
  automaticDeletion: boolean;
  deletionGracePeriodDays: number;
  archiveBeforeDeletion: boolean;
  archiveRetentionYears: number;
  notifyBeforeDeletion: boolean;
  notificationDaysBefore: number;
}

export interface ConsentManagementConfig {
  enabled: boolean;
  requireExplicitConsent: boolean;
  consentExpirationDays: number;
  renewalNotificationDays: number;
  granularConsent: boolean;
  withdrawalMethods: ('ui' | 'email' | 'api')[];
  consentVersioning: boolean;
  doubleOptIn: boolean;
  consentProofStorage: boolean;
}

export interface DataSubjectRightsConfig {
  enabled: boolean;
  accessRequestResponseDays: number;
  rectificationResponseDays: number;
  erasureResponseDays: number;
  portabilityResponseDays: number;
  restrictionResponseDays: number;
  objectionResponseDays: number;
  automatedDecisionMaking: boolean;
  identityVerification: boolean;
  freeOfCharge: boolean;
  requestLimits: {
    maxRequestsPerMonth: number;
    cooldownPeriodDays: number;
  };
}

export interface AuditTrailConfig {
  enabled: boolean;
  auditAllDataAccess: boolean;
  auditDataModification: boolean;
  auditConsentChanges: boolean;
  auditRightsExercise: boolean;
  retentionPeriodYears: number;
  detailedLogging: boolean;
  realTimeAlerting: boolean;
  integrityProtection: boolean;
  encryptAuditLogs: boolean;
}

export interface ReportingConfig {
  enabled: boolean;
  automaticReporting: boolean;
  reportingFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  reportTypes: ('compliance_summary' | 'data_processing' | 'consent_analytics' | 'breach_report' | 'dpo_report')[];
  exportFormats: ('json' | 'csv' | 'pdf' | 'xml')[];
  emailReports: boolean;
  reportRecipients: string[];
  customReportTemplates: boolean;
}

export interface NotificationConfig {
  enabled: boolean;
  channels: ('email' | 'sms' | 'webhook' | 'dashboard')[];
  emailConfig: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    fromAddress: string;
    fromName: string;
  };
  webhookConfig: {
    url: string;
    secret: string;
    retryAttempts: number;
  };
  notificationTypes: {
    consentExpiry: boolean;
    dataRetentionWarning: boolean;
    rightsRequestReceived: boolean;
    complianceIssue: boolean;
    auditAlert: boolean;
  };
}

export interface DataProcessingConfig {
  dataMinimization: boolean;
  purposeLimitation: boolean;
  accuracyMaintenance: boolean;
  storageMinimization: boolean;
  integrityConfidentiality: boolean;
  accountability: boolean;
  transparencyReporting: boolean;
  dataProtectionByDesign: boolean;
  dataProtectionByDefault: boolean;
}

export interface ComplianceSecurityConfig {
  encryption: {
    atRest: boolean;
    inTransit: boolean;
    keyManagement: boolean;
  };
  accessControl: {
    roleBased: boolean;
    attributeBased: boolean;
    multiFactorAuth: boolean;
  };
  monitoring: {
    accessLogging: boolean;
    anomalyDetection: boolean;
    realTimeAlerts: boolean;
  };
}

export interface ComplianceMonitoringConfig {
  enabled: boolean;
  dashboardEnabled: boolean;
  metricsCollection: boolean;
  complianceScoring: boolean;
  automatedAssessment: boolean;
  riskAssessment: boolean;
  complianceAlerts: boolean;
  performanceImpactMonitoring: boolean;
}

// ============================================================================
// Data Models
// ============================================================================

export interface DataSubject {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  nationality?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  dataCategories: DataCategory[];
  legalBases: GdprLegalBasis[];
  processingPurposes: ProcessingPurpose[];
}

export interface ConsentRecord {
  id: string;
  dataSubjectId: string;
  serviceId: string;
  consentType: string;
  purpose: ProcessingPurpose;
  dataCategories: DataCategory[];
  legalBasis: GdprLegalBasis;
  status: ConsentStatus;
  consentText: string;
  consentVersion: string;
  givenAt: Date;
  expiresAt?: Date;
  withdrawnAt?: Date;
  withdrawalReason?: string;
  ipAddress: string;
  userAgent: string;
  consentMethod: 'explicit' | 'implicit' | 'opt_in' | 'opt_out';
  doubleOptInConfirmed: boolean;
  proof: ConsentProof;
  metadata: Record<string, any>;
}

export interface ConsentProof {
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  consentString: string;
  checkboxStates: Record<string, boolean>;
  formData: Record<string, any>;
  digitalSignature?: string;
}

export interface DataSubjectRight {
  id: string;
  dataSubjectId: string;
  rightType: DataSubjectRightType;
  requestDate: Date;
  requestDetails: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  responseDate?: Date;
  responseDetails?: string;
  fulfilledBy?: string;
  verificationMethod: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  attachments: string[];
  metadata: Record<string, any>;
}

export interface AuditEvent {
  id: string;
  timestamp: Date;
  eventType: AuditEventType;
  dataSubjectId: string;
  serviceId: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  dataCategories: DataCategory[];
  legalBasis: GdprLegalBasis;
  processingPurpose: ProcessingPurpose;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  errorMessage?: string;
  dataChanged?: {
    before: any;
    after: any;
  };
  metadata: Record<string, any>;
  correlationId: string;
  sessionId?: string;
}

export interface DataProcessingRecord {
  id: string;
  serviceId: string;
  dataSubjectId: string;
  processingActivity: string;
  purpose: ProcessingPurpose;
  dataCategories: DataCategory[];
  legalBasis: GdprLegalBasis;
  dataSource: string;
  recipients: string[];
  thirdCountryTransfers: boolean;
  retentionPeriod: number;
  securityMeasures: string[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface ComplianceViolation {
  id: string;
  violationType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  serviceId: string;
  dataSubjectId?: string;
  detectedAt: Date;
  resolvedAt?: Date;
  resolution?: string;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  assignedTo?: string;
  evidence: any[];
  impactAssessment: string;
  remediationSteps: string[];
  metadata: Record<string, any>;
}

export interface ComplianceReport {
  id: string;
  reportType: string;
  generatedAt: Date;
  periodStart: Date;
  periodEnd: Date;
  serviceIds: string[];
  summary: {
    totalDataSubjects: number;
    activeConsents: number;
    expiredConsents: number;
    withdrawnConsents: number;
    rightsRequests: number;
    violations: number;
    complianceScore: number;
  };
  metrics: ComplianceMetrics;
  recommendations: string[];
  attachments: string[];
  metadata: Record<string, any>;
}

export interface ComplianceMetrics {
  consentMetrics: {
    totalConsents: number;
    consentRate: number;
    withdrawalRate: number;
    expirationRate: number;
    renewalRate: number;
  };
  rightsMetrics: {
    accessRequests: number;
    rectificationRequests: number;
    erasureRequests: number;
    portabilityRequests: number;
    responseTime: number;
    fulfillmentRate: number;
  };
  dataMetrics: {
    totalRecords: number;
    categoryCounts: Record<DataCategory, number>;
    retentionCompliance: number;
    deletionCompliance: number;
  };
  securityMetrics: {
    encryptionCoverage: number;
    accessControlCompliance: number;
    auditCoverage: number;
    incidentCount: number;
  };
  performanceMetrics: {
    processingTime: number;
    systemLoad: number;
    errorRate: number;
    uptime: number;
  };
}

// ============================================================================
// Essential CodAI Services Configuration
// ============================================================================

export interface EssentialServiceGdprProfile {
  serviceId: string;
  serviceName: string;
  port: number;
  dataCategories: DataCategory[];
  processingPurposes: ProcessingPurpose[];
  legalBases: GdprLegalBasis[];
  retentionPeriodDays: number;
  complianceLevel: 'basic' | 'standard' | 'enhanced';
  specialConsiderations: string[];
  dataFlows: DataFlow[];
}

export interface DataFlow {
  id: string;
  source: string;
  destination: string;
  dataCategories: DataCategory[];
  purpose: ProcessingPurpose;
  frequency: string;
  encryption: boolean;
  retention: number;
}

export const ESSENTIAL_CODAI_GDPR_PROFILES: EssentialServiceGdprProfile[] = [
  {
    serviceId: 'codai-auth-api',
    serviceName: 'CodAI Authentication API',
    port: 8100,
    dataCategories: ['personal_data', 'behavioral_data', 'communication_data'],
    processingPurposes: ['service_provision', 'security', 'legal_compliance'],
    legalBases: ['consent', 'contract', 'legal_obligation'],
    retentionPeriodDays: 2555, // 7 years for auth data
    complianceLevel: 'enhanced',
    specialConsiderations: [
      'Multi-factor authentication data',
      'OAuth2 tokens and refresh tokens',
      'Password hashes and security credentials',
      'Login attempt tracking and fraud detection'
    ],
    dataFlows: [
      {
        id: 'auth-to-gateway',
        source: 'codai-auth-api',
        destination: 'codai-gateway-api',
        dataCategories: ['personal_data'],
        purpose: 'service_provision',
        frequency: 'real_time',
        encryption: true,
        retention: 30
      }
    ]
  },
  {
    serviceId: 'codai-gateway-api',
    serviceName: 'CodAI API Gateway',
    port: 8010,
    dataCategories: ['personal_data', 'behavioral_data', 'communication_data'],
    processingPurposes: ['service_provision', 'analytics', 'security'],
    legalBases: ['consent', 'legitimate_interests'],
    retentionPeriodDays: 1095, // 3 years for gateway logs
    complianceLevel: 'standard',
    specialConsiderations: [
      'API request/response logging',
      'Rate limiting and traffic analysis',
      'Request routing and load balancing',
      'Security monitoring and threat detection'
    ],
    dataFlows: [
      {
        id: 'gateway-to-hub',
        source: 'codai-gateway-api',
        destination: 'codai-hub-api',
        dataCategories: ['personal_data', 'behavioral_data'],
        purpose: 'service_provision',
        frequency: 'real_time',
        encryption: true,
        retention: 90
      }
    ]
  },
  {
    serviceId: 'codai-hub-api',
    serviceName: 'CodAI Hub API',
    port: 8110,
    dataCategories: ['personal_data', 'behavioral_data', 'communication_data'],
    processingPurposes: ['service_provision', 'customer_support', 'product_improvement'],
    legalBases: ['consent', 'contract'],
    retentionPeriodDays: 1825, // 5 years for hub data
    complianceLevel: 'standard',
    specialConsiderations: [
      'User-generated content and projects',
      'Collaboration and sharing features',
      'File uploads and document processing',
      'Activity tracking and usage analytics'
    ],
    dataFlows: [
      {
        id: 'hub-to-memorai',
        source: 'codai-hub-api',
        destination: 'codai-memorai-mcp',
        dataCategories: ['personal_data', 'behavioral_data'],
        purpose: 'service_provision',
        frequency: 'batch_hourly',
        encryption: true,
        retention: 180
      }
    ]
  },
  {
    serviceId: 'codai-memorai-mcp',
    serviceName: 'MemorAI MCP Server',
    port: 4950,
    dataCategories: ['personal_data', 'behavioral_data', 'sensitive_data'],
    processingPurposes: ['service_provision', 'analytics', 'product_improvement'],
    legalBases: ['consent', 'legitimate_interests'],
    retentionPeriodDays: 1095, // 3 years for memory data
    complianceLevel: 'enhanced',
    specialConsiderations: [
      'AI memory and context storage',
      'Conversation history and interactions',
      'Learning and personalization data',
      'Vector embeddings and semantic data'
    ],
    dataFlows: [
      {
        id: 'memorai-to-database',
        source: 'codai-memorai-mcp',
        destination: 'codai-cbd-database',
        dataCategories: ['personal_data', 'behavioral_data', 'sensitive_data'],
        purpose: 'service_provision',
        frequency: 'real_time',
        encryption: true,
        retention: 1095
      }
    ]
  },
  {
    serviceId: 'codai-cbd-database',
    serviceName: 'CBD Graph Database',
    port: 8180,
    dataCategories: ['personal_data', 'behavioral_data', 'sensitive_data'],
    processingPurposes: ['service_provision', 'analytics', 'research'],
    legalBases: ['consent', 'legitimate_interests'],
    retentionPeriodDays: 2190, // 6 years for database records
    complianceLevel: 'enhanced',
    specialConsiderations: [
      'Graph database relationships and connections',
      'Complex data structures and hierarchies',
      'Cross-service data integration',
      'Advanced query and analytics capabilities'
    ],
    dataFlows: [
      {
        id: 'database-to-frontend',
        source: 'codai-cbd-database',
        destination: 'codai-memorai-frontend',
        dataCategories: ['personal_data', 'behavioral_data'],
        purpose: 'service_provision',
        frequency: 'real_time',
        encryption: true,
        retention: 30
      }
    ]
  },
  {
    serviceId: 'codai-memorai-frontend',
    serviceName: 'MemorAI Frontend Application',
    port: 8006,
    dataCategories: ['personal_data', 'behavioral_data'],
    processingPurposes: ['service_provision', 'analytics', 'customer_support'],
    legalBases: ['consent', 'legitimate_interests'],
    retentionPeriodDays: 365, // 1 year for frontend data
    complianceLevel: 'standard',
    specialConsiderations: [
      'User interface interactions and preferences',
      'Session data and state management',
      'Client-side caching and storage',
      'Performance monitoring and error tracking'
    ],
    dataFlows: [
      {
        id: 'frontend-analytics',
        source: 'codai-memorai-frontend',
        destination: 'analytics_service',
        dataCategories: ['behavioral_data'],
        purpose: 'analytics',
        frequency: 'batch_daily',
        encryption: true,
        retention: 90
      }
    ]
  }
];

// ============================================================================
// API Interfaces
// ============================================================================

export interface GdprComplianceMiddleware {
  (request: FastifyRequest, reply: FastifyReply): Promise<void>;
}

export interface DataSubjectRightRequest {
  dataSubjectId: string;
  rightType: DataSubjectRightType;
  requestDetails: string;
  verificationData: Record<string, any>;
  contactMethod: 'email' | 'phone' | 'postal';
}

export interface ConsentRequest {
  dataSubjectId: string;
  serviceId: string;
  consentType: string;
  purposes: ProcessingPurpose[];
  dataCategories: DataCategory[];
  consentText: string;
  consentMethod: 'explicit' | 'implicit';
  metadata: Record<string, any>;
}

export interface DataExportRequest {
  dataSubjectId: string;
  format: 'json' | 'csv' | 'xml';
  includeCategories: DataCategory[];
  encryptExport: boolean;
  deliveryMethod: 'download' | 'email';
}

export interface DataDeletionRequest {
  dataSubjectId: string;
  deletionReason: string;
  hardDelete: boolean;
  confirmationRequired: boolean;
  scheduledDate?: Date;
}

// ============================================================================
// Helper Types
// ============================================================================

export type GdprComplianceStatus = {
  overall: ComplianceStatus;
  consent: ComplianceStatus;
  retention: ComplianceStatus;
  rights: ComplianceStatus;
  audit: ComplianceStatus;
  security: ComplianceStatus;
  score: number;
  lastAssessment: Date;
  nextAssessment: Date;
};

export type ServiceComplianceProfile = {
  serviceId: string;
  profile: EssentialServiceGdprProfile;
  status: GdprComplianceStatus;
  lastUpdate: Date;
  configuration: Partial<GdprComplianceConfig>;
};

// ============================================================================
// Utility Functions
// ============================================================================

export function getServiceGdprProfile(serviceId: string): EssentialServiceGdprProfile | undefined {
  return ESSENTIAL_CODAI_GDPR_PROFILES.find(profile => profile.serviceId === serviceId);
}

export function getAllServiceIds(): string[] {
  return ESSENTIAL_CODAI_GDPR_PROFILES.map(profile => profile.serviceId);
}

export function getServicesByComplianceLevel(level: 'basic' | 'standard' | 'enhanced'): EssentialServiceGdprProfile[] {
  return ESSENTIAL_CODAI_GDPR_PROFILES.filter(profile => profile.complianceLevel === level);
}

export function getServicesProcessingDataCategory(category: DataCategory): EssentialServiceGdprProfile[] {
  return ESSENTIAL_CODAI_GDPR_PROFILES.filter(profile =>
    profile.dataCategories.includes(category)
  );
}