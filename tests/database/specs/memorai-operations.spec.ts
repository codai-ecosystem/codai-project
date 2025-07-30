import { test, expect } from '@playwright/test';
import { AuthHelper, MemoraiHelper, generateTestData, SERVICE_URLS } from '../database-storage-helpers';

// CODAI applications that use MEMORAI operations
const MEMORAI_APPLICATIONS = [
    'memorai', 'hub', 'codai', 'admin', 'logai',
    'analizai', 'studiai', 'publicai', 'fabricai',
    'cumparai', 'marketai', 'bancai', 'wallet'
];

test.describe('MEMORAI Operations Testing', () => {
    let auth: AuthHelper;
    let memorai: MemoraiHelper;

    test.beforeAll(async ({ request }) => {
        auth = new AuthHelper();
        await auth.authenticate(request, 'admin');
        memorai = new MemoraiHelper(request, auth);
    });

    test.describe('Basic CRUD Operations', () => {

        test('should create, read, update, and delete memories across all services', async ({ request }) => {
            const testResults: any[] = [];

            for (const service of MEMORAI_APPLICATIONS) {
                const serviceResults = {
                    service,
                    operations: {
                        create: false,
                        read: false,
                        update: false,
                        delete: false
                    },
                    errors: [] as string[]
                };

                try {
                    // Test CREATE operation
                    const testData = generateTestData();
                    const createResponse = await memorai.createMemory(testData, service);

                    if (createResponse.ok()) {
                        serviceResults.operations.create = true;
                        const createdMemory = await createResponse.json();
                        const memoryId = createdMemory.id;

                        // Test READ operation
                        const readResponse = await memorai.readMemory(memoryId, service);
                        if (readResponse.ok()) {
                            serviceResults.operations.read = true;

                            // Test UPDATE operation
                            const updatedData = { ...testData, title: 'Updated Title' };
                            const updateResponse = await memorai.updateMemory(memoryId, updatedData, service);
                            if (updateResponse.ok()) {
                                serviceResults.operations.update = true;
                            } else {
                                serviceResults.errors.push(`Update failed: ${updateResponse.status()}`);
                            }

                            // Test DELETE operation
                            const deleteResponse = await memorai.deleteMemory(memoryId, service);
                            if (deleteResponse.ok()) {
                                serviceResults.operations.delete = true;
                            } else {
                                serviceResults.errors.push(`Delete failed: ${deleteResponse.status()}`);
                            }
                        } else {
                            serviceResults.errors.push(`Read failed: ${readResponse.status()}`);
                        }
                    } else {
                        serviceResults.errors.push(`Create failed: ${createResponse.status()}`);
                    }

                } catch (error: any) {
                    serviceResults.errors.push(`Exception: ${error.message}`);
                }

                testResults.push(serviceResults);
            }

            // Generate report
            const successfulServices = testResults.filter(r =>
                r.operations.create && r.operations.read && r.operations.update && r.operations.delete
            );

            console.log(`MEMORAI CRUD Operations Report:`);
            console.log(`Total Services Tested: ${testResults.length}`);
            console.log(`Successful Services: ${successfulServices.length}`);
            console.log(`Success Rate: ${(successfulServices.length / testResults.length * 100).toFixed(1)}%`);

            // Detailed results for failures
            const failedServices = testResults.filter(r =>
                !(r.operations.create && r.operations.read && r.operations.update && r.operations.delete)
            );

            if (failedServices.length > 0) {
                console.log(`Failed Services:`, failedServices);
            }

            // Assertions
            expect(successfulServices.length).toBeGreaterThan(testResults.length * 0.75); // 75% success rate minimum
        });

        test('should handle search operations across all services', async ({ request }) => {
            const searchResults: any[] = [];

            // First, create test data for searching
            const testSearchData = generateTestData();
            testSearchData.title = 'Unique Search Test Data';
            testSearchData.tags = ['unique', 'search', 'test'];

            for (const service of MEMORAI_APPLICATIONS) {
                const serviceResult = {
                    service,
                    dataCreated: false,
                    searchWorked: false,
                    foundResults: 0,
                    errors: [] as string[]
                };

                try {
                    // Create test data
                    const createResponse = await memorai.createMemory(testSearchData, service);
                    if (createResponse.ok()) {
                        serviceResult.dataCreated = true;

                        // Wait a bit for indexing
                        await new Promise(resolve => setTimeout(resolve, 1000));

                        // Test search functionality
                        const searchResponse = await memorai.searchMemories('Unique Search', service);
                        if (searchResponse.ok()) {
                            const searchData = await searchResponse.json();
                            serviceResult.searchWorked = true;
                            serviceResult.foundResults = searchData.results?.length || 0;
                        } else {
                            serviceResult.errors.push(`Search failed: ${searchResponse.status()}`);
                        }
                    } else {
                        serviceResult.errors.push(`Create failed: ${createResponse.status()}`);
                    }

                } catch (error: any) {
                    serviceResult.errors.push(`Exception: ${error.message}`);
                }

                searchResults.push(serviceResult);
            }

            const successfulSearches = searchResults.filter(r => r.searchWorked && r.foundResults > 0);

            console.log(`MEMORAI Search Operations Report:`);
            console.log(`Total Services Tested: ${searchResults.length}`);
            console.log(`Successful Searches: ${successfulSearches.length}`);
            console.log(`Search Success Rate: ${(successfulSearches.length / searchResults.length * 100).toFixed(1)}%`);

            expect(successfulSearches.length).toBeGreaterThan(searchResults.length * 0.6); // 60% minimum for search
        });

        test('should handle bulk operations efficiently', async ({ request }) => {
            const bulkResults: any[] = [];

            // Generate bulk test data
            const bulkData = Array.from({ length: 10 }, (_, i) => ({
                operation: 'create',
                data: generateTestData(500) // 500 chars each
            }));

            for (const service of MEMORAI_APPLICATIONS.slice(0, 5)) { // Test on subset for performance
                const serviceResult = {
                    service,
                    bulkCreateSuccessful: false,
                    responseTime: 0,
                    itemsProcessed: 0,
                    errors: [] as string[]
                };

                try {
                    const startTime = Date.now();
                    const bulkResponse = await memorai.bulkOperations(bulkData, service);
                    serviceResult.responseTime = Date.now() - startTime;

                    if (bulkResponse.ok()) {
                        const bulkResult = await bulkResponse.json();
                        serviceResult.bulkCreateSuccessful = true;
                        serviceResult.itemsProcessed = bulkResult.processed || 0;
                    } else {
                        serviceResult.errors.push(`Bulk operation failed: ${bulkResponse.status()}`);
                    }

                } catch (error: any) {
                    serviceResult.errors.push(`Exception: ${error.message}`);
                }

                bulkResults.push(serviceResult);
            }

            const successfulBulkOps = bulkResults.filter(r => r.bulkCreateSuccessful && r.itemsProcessed >= 8);
            const avgResponseTime = bulkResults.reduce((acc, r) => acc + r.responseTime, 0) / bulkResults.length;

            console.log(`MEMORAI Bulk Operations Report:`);
            console.log(`Total Services Tested: ${bulkResults.length}`);
            console.log(`Successful Bulk Operations: ${successfulBulkOps.length}`);
            console.log(`Average Response Time: ${avgResponseTime}ms`);
            console.log(`Bulk Success Rate: ${(successfulBulkOps.length / bulkResults.length * 100).toFixed(1)}%`);

            expect(successfulBulkOps.length).toBeGreaterThan(bulkResults.length * 0.7); // 70% success rate
            expect(avgResponseTime).toBeLessThan(10000); // Less than 10 seconds average
        });
    });

    test.describe('Error Handling and Edge Cases', () => {

        test('should handle invalid memory IDs gracefully', async ({ request }) => {
            const errorHandlingResults: any[] = [];

            for (const service of MEMORAI_APPLICATIONS.slice(0, 5)) {
                const serviceResult = {
                    service,
                    invalidReadHandled: false,
                    invalidUpdateHandled: false,
                    invalidDeleteHandled: false,
                    errors: [] as string[]
                };

                try {
                    // Test reading non-existent memory
                    const readResponse = await memorai.readMemory('nonexistent-id', service);
                    serviceResult.invalidReadHandled = readResponse.status() === 404;

                    // Test updating non-existent memory
                    const updateResponse = await memorai.updateMemory('nonexistent-id', { title: 'test' }, service);
                    serviceResult.invalidUpdateHandled = updateResponse.status() === 404;

                    // Test deleting non-existent memory
                    const deleteResponse = await memorai.deleteMemory('nonexistent-id', service);
                    serviceResult.invalidDeleteHandled = deleteResponse.status() === 404;

                } catch (error: any) {
                    serviceResult.errors.push(`Exception: ${error.message}`);
                }

                errorHandlingResults.push(serviceResult);
            }

            const properErrorHandling = errorHandlingResults.filter(r =>
                r.invalidReadHandled && r.invalidUpdateHandled && r.invalidDeleteHandled
            );

            console.log(`MEMORAI Error Handling Report:`);
            console.log(`Services with Proper Error Handling: ${properErrorHandling.length}/${errorHandlingResults.length}`);

            expect(properErrorHandling.length).toBe(errorHandlingResults.length);
        });

        test('should handle large memory objects', async ({ request }) => {
            const largeDataResults: any[] = [];

            // Test with different sizes
            const sizes = [10000, 50000, 100000]; // 10KB, 50KB, 100KB

            for (const service of MEMORAI_APPLICATIONS.slice(0, 3)) { // Test subset
                const serviceResult = {
                    service,
                    sizesHandled: [] as number[],
                    maxSizeHandled: 0,
                    errors: [] as string[]
                };

                for (const size of sizes) {
                    try {
                        const largeData = generateTestData(size);
                        const createResponse = await memorai.createMemory(largeData, service);

                        if (createResponse.ok()) {
                            serviceResult.sizesHandled.push(size);
                            serviceResult.maxSizeHandled = Math.max(serviceResult.maxSizeHandled, size);

                            // Clean up
                            const createdMemory = await createResponse.json();
                            await memorai.deleteMemory(createdMemory.id, service);
                        } else {
                            serviceResult.errors.push(`Size ${size} failed: ${createResponse.status()}`);
                        }

                    } catch (error: any) {
                        serviceResult.errors.push(`Size ${size} exception: ${error.message}`);
                    }
                }

                largeDataResults.push(serviceResult);
            }

            console.log(`MEMORAI Large Data Handling Report:`);
            largeDataResults.forEach(result => {
                console.log(`${result.service}: Max size handled: ${result.maxSizeHandled} bytes`);
            });

            // Each service should handle at least 10KB
            expect(largeDataResults.every(r => r.maxSizeHandled >= 10000)).toBe(true);
        });
    });

    test.describe('Performance Testing', () => {

        test('should maintain performance under concurrent operations', async ({ request }) => {
            const concurrencyResults: any[] = [];

            for (const service of MEMORAI_APPLICATIONS.slice(0, 3)) { // Test subset for performance
                const serviceResult = {
                    service,
                    concurrentOperations: 10,
                    successfulOperations: 0,
                    averageResponseTime: 0,
                    errors: [] as string[]
                };

                try {
                    const operations = Array.from({ length: 10 }, async (_, i) => {
                        const startTime = Date.now();
                        const testData = generateTestData(1000);
                        testData.title = `Concurrent Test ${i}`;

                        try {
                            const response = await memorai.createMemory(testData, service);
                            const responseTime = Date.now() - startTime;

                            if (response.ok()) {
                                return { success: true, responseTime };
                            } else {
                                return { success: false, responseTime, error: `Status: ${response.status()}` };
                            }
                        } catch (error: any) {
                            return { success: false, responseTime: Date.now() - startTime, error: error.message };
                        }
                    });

                    const results = await Promise.all(operations);
                    serviceResult.successfulOperations = results.filter(r => r.success).length;
                    serviceResult.averageResponseTime = results.reduce((acc, r) => acc + r.responseTime, 0) / results.length;
                    serviceResult.errors = results.filter(r => !r.success).map(r => r.error || 'Unknown error');

                } catch (error: any) {
                    serviceResult.errors.push(`Concurrency test failed: ${error.message}`);
                }

                concurrencyResults.push(serviceResult);
            }

            const avgSuccessRate = concurrencyResults.reduce((acc, r) => acc + (r.successfulOperations / r.concurrentOperations), 0) / concurrencyResults.length;
            const avgResponseTime = concurrencyResults.reduce((acc, r) => acc + r.averageResponseTime, 0) / concurrencyResults.length;

            console.log(`MEMORAI Concurrency Performance Report:`);
            console.log(`Average Success Rate: ${(avgSuccessRate * 100).toFixed(1)}%`);
            console.log(`Average Response Time: ${avgResponseTime}ms`);

            expect(avgSuccessRate).toBeGreaterThan(0.8); // 80% success rate under concurrency
            expect(avgResponseTime).toBeLessThan(5000); // Less than 5 seconds average
        });
    });
});
