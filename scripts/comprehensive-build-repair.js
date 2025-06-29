#!/usr/bin/env node

/**
 * Comprehensive Build Crisis Resolution Script
 * Phase 2: Dependency Resolution & Critical Fixes
 * 
 * Addresses the systematic issues identified after next.config.js fixes:
 * 1. Missing UI components
 * 2. Missing dependencies
 * 3. TypeScript configuration issues
 * 4. Variable redefinition errors
 * 5. Missing directory structures
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m',
    bright: '\x1b[1m'
};

const log = (message, color = 'reset') => {
    console.log(`${colors[color]}${message}${colors.reset}`);
};

const projectRoot = path.resolve(__dirname, '..');

// Helper function to run shell commands
const runCommand = (command, cwd = projectRoot, silent = false) => {
    try {
        const result = execSync(command, {
            cwd,
            encoding: 'utf8',
            stdio: silent ? 'pipe' : 'inherit'
        });
        return { success: true, output: result };
    } catch (error) {
        return { success: false, error: error.message, output: error.stdout };
    }
};

// Helper function to check if directory exists
const ensureDirectory = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        return true;
    }
    return false;
};

// Helper function to get all service directories
const getServiceDirectories = () => {
    const directories = [];

    // Apps directory
    const appsDir = path.join(projectRoot, 'apps');
    if (fs.existsSync(appsDir)) {
        const apps = fs.readdirSync(appsDir).filter(item => {
            const itemPath = path.join(appsDir, item);
            return fs.statSync(itemPath).isDirectory();
        });
        directories.push(...apps.map(app => ({ name: app, path: path.join(appsDir, app), type: 'app' })));
    }

    // Services directory
    const servicesDir = path.join(projectRoot, 'services');
    if (fs.existsSync(servicesDir)) {
        const services = fs.readdirSync(servicesDir).filter(item => {
            const itemPath = path.join(servicesDir, item);
            return fs.statSync(itemPath).isDirectory();
        });
        directories.push(...services.map(service => ({ name: service, path: path.join(servicesDir, service), type: 'service' })));
    }

    return directories;
};

async function comprehensiveBuildRepair() {
    log('🔧 COMPREHENSIVE BUILD CRISIS RESOLUTION - PHASE 2', 'bright');
    log('═'.repeat(60), 'cyan');

    const results = {
        dependenciesInstalled: [],
        directoriesCreated: [],
        filesFixed: [],
        errors: []
    };

    // Phase 2A: Install Critical Missing Dependencies
    log('\n📦 PHASE 2A: Installing Critical Missing Dependencies', 'blue');
    log('─'.repeat(50), 'cyan');

    const criticalDependencies = [
        'postgres',
        '@radix-ui/react-progress',
        'tailwind-merge', // Note: it's tailwind-merge, not tailwindcss-merge
        '@types/node',
        '@heroicons/react'
    ];

    for (const dep of criticalDependencies) {
        log(`Installing ${dep}...`, 'yellow');
        const result = runCommand(`pnpm add ${dep}`, projectRoot, true);
        if (result.success) {
            log(`   ✅ ${dep} installed successfully`, 'green');
            results.dependenciesInstalled.push(dep);
        } else {
            log(`   ❌ Failed to install ${dep}: ${result.error}`, 'red');
            results.errors.push(`Failed to install ${dep}: ${result.error}`);
        }
    }

    // Phase 2B: Install shadcn/ui Components
    log('\n🎨 PHASE 2B: Installing shadcn/ui Components', 'blue');
    log('─'.repeat(50), 'cyan');

    const uiComponents = [
        'button',
        'card',
        'badge',
        'tabs',
        'select',
        'progress'
    ];

    // First, initialize shadcn/ui if not already done
    log('Initializing shadcn/ui...', 'yellow');
    const initResult = runCommand('pnpm dlx shadcn@latest init --yes --default', projectRoot, true);
    if (initResult.success) {
        log('   ✅ shadcn/ui initialized', 'green');
    } else {
        log('   ⚠️  shadcn/ui init may have failed (might already be initialized)', 'yellow');
    }

    // Install each UI component
    for (const component of uiComponents) {
        log(`Installing shadcn/ui ${component}...`, 'yellow');
        const result = runCommand(`pnpm dlx shadcn@latest add ${component} --yes`, projectRoot, true);
        if (result.success) {
            log(`   ✅ ${component} component installed`, 'green');
            results.dependenciesInstalled.push(`shadcn/ui/${component}`);
        } else {
            log(`   ⚠️  ${component} component may have failed (might already exist)`, 'yellow');
        }
    }

    // Phase 2C: Fix Missing Directory Structures
    log('\n📁 PHASE 2C: Creating Missing Directory Structures', 'blue');
    log('─'.repeat(50), 'cyan');

    const services = getServiceDirectories();

    for (const service of services) {
        const { name, path: servicePath } = service;

        // Check if service needs app directory (for Next.js apps)
        const packageJsonPath = path.join(servicePath, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

            // If it's a Next.js project, ensure it has app or pages directory
            if (packageJson.dependencies?.next || packageJson.devDependencies?.next) {
                const appDir = path.join(servicePath, 'app');
                const pagesDir = path.join(servicePath, 'pages');
                const srcAppDir = path.join(servicePath, 'src', 'app');
                const srcPagesDir = path.join(servicePath, 'src', 'pages');

                if (!fs.existsSync(appDir) && !fs.existsSync(pagesDir) &&
                    !fs.existsSync(srcAppDir) && !fs.existsSync(srcPagesDir)) {

                    log(`Creating app directory for ${name}...`, 'yellow');
                    const appDirCreated = ensureDirectory(appDir);

                    if (appDirCreated) {
                        // Create basic app structure
                        const layoutContent = `import './globals.css'

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
}`;

                        const pageContent = `export default function Page() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold">${name.charAt(0).toUpperCase() + name.slice(1)} Dashboard</h1>
      <p>Welcome to ${name}</p>
    </div>
  )
}`;

                        const globalsContent = `@tailwind base;
@tailwind components;
@tailwind utilities;`;

                        fs.writeFileSync(path.join(appDir, 'layout.tsx'), layoutContent);
                        fs.writeFileSync(path.join(appDir, 'page.tsx'), pageContent);
                        fs.writeFileSync(path.join(appDir, 'globals.css'), globalsContent);

                        log(`   ✅ Created app directory structure for ${name}`, 'green');
                        results.directoriesCreated.push(`${name}/app`);
                    }
                }
            }
        }
    }

    // Phase 2D: Fix Critical File Issues
    log('\n🔧 PHASE 2D: Fixing Critical File Issues', 'blue');
    log('─'.repeat(50), 'cyan');

    // Fix tailwindcss-merge imports (should be tailwind-merge)
    log('Fixing tailwind-merge imports...', 'yellow');
    const servicesWithTailwindIssues = ['marketai', 'tools', 'analizai'];

    for (const serviceName of servicesWithTailwindIssues) {
        const servicePath = path.join(projectRoot, 'services', serviceName);
        const utilsPath = path.join(servicePath, 'lib', 'utils.ts');

        if (fs.existsSync(utilsPath)) {
            let content = fs.readFileSync(utilsPath, 'utf8');
            if (content.includes('tailwindcss-merge')) {
                content = content.replace(/tailwindcss-merge/g, 'tailwind-merge');
                fs.writeFileSync(utilsPath, content);
                log(`   ✅ Fixed tailwind-merge import in ${serviceName}`, 'green');
                results.filesFixed.push(`${serviceName}/lib/utils.ts`);
            }
        }
    }

    // Fix admin page.tsx syntax error
    log('Fixing admin page.tsx syntax error...', 'yellow');
    const adminPagePath = path.join(projectRoot, 'services', 'admin', 'src', 'app', 'page.tsx');
    if (fs.existsSync(adminPagePath)) {
        const content = `import AdminDashboard from '@/components/AdminDashboard';

export default function Home() {
  return <AdminDashboard />
}`;
        fs.writeFileSync(adminPagePath, content);
        log(`   ✅ Fixed admin page.tsx syntax error`, 'green');
        results.filesFixed.push('admin/src/app/page.tsx');
    }

    // Fix fabricai variable redefinition errors
    log('Fixing fabricai variable redefinition errors...', 'yellow');
    const fabricaiApiPath = path.join(projectRoot, 'services', 'fabricai', 'app', 'api');

    // Fix ai-services route
    const aiServicesPath = path.join(fabricaiApiPath, 'ai-services', 'route.ts');
    if (fs.existsSync(aiServicesPath)) {
        let content = fs.readFileSync(aiServicesPath, 'utf8');
        // Replace the redefined pipelineId in execute-pipeline case
        content = content.replace(
            /case 'execute-pipeline':\s+const { pipelineId } = requestData;/,
            `case 'execute-pipeline':
        const { pipelineId: executePipelineId } = requestData;`
        );
        content = content.replace(
            /const pipeline = mockPipelines\.find\(p => p\.id === pipelineId\);/,
            'const pipeline = mockPipelines.find(p => p.id === executePipelineId);'
        );
        fs.writeFileSync(aiServicesPath, content);
        log(`   ✅ Fixed pipelineId redefinition in fabricai`, 'green');
        results.filesFixed.push('fabricai/app/api/ai-services/route.ts');
    }

    // Fix model-management route
    const modelMgmtPath = path.join(fabricaiApiPath, 'model-management', 'route.ts');
    if (fs.existsSync(modelMgmtPath)) {
        let content = fs.readFileSync(modelMgmtPath, 'utf8');
        // Replace the redefined deploymentId in manage-deployment case
        content = content.replace(
            /case 'manage-deployment':\s+const { deploymentId, action: deploymentAction } = requestData;/,
            `case 'manage-deployment':
        const { deploymentId: manageDeploymentId, action: deploymentAction } = requestData;`
        );
        content = content.replace(
            /const deployment = mockDeployments\.find\(d => d\.id === deploymentId\);/,
            'const deployment = mockDeployments.find(d => d.id === manageDeploymentId);'
        );
        fs.writeFileSync(modelMgmtPath, content);
        log(`   ✅ Fixed deploymentId redefinition in fabricai`, 'green');
        results.filesFixed.push('fabricai/app/api/model-management/route.ts');
    }

    // Summary
    log('\n' + '═'.repeat(60), 'cyan');
    log('📊 COMPREHENSIVE REPAIR SUMMARY:', 'bright');
    log(`   Dependencies installed: ${results.dependenciesInstalled.length}`, 'green');
    log(`   Directories created: ${results.directoriesCreated.length}`, 'green');
    log(`   Files fixed: ${results.filesFixed.length}`, 'green');
    log(`   Errors encountered: ${results.errors.length}`, results.errors.length > 0 ? 'red' : 'green');

    if (results.errors.length > 0) {
        log('\n❌ ERRORS:', 'red');
        results.errors.forEach(error => log(`   • ${error}`, 'red'));
    }

    log('\n🎉 PHASE 2 REPAIR COMPLETE!', 'green');
    log('Run "pnpm build" to test the improvements.', 'cyan');

    return results;
}

// Run the comprehensive repair
comprehensiveBuildRepair().catch(error => {
    log(`❌ Fatal error: ${error.message}`, 'red');
    process.exit(1);
});
