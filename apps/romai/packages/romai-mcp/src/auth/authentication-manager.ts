/**
 * ROMAI Multi-tenant Authentication Manager
 * 
 * Enterprise-grade authentication and authorization system for multi-tenant
 * SaaS deployments. Provides user authentication, session management,
 * role-based access control (RBAC), and organization-level configuration.
 * 
 * Features:
 * - User authentication & session management
 * - Role-based access control (RBAC)
 * - API key management per organization
 * - Usage quotas & rate limiting
 * - Per-user audit logging
 * - Organization-level configuration
 */

import { randomUUID } from 'crypto';
import { createHash, createHmac } from 'crypto';
import { enterpriseLogger } from '../logging/enterprise-logger';

export interface User {
  id: string;
  email: string;
  name: string;
  organizationId: string;
  roles: string[];
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastLoginAt?: string;
  preferences: Record<string, any>;
}

export interface Organization {
  id: string;
  name: string;
  domain: string;
  plan: 'free' | 'professional' | 'enterprise';
  status: 'active' | 'suspended' | 'trial';
  settings: {
    maxUsers: number;
    maxApiCalls: number;
    maxStorage?: number;
    maxBandwidth?: number;
    features: string[];
    customization: Record<string, any>;
  };
  apiKeys: ApiKey[];
  createdAt: string;
  billingInfo?: {
    subscriptionId: string;
    nextBillingDate: string;
    usage: UsageMetrics;
  };
}

export interface ApiKey {
  id: string;
  key: string;
  name: string;
  organizationId: string;
  userId: string;
  permissions: string[];
  lastUsedAt?: string;
  expiresAt?: string;
  status: 'active' | 'revoked';
  createdAt: string;
}

export interface Session {
  id: string;
  userId: string;
  organizationId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  lastActivityAt: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface UsageMetrics {
  apiCalls: number;
  storageUsed: number;
  bandwidthUsed: number;
  lastResetDate: string;
  quotaLimits: {
    apiCalls: number;
    storage: number;
    bandwidth: number;
  };
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  organizationId?: string; // null for system roles
}

export class AuthenticationManager {
  private static instance: AuthenticationManager;
  private users: Map<string, User> = new Map();
  private organizations: Map<string, Organization> = new Map();
  private apiKeys: Map<string, ApiKey> = new Map();
  private sessions: Map<string, Session> = new Map();
  private roles: Map<string, Role> = new Map();
  private permissions: Map<string, Permission> = new Map();

  private constructor() {
    this.initializeSystemRoles();
    this.initializeDefaultOrganization();
  }

  public static getInstance(): AuthenticationManager {
    if (!AuthenticationManager.instance) {
      AuthenticationManager.instance = new AuthenticationManager();
    }
    return AuthenticationManager.instance;
  }

  /**
   * Initialize system roles and permissions
   */
  private initializeSystemRoles(): void {
    // Define permissions
    const permissions: Permission[] = [
      { id: 'read_intelligence', name: 'Read Intelligence', description: 'Access AI intelligence tools', resource: 'intelligence', action: 'read' },
      { id: 'write_intelligence', name: 'Write Intelligence', description: 'Use AI intelligence tools', resource: 'intelligence', action: 'write' },
      { id: 'read_resources', name: 'Read Resources', description: 'Access Romanian business resources', resource: 'resources', action: 'read' },
      { id: 'read_prompts', name: 'Read Prompts', description: 'Access prompt templates', resource: 'prompts', action: 'read' },
      { id: 'manage_users', name: 'Manage Users', description: 'Create and manage organization users', resource: 'users', action: 'manage' },
      { id: 'manage_api_keys', name: 'Manage API Keys', description: 'Create and manage API keys', resource: 'api_keys', action: 'manage' },
      { id: 'view_analytics', name: 'View Analytics', description: 'Access usage analytics', resource: 'analytics', action: 'read' },
      { id: 'manage_organization', name: 'Manage Organization', description: 'Configure organization settings', resource: 'organization', action: 'manage' }
    ];

    permissions.forEach(permission => {
      this.permissions.set(permission.id, permission);
    });

    // Define system roles
    const roles: Role[] = [
      {
        id: 'user',
        name: 'User',
        description: 'Basic user with access to AI tools',
        permissions: [
          this.permissions.get('read_intelligence')!,
          this.permissions.get('write_intelligence')!,
          this.permissions.get('read_resources')!,
          this.permissions.get('read_prompts')!
        ]
      },
      {
        id: 'admin',
        name: 'Administrator',
        description: 'Organization administrator with full access',
        permissions: Array.from(this.permissions.values())
      },
      {
        id: 'analyst',
        name: 'Analyst',
        description: 'Business analyst with intelligence and analytics access',
        permissions: [
          this.permissions.get('read_intelligence')!,
          this.permissions.get('write_intelligence')!,
          this.permissions.get('read_resources')!,
          this.permissions.get('read_prompts')!,
          this.permissions.get('view_analytics')!
        ]
      },
      {
        id: 'readonly',
        name: 'Read Only',
        description: 'Read-only access to resources and prompts',
        permissions: [
          this.permissions.get('read_resources')!,
          this.permissions.get('read_prompts')!,
          this.permissions.get('view_analytics')!
        ]
      }
    ];

    roles.forEach(role => {
      this.roles.set(role.id, role);
    });
  }

