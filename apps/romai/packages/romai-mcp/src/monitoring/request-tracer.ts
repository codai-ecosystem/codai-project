/**
 * ROMAI Request Tracing Middleware
 * 
 * Enterprise-grade request tracing and performance monitoring for MCP operations.
 * Provides detailed request/response correlation, timing analytics, and debugging support.
 */

import { enterpriseLogger, LogContext } from '../logging/enterprise-logger';
import { metricsCollector } from './metrics-collector';

export interface RequestTrace {
  requestId: string;
  method: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'pending' | 'completed' | 'failed';
  userId?: string;
  organizationId?: string;
  metadata: Record<string, any>;
}

export class RequestTracer {
  private static instance: RequestTracer;
  private activeTraces: Map<string, RequestTrace> = new Map();
  private completedTraces: RequestTrace[] = [];

  private constructor() { }

  public static getInstance(): RequestTracer {
    if (!RequestTracer.instance) {
      RequestTracer.instance = new RequestTracer();
    }
    return RequestTracer.instance;
  }

  /**
   * Start tracing a new request
   */
  public startTrace(
    method: string,
    params: any,
    userId?: string,
    organizationId?: string
  ): LogContext {
    const context = enterpriseLogger.createRequestContext(method, userId, organizationId);

    const trace: RequestTrace = {
      requestId: context.requestId,
      method,
      startTime: Date.now(),
      status: 'pending',
      userId,
      organizationId,
      metadata: {
        params: this.sanitizeForTrace(params),
        userAgent: 'Claude Desktop MCP',
        serverVersion: '0.2.0'
      }
    };

    this.activeTraces.set(context.requestId, trace);

    // Log request start
    enterpriseLogger.logRequest(context, params);

    // Track metrics
    metricsCollector.trackRequest();

    return context;
  }

  /**
   * Complete a request trace with success
   */
  public completeTrace(requestId: string, result: any): void {
    const trace = this.activeTraces.get(requestId);
    if (!trace) return;

    const endTime = Date.now();
    const duration = endTime - trace.startTime;

    trace.endTime = endTime;
    trace.duration = duration;
    trace.status = 'completed';
    trace.metadata.result = this.sanitizeForTrace(result);

    // Move to completed traces
    this.activeTraces.delete(requestId);
    this.completedTraces.push(trace);

    // Keep only last 1000 completed traces
    if (this.completedTraces.length > 1000) {
      this.completedTraces = this.completedTraces.slice(-1000);
    }

    // Log response
    const context = this.createContextFromTrace(trace);
    enterpriseLogger.logResponse(context, result, duration);
  }

