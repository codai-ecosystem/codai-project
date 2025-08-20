#!/usr/bin/env node

/**
 * Simple AI Analytics Engine Test
 * Quick verification that the service is operational
 */

const http = require('http');

console.log('🧠 Testing CBD AI Analytics Engine...');
console.log('⏱️  Testing health endpoint at http://localhost:4700/health');

const options = {
    hostname: 'localhost',
    port: 4700,
    path: '/health',
    method: 'GET',
    timeout: 5000
};

const req = http.request(options, (res) => {
    console.log(`✅ Status Code: ${res.statusCode}`);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const response = JSON.parse(data);
            console.log('🎯 Response received:');
            console.log('   Service:', response.service || 'Unknown');
            console.log('   Status:', response.status || 'Unknown');
            console.log('   Version:', response.version || 'Unknown');
            console.log('   AI Features:', response.ai_features || 'Unknown');
            console.log('✅ AI Analytics Engine is operational!');
        } catch (error) {
            console.log('📄 Raw response:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Connection error:', error.message);
});

req.on('timeout', () => {
    console.error('⏰ Request timeout');
    req.destroy();
});

req.end();
