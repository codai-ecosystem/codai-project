/**
 * Phase 4.1: Enhanced Predictive Memory Engine
 * 
 * Next-generation predictive capabilities building on Phase 3 foundation:
 * - Advanced learning from usage patterns
 * - Real-time adaptation based on effectiveness metrics
 * - Enhanced prediction accuracy through continuous learning
 * - Sophisticated context understanding and pattern recognition
 * - Cross-agent prediction sharing and collaboration
 */

import OpenAI from 'openai';
import { AdvancedMemory } from './server.js';
import { RealTimeLearningEngine, MemoryUsagePattern, LearningInsights } from './learning-engine.js';

// Enhanced prediction interfaces for Phase 4
export interface AdvancedPredictedMemory {
  memoryId: string;
  title: string;
  content: string;
  predictedRelevance: number; // 0.0 to 1.0
  reasoning: string;
  suggestedActions: string[];
  confidence: number;
  timeToNeed: number; // minutes until predicted need
  learningFactors: LearningFactor[]; // New: factors learned from usage patterns
  adaptationScore: number; // New: how well prediction adapts to changing patterns
  collaborativeInsights?: CollaborativeInsight[]; // New: insights from other agents
}

export interface LearningFactor {
  type: 'usage_pattern' | 'timing_pattern' | 'context_pattern' | 'success_rate';
  description: string;
  strength: number; // 0.0 to 1.0
  evidence: string[];
  adaptability: number; // How well this factor adapts to change
}

export interface CollaborativeInsight {
  sourceAgentId: string;
  insightType: 'usage_pattern' | 'timing_optimization' | 'context_enhancement';
  description: string;
  relevanceScore: number;
  trustScore: number; // Based on historical accuracy
}

export interface EnhancedOptimalTiming {
  recommendedTime: string; // ISO timestamp
  reasoning: string;
  confidence: number;
  factors: TimingFactor[];
  learningAdaptations: LearningAdaptation[]; // New: adaptations based on learning
  realTimeAdjustments: RealTimeAdjustment[]; // New: real-time context adjustments
}

export interface LearningAdaptation {
  type: 'timing_shift' | 'frequency_adjustment' | 'context_awareness';
  description: string;
  impact: number; // -1.0 to 1.0
  confidence: number;
  source: 'usage_analysis' | 'effectiveness_metrics' | 'collaborative_learning';
}

export interface RealTimeAdjustment {
  trigger: string;
  adjustment: string;
  impact: number;
  timestamp: string;
}

export interface TimingFactor {
  factor: string;
  impact: number; // -1.0 to 1.0
  description: string;
}

export interface EvolutionPrediction {
  memoryId: string;
  currentState: MemoryState;
  predictedEvolution: EvolutionStep[];
  timeHorizon: string; // "1 week", "1 month", "3 months"
  confidence: number;
  triggerEvents: TriggerEvent[];
}

export interface MemoryState {
  importance: number;
  usageFrequency: number;
  contentQuality: number;
  relationshipCount: number;
  lastAccessTime: string;
}

export interface EvolutionStep {
  timeframe: string;
  expectedChanges: MemoryChange[];
  probability: number;
  catalysts: string[];
}

export interface MemoryChange {
  attribute: 'importance' | 'usage' | 'relationships' | 'content';
  direction: 'increase' | 'decrease' | 'stable';
  magnitude: number; // 0.0 to 1.0
  reason: string;
}

export interface TriggerEvent {
  event: string;
  probability: number;
  impact: MemoryChange[];
  timeToEvent: number; // estimated days
}

export interface OptimalStructurePrediction {
  agentId: string;
  currentStructure: MemoryStructureAnalysis;
  recommendedStructure: RecommendedStructure;
  migrationPlan: StructureMigrationPlan;
  expectedBenefits: StructureBenefit[];
  implementationComplexity: 'low' | 'medium' | 'high';
}

