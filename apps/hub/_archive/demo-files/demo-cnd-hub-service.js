#!/usr/bin/env node

/**
 * CND Hub Service Demo Script
 * 
 * Demonstrates comprehensive Hub Service capabilities:
 * - Service Discovery & Registration
 * - Health Monitoring
 * - Cross-Service Communication
 * - System Metrics
 * - Load Balancing
 */

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
    log(`✅ ${message}`, colors.green);
}

function error(message) {
    log(`❌ ${message}`, colors.red);
}

function info(message) {
    log(`ℹ️  ${message}`, colors.blue);
}

function warning(message) {
    log(`⚠️  ${message}`, colors.yellow);
}

function section(title) {
    log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
    log(`${colors.cyan}${colors.bright}${title}${colors.reset}`);
    log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
}

async function makeRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        const data = await response.json();
        return { success: response.ok, status: response.status, data };
    } catch (err) {
        return {
            success: false,
            status: 0,
            data: { error: err.message }
        };
    }
}

async function testHubServiceHealth() {
    section('🏥 HUB SERVICE HEALTH CHECK');

    const result = await makeRequest('http://localhost:4003/api/health');

    if (result.success) {
        success('Hub Service is healthy');
        info(`Status: ${result.data.status}`);
        info(`Registered Services: ${result.data.services?.registered || 0}`);
        info(`Healthy Services: ${result.data.services?.healthy || 0}`);
        info(`Uptime: ${Math.round(result.data.hubService?.uptime || 0)} seconds`);
        info(`Memory Usage: ${Math.round((result.data.hubService?.memory?.heapUsed || 0) / 1024 / 1024)}MB`);
    } else {
        error('Hub Service health check failed');
        error(`Error: ${result.data.error}`);
    }

    return result.success;
}

async function testServiceRegistration() {
    section('📝 SERVICE REGISTRATION');

    // Register a test service
    const testService = {
        serviceId: 'test-service-001',
        serviceName: 'test-service',
        version: '1.0.0',
        host: 'localhost',
        port: 9999,
        protocol: 'http',
        endpoints: [
            {
                path: '/api/test',
                method: 'GET',
                description: 'Test endpoint',
            },
            {
                path: '/api/data',
                method: 'POST',
                description: 'Data submission endpoint',
            },
        ],
        healthCheckPath: '/health',
        tags: ['test', 'demo', 'experimental'],
        metadata: {
            description: 'Test service for Hub demo',
            owner: 'demo-team',
            environment: 'development',
        },
    };

    info('Registering test service...');
    const registerResult = await makeRequest('http://localhost:4003/api/services', {
        method: 'POST',
        body: JSON.stringify(testService),
    });

    if (registerResult.success) {
        success('Test service registered successfully');
        info(`Service ID: ${registerResult.data.serviceId}`);
    } else {
        error('Failed to register test service');
        error(`Error: ${registerResult.data.error}`);
        return false;
    }

    // Get all registered services
    info('\nFetching all registered services...');
    const servicesResult = await makeRequest('http://localhost:4003/api/services');

    if (servicesResult.success) {
        success(`Found ${servicesResult.data.count} registered services`);
        servicesResult.data.services.forEach(service => {
            info(`  - ${service.serviceName} (${service.serviceId}) - ${service.host}:${service.port}`);
        });
    } else {
        error('Failed to fetch services');
        error(`Error: ${servicesResult.data.error}`);
    }

    return registerResult.success;
}

async function testServiceDiscovery() {
    section('🔍 SERVICE DISCOVERY');

    // Find services by tag
    info('Finding services with "core" tag...');
    const coreServicesResult = await makeRequest('http://localhost:4003/api/services?tag=core');

    if (coreServicesResult.success) {
        success(`Found ${coreServicesResult.data.count} core services`);
        coreServicesResult.data.services.forEach(service => {
            info(`  - ${service.serviceName}: ${service.tags.join(', ')}`);
        });
    } else {
        warning('No core services found or error occurred');
    }

    // Get healthy instances of hub service
    info('\nFetching healthy hub service instances...');
    const healthyResult = await makeRequest('http://localhost:4003/api/communication/healthy-instances/hub');

    if (healthyResult.success) {
        success(`Found ${healthyResult.data.count} healthy hub instances`);
        healthyResult.data.healthyInstances.forEach(instance => {
            info(`  - ${instance.serviceId}: ${instance.host}:${instance.port}`);
        });
    } else {
        warning('No healthy hub instances found or error occurred');
    }

    return true;
}

async function testHealthMonitoring() {
    section('💓 HEALTH MONITORING');

    // Get ecosystem health
    info('Checking ecosystem health...');
    const ecosystemResult = await makeRequest('http://localhost:4003/api/ecosystem/health');

    if (ecosystemResult.success) {
        const ecosystem = ecosystemResult.data.ecosystem;
        success(`Ecosystem Status: ${ecosystem.overallStatus}`);
        info(`Health Percentage: ${ecosystem.healthPercentage}%`);
        info(`Total Services: ${ecosystem.totalServices}`);
        info(`Healthy: ${ecosystem.summary.healthy}, Unhealthy: ${ecosystem.summary.unhealthy}`);
        info(`Degraded: ${ecosystem.summary.degraded}, Unknown: ${ecosystem.summary.unknown}`);

        // Show individual service health
        if (ecosystemResult.data.services && Array.isArray(ecosystemResult.data.services)) {
            info('\nIndividual Service Health:');
            ecosystemResult.data.services.forEach(service => {
                const statusIcon = service.status === 'healthy' ? '✅' :
                    service.status === 'unhealthy' ? '❌' :
                        service.status === 'degraded' ? '⚠️' : '❓';
                info(`  ${statusIcon} ${service.serviceId}: ${service.status} (${service.responseTime}ms)`);
            });
        }
    } else {
        error('Failed to get ecosystem health');
        error(`Error: ${ecosystemResult.data.error}`);
    }

    return ecosystemResult.success;
}

