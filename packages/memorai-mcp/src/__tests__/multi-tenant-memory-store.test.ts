/**
 * Multi-Tenant Enhanced Memory Store Test Suite - US-MEM-004
 * Simplified tenant isolation and security validation
 * 
 * Sprint: MemorAI Enhancement Sprint (Aug 27 - Sep 9, 2025)
 * User Story: US-MEM-004 (8 SP) - Multi-tenant Architecture
 */

import { describe, it, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from 'vitest';
import { MultiTenantEnhancedMemoryStore } from '../multi-tenant-memory-store.js';
import { TenantManager, TenantConfig, TenantIsolationContext } from '../tenant-manager.js';

// Simplified mock tenant configuration
const createMockTenant = (): TenantConfig => ({
    id: 'test-tenant-001',
    name: 'Test Enterprise',
    plan: 'enterprise',
    status: 'active',
    createdAt: new Date().toISOString(),
    settings: {
        maxAgents: 50,
        maxMemories: 10000,
        retentionDays: 365,
        security: {
            encryptionEnabled: true,
            auditLogging: true,
            accessControlEnabled: true,
            allowCrossTenantAccess: false
        },
        features: {
            clustering: true,
            analytics: true,
            crossAgentAccess: true,
            realTimeSync: true,
            aiEnhancement: true
        },
        quotas: {
            memoryStorage: { limit: 1073741824, alertThreshold: 0.8 },
            embeddings: { limit: 100000, alertThreshold: 0.8 },
            clustering: { limit: 1000, alertThreshold: 0.8 },
            analytics: { limit: 10000, alertThreshold: 0.8 }
        }
    }
});

const createMockContext = (tenantId: string = 'test-tenant-001', agentId: string = 'test-agent'): TenantIsolationContext => ({
    tenantId,
    agentId,
    userId: 'test-user',
    permissions: ['read', 'write', 'delete'],
    sessionId: 'test-session'
});

describe('MultiTenantEnhancedMemoryStore - Core Functionality', () => {
    let memoryStore: MultiTenantEnhancedMemoryStore;
    let mockTenantManager: TenantManager;

    beforeAll(() => {
        vi.spyOn(console, 'log').mockImplementation(() => { });
        vi.spyOn(console, 'warn').mockImplementation(() => { });
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    beforeEach(() => {
        mockTenantManager = new TenantManager();
        memoryStore = new MultiTenantEnhancedMemoryStore(mockTenantManager);

        // Mock essential tenant manager methods
        vi.spyOn(mockTenantManager, 'getTenant').mockResolvedValue(createMockTenant());
        vi.spyOn(mockTenantManager, 'validateTenantAccess').mockResolvedValue();
        vi.spyOn(mockTenantManager, 'getTenantUsage').mockResolvedValue({
            tenantId: 'test-tenant-001',
            metrics: {
                totalMemories: 0,
                totalAgents: 1,
                storageUsedBytes: 0,
                embeddingsGenerated: 0,
                clusteringOperations: 0,
                analyticsQueries: 0,
                activeUsers: 1,
                apiCalls: 0
            },
            quotaStatus: {
                memoryStorage: { used: 0, limit: 1073741824, percentage: 0 },
                embeddings: { used: 0, limit: 100000, percentage: 0 },
                clustering: { used: 0, limit: 1000, percentage: 0 },
                analytics: { used: 0, limit: 10000, percentage: 0 }
            },
            lastUpdated: new Date().toISOString()
        });
        vi.spyOn(mockTenantManager, 'updateTenantUsage').mockResolvedValue();
        vi.spyOn(mockTenantManager, 'hasTenantFeature').mockReturnValue(true);
        vi.spyOn(mockTenantManager, 'encryptTenantData').mockImplementation((data) => `encrypted:${data}`);
        vi.spyOn(mockTenantManager, 'decryptTenantData').mockImplementation((data) => data.replace('encrypted:', ''));
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Basic Multi-Tenant Operations', () => {
        it('should initialize with tenant manager', () => {
            expect(memoryStore.getTenantManager()).toBeInstanceOf(TenantManager);
        });

        it('should store memory with tenant isolation', async () => {
            const context = createMockContext();
            const content = 'Test memory content for tenant isolation';

            const storedMemory = await memoryStore.store(context, content, {
                importance: 8,
                entityType: 'test_entity'
            });

            expect(storedMemory.tenantId).toBe('test-tenant-001');
            expect(storedMemory.agentId).toBe('test-agent');
            expect(storedMemory.content).toBe(content);
            expect(mockTenantManager.validateTenantAccess).toHaveBeenCalledWith(context, 'write');
        });

        it('should recall memories within tenant boundary', async () => {
            const context = createMockContext();

            // Store some test memories
            await memoryStore.store(context, 'First memory about TypeScript');
            await memoryStore.store(context, 'Second memory about testing');

            const result = await memoryStore.recall(context, 'TypeScript development');

            expect(result.memories).toBeDefined();
            expect(result.tenantBreakdown).toHaveProperty('test-tenant-001');
            expect(mockTenantManager.validateTenantAccess).toHaveBeenCalledWith(context, 'read');
        });

        it('should delete memory with tenant isolation', async () => {
            const context = createMockContext();
            const storedMemory = await memoryStore.store(context, 'Memory to delete');

            const deleted = await memoryStore.forget(context, storedMemory.structuredKey);

            expect(deleted).toBe(true);
            expect(mockTenantManager.validateTenantAccess).toHaveBeenCalledWith(context, 'delete');
        });
    });

    describe('Security and Access Control', () => {
        it('should enforce encryption when enabled', async () => {
            const context = createMockContext();
            const content = 'Sensitive content requiring encryption';

            const storedMemory = await memoryStore.store(context, content);

            expect(mockTenantManager.encryptTenantData).toHaveBeenCalledWith(content, 'test-tenant-001');
            expect(storedMemory.encryptedContent).toBe(`encrypted:${content}`);
            expect(storedMemory.content).toBe(content); // Should return decrypted for client
        });

        it('should validate tenant access before operations', async () => {
            const context = createMockContext();

            await memoryStore.store(context, 'Test content');
            await memoryStore.recall(context, 'test query');

            expect(mockTenantManager.validateTenantAccess).toHaveBeenCalledWith(context, 'write');
            expect(mockTenantManager.validateTenantAccess).toHaveBeenCalledWith(context, 'read');
        });

        it('should enforce memory quotas', async () => {
            const context = createMockContext();

            // Mock usage at quota limit
            vi.spyOn(mockTenantManager, 'getTenantUsage').mockResolvedValueOnce({
                tenantId: 'test-tenant-001',
                metrics: {
                    totalMemories: 10000, // At quota limit
                    totalAgents: 1,
                    storageUsedBytes: 0,
                    embeddingsGenerated: 0,
                    clusteringOperations: 0,
                    analyticsQueries: 0,
                    activeUsers: 1,
                    apiCalls: 0
                },
                quotaStatus: {
                    memoryStorage: { used: 1073741824, limit: 1073741824, percentage: 100 },
                    embeddings: { used: 100000, limit: 100000, percentage: 100 },
                    clustering: { used: 1000, limit: 1000, percentage: 100 },
                    analytics: { used: 10000, limit: 10000, percentage: 100 }
                },
                lastUpdated: new Date().toISOString()
            });

            await expect(
                memoryStore.store(context, 'This should be rejected')
            ).rejects.toThrow('Memory quota exceeded for tenant test-tenant-001');
        });
    });

    describe('Advanced Features with Tenant Isolation', () => {
        it('should provide tenant context', async () => {
            const context = createMockContext();

            await memoryStore.store(context, 'Context memory 1');
            await memoryStore.store(context, 'Context memory 2');

            const contextMemories = await memoryStore.getContext(context, 2);

            expect(contextMemories).toBeInstanceOf(Array);
            expect(contextMemories.every(m => m.tenantId === 'test-tenant-001')).toBe(true);
        });

        it('should perform clustering with tenant isolation', async () => {
            const context = createMockContext();

            await memoryStore.store(context, 'TypeScript development best practices');
            await memoryStore.store(context, 'JavaScript testing frameworks');

            const clusterResult = await memoryStore.clusterMemories(context, {
                includeDetails: true
            });

            expect(clusterResult.clusters).toBeDefined();
            expect(clusterResult.metrics).toBeDefined();
            expect(mockTenantManager.hasTenantFeature).toHaveBeenCalledWith('test-tenant-001', 'clustering');
        });

        it('should provide tenant analytics when feature is enabled', async () => {
            const context = createMockContext();

            // Mock audit log
            vi.spyOn(mockTenantManager, 'getTenantAuditLog').mockResolvedValue([{
                id: '1',
                tenantId: 'test-tenant-001',
                eventType: 'memory_created',
                resource: 'memory-123',
                result: 'success',
                timestamp: new Date().toISOString(),
                userAgent: 'test-agent'
            }]);

            const analytics = await memoryStore.getTenantAnalytics(context);

            expect(analytics.memoryStats).toBeDefined();
            expect(analytics.usage).toBeDefined();
            expect(analytics.auditSummary).toBeDefined();
            expect(analytics.recommendations).toBeInstanceOf(Array);
        });

        it('should enforce feature access for special operations', async () => {
            const context = createMockContext();

            // Mock feature as disabled
            vi.spyOn(mockTenantManager, 'hasTenantFeature').mockReturnValue(false);

            await expect(
                memoryStore.clusterMemories(context)
            ).rejects.toThrow('Clustering feature not enabled for tenant test-tenant-001');

            await expect(
                memoryStore.getTenantAnalytics(context)
            ).rejects.toThrow('Analytics feature not enabled for tenant test-tenant-001');
        });
    });

    describe('Error Handling', () => {
        it('should handle unauthorized access gracefully', async () => {
            const context = createMockContext();

            vi.spyOn(mockTenantManager, 'validateTenantAccess')
                .mockRejectedValue(new Error('Access denied'));

            await expect(
                memoryStore.store(context, 'Unauthorized content')
            ).rejects.toThrow('Access denied');
        });

        it('should handle tenant store initialization failures', async () => {
            const context = createMockContext('nonexistent-tenant');

            vi.spyOn(mockTenantManager, 'getTenant')
                .mockRejectedValue(new Error('Tenant not found'));

            await expect(
                memoryStore.store(context, 'Should fail')
            ).rejects.toThrow('Tenant not found');
        });

        it('should handle empty search results gracefully', async () => {
            const context = createMockContext();

            const result = await memoryStore.recall(context, 'nonexistent query');

            expect(result.memories).toBeInstanceOf(Array);
            expect(result.totalResults).toBeGreaterThanOrEqual(0);
            expect(result.crossTenantMatches).toBe(0);
        });
    });

    describe('Performance and Monitoring', () => {
        it('should track search performance metrics', async () => {
            const context = createMockContext();
            await memoryStore.store(context, 'Performance test memory');

            const result = await memoryStore.recall(context, 'performance');

            expect(result.searchTime).toBeGreaterThan(0);
            expect(typeof result.searchTime).toBe('number');
        });

        it('should update tenant usage after operations', async () => {
            const context = createMockContext();
            const content = 'Content for usage tracking';

            await memoryStore.store(context, content);

            expect(mockTenantManager.updateTenantUsage).toHaveBeenCalledWith('test-tenant-001', {
                totalMemories: 1,
                storageUsedBytes: content.length
            });
        });

        it('should provide tenant breakdown in search results', async () => {
            const context = createMockContext();
            await memoryStore.store(context, 'Breakdown test memory');

            const result = await memoryStore.recall(context, 'breakdown');

            expect(result.tenantBreakdown).toHaveProperty('test-tenant-001');
            expect(result.totalResults).toBeGreaterThanOrEqual(0);
        });
    });
});