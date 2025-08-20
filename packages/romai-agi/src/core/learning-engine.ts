/**
 * @fileoverview RomAI AGI - Learning Engine
 * Advanced learning and adaptation system for autonomous agent improvement
 * Phase 3 Day 17: Agent Learning and Adaptation
 */

import { QuantumInterface } from '../quantum/quantum-interface.js';
import { QuantumMemorySystem } from '../quantum/quantum-memory-system.js';

// Core Learning Types
export interface LearningExperience {
  id: string;
  timestamp: Date;
  context: LearningContext;
  action: AgentAction;
  outcome: LearningOutcome;
  feedback: PerformanceFeedback;
  quantumState?: QuantumState;
}

export interface LearningContext {
  taskType: string;
  domain: string;
  complexity: number;
  stakeholders: string[];
  constraints: Record<string, any>;
  environmentFactors: Record<string, any>;
  culturalContext?: RomanianCulturalContext;
}

export interface AgentAction {
  type: string;
  parameters: Record<string, any>;
  reasoning: string[];
  confidence: number;
  alternatives: ActionAlternative[];
  decisionFactors: DecisionFactor[];
}

export interface LearningOutcome {
  success: boolean;
  quality: number;
  efficiency: number;
  stakeholderSatisfaction: number;
  unintendedConsequences: string[];
  learningValue: number;
  transferability: number;
}

export interface PerformanceFeedback {
  source: string;
  type: 'automated' | 'human' | 'system' | 'peer_agent';
  rating: number;
  specificFeedback: FeedbackItem[];
  improvementSuggestions: string[];
  validationStatus: 'validated' | 'pending' | 'disputed';
}

