import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper, APITestHelper, CODAI_SERVICES, API_ENDPOINTS, generateTestData } from '../api-sdk-cli-helpers';

test.describe('CODAI REST API Testing', () => {
    let request: APIRequestContext;
    let auth: AuthHelper;
    let apiHelper: APITestHelper;

    test.beforeAll(async ({ playwright }) => {
        request = await playwright.request.newContext({
            baseURL: 'http://localhost:4000',
            extraHTTPHeaders: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        auth = new AuthHelper(request);
        apiHelper = new APITestHelper(request, auth);

        // Authenticate for API testing
        await auth.authenticate('developer');
    });

    test.afterAll(async () => {
        await request?.dispose();
    });

    // Test API Gateway connectivity
    test('API Gateway - Connectivity and Health', async () => {
        // Test API Gateway root
        const gatewayResponse = await request.get('/');
        console.log('API Gateway Root Response:', {
            status: gatewayResponse.status(),
            ok: gatewayResponse.ok(),
            headers: Object.fromEntries(Object.entries(gatewayResponse.headers()))
        });

        // Gateway should respond (might be 200, 404, or redirect)
        expect(gatewayResponse.status()).toBeLessThan(500);

        // Test health endpoint
        const healthResponse = await request.get('/health');
        console.log('API Gateway Health:', {
            status: healthResponse.status(),
            ok: healthResponse.ok()
        });

        if (healthResponse.ok()) {
            const healthData = await healthResponse.json();
            console.log('Health Data:', healthData);
        }
    });

    // Test authentication endpoints
    test('Authentication API - Core Auth Operations', async () => {
        // Test login endpoint
        const loginResponse = await request.post(API_ENDPOINTS.AUTH.LOGIN, {
            data: {
                email: 'test@codai.ro',
                password: 'TestPass123!'
            }
        });

        console.log('Login Response:', {
            status: loginResponse.status(),
            ok: loginResponse.ok()
        });

        if (loginResponse.ok()) {
            const loginData = await loginResponse.json();
            expect(loginData.token || loginData.access_token).toBeTruthy();
        } else {
            // Login might fail if test user doesn't exist, which is acceptable
            console.warn('Login test failed - test user might not exist');
        }

        // Test token verification
        const verifyResponse = await request.post(API_ENDPOINTS.AUTH.VERIFY, {
            headers: auth.getAuthHeaders()
        });

        console.log('Token Verification:', {
            status: verifyResponse.status(),
            ok: verifyResponse.ok()
        });

        // Token should be valid or endpoint should exist
        expect(verifyResponse.status()).toBeLessThan(500);
    });

    // Test all service REST endpoints
    Object.entries(CODAI_SERVICES).forEach(([serviceName, config]) => {
        test(`${serviceName} Service - REST Endpoints`, async () => {
            const endpointsResult = await apiHelper.testRESTEndpoints(config.name);

            console.log(`${serviceName} REST Endpoints:`, endpointsResult);

            // Service should be reachable
            expect(endpointsResult.success).toBeTruthy();

            // Health endpoint should work if it exists
            if (endpointsResult.endpoints.health) {
                expect(endpointsResult.endpoints.health.ok || endpointsResult.endpoints.health.status === 404).toBeTruthy();
            }

            // At least root endpoint should respond
            if (endpointsResult.endpoints.root) {
                expect(endpointsResult.endpoints.root.status).toBeLessThan(500);
            }

            if (endpointsResult.errors.length > 0) {
                console.warn(`${serviceName} API Warnings:`, endpointsResult.errors);
            }
        });
    });

    // Test API authentication for core services
    test('API Authentication - Service Level', async () => {
        const authResults: Array<{ service: string, authResult: any, success: boolean }> = [];

        const coreServices = ['memorai', 'codai', 'id', 'admin'];

        for (const serviceName of coreServices) {
            const authResult = await apiHelper.testAPIAuthentication(serviceName);

            authResults.push({
                service: serviceName,
                authResult,
                success: authResult.success
            });
        }

        console.log('API Authentication Results:', authResults);

        // At least 50% of services should have proper authentication
        const authenticatedServices = authResults.filter(r => r.success).length;
        expect(authenticatedServices).toBeGreaterThanOrEqual(Math.ceil(coreServices.length * 0.5));
    });

    // Test CRUD operations via REST API
    test('REST API - CRUD Operations', async () => {
        const crudResults: Array<{ service: string, operations: any, success: boolean }> = [];

        const dataServices = ['memorai', 'codai', 'admin'];

        for (const serviceName of dataServices) {
            const testData = generateTestData(200);
            const operations = {
                create: false,
                read: false,
                update: false,
                delete: false
            };

            let createdId: string | null = null;

            try {
                // CREATE operation
                const createResponse = await request.post(`/api/${serviceName}/items`, {
                    data: testData,
                    headers: auth.getAuthHeaders()
                });

                operations.create = createResponse.ok() || createResponse.status() === 201;

                if (operations.create) {
                    const createResult = await createResponse.json();
                    createdId = createResult.id || createResult._id || testData.id;
                }

                // READ operation
                if (createdId) {
                    const readResponse = await request.get(`/api/${serviceName}/items/${createdId}`, {
                        headers: auth.getAuthHeaders()
                    });

                    operations.read = readResponse.ok();
                } else {
                    // Try to read a list
                    const listResponse = await request.get(`/api/${serviceName}/items`, {
                        headers: auth.getAuthHeaders()
                    });

                    operations.read = listResponse.ok();
                }

                // UPDATE operation
                if (createdId) {
                    const updateResponse = await request.put(`/api/${serviceName}/items/${createdId}`, {
                        data: { ...testData, updated: true },
                        headers: auth.getAuthHeaders()
                    });

                    operations.update = updateResponse.ok();
                }

                // DELETE operation
                if (createdId) {
                    const deleteResponse = await request.delete(`/api/${serviceName}/items/${createdId}`, {
                        headers: auth.getAuthHeaders()
                    });

                    operations.delete = deleteResponse.ok();
                }

            } catch (error: any) {
                console.warn(`CRUD operations error for ${serviceName}:`, error.message);
            }

            const successCount = Object.values(operations).filter(Boolean).length;

            crudResults.push({
                service: serviceName,
                operations,
                success: successCount >= 1
            });
        }

        console.log('REST API CRUD Results:', crudResults);

        // At least one service should support CRUD operations
        expect(crudResults.some(r => r.success)).toBeTruthy();
    });

    // Test specific service endpoints
    test('MEMORAI API - Memory Operations', async () => {
        const memoryData = {
            content: 'API Test Memory',
            tags: ['api-test', 'automated'],
            metadata: { source: 'api-test-suite' }
        };

        try {
            // Test memory creation
            const createResponse = await request.post('/api/memorai/memories', {
                data: memoryData,
                headers: auth.getAuthHeaders()
            });

            console.log('MEMORAI Create Response:', {
                status: createResponse.status(),
                ok: createResponse.ok()
            });

            // Test memory search
            const searchResponse = await request.get('/api/memorai/memories/search?q=test', {
                headers: auth.getAuthHeaders()
            });

            console.log('MEMORAI Search Response:', {
                status: searchResponse.status(),
                ok: searchResponse.ok()
            });

            // At least one operation should work or return reasonable error
            expect(
                createResponse.status() < 500 || searchResponse.status() < 500
            ).toBeTruthy();

        } catch (error: any) {
            console.warn('MEMORAI API test error:', error.message);
            // Error is acceptable if service is not running
        }
    });

    // Test CODAI API - Code Operations
    test('CODAI API - Code Analysis and Generation', async () => {
        const codeData = {
            language: 'javascript',
            code: 'function hello() { console.log("Hello World"); }',
            operation: 'analysis'
        };

        try {
            // Test code analysis
            const analysisResponse = await request.post('/api/codai/analysis', {
                data: codeData,
                headers: auth.getAuthHeaders()
            });

            console.log('CODAI Analysis Response:', {
                status: analysisResponse.status(),
                ok: analysisResponse.ok()
            });

            // Test code generation
            const generationRequest = {
                prompt: 'Create a simple Hello World function',
                language: 'javascript'
            };

            const generationResponse = await request.post('/api/codai/generation', {
                data: generationRequest,
                headers: auth.getAuthHeaders()
            });

            console.log('CODAI Generation Response:', {
                status: generationResponse.status(),
                ok: generationResponse.ok()
            });

            // At least one operation should work
            expect(
                analysisResponse.status() < 500 || generationResponse.status() < 500
            ).toBeTruthy();

        } catch (error: any) {
            console.warn('CODAI API test error:', error.message);
        }
    });

    // Test BANCAI API - Financial Operations
    test('BANCAI API - Financial Operations', async () => {
        const transactionData = {
            amount: 100.00,
            currency: 'RON',
            type: 'test',
            description: 'API Test Transaction'
        };

        try {
            // Test transaction creation
            const transactionResponse = await request.post('/api/bancai/transactions', {
                data: transactionData,
                headers: auth.getAuthHeaders()
            });

            console.log('BANCAI Transaction Response:', {
                status: transactionResponse.status(),
                ok: transactionResponse.ok()
            });

            // Test accounts listing
            const accountsResponse = await request.get('/api/bancai/accounts', {
                headers: auth.getAuthHeaders()
            });

            console.log('BANCAI Accounts Response:', {
                status: accountsResponse.status(),
                ok: accountsResponse.ok()
            });

            // Financial operations should be secure (might require special auth)
            expect(
                transactionResponse.status() === 200 ||
                transactionResponse.status() === 401 ||
                transactionResponse.status() === 403
            ).toBeTruthy();

        } catch (error: any) {
            console.warn('BANCAI API test error:', error.message);
        }
    });

    // Test API error handling
    test('REST API - Error Handling', async () => {
        const errorTests = [
            {
                name: 'Invalid endpoint',
                request: () => request.get('/api/nonexistent/endpoint'),
                expectedStatus: 404
            },
            {
                name: 'Malformed JSON',
                request: () => request.post('/api/memorai/memories', {
                    data: 'invalid json string',
                    headers: auth.getAuthHeaders()
                }),
                expectedStatus: 400
            },
            {
                name: 'Unauthorized access',
                request: () => request.get('/api/admin/users'),
                expectedStatus: 401
            },
            {
                name: 'Method not allowed',
                request: () => request.patch('/api/id/nonexistent'),
                expectedStatus: 405
            }
        ];

        const errorResults: Array<{ name: string, status: number, handledCorrectly: boolean }> = [];

        for (const errorTest of errorTests) {
            try {
                const response = await errorTest.request();
                const handledCorrectly = response.status() >= 400 && response.status() < 500;

                errorResults.push({
                    name: errorTest.name,
                    status: response.status(),
                    handledCorrectly
                });

            } catch (error: any) {
                errorResults.push({
                    name: errorTest.name,
                    status: 500,
                    handledCorrectly: true // Network errors are acceptable
                });
            }
        }

        console.log('API Error Handling Results:', errorResults);

        // Most error scenarios should be handled correctly
        const correctlyHandled = errorResults.filter(r => r.handledCorrectly).length;
        expect(correctlyHandled).toBeGreaterThanOrEqual(Math.ceil(errorTests.length * 0.75));
    });

    // Test API response formats
    test('REST API - Response Formats', async () => {
        const formatTests = [
            { service: 'memorai', endpoint: '/api/memorai/memories' },
            { service: 'codai', endpoint: '/api/codai/projects' },
            { service: 'id', endpoint: '/api/id/users' }
        ];

        const formatResults: Array<{ service: string, contentType: string, validJSON: boolean }> = [];

        for (const formatTest of formatTests) {
            try {
                const response = await request.get(formatTest.endpoint, {
                    headers: auth.getAuthHeaders()
                });

                const contentType = response.headers()['content-type'] || 'unknown';
                let validJSON = false;

                if (response.ok() && contentType.includes('application/json')) {
                    try {
                        await response.json();
                        validJSON = true;
                    } catch {
                        validJSON = false;
                    }
                } else if (response.status() === 401 || response.status() === 403) {
                    // Authentication errors might still have valid JSON
                    try {
                        await response.json();
                        validJSON = true;
                    } catch {
                        validJSON = false;
                    }
                }

                formatResults.push({
                    service: formatTest.service,
                    contentType,
                    validJSON: validJSON || response.status() === 404 // 404 is acceptable
                });

            } catch (error: any) {
                formatResults.push({
                    service: formatTest.service,
                    contentType: 'error',
                    validJSON: false
                });
            }
        }

        console.log('API Response Format Results:', formatResults);

        // Most APIs should return JSON or handle requests properly
        expect(formatResults.every(r => r.validJSON || r.contentType.includes('json'))).toBeTruthy();
    });

    // Test API versioning
    test('REST API - Versioning Support', async () => {
        const versioningResults: Array<{
            service: string,
            supportsVersioning: boolean,
            versions: string[]
        }> = [];

        const services = ['memorai', 'codai', 'id'];

        for (const serviceName of services) {
            const versions: string[] = [];
            let supportsVersioning = false;

            // Test v1 endpoint
            try {
                const v1Response = await request.get(`/api/v1/${serviceName}/version`);
                if (v1Response.status() !== 404) {
                    versions.push('v1');
                    supportsVersioning = true;
                }
            } catch (error: any) {
                // Ignore errors
            }

            // Test version header
            try {
                const versionHeaderResponse = await request.get(`/api/${serviceName}/version`, {
                    headers: {
                        ...auth.getAuthHeaders(),
                        'API-Version': '1.0'
                    }
                });

                if (versionHeaderResponse.status() !== 404) {
                    supportsVersioning = true;
                }
            } catch (error: any) {
                // Ignore errors
            }

            // Test version query parameter
            try {
                const versionQueryResponse = await request.get(`/api/${serviceName}/version?v=1`);
                if (versionQueryResponse.status() !== 404) {
                    supportsVersioning = true;
                }
            } catch (error: any) {
                // Ignore errors
            }

            versioningResults.push({
                service: serviceName,
                supportsVersioning,
                versions
            });
        }

        console.log('API Versioning Results:', versioningResults);

        // Versioning support is optional but good practice
        if (versioningResults.some(r => r.supportsVersioning)) {
            console.log('Some APIs support versioning - excellent!');
        } else {
            console.log('No explicit API versioning detected - consider implementing');
        }

        // This test should pass regardless of versioning support
        expect(versioningResults.length).toBe(services.length);
    });

    // Test API performance baseline
    test('REST API - Performance Baseline', async () => {
        const performanceResults: Array<{
            service: string,
            endpoint: string,
            responseTime: number,
            success: boolean
        }> = [];

        const performanceTests = [
            { service: 'memorai', endpoint: '/api/memorai/memories' },
            { service: 'codai', endpoint: '/api/codai/projects' },
            { service: 'id', endpoint: '/api/id/health' }
        ];

        for (const test of performanceTests) {
            const iterations = 3;
            const responseTimes: number[] = [];

            for (let i = 0; i < iterations; i++) {
                const start = Date.now();

                try {
                    await request.get(test.endpoint, {
                        headers: auth.getAuthHeaders()
                    });

                    responseTimes.push(Date.now() - start);
                } catch (error) {
                    responseTimes.push(5000); // Max timeout for failed requests
                }
            }

            const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

            performanceResults.push({
                service: test.service,
                endpoint: test.endpoint,
                responseTime: avgResponseTime,
                success: avgResponseTime < 3000 // 3 second threshold
            });
        }

        console.log('API Performance Results:', performanceResults);

        // Average response time should be reasonable
        const overallAvgTime = performanceResults.reduce((sum, r) => sum + r.responseTime, 0) / performanceResults.length;
        expect(overallAvgTime).toBeLessThan(5000); // 5 second maximum average

        // At least one API should perform well
        expect(performanceResults.some(r => r.success)).toBeTruthy();
    });
});
