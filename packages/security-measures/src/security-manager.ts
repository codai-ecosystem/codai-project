import { FastifyInstance } from 'fastify';
import { SecurityConfig, SecurityEvent, SecurityEventType, SecuritySeverity, SecurityMetrics } from './types';
import { SecurityMiddleware } from './middleware';
import { VulnerabilityScanner } from './vulnerability-scanner';
import { SecurityDashboard } from './dashboard';
import cron from 'node-cron';

export class SecurityManager {
  private config: SecurityConfig;
  private middleware: SecurityMiddleware;
  private scanner: VulnerabilityScanner;
  private dashboard: SecurityDashboard;
  private securityEvents: SecurityEvent[] = [];
  private metricsHistory: SecurityMetrics[] = [];

  constructor(config: SecurityConfig) {
    this.config = config;
    this.middleware = new SecurityMiddleware(config);
    this.scanner = new VulnerabilityScanner(config.vulnerability);
    this.dashboard = new SecurityDashboard();

    this.initializeScheduledTasks();
  }

  // Initialize security for a Fastify instance
  async initializeSecurity(fastify: FastifyInstance, serviceId: string): Promise<void> {
    try {
      // Register all security middleware
      await this.middleware.registerAll(fastify);

      // Add security event hooks
      this.addSecurityHooks(fastify, serviceId);

      // Register security routes
      this.registerSecurityRoutes(fastify);

      console.log(`✅ Security initialized for service: ${serviceId}`);
    } catch (error) {
      console.error(`❌ Failed to initialize security for service ${serviceId}:`, error);
      throw error;
    }
  }

  private addSecurityHooks(fastify: FastifyInstance, serviceId: string): void {
    // Pre-request security check
    fastify.addHook('preHandler', async (request, reply) => {
      const startTime = Date.now();
      request.securityContext = {
        serviceId,
        startTime,
        clientIP: this.getClientIP(request),
        correlationId: this.generateCorrelationId()
      };
    });

    // Post-response security logging
    fastify.addHook('onResponse', async (request, reply) => {
      const endTime = Date.now();
      const responseTime = endTime - (request.securityContext?.startTime || endTime);

      // Log security metrics
      this.collectSecurityMetrics({
        serviceId,
        endpoint: request.url || '',
        method: request.method,
        statusCode: reply.statusCode,
        responseTime,
        clientIP: request.securityContext?.clientIP || 'unknown',
        timestamp: new Date()
      });
    });

    // Error handling for security events
    fastify.setErrorHandler(async (error, request, reply) => {
      this.logSecurityEvent({
        type: SecurityEventType.SUSPICIOUS_ACTIVITY,
        severity: SecuritySeverity.MEDIUM,
        source: this.getClientIP(request),
        description: `Application error: ${error.message}`,
        metadata: {
          error: error.name,
          stack: error.stack,
          url: request.url,
          method: request.method
        }
      });

      reply.code(500).send({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        statusCode: 500
      });
    });
  }

  private registerSecurityRoutes(fastify: FastifyInstance): void {
    // Security health endpoint
    fastify.get('/security/health', async (request, reply) => {
      const health = await this.getSecurityHealth();
      reply.send(health);
    });

    // Security metrics endpoint
    fastify.get('/security/metrics', async (request, reply) => {
      const metrics = this.getSecurityMetrics();
      reply.send(metrics);
    });

    // Security events endpoint (admin only)
    fastify.get('/security/events', async (request, reply) => {
      // TODO: Add admin authentication check
      const events = this.getRecentSecurityEvents();
      reply.send(events);
    });

    // Security dashboard endpoint
    fastify.get('/security/dashboard', async (request, reply) => {
      const dashboardData = await this.dashboard.generateDashboardData(this.securityEvents);
      reply.type('text/html').send(dashboardData);
    });

    // Vulnerability scan trigger endpoint
    fastify.post('/security/scan', async (request, reply) => {
      // TODO: Add admin authentication check
      const scanResult = await this.scanner.performScan();
      reply.send(scanResult);
    });
  }

  private initializeScheduledTasks(): void {
    // Vulnerability scanning
    if (this.config.vulnerability.scanning.enabled) {
      cron.schedule(this.config.vulnerability.scanning.schedule, async () => {
        try {
          console.log('🔍 Starting scheduled vulnerability scan...');
          const results = await this.scanner.performScan();
          console.log(`✅ Vulnerability scan completed: ${results.vulnerabilities.length} issues found`);
        } catch (error) {
          console.error('❌ Scheduled vulnerability scan failed:', error);
        }
      });
    }

    // Security metrics collection
    cron.schedule('*/5 * * * *', () => { // Every 5 minutes
      this.collectMetricsSnapshot();
    });

    // Security event cleanup
    cron.schedule('0 0 * * *', () => { // Daily at midnight
      this.cleanupOldEvents();
    });
  }

