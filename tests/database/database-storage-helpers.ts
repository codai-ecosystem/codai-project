import { APIRequestContext, APIResponse } from '@playwright/test';
import axios from 'axios';
import WebSocket from 'ws';
import FormData from 'form-data';
import * as fs from 'fs';
import * as path from 'path';

// Base URLs for CODAI services
export const SERVICE_URLS = {
    GATEWAY: 'http://localhost:4000',
    ID: 'http://localhost:4001',
    MEMORAI: 'http://localhost:4002',
    HUB: 'http://localhost:4003',
    LOGAI: 'http://localhost:4004',
    ADMIN: 'http://localhost:4005',
    CODAI: 'http://localhost:4006',
    BANCAI: 'http://localhost:4007',
    CUMPARAI: 'http://localhost:4008',
    WALLET: 'http://localhost:4009',
    MARKETAI: 'http://localhost:4010',
    FABRICAI: 'http://localhost:4011'
};

// Test user configurations
export const TEST_USERS = {
    admin: {
        email: 'admin@codai.ro',
        password: 'Admin123!@#',
        role: 'admin'
    },
    developer: {
        email: 'dev@codai.ro',
        password: 'Dev123!@#',
        role: 'developer'
    },
    user: {
        email: 'user@codai.ro',
        password: 'User123!@#',
        role: 'user'
    }
};

// MEMORAI Operation Types
export const MEMORAI_OPERATIONS = {
    CREATE: 'create',
    READ: 'read',
    UPDATE: 'update',
    DELETE: 'delete',
    SEARCH: 'search',
    BULK: 'bulk'
};

/**
 * Authentication Helper
 */
export class AuthHelper {
    private token: string | null = null;

    async authenticate(request: APIRequestContext, userType: keyof typeof TEST_USERS = 'user'): Promise<string> {
        const user = TEST_USERS[userType];

        const response = await request.post(`${SERVICE_URLS.GATEWAY}/api/auth/login`, {
            data: {
                email: user.email,
                password: user.password
            }
        });

        if (!response.ok()) {
            throw new Error(`Authentication failed: ${response.status()}`);
        }

        const data = await response.json();
        this.token = data.token;
        return this.token;
    }

    getAuthHeaders(): Record<string, string> {
        if (!this.token) {
            throw new Error('Not authenticated. Call authenticate() first.');
        }

        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }
}

/**
 * MEMORAI Operations Helper
 */
export class MemoraiHelper {
    private request: APIRequestContext;
    private auth: AuthHelper;

    constructor(request: APIRequestContext, auth: AuthHelper) {
        this.request = request;
        this.auth = auth;
    }

    async createMemory(data: any, service: string = 'memorai'): Promise<APIResponse> {
        return await this.request.post(`${SERVICE_URLS.GATEWAY}/api/${service}/memories`, {
            data,
            headers: this.auth.getAuthHeaders()
        });
    }

    async readMemory(id: string, service: string = 'memorai'): Promise<APIResponse> {
        return await this.request.get(`${SERVICE_URLS.GATEWAY}/api/${service}/memories/${id}`, {
            headers: this.auth.getAuthHeaders()
        });
    }

    async updateMemory(id: string, data: any, service: string = 'memorai'): Promise<APIResponse> {
        return await this.request.put(`${SERVICE_URLS.GATEWAY}/api/${service}/memories/${id}`, {
            data,
            headers: this.auth.getAuthHeaders()
        });
    }

    async deleteMemory(id: string, service: string = 'memorai'): Promise<APIResponse> {
        return await this.request.delete(`${SERVICE_URLS.GATEWAY}/api/${service}/memories/${id}`, {
            headers: this.auth.getAuthHeaders()
        });
    }

    async searchMemories(query: string, service: string = 'memorai'): Promise<APIResponse> {
        return await this.request.get(`${SERVICE_URLS.GATEWAY}/api/${service}/memories/search`, {
            params: { q: query },
            headers: this.auth.getAuthHeaders()
        });
    }