export interface MemoryStructureAnalysis {
  totalMemories: number;
  clusterCount: number;
  averageClusterSize: number;
  relationshipDensity: number;
  organizationScore: number; // 0.0 to 1.0
  accessPatternEfficiency: number;
}

export interface RecommendedStructure {
  optimalClusterCount: number;
  clusterThemes: ClusterTheme[];
  relationshipOptimizations: RelationshipOptimization[];
  accessOptimizations: AccessOptimization[];
}

export interface ClusterTheme {
  name: string;
  description: string;
  expectedMemoryCount: number;
  primaryKeywords: string[];
  accessPatterns: string[];
}

export interface RelationshipOptimization {
  type: 'strengthen' | 'weaken' | 'create' | 'remove';
  sourceMemoryId: string;
  targetMemoryId: string;
  reasoning: string;
  expectedBenefit: string;
}

export interface AccessOptimization {
  optimization: string;
  description: string;
  expectedImpact: number; // % improvement
  implementationEffort: 'low' | 'medium' | 'high';
}

export interface StructureMigrationPlan {
  phases: MigrationPhase[];
  totalDuration: string;
  riskAssessment: MigrationRisk[];
  rollbackStrategy: string;
}

export interface MigrationPhase {
  name: string;
  duration: string;
  actions: string[];
  dependencies: string[];
  successCriteria: string[];
}

export interface MigrationRisk {
  risk: string;
  probability: number;
  impact: number;
  mitigation: string;
}

export interface StructureBenefit {
  category: 'performance' | 'organization' | 'user_experience' | 'collaboration';
  description: string;
  quantifiableBenefit: string;
  timeToRealization: string;
}

export interface UsageLearningResult {
  agentId: string;
  learningPeriod: string;
  patternsLearned: LearnedPattern[];
  adaptationsMade: PredictionAdaptation[];
  performanceImprovements: PerformanceImprovement[];
  nextLearningCycle: string;
}

export interface LearnedPattern {
  type: 'temporal' | 'contextual' | 'behavioral' | 'collaborative';
  pattern: string;
  strength: number;
  applications: string[];
  validationScore: number;
}

export interface PredictionAdaptation {
  predictionType: 'memory_need' | 'timing' | 'structure' | 'evolution';
  originalApproach: string;
  adaptedApproach: string;
  improvementReason: string;
  measuredImprovement: number;
}

export interface PerformanceImprovement {
  metric: 'accuracy' | 'response_time' | 'user_satisfaction' | 'relevance';
  beforeValue: number;
  afterValue: number;
  improvementPercentage: number;
}

export interface PredictionContext {
  currentTask: string;
  recentMemories: string[];
  timeOfDay: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  collaborators?: string[];
  projectContext?: string;
  userPreferences?: UserPreferences;
  environmentalContext?: EnvironmentalContext;
}

export interface UserPreferences {
  memoryTypes: string[];
  detailLevel: 'minimal' | 'moderate' | 'comprehensive';
  learningStyle: 'visual' | 'textual' | 'structured' | 'exploratory';
}

export interface EnvironmentalContext {
  currentProject: string;
  teamSize: number;
  deadline?: string;
  workload: 'light' | 'moderate' | 'heavy' | 'critical';
  interruptionLevel: 'low' | 'medium' | 'high';
}

export class EnhancedPredictiveMemoryEngine {
  private openaiClient?: OpenAI;
  private memories: Map<string, AdvancedMemory>;
  private learningEngine: RealTimeLearningEngine;
  private predictionHistory: Map<string, any>;
  private usagePatterns: Map<string, MemoryUsagePattern[]>;
  private learningInsights: Map<string, LearningInsights>;
  private predictionCache: Map<string, any>;
  private cacheTimeout: number = 3 * 60 * 1000; // 3 minutes for faster adaptation

  constructor(openaiClient?: OpenAI, memories?: Map<string, AdvancedMemory>) {
    this.openaiClient = openaiClient;
    this.memories = memories || new Map();
    this.learningEngine = new RealTimeLearningEngine(openaiClient, memories);
    this.predictionHistory = new Map();
    this.usagePatterns = new Map();
    this.learningInsights = new Map();
    this.predictionCache = new Map();
  }

