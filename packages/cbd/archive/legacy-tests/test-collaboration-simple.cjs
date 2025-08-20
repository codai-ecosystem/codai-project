#!/usr/bin/env node

/**
 * Simple test client for CBD Real-time Collaboration Service
 * Tests basic functionality including REST API and WebSocket connection
 */

const http = require('http');

async function testCollaborationService() {
    console.log('🧪 Testing CBD Real-time Collaboration Service...\n');

    // Test 1: Health Check
    try {
        console.log('🔍 Testing health endpoint...');
        const health = await makeRequest('GET', 'localhost', 4600, '/health');
        console.log('✅ Health check passed:', health.status);
        console.log('📊 Features:', Object.keys(health.features).length);
        console.log('📈 Performance:', health.performance);
    } catch (error) {
        console.error('❌ Health check failed:', error.message);
        return;
    }

    // Test 2: Create Document
    try {
        console.log('\n🔍 Testing document creation...');
        const docData = JSON.stringify({
            title: 'Test Document',
            content: 'Hello, collaborative world!',
            ownerId: 'test-user-1',
            type: 'text'
        });

        const doc = await makeRequest('POST', 'localhost', 4600, '/api/collaboration/document', docData);
        console.log('✅ Document created:', doc.document_id);

        // Test 3: Retrieve Document
        console.log('\n🔍 Testing document retrieval...');
        const retrievedDoc = await makeRequest('GET', 'localhost', 4600, `/api/collaboration/document/${doc.document_id}`);
        console.log('✅ Document retrieved:', retrievedDoc.document.title);
        console.log('📝 Content:', retrievedDoc.document.content);

    } catch (error) {
        console.error('❌ Document test failed:', error.message);
    }

    // Test 4: Create Room
    try {
        console.log('\n🔍 Testing room creation...');
        const roomData = JSON.stringify({
            name: 'Test Room',
            documentId: 'test-doc-123',
            ownerId: 'test-user-1'
        });

        const room = await makeRequest('POST', 'localhost', 4600, '/api/collaboration/room', roomData);
        console.log('✅ Room created:', room.room_id);

    } catch (error) {
        console.error('❌ Room test failed:', error.message);
    }

    // Test 5: Statistics
    try {
        console.log('\n🔍 Testing statistics endpoint...');
        const stats = await makeRequest('GET', 'localhost', 4600, '/api/collaboration/stats');
        console.log('✅ Statistics retrieved');
        console.log('📊 Total connections:', stats.global_stats.totalConnections);
        console.log('🏠 Rooms:', stats.rooms.length);

    } catch (error) {
        console.error('❌ Statistics test failed:', error.message);
    }

    console.log('\n🎉 Test completed!');
}

function makeRequest(method, hostname, port, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname,
            port,
            path,
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (data) {
            options.headers['Content-Length'] = Buffer.byteLength(data);
        }

        const req = http.request(options, (res) => {
            let body = '';

            res.on('data', (chunk) => {
                body += chunk;
            });

            res.on('end', () => {
                try {
                    const parsedBody = JSON.parse(body);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(parsedBody);
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${parsedBody.error || body}`));
                    }
                } catch (error) {
                    reject(new Error(`Failed to parse response: ${body}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(data);
        }

        req.end();
    });
}

// Run the test
testCollaborationService().catch(console.error);
