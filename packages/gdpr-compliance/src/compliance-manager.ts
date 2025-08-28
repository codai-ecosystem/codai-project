/**
 * GDPR Compliance Manager
 * Main orchestration class for GDPR compliance features across Essential CodAI Services
 */

import { v4 as uuidv4 } from 'uuid';
import { gdprComplianceConfig } from './config';
import { ConsentManager } from './consent-manager';
import { DataSubjectRightsManager } from './data-subject-rights-manager';
import { AuditTrailManager } from './audit-trail-manager';
import { DataRetentionManager } from './data-retention-manager';
import { ComplianceReporter } from './compliance-reporter';
import { GdprLogger } from './logger';
import {
  GdprComplianceConfig,
  DataSubject,
  ConsentRecord,
  DataSubjectRight,
  AuditEvent,
  ComplianceViolation,
  ComplianceReport,
  GdprComplianceStatus,
  EssentialServiceGdprProfile,
  ConsentRequest,
  DataSubjectRightRequest,
  DataExportRequest,
  DataDeletionRequest
} from './types';

export class GdprComplianceManager {
  private config: GdprComplianceConfig;
  private consentManager: ConsentManager;
  private rightsManager: DataSubjectRightsManager;
  private auditManager: AuditTrailManager;
  private retentionManager: DataRetentionManager;
  private reporter: ComplianceReporter;
  private logger: GdprLogger;
  private isInitialized: boolean = false;

  constructor(config?: Partial<GdprComplianceConfig>) {
    this.config = { ...gdprComplianceConfig, ...config };
    this.logger = new GdprLogger(this.config);
    this.consentManager = new ConsentManager(this.config, this.logger);
    this.rightsManager = new DataSubjectRightsManager(this.config, this.logger);
    this.auditManager = new AuditTrailManager(this.config, this.logger);
    this.retentionManager = new DataRetentionManager(this.config, this.logger);
    this.reporter = new ComplianceReporter(this.config, this.logger);
  }

  /**
   * Initialize GDPR compliance for a service
   */
  async initializeCompliance(serviceId: string, serviceProfile?: EssentialServiceGdprProfile): Promise<void> {
    try {
      this.logger.info('Initializing GDPR compliance', { serviceId });

      // Initialize all managers
      await this.consentManager.initialize(serviceId);
      await this.rightsManager.initialize(serviceId);
      await this.auditManager.initialize(serviceId);
      await this.retentionManager.initialize(serviceId, serviceProfile);
      await this.reporter.initialize(serviceId);

      this.isInitialized = true;

      await this.auditManager.logEvent({
        id: uuidv4(),
        timestamp: new Date(),
        eventType: 'data_access',
        dataSubjectId: 'system',
        serviceId,
        action: 'compliance_initialization',
        resource: 'gdpr_compliance_manager',
        dataCategories: [],
        legalBasis: 'legal_obligation',
        processingPurpose: 'legal_compliance',
        ipAddress: '127.0.0.1',
        userAgent: 'GdprComplianceManager/1.0.0',
        success: true,
        metadata: { serviceProfile: serviceProfile?.serviceId || 'unknown' },
        correlationId: uuidv4()
      });

      this.logger.info('GDPR compliance initialized successfully', { serviceId });
    } catch (error) {
      this.logger.error('Failed to initialize GDPR compliance', { serviceId, error });
      throw error;
    }
  }

