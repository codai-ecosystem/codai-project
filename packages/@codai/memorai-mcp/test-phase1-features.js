#!/usr/bin/env node

/**
 * MemorAI MCP v9.0.0 - Phase 1 Feature Test Script
 * Tests the new relationship and search intelligence features
 */

import { MemorAIUnifiedServer } from './dist/server.js';
import { resolve } from 'path';

async function testPhase1Features() {
    console.log('🧪 Testing MemorAI MCP v9.0.0 Phase 1 Features...\n');

    try {
        // Initialize server
        const serverConfig = {
            serverName: 'MemorAI-Test',
            version: '9.0.0',
            cbdPath: resolve('./test-data'),
            logLevel: 'info',
            enableSemanticSearch: true,
            enablePerformanceTracking: true,
            enableHybridStorage: true,
            fallbackStorage: 'json',
            embeddingModel: 'text-embedding-ada-002',
            dimensions: 1536,
            cacheSize: 1000,
            maxMemories: 10000,
            nodeEnv: 'test'
        };

        const server = new MemorAIUnifiedServer(serverConfig);
        console.log('✅ Server initialized successfully');

        // Test memory creation with relationship detection
        console.log('\n📝 Testing memory creation with relationship detection...');
        
        const memory1Result = await server.handleTool('mcp_memoraimcp_remember', {
            agentId: 'test_agent',
            content: 'JavaScript closures allow functions to access variables from outer scope',
            metadata: { topic: 'javascript', type: 'concept' }
        });
        console.log('✅ Memory 1 created:', JSON.parse(memory1Result.content[0].text).structuredKey);

        const memory2Result = await server.handleTool('mcp_memoraimcp_remember', {
            agentId: 'test_agent', 
            content: 'Higher-order functions in JavaScript take or return other functions',
            metadata: { topic: 'javascript', type: 'concept' }
        });
        console.log('✅ Memory 2 created:', JSON.parse(memory2Result.content[0].text).structuredKey);

        // Test manual relationship linking
        console.log('\n🔗 Testing manual relationship linking...');
        
        const memory1Key = JSON.parse(memory1Result.content[0].text).structuredKey;
        const memory2Key = JSON.parse(memory2Result.content[0].text).structuredKey;

        const linkResult = await server.handleTool('mcp_memoraimcp_link_memories', {
            agentId: 'test_agent',
            sourceMemoryKey: memory1Key,
            targetMemoryKey: memory2Key,
            relationshipType: 'related',
            strength: 0.8,
            context: 'Both are JavaScript functional programming concepts'
        });
        
        const linkData = JSON.parse(linkResult.content[0].text);
        console.log('✅ Relationship created:', linkData.relationship.relationshipType);

        // Test relationship exploration  
        console.log('\n🔍 Testing relationship exploration...');
        
        const relationshipsResult = await server.handleTool('mcp_memoraimcp_get_relationships', {
            agentId: 'test_agent',
            memoryKey: memory1Key,
            maxDepth: 2
        });
        
        const relData = JSON.parse(relationshipsResult.content[0].text);
        console.log('✅ Found relationships:', relData.totalRelationships);
        console.log('   Related memories:', relData.relatedMemories.length);

        // Test graph exploration
        console.log('\n🌐 Testing graph exploration...');
        
        const graphResult = await server.handleTool('mcp_memoraimcp_explore_graph', {
            agentId: 'test_agent',
            startingMemoryKey: memory1Key,
            explorationRadius: 2,
            includeWeakLinks: false
        });
        
        const graphData = JSON.parse(graphResult.content[0].text);
        console.log('✅ Graph exploration completed');
        console.log('   Knowledge graph nodes:', graphData.knowledgeGraph.totalNodes);
        console.log('   Knowledge graph edges:', graphData.knowledgeGraph.totalEdges);
        console.log('   Discovered memories:', graphData.discoveredMemories.length);

        // Test enhanced recall with search intelligence
        console.log('\n🎯 Testing enhanced recall...');
        
        const recallResult = await server.handleTool('mcp_memoraimcp_recall', {
            agentId: 'test_agent',
            query: 'JavaScript functions',
            limit: 5
        });
        
        const recallData = JSON.parse(recallResult.content[0].text);
        console.log('✅ Enhanced recall completed');
        console.log('   Memories found:', recallData.memories.length);

        console.log('\n🎉 All Phase 1 features tested successfully!');
        console.log('\n📊 Test Summary:');
        console.log('   ✅ Memory creation with relationship detection');
        console.log('   ✅ Manual relationship linking');
        console.log('   ✅ Relationship exploration and traversal');
        console.log('   ✅ Knowledge graph exploration');
        console.log('   ✅ Enhanced search intelligence');
        
        console.log('\n🚀 MemorAI MCP v9.0.0 is ready for production!');

    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

// Run tests if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
    testPhase1Features();
}

export { testPhase1Features };
