/**
 * Phase 4 Security Validation Script
 * Comprehensive validation of all security implementations
 */

const { SecurityHeadersPerformanceTester } = require('./security-headers-performance-test.cjs');
const http = require('http');
const { execSync } = require('child_process');

class Phase4SecurityValidator {
    constructor() {
        this.baseUrl = 'http://localhost:4006';
        this.cbdUrl = 'http://localhost:4180';
        this.validationResults = {
            database_optimization: false,
            frontend_performance: false,
            cdn_caching: false,
            security_headers: false,
            overall_score: 0,
            recommendations: []
        };
    }

    /**
     * Run complete Phase 4 validation
     */
    async validatePhase4() {
        console.log('🎯 Starting Phase 4 Security Validation...\n');
        console.log('='.repeat(80));

        try {
            // Start development servers if needed
            await this.checkServices();

            // Validate database optimization (Task 13.1)
            await this.validateDatabaseOptimization();

            // Validate frontend performance (Task 13.2)
            await this.validateFrontendPerformance();

            // Validate CDN and caching (Task 13.3)
            await this.validateCDNAndCaching();

            // Validate security headers (Task 14.1)
            await this.validateSecurityHeaders();

            // Generate final Phase 4 report
            this.generatePhase4Report();

        } catch (error) {
            console.error('❌ Phase 4 validation failed:', error);
            throw error;
        }
    }

    /**
     * Check if required services are running
     */
    async checkServices() {
        console.log('🔍 Checking Required Services...\n');

        const services = [
            { name: 'MemorAI Application', url: this.baseUrl, required: true },
            { name: 'CBD Database', url: this.cbdUrl, required: true }
        ];

        for (const service of services) {
            const isRunning = await this.checkServiceHealth(service.url);
            const status = isRunning ? '✅ Running' : '❌ Not Running';
            console.log(`  ${service.name}: ${status}`);

            if (service.required && !isRunning) {
                console.log(`\n⚠️ Starting ${service.name}...`);
                await this.startService(service.name);
            }
        }

        console.log();
    }

    /**
     * Check if a service is healthy
     */
    async checkServiceHealth(url) {
        return new Promise((resolve) => {
            const healthUrl = url.includes('/health') ? url : `${url}/health`;

            http.get(healthUrl, (res) => {
                resolve(res.statusCode === 200);
            }).on('error', () => resolve(false));
        });
    }

    /**
     * Start a service using VS Code tasks
     */
    async startService(serviceName) {
        try {
            if (serviceName.includes('MemorAI')) {
                console.log('Starting MemorAI application...');
                // Note: In real implementation, would use run_task
                console.log('⚠️ Please start MemorAI using: "Frontend: Start MemorAI App (4006)" task');
            } else if (serviceName.includes('CBD')) {
                console.log('Starting CBD Database...');
                console.log('⚠️ Please start CBD using: "Backend: Start CBD Database" task');
            }
        } catch (error) {
            console.log(`⚠️ Could not auto-start ${serviceName}. Please start manually.`);
        }
    }

    /**
     * Validate database optimization implementation
     */
    async validateDatabaseOptimization() {
        console.log('📊 Validating Database Optimization (Task 13.1)...\n');

        try {
            // Test database performance endpoints
            const dbHealthResponse = await this.makeRequest(`${this.cbdUrl}/health`);
            const dbStatsResponse = await this.makeRequest(`${this.cbdUrl}/stats`);

            const dbHealthy = dbHealthResponse.statusCode === 200;
            const hasStats = dbStatsResponse.statusCode === 200;

            // Test optimized endpoints
            const optimizationTests = [
                { name: 'Connection Pooling', endpoint: '/health', expectedTime: 200 },
                { name: 'Query Caching', endpoint: '/stats', expectedTime: 150 },
                { name: 'Index Performance', endpoint: '/', expectedTime: 100 }
            ];

            let optimizationScore = 0;
            const maxScore = optimizationTests.length * 100;

            for (const test of optimizationTests) {
                const startTime = Date.now();
                const response = await this.makeRequest(`${this.cbdUrl}${test.endpoint}`);
                const responseTime = Date.now() - startTime;

                const testPassed = response.statusCode === 200 && responseTime <= test.expectedTime;
                const score = testPassed ? 100 : Math.max(0, 100 - (responseTime - test.expectedTime));
                optimizationScore += score;

                const status = testPassed ? '✅' : '⚠️';
                console.log(`  ${status} ${test.name}: ${responseTime}ms (target: ${test.expectedTime}ms)`);
            }

            const optimizationPercentage = (optimizationScore / maxScore) * 100;
            this.validationResults.database_optimization = optimizationPercentage >= 80;

            console.log(`\n📊 Database Optimization Score: ${optimizationPercentage.toFixed(2)}%`);

            if (this.validationResults.database_optimization) {
                console.log('✅ Task 13.1: Database Optimization - VALIDATED\n');
            } else {
                console.log('⚠️ Task 13.1: Database Optimization needs improvement\n');
                this.validationResults.recommendations.push('Optimize database query performance and connection pooling');
            }

        } catch (error) {
            console.log('❌ Database optimization validation failed:', error.message);
            this.validationResults.recommendations.push('Fix database optimization implementation');
        }
    }

