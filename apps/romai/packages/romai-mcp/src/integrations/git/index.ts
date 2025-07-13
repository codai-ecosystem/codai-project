/**
 * Git Integration for ROMAI MCP
 * Provides intelligent git operations with Romanian business context
 */

import { simpleGit, SimpleGit, StatusResult, LogResult } from 'simple-git';
import * as path from 'path';
import { Logger } from '../../utils/logger.js';

export interface GitConfig {
  enabled: boolean;
  defaultBranch?: string;
  autoCommit?: boolean;
}

export interface GitAnalysis {
  repository: string;
  currentBranch: string;
  status: any;
  recommendations: string[];
  insights: string[];
}

export class GitIntegration {
  private logger: Logger;
  private config: GitConfig;
  private git: SimpleGit;
  private repositoryPath: string;

  constructor(config: GitConfig) {
    this.logger = new Logger('GitIntegration');
    this.config = config;
    this.repositoryPath = process.cwd();
    this.git = simpleGit(this.repositoryPath);
  }

  async initialize(): Promise<void> {
    this.logger.info('Initializing git integration...');

    try {
      const isRepo = await this.git.checkIsRepo();
      if (!isRepo) {
        this.logger.warn('Current directory is not a git repository');
      } else {
        this.logger.info('Git repository detected');
      }
    } catch (error) {
      this.logger.error('Error checking git repository:', error);
    }

    this.logger.info('Git integration initialized');
  }

  // Tool: romai_git_analyze
  async analyzeRepository(): Promise<GitAnalysis> {
    try {
      const isRepo = await this.git.checkIsRepo();
      if (!isRepo) {
        throw new Error('Not a git repository');
      }

      const status = await this.git.status();
      const currentBranch = status.current || 'unknown';
      const remotes = await this.git.getRemotes(true);

      const analysis: GitAnalysis = {
        repository: this.repositoryPath,
        currentBranch,
        status: {
          ahead: status.ahead,
          behind: status.behind,
          staged: status.staged.length,
          modified: status.modified.length,
          created: status.created.length,
          deleted: status.deleted.length,
          renamed: status.renamed.length,
          files: status.files
        },
        recommendations: [],
        insights: []
      };

      // Generate insights
      if (status.ahead > 0) {
        analysis.insights.push(`${status.ahead} commits ahead of remote`);
      }
      if (status.behind > 0) {
        analysis.insights.push(`${status.behind} commits behind remote`);
      }
      if (status.staged.length > 0) {
        analysis.insights.push(`${status.staged.length} files staged for commit`);
      }
      if (status.modified.length > 0) {
        analysis.insights.push(`${status.modified.length} files modified`);
      }

      // Generate recommendations
      if (status.modified.length > 10) {
        analysis.recommendations.push('Consider committing changes in smaller, logical chunks');
      }
      if (status.ahead > 5) {
        analysis.recommendations.push('Consider pushing commits to remote repository');
      }
      if (remotes.length === 0) {
        analysis.recommendations.push('Add a remote repository for backup and collaboration');
      }

      // Romanian business context
      analysis.recommendations.push('Consider using Romanian commit messages for local development team');

      return analysis;
    } catch (error) {
      this.logger.error('Error analyzing git repository:', error);
      throw error;
    }
  }

  // Tool: romai_git_commit_smart
  async smartCommit(message?: string, options?: {
    autoStage?: boolean;
    language?: 'ro' | 'en';
    includeFiles?: string[];
  }): Promise<{
    success: boolean;
    commitHash?: string;
    message: string;
    recommendations: string[];
  }> {
    try {
      const status = await this.git.status();

      if (status.files.length === 0) {
        return {
          success: false,
          message: 'No changes to commit',
          recommendations: ['Make some changes first before committing']
        };
      }

      // Auto-stage if requested
      if (options?.autoStage) {
        if (options.includeFiles) {
          await this.git.add(options.includeFiles);
        } else {
          await this.git.add('.');
        }
      }

      // Generate smart commit message if not provided
      let commitMessage = message;
      if (!commitMessage) {
        commitMessage = await this.generateSmartCommitMessage(status, options?.language);
      }

      const result = await this.git.commit(commitMessage);

      const recommendations = [
        'Consider adding more descriptive commit messages',
        'Review changes before committing',
        'Use conventional commit format for better tracking'
      ];

      if (options?.language === 'ro') {
        recommendations.push('Excellent use of Romanian for local team communication');
      }

      return {
        success: true,
        commitHash: result.commit,
        message: commitMessage,
        recommendations
      };
    } catch (error) {
      this.logger.error('Error performing smart commit:', error);
      throw error;
    }
  }

