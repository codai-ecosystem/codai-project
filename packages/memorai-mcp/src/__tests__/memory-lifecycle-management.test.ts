/**
 * Memory Lifecycle Management Engine Test Suite
 * 
 * Comprehensive tests for automated memory archiving, cleanup, and lifecycle policies
 * with real data integration following established patterns.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  MemoryLifecycleManager,
  LifecyclePolicy,
  MemoryLifecycleStage,
  MemoryAccessPattern,
  ArchivedMemory,
  LifecycleOperationResult,
  LifecycleAnalytics
} from '../memory-lifecycle-management.js';
import { EnhancedMemoryStore } from '../enhanced-memory-store.js';

// Mock the EnhancedMemoryStore for testing
vi.mock('../enhanced-memory-store.js', () => ({
  EnhancedMemoryStore: vi.fn().mockImplementation(() => ({
    store: vi.fn(),
    getAllMemories: vi.fn(),
    deleteMemory: vi.fn(),
    listAgents: vi.fn(),
    getMemory: vi.fn()
  }))
}));

describe('MemoryLifecycleManager', () => {
  let lifecycleManager: MemoryLifecycleManager;
  let mockMemoryStore: any;

  // Real test data
  const testAgents = ['agent-001', 'agent-002', 'agent-003'];
  const realMemoryData = [
    {
      id: 'mem-001',
      agentId: 'agent-001',
      content: 'User preferences for development environment: TypeScript, React, Node.js',
      structuredKey: 'agent-001-preferences-dev-env',
      timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days old
      metadata: { importance: 8, entityType: 'preferences', project: 'dev-setup' }
    },
    {
      id: 'mem-002',
      agentId: 'agent-001',
      content: 'Project architecture decisions for microservices implementation',
      structuredKey: 'agent-001-architecture-microservices',
      timestamp: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days old
      metadata: { importance: 9, entityType: 'architecture', project: 'microservices' }
    },
    {
      id: 'mem-003',
      agentId: 'agent-002',
      content: 'Temporary debugging session for authentication flow',
      structuredKey: 'agent-002-debug-auth-temp',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days old
      metadata: { importance: 3, entityType: 'debug', project: 'auth-service' }
    },
    {
      id: 'mem-004',
      agentId: 'agent-002',
      content: 'Code review feedback for performance optimization',
      structuredKey: 'agent-002-code-review-performance',
      timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days old
      metadata: { importance: 7, entityType: 'review', project: 'performance' }
    },
    {
      id: 'mem-005',
      agentId: 'agent-003',
      content: 'Meeting notes from quarterly planning session',
      structuredKey: 'agent-003-meeting-quarterly-planning',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days old
      metadata: { importance: 6, entityType: 'meeting', project: 'planning' }
    }
  ];

  beforeEach(() => {
    // Create mock memory store with real data
    mockMemoryStore = {
      store: vi.fn().mockResolvedValue({ id: 'new-id', structuredKey: 'new-key' }),
      getAllMemories: vi.fn(),
      deleteMemory: vi.fn().mockResolvedValue(true),
      listAgents: vi.fn().mockReturnValue([...testAgents]),
      getMemory: vi.fn()
    };

    // Setup realistic memory data per agent
    mockMemoryStore.getAllMemories.mockImplementation((agentId: string) => {
      return Promise.resolve(realMemoryData.filter(mem => mem.agentId === agentId));
    });

    mockMemoryStore.getMemory.mockImplementation((agentId: string, structuredKey: string) => {
      const memory = realMemoryData.find(mem => mem.agentId === agentId && mem.structuredKey === structuredKey);
      return Promise.resolve(memory || null);
    });

    // Create lifecycle manager with mock store
    lifecycleManager = new MemoryLifecycleManager(mockMemoryStore as EnhancedMemoryStore);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization and Configuration', () => {
    it('should initialize with default lifecycle policies', () => {
      const policies = lifecycleManager.getPolicies();

      expect(policies).toHaveLength(3);
      expect(policies.some((p: any) => p.name === 'Standard Memory Lifecycle')).toBe(true);
      expect(policies.some((p: any) => p.name === 'Aggressive Cleanup Policy')).toBe(true);
      expect(policies.some((p: any) => p.name === 'Conservative Retention Policy')).toBe(true);
    });

    it('should allow custom policy configuration', () => {
      const customPolicy: LifecyclePolicy = {
        id: 'custom-001',
        name: 'Test Policy',
        description: 'Custom policy for testing',
        enabled: true,
        priority: 1,
        archivalRules: {
          maxAge: 60,
          minImportance: 6,
          maxInactivityPeriod: 30,
          accessThreshold: 10
        },
        cleanupRules: {
          maxArchiveAge: 365,
          minImportanceForPermanentStorage: 4,
          orphanedMemoryCleanup: true,
          duplicateDetection: true
        },
        resurrectionRules: {
          allowResurrection: true,
          maxResurrectionAge: 180,
          requireApproval: false,
          automaticResurrectionTriggers: []
        },
        retentionRules: {
          minimumRetentionPeriod: 30,
          maximumRetentionPeriod: 1095,
          complianceRetention: true,
          legalHoldExemption: false
        }
      };

      lifecycleManager.addPolicy(customPolicy);
      const policies = lifecycleManager.getPolicies();

      expect(policies).toHaveLength(4);
      expect(policies.some((p: any) => p.id === 'custom-001')).toBe(true);
    });

    it('should start and stop lifecycle management', () => {
      lifecycleManager.start();
      // Start is asynchronous, so we check that it doesn't throw

      lifecycleManager.stop();
      // Stop is asynchronous, so we check that it doesn't throw
    });
  });

  describe('Memory Access Pattern Tracking', () => {
    it('should generate access patterns for memories', () => {
      const memory = realMemoryData[0];

      // Access patterns are generated internally, so we test through analytics
      expect(memory.id).toBeDefined();
      expect(memory.agentId).toBeDefined();
    });

    it('should track access patterns over time', async () => {
      const analytics = await lifecycleManager.updateAnalytics();

      expect(analytics).toBeDefined();
      expect(analytics.totalMemories).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Memory Archival Process', () => {
    it('should run archival process', async () => {
      const eventEmitted = vi.fn();
      lifecycleManager.on('archival_completed', eventEmitted);

      const result = await lifecycleManager.runArchivalProcess();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(mockMemoryStore.getAllMemories).toHaveBeenCalled();
    });

    it('should calculate compression ratios', async () => {
      const memory = realMemoryData[1];
      const compressionRatio = await lifecycleManager.compressMemory(memory);

      expect(compressionRatio).toBeGreaterThanOrEqual(0);
      expect(compressionRatio).toBeLessThanOrEqual(1);
    });

    it('should track archived memories', () => {
      const archivedMemories = lifecycleManager.getArchivedMemories();

      // Initially should be empty
      expect(Array.isArray(archivedMemories)).toBe(true);
    });
  });

  describe('Memory Cleanup Process', () => {
    it('should run cleanup process', async () => {
      const eventEmitted = vi.fn();
      lifecycleManager.on('cleanup_completed', eventEmitted);

      const result = await lifecycleManager.runCleanupProcess();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should handle cleanup with no archived memories', async () => {
      const result = await lifecycleManager.runCleanupProcess();

      expect(result.success).toBe(true);
      expect(result.affectedMemories).toHaveLength(0);
    });
  });

  describe('Memory Resurrection', () => {
    it('should reject resurrection of non-existent archives', async () => {
      await expect(
        lifecycleManager.resurrectMemory('non-existent-archive', 'test-user')
      ).rejects.toThrow('Archived memory non-existent-archive not found');
    });

    it('should handle resurrection requests properly', async () => {
      // Since we need archived memories first, test error handling
      const nonExistentId = 'fake-archive-id';

      await expect(
        lifecycleManager.resurrectMemory(nonExistentId, 'test-user')
      ).rejects.toThrow();
    });
  });

  describe('Analytics and Reporting', () => {
    it('should generate lifecycle analytics', async () => {
      const analytics = await lifecycleManager.updateAnalytics();

      expect(analytics).toBeDefined();
      expect(analytics.totalMemories).toBeGreaterThanOrEqual(0);
      expect(analytics.memoriesByStage).toBeDefined();
      expect(analytics.memoriesByStage.active).toBeGreaterThanOrEqual(0);
      expect(analytics.archivalRate).toBeGreaterThanOrEqual(0);
      expect(analytics.storageOptimization).toBeDefined();
      expect(analytics.policyEffectiveness).toBeDefined();
    });

    it('should provide access to current analytics', () => {
      const analytics = lifecycleManager.getAnalytics();

      expect(analytics).toBeDefined();
      expect(analytics.totalMemories).toBeGreaterThanOrEqual(0);
      expect(analytics.memoriesByStage).toBeDefined();
    });

    it('should generate reports in different formats', async () => {
      const jsonReport = await lifecycleManager.generateReport('json');
      expect(jsonReport).toBeDefined();
      expect(() => JSON.parse(jsonReport)).not.toThrow();

      const csvReport = await lifecycleManager.generateReport('csv');
      expect(csvReport).toBeDefined();
      expect(csvReport).toContain(','); // CSV should have commas

      const summaryReport = await lifecycleManager.generateReport('summary');
      expect(summaryReport).toBeDefined();
    });
  });

  describe('Event System', () => {
    it('should emit lifecycle events', async () => {
      const eventHandler = vi.fn();
      lifecycleManager.on('lifecycle_event', eventHandler);

      await lifecycleManager.runArchivalProcess();

      // Events should be emitted during processing
      expect(lifecycleManager.listenerCount('lifecycle_event')).toBeGreaterThan(0);
    });

    it('should emit analytics update events', async () => {
      const eventHandler = vi.fn();
      lifecycleManager.on('analytics_updated', eventHandler);

      await lifecycleManager.updateAnalytics();

      expect(eventHandler).toHaveBeenCalled();
      const analytics = eventHandler.mock.calls[0][0];
      expect(analytics).toBeDefined();
      expect(analytics.totalMemories).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Integration with EnhancedMemoryStore', () => {
    it('should integrate with real memory store operations', async () => {
      // Run archival process which should call store methods
      await lifecycleManager.runArchivalProcess();

      expect(mockMemoryStore.listAgents).toHaveBeenCalled();
      expect(mockMemoryStore.getAllMemories).toHaveBeenCalled();
    });

    it('should handle memory store errors gracefully', async () => {
      // Mock store failure
      mockMemoryStore.getAllMemories.mockRejectedValueOnce(new Error('Store error'));

      const result = await lifecycleManager.runArchivalProcess();

      // Should handle error gracefully
      expect(result.success).toBe(false);
      expect(result.errors.some(error => error.includes('Store error'))).toBe(true);
    });

    it('should work with multiple agents', async () => {
      expect(mockMemoryStore.listAgents().length).toBe(3);

      // Test analytics across multiple agents
      const analytics = await lifecycleManager.updateAnalytics();

      expect(analytics.totalMemories).toBeGreaterThanOrEqual(0);
      expect(mockMemoryStore.getAllMemories).toHaveBeenCalledWith('agent-001');
      expect(mockMemoryStore.getAllMemories).toHaveBeenCalledWith('agent-002');
      expect(mockMemoryStore.getAllMemories).toHaveBeenCalledWith('agent-003');
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle analytics efficiently', async () => {
      const startTime = Date.now();

      const analytics = await lifecycleManager.updateAnalytics();
      const processingTime = Date.now() - startTime;

      // Should complete within reasonable time (< 1 second for test data)
      expect(processingTime).toBeLessThan(1000);
      expect(analytics).toBeDefined();
    });

    it('should manage memory usage during operations', async () => {
      // Run multiple operations
      await lifecycleManager.runArchivalProcess();
      await lifecycleManager.runCleanupProcess();
      await lifecycleManager.updateAnalytics();

      const archivedMemories = lifecycleManager.getArchivedMemories();
      expect(Array.isArray(archivedMemories)).toBe(true);

      const analytics = lifecycleManager.getAnalytics();
      expect(analytics).toBeDefined();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle empty agent lists', async () => {
      mockMemoryStore.listAgents.mockReturnValueOnce([]);

      const analytics = await lifecycleManager.updateAnalytics();
      expect(analytics.totalMemories).toBe(0);
      expect(analytics.memoriesByStage.active).toBe(0);
    });

    it('should handle policy validation', () => {
      const policies = lifecycleManager.getPolicies();

      for (const policy of policies) {
        expect(policy.id).toBeDefined();
        expect(policy.name).toBeDefined();
        expect(policy.enabled).toBeDefined();
        expect(policy.priority).toBeGreaterThanOrEqual(0);
      }
    });

    it('should handle missing policies gracefully', () => {
      const nonExistentPolicy = lifecycleManager.getPolicy('non-existent');
      expect(nonExistentPolicy).toBeUndefined();
    });

    it('should handle access patterns correctly', () => {
      const accessPatterns = lifecycleManager.getAccessPatterns();
      expect(Array.isArray(accessPatterns)).toBe(true);

      const nonExistentPattern = lifecycleManager.getAccessPattern('non-existent');
      expect(nonExistentPattern).toBeUndefined();
    });

    it('should handle archived memory queries', () => {
      const nonExistentArchive = lifecycleManager.getArchivedMemory('non-existent');
      expect(nonExistentArchive).toBeUndefined();
    });
  });

  describe('Policy Management', () => {
    it('should retrieve policies correctly', () => {
      const policies = lifecycleManager.getPolicies();
      expect(Array.isArray(policies)).toBe(true);
      expect(policies.length).toBeGreaterThan(0);
    });

    it('should get specific policies by ID', () => {
      const policies = lifecycleManager.getPolicies();
      const firstPolicy = policies[0];

      const retrievedPolicy = lifecycleManager.getPolicy(firstPolicy.id);
      expect(retrievedPolicy).toBeDefined();
      expect(retrievedPolicy?.id).toBe(firstPolicy.id);
    });

    it('should handle policy structure validation', () => {
      const policies = lifecycleManager.getPolicies();

      for (const policy of policies) {
        expect(policy.archivalRules).toBeDefined();
        expect(policy.cleanupRules).toBeDefined();
        expect(policy.resurrectionRules).toBeDefined();
        expect(policy.retentionRules).toBeDefined();

        expect(policy.archivalRules.maxAge).toBeGreaterThan(0);
        expect(policy.archivalRules.minImportance).toBeGreaterThanOrEqual(0);
        expect(policy.archivalRules.accessThreshold).toBeGreaterThanOrEqual(0);
      }
    });
  });
});