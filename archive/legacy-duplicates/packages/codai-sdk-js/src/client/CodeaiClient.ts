/**
 * Main CODAI Client
 * Central client for accessing all CODAI services
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { CodeaiConfig, DEFAULT_CONFIG, createConfig } from '../config/config';
import { CodeaiError, createErrorFromResponse, NetworkError, TimeoutError } from '../utils/errors';
import { AdminService } from '../services/AdminService';
import { IdService } from '../services/IdService';
import { HubService } from '../services/HubService';
import { CbdService } from '../services/CbdService';
import { GatewayService } from '../services/GatewayService';
import { AuthToken, AuthSession } from '../types/auth';

export class CodeaiClient {
    private readonly config: CodeaiConfig;
    private readonly httpClient: AxiosInstance;
    private authToken?: string;
    private currentSession?: AuthSession;

    // Service instances
    public readonly admin: AdminService;
    public readonly id: IdService;
    public readonly hub: HubService;
    public readonly cbd: CbdService;
    public readonly gateway: GatewayService;

    constructor(config: Partial<CodeaiConfig> = {}) {
        this.config = createConfig(config);
        this.httpClient = this.createHttpClient();

        // Initialize services
        this.admin = new AdminService(this);
        this.id = new IdService(this);
        this.hub = new HubService(this);
        this.cbd = new CbdService(this);
        this.gateway = new GatewayService(this);
    }

    /**
     * Create configured HTTP client
     */
    private createHttpClient(): AxiosInstance {
        const client = axios.create({
            baseURL: this.config.baseUrl,
            timeout: this.config.timeout,
            headers: this.config.headers,
            validateStatus: this.config.validateStatus
        });

        // Request interceptor
        client.interceptors.request.use(
            (config) => {
                // Add auth token if available
                if (this.authToken) {
                    config.headers.Authorization = `Bearer ${this.authToken}`;
                }

                // Add API key if configured
                if (this.config.apiKey) {
                    config.headers['X-API-Key'] = this.config.apiKey;
                }

                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor
        client.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                // Handle network errors
                if (!error.response) {
                    throw new NetworkError('Network error or server unreachable', {
                        code: error.code,
                        message: error.message
                    });
                }

                // Handle timeout errors
                if (error.code === 'ECONNABORTED') {
                    throw new TimeoutError('Request timeout', {
                        timeout: this.config.timeout
                    });
                }

                // Handle HTTP errors
                const { status, data } = error.response;
                const message = data?.message || error.message || 'Unknown error';

                // Auto-retry on certain errors
                if (this.shouldRetry(status) && !originalRequest._retry) {
                    originalRequest._retry = true;

                    if (originalRequest._retryCount >= this.config.retries) {
                        throw createErrorFromResponse(status, message, data);
                    }

                    originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

                    // Wait before retrying
                    await this.delay(this.config.retryDelay * originalRequest._retryCount);

                    return client(originalRequest);
                }

                throw createErrorFromResponse(status, message, data);
            }
        );

        return client;
    }

    /**
     * Determine if request should be retried
     */
    private shouldRetry(status: number): boolean {
        return status >= 500 || status === 429 || status === 408;
    }

    /**
     * Delay utility for retries
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Make HTTP request
     */
    async request<T = any>(config: AxiosRequestConfig): Promise<T> {
        try {
            const response: AxiosResponse<T> = await this.httpClient.request(config);
            return response.data;
        } catch (error) {
            if (error instanceof CodeaiError) {
                throw error;
            }
            throw new CodeaiError('Request failed', 500, 'REQUEST_ERROR', error);
        }
    }

    /**
     * Set authentication token
     */
    setAuthToken(token: string): void {
        this.authToken = token;
    }

    /**
     * Clear authentication token
     */
    clearAuthToken(): void {
        this.authToken = undefined;
        this.currentSession = undefined;
    }

    /**
     * Get current authentication token
     */
    getAuthToken(): string | undefined {
        return this.authToken;
    }

    /**
     * Set current session
     */
    setSession(session: AuthSession): void {
        this.currentSession = session;
        this.setAuthToken(session.token.accessToken);
    }

    /**
     * Get current session
     */
    getSession(): AuthSession | undefined {
        return this.currentSession;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return !!this.authToken && !!this.currentSession?.isAuthenticated;
    }

    /**
     * Get client configuration
     */
    getConfig(): CodeaiConfig {
        return { ...this.config };
    }

    /**
     * Update client configuration
     */
    updateConfig(updates: Partial<CodeaiConfig>): void {
        Object.assign(this.config, updates);

        // Update HTTP client if needed
        this.httpClient.defaults.baseURL = this.config.baseUrl;
        this.httpClient.defaults.timeout = this.config.timeout;
        this.httpClient.defaults.headers = { ...this.httpClient.defaults.headers, ...this.config.headers };
    }

    /**
     * Test connection to CODAI services
     */
    async testConnection(): Promise<boolean> {
        try {
            await this.gateway.getHealth();
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get SDK version
     */
    getVersion(): string {
        return '1.0.0';
    }
}
