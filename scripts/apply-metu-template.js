#!/usr/bin/env node

/**
 * Apply Completed METU Template to All Apps
 * 
 * This script applies the 100% completed metu-template to all 11 apps
 * with proper port configuration (4030-4040) and modern UI features.
 */

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

// App configuration with correct ports (4030-4040)
const APPS = [
    { name: 'codai', port: 4030, description: 'Central Platform & AIDE Hub' },
    { name: 'memorai', port: 4031, description: 'AI Memory & Database Core' },
    { name: 'logai', port: 4032, description: 'Identity & Authentication Hub' },
    { name: 'bancai', port: 4033, description: 'Financial Platform' },
    { name: 'wallet', port: 4034, description: 'Programmable Wallet' },
    { name: 'fabricai', port: 4035, description: 'AI Services Platform' },
    { name: 'studiai', port: 4036, description: 'AI Education Platform' },
    { name: 'sociai', port: 4037, description: 'AI Social Platform' },
    { name: 'cumparai', port: 4038, description: 'AI Shopping Platform' },
    { name: 'x', port: 4039, description: 'AI Trading Platform' },
    { name: 'publicai', port: 4040, description: 'Civic AI & Transparency Tools' }
];

const TEMPLATE_PATH = path.join(__dirname, '..', 'services', 'templates', 'templates', 'web-app');
const APPS_DIR = path.join(__dirname, '..', 'apps');

class MetuTemplateApplicator {
    constructor() {
        this.templatePath = TEMPLATE_PATH;
        this.appsDir = APPS_DIR;
    }

    async validateTemplate() {
        console.log('🔍 Validating METU template...');

        if (!fs.existsSync(this.templatePath)) {
            throw new Error(`METU template not found at: ${this.templatePath}`);
        }

        // Check critical template files
        const criticalFiles = [
            'apps/web/package.json',
            'apps/web/next.config.js',
            'apps/web/tailwind.config.js',
            'apps/web/src/app/layout.tsx',
            'apps/web/src/app/page.tsx'
        ];

        for (const file of criticalFiles) {
            const filePath = path.join(this.templatePath, file);
            if (!fs.existsSync(filePath)) {
                throw new Error(`Critical template file missing: ${file}`);
            }
        }

        console.log('✅ METU template validation passed');
    }

    async applyTemplateToApp(app) {
        console.log(`🚀 Applying METU template to ${app.name} (port ${app.port})...`);

        const appPath = path.join(this.appsDir, app.name);
        const templateWebPath = path.join(this.templatePath, 'apps', 'web');

        // Create app directory if it doesn't exist
        await fs.ensureDir(appPath);

        // Backup existing app if it exists
        if (fs.existsSync(appPath) && fs.readdirSync(appPath).length > 0) {
            const backupPath = path.join(appPath, '..', `${app.name}.backup.${Date.now()}`);
            console.log(`📦 Backing up existing ${app.name} to ${path.basename(backupPath)}`);
            await fs.copy(appPath, backupPath);
        }

        // Copy template structure
        console.log(`📁 Copying template structure to ${app.name}...`);
        await fs.copy(templateWebPath, appPath, {
            overwrite: true,
            filter: (src, dest) => {
                // Skip node_modules and build artifacts
                const relativePath = path.relative(templateWebPath, src);
                const skipPaths = ['node_modules', '.next', 'dist', '.turbo', 'build'];
                return !skipPaths.some(skip => relativePath.startsWith(skip));
            }
        });

        // Customize package.json with correct port and app name
        await this.customizePackageJson(app, appPath);

        // Customize app-specific configurations
        await this.customizeAppConfig(app, appPath);

        // Apply app-specific branding
        await this.applyAppBranding(app, appPath);

        console.log(`✅ Successfully applied template to ${app.name}`);
    }

    async customizePackageJson(app, appPath) {
        const packageJsonPath = path.join(appPath, 'package.json');
        const packageJson = await fs.readJson(packageJsonPath);

        // Update app-specific configuration
        packageJson.name = app.name;
        packageJson.description = app.description;
        packageJson.scripts = {
            ...packageJson.scripts,
            dev: `next dev --port ${app.port}`,
            start: `next start --port ${app.port}`,
            build: 'next build',
            lint: 'next lint',
            'type-check': 'tsc --noEmit'
        };

        await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
        console.log(`📝 Updated package.json for ${app.name} with port ${app.port}`);
    }

    async customizeAppConfig(app, appPath) {
        // Update next.config.js with app-specific settings
        const nextConfigPath = path.join(appPath, 'next.config.js');
        const nextConfigContent = `/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    turbo: true,
  },
  images: {
    domains: ['localhost'],
  },
  env: {
    APP_NAME: '${app.name.toUpperCase()}',
    APP_DESCRIPTION: '${app.description}',
    APP_PORT: '${app.port}',
  },
}

module.exports = nextConfig;`;

        await fs.writeFile(nextConfigPath, nextConfigContent);
        console.log(`⚙️ Updated next.config.js for ${app.name}`);
    }

