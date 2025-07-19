#!/usr/bin/env node

/**
 * Next.js Apps Diagnostic and Fix Script
 * Diagnoses and fixes common Next.js issues in the Codai ecosystem
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import chalk from 'chalk';
import { execSync } from 'child_process';

const PROJECT_ROOT = process.cwd();

console.log(chalk.cyan.bold('🔍 Next.js Apps Diagnostic & Fix Script\n'));

class NextJSFixer {
    constructor() {
        this.apps = [];
        this.issues = [];
        this.fixes = [];
    }

    async run() {
        console.log(chalk.blue('📋 Scanning for Next.js apps...\n'));

        // Find all Next.js apps
        const packageFiles = await glob('apps/*/package.json', {
            cwd: PROJECT_ROOT
        });

        for (const packageFile of packageFiles) {
            await this.checkApp(packageFile);
        }

        this.reportFindings();
        await this.applyFixes();
    }

    async checkApp(packagePath) {
        const fullPath = path.join(PROJECT_ROOT, packagePath);
        const appDir = path.dirname(fullPath);
        const appName = path.basename(appDir);

        try {
            const packageJson = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

            // Check if it's a Next.js app
            if (packageJson.dependencies?.next || packageJson.devDependencies?.next) {
                console.log(chalk.green(`📦 Found Next.js app: ${appName}`));

                const app = {
                    name: appName,
                    path: appDir,
                    packagePath: fullPath,
                    packageJson: packageJson,
                    issues: [],
                    fixes: []
                };

                // Check for issues
                await this.diagnoseApp(app);
                this.apps.push(app);
            }
        } catch (error) {
            console.log(chalk.red(`❌ Error reading ${packagePath}: ${error.message}`));
        }
    }

    async diagnoseApp(app) {
        const appPath = app.path; // app.path already contains the full path

        // Issue 1: Check for .next build cache
        const nextCacheExists = fs.existsSync(path.join(appPath, '.next'));
        if (nextCacheExists) {
            app.issues.push('Stale .next build cache exists');
            app.fixes.push({
                type: 'clean_cache',
                description: 'Remove .next directory',
                action: () => this.cleanNextCache(appPath)
            });
        }

        // Issue 2: Check for Next.js config
        const nextConfigExists = fs.existsSync(path.join(appPath, 'next.config.js')) ||
            fs.existsSync(path.join(appPath, 'next.config.mjs'));
        if (!nextConfigExists) {
            app.issues.push('Missing next.config.js');
            app.fixes.push({
                type: 'create_config',
                description: 'Create basic next.config.js',
                action: () => this.createNextConfig(appPath)
            });
        }

        // Issue 3: Check for TypeScript config
        const tsconfigExists = fs.existsSync(path.join(appPath, 'tsconfig.json'));
        if (!tsconfigExists) {
            app.issues.push('Missing tsconfig.json');
            app.fixes.push({
                type: 'create_tsconfig',
                description: 'Create tsconfig.json',
                action: () => this.createTsConfig(appPath)
            });
        }

        // Issue 4: Check for app directory structure
        const appDirExists = fs.existsSync(path.join(appPath, 'src', 'app')) ||
            fs.existsSync(path.join(appPath, 'app'));
        const pagesDirExists = fs.existsSync(path.join(appPath, 'src', 'pages')) ||
            fs.existsSync(path.join(appPath, 'pages'));

        if (!appDirExists && !pagesDirExists) {
            app.issues.push('Missing app or pages directory');
            app.fixes.push({
                type: 'create_structure',
                description: 'Create basic app structure',
                action: () => this.createAppStructure(appPath)
            });
        }

        // Issue 5: Check pnpm installation in app directory
        const nodeModulesExists = fs.existsSync(path.join(appPath, 'node_modules'));
        if (nodeModulesExists) {
            app.issues.push('Local node_modules exists (should use workspace)');
            app.fixes.push({
                type: 'remove_local_modules',
                description: 'Remove local node_modules',
                action: () => this.removeLocalNodeModules(appPath)
            });
        }

        // Issue 6: Check for module resolution issues
        if (app.packageJson.dependencies?.next) {
            const nextVersion = app.packageJson.dependencies.next;
            if (nextVersion.includes('15.3.5')) {
                app.issues.push('Potential Next.js 15.3.5 module resolution issue');
                app.fixes.push({
                    type: 'fix_next_resolution',
                    description: 'Add webpack config to fix module resolution',
                    action: () => this.fixNextJSResolution(appPath)
                });
            }
        }

        console.log(chalk.gray(`   Issues found: ${app.issues.length}`));
        if (app.issues.length > 0) {
            app.issues.forEach(issue => {
                console.log(chalk.yellow(`   ⚠️  ${issue}`));
            });
        }
    }

    reportFindings() {
        console.log(chalk.cyan(`\n📊 Diagnostic Results:\n`));
        console.log(chalk.blue(`Found ${this.apps.length} Next.js apps`));

        const appsWithIssues = this.apps.filter(app => app.issues.length > 0);
        console.log(chalk.yellow(`${appsWithIssues.length} apps have issues`));

        if (appsWithIssues.length > 0) {
            console.log(chalk.gray('\\nApps with issues:'));
            appsWithIssues.forEach(app => {
                console.log(chalk.red(`  ❌ ${app.name}: ${app.issues.length} issues`));
            });
        }

        const healthyApps = this.apps.filter(app => app.issues.length === 0);
        if (healthyApps.length > 0) {
            console.log(chalk.gray('\\nHealthy apps:'));
            healthyApps.forEach(app => {
                console.log(chalk.green(`  ✅ ${app.name}`));
            });
        }
    }

    async applyFixes() {
        console.log(chalk.blue('\\n🔧 Applying fixes...\\n'));

        for (const app of this.apps) {
            if (app.fixes.length > 0) {
                console.log(chalk.yellow(`🛠️  Fixing ${app.name}...`));

                for (const fix of app.fixes) {
                    try {
                        console.log(chalk.gray(`   - ${fix.description}`));
                        await fix.action();
                        console.log(chalk.green(`   ✅ ${fix.description} completed`));
                    } catch (error) {
                        console.log(chalk.red(`   ❌ ${fix.description} failed: ${error.message}`));
                    }
                }
            }
        }
    }

    cleanNextCache(appPath) {
        const nextDir = path.join(appPath, '.next');
        if (fs.existsSync(nextDir)) {
            fs.rmSync(nextDir, { recursive: true, force: true });
        }
    }

    createNextConfig(appPath) {
        const configContent = `/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  poweredByHeader: false,
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  webpack: (config, { isServer, webpack }) => {
    // Fix for workspace module resolution
    config.resolve.symlinks = false;
    
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;
`;

        fs.writeFileSync(path.join(appPath, 'next.config.js'), configContent);
    }

    createTsConfig(appPath) {
        const tsconfigContent = {
            "extends": "../../tsconfig.base.json",
            "compilerOptions": {
                "plugins": [
                    {
                        "name": "next"
                    }
                ],
                "paths": {
                    "@/*": ["./src/*"]
                }
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

        fs.writeFileSync(path.join(appPath, 'tsconfig.json'), JSON.stringify(tsconfigContent, null, 2));
    }

    createAppStructure(appPath) {
        // Create src/app directory structure
        const srcAppDir = path.join(appPath, 'src', 'app');
        if (!fs.existsSync(srcAppDir)) {
            fs.mkdirSync(srcAppDir, { recursive: true });
        }

        // Create layout.tsx
        const layoutPath = path.join(srcAppDir, 'layout.tsx');
        if (!fs.existsSync(layoutPath)) {
            const layoutContent = `import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Codai App',
  description: 'Generated by Codai ecosystem',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
`;
            fs.writeFileSync(layoutPath, layoutContent);
        }

        // Create page.tsx
        const pagePath = path.join(srcAppDir, 'page.tsx');
        if (!fs.existsSync(pagePath)) {
            const pageContent = `export default function Home() {
  return (
    <div>
      <h1>Welcome to Codai</h1>
      <p>This app is part of the Codai ecosystem.</p>
    </div>
  )
}
`;
            fs.writeFileSync(pagePath, pageContent);
        }
    }

    removeLocalNodeModules(appPath) {
        const nodeModulesPath = path.join(appPath, 'node_modules');
        if (fs.existsSync(nodeModulesPath)) {
            fs.rmSync(nodeModulesPath, { recursive: true, force: true });
        }
    }

    fixNextJSResolution(appPath) {
        const nextConfigPath = path.join(appPath, 'next.config.js');

        if (fs.existsSync(nextConfigPath)) {
            let config = fs.readFileSync(nextConfigPath, 'utf8');

            // Add symlinks fix if not present
            if (!config.includes('symlinks: false')) {
                config = config.replace(
                    'webpack: (config, { isServer }) => {',
                    `webpack: (config, { isServer, webpack }) => {
    // Fix for workspace module resolution
    config.resolve.symlinks = false;
    `
                );

                fs.writeFileSync(nextConfigPath, config);
            }
        } else {
            this.createNextConfig(appPath);
        }
    }
}

// Run the fixer
const fixer = new NextJSFixer();
fixer.run().catch(console.error);
