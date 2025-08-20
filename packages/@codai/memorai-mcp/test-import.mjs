#!/usr/bin/env node

console.log('🧠 Testing MemorAI MCP Server Import...');

try {
    // Test basic import
    const { MemorAIUnifiedServer } = await import('./dist/server.js');
    console.log('✅ Server class import successful');

    // Test instantiation
    const server = new MemorAIUnifiedServer();
    console.log('✅ Server instantiation successful');

    console.log('🏆 All imports working correctly!');
    process.exit(0);
} catch (error) {
    console.error('❌ Import failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
}
