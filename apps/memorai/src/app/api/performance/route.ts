import { NextRequest, NextResponse } from 'next/server';
import { memoryCache, cacheMetrics } from '../../../lib/cache';
import { ApiResponse } from '../../../types/memory';

interface CacheStatsResponse {
    cache: {
        hits: number;
        misses: number;
        sets: number;
        evictions: number;
        hitRate: number;
        cacheSize: number;
        maxSize: number;
    };
    performance: {
        averageResponseTime: number;
        slowQueries: number;
        totalRequests: number;
        p95ResponseTime: number;
        p99ResponseTime: number;
        throughput: number;
        errorRate: number;
    };
    system: {
        memoryUsage: NodeJS.MemoryUsage;
        uptime: number;
        cpuUsage: NodeJS.CpuUsage;
        loadAverage?: number[];
        platform: string;
        nodeVersion: string;
    };
}

// Enhanced performance tracking
const performanceStats = {
    responseTimes: [] as number[],
    slowQueries: 0,
    totalRequests: 0,
    errorRequests: 0,
    startTime: Date.now(),
    lastMinuteRequests: [] as { timestamp: number; responseTime: number }[]
};

export function trackPerformance(responseTime: number, isError: boolean = false): void {
    const now = Date.now();

    performanceStats.totalRequests++;
    if (isError) {
        performanceStats.errorRequests++;
    } else {
        performanceStats.responseTimes.push(responseTime);
    }

    // Track for throughput calculation
    performanceStats.lastMinuteRequests.push({ timestamp: now, responseTime });

    // Keep only last 100 response times for percentiles
    if (performanceStats.responseTimes.length > 100) {
        performanceStats.responseTimes.shift();
    }

    // Keep only last minute of requests for throughput
    const oneMinuteAgo = now - 60000;
    performanceStats.lastMinuteRequests = performanceStats.lastMinuteRequests.filter(
        req => req.timestamp > oneMinuteAgo
    );

    // Track slow queries (>500ms)
    if (responseTime > 500) {
        performanceStats.slowQueries++;
    }
}

