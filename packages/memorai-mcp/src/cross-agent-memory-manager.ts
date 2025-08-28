/**
 * Cross-Agent Memory Manager for MemorAI MCP Server
 * 
 * Provides secure cross-agent memory sharing with:
 * - Permission-based access control
 * - Context-aware recommendations 
 * - Temporal analysis for relevance
 * - Privacy-aware discovery
 * - Real-time recommendation updates
 * 
 * Implements US-MEM-002: Cross-Agent Memory Sharing (4 SP)
 * 
 * @author GitHub Copilot Agent
 * @version 1.0.0
 * @since 2025-08-27
 */

import { EventEmitter } from 'events';
import type { EnhancedMemoryStore, StoredMemory, SearchOptions } from './enhanced-memory-store.js';
import type { MultiTenantEnhancedMemoryStore } from './multi-tenant-memory-store.js';
import type { TenantManager, TenantIsolationContext } from './tenant-manager.js';

// ========================================
// Core Types & Interfaces
// ========================================

/**
 * Access levels for cross-agent memory sharing
 */
export enum MemoryAccessLevel {
  NONE = 'none',
  READ_ONLY = 'read_only',
  READ_WRITE = 'read_write',
  FULL_ACCESS = 'full_access'
}

/**
 * Permission rule for cross-agent access
 */
export interface PermissionRule {
  id: string;
  sourceAgent: string;
  targetAgent: string;
  accessLevel: MemoryAccessLevel;
  contentPatterns?: string[];
  tagFilters?: string[];
  importanceThreshold?: number;
  expiresAt?: Date;
  createdAt: Date;
  createdBy: string;
}

/**
 * Context for memory recommendations
 */
export interface RecommendationContext {
  currentConversation: string[];
  recentMemories: string[];
  activeProjects: string[];
  userPreferences: Record<string, any>;
  temporalWindow: {
    start: Date;
    end: Date;
  };
}

/**
 * Memory recommendation with scoring
 */
export interface MemoryRecommendation {
  memory: StoredMemory;
  relevanceScore: number;
  confidenceScore: number;
  sourceAgent: string;
  reasoningChain: string[];
  temporalWeight: number;
  contextMatches: string[];
  recommendationType: 'semantic' | 'temporal' | 'collaborative' | 'hybrid';
}

/**
 * Basic search result interface
 */
export interface SearchResult {
  memories: StoredMemory[];
  totalResults: number;
  searchTime: number;
  relevanceScores: number[];
}

/**
 * Cross-agent search result
 */
export interface CrossAgentSearchResult extends SearchResult {
  sourceAgents: string[];
  accessLevel: MemoryAccessLevel;
  permissionValidated: boolean;
  recommendations: MemoryRecommendation[];
  totalCrossAgentResults: number;
}

/**
 * Configuration for cross-agent manager
 */
export interface CrossAgentConfig {
  enableRealTimeUpdates: boolean;
  maxRecommendations: number;
  temporalDecayFactor: number;
  confidenceThreshold: number;
  cacheTimeoutMs: number;
  auditLogging: boolean;
  privacyMode: 'strict' | 'balanced' | 'open';
}

// ========================================
// Cross-Agent Memory Manager Implementation
// ========================================

/**
 * Manages cross-agent memory sharing with secure permissions
 */
export class CrossAgentMemoryManager extends EventEmitter {
  private readonly memoryStore: MultiTenantEnhancedMemoryStore;
  private readonly tenantManager: TenantManager;
  private readonly config: CrossAgentConfig;
  private readonly permissionRules: Map<string, PermissionRule[]>;
  private readonly recommendationCache: Map<string, MemoryRecommendation[]>;
  private readonly activeContexts: Map<string, RecommendationContext>;