  /**
   * Initialize default organization for single-tenant mode
   */
  private initializeDefaultOrganization(): void {
    const defaultOrg: Organization = {
      id: 'default',
      name: 'Default Organization',
      domain: 'default.romai.local',
      plan: 'enterprise',
      status: 'active',
      settings: {
        maxUsers: 1000,
        maxApiCalls: 1000000,
        features: ['intelligence', 'resources', 'prompts', 'analytics'],
        customization: {}
      },
      apiKeys: [],
      createdAt: new Date().toISOString()
    };

    this.organizations.set(defaultOrg.id, defaultOrg);
  }

  /**
   * Create a new organization
   */
  public createOrganization(data: {
    name: string;
    domain: string;
    plan: 'free' | 'professional' | 'enterprise';
    adminUser: {
      email: string;
      name: string;
    };
  }): { organization: Organization; user: User; apiKey: ApiKey } {
    const organizationId = randomUUID();
    const userId = randomUUID();
    const apiKeyId = randomUUID();

    // Create organization
    const organization: Organization = {
      id: organizationId,
      name: data.name,
      domain: data.domain,
      plan: data.plan,
      status: 'active',
      settings: this.getDefaultSettingsForPlan(data.plan),
      apiKeys: [],
      createdAt: new Date().toISOString()
    };

    // Create admin user
    const user: User = {
      id: userId,
      email: data.adminUser.email,
      name: data.adminUser.name,
      organizationId,
      roles: ['admin'],
      status: 'active',
      createdAt: new Date().toISOString(),
      preferences: {}
    };

    // Create API key
    const apiKey: ApiKey = {
      id: apiKeyId,
      key: this.generateApiKey(),
      name: 'Default Admin Key',
      organizationId,
      userId,
      permissions: ['*'], // All permissions for admin
      status: 'active',
      createdAt: new Date().toISOString()
    };

    // Store entities
    this.organizations.set(organizationId, organization);
    this.users.set(userId, user);
    this.apiKeys.set(apiKey.key, apiKey);

    // Update organization with API key
    organization.apiKeys.push(apiKey);

    // Log organization creation
    enterpriseLogger.recordAuditEvent({
      eventId: randomUUID(),
      eventType: 'auth',
      severity: 'info',
      details: {
        action: 'organization_created',
        organizationId,
        adminUserId: userId,
        plan: data.plan
      },
      context: {
        requestId: randomUUID(),
        userId,
        organizationId,
        method: 'create_organization',
        timestamp: new Date().toISOString(),
        source: 'mcp-server',
        version: '0.2.0'
      }
    });

    return { organization, user, apiKey };
  }

