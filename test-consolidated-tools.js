#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');

// Test the consolidated Glass MCP tools
console.log('🔧 Testing Glass MCP Consolidated Tools...\n');

const serverPath = path.join(__dirname, 'packages/glass-mcp/dist/mcp-server.js');

// Test glass_windows tool with list operation
const testCommands = [
    {
        name: 'glass_windows (list)',
        command: `echo '{"jsonrpc":"2.0","method":"tools/call","id":1,"params":{"name":"glass_windows","arguments":{"operation":"list"}}}' | node "${serverPath}"`,
        description: 'Test consolidated windows tool with list operation'
    },
    {
        name: 'glass_clipboard (get_text)',
        command: `echo '{"jsonrpc":"2.0","method":"tools/call","id":2,"params":{"name":"glass_clipboard","arguments":{"operation":"get_text"}}}' | node "${serverPath}"`,
        description: 'Test consolidated clipboard tool with get_text operation'
    },
    {
        name: 'window_list (legacy)',
        command: `echo '{"jsonrpc":"2.0","method":"tools/call","id":3,"params":{"name":"window_list","arguments":{}}}' | node "${serverPath}"`,
        description: 'Test legacy window_list tool (should show deprecation warning)'
    }
];

testCommands.forEach((test, index) => {
    console.log(`\n${index + 1}. ${test.name}`);
    console.log(`   ${test.description}`);
    console.log('   ' + '─'.repeat(50));

    try {
        const result = execSync(test.command, {
            encoding: 'utf8',
            timeout: 5000,
            stdio: ['pipe', 'pipe', 'pipe']
        });

        // Parse and format the result
        try {
            const jsonResult = JSON.parse(result.trim());
            console.log('   ✅ Success:', JSON.stringify(jsonResult, null, 2).split('\n').join('\n   '));
        } catch {
            console.log('   📝 Raw output:', result.trim());
        }
    } catch (error) {
        console.log('   ❌ Error:', error.message);
    }
});

console.log('\n🏁 Testing completed!');