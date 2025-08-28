// ============================================================================
// Error Recovery System - Advanced Error Recovery for Glass MCP
// ============================================================================

import {
  ErrorContext,
  ErrorDetails,
  RecoveryStrategy,
  RecoveryStep,
  RecoveryType,
  ErrorSeverity,
  ActionContext,
  RecoverabilityAssessment,
  SideEffect,
  RecoveryPrerequisite,
  RecoveryParameters,
  RecoveryOutcome,
  RecoveryMetrics,
  ConfidenceLevel,
  Cost,
  ValidationCriteria,
  IntelligenceUtils
} from './intelligence-types';
import { ContextAnalyzer, ContextAnalysis } from './context-analyzer';

/**
 * Advanced Error Recovery System for Glass MCP Visual Automation
 * 
 * Provides comprehensive error recovery with:
 * - Multi-strategy recovery approaches
 * - Intelligent failure analysis
 * - Adaptive recovery selection
 * - Learning from recovery outcomes
 * - Rollback and state management
 */
export class ErrorRecoverySystem {
  private readonly contextAnalyzer: ContextAnalyzer;
  private readonly recoveryHistory = new Map<string, RecoveryAttempt[]>();
  private readonly strategyEffectiveness = new Map<string, StrategyMetrics>();
  private readonly maxRecoveryAttempts = 3;
  private readonly recoveryTimeoutMs = 30000;

  constructor() {
    this.contextAnalyzer = new ContextAnalyzer();
    this.initializeRecoveryStrategies();
  }

