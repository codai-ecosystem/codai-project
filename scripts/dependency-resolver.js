#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 CODAI ECOSYSTEM - DEPENDENCY RESOLUTION & MODERNIZATION\n');
console.log('Date:', new Date().toISOString());
console.log('Phase: 1.2 - Critical Dependency Updates\n');

// Configuration for target versions
const TARGET_VERSIONS = {
    // Core framework updates
    'react': '^19.0.0',
    'react-dom': '^19.0.0',
    '@types/react': '^19.0.0',
    '@types/react-dom': '^19.0.0',

    'next': '^15.1.0',
    'typescript': '^5.7.0',

    // TailwindCSS v4 migration
    'tailwindcss': '^4.1.0',
    '@tailwindcss/postcss': '^4.1.0',
    'postcss': '^8.5.0',
    'autoprefixer': '^10.4.0',

    // Updated UI libraries
    'framer-motion': '^11.18.0',
    'lucide-react': '^0.468.0',
    'clsx': '^2.1.0',
    'tailwind-merge': '^2.6.0',
    'class-variance-authority': '^0.7.1',

    // Testing framework standardization
    'vitest': '^3.2.0',
    '@vitest/coverage-v8': '^3.2.0',
    '@testing-library/react': '^16.3.0',
    '@testing-library/jest-dom': '^6.6.0',
    'jsdom': '^26.1.0',

    // Development tools
    'eslint': '^9.18.0',
    'eslint-config-next': '^15.1.0',
    '@types/node': '^22.10.0',

    // Utility libraries
    'zod': '^3.23.0',
    'uuid': '^11.1.0',
    '@types/uuid': '^10.0.0',
    'date-fns': '^4.1.0',

    // Backend dependencies
    'express': '^4.21.0',
    'jsonwebtoken': '^9.0.2',
    'bcrypt': '^5.1.1',
    '@types/jsonwebtoken': '^9.0.5',
    '@types/bcrypt': '^5.0.2'
};

// Packages that need special handling for TailwindCSS v4
const TAILWIND_V4_MIGRATION = {
    // Remove these packages (deprecated in v4)
    REMOVE: [
        '@tailwindcss/forms',
        '@tailwindcss/typography',
        '@tailwindcss/aspect-ratio'
    ],

    // Add these packages for v4
    ADD: {
        '@tailwindcss/postcss': '^4.1.0'
    },

    // Update these configurations
    CONFIG_UPDATES: {
        'postcss.config.js': `
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}`,
        'tailwind.config.js': `
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

export default config`
    }
};

const workspaceRoot = process.cwd();

// Helper functions
function loadAuditResults() {
    const auditFile = path.join(workspaceRoot, 'audit-results.json');
    if (!fs.existsSync(auditFile)) {
        throw new Error('Audit results not found. Run dependency-audit.js first.');
    }
    return JSON.parse(fs.readFileSync(auditFile, 'utf8'));
}

function updatePackageJson(packagePath, updates) {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    let modified = false;

    // Update dependencies
    if (pkg.dependencies) {
        Object.keys(pkg.dependencies).forEach(name => {
            if (TARGET_VERSIONS[name] && pkg.dependencies[name] !== TARGET_VERSIONS[name]) {
                console.log(`   📦 ${name}: ${pkg.dependencies[name]} → ${TARGET_VERSIONS[name]}`);
                pkg.dependencies[name] = TARGET_VERSIONS[name];
                modified = true;
            }
        });
    }

    // Update devDependencies
    if (pkg.devDependencies) {
        Object.keys(pkg.devDependencies).forEach(name => {
            if (TARGET_VERSIONS[name] && pkg.devDependencies[name] !== TARGET_VERSIONS[name]) {
                console.log(`   📦 ${name}: ${pkg.devDependencies[name]} → ${TARGET_VERSIONS[name]}`);
                pkg.devDependencies[name] = TARGET_VERSIONS[name];
                modified = true;
            }
        });
    }

    // Handle TailwindCSS v4 migration
    if (pkg.devDependencies && pkg.devDependencies.tailwindcss) {
        // Remove deprecated packages
        TAILWIND_V4_MIGRATION.REMOVE.forEach(packageName => {
            if (pkg.dependencies && pkg.dependencies[packageName]) {
                console.log(`   🗑️  Removing deprecated ${packageName}`);
                delete pkg.dependencies[packageName];
                modified = true;
            }
            if (pkg.devDependencies && pkg.devDependencies[packageName]) {
                console.log(`   🗑️  Removing deprecated ${packageName}`);
                delete pkg.devDependencies[packageName];
                modified = true;
            }
        });

        // Add new packages for v4
        Object.entries(TAILWIND_V4_MIGRATION.ADD).forEach(([name, version]) => {
            if (!pkg.devDependencies[name]) {
                console.log(`   ✨ Adding ${name}: ${version}`);
                pkg.devDependencies[name] = version;
                modified = true;
            }
        });
    }

    if (modified) {
        fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n');
    }

    return modified;
}

