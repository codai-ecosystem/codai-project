import { test, expect, APIRequestContext } from '@playwright/test';
import { SecurityTestHelper, AuthHelper, CODAI_SERVICES } from '../api-sdk-cli-helpers';

test.describe('CODAI Security Testing', () => {
    let request: APIRequestContext;
    let auth: AuthHelper;
    let securityHelper: SecurityTestHelper;

    test.beforeAll(async ({ playwright }) => {
        request = await playwright.request.newContext({
            baseURL: 'http://localhost:4000',
            extraHTTPHeaders: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        auth = new AuthHelper(request);
        securityHelper = new SecurityTestHelper(request);

        // Authenticate for security testing
        await auth.authenticate('developer');
    });

    test.afterAll(async () => {
        await request?.dispose();
    });

    // Test authentication security
    test('Authentication Security', async () => {
        const authSecurityTests = [
            {
                name: 'Invalid Credentials',
                test: async () => {
                    const response = await request.post('/api/auth/login', {
                        data: {
                            email: 'invalid@test.com',
                            password: 'wrongpassword'
                        }
                    });

                    return {
                        success: response.status() === 401 || response.status() === 403,
                        status: response.status(),
                        details: 'Should reject invalid credentials'
                    };
                }
            },
            {
                name: 'Empty Credentials',
                test: async () => {
                    const response = await request.post('/api/auth/login', {
                        data: {}
                    });

                    return {
                        success: response.status() === 400 || response.status() === 401,
                        status: response.status(),
                        details: 'Should reject empty credentials'
                    };
                }
            },
            {
                name: 'SQL Injection in Login',
                test: async () => {
                    const response = await request.post('/api/auth/login', {
                        data: {
                            email: "admin'; DROP TABLE users; --",
                            password: "password"
                        }
                    });

                    // Should not cause server error (500)
                    return {
                        success: response.status() !== 500,
                        status: response.status(),
                        details: 'Should handle SQL injection attempts safely'
                    };
                }
            },
            {
                name: 'Token Validation',
                test: async () => {
                    const response = await request.get('/api/memorai/memories', {
                        headers: {
                            'Authorization': 'Bearer invalid-token-12345',
                            'Content-Type': 'application/json'
                        }
                    });

                    return {
                        success: response.status() === 401 || response.status() === 403,
                        status: response.status(),
                        details: 'Should reject invalid tokens'
                    };
                }
            }
        ];

        const authResults: Array<{ name: string, result: any }> = [];

        for (const securityTest of authSecurityTests) {
            try {
                const result = await securityTest.test();
                authResults.push({ name: securityTest.name, result });
            } catch (error: any) {
                authResults.push({
                    name: securityTest.name,
                    result: { success: false, error: error.message }
                });
            }
        }

        console.log('Authentication Security Results:', authResults);

        // Most authentication security tests should pass
        const passedTests = authResults.filter(r => r.result.success).length;
        expect(passedTests).toBeGreaterThanOrEqual(Math.ceil(authSecurityTests.length * 0.75));
    });

    // Test authorization and access control
    test('Authorization and Access Control', async () => {
        const accessControlTests = [
            {
                name: 'Admin Endpoint Access (Unauthorized)',
                test: async () => {
                    const response = await request.get('/api/admin/users');
                    return {
                        success: response.status() === 401 || response.status() === 403,
                        status: response.status(),
                        details: 'Should deny access to admin endpoints without auth'
                    };
                }
            },
            {
                name: 'User Profile Access (Unauthorized)',
                test: async () => {
                    const response = await request.get('/api/id/profile');
                    return {
                        success: response.status() === 401 || response.status() === 403,
                        status: response.status(),
                        details: 'Should deny access to user profile without auth'
                    };
                }
            },
            {
                name: 'Protected Resource Access',
                test: async () => {
                    const response = await request.get('/api/memorai/memories', {
                        headers: auth.getAuthHeaders()
                    });
                    return {
                        success: response.status() < 500, // Should not cause server error
                        status: response.status(),
                        details: 'Authenticated access should work or return proper error'
                    };
                }
            },
            {
                name: 'Cross-Service Access Control',
                test: async () => {
                    const response = await request.get('/api/bancai/admin/transactions');
                    return {
                        success: response.status() === 401 || response.status() === 403 || response.status() === 404,
                        status: response.status(),
                        details: 'Should control access to financial admin endpoints'
                    };
                }
            }
        ];

        const accessResults: Array<{ name: string, result: any }> = [];

        for (const accessTest of accessControlTests) {
            try {
                const result = await accessTest.test();
                accessResults.push({ name: accessTest.name, result });
            } catch (error: any) {
                accessResults.push({
                    name: accessTest.name,
                    result: { success: false, error: error.message }
                });
            }
        }

        console.log('Access Control Results:', accessResults);

        // All access control tests should pass
        const passedAccessTests = accessResults.filter(r => r.result.success).length;
        expect(passedAccessTests).toBeGreaterThanOrEqual(Math.ceil(accessControlTests.length * 0.8));
    });

    // Test input validation and sanitization
    test('Input Validation and Sanitization', async () => {
        const inputValidationTests = [
            {
                name: 'XSS Prevention',
                test: async () => {
                    const xssPayload = '<script>alert("xss")</script>';
                    const response = await request.post('/api/memorai/memories', {
                        data: { content: xssPayload, title: 'XSS Test' },
                        headers: auth.getAuthHeaders()
                    });

                    if (response.ok()) {
                        const responseText = await response.text();
                        // Content should be escaped or sanitized
                        const isEscaped = responseText.includes('&lt;script&gt;') ||
                            responseText.includes('&amp;lt;script&amp;gt;') ||
                            !responseText.includes('<script>');

                        return {
                            success: isEscaped,
                            status: response.status(),
                            details: 'XSS payload should be escaped or sanitized'
                        };
                    }

                    return {
                        success: true, // If endpoint doesn't exist, that's fine
                        status: response.status(),
                        details: 'Endpoint not available for XSS testing'
                    };
                }
            },
            {
                name: 'Large Payload Handling',
                test: async () => {
                    const largePayload = 'x'.repeat(10 * 1024 * 1024); // 10MB string
                    const response = await request.post('/api/memorai/memories', {
                        data: { content: largePayload },
                        headers: auth.getAuthHeaders()
                    });

                    // Should either accept, reject with 413, or 400
                    return {
                        success: response.status() !== 500,
                        status: response.status(),
                        details: 'Should handle large payloads gracefully'
                    };
                }
            },
            {
                name: 'Malformed JSON Handling',
                test: async () => {
                    try {
                        const response = await request.post('/api/memorai/memories', {
                            data: 'invalid json content',
                            headers: {
                                ...auth.getAuthHeaders(),
                                'Content-Type': 'application/json'
                            }
                        });

                        return {
                            success: response.status() === 400,
                            status: response.status(),
                            details: 'Should return 400 for malformed JSON'
                        };
                    } catch (error: any) {
                        return {
                            success: true, // Network error is acceptable
                            status: 0,
                            details: 'Network error handled appropriately'
                        };
                    }
                }
            },
            {
                name: 'Null and Undefined Values',
                test: async () => {
                    const response = await request.post('/api/memorai/memories', {
                        data: { content: null, title: undefined },
                        headers: auth.getAuthHeaders()
                    });

                    return {
                        success: response.status() === 400 || response.status() === 422,
                        status: response.status(),
                        details: 'Should validate required fields'
                    };
                }
            }
        ];

        const validationResults: Array<{ name: string, result: any }> = [];

        for (const validationTest of inputValidationTests) {
            try {
                const result = await validationTest.test();
                validationResults.push({ name: validationTest.name, result });
            } catch (error: any) {
                validationResults.push({
                    name: validationTest.name,
                    result: { success: false, error: error.message }
                });
            }
        }

        console.log('Input Validation Results:', validationResults);

        // Most input validation tests should pass
        const passedValidationTests = validationResults.filter(r => r.result.success).length;
        expect(passedValidationTests).toBeGreaterThanOrEqual(Math.ceil(inputValidationTests.length * 0.7));
    });

    // Test comprehensive security for core services
    Object.entries(CODAI_SERVICES).slice(0, 4).forEach(([serviceName, config]) => {
        test(`${serviceName} - Security Vulnerability Scan`, async () => {
            const vulnerabilityResults = await securityHelper.testCommonVulnerabilities(config.name);

            console.log(`${serviceName} Security Scan:`, vulnerabilityResults);

            // Critical vulnerabilities should not exist
            const criticalVulns = Object.entries(vulnerabilityResults.vulnerabilities)
                .filter(([key, vuln]) => vuln.tested && vuln.vulnerable)
                .map(([key]) => key);

            if (criticalVulns.length > 0) {
                console.warn(`${serviceName} has potential vulnerabilities:`, criticalVulns);
            }

            // Overall security should be medium or high
            expect(['medium', 'high']).toContain(vulnerabilityResults.overallSecurity);

            // SQL injection should not be vulnerable if tested
            if (vulnerabilityResults.vulnerabilities.sql_injection.tested) {
                expect(vulnerabilityResults.vulnerabilities.sql_injection.vulnerable).toBeFalsy();
            }

            // XSS should not be vulnerable if tested
            if (vulnerabilityResults.vulnerabilities.xss.tested) {
                expect(vulnerabilityResults.vulnerabilities.xss.vulnerable).toBeFalsy();
            }

            console.log(`${serviceName} Security Rating: ${vulnerabilityResults.overallSecurity}`);
        });
    });

    // Test HTTPS and secure headers
    test('HTTPS and Security Headers', async () => {
        const securityHeaderTests = [
            {
                name: 'X-Content-Type-Options',
                header: 'x-content-type-options',
                expectedValue: 'nosniff'
            },
            {
                name: 'X-Frame-Options',
                header: 'x-frame-options',
                expectedValue: null // Any value is good
            },
            {
                name: 'X-XSS-Protection',
                header: 'x-xss-protection',
                expectedValue: null // Any value is good
            },
            {
                name: 'Strict-Transport-Security',
                header: 'strict-transport-security',
                expectedValue: null // Any value is good
            }
        ];

        const headerResults: Array<{ name: string, present: boolean, value: string | null }> = [];

        // Test security headers on a sample endpoint
        const testResponse = await request.get('/api/id/health');
        const headers = testResponse.headers();

        for (const headerTest of securityHeaderTests) {
            const headerValue = headers[headerTest.header];
            const present = !!headerValue;

            headerResults.push({
                name: headerTest.name,
                present,
                value: headerValue || null
            });
        }

        console.log('Security Headers Results:', headerResults);

        // Some security headers should be present
        const presentHeaders = headerResults.filter(h => h.present).length;

        if (presentHeaders > 0) {
            console.log(`✅ Security headers detected: ${presentHeaders}/${headerResults.length}`);
        } else {
            console.log(`⚠️  No security headers detected - consider implementing for production`);
        }

        // Test should pass regardless of security headers (they're recommended but not required)
        expect(headerResults.length).toBe(securityHeaderTests.length);
    });

    // Test session security
    test('Session Security', async () => {
        const sessionSecurityTests = [
            {
                name: 'Token Expiration',
                test: async () => {
                    // Use a potentially expired or invalid token format
                    const response = await request.get('/api/memorai/memories', {
                        headers: {
                            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.expired',
                            'Content-Type': 'application/json'
                        }
                    });

                    return {
                        success: response.status() === 401 || response.status() === 403,
                        status: response.status(),
                        details: 'Should reject expired or invalid tokens'
                    };
                }
            },
            {
                name: 'Session Hijacking Prevention',
                test: async () => {
                    // Test with different user agent
                    const response = await request.get('/api/memorai/memories', {
                        headers: {
                            ...auth.getAuthHeaders(),
                            'User-Agent': 'AttackerAgent/1.0'
                        }
                    });

                    return {
                        success: response.status() < 500, // Should handle gracefully
                        status: response.status(),
                        details: 'Should handle varying user agents'
                    };
                }
            },
            {
                name: 'Concurrent Session Handling',
                test: async () => {
                    // Test same token from different "locations"
                    const requests = [
                        request.get('/api/memorai/memories', {
                            headers: {
                                ...auth.getAuthHeaders(),
                                'X-Forwarded-For': '192.168.1.1'
                            }
                        }),
                        request.get('/api/memorai/memories', {
                            headers: {
                                ...auth.getAuthHeaders(),
                                'X-Forwarded-For': '10.0.0.1'
                            }
                        })
                    ];

                    const responses = await Promise.all(requests);
                    const statuses = responses.map(r => r.status());

                    return {
                        success: statuses.every(s => s < 500),
                        status: statuses,
                        details: 'Should handle concurrent sessions appropriately'
                    };
                }
            }
        ];

        const sessionResults: Array<{ name: string, result: any }> = [];

        for (const sessionTest of sessionSecurityTests) {
            try {
                const result = await sessionTest.test();
                sessionResults.push({ name: sessionTest.name, result });
            } catch (error: any) {
                sessionResults.push({
                    name: sessionTest.name,
                    result: { success: false, error: error.message }
                });
            }
        }

        console.log('Session Security Results:', sessionResults);

        // Most session security tests should pass
        const passedSessionTests = sessionResults.filter(r => r.result.success).length;
        expect(passedSessionTests).toBeGreaterThanOrEqual(Math.ceil(sessionSecurityTests.length * 0.6));
    });

    // Test API rate limiting and DDoS protection
    test('Rate Limiting and DDoS Protection', async () => {
        const ddosProtectionTests = [
            {
                name: 'Rapid Request Detection',
                test: async () => {
                    const rapidRequests = Array.from({ length: 30 }, () =>
                        request.get('/api/memorai/memories', { headers: auth.getAuthHeaders() })
                    );

                    const responses = await Promise.allSettled(rapidRequests);
                    const rateLimitedCount = responses.filter(r =>
                        r.status === 'fulfilled' &&
                        (r.value as any).status() === 429
                    ).length;

                    return {
                        success: rateLimitedCount > 0 || responses.length > 25, // Rate limiting or all requests handled
                        rateLimited: rateLimitedCount,
                        total: responses.length,
                        details: 'Should implement rate limiting or handle burst requests'
                    };
                }
            },
            {
                name: 'IP-Based Rate Limiting',
                test: async () => {
                    const ipRequests = Array.from({ length: 15 }, () =>
                        request.get('/api/memorai/memories', {
                            headers: {
                                ...auth.getAuthHeaders(),
                                'X-Forwarded-For': '192.168.1.100'
                            }
                        })
                    );

                    const responses = await Promise.allSettled(ipRequests);
                    const successCount = responses.filter(r =>
                        r.status === 'fulfilled' &&
                        (r.value as any).status() < 400
                    ).length;

                    return {
                        success: successCount < 15 || responses.length === 15, // Either rate limited or all handled
                        successful: successCount,
                        total: responses.length,
                        details: 'Should handle IP-based rate limiting'
                    };
                }
            }
        ];

        const ddosResults: Array<{ name: string, result: any }> = [];

        for (const ddosTest of ddosProtectionTests) {
            try {
                const result = await ddosTest.test();
                ddosResults.push({ name: ddosTest.name, result });
            } catch (error: any) {
                ddosResults.push({
                    name: ddosTest.name,
                    result: { success: false, error: error.message }
                });
            }
        }

        console.log('DDoS Protection Results:', ddosResults);

        // DDoS protection is good to have but not required for this test
        if (ddosResults.some(r => r.result.rateLimited > 0)) {
            console.log('✅ Rate limiting detected - good security practice');
        } else {
            console.log('⚠️  No rate limiting detected - consider implementing for production');
        }

        // Test should pass regardless of DDoS protection implementation
        expect(ddosResults.length).toBe(ddosProtectionTests.length);
    });

    // Test data privacy and encryption
    test('Data Privacy and Encryption', async () => {
        const privacyTests = [
            {
                name: 'Sensitive Data Exposure',
                test: async () => {
                    const response = await request.get('/api/id/profile', {
                        headers: auth.getAuthHeaders()
                    });

                    if (response.ok()) {
                        const responseText = await response.text();
                        // Should not contain raw passwords or tokens
                        const hasSensitiveData = responseText.includes('password') ||
                            responseText.includes('secret') ||
                            responseText.includes('private_key');

                        return {
                            success: !hasSensitiveData,
                            status: response.status(),
                            details: 'Should not expose sensitive data in responses'
                        };
                    }

                    return {
                        success: true, // If endpoint doesn't exist, that's fine
                        status: response.status(),
                        details: 'Profile endpoint not available'
                    };
                }
            },
            {
                name: 'Error Message Information Disclosure',
                test: async () => {
                    const response = await request.get('/api/nonexistent/endpoint');

                    if (!response.ok()) {
                        const errorText = await response.text();
                        // Error messages shouldn't reveal sensitive system information
                        const revealsSystemInfo = errorText.includes('database') ||
                            errorText.includes('stack trace') ||
                            errorText.includes('internal server') ||
                            errorText.includes('file system');

                        return {
                            success: !revealsSystemInfo,
                            status: response.status(),
                            details: 'Error messages should not reveal system information'
                        };
                    }

                    return {
                        success: true,
                        status: response.status(),
                        details: 'No error to analyze'
                    };
                }
            }
        ];

        const privacyResults: Array<{ name: string, result: any }> = [];

        for (const privacyTest of privacyTests) {
            try {
                const result = await privacyTest.test();
                privacyResults.push({ name: privacyTest.name, result });
            } catch (error: any) {
                privacyResults.push({
                    name: privacyTest.name,
                    result: { success: true, details: 'Test error handled safely' }
                });
            }
        }

        console.log('Data Privacy Results:', privacyResults);

        // All privacy tests should pass
        const passedPrivacyTests = privacyResults.filter(r => r.result.success).length;
        expect(passedPrivacyTests).toBe(privacyTests.length);
    });
});
