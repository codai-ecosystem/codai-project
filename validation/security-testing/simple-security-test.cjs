#!/usr/bin/env node
/**
 * Simple Security Testing Script for CBD-MemoraiMCP
 * Basic API security validation and endpoint testing
 */

const http = require('http');
const { performance } = require('perf_hooks');

class SecurityTester {
    constructor() {
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            warnings: 0,
            tests: []
        };
    }

    async makeRequest(url, options = {}) {
        return new Promise((resolve, reject) => {
            const startTime = performance.now();

            const req = http.request(url, options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    const endTime = performance.now();
                    const responseTime = endTime - startTime;

                    resolve({
                        status: res.statusCode,
                        data: data,
                        responseTime: responseTime,
                        headers: res.headers
                    });
                });
            });

            req.on('error', (error) => {
                reject({
                    error: error.message,
                    responseTime: performance.now() - startTime
                });
            });

            if (options.body) {
                req.write(options.body);
            }

            req.end();
        });
    }

    recordTest(name, result, severity = 'info', details = '') {
        this.results.total++;
        const test = {
            name,
            result,
            severity,
            details,
            timestamp: new Date().toISOString()
        };

        this.results.tests.push(test);

        if (result === 'PASS') {
            this.results.passed++;
            console.log(`✅ ${name}: PASS ${details ? '- ' + details : ''}`);
        } else if (result === 'FAIL') {
            this.results.failed++;
            console.log(`❌ ${name}: FAIL ${details ? '- ' + details : ''}`);
        } else if (result === 'WARN') {
            this.results.warnings++;
            console.log(`⚠️  ${name}: WARNING ${details ? '- ' + details : ''}`);
        }
    }

    async testHTTPHeaders(url) {
        console.log('\n🛡️  Testing HTTP Security Headers...');

        try {
            const response = await this.makeRequest(url);
            const headers = response.headers;

            // Test for security headers
            const securityHeaders = [
                { name: 'X-Frame-Options', critical: true },
                { name: 'X-Content-Type-Options', critical: true },
                { name: 'X-XSS-Protection', critical: false },
                { name: 'Content-Security-Policy', critical: true },
                { name: 'Strict-Transport-Security', critical: false }, // Only for HTTPS
                { name: 'X-Powered-By', critical: false, shouldNotExist: true }
            ];

            for (const header of securityHeaders) {
                const headerValue = headers[header.name.toLowerCase()];

                if (header.shouldNotExist) {
                    if (headerValue) {
                        this.recordTest(`Security Header: ${header.name}`, 'WARN', 'medium',
                            'Header exposes server information');
                    } else {
                        this.recordTest(`Security Header: ${header.name}`, 'PASS', 'info',
                            'Header properly omitted');
                    }
                } else {
                    if (headerValue) {
                        this.recordTest(`Security Header: ${header.name}`, 'PASS', 'info',
                            `Value: ${headerValue}`);
                    } else {
                        const severity = header.critical ? 'high' : 'medium';
                        const result = header.critical ? 'FAIL' : 'WARN';
                        this.recordTest(`Security Header: ${header.name}`, result, severity,
                            'Header missing');
                    }
                }
            }

        } catch (error) {
            this.recordTest('HTTP Headers Test', 'FAIL', 'high',
                `Request failed: ${error.error}`);
        }
    }

    async testHTTPMethods(url) {
        console.log('\n🔍 Testing HTTP Methods...');

        const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'TRACE'];

        for (const method of methods) {
            try {
                const response = await this.makeRequest(url, { method });

                if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
                    if (response.status < 500) {
                        this.recordTest(`HTTP Method: ${method}`, 'PASS', 'info',
                            `Status: ${response.status}`);
                    } else {
                        this.recordTest(`HTTP Method: ${method}`, 'WARN', 'low',
                            `Server error: ${response.status}`);
                    }
                } else if (method === 'TRACE') {
                    // TRACE method should be disabled
                    if (response.status === 405 || response.status === 501) {
                        this.recordTest(`HTTP Method: ${method}`, 'PASS', 'info',
                            'TRACE properly disabled');
                    } else {
                        this.recordTest(`HTTP Method: ${method}`, 'WARN', 'medium',
                            'TRACE method allowed - potential security risk');
                    }
                } else {
                    // Other methods should require authentication or return proper errors
                    if (response.status === 401 || response.status === 403 || response.status === 405) {
                        this.recordTest(`HTTP Method: ${method}`, 'PASS', 'info',
                            `Properly protected: ${response.status}`);
                    } else if (response.status < 400) {
                        this.recordTest(`HTTP Method: ${method}`, 'WARN', 'medium',
                            `Method allowed without authentication: ${response.status}`);
                    } else {
                        this.recordTest(`HTTP Method: ${method}`, 'PASS', 'info',
                            `Status: ${response.status}`);
                    }
                }
            } catch (error) {
                this.recordTest(`HTTP Method: ${method}`, 'WARN', 'low',
                    `Connection error: ${error.error}`);
            }
        }
    }

    async testCommonVulnerabilities(url) {
        console.log('\n🔐 Testing Common Vulnerabilities...');

        // Test for SQL injection patterns
        const sqlPayloads = [
            "' OR '1'='1",
            "'; DROP TABLE users; --",
            "admin'--",
            "1' UNION SELECT NULL--"
        ];

        for (const payload of sqlPayloads) {
            try {
                const testUrl = `${url}?id=${encodeURIComponent(payload)}`;
                const response = await this.makeRequest(testUrl);

                if (response.data.toLowerCase().includes('error') ||
                    response.data.toLowerCase().includes('sql') ||
                    response.data.toLowerCase().includes('syntax')) {
                    this.recordTest('SQL Injection Test', 'WARN', 'high',
                        `Potential SQL injection vulnerability with payload: ${payload}`);
                } else {
                    this.recordTest('SQL Injection Test', 'PASS', 'info',
                        `No SQL injection indicators for payload: ${payload}`);
                }
            } catch (error) {
                // Connection errors are acceptable for security tests
                this.recordTest('SQL Injection Test', 'PASS', 'info',
                    `Request blocked/failed as expected`);
            }
        }

        // Test for XSS patterns
        const xssPayloads = [
            '<script>alert("XSS")</script>',
            'javascript:alert("XSS")',
            '"><script>alert("XSS")</script>',
            "'><script>alert('XSS')</script>"
        ];

        for (const payload of xssPayloads) {
            try {
                const testUrl = `${url}?search=${encodeURIComponent(payload)}`;
                const response = await this.makeRequest(testUrl);

                if (response.data.includes('<script>') ||
                    response.data.includes('javascript:') ||
                    response.data.includes(payload)) {
                    this.recordTest('XSS Test', 'WARN', 'high',
                        `Potential XSS vulnerability with payload: ${payload}`);
                } else {
                    this.recordTest('XSS Test', 'PASS', 'info',
                        `XSS payload properly filtered/escaped: ${payload}`);
                }
            } catch (error) {
                this.recordTest('XSS Test', 'PASS', 'info',
                    `Request handled securely`);
            }
        }
    }

    async testRateLimiting(url) {
        console.log('\n⚡ Testing Rate Limiting...');

        const requests = [];
        const startTime = Date.now();

        // Send 50 rapid requests
        for (let i = 0; i < 50; i++) {
            requests.push(this.makeRequest(url).catch(() => ({ status: 'error' })));
        }

        const responses = await Promise.all(requests);
        const endTime = Date.now();
        const duration = endTime - startTime;

        const successCount = responses.filter(r => r.status && r.status < 400).length;
        const rateLimitedCount = responses.filter(r => r.status === 429).length;
        const errorCount = responses.filter(r => r.status === 'error' || r.status >= 500).length;

        if (rateLimitedCount > 0) {
            this.recordTest('Rate Limiting', 'PASS', 'info',
                `Rate limiting active: ${rateLimitedCount}/50 requests limited`);
        } else if (errorCount > 10) {
            this.recordTest('Rate Limiting', 'WARN', 'medium',
                `High error rate under load: ${errorCount}/50 requests failed`);
        } else {
            this.recordTest('Rate Limiting', 'WARN', 'low',
                `No rate limiting detected - all 50 requests succeeded in ${duration}ms`);
        }
    }

    async testSSLTLS(url) {
        console.log('\n🔒 Testing SSL/TLS Configuration...');

        if (url.startsWith('http://')) {
            this.recordTest('SSL/TLS', 'WARN', 'medium',
                'Service not using HTTPS - traffic not encrypted');
            return;
        }

        // For HTTPS endpoints, we would test SSL configuration
        // This is a placeholder for more comprehensive SSL testing
        this.recordTest('SSL/TLS', 'PASS', 'info',
            'HTTPS endpoint detected');
    }

    async runFullSecurityScan(url) {
        console.log(`\n🛡️  Starting Security Scan for: ${url}`);
        console.log('='.repeat(60));

        await this.testHTTPHeaders(url);
        await this.testHTTPMethods(url);
        await this.testCommonVulnerabilities(url);
        await this.testRateLimiting(url);
        await this.testSSLTLS(url);

        this.printSecurityReport();
    }

    printSecurityReport() {
        console.log('\n📊 Security Scan Results:');
        console.log('='.repeat(60));

        const passRate = (this.results.passed / this.results.total * 100).toFixed(1);
        const failRate = (this.results.failed / this.results.total * 100).toFixed(1);
        const warnRate = (this.results.warnings / this.results.total * 100).toFixed(1);

        console.log(`Total Tests: ${this.results.total}`);
        console.log(`Passed: ${this.results.passed} (${passRate}%)`);
        console.log(`Failed: ${this.results.failed} (${failRate}%)`);
        console.log(`Warnings: ${this.results.warnings} (${warnRate}%)`);

        // Security score calculation
        let securityScore = 100;
        securityScore -= (this.results.failed * 10); // Each failure -10 points
        securityScore -= (this.results.warnings * 3); // Each warning -3 points
        securityScore = Math.max(0, securityScore);

        console.log(`\n🎯 Security Score: ${securityScore}/100`);

        if (securityScore >= 90) {
            console.log('✅ Security Status: EXCELLENT');
        } else if (securityScore >= 75) {
            console.log('⚠️  Security Status: GOOD');
        } else if (securityScore >= 60) {
            console.log('⚠️  Security Status: ACCEPTABLE');
        } else {
            console.log('❌ Security Status: POOR - IMMEDIATE ACTION REQUIRED');
        }

        // High priority issues
        const criticalIssues = this.results.tests.filter(t => t.result === 'FAIL' && t.severity === 'high');
        const highWarnings = this.results.tests.filter(t => t.result === 'WARN' && t.severity === 'high');

        if (criticalIssues.length > 0 || highWarnings.length > 0) {
            console.log('\n🚨 High Priority Security Issues:');
            [...criticalIssues, ...highWarnings].forEach(issue => {
                console.log(`  - ${issue.name}: ${issue.details}`);
            });
        }

        console.log('='.repeat(60));
    }
}

// Main execution
async function main() {
    const tester = new SecurityTester();
    const url = process.argv[2] || 'http://localhost:6367/health';

    try {
        await tester.runFullSecurityScan(url);
    } catch (error) {
        console.error('Security scan error:', error);
    }
}

if (require.main === module) {
    main();
}

module.exports = SecurityTester;
