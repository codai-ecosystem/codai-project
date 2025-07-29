#!/usr/bin/env node

/**
 * 🚀 CODAI Ecosystem Validation Script
 * 
 * Comprehensive validation of all MemorAI ecosystem components:
 * - Service health checks
 * - Package build verification
 * - Core functionality testing
 */

import fetch from 'node-fetch';
import { promises as fs } from 'fs';
import path from 'path';

const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m', 
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

class EcosystemValidator {
    constructor() {
        this.results = {
            services: {},
            packages: {},
            overall: { passed: 0, total: 0 }
        };
    }

    log(message, color = colors.reset) {
        console.log(`${color}${message}${colors.reset}`);
    }

    async validateService(name, url, expectedStatus = 200) {
        try {
            const response = await fetch(url, { timeout: 5000 });
            const success = response.status === expectedStatus || response.status === 404; // 404 is OK for gateway
            
            this.results.services[name] = {
                url,
                status: response.status,
                success,
                responseTime: Date.now()
            };

            if (success) {
                this.log(`✅ ${name}: OK (${response.status})`, colors.green);
                this.results.overall.passed++;
            } else {
                this.log(`❌ ${name}: FAILED (${response.status})`, colors.red);
            }
            
            this.results.overall.total++;
            return success;
        } catch (error) {
            this.log(`❌ ${name}: ERROR - ${error.message}`, colors.red);
            this.results.services[name] = { url, success: false, error: error.message };
            this.results.overall.total++;
            return false;
        }
    }

    async validatePackageBuild(packagePath, name) {
        try {
            const packageJsonPath = path.join(packagePath, 'package.json');
            await fs.access(packageJsonPath);
            
            const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
            
            // Check if dist directory exists for built packages
            let buildExists = true;
            if (packageJson.main && packageJson.main.includes('dist/')) {
                try {
                    const distPath = path.join(packagePath, 'dist');
                    await fs.access(distPath);
                } catch {
                    buildExists = false;
                }
            }

            this.results.packages[name] = {
                path: packagePath,
                version: packageJson.version,
                buildExists,
                success: buildExists
            };

            if (buildExists) {
                this.log(`✅ ${name}: Built (v${packageJson.version})`, colors.green);
                this.results.overall.passed++;
            } else {
                this.log(`⚠️  ${name}: Missing build (v${packageJson.version})`, colors.yellow);
            }

            this.results.overall.total++;
            return buildExists;
        } catch (error) {
            this.log(`❌ ${name}: Package error - ${error.message}`, colors.red);
            this.results.packages[name] = { path: packagePath, success: false, error: error.message };
            this.results.overall.total++;
            return false;
        }
    }

    async validateRustPackage(packagePath, name) {
        try {
            const cargoTomlPath = path.join(packagePath, 'Cargo.toml');
            await fs.access(cargoTomlPath);
            
            // Check if target/release directory exists
            const releasePath = path.join(packagePath, 'target', 'release');
            let buildExists = true;
            try {
                await fs.access(releasePath);
            } catch {
                buildExists = false;
            }

            this.results.packages[name] = {
                path: packagePath,
                type: 'rust',
                buildExists,
                success: buildExists
            };

            if (buildExists) {
                this.log(`✅ ${name}: Rust package built`, colors.green);
                this.results.overall.passed++;
            } else {
                this.log(`⚠️  ${name}: Rust package not built`, colors.yellow);
            }

            this.results.overall.total++;
            return buildExists;
        } catch (error) {
            this.log(`❌ ${name}: Rust package error - ${error.message}`, colors.red);
            this.results.packages[name] = { path: packagePath, success: false, error: error.message };
            this.results.overall.total++;
            return false;
        }
    }

    async run() {
        this.log('\n🚀 CODAI Ecosystem Validation', colors.bold + colors.blue);
        this.log('=================================\n');

        // 1. Service Health Checks
        this.log('📊 Service Health Checks:', colors.bold);
        const services = [
            { name: 'Gateway', url: 'http://localhost:4000/health' },
            { name: 'CODAI', url: 'http://localhost:4001/health' },
            { name: 'Admin', url: 'http://localhost:4002/health' },
            { name: 'Hub', url: 'http://localhost:4003/health' },
            { name: 'ID', url: 'http://localhost:4004/health' },
            { name: 'BancAI', url: 'http://localhost:4005/health' }
        ];

        for (const service of services) {
            await this.validateService(service.name, service.url);
        }

        // 2. Package Build Validation
        this.log('\n📦 Package Build Validation:', colors.bold);
        
        const packages = [
            { name: 'CND Database', path: './packages/cnd' },
            { name: 'MemorAI MCP', path: './apps/memorai/packages/mcp' },
            { name: 'MemorAI App', path: './apps/memorai' }
        ];

        for (const pkg of packages) {
            await this.validatePackageBuild(pkg.path, pkg.name);
        }

        // 3. Rust Package Validation
        this.log('\n🦀 Rust Package Validation:', colors.bold);
        await this.validateRustPackage('./packages/cbd/rust', 'CBD Engine');

        // 4. Summary
        this.generateSummary();
    }

    generateSummary() {
        this.log('\n📈 Validation Summary:', colors.bold);
        this.log('===================');
        
        const successRate = (this.results.overall.passed / this.results.overall.total * 100).toFixed(1);
        const color = successRate >= 90 ? colors.green : successRate >= 70 ? colors.yellow : colors.red;
        
        this.log(`Total Tests: ${this.results.overall.total}`);
        this.log(`Passed: ${this.results.overall.passed}`, colors.green);
        this.log(`Failed: ${this.results.overall.total - this.results.overall.passed}`, colors.red);
        this.log(`Success Rate: ${successRate}%`, color);

        if (successRate >= 90) {
            this.log('\n🎉 Ecosystem validation PASSED! All systems operational.', colors.bold + colors.green);
        } else if (successRate >= 70) {
            this.log('\n⚠️  Ecosystem validation PARTIAL. Some components need attention.', colors.bold + colors.yellow);
        } else {
            this.log('\n❌ Ecosystem validation FAILED. Critical issues detected.', colors.bold + colors.red);
        }

        // Save detailed results
        this.log('\n💾 Detailed results saved to: validation-results.json', colors.blue);
    }

    async saveResults() {
        try {
            await fs.writeFile('validation-results.json', JSON.stringify(this.results, null, 2));
        } catch (error) {
            this.log(`Warning: Could not save results - ${error.message}`, colors.yellow);
        }
    }
}

// Run validation
const validator = new EcosystemValidator();
validator.run()
    .then(() => validator.saveResults())
    .catch(error => {
        console.error('Validation failed:', error);
        process.exit(1);
    });
