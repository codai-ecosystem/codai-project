/**
 * Intelligent Memory Summarization - Phase 4 Implementation
 * Provides automated summarization, compression, and intelligent memory consolidation
 */

import { OpenAI } from 'openai';

// Import types from enhanced-memory-store
interface MemoryMetadata {
    importance?: number;
    entityType?: string;
    priority?: string;
    project?: string;
    session?: string;
    tags?: string[];
    [key: string]: any;
}

interface StoredMemory {
    id: string;
    agentId: string;
    content: string;
    metadata: MemoryMetadata;
    structuredKey: string;
    timestamp: string;
    embeddings?: number[];
    crossAgent?: boolean;
    sourceAgent?: string;
}

export interface SummarizedMemory {
    id: string;
    originalIds: string[];
    agentId: string;
    content: string;
    summary: string;
    keyPoints: string[];
    metadata: MemoryMetadata & {
        originalCount: number;
        compressionRatio: number;
        summarizedAt: string;
        qualityScore: number;
    };
    structuredKey: string;
    timestamp: string;
    embeddings?: number[];
}

export interface SummarizationOptions {
    maxLength?: number;
    preserveDetails?: boolean;
    includeKeyPoints?: boolean;
    summaryStyle?: 'concise' | 'detailed' | 'bullet-points' | 'narrative';
    qualityThreshold?: number;
}

export class IntelligentMemorySummarization {
    private azureClient: OpenAI;

    constructor(azureConfig?: any) {
        // Use provided config or environment variables
        const config = azureConfig || {};

        this.azureClient = new OpenAI({
            apiKey: config.apiKey || process.env.AZURE_OPENAI_API_KEY || '',
            baseURL: `${(config.endpoint || process.env.AZURE_OPENAI_ENDPOINT || '').replace(/\/$/, '')}/openai/deployments/${config.chatDeploymentName || 'gpt-4o'}`,
            defaultQuery: { 'api-version': config.apiVersion || process.env.AZURE_OPENAI_API_VERSION || '2024-10-21' },
            defaultHeaders: {
                'api-key': config.apiKey || process.env.AZURE_OPENAI_API_KEY || '',
            },
        });

        console.log('[MemorAI Summarization] Intelligent Memory Summarization initialized');
    }

