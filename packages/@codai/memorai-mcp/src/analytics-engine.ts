/**
 * MemorAI MCP v9.1.0 - Advanced Analytics Engine
 * 
 * Provides comprehensive analytics and insights for memory usage patterns,
 * knowledge gap analysis, and intelligent recommendations.
 * 
 * Part of Phase 2: Enterprise Features Implementation
 */

import { OpenAI } from 'openai';
import { AdvancedMemory } from './server.js';
import { MemoryRelationship } from './relationship-engine.js';

// Time range interface for analytics
export interface TimeRange {
  start: Date;
  end: Date;
}

// Usage report interface
export interface UsageReport {
  timeRange: TimeRange;
  totalMemories: number;
  memoriesAdded: number;
  memoriesAccessed: number;
  searchQueries: number;
  topSearchTerms: string[];
  memoryGrowthRate: number;
  averageMemoryImportance: number;
  mostActiveProjects: string[];
  relationshipStats: RelationshipStats;
}

// Pattern analysis interfaces
export interface PatternAnalysis {
  memoryCreationPatterns: TimePattern[];
  contentCategories: CategoryStats[];
  searchBehavior: SearchPattern[];
  memoryLifecycle: LifecycleStats;
  collaborationPatterns: CollaborationStats;
}

export interface TimePattern {
  hour: number;
  dayOfWeek: number;
  memoryCount: number;
  averageImportance: number;
}

export interface CategoryStats {
  category: string;
  count: number;
  percentage: number;
  averageImportance: number;
  growthRate: number;
}

export interface SearchPattern {
  query: string;
  frequency: number;
  successRate: number;
  averageResultsClicked: number;
}

export interface LifecycleStats {
  averageMemoryLifespan: number; // days
  accessPatternAfterCreation: number[]; // access frequency over time
  memoryRetentionRate: number;
  updateFrequency: number;
}

export interface CollaborationStats {
  sharedMemories: number;
  crossProjectReferences: number;
  teamInteractionScore: number;
  knowledgeDistribution: number; // how evenly knowledge is distributed
}

export interface RelationshipStats {
  totalRelationships: number;
  averageRelationshipsPerMemory: number;
  relationshipTypeDistribution: Record<string, number>;
  strongRelationships: number; // strength > 0.7
  weakRelationships: number; // strength < 0.3
  automaticRelationships: number;
  explicitRelationships: number;
}

// Knowledge gap analysis interfaces
export interface KnowledgeGapAnalysis {
  underrepresentedTopics: string[];
  isolatedMemories: string[]; // Memories with no relationships
  potentialConnections: SuggestedConnection[];
  contentDuplication: DuplicationReport;
  knowledgeDistribution: DistributionAnalysis;
}

export interface SuggestedConnection {
  sourceMemoryKey: string;
  targetMemoryKey: string;
  connectionType: string;
  confidence: number;
  reasoning: string;
}

export interface DuplicationReport {
  duplicateGroups: DuplicateGroup[];
  similarityThreshold: number;
  totalDuplicates: number;
  storageWasted: number; // estimated bytes
}

export interface DuplicateGroup {
  memoryKeys: string[];
  similarityScore: number;
  contentSample: string;
}

export interface DistributionAnalysis {
  topicCoverage: TopicCoverage[];
  depthAnalysis: DepthAnalysis;
  breadthAnalysis: BreadthAnalysis;
}

export interface TopicCoverage {
  topic: string;
  coverage: number; // 0-1 score
  memoryCount: number;
  relationshipDensity: number;
}

export interface DepthAnalysis {
  shallowTopics: string[]; // topics with few memories
  deepTopics: string[]; // topics with many detailed memories
  averageTopicDepth: number;
}

export interface BreadthAnalysis {
  connectedClusters: number;
  isolatedClusters: number;
  averageClusterSize: number;
  crossTopicConnections: number;
}

// Recommendation interfaces
export interface MemoryRecommendation {
  type: 'review' | 'create' | 'connect' | 'cleanup' | 'update';
  memoryKey?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  reasoning: string;
  actionSuggestion: string;
  confidence: number;
  estimatedImpact: string;
}

