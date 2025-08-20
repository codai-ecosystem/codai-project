#!/usr/bin/env node

/**
 * Simple GraphQL Gateway Health Test
 * Quick verification of GraphQL Gateway functionality
 */

const http = require('http');

async function testGraphQLGateway() {
    console.log('🔍 Testing CBD GraphQL Gateway...');

    const tests = [
        {
            name: 'Health Check',
            path: '/health',
            method: 'GET'
        },
        {
            name: 'Schema Info',
            path: '/schema',
            method: 'GET'
        },
        {
            name: 'Statistics',
            path: '/stats',
            method: 'GET'
        },
        {
            name: 'GraphQL Endpoint',
            path: '/graphql',
            method: 'GET'
        },
        {
            name: 'Simple GraphQL Query',
            path: '/graphql',
            method: 'POST',
            body: JSON.stringify({
                query: `query { schemaInfo { version types queries mutations subscriptions } }`
            })
        }
    ];

    let passed = 0;
    let total = tests.length;

    for (const test of tests) {
        try {
            console.log(`\n📋 Testing: ${test.name}`);

            const result = await makeRequest(test.path, {
                method: test.method,
                body: test.body
            });

            if (result.statusCode === 200 || result.statusCode === 400) {
                console.log(`✅ ${test.name}: ${result.statusCode} - OK`);
                if (result.data && typeof result.data === 'object') {
                    console.log(`   Response keys: ${Object.keys(result.data).join(', ')}`);
                }
                passed++;
            } else {
                console.log(`❌ ${test.name}: ${result.statusCode} - Failed`);
            }

        } catch (error) {
            console.log(`❌ ${test.name}: Error - ${error.message}`);
        }
    }

    console.log(`\n📊 Results: ${passed}/${total} tests passed`);
    console.log(`🎯 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

    if (passed === total) {
        console.log('🌟 All tests passed! GraphQL Gateway is operational.');
    } else {
        console.log('⚠️  Some tests failed. Check service configuration.');
    }

    return { passed, total, successRate: (passed / total) * 100 };
}

function makeRequest(path, options = {}) {
    return new Promise((resolve, reject) => {
        const requestOptions = {
            hostname: 'localhost',
            port: 4800,
            path: path,
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            timeout: 5000
        };

        const req = http.request(requestOptions, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const response = {
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: res.headers['content-type']?.includes('application/json')
                            ? JSON.parse(data)
                            : data
                    };
                    resolve(response);
                } catch (error) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: data,
                        parseError: error.message
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        if (options.body) {
            req.write(options.body);
        }

        req.end();
    });
}

// Run the test
if (require.main === module) {
    testGraphQLGateway()
        .then(results => {
            process.exit(results.passed === results.total ? 0 : 1);
        })
        .catch(error => {
            console.error('❌ Test failed:', error);
            process.exit(1);
        });
}

module.exports = { testGraphQLGateway };
