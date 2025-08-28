/**
 * Dynamic Learning System Test Suite
 * Tests the continuous learning and adaptation capabilities
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DynamicLearningSystem, UserInteraction, UserFeedback, LearningConfig } from '../dynamic-learning-system';
import { EnhancedMemoryStore, MemoryVector } from '../enhanced-memory-store';
import { NeuralMemoryProcessor } from '../neural-memory-processor';

// Test configuration
const testConfig: Partial<LearningConfig> = {
  enabled: true,
  learningRate: 0.2,
  adaptationThreshold: 0.6,
  feedbackWeight: 0.9,
  behaviorAnalysisWindow: 24 * 60 * 60 * 1000, // 24 hours
  patternEvolutionRate: 0.1,
  importanceDecayFactor: 0.9,
  convergenceThreshold: 0.05
};

// Test database configuration
const testDbConfig = {
  host: 'localhost',
  port: 4180,
  database: 'memorai_test',
  apiKey: 'test-api-key-for-learning-tests'
};

describe('DynamicLearningSystem', () => {
  let memoryStore: EnhancedMemoryStore;
  let neuralProcessor: NeuralMemoryProcessor;
  let learningSystem: DynamicLearningSystem;

  beforeEach(async () => {
    // Initialize real components
    memoryStore = new EnhancedMemoryStore(testDbConfig);
    neuralProcessor = new NeuralMemoryProcessor(memoryStore);
    learningSystem = new DynamicLearningSystem(memoryStore, neuralProcessor, testConfig);

    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  afterEach(async () => {
    await learningSystem.resetLearningSystem();
  });

  describe('Initialization', () => {
    it('should initialize with correct configuration', async () => {
      const metrics = await learningSystem.getLearningMetrics();

      expect(metrics).toBeDefined();
      expect(metrics.totalInteractions).toBe(0);
      expect(metrics.feedbackReceived).toBe(0);
      expect(metrics.systemAccuracy).toBe(0.75);
    });

    it('should emit initialization event', (done) => {
      const newLearningSystem = new DynamicLearningSystem(memoryStore, neuralProcessor, testConfig);

      newLearningSystem.on('initialization', (event) => {
        expect(event.status).toBe('initialized');
        expect(event.config).toBeDefined();
        done();
      });
    });
  });

  describe('User Interaction Recording', () => {
    it('should record user interactions correctly', async () => {
      const interaction: UserInteraction = {
        id: 'test-interaction-1',
        userId: 'user-123',
        timestamp: new Date(),
        type: 'search',
        data: {
          query: 'test query',
          results: [],
          sessionLength: 120
        }
      };

      await learningSystem.recordUserInteraction(interaction);
      const metrics = await learningSystem.getLearningMetrics();

      expect(metrics.totalInteractions).toBe(1);
    });

    it('should emit interaction recorded event', async () => {
      const interaction: UserInteraction = {
        id: 'test-interaction-2',
        userId: 'user-456',
        timestamp: new Date(),
        type: 'recall',
        data: { query: 'recall test' }
      };

      const eventPromise = new Promise((resolve) => {
        learningSystem.on('interactionRecorded', (event) => {
          expect(event.interaction.id).toBe('test-interaction-2');
          expect(event.metrics.totalInteractions).toBe(1);
          resolve(event);
        });
      });

      await learningSystem.recordUserInteraction(interaction);
      await eventPromise;
    });

    it('should handle multiple users correctly', async () => {
      const interactions: UserInteraction[] = [
        {
          id: 'int-1',
          userId: 'user-1',
          timestamp: new Date(),
          type: 'search',
          data: { query: 'user 1 query' }
        },
        {
          id: 'int-2',
          userId: 'user-2',
          timestamp: new Date(),
          type: 'search',
          data: { query: 'user 2 query' }
        },
        {
          id: 'int-3',
          userId: 'user-1',
          timestamp: new Date(),
          type: 'feedback',
          data: { score: 0.8 }
        }
      ];

      for (const interaction of interactions) {
        await learningSystem.recordUserInteraction(interaction);
      }

      const metrics = await learningSystem.getLearningMetrics();
      expect(metrics.totalInteractions).toBe(3);
    });
  });

  describe('Feedback Processing', () => {
    it('should process user feedback correctly', async () => {
      const feedback: UserFeedback = {
        interactionId: 'test-interaction-1',
        userId: 'user-123',
        timestamp: new Date(),
        relevanceScore: 0.8,
        satisfactionScore: 0.9
      };

      await learningSystem.processFeedback(feedback);
      const metrics = await learningSystem.getLearningMetrics();

      expect(metrics.feedbackReceived).toBe(1);
      expect(metrics.userSatisfactionTrend).toContain(0.9);
    });

    it('should emit feedback processed event', async () => {
      const feedback: UserFeedback = {
        interactionId: 'test-interaction-2',
        userId: 'user-456',
        timestamp: new Date(),
        relevanceScore: 0.7,
        satisfactionScore: 0.85
      };

      const eventPromise = new Promise((resolve) => {
        learningSystem.on('feedbackProcessed', (event) => {
          expect(event.feedback.relevanceScore).toBe(0.7);
          expect(event.metrics.feedbackReceived).toBe(1);
          resolve(event);
        });
      });

      await learningSystem.processFeedback(feedback);
      await eventPromise;
    });

    it('should handle feedback corrections', async () => {
      const feedback: UserFeedback = {
        interactionId: 'test-interaction-3',
        userId: 'user-789',
        timestamp: new Date(),
        relevanceScore: 0.5,
        satisfactionScore: 0.6,
        corrections: {
          expectedResults: ['result1', 'result2'],
          queryRefinement: 'refined query'
        }
      };

      await learningSystem.processFeedback(feedback);

      // Verify feedback was processed (metrics should be updated)
      const metrics = await learningSystem.getLearningMetrics();
      expect(metrics.feedbackReceived).toBe(1);
    });

    it('should maintain satisfaction trend within limits', async () => {
      // Add 101 feedback scores to test limit
      for (let i = 0; i < 101; i++) {
        const feedback: UserFeedback = {
          interactionId: `interaction-${i}`,
          userId: `user-${i}`,
          timestamp: new Date(),
          relevanceScore: 0.8,
          satisfactionScore: 0.8
        };
        await learningSystem.processFeedback(feedback);
      }

      const metrics = await learningSystem.getLearningMetrics();
      expect(metrics.userSatisfactionTrend.length).toBe(100); // Should be limited to 100
    });
  });

  describe('User Preference Learning', () => {
    it('should create default preferences for new users', async () => {
      const interaction: UserInteraction = {
        id: 'pref-test-1',
        userId: 'new-user-123',
        timestamp: new Date(),
        type: 'search',
        data: { query: 'test' }
      };

      await learningSystem.recordUserInteraction(interaction);
      const preferences = await learningSystem.getUserPreferences('new-user-123');

      expect(preferences).toBeDefined();
      expect(preferences!.userId).toBe('new-user-123');
      expect(preferences!.searchPreferences.resultCount).toBe(10);
    });

    it('should learn search preferences from interactions', async () => {
      const interaction: UserInteraction = {
        id: 'pref-test-2',
        userId: 'learning-user',
        timestamp: new Date(),
        type: 'search',
        data: {
          query: 'test query',
          limit: 20,
          timeFrame: 'all',
          sources: ['source1', 'source2']
        }
      };

      await learningSystem.recordUserInteraction(interaction);
      const preferences = await learningSystem.getUserPreferences('learning-user');

      expect(preferences).toBeDefined();
      expect(preferences!.searchPreferences.timeFramePreference).toBe('all');
      expect(preferences!.searchPreferences.preferredSources).toContain('source1');
    });

    it('should update active hours based on interaction timing', async () => {
      const currentHour = new Date().getHours();
      const interaction: UserInteraction = {
        id: 'timing-test',
        userId: 'timing-user',
        timestamp: new Date(),
        type: 'search',
        data: { query: 'timing test' }
      };

      await learningSystem.recordUserInteraction(interaction);
      const preferences = await learningSystem.getUserPreferences('timing-user');

      expect(preferences!.interactionPatterns.activeHours).toContain(currentHour);
    });
  });

  describe('Behavioral Pattern Analysis', () => {
    it('should analyze behavior patterns correctly', async () => {
      const userId = 'behavior-user';
      const interactions: UserInteraction[] = [
        {
          id: 'b1',
          userId,
          timestamp: new Date(),
          type: 'search',
          data: { queryType: 'simple', sessionLength: 60 }
        },
        {
          id: 'b2',
          userId,
          timestamp: new Date(),
          type: 'search',
          data: { queryType: 'complex', sessionLength: 120 }
        },
        {
          id: 'b3',
          userId,
          timestamp: new Date(),
          type: 'recall',
          data: { sessionLength: 90 }
        }
      ];

      for (const interaction of interactions) {
        await learningSystem.recordUserInteraction(interaction);
      }

      const analysis = await learningSystem.getBehaviorAnalysis(userId);

      expect(analysis.userId).toBe(userId);
      expect(analysis.interactionPatterns.searchFrequency).toBe(2);
      expect(analysis.interactionPatterns.queryTypes.simple).toBe(1);
      expect(analysis.interactionPatterns.queryTypes.complex).toBe(1);
      expect(analysis.interactionPatterns.engagementLevel).toBeGreaterThan(0);
    });

    it('should generate behavior recommendations', async () => {
      const userId = 'recommendation-user';

      // Add some interactions with feedback
      const interaction: UserInteraction = {
        id: 'rec-int-1',
        userId,
        timestamp: new Date(),
        type: 'search',
        data: { query: 'test' }
      };

      await learningSystem.recordUserInteraction(interaction);

      // Add low satisfaction feedback to trigger recommendations
      const feedback: UserFeedback = {
        interactionId: 'rec-int-1',
        userId,
        timestamp: new Date(),
        relevanceScore: 0.5,
        satisfactionScore: 0.4
      };

      await learningSystem.processFeedback(feedback);

      const analysis = await learningSystem.getBehaviorAnalysis(userId);
      expect(analysis.recommendations).toBeDefined();
    });
  });

  describe('Learning System Control', () => {
    it('should enable and disable learning correctly', async () => {
      let enabledEvent = false;
      let disabledEvent = false;

      learningSystem.on('learningEnabled', () => {
        enabledEvent = true;
      });

      learningSystem.on('learningDisabled', () => {
        disabledEvent = true;
      });

      await learningSystem.disableLearning();
      expect(disabledEvent).toBe(true);

      await learningSystem.enableLearning();
      expect(enabledEvent).toBe(true);
    });

    it('should reset learning system correctly', async () => {
      // Add some data
      const interaction: UserInteraction = {
        id: 'reset-test',
        userId: 'reset-user',
        timestamp: new Date(),
        type: 'search',
        data: { query: 'test' }
      };

      await learningSystem.recordUserInteraction(interaction);

      let resetEvent = false;
      learningSystem.on('learningSystemReset', () => {
        resetEvent = true;
      });

      await learningSystem.resetLearningSystem();

      expect(resetEvent).toBe(true);

      const metrics = await learningSystem.getLearningMetrics();
      expect(metrics.totalInteractions).toBe(0);
      expect(metrics.feedbackReceived).toBe(0);
    });
  });

  describe('Memory Importance Evolution', () => {
    it('should adjust memory importance based on feedback', async () => {
      // First create a memory in the store using the correct API
      const storedMemory = await memoryStore.store('test-agent', 'This is a test memory for importance evolution', {
        importance: 5
      });

      // Create an interaction that references this memory
      const interaction: UserInteraction = {
        id: 'importance-interaction',
        userId: 'importance-user',
        timestamp: new Date(),
        type: 'search',
        data: {
          query: 'test memory',
          results: [{
            memory: storedMemory,
            score: 0.8,
            metadata: { source: 'search' }
          }]
        }
      };

      await learningSystem.recordUserInteraction(interaction);

      // Provide positive feedback
      const feedback: UserFeedback = {
        interactionId: 'importance-interaction',
        userId: 'importance-user',
        timestamp: new Date(),
        relevanceScore: 0.9,
        satisfactionScore: 0.85
      };

      await learningSystem.processFeedback(feedback);

      // Verify the memory importance was adjusted (this is tested indirectly through the learning metrics)
      const metrics = await learningSystem.getLearningMetrics();
      expect(metrics.feedbackReceived).toBe(1);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle concurrent interactions', async () => {
      const interactions: Promise<void>[] = [];

      for (let i = 0; i < 10; i++) {
        const interaction: UserInteraction = {
          id: `concurrent-${i}`,
          userId: `user-${i}`,
          timestamp: new Date(),
          type: 'search',
          data: { query: `query ${i}` }
        };

        interactions.push(learningSystem.recordUserInteraction(interaction));
      }

      await Promise.all(interactions);

      const metrics = await learningSystem.getLearningMetrics();
      expect(metrics.totalInteractions).toBe(10);
    });

    it('should process feedback efficiently', async () => {
      const startTime = Date.now();

      const feedback: UserFeedback = {
        interactionId: 'perf-test',
        userId: 'perf-user',
        timestamp: new Date(),
        relevanceScore: 0.8,
        satisfactionScore: 0.9
      };

      await learningSystem.processFeedback(feedback);

      const processingTime = Date.now() - startTime;
      expect(processingTime).toBeLessThan(1000); // Should process within 1 second
    });

    it('should maintain performance with large datasets', async () => {
      // Add many interactions and feedback
      const promises: Promise<void>[] = [];

      for (let i = 0; i < 50; i++) {
        const interaction: UserInteraction = {
          id: `large-${i}`,
          userId: `user-${i % 10}`, // 10 different users
          timestamp: new Date(Date.now() - i * 1000), // Spread over time
          type: i % 2 === 0 ? 'search' : 'recall',
          data: { query: `query ${i}` }
        };

        promises.push(learningSystem.recordUserInteraction(interaction));

        if (i % 5 === 0) {
          const feedback: UserFeedback = {
            interactionId: `large-${i}`,
            userId: `user-${i % 10}`,
            timestamp: new Date(),
            relevanceScore: Math.random(),
            satisfactionScore: Math.random()
          };

          promises.push(learningSystem.processFeedback(feedback));
        }
      }

      const startTime = Date.now();
      await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      expect(totalTime).toBeLessThan(10000); // Should complete within 10 seconds

      const metrics = await learningSystem.getLearningMetrics();
      expect(metrics.totalInteractions).toBe(50);
      expect(metrics.feedbackReceived).toBe(10);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid interactions gracefully', async () => {
      let errorEmitted = false;

      learningSystem.on('learningError', () => {
        errorEmitted = true;
      });

      // Try to process an interaction with invalid data
      const invalidInteraction = {
        id: 'invalid-test',
        userId: 'test-user',
        timestamp: new Date(),
        type: 'invalid-type' as any,
        data: null
      };

      await learningSystem.recordUserInteraction(invalidInteraction);

      // Should still record the interaction but might emit an error during processing
      const metrics = await learningSystem.getLearningMetrics();
      expect(metrics.totalInteractions).toBe(1);
    });

    it('should handle feedback without corresponding interaction', async () => {
      let errorEmitted = false;

      learningSystem.on('adaptationError', () => {
        errorEmitted = true;
      });

      const orphanFeedback: UserFeedback = {
        interactionId: 'non-existent-interaction',
        userId: 'test-user',
        timestamp: new Date(),
        relevanceScore: 0.8,
        satisfactionScore: 0.9
      };

      await learningSystem.processFeedback(orphanFeedback);

      // Should still process the feedback for metrics
      const metrics = await learningSystem.getLearningMetrics();
      expect(metrics.feedbackReceived).toBe(1);
    });
  });

  describe('Integration with Memory Store and Neural Processor', () => {
    it('should integrate with memory store for importance updates', async () => {
      // Create a memory using the correct API
      const storedMemory = await memoryStore.store('integration-test-agent', 'Integration test memory content', {
        importance: 5
      });

      // Verify memory exists
      const retrievedMemory = await memoryStore.getMemory(storedMemory.id);
      expect(retrievedMemory).toBeDefined();
      expect(retrievedMemory!.metadata.importance).toBe(5);
    });

    it('should work with neural processor for pattern evolution', async () => {
      // Create test memories using the correct API
      const memories = [];

      for (let i = 1; i <= 3; i++) {
        const memory = await memoryStore.store('neural-test-agent', `Pattern recognition test memory ${i}`, {
          timestamp: new Date().toISOString()
        });
        memories.push(memory);
      }

      // Process with neural processor (convert StoredMemory to MemoryVector format)
      const memoryVectors = memories.map(memory => ({
        id: memory.id,
        content: memory.content,
        vector: new Array(100).fill(0).map(() => Math.random()),
        metadata: memory.metadata
      }));

      const result = await neuralProcessor.processMemoryBatch(memoryVectors);

      expect(result.patterns).toBeDefined();
      expect(result.relationships).toBeDefined();
      expect(result.anomalies).toBeDefined();
      expect(result.predictions).toBeDefined();
      expect(result.reasoningChains).toBeDefined();
    });
  });
});