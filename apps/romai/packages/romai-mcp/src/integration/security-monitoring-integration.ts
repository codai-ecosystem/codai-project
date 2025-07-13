/**
 * Enterprise Security & Monitoring Integration
 * Integration layer for security and monitoring managers
 */

import { EnterpriseSecurityManager, SecurityConfig, SecurityEvent, AuthenticatedUser } from '../security/enterprise-security-manager';
import { EnterpriseMonitoringManager } from '../monitoring/enterprise-monitoring-manager';
import { performance } from 'perf_hooks';

// Express-like interfaces for framework independence
interface Request {
  ip?: string;
  connection: { remoteAddress?: string };
  headers: { [key: string]: string | string[] | undefined };
  method: string;
  path: string;
  get(name: string): string | undefined;
}

interface Response {
  status(code: number): Response;
  json(data: any): Response;
  send(data: any): Response;
  statusCode: number;
}

interface NextFunction {
  (): void;
}

export interface SecurityMonitoringConfig {
  security: SecurityConfig;
  monitoring: {
    enableMetrics: boolean;
    enableTracing: boolean;
    enableHealthChecks: boolean;
    enableAlerting: boolean;
  };
}

export class EnterpriseSecurityMonitoringIntegration {
  private securityManager: EnterpriseSecurityManager;
  private monitoringManager: EnterpriseMonitoringManager;
  private config: SecurityMonitoringConfig;

  constructor(config: SecurityMonitoringConfig) {
    this.config = config;
    this.securityManager = new EnterpriseSecurityManager(config.security);
    this.monitoringManager = new EnterpriseMonitoringManager();

    this.setupIntegration();
  }

  /**
   * Setup integration between security and monitoring
   */
  private setupIntegration(): void {
    // Setup health checks
    if (this.config.monitoring.enableHealthChecks) {
      this.setupHealthChecks();
    }
  }

  /**
   * Express middleware for comprehensive security and monitoring
   */
  public createSecurityMiddleware() {
    return [
      // Security headers
      this.securityManager.getSecurityHeaders(),

      // Rate limiting
      this.securityManager.createRateLimiter(),

      // IP blocking check
      this.createIPBlockingMiddleware(),

      // Request monitoring
      this.createRequestMonitoringMiddleware(),

      // Authentication middleware
      this.createAuthenticationMiddleware()
    ];
  }

  private createIPBlockingMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';

      if (this.securityManager.isIPBlocked(clientIP)) {
        this.monitoringManager.recordMetric('blocked_ip_requests', 1, { ip: clientIP });

        return res.status(403).json({
          error: 'Access denied',
          message: 'Your IP address has been blocked due to suspicious activity'
        });
      }

