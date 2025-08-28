/**
 * Multi-Tenant Architecture Implementation - US-MEM-004
 * Tenant Management System for MemorAI
 * 
 * Sprint: MemorAI Enhancement Sprint (Aug 27 - Sep 9, 2025)
 * User Story: US-MEM-004 (8 SP)
 */

import { randomUUID } from 'node:crypto';
import crypto from 'node:crypto';

export interface TenantConfig {
    id: string;
    name: string;
    description?: string;
    status: 'active' | 'inactive' | 'suspended';
    createdAt: string;
    updatedAt: string;
    settings: {
        maxMemories?: number;
        maxAgents?: number;
        retentionDays?: number;
        features: {
            clustering?: boolean;
            crossAgentAccess?: boolean;
            analytics?: boolean;
            realTimeSync?: boolean;
            aiEnhancement?: boolean;
        };
        security: {
            encryptionEnabled: boolean;
            auditLogging: boolean;
            accessControlEnabled: boolean;
            allowCrossTenantAccess: boolean;
        };
        quotas: {
            memoryStorageBytes: number;
            embeddingGenerations: number;
            clusteringOperations: number;
            analyticsQueries: number;
        };
    };
    contact: {
        email?: string;
        organization?: string;
        phone?: string;
    };
    billing: {
        plan: 'free' | 'pro' | 'enterprise';
        billingContact?: string;
        subscriptionId?: string;
    };
    metadata: {
        region?: string;
        industry?: string;
        complianceRequirements?: string[];
        customFields?: Record<string, any>;
    };
}

export interface TenantUsage {
    tenantId: string;
    timestamp: string;
    metrics: {
        totalMemories: number;
        totalAgents: number;
        storageUsedBytes: number;
        embeddingsGenerated: number;
        clusteringOperations: number;
        analyticsQueries: number;
        activeUsers: number;
        apiCalls: number;
    };
    quotaStatus: {
        memoryStorage: { used: number; limit: number; percentage: number };
        embeddings: { used: number; limit: number; percentage: number };
        clustering: { used: number; limit: number; percentage: number };
        analytics: { used: number; limit: number; percentage: number };
    };
}

export interface TenantIsolationContext {
    tenantId: string;
    agentId: string;
    userId?: string;
    sessionId?: string;
    requestId: string;
    timestamp: string;
    sourceIP?: string;
    userAgent?: string;
    permissions: string[];
    restrictions: {
        allowCrossTenantAccess: boolean;
        maxMemoryAccess: number;
        rateLimits: {
            requestsPerMinute: number;
            requestsPerHour: number;
        };
    };
}

export interface TenantAuditEvent {
    id: string;
    tenantId: string;
    agentId: string;
    userId?: string;
    eventType: 'memory_created' | 'memory_accessed' | 'memory_deleted' | 'tenant_accessed' | 'security_violation' | 'quota_exceeded';
    resource: string;
    action: string;
    result: 'success' | 'failure' | 'blocked';
    reason?: string;
    metadata: Record<string, any>;
    timestamp: string;
    sourceIP?: string;
    userAgent?: string;
}

/**
 * Enterprise-grade tenant isolation and management system
 */
export class TenantManager {
    private tenants: Map<string, TenantConfig> = new Map();
    private tenantUsage: Map<string, TenantUsage> = new Map();
    private auditLog: TenantAuditEvent[] = [];
    private encryptionKey: string;

    constructor() {
        this.encryptionKey = process.env.TENANT_ENCRYPTION_KEY || this.generateEncryptionKey();
        console.log('🏢 Tenant Manager initialized with enterprise-grade isolation');
    }

