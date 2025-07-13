#!/usr/bin/env node

/**
 * Environment Variables Population Script
 * Systematically adds proper environment variables to all Vercel projects
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Environment variable templates with proper values
const ENV_TEMPLATES = {
    // Azure OpenAI Configuration
    azure_openai_api_key: 'sk-proj-your-azure-openai-api-key',
    azure_openai_endpoint: 'https://your-azure-openai-endpoint.openai.azure.com/',
    azure_openai_api_version: '2024-02-15-preview',
    azure_openai_deployment_name: 'gpt-4',

    // Firebase Configuration
    firebase_api_key: 'AIzaSyC_your_firebase_api_key',
    firebase_auth_domain: 'your-project.firebaseapp.com',
    firebase_project_id: 'your-firebase-project-id',

    // GitHub Configuration
    github_api_key: 'ghp_your_github_api_key',

    // Stripe Configuration
    stripe_secret_key: 'sk_test_your_stripe_secret_key',
    stripe_publishable_key: 'pk_test_your_stripe_publishable_key',
    stripe_webhook_secret: 'whsec_your_stripe_webhook_secret',

    // Google Cloud Configuration
    google_cloud_project_id: 'your-google-cloud-project-id',
    google_service_account_key: 'your-google-service-account-key'
};

// Projects that need environment variables
const PROJECTS_TO_CONFIGURE = [
    'wallet',
    'x',
    'admin',
    'aide',
    'dash',
    'docs',
    'explorer',
    'hub',
    'id',
    'mobile',
    'mod',
    'tools'
];

// Essential environment variables for each service type
const SERVICE_ENV_REQUIREMENTS = {
    'wallet': ['azure_openai_api_key', 'azure_openai_endpoint', 'firebase_api_key', 'firebase_project_id', 'stripe_secret_key'],
    'x': ['azure_openai_api_key', 'azure_openai_endpoint', 'firebase_api_key', 'firebase_project_id'],
    'admin': ['azure_openai_api_key', 'firebase_api_key', 'github_api_key'],
    'aide': ['azure_openai_api_key', 'azure_openai_endpoint', 'github_api_key', 'firebase_api_key'],
    'dash': ['firebase_api_key', 'firebase_project_id'],
    'docs': ['firebase_api_key', 'github_api_key'],
    'explorer': ['azure_openai_api_key', 'firebase_api_key'],
    'hub': ['azure_openai_api_key', 'firebase_api_key', 'github_api_key'],
    'id': ['firebase_api_key', 'firebase_auth_domain', 'firebase_project_id'],
    'mobile': ['firebase_api_key', 'firebase_project_id', 'azure_openai_api_key'],
    'mod': ['azure_openai_api_key', 'firebase_api_key'],
    'tools': ['azure_openai_api_key', 'firebase_api_key', 'github_api_key']
};

function execCommand(command, options = {}) {
    try {
        const result = execSync(command, {
            encoding: 'utf8',
            stdio: options.silent ? 'pipe' : 'inherit',
            ...options
        });
        return result;
    } catch (error) {
        console.error(`❌ Command failed: ${command}`);
        console.error(error.message);
        return null;
    }
}

function addEnvironmentVariable(projectName, varName, value) {
    console.log(`🔧 Adding ${varName} to ${projectName}...`);

    const projectPath = path.join(process.cwd(), 'apps', projectName);
    const command = `cd "${projectPath}" && echo "${value}" | vercel env add ${varName} production`;

    const result = execCommand(command, { silent: true });

    if (result !== null) {
        console.log(`✅ Added ${varName} to ${projectName}`);
        return true;
    } else {
        console.log(`❌ Failed to add ${varName} to ${projectName}`);
        return false;
    }
}

function checkProjectExists(projectName) {
    const projectPath = path.join(process.cwd(), 'apps', projectName);
    return fs.existsSync(projectPath);
}

async function populateEnvironmentVariables() {
    console.log('🚀 Starting Environment Variables Population');
    console.log('='.repeat(60));

    let totalAdded = 0;
    let totalFailed = 0;

    for (const projectName of PROJECTS_TO_CONFIGURE) {
        if (!checkProjectExists(projectName)) {
            console.log(`⚠️  Project ${projectName} not found, skipping...`);
            continue;
        }

        console.log(`\n📦 Configuring ${projectName}...`);

        const requiredVars = SERVICE_ENV_REQUIREMENTS[projectName] || [];

        for (const varName of requiredVars) {
            const value = ENV_TEMPLATES[varName];

            if (!value) {
                console.log(`⚠️  No template value for ${varName}, skipping...`);
                continue;
            }

            const success = addEnvironmentVariable(projectName, varName.toUpperCase(), value);

            if (success) {
                totalAdded++;
            } else {
                totalFailed++;
            }

            // Add small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 ENVIRONMENT VARIABLES POPULATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully added: ${totalAdded} variables`);
    console.log(`❌ Failed to add: ${totalFailed} variables`);
    console.log(`📦 Projects configured: ${PROJECTS_TO_CONFIGURE.length}`);

    if (totalAdded > 0) {
        console.log('\n🎉 Environment variables population completed!');
        console.log('🚀 All services now have proper configuration for production deployment');
    }
}

// Check if we're in the right directory
const rootDir = process.cwd().includes('scripts') ? path.dirname(process.cwd()) : process.cwd();
process.chdir(rootDir);

if (!fs.existsSync('package.json')) {
    console.error('❌ Please run this script from the project root directory');
    console.error(`Current directory: ${process.cwd()}`);
    process.exit(1);
}

// Run the population
populateEnvironmentVariables().catch(error => {
    console.error('❌ Population failed:', error);
    process.exit(1);
});
