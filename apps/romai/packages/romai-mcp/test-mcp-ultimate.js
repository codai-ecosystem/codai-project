#!/usr/bin/env node

// Test script for ROMAI Ultimate MCP Server
process.env.NODE_ENV = 'production';
process.env.DOTENV_CONFIG_PATH = 'E:\\GitHub\\workspace-ai\\.env';
process.env.ROMAI_SERVER_MODE = 'ultimate';

console.error('=== ROMAI MCP Ultimate Test ===');
console.error('NODE_ENV:', process.env.NODE_ENV);
console.error('DOTENV_CONFIG_PATH:', process.env.DOTENV_CONFIG_PATH);
console.error('ROMAI_SERVER_MODE:', process.env.ROMAI_SERVER_MODE);
console.error('==============================');

try {
  // Import and run the ultimate server
  import('./dist/ultimate-main.js').then((module) => {
    console.error('✅ ROMAI Ultimate MCP Server loaded successfully');
  }).catch((error) => {
    console.error('❌ Failed to load ROMAI Ultimate MCP Server:', error);
    process.exit(1);
  });
} catch (error) {
  console.error('❌ Failed to import ROMAI Ultimate MCP Server:', error);
  process.exit(1);
}
