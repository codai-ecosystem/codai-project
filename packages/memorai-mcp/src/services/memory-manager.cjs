#!/usr/bin/env node

/**
 * @fileoverview MemorAI Memory Manager Service
 * @description Core memory management service for MemorAI MCP
 * @version 1.0.0
 * @author MemorAI Development Team
 */

const crypto = require('crypto');
const { EventEmitter } = require('events');
const config = require('../utils/config.cjs');
const logger = require('../utils/logger.cjs');

/**
 * Advanced Memory Manager for MemorAI system
 * Handles memory storage, retrieval, and intelligent operations
 */
class MemoryManager extends EventEmitter {
    constructor(options = {}) {
        super();

        this.options = {
            maxMemories: options.maxMemories || 10000,
            enableEncryption: options.enableEncryption || false,
            enableCompression: options.enableCompression || false,
            enableVersioning: options.enableVersioning || false,
            maxVersions: options.maxVersions || 5,
            ...options
        };

        this.memories = new Map();
        this.agents = new Map();
        this.tags = new Map();
        this.categories = new Map();
        this.stats = {
            totalMemories: 0,
            totalAgents: 0,
            totalSearches: 0,
            averageSearchTime: 0,
            lastCleanup: null,
            createdToday: 0,
            updatedToday: 0
        };

        this.logger = logger.createPhaseLogger('memory-manager');
        this.encryptionKey = this.generateEncryptionKey();

        this.initialize();
    }

    /**
     * Initialize the memory manager
     * @private
     */
    initialize() {
        this.logger.info('Initializing MemoryManager', {
            maxMemories: this.options.maxMemories,
            encryption: this.options.enableEncryption,
            compression: this.options.enableCompression,
            versioning: this.options.enableVersioning
        });

        // Setup periodic cleanup
        this.setupPeriodicCleanup();

        // Setup event handlers
        this.setupEventHandlers();

        this.emit('manager:initialized');
    }

