#!/usr/bin/env node

/**
 * Simple Hub Service Health Test
 */

async function testHubHealth() {
    try {
        console.log('Testing Hub Service health...');

        const response = await fetch('http://localhost:4003/api/health');
        const data = await response.json();

        console.log('Response:', JSON.stringify(data, null, 2));

        if (data.success) {
            console.log('✅ Hub Service is healthy');
        } else {
            console.log('❌ Hub Service has issues:', data.error);
        }
    } catch (error) {
        console.log('❌ Failed to connect to Hub Service:', error.message);
    }
}

testHubHealth();
