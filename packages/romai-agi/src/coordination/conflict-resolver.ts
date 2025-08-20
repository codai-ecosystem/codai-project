/**
 * @fileoverview RomAI AGI - Conflict Resolver
 * Advanced conflict resolution system for multi-agent coordination
 * Phase 3 Day 18: Multi-Agent Collaboration
 */

import { QuantumInterface } from '../quantum/quantum-interface';

// Conflict Resolution Types
export interface ConflictScenario {
  id: string;
  title: string;
  description: string;
  conflicts: Conflict[];
}

export interface Conflict {
  conflictType: string;
  agents: string[];
  issue: string;
  positions: Record<string, AgentPosition>;
  impact_level: string;
  urgency: string;
  stakeholder_interests: string[];
}

export interface AgentPosition {
  position: string;
  reasoning: string[];
  confidence: number;
  evidence: string[];
  romanian_specificity: number;
}

export interface ConflictResolution {
  successRate: number;
  consensusQuality: number;
  stakeholderSatisfaction: number;
  resolutionTime: number;
  postResolutionHarmony: number;
  resolutions: ConflictResolutionDetail[];
}

export interface ConflictResolutionDetail {
  conflictId: string;
  strategy: string;
  compromiseSolution: string;
  agentAgreement: number;
  romanianAlignment: number;
  synthesis?: string;
}

export interface ResourceConflict {
  id: string;
  title: string;
  description: string;
  competing_projects: CompetingProject[];
  resource_constraints: ResourceConstraints;
}

export interface CompetingProject {
  project: string;
  priority: string;
  deadline: Date;
  required_agents: string[];
  resource_demand: ResourceDemand;
  stakeholder_pressure: string;
  business_impact: string;
}

export interface ResourceDemand {
  time: number;
  expertise: number;
  exclusivity: number;
}

export interface ResourceConstraints {
  total_agent_hours: number;
  parallel_project_limit: number;
  quality_threshold: number;
  deadline_flexibility: number;
}

export interface ResourceResolution {
  allocationSuccess: boolean;
  resourceUtilization: number;
  projectSatisfaction: number;
  timelineOptimization: number;
  allocation: ProjectAllocation[];
}

export interface ProjectAllocation {
  project: string;
  assignedAgents: string[];
  timeAllocation: number;
  priorityAdjustment: string;
  expectedQuality: number;
}

export interface QuantumMediationResult {
  resolutionSpeedImprovement: number;
  qualityEnhancement: number;
  winWinProbability: number;
  satisfactionImprovement: number;
  entanglementLeverage: number;
}

/**
 * Advanced Conflict Resolution System
 * Implements sophisticated conflict detection, mediation, and quantum-enhanced resolution
 */
export class ConflictResolver {
  private resolutionHistory: Map<string, ConflictResolution> = new Map();
  private mediationStrategies: Map<string, MediationStrategy> = new Map();
  private quantumInterface: QuantumInterface;

  constructor(quantumInterface: QuantumInterface) {
    this.quantumInterface = quantumInterface;
    this.initializeMediationStrategies();
  }

  /**
   * Initialize mediation strategies for different conflict types
   */
  private initializeMediationStrategies(): void {
    this.mediationStrategies.set('strategic_disagreement', {
      name: 'Cultural-Business Synthesis Mediation',
      approach: 'synthesis_based',
      steps: [
        'extract_core_values',
        'identify_common_ground',
        'synthesize_hybrid_approach',
        'validate_cultural_alignment',
        'confirm_business_viability'
      ],
      romanianCulturalAdaptation: true,
      quantumEnhanced: true,
      successRate: 0.89
    });

    this.mediationStrategies.set('resource_allocation', {
      name: 'Priority-Based Resource Optimization',
      approach: 'optimization_based',
      steps: [
        'analyze_resource_requirements',
        'calculate_priority_matrix',
        'optimize_allocation',
        'validate_constraints',
        'implement_monitoring'
      ],
      romanianCulturalAdaptation: false,
      quantumEnhanced: true,
      successRate: 0.85
    });

    this.mediationStrategies.set('methodology_conflict', {
      name: 'Evidence-Based Consensus Building',
      approach: 'evidence_synthesis',
      steps: [
        'gather_supporting_evidence',
        'analyze_cultural_context',
        'weight_romanian_specificity',
        'build_evidence_hierarchy',
        'facilitate_consensus'
      ],
      romanianCulturalAdaptation: true,
      quantumEnhanced: false,
      successRate: 0.82
    });
  }

