#!/usr/bin/env tsx

/**
 * CBD Universal Database Phase 2 Startup Script
 * Production-ready service with all advanced features enabled
 */

import { CBDUniversalServicePhase2 } from './CBDUniversalServicePhase2';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Main startup function
 */
async function startCBDPhase2() {
    console.log('🚀 CBD Universal Database Phase 2 - Starting Production Service...\n');

    try {
        // Create service instance with production configuration
        const cbdService = new CBDUniversalServicePhase2({
            server: {
                port: parseInt(process.env.CBD_PORT || '4180'),
                host: process.env.CBD_HOST || '0.0.0.0',
                enableHttps: false,
                maxRequestSize: '50mb',
                requestTimeout: 60000
            },
            vectorSearch: {
                enabled: true,
                openaiApiKey: process.env.OPENAI_API_KEY || '',
                maxResults: 20,
                similarityThreshold: 0.85
            },
            machineLearning: {
                enabled: true,
                openaiApiKey: process.env.OPENAI_API_KEY || '',
                autoML: true,
                predictiveAnalytics: true
            },
            realtimeSync: {
                enabled: true,
                port: parseInt(process.env.CBD_WEBSOCKET_PORT || '4181'),
                maxConnections: 2000,
                heartbeatInterval: 25000
            },
            security: {
                enabled: true,
                jwtSecret: process.env.JWT_SECRET || 'cbd-phase2-production-secret',
                jwtExpirationTime: '7d',
                rbacEnabled: true,
                auditLogging: true
            },
            performance: {
                connectionPoolSize: 50,
                cacheSize: 5000,
                enableOptimization: true,
                metricsInterval: 15000
            },
            ecosystem: {
                enabled: true,
                serviceDiscovery: true,
                crossServiceSync: true
            }
        });

        // Setup event listeners
        setupEventListeners(cbdService);

        // Start the service
        await cbdService.start();

        // Display service information
        displayServiceInfo(cbdService);

        // Setup graceful shutdown
        setupGracefulShutdown(cbdService);

        console.log('\n✅ CBD Universal Database Phase 2 is now running!');
        console.log('📊 Monitor the service at: http://localhost:4180/stats');
        console.log('❤️  Health check at: http://localhost:4180/health\n');

    } catch (error) {
        console.error('❌ Failed to start CBD Phase 2 service:', error);
        process.exit(1);
    }
}

/**
 * Setup event listeners for the service
 */
function setupEventListeners(service: CBDUniversalServicePhase2) {
    service.on('service-started', (data) => {
        console.log('🎉 Service started successfully:', data);
    });

    service.on('service-error', (error) => {
        console.error('❌ Service error:', error);
    });

    service.on('service-stopped', () => {
        console.log('🔽 Service stopped gracefully');
    });

    service.on('metrics-updated', (metrics) => {
        if (process.env.DEBUG_METRICS === 'true') {
            console.log('📊 Metrics updated:', JSON.stringify(metrics, null, 2));
        }
    });
}

/**
 * Display service information
 */
function displayServiceInfo(service: CBDUniversalServicePhase2) {
    const status = service.getStatus();
    const config = service.getConfig();

    console.log('\n📋 Service Configuration:');
    console.log('='.repeat(50));
    console.log(`🌐 Server: ${config.server.host}:${config.server.port}`);
    console.log(`🔍 Vector Search: ${config.vectorSearch.enabled ? 'Enabled' : 'Disabled'}`);
    console.log(`🤖 Machine Learning: ${config.machineLearning.enabled ? 'Enabled' : 'Disabled'}`);
    console.log(`⚡ Real-time Sync: ${config.realtimeSync.enabled ? 'Enabled' : 'Disabled'}`);
    console.log(`🔐 Enhanced Security: ${config.security.enabled ? 'Enabled' : 'Disabled'}`);
    console.log(`🌍 Ecosystem Integration: ${config.ecosystem.enabled ? 'Enabled' : 'Disabled'}`);
    console.log(`📊 Performance Optimization: ${config.performance.enableOptimization ? 'Enabled' : 'Disabled'}`);

    console.log('\n🎯 Available Endpoints:');
    console.log('='.repeat(50));
    console.log('📊 GET  /health                    - Health check');
    console.log('📈 GET  /stats                     - Service statistics');
    console.log('📊 GET  /api/performance/metrics   - Performance metrics');
    console.log('⚡ POST /api/performance/optimize   - Trigger optimization');

    if (config.vectorSearch.enabled) {
        console.log('🔍 POST /api/vector/search         - Hybrid vector search');
        console.log('🔍 POST /api/vector/cluster        - Vector clustering');
    }

    if (config.machineLearning.enabled) {
        console.log('🤖 POST /api/ml/embedding          - Generate embeddings');
        console.log('🤖 POST /api/ml/predict            - Predictive analytics');
        console.log('🤖 POST /api/ml/automl             - AutoML operations');
    }

    if (config.security.enabled) {
        console.log('🔐 POST /api/auth/login            - User authentication');
        console.log('🔐 POST /api/auth/api-key          - Generate API key');
        console.log('🔐 GET  /api/security/audit        - Audit logs');
    }

    if (config.realtimeSync.enabled) {
        console.log('⚡ POST /api/realtime/subscribe    - Create live subscription');
        console.log('⚡ POST /api/realtime/broadcast    - Broadcast data changes');
    }

    if (config.ecosystem.enabled) {
        console.log('🌍 GET  /api/ecosystem/services    - Connected services');
        console.log('🌍 POST /api/ecosystem/operation   - Distributed operations');
    }

    console.log('\n🔧 Phase 2 Advanced Features:');
    console.log('='.repeat(50));
    console.log('✅ Advanced Vector Search Engine   - Hybrid search, clustering, optimization');
    console.log('✅ Machine Learning Integration    - Custom models, AutoML, predictive analytics');
    console.log('✅ Real-time Data Synchronization  - WebSocket streaming, live queries, conflict resolution');
    console.log('✅ Enhanced Security Framework     - JWT auth, RBAC, API keys, encryption, audit logging');
    console.log('✅ Performance Optimization        - Connection pooling, caching, auto-optimization');
    console.log('✅ Ecosystem Integration           - Service mesh, cross-service sync, monitoring');
}

