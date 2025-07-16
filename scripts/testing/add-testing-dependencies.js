#!/usr/bin/env node

/**
 * Add Testing Dependencies to All Apps
 * Ensures every app has the necessary testing dependencies
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TESTING_DEPENDENCIES = {
    devDependencies: {
        "vitest": "^2.1.8",
        "@vitejs/plugin-react": "^4.3.4",
        "@testing-library/react": "^16.1.0",
        "@testing-library/jest-dom": "^6.6.3",
        "@testing-library/user-event": "^14.5.3",
        "jsdom": "^25.0.1"
    }
};

async function addTestingDependencies() {
    console.log('🧪 Adding testing dependencies to all apps...\n');

    const appsDir = path.join(process.cwd(), 'apps');
    const apps = fs.readdirSync(appsDir).filter(item => {
        const appPath = path.join(appsDir, item);
        return fs.statSync(appPath).isDirectory() &&
            fs.existsSync(path.join(appPath, 'package.json'));
    });

    let totalApps = 0;
    let updatedApps = 0;

    for (const app of apps) {
        totalApps++;
        const packagePath = path.join(appsDir, app, 'package.json');

        try {
            console.log(`📦 Processing ${app}...`);

            // Read existing package.json
            const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

            // Initialize devDependencies if it doesn't exist
            if (!packageData.devDependencies) {
                packageData.devDependencies = {};
            }

            // Add testing dependencies
            let hasChanges = false;
            Object.entries(TESTING_DEPENDENCIES.devDependencies).forEach(([dep, version]) => {
                if (!packageData.devDependencies[dep]) {
                    packageData.devDependencies[dep] = version;
                    hasChanges = true;
                    console.log(`  ✅ Added ${dep}@${version}`);
                } else {
                    console.log(`  ⏭️  Skipped ${dep} (already exists)`);
                }
            });

            if (hasChanges) {
                // Write back to package.json
                fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2) + '\n');
                updatedApps++;
                console.log(`  💾 Updated ${app}/package.json`);
            } else {
                console.log(`  ✨ ${app} already has all testing dependencies`);
            }

        } catch (error) {
            console.error(`  ❌ Error processing ${app}: ${error.message}`);
        }

        console.log('');
    }

    console.log(`📊 Summary:`);
    console.log(`   Total apps processed: ${totalApps}`);
    console.log(`   Apps updated: ${updatedApps}`);
    console.log(`   Apps skipped: ${totalApps - updatedApps}`);

    if (updatedApps > 0) {
        console.log('\n🔧 Run "pnpm install" to install the new dependencies.');
    }

    return { totalApps, updatedApps };
}

// Run if executed directly
if (require.main === module) {
    addTestingDependencies()
        .then(({ totalApps, updatedApps }) => {
            console.log('\n🎉 Testing dependencies setup complete!');
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 Failed to add testing dependencies:', error);
            process.exit(1);
        });
}

module.exports = addTestingDependencies;
