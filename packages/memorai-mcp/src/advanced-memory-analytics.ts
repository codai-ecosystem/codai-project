/**
 * Advanced Memory Analytics - Phase 4 Implementation
 * Provides memory clustering, temporal analysis, importance decay, and automated insights
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

export interface MemoryCluster {
    id: string;
    label: string;
    memories: StoredMemory[];
    centroid?: number[];
    coherence: number;
    importance: number;
    timeSpan: {
        start: Date;
        end: Date;
        duration: number; // in milliseconds
    };
    keyTopics: string[];
    summary: string;
}

export interface MemoryInsight {
    type: 'cluster' | 'temporal' | 'importance' | 'pattern';
    title: string;
    description: string;
    memories: StoredMemory[];
    confidence: number;
    actionable: boolean;
    recommendation?: string;
}

export interface TemporalPattern {
    pattern: 'daily' | 'weekly' | 'burst' | 'declining' | 'growing';
    confidence: number;
    timeframe: string;
    description: string;
    memoryCount: number;
    avgImportance: number;
}

export class AdvancedMemoryAnalytics {
    private azureClient: OpenAI;
    
    constructor(azureConfig?: any) {
        // Use provided config or environment variables
        const config = azureConfig || {};
        
        this.azureClient = new OpenAI({
            apiKey: config.apiKey || process.env.AZURE_OPENAI_API_KEY || '',
            baseURL: `${(config.endpoint || process.env.AZURE_OPENAI_ENDPOINT || '').replace(/\/$/, '')}/openai/deployments/${config.deploymentName || process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`,
            defaultQuery: { 'api-version': config.apiVersion || process.env.AZURE_OPENAI_API_VERSION || '2024-10-21' },
            defaultHeaders: {
                'api-key': config.apiKey || process.env.AZURE_OPENAI_API_KEY || '',
            },
        });

        console.log('[MemorAI Analytics] Advanced Memory Analytics initialized');
    }

    /**
     * Cluster memories using vector embeddings and semantic similarity
     */
    async clusterMemories(memories: StoredMemory[], clusterCount?: number): Promise<MemoryCluster[]> {
        if (memories.length === 0) return [];
        
        const actualClusterCount = clusterCount || Math.min(Math.ceil(memories.length / 5), 10);
        
        // Extract embeddings for clustering, filter out undefined embeddings
        const validEmbeddings = memories
            .map((m, index) => ({ embedding: m.embeddings, index, memory: m }))
            .filter(item => item.embedding && item.embedding.length > 0);
            
        if (validEmbeddings.length === 0) {
            // Fallback to simple content-based clustering
            return await this.contentBasedClustering(memories, actualClusterCount);
        }

        // K-means clustering on embeddings
        const embeddings = validEmbeddings.map(item => item.embedding as number[]);
        const memoriesWithEmbeddings = validEmbeddings.map(item => item.memory);
        const clusters = await this.performKMeansClustering(memoriesWithEmbeddings, embeddings, actualClusterCount);
        
        // Generate cluster labels and summaries
        const enhancedClusters = await Promise.all(clusters.map(async (cluster, index) => {
            const label = await this.generateClusterLabel(cluster.memories);
            const summary = await this.generateClusterSummary(cluster.memories);
            const keyTopics = this.extractKeyTopics(cluster.memories);
            const timeSpan = this.calculateTimeSpan(cluster.memories);
            const importance = this.calculateClusterImportance(cluster.memories);
            const coherence = this.calculateClusterCoherence(cluster.memories);

            return {
                id: `cluster-${index}`,
                label,
                memories: cluster.memories,
                centroid: cluster.centroid,
                coherence,
                importance,
                timeSpan,
                keyTopics,
                summary
            };
        }));

        return enhancedClusters.sort((a, b) => b.importance - a.importance);
    }

    /**
     * Analyze temporal patterns in memories
     */
    async analyzeTemporalPatterns(memories: StoredMemory[]): Promise<TemporalPattern[]> {
        if (memories.length < 3) return [];

        const patterns: TemporalPattern[] = [];
        const sortedMemories = memories.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        
        // Analyze daily patterns
        const dailyPattern = this.analyzeDailyPattern(sortedMemories);
        if (dailyPattern.confidence > 0.3) patterns.push(dailyPattern);
        
        // Analyze weekly patterns
        const weeklyPattern = this.analyzeWeeklyPattern(sortedMemories);
        if (weeklyPattern.confidence > 0.3) patterns.push(weeklyPattern);
        
        // Analyze burst patterns
        const burstPattern = this.analyzeBurstPattern(sortedMemories);
        if (burstPattern.confidence > 0.4) patterns.push(burstPattern);
        
        // Analyze trend patterns
        const trendPattern = this.analyzeTrendPattern(sortedMemories);
        if (trendPattern.confidence > 0.3) patterns.push(trendPattern);

        return patterns.sort((a, b) => b.confidence - a.confidence);
    }

    /**
     * Apply importance decay over time
     */
    applyImportanceDecay(memories: StoredMemory[], decayRate: number = 0.1): StoredMemory[] {
        const now = new Date().getTime();
        const dayInMs = 24 * 60 * 60 * 1000;

        return memories.map(memory => {
            const age = (now - new Date(memory.timestamp).getTime()) / dayInMs;
            const decayFactor = Math.exp(-decayRate * age);
            const currentImportance = memory.metadata.importance || 5;
            const decayedImportance = Math.max(1, currentImportance * decayFactor);

            return {
                ...memory,
                metadata: {
                    ...memory.metadata,
                    importance: decayedImportance,
                    decayApplied: true,
                    originalImportance: currentImportance,
                    decayFactor
                }
            };
        });
    }

    /**
     * Generate intelligent insights from memory patterns
     */
    async generateInsights(agentId: string, memories: StoredMemory[]): Promise<MemoryInsight[]> {
        const insights: MemoryInsight[] = [];
        
        // Cluster-based insights
        const clusters = await this.clusterMemories(memories);
        for (const cluster of clusters.slice(0, 3)) { // Top 3 clusters
            insights.push({
                type: 'cluster',
                title: `Key Topic: ${cluster.label}`,
                description: `You have ${cluster.memories.length} memories about ${cluster.label}. ${cluster.summary}`,
                memories: cluster.memories,
                confidence: cluster.coherence,
                actionable: cluster.importance > 7,
                recommendation: cluster.importance > 7 
                    ? `Consider consolidating or summarizing these memories for better efficiency.`
                    : undefined
            });
        }
        
        // Temporal insights
        const temporalPatterns = await this.analyzeTemporalPatterns(memories);
        for (const pattern of temporalPatterns.slice(0, 2)) { // Top 2 patterns
            insights.push({
                type: 'temporal',
                title: `${pattern.pattern.charAt(0).toUpperCase() + pattern.pattern.slice(1)} Pattern Detected`,
                description: pattern.description,
                memories: memories.filter(m => this.isInPattern(m, pattern)),
                confidence: pattern.confidence,
                actionable: pattern.confidence > 0.7,
                recommendation: pattern.confidence > 0.7 
                    ? `This pattern suggests regular activity. Consider setting up automated summaries.`
                    : undefined
            });
        }
        
        // Importance insights
        const highImportanceMemories = memories.filter(m => (m.metadata.importance || 5) > 8);
        if (highImportanceMemories.length > 0) {
            insights.push({
                type: 'importance',
                title: `High Importance Memories`,
                description: `You have ${highImportanceMemories.length} high-importance memories that should be preserved.`,
                memories: highImportanceMemories,
                confidence: 0.9,
                actionable: true,
                recommendation: 'Consider backing up or highlighting these critical memories.'
            });
        }

        return insights.sort((a, b) => b.confidence - a.confidence);
    }

    /**
     * Automated memory lifecycle management
     */
    async performMemoryLifecycleManagement(memories: StoredMemory[]): Promise<{
        toArchive: StoredMemory[];
        toCompress: StoredMemory[];
        toDelete: StoredMemory[];
        suggestions: string[];
    }> {
        const now = new Date().getTime();
        const dayInMs = 24 * 60 * 60 * 1000;
        const weekInMs = 7 * dayInMs;
        const monthInMs = 30 * dayInMs;

        const toArchive: StoredMemory[] = [];
        const toCompress: StoredMemory[] = [];
        const toDelete: StoredMemory[] = [];
        const suggestions: string[] = [];

        for (const memory of memories) {
            const age = (now - new Date(memory.timestamp).getTime()) / dayInMs;
            const importance = memory.metadata.importance || 5;
            
            // Old, low-importance memories -> delete
            if (age > 90 && importance < 3) {
                toDelete.push(memory);
            }
            // Medium age, medium importance -> archive
            else if (age > 30 && importance < 6) {
                toArchive.push(memory);
            }
            // Large content, older than a week -> compress
            else if (memory.content.length > 1000 && age > 7) {
                toCompress.push(memory);
            }
        }

        // Generate suggestions
        if (toArchive.length > 0) {
            suggestions.push(`${toArchive.length} memories can be archived to improve performance.`);
        }
        if (toCompress.length > 0) {
            suggestions.push(`${toCompress.length} large memories can be compressed to save space.`);
        }
        if (toDelete.length > 0) {
            suggestions.push(`${toDelete.length} old, low-importance memories can be safely deleted.`);
        }

        return { toArchive, toCompress, toDelete, suggestions };
    }

    // Private helper methods

    private async contentBasedClustering(memories: StoredMemory[], clusterCount: number): Promise<MemoryCluster[]> {
        // Simple content-based clustering fallback
        const wordFreq = new Map<string, StoredMemory[]>();
        
        memories.forEach(memory => {
            const words = memory.content.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
            const keyWords = words.slice(0, 3); // Use first 3 significant words
            
            keyWords.forEach((word: string) => {
                if (!wordFreq.has(word)) wordFreq.set(word, []);
                wordFreq.get(word)!.push(memory);
            });
        });
        
        // Create clusters from most common words
        const sortedWords = Array.from(wordFreq.entries())
            .sort((a, b) => b[1].length - a[1].length)
            .slice(0, clusterCount);
            
        const clusters: MemoryCluster[] = await Promise.all(
            sortedWords.map(async ([word, mems], index) => {
                const label = await this.generateClusterLabel(mems);
                const summary = await this.generateClusterSummary(mems);
                const keyTopics = this.extractKeyTopics(mems);
                const timeSpan = this.calculateTimeSpan(mems);
                const importance = this.calculateClusterImportance(mems);
                const coherence = this.calculateClusterCoherence(mems);

                return {
                    id: `cluster-${index}`,
                    label,
                    memories: mems,
                    coherence,
                    importance,
                    timeSpan,
                    keyTopics,
                    summary
                };
            })
        );
        
        return clusters;
    }

    private async performKMeansClustering(
        memories: StoredMemory[], 
        embeddings: number[][], 
        clusterCount: number
    ): Promise<{memories: StoredMemory[], centroid: number[]}[]> {
        // Simple k-means implementation
        const dim = embeddings[0].length;
        let centroids = this.initializeCentroids(clusterCount, dim);
        let clusters: {memories: StoredMemory[], centroid: number[]}[] = [];
        
        // K-means iterations
        for (let iter = 0; iter < 10; iter++) {
            // Assign points to closest centroid
            clusters = centroids.map(c => ({ memories: [], centroid: c }));
            
            embeddings.forEach((embedding, index) => {
                let closestCluster = 0;
                let closestDistance = this.euclideanDistance(embedding, centroids[0]);
                
                for (let i = 1; i < centroids.length; i++) {
                    const distance = this.euclideanDistance(embedding, centroids[i]);
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestCluster = i;
                    }
                }
                
                clusters[closestCluster].memories.push(memories[index]);
            });
            
            // Update centroids
            centroids = clusters.map(cluster => {
                if (cluster.memories.length === 0) return cluster.centroid;
                
                const clusterEmbeddings = cluster.memories
                    .map(m => m.embeddings)
                    .filter((e): e is number[] => e != null && e.length > 0);
                    
                if (clusterEmbeddings.length === 0) return cluster.centroid;
                
                const newCentroid = new Array(dim).fill(0);
                clusterEmbeddings.forEach(embedding => {
                    embedding.forEach((val: number, i: number) => newCentroid[i] += val);
                });
                return newCentroid.map(val => val / clusterEmbeddings.length);
            });
        }
        
        return clusters.filter(c => c.memories.length > 0);
    }

    private initializeCentroids(count: number, dim: number): number[][] {
        return Array.from({ length: count }, () => 
            Array.from({ length: dim }, () => Math.random() - 0.5)
        );
    }

    private euclideanDistance(a: number[], b: number[]): number {
        return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
    }

    private async generateClusterLabel(memories: StoredMemory[]): Promise<string> {
        if (memories.length === 0) return 'Empty Cluster';
        
        // Extract key terms from memory content
        const combinedContent = memories.map(m => m.content).join(' ');
        const words = combinedContent.toLowerCase().split(/\s+/)
            .filter(w => w.length > 3)
            .reduce((freq, word) => {
                freq[word] = (freq[word] || 0) + 1;
                return freq;
            }, {} as Record<string, number>);
            
        const topWords = Object.entries(words)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([word]) => word);
            
        return topWords.join(' & ') || `Cluster of ${memories.length} memories`;
    }

    private async generateClusterSummary(memories: StoredMemory[]): Promise<string> {
        if (memories.length === 0) return 'No memories in cluster';
        if (memories.length === 1) return memories[0].content.slice(0, 100) + '...';
        
        const combinedLength = memories.reduce((sum, m) => sum + m.content.length, 0);
        const avgImportance = memories.reduce((sum, m) => sum + (m.metadata.importance || 5), 0) / memories.length;
        
        return `${memories.length} related memories covering ${Math.round(combinedLength / 1000)}k characters, average importance: ${avgImportance.toFixed(1)}`;
    }

    private extractKeyTopics(memories: StoredMemory[]): string[] {
        const allContent = memories.map(m => m.content).join(' ').toLowerCase();
        const words = allContent.split(/\s+/).filter(w => w.length > 4);
        
        const wordFreq = words.reduce((freq, word) => {
            freq[word] = (freq[word] || 0) + 1;
            return freq;
        }, {} as Record<string, number>);
        
        return Object.entries(wordFreq)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([word]) => word);
    }

    private calculateTimeSpan(memories: StoredMemory[]): {start: Date, end: Date, duration: number} {
        if (memories.length === 0) {
            const now = new Date();
            return { start: now, end: now, duration: 0 };
        }
        
        const timestamps = memories.map(m => new Date(m.timestamp).getTime());
        const start = new Date(Math.min(...timestamps));
        const end = new Date(Math.max(...timestamps));
        const duration = end.getTime() - start.getTime();
        
        return { start, end, duration };
    }

    private calculateClusterImportance(memories: StoredMemory[]): number {
        if (memories.length === 0) return 0;
        
        const avgImportance = memories.reduce((sum, m) => sum + (m.metadata.importance || 5), 0) / memories.length;
        const sizeFactor = Math.min(memories.length / 10, 2); // Bonus for larger clusters
        
        return avgImportance * sizeFactor;
    }

    private calculateClusterCoherence(memories: StoredMemory[]): number {
        if (memories.length < 2) return 1.0;
        
        // Calculate average pairwise similarity of embeddings
        const embeddings = memories
            .map(m => m.embeddings)
            .filter((e): e is number[] => e != null && e.length > 0);
            
        if (embeddings.length < 2) return 0.5;
        
        let totalSimilarity = 0;
        let pairs = 0;
        
        for (let i = 0; i < embeddings.length; i++) {
            for (let j = i + 1; j < embeddings.length; j++) {
                totalSimilarity += this.cosineSimilarity(embeddings[i], embeddings[j]);
                pairs++;
            }
        }
        
        return pairs > 0 ? totalSimilarity / pairs : 0.5;
    }

    private cosineSimilarity(a: number[], b: number[]): number {
        if (!a || !b || a.length !== b.length) return 0;
        
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        
        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        
        const denominator = Math.sqrt(normA) * Math.sqrt(normB);
        return denominator === 0 ? 0 : dotProduct / denominator;
    }

    // Temporal analysis methods
    private analyzeDailyPattern(memories: StoredMemory[]): TemporalPattern {
        const hourCounts = new Array(24).fill(0);
        memories.forEach(m => {
            const hour = new Date(m.timestamp).getHours();
            hourCounts[hour]++;
        });
        
        const maxHour = hourCounts.indexOf(Math.max(...hourCounts));
        const variance = this.calculateVariance(hourCounts);
        const confidence = Math.min(variance / 10, 1.0); // Simple confidence measure
        
        return {
            pattern: 'daily',
            confidence,
            timeframe: `Peak activity at ${maxHour}:00`,
            description: `Memory activity peaks around ${maxHour}:00 with ${Math.max(...hourCounts)} memories`,
            memoryCount: memories.length,
            avgImportance: memories.reduce((sum, m) => sum + (m.metadata.importance || 5), 0) / memories.length
        };
    }

    private analyzeWeeklyPattern(memories: StoredMemory[]): TemporalPattern {
        const dayCounts = new Array(7).fill(0);
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        memories.forEach(m => {
            const day = new Date(m.timestamp).getDay();
            dayCounts[day]++;
        });
        
        const maxDay = dayCounts.indexOf(Math.max(...dayCounts));
        const variance = this.calculateVariance(dayCounts);
        const confidence = Math.min(variance / 20, 1.0);
        
        return {
            pattern: 'weekly',
            confidence,
            timeframe: `Peak on ${dayNames[maxDay]}s`,
            description: `Most active on ${dayNames[maxDay]}s with ${Math.max(...dayCounts)} memories`,
            memoryCount: memories.length,
            avgImportance: memories.reduce((sum, m) => sum + (m.metadata.importance || 5), 0) / memories.length
        };
    }

    private analyzeBurstPattern(memories: StoredMemory[]): TemporalPattern {
        const sortedMemories = memories.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        const intervals: number[] = [];
        
        for (let i = 1; i < sortedMemories.length; i++) {
            const interval = new Date(sortedMemories[i].timestamp).getTime() - new Date(sortedMemories[i-1].timestamp).getTime();
            intervals.push(interval);
        }
        
        if (intervals.length === 0) {
            return {
                pattern: 'burst',
                confidence: 0,
                timeframe: 'No pattern',
                description: 'Insufficient data for burst analysis',
                memoryCount: memories.length,
                avgImportance: 5
            };
        }
        
        const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;
        const shortIntervals = intervals.filter(i => i < avgInterval / 3).length;
        const confidence = shortIntervals / intervals.length;
        
        return {
            pattern: 'burst',
            confidence,
            timeframe: `${shortIntervals} burst periods detected`,
            description: `${Math.round(confidence * 100)}% of memories created in burst periods`,
            memoryCount: memories.length,
            avgImportance: memories.reduce((sum, m) => sum + (m.metadata.importance || 5), 0) / memories.length
        };
    }

    private analyzeTrendPattern(memories: StoredMemory[]): TemporalPattern {
        if (memories.length < 7) {
            return {
                pattern: 'declining',
                confidence: 0,
                timeframe: 'Insufficient data',
                description: 'Need at least 7 memories for trend analysis',
                memoryCount: memories.length,
                avgImportance: 5
            };
        }
        
        const sortedMemories = memories.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        const weeklyBuckets = this.bucketByWeek(sortedMemories);
        const counts = weeklyBuckets.map(bucket => bucket.length);
        
        const trend = this.calculateTrend(counts);
        const confidence = Math.abs(trend) > 0.1 ? Math.min(Math.abs(trend), 1.0) : 0;
        
        const pattern = trend > 0.1 ? 'growing' : trend < -0.1 ? 'declining' : 'declining';
        
        return {
            pattern,
            confidence,
            timeframe: `${counts.length} week trend`,
            description: `Memory creation is ${pattern} with ${confidence > 0.5 ? 'strong' : 'weak'} confidence`,
            memoryCount: memories.length,
            avgImportance: memories.reduce((sum, m) => sum + (m.metadata.importance || 5), 0) / memories.length
        };
    }

    private calculateVariance(values: number[]): number {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        return variance;
    }

    private bucketByWeek(memories: StoredMemory[]): StoredMemory[][] {
        const buckets: StoredMemory[][] = [];
        let currentBucket: StoredMemory[] = [];
        let currentWeekStart = -1;
        
        memories.forEach(memory => {
            const timestamp = new Date(memory.timestamp).getTime();
            const weekStart = Math.floor(timestamp / (7 * 24 * 60 * 60 * 1000));
            
            if (weekStart !== currentWeekStart) {
                if (currentBucket.length > 0) {
                    buckets.push(currentBucket);
                }
                currentBucket = [];
                currentWeekStart = weekStart;
            }
            
            currentBucket.push(memory);
        });
        
        if (currentBucket.length > 0) {
            buckets.push(currentBucket);
        }
        
        return buckets;
    }

    private calculateTrend(values: number[]): number {
        if (values.length < 2) return 0;
        
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        const n = values.length;
        
        values.forEach((y, x) => {
            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumXX += x * x;
        });
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        return isNaN(slope) ? 0 : slope;
    }

    private isInPattern(memory: StoredMemory, pattern: TemporalPattern): boolean {
        // Simple heuristic to determine if a memory fits a temporal pattern
        const timestamp = new Date(memory.timestamp);
        
        switch (pattern.pattern) {
            case 'daily':
                // Memories during peak hours
                const hour = timestamp.getHours();
                const peakHour = parseInt(pattern.timeframe.match(/\d+/)?.[0] || '12');
                return Math.abs(hour - peakHour) <= 2;
                
            case 'weekly':
                // Memories on peak days
                const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][timestamp.getDay()];
                return pattern.timeframe.includes(dayName);
                
            default:
                return false;
        }
    }
}