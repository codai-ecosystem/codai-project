#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Standard .gitignore content for all repositories
const STANDARD_GITIGNORE = `# Dependencies
node_modules/
.pnpm-store/
yarn.lock
package-lock.json

# Build outputs
.next/
out/
dist/
build/
storybook-static/
.turbo/

# Environment variables
.env
.env*.local
.env.production

# Testing
coverage/
test-results/
playwright-report/
playwright/.cache/
.nyc_output/

# IDE
.vscode/settings.json
.vscode/launch.json
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Temporary
.tmp/
.temp/
*.tsbuildinfo

# Agent specific
.agent/local/*
.agent/temp/*
.agent/cache/*

# Common build artifacts
*.tgz
*.tar.gz
.cache/
.parcel-cache/

# Editor directories and files
.vscode/*
!.vscode/extensions.json
!.vscode/tasks.json
!.vscode/settings.template.json
.fleet
.settings/

# TypeScript
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env.test

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next
out

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
public

# Serverless directories
.serverless/

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# yarn v2
.yarn/cache
.yarn/unplugged
.yarn/build-state.yml
.yarn/install-state.gz
.pnp.*
`;

async function checkAndFixGitignore(repoPath, repoName) {
    const gitignorePath = path.join(repoPath, '.gitignore');
    
    try {
        let existingContent = '';
        let fileExists = false;
        
        try {
            existingContent = await fs.readFile(gitignorePath, 'utf8');
            fileExists = true;
        } catch (error) {
            console.log(`📝 Creating new .gitignore for ${repoName}`);
            fileExists = false;
        }
        
        // Check if node_modules is properly ignored
        const hasNodeModules = existingContent.includes('node_modules/') || existingContent.includes('node_modules');
        const hasBasicIgnores = existingContent.includes('.env') && existingContent.includes('dist/');
        
        if (!fileExists || !hasNodeModules || !hasBasicIgnores) {
            console.log(`🔧 ${fileExists ? 'Updating' : 'Creating'} .gitignore for ${repoName}`);
            
            // If file exists, try to preserve custom entries
            let finalContent = STANDARD_GITIGNORE;
            
            if (fileExists && existingContent.trim()) {
                // Look for custom entries that aren't in our standard template
                const existingLines = existingContent.split('\n').map(line => line.trim());
                const standardLines = STANDARD_GITIGNORE.split('\n').map(line => line.trim());
                
                const customLines = existingLines.filter(line => 
                    line && 
                    !line.startsWith('#') && 
                    !standardLines.includes(line) &&
                    !line.match(/^node_modules/) &&
                    !line.match(/^\.env/) &&
                    !line.match(/^dist/) &&
                    !line.match(/^build/) &&
                    !line.match(/^coverage/)
                );
                
                if (customLines.length > 0) {
                    finalContent += '\n# Custom entries from existing .gitignore\n';
                    finalContent += customLines.join('\n') + '\n';
                }
            }
            
            await fs.writeFile(gitignorePath, finalContent);
            return { updated: true, created: !fileExists };
        } else {
            console.log(`✅ .gitignore already good for ${repoName}`);
            return { updated: false, created: false };
        }
    } catch (error) {
        console.error(`❌ Error processing ${repoName}: ${error.message}`);
        return { error: error.message };
    }
}

async function removeNodeModulesFromGit(repoPath, repoName) {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    try {
        // Check if node_modules is tracked
        const { stdout } = await execAsync('git ls-files | grep node_modules', { cwd: repoPath });
        
        if (stdout.trim()) {
            console.log(`🗑️  Removing tracked node_modules from ${repoName}`);
            await execAsync('git rm -r --cached node_modules/', { cwd: repoPath });
            return { removedFromGit: true };
        } else {
            return { removedFromGit: false };
        }
    } catch (error) {
        // git ls-files | grep might fail if no matches, which is fine
        return { removedFromGit: false };
    }
}

async function main() {
    console.log('🚀 Fixing .gitignore files across all Codai repositories...\n');
    
    const results = {
        updated: 0,
        created: 0,
        errors: 0,
        removedFromGit: 0
    };
    
    // Read projects.index.json to get all repositories
    const projectsPath = path.join(__dirname, '..', 'projects.index.json');
    const projects = JSON.parse(await fs.readFile(projectsPath, 'utf8'));
    
    // Process apps
    console.log('📱 Processing apps...');
    for (const appInfo of projects.apps) {
        const appName = appInfo.name;
        const appPath = path.join(__dirname, '..', 'apps', appName);
        
        try {
            await fs.access(appPath);
            const result = await checkAndFixGitignore(appPath, `apps/${appName}`);
            const gitResult = await removeNodeModulesFromGit(appPath, `apps/${appName}`);
            
            if (result.updated) results.updated++;
            if (result.created) results.created++;
            if (result.error) results.errors++;
            if (gitResult.removedFromGit) results.removedFromGit++;
        } catch (error) {
            console.log(`⚠️  Skipping missing app: ${appName}`);
        }
    }
    
    // Process services - read from directory since they're not in projects.index.json
    console.log('\n🔧 Processing services...');
    const servicesPath = path.join(__dirname, '..', 'services');
    try {
        const serviceDirs = await fs.readdir(servicesPath, { withFileTypes: true });
        const serviceNames = serviceDirs
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);
        
        for (const serviceName of serviceNames) {
            const servicePath = path.join(servicesPath, serviceName);
            
            try {
                const result = await checkAndFixGitignore(servicePath, `services/${serviceName}`);
                const gitResult = await removeNodeModulesFromGit(servicePath, `services/${serviceName}`);
                
                if (result.updated) results.updated++;
                if (result.created) results.created++;
                if (result.error) results.errors++;
                if (gitResult.removedFromGit) results.removedFromGit++;
            } catch (error) {
                console.log(`⚠️  Error processing service ${serviceName}: ${error.message}`);
                results.errors++;
            }
        }
    } catch (error) {
        console.log(`❌ Error reading services directory: ${error.message}`);
        results.errors++;
    }
    
    console.log('\n📊 Summary:');
    console.log(`✅ Updated: ${results.updated}`);
    console.log(`📝 Created: ${results.created}`);
    console.log(`🗑️  Removed node_modules from git: ${results.removedFromGit}`);
    console.log(`❌ Errors: ${results.errors}`);
    
    console.log('\n🎉 .gitignore fix complete!');
}

// Run main function when executed directly
main().catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
});
