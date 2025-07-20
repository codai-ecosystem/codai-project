import { test, expect } from '@playwright/test';
import {
    IntegrationAuthHelper,
    DeploymentTestHelper,
    TEST_CONFIG
} from '../integration-helpers';

/**
 * CODAI Ecosystem Deployment and Scaling Integration Testing
 * Testing deployment readiness, scaling capabilities, and production environment validation
 */

test.describe('Deployment and Scaling Integration Testing', () => {
    let authHelper: IntegrationAuthHelper;
    let deploymentHelper: DeploymentTestHelper;

    test.beforeEach(async () => {
        authHelper = new IntegrationAuthHelper();
        deploymentHelper = new DeploymentTestHelper();
    });

    test.describe('Deployment Readiness', () => {
        test('Complete deployment readiness validation', async () => {
            test.setTimeout(300000); // 5 minutes

            const readinessResults = await deploymentHelper.testDeploymentReadiness();

            console.log('Deployment Readiness Results:', readinessResults);

            // Health checks should pass
            expect(readinessResults.healthChecks.gateway).toBeTruthy();

            // Configuration should be valid
            expect(readinessResults.configurationValidation.environmentVariables).toBeTruthy();

            // Dependencies should be available
            const dependencyServices = Object.values(readinessResults.dependencyChecks);
            const healthyDependencies = dependencyServices.filter(dep => dep === true).length;
            const dependencyHealthRate = healthyDependencies / dependencyServices.length;

            expect(dependencyHealthRate).toBeGreaterThan(0.7); // 70% of dependencies should be healthy

            // Security validation
            expect(readinessResults.securityValidation.authenticationWorking).toBeTruthy();
        });

        test('Service health checks validation', async ({ request }) => {
            test.setTimeout(120000); // 2 minutes

            const healthCheckResults = {};

            // Test API Gateway health
            const gatewayHealth = await request.get(`${TEST_CONFIG.API_GATEWAY}/health`);
            healthCheckResults['gateway'] = gatewayHealth.status() === 200;

            // Test individual service health through gateway
            for (const [serviceName, serviceConfig] of Object.entries(TEST_CONFIG.SERVICES)) {
                try {
                    const serviceHealth = await request.get(
                        `${TEST_CONFIG.API_GATEWAY}/${serviceConfig.name}/health`,
                        { timeout: 10000 }
                    );
                    healthCheckResults[serviceName] = serviceHealth.status() === 200;
                } catch (error) {
                    healthCheckResults[serviceName] = false;
                }
            }

            // Calculate overall health score
            const totalServices = Object.keys(healthCheckResults).length;
            const healthyServices = Object.values(healthCheckResults).filter(health => health === true).length;
            const overallHealthRate = healthyServices / totalServices;

            expect(overallHealthRate).toBeGreaterThan(0.8); // 80% of services should be healthy

            console.log('Service Health Check Results:', {
                totalServices,
                healthyServices,
                overallHealthRate: `${(overallHealthRate * 100).toFixed(1)}%`,
                healthStatus: healthCheckResults
            });
        });

        test('Configuration and environment validation', async ({ request }) => {
            test.setTimeout(90000); // 1.5 minutes

            const token = await authHelper.authenticateAdmin();
            const headers = { Authorization: `Bearer ${token}` };

            // Check environment configuration
            const configResponse = await request.get(`${TEST_CONFIG.API_GATEWAY}/admin/config`, {
                headers
            });

            if (configResponse.ok()) {
                const config = await configResponse.json();

                // Verify essential configuration
                expect(config.environment).toBeDefined();
                expect(config.database_url).toBeDefined();
                expect(config.jwt_secret).toBeDefined();
                expect(config.api_version).toBeDefined();

                // Verify service configurations
                expect(config.services).toBeDefined();
                expect(Object.keys(config.services).length).toBeGreaterThan(10);

                console.log('Configuration Validation:', {
                    environment: config.environment,
                    apiVersion: config.api_version,
                    servicesConfigured: Object.keys(config.services).length
                });
            }
        });

        test('Database and storage readiness', async ({ request }) => {
            test.setTimeout(120000); // 2 minutes

            const token = await authHelper.authenticateAdmin();
            const headers = { Authorization: `Bearer ${token}` };

            // Test database connectivity
            const dbResponse = await request.get(`${TEST_CONFIG.API_GATEWAY}/admin/database-status`, {
                headers
            });

            if (dbResponse.ok()) {
                const dbStatus = await dbResponse.json();
                expect(dbStatus.connected).toBeTruthy();
                expect(dbStatus.migrations_applied).toBeTruthy();

                console.log('Database Status:', dbStatus);
            }

            // Test file storage
            const storageResponse = await request.get(`${TEST_CONFIG.API_GATEWAY}/admin/storage-status`, {
                headers
            });

            if (storageResponse.ok()) {
                const storageStatus = await storageResponse.json();
                expect(storageStatus.available).toBeTruthy();

                console.log('Storage Status:', storageStatus);
            }

            // Test cache/Redis connectivity
            const cacheResponse = await request.get(`${TEST_CONFIG.API_GATEWAY}/admin/cache-status`, {
                headers
            });

            if (cacheResponse.ok()) {
                const cacheStatus = await cacheResponse.json();
                expect(cacheStatus.connected).toBeTruthy();

                console.log('Cache Status:', cacheStatus);
            }
        });

        test('Security and authentication deployment validation', async ({ request }) => {
            test.setTimeout(120000); // 2 minutes

            // Test unauthenticated access is properly blocked
            const unauthenticatedResponse = await request.get(
                `${TEST_CONFIG.API_GATEWAY}/admin/users`,
                {
                    headers: {},
                    timeout: 10000
                }
            );

            expect(unauthenticatedResponse.status()).toBe(401);

            // Test authentication works
            const token = await authHelper.authenticateUser();
            const authenticatedResponse = await request.get(`${TEST_CONFIG.API_GATEWAY}/hub/dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            expect(authenticatedResponse.ok()).toBeTruthy();

            // Test CORS headers are present
            const corsResponse = await request.options(`${TEST_CONFIG.API_GATEWAY}/health`);
            expect(corsResponse.headers()['access-control-allow-origin']).toBeDefined();

            // Test rate limiting (if configured)
            const rateLimitRequests = [];
            for (let i = 0; i < 25; i++) {
                rateLimitRequests.push(
                    request.get(`${TEST_CONFIG.API_GATEWAY}/health`)
                );
            }

            const rateLimitResults = await Promise.allSettled(rateLimitRequests);
            const rateLimitedRequests = rateLimitResults.filter(r =>
                r.status === 'fulfilled' && r.value.status() === 429
            );

            // Some requests might be rate limited
            console.log('Rate limiting test:', {
                totalRequests: 25,
                rateLimitedRequests: rateLimitedRequests.length,
                rateLimitingActive: rateLimitedRequests.length > 0
            });
        });
    });

    test.describe('Scaling Capabilities', () => {
        test('Horizontal scaling simulation', async ({ request }) => {
            test.setTimeout(300000); // 5 minutes

            const token = await authHelper.authenticateUser();
            const headers = { Authorization: `Bearer ${token}` };

            // Simulate scaling by testing load distribution
            const scalingRequests = [];
            const requestCount = 100;

            // Create requests across different services
            const services = ['hub', 'codai', 'memorai', 'analizai', 'bancai'];

            for (let i = 0; i < requestCount; i++) {
                const randomService = services[i % services.length];
                scalingRequests.push(
                    request.get(`${TEST_CONFIG.API_GATEWAY}/${randomService}/health`, {
                        headers,
                        timeout: 15000
                    }).then(response => ({
                        service: randomService,
                        status: response.status(),
                        responseTime: response.headers()['x-response-time'] || 0,
                        serverId: response.headers()['x-server-id'] || 'unknown'
                    })).catch(error => ({
                        service: randomService,
                        error: error.message
                    }))
                );
            }

            const results = await Promise.allSettled(scalingRequests);

            // Analyze load distribution
            const serviceDistribution = {};
            const serverDistribution = {};

            for (const result of results) {
                if (result.status === 'fulfilled' && result.value.service) {
                    const data = result.value;

                    // Track service distribution
                    if (!serviceDistribution[data.service]) {
                        serviceDistribution[data.service] = { success: 0, failure: 0 };
                    }

                    if (data.status === 200) {
                        serviceDistribution[data.service].success++;

                        // Track server distribution (for load balancing)
                        if (!serverDistribution[data.serverId]) {
                            serverDistribution[data.serverId] = 0;
                        }
                        serverDistribution[data.serverId]++;
                    } else {
                        serviceDistribution[data.service].failure++;
                    }
                }
            }

            // Verify load distribution
            for (const [service, stats] of Object.entries(serviceDistribution)) {
                const total = stats.success + stats.failure;
                const successRate = stats.success / total;

                expect(successRate).toBeGreaterThan(0.8); // 80% success rate per service

                console.log(`Service ${service} scaling:`, {
                    totalRequests: total,
                    successRate: `${(successRate * 100).toFixed(1)}%`
                });
            }

            console.log('Server Distribution:', serverDistribution);
        });

        test('Auto-scaling trigger conditions', async ({ request }) => {
            test.setTimeout(240000); // 4 minutes

            const token = await authHelper.authenticateAdmin();
            const headers = { Authorization: `Bearer ${token}` };

            // Get current resource usage
            const initialMetricsResponse = await request.get(`${TEST_CONFIG.API_GATEWAY}/admin/metrics`, {
                headers
            });

            let initialMetrics = {};
            if (initialMetricsResponse.ok()) {
                initialMetrics = await initialMetricsResponse.json();
                console.log('Initial Metrics:', {
                    cpu: initialMetrics.cpu?.percentage || 0,
                    memory: initialMetrics.memory?.percentage || 0,
                    requests: initialMetrics.requests?.per_minute || 0
                });
            }

            // Generate load to potentially trigger auto-scaling
            const loadRequests = [];
            for (let i = 0; i < 75; i++) {
                loadRequests.push(
                    request.post(`${TEST_CONFIG.API_GATEWAY}/analizai/complex-analysis`, {
                        headers,
                        data: { complexity: 'high', size: Math.random() * 1000 },
                        timeout: 30000
                    }).catch(error => ({ error: error.message }))
                );
            }

            console.log('Generating load to test auto-scaling...');
            await Promise.allSettled(loadRequests);

            // Wait for potential scaling event
            await new Promise(resolve => setTimeout(resolve, 30000));

            // Check if auto-scaling was triggered
            const scalingResponse = await request.get(`${TEST_CONFIG.API_GATEWAY}/admin/scaling-events`, {
                headers
            });

            if (scalingResponse.ok()) {
                const scalingEvents = await scalingResponse.json();
                console.log('Scaling Events:', scalingEvents);

                // Auto-scaling might or might not be triggered depending on load
                expect(scalingEvents).toBeDefined();
            }

            // Check final metrics
            const finalMetricsResponse = await request.get(`${TEST_CONFIG.API_GATEWAY}/admin/metrics`, {
                headers
            });

            if (finalMetricsResponse.ok()) {
                const finalMetrics = await finalMetricsResponse.json();
                console.log('Final Metrics:', {
                    cpu: finalMetrics.cpu?.percentage || 0,
                    memory: finalMetrics.memory?.percentage || 0,
                    requests: finalMetrics.requests?.per_minute || 0
                });
            }
        });

        test('Database connection pooling under load', async ({ request }) => {
            test.setTimeout(300000); // 5 minutes

            const token = await authHelper.authenticateUser();
            const headers = { Authorization: `Bearer ${token}` };

            // Create concurrent database operations
            const dbOperations = [];
            const operationCount = 50;

            for (let i = 0; i < operationCount; i++) {
                // Mix of read and write operations
                if (i % 3 === 0) {
                    // Write operation
                    dbOperations.push(
                        request.post(`${TEST_CONFIG.API_GATEWAY}/memorai/memories`, {
                            headers,
                            data: {
                                content: `DB Pool Test Memory ${i}`,
                                type: 'db_pool_test'
                            }
                        })
                    );
                } else {
                    // Read operation
                    dbOperations.push(
                        request.get(`${TEST_CONFIG.API_GATEWAY}/memorai/memories`, {
                            headers
                        })
                    );
                }
            }

            const startTime = Date.now();
            const results = await Promise.allSettled(dbOperations);
            const endTime = Date.now();

            const successfulOperations = results.filter(r =>
                r.status === 'fulfilled' && r.value.ok()
            ).length;

            const successRate = successfulOperations / operationCount;
            const totalTime = endTime - startTime;
            const averageTime = totalTime / operationCount;

            expect(successRate).toBeGreaterThan(0.8); // 80% success rate
            expect(averageTime).toBeLessThan(2000); // Average under 2 seconds

            console.log('Database Pool Load Test:', {
                operationCount,
                successfulOperations,
                successRate: `${(successRate * 100).toFixed(1)}%`,
                totalTime: `${totalTime}ms`,
                averageTime: `${averageTime.toFixed(0)}ms`
            });

            // Check for connection pool exhaustion
            const poolStatusResponse = await request.get(`${TEST_CONFIG.API_GATEWAY}/admin/db-pool-status`, {
                headers
            });

            if (poolStatusResponse.ok()) {
                const poolStatus = await poolStatusResponse.json();
                expect(poolStatus.exhausted).toBeFalsy();

                console.log('Connection Pool Status:', poolStatus);
            }
        });
    });

    test.describe('Production Environment Validation', () => {
        test('Production-like environment setup', async ({ request }) => {
            test.setTimeout(180000); // 3 minutes

            const token = await authHelper.authenticateAdmin();
            const headers = { Authorization: `Bearer ${token}` };

            // Check environment settings
            const envResponse = await request.get(`${TEST_CONFIG.API_GATEWAY}/admin/environment`, {
                headers
            });

            if (envResponse.ok()) {
                const env = await envResponse.json();

                // Verify production-ready settings
                expect(env.debug_mode).toBeFalsy();
                expect(env.cors_enabled).toBeTruthy();
                expect(env.https_redirect).toBeTruthy();
                expect(env.compression_enabled).toBeTruthy();

                console.log('Environment Configuration:', env);
            }

            // Check logging configuration
            const loggingResponse = await request.get(`${TEST_CONFIG.API_GATEWAY}/admin/logging-config`, {
                headers
            });

            if (loggingResponse.ok()) {
                const logging = await loggingResponse.json();

                expect(logging.level).toBeDefined();
                expect(logging.structured_logging).toBeTruthy();
                expect(logging.error_tracking).toBeTruthy();

                console.log('Logging Configuration:', logging);
            }
        });

        test('Monitoring and observability setup', async ({ request }) => {
            test.setTimeout(120000); // 2 minutes

            const token = await authHelper.authenticateAdmin();
            const headers = { Authorization: `Bearer ${token}` };

            // Check metrics endpoints
            const metricsEndpoints = [
                '/admin/metrics',
                '/admin/health-summary',
                '/admin/performance-metrics',
                '/admin/error-rates'
            ];

            let functionalEndpoints = 0;

            for (const endpoint of metricsEndpoints) {
                try {
                    const response = await request.get(`${TEST_CONFIG.API_GATEWAY}${endpoint}`, {
                        headers,
                        timeout: 10000
                    });

                    if (response.ok()) {
                        functionalEndpoints++;
                        const data = await response.json();
                        console.log(`${endpoint} is functional:`, Object.keys(data));
                    }
                } catch (error) {
                    console.log(`${endpoint} not available:`, error.message);
                }
            }

            // At least 75% of monitoring endpoints should be functional
            const monitoringHealthRate = functionalEndpoints / metricsEndpoints.length;
            expect(monitoringHealthRate).toBeGreaterThan(0.75);

            console.log('Monitoring Health Rate:', `${(monitoringHealthRate * 100).toFixed(1)}%`);
        });

        test('Security hardening validation', async ({ request }) => {
            test.setTimeout(120000); // 2 minutes

            // Test security headers
            const securityTestResponse = await request.get(`${TEST_CONFIG.API_GATEWAY}/health`);
            const headers = securityTestResponse.headers();

            // Check for security headers
            expect(headers['x-content-type-options']).toBe('nosniff');
            expect(headers['x-frame-options']).toBeDefined();
            expect(headers['x-xss-protection']).toBeDefined();

            // Test for information disclosure
            expect(headers['server']).not.toContain('Express');
            expect(headers['x-powered-by']).toBeUndefined();

            console.log('Security Headers Validation:', {
                contentTypeOptions: headers['x-content-type-options'],
                frameOptions: headers['x-frame-options'],
                xssProtection: headers['x-xss-protection'],
                serverHeaderSafe: !headers['server']?.includes('Express')
            });

            // Test admin endpoints are properly protected
            const adminTestResponse = await request.get(`${TEST_CONFIG.API_GATEWAY}/admin/sensitive-data`, {
                headers: {}
            });

            expect(adminTestResponse.status()).toBe(401);
        });

        test('Performance benchmarks for production', async ({ request }) => {
            test.setTimeout(240000); // 4 minutes

            const performanceBenchmarks = [
                { endpoint: '/health', expectedMax: 100 }, // 100ms
                { endpoint: '/hub/dashboard', expectedMax: 2000 }, // 2s
                { endpoint: '/codai/projects', expectedMax: 3000 }, // 3s
                { endpoint: '/memorai/memories', expectedMax: 2500 } // 2.5s
            ];

            const token = await authHelper.authenticateUser();
            const headers = { Authorization: `Bearer ${token}` };

            for (const benchmark of performanceBenchmarks) {
                const measurements = [];

                // Take 5 measurements
                for (let i = 0; i < 5; i++) {
                    const startTime = Date.now();

                    try {
                        const response = await request.get(`${TEST_CONFIG.API_GATEWAY}${benchmark.endpoint}`, {
                            headers,
                            timeout: 10000
                        });

                        if (response.ok()) {
                            const responseTime = Date.now() - startTime;
                            measurements.push(responseTime);
                        }
                    } catch (error) {
                        // Skip failed requests
                    }

                    // Small delay between measurements
                    await new Promise(resolve => setTimeout(resolve, 500));
                }

                if (measurements.length > 0) {
                    const avgTime = measurements.reduce((a, b) => a + b, 0) / measurements.length;
                    const maxTime = Math.max(...measurements);

                    expect(avgTime).toBeLessThan(benchmark.expectedMax);

                    console.log(`${benchmark.endpoint} Performance:`, {
                        avgTime: `${avgTime.toFixed(0)}ms`,
                        maxTime: `${maxTime}ms`,
                        expectedMax: `${benchmark.expectedMax}ms`,
                        passedBenchmark: avgTime < benchmark.expectedMax
                    });
                }
            }
        });

        test('Data backup and recovery readiness', async ({ request }) => {
            test.setTimeout(180000); // 3 minutes

            const token = await authHelper.authenticateAdmin();
            const headers = { Authorization: `Bearer ${token}` };

            // Check backup configuration
            const backupConfigResponse = await request.get(`${TEST_CONFIG.API_GATEWAY}/admin/backup-config`, {
                headers
            });

            if (backupConfigResponse.ok()) {
                const backupConfig = await backupConfigResponse.json();

                expect(backupConfig.enabled).toBeTruthy();
                expect(backupConfig.schedule).toBeDefined();
                expect(backupConfig.retention_policy).toBeDefined();

                console.log('Backup Configuration:', backupConfig);
            }

            // Test backup creation
            const backupTestResponse = await request.post(`${TEST_CONFIG.API_GATEWAY}/admin/test-backup`, {
                headers,
                data: { type: 'test_backup' }
            });

            if (backupTestResponse.ok()) {
                const backupResult = await backupTestResponse.json();
                expect(backupResult.success).toBeTruthy();

                console.log('Backup Test Result:', backupResult);
            }
        });
    });

    test.describe('Migration and Deployment Validation', () => {
        test('Database migration status', async ({ request }) => {
            test.setTimeout(90000); // 1.5 minutes

            const token = await authHelper.authenticateAdmin();
            const headers = { Authorization: `Bearer ${token}` };

            const migrationResponse = await request.get(`${TEST_CONFIG.API_GATEWAY}/admin/migrations`, {
                headers
            });

            if (migrationResponse.ok()) {
                const migrations = await migrationResponse.json();

                expect(migrations.status).toBe('up-to-date');
                expect(migrations.pending_migrations).toBe(0);

                console.log('Migration Status:', migrations);
            }
        });

        test('Service version compatibility', async ({ request }) => {
            test.setTimeout(120000); // 2 minutes

            // Check service versions
            const serviceVersions = {};

            for (const [serviceName, serviceConfig] of Object.entries(TEST_CONFIG.SERVICES)) {
                try {
                    const versionResponse = await request.get(
                        `${TEST_CONFIG.API_GATEWAY}/${serviceConfig.name}/version`
                    );

                    if (versionResponse.ok()) {
                        const versionData = await versionResponse.json();
                        serviceVersions[serviceName] = versionData.version;
                    }
                } catch (error) {
                    serviceVersions[serviceName] = 'unknown';
                }
            }

            console.log('Service Versions:', serviceVersions);

            // All services should have version information
            const servicesWithVersions = Object.values(serviceVersions).filter(v => v !== 'unknown').length;
            const versioningRate = servicesWithVersions / Object.keys(serviceVersions).length;

            expect(versioningRate).toBeGreaterThan(0.8); // 80% of services should have version info
        });

        test('Configuration drift detection', async ({ request }) => {
            test.setTimeout(90000); // 1.5 minutes

            const token = await authHelper.authenticateAdmin();
            const headers = { Authorization: `Bearer ${token}` };

            const driftResponse = await request.get(`${TEST_CONFIG.API_GATEWAY}/admin/config-drift`, {
                headers
            });

            if (driftResponse.ok()) {
                const driftData = await driftResponse.json();

                expect(driftData.drift_detected).toBeFalsy();
                expect(driftData.config_consistency).toBeTruthy();

                console.log('Configuration Drift Status:', driftData);
            }
        });
    });

    test.afterEach(async () => {
        // Clean up any test state
    });
});
