#!/usr/bin/env node

/**
 * CBD Engine Service Startup Script
 * Real data testing with actual HTTP service
 */

import { CBDEngineService } from './src/service-simple.js';

async function startService() {
    console.log('🚀 Starting CBD Engine Service for Real Data Testing...');

    const service = new CBDEngineService({
        port: 4180,
        host: 'localhost',
        dataPath: './cbd-data'
    });

    try {
        await service.start();
        console.log('✅ CBD Engine Service is running and ready for real data testing');
        console.log('📊 Service URL: http://localhost:4180');
        console.log('🔍 Health Check: http://localhost:4180/health');
        console.log('📝 API Documentation: http://localhost:4180');

        // Graceful shutdown
        process.on('SIGINT', async () => {
            console.log('\n🔄 Shutting down CBD Engine Service...');
            await service.stop();
            process.exit(0);
        });

    } catch (error) {
        console.error('❌ Failed to start CBD Engine Service:', error);
        process.exit(1);
    }
}

startService();
