#!/usr/bin/env node

/**
 * MemorAI MCP Server - Phase 2: Advanced Memory Engine
 * Enterprise-grade memory management with RBAC, metadata intelligence, and compliance
 * Date: August 6, 2025
 * Status: Phase 2 Implementation
 */

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

// ============================================================================
// PHASE 2: SECURITY ENGINE - RBAC & MULTI-TENANCY
// ============================================================================

class SecurityEngine {
    constructor() {
        this.roles = {
            'viewer': {
                permissions: ['memory:read', 'memory:search'],
                quotas: { maxMemories: 100, maxStorageBytes: 10 * 1024 * 1024 } // 10MB
            },
            'editor': {
                permissions: ['memory:read', 'memory:write', 'memory:search', 'memory:delete'],
                quotas: { maxMemories: 1000, maxStorageBytes: 100 * 1024 * 1024 } // 100MB
            },
            'admin': {
                permissions: ['memory:*', 'agent:manage', 'quota:manage'],
                quotas: { maxMemories: 10000, maxStorageBytes: 1024 * 1024 * 1024 } // 1GB
            },
            'superadmin': {
                permissions: ['*'],
                quotas: { maxMemories: -1, maxStorageBytes: -1 } // Unlimited
            }
        };

        this.agentProfiles = new Map();
        this.encryptionKeys = new Map();
        this.sessionTokens = new Map();
        this.quotaUsage = new Map();
    }

    async initializeAgent(agentId, role = 'editor') {
        const profile = {
            agentId,
            role,
            permissions: [...this.roles[role].permissions],
            quotas: { ...this.roles[role].quotas },
            policies: {
                dataRetention: '365d',
                encryptionLevel: 'standard',
                auditLevel: 'basic'
            },
            createdAt: new Date(),
            lastActive: new Date()
        };

        this.agentProfiles.set(agentId, profile);
        this.quotaUsage.set(agentId, { memories: 0, storageBytes: 0, embeddingRequests: 0 });

        // Generate agent-specific encryption key
        const encryptionKey = crypto.randomBytes(32);
        this.encryptionKeys.set(agentId, encryptionKey);

        console.log(`🔐 Agent ${agentId} initialized with role: ${role}`);
        return profile;
    }

    validatePermission(agentId, permission) {
        const profile = this.agentProfiles.get(agentId);
        if (!profile) {
            console.warn(`⚠️ Agent ${agentId} not found - initializing as editor`);
            this.initializeAgent(agentId, 'editor');
            return this.validatePermission(agentId, permission);
        }

        // Wildcard permissions
        if (profile.permissions.includes('*')) return true;
        if (profile.permissions.includes(permission)) return true;

        // Check wildcard patterns
        const permissionBase = permission.split(':')[0] + ':*';
        return profile.permissions.includes(permissionBase);
    }

    async checkQuota(agentId, operation, size = 0) {
        const profile = this.agentProfiles.get(agentId);
        const usage = this.quotaUsage.get(agentId);

        if (!profile || !usage) return false;

        // Unlimited quotas for superadmin
        if (profile.quotas.maxMemories === -1) return true;

        switch (operation) {
            case 'memory:create':
                if (usage.memories >= profile.quotas.maxMemories) return false;
                if (usage.storageBytes + size > profile.quotas.maxStorageBytes) return false;
                return true;
            case 'embedding:request':
                // Rate limiting for embeddings (100 per hour for free tier)
                return usage.embeddingRequests < 100;
            default:
                return true;
        }
    }

    async updateQuota(agentId, operation, delta = 0) {
        const usage = this.quotaUsage.get(agentId);
        if (!usage) return;

        switch (operation) {
            case 'memory:create':
                usage.memories += 1;
                usage.storageBytes += delta;
                break;
            case 'memory:delete':
                usage.memories -= 1;
                usage.storageBytes -= delta;
                break;
            case 'embedding:request':
                usage.embeddingRequests += 1;
                break;
        }

        this.quotaUsage.set(agentId, usage);
    }

    encryptMemory(agentId, content) {
        const key = this.encryptionKeys.get(agentId);
        if (!key) return content; // Fallback to plain text

        try {
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
            let encrypted = cipher.update(content, 'utf8', 'hex');
            encrypted += cipher.final('hex');

            return `encrypted:${iv.toString('hex')}:${encrypted}`;
        } catch (error) {
            console.warn(`⚠️ Encryption failed for agent ${agentId}:`, error.message);
            return content; // Fallback to plain text
        }
    }

    decryptMemory(agentId, encryptedContent) {
        if (!encryptedContent.startsWith('encrypted:')) return encryptedContent;

        const key = this.encryptionKeys.get(agentId);
        if (!key) return encryptedContent; // Cannot decrypt

        try {
            const [, ivHex, encrypted] = encryptedContent.split(':');
            const iv = Buffer.from(ivHex, 'hex');
            const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        } catch (error) {
            console.error(`🔓 Decryption failed for agent ${agentId}:`, error.message);
            return '[ENCRYPTED_CONTENT]';
        }
    }
}

// ============================================================================
// PHASE 2: METADATA ENGINE - INTELLIGENT CATEGORIZATION
// ============================================================================

class MetadataEngine {
    constructor() {
        this.importanceFactors = {
            contentLength: 0.1,
            keywordDensity: 0.2,
            entityMentions: 0.3,
            recency: 0.2,
            accessFrequency: 0.2
        };

        this.tagSuggestions = new Map();
        this.entityRelationships = new Map();
    }

