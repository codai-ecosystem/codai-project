const fs = require('fs').promises;
const path = require('path');

const SHARED_DEPS = [
    '@types/node',
    '@types/react',
    '@types/react-dom',
    'class-variance-authority',
    'clsx',
    'framer-motion',
    'lucide-react',
    'next',
    'react',
    'react-dom',
    'tailwind-merge',
    'typescript'
];

const CORE_APPS = [
    'apps/bancai',
    'apps/codai',
    'apps/explorer',
    'apps/logai',
    'apps/memorai',
    'apps/publicai',
    'apps/wallet'
];

async function consolidateDependencies() {
    console.log('🔧 Consolidating dependencies...\n');

    for (const appPath of CORE_APPS) {
        const packageJsonPath = path.join(appPath, 'package.json');

        try {
            const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');
            const packageJson = JSON.parse(packageJsonContent);

            console.log(`📦 Processing ${appPath}...`);

            let removedDeps = [];
            let removedDevDeps = [];

            // Remove shared dependencies
            if (packageJson.dependencies) {
                for (const dep of SHARED_DEPS) {
                    if (packageJson.dependencies[dep]) {
                        delete packageJson.dependencies[dep];
                        removedDeps.push(dep);
                    }
                }

                // Clean up empty dependencies object
                if (Object.keys(packageJson.dependencies).length === 0) {
                    delete packageJson.dependencies;
                }
            }

            // Remove shared devDependencies  
            if (packageJson.devDependencies) {
                for (const dep of SHARED_DEPS) {
                    if (packageJson.devDependencies[dep]) {
                        delete packageJson.devDependencies[dep];
                        removedDevDeps.push(dep);
                    }
                }

                // Clean up empty devDependencies object
                if (Object.keys(packageJson.devDependencies).length === 0) {
                    delete packageJson.devDependencies;
                }
            }

            // Write updated package.json
            await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

            if (removedDeps.length > 0) {
                console.log(`  ✅ Removed ${removedDeps.length} dependencies: ${removedDeps.join(', ')}`);
            }
            if (removedDevDeps.length > 0) {
                console.log(`  ✅ Removed ${removedDevDeps.length} devDependencies: ${removedDevDeps.join(', ')}`);
            }
            if (removedDeps.length === 0 && removedDevDeps.length === 0) {
                console.log(`  ℹ️  No shared dependencies found to remove`);
            }

        } catch (error) {
            console.error(`❌ Error processing ${appPath}:`, error.message);
        }
    }

    console.log('\n✅ Dependency consolidation complete!');
    console.log('\n📋 Summary:');
    console.log(`- Shared dependencies moved to workspace root: ${SHARED_DEPS.length}`);
    console.log(`- Apps updated: ${CORE_APPS.length}`);
    console.log('\n🚀 Run "pnpm install" to apply changes');
}

consolidateDependencies().catch(console.error);
