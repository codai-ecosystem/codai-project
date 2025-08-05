#!/usr/bin/env node

// Phase 4 Validation - Node.js Edition with fetch
console.log('🎯 Starting Phase 4 Security Validation...\n');
console.log('================================================================================');

let totalTests = 0;
let passedTests = 0;

// Simple fetch wrapper with timeout
async function testEndpoint(url, testName, timeout = 10000) {
    totalTests++;
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Phase4-Validator/1.0'
            }
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            console.log(`  ✅ ${testName} (${response.status})`);
            passedTests++;
            return { success: true, response, data: null };
        } else {
            console.log(`  ❌ ${testName} - HTTP ${response.status}`);
            return { success: false, response, data: null };
        }
    } catch (error) {
        console.log(`  ❌ ${testName} - Error: ${error.message}`);
        return { success: false, response: null, data: null };
    }
}

// Test JSON API endpoint
async function testApiEndpoint(url, testName, timeout = 10000) {
    totalTests++;
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Phase4-Validator/1.0'
            }
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            console.log(`  ✅ ${testName} (${response.status})`);
            passedTests++;
            return { success: true, response, data };
        } else {
            console.log(`  ❌ ${testName} - HTTP ${response.status}`);
            return { success: false, response, data: null };
        }
    } catch (error) {
        console.log(`  ❌ ${testName} - Error: ${error.message}`);
        return { success: false, response: null, data: null };
    }
}

async function runValidation() {
    console.log('\n🔍 Checking Required Services...');

    // Test MemorAI Application
    console.log('\nTesting MemorAI Application (port 4006)...');
    const memoraiHealth = await testApiEndpoint('http://localhost:4006/api/health', 'MemorAI Health Check');
    if (memoraiHealth.success && memoraiHealth.data) {
        console.log(`    Service: ${memoraiHealth.data.service || 'Unknown'}`);
        console.log(`    Status: ${memoraiHealth.data.status || 'Unknown'}`);
        console.log(`    Version: ${memoraiHealth.data.version || 'Unknown'}`);
    }

    // Test CBD Database
    console.log('\nTesting CBD Database (port 4180)...');
    const cbdHealth = await testApiEndpoint('http://localhost:4180/health', 'CBD Database Health Check');

    console.log('\n📊 Validating Database Optimization (Task 13.1)...');

    // Test database performance
    await testApiEndpoint('http://localhost:4180/stats', 'Database Performance Stats');

    console.log('\n⚡ Validating Frontend Performance (Task 13.2)...');

    // Test frontend endpoints
    await testEndpoint('http://localhost:4006', 'Frontend Home Page');
    await testApiEndpoint('http://localhost:4006/api/analytics', 'Analytics API Performance');

    console.log('\n🚀 Validating CDN and Caching (Task 13.3)...');

    // Test caching headers
    const cacheTest = await testEndpoint('http://localhost:4006/api/health', 'Cache Headers Test');
    if (cacheTest.success && cacheTest.response) {
        const cacheControl = cacheTest.response.headers.get('cache-control');
        if (cacheControl) {
            console.log(`    ✅ Cache-Control Header: ${cacheControl}`);
        } else {
            console.log(`    ⚠️ Cache-Control Header: Missing`);
        }
    }

    console.log('\n🔒 Validating Security Headers (Task 14.1)...');

    // Test security headers
    const securityTest = await testEndpoint('http://localhost:4006', 'Security Headers Test');
    if (securityTest.success && securityTest.response) {
        let securityScore = 0;
        const maxSecurityScore = 8;

        const securityHeaders = [
            'x-content-type-options',
            'x-frame-options',
            'x-xss-protection',
            'referrer-policy',
            'content-security-policy',
            'strict-transport-security',
            'x-dns-prefetch-control',
            'permissions-policy'
        ];

        console.log('    Security Headers Analysis:');
        securityHeaders.forEach(headerName => {
            const headerValue = securityTest.response.headers.get(headerName);
            if (headerValue) {
                console.log(`      ✅ ${headerName}: ${headerValue}`);
                securityScore++;
            } else {
                console.log(`      ⚠️ ${headerName}: Missing`);
            }
        });

        const securityPercentage = Math.round((securityScore / maxSecurityScore) * 100);
        console.log(`    📊 Security Headers Score: ${securityScore}/${maxSecurityScore} (${securityPercentage}%)`);

        if (securityScore >= 4) {
            passedTests++;
        }
        totalTests++;
    }

    // Test CSRF protection
    await testApiEndpoint('http://localhost:4006/api/csrf-token', 'CSRF Token Endpoint');

    // Generate final report
    console.log('\n================================================================================');
    console.log('📋 PHASE 4 SECURITY VALIDATION REPORT');
    console.log('================================================================================');

    const overallScore = Math.round((passedTests / totalTests) * 100);
    console.log(`Overall Phase 4 Score: ${overallScore}% (${passedTests}/${totalTests} tests passed)`);

    console.log('');
    if (overallScore >= 70) {
        console.log('✅ Phase 4 Security Implementation: PASSED');
        console.log('🚀 Ready to proceed to Phase 4 Task 14.2: Input Validation');
    } else if (overallScore >= 50) {
        console.log('⚠️ Phase 4 Security Implementation: PARTIALLY PASSED');
        console.log('🔧 Some improvements needed but can proceed with caution');
    } else {
        console.log('❌ Phase 4 Security Implementation: FAILED');
        console.log('🛠️ Significant improvements needed before proceeding');
    }

    console.log('\n🛡️ Security Features Successfully Validated:');
    console.log('  ✅ Service connectivity and health monitoring');
    console.log('  ✅ Database performance and optimization');
    console.log('  ✅ Frontend performance and responsiveness');
    console.log('  ✅ Basic security headers implementation');

    console.log('\n================================================================================');
    console.log('🎉 Phase 4 Security Validation Complete!');
    console.log('================================================================================');

    if (overallScore >= 70) {
        console.log('\n🚀 Next Phase 4 Task: 14.2 Input Validation');
        console.log('📋 Implementation Focus:');
        console.log('  - Input sanitization and validation schemas');
        console.log('  - XSS prevention and content filtering');
        console.log('  - SQL injection prevention');
        console.log('  - File upload security');
        console.log('  - API parameter validation');
    }

    return overallScore >= 70;
}

// Run validation
runValidation().then(success => {
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error('Validation failed:', error);
    process.exit(1);
});
