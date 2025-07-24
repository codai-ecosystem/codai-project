#!/usr/bin/env node

/**
 * CODAI Ecosystem Master Test Orchestrator
 * Executes comprehensive testing plan with automated fixes
 * Date: July 23, 2025
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MasterTestOrchestrator {
    constructor(options = {}) {
        this.options = {
            autoFix: options.autoFix || false,
            priority: options.priority || 'all',
            verbose: options.verbose || false,
            timeout: options.timeout || 300000, // 5 minutes
            retries: options.retries || 3,
            ...options
        };

        this.results = {
            totalTests: 0,
            passed: 0,
            failed: 0,
            fixed: 0,
            skipped: 0,
            errors: [],
            startTime: new Date(),
            endTime: null
        };

        this.services = {
            gateway: { port: 4000, name: 'Gateway Service', status: 'unknown' },
            codai: { port: 4001, name: 'CODAI Service', status: 'unknown' },
            admin: { port: 4002, name: 'Admin Service', status: 'unknown' },
            hub: { port: 4003, name: 'Hub Service', status: 'unknown' },
            id: { port: 4004, name: 'ID Service', status: 'unknown' },
            bancai: { port: 4005, name: 'BancAI Service', status: 'unknown' }
        };

        this.priorities = {
            1: 'Critical Service Health',
            2: 'Core API Functionality',
            3: 'Integration Testing',
            4: 'Security & Authentication',
            5: 'Performance Testing',
            6: 'UI/UX Testing',
            7: 'Edge Cases & Error Handling'
        };
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`${prefix} [${timestamp}] ${message}`);
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async checkServiceHealth(service, port) {
        return new Promise((resolve) => {
            const req = https.request({
                hostname: 'localhost',
                port: port,
                path: '/api/health',
                method: 'GET',
                timeout: 5000,
                rejectUnauthorized: false
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        resolve({
                            success: res.statusCode === 200,
                            data: parsed,
                            status: res.statusCode
                        });
                    } catch (e) {
                        resolve({
                            success: res.statusCode === 200,
                            data: data,
                            status: res.statusCode
                        });
                    }
                });
            });

            req.on('error', (e) => {
                // Try HTTP if HTTPS fails
                const httpReq = http.request({
                    hostname: 'localhost',
                    port: port,
                    path: '/api/health',
                    method: 'GET',
                    timeout: 5000
                }, (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => {
                        try {
                            const parsed = JSON.parse(data);
                            resolve({
                                success: res.statusCode === 200,
                                data: parsed,
                                status: res.statusCode
                            });
                        } catch (e) {
                            resolve({
                                success: res.statusCode === 200,
                                data: data,
                                status: res.statusCode
                            });
                        }
                    });
                });

                httpReq.on('error', (httpError) => {
                    resolve({
                        success: false,
                        error: httpError.message,
                        status: 0
                    });
                });

                httpReq.end();
            });

            req.end();
        });
    }

    async executeCommand(command, description) {
        this.log(`Executing: ${description}`, 'info');
        try {
            const result = execSync(command, {
                encoding: 'utf8',
                timeout: this.options.timeout,
                stdio: 'pipe'
            });
            this.log(`✅ ${description} - Success`, 'success');
            return { success: true, output: result };
        } catch (error) {
            this.log(`❌ ${description} - Failed: ${error.message}`, 'error');
            return { success: false, error: error.message, output: error.stdout };
        }
    }

    async fixServiceDown(serviceName, port) {
        this.log(`🔧 Attempting to fix ${serviceName} on port ${port}`, 'warning');

        // Kill any process on the port
        try {
            execSync(`netstat -ano | findstr ":${port}" | for /f "tokens=5" %i in ('more') do taskkill /PID %i /F`, { stdio: 'ignore' });
            await this.sleep(2000);
        } catch (e) {
            // Port might not be in use
        }

        // Restart the service
        const serviceMap = {
            gateway: 'Start Gateway Service',
            codai: 'Start CODAI Service',
            admin: 'Start Admin Service',
            hub: 'Start Hub Service',
            id: 'Start ID Service',
            bancai: 'Start BancAI Service'
        };

        const taskName = serviceMap[serviceName];
        if (taskName) {
            try {
                // Use PowerShell to restart the service task
                execSync(`powershell -Command "Start-Process -FilePath 'pnpm' -ArgumentList '--filter=${serviceName}','dev' -WindowStyle Hidden"`, { stdio: 'ignore' });
                await this.sleep(5000); // Wait for service to start
                return true;
            } catch (e) {
                this.log(`Failed to restart ${serviceName}: ${e.message}`, 'error');
                return false;
            }
        }
        return false;
    }

    async runPriority1Tests() {
        this.log('🔥 Starting Priority 1: Critical Service Health', 'info');
        let allHealthy = true;

        // P1.1 Service Health Validation
        for (const [serviceName, config] of Object.entries(this.services)) {
            this.results.totalTests++;
            this.log(`Testing ${config.name} health on port ${config.port}...`);

            const health = await this.checkServiceHealth(serviceName, config.port);

            if (health.success) {
                this.log(`✅ ${config.name} is healthy`, 'success');
                this.results.passed++;
                config.status = 'healthy';
            } else {
                this.log(`❌ ${config.name} health check failed: ${health.error || 'No response'}`, 'error');
                this.results.failed++;
                config.status = 'unhealthy';
                allHealthy = false;

                if (this.options.autoFix) {
                    const fixed = await this.fixServiceDown(serviceName, config.port);
                    if (fixed) {
                        // Re-test after fix
                        await this.sleep(3000);
                        const recheck = await this.checkServiceHealth(serviceName, config.port);
                        if (recheck.success) {
                            this.log(`🔧 ${config.name} fixed and now healthy`, 'success');
                            this.results.fixed++;
                            config.status = 'healthy';
                        }
                    }
                }
            }
        }

        // P1.2 Database Connectivity (if script exists)
        if (fs.existsSync('scripts/test-db-connections.js')) {
            this.results.totalTests++;
            const dbTest = await this.executeCommand('node scripts/test-db-connections.js', 'Database connectivity test');
            if (dbTest.success) {
                this.results.passed++;
            } else {
                this.results.failed++;
                this.results.errors.push('Database connectivity failed');
            }
        }

        return allHealthy;
    }

    async runPriority2Tests() {
        this.log('⚡ Starting Priority 2: Core API Functionality', 'info');

        // P2.1 Gateway Routing Tests
        const gatewayRoutes = [
            { path: '/api/v1/ai/health', target: 'CODAI' },
            { path: '/api/v1/admin/health', target: 'Admin' },
            { path: '/api/v1/hub/health', target: 'Hub' },
            { path: '/api/v1/auth/health', target: 'ID Service' },
            { path: '/api/v1/banking/health', target: 'BancAI' }
        ];

        for (const route of gatewayRoutes) {
            this.results.totalTests++;
            const test = await this.executeCommand(
                `curl -f -s http://localhost:4000${route.path}`,
                `Gateway routing to ${route.target}`
            );

            if (test.success) {
                this.results.passed++;
            } else {
                this.results.failed++;
                this.results.errors.push(`Gateway routing to ${route.target} failed`);
            }
        }

        // P2.2 Authentication Flow Test
        this.results.totalTests++;
        const authTest = await this.executeCommand(
            'curl -X POST http://localhost:4004/api/auth/login -H "Content-Type: application/json" -d \'{"username":"test","password":"test"}\'',
            'Authentication flow test'
        );

        if (authTest.success) {
            this.results.passed++;
        } else {
            this.results.failed++;
            this.results.errors.push('Authentication flow failed');
        }
    }

    async runPriority3Tests() {
        this.log('🔗 Starting Priority 3: Integration Testing', 'info');

        // Cross-service communication tests
        // This would test service-to-service communication
        // Implementation depends on specific service APIs
        this.log('Integration tests require service-specific implementation', 'warning');
    }

    async runPriority4Tests() {
        this.log('🔐 Starting Priority 4: Security & Authentication', 'info');

        // OAuth2/OIDC endpoint tests
        const oauthEndpoints = [
            '/api/oauth2/authorize',
            '/api/oauth2/token',
            '/api/oauth2/userinfo',
            '/api/oauth2/jwks'
        ];

        for (const endpoint of oauthEndpoints) {
            this.results.totalTests++;
            const test = await this.executeCommand(
                `curl -f -s http://localhost:4004${endpoint}`,
                `OAuth2 endpoint: ${endpoint}`
            );

            if (test.success) {
                this.results.passed++;
            } else {
                this.results.failed++;
                this.results.errors.push(`OAuth2 endpoint ${endpoint} failed`);
            }
        }
    }

    async runPriority5Tests() {
        this.log('🚀 Starting Priority 5: Performance Testing', 'info');

        // Basic load testing with artillery if available
        if (fs.existsSync('node_modules/.bin/artillery')) {
            this.results.totalTests++;
            const loadTest = await this.executeCommand(
                'npx artillery quick --count 5 --num 3 http://localhost:4000/api/health',
                'Basic load test on gateway'
            );

            if (loadTest.success) {
                this.results.passed++;
            } else {
                this.results.failed++;
                this.results.errors.push('Load test failed');
            }
        }
    }

    async runPriority6Tests() {
        this.log('🎨 Starting Priority 6: UI/UX Testing', 'info');

        // Run Playwright tests if available
        if (fs.existsSync('tests/e2e/comprehensive-ui-ux-testing.spec.ts')) {
            this.results.totalTests++;
            const uiTest = await this.executeCommand(
                'npx playwright test tests/e2e/comprehensive-ui-ux-testing.spec.ts --reporter=list',
                'UI/UX comprehensive testing'
            );

            if (uiTest.success) {
                this.results.passed++;
            } else {
                this.results.failed++;
                this.results.errors.push('UI/UX tests failed');
            }
        }
    }

    async runPriority7Tests() {
        this.log('🔧 Starting Priority 7: Edge Cases & Error Handling', 'info');

        // Error handling tests
        const errorTests = [
            { url: 'http://localhost:4000/api/nonexistent', desc: 'Gateway 404 handling' },
            { url: 'http://localhost:4001/api/invalid', desc: 'CODAI error handling' },
            { url: 'http://localhost:4004/api/auth/invalid', desc: 'Auth error handling' }
        ];

        for (const test of errorTests) {
            this.results.totalTests++;
            const result = await this.executeCommand(
                `curl -s -o /dev/null -w "%{http_code}" ${test.url}`,
                test.desc
            );

            // For error tests, we expect 4xx or 5xx codes, not success
            if (result.output && (result.output.includes('4') || result.output.includes('5'))) {
                this.results.passed++;
            } else {
                this.results.failed++;
                this.results.errors.push(`${test.desc} - Expected error response`);
            }
        }
    }

    async generateReport() {
        this.results.endTime = new Date();
        const duration = this.results.endTime - this.results.startTime;

        const report = {
            summary: {
                totalTests: this.results.totalTests,
                passed: this.results.passed,
                failed: this.results.failed,
                fixed: this.results.fixed,
                skipped: this.results.skipped,
                successRate: ((this.results.passed / this.results.totalTests) * 100).toFixed(2),
                duration: `${Math.round(duration / 1000)}s`
            },
            services: this.services,
            errors: this.results.errors,
            timestamp: new Date().toISOString()
        };

        // Save report
        const reportPath = path.join(__dirname, '..', 'reports', `test-execution-${Date.now()}.json`);
        fs.mkdirSync(path.dirname(reportPath), { recursive: true });
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        this.log(`📊 Test execution complete. Report saved to: ${reportPath}`, 'info');
        this.log(`📈 Results: ${this.results.passed}/${this.results.totalTests} passed (${report.summary.successRate}%)`, 'info');

        if (this.results.fixed > 0) {
            this.log(`🔧 Auto-fixed: ${this.results.fixed} issues`, 'success');
        }

        if (this.results.errors.length > 0) {
            this.log(`⚠️  Errors encountered:`, 'warning');
            this.results.errors.forEach(error => this.log(`   - ${error}`, 'warning'));
        }

        return report;
    }

    async execute() {
        this.log('🚀 Starting CODAI Ecosystem Master Test Orchestrator', 'info');
        this.log(`Options: Priority=${this.options.priority}, Auto-fix=${this.options.autoFix}`, 'info');

        try {
            const prioritiesToRun = this.options.priority === 'all'
                ? [1, 2, 3, 4, 5, 6, 7]
                : [parseInt(this.options.priority)];

            for (const priority of prioritiesToRun) {
                this.log(`\n🎯 Executing Priority ${priority}: ${this.priorities[priority]}`, 'info');

                switch (priority) {
                    case 1:
                        await this.runPriority1Tests();
                        break;
                    case 2:
                        await this.runPriority2Tests();
                        break;
                    case 3:
                        await this.runPriority3Tests();
                        break;
                    case 4:
                        await this.runPriority4Tests();
                        break;
                    case 5:
                        await this.runPriority5Tests();
                        break;
                    case 6:
                        await this.runPriority6Tests();
                        break;
                    case 7:
                        await this.runPriority7Tests();
                        break;
                }
            }

            return await this.generateReport();

        } catch (error) {
            this.log(`❌ Critical error during test execution: ${error.message}`, 'error');
            throw error;
        }
    }
}

// CLI Interface
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const args = process.argv.slice(2);
    const options = {};

    args.forEach(arg => {
        if (arg === '--auto-fix') options.autoFix = true;
        if (arg === '--verbose') options.verbose = true;
        if (arg.startsWith('--priority=')) options.priority = arg.split('=')[1];
        if (arg.startsWith('--timeout=')) options.timeout = parseInt(arg.split('=')[1]) * 1000;
    });

    const orchestrator = new MasterTestOrchestrator(options);

    orchestrator.execute()
        .then(report => {
            console.log('\n🎉 Test orchestration completed successfully!');
            process.exit(report.summary.failed > 0 ? 1 : 0);
        })
        .catch(error => {
            console.error('\n💥 Test orchestration failed:', error.message);
            process.exit(1);
        });
}

export default MasterTestOrchestrator;
