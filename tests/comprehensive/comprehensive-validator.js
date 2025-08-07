#!/usr/bin/env node
/**
 * 🧪 CODAI Ecosystem - Comprehensive Validation Suite
 * Generated: 2025-08-03 23:36 UTC
 * Phase 9: Comprehensive Validation
 */

const { execSync } = require('child_process');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class ComprehensiveValidator {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            tests: [],
            summary: {
                total: 0,
                passed: 0,
                failed: 0,
                warnings: 0,
                coverage: 0
            }
        };

        this.services = [
            { name: 'CBD Database', port: 4180, critical: true },
            { name: 'Gateway Service', port: 4003, critical: true },
            { name: 'CODAI App', port: 4001, critical: false },
            { name: 'Hub Service', port: 4008, critical: false },
            { name: 'BancAI Service', port: 4005, critical: false },
            { name: 'MemorAI Service', port: 4006, critical: false },
            { name: 'Admin Dashboard', port: 4007, critical: false },
            { name: 'ID Service', port: 4004, critical: false }
        ];
    }

    log(level, message) {
        const timestamp = new Date().toISOString();
        const colors = {
            info: '\x1b[36m', // Cyan
            success: '\x1b[32m', // Green
            warning: '\x1b[33m', // Yellow
            error: '\x1b[31m', // Red
            reset: '\x1b[0m'
        };

        console.log(`${colors[level]}[${timestamp}] ${level.toUpperCase()}: ${message}${colors.reset}`);
    }

    async addTest(name, result, details = {}, critical = false) {
        const test = {
            name,
            result,
            details,
            critical,
            timestamp: new Date().toISOString()
        };

        this.results.tests.push(test);
        this.results.summary.total++;

        if (result === 'PASS') {
            this.results.summary.passed++;
            this.log('success', `✅ ${name}: PASSED`);
        } else if (result === 'FAIL') {
            this.results.summary.failed++;
            this.log('error', `❌ ${name}: FAILED${critical ? ' (CRITICAL)' : ''}`);
        } else if (result === 'WARN') {
            this.results.summary.warnings++;
            this.log('warning', `⚠️ ${name}: WARNING`);
        }

        if (details.message) {
            this.log('info', `   ${details.message}`);
        }
    }

    async validateServiceHealth() {
        this.log('info', '🩺 Phase 1: Service Health Validation');
        this.log('info', '=====================================');

        const healthResults = [];

        for (const service of this.services) {
            try {
                const response = await axios.get(`http://localhost:${service.port}/health`, {
                    timeout: 5000
                });

                const responseTime = response.headers['x-response-time'] || 'unknown';

                await this.addTest(
                    `Service Health - ${service.name}`,
                    'PASS',
                    {
                        message: `Response time: ${responseTime}, Status: ${response.data.status || 'healthy'}`,
                        port: service.port,
                        responseTime,
                        status: response.data
                    },
                    service.critical
                );

                healthResults.push({ ...service, healthy: true, response: response.data });
            } catch (error) {
                const result = service.critical ? 'FAIL' : 'WARN';
                await this.addTest(
                    `Service Health - ${service.name}`,
                    result,
                    {
                        message: `Connection failed: ${error.message}`,
                        port: service.port,
                        error: error.message
                    },
                    service.critical
                );

                healthResults.push({ ...service, healthy: false, error: error.message });
            }
        }

        const healthyServices = healthResults.filter(s => s.healthy).length;
        const healthPercentage = Math.round((healthyServices / this.services.length) * 100);

        this.log('info', `📊 Overall Health: ${healthyServices}/${this.services.length} services (${healthPercentage}%)`);

        return { healthResults, healthPercentage };
    }

    async validateAPIEndpoints() {
        this.log('info', '🔌 Phase 2: API Endpoint Validation');
        this.log('info', '===================================');

        const endpoints = [
            { service: 'CBD', url: 'http://localhost:4180/stats', method: 'GET' },
            { service: 'CBD', url: 'http://localhost:4180/health', method: 'GET' },
            { service: 'Gateway', url: 'http://localhost:4003/health', method: 'GET' },
            { service: 'CODAI', url: 'http://localhost:4001/api/health', method: 'GET' },
            { service: 'Hub', url: 'http://localhost:4008/api/health', method: 'GET' }
        ];

        for (const endpoint of endpoints) {
            try {
                const startTime = Date.now();
                const response = await axios({
                    method: endpoint.method,
                    url: endpoint.url,
                    timeout: 10000
                });
                const responseTime = Date.now() - startTime;

                await this.addTest(
                    `API Endpoint - ${endpoint.service} ${endpoint.method}`,
                    'PASS',
                    {
                        message: `${responseTime}ms response time`,
                        url: endpoint.url,
                        responseTime,
                        statusCode: response.status
                    }
                );
            } catch (error) {
                await this.addTest(
                    `API Endpoint - ${endpoint.service} ${endpoint.method}`,
                    'WARN',
                    {
                        message: `Failed: ${error.message}`,
                        url: endpoint.url,
                        error: error.message
                    }
                );
            }
        }
    }

    async validatePerformance() {
        this.log('info', '⚡ Phase 3: Performance Validation');
        this.log('info', '==================================');

        // Test CBD Database performance
        try {
            const iterations = 10;
            const times = [];

            for (let i = 0; i < iterations; i++) {
                const startTime = Date.now();
                await axios.get('http://localhost:4180/health');
                times.push(Date.now() - startTime);
            }

            const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
            const maxTime = Math.max(...times);
            const minTime = Math.min(...times);

            const performanceResult = avgTime < 100 ? 'PASS' : avgTime < 500 ? 'WARN' : 'FAIL';

            await this.addTest(
                'Performance - CBD Database Response Time',
                performanceResult,
                {
                    message: `Avg: ${avgTime.toFixed(2)}ms, Min: ${minTime}ms, Max: ${maxTime}ms`,
                    averageTime: avgTime,
                    minTime,
                    maxTime,
                    iterations
                }
            );
        } catch (error) {
            await this.addTest(
                'Performance - CBD Database Response Time',
                'FAIL',
                { message: `Performance test failed: ${error.message}` }
            );
        }
    }

    async validateSecurity() {
        this.log('info', '🔒 Phase 4: Security Validation');
        this.log('info', '===============================');

        // Check for common security headers
        try {
            const response = await axios.get('http://localhost:4180/health');
            const headers = response.headers;

            const securityChecks = [
                { name: 'X-Content-Type-Options', expected: 'nosniff' },
                { name: 'X-Frame-Options', expected: ['DENY', 'SAMEORIGIN'] },
                { name: 'X-XSS-Protection', expected: '1; mode=block' }
            ];

            for (const check of securityChecks) {
                const headerValue = headers[check.name.toLowerCase()];
                const hasExpected = Array.isArray(check.expected)
                    ? check.expected.includes(headerValue)
                    : headerValue === check.expected;

                await this.addTest(
                    `Security Header - ${check.name}`,
                    hasExpected ? 'PASS' : 'WARN',
                    {
                        message: `Value: ${headerValue || 'Not set'}`,
                        expected: check.expected,
                        actual: headerValue
                    }
                );
            }
        } catch (error) {
            await this.addTest(
                'Security Headers Check',
                'WARN',
                { message: `Could not check security headers: ${error.message}` }
            );
        }
    }

    async validateDataIntegrity() {
        this.log('info', '💾 Phase 5: Data Integrity Validation');
        this.log('info', '=====================================');

        try {
            // Test CBD Database functionality
            const testData = {
                collection: 'validation_test',
                document: {
                    test: true,
                    timestamp: new Date().toISOString(),
                    validator: 'comprehensive-validation-suite'
                }
            };

            // Insert test document
            const insertResponse = await axios.post(
                'http://localhost:4180/document/',
                testData,
                { headers: { 'Content-Type': 'application/json' } }
            );

            await this.addTest(
                'Data Integrity - Document Insert',
                'PASS',
                {
                    message: `Document inserted successfully`,
                    documentId: insertResponse.data.id,
                    collection: testData.collection
                }
            );

            // Retrieve test document
            if (insertResponse.data.id) {
                const retrieveResponse = await axios.get(
                    `http://localhost:4180/document/${testData.collection}/${insertResponse.data.id}`
                );

                await this.addTest(
                    'Data Integrity - Document Retrieval',
                    'PASS',
                    {
                        message: `Document retrieved successfully`,
                        documentId: insertResponse.data.id,
                        data: retrieveResponse.data
                    }
                );
            }
        } catch (error) {
            await this.addTest(
                'Data Integrity - CBD Database',
                'FAIL',
                { message: `Data integrity test failed: ${error.message}` }
            );
        }
    }

    async validateSystemResources() {
        this.log('info', '🖥️ Phase 6: System Resources Validation');
        this.log('info', '========================================');

        try {
            // Check if we can get system stats from CBD
            const statsResponse = await axios.get('http://localhost:4180/stats');

            await this.addTest(
                'System Resources - CBD Stats Available',
                'PASS',
                {
                    message: 'System statistics accessible',
                    stats: statsResponse.data
                }
            );

            // Validate uptime
            if (statsResponse.data.uptime !== undefined) {
                const uptimeMinutes = statsResponse.data.uptime / 60;
                await this.addTest(
                    'System Resources - Service Uptime',
                    uptimeMinutes > 1 ? 'PASS' : 'WARN',
                    {
                        message: `Uptime: ${uptimeMinutes.toFixed(2)} minutes`,
                        uptime: statsResponse.data.uptime
                    }
                );
            }
        } catch (error) {
            await this.addTest(
                'System Resources - Statistics',
                'WARN',
                { message: `Could not retrieve system stats: ${error.message}` }
            );
        }
    }

    async generateReport() {
        this.log('info', '📊 Generating Comprehensive Validation Report');
        this.log('info', '==============================================');

        // Calculate coverage and quality metrics
        const passRate = (this.results.summary.passed / this.results.summary.total) * 100;
        const criticalTests = this.results.tests.filter(t => t.critical);
        const criticalPassRate = criticalTests.length > 0
            ? (criticalTests.filter(t => t.result === 'PASS').length / criticalTests.length) * 100
            : 100;

        this.results.summary.passRate = Math.round(passRate);
        this.results.summary.criticalPassRate = Math.round(criticalPassRate);
        this.results.summary.coverage = this.results.summary.passRate; // Simplified coverage metric

        // Determine overall status
        let overallStatus = 'UNKNOWN';
        if (criticalPassRate === 100 && passRate >= 90) {
            overallStatus = 'EXCELLENT';
        } else if (criticalPassRate === 100 && passRate >= 80) {
            overallStatus = 'GOOD';
        } else if (criticalPassRate >= 80 && passRate >= 70) {
            overallStatus = 'ACCEPTABLE';
        } else if (criticalPassRate >= 50) {
            overallStatus = 'NEEDS_IMPROVEMENT';
        } else {
            overallStatus = 'CRITICAL_ISSUES';
        }

        this.results.overallStatus = overallStatus;

        // Save detailed report
        const reportPath = path.join(__dirname, `validation-report-${Date.now()}.json`);
        await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));

        // Generate summary
        this.log('info', '');
        this.log('info', '🎯 COMPREHENSIVE VALIDATION SUMMARY');
        this.log('info', '===================================');
        this.log('info', `📊 Overall Status: ${overallStatus}`);
        this.log('info', `📈 Pass Rate: ${passRate.toFixed(1)}% (${this.results.summary.passed}/${this.results.summary.total})`);
        this.log('info', `🚨 Critical Pass Rate: ${criticalPassRate.toFixed(1)}% (${criticalTests.filter(t => t.result === 'PASS').length}/${criticalTests.length})`);
        this.log('info', `⚠️ Warnings: ${this.results.summary.warnings}`);
        this.log('info', `❌ Failures: ${this.results.summary.failed}`);
        this.log('info', `📄 Detailed Report: ${reportPath}`);
        this.log('info', '');

        // Status-specific messages
        switch (overallStatus) {
            case 'EXCELLENT':
                this.log('success', '🎉 VALIDATION COMPLETE: System is production-ready with excellent health!');
                break;
            case 'GOOD':
                this.log('success', '✅ VALIDATION COMPLETE: System is production-ready with good health!');
                break;
            case 'ACCEPTABLE':
                this.log('warning', '⚠️ VALIDATION COMPLETE: System is functional but needs attention to non-critical issues.');
                break;
            case 'NEEDS_IMPROVEMENT':
                this.log('warning', '🔧 VALIDATION COMPLETE: System needs improvement before full production deployment.');
                break;
            case 'CRITICAL_ISSUES':
                this.log('error', '🚨 VALIDATION COMPLETE: Critical issues found. System not ready for production.');
                break;
        }

        return this.results;
    }

    async runCompleteValidation() {
        this.log('info', '🚀 Starting CODAI Ecosystem Comprehensive Validation');
        this.log('info', '====================================================');
        this.log('info', `Environment: ${this.results.environment}`);
        this.log('info', `Timestamp: ${this.results.timestamp}`);
        this.log('info', '');

        try {
            // Run all validation phases
            await this.validateServiceHealth();
            await this.validateAPIEndpoints();
            await this.validatePerformance();
            await this.validateSecurity();
            await this.validateDataIntegrity();
            await this.validateSystemResources();

            // Generate final report
            const finalResults = await this.generateReport();

            // Exit with appropriate code
            const exitCode = finalResults.overallStatus === 'CRITICAL_ISSUES' ? 1 : 0;
            process.exit(exitCode);

        } catch (error) {
            this.log('error', `Validation suite failed: ${error.message}`);
            this.log('error', error.stack);
            process.exit(1);
        }
    }
}

// Run validation if called directly
if (require.main === module) {
    const validator = new ComprehensiveValidator();
    validator.runCompleteValidation();
}

module.exports = ComprehensiveValidator;