  /**
   * Get overall compliance status for a service
   */
  async getComplianceStatus(serviceId: string): Promise<GdprComplianceStatus> {
    try {
      const consentStatus = await this.consentManager.getConsentCompliance(serviceId);
      const retentionStatus = await this.retentionManager.getRetentionCompliance(serviceId);
      const rightsStatus = await this.rightsManager.getRightsCompliance(serviceId);
      const auditStatus = await this.auditManager.getAuditCompliance(serviceId);

      const overallScore = Math.round(
        (consentStatus.score +
          retentionStatus.score +
          rightsStatus.score +
          auditStatus.score) / 4
      );

      const status: GdprComplianceStatus = {
        overall: overallScore >= 80 ? 'compliant' : overallScore >= 60 ? 'pending_review' : 'non_compliant',
        consent: consentStatus.status,
        retention: retentionStatus.status,
        rights: rightsStatus.status,
        audit: auditStatus.status,
        security: 'compliant', // TODO: Implement security compliance check
        score: overallScore,
        lastAssessment: new Date(),
        nextAssessment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      };

      return status;
    } catch (error) {
      this.logger.error('Failed to get compliance status', { serviceId, error });
      throw error;
    }
  }

  /**
   * Record consent for data processing
   */
  async recordConsent(serviceId: string, consentRequest: ConsentRequest): Promise<ConsentRecord> {
    try {
      this.logger.info('Recording consent', { serviceId, dataSubjectId: consentRequest.dataSubjectId });

      const consent = await this.consentManager.recordConsent(serviceId, consentRequest);

      await this.auditManager.logEvent({
        id: uuidv4(),
        timestamp: new Date(),
        eventType: 'consent_given',
        dataSubjectId: consentRequest.dataSubjectId,
        serviceId,
        action: 'record_consent',
        resource: 'consent_record',
        resourceId: consent.id,
        dataCategories: consentRequest.dataCategories,
        legalBasis: 'consent',
        processingPurpose: consentRequest.purposes[0], // Use first purpose
        ipAddress: consent.ipAddress,
        userAgent: consent.userAgent,
        success: true,
        metadata: { consentType: consentRequest.consentType },
        correlationId: uuidv4()
      });

      return consent;
    } catch (error) {
      this.logger.error('Failed to record consent', { serviceId, error });
      throw error;
    }
  }

  /**
   * Withdraw consent
   */
  async withdrawConsent(serviceId: string, dataSubjectId: string, consentId: string, reason?: string): Promise<void> {
    try {
      this.logger.info('Withdrawing consent', { serviceId, dataSubjectId, consentId });

      await this.consentManager.withdrawConsent(consentId, reason);

      await this.auditManager.logEvent({
        id: uuidv4(),
        timestamp: new Date(),
        eventType: 'consent_withdrawn',
        dataSubjectId,
        serviceId,
        action: 'withdraw_consent',
        resource: 'consent_record',
        resourceId: consentId,
        dataCategories: [],
        legalBasis: 'consent',
        processingPurpose: 'legal_compliance',
        ipAddress: '0.0.0.0', // Unknown IP for withdrawal
        userAgent: 'System',
        success: true,
        metadata: { withdrawalReason: reason },
        correlationId: uuidv4()
      });

      this.logger.info('Consent withdrawn successfully', { serviceId, dataSubjectId, consentId });
    } catch (error) {
      this.logger.error('Failed to withdraw consent', { serviceId, error });
      throw error;
    }
  }

  /**
   * Process data subject right request
   */
  async processDataSubjectRight(serviceId: string, request: DataSubjectRightRequest): Promise<DataSubjectRight> {
    try {
      this.logger.info('Processing data subject right request', {
        serviceId,
        dataSubjectId: request.dataSubjectId,
        rightType: request.rightType
      });

      const rightsRequest = await this.rightsManager.processRightRequest(serviceId, request);

      await this.auditManager.logEvent({
        id: uuidv4(),
        timestamp: new Date(),
        eventType: 'right_exercised',
        dataSubjectId: request.dataSubjectId,
        serviceId,
        action: `exercise_right_${request.rightType}`,
        resource: 'data_subject_right',
        resourceId: rightsRequest.id,
        dataCategories: [],
        legalBasis: 'legal_obligation',
        processingPurpose: 'legal_compliance',
        ipAddress: '0.0.0.0',
        userAgent: 'System',
        success: true,
        metadata: {
          rightType: request.rightType,
          requestDetails: request.requestDetails
        },
        correlationId: uuidv4()
      });

      return rightsRequest;
    } catch (error) {
      this.logger.error('Failed to process data subject right request', { serviceId, error });
      throw error;
    }
  }