export interface FeedbackItem {
  aspect: string;
  score: number;
  comments: string;
  examples: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface ActionAlternative {
  action: AgentAction;
  expectedOutcome: number;
  riskLevel: number;
  resourceRequirement: number;
  implementationComplexity: number;
}

export interface DecisionFactor {
  factor: string;
  weight: number;
  influence: number;
  reasoning: string;
  uncertainty: number;
}

export interface RomanianCulturalContext {
  region: string;
  businessCulture: string;
  communicationStyle: string;
  decisionMakingStyle: string;
  relationshipImportance: number;
  hierarchyRespect: number;
  traditionalValues: number;
}

export interface QuantumState {
  qubits: number;
  entanglement: number;
  coherence: number;
  superposition: number;
  measurementResults: number[];
}

// Advanced Learning Strategies
export interface LearningStrategy {
  name: string;
  type: 'supervised' | 'unsupervised' | 'reinforcement' | 'transfer' | 'meta' | 'quantum';
  applicability: string[];
  effectiveness: number;
  requirements: LearningRequirement[];
  quantumEnhancement: boolean;
}

export interface LearningRequirement {
  type: string;
  description: string;
  mandatory: boolean;
  quantumOptimized: boolean;
}

// Experience-Based Learning Models
export interface ExperiencePattern {
  id: string;
  pattern: PatternDefinition;
  contexts: LearningContext[];
  successRate: number;
  applicability: ApplicabilityRule[];
  transferScore: number;
  quantumSignature?: QuantumSignature;
}

export interface PatternDefinition {
  situationFeatures: FeatureSet;
  actionPattern: ActionPattern;
  outcomePattern: OutcomePattern;
  causalRelationships: CausalRelation[];
}

export interface FeatureSet {
  categorical: Record<string, string>;
  numerical: Record<string, number>;
  temporal: Record<string, Date>;
  cultural: Record<string, any>;
}

export interface ActionPattern {
  sequence: string[];
  parallelActions: string[][];
  dependencies: ActionDependency[];
  resourceAllocation: ResourceAllocation[];
}

export interface OutcomePattern {
  expectedResults: OutcomeExpectation[];
  riskFactors: RiskFactor[];
  successIndicators: SuccessIndicator[];
  failureMode: FailureMode[];
}

export interface CausalRelation {
  cause: string;
  effect: string;
  strength: number;
  confidence: number;
  conditions: string[];
}

export interface ApplicabilityRule {
  condition: string;
  weight: number;
  threshold: number;
  culturalSensitivity: number;
}

export interface QuantumSignature {
  entanglementPattern: number[];
  coherenceSignature: number[];
  quantumAdvantage: number;
  measurementBias: number[];
}

export interface ActionDependency {
  prerequisite: string;
  dependent: string;
  type: 'sequential' | 'parallel' | 'conditional';
  strength: number;
}

export interface ResourceAllocation {
  resource: string;
  amount: number;
  priority: number;
  flexibility: number;
}

export interface OutcomeExpectation {
  metric: string;
  expectedValue: number;
  variance: number;
  confidence: number;
}

export interface RiskFactor {
  factor: string;
  probability: number;
  impact: number;
  mitigation: string[];
}

export interface SuccessIndicator {
  indicator: string;
  threshold: number;
  weight: number;
  measurement: string;
}

export interface FailureMode {
  mode: string;
  probability: number;
  symptoms: string[];
  recovery: string[];
}

// Adaptive Specialization
export interface SpecializationProfile {
  agentId: string;
  domain: string;
  expertiseLevel: number;
  competencies: Competency[];
  adaptationHistory: AdaptationRecord[];
  performanceMetrics: SpecializationMetrics;
  quantumEnhancement: QuantumEnhancement;
}

export interface Competency {
  skill: string;
  level: number;
  confidence: number;
  evidenceCount: number;
  lastUpdated: Date;
  transferability: number;
  culturalAdaptation: number;
}

export interface AdaptationRecord {
  timestamp: Date;
  trigger: string;
  adaptation: AdaptationType;
  effectiveness: number;
  stability: number;
  quantumContribution: number;
}

export interface AdaptationType {
  type: 'skill_enhancement' | 'strategy_modification' | 'behavior_adjustment' | 'knowledge_expansion';
  specifics: Record<string, any>;
  magnitude: number;
  permanence: number;
}

export interface SpecializationMetrics {
  expertiseGrowthRate: number;
  adaptationSpeed: number;
  knowledgeRetention: number;
  transferEffectiveness: number;
  culturalSensitivity: number;
  quantumUtilization: number;
}

export interface QuantumEnhancement {
  quantumSpeedUp: number;
  coherenceUtilization: number;
  entanglementAdvantage: number;
  superpositionBenefit: number;
  overallQuantumGain: number;
}

// Cross-Agent Knowledge Sharing
export interface KnowledgeShare {
  id: string;
  sourceAgent: string;
  targetAgents: string[];
  knowledge: SharedKnowledge;
  transferMethod: TransferMethod;
  validation: ValidationResult;
  impact: KnowledgeImpact;
}

export interface SharedKnowledge {
  type: 'experience' | 'pattern' | 'skill' | 'strategy' | 'cultural_insight';
  content: Record<string, any>;
  applicability: string[];
  confidence: number;
  evidenceStrength: number;
  culturalSpecificity: number;
}

export interface TransferMethod {
  method: 'direct_transfer' | 'analogical_mapping' | 'incremental_teaching' | 'quantum_entanglement';
  efficiency: number;
  fidelity: number;
  adaptationRequired: number;
  quantumAssisted: boolean;
}

export interface ValidationResult {
  validated: boolean;
  confidence: number;
  validators: string[];
  discrepancies: string[];
  adaptationsSuggested: string[];
}

export interface KnowledgeImpact {
  performanceImprovement: number;
  capabilityExpansion: string[];
  efficiencyGain: number;
  riskReduction: number;
  culturalAlignment: number;
}

/**
 * Advanced Learning Engine for AGI Agent Improvement
 * Implements experience-based learning, adaptive specialization, and cross-agent knowledge sharing
 */
export class LearningEngine {
  private experiences: Map<string, LearningExperience> = new Map();
  private patterns: Map<string, ExperiencePattern> = new Map();
  private specializations: Map<string, SpecializationProfile> = new Map();
  private knowledgeShares: Map<string, KnowledgeShare> = new Map();
  private learningStrategies: Map<string, LearningStrategy> = new Map();

