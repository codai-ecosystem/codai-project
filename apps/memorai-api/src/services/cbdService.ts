/**
 * CBD Service Integration for MemorAI API
 * Handles connection and operations with CBD vector database
 */

import { config } from '@/config/environment.js';
import { logger } from '@/utils/logger.js';

export interface Memory {
    id: string;
    userId: string;
    title: string;
    content: string;
    embedding?: number[];
    metadata: {
        tags: string[];
        source: string;
        createdAt: string;
        updatedAt: string;
        version: number;
    };
}

export interface SearchResult {
    memory: Memory;
    similarity: number;
}

export interface CBDResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

class CBDService {
    private baseUrl: string;
    private apiKey?: string;
    private connected: boolean = false;

    constructor() {
        this.baseUrl = config.cbdDatabaseUrl;
        this.apiKey = config.cbdApiKey;
    }

    /**
     * Initialize connection to CBD database
     */
    async initialize(): Promise<void> {
        try {
            logger.info('Initializing CBD service connection...');

            const response = await fetch(`${this.baseUrl}/health`, {
                method: 'GET',
                headers: this.getHeaders(),
            });

            if (!response.ok) {
                throw new Error(`CBD health check failed: ${response.status} ${response.statusText}`);
            }

            const healthData = await response.json();
            logger.info('CBD service health check successful', { health: healthData });

            this.connected = true;
            logger.info('CBD service connection established');
        } catch (error) {
            logger.error('Failed to initialize CBD service:', error);
            throw error;
        }
    }

    /**
     * Disconnect from CBD database
     */
    async disconnect(): Promise<void> {
        this.connected = false;
        logger.info('CBD service connection closed');
    }