function updateTailwindConfigs(projectDir) {
    const tailwindConfigPath = path.join(projectDir, 'tailwind.config.js');
    const tailwindConfigTsPath = path.join(projectDir, 'tailwind.config.ts');
    const postcssConfigPath = path.join(projectDir, 'postcss.config.js');

    // Update PostCSS config for TailwindCSS v4
    if (fs.existsSync(postcssConfigPath)) {
        console.log(`   🔧 Updating PostCSS config for TailwindCSS v4`);
        fs.writeFileSync(postcssConfigPath, TAILWIND_V4_MIGRATION.CONFIG_UPDATES['postcss.config.js']);
    }

    // Update Tailwind config if needed
    if (fs.existsSync(tailwindConfigPath) || fs.existsSync(tailwindConfigTsPath)) {
        const configPath = fs.existsSync(tailwindConfigTsPath) ? tailwindConfigTsPath : tailwindConfigPath;
        console.log(`   🔧 Updating Tailwind config for v4 compatibility`);
        fs.writeFileSync(configPath, TAILWIND_V4_MIGRATION.CONFIG_UPDATES['tailwind.config.js']);
    }
}

function createProjectSummary(projects, updatedProjects) {
    const summary = {
        totalProjects: projects.length,
        updatedProjects: updatedProjects.length,
        byType: {
            apps: 0,
            services: 0,
            packages: 0,
            other: 0
        },
        updatedByType: {
            apps: 0,
            services: 0,
            packages: 0,
            other: 0
        }
    };

    projects.forEach(project => {
        if (project.path.startsWith('apps/')) summary.byType.apps++;
        else if (project.path.startsWith('services/')) summary.byType.services++;
        else if (project.path.startsWith('packages/')) summary.byType.packages++;
        else summary.byType.other++;
    });

    updatedProjects.forEach(project => {
        if (project.startsWith('apps/')) summary.updatedByType.apps++;
        else if (project.startsWith('services/')) summary.updatedByType.services++;
        else if (project.startsWith('packages/')) summary.updatedByType.packages++;
        else summary.updatedByType.other++;
    });

    return summary;
}

async function runDependencyUpdates() {
    console.log('📋 Step 1: Loading audit results...');
    const auditResults = loadAuditResults();
    const projects = auditResults.projects;

    console.log(`Found ${projects.length} projects to update\n`);

    console.log('📋 Step 2: Updating package.json files...');
    const updatedProjects = [];

    for (const project of projects) {
        const packagePath = path.join(workspaceRoot, project.path);
        console.log(`\n🔍 Processing: ${project.name} (${project.path})`);

        if (fs.existsSync(packagePath)) {
            const wasModified = updatePackageJson(packagePath, TARGET_VERSIONS);

            if (wasModified) {
                updatedProjects.push(project.path);

                // Handle TailwindCSS v4 config updates
                const projectDir = path.dirname(packagePath);
                updateTailwindConfigs(projectDir);
            } else {
                console.log(`   ✅ Already up to date`);
            }
        } else {
            console.log(`   ⚠️  Package.json not found: ${packagePath}`);
        }
    }

    console.log('\n📋 Step 3: Installing updated dependencies...');
    try {
        console.log('Running pnpm install to update lockfile...');
        execSync('pnpm install', {
            stdio: 'inherit',
            cwd: workspaceRoot
        });
        console.log('✅ Dependencies installed successfully');
    } catch (error) {
        console.error('❌ Error installing dependencies:', error.message);
        console.log('You may need to resolve conflicts manually');
    }

    console.log('\n📋 Step 4: Generating update summary...');
    const summary = createProjectSummary(projects, updatedProjects);

    console.log('\n📊 UPDATE SUMMARY:');
    console.log(`   Total Projects: ${summary.totalProjects}`);
    console.log(`   Updated Projects: ${summary.updatedProjects}`);
    console.log(`   Apps Updated: ${summary.updatedByType.apps}/${summary.byType.apps}`);
    console.log(`   Services Updated: ${summary.updatedByType.services}/${summary.byType.services}`);
    console.log(`   Packages Updated: ${summary.updatedByType.packages}/${summary.byType.packages}`);
    console.log(`   Other Updated: ${summary.updatedByType.other}/${summary.byType.other}`);

    // Save update results
    const updateResults = {
        timestamp: new Date().toISOString(),
        targetVersions: TARGET_VERSIONS,
        summary,
        updatedProjects: updatedProjects.map(path => ({
            path,
            name: projects.find(p => p.path === path)?.name || 'Unknown'
        }))
    };

    const resultsFile = path.join(workspaceRoot, 'dependency-update-results.json');
    fs.writeFileSync(resultsFile, JSON.stringify(updateResults, null, 2));
    console.log(`\n📄 Update results saved to: ${resultsFile}`);

    console.log('\n✅ DEPENDENCY UPDATES COMPLETED');
    console.log('\n🎯 Next Steps:');
    console.log('1. Test core applications to ensure they start correctly');
    console.log('2. Update any TypeScript compilation errors');
    console.log('3. Update TailwindCSS usage for v4 compatibility');
    console.log('4. Run comprehensive tests');
    console.log('5. Commit changes and proceed to Phase 1.3');
}

// Execute dependency updates
runDependencyUpdates().catch(error => {
    console.error('❌ Dependency update failed:', error);
    process.exit(1);
});