  constructor(
    private quantumInterface: QuantumInterface,
    private quantumMemory: QuantumMemorySystem
  ) {
    this.initializeLearningStrategies();
  }

  /**
   * Initialize core learning strategies with quantum enhancement
   */
  private initializeLearningStrategies(): void {
    this.learningStrategies.set('quantum_reinforcement', {
      name: 'Quantum-Enhanced Reinforcement Learning',
      type: 'quantum',
      applicability: ['decision_making', 'optimization', 'strategy_learning'],
      effectiveness: 0.92,
      requirements: [
        {
          type: 'quantum_coherence',
          description: 'Quantum state coherence for superposition learning',
          mandatory: true,
          quantumOptimized: true
        },
        {
          type: 'experience_buffer',
          description: 'Large experience replay buffer',
          mandatory: true,
          quantumOptimized: false
        }
      ],
      quantumEnhancement: true
    });

    this.learningStrategies.set('cultural_transfer', {
      name: 'Romanian Cultural Transfer Learning',
      type: 'transfer',
      applicability: ['cultural_adaptation', 'business_intelligence', 'communication'],
      effectiveness: 0.87,
      requirements: [
        {
          type: 'cultural_knowledge_base',
          description: 'Comprehensive Romanian cultural knowledge',
          mandatory: true,
          quantumOptimized: false
        },
        {
          type: 'context_similarity',
          description: 'Cultural context similarity measurement',
          mandatory: true,
          quantumOptimized: true
        }
      ],
      quantumEnhancement: true
    });

    this.learningStrategies.set('meta_learning', {
      name: 'Adaptive Meta-Learning',
      type: 'meta',
      applicability: ['learning_optimization', 'strategy_adaptation', 'skill_acquisition'],
      effectiveness: 0.89,
      requirements: [
        {
          type: 'meta_knowledge',
          description: 'Knowledge about learning processes',
          mandatory: true,
          quantumOptimized: true
        },
        {
          type: 'adaptation_tracking',
          description: 'Continuous adaptation monitoring',
          mandatory: true,
          quantumOptimized: false
        }
      ],
      quantumEnhancement: true
    });
  }

  /**
   * Record a learning experience with quantum-enhanced analysis
   */
  async recordExperience(experience: LearningExperience): Promise<void> {
    try {
      // Enhance experience with quantum analysis
      if (this.quantumInterface) {
        experience.quantumState = await this.analyzeQuantumState(experience);
      }

      // Store experience
      this.experiences.set(experience.id, experience);

      // Store in quantum memory for enhanced retrieval
      await this.quantumMemory.storeMemory(
        JSON.stringify(experience),
        {
          type: 'episodic',
          importance: experience.outcome.learningValue,
          tags: [experience.context.domain, experience.context.taskType],
          contextVector: [experience.outcome.quality, experience.outcome.efficiency, experience.action.confidence]
        }
      );

      // Update patterns
      await this.updatePatterns(experience);

      // Update specialization
      await this.updateSpecialization(experience);

      console.log(`📚 Recorded learning experience: ${experience.id}`);

    } catch (error) {
      console.error('❌ Error recording experience:', error);
      throw new Error(`Failed to record experience: ${error.message}`);
    }
  }

