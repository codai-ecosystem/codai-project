#!/usr/bin/env node
/**
 * Codai Ecosystem Batch Integration Script
 * Integrates all Codai ecosystem repositories into the monorepo structure
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Define all Codai ecosystem services
const CODAI_SERVICES = [
    {
        name: 'codai',
        domain: 'codai.ro',
        description: 'Central Platform & AIDE Hub',
        priority: 1,
        sourceRepo: 'codai-ecosystem/codai', // Source repository in codai-ecosystem
        targetRepo: 'codai-ecosystem/codai',
        subdomains: ['aide.codai.ro', 'api.codai.ro', 'cdn.codai.ro', 'status.codai.ro'],
        tier: 'foundation'
    },
    {
        name: 'memorai',
        domain: 'memorai.ro',
        description: 'AI Memory & Database Core',
        priority: 1,
        sourceRepo: 'codai-ecosystem/memorai',
        targetRepo: 'codai-ecosystem/memorai',
        subdomains: ['mcp.memorai.ro', 'local.memorai.ro'],
        tier: 'foundation'
    },
    {
        name: 'logai',
        domain: 'logai.ro',
        description: 'Identity & Authentication Hub',
        priority: 1,
        sourceRepo: null, // New development
        targetRepo: 'codai-ecosystem/logai',
        subdomains: [],
        tier: 'foundation'
    },
    {
        name: 'bancai',
        domain: 'bancai.ro',
        description: 'Financial Platform',
        priority: 2,
        sourceRepo: null,
        targetRepo: 'codai-ecosystem/bancai',
        subdomains: [],
        tier: 'business'
    },
    {
        name: 'wallet',
        domain: 'wallet.bancai.ro',
        description: 'Programmable Wallet',
        priority: 2,
        sourceRepo: null,
        targetRepo: 'codai-ecosystem/wallet',
        subdomains: [],
        tier: 'business'
    },
    {
        name: 'fabricai',
        domain: 'fabricai.ro',
        description: 'AI Services Platform',
        priority: 2,
        sourceRepo: null,
        targetRepo: 'codai-ecosystem/fabricai',
        subdomains: [],
        tier: 'business'
    },
    {
        name: 'studiai',
        domain: 'studiai.ro',
        description: 'AI Education Platform',
        priority: 3,
        sourceRepo: 'codai-ecosystem/studiai',
        targetRepo: 'codai-ecosystem/studiai',
        subdomains: [],
        tier: 'user'
    },
    {
        name: 'sociai',
        domain: 'sociai.ro',
        description: 'AI Social Platform',
        priority: 3,
        sourceRepo: null,
        targetRepo: 'codai-ecosystem/sociai',
        subdomains: [],
        tier: 'user'
    },
    {
        name: 'cumparai',
        domain: 'cumparai.ro',
        description: 'AI Shopping Platform',
        priority: 3,
        sourceRepo: null,
        targetRepo: 'codai-ecosystem/cumparai',
        subdomains: [],
        tier: 'user'
    },
    {
        name: 'publicai',
        domain: 'publicai.ro',
        description: 'Civic Tech Platform',
        priority: 4,
        sourceRepo: null,
        targetRepo: 'codai-ecosystem/publicai',
        subdomains: [],
        tier: 'specialized'
    },
    {
        name: 'x',
        domain: 'x.codai.ro',
        description: 'AI Trading Platform',
        priority: 4,
        sourceRepo: null,
        targetRepo: 'codai-ecosystem/x',
        subdomains: [],
        tier: 'specialized'
    }
];

async function checkRepositoryExists(repoUrl) {
    try {
        execSync(`git ls-remote ${repoUrl}`, { stdio: 'ignore' });
        return true;
    } catch (error) {
        return false;
    }
}

async function createBasicProjectStructure(service) {
    const appPath = path.join('apps', service.name);

    // Create package.json
    const packageJson = {
        name: `@codai/${service.name}`,
        version: "0.1.0",
        private: true,
        description: service.description,
        scripts: {
            dev: "next dev",
            build: "next build",
            start: "next start",
            lint: "next lint",
            test: "jest",
            "test:watch": "jest --watch",
            typecheck: "tsc --noEmit"
        },
        dependencies: {
            next: "^14.0.0",
            react: "^18.0.0",
            "react-dom": "^18.0.0"
        },
        devDependencies: {
            "@types/node": "^20.0.0",
            "@types/react": "^18.0.0",
            "@types/react-dom": "^18.0.0",
            eslint: "^8.0.0",
            "eslint-config-next": "^14.0.0",
            typescript: "^5.0.0"
        }
    };

    await fs.writeFile(
        path.join(appPath, 'package.json'),
        JSON.stringify(packageJson, null, 2)
    );

    // Create basic Next.js structure
    await fs.mkdir(path.join(appPath, 'src', 'app'), { recursive: true });
    await fs.mkdir(path.join(appPath, 'public'), { recursive: true });

    // Create basic page
    const indexPage = `export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">${service.name.charAt(0).toUpperCase() + service.name.slice(1)}</h1>
      <p className="text-xl text-gray-600">${service.description}</p>
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Status</h2>
        <p className="text-green-600">🚀 Service is running and ready for development!</p>
      </div>
    </div>
  )
}`;

    await fs.writeFile(path.join(appPath, 'src', 'app', 'page.tsx'), indexPage);

    // Create layout
    const layout = `import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '${service.name.charAt(0).toUpperCase() + service.name.slice(1)} - Codai Ecosystem',
  description: '${service.description}',
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
}`;

    await fs.writeFile(path.join(appPath, 'src', 'app', 'layout.tsx'), layout);

    // Create README
    const readme = `# ${service.name.charAt(0).toUpperCase() + service.name.slice(1)}

${service.description}

## Domain
- Primary: ${service.domain}
${service.subdomains.length > 0 ? `- Subdomains: ${service.subdomains.join(', ')}` : ''}

## Development

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

## Architecture

This service is part of the Codai ecosystem and follows the established patterns:

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Testing**: Jest
- **Tier**: ${service.tier}
- **Priority**: ${service.priority}

## Features

- 🚀 Modern Next.js setup
- 📱 Responsive design
- 🎨 Tailwind CSS styling
- 🧪 Jest testing setup
- 📦 TypeScript support
- 🔧 ESLint configuration

## Status

✅ Project structure created
⏳ Awaiting development

---

Generated by Codai Ecosystem Orchestration System
`;

    await fs.writeFile(path.join(appPath, 'README.md'), readme);

    // Create Next.js config
    const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['${service.domain}'],
  },
}

module.exports = nextConfig`;

    await fs.writeFile(path.join(appPath, 'next.config.js'), nextConfig);

    // Create TypeScript config
    const tsConfig = {
        extends: "../../tsconfig.base.json",
        compilerOptions: {
            plugins: [{ name: "next" }]
        },
        include: [
            "next-env.d.ts",
            "**/*.ts",
            "**/*.tsx",
            ".next/types/**/*.ts"
        ],
        exclude: ["node_modules"]
    };

    await fs.writeFile(
        path.join(appPath, 'tsconfig.json'),
        JSON.stringify(tsConfig, null, 2)
    );

    console.log(`📦 Created basic project structure for ${service.name}`);
}

