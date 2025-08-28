/**
 * Memory Clustering Engine - US-MEM-001 Implementation
 * Advanced Memory Clustering & Organization for MemorAI
 * 
 * Sprint: MemorAI Enhancement Sprint (Aug 27 - Sep 9, 2025)
 * User Story: US-MEM-001 (5 SP)
 */

import { OpenAI } from 'openai';

export interface ClusterableMemory {
    id: string;
    agentId: string;
    content: string;
    metadata: {
        importance?: number;
        entityType?: string;
        priority?: string;
        project?: string;
        session?: string;
        tags?: string[];
        [key: string]: any;
    };
    embeddings?: number[];
    timestamp: string;
}

export interface MemoryCluster {
    id: string;
    name: string;
    description: string;
    memories: ClusterableMemory[];
    centroid: number[];
    themes: string[];
    size: number;
    coherenceScore: number;
    importanceScore: number;
    timeRange: {
        start: string;
        end: string;
    };
    tags: string[];
    relationships: {
        clusterId: string;
        relationshipType: 'similar' | 'sequential' | 'hierarchical';
        strength: number;
    }[];
}

export interface TopicCategory {
    name: string;
    keywords: string[];
    weight: number;
    examples: string[];
}

export interface ClusteringOptions {
    targetClusters?: number;
    minClusterSize?: number;
    maxIterations?: number;
    convergenceThreshold?: number;
    useSemanticEnhancement?: boolean;
    temporalWeight?: number;
    importanceWeight?: number;
}

export interface ClusteringResult {
    clusters: MemoryCluster[];
    metrics: {
        totalClusters: number;
        averageClusterSize: number;
        silhouetteScore: number;
        cohesionScore: number;
        separationScore: number;
    };
    recommendations: string[];
    hierarchy: ClusterHierarchy[];
}

export interface ClusterHierarchy {
    level: number;
    clusterId: string;
    parentId?: string;
    children: string[];
    mergeDistance: number;
}

/**
 * Advanced K-means clustering implementation with semantic enhancement
 */
class SemanticKMeans {
    private centroids: number[][] = [];
    private assignments: number[] = [];
    private readonly maxIterations: number;
    private readonly convergenceThreshold: number;

    constructor(
        private k: number,
        maxIterations: number = 100,
        convergenceThreshold: number = 1e-4
    ) {
        this.maxIterations = maxIterations;
        this.convergenceThreshold = convergenceThreshold;
    }

    /**
     * Perform K-means clustering with semantic awareness
     */
    async cluster(
        memories: ClusterableMemory[],
        features: number[][]
    ): Promise<{ assignments: number[]; centroids: number[][]; iterations: number }> {
        if (memories.length === 0 || features.length === 0) {
            return { assignments: [], centroids: [], iterations: 0 };
        }

        // Ensure k is not larger than data points
        const actualK = Math.min(this.k, memories.length);

        // Initialize centroids using K-means++ for better initial placement
        this.initializeCentroidsKMeansPlusPlus(features, actualK);
        this.assignments = new Array(memories.length).fill(0);

        let iterations = 0;
        let hasConverged = false;

        while (iterations < this.maxIterations && !hasConverged) {
            const oldCentroids = this.centroids.map(c => [...c]);

            // Assignment step: assign each point to nearest centroid
            for (let i = 0; i < memories.length; i++) {
                let minDistance = Infinity;
                let bestCluster = 0;

                for (let j = 0; j < actualK; j++) {
                    // Enhanced distance calculation with temporal and importance weighting
                    const distance = this.calculateEnhancedDistance(
                        features[i],
                        this.centroids[j],
                        memories[i]
                    );

                    if (distance < minDistance) {
                        minDistance = distance;
                        bestCluster = j;
                    }
                }

                this.assignments[i] = bestCluster;
            }

            // Update step: recalculate centroids
            for (let j = 0; j < actualK; j++) {
                const clusterPoints = features.filter((_, i) => this.assignments[i] === j);

                if (clusterPoints.length > 0) {
                    // Calculate weighted centroid
                    const clusterMemories = memories.filter((_, i) => this.assignments[i] === j);
                    this.centroids[j] = this.calculateWeightedCentroid(clusterPoints, clusterMemories);
                }
            }

            // Check convergence
            hasConverged = this.checkConvergence(oldCentroids, this.centroids);
            iterations++;
        }

        return {
            assignments: this.assignments,
            centroids: this.centroids,
            iterations
        };
    }