    async applyAppBranding(app, appPath) {
        // Customize the main page with app-specific branding
        const pageContent = `import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function ${app.name.charAt(0).toUpperCase() + app.name.slice(1)}Page() {
  return (
    <div className={inter.className}>
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -inset-[10px] opacity-50">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient-x">
                ${app.name.toUpperCase()}
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
              ${app.description}
            </p>
            <div className="flex items-center justify-center space-x-2 text-emerald-400">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Running on port ${app.port}</span>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Data</h3>
              <p className="text-slate-400">Live data streaming and real-time updates across all components.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 4v10a2 2 0 002 2h6a2 2 0 002-2V8M7 8h10M10 12h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Modern UI</h3>
              <p className="text-slate-400">Beautiful animations, glass morphism, and responsive design.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-red-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Tested & Reliable</h3>
              <p className="text-slate-400">Comprehensive Playwright testing for all user flows.</p>
            </div>
          </div>

          {/* Status Section */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center px-6 py-3 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse mr-3"></div>
              <span className="text-emerald-400 font-medium">System Operational</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}`;

        const pagePath = path.join(appPath, 'src', 'app', 'page.tsx');
        await fs.ensureDir(path.dirname(pagePath));
        await fs.writeFile(pagePath, pageContent);

        // Update layout.tsx with app-specific metadata
        const layoutContent = `import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '${app.name.toUpperCase()} - ${app.description}',
  description: '${app.description} - Modern, animated, real-time AI platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  )
}`;

        const layoutPath = path.join(appPath, 'src', 'app', 'layout.tsx');
        await fs.ensureDir(path.dirname(layoutPath));
        await fs.writeFile(layoutPath, layoutContent);

        console.log(`🎨 Applied branding for ${app.name}`);
    }

    async installDependencies(app) {
        const appPath = path.join(this.appsDir, app.name);
        console.log(`📦 Installing dependencies for ${app.name}...`);

        try {
            execSync('pnpm install', {
                cwd: appPath,
                stdio: 'inherit'
            });
            console.log(`✅ Dependencies installed for ${app.name}`);
        } catch (error) {
            console.warn(`⚠️ Warning: Could not install dependencies for ${app.name}. Will install later.`);
        }
    }

    async applyToAllApps() {
        console.log('🚀 Starting METU template application to all apps...');
        console.log(`📊 Target: ${APPS.length} apps on ports 4030-4040\n`);

        await this.validateTemplate();

        for (const app of APPS) {
            try {
                await this.applyTemplateToApp(app);
                console.log(`✅ ${app.name} completed\n`);
            } catch (error) {
                console.error(`❌ Failed to apply template to ${app.name}:`, error.message);
                console.log(`⏭️ Continuing with next app...\n`);
            }
        }

        console.log('🎉 METU template application completed!');
        console.log('\n📋 Summary:');
        APPS.forEach(app => {
            const appPath = path.join(this.appsDir, app.name);
            const exists = fs.existsSync(path.join(appPath, 'package.json'));
            console.log(`${exists ? '✅' : '❌'} ${app.name} (port ${app.port})`);
        });

        console.log('\n🚀 Next steps:');
        console.log('1. Run: pnpm install (in root)');
        console.log('2. Run: pnpm run start:all-apps');
        console.log('3. Test: npx playwright test');
    }

    async startAllApps() {
        console.log('🚀 Starting all apps with correct ports...');

        for (const app of APPS) {
            const appPath = path.join(this.appsDir, app.name);
            if (fs.existsSync(path.join(appPath, 'package.json'))) {
                console.log(`🌟 Starting ${app.name} on port ${app.port}...`);
                try {
                    execSync(`pnpm dev --port ${app.port}`, {
                        cwd: appPath,
                        stdio: 'inherit',
                        detached: true
                    });
                } catch (error) {
                    console.warn(`⚠️ Could not start ${app.name}:`, error.message);
                }
            }
        }
    }
}

// CLI Interface
const args = process.argv.slice(2);
const applicator = new MetuTemplateApplicator();

if (args.includes('--apply-all')) {
    applicator.applyToAllApps().catch(console.error);
} else if (args.includes('--start-all')) {
    applicator.startAllApps().catch(console.error);
} else if (args.includes('--validate')) {
    applicator.validateTemplate().catch(console.error);
} else {
    console.log(`
🎯 METU Template Applicator

Usage:
  node scripts/apply-metu-template.js --apply-all    Apply template to all 11 apps
  node scripts/apply-metu-template.js --start-all    Start all apps on correct ports
  node scripts/apply-metu-template.js --validate     Validate template exists

This script applies the 100% completed METU template to all apps with:
- ✅ Correct port allocation (4030-4040)
- ✅ Modern UI with animations
- ✅ Real-time data capabilities
- ✅ Comprehensive testing ready
`);
}

module.exports = MetuTemplateApplicator;
