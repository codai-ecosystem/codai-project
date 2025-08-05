/**
 * Advanced usage example for MemorAI SDK
 * 
 * This example demonstrates advanced features like batch operations,
 * custom search algorithms, performance monitoring, and error handling.
 */

const { MemorAI, validateMemoryInput, formatMemoryContent, findSimilarMemories } = require('../dist/index.js');

async function advancedUsageExample() {
  const client = new MemorAI({
    baseUrl: 'http://localhost:4006',
    apiKey: process.env.MEMORAI_API_KEY,
    timeout: 30000,
    retries: 3,
    enableWebSocket: true,
    debug: process.env.NODE_ENV === 'development'
  });

  try {
    // 1. Batch operations
    console.log('📦 Performing batch operations...');

    const batchOperations = [
      {
        operation: 'create',
        data: {
          content: 'Advanced TypeScript patterns for large-scale applications',
          title: 'TypeScript Patterns',
          category: 'programming',
          tags: ['typescript', 'patterns', 'architecture']
        }
      },
      {
        operation: 'create',
        data: {
          content: 'Database optimization techniques for high-performance applications',
          title: 'Database Optimization',
          category: 'database',
          tags: ['database', 'optimization', 'performance']
        }
      },
      {
        operation: 'create',
        data: {
          content: 'Modern CSS Grid and Flexbox layout techniques',
          title: 'CSS Layout Techniques',
          category: 'frontend',
          tags: ['css', 'layout', 'grid', 'flexbox']
        }
      }
    ];

    const batchResult = await client.memories.batch(batchOperations);
    console.log(`Batch result: ${batchResult.summary.successful} successful, ${batchResult.summary.failed} failed`);

    // 2. Advanced search with custom scoring
    console.log('\n🎯 Advanced search operations...');

    const searchQueries = [
      { query: 'typescript programming', algorithm: 'semantic' },
      { query: 'database performance', algorithm: 'fulltext' },
      { query: 'css layout', algorithm: 'exact' }
    ];

    const searchResults = await Promise.all(
      searchQueries.map(async ({ query, algorithm }) => {
        const result = await client.search.query(query, {
          algorithm,
          limit: 10,
          sortBy: 'relevance',
          threshold: 0.7
        });
        return { query, algorithm, ...result };
      })
    );

    searchResults.forEach(result => {
      console.log(`${result.algorithm} search for "${result.query}": ${result.total} results (${result.took}ms)`);
    });

    // 3. Performance monitoring
    console.log('\n⚡ Performance monitoring...');

    // Perform multiple operations to generate metrics
    const performanceTests = Array.from({ length: 10 }, (_, i) =>
      client.search.query(`test query ${i}`, { algorithm: 'exact' })
    );

    await Promise.all(performanceTests);

    const metrics = client.getPerformanceMetrics();
    const avgResponseTime = metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length;
    console.log(`Average response time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`Cache hit rate: ${(metrics.filter(m => m.cacheHit).length / metrics.length * 100).toFixed(1)}%`);

    // 4. Advanced analytics
    console.log('\n📈 Advanced analytics...');

    const [memoryAnalytics, searchAnalytics, performanceAnalytics] = await Promise.all([
      client.analytics.memories(),
      client.analytics.search(),
      client.analytics.performance()
    ]);

    console.log('Memory Analytics:');
    console.log(`- Total memories: ${memoryAnalytics.total}`);
    console.log(`- Top category: ${Object.entries(memoryAnalytics.byCategory)[0]?.[0] || 'None'}`);

    console.log('Search Analytics:');
    console.log(`- Total queries: ${searchAnalytics.totalQueries}`);
    console.log(`- Avg response time: ${searchAnalytics.avgResponseTime}ms`);

    console.log('Performance Analytics:');
    console.log(`- P95 response time: ${performanceAnalytics.responseTime.p95}ms`);
    console.log(`- Throughput: ${performanceAnalytics.throughput} req/s`);
    console.log(`- Error rate: ${(performanceAnalytics.errorRate * 100).toFixed(2)}%`);

    // 5. Memory similarity analysis
    console.log('\n🧠 Memory similarity analysis...');

    const allMemories = await client.memories.list({ limit: 100 });

    if (allMemories.memories.length > 1) {
      const targetMemory = allMemories.memories[0];
      const similarMemories = findSimilarMemories(
        targetMemory,
        allMemories.memories,
        0.3, // similarity threshold
        5    // max results
      );

      console.log(`Found ${similarMemories.length} similar memories to "${formatMemoryContent(targetMemory, 50)}"`);
      similarMemories.forEach((similar, index) => {
        console.log(`${index + 1}. ${formatMemoryContent(similar, 50)} (similarity: ${similar.similarity.toFixed(2)})`);
      });
    }

    // 6. Category management
    console.log('\n📁 Category management...');

    const newCategory = await client.categories.create(
      'machine-learning',
      'Machine Learning and AI related content'
    );
    console.log(`Created category: ${newCategory.name}`);

    const categories = await client.categories.list();
    console.log(`Total categories: ${categories.length}`);

    // Update the category
    const updatedCategory = await client.categories.update(
      newCategory.id,
      'machine-learning-ai',
      'Machine Learning and Artificial Intelligence'
    );
    console.log(`Updated category: ${updatedCategory.name}`);

    // 7. Error handling and validation
    console.log('\n🛡️ Error handling and validation...');

    // Test input validation
    const invalidInputs = [
      { content: '' },
      { content: 'Valid', tags: ['a'.repeat(51)] },
      { content: 'a'.repeat(10001) }
    ];

    invalidInputs.forEach((input, index) => {
      const validation = validateMemoryInput(input);
      if (!validation.valid) {
        console.log(`Input ${index + 1} validation errors:`, validation.errors);
      }
    });

    // Test error handling
    try {
      await client.memories.get('non-existent-id');
    } catch (error) {
      console.log('Expected error for non-existent memory:', error.response?.status);
    }

    // 8. Rate limiting information
    const rateLimitInfo = client.getRateLimitInfo();
    if (rateLimitInfo) {
      console.log('\n⏱️ Rate limit info:');
      console.log(`- Limit: ${rateLimitInfo.limit} requests`);
      console.log(`- Remaining: ${rateLimitInfo.remaining} requests`);
      console.log(`- Reset time: ${rateLimitInfo.resetTime.toISOString()}`);
    }

    // 9. Session management
    console.log('\n👤 Session management...');

    try {
      const session = await client.session.get();
      console.log(`Current user: ${session.userId}`);
      console.log(`Session authenticated: ${session.isAuthenticated}`);
      console.log(`Permissions: ${session.permissions.join(', ')}`);
    } catch (error) {
      console.log('Session info not available (not authenticated)');
    }

    // 10. Cleanup
    await client.categories.delete(newCategory.id);
    console.log('Category cleaned up');

  } catch (error) {
    console.error('Advanced usage error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  } finally {
    client.destroy();
  }
}

// Real-time collaboration example
async function realTimeCollaborationExample() {
  console.log('\n🤝 Real-time collaboration example...');

  const client = new MemorAI({
    baseUrl: 'http://localhost:4006',
    enableWebSocket: true
  });

  // Set up event handlers for collaboration
  client.on('memory:created', (memory) => {
    console.log(`👥 User created memory: ${memory.title || memory.id}`);
  });

  client.on('memory:updated', (memory) => {
    console.log(`👥 User updated memory: ${memory.title || memory.id}`);
  });

  client.on('memory:deleted', ({ id }) => {
    console.log(`👥 User deleted memory: ${id}`);
  });

  // Simulate collaborative editing
  await new Promise(resolve => {
    setTimeout(() => {
      console.log('Collaboration session ended');
      client.destroy();
      resolve(undefined);
    }, 10000); // Listen for 10 seconds
  });
}

// Performance benchmarking
async function performanceBenchmark() {
  console.log('\n🏃‍♂️ Performance benchmark...');

  const client = new MemorAI({
    baseUrl: 'http://localhost:4006',
    timeout: 5000
  });

  const benchmarks = {
    createMemory: [],
    searchMemory: [],
    getMemory: [],
    updateMemory: []
  };

  // Benchmark memory creation
  for (let i = 0; i < 10; i++) {
    const start = Date.now();
    const memory = await client.memories.create({
      content: `Benchmark memory ${i}`,
      tags: [`benchmark-${i}`]
    });
    benchmarks.createMemory.push(Date.now() - start);

    // Benchmark memory retrieval
    const getStart = Date.now();
    await client.memories.get(memory.id);
    benchmarks.getMemory.push(Date.now() - getStart);

    // Benchmark memory update
    const updateStart = Date.now();
    await client.memories.update(memory.id, { title: `Updated ${i}` });
    benchmarks.updateMemory.push(Date.now() - updateStart);

    // Clean up
    await client.memories.delete(memory.id);
  }

  // Benchmark search
  for (let i = 0; i < 10; i++) {
    const start = Date.now();
    await client.search.query(`benchmark query ${i}`);
    benchmarks.searchMemory.push(Date.now() - start);
  }

  // Calculate statistics
  Object.entries(benchmarks).forEach(([operation, times]) => {
    const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    console.log(`${operation}: avg=${avg.toFixed(2)}ms min=${min}ms max=${max}ms`);
  });

  client.destroy();
}

// Export for use in other modules
export {
  advancedUsageExample,
  realTimeCollaborationExample,
  performanceBenchmark
};

// Run examples if this file is executed directly
if (require.main === module) {
  (async () => {
    await advancedUsageExample();
    await realTimeCollaborationExample();
    await performanceBenchmark();
    console.log('\n✅ All advanced examples completed');
  })().catch(error => {
    console.error('\n❌ Advanced examples failed:', error);
    process.exit(1);
  });
}
