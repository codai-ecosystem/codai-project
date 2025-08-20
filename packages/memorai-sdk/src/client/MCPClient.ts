/**
 * MemorAI MCP Client - JSON-RPC 2.0 Protocol Adapter
 * 
 * Specialized client for interacting with MemorAI MCP Server
 * Converts REST API calls to JSON-RPC 2.0 format
 * Date: August 7, 2025
 */

import axios, { AxiosInstance } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import {
    MemorAIConfig,
    Memory,
    CreateMemoryRequest,
    CreateMemoryResponse,
    SearchMemoriesRequest,
    SearchMemoriesResponse,
    MemorySearchResult,
    BulkDeleteRequest,
    BulkDeleteResponse,
    ListMemoriesRequest,
    ListMemoriesResponse,
    MemorAIStats,
    HealthCheckResponse
} from '../types/index.js';

interface JsonRpcRequest {
    jsonrpc: '2.0';
    method: string;
    params: any;
    id: string;
}

interface JsonRpcResponse {
    jsonrpc: '2.0';
    id: string;
    result?: any;
    error?: {
        code: number;
        message: string;
        data?: any;
    };
}

interface MCPToolCall {
    name: string;
    arguments: any;
}

export class MCPClient {
    private http: AxiosInstance;
    private config: Required<MemorAIConfig>;