    /**
     * Generate encryption key for memory encryption
     * @returns {string} Encryption key
     * @private
     */
    generateEncryptionKey() {
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Setup periodic cleanup tasks
     * @private
     */
    setupPeriodicCleanup() {
        setInterval(() => {
            this.performCleanup();
        }, 30 * 60 * 1000); // Every 30 minutes
    }

    /**
     * Setup event handlers
     * @private
     */
    setupEventHandlers() {
        this.on('memory:created', (memory) => {
            this.stats.totalMemories++;
            this.stats.createdToday++;
            this.updateTagIndex(memory);
            this.updateCategoryIndex(memory);
        });

        this.on('memory:updated', (memory) => {
            this.stats.updatedToday++;
            this.updateTagIndex(memory);
            this.updateCategoryIndex(memory);
        });

        this.on('memory:deleted', (memoryId) => {
            this.stats.totalMemories--;
            this.cleanupIndexes(memoryId);
        });
    }

    /**
     * Create a new memory
     * @param {Object} memoryData Memory data
     * @returns {Object} Created memory object
     */
    async createMemory(memoryData) {
        try {
            const memoryId = this.generateMemoryId();
            const timestamp = new Date().toISOString();

            const memory = {
                id: memoryId,
                agentId: memoryData.agentId || 'default',
                content: memoryData.content,
                metadata: {
                    entityType: memoryData.metadata?.entityType || 'general',
                    priority: memoryData.metadata?.priority || 'medium',
                    project: memoryData.metadata?.project,
                    session: memoryData.metadata?.session,
                    tags: memoryData.metadata?.tags || [],
                    ...memoryData.metadata
                },
                tags: memoryData.tags || [],
                category: memoryData.category || 'general',
                importance: memoryData.importance || 0.5,
                embedding: memoryData.embedding,
                version: 1,
                versions: this.options.enableVersioning ? [] : undefined,
                createdAt: timestamp,
                updatedAt: timestamp,
                lastAccessedAt: timestamp,
                accessCount: 0,
                isEncrypted: false
            };

            // Encrypt if enabled
            if (this.options.enableEncryption) {
                memory.content = this.encryptContent(memory.content);
                memory.isEncrypted = true;
            }

            // Store memory
            this.memories.set(memoryId, memory);

            // Update agent tracking
            this.updateAgentTracking(memory.agentId, memoryId);

            this.logger.debug('Memory created', {
                memoryId,
                agentId: memory.agentId,
                entityType: memory.metadata.entityType,
                contentLength: memoryData.content.length
            });

            this.emit('memory:created', memory);

            return this.sanitizeMemoryForResponse(memory);

        } catch (error) {
            this.logger.error('Failed to create memory', {
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    /**
     * Update an existing memory
     * @param {string} memoryId Memory ID
     * @param {Object} updateData Update data
     * @returns {Object} Updated memory object
     */
    async updateMemory(memoryId, updateData) {
        try {
            const memory = this.memories.get(memoryId);

            if (!memory) {
                throw new Error(`Memory ${memoryId} not found`);
            }

            // Store previous version if versioning enabled
            if (this.options.enableVersioning) {
                this.addVersion(memory);
            }

            // Update memory data
            if (updateData.content !== undefined) {
                memory.content = this.options.enableEncryption ?
                    this.encryptContent(updateData.content) : updateData.content;
            }

            if (updateData.metadata) {
                memory.metadata = { ...memory.metadata, ...updateData.metadata };
            }

            if (updateData.tags) {
                memory.tags = updateData.tags;
            }

            if (updateData.importance !== undefined) {
                memory.importance = updateData.importance;
            }

            if (updateData.embedding) {
                memory.embedding = updateData.embedding;
            }

            memory.updatedAt = new Date().toISOString();
            memory.version++;

            this.logger.debug('Memory updated', {
                memoryId,
                version: memory.version,
                changes: Object.keys(updateData)
            });

            this.emit('memory:updated', memory);

            return this.sanitizeMemoryForResponse(memory);

        } catch (error) {
            this.logger.error('Failed to update memory', {
                memoryId,
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Retrieve memories by agent ID
     * @param {string} agentId Agent ID
     * @param {Object} options Query options
     * @returns {Object[]} Array of memories
     */
    async getMemoriesByAgent(agentId, options = {}) {
        try {
            const limit = options.limit || 50;
            const offset = options.offset || 0;
            const sortBy = options.sortBy || 'updatedAt';
            const sortOrder = options.sortOrder || 'desc';

            const agentData = this.agents.get(agentId);
            if (!agentData) {
                return [];
            }

            let memories = Array.from(agentData.memoryIds)
                .map(id => this.memories.get(id))
                .filter(Boolean)
                .map(memory => {
                    this.updateAccessInfo(memory);
                    return this.sanitizeMemoryForResponse(memory);
                });

            // Sort memories
            memories.sort((a, b) => {
                const aVal = a[sortBy];
                const bVal = b[sortBy];

                if (sortOrder === 'desc') {
                    return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
                } else {
                    return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
                }
            });

            // Apply pagination
            memories = memories.slice(offset, offset + limit);

            this.logger.debug('Retrieved memories by agent', {
                agentId,
                count: memories.length,
                limit,
                offset
            });

            return memories;

        } catch (error) {
            this.logger.error('Failed to retrieve memories by agent', {
                agentId,
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Search memories using semantic search
     * @param {Object} searchParams Search parameters
     * @returns {Object[]} Array of matching memories
     */
    async searchMemories(searchParams) {
        try {
            const startTime = Date.now();
            const {
                agentId,
                query,
                entityType,
                tags,
                importance,
                limit = 10,
                offset = 0,
                sortBy = 'relevance'
            } = searchParams;

            let candidates = Array.from(this.memories.values());

            // Filter by agent if specified
            if (agentId) {
                const agentData = this.agents.get(agentId);
                if (agentData) {
                    candidates = candidates.filter(memory =>
                        agentData.memoryIds.has(memory.id)
                    );
                }
            }

            // Filter by entity type
            if (entityType) {
                candidates = candidates.filter(memory =>
                    memory.metadata.entityType === entityType
                );
            }

            // Filter by tags
            if (tags && tags.length > 0) {
                candidates = candidates.filter(memory =>
                    tags.some(tag => memory.tags.includes(tag))
                );
            }

            // Filter by importance
            if (importance !== undefined) {
                candidates = candidates.filter(memory =>
                    memory.importance >= importance
                );
            }

            // Text search in content and metadata
            if (query) {
                candidates = candidates.filter(memory => {
                    const content = this.options.enableEncryption ?
                        this.decryptContent(memory.content) : memory.content;

                    const searchText = [
                        content,
                        JSON.stringify(memory.metadata),
                        memory.tags.join(' ')
                    ].join(' ').toLowerCase();

                    return searchText.includes(query.toLowerCase());
                });
            }

            // Calculate relevance scores
            candidates = candidates.map(memory => {
                let relevanceScore = memory.importance || 0.5;

                // Boost recent memories
                const daysSinceUpdate = (Date.now() - new Date(memory.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
                relevanceScore += Math.max(0, 1 - daysSinceUpdate / 30); // Boost for last 30 days

                // Boost frequently accessed memories
                relevanceScore += Math.min(0.5, memory.accessCount / 100);

                // Update access info
                this.updateAccessInfo(memory);

                return {
                    ...this.sanitizeMemoryForResponse(memory),
                    relevanceScore
                };
            });

            // Sort by relevance or specified field
            if (sortBy === 'relevance') {
                candidates.sort((a, b) => b.relevanceScore - a.relevanceScore);
            } else {
                candidates.sort((a, b) => {
                    const aVal = a[sortBy];
                    const bVal = b[sortBy];
                    return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
                });
            }

            // Apply pagination
            const results = candidates.slice(offset, offset + limit);

            const searchTime = Date.now() - startTime;
            this.stats.totalSearches++;
            this.stats.averageSearchTime =
                (this.stats.averageSearchTime * (this.stats.totalSearches - 1) + searchTime) /
                this.stats.totalSearches;

            this.logger.debug('Memory search completed', {
                query,
                totalResults: candidates.length,
                returnedResults: results.length,
                searchTime: `${searchTime}ms`,
                agentId
            });

            return {
                memories: results,
                total: candidates.length,
                searchTime,
                query: searchParams
            };

        } catch (error) {
            this.logger.error('Failed to search memories', {
                query: searchParams.query,
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Delete a memory
     * @param {string} memoryId Memory ID
     * @returns {boolean} Success status
     */
    async deleteMemory(memoryId) {
        try {
            const memory = this.memories.get(memoryId);

            if (!memory) {
                throw new Error(`Memory ${memoryId} not found`);
            }

            // Remove from memories
            this.memories.delete(memoryId);

            // Remove from agent tracking
            const agentData = this.agents.get(memory.agentId);
            if (agentData) {
                agentData.memoryIds.delete(memoryId);
                if (agentData.memoryIds.size === 0) {
                    this.agents.delete(memory.agentId);
                }
            }

            this.logger.debug('Memory deleted', { memoryId, agentId: memory.agentId });

            this.emit('memory:deleted', memoryId);

            return true;

        } catch (error) {
            this.logger.error('Failed to delete memory', {
                memoryId,
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Get memory statistics
     * @returns {Object} Statistics object
     */
    getStats() {
        return {
            ...this.stats,
            memoryCount: this.memories.size,
            agentCount: this.agents.size,
            tagCount: this.tags.size,
            categoryCount: this.categories.size,
            memoryUsage: process.memoryUsage(),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Generate unique memory ID
     * @returns {string} Unique memory ID
     * @private
     */
    generateMemoryId() {
        return `mem_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    }

    /**
     * Update agent tracking
     * @param {string} agentId Agent ID
     * @param {string} memoryId Memory ID
     * @private
     */
    updateAgentTracking(agentId, memoryId) {
        if (!this.agents.has(agentId)) {
            this.agents.set(agentId, {
                id: agentId,
                memoryIds: new Set(),
                createdAt: new Date().toISOString(),
                lastActiveAt: new Date().toISOString()
            });
            this.stats.totalAgents++;
        }

        const agentData = this.agents.get(agentId);
        agentData.memoryIds.add(memoryId);
        agentData.lastActiveAt = new Date().toISOString();
    }

    /**
     * Update tag index
     * @param {Object} memory Memory object
     * @private
     */
    updateTagIndex(memory) {
        memory.tags.forEach(tag => {
            if (!this.tags.has(tag)) {
                this.tags.set(tag, new Set());
            }
            this.tags.get(tag).add(memory.id);
        });
    }

    /**
     * Update category index
     * @param {Object} memory Memory object
     * @private
     */
    updateCategoryIndex(memory) {
        if (!this.categories.has(memory.category)) {
            this.categories.set(memory.category, new Set());
        }
        this.categories.get(memory.category).add(memory.id);
    }

    /**
     * Update memory access information
     * @param {Object} memory Memory object
     * @private
     */
    updateAccessInfo(memory) {
        memory.lastAccessedAt = new Date().toISOString();
        memory.accessCount = (memory.accessCount || 0) + 1;
    }

    /**
     * Encrypt content
     * @param {string} content Content to encrypt
     * @returns {string} Encrypted content
     * @private
     */
    encryptContent(content) {
        const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
        let encrypted = cipher.update(content, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }

    /**
     * Decrypt content
     * @param {string} encryptedContent Encrypted content
     * @returns {string} Decrypted content
     * @private
     */
    decryptContent(encryptedContent) {
        const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
        let decrypted = decipher.update(encryptedContent, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

    /**
     * Add version to memory history
     * @param {Object} memory Memory object
     * @private
     */
    addVersion(memory) {
        if (!memory.versions) {
            memory.versions = [];
        }

        memory.versions.push({
            version: memory.version,
            content: memory.content,
            metadata: { ...memory.metadata },
            updatedAt: memory.updatedAt
        });

        // Keep only max versions
        if (memory.versions.length > this.options.maxVersions) {
            memory.versions = memory.versions.slice(-this.options.maxVersions);
        }
    }

    /**
     * Sanitize memory for response
     * @param {Object} memory Memory object
     * @returns {Object} Sanitized memory
     * @private
     */
    sanitizeMemoryForResponse(memory) {
        const sanitized = { ...memory };

        // Decrypt content if encrypted
        if (memory.isEncrypted && this.options.enableEncryption) {
            sanitized.content = this.decryptContent(memory.content);
        }

        // Remove sensitive data
        delete sanitized.isEncrypted;
        delete sanitized.versions; // Only return current version

        return sanitized;
    }

    /**
     * Cleanup indexes after memory deletion
     * @param {string} memoryId Memory ID
     * @private
     */
    cleanupIndexes(memoryId) {
        // Clean tag indexes
        for (const [tag, memoryIds] of this.tags.entries()) {
            memoryIds.delete(memoryId);
            if (memoryIds.size === 0) {
                this.tags.delete(tag);
            }
        }

        // Clean category indexes
        for (const [category, memoryIds] of this.categories.entries()) {
            memoryIds.delete(memoryId);
            if (memoryIds.size === 0) {
                this.categories.delete(category);
            }
        }
    }

    /**
     * Perform periodic cleanup
     * @private
     */
    performCleanup() {
        this.logger.debug('Performing periodic cleanup');

        // Reset daily counters
        this.stats.createdToday = 0;
        this.stats.updatedToday = 0;
        this.stats.lastCleanup = new Date().toISOString();

        // Additional cleanup tasks can be added here
        this.emit('cleanup:completed');
    }
}

module.exports = MemoryManager;