  // Tool: romai_git_branch_strategy
  async analyzeBranchStrategy(): Promise<{
    currentStrategy: string;
    branches: string[];
    recommendations: string[];
    suggestedWorkflow: string;
  }> {
    try {
      const branches = await this.git.branch();
      const remoteBranches = await this.git.branch(['-r']);

      const branchNames = branches.all.filter(branch => !branch.startsWith('remotes/'));
      const strategy = this.detectBranchingStrategy(branchNames);

      const recommendations = [
        'Consider implementing Git Flow for complex projects',
        'Use feature branches for new development',
        'Implement code review process with pull requests',
        'Protect main/master branch with branch rules'
      ];

      // Romanian business context
      recommendations.push('Document branching strategy in Romanian for local team');
      recommendations.push('Consider Romanian naming conventions for feature branches');

      return {
        currentStrategy: strategy,
        branches: branchNames,
        recommendations,
        suggestedWorkflow: 'Git Flow with feature branches'
      };
    } catch (error) {
      this.logger.error('Error analyzing branch strategy:', error);
      throw error;
    }
  }

  // Tool: romai_git_merge_intelligence
  async analyzeMergeConflicts(): Promise<{
    hasConflicts: boolean;
    conflicts: string[];
    resolutionSuggestions: string[];
    automatedFixes: string[];
  }> {
    try {
      const status = await this.git.status();
      const conflicted = status.conflicted || [];

      const resolutionSuggestions = [
        'Review each conflict carefully',
        'Test after resolving conflicts',
        'Consider using merge tools for complex conflicts',
        'Communicate with team about conflict resolution'
      ];

      const automatedFixes = [];

      if (conflicted.length > 0) {
        automatedFixes.push('Run automated code formatting');
        automatedFixes.push('Check for simple whitespace conflicts');
        automatedFixes.push('Validate syntax after resolution');
      }

      return {
        hasConflicts: conflicted.length > 0,
        conflicts: conflicted,
        resolutionSuggestions,
        automatedFixes
      };
    } catch (error) {
      this.logger.error('Error analyzing merge conflicts:', error);
      throw error;
    }
  }

  // Tool: romai_git_history_insights
  async analyzeHistory(options?: {
    limit?: number;
    author?: string;
    since?: string;
  }): Promise<{
    commits: any[];
    patterns: string[];
    insights: string[];
    recommendations: string[];
  }> {
    try {
      const logOptions: any = {
        maxCount: options?.limit || 50
      };

      if (options?.author) {
        logOptions.author = options.author;
      }
      if (options?.since) {
        logOptions.since = options.since;
      }

      const log = await this.git.log(logOptions);

      const patterns = this.detectCommitPatterns(log);
      const insights = this.generateHistoryInsights(log);

      const recommendations = [
        'Maintain consistent commit message format',
        'Include ticket/issue numbers in commits',
        'Write descriptive commit messages',
        'Commit frequently with logical changes'
      ];

      return {
        commits: log.all.map(commit => ({
          hash: commit.hash,
          message: commit.message,
          author: commit.author_name,
          date: commit.date,
          files: commit.diff?.files || []
        })),
        patterns,
        insights,
        recommendations
      };
    } catch (error) {
      this.logger.error('Error analyzing git history:', error);
      throw error;
    }
  }

