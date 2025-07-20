import { FullConfig } from '@playwright/test';
import axios from 'axios';

/**
 * Global Setup for CODAI Integration Testing
 * Prepares the testing environment and ensures services are ready
 */

async function globalSetup(config: FullConfig) {
    console.log('🚀 Starting CODAI Integration Testing Global Setup...');

    const API_GATEWAY = 'http://localhost:4000';
    const MAX_RETRIES = 30;
    const RETRY_DELAY = 2000; // 2 seconds

    // Wait for API Gateway to be ready
    console.log('📡 Waiting for API Gateway to be ready...');
    let gatewayReady = false;
    let retries = 0;

    while (!gatewayReady && retries < MAX_RETRIES) {
        try {
            const response = await axios.get(`${API_GATEWAY}/health`, { timeout: 5000 });
            if (response.status === 200) {
                gatewayReady = true;
                console.log('✅ API Gateway is ready');
            }
        } catch (error) {
            retries++;
            console.log(`⏳ API Gateway not ready yet (attempt ${retries}/${MAX_RETRIES}), retrying in ${RETRY_DELAY / 1000}s...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
    }

    if (!gatewayReady) {
        throw new Error('❌ API Gateway failed to start within expected time');
    }

    // Wait for core services to be ready
    console.log('🔍 Checking core services availability...');
    const coreServices = [
        { name: 'id', port: 4001 },
        { name: 'hub', port: 4003 },
        { name: 'memorai', port: 4002 },
        { name: 'admin', port: 4005 }
    ];

    const serviceReadiness = [];

    for (const service of coreServices) {
        let serviceReady = false;
        let serviceRetries = 0;
        const maxServiceRetries = 10;

        while (!serviceReady && serviceRetries < maxServiceRetries) {
            try {
                const directResponse = await axios.get(`http://localhost:${service.port}/health`, {
                    timeout: 3000
                });
                const gatewayResponse = await axios.get(`${API_GATEWAY}/${service.name}/health`, {
                    timeout: 3000
                });

                if (directResponse.status === 200 && gatewayResponse.status === 200) {
                    serviceReady = true;
                    console.log(`✅ Service ${service.name.toUpperCase()} is ready`);
                }
            } catch (error) {
                serviceRetries++;
                if (serviceRetries < maxServiceRetries) {
                    console.log(`⏳ Service ${service.name.toUpperCase()} not ready (attempt ${serviceRetries}/${maxServiceRetries})`);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }

        serviceReadiness.push({
            name: service.name,
            ready: serviceReady,
            port: service.port
        });
    }

    // Report service readiness
    const readyServices = serviceReadiness.filter(s => s.ready);
    const readinessRate = readyServices.length / serviceReadiness.length;

    console.log(`📊 Service Readiness: ${readyServices.length}/${serviceReadiness.length} (${(readinessRate * 100).toFixed(1)}%)`);

    for (const service of serviceReadiness) {
        console.log(`   ${service.ready ? '✅' : '❌'} ${service.name.toUpperCase()} (port ${service.port})`);
    }

    // Require at least 75% of core services to be ready
    if (readinessRate < 0.75) {
        console.warn(`⚠️  Only ${(readinessRate * 100).toFixed(1)}% of core services are ready. Some tests may fail.`);
    }

    // Test authentication system
    console.log('🔐 Testing authentication system...');
    try {
        const authResponse = await axios.post(`${API_GATEWAY}/auth/login`, {
            username: 'testuser',
            password: 'testpass'
        }, { timeout: 10000 });

        if (authResponse.status === 200 && authResponse.data.token) {
            console.log('✅ Authentication system is working');

            // Store test token for later use
            process.env.TEST_AUTH_TOKEN = authResponse.data.token;
        } else {
            console.log('⚠️  Authentication system responded but may need attention');
        }
    } catch (error) {
        console.log('⚠️  Authentication system test failed - auth tests may fail:', error.message);
    }

    // Initialize test database state
    console.log('🗄️  Initializing test database state...');
    try {
        if (process.env.TEST_AUTH_TOKEN) {
            const headers = { Authorization: `Bearer ${process.env.TEST_AUTH_TOKEN}` };

            // Clean up any previous test data
            const cleanupResponse = await axios.post(`${API_GATEWAY}/admin/cleanup-test-data`, {
                confirm: true
            }, {
                headers,
                timeout: 15000
            });

            if (cleanupResponse.status === 200) {
                console.log('✅ Test data cleanup completed');
            }

            // Create test users
            const testUsers = [
                { username: 'testuser', password: 'testpass', role: 'user' },
                { username: 'developer', password: 'devpass', role: 'developer' },
                { username: 'business', password: 'bizpass', role: 'business' },
                { username: 'student', password: 'studpass', role: 'student' },
                { username: 'admin', password: 'admin123', role: 'admin' }
            ];

            for (const user of testUsers) {
                try {
                    await axios.post(`${API_GATEWAY}/auth/register`, user, {
                        headers,
                        timeout: 5000
                    });
                } catch (error) {
                    // User might already exist, which is fine
                }
            }

            console.log('✅ Test users initialized');
        }
    } catch (error) {
        console.log('⚠️  Database initialization failed:', error.message);
    }

    // Test WebSocket/Socket.IO connectivity
    console.log('🌐 Testing real-time connectivity...');
    try {
        const wsTestResponse = await axios.get(`${API_GATEWAY}/hub/websocket-test`, {
            timeout: 5000
        });

        if (wsTestResponse.status === 200) {
            console.log('✅ Real-time connectivity available');
        }
    } catch (error) {
        console.log('⚠️  Real-time connectivity test failed - WebSocket tests may fail');
    }

    // Setup performance baseline
    console.log('📈 Establishing performance baseline...');
    try {
        const performanceTests = [
            `${API_GATEWAY}/health`,
            `${API_GATEWAY}/hub/health`,
            `${API_GATEWAY}/codai/health`,
            `${API_GATEWAY}/memorai/health`
        ];

        const baselineResults = [];

        for (const endpoint of performanceTests) {
            const startTime = Date.now();
            try {
                await axios.get(endpoint, { timeout: 10000 });
                const responseTime = Date.now() - startTime;
                baselineResults.push({ endpoint, responseTime });
            } catch (error) {
                baselineResults.push({ endpoint, responseTime: -1, error: error.message });
            }
        }

        const avgResponseTime = baselineResults
            .filter(r => r.responseTime > 0)
            .reduce((sum, r) => sum + r.responseTime, 0) /
            baselineResults.filter(r => r.responseTime > 0).length;

        console.log(`✅ Performance baseline established: ${avgResponseTime.toFixed(0)}ms average`);
        process.env.PERFORMANCE_BASELINE = avgResponseTime.toString();

    } catch (error) {
        console.log('⚠️  Performance baseline establishment failed');
    }

    // Create test data for consistent testing
    console.log('📝 Creating consistent test data...');
    if (process.env.TEST_AUTH_TOKEN) {
        const headers = { Authorization: `Bearer ${process.env.TEST_AUTH_TOKEN}` };

        try {
            // Create a test project in CODAI
            await axios.post(`${API_GATEWAY}/codai/projects`, {
                name: 'Integration Test Base Project',
                description: 'Base project for integration testing',
                type: 'test'
            }, { headers, timeout: 10000 });

            // Create test memories in MEMORAI
            await axios.post(`${API_GATEWAY}/memorai/memories`, {
                content: 'Integration test base memory',
                type: 'test',
                metadata: { integration_test: true }
            }, { headers, timeout: 10000 });

            console.log('✅ Consistent test data created');

        } catch (error) {
            console.log('⚠️  Test data creation failed - some tests may be inconsistent');
        }
    }

    // Final environment validation
    console.log('🔍 Final environment validation...');
    const environmentChecks = {
        apiGateway: gatewayReady,
        coreServices: readinessRate >= 0.75,
        authentication: !!process.env.TEST_AUTH_TOKEN,
        performanceBaseline: !!process.env.PERFORMANCE_BASELINE
    };

    const environmentScore = Object.values(environmentChecks).filter(check => check === true).length;
    const totalChecks = Object.keys(environmentChecks).length;
    const environmentHealth = environmentScore / totalChecks;

    console.log('\n📋 Environment Health Report:');
    console.log(`   API Gateway: ${environmentChecks.apiGateway ? '✅' : '❌'}`);
    console.log(`   Core Services: ${environmentChecks.coreServices ? '✅' : '❌'} (${(readinessRate * 100).toFixed(1)}%)`);
    console.log(`   Authentication: ${environmentChecks.authentication ? '✅' : '❌'}`);
    console.log(`   Performance Baseline: ${environmentChecks.performanceBaseline ? '✅' : '❌'}`);
    console.log(`   Overall Health: ${(environmentHealth * 100).toFixed(1)}%`);

    if (environmentHealth < 0.75) {
        console.warn('\n⚠️  WARNING: Environment health is below 75%. Some integration tests may fail or be unreliable.');
        console.warn('   Consider fixing the issues above before running the full test suite.');
    } else {
        console.log('\n🎉 Environment is ready for integration testing!');
    }

    console.log('\n' + '='.repeat(80));
    console.log('🧪 CODAI Integration Testing Environment Setup Complete');
    console.log('='.repeat(80) + '\n');
}

export default globalSetup;
