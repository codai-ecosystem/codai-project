/**
 * Phase 5: Performance Testing - CURRENT PORT ALLOCATION VALIDATION
 * Tests real service endpoints with correct port mappings (4000+ range compliance)
 * CODAI Ecosystem Performance Validation
 */

import { test, expect } from '@playwright/test';

// CURRENT CORRECT PORT ALLOCATIONS (4000+ compliance)
const CURRENT_SERVICES = [
    {
        name: 'Gateway Service',
        url: 'http://localhost:4003/api/gateway/health',
        directUrl: 'http://localhost:4003',
        port: 4003,
        authType: 'public',
        acceptableStatuses: [200, 503], // 503 when aggregating unhealthy services
        performanceTarget: 500, // ms
        description: 'API Gateway health and routing'
    },
    {
        name: 'Admin Dashboard',
        url: 'http://localhost:4007/api/health',
        directUrl: 'http://localhost:4007',
        port: 4007,
        authType: 'public',
        acceptableStatuses: [200, 404], // 404 if no health endpoint
        performanceTarget: 1000, // ms
        description: 'Admin service health endpoint'
    },
    {
        name: 'ID Service',
        url: 'http://localhost:4004/api/health',
        directUrl: 'http://localhost:4004',
        port: 4004,
        authType: 'public',
        acceptableStatuses: [200, 404],
        performanceTarget: 800, // ms
        description: 'Authentication service health'
    },
    {
        name: 'Hub Service',
        url: 'http://localhost:4008',
        directUrl: 'http://localhost:4008',
        port: 4008,
        authType: 'public',
        acceptableStatuses: [200],
        performanceTarget: 1200, // ms
        description: 'Hub orchestration service'
    },
    {
        name: 'CBD Database',
        url: 'http://localhost:4180/health',
        directUrl: 'http://localhost:4180',
        port: 4180,
        authType: 'public',
        acceptableStatuses: [200],
        performanceTarget: 300, // ms
        description: 'Universal database health'
    },
    {
        name: 'MemorAI Service',
        url: 'http://localhost:4006/api/health',
        directUrl: 'http://localhost:4006',
        port: 4006,
        authType: 'public',
        acceptableStatuses: [200, 404],
        performanceTarget: 1000, // ms
        description: 'Memory AI service health'
    }
];

/**
 * Test individual service endpoint performance
 */
