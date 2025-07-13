/**
 * CODAI API Gateway Integration
 * Connects frontend to PUBLICAI API Gateway for unified service access
 */

interface APIResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

interface ServiceHealth {
    status: 'healthy' | 'unhealthy' | 'error';
    url: string;
    port: number;
    lastChecked: string;
    error?: string;
}

interface ServiceRegistry {
    gateway: string;
    services: Record<string, ServiceHealth>;
    totalServices: number;
    healthyServices: number;
}

interface AuthToken {
    success: boolean;
    token: string;
    user: {
        id: number;
        username: string;
        email: string;
        role: string;
    };
    message: string;
}

class APIGatewayClient {
    private baseURL: string;
    private token: string | null = null;

    constructor(baseURL = 'http://localhost:4022') {
        this.baseURL = baseURL;
    }

    /**
     * Set authentication token
     */
    setToken(token: string): void {
        this.token = token;
    }

    /**
     * Get default headers with authentication
     */
    private getHeaders(): Record<string, string> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    /**
     * Make HTTP request to API Gateway
     */
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<APIResponse<T>> {
        try {
            const url = `${this.baseURL}${endpoint}`;
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...this.getHeaders(),
                    ...options.headers,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: data.error || `HTTP ${response.status}`,
                    message: data.message,
                };
            }

            return {
                success: true,
                data,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * Health check for API Gateway
     */
    async health(): Promise<APIResponse<any>> {
        return this.request('/health');
    }

    /**
     * Get service registry and health status
     */
    async getServices(): Promise<APIResponse<ServiceRegistry>> {
        return this.request<ServiceRegistry>('/api/services');
    }

    /**
     * Get health of specific service
     */
    async getServiceHealth(serviceName: string): Promise<APIResponse<ServiceHealth>> {
        return this.request<ServiceHealth>(`/api/services/${serviceName}/health`);
    }

    // Authentication Methods
    /**
     * Register new user through API Gateway
     */
    async register(username: string, email: string, password: string): Promise<APIResponse<any>> {
        return this.request('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password }),
        });
    }

    /**
     * Login user through API Gateway
     */
    async login(username: string, password: string): Promise<APIResponse<AuthToken>> {
        const result = await this.request<AuthToken>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });

        if (result.success && result.data?.token) {
            this.setToken(result.data.token);
        }

        return result;
    }

    /**
     * Logout user
     */
    async logout(): Promise<APIResponse<any>> {
        const result = await this.request('/api/auth/logout', {
            method: 'POST',
        });

        if (result.success) {
            this.token = null;
        }

        return result;
    }

    /**
     * Get user profile
     */
    async getProfile(): Promise<APIResponse<any>> {
        return this.request('/api/auth/profile');
    }

    // Memory Service Methods
    /**
     * Store memory through API Gateway
     */
    async storeMemory(content: string, metadata?: any): Promise<APIResponse<any>> {
        return this.request('/api/memory/store', {
            method: 'POST',
            body: JSON.stringify({ content, metadata }),
        });
    }

    /**
     * Retrieve memories through API Gateway
     */
    async getMemories(query?: string): Promise<APIResponse<any>> {
        const endpoint = query ? `/api/memory/search?q=${encodeURIComponent(query)}` : '/api/memory';
        return this.request(endpoint);
    }

    // Financial Service Methods
    /**
     * Get financial data through API Gateway
     */
    async getFinancialData(): Promise<APIResponse<any>> {
        return this.request('/api/financial/data');
    }

    /**
     * Process financial transaction
     */
    async processTransaction(transaction: any): Promise<APIResponse<any>> {
        return this.request('/api/financial/transaction', {
            method: 'POST',
            body: JSON.stringify(transaction),
        });
    }

    // Code Service Methods
    /**
     * Execute code through API Gateway
     */
    async executeCode(code: string, language: string): Promise<APIResponse<any>> {
        return this.request('/api/code/execute', {
            method: 'POST',
            body: JSON.stringify({ code, language }),
        });
    }

    /**
     * Analyze code through API Gateway
     */
    async analyzeCode(code: string): Promise<APIResponse<any>> {
        return this.request('/api/code/analyze', {
            method: 'POST',
            body: JSON.stringify({ code }),
        });
    }

    // Generic Proxy Methods
    /**
     * Make request to any service through proxy
     */
    async proxyRequest<T>(
        serviceName: string,
        path: string,
        options: RequestInit = {}
    ): Promise<APIResponse<T>> {
        return this.request<T>(`/api/proxy/${serviceName}${path}`, options);
    }
}

// Create singleton instance
export const apiGateway = new APIGatewayClient();

// Export types for use in components
export type { APIResponse, ServiceHealth, ServiceRegistry, AuthToken };
export { APIGatewayClient };
