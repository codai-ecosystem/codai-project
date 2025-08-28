/**
 * Multi-Tenant Enhanced Memory Store - US-MEM-004 Implementation
 * Tenant-aware memory management with complete data isolation
 * 
 * Sprint: MemorAI Enhancement Sprint (Aug 27 - Sep 9, 2025)
 * User Story: US-MEM-004 (8 SP)
 */

import { randomUUID } from 'node:crypto';
import { EnhancedMemoryStore } from './enhanced-memory-store.js';
import { TenantManager, TenantConfig, TenantIsolationContext, TenantAuditEvent } from './tenant-manager.js';
import { ClusteringOptions, ClusteringResult } from './memory-clustering-engine.js';

interface TenantMemoryMetadata {
    tenantId: string;
    importance?: number;
    entityType?: string;
    priority?: string;
    project?: string;
    session?: string;
    tags?: string[];
    [key: string]: any;
}

interface TenantStoredMemory {
    id: string;
    tenantId: string;
    agentId: string;
    content: string;
    metadata: TenantMemoryMetadata;
    structuredKey: string;
    timestamp: string;
    embeddings?: number[];
    crossAgent?: boolean;
    sourceAgent?: string;
    encryptedContent?: string;
    accessHistory: {
        lastAccessed: string;
        accessCount: number;
        lastModified: string;
    };
}

interface TenantSearchOptions {
    limit?: number;
    minImportance?: number;
    project?: string;
    session?: string;
    includeOtherAgents?: boolean;
    crossTenantAccess?: boolean;
    tenantIds?: string[];
}

interface MultiTenantSearchResult {
    memories: TenantStoredMemory[];
    tenantBreakdown: {
        [tenantId: string]: {
            count: number;
            avgRelevance: number;
            memories: TenantStoredMemory[];
        };
    };
    crossTenantMatches: number;
    totalResults: number;
    searchTime: number;
}

export class MultiTenantEnhancedMemoryStore {
    private tenantStores: Map<string, EnhancedMemoryStore> = new Map();
    private tenantManager: TenantManager;
    private globalMemoryIndex: Map<string, { tenantId: string; memoryId: string }> = new Map();

    constructor(tenantManager?: TenantManager) {
        this.tenantManager = tenantManager || new TenantManager();
        console.log('🏢 Multi-Tenant Enhanced Memory Store initialized');
    }

    /**
     * Initialize tenant-specific memory store
     */
    private async initializeTenantStore(tenantId: string): Promise<EnhancedMemoryStore> {
        if (this.tenantStores.has(tenantId)) {
            return this.tenantStores.get(tenantId)!;
        }

        // Get tenant configuration
        const tenant = await this.tenantManager.getTenant(tenantId);

        // Create tenant-specific memory store with isolated configuration
        const azureConfig = {
            apiKey: process.env.AZURE_OPENAI_API_KEY,
            endpoint: process.env.AZURE_OPENAI_ENDPOINT,
            deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
            apiVersion: process.env.AZURE_OPENAI_API_VERSION
        };

        const tenantStore = new EnhancedMemoryStore(azureConfig);
        this.tenantStores.set(tenantId, tenantStore);

        console.log(`🏢 Initialized memory store for tenant: ${tenant.name} (${tenantId})`);
        return tenantStore;
    }

    /**
     * Store memory with tenant isolation
     */
    async store(
        context: TenantIsolationContext,
        content: string,
        metadata: Partial<TenantMemoryMetadata> = {}
    ): Promise<TenantStoredMemory> {
        // Validate tenant access
        await this.tenantManager.validateTenantAccess(context, 'write');

        // Get tenant configuration
        const tenant = await this.tenantManager.getTenant(context.tenantId, context);

        // Check quotas
        const usage = await this.tenantManager.getTenantUsage(context.tenantId);
        if (usage.metrics.totalMemories >= tenant.settings.maxMemories!) {
            throw new Error(`Memory quota exceeded for tenant ${context.tenantId}`);
        }

        // Initialize tenant store if needed
        const tenantStore = await this.initializeTenantStore(context.tenantId);

        // Prepare tenant-aware metadata
        const tenantMetadata: TenantMemoryMetadata = {
            ...metadata,
            tenantId: context.tenantId
        };

        // Encrypt content if required
        let finalContent = content;
        let encryptedContent: string | undefined;

        if (tenant.settings.security.encryptionEnabled) {
            encryptedContent = this.tenantManager.encryptTenantData(content, context.tenantId);
            // Store encrypted version in memory store
            finalContent = encryptedContent;
        }

        // Store in tenant-specific memory store
        const storedMemory = await tenantStore.store(context.agentId, finalContent, tenantMetadata);

        // Create tenant-aware memory record
        const tenantMemory: TenantStoredMemory = {
            id: storedMemory.id,
            tenantId: context.tenantId,
            agentId: context.agentId,
            content: tenant.settings.security.encryptionEnabled ? content : finalContent, // Return decrypted for client
            metadata: tenantMetadata,
            structuredKey: storedMemory.structuredKey,
            timestamp: storedMemory.timestamp,
            embeddings: storedMemory.embeddings,
            crossAgent: storedMemory.crossAgent,
            sourceAgent: storedMemory.sourceAgent,
            encryptedContent,
            accessHistory: {
                lastAccessed: new Date().toISOString(),
                accessCount: 1,
                lastModified: new Date().toISOString()
            }
        };

        // Update global memory index
        this.globalMemoryIndex.set(storedMemory.id, {
            tenantId: context.tenantId,
            memoryId: storedMemory.id
        });

        // Update tenant usage
        await this.tenantManager.updateTenantUsage(context.tenantId, {
            totalMemories: usage.metrics.totalMemories + 1,
            storageUsedBytes: usage.metrics.storageUsedBytes + content.length
        });

        // Audit log
        await this.logMemoryAudit(context, 'memory_created', storedMemory.id, 'success');

        console.log(`🏢 Stored memory for tenant ${context.tenantId}: ${storedMemory.id}`);
        return tenantMemory;
    }