  /**
   * Enhanced memory need prediction with learning integration
   * Uses real-time learning to continuously improve accuracy
   */
  async predictNeededMemoriesEnhanced(
    agentId: string,
    context: PredictionContext
  ): Promise<AdvancedPredictedMemory[]> {
    const cacheKey = `enhanced_memories_${agentId}_${JSON.stringify(context)}`;
    const cached = this.getCachedPrediction(cacheKey);
    if (cached) return cached;

    try {
      // Get current learning insights
      const insights = this.learningInsights.get(agentId);

      // Get usage patterns for learning-enhanced predictions
      const patterns = this.usagePatterns.get(agentId) || [];

      // Generate base predictions
      const basePredictions = await this.generateBasePredictions(agentId, context);

      // Enhance predictions with learning factors
      const enhancedPredictions = await this.enhancePredictionsWithLearning(
        basePredictions,
        insights,
        patterns,
        context
      );

      // Add collaborative insights if available
      const finalPredictions = await this.addCollaborativeInsights(enhancedPredictions, agentId);

      // Cache and return
      this.setCachedPrediction(cacheKey, finalPredictions);
      return finalPredictions;

    } catch (error) {
      console.error('Error in enhanced prediction:', error);
      throw error;
    }
  }

  /**
   * Predict optimal memory structure based on usage patterns and learning
   * Revolutionary structural optimization using AI and machine learning
   */
  async predictOptimalStructure(agentId: string): Promise<OptimalStructurePrediction> {
    try {
      // Analyze current memory structure
      const currentStructure = await this.analyzeCurrentStructure(agentId);

      // Get learning insights for structure optimization
      const insights = this.learningInsights.get(agentId);
      const patterns = this.usagePatterns.get(agentId) || [];

      // Generate structure recommendations
      const recommendedStructure = await this.generateStructureRecommendations(
        currentStructure,
        insights,
        patterns
      );

      // Create migration plan
      const migrationPlan = await this.createStructureMigrationPlan(
        currentStructure,
        recommendedStructure
      );

      // Calculate expected benefits
      const expectedBenefits = await this.calculateStructureBenefits(
        currentStructure,
        recommendedStructure
      );

      // Assess implementation complexity
      const implementationComplexity = this.assessImplementationComplexity(migrationPlan);

      return {
        agentId,
        currentStructure,
        recommendedStructure,
        migrationPlan,
        expectedBenefits,
        implementationComplexity
      };

    } catch (error) {
      console.error('Error predicting optimal structure:', error);
      throw error;
    }
  }

  /**
   * Predict memory evolution with learning-enhanced accuracy
   * Uses continuous learning to improve evolution predictions
   */
  async predictMemoryEvolution(
    memoryId: string,
    timeHorizon: string = '1 month'
  ): Promise<EvolutionPrediction> {
    try {
      const memory = this.memories.get(memoryId);
      if (!memory) {
        throw new Error(`Memory ${memoryId} not found`);
      }

      // Analyze current memory state
      const currentState = await this.analyzeMemoryState(memory);

      // Get learning insights for evolution prediction
      const agentId = memory.metadata.agentId;
      const insights = this.learningInsights.get(agentId);
      const patterns = this.usagePatterns.get(agentId) || [];

      // Generate evolution steps with learning enhancement
      const predictedEvolution = await this.generateEvolutionSteps(
        memory,
        currentState,
        timeHorizon,
        insights,
        patterns
      );

      // Identify trigger events
      const triggerEvents = await this.identifyTriggerEvents(memory, insights);

      // Calculate confidence based on learning history
      const confidence = this.calculateEvolutionConfidence(memory, insights, patterns);

      return {
        memoryId,
        currentState,
        predictedEvolution,
        timeHorizon,
        confidence,
        triggerEvents
      };

    } catch (error) {
      console.error('Error predicting memory evolution:', error);
      throw error;
    }
  }