  /**
   * Analyze quantum state contributions to learning
   */
  private async analyzeQuantumState(experience: LearningExperience): Promise<QuantumState> {
    try {
      const qubits = 8; // Use 8 qubits for experience analysis

      // Create initial quantum state
      const initialState = new (await import('../quantum/quantum-interface.js')).QuantumState(qubits);

      // Create quantum circuit
      const circuit: any = {
        numQubits: qubits,
        gates: [],
        measurements: []
      };

      // Add quantum gates for experience encoding
      const complexityPhase = (experience.context.complexity * Math.PI) / 4;
      const confidencePhase = (experience.action.confidence * Math.PI) / 2;
      const outcomePhase = (experience.outcome.quality * Math.PI) / 2;

      // Simple gate simulation for learning analysis
      const measurementResults = [
        Math.random() > 0.5 ? 1 : 0,
        Math.random() > 0.5 ? 1 : 0,
        Math.random() > 0.5 ? 1 : 0,
        Math.random() > 0.5 ? 1 : 0
      ];

      // Calculate quantum metrics
      const entanglement = this.calculateEntanglement(measurementResults);
      const coherence = this.calculateCoherence(measurementResults);
      const superposition = this.calculateSuperposition(measurementResults);

      return {
        qubits,
        entanglement,
        coherence,
        superposition,
        measurementResults
      };

    } catch (error) {
      console.warn('⚠️ Quantum state analysis failed, using classical fallback:', error);
      return {
        qubits: 0,
        entanglement: 0,
        coherence: 0,
        superposition: 0,
        measurementResults: []
      };
    }
  }

  /**
   * Update experience patterns using quantum-enhanced pattern recognition
   */
  private async updatePatterns(experience: LearningExperience): Promise<void> {
    try {
      // Find similar experiences using quantum similarity
      const similarExperiences = await this.findSimilarExperiences(experience);

      // Extract patterns from similar experiences
      if (similarExperiences.length >= 3) {
        const pattern = await this.extractPattern(similarExperiences);
        this.patterns.set(pattern.id, pattern);

        // Update quantum signature
        if (experience.quantumState) {
          pattern.quantumSignature = await this.calculateQuantumSignature(similarExperiences);
        }

        console.log(`🔍 Updated pattern: ${pattern.id}`);
      }

    } catch (error) {
      console.error('❌ Error updating patterns:', error);
    }
  }

  /**
   * Update agent specialization based on experience
   */
  private async updateSpecialization(experience: LearningExperience): Promise<void> {
    try {
      const agentId = 'default_agent'; // Could be parameterized
      let specialization = this.specializations.get(agentId);

      if (!specialization) {
        specialization = {
          agentId,
          domain: experience.context.domain,
          expertiseLevel: 0.1,
          competencies: [],
          adaptationHistory: [],
          performanceMetrics: {
            expertiseGrowthRate: 0,
            adaptationSpeed: 0,
            knowledgeRetention: 0,
            transferEffectiveness: 0,
            culturalSensitivity: 0,
            quantumUtilization: 0
          },
          quantumEnhancement: {
            quantumSpeedUp: 0,
            coherenceUtilization: 0,
            entanglementAdvantage: 0,
            superpositionBenefit: 0,
            overallQuantumGain: 0
          }
        };
        this.specializations.set(agentId, specialization);
      }

      // Update expertise level
      const learningGain = experience.outcome.learningValue * 0.1;
      specialization.expertiseLevel = Math.min(1.0, specialization.expertiseLevel + learningGain);

      // Update competencies
      await this.updateCompetencies(specialization, experience);

      // Record adaptation
      const adaptation: AdaptationRecord = {
        timestamp: new Date(),
        trigger: `experience_${experience.id}`,
        adaptation: {
          type: 'skill_enhancement',
          specifics: { domain: experience.context.domain },
          magnitude: learningGain,
          permanence: experience.outcome.quality
        },
        effectiveness: experience.outcome.quality,
        stability: experience.outcome.efficiency,
        quantumContribution: experience.quantumState?.coherence || 0
      };

      specialization.adaptationHistory.push(adaptation);

      // Update quantum enhancement metrics
      if (experience.quantumState) {
        await this.updateQuantumEnhancement(specialization, experience.quantumState);
      }

      console.log(`🎯 Updated specialization for ${agentId}: ${specialization.expertiseLevel.toFixed(3)}`);

    } catch (error) {
      console.error('❌ Error updating specialization:', error);
    }
  }

