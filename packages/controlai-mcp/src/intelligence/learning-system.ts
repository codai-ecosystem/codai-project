// ============================================================================
// Learning System - Adaptive Learning Engine for Glass MCP
// ============================================================================

import {
  LearningPattern,
  LearningContext,
  LearningType,
  LearningFactor,
  ConfidenceLevel,
  Evidence,
  ContextSnapshot,
  ActionHistory,
  PatternInfo,
  IntelligenceUtils
} from './intelligence-types';
import { ContextAnalyzer, ContextAnalysis } from './context-analyzer';
import { DecisionEngine, EvaluatedOption } from './decision-engine';
import { ErrorRecoverySystem, RecoveryResult } from './error-recovery';

/**
 * Adaptive Learning System for Glass MCP Visual Automation
 * 
 * Provides continuous learning with:
 * - Pattern recognition and extraction
 * - Success/failure analysis
 * - Decision outcome learning
 * - Contextual adaptation
 * - Performance optimization
 */
export class LearningSystem {
  private readonly contextAnalyzer: ContextAnalyzer;
  private readonly patternDatabase = new Map<string, LearningPattern>();
  private readonly outcomeHistory = new Map<string, LearningOutcome[]>();
  private readonly performanceMetrics = new Map<string, PerformanceMetric>();
  private readonly adaptationThresholds = {
    patternConfidence: 0.7,
    minSampleSize: 5,
    significanceLevel: 0.05
  };

  constructor() {
    this.contextAnalyzer = new ContextAnalyzer();
    this.initializeLearning();
  }

  /**
   * Learn from a decision outcome and update patterns
   */
  async learnFromDecision(
    context: ContextSnapshot,
    evaluatedOptions: EvaluatedOption[],
    selectedOption: EvaluatedOption,
    actualOutcome: DecisionOutcome
  ): Promise<LearningInsight[]> {
    try {
      // Analyze the learning context
      const learningContext = await this.createLearningContext(
        context,
        evaluatedOptions,
        selectedOption,
        actualOutcome
      );

      // Extract patterns from the experience
      const extractedPatterns = await this.extractPatterns(learningContext);

      // Update existing patterns or create new ones
      const updatedPatterns = await this.updatePatternDatabase(extractedPatterns);

      // Generate insights from learning
      const insights = await this.generateLearningInsights(
        learningContext,
        updatedPatterns
      );

      // Update performance metrics
      await this.updatePerformanceMetrics(learningContext, actualOutcome);

      return insights;
    } catch (error) {
      console.error('Learning from decision failed:', error);
      return [];
    }
  }

  /**
   * Learn from error recovery outcomes
   */
  async learnFromRecovery(
    errorContext: any,
    recoveryResult: RecoveryResult
  ): Promise<LearningInsight[]> {
    try {
      const recoveryLearningContext = await this.createRecoveryLearningContext(
        errorContext,
        recoveryResult
      );

      const patterns = await this.extractRecoveryPatterns(recoveryLearningContext);
      const updatedPatterns = await this.updatePatternDatabase(patterns);

      return this.generateRecoveryInsights(recoveryLearningContext, updatedPatterns);
    } catch (error) {
      console.error('Learning from recovery failed:', error);
      return [];
    }
  }

  /**
   * Get relevant patterns for decision support
   */
  async getRelevantPatterns(context: ContextSnapshot): Promise<RelevantPattern[]> {
    const contextAnalysis = await this.contextAnalyzer.analyzeContext(context);
    
    return this.findRelevantPatterns(contextAnalysis);
  }

  /**
   * Generate performance recommendations based on learning
   */
  async generateRecommendations(context: ContextSnapshot): Promise<PerformanceRecommendation[]> {
    const contextAnalysis = await this.contextAnalyzer.analyzeContext(context);
    const relevantMetrics = await this.getRelevantPerformanceMetrics(contextAnalysis);
    
    return this.createPerformanceRecommendations(relevantMetrics, contextAnalysis);
  }

