import { createHash, randomBytes } from 'crypto';
import { multiTenantAuth } from './multiTenantAuth';
import { complianceFramework } from './complianceFramework';

// API Gateway Configuration
export interface APIGatewayConfig {
  tenantId: string;
  baseUrl: string;
  rateLimit: {
    requests: number;
    windowMs: number;
  };
  authentication: {
    required: boolean;
    methods: ('jwt' | 'apikey' | 'oauth')[];
  };
  cors: {
    origins: string[];
    credentials: boolean;
  };
  logging: {
    enabled: boolean;
    level: 'debug' | 'info' | 'warn' | 'error';
  };
}

export interface APIRoute {
  id: string;
  tenantId: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  target: string;
  authRequired: boolean;
  permissions: string[];
  rateLimit?: {
    requests: number;
    windowMs: number;
  };
  transformation?: {
    request?: any;
    response?: any;
  };
  caching?: {
    enabled: boolean;
    ttl: number;
  };
}

export interface APIKey {
  id: string;
  tenantId: string;
  key: string;
  name: string;
  permissions: string[];
  rateLimit: {
    requests: number;
    windowMs: number;
  };
  lastUsed?: Date;
  expiresAt?: Date;
  isActive: boolean;
}

export interface RequestLog {
  id: string;
  tenantId: string;
  timestamp: Date;
  method: string;
  path: string;
  statusCode: number;
  responseTime: number;
  userAgent: string;
  ip: string;
  userId?: string;
  apiKeyId?: string;
  errors?: any[];
}

export class EnterpriseAPIGateway {
  private configs: Map<string, APIGatewayConfig> = new Map();
  private routes: Map<string, APIRoute[]> = new Map();
  private apiKeys: Map<string, APIKey> = new Map();
  private requestLogs: Map<string, RequestLog[]> = new Map();
  private rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map();

  // Configuration Management
  async configureGateway(config: APIGatewayConfig): Promise<boolean> {
    try {
      const tenant = await multiTenantAuth.getTenant(config.tenantId);
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      this.configs.set(config.tenantId, config);

      // Initialize routes and logs for this tenant
      if (!this.routes.has(config.tenantId)) {
        this.routes.set(config.tenantId, []);
      }
      if (!this.requestLogs.has(config.tenantId)) {
        this.requestLogs.set(config.tenantId, []);
      }

      return true;
    } catch (error) {
      console.error('Gateway configuration failed:', error);
      return false;
    }
  }

  async getGatewayConfig(tenantId: string): Promise<APIGatewayConfig | null> {
    return this.configs.get(tenantId) || null;
  }

  // Route Management
  async addRoute(route: APIRoute): Promise<boolean> {
    try {
      const tenant = await multiTenantAuth.getTenant(route.tenantId);
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      const routes = this.routes.get(route.tenantId) || [];

      // Check for duplicate routes
      const existingRoute = routes.find(r =>
        r.path === route.path && r.method === route.method
      );

      if (existingRoute) {
        throw new Error('Route already exists');
      }

      routes.push(route);
      this.routes.set(route.tenantId, routes);

      await this.logGatewayEvent(route.tenantId, 'ROUTE_ADDED', route);
      return true;
    } catch (error) {
      console.error('Add route failed:', error);
      return false;
    }
  }

  async removeRoute(tenantId: string, routeId: string): Promise<boolean> {
    const routes = this.routes.get(tenantId) || [];
    const index = routes.findIndex(r => r.id === routeId);

    if (index === -1) return false;

    routes.splice(index, 1);
    this.routes.set(tenantId, routes);

    await this.logGatewayEvent(tenantId, 'ROUTE_REMOVED', { routeId });
    return true;
  }

  async getRoutes(tenantId: string): Promise<APIRoute[]> {
    return this.routes.get(tenantId) || [];
  }

  // API Key Management
  async createAPIKey(
    tenantId: string,
    keyData: Omit<APIKey, 'id' | 'key' | 'lastUsed' | 'isActive'>
  ): Promise<APIKey | null> {
    try {
      const tenant = await multiTenantAuth.getTenant(tenantId);
      if (!tenant) return null;

      const apiKey: APIKey = {
        ...keyData,
        id: this.generateId(),
        key: this.generateAPIKey(),
        isActive: true,
      };

      this.apiKeys.set(apiKey.id, apiKey);

      await this.logGatewayEvent(tenantId, 'API_KEY_CREATED', {
        keyId: apiKey.id,
        name: apiKey.name,
      });

      return apiKey;
    } catch (error) {
      console.error('API key creation failed:', error);
      return null;
    }
  }