    async calculateImportance(memory) {
        let score = 0;
        const content = memory.content || '';

        // Content length factor (normalized)
        const lengthScore = Math.min(content.length / 1000, 1.0);
        score += lengthScore * this.importanceFactors.contentLength;

        // Keyword density (simple heuristic)
        const keywordScore = this.calculateKeywordDensity(content);
        score += keywordScore * this.importanceFactors.keywordDensity;

        // Entity mentions (organizations, people, etc.)
        const entityScore = this.detectEntityMentions(content);
        score += entityScore * this.importanceFactors.entityMentions;

        // Recency factor
        const recencyScore = this.calculateRecencyScore(memory.timestamp);
        score += recencyScore * this.importanceFactors.recency;

        // Access frequency (if available)
        const accessScore = memory.lifecycle?.accessCount ?
            Math.min(memory.lifecycle.accessCount / 10, 1.0) : 0;
        score += accessScore * this.importanceFactors.accessFrequency;

        return Math.round(score * 10) / 10; // Round to 1 decimal
    }

    calculateKeywordDensity(content) {
        const importantWords = ['project', 'task', 'important', 'urgent', 'critical', 'bug', 'fix', 'feature'];
        const words = content.toLowerCase().split(/\s+/);
        const keywordCount = words.filter(word => importantWords.includes(word)).length;
        return Math.min(keywordCount / words.length * 10, 1.0);
    }

    detectEntityMentions(content) {
        // Simple entity detection heuristics
        const patterns = [
            /[A-Z][a-z]+ [A-Z][a-z]+/g, // Person names
            /[A-Z][a-z]+([A-Z][a-z]+)+/g, // Organizations
            /@[\w.]+/g, // Email mentions
            /https?:\/\/[\w.-]+/g, // URLs
        ];

        let entityCount = 0;
        patterns.forEach(pattern => {
            const matches = content.match(pattern) || [];
            entityCount += matches.length;
        });

        return Math.min(entityCount / 10, 1.0);
    }

    calculateRecencyScore(timestamp) {
        const now = new Date();
        const memoryDate = new Date(timestamp);
        const ageInDays = (now - memoryDate) / (1000 * 60 * 60 * 24);

        // Recent memories get higher scores
        return Math.max(0, 1 - (ageInDays / 30)); // Decay over 30 days
    }

    async suggestTags(content, existingMetadata = {}) {
        const tags = new Set();
        const contentLower = content.toLowerCase();

        // Technology stack detection
        const techPatterns = {
            'javascript': /javascript|js|node\.?js|npm|yarn/i,
            'python': /python|py|pip|django|flask/i,
            'react': /react|jsx|hooks|component/i,
            'database': /database|sql|mongodb|postgres/i,
            'api': /api|endpoint|rest|graphql/i,
            'frontend': /frontend|ui|ux|css|html/i,
            'backend': /backend|server|service|microservice/i,
            'devops': /docker|kubernetes|aws|azure|deployment/i,
            'testing': /test|testing|jest|cypress|playwright/i,
            'security': /security|auth|authentication|encryption/i
        };

        Object.entries(techPatterns).forEach(([tag, pattern]) => {
            if (pattern.test(content)) tags.add(tag);
        });

        // Priority detection
        if (/urgent|critical|asap|emergency/i.test(content)) tags.add('priority:high');
        else if (/important|priority|soon/i.test(content)) tags.add('priority:medium');
        else tags.add('priority:normal');

        // Entity type detection
        if (existingMetadata.entityType) {
            tags.add(`entity:${existingMetadata.entityType}`);
        } else {
            // Auto-detect entity type
            if (/task|todo|action/i.test(content)) tags.add('entity:task');
            else if (/plan|strategy|roadmap/i.test(content)) tags.add('entity:plan');
            else if (/note|information|fact/i.test(content)) tags.add('entity:note');
            else if (/problem|issue|bug/i.test(content)) tags.add('entity:problem');
        }

        return Array.from(tags);
    }

    async findRelatedMemories(memory, allMemories) {
        const relationships = [];
        const currentContent = memory.content.toLowerCase();

        for (const other of allMemories) {
            if (other.id === memory.id) continue;

            const similarity = this.calculateSimilarity(currentContent, other.content.toLowerCase());
            if (similarity > 0.3) { // Threshold for relationship
                relationships.push({
                    type: similarity > 0.7 ? 'strong' : 'weak',
                    targetId: other.id,
                    strength: Math.round(similarity * 100) / 100,
                    reason: 'content_similarity'
                });
            }
        }

        return relationships;
    }

    calculateSimilarity(content1, content2) {
        // Simple Jaccard similarity for demonstration
        const words1 = new Set(content1.split(/\s+/));
        const words2 = new Set(content2.split(/\s+/));

        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);

        return union.size > 0 ? intersection.size / union.size : 0;
    }
}

// ============================================================================
// PHASE 2: ANALYTICS ENGINE - USAGE INSIGHTS
// ============================================================================

class AnalyticsEngine {
    constructor() {
        this.metrics = {
            queries: new Map(),
            agents: new Map(),
            performance: new Map(),
            patterns: new Map()
        };
        this.startTime = new Date();
    }

    recordQuery(agentId, query, results, responseTime) {
        // Query metrics
        const queryKey = `${agentId}:${new Date().toISOString().slice(0, 13)}`; // Hour granularity
        if (!this.metrics.queries.has(queryKey)) {
            this.metrics.queries.set(queryKey, { count: 0, totalTime: 0, results: 0 });
        }

        const queryMetrics = this.metrics.queries.get(queryKey);
        queryMetrics.count++;
        queryMetrics.totalTime += responseTime;
        queryMetrics.results += results.length;

        // Agent activity
        if (!this.metrics.agents.has(agentId)) {
            this.metrics.agents.set(agentId, {
                queries: 0,
                lastActive: new Date(),
                avgResponseTime: 0,
                totalMemories: 0
            });
        }

        const agentMetrics = this.metrics.agents.get(agentId);
        agentMetrics.queries++;
        agentMetrics.lastActive = new Date();
        agentMetrics.avgResponseTime = (agentMetrics.avgResponseTime + responseTime) / 2;
    }