    /**
     * Search memories with tenant isolation
     */
    async recall(
        context: TenantIsolationContext,
        query: string,
        options: TenantSearchOptions = {}
    ): Promise<MultiTenantSearchResult> {
        const startTime = Date.now();

        // Validate tenant access
        await this.tenantManager.validateTenantAccess(context, 'read');

        const tenant = await this.tenantManager.getTenant(context.tenantId, context);
        const tenantStore = await this.initializeTenantStore(context.tenantId);

        // Primary tenant search
        const primaryResults = await tenantStore.recall(
            context.agentId,
            query,
            {
                limit: options.limit,
                minImportance: options.minImportance,
                project: options.project,
                session: options.session,
                includeOtherAgents: options.includeOtherAgents
            }
        );

        let allMemories: TenantStoredMemory[] = [];
        let tenantBreakdown: MultiTenantSearchResult['tenantBreakdown'] = {};
        let crossTenantMatches = 0;

        // Convert primary results to tenant memories
        const primaryTenantMemories = await Promise.all(
            primaryResults.map(async (memory) => {
                const tenantMemory = await this.convertToTenantMemory(memory, context.tenantId, tenant);
                await this.updateMemoryAccess(tenantMemory.id, context.tenantId);
                return tenantMemory;
            })
        );

        allMemories.push(...primaryTenantMemories);

        // Add to tenant breakdown
        tenantBreakdown[context.tenantId] = {
            count: primaryTenantMemories.length,
            avgRelevance: primaryTenantMemories.reduce((sum, m) => sum + (m.metadata.importance || 5), 0) / primaryTenantMemories.length || 0,
            memories: primaryTenantMemories
        };

        // Cross-tenant search if enabled and requested
        if (options.crossTenantAccess && tenant.settings.security.allowCrossTenantAccess) {
            const targetTenantIds = options.tenantIds || await this.getAccessibleTenants(context.tenantId);

            for (const targetTenantId of targetTenantIds) {
                if (targetTenantId === context.tenantId) continue;

                try {
                    const targetTenant = await this.tenantManager.getTenant(targetTenantId);
                    if (targetTenant.settings.security.allowCrossTenantAccess) {
                        const targetStore = await this.initializeTenantStore(targetTenantId);
                        const targetResults = await targetStore.recall(
                            'cross_tenant_agent',
                            query,
                            { limit: Math.floor((options.limit || 10) / 2) }
                        );

                        const targetTenantMemories = await Promise.all(
                            targetResults.map(memory => this.convertToTenantMemory(memory, targetTenantId, targetTenant))
                        );

                        allMemories.push(...targetTenantMemories);
                        crossTenantMatches += targetTenantMemories.length;

                        tenantBreakdown[targetTenantId] = {
                            count: targetTenantMemories.length,
                            avgRelevance: targetTenantMemories.reduce((sum, m) => sum + (m.metadata.importance || 5), 0) / targetTenantMemories.length || 0,
                            memories: targetTenantMemories
                        };
                    }
                } catch (error) {
                    console.warn(`Failed to search tenant ${targetTenantId}:`, error);
                }
            }
        }

        // Sort all memories by relevance
        allMemories.sort((a, b) => (b.metadata.importance || 5) - (a.metadata.importance || 5));

        // Apply final limit
        if (options.limit) {
            allMemories = allMemories.slice(0, options.limit);
        }

        const searchTime = Date.now() - startTime;

        // Audit log
        await this.logMemoryAudit(context, 'memory_accessed', `search:${query}`, 'success', {
            resultCount: allMemories.length,
            crossTenantMatches,
            searchTime
        });

        const result: MultiTenantSearchResult = {
            memories: allMemories,
            tenantBreakdown,
            crossTenantMatches,
            totalResults: allMemories.length,
            searchTime
        };

        console.log(`🏢 Multi-tenant search completed: ${result.totalResults} results in ${searchTime}ms`);
        return result;
    }

