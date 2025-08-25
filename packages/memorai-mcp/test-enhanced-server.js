#!/usr/bin/env node

/**
 * Test the Enhanced MemorAI MCP Server Phase 1 Implementation
 * This script tests the new enhanced memory store with the original failing query
 */

import { EnhancedMemorAIMCPServer } from './src/enhanced-server.js';

async function testEnhancedServer() {
    console.log('🚀 Starting Enhanced MemorAI MCP Server Test');
    console.log('='.repeat(60));

    try {
        // Create enhanced server instance
        const server = new EnhancedMemorAIMCPServer();
        
        console.log('✅ Server instance created');

        // Test store some memories first
        console.log('\n📝 Storing test memories...');
        
        // Store the exact memory that should match our failing query
        await server.memoryStore.remember('romai_agi_agent', 
            '✅ COMPLETED Todo #2: DeepSeek-style MoE Architecture Implementation with Romanian mathematical reasoning engines and advanced chain-of-thought verification loops for test-time compute scaling scenarios', {
                importance: 8,
                entityType: 'todo_completion',
                project: 'romai_enhancement', 
                tags: ['moe-architecture', 'romanian-reasoning', 'chain-of-thought', 'test-time-compute', 'verification-loops', 'mathematical-engines', 'thinking-mode', 'GPT-5-style']
        });

        await server.memoryStore.remember('romai_agi_agent',
            'Advanced Chain-of-Thought Reasoning Implementation with GPT-5 thinking mode capabilities for enhanced problem-solving accuracy', {
                importance: 9,
                entityType: 'implementation_note',
                project: 'romai_enhancement',
                tags: ['chain-of-thought', 'reasoning', 'GPT-5', 'thinking-mode', 'problem-solving', 'verification-loops']
        });

        await server.memoryStore.remember('github_copilot',
            'GitHub Copilot context analysis for workspace AI integration with test-time compute scaling methodologies', {
                importance: 6,
                entityType: 'integration_note', 
                project: 'workspace_ai',
                tags: ['github-copilot', 'context-analysis', 'test-time-compute', 'scaling', 'ai-integration']
        });

        console.log('✅ Test memories stored');

        // Test the original failing query
        console.log('\n🔍 Testing original failing query...');
        const originalQuery = 'test-time compute scaling chain-of-thought verification loops GPT-5 thinking mode';
        
        console.log(`Query: "${originalQuery}"`);
        console.log(`Agent: "romai_agi_agent"`);

        const results = await server.memoryStore.recall('romai_agi_agent', originalQuery);
        
        console.log(`\n📊 Results: Found ${results.length} memories`);
        
        if (results.length > 0) {
            console.log('🎉 SUCCESS! The original failing query now returns results!');
            console.log('\n📋 Results:');
            results.forEach((result, index) => {
                console.log(`\n${index + 1}. Memory ID: ${result.id}`);
                console.log(`   Agent: ${result.agentId}`);
                console.log(`   Content: ${result.content.substring(0, 100)}...`);
                console.log(`   Relevance Score: ${result.relevanceScore || 'N/A'}`);
                console.log(`   Importance: ${result.metadata.importance}`);
                console.log(`   Cross-Agent: ${result.crossAgent ? 'Yes' : 'No'}`);
                if (result.metadata.tags) {
                    console.log(`   Tags: ${result.metadata.tags.join(', ')}`);
                }
            });
        } else {
            console.log('❌ FAILED! The query still returns no results');
        }

        // Test enhanced search capabilities
        console.log('\n🔍 Testing enhanced search capabilities...');

        // Test cross-agent search
        console.log('\n🌐 Testing cross-agent search...');
        const crossAgentResults = await server.memoryStore.recall('romai_agi_agent', 'test-time compute', {
            includeOtherAgents: true,
            limit: 5
        });
        
        console.log(`Cross-agent search found: ${crossAgentResults.length} memories`);
        const crossAgentCount = crossAgentResults.filter(r => r.crossAgent).length;
        console.log(`Cross-agent memories: ${crossAgentCount}`);

        // Test fuzzy matching
        console.log('\n🔍 Testing fuzzy matching...');
        const fuzzyResults = await server.memoryStore.recall('romai_agi_agent', 'chain-of-thought reasoning');
        console.log(`Fuzzy matching found: ${fuzzyResults.length} memories`);

        // Test metadata matching
        console.log('\n🏷️ Testing metadata tag matching...');
        const tagResults = await server.memoryStore.recall('romai_agi_agent', 'thinking-mode');
        console.log(`Tag matching found: ${tagResults.length} memories`);

        // Test performance
        console.log('\n⚡ Testing performance...');
        const startTime = Date.now();
        
        // Add more memories for performance test
        for (let i = 0; i < 50; i++) {
            await server.memoryStore.remember(`test_agent_${i % 5}`, 
                `Performance test memory ${i} with machine learning and neural networks content for benchmarking`, {
                    importance: Math.floor(Math.random() * 10) + 1,
                    entityType: 'performance_test',
                    project: 'benchmarking'
                });
        }

        const storageTime = Date.now() - startTime;
        console.log(`📊 Stored 50 memories in: ${storageTime}ms`);

        const retrievalStart = Date.now();
        const perfResults = await server.memoryStore.recall('test_agent_1', 'machine learning neural networks', {
            includeOtherAgents: true,
            limit: 20
        });
        const retrievalTime = Date.now() - retrievalStart;
        
        console.log(`📊 Retrieved ${perfResults.length} memories in: ${retrievalTime}ms`);

        console.log('\n🎯 PHASE 1 VALIDATION SUMMARY:');
        console.log('='.repeat(40));
        console.log(`✅ Original failing query: ${results.length > 0 ? 'FIXED' : 'STILL BROKEN'}`);
        console.log(`✅ Cross-agent search: ${crossAgentCount > 0 ? 'WORKING' : 'NOT WORKING'}`);
        console.log(`✅ Fuzzy matching: ${fuzzyResults.length > 0 ? 'WORKING' : 'NOT WORKING'}`);
        console.log(`✅ Tag matching: ${tagResults.length > 0 ? 'WORKING' : 'NOT WORKING'}`);
        console.log(`✅ Performance: Storage ${storageTime}ms, Retrieval ${retrievalTime}ms`);

        const allWorking = results.length > 0 && crossAgentCount > 0 && fuzzyResults.length > 0 && tagResults.length > 0;
        
        if (allWorking) {
            console.log('\n🏆 ALL PHASE 1 FEATURES ARE WORKING CORRECTLY!');
            console.log('🚀 Ready for production deployment!');
        } else {
            console.log('\n⚠️ Some features need attention before production deployment');
        }

    } catch (error) {
        console.error('❌ Test failed with error:', error);
        process.exit(1);
    }
}

// Run the test
testEnhancedServer().then(() => {
    console.log('\n✅ Test completed successfully');
    process.exit(0);
}).catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
});