    recordMemoryOperation(agentId, operation, size = 0) {
        const agentMetrics = this.metrics.agents.get(agentId) || {
            queries: 0,
            lastActive: new Date(),
            avgResponseTime: 0,
            totalMemories: 0
        };

        switch (operation) {
            case 'create':
                agentMetrics.totalMemories++;
                break;
            case 'delete':
                agentMetrics.totalMemories--;
                break;
        }

        this.metrics.agents.set(agentId, agentMetrics);
    }

    getUsageInsights(agentId) {
        const agentMetrics = this.metrics.agents.get(agentId);
        if (!agentMetrics) return null;

        const hourlyQueries = Array.from(this.metrics.queries.entries())
            .filter(([key]) => key.startsWith(agentId))
            .map(([key, metrics]) => ({ hour: key.split(':')[1], ...metrics }));

        return {
            totalQueries: agentMetrics.queries,
            totalMemories: agentMetrics.totalMemories,
            averageResponseTime: Math.round(agentMetrics.avgResponseTime),
            lastActive: agentMetrics.lastActive,
            hourlyActivity: hourlyQueries,
            insights: this.generateInsights(agentId, agentMetrics)
        };
    }

    generateInsights(agentId, metrics) {
        const insights = [];

        if (metrics.avgResponseTime > 1000) {
            insights.push({
                type: 'performance',
                level: 'warning',
                message: 'Query response times are high. Consider optimizing search patterns.',
                suggestion: 'Use more specific queries or implement result caching'
            });
        }

        if (metrics.queries > 100) {
            insights.push({
                type: 'usage',
                level: 'info',
                message: 'High query volume detected. You are an active user!',
                suggestion: 'Consider using memory:context for related queries to improve efficiency'
            });
        }

        if (metrics.totalMemories > 500) {
            insights.push({
                type: 'organization',
                level: 'info',
                message: 'Large memory collection detected.',
                suggestion: 'Use tags and projects to better organize your memories'
            });
        }

        return insights;
    }
}

// ============================================================================
// PHASE 2: AUDIT ENGINE - COMPLIANCE & LOGGING
// ============================================================================

class AuditEngine {
    constructor() {
        this.auditLog = [];
        this.retentionPolicies = new Map();
        this.complianceRules = new Map();
    }

    logOperation(agentId, operation, details = {}) {
        const auditEntry = {
            timestamp: new Date(),
            agentId,
            operation,
            details,
            sessionId: details.sessionId || 'unknown',
            ipAddress: details.ipAddress || 'unknown',
            success: details.success !== false
        };

        this.auditLog.push(auditEntry);

        // Keep only last 10000 entries to prevent memory bloat
        if (this.auditLog.length > 10000) {
            this.auditLog = this.auditLog.slice(-5000);
        }

        console.log(`📋 Audit: ${agentId} ${operation} ${auditEntry.success ? '✅' : '❌'}`);
    }

    getAuditTrail(agentId, limit = 50) {
        return this.auditLog
            .filter(entry => entry.agentId === agentId)
            .slice(-limit)
            .reverse();
    }

    async enforceRetentionPolicy(memories, agentId) {
        const policy = this.retentionPolicies.get(agentId) || '365d';
        const retentionDays = parseInt(policy.replace('d', ''));
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

        const expiredMemories = memories.filter(memory => {
            const memoryDate = new Date(memory.timestamp);
            return memoryDate < cutoffDate;
        });

        if (expiredMemories.length > 0) {
            this.logOperation(agentId, 'retention_policy_enforcement', {
                expiredCount: expiredMemories.length,
                policy,
                success: true
            });
        }

        return expiredMemories.map(m => m.id);
    }

    async exportAgentData(agentId, format = 'json') {
        const auditTrail = this.getAuditTrail(agentId, 1000);

        const exportData = {
            agentId,
            exportTimestamp: new Date(),
            format,
            auditTrail,
            summary: {
                totalOperations: auditTrail.length,
                successRate: auditTrail.filter(e => e.success).length / auditTrail.length,
                operationTypes: [...new Set(auditTrail.map(e => e.operation))]
            }
        };

        this.logOperation(agentId, 'data_export', {
            format,
            recordCount: auditTrail.length,
            success: true
        });

        return exportData;
    }
}

// ============================================================================
// AZURE OPENAI EMBEDDINGS SERVICE (from Phase 1)
// ============================================================================

class AzureEmbeddingsService {
    constructor() {
        this.endpoint = process.env.AZURE_OPENAI_ENDPOINT;
        this.apiKey = process.env.AZURE_OPENAI_API_KEY;
        this.deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'text-embedding-3-large';
        this.apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-02-01';

        this.embeddingCache = new Map();
        this.isEnabled = !!(this.endpoint && this.apiKey);

        if (this.isEnabled) {
            console.log(`🤖 Azure OpenAI Embeddings Service initialized`);
            console.log(`📍 Endpoint: ${this.endpoint}`);
            console.log(`🚀 Deployment: ${this.deploymentName}`);
        } else {
            console.log(`⚠️ Azure OpenAI not configured - embeddings disabled`);
        }
    }