async function integrateService(service) {
    console.log(`\n🚀 Integrating ${service.name} (${service.description})...`);

    const appPath = path.join('apps', service.name);
    const appExists = await fs.access(appPath).then(() => true).catch(() => false);

    if (appExists) {
        console.log(`⚠️  ${service.name} already exists, skipping...`);
        return { success: true, skipped: true };
    }

    const repoUrl = `https://github.com/${service.targetRepo}.git`;
    const repoExists = await checkRepositoryExists(repoUrl);

    if (!repoExists) {
        console.log(`⚠️  Repository ${service.targetRepo} does not exist yet`);
        if (service.sourceRepo) {
            console.log(`📋 Source repository available: ${service.sourceRepo}`);
            console.log(`   TODO: Copy from ${service.sourceRepo} to ${service.targetRepo}`);
        } else {
            console.log(`📋 New repository needed: ${service.targetRepo}`);
        }
        return { success: false, reason: 'repository_not_exists', service };
    }

    try {
        // Try git subtree integration
        console.log(`📦 Integrating via git subtree...`);
        execSync(
            `git subtree add --prefix=apps/${service.name} ${repoUrl} main --squash`,
            { stdio: 'inherit' }
        );

        console.log(`✅ Successfully integrated ${service.name} via git subtree`);
    } catch (error) {
        try {
            // Fallback to clone method
            console.log(`⚠️  Subtree failed, using clone method...`);
            execSync(`git clone ${repoUrl} apps/${service.name}`, { stdio: 'inherit' });

            // Check if repository has content
            const repoPath = path.join('apps', service.name);
            const files = await fs.readdir(repoPath);
            const hasContent = files.some(file => !file.startsWith('.git'));

            if (!hasContent) {
                console.log(`⚠️  Repository ${service.name} is empty, creating basic structure...`);
                await createBasicProjectStructure(service);
            }

            // Remove .git directory (Windows compatible)
            if (process.platform === 'win32') {
                execSync(`rmdir /s /q "apps\\${service.name}\\.git"`, { stdio: 'ignore' });
            } else {
                execSync(`rm -rf apps/${service.name}/.git`, { stdio: 'ignore' });
            }

            console.log(`✅ Successfully integrated ${service.name} via clone`);

        } catch (cloneError) {
            console.error(`❌ Failed to integrate ${service.name}: ${cloneError.message}`);
            return { success: false, reason: 'integration_failed', service, error: cloneError.message };
        }
    }

    // Create agent configuration
    await createAgentConfig(service);

    return { success: true, service };
}

