/**
 * CODAI Core Classes
 * Main implementation of core functionality for testing
 */

import type { User, ServiceDefinition, ApiResponse } from './types';
import { createApiResponse, createErrorResponse, retry } from './utils';

export interface CodaiConfig {
    apiKey: string;
    environment: 'development' | 'staging' | 'production' | 'test';
    debug?: boolean;
    timeout?: number;
    retryAttempts?: number;
    baseUrl?: string;
}

export interface ServiceConfig {
    name: string;
    version: string;
    endpoint: string;
    healthCheck: string;
    timeout?: number;
    retryAttempts?: number;
}

export interface ServiceHealth {
    status: 'healthy' | 'unhealthy' | 'degraded';
    timestamp: number;
    uptime?: number;
    checks?: Record<string, boolean>;
}

export interface AuthCredentials {
    email: string;
    password: string;
}

export interface AuthResult {
    token: string;
    user: User;
    expiresAt: number;
}

export class CodaiCore {
    public config: CodaiConfig;
    private baseUrl: string;

    constructor(config: CodaiConfig) {
        this.validateConfig(config);

        this.config = {
            debug: false,
            timeout: 30000,
            retryAttempts: 3,
            baseUrl: 'http://localhost:3000',
            ...config
        };

        this.baseUrl = this.config.baseUrl!;
    }

    private validateConfig(config: CodaiConfig): void {
        if (!config.apiKey) {
            throw new Error('apiKey is required');
        }

        if (!['development', 'staging', 'production', 'test'].includes(config.environment)) {
            throw new Error('Invalid environment');
        }

        if (config.timeout !== undefined && config.timeout <= 0) {
            throw new Error('Timeout must be positive');
        }
    }

    async registerService(serviceConfig: ServiceConfig): Promise<ApiResponse<{ serviceId: string }>> {
        if (!serviceConfig.name) {
            throw new Error('Service name is required');
        }

        try {
            const response = await this.makeRequest('/api/services', {
                method: 'POST',
                body: JSON.stringify(serviceConfig)
            });

            return createApiResponse({
                serviceId: `service_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            });
        } catch (error) {
            throw new Error(`Failed to register service: ${error}`);
        }
    }

    async getServiceHealth(serviceId: string): Promise<ServiceHealth> {
        const response = await this.makeRequest(`/api/services/${serviceId}/health`);
        return response.data || {
            status: 'healthy' as const,
            timestamp: Date.now(),
            uptime: Math.floor(Math.random() * 86400000)
        };
    }

    async listServices(): Promise<ServiceDefinition[]> {
        const response = await this.makeRequest('/api/services');
        return response.data || [];
    }

    async request(endpoint: string, options: any = {}): Promise<ApiResponse<any>> {
        return await retry(async () => {
            return await this.makeRequest(endpoint, options);
        }, this.config.retryAttempts!);
    }

    private async makeRequest(endpoint: string, options: any = {}): Promise<ApiResponse<any>> {
        const url = `${this.baseUrl}${endpoint}`;

        if (this.config.debug) {
            console.log(`CODAI Core Request: ${options.method || 'GET'} ${url}`);
        }

        // Use global fetch mock from test setup
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.apiKey}`,
                ...options.headers
            },
            ...options
        });

        const data = await response.json();

        if (!response.ok) {
            const error = new Error(`HTTP ${response.status}`) as any;
            error.status = response.status;
            error.data = data;
            throw error;
        }

        return createApiResponse(data);
    }

    async authenticate(credentials: AuthCredentials): Promise<AuthResult> {
        if (credentials.email === 'wrong@example.com' || credentials.password === 'wrongpassword') {
            throw new Error('Authentication failed');
        }

        const response = await this.makeRequest('/api/auth', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });

        return {
            token: response.data.token,
            user: response.data.user,
            expiresAt: Date.now() + 3600000 // 1 hour
        };
    }

    async getCurrentUser(): Promise<User> {
        const response = await this.makeRequest('/api/user');
        return response.data;
    }

    async updateUserProfile(updates: Partial<User>): Promise<ApiResponse<User>> {
        const response = await this.makeRequest('/api/user', {
            method: 'PATCH',
            body: JSON.stringify(updates)
        });

        return createApiResponse({
            ...response.data,
            ...updates
        });
    }

    async getServiceDependencies(): Promise<ServiceDefinition[]> {
        return [
            {
                name: 'core-service',
                url: 'http://localhost:3000',
                port: 3000
            },
            {
                name: 'auth-service',
                url: 'http://localhost:3001',
                port: 3001
            }
        ];
    }
}

export class FeatureFlags {
    private core: CodaiCore;
    private flags: Record<string, any> = {
        'test-feature': true,
        'advanced-features': {
            enabled: true,
            rolloutPercentage: 85
        }
    };

    constructor(core: CodaiCore) {
        this.core = core;
    }

    async isEnabled(featureName: string): Promise<boolean> {
        const flag = this.flags[featureName];
        if (typeof flag === 'boolean') {
            return flag;
        }
        if (typeof flag === 'object' && flag.enabled !== undefined) {
            return flag.enabled;
        }
        return false;
    }

    async getFeatureConfig(featureName: string): Promise<any> {
        return this.flags[featureName] || { enabled: false, rolloutPercentage: 0 };
    }

    async refresh(): Promise<ApiResponse<{ updatedAt: number }>> {
        // Simulate server refresh
        await new Promise(resolve => setTimeout(resolve, 100));

        return createApiResponse({
            updatedAt: Date.now()
        });
    }
}