  /**
   * Attempt to recover from an error using intelligent strategy selection
   */
  async recoverFromError(errorContext: ErrorContext): Promise<RecoveryResult> {
    const startTime = Date.now();
    
    try {
      // Analyze current context for recovery planning
      const contextSnapshot = await this.captureCurrentContext();
      const contextAnalysis = await this.contextAnalyzer.analyzeContext(contextSnapshot);

      // Assess recoverability
      const recoverabilityAssessment = await this.assessRecoverability(
        errorContext,
        contextAnalysis
      );

      if (!recoverabilityAssessment.canRecover) {
        return this.createFailureResult(
          errorContext,
          'Error deemed unrecoverable',
          Date.now() - startTime
        );
      }

      // Generate recovery strategies
      const availableStrategies = await this.generateRecoveryStrategies(
        errorContext,
        contextAnalysis,
        recoverabilityAssessment
      );

      // Select optimal recovery strategy
      const selectedStrategy = await this.selectRecoveryStrategy(
        availableStrategies,
        errorContext,
        contextAnalysis
      );

      // Execute recovery with monitoring
      const recoveryResult = await this.executeRecoveryStrategy(
        selectedStrategy,
        errorContext,
        contextAnalysis
      );

      // Learn from recovery outcome
      await this.learnFromRecovery(errorContext, selectedStrategy, recoveryResult);

      return recoveryResult;
    } catch (error) {
      return this.createFailureResult(
        errorContext,
        `Recovery system failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        Date.now() - startTime
      );
    }
  }

  /**
   * Generate multiple recovery strategies for the given error context
   */
  private async generateRecoveryStrategies(
    errorContext: ErrorContext,
    contextAnalysis: ContextAnalysis,
    recoverabilityAssessment: RecoverabilityAssessment
  ): Promise<RecoveryStrategy[]> {
    const strategies: RecoveryStrategy[] = [];

    // Add base strategies from recoverability assessment
    strategies.push(...recoverabilityAssessment.recoveryStrategies);

    // Generate context-aware strategies
    const contextStrategies = await this.generateContextAwareStrategies(
      errorContext,
      contextAnalysis
    );
    strategies.push(...contextStrategies);

    // Generate learning-based strategies
    const learningStrategies = await this.generateLearningBasedStrategies(
      errorContext,
      contextAnalysis
    );
    strategies.push(...learningStrategies);

    // Filter and prioritize strategies
    return this.prioritizeStrategies(strategies, errorContext, contextAnalysis);
  }

  /**
   * Select the most appropriate recovery strategy
   */
  private async selectRecoveryStrategy(
    strategies: RecoveryStrategy[],
    errorContext: ErrorContext,
    contextAnalysis: ContextAnalysis
  ): Promise<RecoveryStrategy> {
    if (strategies.length === 0) {
      throw new Error('No recovery strategies available');
    }

    // Score strategies based on multiple factors
    const scoredStrategies = strategies.map(strategy => ({
      strategy,
      score: this.scoreRecoveryStrategy(strategy, errorContext, contextAnalysis)
    }));

    // Sort by score descending
    scoredStrategies.sort((a, b) => b.score - a.score);

    return scoredStrategies[0].strategy;
  }

  /**
   * Execute a recovery strategy with comprehensive monitoring
   */
  private async executeRecoveryStrategy(
    strategy: RecoveryStrategy,
    errorContext: ErrorContext,
    contextAnalysis: ContextAnalysis
  ): Promise<RecoveryResult> {
    const startTime = Date.now();
    const recoveryId = this.generateRecoveryId(errorContext, strategy);

    try {
      // Pre-execution validation
      const preValidation = await this.validateRecoveryPrerequisites(
        strategy,
        contextAnalysis
      );

      if (!preValidation.isValid) {
        return this.createFailureResult(
          errorContext,
          `Prerequisites not met: ${preValidation.failureReasons.join(', ')}`,
          Date.now() - startTime,
          strategy
        );
      }

      // Execute recovery steps
      const executionResult = await this.executeRecoverySteps(
        strategy,
        errorContext,
        contextAnalysis
      );

      // Post-execution validation
      const postValidation = await this.validateRecoverySuccess(
        strategy,
        errorContext,
        contextAnalysis
      );

      const totalTime = Date.now() - startTime;
      const success = executionResult.success && postValidation.isValid;

      // Record recovery attempt
      await this.recordRecoveryAttempt({
        recoveryId,
        errorId: errorContext.errorId,
        strategyId: strategy.id,
        success,
        executionTime: totalTime,
        timestamp: new Date()
      });

      return {
        success,
        strategy,
        errorContext,
        executionTime: totalTime,
        metrics: this.calculateRecoveryMetrics(executionResult, totalTime),
        outcome: success ? 'recovered' : 'failed',
        details: success 
          ? `Recovery successful using ${strategy.type} strategy`
          : `Recovery failed: ${executionResult.failureReason || 'Unknown reason'}`,
        lessonsLearned: this.extractLessonsLearned(strategy, executionResult, success)
      };
    } catch (error) {
      const totalTime = Date.now() - startTime;
      return this.createFailureResult(
        errorContext,
        `Strategy execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        totalTime,
        strategy
      );
    }
  }

  /**
   * Execute individual recovery steps with error handling
   */
  private async executeRecoverySteps(
    strategy: RecoveryStrategy,
    errorContext: ErrorContext,
    contextAnalysis: ContextAnalysis
  ): Promise<StepExecutionResult> {
    const results: StepResult[] = [];
    let overallSuccess = true;
    let failureReason: string | undefined;

    for (const step of strategy.steps) {
      try {
        const stepResult = await this.executeRecoveryStep(
          step,
          errorContext,
          contextAnalysis
        );

        results.push(stepResult);

        if (!stepResult.success) {
          overallSuccess = false;
          failureReason = stepResult.failureReason;
          
          // Decide whether to continue or abort
          if (step.parameters.rollbackOnFailure) {
            await this.rollbackExecutedSteps(results.slice(0, -1));
            break;
          }
        }
      } catch (error) {
        const stepError: StepResult = {
          stepId: step.id,
          success: false,
          failureReason: error instanceof Error ? error.message : 'Unknown error',
          executionTime: 0
        };
        
        results.push(stepError);
        overallSuccess = false;
        failureReason = stepError.failureReason;
        break;
      }
    }

    return {
      success: overallSuccess,
      stepResults: results,
      failureReason
    };
  }

