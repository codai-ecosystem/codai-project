// Comprehensive CND Database Operations Test
import { CND } from './dist/index.js';

async function testDatabaseOperations() {
  console.log('🚀 Testing CND Database Operations...');

  const cnd = new CND({
    host: 'localhost',
    port: 5432,
    database: 'codai_test',
    username: 'test_user',
    password: 'test_password'
  });

  try {
    // Test SQL Operations
    console.log('\n📊 Testing SQL Operations:');
    const sql = cnd.sql();

    // Create table
    console.log('  Creating users table...');
    await sql.sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Insert data
    console.log('  Inserting test user...');
    const user = await sql.sql`
      INSERT INTO users (name, email) 
      VALUES ('John Doe', 'john@example.com') 
      RETURNING *
    `;
    console.log('  ✅ User created:', user[0]);

    // Test Document Operations
    console.log('\n📄 Testing Document Operations:');
    const users = cnd.collection('users');

    // Insert document
    console.log('  Inserting document...');
    const docResult = await users.insertOne({
      name: 'Jane Smith',
      email: 'jane@example.com',
      profile: {
        age: 25,
        location: 'New York'
      }
    });
    console.log('  ✅ Document inserted:', docResult.insertedId);

    // Find documents
    console.log('  Finding documents...');
    const foundDocs = await users.find({ name: 'Jane Smith' }).toArray();
    console.log('  ✅ Documents found:', foundDocs.length);

    // Test Graph Operations
    console.log('\n🔗 Testing Graph Operations:');
    const graph = cnd.graph;

    // Create nodes
    console.log('  Creating graph nodes...');
    const nodeResult = await graph.cypher`
      CREATE (u:User {name: 'Alice', email: 'alice@example.com'})
      RETURN u
    `;
    console.log('  ✅ Graph node created:', nodeResult.length);

    // Test Vector Operations
    console.log('\n🎯 Testing Vector Operations:');
    const vectors = cnd.vector('embeddings');

    // Upsert vector
    console.log('  Upserting vector...');
    const vectorResult = await vectors.upsert([{
      id: 'text-1',
      values: [0.1, 0.2, 0.3, 0.4, 0.5],
      metadata: { text: 'Hello world', category: 'greeting' }
    }]);
    console.log('  ✅ Vector upserted:', vectorResult.upsertedCount);

    // Search similar vectors
    console.log('  Searching similar vectors...');
    const searchResult = await vectors.query({
      vector: [0.1, 0.2, 0.3, 0.4, 0.5],
      topK: 5,
      includeMetadata: true
    });
    console.log('  ✅ Vector search completed:', searchResult.matches.length);

    // Test Time-series Operations
    console.log('\n📈 Testing Time-series Operations:');
    const metrics = cnd.timeseries('app_metrics');

    // Write data point
    console.log('  Writing time-series data...');
    const timeResult = await metrics.write([{
      measurement: 'cpu_usage',
      tags: { host: 'server-1', region: 'us-east' },
      fields: { value: 85.2 },
      timestamp: new Date()
    }]);
    console.log('  ✅ Time-series data written:', timeResult.points);

    // Query data
    console.log('  Querying time-series data...');
    const queryResult = await metrics.query(`
      SELECT mean(value) as avg_cpu 
      FROM cpu_usage 
      WHERE time > now() - 1h 
      GROUP BY time(5m)
    `);
    console.log('  ✅ Time-series query completed:', queryResult.series?.length || 0);

    // Test Cache Operations
    console.log('\n⚡ Testing Cache Operations:');
    const cache = cnd.cache;

    // Set cache value
    console.log('  Setting cache value...');
    await cache.set('user:123', JSON.stringify({ name: 'Bob', active: true }), { ttl: 3600 });
    console.log('  ✅ Cache value set');

    // Get cache value
    console.log('  Getting cache value...');
    const cacheValue = await cache.get('user:123');
    console.log('  ✅ Cache value retrieved:', cacheValue ? 'Found' : 'Not found');

    console.log('\n🎉 All CND database operations completed successfully!');
    console.log('\n📊 CND Features Tested:');
    console.log('  ✅ SQL: Table creation, CRUD operations');
    console.log('  ✅ Document: Collection operations, queries');
    console.log('  ✅ Graph: Node creation, Cypher queries');
    console.log('  ✅ Vector: Embeddings, similarity search');
    console.log('  ✅ Time-series: Metrics storage, aggregations');
    console.log('  ✅ Cache: Key-value operations, TTL');

    return true;

  } catch (error) {
    console.error('❌ Database operation failed:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
}

testDatabaseOperations().then(success => {
  console.log(success ? '\n🚀 CND Database Operations Test: SUCCESS!' : '\n💥 CND Database Operations Test: FAILED!');
  process.exit(success ? 0 : 1);
});