    /**
     * Initialize centroids using K-means++ algorithm
     */
    private initializeCentroidsKMeansPlusPlus(features: number[][], k: number): void {
        this.centroids = [];

        // Choose first centroid randomly
        const firstIdx = Math.floor(Math.random() * features.length);
        this.centroids.push([...features[firstIdx]]);

        // Choose remaining centroids using K-means++ probability distribution
        for (let i = 1; i < k; i++) {
            const distances = features.map(point => {
                // Find distance to nearest existing centroid
                let minDist = Infinity;
                for (const centroid of this.centroids) {
                    const dist = this.euclideanDistance(point, centroid);
                    minDist = Math.min(minDist, dist);
                }
                return minDist * minDist; // Square the distance for probability
            });

            // Choose next centroid with probability proportional to squared distance
            const totalDistance = distances.reduce((sum, d) => sum + d, 0);
            let target = Math.random() * totalDistance;

            for (let j = 0; j < features.length; j++) {
                target -= distances[j];
                if (target <= 0) {
                    this.centroids.push([...features[j]]);
                    break;
                }
            }
        }
    }

    /**
     * Calculate enhanced distance with temporal and importance weighting
     */
    private calculateEnhancedDistance(
        point: number[],
        centroid: number[],
        memory: ClusterableMemory
    ): number {
        const baseDistance = this.euclideanDistance(point, centroid);

        // Apply importance weighting (higher importance = slightly lower distance)
        const importance = memory.metadata.importance || 5;
        const importanceWeight = 1.0 - (importance - 5) * 0.05; // Small adjustment

        // Apply temporal weighting (more recent = slightly lower distance)
        const age = Date.now() - new Date(memory.timestamp).getTime();
        const ageInDays = age / (1000 * 60 * 60 * 24);
        const temporalWeight = 1.0 + Math.log(1 + ageInDays) * 0.1; // Logarithmic aging

        return baseDistance * importanceWeight * temporalWeight;
    }

    /**
     * Calculate weighted centroid considering memory importance
     */
    private calculateWeightedCentroid(points: number[][], memories: ClusterableMemory[]): number[] {
        if (points.length === 0) return [];

        const dimensions = points[0].length;
        const centroid = new Array(dimensions).fill(0);
        let totalWeight = 0;

        for (let i = 0; i < points.length; i++) {
            const weight = (memories[i].metadata.importance || 5) / 10; // Normalize importance

            for (let d = 0; d < dimensions; d++) {
                centroid[d] += points[i][d] * weight;
            }
            totalWeight += weight;
        }

        // Normalize by total weight
        for (let d = 0; d < dimensions; d++) {
            centroid[d] /= totalWeight;
        }

        return centroid;
    }

    /**
     * Calculate Euclidean distance between two points
     */
    private euclideanDistance(a: number[], b: number[]): number {
        if (a.length !== b.length) return Infinity;

        let sum = 0;
        for (let i = 0; i < a.length; i++) {
            sum += Math.pow(a[i] - b[i], 2);
        }
        return Math.sqrt(sum);
    }

    /**
     * Check if algorithm has converged
     */
    private checkConvergence(oldCentroids: number[][], newCentroids: number[][]): boolean {
        if (oldCentroids.length !== newCentroids.length) return false;

        for (let i = 0; i < oldCentroids.length; i++) {
            const distance = this.euclideanDistance(oldCentroids[i], newCentroids[i]);
            if (distance > this.convergenceThreshold) {
                return false;
            }
        }

        return true;
    }
}

/**
 * Advanced Memory Clustering Engine
 */
export class MemoryClusteringEngine {
    private azureClient: OpenAI;
    private topicCategories: TopicCategory[] = [];

    constructor(azureConfig?: any) {
        // Initialize Azure OpenAI client
        const config = azureConfig || {};

        this.azureClient = new OpenAI({
            apiKey: config.apiKey || process.env.AZURE_OPENAI_API_KEY || '',
            baseURL: `${(config.endpoint || process.env.AZURE_OPENAI_ENDPOINT || '').replace(/\/$/, '')}/openai/deployments/${config.deploymentName || process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`,
            defaultQuery: { 'api-version': config.apiVersion || process.env.AZURE_OPENAI_API_VERSION || '2024-10-21' },
            defaultHeaders: {
                'api-key': config.apiKey || process.env.AZURE_OPENAI_API_KEY || '',
            },
        });

        // Initialize predefined topic categories
        this.initializeTopicCategories();

        console.log('🧠 Memory Clustering Engine initialized with semantic enhancement');
    }