  /**
   * Execute a single recovery step
   */
  private async executeRecoveryStep(
    step: RecoveryStep,
    errorContext: ErrorContext,
    contextAnalysis: ContextAnalysis
  ): Promise<StepResult> {
    const startTime = Date.now();

    try {
      // Implement step-specific logic based on step description
      const success = await this.performStepAction(step, errorContext, contextAnalysis);

      // Validate step completion
      if (success && step.validation) {
        const validationResult = await this.validateStepCompletion(
          step,
          contextAnalysis
        );
        
        return {
          stepId: step.id,
          success: validationResult.isValid,
          failureReason: validationResult.isValid ? undefined : 'Validation failed',
          executionTime: Date.now() - startTime
        };
      }

      return {
        stepId: step.id,
        success,
        executionTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        stepId: step.id,
        success: false,
        failureReason: error instanceof Error ? error.message : 'Step execution failed',
        executionTime: Date.now() - startTime
      };
    }
  }

  /**
   * Generate context-aware recovery strategies
   */
  private async generateContextAwareStrategies(
    errorContext: ErrorContext,
    contextAnalysis: ContextAnalysis
  ): Promise<RecoveryStrategy[]> {
    const strategies: RecoveryStrategy[] = [];

    // UI refresh strategy for UI-related errors
    if (this.isUIRelatedError(errorContext) && contextAnalysis.screen.elementCount > 0) {
      strategies.push(this.createUIRefreshStrategy(errorContext, contextAnalysis));
    }

    // System optimization strategy for performance issues
    if (this.isPerformanceRelatedError(errorContext) && contextAnalysis.system.performanceScore < 0.5) {
      strategies.push(this.createSystemOptimizationStrategy(errorContext, contextAnalysis));
    }

    // Alternative approach strategy based on historical success
    if (contextAnalysis.history.strongPatterns.length > 0) {
      strategies.push(this.createAlternativeApproachStrategy(errorContext, contextAnalysis));
    }

    return strategies;
  }

  /**
   * Generate learning-based recovery strategies from historical data
   */
  private async generateLearningBasedStrategies(
    errorContext: ErrorContext,
    contextAnalysis: ContextAnalysis
  ): Promise<RecoveryStrategy[]> {
    const strategies: RecoveryStrategy[] = [];

    // Find similar historical errors
    const similarErrors = await this.findSimilarErrors(errorContext, contextAnalysis);
    
    for (const similarError of similarErrors) {
      const successfulRecoveries = this.getSuccessfulRecoveries(similarError.errorId);
      
      if (successfulRecoveries.length > 0) {
        const bestRecovery = successfulRecoveries[0]; // Assume sorted by effectiveness
        const originalStrategy = await this.getStrategyById(bestRecovery.strategyId);
        
        if (originalStrategy) {
          const adaptedStrategy = await this.adaptRecoveryStrategy(
            originalStrategy,
            errorContext,
            contextAnalysis
          );
          
          if (adaptedStrategy) {
            strategies.push(adaptedStrategy);
          }
        }
      }
    }

    return strategies;
  }

  // ============================================================================
  // STRATEGY CREATION METHODS
  // ============================================================================

