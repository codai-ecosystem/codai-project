import axios from 'axios';
import jwt from 'jsonwebtoken';
import WebSocket from 'ws';
import { io, Socket } from 'socket.io-client';
import FormData from 'form-data';
import yaml from 'yaml';
import { Page, Browser, expect } from '@playwright/test';

/**
 * CODAI Integration Testing Helper Utilities
 * Comprehensive testing utilities for end-to-end and system integration testing
 */

// Test Configuration
export const TEST_CONFIG = {
    API_GATEWAY: 'http://localhost:4000',
    SERVICES: {
        ID: { port: 4001, name: 'id' },
        MEMORAI: { port: 4002, name: 'memorai' },
        HUB: { port: 4003, name: 'hub' },
        LOGAI: { port: 4004, name: 'logai' },
        ADMIN: { port: 4005, name: 'admin' },
        CODAI: { port: 4006, name: 'codai' },
        BANCAI: { port: 4007, name: 'bancai' },
        CUMPARAI: { port: 4008, name: 'cumparai' },
        WALLET: { port: 4009, name: 'wallet' },
        MARKETAI: { port: 4010, name: 'marketai' },
        FABRICAI: { port: 4011, name: 'fabricai' },
        ANALIZAI: { port: 4012, name: 'analizai' },
        ROMAI: { port: 4013, name: 'romai' }
    },
    TEST_TIMEOUT: 120000,
    LOAD_TEST_USERS: 50,
    STRESS_TEST_USERS: 100,
    PERFORMANCE_THRESHOLDS: {
        response_time: 2000, // 2 seconds
        throughput: 100, // requests per second
        error_rate: 0.01 // 1% error rate
    }
};

/**
 * Authentication Helper for Integration Testing
 */
export class IntegrationAuthHelper {
    private tokens: Map<string, string> = new Map();

    async authenticateUser(username: string = 'testuser', password: string = 'testpass'): Promise<string> {
        const response = await axios.post(`${TEST_CONFIG.API_GATEWAY}/auth/login`, {
            username,
            password
        });

        const token = response.data.token;
        this.tokens.set(username, token);
        return token;
    }

    async authenticateAdmin(): Promise<string> {
        return this.authenticateUser('admin', 'admin123');
    }

