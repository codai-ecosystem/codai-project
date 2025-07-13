#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get all app directories
const appsDir = path.join(__dirname, 'apps');
const apps = fs.readdirSync(appsDir).filter(dir =>
    fs.statSync(path.join(appsDir, dir)).isDirectory() && dir !== 'README.md'
);

console.log(`Found ${apps.length} apps to process`);

// Process apps in batches to avoid overwhelming Vercel
const batchSize = 3;
let currentBatch = 0;

async function deployApp(appName) {
    const appPath = path.join(appsDir, appName);

    console.log(`📦 Processing ${appName}...`);

    try {
        // Change to app directory
        process.chdir(appPath);

        // Install dependencies
        console.log(`Installing dependencies for ${appName}...`);
        execSync('npm install', { stdio: 'inherit' });

        // Update vercel.json
        const vercelConfig = {
            version: 2,
            buildCommand: "npm run build",
            installCommand: "npm install"
        };

        const vercelJsonPath = path.join(appPath, 'vercel.json');
        fs.writeFileSync(vercelJsonPath, JSON.stringify(vercelConfig, null, 2));

        // Deploy
        console.log(`Deploying ${appName}...`);
        const result = execSync('vercel --prod', { encoding: 'utf-8' });

        // Extract deployment URL
        const urlMatch = result.match(/Production: (https:\/\/[^\s]+)/);
        if (urlMatch) {
            console.log(`✅ ${appName} deployed: ${urlMatch[1]}`);
            return { app: appName, url: urlMatch[1], status: 'success' };
        }

    } catch (error) {
        console.error(`❌ Failed to deploy ${appName}:`, error.message);
        return { app: appName, status: 'failed', error: error.message };
    } finally {
        // Return to root
        process.chdir(__dirname);
    }
}

async function deployBatch(batch) {
    console.log(`\n🚀 Deploying batch ${currentBatch + 1}/${Math.ceil(apps.length / batchSize)}`);
    console.log(`Apps: ${batch.join(', ')}`);

    const results = [];
    for (const app of batch) {
        const result = await deployApp(app);
        results.push(result);

        // Small delay between deployments
        await new Promise(resolve => setTimeout(resolve, 5000));
    }

    return results;
}

async function deployAllApps() {
    const allResults = [];

    for (let i = 0; i < apps.length; i += batchSize) {
        const batch = apps.slice(i, i + batchSize);
        currentBatch = Math.floor(i / batchSize);

        const batchResults = await deployBatch(batch);
        allResults.push(...batchResults);

        // Longer delay between batches
        if (i + batchSize < apps.length) {
            console.log('\n⏸️  Waiting before next batch...');
            await new Promise(resolve => setTimeout(resolve, 30000));
        }
    }

    // Summary
    console.log('\n📊 Deployment Summary:');
    console.log('========================');

    const successful = allResults.filter(r => r.status === 'success');
    const failed = allResults.filter(r => r.status === 'failed');

    console.log(`✅ Successful: ${successful.length}`);
    successful.forEach(r => console.log(`  - ${r.app}: ${r.url}`));

    console.log(`❌ Failed: ${failed.length}`);
    failed.forEach(r => console.log(`  - ${r.app}: ${r.error}`));

    // Save results
    fs.writeFileSync('deployment-results.json', JSON.stringify(allResults, null, 2));
    console.log('\n📄 Results saved to deployment-results.json');
}

if (require.main === module) {
    deployAllApps().catch(console.error);
}

module.exports = { deployAllApps, deployApp };