  private createUIRefreshStrategy(
    errorContext: ErrorContext,
    contextAnalysis: ContextAnalysis
  ): RecoveryStrategy {
    return {
      id: `ui-refresh-${Date.now()}`,
      type: RecoveryType.ALTERNATIVE,
      description: 'Refresh UI elements and retry operation',
      applicability: 0.8,
      successRate: 0.7,
      sideEffects: [{
        description: 'Temporary UI state loss',
        probability: 0.3,
        severity: ErrorSeverity.LOW,
        mitigation: 'Save state before refresh'
      }],
      prerequisites: [{
        id: 'ui-accessible',
        description: 'UI elements must be accessible',
        validationMethod: 'Element detection',
        required: true
      }],
      steps: [{
        id: 'refresh-ui',
        description: 'Refresh UI elements',
        order: 1,
        parameters: {
          maxRetries: 2,
          timeout: 5000,
          rollbackOnFailure: false,
          notifyOnRecovery: true
        },
        expectedOutcome: {
          success: true,
          description: 'UI refreshed successfully',
          metrics: {
            timeToRecovery: 3000,
            resourcesUsed: { timeMs: 3000, cpuUsage: 10, memoryMB: 50, riskScore: 0.1 },
            dataRecovered: 100,
            confidenceScore: 0.8
          },
          lessonsLearned: []
        },
        validation: {
          rules: [{
            id: 'elements-visible',
            condition: 'elements_count > 0',
            expectedValue: true,
            operator: 'equals'
          }],
          timeout: 5000,
          retryCount: 2
        }
      }]
    };
  }

  private createSystemOptimizationStrategy(
    errorContext: ErrorContext,
    contextAnalysis: ContextAnalysis
  ): RecoveryStrategy {
    return {
      id: `system-optimize-${Date.now()}`,
      type: RecoveryType.RETRY,
      description: 'Optimize system resources and retry',
      applicability: 0.6,
      successRate: 0.5,
      sideEffects: [{
        description: 'Temporary performance impact',
        probability: 0.4,
        severity: ErrorSeverity.LOW,
        mitigation: 'Monitor resource usage'
      }],
      prerequisites: [{
        id: 'admin-access',
        description: 'Administrative access for optimization',
        validationMethod: 'Permission check',
        required: false
      }],
      steps: [{
        id: 'optimize-resources',
        description: 'Free system resources',
        order: 1,
        parameters: {
          maxRetries: 1,
          timeout: 10000,
          rollbackOnFailure: true,
          notifyOnRecovery: false
        },
        expectedOutcome: {
          success: true,
          description: 'System resources optimized',
          metrics: {
            timeToRecovery: 8000,
            resourcesUsed: { timeMs: 8000, cpuUsage: 15, memoryMB: 30, riskScore: 0.2 },
            dataRecovered: 90,
            confidenceScore: 0.6
          },
          lessonsLearned: []
        },
        validation: {
          rules: [{
            id: 'performance-improved',
            condition: 'cpu_usage < 70',
            expectedValue: true,
            operator: 'equals'
          }],
          timeout: 5000,
          retryCount: 1
        }
      }]
    };
  }

  private createAlternativeApproachStrategy(
    errorContext: ErrorContext,
    contextAnalysis: ContextAnalysis
  ): RecoveryStrategy {
    const strongPattern = contextAnalysis.history.strongPatterns[0];
    
    return {
      id: `alternative-${Date.now()}`,
      type: RecoveryType.ALTERNATIVE,
      description: `Use alternative approach based on successful pattern: ${strongPattern.pattern}`,
      applicability: 0.9,
      successRate: strongPattern.successRate,
      sideEffects: [],
      prerequisites: [],
      steps: [{
        id: 'alternative-action',
        description: `Execute alternative approach: ${strongPattern.pattern}`,
        order: 1,
        parameters: {
          maxRetries: 2,
          timeout: 15000,
          rollbackOnFailure: true,
          notifyOnRecovery: true
        },
        expectedOutcome: {
          success: true,
          description: 'Alternative approach executed successfully',
          metrics: {
            timeToRecovery: 12000,
            resourcesUsed: { timeMs: 12000, cpuUsage: 20, memoryMB: 100, riskScore: 0.15 },
            dataRecovered: 95,
            confidenceScore: 0.85
          },
          lessonsLearned: []
        },
        validation: {
          rules: [{
            id: 'goal-achieved',
            condition: 'operation_successful',
            expectedValue: true,
            operator: 'equals'
          }],
          timeout: 10000,
          retryCount: 1
        }
      }]
    };
  }

