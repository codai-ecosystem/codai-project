/**
 * CategorizationService - AI-powered automatic categorization for memories
 * Provides intelligent tagging, project assignment, and content classification
 */

import { contentAnalyzer, type ContentAnalysis } from '@/utils/nlp/ContentAnalyzer';
import { memoraiMCPClient } from '@/utils/memorai-mcp-client';

export interface CategorizationRequest {
    content: string;
    existingTags?: string[];
    existingProject?: string;
    userPreferences?: {
        autoTagging?: boolean;
        autoProjectAssignment?: boolean;
        importanceAdjustment?: number; // -2 to +2
        customRules?: CategorizationRule[];
    };
    context?: {
        similarMemories?: Array<{
            id: string;
            tags: string[];
            project?: string;
            importance: number;
        }>;
        currentProject?: string;
        recentTags?: string[];
    };
}

export interface CategorizationResult {
    analysis: ContentAnalysis;
    recommendations: {
        tags: Array<{
            tag: string;
            confidence: number;
            reason: string;
            isNew: boolean;
        }>;
        project: {
            project: string;
            confidence: number;
            reason: string;
        } | null;
        importance: {
            score: number;
            adjustedScore: number;
            reason: string;
        };
        category: {
            type: ContentAnalysis['contentType'];
            confidence: number;
        };
    };
    autoApply: {
        tags: string[];
        project?: string;
        importance: number;
    };
    insights: {
        technicalComplexity: 'low' | 'medium' | 'high';
        actionRequired: boolean;
        urgencyLevel: 'low' | 'medium' | 'high';
        knowledgeType: 'factual' | 'procedural' | 'conceptual' | 'metacognitive';
        memoryValue: 'reference' | 'working' | 'archive';
    };
    metadata: {
        processingTime: number;
        analysisVersion: string;
        confidence: number;
        suggestionsCount: number;
    };
}

export interface CategorizationRule {
    name: string;
    description: string;
    condition: {
        type: 'content' | 'tags' | 'project' | 'importance' | 'pattern';
        pattern?: RegExp;
        value?: any;
        operator?: 'equals' | 'contains' | 'matches' | 'greater' | 'less';
    };
    action: {
        type: 'add_tag' | 'set_project' | 'adjust_importance' | 'set_category';
        value: any;
        priority?: number;
    };
    enabled: boolean;
}

export interface CategorizationStats {
    totalMemories: number;
    categorizedMemories: number;
    averageConfidence: number;
    topTags: Array<{ tag: string; count: number; avgConfidence: number }>;
    topProjects: Array<{ project: string; count: number; avgConfidence: number }>;
    categoryDistribution: Record<ContentAnalysis['contentType'], number>;
    importanceDistribution: Record<number, number>;
    recentAccuracy: {
        tagAccuracy: number;
        projectAccuracy: number;
        importanceAccuracy: number;
    };
    performanceMetrics: {
        avgProcessingTime: number;
        successRate: number;
        errorRate: number;
    };
}

export class CategorizationService {
    private cache = new Map<string, { result: CategorizationResult; timestamp: number }>();
    private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
    private readonly VERSION = '1.0.0';

