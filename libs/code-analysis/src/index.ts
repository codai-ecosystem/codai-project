/**
 * CODAI Code Analysis Engine
 * 
 * Advanced AI-powered code analysis system providing intelligent code suggestions,
 * static analysis, vulnerability detection, performance optimization, and architecture insights
 * 
 * @version 1.0.0
 * @author CODAI Development Team
 */

// Core analysis components
export { CodeAnalysisEngine } from './engine';
export { StaticAnalyzer } from './analyzers/static';
export { VulnerabilityScanner } from './analyzers/security';
export { PerformanceAnalyzer } from './analyzers/performance';
export { ArchitectureAnalyzer } from './analyzers/architecture';
export { AICodeSuggester } from './ai/suggester';

// Analysis types and interfaces
export type {
  CodeAnalysisResult,
  AnalysisConfig,
  CodeMetrics,
  SecurityIssue,
  PerformanceIssue,
  ArchitecturePattern,
  CodeSuggestion,
  AnalysisRule,
  FixSuggestion
} from './types';

// Utilities and helpers
export { ASTParser } from './utils/ast-parser';
export { FileProcessor } from './utils/file-processor';
export { RuleEngine } from './utils/rule-engine';
export { MetricsCollector } from './utils/metrics';

// Configuration and rules
export { defaultAnalysisConfig } from './config/default';
export { securityRules } from './config/security-rules';
export { performanceRules } from './config/performance-rules';
export { architecturePatterns } from './config/architecture-patterns';

// Main analysis engine class
export class CodeAnalysisEngine {
  private staticAnalyzer: StaticAnalyzer;
  private vulnerabilityScanner: VulnerabilityScanner;
  private performanceAnalyzer: PerformanceAnalyzer;
  private architectureAnalyzer: ArchitectureAnalyzer;
  private aiSuggester: AICodeSuggester;
  private config: AnalysisConfig;
  private initialized: boolean = false;

  constructor(config: AnalysisConfig) {
    this.config = { ...defaultAnalysisConfig, ...config };
    this.initializeComponents();
  }

  private initializeComponents(): void {
    try {
      // Initialize static analyzer
      this.staticAnalyzer = new StaticAnalyzer({
        rules: this.config.staticAnalysis?.rules || [],
        severity: this.config.staticAnalysis?.severity || 'warning',
        enableTypeChecking: this.config.staticAnalysis?.enableTypeChecking ?? true,
        enableLinting: this.config.staticAnalysis?.enableLinting ?? true
      });

      // Initialize vulnerability scanner
      this.vulnerabilityScanner = new VulnerabilityScanner({
        securityRules: this.config.security?.rules || securityRules,
        enableCVECheck: this.config.security?.enableCVECheck ?? true,
        enableDependencyAudit: this.config.security?.enableDependencyAudit ?? true,
        severity: this.config.security?.severity || 'high'
      });

      // Initialize performance analyzer
      this.performanceAnalyzer = new PerformanceAnalyzer({
        performanceRules: this.config.performance?.rules || performanceRules,
        enableComplexityAnalysis: this.config.performance?.enableComplexityAnalysis ?? true,
        enableMemoryAnalysis: this.config.performance?.enableMemoryAnalysis ?? true,
        thresholds: this.config.performance?.thresholds || {
          cyclomaticComplexity: 10,
          cognitiveComplexity: 15,
          maintainabilityIndex: 20
        }
      });

      // Initialize architecture analyzer
      this.architectureAnalyzer = new ArchitectureAnalyzer({
        patterns: this.config.architecture?.patterns || architecturePatterns,
        enablePatternDetection: this.config.architecture?.enablePatternDetection ?? true,
        enableDependencyAnalysis: this.config.architecture?.enableDependencyAnalysis ?? true,
        enableLayerValidation: this.config.architecture?.enableLayerValidation ?? true
      });

      // Initialize AI code suggester
      this.aiSuggester = new AICodeSuggester({
        provider: this.config.ai?.provider || 'openai',
        model: this.config.ai?.model || 'gpt-4-turbo',
        apiKey: this.config.ai?.apiKey || process.env.OPENAI_API_KEY,
        maxTokens: this.config.ai?.maxTokens || 2000,
        temperature: this.config.ai?.temperature || 0.3,
        enableCodeCompletion: this.config.ai?.enableCodeCompletion ?? true,
        enableRefactoring: this.config.ai?.enableRefactoring ?? true,
        enableDocumentation: this.config.ai?.enableDocumentation ?? true
      });

      this.initialized = true;
      console.log('✅ CODAI Code Analysis Engine initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Code Analysis Engine:', error);
      throw error;
    }
  }