async function createAgentConfig(service) {
    const appPath = path.join('apps', service.name);

    // Create agent.project.json
    const agentConfig = {
        name: service.name,
        domain: service.domain,
        description: service.description,
        type: "codai-app",
        tier: service.tier,
        priority: service.priority,
        version: "1.0.0",
        lastUpdated: new Date().toISOString(),
        status: "integrated",
        repository: `https://github.com/${service.targetRepo}.git`,
        localPath: `apps/${service.name}`,
        subdomains: service.subdomains,
        dependencies: [],
        scripts: {
            dev: "next dev",
            build: "next build",
            test: "jest",
            lint: "next lint",
            typecheck: "tsc --noEmit"
        },
        ports: {
            dev: 3000 + service.priority * 10,
            preview: 3001 + service.priority * 10
        },
        environment: {
            nodeVersion: ">=18.0.0",
            requiredEnvVars: ['NEXT_PUBLIC_API_URL', 'NEXT_PUBLIC_APP_NAME']
        }
    };

    await fs.writeFile(
        path.join(appPath, 'agent.project.json'),
        JSON.stringify(agentConfig, null, 2)
    );

    // Create VS Code tasks for this service
    const vscodeTasks = {
        version: "2.0.0",
        tasks: [
            {
                label: `${service.name}: Dev Server`,
                type: "shell",
                command: "pnpm",
                args: ["dev", "--filter", service.name],
                group: "build",
                isBackground: true,
                presentation: {
                    echo: true,
                    reveal: "always",
                    focus: false,
                    panel: "shared",
                    showReuseMessage: true,
                    clear: false
                }
            },
            {
                label: `${service.name}: Build`,
                type: "shell",
                command: "pnpm",
                args: ["build", "--filter", service.name],
                group: "build"
            },
            {
                label: `${service.name}: Test`,
                type: "shell",
                command: "pnpm",
                args: ["test", "--filter", service.name],
                group: "test"
            }
        ]
    };

    await fs.mkdir(path.join(appPath, '.vscode'), { recursive: true });
    await fs.writeFile(
        path.join(appPath, '.vscode', 'tasks.json'),
        JSON.stringify(vscodeTasks, null, 2)
    );

    console.log(`📝 Created agent configuration for ${service.name}`);
}