    getAuthHeaders(username: string = 'testuser'): object {
        const token = this.tokens.get(username);
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    async validateTokenAcrossServices(token: string): Promise<boolean> {
        const serviceChecks = Object.values(TEST_CONFIG.SERVICES).map(async service => {
            try {
                const response = await axios.get(`http://localhost:${service.port}/health`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                return response.status === 200;
            } catch (error) {
                return false;
            }
        });

        const results = await Promise.all(serviceChecks);
        return results.every(result => result === true);
    }
}

/**
 * End-to-End Testing Helper
 */
export class E2ETestHelper {
    constructor(private page: Page) { }

    async navigateToApp(appName: string): Promise<void> {
        const url = `${TEST_CONFIG.API_GATEWAY}/${appName}`;
        await this.page.goto(url);
        await this.page.waitForLoadState('networkidle');
    }

    async performLogin(username: string = 'testuser', password: string = 'testpass'): Promise<void> {
        await this.page.fill('[data-testid="username"]', username);
        await this.page.fill('[data-testid="password"]', password);
        await this.page.click('[data-testid="login-button"]');
        await this.page.waitForSelector('[data-testid="dashboard"]', { timeout: 10000 });
    }

    async testCrossAppNavigation(apps: string[]): Promise<void> {
        for (const app of apps) {
            await this.navigateToApp(app);
            await expect(this.page.locator('[data-testid="app-container"]')).toBeVisible();

            // Verify authentication state persists
            const userInfo = await this.page.locator('[data-testid="user-info"]');
            await expect(userInfo).toBeVisible();
        }
    }

    async testCompleteUserWorkflow(): Promise<void> {
        // Step 1: Authentication
        await this.navigateToApp('id');
        await this.performLogin();

        // Step 2: Create project in CODAI
        await this.navigateToApp('codai');
        await this.page.click('[data-testid="new-project"]');
        await this.page.fill('[data-testid="project-name"]', 'Integration Test Project');
        await this.page.click('[data-testid="create-project"]');
        await this.page.waitForSelector('[data-testid="project-created"]');

        // Step 3: Store data in MEMORAI
        await this.navigateToApp('memorai');
        await this.page.click('[data-testid="add-memory"]');
        await this.page.fill('[data-testid="memory-content"]', 'Test integration data');
        await this.page.click('[data-testid="save-memory"]');
        await this.page.waitForSelector('[data-testid="memory-saved"]');

        // Step 4: Analyze in ANALIZAI
        await this.navigateToApp('analizai');
        await this.page.click('[data-testid="analyze-data"]');
        await this.page.waitForSelector('[data-testid="analysis-complete"]', { timeout: 30000 });

        // Step 5: View results in HUB
        await this.navigateToApp('hub');
        await expect(this.page.locator('[data-testid="recent-activity"]')).toContainText('Integration Test Project');
    }

    async measurePagePerformance(): Promise<object> {
        const performanceEntries = await this.page.evaluate(() => {
            const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            return {
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
                firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
            };
        });
        return performanceEntries;
    }
}

/**
 * Service Communication Testing Helper
 */
export class ServiceCommunicationHelper {
    private authHeaders: object = {};

    constructor(private auth: IntegrationAuthHelper) { }

    async setAuth(username: string = 'testuser'): Promise<void> {
        this.authHeaders = this.auth.getAuthHeaders(username);
    }

    async testServiceToServiceCommunication(): Promise<boolean[]> {
        const communicationTests = [
            this.testCodaiToMemoraiCommunication(),
            this.testMemoraiToAnalizaiCommunication(),
            this.testHubToCodaiCommunication(),
            this.testBancaiToWalletCommunication(),
            this.testMarketaiToFabricaiCommunication()
        ];

        return Promise.all(communicationTests);
    }

    private async testCodaiToMemoraiCommunication(): Promise<boolean> {
        try {
            // Create project in CODAI
            const projectResponse = await axios.post(
                `${TEST_CONFIG.API_GATEWAY}/codai/projects`,
                { name: 'Service Test Project', description: 'Testing service communication' },
                { headers: this.authHeaders }
            );

            // Store project data in MEMORAI
            const memoryResponse = await axios.post(
                `${TEST_CONFIG.API_GATEWAY}/memorai/memories`,
                {
                    content: `Project: ${projectResponse.data.name}`,
                    type: 'project',
                    metadata: { projectId: projectResponse.data.id }
                },
                { headers: this.authHeaders }
            );

            return projectResponse.status === 201 && memoryResponse.status === 201;
        } catch (error) {
            console.error('CODAI to MEMORAI communication failed:', error);
            return false;
        }
    }

    private async testMemoraiToAnalizaiCommunication(): Promise<boolean> {
        try {
            // Get memories from MEMORAI
            const memoriesResponse = await axios.get(
                `${TEST_CONFIG.API_GATEWAY}/memorai/memories`,
                { headers: this.authHeaders }
            );

            // Analyze memories in ANALIZAI
            const analysisResponse = await axios.post(
                `${TEST_CONFIG.API_GATEWAY}/analizai/analyze`,
                { data: memoriesResponse.data, type: 'memory_analysis' },
                { headers: this.authHeaders }
            );

            return memoriesResponse.status === 200 && analysisResponse.status === 200;
        } catch (error) {
            console.error('MEMORAI to ANALIZAI communication failed:', error);
            return false;
        }
    }

    private async testHubToCodaiCommunication(): Promise<boolean> {
        try {
            // Get dashboard data from HUB
            const hubResponse = await axios.get(
                `${TEST_CONFIG.API_GATEWAY}/hub/dashboard`,
                { headers: this.authHeaders }
            );

            // Create project based on hub insights
            const projectResponse = await axios.post(
                `${TEST_CONFIG.API_GATEWAY}/codai/projects`,
                {
                    name: 'Hub Insight Project',
                    insights: hubResponse.data.insights
                },
                { headers: this.authHeaders }
            );

            return hubResponse.status === 200 && projectResponse.status === 201;
        } catch (error) {
            console.error('HUB to CODAI communication failed:', error);
            return false;
        }
    }

    private async testBancaiToWalletCommunication(): Promise<boolean> {
        try {
            // Create transaction in BANCAI
            const transactionResponse = await axios.post(
                `${TEST_CONFIG.API_GATEWAY}/bancai/transactions`,
                { amount: 100, currency: 'USD', type: 'test' },
                { headers: this.authHeaders }
            );

            // Update wallet balance
            const walletResponse = await axios.post(
                `${TEST_CONFIG.API_GATEWAY}/wallet/balance`,
                {
                    transactionId: transactionResponse.data.id,
                    amount: 100
                },
                { headers: this.authHeaders }
            );

            return transactionResponse.status === 201 && walletResponse.status === 200;
        } catch (error) {
            console.error('BANCAI to WALLET communication failed:', error);
            return false;
        }
    }

    private async testMarketaiToFabricaiCommunication(): Promise<boolean> {
        try {
            // Get market insights
            const marketResponse = await axios.get(
                `${TEST_CONFIG.API_GATEWAY}/marketai/insights`,
                { headers: this.authHeaders }
            );

            // Create products based on insights
            const fabricaiResponse = await axios.post(
                `${TEST_CONFIG.API_GATEWAY}/fabricai/products`,
                {
                    marketInsights: marketResponse.data,
                    productType: 'ai_generated'
                },
                { headers: this.authHeaders }
            );

            return marketResponse.status === 200 && fabricaiResponse.status === 201;
        } catch (error) {
            console.error('MARKETAI to FABRICAI communication failed:', error);
            return false;
        }
    }

    async testAPIGatewayRouting(): Promise<boolean> {
        const routingTests = Object.values(TEST_CONFIG.SERVICES).map(async service => {
            try {
                const response = await axios.get(`${TEST_CONFIG.API_GATEWAY}/${service.name}/health`);
                return response.status === 200;
            } catch (error) {
                return false;
            }
        });

        const results = await Promise.all(routingTests);
        return results.every(result => result === true);
    }
}

/**
 * Load Testing Helper
 */
export class LoadTestHelper {
    constructor(private auth: IntegrationAuthHelper) { }

    async simulateConcurrentUsers(userCount: number, duration: number): Promise<object> {
        const startTime = Date.now();
        const results = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            maxResponseTime: 0,
            minResponseTime: Infinity,
            responseTimes: [] as number[]
        };

        const userTasks = Array.from({ length: userCount }, (_, i) =>
            this.simulateUserSession(i, duration, results)
        );

        await Promise.all(userTasks);

        // Calculate final metrics
        results.averageResponseTime = results.responseTimes.length > 0
            ? results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length
            : 0;
        results.maxResponseTime = Math.max(...results.responseTimes);
        results.minResponseTime = Math.min(...results.responseTimes);

        return results;
    }

    private async simulateUserSession(userId: number, duration: number, results: any): Promise<void> {
        const endTime = Date.now() + (duration * 1000);
        const token = await this.auth.authenticateUser(`user${userId}`, 'testpass');
        const headers = { Authorization: `Bearer ${token}` };

        while (Date.now() < endTime) {
            await this.performRandomAction(headers, results);
            await this.sleep(Math.random() * 1000); // Random delay between actions
        }
    }

    private async performRandomAction(headers: object, results: any): Promise<void> {
        const actions = [
            () => this.testGetProjects(headers),
            () => this.testCreateMemory(headers),
            () => this.testGetDashboard(headers),
            () => this.testAnalyzeData(headers),
            () => this.testCreateTransaction(headers)
        ];

        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        const startTime = Date.now();

        try {
            await randomAction();
            results.successfulRequests++;
        } catch (error) {
            results.failedRequests++;
        } finally {
            const responseTime = Date.now() - startTime;
            results.responseTimes.push(responseTime);
            results.totalRequests++;
        }
    }

    private async testGetProjects(headers: object): Promise<void> {
        await axios.get(`${TEST_CONFIG.API_GATEWAY}/codai/projects`, { headers });
    }

    private async testCreateMemory(headers: object): Promise<void> {
        await axios.post(
            `${TEST_CONFIG.API_GATEWAY}/memorai/memories`,
            { content: 'Load test memory', type: 'test' },
            { headers }
        );
    }

    private async testGetDashboard(headers: object): Promise<void> {
        await axios.get(`${TEST_CONFIG.API_GATEWAY}/hub/dashboard`, { headers });
    }

    private async testAnalyzeData(headers: object): Promise<void> {
        await axios.post(
            `${TEST_CONFIG.API_GATEWAY}/analizai/analyze`,
            { data: 'test data', type: 'load_test' },
            { headers }
        );
    }

    private async testCreateTransaction(headers: object): Promise<void> {
        await axios.post(
            `${TEST_CONFIG.API_GATEWAY}/bancai/transactions`,
            { amount: Math.random() * 1000, currency: 'USD', type: 'test' },
            { headers }
        );
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * Resilience Testing Helper
 */
export class ResilienceTestHelper {
    constructor(private auth: IntegrationAuthHelper) { }

    async testServiceFailureRecovery(): Promise<object> {
        const results = {
            serviceFailureTests: [] as any[],
            overallResilience: 0
        };

        // Test individual service failures
        for (const [serviceName, serviceConfig] of Object.entries(TEST_CONFIG.SERVICES)) {
            const testResult = await this.testIndividualServiceFailure(serviceName, serviceConfig);
            results.serviceFailureTests.push(testResult);
        }

        // Test cascading failure scenarios
        const cascadingTest = await this.testCascadingFailures();
        results.serviceFailureTests.push(cascadingTest);

        // Calculate overall resilience score
        const passedTests = results.serviceFailureTests.filter(test => test.passed).length;
        results.overallResilience = passedTests / results.serviceFailureTests.length;

        return results;
    }

    private async testIndividualServiceFailure(serviceName: string, serviceConfig: any): Promise<object> {
        const token = await this.auth.authenticateUser();
        const headers = { Authorization: `Bearer ${token}` };

        try {
            // Test API Gateway routing when service is potentially down
            const response = await axios.get(
                `${TEST_CONFIG.API_GATEWAY}/${serviceConfig.name}/health`,
                {
                    headers,
                    timeout: 5000,
                    validateStatus: () => true // Accept any status code
                }
            );

            return {
                service: serviceName,
                passed: response.status === 200 || response.status === 503, // 503 is acceptable for circuit breaker
                responseTime: response.headers['x-response-time'] || 0,
                status: response.status
            };
        } catch (error: any) {
            return {
                service: serviceName,
                passed: false,
                error: error.message,
                responseTime: 0
            };
        }
    }

    private async testCascadingFailures(): Promise<object> {
        const token = await this.auth.authenticateUser();
        const headers = { Authorization: `Bearer ${token}` };

        try {
            // Test workflow that depends on multiple services
            const workflowResponse = await axios.post(
                `${TEST_CONFIG.API_GATEWAY}/hub/workflow`,
                {
                    workflow: 'create_analyze_store',
                    data: 'cascading test data'
                },
                { headers, timeout: 30000 }
            );

            return {
                service: 'cascading_workflow',
                passed: workflowResponse.status >= 200 && workflowResponse.status < 400,
                responseTime: workflowResponse.headers['x-response-time'] || 0,
                status: workflowResponse.status
            };
        } catch (error: any) {
            return {
                service: 'cascading_workflow',
                passed: error.response?.status === 503, // Graceful degradation
                error: error.message,
                responseTime: 0
            };
        }
    }

    async testErrorRecovery(): Promise<boolean[]> {
        const recoveryTests = [
            this.testTimeoutRecovery(),
            this.testRetryLogic(),
            this.testCircuitBreakerBehavior(),
            this.testGracefulDegradation()
        ];

        return Promise.all(recoveryTests);
    }

    private async testTimeoutRecovery(): Promise<boolean> {
        const token = await this.auth.authenticateUser();
        const headers = { Authorization: `Bearer ${token}` };

        try {
            // Make a request with very short timeout
            await axios.get(`${TEST_CONFIG.API_GATEWAY}/analizai/slow-operation`, {
                headers,
                timeout: 100 // Very short timeout to trigger timeout error
            });
            return false; // Should have timed out
        } catch (error: any) {
            return error.code === 'ECONNABORTED' || error.message.includes('timeout');
        }
    }

    private async testRetryLogic(): Promise<boolean> {
        const token = await this.auth.authenticateUser();
        const headers = { Authorization: `Bearer ${token}` };

        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
            try {
                await axios.get(`${TEST_CONFIG.API_GATEWAY}/codai/unreliable-endpoint`, {
                    headers,
                    timeout: 5000
                });
                return true; // Success on retry
            } catch (error) {
                attempts++;
                if (attempts >= maxAttempts) return false;
                await this.sleep(1000 * attempts); // Exponential backoff
            }
        }
        return false;
    }

    private async testCircuitBreakerBehavior(): Promise<boolean> {
        const token = await this.auth.authenticateUser();
        const headers = { Authorization: `Bearer ${token}` };

        // Make multiple failing requests to trigger circuit breaker
        const failingRequests = Array.from({ length: 10 }, () =>
            axios.get(`${TEST_CONFIG.API_GATEWAY}/fabricai/failing-endpoint`, {
                headers,
                validateStatus: () => true
            })
        );

        const responses = await Promise.all(failingRequests);

        // Check if circuit breaker activated (should return 503)
        const circuitBreakerActivated = responses.some(response => response.status === 503);
        return circuitBreakerActivated;
    }

    private async testGracefulDegradation(): Promise<boolean> {
        const token = await this.auth.authenticateUser();
        const headers = { Authorization: `Bearer ${token}` };

        try {
            // Test a service that should degrade gracefully when dependencies fail
            const response = await axios.get(`${TEST_CONFIG.API_GATEWAY}/hub/degraded-dashboard`, {
                headers,
                timeout: 10000
            });

            // Should return partial data with 206 status or full data with 200
            return response.status === 200 || response.status === 206;
        } catch (error) {
            return false;
        }
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * Deployment Testing Helper
 */
export class DeploymentTestHelper {
    async testDeploymentReadiness(): Promise<object> {
        const results = {
            healthChecks: await this.performHealthChecks(),
            configurationValidation: await this.validateConfiguration(),
            dependencyChecks: await this.checkDependencies(),
            securityValidation: await this.validateSecurity(),
            performanceBaseline: await this.establishPerformanceBaseline()
        };

        return results;
    }

    private async performHealthChecks(): Promise<object> {
        const healthResults = {};

        // Check API Gateway
        try {
            const gatewayResponse = await axios.get(`${TEST_CONFIG.API_GATEWAY}/health`);
            healthResults['gateway'] = gatewayResponse.status === 200;
        } catch (error) {
            healthResults['gateway'] = false;
        }

        // Check all services
        for (const [serviceName, serviceConfig] of Object.entries(TEST_CONFIG.SERVICES)) {
            try {
                const serviceResponse = await axios.get(`http://localhost:${serviceConfig.port}/health`);
                healthResults[serviceName] = serviceResponse.status === 200;
            } catch (error) {
                healthResults[serviceName] = false;
            }
        }

        return healthResults;
    }

    private async validateConfiguration(): Promise<object> {
        const configResults = {
            environmentVariables: this.checkEnvironmentVariables(),
            apiEndpoints: await this.validateApiEndpoints(),
            databaseConnections: await this.checkDatabaseConnections()
        };

        return configResults;
    }

    private checkEnvironmentVariables(): boolean {
        const requiredEnvVars = [
            'NODE_ENV',
            'JWT_SECRET',
            'DATABASE_URL',
            'REDIS_URL',
            'API_GATEWAY_PORT'
        ];

        return requiredEnvVars.every(envVar => process.env[envVar] !== undefined);
    }

    private async validateApiEndpoints(): Promise<boolean> {
        try {
            const response = await axios.get(`${TEST_CONFIG.API_GATEWAY}/api-docs`);
            return response.status === 200 && response.data.swagger;
        } catch (error) {
            return false;
        }
    }

    private async checkDatabaseConnections(): Promise<boolean> {
        try {
            const response = await axios.get(`${TEST_CONFIG.API_GATEWAY}/admin/database-status`);
            return response.status === 200 && response.data.connected === true;
        } catch (error) {
            return false;
        }
    }

    private async checkDependencies(): Promise<object> {
        const dependencyResults = {
            redis: await this.checkRedisConnection(),
            database: await this.checkDatabaseConnection(),
            messageQueue: await this.checkMessageQueue(),
            fileStorage: await this.checkFileStorage()
        };

        return dependencyResults;
    }

    private async checkRedisConnection(): Promise<boolean> {
        try {
            const response = await axios.get(`${TEST_CONFIG.API_GATEWAY}/admin/redis-status`);
            return response.data.connected === true;
        } catch (error) {
            return false;
        }
    }

    private async checkDatabaseConnection(): Promise<boolean> {
        try {
            const response = await axios.get(`${TEST_CONFIG.API_GATEWAY}/admin/db-status`);
            return response.data.connected === true;
        } catch (error) {
            return false;
        }
    }

    private async checkMessageQueue(): Promise<boolean> {
        try {
            const response = await axios.get(`${TEST_CONFIG.API_GATEWAY}/admin/queue-status`);
            return response.data.connected === true;
        } catch (error) {
            return false;
        }
    }

    private async checkFileStorage(): Promise<boolean> {
        try {
            const response = await axios.get(`${TEST_CONFIG.API_GATEWAY}/admin/storage-status`);
            return response.data.available === true;
        } catch (error) {
            return false;
        }
    }

    private async validateSecurity(): Promise<object> {
        const securityResults = {
            httpsEnabled: await this.checkHttpsConfiguration(),
            authenticationWorking: await this.testAuthentication(),
            corsConfigured: await this.checkCorsConfiguration(),
            rateLimitingActive: await this.testRateLimiting()
        };

        return securityResults;
    }

    private async checkHttpsConfiguration(): Promise<boolean> {
        // In test environment, HTTPS might not be enabled
        return process.env.NODE_ENV === 'test' || process.env.HTTPS_ENABLED === 'true';
    }

    private async testAuthentication(): Promise<boolean> {
        try {
            // Try to access protected endpoint without auth
            const unauthorizedResponse = await axios.get(
                `${TEST_CONFIG.API_GATEWAY}/admin/users`,
                { validateStatus: () => true }
            );

            return unauthorizedResponse.status === 401; // Should be unauthorized
        } catch (error) {
            return false;
        }
    }

    private async checkCorsConfiguration(): Promise<boolean> {
        try {
            const response = await axios.options(`${TEST_CONFIG.API_GATEWAY}/health`);
            return response.headers['access-control-allow-origin'] !== undefined;
        } catch (error) {
            return false;
        }
    }

    private async testRateLimiting(): Promise<boolean> {
        try {
            // Make rapid requests to trigger rate limiting
            const requests = Array.from({ length: 20 }, () =>
                axios.get(`${TEST_CONFIG.API_GATEWAY}/health`, { validateStatus: () => true })
            );

            const responses = await Promise.all(requests);
            const rateLimited = responses.some(response => response.status === 429);

            return rateLimited;
        } catch (error) {
            return false;
        }
    }

    private async establishPerformanceBaseline(): Promise<object> {
        const baselineResults = {
            averageResponseTime: 0,
            throughput: 0,
            memoryUsage: await this.getMemoryUsage(),
            cpuUsage: await this.getCpuUsage()
        };

        // Measure response times
        const startTime = Date.now();
        const requests = Array.from({ length: 10 }, () =>
            axios.get(`${TEST_CONFIG.API_GATEWAY}/health`)
        );

        await Promise.all(requests);
        const totalTime = Date.now() - startTime;

        baselineResults.averageResponseTime = totalTime / 10;
        baselineResults.throughput = 10000 / totalTime; // requests per second

        return baselineResults;
    }

    private async getMemoryUsage(): Promise<number> {
        try {
            const response = await axios.get(`${TEST_CONFIG.API_GATEWAY}/admin/metrics`);
            return response.data.memory?.used || 0;
        } catch (error) {
            return 0;
        }
    }

    private async getCpuUsage(): Promise<number> {
        try {
            const response = await axios.get(`${TEST_CONFIG.API_GATEWAY}/admin/metrics`);
            return response.data.cpu?.percentage || 0;
        } catch (error) {
            return 0;
        }
    }
}

/**
 * Real-time Communication Testing Helper
 */
export class RealTimeCommunicationHelper {
    private websocketConnections: Map<string, WebSocket> = new Map();
    private socketIoConnections: Map<string, Socket> = new Map();

    async testWebSocketCommunication(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const ws = new WebSocket(`ws://localhost:${TEST_CONFIG.SERVICES.HUB.port}/ws`);

            ws.on('open', () => {
                ws.send(JSON.stringify({ type: 'test', data: 'integration test' }));
            });

            ws.on('message', (data) => {
                const message = JSON.parse(data.toString());
                if (message.type === 'test_response') {
                    ws.close();
                    resolve(true);
                }
            });

            ws.on('error', () => {
                resolve(false);
            });

            // Timeout after 10 seconds
            setTimeout(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.close();
                }
                resolve(false);
            }, 10000);
        });
    }

