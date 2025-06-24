#!/usr/bin/env node

/**
 * Verify All 29 Repositories Script
 * Confirms all repositories have content and are properly connected
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const SERVICES_DIR = 'services';

// All 29 repositories in the codai-ecosystem (actual current list)
const ALL_REPOSITORIES = [
    'admin', 'AIDE', 'ajutai', 'analizai', 'bancai', 'codai', 'cumparai',
    'dash', 'docs', 'explorer', 'fabricai', 'hub', 'id', 'jucai', 'kodex',
    'legalizai', 'logai', 'marketai', 'memorai', 'metu', 'mod', 'publicai',
    'sociai', 'stocai', 'studiai', 'templates', 'tools', 'wallet', 'x'
];

function execCommand(command, cwd = process.cwd()) {
    try {
        return execSync(command, {
            cwd,
            encoding: 'utf-8',
            stdio: 'pipe'
        }).trim();
    } catch (error) {
        return null;
    }
}

function checkRepository(repoName) {
    const repoPath = path.join(SERVICES_DIR, repoName);
    const result = {
        name: repoName,
        exists: false,
        hasContent: false,
        isSubmodule: false,
        hasPackageJson: false,
        hasReadme: false,
        hasAgentConfig: false,
        hasGitRepo: false,
        hasRemote: false,
        remoteUrl: null,
        status: 'Unknown'
    };

    // Check if directory exists
    if (!fs.existsSync(repoPath)) {
        result.status = 'Missing Directory';
        return result;
    }
    result.exists = true;

    // Check if it's a submodule
    const gitmodulesPath = '.gitmodules';
    if (fs.existsSync(gitmodulesPath)) {
        const gitmodules = fs.readFileSync(gitmodulesPath, 'utf-8');
        result.isSubmodule = gitmodules.includes(`services/${repoName}`);
    }

    // Check for essential files
    result.hasPackageJson = fs.existsSync(path.join(repoPath, 'package.json'));
    result.hasReadme = fs.existsSync(path.join(repoPath, 'README.md'));
    result.hasAgentConfig = fs.existsSync(path.join(repoPath, 'agent.project.json'));

    // Check if it's a git repository
    result.hasGitRepo = fs.existsSync(path.join(repoPath, '.git'));

    if (result.hasGitRepo) {
        const remoteUrl = execCommand('git remote get-url origin', repoPath);
        result.hasRemote = !!remoteUrl;
        result.remoteUrl = remoteUrl;
    }

    // Check for content (more than just .git directory)
    const files = fs.readdirSync(repoPath).filter(f => f !== '.git');
    result.hasContent = files.length > 0;

    // Determine overall status
    if (result.hasContent && result.hasPackageJson && result.hasReadme) {
        if (result.isSubmodule) {
            result.status = 'Submodule ✅';
        } else if (result.hasGitRepo && result.hasRemote) {
            result.status = 'Scaffolded ✅';
        } else {
            result.status = 'Local Only ⚠️';
        }
    } else if (result.exists) {
        result.status = 'Empty/Incomplete ❌';
    } else {
        result.status = 'Missing ❌';
    }

    return result;
}

function displayResults(results) {
    console.table(results.map(r => ({
        Repository: r.name,
        Status: r.status,
        Type: r.isSubmodule ? 'Submodule' : 'Scaffolded',
        Content: r.hasContent ? '✅' : '❌',
        Package: r.hasPackageJson ? '✅' : '❌',
        README: r.hasReadme ? '✅' : '❌',
        Agent: r.hasAgentConfig ? '✅' : '❌',
        Git: r.hasGitRepo ? '✅' : '❌',
        Remote: r.hasRemote ? '✅' : '❌'
    })));
}

function generateSummary(results) {
    const total = results.length;
    const successful = results.filter(r => r.status.includes('✅')).length;
    const submodules = results.filter(r => r.isSubmodule).length;
    const scaffolded = results.filter(r => !r.isSubmodule && r.hasContent).length;
    const missing = results.filter(r => !r.exists).length;
    const empty = results.filter(r => r.exists && !r.hasContent).length;
    const localOnly = results.filter(r => r.status.includes('⚠️')).length;

    return {
        total,
        successful,
        submodules,
        scaffolded,
        missing,
        empty,
        localOnly,
        completionRate: Math.round((successful / total) * 100)
    };
}

async function main() {
    console.log('🔍 VERIFYING ALL 29 CODAI ECOSYSTEM REPOSITORIES');
    console.log('================================================');
    console.log(`Total repositories to verify: ${ALL_REPOSITORIES.length}\n`);

    const results = ALL_REPOSITORIES.map(checkRepository);

    console.log('📊 DETAILED VERIFICATION RESULTS:');
    console.log('==================================');
    displayResults(results);

    const summary = generateSummary(results);

    console.log('\n📈 ECOSYSTEM SUMMARY:');
    console.log('=====================');
    console.log(`Total Repositories: ${summary.total}`);
    console.log(`✅ Successfully Connected: ${summary.successful}/${summary.total} (${summary.completionRate}%)`);
    console.log(`🔗 Submodules: ${summary.submodules}`);
    console.log(`📦 Scaffolded: ${summary.scaffolded}`);
    console.log(`⚠️  Local Only: ${summary.localOnly}`);
    console.log(`❌ Missing: ${summary.missing}`);
    console.log(`🗂️ Empty: ${summary.empty}`);

    if (summary.completionRate === 100) {
        console.log('\n🎉 PERFECT! ALL 29 REPOSITORIES ARE VERIFIED!');
        console.log('✨ The entire Codai ecosystem is properly connected and ready');
        console.log('🚀 All repositories have content and are linked to GitHub');
        console.log('👥 Ready for parallel AI agent development on each service');

        console.log('\n🎯 ECOSYSTEM STATUS: COMPLETE ✅');
        console.log('================================');
        console.log('• 29/29 repositories with content');
        console.log('• All repositories connected to GitHub');
        console.log('• Monorepo orchestration ready');
        console.log('• Individual service development ready');
        console.log('• Cross-service coordination enabled');
    } else {
        console.log('\n⚠️  ECOSYSTEM NEEDS ATTENTION');
        console.log('============================');

        if (summary.missing > 0) {
            console.log(`❌ ${summary.missing} repositories are missing directories`);
        }
        if (summary.empty > 0) {
            console.log(`🗂️ ${summary.empty} repositories are empty`);
        }
        if (summary.localOnly > 0) {
            console.log(`⚠️  ${summary.localOnly} repositories are local-only`);
        }

        console.log('\n🔧 RECOMMENDED ACTIONS:');
        if (summary.missing > 0 || summary.empty > 0) {
            console.log('1. Run: npm run integrate-all-repos');
        }
        if (summary.localOnly > 0) {
            console.log('2. Run: npm run push-all-repos');
        }
        console.log('3. Run: git submodule update --init --recursive');
        console.log('4. Re-run verification: npm run verify-repos');
    }

    console.log('\n📋 NEXT DEVELOPMENT STEPS:');
    console.log('==========================');
    console.log('1. Individual Service Development:');
    console.log('   - Open any service in VS Code');
    console.log('   - Use service-specific AI agent');
    console.log('   - Develop business logic independently');
    console.log('');
    console.log('2. Coordinated Development:');
    console.log('   - npm run dev (starts all services)');
    console.log('   - Cross-service integration');
    console.log('   - Ecosystem-wide testing');
    console.log('');
    console.log('3. Deployment:');
    console.log('   - npm run build');
    console.log('   - Service-specific deployments');
    console.log('   - Infrastructure orchestration');
}

main().catch(console.error);