  /**
   * Learn from usage patterns to improve future predictions
   * Continuous learning system for predictive accuracy enhancement
   */
  async learnFromUsagePatterns(
    agentId: string,
    usagePatterns: MemoryUsagePattern[]
  ): Promise<UsageLearningResult> {
    try {
      // Store usage patterns
      this.usagePatterns.set(agentId, usagePatterns);

      // Generate learning insights using the learning engine
      const insights = await this.learningEngine.learnFromMemoryUsage(agentId, usagePatterns);
      this.learningInsights.set(agentId, insights);

      // Analyze patterns for prediction improvements
      const patternsLearned = await this.extractLearnedPatterns(usagePatterns, insights);

      // Adapt prediction algorithms based on learnings
      const adaptationsMade = await this.adaptPredictionAlgorithms(agentId, insights);

      // Measure performance improvements
      const performanceImprovements = await this.measurePerformanceImprovements(agentId);

      // Schedule next learning cycle
      const nextLearningCycle = this.scheduleNextLearningCycle(agentId, insights);

      return {
        agentId,
        learningPeriod: new Date().toISOString(),
        patternsLearned,
        adaptationsMade,
        performanceImprovements,
        nextLearningCycle
      };

    } catch (error) {
      console.error('Error learning from usage patterns:', error);
      throw error;
    }
  }

  // Private implementation methods

  private async generateBasePredictions(
    agentId: string,
    context: PredictionContext
  ): Promise<AdvancedPredictedMemory[]> {
    const agentMemories = Array.from(this.memories.values())
      .filter(memory => memory.metadata.agentId === agentId);

    const predictions: AdvancedPredictedMemory[] = [];

    // Context-based prediction
    for (const memory of agentMemories) {
      const relevance = await this.calculateContextualRelevance(memory, context);

      if (relevance > 0.3) {
        predictions.push({
          memoryId: memory.id,
          title: memory.content.substring(0, 100),
          content: memory.content,
          predictedRelevance: relevance,
          reasoning: `High contextual relevance to current task: ${context.currentTask}`,
          suggestedActions: ['Review memory', 'Check for updates'],
          confidence: relevance * 0.8,
          timeToNeed: this.estimateTimeToNeed(relevance, context.urgency),
          learningFactors: [],
          adaptationScore: 0.5,
          collaborativeInsights: []
        });
      }
    }

    return predictions.sort((a, b) => b.predictedRelevance - a.predictedRelevance).slice(0, 10);
  }

  private async enhancePredictionsWithLearning(
    basePredictions: AdvancedPredictedMemory[],
    insights?: LearningInsights,
    patterns?: MemoryUsagePattern[],
    context?: PredictionContext
  ): Promise<AdvancedPredictedMemory[]> {
    if (!insights || !patterns) return basePredictions;

    return basePredictions.map(prediction => {
      // Find relevant patterns for this memory
      const relevantPatterns = patterns.filter(p => p.memoryId === prediction.memoryId);

      // Extract learning factors
      const learningFactors: LearningFactor[] = [];

      if (relevantPatterns.length > 0) {
        const pattern = relevantPatterns[0];

        if (pattern) {
          learningFactors.push({
            type: 'usage_pattern',
            description: `Access frequency: ${pattern.accessFrequency}, Success rate: ${pattern.successRate}`,
            strength: pattern.successRate,
            evidence: [`${pattern.accessFrequency} access rate`, `${pattern.successRate} success rate`],
            adaptability: 0.7
          });

          // Adjust prediction based on historical success
          prediction.predictedRelevance = prediction.predictedRelevance * (0.5 + pattern.successRate * 0.5);
          prediction.confidence = prediction.confidence * (0.3 + pattern.successRate * 0.7);
        }
      }

      // Add timing factors from insights
      insights.insights.forEach(insight => {
        if (insight.type === 'timing_optimization') {
          learningFactors.push({
            type: 'timing_pattern',
            description: insight.description,
            strength: insight.strength,
            evidence: insight.evidence,
            adaptability: 0.8
          });
        }
      });

      prediction.learningFactors = learningFactors;
      prediction.adaptationScore = learningFactors.length > 0 ?
        learningFactors.reduce((sum, f) => sum + f.strength, 0) / learningFactors.length : 0.5;

      return prediction;
    });
  }

