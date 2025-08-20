/**
 * Database Manager
 * CBD Database Integration with Connection Pooling
 * Date: August 6, 2025
 */

import { Memory, APIResponse, HealthStatus } from './types.js';
import { config } from './config-manager.js';
import { Logger } from '../utils/logger.js';

export interface CBDResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    timestamp?: string;
}

export interface CBDMemory {
    id: string;
    agentId: string;
    content: string;
    metadata: any;
    structuredKey: string;
    timestamp: string;
}

export class DatabaseManager {
    private static instance: DatabaseManager;
    private baseUrl: string;
    private connectionPool: number;
    private timeout: number;
    private logger: Logger;

    private constructor() {
        const dbConfig = config.getConfig().database;
        this.baseUrl = dbConfig.cbdUrl;
        this.connectionPool = dbConfig.connectionPool;
        this.timeout = dbConfig.timeout;
        this.logger = new Logger('DatabaseManager');
    }

    public static getInstance(): DatabaseManager {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }

    /**
     * Check if CBD database is running and healthy
     */
    public async isHealthy(): Promise<boolean> {
        try {
            const response = await this.makeRequest('/health', { method: 'GET' });
            return response.ok;
        } catch (error) {
            this.logger.error('Database health check failed:', error);
            return false;
        }
    }

    /**
     * Get database health status with detailed information
     */
    public async getHealthStatus(): Promise<HealthStatus | null> {
        try {
            const response = await this.makeRequest('/health', { method: 'GET' });

            if (response.ok) {
                const healthData = await response.json();
                return {
                    status: 'healthy',
                    service: 'CBD Database',
                    version: healthData.version || '1.0.0',
                    timestamp: new Date(),
                    checks: {
                        database: true,
                        cache: true,
                        ai: false, // Will be updated by AI services
                        memory: true
                    },
                    metrics: {
                        responseTime: 0, // Will be calculated
                        memoryUsage: 0,
                        cpuUsage: 0,
                        queryCount: 0,
                        cacheHitRate: 0,
                        errorRate: 0,
                        activeConnections: 0
                    }
                };
            }
            return null;
        } catch (error) {
            this.logger.error('Failed to get health status:', error);
            return null;
        }
    }

    /**
     * Store a memory in the database
     */
    public async storeMemory(memory: Omit<Memory, 'id' | 'structuredKey' | 'timestamp'>): Promise<APIResponse<Memory>> {
        try {
            const startTime = Date.now();

            const requestBody = {
                agentId: memory.agentId,
                content: memory.content,
                metadata: memory.metadata
            };

            const response = await this.makeRequest('/memory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const processingTime = Date.now() - startTime;

            if (response.ok) {
                const cbdResponse: CBDResponse<CBDMemory> = await response.json();

                if (cbdResponse.success && cbdResponse.data) {
                    const storedMemory: Memory = {
                        id: cbdResponse.data.id,
                        agentId: cbdResponse.data.agentId,
                        content: cbdResponse.data.content,
                        metadata: cbdResponse.data.metadata,
                        structuredKey: cbdResponse.data.structuredKey,
                        timestamp: new Date(cbdResponse.data.timestamp),
                        embeddings: memory.embeddings
                    };

                    this.logger.info(`Memory stored successfully: ${storedMemory.id}`);

                    return {
                        success: true,
                        data: storedMemory,
                        metadata: {
                            timestamp: new Date(),
                            requestId: this.generateRequestId(),
                            processingTime
                        }
                    };
                }
            }

            const errorText = await response.text();
            this.logger.error('Failed to store memory:', errorText);

            return {
                success: false,
                error: {
                    code: 'STORAGE_FAILED',
                    message: `Failed to store memory: ${errorText}`,
                    timestamp: new Date()
                }
            };
        } catch (error) {
            this.logger.error('Database storage error:', error);
            return {
                success: false,
                error: {
                    code: 'DATABASE_ERROR',
                    message: error instanceof Error ? error.message : 'Unknown database error',
                    timestamp: new Date()
                }
            };
        }
    }

    /**
     * Search memories in the database
     */
    public async searchMemories(query: string, agentId: string, limit?: number): Promise<APIResponse<Memory[]>> {
        try {
            const startTime = Date.now();

            const searchParams = new URLSearchParams({
                query,
                agentId,
                ...(limit && { limit: limit.toString() })
            });

            const response = await this.makeRequest(`/memory/search?${searchParams}`, {
                method: 'GET'
            });

            const processingTime = Date.now() - startTime;

            if (response.ok) {
                const cbdResponse: CBDResponse<CBDMemory[]> = await response.json();

                if (cbdResponse.success && cbdResponse.data) {
                    const memories: Memory[] = cbdResponse.data.map(cbdMemory => ({
                        id: cbdMemory.id,
                        agentId: cbdMemory.agentId,
                        content: cbdMemory.content,
                        metadata: cbdMemory.metadata,
                        structuredKey: cbdMemory.structuredKey,
                        timestamp: new Date(cbdMemory.timestamp)
                    }));

                    this.logger.debug(`Found ${memories.length} memories for query: ${query}`);

                    return {
                        success: true,
                        data: memories,
                        metadata: {
                            timestamp: new Date(),
                            requestId: this.generateRequestId(),
                            processingTime
                        }
                    };
                }
            }

            const errorText = await response.text();
            this.logger.error('Memory search failed:', errorText);

            return {
                success: false,
                error: {
                    code: 'SEARCH_FAILED',
                    message: `Memory search failed: ${errorText}`,
                    timestamp: new Date()
                }
            };
        } catch (error) {
            this.logger.error('Database search error:', error);
            return {
                success: false,
                error: {
                    code: 'DATABASE_ERROR',
                    message: error instanceof Error ? error.message : 'Unknown database error',
                    timestamp: new Date()
                }
            };
        }
    }

    /**
     * Get memory by ID
     */
    public async getMemoryById(id: string, agentId: string): Promise<APIResponse<Memory>> {
        try {
            const response = await this.makeRequest(`/memory/${id}?agentId=${agentId}`, {
                method: 'GET'
            });

            if (response.ok) {
                const cbdResponse: CBDResponse<CBDMemory> = await response.json();

                if (cbdResponse.success && cbdResponse.data) {
                    const memory: Memory = {
                        id: cbdResponse.data.id,
                        agentId: cbdResponse.data.agentId,
                        content: cbdResponse.data.content,
                        metadata: cbdResponse.data.metadata,
                        structuredKey: cbdResponse.data.structuredKey,
                        timestamp: new Date(cbdResponse.data.timestamp)
                    };

                    return {
                        success: true,
                        data: memory,
                        metadata: {
                            timestamp: new Date(),
                            requestId: this.generateRequestId(),
                            processingTime: 0
                        }
                    };
                }
            }

            return {
                success: false,
                error: {
                    code: 'MEMORY_NOT_FOUND',
                    message: `Memory not found: ${id}`,
                    timestamp: new Date()
                }
            };
        } catch (error) {
            this.logger.error('Database get memory error:', error);
            return {
                success: false,
                error: {
                    code: 'DATABASE_ERROR',
                    message: error instanceof Error ? error.message : 'Unknown database error',
                    timestamp: new Date()
                }
            };
        }
    }

    /**
     * Delete memory by structured key
     */
    public async deleteMemory(structuredKey: string, agentId: string): Promise<APIResponse<boolean>> {
        try {
            const response = await this.makeRequest('/memory', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ structuredKey, agentId })
            });

