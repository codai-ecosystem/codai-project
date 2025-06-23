#!/usr/bin/env node
/**
 * Single Service Integration Script
 * Integrates a specific service into the monorepo
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

const SERVICE_TO_INTEGRATE = {
    name: 'publicai',
    domain: 'publicai.ro',
    description: 'Civic AI & Transparency Tools',
    priority: 4,
    sourceRepo: null, // New development
    targetRepo: 'codai-ecosystem/publicai',
    subdomains: ['platform.publicai.ro', 'data.publicai.ro'],
    tier: 'specialized'
};

const PROJECT_ROOT = path.resolve(__dirname, '..');
const APPS_DIR = path.join(PROJECT_ROOT, 'apps');

async function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warn' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
}

async function createNextJSProject(service) {
    const appDir = path.join(APPS_DIR, service.name);
    await log(`Creating Next.js project for ${service.name}...`);
    
    try {
        await fs.mkdir(appDir, { recursive: true });
        
        // Create package.json
        const packageJson = {
            name: `@codai/${service.name}`,
            version: '0.1.0',
            private: true,
            description: service.description,
            scripts: {
                dev: 'next dev',
                build: 'next build',
                start: 'next start',
                lint: 'next lint',
                test: 'jest',
                'test:watch': 'jest --watch',
                typecheck: 'tsc --noEmit'
            },
            dependencies: {
                'next': '^14.0.0',
                'react': '^18.0.0',
                'react-dom': '^18.0.0'
            },
            devDependencies: {
                '@types/node': '^20.0.0',
                '@types/react': '^18.0.0',
                '@types/react-dom': '^18.0.0',
                'eslint': '^8.0.0',
                'eslint-config-next': '^14.0.0',
                'typescript': '^5.0.0'
            }
        };
        
        await fs.writeFile(
            path.join(appDir, 'package.json'),
            JSON.stringify(packageJson, null, 2)
        );
        
        // Create directory structure
        await fs.mkdir(path.join(appDir, 'src', 'app'), { recursive: true });
        await fs.mkdir(path.join(appDir, 'src', 'components'), { recursive: true });
        await fs.mkdir(path.join(appDir, 'src', 'lib'), { recursive: true });
        await fs.mkdir(path.join(appDir, 'public'), { recursive: true });
        
        // Create layout.tsx
        const layoutContent = `import type { Metadata } from 'next'
import { ReactNode } from 'react'

export const metadata: Metadata = {
  title: '${service.name.charAt(0).toUpperCase() + service.name.slice(1)} - Codai Ecosystem',
  description: '${service.description}',
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}`;
        
        await fs.writeFile(
            path.join(appDir, 'src', 'app', 'layout.tsx'),
            layoutContent
        );
        
        // Create page.tsx
        const pageContent = `export default function HomePage() {
  return (
    <main>
      <h1>Welcome to ${service.name.charAt(0).toUpperCase() + service.name.slice(1)}</h1>
      <p>${service.description}</p>
      <p>Domain: <a href="https://${service.domain}" target="_blank" rel="noopener noreferrer">${service.domain}</a></p>
    </main>
  )
}`;
        
        await fs.writeFile(
            path.join(appDir, 'src', 'app', 'page.tsx'),
            pageContent
        );
        
        // Create tsconfig.json
        const tsconfig = {
            extends: '../../tsconfig.base.json',
            compilerOptions: {
                plugins: [
                    {
                        name: 'next'
                    }
                ]
            },
            include: [
                'next-env.d.ts',
                '**/*.ts',
                '**/*.tsx',
                '.next/types/**/*.ts'
            ],
            exclude: [
                'node_modules'
            ]
        };
        
        await fs.writeFile(
            path.join(appDir, 'tsconfig.json'),
            JSON.stringify(tsconfig, null, 2)
        );
        
        // Create next.config.js
        const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig`;
        
        await fs.writeFile(
            path.join(appDir, 'next.config.js'),
            nextConfig
        );
        
        await log(`✅ Next.js project created for ${service.name}`, 'success');
        return true;
    } catch (error) {
        await log(`❌ Failed to create Next.js project for ${service.name}: ${error.message}`, 'error');
        return false;
    }
}

async function createAgentConfig(service) {
    const appDir = path.join(APPS_DIR, service.name);
    await log(`Creating agent configuration for ${service.name}...`);
    
    try {
        // Create agent.project.json
        const agentConfig = {
            name: service.name,
            domain: service.domain,
            description: service.description,
            priority: service.priority,
            tier: service.tier,
            workspace: {
                type: 'nextjs',
                framework: 'Next.js 14',
                language: 'TypeScript',
                styling: 'TailwindCSS',
                database: 'PostgreSQL',
                deployment: 'Vercel'
            },
            development: {
                port: 3000 + service.priority,
                hotReload: true,
                typeChecking: true,
                linting: true
            },
            ai: {
                model: 'claude-3.5-sonnet',
                context: `${service.description}. Focus on ${service.tier} tier development with priority ${service.priority}.`,
                capabilities: ['web-development', 'typescript', 'nextjs', 'react'],
                restrictions: ['no-breaking-changes', 'maintain-consistency']
            },
            integration: {
                monorepo: true,
                sharedPackages: ['@codai/ui', '@codai/config', '@codai/auth'],
                apis: ['api.codai.ro'],
                databases: ['memorai.ro']
            }
        };
        
        await fs.writeFile(
            path.join(appDir, 'agent.project.json'),
            JSON.stringify(agentConfig, null, 2)
        );
        
        // Create .vscode directory and tasks
        await fs.mkdir(path.join(appDir, '.vscode'), { recursive: true });
        
        const vscodeSettings = {
            'typescript.preferences.includePackageJsonAutoImports': 'on',
            'editor.formatOnSave': true,
            'editor.codeActionsOnSave': {
                'source.fixAll.eslint': true,
                'source.organizeImports': true
            }
        };
        
        await fs.writeFile(
            path.join(appDir, '.vscode', 'settings.json'),
            JSON.stringify(vscodeSettings, null, 2)
        );
        
        const vscodeTasks = {
            version: '2.0.0',
            tasks: [
                {
                    label: `${service.name}: Dev Server`,
                    type: 'shell',
                    command: 'pnpm',
                    args: ['dev'],
                    group: 'build',
                    isBackground: true,
                    presentation: {
                        echo: true,
                        reveal: 'always',
                        focus: false,
                        panel: 'new'
                    },
                    problemMatcher: []
                },
                {
                    label: `${service.name}: Build`,
                    type: 'shell',
                    command: 'pnpm',
                    args: ['build'],
                    group: 'build',
                    presentation: {
                        echo: true,
                        reveal: 'always',
                        focus: false,
                        panel: 'new'
                    }
                },
                {
                    label: `${service.name}: Test`,
                    type: 'shell',
                    command: 'pnpm',
                    args: ['test'],
                    group: 'test',
                    presentation: {
                        echo: true,
                        reveal: 'always',
                        focus: false,
                        panel: 'new'
                    }
                }
            ]
        };
        
        await fs.writeFile(
            path.join(appDir, '.vscode', 'tasks.json'),
            JSON.stringify(vscodeTasks, null, 2)
        );
        
        await log(`✅ Agent configuration created for ${service.name}`, 'success');
        return true;
    } catch (error) {
        await log(`❌ Failed to create agent config for ${service.name}: ${error.message}`, 'error');
        return false;
    }
}

async function updateProjectsIndex(service) {
    await log(`Updating projects index...`);
    
    try {
        const indexPath = path.join(PROJECT_ROOT, 'projects.index.json');
        let projectsIndex = {};
        
        try {
            const indexContent = await fs.readFile(indexPath, 'utf8');
            projectsIndex = JSON.parse(indexContent);
        } catch (error) {
            // File doesn't exist, create new index
            projectsIndex = {
                version: '1.0.0',
                lastUpdated: new Date().toISOString(),
                totalApps: 0,
                apps: []
            };
        }
        
        // Ensure apps array exists
        if (!projectsIndex.apps) {
            projectsIndex.apps = [];
        }
        
        // Add the service
        const serviceEntry = {
            name: service.name,
            domain: service.domain,
            description: service.description,
            type: 'codai-app',
            tier: service.tier,
            priority: service.priority,
            status: 'active',
            path: `apps/${service.name}`,
            repository: `https://github.com/${service.targetRepo}.git`,
            lastUpdated: new Date().toISOString(),
            integration: {
                method: 'local-creation',
                branch: 'main',
                lastSync: new Date().toISOString()
            }
        };
        
        projectsIndex.apps.push(serviceEntry);
        projectsIndex.totalApps = projectsIndex.apps.length;
        projectsIndex.lastUpdated = new Date().toISOString();
        
        await fs.writeFile(indexPath, JSON.stringify(projectsIndex, null, 2));
        await log(`✅ Projects index updated`, 'success');
        return true;
    } catch (error) {
        await log(`❌ Failed to update projects index: ${error.message}`, 'error');
        return false;
    }
}

async function main() {
    await log('🚀 Starting publicai service integration...');
    
    try {
        // Create Next.js project
        const projectCreated = await createNextJSProject(SERVICE_TO_INTEGRATE);
        if (!projectCreated) {
            throw new Error('Failed to create Next.js project');
        }
        
        // Create agent configuration
        const agentCreated = await createAgentConfig(SERVICE_TO_INTEGRATE);
        if (!agentCreated) {
            throw new Error('Failed to create agent configuration');
        }
        
        // Update projects index
        const indexUpdated = await updateProjectsIndex(SERVICE_TO_INTEGRATE);
        if (!indexUpdated) {
            throw new Error('Failed to update projects index');
        }
        
        await log('🎉 publicai service integration completed successfully!', 'success');
        await log(`📁 Service created at: apps/${SERVICE_TO_INTEGRATE.name}`, 'info');
        await log(`🌐 Domain: ${SERVICE_TO_INTEGRATE.domain}`, 'info');
        await log(`📋 Priority: ${SERVICE_TO_INTEGRATE.priority} (${SERVICE_TO_INTEGRATE.tier} tier)`, 'info');
        
    } catch (error) {
        await log(`❌ Integration failed: ${error.message}`, 'error');
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}
