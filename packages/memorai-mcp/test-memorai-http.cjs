#!/usr/bin/env node

/**
 * MemorAI MCP Server Test - Using simple HTTP requests
 */

const http = require('http');

const BASE_URL = 'localhost';
const PORT = 8002;
const API_KEY = 'memorai-dev-key-2025';

function makeRequest(path, method = 'GET', data = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: BASE_URL,
            port: PORT,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    const jsonBody = JSON.parse(body);
                    resolve({ status: res.statusCode, data: jsonBody });
                } catch (error) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function testMemorAI() {
    console.log('🧪 Testing MemorAI MCP HTTP Server');
    console.log('='.repeat(50));

    try {
        // Test 1: Health check
        console.log('1️⃣ Testing health endpoint...');
        const health = await makeRequest('/health');
        console.log(`   Status: ${health.status}`);
        console.log(`   Response:`, JSON.stringify(health.data, null, 2));

        if (health.status !== 200) {
            throw new Error('Health check failed');
        }
        console.log('   ✅ Health check passed\n');

        // Test 2: Tools endpoint
        console.log('2️⃣ Testing tools endpoint...');
        const tools = await makeRequest('/tools', 'GET', null, {
            'Authorization': `Bearer ${API_KEY}`
        });
        console.log(`   Status: ${tools.status}`);
        console.log(`   Tools available: ${tools.data.tools ? tools.data.tools.length : 0}`);

        if (tools.status !== 200) {
            throw new Error('Tools endpoint failed');
        }
        console.log('   ✅ Tools endpoint passed\n');

        // Test 3: Remember tool
        console.log('3️⃣ Testing remember tool...');
        const rememberData = {
            content: 'This is a test memory from the validation script',
            metadata: {
                source: 'validation-test',
                timestamp: new Date().toISOString(),
                priority: 'high'
            }
        };

        const remember = await makeRequest('/tools/remember', 'POST', rememberData, {
            'Authorization': `Bearer ${API_KEY}`
        });
        console.log(`   Status: ${remember.status}`);
        console.log(`   Memory ID: ${remember.data.id}`);

        if (remember.status !== 200 || !remember.data.success) {
            throw new Error('Remember tool failed');
        }
        const memoryId = remember.data.id;
        console.log('   ✅ Remember tool passed\n');

        // Test 4: Recall tool
        console.log('4️⃣ Testing recall tool...');
        const recallData = {
            query: 'test memory',
            limit: 10
        };

        const recall = await makeRequest('/tools/recall', 'POST', recallData, {
            'Authorization': `Bearer ${API_KEY}`
        });
        console.log(`   Status: ${recall.status}`);
        console.log(`   Results found: ${recall.data.count}`);

        if (recall.status !== 200 || !recall.data.success) {
            throw new Error('Recall tool failed');
        }
        console.log('   ✅ Recall tool passed\n');

        // Test 5: Forget tool
        console.log('5️⃣ Testing forget tool...');
        const forgetData = {
            id: memoryId
        };

        const forget = await makeRequest('/tools/forget', 'POST', forgetData, {
            'Authorization': `Bearer ${API_KEY}`
        });
        console.log(`   Status: ${forget.status}`);
        console.log(`   Success: ${forget.data.success}`);

        if (forget.status !== 200 || !forget.data.success) {
            throw new Error('Forget tool failed');
        }
        console.log('   ✅ Forget tool passed\n');

        // Final summary
        console.log('🎉 ALL TESTS PASSED!');
        console.log('✅ MemorAI MCP HTTP Server is working correctly');
        console.log('='.repeat(50));

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

testMemorAI();
