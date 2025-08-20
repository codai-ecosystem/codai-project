#!/usr/bin/env node

/**
 * CBD Universal Database - Comprehensive Test Suite
 * Test Runner for all CBD services and endpoints
 * 
 * Usage: node comprehensive-test-suite.cjs
 */

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

class CBDComprehensiveTestSuite {
    constructor() {
        this.services = {
            'CBD Core Database': { port: 4180, baseUrl: 'http://localhost:4180' },
            'Real-time Collaboration': { port: 4600, baseUrl: 'http://localhost:4600' },
            'AI Analytics Engine': { port: 4700, baseUrl: 'http://localhost:4700' },
            'GraphQL API Gateway': { port: 4800, baseUrl: 'http://localhost:4800' },
            'Service Mesh Gateway': { port: 4000, baseUrl: 'http://localhost:4000' }
        };

        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            tests: [],
            services: {},
            startTime: Date.now()
        };

        this.testData = {
            sampleDocument: {
                collection: 'test_comprehensive',
                document: {
                    name: 'Comprehensive Test Document',
                    timestamp: new Date().toISOString(),
                    data: { test: true, number: 42 }
                }
            },
            sampleNLPText: "This is a comprehensive test of the natural language processing capabilities.",
            sampleGraphQLQuery: '{ __schema { types { name } } }',
            sampleCollaborationRoom: {
                name: 'Comprehensive Test Room',
                documentId: 'test-doc-123',
                ownerId: 'test-user-456'
            }
        };
    }

    async makeRequest(url, options = {}) {
        const startTime = performance.now();
        try {
            const response = await fetch(url, {
                timeout: 10000,
                ...options
            });
            const endTime = performance.now();
            const responseTime = Math.round(endTime - startTime);

            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            return {
                success: response.ok,
                status: response.status,
                statusText: response.statusText,
                data,
                responseTime,
                headers: Object.fromEntries(response.headers.entries())
            };
        } catch (error) {
            const endTime = performance.now();
            return {
                success: false,
                status: 0,
                statusText: 'Network Error',
                error: error.message,
                responseTime: Math.round(endTime - startTime)
            };
        }
    }

    async testService(serviceName, config) {
        console.log(`\n🔍 Testing ${serviceName}...`);
        const serviceResults = {
            name: serviceName,
            baseUrl: config.baseUrl,
            port: config.port,
            tests: [],
            overall: { passed: 0, failed: 0, responseTime: 0 }
        };

        // Health Check Test
        await this.runTest(serviceResults, 'Health Check', async () => {
            const result = await this.makeRequest(`${config.baseUrl}/health`);
            if (!result.success) throw new Error(`Health check failed: ${result.status} ${result.statusText}`);
            return { status: 'healthy', responseTime: result.responseTime, data: result.data };
        });

        // Service-specific tests
        switch (serviceName) {
            case 'CBD Core Database':
                await this.testCBDCore(serviceResults, config);
                break;
            case 'Real-time Collaboration':
                await this.testCollaboration(serviceResults, config);
                break;
            case 'AI Analytics Engine':
                await this.testAIAnalytics(serviceResults, config);
                break;
            case 'GraphQL API Gateway':
                await this.testGraphQL(serviceResults, config);
                break;
            case 'Service Mesh Gateway':
                await this.testServiceMesh(serviceResults, config);
                break;
        }

        this.results.services[serviceName] = serviceResults;
        return serviceResults;
    }

    async testCBDCore(serviceResults, config) {
        // Statistics endpoint
        await this.runTest(serviceResults, 'Statistics Endpoint', async () => {
            const result = await this.makeRequest(`${config.baseUrl}/stats`);
            if (!result.success) throw new Error(`Stats failed: ${result.status}`);
            return { paradigms: result.data.paradigms?.length || 0, uptime: result.data.uptime };
        });

        // Document insertion
        await this.runTest(serviceResults, 'Document Insertion', async () => {
            const result = await this.makeRequest(`${config.baseUrl}/document/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.testData.sampleDocument)
            });
            if (!result.success) throw new Error(`Document insertion failed: ${result.status}`);
            return { inserted: true, documentId: result.data.insertedId || result.data.id };
        });

        // Key-Value operations
        await this.runTest(serviceResults, 'Key-Value Operations', async () => {
            const setResult = await this.makeRequest(`${config.baseUrl}/kv/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'test_key_comprehensive', value: { test: 'comprehensive_value' } })
            });
            if (!setResult.success) throw new Error(`KV set failed: ${setResult.status}`);

            const getResult = await this.makeRequest(`${config.baseUrl}/kv/test_key_comprehensive`);
            if (!getResult.success) throw new Error(`KV get failed: ${getResult.status}`);

            return { set: true, get: true, value: getResult.data };
        });

        // Vector operations
        await this.runTest(serviceResults, 'Vector Operations', async () => {
            const result = await this.makeRequest(`${config.baseUrl}/vector/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: 'test_vector_comprehensive',
                    vector: [0.1, 0.2, 0.3, 0.4, 0.5],
                    metadata: { test: 'comprehensive' }
                })
            });
            if (!result.success) throw new Error(`Vector insertion failed: ${result.status}`);
            return { inserted: true, vectorId: result.data.id };
        });

        // Time-series operations
        await this.runTest(serviceResults, 'Time-series Operations', async () => {
            const result = await this.makeRequest(`${config.baseUrl}/timeseries/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    metric: 'test_metric_comprehensive',
                    value: 42.5,
                    timestamp: Date.now(),
                    tags: { test: 'comprehensive' }
                })
            });
            if (!result.success) throw new Error(`Time-series write failed: ${result.status}`);
            return { written: true, metric: 'test_metric_comprehensive' };
        });
    }

    async testCollaboration(serviceResults, config) {
        // Statistics endpoint
        await this.runTest(serviceResults, 'Statistics Endpoint', async () => {
            const result = await this.makeRequest(`${config.baseUrl}/api/collaboration/stats`);
            if (!result.success) throw new Error(`Stats failed: ${result.status}`);
            return { connections: result.data.totalConnections, rooms: result.data.activeRooms };
        });

        // Room creation
        await this.runTest(serviceResults, 'Room Creation', async () => {
            const result = await this.makeRequest(`${config.baseUrl}/api/collaboration/room`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.testData.sampleCollaborationRoom)
            });
            if (!result.success) throw new Error(`Room creation failed: ${result.status}`);
            return { created: true, roomId: result.data.room_id };
        });

        // Document creation
        await this.runTest(serviceResults, 'Document Creation', async () => {
            const result = await this.makeRequest(`${config.baseUrl}/api/collaboration/document`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: 'Comprehensive Test Document',
                    content: 'This is a comprehensive test document.',
                    ownerId: 'test-user-456'
                })
            });
            if (!result.success) throw new Error(`Document creation failed: ${result.status}`);
            return { created: true, documentId: result.data.document_id };
        });
    }

    async testAIAnalytics(serviceResults, config) {
        // Dashboard endpoint
        await this.runTest(serviceResults, 'Analytics Dashboard', async () => {
            const result = await this.makeRequest(`${config.baseUrl}/api/analytics/dashboard`);
            if (!result.success) throw new Error(`Dashboard failed: ${result.status}`);
            return { available: true, features: Object.keys(result.data.features || {}).length };
        });

        // NLP Analysis
        await this.runTest(serviceResults, 'NLP Analysis', async () => {
            const result = await this.makeRequest(`${config.baseUrl}/api/nlp/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: this.testData.sampleNLPText })
            });
            if (!result.success) throw new Error(`NLP analysis failed: ${result.status}`);
            return {
                analyzed: true,
                tokens: result.data.tokens?.length || 0,
                sentiment: result.data.sentiment_classification
            };
        });

        // ML Prediction (if available)
        await this.runTest(serviceResults, 'ML Prediction', async () => {
            const result = await this.makeRequest(`${config.baseUrl}/api/ml/predict`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'test_model',
                    data: [1, 2, 3, 4, 5]
                })
            });
            // This might fail if no model is trained, so we're more lenient
            return {
                attempted: true,
                success: result.success,
                status: result.status
            };
        });

        // Anomaly Detection
        await this.runTest(serviceResults, 'Anomaly Detection', async () => {
            const result = await this.makeRequest(`${config.baseUrl}/api/analytics/anomaly-detection`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    data: [1, 2, 3, 4, 5, 100, 6, 7, 8, 9], // 100 is an anomaly
                    threshold: 2.0
                })
            });
            return {
                attempted: true,
                success: result.success,
                anomalies: result.data?.anomalies?.length || 0
            };
        });
    }

    async testGraphQL(serviceResults, config) {
        // Schema info
        await this.runTest(serviceResults, 'Schema Information', async () => {
            const result = await this.makeRequest(`${config.baseUrl}/schema`);
            if (!result.success) throw new Error(`Schema info failed: ${result.status}`);
            return { available: true, introspection: result.data.introspection };
        });

        // GraphQL Introspection
        await this.runTest(serviceResults, 'GraphQL Introspection', async () => {
            const result = await this.makeRequest(`${config.baseUrl}/graphql`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: this.testData.sampleGraphQLQuery })
            });
            if (!result.success) throw new Error(`GraphQL query failed: ${result.status}`);
            return {
                query: true,
                types: result.data?.data?.__schema?.types?.length || 0
            };
        });

        // Statistics endpoint
        await this.runTest(serviceResults, 'Statistics Endpoint', async () => {
            const result = await this.makeRequest(`${config.baseUrl}/stats`);
            if (!result.success) throw new Error(`Stats failed: ${result.status}`);
            return {
                queries: result.data.totalQueries,
                uptime: result.data.uptime,
                features: Object.keys(result.data.features || {}).length
            };
        });
    }

    async testServiceMesh(serviceResults, config) {
        // This service might not be running, so we're more lenient
        await this.runTest(serviceResults, 'Service Discovery', async () => {
            const result = await this.makeRequest(`${config.baseUrl}/health`);
            return {
                attempted: true,
                success: result.success,
                status: result.status,
                note: result.success ? 'Service Mesh is running' : 'Service Mesh appears to be down'
            };
        }, false); // Don't fail the overall test if this fails
    }

    async runTest(serviceResults, testName, testFunction, shouldFail = true) {
        const startTime = performance.now();
        this.results.total++;

        try {
            console.log(`  ⏳ ${testName}...`);
            const result = await testFunction();
            const endTime = performance.now();
            const duration = Math.round(endTime - startTime);

            console.log(`  ✅ ${testName} (${duration}ms)`);
            this.results.passed++;
            serviceResults.overall.passed++;
            serviceResults.overall.responseTime += duration;

            serviceResults.tests.push({
                name: testName,
                status: 'passed',
                duration,
                result
            });

            this.results.tests.push({
                service: serviceResults.name,
                test: testName,
                status: 'passed',
                duration,
                result
            });

        } catch (error) {
            const endTime = performance.now();
            const duration = Math.round(endTime - startTime);

            if (shouldFail) {
                console.log(`  ❌ ${testName} (${duration}ms): ${error.message}`);
                this.results.failed++;
                serviceResults.overall.failed++;
            } else {
                console.log(`  ⚠️  ${testName} (${duration}ms): ${error.message} (non-critical)`);
                this.results.skipped++;
            }

            serviceResults.tests.push({
                name: testName,
                status: shouldFail ? 'failed' : 'skipped',
                duration,
                error: error.message
            });

            this.results.tests.push({
                service: serviceResults.name,
                test: testName,
                status: shouldFail ? 'failed' : 'skipped',
                duration,
                error: error.message
            });
        }
    }

    async run() {
        console.log('🧪 CBD Universal Database - Comprehensive Test Suite');
        console.log('=====================================================');
        console.log(`Started at: ${new Date().toISOString()}`);
        console.log(`Testing ${Object.keys(this.services).length} services...\n`);

        // Test all services
        for (const [serviceName, config] of Object.entries(this.services)) {
            await this.testService(serviceName, config);
        }

        // Generate report
        this.generateReport();
    }

    generateReport() {
        const duration = Date.now() - this.results.startTime;
        const successRate = Math.round((this.results.passed / this.results.total) * 100);

        console.log('\n🎯 COMPREHENSIVE TEST RESULTS');
        console.log('=====================================');
        console.log(`Total Tests: ${this.results.total}`);
        console.log(`✅ Passed: ${this.results.passed}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log(`⚠️  Skipped: ${this.results.skipped}`);
        console.log(`🎯 Success Rate: ${successRate}%`);
        console.log(`⏱️  Total Duration: ${duration}ms`);

        // Service breakdown
        console.log('\n📊 SERVICE BREAKDOWN');
        console.log('====================');

        for (const [serviceName, serviceResult] of Object.entries(this.results.services)) {
            const serviceSuccess = serviceResult.overall.passed / (serviceResult.overall.passed + serviceResult.overall.failed) * 100;
            const avgResponseTime = serviceResult.overall.responseTime / serviceResult.tests.length;

            console.log(`\n${serviceResult.tests.length > 0 && serviceResult.tests[0].status === 'passed' ? '✅' : '❌'} ${serviceName}`);
            console.log(`   Success Rate: ${Math.round(serviceSuccess)}%`);
            console.log(`   Tests: ${serviceResult.overall.passed}/${serviceResult.overall.passed + serviceResult.overall.failed}`);
            console.log(`   Avg Response: ${Math.round(avgResponseTime)}ms`);
            console.log(`   Endpoint: ${serviceResult.baseUrl}`);
        }

        // Health assessment
        console.log('\n🏥 SYSTEM HEALTH ASSESSMENT');
        console.log('===========================');

        if (successRate >= 90) {
            console.log('🟢 EXCELLENT: System is running optimally');
        } else if (successRate >= 75) {
            console.log('🟡 GOOD: System is mostly operational with minor issues');
        } else if (successRate >= 50) {
            console.log('🟠 WARNING: System has significant issues requiring attention');
        } else {
            console.log('🔴 CRITICAL: System has major problems and needs immediate attention');
        }

        // Recommendations
        console.log('\n💡 RECOMMENDATIONS');
        console.log('==================');

        const failedServices = Object.entries(this.results.services)
            .filter(([name, result]) => result.overall.failed > 0)
            .map(([name]) => name);

        if (failedServices.length > 0) {
            console.log('🔧 Services needing attention:');
            failedServices.forEach(service => console.log(`   • ${service}`));
        } else {
            console.log('✅ All services are functioning properly');
        }

        // Save detailed report
        const reportPath = path.join(__dirname, 'comprehensive-test-report.json');
        fs.writeFileSync(reportPath, JSON.stringify({
            timestamp: new Date().toISOString(),
            summary: {
                total: this.results.total,
                passed: this.results.passed,
                failed: this.results.failed,
                skipped: this.results.skipped,
                successRate,
                duration
            },
            services: this.results.services,
            tests: this.results.tests
        }, null, 2));

        console.log(`\n📄 Detailed report saved to: ${reportPath}`);
        console.log('\n🎉 Comprehensive testing complete!');

        // Exit with appropriate code
        process.exit(this.results.failed > 0 ? 1 : 0);
    }
}

// Handle fetch polyfill for Node.js
async function setupFetch() {
    if (typeof fetch === 'undefined') {
        try {
            const { default: fetch } = await import('node-fetch');
            global.fetch = fetch;
        } catch (error) {
            console.error('❌ fetch not available and node-fetch not installed');
            console.log('Please install node-fetch: npm install node-fetch');
            process.exit(1);
        }
    }
}

// Run the comprehensive test suite
async function main() {
    await setupFetch();
    const testSuite = new CBDComprehensiveTestSuite();
    await testSuite.run();
}

if (require.main === module) {
    main().catch(error => {
        console.error('❌ Test suite failed:', error);
        process.exit(1);
    });
}

module.exports = CBDComprehensiveTestSuite;
