#!/usr/bin/env node

/**
 * CODAI Ecosystem - Systematic Deployment Readiness Fix Script
 * Phase 1: Foundation Repair - Dependencies, TypeScript, and Essential Files
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 CODAI DEPLOYMENT READINESS - PHASE 1: FOUNDATION REPAIR');
console.log('===============================================================');

// Configuration
const ROOT_DIR = path.resolve(path.dirname(__dirname));
const APPS_DIR = path.join(ROOT_DIR, 'apps');
const PACKAGES_DIR = path.join(ROOT_DIR, 'packages');
const LIBS_DIR = path.join(ROOT_DIR, 'libs');

// Port assignments for apps
const PORT_ASSIGNMENTS = {
    'codai': 3000,
    'bancai': 3522,
    'memorai': 3693,
    'admin': 3200,
    'hub': 4700,
    'id': 4800,
    'acasai': 3100,
    'aide': 3300,
    'ajutai': 3400,
    'analizai': 3500,
    'conversai': 3700,
    'cumparai': 3800,
    'curtai': 3900,
    'dash': 4000,
    'dexai': 4100,
    'docs': 4200,
    'donai': 4300,
    'explorer': 4400,
    'fabricai': 4500,
    'glass': 4600,
    'jucai': 4900,
    'kodex': 5000,
    'legalizai': 5100,
    'logai': 5200,
    'marketai': 5300,
    'metu': 5400,
    'metu-web': 5500,
    'mobile': 5600,
    'mod': 5700,
    'muzicai': 5800,
    'prezentai': 5900,
    'publicai': 6000,
    'romai': 6100,
    'sociai': 6200,
    'stocai': 6300,
    'studiai': 6400,
    'sunai': 6500,
    'talentai': 6600,
    'tools': 6700,
    'wallet': 6800,
    'x': 6900,
    'bancai-mobile': 3600,
    'codai-mobile': 3050
};

// Standard Next.js tsconfig template
const NEXTJS_TSCONFIG_TEMPLATE = {
    "extends": "../../tsconfig.base.json",
    "compilerOptions": {
        "plugins": [
            {
                "name": "next"
            }
        ]
    },
    "include": [
        "next-env.d.ts",
        "**/*.ts",
        "**/*.tsx",
        ".next/types/**/*.ts"
    ],
    "exclude": [
        "node_modules"
    ]
};

// Standard package.json scripts for Next.js apps
const STANDARD_SCRIPTS = (port) => ({
    "dev": `next dev -p ${port}`,
    "build": "next build",
    "start": `next start -p ${port}`,
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest watch",
    "lint": "next lint",
    "type-check": "pnpm exec tsc --noEmit"
});

// Utility functions
const log = (message, level = 'info') => {
    const colors = {
        info: '\x1b[36m',
        success: '\x1b[32m',
        warning: '\x1b[33m',
        error: '\x1b[31m',
        reset: '\x1b[0m'
    };
    console.log(`${colors[level]}${message}${colors.reset}`);
};

const fileExists = (filePath) => fs.existsSync(filePath);

const readJsonFile = (filePath) => {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        log(`Error reading ${filePath}: ${error.message}`, 'error');
        return null;
    }
};

const writeJsonFile = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
        return true;
    } catch (error) {
        log(`Error writing ${filePath}: ${error.message}`, 'error');
        return false;
    }
};

