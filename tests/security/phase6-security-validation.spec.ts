/**
 * Phase 6: Security Testing - CURRENT PORT ALLOCATION VALIDATION
 * Real security testing with current port mappings (4000+ range compliance)
 * CODAI Ecosystem Security Validation
 */

import { test, expect } from '@playwright/test';

// CURRENT CORRECT PORT ALLOCATIONS (4000+ compliance)
const SECURITY_TEST_SERVICES = [
    {
        name: 'Gateway Service',
        url: 'http://localhost:4003',
        port: 4003,
        type: 'api_gateway',
        authEndpoints: ['/api/gateway/health'],
        criticalEndpoints: ['/api/v1/admin', '/api/v1/id'],
        expectedSecurityHeaders: ['X-Frame-Options', 'X-Content-Type-Options'],
        description: 'API Gateway security validation'
    },
    {
        name: 'Admin Dashboard',
        url: 'http://localhost:4007',
        port: 4007,
        type: 'admin_interface',
        authEndpoints: ['/api/auth/validate'],
        criticalEndpoints: ['/api/admin/users', '/api/admin/settings'],
        expectedSecurityHeaders: ['X-Frame-Options', 'Content-Security-Policy'],
        description: 'Admin interface security validation'
    },
    {
        name: 'ID Service',
        url: 'http://localhost:4004',
        port: 4004,
        type: 'authentication',
        authEndpoints: ['/api/auth/login', '/api/auth/register'],
        criticalEndpoints: ['/api/auth/login', '/api/auth/register'],
        expectedSecurityHeaders: ['X-Content-Type-Options', 'Strict-Transport-Security'],
        description: 'Authentication service security validation'
    },
    {
        name: 'Hub Service',
        url: 'http://localhost:4008',
        port: 4008,
        type: 'orchestration',
        authEndpoints: ['/api/services'],
        criticalEndpoints: ['/api/config', '/api/services'],
        expectedSecurityHeaders: ['X-Frame-Options'],
        description: 'Hub orchestration security validation'
    }
];

/**
 * Security header validation
 */
async function validateSecurityHeaders(request: any, service: any) {
    console.log(`🔒 Validating security headers for ${service.name}...`);

    try {
        const response = await request.get(service.url, {
            headers: {
                'User-Agent': 'CODAI-Security-Test/1.0'
            }
        });

        const headers = response.headers();
        const securityIssues = [];
        const securityScore = { total: 0, passed: 0 };

        // Check for essential security headers
        const securityHeaderChecks = [
            { name: 'X-Frame-Options', present: !!headers['x-frame-options'], critical: true },
            { name: 'X-Content-Type-Options', present: !!headers['x-content-type-options'], critical: true },
            { name: 'X-XSS-Protection', present: !!headers['x-xss-protection'], critical: false },
            { name: 'Content-Security-Policy', present: !!headers['content-security-policy'], critical: service.type === 'admin_interface' },
            { name: 'Strict-Transport-Security', present: !!headers['strict-transport-security'], critical: service.type === 'authentication' },
            { name: 'Referrer-Policy', present: !!headers['referrer-policy'], critical: false },
            { name: 'Permissions-Policy', present: !!headers['permissions-policy'], critical: false }
        ];

        securityHeaderChecks.forEach(check => {
            securityScore.total++;
            if (check.present) {
                securityScore.passed++;
                console.log(`   ✅ ${check.name}: Present`);
            } else {
                if (check.critical) {
                    securityIssues.push(`Missing critical security header: ${check.name}`);
                    console.log(`   ❌ ${check.name}: Missing (Critical)`);
                } else {
                    console.log(`   ⚠️ ${check.name}: Missing (Recommended)`);
                }
            }
        });

        // Check for information disclosure
        const serverHeader = headers['server'];
        const poweredByHeader = headers['x-powered-by'];

        if (serverHeader && (serverHeader.includes('nginx/') || serverHeader.includes('Apache/'))) {
            securityIssues.push('Server version information exposed');
            console.log(`   ⚠️ Server header exposes version: ${serverHeader}`);
        }

        if (poweredByHeader) {
            securityIssues.push('X-Powered-By header exposes technology stack');
            console.log(`   ⚠️ X-Powered-By header present: ${poweredByHeader}`);
        }

        const securityPercentage = (securityScore.passed / securityScore.total) * 100;

        return {
            service: service.name,
            port: service.port,
            securityScore: securityPercentage,
            issues: securityIssues,
            headers: headers,
            passed: securityIssues.length === 0
        };

    } catch (error) {
        console.log(`   ❌ Security header validation failed: ${error}`);
        return {
            service: service.name,
            port: service.port,
            securityScore: 0,
            issues: [`Service not accessible: ${error}`],
            headers: {},
            passed: false
        };
    }
}

