/**
 * Audit Trail Manager
 * Handles GDPR audit trail logging, storage, and compliance tracking
 */

import { v4 as uuidv4 } from 'uuid';
import { GdprComplianceConfig, AuditEvent, ComplianceViolation } from './types';
import { GdprLogger } from './logger';

export class AuditTrailManager {
  private config: GdprComplianceConfig;
  private logger: GdprLogger;
  private auditEvents: Map<string, AuditEvent> = new Map();

  constructor(config: GdprComplianceConfig, logger: GdprLogger) {
    this.config = config;
    this.logger = logger;
  }

  async initialize(serviceId: string): Promise<void> {
    this.logger.info('Initializing audit trail manager', { serviceId });
  }

  async logEvent(event: AuditEvent): Promise<void> {
    this.auditEvents.set(event.id, event);

    this.logger.audit('Audit event logged', {
      auditEventId: event.id,
      eventType: event.eventType,
      dataSubjectId: event.dataSubjectId,
      serviceId: event.serviceId,
      action: event.action,
      success: event.success
    });
  }

  async getDataSubjectAuditTrail(dataSubjectId: string): Promise<AuditEvent[]> {
    return Array.from(this.auditEvents.values())
      .filter(event => event.dataSubjectId === dataSubjectId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getAuditCompliance(serviceId: string): Promise<{ status: any; score: number }> {
    const serviceEvents = Array.from(this.auditEvents.values())
      .filter(event => event.serviceId === serviceId);

    // Simple compliance check based on audit coverage
    const score = serviceEvents.length > 0 ? 95 : 70; // Assume good coverage if events exist

    return {
      status: score >= 80 ? 'compliant' : score >= 60 ? 'pending_review' : 'non_compliant',
      score
    };
  }

  async detectViolations(serviceId: string): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = [];

    // Check for gaps in audit logging
    const serviceEvents = Array.from(this.auditEvents.values())
      .filter(event => event.serviceId === serviceId);

    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentEvents = serviceEvents.filter(event => event.timestamp >= lastWeek);

    if (recentEvents.length === 0 && serviceEvents.length > 0) {
      violations.push({
        id: uuidv4(),
        violationType: 'audit_gap',
        severity: 'medium',
        description: 'No audit events recorded in the last week',
        serviceId,
        detectedAt: new Date(),
        status: 'open',
        evidence: [],
        impactAssessment: 'Potential gap in audit trail coverage',
        remediationSteps: [
          'Verify audit logging is functioning properly',
          'Check for system issues affecting audit trail',
          'Ensure all data processing activities are being logged'
        ],
        metadata: { lastEventDate: serviceEvents[serviceEvents.length - 1]?.timestamp }
      });
    }

    return violations;
  }

  async getMetrics(serviceId: string): Promise<any> {
    const serviceEvents = Array.from(this.auditEvents.values())
      .filter(event => event.serviceId === serviceId);

    const totalEvents = serviceEvents.length;
    const successfulEvents = serviceEvents.filter(e => e.success).length;
    const failedEvents = totalEvents - successfulEvents;

    const eventsByType = serviceEvents.reduce((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalEvents,
      successfulEvents,
      failedEvents,
      successRate: totalEvents > 0 ? (successfulEvents / totalEvents) * 100 : 100,
      eventsByType,
      lastEventDate: serviceEvents.length > 0
        ? Math.max(...serviceEvents.map(e => e.timestamp.getTime()))
        : null
    };
  }

  async cleanup(): Promise<void> {
    // In production, this would archive old audit events according to retention policy
    this.logger.info('Audit trail manager cleaned up');
  }
}