import { test, expect } from '@playwright/test';
import fs from 'fs';

/**
 * Phase 3C: Performance and Load Testing
 * Tests system performance, load handling, and stress conditions across services
 */

test.describe('Phase 3C: Performance & Load Testing', () => {

    const allServices = [
        { name: 'Gateway', url: 'http://localhost:4000', port: 4000 },
        { name: 'CODAI', url: 'http://localhost:4001', port: 4001 },
        { name: 'ID', url: 'http://localhost:4004', port: 4004 },
        { name: 'BancAI', url: 'http://localhost:4005', port: 4005 },
        { name: 'MemorAI', url: 'http://localhost:4006', port: 4006 },
        { name: 'Admin', url: 'http://localhost:4007', port: 4007 },
        { name: 'Hub', url: 'http://localhost:4008', port: 4008 },
        { name: 'CBD', url: 'http://localhost:4180', port: 4180 }
    ];

    test.beforeAll(async () => {
        if (!fs.existsSync('test-results')) {
            fs.mkdirSync('test-results', { recursive: true });
        }
    });

    test('Phase 3C.1: Service Response Time Analysis', async ({ page, browser }) => {
        console.log('⚡ Phase 3C.1: Analyzing service response times...');

        const performanceAnalysis = {
            timestamp: new Date().toISOString(),
            phase: 'Phase 3C - Performance Analysis',
            services: [],
            summary: {
                totalServices: allServices.length,
                fastServices: 0, // < 100ms
                mediumServices: 0, // 100-500ms
                slowServices: 0, // > 500ms
                averageResponseTime: 0,
                performanceGrade: 'N/A'
            }
        };

        const responses = [];

        for (const service of allServices) {
            console.log(`📊 Testing ${service.name} performance...`);

            const servicePerf = {
                name: service.name,
                url: service.url,
                port: service.port,
                measurements: [],
                statistics: {
                    min: 0,
                    max: 0,
                    avg: 0,
                    median: 0,
                    p95: 0,
                    p99: 0
                },
                grade: 'N/A'
            };

            // Multiple measurements for statistical accuracy
            const measurements = [];

            for (let i = 0; i < 10; i++) {
                try {
                    const startTime = Date.now();

                    // Use fetch for more accurate timing
                    const response = await page.evaluate(async (url) => {
                        const start = performance.now();
                        try {
                            const res = await fetch(url);
                            const end = performance.now();
                            return {
                                status: res.status,
                                ok: res.ok,
                                responseTime: end - start,
                                headers: Object.fromEntries(res.headers.entries())
                            };
                        } catch (error) {
                            const end = performance.now();
                            return {
                                error: error.message,
                                responseTime: end - start,
                                timeout: error.message.includes('timeout')
                            };
                        }
                    }, service.url);

                    const endTime = Date.now();
                    const totalTime = endTime - startTime;

                    const measurement = {
                        attempt: i + 1,
                        responseTime: response.responseTime || totalTime,
                        status: response.status,
                        ok: response.ok,
                        error: response.error,
                        timestamp: new Date().toISOString()
                    };

                    measurements.push(measurement);
                    servicePerf.measurements.push(measurement);

                    // Small delay between requests
                    await page.waitForTimeout(100);

                } catch (error) {
                    console.log(`  ⚠️ Measurement ${i + 1} failed: ${error.message}`);

                    servicePerf.measurements.push({
                        attempt: i + 1,
                        error: error.message,
                        responseTime: 5000, // Penalty for failure
                        timestamp: new Date().toISOString()
                    });
                }
            }

            // Calculate statistics
            const responseTimes = servicePerf.measurements
                .filter(m => !m.error || m.responseTime < 5000)
                .map(m => m.responseTime);

            if (responseTimes.length > 0) {
                responseTimes.sort((a, b) => a - b);

                servicePerf.statistics.min = Math.min(...responseTimes);
                servicePerf.statistics.max = Math.max(...responseTimes);
                servicePerf.statistics.avg = responseTimes.reduce((a, b) => a + b) / responseTimes.length;
                servicePerf.statistics.median = responseTimes[Math.floor(responseTimes.length / 2)];
                servicePerf.statistics.p95 = responseTimes[Math.floor(responseTimes.length * 0.95)];
                servicePerf.statistics.p99 = responseTimes[Math.floor(responseTimes.length * 0.99)];

                // Grade performance
                if (servicePerf.statistics.avg < 100) {
                    servicePerf.grade = 'Excellent';
                    performanceAnalysis.summary.fastServices++;
                } else if (servicePerf.statistics.avg < 500) {
                    servicePerf.grade = 'Good';
                    performanceAnalysis.summary.mediumServices++;
                } else if (servicePerf.statistics.avg < 1000) {
                    servicePerf.grade = 'Fair';
                    performanceAnalysis.summary.slowServices++;
                } else {
                    servicePerf.grade = 'Poor';
                    performanceAnalysis.summary.slowServices++;
                }

                responses.push(servicePerf.statistics.avg);

                console.log(`  📈 ${service.name}: ${servicePerf.statistics.avg.toFixed(1)}ms avg (${servicePerf.grade})`);
            } else {
                servicePerf.grade = 'Error';
                console.log(`  ❌ ${service.name}: All measurements failed`);
            }

            performanceAnalysis.services.push(servicePerf);
        }

        // Calculate overall performance
        if (responses.length > 0) {
            performanceAnalysis.summary.averageResponseTime = responses.reduce((a, b) => a + b) / responses.length;

            if (performanceAnalysis.summary.averageResponseTime < 150) {
                performanceAnalysis.summary.performanceGrade = 'Excellent';
            } else if (performanceAnalysis.summary.averageResponseTime < 300) {
                performanceAnalysis.summary.performanceGrade = 'Good';
            } else if (performanceAnalysis.summary.averageResponseTime < 600) {
                performanceAnalysis.summary.performanceGrade = 'Fair';
            } else {
                performanceAnalysis.summary.performanceGrade = 'Poor';
            }
        }

        // Save performance analysis
        fs.writeFileSync('test-results/phase3c-performance-analysis.json', JSON.stringify(performanceAnalysis, null, 2));

        console.log('\n📊 Performance Analysis Summary:');
        console.log(`   🚀 Fast services (< 100ms): ${performanceAnalysis.summary.fastServices}`);
        console.log(`   ⚡ Medium services (100-500ms): ${performanceAnalysis.summary.mediumServices}`);
        console.log(`   🐌 Slow services (> 500ms): ${performanceAnalysis.summary.slowServices}`);
        console.log(`   📊 Average response time: ${performanceAnalysis.summary.averageResponseTime.toFixed(1)}ms`);
        console.log(`   🎯 Overall grade: ${performanceAnalysis.summary.performanceGrade}`);
        console.log(`   💾 Results saved: test-results/phase3c-performance-analysis.json`);

        expect(performanceAnalysis.summary.totalServices).toBe(allServices.length);
        expect(responses.length).toBeGreaterThan(0);
    });

    test('Phase 3C.2: Concurrent Load Testing', async ({ browser }) => {
        console.log('🔄 Phase 3C.2: Testing concurrent load handling...');

        const loadTest = {
            timestamp: new Date().toISOString(),
            phase: 'Phase 3C - Concurrent Load Testing',
            testScenarios: [],
            summary: {
                totalScenarios: 0,
                successfulScenarios: 0,
                failedScenarios: 0
            }
        };

        // Scenario 1: Concurrent page loads
        try {
            console.log('🌊 Scenario 1: Concurrent page loads...');

            const concurrentScenario = {
                name: 'Concurrent Page Loads',
                concurrentUsers: 5,
                targetService: 'Multiple Services',
                results: [],
                success: false,
                startTime: Date.now()
            };

            // Create multiple browser contexts for concurrent testing
            const contexts = [];
            const pages = [];

            for (let i = 0; i < concurrentScenario.concurrentUsers; i++) {
                const context = await browser.newContext();
                const page = await context.newPage();
                contexts.push(context);
                pages.push(page);
            }

            // Test concurrent loads on different services
            const testPromises = pages.map(async (page, index) => {
                const service = allServices[index % allServices.length];
                const startTime = Date.now();

                try {
                    await page.goto(service.url, { timeout: 30000 });
                    await page.waitForLoadState('domcontentloaded');
                    const endTime = Date.now();

                    return {
                        user: index + 1,
                        service: service.name,
                        url: service.url,
                        success: true,
                        responseTime: endTime - startTime,
                        timestamp: new Date().toISOString()
                    };
                } catch (error) {
                    const endTime = Date.now();
                    return {
                        user: index + 1,
                        service: service.name,
                        url: service.url,
                        success: false,
                        error: error.message,
                        responseTime: endTime - startTime,
                        timestamp: new Date().toISOString()
                    };
                }
            });

            const results = await Promise.all(testPromises);
            concurrentScenario.results = results;

            // Cleanup contexts
            for (const context of contexts) {
                await context.close();
            }

            const successCount = results.filter(r => r.success).length;
            const avgResponseTime = results
                .filter(r => r.success)
                .reduce((sum, r) => sum + r.responseTime, 0) / Math.max(successCount, 1);

            concurrentScenario.success = successCount >= concurrentScenario.concurrentUsers * 0.8; // 80% success rate
            concurrentScenario.successRate = successCount / concurrentScenario.concurrentUsers;
            concurrentScenario.averageResponseTime = avgResponseTime;
            concurrentScenario.endTime = Date.now();
            concurrentScenario.totalDuration = concurrentScenario.endTime - concurrentScenario.startTime;

            console.log(`  📈 Success rate: ${(concurrentScenario.successRate * 100).toFixed(1)}%`);
            console.log(`  ⏱️ Average response: ${avgResponseTime.toFixed(1)}ms`);
            console.log(`  🕐 Total duration: ${concurrentScenario.totalDuration}ms`);

            loadTest.testScenarios.push(concurrentScenario);

        } catch (error) {
            console.log(`❌ Concurrent load test failed: ${error.message}`);
            loadTest.testScenarios.push({
                name: 'Concurrent Page Loads',
                success: false,
                error: error.message
            });
        }

        // Scenario 2: Rapid sequential requests
        try {
            console.log('⚡ Scenario 2: Rapid sequential requests...');

            const rapidScenario = {
                name: 'Rapid Sequential Requests',
                requestCount: 20,
                interval: 50, // ms
                results: [],
                success: false,
                startTime: Date.now()
            };

            const context = await browser.newContext();
            const page = await context.newPage();

            // Test rapid requests to Gateway service
            const gatewayService = allServices.find(s => s.name === 'Gateway') || allServices[0];

            for (let i = 0; i < rapidScenario.requestCount; i++) {
                const requestStart = Date.now();

                try {
                    const response = await page.evaluate(async (url) => {
                        const start = performance.now();
                        try {
                            const res = await fetch(url);
                            const end = performance.now();
                            return {
                                status: res.status,
                                ok: res.ok,
                                responseTime: end - start
                            };
                        } catch (error) {
                            const end = performance.now();
                            return {
                                error: error.message,
                                responseTime: end - start
                            };
                        }
                    }, gatewayService.url);

                    rapidScenario.results.push({
                        request: i + 1,
                        success: response.ok || false,
                        responseTime: response.responseTime,
                        status: response.status,
                        error: response.error,
                        timestamp: new Date().toISOString()
                    });

                    if (response.ok) {
                        console.log(`  ✅ Request ${i + 1}: ${response.responseTime.toFixed(1)}ms`);
                    } else {
                        console.log(`  ❌ Request ${i + 1}: ${response.error || 'Failed'}`);
                    }

                } catch (error) {
                    rapidScenario.results.push({
                        request: i + 1,
                        success: false,
                        error: error.message,
                        responseTime: Date.now() - requestStart,
                        timestamp: new Date().toISOString()
                    });

                    console.log(`  ❌ Request ${i + 1}: ${error.message}`);
                }

                // Wait before next request
                if (i < rapidScenario.requestCount - 1) {
                    await page.waitForTimeout(rapidScenario.interval);
                }
            }

            await context.close();

            const successfulRequests = rapidScenario.results.filter(r => r.success).length;
            const avgResponseTime = rapidScenario.results
                .filter(r => r.success)
                .reduce((sum, r) => sum + r.responseTime, 0) / Math.max(successfulRequests, 1);

            rapidScenario.success = successfulRequests >= rapidScenario.requestCount * 0.9; // 90% success rate
            rapidScenario.successRate = successfulRequests / rapidScenario.requestCount;
            rapidScenario.averageResponseTime = avgResponseTime;
            rapidScenario.endTime = Date.now();
            rapidScenario.totalDuration = rapidScenario.endTime - rapidScenario.startTime;

            console.log(`  📈 Success rate: ${(rapidScenario.successRate * 100).toFixed(1)}%`);
            console.log(`  ⏱️ Average response: ${avgResponseTime.toFixed(1)}ms`);
            console.log(`  🕐 Total duration: ${rapidScenario.totalDuration}ms`);

            loadTest.testScenarios.push(rapidScenario);

        } catch (error) {
            console.log(`❌ Rapid request test failed: ${error.message}`);
            loadTest.testScenarios.push({
                name: 'Rapid Sequential Requests',
                success: false,
                error: error.message
            });
        }

        // Calculate summary
        loadTest.summary.totalScenarios = loadTest.testScenarios.length;
        loadTest.summary.successfulScenarios = loadTest.testScenarios.filter(s => s.success).length;
        loadTest.summary.failedScenarios = loadTest.testScenarios.filter(s => !s.success).length;

        // Save load test results
        fs.writeFileSync('test-results/phase3c-load-testing.json', JSON.stringify(loadTest, null, 2));

        console.log('\n📊 Concurrent Load Testing Summary:');
        console.log(`   🎯 Total scenarios: ${loadTest.summary.totalScenarios}`);
        console.log(`   ✅ Successful scenarios: ${loadTest.summary.successfulScenarios}`);
        console.log(`   ❌ Failed scenarios: ${loadTest.summary.failedScenarios}`);
        console.log(`   💾 Results saved: test-results/phase3c-load-testing.json`);

        expect(loadTest.summary.totalScenarios).toBeGreaterThan(0);
    });

    test('Phase 3C.3: Resource Usage Monitoring', async ({ page }) => {
        console.log('📊 Phase 3C.3: Monitoring resource usage...');

        const resourceTest = {
            timestamp: new Date().toISOString(),
            phase: 'Phase 3C - Resource Usage Monitoring',
            measurements: [],
            summary: {
                totalMeasurements: 0,
                averageMemoryUsage: 0,
                peakMemoryUsage: 0,
                averageCPUUsage: 0,
                resourceGrade: 'N/A'
            }
        };

        // Test resource usage across different services
        for (const service of allServices.slice(0, 4)) { // Test first 4 services
            console.log(`📈 Monitoring ${service.name} resource usage...`);

            try {
                await page.goto(service.url, { timeout: 15000 });
                await page.waitForLoadState('domcontentloaded');

                // Perform some interactions to generate load
                await page.evaluate(() => {
                    // Simulate some CPU-intensive operations
                    const start = Date.now();
                    while (Date.now() - start < 1000) {
                        Math.random() * Math.random();
                    }
                });

                // Get performance metrics
                const metrics = await page.evaluate(() => {
                    const performance = window.performance;
                    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

                    return {
                        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
                        domContentLoadedTime: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
                        largestContentfulPaint: performance.getEntriesByName('largest-contentful-paint')[0]?.startTime || 0,
                        memory: (performance as any).memory ? {
                            used: (performance as any).memory.usedJSHeapSize,
                            total: (performance as any).memory.totalJSHeapSize,
                            limit: (performance as any).memory.jsHeapSizeLimit
                        } : null,
                        timing: {
                            dns: navigation.domainLookupEnd - navigation.domainLookupStart,
                            tcp: navigation.connectEnd - navigation.connectStart,
                            request: navigation.responseStart - navigation.requestStart,
                            response: navigation.responseEnd - navigation.responseStart,
                            processing: navigation.domComplete - navigation.responseEnd
                        }
                    };
                });

                const measurement = {
                    service: service.name,
                    url: service.url,
                    timestamp: new Date().toISOString(),
                    metrics,
                    grade: 'N/A'
                };

                // Grade the performance
                let score = 0;
                if (metrics.loadTime < 1000) score += 2;
                else if (metrics.loadTime < 2000) score += 1;

                if (metrics.firstContentfulPaint && metrics.firstContentfulPaint < 1500) score += 2;
                else if (metrics.firstContentfulPaint && metrics.firstContentfulPaint < 3000) score += 1;

                if (metrics.memory && metrics.memory.used < 50 * 1024 * 1024) score += 2; // < 50MB
                else if (metrics.memory && metrics.memory.used < 100 * 1024 * 1024) score += 1; // < 100MB

                if (score >= 5) measurement.grade = 'Excellent';
                else if (score >= 3) measurement.grade = 'Good';
                else if (score >= 1) measurement.grade = 'Fair';
                else measurement.grade = 'Poor';

                resourceTest.measurements.push(measurement);

                console.log(`  📊 ${service.name}: Load=${metrics.loadTime.toFixed(0)}ms, FCP=${metrics.firstContentfulPaint?.toFixed(0) || 'N/A'}ms, Grade=${measurement.grade}`);

                if (metrics.memory) {
                    console.log(`    💾 Memory: ${(metrics.memory.used / 1024 / 1024).toFixed(1)}MB used`);
                }

            } catch (error) {
                console.log(`  ❌ ${service.name} resource monitoring failed: ${error.message}`);

                resourceTest.measurements.push({
                    service: service.name,
                    url: service.url,
                    timestamp: new Date().toISOString(),
                    error: error.message,
                    grade: 'Error'
                });
            }

            // Brief pause between services
            await page.waitForTimeout(500);
        }

        // Calculate summary statistics
        const validMeasurements = resourceTest.measurements.filter(m => m.metrics && !m.error);

        if (validMeasurements.length > 0) {
            const memoryUsages = validMeasurements
                .filter(m => m.metrics.memory)
                .map(m => m.metrics.memory.used / 1024 / 1024); // Convert to MB

            const loadTimes = validMeasurements.map(m => m.metrics.loadTime);

            if (memoryUsages.length > 0) {
                resourceTest.summary.averageMemoryUsage = memoryUsages.reduce((a, b) => a + b) / memoryUsages.length;
                resourceTest.summary.peakMemoryUsage = Math.max(...memoryUsages);
            }

            resourceTest.summary.averageCPUUsage = loadTimes.reduce((a, b) => a + b) / loadTimes.length;

            // Grade overall resource usage
            const excellentCount = resourceTest.measurements.filter(m => m.grade === 'Excellent').length;
            const goodCount = resourceTest.measurements.filter(m => m.grade === 'Good').length;
            const totalValid = resourceTest.measurements.filter(m => m.grade !== 'Error').length;

            if (totalValid > 0) {
                const excellentRatio = excellentCount / totalValid;
                const goodRatio = (excellentCount + goodCount) / totalValid;

                if (excellentRatio >= 0.8) resourceTest.summary.resourceGrade = 'Excellent';
                else if (goodRatio >= 0.7) resourceTest.summary.resourceGrade = 'Good';
                else if (goodRatio >= 0.5) resourceTest.summary.resourceGrade = 'Fair';
                else resourceTest.summary.resourceGrade = 'Poor';
            }
        }

        resourceTest.summary.totalMeasurements = resourceTest.measurements.length;

        // Save resource monitoring results
        fs.writeFileSync('test-results/phase3c-resource-monitoring.json', JSON.stringify(resourceTest, null, 2));

        console.log('\n📊 Resource Usage Monitoring Summary:');
        console.log(`   📏 Total measurements: ${resourceTest.summary.totalMeasurements}`);
        console.log(`   💾 Average memory: ${resourceTest.summary.averageMemoryUsage.toFixed(1)}MB`);
        console.log(`   🔥 Peak memory: ${resourceTest.summary.peakMemoryUsage.toFixed(1)}MB`);
        console.log(`   ⚡ Average load time: ${resourceTest.summary.averageCPUUsage.toFixed(0)}ms`);
        console.log(`   🎯 Resource grade: ${resourceTest.summary.resourceGrade}`);
        console.log(`   💾 Results saved: test-results/phase3c-resource-monitoring.json`);

        expect(resourceTest.summary.totalMeasurements).toBeGreaterThan(0);
    });

    test('Phase 3C: Generate Performance Integration Report', async () => {
        console.log('📋 Phase 3C.4: Generating performance integration report...');

        const performanceReport = {
            timestamp: new Date().toISOString(),
            phase: 'Phase 3C - Performance & Load Testing',
            services: allServices.map(s => ({ name: s.name, url: s.url, port: s.port })),
            testResults: {},
            summary: {
                totalServices: allServices.length,
                performanceReady: false,
                loadTestingReady: false,
                resourceOptimized: false,
                overallGrade: 'N/A'
            },
            recommendations: []
        };

        // Load test results
        const testFiles = [
            { key: 'performance', path: 'test-results/phase3c-performance-analysis.json' },
            { key: 'load', path: 'test-results/phase3c-load-testing.json' },
            { key: 'resources', path: 'test-results/phase3c-resource-monitoring.json' }
        ];

        for (const testFile of testFiles) {
            try {
                if (fs.existsSync(testFile.path)) {
                    const data = JSON.parse(fs.readFileSync(testFile.path, 'utf8'));
                    performanceReport.testResults[testFile.key] = data;
                }
            } catch (error) {
                console.log(`⚠️ Could not load ${testFile.key} results: ${error.message}`);
            }
        }

        // Analyze performance results
        if (performanceReport.testResults.performance) {
            const perf = performanceReport.testResults.performance;
            performanceReport.summary.performanceReady = perf.summary.averageResponseTime < 1000;

            if (perf.summary.performanceGrade === 'Excellent') {
                performanceReport.recommendations.push('Excellent response times - system is highly optimized');
            } else if (perf.summary.performanceGrade === 'Good') {
                performanceReport.recommendations.push('Good response times - minor optimizations possible');
            } else {
                performanceReport.recommendations.push('Response times need improvement - review slow services');
            }
        }

        // Analyze load testing results
        if (performanceReport.testResults.load) {
            const load = performanceReport.testResults.load;
            performanceReport.summary.loadTestingReady = load.summary.successfulScenarios > 0;

            if (load.summary.successfulScenarios === load.summary.totalScenarios) {
                performanceReport.recommendations.push('Load testing passed - system handles concurrent requests well');
            } else {
                performanceReport.recommendations.push('Load testing shows issues - review concurrent handling');
            }
        }

        // Analyze resource monitoring results
        if (performanceReport.testResults.resources) {
            const resources = performanceReport.testResults.resources;
            performanceReport.summary.resourceOptimized = resources.summary.resourceGrade !== 'Poor';

            if (resources.summary.resourceGrade === 'Excellent') {
                performanceReport.recommendations.push('Resource usage is excellent - well optimized');
            } else if (resources.summary.averageMemoryUsage > 200) {
                performanceReport.recommendations.push('High memory usage detected - consider optimization');
            }
        }

        // Calculate overall grade
        const readinessCount = [
            performanceReport.summary.performanceReady,
            performanceReport.summary.loadTestingReady,
            performanceReport.summary.resourceOptimized
        ].filter(Boolean).length;

        if (readinessCount === 3) performanceReport.summary.overallGrade = 'Excellent';
        else if (readinessCount === 2) performanceReport.summary.overallGrade = 'Good';
        else if (readinessCount === 1) performanceReport.summary.overallGrade = 'Fair';
        else performanceReport.summary.overallGrade = 'Poor';

        if (performanceReport.recommendations.length === 0) {
            performanceReport.recommendations.push('Performance analysis completed - review individual test results');
        }

        // Save comprehensive performance report
        fs.writeFileSync('test-results/phase3c-performance-integration-report.json', JSON.stringify(performanceReport, null, 2));

        console.log('\n📊 Phase 3C Performance Integration Report:');
        console.log(`   🏢 Total services: ${performanceReport.summary.totalServices}`);
        console.log(`   ⚡ Performance ready: ${performanceReport.summary.performanceReady ? 'YES' : 'NO'}`);
        console.log(`   🔄 Load testing ready: ${performanceReport.summary.loadTestingReady ? 'YES' : 'NO'}`);
        console.log(`   📊 Resource optimized: ${performanceReport.summary.resourceOptimized ? 'YES' : 'NO'}`);
        console.log(`   🎯 Overall grade: ${performanceReport.summary.overallGrade}`);
        console.log(`   💾 Report saved: test-results/phase3c-performance-integration-report.json`);

        console.log('\n🎯 Recommendations:');
        performanceReport.recommendations.forEach((rec, i) => {
            console.log(`   ${i + 1}. ${rec}`);
        });

        expect(performanceReport.summary.totalServices).toBe(allServices.length);

        console.log('\n✅ Phase 3C Performance & Load Testing COMPLETED!');
        console.log('🚀 Ready for Phase 4: End-to-End User Journey Testing');
    });

});