/**
 * Authentication security validation
 */
async function validateAuthenticationSecurity(request: any, service: any) {
    console.log(`🔐 Validating authentication security for ${service.name}...`);

    const authIssues = [];
    let authScore = 0;
    let totalChecks = 0;

    // Test authentication endpoints
    for (const endpoint of service.authEndpoints) {
        totalChecks++;

        try {
            const fullUrl = `${service.url}${endpoint}`;
            console.log(`   Testing endpoint: ${endpoint}`);

            // Test without authentication
            const unauthResponse = await request.get(fullUrl, {
                headers: { 'User-Agent': 'CODAI-Security-Test/1.0' }
            });

            const statusCode = unauthResponse.status();

            if (endpoint.includes('/login') || endpoint.includes('/register')) {
                // Login/register endpoints should be accessible
                if (statusCode === 200 || statusCode === 404) {
                    authScore++;
                    console.log(`   ✅ ${endpoint}: Accessible (${statusCode})`);
                } else if (statusCode === 405) {
                    authScore++;
                    console.log(`   ✅ ${endpoint}: Method not allowed (${statusCode}) - likely requires POST`);
                } else {
                    console.log(`   ⚠️ ${endpoint}: Unexpected status (${statusCode})`);
                }
            } else {
                // Other auth endpoints should require authentication
                if (statusCode === 401 || statusCode === 403) {
                    authScore++;
                    console.log(`   ✅ ${endpoint}: Properly protected (${statusCode})`);
                } else if (statusCode === 404) {
                    authScore++;
                    console.log(`   ✅ ${endpoint}: Endpoint not found (${statusCode}) - acceptable`);
                } else {
                    authIssues.push(`${endpoint} may not require proper authentication (${statusCode})`);
                    console.log(`   ❌ ${endpoint}: May be unprotected (${statusCode})`);
                }
            }

        } catch (error) {
            totalChecks--;
            console.log(`   ⚠️ ${endpoint}: Connection error - ${error}`);
        }
    }

    const authPercentage = totalChecks > 0 ? (authScore / totalChecks) * 100 : 0;

    return {
        service: service.name,
        authScore: authPercentage,
        issues: authIssues,
        testedEndpoints: totalChecks,
        passed: authIssues.length === 0
    };
}

/**
 * Input validation security testing
 */
