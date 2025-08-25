import { FullConfig } from '@playwright/test';

/**
 * 🎭 Playwright Global Setup for CODAI Ecosystem E2E Testing
 * 
 * Comprehensive setup including:
 * - Application health checks with detailed reporting
 * - Test environment preparation and validation
 * - Database and service initialization verification
 * - Test data setup and user account preparation
 */

async function globalSetup(config: FullConfig) {
    console.log('🚀 Starting CODAI Ecosystem E2E Test Setup...');

    // CODAI Ecosystem services configuration
    const services = [
        { name: 'MemorAI', url: 'http://localhost:4006', healthPath: '/api/health' },
        { name: 'BancAI', url: 'http://localhost:4005', healthPath: '/api/health' },
        { name: 'Dashboard', url: 'http://localhost:4007', healthPath: '/api/health' },
        { name: 'ControlAI', url: 'http://localhost:4008', healthPath: '/api/health' },
        { name: 'Hub', url: 'http://localhost:4004', healthPath: '/api/health' },
        { name: 'ID', url: 'http://localhost:4003', healthPath: '/api/health' },
        { name: 'CBD Database', url: 'http://localhost:4180', healthPath: '/health' },
        { name: 'MCP Server', url: 'http://localhost:4950', healthPath: '/health' }
    ];

    console.log('🏥 Performing comprehensive health checks...');

    const healthResults: Record<string, boolean> = {};

    for (const service of services) {
        console.log(`🔍 Checking ${service.name}...`);
        let retries = 10; // Reduced retries for faster setup
        let isReady = false;

        while (retries > 0 && !isReady) {
            try {
                const healthUrl = `${service.url}${service.healthPath}`;
                const response = await fetch(healthUrl, {
                    method: 'GET',
                    timeout: 8000,
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'CODAI-E2E-Setup/1.0'
                    }
                });

                if (response.ok) {
                    console.log(`  ✅ ${service.name} is ready (${response.status})`);
                    isReady = true;
                    healthResults[service.name.toLowerCase().replace(/\s+/g, '')] = true;
                } else {
                    throw new Error(`HTTP ${response.status}`);
                }
            } catch (error) {
                retries--;
                healthResults[service.name.toLowerCase().replace(/\s+/g, '')] = false;

                if (retries === 0) {
                    console.log(`  ❌ ${service.name} not available: ${error}`);
                } else {
                    await new Promise(resolve => setTimeout(resolve, 1500));
                }
            }
        }
    }

    // Health summary
    const healthyServices = Object.values(healthResults).filter(Boolean).length;
    const totalServices = services.length;
    console.log(`📊 Health Summary: ${healthyServices}/${totalServices} services available`);

    // Store health results for E2E tests
    process.env.E2E_SERVICE_HEALTH = JSON.stringify(healthResults);

    // Set up E2E test environment
    console.log('� Preparing E2E test environment...');

    // Set environment variables for E2E tests
    process.env.E2E_TEST_RUN = 'true';
    process.env.E2E_TEST_TIMESTAMP = new Date().toISOString();
    process.env.E2E_TEST_ID = `e2e-${Date.now()}`;

    // Create E2E test data directories
    try {
        const fs = await import('fs/promises');
        await fs.mkdir('./test-results', { recursive: true });
        await fs.mkdir('./test-results/e2e-artifacts', { recursive: true });
        await fs.mkdir('./test-results/e2e-html-report', { recursive: true });

        console.log('  📁 E2E test directories created');
    } catch (error) {
        console.log('  ⚠️ Failed to create test directories:', error);
    }

    // Set up E2E test data
    console.log('🗄️ Setting up E2E test data...');

    // Create E2E test users with updated structure
    const e2eTestUsers = [
        {
            email: 'e2e-admin@codai.test',
            password: 'E2EAdmin123!',
            role: 'admin',
            firstName: 'E2E',
            lastName: 'Admin',
            username: 'e2e_admin'
        },
        {
            email: 'e2e-user@codai.test',
            password: 'E2EUser123!',
            role: 'user',
            firstName: 'E2E',
            lastName: 'User',
            username: 'e2e_user'
        },
        {
            email: 'e2e-tester@codai.test',
            password: 'E2ETester123!',
            role: 'tester',
            firstName: 'E2E',
            lastName: 'Tester',
            username: 'e2e_tester'
        }
    ];

    // Try to create E2E test users via ID service if available
    if (healthResults.id) {
        for (const user of e2eTestUsers) {
            try {
                const response = await fetch('http://localhost:4003/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Test-Suite': 'E2E-Setup'
                    },
                    body: JSON.stringify(user),
                    timeout: 10000
                });

                if (response.ok) {
                    console.log(`  ✅ Created E2E test user: ${user.email}`);
                } else if (response.status === 409) {
                    console.log(`  ℹ️ E2E test user already exists: ${user.email}`);
                } else {
                    console.log(`  ⚠️ Could not create E2E user ${user.email}: HTTP ${response.status}`);
                }
            } catch (error) {
                console.log(`  ⚠️ Could not create E2E user ${user.email}: ${error}`);
            }
        }
    } else {
        console.log('  ⚠️ ID service not available - skipping E2E user creation');
    }

    // Create E2E test scenarios data
    console.log('� Setting up E2E test scenarios...');
    try {
        const e2eTestScenarios = [
            {
                name: 'E2E Memory Workflow Test',
                description: 'End-to-end memory management workflow validation',
                type: 'memory_workflow',
                status: 'active',
                testData: {
                    memories: [
                        'E2E test memory for workflow validation',
                        'Cross-application integration test data'
                    ]
                }
            },
            {
                name: 'E2E Banking Workflow Test',
                description: 'End-to-end banking operations workflow validation',
                type: 'banking_workflow',
                status: 'active',
                testData: {
                    transactions: [
                        { amount: 100, description: 'E2E test transaction' },
                        { amount: 250.50, description: 'E2E integration test transfer' }
                    ]
                }
            },
            {
                name: 'E2E Authentication Flow Test',
                description: 'Complete authentication and session management validation',
                type: 'auth_workflow',
                status: 'active',
                testData: {
                    authFlows: ['login', 'logout', 'session_validation', 'cross_app_auth']
                }
            }
        ];

        // Store E2E scenarios for test execution
        process.env.E2E_TEST_SCENARIOS = JSON.stringify(e2eTestScenarios);
        console.log(`  ✅ Prepared ${e2eTestScenarios.length} E2E test scenarios`);

    } catch (error) {
        console.log(`  ⚠️ E2E test scenario setup failed: ${error}`);
    }

    // Final setup validation
    console.log('🔍 Validating E2E test setup...');

    // Wait for services to stabilize
    console.log('  ⏳ Allowing services to stabilize...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Log setup completion
    const setupDuration = Date.now() - parseInt(process.env.E2E_TEST_ID?.split('-')[1] || '0');
    console.log(`✨ CODAI Ecosystem E2E Test Setup completed in ${setupDuration}ms`);

    if (healthyServices > 0) {
        console.log('🎭 Ready to run comprehensive end-to-end tests across CODAI ecosystem');
    } else {
        console.log('⚠️ Limited E2E testing capability - consider starting more services');
    }
}

export default globalSetup;