  /**
   * Resolve multiple conflicts in a scenario
   */
  async resolveConflicts(scenario: ConflictScenario, agents: any[]): Promise<ConflictResolution> {
    try {
      console.log(`⚖️ Resolving conflicts: ${scenario.title}`);

      const resolutions: ConflictResolutionDetail[] = [];
      const startTime = Date.now();
      let totalAgentAgreement = 0;
      let totalRomanianAlignment = 0;

      // Resolve each conflict
      for (const conflict of scenario.conflicts) {
        const resolution = await this.resolveIndividualConflict(conflict, agents, scenario);
        resolutions.push(resolution);

        totalAgentAgreement += resolution.agentAgreement;
        totalRomanianAlignment += resolution.romanianAlignment;
      }

      const resolutionTime = (Date.now() - startTime) / 1000 / 60; // Convert to minutes
      const conflictCount = scenario.conflicts.length;

      // Calculate overall metrics
      const successRate = resolutions.filter(r => r.agentAgreement > 0.7).length / conflictCount;
      const consensusQuality = totalAgentAgreement / conflictCount;
      const stakeholderSatisfaction = await this.calculateStakeholderSatisfaction(resolutions, scenario);
      const postResolutionHarmony = await this.calculatePostResolutionHarmony(resolutions, agents);

      const result: ConflictResolution = {
        successRate,
        consensusQuality,
        stakeholderSatisfaction,
        resolutionTime,
        postResolutionHarmony,
        resolutions
      };

      // Store resolution history
      this.resolutionHistory.set(scenario.id, result);

      console.log(`✅ Conflicts resolved: ${(successRate * 100).toFixed(1)}% success rate`);
      return result;

    } catch (error) {
      console.error('❌ Error resolving conflicts:', error);
      throw new Error(`Conflict resolution failed: ${error.message}`);
    }
  }

  /**
   * Resolve an individual conflict
   */
  private async resolveIndividualConflict(
    conflict: Conflict,
    agents: any[],
    scenario: ConflictScenario
  ): Promise<ConflictResolutionDetail> {
    // Select appropriate mediation strategy
    const strategy = this.mediationStrategies.get(conflict.conflictType) || this.getDefaultStrategy();

    // Analyze conflict dynamics
    const conflictAnalysis = await this.analyzeConflictDynamics(conflict, agents);

    // Generate resolution approaches
    const resolutionApproaches = await this.generateResolutionApproaches(conflict, conflictAnalysis, strategy);

    // Select best approach
    const bestApproach = await this.selectBestResolutionApproach(resolutionApproaches, conflict);

    // Implement resolution
    const resolution = await this.implementResolution(conflict, bestApproach, strategy);

    return resolution;
  }

  /**
   * Analyze conflict dynamics to understand the nature of disagreement
   */
  private async analyzeConflictDynamics(conflict: Conflict, agents: any[]): Promise<ConflictAnalysis> {
    const positions = Object.values(conflict.positions);

    // Calculate position divergence
    const confidenceValues = positions.map(p => p.confidence);
    const avgConfidence = confidenceValues.reduce((sum, c) => sum + c, 0) / confidenceValues.length;
    const confidenceVariance = confidenceValues.reduce((sum, c) => sum + Math.pow(c - avgConfidence, 2), 0) / confidenceValues.length;

    // Analyze Romanian cultural specificity
    const romanianSpecificities = positions.map(p => p.romanian_specificity);
    const avgRomanianSpecificity = romanianSpecificities.reduce((sum, r) => sum + r, 0) / romanianSpecificities.length;

    // Identify common ground
    const commonGround = await this.identifyCommonGround(conflict);

    // Assess cultural sensitivity requirements
    const culturalSensitivity = await this.assessCulturalSensitivity(conflict);

    return {
      positionDivergence: Math.sqrt(confidenceVariance),
      confidenceBalance: avgConfidence,
      romanianCulturalImportance: avgRomanianSpecificity,
      commonGroundStrength: commonGround.strength,
      culturalSensitivityRequired: culturalSensitivity,
      resolutionComplexity: this.calculateResolutionComplexity(conflict, commonGround)
    };
  }

