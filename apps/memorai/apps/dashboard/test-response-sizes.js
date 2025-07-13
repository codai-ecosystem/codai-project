/**
 * Test script to verify response size optimization is working
 * This tests internal API calls within the dashboard app
 */

const { mcpMemoryClient } = require('./src/lib/mcp-memory-client');

async function testResponseSizes() {
    console.log('🧪 Testing Response Size Optimization...\n');

    try {
        // Test 1: Get full memories (no summary)
        console.log('📊 Test 1: Full response (no optimization)');
        const fullMemories = await mcpMemoryClient.getMemories({
            agentId: 'github-copilot',
            limit: 5,
            summary: false
        });

        const fullSize = JSON.stringify(fullMemories).length;
        console.log(`   Memories count: ${fullMemories.length}`);
        console.log(`   Full response size: ${fullSize} characters`);
        console.log(`   Average per memory: ${Math.round(fullSize / fullMemories.length)} chars\n`);

        // Test 2: Get optimized memories (with summary)
        console.log('📊 Test 2: Optimized response (with summary)');
        const optimizedMemories = await mcpMemoryClient.getMemories({
            agentId: 'github-copilot',
            limit: 5,
            summary: true
        });

        const optimizedSize = JSON.stringify(optimizedMemories).length;
        console.log(`   Memories count: ${optimizedMemories.length}`);
        console.log(`   Optimized response size: ${optimizedSize} characters`);
        console.log(`   Average per memory: ${Math.round(optimizedSize / optimizedMemories.length)} chars\n`);

        // Calculate optimization stats
        const reduction = ((fullSize - optimizedSize) / fullSize * 100).toFixed(1);
        const savedBytes = fullSize - optimizedSize;

        console.log('✅ Optimization Results:');
        console.log(`   Size reduction: ${savedBytes} characters (${reduction}%)`);
        console.log(`   Optimization factor: ${(fullSize / optimizedSize).toFixed(1)}x smaller`);

        // Show sample content comparison
        if (fullMemories.length > 0 && optimizedMemories.length > 0) {
            console.log('\n📝 Content Comparison (first memory):');
            console.log(`   Full content length: ${fullMemories[0].content.length} chars`);
            console.log(`   Optimized content length: ${optimizedMemories[0].content.length} chars`);
            console.log(`   Full: "${fullMemories[0].content.substring(0, 100)}..."`);
            console.log(`   Optimized: "${optimizedMemories[0].content}"`);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testResponseSizes();
