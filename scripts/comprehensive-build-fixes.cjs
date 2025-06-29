#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Running comprehensive build fixes...');

const servicesDir = path.join(process.cwd(), 'services');
const services = fs.readdirSync(servicesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

let fixedCount = 0;

for (const service of services) {
    const servicePath = path.join(servicesDir, service);

    try {
        // Fix 1: Clear Next.js cache and node_modules
        const nextCachePath = path.join(servicePath, '.next');
        if (fs.existsSync(nextCachePath)) {
            try {
                execSync(`rm -rf "${nextCachePath}"`, { cwd: servicePath, stdio: 'ignore' });
            } catch (e) {
                // Ignore errors on Windows
                try {
                    execSync(`rmdir /s /q ".next"`, { cwd: servicePath, stdio: 'ignore' });
                } catch (e2) {
                    // Ignore
                }
            }
        }

        // Fix 2: Remove invalid Card variant props
        const findAndFixInvalidCardVariants = (dir) => {
            if (!fs.existsSync(dir)) return;

            const items = fs.readdirSync(dir, { withFileTypes: true });
            for (const item of items) {
                const fullPath = path.join(dir, item.name);

                if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
                    findAndFixInvalidCardVariants(fullPath);
                } else if (item.isFile() && (item.name.endsWith('.tsx') || item.name.endsWith('.ts'))) {
                    try {
                        const content = fs.readFileSync(fullPath, 'utf8');
                        if (content.includes('<Card variant=') || content.includes('<Card\\n') && content.includes('variant=')) {
                            // Remove variant prop from Card components
                            const fixed = content.replace(/<Card\s+variant="[^"]*"\s*/g, '<Card ');
                            if (fixed !== content) {
                                fs.writeFileSync(fullPath, fixed);
                                console.log(`    Fixed Card variant in ${item.name}`);
                            }
                        }
                    } catch (error) {
                        // Ignore file read errors
                    }
                }
            }
        };

        findAndFixInvalidCardVariants(servicePath);

        // Fix 3: Create tsconfig.json if missing
        const tsconfigPath = path.join(servicePath, 'tsconfig.json');
        if (!fs.existsSync(tsconfigPath)) {
            const tsconfig = {
                "extends": "../../tsconfig.base.json",
                "compilerOptions": {
                    "baseUrl": ".",
                    "paths": {
                        "@/*": ["./src/*", "./*"]
                    }
                },
                "include": [
                    "**/*.ts",
                    "**/*.tsx",
                    ".next/types/**/*.ts"
                ],
                "exclude": [
                    "node_modules",
                    ".next"
                ]
            };
            fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
            console.log(`    Created tsconfig.json for ${service}`);
        }

        // Fix 4: Create or fix next.config.js
        const nextConfigPath = path.join(servicePath, 'next.config.js');
        if (fs.existsSync(nextConfigPath)) {
            const content = fs.readFileSync(nextConfigPath, 'utf8');
            if (content.includes('export default = nextConfig')) {
                const fixed = content.replace('export default = nextConfig', 'export default nextConfig');
                fs.writeFileSync(nextConfigPath, fixed);
                console.log(`    Fixed next.config.js export syntax for ${service}`);
            }
        }

        fixedCount++;

    } catch (error) {
        console.error(`  ❌ Error processing ${service}:`, error.message);
    }
}

// Fix 5: Update workspace package.json to exclude problematic dependencies
const rootPackageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(rootPackageJsonPath)) {
    try {
        const packageJson = JSON.parse(fs.readFileSync(rootPackageJsonPath, 'utf8'));

        // Add resolution for Next.js to fix module resolution issues
        if (!packageJson.pnpm) {
            packageJson.pnpm = {};
        }
        if (!packageJson.pnpm.overrides) {
            packageJson.pnpm.overrides = {};
        }

        packageJson.pnpm.overrides.next = '^15.1.0';

        fs.writeFileSync(rootPackageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log('✅ Updated root package.json with Next.js override');
    } catch (error) {
        console.error('❌ Error updating root package.json:', error.message);
    }
}

console.log(`✅ Comprehensive fixes completed! Processed ${fixedCount} services.`);
console.log('🔄 Running pnpm install to resolve dependencies...');

try {
    execSync('pnpm install', { cwd: process.cwd(), stdio: 'inherit' });
    console.log('✅ Dependencies reinstalled successfully!');
} catch (error) {
    console.error('❌ Error reinstalling dependencies:', error.message);
}
