#!/usr/bin/env node

/**
 * Dependency Analyzer for Codai Project
 * Analyzes and optimizes dependencies across all services
 */

import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

class DependencyAnalyzer {
  constructor() {
    this.rootDir = process.cwd();
    this.packages = new Map();
    this.duplicates = new Map();
    this.unused = new Map();
  }

  async findPackageJsonFiles() {
    try {
      const { stdout } = await execAsync('find . -name "package.json" -not -path "*/node_modules/*"');
      return stdout.trim().split('\n').filter(f => f.length > 0);
    } catch (error) {
      return [];
    }
  }

  async analyzePackage(packagePath) {
    try {
      const content = await fs.readFile(packagePath, 'utf8');
      const pkg = JSON.parse(content);
      
      return {
        path: packagePath,
        name: pkg.name || path.dirname(packagePath),
        dependencies: pkg.dependencies || {},
        devDependencies: pkg.devDependencies || {},
        peerDependencies: pkg.peerDependencies || {},
        scripts: pkg.scripts || {},
        version: pkg.version
      };
    } catch (error) {
      console.log(`❌ Failed to analyze ${packagePath}:`, error.message);
      return null;
    }
  }

  findDuplicateDependencies() {
    const allDeps = new Map();
    const duplicates = new Map();

    this.packages.forEach((pkg, path) => {
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      
      Object.entries(deps).forEach(([name, version]) => {
        if (!allDeps.has(name)) {
          allDeps.set(name, new Map());
        }
        
        if (!allDeps.get(name).has(version)) {
          allDeps.get(name).set(version, []);
        }
        
        allDeps.get(name).get(version).push({
          package: pkg.name,
          path: path,
          type: pkg.dependencies[name] ? 'dependency' : 'devDependency'
        });
      });
    });

    // Find dependencies with multiple versions
    allDeps.forEach((versions, depName) => {
      if (versions.size > 1) {
        duplicates.set(depName, versions);
      }
    });

    return duplicates;
  }

  findLargestDependencies() {
    const depCount = new Map();
    
    this.packages.forEach(pkg => {
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      Object.keys(deps).forEach(dep => {
        depCount.set(dep, (depCount.get(dep) || 0) + 1);
      });
    });

    return Array.from(depCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);
  }

  async checkUnusedDependencies(packagePath) {
    try {
      console.log(`Checking unused dependencies in ${packagePath}...`);
      
      // Install depcheck if not available
      try {
        await execAsync('which depcheck');
      } catch {
        console.log('Installing depcheck...');
        await execAsync('npm install -g depcheck');
      }

      const { stdout } = await execAsync(`npx depcheck "${path.dirname(packagePath)}" --json`);
      const result = JSON.parse(stdout);
      
      return {
        unused: result.dependencies || [],
        missing: result.missing || {},
        devUnused: result.devDependencies || []
      };
    } catch (error) {
      console.log(`❌ Failed to check unused dependencies in ${packagePath}:`, error.message);
      return { unused: [], missing: {}, devUnused: [] };
    }
  }

  generateOptimizationSuggestions() {
    const suggestions = [];
    const duplicates = this.findDuplicateDependencies();
    
    // Suggest version unification
    duplicates.forEach((versions, depName) => {
      const versionArray = Array.from(versions.keys());
      suggestions.push({
        type: 'version_conflict',
        dependency: depName,
        versions: versionArray,
        suggestion: `Unify ${depName} to single version across all packages`,
        impact: 'medium',
        packages: Array.from(versions.values()).flat()
      });
    });

    // Suggest common dependencies extraction
    const commonDeps = this.findLargestDependencies();
    commonDeps.slice(0, 10).forEach(([dep, count]) => {
      if (count > 5) {
        suggestions.push({
          type: 'extract_common',
          dependency: dep,
          usageCount: count,
          suggestion: `Consider moving ${dep} to shared package (used in ${count} packages)`,
          impact: 'high'
        });
      }
    });

    return suggestions;
  }

