#!/usr/bin/env node
/**
 * Simple Load Testing Script for CBD-MemoraiMCP
 * Alternative to k6 for immediate testing
 */

const http = require('http');
const https = require('https');
const { performance } = require('perf_hooks');

class LoadTester {
    constructor() {
        this.results = {
            total: 0,
            success: 0,
            failed: 0,
            times: [],
            errors: []
        };
    }

    async makeRequest(url, options = {}) {
        return new Promise((resolve, reject) => {
            const startTime = performance.now();
            const client = url.startsWith('https') ? https : http;

            const req = client.request(url, options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    const endTime = performance.now();
                    const responseTime = endTime - startTime;

                    resolve({
                        status: res.statusCode,
                        data: data,
                        responseTime: responseTime,
                        headers: res.headers
                    });
                });
            });

            req.on('error', (error) => {
                const endTime = performance.now();
                const responseTime = endTime - startTime;

                reject({
                    error: error.message,
                    responseTime: responseTime
                });
            });

            if (options.body) {
                req.write(options.body);
            }

            req.end();
        });
    }

    async runHealthCheck() {
        console.log('\n🔍 Running Health Check...');

        const endpoints = [
            { name: 'CBD Engine', url: 'http://localhost:8080/health' },
            { name: 'MemoraiMCP (3000)', url: 'http://localhost:3000/health' },
            { name: 'MemoraiMCP (6368)', url: 'http://localhost:6368/health' },
            { name: 'MemoraiMCP API (3000)', url: 'http://localhost:3000/api/v1/health' },
            { name: 'MemoraiMCP API (6368)', url: 'http://localhost:6368/api/v1/health' },
            { name: 'Memorai API (6367)', url: 'http://localhost:6367/health' }
        ];

        for (const endpoint of endpoints) {
            try {
                const result = await this.makeRequest(endpoint.url);
                if (result.status === 200) {
                    console.log(`✅ ${endpoint.name}: Healthy (${Math.round(result.responseTime)}ms)`);
                } else {
                    console.log(`⚠️  ${endpoint.name}: Status ${result.status} (${Math.round(result.responseTime)}ms)`);
                }
            } catch (error) {
                console.log(`❌ ${endpoint.name}: ${error.error || 'Connection failed'}`);
            }
        }
    }

    async runSingleRequest(url, options = {}) {
        try {
            const result = await this.makeRequest(url, options);
            this.results.total++;

            if (result.status >= 200 && result.status < 400) {
                this.results.success++;
            } else {
                this.results.failed++;
                this.results.errors.push(`Status: ${result.status}`);
            }

            this.results.times.push(result.responseTime);
            return result;
        } catch (error) {
            this.results.total++;
            this.results.failed++;
            this.results.errors.push(error.error || 'Request failed');
            this.results.times.push(error.responseTime || 0);
            throw error;
        }
    }

    async runLoadTest(options = {}) {
        const {
            url = 'http://localhost:3000/health',
            concurrent = 10,
            duration = 30000, // 30 seconds
            method = 'GET',
            body = null
        } = options;

        console.log(`\n🚀 Starting Load Test...`);
        console.log(`URL: ${url}`);
        console.log(`Concurrent Users: ${concurrent}`);
        console.log(`Duration: ${duration / 1000}s`);
        console.log(`Method: ${method}\n`);

        const startTime = Date.now();
        let activeRequests = 0;
        let keepRunning = true;

        // Stop after duration
        setTimeout(() => {
            keepRunning = false;
            console.log('\n⏰ Test duration reached, stopping...');
        }, duration);

        // Worker function
        const worker = async () => {
            while (keepRunning) {
                activeRequests++;
                try {
                    await this.runSingleRequest(url, {
                        method: method,
                        body: body,
                        headers: body ? { 'Content-Type': 'application/json' } : {}
                    });
                } catch (error) {
                    // Error already recorded
                }
                activeRequests--;

                // Small delay to prevent overwhelming
                await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
            }
        };

        // Start concurrent workers
        const workers = Array(concurrent).fill().map(() => worker());

        // Wait for all workers to complete
        await Promise.all(workers);

        // Wait for remaining active requests
        while (activeRequests > 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        const totalTime = Date.now() - startTime;
        this.printResults(totalTime);
    }

    async runMemoryOperationTest() {
        console.log('\n💾 Running Memory Operation Test...');

        const testMemory = {
            agentId: `load-test-${Date.now()}`,
            content: `Load test memory ${Math.random()}`,
            metadata: {
                testRun: true,
                timestamp: new Date().toISOString()
            }
        };

        try {
            // Store memory
            const storeResult = await this.runSingleRequest('http://localhost:3000/api/v1/memories', {
                method: 'POST',
                body: JSON.stringify(testMemory),
                headers: { 'Content-Type': 'application/json' }
            });

            if (storeResult.status === 200) {
                console.log(`✅ Memory stored successfully (${Math.round(storeResult.responseTime)}ms)`);

                // Try to retrieve it
                const data = JSON.parse(storeResult.data);
                if (data.memory && data.memory.structuredKey) {
                    const retrieveResult = await this.runSingleRequest(
                        `http://localhost:3000/api/v1/memories/${data.memory.structuredKey}`
                    );

                    if (retrieveResult.status === 200) {
                        console.log(`✅ Memory retrieved successfully (${Math.round(retrieveResult.responseTime)}ms)`);
                    } else {
                        console.log(`⚠️  Memory retrieval failed: Status ${retrieveResult.status}`);
                    }
                }
            } else {
                console.log(`❌ Memory store failed: Status ${storeResult.status}`);
            }
        } catch (error) {
            console.log(`❌ Memory operation failed: ${error.error || error.message}`);
        }
    }

    printResults(duration) {
        console.log('\n📊 Load Test Results:');
        console.log('='.repeat(50));

        const successRate = (this.results.success / this.results.total * 100).toFixed(2);
        const avgTime = this.results.times.reduce((a, b) => a + b, 0) / this.results.times.length;
        const minTime = Math.min(...this.results.times);
        const maxTime = Math.max(...this.results.times);
        const p95Time = this.results.times.sort((a, b) => a - b)[Math.floor(this.results.times.length * 0.95)];
        const requestsPerSecond = (this.results.total / (duration / 1000)).toFixed(2);

        console.log(`Total Requests: ${this.results.total}`);
        console.log(`Successful: ${this.results.success} (${successRate}%)`);
        console.log(`Failed: ${this.results.failed}`);
        console.log(`Requests/Second: ${requestsPerSecond}`);
        console.log(`\nResponse Times:`);
        console.log(`  Average: ${Math.round(avgTime)}ms`);
        console.log(`  Min: ${Math.round(minTime)}ms`);
        console.log(`  Max: ${Math.round(maxTime)}ms`);
        console.log(`  95th Percentile: ${Math.round(p95Time)}ms`);

        if (this.results.errors.length > 0) {
            console.log(`\nErrors (showing first 5):`);
            this.results.errors.slice(0, 5).forEach(error => {
                console.log(`  - ${error}`);
            });
        }

        // Performance analysis
        console.log('\n🎯 Performance Analysis:');
        if (successRate >= 95) {
            console.log('✅ Success Rate: EXCELLENT (≥95%)');
        } else if (successRate >= 90) {
            console.log('⚠️  Success Rate: GOOD (≥90%)');
        } else {
            console.log('❌ Success Rate: POOR (<90%)');
        }

        if (avgTime <= 100) {
            console.log('✅ Response Time: EXCELLENT (≤100ms)');
        } else if (avgTime <= 500) {
            console.log('⚠️  Response Time: ACCEPTABLE (≤500ms)');
        } else {
            console.log('❌ Response Time: SLOW (>500ms)');
        }

        console.log('='.repeat(50));
    }
}

