#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// List of all apps to deploy
const apps = [
    'acasai', 'admin', 'aide', 'ajutai', 'analizai', 'bancai', 'codai',
    'cumparai', 'curtai', 'dash', 'dexai', 'docs', 'explorer', 'fabricai',
    'hub', 'id', 'jucai', 'kodex', 'legalizai', 'logai', 'marketai',
    'memorai', 'mobile', 'mod', 'muzicai', 'publicai', 'sociai', 'stocai',
    'studiai', 'sunai', 'talentai', 'tools', 'wallet', 'x'
];

// Domain mapping for main apps
const domainMapping = {
    'bancai': 'bancai.ro',
    'memorai': 'memorai.codai.ro',
    'codai': 'codai.ro',
    'aide': 'aide.codai.ro',
    'ajutai': 'ajutai.codai.ro',
    'analizai': 'analizai.codai.ro',
    'cumparai': 'cumparai.codai.ro',
    'fabricai': 'fabricai.codai.ro',
    'logai': 'logai.codai.ro',
    'marketai': 'marketai.codai.ro',
    'muzicai': 'muzicai.codai.ro',
    'sociai': 'sociai.codai.ro',
    'stocai': 'stocai.codai.ro',
    'studiai': 'studiai.codai.ro',
    'sunai': 'sunai.codai.ro',
    'talentai': 'talentai.codai.ro'
};

function createSimpleVercelConfig(appName) {
    const config = {
        version: 2,
        framework: "nextjs",
        buildCommand: `cd ../.. && pnpm build --filter=${appName}`,
        installCommand: "cd ../.. && pnpm install",
        outputDirectory: ".next"
    };

    // Add domain alias if it exists
    if (domainMapping[appName]) {
        config.alias = [domainMapping[appName]];
    }

    return config;
}

async function deployApp(appName) {
    const appPath = path.join(__dirname, 'apps', appName);

    if (!fs.existsSync(appPath)) {
        console.log(`❌ App ${appName} does not exist`);
        return;
    }

    console.log(`🚀 Deploying ${appName}...`);

    try {
        // Create simplified vercel.json
        const vercelConfig = createSimpleVercelConfig(appName);
        const vercelJsonPath = path.join(appPath, 'vercel.json');
        fs.writeFileSync(vercelJsonPath, JSON.stringify(vercelConfig, null, 2));

        // Change to app directory and deploy
        process.chdir(appPath);
        const result = execSync('vercel --prod --force', { encoding: 'utf-8' });

        console.log(`✅ ${appName} deployed successfully`);
        console.log(result);

        // Extract deployment URL
        const urlMatch = result.match(/Production: (https:\/\/[^\s]+)/);
        if (urlMatch) {
            console.log(`📱 ${appName} URL: ${urlMatch[1]}`);
            return urlMatch[1];
        }

    } catch (error) {
        console.error(`❌ Failed to deploy ${appName}:`, error.message);
    } finally {
        // Return to project root
        process.chdir(__dirname);
    }
}

async function deployAllApps() {
    console.log('🌟 Starting deployment of all Codai apps...\n');

    const deploymentResults = {};

    for (const app of apps) {
        try {
            const url = await deployApp(app);
            if (url) {
                deploymentResults[app] = url;
            }

            // Add small delay between deployments
            await new Promise(resolve => setTimeout(resolve, 5000));
        } catch (error) {
            console.error(`Failed to deploy ${app}:`, error);
        }
    }

    console.log('\n🎉 Deployment Summary:');
    console.log('========================');
    Object.entries(deploymentResults).forEach(([app, url]) => {
        console.log(`${app}: ${url}`);
    });

    // Save results to file
    fs.writeFileSync('deployment-results.json', JSON.stringify(deploymentResults, null, 2));
    console.log('\n📄 Results saved to deployment-results.json');
}

if (require.main === module) {
    deployAllApps().catch(console.error);
}

module.exports = { deployAllApps, deployApp };