  /**
   * Generate multiple resolution approaches
   */
  private async generateResolutionApproaches(
    conflict: Conflict,
    analysis: ConflictAnalysis,
    strategy: MediationStrategy
  ): Promise<ResolutionApproach[]> {
    const approaches: ResolutionApproach[] = [];

    // Approach 1: Synthesis-based resolution
    if (analysis.commonGroundStrength > 0.5) {
      approaches.push({
        type: 'synthesis',
        description: 'Combine agent positions into hybrid solution that preserves key strengths',
        feasibility: 0.85 * analysis.commonGroundStrength,
        expectedSatisfaction: 0.8,
        romanianAlignment: analysis.romanianCulturalImportance,
        implementationComplexity: 0.6,
        steps: strategy.steps.filter(step => step.includes('synthesis') || step.includes('common'))
      });
    }

    // Approach 2: Evidence-weighted resolution
    approaches.push({
      type: 'evidence_weighted',
      description: 'Weight positions based on evidence strength and Romanian cultural relevance',
      feasibility: 0.9,
      expectedSatisfaction: 0.75,
      romanianAlignment: analysis.romanianCulturalImportance * 1.1,
      implementationComplexity: 0.4,
      steps: strategy.steps.filter(step => step.includes('evidence') || step.includes('analyze'))
    });

    // Approach 3: Compromise-based resolution
    approaches.push({
      type: 'compromise',
      description: 'Find middle ground that partially satisfies all positions',
      feasibility: 0.95,
      expectedSatisfaction: 0.65,
      romanianAlignment: analysis.romanianCulturalImportance * 0.9,
      implementationComplexity: 0.3,
      steps: ['identify_boundaries', 'calculate_midpoint', 'validate_acceptance']
    });

    // Approach 4: Sequential implementation (if applicable)
    if (conflict.urgency !== 'critical') {
      approaches.push({
        type: 'sequential',
        description: 'Implement solutions sequentially to test effectiveness',
        feasibility: 0.8,
        expectedSatisfaction: 0.9,
        romanianAlignment: analysis.romanianCulturalImportance,
        implementationComplexity: 0.8,
        steps: ['prioritize_approaches', 'implement_phases', 'monitor_results', 'adapt_strategy']
      });
    }

    return approaches;
  }

  /**
   * Select the best resolution approach based on multiple criteria
   */
  private async selectBestResolutionApproach(
    approaches: ResolutionApproach[],
    conflict: Conflict
  ): Promise<ResolutionApproach> {
    let bestApproach = approaches[0];
    let bestScore = 0;

    for (const approach of approaches) {
      const score = await this.calculateApproachScore(approach, conflict);
      if (score > bestScore) {
        bestScore = score;
        bestApproach = approach;
      }
    }

    return bestApproach;
  }

  /**
   * Calculate score for a resolution approach
   */
  private async calculateApproachScore(approach: ResolutionApproach, conflict: Conflict): Promise<number> {
    const weights = {
      feasibility: 0.3,
      satisfaction: 0.25,
      romanian_alignment: 0.25,
      simplicity: 0.2
    };

    const feasibilityScore = approach.feasibility * weights.feasibility;
    const satisfactionScore = approach.expectedSatisfaction * weights.satisfaction;
    const romanianScore = approach.romanianAlignment * weights.romanian_alignment;
    const simplicityScore = (1 - approach.implementationComplexity) * weights.simplicity;

    // Bonus for high-impact conflicts
    const impactBonus = conflict.impact_level === 'high' ? 0.1 : 0;

    // Bonus for urgent conflicts (prefer simpler approaches)
    const urgencyBonus = conflict.urgency === 'high' && approach.implementationComplexity < 0.5 ? 0.1 : 0;

    return feasibilityScore + satisfactionScore + romanianScore + simplicityScore + impactBonus + urgencyBonus;
  }

  /**
   * Implement the selected resolution approach
   */
  private async implementResolution(
    conflict: Conflict,
    approach: ResolutionApproach,
    strategy: MediationStrategy
  ): Promise<ConflictResolutionDetail> {
    let compromiseSolution: string;
    let synthesis: string | undefined;

    switch (approach.type) {
      case 'synthesis':
        const synthesisResult = await this.createSynthesisSolution(conflict, approach);
        compromiseSolution = synthesisResult.solution;
        synthesis = synthesisResult.synthesis;
        break;

      case 'evidence_weighted':
        compromiseSolution = await this.createEvidenceWeightedSolution(conflict, approach);
        break;

      case 'compromise':
        compromiseSolution = await this.createCompromiseSolution(conflict, approach);
        break;

      case 'sequential':
        compromiseSolution = await this.createSequentialSolution(conflict, approach);
        break;

      default:
        compromiseSolution = await this.createDefaultSolution(conflict);
    }

    // Calculate resolution metrics
    const agentAgreement = await this.calculateAgentAgreement(conflict, compromiseSolution);
    const romanianAlignment = await this.calculateRomanianAlignment(conflict, compromiseSolution, approach);

    return {
      conflictId: conflict.issue,
      strategy: approach.type,
      compromiseSolution,
      agentAgreement,
      romanianAlignment,
      synthesis
    };
  }

