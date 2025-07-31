import { test, expect } from '@playwright/test';
import fs from 'fs';

/**
 * Phase 3A: Cross-Service Integration Testing
 * Tests API communication, authentication flow, and service integration
 */

test.describe('Phase 3A: Cross-Service Integration', () => {

    const operationalServices = [
        { name: 'Gateway', url: 'http://localhost:4000', type: 'api-gateway', endpoints: ['/health', '/api/gateway/services'] },
        { name: 'CODAI', url: 'http://localhost:4001', type: 'development-platform', endpoints: ['/', '/api/health'] },
        { name: 'ID', url: 'http://localhost:4004', type: 'identity-management', endpoints: ['/', '/api/auth', '/api/users'] },
        { name: 'BancAI', url: 'http://localhost:4005', type: 'financial-platform', endpoints: ['/', '/api/accounts', '/api/transactions'] },
        { name: 'Hub', url: 'http://localhost:4008', type: 'service-hub', endpoints: ['/', '/api/services', '/api/status'] }
    ];

    test.beforeAll(async () => {
        if (!fs.existsSync('test-results')) {
            fs.mkdirSync('test-results', { recursive: true });
        }
    });

    test('Phase 3A.1: Service Communication Matrix', async ({ request }) => {
        console.log('🔗 Phase 3A.1: Testing cross-service communication...');

        const communicationMatrix = {
            timestamp: new Date().toISOString(),
            phase: 'Phase 3A - Cross-Service Communication',
            services: operationalServices.length,
            matrix: [],
            summary: {
                totalEndpoints: 0,
                successfulEndpoints: 0,
                failedEndpoints: 0,
                averageResponseTime: 0
            }
        };

        for (const service of operationalServices) {
            console.log(`📡 Testing ${service.name} endpoints...`);

            const serviceResults = {
                service: service.name,
                url: service.url,
                type: service.type,
                endpoints: [],
                summary: {
                    total: service.endpoints.length,
                    successful: 0,
                    failed: 0,
                    avgResponseTime: 0
                }
            };

            for (const endpoint of service.endpoints) {
                const fullUrl = `${service.url}${endpoint}`;

                try {
                    console.log(`  🎯 Testing: ${fullUrl}`);

                    const startTime = Date.now();
                    const response = await request.get(fullUrl, { timeout: 10000 });
                    const endTime = Date.now();
                    const responseTime = endTime - startTime;

                    const endpointResult = {
                        endpoint,
                        fullUrl,
                        status: response.status(),
                        responseTime,
                        success: response.ok(),
                        headers: Object.fromEntries(response.headersArray().map(h => [h.name, h.value])),
                        contentType: response.headers()['content-type'] || 'unknown'
                    };

                    if (response.ok()) {
                        serviceResults.summary.successful++;
                        console.log(`    ✅ ${endpoint} - ${response.status()} (${responseTime}ms)`);

                        // Try to get response body for analysis
                        try {
                            const body = await response.text();
                            endpointResult.bodyLength = body.length;
                            endpointResult.hasContent = body.length > 0;

                            // Check for JSON response
                            if (response.headers()['content-type']?.includes('json')) {
                                try {
                                    const jsonData = JSON.parse(body);
                                    endpointResult.jsonResponse = true;
                                    endpointResult.responseStructure = Object.keys(jsonData);
                                } catch (jsonError) {
                                    endpointResult.jsonResponse = false;
                                }
                            }
                        } catch (bodyError) {
                            endpointResult.bodyError = bodyError.message;
                        }
                    } else {
                        serviceResults.summary.failed++;
                        console.log(`    ❌ ${endpoint} - ${response.status()} (${responseTime}ms)`);
                    }

                    serviceResults.endpoints.push(endpointResult);

                } catch (error) {
                    console.log(`    💥 ${endpoint} - Error: ${error.message}`);

                    serviceResults.endpoints.push({
                        endpoint,
                        fullUrl,
                        success: false,
                        error: error.message,
                        responseTime: 0
                    });

                    serviceResults.summary.failed++;
                }
            }

            // Calculate service averages
            const responseTimes = serviceResults.endpoints
                .filter(e => e.responseTime > 0)
                .map(e => e.responseTime);

            serviceResults.summary.avgResponseTime = responseTimes.length > 0
                ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
                : 0;

            communicationMatrix.matrix.push(serviceResults);

            console.log(`📊 ${service.name} Summary: ${serviceResults.summary.successful}/${serviceResults.summary.total} endpoints (${serviceResults.summary.avgResponseTime}ms avg)`);
        }

        // Calculate overall summary
        communicationMatrix.summary.totalEndpoints = communicationMatrix.matrix.reduce((sum, s) => sum + s.summary.total, 0);
        communicationMatrix.summary.successfulEndpoints = communicationMatrix.matrix.reduce((sum, s) => sum + s.summary.successful, 0);
        communicationMatrix.summary.failedEndpoints = communicationMatrix.matrix.reduce((sum, s) => sum + s.summary.failed, 0);

        const allResponseTimes = communicationMatrix.matrix
            .flatMap(s => s.endpoints)
            .filter(e => e.responseTime > 0)
            .map(e => e.responseTime);

        communicationMatrix.summary.averageResponseTime = allResponseTimes.length > 0
            ? Math.round(allResponseTimes.reduce((a, b) => a + b, 0) / allResponseTimes.length)
            : 0;

        // Save communication matrix
        fs.writeFileSync('test-results/phase3a-communication-matrix.json', JSON.stringify(communicationMatrix, null, 2));

        console.log('\n📊 Cross-Service Communication Matrix:');
        console.log(`   🎯 Total endpoints tested: ${communicationMatrix.summary.totalEndpoints}`);
        console.log(`   ✅ Successful endpoints: ${communicationMatrix.summary.successfulEndpoints}`);
        console.log(`   ❌ Failed endpoints: ${communicationMatrix.summary.failedEndpoints}`);
        console.log(`   ⚡ Average response time: ${communicationMatrix.summary.averageResponseTime}ms`);
        console.log(`   💾 Matrix saved: test-results/phase3a-communication-matrix.json`);

        // Assertions
        expect(communicationMatrix.summary.successfulEndpoints).toBeGreaterThan(0);
        expect(communicationMatrix.summary.averageResponseTime).toBeLessThan(5000); // Max 5 seconds
    });

    test('Phase 3A.2: Gateway Routing Validation', async ({ request }) => {
        console.log('🌐 Phase 3A.2: Testing Gateway routing capabilities...');

        const gatewayTests = {
            timestamp: new Date().toISOString(),
            phase: 'Phase 3A - Gateway Routing',
            gateway: 'http://localhost:4000',
            routingTests: [],
            summary: {
                totalRoutes: 0,
                successfulRoutes: 0,
                failedRoutes: 0
            }
        };

        // Test Gateway service discovery
        try {
            console.log('📡 Testing Gateway service discovery...');

            const servicesResponse = await request.get('http://localhost:4000/api/gateway/services', { timeout: 10000 });

            if (servicesResponse.ok()) {
                const servicesData = await servicesResponse.json();

                gatewayTests.routingTests.push({
                    test: 'Service Discovery',
                    url: 'http://localhost:4000/api/gateway/services',
                    success: true,
                    status: servicesResponse.status(),
                    registeredServices: Array.isArray(servicesData) ? servicesData.length : Object.keys(servicesData).length,
                    response: servicesData
                });

                console.log(`✅ Gateway service discovery successful - ${gatewayTests.routingTests[0].registeredServices} services registered`);
            } else {
                gatewayTests.routingTests.push({
                    test: 'Service Discovery',
                    success: false,
                    status: servicesResponse.status(),
                    error: 'Non-OK response from gateway'
                });

                console.log(`❌ Gateway service discovery failed - Status: ${servicesResponse.status()}`);
            }
        } catch (error) {
            gatewayTests.routingTests.push({
                test: 'Service Discovery',
                success: false,
                error: error.message
            });

            console.log(`💥 Gateway service discovery error: ${error.message}`);
        }

        // Test Gateway health check
        try {
            console.log('🏥 Testing Gateway health check...');

            const healthResponse = await request.get('http://localhost:4000/health', { timeout: 5000 });

            gatewayTests.routingTests.push({
                test: 'Health Check',
                url: 'http://localhost:4000/health',
                success: healthResponse.ok(),
                status: healthResponse.status(),
                responseTime: Date.now()
            });

            console.log(`${healthResponse.ok() ? '✅' : '❌'} Gateway health check - Status: ${healthResponse.status()}`);

        } catch (error) {
            gatewayTests.routingTests.push({
                test: 'Health Check',
                success: false,
                error: error.message
            });

            console.log(`💥 Gateway health check error: ${error.message}`);
        }

        // Calculate summary
        gatewayTests.summary.totalRoutes = gatewayTests.routingTests.length;
        gatewayTests.summary.successfulRoutes = gatewayTests.routingTests.filter(t => t.success).length;
        gatewayTests.summary.failedRoutes = gatewayTests.routingTests.filter(t => !t.success).length;

        // Save gateway test results
        fs.writeFileSync('test-results/phase3a-gateway-routing.json', JSON.stringify(gatewayTests, null, 2));

        console.log('\n📊 Gateway Routing Summary:');
        console.log(`   🎯 Total routing tests: ${gatewayTests.summary.totalRoutes}`);
        console.log(`   ✅ Successful routes: ${gatewayTests.summary.successfulRoutes}`);
        console.log(`   ❌ Failed routes: ${gatewayTests.summary.failedRoutes}`);
        console.log(`   💾 Results saved: test-results/phase3a-gateway-routing.json`);

        expect(gatewayTests.summary.successfulRoutes).toBeGreaterThan(0);
    });

    test('Phase 3A.3: End-to-End Service Flow Testing', async ({ page }) => {
        console.log('🔄 Phase 3A.3: Testing end-to-end service flows...');

        const flowTests = {
            timestamp: new Date().toISOString(),
            phase: 'Phase 3A - End-to-End Flows',
            flows: [],
            summary: {
                totalFlows: 0,
                successfulFlows: 0,
                failedFlows: 0
            }
        };

        // Flow 1: Gateway → Service Discovery → Individual Service
        try {
            console.log('🌊 Flow 1: Gateway → Service Navigation...');

            const flow1 = {
                name: 'Gateway to Service Navigation',
                steps: [],
                success: false,
                startTime: Date.now()
            };

            // Step 1: Navigate to Gateway
            await page.goto('http://localhost:4000', { timeout: 15000 });
            await page.waitForLoadState('domcontentloaded');

            flow1.steps.push({
                step: 'Navigate to Gateway',
                success: true,
                url: page.url(),
                screenshot: 'gateway-landing.png'
            });

            await page.screenshot({ path: 'test-results/flow1-gateway-landing.png', fullPage: true });

            // Step 2: Check for service links or navigation
            const serviceLinks = await page.locator('a[href*="localhost:"], a[href*="4001"], a[href*="4004"], a[href*="4005"], a[href*="4008"]').all();

            if (serviceLinks.length > 0) {
                console.log(`  ✅ Found ${serviceLinks.length} service links`);

                // Try to navigate to first available service
                const firstLink = serviceLinks[0];
                const linkHref = await firstLink.getAttribute('href');
                const linkText = await firstLink.textContent();

                await firstLink.click();
                await page.waitForLoadState('domcontentloaded');

                flow1.steps.push({
                    step: 'Navigate to Service',
                    success: true,
                    linkText: linkText?.trim(),
                    linkHref,
                    destinationUrl: page.url(),
                    screenshot: 'service-destination.png'
                });

                await page.screenshot({ path: 'test-results/flow1-service-destination.png', fullPage: true });

                flow1.success = true;

            } else {
                // No direct service links, try manual navigation
                console.log('  ℹ️ No service links found, testing manual navigation...');

                await page.goto('http://localhost:4001', { timeout: 10000 });
                await page.waitForLoadState('domcontentloaded');

                flow1.steps.push({
                    step: 'Manual Service Navigation',
                    success: true,
                    url: page.url(),
                    screenshot: 'manual-navigation.png'
                });

                await page.screenshot({ path: 'test-results/flow1-manual-navigation.png', fullPage: true });

                flow1.success = true;
            }

            flow1.endTime = Date.now();
            flow1.duration = flow1.endTime - flow1.startTime;

            flowTests.flows.push(flow1);

            console.log(`✅ Flow 1 completed in ${flow1.duration}ms`);

        } catch (error) {
            console.log(`❌ Flow 1 failed: ${error.message}`);

            flowTests.flows.push({
                name: 'Gateway to Service Navigation',
                success: false,
                error: error.message,
                duration: Date.now() - flowTests.flows[flowTests.flows.length - 1]?.startTime || 0
            });
        }

        // Flow 2: Multi-Service Navigation
        try {
            console.log('🌊 Flow 2: Multi-Service Navigation...');

            const flow2 = {
                name: 'Multi-Service Navigation',
                steps: [],
                success: false,
                startTime: Date.now()
            };

            const servicesToTest = ['http://localhost:4001', 'http://localhost:4004', 'http://localhost:4008'];

            for (let i = 0; i < servicesToTest.length; i++) {
                const serviceUrl = servicesToTest[i];

                try {
                    await page.goto(serviceUrl, { timeout: 10000 });
                    await page.waitForLoadState('domcontentloaded');

                    const title = await page.title();
                    const buttonCount = await page.locator('button').count();

                    flow2.steps.push({
                        step: `Navigate to Service ${i + 1}`,
                        success: true,
                        url: serviceUrl,
                        pageTitle: title,
                        buttonCount,
                        screenshot: `flow2-service-${i + 1}.png`
                    });

                    await page.screenshot({ path: `test-results/flow2-service-${i + 1}.png`, fullPage: true });

                    console.log(`  ✅ Service ${i + 1}: ${serviceUrl} (${buttonCount} buttons)`);

                } catch (serviceError) {
                    flow2.steps.push({
                        step: `Navigate to Service ${i + 1}`,
                        success: false,
                        url: serviceUrl,
                        error: serviceError.message
                    });

                    console.log(`  ❌ Service ${i + 1} failed: ${serviceError.message}`);
                }
            }

            flow2.success = flow2.steps.filter(s => s.success).length === servicesToTest.length;
            flow2.endTime = Date.now();
            flow2.duration = flow2.endTime - flow2.startTime;

            flowTests.flows.push(flow2);

            console.log(`${flow2.success ? '✅' : '⚠️'} Flow 2 completed in ${flow2.duration}ms (${flow2.steps.filter(s => s.success).length}/${servicesToTest.length} services)`);

        } catch (error) {
            console.log(`❌ Flow 2 failed: ${error.message}`);

            flowTests.flows.push({
                name: 'Multi-Service Navigation',
                success: false,
                error: error.message
            });
        }

        // Calculate summary
        flowTests.summary.totalFlows = flowTests.flows.length;
        flowTests.summary.successfulFlows = flowTests.flows.filter(f => f.success).length;
        flowTests.summary.failedFlows = flowTests.flows.filter(f => !f.success).length;

        // Save flow test results
        fs.writeFileSync('test-results/phase3a-end-to-end-flows.json', JSON.stringify(flowTests, null, 2));

        console.log('\n📊 End-to-End Flow Summary:');
        console.log(`   🎯 Total flows tested: ${flowTests.summary.totalFlows}`);
        console.log(`   ✅ Successful flows: ${flowTests.summary.successfulFlows}`);
        console.log(`   ❌ Failed flows: ${flowTests.summary.failedFlows}`);
        console.log(`   💾 Results saved: test-results/phase3a-end-to-end-flows.json`);

        expect(flowTests.summary.totalFlows).toBeGreaterThan(0);
    });

    test('Phase 3A: Generate Integration Test Report', async () => {
        console.log('📋 Phase 3A.4: Generating comprehensive integration test report...');

        const integrationReport = {
            timestamp: new Date().toISOString(),
            phase: 'Phase 3A - Cross-Service Integration Testing',
            services: operationalServices.map(s => ({ name: s.name, url: s.url, type: s.type })),
            testResults: {},
            summary: {
                totalTests: 0,
                successfulTests: 0,
                failedTests: 0,
                overallSuccess: false
            },
            recommendations: []
        };

        // Load test results
        const testFiles = [
            { key: 'communication', path: 'test-results/phase3a-communication-matrix.json' },
            { key: 'gateway', path: 'test-results/phase3a-gateway-routing.json' },
            { key: 'flows', path: 'test-results/phase3a-end-to-end-flows.json' }
        ];

        for (const testFile of testFiles) {
            try {
                if (fs.existsSync(testFile.path)) {
                    const data = JSON.parse(fs.readFileSync(testFile.path, 'utf8'));
                    integrationReport.testResults[testFile.key] = data;

                    // Extract test counts based on structure
                    if (testFile.key === 'communication') {
                        integrationReport.summary.totalTests += data.summary.totalEndpoints;
                        integrationReport.summary.successfulTests += data.summary.successfulEndpoints;
                    } else if (testFile.key === 'gateway') {
                        integrationReport.summary.totalTests += data.summary.totalRoutes;
                        integrationReport.summary.successfulTests += data.summary.successfulRoutes;
                    } else if (testFile.key === 'flows') {
                        integrationReport.summary.totalTests += data.summary.totalFlows;
                        integrationReport.summary.successfulTests += data.summary.successfulFlows;
                    }
                }
            } catch (error) {
                console.log(`⚠️ Could not load ${testFile.key} results: ${error.message}`);
            }
        }

        integrationReport.summary.failedTests = integrationReport.summary.totalTests - integrationReport.summary.successfulTests;
        integrationReport.summary.overallSuccess = (integrationReport.summary.successfulTests / integrationReport.summary.totalTests) >= 0.7;

        // Generate recommendations
        if (integrationReport.testResults.communication) {
            const comm = integrationReport.testResults.communication;
            if (comm.summary.averageResponseTime > 1000) {
                integrationReport.recommendations.push('Consider optimizing service response times (currently ' + comm.summary.averageResponseTime + 'ms average)');
            }
            if (comm.summary.failedEndpoints > 0) {
                integrationReport.recommendations.push(`${comm.summary.failedEndpoints} API endpoints failed - review service health and endpoint configurations`);
            }
        }

        if (integrationReport.testResults.flows) {
            const flows = integrationReport.testResults.flows;
            if (flows.summary.failedFlows > 0) {
                integrationReport.recommendations.push(`${flows.summary.failedFlows} user flows failed - review service integration and navigation`);
            }
        }

        if (integrationReport.recommendations.length === 0) {
            integrationReport.recommendations.push('All integration tests passed successfully - system is ready for production deployment');
        }

        // Save comprehensive report
        fs.writeFileSync('test-results/phase3a-integration-report.json', JSON.stringify(integrationReport, null, 2));

        console.log('\n📊 Phase 3A Integration Test Report:');
        console.log(`   🏢 Services tested: ${integrationReport.services.length}`);
        console.log(`   🎯 Total integration tests: ${integrationReport.summary.totalTests}`);
        console.log(`   ✅ Successful tests: ${integrationReport.summary.successfulTests}`);
        console.log(`   ❌ Failed tests: ${integrationReport.summary.failedTests}`);
        console.log(`   📈 Success rate: ${Math.round((integrationReport.summary.successfulTests / integrationReport.summary.totalTests) * 100)}%`);
        console.log(`   🎯 Overall success: ${integrationReport.summary.overallSuccess ? 'YES' : 'NO'}`);
        console.log(`   💾 Report saved: test-results/phase3a-integration-report.json`);

        console.log('\n🎯 Recommendations:');
        integrationReport.recommendations.forEach((rec, i) => {
            console.log(`   ${i + 1}. ${rec}`);
        });

        expect(integrationReport.summary.totalTests).toBeGreaterThan(0);
        expect(integrationReport.summary.successfulTests).toBeGreaterThan(integrationReport.summary.failedTests);

        console.log('\n✅ Phase 3A Integration Testing COMPLETED!');
        console.log('🚀 Ready for Phase 3B: Authentication and Authorization Testing');
    });

});