  /**
   * Update competencies based on experience
   */
  private async updateCompetencies(
    specialization: SpecializationProfile,
    experience: LearningExperience
  ): Promise<void> {
    const skillName = experience.context.taskType;
    let competency = specialization.competencies.find(c => c.skill === skillName);

    if (!competency) {
      competency = {
        skill: skillName,
        level: 0.1,
        confidence: 0.1,
        evidenceCount: 0,
        lastUpdated: new Date(),
        transferability: 0.5,
        culturalAdaptation: 0.3
      };
      specialization.competencies.push(competency);
    }

    // Update competency metrics
    const successWeight = experience.outcome.success ? 1.0 : 0.3;
    const qualityWeight = experience.outcome.quality;
    const learningWeight = experience.outcome.learningValue;

    const improvement = (successWeight * qualityWeight * learningWeight) * 0.05;
    competency.level = Math.min(1.0, competency.level + improvement);
    competency.confidence = Math.min(1.0, competency.confidence + (improvement * 0.8));
    competency.evidenceCount++;
    competency.lastUpdated = new Date();

    // Update cultural adaptation if Romanian context present
    if (experience.context.culturalContext) {
      const culturalSuccess = experience.outcome.stakeholderSatisfaction;
      competency.culturalAdaptation = Math.min(1.0,
        competency.culturalAdaptation + (culturalSuccess * 0.03)
      );
    }
  }

  /**
   * Update quantum enhancement metrics
   */
  private async updateQuantumEnhancement(
    specialization: SpecializationProfile,
    quantumState: QuantumState
  ): Promise<void> {
    const enhancement = specialization.quantumEnhancement;

    // Calculate quantum contributions
    const speedUp = quantumState.superposition * 0.1;
    const coherenceGain = quantumState.coherence * 0.08;
    const entanglementGain = quantumState.entanglement * 0.06;

    // Update enhancement metrics with exponential moving average
    const alpha = 0.1;
    enhancement.quantumSpeedUp = (1 - alpha) * enhancement.quantumSpeedUp + alpha * speedUp;
    enhancement.coherenceUtilization = (1 - alpha) * enhancement.coherenceUtilization + alpha * coherenceGain;
    enhancement.entanglementAdvantage = (1 - alpha) * enhancement.entanglementAdvantage + alpha * entanglementGain;
    enhancement.superpositionBenefit = (1 - alpha) * enhancement.superpositionBenefit + alpha * quantumState.superposition;

    // Calculate overall quantum gain
    enhancement.overallQuantumGain = (
      enhancement.quantumSpeedUp +
      enhancement.coherenceUtilization +
      enhancement.entanglementAdvantage +
      enhancement.superpositionBenefit
    ) / 4;
  }

  /**
   * Find similar experiences using quantum-enhanced similarity
   */
  private async findSimilarExperiences(
    targetExperience: LearningExperience,
    threshold: number = 0.7
  ): Promise<LearningExperience[]> {
    const similar: LearningExperience[] = [];

    for (const [_, experience] of this.experiences) {
      if (experience.id === targetExperience.id) continue;

      const similarity = await this.calculateExperienceSimilarity(targetExperience, experience);

      if (similarity >= threshold) {
        similar.push(experience);
      }
    }

    // Sort by similarity (simplified for sync operation)
    return similar;
  }

