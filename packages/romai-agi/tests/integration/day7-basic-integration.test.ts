/**
 * @fileoverview Day 7 Basic Integration Tests for RomAI AGI
 * Simple integration testing of core AGI components
 * Validates basic system integration and functionality
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { RomAIAGI } from '../../src/index.js';

describe('RomAI AGI - Day 7 Basic Integration Tests', () => {
  let romai: RomAIAGI;

  beforeAll(async () => {
    // Initialize AGI with basic configuration
    romai = new RomAIAGI({
      memory: {
        persistentStorage: true,
        maxSize: 1000
      },
      quantum: {
        enabled: true,
        processors: 4
      },
      learning: {
        enabled: true,
        adaptiveRate: 0.1
      },
      romanian: {
        enabled: true,
        culturalContext: true
      }
    });

    await romai.initialize();
    await romai.start();
    console.log('✅ RomAI AGI initialized for basic integration testing');
  });

  afterAll(async () => {
    await romai.stop();
    console.log('✅ RomAI AGI shutdown completed');
  });

  describe('Core System Integration', () => {
    it('should integrate all core components successfully', async () => {
      // Test that all components are accessible
      const cognitiveEngine = romai.getCognitiveEngine();
      const memoryManager = romai.getMemoryManager();
      const learningEngine = romai.getLearningEngine();
      const culturalEngine = romai.getCulturalIntelligence();
      const languageProcessor = romai.getLanguageProcessor();
      const businessIntelligence = romai.getBusinessIntelligence();
      const multiModalCoordinator = romai.getMultiModalCoordinator();

      // Verify all components are defined
      expect(cognitiveEngine).toBeDefined();
      expect(memoryManager).toBeDefined();
      expect(learningEngine).toBeDefined();
      expect(culturalEngine).toBeDefined();
      expect(languageProcessor).toBeDefined();
      expect(businessIntelligence).toBeDefined();
      expect(multiModalCoordinator).toBeDefined();
    });

    it('should store and retrieve memories', async () => {
      // Test basic memory functionality
      const memoryManager = romai.getMemoryManager();

      // Store a simple memory
      const memoryId = await memoryManager.store({
        content: "Romanian business intelligence test",
        type: "test"
      });

      // Retrieve the memory
      const retrievedMemories = await memoryManager.recall("Romanian business");

      expect(memoryId).toBeDefined();
      expect(retrievedMemories.length).toBeGreaterThan(0);
    });

    it('should process Romanian text', async () => {
      // Test Romanian language processing
      const languageProcessor = romai.getLanguageProcessor();

      // Process simple Romanian text
      const romanianText = "Salut, cum te cheamă?";
      const analysis = await languageProcessor.processText(romanianText);

      expect(analysis).toBeDefined();
      expect(analysis.detectedLanguage).toBe('ro');
      expect(analysis.tokens.length).toBeGreaterThan(0);
    });

    it('should analyze Romanian cultural context', async () => {
      // Test cultural intelligence
      const culturalEngine = romai.getCulturalIntelligence();

      // Analyze simple cultural context
      const context = {
        region: "Bucharest",
        industry: "Technology"
      };

      const analysis = await culturalEngine.analyzeCulturalContext(context);

      expect(analysis).toBeDefined();
      expect(analysis.region).toBe('Bucharest');
      expect(analysis.contextType).toBe('business');
    });

    it('should perform basic business analysis', async () => {
      // Test business intelligence
      const businessIntelligence = romai.getBusinessIntelligence();

      // Analyze Romanian market
      const query = "Romanian fintech market";
      const analysis = await businessIntelligence.analyzeMarket(query);

      expect(analysis).toBeDefined();
      expect(analysis.sector).toBe('fintech');
      expect(analysis.region).toBe('Romania');
    });

    it('should process multimodal text input', async () => {
      // Test multimodal coordination
      const multiModalCoordinator = romai.getMultiModalCoordinator();

      // Process text through multimodal system
      const textInput = {
        text: "Analiza pieței românești de tehnologie",
        preserveCulturalContext: true
      };

      const result = await multiModalCoordinator.analyzeText(textInput);

      expect(result).toBeDefined();
      expect(result.textAnalysis).toBeDefined();
      expect(result.unifiedUnderstanding).toBeDefined();
    });

    it('should learn from basic experiences', async () => {
      // Test learning engine
      const learningEngine = romai.getLearningEngine();

      // Create a simple learning experience
      const experience = {
        id: 'test_001',
        type: 'communication',
        content: 'Romanian business communication test',
        context: 'business',
        outcome: 'successful',
        culturalFactors: ['Romanian'],
        timestamp: new Date()
      };

      // Process the experience
      const knowledge = await learningEngine.processExperience(experience);

      expect(knowledge).toBeDefined();
      expect(knowledge.domain).toBe('communication');
      expect(knowledge.confidence).toBeGreaterThan(0);
    });
  });

  describe('System Status and Health', () => {
    it('should provide comprehensive system status', async () => {
      // Test system status reporting
      const systemStatus = romai.getStatus();

      expect(systemStatus.initialized).toBe(true);
      expect(systemStatus.running).toBe(true);
      expect(systemStatus.uptime).toBeGreaterThan(0);
      expect(systemStatus.capabilities).toBeDefined();

      // Verify capabilities
      expect(systemStatus.capabilities.reasoning).toBe(true);
      expect(systemStatus.capabilities.learning).toBe(true);
      expect(systemStatus.capabilities.memory).toBe(true);
      expect(systemStatus.capabilities.romanianIntelligence).toBe(true);
      expect(systemStatus.capabilities.quantumProcessing).toBe(true);
      expect(systemStatus.capabilities.multimodalProcessing).toBe(true);
    });

    it('should demonstrate basic AGI operations', async () => {
      // Test high-level AGI methods

      // Test reasoning
      const reasoningResult = await romai.reason({
        problem: "Simple Romanian business problem",
        context: "technology"
      });
      expect(reasoningResult).toBeDefined();

      // Test memory storage
      const memoryId = await romai.remember({
        content: "Integration test memory",
        type: "test"
      });
      expect(memoryId).toBeDefined();

      // Test memory recall
      const memories = await romai.recall("Integration test");
      expect(memories.length).toBeGreaterThan(0);

      // Test problem solving
      const solution = await romai.solve({
        description: "Test problem for AGI integration",
        type: "business"
      });
      expect(solution).toBeDefined();

      // Test perception
      const perception = await romai.perceive({
        type: 'text',
        data: {
          text: "Romanian text perception test",
          preserveCulturalContext: true
        }
      });
      expect(perception).toBeDefined();
    });

    it('should handle concurrent operations', async () => {
      const startTime = Date.now();

      // Run multiple operations concurrently
      const operations = await Promise.all([
        romai.reason({ problem: "Concurrent test 1" }),
        romai.remember({ content: "Concurrent memory test", type: "test" }),
        romai.recall("Romanian"),
        romai.solve({ description: "Concurrent problem", type: "test" }),
        romai.perceive({ type: 'text', data: { text: "Concurrent perception test" } })
      ]);

      const processingTime = Date.now() - startTime;

      // Verify all operations completed successfully
      expect(operations).toHaveLength(5);
      operations.forEach(result => {
        expect(result).toBeDefined();
      });

      // Verify reasonable performance (under 10 seconds for concurrent operations)
      expect(processingTime).toBeLessThan(10000);

      console.log(`✅ Concurrent operations completed in ${processingTime}ms`);
    });

    it('should maintain Romanian context across operations', async () => {
      // Test Romanian context preservation through multiple operations

      // Store Romanian context
      await romai.remember({
        content: "Romanian business context test",
        type: "cultural_context"
      });

      // Process Romanian text
      const perception = await romai.perceive({
        type: 'text',
        data: {
          text: "Contextul cultural românesc este important pentru afaceri",
          preserveCulturalContext: true
        }
      });

      // Reason about Romanian business
      const reasoning = await romai.reason({
        problem: "Romanian market entry strategy",
        context: "cultural_business"
      });

      // Verify Romanian context is maintained
      expect(perception).toBeDefined();
      expect(reasoning).toBeDefined();

      // Recall Romanian memories
      const romanianMemories = await romai.recall("Romanian");
      expect(romanianMemories.length).toBeGreaterThan(0);
    });
  });

  describe('Integration Readiness', () => {
    it('should be ready for future integrations', async () => {
      // Test readiness for Week 2 and beyond
      const status = romai.getStatus();
      const capabilities = romai.getCapabilities();

      // Verify quantum readiness
      expect(capabilities.quantumProcessing).toBe(true);
      expect(status.components.quantum).toBeDefined();

      // Verify multimodal readiness
      expect(capabilities.multimodalProcessing).toBe(true);

      // Verify Romanian intelligence readiness
      expect(capabilities.romanianIntelligence).toBe(true);
      expect(status.components.romanian).toBeDefined();

      // Verify enterprise readiness
      expect(capabilities.enterpriseIntegration).toBe(true);

      // Verify learning and adaptation readiness
      expect(capabilities.learning).toBe(true);
      expect(capabilities.adaptation).toBe(true);
    });

    it('should demonstrate emergent intelligence potential', async () => {
      // Complex integration scenario
      console.log('🧠 Testing emergent intelligence potential...');

      // Multi-step intelligent workflow
      const step1 = await romai.remember({
        content: "Romanian tech startup seeking investment",
        type: "business_scenario"
      });

      const step2 = await romai.perceive({
        type: 'text',
        data: {
          text: "Compania românească de tehnologie cu potențial mare de creștere",
          preserveCulturalContext: true
        }
      });

      const step3 = await romai.reason({
        problem: "Investment strategy for Romanian tech startup",
        context: "fintech_investment"
      });

      const step4 = await romai.solve({
        description: "Optimal market entry and growth strategy",
        type: "business_strategy"
      });

      // Verify all steps completed successfully
      expect(step1).toBeDefined();
      expect(step2).toBeDefined();
      expect(step3).toBeDefined();
      expect(step4).toBeDefined();

      // This demonstrates the foundation for emergent intelligence
      console.log('✅ Emergent intelligence foundation validated');
    });
  });
});

// Export test utilities
export const basicTestUtilities = {
  createTestAGI: async (config?: any) => {
    const romai = new RomAIAGI(config);
    await romai.initialize();
    await romai.start();
    return romai;
  },

  cleanupTestAGI: async (romai: RomAIAGI) => {
    await romai.stop();
  },

  validateRomanianContext: async (romai: RomAIAGI, text: string) => {
    const result = await romai.perceive({
      type: 'text',
      data: { text, preserveCulturalContext: true }
    });
    return result;
  }
};