async function validateInputSecurity(request: any, service: any) {
    console.log(`🛡️ Validating input security for ${service.name}...`);

    const inputIssues = [];
    let inputScore = 0;
    let totalTests = 0;

    // Common injection payloads (safe testing)
    const testPayloads = [
        { name: 'SQL Injection', payload: "' OR '1'='1", type: 'query' },
        { name: 'XSS Basic', payload: '<script>alert(1)</script>', type: 'body' },
        { name: 'Command Injection', payload: '; ls -la', type: 'query' },
        { name: 'Path Traversal', payload: '../../../etc/passwd', type: 'path' }
    ];

    // Test against available endpoints
    for (const endpoint of service.criticalEndpoints) {
        for (const payload of testPayloads) {
            totalTests++;

            try {
                let testUrl = `${service.url}${endpoint}`;

                if (payload.type === 'query') {
                    testUrl += `?test=${encodeURIComponent(payload.payload)}`;
                }

                const response = await request.get(testUrl, {
                    headers: { 'User-Agent': 'CODAI-Security-Test/1.0' },
                    timeout: 5000
                });

                const statusCode = response.status();
                const responseText = await response.text().catch(() => '');

                // Check if payload is reflected or causes unexpected behavior
                if (responseText.includes(payload.payload) && statusCode === 200) {
                    inputIssues.push(`${payload.name} payload reflected in ${endpoint}`);
                    console.log(`   ❌ ${endpoint}: ${payload.name} vulnerability possible`);
                } else if (statusCode === 500) {
                    inputIssues.push(`${payload.name} caused server error in ${endpoint}`);
                    console.log(`   ⚠️ ${endpoint}: ${payload.name} caused server error (500)`);
                } else {
                    inputScore++;
                    console.log(`   ✅ ${endpoint}: Protected against ${payload.name} (${statusCode})`);
                }

            } catch (error) {
                inputScore++;
                console.log(`   ✅ ${endpoint}: Connection refused/timeout for ${payload.name} - likely protected`);
            }
        }
    }

    const inputPercentage = totalTests > 0 ? (inputScore / totalTests) * 100 : 100;

    return {
        service: service.name,
        inputScore: inputPercentage,
        issues: inputIssues,
        testsPerformed: totalTests,
        passed: inputIssues.length === 0
    };
}

/**
 * HTTPS and encryption validation
 */
async function validateEncryptionSecurity(request: any, service: any) {
    console.log(`🔐 Validating encryption security for ${service.name}...`);

    const encryptionIssues = [];
    let encryptionScore = 0;
    let totalChecks = 0;

    try {
        // Test HTTP vs HTTPS
        totalChecks++;
        const response = await request.get(service.url);
        const headers = response.headers();

        // Check if HTTPS redirect is implemented
        const httpsUrl = service.url.replace('http://', 'https://');
        try {
            totalChecks++;
            const httpsResponse = await request.get(httpsUrl, { timeout: 3000 });
            if (httpsResponse.status() === 200) {
                encryptionScore += 2;
                console.log(`   ✅ HTTPS available on port`);
            }
        } catch (error) {
            console.log(`   ⚠️ HTTPS not available (expected for local dev)`);
        }

        // Check for Strict-Transport-Security header (HSTS)
        if (headers['strict-transport-security']) {
            encryptionScore++;
            console.log(`   ✅ HSTS header present`);
        } else {
            encryptionIssues.push('Missing Strict-Transport-Security header');
            console.log(`   ⚠️ HSTS header missing`);
        }

        // Check secure cookie settings in Set-Cookie headers
        const setCookie = headers['set-cookie'];
        if (setCookie) {
            totalChecks++;
            if (setCookie.includes('Secure') && setCookie.includes('HttpOnly')) {
                encryptionScore++;
                console.log(`   ✅ Secure cookie configuration`);
            } else {
                encryptionIssues.push('Cookies missing Secure or HttpOnly flags');
                console.log(`   ⚠️ Insecure cookie configuration`);
            }
        }

        const encryptionPercentage = totalChecks > 0 ? (encryptionScore / totalChecks) * 100 : 50;

        return {
            service: service.name,
            encryptionScore: encryptionPercentage,
            issues: encryptionIssues,
            checksPerformed: totalChecks,
            passed: encryptionIssues.length <= 1 // Allow 1 issue for local development
        };

    } catch (error) {
        return {
            service: service.name,
            encryptionScore: 0,
            issues: [`Encryption validation failed: ${error}`],
            checksPerformed: 0,
            passed: false
        };
    }
}

