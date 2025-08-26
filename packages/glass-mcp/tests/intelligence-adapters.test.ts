/**
 * Glass MCP v7.0 - Intelligence Adapters Test Suite
 * 
 * Comprehensive tests for AI intelligence adapter components.
 * 
 * @version 7.0.0-alpha.1
 * @since 2025-08-26
 */

import {
  ContextAnalyzerAdapter,
  DecisionEngineAdapter,
  LearningSystemAdapter,
  IntelligenceProviderFactory
} from '../src/automation/intelligence-adapters';

import { createMockAutomationContext, delay, measurePerformance } from './setup';

describe('Intelligence Adapters', () => {
  describe('ContextAnalyzerAdapter', () => {
    let analyzer: ContextAnalyzerAdapter;

    beforeEach(() => {
      analyzer = new ContextAnalyzerAdapter();
    });

    describe('Initialization', () => {
      it('should initialize successfully', async () => {
        await expect(analyzer.initialize()).resolves.toBeUndefined();
      });

      it('should throw error when analyzing context before initialization', async () => {
        const mockContext = createMockAutomationContext();
        
        await expect(analyzer.analyzeContext(mockContext))
          .rejects
          .toThrow('Context analyzer not initialized');
      });
    });

    describe('Context Analysis', () => {
      beforeEach(async () => {
        await analyzer.initialize();
      });

      it('should analyze context and return valid result', async () => {
        const mockContext = createMockAutomationContext();
        const result = await analyzer.analyzeContext(mockContext);

        expect(result).toHaveProperty('confidence');
        expect(result).toHaveProperty('analysis');
        expect(result).toHaveProperty('recommendations');
        expect(result).toHaveProperty('metadata');

        expect(typeof result.confidence).toBe('number');
        expect(result.confidence).toBeGreaterThan(0);
        expect(result.confidence).toBeLessThanOrEqual(1);
        
        expect(Array.isArray(result.recommendations)).toBe(true);
        expect(typeof result.analysis).toBe('string');
        expect(typeof result.metadata).toBe('object');
      });

      it('should provide capabilities list', async () => {
        const capabilities = await analyzer.getCapabilities();
        
        expect(Array.isArray(capabilities)).toBe(true);
        expect(capabilities.length).toBeGreaterThan(0);
        expect(capabilities).toContain('Context understanding');
        expect(capabilities).toContain('Pattern recognition');
      });

      it('should maintain performance benchmarks', async () => {
        const mockContext = createMockAutomationContext();
        
        const performance = await measurePerformance(
          async () => await analyzer.analyzeContext(mockContext),
          10
        );

        // Context analysis should complete within reasonable time
        expect(performance.averageTime).toBeLessThan(100); // 100ms average
      });
    });
  });

  describe('DecisionEngineAdapter', () => {
    let engine: DecisionEngineAdapter;

    beforeEach(() => {
      engine = new DecisionEngineAdapter();
    });

    describe('Initialization', () => {
      it('should initialize successfully', async () => {
        await expect(engine.initialize()).resolves.toBeUndefined();
      });

      it('should throw error when making decision before initialization', async () => {
        const mockContext = createMockAutomationContext();
        const mockOptions = ['option1', 'option2'];
        
        await expect(engine.makeDecision(mockContext, mockOptions))
          .rejects
          .toThrow('Decision engine not initialized');
      });
    });

    describe('Decision Making', () => {
      beforeEach(async () => {
        await engine.initialize();
      });

      it('should make decision and return valid result', async () => {
        const mockContext = createMockAutomationContext();
        const mockOptions = ['option1', 'option2', 'option3'];
        const result = await engine.makeDecision(mockContext, mockOptions);

        expect(result).toHaveProperty('decision');
        expect(result).toHaveProperty('confidence');
        expect(result).toHaveProperty('reasoning');
        expect(result).toHaveProperty('alternatives');
        expect(result).toHaveProperty('metadata');

        expect(typeof result.decision).toBe('string');
        expect(typeof result.confidence).toBe('number');
        expect(Array.isArray(result.reasoning)).toBe(true);
        expect(Array.isArray(result.alternatives)).toBe(true);
        
        expect(result.confidence).toBeGreaterThan(0);
        expect(result.confidence).toBeLessThanOrEqual(1);
      });

      it('should handle empty options array', async () => {
        const mockContext = createMockAutomationContext();
        const result = await engine.makeDecision(mockContext, []);

        expect(result.decision).toBe('default');
        expect(result.alternatives.length).toBe(0);
      });

      it('should provide capabilities list', async () => {
        const capabilities = await engine.getCapabilities();
        
        expect(Array.isArray(capabilities)).toBe(true);
        expect(capabilities.length).toBeGreaterThan(0);
        expect(capabilities).toContain('Multi-criteria decision making');
        expect(capabilities).toContain('Risk assessment');
      });

      it('should maintain performance benchmarks', async () => {
        const mockContext = createMockAutomationContext();
        const mockOptions = ['option1', 'option2', 'option3'];
        
        const performance = await measurePerformance(
          async () => await engine.makeDecision(mockContext, mockOptions),
          10
        );

        // Decision making should complete within reasonable time
        expect(performance.averageTime).toBeLessThan(50); // 50ms average
      });
    });
  });

  describe('LearningSystemAdapter', () => {
    let system: LearningSystemAdapter;

    beforeEach(() => {
      system = new LearningSystemAdapter();
    });

    describe('Initialization', () => {
      it('should initialize successfully', async () => {
        await expect(system.initialize()).resolves.toBeUndefined();
      });

      it('should throw error when learning before initialization', async () => {
        const mockExperience = { success: true, performance: 0.8 };
        
        await expect(system.learn(mockExperience))
          .rejects
          .toThrow('Learning system not initialized');
      });
    });

    describe('Learning Capabilities', () => {
      beforeEach(async () => {
        await system.initialize();
      });

      it('should learn from experience and return feedback', async () => {
        const mockExperience = { success: true, performance: 0.8 };
        const feedback = await system.learn(mockExperience);

        expect(feedback).toHaveProperty('success');
        expect(feedback).toHaveProperty('performance');
        expect(feedback).toHaveProperty('insights');
        expect(feedback).toHaveProperty('adjustments');

        expect(typeof feedback.success).toBe('boolean');
        expect(typeof feedback.performance).toBe('number');
        expect(Array.isArray(feedback.insights)).toBe(true);
        expect(typeof feedback.adjustments).toBe('object');
        
        expect(feedback.performance).toBeGreaterThan(0);
        expect(feedback.performance).toBeLessThanOrEqual(1);
      });

      it('should accumulate learning experiences', async () => {
        const experiences = [
          { success: true, performance: 0.8 },
          { success: false, performance: 0.3 },
          { success: true, performance: 0.9 }
        ];

        for (const experience of experiences) {
          await system.learn(experience);
        }

        const insights = await system.getInsights();
        expect(insights.length).toBeGreaterThan(0);
        expect(insights[0]).toContain('3 learning experiences');
      });

      it('should provide capabilities list', async () => {
        const capabilities = await system.getCapabilities();
        
        expect(Array.isArray(capabilities)).toBe(true);
        expect(capabilities.length).toBeGreaterThan(0);
        expect(capabilities).toContain('Experience-based learning');
        expect(capabilities).toContain('Pattern recognition');
      });

      it('should maintain performance benchmarks', async () => {
        const mockExperience = { success: true, performance: 0.8 };
        
        const performance = await measurePerformance(
          async () => await system.learn(mockExperience),
          10
        );

        // Learning should complete within reasonable time
        expect(performance.averageTime).toBeLessThan(25); // 25ms average
      });
    });
  });

  describe('IntelligenceProviderFactory', () => {
    describe('Component Creation', () => {
      it('should create context analyzer', () => {
        const analyzer = IntelligenceProviderFactory.createContextAnalyzer();
        expect(analyzer).toBeInstanceOf(ContextAnalyzerAdapter);
      });

      it('should create decision engine', () => {
        const engine = IntelligenceProviderFactory.createDecisionEngine();
        expect(engine).toBeInstanceOf(DecisionEngineAdapter);
      });

      it('should create learning system', () => {
        const system = IntelligenceProviderFactory.createLearningSystem();
        expect(system).toBeInstanceOf(LearningSystemAdapter);
      });

      it('should create complete intelligence stack', async () => {
        const stack = await IntelligenceProviderFactory.createIntelligenceStack();
        
        expect(stack).toHaveProperty('contextAnalyzer');
        expect(stack).toHaveProperty('decisionEngine');
        expect(stack).toHaveProperty('learningSystem');

        expect(stack.contextAnalyzer).toBeInstanceOf(ContextAnalyzerAdapter);
        expect(stack.decisionEngine).toBeInstanceOf(DecisionEngineAdapter);
        expect(stack.learningSystem).toBeInstanceOf(LearningSystemAdapter);

        // All components should be initialized
        const mockContext = createMockAutomationContext();
        const mockOptions = ['option1', 'option2'];
        const mockExperience = { success: true, performance: 0.8 };

        await expect(stack.contextAnalyzer.analyzeContext(mockContext))
          .resolves
          .toBeDefined();
        
        await expect(stack.decisionEngine.makeDecision(mockContext, mockOptions))
          .resolves
          .toBeDefined();
        
        await expect(stack.learningSystem.learn(mockExperience))
          .resolves
          .toBeDefined();
      });
    });

    describe('Integration Performance', () => {
      it('should create intelligence stack within performance benchmarks', async () => {
        const performance = await measurePerformance(
          async () => await IntelligenceProviderFactory.createIntelligenceStack(),
          5
        );

        // Stack creation should be reasonably fast
        expect(performance.averageTime).toBeLessThan(200); // 200ms average
      });
    });
  });
});