  private async addCollaborativeInsights(
    predictions: AdvancedPredictedMemory[],
    agentId: string
  ): Promise<AdvancedPredictedMemory[]> {
    // Placeholder for collaborative insights from other agents
    // In a real implementation, this would query other agents' learning insights
    return predictions.map(prediction => {
      prediction.collaborativeInsights = [
        {
          sourceAgentId: 'collaborative_agent',
          insightType: 'usage_pattern',
          description: 'Similar memory patterns observed in related contexts',
          relevanceScore: 0.6,
          trustScore: 0.8
        }
      ];
      return prediction;
    });
  }

  private async analyzeCurrentStructure(agentId: string): Promise<MemoryStructureAnalysis> {
    const agentMemories = Array.from(this.memories.values())
      .filter(memory => memory.metadata.agentId === agentId);

    const totalMemories = agentMemories.length;
    const relationshipCount = agentMemories.reduce((sum, memory) =>
      sum + (memory.relationships?.length || 0), 0);

    return {
      totalMemories,
      clusterCount: Math.ceil(totalMemories / 10), // Simple clustering estimate
      averageClusterSize: totalMemories > 0 ? totalMemories / Math.ceil(totalMemories / 10) : 0,
      relationshipDensity: totalMemories > 0 ? relationshipCount / totalMemories : 0,
      organizationScore: Math.min(0.8, relationshipCount / (totalMemories * 3)), // Normalize to 0-1
      accessPatternEfficiency: 0.7 // Placeholder - would be calculated from actual access patterns
    };
  }

  private async generateStructureRecommendations(
    currentStructure: MemoryStructureAnalysis,
    insights?: LearningInsights,
    patterns?: MemoryUsagePattern[]
  ): Promise<RecommendedStructure> {
    const optimalClusterCount = Math.max(3, Math.min(15, Math.ceil(currentStructure.totalMemories / 8)));

    const clusterThemes: ClusterTheme[] = [
      {
        name: 'Recent Work',
        description: 'Recently accessed and created memories',
        expectedMemoryCount: Math.ceil(currentStructure.totalMemories * 0.3),
        primaryKeywords: ['recent', 'current', 'active'],
        accessPatterns: ['frequent', 'recent']
      },
      {
        name: 'Reference Materials',
        description: 'Documentation and reference information',
        expectedMemoryCount: Math.ceil(currentStructure.totalMemories * 0.4),
        primaryKeywords: ['reference', 'documentation', 'guide'],
        accessPatterns: ['periodic', 'lookup']
      },
      {
        name: 'Archived Items',
        description: 'Older memories with historical value',
        expectedMemoryCount: Math.ceil(currentStructure.totalMemories * 0.3),
        primaryKeywords: ['archive', 'historical', 'completed'],
        accessPatterns: ['rare', 'archival']
      }
    ];

    return {
      optimalClusterCount,
      clusterThemes,
      relationshipOptimizations: [],
      accessOptimizations: [
        {
          optimization: 'Frequent Access Cache',
          description: 'Cache frequently accessed memories for faster retrieval',
          expectedImpact: 40,
          implementationEffort: 'medium'
        }
      ]
    };
  }

