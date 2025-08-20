/**
 * CBD Universal Database - 5-Paradigm Test Script
 * Tests Document, Vector, Graph, Key-Value, and Time-Series paradigms
 */

import http from 'http';

const baseUrl = 'http://localhost:4180';

function makeRequest(method, url, body = null) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (error) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (body) {
            req.write(JSON.stringify(body));
        }

        req.end();
    });
}

async function testEndpoint(method, url, body = null, description) {
    console.log(`Testing: ${description}`);

    try {
        const result = await makeRequest(method, url, body);

        if (result.status >= 200 && result.status < 300) {
            console.log(`✅ SUCCESS: ${description}`);
            return result.data;
        } else {
            console.log(`❌ FAILED: ${description} - Status ${result.status}: ${result.data.error || result.data}`);
            return null;
        }
    } catch (error) {
        console.log(`❌ FAILED: ${description} - ${error.message}`);
        return null;
    }
}

async function runTests() {
    console.log('🧪 CBD Universal Database - 5-Paradigm Integration Test');
    console.log('='.repeat(65));

    let passedTests = 0;
    let totalTests = 0;

    const test = async (method, endpoint, body, description) => {
        totalTests++;
        const result = await testEndpoint(method, `${baseUrl}${endpoint}`, body, description);
        if (result !== null) passedTests++;
        return result;
    };

    // Wait for service to be ready
    console.log('⏳ Waiting for service to start...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
        // 1. Health Check
        console.log('\n1️⃣ HEALTH CHECK TEST');
        const health = await test('GET', '/health', null, 'Health Check');

        if (health && health.engines) {
            console.log(`Paradigms Available: ${health.paradigms.join(', ')}`);
            console.log('Engine Status:');
            Object.entries(health.engines).forEach(([name, status]) => {
                console.log(`  ${name}: ${status}`);
            });
        }

        // 2. Document Storage Test
        console.log('\n2️⃣ DOCUMENT STORAGE TEST');
        const testDoc = {
            document: {
                name: 'Test User',
                email: 'test@example.com',
                age: 30,
                tags: ['developer', 'nodejs']
            }
        };

        const docResult = await test('POST', '/document/users', testDoc, 'Insert Document');
        if (docResult) {
            console.log(`Document ID: ${docResult.insertedId}`);
            await test('GET', '/document/users', null, 'Get Documents');
        }

        // 3. Vector Storage Test
        console.log('\n3️⃣ VECTOR STORAGE TEST');
        const testVector = {
            id: 'vec_001',
            vector: [0.1, 0.2, 0.3, 0.4, 0.5],
            metadata: {
                type: 'test',
                category: 'example'
            }
        };

        const vectorResult = await test('POST', '/vector/store', testVector, 'Store Vector');
        if (vectorResult) {
            const searchVector = {
                vector: [0.1, 0.2, 0.3, 0.4, 0.5],
                limit: 5
            };
            await test('POST', '/vector/search', searchVector, 'Search Similar Vectors');
        }

        // 4. Graph Storage Test
        console.log('\n4️⃣ GRAPH STORAGE TEST');
        const testNode1 = {
            id: 'user_1',
            labels: ['User', 'Person'],
            properties: {
                name: 'Alice',
                role: 'Developer'
            }
        };

        const nodeResult1 = await test('POST', '/graph/node', testNode1, 'Create Node 1');

        const testNode2 = {
            id: 'user_2',
            labels: ['User', 'Person'],
            properties: {
                name: 'Bob',
                role: 'Designer'
            }
        };

        const nodeResult2 = await test('POST', '/graph/node', testNode2, 'Create Node 2');

        if (nodeResult1 && nodeResult2) {
            const testRelationship = {
                fromNodeId: 'user_1',
                toNodeId: 'user_2',
                type: 'WORKS_WITH',
                properties: {
                    since: '2024',
                    project: 'CBD Database'
                }
            };

            await test('POST', '/graph/relationship', testRelationship, 'Create Relationship');
            await test('GET', '/graph/node/user_1', null, 'Get Node');
        }

        // 5. Key-Value Storage Test
        console.log('\n5️⃣ KEY-VALUE STORAGE TEST');
        const testKV = {
            key: 'session_123',
            value: {
                userId: 'user_1',
                loginTime: new Date().toISOString(),
                preferences: {
                    theme: 'dark',
                    language: 'en'
                }
            },
            ttl: 3600
        };

        const kvResult = await test('POST', '/kv/set', testKV, 'Set Key-Value');
        if (kvResult) {
            await test('GET', '/kv/session_123', null, 'Get Key-Value');
        }

        // 6. Time-Series Storage Test
        console.log('\n6️⃣ TIME-SERIES STORAGE TEST');
        const currentTime = new Date().toISOString();

        const testTimeSeries = {
            measurement: 'cpu_usage',
            tags: {
                host: 'server-01',
                region: 'us-east-1',
                environment: 'production'
            },
            fields: {
                usage_percent: 75.5,
                load_average: 1.2,
                active_processes: 156
            },
            timestamp: currentTime
        };

        const tsResult = await test('POST', '/timeseries/write', testTimeSeries, 'Write Time-Series Point');

        if (tsResult) {
            // Batch write test
            const testBatch = {
                points: [
                    {
                        measurement: 'cpu_usage',
                        tags: { host: 'server-01', region: 'us-east-1' },
                        fields: { usage_percent: 80.2, load_average: 1.5 },
                        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
                    },
                    {
                        measurement: 'cpu_usage',
                        tags: { host: 'server-01', region: 'us-east-1' },
                        fields: { usage_percent: 70.1, load_average: 1.0 },
                        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString()
                    }
                ]
            };

            await test('POST', '/timeseries/write-batch', testBatch, 'Batch Write Time-Series');

            // Query test
            const tsQuery = {
                measurement: 'cpu_usage',
                startTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
                endTime: new Date().toISOString(),
                tags: { host: 'server-01' },
                limit: 10
            };

            await test('POST', '/timeseries/query', tsQuery, 'Query Time-Series Data');
            await test('GET', '/timeseries/measurements', null, 'List Measurements');
            await test('GET', '/timeseries/stats', null, 'Get Time-Series Stats');
        }

        // 7. Statistics Test
        console.log('\n7️⃣ STATISTICS TEST');
        const stats = await test('GET', '/stats', null, 'Get Service Statistics');

        if (stats) {
            console.log(`Service Uptime: ${Math.round(stats.uptime / 1000)} seconds`);
            if (stats.timeSeries) {
                console.log(`Time-Series Points: ${stats.timeSeries.totalPoints}`);
            }
        }

    } catch (error) {
        console.error('Test execution error:', error);
    }

    // Test Summary
    console.log('\n📊 TEST SUMMARY');
    console.log('='.repeat(65));

    const successRate = Math.round((passedTests / totalTests) * 100);

    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${totalTests - passedTests}`);
    console.log(`Success Rate: ${successRate}%`);

    if (passedTests === totalTests) {
        console.log('\n🎉 ALL TESTS PASSED! CBD 5-Paradigm Database is fully operational!');
        console.log('✅ Document Storage: Working');
        console.log('✅ Vector Search: Working');
        console.log('✅ Graph Database: Working');
        console.log('✅ Key-Value Store: Working');
        console.log('✅ Time-Series Database: Working');
    } else {
        console.log('\n⚠️ Some tests failed. Please check the service implementation.');
    }

    console.log('\n🏁 Test completed!');
}

// Run the tests
runTests().catch(console.error);