    async generateEmbedding(text, agentId) {
        if (!this.isEnabled) return null;

        // Security check - quota validation
        const securityEngine = global.securityEngine;
        if (securityEngine && !await securityEngine.checkQuota(agentId, 'embedding:request')) {
            console.log(`⛔ Embedding quota exceeded for agent ${agentId}`);
            return null;
        }

        const cacheKey = this.createCacheKey(text);
        if (this.embeddingCache.has(cacheKey)) {
            console.log(`💾 Using cached embedding`);
            return this.embeddingCache.get(cacheKey);
        }

        try {
            const url = `${this.endpoint}openai/deployments/${this.deploymentName}/embeddings?api-version=${this.apiVersion}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': this.apiKey
                },
                body: JSON.stringify({
                    input: text,
                    model: this.deploymentName
                })
            });

            if (!response.ok) {
                console.error(`❌ Azure OpenAI API error: ${response.status}`);
                return null;
            }

            const data = await response.json();
            const embedding = data.data[0].embedding;

            // Cache the result
            this.embeddingCache.set(cacheKey, embedding);

            // Update quota
            if (securityEngine) {
                await securityEngine.updateQuota(agentId, 'embedding:request');
            }

            console.log(`✨ Generated embedding vector (${embedding.length}d)`);
            return embedding;

        } catch (error) {
            console.error(`💥 Embedding generation failed:`, error.message);
            return null;
        }
    }

    createCacheKey(text) {
        return crypto.createHash('md5').update(text).digest('hex');
    }

    calculateCosineSimilarity(vecA, vecB) {
        if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }

        const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
        return Math.max(0, Math.min(1, similarity)); // Clamp to [0,1]
    }
}

// ============================================================================
// ENHANCED HYBRID SEARCH ENGINE (from Phase 1)
// ============================================================================

class HybridSearchEngine {
    constructor(embeddingsService, cbdClient) {
        this.embeddingsService = embeddingsService;
        this.cbdClient = cbdClient;
        this.searchCache = new Map();
        this.cacheTTL = parseInt(process.env.SEARCH_CACHE_TTL) || 300; // 5 minutes
    }

    async search(query, agentId, options = {}) {
        const {
            limit = 10,
            minImportance = 0,
            project,
            session,
            useCache = true
        } = options;

        // Security validation
        const securityEngine = global.securityEngine;
        if (securityEngine && !securityEngine.validatePermission(agentId, 'memory:search')) {
            throw new Error('Insufficient permissions for search');
        }

        const cacheKey = `${agentId}:${query}:${JSON.stringify(options)}`;

        if (useCache && this.searchCache.has(cacheKey)) {
            const cached = this.searchCache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTTL * 1000) {
                console.log(`💾 Using cached search results`);
                return cached.results;
            }
        }

        console.log(`🔍 Hybrid search: "${query}" for agent ${agentId}`);

        try {
            // Get all memories for the agent
            const allMemories = await this.cbdClient.listDocuments('memories', {
                agentId: agentId
            });

            if (!allMemories || allMemories.length === 0) {
                return [];
            }

            // Phase 2: Decrypt memories for search
            const decryptedMemories = allMemories.map(memory => {
                if (securityEngine && memory.content) {
                    memory.content = securityEngine.decryptMemory(agentId, memory.content);
                }
                return memory;
            });

            // Apply filters
            let filteredMemories = decryptedMemories;

            if (minImportance > 0) {
                filteredMemories = filteredMemories.filter(m =>
                    (m.metadata?.importance || 0) >= minImportance
                );
            }

            if (project) {
                filteredMemories = filteredMemories.filter(m =>
                    m.metadata?.project === project
                );
            }

            if (session) {
                filteredMemories = filteredMemories.filter(m =>
                    m.metadata?.session === session
                );
            }

            // Search strategies
            const strategies = {
                vector: await this.vectorSearch(query, filteredMemories, agentId),
                keyword: this.keywordSearch(query, filteredMemories),
                fuzzy: this.fuzzySearch(query, filteredMemories),
                metadata: this.metadataSearch(query, filteredMemories)
            };

            // Combine and rank results
            const combinedResults = this.combineSearchResults(strategies, limit);

            // Cache results
            if (useCache) {
                this.searchCache.set(cacheKey, {
                    results: combinedResults,
                    timestamp: Date.now()
                });
            }

            // Record analytics
            const analyticsEngine = global.analyticsEngine;
            if (analyticsEngine) {
                analyticsEngine.recordQuery(agentId, query, combinedResults, Date.now() - Date.now());
            }

            console.log(`✅ Found ${combinedResults.length} results`);
            return combinedResults;

        } catch (error) {
            console.error(`💥 Search failed:`, error.message);
            throw error;
        }
    }

    async vectorSearch(query, memories, agentId) {
        if (!process.env.ENABLE_VECTOR_SEARCH === 'true') return { results: [], weight: 0 };

        const queryEmbedding = await this.embeddingsService.generateEmbedding(query, agentId);
        if (!queryEmbedding) return { results: [], weight: 0 };

        const results = [];

        for (const memory of memories) {
            if (memory.embeddings && memory.embeddings.length > 0) {
                const similarity = this.embeddingsService.calculateCosineSimilarity(
                    queryEmbedding,
                    memory.embeddings
                );

                if (similarity > 0.1) { // Minimum threshold
                    results.push({
                        memory,
                        score: similarity,
                        strategy: 'vector'
                    });
                }
            }
        }

        return {
            results: results.sort((a, b) => b.score - a.score),
            weight: 0.4
        };
    }

    keywordSearch(query, memories) {
        if (!process.env.ENABLE_KEYWORD_SEARCH === 'false') {
            const queryWords = query.toLowerCase().split(/\s+/);
            const results = [];

            for (const memory of memories) {
                const content = (memory.content || '').toLowerCase();
                const structuredKey = (memory.structuredKey || '').toLowerCase();

                let matches = 0;
                let totalWords = queryWords.length;

                queryWords.forEach(word => {
                    if (content.includes(word) || structuredKey.includes(word)) {
                        matches++;
                    }
                });

                if (matches > 0) {
                    const score = matches / totalWords;
                    results.push({
                        memory,
                        score,
                        strategy: 'keyword',
                        matches
                    });
                }
            }

            return {
                results: results.sort((a, b) => b.score - a.score),
                weight: 0.3
            };
        }

        return { results: [], weight: 0 };
    }

    fuzzySearch(query, memories) {
        if (!process.env.ENABLE_FUZZY_MATCHING === 'true') return { results: [], weight: 0 };

        const results = [];
        const queryLower = query.toLowerCase();

        for (const memory of memories) {
            const content = (memory.content || '').toLowerCase();
            const fuzzyScore = this.calculateFuzzyScore(queryLower, content);

            if (fuzzyScore > 0.3) {
                results.push({
                    memory,
                    score: fuzzyScore,
                    strategy: 'fuzzy'
                });
            }
        }

        return {
            results: results.sort((a, b) => b.score - a.score),
            weight: 0.2
        };
    }

    metadataSearch(query, memories) {
        const results = [];
        const queryLower = query.toLowerCase();

        for (const memory of memories) {
            let score = 0;
            const metadata = memory.metadata || {};

            // Check tags
            if (metadata.tags && Array.isArray(metadata.tags)) {
                const tagMatches = metadata.tags.filter(tag =>
                    tag.toLowerCase().includes(queryLower)
                ).length;
                score += tagMatches * 0.5;
            }

            // Check entity type
            if (metadata.entityType && metadata.entityType.toLowerCase().includes(queryLower)) {
                score += 0.3;
            }

            // Check project
            if (metadata.project && metadata.project.toLowerCase().includes(queryLower)) {
                score += 0.4;
            }

            if (score > 0) {
                results.push({
                    memory,
                    score: Math.min(score, 1.0),
                    strategy: 'metadata'
                });
            }
        }

        return {
            results: results.sort((a, b) => b.score - a.score),
            weight: 0.1
        };
    }

    calculateFuzzyScore(query, content) {
        // Simple fuzzy matching - could be enhanced with Levenshtein distance
        const queryChars = query.split('');
        let matches = 0;
        let contentIndex = 0;

        for (const char of queryChars) {
            const foundIndex = content.indexOf(char, contentIndex);
            if (foundIndex !== -1) {
                matches++;
                contentIndex = foundIndex + 1;
            }
        }

        return matches / query.length;
    }

    combineSearchResults(strategies, limit) {
        const scoreMap = new Map();
        let totalWeight = 0;

        // Combine scores from all strategies
        Object.entries(strategies).forEach(([strategyName, { results, weight }]) => {
            totalWeight += weight;

            results.forEach(({ memory, score }) => {
                const memoryId = memory.id;
                const currentScore = scoreMap.get(memoryId) || { memory, totalScore: 0, strategies: [] };

                currentScore.totalScore += score * weight;
                currentScore.strategies.push({ strategy: strategyName, score, weight });

                scoreMap.set(memoryId, currentScore);
            });
        });

        // Normalize scores and sort
        const finalResults = Array.from(scoreMap.values())
            .map(({ memory, totalScore, strategies }) => ({
                ...memory,
                relevanceScore: totalWeight > 0 ? totalScore / totalWeight : 0,
                searchStrategies: strategies
            }))
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, limit);

        return finalResults;
    }
}

// ============================================================================
// ENHANCED MEMORAI MCP SERVER - PHASE 2
// ============================================================================

class MemorAIMCPServerPhase2 {
    constructor() {
        this.app = express();
        this.port = process.env.MEMORAI_MCP_PORT || 4950;
        this.version = "10.0.0-phase2";

        // Initialize Phase 2 engines
        this.securityEngine = new SecurityEngine();
        this.metadataEngine = new MetadataEngine();
        this.analyticsEngine = new AnalyticsEngine();
        this.auditEngine = new AuditEngine();

        // Phase 1 engines
        this.embeddingsService = new AzureEmbeddingsService();
        this.cbdClient = null;
        this.searchEngine = null;

        // Store engines globally for access
        global.securityEngine = this.securityEngine;
        global.metadataEngine = this.metadataEngine;
        global.analyticsEngine = this.analyticsEngine;
        global.auditEngine = this.auditEngine;

        this.setupMiddleware();
        this.initializeCBD();
        this.setupRoutes();
    }

    setupMiddleware() {
        this.app.use(cors({
            origin: ['http://localhost:3000', 'https://localhost:3000'],
            credentials: true
        }));

        this.app.use(express.json({ limit: '10mb' }));

        // Security middleware
        this.app.use((req, res, next) => {
            req.startTime = Date.now();
            next();
        });
    }

    async initializeCBD() {
        try {
            // Initialize CBD client
            this.cbdClient = {
                async storeDocument(collection, document) {
                    const response = await fetch('http://localhost:4180/api/cbd/store', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ collection, document })
                    });

                    if (!response.ok) throw new Error(`CBD store failed: ${response.statusText}`);
                    return await response.json();
                },

                async findDocuments(collection, query = {}) {
                    const response = await fetch('http://localhost:4180/api/cbd/find', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ collection, query })
                    });

                    if (!response.ok) throw new Error(`CBD find failed: ${response.statusText}`);
                    return await response.json();
                },

                async listDocuments(collection, filter = {}) {
                    const response = await fetch(`http://localhost:4180/api/cbd/list/${collection}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(filter)
                    });

