#!/usr/bin/env node

/**
 * CODAI Ecosystem Modernization Script
 * Converts Express.js apps to Next.js 15 with TailwindCSS 3
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AppModernizer {
    constructor(appName, appPort, appDescription) {
        this.appName = appName;
        this.appPort = appPort;
        this.appDescription = appDescription;
        this.appPath = path.join(__dirname, 'apps', appName);
        this.templatePath = path.join(__dirname, 'templates');
        this.backupPath = path.join(__dirname, 'backups', appName);
    }

    async modernize() {
        console.log(`🚀 Modernizing ${this.appName}...`);

        try {
            await this.createBackup();
            await this.analyzeCurrentStructure();
            await this.archiveStaticFiles();
            await this.createNewStructure();
            await this.generateFiles();
            await this.installDependencies();
            await this.validateApp();

            console.log(`✅ ${this.appName} modernization completed!`);
        } catch (error) {
            console.error(`❌ Error modernizing ${this.appName}:`, error.message);
            await this.rollback();
        }
    }

    async createBackup() {
        console.log(`📦 Creating backup for ${this.appName}...`);

        if (fs.existsSync(this.backupPath)) {
            fs.rmSync(this.backupPath, { recursive: true });
        }

        fs.mkdirSync(this.backupPath, { recursive: true });

        if (fs.existsSync(this.appPath)) {
            execSync(`cp -r "${this.appPath}" "${this.backupPath}/"`);
        }
    }

    async analyzeCurrentStructure() {
        console.log(`🔍 Analyzing ${this.appName} structure...`);

        if (!fs.existsSync(this.appPath)) {
            console.log(`📁 Creating new app directory: ${this.appName}`);
            fs.mkdirSync(this.appPath, { recursive: true });
            return;
        }

        const packagePath = path.join(this.appPath, 'package.json');
        if (fs.existsSync(packagePath)) {
            const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            console.log(`📊 Current framework: ${pkg.dependencies?.next ? 'Next.js' : pkg.dependencies?.express ? 'Express' : 'Unknown'}`);
        }
    }

    async archiveStaticFiles() {
        console.log(`📁 Archiving static files for ${this.appName}...`);

        const archivePath = path.join(__dirname, 'archives', this.appName);
        fs.mkdirSync(archivePath, { recursive: true });

        // Archive static directories
        const staticDirs = ['public', 'static', 'assets', 'uploads'];
        for (const dir of staticDirs) {
            const dirPath = path.join(this.appPath, dir);
            if (fs.existsSync(dirPath)) {
                execSync(`cp -r "${dirPath}" "${archivePath}/"`);
            }
        }
    }

    async createNewStructure() {
        console.log(`🏗️ Creating Next.js 15 structure for ${this.appName}...`);

        // Remove old Express files
        const oldFiles = ['server.js', 'index.js', 'app.js'];
        const oldDirs = ['views', 'routes', 'middleware'];

        for (const file of oldFiles) {
            const filePath = path.join(this.appPath, file);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        for (const dir of oldDirs) {
            const dirPath = path.join(this.appPath, dir);
            if (fs.existsSync(dirPath)) {
                fs.rmSync(dirPath, { recursive: true });
            }
        }

        // Create Next.js structure
        const newDirs = [
            'src/app',
            'src/app/api/health',
            'src/app/api/status',
            'src/app/health',
            'src/components/dashboard',
            'src/components/health',
            'src/lib',
            'public'
        ];

        for (const dir of newDirs) {
            fs.mkdirSync(path.join(this.appPath, dir), { recursive: true });
        }
    }

    async generateFiles() {
        console.log(`📝 Generating files for ${this.appName}...`);

        // Copy and customize template files
        const templateFiles = [
            'package.json',
            'next.config.js',
            'tailwind.config.js',
            'tsconfig.json',
            'src/app/layout.tsx',
            'src/app/page.tsx',
            'src/app/globals.css',
            'src/app/health/page.tsx',
            'src/app/api/health/route.ts',
            'src/app/api/status/route.ts',
            'src/components/dashboard/header.tsx',
            'src/components/dashboard/stats.tsx',
            'src/components/dashboard/content.tsx',
            'src/components/health/health-status.tsx'
        ];

        for (const file of templateFiles) {
            const templateFile = path.join(this.templatePath, file);
            const targetFile = path.join(this.appPath, file);

            if (fs.existsSync(templateFile)) {
                let content = fs.readFileSync(templateFile, 'utf8');

                // Replace template placeholders
                content = content
                    .replace(/\$\{APP_NAME\}/g, this.appName.toUpperCase())
                    .replace(/\$\{PORT\}/g, this.appPort)
                    .replace(/\$\{APP_DESCRIPTION\}/g, this.appDescription);

                fs.writeFileSync(targetFile, content);
            }
        }

        // Create additional config files
        await this.createConfigFiles();
    }

    async createConfigFiles() {
        // .env.example
        const envContent = `# ${this.appName.toUpperCase()} Environment Variables
NODE_ENV=development
PORT=${this.appPort}
NEXT_PUBLIC_APP_NAME=${this.appName.toUpperCase()}
`;
        fs.writeFileSync(path.join(this.appPath, '.env.example'), envContent);

        // .gitignore
        const gitignoreContent = `# Dependencies
node_modules/
.pnpm-store/

# Build outputs
.next/
out/
dist/

# Environment variables
.env
.env*.local

# Testing
coverage/
test-results/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
`;
        fs.writeFileSync(path.join(this.appPath, '.gitignore'), gitignoreContent);

        // README.md
        const readmeContent = `# ${this.appName.toUpperCase()}

${this.appDescription}

## Development

\`\`\`bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
\`\`\`

## URLs

- Dashboard: http://localhost:${this.appPort}
- Health Check: http://localhost:${this.appPort}/health
- API Health: http://localhost:${this.appPort}/api/health
- API Status: http://localhost:${this.appPort}/api/status

## Architecture

- Framework: Next.js 15.4.1
- Styling: TailwindCSS 3.4.17
- TypeScript: 5.8.3
- Port: ${this.appPort}
`;
        fs.writeFileSync(path.join(this.appPath, 'README.md'), readmeContent);
    }

    async installDependencies() {
        console.log(`📦 Installing dependencies for ${this.appName}...`);

        try {
            execSync('pnpm install', {
                cwd: this.appPath,
                stdio: 'inherit'
            });
        } catch (error) {
            console.warn(`⚠️ Dependency installation failed, continuing...`);
        }
    }

    async validateApp() {
        console.log(`✅ Validating ${this.appName}...`);

        // Check required files exist
        const requiredFiles = [
            'package.json',
            'next.config.js',
            'src/app/page.tsx',
            'src/app/layout.tsx',
            'src/app/health/page.tsx'
        ];

        for (const file of requiredFiles) {
            const filePath = path.join(this.appPath, file);
            if (!fs.existsSync(filePath)) {
                throw new Error(`Required file missing: ${file}`);
            }
        }

        console.log(`✅ ${this.appName} validation passed!`);
    }

    async rollback() {
        console.log(`🔄 Rolling back ${this.appName}...`);

        if (fs.existsSync(this.backupPath)) {
            if (fs.existsSync(this.appPath)) {
                fs.rmSync(this.appPath, { recursive: true });
            }
            execSync(`cp -r "${path.join(this.backupPath, this.appName)}" "${this.appPath}"`);
        }
    }
}

// App definitions with ports and descriptions
const appsToModernize = [
    { name: 'aide', port: '4051', description: 'AI Development Environment' },
    { name: 'ajutai', port: '4052', description: 'AI Help & Support Platform' },
    { name: 'analizai', port: '4053', description: 'Analytics & Data Intelligence' },
    { name: 'admin', port: '4062', description: 'Admin Control Panel' },
    { name: 'dash', port: '4064', description: 'Unified Dashboard' },
    { name: 'docs', port: '4065', description: 'Documentation Platform' },
    { name: 'explorer', port: '4060', description: 'Blockchain Explorer' },
    { name: 'hub', port: '4001', description: 'Integration Hub' },
    { name: 'id', port: '4082', description: 'Identity Management' },
    { name: 'jucai', port: '4070', description: 'Gaming Platform' },
    { name: 'kodex', port: '4067', description: 'Programmable Wallet Protocol' },
    { name: 'legalizai', port: '4068', description: 'Legal Compliance Platform' },
    { name: 'marketai', port: '4069', description: 'AI Marketplace' },
    { name: 'mobile', port: '4071', description: 'Mobile Services' },
    { name: 'mod', port: '4072', description: 'Moderation Tools' },
    { name: 'stocai', port: '4066', description: 'Stock Trading Platform' },
    { name: 'tools', port: '4073', description: 'Utility Tools' },
    { name: 'x', port: '4074', description: 'Trading Exchange' }
];

async function modernizeAllApps() {
    console.log('🌟 Starting CODAI Ecosystem Modernization...');
    console.log(`📊 Total apps to modernize: ${appsToModernize.length}`);

    let completed = 0;
    let failed = 0;

    for (const app of appsToModernize) {
        try {
            const modernizer = new AppModernizer(app.name, app.port, app.description);
            await modernizer.modernize();
            completed++;
        } catch (error) {
            console.error(`❌ Failed to modernize ${app.name}:`, error.message);
            failed++;
        }
    }

    console.log('\\n🎉 Modernization Summary:');
    console.log(`✅ Completed: ${completed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total: ${appsToModernize.length}`);

    if (completed === appsToModernize.length) {
        console.log('\\n🏆 ALL APPS SUCCESSFULLY MODERNIZED!');
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const appName = process.argv[2];

    if (appName === 'all') {
        modernizeAllApps();
    } else if (appName) {
        const app = appsToModernize.find(a => a.name === appName);
        if (app) {
            const modernizer = new AppModernizer(app.name, app.port, app.description);
            modernizer.modernize();
        } else {
            console.error(`App not found: ${appName}`);
        }
    } else {
        console.log('Usage: node modernize-app.js <app-name|all>');
    }
}

export { AppModernizer, appsToModernize };
