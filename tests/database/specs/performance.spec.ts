import { test, expect } from '@playwright/test';
import { AuthHelper, MemoraiHelper, FileHelper, CacheHelper, PerformanceHelper, generateTestData } from '../database-storage-helpers';

test.describe('Database/Storage Performance Testing', () => {
    let auth: AuthHelper;
    let memorai: MemoraiHelper;
    let fileHelper: FileHelper;
    let cacheHelper: CacheHelper;
    let performanceHelper: PerformanceHelper;

    test.beforeAll(async ({ request }) => {
        auth = new AuthHelper();
        await auth.authenticate(request, 'admin');
        memorai = new MemoraiHelper(request, auth);
        fileHelper = new FileHelper(request, auth);
        cacheHelper = new CacheHelper(request, auth);
        performanceHelper = new PerformanceHelper(request);
    });

    test.describe('Load Testing', () => {

        test('should handle load testing for MEMORAI operations', async ({ request }) => {
            console.log('Starting MEMORAI load test...');

            const loadTestResults = await performanceHelper.loadTest(
                'http://localhost:4000/api/memorai/memories',
                5, // 5 concurrent requests
                30000, // 30 seconds
                {
                    method: 'GET',
                    headers: auth.getAuthHeaders()
                }
            );

            console.log('MEMORAI Load Test Results:');
            console.log(`Total Requests: ${loadTestResults.totalRequests}`);
            console.log(`Total Errors: ${loadTestResults.totalErrors}`);
            console.log(`Average Response Time: ${loadTestResults.averageResponseTime}ms`);
            console.log(`Min/Max Response Time: ${loadTestResults.minResponseTime}ms / ${loadTestResults.maxResponseTime}ms`);
            console.log(`Error Rate: ${loadTestResults.errorRate.toFixed(2)}%`);
            console.log(`Requests per Second: ${loadTestResults.requestsPerSecond.toFixed(2)}`);

            // Performance expectations
            expect(loadTestResults.errorRate).toBeLessThan(10); // Less than 10% error rate
            expect(loadTestResults.averageResponseTime).toBeLessThan(2000); // Less than 2 seconds average
            expect(loadTestResults.requestsPerSecond).toBeGreaterThan(1); // At least 1 RPS
        });

        test('should handle concurrent database operations', async ({ request }) => {
            console.log('Starting concurrent database operations test...');

            const concurrentOperations = 10;
            const operations = [];

            // Create concurrent MEMORAI operations
            for (let i = 0; i < concurrentOperations; i++) {
                operations.push(async () => {
                    const testData = generateTestData(1000);
                    testData.title = `Concurrent Test ${i}`;

                    const startTime = Date.now();

                    try {
                        // Create memory
                        const createResponse = await memorai.createMemory(testData, 'memorai');
                        if (!createResponse.ok()) {
                            return { success: false, operation: 'create', time: Date.now() - startTime };
                        }

                        const createdMemory = await createResponse.json();

                        // Read memory
                        const readResponse = await memorai.readMemory(createdMemory.id, 'memorai');
                        if (!readResponse.ok()) {
                            return { success: false, operation: 'read', time: Date.now() - startTime };
                        }

                        // Update memory
                        const updateData = { ...testData, title: `Updated ${i}` };
                        const updateResponse = await memorai.updateMemory(createdMemory.id, updateData, 'memorai');
                        if (!updateResponse.ok()) {
                            return { success: false, operation: 'update', time: Date.now() - startTime };
                        }

                        // Delete memory
                        const deleteResponse = await memorai.deleteMemory(createdMemory.id, 'memorai');
                        if (!deleteResponse.ok()) {
                            return { success: false, operation: 'delete', time: Date.now() - startTime };
                        }

                        return { success: true, operation: 'complete', time: Date.now() - startTime };

                    } catch (error: any) {
                        return { success: false, operation: 'exception', time: Date.now() - startTime, error: error.message };
                    }
                });
            }

            const results = await Promise.all(operations.map(op => op()));
            const successfulOperations = results.filter(r => r.success);
            const averageTime = results.reduce((acc, r) => acc + r.time, 0) / results.length;

            console.log('Concurrent Operations Results:');
            console.log(`Successful Operations: ${successfulOperations.length}/${concurrentOperations}`);
            console.log(`Success Rate: ${(successfulOperations.length / concurrentOperations * 100).toFixed(1)}%`);
            console.log(`Average Operation Time: ${averageTime.toFixed(1)}ms`);

            // Log failed operations
            const failedOperations = results.filter(r => !r.success);
            if (failedOperations.length > 0) {
                console.log('Failed Operations:');
                failedOperations.forEach((fail, index) => {
                    console.log(`  ${index + 1}. ${fail.operation}: ${fail.error || 'Unknown error'} (${fail.time}ms)`);
                });
            }

            expect(successfulOperations.length).toBeGreaterThan(concurrentOperations * 0.80); // 80% success rate
            expect(averageTime).toBeLessThan(5000); // Less than 5 seconds average
        });
    });

    test.describe('Stress Testing', () => {

        test('should handle large data volumes', async ({ request }) => {
            console.log('Starting large data volume test...');

            const largeBatchResults = {
                batchSize: 50,
                successfulCreations: 0,
                successfulReads: 0,
                successfulDeletions: 0,
                totalTime: 0,
                averageItemTime: 0,
                errors: [] as string[]
            };

            const startTime = Date.now();
            const createdIds: string[] = [];

            try {
                // Create large batch of memories
                for (let i = 0; i < largeBatchResults.batchSize; i++) {
                    try {
                        const testData = generateTestData(5000); // 5KB each
                        testData.title = `Large Batch Item ${i}`;

                        const createResponse = await memorai.createMemory(testData, 'memorai');
                        if (createResponse.ok()) {
                            const created = await createResponse.json();
                            createdIds.push(created.id);
                            largeBatchResults.successfulCreations++;
                        } else {
                            largeBatchResults.errors.push(`Create ${i} failed: ${createResponse.status()}`);
                        }

                        // Small delay to avoid overwhelming the service
                        if (i % 10 === 0) {
                            await new Promise(resolve => setTimeout(resolve, 100));
                        }

                    } catch (error: any) {
                        largeBatchResults.errors.push(`Create ${i} exception: ${error.message}`);
                    }
                }

                console.log(`Created ${largeBatchResults.successfulCreations} memories`);

                // Read all created memories
                for (const id of createdIds) {
                    try {
                        const readResponse = await memorai.readMemory(id, 'memorai');
                        if (readResponse.ok()) {
                            largeBatchResults.successfulReads++;
                        } else {
                            largeBatchResults.errors.push(`Read ${id} failed: ${readResponse.status()}`);
                        }
                    } catch (error: any) {
                        largeBatchResults.errors.push(`Read ${id} exception: ${error.message}`);
                    }
                }

                console.log(`Read ${largeBatchResults.successfulReads} memories`);

                // Clean up - delete all created memories
                for (const id of createdIds) {
                    try {
                        const deleteResponse = await memorai.deleteMemory(id, 'memorai');
                        if (deleteResponse.ok()) {
                            largeBatchResults.successfulDeletions++;
                        } else {
                            largeBatchResults.errors.push(`Delete ${id} failed: ${deleteResponse.status()}`);
                        }
                    } catch (error: any) {
                        largeBatchResults.errors.push(`Delete ${id} exception: ${error.message}`);
                    }
                }

                largeBatchResults.totalTime = Date.now() - startTime;
                largeBatchResults.averageItemTime = largeBatchResults.totalTime / largeBatchResults.batchSize;

                console.log('Large Data Volume Results:');
                console.log(`Total Time: ${largeBatchResults.totalTime}ms`);
                console.log(`Average Time per Item: ${largeBatchResults.averageItemTime.toFixed(1)}ms`);
                console.log(`Create Success Rate: ${(largeBatchResults.successfulCreations / largeBatchResults.batchSize * 100).toFixed(1)}%`);
                console.log(`Read Success Rate: ${(largeBatchResults.successfulReads / createdIds.length * 100).toFixed(1)}%`);
                console.log(`Delete Success Rate: ${(largeBatchResults.successfulDeletions / createdIds.length * 100).toFixed(1)}%`);
                console.log(`Total Errors: ${largeBatchResults.errors.length}`);

                if (largeBatchResults.errors.length > 0) {
                    console.log('Sample Errors:', largeBatchResults.errors.slice(0, 5));
                }

                expect(largeBatchResults.successfulCreations).toBeGreaterThan(largeBatchResults.batchSize * 0.85); // 85% creation success
                expect(largeBatchResults.successfulReads).toBeGreaterThan(createdIds.length * 0.90); // 90% read success
                expect(largeBatchResults.averageItemTime).toBeLessThan(1000); // Less than 1 second per item

            } catch (error: any) {
                console.error('Large data volume test failed:', error.message);
                throw error;
            }
        });

        test('should handle memory pressure scenarios', async ({ request }) => {
            console.log('Starting memory pressure test...');

            const memoryPressureResults = {
                largeItemsCreated: 0,
                totalSizeCreated: 0,
                maxItemSizeHandled: 0,
                memoryPressureHandled: false,
                errors: [] as string[]
            };

            // Test with increasingly large items
            const testSizes = [10000, 50000, 100000, 500000]; // 10KB to 500KB
            const createdIds: string[] = [];

            try {
                for (const size of testSizes) {
                    try {
                        const largeData = generateTestData(size);
                        largeData.title = `Memory Pressure Test ${size} bytes`;

                        const createResponse = await memorai.createMemory(largeData, 'memorai');

                        if (createResponse.ok()) {
                            const created = await createResponse.json();
                            createdIds.push(created.id);
                            memoryPressureResults.largeItemsCreated++;
                            memoryPressureResults.totalSizeCreated += size;
                            memoryPressureResults.maxItemSizeHandled = Math.max(memoryPressureResults.maxItemSizeHandled, size);
                        } else if (createResponse.status() === 413) { // Payload Too Large
                            memoryPressureResults.errors.push(`Size limit reached at ${size} bytes`);
                            break;
                        } else {
                            memoryPressureResults.errors.push(`Size ${size} failed: ${createResponse.status()}`);
                        }

                        // Test reading large items
                        if (createdIds.length > 0) {
                            const lastId = createdIds[createdIds.length - 1];
                            const readResponse = await memorai.readMemory(lastId, 'memorai');
                            if (!readResponse.ok()) {
                                memoryPressureResults.errors.push(`Read large item failed: ${readResponse.status()}`);
                            }
                        }

                    } catch (error: any) {
                        memoryPressureResults.errors.push(`Size ${size} exception: ${error.message}`);
                        break;
                    }
                }

                // If we successfully created items, the system handled memory pressure
                memoryPressureResults.memoryPressureHandled = memoryPressureResults.largeItemsCreated > 0;

                // Clean up
                for (const id of createdIds) {
                    try {
                        await memorai.deleteMemory(id, 'memorai');
                    } catch (error) {
                        // Ignore cleanup errors
                    }
                }

                console.log('Memory Pressure Results:');
                console.log(`Large Items Created: ${memoryPressureResults.largeItemsCreated}`);
                console.log(`Total Size Created: ${(memoryPressureResults.totalSizeCreated / 1024).toFixed(1)} KB`);
                console.log(`Max Item Size Handled: ${(memoryPressureResults.maxItemSizeHandled / 1024).toFixed(1)} KB`);
                console.log(`Memory Pressure Handled: ${memoryPressureResults.memoryPressureHandled ? 'Yes' : 'No'}`);
                console.log(`Total Errors: ${memoryPressureResults.errors.length}`);

                if (memoryPressureResults.errors.length > 0) {
                    console.log('Errors:', memoryPressureResults.errors.slice(0, 3));
                }

                expect(memoryPressureResults.memoryPressureHandled).toBe(true);
                expect(memoryPressureResults.maxItemSizeHandled).toBeGreaterThan(10000); // At least 10KB

            } catch (error: any) {
                console.error('Memory pressure test failed:', error.message);
                throw error;
            }
        });
    });

    test.describe('Database Consistency Testing', () => {

        test('should maintain data consistency under concurrent operations', async ({ request }) => {
            console.log('Starting data consistency test...');

            const consistencyResults = {
                totalOperations: 0,
                successfulOperations: 0,
                dataConsistencyMaintained: false,
                consistencyErrors: [] as string[],
                performanceMetrics: {
                    averageCreateTime: 0,
                    averageReadTime: 0,
                    averageUpdateTime: 0
                }
            };

            const testData = generateTestData(2000);
            const numberOfOperations = 20;
            const operations = [];

            // Create concurrent operations that modify the same data
            for (let i = 0; i < numberOfOperations; i++) {
                operations.push(async () => {
                    const operationId = `consistency-test-${i}`;
                    const results = { create: 0, read: 0, update: 0, errors: [] as string[] };

                    try {
                        // Create
                        const createStart = Date.now();
                        const createData = { ...testData, title: `Consistency Test ${i}` };
                        const createResponse = await memorai.createMemory(createData, 'memorai');
                        results.create = Date.now() - createStart;

                        if (!createResponse.ok()) {
                            results.errors.push(`Create failed: ${createResponse.status()}`);
                            return results;
                        }

                        const created = await createResponse.json();

                        // Read
                        const readStart = Date.now();
                        const readResponse = await memorai.readMemory(created.id, 'memorai');
                        results.read = Date.now() - readStart;

                        if (!readResponse.ok()) {
                            results.errors.push(`Read failed: ${readResponse.status()}`);
                            return results;
                        }

                        const readData = await readResponse.json();

                        // Verify data integrity
                        if (readData.title !== createData.title) {
                            results.errors.push('Data integrity check failed');
                        }

                        // Update
                        const updateStart = Date.now();
                        const updateData = { ...createData, title: `Updated ${i}`, version: i };
                        const updateResponse = await memorai.updateMemory(created.id, updateData, 'memorai');
                        results.update = Date.now() - updateStart;

                        if (!updateResponse.ok()) {
                            results.errors.push(`Update failed: ${updateResponse.status()}`);
                            return results;
                        }

                        // Final verification read
                        const verifyResponse = await memorai.readMemory(created.id, 'memorai');
                        if (verifyResponse.ok()) {
                            const verifiedData = await verifyResponse.json();
                            if (verifiedData.version !== i) {
                                results.errors.push('Update verification failed');
                            }
                        }

                        // Clean up
                        await memorai.deleteMemory(created.id, 'memorai');

                    } catch (error: any) {
                        results.errors.push(`Exception: ${error.message}`);
                    }

                    return results;
                });
            }

            const results = await Promise.all(operations.map(op => op()));

            consistencyResults.totalOperations = results.length;
            consistencyResults.successfulOperations = results.filter(r => r.errors.length === 0).length;

            // Calculate performance metrics
            const createTimes = results.map(r => r.create).filter(t => t > 0);
            const readTimes = results.map(r => r.read).filter(t => t > 0);
            const updateTimes = results.map(r => r.update).filter(t => t > 0);

            consistencyResults.performanceMetrics.averageCreateTime = createTimes.reduce((a, b) => a + b, 0) / createTimes.length;
            consistencyResults.performanceMetrics.averageReadTime = readTimes.reduce((a, b) => a + b, 0) / readTimes.length;
            consistencyResults.performanceMetrics.averageUpdateTime = updateTimes.reduce((a, b) => a + b, 0) / updateTimes.length;

            // Collect all errors
            consistencyResults.consistencyErrors = results.flatMap(r => r.errors);

            // Data consistency is maintained if most operations succeeded without consistency errors
            const consistencyErrorCount = consistencyResults.consistencyErrors.filter(e =>
                e.includes('integrity') || e.includes('verification') || e.includes('version')
            ).length;

            consistencyResults.dataConsistencyMaintained = consistencyErrorCount === 0;

            console.log('Data Consistency Results:');
            console.log(`Successful Operations: ${consistencyResults.successfulOperations}/${consistencyResults.totalOperations}`);
            console.log(`Data Consistency Maintained: ${consistencyResults.dataConsistencyMaintained ? 'Yes' : 'No'}`);
            console.log(`Consistency Errors: ${consistencyErrorCount}`);
            console.log(`Average Create Time: ${consistencyResults.performanceMetrics.averageCreateTime.toFixed(1)}ms`);
            console.log(`Average Read Time: ${consistencyResults.performanceMetrics.averageReadTime.toFixed(1)}ms`);
            console.log(`Average Update Time: ${consistencyResults.performanceMetrics.averageUpdateTime.toFixed(1)}ms`);

            if (consistencyResults.consistencyErrors.length > 0) {
                console.log('Sample Consistency Errors:', consistencyResults.consistencyErrors.slice(0, 3));
            }

            expect(consistencyResults.dataConsistencyMaintained).toBe(true);
            expect(consistencyResults.successfulOperations).toBeGreaterThan(consistencyResults.totalOperations * 0.85); // 85% success rate
            expect(consistencyResults.performanceMetrics.averageCreateTime).toBeLessThan(2000); // Less than 2 seconds
        });
    });

    test.describe('Scalability Testing', () => {

        test('should demonstrate horizontal scaling capabilities', async ({ request }) => {
            console.log('Starting scalability test...');

            // This test demonstrates how the system would behave under scaling conditions
            const scalabilityResults = {
                smallLoad: { requests: 10, time: 0, successRate: 0 },
                mediumLoad: { requests: 25, time: 0, successRate: 0 },
                largeLoad: { requests: 50, time: 0, successRate: 0 },
                scalingEfficiency: 0
            };

            // Test different load levels
            const loadLevels = [
                { name: 'smallLoad', requests: 10 },
                { name: 'mediumLoad', requests: 25 },
                { name: 'largeLoad', requests: 50 }
            ];

            for (const load of loadLevels) {
                const startTime = Date.now();
                const operations = [];

                for (let i = 0; i < load.requests; i++) {
                    operations.push(async () => {
                        try {
                            const testData = generateTestData(1000);
                            const response = await memorai.createMemory(testData, 'memorai');
                            return { success: response.ok() };
                        } catch (error) {
                            return { success: false };
                        }
                    });
                }

                const results = await Promise.all(operations.map(op => op()));
                const successCount = results.filter(r => r.success).length;

                const loadResult = scalabilityResults[load.name as keyof typeof scalabilityResults] as any;
                loadResult.time = Date.now() - startTime;
                loadResult.successRate = successCount / load.requests;

                console.log(`${load.name}: ${successCount}/${load.requests} successful (${loadResult.time}ms)`);

                // Wait between load tests
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            // Calculate scaling efficiency (how well performance scales with load)
            const smallThroughput = scalabilityResults.smallLoad.requests / (scalabilityResults.smallLoad.time / 1000);
            const largeThroughput = scalabilityResults.largeLoad.requests / (scalabilityResults.largeLoad.time / 1000);

            scalabilityResults.scalingEfficiency = largeThroughput / smallThroughput;

            console.log('Scalability Results:');
            console.log(`Small Load Throughput: ${smallThroughput.toFixed(2)} req/sec`);
            console.log(`Large Load Throughput: ${largeThroughput.toFixed(2)} req/sec`);
            console.log(`Scaling Efficiency: ${scalabilityResults.scalingEfficiency.toFixed(2)}`);
            console.log(`Small Load Success Rate: ${(scalabilityResults.smallLoad.successRate * 100).toFixed(1)}%`);
            console.log(`Medium Load Success Rate: ${(scalabilityResults.mediumLoad.successRate * 100).toFixed(1)}%`);
            console.log(`Large Load Success Rate: ${(scalabilityResults.largeLoad.successRate * 100).toFixed(1)}%`);

            // Scaling expectations
            expect(scalabilityResults.smallLoad.successRate).toBeGreaterThan(0.90); // 90% success at small load
            expect(scalabilityResults.largeLoad.successRate).toBeGreaterThan(0.75); // 75% success at large load
            expect(scalabilityResults.scalingEfficiency).toBeGreaterThan(0.5); // Should maintain at least 50% efficiency
        });
    });
});
