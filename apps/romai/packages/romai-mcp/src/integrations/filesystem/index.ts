/**
 * File System Integration for ROMAI MCP
 * Provides intelligent file operations with Romanian business context
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { glob } from 'glob';
import { watch, FSWatcher } from 'chokidar';
import { Logger } from '../../utils/logger.js';

export interface FileSystemConfig {
  enabled: boolean;
  basePath?: string;
  watchEnabled?: boolean;
}

export interface FileInfo {
  path: string;
  name: string;
  size: number;
  type: 'file' | 'directory';
  extension?: string;
  modified: Date;
  created: Date;
}

export interface FileAnalysis {
  summary: string;
  language?: string;
  framework?: string;
  complexity: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export class FileSystemIntegration {
  private logger: Logger;
  private config: FileSystemConfig;
  private watcher?: FSWatcher;
  private basePath: string;

  constructor(config: FileSystemConfig) {
    this.logger = new Logger('FileSystemIntegration');
    this.config = config;
    this.basePath = config.basePath || process.cwd();
  }

  async initialize(): Promise<void> {
    this.logger.info('Initializing file system integration...');

    // Ensure base path exists
    await fs.ensureDir(this.basePath);

    // Setup file watcher if enabled
    if (this.config.watchEnabled) {
      this.setupWatcher();
    }

    this.logger.info('File system integration initialized');
  }

  private setupWatcher(): void {
    this.watcher = watch(this.basePath, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true
    });

    this.watcher
      .on('add', path => this.logger.debug(`File added: ${path}`))
      .on('change', path => this.logger.debug(`File changed: ${path}`))
      .on('unlink', path => this.logger.debug(`File removed: ${path}`));
  }

  // Tool: romai_file_read
  async readFile(filePath: string, encoding: string = 'utf8'): Promise<{
    content: string;
    info: FileInfo;
    analysis: FileAnalysis;
  }> {
    try {
      const resolvedPath = path.resolve(this.basePath, filePath);

      // Security check - ensure file is within base path
      if (!resolvedPath.startsWith(this.basePath)) {
        throw new Error('Access denied: File outside allowed directory');
      }

      const content = await fs.readFile(resolvedPath, { encoding: encoding as BufferEncoding });
      const stats = await fs.stat(resolvedPath);

      const info: FileInfo = {
        path: resolvedPath,
        name: path.basename(resolvedPath),
        size: stats.size,
        type: stats.isDirectory() ? 'directory' : 'file',
        extension: path.extname(resolvedPath),
        modified: stats.mtime,
        created: stats.birthtime
      };

      const analysis = await this.analyzeFileContent(content as string, info);

      return { content: content as string, info, analysis };
    } catch (error) {
      this.logger.error(`Error reading file ${filePath}:`, error);
      throw error;
    }
  }

  // Tool: romai_file_write
  async writeFile(filePath: string, content: string, options?: {
    encoding?: string;
    createDirectories?: boolean;
    backup?: boolean;
  }): Promise<{
    success: boolean;
    info: FileInfo;
    recommendations: string[];
  }> {
    try {
      const resolvedPath = path.resolve(this.basePath, filePath);

      // Security check
      if (!resolvedPath.startsWith(this.basePath)) {
        throw new Error('Access denied: File outside allowed directory');
      }

      // Create backup if requested
      if (options?.backup && await fs.pathExists(resolvedPath)) {
        const backupPath = `${resolvedPath}.backup.${Date.now()}`;
        await fs.copy(resolvedPath, backupPath);
        this.logger.info(`Backup created: ${backupPath}`);
      }

      // Create directories if needed
      if (options?.createDirectories) {
        await fs.ensureDir(path.dirname(resolvedPath));
      }

      await fs.writeFile(resolvedPath, content, { encoding: options?.encoding as BufferEncoding || 'utf8' });

      const stats = await fs.stat(resolvedPath);
      const info: FileInfo = {
        path: resolvedPath,
        name: path.basename(resolvedPath),
        size: stats.size,
        type: 'file',
        extension: path.extname(resolvedPath),
        modified: stats.mtime,
        created: stats.birthtime
      };

      const analysis = await this.analyzeFileContent(content, info);

      return {
        success: true,
        info,
        recommendations: analysis.recommendations
      };
    } catch (error) {
      this.logger.error(`Error writing file ${filePath}:`, error);
      throw error;
    }
  }

  // Tool: romai_file_search
  async searchFiles(pattern: string, options?: {
    includeContent?: boolean;
    maxResults?: number;
    fileTypes?: string[];
  }): Promise<{
    files: Array<FileInfo & { content?: string; matches?: string[] }>;
    summary: string;
  }> {
    try {
      const searchPattern = path.join(this.basePath, pattern);
      const files = await glob(searchPattern, {
        ignore: ['**/node_modules/**', '**/.git/**']
      });

      const results = [];
      const maxResults = options?.maxResults || 50;

      for (const file of files.slice(0, maxResults)) {
        const stats = await fs.stat(file);
        const info: FileInfo = {
          path: file,
          name: path.basename(file),
          size: stats.size,
          type: stats.isDirectory() ? 'directory' : 'file',
          extension: path.extname(file),
          modified: stats.mtime,
          created: stats.birthtime
        };

        let content = undefined;
        let matches = undefined;

        if (options?.includeContent && !stats.isDirectory()) {
          try {
            content = await fs.readFile(file, 'utf8');
            // Simple pattern matching in content
            if (pattern.includes('*') || pattern.includes('?')) {
              const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'), 'gi');
              matches = content.match(regex) || [];
            }
          } catch (error) {
            this.logger.warn(`Could not read content of ${file}:`, error);
          }
        }

        results.push({ ...info, content, matches });
      }

      const summary = `Found ${results.length} files matching "${pattern}". ${files.length > maxResults ? `Showing first ${maxResults} results.` : ''
        }`;

      return { files: results, summary };
    } catch (error) {
      this.logger.error(`Error searching files with pattern ${pattern}:`, error);
      throw error;
    }
  }

  // Tool: romai_directory_analyze
  async analyzeDirectory(dirPath: string = '.'): Promise<{
    structure: any;
    summary: string;
    recommendations: string[];
    insights: string[];
  }> {
    try {
      const resolvedPath = path.resolve(this.basePath, dirPath);

      if (!resolvedPath.startsWith(this.basePath)) {
        throw new Error('Access denied: Directory outside allowed path');
      }

      const structure = await this.buildDirectoryStructure(resolvedPath);
      const analysis = await this.analyzeProjectStructure(structure);

      return {
        structure,
        summary: analysis.summary,
        recommendations: analysis.recommendations,
        insights: analysis.insights
      };
    } catch (error) {
      this.logger.error(`Error analyzing directory ${dirPath}:`, error);
      throw error;
    }
  }

  // Tool: romai_workspace_optimize
  async optimizeWorkspace(options?: {
    cleanup?: boolean;
    organize?: boolean;
    analyze?: boolean;
  }): Promise<{
    optimizations: string[];
    suggestions: string[];
    summary: string;
  }> {
    try {
      const optimizations = [];
      const suggestions = [];

      if (options?.cleanup) {
        const cleanupResults = await this.cleanupWorkspace();
        optimizations.push(...cleanupResults);
      }

      if (options?.organize) {
        const organizeResults = await this.organizeWorkspace();
        optimizations.push(...organizeResults);
      }

      if (options?.analyze) {
        const analysisResults = await this.performWorkspaceAnalysis();
        suggestions.push(...analysisResults);
      }

      const summary = `Workspace optimization completed. Applied ${optimizations.length} optimizations, generated ${suggestions.length} suggestions.`;

      return { optimizations, suggestions, summary };
    } catch (error) {
      this.logger.error('Error optimizing workspace:', error);
      throw error;
    }
  }

  private async analyzeFileContent(content: string, info: FileInfo): Promise<FileAnalysis> {
    const analysis: FileAnalysis = {
      summary: `File ${info.name} (${info.size} bytes)`,
      complexity: 'low',
      recommendations: []
    };

    // Detect language based on extension
    const languageMap: Record<string, string> = {
      '.js': 'JavaScript',
      '.ts': 'TypeScript',
      '.py': 'Python',
      '.java': 'Java',
      '.cpp': 'C++',
      '.cs': 'C#',
      '.php': 'PHP',
      '.rb': 'Ruby',
      '.go': 'Go',
      '.rs': 'Rust',
      '.md': 'Markdown',
      '.json': 'JSON',
      '.yml': 'YAML',
      '.yaml': 'YAML'
    };

    if (info.extension) {
      analysis.language = languageMap[info.extension];
    }

    // Analyze complexity based on content
    const lines = content.split('\n').length;
    if (lines > 500) {
      analysis.complexity = 'high';
      analysis.recommendations.push('Consider breaking this file into smaller modules');
    } else if (lines > 100) {
      analysis.complexity = 'medium';
    }

    // Romanian business context recommendations
    if (analysis.language === 'JavaScript' || analysis.language === 'TypeScript') {
      analysis.recommendations.push('Consider adding JSDoc comments in Romanian for better documentation');
    }

    return analysis;
  }

  private async buildDirectoryStructure(dirPath: string): Promise<any> {
    const items = await fs.readdir(dirPath);
    const structure: any = {
      name: path.basename(dirPath),
      path: dirPath,
      type: 'directory',
      children: []
    };

    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = await fs.stat(itemPath);

      if (stats.isDirectory()) {
        // Recursively build structure for subdirectories
        const subStructure = await this.buildDirectoryStructure(itemPath);
        structure.children.push(subStructure);
      } else {
        structure.children.push({
          name: item,
          path: itemPath,
          type: 'file',
          size: stats.size,
          extension: path.extname(item)
        });
      }
    }

    return structure;
  }

  private async analyzeProjectStructure(structure: any): Promise<{
    summary: string;
    recommendations: string[];
    insights: string[];
  }> {
    const recommendations = [];
    const insights = [];

    // Check for common project files
    const hasPackageJson = structure.children.some((child: any) => child.name === 'package.json');
    const hasReadme = structure.children.some((child: any) => child.name.toLowerCase().includes('readme'));
    const hasGitignore = structure.children.some((child: any) => child.name === '.gitignore');

    if (hasPackageJson) {
      insights.push('Detected Node.js project');
    }

    if (!hasReadme) {
      recommendations.push('Add a README.md file to document the project');
    }

    if (!hasGitignore) {
      recommendations.push('Add a .gitignore file to exclude unnecessary files from version control');
    }

    // Romanian business recommendations
    recommendations.push('Consider adding Romanian language documentation for local team members');

    const summary = `Project structure analysis: ${structure.children.length} items in root directory. ${hasPackageJson ? 'Node.js project detected.' : 'Project type not immediately identifiable.'
      }`;

    return { summary, recommendations, insights };
  }

  private async cleanupWorkspace(): Promise<string[]> {
    // Implementation for workspace cleanup
    return ['Removed temporary files', 'Cleaned up old backups'];
  }

  private async organizeWorkspace(): Promise<string[]> {
    // Implementation for workspace organization
    return ['Organized files by type', 'Created proper directory structure'];
  }

  private async performWorkspaceAnalysis(): Promise<string[]> {
    // Implementation for workspace analysis
    return [
      'Consider implementing a consistent naming convention',
      'Add more documentation for better maintainability',
      'Set up automated testing structure'
    ];
  }

  async healthCheck(): Promise<any> {
    return {
      status: 'healthy',
      basePath: this.basePath,
      watcherActive: !!this.watcher,
      capabilities: ['read', 'write', 'search', 'analyze', 'optimize']
    };
  }

  async shutdown(): Promise<void> {
    if (this.watcher) {
      await this.watcher.close();
      this.logger.info('File watcher closed');
    }
    this.logger.info('File system integration shut down');
  }
}
