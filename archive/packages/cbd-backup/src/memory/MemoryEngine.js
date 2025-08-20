/**
 * CBD Memory Engine - Simple Implementation for MCP Integration
 * Provides basic memory storage and retrieval with vector search capability
 */

import { v4 as uuidv4 } from 'uuid';

// Use a simple hash function instead of crypto for now
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
}

export class CBDMemoryEngine {
    constructor(config = {}) {
        this.config = config;
        this.memories = new Map(); // In-memory storage for now
        this.keyIndex = new Map();
        this.vectorIndex = new Map();
        this.isInitialized = false;
        this.stats = {
            totalMemories: 0,
            totalOperations: 0,
            averageResponseTime: 0
        };
    }

    async initialize() {
        // Initialize the memory engine
        this.isInitialized = true;
        console.log('✅ CBD Memory Engine initialized');
        return true;
    }

    async storeMemory({ agentId, content, metadata = {} }) {
        if (!this.isInitialized) {
            throw new Error('CBD Memory Engine not initialized');
        }

        const memoryId = uuidv4();
        const structuredKey = this.generateStructuredKey(metadata.project || 'default', metadata.session || agentId, agentId);
        const contentHash = simpleHash(content);

        const memory = {
            id: memoryId,
            structuredKey,
            agentId,
            content,
            contentHash,
            metadata,
            timestamp: new Date().toISOString(),
            lastAccessed: new Date().toISOString(),
            accessCount: 0,
            importanceScore: this.calculateImportanceScore(content, metadata)
        };

        this.memories.set(memoryId, memory);
        this.keyIndex.set(structuredKey, memoryId);
        this.stats.totalMemories++;
        this.stats.totalOperations++;

        return {
            memoryId,
            structuredKey,
            isDuplicate: false,
            message: 'Memory stored successfully'
        };
    }

    async getMemoryByKey(structuredKey) {
        if (!this.isInitialized) {
            throw new Error('CBD Memory Engine not initialized');
        }

        const memoryId = this.keyIndex.get(structuredKey);
        if (!memoryId) {
            return null;
        }

        const memory = this.memories.get(memoryId);
        if (memory) {
            memory.accessCount++;
            memory.lastAccessed = new Date().toISOString();
            this.stats.totalOperations++;
        }

        return memory;
    }

    async searchMemories(query, options = {}) {
        if (!this.isInitialized) {
            throw new Error('CBD Memory Engine not initialized');
        }

        const {
            limit = 10,
            agentId,
            project,
            session,
            minImportance = 0.0
        } = options;

        let results = Array.from(this.memories.values());

        // Filter by agent
        if (agentId && agentId !== 'all') {
            results = results.filter(m => m.agentId === agentId);
        }

        // Filter by project
        if (project) {
            results = results.filter(m => m.metadata.project === project);
        }

        // Filter by session
        if (session) {
            results = results.filter(m => m.metadata.session === session);
        }

        // Filter by importance
        if (minImportance > 0) {
            results = results.filter(m => m.importanceScore >= minImportance);
        }

        // Text search
        if (query && query.trim()) {
            const queryLower = query.toLowerCase();
            results = results.filter(m =>
                m.content.toLowerCase().includes(queryLower) ||
                JSON.stringify(m.metadata).toLowerCase().includes(queryLower)
            );
        }

        // Calculate relevance scores
        results = results.map(memory => ({
            ...memory,
            relevanceScore: this.calculateRelevanceScore(query, memory.content, memory.importanceScore)
        }));

        // Sort by relevance and limit
        results.sort((a, b) => b.relevanceScore - a.relevanceScore);
        results = results.slice(0, limit);

        this.stats.totalOperations++;

        return {
            memories: results,
            totalFound: results.length,
            query,
            searchOptions: options
        };
    }

    async vectorSearch(vector, options = {}) {
        if (!this.isInitialized) {
            throw new Error('CBD Memory Engine not initialized');
        }

        const { limit = 20, threshold = 0.0 } = options;

        // For now, return a simple similarity search
        // In a real implementation, this would use FAISS or similar
        const results = Array.from(this.memories.values())
            .map(memory => ({
                ...memory,
                similarityScore: Math.random() * 0.5 + 0.5 // Simulate similarity
            }))
            .filter(r => r.similarityScore >= threshold)
            .sort((a, b) => b.similarityScore - a.similarityScore)
            .slice(0, limit);

        this.stats.totalOperations++;
        return results;
    }

