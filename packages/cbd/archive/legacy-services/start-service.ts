#!/usr/bin/env tsx

/**
 * CBD Engine Service Startup Script
 * Simple startup script for the CBD Engine Service
 */

import { CBDEngineService } from './service.js';

async function startService() {
    try {
        console.log('🚀 Starting CBD Engine Service...');
        const service = new CBDEngineService();
        await service.start();
        
        // Setup graceful shutdown
        const shutdown = async (signal: string) => {
            console.log(`\n📡 Received ${signal}. Shutting down gracefully...`);
            process.exit(0);
        };

        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        
    } catch (error) {
        console.error('❌ Failed to start service:', error);
        process.exit(1);
    }
}

startService();