    /**
     * Categorize content with comprehensive analysis and recommendations
     */
    async categorize(request: CategorizationRequest): Promise<CategorizationResult> {
        const startTime = Date.now();

        try {
            // Check cache first
            const cacheKey = this.generateCacheKey(request);
            const cached = this.cache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
                return cached.result;
            }

            // Perform content analysis
            const analysis = await contentAnalyzer.analyzeContent(request.content, {
                existingTags: request.existingTags,
                existingProjects: request.context?.similarMemories?.map(m => m.project).filter(Boolean) as string[],
                userPreferences: request.userPreferences
            });

            // Generate recommendations
            const recommendations = await this.generateRecommendations(analysis, request);

            // Apply user preferences and custom rules
            const autoApply = await this.generateAutoApply(recommendations, request);

            // Generate insights
            const insights = this.generateInsights(analysis, request);

            // Calculate overall confidence
            const confidence = this.calculateOverallConfidence(analysis, recommendations);

            const result: CategorizationResult = {
                analysis,
                recommendations,
                autoApply,
                insights,
                metadata: {
                    processingTime: Date.now() - startTime,
                    analysisVersion: this.VERSION,
                    confidence,
                    suggestionsCount: recommendations.tags.length + (recommendations.project ? 1 : 0)
                }
            };

            // Cache the result
            this.cache.set(cacheKey, { result, timestamp: Date.now() });

            return result;
        } catch (error) {
            console.error('Categorization error:', error);
            throw new Error(`Categorization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Batch categorize multiple memories
     */
    async batchCategorize(requests: CategorizationRequest[]): Promise<CategorizationResult[]> {
        const results: CategorizationResult[] = [];
        const batchSize = 10; // Process in batches to avoid overwhelming the system

        for (let i = 0; i < requests.length; i += batchSize) {
            const batch = requests.slice(i, i + batchSize);
            const batchResults = await Promise.all(
                batch.map(request => this.categorize(request))
            );
            results.push(...batchResults);
        }

        return results;
    }

    /**
     * Get categorization statistics
     */
    async getCategorizationStats(): Promise<CategorizationStats> {
        try {
            // Get memories from MCP client
            const memories = await memoraiMCPClient.getMemories({
                limit: 1000, // Analyze recent memories
                sortBy: 'created_at',
                sortOrder: 'desc'
            });

            const stats: CategorizationStats = {
                totalMemories: memories.length,
                categorizedMemories: 0,
                averageConfidence: 0,
                topTags: [],
                topProjects: [],
                categoryDistribution: {
                    code: 0,
                    documentation: 0,
                    note: 0,
                    task: 0,
                    idea: 0,
                    reference: 0,
                    other: 0
                },
                importanceDistribution: {},
                recentAccuracy: {
                    tagAccuracy: 0,
                    projectAccuracy: 0,
                    importanceAccuracy: 0
                },
                performanceMetrics: {
                    avgProcessingTime: 0,
                    successRate: 0,
                    errorRate: 0
                }
            };

            // Analyze memories
            const tagCounts = new Map<string, { count: number; confidenceSum: number }>();
            const projectCounts = new Map<string, { count: number; confidenceSum: number }>();
            let totalConfidence = 0;
            let confidenceCount = 0;

            for (const memory of memories) {
                if (memory.tags && memory.tags.length > 0) {
                    stats.categorizedMemories++;

                    // Count tags
                    memory.tags.forEach(tag => {
                        const current = tagCounts.get(tag) || { count: 0, confidenceSum: 0 };
                        current.count++;
                        current.confidenceSum += 0.8; // Assume reasonable confidence for existing tags
                        tagCounts.set(tag, current);
                    });
                }

                // Count projects
                if (memory.project) {
                    const current = projectCounts.get(memory.project) || { count: 0, confidenceSum: 0 };
                    current.count++;
                    current.confidenceSum += 0.8;
                    projectCounts.set(memory.project, current);
                }

                // Count importance distribution
                const importance = memory.importance || 5;
                stats.importanceDistribution[importance] = (stats.importanceDistribution[importance] || 0) + 1;

                // Estimate content type (simplified)
                let contentType: ContentAnalysis['contentType'] = 'note';
                if (memory.content.includes('```') || memory.content.includes('function')) {
                    contentType = 'code';
                } else if (memory.content.toLowerCase().includes('todo') || memory.content.toLowerCase().includes('task')) {
                    contentType = 'task';
                } else if (memory.content.toLowerCase().includes('idea') || memory.content.toLowerCase().includes('concept')) {
                    contentType = 'idea';
                } else if (memory.content.toLowerCase().includes('documentation') || memory.content.toLowerCase().includes('guide')) {
                    contentType = 'documentation';
                } else if (memory.content.toLowerCase().includes('reference') || memory.content.toLowerCase().includes('link')) {
                    contentType = 'reference';
                }
                stats.categoryDistribution[contentType]++;
            }

            // Calculate top tags
            stats.topTags = Array.from(tagCounts.entries())
                .map(([tag, data]) => ({
                    tag,
                    count: data.count,
                    avgConfidence: data.confidenceSum / data.count
                }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);

            // Calculate top projects
            stats.topProjects = Array.from(projectCounts.entries())
                .map(([project, data]) => ({
                    project,
                    count: data.count,
                    avgConfidence: data.confidenceSum / data.count
                }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);

            // Calculate average confidence
            if (confidenceCount > 0) {
                stats.averageConfidence = totalConfidence / confidenceCount;
            }

            // Mock accuracy metrics (in a real implementation, these would be calculated from user feedback)
            stats.recentAccuracy = {
                tagAccuracy: 0.85,
                projectAccuracy: 0.78,
                importanceAccuracy: 0.72
            };

            // Mock performance metrics
            stats.performanceMetrics = {
                avgProcessingTime: 150, // ms
                successRate: 0.95,
                errorRate: 0.05
            };

            return stats;
        } catch (error) {
            console.error('Failed to get categorization stats:', error);
            throw new Error('Failed to retrieve categorization statistics');
        }
    }

