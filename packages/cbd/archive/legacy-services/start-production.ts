/**
 * CBD Service Startup with Real Environment Configuration
 * Production-ready startup leveraging actual Azure AI and environment variables
 */

import { CBDEngineService } from './service.js';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from root .env file
config({ path: path.join(__dirname, '../../../.env') });

async function startCBDService() {
    try {
        console.log('🚀 Starting CBD Universal Database Service...');
        console.log('📍 Environment:', process.env.NODE_ENV || 'development');
        
        // Validate environment variables
        const requiredEnvVars = [
            'AZURE_AI_FOUNDRY_KEY',
            'AZURE_AI_FOUNDRY_ENDPOINT'
        ];
        
        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
        if (missingVars.length > 0) {
            console.warn('⚠️ Missing environment variables:', missingVars.join(', '));
            console.log('ℹ️ Service will start without AI embedding capabilities');
        } else {
            console.log('✅ Azure AI configuration found');
        }

        // Create service configuration using environment variables
        const serviceConfig = {
            port: parseInt(process.env.CBD_PORT || '4180'),
            host: process.env.CBD_HOST || 'localhost',
            dataPath: process.env.CBD_DATA_PATH || path.join(__dirname, '../../../data/cbd'),
            openai: {
                apiKey: process.env.AZURE_AI_FOUNDRY_KEY,
                baseURL: process.env.AZURE_AI_FOUNDRY_ENDPOINT,
                model: process.env.AZURE_OPENAI_EMBEDDING_LARGE_DEPLOYMENT || 'text-embedding-3-large'
            }
        };

        console.log('🔧 Service Configuration:');
        console.log(`   Port: ${serviceConfig.port}`);
        console.log(`   Host: ${serviceConfig.host}`);
        console.log(`   Data Path: ${serviceConfig.dataPath}`);
        console.log(`   AI Endpoint: ${serviceConfig.openai.baseURL ? 'Configured' : 'Not configured'}`);

        // Initialize service
        const service = new CBDEngineService(serviceConfig);

        // Handle graceful shutdown
        const shutdown = async () => {
            console.log('\n🔽 Graceful shutdown initiated...');
            try {
                await service.shutdown();
                console.log('✅ Service shutdown completed');
                process.exit(0);
            } catch (error) {
                console.error('❌ Error during shutdown:', error);
                process.exit(1);
            }
        };

        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);
        process.on('SIGQUIT', shutdown);

        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            console.error('❌ Uncaught Exception:', error);
            shutdown();
        });

        process.on('unhandledRejection', (reason, promise) => {
            console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
            shutdown();
        });

        // Start the service
        await service.start();

        console.log('\n🎉 CBD Universal Database Service is running!');
        console.log('🌐 Health check: http://localhost:' + serviceConfig.port + '/health');
        console.log('📊 Statistics: http://localhost:' + serviceConfig.port + '/api/admin/statistics');
        console.log('📖 API Documentation: http://localhost:' + serviceConfig.port + '/');
        console.log('\n💡 Press Ctrl+C to stop the service');

        // Perform initial health check
        setTimeout(async () => {
            try {
                const fetch = (await import('node-fetch')).default;
                const response = await fetch(`http://localhost:${serviceConfig.port}/health`);
                const health = await response.json();
                console.log('\n🏥 Initial Health Check:', health.status);
                
                if (health.status === 'healthy') {
                    console.log('✅ Service is ready to accept requests');
                    
                    // Test vector embedding if configured
                    if (process.env.AZURE_AI_FOUNDRY_KEY) {
                        console.log('🧠 Testing AI embedding capabilities...');
                        try {
                            const testResponse = await fetch(`http://localhost:${serviceConfig.port}/api/data/memories`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    userRequest: 'Health check test request',
                                    assistantResponse: 'Health check test response',
                                    metadata: { healthCheck: true, timestamp: new Date().toISOString() }
                                })
                            });
                            
                            if (testResponse.ok) {
                                const result = await testResponse.json();
                                console.log('✅ AI embedding test successful:', result.success);
                            } else {
                                console.log('⚠️ AI embedding test failed:', testResponse.status);
                            }
                        } catch (error) {
                            console.log('⚠️ AI embedding test error:', error.message);
                        }
                    }
                }
            } catch (error) {
                console.error('❌ Health check failed:', error.message);
            }
        }, 2000);

    } catch (error) {
        console.error('❌ Failed to start CBD service:', error);
        process.exit(1);
    }
}

// Start service if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    startCBDService().catch((error) => {
        console.error('❌ Startup error:', error);
        process.exit(1);
    });
}

export { startCBDService };
