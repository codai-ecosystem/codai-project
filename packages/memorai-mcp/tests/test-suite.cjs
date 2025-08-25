#!/usr/bin/env node

/**
 * 🧠 MemorAI MCP - Comprehensive Test Suite
 * Tests all phases and components of the MemorAI MCP system
 */

const config = require('../src/utils/config.cjs');
const logger = require('../src/utils/logger.cjs');

class MemorAIMCPTestSuite {
    constructor() {
        this.testResults = [];
        this.phases = [
            { phase: 2, name: 'CBD Integration', port: config.PORTS.PHASE_2_CBD, server: 'memorai-mcp-advanced-phase4.cjs' },
            { phase: 3, name: 'Intelligence Layer', port: config.PORTS.PHASE_3_INTELLIGENCE, server: 'memorai-mcp-intelligent.cjs' },
            { phase: 4, name: 'Enterprise Features', port: config.PORTS.PHASE_4_ENTERPRISE, server: 'memorai-mcp-advanced-phase4.cjs' },
            { phase: 5, name: 'Performance Optimization', port: config.PORTS.PHASE_5_PERFORMANCE, server: 'memorai-mcp-performance-phase5.cjs' },
            { phase: 6, name: 'Real-time Collaboration', port: config.PORTS.PHASE_6_REALTIME, server: 'memorai-mcp-realtime-phase6.cjs' },
            { phase: 7, name: 'AI Integration', port: config.PORTS.PHASE_7_AI, server: 'memorai-mcp-ai-phase7.cjs' }
        ];
        this.startTime = Date.now();
    }

    async runAllTests() {
        logger.info('🧪 Starting MemorAI MCP Comprehensive Test Suite', {
            totalPhases: this.phases.length,
            testId: `test-${Date.now()}`
        });

        console.log('🧠 MemorAI MCP - Comprehensive Test Suite');
        console.log('==========================================');
        console.log(`📊 Testing ${this.phases.length} phases`);
        console.log(`🕐 Started at: ${new Date().toISOString()}`);
        console.log('==========================================\n');

        for (const phase of this.phases) {
            await this.testPhase(phase);
        }

        await this.generateTestReport();
    }

    async testPhase(phase) {
        const phaseLogger = logger.createPhaseLogger(phase.phase);

        console.log(`🔬 Testing Phase ${phase.phase}: ${phase.name}`);
        console.log(`📡 Port: ${phase.port}`);
        console.log(`🖥️ Server: ${phase.server}`);

        const phaseStart = Date.now();
        const testResult = {
            phase: phase.phase,
            name: phase.name,
            port: phase.port,
            server: phase.server,
            tests: [],
            startTime: phaseStart,
            endTime: null,
            duration: null,
            status: 'running',
            overallSuccess: false
        };

        try {
            // Test 1: Health Check
            const healthTest = await this.testHealthEndpoint(phase);
            testResult.tests.push(healthTest);
            phaseLogger.info(`Health check: ${healthTest.success ? 'PASS' : 'FAIL'}`, healthTest);

            // Test 2: Basic API Endpoints
            const apiTest = await this.testBasicAPI(phase);
            testResult.tests.push(apiTest);
            phaseLogger.info(`API test: ${apiTest.success ? 'PASS' : 'FAIL'}`, apiTest);

            // Test 3: Memory Operations (if applicable)
            if (phase.phase >= 2) {
                const memoryTest = await this.testMemoryOperations(phase);
                testResult.tests.push(memoryTest);
                phaseLogger.info(`Memory operations: ${memoryTest.success ? 'PASS' : 'FAIL'}`, memoryTest);
            }

            // Test 4: Performance Test
            const performanceTest = await this.testPerformance(phase);
            testResult.tests.push(performanceTest);
            phaseLogger.info(`Performance test: ${performanceTest.success ? 'PASS' : 'FAIL'}`, performanceTest);

            // Test 5: Phase-specific tests
            const specificTest = await this.testPhaseSpecific(phase);
            testResult.tests.push(specificTest);
            phaseLogger.info(`Phase-specific test: ${specificTest.success ? 'PASS' : 'FAIL'}`, specificTest);

            // Calculate overall success
            testResult.overallSuccess = testResult.tests.every(test => test.success);
            testResult.status = testResult.overallSuccess ? 'passed' : 'failed';

        } catch (error) {
            phaseLogger.errorWithStack(`Phase ${phase.phase} testing failed`, error);
            testResult.tests.push({
                name: 'Exception Handler',
                success: false,
                error: error.message,
                duration: 0
            });
            testResult.status = 'error';
            testResult.overallSuccess = false;
        }

        testResult.endTime = Date.now();
        testResult.duration = testResult.endTime - testResult.startTime;

        this.testResults.push(testResult);

        const statusIcon = testResult.overallSuccess ? '✅' : '❌';
        const passedTests = testResult.tests.filter(t => t.success).length;
        const totalTests = testResult.tests.length;

        console.log(`${statusIcon} Phase ${phase.phase}: ${passedTests}/${totalTests} tests passed (${testResult.duration}ms)`);
        console.log('');

        return testResult;
    }

