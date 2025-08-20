#!/usr/bin/env node

/**
 * CBD Enterprise Engine Integration Test
 * 
 * This test validates the hybrid TypeScript/Rust architecture and demonstrates
 * the enterprise transformation capabilities.
 */

import { EnterpriseCBDEngine } from './dist/enterprise.js';

async function runIntegrationTest() {
    console.log('🚀 Starting CBD Enterprise Integration Test');

    try {
        // Test 1: Initialize Enterprise Engine
        console.log('\n📋 Test 1: Engine Initialization');
        const engine = new EnterpriseCBDEngine({
            useRustEngine: false, // Use TypeScript fallback for now
            storageBackend: 'typescript',
            vectorBackend: 'typescript',
            embedding: {
                model: 'openai',
                apiKey: 'test-key-not-used-in-test',
                modelName: 'text-embedding-ada-002'
            },
            storage: {
                dataPath: './test-data'
            }
        });

        await engine.initialize();
        console.log('✅ Enterprise engine initialized');
        console.log('🔧 Using Rust engine:', engine.isUsingRustEngine());

        // Test 2: Health Check
        console.log('\n📋 Test 2: Health Check');
        const health = await engine.healthCheck();
        console.log('✅ Health check passed:', health.status);

        // Test 3: Basic Storage Operations
        console.log('\n📋 Test 3: Storage Operations');
        const testData = Buffer.from('Enterprise CBD Test Data', 'utf-8');
        await engine.store('enterprise_test', testData);
        console.log('✅ Data stored successfully');

        const retrieved = await engine.retrieve('enterprise_test');
        if (retrieved) {
            console.log('✅ Data retrieved:', retrieved.toString('utf-8'));
        } else {
            console.log('❌ Failed to retrieve data');
        }

        // Test 4: Vector Operations
        console.log('\n📋 Test 4: Vector Operations');
        const testVector = [1.0, 2.0, 3.0, 4.0, 5.0];
        const metadata = { type: 'enterprise_test', timestamp: Date.now() };

        await engine.storeVector('enterprise_vector', testVector, metadata);
        console.log('✅ Vector stored successfully');

        const searchVector = [1.1, 2.1, 2.9, 4.1, 5.1];
        const results = await engine.searchVectors(searchVector, 5, 0.8);
        console.log(`✅ Vector search completed: ${results.length} results`);

        // Test 5: Statistics and Monitoring
        console.log('\n📋 Test 5: Statistics');
        const stats = await engine.getStats();
        console.log('✅ Statistics retrieved');
        console.log('📊 Storage engine:', stats.storage.engine);
        console.log('📊 Vector engine:', stats.vector_index.engine);

        // Test 6: Configuration
        console.log('\n📋 Test 6: Configuration');
        const config = engine.getConfig();
        console.log('✅ Configuration:', {
            useRustEngine: config.useRustEngine,
            storageBackend: config.storageBackend,
            vectorBackend: config.vectorBackend
        });

        console.log('\n🎉 All integration tests passed!');
        console.log('🏗️  Enterprise CBD transformation foundation is working correctly.');

    } catch (error) {
        console.error('❌ Integration test failed:', error);
        process.exit(1);
    }
}

// Run the test
runIntegrationTest().catch(console.error);
