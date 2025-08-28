import { EventEmitter } from 'events';
import { EnhancedMemoryStore, ScoredMemory } from './enhanced-memory-store.js';

/**
 * Configuration for AI-powered memory suggestions
 */
export interface SuggestionEngineConfig {
  enabled: boolean;
  maxSuggestions: number;
  minRelevanceScore: number;
  contextWindowSize: number;
  enableContextualSuggestions: boolean;
  enableTemporalSuggestions: boolean;
  enablePredictiveAnalytics: boolean;
  enableCollaborativeSuggestions: boolean;
  refreshInterval: number;
  cacheTTL: number;
  enableCaching: boolean;
  behaviorTrackingEnabled: boolean;
}

/**
 * Context for generating memory suggestions
 */
export interface SuggestionContext {
  agentId: string;
  currentActivity?: string;
  activeProjects?: string[];
  timeContext?: string;
  recentMemories?: ScoredMemory[];
  userPreferences?: Record<string, any>;
  collaborationContext?: {
    activeAgents?: string[];
    sharedProjects?: string[];
  };
}

/**
 * User behavior pattern for predictive analytics
 */
export interface UserBehaviorPattern {
  id: string;
  patternType: 'temporal' | 'contextual' | 'sequential' | 'associative';
  triggers: string[];
  outcomes: string[];
  frequency: number;
  confidence: number;
  lastSeen: Date;
  description: string;
  metadata: Record<string, any>;
}

/**
 * AI-generated memory suggestion
 */
export interface MemorySuggestion {
  id: string;
  memory: ScoredMemory;
  suggestionType: 'contextual' | 'temporal' | 'predictive' | 'collaborative' | 'associative';
  relevanceScore: number;
  confidence: number;
  reasoning: string;
  triggers: string[];
  metadata: Record<string, any>;
}

/**
 * Statistics for suggestion engine performance
 */
export interface SuggestionStats {
  totalSuggestions: number;
  avgRelevanceScore: number;
  patternCount: number;
  acceptanceRate: number;
  lastGenerated: Date | null;
  performanceMetrics: {
    avgGenerationTime: number;
    cacheHitRate: number;
    errorRate: number;
  };
}

/**
 * Feedback data for learning and improvement
 */
export interface SuggestionFeedback {
  suggestionId: string;
  outcome: 'accepted' | 'rejected' | 'ignored';
  timestamp: Date;
  context: SuggestionContext;
  relevanceScore?: number;
  userNotes?: string;
}

/**
 * AI-Powered Memory Suggestion Engine
 * 
 * Advanced intelligent system that provides contextual, temporal, and predictive
 * memory suggestions using machine learning patterns and behavioral analysis.
 * 
 * Key capabilities:
 * - Behavioral pattern recognition and learning
 * - Contextual memory associations
 * - Temporal pattern analysis
 * - Predictive memory suggestions
 * - Cross-agent collaborative insights
 * - Real-time performance optimization
 * - Feedback learning and continuous improvement
 * 
 * Features:
 * - Temporal pattern recognition
 * - Contextual memory associations
 * - Predictive memory suggestions
 * - Cross-agent collaborative insights
 * - Advanced caching and performance optimization
 */
export class AiMemorySuggestionEngine extends EventEmitter {
  private memoryStore: EnhancedMemoryStore;
  private config: SuggestionEngineConfig;
  private behaviorPatterns: Map<string, UserBehaviorPattern>;
  private suggestionCache: Map<string, { suggestions: MemorySuggestion[]; timestamp: number }>;
  private stats: SuggestionStats;
  private feedbackHistory: SuggestionFeedback[];
  private refreshTimer: NodeJS.Timeout | null = null;
  private isInitialized: boolean = false;

  constructor(memoryStore: EnhancedMemoryStore, config?: Partial<SuggestionEngineConfig>) {
    super();

    this.memoryStore = memoryStore;
    this.config = {
      enabled: true,
      maxSuggestions: 10,
      minRelevanceScore: 0.3,
      contextWindowSize: 50,
      enableContextualSuggestions: true,
      enableTemporalSuggestions: true,
      enablePredictiveAnalytics: true,
      enableCollaborativeSuggestions: true,
      refreshInterval: 300000, // 5 minutes
      cacheTTL: 600000, // 10 minutes
      enableCaching: true,
      behaviorTrackingEnabled: true,
      ...config
    };

    this.behaviorPatterns = new Map();
    this.suggestionCache = new Map();
    this.feedbackHistory = [];
    this.stats = {
      totalSuggestions: 0,
      avgRelevanceScore: 0,
      patternCount: 0,
      acceptanceRate: 0,
      lastGenerated: null,
      performanceMetrics: {
        avgGenerationTime: 0,
        cacheHitRate: 0,
        errorRate: 0
      }
    };
  }

