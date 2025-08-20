/**
 * MemorAI SDK - Main Client
 * 
 * Primary client class for interacting with MemorAI API
 * Provides full CRUD operations for AI memory management
 * Supports both HTTP REST API and MCP JSON-RPC protocol
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';
import { MCPClient } from './MCPClient.js';
import {
    MemorAIConfig,
    Memory,
    CreateMemoryRequest,
    CreateMemoryResponse,
    SearchMemoriesRequest,
    SearchMemoriesResponse,
    UpdateMemoryRequest,
    UpdateMemoryResponse,
    DeleteMemoryRequest,
    DeleteMemoryResponse,
    BulkDeleteRequest,
    BulkDeleteResponse,
    GetMemoryRequest,
    GetMemoryResponse,
    ListMemoriesRequest,
    ListMemoriesResponse,
    MemorAIStats,
    HealthCheckResponse,
    ApiResponse,
    MemorAIError,
    SubscriptionOptions,
    MemoryNotification,
    WebSocketMessage
} from '../types/index.js';
import { WebSocketService } from '../services/websocket.js';
import { RetryService } from '../services/retry.js';
import { ValidationService } from '../services/validation.js';

export class MemorAIClient extends EventEmitter {
    private http: AxiosInstance;
    private wsService?: WebSocketService | null;
    private retryService: RetryService;
    private validationService: ValidationService;
    private mcpClient: MCPClient | null = null;
    private config: Required<MemorAIConfig>;

    constructor(config: MemorAIConfig) {
        super();

        // Set default configuration
        this.config = {
            apiUrl: config.apiUrl,
            apiKey: config.apiKey,
            cbdUrl: config.cbdUrl || `${config.apiUrl.replace('/api', '')}/cbd`,
            mcpUrl: config.mcpUrl || `${config.apiUrl.replace('/api', '')}/mcp`,
            timeout: config.timeout || 30000,
            maxRetries: config.maxRetries || 3,
            debug: config.debug || false,
            headers: config.headers || {}
        };

        // Initialize HTTP client
        this.http = axios.create({
            baseURL: this.config.apiUrl,
            timeout: this.config.timeout,
            headers: {
                'Authorization': `Bearer ${this.config.apiKey}`,
                'Content-Type': 'application/json',
                'User-Agent': '@memorai/sdk@1.0.0',
                ...this.config.headers
            }
        });

        // Initialize services
        this.retryService = new RetryService(this.config.maxRetries);
        this.validationService = new ValidationService();

        // Add request/response interceptors
        this.setupInterceptors();

        if (this.config.debug) {
            console.log('MemorAI SDK initialized', { config: this.config });
        }
    }

    /**
     * Setup HTTP interceptors for request/response handling
     */
    private setupInterceptors(): void {
        // Request interceptor
        this.http.interceptors.request.use(
            (config) => {
                const requestId = uuidv4();
                config.headers['X-Request-ID'] = requestId;

                if (this.config.debug) {
                    console.log('MemorAI Request:', {
                        method: config.method,
                        url: config.url,
                        requestId,
                        data: config.data
                    });
                }

                return config;
            },
            (error) => {
                if (this.config.debug) {
                    console.error('MemorAI Request Error:', error);
                }
                return Promise.reject(error);
            }
        );

        // Response interceptor
        this.http.interceptors.response.use(
            (response) => {
                if (this.config.debug) {
                    console.log('MemorAI Response:', {
                        status: response.status,
                        requestId: response.headers['x-request-id'],
                        data: response.data
                    });
                }
                return response;
            },
            (error) => {
                if (this.config.debug) {
                    console.error('MemorAI Response Error:', {
                        status: error.response?.status,
                        message: error.message,
                        data: error.response?.data
                    });
                }
                return Promise.reject(this.formatError(error));
            }
        );
    }

    /**
     * Enable MCP protocol mode for communication
     */
    async enableMCPMode(): Promise<void> {
        if (!this.mcpClient) {
            this.mcpClient = new MCPClient(this.config);
            await this.mcpClient.initialize();

            if (this.config.debug) {
                console.log('MCP Client enabled and initialized');
            }
        }
    }

    /**
     * Check if MCP mode is enabled
     */
    get isMCPMode(): boolean {
        return this.mcpClient !== null;
    }

    /**
     * Auto-detect if MCP server is available and enable MCP mode
     */
    async autoDetectMCP(): Promise<boolean> {
        try {
            const mcpClient = new MCPClient(this.config);
            const health = await mcpClient.healthCheck();

            if (health.status === 'healthy') {
                this.mcpClient = mcpClient;
                await this.mcpClient.initialize();

                if (this.config.debug) {
                    console.log('MCP Server detected and enabled');
                }
                return true;
            }
        } catch (error) {
            if (this.config.debug) {
                console.log('MCP Server not available, using HTTP API');
            }
        }
        return false;
    }

    /**
     * Format API errors into standardized MemorAIError
     */
    private formatError(error: any): MemorAIError {
        return {
            code: error.response?.data?.error?.code || 'UNKNOWN_ERROR',
            message: error.response?.data?.error?.message || error.message || 'An unknown error occurred',
            details: error.response?.data?.error?.details || {},
            requestId: error.response?.headers?.['x-request-id'],
            timestamp: new Date()
        };
    }

    /**
     * Create a new memory
     */
    async createMemory(request: CreateMemoryRequest): Promise<CreateMemoryResponse> {
        this.validationService.validateCreateMemoryRequest(request);

        // Use MCP client if available
        if (this.mcpClient) {
            return this.mcpClient.createMemory(request);
        }

        return this.retryService.executeWithRetry(async () => {
            const response = await this.http.post<ApiResponse<CreateMemoryResponse>>('/memories', request);
            return response.data.data!;
        });
    }

    /**
     * Search memories using semantic search
     */
    async searchMemories(request: SearchMemoriesRequest): Promise<SearchMemoriesResponse> {
        this.validationService.validateSearchMemoriesRequest(request);

        // Use MCP client if available
        if (this.mcpClient) {
            return this.mcpClient.searchMemories(request);
        }

        return this.retryService.executeWithRetry(async () => {
            const response = await this.http.post<ApiResponse<SearchMemoriesResponse>>('/memories/search', request);
            return response.data.data!;
        });
    }

    /**
     * Get a specific memory by ID
     */
    async getMemory(request: GetMemoryRequest): Promise<GetMemoryResponse> {
        this.validationService.validateGetMemoryRequest(request);

        return this.retryService.executeWithRetry(async () => {
            const { id, ...params } = request;
            const response = await this.http.get<ApiResponse<GetMemoryResponse>>(`/memories/${id}`, { params });
            return response.data.data!;
        });
    }

    /**
     * List memories with pagination and filtering
     */
    async listMemories(request: ListMemoriesRequest = {}): Promise<ListMemoriesResponse> {
        // Use MCP client if available
        if (this.mcpClient) {
            return this.mcpClient.listMemories(request);
        }

        return this.retryService.executeWithRetry(async () => {
            const response = await this.http.get<ApiResponse<ListMemoriesResponse>>('/memories', { params: request });
            return response.data.data!;
        });
    }

    /**
     * Update an existing memory
     */
    async updateMemory(request: UpdateMemoryRequest): Promise<UpdateMemoryResponse> {
        this.validationService.validateUpdateMemoryRequest(request);

        return this.retryService.executeWithRetry(async () => {
            const { id, ...data } = request;
            const response = await this.http.put<ApiResponse<UpdateMemoryResponse>>(`/memories/${id}`, data);
            return response.data.data!;
        });
    }

    /**
     * Delete a memory
     */
    async deleteMemory(request: DeleteMemoryRequest): Promise<DeleteMemoryResponse> {
        this.validationService.validateDeleteMemoryRequest(request);

        return this.retryService.executeWithRetry(async () => {
            const { id, reason } = request;
            const response = await this.http.delete<ApiResponse<DeleteMemoryResponse>>(`/memories/${id}`, {
                data: { reason }
            });
            return response.data.data!;
        });
    }

    /**
     * Bulk delete memories
     */
    async bulkDeleteMemories(request: BulkDeleteRequest): Promise<BulkDeleteResponse> {
        this.validationService.validateBulkDeleteRequest(request);

        return this.retryService.executeWithRetry(async () => {
            const response = await this.http.post<ApiResponse<BulkDeleteResponse>>('/memories/bulk-delete', request);
            return response.data.data!;
        });
    }

    /**
     * Bulk create memories
     */
    async bulkCreateMemories(requests: CreateMemoryRequest[]): Promise<CreateMemoryResponse[]> {
        const responses: CreateMemoryResponse[] = [];

        for (const request of requests) {
            try {
                const response = await this.createMemory(request);
                responses.push(response);
            } catch (error) {
                // Log error but continue with other memories
                if (this.config.debug) {
                    console.error('Failed to create memory:', error);
                }
                // You might want to collect errors and return them
                throw error; // Or handle differently based on requirements
            }
        }

        return responses;
    }

    /**
     * Get MemorAI service statistics
     */
    async getStats(agentId?: string): Promise<MemorAIStats> {
        // Use MCP client if available
        if (this.mcpClient) {
            return this.mcpClient.getStats(agentId || 'default');
        }

        return this.retryService.executeWithRetry(async () => {
            const response = await this.http.get<ApiResponse<MemorAIStats>>('/stats');
            return response.data.data!;
        });
    }

    /**
     * Health check for MemorAI service
     */
    async healthCheck(): Promise<HealthCheckResponse> {
        return this.retryService.executeWithRetry(async () => {
            const response = await this.http.get<ApiResponse<HealthCheckResponse>>('/health');
            return response.data.data!;
        });
    }

    /**
     * Subscribe to real-time memory events
     */
    async subscribe(options: SubscriptionOptions = {}): Promise<void> {
        if (!this.wsService) {
            const wsUrl = this.config.apiUrl.replace('http', 'ws').replace('/api', '/ws');
            this.wsService = new WebSocketService(wsUrl, this.config.apiKey);

            this.wsService.on('notification', (notification: MemoryNotification) => {
                this.emit('memoryEvent', notification);
            });

            this.wsService.on('error', (error: MemorAIError) => {
                this.emit('error', error);
            });
        }

        await this.wsService.connect();
        await this.wsService.subscribe(options);
    }

    /**
     * Unsubscribe from real-time events
     */
    async unsubscribe(): Promise<void> {
        if (this.wsService) {
            await this.wsService.unsubscribe();
        }
    }

    /**
     * Disconnect from WebSocket
     */
    async disconnect(): Promise<void> {
        if (this.wsService) {
            await this.wsService.disconnect();
            this.wsService = null;
        }
    }

    /**
     * Test connection to MemorAI API
     */
    async testConnection(): Promise<boolean> {
        try {
            await this.healthCheck();
            return true;
        } catch (error) {
            if (this.config.debug) {
                console.error('Connection test failed:', error);
            }
            return false;
        }
    }

    /**
     * Get current configuration
     */
    getConfig(): Readonly<MemorAIConfig> {
        return Object.freeze({ ...this.config });
    }

    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<MemorAIConfig>): void {
        this.config = { ...this.config, ...newConfig };

        // Update HTTP client headers if API key changed
        if (newConfig.apiKey) {
            this.http.defaults.headers['Authorization'] = `Bearer ${newConfig.apiKey}`;
        }

        // Update other HTTP client settings
        if (newConfig.timeout) {
            this.http.defaults.timeout = newConfig.timeout;
        }

        if (newConfig.headers) {
            this.http.defaults.headers = { ...this.http.defaults.headers, ...newConfig.headers };
        }
    }
}

// Convenience factory function
export function createMemorAIClient(config: MemorAIConfig): MemorAIClient {
    return new MemorAIClient(config);
}

export default MemorAIClient;
