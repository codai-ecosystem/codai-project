// ============================================================================
// Decision Engine - Advanced Decision Making System for Glass MCP
// ============================================================================

import {
  DecisionRequest,
  DecisionResponse,
  DecisionOption,
  DecisionConstraint,
  DecisionCriterion,
  DecisionReasoning,
  OptionRanking,
  ContextSnapshot,
  ConfidenceLevel,
  DecisionPriority,
  ConstraintType,
  RiskAssessment,
  RiskFactor,
  RiskMitigation,
  ExecutionPlan,
  Cost,
  IntelligenceUtils,
  ReasoningFactor,
  Tradeoff,
  Assumption,
  Uncertainty,
  LearningOpportunity
} from './intelligence-types';
import { ContextAnalyzer, ContextAnalysis } from './context-analyzer';

/**
 * Advanced Decision Engine for Glass MCP Visual Automation
 * 
 * Provides intelligent decision making with:
 * - Multi-criteria analysis and ranking
 * - Risk assessment and mitigation strategies
 * - Context-aware decision optimization
 * - Learning from decision outcomes
 * - Adaptive confidence estimation
 */
export class DecisionEngine {
  private readonly contextAnalyzer: ContextAnalyzer;
  private readonly decisionHistory = new Map<string, DecisionOutcome>();
  private readonly learningWeights = new Map<string, number>();
  private readonly riskThresholds = {
    low: 0.3,
    medium: 0.6,
    high: 0.8
  };

  constructor() {
    this.contextAnalyzer = new ContextAnalyzer();
    this.initializeLearningWeights();
  }

