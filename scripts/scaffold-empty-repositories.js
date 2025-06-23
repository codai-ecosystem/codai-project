#!/usr/bin/env node

/**
 * Scaffold Empty Repositories Script
 * Fills all empty repositories with Next.js 14 + TypeScript scaffolding
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const SERVICES_DIR = 'services';

// Empty repositories that need scaffolding
const EMPTY_REPOSITORIES = [
  'admin', 'AIDE', 'ajutai', 'dash', 'docs', 'hub', 'id', 
  'jucai', 'kodex', 'legalizai', 'metu', 'mod', 'stocai'
];

function execCommand(command, cwd = process.cwd()) {
  try {
    console.log(`📋 Executing: ${command}`);
    const result = execSync(command, { 
      cwd, 
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    console.log(`✅ Success: ${command}`);
    return result;
  } catch (error) {
    console.error(`❌ Error executing: ${command}`);
    console.error(error.message);
    return null;
  }
}

function createPackageJson(serviceName, serviceDir) {
  const getServiceDescription = (name) => {
    const descriptions = {
      'admin': 'Admin Panel & Management System',
      'AIDE': 'AI Development Environment',
      'ajutai': 'AI Support & Help Platform',
      'dash': 'Analytics Dashboard',
      'docs': 'Documentation Platform',
      'hub': 'Central Hub & Dashboard',
      'id': 'Identity Management System',
      'jucai': 'AI Gaming Platform',
      'kodex': 'Code Repository & Version Control',
      'legalizai': 'AI Legal Services Platform',
      'metu': 'AI Metrics & Analytics',
      'mod': 'Modding & Extension Platform',
      'stocai': 'AI Stock Trading Platform'
    };
    return descriptions[name] || 'AI-powered service';
  };

  const packageJson = {
    name: `@codai/${serviceName}`,
    version: "0.1.0",
    private: true,
    description: getServiceDescription(serviceName),
    type: "module",
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
      lint: "next lint",
      test: "vitest",
      "test:ui": "vitest --ui",
      typecheck: "tsc --noEmit"
    },
    dependencies: {
      "next": "^14.2.0",
      "react": "^18.3.0",
      "react-dom": "^18.3.0",
      "@tailwindcss/typography": "^0.5.15",
      "clsx": "^2.1.1",
      "lucide-react": "^0.445.0"
    },
    devDependencies: {
      "@types/node": "^20.16.0",
      "@types/react": "^18.3.0",
      "@types/react-dom": "^18.3.0",
      "autoprefixer": "^10.4.20",
      "eslint": "^8.57.0",
      "eslint-config-next": "^14.2.0",
      "postcss": "^8.4.47",
      "tailwindcss": "^3.4.0",
      "typescript": "^5.6.0",
      "vitest": "^2.1.0",
      "@vitejs/plugin-react": "^4.3.0"
    },
    engines: {
      node: ">=18.17.0"
    }
  };

  fs.writeFileSync(
    path.join(serviceDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
}

function createReadme(serviceName, serviceDir) {
  const getServiceDescription = (name) => {
    const descriptions = {
      'admin': 'Admin Panel & Management System for the Codai ecosystem',
      'AIDE': 'AI Development Environment - Advanced IDE for AI-powered development',
      'ajutai': 'AI Support & Help Platform - Intelligent assistance and support',
      'dash': 'Analytics Dashboard - Real-time metrics and visualization',
      'docs': 'Documentation Platform - Comprehensive documentation system',
      'hub': 'Central Hub & Dashboard - Main control center',
      'id': 'Identity Management System - User authentication and authorization',
      'jucai': 'AI Gaming Platform - Intelligent gaming and entertainment',
      'kodex': 'Code Repository & Version Control - Development workflow management',
      'legalizai': 'AI Legal Services Platform - Intelligent legal assistance',
      'metu': 'AI Metrics & Analytics - Advanced analytics and insights',
      'mod': 'Modding & Extension Platform - Customization and extensions',
      'stocai': 'AI Stock Trading Platform - Intelligent financial trading'
    };
    return descriptions[name] || 'AI-powered service';
  };

  const readme = `# ${serviceName.toUpperCase()} - ${getServiceDescription(serviceName)}

## Overview

${getServiceDescription(serviceName)} built with Next.js 14 and TypeScript for the Codai ecosystem.

## Features

- ⚡ Next.js 14 with App Router
- 🔷 TypeScript for type safety
- 🎨 Tailwind CSS for styling
- 🧪 Vitest for testing
- 📱 Responsive design
- 🌐 API routes
- 🔄 Real-time updates

## Getting Started

### Prerequisites

- Node.js 18.17.0 or later
- pnpm (recommended)

### Installation

\`\`\`bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Development

### Available Scripts

- \`pnpm dev\` - Start development server
- \`pnpm build\` - Build for production
- \`pnpm start\` - Start production server
- \`pnpm lint\` - Run ESLint
- \`pnpm test\` - Run tests
- \`pnpm typecheck\` - Type checking

### Project Structure

\`\`\`
${serviceName}/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # React components
│   ├── lib/             # Utilities and configurations
│   └── types/           # TypeScript type definitions
├── public/              # Static assets
├── tests/               # Test files
└── ...config files
\`\`\`

## Architecture

This service follows the Codai ecosystem architecture:

- **Frontend**: Next.js 14 with React 18
- **Styling**: Tailwind CSS
- **Type Safety**: TypeScript
- **Testing**: Vitest
- **AI Integration**: Ready for AI agent integration

## Integration

Part of the Codai ecosystem - integrates with:

- Central orchestration system
- Shared authentication (ID service)
- Cross-service communication
- Unified monitoring and analytics

## Contributing

1. Follow the established patterns
2. Write tests for new features
3. Use TypeScript strictly
4. Follow the code style guidelines
5. Update documentation

## License

Part of the Codai ecosystem - All rights reserved.

---

**Status**: 🚧 In Development - Ready for AI agent enhancement

Built with ❤️ for the Codai ecosystem
`;

  fs.writeFileSync(path.join(serviceDir, 'README.md'), readme);
}

function createAgentConfig(serviceName, serviceDir) {
  const getServiceType = (name) => {
    const types = {
      'admin': 'management',
      'AIDE': 'development',
      'ajutai': 'support',
      'dash': 'analytics',
      'docs': 'documentation',
      'hub': 'dashboard',
      'id': 'authentication',
      'jucai': 'gaming',
      'kodex': 'repository',
      'legalizai': 'legal',
      'metu': 'analytics',
      'mod': 'extension',
      'stocai': 'trading'
    };
    return types[name] || 'service';
  };

  const agentConfig = {
    name: serviceName,
    version: "0.1.0",
    type: getServiceType(serviceName),
    framework: "next-js-14",
    language: "typescript",
    ai_integration: {
      enabled: true,
      agent_capable: true,
      memory_enabled: true
    },
    development: {
      port: 3000,
      hot_reload: true,
      typescript_strict: true
    },
    ecosystem: {
      organization: "codai-ecosystem",
      monorepo: "codai-project",
      integration: "submodule"
    },
    capabilities: [
      "web-interface",
      "api-endpoints",
      "real-time-updates",
      "responsive-design",
      "ai-ready"
    ]
  };

  fs.writeFileSync(
    path.join(serviceDir, 'agent.project.json'),
    JSON.stringify(agentConfig, null, 2)
  );
}

function createNextConfig(serviceDir) {
  const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  eslint: {
    dirs: ['src'],
  },
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
}

module.exports = nextConfig
`;

  fs.writeFileSync(path.join(serviceDir, 'next.config.js'), nextConfig);
}

function createTsConfig(serviceDir) {
  const tsConfig = {
    compilerOptions: {
      lib: ["dom", "dom.iterable", "es6"],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: "esnext",
      moduleResolution: "bundler",
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: "preserve",
      incremental: true,
      plugins: [
        {
          name: "next"
        }
      ],
      baseUrl: ".",
      paths: {
        "@/*": ["./src/*"]
      }
    },
    include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
    exclude: ["node_modules"]
  };

  fs.writeFileSync(
    path.join(serviceDir, 'tsconfig.json'),
    JSON.stringify(tsConfig, null, 2)
  );
}

function createTailwindConfig(serviceDir) {
  const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
`;

  fs.writeFileSync(path.join(serviceDir, 'tailwind.config.js'), tailwindConfig);
}

function createPostcssConfig(serviceDir) {
  const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;

  fs.writeFileSync(path.join(serviceDir, 'postcss.config.js'), postcssConfig);
}

function createBasicAppStructure(serviceName, serviceDir) {
  // Create src directory structure
  const srcDir = path.join(serviceDir, 'src');
  const appDir = path.join(srcDir, 'app');
  const componentsDir = path.join(srcDir, 'components');
  const libDir = path.join(srcDir, 'lib');
  const typesDir = path.join(srcDir, 'types');

  [srcDir, appDir, componentsDir, libDir, typesDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Create globals.css
  const globalsCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 0, 0, 0;
    --background-end-rgb: 0, 0, 0;
  }
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}
`;

  fs.writeFileSync(path.join(appDir, 'globals.css'), globalsCss);

  // Create layout.tsx
  const layout = `import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '${serviceName.toUpperCase()} - Codai Ecosystem',
  description: 'AI-powered ${serviceName} service',
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

  fs.writeFileSync(path.join(appDir, 'layout.tsx'), layout);

  // Create page.tsx
  const page = `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold text-center">
          Welcome to ${serviceName.toUpperCase()}
        </h1>
      </div>

      <div className="relative flex place-items-center">
        <div className="max-w-2xl text-center">
          <h2 className="text-2xl font-semibold mb-4">
            AI-Powered Service Ready
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            This ${serviceName} service is part of the Codai ecosystem and ready for AI agent enhancement.
          </p>
        </div>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <h2 className="mb-3 text-2xl font-semibold">
            Development{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Ready for AI-powered development and enhancement.
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <h2 className="mb-3 text-2xl font-semibold">
            Integration{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Connected to the Codai ecosystem for seamless integration.
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <h2 className="mb-3 text-2xl font-semibold">
            AI Ready{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Built for AI agent integration and intelligent automation.
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <h2 className="mb-3 text-2xl font-semibold">
            Scalable{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Enterprise-ready architecture for growth and scale.
          </p>
        </div>
      </div>
    </main>
  )
}
`;

  fs.writeFileSync(path.join(appDir, 'page.tsx'), page);
}

function createAdditionalFiles(serviceDir) {
  // Create .gitignore
  const gitignore = `# Dependencies
node_modules/
.pnpm-debug.log*

# Next.js
.next/
out/

# Production
build/
dist/

# Environment variables
.env*.local
.env

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage
coverage/
.nyc_output/

# TypeScript
*.tsbuildinfo
next-env.d.ts

# Testing
.vitest/
`;

  fs.writeFileSync(path.join(serviceDir, '.gitignore'), gitignore);

  // Create .env.example
  const envExample = `# Development
NODE_ENV=development
PORT=3000

# API Configuration
API_URL=http://localhost:3000/api

# Database (if needed)
# DATABASE_URL=

# Authentication (if needed)
# AUTH_SECRET=
# AUTH_URL=

# External Services (if needed)
# EXTERNAL_API_KEY=
`;

  fs.writeFileSync(path.join(serviceDir, '.env.example'), envExample);
}

function scaffoldEmptyRepository(serviceName) {
  const servicePath = path.join(SERVICES_DIR, serviceName);
  
  if (!fs.existsSync(servicePath)) {
    console.log(`⚠️  Service directory not found: ${servicePath}`);
    return false;
  }

  console.log(`\n🏗️  Scaffolding ${serviceName}...`);

  try {
    // Check if directory is actually empty
    const files = fs.readdirSync(servicePath).filter(f => f !== '.git');
    if (files.length > 0) {
      console.log(`✅ ${serviceName}: Already has content, skipping scaffolding`);
      return true;
    }

    // Create all necessary files
    createPackageJson(serviceName, servicePath);
    createReadme(serviceName, servicePath);
    createAgentConfig(serviceName, servicePath);
    createNextConfig(servicePath);
    createTsConfig(servicePath);
    createTailwindConfig(servicePath);
    createPostcssConfig(servicePath);
    createBasicAppStructure(serviceName, servicePath);
    createAdditionalFiles(servicePath);

    console.log(`✅ ${serviceName}: Successfully scaffolded with Next.js 14 + TypeScript!`);
    return true;

  } catch (error) {
    console.error(`❌ ${serviceName}: Failed to scaffold`);
    console.error(error.message);
    return false;
  }
}

async function main() {
  console.log('🏗️  SCAFFOLDING EMPTY REPOSITORIES');
  console.log('==================================');
  console.log(`Empty repositories to scaffold: ${EMPTY_REPOSITORIES.length}`);
  console.log(`Repositories: ${EMPTY_REPOSITORIES.join(', ')}\n`);

  const results = [];

  for (const service of EMPTY_REPOSITORIES) {
    const success = scaffoldEmptyRepository(service);
    results.push({ service, success });
  }

  console.log('\n📊 SCAFFOLDING RESULTS:');
  console.log('=======================');

  let successCount = 0;
  for (const { service, success } of results) {
    const status = success ? '✅ SUCCESS' : '❌ FAILED';
    console.log(`${service.padEnd(12)} ${status}`);
    if (success) successCount++;
  }

  console.log(`\n🎉 COMPLETED: ${successCount}/${results.length} repositories scaffolded successfully!`);

  if (successCount === results.length) {
    console.log('\n🚀 ALL EMPTY REPOSITORIES NOW HAVE SCAFFOLDING!');
    console.log('✨ Each repository has Next.js 14 + TypeScript foundation');
    console.log('🔗 All repositories are ready for AI agent development');
    console.log('👥 Ready for individual service development');
    
    console.log('\n📋 NEXT ACTIONS:');
    console.log('1. Push scaffolding to GitHub: npm run push-all-repos');
    console.log('2. Verify all repositories: npm run verify-all-repos');
    console.log('3. Install dependencies: pnpm install');
    console.log('4. Start development: npm run dev');
  } else {
    console.log('\n⚠️  Some repositories failed to scaffold. Check the errors above.');
  }
}

main().catch(console.error);
