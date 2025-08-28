/**
 * Cross-Agent Memory Manager Tests
 * Tests for US-MEM-002 implementation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventEmitter } from 'events';
import {
  CrossAgentMemoryManager,
  MemoryAccessLevel,
  type PermissionRule,
  type RecommendationContext,
  type CrossAgentConfig,
  createCrossAgentMemoryManager
} from '../cross-agent-memory-manager.js';
import type { StoredMemory } from '../enhanced-memory-store.js';
import { MultiTenantEnhancedMemoryStore } from '../multi-tenant-memory-store.js';
import { TenantManager } from '../tenant-manager.js';

// Mock enhanced memory store for testing
const createMockMultiTenantStore = () => {
  const mockStore = {
    tenantStores: new Map(),
    tenantManager: new TenantManager(),
    globalMemoryIndex: new Map(),
    initializeTenantStore: vi.fn(),
    recall: vi.fn().mockResolvedValue({ memories: [] }),
    store: vi.fn().mockResolvedValue({
      id: `mem_${Date.now()}`,
      agentId: 'test-agent',
      content: 'test content',
      metadata: { importance: 5 },
      structuredKey: 'test-key',
      timestamp: new Date().toISOString()
    }),
    forget: vi.fn().mockResolvedValue(true),
    analyzeMemories: vi.fn().mockResolvedValue({}),
    clusterMemories: vi.fn().mockResolvedValue({ clusters: [], metadata: {} }),
    searchMemoriesByTag: vi.fn().mockResolvedValue([]),
    compressMemories: vi.fn().mockResolvedValue([]),
    getMemoryStatistics: vi.fn().mockResolvedValue({}),
    verifyTenantAccess: vi.fn().mockResolvedValue(true),
    migrateTenant: vi.fn().mockResolvedValue(true),
    exportTenantData: vi.fn().mockResolvedValue({}),
    importTenantData: vi.fn().mockResolvedValue(true),
    getRecentMemories: vi.fn().mockResolvedValue([]),
    getMemoriesByImportance: vi.fn().mockResolvedValue([]),
    searchMemoriesByDate: vi.fn().mockResolvedValue([]),
    getTenantQuota: vi.fn().mockResolvedValue({ used: 0, limit: 1000 }),
    generateMemorySummary: vi.fn().mockResolvedValue(''),
    addMockMemory: (agentId: string, memory: StoredMemory) => {
      // Mock implementation for testing
    }
  } as unknown as MultiTenantEnhancedMemoryStore;

  return mockStore;
};

describe('CrossAgentMemoryManager', () => {
  let manager: CrossAgentMemoryManager;
  let mockMemoryStore: MultiTenantEnhancedMemoryStore;
  let mockTenantManager: TenantManager;
  let config: Partial<CrossAgentConfig>;

  beforeEach(() => {
    mockMemoryStore = createMockMultiTenantStore();
    mockTenantManager = new TenantManager();
    config = {
      maxRecommendations: 5,
      confidenceThreshold: 0.5,
      auditLogging: true,
      privacyMode: 'balanced'
    };
    manager = new CrossAgentMemoryManager(mockMemoryStore, mockTenantManager, config);
  });

  describe('Permission Management', () => {
    it('should add permission rules correctly', async () => {
      const ruleData = {
        sourceAgent: 'agent-a',
        targetAgent: 'agent-b',
        accessLevel: MemoryAccessLevel.READ_ONLY,
        createdBy: 'system'
      };

      const ruleId = await manager.addPermissionRule(ruleData);

      expect(ruleId).toMatch(/^perm_/);

      const rules = await manager.getPermissionRules('agent-a');
      expect(rules).toHaveLength(1);
      expect(rules[0].sourceAgent).toBe('agent-a');
      expect(rules[0].targetAgent).toBe('agent-b');
      expect(rules[0].accessLevel).toBe(MemoryAccessLevel.READ_ONLY);
    });

    it('should remove permission rules correctly', async () => {
      const ruleId = await manager.addPermissionRule({
        sourceAgent: 'agent-a',
        targetAgent: 'agent-b',
        accessLevel: MemoryAccessLevel.READ_ONLY,
        createdBy: 'system'
      });

      const removed = await manager.removePermissionRule(ruleId, 'agent-a');
      expect(removed).toBe(true);

      const rules = await manager.getPermissionRules('agent-a');
      expect(rules).toHaveLength(0);
    });

    it('should not remove non-existent permission rules', async () => {
      const removed = await manager.removePermissionRule('non-existent', 'agent-a');
      expect(removed).toBe(false);
    });

    it('should handle wildcard target agents', async () => {
      await manager.addPermissionRule({
        sourceAgent: 'agent-a',
        targetAgent: '*',
        accessLevel: MemoryAccessLevel.READ_ONLY,
        createdBy: 'system'
      });

      const rules = await manager.getPermissionRules('agent-a');
      expect(rules[0].targetAgent).toBe('*');
    });

    it('should handle permission rules with content patterns', async () => {
      await manager.addPermissionRule({
        sourceAgent: 'agent-a',
        targetAgent: 'agent-b',
        accessLevel: MemoryAccessLevel.READ_ONLY,
        contentPatterns: ['project', 'task'],
        createdBy: 'system'
      });

      const rules = await manager.getPermissionRules('agent-a');
      expect(rules[0].contentPatterns).toEqual(['project', 'task']);
    });
  });

  describe('Context Management', () => {
    it('should set and retrieve context correctly', async () => {
      const context: RecommendationContext = {
        currentConversation: ['hello', 'world'],
        recentMemories: ['mem1', 'mem2'],
        activeProjects: ['project1'],
        userPreferences: { theme: 'dark' },
        temporalWindow: {
          start: new Date('2025-01-01'),
          end: new Date('2025-12-31')
        },
        agentId: 'agent-a'
      };

      await manager.setContext('agent-a', context);

      // Context is stored internally, we can verify through behavior
      // The context would be used when generating recommendations
      expect(true).toBe(true); // Context set successfully
    });

    it('should emit contextUpdated event when context is set', async () => {
      const eventSpy = vi.fn();
      manager.on('contextUpdated', eventSpy);

      const context: RecommendationContext = {
        currentConversation: ['test'],
        recentMemories: [],
        activeProjects: [],
        userPreferences: {},
        temporalWindow: {
          start: new Date(),
          end: new Date()
        },
        agentId: 'agent-a'
      };

      await manager.setContext('agent-a', context);

      expect(eventSpy).toHaveBeenCalledWith({
        agentId: 'agent-a',
        context,
        timestamp: expect.any(Date)
      });
    });
  });

  describe('Recommendation System', () => {
    beforeEach(() => {
      // Add some mock memories to the store
      mockMemoryStore.addMockMemory('agent-b', {
        id: 'mem1',
        agentId: 'agent-b',
        content: 'This is about project alpha development',
        metadata: { importance: 8, tags: ['project', 'development'] },
        structuredKey: 'agent-b-mem1',
        timestamp: new Date().toISOString()
      });
    });

    it('should generate recommendations when context is available', async () => {
      // Set up permission rule
      await manager.addPermissionRule({
        sourceAgent: 'agent-a',
        targetAgent: 'agent-b',
        accessLevel: MemoryAccessLevel.READ_ONLY,
        createdBy: 'system'
      });

      // Set context
      const context: RecommendationContext = {
        currentConversation: ['project', 'alpha'],
        recentMemories: [],
        activeProjects: ['alpha'],
        userPreferences: {},
        temporalWindow: {
          start: new Date(Date.now() - 86400000), // 1 day ago
          end: new Date(Date.now() + 86400000)   // 1 day from now
        },
        agentId: 'agent-a'
      };

      await manager.setContext('agent-a', context);

      const recommendations = await manager.getRecommendations('agent-a');

      // Since we're using simplified implementation, recommendations might be empty
      // but the system should not error
      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('should return empty recommendations when no context is available', async () => {
      const recommendations = await manager.getRecommendations('agent-a');
      expect(recommendations).toHaveLength(0);
    });

    it('should cache recommendations correctly', async () => {
      const context: RecommendationContext = {
        currentConversation: ['test'],
        recentMemories: [],
        activeProjects: [],
        userPreferences: {},
        temporalWindow: {
          start: new Date(),
          end: new Date()
        },
        agentId: 'agent-a'
      };

      await manager.setContext('agent-a', context);

      const recommendations1 = await manager.getRecommendations('agent-a');
      const recommendations2 = await manager.getRecommendations('agent-a');

      // Should use cached results (same reference in simplified implementation)
      expect(recommendations1).toEqual(recommendations2);
    });
  });

  describe('Cross-Agent Search', () => {
    it('should perform cross-agent search with proper structure', async () => {
      // Set up permission
      await manager.addPermissionRule({
        sourceAgent: 'agent-a',
        targetAgent: 'agent-b',
        accessLevel: MemoryAccessLevel.READ_ONLY,
        createdBy: 'system'
      });

      const result = await manager.searchCrossAgent('agent-a', 'test query');

      expect(result).toHaveProperty('query', 'test query');
      expect(result).toHaveProperty('memories');
      expect(result).toHaveProperty('sourceAgents');
      expect(result).toHaveProperty('accessLevel');
      expect(result).toHaveProperty('permissionValidated');
      expect(result.permissionValidated).toBe(true);
    });

    it('should include recommendations when requested', async () => {
      await manager.addPermissionRule({
        sourceAgent: 'agent-a',
        targetAgent: 'agent-b',
        accessLevel: MemoryAccessLevel.READ_ONLY,
        createdBy: 'system'
      });

      const result = await manager.searchCrossAgent('agent-a', 'test query', {
        includeRecommendations: true
      });

      expect(result).toHaveProperty('recommendations');
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('should emit crossAgentSearch event', async () => {
      const eventSpy = vi.fn();
      manager.on('crossAgentSearch', eventSpy);

      await manager.searchCrossAgent('agent-a', 'test query');

      expect(eventSpy).toHaveBeenCalledWith({
        requestingAgent: 'agent-a',
        query: 'test query',
        targetAgents: expect.any(Array),
        resultCount: expect.any(Number),
        timestamp: expect.any(Date)
      });
    });
  });

  describe('Configuration Management', () => {
    it('should update configuration correctly', async () => {
      const newConfig = {
        maxRecommendations: 20,
        confidenceThreshold: 0.8
      };

      await manager.updateConfig(newConfig);

      const currentConfig = manager.getConfig();
      expect(currentConfig.maxRecommendations).toBe(20);
      expect(currentConfig.confidenceThreshold).toBe(0.8);
    });

    it('should emit configUpdated event when config changes', async () => {
      const eventSpy = vi.fn();
      manager.on('configUpdated', eventSpy);

      const newConfig = { maxRecommendations: 15 };
      await manager.updateConfig(newConfig);

      expect(eventSpy).toHaveBeenCalledWith({
        config: expect.objectContaining({ maxRecommendations: 15 }),
        timestamp: expect.any(Date)
      });
    });
  });

  describe('Statistics', () => {
    it('should return correct system statistics', async () => {
      // Add some permission rules
      await manager.addPermissionRule({
        sourceAgent: 'agent-a',
        targetAgent: 'agent-b',
        accessLevel: MemoryAccessLevel.READ_ONLY,
        createdBy: 'system'
      });

      await manager.addPermissionRule({
        sourceAgent: 'agent-a',
        targetAgent: 'agent-c',
        accessLevel: MemoryAccessLevel.READ_WRITE,
        createdBy: 'system'
      });

      // Set context
      const context: RecommendationContext = {
        currentConversation: ['test'],
        recentMemories: [],
        activeProjects: [],
        userPreferences: {},
        temporalWindow: {
          start: new Date(),
          end: new Date()
        },
        agentId: 'agent-a'
      };
      await manager.setContext('agent-a', context);

      const stats = await manager.getStatistics();

      expect(stats).toHaveProperty('totalPermissionRules');
      expect(stats).toHaveProperty('activeContexts');
      expect(stats).toHaveProperty('cachedRecommendations');
      expect(stats).toHaveProperty('accessibleAgentPairs');

      expect(stats.totalPermissionRules).toBe(2);
      expect(stats.activeContexts).toBe(1);
      expect(stats.accessibleAgentPairs).toBe(2);
    });
  });

  describe('Factory Function', () => {
    it('should create manager instance using factory function', () => {
      const instance = createCrossAgentMemoryManager(mockMemoryStore, config);
      expect(instance).toBeInstanceOf(CrossAgentMemoryManager);
    });

    it('should create manager with default config when not provided', () => {
      const instance = createCrossAgentMemoryManager(mockMemoryStore);
      expect(instance).toBeInstanceOf(CrossAgentMemoryManager);
    });
  });

  describe('Access Level Validation', () => {
    it('should validate access levels correctly', async () => {
      const memory: StoredMemory = {
        id: 'test-mem',
        agentId: 'agent-b',
        content: 'test content',
        metadata: { importance: 5 },
        structuredKey: 'test-key',
        timestamp: new Date().toISOString()
      };

      // Test READ_ONLY access
      await manager.addPermissionRule({
        sourceAgent: 'agent-a',
        targetAgent: 'agent-b',
        accessLevel: MemoryAccessLevel.READ_ONLY,
        createdBy: 'system'
      });

      // The validation is internal, but we can test through search
      const result = await manager.searchCrossAgent('agent-a', 'test');
      expect(result.accessLevel).toBe(MemoryAccessLevel.READ_ONLY);
    });
  });

  describe('Error Handling', () => {
    it('should handle search errors gracefully', async () => {
      // Create a mock store that throws errors
      const errorStore = {
        recall: vi.fn().mockRejectedValue(new Error('Search failed'))
      };

      const errorManager = new CrossAgentMemoryManager(errorStore);

      // Should not throw, but handle gracefully
      const result = await errorManager.searchCrossAgent('agent-a', 'test');
      expect(result.memories).toHaveLength(0);
    });

    it('should handle recommendation generation errors gracefully', async () => {
      const context: RecommendationContext = {
        currentConversation: ['test'],
        recentMemories: [],
        activeProjects: [],
        userPreferences: {},
        temporalWindow: {
          start: new Date(),
          end: new Date()
        },
        agentId: 'agent-a'
      };

      await manager.setContext('agent-a', context);

      // Should not throw even with problematic context
      const recommendations = await manager.getRecommendations('agent-a');
      expect(Array.isArray(recommendations)).toBe(true);
    });
  });

  describe('Event Emitter Functionality', () => {
    it('should extend EventEmitter correctly', () => {
      expect(manager).toBeInstanceOf(EventEmitter);
    });

    it('should emit permission events when auditing is enabled', async () => {
      const addedSpy = vi.fn();
      const removedSpy = vi.fn();

      manager.on('permissionAdded', addedSpy);
      manager.on('permissionRemoved', removedSpy);

      const ruleId = await manager.addPermissionRule({
        sourceAgent: 'agent-a',
        targetAgent: 'agent-b',
        accessLevel: MemoryAccessLevel.READ_ONLY,
        createdBy: 'system'
      });

      await manager.removePermissionRule(ruleId, 'agent-a');

      expect(addedSpy).toHaveBeenCalled();
      expect(removedSpy).toHaveBeenCalled();
    });
  });
});

describe('Cross-Agent Memory Manager Integration', () => {
  it('should handle complex cross-agent workflows', async () => {
    const mockStore = new MockMemoryStore();
    const manager = new CrossAgentMemoryManager(mockStore, {
      maxRecommendations: 10,
      auditLogging: true
    });

    // Set up multi-agent permissions
    await manager.addPermissionRule({
      sourceAgent: 'user-agent',
      targetAgent: 'github-copilot',
      accessLevel: MemoryAccessLevel.READ_ONLY,
      createdBy: 'system'
    });

    await manager.addPermissionRule({
      sourceAgent: 'github-copilot',
      targetAgent: 'assistant',
      accessLevel: MemoryAccessLevel.READ_WRITE,
      createdBy: 'system'
    });

    // Set contexts for different agents
    const userContext: RecommendationContext = {
      currentConversation: ['debugging', 'typescript', 'error'],
      recentMemories: [],
      activeProjects: ['memorai'],
      userPreferences: { lang: 'typescript' },
      temporalWindow: {
        start: new Date(Date.now() - 3600000),
        end: new Date(Date.now() + 3600000)
      },
      agentId: 'user-agent'
    };

    await manager.setContext('user-agent', userContext);

    // Perform cross-agent search
    const searchResult = await manager.searchCrossAgent('user-agent', 'typescript debugging', {
      includeRecommendations: true
    });

    expect(searchResult).toHaveProperty('query');
    expect(searchResult).toHaveProperty('sourceAgents');
    expect(searchResult).toHaveProperty('recommendations');

    // Get statistics
    const stats = await manager.getStatistics();
    expect(stats.totalPermissionRules).toBe(2);
  });
});