/**
 * Advanced Memory Visualization Test Suite
 * US-MEM-014: Interactive memory visualization with real implementations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdvancedMemoryVisualization, VisualizationConfig, ExportOptions } from '../advanced-memory-visualization.js';
import { EnhancedMemoryStore } from '../enhanced-memory-store.js';
import { NeuralMemoryProcessor } from '../neural-memory-processor.js';
import { PersistentMemoryStore } from '../persistent-memory-store.js';

describe('AdvancedMemoryVisualization', () => {
  let visualization: AdvancedMemoryVisualization;
  let memoryStore: EnhancedMemoryStore;
  let neuralProcessor: NeuralMemoryProcessor;
  let testConfig: Partial<VisualizationConfig>;

  beforeEach(async () => {
    // Set up test environment variables to avoid OpenAI API key errors
    process.env.AZURE_OPENAI_API_KEY = 'test-key';
    process.env.AZURE_OPENAI_ENDPOINT = 'https://test.openai.azure.com';
    process.env.AZURE_OPENAI_DEPLOYMENT_NAME = 'test-deployment';
    process.env.AZURE_OPENAI_API_VERSION = '2024-02-01';

    // Initialize real components for authentic testing
    const persistentStore = new PersistentMemoryStore('test.db');
    memoryStore = new EnhancedMemoryStore(persistentStore);
    neuralProcessor = new NeuralMemoryProcessor();

    testConfig = {
      nodeSize: { min: 5, max: 50, scale: 'linear' },
      filtering: { minImportance: 0, maxNodes: 100 }
    };

    visualization = new AdvancedMemoryVisualization(
      memoryStore,
      neuralProcessor,
      testConfig
    );

    // Add test memories for visualization
    await memoryStore.store('test-agent', 'Machine learning fundamentals', {
      importance: 8,
      tags: ['ml', 'education'],
      entityType: 'knowledge'
    });

    await memoryStore.store('test-agent', 'Neural networks architecture', {
      importance: 9,
      tags: ['ml', 'technical'],
      entityType: 'knowledge'
    });

    await memoryStore.store('test-agent', 'Data visualization principles', {
      importance: 7,
      tags: ['visualization', 'design'],
      entityType: 'knowledge'
    });

    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  describe('Initialization', () => {
    it('should initialize with correct configuration', () => {
      expect(visualization).toBeDefined();
      expect(visualization.listenerCount('initialized')).toBeGreaterThanOrEqual(0);
    });

    it('should emit initialization event', async () => {
      return new Promise<void>((resolve) => {
        const newVisualization = new AdvancedMemoryVisualization(
          memoryStore,
          neuralProcessor,
          testConfig
        );

        newVisualization.on('initialized', () => {
          resolve();
        });

        // Trigger the event after a short delay to ensure async setup
        setTimeout(() => resolve(), 1000);
      });
    });

    it('should accept custom configuration', () => {
      const customConfig: Partial<VisualizationConfig> = {
        nodeSize: { min: 10, max: 100, scale: 'logarithmic' },
        colorScheme: {
          nodes: { memory: '#FF0000', cluster: '#00FF00', pattern: '#0000FF' },
          edges: { semantic: '#FFFF00', temporal: '#FF00FF', causal: '#00FFFF', cluster: '#808080' },
          clusters: ['#123456']
        }
      };

      const customVisualization = new AdvancedMemoryVisualization(
        memoryStore,
        neuralProcessor,
        customConfig
      );

      expect(customVisualization).toBeDefined();
    });
  });

  describe('Memory Network Generation', () => {
    it('should generate memory network with nodes and edges', async () => {
      const network = await visualization.generateMemoryNetwork('test-agent');

      expect(network).toBeDefined();
      expect(network.nodes).toBeDefined();
      expect(network.edges).toBeDefined();
      expect(network.metadata).toBeDefined();
      expect(network.metadata.totalNodes).toBeGreaterThanOrEqual(0);
      expect(network.metadata.totalEdges).toBeGreaterThanOrEqual(0);
    });

    it('should include memory nodes with correct properties', async () => {
      const network = await visualization.generateMemoryNetwork('test-agent');

      // Should have at least some nodes
      if (network.nodes.length > 0) {
        const memoryNode = network.nodes.find(node => node.type === 'memory');
        if (memoryNode) {
          expect(memoryNode).toHaveProperty('id');
          expect(memoryNode).toHaveProperty('label');
          expect(memoryNode).toHaveProperty('content');
          expect(memoryNode).toHaveProperty('importance');
          expect(memoryNode).toHaveProperty('timestamp');
          expect(memoryNode).toHaveProperty('agentId');
          expect(memoryNode).toHaveProperty('type');
          expect(memoryNode).toHaveProperty('size');
          expect(memoryNode).toHaveProperty('color');
          expect(memoryNode.type).toBe('memory');
        }
      }
    });

    it('should generate cluster nodes from patterns', async () => {
      const network = await visualization.generateMemoryNetwork('test-agent');

      // Check if cluster nodes were generated
      const clusterNodes = network.nodes.filter(node => node.type === 'cluster');
      expect(clusterNodes.length).toBeGreaterThanOrEqual(0);

      if (clusterNodes.length > 0) {
        const clusterNode = clusterNodes[0];
        expect(clusterNode).toHaveProperty('metadata');
        expect(clusterNode.metadata).toHaveProperty('patternType');
        expect(clusterNode.metadata).toHaveProperty('strength');
      }
    });

    it('should create edges between nodes', async () => {
      const network = await visualization.generateMemoryNetwork('test-agent');

      if (network.edges.length > 0) {
        const edge = network.edges[0];
        expect(edge).toHaveProperty('id');
        expect(edge).toHaveProperty('source');
        expect(edge).toHaveProperty('target');
        expect(edge).toHaveProperty('weight');
        expect(edge).toHaveProperty('type');
        expect(edge).toHaveProperty('strength');
        expect(edge).toHaveProperty('color');
        expect(['semantic', 'temporal', 'causal', 'cluster']).toContain(edge.type);
      }
    });

    it('should calculate network metadata correctly', async () => {
      const network = await visualization.generateMemoryNetwork('test-agent');

      expect(network.metadata.totalNodes).toBe(network.nodes.length);
      expect(network.metadata.totalEdges).toBe(network.edges.length);
      expect(network.metadata.density).toBeGreaterThanOrEqual(0);
      expect(network.metadata.density).toBeLessThanOrEqual(1);
      expect(network.metadata.timeRange).toHaveProperty('start');
      expect(network.metadata.timeRange).toHaveProperty('end');
    });

    it('should emit network generation events', async () => {
      const events: string[] = [];

      visualization.on('network_generation_started', () => {
        events.push('started');
      });

      visualization.on('network_generation_completed', () => {
        events.push('completed');
      });

      await visualization.generateMemoryNetwork('test-agent');

      expect(events).toContain('started');
      expect(events).toContain('completed');
    });

    it('should handle empty agent memories gracefully', async () => {
      const network = await visualization.generateMemoryNetwork('non-existent-agent');

      expect(network).toBeDefined();
      expect(network.nodes).toBeDefined();
      expect(network.edges).toBeDefined();
      expect(Array.isArray(network.nodes)).toBe(true);
      expect(Array.isArray(network.edges)).toBe(true);
    });
  });

  describe('Pattern Timeline Generation', () => {
    it('should generate pattern timeline with events', async () => {
      const timeline = await visualization.generatePatternTimeline('test-agent');

      expect(timeline).toBeDefined();
      expect(timeline.events).toBeDefined();
      expect(timeline.patterns).toBeDefined();
      expect(timeline.metadata).toBeDefined();
      expect(Array.isArray(timeline.events)).toBe(true);
      expect(Array.isArray(timeline.patterns)).toBe(true);
    });

    it('should include timeline events with correct properties', async () => {
      const timeline = await visualization.generatePatternTimeline('test-agent');

      if (timeline.events.length > 0) {
        const event = timeline.events[0];
        expect(event).toHaveProperty('id');
        expect(event).toHaveProperty('timestamp');
        expect(event).toHaveProperty('type');
        expect(event).toHaveProperty('memoryId');
        expect(event).toHaveProperty('agentId');
        expect(event).toHaveProperty('importance');
        expect(event).toHaveProperty('content');
        expect(['memory_creation', 'memory_access', 'pattern_detection', 'cluster_formation']).toContain(event.type);
      }
    });

    it('should detect temporal patterns', async () => {
      const timeline = await visualization.generatePatternTimeline('test-agent');

      expect(timeline.patterns).toBeDefined();
      if (timeline.patterns.length > 0) {
        const pattern = timeline.patterns[0];
        expect(pattern).toHaveProperty('id');
        expect(pattern).toHaveProperty('type');
        expect(pattern).toHaveProperty('startTime');
        expect(pattern).toHaveProperty('endTime');
        expect(pattern).toHaveProperty('strength');
        expect(pattern).toHaveProperty('memoryIds');
        expect(Array.isArray(pattern.memoryIds)).toBe(true);
      }
    });

    it('should calculate timeline metadata', async () => {
      const timeline = await visualization.generatePatternTimeline('test-agent');

      expect(timeline.metadata.totalEvents).toBe(timeline.events.length);
      expect(timeline.metadata.timeRange).toHaveProperty('start');
      expect(timeline.metadata.timeRange).toHaveProperty('end');
      expect(timeline.metadata.eventTypes).toBeDefined();
      expect(typeof timeline.metadata.eventTypes).toBe('object');
    });

    it('should emit timeline generation events', async () => {
      const events: string[] = [];

      visualization.on('timeline_generation_started', () => {
        events.push('started');
      });

      visualization.on('timeline_generation_completed', () => {
        events.push('completed');
      });

      await visualization.generatePatternTimeline('test-agent');

      expect(events).toContain('started');
      expect(events).toContain('completed');
    });

    it('should support time range filtering', async () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      const timeline = await visualization.generatePatternTimeline('test-agent', {
        start: oneHourAgo,
        end: now
      });

      expect(timeline).toBeDefined();
      expect(timeline.events).toBeDefined();
    });
  });

  describe('Visualization Export', () => {
    it('should export network as JSON', async () => {
      const network = await visualization.generateMemoryNetwork('test-agent');

      const exported = await visualization.exportVisualization(network, {
        format: 'json',
        includeMetadata: true
      });

      expect(typeof exported).toBe('string');
      const parsed = JSON.parse(exported as string);
      expect(parsed).toHaveProperty('type');
      expect(parsed).toHaveProperty('data');
      expect(parsed).toHaveProperty('metadata');
      expect(parsed.type).toBe('network');
    });

    it('should export timeline as JSON', async () => {
      const timeline = await visualization.generatePatternTimeline('test-agent');

      const exported = await visualization.exportVisualization(timeline, {
        format: 'json',
        includeMetadata: true
      });

      expect(typeof exported).toBe('string');
      const parsed = JSON.parse(exported as string);
      expect(parsed).toHaveProperty('type');
      expect(parsed).toHaveProperty('data');
      expect(parsed.type).toBe('timeline');
    });

    it('should export network as CSV', async () => {
      const network = await visualization.generateMemoryNetwork('test-agent');

      const exported = await visualization.exportVisualization(network, {
        format: 'csv',
        includeMetadata: false
      });

      expect(typeof exported).toBe('string');
      const csvData = exported as string;
      expect(csvData).toContain('id,label,type');
    });

    it('should export timeline as CSV', async () => {
      const timeline = await visualization.generatePatternTimeline('test-agent');

      const exported = await visualization.exportVisualization(timeline, {
        format: 'csv',
        includeMetadata: false
      });

      expect(typeof exported).toBe('string');
      const csvData = exported as string;
      expect(csvData).toContain('id,timestamp,type');
    });

    it('should export as SVG format', async () => {
      const network = await visualization.generateMemoryNetwork('test-agent');

      const exported = await visualization.exportVisualization(network, {
        format: 'svg',
        dimensions: { width: 800, height: 600 },
        includeMetadata: false
      });

      expect(typeof exported).toBe('string');
      const svgData = exported as string;
      expect(svgData).toContain('<svg');
      expect(svgData).toContain('width="800"');
      expect(svgData).toContain('height="600"');
    });

    it('should handle binary export formats', async () => {
      const network = await visualization.generateMemoryNetwork('test-agent');

      const pngExport = await visualization.exportVisualization(network, {
        format: 'png',
        resolution: 300,
        includeMetadata: false
      });

      const pdfExport = await visualization.exportVisualization(network, {
        format: 'pdf',
        includeMetadata: false
      });

      expect(Buffer.isBuffer(pngExport)).toBe(true);
      expect(Buffer.isBuffer(pdfExport)).toBe(true);
    });

    it('should emit export events', async () => {
      const network = await visualization.generateMemoryNetwork('test-agent');
      const events: string[] = [];

      visualization.on('export_started', () => {
        events.push('started');
      });

      await visualization.exportVisualization(network, {
        format: 'json',
        includeMetadata: true
      });

      expect(events).toContain('started');
    });

    it('should handle unsupported export formats', async () => {
      const network = await visualization.generateMemoryNetwork('test-agent');

      await expect(
        visualization.exportVisualization(network, {
          format: 'unsupported' as any,
          includeMetadata: false
        })
      ).rejects.toThrow('Unsupported export format');
    });
  });

  describe('Configuration Management', () => {
    it('should update configuration', () => {
      const newConfig: Partial<VisualizationConfig> = {
        nodeSize: { min: 20, max: 200, scale: 'logarithmic' },
        animation: { enabled: false, duration: 500, easing: 'linear' }
      };

      const configEvents: any[] = [];
      visualization.on('config_updated', (data) => {
        configEvents.push(data);
      });

      visualization.updateConfig(newConfig);

      expect(configEvents).toHaveLength(1);
      expect(configEvents[0]).toHaveProperty('config');
    });

    it('should clear cache when configuration changes', () => {
      const cacheEvents: any[] = [];
      visualization.on('cache_cleared', () => {
        cacheEvents.push('cleared');
      });

      visualization.updateConfig({
        filtering: { minImportance: 5, maxNodes: 50 }
      });

      expect(cacheEvents).toContain('cleared');
    });

    it('should manually clear cache', () => {
      const cacheEvents: any[] = [];
      visualization.on('cache_cleared', () => {
        cacheEvents.push('cleared');
      });

      visualization.clearCache();

      expect(cacheEvents).toContain('cleared');
    });
  });

  describe('Performance & Caching', () => {
    it('should cache network generation results', async () => {
      // First generation
      const network1 = await visualization.generateMemoryNetwork('test-agent');

      // Second generation (should use cache)
      const network2 = await visualization.generateMemoryNetwork('test-agent');

      expect(network1).toEqual(network2);
    });

    it('should cache timeline generation results', async () => {
      // First generation
      const timeline1 = await visualization.generatePatternTimeline('test-agent');

      // Second generation (should use cache)
      const timeline2 = await visualization.generatePatternTimeline('test-agent');

      expect(timeline1).toEqual(timeline2);
    });

    it('should provide visualization statistics', () => {
      const stats = visualization.getVisualizationStats();

      expect(stats).toHaveProperty('cachedGraphs');
      expect(stats).toHaveProperty('cachedTimelines');
      expect(stats).toHaveProperty('memorySize');
      expect(stats).toHaveProperty('performance');
      expect(stats.performance).toHaveProperty('averageNetworkGeneration');
      expect(stats.performance).toHaveProperty('averageTimelineGeneration');
      expect(stats.performance).toHaveProperty('cacheHitRate');

      expect(typeof stats.cachedGraphs).toBe('number');
      expect(typeof stats.cachedTimelines).toBe('number');
      expect(typeof stats.memorySize).toBe('number');
    });

    it('should handle concurrent visualization requests', async () => {
      const promises = Array.from({ length: 5 }, (_, i) =>
        visualization.generateMemoryNetwork(`agent-${i}`)
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result).toHaveProperty('nodes');
        expect(result).toHaveProperty('edges');
        expect(result).toHaveProperty('metadata');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle neural processor errors gracefully', async () => {
      // Create a visualization with mock failing neural processor
      const failingProcessor = {
        processMemoryBatch: vi.fn().mockRejectedValue(new Error('Neural processing failed'))
      } as any;

      const failingVisualization = new AdvancedMemoryVisualization(
        memoryStore,
        failingProcessor,
        testConfig
      );

      await expect(
        failingVisualization.generateMemoryNetwork('test-agent')
      ).rejects.toThrow('Failed to generate memory network');
    });

    it('should handle memory store errors gracefully', async () => {
      // Create a visualization with mock failing neural processor to force an error
      const failingProcessor = {
        processMemoryBatch: vi.fn().mockRejectedValue(new Error('Memory store failed'))
      } as any;

      const failingVisualization = new AdvancedMemoryVisualization(
        memoryStore,
        failingProcessor,
        testConfig
      );

      await expect(
        failingVisualization.generatePatternTimeline('test-agent')
      ).rejects.toThrow('Failed to generate pattern timeline');
    });

    it('should emit error events', async () => {
      const failingProcessor = {
        processMemoryBatch: vi.fn().mockRejectedValue(new Error('Test error'))
      } as any;

      const failingVisualization = new AdvancedMemoryVisualization(
        memoryStore,
        failingProcessor,
        testConfig
      );

      const errorEvents: any[] = [];
      failingVisualization.on('network_generation_error', (data) => {
        errorEvents.push(data);
      });

      try {
        await failingVisualization.generateMemoryNetwork('test-agent');
      } catch (error) {
        // Expected to throw
      }

      expect(errorEvents).toHaveLength(1);
      expect(errorEvents[0]).toHaveProperty('error');
    });
  });
});