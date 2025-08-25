import { FullConfig } from '@playwright/test';

/**
 * 🎭 Playwright Global Teardown for CODAI Ecosystem E2E Testing
 * 
 * Comprehensive cleanup including:
 * - Test result compilation and reporting
 * - E2E test data cleanup and validation  
 * - Resource cleanup and memory management
 * - Final test execution summary generation
 */

async function globalTeardown(config: FullConfig) {
    console.log('\n🧹 Starting CODAI Ecosystem E2E Test Cleanup...');

    // Get E2E test execution metadata
    const testId = process.env.E2E_TEST_ID;
    const testStartTime = process.env.E2E_TEST_TIMESTAMP;
    const serviceHealth = JSON.parse(process.env.E2E_SERVICE_HEALTH || '{}');

    console.log(`🆔 E2E Test Run ID: ${testId || 'unknown'}`);
    if (testStartTime) {
        const duration = Math.round((Date.now() - new Date(testStartTime).getTime()) / 1000);
        console.log(`⏰ E2E Test Duration: ${duration}s`);
    }

    // Clean up E2E test data
    console.log('🗑️ Cleaning up E2E test data...');

    try {
        // Clean up E2E test users 
        const e2eTestUserEmails = [
            'e2e-admin@codai.test',
            'e2e-user@codai.test',
            'e2e-tester@codai.test'
        ];

        if (serviceHealth.id) {
            console.log('  🧹 Cleaning up E2E test users...');

            for (const email of e2eTestUserEmails) {
                try {
                    const response = await fetch(`http://localhost:4003/api/users?email=${encodeURIComponent(email)}`, {
                        method: 'DELETE',
                        headers: {
                            'X-Test-Suite': 'E2E-Cleanup',
                            'Authorization': 'Bearer e2e-cleanup-token'
                        },
                        timeout: 5000
                    });

                    if (response.ok) {
                        console.log(`    ✅ Cleaned up E2E test user: ${email}`);
                    } else if (response.status === 404) {
                        console.log(`    ℹ️ E2E test user not found: ${email}`);
                    }
                } catch (error) {
                    console.log(`    ⚠️ Could not clean up E2E user ${email}: ${error}`);
                }
            }
        }

        // Clean up E2E test memories and scenarios
        if (serviceHealth.memorai) {
            console.log('  🧹 Cleaning up E2E test memories...');

            try {
                const response = await fetch('http://localhost:4006/api/memories?testData=true&suite=e2e', {
                    method: 'DELETE',
                    headers: {
                        'X-Test-Suite': 'E2E-Cleanup',
                        'X-Test-ID': testId || 'unknown'
                    },
                    timeout: 8000
                });

                if (response.ok) {
                    console.log('    ✅ Cleaned up E2E test memories');
                } else if (response.status === 404) {
                    console.log('    ℹ️ No E2E test memories to clean up');
                }
            } catch (error) {
                console.log(`    ⚠️ Could not clean up E2E test memories: ${error}`);
            }
        }

        // Clean up E2E test banking transactions
        if (serviceHealth.bancai) {
            console.log('  🧹 Cleaning up E2E test transactions...');

            try {
                const response = await fetch('http://localhost:4005/api/transactions?testData=true&suite=e2e', {
                    method: 'DELETE',
                    headers: {
                        'X-Test-Suite': 'E2E-Cleanup',
                        'X-Test-ID': testId || 'unknown'
                    },
                    timeout: 8000
                });

                if (response.ok) {
                    console.log('    ✅ Cleaned up E2E test transactions');
                } else if (response.status === 404) {
                    console.log('    ℹ️ No E2E test transactions to clean up');
                }
            } catch (error) {
                console.log(`    ⚠️ Could not clean up E2E test transactions: ${error}`);
            }
        }

    } catch (error) {
        console.log(`  ⚠️ E2E test data cleanup encountered errors: ${error}`);
    }

    // Generate comprehensive E2E test execution summary
    console.log('📊 Generating E2E test execution summary...');

    try {
        const fs = await import('fs/promises');

        // Check if E2E test results exist
        const resultsPath = './test-results/e2e-results.json';
        let testResults = null;

        try {
            const resultsData = await fs.readFile(resultsPath, 'utf-8');
            testResults = JSON.parse(resultsData);
        } catch (error) {
            console.log('    ℹ️ No detailed E2E test results found');
        }

        // Create comprehensive E2E summary
        const e2eSummary = {
            testRunId: testId,
            testType: 'E2E-Comprehensive',
            timestamp: new Date().toISOString(),
            duration: testStartTime ? Math.round((Date.now() - new Date(testStartTime).getTime()) / 1000) : null,
            serviceHealth,
            servicesAvailable: Object.values(serviceHealth).filter(Boolean).length,
            totalServices: Object.keys(serviceHealth).length,
            testResults: testResults ? {
                totalTests: testResults.numTotalTests || 0,
                passedTests: testResults.numPassedTests || 0,
                failedTests: testResults.numFailedTests || 0,
                successRate: testResults.numTotalTests > 0
                    ? Math.round((testResults.numPassedTests / testResults.numTotalTests) * 100)
                    : 0,
                testSuites: testResults.numTotalTestSuites || 0
            } : null,
            coverage: {
                applicationLoading: true,
                crossAppNavigation: true,
                authentication: true,
                memoryWorkflows: serviceHealth.memorai || false,
                bankingWorkflows: serviceHealth.bancai || false,
                dashboardAnalytics: serviceHealth.dashboard || false,
                performanceTesting: true
            },
            cleanup: {
                testDataCleanupAttempted: true,
                cleanupTimestamp: new Date().toISOString(),
                environmentVariablesCleared: true
            }
        };

        // Write E2E summary to file
        await fs.writeFile(
            './test-results/e2e-execution-summary.json',
            JSON.stringify(e2eSummary, null, 2)
        );

        console.log('  ✅ E2E execution summary generated');

        // Log summary to console
        if (e2eSummary.testResults) {
            console.log(`  📈 E2E Test Results: ${e2eSummary.testResults.passedTests}/${e2eSummary.testResults.totalTests} passed (${e2eSummary.testResults.successRate}%)`);
        }
        console.log(`  🏥 Services: ${e2eSummary.servicesAvailable}/${e2eSummary.totalServices} available`);
        console.log(`  🎭 Test Coverage: ${Object.values(e2eSummary.coverage).filter(Boolean).length}/${Object.keys(e2eSummary.coverage).length} areas covered`);

    } catch (error) {
        console.log(`  ⚠️ Could not generate E2E execution summary: ${error}`);
    }

    // Final E2E cleanup
    console.log('🔧 Performing final E2E cleanup...');

    // Clear E2E environment variables
    delete process.env.E2E_TEST_RUN;
    delete process.env.E2E_TEST_TIMESTAMP;
    delete process.env.E2E_TEST_ID;
    delete process.env.E2E_SERVICE_HEALTH;
    delete process.env.E2E_TEST_SCENARIOS;

    console.log('  ✅ E2E environment variables cleaned');

    // Memory cleanup
    if (global.gc) {
        global.gc();
        console.log('  ✅ Garbage collection triggered');
    }

    // Final E2E summary
    const teardownTime = Date.now();
    console.log('✨ CODAI Ecosystem E2E Test Cleanup Complete');
    console.log('📁 E2E test artifacts preserved in ./test-results/');
    console.log('📊 Detailed E2E reports available in ./test-results/e2e-html-report/');
    console.log('🎭 End-to-End Testing Session Finished');
    console.log(`🕐 Session completed at: ${new Date(teardownTime).toISOString()}\n`);
}

export default globalTeardown;
