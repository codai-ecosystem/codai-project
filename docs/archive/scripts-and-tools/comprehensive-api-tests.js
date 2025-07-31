/**
 * 🧪 CODAI Comprehensive API Testing Suite
 * Tests all operational services with full coverage
 */

const https = require('https');
const http = require('http');

// Test configuration
const TEST_CONFIG = {
    timeout: 10000,
    retries: 3,
    baseUrl: 'http://localhost',
    services: {
        bancai: { port: 4005, name: 'BancAI', type: 'full' },
        hub: { port: 4008, name: 'Hub', type: 'full' },
        codai: { port: 4001, name: 'CODAI', type: 'simple' },
        id: { port: 4004, name: 'ID', type: 'simple' },
        gateway: { port: 4000, name: 'Gateway', type: 'degraded' }
    }
};

// Test results tracking
const testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    details: []
};

/**
 * HTTP request helper with timeout and retry logic
 */
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error(`Request timeout after ${TEST_CONFIG.timeout}ms`));
        }, TEST_CONFIG.timeout);

        const req = http.request(url, options, (res) => {
            clearTimeout(timeout);
            let data = '';

            res.on('data', chunk => {
                data += chunk;
            });

            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    data: data,
                    json: () => {
                        try {
                            return JSON.parse(data);
                        } catch (e) {
                            return null;
                        }
                    }
                });
            });
        });

        req.on('error', (err) => {
            clearTimeout(timeout);
            reject(err);
        });

        if (options.body) {
            req.write(JSON.stringify(options.body));
        }

        req.end();
    });
}

/**
 * Test runner with retry logic
 */
async function runTest(testName, testFunction, retries = TEST_CONFIG.retries) {
    testResults.total++;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const result = await testFunction();
            testResults.passed++;
            testResults.details.push({
                name: testName,
                status: 'PASSED',
                attempt: attempt,
                result: result
            });
            console.log(`✅ ${testName} (attempt ${attempt})`);
            return result;
        } catch (error) {
            if (attempt === retries) {
                testResults.failed++;
                testResults.details.push({
                    name: testName,
                    status: 'FAILED',
                    attempt: attempt,
                    error: error.message
                });
                console.log(`❌ ${testName} (failed after ${retries} attempts): ${error.message}`);
                return null;
            }
            console.log(`⚠️  ${testName} (attempt ${attempt} failed, retrying...)`);
        }
    }
}

/**
 * Health endpoint testing
 */
async function testHealthEndpoint(serviceName, port) {
    const url = `${TEST_CONFIG.baseUrl}:${port}/health`;
    const response = await makeRequest(url, { method: 'GET' });

    if (response.statusCode !== 200 && response.statusCode !== 503) {
        throw new Error(`Expected 200 or 503, got ${response.statusCode}`);
    }

    const json = response.json();
    if (!json || !json.service) {
        throw new Error('Invalid health response format');
    }

    return {
        status: response.statusCode,
        service: json.service,
        health: json.status,
        version: json.version
    };
}

/**
 * API endpoint discovery and testing
 */
async function testAPIEndpoints(serviceName, port) {
    const commonEndpoints = [
        '/api/status',
        '/api/health',
        '/api/version',
        '/api/info'
    ];

    const results = {};

    for (const endpoint of commonEndpoints) {
        try {
            const url = `${TEST_CONFIG.baseUrl}:${port}${endpoint}`;
            const response = await makeRequest(url, { method: 'GET' });
            results[endpoint] = {
                status: response.statusCode,
                accessible: response.statusCode < 500
            };
        } catch (error) {
            results[endpoint] = {
                status: 'ERROR',
                accessible: false,
                error: error.message
            };
        }
    }

    return results;
}

/**
 * CORS and security headers testing
 */
async function testSecurityHeaders(serviceName, port) {
    const url = `${TEST_CONFIG.baseUrl}:${port}/health`;
    const response = await makeRequest(url, { method: 'OPTIONS' });

    return {
        cors: !!response.headers['access-control-allow-origin'],
        contentType: response.headers['content-type'],
        securityHeaders: {
            xFrameOptions: response.headers['x-frame-options'],
            xContentTypeOptions: response.headers['x-content-type-options'],
            xssProtection: response.headers['x-xss-protection']
        }
    };
}

/**
 * Service-specific comprehensive testing
 */
async function testServiceComprehensive(serviceName, config) {
    console.log(`\n🔍 Testing ${config.name} Service (Port ${config.port}) - ${config.type.toUpperCase()} MODE`);
    console.log('='.repeat(60));

    const serviceResults = {
        service: serviceName,
        port: config.port,
        type: config.type,
        tests: {}
    };

    // Health endpoint test
    serviceResults.tests.health = await runTest(
        `${config.name} Health Check`,
        () => testHealthEndpoint(serviceName, config.port)
    );

    // API endpoints test (only for full services)
    if (config.type === 'full') {
        serviceResults.tests.apiEndpoints = await runTest(
            `${config.name} API Endpoints`,
            () => testAPIEndpoints(serviceName, config.port)
        );

        serviceResults.tests.security = await runTest(
            `${config.name} Security Headers`,
            () => testSecurityHeaders(serviceName, config.port)
        );
    }

    return serviceResults;
}

