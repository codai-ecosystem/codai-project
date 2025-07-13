#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Define all service and app directories
const directories = [
    // Apps
    'apps/bancai',
    'apps/codai',
    'apps/cumparai',
    'apps/fabricai',
    'apps/logai',
    'apps/memorai',
    'apps/publicai',
    'apps/sociai',
    'apps/studiai',
    'apps/wallet',
    'apps/x',
    // Services
    'services/admin',
    'services/AIDE',
    'services/ajutai',
    'services/analizai',
    'services/dash',
    'services/docs',
    'services/explorer',
    'services/hub',
    'services/id',
    'services/jucai',
    'services/kodex',
    'services/legalizai',
    'services/marketai',
    'services/metu',
    'services/mod',
    'services/publicai',
    'services/stocai',
    'services/templates',
    'services/tools'
];

console.log('🔧 FIXING REACT DEPENDENCIES ACROSS ECOSYSTEM...\n');

let fixed = 0;
let errors = 0;

directories.forEach((dir) => {
    const fullPath = path.join(path.dirname(__dirname), dir);
    const packageJsonPath = path.join(fullPath, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
        console.log(`⚠️  Skipping ${dir} - no package.json found`);
        return;
    }

    try {
        console.log(`🔧 Processing ${dir}...`);

        // Read package.json
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

        // Check if React dependencies are missing or in wrong place
        const needsReactFix = !packageJson.dependencies?.react ||
            !packageJson.dependencies?.['react-dom'] ||
            packageJson.devDependencies?.react ||
            packageJson.devDependencies?.['react-dom'];

        if (needsReactFix) {
            console.log(`   📦 Adding React dependencies...`);

            // Ensure dependencies object exists
            if (!packageJson.dependencies) {
                packageJson.dependencies = {};
            }

            // Add React dependencies to main dependencies
            packageJson.dependencies.react = "18.3.1";
            packageJson.dependencies['react-dom'] = "18.3.1";

            // Remove from devDependencies if present
            if (packageJson.devDependencies?.react) {
                delete packageJson.devDependencies.react;
            }
            if (packageJson.devDependencies?.['react-dom']) {
                delete packageJson.devDependencies['react-dom'];
            }

            // Also ensure @types/react and @types/react-dom are in devDependencies
            if (!packageJson.devDependencies) {
                packageJson.devDependencies = {};
            }

            packageJson.devDependencies['@types/react'] = "^18.3.12";
            packageJson.devDependencies['@types/react-dom'] = "^18.3.1";

            // Write updated package.json
            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

            console.log(`   ✅ Fixed React dependencies in ${dir}`);
            fixed++;
        } else {
            console.log(`   ✅ React dependencies already correct in ${dir}`);
        }

    } catch (error) {
        console.error(`   ❌ Error processing ${dir}:`, error.message);
        errors++;
    }
});

console.log('\n============================================================');
console.log('🔧 REACT DEPENDENCY FIX SUMMARY');
console.log('============================================================');
console.log(`📊 Services processed: ${directories.length}`);
console.log(`✅ Services fixed: ${fixed}`);
console.log(`❌ Errors encountered: ${errors}`);

if (fixed > 0) {
    console.log('\n🚀 Running pnpm install to update dependencies...');
    try {
        execSync('pnpm install', { stdio: 'inherit', cwd: path.dirname(__dirname) });
        console.log('✅ Dependencies updated successfully!');
    } catch (error) {
        console.error('❌ Error updating dependencies:', error.message);
    }
}

console.log('\n🎯 Next steps:');
console.log('   1. React dependencies are now properly configured');
console.log('   2. Run build test to verify improvements');
console.log('   3. Address any remaining build issues');
console.log('============================================================');
