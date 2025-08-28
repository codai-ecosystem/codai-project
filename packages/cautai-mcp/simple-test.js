// Simple test for basic functionality
const { DuckDuckGoAdapter } = require('./src/search/adapters/duckduckgo.ts');

console.log('Testing basic adapter creation...');

try {
  // This should fail gracefully and show us the actual error
  console.log('DuckDuckGoAdapter:', DuckDuckGoAdapter);
  console.log('✅ Import successful');
} catch (error) {
  console.error('❌ Import failed:', error.message);
  console.error('Stack:', error.stack);
}