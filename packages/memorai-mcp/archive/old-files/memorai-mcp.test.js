#!/usr/bin/env node

/**
 * Simple direct test for MemorAI MCP Advanced Server
 */

console.log('🧪 MEMORAI MCP ADVANCED - SIMPLE TEST');
console.log('====================================');

const http = require('http');

function testHealth() {
    return new Promise((resolve, reject) => {
        const req = http.get('http://localhost:8002/health', (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    console.log('✅ Health endpoint working!');
                    console.log('   Service:', json.service);
                    console.log('   Version:', json.version);
                    console.log('   Status:', json.status);
                    console.log('   CBD Status:', json.cbd);
                    console.log('   Uptime:', json.uptime + 'ms');
                    resolve(json);
                } catch (error) {
                    console.log('❌ Failed to parse response:', data);
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            console.log('❌ Connection failed:', error.message);
            reject(error);
        });

        req.setTimeout(5000, () => {
            console.log('❌ Request timeout');
            req.abort();
            reject(new Error('Timeout'));
        });
    });
}

function testTools() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({});
        const options = {
            hostname: 'localhost',
            port: 8002,
            path: '/tools',
            method: 'GET',
            headers: {
                'Authorization': 'Bearer memorai-dev-key-2025',
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => responseData += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(responseData);
                    console.log('✅ Tools endpoint working!');
                    console.log('   MCP Compatible:', json.mcp_compatible);
                    console.log('   Tools Available:', json.tools.length);
                    console.log('   Tool Names:', json.tools.map(t => t.name).join(', '));
                    resolve(json);
                } catch (error) {
                    console.log('❌ Failed to parse tools response:', responseData);
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            console.log('❌ Tools request failed:', error.message);
            reject(error);
        });

        req.write(data);
        req.end();
    });
}

async function runTests() {
    try {
        console.log('1️⃣ Testing Health Endpoint...');
        await testHealth();

        console.log('\n2️⃣ Testing Tools Endpoint...');
        await testTools();

        console.log('\n🎉 ALL TESTS PASSED!');
        console.log('✅ MemorAI MCP Advanced Phase 2 is working correctly');
        console.log('🚀 Server is ready for Phase 3 implementation');

    } catch (error) {
        console.log('\n❌ Test failed:', error.message);
        process.exit(1);
    }
}

runTests();