    /**
     * Delete memory with tenant isolation
     */
    async forget(
        context: TenantIsolationContext,
        structuredKey: string
    ): Promise<boolean> {
        // Validate tenant access
        await this.tenantManager.validateTenantAccess(context, 'delete');

        const tenantStore = await this.initializeTenantStore(context.tenantId);
        const result = await tenantStore.forget(context.agentId, structuredKey);

        if (result) {
            // Update tenant usage
            const usage = await this.tenantManager.getTenantUsage(context.tenantId);
            await this.tenantManager.updateTenantUsage(context.tenantId, {
                totalMemories: Math.max(0, usage.metrics.totalMemories - 1)
            });

            // Remove from global index
            const memoryId = structuredKey.split('-').pop();
            if (memoryId) {
                this.globalMemoryIndex.delete(memoryId);
            }

            // Audit log
            await this.logMemoryAudit(context, 'memory_deleted', structuredKey, 'success');

            console.log(`🏢 Deleted memory for tenant ${context.tenantId}: ${structuredKey}`);
        }

        return result;
    }

    /**
     * Get tenant context for memory operations
     */
    async getContext(
        context: TenantIsolationContext,
        contextSize: number = 5
    ): Promise<TenantStoredMemory[]> {
        // Validate tenant access
        await this.tenantManager.validateTenantAccess(context, 'read');

        const tenantStore = await this.initializeTenantStore(context.tenantId);
        const memories = await tenantStore.getContext(context.agentId, contextSize);
        const tenant = await this.tenantManager.getTenant(context.tenantId, context);

        return Promise.all(
            memories.map(memory => this.convertToTenantMemory(memory, context.tenantId, tenant))
        );
    }

    /**
     * Cluster memories with tenant isolation
     */
    async clusterMemories(
        context: TenantIsolationContext,
        options: ClusteringOptions = {}
    ): Promise<ClusteringResult> {
        // Validate tenant access and feature availability
        await this.tenantManager.validateTenantAccess(context, 'read');

        if (!this.tenantManager.hasTenantFeature(context.tenantId, 'clustering')) {
            throw new Error(`Clustering feature not enabled for tenant ${context.tenantId}`);
        }

        const tenantStore = await this.initializeTenantStore(context.tenantId);
        const result = await tenantStore.clusterMemories(context.agentId, options);

        // Update tenant usage
        const usage = await this.tenantManager.getTenantUsage(context.tenantId);
        await this.tenantManager.updateTenantUsage(context.tenantId, {
            clusteringOperations: usage.metrics.clusteringOperations + 1
        });

        // Audit log
        await this.logMemoryAudit(context, 'memory_accessed', 'clustering', 'success', {
            clustersFound: result.clusters.length,
            silhouetteScore: result.metrics.silhouetteScore
        });

        console.log(`🏢 Clustering completed for tenant ${context.tenantId}: ${result.clusters.length} clusters`);
        return result;
    }

    /**
     * Get comprehensive tenant analytics
     */
    async getTenantAnalytics(context: TenantIsolationContext): Promise<{
        memoryStats: any;
        usage: any;
        auditSummary: any;
        recommendations: string[];
    }> {
        // Validate tenant access and feature availability
        await this.tenantManager.validateTenantAccess(context, 'read');

        if (!this.tenantManager.hasTenantFeature(context.tenantId, 'analytics')) {
            throw new Error(`Analytics feature not enabled for tenant ${context.tenantId}`);
        }

        const tenantStore = await this.initializeTenantStore(context.tenantId);

        // Get memory statistics
        const memoryCount = tenantStore.getMemoryCount(context.agentId);
        const allMemories = tenantStore.getAllMemories();
        const tenantMemories = allMemories.get(context.agentId) || [];

        // Get usage data
        const usage = await this.tenantManager.getTenantUsage(context.tenantId);

        // Get recent audit events
        const auditEvents = await this.tenantManager.getTenantAuditLog(context.tenantId, { limit: 100 });

        // Generate recommendations
        const recommendations = this.generateTenantRecommendations(usage, tenantMemories.length);

        // Update analytics usage
        await this.tenantManager.updateTenantUsage(context.tenantId, {
            analyticsQueries: usage.metrics.analyticsQueries + 1
        });

        return {
            memoryStats: {
                totalMemories: memoryCount,
                averageImportance: tenantMemories.reduce((sum, m) => sum + (m.metadata.importance || 5), 0) / tenantMemories.length || 0,
                oldestMemory: tenantMemories.length > 0 ? Math.min(...tenantMemories.map(m => new Date(m.timestamp).getTime())) : null,
                newestMemory: tenantMemories.length > 0 ? Math.max(...tenantMemories.map(m => new Date(m.timestamp).getTime())) : null
            },
            usage,
            auditSummary: {
                totalEvents: auditEvents.length,
                recentEvents: auditEvents.slice(0, 10),
                eventTypes: this.summarizeEventTypes(auditEvents)
            },
            recommendations
        };
    }

