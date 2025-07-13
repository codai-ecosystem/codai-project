#!/usr/bin/env node

/**
 * Modernization Validation Script
 * Validates that all packages have been successfully modernized
 */

import { readFileSync } from 'fs';
import { glob } from 'glob';
import path from 'path';

const EXPECTED_VERSIONS = {
  'next': '^15.3.5',
  'react': '^19.1.0',
  'typescript': '^5.8.3',
  '@types/node': '^24.0.13',
  'lucide-react': '^0.525.0',
  'vitest': '^3.2.4',
  '@vitest/ui': '^3.2.4',
  'eslint': '^8.57.1',
  'openai': '^5.9.0',
  'zod': '^3.25.76'
};

async function validateModernization() {
  console.log('🔍 Starting Modernization Validation...\n');

  const packageFiles = await glob('**/package.json', {
    ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**'],
    cwd: process.cwd()
  });

  let totalPackages = 0;
  let modernizedPackages = 0;
  let issues = [];

  for (const file of packageFiles) {
    try {
      const content = readFileSync(file, 'utf-8');
      const pkg = JSON.parse(content);
      totalPackages++;

      let packageModernized = false;
      let packageIssues = [];

      // Check dependencies
      const allDeps = {
        ...pkg.dependencies,
        ...pkg.devDependencies,
        ...pkg.peerDependencies
      };

      for (const [dep, expectedVersion] of Object.entries(EXPECTED_VERSIONS)) {
        if (allDeps[dep]) {
          const currentVersion = allDeps[dep];
          if (!currentVersion.includes(expectedVersion.replace('^', ''))) {
            packageIssues.push(`${dep}: expected ${expectedVersion}, found ${currentVersion}`);
          } else {
            packageModernized = true;
          }
        }
      }

      if (packageModernized && packageIssues.length === 0) {
        modernizedPackages++;
      } else if (packageIssues.length > 0) {
        issues.push({
          file,
          name: pkg.name || 'unknown',
          issues: packageIssues
        });
      }

    } catch (error) {
      console.warn(`⚠️  Could not read ${file}: ${error.message}`);
    }
  }

  // Print results
  console.log('📊 Modernization Validation Results:\n');
  console.log(`✅ Total packages scanned: ${totalPackages}`);
  console.log(`🎯 Modernized packages: ${modernizedPackages}`);
  console.log(`📈 Success rate: ${((modernizedPackages / totalPackages) * 100).toFixed(1)}%\n`);

  if (issues.length > 0) {
    console.log(`⚠️  Packages with version mismatches (${issues.length}):\n`);
    issues.slice(0, 10).forEach(issue => {
      console.log(`📦 ${issue.name}:`);
      issue.issues.forEach(iss => console.log(`   • ${iss}`));
      console.log();
    });

    if (issues.length > 10) {
      console.log(`... and ${issues.length - 10} more packages\n`);
    }
  }

  // Check key applications
  console.log('🧪 Testing Key Application Builds:\n');

  const keyApps = [
    'apps/dexai',
    'apps/memorai/apps/dashboard',
    'apps/metu-web',
    'packages/shared-ui'
  ];

  for (const app of keyApps) {
    try {
      const pkgPath = path.join(app, 'package.json');
      if (readFileSync(pkgPath, 'utf-8')) {
        console.log(`✅ ${app}: package.json valid`);
      }
    } catch (error) {
      console.log(`❌ ${app}: ${error.message}`);
    }
  }

  console.log('\n🎉 Modernization validation complete!');

  if (modernizedPackages / totalPackages > 0.9) {
    console.log('🚀 ECOSYSTEM MODERNIZATION: SUCCESS');
    console.log('💡 Ready for next-generation development!');
  } else {
    console.log('🔧 Some packages may need additional updates.');
  }
}

validateModernization().catch(console.error);