// Main fix functions
async function fixAppConfiguration(appPath, appName) {
    log(`\n🔧 Fixing ${appName}...`);

    const packageJsonPath = path.join(appPath, 'package.json');
    const tsConfigPath = path.join(appPath, 'tsconfig.json');
    const nextConfigPath = path.join(appPath, 'next.config.js');

    // Fix package.json
    if (fileExists(packageJsonPath)) {
        const packageJson = readJsonFile(packageJsonPath);
        if (packageJson) {
            // Update scripts
            const port = PORT_ASSIGNMENTS[appName] || 3000;
            packageJson.scripts = { ...packageJson.scripts, ...STANDARD_SCRIPTS(port) };

            // Ensure essential dependencies
            if (!packageJson.dependencies) packageJson.dependencies = {};
            if (!packageJson.devDependencies) packageJson.devDependencies = {};

            // Add essential Next.js dependencies if missing
            if (!packageJson.dependencies.next) {
                packageJson.dependencies.next = "^15.4.1";
            }
            if (!packageJson.dependencies.react) {
                packageJson.dependencies.react = "^19.1.0";
            }
            if (!packageJson.dependencies["react-dom"]) {
                packageJson.dependencies["react-dom"] = "^19.1.0";
            }

            // Add essential dev dependencies
            if (!packageJson.devDependencies.typescript) {
                packageJson.devDependencies.typescript = "^5.8.3";
            }
            if (!packageJson.devDependencies["@types/react"]) {
                packageJson.devDependencies["@types/react"] = "^19.1.8";
            }
            if (!packageJson.devDependencies["@types/react-dom"]) {
                packageJson.devDependencies["@types/react-dom"] = "^19.1.6";
            }

            if (writeJsonFile(packageJsonPath, packageJson)) {
                log(`  ✅ Updated package.json (port: ${port})`, 'success');
            }
        }
    }

    // Fix tsconfig.json
    if (!fileExists(tsConfigPath)) {
        if (writeJsonFile(tsConfigPath, NEXTJS_TSCONFIG_TEMPLATE)) {
            log(`  ✅ Created tsconfig.json`, 'success');
        }
    } else {
        const existingTsConfig = readJsonFile(tsConfigPath);
        if (existingTsConfig && !existingTsConfig.extends) {
            existingTsConfig.extends = "../../tsconfig.base.json";
            if (writeJsonFile(tsConfigPath, existingTsConfig)) {
                log(`  ✅ Updated tsconfig.json to extend base config`, 'success');
            }
        }
    }

    // Create basic next.config.js if missing
    if (!fileExists(nextConfigPath)) {
        const nextConfigContent = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@codai/shared-ui', '@codai/shared-types'],
  experimental: {
    typedRoutes: true,
  },
}

module.exports = nextConfig
`;
        fs.writeFileSync(nextConfigPath, nextConfigContent);
        log(`  ✅ Created next.config.js`, 'success');
    }

    // Ensure essential directories exist
    const essentialDirs = ['app', 'components', 'lib'];
    for (const dir of essentialDirs) {
        const dirPath = path.join(appPath, dir);
        if (!fileExists(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });

            // Create basic page structure for app directory
            if (dir === 'app') {
                const layoutContent = `import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: '${appName.charAt(0).toUpperCase() + appName.slice(1)}',
  description: 'AI-powered application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
`;
                const pageContent = `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">${appName.charAt(0).toUpperCase() + appName.slice(1)}</h1>
      <p>Welcome to ${appName}!</p>
    </main>
  )
}
`;
                const globalCssContent = `@tailwind base;
@tailwind components;
@tailwind utilities;
`;

                fs.writeFileSync(path.join(dirPath, 'layout.tsx'), layoutContent);
                fs.writeFileSync(path.join(dirPath, 'page.tsx'), pageContent);
                fs.writeFileSync(path.join(dirPath, 'globals.css'), globalCssContent);
                log(`  ✅ Created app directory structure`, 'success');
            }
        }
    }
}

async function main() {
    log('Starting Phase 1: Foundation Repair...', 'info');

    // Step 1: Get all apps
    log('\n📊 Step 1.1: Scanning applications...', 'info');

    if (!fileExists(APPS_DIR)) {
        log('Apps directory not found!', 'error');
        process.exit(1);
    }

    const apps = fs.readdirSync(APPS_DIR)
        .filter(item => {
            const itemPath = path.join(APPS_DIR, item);
            return fs.statSync(itemPath).isDirectory() && item !== 'README.md';
        });

    log(`Found ${apps.length} applications to process`, 'success');

    // Step 2: Fix each app systematically
    log('\n📊 Step 1.2: Processing applications...', 'info');

    const priorityApps = ['codai', 'admin', 'hub', 'id', 'bancai', 'memorai'];
    const otherApps = apps.filter(app => !priorityApps.includes(app));
    const appsToProcess = [...priorityApps, ...otherApps];

    let processedCount = 0;
    let errorCount = 0;

    for (const app of appsToProcess) {
        try {
            const appPath = path.join(APPS_DIR, app);
            await fixAppConfiguration(appPath, app);
            processedCount++;
        } catch (error) {
            log(`Error processing ${app}: ${error.message}`, 'error');
            errorCount++;
        }
    }

    // Step 3: Summary
    log(`\n📊 Phase 1 Summary:`, 'info');
    log(`✅ Successfully processed: ${processedCount} apps`, 'success');
    if (errorCount > 0) {
        log(`❌ Errors encountered: ${errorCount} apps`, 'error');
    }

    log('\n🚀 Phase 1 Complete! Next: Run "pnpm install" to update dependencies', 'success');
    log('📋 Ready for Phase 2: Build System Optimization', 'info');
}

// Run the script
main().catch((error) => {
    log(`Fatal error: ${error.message}`, 'error');
    process.exit(1);
});
