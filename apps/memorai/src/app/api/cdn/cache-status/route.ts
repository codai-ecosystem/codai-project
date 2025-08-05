/**
 * CDN Cache Status API
 * Provides cache statistics and performance metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import {
    cdnManager,
    cdnPerformanceMonitor,
    apiCache
} from '../../../../lib/cdn-caching';

export async function GET(request: NextRequest) {
    try {
        // Get cache statistics
        const cacheStats = cdnManager.getStats();
        const performanceStats = cdnPerformanceMonitor.getPerformanceSummary();
        const apiCacheStats = apiCache.getStats();

        // Calculate cache efficiency
        const totalHitRate = Object.values(performanceStats.cacheHitRates)
            .reduce((sum, rate, _, arr) => sum + rate / arr.length, 0);

        const averageResponseTime = Object.values(performanceStats.averageResponseTimes)
            .reduce((sum, time, _, arr) => sum + time / arr.length, 0);

        const response = {
            status: 'success',
            timestamp: new Date().toISOString(),
            cache: {
                total_entries: cacheStats.size,
                memory_cache_entries: cacheStats.entries.length,
                api_cache_entries: apiCacheStats.size
            },
            performance: {
                overall_hit_rate: Math.round(totalHitRate * 100) / 100,
                average_response_time: Math.round(averageResponseTime * 100) / 100,
                endpoint_hit_rates: performanceStats.cacheHitRates,
                endpoint_response_times: performanceStats.averageResponseTimes
            },
            cdn_status: {
                enabled: true,
                static_assets_cached: true,
                api_responses_cached: true,
                image_optimization: true
            },
            cache_headers: {
                static_assets: {
                    'Cache-Control': 'public, max-age=31536000, immutable',
                    'Expires': new Date(Date.now() + 31536000 * 1000).toUTCString()
                },
                api_responses: {
                    'Cache-Control': 'public, max-age=300, stale-while-revalidate=300'
                }
            },
            recommendations: generateRecommendations(performanceStats, cacheStats)
        };

        return NextResponse.json(response, {
            status: 200,
            headers: {
                'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
                'Content-Type': 'application/json'
            }
        });

    } catch (error) {
        console.error('CDN cache status error:', error);

        return NextResponse.json({
            status: 'error',
            message: 'Failed to get cache status',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }, {
            status: 500,
            headers: {
                'Cache-Control': 'no-cache, no-store',
                'Content-Type': 'application/json'
            }
        });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, target } = body;

        let result: any = {};

        switch (action) {
            case 'clear_cache':
                if (target === 'all') {
                    cdnManager.clear();
                    result = { message: 'All cache cleared' };
                } else if (target) {
                    cdnManager.delete(target);
                    result = { message: `Cache cleared for ${target}` };
                }
                break;

            case 'invalidate_tag':
                if (target) {
                    apiCache.invalidateByTag(target);
                    result = { message: `Cache invalidated for tag: ${target}` };
                }
                break;

            case 'warm_cache':
                // Warm up common endpoints
                result = await warmupCache();
                break;

            default:
                return NextResponse.json({
                    status: 'error',
                    message: 'Invalid action'
                }, { status: 400 });
        }

        return NextResponse.json({
            status: 'success',
            action,
            target,
            result,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('CDN cache action error:', error);

        return NextResponse.json({
            status: 'error',
            message: 'Failed to perform cache action',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

/**
 * Generate performance recommendations based on cache statistics
 */
function generateRecommendations(
    performanceStats: any,
    cacheStats: any
): string[] {
    const recommendations: string[] = [];

    // Check overall hit rate
    const totalHitRate = Object.values(performanceStats.cacheHitRates as Record<string, number>)
        .reduce((sum, rate, _, arr) => sum + rate / arr.length, 0);

    if (totalHitRate < 50) {
        recommendations.push('Consider increasing cache TTL for better hit rates');
    }

    // Check response times
    const avgResponseTime = Object.values(performanceStats.averageResponseTimes as Record<string, number>)
        .reduce((sum, time, _, arr) => sum + time / arr.length, 0);

    if (avgResponseTime > 1000) {
        recommendations.push('Response times are high - consider optimizing database queries');
    }

    // Check cache size
    if (cacheStats.size > 10000) {
        recommendations.push('Cache size is large - consider implementing cache eviction policies');
    } else if (cacheStats.size < 10) {
        recommendations.push('Cache usage is low - verify caching is working correctly');
    }

    // Check specific endpoints
    Object.entries(performanceStats.cacheHitRates as Record<string, number>).forEach(([endpoint, rate]) => {
        if (rate < 30) {
            recommendations.push(`${endpoint} endpoint has low cache hit rate (${rate.toFixed(1)}%)`);
        }
    });

    if (recommendations.length === 0) {
        recommendations.push('Cache performance looks good! No recommendations at this time.');
    }

    return recommendations;
}

/**
 * Warm up cache with common requests
 */
async function warmupCache(): Promise<{ warmed: string[] }> {
    const endpoints = [
        '/api/health',
        '/api/memories?limit=10',
        '/api/analytics'
    ];

    const warmed: string[] = [];

    for (const endpoint of endpoints) {
        try {
            // Simulate cache warming (in a real app, you'd make actual requests)
            const key = `warmup_${endpoint}`;
            cdnManager.set(key, { warmed: true, timestamp: Date.now() }, 300);
            warmed.push(endpoint);
        } catch (error) {
            console.error(`Failed to warm cache for ${endpoint}:`, error);
        }
    }

    return { warmed };
}
