#!/usr/bin/env node
/**
 * Sync Apps Script
 * Synchronizes all integrated apps with their remote repositories
 */

const fs = require('fs').promises;
const { execSync } = require('child_process');

async function syncApps() {
    console.log('🔄 Syncing all Codai apps...');

    try {
        const index = JSON.parse(await fs.readFile('projects.index.json', 'utf8'));

        for (const app of index.apps) {
            if (app.integration?.method === 'git-subtree') {
                console.log(`📦 Syncing ${app.name}...`);

                try {
                    execSync(
                        `git subtree pull --prefix=${app.path} ${app.repository} main --squash`,
                        { stdio: 'inherit' }
                    );

                    // Update sync timestamp
                    app.integration.lastSync = new Date().toISOString();

                } catch (error) {
                    console.error(`⚠️  Failed to sync ${app.name}: ${error.message}`);
                }
            }
        }

        // Update index
        index.lastUpdated = new Date().toISOString();
        await fs.writeFile('projects.index.json', JSON.stringify(index, null, 2));

        console.log('✅ App synchronization completed!');

    } catch (error) {
        console.error(`❌ Sync failed: ${error.message}`);
        process.exit(1);
    }
}

syncApps();
