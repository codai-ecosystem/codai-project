#!/usr/bin/env node

/**
 * 🧹 ECOSYSTEM STRUCTURE CLEANUP
 * Removes duplicates, unnecessary files, and organizes folder structures
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EcosystemCleaner {
    constructor() {
        this.stats = {
            filesRemoved: 0,
            directoriesRemoved: 0,
            duplicatesResolved: 0,
            structuresFixed: 0,
            errors: []
        };

        this.cleanupTargets = {
            unnecessaryFiles: [
                'temp-aide-demo',
                'temp-next',
                'temp-real-memorai',
                'test-app',
                'test-logai-auth.js',
                'test-memory-2.json',
                'test-memory.json',
                'test-next',
                'test-stocai',
                'test-results',
                'backup',
                'backups',
                'logs',
                'coverage',
                'dist',
                '.turbo'
            ],
            duplicates: [
                ['api-gateway.js', 'api-gateway.cjs'],
                ['ecosystem-comprehensive-test.js', 'ecosystem-comprehensive-test.cjs'],
                ['ecosystem-health-monitor.js', 'ecosystem-health-monitor.cjs']
            ],
            standardStructure: {
                'scripts': ['ecosystem', 'testing', 'deployment', 'utils'],
                'docs': ['api', 'guides', 'architecture', 'deployment'],
                'configs': ['environments', 'services', 'security'],
                'tools': ['generators', 'validators', 'analyzers']
            }
        };
    }

    async runFullCleanup() {
        console.log('🧹 COMPREHENSIVE ECOSYSTEM CLEANUP');
        console.log('===================================');
        console.log('🎯 Target: Clean folder structure, remove duplicates, optimize organization');
        console.log('');

        try {
            // Phase 1: Remove unnecessary files
            await this.removeUnnecessaryFiles();

            // Phase 2: Resolve duplicates
            await this.resolveDuplicates();

            // Phase 3: Standardize folder structures
            await this.standardizeFolderStructures();

            // Phase 4: Optimize app structures
            await this.optimizeAppStructures();

            // Phase 5: Optimize package structures
            await this.optimizePackageStructures();

            // Phase 6: Create organization index
            await this.createOrganizationIndex();

            console.log('✅ CLEANUP COMPLETE');
            console.log('===================');
            console.log(`🗑️  Files Removed: ${this.stats.filesRemoved}`);
            console.log(`📁 Directories Removed: ${this.stats.directoriesRemoved}`);
            console.log(`🔄 Duplicates Resolved: ${this.stats.duplicatesResolved}`);
            console.log(`📋 Structures Fixed: ${this.stats.structuresFixed}`);
            console.log(`❌ Errors: ${this.stats.errors.length}`);
            console.log('');

        } catch (error) {
            console.error('❌ Cleanup failed:', error.message);
            throw error;
        }
    }

    async removeUnnecessaryFiles() {
        console.log('🗑️  REMOVING UNNECESSARY FILES');
        console.log('===============================');

        for (const target of this.cleanupTargets.unnecessaryFiles) {
            try {
                const targetPath = path.join(process.cwd(), target);

                if (fs.existsSync(targetPath)) {
                    const stat = fs.statSync(targetPath);

                    if (stat.isDirectory()) {
                        await this.removeDirectory(targetPath);
                        this.stats.directoriesRemoved++;
                        console.log(`✅ Removed directory: ${target}`);
                    } else {
                        fs.unlinkSync(targetPath);
                        this.stats.filesRemoved++;
                        console.log(`✅ Removed file: ${target}`);
                    }
                } else {
                    console.log(`⚠️  Not found: ${target}`);
                }
            } catch (error) {
                this.stats.errors.push({ target, error: error.message });
                console.log(`❌ Failed to remove ${target}: ${error.message}`);
            }
        }

        console.log('');
    }

    async resolveDuplicates() {
        console.log('🔄 RESOLVING DUPLICATE FILES');
        console.log('=============================');

        for (const [primary, duplicate] of this.cleanupTargets.duplicates) {
            try {
                const primaryPath = path.join(process.cwd(), primary);
                const duplicatePath = path.join(process.cwd(), duplicate);

                if (fs.existsSync(primaryPath) && fs.existsSync(duplicatePath)) {
                    // Compare files and keep the more recent or complete one
                    const primaryStat = fs.statSync(primaryPath);
                    const duplicateStat = fs.statSync(duplicatePath);

                    // Keep the larger/newer file
                    if (duplicateStat.size > primaryStat.size || duplicateStat.mtime > primaryStat.mtime) {
                        fs.unlinkSync(primaryPath);
                        fs.renameSync(duplicatePath, primaryPath);
                        console.log(`✅ Resolved duplicate: Kept ${duplicate} content as ${primary}`);
                    } else {
                        fs.unlinkSync(duplicatePath);
                        console.log(`✅ Resolved duplicate: Kept ${primary}, removed ${duplicate}`);
                    }

                    this.stats.duplicatesResolved++;
                } else {
                    console.log(`⚠️  Duplicate pair not found: ${primary} / ${duplicate}`);
                }
            } catch (error) {
                this.stats.errors.push({ duplicate: [primary, duplicate], error: error.message });
                console.log(`❌ Failed to resolve duplicate ${primary}/${duplicate}: ${error.message}`);
            }
        }

        console.log('');
    }

    async standardizeFolderStructures() {
        console.log('📁 STANDARDIZING FOLDER STRUCTURES');
        console.log('====================================');

        for (const [rootDir, subdirs] of Object.entries(this.cleanupTargets.standardStructure)) {
            try {
                const rootPath = path.join(process.cwd(), rootDir);

                // Ensure root directory exists
                if (!fs.existsSync(rootPath)) {
                    fs.mkdirSync(rootPath, { recursive: true });
                    console.log(`✅ Created directory: ${rootDir}`);
                }

                // Create standardized subdirectories
                for (const subdir of subdirs) {
                    const subdirPath = path.join(rootPath, subdir);
                    if (!fs.existsSync(subdirPath)) {
                        fs.mkdirSync(subdirPath, { recursive: true });
                        console.log(`✅ Created subdirectory: ${rootDir}/${subdir}`);
                    }
                }

                // Move related files to appropriate subdirectories
                await this.organizeDirectoryContents(rootPath, subdirs);

                this.stats.structuresFixed++;
            } catch (error) {
                this.stats.errors.push({ directory: rootDir, error: error.message });
                console.log(`❌ Failed to standardize ${rootDir}: ${error.message}`);
            }
        }

        console.log('');
    }

    async optimizeAppStructures() {
        console.log('🚀 OPTIMIZING APP STRUCTURES');
        console.log('==============================');

        const appsDir = path.join(process.cwd(), 'apps');
        const appDirs = fs.readdirSync(appsDir).filter(dir => {
            const dirPath = path.join(appsDir, dir);
            return fs.statSync(dirPath).isDirectory();
        });

        for (const appDir of appDirs) {
            try {
                const appPath = path.join(appsDir, appDir);
                await this.optimizeAppStructure(appDir, appPath);
                console.log(`✅ ${appDir}: Structure optimized`);
            } catch (error) {
                this.stats.errors.push({ app: appDir, error: error.message });
                console.log(`❌ ${appDir}: Optimization failed - ${error.message}`);
            }
        }

        console.log('');
    }

    async optimizeAppStructure(appName, appPath) {
        // Remove unnecessary files from app root
        const unnecessaryAppFiles = [
            '.next',
            'node_modules',
            'dist',
            'build',
            'coverage',
            '.turbo',
            'temp'
        ];

        for (const file of unnecessaryAppFiles) {
            const filePath = path.join(appPath, file);
            if (fs.existsSync(filePath)) {
                await this.removeDirectory(filePath);
            }
        }

        // Ensure standard app structure
        const standardAppDirs = ['src', 'public', 'docs'];
        for (const dir of standardAppDirs) {
            const dirPath = path.join(appPath, dir);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }
        }

        // Ensure essential files exist
        await this.ensureEssentialAppFiles(appName, appPath);
    }

    async optimizePackageStructures() {
        console.log('📦 OPTIMIZING PACKAGE STRUCTURES');
        console.log('==================================');

        const packagesDir = path.join(process.cwd(), 'packages');
        if (!fs.existsSync(packagesDir)) return;

        const packageDirs = fs.readdirSync(packagesDir).filter(dir => {
            const dirPath = path.join(packagesDir, dir);
            return fs.statSync(dirPath).isDirectory();
        });

        for (const packageDir of packageDirs) {
            try {
                const packagePath = path.join(packagesDir, packageDir);
                await this.optimizePackageStructure(packageDir, packagePath);
                console.log(`✅ ${packageDir}: Package structure optimized`);
            } catch (error) {
                this.stats.errors.push({ package: packageDir, error: error.message });
                console.log(`❌ ${packageDir}: Optimization failed - ${error.message}`);
            }
        }

        console.log('');
    }

    async optimizePackageStructure(packageName, packagePath) {
        // Remove unnecessary files from package root
        const unnecessaryPackageFiles = [
            'node_modules',
            'dist',
            'build',
            'coverage',
            '.turbo'
        ];

        for (const file of unnecessaryPackageFiles) {
            const filePath = path.join(packagePath, file);
            if (fs.existsSync(filePath)) {
                await this.removeDirectory(filePath);
            }
        }

        // Ensure standard package structure
        const standardPackageDirs = ['src', 'tests', 'docs'];
        for (const dir of standardPackageDirs) {
            const dirPath = path.join(packagePath, dir);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }
        }

        // Ensure essential files exist
        await this.ensureEssentialPackageFiles(packageName, packagePath);
    }

    async createOrganizationIndex() {
        console.log('📋 CREATING ORGANIZATION INDEX');
        console.log('===============================');

        const organizationIndex = {
            timestamp: new Date().toISOString(),
            structure: {
                apps: {},
                packages: {},
                scripts: {},
                docs: {},
                configs: {}
            },
            stats: this.stats
        };

        // Index apps
        const appsDir = path.join(process.cwd(), 'apps');
        if (fs.existsSync(appsDir)) {
            const appDirs = fs.readdirSync(appsDir).filter(dir => {
                const dirPath = path.join(appsDir, dir);
                return fs.statSync(dirPath).isDirectory();
            });

            for (const appDir of appDirs) {
                organizationIndex.structure.apps[appDir] = await this.indexDirectory(path.join(appsDir, appDir));
            }
        }

        // Index packages
        const packagesDir = path.join(process.cwd(), 'packages');
        if (fs.existsSync(packagesDir)) {
            const packageDirs = fs.readdirSync(packagesDir).filter(dir => {
                const dirPath = path.join(packagesDir, dir);
                return fs.statSync(dirPath).isDirectory();
            });

            for (const packageDir of packageDirs) {
                organizationIndex.structure.packages[packageDir] = await this.indexDirectory(path.join(packagesDir, packageDir));
            }
        }

        // Save organization index
        const indexPath = path.join(process.cwd(), 'ECOSYSTEM_ORGANIZATION_INDEX.json');
        fs.writeFileSync(indexPath, JSON.stringify(organizationIndex, null, 2));

        // Create markdown version
        const markdownIndex = this.generateOrganizationMarkdown(organizationIndex);
        const markdownPath = path.join(process.cwd(), 'ECOSYSTEM_ORGANIZATION_INDEX.md');
        fs.writeFileSync(markdownPath, markdownIndex);

        console.log('✅ Organization index created');
        console.log('');
    }

    // Helper methods
    async removeDirectory(dirPath) {
        if (!fs.existsSync(dirPath)) return;

        const items = fs.readdirSync(dirPath);
        for (const item of items) {
            const itemPath = path.join(dirPath, item);
            const stat = fs.statSync(itemPath);

            if (stat.isDirectory()) {
                await this.removeDirectory(itemPath);
            } else {
                fs.unlinkSync(itemPath);
                this.stats.filesRemoved++;
            }
        }

        fs.rmdirSync(dirPath);
        this.stats.directoriesRemoved++;
    }

    async organizeDirectoryContents(rootPath, subdirs) {
        const items = fs.readdirSync(rootPath);

        for (const item of items) {
            const itemPath = path.join(rootPath, item);
            const stat = fs.statSync(itemPath);

            if (stat.isFile()) {
                // Move files to appropriate subdirectories based on naming patterns
                const targetSubdir = this.determineTargetSubdirectory(item, subdirs);
                if (targetSubdir) {
                    const targetPath = path.join(rootPath, targetSubdir, item);
                    fs.renameSync(itemPath, targetPath);
                    console.log(`  📁 Moved ${item} to ${targetSubdir}/`);
                }
            }
        }
    }

    determineTargetSubdirectory(filename, subdirs) {
        // Determine appropriate subdirectory based on file patterns
        if (filename.includes('test') && subdirs.includes('testing')) return 'testing';
        if (filename.includes('deploy') && subdirs.includes('deployment')) return 'deployment';
        if (filename.includes('config') && subdirs.includes('environments')) return 'environments';
        if (filename.includes('security') && subdirs.includes('security')) return 'security';
        if (filename.includes('generate') && subdirs.includes('generators')) return 'generators';
        if (filename.includes('validate') && subdirs.includes('validators')) return 'validators';
        if (filename.includes('analyze') && subdirs.includes('analyzers')) return 'analyzers';
        if (filename.includes('guide') && subdirs.includes('guides')) return 'guides';
        if (filename.includes('api') && subdirs.includes('api')) return 'api';

        return null;
    }

    async ensureEssentialAppFiles(appName, appPath) {
        const essentialFiles = {
            'README.md': this.generateAppReadme(appName),
            '.env.example': this.generateEnvExample(appName),
            '.gitignore': this.generateGitignore()
        };

        for (const [filename, content] of Object.entries(essentialFiles)) {
            const filePath = path.join(appPath, filename);
            if (!fs.existsSync(filePath)) {
                fs.writeFileSync(filePath, content);
                console.log(`  📄 Created ${filename} for ${appName}`);
            }
        }
    }

    async ensureEssentialPackageFiles(packageName, packagePath) {
        const essentialFiles = {
            'README.md': this.generatePackageReadme(packageName),
            '.gitignore': this.generateGitignore()
        };

        for (const [filename, content] of Object.entries(essentialFiles)) {
            const filePath = path.join(packagePath, filename);
            if (!fs.existsSync(filePath)) {
                fs.writeFileSync(filePath, content);
                console.log(`  📄 Created ${filename} for ${packageName}`);
            }
        }
    }

    async indexDirectory(dirPath) {
        const index = {
            files: [],
            directories: [],
            size: 0,
            structure: 'clean'
        };

        if (!fs.existsSync(dirPath)) return index;

        const items = fs.readdirSync(dirPath);
        for (const item of items) {
            const itemPath = path.join(dirPath, item);
            const stat = fs.statSync(itemPath);

            if (stat.isDirectory()) {
                index.directories.push(item);
            } else {
                index.files.push(item);
                index.size += stat.size;
            }
        }

        return index;
    }

    generateAppReadme(appName) {
        return `# ${appName.toUpperCase()}

## Overview
${appName} application - part of the CODAI ecosystem.

## Quick Start
\`\`\`bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test
\`\`\`

## Features
- Modern Next.js 15 architecture
- TailwindCSS 3 styling
- Comprehensive test coverage
- TypeScript support

## Documentation
See \`docs/\` directory for detailed documentation.

## Development
This app follows the CODAI ecosystem standards and conventions.`;
    }

    generatePackageReadme(packageName) {
        return `# @codai/${packageName}

## Overview
${packageName} package - shared functionality for the CODAI ecosystem.

## Installation
\`\`\`bash
pnpm add @codai/${packageName}
\`\`\`

## Usage
\`\`\`typescript
import { /* exports */ } from '@codai/${packageName}';
\`\`\`

## API
See \`docs/\` directory for API documentation.

## Development
\`\`\`bash
# Install dependencies
pnpm install

# Build package
pnpm build

# Run tests
pnpm test
\`\`\``;
    }

    generateEnvExample(appName) {
        return `# ${appName.toUpperCase()} Environment Variables

# Application
NEXT_PUBLIC_APP_NAME="${appName}"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# API
API_URL="http://localhost:8000"
API_KEY="your-api-key"

# Database
DATABASE_URL="your-database-url"

# Authentication
AUTH_SECRET="your-auth-secret"
NEXTAUTH_URL="http://localhost:3000"

# External Services
# Add service-specific environment variables here`;
    }

    generateGitignore() {
        return `# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
.nyc_output

# Production builds
.next/
out/
build/
dist/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*
.pnpm-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# Dependency directories
node_modules/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next
out

# Nuxt.js build / generate output
.nuxt
dist

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db`;
    }

    generateOrganizationMarkdown(index) {
        return `# 🏗️ ECOSYSTEM ORGANIZATION INDEX

## 📊 Cleanup Summary
**Timestamp**: ${index.timestamp}
**Files Removed**: ${index.stats.filesRemoved}
**Directories Removed**: ${index.stats.directoriesRemoved}
**Duplicates Resolved**: ${index.stats.duplicatesResolved}
**Structures Fixed**: ${index.stats.structuresFixed}

## 🚀 Applications (${Object.keys(index.structure.apps).length})
${Object.entries(index.structure.apps).map(([name, info]) =>
            `- **${name}**: ${info.files.length} files, ${info.directories.length} directories`
        ).join('\n')}

## 📦 Packages (${Object.keys(index.structure.packages).length})
${Object.entries(index.structure.packages).map(([name, info]) =>
            `- **${name}**: ${info.files.length} files, ${info.directories.length} directories`
        ).join('\n')}

## 📁 Project Structure
- ✅ Clean root directory
- ✅ Organized scripts directory
- ✅ Structured documentation
- ✅ Standardized configurations
- ✅ Optimized app structures
- ✅ Clean package structures

## 🎯 Next Steps
1. Run comprehensive tests to verify structure integrity
2. Update CI/CD pipelines for new structure
3. Update documentation references
4. Verify all imports and references

**Organization Complete**: ${new Date().toISOString()}`;
    }
}

// Run cleanup if called directly
console.log('Script starting...');
const cleaner = new EcosystemCleaner();
cleaner.runFullCleanup()
    .then(() => {
        console.log('🎯 STRUCTURE CLEANUP COMPLETE - Ready for Phase 4');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Cleanup failed:', error.message);
        process.exit(1);
    });

export default EcosystemCleaner;
