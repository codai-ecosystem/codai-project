/**
 * API Client for CODAI Services
 * Universal client for service-to-service communication
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { CodaiApiResponse, CODAI_SERVICES, getServiceUrl } from './standards';

export interface CodaiClientConfig {
    baseURL?: string;
    timeout?: number;
    retries?: number;
    apiKey?: string;
    jwt?: string;
    serviceName?: string;
}

export class CodaiApiClient {
    private client: AxiosInstance;
    private config: CodaiClientConfig;

    constructor(config: CodaiClientConfig = {}) {
        this.config = {
            timeout: 10000,
            retries: 3,
            ...config,
        };

        this.client = axios.create({
            baseURL: config.baseURL,
            timeout: this.config.timeout,
            headers: {
                'Content-Type': 'application/json',
                'X-Client-Name': 'codai-api-client',
                'X-Client-Version': '1.0.0',
                ...(config.apiKey && { 'X-API-Key': config.apiKey }),
                ...(config.jwt && { Authorization: `Bearer ${config.jwt}` }),
                ...(config.serviceName && { 'X-Service-Name': config.serviceName }),
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors() {
        // Request interceptor
        this.client.interceptors.request.use(
            (config) => {
                // Add request ID for tracing
                config.headers['X-Request-ID'] = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor
        this.client.interceptors.response.use(
            (response) => response,
            async (error) => {
                const config = error.config;

                // Retry logic
                if (config && config.retries > 0 && this.shouldRetry(error)) {
                    config.retries -= 1;
                    await this.delay(this.getRetryDelay(config.retries));
                    return this.client(config);
                }

                return Promise.reject(error);
            }
        );
    }

    private shouldRetry(error: any): boolean {
        // Retry on network errors or 5xx status codes
        return !error.response || (error.response.status >= 500 && error.response.status < 600);
    }

    private getRetryDelay(retriesLeft: number): number {
        // Exponential backoff: 1s, 2s, 4s
        const maxDelay = 4000;
        const delay = Math.min(1000 * Math.pow(2, 3 - retriesLeft), maxDelay);
        return delay;
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Generic request method
     */
    async request<T = any>(config: AxiosRequestConfig): Promise<CodaiApiResponse<T>> {
        try {
            const response: AxiosResponse<CodaiApiResponse<T>> = await this.client(config);
            return response.data;
        } catch (error: any) {
            if (error.response?.data) {
                return error.response.data;
            }

            // Network or other errors
            return {
                success: false,
                error: {
                    code: 'NETWORK_ERROR',
                    message: error.message || 'Request failed',
                    details: error,
                },
                timestamp: new Date().toISOString(),
            };
        }
    }

    /**
     * GET request
     */
    async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<CodaiApiResponse<T>> {
        return this.request<T>({ ...config, method: 'GET', url });
    }

    /**
     * POST request
     */
    async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<CodaiApiResponse<T>> {
        return this.request<T>({ ...config, method: 'POST', url, data });
    }

    /**
     * PUT request
     */
    async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<CodaiApiResponse<T>> {
        return this.request<T>({ ...config, method: 'PUT', url, data });
    }

    /**
     * PATCH request
     */
    async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<CodaiApiResponse<T>> {
        return this.request<T>({ ...config, method: 'PATCH', url, data });
    }

    /**
     * DELETE request
     */
    async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<CodaiApiResponse<T>> {
        return this.request<T>({ ...config, method: 'DELETE', url });
    }

    /**
     * Health check
     */
    async healthCheck(): Promise<CodaiApiResponse> {
        return this.get('/health');
    }

    /**
     * Ready check
     */
    async readyCheck(): Promise<CodaiApiResponse> {
        return this.get('/ready');
    }
}

/**
 * Service-specific client factory
 */
export class CodaiServiceClient {
    private clients: Map<string, CodaiApiClient> = new Map();

    constructor(private config: Partial<CodaiClientConfig> = {}) { }

    /**
     * Get client for a specific service
     */
    getClient(serviceName: keyof typeof CODAI_SERVICES): CodaiApiClient {
        if (!this.clients.has(serviceName)) {
            const service = CODAI_SERVICES[serviceName];
            const baseURL = `http://localhost:${service.port}${service.baseUrl}`;

            const client = new CodaiApiClient({
                ...this.config,
                baseURL,
                serviceName: service.name,
            });

            this.clients.set(serviceName, client);
        }

        return this.clients.get(serviceName)!;
    }

    /**
     * Call a specific service endpoint
     */
    async call<T = any>(
        serviceName: keyof typeof CODAI_SERVICES,
        method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
        endpoint: string,
        data?: any,
        config?: AxiosRequestConfig
    ): Promise<CodaiApiResponse<T>> {
        const client = this.getClient(serviceName);

        switch (method) {
            case 'GET':
                return client.get<T>(endpoint, config);
            case 'POST':
                return client.post<T>(endpoint, data, config);
            case 'PUT':
                return client.put<T>(endpoint, data, config);
            case 'PATCH':
                return client.patch<T>(endpoint, data, config);
            case 'DELETE':
                return client.delete<T>(endpoint, config);
            default:
                throw new Error(`Unsupported HTTP method: ${method}`);
        }
    }

    /**
     * Health check for all services
     */
    async healthCheckAll(): Promise<Record<string, CodaiApiResponse>> {
        const results: Record<string, CodaiApiResponse> = {};

        const promises = Object.keys(CODAI_SERVICES).map(async (serviceName) => {
            try {
                const client = this.getClient(serviceName as keyof typeof CODAI_SERVICES);
                const result = await client.healthCheck();
                results[serviceName] = result;
            } catch (error: any) {
                results[serviceName] = {
                    success: false,
                    error: {
                        code: 'HEALTH_CHECK_FAILED',
                        message: `Health check failed for ${serviceName}`,
                        details: error.message,
                    },
                    timestamp: new Date().toISOString(),
                };
            }
        });

        await Promise.all(promises);
        return results;
    }
}

// Global service client instance
export const codaiServices = new CodaiServiceClient();

// Convenience methods for specific services
export const idService = codaiServices.getClient('ID');
export const memoraiService = codaiServices.getClient('MEMORAI');
export const hubService = codaiServices.getClient('HUB');
export const logaiService = codaiServices.getClient('LOGAI');
export const adminService = codaiServices.getClient('ADMIN');
export const codaiService = codaiServices.getClient('CODAI');
export const bancaiService = codaiServices.getClient('BANCAI');
