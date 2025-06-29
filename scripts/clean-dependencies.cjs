#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 CODAI ECOSYSTEM: DEPENDENCIES CLEANUP');
console.log('=========================================');

// Valid dependencies (remove invalid ones)
const VALID_DEPENDENCIES = {
    dependencies: {
        "class-variance-authority": "^0.7.0",
        "@heroicons/react": "^2.0.18",
        "tailwind-merge": "^2.3.0",
        "clsx": "^2.1.1",
        "postgres": "^3.4.4",
        "@radix-ui/react-progress": "^1.0.3",
        "@radix-ui/react-tabs": "^1.0.4",
        "@radix-ui/react-select": "^2.0.0",
        // Remove invalid packages: @radix-ui/react-badge, @radix-ui/react-card, @radix-ui/react-button
        "lucide-react": "^0.263.1",
        "recharts": "^2.12.7",
        "zod": "^3.23.8",
        "uuid": "^9.0.1",
        "@types/uuid": "^9.0.8"
    },
    devDependencies: {
        "@types/node": "^20.12.12",
        "autoprefixer": "^10.4.19",
        "postcss": "^8.4.38",
        "tailwindcss": "^3.4.3"
    }
};

// Invalid packages to remove
const INVALID_PACKAGES = [
    "@radix-ui/react-badge",
    "@radix-ui/react-card",
    "@radix-ui/react-button"
];

function cleanPackageJson(filePath) {
    try {
        const packageJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        let changed = false;

        // Remove invalid packages from dependencies
        if (packageJson.dependencies) {
            for (const invalidPkg of INVALID_PACKAGES) {
                if (packageJson.dependencies[invalidPkg]) {
                    delete packageJson.dependencies[invalidPkg];
                    changed = true;
                }
            }
        }

        // Remove invalid packages from devDependencies
        if (packageJson.devDependencies) {
            for (const invalidPkg of INVALID_PACKAGES) {
                if (packageJson.devDependencies[invalidPkg]) {
                    delete packageJson.devDependencies[invalidPkg];
                    changed = true;
                }
            }
        }

        if (changed) {
            fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2));
            return true;
        }
        return false;
    } catch (error) {
        console.error(`❌ Error cleaning ${filePath}:`, error.message);
        return false;
    }
}

// Main execution
async function main() {
    console.log('📦 Step 1: Cleaning root package.json');

    // Clean root package.json
    const rootPackageJsonPath = path.join(process.cwd(), 'package.json');
    if (cleanPackageJson(rootPackageJsonPath)) {
        console.log('✅ Root package.json cleaned');
    }

    console.log('\n📦 Step 2: Cleaning all service package.json files');

    // Process apps
    const appsDir = path.join(process.cwd(), 'apps');
    if (fs.existsSync(appsDir)) {
        const apps = fs.readdirSync(appsDir);
        for (const app of apps) {
            const appPath = path.join(appsDir, app);
            const packageJsonPath = path.join(appPath, 'package.json');

            if (fs.existsSync(packageJsonPath)) {
                if (cleanPackageJson(packageJsonPath)) {
                    console.log(`  ✅ ${app}: Cleaned invalid packages`);
                }
            }
        }
    }

    // Process services
    const servicesDir = path.join(process.cwd(), 'services');
    if (fs.existsSync(servicesDir)) {
        const services = fs.readdirSync(servicesDir);
        for (const service of services) {
            const servicePath = path.join(servicesDir, service);
            const packageJsonPath = path.join(servicePath, 'package.json');

            if (fs.existsSync(packageJsonPath)) {
                if (cleanPackageJson(packageJsonPath)) {
                    console.log(`  ✅ ${service}: Cleaned invalid packages`);
                }
            }
        }
    }

    console.log('\n🎯 RESULTS SUMMARY:');
    console.log('==================');
    console.log('✅ Invalid Radix UI packages removed');
    console.log('✅ Package.json files cleaned');
    console.log('🚀 Next steps:');
    console.log('   1. Run: pnpm install');
    console.log('   2. Run: pnpm build');
    console.log('🎖️ MISSION STATUS: DEPENDENCIES CLEANED');
}

main().catch(console.error);
