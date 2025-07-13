#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 FIXING WORKSPACE NAMING CONFLICTS');
console.log('====================================');

function fixWorkspaceNames() {
    // Map of services to rename
    const serviceRenamings = [
        'bancai', 'codai', 'cumparai', 'fabricai', 'logai',
        'memorai', 'publicai', 'sociai', 'studiai', 'wallet', 'x'
    ];

    for (const serviceName of serviceRenamings) {
        const servicePath = path.join(process.cwd(), 'services', serviceName, 'package.json');
        if (fs.existsSync(servicePath)) {
            try {
                const packageJson = JSON.parse(fs.readFileSync(servicePath, 'utf8'));
                const oldName = packageJson.name;
                packageJson.name = `@codai/${serviceName}-service`;

                fs.writeFileSync(servicePath, JSON.stringify(packageJson, null, 2));
                console.log(`  ✅ Renamed service: ${oldName} -> ${packageJson.name}`);
            } catch (error) {
                console.error(`  ❌ Error renaming ${serviceName}:`, error.message);
            }
        }
    }
}

fixWorkspaceNames();
console.log('🎖️ WORKSPACE NAMING FIXES COMPLETE');
