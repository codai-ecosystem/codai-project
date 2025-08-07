/**
 * MemoryIntelligenceService - AI-Powered Memory Analysis and Optimization
 * Phase 6.2.4: Memory Intelligence Engine
 * 
 * Provides comprehensive intelligence analytics for memory management:
 * - Importance scoring and prediction
 * - Memory relationship analysis
 * - Usage pattern recognition
 * - Intelligent recommendations
 * - Memory optimization suggestions
 * - Performance analytics
 */

import { memoraiMCPClient } from '../../utils/memorai-mcp-client';
import { ContentAnalyzer } from '../../utils/nlp/ContentAnalyzer';

interface Memory {
    structuredKey: string;
    content: string;
    agentId: string;
    importance: number;
    project?: string;
    tags?: string[];
    createdAt: string;
    updatedAt?: string;
    metadata?: {
        accessCount?: number;
        lastAccessed?: string;
        embedding?: number[];
        categories?: string[];
        confidence?: number;
    };
}

interface MemoryRelationship {
    sourceMemoryId: string;
    targetMemoryId: string;
    relationshipType: 'similar_content' | 'project_related' | 'tag_overlap' | 'temporal_proximity' | 'usage_pattern';
    strength: number; // 0-1
    confidence: number; // 0-1
    description: string;
}

interface ImportanceFactors {
    contentComplexity: number;
    technicalDepth: number;
    uniqueness: number;
    projectRelevance: number;
    temporalRelevance: number;
    usageFrequency: number;
    userExplicitRating: number;
    crossReferences: number;
}

interface MemoryInsight {
    type: 'pattern' | 'recommendation' | 'optimization' | 'trend' | 'anomaly';
    title: string;
    description: string;
    confidence: number;
    impact: 'low' | 'medium' | 'high';
    actionable: boolean;
    suggestedActions?: string[];
    affectedMemories?: string[];
    metadata?: Record<string, any>;
}

interface IntelligenceReport {
    memoryId: string;
    currentImportance: number;
    predictedImportance: number;
    importanceFactors: ImportanceFactors;
    relationships: MemoryRelationship[];
    insights: MemoryInsight[];
    recommendations: {
        tags: string[];
        projects: string[];
        relatedMemories: string[];
        optimizations: string[];
    };
    analytics: {
        accessPatterns: AccessPattern[];
        usageTrends: UsageTrend[];
        performanceMetrics: PerformanceMetric[];
    };
}

interface AccessPattern {
    pattern: string;
    frequency: number;
    timeRange: string;
    context: string;
    confidence: number;
}

interface UsageTrend {
    trend: 'increasing' | 'decreasing' | 'stable' | 'seasonal';
    metric: string;
    change: number;
    period: string;
    significance: number;
}

interface PerformanceMetric {
    metric: string;
    value: number;
    unit: string;
    benchmark: number;
    status: 'excellent' | 'good' | 'needs_improvement' | 'critical';
}

interface IntelligenceOptions {
    includeRelationships?: boolean;
    includeInsights?: boolean;
    includeRecommendations?: boolean;
    includeAnalytics?: boolean;
    analysisDepth?: 'basic' | 'standard' | 'comprehensive';
    timeWindow?: string; // e.g., '7d', '30d', '90d'
    minConfidence?: number;
}

export class MemoryIntelligenceService {
    private contentAnalyzer: ContentAnalyzer;
    private cache: Map<string, IntelligenceReport>;
    private cacheExpiration: Map<string, number>;
    private readonly CACHE_TTL = 15 * 60 * 1000; // 15 minutes

    // Intelligence models and weights
    private importanceWeights = {
        contentComplexity: 0.15,
        technicalDepth: 0.20,
        uniqueness: 0.15,
        projectRelevance: 0.15,
        temporalRelevance: 0.10,
        usageFrequency: 0.15,
        userExplicitRating: 0.05,
        crossReferences: 0.05
    };

    private relationshipPatterns = {
        contentSimilarity: {
            threshold: 0.75,
            weight: 0.8
        },
        tagOverlap: {
            threshold: 0.5,
            weight: 0.6
        },
        projectRelatedness: {
            threshold: 0.9,
            weight: 0.9
        },
        temporalProximity: {
            threshold: 86400000, // 24 hours in ms
            weight: 0.4
        }
    };