    async bulkOperations(operations: any[], service: string = 'memorai'): Promise<APIResponse> {
        return await this.request.post(`${SERVICE_URLS.GATEWAY}/api/${service}/memories/bulk`, {
            data: { operations },
            headers: this.auth.getAuthHeaders()
        });
    }
}

/**
 * File Operations Helper
 */
export class FileHelper {
    private request: APIRequestContext;
    private auth: AuthHelper;

    constructor(request: APIRequestContext, auth: AuthHelper) {
        this.request = request;
        this.auth = auth;
    }

    async uploadFile(filePath: string, service: string, fileName?: string): Promise<APIResponse> {
        const formData = new FormData();
        const fileStream = fs.createReadStream(filePath);

        formData.append('file', fileStream, fileName || path.basename(filePath));

        // Use axios for file upload as Playwright has limitations with FormData
        try {
            const response = await axios.post(
                `${SERVICE_URLS.GATEWAY}/api/${service}/files/upload`,
                formData,
                {
                    headers: {
                        ...this.auth.getAuthHeaders(),
                        ...formData.getHeaders()
                    },
                    maxContentLength: Infinity,
                    maxBodyLength: Infinity
                }
            );

            return {
                ok: () => response.status >= 200 && response.status < 300,
                status: () => response.status,
                json: () => Promise.resolve(response.data)
            } as any;
        } catch (error: any) {
            return {
                ok: () => false,
                status: () => error.response?.status || 500,
                json: () => Promise.resolve({ error: error.message })
            } as any;
        }
    }

    async downloadFile(fileId: string, service: string): Promise<APIResponse> {
        return await this.request.get(`${SERVICE_URLS.GATEWAY}/api/${service}/files/${fileId}`, {
            headers: this.auth.getAuthHeaders()
        });
    }

    async deleteFile(fileId: string, service: string): Promise<APIResponse> {
        return await this.request.delete(`${SERVICE_URLS.GATEWAY}/api/${service}/files/${fileId}`, {
            headers: this.auth.getAuthHeaders()
        });
    }

    async listFiles(service: string, options?: { limit?: number, offset?: number }): Promise<APIResponse> {
        const params = new URLSearchParams();
        if (options?.limit) params.set('limit', options.limit.toString());
        if (options?.offset) params.set('offset', options.offset.toString());

        return await this.request.get(`${SERVICE_URLS.GATEWAY}/api/${service}/files?${params}`, {
            headers: this.auth.getAuthHeaders()
        });
    }
}

/**
 * Cache Operations Helper
 */
export class CacheHelper {
    private request: APIRequestContext;
    private auth: AuthHelper;

    constructor(request: APIRequestContext, auth: AuthHelper) {
        this.request = request;
        this.auth = auth;
    }

    async setCache(key: string, value: any, ttl?: number, service: string = 'hub'): Promise<APIResponse> {
        return await this.request.post(`${SERVICE_URLS.GATEWAY}/api/${service}/cache`, {
            data: { key, value, ttl },
            headers: this.auth.getAuthHeaders()
        });
    }

    async getCache(key: string, service: string = 'hub'): Promise<APIResponse> {
        return await this.request.get(`${SERVICE_URLS.GATEWAY}/api/${service}/cache/${key}`, {
            headers: this.auth.getAuthHeaders()
        });
    }

    async deleteCache(key: string, service: string = 'hub'): Promise<APIResponse> {
        return await this.request.delete(`${SERVICE_URLS.GATEWAY}/api/${service}/cache/${key}`, {
            headers: this.auth.getAuthHeaders()
        });
    }

    async flushCache(service: string = 'hub'): Promise<APIResponse> {
        return await this.request.delete(`${SERVICE_URLS.GATEWAY}/api/${service}/cache`, {
            headers: this.auth.getAuthHeaders()
        });
    }

    async getCacheStats(service: string = 'hub'): Promise<APIResponse> {
        return await this.request.get(`${SERVICE_URLS.GATEWAY}/api/${service}/cache/stats`, {
            headers: this.auth.getAuthHeaders()
        });
    }
}

/**
 * Real-time Synchronization Helper
 */
export class RealTimeSyncHelper {
    private connections: Map<string, WebSocket> = new Map();
    private auth: AuthHelper;

