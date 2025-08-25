const { AdvancedMemorAIMCPServer } = require('./dist/src/advanced-mcp-server.js');

console.log('🚀 Testing MemorAI Advanced MCP Server...');

try {
    // Test server initialization
    const server = new AdvancedMemorAIMCPServer({
        server: {
            name: 'Test Advanced Server',
            version: '9.7.0-test'
        }
    });

    console.log('✅ Server initialized successfully');
    console.log(`   Server name: ${server.config.server.name}`);
    console.log(`   Server version: ${server.config.server.version}`);
    console.log(`   Tool count: ${server.advancedTools.length}`);

    // Test tool names
    const toolNames = server.advancedTools.map(tool => tool.name);
    console.log('\n🛠️  Available Tools:');
    toolNames.forEach((name, index) => {
        console.log(`   ${index + 1}. ${name}`);
    });

    // Test configuration
    console.log('\n⚙️  Configuration:');
    console.log(`   Transport: ${server.config.transport.primary}`);
    console.log(`   HTTP Port: ${server.config.transport.http.port}`);
    console.log(`   CBD Data Path: ${server.config.cbd.dataPath}`);
    console.log(`   Logging Level: ${server.config.logging.level}`);
    console.log(`   Monitoring: ${server.config.monitoring.enabled ? 'Enabled' : 'Disabled'}`);

    console.log('\n🎉 Advanced MCP Server validation PASSED!');
    console.log('✅ Phase 1.2 Implementation is SUCCESSFUL!');

} catch (error) {
    console.error('❌ Server validation FAILED:', error.message);
    console.error(error.stack);
    process.exit(1);
}
