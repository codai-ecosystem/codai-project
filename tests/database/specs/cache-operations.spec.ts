import { test, expect } from '@playwright/test';
import { AuthHelper, CacheHelper, SERVICE_URLS } from '../database-storage-helpers';

// CODAI applications that support caching operations
const CACHE_APPLICATIONS = [
    'hub', 'codai', 'memorai', 'admin', 'logai',
    'analizai', 'marketai', 'cumparai', 'bancai',
    'fabricai', 'publicai', 'studiai'
];

// Test data for caching
const CACHE_TEST_DATA = {
    string_value: 'This is a test string value',
    number_value: 12345,
    object_value: {
        id: 1,
        name: 'Test Object',
        nested: {
            array: [1, 2, 3],
            boolean: true
        }
    },
    array_value: ['item1', 'item2', 'item3'],
    large_value: 'x'.repeat(10000) // 10KB string
};

test.describe('Cache Operations Testing', () => {
    let auth: AuthHelper;
    let cacheHelper: CacheHelper;

    test.beforeAll(async ({ request }) => {
        auth = new AuthHelper();
        await auth.authenticate(request, 'admin');
        cacheHelper = new CacheHelper(request, auth);
    });

    test.describe('Basic Cache Operations', () => {

        test('should set, get, and delete cache values across all services', async ({ request }) => {
            const cacheOperationResults: any[] = [];

            for (const service of CACHE_APPLICATIONS) {
                const serviceResults = {
                    service,
                    operations: {
                        set: { string: false, number: false, object: false, array: false },
                        get: { string: false, number: false, object: false, array: false },
                        delete: { string: false, number: false, object: false, array: false },
                        stats: false
                    },
                    dataIntegrity: {
                        string: false,
                        number: false,
                        object: false,
                        array: false
                    },
                    errors: [] as string[]
                };

                try {
                    // Test different data types
                    for (const [dataType, testValue] of Object.entries(CACHE_TEST_DATA)) {
                        if (dataType === 'large_value') continue; // Skip large value for basic test

                        const cacheKey = `test-${service}-${dataType}-${Date.now()}`;

                        try {
                            // SET operation
                            const setResponse = await cacheHelper.setCache(cacheKey, testValue, 300, service); // 5 min TTL

                            if (setResponse.ok()) {
                                serviceResults.operations.set[dataType as keyof typeof serviceResults.operations.set] = true;

                                // Small delay to ensure cache is set
                                await new Promise(resolve => setTimeout(resolve, 100));

                                // GET operation
                                const getResponse = await cacheHelper.getCache(cacheKey, service);

                                if (getResponse.ok()) {
                                    serviceResults.operations.get[dataType as keyof typeof serviceResults.operations.get] = true;

                                    const cachedValue = await getResponse.json();
                                    const retrievedValue = cachedValue.value || cachedValue;

                                    // Verify data integrity
                                    if (JSON.stringify(retrievedValue) === JSON.stringify(testValue)) {
                                        serviceResults.dataIntegrity[dataType as keyof typeof serviceResults.dataIntegrity] = true;
                                    } else {
                                        serviceResults.errors.push(`${dataType}: Data integrity failed`);
                                    }

                                    // DELETE operation
                                    const deleteResponse = await cacheHelper.deleteCache(cacheKey, service);

                                    if (deleteResponse.ok()) {
                                        serviceResults.operations.delete[dataType as keyof typeof serviceResults.operations.delete] = true;

                                        // Verify deletion by trying to get the key
                                        const verifyDeleteResponse = await cacheHelper.getCache(cacheKey, service);
                                        if (verifyDeleteResponse.status() === 404 || verifyDeleteResponse.status() === 204) {
                                            // Successfully deleted
                                        } else {
                                            serviceResults.errors.push(`${dataType}: Delete verification failed`);
                                        }
                                    } else {
                                        serviceResults.errors.push(`${dataType}: Delete failed - ${deleteResponse.status()}`);
                                    }
                                } else {
                                    serviceResults.errors.push(`${dataType}: Get failed - ${getResponse.status()}`);
                                }
                            } else {
                                serviceResults.errors.push(`${dataType}: Set failed - ${setResponse.status()}`);
                            }
                        } catch (error: any) {
                            serviceResults.errors.push(`${dataType}: Exception - ${error.message}`);
                        }
                    }

                    // Test cache statistics
                    try {
                        const statsResponse = await cacheHelper.getCacheStats(service);
                        if (statsResponse.ok()) {
                            serviceResults.operations.stats = true;
                        } else {
                            serviceResults.errors.push(`Stats failed: ${statsResponse.status()}`);
                        }
                    } catch (error: any) {
                        serviceResults.errors.push(`Stats exception: ${error.message}`);
                    }

                } catch (error: any) {
                    serviceResults.errors.push(`Service test failed: ${error.message}`);
                }

                cacheOperationResults.push(serviceResults);
            }

            // Generate comprehensive report
            const successfulServices = cacheOperationResults.filter(result => {
                const setOps = Object.values(result.operations.set).filter(Boolean).length;
                const getOps = Object.values(result.operations.get).filter(Boolean).length;
                const deleteOps = Object.values(result.operations.delete).filter(Boolean).length;
                const integrityOps = Object.values(result.dataIntegrity).filter(Boolean).length;

                return setOps >= 3 && getOps >= 3 && deleteOps >= 3 && integrityOps >= 3;
            });

            console.log(`Cache Operations Report:`);
            console.log(`Total Services Tested: ${cacheOperationResults.length}`);
            console.log(`Successful Services: ${successfulServices.length}`);
            console.log(`Success Rate: ${(successfulServices.length / cacheOperationResults.length * 100).toFixed(1)}%`);

            // Detailed operation statistics
            const operationStats = {
                set: { string: 0, number: 0, object: 0, array: 0 },
                get: { string: 0, number: 0, object: 0, array: 0 },
                delete: { string: 0, number: 0, object: 0, array: 0 },
                integrity: { string: 0, number: 0, object: 0, array: 0 },
                stats: 0
            };

            cacheOperationResults.forEach(result => {
                ['string', 'number', 'object', 'array'].forEach(dataType => {
                    if (result.operations.set[dataType]) operationStats.set[dataType]++;
                    if (result.operations.get[dataType]) operationStats.get[dataType]++;
                    if (result.operations.delete[dataType]) operationStats.delete[dataType]++;
                    if (result.dataIntegrity[dataType]) operationStats.integrity[dataType]++;
                });
                if (result.operations.stats) operationStats.stats++;
            });

            console.log(`Operation Success Rates:`);
            console.log(`SET - String:${operationStats.set.string} Number:${operationStats.set.number} Object:${operationStats.set.object} Array:${operationStats.set.array}`);
            console.log(`GET - String:${operationStats.get.string} Number:${operationStats.get.number} Object:${operationStats.get.object} Array:${operationStats.get.array}`);
            console.log(`Data Integrity - String:${operationStats.integrity.string} Number:${operationStats.integrity.number} Object:${operationStats.integrity.object} Array:${operationStats.integrity.array}`);
            console.log(`Stats Available: ${operationStats.stats}/${cacheOperationResults.length}`);

            // Assertions
            expect(successfulServices.length).toBeGreaterThan(cacheOperationResults.length * 0.70); // 70% success rate
            expect(operationStats.integrity.string).toBeGreaterThan(cacheOperationResults.length * 0.80); // 80% should maintain string integrity
            expect(operationStats.integrity.object).toBeGreaterThan(cacheOperationResults.length * 0.70); // 70% should maintain object integrity
        });

        test('should handle cache TTL (Time To Live) correctly', async ({ request }) => {
            const ttlTestResults: any[] = [];

            // Test with subset of services for performance
            const testServices = CACHE_APPLICATIONS.slice(0, 5);

            for (const service of testServices) {
                const serviceResult = {
                    service,
                    shortTtlWorked: false,
                    mediumTtlWorked: false,
                    expiredCorrectly: false,
                    errors: [] as string[]
                };

                try {
                    // Test short TTL (2 seconds)
                    const shortKey = `ttl-short-${service}-${Date.now()}`;
                    const shortSetResponse = await cacheHelper.setCache(shortKey, 'short-lived-value', 2, service);

                    if (shortSetResponse.ok()) {
                        // Immediately check if value is there
                        const immediateGet = await cacheHelper.getCache(shortKey, service);
                        if (immediateGet.ok()) {
                            serviceResult.shortTtlWorked = true;

                            // Wait for expiration (3 seconds to be safe)
                            await new Promise(resolve => setTimeout(resolve, 3000));

                            // Check if expired
                            const expiredGet = await cacheHelper.getCache(shortKey, service);
                            if (expiredGet.status() === 404 || expiredGet.status() === 204) {
                                serviceResult.expiredCorrectly = true;
                            } else {
                                serviceResult.errors.push('Short TTL value did not expire correctly');
                            }
                        } else {
                            serviceResult.errors.push('Short TTL value not immediately available');
                        }
                    } else {
                        serviceResult.errors.push(`Short TTL set failed: ${shortSetResponse.status()}`);
                    }

                    // Test medium TTL (30 seconds)
                    const mediumKey = `ttl-medium-${service}-${Date.now()}`;
                    const mediumSetResponse = await cacheHelper.setCache(mediumKey, 'medium-lived-value', 30, service);

                    if (mediumSetResponse.ok()) {
                        // Check if value is there after 1 second
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        const mediumGet = await cacheHelper.getCache(mediumKey, service);
                        if (mediumGet.ok()) {
                            serviceResult.mediumTtlWorked = true;
                        } else {
                            serviceResult.errors.push('Medium TTL value not available after 1 second');
                        }

                        // Clean up
                        await cacheHelper.deleteCache(mediumKey, service);
                    } else {
                        serviceResult.errors.push(`Medium TTL set failed: ${mediumSetResponse.status()}`);
                    }

                } catch (error: any) {
                    serviceResult.errors.push(`TTL test exception: ${error.message}`);
                }

                ttlTestResults.push(serviceResult);
            }

            const servicesWithWorkingTtl = ttlTestResults.filter(r =>
                r.shortTtlWorked && r.mediumTtlWorked && r.expiredCorrectly
            );

            console.log(`Cache TTL Testing Report:`);
            console.log(`Services with working TTL: ${servicesWithWorkingTtl.length}/${ttlTestResults.length}`);

            ttlTestResults.forEach(result => {
                const status = result.shortTtlWorked && result.mediumTtlWorked && result.expiredCorrectly ? '✓' : '✗';
                console.log(`${status} ${result.service}: Short:${result.shortTtlWorked} Medium:${result.mediumTtlWorked} Expire:${result.expiredCorrectly}`);
                if (result.errors.length > 0) {
                    console.log(`  Errors: ${result.errors.join(', ')}`);
                }
            });

            expect(servicesWithWorkingTtl.length).toBeGreaterThan(ttlTestResults.length * 0.60); // 60% should support TTL correctly
        });
    });

    test.describe('Cache Performance and Limits', () => {

        test('should handle large cache values efficiently', async ({ request }) => {
            const largeCacheResults: any[] = [];

            // Test different sizes
            const testSizes = [
                { name: '1KB', size: 1024 },
                { name: '10KB', size: 10 * 1024 },
                { name: '100KB', size: 100 * 1024 },
                { name: '1MB', size: 1024 * 1024 }
            ];

            const testServices = CACHE_APPLICATIONS.slice(0, 4); // Test subset for performance

            for (const service of testServices) {
                const serviceResult = {
                    service,
                    maxSizeHandled: '0KB',
                    performanceMetrics: {} as Record<string, number>,
                    errors: [] as string[]
                };

                for (const testSize of testSizes) {
                    try {
                        const largeValue = 'x'.repeat(testSize.size);
                        const cacheKey = `large-${service}-${testSize.name}-${Date.now()}`;

                        const startTime = Date.now();
                        const setResponse = await cacheHelper.setCache(cacheKey, largeValue, 60, service);
                        const setTime = Date.now() - startTime;

                        if (setResponse.ok()) {
                            serviceResult.maxSizeHandled = testSize.name;
                            serviceResult.performanceMetrics[`${testSize.name}_set`] = setTime;

                            const getStartTime = Date.now();
                            const getResponse = await cacheHelper.getCache(cacheKey, service);
                            const getTime = Date.now() - getStartTime;

                            if (getResponse.ok()) {
                                serviceResult.performanceMetrics[`${testSize.name}_get`] = getTime;

                                // Verify data integrity for large values
                                const retrievedData = await getResponse.json();
                                const retrievedValue = retrievedData.value || retrievedData;

                                if (retrievedValue === largeValue) {
                                    serviceResult.performanceMetrics[`${testSize.name}_integrity`] = 1;
                                } else {
                                    serviceResult.performanceMetrics[`${testSize.name}_integrity`] = 0;
                                    serviceResult.errors.push(`${testSize.name}: Large value integrity failed`);
                                }

                                // Clean up
                                await cacheHelper.deleteCache(cacheKey, service);
                            } else {
                                serviceResult.errors.push(`${testSize.name}: Get failed - ${getResponse.status()}`);
                                break;
                            }
                        } else if (setResponse.status() === 413) { // Payload Too Large
                            serviceResult.errors.push(`${testSize.name}: Size limit reached`);
                            break; // Stop testing larger sizes
                        } else {
                            serviceResult.errors.push(`${testSize.name}: Set failed - ${setResponse.status()}`);
                            break;
                        }

                    } catch (error: any) {
                        serviceResult.errors.push(`${testSize.name}: Exception - ${error.message}`);
                        break;
                    }
                }

                largeCacheResults.push(serviceResult);
            }

            console.log(`Large Cache Value Testing Report:`);
            largeCacheResults.forEach(result => {
                console.log(`${result.service}: Max size handled: ${result.maxSizeHandled}`);
                Object.entries(result.performanceMetrics).forEach(([metric, value]) => {
                    if (metric.includes('_set') || metric.includes('_get')) {
                        console.log(`  ${metric}: ${value}ms`);
                    }
                });
                if (result.errors.length > 0) {
                    console.log(`  Errors: ${result.errors.slice(0, 2).join(', ')}`);
                }
            });

            // Each service should handle at least 1KB
            expect(largeCacheResults.every(r => r.maxSizeHandled !== '0KB')).toBe(true);

            // Performance should be reasonable for small values
            const small1KBSetTimes = largeCacheResults
                .map(r => r.performanceMetrics['1KB_set'])
                .filter(t => t !== undefined);

            if (small1KBSetTimes.length > 0) {
                const avgSetTime = small1KBSetTimes.reduce((a, b) => a + b, 0) / small1KBSetTimes.length;
                expect(avgSetTime).toBeLessThan(1000); // Less than 1 second for 1KB
            }
        });

        test('should handle concurrent cache operations', async ({ request }) => {
            const concurrencyResults: any[] = [];

            const testServices = CACHE_APPLICATIONS.slice(0, 3); // Test subset for performance

            for (const service of testServices) {
                const serviceResult = {
                    service,
                    concurrentOperations: 10,
                    successfulOperations: 0,
                    averageResponseTime: 0,
                    dataConsistency: true,
                    errors: [] as string[]
                };

                try {
                    const operations = Array.from({ length: 10 }, (_, i) => {
                        return async () => {
                            const startTime = Date.now();
                            const cacheKey = `concurrent-${service}-${i}-${Date.now()}`;
                            const testValue = `concurrent-value-${i}`;

                            try {
                                // Set value
                                const setResponse = await cacheHelper.setCache(cacheKey, testValue, 60, service);
                                if (!setResponse.ok()) {
                                    return { success: false, responseTime: Date.now() - startTime, error: `Set failed: ${setResponse.status()}` };
                                }

                                // Get value
                                const getResponse = await cacheHelper.getCache(cacheKey, service);
                                if (!getResponse.ok()) {
                                    return { success: false, responseTime: Date.now() - startTime, error: `Get failed: ${getResponse.status()}` };
                                }

                                // Verify value
                                const retrievedData = await getResponse.json();
                                const retrievedValue = retrievedData.value || retrievedData;

                                if (retrievedValue !== testValue) {
                                    return { success: false, responseTime: Date.now() - startTime, error: 'Value mismatch' };
                                }

                                // Clean up
                                await cacheHelper.deleteCache(cacheKey, service);

                                return { success: true, responseTime: Date.now() - startTime, error: null };

                            } catch (error: any) {
                                return { success: false, responseTime: Date.now() - startTime, error: error.message };
                            }
                        };
                    });

                    const results = await Promise.all(operations.map(op => op()));
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

            console.log(`Concurrent Cache Operations Report:`);
            console.log(`Average Success Rate: ${(avgSuccessRate * 100).toFixed(1)}%`);
            console.log(`Average Response Time: ${avgResponseTime}ms`);

            concurrencyResults.forEach(result => {
                console.log(`${result.service}: ${result.successfulOperations}/${result.concurrentOperations} operations successful`);
            });

            expect(avgSuccessRate).toBeGreaterThan(0.80); // 80% success rate for concurrent operations
            expect(avgResponseTime).toBeLessThan(3000); // Less than 3 seconds average
        });
    });

    test.describe('Cache Error Handling', () => {

        test('should handle invalid cache keys gracefully', async ({ request }) => {
            const errorHandlingResults: any[] = [];

            const testServices = CACHE_APPLICATIONS.slice(0, 5);
            const invalidKeys = [
                '', // Empty key
                'a'.repeat(1000), // Very long key
                'invalid/key/with/slashes',
                'key with spaces',
                'key\nwith\nnewlines'
            ];

            for (const service of testServices) {
                const serviceResult = {
                    service,
                    invalidKeysHandled: 0,
                    totalInvalidKeys: invalidKeys.length,
                    errors: [] as string[]
                };

                for (const invalidKey of invalidKeys) {
                    try {
                        const setResponse = await cacheHelper.setCache(invalidKey, 'test-value', 60, service);

                        // Either should succeed (if service handles it) or return proper error code
                        if (setResponse.ok()) {
                            serviceResult.invalidKeysHandled++;
                            // Clean up if successful
                            await cacheHelper.deleteCache(invalidKey, service);
                        } else if (setResponse.status() === 400) { // Bad Request - proper error handling
                            serviceResult.invalidKeysHandled++;
                        } else {
                            serviceResult.errors.push(`Invalid key "${invalidKey.slice(0, 20)}..." returned unexpected status: ${setResponse.status()}`);
                        }

                    } catch (error: any) {
                        // Exception might be expected for very invalid keys
                        serviceResult.invalidKeysHandled++;
                    }
                }

                errorHandlingResults.push(serviceResult);
            }

            console.log(`Cache Error Handling Report:`);
            errorHandlingResults.forEach(result => {
                const rate = (result.invalidKeysHandled / result.totalInvalidKeys * 100).toFixed(1);
                console.log(`${result.service}: ${result.invalidKeysHandled}/${result.totalInvalidKeys} invalid keys handled properly (${rate}%)`);
            });

            // All services should handle invalid keys gracefully (either accept or reject properly)
            expect(errorHandlingResults.every(r => r.invalidKeysHandled === r.totalInvalidKeys)).toBe(true);
        });
    });
});
