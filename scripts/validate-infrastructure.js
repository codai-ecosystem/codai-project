#!/usr/bin/env node

/**
 * Infrastructure Validation Script
 * Comprehensive test of all Docker infrastructure components
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class InfrastructureValidator {
    constructor() {
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            tests: []
        };
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const colors = {
            info: '\x1b[36m',
            success: '\x1b[32m',
            error: '\x1b[31m',
            warning: '\x1b[33m',
            reset: '\x1b[0m'
        };
        console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
    }

    test(name, fn) {
        this.results.total++;
        try {
            this.log(`🧪 Testing: ${name}`, 'info');
            fn();
            this.results.passed++;
            this.results.tests.push({ name, status: 'PASSED' });
            this.log(`✅ PASSED: ${name}`, 'success');
        } catch (error) {
            this.results.failed++;
            this.results.tests.push({ name, status: 'FAILED', error: error.message });
            this.log(`❌ FAILED: ${name} - ${error.message}`, 'error');
        }
    }

    async validateDockerConfig() {
        this.log('🐳 Starting Docker Infrastructure Validation', 'info');

        // Test 1: Docker Compose Configuration
        this.test('Docker Compose Configuration Syntax', () => {
            const output = execSync('docker-compose -f docker-compose.dev.yml config', { encoding: 'utf8' });
            if (!output.includes('services:')) {
                throw new Error('Invalid docker-compose configuration');
            }
        });

        // Test 2: Required Infrastructure Files
        this.test('Infrastructure Directory Structure', () => {
            const requiredPaths = [
                'infrastructure/nginx/nginx.conf',
                'infrastructure/nginx/conf.d/apps.conf',
                'infrastructure/database/init/01-init-databases.sql',
                'infrastructure/ssl/README.md'
            ];

            for (const filePath of requiredPaths) {
                if (!fs.existsSync(path.join(process.cwd(), filePath))) {
                    throw new Error(`Missing required file: ${filePath}`);
                }
            }
        });

        // Test 3: Dockerfile.dev Files
        this.test('Dockerfile.dev Files Exist', () => {
            const apps = ['codai', 'memorai', 'logai', 'bancai'];
            for (const app of apps) {
                const dockerfilePath = path.join(process.cwd(), 'apps', app, 'Dockerfile.dev');
                if (!fs.existsSync(dockerfilePath)) {
                    throw new Error(`Missing Dockerfile.dev for app: ${app}`);
                }
            }
        });

        // Test 4: Dockerfile Syntax Validation
        this.test('Dockerfile Syntax Validation', () => {
            const apps = ['codai', 'memorai', 'logai', 'bancai'];
            for (const app of apps) {
                const dockerfilePath = path.join(process.cwd(), 'apps', app, 'Dockerfile.dev');
                const content = fs.readFileSync(dockerfilePath, 'utf8');

                if (!content.includes('FROM node:')) {
                    throw new Error(`Invalid Dockerfile for ${app}: Missing FROM directive`);
                }

                if (!content.includes('WORKDIR /app')) {
                    throw new Error(`Invalid Dockerfile for ${app}: Missing WORKDIR`);
                }

                if (!content.includes('EXPOSE 3000')) {
                    throw new Error(`Invalid Dockerfile for ${app}: Missing EXPOSE`);
                }
            }
        });

        // Test 5: Nginx Configuration Validation
        this.test('Nginx Configuration Syntax', () => {
            const nginxConf = fs.readFileSync('infrastructure/nginx/nginx.conf', 'utf8');
            const appsConf = fs.readFileSync('infrastructure/nginx/conf.d/apps.conf', 'utf8');

            if (!nginxConf.includes('upstream codai')) {
                throw new Error('Missing upstream configuration for codai');
            }

            if (!appsConf.includes('server_name localhost codai.local')) {
                throw new Error('Missing server configuration for codai');
            }
        });

        // Test 6: Database Init Script
        this.test('Database Initialization Script', () => {
            const initScript = fs.readFileSync('infrastructure/database/init/01-init-databases.sql', 'utf8');
            const requiredDatabases = ['codai', 'memorai', 'logai', 'bancai'];

            for (const db of requiredDatabases) {
                if (!initScript.includes(`CREATE DATABASE ${db}`)) {
                    throw new Error(`Missing database creation for: ${db}`);
                }
                if (!initScript.includes(`CREATE USER ${db}`)) {
                    throw new Error(`Missing user creation for: ${db}`);
                }
            }
        });
    }

    async validateApplications() {
        this.log('📱 Starting Application Validation', 'info');

        // Test 7: Package.json Files
        this.test('Package.json Files Exist', () => {
            const apps = ['codai', 'memorai', 'logai', 'bancai'];
            for (const app of apps) {
                const packagePath = path.join(process.cwd(), 'apps', app, 'package.json');
                if (!fs.existsSync(packagePath)) {
                    throw new Error(`Missing package.json for app: ${app}`);
                }

                const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
                if (!packageData.scripts || !packageData.scripts.dev) {
                    throw new Error(`Missing dev script in package.json for app: ${app}`);
                }
            }
        });

        // Test 8: Test Scripts in Package.json
        this.test('Test Scripts Configuration', () => {
            const apps = ['codai', 'memorai', 'logai', 'bancai'];
            for (const app of apps) {
                const packagePath = path.join(process.cwd(), 'apps', app, 'package.json');
                const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

                if (!packageData.scripts || !packageData.scripts.test) {
                    throw new Error(`Missing test script in package.json for app: ${app}`);
                }
            }
        });
    }

    async validateMonitoring() {
        this.log('📊 Starting Monitoring Validation', 'info');

        // Test 9: Monitoring Configuration
        this.test('Monitoring Directories Exist', () => {
            const requiredPaths = [
                'monitoring/prometheus',
                'monitoring/grafana'
            ];

            for (const dirPath of requiredPaths) {
                if (!fs.existsSync(path.join(process.cwd(), dirPath))) {
                    throw new Error(`Missing monitoring directory: ${dirPath}`);
                }
            }
        });
    }

    generateReport() {
        this.log('\n📋 INFRASTRUCTURE VALIDATION REPORT', 'info');
        this.log('=' * 50, 'info');

        console.log('\n📊 Test Summary:');
        console.log(`   Total Tests: ${this.results.total}`);
        console.log(`   ✅ Passed: ${this.results.passed}`);
        console.log(`   ❌ Failed: ${this.results.failed}`);
        console.log(`   📈 Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);

        if (this.results.failed > 0) {
            console.log('\n❌ Failed Tests:');
            this.results.tests
                .filter(test => test.status === 'FAILED')
                .forEach(test => {
                    console.log(`   - ${test.name}: ${test.error}`);
                });
        }

        console.log('\n✅ Passed Tests:');
        this.results.tests
            .filter(test => test.status === 'PASSED')
            .forEach(test => {
                console.log(`   - ${test.name}`);
            });

        // Overall status
        if (this.results.failed === 0) {
            this.log('\n🎉 ALL INFRASTRUCTURE TESTS PASSED!', 'success');
            this.log('Infrastructure is ready for deployment.', 'success');
        } else {
            this.log('\n⚠️  INFRASTRUCTURE VALIDATION FAILED', 'error');
            this.log(`Please fix ${this.results.failed} failing test(s) before deployment.`, 'error');
        }

        return this.results.failed === 0;
    }

    async run() {
        try {
            this.log('🚀 Starting Infrastructure Validation Process', 'info');

            await this.validateDockerConfig();
            await this.validateApplications();
            await this.validateMonitoring();

            const success = this.generateReport();
            process.exit(success ? 0 : 1);

        } catch (error) {
            this.log(`💥 Validation process failed: ${error.message}`, 'error');
            process.exit(1);
        }
    }
}

// Run validation if this script is executed directly
if (require.main === module) {
    const validator = new InfrastructureValidator();
    validator.run();
}

module.exports = InfrastructureValidator;
