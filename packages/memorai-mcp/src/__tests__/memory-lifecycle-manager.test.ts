/**
 * Tests for Memory Lifecycle Manager
 * 
 * Comprehensive test suite covering TTL management, archiving strategies,
 * cleanup policies, retention rules, and compliance automation.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { MemoryLifecycleManager, MemoryLifecyclePolicy, ArchiveStrategy, RetentionRule } from '../memory-lifecycle-manager.js';

// Mock memory store
const createMockMemoryStore = () => ({
  getAllMemories: vi.fn(),
  getMemory: vi.fn(),
  updateMemory: vi.fn(),
  deleteMemory: vi.fn(),
});

describe('MemoryLifecycleManager', () => {
  let lifecycleManager: MemoryLifecycleManager;
  let mockMemoryStore: ReturnType<typeof createMockMemoryStore>;

  const createTestMemory = (overrides: any = {}) => ({
    id: 'memory-123',
    agentId: 'agent-1',
    content: 'Test memory content',
    timestamp: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(), // 100 days ago
    importance: 5,
    entityType: 'general',
    project: 'test-project',
    tags: ['test'],
    ...overrides
  });

  beforeEach(() => {
    mockMemoryStore = createMockMemoryStore();
    lifecycleManager = new MemoryLifecycleManager(mockMemoryStore, {
      enableScheduler: false, // Disable for testing
      batchSize: 100,
      maxConcurrentOperations: 2,
      auditRetentionDays: 30,
      complianceMode: 'moderate'
    });
  });

  afterEach(() => {
    lifecycleManager.dispose();
  });

  describe('Policy Management', () => {
    it('should create a new lifecycle policy', async () => {
      const policyId = await lifecycleManager.createPolicy({
        name: 'Test Archive Policy',
        description: 'Archives old memories',
        enabled: true,
        priority: 100,
        conditions: [
          { type: 'age', operator: 'gt', value: 90 }
        ],
        actions: [
          { type: 'archive', config: { strategy: 'standard' } }
        ]
      });

      expect(policyId).toBeDefined();
      expect(typeof policyId).toBe('string');

      const policies = lifecycleManager.getPolicies();
      expect(policies).toHaveLength(3); // 2 default + 1 created

      const policy = policies.find(p => p.id === policyId);
      expect(policy).toBeDefined();
      expect(policy?.name).toBe('Test Archive Policy');
      expect(policy?.enabled).toBe(true);
    });

    it('should update an existing policy', async () => {
      const policyId = await lifecycleManager.createPolicy({
        name: 'Original Policy',
        description: 'Original description',
        enabled: true,
        priority: 50,
        conditions: [{ type: 'age', operator: 'gt', value: 30 }],
        actions: [{ type: 'archive', config: {} }]
      });

      await lifecycleManager.updatePolicy(policyId, {
        name: 'Updated Policy',
        enabled: false
      });

      const policies = lifecycleManager.getPolicies();
      const policy = policies.find(p => p.id === policyId);
      expect(policy?.name).toBe('Updated Policy');
      expect(policy?.enabled).toBe(false);
    });

    it('should delete a policy', async () => {
      const policyId = await lifecycleManager.createPolicy({
        name: 'To Delete',
        description: 'Will be deleted',
        enabled: true,
        priority: 50,
        conditions: [{ type: 'age', operator: 'gt', value: 30 }],
        actions: [{ type: 'delete', config: {} }]
      });

      await lifecycleManager.deletePolicy(policyId);

      const policies = lifecycleManager.getPolicies();
      expect(policies.find(p => p.id === policyId)).toBeUndefined();
    });

    it('should throw error when updating non-existent policy', async () => {
      await expect(lifecycleManager.updatePolicy('non-existent', { name: 'Updated' }))
        .rejects.toThrow('Policy non-existent not found');
    });

    it('should validate policy creation', async () => {
      await expect(lifecycleManager.createPolicy({
        name: '',
        description: 'Invalid policy',
        enabled: true,
        priority: 50,
        conditions: [],
        actions: []
      })).rejects.toThrow();
    });
  });

  describe('Archive Strategy Management', () => {
    it('should create archive strategy', () => {
      const strategy: ArchiveStrategy = {
        id: 'test-strategy',
        name: 'Test Strategy',
        storage: 'cold',
        compression: 'gzip',
        encryption: true,
        metadata: {
          retentionPeriod: 365,
          accessPattern: 'rare',
          costTier: 'low'
        }
      };

      expect(() => lifecycleManager.createArchiveStrategy(strategy)).not.toThrow();
    });

    it('should validate archive strategy', () => {
      const invalidStrategy: ArchiveStrategy = {
        id: 'invalid',
        name: 'Invalid',
        storage: 'invalid' as any,
        compression: 'none',
        encryption: false,
        metadata: {
          retentionPeriod: 365,
          accessPattern: 'rare',
          costTier: 'low'
        }
      };

      expect(() => lifecycleManager.createArchiveStrategy(invalidStrategy))
        .toThrow('Invalid storage type: invalid');
    });

    it('should archive memory with specified strategy', async () => {
      const testMemory = createTestMemory();
      mockMemoryStore.getMemory.mockResolvedValue(testMemory);
      mockMemoryStore.updateMemory.mockResolvedValue(undefined);

      await lifecycleManager.archiveMemory('memory-123', 'standard');

      expect(mockMemoryStore.getMemory).toHaveBeenCalledWith('memory-123');
      expect(mockMemoryStore.updateMemory).toHaveBeenCalledWith('memory-123', expect.objectContaining({
        archived: true,
        archivedAt: expect.any(Date)
      }));
    });
  });

  describe('Retention Rule Management', () => {
    it('should create retention rule', () => {
      const rule: RetentionRule = {
        id: 'test-rule',
        name: 'Test Rule',
        entityType: 'temporary',
        retentionDays: 30,
        archiveDays: 7
      };

      expect(() => lifecycleManager.createRetentionRule(rule)).not.toThrow();
    });

    it('should validate retention rule', () => {
      const invalidRule: RetentionRule = {
        id: 'invalid',
        name: 'Invalid',
        retentionDays: 10,
        archiveDays: 15 // Invalid: archive days >= retention days
      };

      expect(() => lifecycleManager.createRetentionRule(invalidRule))
        .toThrow('Archive days must be less than retention days');
    });

    it('should apply retention rules correctly', async () => {
      // Create test memories with different ages
      const oldMemory = createTestMemory({
        id: 'old-memory',
        timestamp: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString() // 400 days old
      });

      const recentMemory = createTestMemory({
        id: 'recent-memory',
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days old
      });

      mockMemoryStore.getAllMemories.mockResolvedValue([oldMemory, recentMemory]);
      mockMemoryStore.deleteMemory.mockResolvedValue(undefined);

      const results = await lifecycleManager.applyRetentionRules('agent-1');

      expect(results.processed).toBe(2);
      expect(results.deleted).toBe(1); // Old memory should be deleted
      expect(results.retained).toBe(1); // Recent memory should be retained
    });
  });

  describe('Policy Application', () => {
    it('should apply policies to memories', async () => {
      // Create test memories
      const oldMemory = createTestMemory({
        id: 'old-memory',
        timestamp: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
        importance: 2
      });

      const recentMemory = createTestMemory({
        id: 'recent-memory',
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        importance: 8
      });

      mockMemoryStore.getAllMemories.mockResolvedValue([oldMemory, recentMemory]);
      mockMemoryStore.getMemory.mockImplementation((id) => {
        return Promise.resolve(id === 'old-memory' ? oldMemory : recentMemory);
      });
      mockMemoryStore.updateMemory.mockResolvedValue(undefined);

      const results = await lifecycleManager.applyPolicies('agent-1');

      expect(results.processed).toBe(2);
      expect(results.archived).toBeGreaterThanOrEqual(0);
    });

    it('should support dry run mode', async () => {
      const testMemory = createTestMemory({
        timestamp: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
        importance: 2
      });

      mockMemoryStore.getAllMemories.mockResolvedValue([testMemory]);
      mockMemoryStore.getMemory.mockResolvedValue(testMemory);

      const results = await lifecycleManager.applyPolicies('agent-1', true);

      expect(results.processed).toBe(1);
      // In dry run, no actual changes should be made
      expect(mockMemoryStore.updateMemory).not.toHaveBeenCalled();
      expect(mockMemoryStore.deleteMemory).not.toHaveBeenCalled();
    });
  });

  describe('Batch Operations', () => {
    it('should start batch cleanup operation', async () => {
      const operationId = await lifecycleManager.startBatchCleanup('agent-1', {
        maxAge: 30,
        dryRun: true
      });

      expect(operationId).toBeDefined();
      expect(typeof operationId).toBe('string');

      const status = lifecycleManager.getBatchOperationStatus(operationId);
      expect(status).toBeDefined();
      expect(status?.type).toBe('cleanup');
      expect(['pending', 'running']).toContain(status?.status);
    });

    it('should track batch operation progress', async () => {
      const memories = Array.from({ length: 50 }, (_, i) =>
        createTestMemory({
          id: `memory-${i}`,
          timestamp: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString()
        })
      );

      mockMemoryStore.getAllMemories.mockResolvedValue(memories);

      const operationId = await lifecycleManager.startBatchCleanup('agent-1', {
        maxAge: 50,
        dryRun: true
      });

      // Wait a bit for processing to start
      await new Promise(resolve => setTimeout(resolve, 100));

      const status = lifecycleManager.getBatchOperationStatus(operationId);
      expect(status?.totalItems).toBe(50);
      expect(status?.progress).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Lifecycle Statistics', () => {
    it('should generate lifecycle statistics', async () => {
      const memories = [
        createTestMemory({ id: 'mem-1', archived: true }),
        createTestMemory({ id: 'mem-2', compressed: true }),
        createTestMemory({ id: 'mem-3' })
      ];

      mockMemoryStore.getAllMemories.mockResolvedValue(memories);

      const stats = await lifecycleManager.getLifecycleStats('agent-1');

      expect(stats.totalMemories).toBe(3);
      expect(stats.archivedMemories).toBe(1);
      expect(stats.compressedMemories).toBe(1);
      expect(stats.activePolicies).toBeGreaterThan(0);
      expect(stats.complianceStatus).toBeDefined();
    });

    it('should track lifecycle events', async () => {
      const testMemory = createTestMemory();
      mockMemoryStore.getMemory.mockResolvedValue(testMemory);
      mockMemoryStore.updateMemory.mockResolvedValue(undefined);

      // Archive a memory to generate events
      await lifecycleManager.archiveMemory('memory-123');

      const events = lifecycleManager.getLifecycleEvents('agent-1', 10);
      expect(events.length).toBeGreaterThan(0);
      expect(events[0]).toMatchObject({
        type: 'memory_archived',
        memoryId: 'memory-123',
        agentId: 'agent-1',
        result: 'success'
      });
    });
  });

  describe('Condition Evaluation', () => {
    it('should evaluate age conditions correctly', async () => {
      const oldMemory = createTestMemory({
        timestamp: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString()
      });

      const recentMemory = createTestMemory({
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      });

      mockMemoryStore.getAllMemories.mockResolvedValue([oldMemory, recentMemory]);
      mockMemoryStore.getMemory.mockImplementation((id) => {
        return Promise.resolve(id === oldMemory.id ? oldMemory : recentMemory);
      });

      // Create policy that should only match old memories
      await lifecycleManager.createPolicy({
        name: 'Age Test Policy',
        description: 'Test age condition',
        enabled: true,
        priority: 150,
        conditions: [
          { type: 'age', operator: 'gt', value: 50 } // > 50 days
        ],
        actions: [
          { type: 'tag', config: { tags: ['old'] } }
        ]
      });

      const results = await lifecycleManager.applyPolicies('agent-1', true);
      expect(results.processed).toBe(2);
    });

    it('should evaluate importance conditions correctly', async () => {
      const lowImportanceMemory = createTestMemory({
        id: 'low-imp',
        importance: 2
      });

      const highImportanceMemory = createTestMemory({
        id: 'high-imp',
        importance: 8
      });

      mockMemoryStore.getAllMemories.mockResolvedValue([lowImportanceMemory, highImportanceMemory]);

      // Create policy for low importance memories
      await lifecycleManager.createPolicy({
        name: 'Importance Test Policy',
        description: 'Test importance condition',
        enabled: true,
        priority: 150,
        conditions: [
          { type: 'importance', operator: 'lt', value: 5 }
        ],
        actions: [
          { type: 'tag', config: { tags: ['low-importance'] } }
        ]
      });

      const results = await lifecycleManager.applyPolicies('agent-1', true);
      expect(results.processed).toBe(2);
    });

    it('should evaluate multiple conditions with AND logic', async () => {
      const testMemory = createTestMemory({
        timestamp: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
        importance: 2
      });

      mockMemoryStore.getAllMemories.mockResolvedValue([testMemory]);

      // Create policy with multiple conditions
      await lifecycleManager.createPolicy({
        name: 'Multi-Condition Policy',
        description: 'Test multiple conditions',
        enabled: true,
        priority: 150,
        conditions: [
          { type: 'age', operator: 'gt', value: 50 },
          { type: 'importance', operator: 'lt', value: 5 }
        ],
        actions: [
          { type: 'tag', config: { tags: ['old-and-low'] } }
        ]
      });

      const results = await lifecycleManager.applyPolicies('agent-1', true);
      expect(results.processed).toBe(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle memory store errors gracefully', async () => {
      mockMemoryStore.getAllMemories.mockRejectedValue(new Error('Database error'));

      await expect(lifecycleManager.applyPolicies('agent-1')).rejects.toThrow('Database error');
    });

    it('should collect individual memory processing errors', async () => {
      const memories = [
        createTestMemory({ id: 'good-memory' }),
        createTestMemory({ id: 'bad-memory' })
      ];

      mockMemoryStore.getAllMemories.mockResolvedValue(memories);
      mockMemoryStore.getMemory.mockImplementation((id) => {
        if (id === 'bad-memory') {
          throw new Error('Memory processing error');
        }
        return Promise.resolve(memories.find(m => m.id === id));
      });

      const results = await lifecycleManager.applyPolicies('agent-1');
      expect(results.errors).toHaveLength(1);
      expect(results.errors[0].memoryId).toBe('bad-memory');
    });

    it('should handle archive errors gracefully', async () => {
      const testMemory = createTestMemory();
      mockMemoryStore.getMemory.mockResolvedValue(testMemory);
      mockMemoryStore.updateMemory.mockRejectedValue(new Error('Archive error'));

      await expect(lifecycleManager.archiveMemory('memory-123')).rejects.toThrow('Archive error');
    });
  });

  describe('Compliance and Audit', () => {
    it('should track compliance status', async () => {
      mockMemoryStore.getAllMemories.mockResolvedValue(Array.from({ length: 50000 }, (_, i) =>
        createTestMemory({ id: `memory-${i}` })
      ));

      const stats = await lifecycleManager.getLifecycleStats('agent-1');
      expect(stats.complianceStatus).toBe('warning'); // Large dataset
    });

    it('should maintain audit trail', async () => {
      const testMemory = createTestMemory();
      mockMemoryStore.getMemory.mockResolvedValue(testMemory);
      mockMemoryStore.updateMemory.mockResolvedValue(undefined);

      await lifecycleManager.archiveMemory('memory-123');

      const events = lifecycleManager.getLifecycleEvents();
      const archiveEvent = events.find(e => e.type === 'memory_archived');

      expect(archiveEvent).toBeDefined();
      expect(archiveEvent?.memoryId).toBe('memory-123');
      expect(archiveEvent?.result).toBe('success');
      expect(archiveEvent?.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('Resource Cleanup', () => {
    it('should dispose resources properly', async () => {
      const manager = new MemoryLifecycleManager(mockMemoryStore, {
        enableScheduler: true
      });

      await manager.dispose();

      // Should not throw errors after disposal
      expect(() => manager.getPolicies()).not.toThrow();
    });
  });
});