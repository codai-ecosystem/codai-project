/**
 * CODAI Performance Analyzer
 * 
 * Advanced performance analysis and optimization recommendations
 * Detects bottlenecks, memory issues, and provides actionable insights
 */

import * as ts from 'typescript';
import { EventEmitter } from 'events';

export interface PerformanceConfig {
  enableBottleneckDetection: boolean;
  enableMemoryAnalysis: boolean;
  enableAsyncAnalysis: boolean;
  enableBundleAnalysis: boolean;
  performanceThresholds: PerformanceThresholds;
  customRules?: PerformanceRule[];
}

export interface PerformanceThresholds {
  cyclomaticComplexity: number;
  functionLength: number;
  nestedCallbacks: number;
  loopComplexity: number;
  memoryUsage: number;
  executionTime: number;
}

export interface PerformanceRule {
  id: string;
  name: string;
  pattern: RegExp;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
  category: 'cpu' | 'memory' | 'network' | 'rendering' | 'bundle';
}

export interface PerformanceResult {
  issues: PerformanceIssue[];
  metrics: PerformanceMetrics;
  recommendations: PerformanceRecommendation[];
  summary: PerformanceSummary;
  processing_time: number;
}

export interface PerformanceIssue {
  id: string;
  type: 'bottleneck' | 'memory-leak' | 'inefficient-loop' | 'blocking-operation' | 'large-bundle' | 'unused-code';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  file: string;
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
  code: string;
  impact: 'rendering' | 'memory' | 'cpu' | 'network' | 'bundle-size';
  estimatedSavings: {
    time?: string;
    memory?: string;
    bundleSize?: string;
  };
  recommendation: string;
  confidence: number;
}

export interface PerformanceMetrics {
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  linesOfCode: number;
  functionCount: number;
  classCount: number;
  asyncOperations: number;
  syncOperations: number;
  loopCount: number;
  callbackDepth: number;
  memoryHotspots: number;
  potentialMemoryLeaks: number;
  unusedExports: number;
  bundleEstimate: {
    size: number;
    gzipSize: number;
    treeshakeable: boolean;
  };
}

export interface PerformanceRecommendation {
  id: string;
  category: 'optimization' | 'refactoring' | 'bundling' | 'caching';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  implementation: string;
  estimatedImpact: {
    performance: number; // 1-10 scale
    complexity: number; // Implementation difficulty 1-10
    timeToImplement: string;
  };
  codeExample?: string;
}

export interface PerformanceSummary {
  overallScore: number; // 0-100
  categoryScores: {
    cpu: number;
    memory: number;
    network: number;
    bundleSize: number;
  };
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  topRecommendations: PerformanceRecommendation[];
}

export class PerformanceAnalyzer extends EventEmitter {
  private config: PerformanceConfig;
  private performanceRules: PerformanceRule[] = [];
  private statistics = {
    filesAnalyzed: 0,
    issuesFound: 0,
    optimizationsApplied: 0,
    averagePerformanceScore: 0,
    totalTimeSaved: 0 // in milliseconds
  };

  constructor(config: PerformanceConfig) {
    super();
    this.config = config;
    this.initializePerformanceRules();
  }

  private initializePerformanceRules(): void {
    this.performanceRules = [
      ...this.getBottleneckRules(),
      ...this.getMemoryRules(),
      ...this.getAsyncRules(),
      ...this.getBundleRules(),
      ...(this.config.customRules || [])
    ];

    console.log(`✅ Initialized ${this.performanceRules.length} performance rules`);
  }