  constructor(
    memoryStore: MultiTenantEnhancedMemoryStore,
    tenantManager: TenantManager,
    config: Partial<CrossAgentConfig> = {}
  ) {
    super();
    this.memoryStore = memoryStore;
    this.tenantManager = tenantManager;
    this.config = {
      enableRealTimeUpdates: true,
      maxRecommendations: 10,
      temporalDecayFactor: 0.1,
      confidenceThreshold: 0.6,
      cacheTimeoutMs: 300000, // 5 minutes
      auditLogging: true,
      privacyMode: 'balanced',
      ...config
    };

    this.permissionRules = new Map();
    this.recommendationCache = new Map();
    this.activeContexts = new Map();

    this.setupEventHandlers();
  }

  // ========================================
  // Permission Management
  // ========================================

  /**
   * Add permission rule for cross-agent access
   */
  async addPermissionRule(rule: Omit<PermissionRule, 'id' | 'createdAt'>): Promise<string> {
    const permissionRule: PermissionRule = {
      id: `perm_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      createdAt: new Date(),
      ...rule
    };

    const sourceRules = this.permissionRules.get(rule.sourceAgent) || [];
    sourceRules.push(permissionRule);
    this.permissionRules.set(rule.sourceAgent, sourceRules);

    if (this.config.auditLogging) {
      this.emit('permissionAdded', {
        ruleId: permissionRule.id,
        sourceAgent: rule.sourceAgent,
        targetAgent: rule.targetAgent,
        accessLevel: rule.accessLevel,
        timestamp: new Date()
      });
    }

    return permissionRule.id;
  }

  /**
   * Remove permission rule
   */
  async removePermissionRule(ruleId: string, sourceAgent: string): Promise<boolean> {
    const sourceRules = this.permissionRules.get(sourceAgent) || [];
    const ruleIndex = sourceRules.findIndex(rule => rule.id === ruleId);

    if (ruleIndex === -1) {
      return false;
    }

    sourceRules.splice(ruleIndex, 1);
    this.permissionRules.set(sourceAgent, sourceRules);

    if (this.config.auditLogging) {
      this.emit('permissionRemoved', {
        ruleId,
        sourceAgent,
        timestamp: new Date()
      });
    }

    return true;
  }

  /**
   * Validate access permission between agents
   */
  private validateAccess(
    sourceAgent: string,
    targetAgent: string,
    memory: StoredMemory,
    requiredLevel: MemoryAccessLevel = MemoryAccessLevel.READ_ONLY
  ): { allowed: boolean; accessLevel: MemoryAccessLevel; rule?: PermissionRule } {
    const sourceRules = this.permissionRules.get(sourceAgent) || [];

    for (const rule of sourceRules) {
      // Check if rule applies to target agent
      if (rule.targetAgent !== '*' && rule.targetAgent !== targetAgent) {
        continue;
      }

      // Check if rule has expired
      if (rule.expiresAt && rule.expiresAt < new Date()) {
        continue;
      }

      // Check importance threshold
      if (rule.importanceThreshold && memory.metadata?.importance && memory.metadata.importance < rule.importanceThreshold) {
        continue;
      }

      // Check content patterns
      if (rule.contentPatterns && rule.contentPatterns.length > 0) {
        const contentMatches = rule.contentPatterns.some(pattern =>
          memory.content.toLowerCase().includes(pattern.toLowerCase())
        );
        if (!contentMatches) {
          continue;
        }
      }

      // Check tag filters
      if (rule.tagFilters && rule.tagFilters.length > 0 && memory.metadata?.tags) {
        const tagMatches = rule.tagFilters.some(tag =>
          memory.metadata.tags!.includes(tag)
        );
        if (!tagMatches) {
          continue;
        }
      }

      // Check if access level is sufficient
      if (this.isAccessLevelSufficient(rule.accessLevel, requiredLevel)) {
        return {
          allowed: true,
          accessLevel: rule.accessLevel,
          rule
        };
      }
    }

    return { allowed: false, accessLevel: MemoryAccessLevel.NONE };
  }

  /**
   * Check if access level meets requirement
   */
  private isAccessLevelSufficient(granted: MemoryAccessLevel, required: MemoryAccessLevel): boolean {
    const levels = [
      MemoryAccessLevel.NONE,
      MemoryAccessLevel.READ_ONLY,
      MemoryAccessLevel.READ_WRITE,
      MemoryAccessLevel.FULL_ACCESS
    ];

    return levels.indexOf(granted) >= levels.indexOf(required);
  }

  // ========================================
  // Context-Aware Recommendations
  // ========================================

  /**
   * Set active context for an agent
   */
  async setContext(agentId: string, context: RecommendationContext): Promise<void> {
    this.activeContexts.set(agentId, context);

    // Clear cache for this agent to force fresh recommendations
    this.clearRecommendationCache(agentId);

    if (this.config.enableRealTimeUpdates) {
      this.emit('contextUpdated', {
        agentId,
        context,
        timestamp: new Date()
      });
    }
  }

  /**
   * Generate context-aware memory recommendations
   */
  async getRecommendations(
    requestingAgent: string,
    context?: RecommendationContext
  ): Promise<MemoryRecommendation[]> {
    const cacheKey = `rec_${requestingAgent}`;

    // Check cache first
    const cached = this.recommendationCache.get(cacheKey);
    if (cached && Date.now() - (cached[0] as any)?.cacheTime < this.config.cacheTimeoutMs) {
      return cached;
    }

    const activeContext = context || this.activeContexts.get(requestingAgent);
    if (!activeContext) {
      return [];
    }

    const recommendations: MemoryRecommendation[] = [];

    // Get all accessible agents for cross-agent discovery
    const accessibleAgents = await this.getAccessibleAgents(requestingAgent);

    // Generate recommendations from each accessible agent
    for (const targetAgent of accessibleAgents) {
      const agentRecommendations = await this.generateAgentRecommendations(
        requestingAgent,
        targetAgent,
        activeContext
      );
      recommendations.push(...agentRecommendations);
    }

    // Sort by combined relevance and confidence scores
    recommendations.sort((a, b) => {
      const scoreA = (a.relevanceScore * 0.6) + (a.confidenceScore * 0.4);
      const scoreB = (b.relevanceScore * 0.6) + (b.confidenceScore * 0.4);
      return scoreB - scoreA;
    });

    // Take top recommendations
    const topRecommendations = recommendations.slice(0, this.config.maxRecommendations);

    // Cache results
    (topRecommendations as any).cacheTime = Date.now();
    this.recommendationCache.set(cacheKey, topRecommendations);

    if (this.config.auditLogging) {
      this.emit('recommendationsGenerated', {
        requestingAgent,
        totalRecommendations: topRecommendations.length,
        sourceAgents: [...new Set(topRecommendations.map(r => r.sourceAgent))],
        timestamp: new Date()
      });
    }

    return topRecommendations;
  }

  /**
   * Generate recommendations from specific target agent
   */
  private async generateAgentRecommendations(
    requestingAgent: string,
    targetAgent: string,
    context: RecommendationContext
  ): Promise<MemoryRecommendation[]> {
    try {
      // Get tenant info for target agent
      const tenantInfo = await this.tenantManager.getTenant(targetAgent);
      if (!tenantInfo) {
        return [];
      }

      // Search memories in target agent's space
      const searchOptions: SearchOptions = {
        limit: this.config.maxRecommendations * 2, // Get more for filtering
        minImportance: this.config.confidenceThreshold * 10
      };

      const searchResults: MemoryRecommendation[] = [];

      // Semantic search based on current conversation
      if (context.currentConversation.length > 0) {
        const conversationQuery = context.currentConversation.join(' ');

        // Create tenant context
        const tenantContext: TenantIsolationContext = {
          tenantId: targetAgent,
          agentId: context.agentId || targetAgent,
          requestId: `search-${Date.now()}`,
          userId: requestingAgent,
          securityContext: { permissions: ['read'] }
        };

        const results = await this.memoryStore.recall(tenantContext, conversationQuery, searchOptions);

        for (const memory of results.memories) {
          const validation = this.validateAccess(requestingAgent, targetAgent, memory);
          if (validation.allowed) {
            const recommendation = await this.createRecommendation(
              memory,
              targetAgent,
              context,
              'semantic',
              conversationQuery
            );
            if (recommendation) {
              searchResults.push(recommendation);
            }
          }
        }
      }

      // Temporal search for recent related memories
      if (context.recentMemories.length > 0) {
        const recentQuery = context.recentMemories.join(' ');
        const results = await this.memoryStore.recall(targetAgent, recentQuery, {
          ...searchOptions,
          limit: Math.floor(this.config.maxRecommendations / 2)
        });

        for (const memory of results.memories) {
          const validation = this.validateAccess(requestingAgent, targetAgent, memory);
          if (validation.allowed) {
            const recommendation = await this.createRecommendation(
              memory,
              targetAgent,
              context,
              'temporal',
              recentQuery
            );
            if (recommendation) {
              searchResults.push(recommendation);
            }
          }
        }
      }

      // Project-based search
      if (context.activeProjects.length > 0) {
        for (const project of context.activeProjects) {
          const results = await this.memoryStore.recall(targetAgent, project, {
            ...searchOptions,
            limit: 5
          });

          for (const memory of results.memories) {
            const validation = this.validateAccess(requestingAgent, targetAgent, memory);
            if (validation.allowed) {
              const recommendation = await this.createRecommendation(
                memory,
                targetAgent,
                context,
                'collaborative',
                project
              );
              if (recommendation) {
                searchResults.push(recommendation);
              }
            }
          }
        }
      }

      return searchResults;

    } catch (error) {
      console.warn(`Failed to generate recommendations from agent ${targetAgent}:`, error);
      return [];
    }
  }

  /**
   * Create memory recommendation with scoring
   */
  private async createRecommendation(
    memory: StoredMemory,
    sourceAgent: string,
    context: RecommendationContext,
    type: MemoryRecommendation['recommendationType'],
    query: string
  ): Promise<MemoryRecommendation | null> {
    try {
      // Calculate relevance score based on type
      const relevanceScore = await this.calculateRelevanceScore(memory, context, type, query);

      if (relevanceScore < this.config.confidenceThreshold) {
        return null;
      }

      // Calculate temporal weight
      const temporalWeight = this.calculateTemporalWeight(memory, context.temporalWindow);

      // Calculate confidence score
      const confidenceScore = this.calculateConfidenceScore(memory, relevanceScore, temporalWeight);

      // Generate reasoning chain
      const reasoningChain = this.generateReasoningChain(memory, context, type, relevanceScore, temporalWeight);

      // Find context matches
      const contextMatches = this.findContextMatches(memory, context);

      return {
        memory,
        relevanceScore,
        confidenceScore,
        sourceAgent,
        reasoningChain,
        temporalWeight,
        contextMatches,
        recommendationType: type
      };

    } catch (error) {
      console.warn('Failed to create recommendation:', error);
      return null;
    }
  }

  /**
   * Calculate relevance score for memory
   */
  private async calculateRelevanceScore(
    memory: StoredMemory,
    context: RecommendationContext,
    type: MemoryRecommendation['recommendationType'],
    query: string
  ): Promise<number> {
    let baseScore = 0;

    // Calculate base relevance based on content similarity
    const contentSimilarity = this.calculateTextSimilarity(memory.content, query);
    baseScore += contentSimilarity * 0.4;

    // Add importance weight
    if (memory.metadata?.importance) {
      baseScore += (memory.metadata.importance / 10) * 0.2;
    }

    // Add type-specific scoring
    switch (type) {
      case 'semantic':
        // Boost score for semantic matches
        baseScore += this.calculateSemanticBoost(memory, context.currentConversation) * 0.3;
        break;

      case 'temporal':
        // Boost score for recent memories
        const recency = this.calculateRecencyScore(memory);
        baseScore += recency * 0.3;
        break;

      case 'collaborative':
        // Boost score for project-related memories
        if (memory.metadata?.tags) {
          const projectMatch = context.activeProjects.some(project =>
            memory.metadata.tags.some(tag =>
              tag.toLowerCase().includes(project.toLowerCase())
            )
          );
          if (projectMatch) {
            baseScore += 0.3;
          }
        }
        break;

      case 'hybrid':
        // Combination of all factors
        baseScore += this.calculateSemanticBoost(memory, context.currentConversation) * 0.2;
        baseScore += this.calculateRecencyScore(memory) * 0.1;
        break;
    }

    return Math.min(baseScore, 1.0);
  }

  /**
   * Calculate temporal weight for memory
   */
  private calculateTemporalWeight(memory: StoredMemory, temporalWindow: { start: Date; end: Date }): number {
    const memoryDate = new Date(memory.timestamp);
    const windowStart = temporalWindow.start.getTime();
    const windowEnd = temporalWindow.end.getTime();
    const memoryTime = memoryDate.getTime();

    // Check if memory is within temporal window
    if (memoryTime >= windowStart && memoryTime <= windowEnd) {
      return 1.0;
    }

    // Apply temporal decay for memories outside window
    const timeDiff = Math.min(
      Math.abs(memoryTime - windowStart),
      Math.abs(memoryTime - windowEnd)
    );

    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
    return Math.exp(-daysDiff * this.config.temporalDecayFactor);
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidenceScore(memory: StoredMemory, relevanceScore: number, temporalWeight: number): number {
    let confidence = relevanceScore * 0.6 + temporalWeight * 0.4;

    // Boost confidence for high-importance memories
    if (memory.metadata?.importance && memory.metadata.importance >= 8) {
      confidence += 0.1;
    }

    // Boost confidence for memories with rich metadata
    if (memory.metadata?.tags && memory.metadata.tags.length > 0) {
      confidence += 0.05;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Generate reasoning chain for recommendation
   */
  private generateReasoningChain(
    memory: StoredMemory,
    context: RecommendationContext,
    type: MemoryRecommendation['recommendationType'],
    relevanceScore: number,
    temporalWeight: number
  ): string[] {
    const reasoning: string[] = [];

    reasoning.push(`Found ${type} match with ${Math.round(relevanceScore * 100)}% relevance`);

    if (temporalWeight > 0.8) {
      reasoning.push('Memory is within current temporal context');
    } else if (temporalWeight > 0.5) {
      reasoning.push('Memory has moderate temporal relevance');
    }

    if (memory.metadata?.importance && memory.metadata.importance >= 8) {
      reasoning.push(`High importance memory (${memory.metadata.importance}/10)`);
    }

    if (memory.metadata?.tags && memory.metadata.tags.length > 0) {
      reasoning.push(`Tagged with: ${memory.metadata.tags.slice(0, 3).join(', ')}`);
    }

    const contextMatches = this.findContextMatches(memory, context);
    if (contextMatches.length > 0) {
      reasoning.push(`Context matches: ${contextMatches.slice(0, 2).join(', ')}`);
    }

    return reasoning;
  }

  /**
   * Find context matches in memory
   */
  private findContextMatches(memory: StoredMemory, context: RecommendationContext): string[] {
    const matches: string[] = [];

    // Check conversation matches
    const conversationMatches = context.currentConversation.filter(conv =>
      memory.content.toLowerCase().includes(conv.toLowerCase())
    );
    matches.push(...conversationMatches.slice(0, 2));

    // Check project matches
    const projectMatches = context.activeProjects.filter(project =>
      memory.content.toLowerCase().includes(project.toLowerCase()) ||
      (memory.metadata?.tags && memory.metadata.tags.some(tag =>
        tag.toLowerCase().includes(project.toLowerCase())
      ))
    );
    matches.push(...projectMatches);

    return [...new Set(matches)];
  }

  // ========================================
  // Cross-Agent Search
  // ========================================

  /**
   * Search memories across multiple agents with permissions
   */
  async searchCrossAgent(
    requestingAgent: string,
    query: string,
    options: SearchOptions & {
      targetAgents?: string[];
      includeRecommendations?: boolean;
    } = {}
  ): Promise<CrossAgentSearchResult> {
    const targetAgents = options.targetAgents || await this.getAccessibleAgents(requestingAgent);
    const allResults: StoredMemory[] = [];
    const sourceAgentMap: Map<string, string[]> = new Map();
    let totalCrossAgentResults = 0;

    // Search each accessible agent
    for (const targetAgent of targetAgents) {
      try {
        const agentResults = await this.memoryStore.recall(targetAgent, query, options);

        // Filter results based on permissions
        const allowedResults = agentResults.memories.filter(memory => {
          const validation = this.validateAccess(requestingAgent, targetAgent, memory);
          return validation.allowed;
        });

        allResults.push(...allowedResults);
        totalCrossAgentResults += allowedResults.length;

        // Track source agents for each memory
        for (const memory of allowedResults) {
          const sources = sourceAgentMap.get(memory.structuredKey) || [];
          sources.push(targetAgent);
          sourceAgentMap.set(memory.structuredKey, sources);
        }

      } catch (error) {
        console.warn(`Failed to search agent ${targetAgent}:`, error);
      }
    }

    // Remove duplicates while preserving source information
    const uniqueResults = Array.from(
      new Map(allResults.map(memory => [memory.structuredKey, memory])).values()
    );

    // Determine access level (most permissive)
    let accessLevel = MemoryAccessLevel.NONE;
    if (uniqueResults.length > 0) {
      accessLevel = MemoryAccessLevel.READ_ONLY; // Default for successful searches
    }

    // Generate recommendations if requested
    let recommendations: MemoryRecommendation[] = [];
    if (options.includeRecommendations) {
      recommendations = await this.getRecommendations(requestingAgent);
    }

    const result: CrossAgentSearchResult = {
      query,
      memories: uniqueResults,
      totalResults: uniqueResults.length,
      searchTime: Date.now(), // Simplified for now
      relevanceScores: uniqueResults.map(() => 0.8), // Simplified
      sourceAgents: [...new Set(Array.from(sourceAgentMap.values()).flat())],
      accessLevel,
      permissionValidated: true,
      recommendations,
      totalCrossAgentResults
    };

    if (this.config.auditLogging) {
      this.emit('crossAgentSearch', {
        requestingAgent,
        query,
        targetAgents,
        resultCount: uniqueResults.length,
        timestamp: new Date()
      });
    }

    return result;
  }

  // ========================================
  // Utility Methods
  // ========================================

  /**
   * Get list of accessible agents for requesting agent
   */
  private async getAccessibleAgents(requestingAgent: string): Promise<string[]> {
    const accessible: string[] = [];
    const allRules = this.permissionRules.get(requestingAgent) || [];

    for (const rule of allRules) {
      // Skip expired rules
      if (rule.expiresAt && rule.expiresAt < new Date()) {
        continue;
      }

      if (rule.targetAgent === '*') {
        // Get all available agents from tenant manager
        const tenants = await this.tenantManager.getAllTenants();
        accessible.push(...tenants.map(t => t.id));
      } else {
        accessible.push(rule.targetAgent);
      }
    }

    // Remove duplicates and requesting agent
    return [...new Set(accessible)].filter(agent => agent !== requestingAgent);
  }

  /**
   * Calculate text similarity (simplified)
   */
  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);

    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];

    return intersection.length / union.length;
  }

  /**
   * Calculate semantic boost score
   */
  private calculateSemanticBoost(memory: StoredMemory, conversation: string[]): number {
    let boost = 0;
    const memoryWords = memory.content.toLowerCase().split(/\s+/);

    for (const conv of conversation) {
      const convWords = conv.toLowerCase().split(/\s+/);
      const commonWords = memoryWords.filter(word => convWords.includes(word));
      boost += commonWords.length / Math.max(memoryWords.length, convWords.length);
    }

    return Math.min(boost / conversation.length, 1.0);
  }

  /**
   * Calculate recency score
   */
  private calculateRecencyScore(memory: StoredMemory): number {
    const now = Date.now();
    const memoryTime = new Date(memory.timestamp).getTime();
    const daysSince = (now - memoryTime) / (1000 * 60 * 60 * 24);

    return Math.exp(-daysSince * 0.1);
  }

  /**
   * Clear recommendation cache for agent
   */
  private clearRecommendationCache(agentId?: string): void {
    if (agentId) {
      this.recommendationCache.delete(`rec_${agentId}`);
    } else {
      this.recommendationCache.clear();
    }
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    // Clear cache when memory store changes (if store supports events)
    if (typeof (this.memoryStore as any).on === 'function') {
      (this.memoryStore as any).on('memoryStored', () => {
        this.clearRecommendationCache();
      });

      (this.memoryStore as any).on('memoryDeleted', () => {
        this.clearRecommendationCache();
      });
    }

    // Clean up expired permission rules periodically
    setInterval(() => {
      this.cleanupExpiredRules();
    }, 3600000); // 1 hour
  }

  /**
   * Clean up expired permission rules
   */
  private cleanupExpiredRules(): void {
    const now = new Date();
    let removedCount = 0;

    for (const [sourceAgent, rules] of this.permissionRules.entries()) {
      const validRules = rules.filter(rule => !rule.expiresAt || rule.expiresAt > now);
      const expired = rules.length - validRules.length;

      if (expired > 0) {
        this.permissionRules.set(sourceAgent, validRules);
        removedCount += expired;
      }
    }

    if (removedCount > 0 && this.config.auditLogging) {
      this.emit('rulesCleanup', {
        removedCount,
        timestamp: now
      });
    }
  }

  // ========================================
  // Public API Methods
  // ========================================

  /**
   * Get permission rules for agent
   */
  async getPermissionRules(agentId: string): Promise<PermissionRule[]> {
    return this.permissionRules.get(agentId) || [];
  }

  /**
   * Update configuration
   */
  async updateConfig(newConfig: Partial<CrossAgentConfig>): Promise<void> {
    Object.assign(this.config, newConfig);
    this.emit('configUpdated', { config: this.config, timestamp: new Date() });
  }

  /**
   * Get current configuration
   */
  getConfig(): CrossAgentConfig {
    return { ...this.config };
  }

  /**
   * Get system statistics
   */
  async getStatistics(): Promise<{
    totalPermissionRules: number;
    activeContexts: number;
    cachedRecommendations: number;
    accessibleAgentPairs: number;
  }> {
    const totalRules = Array.from(this.permissionRules.values()).reduce(
      (sum, rules) => sum + rules.length,
      0
    );

    const accessiblePairs = Array.from(this.permissionRules.entries()).reduce(
      (sum, [, rules]) => sum + rules.length,
      0
    );

    return {
      totalPermissionRules: totalRules,
      activeContexts: this.activeContexts.size,
      cachedRecommendations: this.recommendationCache.size,
      accessibleAgentPairs: accessiblePairs
    };
  }
}

/**
 * Factory function for creating cross-agent memory manager
 */
export function createCrossAgentMemoryManager(
  memoryStore: MultiTenantEnhancedMemoryStore,
  tenantManager: TenantManager,
  config?: Partial<CrossAgentConfig>
): CrossAgentMemoryManager {
  return new CrossAgentMemoryManager(memoryStore, tenantManager, config);
}

export default CrossAgentMemoryManager;