  /**
   * Export data for data portability right
   */
  async exportDataSubjectData(serviceId: string, request: DataExportRequest): Promise<string> {
    try {
      this.logger.info('Exporting data subject data', {
        serviceId,
        dataSubjectId: request.dataSubjectId,
        format: request.format
      });

      const exportId = await this.rightsManager.exportData(serviceId, request);

      await this.auditManager.logEvent({
        id: uuidv4(),
        timestamp: new Date(),
        eventType: 'data_access',
        dataSubjectId: request.dataSubjectId,
        serviceId,
        action: 'export_data',
        resource: 'data_export',
        resourceId: exportId,
        dataCategories: request.includeCategories,
        legalBasis: 'legal_obligation',
        processingPurpose: 'legal_compliance',
        ipAddress: '0.0.0.0',
        userAgent: 'System',
        success: true,
        metadata: {
          exportFormat: request.format,
          encrypted: request.encryptExport,
          deliveryMethod: request.deliveryMethod
        },
        correlationId: uuidv4()
      });

      return exportId;
    } catch (error) {
      this.logger.error('Failed to export data subject data', { serviceId, error });
      throw error;
    }
  }

  /**
   * Delete data subject data
   */
  async deleteDataSubjectData(serviceId: string, request: DataDeletionRequest): Promise<void> {
    try {
      this.logger.info('Deleting data subject data', {
        serviceId,
        dataSubjectId: request.dataSubjectId,
        hardDelete: request.hardDelete
      });

      await this.rightsManager.deleteData(serviceId, request);

      await this.auditManager.logEvent({
        id: uuidv4(),
        timestamp: new Date(),
        eventType: 'data_deletion',
        dataSubjectId: request.dataSubjectId,
        serviceId,
        action: request.hardDelete ? 'hard_delete_data' : 'soft_delete_data',
        resource: 'data_subject_data',
        dataCategories: [],
        legalBasis: 'legal_obligation',
        processingPurpose: 'legal_compliance',
        ipAddress: '0.0.0.0',
        userAgent: 'System',
        success: true,
        metadata: {
          deletionReason: request.deletionReason,
          hardDelete: request.hardDelete,
          scheduledDate: request.scheduledDate
        },
        correlationId: uuidv4()
      });

      this.logger.info('Data subject data deleted successfully', {
        serviceId,
        dataSubjectId: request.dataSubjectId
      });
    } catch (error) {
      this.logger.error('Failed to delete data subject data', { serviceId, error });
      throw error;
    }
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(
    serviceId: string,
    reportType: string = 'compliance_summary',
    periodStart?: Date,
    periodEnd?: Date
  ): Promise<ComplianceReport> {
    try {
      this.logger.info('Generating compliance report', { serviceId, reportType });

      const report = await this.reporter.generateReport(
        serviceId,
        reportType,
        periodStart,
        periodEnd
      );

      await this.auditManager.logEvent({
        id: uuidv4(),
        timestamp: new Date(),
        eventType: 'data_access',
        dataSubjectId: 'system',
        serviceId,
        action: 'generate_report',
        resource: 'compliance_report',
        resourceId: report.id,
        dataCategories: [],
        legalBasis: 'legal_obligation',
        processingPurpose: 'legal_compliance',
        ipAddress: '127.0.0.1',
        userAgent: 'ComplianceManager/1.0.0',
        success: true,
        metadata: { reportType },
        correlationId: uuidv4()
      });

      return report;
    } catch (error) {
      this.logger.error('Failed to generate compliance report', { serviceId, error });
      throw error;
    }
  }

  /**
   * Run data retention cleanup
   */
  async runDataRetentionCleanup(serviceId: string): Promise<void> {
    try {
      this.logger.info('Running data retention cleanup', { serviceId });

      const cleanupResults = await this.retentionManager.runCleanup(serviceId);

      await this.auditManager.logEvent({
        id: uuidv4(),
        timestamp: new Date(),
        eventType: 'data_deletion',
        dataSubjectId: 'system',
        serviceId,
        action: 'retention_cleanup',
        resource: 'data_retention',
        dataCategories: [],
        legalBasis: 'legal_obligation',
        processingPurpose: 'legal_compliance',
        ipAddress: '127.0.0.1',
        userAgent: 'RetentionManager/1.0.0',
        success: true,
        metadata: cleanupResults,
        correlationId: uuidv4()
      });

      this.logger.info('Data retention cleanup completed', { serviceId, results: cleanupResults });
    } catch (error) {
      this.logger.error('Failed to run data retention cleanup', { serviceId, error });
      throw error;
    }
  }

  /**
   * Get all consent records for a data subject
   */
  async getDataSubjectConsents(serviceId: string, dataSubjectId: string): Promise<ConsentRecord[]> {
    try {
      return await this.consentManager.getDataSubjectConsents(dataSubjectId);
    } catch (error) {
      this.logger.error('Failed to get data subject consents', { serviceId, dataSubjectId, error });
      throw error;
    }
  }

  /**
   * Get all rights requests for a data subject
   */
  async getDataSubjectRights(serviceId: string, dataSubjectId: string): Promise<DataSubjectRight[]> {
    try {
      return await this.rightsManager.getDataSubjectRights(dataSubjectId);
    } catch (error) {
      this.logger.error('Failed to get data subject rights', { serviceId, dataSubjectId, error });
      throw error;
    }
  }

  /**
   * Get audit trail for a data subject
   */
  async getDataSubjectAuditTrail(serviceId: string, dataSubjectId: string): Promise<AuditEvent[]> {
    try {
      return await this.auditManager.getDataSubjectAuditTrail(dataSubjectId);
    } catch (error) {
      this.logger.error('Failed to get data subject audit trail', { serviceId, dataSubjectId, error });
      throw error;
    }
  }

  /**
   * Detect compliance violations
   */
  async detectComplianceViolations(serviceId: string): Promise<ComplianceViolation[]> {
    try {
      this.logger.info('Detecting compliance violations', { serviceId });

      const violations: ComplianceViolation[] = [];

      // Check consent compliance
      const consentViolations = await this.consentManager.detectViolations(serviceId);
      violations.push(...consentViolations);

      // Check retention compliance
      const retentionViolations = await this.retentionManager.detectViolations(serviceId);
      violations.push(...retentionViolations);

      // Check rights compliance
      const rightsViolations = await this.rightsManager.detectViolations(serviceId);
      violations.push(...rightsViolations);

      return violations;
    } catch (error) {
      this.logger.error('Failed to detect compliance violations', { serviceId, error });
      throw error;
    }
  }

  /**
   * Get compliance metrics
   */
  async getComplianceMetrics(serviceId: string): Promise<any> {
    try {
      const consentMetrics = await this.consentManager.getMetrics(serviceId);
      const rightsMetrics = await this.rightsManager.getMetrics(serviceId);
      const auditMetrics = await this.auditManager.getMetrics(serviceId);
      const retentionMetrics = await this.retentionManager.getMetrics(serviceId);

      return {
        consent: consentMetrics,
        rights: rightsMetrics,
        audit: auditMetrics,
        retention: retentionMetrics,
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error('Failed to get compliance metrics', { serviceId, error });
      throw error;
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    try {
      await this.consentManager.cleanup();
      await this.rightsManager.cleanup();
      await this.auditManager.cleanup();
      await this.retentionManager.cleanup();
      await this.reporter.cleanup();
      await this.logger.cleanup();

      this.isInitialized = false;
      this.logger.info('GDPR compliance manager cleaned up successfully');
    } catch (error) {
      this.logger.error('Failed to cleanup compliance manager', { error });
      throw error;
    }
  }
}