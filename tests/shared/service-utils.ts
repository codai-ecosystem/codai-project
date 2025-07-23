/**
 * Service Utilities
 * Health check and service management utilities for real integration testing
 */

import { testConfig, TEST_CONSTANTS, REAL_DATA_EXPECTATIONS } from './test-config.js';

export interface HealthCheckResult {
    service: string;
    port: number;
    healthy: boolean;
    responseTime: number;
    endpoint: string;
    statusCode?: number;
    error?: string;
}

export interface ServiceStatus {
    service: string;
    status: 'running' | 'stopped' | 'unknown';
    port: number;
    baseUrl: string;
    healthCheck: HealthCheckResult;
}

/**
 * Health check utility for services
 */
export class HealthChecker {
    /**
     * Perform health check on a single service
     */
    static async checkService(serviceName: string): Promise<HealthCheckResult> {
        const config = await testConfig.initialize();
        const service = config.getService(serviceName);

        const healthConfig = config.getHealthCheckConfig();

        for (const endpoint of healthConfig.endpoints) {
            const result = await this.checkEndpoint(
                service.baseUrl,
                endpoint,
                serviceName
            );

            if (result.healthy) {
                return result;
            }
        }

        // If no endpoint passed, return the last result
        return this.checkEndpoint(service.baseUrl, '/', serviceName);
    }

