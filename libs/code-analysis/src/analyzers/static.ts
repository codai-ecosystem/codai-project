/**
 * CODAI Static Code Analyzer
 * 
 * Advanced static analysis with TypeScript/ESLint integration
 * Provides code quality assessment, metrics collection, and improvement suggestions
 */

import { ESLint } from 'eslint';
import * as ts from 'typescript';
import { parse as babelParse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import { calculateComplexity, calculateMaintainabilityIndex } from '../utils/complexity';

export interface StaticAnalysisConfig {
  rules: string[];
  severity: 'error' | 'warning' | 'info';
  enableTypeChecking: boolean;
  enableLinting: boolean;
  customRules?: CustomRule[];
}

export interface StaticAnalysisResult {
  score: number;
  issues: StaticIssue[];
  metrics: CodeMetrics;
  suggestions: CodeSuggestion[];
  typeErrors: TypeScriptError[];
  lintResults: ESLintResult[];
}

export interface StaticIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
  rule: string;
  severity: number;
  fixable: boolean;
  source?: string;
}

export interface CodeMetrics {
  lines: number;
  linesOfCode: number;
  logicalLines: number;
  functions: number;
  classes: number;
  complexity: number;
  maintainabilityIndex: number;
  technicalDebt: number;
  duplicatedLines: number;
  testCoverage?: number;
}

export interface CodeSuggestion {
  id: string;
  type: 'refactor' | 'optimize' | 'simplify' | 'modernize';
  message: string;
  line: number;
  column: number;
  originalCode: string;
  suggestedCode: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
}

export interface TypeScriptError {
  code: number;
  message: string;
  line: number;
  column: number;
  category: 'error' | 'warning' | 'suggestion';
  file: string;
}

export interface ESLintResult {
  ruleId: string;
  message: string;
  line: number;
  column: number;
  severity: number;
  fixable: boolean;
  fix?: ESLintFix;
}

export interface ESLintFix {
  range: [number, number];
  text: string;
}

export interface CustomRule {
  name: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  check: (node: any, context: any) => boolean;
  message: string;
  fixable?: boolean;
  fix?: (node: any) => string;
}

export class StaticAnalyzer {
  private config: StaticAnalysisConfig;
  private eslint: ESLint;
  private typeChecker: ts.TypeChecker | null = null;
  private program: ts.Program | null = null;
  private statistics = {
    analyzedFiles: 0,
    totalAnalyses: 0,
    averageAnalysisTime: 0,
    issuesFound: 0
  };

  constructor(config: StaticAnalysisConfig) {
    this.config = config;
    this.initializeESLint();
  }

  private initializeESLint(): void {
    this.eslint = new ESLint({
      baseConfig: {
        env: {
          browser: true,
          node: true,
          es2022: true
        },
        extends: [
          'eslint:recommended',
          '@typescript-eslint/recommended',
          '@typescript-eslint/recommended-requiring-type-checking'
        ],
        parser: '@typescript-eslint/parser',
        parserOptions: {
          ecmaVersion: 'latest',
          sourceType: 'module',
          project: './tsconfig.json'
        },
        plugins: ['@typescript-eslint'],
        rules: {
          // Code quality rules
          'no-unused-vars': 'error',
          'no-undef': 'error',
          'no-console': 'warn',
          'prefer-const': 'error',
          'no-var': 'error',

          // TypeScript specific rules
          '@typescript-eslint/no-unused-vars': 'error',
          '@typescript-eslint/no-explicit-any': 'warn',
          '@typescript-eslint/explicit-function-return-type': 'warn',
          '@typescript-eslint/no-non-null-assertion': 'warn',
          '@typescript-eslint/prefer-nullish-coalescing': 'error',
          '@typescript-eslint/prefer-optional-chain': 'error',

          // Best practices
          'complexity': ['warn', 10],
          'max-depth': ['warn', 4],
          'max-lines-per-function': ['warn', 50],
          'max-params': ['warn', 4],

          // Performance
          'no-loop-func': 'error',
          'no-inner-declarations': 'error',

          // Security
          'no-eval': 'error',
          'no-implied-eval': 'error',
          'no-new-func': 'error'
        }
      },
      fix: true,
      cache: true,
      cacheLocation: '.eslintcache'
    });
  }

