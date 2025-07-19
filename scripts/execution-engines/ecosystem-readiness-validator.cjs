#!/usr/bin/env node

/**
 * CODAI Ecosystem Final Readiness Validation
 * Uses all available MCP tools for comprehensive testing
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class EcosystemReadinessValidator {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            phase: 'ECOSYSTEM_FINAL_VALIDATION',
            status: 'INITIALIZING',
            services: {},
            infrastructure: {},
            dependencies: {},
            testing: {},
            summary: {}
        };
    }

    log(message, type = 'INFO') {
        const timestamp = new Date().toISOString();
        const prefix = {
            'INFO': '🔍',
            'SUCCESS': '✅',
            'ERROR': '❌',
            'WARNING': '⚠️',
            'PROGRESS': '🚀'
        }[type] || '📝';

        console.log(`${prefix} [${timestamp}] ${message}`);
    }

    async runCommand(command, args = [], options = {}) {
        return new Promise((resolve) => {
            const proc = spawn(command, args, {
                stdio: 'pipe',
                shell: true,
                ...options
            });

            let stdout = '';
            let stderr = '';

            proc.stdout?.on('data', (data) => {
                stdout += data.toString();
            });

            proc.stderr?.on('data', (data) => {
                stderr += data.toString();
            });

            proc.on('close', (code) => {
                resolve({
                    success: code === 0,
                    code,
                    stdout,
                    stderr
                });
            });

            proc.on('error', (error) => {
                resolve({
                    success: false,
                    code: -1,
                    stdout,
                    stderr: error.message
                });
            });
        });
    }

    async checkDependencies() {
        this.log('Checking dependency status...', 'PROGRESS');

        const depResult = await this.runCommand('pnpm', ['list', '--depth=0']);

        this.results.dependencies = {
            pnpmAvailable: depResult.success,
            installedPackages: depResult.stdout.includes('packages') ? 'DETECTED' : 'MISSING',
            status: depResult.success ? 'READY' : 'NEEDS_INSTALLATION'
        };

        if (this.results.dependencies.status === 'READY') {
            this.log('Dependencies verified', 'SUCCESS');
        } else {
            this.log('Dependencies need installation', 'WARNING');
        }

        return this.results.dependencies;
    }

    async validateInfrastructure() {
        this.log('Validating infrastructure files...', 'PROGRESS');

        const files = [
            'api-gateway.cjs',
            'ecosystem-config.json',
            'ecosystem-comprehensive-test.cjs',
            'package.json',
            'pnpm-workspace.yaml'
        ];

        const infrastructure = {};

        for (const file of files) {
            const filePath = path.join(__dirname, file);
            const exists = fs.existsSync(filePath);

            if (exists) {
                const stats = fs.statSync(filePath);
                infrastructure[file] = {
                    exists: true,
                    size: stats.size,
                    modified: stats.mtime.toISOString()
                };
            } else {
                infrastructure[file] = { exists: false };
            }
        }

        this.results.infrastructure = infrastructure;

        const allExist = Object.values(infrastructure).every(f => f.exists);
        this.log(`Infrastructure files: ${allExist ? 'COMPLETE' : 'INCOMPLETE'}`,
            allExist ? 'SUCCESS' : 'ERROR');

        return infrastructure;
    }

    async testServicePorts() {
        this.log('Testing service port availability...', 'PROGRESS');

        const ports = [4030, 4031, 4033, 4066, 3001, 4074, 8080];
        const portResults = {};

        for (const port of ports) {
            const result = await this.checkPort(port);
            portResults[port] = result;

            const serviceName = {
                4030: 'CODAI',
                4031: 'MEMORAI',
                4033: 'BANCAI',
                4066: 'STOCAI',
                3001: 'PREZENTAI',
                4074: 'AIDE',
                8080: 'API_GATEWAY'
            }[port];

            this.log(`Port ${port} (${serviceName}): ${result.available ? 'AVAILABLE' : 'IN_USE'}`,
                result.available ? 'SUCCESS' : 'WARNING');
        }

        this.results.services.ports = portResults;
        return portResults;
    }

    async checkPort(port) {
        return new Promise((resolve) => {
            const server = require('net').createServer();

            server.listen(port, () => {
                server.once('close', () => {
                    resolve({ port, available: true });
                });
                server.close();
            });

            server.on('error', () => {
                resolve({ port, available: false });
            });
        });
    }

    async runEcosystemTest() {
        this.log('Running comprehensive ecosystem test...', 'PROGRESS');

        const testResult = await this.runCommand('node', ['ecosystem-comprehensive-test.cjs']);

        this.results.testing.ecosystemTest = {
            success: testResult.success,
            output: testResult.stdout,
            errors: testResult.stderr
        };

        this.log(`Ecosystem test: ${testResult.success ? 'PASSED' : 'FAILED'}`,
            testResult.success ? 'SUCCESS' : 'ERROR');

        return testResult;
    }

    async validateReadiness() {
        this.log('=== CODAI ECOSYSTEM FINAL READINESS VALIDATION ===', 'PROGRESS');

        // Step 1: Check dependencies
        await this.checkDependencies();

        // Step 2: Validate infrastructure
        await this.validateInfrastructure();

        // Step 3: Test ports
        await this.testServicePorts();

        // Step 4: Run ecosystem test
        await this.runEcosystemTest();

        // Generate final summary
        this.generateFinalSummary();

        // Save results
        await this.saveResults();

        // Print final report
        this.printFinalReport();

        return this.results.summary.ready;
    }

    generateFinalSummary() {
        const deps = this.results.dependencies.status === 'READY';
        const infra = Object.values(this.results.infrastructure).every(f => f.exists);
        const testing = this.results.testing.ecosystemTest?.success || false;

        this.results.summary = {
            ready: deps && infra && testing,
            dependencies: deps,
            infrastructure: infra,
            testing: testing,
            status: deps && infra && testing ? 'READY' : 'NEEDS_ATTENTION',
            nextSteps: []
        };

        if (!deps) {
            this.results.summary.nextSteps.push('Run: pnpm install --recursive');
        }

        if (!infra) {
            this.results.summary.nextSteps.push('Verify infrastructure files are present');
        }

        if (!testing) {
            this.results.summary.nextSteps.push('Start services and run tests');
        }

        if (this.results.summary.ready) {
            this.results.summary.nextSteps.push('Ecosystem is ready for production deployment');
        }
    }

    printFinalReport() {
        console.log('\n' + '='.repeat(70));
        console.log('🚀 CODAI ECOSYSTEM FINAL READINESS VALIDATION REPORT');
        console.log('='.repeat(70));

        console.log(`\n📊 Overall Status: ${this.results.summary.status}`);
        console.log(`🎯 Ready for Production: ${this.results.summary.ready ? 'YES' : 'NO'}`);

        console.log('\n🔍 Component Status:');
        console.log(`  ✓ Dependencies: ${this.results.summary.dependencies ? 'READY' : 'NEEDS_WORK'}`);
        console.log(`  ✓ Infrastructure: ${this.results.summary.infrastructure ? 'READY' : 'NEEDS_WORK'}`);
        console.log(`  ✓ Testing: ${this.results.summary.testing ? 'PASSED' : 'FAILED'}`);

        if (this.results.summary.nextSteps.length > 0) {
            console.log('\n📋 Next Steps:');
            this.results.summary.nextSteps.forEach((step, i) => {
                console.log(`  ${i + 1}. ${step}`);
            });
        }

        console.log('\n' + '='.repeat(70));
        console.log(`🎯 Final Status: ${this.results.summary.ready ? 'ECOSYSTEM READY FOR NEXT PHASE' : 'REQUIRES ATTENTION'}`);
        console.log('='.repeat(70));
    }

    async saveResults() {
        const resultsPath = path.join(__dirname, 'ecosystem-readiness-validation.json');
        fs.writeFileSync(resultsPath, JSON.stringify(this.results, null, 2));
        this.log(`Results saved to: ${resultsPath}`, 'SUCCESS');
    }
}

// Run validation if executed directly
if (require.main === module) {
    const validator = new EcosystemReadinessValidator();

    validator.validateReadiness()
        .then(ready => {
            const exitCode = ready ? 0 : 1;
            process.exit(exitCode);
        })
        .catch(error => {
            console.error('❌ Validation failed:', error);
            process.exit(1);
        });
}

module.exports = EcosystemReadinessValidator;
