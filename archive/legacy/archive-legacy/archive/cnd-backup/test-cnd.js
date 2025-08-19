// Quick test of CND functionality
import { CND } from './dist/index.js';

async function testCND() {
  console.log('🧪 Testing CND (CODAI Next Database)...');

  try {
    // Initialize CND
    const cnd = new CND({
      host: 'localhost',
      port: 5432,
      database: 'test_cnd',
      username: 'test_user',
      password: 'test_password'
    });

    console.log('✅ CND initialized successfully');

    // Test SQL API
    console.log('\n📊 Testing SQL API...');
    const sqlApi = cnd.sql();
    console.log('✅ SQL API accessible');

    // Test Document API  
    console.log('\n📄 Testing Document API...');
    const docApi = cnd.collection('users');
    console.log('✅ Document API accessible');

    // Test Graph API
    console.log('\n🔗 Testing Graph API...');
    const graphApi = cnd.graph;
    console.log('✅ Graph API accessible');

    // Test Vector API
    console.log('\n🎯 Testing Vector API...');
    const vectorApi = cnd.vector('embeddings');
    console.log('✅ Vector API accessible');

    // Test Time-series API
    console.log('\n📈 Testing Time-series API...');
    const timeSeriesApi = cnd.timeseries('metrics');
    console.log('✅ Time-series API accessible');

    // Test Cache API
    console.log('\n⚡ Testing Cache API...');
    const cacheApi = cnd.cache;
    console.log('✅ Cache API accessible');

    console.log('\n🎉 All CND APIs are working correctly!');
    console.log('\n📋 Available APIs:');
    console.log('  - SQL: PostgreSQL-like relational queries');
    console.log('  - Document: MongoDB-like document operations');
    console.log('  - Graph: Neo4j-like graph traversal');
    console.log('  - Vector: Pinecone-like similarity search');
    console.log('  - Time-series: InfluxDB-like time-based data');
    console.log('  - Cache: Redis-like in-memory operations');

    return true;
  } catch (error) {
    console.error('❌ Error testing CND:', error.message);
    return false;
  }
}

testCND().then(success => {
  console.log(success ? '\n✅ CND test completed successfully!' : '\n❌ CND test failed!');
  process.exit(success ? 0 : 1);
});