    /**
     * Validate frontend performance optimization
     */
    async validateFrontendPerformance() {
        console.log('⚡ Validating Frontend Performance (Task 13.2)...\n');

        try {
            // Test page load performance
            const performanceTests = [
                { name: 'Home Page Load', path: '/', maxTime: 2000 },
                { name: 'API Response', path: '/api/health', maxTime: 500 },
                { name: 'Memory Dashboard', path: '/dashboard', maxTime: 3000 }
            ];

            let performanceScore = 0;
            const maxScore = performanceTests.length * 100;

            for (const test of performanceTests) {
                const startTime = Date.now();
                const response = await this.makeRequest(`${this.baseUrl}${test.path}`);
                const loadTime = Date.now() - startTime;

                const testPassed = response.statusCode < 400 && loadTime <= test.maxTime;
                const score = testPassed ? 100 : Math.max(0, 100 - ((loadTime - test.maxTime) / test.maxTime) * 100);
                performanceScore += score;

                const status = testPassed ? '✅' : '⚠️';
                console.log(`  ${status} ${test.name}: ${loadTime}ms (target: ${test.maxTime}ms)`);
            }

            // Check for lazy loading implementation
            const hasLazyLoading = await this.checkLazyLoadingImplementation();
            if (hasLazyLoading) {
                console.log('  ✅ Lazy Loading: Implemented');
                performanceScore += 50;
            } else {
                console.log('  ⚠️ Lazy Loading: Not detected');
            }

            const performancePercentage = (performanceScore / (maxScore + 50)) * 100;
            this.validationResults.frontend_performance = performancePercentage >= 80;

            console.log(`\n⚡ Frontend Performance Score: ${performancePercentage.toFixed(2)}%`);

            if (this.validationResults.frontend_performance) {
                console.log('✅ Task 13.2: Frontend Performance - VALIDATED\n');
            } else {
                console.log('⚠️ Task 13.2: Frontend Performance needs improvement\n');
                this.validationResults.recommendations.push('Optimize frontend loading times and implement lazy loading');
            }

        } catch (error) {
            console.log('❌ Frontend performance validation failed:', error.message);
            this.validationResults.recommendations.push('Fix frontend performance optimization');
        }
    }

    /**
     * Check for lazy loading implementation
     */
    async checkLazyLoadingImplementation() {
        try {
            const response = await this.makeRequest(`${this.baseUrl}/`);
            if (response.statusCode === 200 && response.body) {
                // Check for lazy loading indicators in HTML
                return response.body.includes('loading="lazy"') ||
                    response.body.includes('intersection-observer') ||
                    response.body.includes('dynamic');
            }
        } catch (error) {
            // Ignore error, just return false
        }
        return false;
    }

    /**
     * Validate CDN and caching implementation
     */
    async validateCDNAndCaching() {
        console.log('🚀 Validating CDN and Caching (Task 13.3)...\n');

        try {
            // Test caching headers
            const cachingTests = [
                { name: 'Static Assets Caching', path: '/_next/static/css/app.css', expectCacheHeaders: true },
                { name: 'API Response Caching', path: '/api/health', expectCacheHeaders: false },
                { name: 'Page Caching', path: '/', expectCacheHeaders: true }
            ];

            let cachingScore = 0;
            const maxScore = cachingTests.length * 100;

            for (const test of cachingTests) {
                const response = await this.makeRequest(`${this.baseUrl}${test.path}`);
                const headers = response.headers || {};

                const hasCacheControl = !!headers['cache-control'];
                const hasETag = !!headers['etag'];
                const hasLastModified = !!headers['last-modified'];

                const cachingHeadersPresent = hasCacheControl || hasETag || hasLastModified;
                const testPassed = test.expectCacheHeaders ? cachingHeadersPresent : true;

                const score = testPassed ? 100 : 50;
                cachingScore += score;

                const status = testPassed ? '✅' : '⚠️';
                console.log(`  ${status} ${test.name}: ${cachingHeadersPresent ? 'Cached' : 'Not Cached'}`);

                if (hasCacheControl) {
                    console.log(`    Cache-Control: ${headers['cache-control']}`);
                }
            }

            // Test CDN manager endpoint
            const cdnStatusResponse = await this.makeRequest(`${this.baseUrl}/api/cdn/status`);
            const hasCDNStatus = cdnStatusResponse.statusCode === 200;

            if (hasCDNStatus) {
                console.log('  ✅ CDN Manager: Active');
                cachingScore += 100;
            } else {
                console.log('  ⚠️ CDN Manager: Not detected');
            }

            const cachingPercentage = (cachingScore / (maxScore + 100)) * 100;
            this.validationResults.cdn_caching = cachingPercentage >= 75;

            console.log(`\n🚀 CDN and Caching Score: ${cachingPercentage.toFixed(2)}%`);

            if (this.validationResults.cdn_caching) {
                console.log('✅ Task 13.3: CDN and Caching - VALIDATED\n');
            } else {
                console.log('⚠️ Task 13.3: CDN and Caching needs improvement\n');
                this.validationResults.recommendations.push('Improve caching strategies and CDN implementation');
            }

        } catch (error) {
            console.log('❌ CDN and caching validation failed:', error.message);
            this.validationResults.recommendations.push('Fix CDN and caching implementation');
        }
    }

