#!/usr/bin/env node

/**
 * Verify All Repositories Are Non-Empty Script
 * Checks that all codai-ecosystem repositories have content
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const SERVICES_DIR = 'services';
const ALL_SERVICES = ['codai', 'memorai', 'studiai', 'templates', 'logai', 'bancai', 'wallet', 'fabricai', 'sociai', 'cumparai', 'x'];

function execCommand(command, cwd = process.cwd()) {
    try {
        const result = execSync(command, {
            cwd,
            encoding: 'utf-8',
            stdio: 'pipe'
        });
        return result.trim();
    } catch (error) {
        return null;
    }
}

function checkService(serviceName) {
    const servicePath = path.join(SERVICES_DIR, serviceName);

    if (!fs.existsSync(servicePath)) {
        return { service: serviceName, status: 'MISSING', files: 0, hasGit: false };
    }

    // Count files (excluding node_modules and .git)
    let files = 0;
    try {
        files = fs.readdirSync(servicePath)
            .filter(file => !file.startsWith('.git') && file !== 'node_modules')
            .length;
    } catch (error) {
        files = 0;
    }

    // Check if it's a git repository
    const hasGit = fs.existsSync(path.join(servicePath, '.git'));

    // Check remote URL if git exists
    let remoteUrl = null;
    if (hasGit) {
        remoteUrl = execCommand('git remote get-url origin', servicePath);
    }

    // Check if package.json exists
    const hasPackageJson = fs.existsSync(path.join(servicePath, 'package.json'));

    // Check if README.md exists
    const hasReadme = fs.existsSync(path.join(servicePath, 'README.md'));

    // Determine status
    let status = 'UNKNOWN';
    if (files === 0) {
        status = 'EMPTY';
    } else if (files < 10) {
        status = 'MINIMAL';
    } else if (hasPackageJson && hasReadme) {
        status = 'SCAFFOLDED';
    } else if (files > 100) {
        status = 'CONTENT-RICH';
    } else {
        status = 'PARTIAL';
    }

    return {
        service: serviceName,
        status,
        files,
        hasGit,
        remoteUrl,
        hasPackageJson,
        hasReadme
    };
}

function main() {
    console.log('🔍 VERIFYING ALL CODAI ECOSYSTEM REPOSITORIES\n');

    const results = ALL_SERVICES.map(checkService);

    console.log('📊 REPOSITORY STATUS SUMMARY:');
    console.log('================================');
    console.log('Service'.padEnd(12) + 'Status'.padEnd(15) + 'Files'.padEnd(8) + 'Git'.padEnd(6) + 'Remote');
    console.log('-'.repeat(70));

    let emptyCount = 0;
    let scaffoldedCount = 0;
    let contentRichCount = 0;

    for (const result of results) {
        const { service, status, files, hasGit, remoteUrl } = result;

        // Status emoji
        let statusEmoji = '';
        switch (status) {
            case 'EMPTY': statusEmoji = '🔴'; emptyCount++; break;
            case 'MINIMAL': statusEmoji = '🟡'; break;
            case 'SCAFFOLDED': statusEmoji = '🟢'; scaffoldedCount++; break;
            case 'CONTENT-RICH': statusEmoji = '🔵'; contentRichCount++; break;
            case 'PARTIAL': statusEmoji = '🟠'; break;
            default: statusEmoji = '⚪'; break;
        }

        const gitStatus = hasGit ? '✅' : '❌';
        const remoteStatus = remoteUrl ? '✅' : '❌';

        console.log(
            service.padEnd(12) +
            `${statusEmoji} ${status}`.padEnd(15) +
            files.toString().padEnd(8) +
            gitStatus.padEnd(6) +
            remoteStatus
        );
    }

    console.log('\n📈 SUMMARY STATISTICS:');
    console.log('======================');
    console.log(`🔵 Content-Rich:  ${contentRichCount}`);
    console.log(`🟢 Scaffolded:    ${scaffoldedCount}`);
    console.log(`🟡 Minimal:       ${results.filter(r => r.status === 'MINIMAL').length}`);
    console.log(`🟠 Partial:       ${results.filter(r => r.status === 'PARTIAL').length}`);
    console.log(`🔴 Empty:         ${emptyCount}`);
    console.log(`⚪ Missing:       ${results.filter(r => r.status === 'MISSING').length}`);

    const totalNonEmpty = ALL_SERVICES.length - emptyCount - results.filter(r => r.status === 'MISSING').length;
    const percentageReady = Math.round((totalNonEmpty / ALL_SERVICES.length) * 100);

    console.log(`\n🎯 READINESS: ${totalNonEmpty}/${ALL_SERVICES.length} (${percentageReady}%) repositories have content`);

    if (emptyCount === 0) {
        console.log('\n🎉 SUCCESS: All repositories have content!');
        console.log('✅ Ready for individual AI agent development on each service');
    } else {
        console.log('\n⚠️  ATTENTION: Some repositories are still empty');
        console.log('Consider running: npm run push-scaffolded');
    }

    // Check for potential issues
    const issues = results.filter(r => r.hasPackageJson && !r.hasGit);
    if (issues.length > 0) {
        console.log('\n🚨 POTENTIAL ISSUES:');
        issues.forEach(issue => {
            console.log(`- ${issue.service}: Has package.json but no git repository`);
        });
    }
}

main();
