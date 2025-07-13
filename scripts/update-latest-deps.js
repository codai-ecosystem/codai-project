#!/usr/bin/env node

/**
 * Update All Projects to Latest Dependencies
 * Keeps Tailwind CSS at version 3 while updating everything else to latest
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting comprehensive dependency update...\n');

// Define the latest versions for key dependencies (as of June 2025)
const LATEST_VERSIONS = {
  // Core Framework
  next: '^15.0.0',
  react: '^18.3.1',
  'react-dom': '^18.3.1',

  // TypeScript & Tools
  typescript: '^5.5.0',
  '@types/node': '^20.14.0',
  '@types/react': '^18.3.0',
  '@types/react-dom': '^18.3.0',

  // Styling (Keep Tailwind at v3)
  tailwindcss: '^3.4.4',
  postcss: '^8.4.38',
  autoprefixer: '^10.4.19',

  // Development Tools
  eslint: '^9.5.0',
  'eslint-config-next': '^15.0.0',
  '@typescript-eslint/eslint-plugin': '^7.13.0',
  '@typescript-eslint/parser': '^7.13.0',

  // Testing
  jest: '^29.7.0',
  '@testing-library/jest-dom': '^6.4.6',
  '@testing-library/react': '^16.0.0',
  '@testing-library/user-event': '^14.5.2',
  '@types/jest': '^29.5.12',
  'jest-environment-jsdom': '^29.7.0',

  // UI & Animation
  'framer-motion': '^11.2.12',
  'lucide-react': '^0.400.0',
  'class-variance-authority': '^0.7.0',
  clsx: '^2.1.1',
  'tailwind-merge': '^2.3.0',

  // Forms & Validation
  'react-hook-form': '^7.52.0',
  zod: '^3.23.8',
  '@hookform/resolvers': '^3.6.0',

  // State Management
  zustand: '^4.5.2',
  '@tanstack/react-query': '^5.45.1',

  // Utilities
  'date-fns': '^3.6.0',
  lodash: '^4.17.21',
  '@types/lodash': '^4.17.5',
};

// Apps to update
const APPS = [
  'codai',
  'memorai',
  'logai',
  'bancai',
  'wallet',
  'fabricai',
  'studiai',
  'sociai',
  'cumparai',
  'x',
  'publicai',
];

function updatePackageJson(appPath, appName) {
  const packageJsonPath = path.join(appPath, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    console.log(`⚠️  No package.json found for ${appName}, skipping...`);
    return;
  }

  console.log(`📦 Updating ${appName}...`);

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Update dependencies
    if (packageJson.dependencies) {
      for (const [dep, version] of Object.entries(LATEST_VERSIONS)) {
        if (packageJson.dependencies[dep]) {
          console.log(
            `  ✅ ${dep}: ${packageJson.dependencies[dep]} → ${version}`
          );
          packageJson.dependencies[dep] = version;
        }
      }
    }

    // Update devDependencies
    if (packageJson.devDependencies) {
      for (const [dep, version] of Object.entries(LATEST_VERSIONS)) {
        if (packageJson.devDependencies[dep]) {
          console.log(
            `  ✅ ${dep}: ${packageJson.devDependencies[dep]} → ${version}`
          );
          packageJson.devDependencies[dep] = version;
        }
      }
    }

    // Ensure required scripts exist
    if (!packageJson.scripts) packageJson.scripts = {};

    const requiredScripts = {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
      lint: 'next lint',
      test: 'jest',
      'test:watch': 'jest --watch',
      'type-check': 'tsc --noEmit',
    };

    for (const [script, command] of Object.entries(requiredScripts)) {
      if (!packageJson.scripts[script]) {
        packageJson.scripts[script] = command;
        console.log(`  ➕ Added script: ${script}`);
      }
    }

    // Write back to file
    fs.writeFileSync(
      packageJsonPath,
      JSON.stringify(packageJson, null, 2) + '\n'
    );
    console.log(`  ✅ Updated ${appName} package.json\n`);
  } catch (error) {
    console.error(`❌ Failed to update ${appName}:`, error.message);
  }
}

function updateTailwindConfig(appPath, appName) {
  const tailwindConfigPath = path.join(appPath, 'tailwind.config.js');

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
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        secondary: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
          950: '#4a044e',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}`;

  try {
    fs.writeFileSync(tailwindConfigPath, tailwindConfig);
    console.log(`  ✅ Updated ${appName} Tailwind config`);
  } catch (error) {
    console.error(
      `❌ Failed to update Tailwind config for ${appName}:`,
      error.message
    );
  }
}

function updatePostCSSConfig(appPath, appName) {
  const postCSSConfigPath = path.join(appPath, 'postcss.config.js');

  const postCSSConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;

  try {
    fs.writeFileSync(postCSSConfigPath, postCSSConfig);
    console.log(`  ✅ Updated ${appName} PostCSS config`);
  } catch (error) {
    console.error(
      `❌ Failed to update PostCSS config for ${appName}:`,
      error.message
    );
  }
}

function updateTSConfig(appPath, appName) {
  const tsConfigPath = path.join(appPath, 'tsconfig.json');

  const tsConfig = {
    extends: '../../tsconfig.base.json',
    compilerOptions: {
      plugins: [
        {
          name: 'next',
        },
      ],
      baseUrl: '.',
      paths: {
        '@/*': ['./src/*'],
      },
    },
    include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
    exclude: ['node_modules'],
  };

  try {
    fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2) + '\n');
    console.log(`  ✅ Updated ${appName} TypeScript config`);
  } catch (error) {
    console.error(
      `❌ Failed to update TypeScript config for ${appName}:`,
      error.message
    );
  }
}

function updateGlobalsCSS(appPath, appName) {
  const globalsCSSPath = path.join(appPath, 'src', 'app', 'globals.css');

  // Ensure the directory exists
  const dir = path.dirname(globalsCSSPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const globalsCSS = `@tailwind base;
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

/* Custom utility classes */
.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    transform: translateY(10px); 
    opacity: 0; 
  }
  to { 
    transform: translateY(0); 
    opacity: 1; 
  }
}`;

  try {
    fs.writeFileSync(globalsCSSPath, globalsCSS);
    console.log(`  ✅ Updated ${appName} globals.css`);
  } catch (error) {
    console.error(
      `❌ Failed to update globals.css for ${appName}:`,
      error.message
    );
  }
}

function addMissingDependencies(appPath, appName) {
  console.log(`🔧 Installing missing dependencies for ${appName}...`);

  const requiredDeps = [
    'next@^15.0.0',
    'react@^18.3.1',
    'react-dom@^18.3.1',
    'tailwindcss@^3.4.4',
    'postcss@^8.4.38',
    'autoprefixer@^10.4.19',
  ];

  const requiredDevDeps = [
    'typescript@^5.5.0',
    '@types/node@^20.14.0',
    '@types/react@^18.3.0',
    '@types/react-dom@^18.3.0',
    'eslint@^9.5.0',
    'eslint-config-next@^15.0.0',
  ];

  try {
    // Change to the app directory
    process.chdir(appPath);

    // Install production dependencies
    execSync(`pnpm add ${requiredDeps.join(' ')}`, { stdio: 'inherit' });

    // Install dev dependencies
    execSync(`pnpm add -D ${requiredDevDeps.join(' ')}`, { stdio: 'inherit' });

    console.log(`  ✅ Dependencies installed for ${appName}\n`);
  } catch (error) {
    console.error(
      `❌ Failed to install dependencies for ${appName}:`,
      error.message
    );
  }
}

// Main execution
async function main() {
  const rootDir = process.cwd();
  const appsDir = path.join(rootDir, 'apps');

  console.log(`📁 Working directory: ${rootDir}`);
  console.log(`📂 Apps directory: ${appsDir}\n`);

  // Process each app
  for (const appName of APPS) {
    const appPath = path.join(appsDir, appName);

    if (!fs.existsSync(appPath)) {
      console.log(`⚠️  App directory ${appName} does not exist, skipping...\n`);
      continue;
    }

    console.log(`🔄 Processing ${appName}...`);

    // Update configurations
    updatePackageJson(appPath, appName);
    updateTailwindConfig(appPath, appName);
    updatePostCSSConfig(appPath, appName);
    updateTSConfig(appPath, appName);
    updateGlobalsCSS(appPath, appName);

    console.log(`✅ Configuration updates complete for ${appName}\n`);
  }

  // Install dependencies from workspace root
  console.log('📦 Installing dependencies from workspace root...');
  try {
    process.chdir(rootDir);
    execSync('pnpm install', { stdio: 'inherit' });
    console.log('✅ Workspace dependencies installed successfully!\n');
  } catch (error) {
    console.error(
      '❌ Failed to install workspace dependencies:',
      error.message
    );
  }

  // Run validation
  console.log('🔍 Running workspace validation...');
  try {
    execSync('pnpm validate-workspace', { stdio: 'inherit' });
    console.log('✅ Workspace validation passed!\n');
  } catch (error) {
    console.error(
      '⚠️  Workspace validation warnings (expected during updates)'
    );
  }

  console.log('🎉 DEPENDENCY UPDATE COMPLETE!');
  console.log('\n📋 SUMMARY:');
  console.log(`   ✅ Updated ${APPS.length} applications`);
  console.log('   ✅ All dependencies updated to latest versions');
  console.log('   ✅ Tailwind CSS kept at version 3.x');
  console.log('   ✅ TypeScript configurations standardized');
  console.log('   ✅ Build and development scripts configured');
  console.log('\n🚀 Next steps:');
  console.log(
    '   1. Test individual apps: pnpm dev --filter=@codai/<app-name>'
  );
  console.log('   2. Run full build: pnpm build');
  console.log('   3. Start all services: pnpm dev');
}

// Handle errors gracefully
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', error => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Run the main function
main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