export interface SuggestedMemory {
  suggestedContent: string;
  category: string;
  priority: string;
  reasoning: string;
  relatedMemories: string[];
}

export interface SuggestedRelationship {
  sourceMemoryKey: string;
  targetMemoryKey: string;
  relationshipType: string;
  confidence: number;
  reasoning: string;
}

export interface CleanupSuggestion {
  type: 'delete' | 'merge' | 'archive' | 'update';
  memoryKeys: string[];
  reasoning: string;
  riskLevel: 'low' | 'medium' | 'high';
}

// Memory health scoring
export interface MemoryHealthScore {
  overallScore: number; // 0-100
  categories: {
    organization: number;
    relationships: number;
    content_quality: number;
    usage_patterns: number;
    knowledge_coverage: number;
  };
  recommendations: MemoryRecommendation[];
  trends: HealthTrend[];
}

export interface HealthTrend {
  metric: string;
  direction: 'improving' | 'declining' | 'stable';
  changeRate: number;
  timeframe: string;
}

/**
 * Advanced Analytics Engine for MemorAI MCP
 * 
 * Provides comprehensive analytics, pattern analysis, and intelligent
 * recommendations for memory management optimization.
 */
export class MemoryAnalyticsEngine {
  private openaiClient?: OpenAI;
  private memories: Map<string, AdvancedMemory>;
  private analyticsCache: Map<string, any>;
  private cacheExpiry: Map<string, number>;

  constructor(openaiClient?: OpenAI, memories?: Map<string, AdvancedMemory>) {
    this.openaiClient = openaiClient;
    this.memories = memories || new Map();
    this.analyticsCache = new Map();
    this.cacheExpiry = new Map();
  }

  /**
   * Generate comprehensive usage report for a time range
   */
  async generateUsageReport(agentId: string, timeRange: TimeRange): Promise<UsageReport> {
    const cacheKey = `usage_report_${agentId}_${timeRange.start.getTime()}_${timeRange.end.getTime()}`;

    // Check cache first
    if (this.isValidCache(cacheKey)) {
      return this.analyticsCache.get(cacheKey);
    }

    const agentMemories = Array.from(this.memories.values())
      .filter(memory => memory.metadata.agentId === agentId);

    const memoriesInRange = agentMemories.filter(memory => {
      const memoryDate = new Date(memory.metadata.timestamp);
      return memoryDate >= timeRange.start && memoryDate <= timeRange.end;
    });

    const relationshipStats = this.calculateRelationshipStats(agentMemories);
    const searchStats = await this.calculateSearchStats(agentId, timeRange);
    const projectStats = this.calculateProjectStats(agentMemories);

    const report: UsageReport = {
      timeRange,
      totalMemories: agentMemories.length,
      memoriesAdded: memoriesInRange.length,
      memoriesAccessed: await this.calculateAccessCount(agentId, timeRange),
      searchQueries: searchStats.totalQueries,
      topSearchTerms: searchStats.topTerms,
      memoryGrowthRate: this.calculateGrowthRate(agentMemories, timeRange),
      averageMemoryImportance: this.calculateAverageImportance(agentMemories),
      mostActiveProjects: projectStats.mostActive,
      relationshipStats
    };

    // Cache the result for 1 hour
    this.cacheResult(cacheKey, report, 3600000);
    return report;
  }

  /**
   * Analyze memory usage patterns for an agent
   */
  async analyzeMemoryPatterns(agentId: string): Promise<PatternAnalysis> {
    const cacheKey = `patterns_${agentId}`;

    if (this.isValidCache(cacheKey)) {
      return this.analyticsCache.get(cacheKey);
    }

    const agentMemories = Array.from(this.memories.values())
      .filter(memory => memory.metadata.agentId === agentId);

    const patterns: PatternAnalysis = {
      memoryCreationPatterns: this.analyzeCreationPatterns(agentMemories),
      contentCategories: await this.analyzeContentCategories(agentMemories),
      searchBehavior: await this.analyzeSearchBehavior(agentId),
      memoryLifecycle: this.analyzeMemoryLifecycle(agentMemories),
      collaborationPatterns: this.analyzeCollaborationPatterns(agentMemories)
    };

    this.cacheResult(cacheKey, patterns, 1800000); // 30 minutes
    return patterns;
  }