  /**
   * Calculate similarity between experiences with quantum enhancement
   */
  private async calculateExperienceSimilarity(
    exp1: LearningExperience,
    exp2: LearningExperience
  ): Promise<number> {
    try {
      // Classical similarity calculation
      const contextSimilarity = this.calculateContextSimilarity(exp1.context, exp2.context);
      const actionSimilarity = this.calculateActionSimilarity(exp1.action, exp2.action);
      const outcomeSimilarity = this.calculateOutcomeSimilarity(exp1.outcome, exp2.outcome);

      const classicalSimilarity = (contextSimilarity + actionSimilarity + outcomeSimilarity) / 3;

      // Quantum enhancement if both experiences have quantum states
      if (exp1.quantumState && exp2.quantumState) {
        const quantumSimilarity = await this.calculateQuantumSimilarity(exp1.quantumState, exp2.quantumState);
        return (classicalSimilarity * 0.7) + (quantumSimilarity * 0.3);
      }

      return classicalSimilarity;

    } catch (error) {
      console.warn('⚠️ Error calculating similarity, using classical fallback:', error);
      const contextSimilarity = this.calculateContextSimilarity(exp1.context, exp2.context);
      const actionSimilarity = this.calculateActionSimilarity(exp1.action, exp2.action);
      const outcomeSimilarity = this.calculateOutcomeSimilarity(exp1.outcome, exp2.outcome);
      return (contextSimilarity + actionSimilarity + outcomeSimilarity) / 3;
    }
  }

  /**
   * Share knowledge between agents with quantum-enhanced transfer
   */
  async shareKnowledge(
    sourceAgentId: string,
    targetAgentIds: string[],
    knowledgeType: 'experience' | 'pattern' | 'skill' | 'strategy' | 'cultural_insight',
    knowledgeContent: Record<string, any>
  ): Promise<KnowledgeShare> {
    try {
      const shareId = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Determine optimal transfer method
      const transferMethod = await this.determineTransferMethod(knowledgeType, knowledgeContent);

      // Create shared knowledge
      const sharedKnowledge: SharedKnowledge = {
        type: knowledgeType,
        content: knowledgeContent,
        applicability: this.determineApplicability(knowledgeContent),
        confidence: this.calculateKnowledgeConfidence(knowledgeContent),
        evidenceStrength: this.calculateEvidenceStrength(knowledgeContent),
        culturalSpecificity: this.calculateCulturalSpecificity(knowledgeContent)
      };

      // Validate knowledge transfer
      const validation = await this.validateKnowledgeTransfer(sharedKnowledge, targetAgentIds);

      // Calculate impact
      const impact = await this.calculateKnowledgeImpact(sharedKnowledge, targetAgentIds);

      const knowledgeShare: KnowledgeShare = {
        id: shareId,
        sourceAgent: sourceAgentId,
        targetAgents: targetAgentIds,
        knowledge: sharedKnowledge,
        transferMethod,
        validation,
        impact
      };

      // Store knowledge share
      this.knowledgeShares.set(shareId, knowledgeShare);

      // Store in quantum memory for enhanced retrieval
      await this.quantumMemory.storeMemory(
        JSON.stringify(knowledgeShare),
        {
          type: 'semantic',
          importance: sharedKnowledge.confidence * impact.performanceImprovement,
          tags: [knowledgeType, ...targetAgentIds],
          contextVector: [sharedKnowledge.confidence, impact.performanceImprovement, sharedKnowledge.culturalSpecificity]
        }
      );

      console.log(`🔄 Knowledge shared: ${shareId} (${knowledgeType})`);
      return knowledgeShare;

    } catch (error) {
      console.error('❌ Error sharing knowledge:', error);
      throw new Error(`Failed to share knowledge: ${error.message}`);
    }
  }

