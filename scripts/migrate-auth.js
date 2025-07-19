#!/usr/bin/env node
/**
 * Authentication Migration Script
 * 
 * Automates the standardization of authentication across all CODAI ecosystem apps
 * Replaces localStorage.getItem('auth_token') and @codai/auth with @codai/shared-ui
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const APPS_DIR = path.resolve(__dirname, '..', 'apps');
const TARGET_FILE = 'app/page.tsx'; // Root page file to migrate

// Track migration results
const migrationResults = {
    success: [],
    skipped: [],
    errors: []
};

/**
 * Standard template for root page using @codai/shared-ui
 */
function generateStandardPageTemplate(appName) {
    const appNameUpper = appName.toUpperCase();
    return `'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, LoadingSpinner } from '@codai/shared-ui'

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard')
      } else {
        router.push('/landing')
      }
    }
  }, [isAuthenticated, isLoading, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center">
      <LoadingSpinner
        size="xl"
        variant="white"
        text="Loading ${appNameUpper}..."
        centered
      />
    </div>
  )
}
`;
}

/**
 * Check if app needs migration
 */
function needsMigration(filePath) {
    if (!fs.existsSync(filePath)) {
        return { needs: false, reason: 'File does not exist' };
    }

    const content = fs.readFileSync(filePath, 'utf8');

    // Check for localStorage usage
    if (content.includes("localStorage.getItem('auth_token')")) {
        return { needs: true, type: 'localStorage', reason: 'Uses localStorage.getItem' };
    }

    // Check for @codai/auth usage
    if (content.includes("from '@codai/auth'")) {
        return { needs: true, type: 'codai-auth', reason: 'Uses @codai/auth' };
    }

    // Check if already using @codai/shared-ui
    if (content.includes("from '@codai/shared-ui'") && content.includes('useAuth')) {
        return { needs: false, reason: 'Already using @codai/shared-ui' };
    }

    return { needs: true, type: 'unknown', reason: 'Unknown auth pattern' };
}

/**
 * Migrate a single app
 */
function migrateApp(appName) {
    const appDir = path.join(APPS_DIR, appName);
    const pageFile = path.join(appDir, TARGET_FILE);

    console.log(`\n🔍 Checking ${appName}...`);

    // Check if app directory exists
    if (!fs.existsSync(appDir)) {
        console.log(`   ⚠️  App directory not found: ${appDir}`);
        migrationResults.skipped.push({ app: appName, reason: 'Directory not found' });
        return;
    }

    // Check if migration is needed
    const migrationCheck = needsMigration(pageFile);
    if (!migrationCheck.needs) {
        console.log(`   ✅ Skipped: ${migrationCheck.reason}`);
        migrationResults.skipped.push({ app: appName, reason: migrationCheck.reason });
        return;
    }

    try {
        // Create backup
        const backupFile = pageFile + '.backup';
        if (fs.existsSync(pageFile)) {
            fs.copyFileSync(pageFile, backupFile);
            console.log(`   💾 Created backup: ${path.basename(backupFile)}`);
        }

        // Generate and write new content
        const newContent = generateStandardPageTemplate(appName);

        // Ensure app directory exists
        const pageDir = path.dirname(pageFile);
        if (!fs.existsSync(pageDir)) {
            fs.mkdirSync(pageDir, { recursive: true });
        }

        fs.writeFileSync(pageFile, newContent, 'utf8');
        console.log(`   ✅ Migrated: ${migrationCheck.type} → @codai/shared-ui`);

        migrationResults.success.push({
            app: appName,
            type: migrationCheck.type,
            file: pageFile
        });

    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        migrationResults.errors.push({
            app: appName,
            error: error.message
        });
    }
}

/**
 * Get list of apps to migrate
 */
function getAppsToMigrate() {
    // Get all app directories
    const allApps = fs.readdirSync(APPS_DIR, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    // Apps that are known to be already standardized
    const standardizedApps = ['codai']; // CODAI is already standardized

    // Filter out standardized apps
    return allApps.filter(app => !standardizedApps.includes(app));
}

/**
 * Print migration summary
 */
function printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 MIGRATION SUMMARY');
    console.log('='.repeat(60));

    console.log(`\n✅ Successfully migrated: ${migrationResults.success.length} apps`);
    migrationResults.success.forEach(result => {
        console.log(`   - ${result.app} (${result.type})`);
    });

    console.log(`\n⚠️  Skipped: ${migrationResults.skipped.length} apps`);
    migrationResults.skipped.forEach(result => {
        console.log(`   - ${result.app}: ${result.reason}`);
    });

    if (migrationResults.errors.length > 0) {
        console.log(`\n❌ Errors: ${migrationResults.errors.length} apps`);
        migrationResults.errors.forEach(result => {
            console.log(`   - ${result.app}: ${result.error}`);
        });
    }

    console.log(`\n📊 Total apps processed: ${migrationResults.success.length + migrationResults.skipped.length + migrationResults.errors.length}`);
}

/**
 * Test a single app after migration
 */
function testApp(appName) {
    const appDir = path.join(APPS_DIR, appName);
    console.log(`\n🧪 Testing ${appName}...`);

    try {
        // Check if TypeScript compiles
        execSync('pnpm tsc --noEmit', { cwd: appDir, stdio: 'pipe' });
        console.log(`   ✅ TypeScript compilation successful`);
        return true;
    } catch (error) {
        console.log(`   ❌ TypeScript compilation failed`);
        return false;
    }
}

/**
 * Main migration function
 */
function main() {
    console.log('🚀 Starting Authentication Migration for CODAI Ecosystem');
    console.log('📝 Target: Standardize all apps to use @codai/shared-ui');

    const appsToMigrate = getAppsToMigrate();
    console.log(`\n📋 Found ${appsToMigrate.length} apps to process:`);
    console.log(appsToMigrate.map(app => `   - ${app}`).join('\n'));

    // Migrate each app
    appsToMigrate.forEach(appName => {
        migrateApp(appName);
    });

    // Print summary
    printSummary();

    // Suggest next steps
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Review migrated apps manually for any custom logic');
    console.log('2. Test authentication flows in each migrated app');
    console.log('3. Run: pnpm dev in each app directory to verify compilation');
    console.log('4. Commit changes with: git add . && git commit -m "Standardize authentication across apps"');

    if (migrationResults.success.length > 0) {
        console.log('\n💡 Recommended testing order:');
        migrationResults.success.slice(0, 3).forEach(result => {
            console.log(`   - cd apps/${result.app} && pnpm dev`);
        });
    }
}

// Run the migration
main();
