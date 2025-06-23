#!/usr/bin/env node
/**
 * Workspace Validation Script
 * Validates the entire Codai workspace for consistency and health
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

async function validateWorkspace() {
    console.log('🔍 Validating Codai workspace...');

    const issues = [];

    try {
        // Check root structure
        console.log('📁 Checking root structure...');
        const requiredDirs = ['apps', 'packages', '.github', '.vscode', '.agent', 'scripts', 'docs'];

        for (const dir of requiredDirs) {
            try {
                await fs.access(dir);
            } catch {
                issues.push(`Missing required directory: ${dir}`);
            }
        }

        // Check configuration files
        console.log('⚙️  Checking configuration files...');
        const requiredFiles = [
            'package.json',
            'pnpm-workspace.yaml',
            'turbo.json',
            'tsconfig.base.json',
            'projects.index.json',
            'agent.profile.json'
        ];

        for (const file of requiredFiles) {
            try {
                await fs.access(file);
            } catch {
                issues.push(`Missing required file: ${file}`);
            }
        }

        // Validate projects index
        console.log('📋 Validating projects index...');
        try {
            const index = JSON.parse(await fs.readFile('projects.index.json', 'utf8'));

            // Check each app exists
            for (const app of index.apps) {
                try {
                    await fs.access(app.path);
                } catch {
                    issues.push(`App listed in index but missing: ${app.path}`);
                }
            }
        } catch (error) {
            issues.push(`Invalid projects.index.json: ${error.message}`);
        }

        // Check workspace consistency
        console.log('🔄 Checking workspace consistency...');
        try {
            execSync('pnpm list --depth=0', { stdio: 'pipe' });
        } catch (error) {
            issues.push('Workspace has dependency issues - run pnpm install');
        }

        // Report results
        if (issues.length === 0) {
            console.log('✅ Workspace validation passed - everything looks perfect!');
            return true;
        } else {
            console.log(`❌ Found ${issues.length} issues:`);
            issues.forEach(issue => console.log(`  - ${issue}`));
            return false;
        }

    } catch (error) {
        console.error(`❌ Validation failed: ${error.message}`);
        return false;
    }
}

validateWorkspace().then(success => {
    process.exit(success ? 0 : 1);
});