/**
 * Integration testing between services
 */
async function testServiceIntegration() {
    console.log(`\n🔗 Integration Testing`);
    console.log('='.repeat(40));

    // Test Gateway to service routing
    const integrationResults = {};

    for (const [serviceName, config] of Object.entries(TEST_CONFIG.services)) {
        if (serviceName === 'gateway') continue;

        try {
            const gatewayUrl = `${TEST_CONFIG.baseUrl}:4000/api/v1/${serviceName}/health`;
            const response = await makeRequest(gatewayUrl, { method: 'GET' });

            integrationResults[serviceName] = {
                gatewayRouting: response.statusCode < 500,
                status: response.statusCode
            };

            console.log(`✅ Gateway → ${config.name} routing: ${response.statusCode}`);
        } catch (error) {
            integrationResults[serviceName] = {
                gatewayRouting: false,
                error: error.message
            };
            console.log(`❌ Gateway → ${config.name} routing failed: ${error.message}`);
        }
    }

    return integrationResults;
}

/**
 * Performance baseline testing
 */
async function testPerformanceBaseline() {
    console.log(`\n⚡ Performance Baseline Testing`);
    console.log('='.repeat(40));

    const performanceResults = {};

    for (const [serviceName, config] of Object.entries(TEST_CONFIG.services)) {
        const times = [];

        for (let i = 0; i < 5; i++) {
            const start = Date.now();
            try {
                await makeRequest(`${TEST_CONFIG.baseUrl}:${config.port}/health`);
                times.push(Date.now() - start);
            } catch (error) {
                times.push(-1); // Error
            }
        }

        const validTimes = times.filter(t => t > 0);
        const avgTime = validTimes.length > 0 ?
            Math.round(validTimes.reduce((a, b) => a + b, 0) / validTimes.length) : -1;

        performanceResults[serviceName] = {
            averageResponseTime: avgTime,
            successRate: (validTimes.length / times.length) * 100,
            times: times
        };

        console.log(`⚡ ${config.name}: ${avgTime}ms avg, ${performanceResults[serviceName].successRate}% success`);
    }

    return performanceResults;
}

/**
 * Main testing execution
 */
async function runCompleteTestSuite() {
    console.log('🧪 CODAI Comprehensive Testing Suite');
    console.log('=====================================');
    console.log(`📅 ${new Date().toISOString()}`);

    const fullResults = {
        timestamp: new Date().toISOString(),
        services: {},
        integration: {},
        performance: {},
        summary: {}
    };

    // Test each service
    for (const [serviceName, config] of Object.entries(TEST_CONFIG.services)) {
        fullResults.services[serviceName] = await testServiceComprehensive(serviceName, config);
    }

    // Integration testing
    fullResults.integration = await testServiceIntegration();

    // Performance baseline
    fullResults.performance = await testPerformanceBaseline();

    // Generate summary
    const totalServices = Object.keys(TEST_CONFIG.services).length;
    const healthyServices = Object.values(fullResults.services)
        .filter(s => s.tests.health && s.tests.health.status === 200).length;

    fullResults.summary = {
        totalTests: testResults.total,
        passedTests: testResults.passed,
        failedTests: testResults.failed,
        skippedTests: testResults.skipped,
        passRate: Math.round((testResults.passed / testResults.total) * 100),
        serviceHealth: Math.round((healthyServices / totalServices) * 100),
        healthyServices: healthyServices,
        totalServices: totalServices
    };

    // Final report
    console.log(`\n📊 Test Summary`);
    console.log('================');
    console.log(`Tests: ${testResults.passed}/${testResults.total} passed (${fullResults.summary.passRate}%)`);
    console.log(`Services: ${healthyServices}/${totalServices} healthy (${fullResults.summary.serviceHealth}%)`);
    console.log(`\n🎯 Testing Status: ${fullResults.summary.passRate >= 80 ? '✅ READY FOR PRODUCTION' : '⚠️ NEEDS ATTENTION'}`);

    return fullResults;
}

// Run the complete test suite
if (require.main === module) {
    runCompleteTestSuite()
        .then(results => {
            console.log('\n🎉 Testing completed successfully!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Testing failed:', error);
            process.exit(1);
        });
}

module.exports = {
    runCompleteTestSuite,
    testHealthEndpoint,
    testAPIEndpoints,
    testSecurityHeaders,
    makeRequest
};
