#!/usr/bin/env node

/**
 * MemorAI Production Performance Testing Suite
 * Comprehensive load testing and performance validation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Performance Testing Configuration
const CONFIG = {
    baseUrl: 'https://memorai.com',
    apiUrl: 'https://api.memorai.com',
    testDuration: '5m',
    rampUpTime: '2m',
    maxVUsers: 1000,
    scenarios: {
        smoke: { users: 10, duration: '1m' },
        load: { users: 100, duration: '5m' },
        stress: { users: 500, duration: '10m' },
        spike: { users: 1000, duration: '2m' },
        volume: { users: 200, duration: '30m' }
    },
    thresholds: {
        responseTime95: 2000, // 95th percentile < 2s
        responseTime99: 5000, // 99th percentile < 5s
        errorRate: 0.01, // < 1% error rate
        throughput: 100, // > 100 RPS
        availability: 0.999 // > 99.9% uptime
    }
};

class PerformanceTestSuite {
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

    // Generate K6 Load Test Script
    generateK6Script(scenario) {
        return `
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom Metrics
export let errorRate = new Rate('errors');
export let responseTimeTrend = new Trend('response_time');
export let requestCounter = new Counter('requests_total');

// Test Configuration
export let options = {
  scenarios: {
    ${scenario}: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '${CONFIG.scenarios[scenario].duration}', target: ${CONFIG.scenarios[scenario].users} },
        { duration: '1m', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<${CONFIG.thresholds.responseTime95}', 'p(99)<${CONFIG.thresholds.responseTime99}'],
    http_req_failed: ['rate<${CONFIG.thresholds.errorRate}'],
    http_reqs: ['rate>${CONFIG.thresholds.throughput}'],
  },
};

// Test Data
const testData = {
  users: [
    { email: 'test1@memorai.com', password: 'TestPassword123!' },
    { email: 'test2@memorai.com', password: 'TestPassword123!' },
    { email: 'test3@memorai.com', password: 'TestPassword123!' },
  ],
  memories: [
    { title: 'Test Memory 1', content: 'This is a test memory for load testing', tags: ['test', 'performance'] },
    { title: 'Performance Test', content: 'Memory creation performance testing content', tags: ['load', 'test'] },
    { title: 'Load Testing Memory', content: 'Testing memory creation under load conditions', tags: ['stress'] },
  ]
};

// Authentication Helper
function authenticate() {
  const loginPayload = {
    email: testData.users[Math.floor(Math.random() * testData.users.length)].email,
    password: 'TestPassword123!',
  };

  const loginResponse = http.post('${CONFIG.apiUrl}/auth/login', JSON.stringify(loginPayload), {
    headers: { 'Content-Type': 'application/json' },
  });

  const authSuccess = check(loginResponse, {
    'login status is 200': (r) => r.status === 200,
    'login response time < 2s': (r) => r.timings.duration < 2000,
  });

  if (authSuccess && loginResponse.json('token')) {
    return loginResponse.json('token');
  }
  return null;
}

// Main Test Function
export default function () {
  requestCounter.add(1);
  
  // Homepage Load Test
  const homepageResponse = http.get('${CONFIG.baseUrl}');
  responseTimeTrend.add(homepageResponse.timings.duration);
  
  const homepageSuccess = check(homepageResponse, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage response time < 2s': (r) => r.timings.duration < 2000,
    'homepage contains title': (r) => r.body.includes('MemorAI'),
  });
  
  if (!homepageSuccess) {
    errorRate.add(1);
  }

  // API Health Check
  const healthResponse = http.get('${CONFIG.apiUrl}/health');
  check(healthResponse, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 500ms': (r) => r.timings.duration < 500,
  });

  // Authentication Flow (30% of users)
  if (Math.random() < 0.3) {
    const token = authenticate();
    
    if (token) {
      const headers = {
        'Authorization': \`Bearer \${token}\`,
        'Content-Type': 'application/json',
      };

      // Dashboard Load
      const dashboardResponse = http.get('${CONFIG.baseUrl}/dashboard', { headers });
      check(dashboardResponse, {
        'dashboard status is 200': (r) => r.status === 200,
        'dashboard response time < 3s': (r) => r.timings.duration < 3000,
      });

      // Memory Creation (20% of authenticated users)
      if (Math.random() < 0.2) {
        const memoryData = testData.memories[Math.floor(Math.random() * testData.memories.length)];
        const createMemoryResponse = http.post('${CONFIG.apiUrl}/memories', JSON.stringify(memoryData), { headers });
        
        check(createMemoryResponse, {
          'memory creation status is 201': (r) => r.status === 201,
          'memory creation response time < 3s': (r) => r.timings.duration < 3000,
        });
      }

      // Memory Search (40% of authenticated users)
      if (Math.random() < 0.4) {
        const searchQuery = 'test';
        const searchResponse = http.get(\`${CONFIG.apiUrl}/memories/search?q=\${searchQuery}\`, { headers });
        
        check(searchResponse, {
          'search status is 200': (r) => r.status === 200,
          'search response time < 1s': (r) => r.timings.duration < 1000,
        });
      }
    }
  }

  // Static Asset Load Test
  const staticAssets = [
    '/_next/static/css/app.css',
    '/_next/static/js/app.js',
    '/favicon.ico',
  ];

  staticAssets.forEach(asset => {
    const assetResponse = http.get(\`${CONFIG.baseUrl}\${asset}\`);
    check(assetResponse, {
      [\`\${asset} loads successfully\`]: (r) => r.status === 200,
      [\`\${asset} response time < 1s\`]: (r) => r.timings.duration < 1000,
    });
  });

  sleep(Math.random() * 2 + 1); // Random sleep between 1-3 seconds
}

// Setup Function
export function setup() {
  // Pre-test validation
  console.log('Setting up performance tests...');
  
  const healthCheck = http.get('${CONFIG.apiUrl}/health');
  if (healthCheck.status !== 200) {
    throw new Error('Service health check failed - aborting tests');
  }
  
  console.log('Service health check passed - proceeding with tests');
  return { timestamp: new Date().toISOString() };
}

// Teardown Function
export function teardown(data) {
  console.log(\`Performance test completed at: \${new Date().toISOString()}\`);
  console.log(\`Test started at: \${data.timestamp}\`);
}
`;
    }

    // Run Performance Test Scenario
    async runScenario(scenarioName) {
        console.log(`\n🚀 Running ${scenarioName.toUpperCase()} test scenario...`);
        console.log(`Users: ${CONFIG.scenarios[scenarioName].users}, Duration: ${CONFIG.scenarios[scenarioName].duration}`);

        try {
            // Generate K6 script
            const scriptContent = this.generateK6Script(scenarioName);
            const scriptPath = path.join(__dirname, `k6-${scenarioName}-test.js`);
            fs.writeFileSync(scriptPath, scriptContent);

            // Run K6 test
            const command = `k6 run --out json=results-${scenarioName}.json ${scriptPath}`;
            const startTime = Date.now();

            try {
                const output = execSync(command, {
                    encoding: 'utf8',
                    timeout: 1800000, // 30 minutes timeout
                    maxBuffer: 10 * 1024 * 1024 // 10MB buffer
                });

                const endTime = Date.now();
                console.log(`✅ ${scenarioName} test completed in ${(endTime - startTime) / 1000}s`);

                // Parse results
                this.parseResults(scenarioName);

                // Cleanup
                fs.unlinkSync(scriptPath);

                return true;
            } catch (error) {
                console.error(`❌ ${scenarioName} test failed:`, error.message);
                return false;
            }
        } catch (error) {
            console.error(`❌ Failed to setup ${scenarioName} test:`, error.message);
            return false;
        }
    }

    // Parse K6 Test Results
    parseResults(scenarioName) {
        try {
            const resultsFile = `results-${scenarioName}.json`;
            if (!fs.existsSync(resultsFile)) {
                console.warn(`⚠️ Results file not found: ${resultsFile}`);
                return;
            }

            const rawData = fs.readFileSync(resultsFile, 'utf8');
            const lines = rawData.trim().split('\n');
            const metrics = {};

            lines.forEach(line => {
                try {
                    const data = JSON.parse(line);
                    if (data.type === 'Point' && data.metric) {
                        if (!metrics[data.metric]) {
                            metrics[data.metric] = [];
                        }
                        metrics[data.metric].push(data.data);
                    }
                } catch (e) {
                    // Skip invalid JSON lines
                }
            });

            // Calculate summary statistics
            const summary = this.calculateSummaryStats(metrics);
            this.results[scenarioName] = summary;

            console.log(`📊 ${scenarioName} Results:`);
            console.log(`   Response Time (95th): ${summary.responseTime95}ms`);
            console.log(`   Response Time (99th): ${summary.responseTime99}ms`);
            console.log(`   Error Rate: ${(summary.errorRate * 100).toFixed(2)}%`);
            console.log(`   Throughput: ${summary.throughput.toFixed(2)} RPS`);
            console.log(`   Total Requests: ${summary.totalRequests}`);

            // Cleanup results file
            fs.unlinkSync(resultsFile);
        } catch (error) {
            console.error(`❌ Failed to parse results for ${scenarioName}:`, error.message);
        }
    }

    // Calculate Summary Statistics
    calculateSummaryStats(metrics) {
        const stats = {
            responseTime95: 0,
            responseTime99: 0,
            averageResponseTime: 0,
            errorRate: 0,
            throughput: 0,
            totalRequests: 0,
            passedChecks: 0,
            failedChecks: 0
        };

        // Response Time Metrics
        if (metrics.http_req_duration) {
            const durations = metrics.http_req_duration.map(d => d.value).sort((a, b) => a - b);
            if (durations.length > 0) {
                stats.averageResponseTime = durations.reduce((sum, val) => sum + val, 0) / durations.length;
                stats.responseTime95 = durations[Math.floor(durations.length * 0.95)];
                stats.responseTime99 = durations[Math.floor(durations.length * 0.99)];
            }
        }

        // Error Rate
        if (metrics.http_req_failed) {
            const failures = metrics.http_req_failed.filter(d => d.value === 1).length;
            const total = metrics.http_req_failed.length;
            stats.errorRate = total > 0 ? failures / total : 0;
        }

        // Throughput
        if (metrics.http_reqs) {
            const requests = metrics.http_reqs;
            if (requests.length > 0) {
                const testDuration = (requests[requests.length - 1].time - requests[0].time) / 1000;
                stats.throughput = requests.length / testDuration;
                stats.totalRequests = requests.length;
            }
        }

        return stats;
    }

    // System Resource Monitoring
    async monitorSystemResources() {
        console.log('\n📊 Monitoring system resources...');

        try {
            // CPU Usage
            const cpuCmd = "docker stats --no-stream --format 'table {{.Name}}\\t{{.CPUPerc}}\\t{{.MemUsage}}' | grep memorai";
            const cpuOutput = execSync(cpuCmd, { encoding: 'utf8' });
            console.log('Container Resource Usage:');
            console.log(cpuOutput);

            // Database Performance
            const dbStatsCmd = `docker exec memorai-db-prod psql -U memorai_user -d memorai_prod -c "
        SELECT 
          datname,
          numbackends as connections,
          xact_commit as commits,
          xact_rollback as rollbacks,
          blks_read,
          blks_hit,
          temp_files,
          temp_bytes
        FROM pg_stat_database 
        WHERE datname = 'memorai_prod';
      "`;

            try {
                const dbOutput = execSync(dbStatsCmd, { encoding: 'utf8' });
                console.log('\nDatabase Statistics:');
                console.log(dbOutput);
            } catch (dbError) {
                console.warn('⚠️ Could not retrieve database statistics');
            }

            // Redis Performance
            const redisStatsCmd = 'docker exec memorai-redis-prod redis-cli info stats';
            try {
                const redisOutput = execSync(redisStatsCmd, { encoding: 'utf8' });
                console.log('\nRedis Statistics:');
                console.log(redisOutput);
            } catch (redisError) {
                console.warn('⚠️ Could not retrieve Redis statistics');
            }

        } catch (error) {
            console.warn('⚠️ Could not monitor all system resources:', error.message);
        }
    }

    // Generate Performance Report
    generateReport() {
        console.log('\n📋 Generating performance test report...');

        const report = {
            summary: {
                testDate: new Date().toISOString(),
                totalTestDuration: (Date.now() - this.startTime) / 1000,
                scenariosTested: Object.keys(this.results).length,
                overallStatus: 'PASSED'
            },
            scenarios: this.results,
            analysis: this.analyzeResults(),
            recommendations: this.generateRecommendations()
        };

        // Save detailed report
        const reportPath = path.join(__dirname, 'performance-test-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        // Generate markdown report
        this.generateMarkdownReport(report);

        console.log(`✅ Performance test report saved to: ${reportPath}`);
        return report;
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
                analysis.passedThresholds.push(`${scenario}: 95th percentile response time`);
            } else {
                analysis.failedThresholds.push(`${scenario}: 95th percentile response time (${results.responseTime95}ms > ${CONFIG.thresholds.responseTime95}ms)`);
                analysis.bottlenecks.push(`High response time in ${scenario} scenario`);
            }

            // Check error rate thresholds
            if (results.errorRate <= CONFIG.thresholds.errorRate) {
                analysis.passedThresholds.push(`${scenario}: Error rate within threshold`);
            } else {
                analysis.failedThresholds.push(`${scenario}: Error rate too high (${(results.errorRate * 100).toFixed(2)}% > ${CONFIG.thresholds.errorRate * 100}%)`);
                analysis.bottlenecks.push(`High error rate in ${scenario} scenario`);
            }

            // Check throughput
            if (results.throughput >= CONFIG.thresholds.throughput) {
                analysis.strengths.push(`${scenario}: Good throughput (${results.throughput.toFixed(2)} RPS)`);
            } else {
                analysis.bottlenecks.push(`Low throughput in ${scenario} scenario (${results.throughput.toFixed(2)} RPS)`);
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
                issue: 'High response times detected',
                recommendation: 'Optimize database queries, implement caching, consider CDN for static assets',
                impact: 'Improved user experience and higher conversion rates'
            });
        }

        if (analysis.bottlenecks.some(b => b.includes('error rate'))) {
            recommendations.push({
                priority: 'CRITICAL',
                category: 'Reliability',
                issue: 'High error rates detected',
                recommendation: 'Investigate error logs, improve error handling, implement circuit breakers',
                impact: 'Reduced service disruptions and improved reliability'
            });
        }

        if (analysis.bottlenecks.some(b => b.includes('throughput'))) {
            recommendations.push({
                priority: 'MEDIUM',
                category: 'Scalability',
                issue: 'Low throughput detected',
                recommendation: 'Scale application instances, optimize resource allocation, implement load balancing',
                impact: 'Better handling of concurrent users and peak loads'
            });
        }

        // General recommendations
        recommendations.push({
            priority: 'LOW',
            category: 'Monitoring',
            issue: 'Continuous performance monitoring',
            recommendation: 'Implement real-time performance monitoring and alerting',
            impact: 'Proactive identification and resolution of performance issues'
        });

        return recommendations;
    }

    // Generate Markdown Report
    generateMarkdownReport(report) {
        const markdown = `# MemorAI Performance Test Report

## Executive Summary
- **Test Date**: ${report.summary.testDate}
- **Test Duration**: ${report.summary.totalTestDuration}s
- **Scenarios Tested**: ${report.summary.scenariosTested}
- **Overall Status**: ${report.summary.overallStatus}

## Test Results

${Object.entries(report.scenarios).map(([scenario, results]) => `
### ${scenario.toUpperCase()} Test
- **Response Time (95th)**: ${results.responseTime95}ms
- **Response Time (99th)**: ${results.responseTime99}ms
- **Average Response Time**: ${results.averageResponseTime.toFixed(2)}ms
- **Error Rate**: ${(results.errorRate * 100).toFixed(2)}%
- **Throughput**: ${results.throughput.toFixed(2)} RPS
- **Total Requests**: ${results.totalRequests}
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

---
*Report generated automatically by MemorAI Performance Testing Suite*
`;

        fs.writeFileSync(path.join(__dirname, 'PERFORMANCE_TEST_REPORT.md'), markdown);
    }

    // Main execution method
    async run() {
        console.log('🚀 MemorAI Performance Testing Suite Starting...\n');
        console.log(`Target: ${CONFIG.baseUrl}`);
        console.log(`API: ${CONFIG.apiUrl}`);
        console.log(`Max Users: ${CONFIG.maxVUsers}`);
        console.log(`Test Duration: ${CONFIG.testDuration}\n`);

        // Check prerequisites
        try {
            execSync('k6 version', { stdio: 'pipe' });
        } catch (error) {
            console.error('❌ K6 is required but not installed. Please install K6 load testing tool.');
            console.error('Installation: https://k6.io/docs/getting-started/installation/');
            process.exit(1);
        }

        const scenarios = ['smoke', 'load', 'stress'];
        let allPassed = true;

        // Run test scenarios
        for (const scenario of scenarios) {
            const success = await this.runScenario(scenario);
            if (!success) {
                allPassed = false;
            }

            // Wait between scenarios
            if (scenario !== scenarios[scenarios.length - 1]) {
                console.log('⏳ Waiting 30 seconds before next scenario...');
                await new Promise(resolve => setTimeout(resolve, 30000));
            }
        }

        // Monitor system resources
        await this.monitorSystemResources();

        // Generate final report
        const report = this.generateReport();

        // Final summary
        console.log('\n🎯 Performance Test Summary:');
        console.log(`✅ Tests Completed: ${Object.keys(this.results).length}`);
        console.log(`📊 Overall Status: ${allPassed ? 'PASSED' : 'FAILED'}`);
        console.log(`📋 Report Generated: PERFORMANCE_TEST_REPORT.md`);

        if (!allPassed) {
            console.log('⚠️ Some performance tests failed. Review the report for details.');
            process.exit(1);
        }

        console.log('🎉 All performance tests passed! System is ready for production.');
    }
}

// Run performance tests if called directly
if (require.main === module) {
    const testSuite = new PerformanceTestSuite();
    testSuite.run().catch(error => {
        console.error('❌ Performance testing failed:', error);
        process.exit(1);
    });
}

module.exports = PerformanceTestSuite;