  /**
   * Fail a request trace with error
   */
  public failTrace(requestId: string, error: Error, details?: Record<string, any>): void {
    const trace = this.activeTraces.get(requestId);
    if (!trace) return;

    const endTime = Date.now();
    const duration = endTime - trace.startTime;

    trace.endTime = endTime;
    trace.duration = duration;
    trace.status = 'failed';
    trace.metadata.error = {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
    trace.metadata.errorDetails = details;

    // Move to completed traces
    this.activeTraces.delete(requestId);
    this.completedTraces.push(trace);

    // Keep only last 1000 completed traces
    if (this.completedTraces.length > 1000) {
      this.completedTraces = this.completedTraces.slice(-1000);
    }

    // Log error
    const context = this.createContextFromTrace(trace);
    enterpriseLogger.logError(context, error, details);

    // Track error metrics
    metricsCollector.trackError();
  }

  /**
   * Get active traces for monitoring
   */
  public getActiveTraces(): RequestTrace[] {
    return Array.from(this.activeTraces.values());
  }

  /**
   * Get completed traces for analysis
   */
  public getCompletedTraces(limit: number = 100): RequestTrace[] {
    return this.completedTraces.slice(-limit);
  }

  /**
   * Get performance statistics
   */
  public getPerformanceStats(timeWindow: number = 3600000): {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    requestsPerMinute: number;
    topSlowMethods: Array<{ method: string; averageTime: number; count: number }>;
  } {
    const cutoff = Date.now() - timeWindow;
    const recentTraces = this.completedTraces.filter(t => (t.endTime || 0) > cutoff);

    const successfulRequests = recentTraces.filter(t => t.status === 'completed').length;
    const failedRequests = recentTraces.filter(t => t.status === 'failed').length;
    const totalRequests = recentTraces.length;

    // Calculate response time percentiles
    const durations = recentTraces
      .filter(t => t.duration !== undefined)
      .map(t => t.duration!)
      .sort((a, b) => a - b);

    const averageResponseTime = durations.length > 0
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length
      : 0;

    const p95Index = Math.floor(durations.length * 0.95);
    const p99Index = Math.floor(durations.length * 0.99);
    const p95ResponseTime = durations[p95Index] || 0;
    const p99ResponseTime = durations[p99Index] || 0;

    const requestsPerMinute = (totalRequests / (timeWindow / 1000)) * 60;

    // Calculate slow methods
    const methodStats: Record<string, { totalTime: number; count: number }> = {};
    recentTraces.forEach(trace => {
      if (trace.duration) {
        if (!methodStats[trace.method]) {
          methodStats[trace.method] = { totalTime: 0, count: 0 };
        }
        methodStats[trace.method].totalTime += trace.duration;
        methodStats[trace.method].count += 1;
      }
    });

    const topSlowMethods = Object.entries(methodStats)
      .map(([method, stats]) => ({
        method,
        averageTime: stats.totalTime / stats.count,
        count: stats.count
      }))
      .sort((a, b) => b.averageTime - a.averageTime)
      .slice(0, 5);

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime,
      p95ResponseTime,
      p99ResponseTime,
      requestsPerMinute,
      topSlowMethods
    };
  }

  /**
   * Get detailed trace by request ID
   */
  public getTraceById(requestId: string): RequestTrace | undefined {
    return this.activeTraces.get(requestId) ||
      this.completedTraces.find(t => t.requestId === requestId);
  }

  /**
   * Clean up old traces to prevent memory leaks
   */
  public cleanup(): void {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours

    // Clean up old completed traces
    this.completedTraces = this.completedTraces.filter(t => (t.endTime || 0) > cutoff);

    // Clean up stale active traces (older than 1 hour)
    const staleCutoff = Date.now() - (60 * 60 * 1000);
    for (const [requestId, trace] of this.activeTraces.entries()) {
      if (trace.startTime < staleCutoff) {
        trace.status = 'failed';
        trace.endTime = Date.now();
        trace.duration = trace.endTime - trace.startTime;
        trace.metadata.error = { message: 'Request timeout - cleaned up by system' };

        this.completedTraces.push(trace);
        this.activeTraces.delete(requestId);
      }
    }
  }

  /**
   * Create log context from trace
   */
  private createContextFromTrace(trace: RequestTrace): LogContext {
    return {
      requestId: trace.requestId,
      userId: trace.userId,
      organizationId: trace.organizationId,
      method: trace.method,
      timestamp: new Date(trace.startTime).toISOString(),
      source: 'mcp-server',
      version: '0.2.0'
    };
  }

  /**
   * Sanitize data for tracing (remove sensitive info)
   */
  private sanitizeForTrace(data: any): any {
    if (!data || typeof data !== 'object') return data;

    const sanitized = { ...data };
    const sensitiveFields = ['password', 'token', 'key', 'secret', 'apiKey'];

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    // Truncate large objects
    const dataStr = JSON.stringify(sanitized);
    if (dataStr.length > 500) {
      return {
        _truncated: true,
        _size: dataStr.length,
        preview: JSON.parse(dataStr.substring(0, 200) + '}')
      };
    }

    return sanitized;
  }
}

/**
 * Export singleton instance
 */
export const requestTracer = RequestTracer.getInstance();