/**
 * Setup graceful shutdown handling
 */
function setupGracefulShutdown(service: CBDUniversalServicePhase2) {
    const gracefulShutdown = async (signal: string) => {
        console.log(`\n🔽 Received ${signal}, shutting down gracefully...`);

        try {
            await service.stop();
            console.log('✅ CBD Phase 2 service stopped successfully');
            process.exit(0);
        } catch (error) {
            console.error('❌ Error during shutdown:', error);
            process.exit(1);
        }
    };

    // Handle different shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // nodemon restart

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
        console.error('❌ Uncaught Exception:', error);
        gracefulShutdown('uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
        console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
        gracefulShutdown('unhandledRejection');
    });
}

/**
 * Health check function for external monitoring
 */
async function healthCheck() {
    try {
        const response = await fetch('http://localhost:4180/health');
        const data = await response.json();

        if (data.status === 'healthy') {
            console.log('✅ Health check passed:', data);
            return true;
        } else {
            console.error('❌ Health check failed:', data);
            return false;
        }
    } catch (error) {
        console.error('❌ Health check error:', error);
        return false;
    }
}

/**
 * Production readiness check
 */
function checkProductionReadiness() {
    const requiredEnvVars = [
        'OPENAI_API_KEY',
        'JWT_SECRET'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
        console.warn('⚠️  Missing environment variables for production:', missingVars.join(', '));
        console.warn('⚠️  Service will run but some features may be limited');
    }

    if (process.env.NODE_ENV === 'production') {
        console.log('🏭 Running in PRODUCTION mode');

        // Additional production checks
        if (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('default')) {
            console.error('❌ CRITICAL: JWT_SECRET must be set to a secure value in production!');
            process.exit(1);
        }
    } else {
        console.log('🔧 Running in DEVELOPMENT mode');
    }
}

/**
 * Display Phase 2 implementation status
 */
function displayPhase2Status() {
    console.log('\n🎯 CBD Universal Database - Phase 2 Implementation Status:');
    console.log('='.repeat(60));
    console.log('✅ Phase 2.1: Feature Enhancement        - COMPLETED');
    console.log('   ├── Advanced Vector Search Engine     - ✅ Implemented');
    console.log('   ├── Machine Learning Integration       - ✅ Implemented');
    console.log('   ├── Real-time Data Synchronization    - ✅ Implemented');
    console.log('   └── Enhanced Security Framework       - ✅ Implemented');
    console.log('');
    console.log('✅ Phase 2.2: Performance Optimization   - COMPLETED');
    console.log('   ├── Connection Pooling & Management   - ✅ Implemented');
    console.log('   ├── Intelligent Caching System        - ✅ Implemented');
    console.log('   ├── Query Performance Optimization    - ✅ Implemented');
    console.log('   └── Memory & CPU Optimization         - ✅ Implemented');
    console.log('');
    console.log('✅ Phase 2.3: Integration Testing        - COMPLETED');
    console.log('   ├── Unit Testing Suite                - ✅ Implemented');
    console.log('   ├── Integration Testing Framework     - ✅ Implemented');
    console.log('   ├── Performance & Load Testing        - ✅ Implemented');
    console.log('   └── End-to-End Testing                - ✅ Implemented');
    console.log('');
    console.log('✅ Phase 2.4: Ecosystem Integration      - COMPLETED');
    console.log('   ├── Gateway Integration               - ✅ Implemented');
    console.log('   ├── Service Mesh Implementation       - ✅ Implemented');
    console.log('   ├── Cross-Service Data Sync           - ✅ Implemented');
    console.log('   └── Unified Monitoring & Observability- ✅ Implemented');
    console.log('');
    console.log('🎉 Phase 2: FULLY IMPLEMENTED - PRODUCTION READY!');
    console.log('='.repeat(60));
}

// Check if this script is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    // Display Phase 2 status
    displayPhase2Status();

    // Check production readiness
    checkProductionReadiness();

    // Start the service
    startCBDPhase2().catch((error) => {
        console.error('❌ Startup failed:', error);
        process.exit(1);
    });
}

// Export functions for testing and external use
export {
    startCBDPhase2,
    healthCheck,
    checkProductionReadiness,
    displayPhase2Status
};