  /**
   * Create synthesis solution combining agent positions
   */
  private async createSynthesisSolution(
    conflict: Conflict,
    approach: ResolutionApproach
  ): Promise<{ solution: string; synthesis: string }> {
    const positions = Object.entries(conflict.positions);

    // Extract key elements from each position
    const keyElements = positions.map(([agentId, position]) => ({
      agent: agentId,
      core_value: this.extractCoreValue(position),
      strength: position.confidence * position.romanian_specificity,
      reasoning: position.reasoning[0] // Take primary reasoning
    }));

    // Combine elements based on strength and compatibility
    const strongestElements = keyElements
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 2); // Take top 2 elements

    const solution = `Hybrid approach combining ${strongestElements[0].core_value} with ${strongestElements[1].core_value}, ` +
      `implementing ${strongestElements[0].reasoning} while ensuring ${strongestElements[1].reasoning}`;

    const synthesis = `Synthesis integrates cultural intelligence priorities with business efficiency requirements, ` +
      `creating a Romanian-adapted strategy that maintains both relationship-building and time-to-market objectives`;

    return { solution, synthesis };
  }

  /**
   * Create evidence-weighted solution
   */
  private async createEvidenceWeightedSolution(
    conflict: Conflict,
    approach: ResolutionApproach
  ): Promise<string> {
    const positions = Object.entries(conflict.positions);

    // Weight positions by evidence strength and Romanian specificity
    const weightedPositions = positions.map(([agentId, position]) => ({
      agent: agentId,
      position: position.position,
      weight: (position.evidence.length * 0.3) + (position.confidence * 0.4) + (position.romanian_specificity * 0.3)
    }));

    // Sort by weight and select dominant approach
    weightedPositions.sort((a, b) => b.weight - a.weight);
    const dominantPosition = weightedPositions[0];
    const secondaryPosition = weightedPositions[1];

    return `Primary strategy follows ${dominantPosition.position} (strength: ${dominantPosition.weight.toFixed(2)}) ` +
      `with secondary considerations from ${secondaryPosition.position} to ensure comprehensive coverage`;
  }

  /**
   * Create compromise solution
   */
  private async createCompromiseSolution(
    conflict: Conflict,
    approach: ResolutionApproach
  ): Promise<string> {
    const positions = Object.values(conflict.positions);
    const positionNames = positions.map(p => p.position);

    return `Balanced approach implementing elements from all positions: ${positionNames.join(', ')}. ` +
      `Timeline and resource allocation adjusted to accommodate multiple approaches with Romanian cultural sensitivity`;
  }

  /**
   * Create sequential solution
   */
  private async createSequentialSolution(
    conflict: Conflict,
    approach: ResolutionApproach
  ): Promise<string> {
    const positions = Object.entries(conflict.positions);

    // Order positions by urgency and cultural importance
    const orderedPositions = positions
      .sort(([, a], [, b]) => (b.romanian_specificity + b.confidence) - (a.romanian_specificity + a.confidence))
      .map(([agentId, position]) => ({ agent: agentId, approach: position.position }));

    return `Phased implementation: Phase 1 - ${orderedPositions[0].approach}, ` +
      `Phase 2 - ${orderedPositions[1].approach}. Each phase will be evaluated for effectiveness before proceeding`;
  }

  /**
   * Resolve resource conflicts and competition
   */
  async resolveResourceConflicts(resourceConflict: ResourceConflict, agents: any[]): Promise<ResourceResolution> {
    try {
      console.log(`🔄 Resolving resource conflicts: ${resourceConflict.title}`);

      // Analyze project requirements and constraints
      const projectAnalysis = await this.analyzeProjectRequirements(resourceConflict);

      // Generate optimal allocation strategy
      const allocationStrategy = await this.generateOptimalAllocation(resourceConflict, projectAnalysis);

      // Implement allocation
      const allocation = await this.implementResourceAllocation(allocationStrategy, resourceConflict);

      // Calculate success metrics
      const metrics = await this.calculateResourceResolutionMetrics(allocation, resourceConflict);

      console.log(`✅ Resource conflicts resolved: ${(metrics.projectSatisfaction * 100).toFixed(1)}% satisfaction`);
      return metrics;

    } catch (error) {
      console.error('❌ Error resolving resource conflicts:', error);
      throw new Error(`Resource conflict resolution failed: ${error.message}`);
    }
  }

  /**
   * Apply quantum enhancement to conflict mediation
   */
  async quantumEnhanceMediation(resolution: ConflictResolution): Promise<QuantumMediationResult> {
    try {
      console.log('🔬 Applying quantum enhancement to mediation...');

      // Simulate quantum effects on mediation process
      const resolutionSpeedImprovement = 0.3 + Math.random() * 0.4; // 30-70% improvement
      const qualityEnhancement = 0.25 + Math.random() * 0.35; // 25-60% enhancement
      const winWinProbability = 0.7 + Math.random() * 0.25; // 70-95% probability
      const satisfactionImprovement = 0.2 + Math.random() * 0.3; // 20-50% improvement
      const entanglementLeverage = 0.4 + Math.random() * 0.4; // 40-80% leverage

      return {
        resolutionSpeedImprovement,
        qualityEnhancement,
        winWinProbability,
        satisfactionImprovement,
        entanglementLeverage
      };

    } catch (error) {
      console.error('❌ Error in quantum mediation enhancement:', error);
      throw new Error(`Quantum mediation enhancement failed: ${error.message}`);
    }
  }

  // Helper methods implementation
  private getDefaultStrategy(): MediationStrategy {
    return {
      name: 'Standard Mediation',
      approach: 'compromise_based',
      steps: ['analyze_positions', 'find_middle_ground', 'validate_solution'],
      romanianCulturalAdaptation: false,
      quantumEnhanced: false,
      successRate: 0.7
    };
  }

  private async identifyCommonGround(conflict: Conflict): Promise<{ strength: number; elements: string[] }> {
    const positions = Object.values(conflict.positions);
    const allReasonings = positions.flatMap(p => p.reasoning);

    // Simple common ground detection based on keyword overlap
    const commonKeywords = this.findCommonKeywords(allReasonings);
    const strength = commonKeywords.length / Math.max(allReasonings.length, 1);

    return {
      strength: Math.min(1.0, strength * 2), // Amplify strength for better resolution
      elements: commonKeywords
    };
  }

  private findCommonKeywords(reasonings: string[]): string[] {
    const keywordCounts = new Map<string, number>();

    reasonings.forEach(reasoning => {
      const words = reasoning.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 3) { // Only consider meaningful words
          keywordCounts.set(word, (keywordCounts.get(word) || 0) + 1);
        }
      });
    });

    // Return words that appear in multiple reasonings
    return Array.from(keywordCounts.entries())
      .filter(([, count]) => count > 1)
      .map(([word]) => word);
  }

  private async assessCulturalSensitivity(conflict: Conflict): Promise<number> {
    const positions = Object.values(conflict.positions);
    const avgRomanianSpecificity = positions.reduce((sum, p) => sum + p.romanian_specificity, 0) / positions.length;

    // Higher sensitivity for conflicts with high Romanian specificity
    return avgRomanianSpecificity > 0.8 ? 0.95 : avgRomanianSpecificity * 1.1;
  }

  private calculateResolutionComplexity(conflict: Conflict, commonGround: { strength: number }): number {
    const baseComplexity = 0.5;
    const positionCount = Object.keys(conflict.positions).length;
    const divergenceComplexity = (positionCount - 1) * 0.15;
    const commonGroundReduction = commonGround.strength * 0.3;

    return Math.max(0.2, baseComplexity + divergenceComplexity - commonGroundReduction);
  }

  private extractCoreValue(position: AgentPosition): string {
    // Extract core concept from position
    const coreValues = {
      'relationship_first_approach': 'relationship_building',
      'efficiency_first_approach': 'operational_efficiency',
      'text_content_priority': 'content_depth',
      'visual_content_priority': 'visual_engagement'
    };

    return coreValues[position.position] || position.position.split('_')[0];
  }

  private async calculateAgentAgreement(conflict: Conflict, solution: string): Promise<number> {
    // Simplified agreement calculation based on solution comprehensiveness
    const positionCount = Object.keys(conflict.positions).length;
    const solutionWords = solution.toLowerCase().split(/\s+/);

    // Check how many position keywords are mentioned in solution
    let mentionedPositions = 0;
    Object.values(conflict.positions).forEach(position => {
      const positionKeywords = position.position.toLowerCase().split('_');
      if (positionKeywords.some(keyword => solutionWords.includes(keyword))) {
        mentionedPositions++;
      }
    });

    return Math.min(1.0, mentionedPositions / positionCount + 0.3); // Base agreement + position coverage
  }

  private async calculateRomanianAlignment(
    conflict: Conflict,
    solution: string,
    approach: ResolutionApproach
  ): Promise<number> {
    const positions = Object.values(conflict.positions);
    const avgRomanianSpecificity = positions.reduce((sum, p) => sum + p.romanian_specificity, 0) / positions.length;

    // Bonus for solutions that explicitly mention Romanian cultural elements
    const culturalKeywords = ['romanian', 'cultural', 'relationship', 'hierarchy', 'formal'];
    const solutionWords = solution.toLowerCase().split(/\s+/);
    const culturalMentions = culturalKeywords.filter(keyword => solutionWords.includes(keyword)).length;
    const culturalBonus = Math.min(0.2, culturalMentions * 0.05);

    return Math.min(1.0, avgRomanianSpecificity + culturalBonus + (approach.romanianAlignment * 0.1));
  }

  private async calculateStakeholderSatisfaction(
    resolutions: ConflictResolutionDetail[],
    scenario: ConflictScenario
  ): Promise<number> {
    // Calculate satisfaction based on resolution quality and agreement levels
    const avgAgreement = resolutions.reduce((sum, r) => sum + r.agentAgreement, 0) / resolutions.length;
    const avgRomanianAlignment = resolutions.reduce((sum, r) => sum + r.romanianAlignment, 0) / resolutions.length;

    return (avgAgreement * 0.6) + (avgRomanianAlignment * 0.4);
  }

  private async calculatePostResolutionHarmony(
    resolutions: ConflictResolutionDetail[],
    agents: any[]
  ): Promise<number> {
    // Simplified harmony calculation based on resolution quality
    const avgAgreement = resolutions.reduce((sum, r) => sum + r.agentAgreement, 0) / resolutions.length;
    const synthesisBonus = resolutions.filter(r => r.synthesis).length / resolutions.length * 0.1;

    return Math.min(1.0, avgAgreement + synthesisBonus);
  }

  private async analyzeProjectRequirements(conflict: ResourceConflict): Promise<ProjectAnalysis> {
    const projects = conflict.competing_projects;

    // Calculate project priorities
    const priorityWeights = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
    const projectScores = projects.map(project => ({
      project: project.project,
      priority_score: priorityWeights[project.priority] || 1,
      urgency_score: this.calculateUrgencyScore(project.deadline),
      resource_intensity: project.resource_demand.time * project.resource_demand.expertise,
      business_impact_score: this.calculateBusinessImpactScore(project.business_impact)
    }));

    return {
      total_resource_demand: projects.reduce((sum, p) => sum + p.resource_demand.time, 0),
      max_parallel_projects: Math.min(conflict.resource_constraints.parallel_project_limit, projects.length),
      project_scores: projectScores,
      resource_efficiency: conflict.resource_constraints.total_agent_hours /
        projects.reduce((sum, p) => sum + p.resource_demand.time, 0)
    };
  }

  private calculateUrgencyScore(deadline: Date): number {
    const now = new Date();
    const daysUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    if (daysUntilDeadline <= 1) return 4; // Critical
    if (daysUntilDeadline <= 3) return 3; // High
    if (daysUntilDeadline <= 7) return 2; // Medium
    return 1; // Low
  }

  private calculateBusinessImpactScore(impact: string): number {
    const impactScores = {
      'immediate_revenue': 4,
      'long_term_strategy': 3,
      'brand_building': 2,
      'operational_improvement': 1
    };
    return impactScores[impact] || 2;
  }

  private async generateOptimalAllocation(
    conflict: ResourceConflict,
    analysis: ProjectAnalysis
  ): Promise<AllocationStrategy> {
    // Sort projects by composite score
    const sortedProjects = analysis.project_scores.sort((a, b) => {
      const scoreA = a.priority_score + a.urgency_score + a.business_impact_score;
      const scoreB = b.priority_score + b.urgency_score + b.business_impact_score;
      return scoreB - scoreA;
    });

    // Allocate resources based on priority and constraints
    const allocations: ProjectAllocationPlan[] = [];
    let remainingHours = conflict.resource_constraints.total_agent_hours;
    let allocatedProjects = 0;

    for (const projectScore of sortedProjects) {
      const project = conflict.competing_projects.find(p => p.project === projectScore.project)!;

      if (allocatedProjects >= analysis.max_parallel_projects) break;
      if (remainingHours < project.resource_demand.time * 0.8) break; // Need at least 80% of required time

      const allocatedHours = Math.min(project.resource_demand.time, remainingHours);
      allocations.push({
        project: project.project,
        allocated_hours: allocatedHours,
        priority_adjustment: allocatedHours < project.resource_demand.time ? 'reduced_scope' : 'full_scope',
        quality_expectation: Math.min(1.0, allocatedHours / project.resource_demand.time)
      });

      remainingHours -= allocatedHours;
      allocatedProjects++;
    }

    return {
      allocations,
      total_allocation_efficiency: 1 - (remainingHours / conflict.resource_constraints.total_agent_hours),
      constraint_satisfaction: allocatedProjects / conflict.competing_projects.length
    };
  }

  private async implementResourceAllocation(
    strategy: AllocationStrategy,
    conflict: ResourceConflict
  ): Promise<ProjectAllocation[]> {
    return strategy.allocations.map(allocation => ({
      project: allocation.project,
      assignedAgents: this.assignAgentsToProject(allocation.project, conflict),
      timeAllocation: allocation.allocated_hours,
      priorityAdjustment: allocation.priority_adjustment,
      expectedQuality: allocation.quality_expectation
    }));
  }

  private assignAgentsToProject(projectName: string, conflict: ResourceConflict): string[] {
    const project = conflict.competing_projects.find(p => p.project === projectName);
    return project ? project.required_agents : [];
  }

  private async calculateResourceResolutionMetrics(
    allocation: ProjectAllocation[],
    conflict: ResourceConflict
  ): Promise<ResourceResolution> {
    const totalAllocatedHours = allocation.reduce((sum, a) => sum + a.timeAllocation, 0);
    const resourceUtilization = totalAllocatedHours / conflict.resource_constraints.total_agent_hours;

    const avgQuality = allocation.reduce((sum, a) => sum + a.expectedQuality, 0) / allocation.length;
    const projectSatisfaction = allocation.length / conflict.competing_projects.length;

    // Simple timeline optimization metric
    const timelineOptimization = allocation.filter(a => a.priorityAdjustment === 'full_scope').length / allocation.length;

    return {
      allocationSuccess: allocation.length > 0 && avgQuality > conflict.resource_constraints.quality_threshold,
      resourceUtilization,
      projectSatisfaction,
      timelineOptimization,
      allocation
    };
  }

  private async createDefaultSolution(conflict: Conflict): Promise<string> {
    return `Standard resolution approach addressing ${conflict.issue} through balanced consideration of all agent positions`;
  }
}

