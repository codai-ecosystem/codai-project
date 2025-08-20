#!/usr/bin/env tsx

/**
 * CBD Engine Service - Modern Production Startup
 * Uses the new CBDEngineService with proper TypeScript patterns
 */

import { CBDEngineService } from './service.js';

async function startService() {
    try {
        console.log('🚀 Starting CBD Engine Service (Modern)...');
        
        const service = new CBDEngineService({
            port: parseInt(process.env.CBD_PORT || '4180'),
            host: process.env.CBD_HOST || 'localhost',
            dataPath: process.env.CBD_DATA_PATH || './cbd-data'
        });
        
        await service.start();
        
        // Setup graceful shutdown
        const shutdown = async (signal: string) => {
            console.log(`\n📡 Received ${signal}. Shutting down gracefully...`);
            process.exit(0);
        };

        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        
    } catch (error) {
        console.error('❌ Failed to start CBD Engine Service:', error);
        process.exit(1);
    }
}

startService();