    /**
     * Check a specific endpoint
     */
    static async checkEndpoint(
        baseUrl: string,
        endpoint: string,
        serviceName: string
    ): Promise<HealthCheckResult> {
        const startTime = Date.now();
        const url = `${baseUrl}${endpoint}`;

        try {
            const response = await fetch(url, {
                timeout: TEST_CONSTANTS.TIMEOUTS.API_REQUEST,
                signal: AbortSignal.timeout(TEST_CONSTANTS.TIMEOUTS.API_REQUEST)
            });

            const responseTime = Date.now() - startTime;
            const isHealthy = TEST_CONSTANTS.HEALTH_CHECK.ACCEPTABLE_CODES.includes(response.status);

            return {
                service: serviceName,
                port: parseInt(new URL(baseUrl).port),
                healthy: isHealthy,
                responseTime,
                endpoint,
                statusCode: response.status
            };
        } catch (error) {
            const responseTime = Date.now() - startTime;

            return {
                service: serviceName,
                port: parseInt(new URL(baseUrl).port),
                healthy: false,
                responseTime,
                endpoint,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Perform health checks on all services
     */
    static async checkAllServices(): Promise<HealthCheckResult[]> {
        const config = await testConfig.initialize();
        const serviceNames = config.getServiceNames();

        const healthPromises = serviceNames.map(service =>
            this.checkService(service)
        );

        return Promise.all(healthPromises);
    }

    /**
     * Wait for a service to become healthy
     */
    static async waitForService(
        serviceName: string,
        timeout: number = TEST_CONSTANTS.TIMEOUTS.HEALTH_CHECK
    ): Promise<HealthCheckResult> {
        const startTime = Date.now();

        while (Date.now() - startTime < timeout) {
            const result = await this.checkService(serviceName);

            if (result.healthy) {
                return result;
            }

            await this.delay(TEST_CONSTANTS.HEALTH_CHECK.INTERVAL);
        }

        throw new Error(
            `Service ${serviceName} did not become healthy within ${timeout}ms`
        );
    }

    /**
     * Wait for all services to become healthy
     */
    static async waitForAllServices(
        timeout: number = TEST_CONSTANTS.TIMEOUTS.HEALTH_CHECK
    ): Promise<HealthCheckResult[]> {
        const config = await testConfig.initialize();
        const serviceNames = config.getServiceNames();

        const healthPromises = serviceNames.map(service =>
            this.waitForService(service, timeout)
        );

        return Promise.all(healthPromises);
    }

    private static delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * API utility for making requests to services
 */
export class ApiClient {
    /**
     * Make API request with retries and proper error handling
     */
    static async request(
        serviceName: string,
        endpoint: string,
        options: RequestInit = {}
    ): Promise<Response> {
        const config = await testConfig.initialize();
        const baseUrl = config.getBaseUrl(serviceName);
        const url = `${baseUrl}${endpoint}`;

        const requestOptions: RequestInit = {
            timeout: TEST_CONSTANTS.TIMEOUTS.API_REQUEST,
            signal: AbortSignal.timeout(TEST_CONSTANTS.TIMEOUTS.API_REQUEST),
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= TEST_CONSTANTS.RETRY.MAX_ATTEMPTS; attempt++) {
            try {
                const response = await fetch(url, requestOptions);

                // Log request for debugging
                console.log(`📡 API Request: ${requestOptions.method || 'GET'} ${url} -> ${response.status}`);

                return response;
            } catch (error) {
                lastError = error instanceof Error ? error : new Error('Unknown error');

                if (attempt < TEST_CONSTANTS.RETRY.MAX_ATTEMPTS) {
                    const delay = TEST_CONSTANTS.RETRY.DELAY * Math.pow(TEST_CONSTANTS.RETRY.BACKOFF_MULTIPLIER, attempt - 1);
                    console.log(`⚠️  API request failed (attempt ${attempt}), retrying in ${delay}ms...`);
                    await this.delay(delay);
                }
            }
        }

        throw new Error(
            `API request failed after ${TEST_CONSTANTS.RETRY.MAX_ATTEMPTS} attempts: ${lastError?.message}`
        );
    }

    /**
     * GET request
     */
    static async get(serviceName: string, endpoint: string): Promise<Response> {
        return this.request(serviceName, endpoint, { method: 'GET' });
    }

    /**
     * POST request
     */
    static async post(
        serviceName: string,
        endpoint: string,
        data?: any
    ): Promise<Response> {
        return this.request(serviceName, endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined
        });
    }

    /**
     * PUT request
     */
    static async put(
        serviceName: string,
        endpoint: string,
        data?: any
    ): Promise<Response> {
        return this.request(serviceName, endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined
        });
    }

    /**
     * DELETE request
     */
    static async delete(serviceName: string, endpoint: string): Promise<Response> {
        return this.request(serviceName, endpoint, { method: 'DELETE' });
    }

    private static delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * Real data validation utilities
 */
export class RealDataValidator {
    /**
     * Validate that response contains real data, not mock data
     */
    static validateRealData(data: any, serviceName: string): void {
        // Check for common mock data indicators
        this.checkNotMockData(data);

        // Service-specific real data validation
        switch (serviceName) {
            case 'memorai':
                this.validateMemoraiData(data);
                break;
            default:
                this.validateGenericRealData(data);
                break;
        }
    }

    /**
     * Check that data doesn't contain mock indicators
     */
    private static checkNotMockData(data: any): void {
        const dataString = JSON.stringify(data).toLowerCase();

        const mockIndicators = [
            'mock',
            'fake',
            'test-',
            'dummy',
            'sample',
            'placeholder',
            'lorem ipsum',
            '12345',
            'example.com',
            'test@test.com'
        ];

        for (const indicator of mockIndicators) {
            if (dataString.includes(indicator)) {
                console.warn(`⚠️  Potential mock data detected: contains "${indicator}"`);
            }
        }
    }

    /**
     * Validate MemorAI real data structure
     */
    private static validateMemoraiData(data: any): void {
        const expectations = REAL_DATA_EXPECTATIONS.MEMORAI.STATS;

        // Validate structure matches real MCP data, not mock structure
        if (expectations.expectDynamic) {
            if (typeof data.totalMemories !== 'number') {
                throw new Error('MemorAI data should contain real totalMemories number');
            }

            if (data.totalMemories < expectations.minimumMemories) {
                throw new Error(`MemorAI totalMemories should be >= ${expectations.minimumMemories}`);
            }
        }

        // Check for real timestamps if present
        if (REAL_DATA_EXPECTATIONS.API_RESPONSES.expectRealTimestamps) {
            this.validateTimestamps(data);
        }
    }

    /**
     * Validate generic real data characteristics
     */
    private static validateGenericRealData(data: any): void {
        if (REAL_DATA_EXPECTATIONS.API_RESPONSES.expectRealTimestamps) {
            this.validateTimestamps(data);
        }

        if (REAL_DATA_EXPECTATIONS.API_RESPONSES.expectUniqueIds) {
            this.validateUniqueIds(data);
        }
    }

    /**
     * Validate timestamps are real (not hardcoded)
     */
    private static validateTimestamps(data: any): void {
        const timestampFields = ['timestamp', 'createdAt', 'updatedAt', 'date'];

        for (const field of timestampFields) {
            if (data[field]) {
                const timestamp = new Date(data[field]).getTime();
                const now = Date.now();
                const oneYearAgo = now - (365 * 24 * 60 * 60 * 1000);

                if (timestamp < oneYearAgo || timestamp > now + 60000) {
                    console.warn(`⚠️  Timestamp ${field} seems unrealistic: ${data[field]}`);
                }
            }
        }
    }

    /**
     * Validate IDs are unique (not hardcoded)
     */
    private static validateUniqueIds(data: any): void {
        const idFields = ['id', '_id', 'uuid', 'key'];
        const commonTestIds = ['1', '123', 'test', 'sample'];

        for (const field of idFields) {
            if (data[field] && commonTestIds.includes(String(data[field]))) {
                console.warn(`⚠️  ID ${field} appears to be hardcoded test data: ${data[field]}`);
            }
        }
    }
}

/**
 * Test utilities for service management
 */
export class ServiceManager {
    /**
     * Get comprehensive service status
     */
    static async getServiceStatus(serviceName: string): Promise<ServiceStatus> {
        const config = await testConfig.initialize();
        const service = config.getService(serviceName);
        const healthCheck = await HealthChecker.checkService(serviceName);

        return {
            service: serviceName,
            status: healthCheck.healthy ? 'running' : 'stopped',
            port: service.port,
            baseUrl: service.baseUrl,
            healthCheck
        };
    }

    /**
     * Get status for all services
     */
    static async getAllServiceStatus(): Promise<ServiceStatus[]> {
        const config = await testConfig.initialize();
        const serviceNames = config.getServiceNames();

        const statusPromises = serviceNames.map(service =>
            this.getServiceStatus(service)
        );

        return Promise.all(statusPromises);
    }

    /**
     * Ensure services are ready for testing
     */
    static async ensureServicesReady(): Promise<void> {
        console.log('🔍 Checking service readiness...');

        const statuses = await this.getAllServiceStatus();
        const healthyServices = statuses.filter(s => s.status === 'running');

        console.log(`📊 Service Status: ${healthyServices.length}/${statuses.length} services healthy`);

        if (healthyServices.length === 0) {
            throw new Error(
                'No services are running. Please start the services using test infrastructure or manually.'
            );
        }

        if (healthyServices.length < statuses.length * 0.5) {
            console.warn(
                `⚠️  Only ${healthyServices.length}/${statuses.length} services are healthy. ` +
                'Some tests may fail.'
            );
        }

        // Log service details
        statuses.forEach(status => {
            const icon = status.status === 'running' ? '✅' : '❌';
            console.log(`   ${icon} ${status.service}: ${status.baseUrl} (${status.healthCheck.responseTime}ms)`);
        });
    }
}

export default {
    HealthChecker,
    ApiClient,
    RealDataValidator,
    ServiceManager
};