  // Tool: romai_git_security_audit
  async performSecurityAudit(): Promise<{
    issues: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high';
      description: string;
      file?: string;
      recommendation: string;
    }>;
    summary: string;
    score: number;
  }> {
    try {
      const issues = [];
      const log = await this.git.log(['--all', '--source', '--grep=password\\|secret\\|key\\|token']);

      // Check for sensitive data in commit messages
      for (const commit of log.all) {
        if (this.containsSensitiveData(commit.message)) {
          issues.push({
            type: 'sensitive_commit_message',
            severity: 'high' as const,
            description: `Commit ${commit.hash.substring(0, 8)} may contain sensitive information`,
            recommendation: 'Remove sensitive data from commit history'
          });
        }
      }

      // Check for large files
      const status = await this.git.status();
      for (const file of status.files) {
        // This would need actual file size checking
        if (file.path.includes('.env') && !file.path.includes('.example')) {
          issues.push({
            type: 'environment_file',
            severity: 'medium' as const,
            description: 'Environment file detected in repository',
            file: file.path,
            recommendation: 'Add environment files to .gitignore'
          });
        }
      }

      const score = Math.max(0, 100 - (issues.length * 10));
      const summary = `Security audit found ${issues.length} issues. Score: ${score}/100`;

      return { issues, summary, score };
    } catch (error) {
      this.logger.error('Error performing security audit:', error);
      throw error;
    }
  }

  private async generateSmartCommitMessage(status: StatusResult, language?: 'ro' | 'en'): Promise<string> {
    const isRomanian = language === 'ro';

    if (status.created.length > 0 && status.modified.length === 0) {
      return isRomanian ?
        `Adăugare fișiere noi: ${status.created.slice(0, 3).join(', ')}` :
        `Add new files: ${status.created.slice(0, 3).join(', ')}`;
    }

    if (status.modified.length > 0 && status.created.length === 0) {
      return isRomanian ?
        `Actualizare fișiere: ${status.modified.slice(0, 3).join(', ')}` :
        `Update files: ${status.modified.slice(0, 3).join(', ')}`;
    }

    if (status.deleted.length > 0) {
      return isRomanian ?
        `Ștergere fișiere: ${status.deleted.slice(0, 3).join(', ')}` :
        `Delete files: ${status.deleted.slice(0, 3).join(', ')}`;
    }

    return isRomanian ?
      'Actualizări diverse în proiect' :
      'Various project updates';
  }

  private detectBranchingStrategy(branches: string[]): string {
    const hasMain = branches.includes('main');
    const hasMaster = branches.includes('master');
    const hasDevelop = branches.includes('develop');
    const hasFeatureBranches = branches.some(b => b.startsWith('feature/'));
    const hasReleaseBranches = branches.some(b => b.startsWith('release/'));

    if (hasDevelop && hasFeatureBranches && hasReleaseBranches) {
      return 'Git Flow';
    } else if (hasFeatureBranches) {
      return 'Feature Branch Workflow';
    } else if (hasMain || hasMaster) {
      return 'Centralized Workflow';
    } else {
      return 'Unknown/Custom';
    }
  }

  private detectCommitPatterns(log: LogResult): string[] {
    const patterns = [];
    const messages = log.all.map(commit => commit.message);

    const hasConventional = messages.some(msg =>
      /^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .+/.test(msg)
    );

    if (hasConventional) {
      patterns.push('Uses Conventional Commits format');
    }

    const hasTicketNumbers = messages.some(msg =>
      /#\d+|TICKET-\d+|JIRA-\d+/.test(msg)
    );

    if (hasTicketNumbers) {
      patterns.push('Includes ticket/issue references');
    }

    return patterns;
  }

  private generateHistoryInsights(log: LogResult): string[] {
    const insights = [];
    const commits = log.all;

    if (commits.length > 0) {
      const authors = new Set(commits.map(c => c.author_name));
      insights.push(`${authors.size} active contributors`);

      const recentCommits = commits.filter(c =>
        new Date(c.date).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
      );
      insights.push(`${recentCommits.length} commits in the last 7 days`);
    }

    return insights;
  }

  private containsSensitiveData(text: string): boolean {
    const sensitivePatterns = [
      /password\s*[=:]\s*['"][^'"]+['"]/i,
      /api[_-]?key\s*[=:]\s*['"][^'"]+['"]/i,
      /secret\s*[=:]\s*['"][^'"]+['"]/i,
      /token\s*[=:]\s*['"][^'"]+['"]/i
    ];

    return sensitivePatterns.some(pattern => pattern.test(text));
  }

  async healthCheck(): Promise<any> {
    try {
      const isRepo = await this.git.checkIsRepo();
      const status = isRepo ? await this.git.status() : null;

      return {
        status: 'healthy',
        isRepository: isRepo,
        currentBranch: status?.current || null,
        capabilities: ['analyze', 'commit', 'branch', 'merge', 'history', 'security']
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        capabilities: []
      };
    }
  }

  async shutdown(): Promise<void> {
    this.logger.info('Git integration shut down');
  }
}
