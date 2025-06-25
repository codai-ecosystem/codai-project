#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verifying all Codai repositories status...\n');

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

async function checkRepository(repoPath, repoName) {
    console.log(`📁 Checking ${repoName}...`);
    
    const results = {
        exists: false,
        isGitRepo: false,
        hasCommits: false,
        hasRemote: false,
        uncommittedChanges: false,
        unpushedCommits: false,
        nodeModulesTracked: false,
        hasGitignore: false,
        status: 'unknown'
    };
    
    // Check if directory exists
    if (!fs.existsSync(repoPath)) {
        console.log(`  ❌ Directory does not exist`);
        results.status = 'missing';
        return results;
    }
    results.exists = true;
    
    // Check if it's a git repository
    const gitDir = path.join(repoPath, '.git');
    if (!fs.existsSync(gitDir)) {
        console.log(`  ❌ Not a git repository`);
        results.status = 'not-git';
        return results;
    }
    results.isGitRepo = true;
    
    // Check for commits
    const logResult = await execCommand('git log --oneline -1', repoPath);
    if (logResult.success && logResult.stdout) {
        results.hasCommits = true;
    } else {
        console.log(`  ⚠️  No commits found`);
    }
    
    // Check for remote
    const remoteResult = await execCommand('git remote -v', repoPath);
    if (remoteResult.success && remoteResult.stdout) {
        results.hasRemote = true;
        console.log(`  📡 Remote: ${remoteResult.stdout.split('\n')[0]}`);
    } else {
        console.log(`  ❌ No remote configured`);
    }
    
    // Check for uncommitted changes
    const statusResult = await execCommand('git status --porcelain', repoPath);
    if (statusResult.success && statusResult.stdout) {
        results.uncommittedChanges = true;
        console.log(`  ⚠️  Uncommitted changes: ${statusResult.stdout.split('\n').length} files`);
    }
    
    // Check for unpushed commits (if has remote)
    if (results.hasRemote) {
        const unpushedResult = await execCommand('git log origin/main..HEAD --oneline', repoPath);
        if (unpushedResult.success && unpushedResult.stdout) {
            results.unpushedCommits = true;
            console.log(`  ⚠️  Unpushed commits: ${unpushedResult.stdout.split('\n').length}`);
        }
    }
    
    // Check if node_modules is tracked by git
    const lsFilesResult = await execCommand('git ls-files | grep node_modules', repoPath);
    if (lsFilesResult.success && lsFilesResult.stdout) {
        results.nodeModulesTracked = true;
        console.log(`  ❌ node_modules is tracked by git!`);
    }
    
    // Check for .gitignore
    const gitignorePath = path.join(repoPath, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
        results.hasGitignore = true;
        const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
        if (!gitignoreContent.includes('node_modules')) {
            console.log(`  ⚠️  .gitignore doesn't exclude node_modules`);
        }
    } else {
        console.log(`  ❌ Missing .gitignore file`);
    }
    
    // Determine overall status
    if (!results.hasCommits) {
        results.status = 'no-commits';
    } else if (!results.hasRemote) {
        results.status = 'no-remote';
    } else if (results.uncommittedChanges || results.unpushedCommits) {
        results.status = 'needs-push';
    } else if (results.nodeModulesTracked) {
        results.status = 'node-modules-tracked';
    } else {
        results.status = 'ready';
        console.log(`  ✅ Repository is up to date`);
    }
    
    console.log('');
    return results;
}

async function main() {
    const rootPath = path.join(__dirname, '..');
    
    // Read projects.index.json
    const projectsPath = path.join(rootPath, 'projects.index.json');
    const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));
    
    const summary = {
        ready: 0,
        needsPush: 0,
        noCommits: 0,
        noRemote: 0,
        missing: 0,
        notGit: 0,
        nodeModulesTracked: 0,
        total: 0
    };
    
    // Check apps
    console.log('🚀 Checking Apps...\n');
    for (const app of projects.apps) {
        const appPath = path.join(rootPath, 'apps', app.name);
        const result = await checkRepository(appPath, `apps/${app.name}`);
        summary.total++;
        if (result.status === 'ready') summary.ready++;
        else if (result.status === 'needs-push') summary.needsPush++;
        else if (result.status === 'no-commits') summary.noCommits++;
        else if (result.status === 'no-remote') summary.noRemote++;
        else if (result.status === 'missing') summary.missing++;
        else if (result.status === 'not-git') summary.notGit++;
        if (result.nodeModulesTracked) summary.nodeModulesTracked++;
    }
    
    // Check services (read from directory)
    console.log('🔧 Checking Services...\n');
    const servicesPath = path.join(rootPath, 'services');
    const serviceNames = fs.readdirSync(servicesPath).filter(name => {
        const servicePath = path.join(servicesPath, name);
        return fs.statSync(servicePath).isDirectory();
    });
    
    for (const serviceName of serviceNames) {
        const servicePath = path.join(servicesPath, serviceName);
        const result = await checkRepository(servicePath, `services/${serviceName}`);
        summary.total++;
        if (result.status === 'ready') summary.ready++;
        else if (result.status === 'needs-push') summary.needsPush++;
        else if (result.status === 'no-commits') summary.noCommits++;
        else if (result.status === 'no-remote') summary.noRemote++;
        else if (result.status === 'missing') summary.missing++;
        else if (result.status === 'not-git') summary.notGit++;
        if (result.nodeModulesTracked) summary.nodeModulesTracked++;
    }
    
    // Print summary
    console.log('📊 SUMMARY REPORT');
    console.log('=================');
    console.log(`Total repositories: ${summary.total}`);
    console.log(`✅ Ready (committed & pushed): ${summary.ready}`);
    console.log(`⚠️  Need push/commit: ${summary.needsPush}`);
    console.log(`📝 No commits: ${summary.noCommits}`);
    console.log(`📡 No remote: ${summary.noRemote}`);
    console.log(`❌ Missing directories: ${summary.missing}`);
    console.log(`❌ Not git repositories: ${summary.notGit}`);
    console.log(`❌ node_modules tracked: ${summary.nodeModulesTracked}`);
    
    if (summary.ready === summary.total) {
        console.log('\n🎉 ALL REPOSITORIES ARE READY! 🎉');
    } else {
        console.log(`\n⚠️  ${summary.total - summary.ready} repositories need attention.`);
    }
}

main().catch(console.error);
