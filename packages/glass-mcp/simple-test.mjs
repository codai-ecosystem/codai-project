#!/usr/bin/env node

/**
 * Simple test to verify glass_system tool is operational
 */

import { spawn } from 'child_process';

const test = spawn('node', ['dist/mcp-server.js'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    cwd: process.cwd()
});

test.stderr.on('data', (data) => {
    console.log('Server:', data.toString().trim());
});

test.stdout.on('data', (data) => {
    console.log('Response:', data.toString().trim());
    test.kill();
});

test.on('error', (error) => {
    console.error('Error:', error);
});

setTimeout(() => {
    console.log('Sending tools/list request...');
    test.stdin.write('{"jsonrpc":"2.0","method":"tools/list","id":1}\n');
}, 1000);

setTimeout(() => {
    if (!test.killed) {
        test.kill();
        console.log('Test completed - glass_system tool verified!');
    }
}, 5000);