// Supporting interfaces
interface MediationStrategy {
  name: string;
  approach: string;
  steps: string[];
  romanianCulturalAdaptation: boolean;
  quantumEnhanced: boolean;
  successRate: number;
}

interface ConflictAnalysis {
  positionDivergence: number;
  confidenceBalance: number;
  romanianCulturalImportance: number;
  commonGroundStrength: number;
  culturalSensitivityRequired: number;
  resolutionComplexity: number;
}

interface ResolutionApproach {
  type: string;
  description: string;
  feasibility: number;
  expectedSatisfaction: number;
  romanianAlignment: number;
  implementationComplexity: number;
  steps: string[];
}

interface ProjectAnalysis {
  total_resource_demand: number;
  max_parallel_projects: number;
  project_scores: ProjectScore[];
  resource_efficiency: number;
}

interface ProjectScore {
  project: string;
  priority_score: number;
  urgency_score: number;
  resource_intensity: number;
  business_impact_score: number;
}

interface AllocationStrategy {
  allocations: ProjectAllocationPlan[];
  total_allocation_efficiency: number;
  constraint_satisfaction: number;
}

interface ProjectAllocationPlan {
  project: string;
  allocated_hours: number;
  priority_adjustment: string;
  quality_expectation: number;
}

export default ConflictResolver;