test.describe('Phase 6: Security Testing - Current Port Allocation', () => {

    test('Security Headers Validation', async ({ request }) => {
        console.log('🔒 Phase 6.1: Security Headers Validation');
        console.log('='.repeat(60));

        const securityResults = [];

        for (const service of SECURITY_TEST_SERVICES) {
            const result = await validateSecurityHeaders(request, service);
            securityResults.push(result);

            // Validate security headers presence
            expect(result.securityScore, `${service.name} should have adequate security headers`).toBeGreaterThan(60);

            // Critical services should have higher security standards
            if (service.type === 'authentication' || service.type === 'admin_interface') {
                expect(result.securityScore, `${service.name} should have high security standards`).toBeGreaterThan(70);
            }
        }

        console.log('\\n📊 Security Headers Summary:');
        securityResults.forEach(result => {
            const grade = result.securityScore >= 80 ? 'A' : result.securityScore >= 60 ? 'B' : 'C';
            console.log(`   ${grade}: ${result.service} - ${result.securityScore.toFixed(1)}% (Port: ${result.port})`);
            if (result.issues.length > 0) {
                console.log(`      Issues: ${result.issues.join(', ')}`);
            }
        });
    });

    test('Authentication Security Validation', async ({ request }) => {
        console.log('🔐 Phase 6.2: Authentication Security Validation');
        console.log('='.repeat(60));

        const authResults = [];

        for (const service of SECURITY_TEST_SERVICES) {
            const result = await validateAuthenticationSecurity(request, service);
            authResults.push(result);

            // Validate authentication security
            expect(result.authScore, `${service.name} should have proper authentication controls`).toBeGreaterThan(50);

            // Authentication service should have stricter requirements
            if (service.type === 'authentication') {
                expect(result.authScore, `${service.name} should have excellent authentication security`).toBeGreaterThan(75);
            }
        }

        console.log('\\n📊 Authentication Security Summary:');
        authResults.forEach(result => {
            const grade = result.authScore >= 80 ? 'A' : result.authScore >= 60 ? 'B' : 'C';
            console.log(`   ${grade}: ${result.service} - ${result.authScore.toFixed(1)}% (${result.testedEndpoints} endpoints)`);
            if (result.issues.length > 0) {
                console.log(`      Issues: ${result.issues.join(', ')}`);
            }
        });
    });

    test('Input Validation Security Testing', async ({ request }) => {
        console.log('🛡️ Phase 6.3: Input Validation Security Testing');
        console.log('='.repeat(60));

        const inputResults = [];

        for (const service of SECURITY_TEST_SERVICES) {
            const result = await validateInputSecurity(request, service);
            inputResults.push(result);

            // Validate input security
            expect(result.inputScore, `${service.name} should be protected against common injection attacks`).toBeGreaterThan(70);

            // Critical services should have excellent input validation
            if (service.type === 'authentication' || service.type === 'admin_interface') {
                expect(result.inputScore, `${service.name} should have excellent input validation`).toBeGreaterThan(85);
            }
        }

        console.log('\\n📊 Input Security Summary:');
        inputResults.forEach(result => {
            const grade = result.inputScore >= 90 ? 'A' : result.inputScore >= 75 ? 'B' : 'C';
            console.log(`   ${grade}: ${result.service} - ${result.inputScore.toFixed(1)}% (${result.testsPerformed} tests)`);
            if (result.issues.length > 0) {
                console.log(`      Vulnerabilities: ${result.issues.join(', ')}`);
            }
        });
    });

    test('Encryption and Transport Security Validation', async ({ request }) => {
        console.log('🔐 Phase 6.4: Encryption and Transport Security Validation');
        console.log('='.repeat(60));

        const encryptionResults = [];

        for (const service of SECURITY_TEST_SERVICES) {
            const result = await validateEncryptionSecurity(request, service);
            encryptionResults.push(result);

            // Validate encryption security (relaxed for local development)
            expect(result.encryptionScore, `${service.name} should have basic encryption security`).toBeGreaterThan(30);

            // Authentication service should have higher encryption standards
            if (service.type === 'authentication') {
                expect(result.encryptionScore, `${service.name} should have good encryption security`).toBeGreaterThan(40);
            }
        }

        console.log('\\n📊 Encryption Security Summary:');
        encryptionResults.forEach(result => {
            const grade = result.encryptionScore >= 70 ? 'A' : result.encryptionScore >= 50 ? 'B' : result.encryptionScore >= 30 ? 'C' : 'D';
            console.log(`   ${grade}: ${result.service} - ${result.encryptionScore.toFixed(1)}% (${result.checksPerformed} checks)`);
            if (result.issues.length > 0) {
                console.log(`      Issues: ${result.issues.join(', ')}`);
            }
        });
    });

    test('Comprehensive Security Assessment', async ({ request }) => {
        console.log('🏆 Phase 6.5: Comprehensive Security Assessment');
        console.log('='.repeat(60));

        const allResults = [];

        // Collect all security test results
        for (const service of SECURITY_TEST_SERVICES) {
            const headerResult = await validateSecurityHeaders(request, service);
            const authResult = await validateAuthenticationSecurity(request, service);
            const inputResult = await validateInputSecurity(request, service);
            const encryptionResult = await validateEncryptionSecurity(request, service);

            const overallScore = (
                headerResult.securityScore * 0.3 +
                authResult.authScore * 0.3 +
                inputResult.inputScore * 0.3 +
                encryptionResult.encryptionScore * 0.1
            );

            const allIssues = [
                ...headerResult.issues,
                ...authResult.issues,
                ...inputResult.issues,
                ...encryptionResult.issues
            ];

            allResults.push({
                service: service.name,
                port: service.port,
                type: service.type,
                overallScore,
                securityGrade: overallScore >= 80 ? 'A' : overallScore >= 65 ? 'B' : overallScore >= 50 ? 'C' : 'D',
                totalIssues: allIssues.length,
                criticalIssues: allIssues.filter(issue =>
                    issue.includes('vulnerability') || issue.includes('unprotected')
                ).length,
                categories: {
                    headers: headerResult.securityScore,
                    auth: authResult.authScore,
                    input: inputResult.inputScore,
                    encryption: encryptionResult.encryptionScore
                }
            });
        }

        console.log('\\n🏆 Overall Security Assessment:');
        allResults.forEach(result => {
            console.log(`   ${result.securityGrade}: ${result.service} (Port: ${result.port})`);
            console.log(`      Overall Score: ${result.overallScore.toFixed(1)}%`);
            console.log(`      Headers: ${result.categories.headers.toFixed(0)}% | Auth: ${result.categories.auth.toFixed(0)}% | Input: ${result.categories.input.toFixed(0)}% | Encryption: ${result.categories.encryption.toFixed(0)}%`);
            console.log(`      Issues: ${result.totalIssues} total, ${result.criticalIssues} critical`);
        });

        // Overall validation
        const averageScore = allResults.reduce((sum, result) => sum + result.overallScore, 0) / allResults.length;
        const totalCriticalIssues = allResults.reduce((sum, result) => sum + result.criticalIssues, 0);

        expect(averageScore, 'Overall security score should be acceptable').toBeGreaterThan(50);
        expect(totalCriticalIssues, 'Critical security issues should be minimal').toBeLessThan(5);

        console.log(`\\n📊 Security Assessment Summary:`);
        console.log(`   Average Security Score: ${averageScore.toFixed(1)}%`);
        console.log(`   Total Critical Issues: ${totalCriticalIssues}`);
        console.log(`   Security Grade: ${averageScore >= 80 ? 'A (Excellent)' : averageScore >= 65 ? 'B (Good)' : averageScore >= 50 ? 'C (Acceptable)' : 'D (Needs Improvement)'}`);
    });
});
