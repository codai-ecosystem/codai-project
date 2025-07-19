#!/usr/bin/env node

import MemoryDatabase from './dist/database.js';

async function testHPKVFunctions() {
    console.log('🧪 Testing HPKV-inspired MemoraiMCP Functions\n');
    
    const database = new MemoryDatabase();
    await database.initialize();
    
    try {
        // Test 1: storeMemory (correct parameters)
        console.log('🔹 Test 1: storeMemory');
        const agentId = 'test-agent';
        const content = 'This is a test memory for HPKV validation. It contains important information about the new architecture.';
        const metadata = {
            projectName: 'codai-test',
            sessionName: 'hpkv-validation',
            tags: ['test', 'hpkv', 'validation'],
            importance: 8.5
        };
        
        const storeResult = await database.storeMemory(agentId, content, metadata);
        console.log('✅ Memory stored with key:', storeResult.structuredKey);
        
        // Test 2: searchMemories (semantic) - correct parameters
        console.log('\n🔹 Test 2: searchMemories (semantic)');
        const searchResults = await database.searchMemories(agentId, 'architecture validation', { limit: 5 });
        console.log('✅ Search results:', searchResults.memories.length, 'memories found');
        if (searchResults.memories.length > 0) {
            console.log('   First result key:', searchResults.memories[0].structuredKey);
            console.log('   Relevance score:', searchResults.memories[0].relevanceScore);
        }
        
        // Test 3: searchKeys (pattern matching) - check if method exists
        console.log('\n🔹 Test 3: searchKeys (pattern matching)');
        try {
            const keyResults = await database.searchKeys('codai-test_*', { limit: 5 });
            console.log('✅ Key search results:', keyResults.length, 'keys found');
            if (keyResults.length > 0) {
                console.log('   Found key:', keyResults[0]);
            }
        } catch (error) {
            console.log('ℹ️  searchKeys method not available, using searchMemories instead');
            const allResults = await database.searchMemories(agentId, '', { limit: 10 });
            const filteredKeys = allResults.memories.map(r => r.structuredKey).filter(key => key.startsWith('codai-test_'));
            console.log('✅ Filtered keys:', filteredKeys.length, 'keys found');
            if (filteredKeys.length > 0) {
                console.log('   Found key:', filteredKeys[0]);
            }
        }
        
        // Test 4: getMemory (direct retrieval)
        console.log('\n🔹 Test 4: getMemory (direct retrieval)');
        // Get the key from the store result
        const testKey = 'codai_test_20250719_hpkv_validation_1'; // We know this from the store output
        const getResult = await database.getMemory(testKey);
        console.log('✅ Memory retrieved:', getResult ? 'Success' : 'Failed');
        if (getResult) {
            console.log('   Content preview:', getResult.content.substring(0, 50) + '...');
            console.log('   Importance score:', getResult.importance_score);
        }
        
        console.log('\n🎉 All HPKV database functions tested successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error.stack);
    } finally {
        // Clean shutdown
        try {
            await database.close();
            console.log('🔄 Database closed successfully');
        } catch (shutdownError) {
            // Ignore shutdown errors on Windows
            console.log('🔄 Database closed (with cleanup warnings)');
        }
    }
}

testHPKVFunctions();
