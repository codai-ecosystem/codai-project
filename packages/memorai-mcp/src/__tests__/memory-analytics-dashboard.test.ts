import { describe, it, expect, beforeEach, vi, type MockedFunction } from 'vitest';
import { MemoryAnalyticsDashboard, AnalyticsTimeRange } from '../memory-analytics-dashboard.js';
import { MultiTenantEnhancedMemoryStore } from '../multi-tenant-memory-store.js';
import { TenantManager, type TenantIsolationContext } from '../tenant-manager.js';
import type { Memory } from '../core/types.js';

// Mock dependencies
vi.mock('../multi-tenant-memory-store');
vi.mock('../tenant-manager');

// Helper function to create valid memory objects
function createTestMemory(id: string, content: string, agentId: string = 'test-agent', importance: number = 5): Memory {
  return {
    id,
    agentId,
    content,
    structuredKey: `key-${id}`,
    timestamp: new Date(),
    metadata: {
      entityType: 'task',
      importance,
      tags: ['test'],
      createdBy: 'test-user',
      lastAccessed: new Date(),
      accessCount: 1
    }
  };
}

describe('MemoryAnalyticsDashboard', () => {
  let dashboard: MemoryAnalyticsDashboard;
  let mockMemoryStore: MultiTenantEnhancedMemoryStore;
  let mockTenantManager: TenantManager;
  let testContext: TenantIsolationContext;

  beforeEach(() => {
    // Create mocked instances
    mockMemoryStore = {
      getAllMemoriesForTenant: vi.fn(),
      analyzeTemporalPatterns: vi.fn(),
      getPerformanceMetrics: vi.fn(),
    } as any;

    mockTenantManager = {
      getTenantById: vi.fn(),
      getTenantUsageStats: vi.fn(),
    } as any;

    // Initialize dashboard
    dashboard = new MemoryAnalyticsDashboard(mockMemoryStore, mockTenantManager);

    // Setup test context
    testContext = {
      tenantId: 'tenant-001',
      agentId: 'test-agent-001',
      requestId: 'req-001',
      timestamp: new Date().toISOString(),
      permissions: ['read', 'write'],
      restrictions: {
        allowCrossTenantAccess: false,
        maxMemoryAccess: 1000,
        rateLimits: {
          requestsPerMinute: 60,
          requestsPerHour: 3600
        }
      }
    };
  });

  describe('Constructor and Initialization', () => {
    it('should initialize with memory store and tenant manager', () => {
      expect(dashboard).toBeInstanceOf(MemoryAnalyticsDashboard);
    });

    it('should validate required dependencies', () => {
      expect(() => new MemoryAnalyticsDashboard(null as any, mockTenantManager)).toThrow();
      expect(() => new MemoryAnalyticsDashboard(mockMemoryStore, null as any)).toThrow();
    });
  });

  describe('Dashboard Generation', () => {
    it('should generate comprehensive analytics dashboard', async () => {
      // Mock tenant data
      (mockTenantManager.getTenantById as MockedFunction<any>).mockResolvedValue({
        tenantId: 'tenant-001',
        name: 'Test Tenant',
        agentId: 'test-agent-001',
        created: new Date(),
        lastAccessed: new Date(),
        isActive: true,
        configuration: {}
      });

      // Mock memory data with proper structure
      const mockMemories = [
        createTestMemory('mem-001', 'Test memory 1', 'test-agent-001', 8),
        createTestMemory('mem-002', 'Test memory 2', 'test-agent-001', 6)
      ];

      (mockMemoryStore.getAllMemoriesForTenant as MockedFunction<any>).mockResolvedValue(mockMemories);

      (mockMemoryStore.analyzeTemporalPatterns as MockedFunction<any>).mockResolvedValue({
        patterns: [
          {
            pattern: 'daily_peak',
            confidence: 0.85,
            description: 'Peak activity between 9-11 AM',
            timeRange: { start: new Date(), end: new Date() }
          }
        ],
        insights: ['Users are most active in morning hours']
      });

      // Mock usage stats
      (mockTenantManager.getTenantUsageStats as MockedFunction<any>).mockResolvedValue({
        totalMemories: 150,
        totalSize: 1024000,
        averageImportance: 7.2,
        lastActivity: new Date(),
        activeAgents: 5,
        dailyGrowthRate: 0.15
      });

      // Mock performance metrics
      (mockMemoryStore.getPerformanceMetrics as MockedFunction<any>).mockResolvedValue({
        averageResponseTime: 120,
        successRate: 0.98,
        cacheHitRate: 0.85,
        errorRate: 0.02,
        throughput: 450
      });

      const result = await dashboard.generateDashboard(testContext, AnalyticsTimeRange.LAST_7_DAYS);

      expect(result).toBeDefined();
      expect(result.context).toBeDefined();
      expect(result.context.tenantId).toBe('tenant-001');
      expect(result.timeRange).toBe(AnalyticsTimeRange.LAST_7_DAYS);
      expect(result.summary).toBeDefined();
      expect(result.usagePatterns).toBeDefined();
      expect(result.performanceMetrics).toBeDefined();
      expect(result.trendAnalysis).toBeDefined();
      expect(result.visualComponents).toBeDefined();
      expect(Array.isArray(result.insights)).toBe(true);
    });

    it('should handle empty memory data gracefully', async () => {
      (mockTenantManager.getTenantById as MockedFunction<any>).mockResolvedValue({
        tenantId: 'tenant-empty',
        name: 'Empty Tenant',
        agentId: 'test-agent-empty',
        created: new Date(),
        lastAccessed: new Date(),
        isActive: true,
        configuration: {}
      });

      (mockMemoryStore.getAllMemoriesForTenant as MockedFunction<any>).mockResolvedValue([]);
      (mockMemoryStore.analyzeTemporalPatterns as MockedFunction<any>).mockResolvedValue({
        patterns: [],
        insights: ['No temporal patterns detected']
      });

      (mockTenantManager.getTenantUsageStats as MockedFunction<any>).mockResolvedValue({
        totalMemories: 0,
        totalSize: 0,
        averageImportance: 0,
        lastActivity: new Date(),
        activeAgents: 0,
        dailyGrowthRate: 0
      });

      (mockMemoryStore.getPerformanceMetrics as MockedFunction<any>).mockResolvedValue({
        averageResponseTime: 0,
        successRate: 1.0,
        cacheHitRate: 0,
        errorRate: 0,
        throughput: 0
      });

      const result = await dashboard.generateDashboard(testContext, AnalyticsTimeRange.LAST_24_HOURS);

      expect(result.summary.totalMemories).toBe(0);
      expect(result.insights.some(insight => insight.includes('No memories found'))).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle memory store errors gracefully', async () => {
      (mockMemoryStore.getAllMemoriesForTenant as MockedFunction<any>).mockRejectedValue(new Error('Store connection failed'));

      await expect(
        dashboard.generateDashboard(testContext, AnalyticsTimeRange.LAST_7_DAYS)
      ).rejects.toThrow('Failed to generate analytics dashboard');
    });

    it('should handle tenant manager errors gracefully', async () => {
      (mockTenantManager.getTenantById as MockedFunction<any>).mockRejectedValue(new Error('Tenant not found'));

      await expect(
        dashboard.generateDashboard(testContext, AnalyticsTimeRange.LAST_7_DAYS)
      ).rejects.toThrow('Failed to generate analytics dashboard');
    });

    it('should validate context parameter', async () => {
      await expect(
        dashboard.generateDashboard(null as any, AnalyticsTimeRange.LAST_7_DAYS)
      ).rejects.toThrow();
    });
  });

  describe('Time Range Filtering', () => {
    it('should filter memories by time range correctly', () => {
      const now = new Date();
      const memories: Memory[] = [
        {
          ...createTestMemory('recent', 'Recent memory'),
          timestamp: new Date(now.getTime() - 1000 * 60 * 60) // 1 hour ago
        },
        {
          ...createTestMemory('old', 'Old memory'),
          timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 8) // 8 days ago
        }
      ];

      // Access private method through type assertion
      const filtered = (dashboard as any).filterMemoriesByTimeRange(memories, AnalyticsTimeRange.LAST_7_DAYS);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('recent');
    });
  });

  describe('Analytics Components', () => {
    it('should analyze usage patterns from memory data', async () => {
      const mockMemories = [
        createTestMemory('mem-1', 'Morning task', 'agent-1', 8),
        createTestMemory('mem-2', 'Afternoon task', 'agent-1', 6),
        createTestMemory('mem-3', 'Evening task', 'agent-2', 7)
      ];

      // Test private method
      const patterns = await (dashboard as any).analyzeUsagePatterns(mockMemories, testContext);

      expect(patterns).toBeDefined();
      expect(patterns.timeDistribution).toBeDefined();
      expect(patterns.agentActivity).toBeDefined();
      expect(patterns.contentCategories).toBeDefined();
      expect(patterns.importanceDistribution).toBeDefined();
      expect(typeof patterns.growthRate).toBe('number');
    });

    it('should collect performance metrics', async () => {
      (mockMemoryStore.getPerformanceMetrics as MockedFunction<any>).mockResolvedValue({
        averageResponseTime: 150,
        successRate: 0.96,
        cacheHitRate: 0.82,
        errorRate: 0.04,
        throughput: 380
      });

      const metrics = await (dashboard as any).collectPerformanceMetrics(testContext.tenantId, testContext);

      expect(metrics).toBeDefined();
      expect(metrics.responseTime).toBe(150);
      expect(metrics.successRate).toBe(0.96);
      expect(metrics.cacheHitRate).toBe(0.82);
      expect(metrics.errorRate).toBe(0.04);
      expect(metrics.throughput).toBe(380);
      expect(typeof metrics.healthScore).toBe('number');
      expect(metrics.healthScore).toBeGreaterThan(0);
      expect(metrics.healthScore).toBeLessThanOrEqual(100);
    });

    it('should generate meaningful insights', () => {
      const mockSummary = {
        totalMemories: 100,
        averageImportance: 7.5,
        topAgents: ['agent-1', 'agent-2'],
        mostActiveTime: '09:00-11:00',
        primaryCategories: ['task', 'knowledge']
      };

      const mockUsagePatterns = {
        timeDistribution: { morning: 40, afternoon: 35, evening: 25 },
        agentActivity: { 'agent-1': 60, 'agent-2': 40 },
        contentCategories: { task: 50, knowledge: 30, other: 20 },
        importanceDistribution: { high: 30, medium: 50, low: 20 },
        growthRate: 0.15
      };

      const mockPerformanceMetrics = {
        responseTime: 120,
        successRate: 0.96,
        cacheHitRate: 0.85,
        errorRate: 0.04,
        throughput: 450,
        healthScore: 87,
        timestamp: new Date()
      };

      const mockTrendAnalysis = {
        memoryGrowth: [10, 15, 12, 18, 20],
        activityTrend: [0.1, 0.15, 0.12, 0.18, 0.20],
        importanceTrend: [7.0, 7.2, 7.5, 7.3, 7.8],
        categoryTrends: { task: [0.5, 0.52], knowledge: [0.3, 0.28] },
        predictions: [25, 28, 30]
      };

      const insights = (dashboard as any).generateInsights(
        mockSummary,
        mockUsagePatterns,
        mockPerformanceMetrics,
        mockTrendAnalysis
      );

      expect(Array.isArray(insights)).toBe(true);
      expect(insights.length).toBeGreaterThan(0);

      insights.forEach((insight: string) => {
        expect(typeof insight).toBe('string');
        expect(insight.length).toBeGreaterThan(0);
      });
    });
  });
});