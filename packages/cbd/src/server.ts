#!/usr/bin/env node

/**
 * CBD Universal Database Service - Main Entry Point
 * Launch script for the next-generation multi-paradigm database
 */

import { CBDUniversalServiceSimple as CBDUniversalService } from './CBDUniversalService.js';

async function main() {
    console.log('🌟 CBD Universal Database - Next Generation Multi-Paradigm Database');
    console.log('🔬 Phase 1: Foundation with SQL Engine and Universal Storage');
    console.log('');

    const port = parseInt(process.env.CBD_PORT || '4180');
    const service = new CBDUniversalService();

    try {
        const app = await service.initialize();
        const server = app.listen(port, () => {
            console.log(`🚀 CBD Universal Database running on port ${port}`);
            console.log(`📍 http://localhost:${port}`);
        });
        
        // Graceful shutdown
        process.on('SIGINT', () => {
            console.log('\n🛑 Graceful shutdown initiated...');
            server.close(() => {
                console.log('✅ Server shut down successfully');
                process.exit(0);
            });
        });

        console.log('');
        console.log('🎯 CBD Universal Database Features:');
        console.log('   📊 Multi-paradigm support (SQL, NoSQL, Vector, Graph, Time-Series)');
        console.log('   🔄 ACID transactions');
        console.log('   🚀 High-performance storage engine');
        console.log('   🔒 Enterprise security');
        console.log('   📈 Real-time analytics');
        console.log('   🌐 REST API and wire protocol compatibility');
        console.log('');
        console.log('🛠️  Development Phase Status:');
        console.log('   ✅ Phase 1.0: Universal Storage Engine (Active)');
        console.log('   🔄 Phase 1.1: SQL Engine Integration (Next)');
        console.log('   📋 Phase 1.2: Document Database (Planned)');
        console.log('   🎯 Phase 1.3: Vector Database (Planned)');
        console.log('   🌐 Phase 2.0: Graph & Time-Series (Planned)');
        console.log('');
        console.log('Press Ctrl+C to stop the service');

    } catch (error) {
        console.error('❌ Failed to start CBD Universal Database:', error);
        process.exit(1);
    }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Start the service
main().catch((error) => {
    console.error('💥 Startup failed:', error);
    process.exit(1);
});