    constructor(auth: AuthHelper) {
        this.auth = auth;
    }

    async connect(service: string): Promise<WebSocket> {
        return new Promise((resolve, reject) => {
            const wsUrl = `ws://localhost:4000/api/${service}/ws`;
            const ws = new WebSocket(wsUrl, {
                headers: this.auth.getAuthHeaders()
            });

            ws.on('open', () => {
                this.connections.set(service, ws);
                resolve(ws);
            });

            ws.on('error', reject);

            // Set timeout for connection
            setTimeout(() => {
                if (ws.readyState !== WebSocket.OPEN) {
                    reject(new Error('WebSocket connection timeout'));
                }
            }, 10000);
        });
    }

    async sendMessage(service: string, message: any): Promise<void> {
        const ws = this.connections.get(service);
        if (!ws) {
            throw new Error(`No connection to ${service}`);
        }

        ws.send(JSON.stringify(message));
    }

    async waitForMessage(service: string, timeout: number = 5000): Promise<any> {
        return new Promise((resolve, reject) => {
            const ws = this.connections.get(service);
            if (!ws) {
                reject(new Error(`No connection to ${service}`));
                return;
            }

            const timeoutId = setTimeout(() => {
                reject(new Error('Message timeout'));
            }, timeout);

            ws.once('message', (data) => {
                clearTimeout(timeoutId);
                resolve(JSON.parse(data.toString()));
            });
        });
    }

    disconnect(service: string): void {
        const ws = this.connections.get(service);
        if (ws) {
            ws.close();
            this.connections.delete(service);
        }
    }

    disconnectAll(): void {
        for (const [service, ws] of this.connections) {
            ws.close();
        }
        this.connections.clear();
    }
}

/**
 * Performance Testing Helper
 */
export class PerformanceHelper {
    private request: APIRequestContext;

    constructor(request: APIRequestContext) {
        this.request = request;
    }

    async measureResponseTime(url: string, options?: any): Promise<number> {
        const start = Date.now();
        await this.request.get(url, options);
        return Date.now() - start;
    }

    async loadTest(url: string, concurrency: number, duration: number, options?: any): Promise<any> {
        const results: number[] = [];
        const errors: any[] = [];
        const startTime = Date.now();

        const makeRequest = async (): Promise<void> => {
            try {
                const requestStart = Date.now();
                await this.request.get(url, options);
                results.push(Date.now() - requestStart);
            } catch (error) {
                errors.push(error);
            }
        };

        // Start concurrent requests
        const promises: Promise<void>[] = [];
        for (let i = 0; i < concurrency; i++) {
            promises.push(this.continuousRequest(makeRequest, duration));
        }

        await Promise.all(promises);

        return {
            totalRequests: results.length,
            totalErrors: errors.length,
            averageResponseTime: results.reduce((a, b) => a + b, 0) / results.length,
            minResponseTime: Math.min(...results),
            maxResponseTime: Math.max(...results),
            errorRate: errors.length / (results.length + errors.length) * 100,
            requestsPerSecond: results.length / (duration / 1000),
            duration: Date.now() - startTime
        };
    }

    private async continuousRequest(requestFn: () => Promise<void>, duration: number): Promise<void> {
        const endTime = Date.now() + duration;

        while (Date.now() < endTime) {
            await requestFn();
            await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between requests
        }
    }
}

// Utility functions
export function generateTestData(size: number = 1000): any {
    return {
        id: `test-${Date.now()}-${Math.random()}`,
        title: `Test Memory ${Date.now()}`,
        content: 'x'.repeat(size),
        tags: ['test', 'automation', 'database'],
        metadata: {
            created: new Date().toISOString(),
            type: 'test-data',
            size: size
        }
    };
}

export function generateLargeFile(sizeInMB: number, filename: string): string {
    const filePath = path.join(__dirname, 'temp', filename);
    const content = 'x'.repeat(sizeInMB * 1024 * 1024);

    // Ensure temp directory exists
    const tempDir = path.dirname(filePath);
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    fs.writeFileSync(filePath, content);
    return filePath;
}
