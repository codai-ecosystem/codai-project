/**
 * Phase 3: AI-Powered Memory Intelligence - Predictive Memory Engine
 * 
 * Revolutionary predictive capabilities that set new industry standards:
 * - Predicts what memories users will need before they search
 * - Optimizes memory creation timing
 * - Forecasts relationship formation and importance evolution
 * - Provides proactive memory management suggestions
 */

import OpenAI from 'openai';
import { AdvancedMemory } from './server.js';

// Core prediction interfaces
export interface PredictedMemory {
  memoryId: string;
  title: string;
  content: string;
  predictedRelevance: number; // 0.0 to 1.0
  reasoning: string;
  suggestedActions: string[];
  confidence: number;
  timeToNeed: number; // minutes until predicted need
}

export interface OptimalTiming {
  recommendedTime: string; // ISO timestamp
  reasoning: string;
  confidence: number;
  factors: TimingFactor[];
}

export interface TimingFactor {
  factor: string;
  impact: number; // -1.0 to 1.0
  description: string;
}

export interface PredictedRelationship {
  sourceMemoryId: string;
  targetMemoryId: string;
  relationshipType: 'related' | 'references' | 'follows' | 'contradicts' | 'updates' | 'similar' | 'contains' | 'explains';
  strength: number;
  formationProbability: number;
  timeToFormation: number; // estimated days
  reasoning: string;
}

export interface ImportanceForecast {
  memoryId: string;
  currentImportance: number;
  predictedImportance: number[];
  timePoints: string[]; // ISO timestamps
  trendDirection: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  confidenceInterval: { min: number; max: number }[];
  factors: ImportanceDriver[];
}

export interface ImportanceDriver {
  factor: string;
  impact: number;
  description: string;
  confidence: number;
}

export interface PredictionContext {
  currentTask?: string;
  timeOfDay: string;
  recentActivity: Activity[];
  upcomingEvents: Event[];
  workingMemory: string[]; // Recently accessed memories
  userBehaviorPattern?: UserPattern;
  environmentalFactors?: EnvironmentalContext;
}

export interface Activity {
  type: 'search' | 'create' | 'update' | 'link' | 'view';
  timestamp: string;
  memoryIds: string[];
  query?: string;
  success: boolean;
  duration: number; // milliseconds
}

export interface Event {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  participants?: string[];
  relatedMemories?: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface UserPattern {
  peakHours: string[];
  preferredMemoryTypes: string[];
  searchPatterns: string[];
  collaborationStyle: 'individual' | 'team' | 'mixed';
  learningStyle: 'visual' | 'textual' | 'structured' | 'exploratory';
}

export interface EnvironmentalContext {
  currentProject: string;
  teamSize: number;
  deadline?: string;
  workload: 'light' | 'moderate' | 'heavy' | 'critical';
  interruptionLevel: 'low' | 'medium' | 'high';
}

export interface PredictionHistory {
  predictionId: string;
  timestamp: string;
  type: 'memory_need' | 'timing' | 'relationship' | 'importance';
  prediction: any;
  actualOutcome?: any;
  accuracy?: number;
  feedback?: string;
}

export class PredictiveMemoryEngine {
  private openaiClient?: OpenAI;
  private memories: Map<string, AdvancedMemory>;
  private predictionHistory: Map<string, PredictionHistory>;
  private userPatterns: Map<string, UserPattern>;
  private predictionCache: Map<string, any>;
  private cacheTimeout: number = 5 * 60 * 1000; // 5 minutes

  constructor(openaiClient?: OpenAI, memories?: Map<string, AdvancedMemory>) {
    this.openaiClient = openaiClient;
    this.memories = memories || new Map();
    this.predictionHistory = new Map();
    this.userPatterns = new Map();
    this.predictionCache = new Map();
  }