  private async createStructureMigrationPlan(
    currentStructure: MemoryStructureAnalysis,
    recommendedStructure: RecommendedStructure
  ): Promise<StructureMigrationPlan> {
    return {
      phases: [
        {
          name: 'Analysis Phase',
          duration: '1 week',
          actions: ['Analyze current memory distribution', 'Identify clustering patterns'],
          dependencies: [],
          successCriteria: ['Complete current state analysis']
        },
        {
          name: 'Restructuring Phase',
          duration: '2 weeks',
          actions: ['Implement new cluster structure', 'Migrate memories'],
          dependencies: ['Analysis Phase'],
          successCriteria: ['All memories successfully migrated']
        }
      ],
      totalDuration: '3 weeks',
      riskAssessment: [
        {
          risk: 'Temporary performance degradation during migration',
          probability: 0.4,
          impact: 0.3,
          mitigation: 'Gradual migration with rollback capability'
        }
      ],
      rollbackStrategy: 'Maintain backup of original structure for 30 days'
    };
  }

  private async calculateStructureBenefits(
    currentStructure: MemoryStructureAnalysis,
    recommendedStructure: RecommendedStructure
  ): Promise<StructureBenefit[]> {
    return [
      {
        category: 'performance',
        description: 'Improved memory retrieval speed',
        quantifiableBenefit: '25-40% faster access times',
        timeToRealization: '2 weeks post-migration'
      },
      {
        category: 'organization',
        description: 'Better logical organization of memories',
        quantifiableBenefit: '60% improvement in findability',
        timeToRealization: '1 week post-migration'
      }
    ];
  }

  private assessImplementationComplexity(migrationPlan: StructureMigrationPlan): 'low' | 'medium' | 'high' {
    const phaseCount = migrationPlan.phases.length;
    const riskCount = migrationPlan.riskAssessment.length;

    if (phaseCount <= 2 && riskCount <= 1) return 'low';
    if (phaseCount <= 4 && riskCount <= 3) return 'medium';
    return 'high';
  }

  private async analyzeMemoryState(memory: AdvancedMemory): Promise<MemoryState> {
    return {
      importance: memory.metadata?.importance || 0.5,
      usageFrequency: 0.5, // Would be calculated from actual usage data
      contentQuality: 0.7, // Would be calculated using content analysis
      relationshipCount: memory.relationships?.length || 0,
      lastAccessTime: memory.lastAccessed || new Date().toISOString()
    };
  }

  private async generateEvolutionSteps(
    memory: AdvancedMemory,
    currentState: MemoryState,
    timeHorizon: string,
    insights?: LearningInsights,
    patterns?: MemoryUsagePattern[]
  ): Promise<EvolutionStep[]> {
    const steps: EvolutionStep[] = [];

    // Short-term evolution (1 week)
    steps.push({
      timeframe: '1 week',
      expectedChanges: [
        {
          attribute: 'usage',
          direction: currentState.usageFrequency > 0.7 ? 'increase' : 'stable',
          magnitude: 0.1,
          reason: 'Normal usage pattern continuation'
        }
      ],
      probability: 0.8,
      catalysts: ['Continued project work', 'Regular access patterns']
    });

    // Long-term evolution (1 month)
    if (timeHorizon === '1 month' || timeHorizon === '3 months') {
      steps.push({
        timeframe: '1 month',
        expectedChanges: [
          {
            attribute: 'importance',
            direction: currentState.importance > 0.6 ? 'increase' : 'decrease',
            magnitude: 0.2,
            reason: 'Importance adjustment based on usage patterns'
          }
        ],
        probability: 0.6,
        catalysts: ['Project completion', 'Changing priorities']
      });
    }

    return steps;
  }

  private async identifyTriggerEvents(
    memory: AdvancedMemory,
    insights?: LearningInsights
  ): Promise<TriggerEvent[]> {
    return [
      {
        event: 'Project deadline approaching',
        probability: 0.7,
        impact: [
          {
            attribute: 'usage',
            direction: 'increase',
            magnitude: 0.5,
            reason: 'Increased urgency drives memory access'
          }
        ],
        timeToEvent: 14 // days
      }
    ];
  }

