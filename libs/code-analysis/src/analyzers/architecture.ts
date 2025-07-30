/**
 * CODAI Architecture Analyzer
 * 
 * Advanced architectural pattern detection and analysis
 * Evaluates code structure, dependencies, and architectural quality
 */

import * as ts from 'typescript';
import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface ArchitectureConfig {
  enablePatternDetection: boolean;
  enableDependencyAnalysis: boolean;
  enableLayerValidation: boolean;
  enableAntiPatternDetection: boolean;
  architecturalStyles: ArchitecturalStyle[];
  customPatterns?: ArchitecturalPattern[];
  dependencyRules?: DependencyRule[];
}

export interface ArchitecturalStyle {
  name: string;
  patterns: string[];
  constraints: string[];
  benefits: string[];
}

export interface ArchitecturalPattern {
  id: string;
  name: string;
  type: 'design' | 'architectural' | 'integration';
  indicators: RegExp[];
  benefits: string[];
  drawbacks: string[];
  alternatives: string[];
}

export interface DependencyRule {
  id: string;
  description: string;
  fromLayer: string;
  toLayer: string;
  allowed: boolean;
  severity: 'error' | 'warning' | 'info';
}

export interface ArchitectureResult {
  patterns: DetectedPattern[];
  dependencies: DependencyAnalysis;
  layerViolations: LayerViolation[];
  antiPatterns: AntiPattern[];
  metrics: ArchitecturalMetrics;
  recommendations: ArchitecturalRecommendation[];
  summary: ArchitectureSummary;
  processing_time: number;
}

export interface DetectedPattern {
  id: string;
  name: string;
  type: 'design' | 'architectural' | 'integration';
  confidence: number;
  locations: PatternLocation[];
  description: string;
  benefits: string[];
  implementation_quality: 'excellent' | 'good' | 'fair' | 'poor';
  suggestions: string[];
}

export interface PatternLocation {
  file: string;
  line: number;
  column: number;
  code: string;
  context: string;
}

export interface DependencyAnalysis {
  graph: DependencyGraph;
  cycles: CircularDependency[];
  coupling: CouplingMetrics;
  cohesion: CohesionMetrics;
  stability: StabilityMetrics;
}

export interface DependencyGraph {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
  layers: string[];
  clusters: DependencyCluster[];
}

export interface DependencyNode {
  id: string;
  name: string;
  type: 'module' | 'class' | 'function' | 'component';
  layer: string;
  incoming: number;
  outgoing: number;
  size: number;
}

export interface DependencyEdge {
  from: string;
  to: string;
  type: 'import' | 'call' | 'inheritance' | 'composition';
  weight: number;
}

export interface DependencyCluster {
  id: string;
  name: string;
  nodes: string[];
  cohesion: number;
  coupling: number;
}

export interface CircularDependency {
  id: string;
  cycle: string[];
  severity: 'low' | 'medium' | 'high';
  impact: string;
  resolution: string;
}

export interface CouplingMetrics {
  afferent: number; // Ca - incoming dependencies
  efferent: number; // Ce - outgoing dependencies
  instability: number; // I = Ce / (Ca + Ce)
  abstractness: number; // A = abstract classes / total classes
  distance: number; // D = |A + I - 1|
}

export interface CohesionMetrics {
  lcom: number; // Lack of Cohesion of Methods
  cohesiveRatio: number;
  functionalCohesion: number;
}

export interface StabilityMetrics {
  stability: number;
  volatility: number;
  changeImpact: number;
}

export interface LayerViolation {
  id: string;
  type: 'dependency' | 'access' | 'circular';
  severity: 'error' | 'warning';
  description: string;
  fromLayer: string;
  toLayer: string;
  file: string;
  line: number;
  resolution: string;
}

export interface AntiPattern {
  id: string;
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  locations: PatternLocation[];
  impact: string;
  refactoring: string;
  examples: string[];
}

export interface ArchitecturalMetrics {
  maintainabilityIndex: number;
  technicalDebt: number;
  architecturalComplexity: number;
  designQuality: number;
  testability: number;
  modularity: number;
  reusability: number;
  flexibility: number;
}

export interface ArchitecturalRecommendation {
  id: string;
  category: 'structure' | 'patterns' | 'dependencies' | 'quality';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  benefits: string[];
  implementation: string;
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
}

export interface ArchitectureSummary {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  riskAreas: string[];
  improvementOpportunities: string[];
  architecturalStyle: string;
  complexity: 'low' | 'medium' | 'high' | 'very-high';
  maintainability: 'excellent' | 'good' | 'fair' | 'poor';
}

export class ArchitectureAnalyzer extends EventEmitter {
  private config: ArchitectureConfig;
  private knownPatterns: ArchitecturalPattern[] = [];
  private statistics = {
    projectsAnalyzed: 0,
    patternsDetected: 0,
    antiPatternsFound: 0,
    violationsDetected: 0,
    averageScore: 0,
    lastAnalysisDate: new Date()
  };