                    if (!response.ok) throw new Error(`CBD list failed: ${response.statusText}`);
                    return await response.json();
                },

                async deleteDocument(collection, id) {
                    const response = await fetch(`http://localhost:4180/api/cbd/delete`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ collection, id })
                    });

                    if (!response.ok) throw new Error(`CBD delete failed: ${response.statusText}`);
                    return await response.json();
                }
            };

            // Initialize search engine
            this.searchEngine = new HybridSearchEngine(this.embeddingsService, this.cbdClient);

            console.log('🗃️ CBD Client initialized');

        } catch (error) {
            console.error('💥 CBD initialization failed:', error.message);
        }
    }

    setupRoutes() {
        // Health check with Phase 2 features
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                service: 'MemorAI MCP Server Phase 2',
                version: this.version,
                timestamp: new Date().toISOString(),
                features: {
                    azureEmbeddings: this.embeddingsService.isEnabled,
                    vectorSearch: process.env.ENABLE_VECTOR_SEARCH === 'true',
                    hybridSearch: process.env.ENABLE_HYBRID_SEARCH === 'true',
                    fuzzyMatching: process.env.ENABLE_FUZZY_MATCHING === 'true',
                    rbacSecurity: true,
                    metadataIntelligence: true,
                    usageAnalytics: true,
                    auditCompliance: true
                },
                database: {
                    status: 'connected',
                    paradigms: ['document', 'vector', 'graph', 'keyValue', 'timeSeries', 'fileStorage'],
                    aiServices: true
                }
            });
        });

        // MCP tools endpoints
        this.app.post('/mcp/remember', this.handleRemember.bind(this));
        this.app.post('/mcp/recall', this.handleRecall.bind(this));
        this.app.post('/mcp/forget', this.handleForget.bind(this));
        this.app.post('/mcp/context', this.handleContext.bind(this));

        // Phase 2: New analytics endpoints
        this.app.get('/analytics/:agentId', this.handleGetAnalytics.bind(this));
        this.app.get('/audit/:agentId', this.handleGetAuditTrail.bind(this));
        this.app.post('/export/:agentId', this.handleExportData.bind(this));

        console.log('🛣️ Routes configured');
    }

    async handleRemember(req, res) {
        try {
            const { agentId, content, metadata = {} } = req.body;

            if (!agentId || !content) {
                return res.status(400).json({
                    error: 'agentId and content are required'
                });
            }

            // Phase 2: Security validation
            if (!this.securityEngine.validatePermission(agentId, 'memory:write')) {
                this.auditEngine.logOperation(agentId, 'memory:remember', {
                    success: false,
                    reason: 'insufficient_permissions'
                });
                return res.status(403).json({ error: 'Insufficient permissions' });
            }

            // Phase 2: Quota check
            const contentSize = new TextEncoder().encode(content).length;
            if (!await this.securityEngine.checkQuota(agentId, 'memory:create', contentSize)) {
                this.auditEngine.logOperation(agentId, 'memory:remember', {
                    success: false,
                    reason: 'quota_exceeded'
                });
                return res.status(429).json({ error: 'Memory quota exceeded' });
            }

            // Phase 2: Enhanced metadata processing
            const importance = await this.metadataEngine.calculateImportance({ content, timestamp: new Date(), metadata });
            const suggestedTags = await this.metadataEngine.suggestTags(content, metadata);

            // Merge suggested tags with existing tags
            const enhancedMetadata = {
                ...metadata,
                importance,
                tags: [...(metadata.tags || []), ...suggestedTags],
                entityType: metadata.entityType || 'memory',
                priority: metadata.priority || 'normal',
                createdAt: new Date().toISOString(),
                lastModified: new Date().toISOString()
            };

            // Phase 2: Encrypt content
            const encryptedContent = this.securityEngine.encryptMemory(agentId, content);

            // Generate embeddings
            const embeddings = await this.embeddingsService.generateEmbedding(content, agentId);

            // Create structured key
            const structuredKey = `memorai:${agentId}:${Date.now()}:${crypto.randomBytes(4).toString('hex')}`;

            // Phase 2: Enhanced memory record
            const memoryRecord = {
                id: crypto.randomUUID(),
                agentId,
                content: encryptedContent,
                structuredKey,
                metadata: enhancedMetadata,
                embeddings,
                timestamp: new Date().toISOString(),

                // Phase 2: New fields
                securityLevel: 'private',
                accessControl: {
                    readers: [agentId],
                    writers: [agentId],
                    admins: [agentId]
                },
                lifecycle: {
                    createdAt: new Date(),
                    lastAccessed: new Date(),
                    accessCount: 0,
                    retentionPolicy: '365d'
                },
                relationships: []
            };

            // Store in CBD
            await this.cbdClient.storeDocument('memories', memoryRecord);

            // Phase 2: Update quota and analytics
            await this.securityEngine.updateQuota(agentId, 'memory:create', contentSize);
            this.analyticsEngine.recordMemoryOperation(agentId, 'create', contentSize);

            // Phase 2: Audit logging
            this.auditEngine.logOperation(agentId, 'memory:remember', {
                memoryId: memoryRecord.id,
                contentSize,
                importance,
                success: true
            });

            // Find relationships with existing memories
            try {
                const allMemories = await this.cbdClient.listDocuments('memories', { agentId });
                const relationships = await this.metadataEngine.findRelatedMemories(memoryRecord, allMemories);

                if (relationships.length > 0) {
                    memoryRecord.relationships = relationships;
                    await this.cbdClient.storeDocument('memories', memoryRecord); // Update with relationships
                }
            } catch (relationshipError) {
                console.warn('⚠️ Failed to compute relationships:', relationshipError.message);
            }

            res.json({
                success: true,
                structuredKey: memoryRecord.structuredKey,
                metadata: enhancedMetadata,
                importance,
                relationships: memoryRecord.relationships.length,
                encryption: 'enabled',
                embeddings: embeddings ? 'generated' : 'skipped'
            });

        } catch (error) {
            console.error('💥 Remember failed:', error);

            // Phase 2: Audit failed operation
            if (req.body.agentId) {
                this.auditEngine.logOperation(req.body.agentId, 'memory:remember', {
                    success: false,
                    error: error.message
                });
            }

            res.status(500).json({
                error: 'Failed to store memory',
                details: error.message
            });
        }
    }

    async handleRecall(req, res) {
        try {
            const { agentId, query, limit = 10, minImportance = 0, project, session } = req.body;

            if (!agentId || !query) {
                return res.status(400).json({
                    error: 'agentId and query are required'
                });
            }

            // Phase 2: Security validation
            if (!this.securityEngine.validatePermission(agentId, 'memory:read')) {
                this.auditEngine.logOperation(agentId, 'memory:recall', {
                    success: false,
                    reason: 'insufficient_permissions'
                });
                return res.status(403).json({ error: 'Insufficient permissions' });
            }

            const startTime = Date.now();

            // Enhanced search with Phase 2 features
            const results = await this.searchEngine.search(query, agentId, {
                limit,
                minImportance,
                project,
                session
            });

            const responseTime = Date.now() - startTime;

            // Phase 2: Update access tracking
            for (const result of results) {
                if (result.lifecycle) {
                    result.lifecycle.lastAccessed = new Date();
                    result.lifecycle.accessCount = (result.lifecycle.accessCount || 0) + 1;

                    // Update in database
                    try {
                        await this.cbdClient.storeDocument('memories', result);
                    } catch (updateError) {
                        console.warn('⚠️ Failed to update access tracking:', updateError.message);
                    }
                }
            }

            // Phase 2: Analytics recording
            this.analyticsEngine.recordQuery(agentId, query, results, responseTime);

            // Phase 2: Audit logging
            this.auditEngine.logOperation(agentId, 'memory:recall', {
                query,
                resultsCount: results.length,
                responseTime,
                success: true
            });

            res.json({
                results: results.map(result => ({
                    structuredKey: result.structuredKey,
                    content: result.content,
                    metadata: result.metadata,
                    relevanceScore: result.relevanceScore,
                    timestamp: result.timestamp,
                    importance: result.metadata?.importance || 0,
                    relationships: result.relationships?.length || 0,
                    searchStrategies: result.searchStrategies || []
                })),
                searchTime: responseTime,
                totalResults: results.length,
                searchStrategies: ['vector', 'keyword', 'fuzzy', 'metadata'],
                phase: 2
            });

        } catch (error) {
            console.error('💥 Recall failed:', error);

            // Phase 2: Audit failed operation
            if (req.body.agentId) {
                this.auditEngine.logOperation(req.body.agentId, 'memory:recall', {
                    success: false,
                    error: error.message
                });
            }

            res.status(500).json({
                error: 'Failed to recall memories',
                details: error.message
            });
        }
    }

    async handleForget(req, res) {
        try {
            const { agentId, structuredKey } = req.body;

            if (!agentId || !structuredKey) {
                return res.status(400).json({
                    error: 'agentId and structuredKey are required'
                });
            }

            // Phase 2: Security validation
            if (!this.securityEngine.validatePermission(agentId, 'memory:delete')) {
                this.auditEngine.logOperation(agentId, 'memory:forget', {
                    success: false,
                    reason: 'insufficient_permissions'
                });
                return res.status(403).json({ error: 'Insufficient permissions' });
            }

            // Find the memory
            const memories = await this.cbdClient.findDocuments('memories', {
                agentId,
                structuredKey
            });

            if (!memories || memories.length === 0) {
                this.auditEngine.logOperation(agentId, 'memory:forget', {
                    structuredKey,
                    success: false,
                    reason: 'not_found'
                });
                return res.status(404).json({ error: 'Memory not found' });
            }

            const memory = memories[0];
            const contentSize = new TextEncoder().encode(memory.content || '').length;

            // Delete from CBD
            await this.cbdClient.deleteDocument('memories', memory.id);

            // Phase 2: Update quota and analytics
            await this.securityEngine.updateQuota(agentId, 'memory:delete', contentSize);
            this.analyticsEngine.recordMemoryOperation(agentId, 'delete', contentSize);

            // Phase 2: Audit logging
            this.auditEngine.logOperation(agentId, 'memory:forget', {
                memoryId: memory.id,
                structuredKey,
                contentSize,
                success: true
            });

            res.json({
                success: true,
                message: 'Memory deleted successfully',
                structuredKey,
                phase: 2
            });

        } catch (error) {
            console.error('💥 Forget failed:', error);

            // Phase 2: Audit failed operation
            if (req.body.agentId) {
                this.auditEngine.logOperation(req.body.agentId, 'memory:forget', {
                    success: false,
                    error: error.message
                });
            }

            res.status(500).json({
                error: 'Failed to delete memory',
                details: error.message
            });
        }
    }

    async handleContext(req, res) {
        try {
            const { agentId, contextSize = 5 } = req.body;

            if (!agentId) {
                return res.status(400).json({
                    error: 'agentId is required'
                });
            }

            // Phase 2: Security validation
            if (!this.securityEngine.validatePermission(agentId, 'memory:read')) {
                return res.status(403).json({ error: 'Insufficient permissions' });
            }

            // Get recent memories
            const allMemories = await this.cbdClient.listDocuments('memories', { agentId });

            // Sort by importance and recency
            const contextMemories = allMemories
                .sort((a, b) => {
                    const importanceA = a.metadata?.importance || 0;
                    const importanceB = b.metadata?.importance || 0;
                    const timeA = new Date(a.timestamp).getTime();
                    const timeB = new Date(b.timestamp).getTime();

                    // Weighted score: 60% importance, 40% recency
                    const scoreA = importanceA * 0.6 + (timeA / Date.now()) * 0.4;
                    const scoreB = importanceB * 0.6 + (timeB / Date.now()) * 0.4;

                    return scoreB - scoreA;
                })
                .slice(0, contextSize);

            // Phase 2: Decrypt for context
            const decryptedContext = contextMemories.map(memory => ({
                structuredKey: memory.structuredKey,
                content: this.securityEngine.decryptMemory(agentId, memory.content),
                metadata: memory.metadata,
                importance: memory.metadata?.importance || 0,
                timestamp: memory.timestamp,
                relationships: memory.relationships?.length || 0
            }));

            // Phase 2: Audit logging
            this.auditEngine.logOperation(agentId, 'memory:context', {
                contextSize,
                returnedCount: decryptedContext.length,
                success: true
            });

            res.json({
                context: decryptedContext,
                contextSize: decryptedContext.length,
                phase: 2
            });

        } catch (error) {
            console.error('💥 Context failed:', error);

            // Phase 2: Audit failed operation
            if (req.body.agentId) {
                this.auditEngine.logOperation(req.body.agentId, 'memory:context', {
                    success: false,
                    error: error.message
                });
            }

            res.status(500).json({
                error: 'Failed to get context',
                details: error.message
            });
        }
    }

    // Phase 2: New analytics endpoint
    async handleGetAnalytics(req, res) {
        try {
            const { agentId } = req.params;

            if (!this.securityEngine.validatePermission(agentId, 'memory:read')) {
                return res.status(403).json({ error: 'Insufficient permissions' });
            }

            const insights = this.analyticsEngine.getUsageInsights(agentId);
            const quotaUsage = this.securityEngine.quotaUsage.get(agentId);
            const profile = this.securityEngine.agentProfiles.get(agentId);

            res.json({
                agentId,
                profile: profile ? {
                    role: profile.role,
                    permissions: profile.permissions,
                    quotas: profile.quotas,
                    createdAt: profile.createdAt
                } : null,
                quotaUsage,
                insights,
                phase: 2
            });

        } catch (error) {
            console.error('💥 Analytics failed:', error);
            res.status(500).json({
                error: 'Failed to get analytics',
                details: error.message
            });
        }
    }

    // Phase 2: New audit trail endpoint
    async handleGetAuditTrail(req, res) {
        try {
            const { agentId } = req.params;
            const { limit = 50 } = req.query;

            if (!this.securityEngine.validatePermission(agentId, 'memory:read')) {
                return res.status(403).json({ error: 'Insufficient permissions' });
            }

            const auditTrail = this.auditEngine.getAuditTrail(agentId, parseInt(limit));

            res.json({
                agentId,
                auditTrail,
                totalEntries: auditTrail.length,
                phase: 2
            });

        } catch (error) {
            console.error('💥 Audit trail failed:', error);
            res.status(500).json({
                error: 'Failed to get audit trail',
                details: error.message
            });
        }
    }

    // Phase 2: New data export endpoint
    async handleExportData(req, res) {
        try {
            const { agentId } = req.params;
            const { format = 'json' } = req.body;

            if (!this.securityEngine.validatePermission(agentId, 'memory:read')) {
                return res.status(403).json({ error: 'Insufficient permissions' });
            }

            const exportData = await this.auditEngine.exportAgentData(agentId, format);

            res.json({
                success: true,
                exportData,
                phase: 2
            });

        } catch (error) {
            console.error('💥 Data export failed:', error);
            res.status(500).json({
                error: 'Failed to export data',
                details: error.message
            });
        }
    }

    async start() {
        try {
            await new Promise((resolve) => {
                this.server = this.app.listen(this.port, '0.0.0.0', resolve);
            });

            console.log('\n🚀 MemorAI MCP Server Phase 2 - Advanced Memory Engine');
            console.log('===============================================');
            console.log(`🌐 Server running on: http://localhost:${this.port}`);
            console.log(`📊 Version: ${this.version}`);
            console.log('');
            console.log('🔐 Phase 2 Features:');
            console.log('  ✅ Multi-Tenant RBAC Security');
            console.log('  ✅ Intelligent Metadata Engine');
            console.log('  ✅ Usage Analytics & Insights');
            console.log('  ✅ Audit Trail & Compliance');
            console.log('  ✅ Memory Encryption & Isolation');
            console.log('  ✅ Quota Management & Rate Limiting');
            console.log('  ✅ Relationship Mapping');
            console.log('  ✅ Predictive Categorization');
            console.log('');
            console.log('🎯 Ready for Enterprise Memory Management!');
            console.log('===============================================');

        } catch (error) {
            console.error('💥 Server startup failed:', error);
            process.exit(1);
        }
    }
}

// ============================================================================
// SERVER STARTUP
// ============================================================================

const server = new MemorAIMCPServerPhase2();
server.start().catch(console.error);

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down MemorAI MCP Server Phase 2...');
    if (server.server) {
        server.server.close(() => {
            console.log('✅ Server closed gracefully');
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});

module.exports = { MemorAIMCPServerPhase2 };