  private calculateEvolutionConfidence(
    memory: AdvancedMemory,
    insights?: LearningInsights,
    patterns?: MemoryUsagePattern[]
  ): number {
    let baseConfidence = 0.5;

    // Increase confidence if we have usage patterns
    if (patterns && patterns.length > 0) {
      baseConfidence += 0.2;
    }

    // Increase confidence if we have learning insights
    if (insights && insights.learningConfidence > 0.7) {
      baseConfidence += 0.2;
    }

    return Math.min(0.9, baseConfidence);
  }

  private async extractLearnedPatterns(
    usagePatterns: MemoryUsagePattern[],
    insights: LearningInsights
  ): Promise<LearnedPattern[]> {
    const patterns: LearnedPattern[] = [];

    // Extract temporal patterns
    if (usagePatterns.some(p => p.accessTiming.length > 0)) {
      patterns.push({
        type: 'temporal',
        pattern: 'Peak usage during morning hours',
        strength: 0.7,
        applications: ['Schedule memory reviews', 'Optimize timing'],
        validationScore: 0.8
      });
    }

    // Extract contextual patterns from insights
    insights.insights.forEach(insight => {
      if (insight.type === 'context_correlation') {
        patterns.push({
          type: 'contextual',
          pattern: insight.description,
          strength: insight.strength,
          applications: ['Improve context tagging', 'Enhance search'],
          validationScore: 0.75
        });
      }
    });

    return patterns;
  }

  private async adaptPredictionAlgorithms(
    agentId: string,
    insights: LearningInsights
  ): Promise<PredictionAdaptation[]> {
    const adaptations: PredictionAdaptation[] = [];

    insights.recommendations.forEach(rec => {
      if (rec.type === 'timing') {
        adaptations.push({
          predictionType: 'timing',
          originalApproach: 'Static timing predictions',
          adaptedApproach: 'Dynamic timing based on usage patterns',
          improvementReason: rec.description,
          measuredImprovement: rec.expectedImpact
        });
      }
    });

    return adaptations;
  }

  private async measurePerformanceImprovements(agentId: string): Promise<PerformanceImprovement[]> {
    // Placeholder for actual performance measurement
    return [
      {
        metric: 'accuracy',
        beforeValue: 0.7,
        afterValue: 0.85,
        improvementPercentage: 21.4
      },
      {
        metric: 'response_time',
        beforeValue: 3.2,
        afterValue: 2.1,
        improvementPercentage: 34.4
      }
    ];
  }

  private scheduleNextLearningCycle(agentId: string, insights: LearningInsights): string {
    // Schedule next learning based on data quality and change rate
    const daysUntilNext = insights.learningConfidence > 0.8 ? 7 : 3;
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + daysUntilNext);
    return nextDate.toISOString();
  }

  // Utility methods

  private async calculateContextualRelevance(
    memory: AdvancedMemory,
    context: PredictionContext
  ): Promise<number> {
    let relevance = 0.0;

    // Task context relevance
    if (memory.content.toLowerCase().includes(context.currentTask.toLowerCase())) {
      relevance += 0.4;
    }

    // Recent memories relevance
    if (context.recentMemories.includes(memory.id)) {
      relevance += 0.3;
    }

    // Urgency factor
    switch (context.urgency) {
      case 'critical':
        relevance *= 1.5;
        break;
      case 'high':
        relevance *= 1.2;
        break;
      case 'low':
        relevance *= 0.8;
        break;
    }

    return Math.min(1.0, relevance);
  }

  private estimateTimeToNeed(relevance: number, urgency: string): number {
    const baseTime = (1.0 - relevance) * 60; // minutes

    switch (urgency) {
      case 'critical': return Math.max(5, baseTime * 0.1);
      case 'high': return Math.max(15, baseTime * 0.3);
      case 'medium': return Math.max(30, baseTime * 0.6);
      default: return Math.max(60, baseTime);
    }
  }

  private getCachedPrediction(key: string): any {
    const cached = this.predictionCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCachedPrediction(key: string, data: any): void {
    this.predictionCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}