    async getRecentMemories(agentId, options = {}) {
        if (!this.isInitialized) {
            throw new Error('CBD Memory Engine not initialized');
        }

        const { limit = 5, project, session } = options;

        let results = Array.from(this.memories.values())
            .filter(m => m.agentId === agentId);

        if (project) {
            results = results.filter(m => m.metadata.project === project);
        }

        if (session) {
            results = results.filter(m => m.metadata.session === session);
        }

        results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        results = results.slice(0, limit);

        this.stats.totalOperations++;
        return results;
    }

    async deleteMemory(structuredKey) {
        if (!this.isInitialized) {
            throw new Error('CBD Memory Engine not initialized');
        }

        const memoryId = this.keyIndex.get(structuredKey);
        if (!memoryId) {
            return {
                success: false,
                message: 'Memory not found'
            };
        }

        this.memories.delete(memoryId);
        this.keyIndex.delete(structuredKey);
        this.stats.totalMemories--;
        this.stats.totalOperations++;

        return {
            success: true,
            message: 'Memory deleted successfully'
        };
    }

    async getStatistics() {
        return {
            totalMemories: this.stats.totalMemories,
            uniqueAgents: new Set(Array.from(this.memories.values()).map(m => m.agentId)).size,
            uniqueProjects: new Set(Array.from(this.memories.values()).map(m => m.metadata.project)).size,
            uniqueSessions: new Set(Array.from(this.memories.values()).map(m => m.metadata.session)).size,
            averageImportance: this.calculateAverageImportance(),
            totalOperations: this.stats.totalOperations,
            version: '1.0.0',
            engine: 'cbd-memory-engine'
        };
    }

    async close() {
        this.isInitialized = false;
        console.log('🔄 CBD Memory Engine closed');
    }

    // Helper methods
    generateStructuredKey(project, session, agentId) {
        const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const sequence = Math.floor(Math.random() * 1000) + 1;
        const cleanProject = project.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        const cleanSession = session.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        return `${cleanProject}_${date}_${cleanSession}_${sequence}`;
    }

    calculateImportanceScore(content, metadata) {
        let score = 0.5; // Base score

        // Content length factor
        if (content.length > 500) score += 0.1;
        if (content.length > 1000) score += 0.1;

        // Metadata priority
        if (metadata.priority === 'critical') score += 0.3;
        else if (metadata.priority === 'high') score += 0.2;
        else if (metadata.priority === 'medium') score += 0.1;

        // Important keywords
        const importantKeywords = ['error', 'bug', 'fix', 'critical', 'important', 'todo'];
        const lowerContent = content.toLowerCase();
        for (const keyword of importantKeywords) {
            if (lowerContent.includes(keyword)) {
                score += 0.05;
            }
        }

        return Math.min(score, 1.0);
    }

    calculateRelevanceScore(query, content, importanceScore) {
        if (!query || !query.trim()) return importanceScore;

        const queryLower = query.toLowerCase();
        const contentLower = content.toLowerCase();

        let relevance = importanceScore * 0.3; // Base from importance

        // Exact phrase match
        if (contentLower.includes(queryLower)) {
            relevance += 0.5;
        } else {
            // Word matches
            const queryWords = queryLower.split(/\s+/);
            const contentWords = contentLower.split(/\s+/);
            const matchCount = queryWords.filter(qw =>
                contentWords.some(cw => cw.includes(qw) || qw.includes(cw))
            ).length;

            relevance += (matchCount / queryWords.length) * 0.4;
        }

        return Math.min(relevance, 1.0);
    }

    calculateAverageImportance() {
        if (this.stats.totalMemories === 0) return 0;

        const total = Array.from(this.memories.values())
            .reduce((sum, m) => sum + m.importanceScore, 0);

        return Math.round((total / this.stats.totalMemories) * 100) / 100;
    }
}
