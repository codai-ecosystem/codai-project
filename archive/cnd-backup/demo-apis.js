// Simple CND API Usage Examples
import { CND } from './dist/index.js';

async function demonstrateAPIs() {
  console.log('🎯 CND API Usage Examples');

  const cnd = new CND({
    host: 'localhost',
    port: 5432,
    database: 'codai',
    username: 'test',
    password: 'test'
  });

  console.log('\n📊 SQL API Usage:');
  const sql = cnd.sql();
  console.log('  Available methods:', Object.getOwnPropertyNames(sql.__proto__));

  // Use the query method instead
  try {
    const result = await sql.query('SELECT 1 as test_value');
    console.log('  ✅ SQL query successful:', result);
  } catch (error) {
    console.log('  ⚠️ SQL query (simulated):', error.message);
  }

  console.log('\n📄 Document API Usage:');
  const users = cnd.collection('users');
  console.log('  Available methods:', Object.getOwnPropertyNames(users.__proto__));

  console.log('\n🔗 Graph API Usage:');
  const graph = cnd.graph;
  console.log('  Available methods:', Object.getOwnPropertyNames(graph.__proto__));

  console.log('\n🎯 Vector API Usage:');
  const vectors = cnd.vector('embeddings');
  console.log('  Available methods:', Object.getOwnPropertyNames(vectors.__proto__));

  console.log('\n📈 Time-series API Usage:');
  const metrics = cnd.timeseries('app_metrics');
  console.log('  Available methods:', Object.getOwnPropertyNames(metrics.__proto__));

  console.log('\n⚡ Cache API Usage:');
  const cache = cnd.cache;
  console.log('  Available methods:', Object.getOwnPropertyNames(cache.__proto__));

  console.log('\n🎉 CND provides 6 different database paradigms in one unified API!');
  console.log('\n🚀 Ready for integration with CODAI applications!');
}

demonstrateAPIs().catch(console.error);