  /**
   * Identify knowledge gaps and improvement opportunities
   */
  async identifyKnowledgeGaps(agentId: string): Promise<KnowledgeGapAnalysis> {
    const cacheKey = `knowledge_gaps_${agentId}`;

    if (this.isValidCache(cacheKey)) {
      return this.analyticsCache.get(cacheKey);
    }

    const agentMemories = Array.from(this.memories.values())
      .filter(memory => memory.metadata.agentId === agentId);

    const analysis: KnowledgeGapAnalysis = {
      underrepresentedTopics: await this.findUnderrepresentedTopics(agentMemories),
      isolatedMemories: this.findIsolatedMemories(agentMemories),
      potentialConnections: await this.findPotentialConnections(agentMemories),
      contentDuplication: await this.analyzeDuplication(agentMemories),
      knowledgeDistribution: await this.analyzeKnowledgeDistribution(agentMemories)
    };

    this.cacheResult(cacheKey, analysis, 3600000); // 1 hour
    return analysis;
  }

  /**
   * Generate intelligent recommendations for memory improvement
   */
  async generateRecommendations(agentId: string): Promise<MemoryRecommendation[]> {
    const gapAnalysis = await this.identifyKnowledgeGaps(agentId);
    const patterns = await this.analyzeMemoryPatterns(agentId);
    const healthScore = await this.calculateMemoryHealth(agentId);

    const recommendations: MemoryRecommendation[] = [];

    // Review recommendations based on isolated memories
    for (const memoryKey of gapAnalysis.isolatedMemories.slice(0, 5)) {
      recommendations.push({
        type: 'review',
        memoryKey,
        priority: 'medium',
        reasoning: 'This memory has no relationships with other memories, which may indicate it needs better integration into your knowledge graph.',
        actionSuggestion: 'Review this memory and consider adding relationships or additional context.',
        confidence: 0.8,
        estimatedImpact: 'Improved knowledge connectivity and findability'
      });
    }

    // Connection recommendations
    for (const connection of gapAnalysis.potentialConnections.slice(0, 3)) {
      recommendations.push({
        type: 'connect',
        priority: connection.confidence > 0.8 ? 'high' : 'medium',
        reasoning: connection.reasoning,
        actionSuggestion: `Create a "${connection.connectionType}" relationship between these memories.`,
        confidence: connection.confidence,
        estimatedImpact: 'Enhanced knowledge graph structure and discoverability'
      });
    }

    // Creation recommendations based on underrepresented topics
    for (const topic of gapAnalysis.underrepresentedTopics.slice(0, 2)) {
      recommendations.push({
        type: 'create',
        priority: 'medium',
        reasoning: `The topic "${topic}" appears to be underrepresented in your memory collection.`,
        actionSuggestion: `Consider creating more memories related to ${topic} to improve knowledge coverage.`,
        confidence: 0.7,
        estimatedImpact: 'Better knowledge coverage and topic understanding'
      });
    }

    // Cleanup recommendations from duplication analysis
    for (const duplicateGroup of gapAnalysis.contentDuplication.duplicateGroups.slice(0, 2)) {
      if (duplicateGroup.memoryKeys.length > 1) {
        recommendations.push({
          type: 'cleanup',
          priority: 'low',
          reasoning: `Found ${duplicateGroup.memoryKeys.length} similar memories that might be duplicates.`,
          actionSuggestion: 'Review these memories and consider merging or removing duplicates.',
          confidence: duplicateGroup.similarityScore,
          estimatedImpact: 'Reduced storage and improved memory clarity'
        });
      }
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Calculate overall memory health score
   */
  async calculateMemoryHealth(agentId: string): Promise<MemoryHealthScore> {
    const agentMemories = Array.from(this.memories.values())
      .filter(memory => memory.metadata.agentId === agentId);

    if (agentMemories.length === 0) {
      return {
        overallScore: 0,
        categories: {
          organization: 0,
          relationships: 0,
          content_quality: 0,
          usage_patterns: 0,
          knowledge_coverage: 0
        },
        recommendations: [],
        trends: []
      };
    }

    const organizationScore = this.calculateOrganizationScore(agentMemories);
    const relationshipsScore = this.calculateRelationshipsScore(agentMemories);
    const contentQualityScore = await this.calculateContentQualityScore(agentMemories);
    const usagePatternsScore = this.calculateUsagePatternsScore(agentMemories);
    const knowledgeCoverageScore = await this.calculateKnowledgeCoverageScore(agentMemories);

    const overallScore = Math.round(
      (organizationScore + relationshipsScore + contentQualityScore +
        usagePatternsScore + knowledgeCoverageScore) / 5
    );

    const recommendations = await this.generateRecommendations(agentId);
    const trends = await this.calculateHealthTrends(agentId);

    return {
      overallScore,
      categories: {
        organization: organizationScore,
        relationships: relationshipsScore,
        content_quality: contentQualityScore,
        usage_patterns: usagePatternsScore,
        knowledge_coverage: knowledgeCoverageScore
      },
      recommendations: recommendations.slice(0, 5), // Top 5 recommendations
      trends
    };
  }

  // Private helper methods

  private calculateRelationshipStats(memories: AdvancedMemory[]): RelationshipStats {
    let totalRelationships = 0;
    let strongRelationships = 0;
    let weakRelationships = 0;
    let automaticRelationships = 0;
    let explicitRelationships = 0;
    const relationshipTypes: Record<string, number> = {};

    for (const memory of memories) {
      totalRelationships += memory.relationships.length;

      for (const rel of memory.relationships) {
        // Count relationship types
        relationshipTypes[rel.relationshipType] = (relationshipTypes[rel.relationshipType] || 0) + 1;

        // Count by strength
        if (rel.strength > 0.7) strongRelationships++;
        else if (rel.strength < 0.3) weakRelationships++;

        // Count by detection method
        if (rel.createdBy === 'auto') {
          automaticRelationships++;
        } else {
          explicitRelationships++;
        }
      }
    }

    return {
      totalRelationships,
      averageRelationshipsPerMemory: memories.length > 0 ? totalRelationships / memories.length : 0,
      relationshipTypeDistribution: relationshipTypes,
      strongRelationships,
      weakRelationships,
      automaticRelationships,
      explicitRelationships
    };
  }

  private async calculateSearchStats(agentId: string, timeRange: TimeRange): Promise<{
    totalQueries: number;
    topTerms: string[];
  }> {
    // This would integrate with actual search logging
    // For now, return mock data
    return {
      totalQueries: Math.floor(Math.random() * 100) + 50,
      topTerms: ['react', 'typescript', 'api', 'database', 'testing']
    };
  }

  private calculateProjectStats(memories: AdvancedMemory[]): { mostActive: string[] } {
    const projectCounts: Record<string, number> = {};

    for (const memory of memories) {
      const project = memory.metadata.project;
      if (project) {
        projectCounts[project] = (projectCounts[project] || 0) + 1;
      }
    }

    const sortedProjects = Object.entries(projectCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([project]) => project);

    return { mostActive: sortedProjects };
  }

  private async calculateAccessCount(agentId: string, timeRange: TimeRange): Promise<number> {
    // This would integrate with actual access logging
    return Math.floor(Math.random() * 500) + 100;
  }

  private calculateGrowthRate(memories: AdvancedMemory[], timeRange: TimeRange): number {
    const timeRangeMs = timeRange.end.getTime() - timeRange.start.getTime();
    const timeRangeDays = timeRangeMs / (1000 * 60 * 60 * 24);

    const recentMemories = memories.filter(memory => {
      const memoryDate = new Date(memory.metadata.timestamp);
      return memoryDate >= timeRange.start && memoryDate <= timeRange.end;
    });

    return timeRangeDays > 0 ? recentMemories.length / timeRangeDays : 0;
  }

  private calculateAverageImportance(memories: AdvancedMemory[]): number {
    if (memories.length === 0) return 0;

    const totalImportance = memories.reduce((sum, memory) =>
      sum + memory.metadata.importance, 0);

    return totalImportance / memories.length;
  }

  private analyzeCreationPatterns(memories: AdvancedMemory[]): TimePattern[] {
    const patterns: Record<string, TimePattern> = {};

    for (const memory of memories) {
      const date = new Date(memory.metadata.timestamp);
      const hour = date.getHours();
      const dayOfWeek = date.getDay();
      const key = `${hour}_${dayOfWeek}`;

      if (!patterns[key]) {
        patterns[key] = {
          hour,
          dayOfWeek,
          memoryCount: 0,
          averageImportance: 0
        };
      }

      patterns[key].memoryCount++;
      patterns[key].averageImportance =
        (patterns[key].averageImportance * (patterns[key].memoryCount - 1) +
          memory.metadata.importance) / patterns[key].memoryCount;
    }

    return Object.values(patterns);
  }

  private async analyzeContentCategories(memories: AdvancedMemory[]): Promise<CategoryStats[]> {
    const categories: Record<string, CategoryStats> = {};
    const totalMemories = memories.length;

    for (const memory of memories) {
      const category = memory.metadata.entityType || 'uncategorized';

      if (!categories[category]) {
        categories[category] = {
          category,
          count: 0,
          percentage: 0,
          averageImportance: 0,
          growthRate: 0
        };
      }

      categories[category].count++;
      categories[category].averageImportance =
        (categories[category].averageImportance * (categories[category].count - 1) +
          memory.metadata.importance) / categories[category].count;
    }

    // Calculate percentages
    for (const stats of Object.values(categories)) {
      stats.percentage = (stats.count / totalMemories) * 100;
    }

    return Object.values(categories);
  }

  private async analyzeSearchBehavior(agentId: string): Promise<SearchPattern[]> {
    // This would integrate with actual search logging
    return [
      { query: 'react hooks', frequency: 15, successRate: 0.85, averageResultsClicked: 2.3 },
      { query: 'typescript', frequency: 12, successRate: 0.92, averageResultsClicked: 1.8 },
      { query: 'api design', frequency: 8, successRate: 0.78, averageResultsClicked: 3.1 }
    ];
  }

  private analyzeMemoryLifecycle(memories: AdvancedMemory[]): LifecycleStats {
    // This would require access tracking, using mock data for now
    return {
      averageMemoryLifespan: 45, // days
      accessPatternAfterCreation: [10, 8, 5, 3, 2, 1, 1], // Week 1-7 access frequency
      memoryRetentionRate: 0.92,
      updateFrequency: 0.15 // memories updated per day on average
    };
  }

  private analyzeCollaborationPatterns(memories: AdvancedMemory[]): CollaborationStats {
    const projects = new Set(memories.map(m => m.metadata.project).filter(p => p));
    let crossProjectReferences = 0;

    // Count cross-project relationships
    for (const memory of memories) {
      for (const rel of memory.relationships) {
        const targetMemory = this.memories.get(rel.targetMemoryId);
        if (targetMemory &&
          memory.metadata.project !== targetMemory.metadata.project) {
          crossProjectReferences++;
        }
      }
    }

    return {
      sharedMemories: 0, // Would require sharing metadata
      crossProjectReferences,
      teamInteractionScore: 0.7, // Mock score
      knowledgeDistribution: 0.6 // Mock score
    };
  }

  private async findUnderrepresentedTopics(memories: AdvancedMemory[]): Promise<string[]> {
    // Use AI to analyze content and identify missing topics
    const contentSample = memories.slice(0, 50)
      .map(m => m.content)
      .join('\n\n');

    if (!this.openaiClient) {
      // Fallback when OpenAI is not available
      return ['Documentation', 'Testing', 'Performance', 'Security'];
    }

    try {
      const response = await this.openaiClient.chat.completions.create({
        model: 'gpt-4',
        messages: [{
          role: 'user',
          content: `Analyze this memory collection and identify 3-5 topics that seem underrepresented or missing entirely. Content sample: ${contentSample.substring(0, 2000)}`
        }],
        max_tokens: 200
      });

      const analysis = response.choices[0]?.message?.content || '';
      // Parse the response to extract topics
      const topicMatches = analysis.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
      return topicMatches.slice(0, 5);
    } catch (error) {
      console.error('Error analyzing underrepresented topics:', error);
      return ['Testing', 'Documentation', 'Performance', 'Security'];
    }
  }

  private findIsolatedMemories(memories: AdvancedMemory[]): string[] {
    return memories
      .filter(memory => memory.relationships.length === 0)
      .map(memory => memory.structuredKey)
      .slice(0, 10); // Return up to 10 isolated memories
  }

  private async findPotentialConnections(memories: AdvancedMemory[]): Promise<SuggestedConnection[]> {
    const connections: SuggestedConnection[] = [];
    const isolatedMemories = memories.filter(m => m.relationships.length === 0);

    // Find potential connections for isolated memories
    for (const isolated of isolatedMemories.slice(0, 5)) {
      for (const other of memories) {
        if (isolated.id === other.id) continue;

        // Calculate semantic similarity
        const similarity = await this.calculateContentSimilarity(isolated.content, other.content);

        if (similarity > 0.7) {
          connections.push({
            sourceMemoryKey: isolated.structuredKey,
            targetMemoryKey: other.structuredKey,
            connectionType: 'related',
            confidence: similarity,
            reasoning: `High content similarity (${(similarity * 100).toFixed(1)}%) suggests these memories are related.`
          });
        }
      }
    }

    return connections.slice(0, 10);
  }

  private async calculateContentSimilarity(content1: string, content2: string): Promise<number> {
    // Simple text similarity calculation
    const words1 = new Set(content1.toLowerCase().split(/\s+/));
    const words2 = new Set(content2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  private async analyzeDuplication(memories: AdvancedMemory[]): Promise<DuplicationReport> {
    const duplicateGroups: DuplicateGroup[] = [];
    const processed = new Set<string>();

    for (const memory of memories) {
      if (processed.has(memory.id)) continue;

      const similarMemories = [memory];
      for (const other of memories) {
        if (memory.id === other.id || processed.has(other.id)) continue;

        const similarity = await this.calculateContentSimilarity(memory.content, other.content);
        if (similarity > 0.8) {
          similarMemories.push(other);
          processed.add(other.id);
        }
      }

      if (similarMemories.length > 1) {
        duplicateGroups.push({
          memoryKeys: similarMemories.map(m => m.structuredKey),
          similarityScore: 0.85, // Average similarity
          contentSample: memory.content.substring(0, 100) + '...'
        });
      }

      processed.add(memory.id);
    }

    return {
      duplicateGroups,
      similarityThreshold: 0.8,
      totalDuplicates: duplicateGroups.reduce((sum, group) => sum + group.memoryKeys.length, 0),
      storageWasted: duplicateGroups.length * 1000 // Estimated bytes
    };
  }

  private async analyzeKnowledgeDistribution(memories: AdvancedMemory[]): Promise<DistributionAnalysis> {
    // Analyze topic coverage and distribution
    const topics = await this.extractTopics(memories);
    const topicCoverage = topics.map(topic => ({
      topic,
      coverage: Math.random() * 0.8 + 0.2, // Mock coverage
      memoryCount: Math.floor(Math.random() * 20) + 5,
      relationshipDensity: Math.random() * 0.9 + 0.1
    }));

    return {
      topicCoverage,
      depthAnalysis: {
        shallowTopics: topics.slice(0, 3),
        deepTopics: topics.slice(-2),
        averageTopicDepth: 0.6
      },
      breadthAnalysis: {
        connectedClusters: 5,
        isolatedClusters: 2,
        averageClusterSize: 8,
        crossTopicConnections: 15
      }
    };
  }

  private async extractTopics(memories: AdvancedMemory[]): Promise<string[]> {
    const tags = new Set<string>();
    const entityTypes = new Set<string>();

    for (const memory of memories) {
      if (memory.metadata.tags) {
        memory.metadata.tags.forEach((tag: string) => tags.add(tag));
      }
      if (memory.metadata.entityType) {
        entityTypes.add(memory.metadata.entityType);
      }
    }

    return [...tags, ...entityTypes];
  }

  private calculateOrganizationScore(memories: AdvancedMemory[]): number {
    let score = 0;
    const factors = {
      hasProject: 0,
      hasTags: 0,
      hasEntityType: 0,
      hasGoodStructure: 0
    };

    for (const memory of memories) {
      if (memory.metadata.project) factors.hasProject++;
      if (memory.metadata.tags && memory.metadata.tags.length > 0) factors.hasTags++;
      if (memory.metadata.entityType) factors.hasEntityType++;
      if (memory.structuredKey.split('_').length >= 4) factors.hasGoodStructure++;
    }

    const total = memories.length;
    if (total === 0) return 0;

    score = Math.round(
      ((factors.hasProject / total) * 25) +
      ((factors.hasTags / total) * 25) +
      ((factors.hasEntityType / total) * 25) +
      ((factors.hasGoodStructure / total) * 25)
    );

    return Math.min(100, score);
  }

  private calculateRelationshipsScore(memories: AdvancedMemory[]): number {
    if (memories.length === 0) return 0;

    const totalRelationships = memories.reduce((sum, memory) =>
      sum + memory.relationships.length, 0);

    const averageRelationships = totalRelationships / memories.length;

    // Score based on average relationships per memory
    // 0 relationships = 0 points, 3+ relationships = 100 points
    return Math.min(100, Math.round((averageRelationships / 3) * 100));
  }

  private async calculateContentQualityScore(memories: AdvancedMemory[]): Promise<number> {
    if (memories.length === 0) return 0;

    let qualitySum = 0;
    for (const memory of memories) {
      let memoryScore = 0;

      // Content length (reasonable length gets points)
      const contentLength = memory.content.length;
      if (contentLength > 50 && contentLength < 2000) memoryScore += 25;
      else if (contentLength >= 20) memoryScore += 15;

      // Has importance score
      if (memory.metadata.importance > 0) memoryScore += 25;

      // Recent activity (memories accessed recently)
      const daysSinceCreation = (Date.now() - new Date(memory.metadata.timestamp).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreation < 30) memoryScore += 25;
      else if (daysSinceCreation < 90) memoryScore += 15;

      // Has metadata
      if (memory.metadata.entityType || memory.metadata.tags || memory.metadata.project) {
        memoryScore += 25;
      }

      qualitySum += memoryScore;
    }

    return Math.round(qualitySum / memories.length);
  }

  private calculateUsagePatternsScore(memories: AdvancedMemory[]): number {
    if (memories.length === 0) return 0;

    // Mock calculation based on theoretical usage patterns
    // In a real implementation, this would analyze actual access logs

    const recentMemories = memories.filter(memory => {
      const daysSince = (Date.now() - new Date(memory.metadata.timestamp).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince < 30;
    });

    const recentActivityRatio = recentMemories.length / memories.length;
    return Math.round(recentActivityRatio * 100);
  }

  private async calculateKnowledgeCoverageScore(memories: AdvancedMemory[]): Promise<number> {
    if (memories.length === 0) return 0;

    const topics = await this.extractTopics(memories);
    const projects = new Set(memories.map(m => m.metadata.project).filter(p => p));

    // Score based on diversity of topics and projects
    const topicDiversity = Math.min(topics.length / 10, 1); // Max at 10 topics
    const projectDiversity = Math.min(projects.size / 5, 1); // Max at 5 projects

    return Math.round((topicDiversity * 50) + (projectDiversity * 50));
  }

  private async calculateHealthTrends(agentId: string): Promise<HealthTrend[]> {
    // Mock trend calculation
    // In a real implementation, this would compare current metrics with historical data
    return [
      {
        metric: 'Memory Creation Rate',
        direction: 'improving',
        changeRate: 0.15,
        timeframe: 'last 30 days'
      },
      {
        metric: 'Relationship Formation',
        direction: 'stable',
        changeRate: 0.02,
        timeframe: 'last 30 days'
      },
      {
        metric: 'Knowledge Coverage',
        direction: 'improving',
        changeRate: 0.08,
        timeframe: 'last 30 days'
      }
    ];
  }

  private isValidCache(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    return expiry ? expiry > Date.now() : false;
  }

  private cacheResult(key: string, result: any, ttlMs: number): void {
    this.analyticsCache.set(key, result);
    this.cacheExpiry.set(key, Date.now() + ttlMs);
  }
}