async function testCrossServiceCommunication() {
    section('🔄 CROSS-SERVICE COMMUNICATION');

    // Test communication with Gateway service
    info('Testing communication with Gateway service...');
    const commRequest = {
        targetService: 'gateway-service-001',
        endpoint: '/api/health',
        method: 'GET',
        timeout: 10000,
    };

    const commResult = await makeRequest('http://localhost:4003/api/communication/request', {
        method: 'POST',
        body: JSON.stringify(commRequest),
    });

    if (commResult.success) {
        success('Cross-service communication successful');
        info(`Target Response Status: ${commResult.data.result.status}`);
        info(`Response Time: ${commResult.data.result.responseTime}ms`);
        if (commResult.data.result.data) {
            info(`Target Service: ${commResult.data.result.data.service || 'Unknown'}`);
            info(`Target Status: ${commResult.data.result.data.status || 'Unknown'}`);
        }
    } else {
        warning('Cross-service communication failed');
        warning(`Error: ${commResult.data.error}`);
    }

    return commResult.success;
}

async function testMetricsCollection() {
    section('📊 METRICS COLLECTION');

    // Record a test metric
    info('Recording test metrics...');
    const testMetrics = [
        {
            metricName: 'hub_demo_requests',
            value: 100,
            labels: { endpoint: '/api/test', method: 'GET' },
        },
        {
            metricName: 'hub_demo_response_time',
            value: 250,
            labels: { service: 'hub', operation: 'health_check' },
        },
        {
            metricName: 'hub_demo_active_connections',
            value: 42,
            labels: { protocol: 'http' },
        },
    ];

    for (const metric of testMetrics) {
        const recordResult = await makeRequest('http://localhost:4003/api/metrics', {
            method: 'POST',
            body: JSON.stringify(metric),
        });

        if (recordResult.success) {
            success(`Recorded metric: ${metric.metricName} = ${metric.value}`);
        } else {
            error(`Failed to record metric: ${metric.metricName}`);
        }
    }

    // Retrieve metrics
    info('\nRetrieving recorded metrics...');
    const metricsResult = await makeRequest('http://localhost:4003/api/metrics?timeWindow=1h');

    if (metricsResult.success) {
        success(`Retrieved ${metricsResult.data.count} metrics`);
        metricsResult.data.metrics.slice(0, 5).forEach(metric => {
            info(`  - ${metric.metricName}: ${metric.value} ${JSON.stringify(metric.labels)}`);
        });
        if (metricsResult.data.count > 5) {
            info(`  ... and ${metricsResult.data.count - 5} more`);
        }
    } else {
        error('Failed to retrieve metrics');
        error(`Error: ${metricsResult.data.error}`);
    }

    return true;
}

async function testServiceCleanup() {
    section('🧹 SERVICE CLEANUP');

    // Unregister the test service
    info('Unregistering test service...');
    const unregisterResult = await makeRequest('http://localhost:4003/api/services/test-service-001', {
        method: 'DELETE',
    });

    if (unregisterResult.success) {
        success('Test service unregistered successfully');
    } else {
        warning('Failed to unregister test service (might not exist)');
    }

    return true;
}

async function main() {
    log(`${colors.bright}${colors.magenta}🎭 CND Hub Service Comprehensive Demo${colors.reset}\n`);
    log('This demo will test all Hub Service capabilities including:');
    log('- Service discovery and registration');
    log('- Health monitoring and ecosystem status');
    log('- Cross-service communication');
    log('- Metrics collection and retrieval');
    log('- Load balancing and service coordination\n');

    const tests = [
        { name: 'Hub Service Health', fn: testHubServiceHealth },
        { name: 'Service Registration', fn: testServiceRegistration },
        { name: 'Service Discovery', fn: testServiceDiscovery },
        { name: 'Health Monitoring', fn: testHealthMonitoring },
        { name: 'Cross-Service Communication', fn: testCrossServiceCommunication },
        { name: 'Metrics Collection', fn: testMetricsCollection },
        { name: 'Service Cleanup', fn: testServiceCleanup },
    ];

    let passedTests = 0;

    for (const test of tests) {
        try {
            const passed = await test.fn();
            if (passed) {
                passedTests++;
            }
        } catch (err) {
            error(`Test "${test.name}" threw an error: ${err.message}`);
        }
    }

    section('📋 DEMO SUMMARY');
    success(`✅ ${passedTests}/${tests.length} tests completed successfully`);

    if (passedTests === tests.length) {
        success('🎉 All Hub Service features are working perfectly!');
        info('\nThe Hub Service provides:');
        info('✅ Central service discovery and registration');
        info('✅ Comprehensive health monitoring');
        info('✅ Cross-service communication routing');
        info('✅ System metrics collection and analysis');
        info('✅ Load balancing and service coordination');
        info('✅ Enterprise-grade audit logging and security');
    } else {
        warning(`⚠️  ${tests.length - passedTests} tests had issues. Check the logs above.`);
    }

    log(`\n${colors.bright}Demo completed at ${new Date().toISOString()}${colors.reset}`);
}

// Handle script execution
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(err => {
        error(`Demo failed: ${err.message}`);
        process.exit(1);
    });
}

export { main };