  /**
   * Analyze parsed code structure
   */
  async analyze(parsedCode: any, filePath: string): Promise<StaticAnalysisResult> {
    const startTime = Date.now();

    try {
      // Initialize TypeScript program if needed
      if (this.config.enableTypeChecking && filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        await this.initializeTypeScript(filePath);
      }

      // Collect code metrics
      const metrics = await this.collectMetrics(parsedCode, filePath);

      // Run ESLint analysis
      const lintResults = this.config.enableLinting
        ? await this.runESLintAnalysis(filePath)
        : [];

      // Run TypeScript type checking
      const typeErrors = this.config.enableTypeChecking
        ? await this.runTypeChecking(filePath)
        : [];

      // Generate static issues
      const issues = await this.generateIssues(parsedCode, lintResults, typeErrors);

      // Generate improvement suggestions
      const suggestions = await this.generateSuggestions(parsedCode, issues);

      // Calculate overall score
      const score = this.calculateScore(issues, metrics);

      const result: StaticAnalysisResult = {
        score,
        issues,
        metrics,
        suggestions,
        typeErrors,
        lintResults
      };

      // Update statistics
      this.updateStatistics(Date.now() - startTime, issues.length);

      return result;
    } catch (error) {
      console.error(`❌ Static analysis failed for ${filePath}:`, error);
      throw error;
    }
  }

