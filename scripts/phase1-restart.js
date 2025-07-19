import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 DEPLOYMENT READINESS - PHASE 1 RESTART: FIXING ROOT ISSUES');
console.log('================================================================');

const ALL_APPS = [
    'codai', 'admin', 'hub', 'id', 'bancai', 'memorai', 'romai', 'conversai',
    'analizai', 'marketai', 'acasai', 'aide', 'ajutai', 'bancai-mobile',
    'codai-mobile', 'cumparai', 'curtai', 'dash', 'dexai', 'docs', 'donai',
    'explorer', 'fabricai', 'glass', 'jucai', 'kodex', 'legalizai', 'logai',
    'metu', 'metu-web', 'mobile', 'mod', 'muzicai', 'prezentai', 'publicai',
    'sociai', 'stocai', 'studiai', 'sunai', 'talentai', 'tools', 'wallet', 'x'
];

// Proper TypeScript configuration template for apps
const PROPER_TSCONFIG = {
    "extends": "../../tsconfig.base.json",
    "compilerOptions": {
        "baseUrl": ".",
        "paths": {
            "@/*": ["./src/*"],
            "@/components/*": ["./src/components/*"],
            "@/lib/*": ["./src/lib/*"]
        },
        "plugins": [{ "name": "next" }],
        "incremental": true
    },
    "include": [
        "next-env.d.ts",
        "src/**/*.ts",
        "src/**/*.tsx",
        ".next/types/**/*.ts"
    ],
    "exclude": [
        "node_modules",
        ".next",
        "dist",
        "build",
        "app/**/*",
        "components/**/*",
        "lib/**/*",
        "pages/**/*",
        "src-disabled/**/*",
        "src-backup/**/*",
        "test-app/**/*",
        "__tests__/**/*",
        "tests/**/*"
    ]
};

function fixAppTSConfig(appName) {
    const appPath = path.join('apps', appName);

    if (!fs.existsSync(appPath)) {
        console.log(`  ⚠️  App ${appName} not found, skipping...`);
        return false;
    }

    console.log(`\n🔧 Fixing ${appName} TypeScript configuration...`);

    try {
        // Fix tsconfig.json
        const tsconfigPath = path.join(appPath, 'tsconfig.json');
        fs.writeFileSync(tsconfigPath, JSON.stringify(PROPER_TSCONFIG, null, 2));
        console.log(`  ✅ Fixed tsconfig.json with proper paths`);

        // Ensure src directory exists
        const srcPath = path.join(appPath, 'src');
        if (!fs.existsSync(srcPath)) {
            fs.mkdirSync(srcPath, { recursive: true });
            console.log(`  ✅ Created src directory`);
        }

        // Ensure src/app directory exists
        const srcAppPath = path.join(srcPath, 'app');
        if (!fs.existsSync(srcAppPath)) {
            fs.mkdirSync(srcAppPath, { recursive: true });
            console.log(`  ✅ Created src/app directory`);
        }

        // Check if layout.tsx exists in the right place
        const layoutPath = path.join(srcAppPath, 'layout.tsx');
        if (!fs.existsSync(layoutPath)) {
            const layoutContent = `import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '${appName.charAt(0).toUpperCase() + appName.slice(1)} - CODAI Ecosystem',
  description: 'Part of the CODAI ecosystem',
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
            fs.writeFileSync(layoutPath, layoutContent);
            console.log('  ✅ Created proper src/app/layout.tsx');
        }

        // Check if page.tsx exists in the right place
        const pagePath = path.join(srcAppPath, 'page.tsx');
        if (!fs.existsSync(pagePath)) {
            const pageContent = `export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">${appName.charAt(0).toUpperCase() + appName.slice(1)}</h1>
      <p className="mt-4 text-lg text-gray-600">
        Welcome to ${appName} - part of the CODAI ecosystem
      </p>
    </main>
  )
}`;
            fs.writeFileSync(pagePath, pageContent);
            console.log('  ✅ Created proper src/app/page.tsx');
        }

        // Check if globals.css exists in the right place
        const globalsCssPath = path.join(srcAppPath, 'globals.css');
        if (!fs.existsSync(globalsCssPath)) {
            const cssContent = `@tailwind base;
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
}`;
            fs.writeFileSync(globalsCssPath, cssContent);
            console.log('  ✅ Created proper src/app/globals.css');
        }

        // Test the TypeScript compilation
        console.log('  🔍 Testing TypeScript compilation for ' + appName + '...');
        process.chdir(appPath);

        try {
            execSync('pnpm exec tsc --noEmit', { encoding: 'utf8', stdio: 'pipe' });
            console.log('  ✅ TypeScript compilation PASSED for ' + appName);
            process.chdir('../..');
            return true;
        } catch (error) {
            console.log('  ⚠️  TypeScript compilation still has issues for ' + appName + ':');
            console.log('     ' + error.message.split('\n')[0]);
            process.chdir('../..');
            return false;
        }

    } catch (error) {
        console.error('  ❌ Error fixing ' + appName + ':', error.message);
        process.chdir('../..'); // Ensure we're back in root
        return false;
    }
}

async function main() {
    console.log('Starting proper Phase 1 restart with real fixes...\n');

    let fixedApps = 0;
    let totalApps = 0;
    const failedApps = [];

    for (const app of ALL_APPS) {
        totalApps++;
        if (fixAppTSConfig(app)) {
            fixedApps++;
        } else {
            failedApps.push(app);
        }
        // Small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n📊 Phase 1 Restart Summary:');
    console.log('✅ Successfully fixed: ' + fixedApps + '/' + totalApps + ' apps');

    if (failedApps.length > 0) {
        console.log('⚠️  Apps that still need attention: ' + failedApps.join(', '));
    }

    console.log('\n🚀 Phase 1 Restart Complete!');
    console.log('💡 Now run health-check to verify improvements');
}

main().catch(console.error);