  /**
   * Authenticate user with API key
   */
  public authenticateApiKey(apiKey: string): {
    success: boolean;
    user?: User;
    organization?: Organization;
    permissions?: string[];
    error?: string;
  } {
    const key = this.apiKeys.get(apiKey);

    if (!key) {
      return { success: false, error: 'Invalid API key' };
    }

    if (key.status !== 'active') {
      return { success: false, error: 'API key is revoked' };
    }

    if (key.expiresAt && new Date(key.expiresAt) < new Date()) {
      return { success: false, error: 'API key has expired' };
    }

    const user = this.users.get(key.userId);
    const organization = this.organizations.get(key.organizationId);

    if (!user || !organization) {
      return { success: false, error: 'Associated user or organization not found' };
    }

    if (user.status !== 'active' || organization.status !== 'active') {
      return { success: false, error: 'User or organization is not active' };
    }

    // Update last used timestamp
    key.lastUsedAt = new Date().toISOString();

    // Log authentication
    enterpriseLogger.recordAuditEvent({
      eventId: randomUUID(),
      eventType: 'auth',
      severity: 'info',
      details: {
        action: 'api_key_authentication',
        userId: user.id,
        organizationId: organization.id,
        apiKeyId: key.id
      },
      context: {
        requestId: randomUUID(),
        userId: user.id,
        organizationId: organization.id,
        method: 'authenticate_api_key',
        timestamp: new Date().toISOString(),
        source: 'mcp-server',
        version: '0.2.0'
      }
    });

    return {
      success: true,
      user,
      organization,
      permissions: key.permissions
    };
  }