    async testSocketIOCommunication(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const socket = io(`http://localhost:${TEST_CONFIG.SERVICES.HUB.port}`);

            socket.on('connect', () => {
                socket.emit('test_event', { data: 'integration test' });
            });

            socket.on('test_response', (data) => {
                socket.disconnect();
                resolve(true);
            });

            socket.on('error', () => {
                resolve(false);
            });

            // Timeout after 10 seconds
            setTimeout(() => {
                socket.disconnect();
                resolve(false);
            }, 10000);
        });
    }

    async testCrossServiceRealTimeSync(): Promise<boolean> {
        // Test real-time synchronization between MEMORAI and HUB
        const hubSocket = io(`http://localhost:${TEST_CONFIG.SERVICES.HUB.port}`);
        const memoraiSocket = io(`http://localhost:${TEST_CONFIG.SERVICES.MEMORAI.port}`);

        return new Promise((resolve) => {
            let hubReceived = false;
            let memoraiReceived = false;

            hubSocket.on('connect', () => {
                hubSocket.emit('subscribe', { channel: 'memory_updates' });
            });

            memoraiSocket.on('connect', () => {
                memoraiSocket.emit('create_memory', {
                    content: 'Real-time sync test',
                    type: 'integration_test'
                });
            });

            hubSocket.on('memory_created', (data) => {
                if (data.content === 'Real-time sync test') {
                    hubReceived = true;
                    if (memoraiReceived) {
                        hubSocket.disconnect();
                        memoraiSocket.disconnect();
                        resolve(true);
                    }
                }
            });

            memoraiSocket.on('memory_created', (data) => {
                if (data.content === 'Real-time sync test') {
                    memoraiReceived = true;
                    if (hubReceived) {
                        hubSocket.disconnect();
                        memoraiSocket.disconnect();
                        resolve(true);
                    }
                }
            });

            // Timeout after 15 seconds
            setTimeout(() => {
                hubSocket.disconnect();
                memoraiSocket.disconnect();
                resolve(false);
            }, 15000);
        });
    }
}