    constructor(config: MemorAIConfig) {
        // Set default configuration for MCP
        this.config = {
            apiUrl: config.apiUrl || 'http://localhost:4950',
            apiKey: config.apiKey || 'memorai-dev-key-2025',
            cbdUrl: config.cbdUrl || 'http://localhost:4180',
            mcpUrl: config.mcpUrl || 'http://localhost:4950',
            timeout: config.timeout || 30000,
            maxRetries: config.maxRetries || 3,
            debug: config.debug || false,
            headers: config.headers || {}
        };

        // Initialize HTTP client for JSON-RPC
        this.http = axios.create({
            baseURL: this.config.mcpUrl,
            timeout: this.config.timeout,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.apiKey}`,
                'User-Agent': '@memorai/sdk-mcp@1.0.0',
                ...this.config.headers
            }
        });

        if (this.config.debug) {
            console.log('MemorAI MCP Client initialized', { config: this.config });
        }
    }

    /**
     * Send JSON-RPC 2.0 request to MCP server
     */
    private async sendJsonRpc(method: string, params?: any): Promise<JsonRpcResponse> {
        const request: JsonRpcRequest = {
            jsonrpc: '2.0',
            method,
            params: params || {},
            id: uuidv4()
        };

        if (this.config.debug) {
            console.log('MCP Request:', JSON.stringify(request, null, 2));
        }

        try {
            const response = await this.http.post('/', request);

            if (this.config.debug) {
                console.log('MCP Response:', JSON.stringify(response.data, null, 2));
            }

            return response.data as JsonRpcResponse;
        } catch (error) {
            if (this.config.debug) {
                console.error('MCP Error:', error);
            }
            throw error;
        }
    }

    /**
     * Send MCP tool call
     */
    private async sendToolCall(toolName: string, args: any): Promise<JsonRpcResponse> {
        return this.sendJsonRpc('tools/call', {
            name: toolName,
            arguments: args
        });
    }

    /**
     * Parse MCP text response to extract structured data
     */
    private parseTextResponse(text: string): any {
        // Parse structured data from MCP text responses
        const lines = text.split('\n');
        const result: any = {};

        for (const line of lines) {
            if (line.includes('ID: ')) {
                result.id = line.replace('ID: ', '').trim();
            }
            if (line.includes('Agent: ')) {
                result.agentId = line.replace('Agent: ', '').trim();
            }
            if (line.includes('Content: ')) {
                result.content = line.replace('Content: ', '').trim();
            }
            if (line.includes('Structured Key: ')) {
                result.structuredKey = line.replace('Structured Key: ', '').trim();
            }
        }

        return result;
    }

    /**
     * Create a new memory
     */
    async createMemory(request: CreateMemoryRequest): Promise<CreateMemoryResponse> {
        const response = await this.sendToolCall('remember', {
            agentId: request.agentId,
            content: request.content,
            metadata: request.metadata
        });

        if (response.error) {
            throw new Error(`MCP Error: ${response.error.message}`);
        }

        // Extract structured data from text response
        const textContent = response.result?.content?.[0]?.text || '';
        const memoryData = this.parseTextResponse(textContent);

        return {
            success: true,
            memory: {
                id: memoryData.id,
                content: memoryData.content,
                metadata: request.metadata || {},
                embeddings: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                tags: request.tags || [],
                priority: request.priority || 'medium',
                entityType: request.entityType || 'memory',
                agentId: memoryData.agentId
            },
            embeddingGenerated: false,
            timestamp: new Date()
        };
    }

    /**
     * Search memories using semantic search
     */
    async searchMemories(request: SearchMemoriesRequest): Promise<SearchMemoriesResponse> {
        const response = await this.sendToolCall('recall', {
            agentId: request.agentId,
            query: request.query,
            limit: request.limit || 10
        });

        if (response.error) {
            throw new Error(`MCP Error: ${response.error.message}`);
        }

        // Parse memories from text response
        const textContent = response.result?.content?.[0]?.text || '';
        const memories: MemorySearchResult[] = [];

        // Extract memory data from formatted text
        const sections = textContent.split(/\d+\. \*\*/).slice(1);

        for (const section of sections) {
            const lines = section.split('\n');
            const structuredKey = lines[0]?.split('**')[0]?.trim();
            const content = lines.find((l: string) => l.includes('Content:'))?.replace('   Content: ', '').trim();
            const project = lines.find((l: string) => l.includes('Project:'))?.replace('   Project: ', '').trim();
            const timestamp = lines.find((l: string) => l.includes('Created:'))?.replace('   Created: ', '').trim();

            if (structuredKey && content) {
                memories.push({
                    id: structuredKey.split('-').slice(-1)[0] || uuidv4(),
                    content,
                    metadata: { project: project !== 'N/A' ? project : undefined },
                    embeddings: [],
                    createdAt: timestamp ? new Date(timestamp) : new Date(),
                    updatedAt: timestamp ? new Date(timestamp) : new Date(),
                    tags: [],
                    priority: 'medium',
                    entityType: 'memory',
                    agentId: request.agentId || 'default',
                    similarityScore: 0.8,
                    rank: memories.length + 1
                });
            }
        }

        return {
            success: true,
            memories,
            totalFound: memories.length,
            queryTime: Date.now(),
            metrics: {
                embeddingTime: 0,
                searchTime: 0,
                memoriesScanned: memories.length,
                strategy: 'hybrid'
            },
            timestamp: new Date()
        };
    }

    /**
     * List memories for an agent
     */
    async listMemories(request: ListMemoriesRequest): Promise<ListMemoriesResponse> {
        const response = await this.sendToolCall('context', {
            agentId: request.agentId,
            contextSize: request.limit || 10
        });

        if (response.error) {
            throw new Error(`MCP Error: ${response.error.message}`);
        }

        // Parse memories from context response
        const textContent = response.result?.content?.[0]?.text || '';
        const memories: Memory[] = [];

        // Extract memory data from context format
        const lines = textContent.split('\n').filter((line: string) => line.match(/^\d+\./));

        for (const line of lines) {
            const match = line.match(/\[(.*?)\] (.*)/);
            if (match) {
                const [, timestamp, content] = match;
                memories.push({
                    id: uuidv4(),
                    content: content.replace(/\.{3}$/, ''), // Remove ellipsis
                    metadata: {},
                    embeddings: [],
                    createdAt: new Date(timestamp),
                    updatedAt: new Date(timestamp),
                    tags: [],
                    priority: 'medium',
                    entityType: 'memory',
                    agentId: request.agentId || 'default'
                });
            }
        }

        const page = request.page || 1;
        const limit = request.limit || 10;
        const total = memories.length;

        return {
            success: true,
            memories,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrevious: page > 1
            },
            timestamp: new Date()
        };
    }

    /**
     * Delete memories in bulk
     */
    async bulkDeleteMemories(request: BulkDeleteRequest): Promise<BulkDeleteResponse> {
        const deletedIds: string[] = [];

        if (request.ids) {
            for (const id of request.ids) {
                try {
                    const response = await this.sendToolCall('forget', {
                        agentId: 'default', // Use default agent
                        structuredKey: id
                    });

                    if (!response.error) {
                        deletedIds.push(id);
                    }
                } catch (error) {
                    // Continue with other deletions
                }
            }
        }

        return {
            success: true,
            deletedCount: deletedIds.length,
            deletedIds,
            timestamp: new Date()
        };
    }

    /**
     * Get memory statistics
     */
    async getStats(agentId: string): Promise<MemorAIStats> {
        // Use recall with broad query to get comprehensive statistics
        const response = await this.sendToolCall('recall', {
            agentId,
            query: '*', // Use wildcard or generic query
            limit: 1000 // Get large number for comprehensive stats
        });

        if (response.error) {
            throw new Error(`MCP Error: ${response.error.message}`);
        }

        const textContent = response.result?.content?.[0]?.text || '';

        // Parse comprehensive stats from recall response
        const foundMatch = textContent.match(/Found (\d+) memories/);
        const totalMemories = foundMatch ? parseInt(foundMatch[1]) : 0;

        // Extract individual memory data for analysis
        const memoryMatches = textContent.split(/\d+\. \*\*/).slice(1);

        // Analyze projects and importance
        const projectCounts: Record<string, number> = {};
        let totalImportance = 0;
        let importanceCount = 0;
        const entityTypes: Record<string, number> = {};
        const dailyCounts: Record<string, number> = {};

        memoryMatches.forEach((memory: string) => {
            // Extract project
            const projectMatch = memory.match(/Project:\s*([^\n]*)/);
            const project = projectMatch?.[1]?.trim() || 'N/A';

            if (project && project !== 'N/A') {
                projectCounts[project] = (projectCounts[project] || 0) + 1;
            }

            // Extract importance 
            const importanceMatch = memory.match(/Importance:\s*(\d+)/);
            if (importanceMatch?.[1]) {
                totalImportance += parseInt(importanceMatch[1]);
                importanceCount++;
            }

            // Extract creation date for trends
            const createdMatch = memory.match(/Created:\s*([^\n]*)/);
            if (createdMatch?.[1]) {
                try {
                    const date = new Date(createdMatch[1].trim()).toISOString().split('T')[0];
                    if (date) {
                        dailyCounts[date] = (dailyCounts[date] || 0) + 1;
                    }
                } catch (e) {
                    // Handle date parsing errors
                }
            }

            // Count entity types (assume 'memory' for MCP)
            entityTypes['memory'] = (entityTypes['memory'] || 0) + 1;
        });

        const avgImportance = importanceCount > 0 ? totalMemories / importanceCount : 5.0;

        // Format statistics
        return {
            totalMemories,
            storageSize: textContent.length * 2, // Rough estimate
            uniqueAgents: 1, // MCP is agent-specific
            averageMemorySize: textContent.length / Math.max(totalMemories, 1),
            commonEntityTypes: Object.entries(entityTypes).map(([entityType, count]) => ({
                entityType,
                count
            })),
            creationTrends: Object.entries(dailyCounts)
                .sort(([a], [b]) => a.localeCompare(b))
                .slice(-7) // Last 7 days
                .map(([date, count]) => ({
                    date,
                    count
                }))
        };
    }

    /**
     * Check health status
     */
    async healthCheck(): Promise<HealthCheckResponse> {
        try {
            const response = await this.http.get('/health');
            return {
                status: 'healthy',
                version: response.data.version,
                uptime: response.data.uptime || 0,
                database: {
                    status: response.data.cbdHealth ? 'connected' : 'disconnected',
                    responseTime: 0
                },
                vectorDb: {
                    status: response.data.azureOpenAI?.enabled ? 'connected' : 'disconnected',
                    responseTime: 0
                },
                performance: {
                    averageResponseTime: 0,
                    requestsPerSecond: 0,
                    errorRate: 0
                },
                timestamp: new Date()
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                version: 'unknown',
                uptime: 0,
                database: {
                    status: 'disconnected',
                    responseTime: 0
                },
                vectorDb: {
                    status: 'disconnected',
                    responseTime: 0
                },
                performance: {
                    averageResponseTime: 0,
                    requestsPerSecond: 0,
                    errorRate: 1
                },
                timestamp: new Date()
            };
        }
    }

    /**
     * Initialize MCP protocol
     */
    async initialize(): Promise<void> {
        try {
            await this.sendJsonRpc('initialize', {
                protocolVersion: '2025-06-18',
                capabilities: {
                    tools: { listChanged: true }
                }
            });

            await this.sendJsonRpc('notifications/initialized');

            if (this.config.debug) {
                console.log('MCP Client initialized successfully');
            }
        } catch (error) {
            if (this.config.debug) {
                console.error('MCP initialization failed:', error);
            }
            throw error;
        }
    }
}
