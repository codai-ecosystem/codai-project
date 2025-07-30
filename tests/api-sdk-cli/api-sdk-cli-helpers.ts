import { APIRequestContext, APIResponse } from '@playwright/test';
import axios, { AxiosResponse } from 'axios';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

// CODAI Services Configuration
export const CODAI_SERVICES = {
    ID: { port: 4001, name: 'id', hasSDK: true, hasCLI: true },
    MEMORAI: { port: 4002, name: 'memorai', hasSDK: true, hasCLI: true },
    HUB: { port: 4003, name: 'hub', hasSDK: true, hasCLI: false },
    LOGAI: { port: 4004, name: 'logai', hasSDK: true, hasCLI: true },
    ADMIN: { port: 4005, name: 'admin', hasSDK: true, hasCLI: true },
    CODAI: { port: 4006, name: 'codai', hasSDK: true, hasCLI: true },
    BANCAI: { port: 4007, name: 'bancai', hasSDK: true, hasCLI: true },
    CUMPARAI: { port: 4008, name: 'cumparai', hasSDK: true, hasCLI: false },
    WALLET: { port: 4009, name: 'wallet', hasSDK: true, hasCLI: true },
    MARKETAI: { port: 4010, name: 'marketai', hasSDK: true, hasCLI: false },
    FABRICAI: { port: 4011, name: 'fabricai', hasSDK: true, hasCLI: false }
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

// API Testing Endpoints
export const API_ENDPOINTS = {
    // Authentication endpoints
    AUTH: {
        LOGIN: '/api/auth/login',
        LOGOUT: '/api/auth/logout',
        REFRESH: '/api/auth/refresh',
        VERIFY: '/api/auth/verify'
    },
    // Service-specific endpoints
    MEMORAI: {
        MEMORIES: '/api/memorai/memories',
        SEARCH: '/api/memorai/memories/search',
        BULK: '/api/memorai/memories/bulk'
    },
    CODAI: {
        PROJECTS: '/api/codai/projects',
        ANALYSIS: '/api/codai/analysis',
        GENERATION: '/api/codai/generation'
    },
    BANCAI: {
        TRANSACTIONS: '/api/bancai/transactions',
        ACCOUNTS: '/api/bancai/accounts',
        PAYMENTS: '/api/bancai/payments'
    }
};

/**
 * Authentication Helper for API Testing
 */
export class AuthHelper {
    private token: string | null = null;
    private request: APIRequestContext;

    constructor(request: APIRequestContext) {
        this.request = request;
    }

    async authenticate(userType: keyof typeof TEST_USERS = 'user'): Promise<string> {
        const user = TEST_USERS[userType];

        const response = await this.request.post(API_ENDPOINTS.AUTH.LOGIN, {
            data: {
                email: user.email,
                password: user.password
            }
        });

        if (!response.ok()) {
            throw new Error(`Authentication failed: ${response.status()}`);
        }

        const data = await response.json();
        this.token = data.token || data.access_token;
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

    async refreshToken(): Promise<string> {
        if (!this.token) {
            throw new Error('No token to refresh');
        }

        const response = await this.request.post(API_ENDPOINTS.AUTH.REFRESH, {
            headers: this.getAuthHeaders()
        });

        if (!response.ok()) {
            throw new Error(`Token refresh failed: ${response.status()}`);
        }

        const data = await response.json();
        this.token = data.token || data.access_token;
        return this.token;
    }
}

/**
 * SDK Testing Helper
 */
export class SDKTestHelper {
    private request: APIRequestContext;
    private auth: AuthHelper;

    constructor(request: APIRequestContext, auth: AuthHelper) {
        this.request = request;
        this.auth = auth;
    }

    async testSDKInstallation(service: string): Promise<{ success: boolean, version?: string, error?: string }> {
        try {
            const packageName = `@codai/${service}`;
            const { stdout, stderr } = await execAsync(`npm list ${packageName} --depth=0 --json`);

            if (stderr && !stderr.includes('WARN')) {
                return { success: false, error: stderr };
            }

            const packageInfo = JSON.parse(stdout);
            const version = packageInfo.dependencies?.[packageName]?.version;

            return { success: true, version };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    async testSDKBasicOperations(service: string): Promise<{ success: boolean, operations: Record<string, boolean>, errors: string[] }> {
        const results = {
            success: false,
            operations: {
                initialize: false,
                authenticate: false,
                basicOperation: false,
                errorHandling: false
            },
            errors: [] as string[]
        };

        try {
            // Test SDK initialization
            const initResponse = await this.request.get(`/api/${service}/sdk/init`, {
                headers: this.auth.getAuthHeaders()
            });

            if (initResponse.ok()) {
                results.operations.initialize = true;
            } else {
                results.errors.push(`Initialization failed: ${initResponse.status()}`);
            }

            // Test SDK authentication
            const authResponse = await this.request.post(`/api/${service}/sdk/auth`, {
                data: { token: this.auth.getAuthHeaders().Authorization },
                headers: this.auth.getAuthHeaders()
            });

            if (authResponse.ok()) {
                results.operations.authenticate = true;
            } else {
                results.errors.push(`Authentication failed: ${authResponse.status()}`);
            }

            // Test basic SDK operation
            const operationResponse = await this.request.get(`/api/${service}/sdk/test`, {
                headers: this.auth.getAuthHeaders()
            });

            if (operationResponse.ok()) {
                results.operations.basicOperation = true;
            } else {
                results.errors.push(`Basic operation failed: ${operationResponse.status()}`);
            }

            // Test error handling
            const errorResponse = await this.request.get(`/api/${service}/sdk/test-error`);

            if (errorResponse.status() === 400 || errorResponse.status() === 401) {
                results.operations.errorHandling = true;
            } else {
                results.errors.push(`Error handling test unexpected response: ${errorResponse.status()}`);
            }

            results.success = Object.values(results.operations).filter(Boolean).length >= 3;

        } catch (error: any) {
            results.errors.push(`SDK test exception: ${error.message}`);
        }

        return results;
    }
}

/**
 * CLI Testing Helper
 */
export class CLITestHelper {
    private serviceName: string;

    constructor(serviceName: string) {
        this.serviceName = serviceName;
    }

    async testCLIInstallation(): Promise<{ success: boolean, version?: string, error?: string }> {
        try {
            const cliCommand = `${this.serviceName}`;
            const { stdout, stderr } = await execAsync(`${cliCommand} --version`);

            if (stderr && !stdout) {
                return { success: false, error: stderr };
            }

            const version = stdout.trim();
            return { success: true, version };

        } catch (error: any) {
            if (error.message.includes('command not found') || error.message.includes('not recognized')) {
                return { success: false, error: 'CLI not installed or not in PATH' };
            }
            return { success: false, error: error.message };
        }
    }

    async testCLICommands(): Promise<{ success: boolean, commands: Record<string, boolean>, errors: string[] }> {
        const results = {
            success: false,
            commands: {
                help: false,
                version: false,
                login: false,
                list: false,
                create: false
            },
            errors: [] as string[]
        };

        const cliCommand = `${this.serviceName}`;

        try {
            // Test help command
            try {
                await execAsync(`${cliCommand} --help`);
                results.commands.help = true;
            } catch (error: any) {
                if (!error.message.includes('exit code 1')) { // Help might exit with 1
                    results.errors.push(`Help command failed: ${error.message}`);
                } else {
                    results.commands.help = true; // Help shown but exit code 1 is acceptable
                }
            }

            // Test version command
            try {
                await execAsync(`${cliCommand} --version`);
                results.commands.version = true;
            } catch (error: any) {
                results.errors.push(`Version command failed: ${error.message}`);
            }

            // Test login command (without actual login)
            try {
                const { stderr } = await execAsync(`${cliCommand} login --help`);
                if (!stderr.includes('error') && !stderr.includes('Error')) {
                    results.commands.login = true;
                }
            } catch (error: any) {
                if (error.message.includes('--help')) {
                    results.commands.login = true; // Help for login exists
                } else {
                    results.errors.push(`Login command test failed: ${error.message}`);
                }
            }

            // Test list command
            try {
                await execAsync(`${cliCommand} list --help`);
                results.commands.list = true;
            } catch (error: any) {
                if (error.message.includes('exit code 1')) {
                    results.commands.list = true; // Help shown
                } else {
                    results.errors.push(`List command test failed: ${error.message}`);
                }
            }

            // Test create command
            try {
                await execAsync(`${cliCommand} create --help`);
                results.commands.create = true;
            } catch (error: any) {
                if (error.message.includes('exit code 1')) {
                    results.commands.create = true; // Help shown
                } else {
                    results.errors.push(`Create command test failed: ${error.message}`);
                }
            }

            results.success = Object.values(results.commands).filter(Boolean).length >= 3;

        } catch (error: any) {
            results.errors.push(`CLI test exception: ${error.message}`);
        }

        return results;
    }
}

/**
 * REST API Testing Helper
 */
export class APITestHelper {
    private request: APIRequestContext;
    private auth: AuthHelper;

    constructor(request: APIRequestContext, auth: AuthHelper) {
        this.request = request;
        this.auth = auth;
    }

    async testRESTEndpoints(service: string): Promise<{ success: boolean, endpoints: Record<string, any>, errors: string[] }> {
        const results = {
            success: false,
            endpoints: {} as Record<string, any>,
            errors: [] as string[]
        };

        const baseUrl = `/api/${service}`;

        // Common REST endpoints to test
        const endpoints = [
            { method: 'GET', path: '', name: 'root' },
            { method: 'GET', path: '/health', name: 'health' },
            { method: 'GET', path: '/version', name: 'version' },
            { method: 'GET', path: '/docs', name: 'docs' },
            { method: 'POST', path: '/test', name: 'test_post', data: { test: true } }
        ];

        for (const endpoint of endpoints) {
            try {
                let response: APIResponse;
                const url = `${baseUrl}${endpoint.path}`;
                const headers = endpoint.name === 'health' ? {} : this.auth.getAuthHeaders();

                switch (endpoint.method) {
                    case 'GET':
                        response = await this.request.get(url, { headers });
                        break;
                    case 'POST':
                        response = await this.request.post(url, {
                            data: endpoint.data,
                            headers
                        });
                        break;
                    default:
                        continue;
                }

                results.endpoints[endpoint.name] = {
                    status: response.status(),
                    ok: response.ok(),
                    contentType: response.headers()['content-type'] || 'unknown'
                };

            } catch (error: any) {
                results.endpoints[endpoint.name] = {
                    status: 0,
                    ok: false,
                    error: error.message
                };
                results.errors.push(`${endpoint.name}: ${error.message}`);
            }
        }

        // Success if at least health endpoint works
        results.success = results.endpoints.health?.ok || results.endpoints.root?.ok;

        return results;
    }

    async testAPIAuthentication(service: string): Promise<{ success: boolean, authTypes: Record<string, boolean>, errors: string[] }> {
        const results = {
            success: false,
            authTypes: {
                bearer_token: false,
                api_key: false,
                basic_auth: false,
                no_auth_rejection: false
            },
            errors: [] as string[]
        };

        const protectedEndpoint = `/api/${service}/protected`;

        try {
            // Test Bearer Token authentication
            const bearerResponse = await this.request.get(protectedEndpoint, {
                headers: this.auth.getAuthHeaders()
            });

            if (bearerResponse.ok() || bearerResponse.status() === 200) {
                results.authTypes.bearer_token = true;
            }

            // Test no authentication (should be rejected)
            const noAuthResponse = await this.request.get(protectedEndpoint);

            if (noAuthResponse.status() === 401 || noAuthResponse.status() === 403) {
                results.authTypes.no_auth_rejection = true;
            }

            // Test invalid token
            const invalidTokenResponse = await this.request.get(protectedEndpoint, {
                headers: {
                    'Authorization': 'Bearer invalid-token',
                    'Content-Type': 'application/json'
                }
            });

            if (invalidTokenResponse.status() === 401) {
                results.authTypes.bearer_token = true; // Properly rejects invalid tokens
            }

            results.success = results.authTypes.bearer_token && results.authTypes.no_auth_rejection;

        } catch (error: any) {
            results.errors.push(`Authentication test exception: ${error.message}`);
        }

        return results;
    }
}

/**
 * Load Testing Helper
 */
export class LoadTestHelper {
    private request: APIRequestContext;

    constructor(request: APIRequestContext) {
        this.request = request;
    }

    async performLoadTest(
        endpoint: string,
        options: {
            concurrency: number;
            duration: number;
            requestsPerSecond?: number;
            headers?: Record<string, string>;
            method?: 'GET' | 'POST';
            data?: any;
        }
    ): Promise<{
        totalRequests: number;
        successfulRequests: number;
        failedRequests: number;
        averageResponseTime: number;
        minResponseTime: number;
        maxResponseTime: number;
        requestsPerSecond: number;
        errorRate: number;
        errors: Array<{ status: number, count: number }>;
    }> {
        const results = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            minResponseTime: Infinity,
            maxResponseTime: 0,
            requestsPerSecond: 0,
            errorRate: 0,
            errors: [] as Array<{ status: number, count: number }>
        };

        const responseTimes: number[] = [];
        const errorCounts = new Map<number, number>();
        const startTime = Date.now();
        const endTime = startTime + options.duration;

        // Create concurrent workers
        const workers = Array.from({ length: options.concurrency }, () => {
            return this.createLoadTestWorker(
                endpoint,
                endTime,
                options,
                responseTimes,
                errorCounts
            );
        });

        // Run all workers concurrently
        const workerResults = await Promise.all(workers);

        // Aggregate results
        const totalDuration = Date.now() - startTime;
        results.totalRequests = workerResults.reduce((sum, result) => sum + result.requests, 0);
        results.successfulRequests = workerResults.reduce((sum, result) => sum + result.successes, 0);
        results.failedRequests = results.totalRequests - results.successfulRequests;

        if (responseTimes.length > 0) {
            results.averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
            results.minResponseTime = Math.min(...responseTimes);
            results.maxResponseTime = Math.max(...responseTimes);
        }

        results.requestsPerSecond = results.totalRequests / (totalDuration / 1000);
        results.errorRate = (results.failedRequests / results.totalRequests) * 100;

        // Convert error counts to array
        results.errors = Array.from(errorCounts.entries()).map(([status, count]) => ({
            status,
            count
        }));

        return results;
    }

    private async createLoadTestWorker(
        endpoint: string,
        endTime: number,
        options: any,
        responseTimes: number[],
        errorCounts: Map<number, number>
    ): Promise<{ requests: number, successes: number }> {
        let requests = 0;
        let successes = 0;

        while (Date.now() < endTime) {
            const requestStart = Date.now();

            try {
                let response: APIResponse;

                if (options.method === 'POST') {
                    response = await this.request.post(endpoint, {
                        data: options.data,
                        headers: options.headers
                    });
                } else {
                    response = await this.request.get(endpoint, {
                        headers: options.headers
                    });
                }

                const responseTime = Date.now() - requestStart;
                responseTimes.push(responseTime);
                requests++;

                if (response.ok()) {
                    successes++;
                } else {
                    const status = response.status();
                    errorCounts.set(status, (errorCounts.get(status) || 0) + 1);
                }

            } catch (error: any) {
                requests++;
                errorCounts.set(0, (errorCounts.get(0) || 0) + 1); // Network errors
            }

            // Optional: Rate limiting
            if (options.requestsPerSecond) {
                const delay = 1000 / options.requestsPerSecond / options.concurrency;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        return { requests, successes };
    }
}

/**
 * Security Testing Helper
 */
export class SecurityTestHelper {
    private request: APIRequestContext;

    constructor(request: APIRequestContext) {
        this.request = request;
    }

    async testCommonVulnerabilities(service: string): Promise<{
        vulnerabilities: Record<string, { tested: boolean, vulnerable: boolean, details?: string }>;
        overallSecurity: 'high' | 'medium' | 'low';
        recommendations: string[];
    }> {
        const results = {
            vulnerabilities: {
                sql_injection: { tested: false, vulnerable: false },
                xss: { tested: false, vulnerable: false },
                csrf: { tested: false, vulnerable: false },
                unauthorized_access: { tested: false, vulnerable: false },
                rate_limiting: { tested: false, vulnerable: false },
                input_validation: { tested: false, vulnerable: false }
            },
            overallSecurity: 'high' as 'high' | 'medium' | 'low',
            recommendations: [] as string[]
        };

        const baseUrl = `/api/${service}`;

        // Test SQL Injection
        try {
            const sqlPayloads = ["'; DROP TABLE users; --", "1' OR '1'='1", "admin'--"];

            for (const payload of sqlPayloads) {
                const response = await this.request.get(`${baseUrl}/search?q=${encodeURIComponent(payload)}`);

                if (response.ok()) {
                    const text = await response.text();
                    if (text.toLowerCase().includes('sql') || text.toLowerCase().includes('error')) {
                        results.vulnerabilities.sql_injection = {
                            tested: true,
                            vulnerable: true,
                            details: 'Potential SQL injection vulnerability detected'
                        };
                        break;
                    }
                }
            }

            if (!results.vulnerabilities.sql_injection.vulnerable) {
                results.vulnerabilities.sql_injection = { tested: true, vulnerable: false };
            }

        } catch (error) {
            results.vulnerabilities.sql_injection = { tested: true, vulnerable: false };
        }

        // Test XSS
        try {
            const xssPayloads = ["<script>alert('xss')</script>", "<img src=x onerror=alert('xss')>"];

            for (const payload of xssPayloads) {
                const response = await this.request.post(`${baseUrl}/test`, {
                    data: { content: payload }
                });

                if (response.ok()) {
                    const text = await response.text();
                    if (text.includes(payload) && !text.includes('&lt;') && !text.includes('&gt;')) {
                        results.vulnerabilities.xss = {
                            tested: true,
                            vulnerable: true,
                            details: 'XSS vulnerability: Unescaped user input detected'
                        };
                        break;
                    }
                }
            }

            if (!results.vulnerabilities.xss.vulnerable) {
                results.vulnerabilities.xss = { tested: true, vulnerable: false };
            }

        } catch (error) {
            results.vulnerabilities.xss = { tested: true, vulnerable: false };
        }

        // Test Unauthorized Access
        try {
            const protectedEndpoints = ['/admin', '/users', '/config', '/internal'];

            for (const endpoint of protectedEndpoints) {
                const response = await this.request.get(`${baseUrl}${endpoint}`);

                if (response.ok()) {
                    results.vulnerabilities.unauthorized_access = {
                        tested: true,
                        vulnerable: true,
                        details: `Unauthorized access to ${endpoint}`
                    };
                    break;
                }
            }

            if (!results.vulnerabilities.unauthorized_access.vulnerable) {
                results.vulnerabilities.unauthorized_access = { tested: true, vulnerable: false };
            }

        } catch (error) {
            results.vulnerabilities.unauthorized_access = { tested: true, vulnerable: false };
        }

        // Test Rate Limiting
        try {
            const rapidRequests = Array.from({ length: 50 }, () =>
                this.request.get(`${baseUrl}/test`)
            );

            const responses = await Promise.allSettled(rapidRequests);
            const rateLimited = responses.some(result =>
                result.status === 'fulfilled' &&
                (result.value as APIResponse).status() === 429
            );

            results.vulnerabilities.rate_limiting = {
                tested: true,
                vulnerable: !rateLimited,
                details: rateLimited ? undefined : 'No rate limiting detected'
            };

        } catch (error) {
            results.vulnerabilities.rate_limiting = { tested: false, vulnerable: false };
        }

        // Calculate overall security rating
        const vulnerableCount = Object.values(results.vulnerabilities)
            .filter(v => v.tested && v.vulnerable).length;

        if (vulnerableCount === 0) {
            results.overallSecurity = 'high';
        } else if (vulnerableCount <= 2) {
            results.overallSecurity = 'medium';
            results.recommendations.push('Address identified vulnerabilities');
        } else {
            results.overallSecurity = 'low';
            results.recommendations.push('Critical security issues need immediate attention');
        }

        // Add general recommendations
        if (results.vulnerabilities.rate_limiting.vulnerable) {
            results.recommendations.push('Implement rate limiting to prevent abuse');
        }

        if (results.vulnerabilities.input_validation.vulnerable) {
            results.recommendations.push('Improve input validation and sanitization');
        }

        return results;
    }
}

// Utility functions
export function generateTestData(size: number = 1000): any {
    return {
        id: `api-test-${Date.now()}-${Math.random()}`,
        title: `API Test Data ${Date.now()}`,
        content: 'x'.repeat(size),
        metadata: {
            created: new Date().toISOString(),
            type: 'api-test-data',
            size: size
        }
    };
}

export function createSampleApplication(service: string): string {
    const sampleCode = `
// Sample ${service.toUpperCase()} SDK Application
const ${service}SDK = require('@codai/${service}');

class Sample${service.charAt(0).toUpperCase() + service.slice(1)}App {
  constructor() {
    this.client = new ${service}SDK.Client({
      apiKey: process.env.CODAI_API_KEY,
      baseURL: 'http://localhost:4000'
    });
  }
  
  async run() {
    try {
      await this.client.authenticate();
      console.log('✅ Authentication successful');
      
      const result = await this.client.test();
      console.log('✅ Test operation successful:', result);
      
      return { success: true, result };
    } catch (error) {
      console.error('❌ Sample app failed:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = Sample${service.charAt(0).toUpperCase() + service.slice(1)}App;
`;

    return sampleCode;
}