            if (response.ok) {
                const cbdResponse: CBDResponse = await response.json();

                if (cbdResponse.success) {
                    this.logger.info(`Memory deleted: ${structuredKey}`);
                    return {
                        success: true,
                        data: true,
                        metadata: {
                            timestamp: new Date(),
                            requestId: this.generateRequestId(),
                            processingTime: 0
                        }
                    };
                }
            }

            const errorText = await response.text();
            this.logger.error('Failed to delete memory:', errorText);

            return {
                success: false,
                error: {
                    code: 'DELETE_FAILED',
                    message: `Failed to delete memory: ${errorText}`,
                    timestamp: new Date()
                }
            };
        } catch (error) {
            this.logger.error('Database delete error:', error);
            return {
                success: false,
                error: {
                    code: 'DATABASE_ERROR',
                    message: error instanceof Error ? error.message : 'Unknown database error',
                    timestamp: new Date()
                }
            };
        }
    }

    /**
     * Get recent context for agent
     */
    public async getContext(agentId: string, contextSize: number = 5): Promise<APIResponse<Memory[]>> {
        try {
            const response = await this.makeRequest(`/memory/context?agentId=${agentId}&contextSize=${contextSize}`, {
                method: 'GET'
            });

            if (response.ok) {
                const cbdResponse: CBDResponse<CBDMemory[]> = await response.json();

                if (cbdResponse.success && cbdResponse.data) {
                    const memories: Memory[] = cbdResponse.data.map(cbdMemory => ({
                        id: cbdMemory.id,
                        agentId: cbdMemory.agentId,
                        content: cbdMemory.content,
                        metadata: cbdMemory.metadata,
                        structuredKey: cbdMemory.structuredKey,
                        timestamp: new Date(cbdMemory.timestamp)
                    }));

                    return {
                        success: true,
                        data: memories,
                        metadata: {
                            timestamp: new Date(),
                            requestId: this.generateRequestId(),
                            processingTime: 0
                        }
                    };
                }
            }

            return {
                success: false,
                error: {
                    code: 'CONTEXT_FAILED',
                    message: 'Failed to retrieve context',
                    timestamp: new Date()
                }
            };
        } catch (error) {
            this.logger.error('Database context error:', error);
            return {
                success: false,
                error: {
                    code: 'DATABASE_ERROR',
                    message: error instanceof Error ? error.message : 'Unknown database error',
                    timestamp: new Date()
                }
            };
        }
    }

    /**
     * Make HTTP request to CBD database
     */
    private async makeRequest(endpoint: string, options: RequestInit): Promise<Response> {
        const url = `${this.baseUrl}${endpoint}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const requestOptions: RequestInit = {
            ...options,
            signal: controller.signal
        };

        try {
            this.logger.debug(`Making request to: ${url}`);
            const response = await fetch(url, requestOptions);
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    /**
     * Generate unique request ID for tracking
     */
    private generateRequestId(): string {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

// Singleton instance
export const database = DatabaseManager.getInstance();