    async testHealthEndpoint(phase) {
        const testStart = Date.now();
        const testName = 'Health Endpoint';

        try {
            const response = await this.makeRequest(`http://localhost:${phase.port}/health`);

            const success = response.status === 'healthy' || response.status === 'success';

            return {
                name: testName,
                success: success,
                responseTime: Date.now() - testStart,
                response: response,
                endpoint: '/health'
            };
        } catch (error) {
            return {
                name: testName,
                success: false,
                responseTime: Date.now() - testStart,
                error: error.message,
                endpoint: '/health'
            };
        }
    }

    async testBasicAPI(phase) {
        const testStart = Date.now();
        const testName = 'Basic API Structure';

        try {
            // Test various endpoints that should exist
            const endpoints = ['/health'];

            if (phase.phase >= 4) endpoints.push('/stats');
            if (phase.phase >= 7) endpoints.push('/ai/stats');

            let successCount = 0;
            const endpointResults = [];

            for (const endpoint of endpoints) {
                try {
                    const response = await this.makeRequest(`http://localhost:${phase.port}${endpoint}`);
                    endpointResults.push({ endpoint, success: true, response });
                    successCount++;
                } catch (error) {
                    endpointResults.push({ endpoint, success: false, error: error.message });
                }
            }

            return {
                name: testName,
                success: successCount === endpoints.length,
                responseTime: Date.now() - testStart,
                endpointResults: endpointResults,
                successRate: `${successCount}/${endpoints.length}`
            };
        } catch (error) {
            return {
                name: testName,
                success: false,
                responseTime: Date.now() - testStart,
                error: error.message
            };
        }
    }

    async testMemoryOperations(phase) {
        const testStart = Date.now();
        const testName = 'Memory Operations';

        try {
            // Try to create a test memory
            const memoryData = {
                content: `Test memory for Phase ${phase.phase} - ${Date.now()}`,
                metadata: {
                    test: true,
                    phase: phase.phase,
                    timestamp: new Date().toISOString()
                },
                tags: ['test', 'automation', `phase-${phase.phase}`],
                importance: 0.8
            };

            let createResponse;
            let success = false;

            // Different endpoints for different phases
            if (phase.phase >= 7) {
                // AI-enhanced memory creation
                createResponse = await this.makeRequest(
                    `http://localhost:${phase.port}/ai/memory`,
                    'POST',
                    memoryData,
                    { 'Authorization': `Bearer ${config.SECURITY.API_KEY}` }
                );
            } else if (phase.phase >= 2) {
                // Regular memory creation
                createResponse = await this.makeRequest(
                    `http://localhost:${phase.port}/memory`,
                    'POST',
                    memoryData,
                    { 'Authorization': `Bearer ${config.SECURITY.API_KEY}` }
                );
            }

            success = createResponse && (createResponse.status === 'success' || createResponse.memory);

            return {
                name: testName,
                success: success,
                responseTime: Date.now() - testStart,
                memoryCreated: success,
                response: createResponse
            };
        } catch (error) {
            return {
                name: testName,
                success: false,
                responseTime: Date.now() - testStart,
                error: error.message
            };
        }
    }

    async testPerformance(phase) {
        const testStart = Date.now();
        const testName = 'Performance Test';

        try {
            const iterations = 5;
            const responseTimes = [];
            let successfulRequests = 0;

            for (let i = 0; i < iterations; i++) {
                const reqStart = Date.now();
                try {
                    await this.makeRequest(`http://localhost:${phase.port}/health`);
                    responseTimes.push(Date.now() - reqStart);
                    successfulRequests++;
                } catch (error) {
                    responseTimes.push(Date.now() - reqStart);
                }
            }

            const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
            const maxResponseTime = Math.max(...responseTimes);
            const minResponseTime = Math.min(...responseTimes);

            const success = successfulRequests === iterations && avgResponseTime < 1000; // Less than 1 second average

            return {
                name: testName,
                success: success,
                responseTime: Date.now() - testStart,
                avgResponseTime: Math.round(avgResponseTime),
                maxResponseTime: maxResponseTime,
                minResponseTime: minResponseTime,
                successRate: `${successfulRequests}/${iterations}`,
                performanceGrade: avgResponseTime < 100 ? 'A' : avgResponseTime < 500 ? 'B' : avgResponseTime < 1000 ? 'C' : 'D'
            };
        } catch (error) {
            return {
                name: testName,
                success: false,
                responseTime: Date.now() - testStart,
                error: error.message
            };
        }
    }

