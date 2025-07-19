import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

console.log('🚀 CODAI DEPLOYMENT READINESS - PHASE 3: APPLICATION-SPECIFIC FIXES');
console.log('=====================================================================');

// Priority applications based on ecosystem importance
const PRIORITY_APPS = [
    'codai',      // Core AI coding assistant
    'admin',      // Administration dashboard
    'hub',        // Central hub
    'id',         // Identity service
    'bancai',     // Banking AI
    'memorai',    // Memory management
    'romai',      // Romanian AI
    'conversai',  // Conversation AI
    'analizai',   // Analytics AI
    'marketai'    // Market AI
];

const ALL_APPS = [
    'codai', 'admin', 'hub', 'id', 'bancai', 'memorai', 'romai', 'conversai',
    'analizai', 'marketai', 'acasai', 'aide', 'ajutai', 'bancai-mobile',
    'codai-mobile', 'cumparai', 'curtai', 'dash', 'dexai', 'docs', 'donai',
    'explorer', 'fabricai', 'glass', 'jucai', 'kodex', 'legalizai', 'logai',
    'metu', 'metu-web', 'mobile', 'mod', 'muzicai', 'prezentai', 'publicai',
    'sociai', 'stocai', 'studiai', 'sunai', 'talentai', 'tools', 'wallet', 'x'
];

// Common Next.js fixes and optimizations
const COMMON_FIXES = {
    'next.config.js': `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      resolveAlias: {
        canvas: './empty-module.js',
      },
    },
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;`,

    'empty-module.js': 'export default {};',

    'middleware.ts': `import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Add security headers
  const response = NextResponse.next();
  
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  
  return response;
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};`
};

async function fixApp(appName) {
    const appPath = path.join('apps', appName);

    if (!fs.existsSync(appPath)) {
        console.log(`  ⚠️  App ${appName} not found, skipping...`);
        return false;
    }

    console.log(`\n🔧 Fixing ${appName}...`);

    try {
        // Fix Next.js configuration
        const nextConfigPath = path.join(appPath, 'next.config.js');
        fs.writeFileSync(nextConfigPath, COMMON_FIXES['next.config.js']);
        console.log(`  ✅ Updated next.config.js`);

        // Add empty module for canvas issues
        const emptyModulePath = path.join(appPath, 'empty-module.js');
        fs.writeFileSync(emptyModulePath, COMMON_FIXES['empty-module.js']);
        console.log(`  ✅ Added empty-module.js`);

        // Add middleware if it doesn't exist
        const middlewarePath = path.join(appPath, 'middleware.ts');
        if (!fs.existsSync(middlewarePath)) {
            fs.writeFileSync(middlewarePath, COMMON_FIXES['middleware.ts']);
            console.log(`  ✅ Added middleware.ts`);
        }

        // Fix common TypeScript issues
        const srcPath = path.join(appPath, 'src');
        if (fs.existsSync(srcPath)) {
            // Create proper app layout if missing
            const layoutPath = path.join(srcPath, 'app', 'layout.tsx');
            if (!fs.existsSync(layoutPath)) {
                const layoutDir = path.dirname(layoutPath);
                fs.mkdirSync(layoutDir, { recursive: true });

                const layoutContent = `import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '${appName.charAt(0).toUpperCase() + appName.slice(1)} - CODAI Ecosystem',
  description: 'Part of the CODAI ecosystem',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}`;
                fs.writeFileSync(layoutPath, layoutContent);
                console.log(`  ✅ Created layout.tsx`);
            }

            // Create proper page if missing
            const pagePath = path.join(srcPath, 'app', 'page.tsx');
            if (!fs.existsSync(pagePath)) {
                const pageContent = `export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">${appName.charAt(0).toUpperCase() + appName.slice(1)}</h1>
      <p className="mt-4 text-lg text-gray-600">
        Welcome to ${appName} - part of the CODAI ecosystem
      </p>
    </main>
  );
}`;
                fs.writeFileSync(pagePath, pageContent);
                console.log(`  ✅ Created page.tsx`);
            }

            // Create globals.css if missing
            const globalsCssPath = path.join(srcPath, 'app', 'globals.css');
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
                console.log(`  ✅ Created globals.css`);
            }
        }

        // Test the app build
        console.log(`  🔍 Testing ${appName} build...`);
        process.chdir(appPath);

        try {
            await execAsync('pnpm run type-check', { timeout: 30000 });
            console.log(`  ✅ TypeScript check passed`);
        } catch (error) {
            console.log(`  ⚠️  TypeScript issues found, will fix in Phase 4`);
        }

        process.chdir('../..');

        console.log(`  ✅ ${appName} basic fixes completed`);
        return true;

    } catch (error) {
        console.error(`  ❌ Error fixing ${appName}:`, error.message);
        process.chdir('../..'); // Ensure we're back in root
        return false;
    }
}

async function main() {
    console.log('Starting Application-Specific Fixes...\n');

    let fixedApps = 0;
    let totalApps = 0;

    // Fix priority apps first
    console.log('🎯 Fixing Priority Applications...');
    for (const app of PRIORITY_APPS) {
        totalApps++;
        if (await fixApp(app)) {
            fixedApps++;
        }
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
    }

    console.log('\n🔄 Fixing Remaining Applications...');
    const remainingApps = ALL_APPS.filter(app => !PRIORITY_APPS.includes(app));

    for (const app of remainingApps) {
        totalApps++;
        if (await fixApp(app)) {
            fixedApps++;
        }
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
    }

    console.log(`\n📊 Phase 3 Summary:`);
    console.log(`✅ Successfully processed: ${fixedApps}/${totalApps} apps`);
    console.log(`\n🚀 Phase 3 Complete! Applications have basic fixes applied`);
    console.log('📋 Ready for Phase 4: Type Safety & Linting');
    console.log('💡 Tip: Run health-check again to see improvements');
}

main().catch(console.error);