  /**
   * Predict what memories user will need before they search
   * Revolutionary proactive memory suggestions
   */
  async predictNeededMemories(
    agentId: string,
    context: PredictionContext
  ): Promise<PredictedMemory[]> {
    const cacheKey = `needed_memories_${agentId}_${JSON.stringify(context)}`;
    const cached = this.getCachedPrediction(cacheKey);
    if (cached) return cached;

    try {
      // Get agent's memories and activity patterns
      const agentMemories = Array.from(this.memories.values())
        .filter(m => m.metadata.agentId === agentId);

      if (agentMemories.length === 0) {
        return [];
      }

      // Analyze user patterns
      const userPattern = await this.analyzeUserPattern(agentId, context);

      // Score memories based on predicted need
      const scoredMemories = await this.scoreMemoriesByPredictedNeed(
        agentMemories,
        context,
        userPattern
      );

      // Generate predictions using AI if available
      const aiPredictions = this.openaiClient
        ? await this.generateAIPredictions(agentMemories, context, userPattern)
        : [];

      // Combine and rank predictions
      const predictions = await this.combineAndRankPredictions(
        scoredMemories,
        aiPredictions,
        context
      );

      this.cachePrediction(cacheKey, predictions);
      return predictions;

    } catch (error) {
      console.error('Error predicting needed memories:', error);
      return [];
    }
  }

  /**
   * Predict optimal memory creation timing
   * Smart timing recommendations based on context and patterns
   */
  async predictMemoryCreationTiming(
    agentId: string,
    contentType: string,
    context?: PredictionContext
  ): Promise<OptimalTiming> {
    try {
      const userPattern = await this.analyzeUserPattern(agentId, context);

      // Analyze timing factors
      const factors: TimingFactor[] = [];

      // Current workload analysis
      const workloadFactor = this.analyzeWorkloadTiming(context);
      factors.push(workloadFactor);

      // Time of day optimization
      const timeFactor = this.analyzeTimeOfDayOptimal(userPattern, new Date());
      factors.push(timeFactor);

      // Memory type considerations
      const typeFactor = this.analyzeMemoryTypeTiming(contentType, userPattern);
      factors.push(typeFactor);

      // Calculate optimal timing
      const optimalTiming = this.calculateOptimalTiming(factors, context);

      return optimalTiming;

    } catch (error) {
      console.error('Error predicting optimal timing:', error);
      return {
        recommendedTime: new Date().toISOString(),
        reasoning: 'Using current time due to prediction error',
        confidence: 0.3,
        factors: []
      };
    }
  }

  /**
   * Predict memory relationship formation
   * Forecast future connections between memories
   */
  async predictFutureRelationships(
    memoryId: string,
    timeHorizon: number = 30 // days
  ): Promise<PredictedRelationship[]> {
    try {
      const sourceMemory = this.memories.get(memoryId);
      if (!sourceMemory) {
        return [];
      }

      const agentMemories = Array.from(this.memories.values())
        .filter(m => m.metadata.agentId === sourceMemory.metadata.agentId);

      const predictions: PredictedRelationship[] = [];

      for (const targetMemory of agentMemories) {
        if (targetMemory.id === memoryId) continue;

        // Skip if relationship already exists
        if (this.hasExistingRelationship(sourceMemory, targetMemory)) {
          continue;
        }

        const prediction = await this.predictRelationshipFormation(
          sourceMemory,
          targetMemory,
          timeHorizon
        );

        if (prediction && prediction.formationProbability > 0.3) {
          predictions.push(prediction);
        }
      }

      // Sort by formation probability
      return predictions.sort((a, b) => b.formationProbability - a.formationProbability);

    } catch (error) {
      console.error('Error predicting relationships:', error);
      return [];
    }
  }

  /**
   * Predict memory importance evolution
   * Forecast how memory importance will change over time
   */
  async predictImportanceChanges(
    memoryId: string,
    timeHorizon: number = 90 // days
  ): Promise<ImportanceForecast> {
    try {
      const memory = this.memories.get(memoryId);
      if (!memory) {
        throw new Error(`Memory ${memoryId} not found`);
      }

      const currentImportance = memory.metadata.importance || 0.5;

      // Generate time points for prediction
      const timePoints = this.generateTimePoints(timeHorizon);

      // Analyze importance drivers
      const drivers = await this.analyzeImportanceDrivers(memory);

      // Predict importance at each time point
      const predictedImportance = await this.forecastImportanceTrajectory(
        memory,
        drivers,
        timePoints
      );

      // Determine trend direction
      const trendDirection = this.determineTrendDirection(predictedImportance);

      // Calculate confidence intervals
      const confidenceInterval = this.calculateConfidenceIntervals(
        predictedImportance,
        drivers
      );

      return {
        memoryId,
        currentImportance,
        predictedImportance,
        timePoints: timePoints.map(t => t.toISOString()),
        trendDirection,
        confidenceInterval,
        factors: drivers
      };

    } catch (error) {
      console.error('Error predicting importance changes:', error);
      throw error;
    }
  }

