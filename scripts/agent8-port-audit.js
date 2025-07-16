#!/usr/bin/env node
/**
 * AGENT 8 - PORT CONFIGURATION AUDIT SCRIPT
 * Identifies conflicts between package.json ports and projects.index.json
 * Critical for service mesh and API Gateway integration
 */

const fs = require('fs').promises;
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');

async function auditPortConfigurations() {
    console.log('🔍 AGENT 8 - PORT CONFIGURATION AUDIT');
    console.log('=========================================');

    try {
        // Read the authoritative projects.index.json
        const projectsIndexPath = path.join(ROOT_DIR, 'projects.index.json');
        const projectsIndex = JSON.parse(await fs.readFile(projectsIndexPath, 'utf8'));

        console.log(`📋 Loaded projects.index.json - ${projectsIndex.totalApps} apps, ${projectsIndex.totalServices} services`);

        // Create authoritative port mapping
        const authoritativePorts = new Map();

        // Add apps
        if (projectsIndex.apps) {
            projectsIndex.apps.forEach(app => {
                authoritativePorts.set(app.name, {
                    port: app.port,
                    type: 'app',
                    description: app.description,
                    path: app.path
                });
            });
        }

        // Add services  
        if (projectsIndex.services) {
            projectsIndex.services.forEach(service => {
                authoritativePorts.set(service.name, {
                    port: service.port,
                    type: 'service',
                    description: service.description,
                    path: service.path
                });
            });
        }

        console.log(`\\n✅ Authoritative ports mapped: ${authoritativePorts.size} applications`);

        // Audit apps directory
        const appsDir = path.join(ROOT_DIR, 'apps');
        const appDirs = await fs.readdir(appsDir);

        const conflicts = [];
        const missing = [];
        const correct = [];

        for (const appDir of appDirs) {
            if (appDir === 'README.md') continue;

            const packagePath = path.join(appsDir, appDir, 'package.json');

            try {
                const packageJson = JSON.parse(await fs.readFile(packagePath, 'utf8'));
                const authInfo = authoritativePorts.get(appDir);

                if (!authInfo) {
                    missing.push({
                        name: appDir,
                        packagePort: extractPortFromScripts(packageJson.scripts),
                        reason: 'Not in projects.index.json'
                    });
                    continue;
                }

                const packagePort = extractPortFromScripts(packageJson.scripts);

                if (packagePort && packagePort !== authInfo.port) {
                    conflicts.push({
                        name: appDir,
                        authoritativePort: authInfo.port,
                        packagePort: packagePort,
                        type: authInfo.type,
                        description: authInfo.description
                    });
                } else if (packagePort === authInfo.port) {
                    correct.push({
                        name: appDir,
                        port: authInfo.port,
                        type: authInfo.type
                    });
                }

            } catch (error) {
                console.log(`⚠️ Could not read package.json for ${appDir}: ${error.message}`);
            }
        }

        // Report results
        console.log(`\\n📊 AUDIT RESULTS:`);
        console.log(`✅ Correct configurations: ${correct.length}`);
        console.log(`🚨 Port conflicts: ${conflicts.length}`);
        console.log(`❓ Missing from index: ${missing.length}`);

        if (conflicts.length > 0) {
            console.log(`\\n🚨 PORT CONFLICTS DETECTED:`);
            conflicts.forEach(conflict => {
                console.log(`  ${conflict.name}:`);
                console.log(`    ✅ Authoritative (projects.index): ${conflict.authoritativePort}`);
                console.log(`    🚨 Package.json: ${conflict.packagePort}`);
                console.log(`    📝 Type: ${conflict.type}`);
                console.log();
            });
        }

        if (missing.length > 0) {
            console.log(`\\n❓ MISSING FROM PROJECTS INDEX:`);
            missing.forEach(miss => {
                console.log(`  ${miss.name}: package.json port ${miss.packagePort || 'none'}`);
            });
        }

        // Generate fix commands
        if (conflicts.length > 0) {
            console.log(`\\n🔧 AGENT 8 INTEGRATION REPAIR COMMANDS:`);
            console.log(`# Copy these commands to fix port conflicts\\n`);

            conflicts.forEach(conflict => {
                const devScript = `"dev": "next dev --port ${conflict.authoritativePort}"`;
                const startScript = `"start": "next start --port ${conflict.authoritativePort}"`;

                console.log(`# Fix ${conflict.name}`);
                console.log(`# Update dev script to: ${devScript}`);
                console.log(`# Update start script to: ${startScript}`);
                console.log();
            });
        }

        console.log(`\\n✅ AGENT 8 PORT AUDIT COMPLETE`);
        console.log(`Integration status: ${conflicts.length === 0 ? 'READY' : 'NEEDS_REPAIR'}`);

        return {
            total: authoritativePorts.size,
            correct: correct.length,
            conflicts: conflicts.length,
            missing: missing.length,
            conflictDetails: conflicts
        };

    } catch (error) {
        console.error(`❌ AGENT 8 AUDIT FAILED: ${error.message}`);
        return null;
    }
}

function extractPortFromScripts(scripts) {
    if (!scripts) return null;

    // Look for port in dev script
    const devScript = scripts.dev || '';
    const portMatch = devScript.match(/--port\\s+(\\d+)/);

    return portMatch ? parseInt(portMatch[1]) : null;
}

// Run audit if called directly
if (require.main === module) {
    auditPortConfigurations();
}

module.exports = { auditPortConfigurations };