    /**
     * Create a new tenant with full configuration
     */
    async createTenant(config: Partial<TenantConfig>): Promise<TenantConfig> {
        const tenantId = config.id || `tenant_${randomUUID()}`;

        // Validate tenant doesn't exist
        if (this.tenants.has(tenantId)) {
            throw new Error(`Tenant with ID ${tenantId} already exists`);
        }

        const tenant: TenantConfig = {
            id: tenantId,
            name: config.name || `Tenant ${tenantId}`,
            description: config.description,
            status: config.status || 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            settings: {
                maxMemories: config.settings?.maxMemories || 10000,
                maxAgents: config.settings?.maxAgents || 100,
                retentionDays: config.settings?.retentionDays || 365,
                features: {
                    clustering: config.settings?.features?.clustering ?? true,
                    crossAgentAccess: config.settings?.features?.crossAgentAccess ?? true,
                    analytics: config.settings?.features?.analytics ?? true,
                    realTimeSync: config.settings?.features?.realTimeSync ?? false,
                    aiEnhancement: config.settings?.features?.aiEnhancement ?? true,
                },
                security: {
                    encryptionEnabled: config.settings?.security?.encryptionEnabled ?? true,
                    auditLogging: config.settings?.security?.auditLogging ?? true,
                    accessControlEnabled: config.settings?.security?.accessControlEnabled ?? true,
                    allowCrossTenantAccess: config.settings?.security?.allowCrossTenantAccess ?? false,
                },
                quotas: {
                    memoryStorageBytes: config.settings?.quotas?.memoryStorageBytes || 1024 * 1024 * 100, // 100MB
                    embeddingGenerations: config.settings?.quotas?.embeddingGenerations || 10000,
                    clusteringOperations: config.settings?.quotas?.clusteringOperations || 1000,
                    analyticsQueries: config.settings?.quotas?.analyticsQueries || 5000,
                }
            },
            contact: {
                email: config.contact?.email,
                organization: config.contact?.organization,
                phone: config.contact?.phone,
            },
            billing: {
                plan: config.billing?.plan || 'free',
                billingContact: config.billing?.billingContact,
                subscriptionId: config.billing?.subscriptionId,
            },
            metadata: {
                region: config.metadata?.region || 'us-east-1',
                industry: config.metadata?.industry,
                complianceRequirements: config.metadata?.complianceRequirements || [],
                customFields: config.metadata?.customFields || {},
            }
        };

        this.tenants.set(tenantId, tenant);

        // Initialize usage tracking
        this.initializeTenantUsage(tenantId);

        // Audit log
        await this.logAuditEvent({
            tenantId,
            agentId: 'system',
            eventType: 'tenant_accessed',
            resource: 'tenant',
            action: 'create',
            result: 'success',
            metadata: { tenantName: tenant.name }
        });

        console.log(`🏢 Created tenant: ${tenant.name} (${tenantId})`);
        return tenant;
    }

    /**
     * Get tenant configuration with security validation
     */
    async getTenant(tenantId: string, context?: TenantIsolationContext): Promise<TenantConfig> {
        const tenant = this.tenants.get(tenantId);
        if (!tenant) {
            throw new Error(`Tenant ${tenantId} not found`);
        }

        // Validate access permissions if context provided
        if (context) {
            await this.validateTenantAccess(context, 'read');
        }

        // Audit log
        if (context) {
            await this.logAuditEvent({
                tenantId,
                agentId: context.agentId,
                userId: context.userId,
                eventType: 'tenant_accessed',
                resource: 'tenant',
                action: 'read',
                result: 'success',
                metadata: {}
            });
        }

        return tenant;
    }

    /**
     * Update tenant configuration
     */
    async updateTenant(tenantId: string, updates: Partial<TenantConfig>, context?: TenantIsolationContext): Promise<TenantConfig> {
        const tenant = this.tenants.get(tenantId);
        if (!tenant) {
            throw new Error(`Tenant ${tenantId} not found`);
        }

        // Validate access permissions
        if (context) {
            await this.validateTenantAccess(context, 'write');
        }

        const updatedTenant: TenantConfig = {
            ...tenant,
            ...updates,
            id: tenantId, // Prevent ID changes
            updatedAt: new Date().toISOString()
        };

        this.tenants.set(tenantId, updatedTenant);

        // Audit log
        if (context) {
            await this.logAuditEvent({
                tenantId,
                agentId: context.agentId,
                userId: context.userId,
                eventType: 'tenant_accessed',
                resource: 'tenant',
                action: 'update',
                result: 'success',
                metadata: { changes: Object.keys(updates) }
            });
        }

        console.log(`🏢 Updated tenant: ${tenantId}`);
        return updatedTenant;
    }