    /**
     * Main clustering function - implements US-MEM-001 requirements
     */
    async clusterMemories(
        memories: ClusterableMemory[],
        options: ClusteringOptions = {}
    ): Promise<ClusteringResult> {
        console.log(`🔄 Starting advanced memory clustering for ${memories.length} memories`);

        if (memories.length === 0) {
            return {
                clusters: [],
                metrics: {
                    totalClusters: 0,
                    averageClusterSize: 0,
                    silhouetteScore: 0,
                    cohesionScore: 0,
                    separationScore: 0
                },
                recommendations: ['No memories to cluster'],
                hierarchy: []
            };
        }

        // Set default options
        const {
            targetClusters = this.determineOptimalClusters(memories.length),
            minClusterSize = Math.max(1, Math.floor(memories.length / 10)),
            maxIterations = 100,
            convergenceThreshold = 1e-4,
            useSemanticEnhancement = true,
            temporalWeight = 0.1,
            importanceWeight = 0.2
        } = options;

        console.log(`📊 Clustering parameters: ${targetClusters} clusters, min size: ${minClusterSize}`);

        // Step 1: Ensure all memories have embeddings
        await this.ensureEmbeddings(memories);

        // Step 2: Prepare feature vectors with enhancements
        const features = await this.prepareFeatureVectors(memories, {
            temporalWeight,
            importanceWeight,
            useSemanticEnhancement
        });

        // Step 3: Perform K-means clustering
        const kmeans = new SemanticKMeans(targetClusters, maxIterations, convergenceThreshold);
        const clusteringResult = await kmeans.cluster(memories, features);

        // Step 4: Build memory clusters with rich metadata
        const clusters = await this.buildMemoryClusters(
            memories,
            clusteringResult.assignments,
            clusteringResult.centroids
        );

        // Step 5: Post-process clusters (merge small, refine themes)
        const refinedClusters = await this.refineCluster(clusters, minClusterSize);

        // Step 6: Calculate quality metrics
        const metrics = this.calculateClusteringMetrics(refinedClusters, features, clusteringResult.assignments);

        // Step 7: Build cluster hierarchy
        const hierarchy = this.buildClusterHierarchy(refinedClusters);

        // Step 8: Generate recommendations
        const recommendations = this.generateRecommendations(refinedClusters, metrics);

        console.log(`✅ Clustering complete: ${refinedClusters.length} clusters, silhouette score: ${metrics.silhouetteScore.toFixed(3)}`);

        return {
            clusters: refinedClusters,
            metrics,
            recommendations,
            hierarchy
        };
    }

    /**
     * Determine optimal number of clusters using elbow method
     */
    private determineOptimalClusters(memoryCount: number): number {
        if (memoryCount <= 1) return 1;
        if (memoryCount <= 5) return Math.max(1, Math.floor(memoryCount / 2));
        if (memoryCount <= 20) return Math.max(2, Math.floor(memoryCount / 4));
        if (memoryCount <= 50) return Math.max(3, Math.floor(memoryCount / 8));

        // For larger datasets, use square root rule with bounds
        return Math.min(10, Math.max(3, Math.floor(Math.sqrt(memoryCount))));
    }

    /**
     * Ensure all memories have embeddings
     */
    private async ensureEmbeddings(memories: ClusterableMemory[]): Promise<void> {
        const memoriesWithoutEmbeddings = memories.filter(m => !m.embeddings || m.embeddings.length === 0);

        if (memoriesWithoutEmbeddings.length === 0) {
            console.log('✅ All memories already have embeddings');
            return;
        }

        console.log(`🔄 Generating embeddings for ${memoriesWithoutEmbeddings.length} memories`);

        for (const memory of memoriesWithoutEmbeddings) {
            try {
                const embedding = await this.generateEmbedding(memory.content);
                if (embedding) {
                    memory.embeddings = embedding;
                }
            } catch (error) {
                console.warn(`Failed to generate embedding for memory ${memory.id}:`, error);
                // Use zero vector as fallback
                memory.embeddings = new Array(1536).fill(0);
            }
        }

        console.log('✅ Embedding generation complete');
    }

