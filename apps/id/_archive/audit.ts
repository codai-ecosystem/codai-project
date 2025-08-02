// CODAI ID - Audit Logging Service
// Comprehensive audit logging for compliance and security

import { PrismaClient } from '@prisma/client';

interface AuditLogData {
  userId?: string;
  action: string;
  resource?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  details?: Record<string, any>;
  outcome: 'success' | 'failure' | 'error' | 'blocked' | 'pending';
}

class AuditLogger {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Log an audit event
   */
  async log(data: AuditLogData): Promise<string> {
    try {
      const auditLog = await this.prisma.auditLog.create({
        data: {
          userId: data.userId || null,
          action: data.action,
          resource: data.resource || null,
          resourceId: data.resourceId || null,
          ipAddress: data.ipAddress || null,
          userAgent: data.userAgent || null,
          location: data.location || null,
          details: data.details || null,
          outcome: data.outcome,
          timestamp: new Date(),
        }
      });

      // For critical events, also log to external systems
      if (this.isCriticalEvent(data.action)) {
        await this.logToExternalSystems(auditLog);
      }

      return auditLog.id;
    } catch (error) {
      console.error('Failed to log audit event:', error);
      throw error;
    }
  }

  /**
   * Log authentication events
   */
  async logAuth(action: string, data: Partial<AuditLogData>): Promise<string> {
    return this.log({
      ...data,
      action,
      resource: 'authentication',
    });
  }

  /**
   * Log user management events
   */
  async logUserManagement(action: string, userId: string, data: Partial<AuditLogData>): Promise<string> {
    return this.log({
      ...data,
      userId,
      action,
      resource: 'user',
      resourceId: userId,
    });
  }

  /**
   * Log permission changes
   */
  async logPermissionChange(action: string, userId: string, data: Partial<AuditLogData>): Promise<string> {
    return this.log({
      ...data,
      userId,
      action,
      resource: 'permission',
    });
  }

  /**
   * Log system events
   */
  async logSystem(action: string, data: Partial<AuditLogData>): Promise<string> {
    return this.log({
      ...data,
      action,
      resource: 'system',
    });
  }

  /**
   * Get audit logs with filters
   */
  async getLogs(filters: {
    userId?: string;
    action?: string;
    resource?: string;
    outcome?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    return this.prisma.auditLog.findMany({
      where: {
        userId: filters.userId,
        action: filters.action,
        resource: filters.resource,
        outcome: filters.outcome,
        timestamp: {
          gte: filters.startDate,
          lte: filters.endDate,
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: filters.limit || 100,
      skip: filters.offset || 0,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
          }
        }
      }
    });
  }

  /**
   * Generate audit report for compliance
   */
  async generateComplianceReport(startDate: Date, endDate: Date) {
    const summary = await this.prisma.auditLog.groupBy({
      by: ['action', 'outcome'],
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        id: true,
      },
    });

    const criticalEvents = await this.prisma.auditLog.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
        action: {
          in: [
            'login_failed',
            'account_locked',
            'permission_granted',
            'permission_revoked',
            'user_deleted',
            'security_incident',
          ],
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    return {
      summary,
      criticalEvents,
      totalEvents: summary.reduce((sum, item) => sum + item._count.id, 0),
      dateRange: { startDate, endDate },
      generatedAt: new Date(),
    };
  }

  /**
   * Check if an action is considered critical
   */
  private isCriticalEvent(action: string): boolean {
    const criticalActions = [
      'login_failed',
      'account_locked',
      'permission_granted',
      'permission_revoked',
      'user_deleted',
      'mfa_disabled',
      'password_changed',
      'security_incident',
    ];
    return criticalActions.includes(action);
  }

  /**
   * Log to external systems for critical events
   */
  private async logToExternalSystems(auditLog: any): Promise<void> {
    try {
      // Log to Elasticsearch if configured
      if (process.env.ELASTICSEARCH_URL) {
        await this.logToElasticsearch(auditLog);
      }

      // Send alerts for security incidents
      if (auditLog.action.includes('security') || auditLog.outcome === 'blocked') {
        await this.sendSecurityAlert(auditLog);
      }
    } catch (error) {
      console.error('Failed to log to external systems:', error);
      // Don't throw - external logging failures shouldn't break the main flow
    }
  }

  /**
   * Log to Elasticsearch for analysis
   */
  private async logToElasticsearch(auditLog: any): Promise<void> {
    // Implementation would depend on Elasticsearch client
    // This is a placeholder for the actual implementation
    console.log('Would log to Elasticsearch:', auditLog.id);
  }

  /**
   * Send security alerts
   */
  private async sendSecurityAlert(auditLog: any): Promise<void> {
    // Implementation would depend on alerting system (email, Slack, etc.)
    // This is a placeholder for the actual implementation
    console.log('Would send security alert:', auditLog.id);
  }
}

// Export singleton instance
import { prisma } from './prisma';
export const auditLogger = new AuditLogger(prisma);

export type { AuditLogData };
