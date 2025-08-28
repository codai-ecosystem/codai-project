/**
 * Cross-Agent Memory Manager Tests
 * Tests for US-MEM-002 implementation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventEmitter } from 'events';
import {
  CrossAgentMemoryManager,
  MemoryAccessLevel,
  type RecommendationContext,
  type CrossAgentConfig,
  createCrossAgentMemoryManager
} from '../cross-agent-memory-manager.js';
import type { StoredMemory } from '../enhanced-memory-store.js';
import { MultiTenantEnhancedMemoryStore } from '../multi-tenant-memory-store.js';
import { TenantManager } from '../tenant-manager.js';

// Create mock multi-tenant store
const createMockStore = () => {
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
    generateMemorySummary: vi.fn().mockResolvedValue('')
  } as unknown as MultiTenantEnhancedMemoryStore;
  return mockStore;
};

describe('CrossAgentMemoryManager', () => {
  let manager: CrossAgentMemoryManager;
  let mockMemoryStore: MultiTenantEnhancedMemoryStore;
  let mockTenantManager: TenantManager;

  beforeEach(() => {
    mockMemoryStore = createMockStore();
    mockTenantManager = new TenantManager();
    manager = new CrossAgentMemoryManager(mockMemoryStore, mockTenantManager);
  });

  describe('Basic Functionality', () => {
    it('should create a manager instance', () => {
      expect(manager).toBeInstanceOf(CrossAgentMemoryManager);
      expect(manager).toBeInstanceOf(EventEmitter);
    });

    it('should add permission rules', async () => {
      const ruleId = await manager.addPermissionRule({
        sourceAgent: 'agent-a',
        targetAgent: 'agent-b',
        accessLevel: MemoryAccessLevel.READ_ONLY,
        createdBy: 'system'
      });

      expect(ruleId).toMatch(/^perm_/);

      const rules = await manager.getPermissionRules('agent-a');
      expect(rules).toHaveLength(1);
      expect(rules[0].sourceAgent).toBe('agent-a');
    });

    it('should set context', async () => {
      const context: RecommendationContext = {
        currentConversation: ['test'],
        recentMemories: [],
        activeProjects: [],
        userPreferences: {},
        temporalWindow: {
          start: new Date(),
          end: new Date()
        }
      };

      // Should not throw
      await manager.setContext('agent-a', context);
      expect(true).toBe(true);
    });

    it('should perform cross-agent search', async () => {
      await manager.addPermissionRule({
        sourceAgent: 'agent-a',
        targetAgent: 'agent-b',
        accessLevel: MemoryAccessLevel.READ_ONLY,
        createdBy: 'system'
      });

      const result = await manager.searchCrossAgent('agent-a', 'test query');

      expect(result).toHaveProperty('memories');
      expect(result).toHaveProperty('sourceAgents');
      expect(result).toHaveProperty('permissionValidated');
      expect(Array.isArray(result.memories)).toBe(true);
    });

    it('should get recommendations', async () => {
      const recommendations = await manager.getRecommendations('agent-a');
      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('should return statistics', async () => {
      const stats = await manager.getStatistics();
      expect(stats).toHaveProperty('totalPermissionRules');
      expect(stats).toHaveProperty('activeContexts');
      expect(stats).toHaveProperty('accessibleAgentPairs');
    });
  });

  describe('Factory Function', () => {
    it('should create instance with factory', () => {
      const instance = createCrossAgentMemoryManager(mockMemoryStore, mockTenantManager);
      expect(instance).toBeInstanceOf(CrossAgentMemoryManager);
    });

    it('should create instance with config', () => {
      const config: Partial<CrossAgentConfig> = {
        maxRecommendations: 10,
        auditLogging: true
      };
      const instance = createCrossAgentMemoryManager(mockMemoryStore, mockTenantManager, config);
      expect(instance).toBeInstanceOf(CrossAgentMemoryManager);
    });
  });

  describe('Configuration', () => {
    it('should update configuration', async () => {
      const newConfig = { maxRecommendations: 20 };
      await manager.updateConfig(newConfig);

      const currentConfig = manager.getConfig();
      expect(currentConfig.maxRecommendations).toBe(20);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully', async () => {
      const errorStore = {
        ...mockMemoryStore,
        recall: vi.fn().mockRejectedValue(new Error('Test error'))
      } as unknown as MultiTenantEnhancedMemoryStore;

      const errorManager = new CrossAgentMemoryManager(errorStore, mockTenantManager);

      // Should not throw
      const result = await errorManager.searchCrossAgent('agent-a', 'test');
      expect(result.memories).toHaveLength(0);
    });
  });
});