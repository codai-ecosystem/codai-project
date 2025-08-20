#!/usr/bin/env node

/**
 * Simple CBD Enterprise Engine Test
 * 
 * This test validates basic functionality without external dependencies
 */

import { EnterpriseCBDEngine } from './dist/enterprise.js';

async function runSimpleTest() {
    console.log('🚀 Starting Simple CBD Enterprise Test');

    try {
        // Test 1: Initialize with minimal config
        console.log('\n📋 Test 1: Engine Creation');
        const engine = new EnterpriseCBDEngine({
            useRustEngine: false,
            storageBackend: 'memory', // Use in-memory storage
            vectorBackend: 'memory',
            enableMetrics: false,
            enableTransactions: false
        });

        console.log('✅ Engine created successfully');
        console.log('🔧 Using Rust engine:', engine.isUsingRustEngine());

        // Test 2: Health Check (should work without initialization)
        console.log('\n📋 Test 2: Health Check');
        const health = await engine.healthCheck();
        console.log('✅ Health status:', health.status);
        console.log('📊 Health details:', JSON.stringify(health, null, 2));

        // Test 3: Statistics
        console.log('\n📋 Test 3: Engine Statistics');
        const stats = await engine.getStats();
        console.log('✅ Statistics retrieved:', JSON.stringify(stats, null, 2));

        // Test 4: Configuration check
        console.log('\n📋 Test 4: Configuration Validation');
        console.log('✅ Configuration:', JSON.stringify(engine.getConfig(), null, 2));

        console.log('\n🎉 Simple test completed successfully!');
        console.log('\n📈 Summary:');
        console.log('  • Engine creation: ✅');
        console.log('  • Health check: ✅');
        console.log('  • Statistics: ✅');
        console.log('  • Configuration: ✅');

    } catch (error) {
        console.error('❌ Simple test failed:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
}

// Run the test
runSimpleTest().catch(console.error);
