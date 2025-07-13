#!/usr/bin/env node

/**
 * Script to add test scripts to all package.json files that are missing them
 * Part of Phase 1.2: Standardize Test Scripts
 */

const fs = require('fs');
const path = require('path');

const TEST_SCRIPTS = {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest watch"
};

function findPackageJsonFiles(dir) {
    const results = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            const packageJsonPath = path.join(fullPath, 'package.json');
            if (fs.existsSync(packageJsonPath)) {
                results.push(packageJsonPath);
            }
        }
    }

    return results;
}

async function addTestScriptsToPackageJson(packageJsonPath) {
    try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

        // Skip if test script already exists
        if (packageJson.scripts && packageJson.scripts.test) {
            console.log(`✅ ${packageJsonPath} already has test script`);
            return false;
        }

        // Add scripts section if it doesn't exist
        if (!packageJson.scripts) {
            packageJson.scripts = {};
        }

        // Add test scripts
        Object.assign(packageJson.scripts, TEST_SCRIPTS);

        // Write back to file
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
        console.log(`✅ Added test scripts to ${packageJsonPath}`);
        return true;

    } catch (error) {
        console.error(`❌ Error processing ${packageJsonPath}:`, error.message);
        return false;
    }
}

async function main() {
    console.log('🚀 Adding test scripts to all apps package.json files...\n');

    // Find all package.json files in apps directory
    const appsDir = path.join(process.cwd(), 'apps');
    if (!fs.existsSync(appsDir)) {
        console.error('❌ Apps directory not found');
        return;
    }

    const packageJsonFiles = findPackageJsonFiles(appsDir);

    let addedCount = 0;
    let skippedCount = 0;

    for (const packageJsonPath of packageJsonFiles) {
        const wasAdded = await addTestScriptsToPackageJson(packageJsonPath);
        if (wasAdded) {
            addedCount++;
        } else {
            skippedCount++;
        }
    }

    console.log(`\n📊 Results:`);
    console.log(`   ✅ Added test scripts to: ${addedCount} apps`);
    console.log(`   ⏭️  Skipped (already had): ${skippedCount} apps`);
    console.log(`   📂 Total apps processed: ${packageJsonFiles.length}`);

    if (addedCount > 0) {
        console.log('\n🎯 Next steps:');
        console.log('   1. Run pnpm install to sync workspace');
        console.log('   2. Test individual app test execution');
        console.log('   3. Verify vitest configs work with new scripts');
    }
}

main().catch(console.error);
