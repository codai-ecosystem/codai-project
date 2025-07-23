/**
 * Centralized Test Configuration
 * Real integration testing configuration with dynamic service discovery
 */

import PortDiscovery from '../../scripts/port-discovery.js';

interface ServiceConfig {
    port: number;
    baseUrl: string;
    source: string;
    isRunning: boolean;
}

interface DiscoveryInfo {
    timestamp: string;
    discoveredCount: number;
    totalCount: number;
    successRate: number;
}

interface TestConfigData {
    services: Record<string, ServiceConfig>;
    baseUrls: Record<string, string>;
    healthCheck: {
        timeout: number;
        interval: number;
        endpoints: string[];
    };
    discovery: DiscoveryInfo;
}

export class TestConfig {
    private discovery: PortDiscovery;
    private config: TestConfigData | null;
    private initialized: boolean;

    constructor() {
        this.discovery = new PortDiscovery();
        this.config = null;
        this.initialized = false;
    }

    /**
     * Initialize test configuration with service discovery
     */
    async initialize() {
        if (this.initialized) return this.config;

        console.log('🔍 Initializing test configuration with service discovery...');

        try {
            this.config = await this.discovery.generateTestConfig();
            this.initialized = true;

            console.log(`✅ Test configuration initialized: ${this.config.discovery.discoveredCount}/${this.config.discovery.totalCount} services discovered`);

            return this.config;
        } catch (error) {
            console.error('❌ Failed to initialize test configuration:', error.message);
            throw error;
        }
    }

    /**
     * Get service configuration
     */
    getService(serviceName: string): ServiceConfig {
        if (!this.initialized || !this.config) {
            throw new Error('Test configuration not initialized. Call initialize() first.');
        }

        const service = this.config.services[serviceName];
        if (!service) {
            throw new Error(`Service '${serviceName}' not found in configuration`);
        }

        return service;
    }

    /**
     * Get base URL for a service
     */
    getBaseUrl(serviceName: string): string {
        const service = this.getService(serviceName);
        return service.baseUrl;
    }

    /**
     * Get all service base URLs
     */
    getAllBaseUrls(): Record<string, string> {
        if (!this.initialized || !this.config) {
            throw new Error('Test configuration not initialized. Call initialize() first.');
        }

        return this.config.baseUrls;
    }

    /**
     * Check if a service is currently running
     */
    isServiceRunning(serviceName: string): boolean {
        const service = this.getService(serviceName);
        return service.isRunning;
    }

    /**
     * Get health check configuration
     */
    getHealthCheckConfig() {
        if (!this.initialized || !this.config) {
            throw new Error('Test configuration not initialized. Call initialize() first.');
        }

        return this.config.healthCheck;
    }

    /**
     * Get all service names
     */
    getServiceNames(): string[] {
        if (!this.initialized || !this.config) {
            throw new Error('Test configuration not initialized. Call initialize() first.');
        }

        return Object.keys(this.config.services);
    }

    /**
     * Get discovery metadata
     */
    getDiscoveryInfo(): DiscoveryInfo {
        if (!this.initialized || !this.config) {
            throw new Error('Test configuration not initialized. Call initialize() first.');
        }

        return this.config.discovery;
    }

    /**
     * Check if configuration is initialized
     */
    isInitialized(): boolean {
        return this.initialized;
    }

    /**
     * Validate configuration is ready for testing
     */
    async validateConfiguration() {
        if (!this.initialized) {
            await this.initialize();
        }

        const validation = await this.discovery.validatePorts();

        return {
            isValid: validation.accessible > 0,
            accessibleServices: validation.accessible,
            totalServices: validation.total,
            details: validation.details,
            readyForTesting: validation.accessible >= Math.ceil(validation.total * 0.5) // At least 50% accessible
        };
    }
}

// Static configuration constants
export const TEST_CONSTANTS = {
    TIMEOUTS: {
        HEALTH_CHECK: 60000,
        API_REQUEST: 30000,
        SERVICE_STARTUP: 120000,
        TEST_SUITE: 300000
    },

    RETRY: {
        MAX_ATTEMPTS: 3,
        DELAY: 2000,
        BACKOFF_MULTIPLIER: 2
    },

    HEALTH_CHECK: {
        ENDPOINTS: ['/', '/api/health', '/health', '/api/status'],
        ACCEPTABLE_CODES: [200, 404], // 404 means server is running
        INTERVAL: 2000
    },

    EXPECTED_SERVICES: ['codai', 'admin', 'hub', 'id', 'bancai', 'memorai']
};

// Primary services that must be running for tests
export const PRIMARY_SERVICES = {
    CODAI: 'codai',
    ADMIN: 'admin',
    HUB: 'hub',
    ID: 'id',
    BANCAI: 'bancai',
    MEMORAI: 'memorai'
};

// Test data expectations for real data testing
export const REAL_DATA_EXPECTATIONS = {
    MEMORAI: {
        STATS: {
            // Expect real MCP data structure, not mock
            structure: {
                hasMemories: 'boolean',
                totalMemories: 'number',
                recentMemories: 'array',
                memoryTypes: 'object'
            },
            minimumMemories: 0, // Real data can start from 0
            expectDynamic: true // Data should change based on real usage
        }
    },

    API_RESPONSES: {
        // Real APIs should return actual data, not hardcoded responses
        expectRealTimestamps: true,
        expectUniqueIds: true,
        expectDynamicContent: true
    }
};

// Default test configuration (fallback)
export const DEFAULT_TEST_CONFIG = {
    services: {
        codai: { port: 4001, baseUrl: 'http://localhost:4001' },
        admin: { port: 4002, baseUrl: 'http://localhost:4002' },
        hub: { port: 4003, baseUrl: 'http://localhost:4003' },
        id: { port: 4004, baseUrl: 'http://localhost:4004' },
        bancai: { port: 4005, baseUrl: 'http://localhost:4005' },
        memorai: { port: 4006, baseUrl: 'http://localhost:4006' }
    },
    baseUrls: {
        codai: 'http://localhost:4001',
        admin: 'http://localhost:4002',
        hub: 'http://localhost:4003',
        id: 'http://localhost:4004',
        bancai: 'http://localhost:4005',
        memorai: 'http://localhost:4006'
    }
};

// Global test configuration instance
export const testConfig = new TestConfig();

// Helper function to ensure configuration is ready
export async function ensureTestConfig(): Promise<TestConfig> {
    if (!testConfig.isInitialized()) {
        await testConfig.initialize();
    }
    return testConfig;
}

// Helper function for test setup
export async function setupTestEnvironment() {
    console.log('🚀 Setting up test environment...');

    const config = await ensureTestConfig();
    const validation = await config.validateConfiguration();

    if (!validation.readyForTesting) {
        throw new Error(
            `Test environment not ready: ${validation.accessibleServices}/${validation.totalServices} services accessible. ` +
            'Please start the required services or run test infrastructure setup.'
        );
    }

    console.log(`✅ Test environment ready: ${validation.accessibleServices} services accessible`);
    return config;
}

export default TestConfig;