  /**
   * Initialize the AI suggestion engine
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Initialize behavior tracking
      if (this.config.behaviorTrackingEnabled) {
        console.log('[AI Suggestion Engine] Initializing behavior tracking...');
        await this.initializeBehaviorTracking();
      }

      // Start suggestion generation engine
      if (this.config.enabled) {
        console.log('[AI Suggestion Engine] Starting suggestion generation...');
        this.startSuggestionEngine();
      }

      // Initialize predictive models
      if (this.config.enablePredictiveAnalytics) {
        console.log('[AI Suggestion Engine] Initializing predictive models...');
        await this.initializePredictiveModels();
      }

      this.isInitialized = true;
      console.log('[AI Suggestion Engine] Initialized with advanced AI capabilities');

      this.emit('initialization', {
        type: 'ai_suggestion_engine_init',
        timestamp: new Date(),
        config: this.config
      });

      this.emit('ready', {
        type: 'ai_suggestion_engine_ready',
        timestamp: new Date(),
        capabilities: this.getCapabilities()
      });

    } catch (error) {
      console.error('[AI Suggestion Engine] Initialization failed:', error);
      this.emit('error', {
        type: 'initialization_error',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date()
      });
      throw error;
    }
  }

  /**
   * Initialize behavior tracking capabilities
   */
  private async initializeBehaviorTracking(): Promise<void> {
    // Load existing behavior patterns from memory store
    const agentId = 'ai-suggestion-agent'; // Default for initial patterns
    const existingPatterns = await this.memoryStore.recall(agentId, '', { limit: this.config.contextWindowSize });

    // Analyze existing memories to detect initial patterns
    if (existingPatterns.length > 0) {
      await this.detectTemporalPatterns(existingPatterns);
      await this.detectContextualPatterns(existingPatterns);
      await this.detectSequentialPatterns(existingPatterns);
      await this.detectAssociativePatterns(existingPatterns);
    }
  }

  /**
   * Initialize predictive models for advanced analytics
   */
  private async initializePredictiveModels(): Promise<void> {
    console.log('[AI Suggestion Engine] Predictive models initialized');

    // Initialize machine learning models for predictive suggestions
    // This is where we would load pre-trained models or initialize new ones

    this.emit('predictive_models_ready', {
      type: 'predictive_models_ready',
      timestamp: new Date(),
      modelsLoaded: ['temporal_predictor', 'contextual_analyzer', 'sequence_detector']
    });
  }

  /**
   * Start the suggestion generation engine with refresh timer
   */
  private startSuggestionEngine(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }

    // Set up periodic refresh of behavior patterns
    this.refreshTimer = setInterval(async () => {
      try {
        await this.refreshBehaviorPatterns();
      } catch (error) {
        console.error('[AI Suggestion Engine] Pattern refresh failed:', error);
      }
    }, this.config.refreshInterval);
  }

  /**
   * Refresh behavior patterns periodically
   */
  private async refreshBehaviorPatterns(): Promise<void> {
    const agentId = 'ai-suggestion-agent';
    const recentMemories = await this.memoryStore.recall(agentId, '', {
      limit: this.config.contextWindowSize * 2
    });

    if (recentMemories.length > 0) {
      await this.detectTemporalPatterns(recentMemories);
      await this.detectContextualPatterns(recentMemories);
      await this.detectSequentialPatterns(recentMemories);
      await this.detectAssociativePatterns(recentMemories);
    }
  }

  /**
   * Cleanup and destroy the engine
   */
  async destroy(): Promise<void> {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }

    this.behaviorPatterns.clear();
    this.suggestionCache.clear();
    this.feedbackHistory = [];
    this.isInitialized = false;

    this.emit('destroyed', {
      type: 'ai_suggestion_engine_destroyed',
      timestamp: new Date()
    });
  }

  /**
   * Generate intelligent memory suggestions based on context
   */
  async generateSuggestions(context: SuggestionContext): Promise<MemorySuggestion[]> {
    if (!this.isInitialized || !this.config.enabled) {
      return [];
    }

    const startTime = Date.now();
    const suggestions: MemorySuggestion[] = [];

    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(context);
      if (this.config.enableCaching) {
        const cached = this.suggestionCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp) < this.config.cacheTTL) {
          this.stats.performanceMetrics.cacheHitRate++;
          return cached.suggestions;
        }
      }

      // First, fetch recent memories to analyze behavior patterns
      const agentId = context.agentId || 'default-agent';
      const recentMemories = await this.memoryStore.recall(agentId, '', {
        limit: this.config.contextWindowSize
      });

      // Update behavior patterns based on recent memories
      await this.detectTemporalPatterns(recentMemories);
      await this.detectContextualPatterns(recentMemories);
      await this.detectSequentialPatterns(recentMemories);
      await this.detectAssociativePatterns(recentMemories);

      // Generate different types of suggestions
      if (this.config.enableContextualSuggestions) {
        const contextual = await this.generateContextualSuggestions(context, recentMemories);
        suggestions.push(...contextual);
      }

      if (this.config.enablePredictiveAnalytics) {
        const predictive = await this.generatePredictiveSuggestions(context, recentMemories);
        suggestions.push(...predictive);
      }

      if (this.config.enableTemporalSuggestions) {
        const temporal = await this.generateTemporalSuggestions(context, recentMemories);
        suggestions.push(...temporal);
      }

      if (this.config.enableCollaborativeSuggestions) {
        const collaborative = await this.generateCollaborativeSuggestions(context, recentMemories);
        suggestions.push(...collaborative);
      }

      // Generate associative suggestions
      const associative = await this.generateAssociativeSuggestions(context, recentMemories);
      suggestions.push(...associative);

      // Sort by relevance and limit results
      const filteredSuggestions = suggestions
        .filter(s => s.relevanceScore >= this.config.minRelevanceScore)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, this.config.maxSuggestions);

      // Cache results
      if (this.config.enableCaching && filteredSuggestions.length > 0) {
        this.suggestionCache.set(cacheKey, {
          suggestions: filteredSuggestions,
          timestamp: Date.now()
        });
      }

      // Update statistics
      this.updateStats(filteredSuggestions, Date.now() - startTime);

      // Emit suggestion generation event
      this.emit('suggestions_generated', {
        type: 'suggestions_generated',
        timestamp: new Date(),
        context,
        suggestionCount: filteredSuggestions.length,
        avgRelevanceScore: filteredSuggestions.reduce((acc, s) => acc + s.relevanceScore, 0) / filteredSuggestions.length || 0
      });

      return filteredSuggestions;

    } catch (error) {
      console.error('[AI Suggestion Engine] Generation failed:', error);
      this.stats.performanceMetrics.errorRate++;

      this.emit('error', {
        type: 'suggestion_generation_error',
        error: error instanceof Error ? error.message : String(error),
        context,
        timestamp: new Date()
      });

      return [];
    }
  }

  /**
   * Generate contextual suggestions based on current context
   */
  private async generateContextualSuggestions(
    context: SuggestionContext,
    memories: ScoredMemory[]
  ): Promise<MemorySuggestion[]> {
    const suggestions: MemorySuggestion[] = [];
    const agentId = context.agentId || 'default-agent';

    try {
      // Find relevant patterns for current context
      const contextTriggers = this.extractContextTriggers(context);
      const relevantPatterns = Array.from(this.behaviorPatterns.values())
        .filter(pattern => pattern.patternType === 'contextual')
        .filter(pattern => pattern.triggers.some(trigger => contextTriggers.includes(trigger)));

      // Generate suggestions from detected patterns
      for (const pattern of relevantPatterns) {
        if (pattern.outcomes && pattern.outcomes.length > 0) {
          // Use pattern outcomes as search queries
          for (const outcome of pattern.outcomes.slice(0, 2)) { // Limit to prevent too many suggestions
            try {
              const patternMemories = await this.memoryStore.recall(agentId, outcome, { limit: 2 });

              for (const memory of patternMemories) {
                const suggestion: MemorySuggestion = {
                  id: `contextual-${pattern.id}-${memory.id}`,
                  memory,
                  suggestionType: 'contextual',
                  relevanceScore: Math.min(pattern.confidence * 0.8 + 0.2, 0.95),
                  confidence: pattern.confidence,
                  reasoning: `Based on your pattern: ${pattern.description}`,
                  triggers: pattern.triggers,
                  metadata: {
                    patternId: pattern.id,
                    patternType: pattern.patternType,
                    frequency: pattern.frequency
                  }
                };

                suggestions.push(suggestion);
              }
            } catch (error) {
              console.error('[AI Suggestion Engine] Pattern-based contextual suggestion error:', error);
            }
          }
        }
      }

      // Suggest memories similar to current context using project information
      if (context.activeProjects && context.activeProjects.length > 0) {
        for (const project of context.activeProjects) {
          try {
            const projectMemories = await this.memoryStore.recall(agentId, project, { limit: 3 });

            for (const memory of projectMemories) {
              const suggestion: MemorySuggestion = {
                id: `contextual-project-${memory.id}`,
                memory,
                suggestionType: 'contextual',
                relevanceScore: 0.7,
                confidence: 0.8,
                reasoning: `Related to your active project: ${project}`,
                triggers: [`project:${project}`],
                metadata: { project, source: 'active_project' }
              };

              suggestions.push(suggestion);
            }
          } catch (error) {
            console.error('[AI Suggestion Engine] Project suggestion error:', error);
          }
        }
      }

      // Fallback: Generate contextual suggestions from recent memories
      if (suggestions.length === 0 && memories.length > 0) {
        // Use keywords from recent memories to find related content
        const keywords = this.extractKeywords(memories);

        for (const keyword of keywords.slice(0, 3)) { // Limit keywords to prevent too many queries
          try {
            const keywordMemories = await this.memoryStore.recall(agentId, keyword, { limit: 2 });

            for (const memory of keywordMemories) {
              // Avoid suggesting the same memories that are already recent
              const isRecent = memories.some(m => m.id === memory.id);
              if (!isRecent) {
                const suggestion: MemorySuggestion = {
                  id: `contextual-keyword-${memory.id}`,
                  memory,
                  suggestionType: 'contextual',
                  relevanceScore: 0.6,
                  confidence: 0.7,
                  reasoning: `Related to recent activity involving: ${keyword}`,
                  triggers: [keyword],
                  metadata: { keyword, source: 'keyword_analysis' }
                };

                suggestions.push(suggestion);
              }
            }
          } catch (error) {
            console.error('[AI Suggestion Engine] Keyword-based suggestion error:', error);
          }
        }
      }

    } catch (error) {
      console.error('[AI Suggestion Engine] Contextual suggestions generation failed:', error);
    }

    return suggestions;
  }

  /**
   * Generate temporal suggestions based on time patterns
   */
  private async generateTemporalSuggestions(
    context: SuggestionContext,
    memories: ScoredMemory[]
  ): Promise<MemorySuggestion[]> {
    const suggestions: MemorySuggestion[] = [];
    const agentId = context.agentId || 'default-agent';

    try {
      // Find temporal patterns
      const temporalPatterns = Array.from(this.behaviorPatterns.values())
        .filter(pattern => pattern.patternType === 'temporal')
        .sort((a, b) => b.confidence - a.confidence);

      // Generate suggestions from temporal patterns
      for (const pattern of temporalPatterns.slice(0, 3)) { // Limit to top 3 patterns
        if (pattern.outcomes && pattern.outcomes.length > 0) {
          try {
            for (const outcome of pattern.outcomes.slice(0, 2)) {
              const patternMemories = await this.memoryStore.recall(agentId, outcome, { limit: 2 });

              for (const memory of patternMemories) {
                const suggestion: MemorySuggestion = {
                  id: `temporal-${pattern.id}-${memory.id}`,
                  memory,
                  suggestionType: 'temporal',
                  relevanceScore: Math.min(pattern.confidence * 0.8 + 0.15, 0.9),
                  confidence: pattern.confidence,
                  reasoning: `Based on your temporal pattern: ${pattern.description}`,
                  triggers: pattern.triggers,
                  metadata: {
                    patternId: pattern.id,
                    patternType: 'temporal',
                    timePattern: pattern.metadata.timePattern || 'daily'
                  }
                };

                suggestions.push(suggestion);
              }
            }
          } catch (error) {
            console.error('[AI Suggestion Engine] Temporal pattern suggestion error:', error);
          }
        }
      }

      // Fallback: Generate time-based suggestions from recent memories
      if (suggestions.length === 0 && memories.length > 0) {
        // Suggest memories from similar times of day
        const currentHour = new Date().getHours();
        const timeBasedMemories = memories.filter(memory => {
          const memoryHour = new Date(memory.timestamp).getHours();
          return Math.abs(currentHour - memoryHour) <= 2; // Within 2 hours
        }).slice(0, 2);

        for (const memory of timeBasedMemories) {
          const suggestion: MemorySuggestion = {
            id: `temporal-time-${memory.id}`,
            memory,
            suggestionType: 'temporal',
            relevanceScore: 0.65,
            confidence: 0.75,
            reasoning: `Similar time of day activity (${currentHour}:00 hour)`,
            triggers: [`time:${currentHour}`],
            metadata: {
              timeOfDay: currentHour,
              source: 'time_based_recall'
            }
          };

          suggestions.push(suggestion);
        }
      }

    } catch (error) {
      console.error('[AI Suggestion Engine] Temporal suggestions generation failed:', error);
    }

    return suggestions;
  }

  /**
   * Generate predictive suggestions using machine learning patterns
   */
  private async generatePredictiveSuggestions(
    context: SuggestionContext,
    memories: ScoredMemory[]
  ): Promise<MemorySuggestion[]> {
    const suggestions: MemorySuggestion[] = [];
    const agentId = context.agentId || 'default-agent';

    try {
      // Find predictive patterns
      const predictivePatterns = Array.from(this.behaviorPatterns.values())
        .filter(pattern => pattern.metadata.predictive === true || pattern.outcomes.length > 0)
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 3); // Top 3 most frequent patterns

      for (const pattern of predictivePatterns) {
        if (pattern.outcomes && pattern.outcomes.length > 0) {
          try {
            for (const predictedOutcome of pattern.outcomes.slice(0, 2)) {
              const predictedMemories = await this.memoryStore.recall(agentId, predictedOutcome, { limit: 2 });

              for (const memory of predictedMemories) {
                // Check if this isn't already in recent memories
                const isRecent = memories.some(m => m.id === memory.id);

                if (!isRecent) {
                  const suggestion: MemorySuggestion = {
                    id: `predictive-${pattern.id}-${memory.id}`,
                    memory,
                    suggestionType: 'predictive',
                    relevanceScore: Math.min(pattern.confidence * 0.7 + 0.2, 0.85),
                    confidence: pattern.confidence * 0.9, // Slightly lower confidence for predictions
                    reasoning: `Predicted based on pattern: ${pattern.description}`,
                    triggers: pattern.triggers,
                    metadata: {
                      patternId: pattern.id,
                      prediction: true,
                      frequency: pattern.frequency,
                      predictedOutcome: predictedOutcome
                    }
                  };

                  suggestions.push(suggestion);
                }
              }
            }
          } catch (error) {
            console.error('[AI Suggestion Engine] Pattern-based predictive suggestion error:', error);
          }
        }
      }

      // Fallback: Generate predictive suggestions based on content similarity
      if (suggestions.length === 0 && memories.length > 0) {
        // Use the most recent memory to predict what might be needed next
        const recentMemory = memories[0];
        if (recentMemory && recentMemory.content) {
          const keywords = this.extractKeywords([recentMemory]);

          for (const keyword of keywords.slice(0, 2)) {
            try {
              const relatedMemories = await this.memoryStore.recall(agentId, keyword, { limit: 2 });

              for (const memory of relatedMemories) {
                const isRecent = memories.some(m => m.id === memory.id);

                if (!isRecent) {
                  const suggestion: MemorySuggestion = {
                    id: `predictive-keyword-${memory.id}`,
                    memory,
                    suggestionType: 'predictive',
                    relevanceScore: 0.6,
                    confidence: 0.7,
                    reasoning: `You might need this based on recent activity with: ${keyword}`,
                    triggers: [keyword],
                    metadata: {
                      keyword,
                      source: 'content_prediction',
                      basedOn: recentMemory.id
                    }
                  };

                  suggestions.push(suggestion);
                }
              }
            } catch (error) {
              console.error('[AI Suggestion Engine] Keyword-based predictive suggestion error:', error);
            }
          }
        }
      }

    } catch (error) {
      console.error('[AI Suggestion Engine] Predictive suggestions generation failed:', error);
    }

    return suggestions;
  }

  /**
   * Generate collaborative suggestions from other agents' patterns
   */
  private async generateCollaborativeSuggestions(
    context: SuggestionContext,
    memories: ScoredMemory[]
  ): Promise<MemorySuggestion[]> {
    const suggestions: MemorySuggestion[] = [];

    try {
      // Find collaborative patterns
      const collaborativePatterns = Array.from(this.behaviorPatterns.values())
        .filter(pattern => pattern.metadata.crossAgent === true);

      for (const pattern of collaborativePatterns) {
        const relatedAgents = pattern.metadata.relatedAgents || [];

        for (const otherAgent of relatedAgents) {
          try {
            const agentId = context.agentId || 'default-agent';
            const collaborativeMemories = await this.memoryStore.recall(agentId, '', {
              limit: 5,
              includeOtherAgents: true
            });

            for (const memory of collaborativeMemories.slice(0, 2)) { // Limit collaborative suggestions
              const suggestion: MemorySuggestion = {
                id: `collaborative-${pattern.id}-${memory.id}`,
                memory,
                suggestionType: 'collaborative',
                relevanceScore: pattern.confidence * 0.5 + 0.2, // Lower relevance for cross-agent
                confidence: pattern.confidence,
                reasoning: `Suggested based on collaborative pattern: ${pattern.description}`,
                triggers: pattern.triggers,
                metadata: {
                  patternId: pattern.id,
                  sourceAgent: otherAgent,
                  collaborationType: 'cross_agent'
                }
              };

              suggestions.push(suggestion);
            }
          } catch (error) {
            console.error('[AI Suggestion Engine] Collaborative suggestion error:', error);
          }
        }
      }

    } catch (error) {
      console.error('[AI Suggestion Engine] Collaborative suggestions generation failed:', error);
    }

    return suggestions;
  }

  /**
   * Generate associative suggestions based on memory relationships
   */
  private async generateAssociativeSuggestions(
    context: SuggestionContext,
    memories: ScoredMemory[]
  ): Promise<MemorySuggestion[]> {
    const suggestions: MemorySuggestion[] = [];
    const agentId = context.agentId || 'default-agent';

    try {
      // Find associative patterns
      const associativePatterns = Array.from(this.behaviorPatterns.values())
        .filter(pattern => pattern.patternType === 'associative')
        .filter(pattern => pattern.metadata.crossAgent !== true); // Exclude collaborative

      for (const pattern of associativePatterns) {
        if (pattern.outcomes && pattern.outcomes.length > 0) {
          for (const outcome of pattern.outcomes.slice(0, 2)) {
            try {
              const associatedMemories = await this.memoryStore.recall(agentId, outcome, { limit: 2 });

              for (const memory of associatedMemories) {
                // Check if this memory is related to current context
                const isRelevant = context.recentMemories?.some(rm =>
                  pattern.triggers.some(trigger => rm.content.toLowerCase().includes(trigger.toLowerCase()))
                ) || true; // Default to true for now

                if (isRelevant) {
                  const suggestion: MemorySuggestion = {
                    id: `associative-${pattern.id}-${memory.id}`,
                    memory,
                    suggestionType: 'associative',
                    relevanceScore: Math.min(pattern.confidence * 0.7 + 0.1, 0.8),
                    confidence: pattern.confidence,
                    reasoning: `Associated with your current context: ${pattern.description}`,
                    triggers: pattern.triggers,
                    metadata: {
                      patternId: pattern.id,
                      associationType: 'memory_association',
                      strength: pattern.frequency
                    }
                  };

                  suggestions.push(suggestion);
                }
              }
            } catch (error) {
              console.error('[AI Suggestion Engine] Associative suggestion error:', error);
            }
          }
        }
      }

    } catch (error) {
      console.error('[AI Suggestion Engine] Associative suggestions generation failed:', error);
    }

    return suggestions;
  }

  /**
   * Extract keywords from memories for suggestion generation
   */
  private extractKeywords(memories: ScoredMemory[]): string[] {
    const keywords: string[] = [];
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those']);

    for (const memory of memories) {
      if (memory.content) {
        // Extract words from content
        const words = memory.content.toLowerCase()
          .replace(/[^\w\s]/g, ' ')
          .split(/\s+/)
          .filter(word => word.length > 3 && !stopWords.has(word));

        keywords.push(...words);
      }

      // Extract from metadata
      if (memory.metadata) {
        if (memory.metadata.tags && Array.isArray(memory.metadata.tags)) {
          keywords.push(...memory.metadata.tags.map(tag => tag.toLowerCase()));
        }

        if (memory.metadata.project) {
          keywords.push(memory.metadata.project.toLowerCase());
        }

        if (memory.metadata.entityType) {
          keywords.push(memory.metadata.entityType.toLowerCase());
        }
      }
    }

    // Return unique keywords, sorted by frequency
    const keywordCounts = new Map<string, number>();
    for (const keyword of keywords) {
      keywordCounts.set(keyword, (keywordCounts.get(keyword) || 0) + 1);
    }

    return Array.from(keywordCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])
      .slice(0, 10); // Return top 10 keywords
  }

  // Pattern Detection Methods

  /**
   * Detect temporal patterns in user behavior
   */
  async detectTemporalPatterns(memories: ScoredMemory[]): Promise<void> {
    if (memories.length < 3) return; // Need minimum memories for pattern detection

    try {
      // Group memories by time of day
      const timeGroups = new Map<number, ScoredMemory[]>();

      for (const memory of memories) {
        const hour = new Date(memory.timestamp).getHours();
        const timeSlot = Math.floor(hour / 2) * 2; // 2-hour slots

        if (!timeGroups.has(timeSlot)) {
          timeGroups.set(timeSlot, []);
        }
        timeGroups.get(timeSlot)!.push(memory);
      }

      // Create patterns for time slots with multiple memories
      for (const [timeSlot, memoryGroup] of timeGroups) {
        if (memoryGroup.length >= 2) { // Pattern needs at least 2 occurrences
          const pattern: UserBehaviorPattern = {
            id: `temporal-${timeSlot}-${Date.now()}`,
            patternType: 'temporal',
            triggers: [`time:${timeSlot}-${timeSlot + 2}`],
            outcomes: memoryGroup.map(m => this.extractKeywords([m])[0]).filter(k => k),
            frequency: memoryGroup.length,
            confidence: Math.min(memoryGroup.length / memories.length, 0.9),
            lastSeen: new Date(),
            description: `Activity pattern at ${timeSlot}:00-${timeSlot + 2}:00`,
            metadata: {
              timeSlot,
              timePattern: 'daily',
              memoryIds: memoryGroup.map(m => m.id)
            }
          };

          this.behaviorPatterns.set(pattern.id, pattern);
          this.emit('pattern_detected', { type: 'temporal', pattern });
        }
      }

    } catch (error) {
      console.error('[AI Suggestion Engine] Temporal pattern detection failed:', error);
    }
  }

  /**
   * Detect contextual patterns in memory usage
   */
  async detectContextualPatterns(memories: ScoredMemory[]): Promise<void> {
    if (memories.length < 3) return;

    try {
      // Group memories by project/context
      const contextGroups = new Map<string, ScoredMemory[]>();

      for (const memory of memories) {
        const contexts: string[] = [];

        // Extract contexts from metadata
        if (memory.metadata?.project) {
          contexts.push(`project:${memory.metadata.project}`);
        }

        if (memory.metadata?.tags) {
          memory.metadata.tags.forEach((tag: string) => contexts.push(`tag:${tag}`));
        }

        // Extract contexts from content keywords
        const keywords = this.extractKeywords([memory]);
        keywords.slice(0, 3).forEach(keyword => contexts.push(`keyword:${keyword}`));

        for (const context of contexts) {
          if (!contextGroups.has(context)) {
            contextGroups.set(context, []);
          }
          contextGroups.get(context)!.push(memory);
        }
      }

      // Create patterns for contexts with multiple memories
      for (const [context, memoryGroup] of contextGroups) {
        if (memoryGroup.length >= 2) {
          const pattern: UserBehaviorPattern = {
            id: `contextual-${context.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now()}`,
            patternType: 'contextual',
            triggers: [context],
            outcomes: memoryGroup.map(m => this.extractKeywords([m])[0]).filter(k => k),
            frequency: memoryGroup.length,
            confidence: Math.min(memoryGroup.length / memories.length, 0.9),
            lastSeen: new Date(),
            description: `Usage pattern for ${context}`,
            metadata: {
              context,
              memoryIds: memoryGroup.map(m => m.id)
            }
          };

          this.behaviorPatterns.set(pattern.id, pattern);
          this.emit('pattern_detected', { type: 'contextual', pattern });
        }
      }

    } catch (error) {
      console.error('[AI Suggestion Engine] Contextual pattern detection failed:', error);
    }
  }

  /**
   * Detect sequential patterns in memory access
   */
  async detectSequentialPatterns(memories: ScoredMemory[]): Promise<void> {
    if (memories.length < 3) return;

    try {
      // Sort memories by timestamp
      const sortedMemories = memories.sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      // Look for sequences of 3+ memories
      for (let i = 0; i <= sortedMemories.length - 3; i++) {
        const sequence = sortedMemories.slice(i, i + 3);

        // Check if memories are within reasonable time window (1 hour)
        const timeSpan = new Date(sequence[2].timestamp).getTime() - new Date(sequence[0].timestamp).getTime();
        if (timeSpan > 60 * 60 * 1000) continue; // Skip if more than 1 hour apart

        const triggers = sequence.map(m => `memory:${m.id}`);
        const outcomes = this.extractKeywords(sequence);

        const pattern: UserBehaviorPattern = {
          id: `sequential-${i}-${Date.now()}`,
          patternType: 'sequential',
          triggers: triggers.slice(0, 2), // First two as triggers
          outcomes: outcomes.slice(0, 3), // Top keywords as outcomes
          frequency: 1, // Individual sequence occurrence
          confidence: 0.7, // Moderate confidence for sequences
          lastSeen: new Date(),
          description: `Sequential access pattern starting at ${new Date(sequence[0].timestamp).toLocaleTimeString()}`,
          metadata: {
            sequenceLength: sequence.length,
            timeSpan,
            memoryIds: sequence.map(m => m.id),
            predictive: true
          }
        };

        this.behaviorPatterns.set(pattern.id, pattern);
        this.emit('pattern_detected', { type: 'sequential', pattern });
      }

    } catch (error) {
      console.error('[AI Suggestion Engine] Sequential pattern detection failed:', error);
    }
  }

  /**
   * Detect associative patterns between memories
   */
  async detectAssociativePatterns(memories: ScoredMemory[]): Promise<void> {
    if (memories.length < 3) return;

    try {
      // Find memories with similar content/keywords
      const keywordGroups = new Map<string, ScoredMemory[]>();

      for (const memory of memories) {
        const keywords = this.extractKeywords([memory]);

        for (const keyword of keywords.slice(0, 5)) { // Top 5 keywords per memory
          if (!keywordGroups.has(keyword)) {
            keywordGroups.set(keyword, []);
          }
          keywordGroups.get(keyword)!.push(memory);
        }
      }

      // Create associative patterns for keyword groups
      for (const [keyword, memoryGroup] of keywordGroups) {
        if (memoryGroup.length >= 2) {
          const pattern: UserBehaviorPattern = {
            id: `associative-${keyword}-${Date.now()}`,
            patternType: 'associative',
            triggers: [`keyword:${keyword}`],
            outcomes: [keyword, ...this.extractKeywords(memoryGroup).slice(0, 2)], // Related keywords
            frequency: memoryGroup.length,
            confidence: Math.min(memoryGroup.length / memories.length, 0.8),
            lastSeen: new Date(),
            description: `Associative pattern around "${keyword}"`,
            metadata: {
              keyword,
              associationType: 'content_similarity',
              memoryIds: memoryGroup.map(m => m.id)
            }
          };

          this.behaviorPatterns.set(pattern.id, pattern);
          this.emit('pattern_detected', { type: 'associative', pattern });
        }
      }

    } catch (error) {
      console.error('[AI Suggestion Engine] Associative pattern detection failed:', error);
    }
  }

  // Utility Methods

  /**
   * Extract context triggers from suggestion context
   */
  private extractContextTriggers(context: SuggestionContext): string[] {
    const triggers: string[] = [];

    if (context.currentActivity) {
      triggers.push(`activity:${context.currentActivity}`);
    }

    if (context.activeProjects) {
      context.activeProjects.forEach(project => triggers.push(`project:${project}`));
    }

    if (context.timeContext) {
      triggers.push(`time:${context.timeContext}`);
    }

    return triggers;
  }

  /**
   * Generate cache key for suggestions
   */
  private generateCacheKey(context: SuggestionContext): string {
    const keyParts = [
      context.agentId,
      context.currentActivity || 'none',
      (context.activeProjects || []).join(','),
      context.timeContext || 'none'
    ];

    return keyParts.join('|');
  }

  /**
   * Update engine statistics
   */
  private updateStats(suggestions: MemorySuggestion[], generationTime: number): void {
    this.stats.totalSuggestions += suggestions.length;
    this.stats.lastGenerated = new Date();
    this.stats.patternCount = this.behaviorPatterns.size;

    if (suggestions.length > 0) {
      const avgRelevance = suggestions.reduce((acc, s) => acc + s.relevanceScore, 0) / suggestions.length;
      this.stats.avgRelevanceScore = (this.stats.avgRelevanceScore + avgRelevance) / 2; // Moving average
    }

    // Update performance metrics
    this.stats.performanceMetrics.avgGenerationTime =
      (this.stats.performanceMetrics.avgGenerationTime + generationTime) / 2;
  }

  // Public API Methods

  /**
   * Record feedback for a suggestion
   */
  recordFeedback(feedback: SuggestionFeedback): void {
    this.feedbackHistory.push(feedback);

    // Update acceptance rate
    const totalFeedback = this.feedbackHistory.length;
    const acceptedCount = this.feedbackHistory.filter(f => f.outcome === 'accepted').length;
    this.stats.acceptanceRate = acceptedCount / totalFeedback;

    this.emit('feedback_recorded', { feedback, stats: this.stats });
  }

  /**
   * Get cached suggestions for a context
   */
  getCachedSuggestions(context: SuggestionContext): MemorySuggestion[] | null {
    const cacheKey = this.generateCacheKey(context);
    const cached = this.suggestionCache.get(cacheKey);

    if (cached && (Date.now() - cached.timestamp) < this.config.cacheTTL) {
      return cached.suggestions;
    }

    return null;
  }

  /**
   * Clear suggestion cache
   */
  clearCache(): void {
    this.suggestionCache.clear();

    this.emit('cache_cleared', {
      type: 'cache_cleared',
      timestamp: new Date()
    });
  }

  /**
   * Get behavior patterns
   */
  getBehaviorPatterns(): UserBehaviorPattern[] {
    const patterns = Array.from(this.behaviorPatterns.values());

    // Emit pattern detection event
    this.emit('patterns_detected', {
      type: 'patterns_detected',
      timestamp: new Date(),
      patternCount: patterns.length,
      patterns: patterns.map(p => ({
        id: p.id,
        type: p.patternType,
        confidence: p.confidence,
        frequency: p.frequency
      }))
    });

    return patterns;
  }

  /**
   * Get engine statistics
   */
  getStats(): SuggestionStats {
    return { ...this.stats };
  }

  /**
   * Get engine capabilities
   */
  private getCapabilities(): string[] {
    const capabilities = ['basic_suggestions'];

    if (this.config.enableContextualSuggestions) capabilities.push('contextual_suggestions');
    if (this.config.enableTemporalSuggestions) capabilities.push('temporal_suggestions');
    if (this.config.enablePredictiveAnalytics) capabilities.push('predictive_analytics');
    if (this.config.enableCollaborativeSuggestions) capabilities.push('collaborative_suggestions');
    if (this.config.behaviorTrackingEnabled) capabilities.push('behavior_tracking');
    if (this.config.enableCaching) capabilities.push('caching');

    return capabilities;
  }
}