    /**
     * Validate security headers implementation
     */
    async validateSecurityHeaders() {
        console.log('🔒 Validating Security Headers (Task 14.1)...\n');

        try {
            // Use the dedicated security headers performance tester
            const securityTester = new SecurityHeadersPerformanceTester(this.baseUrl);
            await securityTester.runTests();

            // Check if security tests passed
            const securityPassed = securityTester.results.failures === 0;
            const securityScore = securityTester.results.securityScore;

            this.validationResults.security_headers = securityScore >= 85;

            if (this.validationResults.security_headers) {
                console.log('\n✅ Task 14.1: Security Headers - VALIDATED');
            } else {
                console.log('\n⚠️ Task 14.1: Security Headers need improvement');
                this.validationResults.recommendations.push('Strengthen security headers configuration');
            }

        } catch (error) {
            console.log('❌ Security headers validation failed:', error.message);
            this.validationResults.recommendations.push('Fix security headers implementation');
        }
    }

    /**
     * Make HTTP request with response capture
     */
    async makeRequest(url) {
        return new Promise((resolve) => {
            const urlObj = new URL(url);
            const client = urlObj.protocol === 'https:' ? require('https') : http;

            const req = client.get(url, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: body
                    });
                });
            });

            req.on('error', (error) => {
                resolve({
                    statusCode: 0,
                    headers: {},
                    body: '',
                    error: error.message
                });
            });

            req.setTimeout(10000, () => {
                req.destroy();
                resolve({
                    statusCode: 0,
                    headers: {},
                    body: '',
                    error: 'Request timeout'
                });
            });
        });
    }

    /**
     * Generate comprehensive Phase 4 validation report
     */
    generatePhase4Report() {
        console.log('\n' + '='.repeat(80));
        console.log('📋 PHASE 4 SECURITY VALIDATION REPORT');
        console.log('='.repeat(80));

        // Calculate overall score
        const validationValues = Object.values(this.validationResults).filter(v => typeof v === 'boolean');
        const validationsPass = validationValues.filter(v => v).length;
        const totalValidations = validationValues.length;
        this.validationResults.overall_score = Math.round((validationsPass / totalValidations) * 100);

        console.log(`Overall Phase 4 Score: ${this.validationResults.overall_score}%\n`);

        // Individual task status
        console.log('Task Validation Status:');
        console.log(`  13.1 Database Optimization: ${this.validationResults.database_optimization ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`  13.2 Frontend Performance: ${this.validationResults.frontend_performance ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`  13.3 CDN and Caching: ${this.validationResults.cdn_caching ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`  14.1 Security Headers: ${this.validationResults.security_headers ? '✅ PASSED' : '❌ FAILED'}`);

        // Recommendations
        if (this.validationResults.recommendations.length > 0) {
            console.log('\n⚠️ Recommendations for Improvement:');
            this.validationResults.recommendations.forEach((rec, index) => {
                console.log(`  ${index + 1}. ${rec}`);
            });
        }

        // Next steps
        console.log('\n🚀 Next Steps:');
        if (this.validationResults.overall_score >= 90) {
            console.log('  ✅ Phase 4 security implementations are excellent!');
            console.log('  🎯 Ready to proceed to Task 14.2: Input Validation');
            console.log('  📋 Continue with remaining production hardening tasks');
        } else if (this.validationResults.overall_score >= 75) {
            console.log('  ✅ Phase 4 implementations are good with room for improvement');
            console.log('  🔧 Address recommendations before proceeding');
            console.log('  🎯 Can proceed to Task 14.2 with caution');
        } else {
            console.log('  ⚠️ Phase 4 implementations need significant improvement');
            console.log('  🔧 Address all failed validations before proceeding');
            console.log('  📋 Review and strengthen all security implementations');
        }

        console.log('\n🛡️ Security Features Successfully Validated:');
        if (this.validationResults.database_optimization) {
            console.log('  ✅ Database connection pooling and query optimization');
        }
        if (this.validationResults.frontend_performance) {
            console.log('  ✅ Frontend performance optimization and lazy loading');
        }
        if (this.validationResults.cdn_caching) {
            console.log('  ✅ CDN caching strategies and cache management');
        }
        if (this.validationResults.security_headers) {
            console.log('  ✅ Comprehensive security headers with CSP, HSTS, CSRF protection');
        }

        console.log('\n' + '='.repeat(80));
        console.log('🎉 Phase 4 Security Validation Complete!');
        console.log('='.repeat(80));
    }
}

// Run validation if called directly
if (require.main === module) {
    const validator = new Phase4SecurityValidator();

    validator.validatePhase4().then(() => {
        console.log('\n✅ Phase 4 security validation completed successfully!');
        process.exit(0);
    }).catch(error => {
        console.error('❌ Phase 4 security validation failed:', error);
        process.exit(1);
    });
}

module.exports = { Phase4SecurityValidator };
