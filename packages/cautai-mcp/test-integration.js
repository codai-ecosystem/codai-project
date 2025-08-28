/**
 * @fileoverview Integration test for DuckDuckGo adapter
 * Simple test to verify our implementation works
 */

import { DuckDuckGoAdapter } from './src/search/adapters/duckduckgo.js';
import { CautaiSearchEngine } from './src/search/engine.js';

async function testDuckDuckGoIntegration() {
  console.log('🧪 Testing DuckDuckGo Adapter Integration');
  console.log('=====================================');
  
  try {
    // Create adapter
    console.log('📦 Creating DuckDuckGo adapter...');
    const ddgAdapter = new DuckDuckGoAdapter();
    
    // Check if adapter is available
    console.log('🔍 Checking adapter availability...');
    const isAvailable = ddgAdapter.isAvailable();
    console.log(`✅ Adapter available: ${isAvailable}`);
    
    // Create search engine with adapter
    console.log('🚀 Creating search engine...');
    const searchEngine = new CautaiSearchEngine({
      adapters: [ddgAdapter],
      caching: {
        enabled: true,
        maxSize: 1000,
        ttl: 300000 // 5 minutes
      }
    });
    
    // Test search query
    console.log('🔍 Testing search query: "TypeScript programming"...');
    const query = {
      query: 'TypeScript programming',
      limit: 3,
      language: 'en',
      mode: 'ai'
    };
    
    const startTime = Date.now();
    const results = await searchEngine.search(query);
    const endTime = Date.now();
    
    console.log(`⏱️  Search completed in ${endTime - startTime}ms`);
    console.log(`📊 Found ${results.length} results`);
    
    // Display results
    results.forEach((result, index) => {
      console.log(`\n📄 Result ${index + 1}:`);
      console.log(`   Title: ${result.title}`);
      console.log(`   URL: ${result.url}`);
      console.log(`   Domain: ${result.domain}`);
      console.log(`   Score: ${result.score.toFixed(3)}`);
      console.log(`   Relevance: ${result.relevanceScore.toFixed(3)}`);
      console.log(`   Quality: ${result.qualityScore.toFixed(3)}`);
      console.log(`   Type: ${result.contentType}`);
      console.log(`   Snippet: ${result.snippet.substring(0, 100)}...`);
    });
    
    console.log('\n✅ Integration test completed successfully!');
    
  } catch (error) {
    console.error('❌ Integration test failed:', error);
    console.error('Stack:', error.stack);
  }
}

// Run test
testDuckDuckGoIntegration().then(() => {
  console.log('\n🎉 Test execution finished');
  process.exit(0);
}).catch(error => {
  console.error('💥 Unhandled error:', error);
  process.exit(1);
});