#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// List of all apps
const apps = [
    'acasai', 'admin', 'aide', 'ajutai', 'analizai', 'bancai', 'conversai',
    'cumparai', 'curtai', 'dash', 'dexai', 'docs', 'donai', 'explorer',
    'fabricai', 'glass', 'hub', 'id', 'jucai', 'kodex', 'legalizai',
    'logai', 'marketai', 'memorai', 'metu', 'mobile', 'mod', 'muzicai',
    'prezentai', 'publicai', 'romai', 'sociai', 'stocai', 'studiai',
    'sunai', 'talentai', 'tools', 'wallet', 'x'
];

// Brand colors for each app
const brandColors = {
    acasai: { primary: '#10b981', secondary: '#059669', accent: '#34d399' },
    admin: { primary: '#8b5cf6', secondary: '#7c3aed', accent: '#a78bfa' },
    aide: { primary: '#06b6d4', secondary: '#0891b2', accent: '#67e8f9' },
    ajutai: { primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24' },
    analizai: { primary: '#ef4444', secondary: '#dc2626', accent: '#f87171' },
    bancai: { primary: '#3b82f6', secondary: '#2563eb', accent: '#60a5fa' },
    conversai: { primary: '#22c55e', secondary: '#16a34a', accent: '#4ade80' },
    cumparai: { primary: '#ec4899', secondary: '#db2777', accent: '#f472b6' },
    curtai: { primary: '#8b5cf6', secondary: '#7c3aed', accent: '#a78bfa' },
    dash: { primary: '#6366f1', secondary: '#4f46e5', accent: '#818cf8' },
    dexai: { primary: '#06b6d4', secondary: '#0891b2', accent: '#67e8f9' },
    docs: { primary: '#64748b', secondary: '#475569', accent: '#94a3b8' },
    donai: { primary: '#22c55e', secondary: '#16a34a', accent: '#4ade80' },
    explorer: { primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24' },
    fabricai: { primary: '#ec4899', secondary: '#db2777', accent: '#f472b6' },
    glass: { primary: '#06b6d4', secondary: '#0891b2', accent: '#67e8f9' },
    hub: { primary: '#8b5cf6', secondary: '#7c3aed', accent: '#a78bfa' },
    id: { primary: '#ef4444', secondary: '#dc2626', accent: '#f87171' },
    jucai: { primary: '#10b981', secondary: '#059669', accent: '#34d399' },
    kodex: { primary: '#64748b', secondary: '#475569', accent: '#94a3b8' },
    legalizai: { primary: '#3b82f6', secondary: '#2563eb', accent: '#60a5fa' },
    logai: { primary: '#6366f1', secondary: '#4f46e5', accent: '#818cf8' },
    marketai: { primary: '#22c55e', secondary: '#16a34a', accent: '#4ade80' },
    memorai: { primary: '#8b5cf6', secondary: '#7c3aed', accent: '#a78bfa' },
    metu: { primary: '#ef4444', secondary: '#dc2626', accent: '#f87171' },
    mobile: { primary: '#06b6d4', secondary: '#0891b2', accent: '#67e8f9' },
    mod: { primary: '#64748b', secondary: '#475569', accent: '#94a3b8' },
    muzicai: { primary: '#ec4899', secondary: '#db2777', accent: '#f472b6' },
    prezentai: { primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24' },
    publicai: { primary: '#10b981', secondary: '#059669', accent: '#34d399' },
    romai: { primary: '#ef4444', secondary: '#dc2626', accent: '#f87171' },
    sociai: { primary: '#3b82f6', secondary: '#2563eb', accent: '#60a5fa' },
    stocai: { primary: '#22c55e', secondary: '#16a34a', accent: '#4ade80' },
    studiai: { primary: '#8b5cf6', secondary: '#7c3aed', accent: '#a78bfa' },
    sunai: { primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24' },
    talentai: { primary: '#6366f1', secondary: '#4f46e5', accent: '#818cf8' },
    tools: { primary: '#64748b', secondary: '#475569', accent: '#94a3b8' },
    wallet: { primary: '#10b981', secondary: '#059669', accent: '#34d399' },
    x: { primary: '#ef4444', secondary: '#dc2626', accent: '#f87171' }
};

// globals.css template
const globalsCssTemplate = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --brand-primary: {{PRIMARY_COLOR}};
  --brand-secondary: {{SECONDARY_COLOR}};
  --brand-accent: {{ACCENT_COLOR}};
  
  --foreground-rgb: 255, 255, 255;
  --background-start-rgb: 15, 23, 42;
  --background-end-rgb: 30, 41, 59;
}

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
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

a {
  color: inherit;
  text-decoration: none;
}

/* Glassmorphism utilities */
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}

.glass-button {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.glass-button:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

/* Brand-specific classes */
.brand-{{APP_NAME}} {
  --tw-bg-opacity: 1;
  background-color: var(--brand-primary);
}

.brand-{{APP_NAME}}-secondary {
  --tw-bg-opacity: 1;
  background-color: var(--brand-secondary);
}

.brand-{{APP_NAME}}-accent {
  --tw-bg-opacity: 1;
  background-color: var(--brand-accent);
}

.text-brand-{{APP_NAME}} {
  --tw-text-opacity: 1;
  color: var(--brand-primary);
}

.border-brand-{{APP_NAME}} {
  --tw-border-opacity: 1;
  border-color: var(--brand-primary);
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(30, 41, 59, 0.5);
}

::-webkit-scrollbar-thumb {
  background: var(--brand-primary);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--brand-secondary);
}

/* Animation utilities */
@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.shimmer {
  animation: shimmer 2s infinite;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  background-size: 200px 100%;
}

.gradient-animation {
  background: linear-gradient(-45deg, var(--brand-primary), var(--brand-secondary), var(--brand-accent), var(--brand-primary));
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}`;

// Tailwind config template
const tailwindConfigTemplate = `import type { Config } from 'tailwindcss'
import { createCodaiTailwindConfig } from '../../packages/shared-ui/tailwind-master.config'

const config: Config = createCodaiTailwindConfig('{{APP_NAME}}', {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/shared-ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '{{PRIMARY_COLOR}}',
          secondary: '{{SECONDARY_COLOR}}',
          accent: '{{ACCENT_COLOR}}',
        },
      },
    },
  },
})