  constructor(config: ArchitectureConfig) {
    super();
    this.config = config;
    this.initializePatterns();
  }

  private initializePatterns(): void {
    this.knownPatterns = [
      ...this.getDesignPatterns(),
      ...this.getArchitecturalPatterns(),
      ...this.getIntegrationPatterns(),
      ...(this.config.customPatterns || [])
    ];

    console.log(`✅ Initialized ${this.knownPatterns.length} architectural patterns`);
  }

  /**
   * Analyze project architecture
   */
  async analyzeProject(projectPath: string): Promise<ArchitectureResult> {
    const startTime = Date.now();

    try {
      this.emit('analysisStarted', { project: projectPath });

      // Discover project structure
      const projectStructure = await this.discoverProjectStructure(projectPath);

      // Analyze different aspects in parallel
      const [
        patterns,
        dependencies,
        layerViolations,
        antiPatterns,
        metrics
      ] = await Promise.all([
        this.config.enablePatternDetection
          ? this.detectPatterns(projectStructure)
          : [],
        this.config.enableDependencyAnalysis
          ? this.analyzeDependencies(projectStructure)
          : this.createEmptyDependencyAnalysis(),
        this.config.enableLayerValidation
          ? this.validateLayers(projectStructure)
          : [],
        this.config.enableAntiPatternDetection
          ? this.detectAntiPatterns(projectStructure)
          : [],
        this.calculateArchitecturalMetrics(projectStructure)
      ]);

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        patterns,
        dependencies,
        layerViolations,
        antiPatterns,
        metrics
      );

      // Create summary
      const summary = this.generateSummary(
        patterns,
        dependencies,
        layerViolations,
        antiPatterns,
        metrics
      );

      const processingTime = Date.now() - startTime;

      const result: ArchitectureResult = {
        patterns: patterns.sort((a, b) => b.confidence - a.confidence),
        dependencies,
        layerViolations: layerViolations.sort((a, b) =>
          this.getSeverityWeight(b.severity) - this.getSeverityWeight(a.severity)
        ),
        antiPatterns: antiPatterns.sort((a, b) =>
          this.getAntiPatternSeverityWeight(b.severity) - this.getAntiPatternSeverityWeight(a.severity)
        ),
        metrics,
        recommendations: recommendations.sort((a, b) =>
          this.getRecommendationPriorityWeight(b.priority) - this.getRecommendationPriorityWeight(a.priority)
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
      console.error('❌ Architecture analysis failed:', error);
      throw error;
    }
  }

  /**
   * Analyze single file architecture
   */
  async analyzeFile(
    filePath: string,
    sourceCode: string,
    language: string = 'typescript'
  ): Promise<ArchitectureResult> {
    const projectStructure: ProjectStructure = {
      rootPath: path.dirname(filePath),
      files: [{
        path: filePath,
        content: sourceCode,
        language,
        type: this.determineFileType(filePath, sourceCode),
        layer: this.determineLayer(filePath),
        dependencies: this.extractDependencies(sourceCode),
        exports: this.extractExports(sourceCode),
        classes: this.extractClasses(sourceCode),
        functions: this.extractFunctions(sourceCode),
        interfaces: this.extractInterfaces(sourceCode)
      }],
      packageInfo: await this.loadPackageInfo(path.dirname(filePath)),
      structure: await this.analyzeDirectoryStructure(path.dirname(filePath))
    };

    return this.analyzeProject(projectStructure.rootPath);
  }

  private async discoverProjectStructure(projectPath: string): Promise<ProjectStructure> {
    const files: FileInfo[] = [];
    const extensions = ['.js', '.ts', '.jsx', '.tsx', '.vue', '.svelte'];

    const walkDirectory = async (dir: string) => {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory() && !this.shouldSkipDirectory(entry.name)) {
          await walkDirectory(fullPath);
        } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
          try {
            const content = await fs.readFile(fullPath, 'utf-8');
            const language = this.detectLanguage(fullPath);

            files.push({
              path: fullPath,
              content,
              language,
              type: this.determineFileType(fullPath, content),
              layer: this.determineLayer(fullPath),
              dependencies: this.extractDependencies(content),
              exports: this.extractExports(content),
              classes: this.extractClasses(content),
              functions: this.extractFunctions(content),
              interfaces: this.extractInterfaces(content)
            });
          } catch (error) {
            console.warn(`❌ Failed to read file ${fullPath}:`, error);
          }
        }
      }
    };

    await walkDirectory(projectPath);

    return {
      rootPath: projectPath,
      files,
      packageInfo: await this.loadPackageInfo(projectPath),
      structure: await this.analyzeDirectoryStructure(projectPath)
    };
  }

  private async detectPatterns(projectStructure: ProjectStructure): Promise<DetectedPattern[]> {
    const patterns: DetectedPattern[] = [];

    for (const pattern of this.knownPatterns) {
      const detection = await this.detectPattern(pattern, projectStructure);
      if (detection) {
        patterns.push(detection);
      }
    }

    return patterns;
  }

  private async detectPattern(
    pattern: ArchitecturalPattern,
    projectStructure: ProjectStructure
  ): Promise<DetectedPattern | null> {
    const locations: PatternLocation[] = [];
    let totalConfidence = 0;
    let matchCount = 0;

    for (const file of projectStructure.files) {
      for (const indicator of pattern.indicators) {
        const matches = file.content.matchAll(indicator);

        for (const match of matches) {
          if (match.index !== undefined) {
            const lineNumber = file.content.substring(0, match.index).split('\n').length;
            const lines = file.content.split('\n');

            locations.push({
              file: file.path,
              line: lineNumber,
              column: match.index - file.content.lastIndexOf('\n', match.index - 1) - 1,
              code: lines[lineNumber - 1] || '',
              context: this.getContext(lines, lineNumber, 3)
            });

            matchCount++;
            totalConfidence += this.calculatePatternConfidence(pattern, match[0], file.content);
          }
        }
      }
    }

    if (locations.length === 0) {
      return null;
    }

    const confidence = totalConfidence / matchCount;

    if (confidence < 0.3) {
      return null; // Too low confidence
    }

    return {
      id: pattern.id,
      name: pattern.name,
      type: pattern.type,
      confidence,
      locations,
      description: `${pattern.name} pattern detected in ${locations.length} location(s)`,
      benefits: pattern.benefits,
      implementation_quality: this.assessImplementationQuality(confidence, locations.length),
      suggestions: this.generatePatternSuggestions(pattern, confidence, locations)
    };
  }

  private async analyzeDependencies(projectStructure: ProjectStructure): Promise<DependencyAnalysis> {
    // Build dependency graph
    const graph = this.buildDependencyGraph(projectStructure);

    // Detect circular dependencies
    const cycles = this.detectCircularDependencies(graph);

    // Calculate coupling metrics
    const coupling = this.calculateCouplingMetrics(graph);

    // Calculate cohesion metrics
    const cohesion = this.calculateCohesionMetrics(projectStructure);

    // Calculate stability metrics
    const stability = this.calculateStabilityMetrics(graph);

    return {
      graph,
      cycles,
      coupling,
      cohesion,
      stability
    };
  }

  private buildDependencyGraph(projectStructure: ProjectStructure): DependencyGraph {
    const nodes: DependencyNode[] = [];
    const edges: DependencyEdge[] = [];
    const layers = new Set<string>();

    // Create nodes for each file/module
    for (const file of projectStructure.files) {
      const nodeId = this.getNodeId(file.path);
      layers.add(file.layer);

      nodes.push({
        id: nodeId,
        name: path.basename(file.path),
        type: 'module',
        layer: file.layer,
        incoming: 0,
        outgoing: file.dependencies.length,
        size: file.content.length
      });

      // Create edges for dependencies
      for (const dep of file.dependencies) {
        const targetPath = this.resolveDependencyPath(dep, file.path, projectStructure);
        if (targetPath) {
          const targetId = this.getNodeId(targetPath);

          edges.push({
            from: nodeId,
            to: targetId,
            type: 'import',
            weight: 1
          });
        }
      }
    }

    // Update incoming counts
    for (const edge of edges) {
      const targetNode = nodes.find(n => n.id === edge.to);
      if (targetNode) {
        targetNode.incoming++;
      }
    }

    // Create clusters
    const clusters = this.identifyClusters(nodes, edges);

    return {
      nodes,
      edges,
      layers: Array.from(layers),
      clusters
    };
  }

  private detectCircularDependencies(graph: DependencyGraph): CircularDependency[] {
    const cycles: CircularDependency[] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const pathStack: string[] = [];

    const dfs = (nodeId: string): void => {
      visited.add(nodeId);
      recursionStack.add(nodeId);
      pathStack.push(nodeId);

      const outgoingEdges = graph.edges.filter(e => e.from === nodeId);

      for (const edge of outgoingEdges) {
        if (!visited.has(edge.to)) {
          dfs(edge.to);
        } else if (recursionStack.has(edge.to)) {
          // Found a cycle
          const cycleStart = pathStack.indexOf(edge.to);
          const cycle = pathStack.slice(cycleStart);

          cycles.push({
            id: `cycle-${cycles.length + 1}`,
            cycle: cycle.map(id => graph.nodes.find(n => n.id === id)?.name || id),
            severity: this.calculateCycleSeverity(cycle.length),
            impact: this.describeCycleImpact(cycle),
            resolution: this.suggestCycleResolution(cycle)
          });
        }
      }

      pathStack.pop();
      recursionStack.delete(nodeId);
    };

    for (const node of graph.nodes) {
      if (!visited.has(node.id)) {
        dfs(node.id);
      }
    }

    return cycles;
  }

  private async validateLayers(projectStructure: ProjectStructure): Promise<LayerViolation[]> {
    const violations: LayerViolation[] = [];

    if (!this.config.dependencyRules) {
      return violations;
    }

    for (const file of projectStructure.files) {
      for (const dependency of file.dependencies) {
        const depFile = projectStructure.files.find(f =>
          f.path.includes(dependency) || f.path.endsWith(dependency)
        );

        if (depFile) {
          const violation = this.checkLayerViolation(
            file.layer,
            depFile.layer,
            file.path,
            dependency
          );

          if (violation) {
            violations.push(violation);
          }
        }
      }
    }

    return violations;
  }

  private async detectAntiPatterns(projectStructure: ProjectStructure): Promise<AntiPattern[]> {
    const antiPatterns: AntiPattern[] = [];

    // God Object / God Class
    antiPatterns.push(...this.detectGodObjects(projectStructure));

    // Feature Envy
    antiPatterns.push(...this.detectFeatureEnvy(projectStructure));

    // Data Clumps
    antiPatterns.push(...this.detectDataClumps(projectStructure));

    // Long Parameter List
    antiPatterns.push(...this.detectLongParameterLists(projectStructure));

    // Large Class
    antiPatterns.push(...this.detectLargeClasses(projectStructure));

    // Shotgun Surgery
    antiPatterns.push(...this.detectShotgunSurgery(projectStructure));

    // Circular Dependencies (architectural level)
    antiPatterns.push(...this.detectArchitecturalCircularDependencies(projectStructure));

    return antiPatterns;
  }

  private calculateArchitecturalMetrics(projectStructure: ProjectStructure): ArchitecturalMetrics {
    const maintainabilityIndex = this.calculateMaintainabilityIndex(projectStructure);
    const technicalDebt = this.calculateTechnicalDebt(projectStructure);
    const architecturalComplexity = this.calculateArchitecturalComplexity(projectStructure);
    const designQuality = this.calculateDesignQuality(projectStructure);
    const testability = this.calculateTestability(projectStructure);
    const modularity = this.calculateModularity(projectStructure);
    const reusability = this.calculateReusability(projectStructure);
    const flexibility = this.calculateFlexibility(projectStructure);

    return {
      maintainabilityIndex,
      technicalDebt,
      architecturalComplexity,
      designQuality,
      testability,
      modularity,
      reusability,
      flexibility
    };
  }

  // Pattern definitions
  private getDesignPatterns(): ArchitecturalPattern[] {
    return [
      {
        id: 'singleton',
        name: 'Singleton Pattern',
        type: 'design',
        indicators: [
          /class\s+\w+\s*\{[\s\S]*?private\s+static\s+\w+[\s\S]*?getInstance\s*\(/gi,
          /export\s+default\s+new\s+\w+\s*\(/gi
        ],
        benefits: ['Controlled instantiation', 'Global access point', 'Lazy initialization'],
        drawbacks: ['Global state', 'Testing difficulties', 'Coupling issues'],
        alternatives: ['Dependency injection', 'Factory pattern', 'Module pattern']
      },
      {
        id: 'factory',
        name: 'Factory Pattern',
        type: 'design',
        indicators: [
          /create\w+\s*\([^)]*\)\s*:\s*\w+/gi,
          /class\s+\w*Factory[\s\S]*?create[\s\S]*?\(/gi
        ],
        benefits: ['Encapsulates object creation', 'Loose coupling', 'Flexible instantiation'],
        drawbacks: ['Additional complexity', 'Indirection'],
        alternatives: ['Builder pattern', 'Abstract factory', 'Dependency injection']
      },
      {
        id: 'observer',
        name: 'Observer Pattern',
        type: 'design',
        indicators: [
          /(?:subscribe|addListener|addEventListener|on)\s*\(/gi,
          /(?:notify|emit|trigger)\s*\(/gi,
          /class\s+\w+\s*[\s\S]*?(?:observers|listeners|subscribers)/gi
        ],
        benefits: ['Loose coupling', 'Dynamic subscription', 'Event-driven architecture'],
        drawbacks: ['Memory leaks if not unsubscribed', 'Debugging complexity'],
        alternatives: ['Event emitter', 'Message queue', 'State management']
      }
    ];
  }

  private getArchitecturalPatterns(): ArchitecturalPattern[] {
    return [
      {
        id: 'mvc',
        name: 'Model-View-Controller',
        type: 'architectural',
        indicators: [
          /(?:models?|views?|controllers?)/gi,
          /class\s+\w*(?:Model|View|Controller)/gi
        ],
        benefits: ['Separation of concerns', 'Testability', 'Maintainability'],
        drawbacks: ['Can be over-engineered for simple applications'],
        alternatives: ['MVP', 'MVVM', 'Component-based architecture']
      },
      {
        id: 'repository',
        name: 'Repository Pattern',
        type: 'architectural',
        indicators: [
          /class\s+\w*Repository/gi,
          /interface\s+I\w*Repository/gi,
          /(?:findBy|save|delete|update).*Repository/gi
        ],
        benefits: ['Data access abstraction', 'Testability', 'Flexibility'],
        drawbacks: ['Additional layer complexity'],
        alternatives: ['Data mapper', 'Active record', 'DAO pattern']
      },
      {
        id: 'microservices',
        name: 'Microservices Architecture',
        type: 'architectural',
        indicators: [
          /services\/\w+/gi,
          /microservice/gi,
          /api\/v\d+/gi
        ],
        benefits: ['Scalability', 'Independence', 'Technology diversity'],
        drawbacks: ['Complexity', 'Network overhead', 'Data consistency'],
        alternatives: ['Monolith', 'Modular monolith', 'Service-oriented architecture']
      }
    ];
  }

  private getIntegrationPatterns(): ArchitecturalPattern[] {
    return [
      {
        id: 'api-gateway',
        name: 'API Gateway Pattern',
        type: 'integration',
        indicators: [
          /gateway/gi,
          /proxy.*(?:request|route)/gi,
          /middleware.*(?:auth|rate|limit)/gi
        ],
        benefits: ['Single entry point', 'Cross-cutting concerns', 'Protocol translation'],
        drawbacks: ['Single point of failure', 'Performance bottleneck'],
        alternatives: ['Direct service communication', 'Service mesh']
      }
    ];
  }

  // Anti-pattern detection methods
  private detectGodObjects(projectStructure: ProjectStructure): AntiPattern[] {
    const antiPatterns: AntiPattern[] = [];

    for (const file of projectStructure.files) {
      const lines = file.content.split('\n').length;
      const methods = file.functions.length;
      const classes = file.classes.length;

      // Heuristic: file with >500 lines or class with >20 methods
      if (lines > 500 || methods > 20) {
        const locations: PatternLocation[] = [{
          file: file.path,
          line: 1,
          column: 1,
          code: file.content.split('\n')[0] || '',
          context: file.content.substring(0, 200)
        }];

        antiPatterns.push({
          id: `god-object-${path.basename(file.path)}`,
          name: 'God Object',
          severity: lines > 1000 ? 'high' : 'medium',
          description: `File ${path.basename(file.path)} has ${lines} lines and ${methods} methods`,
          locations,
          impact: 'Reduces maintainability, testability, and understandability',
          refactoring: 'Split into smaller, more focused classes following Single Responsibility Principle',
          examples: ['Extract related methods into separate classes', 'Use composition over inheritance']
        });
      }
    }

    return antiPatterns;
  }

  private detectFeatureEnvy(projectStructure: ProjectStructure): AntiPattern[] {
    // Implementation for feature envy detection
    return [];
  }

  private detectDataClumps(projectStructure: ProjectStructure): AntiPattern[] {
    // Implementation for data clumps detection
    return [];
  }

  private detectLongParameterLists(projectStructure: ProjectStructure): AntiPattern[] {
    // Implementation for long parameter lists detection
    return [];
  }

  private detectLargeClasses(projectStructure: ProjectStructure): AntiPattern[] {
    // Implementation for large classes detection
    return [];
  }

  private detectShotgunSurgery(projectStructure: ProjectStructure): AntiPattern[] {
    // Implementation for shotgun surgery detection
    return [];
  }

  private detectArchitecturalCircularDependencies(projectStructure: ProjectStructure): AntiPattern[] {
    // Implementation for architectural circular dependencies detection
    return [];
  }

  // Metrics calculation methods
  private calculateMaintainabilityIndex(projectStructure: ProjectStructure): number {
    // Simplified maintainability index calculation
    let totalComplexity = 0;
    let totalLines = 0;

    for (const file of projectStructure.files) {
      totalLines += file.content.split('\n').length;
      totalComplexity += this.calculateFileComplexity(file.content);
    }

    const avgComplexity = totalComplexity / projectStructure.files.length;
    const avgLines = totalLines / projectStructure.files.length;

    // MI = 171 - 5.2 * ln(HV) - 0.23 * CC - 16.2 * ln(LOC)
    // Simplified version
    return Math.max(0, Math.min(100, 100 - (avgComplexity * 2) - (avgLines * 0.1)));
  }

  private calculateTechnicalDebt(projectStructure: ProjectStructure): number {
    // Implementation for technical debt calculation
    return 0;
  }

  private calculateArchitecturalComplexity(projectStructure: ProjectStructure): number {
    // Implementation for architectural complexity calculation
    return 0;
  }

  private calculateDesignQuality(projectStructure: ProjectStructure): number {
    // Implementation for design quality calculation
    return 0;
  }

  private calculateTestability(projectStructure: ProjectStructure): number {
    // Implementation for testability calculation
    return 0;
  }

  private calculateModularity(projectStructure: ProjectStructure): number {
    // Implementation for modularity calculation
    return 0;
  }

  private calculateReusability(projectStructure: ProjectStructure): number {
    // Implementation for reusability calculation
    return 0;
  }

  private calculateFlexibility(projectStructure: ProjectStructure): number {
    // Implementation for flexibility calculation
    return 0;
  }

  // Helper methods
  private shouldSkipDirectory(name: string): boolean {
    const skipDirs = ['node_modules', '.git', 'dist', 'build', 'coverage', '.next', '.nuxt'];
    return skipDirs.includes(name) || name.startsWith('.');
  }

  private detectLanguage(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const languageMap: Record<string, string> = {
      '.js': 'javascript',
      '.ts': 'typescript',
      '.jsx': 'jsx',
      '.tsx': 'tsx',
      '.vue': 'vue',
      '.svelte': 'svelte'
    };

    return languageMap[ext] || 'unknown';
  }

  private determineFileType(filePath: string, content: string): string {
    if (content.includes('test') || content.includes('spec')) return 'test';
    if (content.includes('export default') || content.includes('export {')) return 'module';
    if (content.includes('class ')) return 'class';
    if (content.includes('function ') || content.includes('=>')) return 'function';
    return 'unknown';
  }

  private determineLayer(filePath: string): string {
    const normalizedPath = filePath.toLowerCase();

    if (normalizedPath.includes('/controllers/') || normalizedPath.includes('/api/')) return 'controller';
    if (normalizedPath.includes('/services/') || normalizedPath.includes('/business/')) return 'service';
    if (normalizedPath.includes('/models/') || normalizedPath.includes('/entities/')) return 'model';
    if (normalizedPath.includes('/repositories/') || normalizedPath.includes('/data/')) return 'data';
    if (normalizedPath.includes('/views/') || normalizedPath.includes('/components/')) return 'presentation';
    if (normalizedPath.includes('/utils/') || normalizedPath.includes('/helpers/')) return 'utility';

    return 'unknown';
  }

  private extractDependencies(content: string): string[] {
    const dependencies: string[] = [];
    const importPattern = /import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/g;
    const requirePattern = /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;

    let match;
    while ((match = importPattern.exec(content)) !== null) {
      dependencies.push(match[1]);
    }

    while ((match = requirePattern.exec(content)) !== null) {
      dependencies.push(match[1]);
    }

    return dependencies;
  }

  private extractExports(content: string): string[] {
    const exports: string[] = [];
    const exportPattern = /export\s+(?:default\s+)?(?:const|let|var|function|class)\s+(\w+)/g;

    let match;
    while ((match = exportPattern.exec(content)) !== null) {
      exports.push(match[1]);
    }

    return exports;
  }

  private extractClasses(content: string): string[] {
    const classes: string[] = [];
    const classPattern = /class\s+(\w+)/g;

    let match;
    while ((match = classPattern.exec(content)) !== null) {
      classes.push(match[1]);
    }

    return classes;
  }

  private extractFunctions(content: string): string[] {
    const functions: string[] = [];
    const functionPattern = /(?:function\s+(\w+)|(\w+)\s*[:=]\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>))/g;

    let match;
    while ((match = functionPattern.exec(content)) !== null) {
      functions.push(match[1] || match[2]);
    }

    return functions;
  }

  private extractInterfaces(content: string): string[] {
    const interfaces: string[] = [];
    const interfacePattern = /interface\s+(\w+)/g;

    let match;
    while ((match = interfacePattern.exec(content)) !== null) {
      interfaces.push(match[1]);
    }

    return interfaces;
  }

  // Additional helper methods would be implemented here...
  private calculateFileComplexity(content: string): number {
    // Simplified complexity calculation
    const complexityKeywords = ['if', 'for', 'while', 'switch', 'case', 'catch', '&&', '||', '?'];

    return complexityKeywords.reduce((complexity, keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      const matches = content.match(regex);
      return complexity + (matches ? matches.length : 0);
    }, 1);
  }

  private async loadPackageInfo(projectPath: string): Promise<any> {
    try {
      const packageJsonPath = path.join(projectPath, 'package.json');
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return {};
    }
  }

  private async analyzeDirectoryStructure(projectPath: string): Promise<any> {
    // Implementation for directory structure analysis
    return {};
  }

  private createEmptyDependencyAnalysis(): DependencyAnalysis {
    return {
      graph: { nodes: [], edges: [], layers: [], clusters: [] },
      cycles: [],
      coupling: { afferent: 0, efferent: 0, instability: 0, abstractness: 0, distance: 0 },
      cohesion: { lcom: 0, cohesiveRatio: 0, functionalCohesion: 0 },
      stability: { stability: 0, volatility: 0, changeImpact: 0 }
    };
  }

  private getNodeId(filePath: string): string {
    return path.relative(process.cwd(), filePath).replace(/[/\\]/g, '_');
  }

  private resolveDependencyPath(dependency: string, fromPath: string, projectStructure: ProjectStructure): string | null {
    // Implementation for dependency path resolution
    return null;
  }

  private identifyClusters(nodes: DependencyNode[], edges: DependencyEdge[]): DependencyCluster[] {
    // Implementation for cluster identification
    return [];
  }

  private calculateCouplingMetrics(graph: DependencyGraph): CouplingMetrics {
    // Implementation for coupling metrics calculation
    return { afferent: 0, efferent: 0, instability: 0, abstractness: 0, distance: 0 };
  }

  private calculateCohesionMetrics(projectStructure: ProjectStructure): CohesionMetrics {
    // Implementation for cohesion metrics calculation
    return { lcom: 0, cohesiveRatio: 0, functionalCohesion: 0 };
  }

  private calculateStabilityMetrics(graph: DependencyGraph): StabilityMetrics {
    // Implementation for stability metrics calculation
    return { stability: 0, volatility: 0, changeImpact: 0 };
  }

  private calculateCycleSeverity(cycleLength: number): 'low' | 'medium' | 'high' {
    if (cycleLength <= 2) return 'low';
    if (cycleLength <= 4) return 'medium';
    return 'high';
  }

  private describeCycleImpact(cycle: string[]): string {
    return `Circular dependency affects ${cycle.length} modules, making changes difficult to predict`;
  }

  private suggestCycleResolution(cycle: string[]): string {
    return 'Consider introducing an interface or moving shared functionality to a common module';
  }

  private checkLayerViolation(
    fromLayer: string,
    toLayer: string,
    filePath: string,
    dependency: string
  ): LayerViolation | null {
    if (!this.config.dependencyRules) return null;

    const violatedRule = this.config.dependencyRules.find(rule =>
      rule.fromLayer === fromLayer &&
      rule.toLayer === toLayer &&
      !rule.allowed
    );

    if (violatedRule) {
      return {
        id: `violation-${Date.now()}`,
        type: 'dependency',
        severity: violatedRule.severity,
        description: violatedRule.description,
        fromLayer,
        toLayer,
        file: filePath,
        line: 1,
        resolution: `Refactor to avoid ${fromLayer} -> ${toLayer} dependency`
      };
    }

    return null;
  }

  private calculatePatternConfidence(pattern: ArchitecturalPattern, match: string, context: string): number {
    // Implementation for pattern confidence calculation
    return 0.7;
  }

  private getContext(lines: string[], lineNumber: number, contextSize: number): string {
    const start = Math.max(0, lineNumber - contextSize - 1);
    const end = Math.min(lines.length, lineNumber + contextSize);
    return lines.slice(start, end).join('\n');
  }

  private assessImplementationQuality(confidence: number, locationCount: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (confidence > 0.8 && locationCount >= 3) return 'excellent';
    if (confidence > 0.6) return 'good';
    if (confidence > 0.4) return 'fair';
    return 'poor';
  }

  private generatePatternSuggestions(pattern: ArchitecturalPattern, confidence: number, locations: PatternLocation[]): string[] {
    const suggestions: string[] = [];

    if (confidence < 0.7) {
      suggestions.push(`Consider fully implementing ${pattern.name} pattern for better consistency`);
    }

    if (locations.length === 1) {
      suggestions.push(`Consider applying ${pattern.name} pattern in other similar contexts`);
    }

    return suggestions;
  }

  private generateRecommendations(
    patterns: DetectedPattern[],
    dependencies: DependencyAnalysis,
    layerViolations: LayerViolation[],
    antiPatterns: AntiPattern[],
    metrics: ArchitecturalMetrics
  ): ArchitecturalRecommendation[] {
    const recommendations: ArchitecturalRecommendation[] = [];

    // Add recommendations based on analysis results
    if (antiPatterns.length > 0) {
      recommendations.push({
        id: 'refactor-anti-patterns',
        category: 'structure',
        priority: 'high',
        title: 'Refactor Anti-patterns',
        description: `${antiPatterns.length} anti-patterns detected that need refactoring`,
        benefits: ['Improved maintainability', 'Better code organization', 'Reduced technical debt'],
        implementation: 'Apply appropriate refactoring techniques for each anti-pattern',
        effort: 'high',
        impact: 'high'
      });
    }

    if (dependencies.cycles.length > 0) {
      recommendations.push({
        id: 'resolve-cycles',
        category: 'dependencies',
        priority: 'medium',
        title: 'Resolve Circular Dependencies',
        description: `${dependencies.cycles.length} circular dependencies found`,
        benefits: ['Improved testability', 'Better modularity', 'Easier refactoring'],
        implementation: 'Introduce interfaces or extract common functionality',
        effort: 'medium',
        impact: 'medium'
      });
    }

    return recommendations;
  }

  private generateSummary(
    patterns: DetectedPattern[],
    dependencies: DependencyAnalysis,
    layerViolations: LayerViolation[],
    antiPatterns: AntiPattern[],
    metrics: ArchitecturalMetrics
  ): ArchitectureSummary {
    const overallScore = this.calculateOverallScore(patterns, dependencies, layerViolations, antiPatterns, metrics);

    return {
      overallScore,
      strengths: this.identifyStrengths(patterns, metrics),
      weaknesses: this.identifyWeaknesses(antiPatterns, layerViolations),
      riskAreas: this.identifyRiskAreas(dependencies, antiPatterns),
      improvementOpportunities: this.identifyImprovements(patterns, metrics),
      architecturalStyle: this.identifyArchitecturalStyle(patterns),
      complexity: this.assessComplexity(metrics.architecturalComplexity),
      maintainability: this.assessMaintainability(metrics.maintainabilityIndex)
    };
  }

  // Summary helper methods
  private calculateOverallScore(
    patterns: DetectedPattern[],
    dependencies: DependencyAnalysis,
    layerViolations: LayerViolation[],
    antiPatterns: AntiPattern[],
    metrics: ArchitecturalMetrics
  ): number {
    let score = 100;

    // Deduct for anti-patterns
    score -= antiPatterns.length * 10;

    // Deduct for violations
    score -= layerViolations.length * 5;

    // Deduct for cycles
    score -= dependencies.cycles.length * 8;

    // Add for good patterns
    score += patterns.filter(p => p.confidence > 0.7).length * 5;

    return Math.max(0, Math.min(100, score));
  }

  private identifyStrengths(patterns: DetectedPattern[], metrics: ArchitecturalMetrics): string[] {
    const strengths: string[] = [];

    if (patterns.some(p => p.confidence > 0.8)) {
      strengths.push('Well-implemented design patterns');
    }

    if (metrics.maintainabilityIndex > 80) {
      strengths.push('High maintainability index');
    }

    return strengths;
  }

  private identifyWeaknesses(antiPatterns: AntiPattern[], layerViolations: LayerViolation[]): string[] {
    const weaknesses: string[] = [];

    if (antiPatterns.length > 0) {
      weaknesses.push(`${antiPatterns.length} anti-patterns detected`);
    }

    if (layerViolations.length > 0) {
      weaknesses.push(`${layerViolations.length} layer violations`);
    }

    return weaknesses;
  }

  private identifyRiskAreas(dependencies: DependencyAnalysis, antiPatterns: AntiPattern[]): string[] {
    const risks: string[] = [];

    if (dependencies.cycles.length > 0) {
      risks.push('Circular dependencies present');
    }

    if (antiPatterns.some(ap => ap.severity === 'high')) {
      risks.push('High-severity anti-patterns detected');
    }

    return risks;
  }

  private identifyImprovements(patterns: DetectedPattern[], metrics: ArchitecturalMetrics): string[] {
    const improvements: string[] = [];

    if (patterns.some(p => p.implementation_quality === 'fair')) {
      improvements.push('Improve pattern implementations');
    }

    if (metrics.testability < 70) {
      improvements.push('Enhance testability');
    }

    return improvements;
  }

  private identifyArchitecturalStyle(patterns: DetectedPattern[]): string {
    const patternTypes = patterns.map(p => p.name.toLowerCase());

    if (patternTypes.some(p => p.includes('mvc'))) return 'MVC';
    if (patternTypes.some(p => p.includes('microservice'))) return 'Microservices';
    if (patternTypes.some(p => p.includes('layered'))) return 'Layered Architecture';

    return 'Mixed/Unknown';
  }

  private assessComplexity(complexity: number): 'low' | 'medium' | 'high' | 'very-high' {
    if (complexity < 25) return 'low';
    if (complexity < 50) return 'medium';
    if (complexity < 75) return 'high';
    return 'very-high';
  }

  private assessMaintainability(maintainabilityIndex: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (maintainabilityIndex >= 80) return 'excellent';
    if (maintainabilityIndex >= 60) return 'good';
    if (maintainabilityIndex >= 40) return 'fair';
    return 'poor';
  }

  private getSeverityWeight(severity: string): number {
    const weights = { error: 2, warning: 1 };
    return weights[severity as keyof typeof weights] || 0;
  }

  private getAntiPatternSeverityWeight(severity: string): number {
    const weights = { critical: 4, high: 3, medium: 2, low: 1 };
    return weights[severity as keyof typeof weights] || 0;
  }

  private getRecommendationPriorityWeight(priority: string): number {
    const weights = { critical: 4, high: 3, medium: 2, low: 1 };
    return weights[priority as keyof typeof weights] || 0;
  }

  private updateStatistics(result: ArchitectureResult): void {
    this.statistics.projectsAnalyzed++;
    this.statistics.patternsDetected += result.patterns.length;
    this.statistics.antiPatternsFound += result.antiPatterns.length;
    this.statistics.violationsDetected += result.layerViolations.length;
    this.statistics.averageScore =
      (this.statistics.averageScore + result.summary.overallScore) / 2;
    this.statistics.lastAnalysisDate = new Date();
  }

  /**
   * Get analyzer statistics
   */
  getStatistics() {
    return { ...this.statistics };
  }
}

// Type definitions
interface ProjectStructure {
  rootPath: string;
  files: FileInfo[];
  packageInfo: any;
  structure: any;
}

interface FileInfo {
  path: string;
  content: string;
  language: string;
  type: string;
  layer: string;
  dependencies: string[];
  exports: string[];
  classes: string[];
  functions: string[];
  interfaces: string[];
}