    /**
     * Store a memory in CBD database
     */
    async storeMemory(memory: Omit<Memory, 'id'>): Promise<CBDResponse<Memory>> {
        if (!this.connected) {
            throw new Error('CBD service not connected');
        }

        try {
            const startTime = Date.now();

            const response = await fetch(`${this.baseUrl}/document/`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    collection: 'memories',
                    document: {
                        userId: memory.userId,
                        title: memory.title,
                        content: memory.content,
                        embedding: memory.embedding,
                        metadata: {
                            ...memory.metadata,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            version: 1
                        }
                    }
                })
            });

            const duration = Date.now() - startTime;

            if (!response.ok) {
                const errorText = await response.text();
                logger.error('Failed to store memory in CBD', {
                    statusCode: response.status,
                    error: errorText,
                    duration
                });
                return {
                    success: false,
                    error: `Failed to store memory: ${response.status} ${response.statusText}`
                };
            }

            const result = await response.json() as any;
            logger.info('Memory stored successfully in CBD', {
                memoryId: result.id,
                userId: memory.userId,
                duration
            });

            return {
                success: true,
                data: {
                    id: result.id,
                    ...memory,
                    metadata: {
                        ...memory.metadata,
                        createdAt: result.createdAt || new Date().toISOString(),
                        updatedAt: result.updatedAt || new Date().toISOString()
                    }
                } as Memory
            };
        } catch (error) {
            logger.error('Error storing memory in CBD:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Retrieve a memory by ID
     */
    async getMemory(memoryId: string, userId: string): Promise<CBDResponse<Memory>> {
        if (!this.connected) {
            throw new Error('CBD service not connected');
        }

        try {
            const startTime = Date.now();

            const response = await fetch(`${this.baseUrl}/document/${memoryId}`, {
                method: 'GET',
                headers: this.getHeaders(),
            });

            const duration = Date.now() - startTime;

            if (!response.ok) {
                if (response.status === 404) {
                    return {
                        success: false,
                        error: 'Memory not found'
                    };
                }

                const errorText = await response.text();
                logger.error('Failed to retrieve memory from CBD', {
                    memoryId,
                    statusCode: response.status,
                    error: errorText,
                    duration
                });
                return {
                    success: false,
                    error: `Failed to retrieve memory: ${response.status} ${response.statusText}`
                };
            }

            const result = await response.json() as any;

            // Verify user owns this memory
            if (result.userId !== userId) {
                return {
                    success: false,
                    error: 'Access denied: Memory belongs to another user'
                };
            }

            logger.debug('Memory retrieved successfully from CBD', {
                memoryId,
                userId,
                duration
            });

            return {
                success: true,
                data: result as Memory
            };
        } catch (error) {
            logger.error('Error retrieving memory from CBD:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Search memories using vector similarity
     */
    async searchMemories(
        query: string,
        userId: string,
        options: {
            limit?: number;
            similarityThreshold?: number;
            tags?: string[];
        } = {}
    ): Promise<CBDResponse<SearchResult[]>> {
        if (!this.connected) {
            throw new Error('CBD service not connected');
        }

        try {
            const startTime = Date.now();

            const searchParams = new URLSearchParams({
                q: query,
                userId,
                limit: (options.limit || 10).toString(),
                threshold: (options.similarityThreshold || 0.7).toString(),
                ...(options.tags?.length ? { tags: options.tags.join(',') } : {})
            });

            const response = await fetch(`${this.baseUrl}/search?${searchParams}`, {
                method: 'GET',
                headers: this.getHeaders(),
            });

            const duration = Date.now() - startTime;

            if (!response.ok) {
                const errorText = await response.text();
                logger.error('Failed to search memories in CBD', {
                    query,
                    userId,
                    statusCode: response.status,
                    error: errorText,
                    duration
                });
                return {
                    success: false,
                    error: `Failed to search memories: ${response.status} ${response.statusText}`
                };
            }

            const results = await response.json() as any[];

            logger.info('Memory search completed', {
                query,
                userId,
                resultCount: results.length,
                duration
            });

            return {
                success: true,
                data: results.map((result: any) => ({
                    memory: result.document as Memory,
                    similarity: result.similarity || 0
                }))
            };
        } catch (error) {
            logger.error('Error searching memories in CBD:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Update a memory
     */
    async updateMemory(memoryId: string, userId: string, updates: Partial<Memory>): Promise<CBDResponse<Memory>> {
        if (!this.connected) {
            throw new Error('CBD service not connected');
        }

        try {
            const startTime = Date.now();

            const response = await fetch(`${this.baseUrl}/document/${memoryId}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    userId,
                    ...updates,
                    metadata: {
                        ...updates.metadata,
                        updatedAt: new Date().toISOString(),
                        version: (updates.metadata?.version || 0) + 1
                    }
                })
            });

            const duration = Date.now() - startTime;

            if (!response.ok) {
                const errorText = await response.text();
                logger.error('Failed to update memory in CBD', {
                    memoryId,
                    userId,
                    statusCode: response.status,
                    error: errorText,
                    duration
                });
                return {
                    success: false,
                    error: `Failed to update memory: ${response.status} ${response.statusText}`
                };
            }

            const result = await response.json();

            logger.info('Memory updated successfully in CBD', {
                memoryId,
                userId,
                duration
            });

            return {
                success: true,
                data: result as Memory
            };
        } catch (error) {
            logger.error('Error updating memory in CBD:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Delete a memory
     */
    async deleteMemory(memoryId: string, userId: string): Promise<CBDResponse<void>> {
        if (!this.connected) {
            throw new Error('CBD service not connected');
        }

        try {
            const startTime = Date.now();

            const response = await fetch(`${this.baseUrl}/document/${memoryId}`, {
                method: 'DELETE',
                headers: this.getHeaders(),
            });

            const duration = Date.now() - startTime;

            if (!response.ok) {
                const errorText = await response.text();
                logger.error('Failed to delete memory from CBD', {
                    memoryId,
                    userId,
                    statusCode: response.status,
                    error: errorText,
                    duration
                });
                return {
                    success: false,
                    error: `Failed to delete memory: ${response.status} ${response.statusText}`
                };
            }

            logger.info('Memory deleted successfully from CBD', {
                memoryId,
                userId,
                duration
            });

            return {
                success: true
            };
        } catch (error) {
            logger.error('Error deleting memory from CBD:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Get user's memory statistics
     */
    async getUserStats(userId: string): Promise<CBDResponse<{
        totalMemories: number;
        totalSize: number;
        lastActivity: string;
    }>> {
        if (!this.connected) {
            throw new Error('CBD service not connected');
        }

        try {
            const response = await fetch(`${this.baseUrl}/stats?userId=${userId}`, {
                method: 'GET',
                headers: this.getHeaders(),
            });

            if (!response.ok) {
                return {
                    success: false,
                    error: `Failed to get user stats: ${response.status} ${response.statusText}`
                };
            }

            const stats = await response.json() as {
                totalMemories: number;
                totalSize: number;
                lastActivity: string;
            };

            return {
                success: true,
                data: stats
            };
        } catch (error) {
            logger.error('Error getting user stats from CBD:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    private getHeaders(): Record<string, string> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'MemorAI-API/1.0.0'
        };

        if (this.apiKey) {
            headers['Authorization'] = `Bearer ${this.apiKey}`;
        }

        return headers;
    }

    public isConnected(): boolean {
        return this.connected;
    }
}

export const cbdService = new CBDService();
export default cbdService;