  async generateOptimizedPackageJson(originalPath) {
    const pkg = this.packages.get(originalPath);
    if (!pkg) return null;

    const optimized = {
      name: pkg.name,
      version: pkg.version,
      dependencies: {},
      devDependencies: {},
      scripts: pkg.scripts
    };

    // Check for unused dependencies
    const unusedAnalysis = await this.checkUnusedDependencies(originalPath);
    
    // Keep only used dependencies
    Object.entries(pkg.dependencies).forEach(([name, version]) => {
      if (!unusedAnalysis.unused.includes(name)) {
        optimized.dependencies[name] = version;
      }
    });

    Object.entries(pkg.devDependencies).forEach(([name, version]) => {
      if (!unusedAnalysis.devUnused.includes(name)) {
        optimized.devDependencies[name] = version;
      }
    });

    return {
      original: pkg,
      optimized,
      removed: {
        dependencies: unusedAnalysis.unused,
        devDependencies: unusedAnalysis.devUnused
      }
    };
  }

  async run() {
    console.log('🔍 Analyzing Codai Project Dependencies');
    console.log('======================================');

    // Find all package.json files
    const packageFiles = await this.findPackageJsonFiles();
    console.log(`Found ${packageFiles.length} package.json files`);

    // Analyze each package
    for (const pkgFile of packageFiles) {
      const analysis = await this.analyzePackage(pkgFile);
      if (analysis) {
        this.packages.set(pkgFile, analysis);
      }
    }

    console.log(`\n📦 Analyzed ${this.packages.size} packages`);

    // Find duplicate dependencies
    const duplicates = this.findDuplicateDependencies();
    console.log(`\n🔄 Found ${duplicates.size} dependencies with version conflicts:`);
    
    duplicates.forEach((versions, depName) => {
      console.log(`\n  ${depName}:`);
      versions.forEach((packages, version) => {
        console.log(`    ${version} (${packages.length} packages)`);
        packages.forEach(pkg => console.log(`      - ${pkg.package} (${pkg.type})`));
      });
    });

    // Show most used dependencies
    const commonDeps = this.findLargestDependencies();
    console.log(`\n📊 Most used dependencies:`);
    commonDeps.slice(0, 10).forEach(([dep, count]) => {
      console.log(`  ${dep}: ${count} packages`);
    });

    // Generate optimization suggestions
    const suggestions = this.generateOptimizationSuggestions();
    console.log(`\n💡 Optimization suggestions (${suggestions.length} total):`);
    
    suggestions.forEach((suggestion, index) => {
      console.log(`\n${index + 1}. ${suggestion.suggestion}`);
      console.log(`   Type: ${suggestion.type}`);
      console.log(`   Impact: ${suggestion.impact}`);
      if (suggestion.dependency) {
        console.log(`   Dependency: ${suggestion.dependency}`);
      }
    });

    // Check for unused dependencies in key packages
    console.log(`\n🧹 Checking for unused dependencies...`);
    const rootPackage = packageFiles.find(f => f === './package.json');
    if (rootPackage) {
      const unusedAnalysis = await this.checkUnusedDependencies(rootPackage);
      
      if (unusedAnalysis.unused.length > 0) {
        console.log(`\n⚠️  Unused dependencies in root package:`);
        unusedAnalysis.unused.forEach(dep => console.log(`  - ${dep}`));
      }
      
      if (unusedAnalysis.devUnused.length > 0) {
        console.log(`\n⚠️  Unused dev dependencies in root package:`);
        unusedAnalysis.devUnused.forEach(dep => console.log(`  - ${dep}`));
      }
    }

    // Generate report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalPackages: this.packages.size,
        duplicateVersions: duplicates.size,
        suggestions: suggestions.length
      },
      duplicates: Object.fromEntries(duplicates),
      suggestions,
      commonDependencies: commonDeps
    };

    const reportPath = path.join(this.rootDir, 'dependency-analysis-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📋 Analysis report saved to: ${reportPath}`);

    return report;
  }
}

// Main execution
async function main() {
  const analyzer = new DependencyAnalyzer();
  
  try {
    await analyzer.run();
    console.log('\n✅ Dependency analysis completed!');
  } catch (error) {
    console.error('❌ Analysis failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default DependencyAnalyzer;