    /**
     * Delete tenant and all associated data
     */
    async deleteTenant(tenantId: string, context?: TenantIsolationContext): Promise<void> {
        const tenant = this.tenants.get(tenantId);
        if (!tenant) {
            throw new Error(`Tenant ${tenantId} not found`);
        }

        // Validate access permissions
        if (context) {
            await this.validateTenantAccess(context, 'delete');
        }

        // Remove tenant
        this.tenants.delete(tenantId);
        this.tenantUsage.delete(tenantId);

        // Clean up audit logs (keep for compliance)
        // Note: In production, you might want to archive instead of delete

        // Audit log
        if (context) {
            await this.logAuditEvent({
                tenantId,
                agentId: context.agentId,
                userId: context.userId,
                eventType: 'tenant_accessed',
                resource: 'tenant',
                action: 'delete',
                result: 'success',
                metadata: { tenantName: tenant.name }
            });
        }

        console.log(`🏢 Deleted tenant: ${tenantId}`);
    }

    /**
     * List all tenants with optional filtering
     */
    async listTenants(filter?: {
        status?: TenantConfig['status'];
        plan?: TenantConfig['billing']['plan'];
        region?: string;
    }): Promise<TenantConfig[]> {
        let tenants = Array.from(this.tenants.values());

        if (filter) {
            if (filter.status) {
                tenants = tenants.filter(t => t.status === filter.status);
            }
            if (filter.plan) {
                tenants = tenants.filter(t => t.billing.plan === filter.plan);
            }
            if (filter.region) {
                tenants = tenants.filter(t => t.metadata.region === filter.region);
            }
        }

        return tenants;
    }

    /**
     * Create isolated tenant context for operations
     */
    createTenantContext(
        tenantId: string,
        agentId: string,
        options: {
            userId?: string;
            sessionId?: string;
            sourceIP?: string;
            userAgent?: string;
            permissions?: string[];
        } = {}
    ): TenantIsolationContext {
        const tenant = this.tenants.get(tenantId);
        if (!tenant) {
            throw new Error(`Tenant ${tenantId} not found`);
        }

        return {
            tenantId,
            agentId,
            userId: options.userId,
            sessionId: options.sessionId,
            requestId: `req_${randomUUID()}`,
            timestamp: new Date().toISOString(),
            sourceIP: options.sourceIP,
            userAgent: options.userAgent,
            permissions: options.permissions || ['read', 'write'],
            restrictions: {
                allowCrossTenantAccess: tenant.settings.security.allowCrossTenantAccess,
                maxMemoryAccess: tenant.settings.maxMemories || 10000,
                rateLimits: {
                    requestsPerMinute: this.getRateLimit(tenant.billing.plan, 'minute'),
                    requestsPerHour: this.getRateLimit(tenant.billing.plan, 'hour')
                }
            }
        };
    }

    /**
     * Validate tenant access with comprehensive security checks
     */
    async validateTenantAccess(context: TenantIsolationContext, operation: 'read' | 'write' | 'delete'): Promise<void> {
        const tenant = this.tenants.get(context.tenantId);
        if (!tenant) {
            await this.logSecurityViolation(context, 'tenant_not_found', `Tenant ${context.tenantId} not found`);
            throw new Error(`Tenant ${context.tenantId} not found`);
        }

        // Check tenant status
        if (tenant.status !== 'active') {
            await this.logSecurityViolation(context, 'tenant_inactive', `Tenant ${context.tenantId} is ${tenant.status}`);
            throw new Error(`Tenant ${context.tenantId} is ${tenant.status}`);
        }

        // Check permissions
        if (!context.permissions.includes(operation)) {
            await this.logSecurityViolation(context, 'insufficient_permissions', `Missing ${operation} permission`);
            throw new Error(`Insufficient permissions for ${operation} operation`);
        }

        // Check access control
        if (tenant.settings.security.accessControlEnabled) {
            // Additional access control logic would go here
            // For now, we assume the context is valid if it reaches this point
        }

        // Rate limiting checks would go here
        await this.checkRateLimits(context);
    }

