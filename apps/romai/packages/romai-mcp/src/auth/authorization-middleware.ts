/**
 * ROMAI Authorization Middleware
 * 
 * Enterprise-grade authorization middleware for MCP server operations.
 * Provides authentication validation, permission checking, rate limiting,
 * and audit logging for all incoming requests.
 * 
 * Features:
 * - API key authentication
 * - Role-based access control (RBAC)
 * - Rate limiting per organization
 * - Usage quota enforcement
 * - Request/response audit logging
 * - Performance monitoring
 */

import { authManager, User, Organization } from './authentication-manager.js';
import { enterpriseLogger } from '../logging/enterprise-logger.js';
import { randomUUID } from 'crypto';

export interface AuthContext {
  user: User;
  organization: Organization;
  permissions: string[];
  requestId: string;
  startTime: number;
}

export interface AuthorizationResult {
  authorized: boolean;
  context?: AuthContext;
  error?: string;
  statusCode?: number;
}

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface QuotaConfig {
  checkApiCalls: boolean;
  checkStorage: boolean;
  checkBandwidth: boolean;
}

export class AuthorizationMiddleware {
  private static instance: AuthorizationMiddleware;
  private rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map();

  private constructor() {
    // Cleanup rate limit store every minute
    setInterval(() => this.cleanupRateLimitStore(), 60000);
  }

  public static getInstance(): AuthorizationMiddleware {
    if (!AuthorizationMiddleware.instance) {
      AuthorizationMiddleware.instance = new AuthorizationMiddleware();
    }
    return AuthorizationMiddleware.instance;
  }

  /**
   * Main authorization middleware function
   */
  public async authorize(
    apiKey: string,
    method: string,
    resource?: string,
    options: {
      rateLimitConfig?: RateLimitConfig;
      quotaConfig?: QuotaConfig;
      requiredPermissions?: string[];
    } = {}
  ): Promise<AuthorizationResult> {
    const requestId = randomUUID();
    const startTime = Date.now();

    try {
      // Step 1: Authenticate API key
      const authResult = authManager.authenticateApiKey(apiKey);
      if (!authResult.success) {
        await this.logAuthEvent('authentication_failed', {
          requestId,
          method,
          resource,
          error: authResult.error,
          apiKey: apiKey.substring(0, 10) + '...'
        });

        return {
          authorized: false,
          error: authResult.error || 'Authentication failed',
          statusCode: 401
        };
      }

      const { user, organization, permissions } = authResult;
      if (!user || !organization) {
        return {
          authorized: false,
          error: 'Invalid user or organization',
          statusCode: 401
        };
      }

      // Step 2: Check rate limits
      if (options.rateLimitConfig) {
        const rateLimitResult = this.checkRateLimit(
          organization.id,
          options.rateLimitConfig
        );

        if (!rateLimitResult.allowed) {
          await this.logAuthEvent('rate_limit_exceeded', {
            requestId,
            method,
            resource,
            organizationId: organization.id,
            userId: user.id,
            limit: options.rateLimitConfig.maxRequests,
            window: options.rateLimitConfig.windowMs
          });

          return {
            authorized: false,
            error: 'Rate limit exceeded',
            statusCode: 429
          };
        }
      }

      // Step 3: Check usage quotas
      if (options.quotaConfig?.checkApiCalls) {
        const quotaResult = authManager.checkQuota(organization.id, 'api_calls', 1);
        if (!quotaResult.allowed) {
          await this.logAuthEvent('quota_exceeded', {
            requestId,
            method,
            resource,
            organizationId: organization.id,
            userId: user.id,
            quotaType: 'api_calls',
            limit: quotaResult.limit,
            current: quotaResult.limit - quotaResult.remaining
          });

          return {
            authorized: false,
            error: 'API call quota exceeded',
            statusCode: 402
          };
        }
      }

      // Step 4: Check permissions
      if (options.requiredPermissions && options.requiredPermissions.length > 0) {
        const hasAllPermissions = this.checkPermissions(
          user,
          permissions || [],
          options.requiredPermissions
        );

        if (!hasAllPermissions) {
          await this.logAuthEvent('permission_denied', {
            requestId,
            method,
            resource,
            organizationId: organization.id,
            userId: user.id,
            requiredPermissions: options.requiredPermissions,
            userPermissions: permissions || []
          });

          return {
            authorized: false,
            error: 'Insufficient permissions',
            statusCode: 403
          };
        }
      }

      // Step 5: Update usage metrics
      authManager.updateUsage(organization.id, 'api_calls', 1);

      // Step 6: Create auth context
      const authContext: AuthContext = {
        user,
        organization,
        permissions: permissions || [],
        requestId,
        startTime
      };

      // Step 7: Log successful authorization
      await this.logAuthEvent('authorization_success', {
        requestId,
        method,
        resource,
        organizationId: organization.id,
        userId: user.id,
        permissions: permissions || []
      });

      return {
        authorized: true,
        context: authContext
      };

    } catch (error) {
      await this.logAuthEvent('authorization_error', {
        requestId,
        method,
        resource,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        authorized: false,
        error: 'Internal authorization error',
        statusCode: 500
      };
    }
  }

  /**
   * Check rate limits for organization
   */
  private checkRateLimit(
    organizationId: string,
    config: RateLimitConfig
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const key = `ratelimit:${organizationId}`;
    const now = Date.now();
    const resetTime = now + config.windowMs;

    let rateLimitInfo = this.rateLimitStore.get(key);

    // Initialize or reset if window expired
    if (!rateLimitInfo || now >= rateLimitInfo.resetTime) {
      rateLimitInfo = {
        count: 0,
        resetTime
      };
      this.rateLimitStore.set(key, rateLimitInfo);
    }

    // Check if limit exceeded
    if (rateLimitInfo.count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: rateLimitInfo.resetTime
      };
    }

    // Increment counter
    rateLimitInfo.count++;

    return {
      allowed: true,
      remaining: config.maxRequests - rateLimitInfo.count,
      resetTime: rateLimitInfo.resetTime
    };
  }

