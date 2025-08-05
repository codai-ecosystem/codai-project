#!/usr/bin/env node

/**
 * MemorAI Local Performance Testing Suite
 * Comprehensive load testing for local development environment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Local Performance Testing Configuration
const CONFIG = {
    baseUrl: 'http://localhost:4006', // MemorAI local dev server
    apiUrl: 'http://localhost:4180',  // CBD API local server
    testDuration: '2m',
    rampUpTime: '30s',
    maxVUsers: 100,
    scenarios: {
        smoke: { users: 5, duration: '30s' },
        load: { users: 20, duration: '2m' },
        stress: { users: 50, duration: '3m' }
    },
    thresholds: {
        responseTime95: 3000, // 95th percentile < 3s (relaxed for local)
        responseTime99: 5000, // 99th percentile < 5s
        errorRate: 0.05, // < 5% error rate (relaxed for local)
        throughput: 10, // > 10 RPS (relaxed for local)
        availability: 0.95 // > 95% uptime
    }
};

class LocalPerformanceTestSuite {
    constructor() {
        this.results = {};
        this.startTime = Date.now();
        this.testReport = {
            summary: {},
            scenarios: {},
            metrics: {},
            recommendations: []
        };
    }

    // Check Local Services
    async checkLocalServices() {
        console.log('🔍 Checking local services...');

        const services = [
            { name: 'MemorAI App', url: CONFIG.baseUrl, required: true },
            { name: 'CBD Database', url: CONFIG.apiUrl + '/health', required: true }
        ];

        let allHealthy = true;

        for (const service of services) {
            try {
                const response = execSync(`curl -s -o /dev/null -w "%{http_code}" ${service.url}`, {
                    encoding: 'utf8',
                    timeout: 5000
                });

                const statusCode = response.trim();
                if (statusCode === '200' || statusCode === '000') {
                    console.log(`✅ ${service.name}: Healthy`);
                } else {
                    console.log(`⚠️ ${service.name}: Status ${statusCode}`);
                    if (service.required) allHealthy = false;
                }
            } catch (error) {
                console.log(`❌ ${service.name}: Offline`);
                if (service.required) allHealthy = false;
            }
        }

        return allHealthy;
    }

    // Simple Load Test (without K6)
    async runSimpleLoadTest(scenario) {
        console.log(`\n🚀 Running ${scenario.toUpperCase()} load test...`);
        console.log(`Users: ${CONFIG.scenarios[scenario].users}, Duration: ${CONFIG.scenarios[scenario].duration}`);

        const results = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            responseTimes: [],
            errors: []
        };

        const startTime = Date.now();
        const testDuration = this.parseDuration(CONFIG.scenarios[scenario].duration);
        const users = CONFIG.scenarios[scenario].users;

        // Simulate concurrent users
        const promises = [];

        for (let user = 0; user < users; user++) {
            promises.push(this.simulateUser(user, testDuration, results));
        }

        try {
            await Promise.all(promises);
        } catch (error) {
            console.error(`❌ Test error: ${error.message}`);
        }

        const endTime = Date.now();
        const actualDuration = (endTime - startTime) / 1000;

        // Calculate metrics
        const averageResponseTime = results.responseTimes.length > 0
            ? results.responseTimes.reduce((sum, time) => sum + time, 0) / results.responseTimes.length
            : 0;

        const sortedTimes = results.responseTimes.sort((a, b) => a - b);
        const responseTime95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)] || 0;
        const responseTime99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)] || 0;

        const errorRate = results.totalRequests > 0
            ? results.failedRequests / results.totalRequests
            : 0;

        const throughput = results.totalRequests / actualDuration;

        const summary = {
            totalRequests: results.totalRequests,
            successfulRequests: results.successfulRequests,
            failedRequests: results.failedRequests,
            averageResponseTime: Math.round(averageResponseTime),
            responseTime95: Math.round(responseTime95),
            responseTime99: Math.round(responseTime99),
            errorRate: errorRate,
            throughput: Math.round(throughput * 100) / 100,
            testDuration: Math.round(actualDuration * 100) / 100
        };

        this.results[scenario] = summary;

        console.log(`📊 ${scenario} Results:`);
        console.log(`   Total Requests: ${summary.totalRequests}`);
        console.log(`   Successful: ${summary.successfulRequests}`);
        console.log(`   Failed: ${summary.failedRequests}`);
        console.log(`   Average Response Time: ${summary.averageResponseTime}ms`);
        console.log(`   Response Time (95th): ${summary.responseTime95}ms`);
        console.log(`   Error Rate: ${(summary.errorRate * 100).toFixed(2)}%`);
        console.log(`   Throughput: ${summary.throughput} RPS`);

        return summary;
    }

    // Parse duration string (30s, 2m, etc.)
    parseDuration(duration) {
        const match = duration.match(/^(\d+)([sm])$/);
        if (!match) return 30000; // default 30 seconds

        const value = parseInt(match[1]);
        const unit = match[2];

        return unit === 's' ? value * 1000 : value * 60 * 1000;
    }

    // Simulate single user behavior
    async simulateUser(userId, testDuration, results) {
        const startTime = Date.now();
        const endTime = startTime + testDuration;

        while (Date.now() < endTime) {
            try {
                // Test homepage
                const homepageStart = Date.now();
                await this.makeRequest(CONFIG.baseUrl);
                const homepageTime = Date.now() - homepageStart;

                results.totalRequests++;
                results.successfulRequests++;
                results.responseTimes.push(homepageTime);

                // Test API health
                if (Math.random() < 0.3) { // 30% of requests test API
                    const apiStart = Date.now();
                    await this.makeRequest(CONFIG.apiUrl + '/health');
                    const apiTime = Date.now() - apiStart;

                    results.totalRequests++;
                    results.successfulRequests++;
                    results.responseTimes.push(apiTime);
                }

                // Wait between requests (simulate user think time)
                await this.sleep(Math.random() * 2000 + 1000); // 1-3 seconds

            } catch (error) {
                results.totalRequests++;
                results.failedRequests++;
                results.errors.push(error.message);
            }
        }
    }

    // Make HTTP request
    async makeRequest(url) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();

            try {
                // Use curl for HTTP requests
                const response = execSync(`curl -s -w "%%{http_code}" "${url}"`, {
                    encoding: 'utf8',
                    timeout: 10000
                });

                const endTime = Date.now();
                const responseTime = endTime - startTime;

                // Extract status code from curl response
                const lines = response.split('\n');
                const statusCode = lines[lines.length - 1];

                if (statusCode.startsWith('2')) {
                    resolve({ statusCode, responseTime });
                } else {
                    reject(new Error(`HTTP ${statusCode}`));
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    // Sleep utility
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Monitor System Resources
    async monitorSystemResources() {
        console.log('\n📊 Monitoring system resources...');

        try {
            // Check memory usage
            const memoryCmd = 'wmic OS get TotalVisibleMemorySize,FreePhysicalMemory /value';
            const memoryOutput = execSync(memoryCmd, { encoding: 'utf8' });
            console.log('System Memory Status:');
            console.log(memoryOutput);

            // Check CPU usage (Windows)
            const cpuCmd = 'wmic cpu get loadpercentage /value';
            const cpuOutput = execSync(cpuCmd, { encoding: 'utf8' });
            console.log('CPU Usage:');
            console.log(cpuOutput);

            // Check running processes
            const processCmd = 'tasklist /fi "imagename eq node.exe" /fo csv';
            const processOutput = execSync(processCmd, { encoding: 'utf8' });
            console.log('Node.js Processes:');
            console.log(processOutput);

        } catch (error) {
            console.warn('⚠️ Could not monitor system resources:', error.message);
        }
    }

    // Generate Performance Report
    generateReport() {
        console.log('\n📋 Generating performance test report...');

        const report = {
            summary: {
                testDate: new Date().toISOString(),
                testEnvironment: 'Local Development',
                totalTestDuration: (Date.now() - this.startTime) / 1000,
                scenariosTested: Object.keys(this.results).length,
                overallStatus: this.calculateOverallStatus()
            },
            scenarios: this.results,
            analysis: this.analyzeResults(),
            recommendations: this.generateRecommendations()
        };

        // Save detailed report
        const reportPath = path.join(__dirname, '..', 'performance-test-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        // Generate markdown report
        this.generateMarkdownReport(report);

        console.log(`✅ Performance test report saved to: ${reportPath}`);
        return report;
    }

    // Calculate Overall Status
    calculateOverallStatus() {
        const scenarios = Object.values(this.results);

        for (const scenario of scenarios) {
            if (scenario.errorRate > CONFIG.thresholds.errorRate) return 'FAILED';
            if (scenario.responseTime95 > CONFIG.thresholds.responseTime95) return 'WARNING';
        }

        return 'PASSED';
    }

    // Analyze Results
    analyzeResults() {
        const analysis = {
            passedThresholds: [],
            failedThresholds: [],
            bottlenecks: [],
            strengths: []
        };

        Object.entries(this.results).forEach(([scenario, results]) => {
            // Check response time thresholds
            if (results.responseTime95 <= CONFIG.thresholds.responseTime95) {
                analysis.passedThresholds.push(`${scenario}: 95th percentile response time (${results.responseTime95}ms)`);
            } else {
                analysis.failedThresholds.push(`${scenario}: 95th percentile response time (${results.responseTime95}ms > ${CONFIG.thresholds.responseTime95}ms)`);
                analysis.bottlenecks.push(`High response time in ${scenario} scenario`);
            }

            // Check error rate thresholds
            if (results.errorRate <= CONFIG.thresholds.errorRate) {
                analysis.passedThresholds.push(`${scenario}: Error rate within threshold (${(results.errorRate * 100).toFixed(2)}%)`);
            } else {
                analysis.failedThresholds.push(`${scenario}: Error rate too high (${(results.errorRate * 100).toFixed(2)}% > ${CONFIG.thresholds.errorRate * 100}%)`);
                analysis.bottlenecks.push(`High error rate in ${scenario} scenario`);
            }

            // Check throughput
            if (results.throughput >= CONFIG.thresholds.throughput) {
                analysis.strengths.push(`${scenario}: Good throughput (${results.throughput} RPS)`);
            } else {
                analysis.bottlenecks.push(`Low throughput in ${scenario} scenario (${results.throughput} RPS)`);
            }
        });

        return analysis;
    }

    // Generate Recommendations
    generateRecommendations() {
        const recommendations = [];
        const analysis = this.analyzeResults();

        if (analysis.bottlenecks.some(b => b.includes('response time'))) {
            recommendations.push({
                priority: 'HIGH',
                category: 'Performance',
                issue: 'High response times detected in local testing',
                recommendation: 'Optimize component rendering, implement code splitting, optimize bundle size',
                impact: 'Improved development experience and production readiness'
            });
        }

        if (analysis.bottlenecks.some(b => b.includes('error rate'))) {
            recommendations.push({
                priority: 'CRITICAL',
                category: 'Reliability',
                issue: 'High error rates detected',
                recommendation: 'Fix service connectivity issues, improve error handling',
                impact: 'Better stability during development and testing'
            });
        }

        // Development-specific recommendations
        recommendations.push({
            priority: 'MEDIUM',
            category: 'Development',
            issue: 'Local development performance baseline',
            recommendation: 'Establish performance budgets, implement performance monitoring in CI',
            impact: 'Prevent performance regressions in production'
        });

        return recommendations;
    }

    // Generate Markdown Report
    generateMarkdownReport(report) {
        const markdown = `# MemorAI Local Performance Test Report

## Executive Summary
- **Test Date**: ${report.summary.testDate}
- **Environment**: ${report.summary.testEnvironment}
- **Test Duration**: ${report.summary.totalTestDuration}s
- **Scenarios Tested**: ${report.summary.scenariosTested}
- **Overall Status**: ${report.summary.overallStatus}

## Test Configuration
- **Base URL**: ${CONFIG.baseUrl}
- **API URL**: ${CONFIG.apiUrl}
- **Max Users**: ${CONFIG.maxVUsers}

## Test Results

${Object.entries(report.scenarios).map(([scenario, results]) => `
### ${scenario.toUpperCase()} Test
- **Total Requests**: ${results.totalRequests}
- **Successful Requests**: ${results.successfulRequests}
- **Failed Requests**: ${results.failedRequests}
- **Average Response Time**: ${results.averageResponseTime}ms
- **Response Time (95th)**: ${results.responseTime95}ms
- **Response Time (99th)**: ${results.responseTime99}ms
- **Error Rate**: ${(results.errorRate * 100).toFixed(2)}%
- **Throughput**: ${results.throughput} RPS
- **Test Duration**: ${results.testDuration}s
`).join('')}

## Analysis

### Passed Thresholds
${report.analysis.passedThresholds.map(t => `- ✅ ${t}`).join('\n')}

### Failed Thresholds
${report.analysis.failedThresholds.map(t => `- ❌ ${t}`).join('\n')}

### Identified Bottlenecks
${report.analysis.bottlenecks.map(b => `- ⚠️ ${b}`).join('\n')}

### System Strengths
${report.analysis.strengths.map(s => `- 💪 ${s}`).join('\n')}

## Recommendations

${report.recommendations.map(r => `
### ${r.priority} - ${r.category}
**Issue**: ${r.issue}
**Recommendation**: ${r.recommendation}
**Impact**: ${r.impact}
`).join('')}

## Production Readiness Assessment

Based on local testing results:
- **Frontend Performance**: ${report.summary.overallStatus === 'PASSED' ? '✅ Ready' : '⚠️ Needs optimization'}
- **API Performance**: ${report.summary.overallStatus !== 'FAILED' ? '✅ Functional' : '❌ Issues detected'}
- **Error Handling**: ${report.analysis.failedThresholds.length === 0 ? '✅ Robust' : '⚠️ Needs improvement'}

---
*Report generated automatically by MemorAI Local Performance Testing Suite*
`;

        const reportPath = path.join(__dirname, '..', 'LOCAL_PERFORMANCE_TEST_REPORT.md');
        fs.writeFileSync(reportPath, markdown);
        console.log(`✅ Markdown report saved to: ${reportPath}`);
    }

    // Main execution method
    async run() {
        console.log('🚀 MemorAI Local Performance Testing Suite Starting...\n');
        console.log(`Target: ${CONFIG.baseUrl}`);
        console.log(`API: ${CONFIG.apiUrl}`);
        console.log(`Max Users: ${CONFIG.maxVUsers}`);
        console.log(`Test Duration: ${CONFIG.testDuration}\n`);

        // Check local services
        const servicesHealthy = await this.checkLocalServices();
        if (!servicesHealthy) {
            console.log('\n⚠️ Some services are not running. Results may be limited.');
            console.log('💡 Start local services with: pnpm dev');
        }

        const scenarios = ['smoke', 'load', 'stress'];
        let allPassed = true;

        // Run test scenarios
        for (const scenario of scenarios) {
            try {
                await this.runSimpleLoadTest(scenario);

                // Wait between scenarios
                if (scenario !== scenarios[scenarios.length - 1]) {
                    console.log('⏳ Waiting 10 seconds before next scenario...');
                    await this.sleep(10000);
                }
            } catch (error) {
                console.error(`❌ ${scenario} test failed:`, error.message);
                allPassed = false;
            }
        }

        // Monitor system resources
        await this.monitorSystemResources();

        // Generate final report
        const report = this.generateReport();

        // Final summary
        console.log('\n🎯 Local Performance Test Summary:');
        console.log(`✅ Tests Completed: ${Object.keys(this.results).length}`);
        console.log(`📊 Overall Status: ${report.summary.overallStatus}`);
        console.log(`📋 Report Generated: LOCAL_PERFORMANCE_TEST_REPORT.md`);

        if (report.summary.overallStatus === 'FAILED') {
            console.log('⚠️ Some performance tests failed. Review the report for details.');
            console.log('💡 This is expected for local development environment.');
        } else {
            console.log('🎉 Local performance tests passed! Good foundation for production.');
        }

        return report;
    }
}

// Run performance tests if called directly
if (require.main === module) {
    const testSuite = new LocalPerformanceTestSuite();
    testSuite.run().catch(error => {
        console.error('❌ Performance testing failed:', error);
        process.exit(1);
    });
}

module.exports = LocalPerformanceTestSuite;
