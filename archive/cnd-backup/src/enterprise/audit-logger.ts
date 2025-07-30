// Enterprise Audit Logger
import { EventEmitter } from 'events';
import { AuditLog, CNDConfig, AuthenticationContext } from '../types.js';

export class AuditLogger extends EventEmitter {
  private config: CNDConfig['security'];
  private auditLogs: AuditLog[] = [];
  private maxMemoryLogs = 10000;

  constructor(config: CNDConfig['security']) {
    super();
    this.config = config;
  }

  /**
   * Log an audit event
   */
  async log(
    operation: string,
    resource: string,
    context: AuthenticationContext,
    details: Record<string, any> = {},
    result: 'success' | 'failure' | 'partial' = 'success',
    duration: number = 0
  ): Promise<void> {
    if (!this.config?.audit?.enabled) {
      return;
    }

    const auditLog: AuditLog = {
      id: this.generateLogId(),
      timestamp: new Date(),
      userId: context.userId,
      sessionId: context.sessionId,
      operation,
      resource,
      details,
      result,
      duration,
      metadata: {
        userAgent: details.userAgent,
        ipAddress: details.ipAddress,
        tenant: context.tenant,
        roles: context.roles,
        permissions: context.permissions
      }
    };

    try {
      await this.storeAuditLog(auditLog);
      this.emit('auditLogged', auditLog);

      // Keep in memory for quick access
      this.auditLogs.push(auditLog);
      if (this.auditLogs.length > this.maxMemoryLogs) {
        this.auditLogs.shift();
      }
    } catch (error) {
      console.error('Failed to store audit log:', error);
      this.emit('auditError', error);
    }
  }

  /**
   * Log database operation
   */
  async logDatabaseOperation(
    operation: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE',
    table: string,
    recordId: string | number,
    context: AuthenticationContext,
    changes?: Record<string, any>,
    duration?: number
  ): Promise<void> {
    await this.log(
      `DB_${operation}`,
      `${table}/${recordId}`,
      context,
      {
        table,
        recordId,
        changes,
        operation: operation.toLowerCase()
      },
      'success',
      duration
    );
  }

  /**
   * Log API operation
   */
  async logAPIOperation(
    method: string,
    endpoint: string,
    context: AuthenticationContext,
    requestBody?: any,
    responseStatus?: number,
    duration?: number
  ): Promise<void> {
    const result = responseStatus && responseStatus >= 200 && responseStatus < 300
      ? 'success'
      : responseStatus && responseStatus >= 400
        ? 'failure'
        : 'partial';

    await this.log(
      `API_${method}`,
      endpoint,
      context,
      {
        method,
        endpoint,
        requestBody: this.sanitizeRequestBody(requestBody),
        responseStatus
      },
      result,
      duration
    );
  }

  /**
   * Log authentication event
   */
  async logAuthentication(
    event: 'LOGIN' | 'LOGOUT' | 'TOKEN_REFRESH' | 'ACCESS_DENIED',
    userId: string,
    details: Record<string, any> = {},
    result: 'success' | 'failure' = 'success'
  ): Promise<void> {
    const mockContext: AuthenticationContext = {
      userId,
      sessionId: details.sessionId || 'unknown',
      permissions: [],
      roles: [],
      expiresAt: new Date(),
      metadata: {}
    };

    await this.log(
      `AUTH_${event}`,
      'authentication',
      mockContext,
      {
        event,
        ...details
      },
      result
    );
  }

  /**
   * Get audit logs for a user
   */
  async getUserAuditLogs(
    userId: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 100
  ): Promise<AuditLog[]> {
    let logs = this.auditLogs.filter(log => log.userId === userId);

    if (startDate) {
      logs = logs.filter(log => log.timestamp >= startDate);
    }

    if (endDate) {
      logs = logs.filter(log => log.timestamp <= endDate);
    }

    return logs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get audit logs for a resource
   */
  async getResourceAuditLogs(
    resource: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 100
  ): Promise<AuditLog[]> {
    let logs = this.auditLogs.filter(log => log.resource === resource);

    if (startDate) {
      logs = logs.filter(log => log.timestamp >= startDate);
    }

    if (endDate) {
      logs = logs.filter(log => log.timestamp <= endDate);
    }

    return logs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get audit statistics
   */
  async getAuditStats(startDate?: Date, endDate?: Date): Promise<{
    totalEvents: number;
    uniqueUsers: number;
    operations: Record<string, number>;
    results: Record<string, number>;
    avgDuration: number;
  }> {
    let logs = this.auditLogs;

    if (startDate) {
      logs = logs.filter(log => log.timestamp >= startDate);
    }

    if (endDate) {
      logs = logs.filter(log => log.timestamp <= endDate);
    }

    const uniqueUsers = new Set(logs.map(log => log.userId)).size;
    const operations: Record<string, number> = {};
    const results: Record<string, number> = {};
    let totalDuration = 0;

    for (const log of logs) {
      operations[log.operation] = (operations[log.operation] || 0) + 1;
      results[log.result] = (results[log.result] || 0) + 1;
      totalDuration += log.duration;
    }

    return {
      totalEvents: logs.length,
      uniqueUsers,
      operations,
      results,
      avgDuration: logs.length > 0 ? totalDuration / logs.length : 0
    };
  }

  /**
   * Cleanup old audit logs
   */
  async cleanupOldLogs(): Promise<void> {
    if (!this.config?.audit?.retention) {
      return;
    }

    const retentionDate = new Date();
    retentionDate.setDate(retentionDate.getDate() - this.config.audit.retention);

    this.auditLogs = this.auditLogs.filter(log => log.timestamp >= retentionDate);

    // In a real implementation, this would also clean up persisted logs
    console.log(`Cleaned up audit logs older than ${retentionDate.toISOString()}`);
  }

  private async storeAuditLog(auditLog: AuditLog): Promise<void> {
    // In a real implementation, this would store to the configured storage
    switch (this.config?.audit?.storage) {
      case 'database':
        // Store in CBD database
        break;
      case 'file':
        // Store in log files
        break;
      case 'external':
        // Send to external audit system
        break;
      default:
        // Just keep in memory for now
        break;
    }
  }

  private generateLogId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sanitizeRequestBody(body: any): any {
    if (!body) return body;

    // Remove sensitive fields
    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}