// Main execution
async function main() {
    const tester = new LoadTester();

    // Parse command line arguments
    const args = process.argv.slice(2);
    const testType = args[0] || 'health';

    try {
        switch (testType) {
            case 'health':
                await tester.runHealthCheck();
                break;

            case 'memory':
                await tester.runMemoryOperationTest();
                break;

            case 'load':
                const concurrent = parseInt(args[1]) || 10;
                const duration = parseInt(args[2]) || 30000;
                await tester.runLoadTest({
                    url: 'http://localhost:6367/health',
                    concurrent,
                    duration
                });
                break;

            case 'load-memory':
                const concurrentMemory = parseInt(args[1]) || 5;
                const durationMemory = parseInt(args[2]) || 30000;
                await tester.runLoadTest({
                    url: 'http://localhost:3000/api/v1/memories',
                    method: 'POST',
                    body: JSON.stringify({
                        agentId: 'load-test',
                        content: `Load test ${Math.random()}`,
                        metadata: { test: true }
                    }),
                    concurrent: concurrentMemory,
                    duration: durationMemory
                });
                break;

            default:
                console.log('Usage: node simple-load-test.js [test-type] [concurrent] [duration]');
                console.log('Test types: health, memory, load, load-memory');
                console.log('Examples:');
                console.log('  node simple-load-test.js health');
                console.log('  node simple-load-test.js memory');
                console.log('  node simple-load-test.js load 10 30000');
                console.log('  node simple-load-test.js load-memory 5 20000');
                break;
        }
    } catch (error) {
        console.error('Test execution error:', error);
    }
}

if (require.main === module) {
    main();
}

module.exports = LoadTester;
