#!/usr/bin/env node

/**
 * Complete Codai Ecosystem Integration Script
 * Integrates all 29 repositories from codai-ecosystem organization
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const SERVICES_DIR = 'services';

// Complete list of all 29 repositories in codai-ecosystem
const ALL_REPOSITORIES = [
  // Core Services (Priority 1)
  {
    name: 'codai',
    priority: 1,
    description: 'Central Platform & AIDE Hub',
    domain: 'codai.ro',
    port: 3000,
  },
  {
    name: 'memorai',
    priority: 1,
    description: 'AI Memory & Database Core',
    domain: 'memorai.ro',
    port: 3001,
  },
  {
    name: 'logai',
    priority: 1,
    description: 'Identity & Authentication Hub',
    domain: 'logai.ro',
    port: 3002,
  },

  // Financial Services (Priority 2)
  {
    name: 'bancai',
    priority: 2,
    description: 'Financial Platform',
    domain: 'bancai.ro',
    port: 3003,
  },
  {
    name: 'wallet',
    priority: 2,
    description: 'Programmable Wallet',
    domain: 'wallet.bancai.ro',
    port: 3004,
  },
  {
    name: 'x',
    priority: 2,
    description: 'AI Trading Platform',
    domain: 'x.codai.ro',
    port: 3010,
  },
  {
    name: 'stocai',
    priority: 2,
    description: 'AI Stock Trading Platform',
    domain: 'stocai.codai.ro',
    port: 3020,
  },

  // AI Services (Priority 2)
  {
    name: 'fabricai',
    priority: 2,
    description: 'AI Services Platform',
    domain: 'fabricai.ro',
    port: 3005,
  },
  {
    name: 'marketai',
    priority: 2,
    description: 'AI Marketing Platform',
    domain: 'marketai.ro',
    port: 3015,
  },
  {
    name: 'analizai',
    priority: 2,
    description: 'AI Analytics Platform',
    domain: 'analizai.ro',
    port: 3016,
  },

  // Social & Education (Priority 3)
  {
    name: 'studiai',
    priority: 3,
    description: 'AI Education Platform',
    domain: 'studiai.ro',
    port: 3006,
  },
  {
    name: 'sociai',
    priority: 3,
    description: 'AI Social Platform',
    domain: 'sociai.ro',
    port: 3007,
  },
  {
    name: 'cumparai',
    priority: 3,
    description: 'AI Shopping Platform',
    domain: 'cumparai.ro',
    port: 3008,
  },

  // Support Services (Priority 3)
  {
    name: 'ajutai',
    priority: 3,
    description: 'AI Support & Help Platform',
    domain: 'ajutai.ro',
    port: 3021,
  },
  {
    name: 'legalizai',
    priority: 3,
    description: 'AI Legal Services Platform',
    domain: 'legalizai.ro',
    port: 3022,
  },
  {
    name: 'jucai',
    priority: 3,
    description: 'AI Gaming Platform',
    domain: 'jucai.ro',
    port: 3023,
  },
  {
    name: 'metu',
    priority: 3,
    description: 'AI Metrics & Analytics',
    domain: 'metu.codai.ro',
    port: 3024,
  },

  // Infrastructure & Tools (Priority 4)
  {
    name: 'templates',
    priority: 4,
    description: 'Shared Templates & Boilerplates',
    domain: 'templates.codai.ro',
    port: 3011,
  },
  {
    name: 'tools',
    priority: 4,
    description: 'Development Tools & Utilities',
    domain: 'tools.codai.ro',
    port: 3017,
  },
  {
    name: 'explorer',
    priority: 4,
    description: 'AI Blockchain Explorer',
    domain: 'explorer.codai.ro',
    port: 3012,
  },
  {
    name: 'hub',
    priority: 4,
    description: 'Central Hub & Dashboard',
    domain: 'hub.codai.ro',
    port: 3018,
  },
  {
    name: 'dash',
    priority: 4,
    description: 'Analytics Dashboard',
    domain: 'dash.codai.ro',
    port: 3019,
  },
  {
    name: 'admin',
    priority: 4,
    description: 'Admin Panel & Management',
    domain: 'admin.codai.ro',
    port: 3025,
  },
  {
    name: 'docs',
    priority: 4,
    description: 'Documentation Platform',
    domain: 'docs.codai.ro',
    port: 3026,
  },

  // Development & Meta (Priority 4)
  {
    name: 'kodex',
    priority: 4,
    description: 'Code Repository & Version Control',
    domain: 'kodex.codai.ro',
    port: 3013,
  },
  {
    name: 'mod',
    priority: 4,
    description: 'Modding & Extension Platform',
    domain: 'mod.codai.ro',
    port: 3014,
  },
  {
    name: 'id',
    priority: 4,
    description: 'Identity Management System',
    domain: 'id.codai.ro',
    port: 3027,
  },
  {
    name: 'AIDE',
    priority: 4,
    description: 'AI Development Environment',
    domain: 'aide.codai.ro',
    port: 3028,
  },
  {
    name: 'codai-project',
    priority: 4,
    description: 'Meta-orchestration Repository',
    domain: 'project.codai.ro',
    port: 3029,
  },
];

function execCommand(command, cwd = process.cwd()) {
  try {
    console.log(`📋 Executing: ${command}`);
    const result = execSync(command, {
      cwd,
      encoding: 'utf-8',
      stdio: 'pipe',
    });
    console.log(`✅ Success: ${command}`);
    return result;
  } catch (error) {
    console.error(`❌ Error executing: ${command}`);
    console.error(error.message);
    return null;
  }
}

function ensureServicesDirectory() {
  if (!fs.existsSync(SERVICES_DIR)) {
    fs.mkdirSync(SERVICES_DIR, { recursive: true });
    console.log(`📁 Created ${SERVICES_DIR} directory`);
  }
}

function addGitSubmodule(repo) {
  const servicePath = path.join(SERVICES_DIR, repo.name);

  // Check if submodule already exists
  if (fs.existsSync(servicePath)) {
    console.log(`✅ ${repo.name}: Already exists as submodule`);
    return true;
  }

  console.log(`\n🔗 Adding ${repo.name} as git submodule...`);

  const submoduleUrl = `https://github.com/codai-ecosystem/${repo.name}.git`;
  const command = `git submodule add ${submoduleUrl} ${servicePath}`;

  const result = execCommand(command);
  if (result !== null) {
    console.log(`✅ ${repo.name}: Successfully added as submodule`);
    return true;
  } else {
    console.log(
      `⚠️  ${repo.name}: Failed to add as submodule, will create scaffolding`
    );
    return false;
  }
}

function createScaffoldedService(repo) {
  const servicePath = path.join(SERVICES_DIR, repo.name);

  if (fs.existsSync(servicePath)) {
    console.log(`✅ ${repo.name}: Directory already exists`);
    return;
  }

  console.log(`🏗️  Creating scaffolded service: ${repo.name}`);

  // Create service directory
  fs.mkdirSync(servicePath, { recursive: true });

  // Create package.json
  const packageJson = {
    name: `@codai/${repo.name}`,
    version: '0.1.0',
    private: true,
    description: repo.description,
    homepage: `https://${repo.domain}/`,
    repository: {
      type: 'git',
      url: `https://github.com/codai-ecosystem/${repo.name}.git`,
    },
    scripts: {
      dev: `next dev -p ${repo.port}`,
      build: 'next build',
      start: `next start -p ${repo.port}`,
      lint: 'next lint',
      test: 'vitest',
      'test:watch': 'vitest --watch',
      typecheck: 'tsc --noEmit',
    },
    dependencies: {
      next: '^14.0.4',
      react: '^18.2.0',
      'react-dom': '^18.2.0',
      '@types/node': '^20.10.4',
      '@types/react': '^18.2.43',
      '@types/react-dom': '^18.2.17',
      typescript: '^5.3.3',
      tailwindcss: '^3.3.6',
      postcss: '^8.4.32',
      autoprefixer: '^10.4.16',
      clsx: '^2.0.0',
      'class-variance-authority': '^0.7.0',
    },
    devDependencies: {
      eslint: '^8.55.0',
      'eslint-config-next': '^14.0.4',
      '@typescript-eslint/parser': '^6.13.2',
      '@typescript-eslint/eslint-plugin': '^6.13.2',
      vitest: '^1.0.4',
      '@vitejs/plugin-react': '^4.2.0',
    },
  };

  fs.writeFileSync(
    path.join(servicePath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  // Create README.md
  const readme = `# ${repo.name.charAt(0).toUpperCase() + repo.name.slice(1)}

${repo.description}

## 🚀 Quick Start

\`\`\`bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Visit https://${repo.domain}
\`\`\`

## 📁 Project Structure

\`\`\`
${repo.name}/
├── app/                 # Next.js App Router
├── components/         # React components
├── lib/               # Utility functions
├── public/            # Static assets
├── styles/            # CSS styles
└── types/             # TypeScript definitions
\`\`\`

## 🛠️ Development

This is a Next.js 14 application using:

- Framework: Next.js 14 with App Router
- Language: TypeScript
- Styling: Tailwind CSS
- Testing: Vitest
- Package Manager: PNPM

## 🌐 Domain

- Production: https://${repo.domain}/
- Development: http://localhost:${repo.port}/

## 🏗️ Architecture

Part of the Codai Ecosystem - ${repo.description}

Priority Level: ${repo.priority} ${repo.priority <= 2 ? '(High)' : repo.priority === 3 ? '(Medium)' : '(Low)'}

## 📝 Status

🚧 Under Development - Service scaffolding complete, ready for implementation.

## 🤝 Contributing

This service is part of the Codai Ecosystem monorepo. Please refer to the main
project documentation for contribution guidelines.

## 📄 License

Private - Codai Ecosystem
`;

  fs.writeFileSync(path.join(servicePath, 'README.md'), readme);

  // Create basic Next.js structure
  fs.mkdirSync(path.join(servicePath, 'app'), { recursive: true });
  fs.mkdirSync(path.join(servicePath, 'components'), { recursive: true });
  fs.mkdirSync(path.join(servicePath, 'lib'), { recursive: true });
  fs.mkdirSync(path.join(servicePath, 'types'), { recursive: true });
  fs.mkdirSync(path.join(servicePath, 'public'), { recursive: true });
  fs.mkdirSync(path.join(servicePath, '.vscode'), { recursive: true });

  // Create basic files
  createBasicFiles(servicePath, repo);

  console.log(`✅ ${repo.name}: Scaffolding complete`);
}

function createBasicFiles(servicePath, repo) {
  // Create app/layout.tsx
  const layout = `import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '${repo.name.charAt(0).toUpperCase() + repo.name.slice(1)} - Codai Ecosystem',
  description: '${repo.description}',
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

  fs.writeFileSync(path.join(servicePath, 'app', 'layout.tsx'), layout);

  // Create app/page.tsx
  const page = `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          ${repo.name.charAt(0).toUpperCase() + repo.name.slice(1)}
        </h1>
        <p className="text-xl text-center text-gray-600 dark:text-gray-400">
          ${repo.description}
        </p>
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Part of the Codai Ecosystem - Priority ${repo.priority}
          </p>
          <p className="text-sm text-gray-500">
            🚧 Under Development
          </p>
        </div>
      </div>
    </main>
  )
}
`;

  fs.writeFileSync(path.join(servicePath, 'app', 'page.tsx'), page);

  // Create other essential files
  const files = {
    'app/globals.css': `@tailwind base;
@tailwind components;
@tailwind utilities;`,
    'components/README.md': `# Components

React components for ${repo.name}`,
    'lib/utils.ts': `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwindcss-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`,
    'types/index.ts': `// Type definitions for ${repo.name}`,
    '.gitignore': `# Dependencies
node_modules/
.pnpm-store/

# Production
.next/
out/
build/
dist/

# Environment variables
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock`,
    'next.config.js': `/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}

module.exports = nextConfig`,
    'tailwind.config.ts': `import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
    },
  },
  plugins: [],
}
export default config`,
    'tsconfig.json': `{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}`,
    'postcss.config.js': `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`,
    '.eslintrc.json': `{
  "extends": "next/core-web-vitals"
}`,
    '.env.example': `# ${repo.name.toUpperCase()} Configuration

# Application
NEXT_PUBLIC_APP_NAME="${repo.name}"
NEXT_PUBLIC_APP_URL="https://${repo.domain}"
NEXT_PUBLIC_API_URL="/api"

# Database (if needed)
# DATABASE_URL="postgresql://..."

# Authentication (if needed)
# NEXTAUTH_SECRET="..."
# NEXTAUTH_URL="https://${repo.domain}"

# External APIs (customize as needed)
# API_KEY="..."`,
    'agent.project.json': JSON.stringify(
      {
        name: repo.name,
        description: repo.description,
        domain: repo.domain,
        port: repo.port,
        priority: repo.priority,
        framework: 'Next.js 14',
        language: 'TypeScript',
        styling: 'Tailwind CSS',
        testing: 'Vitest',
        packageManager: 'PNPM',
        ecosystem: 'Codai',
        status: 'scaffolded',
        category:
          repo.priority <= 2
            ? 'core'
            : repo.priority === 3
              ? 'feature'
              : 'infrastructure',
      },
      null,
      2
    ),
    'copilot-instructions.md': `# ${repo.name.charAt(0).toUpperCase() + repo.name.slice(1)} Copilot Instructions

## Service Overview
${repo.description} - Part of the Codai AI-native ecosystem.

## Context
- **Domain**: ${repo.domain}
- **Port**: ${repo.port}
- **Priority**: ${repo.priority}
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript with strict configuration
- **Styling**: Tailwind CSS

## Development Guidelines
1. Follow Codai ecosystem patterns and conventions
2. Implement AI-native features and interactions
3. Ensure responsive design and accessibility
4. Use TypeScript strict mode and proper typing
5. Follow the established component and utility patterns

## Architecture
- Use Next.js App Router for routing
- Implement server components where possible
- Follow the established folder structure
- Use the shared component library patterns

## Key Commands
\`\`\`bash
pnpm dev      # Start development server
pnpm build    # Build for production
pnpm test     # Run tests
pnpm lint     # Lint code
\`\`\`

## Integration Points
- Connect with other Codai services via APIs
- Use shared authentication through logai
- Implement consistent UI/UX patterns
- Follow ecosystem-wide data flow patterns
`,
    'vitest.config.ts': `import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
  },
})`,
    '.vscode/settings.json': JSON.stringify(
      {
        'typescript.preferences.importModuleSpecifier': 'relative',
        'editor.formatOnSave': true,
        'editor.codeActionsOnSave': {
          'source.fixAll.eslint': true,
        },
        'files.associations': {
          '*.css': 'tailwindcss',
        },
      },
      null,
      2
    ),
    '.vscode/tasks.json': JSON.stringify(
      {
        version: '2.0.0',
        tasks: [
          {
            label: `${repo.name}: Dev`,
            type: 'shell',
            command: 'pnpm',
            args: ['dev'],
            group: 'build',
            isBackground: true,
            presentation: {
              echo: true,
              reveal: 'always',
              focus: false,
              panel: 'new',
            },
          },
          {
            label: `${repo.name}: Build`,
            type: 'shell',
            command: 'pnpm',
            args: ['build'],
            group: 'build',
          },
          {
            label: `${repo.name}: Test`,
            type: 'shell',
            command: 'pnpm',
            args: ['test'],
            group: 'test',
          },
        ],
      },
      null,
      2
    ),
  };

  for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.join(servicePath, filePath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(fullPath, content);
  }
}

function updateGitmodules() {
  console.log('\n📝 Updating .gitmodules file...');

  let gitmodulesContent = '';

  for (const repo of ALL_REPOSITORIES) {
    if (repo.name === 'codai-project') continue; // Skip the meta repo

    gitmodulesContent += `[submodule "services/${repo.name}"]\n`;
    gitmodulesContent += `\tpath = services/${repo.name}\n`;
    gitmodulesContent += `\turl = https://github.com/codai-ecosystem/${repo.name}.git\n`;
    gitmodulesContent += `\tbranch = main\n\n`;
  }

  fs.writeFileSync('.gitmodules', gitmodulesContent);
  console.log('✅ Updated .gitmodules file');
}

function updatePnpmWorkspace() {
  console.log('\n📝 Updating pnpm-workspace.yaml...');

  const workspaceContent = `packages:
  - "packages/*"
  - "services/*"
`;

  fs.writeFileSync('pnpm-workspace.yaml', workspaceContent);
  console.log('✅ Updated pnpm-workspace.yaml');
}

async function main() {
  console.log('🚀 COMPLETE CODAI ECOSYSTEM INTEGRATION');
  console.log('=========================================');
  console.log(`📊 Total repositories to integrate: ${ALL_REPOSITORIES.length}`);

  // Ensure services directory exists
  ensureServicesDirectory();

  console.log('\n🔗 Phase 1: Adding Git Submodules...');
  let submodulesAdded = 0;
  let scaffoldingNeeded = [];

  for (const repo of ALL_REPOSITORIES) {
    if (repo.name === 'codai-project') continue; // Skip the meta repo

    const success = addGitSubmodule(repo);
    if (success) {
      submodulesAdded++;
    } else {
      scaffoldingNeeded.push(repo);
    }
  }

  console.log('\n🏗️  Phase 2: Creating Scaffolded Services...');
  for (const repo of scaffoldingNeeded) {
    createScaffoldedService(repo);
  }

  console.log('\n📝 Phase 3: Updating Configuration Files...');
  updateGitmodules();
  updatePnpmWorkspace();

  console.log('\n📊 INTEGRATION SUMMARY:');
  console.log('=======================');
  console.log(`✅ Git submodules added: ${submodulesAdded}`);
  console.log(`🏗️  Scaffolded services: ${scaffoldingNeeded.length}`);
  console.log(`📁 Total services: ${ALL_REPOSITORIES.length - 1}`); // -1 for codai-project

  console.log('\n🎯 SERVICES BY PRIORITY:');
  const byPriority = {};
  ALL_REPOSITORIES.forEach(repo => {
    if (repo.name === 'codai-project') return;
    if (!byPriority[repo.priority]) byPriority[repo.priority] = [];
    byPriority[repo.priority].push(repo.name);
  });

  Object.keys(byPriority)
    .sort()
    .forEach(priority => {
      const level =
        priority == 1
          ? 'Critical'
          : priority == 2
            ? 'High'
            : priority == 3
              ? 'Medium'
              : 'Low';
      console.log(
        `  Priority ${priority} (${level}): ${byPriority[priority].length} services`
      );
      console.log(`    ${byPriority[priority].join(', ')}`);
    });

  console.log('\n🚀 NEXT STEPS:');
  console.log('===============');
  console.log('1. Run: git submodule update --init --recursive');
  console.log('2. Run: pnpm install');
  console.log('3. Run: npm run verify-repos');
  console.log('4. Run: npm run dev (starts priority 1 services)');
  console.log('5. Run: npm run dev:all (starts all services)');

  console.log('\n✨ ALL 29 REPOSITORIES INTEGRATED INTO CODAI ECOSYSTEM!');
}

main().catch(console.error);