export default config`;

// Next.js config template
const nextConfigTemplate = `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig`;

// Package.json template for dependencies
const packageJsonUpdates = {
    dependencies: {
        "next": "15.4.1",
        "react": "19.1.0",
        "react-dom": "19.1.0",
        "typescript": "5.8.3",
        "framer-motion": "^11.15.0",
        "lucide-react": "^0.468.0",
        "geist": "^1.3.1"
    },
    devDependencies: {
        "@types/node": "^22.0.0",
        "@types/react": "^19.0.0",
        "@types/react-dom": "^19.0.0",
        "tailwindcss": "^3.4.17",
        "autoprefixer": "^10.4.20",
        "postcss": "^8.4.49",
        "eslint": "^9.15.0",
        "eslint-config-next": "15.4.1"
    }
};

// Function to setup app configuration
function setupAppConfig(appName) {
    const appDir = path.join(__dirname, '..', 'apps', appName);

    if (!fs.existsSync(appDir)) {
        console.log(`⚠️  App directory ${appName} does not exist, skipping...`);
        return;
    }

    console.log(`🔧 Setting up configuration for ${appName}...`);

    const colors = brandColors[appName];

    // Create globals.css
    const globalsCss = globalsCssTemplate
        .replace(/\{\{APP_NAME\}\}/g, appName)
        .replace(/\{\{PRIMARY_COLOR\}\}/g, colors.primary)
        .replace(/\{\{SECONDARY_COLOR\}\}/g, colors.secondary)
        .replace(/\{\{ACCENT_COLOR\}\}/g, colors.accent);

    fs.writeFileSync(path.join(appDir, 'app', 'globals.css'), globalsCss);

    // Create tailwind.config.ts
    const tailwindConfig = tailwindConfigTemplate
        .replace(/\{\{APP_NAME\}\}/g, appName)
        .replace(/\{\{PRIMARY_COLOR\}\}/g, colors.primary)
        .replace(/\{\{SECONDARY_COLOR\}\}/g, colors.secondary)
        .replace(/\{\{ACCENT_COLOR\}\}/g, colors.accent);

    fs.writeFileSync(path.join(appDir, 'tailwind.config.ts'), tailwindConfig);

    // Create next.config.js
    fs.writeFileSync(path.join(appDir, 'next.config.js'), nextConfigTemplate);

    // Create postcss.config.js
    const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;
    fs.writeFileSync(path.join(appDir, 'postcss.config.js'), postcssConfig);

    // Update package.json if it exists
    const packageJsonPath = path.join(appDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
        try {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

            // Merge dependencies
            packageJson.dependencies = {
                ...packageJson.dependencies,
                ...packageJsonUpdates.dependencies
            };

            packageJson.devDependencies = {
                ...packageJson.devDependencies,
                ...packageJsonUpdates.devDependencies
            };

            // Add scripts if they don't exist
            if (!packageJson.scripts) {
                packageJson.scripts = {};
            }

            packageJson.scripts = {
                ...packageJson.scripts,
                "dev": "next dev",
                "build": "next build",
                "start": "next start",
                "lint": "next lint"
            };

            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        } catch (error) {
            console.log(`⚠️  Error updating package.json for ${appName}:`, error.message);
        }
    }

    console.log(`✅ Completed configuration for ${appName}`);
}

// Main execution
console.log('🚀 Starting configuration setup for all apps...\n');

apps.forEach(appName => {
    setupAppConfig(appName);
});

console.log(`\n✨ Configuration setup completed for ${apps.length} apps!`);
console.log('\nNext steps:');
console.log('1. Run pnpm install in each app directory');
console.log('2. Test each app individually');
console.log('3. Verify Tailwind CSS is working');
console.log('4. Test authentication flow');
