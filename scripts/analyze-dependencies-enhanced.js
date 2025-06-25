#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Comprehensive Dependency Analysis for Codai Project
 * Analyzes all package.json files across the ecosystem
 */

class DependencyAnalyzer {
  constructor() {
    this.rootDir = process.cwd();
    this.analysis = {
      packageFiles: [],
      duplicateDependencies: {},
      unusedDevDependencies: [],
      outdatedPackages: [],
      securityIssues: [],
      summary: {},
    };
  }

  /**
   * Find all package.json files in the project
   */
  findPackageFiles() {
    const packageFiles = [];

    const searchDirectories = [
      'apps',
      'services',
      'packages',
      'tools',
      '.', // root
    ];

    for (const dir of searchDirectories) {
      const dirPath = path.join(this.rootDir, dir);
      if (fs.existsSync(dirPath)) {
        if (dir === '.') {
          // Root package.json
          const packagePath = path.join(dirPath, 'package.json');
          if (fs.existsSync(packagePath)) {
            packageFiles.push({
              path: packagePath,
              relativePath: 'package.json',
              type: 'root',
            });
          }
        } else {
          // Subdirectory package.json files
          const items = fs.readdirSync(dirPath, { withFileTypes: true });
          for (const item of items) {
            if (item.isDirectory()) {
              const packagePath = path.join(dirPath, item.name, 'package.json');
              if (fs.existsSync(packagePath)) {
                packageFiles.push({
                  path: packagePath,
                  relativePath: path.join(dir, item.name, 'package.json'),
                  type: dir,
                  name: item.name,
                });
              }
            }
          }
        }
      }
    }

    this.analysis.packageFiles = packageFiles;
    return packageFiles;
  }

  /**
   * Analyze dependencies across all package.json files
   */
  analyzeDependencies() {
    const dependencyMap = {};
    const devDependencyMap = {};

    for (const packageFile of this.analysis.packageFiles) {
      try {
        const packageContent = JSON.parse(
          fs.readFileSync(packageFile.path, 'utf8')
        );

        // Analyze dependencies
        if (packageContent.dependencies) {
          for (const [dep, version] of Object.entries(
            packageContent.dependencies
          )) {
            if (!dependencyMap[dep]) {
              dependencyMap[dep] = [];
            }
            dependencyMap[dep].push({
              package: packageFile.relativePath,
              version,
              type: 'dependency',
            });
          }
        }

        // Analyze devDependencies
        if (packageContent.devDependencies) {
          for (const [dep, version] of Object.entries(
            packageContent.devDependencies
          )) {
            if (!devDependencyMap[dep]) {
              devDependencyMap[dep] = [];
            }
            devDependencyMap[dep].push({
              package: packageFile.relativePath,
              version,
              type: 'devDependency',
            });
          }
        }
      } catch (error) {
        console.warn(
          `Warning: Could not parse ${packageFile.path}: ${error.message}`
        );
      }
    }

    // Find duplicates
    const allDependencies = { ...dependencyMap, ...devDependencyMap };
    for (const [dep, occurrences] of Object.entries(allDependencies)) {
      if (occurrences.length > 1) {
        const versions = [...new Set(occurrences.map(o => o.version))];
        if (versions.length > 1) {
          this.analysis.duplicateDependencies[dep] = {
            occurrences: occurrences.length,
            versions,
            packages: occurrences,
          };
        }
      }
    }

    return { dependencyMap, devDependencyMap };
  }

  /**
   * Check for potentially unused devDependencies
   */
  analyzeUnusedDevDependencies() {
    const commonDevDeps = new Set([
      '@types/node',
      '@types/react',
      '@types/jest',
      'typescript',
      'eslint',
      'prettier',
      'jest',
      'vitest',
      '@testing-library/react',
      'turbo',
      '@playwright/test',
    ]);

    const suspiciousDevDeps = [];

    for (const packageFile of this.analysis.packageFiles) {
      try {
        const packageContent = JSON.parse(
          fs.readFileSync(packageFile.path, 'utf8')
        );

        if (packageContent.devDependencies) {
          for (const dep of Object.keys(packageContent.devDependencies)) {
            if (!commonDevDeps.has(dep)) {
              // Check if it might be unused (basic heuristic)
              const packageDir = path.dirname(packageFile.path);
              const hasConfigFile =
                fs.existsSync(path.join(packageDir, `${dep}.config.js`)) ||
                fs.existsSync(path.join(packageDir, `${dep}.config.ts`)) ||
                fs.existsSync(path.join(packageDir, `.${dep}rc`));

              if (!hasConfigFile) {
                suspiciousDevDeps.push({
                  package: packageFile.relativePath,
                  dependency: dep,
                  reason: 'No config file found',
                });
              }
            }
          }
        }
      } catch (error) {
        console.warn(
          `Warning: Could not analyze ${packageFile.path}: ${error.message}`
        );
      }
    }

    this.analysis.unusedDevDependencies = suspiciousDevDeps;
    return suspiciousDevDeps;
  }

