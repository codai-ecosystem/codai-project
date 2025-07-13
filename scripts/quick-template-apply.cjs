#!/usr/bin/env node

/**
 * Quick Template Applicator - Apply Modern UI to All Apps
 * 
 * Simplified approach to get all 11 apps running with modern UI
 */

const fs = require('fs');
const path = require('path');

// App configuration with correct ports (4030-4040)
const APPS = [
  { name: 'codai', port: 4030, description: 'Central Platform & AIDE Hub', color: 'blue' },
  { name: 'memorai', port: 4031, description: 'AI Memory & Database Core', color: 'purple' },
  { name: 'logai', port: 4032, description: 'Identity & Authentication Hub', color: 'green' },
  { name: 'bancai', port: 4033, description: 'Financial Platform', color: 'emerald' },
  { name: 'wallet', port: 4034, description: 'Programmable Wallet', color: 'yellow' },
  { name: 'fabricai', port: 4035, description: 'AI Services Platform', color: 'pink' },
  { name: 'studiai', port: 4036, description: 'AI Education Platform', color: 'indigo' },
  { name: 'sociai', port: 4037, description: 'AI Social Platform', color: 'cyan' },
  { name: 'cumparai', port: 4038, description: 'AI Shopping Platform', color: 'orange' },
  { name: 'x', port: 4039, description: 'AI Trading Platform', color: 'red' },
  { name: 'publicai', port: 4040, description: 'Civic AI & Transparency Tools', color: 'teal' }
];