    /**
     * Summarize a group of related memories
     */
    async summarizeMemories(
        memories: StoredMemory[],
        options: SummarizationOptions = {}
    ): Promise<SummarizedMemory> {
        const {
            maxLength = 500,
            preserveDetails = false,
            includeKeyPoints = true,
            summaryStyle = 'concise',
            qualityThreshold = 0.7
        } = options;

        if (memories.length === 0) {
            throw new Error('Cannot summarize empty memory list');
        }

        if (memories.length === 1) {
            // For single memory, create a light summary
            return this.createSingleMemorySummary(memories[0], options);
        }

        // Generate summary using LLM
        const summary = await this.generateLLMSummary(memories, summaryStyle, maxLength);

        // Extract key points
        const keyPoints = includeKeyPoints
            ? await this.extractKeyPoints(memories, summary)
            : [];

        // Calculate quality score
        const qualityScore = await this.calculateSummaryQuality(memories, summary);

        // Create combined metadata
        const combinedMetadata = this.combineMembdatatoMetadata(memories);

        // Calculate compression ratio
        const originalLength = memories.reduce((sum, m) => sum + m.content.length, 0);
        const compressionRatio = summary.length / originalLength;

        const summarizedMemory: SummarizedMemory = {
            id: `summary-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            originalIds: memories.map(m => m.id),
            agentId: memories[0].agentId,
            content: this.createCombinedContent(memories, summary),
            summary,
            keyPoints,
            metadata: {
                ...combinedMetadata,
                originalCount: memories.length,
                compressionRatio,
                summarizedAt: new Date().toISOString(),
                qualityScore
            },
            structuredKey: this.generateSummaryStructuredKey(memories),
            timestamp: new Date().toISOString(),
            embeddings: await this.generateSummaryEmbeddings(summary)
        };

        return summarizedMemory;
    }

    /**
     * Batch summarize multiple memory groups
     */
    async batchSummarize(
        memoryGroups: StoredMemory[][],
        options: SummarizationOptions = {}
    ): Promise<SummarizedMemory[]> {
        const summaries: SummarizedMemory[] = [];

        for (const group of memoryGroups) {
            try {
                const summary = await this.summarizeMemories(group, options);
                summaries.push(summary);
            } catch (error) {
                console.error('[MemorAI Summarization] Failed to summarize group:', error);
                // Continue with other groups
            }
        }

        return summaries;
    }

    /**
     * Intelligent memory compression for storage efficiency
     */
    async compressMemories(memories: StoredMemory[]): Promise<{
        compressed: SummarizedMemory[];
        savings: {
            originalSize: number;
            compressedSize: number;
            compressionRatio: number;
            spaceSaved: number;
        };
    }> {
        // Group similar memories for compression
        const groups = await this.groupSimilarMemories(memories);

        // Compress each group
        const compressed = await this.batchSummarize(groups, {
            summaryStyle: 'concise',
            maxLength: 300,
            includeKeyPoints: true
        });

        // Calculate compression savings
        const originalSize = memories.reduce((sum, m) => sum + m.content.length, 0);
        const compressedSize = compressed.reduce((sum, s) => sum + s.content.length, 0);
        const compressionRatio = compressedSize / originalSize;
        const spaceSaved = originalSize - compressedSize;

        return {
            compressed,
            savings: {
                originalSize,
                compressedSize,
                compressionRatio,
                spaceSaved
            }
        };
    }

    /**
     * Create progressive summaries for different detail levels
     */
    async createProgressiveSummary(memories: StoredMemory[]): Promise<{
        brief: string;
        standard: string;
        detailed: string;
        keyPoints: string[];
        timeline: string[];
    }> {
        const [brief, standard, detailed, keyPoints] = await Promise.all([
            this.generateLLMSummary(memories, 'concise', 150),
            this.generateLLMSummary(memories, 'narrative', 300),
            this.generateLLMSummary(memories, 'detailed', 500),
            this.extractKeyPoints(memories)
        ]);

        const timeline = this.createTimeline(memories);

        return { brief, standard, detailed, keyPoints, timeline };
    }

    // Private helper methods

    private async generateLLMSummary(
        memories: StoredMemory[],
        style: string,
        maxLength: number
    ): Promise<string> {
        const combinedContent = memories.map((m, index) =>
            `[Memory ${index + 1}] ${m.content}`
        ).join('\n\n');

        const stylePrompts = {
            concise: 'Create a concise summary that captures the main points.',
            detailed: 'Create a detailed summary that preserves important context and nuances.',
            'bullet-points': 'Create a summary using bullet points for easy reading.',
            narrative: 'Create a narrative summary that tells the story of these memories.'
        };

        const prompt = `Please summarize the following memories in a ${style} style (maximum ${maxLength} characters):

${combinedContent}

${stylePrompts[style as keyof typeof stylePrompts] || stylePrompts.concise}

Focus on:
- Key themes and patterns
- Important decisions or insights
- Actionable information
- Temporal relationships

Summary:`;

        try {
            const response = await this.azureClient.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: 'You are an expert at creating high-quality memory summaries for AI systems.' },
                    { role: 'user', content: prompt }
                ],
                max_tokens: Math.ceil(maxLength / 2), // Rough token estimation
                temperature: 0.1
            });

            return response.choices[0]?.message?.content?.trim() || 'Summary generation failed';
        } catch (error) {
            console.error('[MemorAI Summarization] LLM summary generation failed:', error);
            return this.createFallbackSummary(memories, maxLength);
        }
    }

    private async extractKeyPoints(memories: StoredMemory[], summary?: string): Promise<string[]> {
        const content = summary || memories.map(m => m.content).join(' ');

        const prompt = `Extract 3-7 key points from this content:

${content}

Provide key points as a simple list:`;

        try {
            const response = await this.azureClient.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: 'You are an expert at extracting key points from text.' },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 200,
                temperature: 0.1
            });

            const points = response.choices[0]?.message?.content?.trim().split('\n')
                .filter(line => line.trim())
                .map(line => line.replace(/^[-•*]\s*/, '').trim())
                .slice(0, 7);

            return points || this.extractFallbackKeyPoints(memories);
        } catch (error) {
            console.error('[MemorAI Summarization] Key point extraction failed:', error);
            return this.extractFallbackKeyPoints(memories);
        }
    }

    private async calculateSummaryQuality(memories: StoredMemory[], summary: string): Promise<number> {
        // Simple quality score based on several factors
        let score = 0.5; // Base score

        // Length appropriateness (not too short or too long)
        const totalOriginalLength = memories.reduce((sum, m) => sum + m.content.length, 0);
        const compressionRatio = summary.length / totalOriginalLength;

        if (compressionRatio >= 0.1 && compressionRatio <= 0.5) {
            score += 0.2; // Good compression ratio
        }

        // Content coverage (simple keyword overlap)
        const originalWords = new Set(
            memories.map(m => m.content.toLowerCase().split(/\s+/))
                .flat()
                .filter(w => w.length > 3)
        );
        const summaryWords = new Set(
            summary.toLowerCase().split(/\s+/).filter(w => w.length > 3)
        );

        const overlap = Array.from(originalWords).filter(w => summaryWords.has(w)).length;
        const coverage = overlap / originalWords.size;
        score += coverage * 0.3;

        return Math.min(1.0, score);
    }

    private combineMembdatatoMetadata(memories: StoredMemory[]): MemoryMetadata {
        const combined: MemoryMetadata = {};

        // Combine importance (use max)
        const importances = memories.map(m => m.metadata.importance || 5);
        combined.importance = Math.max(...importances);

        // Combine entity types
        const entityTypes = new Set(memories.map(m => m.metadata.entityType).filter(Boolean));
        if (entityTypes.size > 0) {
            combined.entityType = Array.from(entityTypes).join(', ');
        }

        // Combine projects
        const projects = new Set(memories.map(m => m.metadata.project).filter(Boolean));
        if (projects.size > 0) {
            combined.project = Array.from(projects).join(', ');
        }

        // Combine tags
        const allTags = memories.map(m => m.metadata.tags || []).flat();
        const uniqueTags = Array.from(new Set(allTags));
        if (uniqueTags.length > 0) {
            combined.tags = uniqueTags;
        }

        return combined;
    }

    private createCombinedContent(memories: StoredMemory[], summary: string): string {
        const originalIds = memories.map(m => m.id);
        return `SUMMARY: ${summary}\n\nORIGINAL MEMORIES (${memories.length}): ${originalIds.join(', ')}`;
    }

    private generateSummaryStructuredKey(memories: StoredMemory[]): string {
        const agentId = memories[0].agentId;
        const timestamp = new Date().toISOString().split('T')[0];
        const count = memories.length;
        return `${agentId}_summary_${timestamp}_${count}memories`;
    }

    private async generateSummaryEmbeddings(summary: string): Promise<number[]> {
        try {
            const response = await this.azureClient.embeddings.create({
                model: 'text-embedding-3-large',
                input: summary
            });

            return response.data[0].embedding;
        } catch (error) {
            console.error('[MemorAI Summarization] Failed to generate embeddings for summary:', error);
            return [];
        }
    }

    private async createSingleMemorySummary(
        memory: StoredMemory,
        options: SummarizationOptions
    ): Promise<SummarizedMemory> {
        const summary = memory.content.length > 200
            ? memory.content.substring(0, 200) + '...'
            : memory.content;

        return {
            id: `summary-single-${memory.id}`,
            originalIds: [memory.id],
            agentId: memory.agentId,
            content: memory.content,
            summary,
            keyPoints: [summary],
            metadata: {
                ...memory.metadata,
                originalCount: 1,
                compressionRatio: summary.length / memory.content.length,
                summarizedAt: new Date().toISOString(),
                qualityScore: 0.8
            },
            structuredKey: `${memory.structuredKey}_summary`,
            timestamp: memory.timestamp,
            embeddings: memory.embeddings
        };
    }

    private async groupSimilarMemories(memories: StoredMemory[]): Promise<StoredMemory[][]> {
        // Simple grouping by content similarity (fallback approach)
        const groups: StoredMemory[][] = [];
        const processed = new Set<string>();

        for (const memory of memories) {
            if (processed.has(memory.id)) continue;

            const group = [memory];
            processed.add(memory.id);

            // Find similar memories
            for (const otherMemory of memories) {
                if (processed.has(otherMemory.id)) continue;

                // Simple similarity check based on content overlap
                if (this.calculateContentSimilarity(memory.content, otherMemory.content) > 0.3) {
                    group.push(otherMemory);
                    processed.add(otherMemory.id);
                }
            }

            groups.push(group);
        }

        return groups;
    }

    private calculateContentSimilarity(content1: string, content2: string): number {
        const words1 = new Set(content1.toLowerCase().split(/\s+/));
        const words2 = new Set(content2.toLowerCase().split(/\s+/));

        const intersection = Array.from(words1).filter(w => words2.has(w));
        const union = new Set([...words1, ...words2]);

        return intersection.length / union.size;
    }

    private createFallbackSummary(memories: StoredMemory[], maxLength: number): string {
        const combinedContent = memories.map(m => m.content).join(' ');
        const words = combinedContent.split(/\s+/);

        // Extract first sentences or key phrases
        const sentences = combinedContent.split(/[.!?]+/).filter(s => s.trim());
        let summary = '';

        for (const sentence of sentences) {
            if (summary.length + sentence.length + 2 <= maxLength) {
                summary += sentence.trim() + '. ';
            } else {
                break;
            }
        }

        return summary.trim() || combinedContent.substring(0, maxLength) + '...';
    }

    private extractFallbackKeyPoints(memories: StoredMemory[]): string[] {
        // Extract most frequent meaningful words as key points
        const allWords = memories.map(m => m.content.toLowerCase().split(/\s+/))
            .flat()
            .filter(w => w.length > 3);

        const wordFreq = allWords.reduce((freq, word) => {
            freq[word] = (freq[word] || 0) + 1;
            return freq;
        }, {} as Record<string, number>);

        return Object.entries(wordFreq)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([word]) => word);
    }

    private createTimeline(memories: StoredMemory[]): string[] {
        const sorted = memories.sort((a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        return sorted.map(m => {
            const date = new Date(m.timestamp).toLocaleDateString();
            const preview = m.content.substring(0, 50) + '...';
            return `${date}: ${preview}`;
        });
    }
}