/*!
 * CBD MCP Server Stats Tool
 * Provides detailed server performance metrics and statistics
 */

import { CBDMemoryEngine } from '../../../memory/MemoryEngine.js';
import { ServerStats } from '../../types.js';
import { CBDMCPConfig } from '../../config.js';

/**
 * Get comprehensive server statistics
 */
export async function getServerStats(
    engine: CBDMemoryEngine,
    config: CBDMCPConfig,
    detailed: boolean = false
): Promise<ServerStats> {
    // Get memory usage
    const memUsage = process.memoryUsage();
    const memoryUsagePercentage = (memUsage.heapUsed / memUsage.heapTotal) * 100;

    // Basic performance metrics
    let avgSearchTime = 0;
    let operationsPerSecond = 0;

    if (detailed) {
        // Perform performance benchmarks
        const searchStart = process.hrtime.bigint();
        try {
            await engine.search_memory('benchmark_test', 5);
            const searchEnd = process.hrtime.bigint();
            avgSearchTime = Number(searchEnd - searchStart) / 1000000; // Convert to ms
        } catch (error) {
            avgSearchTime = -1; // Indicate error
        }

        // Calculate approximate operations per second based on search performance
        if (avgSearchTime > 0) {
            operationsPerSecond = Math.round(1000 / avgSearchTime);
        }
    }

    // Get uptime
    const uptime = process.uptime() * 1000; // Convert to ms

    const stats: ServerStats = {
        uptime,
        version: config.server.version,
        collections: 1, // CBD uses unified memory model
        totalVectors: 0, // Would need to be tracked separately
        memoryUsage: {
            used: memUsage.heapUsed,
            total: memUsage.heapTotal,
            percentage: memoryUsagePercentage,
        },
        performance: {
            avgSearchTime,
            avgInsertTime: 0, // Would need benchmarking
            operationsPerSecond,
        },
    };

    // Add detailed index stats if requested
    if (detailed) {
        stats.indexStats = {
            'main': {
                size: memUsage.external,
                depth: 0, // Would need vector store inspection
                connections: 0, // Would need HNSW inspection
            },
        };
    }

    return stats;
}

/**
 * Get basic server statistics (non-detailed)
 */
export async function getBasicStats(
    _engine: CBDMemoryEngine,
    config: CBDMCPConfig
): Promise<Partial<ServerStats>> {
    const memUsage = process.memoryUsage();

    return {
        uptime: process.uptime() * 1000,
        version: config.server.version,
        collections: 1,
        memoryUsage: {
            used: memUsage.heapUsed,
            total: memUsage.heapTotal,
            percentage: (memUsage.heapUsed / memUsage.heapTotal) * 100,
        },
        performance: {
            avgSearchTime: 0,
            avgInsertTime: 0,
            operationsPerSecond: 0,
        },
    };
}

/**
 * Performance benchmark utility
 */
export async function benchmarkPerformance(
    engine: CBDMemoryEngine,
    operations: number = 100
): Promise<{
    searchTime: number;
    insertTime: number;
    operationsPerSecond: number;
}> {
    // Search benchmark
    const searchStart = process.hrtime.bigint();
    for (let i = 0; i < operations; i++) {
        try {
            await engine.search_memory(`benchmark_${i}`, 1);
        } catch {
            // Ignore errors for benchmarking
        }
    }
    const searchEnd = process.hrtime.bigint();
    const avgSearchTime = Number(searchEnd - searchStart) / 1000000 / operations;

    // Insert benchmark (simplified)
    const insertStart = process.hrtime.bigint();
    // Note: Would need actual insert operations for accurate benchmarking
    const insertEnd = process.hrtime.bigint();
    const avgInsertTime = Number(insertEnd - insertStart) / 1000000 / operations;

    const operationsPerSecond = operations / ((Number(searchEnd - searchStart) / 1000000000));

    return {
        searchTime: avgSearchTime,
        insertTime: avgInsertTime,
        operationsPerSecond: Math.round(operationsPerSecond),
    };
}