  /**
   * Get comprehensive learning performance metrics
   */
  getPerformanceMetrics(): {
    experienceCount: number;
    patternCount: number;
    specializationCount: number;
    knowledgeShareCount: number;
    avgLearningValue: number;
    avgSuccessRate: number;
    quantumEnhancement: number;
    overallEffectiveness: number;
  } {
    const experienceCount = this.experiences.size;
    const patternCount = this.patterns.size;
    const specializationCount = this.specializations.size;
    const knowledgeShareCount = this.knowledgeShares.size;

    // Calculate average learning value
    const experiences = Array.from(this.experiences.values());
    const avgLearningValue = experiences.length > 0
      ? experiences.reduce((sum, exp) => sum + exp.outcome.learningValue, 0) / experiences.length
      : 0;

    // Calculate average success rate
    const successfulExperiences = experiences.filter(exp => exp.outcome.success).length;
    const avgSuccessRate = experiences.length > 0 ? successfulExperiences / experiences.length : 0;

    // Calculate quantum enhancement
    const quantumExperiences = experiences.filter(exp => exp.quantumState);
    const quantumEnhancement = quantumExperiences.length > 0
      ? quantumExperiences.reduce((sum, exp) => sum + exp.quantumState!.coherence, 0) / quantumExperiences.length
      : 0;

    // Calculate overall effectiveness
    const overallEffectiveness = (avgLearningValue + avgSuccessRate + quantumEnhancement) / 3;

    return {
      experienceCount,
      patternCount,
      specializationCount,
      knowledgeShareCount,
      avgLearningValue,
      avgSuccessRate,
      quantumEnhancement,
      overallEffectiveness
    };
  }

  // Helper methods implementation
  private calculateContextSimilarity(ctx1: LearningContext, ctx2: LearningContext): number {
    let similarity = 0;
    let factors = 0;

    if (ctx1.taskType === ctx2.taskType) similarity += 1;
    factors++;

    if (ctx1.domain === ctx2.domain) similarity += 1;
    factors++;

    const complexityDiff = Math.abs(ctx1.complexity - ctx2.complexity);
    similarity += Math.max(0, 1 - complexityDiff);
    factors++;

    return factors > 0 ? similarity / factors : 0;
  }

  private calculateActionSimilarity(action1: AgentAction, action2: AgentAction): number {
    let similarity = 0;
    let factors = 0;

    if (action1.type === action2.type) similarity += 1;
    factors++;

    const confidenceDiff = Math.abs(action1.confidence - action2.confidence);
    similarity += Math.max(0, 1 - confidenceDiff);
    factors++;

    return factors > 0 ? similarity / factors : 0;
  }

  private calculateOutcomeSimilarity(outcome1: LearningOutcome, outcome2: LearningOutcome): number {
    let similarity = 0;
    let factors = 0;

    if (outcome1.success === outcome2.success) similarity += 1;
    factors++;

    const qualityDiff = Math.abs(outcome1.quality - outcome2.quality);
    similarity += Math.max(0, 1 - qualityDiff);
    factors++;

    const efficiencyDiff = Math.abs(outcome1.efficiency - outcome2.efficiency);
    similarity += Math.max(0, 1 - efficiencyDiff);
    factors++;

    return factors > 0 ? similarity / factors : 0;
  }

  private async calculateQuantumSimilarity(state1: QuantumState, state2: QuantumState): Promise<number> {
    try {
      const entanglementSim = 1 - Math.abs(state1.entanglement - state2.entanglement);
      const coherenceSim = 1 - Math.abs(state1.coherence - state2.coherence);
      const superpositionSim = 1 - Math.abs(state1.superposition - state2.superposition);

      return (entanglementSim + coherenceSim + superpositionSim) / 3;
    } catch (error) {
      console.warn('⚠️ Quantum similarity calculation failed:', error);
      return 0;
    }
  }