  async validateAPIKey(key: string): Promise<APIKey | null> {
    for (const apiKey of this.apiKeys.values()) {
      if (apiKey.key === key && apiKey.isActive) {
        // Check expiration
        if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
          apiKey.isActive = false;
          return null;
        }

        // Update last used
        apiKey.lastUsed = new Date();
        this.apiKeys.set(apiKey.id, apiKey);

        return apiKey;
      }
    }
    return null;
  }

  async revokeAPIKey(keyId: string): Promise<boolean> {
    const apiKey = this.apiKeys.get(keyId);
    if (!apiKey) return false;

    apiKey.isActive = false;
    this.apiKeys.set(keyId, apiKey);

    await this.logGatewayEvent(apiKey.tenantId, 'API_KEY_REVOKED', { keyId });
    return true;
  }

  // Authentication Middleware
  async authenticateRequest(
    tenantId: string,
    authHeader: string | undefined,
    apiKeyHeader: string | undefined
  ): Promise<{
    authenticated: boolean;
    userId?: string;
    apiKeyId?: string;
    permissions: string[];
    error?: string;
  }> {
    const config = this.configs.get(tenantId);
    if (!config || !config.authentication.required) {
      return { authenticated: true, permissions: [] };
    }

    // Try JWT authentication
    if (authHeader && config.authentication.methods.includes('jwt')) {
      const token = authHeader.replace('Bearer ', '');
      const session = await multiTenantAuth.validateSession(token);

      if (session && session.tenantId === tenantId) {
        return {
          authenticated: true,
          userId: session.userId,
          permissions: session.permissions,
        };
      }
    }

    // Try API key authentication
    if (apiKeyHeader && config.authentication.methods.includes('apikey')) {
      const apiKey = await this.validateAPIKey(apiKeyHeader);

      if (apiKey && apiKey.tenantId === tenantId) {
        return {
          authenticated: true,
          apiKeyId: apiKey.id,
          permissions: apiKey.permissions,
        };
      }
    }

    return {
      authenticated: false,
      permissions: [],
      error: 'Invalid authentication credentials',
    };
  }

  // Rate Limiting
  async checkRateLimit(
    identifier: string,
    limit: { requests: number; windowMs: number }
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
    const now = Date.now();
    const windowStart = now - limit.windowMs;

    let rateLimitData = this.rateLimitStore.get(identifier);

    // Initialize or reset if window expired
    if (!rateLimitData || rateLimitData.resetTime <= now) {
      rateLimitData = {
        count: 0,
        resetTime: now + limit.windowMs,
      };
    }

    rateLimitData.count++;
    this.rateLimitStore.set(identifier, rateLimitData);

    return {
      allowed: rateLimitData.count <= limit.requests,
      remaining: Math.max(0, limit.requests - rateLimitData.count),
      resetTime: rateLimitData.resetTime,
    };
  }

  // Request Processing
  async processRequest(request: {
    tenantId: string;
    method: string;
    path: string;
    headers: Record<string, string>;
    body?: any;
    query?: Record<string, string>;
    ip: string;
  }): Promise<{
    statusCode: number;
    headers: Record<string, string>;
    body: any;
    route?: APIRoute;
  }> {
    const startTime = Date.now();
    const config = this.configs.get(request.tenantId);

    if (!config) {
      return {
        statusCode: 404,
        headers: {},
        body: { error: 'Gateway not configured for tenant' },
      };
    }

    try {
      // Find matching route
      const routes = this.routes.get(request.tenantId) || [];
      const route = routes.find(r =>
        r.method === request.method && this.matchPath(r.path, request.path)
      );

      if (!route) {
        return {
          statusCode: 404,
          headers: {},
          body: { error: 'Route not found' },
        };
      }

      // Check authentication
      const auth = await this.authenticateRequest(
        request.tenantId,
        request.headers.authorization,
        request.headers['x-api-key']
      );

      if (route.authRequired && !auth.authenticated) {
        return {
          statusCode: 401,
          headers: {},
          body: { error: auth.error || 'Authentication required' },
        };
      }

      // Check permissions
      if (route.permissions.length > 0 && auth.authenticated) {
        const hasPermission = route.permissions.some(permission =>
          auth.permissions.includes(permission)
        );

        if (!hasPermission) {
          return {
            statusCode: 403,
            headers: {},
            body: { error: 'Insufficient permissions' },
          };
        }
      }

      // Check rate limiting
      const rateLimitKey = `${request.tenantId}:${auth.userId || auth.apiKeyId || request.ip}`;
      const rateLimit = route.rateLimit || config.rateLimit;
      const rateLimitResult = await this.checkRateLimit(rateLimitKey, rateLimit);

      if (!rateLimitResult.allowed) {
        return {
          statusCode: 429,
          headers: {
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          },
          body: { error: 'Rate limit exceeded' },
        };
      }

      // Log request
      await this.logRequest({
        id: this.generateId(),
        tenantId: request.tenantId,
        timestamp: new Date(),
        method: request.method,
        path: request.path,
        statusCode: 200, // Will be updated
        responseTime: Date.now() - startTime,
        userAgent: request.headers['user-agent'] || '',
        ip: request.ip,
        userId: auth.userId,
        apiKeyId: auth.apiKeyId,
      });

      // For now, return success response
      // In real implementation, this would proxy to the target service
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        },
        body: {
          message: 'Request processed successfully',
          route: route.path,
          method: route.method,
        },
        route,
      };

    } catch (error) {
      return {
        statusCode: 500,
        headers: {},
        body: { error: 'Internal server error' },
      };
    }
  }

  // Analytics and Monitoring
  async getAnalytics(tenantId: string, timeframe: {
    from: Date;
    to: Date;
  }): Promise<{
    totalRequests: number;
    errorRate: number;
    averageResponseTime: number;
    topRoutes: Array<{ route: string; count: number }>;
    statusCodeDistribution: Record<number, number>;
    rateLimitHits: number;
  }> {
    const logs = this.requestLogs.get(tenantId) || [];
    const filteredLogs = logs.filter(log =>
      log.timestamp >= timeframe.from && log.timestamp <= timeframe.to
    );

    const totalRequests = filteredLogs.length;
    const errorRequests = filteredLogs.filter(log => log.statusCode >= 400).length;
    const errorRate = totalRequests > 0 ? errorRequests / totalRequests : 0;

    const averageResponseTime = totalRequests > 0
      ? filteredLogs.reduce((sum, log) => sum + log.responseTime, 0) / totalRequests
      : 0;

    // Top routes
    const routeCounts = new Map<string, number>();
    filteredLogs.forEach(log => {
      const route = `${log.method} ${log.path}`;
      routeCounts.set(route, (routeCounts.get(route) || 0) + 1);
    });

    const topRoutes = Array.from(routeCounts.entries())
      .map(([route, count]) => ({ route, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Status code distribution
    const statusCodeDistribution: Record<number, number> = {};
    filteredLogs.forEach(log => {
      statusCodeDistribution[log.statusCode] =
        (statusCodeDistribution[log.statusCode] || 0) + 1;
    });

    const rateLimitHits = filteredLogs.filter(log => log.statusCode === 429).length;

    return {
      totalRequests,
      errorRate,
      averageResponseTime,
      topRoutes,
      statusCodeDistribution,
      rateLimitHits,
    };
  }

  // Health Monitoring
  async getHealthStatus(tenantId: string): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Array<{
      name: string;
      status: 'pass' | 'fail';
      details?: string;
    }>;
  }> {
    const checks: Array<{
      name: string;
      status: 'pass' | 'fail';
      details?: string;
    }> = [];
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    // Check configuration
    const config = this.configs.get(tenantId);
    checks.push({
      name: 'configuration',
      status: config ? 'pass' : 'fail',
      details: config ? 'Gateway configured' : 'Gateway not configured',
    });

    // Check recent error rate
    const recentLogs = (this.requestLogs.get(tenantId) || [])
      .filter(log => Date.now() - log.timestamp.getTime() < 5 * 60 * 1000); // Last 5 minutes

    const recentErrorRate = recentLogs.length > 0
      ? recentLogs.filter(log => log.statusCode >= 500).length / recentLogs.length
      : 0;

    checks.push({
      name: 'error_rate',
      status: recentErrorRate < 0.05 ? 'pass' : 'fail',
      details: `Error rate: ${(recentErrorRate * 100).toFixed(2)}%`,
    });

    // Determine overall status
    const failedChecks = checks.filter(check => check.status === 'fail').length;
    if (failedChecks > 0) {
      overallStatus = failedChecks === checks.length ? 'unhealthy' : 'degraded';
    }

    return { status: overallStatus, checks };
  }

  // Helper methods
  private generateId(): string {
    return randomBytes(16).toString('hex');
  }

  private generateAPIKey(): string {
    return 'ck_' + randomBytes(32).toString('hex');
  }

  private matchPath(routePath: string, requestPath: string): boolean {
    // Simple path matching - in real implementation, use more sophisticated matching
    const routeSegments = routePath.split('/');
    const pathSegments = requestPath.split('/');

    if (routeSegments.length !== pathSegments.length) return false;

    return routeSegments.every((segment, index) => {
      return segment.startsWith(':') || segment === pathSegments[index];
    });
  }

  private async logRequest(log: RequestLog): Promise<void> {
    const logs = this.requestLogs.get(log.tenantId) || [];
    logs.push(log);

    // Keep only last 10000 logs per tenant
    if (logs.length > 10000) {
      logs.splice(0, logs.length - 10000);
    }

    this.requestLogs.set(log.tenantId, logs);
  }

  private async logGatewayEvent(tenantId: string, event: string, data: any): Promise<void> {
    // In real implementation, this would log to persistent storage
    console.log(`[${tenantId}] ${event}:`, data);
  }
}

export const enterpriseAPIGateway = new EnterpriseAPIGateway();
