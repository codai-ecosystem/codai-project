/**
 * Memory Relationship Engine - Advanced relationship detection and knowledge graph building
 *
 * Capabilities:
 * - Automatic relationship detection between memories
 * - Semantic similarity calculation
 * - Content reference analysis
 * - Knowledge graph construction
 * - Relationship strength scoring
 */
import { createHash } from 'crypto';
export class MemoryRelationshipEngine {
    openai;
    relationshipCache = new Map();
    similarityCache = new Map();
    constructor(openai) {
        this.openai = openai;
    }
    /**
     * Detect relationships between a new memory and existing memories
     */
    async detectRelationships(memory, existingMemories, options = {}) {
        const { maxRelationships = 10, minSimilarityThreshold = 0.3, enableAIAnalysis = true } = options;
        const relationships = [];
        // 1. Semantic similarity relationships
        if (memory.embedding) {
            const semanticRelationships = await this.findSemanticRelationships(memory, existingMemories, minSimilarityThreshold);
            relationships.push(...semanticRelationships);
        }
        // 2. Content reference relationships
        const referenceRelationships = await this.findContentReferences(memory, existingMemories);
        relationships.push(...referenceRelationships);
        // 3. Temporal relationships (follows/updates)
        const temporalRelationships = await this.findTemporalRelationships(memory, existingMemories);
        relationships.push(...temporalRelationships);
        // 4. Project/session relationships
        const contextualRelationships = await this.findContextualRelationships(memory, existingMemories);
        relationships.push(...contextualRelationships);
        // 5. AI-powered relationship analysis (if enabled and OpenAI available)
        if (enableAIAnalysis && this.openai) {
            const aiRelationships = await this.analyzeRelationshipsWithAI(memory, existingMemories, relationships);
            relationships.push(...aiRelationships);
        }
        // Remove duplicates and sort by strength
        const uniqueRelationships = this.deduplicateRelationships(relationships);
        const sortedRelationships = uniqueRelationships
            .sort((a, b) => b.strength - a.strength)
            .slice(0, maxRelationships);
        // Cache the results
        this.cacheRelationships(memory.id, sortedRelationships);
        return sortedRelationships;
    }
    /**
     * Calculate semantic similarity between two memories using embeddings
     */
    async calculateSemanticSimilarity(memory1, memory2) {
        if (!memory1.embedding || !memory2.embedding) {
            return 0;
        }
        const cacheKey = `${memory1.id}_${memory2.id}`;
        if (this.similarityCache.has(cacheKey)) {
            return this.similarityCache.get(cacheKey);
        }
        const similarity = this.calculateCosineSimilarity(memory1.embedding, memory2.embedding);
        this.similarityCache.set(cacheKey, similarity);
        return similarity;
    }
    /**
     * Find content references between memories
     */
    async findContentReferences(memory, existingMemories) {
        const relationships = [];
        const content = memory.content.toLowerCase();
        for (const existingMemory of existingMemories) {
            if (existingMemory.id === memory.id)
                continue;
            const references = this.detectContentReferences(content, existingMemory);
            if (references.length > 0) {
                relationships.push({
                    id: this.generateRelationshipId(memory.id, existingMemory.id, 'references'),
                    sourceMemoryId: memory.id,
                    targetMemoryId: existingMemory.id,
                    relationshipType: 'references',
                    strength: Math.min(references.length * 0.2, 1.0),
                    context: `References: ${references.join(', ')}`,
                    createdBy: 'auto',
                    timestamp: new Date().toISOString(),
                    confidence: 0.9,
                    bidirectional: false
                });
            }
        }
        return relationships;
    }
    /**
     * Build a knowledge graph from memories and their relationships
     */
    async buildKnowledgeGraph(memories) {
        const nodes = [];
        const edges = [];
        const nodeMap = new Map();
        // Create nodes
        for (const memory of memories) {
            const node = {
                id: memory.id,
                memoryId: memory.id,
                structuredKey: memory.structuredKey,
                title: memory.content.substring(0, 50) + (memory.content.length > 50 ? '...' : ''),
                importance: memory.metadata.importance,
                centrality: 0, // Will be calculated
                position: memory.knowledgeGraphPosition
            };
            nodes.push(node);
            nodeMap.set(memory.id, node);
        }
        // Create edges from relationships
        for (const memory of memories) {
            for (const relationship of memory.relationships) {
                if (nodeMap.has(relationship.targetMemoryId)) {
                    edges.push({
                        id: relationship.id,
                        source: relationship.sourceMemoryId,
                        target: relationship.targetMemoryId,
                        relationship,
                        weight: relationship.strength
                    });
                }
            }
        }
        // Calculate centrality scores
        this.calculateCentrality(nodes, edges);
        // Detect clusters
        const clusters = await this.detectClusters(nodes, edges, memories);
        // Calculate graph metrics
        const metrics = this.calculateGraphMetrics(nodes, edges, clusters);
        return {
            nodes,
            edges,
            clusters,
            metrics
        };
    }
    /**
     * Find semantic relationships using embeddings
     */
    async findSemanticRelationships(memory, existingMemories, threshold) {
        const relationships = [];
        for (const existingMemory of existingMemories) {
            if (existingMemory.id === memory.id || !existingMemory.embedding)
                continue;
            const similarity = await this.calculateSemanticSimilarity(memory, existingMemory);
            if (similarity >= threshold) {
                relationships.push({
                    id: this.generateRelationshipId(memory.id, existingMemory.id, 'similar'),
                    sourceMemoryId: memory.id,
                    targetMemoryId: existingMemory.id,
                    relationshipType: 'similar',
                    strength: similarity,
                    context: `Semantic similarity: ${Math.round(similarity * 100)}%`,
                    createdBy: 'auto',
                    timestamp: new Date().toISOString(),
                    confidence: similarity,
                    bidirectional: true
                });
            }
        }
        return relationships;
    }
    /**
     * Find temporal relationships (follows, updates)
     */
    async findTemporalRelationships(memory, existingMemories) {
        const relationships = [];
        const memoryTime = new Date(memory.metadata.timestamp);
        // Find memories from the same session within a reasonable time window
        const sameSessionMemories = existingMemories.filter(m => m.sessionName === memory.sessionName &&
            m.metadata.agentId === memory.metadata.agentId);
        for (const sessionMemory of sameSessionMemories) {
            const sessionTime = new Date(sessionMemory.metadata.timestamp);
            const timeDiff = memoryTime.getTime() - sessionTime.getTime();
            // If this memory comes after the session memory (within 1 hour)
            if (timeDiff > 0 && timeDiff < 3600000) {
                const strength = Math.max(0.1, 1 - (timeDiff / 3600000));
                relationships.push({
                    id: this.generateRelationshipId(memory.id, sessionMemory.id, 'follows'),
                    sourceMemoryId: memory.id,
                    targetMemoryId: sessionMemory.id,
                    relationshipType: 'follows',
                    strength,
                    context: `Follows in session (${Math.round(timeDiff / 60000)} minutes later)`,
                    createdBy: 'auto',
                    timestamp: new Date().toISOString(),
                    confidence: 0.8,
                    bidirectional: false
                });
            }
        }
        return relationships;
    }
    /**
     * Find contextual relationships (same project, similar metadata)
     */
    async findContextualRelationships(memory, existingMemories) {
        const relationships = [];
        for (const existingMemory of existingMemories) {
            if (existingMemory.id === memory.id)
                continue;
            let strength = 0;
            let context = '';
            // Same project
            if (memory.projectName === existingMemory.projectName) {
                strength += 0.3;
                context += 'Same project';
            }
            // Same entity type
            if (memory.metadata.entityType &&
                memory.metadata.entityType === existingMemory.metadata.entityType) {
                strength += 0.2;
                context += (context ? ', ' : '') + 'Same entity type';
            }
            // Shared tags
            const memoryTags = memory.metadata.tags || [];
            const existingTags = existingMemory.metadata.tags || [];
            const sharedTags = memoryTags.filter((tag) => existingTags.includes(tag));
            if (sharedTags.length > 0) {
                strength += Math.min(sharedTags.length * 0.1, 0.3);
                context += (context ? ', ' : '') + `Shared tags: ${sharedTags.join(', ')}`;
            }
            if (strength >= 0.2) {
                relationships.push({
                    id: this.generateRelationshipId(memory.id, existingMemory.id, 'related'),
                    sourceMemoryId: memory.id,
                    targetMemoryId: existingMemory.id,
                    relationshipType: 'related',
                    strength: Math.min(strength, 1.0),
                    context,
                    createdBy: 'auto',
                    timestamp: new Date().toISOString(),
                    confidence: 0.7,
                    bidirectional: true
                });
            }
        }
        return relationships;
    }
    /**
     * Analyze relationships using AI
     */
    async analyzeRelationshipsWithAI(memory, existingMemories, existingRelationships) {
        if (!this.openai)
            return [];
        const relationships = [];
        // Select top candidates based on existing relationships
        const candidates = existingMemories
            .filter(m => !existingRelationships.some(r => r.targetMemoryId === m.id))
            .slice(0, 5); // Limit to avoid API costs
        for (const candidate of candidates) {
            try {
                const analysis = await this.aiAnalyzeRelationship(memory, candidate);
                if (analysis && analysis.hasRelationship) {
                    relationships.push({
                        id: this.generateRelationshipId(memory.id, candidate.id, analysis.type),
                        sourceMemoryId: memory.id,
                        targetMemoryId: candidate.id,
                        relationshipType: analysis.type,
                        strength: analysis.strength,
                        context: analysis.explanation,
                        createdBy: 'ai',
                        timestamp: new Date().toISOString(),
                        confidence: analysis.confidence,
                        bidirectional: analysis.bidirectional
                    });
                }
            }
            catch (error) {
                console.error('AI relationship analysis failed:', error);
            }
        }
        return relationships;
    }
    /**
     * AI-powered relationship analysis
     */
    async aiAnalyzeRelationship(memory1, memory2) {
        if (!this.openai)
            return null;
        const prompt = `Analyze the relationship between these two memories:

Memory 1 (${memory1.structuredKey}):
${memory1.content}

Memory 2 (${memory2.structuredKey}):
${memory2.content}

Determine if there's a meaningful relationship and respond with JSON:
{
  "hasRelationship": boolean,
  "type": "related|references|follows|contradicts|updates|explains|contains",
  "strength": number (0.0-1.0),
  "confidence": number (0.0-1.0),
  "explanation": "brief explanation",
  "bidirectional": boolean
}`;
        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.1,
                max_tokens: 200
            });
            const content = response.choices[0]?.message?.content;
            if (content) {
                return JSON.parse(content);
            }
        }
        catch (error) {
            console.error('AI relationship analysis error:', error);
        }
        return null;
    }
    /**
     * Detect content references (mentions of keys, concepts)
     */
    detectContentReferences(content, targetMemory) {
        const references = [];
        const targetContent = targetMemory.content.toLowerCase();
        // Check for direct key references
        if (content.includes(targetMemory.structuredKey)) {
            references.push(targetMemory.structuredKey);
        }
        // Check for important phrases (simple heuristic)
        const targetPhrases = this.extractKeyPhrases(targetContent);
        for (const phrase of targetPhrases) {
            if (content.includes(phrase) && phrase.length > 5) {
                references.push(phrase);
            }
        }
        return references;
    }
    /**
     * Extract key phrases from content (simple implementation)
     */
    extractKeyPhrases(content) {
        // Simple phrase extraction - in production, use NLP library
        const words = content.split(/\s+/).filter(w => w.length > 3);
        const phrases = [];
        // Extract 2-3 word phrases
        for (let i = 0; i < words.length - 1; i++) {
            if (words[i] && words[i + 1]) {
                phrases.push(`${words[i]} ${words[i + 1]}`);
            }
            if (words[i] && words[i + 1] && words[i + 2]) {
                phrases.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
            }
        }
        return phrases;
    }
    /**
     * Calculate cosine similarity between two vectors
     */
    calculateCosineSimilarity(a, b) {
        if (a.length !== b.length)
            return 0;
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < a.length; i++) {
            const aVal = a[i] ?? 0;
            const bVal = b[i] ?? 0;
            dotProduct += aVal * bVal;
            normA += aVal * aVal;
            normB += bVal * bVal;
        }
        const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
        return magnitude > 0 ? dotProduct / magnitude : 0;
    }
    /**
     * Generate a unique relationship ID
     */
    generateRelationshipId(sourceId, targetId, type) {
        const combined = `${sourceId}_${targetId}_${type}`;
        return createHash('sha256').update(combined).digest('hex').substring(0, 16);
    }
    /**
     * Remove duplicate relationships
     */
    deduplicateRelationships(relationships) {
        const seen = new Set();
        const unique = [];
        for (const rel of relationships) {
            const key = `${rel.sourceMemoryId}_${rel.targetMemoryId}_${rel.relationshipType}`;
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(rel);
            }
        }
        return unique;
    }
    /**
     * Cache relationships for performance
     */
    cacheRelationships(memoryId, relationships) {
        this.relationshipCache.set(memoryId, relationships);
        // Keep cache size reasonable
        if (this.relationshipCache.size > 1000) {
            const firstKey = this.relationshipCache.keys().next().value;
            if (firstKey) {
                this.relationshipCache.delete(firstKey);
            }
        }
    }
    /**
     * Calculate node centrality in the graph
     */
    calculateCentrality(nodes, edges) {
        const connectionCounts = new Map();
        // Count connections for each node
        for (const edge of edges) {
            connectionCounts.set(edge.source, (connectionCounts.get(edge.source) || 0) + 1);
            connectionCounts.set(edge.target, (connectionCounts.get(edge.target) || 0) + 1);
        }
        // Calculate centrality scores
        const maxConnections = Math.max(...Array.from(connectionCounts.values()), 1);
        for (const node of nodes) {
            node.centrality = (connectionCounts.get(node.id) || 0) / maxConnections;
        }
    }
    /**
     * Detect clusters in the knowledge graph
     */
    async detectClusters(nodes, edges, memories) {
        const clusters = [];
        const visited = new Set();
        // Simple clustering based on connected components
        for (const node of nodes) {
            if (visited.has(node.id))
                continue;
            const cluster = this.findConnectedComponent(node.id, edges, visited);
            if (cluster.length >= 2) {
                const clusterMemories = memories.filter(m => cluster.includes(m.id));
                const theme = this.extractClusterTheme(clusterMemories);
                clusters.push({
                    id: `cluster_${clusters.length + 1}`,
                    name: `Cluster ${clusters.length + 1}: ${theme}`,
                    nodeIds: cluster,
                    theme,
                    centrality: cluster.length / nodes.length,
                    color: this.generateClusterColor(clusters.length)
                });
            }
        }
        return clusters;
    }
    /**
     * Find connected component starting from a node
     */
    findConnectedComponent(startNodeId, edges, visited) {
        const component = [];
        const queue = [startNodeId];
        while (queue.length > 0) {
            const nodeId = queue.shift();
            if (visited.has(nodeId))
                continue;
            visited.add(nodeId);
            component.push(nodeId);
            // Find connected nodes
            for (const edge of edges) {
                if (edge.source === nodeId && !visited.has(edge.target)) {
                    queue.push(edge.target);
                }
                else if (edge.target === nodeId && !visited.has(edge.source)) {
                    queue.push(edge.source);
                }
            }
        }
        return component;
    }
    /**
     * Extract theme from cluster memories
     */
    extractClusterTheme(memories) {
        // Simple theme extraction - find most common entity type or project
        const entityTypes = memories.map(m => m.metadata.entityType).filter(Boolean);
        const projects = memories.map(m => m.projectName);
        if (entityTypes.length > 0) {
            const mostCommon = this.findMostCommon(entityTypes);
            return mostCommon || 'Mixed Content';
        }
        if (projects.length > 0) {
            const mostCommon = this.findMostCommon(projects);
            return mostCommon || 'Mixed Projects';
        }
        return 'General Knowledge';
    }
    /**
     * Find most common element in array
     */
    findMostCommon(arr) {
        const counts = new Map();
        for (const item of arr) {
            counts.set(item, (counts.get(item) || 0) + 1);
        }
        let maxCount = 0;
        let mostCommon = null;
        for (const [item, count] of counts) {
            if (count > maxCount) {
                maxCount = count;
                mostCommon = item;
            }
        }
        return mostCommon;
    }
    /**
     * Generate color for cluster
     */
    generateClusterColor(index) {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
            '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
        ];
        return colors[index % colors.length] || '#999999';
    }
    /**
     * Calculate graph metrics
     */
    calculateGraphMetrics(nodes, edges, clusters) {
        const totalNodes = nodes.length;
        const totalEdges = edges.length;
        const maxPossibleEdges = totalNodes * (totalNodes - 1) / 2;
        const density = maxPossibleEdges > 0 ? totalEdges / maxPossibleEdges : 0;
        // Find most central nodes
        const sortedBycentrality = [...nodes].sort((a, b) => b.centrality - a.centrality);
        const mostCentralNodes = sortedBycentrality.slice(0, 5).map(n => n.id);
        // Find isolated nodes
        const connectedNodes = new Set();
        for (const edge of edges) {
            connectedNodes.add(edge.source);
            connectedNodes.add(edge.target);
        }
        const isolatedNodes = nodes.filter(n => !connectedNodes.has(n.id)).map(n => n.id);
        return {
            totalNodes,
            totalEdges,
            totalClusters: clusters.length,
            density,
            averageClustering: clusters.length > 0 ? clusters.reduce((sum, c) => sum + c.centrality, 0) / clusters.length : 0,
            averagePathLength: this.calculateAveragePathLength(nodes, edges),
            mostCentralNodes,
            isolatedNodes
        };
    }
    /**
     * Calculate average path length (simplified)
     */
    calculateAveragePathLength(nodes, edges) {
        // Simplified calculation - in production, use proper graph algorithms
        if (nodes.length <= 1)
            return 0;
        const avgConnections = edges.length / nodes.length;
        return avgConnections > 0 ? Math.log(nodes.length) / Math.log(avgConnections) : nodes.length;
    }
}
//# sourceMappingURL=relationship-engine.js.map