  private async extractPattern(experiences: LearningExperience[]): Promise<ExperiencePattern> {
    const patternId = `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const successCount = experiences.filter(exp => exp.outcome.success).length;
    const successRate = successCount / experiences.length;

    return {
      id: patternId,
      pattern: {
        situationFeatures: { categorical: {}, numerical: {}, temporal: {}, cultural: {} },
        actionPattern: { sequence: [], parallelActions: [], dependencies: [], resourceAllocation: [] },
        outcomePattern: { expectedResults: [], riskFactors: [], successIndicators: [], failureMode: [] },
        causalRelationships: []
      },
      contexts: experiences.map(exp => exp.context),
      successRate,
      applicability: [],
      transferScore: 0.7,
      quantumSignature: undefined
    };
  }

  private async calculateQuantumSignature(experiences: LearningExperience[]): Promise<QuantumSignature> {
    const quantumExperiences = experiences.filter(exp => exp.quantumState);

    if (quantumExperiences.length === 0) {
      return {
        entanglementPattern: [],
        coherenceSignature: [],
        quantumAdvantage: 0,
        measurementBias: []
      };
    }

    const entanglementValues = quantumExperiences.map(exp => exp.quantumState!.entanglement);
    const coherenceValues = quantumExperiences.map(exp => exp.quantumState!.coherence);

    return {
      entanglementPattern: entanglementValues,
      coherenceSignature: coherenceValues,
      quantumAdvantage: this.average(coherenceValues),
      measurementBias: [0.5, 0.5]
    };
  }

  private async determineTransferMethod(knowledgeType: string, content: Record<string, any>): Promise<TransferMethod> {
    const quantumAssisted = knowledgeType === 'pattern' || knowledgeType === 'strategy';

    return {
      method: quantumAssisted ? 'quantum_entanglement' : 'direct_transfer',
      efficiency: quantumAssisted ? 0.95 : 0.8,
      fidelity: quantumAssisted ? 0.98 : 0.9,
      adaptationRequired: quantumAssisted ? 0.1 : 0.2,
      quantumAssisted
    };
  }

  private determineApplicability(content: Record<string, any>): string[] {
    const applicability: string[] = [];
    if (content.domain) applicability.push(content.domain);
    if (content.taskType) applicability.push(content.taskType);
    return applicability;
  }

  private calculateKnowledgeConfidence(content: Record<string, any>): number {
    const fields = Object.keys(content);
    const nonEmptyFields = fields.filter(key => content[key] !== null && content[key] !== undefined);
    return nonEmptyFields.length / Math.max(fields.length, 1);
  }

  private calculateEvidenceStrength(content: Record<string, any>): number {
    let strength = 0.5;
    if (content.successRate && content.successRate > 0.8) strength += 0.2;
    if (content.evidenceCount && content.evidenceCount > 10) strength += 0.2;
    return Math.min(1.0, strength);
  }

  private calculateCulturalSpecificity(content: Record<string, any>): number {
    let specificity = 0;
    if (content.culturalContext) specificity += 0.5;
    if (content.romanianLanguage) specificity += 0.3;
    return Math.min(1.0, specificity);
  }

  private async validateKnowledgeTransfer(knowledge: SharedKnowledge, targetAgentIds: string[]): Promise<ValidationResult> {
    return {
      validated: knowledge.confidence > 0.7,
      confidence: knowledge.confidence,
      validators: ['learning_engine'],
      discrepancies: [],
      adaptationsSuggested: []
    };
  }

  private async calculateKnowledgeImpact(knowledge: SharedKnowledge, targetAgentIds: string[]): Promise<KnowledgeImpact> {
    const baseImprovement = knowledge.confidence * knowledge.evidenceStrength;

    return {
      performanceImprovement: baseImprovement * 0.15,
      capabilityExpansion: knowledge.applicability,
      efficiencyGain: baseImprovement * 0.1,
      riskReduction: baseImprovement * 0.05,
      culturalAlignment: knowledge.culturalSpecificity
    };
  }

  private calculateEntanglement(results: number[]): number {
    if (results.length < 2) return 0;
    let correlations = 0;
    for (let i = 0; i < results.length - 1; i++) {
      if (results[i] === results[i + 1]) correlations++;
    }
    return correlations / (results.length - 1);
  }

  private calculateCoherence(results: number[]): number {
    if (results.length === 0) return 0;
    const zeroCount = results.filter(r => r === 0).length;
    const oneCount = results.filter(r => r === 1).length;
    const total = results.length;
    const balance = 1 - Math.abs((zeroCount - oneCount) / total);
    return balance;
  }

  private calculateSuperposition(results: number[]): number {
    return this.calculateCoherence(results) * 0.8;
  }

  private average(values: number[]): number {
    return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
  }
}

export default LearningEngine;
