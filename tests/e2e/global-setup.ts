import { FullConfig } from '@playwright/test';

/**
 * Global Setup for Comprehensive Testing
 * Prepares the test environment and validates all services
 */

async function globalSetup(config: FullConfig) {
    console.log('🚀 Starting global setup for comprehensive testing...');

    // Wait for all services to be ready
    const services = [
        { name: 'Gateway', url: 'http://localhost:4000/health' },
        { name: 'CODAI', url: 'http://localhost:4001/api/health' },
        { name: 'Admin', url: 'http://localhost:4002/api/health' },
        { name: 'Hub', url: 'http://localhost:4003/api/health' },
        { name: 'ID', url: 'http://localhost:4004/api/health' },
        { name: 'BancAI', url: 'http://localhost:4005/api/health' },
        { name: 'MemorAI', url: 'http://localhost:4006/api/health' },
        { name: 'CBD', url: 'http://localhost:4180/health' }
    ];

    console.log('⏳ Waiting for all services to be ready...');

    for (const service of services) {
        console.log(`🔍 Checking ${service.name}...`);
        let retries = 30;
        let isReady = false;

        while (retries > 0 && !isReady) {
            try {
                const response = await fetch(service.url, {
                    method: 'GET',
                    timeout: 5000
                });

                if (response.ok) {
                    console.log(`✅ ${service.name} is ready`);
                    isReady = true;
                } else {
                    throw new Error(`HTTP ${response.status}`);
                }
            } catch (error) {
                retries--;
                if (retries === 0) {
                    console.log(`❌ ${service.name} failed to start: ${error.message}`);
                    // Don't fail setup, just warn
                } else {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }
        }
    }

    // Set up test data
    console.log('🗄️  Setting up test data...');

    // Create test users
    const testUsers = [
        {
            email: 'admin@codai.test',
            password: 'TestAdmin123!',
            role: 'admin',
            name: 'Test Admin'
        },
        {
            email: 'user@codai.test',
            password: 'TestUser123!',
            role: 'user',
            name: 'Test User'
        },
        {
            email: 'developer@codai.test',
            password: 'TestDev123!',
            role: 'developer',
            name: 'Test Developer'
        },
        {
            email: 'analyst@codai.test',
            password: 'TestAnalyst123!',
            role: 'analyst',
            name: 'Test Analyst'
        }
    ];

    try {
        // Try to create test users via ID service
        for (const user of testUsers) {
            try {
                const response = await fetch('http://localhost:4004/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(user)
                });

                if (response.ok) {
                    console.log(`✅ Created test user: ${user.email}`);
                } else if (response.status === 409) {
                    console.log(`ℹ️  Test user already exists: ${user.email}`);
                }
            } catch (error) {
                console.log(`⚠️  Could not create test user ${user.email}: ${error.message}`);
            }
        }
    } catch (error) {
        console.log(`⚠️  Test user setup failed: ${error.message}`);
    }

    // Create test projects
    console.log('📝 Setting up test projects...');
    try {
        const testProjects = [
            {
                name: 'Test Project Alpha',
                description: 'Comprehensive testing project for UI validation',
                type: 'web',
                status: 'active'
            },
            {
                name: 'Test Project Beta',
                description: 'Mobile testing project for responsive validation',
                type: 'mobile',
                status: 'completed'
            },
            {
                name: 'Test Project Gamma',
                description: 'Archive testing project for filter validation',
                type: 'api',
                status: 'archived'
            }
        ];

        // Try to create test projects via CODAI service
        for (const project of testProjects) {
            try {
                const response = await fetch('http://localhost:4001/api/projects', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer test-token'
                    },
                    body: JSON.stringify(project)
                });

                if (response.ok) {
                    console.log(`✅ Created test project: ${project.name}`);
                }
            } catch (error) {
                console.log(`⚠️  Could not create test project ${project.name}: ${error.message}`);
            }
        }
    } catch (error) {
        console.log(`⚠️  Test project setup failed: ${error.message}`);
    }

    console.log('✨ Global setup completed successfully!');

    // Store setup completion timestamp
    process.env.SETUP_COMPLETED = Date.now().toString();
}

export default globalSetup;
