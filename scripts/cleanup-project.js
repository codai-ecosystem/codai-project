#!/usr/bin/env node

/**
 * Codai Project Cleanup Tool (Windows Compatible)
 * Removes unused files, optimizes dependencies, and improves project structure
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

class ProjectCleaner {
  constructor() {
    this.rootDir = process.cwd();
    this.isWindows = process.platform === 'win32';
  }

  async removeFile(filePath) {
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      return false;
    }
  }

  async getFileSize(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return stats.size;
    } catch {
      return 0;
    }
  }

  async cleanBackupFiles() {
    console.log('\n🧹 Cleaning backup files...');
    
    let totalRemoved = 0;
    let totalSize = 0;

    const searchFiles = async (dir) => {
      const files = [];
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          if (entry.isDirectory() && entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
            const subFiles = await searchFiles(fullPath);
            files.push(...subFiles);
          } else if (entry.isFile()) {
            // Check if filename matches backup patterns
            if (entry.name.includes('backup') || entry.name.includes('.bak') || 
                entry.name.endsWith('-backup') || entry.name.includes('lint-backup') ||
                entry.name.includes('prod-backup') || entry.name.includes('console-backup')) {
              files.push(fullPath);
            }
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
      
      return files;
    };

    const files = await searchFiles(this.rootDir);
    
    if (files.length > 0) {
      console.log(`Found ${files.length} backup files`);
      
      for (const file of files) {
        const size = await this.getFileSize(file);
        const removed = await this.removeFile(file);
        
        if (removed) {
          console.log(`✅ Removed: ${path.relative(this.rootDir, file)}`);
          totalRemoved++;
          totalSize += size;
        } else {
          console.log(`❌ Failed to remove: ${path.relative(this.rootDir, file)}`);
        }
      }
    } else {
      console.log('No backup files found');
    }

    console.log(`\n✨ Removed ${totalRemoved} backup files (${(totalSize / 1024 / 1024).toFixed(2)}MB)`);
    return { removedCount: totalRemoved, totalSize };
  }

  async cleanLogFiles() {
    console.log('\n🧹 Cleaning log files...');
    
    let totalRemoved = 0;
    let totalSize = 0;

    const searchLogFiles = async (dir) => {
      const files = [];
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          if (entry.isDirectory() && entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
            const subFiles = await searchLogFiles(fullPath);
            files.push(...subFiles);
          } else if (entry.isFile() && (entry.name.endsWith('.log') || entry.name.endsWith('.err'))) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
      
      return files;
    };

    const files = await searchLogFiles(this.rootDir);
    
    if (files.length > 0) {
      console.log(`Found ${files.length} log files`);
      
      for (const file of files) {
        const size = await this.getFileSize(file);
        const removed = await this.removeFile(file);
        
        if (removed) {
          console.log(`✅ Removed: ${path.relative(this.rootDir, file)}`);
          totalRemoved++;
          totalSize += size;
        }
      }
    } else {
      console.log('No log files found');
    }

    console.log(`\n✨ Removed ${totalRemoved} log files (${(totalSize / 1024 / 1024).toFixed(2)}MB)`);
    return { removedCount: totalRemoved, totalSize };
  }

  async findPackageJsonFiles() {
    const files = [];
    
    const searchPackageFiles = async (dir) => {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          if (entry.isDirectory() && entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
            await searchPackageFiles(fullPath);
          } else if (entry.isFile() && entry.name === 'package.json') {
            files.push(fullPath);
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
    };

    await searchPackageFiles(this.rootDir);
    return files;
  }

  async analyzePackageJson(packagePath) {
    try {
      const content = await fs.readFile(packagePath, 'utf8');
      const pkg = JSON.parse(content);
      
      return {
        path: packagePath,
        name: pkg.name || path.basename(path.dirname(packagePath)),
        dependencies: Object.keys(pkg.dependencies || {}),
        devDependencies: Object.keys(pkg.devDependencies || {}),
        scripts: Object.keys(pkg.scripts || {}),
        version: pkg.version
      };
    } catch (error) {
      return null;
    }
  }

  async auditPackages() {
    console.log('\n🔍 Auditing package.json files...');
    
    const packageFiles = await this.findPackageJsonFiles();
    console.log(`Found ${packageFiles.length} package.json files`);
    
    const analyses = [];
    for (const pkgFile of packageFiles) {
      const analysis = await this.analyzePackageJson(pkgFile);
      if (analysis) {
        analyses.push(analysis);
        console.log(`📦 ${analysis.name}: ${analysis.dependencies.length} deps, ${analysis.devDependencies.length} devDeps`);
      }
    }

    return analyses;
  }

  async findTodoItems() {
    console.log('\n🔍 Finding TODO/FIXME items...');
    
    const todoItems = [];
    
    const searchTodos = async (dir) => {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          if (entry.isDirectory() && entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
            await searchTodos(fullPath);
          } else if (entry.isFile() && /\.(ts|tsx|js|jsx|md)$/.test(entry.name)) {
            try {
              const content = await fs.readFile(fullPath, 'utf8');
              const lines = content.split('\n');
              
              lines.forEach((line, index) => {
                if (/TODO|FIXME|XXX|HACK/.test(line)) {
                  todoItems.push({
                    file: path.relative(this.rootDir, fullPath),
                    line: index + 1,
                    content: line.trim()
                  });
                }
              });
            } catch (error) {
              // Skip files we can't read
            }
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
    };

    await searchTodos(this.rootDir);
    
    if (todoItems.length > 0) {
      console.log(`Found ${todoItems.length} TODO/FIXME items:`);
      
      const grouped = {};
      todoItems.forEach(item => {
        if (!grouped[item.file]) grouped[item.file] = [];
        grouped[item.file].push(`Line ${item.line}: ${item.content}`);
      });

      Object.entries(grouped).slice(0, 10).forEach(([file, items]) => {
        console.log(`\n📁 ${file}:`);
        items.forEach(item => console.log(`   ${item}`));
      });
      
      if (Object.keys(grouped).length > 10) {
        console.log(`\n... and ${Object.keys(grouped).length - 10} more files`);
      }
    } else {
      console.log('✅ No TODO/FIXME items found');
    }

    return todoItems.length;
  }

  async generateReport() {
    console.log('🎯 CODAI PROJECT CLEANUP REPORT');
    console.log('================================');

    const startTime = Date.now();
    
    // Clean backup files
    const backupResult = await this.cleanBackupFiles();
    
    // Clean log files  
    const logResult = await this.cleanLogFiles();
    
    // Audit packages
    const packageAnalyses = await this.auditPackages();
    
    // Find TODO items
    const todoCount = await this.findTodoItems();

    const endTime = Date.now();
    const duration = endTime - startTime;

    const report = {
      timestamp: new Date().toISOString(),
      duration: `${(duration / 1000).toFixed(2)}s`,
      summary: {
        filesRemoved: backupResult.removedCount + logResult.removedCount,
        sizeFreed: (backupResult.totalSize + logResult.totalSize) / 1024 / 1024,
        packagesAnalyzed: packageAnalyses.length,
        todoItems: todoCount
      },
      details: {
        backupFiles: backupResult,
        logFiles: logResult,
        packages: packageAnalyses.length,
        todos: todoCount
      }
    };

    console.log('\n📊 CLEANUP SUMMARY');
    console.log('==================');
    console.log(`Files removed: ${report.summary.filesRemoved}`);
    console.log(`Space freed: ${report.summary.sizeFreed.toFixed(2)}MB`);
    console.log(`Packages analyzed: ${report.summary.packagesAnalyzed}`);
    console.log(`TODO items found: ${report.summary.todoItems}`);
    console.log(`Duration: ${report.duration}`);

    // Save report
    const reportPath = path.join(this.rootDir, 'cleanup-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📋 Report saved to: cleanup-report.json`);

    return report;
  }
}

// Main execution
async function main() {
  console.log('Starting Codai Project Cleanup...\n');
  
  const cleaner = new ProjectCleaner();
  
  try {
    await cleaner.generateReport();
    console.log('\n✅ Cleanup completed successfully!');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('cleanup-project.js')) {
  main();
}
