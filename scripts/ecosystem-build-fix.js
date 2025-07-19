#!/usr/bin/env node

/**
 * Ecosystem Build Fix Script
 * Fixes common build and dependency issues across the Codai ecosystem
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import chalk from 'chalk';

const PROJECT_ROOT = process.cwd();

console.log(chalk.cyan.bold('🔧 Codai Ecosystem Build Fix Script\n'));

class EcosystemFixer {
    constructor() {
        this.fixes = [];
        this.errors = [];
    }

    async run() {
        console.log(chalk.blue('📋 Scanning for build issues...\n'));

        // Find all package.json files
        const packageFiles = await glob('**/package.json', {
            cwd: PROJECT_ROOT,
            ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
        });

        console.log(chalk.gray(`Found ${packageFiles.length} package.json files\n`));

        for (const file of packageFiles) {
            await this.fixPackage(file);
        }

        this.reportResults();
    }

    async fixPackage(packagePath) {
        const fullPath = path.join(PROJECT_ROOT, packagePath);

        try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const packageJson = JSON.parse(content);
            let modified = false;

            // Fix 1: Replace direct tsc/eslint calls with pnpm exec
            if (packageJson.scripts) {
                const scriptsToFix = ['build', 'lint', 'lint:fix', 'type-check', 'typecheck'];

                for (const script of scriptsToFix) {
                    if (packageJson.scripts[script]) {
                        const originalScript = packageJson.scripts[script];

                        // Fix TypeScript calls
                        if (originalScript.includes('tsc ') || originalScript === 'tsc') {
                            packageJson.scripts[script] = originalScript.replace(/^tsc\b/, 'pnpm exec tsc');
                            modified = true;
                            this.logFix(packagePath, script, originalScript, packageJson.scripts[script]);
                        }

                        // Fix ESLint calls
                        if (originalScript.includes('eslint ') || originalScript === 'eslint') {
                            packageJson.scripts[script] = originalScript.replace(/^eslint\b/, 'pnpm exec eslint');
                            modified = true;
                            this.logFix(packagePath, script, originalScript, packageJson.scripts[script]);
                        }
                    }
                }
            }

            // Fix 2: Check for common dependency issues
            await this.checkDependencyIssues(packagePath, packageJson);

            if (modified) {
                fs.writeFileSync(fullPath, JSON.stringify(packageJson, null, 2) + '\n');
                this.fixes.push({
                    file: packagePath,
                    type: 'script_fix',
                    description: 'Fixed script commands to use pnpm exec'
                });
            }

        } catch (error) {
            this.errors.push({
                file: packagePath,
                error: error.message
            });
        }
    }

    async checkDependencyIssues(packagePath, packageJson) {
        // Check for common issues
        const issues = [];

        // Issue: Missing TypeScript in devDependencies but using tsc
        if (packageJson.scripts &&
            Object.values(packageJson.scripts).some(script => script.includes('tsc')) &&
            !packageJson.dependencies?.typescript &&
            !packageJson.devDependencies?.typescript) {
            issues.push('Missing TypeScript dependency but using tsc command');
        }

        // Issue: Missing ESLint in devDependencies but using eslint
        if (packageJson.scripts &&
            Object.values(packageJson.scripts).some(script => script.includes('eslint')) &&
            !packageJson.dependencies?.eslint &&
            !packageJson.devDependencies?.eslint) {
            issues.push('Missing ESLint dependency but using eslint command');
        }

        if (issues.length > 0) {
            this.fixes.push({
                file: packagePath,
                type: 'dependency_issue',
                issues: issues
            });
        }
    }

    logFix(packagePath, script, original, fixed) {
        console.log(chalk.green(`✅ ${packagePath}`));
        console.log(chalk.gray(`   ${script}: ${original} → ${fixed}`));
    }

    reportResults() {
        console.log(chalk.cyan('\n📊 Fix Results:\n'));

        const scriptFixes = this.fixes.filter(f => f.type === 'script_fix');
        const dependencyIssues = this.fixes.filter(f => f.type === 'dependency_issue');

        if (scriptFixes.length > 0) {
            console.log(chalk.green(`✅ Fixed script commands in ${scriptFixes.length} packages`));
            scriptFixes.forEach(fix => {
                console.log(chalk.gray(`   - ${fix.file}`));
            });
            console.log();
        }

        if (dependencyIssues.length > 0) {
            console.log(chalk.yellow(`⚠️  Dependency issues found in ${dependencyIssues.length} packages:`));
            dependencyIssues.forEach(fix => {
                console.log(chalk.gray(`   - ${fix.file}`));
                fix.issues.forEach(issue => {
                    console.log(chalk.red(`     * ${issue}`));
                });
            });
            console.log();
        }

        if (this.errors.length > 0) {
            console.log(chalk.red(`❌ Errors in ${this.errors.length} packages:`));
            this.errors.forEach(error => {
                console.log(chalk.gray(`   - ${error.file}: ${error.error}`));
            });
            console.log();
        }

        if (this.fixes.length === 0 && this.errors.length === 0) {
            console.log(chalk.green('🎉 No issues found - ecosystem is healthy!'));
        } else {
            console.log(chalk.blue('🔄 Run the following commands to test the fixes:'));
            console.log(chalk.gray('   pnpm install'));
            console.log(chalk.gray('   pnpm type-check'));
            console.log(chalk.gray('   pnpm lint'));
        }
    }
}

// Run the fixer
const fixer = new EcosystemFixer();
fixer.run().catch(console.error);