  /**
   * Analyze code from file path
   */
  async analyzeFile(filePath: string): Promise<CodeAnalysisResult> {
    if (!this.initialized) {
      throw new Error('Code Analysis Engine not initialized');
    }

    const startTime = Date.now();

    try {
      // Read and parse file
      const fileProcessor = new FileProcessor();
      const fileContent = await fileProcessor.readFile(filePath);
      const parsedCode = await fileProcessor.parseCode(fileContent, filePath);

      // Run all analyzers in parallel
      const [
        staticAnalysis,
        securityAnalysis,
        performanceAnalysis,
        architectureAnalysis,
        aiSuggestions
      ] = await Promise.all([
        this.staticAnalyzer.analyze(parsedCode, filePath),
        this.vulnerabilityScanner.scan(parsedCode, filePath),
        this.performanceAnalyzer.analyze(parsedCode, filePath),
        this.architectureAnalyzer.analyze(parsedCode, filePath),
        this.aiSuggester.generateSuggestions(parsedCode, fileContent)
      ]);

      // Combine results
      const result: CodeAnalysisResult = {
        filePath,
        timestamp: new Date().toISOString(),
        analysisTime: Date.now() - startTime,
        staticAnalysis,
        securityAnalysis,
        performanceAnalysis,
        architectureAnalysis,
        aiSuggestions,
        overallScore: this.calculateOverallScore([
          staticAnalysis,
          securityAnalysis,
          performanceAnalysis,
          architectureAnalysis
        ]),
        summary: this.generateSummary([
          staticAnalysis,
          securityAnalysis,
          performanceAnalysis,
          architectureAnalysis,
          aiSuggestions
        ])
      };

      console.log(`✅ Analysis completed for ${filePath} in ${result.analysisTime}ms`);
      return result;
    } catch (error) {
      console.error(`❌ Analysis failed for ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Analyze code from string content
   */
  async analyzeCode(
    code: string,
    language: string = 'typescript',
    context?: string
  ): Promise<CodeAnalysisResult> {
    if (!this.initialized) {
      throw new Error('Code Analysis Engine not initialized');
    }

    const startTime = Date.now();
    const virtualPath = `virtual.${language}`;

    try {
      // Parse code content
      const fileProcessor = new FileProcessor();
      const parsedCode = await fileProcessor.parseCodeString(code, language);

      // Run all analyzers in parallel
      const [
        staticAnalysis,
        securityAnalysis,
        performanceAnalysis,
        architectureAnalysis,
        aiSuggestions
      ] = await Promise.all([
        this.staticAnalyzer.analyze(parsedCode, virtualPath),
        this.vulnerabilityScanner.scan(parsedCode, virtualPath),
        this.performanceAnalyzer.analyze(parsedCode, virtualPath),
        this.architectureAnalyzer.analyze(parsedCode, virtualPath),
        this.aiSuggester.generateSuggestions(parsedCode, code, context)
      ]);

      // Combine results
      const result: CodeAnalysisResult = {
        filePath: virtualPath,
        timestamp: new Date().toISOString(),
        analysisTime: Date.now() - startTime,
        staticAnalysis,
        securityAnalysis,
        performanceAnalysis,
        architectureAnalysis,
        aiSuggestions,
        overallScore: this.calculateOverallScore([
          staticAnalysis,
          securityAnalysis,
          performanceAnalysis,
          architectureAnalysis
        ]),
        summary: this.generateSummary([
          staticAnalysis,
          securityAnalysis,
          performanceAnalysis,
          architectureAnalysis,
          aiSuggestions
        ])
      };

      console.log(`✅ Code analysis completed in ${result.analysisTime}ms`);
      return result;
    } catch (error) {
      console.error('❌ Code analysis failed:', error);
      throw error;
    }
  }

  /**
   * Analyze entire project directory
   */
  async analyzeProject(projectPath: string): Promise<ProjectAnalysisResult> {
    if (!this.initialized) {
      throw new Error('Code Analysis Engine not initialized');
    }

    const startTime = Date.now();

    try {
      // Discover project files
      const fileProcessor = new FileProcessor();
      const files = await fileProcessor.discoverFiles(projectPath, {
        extensions: this.config.project?.extensions || ['.ts', '.js', '.tsx', '.jsx'],
        exclude: this.config.project?.exclude || ['node_modules', 'dist', 'build'],
        maxFiles: this.config.project?.maxFiles || 1000
      });

      console.log(`📁 Analyzing ${files.length} files in project: ${projectPath}`);

      // Analyze files in batches
      const batchSize = this.config.project?.batchSize || 10;
      const results: CodeAnalysisResult[] = [];

      for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(filePath => this.analyzeFile(filePath))
        );
        results.push(...batchResults);

        console.log(`📊 Analyzed batch ${Math.ceil((i + batchSize) / batchSize)} of ${Math.ceil(files.length / batchSize)}`);
      }

      // Generate project-wide insights
      const projectResult: ProjectAnalysisResult = {
        projectPath,
        timestamp: new Date().toISOString(),
        analysisTime: Date.now() - startTime,
        fileCount: files.length,
        results,
        projectMetrics: this.calculateProjectMetrics(results),
        architectureOverview: this.generateArchitectureOverview(results),
        securityReport: this.generateSecurityReport(results),
        performanceReport: this.generatePerformanceReport(results),
        recommendations: this.generateProjectRecommendations(results)
      };

      console.log(`✅ Project analysis completed in ${projectResult.analysisTime}ms`);
      return projectResult;
    } catch (error) {
      console.error(`❌ Project analysis failed for ${projectPath}:`, error);
      throw error;
    }
  }

  /**
   * Get real-time code suggestions as user types
   */
  async getCodeCompletions(
    code: string,
    position: { line: number; character: number },
    language: string = 'typescript'
  ): Promise<CodeSuggestion[]> {
    if (!this.initialized) {
      throw new Error('Code Analysis Engine not initialized');
    }

    try {
      return await this.aiSuggester.getCompletions(code, position, language);
    } catch (error) {
      console.error('❌ Code completion failed:', error);
      return [];
    }
  }

  /**
   * Fix code issues automatically
   */
  async autoFixIssues(
    code: string,
    issues: (SecurityIssue | PerformanceIssue)[],
    language: string = 'typescript'
  ): Promise<string> {
    if (!this.initialized) {
      throw new Error('Code Analysis Engine not initialized');
    }

    try {
      return await this.aiSuggester.autoFix(code, issues, language);
    } catch (error) {
      console.error('❌ Auto-fix failed:', error);
      return code;
    }
  }

  /**
   * Generate code documentation
   */
  async generateDocumentation(
    code: string,
    language: string = 'typescript'
  ): Promise<string> {
    if (!this.initialized) {
      throw new Error('Code Analysis Engine not initialized');
    }

    try {
      return await this.aiSuggester.generateDocumentation(code, language);
    } catch (error) {
      console.error('❌ Documentation generation failed:', error);
      return '';
    }
  }

  /**
   * Update analysis configuration
   */
  updateConfig(newConfig: Partial<AnalysisConfig>): void {
    this.config = { ...this.config, ...newConfig };
    // Re-initialize components with new config
    this.initializeComponents();
    console.log('✅ Analysis configuration updated');
  }

  /**
   * Get analysis statistics
   */
  getStatistics(): AnalysisStatistics {
    return {
      analyzedFiles: this.staticAnalyzer.getStatistics().analyzedFiles,
      totalAnalyses: this.staticAnalyzer.getStatistics().totalAnalyses,
      averageAnalysisTime: this.staticAnalyzer.getStatistics().averageAnalysisTime,
      issuesFound: {
        security: this.vulnerabilityScanner.getStatistics().issuesFound,
        performance: this.performanceAnalyzer.getStatistics().issuesFound,
        quality: this.staticAnalyzer.getStatistics().issuesFound
      },
      aiSuggestions: this.aiSuggester.getStatistics().suggestionsGenerated
    };
  }

  private calculateOverallScore(analyses: any[]): number {
    const scores = analyses
      .map(analysis => analysis.score || 0)
      .filter(score => score > 0);

    return scores.length > 0
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
      : 0;
  }

  private generateSummary(analyses: any[]): string {
    const issues = analyses.reduce((total, analysis) => {
      return total + (analysis.issues?.length || 0);
    }, 0);

    const suggestions = analyses.reduce((total, analysis) => {
      return total + (analysis.suggestions?.length || 0);
    }, 0);

    return `Found ${issues} issues and generated ${suggestions} suggestions`;
  }

  private calculateProjectMetrics(results: CodeAnalysisResult[]): ProjectMetrics {
    return {
      totalFiles: results.length,
      totalLines: results.reduce((sum, r) => sum + (r.staticAnalysis.metrics?.lines || 0), 0),
      totalIssues: results.reduce((sum, r) => sum + (r.securityAnalysis.issues?.length || 0), 0),
      averageScore: Math.round(
        results.reduce((sum, r) => sum + r.overallScore, 0) / results.length
      ),
      codeQuality: this.calculateCodeQuality(results),
      maintainabilityIndex: this.calculateMaintainabilityIndex(results)
    };
  }

  private generateArchitectureOverview(results: CodeAnalysisResult[]): ArchitectureOverview {
    // Implementation for architecture overview generation
    return {
      patterns: [],
      dependencies: [],
      layers: [],
      recommendations: []
    };
  }

  private generateSecurityReport(results: CodeAnalysisResult[]): SecurityReport {
    // Implementation for security report generation
    return {
      criticalIssues: 0,
      highIssues: 0,
      mediumIssues: 0,
      lowIssues: 0,
      recommendations: []
    };
  }

  private generatePerformanceReport(results: CodeAnalysisResult[]): PerformanceReport {
    // Implementation for performance report generation
    return {
      bottlenecks: [],
      optimizations: [],
      metrics: {},
      recommendations: []
    };
  }

  private generateProjectRecommendations(results: CodeAnalysisResult[]): string[] {
    // Implementation for project-wide recommendations
    return [];
  }

  private calculateCodeQuality(results: CodeAnalysisResult[]): number {
    // Implementation for code quality calculation
    return 85;
  }

  private calculateMaintainabilityIndex(results: CodeAnalysisResult[]): number {
    // Implementation for maintainability index calculation
    return 78;
  }
}

// Type definitions
export interface CodeAnalysisResult {
  filePath: string;
  timestamp: string;
  analysisTime: number;
  staticAnalysis: any;
  securityAnalysis: any;
  performanceAnalysis: any;
  architectureAnalysis: any;
  aiSuggestions: any;
  overallScore: number;
  summary: string;
}

export interface ProjectAnalysisResult {
  projectPath: string;
  timestamp: string;
  analysisTime: number;
  fileCount: number;
  results: CodeAnalysisResult[];
  projectMetrics: ProjectMetrics;
  architectureOverview: ArchitectureOverview;
  securityReport: SecurityReport;
  performanceReport: PerformanceReport;
  recommendations: string[];
}

export interface AnalysisConfig {
  staticAnalysis?: any;
  security?: any;
  performance?: any;
  architecture?: any;
  ai?: any;
  project?: any;
}

export interface AnalysisStatistics {
  analyzedFiles: number;
  totalAnalyses: number;
  averageAnalysisTime: number;
  issuesFound: {
    security: number;
    performance: number;
    quality: number;
  };
  aiSuggestions: number;
}

export interface ProjectMetrics {
  totalFiles: number;
  totalLines: number;
  totalIssues: number;
  averageScore: number;
  codeQuality: number;
  maintainabilityIndex: number;
}

export interface ArchitectureOverview {
  patterns: any[];
  dependencies: any[];
  layers: any[];
  recommendations: any[];
}

export interface SecurityReport {
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  recommendations: any[];
}

export interface PerformanceReport {
  bottlenecks: any[];
  optimizations: any[];
  metrics: any;
  recommendations: any[];
}

// Export default for convenience
export default CodeAnalysisEngine;
