#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

// Quick test to check available tools
console.log('🔍 Testing MCP Tools List...\n');

const serverPath = path.join(__dirname, 'packages/glass-mcp/dist/mcp-server.js');
const server = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';

server.stdout.on('data', (data) => {
    output += data.toString();
});

server.stderr.on('data', (data) => {
    console.log('Server Log:', data.toString());
});

// Send tools list request
const listRequest = JSON.stringify({
    jsonrpc: '2.0',
    method: 'tools/list',
    id: 1
});

console.log('📤 Sending request:', listRequest);
server.stdin.write(listRequest + '\n');

setTimeout(() => {
    console.log('📥 Server response:', output || 'No output received');
    server.kill();
    process.exit(0);
}, 2000);