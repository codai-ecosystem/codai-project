#!/usr/bin/env node

/**
 * Test script for MemorAI MCP HTTP Server
 */

async function testServer() {
    console.log('🧪 Testing MemorAI MCP HTTP Server...');

    try {
        // Test health endpoint without node-fetch dependency
        const { spawn } = require('child_process');

        const curlHealth = spawn('powershell', [
            '-Command',
            'try { $r = Invoke-WebRequest -Uri "http://localhost:8002/health" -UseBasicParsing; Write-Host "✅ Health: OK ($($r.StatusCode))"; $r.Content } catch { Write-Host "❌ Health: FAIL" }'
        ]);

        curlHealth.stdout.on('data', (data) => {
            console.log(data.toString());
        });

        curlHealth.stderr.on('data', (data) => {
            console.error('Error:', data.toString());
        });

        curlHealth.on('close', (code) => {
            console.log(`Test completed with code: ${code}`);
        });

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testServer();
