#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const appsDir = path.join(projectRoot, 'apps');

// Files to remove (test artifacts, logs, backups)
const filesToRemove = [
    // Test files
    /^test-.*\.(js|ts|tsx|md)$/,
    /^.*\.test\.(js|ts|tsx)$/,
    /^.*\.spec\.(js|ts|tsx)$/,
    // Log files
    /^.*-startup\.log$/,
    /^.*\.log$/,
    // Backup files
    /^.*\.backup$/,
    /^.*-backup$/,
    /^.*\.old$/,
    /^.*-old$/,
    // Build info
    /^.*\.tsbuildinfo$/,
    // Reports and completion files
    /^.*_COMPLETION_REPORT\.md$/,
    /^.*_PROGRESS_SUMMARY\.md$/,
    /^.*_TEST_RESULTS\.md$/,
    /^PHASE.*\.md$/,
    // Misc
    /^debug-.*\.js$/,
    /^agent-test\.md$/,
    /^test-.*\.md$/,
];

// Directories to remove
const dirsToRemove = [
    'test-results',
    'playwright-report',
    'coverage',
    '.turbo',
    'pages-old',
    'src-backup',
    'src-disabled',
    'backup',
    'test-app',
    'test-workspace',
];

// Files to organize (move to proper locations)
const filesToOrganize = {
    // Move to docs/
    'README_OLD.md': 'docs/README_OLD.md',
    'README_CODAI.md': 'docs/README_CODAI.md',
    'CODE_REVIEW_CHECKLIST.md': 'docs/CODE_REVIEW_CHECKLIST.md',
    'CODING_EXAMPLES.md': 'docs/CODING_EXAMPLES.md',
    'CODING_STANDARDS.md': 'docs/CODING_STANDARDS.md',
    'IMPLEMENTATION_ROADMAP.md': 'docs/IMPLEMENTATION_ROADMAP.md',
    'JSDOC_TEMPLATES.md': 'docs/JSDOC_TEMPLATES.md',
    'PROJECT_IMPROVEMENTS.md': 'docs/PROJECT_IMPROVEMENTS.md',
    'DEPLOYMENT_INSTRUCTIONS.md': 'docs/DEPLOYMENT_INSTRUCTIONS.md',
    'MULTI_ENVIRONMENT_DEPLOYMENT.md': 'docs/MULTI_ENVIRONMENT_DEPLOYMENT.md',
    'settings-implementation-complete.md': 'docs/settings-implementation-complete.md',

    // Move to deployment/
    'CodeQL.yml': 'deployment/CodeQL.yml',

    // Move to scripts/
    'cleanup-extensions.ps1': 'scripts/cleanup-extensions.ps1',
    'convert-spaces-to-tabs.ps1': 'scripts/convert-spaces-to-tabs.ps1',
    'fix-eslint-local-rules.js': 'scripts/fix-eslint-local-rules.js',
};

async function shouldRemove(fileName, isDirectory = false) {
    if (isDirectory) {
        return dirsToRemove.includes(fileName);
    }

    return filesToRemove.some(pattern => pattern.test(fileName));
}

async function cleanupApp(appPath) {
    const appName = path.basename(appPath);
    console.log(`🧹 Cleaning app: ${appName}`);

    try {
        const entries = await fs.readdir(appPath, { withFileTypes: true });

        const removePromises = [];
        const organizePromises = [];

        for (const entry of entries) {
            const entryPath = path.join(appPath, entry.name);

            // Skip node_modules and .git
            if (entry.name === 'node_modules' || entry.name === '.git') {
                continue;
            }

            // Check if should be removed
            if (await shouldRemove(entry.name, entry.isDirectory())) {
                console.log(`  ❌ Removing: ${entry.name}`);
                removePromises.push(fs.rm(entryPath, { recursive: true, force: true }));
                continue;
            }

            // Check if should be organized
            if (filesToOrganize[entry.name]) {
                const targetPath = path.join(appPath, filesToOrganize[entry.name]);
                const targetDir = path.dirname(targetPath);

                console.log(`  📁 Moving: ${entry.name} → ${filesToOrganize[entry.name]}`);
                organizePromises.push(
                    fs.mkdir(targetDir, { recursive: true })
                        .then(() => fs.rename(entryPath, targetPath))
                        .catch(err => {
                            if (err.code !== 'EEXIST') throw err;
                            // If target exists, remove source
                            return fs.rm(entryPath, { recursive: true, force: true });
                        })
                );
            }
        }

        await Promise.all([...removePromises, ...organizePromises]);
        console.log(`✅ Cleaned app: ${appName}`);

    } catch (error) {
        console.error(`❌ Error cleaning ${appName}:`, error.message);
    }
}

async function main() {
    try {
        console.log('🚀 Starting apps cleanup...');

        const apps = await fs.readdir(appsDir, { withFileTypes: true });
        const appDirs = apps
            .filter(entry => entry.isDirectory())
            .map(entry => path.join(appsDir, entry.name));

        // Process apps in parallel (but limit concurrency)
        const batchSize = 5;
        for (let i = 0; i < appDirs.length; i += batchSize) {
            const batch = appDirs.slice(i, i + batchSize);
            await Promise.all(batch.map(cleanupApp));
        }

        console.log('🎉 Apps cleanup completed!');

    } catch (error) {
        console.error('❌ Cleanup failed:', error);
        process.exit(1);
    }
}

main();