      next();
    };
  }

  private createRequestMonitoringMiddleware() {
    const self = this;

    return (req: Request, res: Response, next: NextFunction) => {
      if (!this.config.monitoring.enableMetrics) {
        return next();
      }

      const startTime = performance.now();
      const trace = this.monitoringManager.createTrace('http_request');
      const span = trace.span(`${req.method} ${req.path}`);

      // Store trace info in request
      (req as any).trace = trace;
      (req as any).span = span;

      // Monitor response
      const originalSend = res.send;
      res.send = function (data: any) {
        const responseTime = performance.now() - startTime;
        const isError = res.statusCode >= 400;

        // Record metrics
        self.monitoringManager.recordRequest(responseTime, isError);
        self.monitoringManager.recordMetric('http_requests', 1, {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode.toString(),
          userAgent: req.get('User-Agent') || 'unknown'
        });

        // End span
        span.end();

        return originalSend.call(this, data);
      };

      next();
    };
  }

  private createAuthenticationMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const authHeader = req.headers.authorization;

      if (!authHeader || (typeof authHeader !== 'string') || !authHeader.startsWith('Bearer ')) {
        // Allow unauthenticated requests to continue
        // Individual routes can enforce authentication as needed
        return next();
      }

      const token = authHeader.substring(7);
      const user = this.securityManager.verifyToken(token);

      if (user) {
        (req as any).user = user;
        this.monitoringManager.recordMetric('authenticated_requests', 1, {
          userId: user.id,
          username: user.username
        });
      } else {
        this.monitoringManager.recordMetric('invalid_token_requests', 1);
      }

      next();
    };
  }

  /**
   * Route protection with permissions
   */
  public requireAuth(permissions: string[] = []) {
    return (req: Request, res: Response, next: NextFunction) => {
      const user = (req as any).user as AuthenticatedUser;

      if (!user) {
        this.monitoringManager.recordMetric('unauthorized_access_attempts', 1, {
          path: req.path,
          ip: req.ip || 'unknown'
        });

        return res.status(401).json({
          error: 'Authentication required',
          message: 'Please provide a valid authentication token'
        });
      }

      if (permissions.length > 0) {
        const hasPermission = permissions.every(permission =>
          this.securityManager.hasPermission(user, permission)
        );

        if (!hasPermission) {
          this.monitoringManager.recordMetric('insufficient_permissions', 1, {
            userId: user.id,
            requiredPermissions: permissions.join(','),
            path: req.path
          });

          return res.status(403).json({
            error: 'Insufficient permissions',
            message: 'You do not have the required permissions to access this resource'
          });
        }
      }

      next();
    };
  }

  /**
   * Security and monitoring endpoints
   */
  public getSecurityEndpoints() {
    return {
      // Security status
      '/security/status': (req: Request, res: Response) => {
        const healthCheck = this.securityManager.performSecurityHealthCheck();
        const metrics = this.securityManager.getSecurityMetrics();

        res.json({
          health: healthCheck,
          metrics,
          timestamp: new Date().toISOString()
        });
      },

      // Monitoring dashboard
      '/monitoring/dashboard': (req: Request, res: Response) => {
        const dashboardData = this.monitoringManager.getDashboardData();
        res.json(dashboardData);
      },

      // Health check endpoint
      '/health': (req: Request, res: Response) => {
        const healthStatus = this.monitoringManager.getHealthStatus();
        const statusCode = healthStatus.overall === 'HEALTHY' ? 200 :
          healthStatus.overall === 'WARNING' ? 200 : 503;

        res.status(statusCode).json({
          status: healthStatus.overall,
          timestamp: new Date().toISOString(),
          checks: healthStatus.checks,
          summary: healthStatus.summary
        });
      },

      // Performance metrics
      '/metrics': (req: Request, res: Response) => {
        const metrics = this.monitoringManager.getPerformanceMetrics();
        res.json({
          metrics,
          timestamp: new Date().toISOString()
        });
      },

      // Active alerts
      '/alerts': (req: Request, res: Response) => {
        const alerts = this.monitoringManager.getActiveAlerts();
        res.json({
          alerts,
          count: alerts.length,
          timestamp: new Date().toISOString()
        });
      }
    };
  }

  /**
   * Setup comprehensive health checks
   */
  private setupHealthChecks(): void {
    // Security health check
    this.monitoringManager.registerHealthCheck('security', async () => {
      const securityHealth = this.securityManager.performSecurityHealthCheck();

      return {
        status: securityHealth.status,
        message: `Security status: ${securityHealth.status}`,
        details: {
          checks: securityHealth.checks,
          recommendations: securityHealth.recommendations
        }
      };
    });

    // Authentication service health check
    this.monitoringManager.registerHealthCheck('authentication', async () => {
      try {
        // Test token generation and verification
        const testUser: AuthenticatedUser = {
          id: 'health-check',
          username: 'health-check',
          email: 'health@check.com',
          roles: [],
          permissions: [],
          lastLogin: new Date(),
          isActive: true
        };

        const token = this.securityManager.generateToken(testUser);
        const verified = this.securityManager.verifyToken(token);

        if (verified && verified.id === 'health-check') {
          return { status: 'HEALTHY', message: 'Authentication service operational' };
        } else {
          return { status: 'CRITICAL', message: 'Authentication service not working properly' };
        }
      } catch (error) {
        return {
          status: 'CRITICAL',
          message: 'Authentication service error',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        };
      }
    });

    // Rate limiting health check
    this.monitoringManager.registerHealthCheck('rate_limiting', async () => {
      // Simple check that rate limiting is configured
      const rateLimitConfig = this.config.security.rateLimitMax > 0;

      return {
        status: rateLimitConfig ? 'HEALTHY' : 'WARNING',
        message: rateLimitConfig ? 'Rate limiting enabled' : 'Rate limiting not configured',
        details: {
          maxRequests: this.config.security.rateLimitMax,
          windowMs: this.config.security.rateLimitWindow
        }
      };
    });
  }

  /**
   * Get comprehensive status
   */
  public getSystemStatus(): {
    overall: 'HEALTHY' | 'WARNING' | 'CRITICAL';
    security: any;
    monitoring: any;
    performance: any;
    timestamp: string;
  } {
    const securityHealth = this.securityManager.performSecurityHealthCheck();
    const monitoringHealth = this.monitoringManager.getHealthStatus();
    const performance = this.monitoringManager.getPerformanceMetrics();

    // Determine overall status
    let overall: 'HEALTHY' | 'WARNING' | 'CRITICAL';
    if (securityHealth.status === 'CRITICAL' || monitoringHealth.overall === 'CRITICAL') {
      overall = 'CRITICAL';
    } else if (securityHealth.status === 'WARNING' || monitoringHealth.overall === 'WARNING') {
      overall = 'WARNING';
    } else {
      overall = 'HEALTHY';
    }

    return {
      overall,
      security: securityHealth,
      monitoring: monitoringHealth,
      performance,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Graceful shutdown
   */
  public async shutdown(): Promise<void> {
    console.log('Shutting down security and monitoring systems...');

    // Perform any cleanup needed
    // In production, this would save state, close connections, etc.

    console.log('Security and monitoring systems shut down successfully');
  }

  // Getters for direct access to managers
  public getSecurityManager(): EnterpriseSecurityManager {
    return this.securityManager;
  }

  public getMonitoringManager(): EnterpriseMonitoringManager {
    return this.monitoringManager;
  }
}