  /**
   * Check if user has required permissions
   */
  private checkPermissions(
    user: User,
    userPermissions: string[],
    requiredPermissions: string[]
  ): boolean {
    // Check for wildcard permission
    if (userPermissions.includes('*')) {
      return true;
    }

    // Check if user has all required permissions
    for (const required of requiredPermissions) {
      const hasPermission = userPermissions.includes(required) ||
        authManager.hasPermission(user.id, required.split(':')[0] || '', required.split(':')[1] || '');

      if (!hasPermission) {
        return false;
      }
    }

    return true;
  }

  /**
   * Complete request authorization cycle
   */
  public async completeRequest(
    context: AuthContext,
    success: boolean,
    responseSize?: number,
    error?: string
  ): Promise<void> {
    const duration = Date.now() - context.startTime;

    try {
      // Update usage metrics
      if (responseSize) {
        authManager.updateUsage(context.organization.id, 'bandwidth', responseSize);
      }

      // Log request completion
      await this.logAuthEvent('request_completed', {
        requestId: context.requestId,
        organizationId: context.organization.id,
        userId: context.user.id,
        duration,
        success,
        responseSize,
        error
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      enterpriseLogger.recordAuditEvent({
        eventId: randomUUID(),
        eventType: 'error',
        severity: 'error',
        details: {
          action: 'complete_request_error',
          error: errorMessage,
          requestId: context.requestId,
          organizationId: context.organization.id,
          userId: context.user.id
        },
        context: {
          requestId: context.requestId,
          organizationId: context.organization.id,
          userId: context.user.id,
          method: 'complete_request',
          timestamp: new Date().toISOString(),
          source: 'mcp-server',
          version: '0.2.0'
        }
      });
    }
  }

  /**
   * Get rate limit status for organization
   */
  public getRateLimitStatus(organizationId: string): {
    current: number;
    resetTime: number;
  } {
    const key = `ratelimit:${organizationId}`;
    const rateLimitInfo = this.rateLimitStore.get(key);

    if (!rateLimitInfo || Date.now() >= rateLimitInfo.resetTime) {
      return { current: 0, resetTime: 0 };
    }

    return {
      current: rateLimitInfo.count,
      resetTime: rateLimitInfo.resetTime
    };
  }

  /**
   * Get organization usage statistics
   */
  public getUsageStats(organizationId: string): {
    apiCalls: number;
    storageUsed: number;
    bandwidthUsed: number;
    quotaLimits: {
      apiCalls: number;
      storage: number;
      bandwidth: number;
    };
    rateLimitStatus: {
      current: number;
      resetTime: number;
    };
  } {
    const stats = authManager.getOrganizationStats(organizationId);
    const rateLimitStatus = this.getRateLimitStatus(organizationId);

    return {
      apiCalls: stats.usage.apiCalls || 0,
      storageUsed: stats.usage.storageUsed || 0,
      bandwidthUsed: stats.usage.bandwidthUsed || 0,
      quotaLimits: stats.usage.quotaLimits || {
        apiCalls: 0,
        storage: 0,
        bandwidth: 0
      },
      rateLimitStatus
    };
  }

  /**
   * Reset usage for organization (for testing or billing cycle)
   */
  public resetUsage(organizationId: string): void {
    const organization = authManager['organizations'].get(organizationId);
    if (organization?.billingInfo) {
      organization.billingInfo.usage.apiCalls = 0;
      organization.billingInfo.usage.storageUsed = 0;
      organization.billingInfo.usage.bandwidthUsed = 0;
      organization.billingInfo.usage.lastResetDate = new Date().toISOString();
    }

    // Reset rate limits
    const key = `ratelimit:${organizationId}`;
    this.rateLimitStore.delete(key);

    enterpriseLogger.recordAuditEvent({
      eventId: randomUUID(),
      eventType: 'auth',
      severity: 'info',
      details: {
        action: 'usage_reset',
        organizationId,
        timestamp: new Date().toISOString()
      },
      context: {
        requestId: randomUUID(),
        organizationId,
        method: 'reset_usage',
        timestamp: new Date().toISOString(),
        source: 'mcp-server',
        version: '0.2.0'
      }
    });
  }

  /**
   * Log authentication/authorization events
   */
  private async logAuthEvent(eventType: string, details: Record<string, any>): Promise<void> {
    enterpriseLogger.recordAuditEvent({
      eventId: randomUUID(),
      eventType: 'auth',
      severity: this.getEventSeverity(eventType),
      details: {
        action: eventType,
        ...details
      },
      context: {
        requestId: details.requestId || randomUUID(),
        userId: details.userId,
        organizationId: details.organizationId,
        method: details.method,
        timestamp: new Date().toISOString(),
        source: 'mcp-server',
        version: '0.2.0'
      }
    });
  }

  /**
   * Get event severity based on event type
   */
  private getEventSeverity(eventType: string): 'info' | 'warn' | 'error' {
    switch (eventType) {
      case 'authentication_failed':
      case 'permission_denied':
      case 'authorization_error':
        return 'error';
      case 'rate_limit_exceeded':
      case 'quota_exceeded':
        return 'warn';
      default:
        return 'info';
    }
  }

  /**
   * Cleanup expired rate limit entries
   */
  private cleanupRateLimitStore(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, info] of this.rateLimitStore.entries()) {
      if (now >= info.resetTime) {
        this.rateLimitStore.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      enterpriseLogger.recordAuditEvent({
        eventId: randomUUID(),
        eventType: 'auth',
        severity: 'info',
        details: {
          action: 'rate_limit_cleanup',
          cleanedEntries: cleaned,
          remainingEntries: this.rateLimitStore.size
        },
        context: {
          requestId: randomUUID(),
          method: 'cleanup_rate_limits',
          timestamp: new Date().toISOString(),
          source: 'mcp-server',
          version: '0.2.0'
        }
      });
    }
  }

  /**
   * Get authorization health status
   */
  public getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    rateLimitStoreSize: number;
    activeOrganizations: number;
    totalApiKeys: number;
    averageResponseTime: number;
  } {
    const orgStats = Array.from(authManager['organizations'].values());
    const totalApiKeys = Array.from(authManager['apiKeys'].values()).length;

    return {
      status: 'healthy', // Simplified health check
      rateLimitStoreSize: this.rateLimitStore.size,
      activeOrganizations: orgStats.filter(org => org.status === 'active').length,
      totalApiKeys,
      averageResponseTime: 50 // Placeholder
    };
  }
}

/**
 * Export singleton instance
 */
export const authMiddleware = AuthorizationMiddleware.getInstance();
