#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const servicesDir = 'services';

const serviceConfigs = {
  logai: {
    name: 'LogAI',
    description: 'Identity & Authentication Hub for the Codai Ecosystem',
    domain: 'logai.ro',
    priority: 1,
    port: 3002,
    type: 'identity-auth'
  },
  bancai: {
    name: 'BancAI',
    description: 'AI-Powered Financial Platform for Modern Banking',
    domain: 'bancai.ro',
    priority: 2,
    port: 3003,
    type: 'fintech'
  },
  wallet: {
    name: 'Wallet',
    description: 'Programmable Wallet for BancAI Financial Services',
    domain: 'wallet.bancai.ro',
    priority: 2,
    port: 3004,
    type: 'fintech-wallet'
  },
  fabricai: {
    name: 'FabricAI',
    description: 'AI Services Platform and Orchestration Layer',
    domain: 'fabricai.ro',
    priority: 2,
    port: 3005,
    type: 'ai-services'
  },
  sociai: {
    name: 'SociAI',
    description: 'AI-Native Social Platform for Community Building',
    domain: 'sociai.ro',
    priority: 3,
    port: 3006,
    type: 'social'
  },
  cumparai: {
    name: 'CumparAI',
    description: 'AI-Powered Shopping and Marketplace Platform',
    domain: 'cumparai.ro',
    priority: 3,
    port: 3007,
    type: 'ecommerce'
  },
  x: {
    name: 'X',
    description: 'AI Trading Platform for Advanced Financial Operations',
    domain: 'x.codai.ro',
    priority: 4,
    port: 3008,
    type: 'trading'
  }
};

function createPackageJson(serviceName, config) {
  return {
    name: `@codai/${serviceName}`,
    version: '0.1.0',
    description: config.description,
    private: true,
    type: 'module',
    scripts: {
      dev: 'next dev -p ' + config.port,
      build: 'next build',
      start: 'next start -p ' + config.port,
      lint: 'next lint',
      test: 'vitest',
      'test:ui': 'vitest --ui',
      'type-check': 'tsc --noEmit'
    },
    dependencies: {
      'next': '^14.0.0',
      'react': '^18.0.0',
      'react-dom': '^18.0.0',
      '@types/node': '^20.0.0',
      '@types/react': '^18.0.0',
      '@types/react-dom': '^18.0.0',
      'typescript': '^5.0.0',
      'tailwindcss': '^3.4.0',
      'autoprefixer': '^10.4.0',
      'postcss': '^8.4.0'
    },
    devDependencies: {
      'eslint': '^8.0.0',
      'eslint-config-next': '^14.0.0',
      'vitest': '^1.0.0',
      '@vitejs/plugin-react': '^4.0.0'
    },
    engines: {
      node: '>=18.0.0',
      pnpm: '>=8.0.0'
    }
  };
}

function createAgentProjectJson(serviceName, config) {
  return {
    name: config.name,
    description: config.description,
    version: '0.1.0',
    type: 'service',
    priority: config.priority,
    domain: config.domain,
    serviceType: config.type,
    port: config.port,
    framework: 'next.js',
    language: 'typescript',
    aiCapabilities: {
      memory: true,
      reasoning: true,
      planning: true,
      codeGeneration: true
    },
    dependencies: [],
    relatedServices: [],
    developmentStatus: 'scaffolding',
    lastUpdated: new Date().toISOString(),
    owner: 'codai-ecosystem',
    repository: `https://github.com/codai-ecosystem/${serviceName}`,
    documentation: `docs/${serviceName}/README.md`
  };
}

function createReadme(serviceName, config) {
  return `# ${config.name}

${config.description}

## 🚀 Quick Start

\`\`\`bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Visit http://localhost:${config.port}
\`\`\`

## 📁 Project Structure

\`\`\`
${serviceName}/
├── app/                 # Next.js App Router
├── components/         # React components
├── lib/               # Utility functions
├── public/            # Static assets
├── styles/            # CSS styles
└── types/             # TypeScript definitions
\`\`\`

## 🛠️ Development

This is a Next.js 14 application using:

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Testing**: Vitest
- **Package Manager**: PNPM

## 🌐 Domain

- **Production**: https://${config.domain}
- **Development**: http://localhost:${config.port}

## 🏗️ Architecture

Part of the Codai Ecosystem - ${config.description}

Priority Level: **${config.priority}** (${config.priority === 1 ? 'Critical' : config.priority === 2 ? 'High' : config.priority === 3 ? 'Medium' : 'Low'})

## 📝 Status

🚧 **Under Development** - Service scaffolding complete, ready for implementation.

## 🤝 Contributing

This service is part of the Codai Ecosystem monorepo. Please refer to the main project documentation for contribution guidelines.

## 📄 License

Private - Codai Ecosystem
`;
}

function createNextConfig(serviceName) {
  return `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Enable React Server Components
    serverComponentsExternalPackages: [],
  },
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Redirect configuration
  async redirects() {
    return [];
  },
  // Rewrite configuration
  async rewrites() {
    return [];
  },
};

export default nextConfig;
`;
}

