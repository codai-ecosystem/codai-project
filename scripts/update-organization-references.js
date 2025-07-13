#!/usr/bin/env node

/**
 * Update Organization References Script
 *
 * This script systematically updates all references from dragoscv to codai-ecosystem
 * organization across the entire monorepo to prevent future mistakes.
 *
 * Usage: node scripts/update-organization-references.js
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Configuration
const OLD_ORG = 'dragoscv';
const NEW_ORG = 'codai-ecosystem';

const REPLACEMENT_PATTERNS = [
  {
    pattern: /dragoscv\/AIDE/g,
    replacement: 'codai-ecosystem/codai',
    description: 'AIDE repository references',
  },
  {
    pattern: /dragoscv\/memorai-mcp/g,
    replacement: 'codai-ecosystem/memorai',
    description: 'Memorai MCP repository references',
  },
  {
    pattern: /dragoscv\/cursuri/g,
    replacement: 'codai-ecosystem/studiai',
    description: 'Studiai repository references',
  },
  {
    pattern: /https:\/\/github\.com\/dragoscv/g,
    replacement: 'https://github.com/codai-ecosystem',
    description: 'GitHub URL references',
  },
  {
    pattern: /github\.com\/dragoscv/g,
    replacement: 'github.com/codai-ecosystem',
    description: 'GitHub domain references',
  },
];

// File patterns to include/exclude
const INCLUDE_EXTENSIONS = [
  '.js',
  '.ts',
  '.tsx',
  '.json',
  '.md',
  '.txt',
  '.yml',
  '.yaml',
];
const EXCLUDE_DIRS = [
  'node_modules',
  '.git',
  '.turbo',
  'dist',
  'build',
  '.next',
];

/**
 * Recursively find all files matching our criteria
 */
function findFiles(dir, files = []) {
  const entries = fs.readdirSync(dir);

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(entry)) {
        findFiles(fullPath, files);
      }
    } else {
      const ext = path.extname(entry);
      if (INCLUDE_EXTENSIONS.includes(ext)) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

/**
 * Update a single file
 */
function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;

  for (const { pattern, replacement, description } of REPLACEMENT_PATTERNS) {
    const originalContent = content;
    content = content.replace(pattern, replacement);

    if (content !== originalContent) {
      hasChanges = true;
      console.log(
        `  ✅ Updated ${description} in ${path.relative(process.cwd(), filePath)}`
      );
    }
  }

  if (hasChanges) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }

  return false;
}

/**
 * Update git remotes
 */
async function updateGitRemotes() {
  console.log('\n📡 Updating Git Remotes...');

  try {
    // Update main repository remote
    await execAsync(
      'git remote set-url origin https://github.com/codai-ecosystem/codai-project.git'
    );
    console.log(
      '  ✅ Updated main repository remote to codai-ecosystem/codai-project'
    );

    // Check if there are any submodules that need updating
    const { stdout } = await execAsync(
      'git submodule status 2>/dev/null || echo ""'
    );
    if (stdout.trim()) {
      console.log(
        '  ℹ️  Git submodules detected - URLs should be updated via .gitmodules'
      );
    }
  } catch (error) {
    console.log(`  ⚠️  Git remote update: ${error.message}`);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log(
    '🔄 Updating Organization References: dragoscv → codai-ecosystem\n'
  );

  const startTime = Date.now();
  const rootDir = process.cwd();

  // Find all relevant files
  console.log('🔍 Scanning files...');
  const files = findFiles(rootDir);
  console.log(`Found ${files.length} files to check\n`);

  // Update files
  console.log('📝 Updating file references...');
  let updatedFiles = 0;

  for (const file of files) {
    if (updateFile(file)) {
      updatedFiles++;
    }
  }

  // Update git remotes
  await updateGitRemotes();

  // Summary
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n✅ Organization Update Complete!`);
  console.log(`📊 Summary:`);
  console.log(`   • Files scanned: ${files.length}`);
  console.log(`   • Files updated: ${updatedFiles}`);
  console.log(`   • Duration: ${duration}s`);
  console.log(`\n🎯 All references now point to codai-ecosystem organization!`);
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { updateFile, findFiles, REPLACEMENT_PATTERNS };
