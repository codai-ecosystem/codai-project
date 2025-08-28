/**
 * Consent Management System
 * Handles GDPR consent recording, validation, and lifecycle management
 */

import { v4 as uuidv4 } from 'uuid';
import { GdprComplianceConfig, ConsentRecord, ConsentRequest, ConsentStatus, ComplianceViolation } from './types';
import { GdprLogger } from './logger';

export class ConsentManager {
  private config: GdprComplianceConfig;
  private logger: GdprLogger;
  private consents: Map<string, ConsentRecord> = new Map();

  constructor(config: GdprComplianceConfig, logger: GdprLogger) {
    this.config = config;
    this.logger = logger;
  }

  async initialize(serviceId: string): Promise<void> {
    this.logger.info('Initializing consent manager', { serviceId });
    // In a real implementation, this would initialize database connections
    // and load existing consent records
  }

  async recordConsent(serviceId: string, request: ConsentRequest): Promise<ConsentRecord> {
    const consent: ConsentRecord = {
      id: uuidv4(),
      dataSubjectId: request.dataSubjectId,
      serviceId,
      consentType: request.consentType,
      purpose: request.purposes[0], // For simplicity, taking first purpose
      dataCategories: request.dataCategories,
      legalBasis: 'consent',
      status: 'given',
      consentText: request.consentText,
      consentVersion: '1.0',
      givenAt: new Date(),
      expiresAt: this.config.consentManagement.consentExpirationDays
        ? new Date(Date.now() + this.config.consentManagement.consentExpirationDays * 24 * 60 * 60 * 1000)
        : undefined,
      ipAddress: '0.0.0.0',
      userAgent: 'Unknown',
      consentMethod: request.consentMethod,
      doubleOptInConfirmed: !this.config.consentManagement.doubleOptIn,
      proof: {
        timestamp: new Date(),
        ipAddress: '0.0.0.0',
        userAgent: 'Unknown',
        consentString: request.consentText,
        checkboxStates: {},
        formData: request.metadata
      },
      metadata: request.metadata
    };

    this.consents.set(consent.id, consent);
    this.logger.info('Consent recorded', { consentId: consent.id, dataSubjectId: request.dataSubjectId });

    return consent;
  }

  async withdrawConsent(consentId: string, reason?: string): Promise<void> {
    const consent = this.consents.get(consentId);
    if (!consent) {
      throw new Error(`Consent not found: ${consentId}`);
    }

    consent.status = 'withdrawn';
    consent.withdrawnAt = new Date();
    consent.withdrawalReason = reason;

    this.consents.set(consentId, consent);
    this.logger.info('Consent withdrawn', { consentId, reason });
  }

  async getDataSubjectConsents(dataSubjectId: string): Promise<ConsentRecord[]> {
    return Array.from(this.consents.values()).filter(
      consent => consent.dataSubjectId === dataSubjectId
    );
  }

  async getConsentCompliance(serviceId: string): Promise<{ status: any; score: number }> {
    const serviceConsents = Array.from(this.consents.values()).filter(
      consent => consent.serviceId === serviceId
    );

    const totalConsents = serviceConsents.length;
    const validConsents = serviceConsents.filter(
      consent => consent.status === 'given' && (!consent.expiresAt || consent.expiresAt > new Date())
    ).length;

    const complianceScore = totalConsents > 0 ? Math.round((validConsents / totalConsents) * 100) : 100;

    return {
      status: complianceScore >= 80 ? 'compliant' : complianceScore >= 60 ? 'pending_review' : 'non_compliant',
      score: complianceScore
    };
  }

  async detectViolations(serviceId: string): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = [];

    // Check for expired consents
    const expiredConsents = Array.from(this.consents.values()).filter(
      consent => consent.serviceId === serviceId &&
        consent.expiresAt &&
        consent.expiresAt < new Date() &&
        consent.status === 'given'
    );

    for (const consent of expiredConsents) {
      violations.push({
        id: uuidv4(),
        violationType: 'expired_consent',
        severity: 'medium',
        description: `Consent ${consent.id} has expired and requires renewal`,
        serviceId,
        dataSubjectId: consent.dataSubjectId,
        detectedAt: new Date(),
        status: 'open',
        evidence: [consent],
        impactAssessment: 'Data processing may be continuing without valid consent',
        remediationSteps: [
          'Request consent renewal from data subject',
          'Stop processing if consent is not renewed',
          'Archive or delete data if consent cannot be obtained'
        ],
        metadata: { consentId: consent.id }
      });
    }

    return violations;
  }

  async getMetrics(serviceId: string): Promise<any> {
    const serviceConsents = Array.from(this.consents.values()).filter(
      consent => consent.serviceId === serviceId
    );

    const totalConsents = serviceConsents.length;
    const activeConsents = serviceConsents.filter(c => c.status === 'given').length;
    const withdrawnConsents = serviceConsents.filter(c => c.status === 'withdrawn').length;
    const expiredConsents = serviceConsents.filter(
      c => c.expiresAt && c.expiresAt < new Date()
    ).length;

    return {
      totalConsents,
      consentRate: totalConsents > 0 ? (activeConsents / totalConsents) * 100 : 0,
      withdrawalRate: totalConsents > 0 ? (withdrawnConsents / totalConsents) * 100 : 0,
      expirationRate: totalConsents > 0 ? (expiredConsents / totalConsents) * 100 : 0,
      renewalRate: 0 // TODO: Implement renewal tracking
    };
  }

  async cleanup(): Promise<void> {
    this.consents.clear();
    this.logger.info('Consent manager cleaned up');
  }
}