  /**
   * Make a decision based on request parameters and context analysis
   */
  async makeDecision(request: DecisionRequest): Promise<DecisionResponse> {
    const startTime = Date.now();

    try {
      // Validate decision request
      const validationErrors = IntelligenceUtils.validateDecisionRequest(request);
      if (validationErrors.length > 0) {
        throw new Error(`Invalid decision request: ${validationErrors.join(', ')}`);
      }

      // Analyze context for decision making
      const contextAnalysis = await this.contextAnalyzer.analyzeContext(request.context);

      // Evaluate all options with multi-criteria analysis
      const evaluatedOptions = await this.evaluateOptions(
        request.options,
        request.criteria,
        request.constraints,
        contextAnalysis
      );

      // Select the best option
      const selectedOption = this.selectOptimalOption(evaluatedOptions, request.priority);

      // Generate comprehensive reasoning
      const reasoning = this.generateDecisionReasoning(
        selectedOption,
        evaluatedOptions,
        request,
        contextAnalysis
      );

      // Create alternative rankings
      const alternativeRanking = IntelligenceUtils.prioritizeOptions(request.options);

      // Generate warnings and recommendations
      const warnings = this.generateWarnings(selectedOption, request, contextAnalysis);
      const recommendations = this.generateRecommendations(selectedOption, request, contextAnalysis);

      // Calculate confidence based on analysis quality
      const confidence = this.calculateDecisionConfidence(
        selectedOption,
        evaluatedOptions,
        contextAnalysis
      );

      const response: DecisionResponse = {
        requestId: request.id,
        selectedOptionId: selectedOption.option.id,
        confidence,
        reasoning,
        alternativeRanking,
        warnings,
        recommendations
      };

      // Store decision for learning
      await this.storeBecisionOutcome(request, response, Date.now() - startTime);

      return response;
    } catch (error) {
      throw new Error(`Decision making failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Evaluate all decision options against criteria and constraints
   */
  private async evaluateOptions(
    options: DecisionOption[],
    criteria: DecisionCriterion[],
    constraints: DecisionConstraint[],
    contextAnalysis: ContextAnalysis
  ): Promise<EvaluatedOption[]> {
    const evaluatedOptions: EvaluatedOption[] = [];

    for (const option of options) {
      const evaluation = await this.evaluateOption(option, criteria, constraints, contextAnalysis);
      evaluatedOptions.push(evaluation);
    }

    return evaluatedOptions.sort((a, b) => b.overallScore - a.overallScore);
  }

  /**
   * Comprehensive evaluation of a single option
   */
  private async evaluateOption(
    option: DecisionOption,
    criteria: DecisionCriterion[],
    constraints: DecisionConstraint[],
    contextAnalysis: ContextAnalysis
  ): Promise<EvaluatedOption> {
    // Feasibility assessment
    const feasibilityScore = await this.assessFeasibility(option, contextAnalysis);

    // Criteria scoring
    const criteriaScores = await this.scoreCriteria(option, criteria, contextAnalysis);

    // Constraint validation
    const constraintViolations = await this.validateConstraints(option, constraints);

    // Risk assessment with context
    const enhancedRiskAssessment = await this.enhanceRiskAssessment(
      option.riskAssessment,
      contextAnalysis
    );

    // Cost-benefit analysis
    const costBenefitRatio = await this.calculateCostBenefitRatio(option, criteria);

    // Context compatibility
    const contextCompatibility = await this.assessContextCompatibility(option, contextAnalysis);

    // Learning-based adjustments
    const learningAdjustment = this.applyLearningAdjustments(option);

    // Calculate overall score
    const overallScore = this.calculateOverallScore(
      feasibilityScore,
      criteriaScores,
      enhancedRiskAssessment,
      costBenefitRatio,
      contextCompatibility,
      learningAdjustment,
      constraintViolations.length
    );

    return {
      option,
      overallScore,
      feasibilityScore,
      criteriaScores,
      constraintViolations,
      enhancedRiskAssessment,
      costBenefitRatio,
      contextCompatibility,
      learningAdjustment,
      confidence: this.calculateOptionConfidence(
        feasibilityScore,
        criteriaScores,
        constraintViolations.length
      )
    };
  }

  /**
   * Select the optimal option based on evaluation and priority
   */
  private selectOptimalOption(
    evaluatedOptions: EvaluatedOption[],
    priority: DecisionPriority
  ): EvaluatedOption {
    if (evaluatedOptions.length === 0) {
      throw new Error('No evaluated options available for selection');
    }

    // Apply priority-based adjustments
    const priorityAdjustedOptions = evaluatedOptions.map(option => ({
      ...option,
      overallScore: this.applyPriorityAdjustment(option.overallScore, priority)
    }));

    // Sort by adjusted score and return top option
    priorityAdjustedOptions.sort((a, b) => b.overallScore - a.overallScore);

    // Ensure selected option meets minimum thresholds
    const selectedOption = priorityAdjustedOptions[0];
    if (selectedOption.overallScore < this.getMinimumThreshold(priority)) {
      console.warn(`Selected option score (${selectedOption.overallScore}) below minimum threshold`);
    }

    return selectedOption;
  }

  /**
   * Generate comprehensive decision reasoning
   */
  private generateDecisionReasoning(
    selectedOption: EvaluatedOption,
    allOptions: EvaluatedOption[],
    request: DecisionRequest,
    contextAnalysis: ContextAnalysis
  ): DecisionReasoning {
    // Identify primary factors that influenced the decision
    const primaryFactors = this.identifyPrimaryFactors(selectedOption, request, contextAnalysis);

    // Analyze trade-offs between options
    const tradeoffs = this.analyzeTradeoffs(allOptions);

    // Document assumptions made during decision process
    const assumptions = this.documentAssumptions(selectedOption, request, contextAnalysis);

    // Identify uncertainties in the decision
    const uncertainties = this.identifyUncertainties(selectedOption, contextAnalysis);

    // Propose risk mitigation strategies
    const riskMitigation = this.proposeMitigationStrategies(
      selectedOption.enhancedRiskAssessment.riskFactors
    );

    // Identify learning opportunities
    const learningOpportunities = this.identifyLearningOpportunities(
      selectedOption,
      request,
      contextAnalysis
    );

    return {
      primaryFactors,
      tradeoffs,
      assumptions,
      uncertainties,
      riskMitigation,
      learningOpportunities
    };
  }

  // ============================================================================
  // UTILITY METHODS FOR OPTION EVALUATION
  // ============================================================================

  private async assessFeasibility(
    option: DecisionOption,
    contextAnalysis: ContextAnalysis
  ): Promise<number> {
    let feasibilityScore = option.feasibility;

    // Adjust based on system performance
    if (contextAnalysis.system.performanceScore < 0.5) {
      feasibilityScore *= 0.8; // Reduce feasibility for complex operations on slow systems
    }

    // Adjust based on UI complexity
    if (contextAnalysis.screen.complexity > 0.7) {
      feasibilityScore *= 0.9; // Slightly reduce for complex UIs
    }

    // Consider historical success patterns
    if (contextAnalysis.history.recentSuccessRate < 0.5) {
      feasibilityScore *= 0.85; // Reduce if recent success rate is low
    }

    return Math.max(0, Math.min(1, feasibilityScore));
  }

  private async scoreCriteria(
    option: DecisionOption,
    criteria: DecisionCriterion[],
    contextAnalysis: ContextAnalysis
  ): Promise<CriteriaScore[]> {
    const scores: CriteriaScore[] = [];

    for (const criterion of criteria) {
      let score = criterion.successProbability * criterion.weight;

      // Context-based adjustments
      if (criterion.name.includes('speed') && contextAnalysis.system.performanceScore < 0.5) {
        score *= 0.7;
      }

      if (criterion.name.includes('accuracy') && contextAnalysis.screen.complexity > 0.8) {
        score *= 0.8;
      }

      scores.push({
        criterionId: criterion.id,
        name: criterion.name,
        score,
        weight: criterion.weight,
        reasoning: this.generateCriteriaReasoning(criterion, score, contextAnalysis)
      });
    }

    return scores;
  }

  private async validateConstraints(
    option: DecisionOption,
    constraints: DecisionConstraint[]
  ): Promise<ConstraintViolation[]> {
    const violations: ConstraintViolation[] = [];

    for (const constraint of constraints) {
      const violation = this.checkConstraintViolation(option, constraint);
      if (violation) {
        violations.push(violation);
      }
    }

    return violations;
  }

  private checkConstraintViolation(
    option: DecisionOption,
    constraint: DecisionConstraint
  ): ConstraintViolation | null {
    // Simplified constraint checking - can be extended for specific constraint types
    switch (constraint.type) {
      case ConstraintType.RESOURCE:
        if (this.exceedsResourceLimit(option, constraint)) {
          return {
            constraintId: constraint.id,
            severity: constraint.mandatory ? 'high' : 'medium',
            description: `Resource constraint violated: ${constraint.description}`,
            suggestion: 'Consider reducing resource usage or choosing an alternative'
          };
        }
        break;
        
      case ConstraintType.TIME:
        if (this.exceedsTimeLimit(option, constraint)) {
          return {
            constraintId: constraint.id,
            severity: constraint.mandatory ? 'high' : 'medium',
            description: `Time constraint violated: ${constraint.description}`,
            suggestion: 'Consider faster alternatives or extending deadline'
          };
        }
        break;
        
      case ConstraintType.SAFETY:
        if (this.violatesSafetyConstraint(option, constraint)) {
          return {
            constraintId: constraint.id,
            severity: 'critical',
            description: `Safety constraint violated: ${constraint.description}`,
            suggestion: 'Choose a safer alternative or implement additional safeguards'
          };
        }
        break;
    }

    return null;
  }

  private async enhanceRiskAssessment(
    originalRisk: RiskAssessment,
    contextAnalysis: ContextAnalysis
  ): Promise<EnhancedRiskAssessment> {
    const enhancedFactors = [...originalRisk.riskFactors];
    const enhancedMitigation = [...originalRisk.mitigation];

    // Add context-based risk factors
    if (contextAnalysis.system.stability === 'unstable' || contextAnalysis.system.stability === 'critical') {
      enhancedFactors.push({
        id: 'system-instability',
        description: 'System instability detected',
        impact: 0.7,
        probability: 0.6,
        category: 'system'
      });

      enhancedMitigation.push({
        riskId: 'system-instability',
        strategy: 'Monitor system resources and implement circuit breakers',
        effectiveness: 0.8,
        cost: { timeMs: 500, cpuUsage: 5, memoryMB: 10, riskScore: 0.1 }
      });
    }

    if (contextAnalysis.screen.complexity > 0.8) {
      enhancedFactors.push({
        id: 'ui-complexity',
        description: 'High UI complexity may cause interaction failures',
        impact: 0.5,
        probability: 0.4,
        category: 'ui'
      });
    }

    // Recalculate overall risk
    const overallRisk = IntelligenceUtils.calculateRiskScore(enhancedFactors);

    return {
      overallRisk,
      riskFactors: enhancedFactors,
      mitigation: enhancedMitigation,
      acceptableThreshold: originalRisk.acceptableThreshold,
      contextualAdjustment: overallRisk - originalRisk.overallRisk
    };
  }

  private async calculateCostBenefitRatio(
    option: DecisionOption,
    criteria: DecisionCriterion[]
  ): Promise<number> {
    // Calculate total expected benefit
    const totalBenefit = criteria.reduce((sum, criterion) => {
      return sum + (criterion.expectedOutcome.expectedValue * criterion.weight);
    }, 0);

    // Calculate total cost
    const totalCost = criteria.reduce((sum, criterion) => {
      const cost = criterion.estimatedCost;
      return sum + (cost.timeMs / 1000) + (cost.cpuUsage / 100) + (cost.memoryMB / 1000) + cost.riskScore;
    }, 0);

    return totalCost > 0 ? totalBenefit / totalCost : totalBenefit;
  }

  private async assessContextCompatibility(
    option: DecisionOption,
    contextAnalysis: ContextAnalysis
  ): Promise<number> {
    let compatibilityScore = 1.0;

    // Check application compatibility
    const executionPlan = option.executionPlan;
    if (executionPlan.totalDuration > 30000 && contextAnalysis.system.performanceScore < 0.6) {
      compatibilityScore *= 0.7; // Long operations on slow systems
    }

    // Check UI compatibility
    if (contextAnalysis.screen.interactableCount === 0 && this.requiresUIInteraction(option)) {
      compatibilityScore *= 0.3; // Requires interaction but no interactable elements
    }

    // Check goal alignment
    if (contextAnalysis.intent.goalComplexity === 'very_complex' && option.feasibility < 0.6) {
      compatibilityScore *= 0.8; // Complex goals with low feasibility options
    }

    return Math.max(0, Math.min(1, compatibilityScore));
  }

  private applyLearningAdjustments(option: DecisionOption): number {
    const optionKey = this.getOptionKey(option);
    const learningWeight = this.learningWeights.get(optionKey) || 0;
    
    // Convert learning weight to adjustment factor (-0.2 to +0.2)
    return Math.max(-0.2, Math.min(0.2, learningWeight));
  }

  private calculateOverallScore(
    feasibilityScore: number,
    criteriaScores: CriteriaScore[],
    riskAssessment: EnhancedRiskAssessment,
    costBenefitRatio: number,
    contextCompatibility: number,
    learningAdjustment: number,
    constraintViolationCount: number
  ): number {
    // Weighted combination of all factors
    const criteriaAverage = criteriaScores.reduce((sum, cs) => sum + cs.score, 0) / Math.max(criteriaScores.length, 1);
    const riskPenalty = Math.min(riskAssessment.overallRisk, 1) * 0.3;
    const constraintPenalty = constraintViolationCount * 0.1;
    const costBenefitBonus = Math.min(costBenefitRatio / 10, 0.2); // Cap the bonus

    const rawScore = (
      feasibilityScore * 0.25 +
      criteriaAverage * 0.25 +
      (1 - riskPenalty) * 0.2 +
      contextCompatibility * 0.15 +
      costBenefitBonus * 0.1 +
      learningAdjustment * 0.05
    ) - constraintPenalty;

    return Math.max(0, Math.min(1, rawScore));
  }

  private calculateOptionConfidence(
    feasibilityScore: number,
    criteriaScores: CriteriaScore[],
    constraintViolationCount: number
  ): ConfidenceLevel {
    let confidence = feasibilityScore;
    
    if (criteriaScores.length > 0) {
      const avgCriteriaScore = criteriaScores.reduce((sum, cs) => sum + cs.score, 0) / criteriaScores.length;
      confidence = (confidence + avgCriteriaScore) / 2;
    }

    // Reduce confidence for constraint violations
    confidence *= Math.max(0.3, 1 - (constraintViolationCount * 0.2));

    return IntelligenceUtils.numberToConfidence(confidence);
  }

  private calculateDecisionConfidence(
    selectedOption: EvaluatedOption,
    allOptions: EvaluatedOption[],
    contextAnalysis: ContextAnalysis
  ): ConfidenceLevel {
    // Base confidence on selected option quality
    let confidence = selectedOption.overallScore;

    // Adjust based on option differentiation
    if (allOptions.length > 1) {
      const secondBest = allOptions[1];
      const scoreDifference = selectedOption.overallScore - secondBest.overallScore;
      confidence += Math.min(scoreDifference, 0.2); // Bonus for clear winner
    }

    // Adjust based on context analysis confidence
    const contextConfidence = IntelligenceUtils.confidenceToNumber(contextAnalysis.overallConfidence);
    confidence = (confidence + contextConfidence) / 2;

    return IntelligenceUtils.numberToConfidence(confidence);
  }

  // ============================================================================
  // REASONING AND LEARNING METHODS
  // ============================================================================

  private identifyPrimaryFactors(
    selectedOption: EvaluatedOption,
    request: DecisionRequest,
    contextAnalysis: ContextAnalysis
  ): ReasoningFactor[] {
    const factors: ReasoningFactor[] = [];

    // Feasibility factor
    factors.push({
      id: 'feasibility',
      description: 'Option feasibility assessment',
      weight: 0.25,
      evidence: [{
        source: 'feasibility-analysis',
        data: selectedOption.feasibilityScore,
        reliability: 0.9,
        timestamp: new Date()
      }],
      confidence: selectedOption.confidence
    });

    // Risk factor
    if (selectedOption.enhancedRiskAssessment.overallRisk > 0.3) {
      factors.push({
        id: 'risk-assessment',
        description: 'Risk level consideration',
        weight: 0.2,
        evidence: [{
          source: 'risk-analysis',
          data: selectedOption.enhancedRiskAssessment,
          reliability: 0.8,
          timestamp: new Date()
        }],
        confidence: ConfidenceLevel.MEDIUM
      });
    }

    // Context compatibility factor
    factors.push({
      id: 'context-compatibility',
      description: 'Alignment with current context',
      weight: 0.15,
      evidence: [{
        source: 'context-analysis',
        data: selectedOption.contextCompatibility,
        reliability: 0.85,
        timestamp: new Date()
      }],
      confidence: contextAnalysis.overallConfidence
    });

    return factors;
  }

  private analyzeTradeoffs(allOptions: EvaluatedOption[]): Tradeoff[] {
    const tradeoffs: Tradeoff[] = [];

    if (allOptions.length < 2) return tradeoffs;

    const selectedOption = allOptions[0];
    const alternatives = allOptions.slice(1, 3); // Compare with top 2 alternatives

    alternatives.forEach(alt => {
      // Risk vs Feasibility tradeoff
      if (selectedOption.feasibilityScore > alt.feasibilityScore && 
          selectedOption.enhancedRiskAssessment.overallRisk > alt.enhancedRiskAssessment.overallRisk) {
        tradeoffs.push({
          factor1: 'feasibility',
          factor2: 'risk',
          relationship: 'competing',
          impact: Math.abs(selectedOption.feasibilityScore - alt.feasibilityScore)
        });
      }

      // Cost vs Benefit tradeoff
      if (selectedOption.costBenefitRatio !== alt.costBenefitRatio) {
        tradeoffs.push({
          factor1: 'cost',
          factor2: 'benefit',
          relationship: selectedOption.costBenefitRatio > alt.costBenefitRatio ? 'complementary' : 'competing',
          impact: Math.abs(selectedOption.costBenefitRatio - alt.costBenefitRatio)
        });
      }
    });

    return tradeoffs;
  }

  private documentAssumptions(
    selectedOption: EvaluatedOption,
    request: DecisionRequest,
    contextAnalysis: ContextAnalysis
  ): Assumption[] {
    const assumptions: Assumption[] = [];

    // System stability assumption
    if (contextAnalysis.system.stability === 'stable' || contextAnalysis.system.stability === 'moderate') {
      assumptions.push({
        id: 'system-stability',
        description: 'System will maintain current stability level during execution',
        confidence: contextAnalysis.system.confidence,
        validationMethod: 'Continuous system monitoring',
        criticalness: 0.7
      });
    }

    // UI state assumption
    assumptions.push({
      id: 'ui-state-persistence',
      description: 'UI elements will remain accessible during execution',
      confidence: ConfidenceLevel.MEDIUM,
      validationMethod: 'Pre-execution element validation',
      criticalness: 0.8
    });

    // User context assumption
    if (request.priority === DecisionPriority.CRITICAL) {
      assumptions.push({
        id: 'user-availability',
        description: 'User context will not change significantly during execution',
        confidence: ConfidenceLevel.MEDIUM,
        validationMethod: 'User interaction monitoring',
        criticalness: 0.6
      });
    }

    return assumptions;
  }

  private identifyUncertainties(
    selectedOption: EvaluatedOption,
    contextAnalysis: ContextAnalysis
  ): Uncertainty[] {
    const uncertainties: Uncertainty[] = [];

    // Execution time uncertainty
    if (selectedOption.option.executionPlan.totalDuration > 10000) {
      uncertainties.push({
        factor: 'execution_time',
        range: [selectedOption.option.executionPlan.totalDuration * 0.8, selectedOption.option.executionPlan.totalDuration * 1.3],
        distribution: 'normal',
        impact: 0.4
      });
    }

    // Success probability uncertainty
    uncertainties.push({
      factor: 'success_probability',
      range: [selectedOption.feasibilityScore * 0.9, Math.min(1, selectedOption.feasibilityScore * 1.1)],
      distribution: 'normal',
      impact: 0.6
    });

    // System performance uncertainty
    if (contextAnalysis.system.performanceScore < 0.7) {
      uncertainties.push({
        factor: 'system_performance',
        range: [contextAnalysis.system.performanceScore * 0.8, contextAnalysis.system.performanceScore * 1.2],
        distribution: 'uniform',
        impact: 0.5
      });
    }

    return uncertainties;
  }

  private proposeMitigationStrategies(riskFactors: RiskFactor[]): RiskMitigation[] {
    return riskFactors
      .filter(factor => factor.impact * factor.probability > 0.3)
      .map(factor => ({
        riskId: factor.id,
        strategy: this.generateMitigationStrategy(factor),
        effectiveness: this.estimateMitigationEffectiveness(factor),
        cost: this.estimateMitigationCost(factor)
      }));
  }

  private identifyLearningOpportunities(
    selectedOption: EvaluatedOption,
    request: DecisionRequest,
    contextAnalysis: ContextAnalysis
  ): LearningOpportunity[] {
    const opportunities: LearningOpportunity[] = [];

    // Decision outcome learning
    opportunities.push({
      scenario: 'decision-outcome-correlation',
      dataPoints: ['selected_option_id', 'context_hash', 'actual_outcome', 'execution_time'],
      expectedInsight: 'Improve option selection accuracy for similar contexts',
      priority: 0.8
    });

    // Risk assessment learning
    if (selectedOption.enhancedRiskAssessment.overallRisk > 0.5) {
      opportunities.push({
        scenario: 'high-risk-decision-outcomes',
        dataPoints: ['risk_factors', 'actual_failures', 'mitigation_effectiveness'],
        expectedInsight: 'Refine risk assessment models for better accuracy',
        priority: 0.9
      });
    }

    // Context pattern learning
    opportunities.push({
      scenario: 'context-decision-patterns',
      dataPoints: ['context_features', 'successful_decisions', 'failed_decisions'],
      expectedInsight: 'Identify context patterns that lead to successful decisions',
      priority: 0.7
    });

    return opportunities;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private generateWarnings(
    selectedOption: EvaluatedOption,
    request: DecisionRequest,
    contextAnalysis: ContextAnalysis
  ): string[] {
    const warnings: string[] = [];

    // High risk warning
    if (selectedOption.enhancedRiskAssessment.overallRisk > this.riskThresholds.high) {
      warnings.push('Selected option has high risk - consider additional safeguards');
    }

    // Constraint violation warning
    if (selectedOption.constraintViolations.length > 0) {
      warnings.push(`Option violates ${selectedOption.constraintViolations.length} constraint(s)`);
    }

    // System performance warning
    if (contextAnalysis.system.performanceScore < 0.4 && selectedOption.option.executionPlan.totalDuration > 15000) {
      warnings.push('System performance is low - long execution may fail');
    }

    // Low confidence warning
    if (IntelligenceUtils.confidenceToNumber(selectedOption.confidence) < 0.5) {
      warnings.push('Decision confidence is low - proceed with caution');
    }

    return warnings;
  }

  private generateRecommendations(
    selectedOption: EvaluatedOption,
    request: DecisionRequest,
    contextAnalysis: ContextAnalysis
  ): string[] {
    const recommendations: string[] = [];

    // Risk mitigation recommendations
    if (selectedOption.enhancedRiskAssessment.overallRisk > 0.5) {
      recommendations.push('Implement comprehensive error handling and rollback mechanisms');
    }

    // Performance optimization recommendations
    if (contextAnalysis.system.performanceScore < 0.6) {
      recommendations.push('Consider system optimization before executing complex operations');
    }

    // Learning recommendations
    if (contextAnalysis.history.recentSuccessRate < 0.7) {
      recommendations.push('Monitor execution closely and learn from outcomes to improve future decisions');
    }

    // Context-specific recommendations
    if (contextAnalysis.screen.complexity > 0.8) {
      recommendations.push('Use conservative interaction strategies for complex UI environments');
    }

    return recommendations;
  }

  private async storeBecisionOutcome(
    request: DecisionRequest,
    response: DecisionResponse,
    processingTime: number
  ): Promise<void> {
    const outcome: DecisionOutcome = {
      requestId: request.id,
      selectedOptionId: response.selectedOptionId,
      confidence: response.confidence,
      processingTime,
      timestamp: new Date()
    };

    this.decisionHistory.set(request.id, outcome);

    // Update learning weights based on historical performance
    await this.updateLearningWeights(request, response);
  }

  private async updateLearningWeights(
    request: DecisionRequest,
    response: DecisionResponse
  ): Promise<void> {
    // This would be implemented to learn from decision outcomes
    // For now, we'll implement a placeholder
    const selectedOption = request.options.find(opt => opt.id === response.selectedOptionId);
    if (selectedOption) {
      const optionKey = this.getOptionKey(selectedOption);
      const currentWeight = this.learningWeights.get(optionKey) || 0;
      
      // Placeholder learning logic - would be enhanced with actual outcome data
      const confidenceValue = IntelligenceUtils.confidenceToNumber(response.confidence);
      const learningRate = 0.1;
      const newWeight = currentWeight + (learningRate * (confidenceValue - 0.5));
      
      this.learningWeights.set(optionKey, Math.max(-1, Math.min(1, newWeight)));
    }
  }

  private initializeLearningWeights(): void {
    // Initialize with neutral weights
    // This could be loaded from persistent storage in a real implementation
  }

  private applyPriorityAdjustment(score: number, priority: DecisionPriority): number {
    const adjustments = {
      [DecisionPriority.LOW]: 0,
      [DecisionPriority.NORMAL]: 0,
      [DecisionPriority.HIGH]: 0.05,
      [DecisionPriority.CRITICAL]: 0.1
    };

    return score + (adjustments[priority] || 0);
  }

  private getMinimumThreshold(priority: DecisionPriority): number {
    const thresholds = {
      [DecisionPriority.LOW]: 0.3,
      [DecisionPriority.NORMAL]: 0.4,
      [DecisionPriority.HIGH]: 0.5,
      [DecisionPriority.CRITICAL]: 0.6
    };

    return thresholds[priority] || 0.4;
  }

  private exceedsResourceLimit(option: DecisionOption, constraint: DecisionConstraint): boolean {
    // Simplified resource checking
    return option.executionPlan.totalDuration > (constraint.value as number);
  }

  private exceedsTimeLimit(option: DecisionOption, constraint: DecisionConstraint): boolean {
    return option.executionPlan.totalDuration > (constraint.value as number);
  }

  private violatesSafetyConstraint(option: DecisionOption, constraint: DecisionConstraint): boolean {
    return option.riskAssessment.overallRisk > (constraint.value as number);
  }

  private requiresUIInteraction(option: DecisionOption): boolean {
    return option.executionPlan.steps.some(step => 
      step.description.toLowerCase().includes('click') || 
      step.description.toLowerCase().includes('type') ||
      step.description.toLowerCase().includes('interact')
    );
  }

  private getOptionKey(option: DecisionOption): string {
    // Create a unique key for option learning
    return `${option.description.substring(0, 20)}_${option.feasibility.toFixed(2)}`;
  }

  private generateCriteriaReasoning(
    criterion: DecisionCriterion,
    score: number,
    contextAnalysis: ContextAnalysis
  ): string {
    let reasoning = `Base score: ${(criterion.successProbability * criterion.weight).toFixed(2)}`;
    
    if (score !== criterion.successProbability * criterion.weight) {
      reasoning += `, adjusted to ${score.toFixed(2)} based on context`;
    }

    return reasoning;
  }

  private generateMitigationStrategy(factor: RiskFactor): string {
    const strategies = {
      'system': 'Implement system monitoring and circuit breakers',
      'ui': 'Use robust element detection and retry mechanisms',
      'performance': 'Optimize resource usage and implement timeouts',
      'security': 'Apply security best practices and validation'
    };

    return strategies[factor.category as keyof typeof strategies] || 'Apply appropriate risk controls';
  }

  private estimateMitigationEffectiveness(factor: RiskFactor): number {
    // Simplified effectiveness estimation
    const baseEffectiveness = 0.7;
    const complexityPenalty = Math.min(factor.impact * 0.2, 0.3);
    return Math.max(0.3, baseEffectiveness - complexityPenalty);
  }

  private estimateMitigationCost(factor: RiskFactor): Cost {
    return {
      timeMs: Math.round(factor.impact * 1000),
      cpuUsage: Math.round(factor.impact * 10),
      memoryMB: Math.round(factor.impact * 50),
      riskScore: Math.max(0, factor.impact - 0.3)
    };
  }
}

// ============================================================================
// TYPE DEFINITIONS FOR DECISION ENGINE
// ============================================================================

export interface EvaluatedOption {
  option: DecisionOption;
  overallScore: number;
  feasibilityScore: number;
  criteriaScores: CriteriaScore[];
  constraintViolations: ConstraintViolation[];
  enhancedRiskAssessment: EnhancedRiskAssessment;
  costBenefitRatio: number;
  contextCompatibility: number;
  learningAdjustment: number;
  confidence: ConfidenceLevel;
}

export interface CriteriaScore {
  criterionId: string;
  name: string;
  score: number;
  weight: number;
  reasoning: string;
}

export interface ConstraintViolation {
  constraintId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  suggestion: string;
}

export interface EnhancedRiskAssessment {
  overallRisk: number;
  riskFactors: RiskFactor[];
  mitigation: RiskMitigation[];
  acceptableThreshold: number;
  contextualAdjustment: number;
}

export interface DecisionOutcome {
  requestId: string;
  selectedOptionId: string;
  confidence: ConfidenceLevel;
  processingTime: number;
  timestamp: Date;
}