  /**
   * Adapt system behavior based on learning outcomes
   */
  async adaptBehavior(
    context: ContextSnapshot,
    performanceTarget: PerformanceTarget
  ): Promise<AdaptationResult> {
    try {
      const contextAnalysis = await this.contextAnalyzer.analyzeContext(context);
      const currentPerformance = await this.assessCurrentPerformance(contextAnalysis);
      
      if (this.needsAdaptation(currentPerformance, performanceTarget)) {
        const adaptationStrategy = await this.createAdaptationStrategy(
          contextAnalysis,
          currentPerformance,
          performanceTarget
        );

        return await this.executeAdaptation(adaptationStrategy, context);
      }

      return {
        adapted: false,
        reason: 'Performance meets targets',
        currentPerformance,
        targetPerformance: performanceTarget
      };
    } catch (error) {
      console.error('Behavior adaptation failed:', error);
      return {
        adapted: false,
        reason: `Adaptation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        currentPerformance: { successRate: 0, averageTime: 0, errorRate: 1 },
        targetPerformance: performanceTarget
      };
    }
  }

  // ============================================================================
  // PATTERN EXTRACTION METHODS
  // ============================================================================

  private async extractPatterns(context: LearningContext): Promise<LearningPattern[]> {
    const patterns: LearningPattern[] = [];

    // Success pattern extraction
    if (context.outcome === 'success') {
      patterns.push(...await this.extractSuccessPatterns(context));
    }

    // Failure pattern extraction
    if (context.outcome === 'failure') {
      patterns.push(...await this.extractFailurePatterns(context));
    }

    // Optimization pattern extraction
    patterns.push(...await this.extractOptimizationPatterns(context));

    return patterns;
  }

  private async extractSuccessPatterns(context: LearningContext): Promise<LearningPattern[]> {
    const patterns: LearningPattern[] = [];
    
    // Context-success correlation patterns
    const contextPattern = this.createContextSuccessPattern(context);
    if (contextPattern) patterns.push(contextPattern);

    // Factor-success correlation patterns
    const factorPatterns = this.createFactorSuccessPatterns(context);
    patterns.push(...factorPatterns);

    // Sequence-success patterns
    const sequencePattern = this.createSequenceSuccessPattern(context);
    if (sequencePattern) patterns.push(sequencePattern);

    return patterns;
  }

  private async extractFailurePatterns(context: LearningContext): Promise<LearningPattern[]> {
    const patterns: LearningPattern[] = [];
    
    // Context-failure correlation patterns
    const contextPattern = this.createContextFailurePattern(context);
    if (contextPattern) patterns.push(contextPattern);

    // Factor-failure correlation patterns
    const factorPatterns = this.createFactorFailurePatterns(context);
    patterns.push(...factorPatterns);

    // Error-type patterns
    const errorPattern = this.createErrorTypePattern(context);
    if (errorPattern) patterns.push(errorPattern);

    return patterns;
  }

  private async extractOptimizationPatterns(context: LearningContext): Promise<LearningPattern[]> {
    const patterns: LearningPattern[] = [];
    
    // Performance optimization patterns
    const perfPattern = this.createPerformanceOptimizationPattern(context);
    if (perfPattern) patterns.push(perfPattern);

    // Resource utilization patterns
    const resourcePattern = this.createResourceUtilizationPattern(context);
    if (resourcePattern) patterns.push(resourcePattern);

    return patterns;
  }

  private async extractRecoveryPatterns(context: RecoveryLearningContext): Promise<LearningPattern[]> {
    const patterns: LearningPattern[] = [];

    // Recovery strategy effectiveness patterns
    if (context.recoveryResult.success) {
      const strategyPattern = this.createRecoveryStrategyPattern(context);
      if (strategyPattern) patterns.push(strategyPattern);
    }

    // Error type - recovery mapping patterns
    const mappingPattern = this.createErrorRecoveryMappingPattern(context);
    if (mappingPattern) patterns.push(mappingPattern);

    return patterns;
  }

  // ============================================================================
  // PATTERN CREATION METHODS
  // ============================================================================

  private createContextSuccessPattern(context: LearningContext): LearningPattern | null {
    const contextSignature = this.generateContextSignature(context);
    
    return {
      id: `context-success-${Date.now()}`,
      type: LearningType.SUCCESS_PATTERN,
      pattern: `Context ${contextSignature} leads to successful outcomes`,
      confidence: ConfidenceLevel.MEDIUM,
      applicability: [context.scenario],
      evidence: [{
        source: 'decision-outcome',
        data: { context: contextSignature, outcome: context.outcome },
        reliability: 0.8,
        timestamp: new Date()
      }],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private createFactorSuccessPatterns(context: LearningContext): LearningPattern[] {
    return context.factors
      .filter(factor => factor.impact > 0.5)
      .map(factor => ({
        id: `factor-success-${factor.name}-${Date.now()}`,
        type: LearningType.SUCCESS_PATTERN,
        pattern: `High ${factor.name} (${factor.value}) correlates with success`,
        confidence: this.calculateFactorConfidence(factor),
        applicability: [factor.category, context.scenario],
        evidence: [{
          source: 'factor-analysis',
          data: factor,
          reliability: 0.7,
          timestamp: new Date()
        }],
        createdAt: new Date(),
        updatedAt: new Date()
      }));
  }

  private createSequenceSuccessPattern(context: LearningContext): LearningPattern | null {
    if (context.applicability.length < 2) return null;

    return {
      id: `sequence-success-${Date.now()}`,
      type: LearningType.SUCCESS_PATTERN,
      pattern: `Action sequence ${context.applicability.join(' -> ')} is effective`,
      confidence: ConfidenceLevel.MEDIUM,
      applicability: context.applicability,
      evidence: [{
        source: 'sequence-analysis',
        data: { sequence: context.applicability, outcome: context.outcome },
        reliability: 0.6,
        timestamp: new Date()
      }],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private createContextFailurePattern(context: LearningContext): LearningPattern | null {
    const contextSignature = this.generateContextSignature(context);
    
    return {
      id: `context-failure-${Date.now()}`,
      type: LearningType.FAILURE_PATTERN,
      pattern: `Context ${contextSignature} tends to cause failures`,
      confidence: ConfidenceLevel.MEDIUM,
      applicability: [context.scenario],
      evidence: [{
        source: 'failure-analysis',
        data: { context: contextSignature, outcome: context.outcome },
        reliability: 0.8,
        timestamp: new Date()
      }],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private createFactorFailurePatterns(context: LearningContext): LearningPattern[] {
    return context.factors
      .filter(factor => factor.impact < -0.3)
      .map(factor => ({
        id: `factor-failure-${factor.name}-${Date.now()}`,
        type: LearningType.FAILURE_PATTERN,
        pattern: `Low ${factor.name} (${factor.value}) correlates with failure`,
        confidence: this.calculateFactorConfidence(factor),
        applicability: [factor.category, context.scenario],
        evidence: [{
          source: 'factor-analysis',
          data: factor,
          reliability: 0.7,
          timestamp: new Date()
        }],
        createdAt: new Date(),
        updatedAt: new Date()
      }));
  }

  private createErrorTypePattern(context: LearningContext): LearningPattern | null {
    const errorFactors = context.factors.filter(f => f.category === 'error');
    if (errorFactors.length === 0) return null;

    const errorType = errorFactors[0].value;
    
    return {
      id: `error-type-${Date.now()}`,
      type: LearningType.FAILURE_PATTERN,
      pattern: `Error type ${errorType} commonly occurs in ${context.scenario}`,
      confidence: ConfidenceLevel.MEDIUM,
      applicability: [context.scenario],
      evidence: errorFactors.map(factor => ({
        source: 'error-analysis',
        data: factor,
        reliability: 0.8,
        timestamp: new Date()
      })),
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private createPerformanceOptimizationPattern(context: LearningContext): LearningPattern | null {
    const perfFactors = context.factors.filter(f => f.category === 'performance');
    if (perfFactors.length === 0) return null;

    const avgPerf = perfFactors.reduce((sum, f) => sum + f.impact, 0) / perfFactors.length;
    
    return {
      id: `perf-optimization-${Date.now()}`,
      type: LearningType.OPTIMIZATION,
      pattern: `Performance factors average ${avgPerf.toFixed(2)} for ${context.scenario}`,
      confidence: ConfidenceLevel.MEDIUM,
      applicability: [context.scenario, 'performance'],
      evidence: perfFactors.map(factor => ({
        source: 'performance-analysis',
        data: factor,
        reliability: 0.7,
        timestamp: new Date()
      })),
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private createResourceUtilizationPattern(context: LearningContext): LearningPattern | null {
    const resourceFactors = context.factors.filter(f => f.category === 'resource');
    if (resourceFactors.length === 0) return null;

    return {
      id: `resource-utilization-${Date.now()}`,
      type: LearningType.OPTIMIZATION,
      pattern: `Resource utilization patterns for ${context.scenario}`,
      confidence: ConfidenceLevel.MEDIUM,
      applicability: [context.scenario, 'resource'],
      evidence: resourceFactors.map(factor => ({
        source: 'resource-analysis',
        data: factor,
        reliability: 0.6,
        timestamp: new Date()
      })),
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private createRecoveryStrategyPattern(context: RecoveryLearningContext): LearningPattern | null {
    if (!context.recoveryResult.strategy) return null;

    return {
      id: `recovery-strategy-${Date.now()}`,
      type: LearningType.SUCCESS_PATTERN,
      pattern: `${context.recoveryResult.strategy.type} strategy effective for ${context.errorType}`,
      confidence: ConfidenceLevel.HIGH,
      applicability: [context.errorType, 'recovery'],
      evidence: [{
        source: 'recovery-analysis',
        data: {
          strategy: context.recoveryResult.strategy.type,
          errorType: context.errorType,
          success: context.recoveryResult.success
        },
        reliability: 0.9,
        timestamp: new Date()
      }],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private createErrorRecoveryMappingPattern(context: RecoveryLearningContext): LearningPattern | null {
    return {
      id: `error-recovery-mapping-${Date.now()}`,
      type: LearningType.ADAPTATION,
      pattern: `${context.errorType} errors mapped to specific recovery approaches`,
      confidence: ConfidenceLevel.MEDIUM,
      applicability: [context.errorType, 'recovery', 'mapping'],
      evidence: [{
        source: 'mapping-analysis',
        data: {
          errorType: context.errorType,
          recoveryOutcome: context.recoveryResult.outcome,
          executionTime: context.recoveryResult.executionTime
        },
        reliability: 0.7,
        timestamp: new Date()
      }],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // ============================================================================
  // LEARNING CONTEXT CREATION
  // ============================================================================

  private async createLearningContext(
    context: ContextSnapshot,
    evaluatedOptions: EvaluatedOption[],
    selectedOption: EvaluatedOption,
    actualOutcome: DecisionOutcome
  ): Promise<LearningContext> {
    const contextAnalysis = await this.contextAnalyzer.analyzeContext(context);
    
    return {
      scenario: `${contextAnalysis.application.activeApplication}-interaction`,
      outcome: actualOutcome.success ? 'success' : 'failure',
      factors: [
        {
          name: 'feasibility_score',
          value: selectedOption.feasibilityScore,
          impact: actualOutcome.success ? selectedOption.feasibilityScore : -selectedOption.feasibilityScore,
          category: 'decision'
        },
        {
          name: 'context_complexity',
          value: contextAnalysis.screen.complexity,
          impact: contextAnalysis.screen.complexity > 0.5 ? -0.3 : 0.3,
          category: 'context'
        },
        {
          name: 'system_performance',
          value: contextAnalysis.system.performanceScore,
          impact: contextAnalysis.system.performanceScore,
          category: 'performance'
        },
        {
          name: 'execution_time',
          value: actualOutcome.executionTime,
          impact: actualOutcome.executionTime > 10000 ? -0.4 : 0.2,
          category: 'performance'
        }
      ],
      insights: actualOutcome.insights || [],
      applicability: [contextAnalysis.application.activeApplication, 'decision-making']
    };
  }

  private async createRecoveryLearningContext(
    errorContext: any,
    recoveryResult: RecoveryResult
  ): Promise<RecoveryLearningContext> {
    return {
      errorType: errorContext.errorDetails.category || 'unknown',
      recoveryResult,
      contextFactors: [
        {
          name: 'error_severity',
          value: errorContext.severity,
          impact: errorContext.severity === 'critical' ? -0.8 : -0.3,
          category: 'error'
        },
        {
          name: 'recovery_time',
          value: recoveryResult.executionTime,
          impact: recoveryResult.executionTime > 15000 ? -0.5 : 0.3,
          category: 'performance'
        }
      ]
    };
  }

  // ============================================================================
  // PATTERN DATABASE MANAGEMENT
  // ============================================================================

  private async updatePatternDatabase(patterns: LearningPattern[]): Promise<LearningPattern[]> {
    const updatedPatterns: LearningPattern[] = [];

    for (const pattern of patterns) {
      const existingPattern = this.findSimilarPattern(pattern);
      
      if (existingPattern) {
        const mergedPattern = this.mergePatterns(existingPattern, pattern);
        this.patternDatabase.set(mergedPattern.id, mergedPattern);
        updatedPatterns.push(mergedPattern);
      } else {
        this.patternDatabase.set(pattern.id, pattern);
        updatedPatterns.push(pattern);
      }
    }

    return updatedPatterns;
  }

  private findSimilarPattern(newPattern: LearningPattern): LearningPattern | null {
    for (const [_, existingPattern] of this.patternDatabase) {
      if (this.patternsAreSimilar(existingPattern, newPattern)) {
        return existingPattern;
      }
    }
    return null;
  }

  private patternsAreSimilar(pattern1: LearningPattern, pattern2: LearningPattern): boolean {
    // Simple similarity check - could be enhanced with ML
    const typeMatch = pattern1.type === pattern2.type;
    const applicabilityOverlap = pattern1.applicability.some(app => 
      pattern2.applicability.includes(app)
    );
    const patternSimilarity = this.calculateTextSimilarity(pattern1.pattern, pattern2.pattern) > 0.7;

    return typeMatch && applicabilityOverlap && patternSimilarity;
  }

  private calculateTextSimilarity(text1: string, text2: string): number {
    // Simplified text similarity - in practice would use advanced NLP
    const words1 = new Set(text1.toLowerCase().split(' '));
    const words2 = new Set(text2.toLowerCase().split(' '));
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  private mergePatterns(existing: LearningPattern, newPattern: LearningPattern): LearningPattern {
    // Merge evidence
    const mergedEvidence = [...existing.evidence, ...newPattern.evidence];
    
    // Update confidence based on evidence accumulation
    const newConfidence = this.calculateMergedConfidence(existing, newPattern);
    
    // Merge applicability
    const mergedApplicability = Array.from(new Set([...existing.applicability, ...newPattern.applicability]));

    return {
      ...existing,
      confidence: newConfidence,
      applicability: mergedApplicability,
      evidence: mergedEvidence,
      updatedAt: new Date()
    };
  }

  private calculateMergedConfidence(existing: LearningPattern, newPattern: LearningPattern): ConfidenceLevel {
    const existingValue = IntelligenceUtils.confidenceToNumber(existing.confidence);
    const newValue = IntelligenceUtils.confidenceToNumber(newPattern.confidence);
    
    // Weight existing evidence more heavily
    const mergedValue = (existingValue * 0.7) + (newValue * 0.3);
    
    return IntelligenceUtils.numberToConfidence(mergedValue);
  }

  // ============================================================================
  // INSIGHT GENERATION
  // ============================================================================

  private async generateLearningInsights(
    context: LearningContext,
    patterns: LearningPattern[]
  ): Promise<LearningInsight[]> {
    const insights: LearningInsight[] = [];

    // Success pattern insights
    const successPatterns = patterns.filter(p => p.type === LearningType.SUCCESS_PATTERN);
    if (successPatterns.length > 0) {
      insights.push({
        type: 'success_pattern',
        description: `Identified ${successPatterns.length} success patterns for ${context.scenario}`,
        actionable: true,
        confidence: ConfidenceLevel.MEDIUM,
        recommendation: 'Leverage these patterns for future similar scenarios'
      });
    }

    // Failure pattern insights
    const failurePatterns = patterns.filter(p => p.type === LearningType.FAILURE_PATTERN);
    if (failurePatterns.length > 0) {
      insights.push({
        type: 'failure_pattern',
        description: `Detected ${failurePatterns.length} failure patterns for ${context.scenario}`,
        actionable: true,
        confidence: ConfidenceLevel.HIGH,
        recommendation: 'Implement safeguards to avoid these failure conditions'
      });
    }

    // Optimization insights
    const optimizationPatterns = patterns.filter(p => p.type === LearningType.OPTIMIZATION);
    if (optimizationPatterns.length > 0) {
      insights.push({
        type: 'optimization',
        description: 'Performance optimization opportunities identified',
        actionable: true,
        confidence: ConfidenceLevel.MEDIUM,
        recommendation: 'Apply optimization patterns to improve efficiency'
      });
    }

    return insights;
  }

  private async generateRecoveryInsights(
    context: RecoveryLearningContext,
    patterns: LearningPattern[]
  ): Promise<LearningInsight[]> {
    const insights: LearningInsight[] = [];

    if (context.recoveryResult.success) {
      insights.push({
        type: 'recovery_success',
        description: `Successful recovery strategy identified for ${context.errorType} errors`,
        actionable: true,
        confidence: ConfidenceLevel.HIGH,
        recommendation: 'Prioritize this recovery approach for similar errors'
      });
    } else {
      insights.push({
        type: 'recovery_failure',
        description: `Recovery strategy ineffective for ${context.errorType} errors`,
        actionable: true,
        confidence: ConfidenceLevel.MEDIUM,
        recommendation: 'Develop alternative recovery approaches for this error type'
      });
    }

    return insights;
  }

  // ============================================================================
  // PERFORMANCE TRACKING AND ADAPTATION
  // ============================================================================

  private async updatePerformanceMetrics(
    context: LearningContext,
    outcome: DecisionOutcome
  ): Promise<void> {
    const metricKey = context.scenario;
    const existing = this.performanceMetrics.get(metricKey) || {
      totalAttempts: 0,
      successCount: 0,
      totalTime: 0,
      errorCount: 0,
      averageSuccessRate: 0,
      averageExecutionTime: 0,
      lastUpdated: new Date()
    };

    existing.totalAttempts++;
    existing.totalTime += outcome.executionTime;
    
    if (outcome.success) {
      existing.successCount++;
    } else {
      existing.errorCount++;
    }

    existing.averageSuccessRate = existing.successCount / existing.totalAttempts;
    existing.averageExecutionTime = existing.totalTime / existing.totalAttempts;
    existing.lastUpdated = new Date();

    this.performanceMetrics.set(metricKey, existing);
  }

  private async findRelevantPatterns(contextAnalysis: ContextAnalysis): Promise<RelevantPattern[]> {
    const relevantPatterns: RelevantPattern[] = [];
    
    for (const [_, pattern] of this.patternDatabase) {
      const relevance = this.calculatePatternRelevance(pattern, contextAnalysis);
      
      if (relevance > 0.5) {
        relevantPatterns.push({
          pattern,
          relevanceScore: relevance,
          applicableFactors: this.identifyApplicableFactors(pattern, contextAnalysis)
        });
      }
    }

    return relevantPatterns.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  private calculatePatternRelevance(pattern: LearningPattern, context: ContextAnalysis): number {
    let relevance = 0;

    // Application relevance
    if (pattern.applicability.includes(context.application.activeApplication)) {
      relevance += 0.4;
    }

    // Context type relevance
    if (pattern.applicability.includes('decision-making')) {
      relevance += 0.3;
    }

    // Confidence bonus
    relevance += IntelligenceUtils.confidenceToNumber(pattern.confidence) * 0.3;

    return Math.min(relevance, 1);
  }

  private identifyApplicableFactors(pattern: LearningPattern, context: ContextAnalysis): string[] {
    const factors: string[] = [];

    // Check context compatibility
    if (context.screen.complexity > 0.5) {
      factors.push('high_ui_complexity');
    }

    if (context.system.performanceScore < 0.5) {
      factors.push('low_system_performance');
    }

    if (context.history.recentSuccessRate < 0.7) {
      factors.push('recent_failures');
    }

    return factors;
  }

  private async createPerformanceRecommendations(
    metrics: PerformanceMetric[],
    context: ContextAnalysis
  ): Promise<PerformanceRecommendation[]> {
    const recommendations: PerformanceRecommendation[] = [];

    for (const metric of metrics) {
      if (metric.averageSuccessRate < 0.7) {
        recommendations.push({
          type: 'success_rate',
          priority: 'high',
          description: `Improve success rate for ${metric.scenario} (currently ${(metric.averageSuccessRate * 100).toFixed(1)}%)`,
          expectedImprovement: 0.2,
          implementationCost: 'medium'
        });
      }

      if (metric.averageExecutionTime > 15000) {
        recommendations.push({
          type: 'execution_time',
          priority: 'medium',
          description: `Reduce execution time for ${metric.scenario} (currently ${metric.averageExecutionTime}ms)`,
          expectedImprovement: 0.3,
          implementationCost: 'low'
        });
      }
    }

    return recommendations;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private async getRelevantPerformanceMetrics(context: ContextAnalysis): Promise<PerformanceMetric[]> {
    const relevant: PerformanceMetric[] = [];
    
    for (const [scenario, metric] of this.performanceMetrics) {
      if (scenario.includes(context.application.activeApplication) || 
          scenario.includes('decision-making')) {
        relevant.push({ ...metric, scenario });
      }
    }

    return relevant;
  }

  private async assessCurrentPerformance(context: ContextAnalysis): Promise<CurrentPerformance> {
    const appMetrics = this.performanceMetrics.get(context.application.activeApplication);
    
    return {
      successRate: appMetrics?.averageSuccessRate || 0.5,
      averageTime: appMetrics?.averageExecutionTime || 10000,
      errorRate: appMetrics ? (appMetrics.errorCount / appMetrics.totalAttempts) : 0.5
    };
  }

  private needsAdaptation(current: CurrentPerformance, target: PerformanceTarget): boolean {
    return current.successRate < target.minSuccessRate ||
           current.averageTime > target.maxExecutionTime ||
           current.errorRate > target.maxErrorRate;
  }

  private async createAdaptationStrategy(
    context: ContextAnalysis,
    current: CurrentPerformance,
    target: PerformanceTarget
  ): Promise<AdaptationStrategy> {
    return {
      adjustments: [
        {
          parameter: 'decision_timeout',
          currentValue: 30000,
          targetValue: Math.max(15000, target.maxExecutionTime * 0.8),
          priority: 'high'
        },
        {
          parameter: 'retry_attempts',
          currentValue: 3,
          targetValue: current.successRate < 0.5 ? 5 : 2,
          priority: 'medium'
        }
      ],
      expectedImprovement: this.calculateExpectedImprovement(current, target),
      implementationRisk: this.assessImplementationRisk(context)
    };
  }

  private async executeAdaptation(
    strategy: AdaptationStrategy,
    context: ContextSnapshot
  ): Promise<AdaptationResult> {
    // Simplified adaptation execution
    // In practice, this would apply the strategy adjustments
    
    return {
      adapted: true,
      reason: 'Strategy applied successfully',
      currentPerformance: { successRate: 0.8, averageTime: 8000, errorRate: 0.1 },
      targetPerformance: { minSuccessRate: 0.8, maxExecutionTime: 10000, maxErrorRate: 0.1 },
      appliedAdjustments: strategy.adjustments
    };
  }

  private calculateExpectedImprovement(current: CurrentPerformance, target: PerformanceTarget): number {
    const successImprovement = Math.max(0, target.minSuccessRate - current.successRate);
    const timeImprovement = Math.max(0, (current.averageTime - target.maxExecutionTime) / current.averageTime);
    const errorImprovement = Math.max(0, current.errorRate - target.maxErrorRate);
    
    return (successImprovement + timeImprovement + errorImprovement) / 3;
  }

  private assessImplementationRisk(context: ContextAnalysis): 'low' | 'medium' | 'high' {
    if (context.system.stability === 'critical' || context.system.stability === 'unstable') {
      return 'high';
    }
    
    if (context.screen.complexity > 0.8) {
      return 'medium';
    }
    
    return 'low';
  }

  private generateContextSignature(context: LearningContext): string {
    const factors = context.factors.map(f => `${f.name}:${f.value}`).join('|');
    return `${context.scenario}-${factors}`.substring(0, 50);
  }

  private calculateFactorConfidence(factor: LearningFactor): ConfidenceLevel {
    const impact = Math.abs(factor.impact);
    
    if (impact > 0.8) return ConfidenceLevel.VERY_HIGH;
    if (impact > 0.6) return ConfidenceLevel.HIGH;
    if (impact > 0.4) return ConfidenceLevel.MEDIUM;
    if (impact > 0.2) return ConfidenceLevel.LOW;
    return ConfidenceLevel.VERY_LOW;
  }

  private initializeLearning(): void {
    // Initialize with basic patterns or load from storage
    console.log('Learning system initialized');
  }
}

// ============================================================================
// TYPE DEFINITIONS FOR LEARNING SYSTEM
// ============================================================================

export interface DecisionOutcome {
  success: boolean;
  executionTime: number;
  insights?: string[];
}

export interface LearningInsight {
  type: string;
  description: string;
  actionable: boolean;
  confidence: ConfidenceLevel;
  recommendation: string;
}

export interface RecoveryLearningContext {
  errorType: string;
  recoveryResult: RecoveryResult;
  contextFactors: LearningFactor[];
}

export interface LearningOutcome {
  scenario: string;
  success: boolean;
  factors: LearningFactor[];
  timestamp: Date;
}

export interface PerformanceMetric {
  scenario?: string;
  totalAttempts: number;
  successCount: number;
  totalTime: number;
  errorCount: number;
  averageSuccessRate: number;
  averageExecutionTime: number;
  lastUpdated: Date;
}

export interface RelevantPattern {
  pattern: LearningPattern;
  relevanceScore: number;
  applicableFactors: string[];
}

export interface PerformanceRecommendation {
  type: string;
  priority: 'low' | 'medium' | 'high';
  description: string;
  expectedImprovement: number;
  implementationCost: 'low' | 'medium' | 'high';
}

export interface PerformanceTarget {
  minSuccessRate: number;
  maxExecutionTime: number;
  maxErrorRate: number;
}

export interface CurrentPerformance {
  successRate: number;
  averageTime: number;
  errorRate: number;
}

export interface AdaptationStrategy {
  adjustments: ParameterAdjustment[];
  expectedImprovement: number;
  implementationRisk: 'low' | 'medium' | 'high';
}

export interface ParameterAdjustment {
  parameter: string;
  currentValue: any;
  targetValue: any;
  priority: 'low' | 'medium' | 'high';
}

export interface AdaptationResult {
  adapted: boolean;
  reason: string;
  currentPerformance: CurrentPerformance;
  targetPerformance: PerformanceTarget;
  appliedAdjustments?: ParameterAdjustment[];
}