    constructor() {
        this.contentAnalyzer = new ContentAnalyzer();
        this.cache = new Map();
        this.cacheExpiration = new Map();
    }

    /**
     * Analyze memory intelligence with comprehensive insights
     */
    async analyzeMemoryIntelligence(
        memoryId: string,
        options: IntelligenceOptions = {}
    ): Promise<IntelligenceReport> {
        const cacheKey = `${memoryId}_${JSON.stringify(options)}`;

        // Check cache
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey)!;
        }

        try {
            // Get memory details
            const memory = await this.getMemoryDetails(memoryId);
            if (!memory) {
                throw new Error(`Memory not found: ${memoryId}`);
            }

            // Analyze importance factors
            const importanceFactors = await this.analyzeImportanceFactors(memory, options);

            // Predict importance
            const predictedImportance = this.predictImportance(importanceFactors);

            // Find relationships
            const relationships = options.includeRelationships !== false
                ? await this.findMemoryRelationships(memory, options)
                : [];

            // Generate insights
            const insights = options.includeInsights !== false
                ? await this.generateInsights(memory, importanceFactors, relationships, options)
                : [];

            // Create recommendations
            const recommendations = options.includeRecommendations !== false
                ? await this.generateRecommendations(memory, relationships, insights, options)
                : { tags: [], projects: [], relatedMemories: [], optimizations: [] };

            // Gather analytics
            const analytics = options.includeAnalytics !== false
                ? await this.gatherAnalytics(memory, options)
                : { accessPatterns: [], usageTrends: [], performanceMetrics: [] };

            const report: IntelligenceReport = {
                memoryId,
                currentImportance: memory.importance,
                predictedImportance,
                importanceFactors,
                relationships,
                insights,
                recommendations,
                analytics
            };

            // Cache the result
            this.cache.set(cacheKey, report);
            this.cacheExpiration.set(cacheKey, Date.now() + this.CACHE_TTL);

            return report;

        } catch (error) {
            console.error('Memory intelligence analysis failed:', error);
            throw new Error(`Failed to analyze memory intelligence: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Batch analyze multiple memories for comparative intelligence
     */
    async batchAnalyzeIntelligence(
        memoryIds: string[],
        options: IntelligenceOptions = {}
    ): Promise<IntelligenceReport[]> {
        const reports: IntelligenceReport[] = [];
        const batchSize = 5; // Process in batches to avoid overwhelming the system

        for (let i = 0; i < memoryIds.length; i += batchSize) {
            const batch = memoryIds.slice(i, i + batchSize);
            const batchPromises = batch.map(id =>
                this.analyzeMemoryIntelligence(id, options).catch(error => {
                    console.error(`Failed to analyze memory ${id}:`, error);
                    return null;
                })
            );

            const batchResults = await Promise.all(batchPromises);
            reports.push(...batchResults.filter(report => report !== null) as IntelligenceReport[]);
        }

        return reports;
    }

    /**
     * Generate global memory intelligence insights
     */
    async generateGlobalInsights(
        agentId: string,
        options: IntelligenceOptions = {}
    ): Promise<{
        totalMemories: number;
        avgImportance: number;
        topCategories: Array<{ category: string; count: number; avgImportance: number }>;
        usagePatterns: AccessPattern[];
        recommendations: MemoryInsight[];
        trends: UsageTrend[];
        performanceOverview: PerformanceMetric[];
    }> {
        try {
            // Get all memories for agent
            const memories = await memoraiMCPClient.searchMemories('*', agentId, { limit: 1000 });

            if (memories.length === 0) {
                return {
                    totalMemories: 0,
                    avgImportance: 0,
                    topCategories: [],
                    usagePatterns: [],
                    recommendations: [],
                    trends: [],
                    performanceOverview: []
                };
            }

            // Calculate basic statistics
            const totalMemories = memories.length;
            const avgImportance = memories.reduce((sum, m) => sum + m.importance, 0) / totalMemories;

            // Analyze categories
            const categoryMap = new Map<string, { count: number; totalImportance: number }>();

            for (const memory of memories) {
                const analysis = await this.contentAnalyzer.analyzeContent(memory.content);

                // Extract categories from topics for categorization
                const categories = analysis.topics.map(topic => topic.topic.toLowerCase().replace(/\s+/g, '_'));

                for (const category of categories) {
                    if (!categoryMap.has(category)) {
                        categoryMap.set(category, { count: 0, totalImportance: 0 });
                    }
                    const cat = categoryMap.get(category)!;
                    cat.count++;
                    cat.totalImportance += memory.importance;
                }
            }

            const topCategories = Array.from(categoryMap.entries())
                .map(([category, data]) => ({
                    category,
                    count: data.count,
                    avgImportance: data.totalImportance / data.count
                }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);

            // Generate usage patterns
            const usagePatterns = await this.analyzeGlobalUsagePatterns(memories, options);

            // Generate recommendations
            const recommendations = await this.generateGlobalRecommendations(memories, topCategories, options);

            // Analyze trends
            const trends = await this.analyzeGlobalTrends(memories, options);

            // Performance overview
            const performanceOverview = await this.generatePerformanceOverview(memories, options);

            return {
                totalMemories,
                avgImportance,
                topCategories,
                usagePatterns,
                recommendations,
                trends,
                performanceOverview
            };

        } catch (error) {
            console.error('Global insights generation failed:', error);
            throw new Error(`Failed to generate global insights: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Predict memory importance using ML-style scoring
     */
    private predictImportance(factors: ImportanceFactors): number {
        let score = 0;

        score += factors.contentComplexity * this.importanceWeights.contentComplexity;
        score += factors.technicalDepth * this.importanceWeights.technicalDepth;
        score += factors.uniqueness * this.importanceWeights.uniqueness;
        score += factors.projectRelevance * this.importanceWeights.projectRelevance;
        score += factors.temporalRelevance * this.importanceWeights.temporalRelevance;
        score += factors.usageFrequency * this.importanceWeights.usageFrequency;
        score += factors.userExplicitRating * this.importanceWeights.userExplicitRating;
        score += factors.crossReferences * this.importanceWeights.crossReferences;

        // Apply sigmoid function to normalize to 1-10 scale
        const normalized = 1 + 9 / (1 + Math.exp(-score * 2));
        return Math.round(normalized * 10) / 10;
    }

    /**
     * Analyze factors that contribute to memory importance
     */
    private async analyzeImportanceFactors(
        memory: Memory,
        options: IntelligenceOptions
    ): Promise<ImportanceFactors> {
        const analysis = await this.contentAnalyzer.analyzeContent(memory.content);

        // Content complexity (0-1)
        const contentComplexity = Math.min(1,
            (analysis.keyPhrases.length * 0.1 +
                (analysis.contentType === 'code' ? 0.2 : 0) +
                analysis.complexity.score * 0.01) / 3
        );

        // Technical depth (0-1)
        const technicalDepth = Math.min(1,
            (analysis.topics.some(t => t.topic.toLowerCase().includes('technical') ||
                t.topic.toLowerCase().includes('development') ||
                t.topic.toLowerCase().includes('programming')) ? 0.5 : 0) +
            (analysis.contentType === 'code' ? 0.3 : 0) +
            (analysis.entities.some(e => e.type === 'technology') ? 0.2 : 0)
        );

        // Uniqueness (0-1) - based on unique words and content type
        const uniqueness = Math.min(1,
            analysis.uniqueWordCount / analysis.wordCount +
            (analysis.contentType === 'idea' || analysis.contentType === 'reference' ? 0.3 : 0)
        );

        // Project relevance (0-1)
        const projectRelevance = memory.project ? 0.8 : 0.4;

        // Temporal relevance (0-1) - how recent the memory is
        const daysSinceCreation = (Date.now() - new Date(memory.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        const temporalRelevance = Math.max(0, Math.min(1, 1 - daysSinceCreation / 365));

        // Usage frequency (0-1) - based on metadata if available
        const usageFrequency = memory.metadata?.accessCount ?
            Math.min(1, memory.metadata.accessCount / 100) : 0.2;

        // User explicit rating (0-1) - current importance scaled
        const userExplicitRating = memory.importance / 10;

        // Cross references (0-1) - based on tags and key phrases
        const crossReferences = memory.tags ?
            Math.min(1, memory.tags.length / 10) +
            Math.min(0.2, analysis.keyPhrases.length / 20) :
            Math.min(0.2, analysis.keyPhrases.length / 20);

        return {
            contentComplexity,
            technicalDepth,
            uniqueness,
            projectRelevance,
            temporalRelevance,
            usageFrequency,
            userExplicitRating,
            crossReferences
        };
    }

    /**
     * Find relationships between memories
     */
    private async findMemoryRelationships(
        memory: Memory,
        options: IntelligenceOptions
    ): Promise<MemoryRelationship[]> {
        const relationships: MemoryRelationship[] = [];

        try {
            // Get related memories
            const relatedMemories = await memoraiMCPClient.searchMemories(
                memory.content.slice(0, 100),
                memory.agentId,
                { limit: 20 }
            );

            for (const relatedMemory of relatedMemories) {
                if (relatedMemory.structuredKey === memory.structuredKey) continue;

                // Analyze different types of relationships
                const relationships_found = await this.analyzeMemoryRelationship(memory, relatedMemory);
                relationships.push(...relationships_found);
            }

            // Sort by strength and limit results
            return relationships
                .sort((a, b) => b.strength - a.strength)
                .slice(0, 10);

        } catch (error) {
            console.error('Relationship analysis failed:', error);
            return [];
        }
    }

    /**
     * Analyze relationship between two memories
     */
    private async analyzeMemoryRelationship(
        memory1: Memory,
        memory2: Memory
    ): Promise<MemoryRelationship[]> {
        const relationships: MemoryRelationship[] = [];

        // Content similarity
        const analysis1 = await this.contentAnalyzer.analyzeContent(memory1.content);
        const analysis2 = await this.contentAnalyzer.analyzeContent(memory2.content);

        const contentSimilarity = this.calculateContentSimilarity(analysis1, analysis2);
        if (contentSimilarity > this.relationshipPatterns.contentSimilarity.threshold) {
            relationships.push({
                sourceMemoryId: memory1.structuredKey,
                targetMemoryId: memory2.structuredKey,
                relationshipType: 'similar_content',
                strength: contentSimilarity,
                confidence: 0.8,
                description: `Content similarity: ${(contentSimilarity * 100).toFixed(0)}%`
            });
        }

        // Project relationship
        if (memory1.project && memory2.project && memory1.project === memory2.project) {
            relationships.push({
                sourceMemoryId: memory1.structuredKey,
                targetMemoryId: memory2.structuredKey,
                relationshipType: 'project_related',
                strength: 0.9,
                confidence: 1.0,
                description: `Both belong to project: ${memory1.project}`
            });
        }

        // Tag overlap
        if (memory1.tags && memory2.tags) {
            const commonTags = memory1.tags.filter(tag => memory2.tags!.includes(tag));
            const tagOverlap = commonTags.length / Math.max(memory1.tags.length, memory2.tags.length);

            if (tagOverlap > this.relationshipPatterns.tagOverlap.threshold) {
                relationships.push({
                    sourceMemoryId: memory1.structuredKey,
                    targetMemoryId: memory2.structuredKey,
                    relationshipType: 'tag_overlap',
                    strength: tagOverlap,
                    confidence: 0.7,
                    description: `Shared tags: ${commonTags.join(', ')}`
                });
            }
        }

        // Temporal proximity
        const time1 = new Date(memory1.createdAt).getTime();
        const time2 = new Date(memory2.createdAt).getTime();
        const timeDiff = Math.abs(time1 - time2);

        if (timeDiff < this.relationshipPatterns.temporalProximity.threshold) {
            const proximity = 1 - (timeDiff / this.relationshipPatterns.temporalProximity.threshold);
            relationships.push({
                sourceMemoryId: memory1.structuredKey,
                targetMemoryId: memory2.structuredKey,
                relationshipType: 'temporal_proximity',
                strength: proximity,
                confidence: 0.6,
                description: `Created within ${Math.round(timeDiff / 3600000)} hours of each other`
            });
        }

        return relationships;
    }

    /**
     * Generate actionable insights
     */
    private async generateInsights(
        memory: Memory,
        factors: ImportanceFactors,
        relationships: MemoryRelationship[],
        options: IntelligenceOptions
    ): Promise<MemoryInsight[]> {
        const insights: MemoryInsight[] = [];

        // Importance trend insight
        if (factors.userExplicitRating < this.predictImportance(factors) / 10) {
            insights.push({
                type: 'recommendation',
                title: 'Undervalued Memory',
                description: 'This memory appears more important than its current rating suggests',
                confidence: 0.7,
                impact: 'medium',
                actionable: true,
                suggestedActions: [
                    'Consider increasing importance rating',
                    'Add more descriptive tags',
                    'Link to related project'
                ],
                affectedMemories: [memory.structuredKey]
            });
        }

        // Relationship insights
        if (relationships.length > 5) {
            insights.push({
                type: 'pattern',
                title: 'Highly Connected Memory',
                description: 'This memory has many relationships with other memories',
                confidence: 0.8,
                impact: 'high',
                actionable: true,
                suggestedActions: [
                    'Consider as a knowledge hub',
                    'Review for consolidation opportunities',
                    'Use as reference point for related searches'
                ],
                affectedMemories: [memory.structuredKey, ...relationships.map(r => r.targetMemoryId)]
            });
        }

        // Technical content insight
        if (factors.technicalDepth > 0.7) {
            insights.push({
                type: 'optimization',
                title: 'Technical Knowledge',
                description: 'This memory contains valuable technical information',
                confidence: 0.9,
                impact: 'high',
                actionable: true,
                suggestedActions: [
                    'Add technical tags for better discoverability',
                    'Consider creating documentation',
                    'Link to related technical memories'
                ],
                affectedMemories: [memory.structuredKey]
            });
        }

        // Temporal relevance insight
        if (factors.temporalRelevance < 0.3) {
            insights.push({
                type: 'trend',
                title: 'Aging Memory',
                description: 'This memory is becoming less relevant over time',
                confidence: 0.6,
                impact: 'low',
                actionable: true,
                suggestedActions: [
                    'Review for continued relevance',
                    'Update with recent information',
                    'Consider archiving if outdated'
                ],
                affectedMemories: [memory.structuredKey]
            });
        }

        return insights.filter(insight =>
            !options.minConfidence || insight.confidence >= options.minConfidence
        );
    }

    /**
     * Generate recommendations for memory optimization
     */
    private async generateRecommendations(
        memory: Memory,
        relationships: MemoryRelationship[],
        insights: MemoryInsight[],
        options: IntelligenceOptions
    ): Promise<{
        tags: string[];
        projects: string[];
        relatedMemories: string[];
        optimizations: string[];
    }> {
        const recommendations = {
            tags: [] as string[],
            projects: [] as string[],
            relatedMemories: [] as string[],
            optimizations: [] as string[]
        };

        // Analyze content for tag recommendations
        const analysis = await this.contentAnalyzer.analyzeContent(memory.content);
        recommendations.tags = analysis.suggestedTags.map(tag => tag.tag).slice(0, 5);

        // Project recommendations based on relationships
        const projectCounts = new Map<string, number>();
        for (const rel of relationships) {
            // This would require getting the related memory's project
            // Simplified for now
        }

        // Related memories from relationships
        recommendations.relatedMemories = relationships
            .slice(0, 5)
            .map(r => r.targetMemoryId);

        // Optimization recommendations from insights
        for (const insight of insights) {
            if (insight.suggestedActions) {
                recommendations.optimizations.push(...insight.suggestedActions);
            }
        }

        return recommendations;
    }

    /**
     * Gather analytics data for memory
     */
    private async gatherAnalytics(
        memory: Memory,
        options: IntelligenceOptions
    ): Promise<{
        accessPatterns: AccessPattern[];
        usageTrends: UsageTrend[];
        performanceMetrics: PerformanceMetric[];
    }> {
        // Simplified analytics - in a real system, this would analyze actual usage data
        return {
            accessPatterns: [
                {
                    pattern: 'regular_access',
                    frequency: memory.metadata?.accessCount || 1,
                    timeRange: 'last_30_days',
                    context: 'search_and_retrieval',
                    confidence: 0.7
                }
            ],
            usageTrends: [
                {
                    trend: 'stable',
                    metric: 'access_frequency',
                    change: 0,
                    period: '30d',
                    significance: 0.5
                }
            ],
            performanceMetrics: [
                {
                    metric: 'retrieval_speed',
                    value: 150,
                    unit: 'ms',
                    benchmark: 100,
                    status: 'good'
                }
            ]
        };
    }

    /**
     * Helper methods
     */
    private async getMemoryDetails(memoryId: string): Promise<Memory | null> {
        try {
            // This would typically be a direct memory fetch
            // For now, we'll use search to find the memory
            const memories = await memoraiMCPClient.searchMemories(memoryId, 'github-copilot', { limit: 1 });
            return memories.find(m => m.structuredKey === memoryId) || null;
        } catch (error) {
            console.error('Failed to get memory details:', error);
            return null;
        }
    }

    private calculateContentSimilarity(analysis1: any, analysis2: any): number {
        // Calculate similarity based on topics and key phrases
        const topics1 = analysis1.topics.map((t: any) => t.topic.toLowerCase());
        const topics2 = analysis2.topics.map((t: any) => t.topic.toLowerCase());

        const commonTopics = topics1.filter((topic: string) => topics2.includes(topic));
        const totalTopics = new Set([...topics1, ...topics2]).size;

        const phrases1 = analysis1.keyPhrases.map((p: any) => p.phrase.toLowerCase());
        const phrases2 = analysis2.keyPhrases.map((p: any) => p.phrase.toLowerCase());

        const commonPhrases = phrases1.filter((phrase: string) => phrases2.includes(phrase));
        const totalPhrases = new Set([...phrases1, ...phrases2]).size;

        // Weighted similarity score
        const topicSimilarity = totalTopics > 0 ? commonTopics.length / totalTopics : 0;
        const phraseSimilarity = totalPhrases > 0 ? commonPhrases.length / totalPhrases : 0;

        return (topicSimilarity * 0.6 + phraseSimilarity * 0.4);
    }

    private isCacheValid(key: string): boolean {
        const expiration = this.cacheExpiration.get(key);
        return expiration ? Date.now() < expiration : false;
    }

    private async analyzeGlobalUsagePatterns(
        memories: Memory[],
        options: IntelligenceOptions
    ): Promise<AccessPattern[]> {
        // Simplified global pattern analysis
        return [
            {
                pattern: 'morning_peak',
                frequency: Math.floor(memories.length * 0.3),
                timeRange: '08:00-10:00',
                context: 'daily_planning',
                confidence: 0.8
            },
            {
                pattern: 'project_focused',
                frequency: Math.floor(memories.length * 0.6),
                timeRange: 'weekdays',
                context: 'work_related',
                confidence: 0.9
            }
        ];
    }

    private async generateGlobalRecommendations(
        memories: Memory[],
        topCategories: Array<{ category: string; count: number; avgImportance: number }>,
        options: IntelligenceOptions
    ): Promise<MemoryInsight[]> {
        const recommendations: MemoryInsight[] = [];

        // Category balance recommendation
        if (topCategories.length > 0 && topCategories[0].count > memories.length * 0.5) {
            recommendations.push({
                type: 'recommendation',
                title: 'Category Imbalance',
                description: `Over 50% of memories are in "${topCategories[0].category}" category`,
                confidence: 0.8,
                impact: 'medium',
                actionable: true,
                suggestedActions: [
                    'Consider diversifying memory content',
                    'Review categorization accuracy',
                    'Create subcategories for better organization'
                ]
            });
        }

        return recommendations;
    }

    private async analyzeGlobalTrends(
        memories: Memory[],
        options: IntelligenceOptions
    ): Promise<UsageTrend[]> {
        // Simplified trend analysis
        const recentMemories = memories.filter(m => {
            const days = (Date.now() - new Date(m.createdAt).getTime()) / (1000 * 60 * 60 * 24);
            return days <= 30;
        });

        return [
            {
                trend: recentMemories.length > memories.length * 0.3 ? 'increasing' : 'stable',
                metric: 'memory_creation',
                change: (recentMemories.length / memories.length) * 100,
                period: '30d',
                significance: 0.7
            }
        ];
    }

    private async generatePerformanceOverview(
        memories: Memory[],
        options: IntelligenceOptions
    ): Promise<PerformanceMetric[]> {
        return [
            {
                metric: 'memory_count',
                value: memories.length,
                unit: 'count',
                benchmark: 100,
                status: memories.length >= 100 ? 'excellent' : 'good'
            },
            {
                metric: 'average_importance',
                value: memories.reduce((sum, m) => sum + m.importance, 0) / memories.length,
                unit: 'score',
                benchmark: 6,
                status: 'good'
            }
        ];
    }

    /**
     * Clear cache
     */
    clearCache(): void {
        this.cache.clear();
        this.cacheExpiration.clear();
    }

    /**
     * Get cache statistics
     */
    getCacheStats(): { size: number; hitRate: number } {
        return {
            size: this.cache.size,
            hitRate: 0.85 // Simplified
        };
    }
}

export default MemoryIntelligenceService;