    /**
     * Get tenant usage statistics
     */
    async getTenantUsage(tenantId: string): Promise<TenantUsage> {
        const usage = this.tenantUsage.get(tenantId);
        if (!usage) {
            throw new Error(`Usage data for tenant ${tenantId} not found`);
        }
        return usage;
    }

    /**
     * Update tenant usage metrics
     */
    async updateTenantUsage(tenantId: string, updates: Partial<TenantUsage['metrics']>): Promise<void> {
        const usage = this.tenantUsage.get(tenantId);
        if (!usage) {
            throw new Error(`Usage data for tenant ${tenantId} not found`);
        }

        // Update metrics
        Object.assign(usage.metrics, updates);
        usage.timestamp = new Date().toISOString();

        // Recalculate quota status
        const tenant = this.tenants.get(tenantId);
        if (tenant) {
            usage.quotaStatus = this.calculateQuotaStatus(usage.metrics, tenant.settings.quotas);
        }

        this.tenantUsage.set(tenantId, usage);

        // Check for quota violations
        await this.checkQuotaViolations(tenantId, usage);
    }

    /**
     * Get tenant audit log
     */
    async getTenantAuditLog(tenantId: string, options: {
        limit?: number;
        eventType?: TenantAuditEvent['eventType'];
        startDate?: string;
        endDate?: string;
    } = {}): Promise<TenantAuditEvent[]> {
        let events = this.auditLog.filter(event => event.tenantId === tenantId);

        if (options.eventType) {
            events = events.filter(event => event.eventType === options.eventType);
        }

        if (options.startDate) {
            events = events.filter(event => event.timestamp >= options.startDate!);
        }

        if (options.endDate) {
            events = events.filter(event => event.timestamp <= options.endDate!);
        }

        // Sort by timestamp (newest first)
        events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        if (options.limit) {
            events = events.slice(0, options.limit);
        }

        return events;
    }

    /**
     * Check if tenant has access to specific feature
     */
    hasTenantFeature(tenantId: string, feature: keyof TenantConfig['settings']['features']): boolean {
        const tenant = this.tenants.get(tenantId);
        return tenant?.settings.features[feature] ?? false;
    }

    /**
     * Encrypt sensitive tenant data
     */
    encryptTenantData(data: string, tenantId: string): string {
        const algorithm = 'aes-256-gcm';
        const key = Buffer.from(this.encryptionKey + tenantId, 'utf8').subarray(0, 32);
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(algorithm, key, iv);

        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        return `${iv.toString('hex')}:${encrypted}`;
    }

    /**
     * Decrypt sensitive tenant data
     */
    decryptTenantData(encryptedData: string, tenantId: string): string {
        const algorithm = 'aes-256-gcm';
        const key = Buffer.from(this.encryptionKey + tenantId, 'utf8').subarray(0, 32);
        const [ivHex, encrypted] = encryptedData.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv(algorithm, key, iv);

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }

    // Private helper methods

    private generateEncryptionKey(): string {
        return crypto.randomBytes(32).toString('hex');
    }