  // ============================================================================
  // UTILITY AND HELPER METHODS
  // ============================================================================

  private async assessRecoverability(
    errorContext: ErrorContext,
    contextAnalysis: ContextAnalysis
  ): Promise<RecoverabilityAssessment> {
    // Use existing utility method with error severity
    return IntelligenceUtils.assessRecoverability(
      errorContext.errorDetails,
      errorContext.actionContext,
      errorContext.severity
    );
  }

  private scoreRecoveryStrategy(
    strategy: RecoveryStrategy,
    errorContext: ErrorContext,
    contextAnalysis: ContextAnalysis
  ): number {
    let score = strategy.successRate * strategy.applicability;

    // Adjust for strategy effectiveness history
    const metrics = this.strategyEffectiveness.get(strategy.id);
    if (metrics) {
      score = (score + metrics.averageSuccessRate) / 2;
    }

    // Context-based adjustments
    if (contextAnalysis.system.performanceScore < 0.5 && strategy.type === RecoveryType.RETRY) {
      score *= 0.7; // Reduce retry strategy score for poor performance
    }

    if (errorContext.severity === ErrorSeverity.CRITICAL && strategy.successRate < 0.8) {
      score *= 0.5; // Heavily penalize low success strategies for critical errors
    }

    return score;
  }

  private prioritizeStrategies(
    strategies: RecoveryStrategy[],
    errorContext: ErrorContext,
    contextAnalysis: ContextAnalysis
  ): RecoveryStrategy[] {
    return strategies
      .map(strategy => ({
        strategy,
        score: this.scoreRecoveryStrategy(strategy, errorContext, contextAnalysis)
      }))
      .sort((a, b) => b.score - a.score)
      .map(item => item.strategy)
      .slice(0, 5); // Limit to top 5 strategies
  }

  private async validateRecoveryPrerequisites(
    strategy: RecoveryStrategy,
    contextAnalysis: ContextAnalysis
  ): Promise<ValidationResult> {
    const failureReasons: string[] = [];

    for (const prerequisite of strategy.prerequisites) {
      if (prerequisite.required) {
        const isValid = await this.validatePrerequisite(prerequisite, contextAnalysis);
        if (!isValid) {
          failureReasons.push(`Prerequisite not met: ${prerequisite.description}`);
        }
      }
    }

    return {
      isValid: failureReasons.length === 0,
      failureReasons
    };
  }

  private async validatePrerequisite(
    prerequisite: RecoveryPrerequisite,
    contextAnalysis: ContextAnalysis
  ): Promise<boolean> {
    // Simplified prerequisite validation
    switch (prerequisite.validationMethod.toLowerCase()) {
      case 'element detection':
        return contextAnalysis.screen.elementCount > 0;
      case 'permission check':
        return true; // Assume permissions are available
      case 'system resources':
        return contextAnalysis.system.performanceScore > 0.3;
      default:
        return true;
    }
  }

  private async validateRecoverySuccess(
    strategy: RecoveryStrategy,
    errorContext: ErrorContext,
    contextAnalysis: ContextAnalysis
  ): Promise<ValidationResult> {
    // Simplified success validation
    // In a real implementation, this would check if the original error is resolved
    return {
      isValid: true,
      failureReasons: []
    };
  }

  private async performStepAction(
    step: RecoveryStep,
    errorContext: ErrorContext,
    contextAnalysis: ContextAnalysis
  ): Promise<boolean> {
    // Simplified step action execution
    // In a real implementation, this would execute the actual recovery actions
    
    // Simulate action execution time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    
    // Return success based on step description (simplified)
    const successProbability = step.description.includes('refresh') ? 0.8 : 
                              step.description.includes('optimize') ? 0.6 : 0.7;
    
    return Math.random() < successProbability;
  }