  /**
   * Create session for user
   */
  public createSession(userId: string, options: {
    ipAddress?: string;
    userAgent?: string;
    expiresInHours?: number;
  } = {}): Session {
    const session: Session = {
      id: randomUUID(),
      userId,
      organizationId: this.users.get(userId)?.organizationId || 'default',
      token: this.generateSessionToken(),
      expiresAt: new Date(Date.now() + (options.expiresInHours || 24) * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      ipAddress: options.ipAddress,
      userAgent: options.userAgent
    };

    this.sessions.set(session.token, session);

    // Log session creation
    enterpriseLogger.recordAuditEvent({
      eventId: randomUUID(),
      eventType: 'auth',
      severity: 'info',
      details: {
        action: 'session_created',
        sessionId: session.id,
        userId,
        expiresAt: session.expiresAt
      },
      context: {
        requestId: randomUUID(),
        userId,
        organizationId: session.organizationId,
        method: 'create_session',
        timestamp: new Date().toISOString(),
        source: 'mcp-server',
        version: '0.2.0'
      }
    });

    return session;
  }

  /**
   * Validate session token
   */
  public validateSession(token: string): {
    valid: boolean;
    session?: Session;
    user?: User;
    organization?: Organization;
  } {
    const session = this.sessions.get(token);

    if (!session) {
      return { valid: false };
    }

    if (new Date(session.expiresAt) < new Date()) {
      this.sessions.delete(token);
      return { valid: false };
    }

    const user = this.users.get(session.userId);
    const organization = this.organizations.get(session.organizationId);

    if (!user || !organization) {
      return { valid: false };
    }

    // Update last activity
    session.lastActivityAt = new Date().toISOString();

    return {
      valid: true,
      session,
      user,
      organization
    };
  }

  /**
   * Check if user has permission
   */
  public hasPermission(userId: string, resource: string, action: string): boolean {
    const user = this.users.get(userId);
    if (!user) return false;

    for (const roleName of user.roles) {
      const role = this.roles.get(roleName);
      if (!role) continue;

      for (const permission of role.permissions) {
        if (permission.resource === resource && permission.action === action) {
          return true;
        }
        // Check for wildcard permissions
        if (permission.resource === '*' || permission.action === '*') {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Check usage quotas for organization
   */
  public checkQuota(organizationId: string, resource: string, amount: number = 1): {
    allowed: boolean;
    remaining: number;
    limit: number;
    resetDate: string;
  } {
    const organization = this.organizations.get(organizationId);
    if (!organization) {
      return { allowed: false, remaining: 0, limit: 0, resetDate: '' };
    }

    const usage = organization.billingInfo?.usage || {
      apiCalls: 0,
      storageUsed: 0,
      bandwidthUsed: 0,
      lastResetDate: new Date().toISOString(),
      quotaLimits: {
        apiCalls: organization.settings.maxApiCalls,
        storage: organization.settings.maxStorage || 1000000000, // 1GB default
        bandwidth: organization.settings.maxBandwidth || 10000000000 // 10GB default
      }
    };

    let currentUsage = 0;
    let limit = 0;

    switch (resource) {
      case 'api_calls':
        currentUsage = usage.apiCalls;
        limit = usage.quotaLimits.apiCalls;
        break;
      case 'storage':
        currentUsage = usage.storageUsed;
        limit = usage.quotaLimits.storage;
        break;
      case 'bandwidth':
        currentUsage = usage.bandwidthUsed;
        limit = usage.quotaLimits.bandwidth;
        break;
      default:
        return { allowed: true, remaining: Infinity, limit: Infinity, resetDate: '' };
    }

    const remaining = Math.max(0, limit - currentUsage);
    const allowed = currentUsage + amount <= limit;

    return {
      allowed,
      remaining,
      limit,
      resetDate: usage.lastResetDate
    };
  }

  /**
   * Update usage metrics
   */
  public updateUsage(organizationId: string, resource: string, amount: number): void {
    const organization = this.organizations.get(organizationId);
    if (!organization) return;

    if (!organization.billingInfo) {
      organization.billingInfo = {
        subscriptionId: '',
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        usage: {
          apiCalls: 0,
          storageUsed: 0,
          bandwidthUsed: 0,
          lastResetDate: new Date().toISOString(),
          quotaLimits: {
            apiCalls: organization.settings.maxApiCalls,
            storage: organization.settings.maxStorage || 1000000000,
            bandwidth: organization.settings.maxBandwidth || 10000000000
          }
        }
      };
    }

    switch (resource) {
      case 'api_calls':
        organization.billingInfo.usage.apiCalls += amount;
        break;
      case 'storage':
        organization.billingInfo.usage.storageUsed += amount;
        break;
      case 'bandwidth':
        organization.billingInfo.usage.bandwidthUsed += amount;
        break;
    }
  }

  /**
   * Generate API key
   */
  private generateApiKey(): string {
    const prefix = 'romai_';
    const randomBytes = randomUUID().replace(/-/g, '');
    return `${prefix}${randomBytes}`;
  }

  /**
   * Generate session token
   */
  private generateSessionToken(): string {
    return createHash('sha256').update(randomUUID() + Date.now()).digest('hex');
  }

  /**
   * Get default settings for plan
   */
  private getDefaultSettingsForPlan(plan: string) {
    switch (plan) {
      case 'free':
        return {
          maxUsers: 1,
          maxApiCalls: 1000,
          maxStorage: 100000000, // 100MB
          maxBandwidth: 1000000000, // 1GB
          features: ['intelligence'],
          customization: {}
        };
      case 'professional':
        return {
          maxUsers: 10,
          maxApiCalls: 50000,
          maxStorage: 5000000000, // 5GB
          maxBandwidth: 50000000000, // 50GB
          features: ['intelligence', 'resources', 'prompts'],
          customization: {}
        };
      case 'enterprise':
        return {
          maxUsers: 1000,
          maxApiCalls: 1000000,
          maxStorage: 100000000000, // 100GB
          maxBandwidth: 1000000000000, // 1TB
          features: ['intelligence', 'resources', 'prompts', 'analytics'],
          customization: {}
        };
      default:
        return {
          maxUsers: 1,
          maxApiCalls: 100,
          maxStorage: 10000000, // 10MB
          maxBandwidth: 100000000, // 100MB
          features: ['intelligence'],
          customization: {}
        };
    }
  }

  /**
   * Get organization statistics
   */
  public getOrganizationStats(organizationId: string): {
    users: number;
    activeUsers: number;
    apiKeys: number;
    activeSessions: number;
    usage: UsageMetrics;
  } {
    const organization = this.organizations.get(organizationId);
    if (!organization) {
      return { users: 0, activeUsers: 0, apiKeys: 0, activeSessions: 0, usage: {} as UsageMetrics };
    }

    const orgUsers = Array.from(this.users.values()).filter(u => u.organizationId === organizationId);
    const activeUsers = orgUsers.filter(u => u.status === 'active').length;
    const apiKeys = Array.from(this.apiKeys.values()).filter(k => k.organizationId === organizationId).length;
    const activeSessions = Array.from(this.sessions.values()).filter(s =>
      s.organizationId === organizationId && new Date(s.expiresAt) > new Date()
    ).length;

    return {
      users: orgUsers.length,
      activeUsers,
      apiKeys,
      activeSessions,
      usage: organization.billingInfo?.usage || {} as UsageMetrics
    };
  }

  /**
   * Cleanup expired sessions
   */
  public cleanupExpiredSessions(): number {
    let cleaned = 0;
    const now = new Date();

    for (const [token, session] of this.sessions.entries()) {
      if (new Date(session.expiresAt) < now) {
        this.sessions.delete(token);
        cleaned++;
      }
    }

    return cleaned;
  }
}

/**
 * Export singleton instance
 */
export const authManager = AuthenticationManager.getInstance();