function calculatePercentile(sortedArray: number[], percentile: number): number {
    if (sortedArray.length === 0) return 0;
    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
    return Math.round(sortedArray[Math.max(0, Math.min(index, sortedArray.length - 1))] * 100) / 100;
}

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<CacheStatsResponse>>> {
    const startTime = process.hrtime.bigint();

    try {
        const cacheStats = memoryCache.getStats();

        const averageResponseTime = performanceStats.responseTimes.length > 0
            ? performanceStats.responseTimes.reduce((a, b) => a + b, 0) / performanceStats.responseTimes.length
            : 0;

        // Calculate percentiles
        const sortedResponseTimes = [...performanceStats.responseTimes].sort((a, b) => a - b);
        const p95ResponseTime = calculatePercentile(sortedResponseTimes, 95);
        const p99ResponseTime = calculatePercentile(sortedResponseTimes, 99);

        // Calculate throughput (requests per second)
        const throughput = performanceStats.lastMinuteRequests.length / 60;

        // Calculate error rate
        const errorRate = performanceStats.totalRequests > 0
            ? (performanceStats.errorRequests / performanceStats.totalRequests) * 100
            : 0;

        const uptime = (Date.now() - performanceStats.startTime) / 1000; // seconds
        const memoryUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();

        const response: CacheStatsResponse = {
            cache: cacheStats,
            performance: {
                averageResponseTime: Math.round(averageResponseTime * 100) / 100,
                slowQueries: performanceStats.slowQueries,
                totalRequests: performanceStats.totalRequests,
                p95ResponseTime,
                p99ResponseTime,
                throughput: Math.round(throughput * 100) / 100,
                errorRate: Math.round(errorRate * 100) / 100
            },
            system: {
                memoryUsage,
                uptime: Math.round(uptime),
                cpuUsage: {
                    user: Math.round(cpuUsage.user / 1000 * 100) / 100, // ms
                    system: Math.round(cpuUsage.system / 1000 * 100) / 100 // ms
                },
                loadAverage: typeof process.loadavg === 'function' ? process.loadavg() : undefined,
                platform: process.platform,
                nodeVersion: process.version
            }
        };

        // Track this request's performance
        const responseTime = Number(process.hrtime.bigint() - startTime) / 1000000;
        trackPerformance(responseTime, false);

        return NextResponse.json({
            success: true,
            data: response,
            meta: {
                timestamp: new Date().toISOString(),
                processingTime: Math.round(responseTime * 100) / 100
            }
        });

    } catch (error) {
        // Track this as an error
        const responseTime = Number(process.hrtime.bigint() - startTime) / 1000000;
        trackPerformance(responseTime, true);

        console.error('Error getting performance stats:', error);
        return NextResponse.json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Internal server error',
            },
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<{ message: string; data?: any }>>> {
    const startTime = process.hrtime.bigint();

    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');
        let body: any = null;

        try {
            body = await request.json();
        } catch {
            // No body or invalid JSON, that's fine for some actions
        }

        if (action === 'clear-cache') {
            memoryCache.clear();
            const responseTime = Number(process.hrtime.bigint() - startTime) / 1000000;
            trackPerformance(responseTime, false);

            return NextResponse.json({
                success: true,
                data: { message: 'Cache cleared successfully' },
                meta: {
                    timestamp: new Date().toISOString(),
                    processingTime: Math.round(responseTime * 100) / 100
                }
            });
        }

        if (action === 'reset-stats') {
            performanceStats.responseTimes = [];
            performanceStats.slowQueries = 0;
            performanceStats.totalRequests = 0;
            performanceStats.errorRequests = 0;
            performanceStats.startTime = Date.now();
            performanceStats.lastMinuteRequests = [];

            const responseTime = Number(process.hrtime.bigint() - startTime) / 1000000;
            // Don't track this request since we just reset stats

            return NextResponse.json({
                success: true,
                data: { message: 'Performance stats reset successfully' },
                meta: {
                    timestamp: new Date().toISOString(),
                    processingTime: Math.round(responseTime * 100) / 100
                }
            });
        }

        if (action === 'benchmark-test') {
            // Perform CPU-intensive benchmark for testing
            const iterations = body?.iterations || 10000;
            const complexity = body?.complexity || 'medium';

            let result = 0;
            const benchmarkStart = process.hrtime.bigint();

            if (complexity === 'high') {
                // CPU-intensive task
                for (let i = 0; i < iterations * 100; i++) {
                    result += Math.sqrt(i) * Math.sin(i) * Math.cos(i);
                }
            } else if (complexity === 'medium') {
                // Moderate task
                for (let i = 0; i < iterations * 10; i++) {
                    result += Math.sqrt(i);
                }
            } else {
                // Light task
                for (let i = 0; i < iterations; i++) {
                    result += i;
                }
            }

            const benchmarkEnd = process.hrtime.bigint();
            const benchmarkTime = Number(benchmarkEnd - benchmarkStart) / 1000000; // ms
            const responseTime = Number(process.hrtime.bigint() - startTime) / 1000000;
            trackPerformance(responseTime, false);

            return NextResponse.json({
                success: true,
                data: {
                    message: 'Benchmark test completed',
                    data: {
                        result: Math.round(result),
                        benchmarkTime: Math.round(benchmarkTime * 100) / 100,
                        iterations,
                        complexity,
                        processingTime: Math.round(responseTime * 100) / 100
                    }
                },
                meta: {
                    timestamp: new Date().toISOString(),
                    processingTime: Math.round(responseTime * 100) / 100
                }
            });
        }

        const responseTime = Number(process.hrtime.bigint() - startTime) / 1000000;
        trackPerformance(responseTime, true); // This is an error case

        return NextResponse.json({
            success: false,
            error: {
                code: 'INVALID_ACTION',
                message: 'Invalid action. Use "clear-cache", "reset-stats", or "benchmark-test"',
            },
        }, { status: 400 });

    } catch (error) {
        const responseTime = Number(process.hrtime.bigint() - startTime) / 1000000;
        trackPerformance(responseTime, true);

        console.error('Error handling performance action:', error);
        return NextResponse.json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Internal server error',
            },
        }, { status: 500 });
    }
}