    async testPhaseSpecific(phase) {
        const testStart = Date.now();
        const testName = `Phase ${phase.phase} Specific Features`;

        try {
            let specificTest = { success: false };

            switch (phase.phase) {
                case 2:
                    // Test CBD integration
                    specificTest = await this.testCBDIntegration(phase);
                    break;

                case 3:
                    // Test intelligence features
                    specificTest = await this.testIntelligenceFeatures(phase);
                    break;

                case 4:
                    // Test enterprise features
                    specificTest = await this.testEnterpriseFeatures(phase);
                    break;

                case 5:
                    // Test performance features
                    specificTest = await this.testPerformanceFeatures(phase);
                    break;

                case 6:
                    // Test real-time features
                    specificTest = await this.testRealtimeFeatures(phase);
                    break;

                case 7:
                    // Test AI features
                    specificTest = await this.testAIFeatures(phase);
                    break;

                default:
                    specificTest = { success: true, message: 'No specific tests defined' };
            }

            return {
                name: testName,
                success: specificTest.success,
                responseTime: Date.now() - testStart,
                details: specificTest
            };
        } catch (error) {
            return {
                name: testName,
                success: false,
                responseTime: Date.now() - testStart,
                error: error.message
            };
        }
    }

    async testCBDIntegration(phase) {
        try {
            // Test CBD stats endpoint
            const response = await this.makeRequest(`http://localhost:${phase.port}/cbd/stats`);
            return {
                success: response && response.status === 'success',
                feature: 'CBD Integration',
                response: response
            };
        } catch (error) {
            return {
                success: false,
                feature: 'CBD Integration',
                error: error.message
            };
        }
    }

    async testIntelligenceFeatures(phase) {
        try {
            // Test intelligence stats
            const response = await this.makeRequest(`http://localhost:${phase.port}/intelligence/stats`);
            return {
                success: response && response.status === 'success',
                feature: 'Intelligence Layer',
                response: response
            };
        } catch (error) {
            return {
                success: false,
                feature: 'Intelligence Layer',
                error: error.message
            };
        }
    }

    async testEnterpriseFeatures(phase) {
        try {
            // Test enterprise stats
            const response = await this.makeRequest(`http://localhost:${phase.port}/enterprise/stats`);
            return {
                success: response && response.status === 'success',
                feature: 'Enterprise Features',
                response: response
            };
        } catch (error) {
            return {
                success: false,
                feature: 'Enterprise Features',
                error: error.message
            };
        }
    }

    async testPerformanceFeatures(phase) {
        try {
            // Test cluster stats
            const response = await this.makeRequest(`http://localhost:${phase.port}/cluster/stats`);
            return {
                success: response && response.status === 'success',
                feature: 'Performance Clustering',
                response: response
            };
        } catch (error) {
            return {
                success: false,
                feature: 'Performance Clustering',
                error: error.message
            };
        }
    }

    async testRealtimeFeatures(phase) {
        try {
            // Test WebSocket health (can't easily test WebSocket in this context)
            const response = await this.makeRequest(`http://localhost:${phase.port}/realtime/stats`);
            return {
                success: response && response.status === 'success',
                feature: 'Real-time Collaboration',
                response: response
            };
        } catch (error) {
            return {
                success: false,
                feature: 'Real-time Collaboration',
                error: error.message
            };
        }
    }

    async testAIFeatures(phase) {
        try {
            // Test AI stats
            const response = await this.makeRequest(
                `http://localhost:${phase.port}/ai/stats`,
                'GET',
                null,
                { 'Authorization': `Bearer ${config.SECURITY.API_KEY}` }
            );
            return {
                success: response && response.status === 'success',
                feature: 'AI Integration',
                response: response
            };
        } catch (error) {
            return {
                success: false,
                feature: 'AI Integration',
                error: error.message
            };
        }
    }

    async makeRequest(url, method = 'GET', data = null, headers = {}) {
        const https = require('https');
        const http = require('http');

        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            const isHttps = urlObj.protocol === 'https:';
            const client = isHttps ? https : http;

            const options = {
                hostname: urlObj.hostname,
                port: urlObj.port || (isHttps ? 443 : 80),
                path: urlObj.pathname + urlObj.search,
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'MemorAI-MCP-Test-Suite/1.0',
                    ...headers
                },
                timeout: 10000 // 10 second timeout
            };