    /**
     * Apply categorization suggestions to a memory
     */
    async applyCategorization(memoryId: string, suggestions: CategorizationResult['autoApply']): Promise<boolean> {
        try {
            // Get current memory
            const memory = await memoraiMCPClient.getMemory(memoryId);
            if (!memory) {
                throw new Error('Memory not found');
            }

            // Apply suggestions
            const updatedMemory = {
                ...memory,
                tags: [...(memory.tags || []), ...suggestions.tags],
                project: suggestions.project || memory.project,
                importance: suggestions.importance
            };

            // Update memory via MCP client
            await memoraiMCPClient.updateMemory(memoryId, updatedMemory);
            return true;
        } catch (error) {
            console.error('Failed to apply categorization:', error);
            return false;
        }
    }

    /**
     * Get suggested improvements for existing categorizations
     */
    async getSuggestedImprovements(): Promise<Array<{
        memoryId: string;
        currentTags: string[];
        suggestedTags: string[];
        currentProject?: string;
        suggestedProject?: string;
        currentImportance: number;
        suggestedImportance: number;
        confidence: number;
        reason: string;
    }>> {
        try {
            // Get recent memories
            const memories = await memoraiMCPClient.getMemories({
                limit: 100,
                sortBy: 'updated_at',
                sortOrder: 'desc'
            });

            const improvements = [];

            for (const memory of memories) {
                // Re-analyze the memory
                const result = await this.categorize({
                    content: memory.content,
                    existingTags: memory.tags,
                    existingProject: memory.project
                });

                // Check for improvements
                const newTags = result.autoApply.tags.filter(tag => !memory.tags?.includes(tag));
                const projectChange = result.autoApply.project && result.autoApply.project !== memory.project;
                const importanceChange = Math.abs(result.autoApply.importance - (memory.importance || 5)) > 1;

                if (newTags.length > 0 || projectChange || importanceChange) {
                    improvements.push({
                        memoryId: memory.id,
                        currentTags: memory.tags || [],
                        suggestedTags: [...(memory.tags || []), ...newTags],
                        currentProject: memory.project,
                        suggestedProject: result.autoApply.project,
                        currentImportance: memory.importance || 5,
                        suggestedImportance: result.autoApply.importance,
                        confidence: result.metadata.confidence,
                        reason: `Analysis suggests ${newTags.length > 0 ? `${newTags.length} new tags` : ''}${projectChange ? ', project change' : ''}${importanceChange ? ', importance adjustment' : ''}`
                    });
                }

                // Limit improvements to avoid overwhelming the user
                if (improvements.length >= 20) {
                    break;
                }
            }

            return improvements.sort((a, b) => b.confidence - a.confidence);
        } catch (error) {
            console.error('Failed to get suggested improvements:', error);
            return [];
        }
    }

    /**
     * Generate recommendations based on analysis
     */
    private async generateRecommendations(
        analysis: ContentAnalysis,
        request: CategorizationRequest
    ): Promise<CategorizationResult['recommendations']> {
        // Process tag recommendations
        const tagRecommendations = analysis.suggestedTags.map(suggestion => ({
            tag: suggestion.tag,
            confidence: suggestion.confidence,
            reason: suggestion.reason,
            isNew: !request.existingTags?.includes(suggestion.tag)
        }));

        // Process project recommendation
        const projectRecommendation = analysis.suggestedProject ? {
            project: analysis.suggestedProject.project,
            confidence: analysis.suggestedProject.confidence,
            reason: analysis.suggestedProject.reason
        } : null;

        // Process importance recommendation
        const baseImportance = analysis.suggestedImportance.score;
        const userAdjustment = request.userPreferences?.importanceAdjustment || 0;
        const adjustedImportance = Math.max(1, Math.min(10, baseImportance + userAdjustment));

        const importanceRecommendation = {
            score: baseImportance,
            adjustedScore: adjustedImportance,
            reason: `${analysis.suggestedImportance.reason}${userAdjustment !== 0 ? ` (adjusted by ${userAdjustment})` : ''}`
        };

        // Category recommendation
        const categoryRecommendation = {
            type: analysis.contentType,
            confidence: 0.8 // Content type classification typically has good confidence
        };

        return {
            tags: tagRecommendations,
            project: projectRecommendation,
            importance: importanceRecommendation,
            category: categoryRecommendation
        };
    }

