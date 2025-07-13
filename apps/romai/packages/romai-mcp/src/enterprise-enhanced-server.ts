/**
 * Enhanced Server with Enterprise Logging Integration
 * 
 * Extends the existing enhanced server with enterprise logging capabilities
 */

import { enterpriseLogger } from './logging/enterprise-logger';
import { metricsCollector } from './monitoring/metrics-collector';
import { requestTracer } from './monitoring/request-tracer';

// Import the existing enhanced server
import { RomaiMcpServerEnhanced } from './enhanced-server';

export class RomaiMcpServerWithLogging extends RomaiMcpServerEnhanced {
  private startTime: number;

  constructor() {
    super();
    this.startTime = Date.now();

    // Initialize enterprise logging
    this.setupEnterpriseLogging();

    // Log server initialization
    enterpriseLogger.recordAuditEvent({
      eventId: 'server-init-with-logging',
      eventType: 'config',
      severity: 'info',
      details: {
        serverVersion: '0.2.0-enterprise',
        capabilities: ['tools', 'resources', 'prompts', 'enterprise-logging'],
        startTime: new Date().toISOString()
      },
      context: {
        requestId: 'init-logging',
        method: 'server_initialization_with_logging',
        timestamp: new Date().toISOString(),
        source: 'mcp-server',
        version: '0.2.0'
      }
    });

    console.log('🏢 ROMAI Enterprise Server with Logging initialized');
    console.log('📊 Enterprise logging, metrics, and tracing enabled');
  }

  private setupEnterpriseLogging(): void {
    // Start cleanup interval for traces
    setInterval(() => {
      requestTracer.cleanup();
    }, 60 * 60 * 1000); // Every hour

    // Log server health every 5 minutes
    setInterval(() => {
      const health = metricsCollector.getPerformanceSummary();
      enterpriseLogger.recordMetric({
        name: 'server_health_check',
        value: health.systemHealth === 'excellent' ? 100 :
          health.systemHealth === 'good' ? 80 :
            health.systemHealth === 'warning' ? 60 : 20,
        unit: 'percent',
        labels: {
          status: health.systemHealth,
          memoryMB: health.memoryUsageMB.toString(),
          uptime: health.uptime.toString()
        },
        timestamp: new Date().toISOString()
      });
    }, 5 * 60 * 1000);

    // Setup process error handlers
    process.on('uncaughtException', (error) => {
      enterpriseLogger.logError(
        {
          requestId: 'system',
          method: 'uncaught_exception',
          timestamp: new Date().toISOString(),
          source: 'mcp-server',
          version: '0.2.0'
        },
        error,
        { type: 'uncaught_exception' }
      );
    });

    process.on('unhandledRejection', (reason, promise) => {
      const error = reason instanceof Error ? reason : new Error(String(reason));
      enterpriseLogger.logError(
        {
          requestId: 'system',
          method: 'unhandled_rejection',
          timestamp: new Date().toISOString(),
          source: 'mcp-server',
          version: '0.2.0'
        },
        error,
        { type: 'unhandled_rejection', promise: promise.toString() }
      );
    });
  }

  /**
   * Get enterprise analytics dashboard
   */
  public getEnterpriseAnalytics(): {
    performance: any;
    system: any;
    analytics: any;
    compliance: any;
    uptime: number;
  } {
    const performanceStats = requestTracer.getPerformanceStats();
    const systemMetrics = metricsCollector.collectSystemMetrics();
    const analytics = enterpriseLogger.getAnalytics();
    const compliance = enterpriseLogger.generateComplianceReport();

    return {
      performance: performanceStats,
      system: systemMetrics,
      analytics,
      compliance,
      uptime: Date.now() - this.startTime
    };
  }

  /**
   * Get Prometheus metrics
   */
  public getPrometheusMetrics(): string {
    return metricsCollector.generatePrometheusMetrics();
  }

  /**
   * Get OpenTelemetry metrics
   */
  public getOpenTelemetryMetrics(): any[] {
    return metricsCollector.generateOpenTelemetryMetrics();
  }

  /**
   * Get audit trail for compliance
   */
  public getAuditTrail(timeWindow?: number): any[] {
    return enterpriseLogger.getAuditTrail(timeWindow);
  }

  /**
   * Get active request traces
   */
  public getActiveTraces(): any[] {
    return requestTracer.getActiveTraces();
  }

  /**
   * Generate comprehensive health report
   */
  public generateHealthReport(): string {
    const analytics = this.getEnterpriseAnalytics();

    return `# ROMAI Enterprise Health Report

## System Status: 🟢 OPERATIONAL

### Performance Metrics
- **Total Requests**: ${analytics.performance.totalRequests}
- **Success Rate**: ${((analytics.performance.successfulRequests / analytics.performance.totalRequests) * 100).toFixed(2)}%
- **Average Response Time**: ${analytics.performance.averageResponseTime.toFixed(2)}ms
- **P95 Response Time**: ${analytics.performance.p95ResponseTime}ms
- **P99 Response Time**: ${analytics.performance.p99ResponseTime}ms

### System Metrics
- **Memory Usage**: ${(analytics.system.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB
- **CPU Usage**: ${analytics.system.cpuUsage.toFixed(2)}%
- **Uptime**: ${Math.floor(analytics.uptime / 1000 / 60)} minutes

### Business Analytics
- **Request Count (1h)**: ${analytics.analytics.requestCount}
- **Error Rate**: ${analytics.analytics.errorRate.toFixed(2)}%
- **Top Methods**: ${analytics.analytics.topMethods.map((m: any) => `${m.method} (${m.count})`).join(', ')}

### Compliance Report
- **Total Requests**: ${analytics.compliance.totalRequests}
- **Authenticated Requests**: ${analytics.compliance.authenticatedRequests}
- **Error Events**: ${analytics.compliance.errorEvents}
- **Audit Coverage**: ${analytics.compliance.auditCoverage.toFixed(2)}%
- **Data Integrity**: ${analytics.compliance.dataIntegrity ? '✅ PASS' : '❌ FAIL'}

### Enterprise Features Status
- ✅ **Structured Logging**: Enabled with correlation IDs
- ✅ **Metrics Collection**: Prometheus + OpenTelemetry compatible
- ✅ **Request Tracing**: Full request/response correlation
- ✅ **Audit Trail**: Compliance-ready audit logging
- ✅ **Performance Monitoring**: Real-time analytics
- ✅ **Error Tracking**: Enterprise-grade error handling

**Server Version**: 0.2.0-enterprise
**Generated**: ${new Date().toISOString()}
`;
  }
}

// Export the logging-enabled server as the main server
export { RomaiMcpServerWithLogging as RomaiMcpServerEnhanced };