  /**
   * Analyze code performance
   */
  async analyzeCode(
    sourceCode: string,
    filePath: string,
    language: string = 'typescript'
  ): Promise<PerformanceResult> {
    const startTime = Date.now();

    try {
      this.emit('analysisStarted', { file: filePath });

      // Parse code into AST
      const sourceFile = this.parseCode(sourceCode, language);

      // Perform different types of analysis
      const [
        bottleneckIssues,
        memoryIssues,
        asyncIssues,
        bundleIssues,
        metrics
      ] = await Promise.all([
        this.config.enableBottleneckDetection
          ? this.detectBottlenecks(sourceCode, sourceFile, filePath)
          : [],
        this.config.enableMemoryAnalysis
          ? this.detectMemoryIssues(sourceCode, sourceFile, filePath)
          : [],
        this.config.enableAsyncAnalysis
          ? this.detectAsyncIssues(sourceCode, sourceFile, filePath)
          : [],
        this.config.enableBundleAnalysis
          ? this.detectBundleIssues(sourceCode, sourceFile, filePath)
          : [],
        this.calculateMetrics(sourceCode, sourceFile)
      ]);

      // Combine all issues
      const allIssues = [
        ...bottleneckIssues,
        ...memoryIssues,
        ...asyncIssues,
        ...bundleIssues
      ];

      // Generate recommendations
      const recommendations = this.generateRecommendations(allIssues, metrics);

      // Create summary
      const summary = this.generateSummary(allIssues, metrics, recommendations);

      const processingTime = Date.now() - startTime;

      const result: PerformanceResult = {
        issues: allIssues.sort((a, b) =>
          this.getSeverityWeight(b.severity) - this.getSeverityWeight(a.severity)
        ),
        metrics,
        recommendations: recommendations.sort((a, b) =>
          this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority)
        ),
        summary,
        processing_time: processingTime
      };

      // Update statistics
      this.updateStatistics(result);

      this.emit('analysisCompleted', result);
      return result;

    } catch (error) {
      this.emit('analysisError', error);
      console.error('❌ Performance analysis failed:', error);
      throw error;
    }
  }

  /**
   * Batch analyze multiple files
   */
  async analyzeProject(projectPath: string): Promise<PerformanceResult> {
    const startTime = Date.now();
    const allIssues: PerformanceIssue[] = [];
    const allMetrics: PerformanceMetrics[] = [];
    let filesAnalyzed = 0;

    try {
      const files = await this.findSourceFiles(projectPath);

      this.emit('projectAnalysisStarted', { totalFiles: files.length });

      for (const file of files) {
        try {
          const content = await import('fs/promises').then(fs => fs.readFile(file, 'utf-8'));
          const language = this.detectLanguage(file);
          const result = await this.analyzeCode(content, file, language);

          allIssues.push(...result.issues);
          allMetrics.push(result.metrics);
          filesAnalyzed++;

          this.emit('fileAnalyzed', {
            file,
            issues: result.issues.length,
            score: result.summary.overallScore,
            progress: Math.round((filesAnalyzed / files.length) * 100)
          });
        } catch (error) {
          console.error(`❌ Failed to analyze file ${file}:`, error);
        }
      }

      // Aggregate metrics
      const aggregatedMetrics = this.aggregateMetrics(allMetrics);

      // Generate project-level recommendations
      const recommendations = this.generateProjectRecommendations(allIssues, aggregatedMetrics);

      // Create project summary
      const summary = this.generateSummary(allIssues, aggregatedMetrics, recommendations);

      const processingTime = Date.now() - startTime;

      const result: PerformanceResult = {
        issues: allIssues.sort((a, b) =>
          this.getSeverityWeight(b.severity) - this.getSeverityWeight(a.severity)
        ),
        metrics: aggregatedMetrics,
        recommendations: recommendations.sort((a, b) =>
          this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority)
        ),
        summary,
        processing_time: processingTime
      };

      this.emit('projectAnalysisCompleted', result);
      return result;

    } catch (error) {
      console.error('❌ Project performance analysis failed:', error);
      throw error;
    }
  }

  private parseCode(sourceCode: string, language: string): ts.SourceFile | null {
    try {
      if (language === 'typescript' || language === 'javascript') {
        return ts.createSourceFile(
          'temp.ts',
          sourceCode,
          ts.ScriptTarget.Latest,
          true
        );
      }
      return null;
    } catch (error) {
      console.error('❌ Failed to parse code:', error);
      return null;
    }
  }

  private async detectBottlenecks(
    sourceCode: string,
    sourceFile: ts.SourceFile | null,
    filePath: string
  ): Promise<PerformanceIssue[]> {
    const issues: PerformanceIssue[] = [];
    const lines = sourceCode.split('\n');

    // Detect nested loops (O(n²) or worse complexity)
    const nestedLoopPattern = /for\s*\([^)]*\)\s*\{[^}]*for\s*\([^)]*\)/gs;
    let match;
    while ((match = nestedLoopPattern.exec(sourceCode)) !== null) {
      const lineNumber = sourceCode.substring(0, match.index).split('\n').length;

      issues.push({
        id: `nested-loop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'bottleneck',
        severity: 'high',
        title: 'Nested Loop Performance Issue',
        description: 'Nested loops can cause O(n²) or worse time complexity',
        file: filePath,
        line: lineNumber,
        column: match.index - sourceCode.lastIndexOf('\n', match.index - 1) - 1,
        code: lines[lineNumber - 1] || '',
        impact: 'cpu',
        estimatedSavings: {
          time: '50-90% reduction in execution time'
        },
        recommendation: 'Consider using hash maps, pre-filtering, or algorithm optimization',
        confidence: 0.85
      });
    }

    // Detect synchronous operations in async functions
    const syncInAsyncPattern = /async\s+function[^{]*\{[^}]*(?:fs\.readFileSync|JSON\.parse\(.*\.readFileSync)/gs;
    while ((match = syncInAsyncPattern.exec(sourceCode)) !== null) {
      const lineNumber = sourceCode.substring(0, match.index).split('\n').length;

      issues.push({
        id: `sync-in-async-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'blocking-operation',
        severity: 'medium',
        title: 'Synchronous Operation in Async Function',
        description: 'Synchronous file operations block the event loop',
        file: filePath,
        line: lineNumber,
        column: match.index - sourceCode.lastIndexOf('\n', match.index - 1) - 1,
        code: lines[lineNumber - 1] || '',
        impact: 'cpu',
        estimatedSavings: {
          time: 'Prevents event loop blocking'
        },
        recommendation: 'Use async file operations (fs.promises or fs/promises)',
        confidence: 0.9
      });
    }

    // Detect inefficient array operations
    const inefficientArrayPattern = /\.find\([^)]*\).*\.find\([^)]*\)|\.filter\([^)]*\).*\.map\([^)]*\)/gs;
    while ((match = inefficientArrayPattern.exec(sourceCode)) !== null) {
      const lineNumber = sourceCode.substring(0, match.index).split('\n').length;

      issues.push({
        id: `inefficient-array-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'inefficient-loop',
        severity: 'medium',
        title: 'Inefficient Array Operations',
        description: 'Multiple array iterations can be combined for better performance',
        file: filePath,
        line: lineNumber,
        column: match.index - sourceCode.lastIndexOf('\n', match.index - 1) - 1,
        code: lines[lineNumber - 1] || '',
        impact: 'cpu',
        estimatedSavings: {
          time: '30-60% reduction in iteration time'
        },
        recommendation: 'Combine array operations or use reduce() for single-pass processing',
        confidence: 0.75
      });
    }

    // Detect regex in loops
    const regexInLoopPattern = /(?:for|while)\s*\([^)]*\)\s*\{[^}]*new\s+RegExp\(/gs;
    while ((match = regexInLoopPattern.exec(sourceCode)) !== null) {
      const lineNumber = sourceCode.substring(0, match.index).split('\n').length;

      issues.push({
        id: `regex-in-loop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'bottleneck',
        severity: 'medium',
        title: 'Regex Compilation in Loop',
        description: 'Creating regex patterns inside loops is inefficient',
        file: filePath,
        line: lineNumber,
        column: match.index - sourceCode.lastIndexOf('\n', match.index - 1) - 1,
        code: lines[lineNumber - 1] || '',
        impact: 'cpu',
        estimatedSavings: {
          time: '40-70% reduction in regex processing time'
        },
        recommendation: 'Move regex compilation outside the loop',
        confidence: 0.9
      });
    }

    return issues;
  }

  private async detectMemoryIssues(
    sourceCode: string,
    sourceFile: ts.SourceFile | null,
    filePath: string
  ): Promise<PerformanceIssue[]> {
    const issues: PerformanceIssue[] = [];
    const lines = sourceCode.split('\n');

    // Detect event listeners without cleanup
    const eventListenerPattern = /addEventListener\s*\(\s*['"`]([^'"`]+)['"`]/g;
    const removeEventListenerPattern = /removeEventListener\s*\(\s*['"`]([^'"`]+)['"`]/g;

    const addedEvents = new Set<string>();
    const removedEvents = new Set<string>();

    let match;
    while ((match = eventListenerPattern.exec(sourceCode)) !== null) {
      addedEvents.add(match[1]);
    }

    while ((match = removeEventListenerPattern.exec(sourceCode)) !== null) {
      removedEvents.add(match[1]);
    }

    // Find events that are added but not removed
    const uncleanedEvents = [...addedEvents].filter(event => !removedEvents.has(event));

    if (uncleanedEvents.length > 0) {
      const firstEventMatch = eventListenerPattern.exec(sourceCode);
      if (firstEventMatch) {
        const lineNumber = sourceCode.substring(0, firstEventMatch.index).split('\n').length;

        issues.push({
          id: `memory-leak-events-${Date.now()}`,
          type: 'memory-leak',
          severity: 'high',
          title: 'Potential Memory Leak - Event Listeners',
          description: `Event listeners (${uncleanedEvents.join(', ')}) are not cleaned up`,
          file: filePath,
          line: lineNumber,
          column: firstEventMatch.index - sourceCode.lastIndexOf('\n', firstEventMatch.index - 1) - 1,
          code: lines[lineNumber - 1] || '',
          impact: 'memory',
          estimatedSavings: {
            memory: 'Prevents memory accumulation over time'
          },
          recommendation: 'Add corresponding removeEventListener calls in cleanup/unmount',
          confidence: 0.8
        });
      }
    }

    // Detect large array/object creation in loops
    const largeObjectInLoopPattern = /(?:for|while)\s*\([^)]*\)\s*\{[^}]*(?:new\s+Array\(|new\s+Object\(|\[\s*\.\.\.|Object\.create)/gs;
    while ((match = largeObjectInLoopPattern.exec(sourceCode)) !== null) {
      const lineNumber = sourceCode.substring(0, match.index).split('\n').length;

      issues.push({
        id: `memory-allocation-loop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'memory-leak',
        severity: 'medium',
        title: 'Excessive Memory Allocation in Loop',
        description: 'Creating large objects/arrays inside loops can cause memory pressure',
        file: filePath,
        line: lineNumber,
        column: match.index - sourceCode.lastIndexOf('\n', match.index - 1) - 1,
        code: lines[lineNumber - 1] || '',
        impact: 'memory',
        estimatedSavings: {
          memory: '50-80% reduction in memory allocation'
        },
        recommendation: 'Pre-allocate objects outside loops or use object pooling',
        confidence: 0.7
      });
    }

    // Detect closures holding references
    const closureReferencePattern = /function\s*\([^)]*\)\s*\{[^}]*return\s+function[^}]*\{[^}]*(?:this\.|var\s+|let\s+|const\s+)/gs;
    while ((match = closureReferencePattern.exec(sourceCode)) !== null) {
      const lineNumber = sourceCode.substring(0, match.index).split('\n').length;

      issues.push({
        id: `closure-reference-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'memory-leak',
        severity: 'low',
        title: 'Potential Closure Memory Retention',
        description: 'Closures may retain references to outer scope variables',
        file: filePath,
        line: lineNumber,
        column: match.index - sourceCode.lastIndexOf('\n', match.index - 1) - 1,
        code: lines[lineNumber - 1] || '',
        impact: 'memory',
        estimatedSavings: {
          memory: 'Reduces memory retention in closures'
        },
        recommendation: 'Minimize captured variables or explicitly nullify references',
        confidence: 0.6
      });
    }

    return issues;
  }

  private async detectAsyncIssues(
    sourceCode: string,
    sourceFile: ts.SourceFile | null,
    filePath: string
  ): Promise<PerformanceIssue[]> {
    const issues: PerformanceIssue[] = [];
    const lines = sourceCode.split('\n');

    // Detect sequential async operations that could be parallel
    const sequentialAsyncPattern = /await\s+[^;]+;\s*\n\s*await\s+[^;]+;/gs;
    let match;
    while ((match = sequentialAsyncPattern.exec(sourceCode)) !== null) {
      const lineNumber = sourceCode.substring(0, match.index).split('\n').length;

      // Check if operations are independent (simple heuristic)
      const operations = match[0].split('await').slice(1);
      const mightBeIndependent = !operations.some(op => operations.some(other =>
        other !== op && (op.includes(other.split('(')[0]) || other.includes(op.split('(')[0]))
      ));

      if (mightBeIndependent) {
        issues.push({
          id: `sequential-async-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'blocking-operation',
          severity: 'medium',
          title: 'Sequential Async Operations',
          description: 'Independent async operations are executed sequentially instead of in parallel',
          file: filePath,
          line: lineNumber,
          column: match.index - sourceCode.lastIndexOf('\n', match.index - 1) - 1,
          code: lines[lineNumber - 1] || '',
          impact: 'network',
          estimatedSavings: {
            time: '50-80% reduction in async operation time'
          },
          recommendation: 'Use Promise.all() or Promise.allSettled() for parallel execution',
          confidence: 0.7
        });
      }
    }

    // Detect missing error handling in async operations
    const asyncWithoutCatchPattern = /await\s+[^;]+;(?![^}]*catch)/gs;
    while ((match = asyncWithoutCatchPattern.exec(sourceCode)) !== null) {
      const lineNumber = sourceCode.substring(0, match.index).split('\n').length;

      // Check if it's in a try-catch block
      const beforeMatch = sourceCode.substring(0, match.index);
      const afterMatch = sourceCode.substring(match.index);
      const inTryCatch = beforeMatch.lastIndexOf('try') > beforeMatch.lastIndexOf('}') &&
        afterMatch.indexOf('catch') < afterMatch.indexOf('try');

      if (!inTryCatch) {
        issues.push({
          id: `async-no-error-handling-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'blocking-operation',
          severity: 'low',
          title: 'Async Operation Without Error Handling',
          description: 'Async operation lacks proper error handling',
          file: filePath,
          line: lineNumber,
          column: match.index - sourceCode.lastIndexOf('\n', match.index - 1) - 1,
          code: lines[lineNumber - 1] || '',
          impact: 'cpu',
          estimatedSavings: {
            time: 'Prevents unhandled promise rejections'
          },
          recommendation: 'Add try-catch block or .catch() handler',
          confidence: 0.6
        });
      }
    }

    return issues;
  }

  private async detectBundleIssues(
    sourceCode: string,
    sourceFile: ts.SourceFile | null,
    filePath: string
  ): Promise<PerformanceIssue[]> {
    const issues: PerformanceIssue[] = [];
    const lines = sourceCode.split('\n');

    // Detect large library imports
    const largeLibraryPattern = /import\s+.*\s+from\s+['"`](lodash|moment|jquery|three|d3)['"`]/g;
    let match;
    while ((match = largeLibraryPattern.exec(sourceCode)) !== null) {
      const lineNumber = sourceCode.substring(0, match.index).split('\n').length;
      const libraryName = match[1];

      issues.push({
        id: `large-library-${libraryName}-${Date.now()}`,
        type: 'large-bundle',
        severity: 'medium',
        title: `Large Library Import: ${libraryName}`,
        description: `Importing entire ${libraryName} library increases bundle size`,
        file: filePath,
        line: lineNumber,
        column: match.index - sourceCode.lastIndexOf('\n', match.index - 1) - 1,
        code: lines[lineNumber - 1] || '',
        impact: 'bundle-size',
        estimatedSavings: {
          bundleSize: this.getLibrarySavings(libraryName)
        },
        recommendation: `Use tree-shaking or import specific functions: import { function } from '${libraryName}'`,
        confidence: 0.8
      });
    }

    // Detect unused imports
    const importPattern = /import\s+(?:\{([^}]+)\}|(\w+))\s+from\s+['"`]([^'"`]+)['"`]/g;
    const imports: { names: string[], line: number, module: string }[] = [];

    while ((match = importPattern.exec(sourceCode)) !== null) {
      const lineNumber = sourceCode.substring(0, match.index).split('\n').length;
      const importedNames = match[1] ?
        match[1].split(',').map(name => name.trim()) :
        [match[2]];

      imports.push({
        names: importedNames,
        line: lineNumber,
        module: match[3]
      });
    }

    // Check if imports are used
    for (const importItem of imports) {
      const unusedImports = importItem.names.filter(name => {
        const usagePattern = new RegExp(`\\b${name}\\b`, 'g');
        const matches = sourceCode.match(usagePattern) || [];
        return matches.length <= 1; // Only the import statement itself
      });

      if (unusedImports.length > 0) {
        issues.push({
          id: `unused-import-${importItem.module}-${Date.now()}`,
          type: 'unused-code',
          severity: 'low',
          title: 'Unused Import',
          description: `Unused imports: ${unusedImports.join(', ')} from ${importItem.module}`,
          file: filePath,
          line: importItem.line,
          column: 0,
          code: lines[importItem.line - 1] || '',
          impact: 'bundle-size',
          estimatedSavings: {
            bundleSize: 'Reduces bundle size by removing dead code'
          },
          recommendation: 'Remove unused imports or add to eslint rules for automatic detection',
          confidence: 0.85
        });
      }
    }

    return issues;
  }

  private calculateMetrics(sourceCode: string, sourceFile: ts.SourceFile | null): PerformanceMetrics {
    const lines = sourceCode.split('\n');

    // Count various code elements
    const functionCount = (sourceCode.match(/function\s+\w+|=>\s*{|\w+\s*:\s*(?:async\s+)?function/g) || []).length;
    const classCount = (sourceCode.match(/class\s+\w+/g) || []).length;
    const asyncOperations = (sourceCode.match(/await\s+/g) || []).length;
    const syncOperations = (sourceCode.match(/\.sync\(|Sync\(/g) || []).length;
    const loopCount = (sourceCode.match(/(?:for|while)\s*\(/g) || []).length;

    // Calculate complexity
    const cyclomaticComplexity = this.calculateCyclomaticComplexity(sourceCode);
    const cognitiveComplexity = this.calculateCognitiveComplexity(sourceCode);

    // Analyze callback depth
    const callbackDepth = this.calculateCallbackDepth(sourceCode);

    // Memory analysis
    const memoryHotspots = (sourceCode.match(/new\s+(?:Array|Object|Map|Set|WeakMap|WeakSet)/g) || []).length;
    const potentialMemoryLeaks = (sourceCode.match(/addEventListener|setInterval|setTimeout/g) || []).length;

    // Bundle analysis
    const unusedExports = this.countUnusedExports(sourceCode);
    const bundleEstimate = this.estimateBundleSize(sourceCode);

    return {
      cyclomaticComplexity,
      cognitiveComplexity,
      linesOfCode: lines.length,
      functionCount,
      classCount,
      asyncOperations,
      syncOperations,
      loopCount,
      callbackDepth,
      memoryHotspots,
      potentialMemoryLeaks,
      unusedExports,
      bundleEstimate
    };
  }

  private generateRecommendations(
    issues: PerformanceIssue[],
    metrics: PerformanceMetrics
  ): PerformanceRecommendation[] {
    const recommendations: PerformanceRecommendation[] = [];

    // High-impact optimizations
    if (issues.some(i => i.type === 'bottleneck' && i.severity === 'high')) {
      recommendations.push({
        id: 'optimize-algorithms',
        category: 'optimization',
        priority: 'high',
        title: 'Optimize Algorithm Complexity',
        description: 'Replace inefficient algorithms with optimized alternatives',
        implementation: 'Use hash maps for lookups, avoid nested loops, implement binary search',
        estimatedImpact: {
          performance: 9,
          complexity: 6,
          timeToImplement: '2-4 hours'
        },
        codeExample: `
// Instead of:
for (const item of array1) {
  for (const item2 of array2) {
    if (item.id === item2.id) {
      // process
    }
  }
}

// Use:
const map = new Map(array2.map(item => [item.id, item]));
for (const item of array1) {
  const match = map.get(item.id);
  if (match) {
    // process
  }
}
        `
      });
    }

    // Memory optimizations
    if (issues.some(i => i.type === 'memory-leak')) {
      recommendations.push({
        id: 'fix-memory-leaks',
        category: 'optimization',
        priority: 'high',
        title: 'Fix Memory Leaks',
        description: 'Add proper cleanup for event listeners and references',
        implementation: 'Implement cleanup functions, use WeakMap/WeakSet, remove event listeners',
        estimatedImpact: {
          performance: 8,
          complexity: 4,
          timeToImplement: '1-2 hours'
        }
      });
    }

    // Async optimizations
    if (issues.some(i => i.type === 'blocking-operation')) {
      recommendations.push({
        id: 'parallel-async',
        category: 'optimization',
        priority: 'medium',
        title: 'Parallelize Async Operations',
        description: 'Execute independent async operations in parallel',
        implementation: 'Use Promise.all() for parallel execution',
        estimatedImpact: {
          performance: 7,
          complexity: 3,
          timeToImplement: '30-60 minutes'
        },
        codeExample: `
// Instead of:
const result1 = await fetchData1();
const result2 = await fetchData2();

// Use:
const [result1, result2] = await Promise.all([
  fetchData1(),
  fetchData2()
]);
        `
      });
    }

    // Bundle size optimizations
    if (issues.some(i => i.type === 'large-bundle' || i.type === 'unused-code')) {
      recommendations.push({
        id: 'optimize-bundle',
        category: 'bundling',
        priority: 'medium',
        title: 'Optimize Bundle Size',
        description: 'Reduce bundle size through tree-shaking and code splitting',
        implementation: 'Remove unused imports, use specific imports, implement code splitting',
        estimatedImpact: {
          performance: 6,
          complexity: 5,
          timeToImplement: '2-3 hours'
        }
      });
    }

    return recommendations;
  }

  private generateProjectRecommendations(
    issues: PerformanceIssue[],
    metrics: PerformanceMetrics
  ): PerformanceRecommendation[] {
    const recommendations = this.generateRecommendations(issues, metrics);

    // Add project-level recommendations
    if (metrics.cyclomaticComplexity > 50) {
      recommendations.push({
        id: 'refactor-complexity',
        category: 'refactoring',
        priority: 'high',
        title: 'Reduce Code Complexity',
        description: 'Break down complex functions into smaller, more manageable pieces',
        implementation: 'Extract functions, simplify conditional logic, use design patterns',
        estimatedImpact: {
          performance: 7,
          complexity: 8,
          timeToImplement: '1-2 days'
        }
      });
    }

    return recommendations;
  }

  private generateSummary(
    issues: PerformanceIssue[],
    metrics: PerformanceMetrics,
    recommendations: PerformanceRecommendation[]
  ): PerformanceSummary {
    const criticalIssues = issues.filter(i => i.severity === 'critical').length;
    const highIssues = issues.filter(i => i.severity === 'high').length;
    const mediumIssues = issues.filter(i => i.severity === 'medium').length;
    const lowIssues = issues.filter(i => i.severity === 'low').length;

    // Calculate overall score (0-100)
    const maxScore = 100;
    const penalties = {
      critical: 25,
      high: 10,
      medium: 5,
      low: 2
    };

    const totalPenalty =
      criticalIssues * penalties.critical +
      highIssues * penalties.high +
      mediumIssues * penalties.medium +
      lowIssues * penalties.low;

    const overallScore = Math.max(0, maxScore - totalPenalty);

    // Calculate category scores
    const categoryScores = {
      cpu: this.calculateCategoryScore(issues.filter(i => i.impact === 'cpu')),
      memory: this.calculateCategoryScore(issues.filter(i => i.impact === 'memory')),
      network: this.calculateCategoryScore(issues.filter(i => i.impact === 'network')),
      bundleSize: this.calculateCategoryScore(issues.filter(i => i.impact === 'bundle-size'))
    };

    return {
      overallScore,
      categoryScores,
      criticalIssues,
      highIssues,
      mediumIssues,
      lowIssues,
      topRecommendations: recommendations.slice(0, 3)
    };
  }

  // Helper methods
  private calculateCyclomaticComplexity(code: string): number {
    const complexityKeywords = ['if', 'else if', 'for', 'while', 'switch', 'case', 'catch', '&&', '||', '?'];

    return complexityKeywords.reduce((complexity, keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      const matches = code.match(regex);
      return complexity + (matches ? matches.length : 0);
    }, 1);
  }

  private calculateCognitiveComplexity(code: string): number {
    // Simplified cognitive complexity calculation
    let complexity = 0;
    const lines = code.split('\n');
    let nestingLevel = 0;

    for (const line of lines) {
      const trimmed = line.trim();

      // Increase nesting
      if (trimmed.includes('{')) nestingLevel++;
      if (trimmed.includes('}')) nestingLevel = Math.max(0, nestingLevel - 1);

      // Add complexity for cognitive load
      if (trimmed.includes('if') || trimmed.includes('for') || trimmed.includes('while')) {
        complexity += 1 + nestingLevel;
      }
      if (trimmed.includes('&&') || trimmed.includes('||')) {
        complexity += 1;
      }
    }

    return complexity;
  }

  private calculateCallbackDepth(code: string): number {
    let maxDepth = 0;
    let currentDepth = 0;

    for (let i = 0; i < code.length; i++) {
      if (code.substring(i).startsWith('function(') || code.substring(i).startsWith('=>')) {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      } else if (code[i] === '}') {
        currentDepth = Math.max(0, currentDepth - 1);
      }
    }

    return maxDepth;
  }

  private countUnusedExports(code: string): number {
    const exportPattern = /export\s+(?:const|let|var|function|class)\s+(\w+)/g;
    const exports = new Set<string>();
    let match;

    while ((match = exportPattern.exec(code)) !== null) {
      exports.add(match[1]);
    }

    let unusedCount = 0;
    for (const exportName of exports) {
      const usagePattern = new RegExp(`\\b${exportName}\\b`, 'g');
      const matches = code.match(usagePattern) || [];
      if (matches.length <= 1) { // Only the export declaration itself
        unusedCount++;
      }
    }

    return unusedCount;
  }

  private estimateBundleSize(code: string): { size: number; gzipSize: number; treeshakeable: boolean } {
    const size = Buffer.byteLength(code, 'utf8');
    const gzipSize = Math.floor(size * 0.3); // Rough gzip estimation
    const treeshakeable = code.includes('export') && !code.includes('export default');

    return { size, gzipSize, treeshakeable };
  }

  private getLibrarySavings(libraryName: string): string {
    const savings: Record<string, string> = {
      'lodash': '70KB (use lodash-es or specific functions)',
      'moment': '68KB (use date-fns or native Date)',
      'jquery': '87KB (use native DOM API)',
      'three': '600KB (use selective imports)',
      'd3': '250KB (use modular d3 packages)'
    };

    return savings[libraryName] || 'Size reduction varies';
  }

  private calculateCategoryScore(issues: PerformanceIssue[]): number {
    if (issues.length === 0) return 100;

    const penalties = { critical: 25, high: 10, medium: 5, low: 2 };
    const totalPenalty = issues.reduce((sum, issue) =>
      sum + penalties[issue.severity], 0
    );

    return Math.max(0, 100 - totalPenalty);
  }

  private getSeverityWeight(severity: string): number {
    const weights = { critical: 4, high: 3, medium: 2, low: 1 };
    return weights[severity as keyof typeof weights] || 0;
  }

  private getPriorityWeight(priority: string): number {
    const weights = { critical: 4, high: 3, medium: 2, low: 1 };
    return weights[priority as keyof typeof weights] || 0;
  }

  private aggregateMetrics(allMetrics: PerformanceMetrics[]): PerformanceMetrics {
    if (allMetrics.length === 0) {
      return {
        cyclomaticComplexity: 0,
        cognitiveComplexity: 0,
        linesOfCode: 0,
        functionCount: 0,
        classCount: 0,
        asyncOperations: 0,
        syncOperations: 0,
        loopCount: 0,
        callbackDepth: 0,
        memoryHotspots: 0,
        potentialMemoryLeaks: 0,
        unusedExports: 0,
        bundleEstimate: { size: 0, gzipSize: 0, treeshakeable: false }
      };
    }

    return allMetrics.reduce((agg, metrics) => ({
      cyclomaticComplexity: agg.cyclomaticComplexity + metrics.cyclomaticComplexity,
      cognitiveComplexity: agg.cognitiveComplexity + metrics.cognitiveComplexity,
      linesOfCode: agg.linesOfCode + metrics.linesOfCode,
      functionCount: agg.functionCount + metrics.functionCount,
      classCount: agg.classCount + metrics.classCount,
      asyncOperations: agg.asyncOperations + metrics.asyncOperations,
      syncOperations: agg.syncOperations + metrics.syncOperations,
      loopCount: agg.loopCount + metrics.loopCount,
      callbackDepth: Math.max(agg.callbackDepth, metrics.callbackDepth),
      memoryHotspots: agg.memoryHotspots + metrics.memoryHotspots,
      potentialMemoryLeaks: agg.potentialMemoryLeaks + metrics.potentialMemoryLeaks,
      unusedExports: agg.unusedExports + metrics.unusedExports,
      bundleEstimate: {
        size: agg.bundleEstimate.size + metrics.bundleEstimate.size,
        gzipSize: agg.bundleEstimate.gzipSize + metrics.bundleEstimate.gzipSize,
        treeshakeable: agg.bundleEstimate.treeshakeable && metrics.bundleEstimate.treeshakeable
      }
    }));
  }

  private async findSourceFiles(projectPath: string): Promise<string[]> {
    const fs = await import('fs/promises');
    const path = await import('path');

    const files: string[] = [];
    const extensions = ['.js', '.ts', '.jsx', '.tsx', '.vue'];

    const walkDir = async (dir: string) => {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await walkDir(fullPath);
        } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    };

    await walkDir(projectPath);
    return files;
  }

  private detectLanguage(filePath: string): string {
    const path = require('path');
    const ext = path.extname(filePath).toLowerCase();
    const languageMap: Record<string, string> = {
      '.js': 'javascript',
      '.ts': 'typescript',
      '.jsx': 'jsx',
      '.tsx': 'tsx',
      '.vue': 'vue'
    };

    return languageMap[ext] || 'javascript';
  }

  private updateStatistics(result: PerformanceResult): void {
    this.statistics.filesAnalyzed++;
    this.statistics.issuesFound += result.issues.length;
    this.statistics.averagePerformanceScore =
      (this.statistics.averagePerformanceScore + result.summary.overallScore) / 2;
  }

  // Performance rule definitions
  private getBottleneckRules(): PerformanceRule[] {
    return [
      {
        id: 'nested-loops',
        name: 'Nested Loops',
        pattern: /for\s*\([^)]*\)\s*\{[^}]*for\s*\([^)]*\)/gs,
        severity: 'high',
        description: 'Nested loops cause quadratic time complexity',
        recommendation: 'Use hash maps or optimize algorithm',
        category: 'cpu'
      }
    ];
  }

  private getMemoryRules(): PerformanceRule[] {
    return [
      {
        id: 'event-listener-leak',
        name: 'Event Listener Memory Leak',
        pattern: /addEventListener.*(?!.*removeEventListener)/gs,
        severity: 'high',
        description: 'Event listeners without cleanup cause memory leaks',
        recommendation: 'Add removeEventListener in cleanup code',
        category: 'memory'
      }
    ];
  }

  private getAsyncRules(): PerformanceRule[] {
    return [
      {
        id: 'sequential-async',
        name: 'Sequential Async Operations',
        pattern: /await\s+[^;]+;\s*\n\s*await\s+[^;]+;/gs,
        severity: 'medium',
        description: 'Independent async operations executed sequentially',
        recommendation: 'Use Promise.all() for parallel execution',
        category: 'network'
      }
    ];
  }

  private getBundleRules(): PerformanceRule[] {
    return [
      {
        id: 'large-library-import',
        name: 'Large Library Import',
        pattern: /import\s+.*\s+from\s+['"`](lodash|moment|jquery)['"`]/g,
        severity: 'medium',
        description: 'Importing large libraries increases bundle size',
        recommendation: 'Use tree-shaking or specific imports',
        category: 'bundle'
      }
    ];
  }

  /**
   * Get analyzer statistics
   */
  getStatistics() {
    return { ...this.statistics };
  }
}