  private async getSecurityHealth(): Promise<{
    status: string;
    checks: Record<string, { status: string; details?: any }>;
    timestamp: string;
  }> {
    const checks: Record<string, { status: string; details?: any }> = {};

    // Check rate limiting
    checks.rateLimiting = {
      status: this.config.rateLimit.enabled ? 'enabled' : 'disabled'
    };

    // Check CORS
    checks.cors = {
      status: this.config.cors.enabled ? 'enabled' : 'disabled'
    };

    // Check security headers
    checks.securityHeaders = {
      status: this.config.headers.enabled ? 'enabled' : 'disabled'
    };

    // Check threat detection
    checks.threatDetection = {
      status: this.config.monitoring.threatDetection.enabled ? 'enabled' : 'disabled'
    };

    // Check vulnerability scanning
    checks.vulnerabilityScanning = {
      status: this.config.vulnerability.scanning.enabled ? 'enabled' : 'disabled'
    };

    const allHealthy = Object.values(checks).every(check =>
      check.status === 'enabled' || check.status === 'healthy'
    );

    return {
      status: allHealthy ? 'healthy' : 'degraded',
      checks,
      timestamp: new Date().toISOString()
    };
  }

  private getSecurityMetrics(): SecurityMetrics {
    const now = new Date();
    const last24Hours = this.securityEvents.filter(event =>
      (now.getTime() - event.timestamp.getTime()) < 86400000 // 24 hours
    );

    return {
      timestamp: now,
      service: 'security-manager',
      rateLimitHits: last24Hours.filter(e => e.type === SecurityEventType.RATE_LIMIT_EXCEEDED).length,
      blockedRequests: last24Hours.filter(e =>
        e.type === SecurityEventType.SUSPICIOUS_ACTIVITY ||
        e.type === SecurityEventType.MALICIOUS_INPUT
      ).length,
      securityEvents: this.aggregateSecurityEvents(last24Hours),
      vulnerabilities: [],
      performance: {
        averageResponseTime: this.calculateAverageResponseTime(),
        securityOverhead: this.calculateSecurityOverhead(),
        throughputImpact: this.calculateThroughputImpact()
      }
    };
  }

  private getRecentSecurityEvents(limit: number = 100): SecurityEvent[] {
    return this.securityEvents
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  private collectSecurityMetrics(data: {
    serviceId: string;
    endpoint: string;
    method: string;
    statusCode: number;
    responseTime: number;
    clientIP: string;
    timestamp: Date;
  }): void {
    // Store metrics for analysis
    // This would typically be sent to a metrics collection system
  }

  private collectMetricsSnapshot(): void {
    const metrics = this.getSecurityMetrics();
    this.metricsHistory.push(metrics);

    // Keep only last 24 hours of metrics
    const cutoff = Date.now() - 86400000;
    this.metricsHistory = this.metricsHistory.filter(m =>
      m.timestamp.getTime() > cutoff
    );
  }

  private cleanupOldEvents(): void {
    const retentionMs = this.config.monitoring.logging.retention * 24 * 60 * 60 * 1000;
    const cutoff = Date.now() - retentionMs;

    this.securityEvents = this.securityEvents.filter(event =>
      event.timestamp.getTime() > cutoff
    );
  }

  private aggregateSecurityEvents(events: SecurityEvent[]) {
    const aggregated: Record<string, { count: number; severity: SecuritySeverity }> = {};

    events.forEach(event => {
      if (!aggregated[event.type]) {
        aggregated[event.type] = { count: 0, severity: event.severity };
      }
      aggregated[event.type].count++;
    });

    return Object.entries(aggregated).map(([type, data]) => ({
      type: type as SecurityEventType,
      count: data.count,
      severity: data.severity
    }));
  }

  private calculateAverageResponseTime(): number {
    // This would calculate based on collected metrics
    return 50; // Placeholder
  }

  private calculateSecurityOverhead(): number {
    // This would calculate the performance impact of security measures
    return 5; // Placeholder: 5ms overhead
  }

  private calculateThroughputImpact(): number {
    // This would calculate the throughput impact as a percentage
    return 2; // Placeholder: 2% impact
  }

  private logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp' | 'correlationId'>): void {
    const securityEvent: SecurityEvent = {
      id: this.generateEventId(),
      timestamp: new Date(),
      correlationId: this.generateCorrelationId(),
      ...event
    };

    this.securityEvents.push(securityEvent);
    console.log(`🚨 Security Event [${securityEvent.severity}]: ${securityEvent.description}`);
  }

  private getClientIP(request: any): string {
    return request.headers['x-forwarded-for']?.split(',')[0] ||
      request.headers['x-real-ip'] ||
      request.ip ||
      'unknown';
  }

  private generateEventId(): string {
    return `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public methods for external use
  public async performVulnerabilityScan(): Promise<any> {
    return await this.scanner.performScan();
  }

  public getSecurityStatus(): {
    enabled: boolean;
    features: string[];
    lastScan?: Date;
  } {
    return {
      enabled: true,
      features: [
        this.config.rateLimit.enabled ? 'Rate Limiting' : null,
        this.config.cors.enabled ? 'CORS Protection' : null,
        this.config.headers.enabled ? 'Security Headers' : null,
        this.config.validation.enabled ? 'Input Validation' : null,
        this.config.monitoring.enabled ? 'Threat Detection' : null,
        this.config.vulnerability.scanning.enabled ? 'Vulnerability Scanning' : null
      ].filter(Boolean) as string[]
    };
  }

  public async cleanup(): Promise<void> {
    await this.middleware.cleanup();
  }
}

// Extend Fastify request interface
declare module 'fastify' {
  interface FastifyRequest {
    securityContext?: {
      serviceId: string;
      startTime: number;
      clientIP: string;
      correlationId: string;
    };
  }
}