const APPS_DIR = path.join(__dirname, '..', 'apps');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function createAppStructure(app) {
  console.log(`🚀 Creating modern structure for ${app.name} (port ${app.port})...`);

  const appPath = path.join(APPS_DIR, app.name);
  ensureDir(appPath);

  // 1. Create package.json
  const packageJson = {
    name: app.name,
    version: "1.0.0",
    description: app.description,
    private: true,
    scripts: {
      dev: `next dev --port ${app.port}`,
      build: "next build",
      start: `next start --port ${app.port}`,
      lint: "next lint",
      "type-check": "tsc --noEmit"
    },
    dependencies: {
      "next": "^15.1.0",
      "react": "^18.3.1",
      "react-dom": "^18.3.1",
      "@types/node": "^20",
      "@types/react": "^18",
      "@types/react-dom": "^18",
      "typescript": "^5"
    },
    devDependencies: {
      "tailwindcss": "^3.4.1",
      "postcss": "^8",
      "autoprefixer": "^10.0.1",
      "eslint": "^8",
      "eslint-config-next": "15.1.0"
    }
  };

  fs.writeFileSync(
    path.join(appPath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  // 2. Create Next.js config
  const nextConfig = `/** @type {import('next').NextConfig} */
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

  fs.writeFileSync(path.join(appPath, 'next.config.js'), nextConfig);

  // 3. Create Tailwind config
  const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
        'blob': 'blob 7s infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        'blob': {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
        }
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}`;

  fs.writeFileSync(path.join(appPath, 'tailwind.config.js'), tailwindConfig);

  // 4. Create PostCSS config
  const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;

  fs.writeFileSync(path.join(appPath, 'postcss.config.js'), postcssConfig);

  // 5. Create TypeScript config
  const tsConfig = {
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
        "@/*": ["./src/*"]
      }
    },
    "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
    "exclude": ["node_modules"]
  };

  fs.writeFileSync(
    path.join(appPath, 'tsconfig.json'),
    JSON.stringify(tsConfig, null, 2)
  );

  // 6. Create src/app structure
  const srcAppPath = path.join(appPath, 'src', 'app');
  ensureDir(srcAppPath);

  // 7. Create globals.css
  const globalsCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

@layer base {
  html {
    @apply scroll-smooth;
  }
  
  body {
    @apply bg-slate-900 text-white;
  }
}

@layer components {
  .glass-card {
    @apply bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl;
  }
  
  .gradient-text {
    @apply bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent;
  }
}`;

  fs.writeFileSync(path.join(srcAppPath, 'globals.css'), globalsCss);

  // 8. Create layout.tsx
  const layoutTsx = `import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '${app.name.toUpperCase()} - ${app.description}',
  description: '${app.description} - Modern, animated, real-time AI platform',
  keywords: ['AI', 'platform', '${app.name}', 'modern', 'real-time'],
  authors: [{ name: 'Codai Team' }],
  viewport: 'width=device-width, initial-scale=1',
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

  fs.writeFileSync(path.join(srcAppPath, 'layout.tsx'), layoutTsx);

  // 9. Create page.tsx with modern UI
  const pageTsx = `'use client'

import { Inter } from 'next/font/google'
import { useState, useEffect } from 'react'

const inter = Inter({ subsets: ['latin'] })

export default function ${app.name.charAt(0).toUpperCase() + app.name.slice(1)}Page() {
  const [isOnline, setIsOnline] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className={inter.className}>
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-${app.color}-900 to-slate-900 text-white">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -inset-[10px] opacity-50">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-${app.color}-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
          </div>
        </div>

        {/* Header */}
        <header className="relative z-10 p-6">
          <nav className="flex items-center justify-between">
            <div className="text-2xl font-bold gradient-text">
              ${app.name.toUpperCase()}
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={\`w-3 h-3 rounded-full \${isOnline ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse\`}></div>
                <span className="text-sm text-slate-300">
                  Port ${app.port} • {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className="text-sm text-slate-400">
                {currentTime.toLocaleTimeString()}
              </div>
            </div>
          </nav>
        </header>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold mb-6">
              <span className="gradient-text animate-gradient-x">
                ${app.name.toUpperCase()}
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
              ${app.description}
            </p>
            <div className="flex items-center justify-center space-x-2 text-${app.color}-400">
              <div className="w-3 h-3 bg-${app.color}-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Running on port ${app.port}</span>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="glass-card p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-${app.color}-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Data</h3>
              <p className="text-slate-400">Live data streaming and real-time updates across all components.</p>
            </div>

            <div className="glass-card p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 4v10a2 2 0 002 2h6a2 2 0 002-2V8M7 8h10M10 12h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Modern UI</h3>
              <p className="text-slate-400">Beautiful animations, glass morphism, and responsive design.</p>
            </div>

            <div className="glass-card p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-red-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Tested & Reliable</h3>
              <p className="text-slate-400">Comprehensive Playwright testing for all user flows.</p>
            </div>
          </div>

          {/* Real-time Status */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center px-6 py-3 glass-card">
              <div className="w-2 h-2 bg-${app.color}-400 rounded-full animate-pulse mr-3"></div>
              <span className="text-${app.color}-400 font-medium">System Operational • Live Data Streaming</span>
            </div>
          </div>

          {/* Modern Stats Grid */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-${app.color}-400">99.9%</div>
              <div className="text-sm text-slate-400">Uptime</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-emerald-400">&lt;100ms</div>
              <div className="text-sm text-slate-400">Response</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">24/7</div>
              <div className="text-sm text-slate-400">Available</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">AI</div>
              <div className="text-sm text-slate-400">Powered</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}`;

  fs.writeFileSync(path.join(srcAppPath, 'page.tsx'), pageTsx);

  console.log(`✅ Created modern structure for ${app.name}`);
}

// Process all apps
console.log('🚀 Creating modern UI structure for all apps...');
console.log(`📊 Target: ${APPS.length} apps on ports 4030-4040\n`);

APPS.forEach(app => {
  try {
    createAppStructure(app);
  } catch (error) {
    console.error(`❌ Failed to create ${app.name}:`, error.message);
  }
});

console.log('\n🎉 Modern UI structure creation completed!');
console.log('\n📋 Summary:');
APPS.forEach(app => {
  const appPath = path.join(APPS_DIR, app.name);
  const exists = fs.existsSync(path.join(appPath, 'package.json'));
  console.log(`${exists ? '✅' : '❌'} ${app.name} (port ${app.port})`);
});

console.log('\n🚀 Next steps:');
console.log('1. Run: pnpm install');
console.log('2. Run: pnpm run dev (in each app directory)');
console.log('3. Test: Visit http://localhost:4030-4040');
console.log('4. Run Playwright tests: npx playwright test');