    /**
     * Generate embedding for text content
     */
    private async generateEmbedding(text: string): Promise<number[] | null> {
        try {
            if (!process.env.AZURE_OPENAI_API_KEY || !process.env.AZURE_OPENAI_ENDPOINT) {
                throw new Error('Azure OpenAI credentials not configured');
            }

            const trimmedText = text.length > 30000 ? text.substring(0, 30000) + '...' : text;

            const response = await this.azureClient.embeddings.create({
                model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'text-embedding-3-large',
                input: trimmedText,
                encoding_format: 'float',
            });

            return response.data?.[0]?.embedding || null;
        } catch (error) {
            console.warn('Embedding generation failed:', error);
            return null;
        }
    }

    /**
     * Prepare enhanced feature vectors for clustering
     */
    private async prepareFeatureVectors(
        memories: ClusterableMemory[],
        options: { temporalWeight: number; importanceWeight: number; useSemanticEnhancement: boolean }
    ): Promise<number[][]> {
        const features: number[][] = [];

        for (const memory of memories) {
            let vector = memory.embeddings || [];

            if (vector.length === 0) {
                // Fallback: use basic text features
                vector = this.extractBasicTextFeatures(memory.content);
            }

            // Apply enhancements if enabled
            if (options.useSemanticEnhancement) {
                vector = this.applySemanticEnhancements(vector, memory, options);
            }

            features.push(vector);
        }

        return features;
    }

    /**
     * Extract basic text features as fallback
     */
    private extractBasicTextFeatures(text: string): number[] {
        const features = new Array(100).fill(0); // Fixed size for consistency

        const words = text.toLowerCase().split(/\s+/);
        const uniqueWords = new Set(words);

        // Basic features
        features[0] = text.length / 1000; // Length (normalized)
        features[1] = words.length / 100; // Word count (normalized)
        features[2] = uniqueWords.size / words.length; // Vocabulary diversity
        features[3] = (text.match(/[.!?]/g) || []).length; // Sentence count
        features[4] = (text.match(/[A-Z]/g) || []).length / text.length; // Capital ratio

        // Topic keywords presence (simple bag of words)
        const topicKeywords = ['project', 'task', 'meeting', 'code', 'bug', 'feature', 'user', 'data', 'system', 'api'];
        topicKeywords.forEach((keyword, i) => {
            if (i < 95) { // Leave some space
                features[5 + i] = text.toLowerCase().includes(keyword) ? 1 : 0;
            }
        });

        return features;
    }

    /**
     * Apply semantic enhancements to feature vectors
     */
    private applySemanticEnhancements(
        vector: number[],
        memory: ClusterableMemory,
        options: { temporalWeight: number; importanceWeight: number }
    ): number[] {
        const enhancedVector = [...vector];
        const vectorLength = enhancedVector.length;

        // Add temporal features
        const age = Date.now() - new Date(memory.timestamp).getTime();
        const ageInDays = age / (1000 * 60 * 60 * 24);
        const temporalFeature = Math.exp(-ageInDays / 30) * options.temporalWeight; // Exponential decay

        // Add importance features
        const importance = (memory.metadata.importance || 5) / 10;
        const importanceFeature = importance * options.importanceWeight;

        // Append enhancement features
        enhancedVector.push(temporalFeature, importanceFeature);

        return enhancedVector;
    }

    /**
     * Build memory clusters with rich metadata
     */
    private async buildMemoryClusters(
        memories: ClusterableMemory[],
        assignments: number[],
        centroids: number[][]
    ): Promise<MemoryCluster[]> {
        const clusters: MemoryCluster[] = [];
        const clusterMap = new Map<number, ClusterableMemory[]>();

        // Group memories by cluster assignment
        for (let i = 0; i < memories.length; i++) {
            const clusterId = assignments[i];
            if (!clusterMap.has(clusterId)) {
                clusterMap.set(clusterId, []);
            }
            clusterMap.get(clusterId)!.push(memories[i]);
        }

        // Build cluster objects
        let clusterIndex = 0;
        for (const [clusterNum, clusterMemories] of clusterMap.entries()) {
            if (clusterMemories.length === 0) continue;

            const cluster = await this.createCluster(
                clusterIndex++,
                clusterMemories,
                centroids[clusterNum]
            );

            clusters.push(cluster);
        }

        return clusters;
    }