  // Private helper methods

  private getCachedPrediction(key: string): any {
    const cached = this.predictionCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private cachePrediction(key: string, data: any): void {
    this.predictionCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  private async analyzeUserPattern(
    agentId: string,
    context?: PredictionContext
  ): Promise<UserPattern> {
    // Check if we have cached pattern
    let pattern = this.userPatterns.get(agentId);

    if (!pattern) {
      // Analyze from memory access patterns
      pattern = await this.extractUserPatternFromMemories(agentId);
      this.userPatterns.set(agentId, pattern);
    }

    // Update with current context
    if (context) {
      pattern = this.updatePatternWithContext(pattern, context);
    }

    return pattern;
  }

  private async extractUserPatternFromMemories(agentId: string): Promise<UserPattern> {
    const memories = Array.from(this.memories.values())
      .filter(m => m.metadata.agentId === agentId);

    // Analyze creation times for peak hours
    const creationHours = memories
      .map(m => new Date(m.metadata.timestamp).getHours())
      .reduce((acc, hour) => {
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

    const peakHours = Object.entries(creationHours)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => `${hour}:00`);

    // Analyze preferred memory types
    const memoryTypes = memories
      .map(m => m.metadata.entityType || 'general')
      .reduce((acc, type) => {
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const preferredMemoryTypes = Object.entries(memoryTypes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([type]) => type);

    return {
      peakHours,
      preferredMemoryTypes,
      searchPatterns: [], // Would need search history
      collaborationStyle: 'individual', // Default
      learningStyle: 'textual' // Default
    };
  }

  private updatePatternWithContext(
    pattern: UserPattern,
    context: PredictionContext
  ): UserPattern {
    // Update pattern based on current context
    return {
      ...pattern,
      // Could enhance pattern with real-time context data
    };
  }

  private async scoreMemoriesByPredictedNeed(
    memories: AdvancedMemory[],
    context: PredictionContext,
    userPattern: UserPattern
  ): Promise<PredictedMemory[]> {
    const predictions: PredictedMemory[] = [];

    for (const memory of memories) {
      const score = await this.calculateNeedScore(memory, context, userPattern);

      if (score.predictedRelevance > 0.3) {
        predictions.push({
          memoryId: memory.id,
          title: this.extractTitle(memory.content),
          content: memory.content.substring(0, 200) + '...',
          predictedRelevance: score.predictedRelevance,
          reasoning: score.reasoning,
          suggestedActions: score.suggestedActions,
          confidence: score.confidence,
          timeToNeed: score.timeToNeed
        });
      }
    }

    return predictions;
  }

  private async calculateNeedScore(
    memory: AdvancedMemory,
    context: PredictionContext,
    userPattern: UserPattern
  ): Promise<{
    predictedRelevance: number;
    reasoning: string;
    suggestedActions: string[];
    confidence: number;
    timeToNeed: number;
  }> {
    let score = 0.0;
    const reasons: string[] = [];
    const actions: string[] = [];

    // Time-based scoring
    const timeScore = this.calculateTimeBasedScore(memory, context);
    score += timeScore * 0.3;
    if (timeScore > 0.5) {
      reasons.push('Recent access pattern suggests relevance');
    }

    // Context-based scoring
    const contextScore = this.calculateContextScore(memory, context);
    score += contextScore * 0.4;
    if (contextScore > 0.5) {
      reasons.push('Matches current task context');
      actions.push('Review for current task');
    }

    // Pattern-based scoring
    const patternScore = this.calculatePatternScore(memory, userPattern);
    score += patternScore * 0.3;
    if (patternScore > 0.5) {
      reasons.push('Aligns with user behavior patterns');
    }

    // Calculate time to need
    const timeToNeed = this.estimateTimeToNeed(score, context);

    return {
      predictedRelevance: Math.min(score, 1.0),
      reasoning: reasons.join('; ') || 'Low relevance score',
      suggestedActions: actions.length > 0 ? actions : ['Monitor for future relevance'],
      confidence: score * 0.8, // Slightly lower confidence than score
      timeToNeed
    };
  }

  private calculateTimeBasedScore(memory: AdvancedMemory, context: PredictionContext): number {
    const now = new Date();
    const memoryTime = new Date(memory.metadata.timestamp);
    const daysSince = (now.getTime() - memoryTime.getTime()) / (1000 * 60 * 60 * 24);

    // Recent memories get higher scores
    if (daysSince < 1) return 0.9;
    if (daysSince < 7) return 0.7;
    if (daysSince < 30) return 0.5;
    return 0.2;
  }

  private calculateContextScore(memory: AdvancedMemory, context: PredictionContext): number {
    let score = 0.0;

    // Check if memory relates to current task
    if (context.currentTask) {
      const taskWords = context.currentTask.toLowerCase().split(' ');
      const memoryWords = memory.content.toLowerCase().split(' ');
      const overlap = taskWords.filter(word => memoryWords.includes(word)).length;
      score += (overlap / taskWords.length) * 0.5;
    }

    // Check recent activity relevance
    if (context.recentActivity) {
      const recentMemoryIds = context.recentActivity
        .flatMap(a => a.memoryIds)
        .filter(id => id === memory.id);
      if (recentMemoryIds.length > 0) {
        score += 0.4;
      }
    }

    // Check working memory
    if (context.workingMemory && context.workingMemory.includes(memory.id)) {
      score += 0.3;
    }

    return Math.min(score, 1.0);
  }

  private calculatePatternScore(memory: AdvancedMemory, userPattern: UserPattern): number {
    let score = 0.0;

    // Check if memory type is preferred
    const memoryType = memory.metadata.entityType || 'general';
    if (userPattern.preferredMemoryTypes.includes(memoryType)) {
      score += 0.4;
    }

    // Check time pattern match
    const memoryHour = new Date(memory.metadata.timestamp).getHours();
    const currentHour = new Date().getHours();
    if (userPattern.peakHours.includes(`${currentHour}:00`)) {
      score += 0.3;
    }

    return Math.min(score, 1.0);
  }

  private estimateTimeToNeed(score: number, context: PredictionContext): number {
    // Higher scores mean sooner need
    if (score > 0.8) return 5; // 5 minutes
    if (score > 0.6) return 30; // 30 minutes
    if (score > 0.4) return 120; // 2 hours
    return 480; // 8 hours
  }

  private async generateAIPredictions(
    memories: AdvancedMemory[],
    context: PredictionContext,
    userPattern: UserPattern
  ): Promise<PredictedMemory[]> {
    if (!this.openaiClient) {
      return [];
    }

    try {
      const prompt = this.buildPredictionPrompt(memories, context, userPattern);

      const response = await this.openaiClient.chat.completions.create({
        model: 'gpt-4',
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: 0.3,
        max_tokens: 2000
      });

      const aiResponse = response.choices[0]?.message?.content;
      if (!aiResponse) return [];

      return this.parseAIPredictions(aiResponse, memories);

    } catch (error) {
      console.error('Error generating AI predictions:', error);
      return [];
    }
  }

  private buildPredictionPrompt(
    memories: AdvancedMemory[],
    context: PredictionContext,
    userPattern: UserPattern
  ): string {
    const memoryPreview = memories.slice(0, 10).map(m =>
      `${m.id}: ${m.content.substring(0, 100)}...`
    ).join('\n');

    return `
As an AI memory prediction system, analyze the user's current context and predict which memories they will likely need soon.

Current Context:
- Task: ${context.currentTask || 'Unknown'}
- Time: ${context.timeOfDay}
- Recent Activity: ${context.recentActivity?.length || 0} recent actions

User Pattern:
- Peak Hours: ${userPattern.peakHours.join(', ')}
- Preferred Types: ${userPattern.preferredMemoryTypes.join(', ')}
- Learning Style: ${userPattern.learningStyle}

Available Memories (sample):
${memoryPreview}

Predict the top 5 memories the user will likely need in the next few hours. For each, provide:
1. Memory ID
2. Relevance score (0.0-1.0)
3. Reasoning
4. Suggested actions
5. Confidence level

Format as JSON array with these fields.
    `;
  }

  private parseAIPredictions(aiResponse: string, memories: AdvancedMemory[]): PredictedMemory[] {
    try {
      const parsed = JSON.parse(aiResponse);
      if (!Array.isArray(parsed)) return [];

      return parsed.map(p => ({
        memoryId: p.memoryId || '',
        title: this.extractTitle(memories.find(m => m.id === p.memoryId)?.content || ''),
        content: memories.find(m => m.id === p.memoryId)?.content?.substring(0, 200) + '...' || '',
        predictedRelevance: p.relevance || 0.5,
        reasoning: p.reasoning || 'AI prediction',
        suggestedActions: Array.isArray(p.actions) ? p.actions : ['Review'],
        confidence: p.confidence || 0.5,
        timeToNeed: 60 // Default 1 hour
      })).filter(p => p.memoryId);

    } catch (error) {
      console.error('Error parsing AI predictions:', error);
      return [];
    }
  }

  private async combineAndRankPredictions(
    scoredMemories: PredictedMemory[],
    aiPredictions: PredictedMemory[],
    context: PredictionContext
  ): Promise<PredictedMemory[]> {
    // Combine predictions, giving weight to both sources
    const combined = new Map<string, PredictedMemory>();

    // Add scored memories
    scoredMemories.forEach(prediction => {
      combined.set(prediction.memoryId, prediction);
    });

    // Enhance with AI predictions
    aiPredictions.forEach(aiPrediction => {
      const existing = combined.get(aiPrediction.memoryId);
      if (existing) {
        // Combine scores
        existing.predictedRelevance = (existing.predictedRelevance + aiPrediction.predictedRelevance) / 2;
        existing.confidence = Math.max(existing.confidence, aiPrediction.confidence);
        existing.reasoning += '; ' + aiPrediction.reasoning;
      } else {
        combined.set(aiPrediction.memoryId, aiPrediction);
      }
    });

    // Sort by relevance and return top predictions
    return Array.from(combined.values())
      .sort((a, b) => b.predictedRelevance - a.predictedRelevance)
      .slice(0, 10);
  }

  private analyzeWorkloadTiming(context?: PredictionContext): TimingFactor {
    const workload = context?.environmentalFactors?.workload || 'moderate';

    let impact = 0;
    let description = '';

    switch (workload) {
      case 'light':
        impact = 0.3;
        description = 'Light workload - good time for memory creation';
        break;
      case 'moderate':
        impact = 0.0;
        description = 'Moderate workload - standard timing';
        break;
      case 'heavy':
        impact = -0.4;
        description = 'Heavy workload - consider delaying non-critical memories';
        break;
      case 'critical':
        impact = -0.8;
        description = 'Critical workload - delay unless urgent';
        break;
    }

    return {
      factor: 'Current Workload',
      impact,
      description
    };
  }

  private analyzeTimeOfDayOptimal(pattern: UserPattern, currentTime: Date): TimingFactor {
    const currentHour = `${currentTime.getHours()}:00`;
    const isPeakHour = pattern.peakHours.includes(currentHour);

    return {
      factor: 'Time of Day',
      impact: isPeakHour ? 0.4 : -0.2,
      description: isPeakHour
        ? 'Peak productivity hour - optimal for memory creation'
        : 'Off-peak hour - consider waiting for better timing'
    };
  }

  private analyzeMemoryTypeTiming(contentType: string, pattern: UserPattern): TimingFactor {
    const isPreferredType = pattern.preferredMemoryTypes.includes(contentType);

    return {
      factor: 'Memory Type Preference',
      impact: isPreferredType ? 0.2 : -0.1,
      description: isPreferredType
        ? 'Preferred memory type - good timing match'
        : 'Non-preferred type - consider alternative timing'
    };
  }

  private calculateOptimalTiming(
    factors: TimingFactor[],
    context?: PredictionContext
  ): OptimalTiming {
    const totalImpact = factors.reduce((sum, factor) => sum + factor.impact, 0);
    const avgImpact = totalImpact / factors.length;

    // Calculate delay based on impact
    let delayMinutes = 0;
    if (avgImpact < -0.5) delayMinutes = 120; // 2 hours
    else if (avgImpact < -0.2) delayMinutes = 30; // 30 minutes
    else if (avgImpact > 0.3) delayMinutes = -5; // Immediate (negative delay)

    const recommendedTime = new Date(Date.now() + delayMinutes * 60 * 1000);

    const confidence = Math.min(0.9, 0.5 + Math.abs(avgImpact));

    return {
      recommendedTime: recommendedTime.toISOString(),
      reasoning: this.generateTimingReasoning(factors, avgImpact),
      confidence,
      factors
    };
  }

  private generateTimingReasoning(factors: TimingFactor[], avgImpact: number): string {
    if (avgImpact > 0.3) {
      return 'Excellent timing - multiple factors favor immediate memory creation';
    } else if (avgImpact > 0) {
      return 'Good timing - conditions are favorable for memory creation';
    } else if (avgImpact > -0.3) {
      return 'Acceptable timing - some minor factors suggest slight delay';
    } else {
      return 'Consider delaying - current conditions not optimal for memory creation';
    }
  }

  private hasExistingRelationship(memory1: AdvancedMemory, memory2: AdvancedMemory): boolean {
    return memory1.relationships.some((rel: any) =>
      rel.targetMemoryId === memory2.id || rel.sourceMemoryId === memory2.id
    );
  }

  private async predictRelationshipFormation(
    sourceMemory: AdvancedMemory,
    targetMemory: AdvancedMemory,
    timeHorizon: number
  ): Promise<PredictedRelationship | null> {
    try {
      // Calculate content similarity
      const contentSimilarity = await this.calculateContentSimilarity(
        sourceMemory.content,
        targetMemory.content
      );

      // Calculate temporal proximity
      const temporalProximity = this.calculateTemporalProximity(sourceMemory, targetMemory);

      // Calculate project/session alignment
      const contextAlignment = this.calculateContextAlignment(sourceMemory, targetMemory);

      // Determine relationship type and strength
      const relationshipType = this.predictRelationshipType(sourceMemory, targetMemory);
      const strength = (contentSimilarity + temporalProximity + contextAlignment) / 3;

      // Calculate formation probability
      const formationProbability = this.calculateFormationProbability(
        strength,
        contentSimilarity,
        temporalProximity,
        contextAlignment
      );

      if (formationProbability < 0.3) {
        return null; // Too low probability
      }

      // Estimate time to formation
      const timeToFormation = this.estimateFormationTime(formationProbability, timeHorizon);

      return {
        sourceMemoryId: sourceMemory.id,
        targetMemoryId: targetMemory.id,
        relationshipType,
        strength,
        formationProbability,
        timeToFormation,
        reasoning: this.generateRelationshipReasoning(
          contentSimilarity,
          temporalProximity,
          contextAlignment,
          relationshipType
        )
      };

    } catch (error) {
      console.error('Error predicting relationship formation:', error);
      return null;
    }
  }

  private async calculateContentSimilarity(content1: string, content2: string): Promise<number> {
    // Simple similarity calculation - could be enhanced with embeddings
    const words1 = new Set(content1.toLowerCase().split(/\s+/));
    const words2 = new Set(content2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  private calculateTemporalProximity(memory1: AdvancedMemory, memory2: AdvancedMemory): number {
    const time1 = new Date(memory1.metadata.timestamp).getTime();
    const time2 = new Date(memory2.metadata.timestamp).getTime();
    const timeDiff = Math.abs(time1 - time2);
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

    // Closer in time = higher proximity
    if (daysDiff < 1) return 0.9;
    if (daysDiff < 7) return 0.7;
    if (daysDiff < 30) return 0.5;
    return 0.2;
  }

  private calculateContextAlignment(memory1: AdvancedMemory, memory2: AdvancedMemory): number {
    let alignment = 0;

    // Same project
    if (memory1.metadata.project === memory2.metadata.project) {
      alignment += 0.4;
    }

    // Same session
    if (memory1.metadata.session === memory2.metadata.session) {
      alignment += 0.3;
    }

    // Same entity type
    if (memory1.metadata.entityType === memory2.metadata.entityType) {
      alignment += 0.2;
    }

    // Shared tags
    const tags1 = memory1.metadata.tags || [];
    const tags2 = memory2.metadata.tags || [];
    const sharedTags = tags1.filter(tag => tags2.includes(tag));
    if (sharedTags.length > 0) {
      alignment += Math.min(0.3, sharedTags.length * 0.1);
    }

    return Math.min(alignment, 1.0);
  }

  private predictRelationshipType(
    sourceMemory: AdvancedMemory,
    targetMemory: AdvancedMemory
  ): PredictedRelationship['relationshipType'] {
    // Simple heuristics - could be enhanced with AI
    const time1 = new Date(sourceMemory.metadata.timestamp).getTime();
    const time2 = new Date(targetMemory.metadata.timestamp).getTime();

    if (time2 > time1) {
      return 'follows';
    } else if (sourceMemory.content.includes('related') || targetMemory.content.includes('related')) {
      return 'related';
    } else if (sourceMemory.content.includes('update') || targetMemory.content.includes('update')) {
      return 'updates';
    } else {
      return 'similar';
    }
  }

  private calculateFormationProbability(
    strength: number,
    contentSimilarity: number,
    temporalProximity: number,
    contextAlignment: number
  ): number {
    // Weighted combination
    return (
      strength * 0.4 +
      contentSimilarity * 0.3 +
      temporalProximity * 0.2 +
      contextAlignment * 0.1
    );
  }

  private estimateFormationTime(probability: number, maxDays: number): number {
    // Higher probability = sooner formation
    if (probability > 0.8) return 1;
    if (probability > 0.6) return 3;
    if (probability > 0.4) return 7;
    return Math.min(maxDays, 14);
  }

  private generateRelationshipReasoning(
    contentSimilarity: number,
    temporalProximity: number,
    contextAlignment: number,
    relationshipType: string
  ): string {
    const reasons = [];

    if (contentSimilarity > 0.6) {
      reasons.push('high content similarity');
    }
    if (temporalProximity > 0.6) {
      reasons.push('temporal proximity');
    }
    if (contextAlignment > 0.6) {
      reasons.push('shared context');
    }

    const baseReason = `Predicted ${relationshipType} relationship`;
    return reasons.length > 0
      ? `${baseReason} based on ${reasons.join(', ')}`
      : `${baseReason} with moderate confidence`;
  }

  private async analyzeImportanceDrivers(memory: AdvancedMemory): Promise<ImportanceDriver[]> {
    const drivers: ImportanceDriver[] = [];

    // Age factor
    const daysSinceCreation = (Date.now() - new Date(memory.metadata.timestamp).getTime()) / (1000 * 60 * 60 * 24);
    drivers.push({
      factor: 'Age',
      impact: daysSinceCreation > 30 ? -0.1 : 0.1,
      description: daysSinceCreation > 30 ? 'Older memories tend to lose importance' : 'Recent memory maintains relevance',
      confidence: 0.8
    });

    // Relationship count
    const relationshipCount = memory.relationships.length;
    drivers.push({
      factor: 'Connectivity',
      impact: relationshipCount * 0.05,
      description: `${relationshipCount} relationships ${relationshipCount > 3 ? 'increase' : 'maintain'} importance`,
      confidence: 0.7
    });

    // Entity type
    const entityType = memory.metadata.entityType;
    const typeImportance = this.getEntityTypeImportance(entityType);
    drivers.push({
      factor: 'Content Type',
      impact: typeImportance,
      description: `${entityType || 'general'} content type ${typeImportance > 0 ? 'enhances' : 'reduces'} long-term importance`,
      confidence: 0.6
    });

    return drivers;
  }

  private getEntityTypeImportance(entityType?: string): number {
    switch (entityType) {
      case 'decision': return 0.2;
      case 'plan': return 0.15;
      case 'task': return 0.1;
      case 'meeting': return 0.05;
      case 'note': return -0.05;
      default: return 0;
    }
  }

  private generateTimePoints(days: number): Date[] {
    const points: Date[] = [];
    const now = new Date();

    // Generate points at intervals
    for (let i = 0; i <= days; i += Math.max(1, Math.floor(days / 10))) {
      points.push(new Date(now.getTime() + i * 24 * 60 * 60 * 1000));
    }

    return points;
  }

  private async forecastImportanceTrajectory(
    memory: AdvancedMemory,
    drivers: ImportanceDriver[],
    timePoints: Date[]
  ): Promise<number[]> {
    const currentImportance = memory.metadata.importance || 0.5;
    const trajectory: number[] = [];

    for (let i = 0; i < timePoints.length; i++) {
      const dayOffset = i * (90 / timePoints.length); // Spread over time horizon

      let importance = currentImportance;

      // Apply driver impacts over time
      drivers.forEach(driver => {
        const timeDecay = Math.exp(-dayOffset / 30); // Exponential decay
        importance += driver.impact * timeDecay * driver.confidence;
      });

      // Add some random variation to simulate uncertainty
      const variation = (Math.random() - 0.5) * 0.1;
      importance += variation;

      // Clamp to valid range
      importance = Math.max(0, Math.min(1, importance));
      trajectory.push(importance);
    }

    return trajectory;
  }

  private determineTrendDirection(predictions: number[]): ImportanceForecast['trendDirection'] {
    if (predictions.length < 2) return 'stable';

    const first = predictions[0];
    const last = predictions[predictions.length - 1];

    if (first === undefined || last === undefined) return 'stable';

    const change = last - first;

    // Calculate variance to detect volatility
    const mean = predictions.reduce((sum, val) => sum + val, 0) / predictions.length;
    const variance = predictions.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / predictions.length;

    if (variance > 0.05) return 'volatile';
    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }

  private calculateConfidenceIntervals(
    predictions: number[],
    drivers: ImportanceDriver[]
  ): { min: number; max: number }[] {
    const avgConfidence = drivers.reduce((sum, d) => sum + d.confidence, 0) / drivers.length;
    const margin = (1 - avgConfidence) * 0.2; // Confidence affects margin size

    return predictions.map(prediction => ({
      min: Math.max(0, prediction - margin),
      max: Math.min(1, prediction + margin)
    }));
  }

  private extractTitle(content: string): string {
    // Extract first line or first 50 characters as title
    const firstLine = content.split('\n')[0];
    if (!firstLine) return 'Untitled Memory';
    return firstLine.length > 50 ? firstLine.substring(0, 47) + '...' : firstLine;
  }

  /**
   * Record prediction accuracy for continuous learning
   */
  async recordPredictionOutcome(
    predictionId: string,
    actualOutcome: any,
    accuracy: number,
    feedback?: string
  ): Promise<void> {
    const history = this.predictionHistory.get(predictionId);
    if (history) {
      history.actualOutcome = actualOutcome;
      history.accuracy = accuracy;
      history.feedback = feedback;
    }
  }

  /**
   * Get prediction accuracy statistics
   */
  getPredictionStats(): {
    totalPredictions: number;
    averageAccuracy: number;
    accuracyByType: Record<string, number>;
  } {
    const histories = Array.from(this.predictionHistory.values());
    const withAccuracy = histories.filter(h => h.accuracy !== undefined);

    if (withAccuracy.length === 0) {
      return {
        totalPredictions: histories.length,
        averageAccuracy: 0,
        accuracyByType: {}
      };
    }

    const averageAccuracy = withAccuracy.reduce((sum, h) => sum + (h.accuracy || 0), 0) / withAccuracy.length;

    const accuracyByType: Record<string, number> = {};
    const typeGroups = withAccuracy.reduce((groups, h) => {
      const type = h.type;
      if (!groups[type]) groups[type] = [];
      groups[type].push(h.accuracy || 0);
      return groups;
    }, {} as Record<string, number[]>);

    Object.entries(typeGroups).forEach(([type, accuracies]) => {
      accuracyByType[type] = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
    });

    return {
      totalPredictions: histories.length,
      averageAccuracy,
      accuracyByType
    };
  }
}