    private initializeTenantUsage(tenantId: string): void {
        const tenant = this.tenants.get(tenantId);
        if (!tenant) return;

        const usage: TenantUsage = {
            tenantId,
            timestamp: new Date().toISOString(),
            metrics: {
                totalMemories: 0,
                totalAgents: 0,
                storageUsedBytes: 0,
                embeddingsGenerated: 0,
                clusteringOperations: 0,
                analyticsQueries: 0,
                activeUsers: 0,
                apiCalls: 0
            },
            quotaStatus: this.calculateQuotaStatus({
                totalMemories: 0,
                totalAgents: 0,
                storageUsedBytes: 0,
                embeddingsGenerated: 0,
                clusteringOperations: 0,
                analyticsQueries: 0,
                activeUsers: 0,
                apiCalls: 0
            }, tenant.settings.quotas)
        };

        this.tenantUsage.set(tenantId, usage);
    }

    private calculateQuotaStatus(metrics: TenantUsage['metrics'], quotas: TenantConfig['settings']['quotas']) {
        return {
            memoryStorage: {
                used: metrics.storageUsedBytes,
                limit: quotas.memoryStorageBytes,
                percentage: Math.round((metrics.storageUsedBytes / quotas.memoryStorageBytes) * 100)
            },
            embeddings: {
                used: metrics.embeddingsGenerated,
                limit: quotas.embeddingGenerations,
                percentage: Math.round((metrics.embeddingsGenerated / quotas.embeddingGenerations) * 100)
            },
            clustering: {
                used: metrics.clusteringOperations,
                limit: quotas.clusteringOperations,
                percentage: Math.round((metrics.clusteringOperations / quotas.clusteringOperations) * 100)
            },
            analytics: {
                used: metrics.analyticsQueries,
                limit: quotas.analyticsQueries,
                percentage: Math.round((metrics.analyticsQueries / quotas.analyticsQueries) * 100)
            }
        };
    }

    private async logAuditEvent(event: Partial<TenantAuditEvent>): Promise<void> {
        const auditEvent: TenantAuditEvent = {
            id: randomUUID(),
            tenantId: event.tenantId!,
            agentId: event.agentId!,
            userId: event.userId,
            eventType: event.eventType!,
            resource: event.resource!,
            action: event.action!,
            result: event.result || 'success',
            reason: event.reason,
            metadata: event.metadata || {},
            timestamp: new Date().toISOString(),
            sourceIP: event.sourceIP,
            userAgent: event.userAgent
        };

        this.auditLog.push(auditEvent);

        // In production, you would persist this to a database
        // and potentially send to external audit systems
    }

    private async logSecurityViolation(context: TenantIsolationContext, violation: string, details: string): Promise<void> {
        await this.logAuditEvent({
            tenantId: context.tenantId,
            agentId: context.agentId,
            userId: context.userId,
            eventType: 'security_violation',
            resource: 'tenant',
            action: violation,
            result: 'blocked',
            reason: details,
            metadata: { context }
        });

        console.warn(`🚨 Security violation for tenant ${context.tenantId}: ${violation} - ${details}`);
    }

    private getRateLimit(plan: TenantConfig['billing']['plan'], period: 'minute' | 'hour'): number {
        const limits = {
            free: { minute: 10, hour: 100 },
            pro: { minute: 100, hour: 1000 },
            enterprise: { minute: 1000, hour: 10000 }
        };

        return limits[plan][period];
    }

    private async checkRateLimits(context: TenantIsolationContext): Promise<void> {
        // Rate limiting implementation would go here
        // This is a placeholder for actual rate limiting logic
        return Promise.resolve();
    }

    private async checkQuotaViolations(tenantId: string, usage: TenantUsage): Promise<void> {
        // Check each quota and log violations
        Object.entries(usage.quotaStatus).forEach(async ([resource, status]) => {
            if (status.percentage >= 100) {
                await this.logAuditEvent({
                    tenantId,
                    agentId: 'system',
                    eventType: 'quota_exceeded',
                    resource,
                    action: 'quota_check',
                    result: 'blocked',
                    reason: `${resource} quota exceeded: ${status.used}/${status.limit}`,
                    metadata: { quotaStatus: status }
                });
            }
        });
    }
}

// Main class and types are already exported above