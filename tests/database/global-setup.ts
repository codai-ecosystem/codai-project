import { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
    console.log('🚀 Starting Database/Storage Testing Global Setup');

    try {
        // Check if API Gateway is running
        const response = await fetch('http://localhost:4000/health');
        if (!response.ok) {
            throw new Error(`API Gateway health check failed: ${response.status}`);
        }
        console.log('✅ API Gateway is running and healthy');

        // Check essential services
        const services = ['id', 'memorai', 'hub', 'admin', 'codai'];
        for (const service of services) {
            try {
                const serviceResponse = await fetch(`http://localhost:4000/api/${service}/health`);
                if (serviceResponse.ok) {
                    console.log(`✅ ${service.toUpperCase()} service is healthy`);
                } else {
                    console.log(`⚠️  ${service.toUpperCase()} service health check returned: ${serviceResponse.status}`);
                }
            } catch (error) {
                console.log(`⚠️  ${service.toUpperCase()} service is not responding`);
            }
        }

        // Set test environment variables
        process.env.TEST_MODE = 'database-storage-testing';
        process.env.TEST_START_TIME = Date.now().toString();

        console.log('✅ Global setup completed successfully');

    } catch (error: any) {
        console.error('❌ Global setup failed:', error.message);
        console.error('Please ensure the CODAI ecosystem is running:');
        console.error('1. Start the API Gateway: cd apps/gateway && npm run dev');
        console.error('2. Start essential services (ID, MEMORAI, HUB, ADMIN, CODAI)');
        throw error;
    }
}

export default globalSetup;
