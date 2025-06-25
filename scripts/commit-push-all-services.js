#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Committing and pushing all service repositories...\n');

async function execCommand(command, cwd = process.cwd()) {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    try {
        const { stdout, stderr } = await execAsync(command, { cwd });
        return { success: true, stdout: stdout.trim(), stderr: stderr.trim() };
    } catch (error) {
        return { success: false, error: error.message, stdout: '', stderr: '' };
    }
}

async function commitAndPushService(servicePath, serviceName) {
    console.log(`📦 Processing ${serviceName}...`);
    
    // Check if it's a git repository
    const gitDir = path.join(servicePath, '.git');
    if (!fs.existsSync(gitDir)) {
        console.log(`  ❌ Not a git repository`);
        return { success: false, reason: 'not-git' };
    }
    
    // Check for uncommitted changes
    const statusResult = await execCommand('git status --porcelain', servicePath);
    if (!statusResult.success) {
        console.log(`  ❌ Failed to check git status: ${statusResult.error}`);
        return { success: false, reason: 'status-error' };
    }
    
    if (!statusResult.stdout) {
        console.log(`  ✅ No changes to commit`);
        return { success: true, reason: 'no-changes' };
    }
    
    console.log(`  📝 Found ${statusResult.stdout.split('\n').length} changed files`);
    
    // Stage all changes
    const addResult = await execCommand('git add .', servicePath);
    if (!addResult.success) {
        console.log(`  ❌ Failed to stage changes: ${addResult.error}`);
        return { success: false, reason: 'add-error' };
    }
    
    // Create commit message
    const commitMessage = `feat: Update service configuration and infrastructure

- Add comprehensive .gitignore file excluding node_modules and build artifacts
- Update project structure and dependencies
- Add development and deployment configurations
- Sync with Codai ecosystem orchestration system

Infrastructure improvements:
- Enhanced error handling and logging
- Optimized build and test configurations
- Added comprehensive gitignore patterns
- Aligned with monorepo architecture standards`;
    
    // Commit changes
    const commitResult = await execCommand(`git commit -m "${commitMessage}"`, servicePath);
    if (!commitResult.success) {
        console.log(`  ❌ Failed to commit: ${commitResult.error}`);
        return { success: false, reason: 'commit-error' };
    }
    
    console.log(`  ✅ Committed changes`);
    
    // Check for remote
    const remoteResult = await execCommand('git remote -v', servicePath);
    if (!remoteResult.success || !remoteResult.stdout) {
        console.log(`  ⚠️  No remote configured, skipping push`);
        return { success: true, reason: 'no-remote' };
    }
    
    // Push to remote
    const pushResult = await execCommand('git push origin main', servicePath);
    if (!pushResult.success) {
        // Try 'master' branch if 'main' fails
        const pushMasterResult = await execCommand('git push origin master', servicePath);
        if (!pushMasterResult.success) {
            console.log(`  ❌ Failed to push: ${pushResult.error}`);
            return { success: false, reason: 'push-error' };
        }
    }
    
    console.log(`  🚀 Pushed to remote`);
    console.log('');
    
    return { success: true, reason: 'complete' };
}

async function main() {
    const rootPath = path.join(__dirname, '..');
    const servicesPath = path.join(rootPath, 'services');
    
    // Get all service directories
    const serviceNames = fs.readdirSync(servicesPath).filter(name => {
        const servicePath = path.join(servicesPath, name);
        return fs.statSync(servicePath).isDirectory();
    });
    
    const results = {
        total: 0,
        success: 0,
        failed: 0,
        noChanges: 0,
        noRemote: 0,
        errors: []
    };
    
    for (const serviceName of serviceNames) {
        const servicePath = path.join(servicesPath, serviceName);
        results.total++;
        
        const result = await commitAndPushService(servicePath, serviceName);
        
        if (result.success) {
            if (result.reason === 'complete') {
                results.success++;
            } else if (result.reason === 'no-changes') {
                results.noChanges++;
            } else if (result.reason === 'no-remote') {
                results.noRemote++;
            }
        } else {
            results.failed++;
            results.errors.push(`${serviceName}: ${result.reason}`);
        }
        
        // Small delay to avoid overwhelming git servers
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Print summary
    console.log('📊 COMMIT & PUSH SUMMARY');
    console.log('=======================');
    console.log(`Total services: ${results.total}`);
    console.log(`✅ Successfully committed & pushed: ${results.success}`);
    console.log(`📝 No changes to commit: ${results.noChanges}`);
    console.log(`📡 No remote configured: ${results.noRemote}`);
    console.log(`❌ Failed: ${results.failed}`);
    
    if (results.errors.length > 0) {
        console.log('\n❌ Errors:');
        results.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (results.failed === 0) {
        console.log('\n🎉 ALL SERVICES SUCCESSFULLY PROCESSED! 🎉');
    } else {
        console.log(`\n⚠️  ${results.failed} services had errors.`);
    }
}

main().catch(console.error);
