/**
 * Basic usage example for MemorAI SDK
 * 
 * This example demonstrates the core functionality of the MemorAI SDK
 * including creating memories, searching, and handling events.
 */

// Import the SDK from the built distribution
const { MemorAI } = require('../dist/index.js');

async function basicUsageExample() {
  // Initialize the SDK
  const client = new MemorAI({
    baseUrl: 'http://localhost:4006',
    apiKey: 'your-api-key', // Optional for development
    enableWebSocket: true,
    debug: true
  });

  try {
    // 1. Check system health
    console.log('🏥 Checking system health...');
    const health = await client.system.health();
    console.log('Health status:', health.status);

    // 2. Create some memories
    console.log('\n📝 Creating memories...');

    const memory1 = await client.memories.create({
      content: 'Machine learning is a subset of artificial intelligence that focuses on algorithms and statistical models.',
      title: 'Machine Learning Definition',
      category: 'education',
      tags: ['ai', 'ml', 'definition', 'technology']
    });
    console.log('Created memory 1:', memory1.id);

    const memory2 = await client.memories.create({
      content: 'JavaScript is a versatile programming language used for web development, server-side programming, and more.',
      title: 'JavaScript Overview',
      category: 'programming',
      tags: ['javascript', 'programming', 'web-development']
    });
    console.log('Created memory 2:', memory2.id);

    const memory3 = await client.memories.create({
      content: 'React is a popular JavaScript library for building user interfaces, especially single-page applications.',
      title: 'React Framework',
      category: 'programming',
      tags: ['react', 'javascript', 'frontend', 'ui']
    });
    console.log('Created memory 3:', memory3.id);

    // 3. Search memories using different algorithms
    console.log('\n🔍 Searching memories...');

    // Exact search
    const exactResults = await client.search.exact('JavaScript');
    console.log(`Exact search results: ${exactResults.total} memories found`);

    // Semantic search
    const semanticResults = await client.search.semantic('programming languages');
    console.log(`Semantic search results: ${semanticResults.total} memories found`);

    // Fuzzy search (typo-tolerant)
    const fuzzyResults = await client.search.fuzzy('machien lerning'); // Note the typos
    console.log(`Fuzzy search results: ${fuzzyResults.total} memories found`);

    // Full-text search with options
    const fullTextResults = await client.search.fulltext('web development', {
      limit: 5,
      category: 'programming',
      sortBy: 'relevance'
    });
    console.log(`Full-text search results: ${fullTextResults.total} memories found`);

    // 4. Get search suggestions
    const suggestions = await client.search.suggestions('prog', 5);
    console.log('Search suggestions:', suggestions);

    // 5. Update a memory
    console.log('\n✏️ Updating memory...');
    const updatedMemory = await client.memories.update(memory1.id, {
      tags: [...memory1.tags, 'updated', 'example']
    });
    console.log('Updated memory tags:', updatedMemory.tags);

    // 6. List memories with pagination
    console.log('\n📋 Listing memories...');
    const memoryList = await client.memories.list({
      page: 1,
      limit: 10,
      category: 'programming',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    console.log(`Found ${memoryList.total} memories in programming category`);

    // 7. Get analytics
    console.log('\n📊 Getting analytics...');
    const analytics = await client.analytics.get();
    console.log('Total memories:', analytics.totalMemories);
    console.log('Categories:', Object.keys(analytics.categoryCounts));
    console.log('Average response time:', analytics.performanceMetrics.avgResponseTime + 'ms');

    // 8. Get categories and tags
    const categories = await client.categories.list();
    console.log('Available categories:', categories.map(c => c.name));

    const popularTags = await client.tags.popular(10);
    console.log('Popular tags:', popularTags.map(t => t.name));

    // 9. Test performance
    console.log('\n⚡ Testing performance...');
    const pingResult = await client.system.ping();
    console.log(`API latency: ${pingResult.latency}ms`);

    // 10. Cleanup - delete created memories
    console.log('\n🗑️ Cleaning up...');
    await client.memories.delete(memory1.id);
    await client.memories.delete(memory2.id);
    await client.memories.delete(memory3.id);
    console.log('Cleanup completed');

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  } finally {
    // Always cleanup connections
    client.destroy();
  }
}

// Event handling example
function eventHandlingExample() {
  const client = new MemorAI({
    baseUrl: 'http://localhost:4006',
    enableWebSocket: true
  });

  // Listen for memory events
  client.on('memory:created', (memory) => {
    console.log('🎉 New memory created:', memory.title || memory.id);
  });

  client.on('memory:updated', (memory) => {
    console.log('✏️ Memory updated:', memory.title || memory.id);
  });

  client.on('memory:deleted', ({ id }) => {
    console.log('🗑️ Memory deleted:', id);
  });

  // Listen for search events
  client.on('search:completed', (result) => {
    console.log(`🔍 Search completed: ${result.total} results in ${result.took}ms`);
  });

  // Listen for connection events
  client.on('connection:opened', () => {
    console.log('🔌 WebSocket connected');
  });

  client.on('connection:closed', () => {
    console.log('🔌 WebSocket disconnected');
  });

  client.on('connection:error', (error) => {
    console.error('🔌 WebSocket error:', error.message);
  });

  // Listen for rate limiting
  client.on('rate_limit:exceeded', (info) => {
    console.warn(`⚠️ Rate limit exceeded. Retry after ${info.retryAfter}s`);
  });

  // Listen for performance metrics
  client.on('performance:metric', (metric) => {
    if (metric.responseTime > 1000) {
      console.warn(`⚠️ Slow response: ${metric.endpoint} took ${metric.responseTime}ms`);
    }
  });

  return client;
}

// Run the example
if (require.main === module) {
  basicUsageExample()
    .then(() => console.log('\n✅ Example completed successfully'))
    .catch(error => console.error('\n❌ Example failed:', error));
}
