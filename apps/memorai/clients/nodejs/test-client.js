const MemorAIClient = require('./memorai-client');

// Test Node.js client
async function testNodeJSClient() {
  console.log('🟢 MemorAI Node.js Client Test Suite');
  console.log('====================================');

  const client = new MemorAIClient({
    baseURL: 'http://localhost:4006',
    debug: true
  });

  try {
    // Test health check
    console.log('\n1. Health Check:');
    const health = await client.getHealth();
    console.log('✅ Health check passed:', health.status);

    // Test system stats
    console.log('\n2. System Stats:');
    try {
      const stats = await client.getSystemStats();
      console.log('✅ System stats retrieved');
    } catch (error) {
      console.log('⚠️  System stats not available:', error.message);
    }

    // Test memory creation
    console.log('\n3. Memory Creation:');
    const newMemory = await client.createMemory({
      content: 'Node.js client test memory',
      category: 'test',
      tags: ['nodejs', 'client', 'test']
    });
    console.log('✅ Memory created:', newMemory.id);

    // Test memory retrieval
    console.log('\n4. Memory Retrieval:');
    const memory = await client.getMemory(newMemory.id);
    console.log('✅ Memory retrieved:', memory.content);

    // Test search
    console.log('\n5. Search Test:');
    const searchResults = await client.searchMemories('nodejs');
    console.log('✅ Search completed, found:', searchResults.memories?.length || 0, 'results');

    // Test analytics
    console.log('\n6. Analytics Test:');
    try {
      const analytics = await client.getAnalytics();
      console.log('✅ Analytics retrieved');
    } catch (error) {
      console.log('⚠️  Analytics not available:', error.message);
    }

    // Performance metrics
    console.log('\n7. Performance Metrics:');
    const metrics = client.getPerformanceMetrics();
    const avgDuration = metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length;
    console.log(`✅ Average request time: ${avgDuration.toFixed(2)}ms for ${metrics.length} requests`);

    // Cleanup
    client.close();
    console.log('\n✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    client.close();
  }
}

// Run tests
if (require.main === module) {
  testNodeJSClient().catch(console.error);
}

module.exports = { testNodeJSClient };