  /**
   * Generate summary statistics
   */
  generateSummary() {
    const summary = {
      totalPackageFiles: this.analysis.packageFiles.length,
      packagesByType: {},
      duplicateDependencyCount: Object.keys(this.analysis.duplicateDependencies)
        .length,
      suspiciousDevDepsCount: this.analysis.unusedDevDependencies.length,
      recommendations: [],
    };

    // Count packages by type
    for (const packageFile of this.analysis.packageFiles) {
      const type = packageFile.type;
      summary.packagesByType[type] = (summary.packagesByType[type] || 0) + 1;
    }

    // Generate recommendations
    if (summary.duplicateDependencyCount > 0) {
      summary.recommendations.push(
        `Consolidate ${summary.duplicateDependencyCount} duplicate dependencies`
      );
    }

    if (summary.suspiciousDevDepsCount > 0) {
      summary.recommendations.push(
        `Review ${summary.suspiciousDevDepsCount} potentially unused devDependencies`
      );
    }

    if (summary.totalPackageFiles > 20) {
      summary.recommendations.push(
        'Consider using workspace dependency management for large monorepo'
      );
    }

    this.analysis.summary = summary;
    return summary;
  }

  /**
   * Run complete analysis and generate report
   */
  async runAnalysis() {
    console.log('🔍 Starting comprehensive dependency analysis...\n');

    // Step 1: Find all package files
    console.log('📦 Finding package.json files...');
    const packageFiles = this.findPackageFiles();
    console.log(`Found ${packageFiles.length} package.json files\n`);

    // Step 2: Analyze dependencies
    console.log('🔗 Analyzing dependencies...');
    this.analyzeDependencies();
    console.log(
      `Found ${Object.keys(this.analysis.duplicateDependencies).length} dependencies with version conflicts\n`
    );

    // Step 3: Check for unused devDependencies
    console.log('🧹 Checking for potentially unused devDependencies...');
    this.analyzeUnusedDevDependencies();
    console.log(
      `Found ${this.analysis.unusedDevDependencies.length} suspicious devDependencies\n`
    );

    // Step 4: Generate summary
    console.log('📊 Generating summary...');
    this.generateSummary();

    // Step 5: Save report
    const reportPath = path.join(
      this.rootDir,
      'dependency-analysis-report.json'
    );
    fs.writeFileSync(reportPath, JSON.stringify(this.analysis, null, 2));
    console.log(`✅ Analysis complete! Report saved to: ${reportPath}\n`);

    this.printSummary();
    return this.analysis;
  }

  /**
   * Print analysis summary to console
   */
  printSummary() {
    const { summary } = this.analysis;

    console.log('📋 DEPENDENCY ANALYSIS SUMMARY');
    console.log('================================');
    console.log(`Total package.json files: ${summary.totalPackageFiles}`);
    console.log('\nPackages by type:');
    for (const [type, count] of Object.entries(summary.packagesByType)) {
      console.log(`  ${type}: ${count}`);
    }

    console.log(
      `\n🔄 Duplicate dependencies: ${summary.duplicateDependencyCount}`
    );
    console.log(
      `🧹 Suspicious devDependencies: ${summary.suspiciousDevDepsCount}`
    );

    if (summary.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      for (const rec of summary.recommendations) {
        console.log(`  • ${rec}`);
      }
    }

    if (Object.keys(this.analysis.duplicateDependencies).length > 0) {
      console.log('\n🔄 TOP DUPLICATE DEPENDENCIES:');
      const sortedDuplicates = Object.entries(
        this.analysis.duplicateDependencies
      )
        .sort(([, a], [, b]) => b.occurrences - a.occurrences)
        .slice(0, 10);

      for (const [dep, info] of sortedDuplicates) {
        console.log(
          `  ${dep}: ${info.occurrences} occurrences, ${info.versions.length} versions`
        );
      }
    }

    console.log(
      '\n✨ Analysis complete! Check dependency-analysis-report.json for full details.\n'
    );
  }
}

// Run analysis if called directly
const isMainModule =
  process.argv[1] &&
  process.argv[1].endsWith('analyze-dependencies-enhanced.js');
if (isMainModule) {
  console.log('🚀 Starting enhanced dependency analysis...');
  const analyzer = new DependencyAnalyzer();
  analyzer.runAnalysis().catch(error => {
    console.error('❌ Analysis failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  });
}

export default DependencyAnalyzer;
