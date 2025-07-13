#!/usr/bin/env node
/**
 * Comprehensive Project Validation Script for Codai Ecosystem
 * Validates TypeScript configurations, service health, and ecosystem integrity
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ProjectValidator {
    constructor() {
        this.validationResults = {
            typescript: [],
            services: [],
            configurations: [],
            dependencies: [],
            integrations: [],
            overall: { score: 0, total: 0 }
        };
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '📝';
        console.log(`${prefix} [${timestamp}] ${message}`);
    }

    async validateProject() {
        this.log('🔍 Starting comprehensive project validation...', 'info');

        try {
            // Validate TypeScript configurations
            await this.validateTypeScriptConfigurations();

            // Validate service integrations
            await this.validateServiceIntegrations();

            // Validate dependencies
            await this.validateDependencies();

            // Validate ecosystem configurations
            await this.validateEcosystemConfigurations();

            // Generate comprehensive report
            await this.generateValidationReport();

            this.log('✅ Project validation completed', 'success');

        } catch (error) {
            this.log(`❌ Validation failed: ${error.message}`, 'error');
            throw error;
        }
    }

    async validateTypeScriptConfigurations() {
        this.log('📝 Validating TypeScript configurations...', 'info');

        const services = await this.discoverServices();
        let validCount = 0;

        for (const service of services) {
            try {
                const result = await this.validateServiceTypeScript(service);
                this.validationResults.typescript.push(result);

                if (result.valid) {
                    validCount++;
                    this.log(`✅ ${service.name}: TypeScript configuration valid`, 'success');
                } else {
                    this.log(`❌ ${service.name}: ${result.errors.join(', ')}`, 'error');
                }
            } catch (error) {
                this.log(`❌ ${service.name}: Validation error - ${error.message}`, 'error');
                this.validationResults.typescript.push({
                    service: service.name,
                    valid: false,
                    errors: [error.message]
                });
            }
        }

        this.log(`📊 TypeScript validation: ${validCount}/${services.length} services valid`, 'info');
    }

    async validateServiceTypeScript(service) {
        const tsConfigPath = path.join(service.path, 'tsconfig.json');
        const packageJsonPath = path.join(service.path, 'package.json');

        const result = {
            service: service.name,
            path: service.path,
            valid: true,
            errors: [],
            warnings: []
        };

        // Check if tsconfig.json exists
        if (!fs.existsSync(tsConfigPath)) {
            result.valid = false;
            result.errors.push('Missing tsconfig.json');
            return result;
        }

        // Validate tsconfig.json structure
        try {
            const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));

            // Check for required fields
            if (!tsConfig.extends) {
                result.warnings.push('Missing extends field in tsconfig.json');
            } else {
                const extendsPath = path.resolve(service.path, tsConfig.extends);
                if (!fs.existsSync(extendsPath)) {
                    result.errors.push(`Extended config not found: ${tsConfig.extends}`);
                    result.valid = false;
                }
            }

            // Validate compilerOptions
            if (!tsConfig.compilerOptions) {
                result.warnings.push('Missing compilerOptions');
            }

            // Check for global types inclusion
            if (!tsConfig.include || !tsConfig.include.some(inc => inc.includes('types'))) {
                result.warnings.push('Global types not included');
            }

        } catch (error) {
            result.valid = false;
            result.errors.push(`Invalid tsconfig.json: ${error.message}`);
        }

        // Check package.json TypeScript dependencies
        if (fs.existsSync(packageJsonPath)) {
            try {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

                if (!packageJson.devDependencies?.typescript) {
                    result.warnings.push('Missing TypeScript dependency');
                }

                if (!packageJson.devDependencies?.['@types/node']) {
                    result.warnings.push('Missing @types/node dependency');
                }

            } catch (error) {
                result.warnings.push(`Error reading package.json: ${error.message}`);
            }
        }

        // Try to compile TypeScript
        try {
            const originalCwd = process.cwd();
            process.chdir(service.path);

            execSync('npx tsc --noEmit', {
                stdio: 'pipe',
                timeout: 30000
            });

            process.chdir(originalCwd);

        } catch (error) {
            const output = error.stdout ? error.stdout.toString() : error.message;
            if (output.includes('error TS')) {
                result.valid = false;
                result.errors.push('TypeScript compilation errors');
            }
        }

        return result;
    }

    async validateServiceIntegrations() {
        this.log('🔗 Validating service integrations...', 'info');

        // Check projects.index.json
        const projectsIndexPath = path.join(process.cwd(), 'projects.index.json');

        if (!fs.existsSync(projectsIndexPath)) {
            this.validationResults.integrations.push({
                component: 'projects.index.json',
                valid: false,
                errors: ['Missing projects.index.json file']
            });
            return;
        }

        try {
            const projectsIndex = JSON.parse(fs.readFileSync(projectsIndexPath, 'utf8'));
            const discoveredServices = await this.discoverServices();

            let registeredCount = 0;

            for (const service of discoveredServices) {
                const isRegistered = projectsIndex.projects?.some(p =>
                    p.name === service.name || p.path === service.relativePath
                );

                if (isRegistered) {
                    registeredCount++;
                } else {
                    this.log(`⚠️ ${service.name}: Not registered in projects.index.json`, 'warning');
                }
            }

            this.validationResults.integrations.push({
                component: 'projects.index.json',
                valid: true,
                registered: registeredCount,
                total: discoveredServices.length,
                coverage: (registeredCount / discoveredServices.length) * 100
            });

            this.log(`📊 Service registration: ${registeredCount}/${discoveredServices.length} services registered`, 'info');

        } catch (error) {
            this.validationResults.integrations.push({
                component: 'projects.index.json',
                valid: false,
                errors: [`Error reading projects.index.json: ${error.message}`]
            });
        }
    }

    async validateDependencies() {
        this.log('📦 Validating dependencies...', 'info');

        const services = await this.discoverServices();
        let validCount = 0;

        for (const service of services) {
            try {
                const result = await this.validateServiceDependencies(service);
                this.validationResults.dependencies.push(result);

                if (result.valid) {
                    validCount++;
                }
            } catch (error) {
                this.log(`❌ ${service.name}: Dependency validation error - ${error.message}`, 'error');
            }
        }

        this.log(`📊 Dependency validation: ${validCount}/${services.length} services valid`, 'info');
    }

    async validateServiceDependencies(service) {
        const packageJsonPath = path.join(service.path, 'package.json');
        const nodeModulesPath = path.join(service.path, 'node_modules');

        const result = {
            service: service.name,
            valid: true,
            errors: [],
            warnings: [],
            stats: {
                dependencies: 0,
                devDependencies: 0,
                installed: false
            }
        };

        if (!fs.existsSync(packageJsonPath)) {
            result.valid = false;
            result.errors.push('Missing package.json');
            return result;
        }

        try {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

            result.stats.dependencies = Object.keys(packageJson.dependencies || {}).length;
            result.stats.devDependencies = Object.keys(packageJson.devDependencies || {}).length;
            result.stats.installed = fs.existsSync(nodeModulesPath);

            if (!result.stats.installed) {
                result.warnings.push('Dependencies not installed (missing node_modules)');
            }

            // Check for required ecosystem dependencies
            const requiredDeps = ['typescript'];
            const missingDeps = requiredDeps.filter(dep =>
                !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]
            );

            if (missingDeps.length > 0) {
                result.warnings.push(`Missing required dependencies: ${missingDeps.join(', ')}`);
            }

        } catch (error) {
            result.valid = false;
            result.errors.push(`Error reading package.json: ${error.message}`);
        }

        return result;
    }

    async validateEcosystemConfigurations() {
        this.log('⚙️ Validating ecosystem configurations...', 'info');

        const configs = [
            { name: 'Root package.json', path: 'package.json' },
            { name: 'pnpm-workspace.yaml', path: 'pnpm-workspace.yaml' },
            { name: 'Base TypeScript config', path: 'tsconfig.base.json' },
            { name: 'Global types', path: 'types/global.d.ts' },
            { name: 'Browser config', path: 'configs/tsconfig.browser.json' },
            { name: 'Node config', path: 'configs/tsconfig.node.json' },
            { name: 'Package config', path: 'configs/tsconfig.package.json' }
        ];

        let validCount = 0;

        for (const config of configs) {
            const fullPath = path.join(process.cwd(), config.path);
            const exists = fs.existsSync(fullPath);

            const result = {
                name: config.name,
                path: config.path,
                exists,
                valid: exists,
                errors: []
            };

            if (!exists) {
                result.errors.push('File does not exist');
                this.log(`❌ ${config.name}: Missing`, 'error');
            } else {
                validCount++;
                this.log(`✅ ${config.name}: Found`, 'success');

                // Validate JSON files
                if (config.path.endsWith('.json')) {
                    try {
                        JSON.parse(fs.readFileSync(fullPath, 'utf8'));
                    } catch (error) {
                        result.valid = false;
                        result.errors.push(`Invalid JSON: ${error.message}`);
                        this.log(`❌ ${config.name}: Invalid JSON`, 'error');
                    }
                }
            }

            this.validationResults.configurations.push(result);
        }

        this.log(`📊 Configuration validation: ${validCount}/${configs.length} configs valid`, 'info');
    }

    async discoverServices() {
        const services = [];
        const rootDir = process.cwd();

        // Discover apps
        const appsDir = path.join(rootDir, 'apps');
        if (fs.existsSync(appsDir)) {
            const apps = fs.readdirSync(appsDir).filter(item => {
                const itemPath = path.join(appsDir, item);
                return fs.statSync(itemPath).isDirectory();
            });

            for (const app of apps) {
                services.push({
                    name: app,
                    type: 'app',
                    path: path.join(appsDir, app),
                    relativePath: `apps/${app}`
                });
            }
        }

        // Discover packages
        const packagesDir = path.join(rootDir, 'packages');
        if (fs.existsSync(packagesDir)) {
            const packages = fs.readdirSync(packagesDir).filter(item => {
                const itemPath = path.join(packagesDir, item);
                return fs.statSync(itemPath).isDirectory();
            });

            for (const pkg of packages) {
                services.push({
                    name: pkg,
                    type: 'package',
                    path: path.join(packagesDir, pkg),
                    relativePath: `packages/${pkg}`
                });
            }
        }

        // Discover services
        const servicesDir = path.join(rootDir, 'services');
        if (fs.existsSync(servicesDir)) {
            const servicesList = fs.readdirSync(servicesDir).filter(item => {
                const itemPath = path.join(servicesDir, item);
                return fs.statSync(itemPath).isDirectory();
            });

            for (const service of servicesList) {
                services.push({
                    name: service,
                    type: 'service',
                    path: path.join(servicesDir, service),
                    relativePath: `services/${service}`
                });
            }
        }

        return services;
    }

    async generateValidationReport() {
        this.log('📊 Generating validation report...', 'info');

        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalServices: 0,
                validTypescript: 0,
                validDependencies: 0,
                validConfigurations: 0,
                overallScore: 0
            },
            details: this.validationResults,
            recommendations: []
        };

        // Calculate summary statistics
        report.summary.totalServices = this.validationResults.typescript.length;
        report.summary.validTypescript = this.validationResults.typescript.filter(r => r.valid).length;
        report.summary.validDependencies = this.validationResults.dependencies.filter(r => r.valid).length;
        report.summary.validConfigurations = this.validationResults.configurations.filter(r => r.valid).length;

        // Calculate overall score
        const maxScore = report.summary.totalServices * 3 + this.validationResults.configurations.length;
        const actualScore = report.summary.validTypescript + report.summary.validDependencies + report.summary.validConfigurations;
        report.summary.overallScore = maxScore > 0 ? Math.round((actualScore / maxScore) * 100) : 0;

        // Generate recommendations
        if (report.summary.validTypescript < report.summary.totalServices) {
            report.recommendations.push('Run TypeScript fix automation to resolve compilation issues');
        }

        if (report.summary.validDependencies < report.summary.totalServices) {
            report.recommendations.push('Install missing dependencies with pnpm install');
        }

        const missingConfigs = this.validationResults.configurations.filter(c => !c.valid);
        if (missingConfigs.length > 0) {
            report.recommendations.push(`Create missing configurations: ${missingConfigs.map(c => c.name).join(', ')}`);
        }

        // Save report
        const reportPath = path.join(process.cwd(), 'validation-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        // Display summary
        this.displayValidationSummary(report);

        this.log(`📋 Full report saved to: ${reportPath}`, 'info');
    }

    displayValidationSummary(report) {
        console.log('\n' + '='.repeat(80));
        console.log('📊 CODAI ECOSYSTEM VALIDATION REPORT');
        console.log('='.repeat(80));
        console.log(`🕒 Generated: ${report.timestamp}`);
        console.log(`🎯 Overall Score: ${report.summary.overallScore}%`);
        console.log('');

        console.log('📈 Summary:');
        console.log(`   Services Discovered: ${report.summary.totalServices}`);
        console.log(`   TypeScript Valid: ${report.summary.validTypescript}/${report.summary.totalServices}`);
        console.log(`   Dependencies Valid: ${report.summary.validDependencies}/${report.summary.totalServices}`);
        console.log(`   Configurations Valid: ${report.summary.validConfigurations}/${this.validationResults.configurations.length}`);
        console.log('');

        // TypeScript issues
        const tsIssues = this.validationResults.typescript.filter(r => !r.valid || r.warnings?.length > 0);
        if (tsIssues.length > 0) {
            console.log('⚠️ TypeScript Issues:');
            tsIssues.slice(0, 5).forEach(issue => {
                if (!issue.valid) {
                    console.log(`   ❌ ${issue.service}: ${issue.errors?.join(', ') || 'Unknown error'}`);
                } else if (issue.warnings?.length > 0) {
                    console.log(`   ⚠️ ${issue.service}: ${issue.warnings.join(', ')}`);
                }
            });
            if (tsIssues.length > 5) {
                console.log(`   ... and ${tsIssues.length - 5} more issues`);
            }
            console.log('');
        }

        // Recommendations
        if (report.recommendations.length > 0) {
            console.log('💡 Recommendations:');
            report.recommendations.forEach(rec => {
                console.log(`   • ${rec}`);
            });
            console.log('');
        }

        // Score interpretation
        if (report.summary.overallScore >= 90) {
            console.log('🎉 Excellent! Your ecosystem is in great shape.');
        } else if (report.summary.overallScore >= 70) {
            console.log('👍 Good! A few improvements needed.');
        } else if (report.summary.overallScore >= 50) {
            console.log('⚠️ Attention needed! Several issues to address.');
        } else {
            console.log('🚨 Critical! Major issues need immediate attention.');
        }

        console.log('='.repeat(80));
    }

    async runQuickHealthCheck() {
        this.log('🏥 Running quick health check...', 'info');

        const checks = [
            { name: 'Root package.json', check: () => fs.existsSync('package.json') },
            { name: 'pnpm workspace', check: () => fs.existsSync('pnpm-workspace.yaml') },
            { name: 'Global types', check: () => fs.existsSync('types/global.d.ts') },
            { name: 'TypeScript configs', check: () => fs.existsSync('configs/tsconfig.browser.json') },
            { name: 'Projects index', check: () => fs.existsSync('projects.index.json') }
        ];

        let passed = 0;

        for (const check of checks) {
            const result = check.check();
            if (result) {
                this.log(`✅ ${check.name}`, 'success');
                passed++;
            } else {
                this.log(`❌ ${check.name}`, 'error');
            }
        }

        const score = Math.round((passed / checks.length) * 100);
        this.log(`🎯 Quick health score: ${score}% (${passed}/${checks.length})`, 'info');

        return score;
    }
}

// CLI interface
if (require.main === module) {
    const args = process.argv.slice(2);
    const validator = new ProjectValidator();

    if (args.includes('--quick')) {
        validator.runQuickHealthCheck().catch(error => {
            console.error('Health check failed:', error.message);
            process.exit(1);
        });
    } else {
        validator.validateProject().catch(error => {
            console.error('Validation failed:', error.message);
            process.exit(1);
        });
    }
}

module.exports = ProjectValidator;