  private async collectMetrics(parsedCode: any, filePath: string): Promise<CodeMetrics> {
    const sourceCode = parsedCode.code || '';
    const lines = sourceCode.split('\n');

    let functions = 0;
    let classes = 0;
    let linesOfCode = 0;
    let logicalLines = 0;

    // Parse with Babel for detailed AST analysis
    try {
      const ast = babelParse(sourceCode, {
        sourceType: 'module',
        allowImportExportEverywhere: true,
        allowReturnOutsideFunction: true,
        plugins: [
          'typescript',
          'jsx',
          'decorators-legacy',
          'classProperties',
          'asyncGenerators',
          'functionBind',
          'exportDefaultFrom',
          'exportNamespaceFrom',
          'dynamicImport',
          'nullishCoalescingOperator',
          'optionalChaining'
        ]
      });

      traverse(ast, {
        Function(path) {
          functions++;
        },
        ClassDeclaration(path) {
          classes++;
        },
        Statement(path) {
          if (!t.isEmptyStatement(path.node)) {
            logicalLines++;
          }
        }
      });
    } catch (error) {
      console.warn(`⚠️ Failed to parse AST for metrics: ${error}`);
    }

    // Count lines of code (excluding comments and empty lines)
    linesOfCode = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 0 &&
        !trimmed.startsWith('//') &&
        !trimmed.startsWith('/*') &&
        !trimmed.startsWith('*');
    }).length;

    // Calculate complexity metrics
    const complexity = calculateComplexity(sourceCode);
    const maintainabilityIndex = calculateMaintainabilityIndex(
      linesOfCode,
      complexity,
      functions
    );

    return {
      lines: lines.length,
      linesOfCode,
      logicalLines,
      functions,
      classes,
      complexity,
      maintainabilityIndex,
      technicalDebt: this.calculateTechnicalDebt(complexity, maintainabilityIndex),
      duplicatedLines: await this.detectDuplicatedLines(sourceCode),
      testCoverage: await this.getTestCoverage(filePath)
    };
  }

  private async runESLintAnalysis(filePath: string): Promise<ESLintResult[]> {
    try {
      const results = await this.eslint.lintFiles([filePath]);
      const result = results[0];

      if (!result) return [];

      return result.messages.map(message => ({
        ruleId: message.ruleId || 'unknown',
        message: message.message,
        line: message.line,
        column: message.column,
        severity: message.severity,
        fixable: message.fix !== undefined,
        fix: message.fix ? {
          range: message.fix.range,
          text: message.fix.text
        } : undefined
      }));
    } catch (error) {
      console.warn(`⚠️ ESLint analysis failed: ${error}`);
      return [];
    }
  }

  private async initializeTypeScript(filePath: string): Promise<void> {
    try {
      // Find tsconfig.json
      const configPath = ts.findConfigFile(
        filePath,
        ts.sys.fileExists,
        'tsconfig.json'
      );

      if (!configPath) {
        console.warn('⚠️ No tsconfig.json found, using default TypeScript config');
        return;
      }

      // Read and parse config
      const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
      const compilerOptions = ts.parseJsonConfigFileContent(
        configFile.config,
        ts.sys,
        require('path').dirname(configPath)
      );

      // Create program
      this.program = ts.createProgram({
        rootNames: [filePath],
        options: compilerOptions.options
      });

      this.typeChecker = this.program.getTypeChecker();
    } catch (error) {
      console.warn(`⚠️ TypeScript initialization failed: ${error}`);
    }
  }

  private async runTypeChecking(filePath: string): Promise<TypeScriptError[]> {
    if (!this.program) {
      return [];
    }

    try {
      const sourceFile = this.program.getSourceFile(filePath);
      if (!sourceFile) {
        return [];
      }

      const diagnostics = ts.concat(
        this.program.getSyntacticDiagnostics(sourceFile),
        this.program.getSemanticDiagnostics(sourceFile)
      );

      return diagnostics.map(diagnostic => {
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(
          diagnostic.start || 0
        );

        return {
          code: diagnostic.code,
          message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
          line: line + 1,
          column: character + 1,
          category: ts.DiagnosticCategory[diagnostic.category].toLowerCase() as any,
          file: filePath
        };
      });
    } catch (error) {
      console.warn(`⚠️ TypeScript type checking failed: ${error}`);
      return [];
    }
  }

  private async generateIssues(
    parsedCode: any,
    lintResults: ESLintResult[],
    typeErrors: TypeScriptError[]
  ): Promise<StaticIssue[]> {
    const issues: StaticIssue[] = [];

    // Convert ESLint results to issues
    lintResults.forEach((result, index) => {
      issues.push({
        id: `eslint-${index}`,
        type: result.severity === 2 ? 'error' : 'warning',
        message: result.message,
        line: result.line,
        column: result.column,
        rule: result.ruleId,
        severity: result.severity,
        fixable: result.fixable,
        source: 'eslint'
      });
    });

    // Convert TypeScript errors to issues
    typeErrors.forEach((error, index) => {
      issues.push({
        id: `typescript-${index}`,
        type: error.category as any,
        message: error.message,
        line: error.line,
        column: error.column,
        rule: `TS${error.code}`,
        severity: error.category === 'error' ? 2 : 1,
        fixable: false,
        source: 'typescript'
      });
    });

    // Apply custom rules
    if (this.config.customRules) {
      const customIssues = await this.applyCustomRules(parsedCode);
      issues.push(...customIssues);
    }

    return issues.sort((a, b) => {
      if (a.line !== b.line) return a.line - b.line;
      return a.column - b.column;
    });
  }

  private async applyCustomRules(parsedCode: any): Promise<StaticIssue[]> {
    const issues: StaticIssue[] = [];

    if (!this.config.customRules) return issues;

    for (const rule of this.config.customRules) {
      try {
        const ruleIssues = await this.checkCustomRule(parsedCode, rule);
        issues.push(...ruleIssues);
      } catch (error) {
        console.warn(`⚠️ Custom rule ${rule.name} failed: ${error}`);
      }
    }

    return issues;
  }

  private async checkCustomRule(parsedCode: any, rule: CustomRule): Promise<StaticIssue[]> {
    const issues: StaticIssue[] = [];

    // Implementation would traverse the AST and apply custom rule logic
    // This is a simplified example

    return issues;
  }

  private async generateSuggestions(
    parsedCode: any,
    issues: StaticIssue[]
  ): Promise<CodeSuggestion[]> {
    const suggestions: CodeSuggestion[] = [];

    // Generate refactoring suggestions based on issues
    for (const issue of issues) {
      const suggestion = await this.generateSuggestionForIssue(issue, parsedCode);
      if (suggestion) {
        suggestions.push(suggestion);
      }
    }

    // Generate general improvement suggestions
    const generalSuggestions = await this.generateGeneralSuggestions(parsedCode);
    suggestions.push(...generalSuggestions);

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  private async generateSuggestionForIssue(
    issue: StaticIssue,
    parsedCode: any
  ): Promise<CodeSuggestion | null> {
    // Implementation would generate specific suggestions based on issue type
    // This is a placeholder
    return null;
  }

  private async generateGeneralSuggestions(parsedCode: any): Promise<CodeSuggestion[]> {
    const suggestions: CodeSuggestion[] = [];

    // Implementation would analyze code patterns and suggest improvements
    // This is a placeholder

    return suggestions;
  }

  private calculateScore(issues: StaticIssue[], metrics: CodeMetrics): number {
    let score = 100;

    // Deduct points for issues
    issues.forEach(issue => {
      switch (issue.type) {
        case 'error':
          score -= 10;
          break;
        case 'warning':
          score -= 5;
          break;
        case 'info':
          score -= 1;
          break;
      }
    });

    // Adjust based on complexity
    if (metrics.complexity > 10) {
      score -= (metrics.complexity - 10) * 2;
    }

    // Adjust based on maintainability
    if (metrics.maintainabilityIndex < 50) {
      score -= (50 - metrics.maintainabilityIndex);
    }

    return Math.max(0, Math.min(100, score));
  }

  private calculateTechnicalDebt(complexity: number, maintainabilityIndex: number): number {
    // Simplified technical debt calculation
    const complexityDebt = Math.max(0, complexity - 10) * 0.5;
    const maintainabilityDebt = Math.max(0, 100 - maintainabilityIndex) * 0.3;

    return Math.round((complexityDebt + maintainabilityDebt) * 100) / 100;
  }

  private async detectDuplicatedLines(sourceCode: string): Promise<number> {
    // Simplified duplicate detection
    const lines = sourceCode.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 5); // Only consider meaningful lines

    const lineOccurrences = new Map<string, number>();
    lines.forEach(line => {
      lineOccurrences.set(line, (lineOccurrences.get(line) || 0) + 1);
    });

    let duplicatedLines = 0;
    lineOccurrences.forEach((count, line) => {
      if (count > 1) {
        duplicatedLines += count - 1;
      }
    });

    return duplicatedLines;
  }

  private async getTestCoverage(filePath: string): Promise<number | undefined> {
    // Implementation would integrate with coverage tools like Istanbul/NYC
    // This is a placeholder
    return undefined;
  }

  private updateStatistics(analysisTime: number, issuesCount: number): void {
    this.statistics.analyzedFiles++;
    this.statistics.totalAnalyses++;
    this.statistics.averageAnalysisTime =
      (this.statistics.averageAnalysisTime * (this.statistics.totalAnalyses - 1) + analysisTime) /
      this.statistics.totalAnalyses;
    this.statistics.issuesFound += issuesCount;
  }

  /**
   * Get analyzer statistics
   */
  getStatistics() {
    return { ...this.statistics };
  }

  /**
   * Reset statistics
   */
  resetStatistics(): void {
    this.statistics = {
      analyzedFiles: 0,
      totalAnalyses: 0,
      averageAnalysisTime: 0,
      issuesFound: 0
    };
  }
}