    /**
     * Migrate tenant data (for upgrades or tenant transfers)
     */
    async migrateTenant(
        sourceTenantId: string,
        targetTenantId: string,
        adminContext: TenantIsolationContext
    ): Promise<{ migrated: number; errors: string[] }> {
        // This would be used for tenant data migration scenarios
        // Implementation would depend on specific migration requirements

        console.log(`🏢 Migration requested: ${sourceTenantId} -> ${targetTenantId}`);

        // Placeholder for migration logic
        return { migrated: 0, errors: [] };
    }

    // Private helper methods

    private async convertToTenantMemory(
        memory: any,
        tenantId: string,
        tenant: TenantConfig
    ): Promise<TenantStoredMemory> {
        let content = memory.content;

        // Decrypt if necessary
        if (tenant.settings.security.encryptionEnabled && memory.encryptedContent) {
            try {
                content = this.tenantManager.decryptTenantData(memory.encryptedContent, tenantId);
            } catch (error) {
                console.warn(`Failed to decrypt memory for tenant ${tenantId}:`, error);
            }
        }

        return {
            id: memory.id,
            tenantId,
            agentId: memory.agentId,
            content,
            metadata: { ...memory.metadata, tenantId },
            structuredKey: memory.structuredKey,
            timestamp: memory.timestamp,
            embeddings: memory.embeddings,
            crossAgent: memory.crossAgent,
            sourceAgent: memory.sourceAgent,
            encryptedContent: memory.encryptedContent,
            accessHistory: {
                lastAccessed: new Date().toISOString(),
                accessCount: 1,
                lastModified: memory.timestamp
            }
        };
    }

    private async updateMemoryAccess(memoryId: string, tenantId: string): Promise<void> {
        // Update access tracking (would be persisted in production)
        const globalRef = this.globalMemoryIndex.get(memoryId);
        if (globalRef && globalRef.tenantId === tenantId) {
            // Update access history
            console.log(`📊 Updated access for memory ${memoryId} in tenant ${tenantId}`);
        }
    }

    private async getAccessibleTenants(tenantId: string): Promise<string[]> {
        // In production, this would check tenant relationships and permissions
        // For now, return empty array (no cross-tenant access by default)
        return [];
    }

    private async logMemoryAudit(
        context: TenantIsolationContext,
        eventType: TenantAuditEvent['eventType'],
        resource: string,
        result: 'success' | 'failure' | 'blocked',
        metadata: Record<string, any> = {}
    ): Promise<void> {
        // This would integrate with the tenant manager's audit system
        // For now, just log to console
        console.log(`📋 Audit: ${context.tenantId} - ${eventType} - ${resource} - ${result}`);
    }

    private generateTenantRecommendations(usage: any, memoryCount: number): string[] {
        const recommendations: string[] = [];

        // Quota-based recommendations
        Object.entries(usage.quotaStatus).forEach(([resource, status]: [string, any]) => {
            if (status.percentage > 80) {
                recommendations.push(`${resource} usage is at ${status.percentage}% - consider upgrading plan or optimizing usage`);
            }
        });

        // Memory-based recommendations
        if (memoryCount > 1000) {
            recommendations.push('Consider using memory clustering to organize large memory collections');
        }

        if (memoryCount < 10) {
            recommendations.push('Start building your memory collection with important information');
        }

        return recommendations.length > 0 ? recommendations : ['Your tenant is running optimally!'];
    }

    private summarizeEventTypes(events: TenantAuditEvent[]): Record<string, number> {
        return events.reduce((summary, event) => {
            summary[event.eventType] = (summary[event.eventType] || 0) + 1;
            return summary;
        }, {} as Record<string, number>);
    }

    /**
     * Get tenant manager instance
     */
    getTenantManager(): TenantManager {
        return this.tenantManager;
    }

    /**
     * Get all tenant store instances (for debugging)
     */
    getAllTenantStores(): Map<string, EnhancedMemoryStore> {
        return this.tenantStores;
    }

    /**
     * Get global memory index (for debugging)
     */
    getGlobalMemoryIndex(): Map<string, { tenantId: string; memoryId: string }> {
        return this.globalMemoryIndex;
    }
}