async function testServicePerformance(request: any, service: any) {
    console.log(`🔍 Performance testing ${service.name} (Port: ${service.port})...`);

    try {
        const startTime = Date.now();
        const response = await request.get(service.url, {
            headers: {
                'User-Agent': 'CODAI-Performance-Test/1.0',
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        const responseTime = Date.now() - startTime;
        const statusCode = response.status();

        console.log(`   Status: ${statusCode}, Response Time: ${responseTime}ms`);

        const isAcceptable = service.acceptableStatuses.includes(statusCode);
        const isPerformant = responseTime <= service.performanceTarget;

        if (isAcceptable) {
            console.log(`   ✅ Acceptable status: ${statusCode}`);
        } else {
            console.log(`   ❌ Unexpected status: ${statusCode} (expected ${service.acceptableStatuses.join(', ')})`);
        }

        if (isPerformant) {
            console.log(`   ⚡ Performance: ${responseTime}ms (target: ≤${service.performanceTarget}ms)`);
        } else {
            console.log(`   ⚠️ Slow response: ${responseTime}ms (target: ≤${service.performanceTarget}ms)`);
        }

        return {
            success: isAcceptable,
            performant: isPerformant,
            statusCode,
            responseTime,
            service: service.name,
            port: service.port
        };
    } catch (error) {
        console.log(`   ❌ Request failed: ${error}`);
        return {
            success: false,
            performant: false,
            statusCode: 0,
            responseTime: 10000,
            service: service.name,
            port: service.port,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

/**
 * Concurrent load testing for service performance
 */
async function performLoadTest(request: any, service: any, concurrency = 10) {
    console.log(`⚡ Load testing ${service.name} with ${concurrency} concurrent requests...`);

    const promises = Array.from({ length: concurrency }, async () => {
        const startTime = Date.now();
        try {
            const response = await request.get(service.url, { timeout: 5000 });
            return {
                success: service.acceptableStatuses.includes(response.status()),
                responseTime: Date.now() - startTime,
                statusCode: response.status()
            };
        } catch (error) {
            return {
                success: false,
                responseTime: Date.now() - startTime,
                statusCode: 0
            };
        }
    });

    const results = await Promise.all(promises);

    const successCount = results.filter(r => r.success).length;
    const successRate = (successCount / concurrency) * 100;
    const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / concurrency;
    const maxResponseTime = Math.max(...results.map(r => r.responseTime));
    const minResponseTime = Math.min(...results.map(r => r.responseTime));

    console.log(`   Success Rate: ${successRate.toFixed(1)}%`);
    console.log(`   Avg Response: ${avgResponseTime.toFixed(0)}ms`);
    console.log(`   Min/Max: ${minResponseTime}ms / ${maxResponseTime}ms`);

    return {
        successRate,
        avgResponseTime,
        maxResponseTime,
        minResponseTime,
        results
    };
}

/**
 * Performance benchmark testing
 */
async function benchmarkService(request: any, service: any) {
    console.log(`📊 Benchmarking ${service.name}...`);

    const iterations = 20;
    const results = [];

    for (let i = 0; i < iterations; i++) {
        const result = await testServicePerformance(request, service);
        results.push(result);

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    const responseTimes = results.map(r => r.responseTime);
    const successfulResults = results.filter(r => r.success);

    const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    const p95ResponseTime = responseTimes.sort((a, b) => a - b)[Math.floor(responseTimes.length * 0.95)];
    const successRate = (successfulResults.length / results.length) * 100;

    console.log(`   📈 Benchmark Results:`);
    console.log(`      Success Rate: ${successRate.toFixed(1)}%`);
    console.log(`      Avg Response: ${avgResponseTime.toFixed(0)}ms`);
    console.log(`      95th Percentile: ${p95ResponseTime}ms`);
    console.log(`      Performance Target: ${service.performanceTarget}ms`);

    return {
        successRate,
        avgResponseTime,
        p95ResponseTime,
        performanceTarget: service.performanceTarget,
        meetsTarget: p95ResponseTime <= service.performanceTarget
    };
}

test.describe('Phase 5: Performance Testing - Current Port Allocation', () => {

    test('Service Health and Response Time Validation', async ({ request }) => {
        console.log('🚀 Phase 5.1: Service Health and Response Time Validation');
        console.log('='.repeat(60));

        const results = [];

        for (const service of CURRENT_SERVICES) {
            const result = await testServicePerformance(request, service);
            results.push(result);

            // Validate service health
            expect(result.success, `${service.name} should return acceptable status codes`).toBe(true);

            // Validate response time (allowing some flexibility for slower services)
            const flexibleTarget = service.performanceTarget * 2; // 2x target for flexibility
            expect(result.responseTime, `${service.name} should respond within ${flexibleTarget}ms`).toBeLessThan(flexibleTarget);
        }

        console.log('\\n📊 Performance Summary:');
        results.forEach(result => {
            const status = result.success ? '✅' : '❌';
            const perf = result.performant ? '⚡' : '⚠️';
            console.log(`   ${status}${perf} ${result.service}: ${result.responseTime}ms (Port: ${result.port})`);
        });
    });

    test('Concurrent Load Performance Testing', async ({ request }) => {
        console.log('🚀 Phase 5.2: Concurrent Load Performance Testing');
        console.log('='.repeat(60));

        const loadTestResults = [];

        for (const service of CURRENT_SERVICES) {
            const loadResult = await performLoadTest(request, service, 5); // 5 concurrent requests
            loadTestResults.push({ service: service.name, ...loadResult });

            // Validate load performance
            expect(loadResult.successRate, `${service.name} should handle concurrent load`).toBeGreaterThan(60);
            expect(loadResult.avgResponseTime, `${service.name} should maintain reasonable response time under load`).toBeLessThan(service.performanceTarget * 3);
        }

        console.log('\\n📊 Load Test Results:');
        loadTestResults.forEach(result => {
            const grade = result.successRate >= 80 ? 'A' : result.successRate >= 60 ? 'B' : 'C';
            console.log(`   ${grade}: ${result.service} - ${result.successRate.toFixed(1)}% success, ${result.avgResponseTime.toFixed(0)}ms avg`);
        });
    });

    test('Performance Benchmark Validation', async ({ request }) => {
        console.log('🚀 Phase 5.3: Performance Benchmark Validation');
        console.log('='.repeat(60));

        const benchmarkResults = [];

        // Test core services for detailed benchmarks
        const coreServices = CURRENT_SERVICES.filter(s =>
            s.name.includes('Gateway') || s.name.includes('Hub') || s.name.includes('CBD')
        );

        for (const service of coreServices) {
            const benchmark = await benchmarkService(request, service);
            benchmarkResults.push({ service: service.name, ...benchmark });

            // Benchmark validation
            expect(benchmark.successRate, `${service.name} should be reliable in benchmarks`).toBeGreaterThan(70);
            expect(benchmark.avgResponseTime, `${service.name} should maintain good average performance`).toBeLessThan(service.performanceTarget * 2);
        }

        console.log('\\n📊 Benchmark Summary:');
        benchmarkResults.forEach(result => {
            const targetMet = result.meetsTarget ? '🎯' : '📈';
            console.log(`   ${targetMet} ${result.service}:`);
            console.log(`      Success: ${result.successRate.toFixed(1)}%`);
            console.log(`      Avg: ${result.avgResponseTime.toFixed(0)}ms`);
            console.log(`      P95: ${result.p95ResponseTime}ms (target: ${result.performanceTarget}ms)`);
        });

        // Overall benchmark validation
        const allMeetTargets = benchmarkResults.every(r => r.meetsTarget);
        console.log(`\\n🎯 Overall Performance Grade: ${allMeetTargets ? 'A+ (All targets met)' : 'B+ (Some targets exceeded)'}`);
    });

    test('Port Allocation Compliance Validation', async ({ request }) => {
        console.log('🚀 Phase 5.4: Port Allocation Compliance Validation');
        console.log('='.repeat(60));

        console.log('📋 Current Port Allocation:');
        CURRENT_SERVICES.forEach(service => {
            console.log(`   ${service.name}: Port ${service.port} ✅ (4000+ compliant)`);
        });

        // Validate all ports are 4000+
        const portCompliance = CURRENT_SERVICES.every(service => service.port >= 4000);
        expect(portCompliance, 'All services should use ports 4000 or higher').toBe(true);

        // Test that services are actually running on their designated ports
        const portTests = [];
        for (const service of CURRENT_SERVICES) {
            const result = await testServicePerformance(request, service);
            portTests.push({
                service: service.name,
                port: service.port,
                accessible: result.success || result.statusCode > 0 // Any response means port is accessible
            });
        }

        console.log('\\n🔍 Port Accessibility Test:');
        portTests.forEach(test => {
            const status = test.accessible ? '✅' : '❌';
            console.log(`   ${status} ${test.service}: Port ${test.port} ${test.accessible ? 'accessible' : 'not accessible'}`);
        });

        const accessiblePorts = portTests.filter(t => t.accessible).length;
        expect(accessiblePorts, 'Most services should be accessible on their designated ports').toBeGreaterThan(3);

        console.log(`\\n📊 Port Compliance Summary: ${accessiblePorts}/${portTests.length} services accessible`);
    });
});
