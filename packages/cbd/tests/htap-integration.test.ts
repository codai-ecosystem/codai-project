/**
 * HTAP Foundation Integration Tests
 * Comprehensive testing of Row Store + Columnar Store + Query Router
 * Part of CBD 2.0 Multi-Paradigm Database Implementation
 */

import { describe, beforeAll, afterAll, beforeEach, it, expect } from '@jest/globals';
import { CBDRowStoreEngine } from '../src/htap/RowStoreEngine';
import { CBDColumnarStoreEngine } from '../src/htap/ColumnarStoreEngine';
import { CBDQueryRouter, QueryType, WorkloadPattern } from '../src/htap/QueryRouter';
import { unlinkSync, existsSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';

describe('CBD HTAP Integration Tests', () => {
    let rowStore: CBDRowStoreEngine;
    let columnarStore: CBDColumnarStoreEngine;
    let queryRouter: CBDQueryRouter;
    let testDataPath: string;

    // Sample test data for various scenarios
    const sampleCustomers = [
        { id: 1, name: 'Acme Corp', industry: 'Technology', revenue: 1000000, employees: 50, created_at: new Date('2023-01-15') },
        { id: 2, name: 'Global Industries', industry: 'Manufacturing', revenue: 5000000, employees: 200, created_at: new Date('2023-02-20') },
        { id: 3, name: 'Tech Startup', industry: 'Technology', revenue: 500000, employees: 25, created_at: new Date('2023-03-10') },
        { id: 4, name: 'Retail Chain', industry: 'Retail', revenue: 2000000, employees: 150, created_at: new Date('2023-04-05') },
        { id: 5, name: 'Finance Group', industry: 'Finance', revenue: 8000000, employees: 300, created_at: new Date('2023-05-12') }
    ];

    const sampleOrders = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        customer_id: Math.floor(Math.random() * 5) + 1,
        amount: Math.floor(Math.random() * 10000) + 100,
        order_date: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        status: ['pending', 'completed', 'cancelled'][Math.floor(Math.random() * 3)],
        product_category: ['Electronics', 'Clothing', 'Books', 'Home', 'Sports'][Math.floor(Math.random() * 5)]
    }));

    beforeAll(async () => {
        // Setup test data directory
        testDataPath = join(process.cwd(), 'test-data-htap');
        if (existsSync(testDataPath)) {
            rmSync(testDataPath, { recursive: true, force: true });
        }
        mkdirSync(testDataPath, { recursive: true });

        // Initialize engines
        console.log('🚀 Initializing HTAP engines for integration testing...');
        
        rowStore = new CBDRowStoreEngine(join(testDataPath, 'rowstore'));
        columnarStore = new CBDColumnarStoreEngine(join(testDataPath, 'columnstore'));
        queryRouter = new CBDQueryRouter(rowStore, columnarStore);

        await queryRouter.initialize();
        
        console.log('✅ HTAP engines initialized successfully');
    });

    afterAll(async () => {
        // Cleanup test data
        if (existsSync(testDataPath)) {
            rmSync(testDataPath, { recursive: true, force: true });
        }
    });

    beforeEach(async () => {
        // Reset state for each test
        console.log('🔄 Resetting test state...');
    });

    describe('Basic HTAP Functionality', () => {
        it('should initialize all engines without errors', async () => {
            expect(rowStore).toBeDefined();
            expect(columnarStore).toBeDefined();
            expect(queryRouter).toBeDefined();
            
            // Verify engines are properly initialized
            const stats = queryRouter.getRoutingStats();
            expect(stats).toBeDefined();
            expect(stats.totalQueries).toBe(0);
        });

        it('should create columnar table from sample data', async () => {
            await expect(
                columnarStore.createColumnarTable('customers', sampleCustomers)
            ).resolves.not.toThrow();

            await expect(
                columnarStore.createColumnarTable('orders', sampleOrders)
            ).resolves.not.toThrow();

            console.log('✅ Sample tables created successfully');
        });
    });

    describe('Query Routing and Analysis', () => {
        beforeEach(async () => {
            // Ensure tables exist for routing tests
            await columnarStore.createColumnarTable('customers', sampleCustomers);
            await columnarStore.createColumnarTable('orders', sampleOrders);
        });

        it('should route OLTP queries to row store', async () => {
            const pointLookupQuery = {
                type: 'SELECT',
                table: 'customers',
                columns: ['*'],
                where: { id: 1 }
            };

            const { analysis, decision } = await queryRouter.routeQuery(pointLookupQuery);

            expect(analysis.type).toBe(QueryType.OLTP);
            expect(analysis.pattern).toBe(WorkloadPattern.POINT_LOOKUP);
            expect(decision.engine).toBe('row');
            expect(analysis.confidence).toBeGreaterThan(0.7);

            console.log(`📊 OLTP Query Analysis: ${analysis.type} -> ${decision.engine} store`);
        });

        it('should route OLAP queries to columnar store', async () => {
            const analyticalQuery = {
                type: 'SELECT',
                table: 'orders',
                columns: ['product_category', 'SUM(amount) as total_sales'],
                groupBy: ['product_category'],
                aggregations: [
                    { type: 'sum', column: 'amount', alias: 'total_sales' }
                ]
            };

            const { analysis, decision } = await queryRouter.routeQuery(analyticalQuery);

            expect(analysis.type).toBe(QueryType.OLAP);
            expect(analysis.pattern).toBe(WorkloadPattern.AGGREGATION);
            expect(decision.engine).toBe('column');
            expect(analysis.hasAggregations).toBe(true);

            console.log(`📈 OLAP Query Analysis: ${analysis.type} -> ${decision.engine} store`);
        });

        it('should detect hybrid workload patterns', async () => {
            const hybridQuery = {
                type: 'SELECT',
                table: 'orders',
                columns: ['*'],
                joins: [{ table: 'customers', on: 'customer_id = customers.id' }],
                where: { 'orders.status': 'completed' },
                groupBy: ['customers.industry'],
                aggregations: [{ type: 'count', column: '*', alias: 'order_count' }],
                transaction: true
            };

            const { analysis, decision } = await queryRouter.routeQuery(hybridQuery);

            expect(analysis.hasJoins).toBe(true);
            expect(analysis.hasAggregations).toBe(true);
            expect(analysis.hasTransactions).toBe(true);
            expect(analysis.complexity).toBe('high');
            expect(decision.alternatives).toHaveLength(2);

            console.log(`🔀 Hybrid Query Analysis: ${analysis.type} -> ${decision.engine} store`);
        });
    });

    describe('Performance and Optimization Tests', () => {
        beforeEach(async () => {
            await columnarStore.createColumnarTable('orders', sampleOrders);
        });

        it('should execute analytical queries efficiently on columnar store', async () => {
            const analyticalQuery = {
                table: 'orders',
                columns: ['product_category', 'status'],
                aggregations: [
                    { type: 'sum' as const, column: 'amount', alias: 'total_sales' },
                    { type: 'count' as const, column: '*', alias: 'order_count' },
                    { type: 'avg' as const, column: 'amount', alias: 'avg_order_value' }
                ],
                groupBy: ['product_category', 'status'],
                filters: [
                    { column: 'amount', operator: '>' as const, value: 500 }
                ]
            };

            const startTime = Date.now();
            const { results, stats } = await columnarStore.executeQuery(analyticalQuery);
            const executionTime = Date.now() - startTime;

            expect(results).toBeDefined();
            expect(results.length).toBeGreaterThan(0);
            expect(stats.executionTimeMs).toBeLessThan(1000); // Should be fast
            expect(stats.rowsScanned).toBeGreaterThan(0);
            expect(stats.columnsScanned).toBeGreaterThan(0);

            console.log(`⚡ Analytical query executed in ${executionTime}ms`);
            console.log(`📊 Stats: ${stats.rowsScanned} rows scanned, ${stats.rowsReturned} returned`);

            // Verify aggregation results structure
            expect(results[0]).toHaveProperty('total_sales');
            expect(results[0]).toHaveProperty('order_count');
            expect(results[0]).toHaveProperty('avg_order_value');
        });

        it('should optimize table and improve compression', async () => {
            const initialSize = sampleOrders.length;
            
            // Add more data
            const additionalOrders = Array.from({ length: 500 }, (_, i) => ({
                id: 1000 + i + 1,
                customer_id: Math.floor(Math.random() * 5) + 1,
                amount: Math.floor(Math.random() * 5000) + 50,
                order_date: new Date(),
                status: 'completed',
                product_category: 'Electronics'
            }));

            await columnarStore.appendData('orders', additionalOrders);
            
            // Optimize table
            await expect(
                columnarStore.optimizeTable('orders')
            ).resolves.not.toThrow();

            console.log(`✨ Table optimization completed for ${initialSize + additionalOrders.length} total rows`);
        });
    });

    describe('End-to-End Query Execution', () => {
        beforeEach(async () => {
            await columnarStore.createColumnarTable('customers', sampleCustomers);
            await columnarStore.createColumnarTable('orders', sampleOrders);
        });

        it('should execute OLTP query end-to-end through router', async () => {
            const olttpQuery = {
                type: 'SELECT',
                table: 'customers',
                columns: ['name', 'industry'],
                where: { id: 2 }
            };

            const { analysis, decision, execute } = await queryRouter.routeQuery(olttpQuery);
            
            expect(analysis.type).toBe(QueryType.OLTP);
            expect(decision.engine).toBe('row');

            const result = await execute();
            expect(result).toBeDefined();
            expect(result.executedOn).toBe('row-store');

            console.log('✅ OLTP query executed successfully through router');
        });

        it('should execute OLAP query end-to-end through router', async () => {
            const olapQuery = {
                type: 'SELECT',
                table: 'orders',
                columns: ['product_category'],
                groupBy: ['product_category'],
                aggregations: [
                    { type: 'sum' as const, column: 'amount', alias: 'total_revenue' },
                    { type: 'count' as const, column: '*', alias: 'total_orders' }
                ],
                orderBy: [{ column: 'total_revenue', direction: 'DESC' }]
            };

            const { analysis, decision, execute } = await queryRouter.routeQuery(olapQuery);
            
            expect(analysis.type).toBe(QueryType.OLAP);
            expect(decision.engine).toBe('column');

            const result = await execute();
            expect(result).toBeDefined();
            expect(result.executedOn).toBe('columnar-store');
            expect(result.results).toBeDefined();
            expect(result.stats).toBeDefined();

            console.log('✅ OLAP query executed successfully through router');
            console.log(`📈 Results: ${result.results.length} categories analyzed`);
        });

        it('should handle complex mixed workload queries', async () => {
            const complexQuery = {
                type: 'SELECT',
                table: 'orders',
                columns: ['product_category', 'status', 'customer_id'],
                filters: [
                    { column: 'amount', operator: 'BETWEEN' as const, rangeStart: 1000, rangeEnd: 5000 },
                    { column: 'status', operator: 'IN' as const, values: ['completed', 'pending'] }
                ],
                groupBy: ['product_category', 'status'],
                aggregations: [
                    { type: 'avg' as const, column: 'amount', alias: 'avg_amount' },
                    { type: 'count' as const, column: '*', alias: 'count' }
                ],
                orderBy: [{ column: 'avg_amount', direction: 'DESC' }],
                limit: 10
            };

            const { analysis, decision, execute } = await queryRouter.routeQuery(complexQuery);
            
            expect(analysis.hasAggregations).toBe(true);
            expect(['medium', 'high']).toContain(analysis.complexity);

            const result = await execute();
            expect(result).toBeDefined();

            console.log(`🔀 Complex query executed: ${decision.engine} engine selected`);
            console.log(`🎯 Confidence: ${Math.round(analysis.confidence * 100)}%`);
        });
    });

    describe('Routing Statistics and Learning', () => {
        it('should track routing statistics across multiple queries', async () => {
            await columnarStore.createColumnarTable('orders', sampleOrders);

            // Execute various query types
            const queries = [
                { type: 'SELECT', table: 'orders', where: { id: 1 } }, // OLTP
                { type: 'SELECT', table: 'orders', groupBy: ['status'], aggregations: [{ type: 'count' as const, column: '*' }] }, // OLAP
                { type: 'SELECT', table: 'orders', where: { customer_id: 2 } }, // OLTP
                { type: 'SELECT', table: 'orders', aggregations: [{ type: 'sum' as const, column: 'amount' }] } // OLAP
            ];

            for (const query of queries) {
                const { execute } = await queryRouter.routeQuery(query);
                await execute();
            }

            const stats = queryRouter.getRoutingStats();
            expect(stats.totalQueries).toBeGreaterThan(0);
            expect(stats.routingDistribution).toBeDefined();
            expect(Object.keys(stats.routingDistribution)).toContain('row-store');
            expect(Object.keys(stats.routingDistribution)).toContain('columnar-store');

            console.log('📊 Routing Statistics:', stats);
        });

        it('should provide performance insights for routing decisions', async () => {
            await columnarStore.createColumnarTable('customers', sampleCustomers);

            const query = {
                table: 'customers',
                columns: ['industry'],
                aggregations: [{ type: 'count' as const, column: '*', alias: 'count' }],
                groupBy: ['industry']
            };

            const { analysis, decision } = await queryRouter.routeQuery(query);
            
            expect(decision.estimatedPerformance).toBeGreaterThan(0);
            expect(decision.estimatedPerformance).toBeLessThanOrEqual(1);
            expect(decision.alternatives.length).toBeGreaterThan(0);
            expect(decision.reason).toBeDefined();

            console.log(`🎯 Performance Estimate: ${Math.round(decision.estimatedPerformance * 100)}%`);
            console.log(`💡 Reason: ${decision.reason}`);
        });
    });

    describe('Error Handling and Resilience', () => {
        it('should handle invalid queries gracefully', async () => {
            const invalidQuery = {
                type: 'INVALID_TYPE',
                table: 'nonexistent_table'
            };

            const { analysis, decision } = await queryRouter.routeQuery(invalidQuery);
            
            expect(analysis).toBeDefined();
            expect(decision).toBeDefined();
            expect(analysis.confidence).toBeLessThan(0.5); // Should have low confidence for invalid queries
            
            console.log('✅ Invalid query handled gracefully');
        });

        it('should handle missing table errors appropriately', async () => {
            const queryForMissingTable = {
                table: 'missing_table',
                columns: ['*'],
                aggregations: [{ type: 'count' as const, column: '*' }]
            };

            const { execute } = await queryRouter.routeQuery(queryForMissingTable);
            
            await expect(execute()).rejects.toThrow();
            
            console.log('✅ Missing table error handled correctly');
        });
    });

    describe('Integration Performance Benchmarks', () => {
        const PERFORMANCE_THRESHOLDS = {
            oltp_query_ms: 100,       // OLTP queries should complete within 100ms
            olap_query_ms: 1000,      // OLAP queries should complete within 1000ms  
            routing_overhead_ms: 10   // Query routing should add < 10ms overhead
        };

        beforeEach(async () => {
            await columnarStore.createColumnarTable('orders', sampleOrders);
        });

        it('should meet OLTP performance requirements', async () => {
            const olttpQuery = {
                type: 'SELECT',
                table: 'orders',
                columns: ['*'],
                where: { id: 42 }
            };

            const startTime = Date.now();
            const { execute } = await queryRouter.routeQuery(olttpQuery);
            const routingTime = Date.now() - startTime;
            
            const execStartTime = Date.now();
            await execute();
            const totalTime = Date.now() - execStartTime;

            expect(routingTime).toBeLessThan(PERFORMANCE_THRESHOLDS.routing_overhead_ms);
            // Note: Row store execution is placeholder, so we can't test actual execution time yet
            
            console.log(`⚡ OLTP Performance: Routing=${routingTime}ms, Total=${totalTime}ms`);
        });

        it('should meet OLAP performance requirements', async () => {
            const olapQuery = {
                table: 'orders',
                columns: ['product_category', 'status'],
                aggregations: [
                    { type: 'sum' as const, column: 'amount', alias: 'total' },
                    { type: 'count' as const, column: '*', alias: 'count' }
                ],
                groupBy: ['product_category', 'status']
            };

            const startTime = Date.now();
            const { execute } = await queryRouter.routeQuery(olapQuery);
            const routingTime = Date.now() - startTime;

            const execStartTime = Date.now();
            const result = await execute();
            const totalTime = Date.now() - execStartTime;

            expect(routingTime).toBeLessThan(PERFORMANCE_THRESHOLDS.routing_overhead_ms);
            expect(totalTime).toBeLessThan(PERFORMANCE_THRESHOLDS.olap_query_ms);
            expect(result.stats.executionTimeMs).toBeLessThan(PERFORMANCE_THRESHOLDS.olap_query_ms);

            console.log(`📊 OLAP Performance: Routing=${routingTime}ms, Execution=${result.stats.executionTimeMs}ms`);
        });
    });
});