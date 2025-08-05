/**
 * MemorAI Node.js Client Library
 * Official Node.js/JavaScript client for the MemorAI platform
 */

const axios = require('axios');
const EventEmitter = require('events');
const WebSocket = require('ws');

class MemorAIClient extends EventEmitter {
    constructor(options = {}) {
        super();

        this.config = {
            baseURL: options.baseURL || 'http://localhost:4006',
            apiKey: options.apiKey || null,
            timeout: options.timeout || 30000,
            retries: options.retries || 3,
            enableWebSocket: options.enableWebSocket || false,
            debug: options.debug || false,
            ...options
        };

        // Create axios instance
        this.http = axios.create({
            baseURL: this.config.baseURL,
            timeout: this.config.timeout,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'MemorAI-NodeJS-Client/1.0.0'
            }
        });

        // Add auth header if API key provided
        if (this.config.apiKey) {
            this.http.defaults.headers.common['Authorization'] = `Bearer ${this.config.apiKey}`;
        }

        // Add request/response interceptors
        this.setupInterceptors();

        // WebSocket connection
        this.ws = null;
        this.wsReconnectAttempts = 0;
        this.maxReconnectAttempts = 5;

        // Performance tracking
        this.performanceMetrics = [];

        if (this.config.enableWebSocket) {
            this.connectWebSocket();
        }
    }

    setupInterceptors() {
        // Request interceptor
        this.http.interceptors.request.use(
            (config) => {
                config.metadata = { startTime: Date.now() };
                if (this.config.debug) {
                    console.log(`[MemorAI] ${config.method?.toUpperCase()} ${config.url}`);
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor
        this.http.interceptors.response.use(
            (response) => {
                const duration = Date.now() - response.config.metadata.startTime;
                this.trackPerformance(response.config, duration, response.status);

                if (this.config.debug) {
                    console.log(`[MemorAI] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`);
                }

                return response;
            },
            (error) => {
                if (error.response) {
                    const duration = Date.now() - error.config.metadata.startTime;
                    this.trackPerformance(error.config, duration, error.response.status);

                    // Handle rate limiting
                    if (error.response.status === 429) {
                        this.emit('rateLimitHit', {
                            retryAfter: error.response.headers['retry-after'],
                            limit: error.response.headers['x-ratelimit-limit'],
                            remaining: error.response.headers['x-ratelimit-remaining']
                        });
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    trackPerformance(config, duration, statusCode) {
        const metric = {
            method: config.method?.toUpperCase(),
            url: config.url,
            duration,
            statusCode,
            timestamp: new Date()
        };

        this.performanceMetrics.push(metric);

        // Keep only last 100 metrics
        if (this.performanceMetrics.length > 100) {
            this.performanceMetrics = this.performanceMetrics.slice(-100);
        }
    }

    connectWebSocket() {
        const wsUrl = this.config.baseURL.replace(/^http/, 'ws') + '/ws';

        try {
            this.ws = new WebSocket(wsUrl);

            this.ws.on('open', () => {
                if (this.config.debug) {
                    console.log('[MemorAI] WebSocket connected');
                }
                this.wsReconnectAttempts = 0;
                this.emit('connected');
            });

            this.ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    this.emit(message.type, message.data);

                    if (this.config.debug) {
                        console.log('[MemorAI] WebSocket message:', message.type);
                    }
                } catch (error) {
                    console.error('[MemorAI] WebSocket message parse error:', error);
                }
            });

            this.ws.on('close', (code, reason) => {
                if (this.config.debug) {
                    console.log(`[MemorAI] WebSocket closed: ${code} ${reason}`);
                }
                this.emit('disconnected', { code, reason });

                // Attempt reconnection
                if (this.wsReconnectAttempts < this.maxReconnectAttempts) {
                    setTimeout(() => {
                        this.wsReconnectAttempts++;
                        this.connectWebSocket();
                    }, Math.pow(2, this.wsReconnectAttempts) * 1000);
                }
            });

            this.ws.on('error', (error) => {
                console.error('[MemorAI] WebSocket error:', error);
                this.emit('error', error);
            });

        } catch (error) {
            console.error('[MemorAI] WebSocket connection failed:', error);
        }
    }

    // Memory operations
    async createMemory(data) {
        const response = await this.http.post('/api/memories', data);
        return response.data;
    }

    async getMemory(id) {
        const response = await this.http.get(`/api/memories/${id}`);
        return response.data;
    }

    async updateMemory(id, updates) {
        const response = await this.http.put(`/api/memories/${id}`, updates);
        return response.data;
    }

    async deleteMemory(id) {
        const response = await this.http.delete(`/api/memories/${id}`);
        return response.data;
    }

    async listMemories(options = {}) {
        const params = {
            limit: options.limit || 20,
            offset: options.offset || 0,
            category: options.category,
            tags: options.tags?.join(',')
        };

        const response = await this.http.get('/api/memories', { params });
        return response.data;
    }

    // Search operations
    async searchMemories(query, options = {}) {
        const data = {
            query,
            algorithm: options.algorithm || 'semantic',
            limit: options.limit || 20,
            threshold: options.threshold,
            sortBy: options.sortBy,
            ...options
        };

        const response = await this.http.post('/api/search', data);
        return response.data;
    }

    async findSimilarMemories(memoryId, limit = 10) {
        const response = await this.http.get(`/api/memories/${memoryId}/similar`, {
            params: { limit }
        });
        return response.data;
    }

    // Analytics operations
    async getAnalytics() {
        const response = await this.http.get('/api/analytics');
        return response.data;
    }

    async getMemoryAnalytics() {
        const response = await this.http.get('/api/analytics/memories');
        return response.data;
    }

    async getSearchAnalytics() {
        const response = await this.http.get('/api/analytics/search');
        return response.data;
    }

    // System operations  
    async getHealth() {
        const response = await this.http.get('/api/health');
        return response.data;
    }

    async getVersion() {
        const response = await this.http.get('/api/version');
        return response.data;
    }

    async getSystemStats() {
        const response = await this.http.get('/api/stats');
        return response.data;
    }

    // Batch operations
    async batchOperations(operations) {
        const response = await this.http.post('/api/memories/batch', { operations });
        return response.data;
    }

    // Utility methods
    getPerformanceMetrics() {
        return [...this.performanceMetrics];
    }

    clearPerformanceMetrics() {
        this.performanceMetrics = [];
    }

    getRateLimitInfo() {
        return this.rateLimitInfo;
    }

    // Cleanup
    close() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.removeAllListeners();
    }
}

module.exports = MemorAIClient;
