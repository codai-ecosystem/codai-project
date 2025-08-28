/**
 * CBD 2.0 Phase 1 Testing Framework
 * Comprehensive test suite for HTAP Processing Engine and Multi-Paradigm Storage
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
    CBD2MainEngine,
    CBDHTAPProcessingEngine,
    CBDMultiParadigmEngine,
    DBParadigm,
    QueryType,
    DEFAULT_CBD2_CONFIG,
    type CBD2Config,
    type QueryContext,
    type MultiParadigmQuery
} from '../src/index.js';

describe('CBD 2.0 Phase 1 Integration Tests', () => {
    let engine: CBD2MainEngine;
    let testConfig: CBD2Config;

    beforeAll(async () => {
        // Test configuration with reduced timeouts for faster testing
        testConfig = {
            ...DEFAULT_CBD2_CONFIG,
            htap: {
                ...DEFAULT_CBD2_CONFIG.htap,
                oltp: {
                    ...DEFAULT_CBD2_CONFIG.htap.oltp,
                    transactionTimeout: 5000
                },
                olap: {
                    ...DEFAULT_CBD2_CONFIG.htap.olap,
                    queryTimeout: 10000
                }
            },
            monitoring: {
                ...DEFAULT_CBD2_CONFIG.monitoring,
                healthCheckInterval: 5000 // 5 seconds for testing
            }
        };

        engine = new CBD2MainEngine(testConfig);
        await engine.initialize();
    });

    afterAll(async () => {
        if (engine) {
            await engine.shutdown();
        }
    });

    describe('HTAP Processing Engine Tests', () => {
        it('should classify SQL queries correctly', async () => {
            // OLTP transaction query
            const oltpResult = await engine.executeSQLQuery('INSERT INTO users (name, email) VALUES (?, ?)', ['John Doe', 'john@example.com']);
            expect(oltpResult.metadata.engine).toBe('oltp');

            // OLAP analytical query
            const olapResult = await engine.executeSQLQuery('SELECT COUNT(*) FROM users GROUP BY department');
            expect(olapResult.metadata.engine).toBe('olap');
        });

        it('should route queries based on system load', async () => {
            const queries = [];

            // Generate multiple concurrent queries
            for (let i = 0; i < 10; i++) {
                queries.push(engine.executeSQLQuery(`SELECT * FROM users WHERE id = ${i}`));
            }

            const results = await Promise.all(queries);

            // Verify all queries completed successfully
            expect(results).toHaveLength(10);
            results.forEach(result => {
                expect(result.queryId).toBeDefined();
                expect(['oltp', 'olap']).toContain(result.metadata.engine);
            });
        });

        it('should handle query timeouts gracefully', async () => {
            const context: QueryContext = {
                queryId: 'timeout-test',
                type: QueryType.OLAP_ANALYTICAL,
                sql: 'SELECT * FROM large_table',
                timeout: 1, // 1ms timeout to force timeout
                priority: 'low'
            };

            // Should not throw, but may return error in result
            const result = await engine.executeQuery(context);
            expect(result.queryId).toBe('timeout-test');
        });
    });

    describe('Multi-Paradigm Storage Tests', () => {
        it('should handle relational operations', async () => {
            const query: MultiParadigmQuery = {
                paradigm: DBParadigm.RELATIONAL,
                operation: 'insert',
                target: 'products',
                data: { name: 'Test Product', price: 99.99 }
            };

            const result = await engine.executeMultiParadigmQuery(query);
            expect(result.rowsAffected).toBeGreaterThan(0);
        });

        it('should handle document operations', async () => {
            const insertQuery: MultiParadigmQuery = {
                paradigm: DBParadigm.DOCUMENT,
                operation: 'insert',
                target: 'posts',
                data: {
                    title: 'Test Post',
                    content: 'This is a test post',
                    tags: ['test', 'cbd']
                }
            };

            const insertResult = await engine.executeMultiParadigmQuery(insertQuery);
            expect(insertResult._id).toBeDefined();

            const findQuery: MultiParadigmQuery = {
                paradigm: DBParadigm.DOCUMENT,
                operation: 'find',
                target: 'posts',
                filters: { title: 'Test Post' }
            };

            const findResult = await engine.executeMultiParadigmQuery(findQuery);
            expect(findResult).toBeInstanceOf(Array);
            expect(findResult.length).toBeGreaterThan(0);
        });

        it('should handle key-value operations', async () => {
            const setQuery: MultiParadigmQuery = {
                paradigm: DBParadigm.KEY_VALUE,
                operation: 'set',
                target: 'test-key',
                data: { message: 'Hello CBD 2.0!' }
            };

            const setResult = await engine.executeMultiParadigmQuery(setQuery);
            expect(setResult.success).toBe(true);

            const getQuery: MultiParadigmQuery = {
                paradigm: DBParadigm.KEY_VALUE,
                operation: 'get',
                target: 'test-key'
            };

            const getResult = await engine.executeMultiParadigmQuery(getQuery);
            expect(getResult.message).toBe('Hello CBD 2.0!');
        });

        it('should handle vector similarity search', async () => {
            // Insert test vectors
            const vectors = [
                { id: 'vec1', vector: [1.0, 0.0, 0.0], metadata: { type: 'product' } },
                { id: 'vec2', vector: [0.0, 1.0, 0.0], metadata: { type: 'user' } },
                { id: 'vec3', vector: [0.9, 0.1, 0.0], metadata: { type: 'product' } }
            ];

            for (const vec of vectors) {
                const insertQuery: MultiParadigmQuery = {
                    paradigm: DBParadigm.VECTOR,
                    operation: 'insert',
                    target: vec.id,
                    data: vec
                };
                await engine.executeMultiParadigmQuery(insertQuery);
            }

            // Search for similar vectors
            const searchQuery: MultiParadigmQuery = {
                paradigm: DBParadigm.VECTOR,
                operation: 'search',
                target: '',
                data: { vector: [1.0, 0.0, 0.0] },
                options: { vectorSimilarityThreshold: 0.5 }
            };

            const searchResult = await engine.executeMultiParadigmQuery(searchQuery);
            expect(searchResult).toBeInstanceOf(Array);
            expect(searchResult.length).toBeGreaterThan(0);

            // Should find similar vectors with similarity scores
            const firstResult = searchResult[0];
            expect(firstResult.similarity).toBeGreaterThan(0.5);
        });

        it('should handle time-series data', async () => {
            const insertQuery: MultiParadigmQuery = {
                paradigm: DBParadigm.TIME_SERIES,
                operation: 'insert',
                target: 'cpu-usage',
                data: { value: 85.5, timestamp: new Date() }
            };

            const insertResult = await engine.executeMultiParadigmQuery(insertQuery);
            expect(insertResult.success).toBe(true);

            const queryData: MultiParadigmQuery = {
                paradigm: DBParadigm.TIME_SERIES,
                operation: 'query',
                target: 'cpu-usage'
            };

            const queryResult = await engine.executeMultiParadigmQuery(queryData);
            expect(queryResult).toBeInstanceOf(Array);
        });

        it('should handle file storage operations', async () => {
            const fileContent = Buffer.from('Test file content for CBD 2.0');

            const storeQuery: MultiParadigmQuery = {
                paradigm: DBParadigm.FILE_STORAGE,
                operation: 'store',
                target: 'test-file.txt',
                data: fileContent
            };

            const storeResult = await engine.executeMultiParadigmQuery(storeQuery);
            expect(storeResult.success).toBe(true);

            const retrieveQuery: MultiParadigmQuery = {
                paradigm: DBParadigm.FILE_STORAGE,
                operation: 'retrieve',
                target: 'test-file.txt'
            };

            const retrieveResult = await engine.executeMultiParadigmQuery(retrieveQuery);
            expect(retrieveResult).toBeInstanceOf(Buffer);
            expect(retrieveResult.toString()).toBe('Test file content for CBD 2.0');
        });
    });

    describe('Performance and Monitoring Tests', () => {
        it('should track query execution metrics', async () => {
            // Execute several queries to generate metrics
            for (let i = 0; i < 5; i++) {
                await engine.executeSQLQuery(`SELECT ${i} as number`);
            }

            const stats = await engine.getDetailedStats();
            expect(stats.engine.metrics.totalQueries).toBeGreaterThanOrEqual(5);
            expect(stats.engine.metrics.avgResponseTimeMs).toBeGreaterThan(0);
            expect(stats.engine.metrics.throughputPerSecond).toBeGreaterThanOrEqual(0);
        });

        it('should maintain health status', async () => {
            const healthStatus = engine.getHealthStatus();

            expect(healthStatus.status).toBe('healthy');
            expect(healthStatus.htapStatus).toBe('active');
            expect(healthStatus.uptime).toBeGreaterThan(0);

            // Check that all paradigms are active
            Object.values(DBParadigm).forEach(paradigm => {
                expect(healthStatus.paradigmsStatus[paradigm]).toBe('active');
            });
        });

        it('should collect comprehensive statistics', async () => {
            const detailedStats = await engine.getDetailedStats();

            // Engine stats
            expect(detailedStats.engine).toBeDefined();
            expect(detailedStats.engine.metrics.totalQueries).toBeGreaterThanOrEqual(0);

            // HTAP stats
            expect(detailedStats.htap).toBeDefined();
            expect(detailedStats.htap.oltp).toBeDefined();
            expect(detailedStats.htap.olap).toBeDefined();
            expect(detailedStats.htap.routing).toBeDefined();

            // Paradigm stats
            expect(detailedStats.paradigms).toBeInstanceOf(Array);
            expect(detailedStats.paradigms.length).toBe(Object.values(DBParadigm).length);
        });
    });

    describe('Error Handling and Resilience Tests', () => {
        it('should handle invalid query contexts gracefully', async () => {
            const invalidContext: QueryContext = {
                queryId: 'invalid-test',
                type: 'INVALID_TYPE' as any,
                priority: 'medium'
            };

            const result = await engine.executeQuery(invalidContext);
            expect(result.error).toBeDefined();
        });

        it('should handle concurrent load', async () => {
            const concurrentQueries = [];
            const queryCount = 50;

            // Generate concurrent queries across different paradigms
            for (let i = 0; i < queryCount; i++) {
                const paradigm = Object.values(DBParadigm)[i % Object.values(DBParadigm).length];
                const query: MultiParadigmQuery = {
                    paradigm,
                    operation: paradigm === DBParadigm.KEY_VALUE ? 'set' : 'insert',
                    target: `concurrent-test-${i}`,
                    data: { index: i, timestamp: new Date() }
                };
                concurrentQueries.push(engine.executeMultiParadigmQuery(query));
            }

            const results = await Promise.allSettled(concurrentQueries);
            const successful = results.filter(r => r.status === 'fulfilled').length;

            // Should handle most queries successfully (allow for some failures under extreme load)
            expect(successful / queryCount).toBeGreaterThan(0.8);
        });

        it('should maintain consistency across paradigms', async () => {
            const testData = { id: 'consistency-test', value: 'test-value' };

            // Store same data in different paradigms
            const kvQuery: MultiParadigmQuery = {
                paradigm: DBParadigm.KEY_VALUE,
                operation: 'set',
                target: testData.id,
                data: testData
            };

            const docQuery: MultiParadigmQuery = {
                paradigm: DBParadigm.DOCUMENT,
                operation: 'insert',
                target: 'consistency-test',
                data: testData
            };

            await Promise.all([
                engine.executeMultiParadigmQuery(kvQuery),
                engine.executeMultiParadigmQuery(docQuery)
            ]);

            // Retrieve from both paradigms
            const kvRetrieve: MultiParadigmQuery = {
                paradigm: DBParadigm.KEY_VALUE,
                operation: 'get',
                target: testData.id
            };

            const docRetrieve: MultiParadigmQuery = {
                paradigm: DBParadigm.DOCUMENT,
                operation: 'find',
                target: 'consistency-test',
                filters: { id: testData.id }
            };

            const [kvResult, docResult] = await Promise.all([
                engine.executeMultiParadigmQuery(kvRetrieve),
                engine.executeMultiParadigmQuery(docRetrieve)
            ]);

            expect(kvResult.value).toBe(testData.value);
            expect(docResult[0].value).toBe(testData.value);
        });
    });
});

describe('CBD 2.0 Performance Benchmarks', () => {
    let engine: CBD2MainEngine;

    beforeAll(async () => {
        engine = new CBD2MainEngine(DEFAULT_CBD2_CONFIG);
        await engine.initialize();
    });

    afterAll(async () => {
        await engine.shutdown();
    });

    it('should meet HTAP performance targets', async () => {
        const startTime = performance.now();
        const queryPromises = [];

        // Generate mixed workload
        for (let i = 0; i < 100; i++) {
            if (i % 2 === 0) {
                // OLTP queries
                queryPromises.push(
                    engine.executeSQLQuery(`INSERT INTO benchmark (id, value) VALUES (${i}, 'test${i}')`)
                );
            } else {
                // OLAP queries
                queryPromises.push(
                    engine.executeSQLQuery(`SELECT COUNT(*) FROM benchmark WHERE value LIKE 'test%'`)
                );
            }
        }

        const results = await Promise.all(queryPromises);
        const endTime = performance.now();
        const totalTime = endTime - startTime;
        const throughput = (results.length / totalTime) * 1000; // queries per second

        // Performance targets
        expect(throughput).toBeGreaterThan(50); // At least 50 QPS
        expect(totalTime).toBeLessThan(10000); // Complete within 10 seconds

        // All queries should succeed
        results.forEach(result => {
            expect(result.error).toBeUndefined();
        });
    });

    it('should demonstrate vector search performance', async () => {
        const vectorCount = 1000;
        const dimension = 256;

        // Insert test vectors
        const insertPromises = [];
        for (let i = 0; i < vectorCount; i++) {
            const vector = Array(dimension).fill(0).map(() => Math.random());
            const query: MultiParadigmQuery = {
                paradigm: DBParadigm.VECTOR,
                operation: 'insert',
                target: `bench-vec-${i}`,
                data: { vector, metadata: { category: i % 10 } }
            };
            insertPromises.push(engine.executeMultiParadigmQuery(query));
        }

        await Promise.all(insertPromises);

        // Perform similarity searches
        const searchStartTime = performance.now();
        const searchVector = Array(dimension).fill(0).map(() => Math.random());

        const searchQuery: MultiParadigmQuery = {
            paradigm: DBParadigm.VECTOR,
            operation: 'search',
            target: '',
            data: { vector: searchVector },
            options: { vectorSimilarityThreshold: 0.3 }
        };

        const searchResult = await engine.executeMultiParadigmQuery(searchQuery);
        const searchTime = performance.now() - searchStartTime;

        // Performance expectations
        expect(searchTime).toBeLessThan(1000); // Search within 1 second
        expect(searchResult).toBeInstanceOf(Array);
        expect(searchResult.length).toBeGreaterThan(0);
    });
});