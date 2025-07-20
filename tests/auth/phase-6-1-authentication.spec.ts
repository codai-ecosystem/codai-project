import { test, expect, Browser } from '@playwright/test';
import AuthenticationTestSuite from './authentication-test-suite';

let browser: Browser;
let authSuite: AuthenticationTestSuite;

test.beforeAll(async ({ browserName, launchOptions }) => {
    const { chromium } = await import('@playwright/test');
    browser = await chromium.launch(launchOptions);
    authSuite = new AuthenticationTestSuite();
    (authSuite as any).browser = browser;
});

test.afterAll(async () => {
    await browser?.close();
});

test.describe('CODAI Ecosystem Authentication Tests', () => {

    test.beforeEach(async () => {
        await authSuite.setup();
    });

    test.afterEach(async () => {
        await authSuite.teardown();
    });

    test('Phase 6.1.1: Universal Authentication Across All Apps', async () => {
        const results = await authSuite.testUniversalAuthentication();

        // Generate test report
        const totalApps = results.length;
        const successfulApps = results.filter(r => r.success).length;
        const failedApps = results.filter(r => !r.success);
        const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / totalApps;

        console.log('\n📊 UNIVERSAL AUTHENTICATION TEST RESULTS');
        console.log('==========================================');
        console.log(`Total Applications Tested: ${totalApps}`);
        console.log(`Successfully Authenticated: ${successfulApps}`);
        console.log(`Authentication Failures: ${failedApps.length}`);
        console.log(`Success Rate: ${((successfulApps / totalApps) * 100).toFixed(1)}%`);
        console.log(`Average Response Time: ${avgResponseTime.toFixed(0)}ms`);

        if (failedApps.length > 0) {
            console.log('\n❌ FAILED APPLICATIONS:');
            failedApps.forEach(app => {
                console.log(`   ${app.app} (${app.category}): ${app.error}`);
            });
        }

        // Category breakdown
        const categories = [...new Set(results.map(r => r.category))];
        console.log('\n📈 BY CATEGORY:');
        categories.forEach(category => {
            const categoryApps = results.filter(r => r.category === category);
            const categorySuccess = categoryApps.filter(r => r.success).length;
            const categoryRate = ((categorySuccess / categoryApps.length) * 100).toFixed(1);
            console.log(`   ${category}: ${categorySuccess}/${categoryApps.length} (${categoryRate}%)`);
        });

        // Test assertions
        expect(successfulApps).toBeGreaterThanOrEqual(totalApps * 0.9); // 90% success rate minimum
        expect(avgResponseTime).toBeLessThan(5000); // Average response time under 5 seconds

        // Critical applications should all pass
        const criticalApps = ['CODAI Platform', 'ID Service', 'Admin Dashboard', 'Hub'];
        const criticalResults = results.filter(r => criticalApps.includes(r.app));
        const criticalSuccess = criticalResults.filter(r => r.success).length;

        expect(criticalSuccess).toBe(criticalResults.length); // All critical apps must pass
    });

    test('Phase 6.1.2: Cross-Domain Cookie Functionality', async () => {
        const results = await authSuite.testCrossDomainCookies();

        console.log('\n🍪 CROSS-DOMAIN COOKIE TEST RESULTS');
        console.log('====================================');

        results.forEach(result => {
            const status = result.success ? '✅' : '❌';
            console.log(`${status} ${result.test}`);

            if (result.cookies) {
                result.cookies.forEach(cookie => {
                    console.log(`     Cookie: ${cookie.name} (Domain: ${cookie.domain})`);
                });
            }

            if (result.error) {
                console.log(`     Error: ${result.error}`);
            }
        });

        const successfulTests = results.filter(r => r.success).length;
        const successRate = ((successfulTests / results.length) * 100).toFixed(1);

        console.log(`\nOverall Cookie Test Success Rate: ${successRate}%`);

        // Assertions
        expect(successfulTests).toBeGreaterThanOrEqual(results.length * 0.8); // 80% minimum

        // ID Service cookie setting should always work
        const idServiceTest = results.find(r => r.test.includes('ID Service'));
        expect(idServiceTest?.success).toBe(true);
    });

    test('Phase 6.1.3: JWT Token Refresh and Validation', async () => {
        const results = await authSuite.testJWTTokenManagement();

        console.log('\n🔑 JWT TOKEN MANAGEMENT TEST RESULTS');
        console.log('=====================================');
        console.log(`Initial Tokens Present: ${results.initialTokens ? '✅' : '❌'}`);
        console.log(`Token Refresh Successful: ${results.refreshSuccess ? '✅' : '❌'}`);
        console.log(`Tokens Rotated: ${results.tokensRotated ? '✅' : '❌'}`);
        console.log(`Token Validation Passed: ${results.validationPassed ? '✅' : '❌'}`);

        if (results.tokenExpiry) {
            const expiryDate = new Date(results.tokenExpiry * 1000);
            console.log(`Token Expires: ${expiryDate.toISOString()}`);
        }

        if (results.tokenIssuer) {
            console.log(`Token Issuer: ${results.tokenIssuer}`);
        }

        // Assertions
        expect(results.initialTokens).toBe(true);
        expect(results.validationPassed).toBe(true);

        // Token refresh should work (if refresh was attempted)
        if (results.refreshSuccess !== undefined) {
            expect(results.refreshSuccess).toBe(true);
        }
    });

    test('Phase 6.1.4: Authentication Error Handling', async () => {
        const results = await authSuite.testAuthenticationErrorHandling();

        console.log('\n🛡️ AUTHENTICATION ERROR HANDLING TEST RESULTS');
        console.log('================================================');

        results.forEach(result => {
            const status = result.success ? '✅' : '❌';
            console.log(`${status} ${result.test}`);

            if (result.statusCode) {
                console.log(`     Status Code: ${result.statusCode}`);
            }

            if (result.errorMessage) {
                console.log(`     Error Message: ${result.errorMessage}`);
            }

            if (result.redirected !== undefined) {
                console.log(`     Redirected to Login: ${result.redirected ? 'Yes' : 'No'}`);
            }

            if (result.error) {
                console.log(`     Test Error: ${result.error}`);
            }
        });

        const successfulTests = results.filter(r => r.success).length;
        const errorHandlingRate = ((successfulTests / results.length) * 100).toFixed(1);

        console.log(`\nError Handling Success Rate: ${errorHandlingRate}%`);

        // Assertions - Error handling should be robust
        expect(successfulTests).toBe(results.length); // All error scenarios should be handled correctly

        // Specific error handling checks
        const invalidTokenTest = results.find(r => r.test === 'Invalid Token');
        const expiredTokenTest = results.find(r => r.test === 'Expired Token');
        const noTokenTest = results.find(r => r.test === 'No Token');

        expect(invalidTokenTest?.success).toBe(true);
        expect(expiredTokenTest?.success).toBe(true);
        expect(noTokenTest?.success).toBe(true);
    });

    test('Complete Authentication Integration Test', async () => {
        console.log('\n🚀 RUNNING COMPLETE AUTHENTICATION INTEGRATION TEST');
        console.log('====================================================');

        // Run all authentication tests in sequence
        const universalAuthResults = await authSuite.testUniversalAuthentication();
        const crossDomainResults = await authSuite.testCrossDomainCookies();
        const tokenManagementResults = await authSuite.testJWTTokenManagement();
        const errorHandlingResults = await authSuite.testAuthenticationErrorHandling();

        // Calculate overall metrics
        const totalUniversalApps = universalAuthResults.length;
        const successfulUniversalApps = universalAuthResults.filter(r => r.success).length;
        const universalSuccessRate = ((successfulUniversalApps / totalUniversalApps) * 100);

        const totalCookieTests = crossDomainResults.length;
        const successfulCookieTests = crossDomainResults.filter(r => r.success).length;
        const cookieSuccessRate = ((successfulCookieTests / totalCookieTests) * 100);

        const tokenTestsPassed = [
            tokenManagementResults.initialTokens,
            tokenManagementResults.validationPassed,
            tokenManagementResults.refreshSuccess !== false
        ].filter(Boolean).length;
        const tokenSuccessRate = (tokenTestsPassed / 3) * 100;

        const totalErrorTests = errorHandlingResults.length;
        const successfulErrorTests = errorHandlingResults.filter(r => r.success).length;
        const errorHandlingRate = ((successfulErrorTests / totalErrorTests) * 100);

        // Overall authentication system health
        const overallSuccessRate = (
            universalSuccessRate * 0.4 +
            cookieSuccessRate * 0.2 +
            tokenSuccessRate * 0.2 +
            errorHandlingRate * 0.2
        );

        console.log('\n📊 OVERALL AUTHENTICATION SYSTEM HEALTH');
        console.log('========================================');
        console.log(`Universal Authentication: ${universalSuccessRate.toFixed(1)}%`);
        console.log(`Cross-Domain Cookies: ${cookieSuccessRate.toFixed(1)}%`);
        console.log(`Token Management: ${tokenSuccessRate.toFixed(1)}%`);
        console.log(`Error Handling: ${errorHandlingRate.toFixed(1)}%`);
        console.log(`\n🎯 OVERALL AUTHENTICATION SCORE: ${overallSuccessRate.toFixed(1)}%`);

        // Determine authentication system status
        let systemStatus = 'CRITICAL';
        let statusIcon = '🚨';

        if (overallSuccessRate >= 95) {
            systemStatus = 'EXCELLENT';
            statusIcon = '🚀';
        } else if (overallSuccessRate >= 85) {
            systemStatus = 'GOOD';
            statusIcon = '✅';
        } else if (overallSuccessRate >= 75) {
            systemStatus = 'ACCEPTABLE';
            statusIcon = '⚠️';
        }

        console.log(`\n${statusIcon} AUTHENTICATION SYSTEM STATUS: ${systemStatus}`);

        // Final assertions
        expect(overallSuccessRate).toBeGreaterThanOrEqual(85); // Minimum 85% overall success
        expect(universalSuccessRate).toBeGreaterThanOrEqual(90); // Universal auth must be very reliable
        expect(errorHandlingRate).toBeGreaterThanOrEqual(80); // Error handling must be robust

        console.log('\n✅ Phase 6.1: Authentication Testing COMPLETED');
    });

});