  private async validateStepCompletion(
    step: RecoveryStep,
    contextAnalysis: ContextAnalysis
  ): Promise<ValidationResult> {
    if (!step.validation) {
      return { isValid: true, failureReasons: [] };
    }

    // Simplified validation logic
    return {
      isValid: Math.random() < 0.9, // 90% validation success rate
      failureReasons: Math.random() < 0.1 ? ['Validation failed'] : []
    };
  }

  private async rollbackExecutedSteps(stepResults: StepResult[]): Promise<void> {
    // Implement rollback logic for executed steps
    for (const result of stepResults.reverse()) {
      if (result.success) {
        // Perform rollback action (simplified)
        console.log(`Rolling back step: ${result.stepId}`);
      }
    }
  }

  private calculateRecoveryMetrics(
    executionResult: StepExecutionResult,
    totalTime: number
  ): RecoveryMetrics {
    return {
      timeToRecovery: totalTime,
      resourcesUsed: {
        timeMs: totalTime,
        cpuUsage: Math.round(totalTime / 100),
        memoryMB: Math.round(totalTime / 50),
        riskScore: executionResult.success ? 0.1 : 0.5
      },
      dataRecovered: executionResult.success ? 100 : 0,
      confidenceScore: executionResult.success ? 0.8 : 0.2
    };
  }

  private extractLessonsLearned(
    strategy: RecoveryStrategy,
    executionResult: StepExecutionResult,
    success: boolean
  ): string[] {
    const lessons: string[] = [];
    
    if (success) {
      lessons.push(`${strategy.type} strategy was effective for this error type`);
      if (executionResult.stepResults.length > 1) {
        lessons.push('Multi-step recovery approach worked well');
      }
    } else {
      lessons.push(`${strategy.type} strategy was ineffective - consider alternatives`);
      if (executionResult.failureReason) {
        lessons.push(`Failure reason: ${executionResult.failureReason}`);
      }
    }

    return lessons;
  }

  private createFailureResult(
    errorContext: ErrorContext,
    reason: string,
    executionTime: number,
    strategy?: RecoveryStrategy
  ): RecoveryResult {
    return {
      success: false,
      strategy,
      errorContext,
      executionTime,
      metrics: {
        timeToRecovery: executionTime,
        resourcesUsed: { timeMs: executionTime, cpuUsage: 5, memoryMB: 10, riskScore: 0.8 },
        dataRecovered: 0,
        confidenceScore: 0.1
      },
      outcome: 'failed',
      details: reason,
      lessonsLearned: [`Recovery failed: ${reason}`]
    };
  }

  // Helper methods for error classification
  private isUIRelatedError(errorContext: ErrorContext): boolean {
    const errorMessage = errorContext.errorDetails.message.toLowerCase();
    return errorMessage.includes('element') || errorMessage.includes('ui') || errorMessage.includes('click');
  }

  private isPerformanceRelatedError(errorContext: ErrorContext): boolean {
    const errorMessage = errorContext.errorDetails.message.toLowerCase();
    return errorMessage.includes('timeout') || errorMessage.includes('slow') || errorMessage.includes('performance');
  }

  private async findSimilarErrors(
    errorContext: ErrorContext,
    contextAnalysis: ContextAnalysis
  ): Promise<SimilarError[]> {
    // Simplified similar error detection
    // In practice, this would use ML/AI to find semantically similar errors
    return [];
  }

  private getSuccessfulRecoveries(errorId: string): RecoveryAttempt[] {
    const attempts = this.recoveryHistory.get(errorId) || [];
    return attempts.filter(attempt => attempt.success);
  }

  private async getStrategyById(strategyId: string): Promise<RecoveryStrategy | null> {
    // In a real implementation, this would retrieve strategy from a registry
    // For now, return null to indicate strategy not found
    return null;
  }

  private async adaptRecoveryStrategy(
    originalStrategy: RecoveryStrategy,
    errorContext: ErrorContext,
    contextAnalysis: ContextAnalysis
  ): Promise<RecoveryStrategy | null> {
    // Simplified strategy adaptation
    // In practice, this would intelligently adapt strategies to current context
    return null;
  }