async function updateProjectsIndex(integratedServices) {
    const indexPath = 'projects.index.json';
    const index = JSON.parse(await fs.readFile(indexPath, 'utf8'));

    // Add all successfully integrated services
    for (const result of integratedServices) {
        if (result.success && !result.skipped) {
            const service = result.service;
            index.apps.push({
                name: service.name,
                domain: service.domain,
                description: service.description,
                type: "codai-app",
                tier: service.tier,
                priority: service.priority,
                status: "active",
                path: `apps/${service.name}`,
                repository: `https://github.com/${service.targetRepo}.git`,
                lastUpdated: new Date().toISOString(),
                integration: {
                    method: "git-subtree",
                    branch: "main",
                    lastSync: new Date().toISOString()
                },
                metadata: {
                    framework: "next.js",
                    language: "typescript",
                    styling: "tailwindcss"
                }
            });
        }
    }

    index.totalApps = index.apps.length;
    index.lastUpdated = new Date().toISOString();

    await fs.writeFile(indexPath, JSON.stringify(index, null, 2));
    console.log(`📝 Updated projects index with ${index.totalApps} apps`);
}

async function generateIntegrationReport(results) {
    const successful = results.filter(r => r.success && !r.skipped);
    const skipped = results.filter(r => r.skipped);
    const failed = results.filter(r => !r.success);
    const missingRepos = failed.filter(r => r.reason === 'repository_not_exists');

    console.log('\n📊 INTEGRATION REPORT');
    console.log('=====================');
    console.log(`✅ Successfully integrated: ${successful.length}`);
    console.log(`⏭️  Skipped (already exists): ${skipped.length}`);
    console.log(`❌ Failed: ${failed.length}`);
    console.log(`📋 Missing repositories: ${missingRepos.length}`);

    if (successful.length > 0) {
        console.log('\n✅ SUCCESSFULLY INTEGRATED:');
        successful.forEach(r => console.log(`   - ${r.service.name} (${r.service.domain})`));
    }

    if (skipped.length > 0) {
        console.log('\n⏭️  SKIPPED (ALREADY EXISTS):');
        skipped.forEach(r => console.log(`   - ${r.service.name}`));
    }

    if (missingRepos.length > 0) {
        console.log('\n📋 REPOSITORIES TO CREATE:');
        missingRepos.forEach(r => {
            console.log(`   - ${r.service.targetRepo} (${r.service.description})`);
            if (r.service.sourceRepo) {
                console.log(`     Source: ${r.service.sourceRepo}`);
            }
        });

        console.log('\n🔧 NEXT STEPS FOR MISSING REPOSITORIES:');
        console.log('1. Create repositories in codai-ecosystem organization');
        console.log('2. Copy content from source repositories where applicable');
        console.log('3. Re-run this script to integrate them');
    }

    if (failed.filter(r => r.reason !== 'repository_not_exists').length > 0) {
        console.log('\n❌ INTEGRATION FAILURES:');
        failed.filter(r => r.reason !== 'repository_not_exists').forEach(r => {
            console.log(`   - ${r.service.name}: ${r.error}`);
        });
    }
}

async function main() {
    console.log('🌐 CODAI ECOSYSTEM BATCH INTEGRATION');
    console.log('====================================');
    console.log(`Integrating ${CODAI_SERVICES.length} services...\n`);

    const results = [];

    // Integrate services by priority
    for (let priority = 1; priority <= 4; priority++) {
        const priorityServices = CODAI_SERVICES.filter(s => s.priority === priority);
        console.log(`\n🎯 PRIORITY ${priority} SERVICES (${priorityServices.length})`);

        for (const service of priorityServices) {
            const result = await integrateService(service);
            results.push(result);
        }
    }

    // Update projects index
    await updateProjectsIndex(results);

    // Generate report
    await generateIntegrationReport(results);

    console.log('\n🎉 Batch integration complete!');
    console.log('🔄 Run "pnpm install" to update dependencies');
    console.log('🚀 Run "pnpm dev" to start all services');
}

// Run the batch integration
main().catch(error => {
    console.error('❌ Batch integration failed:', error);
    process.exit(1);
});