    /**
     * Create a single cluster with rich metadata
     */
    private async createCluster(
        index: number,
        memories: ClusterableMemory[],
        centroid: number[]
    ): Promise<MemoryCluster> {
        // Extract themes and topics
        const themes = await this.extractClusterThemes(memories);

        // Calculate coherence score
        const coherenceScore = this.calculateClusterCoherence(memories, centroid);

        // Calculate importance score
        const importanceScore = memories.reduce((sum, m) => sum + (m.metadata.importance || 5), 0) / memories.length / 10;

        // Extract time range
        const timestamps = memories.map(m => new Date(m.timestamp).getTime());
        const timeRange = {
            start: new Date(Math.min(...timestamps)).toISOString(),
            end: new Date(Math.max(...timestamps)).toISOString()
        };

        // Extract common tags
        const allTags = memories.flatMap(m => m.metadata.tags || []);
        const tagCounts = new Map<string, number>();
        allTags.forEach(tag => tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1));
        const commonTags = Array.from(tagCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([tag]) => tag);

        // Generate cluster name and description
        const clusterName = await this.generateClusterName(themes, memories);
        const clusterDescription = await this.generateClusterDescription(themes, memories, timeRange);

        return {
            id: `cluster_${index}`,
            name: clusterName,
            description: clusterDescription,
            memories,
            centroid,
            themes,
            size: memories.length,
            coherenceScore,
            importanceScore,
            timeRange,
            tags: commonTags,
            relationships: [] // Will be populated later in hierarchy building
        };
    }

    /**
     * Extract themes from cluster memories using AI
     */
    private async extractClusterThemes(memories: ClusterableMemory[]): Promise<string[]> {
        try {
            if (!process.env.AZURE_OPENAI_API_KEY) {
                return this.extractThemesHeuristic(memories);
            }

            const sampleTexts = memories
                .slice(0, 10) // Limit to avoid token limits
                .map(m => m.content.substring(0, 200))
                .join('\n---\n');

            const prompt = `Analyze these memory fragments and identify 3-5 main themes or topics:

${sampleTexts}

Return only a comma-separated list of themes (e.g., "project management, technical discussion, problem solving").`;

            const response = await this.azureClient.chat.completions.create({
                model: 'gpt-4', // Use chat model for theme extraction
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 100,
                temperature: 0.3
            });

            const themes = response.choices[0]?.message?.content
                ?.split(',')
                .map(theme => theme.trim().toLowerCase())
                .filter(theme => theme.length > 2) || [];

            return themes.length > 0 ? themes : this.extractThemesHeuristic(memories);
        } catch (error) {
            console.warn('AI theme extraction failed, using heuristic approach:', error);
            return this.extractThemesHeuristic(memories);
        }
    }

    /**
     * Extract themes using heuristic approach (fallback)
     */
    private extractThemesHeuristic(memories: ClusterableMemory[]): string[] {
        const allText = memories.map(m => m.content.toLowerCase()).join(' ');
        const words = allText.split(/\s+/).filter(word => word.length > 3);

        const wordCounts = new Map<string, number>();
        words.forEach(word => wordCounts.set(word, (wordCounts.get(word) || 0) + 1));

        return Array.from(wordCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([word]) => word);
    }

    /**
     * Generate cluster name using AI or heuristics
     */
    private async generateClusterName(themes: string[], memories: ClusterableMemory[]): Promise<string> {
        if (themes.length === 0) return `Cluster (${memories.length} memories)`;

        // Use the most prominent theme with memory count
        const primaryTheme = themes[0];
        return `${primaryTheme.charAt(0).toUpperCase() + primaryTheme.slice(1)} (${memories.length})`;
    }

    /**
     * Generate cluster description
     */
    private async generateClusterDescription(
        themes: string[],
        memories: ClusterableMemory[],
        timeRange: { start: string; end: string }
    ): Promise<string> {
        const timeSpan = this.formatTimeSpan(timeRange.start, timeRange.end);
        const avgImportance = memories.reduce((sum, m) => sum + (m.metadata.importance || 5), 0) / memories.length;

        return `A cluster of ${memories.length} memories focusing on ${themes.slice(0, 3).join(', ')}. ` +
            `Created over ${timeSpan} with average importance ${avgImportance.toFixed(1)}/10.`;
    }

    /**
     * Format time span for description
     */
    private formatTimeSpan(start: string, end: string): string {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffMs = endDate.getTime() - startDate.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'within a day';
        if (diffDays === 1) return '2 days';
        if (diffDays < 7) return `${diffDays + 1} days`;
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks`;
        return `${Math.ceil(diffDays / 30)} months`;
    }

    /**
     * Calculate cluster coherence score
     */
    private calculateClusterCoherence(memories: ClusterableMemory[], centroid: number[]): number {
        if (memories.length <= 1 || !centroid) return 1.0;

        let totalDistance = 0;
        let validDistances = 0;

        for (const memory of memories) {
            if (memory.embeddings && memory.embeddings.length === centroid.length) {
                const distance = this.euclideanDistance(memory.embeddings, centroid);
                totalDistance += distance;
                validDistances++;
            }
        }

        if (validDistances === 0) return 0.5; // Default moderate score

        // Convert distance to coherence (lower distance = higher coherence)
        const averageDistance = totalDistance / validDistances;
        return Math.max(0, 1 - averageDistance / 2); // Normalize to 0-1 range
    }

    /**
     * Euclidean distance calculation
     */
    private euclideanDistance(a: number[], b: number[]): number {
        if (a.length !== b.length) return Infinity;
        return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
    }

    /**
     * Refine clusters by merging small ones
     */
    private async refineCluster(clusters: MemoryCluster[], minClusterSize: number): Promise<MemoryCluster[]> {
        const refinedClusters = [...clusters];
        const smallClusters = refinedClusters.filter(c => c.size < minClusterSize);

        if (smallClusters.length === 0) return refinedClusters;

        console.log(`🔄 Refining ${smallClusters.length} small clusters (min size: ${minClusterSize})`);

        // Merge small clusters with most similar larger clusters
        for (const smallCluster of smallClusters) {
            const largeCluster = this.findMostSimilarCluster(smallCluster, refinedClusters, minClusterSize);

            if (largeCluster) {
                // Merge the clusters
                largeCluster.memories.push(...smallCluster.memories);
                largeCluster.size = largeCluster.memories.length;

                // Update metadata
                const combinedThemes = [...new Set([...largeCluster.themes, ...smallCluster.themes])];
                largeCluster.themes = combinedThemes.slice(0, 7); // Limit themes

                // Recalculate importance score
                largeCluster.importanceScore = largeCluster.memories.reduce(
                    (sum, m) => sum + (m.metadata.importance || 5), 0
                ) / largeCluster.memories.length / 10;

                // Remove the small cluster
                const index = refinedClusters.indexOf(smallCluster);
                if (index > -1) {
                    refinedClusters.splice(index, 1);
                }
            }
        }

        return refinedClusters;
    }

    /**
     * Find most similar cluster for merging
     */
    private findMostSimilarCluster(
        targetCluster: MemoryCluster,
        clusters: MemoryCluster[],
        minClusterSize: number
    ): MemoryCluster | null {
        let mostSimilar: MemoryCluster | null = null;
        let highestSimilarity = 0;

        for (const cluster of clusters) {
            if (cluster === targetCluster || cluster.size < minClusterSize) continue;

            // Calculate theme similarity
            const similarity = this.calculateThemeSimilarity(targetCluster.themes, cluster.themes);

            if (similarity > highestSimilarity) {
                highestSimilarity = similarity;
                mostSimilar = cluster;
            }
        }

        return highestSimilarity > 0.3 ? mostSimilar : null;
    }

    /**
     * Calculate theme similarity between two clusters
     */
    private calculateThemeSimilarity(themes1: string[], themes2: string[]): number {
        if (themes1.length === 0 || themes2.length === 0) return 0;

        const set1 = new Set(themes1.map(t => t.toLowerCase()));
        const set2 = new Set(themes2.map(t => t.toLowerCase()));

        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);

        return intersection.size / union.size; // Jaccard similarity
    }

    /**
     * Calculate clustering quality metrics
     */
    private calculateClusteringMetrics(
        clusters: MemoryCluster[],
        features: number[][],
        assignments: number[]
    ): ClusteringResult['metrics'] {
        const totalClusters = clusters.length;
        const averageClusterSize = clusters.reduce((sum, c) => sum + c.size, 0) / totalClusters;

        // Calculate silhouette score (simplified)
        const silhouetteScore = this.calculateSilhouetteScore(features, assignments, clusters);

        // Calculate cohesion score (average intra-cluster coherence)
        const cohesionScore = clusters.reduce((sum, c) => sum + c.coherenceScore, 0) / totalClusters;

        // Calculate separation score (how well separated clusters are)
        const separationScore = this.calculateSeparationScore(clusters);

        return {
            totalClusters,
            averageClusterSize,
            silhouetteScore,
            cohesionScore,
            separationScore
        };
    }

    /**
     * Calculate simplified silhouette score
     */
    private calculateSilhouetteScore(features: number[][], assignments: number[], clusters: MemoryCluster[]): number {
        if (clusters.length <= 1) return 1.0;

        let totalScore = 0;
        let validPoints = 0;

        for (let i = 0; i < features.length; i++) {
            const point = features[i];
            const clusterId = assignments[i];

            // Calculate average intra-cluster distance
            const intraDistance = this.calculateIntraClusterDistance(point, features, assignments, clusterId);

            // Calculate minimum average inter-cluster distance
            const interDistance = this.calculateMinInterClusterDistance(point, features, assignments, clusterId);

            if (intraDistance < interDistance) {
                const silhouette = (interDistance - intraDistance) / Math.max(intraDistance, interDistance);
                totalScore += silhouette;
                validPoints++;
            }
        }

        return validPoints > 0 ? totalScore / validPoints : 0;
    }

    /**
     * Calculate intra-cluster distance
     */
    private calculateIntraClusterDistance(
        point: number[],
        features: number[][],
        assignments: number[],
        clusterId: number
    ): number {
        const clusterPoints = features.filter((_, i) => assignments[i] === clusterId && features[i] !== point);

        if (clusterPoints.length === 0) return 0;

        const totalDistance = clusterPoints.reduce(
            (sum, otherPoint) => sum + this.euclideanDistance(point, otherPoint), 0
        );

        return totalDistance / clusterPoints.length;
    }

    /**
     * Calculate minimum inter-cluster distance
     */
    private calculateMinInterClusterDistance(
        point: number[],
        features: number[][],
        assignments: number[],
        clusterId: number
    ): number {
        const otherClusters = [...new Set(assignments)].filter(id => id !== clusterId);

        if (otherClusters.length === 0) return Infinity;

        let minDistance = Infinity;

        for (const otherClusterId of otherClusters) {
            const otherPoints = features.filter((_, i) => assignments[i] === otherClusterId);

            if (otherPoints.length > 0) {
                const avgDistance = otherPoints.reduce(
                    (sum, otherPoint) => sum + this.euclideanDistance(point, otherPoint), 0
                ) / otherPoints.length;

                minDistance = Math.min(minDistance, avgDistance);
            }
        }

        return minDistance;
    }

    /**
     * Calculate separation score between clusters
     */
    private calculateSeparationScore(clusters: MemoryCluster[]): number {
        if (clusters.length <= 1) return 1.0;

        let totalSeparation = 0;
        let pairCount = 0;

        for (let i = 0; i < clusters.length; i++) {
            for (let j = i + 1; j < clusters.length; j++) {
                const distance = this.euclideanDistance(clusters[i].centroid, clusters[j].centroid);
                totalSeparation += distance;
                pairCount++;
            }
        }

        const averageSeparation = totalSeparation / pairCount;
        return Math.min(1.0, averageSeparation / 2); // Normalize to 0-1 range
    }

    /**
     * Build cluster hierarchy
     */
    private buildClusterHierarchy(clusters: MemoryCluster[]): ClusterHierarchy[] {
        const hierarchy: ClusterHierarchy[] = [];

        // Create base level entries
        clusters.forEach(cluster => {
            hierarchy.push({
                level: 0,
                clusterId: cluster.id,
                children: [],
                mergeDistance: 0
            });
        });

        // Calculate relationships between clusters
        this.calculateClusterRelationships(clusters);

        return hierarchy;
    }

    /**
     * Calculate relationships between clusters
     */
    private calculateClusterRelationships(clusters: MemoryCluster[]): void {
        for (let i = 0; i < clusters.length; i++) {
            for (let j = i + 1; j < clusters.length; j++) {
                const cluster1 = clusters[i];
                const cluster2 = clusters[j];

                // Calculate similarity
                const themeSimilarity = this.calculateThemeSimilarity(cluster1.themes, cluster2.themes);
                const centroidDistance = this.euclideanDistance(cluster1.centroid, cluster2.centroid);

                // Determine relationship type and strength
                let relationshipType: 'similar' | 'sequential' | 'hierarchical' = 'similar';
                let strength = themeSimilarity;

                // Check for temporal sequence
                const timeOverlap = this.calculateTimeOverlap(cluster1.timeRange, cluster2.timeRange);
                if (timeOverlap < 0.2 && themeSimilarity > 0.4) {
                    relationshipType = 'sequential';
                    strength = themeSimilarity * 0.8; // Slightly reduce for sequential
                }

                // Add relationship if significant
                if (strength > 0.3) {
                    cluster1.relationships.push({
                        clusterId: cluster2.id,
                        relationshipType,
                        strength
                    });

                    cluster2.relationships.push({
                        clusterId: cluster1.id,
                        relationshipType,
                        strength
                    });
                }
            }
        }
    }

    /**
     * Calculate time overlap between clusters
     */
    private calculateTimeOverlap(range1: { start: string; end: string }, range2: { start: string; end: string }): number {
        const start1 = new Date(range1.start).getTime();
        const end1 = new Date(range1.end).getTime();
        const start2 = new Date(range2.start).getTime();
        const end2 = new Date(range2.end).getTime();

        const overlapStart = Math.max(start1, start2);
        const overlapEnd = Math.min(end1, end2);

        if (overlapStart >= overlapEnd) return 0;

        const overlapDuration = overlapEnd - overlapStart;
        const totalDuration = Math.max(end1, end2) - Math.min(start1, start2);

        return overlapDuration / totalDuration;
    }

    /**
     * Generate recommendations based on clustering results
     */
    private generateRecommendations(clusters: MemoryCluster[], metrics: ClusteringResult['metrics']): string[] {
        const recommendations: string[] = [];

        // Quality-based recommendations
        if (metrics.silhouetteScore < 0.3) {
            recommendations.push('Consider adjusting clustering parameters - current separation quality is low');
        }

        if (metrics.averageClusterSize > 20) {
            recommendations.push('Some clusters are quite large - consider increasing target cluster count for better granularity');
        }

        if (metrics.averageClusterSize < 3) {
            recommendations.push('Clusters are very small - consider decreasing target cluster count or minimum cluster size');
        }

        // Content-based recommendations
        const highImportanceClusters = clusters.filter(c => c.importanceScore > 0.7);
        if (highImportanceClusters.length > 0) {
            recommendations.push(`${highImportanceClusters.length} clusters contain high-importance memories - prioritize these for review`);
        }

        const recentClusters = clusters.filter(c => {
            const daysSinceLastUpdate = (Date.now() - new Date(c.timeRange.end).getTime()) / (1000 * 60 * 60 * 24);
            return daysSinceLastUpdate < 7;
        });

        if (recentClusters.length > 0) {
            recommendations.push(`${recentClusters.length} clusters have recent activity - these may need immediate attention`);
        }

        // Relationship recommendations
        const wellConnectedClusters = clusters.filter(c => c.relationships.length > 2);
        if (wellConnectedClusters.length > 0) {
            recommendations.push(`${wellConnectedClusters.length} clusters show strong relationships - consider these for workflow optimization`);
        }

        return recommendations.length > 0 ? recommendations : ['Memory organization looks good - no specific recommendations'];
    }

    /**
     * Initialize predefined topic categories
     */
    private initializeTopicCategories(): void {
        this.topicCategories = [
            {
                name: 'Development',
                keywords: ['code', 'bug', 'feature', 'api', 'database', 'frontend', 'backend'],
                weight: 1.0,
                examples: ['Fixed authentication bug', 'Implemented new API endpoint']
            },
            {
                name: 'Project Management',
                keywords: ['task', 'project', 'deadline', 'milestone', 'planning', 'meeting'],
                weight: 0.9,
                examples: ['Sprint planning meeting', 'Project deadline moved']
            },
            {
                name: 'Documentation',
                keywords: ['docs', 'documentation', 'readme', 'guide', 'manual', 'specification'],
                weight: 0.8,
                examples: ['Updated API documentation', 'Created user guide']
            },
            {
                name: 'Communication',
                keywords: ['meeting', 'email', 'discussion', 'call', 'review', 'feedback'],
                weight: 0.7,
                examples: ['Team standup meeting', 'Code review feedback']
            }
        ];
    }
}

// Main class and types are already exported above