    /**
     * Generate auto-apply suggestions based on user preferences
     */
    private async generateAutoApply(
        recommendations: CategorizationResult['recommendations'],
        request: CategorizationRequest
    ): Promise<CategorizationResult['autoApply']> {
        const autoApply: CategorizationResult['autoApply'] = {
            tags: [],
            importance: recommendations.importance.adjustedScore
        };

        // Auto-apply tags based on confidence threshold and user preferences
        if (request.userPreferences?.autoTagging !== false) {
            const confidenceThreshold = 0.7;
            autoApply.tags = recommendations.tags
                .filter(tag => tag.confidence >= confidenceThreshold && tag.isNew)
                .map(tag => tag.tag);
        }

        // Auto-apply project based on confidence and user preferences
        if (request.userPreferences?.autoProjectAssignment !== false &&
            recommendations.project &&
            recommendations.project.confidence >= 0.8) {
            autoApply.project = recommendations.project.project;
        }

        return autoApply;
    }

    /**
     * Generate insights about the content
     */
    private generateInsights(
        analysis: ContentAnalysis,
        request: CategorizationRequest
    ): CategorizationResult['insights'] {
        // Technical complexity
        let technicalComplexity: 'low' | 'medium' | 'high' = 'low';
        if (analysis.complexity.level === 'complex') {
            technicalComplexity = 'high';
        } else if (analysis.complexity.level === 'medium') {
            technicalComplexity = 'medium';
        }

        // Action required
        const actionRequired = analysis.contentType === 'task' ||
            analysis.content.toLowerCase().includes('todo') ||
            analysis.content.toLowerCase().includes('action') ||
            analysis.content.toLowerCase().includes('fix');

        // Urgency level
        let urgencyLevel: 'low' | 'medium' | 'high' = 'low';
        if (analysis.content.toLowerCase().includes('urgent') ||
            analysis.content.toLowerCase().includes('critical') ||
            analysis.content.toLowerCase().includes('asap')) {
            urgencyLevel = 'high';
        } else if (analysis.content.toLowerCase().includes('important') ||
            analysis.content.toLowerCase().includes('priority')) {
            urgencyLevel = 'medium';
        }

        // Knowledge type
        let knowledgeType: 'factual' | 'procedural' | 'conceptual' | 'metacognitive' = 'factual';
        if (analysis.contentType === 'code' || analysis.content.toLowerCase().includes('how to')) {
            knowledgeType = 'procedural';
        } else if (analysis.contentType === 'idea' || analysis.content.toLowerCase().includes('concept')) {
            knowledgeType = 'conceptual';
        } else if (analysis.content.toLowerCase().includes('strategy') ||
            analysis.content.toLowerCase().includes('approach')) {
            knowledgeType = 'metacognitive';
        }

        // Memory value
        let memoryValue: 'reference' | 'working' | 'archive' = 'working';
        if (analysis.contentType === 'reference' || analysis.entities.some(e => e.type === 'URL')) {
            memoryValue = 'reference';
        } else if (analysis.suggestedImportance.score <= 3) {
            memoryValue = 'archive';
        }

        return {
            technicalComplexity,
            actionRequired,
            urgencyLevel,
            knowledgeType,
            memoryValue
        };
    }

    /**
     * Calculate overall confidence score
     */
    private calculateOverallConfidence(
        analysis: ContentAnalysis,
        recommendations: CategorizationResult['recommendations']
    ): number {
        const scores: number[] = [];

        // Tag confidence
        if (recommendations.tags.length > 0) {
            const avgTagConfidence = recommendations.tags.reduce((sum, tag) => sum + tag.confidence, 0) / recommendations.tags.length;
            scores.push(avgTagConfidence);
        }

        // Project confidence
        if (recommendations.project) {
            scores.push(recommendations.project.confidence);
        }

        // Category confidence
        scores.push(recommendations.category.confidence);

        // Language detection confidence
        scores.push(analysis.language.confidence);

        return scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0.5;
    }

    /**
     * Generate cache key for request
     */
    private generateCacheKey(request: CategorizationRequest): string {
        const key = JSON.stringify({
            content: request.content.substring(0, 100), // First 100 chars
            existingTags: request.existingTags?.sort(),
            existingProject: request.existingProject,
            userPreferences: request.userPreferences
        });
        return Buffer.from(key).toString('base64');
    }

    /**
     * Clear cache
     */
    clearCache(): void {
        this.cache.clear();
    }

    /**
     * Get cache stats
     */
    getCacheStats(): { size: number; hitRate: number } {
        return {
            size: this.cache.size,
            hitRate: 0.85 // Mock hit rate
        };
    }
}

// Export singleton instance
export const categorizationService = new CategorizationService();