function createTailwindConfig() {
  return `import type { Config } from 'tailwindcss';

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
};

export default config;
`;
}

function createTsConfig() {
  return `{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
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
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
`;
}

function createAppLayout() {
  return `import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Codai Service',
  description: 'AI-powered service in the Codai ecosystem',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
`;
}

function createAppPage(serviceName, config) {
  return `export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-4xl font-bold text-center">
            Welcome to ${config.name}
          </h1>
          <p className="text-xl text-center text-gray-600 max-w-2xl">
            ${config.description}
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <p className="text-blue-800 text-center">
              🚧 Service is under development
            </p>
            <p className="text-blue-600 text-sm text-center mt-2">
              Domain: <strong>${config.domain}</strong> | Priority: <strong>${config.priority}</strong>
            </p>
          </div>
        </div>
        
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            href="#"
          >
            Get Started
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            href="#"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
`;
}

function createGlobalsCss() {
  return `@tailwind base;
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

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
`;
}

function createPostcssConfig() {
  return `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;
}

function createEslintConfig() {
  return `{
  "extends": ["next/core-web-vitals"]
}
`;
}

function createVitestConfig() {
  return `import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
  },
});
`;
}

function createGitignore() {
  return `# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# IDEs
.vscode/
.idea/

# OS
Thumbs.db
`;
}

async function scaffoldService(serviceName, config) {
  const servicePath = path.join(servicesDir, serviceName);
  
  // Check if service directory exists and is empty
  if (!fs.existsSync(servicePath)) {
    console.log(`❌ Service directory ${serviceName} does not exist`);
    return;
  }
  
  const files = fs.readdirSync(servicePath);
  if (files.length > 0) {
    console.log(`ℹ️  Service ${serviceName} already has content (${files.length} files), skipping scaffold`);
    return;
  }
  
  console.log(`🚀 Scaffolding ${serviceName}...`);
  
  // Create directory structure
  const dirs = ['app', 'components', 'lib', 'public', 'styles', 'types'];
  dirs.forEach(dir => {
    fs.mkdirSync(path.join(servicePath, dir), { recursive: true });
  });
  
  // Create files
  fs.writeFileSync(
    path.join(servicePath, 'package.json'),
    JSON.stringify(createPackageJson(serviceName, config), null, 2)
  );
  
  fs.writeFileSync(
    path.join(servicePath, 'agent.project.json'),
    JSON.stringify(createAgentProjectJson(serviceName, config), null, 2)
  );
  
  fs.writeFileSync(
    path.join(servicePath, 'README.md'),
    createReadme(serviceName, config)
  );
  
  fs.writeFileSync(
    path.join(servicePath, 'next.config.js'),
    createNextConfig(serviceName)
  );
  
  fs.writeFileSync(
    path.join(servicePath, 'tailwind.config.ts'),
    createTailwindConfig()
  );
  
  fs.writeFileSync(
    path.join(servicePath, 'tsconfig.json'),
    createTsConfig()
  );
  
  fs.writeFileSync(
    path.join(servicePath, 'postcss.config.js'),
    createPostcssConfig()
  );
  
  fs.writeFileSync(
    path.join(servicePath, '.eslintrc.json'),
    createEslintConfig()
  );
  
  fs.writeFileSync(
    path.join(servicePath, 'vitest.config.ts'),
    createVitestConfig()
  );
  
  fs.writeFileSync(
    path.join(servicePath, '.gitignore'),
    createGitignore()
  );
  
  // Create app structure
  fs.writeFileSync(
    path.join(servicePath, 'app', 'layout.tsx'),
    createAppLayout()
  );
  
  fs.writeFileSync(
    path.join(servicePath, 'app', 'page.tsx'),
    createAppPage(serviceName, config)
  );
  
  fs.writeFileSync(
    path.join(servicePath, 'app', 'globals.css'),
    createGlobalsCss()
  );
  
  // Create a basic component
  fs.writeFileSync(
    path.join(servicePath, 'components', 'README.md'),
    `# Components\n\nReact components for ${config.name} service.\n`
  );
  
  // Create lib structure
  fs.writeFileSync(
    path.join(servicePath, 'lib', 'utils.ts'),
    `export function cn(...classes: string[]) {\n  return classes.filter(Boolean).join(' ');\n}\n`
  );
  
  // Create types
  fs.writeFileSync(
    path.join(servicePath, 'types', 'index.ts'),
    `// Type definitions for ${config.name}\n\nexport interface ServiceConfig {\n  name: string;\n  version: string;\n  domain: string;\n}\n`
  );
  
  console.log(`✅ Successfully scaffolded ${serviceName}!`);
}

// Main execution
console.log('🏗️  CODAI ECOSYSTEM SERVICE SCAFFOLDING');
console.log('========================================');

for (const [serviceName, config] of Object.entries(serviceConfigs)) {
  await scaffoldService(serviceName, config);
}

console.log('\n🎉 Service scaffolding complete!');
console.log('\nNext steps:');
console.log('1. Install dependencies: pnpm install');
console.log('2. Start development: pnpm dev');
console.log('3. Begin individual service development');