  private generateRecoveryId(errorContext: ErrorContext, strategy: RecoveryStrategy): string {
    return `${errorContext.errorId}-${strategy.id}-${Date.now()}`;
  }

  private async recordRecoveryAttempt(attempt: RecoveryAttempt): Promise<void> {
    const errorAttempts = this.recoveryHistory.get(attempt.errorId) || [];
    errorAttempts.push(attempt);
    this.recoveryHistory.set(attempt.errorId, errorAttempts);
  }

  private async learnFromRecovery(
    errorContext: ErrorContext,
    strategy: RecoveryStrategy,
    result: RecoveryResult
  ): Promise<void> {
    // Update strategy effectiveness metrics
    const currentMetrics = this.strategyEffectiveness.get(strategy.id) || {
      attempts: 0,
      successes: 0,
      averageSuccessRate: 0.5,
      averageExecutionTime: 0
    };

    currentMetrics.attempts++;
    if (result.success) {
      currentMetrics.successes++;
    }
    
    currentMetrics.averageSuccessRate = currentMetrics.successes / currentMetrics.attempts;
    currentMetrics.averageExecutionTime = (
      (currentMetrics.averageExecutionTime * (currentMetrics.attempts - 1)) + result.executionTime
    ) / currentMetrics.attempts;

    this.strategyEffectiveness.set(strategy.id, currentMetrics);
  }

  private async captureCurrentContext(): Promise<any> {
    // Simplified context capture
    // In practice, this would capture the current system state
    return {
      timestamp: new Date(),
      screenState: { resolution: [1920, 1080], activeWindows: [], cursor: { position: [0, 0], visible: true, shape: 'arrow' }, visibleElements: [], screenshot: '' },
      applicationState: { activeApplication: 'unknown', runningProcesses: [], systemLoad: 50, memoryUsage: 60 },
      userIntent: { primaryGoal: 'recover', subGoals: [], context: 'error recovery', constraints: [], preferences: {} },
      systemMetrics: { cpuUsage: 50, memoryUsage: 60, diskUsage: 70, networkActivity: 10, timestamp: new Date() },
      historicalContext: { recentActions: [], successPatterns: [], failurePatterns: [], learningInsights: [] }
    };
  }

  private initializeRecoveryStrategies(): void {
    // Initialize default strategy effectiveness metrics
    const defaultStrategies = ['retry', 'rollback', 'alternative', 'escalation', 'abort'];
    defaultStrategies.forEach(strategyType => {
      this.strategyEffectiveness.set(strategyType, {
        attempts: 0,
        successes: 0,
        averageSuccessRate: 0.5,
        averageExecutionTime: 5000
      });
    });
  }
}

// ============================================================================
// TYPE DEFINITIONS FOR ERROR RECOVERY
// ============================================================================

export interface RecoveryResult {
  success: boolean;
  strategy?: RecoveryStrategy;
  errorContext: ErrorContext;
  executionTime: number;
  metrics: RecoveryMetrics;
  outcome: 'recovered' | 'failed' | 'partial';
  details: string;
  lessonsLearned: string[];
}

export interface StepExecutionResult {
  success: boolean;
  stepResults: StepResult[];
  failureReason?: string;
}

export interface StepResult {
  stepId: string;
  success: boolean;
  failureReason?: string;
  executionTime: number;
}

export interface ValidationResult {
  isValid: boolean;
  failureReasons: string[];
}

export interface RecoveryAttempt {
  recoveryId: string;
  errorId: string;
  strategyId: string;
  success: boolean;
  executionTime: number;
  timestamp: Date;
}

export interface StrategyMetrics {
  attempts: number;
  successes: number;
  averageSuccessRate: number;
  averageExecutionTime: number;
}

export interface SimilarError {
  errorId: string;
  similarity: number;
  errorDetails: ErrorDetails;
}