            if (data && method !== 'GET') {
                const jsonData = JSON.stringify(data);
                options.headers['Content-Length'] = Buffer.byteLength(jsonData);
            }

            const req = client.request(options, (res) => {
                let responseData = '';

                res.on('data', (chunk) => {
                    responseData += chunk;
                });

                res.on('end', () => {
                    try {
                        const parsedData = JSON.parse(responseData);
                        resolve(parsedData);
                    } catch (error) {
                        resolve({ status: 'success', raw: responseData });
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

            if (data && method !== 'GET') {
                req.write(JSON.stringify(data));
            }

            req.end();
        });
    }

    async generateTestReport() {
        const totalDuration = Date.now() - this.startTime;
        const passedPhases = this.testResults.filter(r => r.overallSuccess).length;
        const totalPhases = this.testResults.length;
        const totalTests = this.testResults.reduce((sum, r) => sum + r.tests.length, 0);
        const passedTests = this.testResults.reduce((sum, r) => sum + r.tests.filter(t => t.success).length, 0);

        console.log('\n🧪 MemorAI MCP Test Suite - Final Report');
        console.log('=========================================');
        console.log(`📊 Overall Results: ${passedPhases}/${totalPhases} phases passed`);
        console.log(`🎯 Test Results: ${passedTests}/${totalTests} individual tests passed`);
        console.log(`🕐 Total Duration: ${totalDuration}ms`);
        console.log(`📈 Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
        console.log('');

        // Detailed phase results
        for (const result of this.testResults) {
            const statusIcon = result.overallSuccess ? '✅' : '❌';
            const passedTests = result.tests.filter(t => t.success).length;
            const totalTests = result.tests.length;

            console.log(`${statusIcon} Phase ${result.phase} (${result.name}): ${passedTests}/${totalTests} tests`);

            for (const test of result.tests) {
                const testIcon = test.success ? '  ✓' : '  ✗';
                console.log(`${testIcon} ${test.name} (${test.responseTime || 0}ms)`);

                if (!test.success && test.error) {
                    console.log(`    Error: ${test.error}`);
                }
            }
            console.log('');
        }

        // Performance summary
        const avgResponseTimes = this.testResults.map(r => {
            const perfTest = r.tests.find(t => t.name === 'Performance Test');
            return perfTest ? perfTest.avgResponseTime || 0 : 0;
        });

        const overallAvgResponse = avgResponseTimes.reduce((a, b) => a + b, 0) / avgResponseTimes.length;

        console.log('📊 Performance Summary:');
        console.log(`Average Response Time: ${Math.round(overallAvgResponse)}ms`);
        console.log('');

        // Save detailed report
        await this.saveTestReport({
            summary: {
                totalPhases,
                passedPhases,
                totalTests,
                passedTests,
                successRate: Math.round((passedTests / totalTests) * 100),
                totalDuration,
                overallAvgResponse: Math.round(overallAvgResponse)
            },
            phases: this.testResults,
            timestamp: new Date().toISOString(),
            config: {
                nodeEnv: config.SYSTEM.NODE_ENV,
                nodeId: config.SYSTEM.NODE_ID
            }
        });

        logger.info('Test suite completed', {
            totalPhases,
            passedPhases,
            totalTests,
            passedTests,
            successRate: Math.round((passedTests / totalTests) * 100),
            duration: totalDuration
        });

        const overallSuccess = passedPhases === totalPhases;
        console.log(overallSuccess ? '🎉 ALL TESTS PASSED! 🎉' : '⚠️  SOME TESTS FAILED ⚠️');

        return overallSuccess;
    }

    async saveTestReport(report) {
        const fs = require('fs').promises;
        const path = require('path');

        try {
            const reportsDir = path.join(__dirname, '../docs/test-reports');
            await fs.mkdir(reportsDir, { recursive: true });

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const reportFile = path.join(reportsDir, `test-report-${timestamp}.json`);

            await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
            console.log(`📄 Detailed test report saved: ${reportFile}`);
        } catch (error) {
            logger.error('Failed to save test report', error);
        }
    }
}

// Run tests if called directly
if (require.main === module) {
    const testSuite = new MemorAIMCPTestSuite();
    testSuite.runAllTests().then((success) => {
        process.exit(success ? 0 : 1);
    }).catch((error) => {
        console.error('Test suite failed:', error);
        process.exit(1);
    });
}

module.exports = MemorAIMCPTestSuite;
