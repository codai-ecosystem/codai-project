// ============================================================================
// Context Analyzer - Advanced Context Analysis Engine for Glass MCP
// ============================================================================

import {
  ContextSnapshot,
  ScreenState,
  ApplicationState,
  UserIntent,
  SystemMetrics,
  HistoricalContext,
  UIElement,
  WindowInfo,
  ActionHistory,
  PatternInfo,
  ConfidenceLevel,
  IntelligenceUtils
} from './intelligence-types';

/**
 * Advanced Context Analyzer for Glass MCP Visual Automation
 * 
 * Provides comprehensive context analysis including:
 * - Screen state interpretation
 * - Application behavior patterns
 * - User intent prediction
 * - System performance assessment
 * - Historical pattern recognition
 */
export class ContextAnalyzer {
  private readonly patternCache = new Map<string, PatternInfo>();
  private readonly confidenceThresholds = {
    high: 0.8,
    medium: 0.6,
    low: 0.4
  };

  /**
   * Analyze complete context snapshot for decision making
   */
  async analyzeContext(snapshot: ContextSnapshot): Promise<ContextAnalysis> {
    const startTime = Date.now();

    try {
      // Parallel analysis of all context dimensions
      const [
        screenAnalysis,
        applicationAnalysis,
        intentAnalysis,
        systemAnalysis,
        historyAnalysis
      ] = await Promise.all([
        this.analyzeScreenState(snapshot.screenState),
        this.analyzeApplicationState(snapshot.applicationState),
        this.analyzeUserIntent(snapshot.userIntent),
        this.analyzeSystemMetrics(snapshot.systemMetrics),
        this.analyzeHistoricalContext(snapshot.historicalContext)
      ]);

      // Synthesize comprehensive analysis
      const analysis = this.synthesizeAnalysis(
        screenAnalysis,
        applicationAnalysis,
        intentAnalysis,
        systemAnalysis,
        historyAnalysis
      );

      analysis.processingTime = Date.now() - startTime;
      analysis.timestamp = snapshot.timestamp;

      return analysis;
    } catch (error) {
      throw new Error(`Context analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Analyze screen state for UI context and interaction opportunities
   */
  private async analyzeScreenState(screenState: ScreenState): Promise<ScreenAnalysis> {
    const interactableElements = screenState.visibleElements.filter(e => e.interactable);
    const activeWindow = screenState.activeWindows.find(w => w.isActive);

    // Analyze UI complexity and interaction patterns
    const complexity = this.calculateUIComplexity(screenState.visibleElements);
    const interactionOpportunities = this.identifyInteractionOpportunities(interactableElements);
    const layoutPatterns = this.recognizeLayoutPatterns(screenState.visibleElements);

    return {
      elementCount: screenState.visibleElements.length,
      interactableCount: interactableElements.length,
      activeWindow: activeWindow?.title || 'Unknown',
      complexity,
      interactionOpportunities,
      layoutPatterns,
      confidence: this.calculateScreenConfidence(screenState)
    };
  }

  /**
   * Analyze application state for performance and behavior patterns
   */
  private async analyzeApplicationState(appState: ApplicationState): Promise<ApplicationAnalysis> {
    const highResourceProcesses = appState.runningProcesses
      .filter(p => p.cpuUsage > 50 || p.memoryMB > 1000)
      .sort((a, b) => (b.cpuUsage + b.memoryMB) - (a.cpuUsage + a.memoryMB));

    const systemLoad = this.categorizeSystemLoad(appState.systemLoad);
    const memoryPressure = this.assessMemoryPressure(appState.memoryUsage);

    return {
      activeApplication: appState.activeApplication,
      processCount: appState.runningProcesses.length,
      highResourceProcesses: highResourceProcesses.slice(0, 5),
      systemLoad,
      memoryPressure,
      performanceImpact: this.assessPerformanceImpact(appState),
      confidence: ConfidenceLevel.HIGH
    };
  }

  /**
   * Analyze user intent for goal prediction and constraint identification
   */
  private async analyzeUserIntent(userIntent: UserIntent): Promise<IntentAnalysis> {
    const goalComplexity = this.assessGoalComplexity(userIntent);
    const constraintSeverity = this.assessConstraintSeverity(userIntent.constraints);
    const preferenceConflicts = this.identifyPreferenceConflicts(userIntent.preferences);

    return {
      primaryGoal: userIntent.primaryGoal,
      subGoalCount: userIntent.subGoals.length,
      goalComplexity,
      constraintSeverity,
      preferenceConflicts,
      predictedActions: this.predictUserActions(userIntent),
      confidence: this.calculateIntentConfidence(userIntent)
    };
  }

  /**
   * Analyze system metrics for performance optimization opportunities
   */
  private async analyzeSystemMetrics(metrics: SystemMetrics): Promise<SystemAnalysis> {
    const performanceBottlenecks = this.identifyPerformanceBottlenecks(metrics);
    const resourceAvailability = this.assessResourceAvailability(metrics);
    const optimizationOpportunities = this.identifyOptimizationOpportunities(metrics);

    return {
      performanceScore: this.calculatePerformanceScore(metrics),
      bottlenecks: performanceBottlenecks,
      resourceAvailability,
      optimizationOpportunities,
      stability: this.assessSystemStability(metrics),
      confidence: ConfidenceLevel.HIGH
    };
  }

  /**
   * Analyze historical context for pattern recognition and learning
   */
  private async analyzeHistoricalContext(history: HistoricalContext): Promise<HistoricalAnalysis> {
    const recentSuccessRate = this.calculateRecentSuccessRate(history.recentActions);
    const strongPatterns = history.successPatterns.filter(p => p.successRate > 0.8);
    const weakPatterns = history.failurePatterns.filter(p => p.frequency > 3);

    const trendAnalysis = this.analyzeTrends(history.recentActions);
    const learningInsights = this.extractLearningInsights(history);

    return {
      recentSuccessRate,
      strongPatterns: strongPatterns.slice(0, 10),
      weakPatterns: weakPatterns.slice(0, 5),
      trendAnalysis,
      learningInsights,
      dataQuality: this.assessHistoricalDataQuality(history),
      confidence: this.calculateHistoricalConfidence(history)
    };
  }

  /**
   * Synthesize all analyses into comprehensive context understanding
   */
  private synthesizeAnalysis(
    screen: ScreenAnalysis,
    app: ApplicationAnalysis,
    intent: IntentAnalysis,
    system: SystemAnalysis,
    history: HistoricalAnalysis
  ): ContextAnalysis {
    // Calculate overall confidence from individual analyses
    const overallConfidence = IntelligenceUtils.calculateConfidence([
      { id: 'screen', description: 'Screen Analysis', weight: 0.25, evidence: [], confidence: screen.confidence },
      { id: 'app', description: 'Application Analysis', weight: 0.2, evidence: [], confidence: app.confidence },
      { id: 'intent', description: 'Intent Analysis', weight: 0.3, evidence: [], confidence: intent.confidence },
      { id: 'system', description: 'System Analysis', weight: 0.1, evidence: [], confidence: system.confidence },
      { id: 'history', description: 'Historical Analysis', weight: 0.15, evidence: [], confidence: history.confidence }
    ]);

    // Identify cross-cutting insights
    const insights = this.generateCrossAnalysisInsights(screen, app, intent, system, history);
    const recommendations = this.generateActionRecommendations(screen, app, intent, system, history);
    const riskFactors = this.identifyContextualRisks(screen, app, intent, system, history);

    return {
      timestamp: new Date(),
      processingTime: 0, // Will be set by caller
      overallConfidence,
      screen,
      application: app,
      intent,
      system,
      history,
      insights,
      recommendations,
      riskFactors,
      contextHash: this.generateContextHash(screen, app, intent, system, history)
    };
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private calculateUIComplexity(elements: UIElement[]): number {
    if (elements.length === 0) return 0;
    
    const baseComplexity = Math.min(elements.length / 50, 1); // Normalize to 0-1
    const interactableRatio = elements.filter(e => e.interactable).length / elements.length;
    const layoutComplexity = this.calculateLayoutComplexity(elements);
    
    return (baseComplexity * 0.4) + (interactableRatio * 0.3) + (layoutComplexity * 0.3);
  }

  private calculateLayoutComplexity(elements: UIElement[]): number {
    // Simplified layout complexity based on element distribution
    const bounds = elements.map(e => e.bounds);
    const averageSize = bounds.reduce((sum, b) => sum + (b.width * b.height), 0) / bounds.length;
    const sizeVariance = bounds.reduce((sum, b) => sum + Math.abs((b.width * b.height) - averageSize), 0) / bounds.length;
    
    return Math.min(sizeVariance / averageSize, 1);
  }

  private identifyInteractionOpportunities(elements: UIElement[]): InteractionOpportunity[] {
    return elements
      .filter(e => e.interactable)
      .map(e => ({
        elementId: e.id,
        type: e.type,
        priority: this.calculateInteractionPriority(e),
        confidence: this.calculateElementConfidence(e)
      }))
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 10);
  }

  private calculateInteractionPriority(element: UIElement): number {
    // Prioritize buttons, inputs, and links
    const typePriority = {
      'button': 0.9,
      'input': 0.8,
      'link': 0.7,
      'checkbox': 0.6,
      'select': 0.8
    };
    
    const baseScore = typePriority[element.type as keyof typeof typePriority] || 0.5;
    const sizeScore = Math.min((element.bounds.width * element.bounds.height) / 10000, 0.3);
    
    return baseScore + sizeScore;
  }

  private calculateElementConfidence(element: UIElement): ConfidenceLevel {
    const hasProperties = Object.keys(element.properties).length > 0;
    const hasValidBounds = element.bounds.width > 0 && element.bounds.height > 0;
    const isInteractable = element.interactable;
    
    const score = (hasProperties ? 0.3 : 0) + (hasValidBounds ? 0.4 : 0) + (isInteractable ? 0.3 : 0);
    
    return IntelligenceUtils.numberToConfidence(score);
  }

  private recognizeLayoutPatterns(elements: UIElement[]): LayoutPattern[] {
    const patterns: LayoutPattern[] = [];
    
    // Detect common patterns like toolbars, menus, forms
    const topElements = elements.filter(e => e.bounds.y < 100);
    if (topElements.length > 3) {
      patterns.push({
        type: 'toolbar',
        confidence: 0.8,
        elements: topElements.slice(0, 5).map(e => e.id)
      });
    }
    
    // Detect form patterns
    const inputs = elements.filter(e => e.type === 'input');
    const buttons = elements.filter(e => e.type === 'button');
    if (inputs.length > 2 && buttons.length > 0) {
      patterns.push({
        type: 'form',
        confidence: 0.7,
        elements: [...inputs, ...buttons].map(e => e.id)
      });
    }
    
    return patterns;
  }

  private calculateScreenConfidence(screenState: ScreenState): ConfidenceLevel {
    const hasElements = screenState.visibleElements.length > 0;
    const hasActiveWindow = screenState.activeWindows.some(w => w.isActive);
    const hasScreenshot = screenState.screenshot.length > 0;
    
    const score = (hasElements ? 0.4 : 0) + (hasActiveWindow ? 0.3 : 0) + (hasScreenshot ? 0.3 : 0);
    return IntelligenceUtils.numberToConfidence(score);
  }

  private categorizeSystemLoad(load: number): SystemLoadCategory {
    if (load < 30) return 'low';
    if (load < 70) return 'medium';
    if (load < 90) return 'high';
    return 'critical';
  }

  private assessMemoryPressure(memoryUsage: number): MemoryPressure {
    if (memoryUsage < 50) return 'low';
    if (memoryUsage < 75) return 'medium';
    if (memoryUsage < 90) return 'high';
    return 'critical';
  }

  private assessPerformanceImpact(appState: ApplicationState): number {
    const loadImpact = appState.systemLoad / 100;
    const memoryImpact = appState.memoryUsage / 100;
    const processImpact = Math.min(appState.runningProcesses.length / 100, 1);
    
    return (loadImpact * 0.5) + (memoryImpact * 0.3) + (processImpact * 0.2);
  }

  private assessGoalComplexity(userIntent: UserIntent): GoalComplexity {
    const subGoalCount = userIntent.subGoals.length;
    const constraintCount = userIntent.constraints.length;
    const preferenceCount = Object.keys(userIntent.preferences).length;
    
    const complexityScore = (subGoalCount * 0.4) + (constraintCount * 0.3) + (preferenceCount * 0.3);
    
    if (complexityScore < 2) return 'simple';
    if (complexityScore < 5) return 'moderate';
    if (complexityScore < 8) return 'complex';
    return 'very_complex';
  }

  private assessConstraintSeverity(constraints: string[]): ConstraintSeverity {
    if (constraints.length === 0) return 'none';
    if (constraints.length <= 2) return 'low';
    if (constraints.length <= 5) return 'medium';
    return 'high';
  }

  private identifyPreferenceConflicts(preferences: Record<string, any>): PreferenceConflict[] {
    const conflicts: PreferenceConflict[] = [];
    const keys = Object.keys(preferences);
    
    // Simple conflict detection for common preference pairs
    const conflictPairs = [
      ['speed', 'accuracy'],
      ['automation', 'manual_control'],
      ['privacy', 'functionality']
    ];
    
    conflictPairs.forEach(([pref1, pref2]) => {
      if (keys.includes(pref1) && keys.includes(pref2)) {
        conflicts.push({
          preference1: pref1,
          preference2: pref2,
          severity: 'medium',
          resolution: `Balance ${pref1} and ${pref2} based on context`
        });
      }
    });
    
    return conflicts;
  }

  private predictUserActions(userIntent: UserIntent): string[] {
    const actions: string[] = [];
    
    // Extract action verbs from goals
    const actionWords = ['click', 'type', 'drag', 'select', 'navigate', 'open', 'close'];
    const goalText = `${userIntent.primaryGoal} ${userIntent.subGoals.join(' ')}`.toLowerCase();
    
    actionWords.forEach(action => {
      if (goalText.includes(action)) {
        actions.push(action);
      }
    });
    
    return actions.length > 0 ? actions : ['unknown'];
  }

  private calculateIntentConfidence(userIntent: UserIntent): ConfidenceLevel {
    const hasGoal = userIntent.primaryGoal.length > 0;
    const hasSubGoals = userIntent.subGoals.length > 0;
    const hasContext = userIntent.context.length > 0;
    
    const score = (hasGoal ? 0.5 : 0) + (hasSubGoals ? 0.3 : 0) + (hasContext ? 0.2 : 0);
    return IntelligenceUtils.numberToConfidence(score);
  }

  private identifyPerformanceBottlenecks(metrics: SystemMetrics): PerformanceBottleneck[] {
    const bottlenecks: PerformanceBottleneck[] = [];
    
    if (metrics.cpuUsage > 80) {
      bottlenecks.push({
        type: 'cpu',
        severity: metrics.cpuUsage > 95 ? 'critical' : 'high',
        value: metrics.cpuUsage,
        recommendation: 'Consider reducing CPU-intensive operations'
      });
    }
    
    if (metrics.memoryUsage > 80) {
      bottlenecks.push({
        type: 'memory',
        severity: metrics.memoryUsage > 95 ? 'critical' : 'high',
        value: metrics.memoryUsage,
        recommendation: 'Consider freeing memory or reducing memory usage'
      });
    }
    
    if (metrics.diskUsage > 90) {
      bottlenecks.push({
        type: 'disk',
        severity: 'high',
        value: metrics.diskUsage,
        recommendation: 'Consider disk cleanup or storage optimization'
      });
    }
    
    return bottlenecks;
  }

  private assessResourceAvailability(metrics: SystemMetrics): ResourceAvailability {
    return {
      cpu: 100 - metrics.cpuUsage,
      memory: 100 - metrics.memoryUsage,
      disk: 100 - metrics.diskUsage,
      network: 100 - metrics.networkActivity
    };
  }

  private identifyOptimizationOpportunities(metrics: SystemMetrics): OptimizationOpportunity[] {
    const opportunities: OptimizationOpportunity[] = [];
    
    if (metrics.cpuUsage < 20) {
      opportunities.push({
        type: 'performance',
        description: 'CPU utilization is low - can increase automation speed',
        impact: 'medium',
        effort: 'low'
      });
    }
    
    if (metrics.networkActivity < 10) {
      opportunities.push({
        type: 'efficiency',
        description: 'Network utilization is low - can prefetch resources',
        impact: 'low',
        effort: 'medium'
      });
    }
    
    return opportunities;
  }

  private calculatePerformanceScore(metrics: SystemMetrics): number {
    const cpuScore = Math.max(0, 100 - metrics.cpuUsage) / 100;
    const memoryScore = Math.max(0, 100 - metrics.memoryUsage) / 100;
    const diskScore = Math.max(0, 100 - metrics.diskUsage) / 100;
    const networkScore = Math.min(metrics.networkActivity, 50) / 50; // Normalize network activity
    
    return (cpuScore * 0.3) + (memoryScore * 0.3) + (diskScore * 0.2) + (networkScore * 0.2);
  }

  private assessSystemStability(metrics: SystemMetrics): SystemStability {
    const performanceScore = this.calculatePerformanceScore(metrics);
    
    if (performanceScore > 0.8) return 'stable';
    if (performanceScore > 0.6) return 'moderate';
    if (performanceScore > 0.4) return 'unstable';
    return 'critical';
  }

  private calculateRecentSuccessRate(actions: ActionHistory[]): number {
    if (actions.length === 0) return 0;
    
    const successCount = actions.filter(a => a.outcome === 'success').length;
    return successCount / actions.length;
  }

  private analyzeTrends(actions: ActionHistory[]): TrendAnalysis {
    const trends: TrendAnalysis = {
      successTrend: 'stable',
      performanceTrend: 'stable',
      complexityTrend: 'stable'
    };
    
    if (actions.length < 5) return trends;
    
    // Analyze recent vs older actions
    const recentActions = actions.slice(-Math.floor(actions.length / 2));
    const olderActions = actions.slice(0, Math.floor(actions.length / 2));
    
    const recentSuccessRate = recentActions.filter(a => a.outcome === 'success').length / recentActions.length;
    const olderSuccessRate = olderActions.filter(a => a.outcome === 'success').length / olderActions.length;
    
    if (recentSuccessRate > olderSuccessRate + 0.1) trends.successTrend = 'improving';
    else if (recentSuccessRate < olderSuccessRate - 0.1) trends.successTrend = 'declining';
    
    return trends;
  }

  private extractLearningInsights(history: HistoricalContext): string[] {
    const insights = [...history.learningInsights];
    
    // Add automatic insights based on patterns
    if (history.successPatterns.length > history.failurePatterns.length) {
      insights.push('Success patterns are well-established');
    }
    
    if (history.recentActions.length > 10) {
      const avgDuration = history.recentActions.reduce((sum, a) => sum + a.duration, 0) / history.recentActions.length;
      if (avgDuration < 1000) {
        insights.push('Actions are being performed efficiently');
      }
    }
    
    return insights.slice(0, 10); // Limit insights
  }

  private assessHistoricalDataQuality(history: HistoricalContext): DataQuality {
    const hasActions = history.recentActions.length > 0;
    const hasPatterns = history.successPatterns.length > 0 || history.failurePatterns.length > 0;
    const hasInsights = history.learningInsights.length > 0;
    
    const score = (hasActions ? 0.4 : 0) + (hasPatterns ? 0.4 : 0) + (hasInsights ? 0.2 : 0);
    
    if (score > 0.8) return 'high';
    if (score > 0.5) return 'medium';
    return 'low';
  }

  private calculateHistoricalConfidence(history: HistoricalContext): ConfidenceLevel {
    const actionCount = history.recentActions.length;
    const patternCount = history.successPatterns.length + history.failurePatterns.length;
    
    let score = 0;
    if (actionCount > 10) score += 0.4;
    else if (actionCount > 5) score += 0.2;
    
    if (patternCount > 5) score += 0.4;
    else if (patternCount > 2) score += 0.2;
    
    if (history.learningInsights.length > 0) score += 0.2;
    
    return IntelligenceUtils.numberToConfidence(score);
  }

  private generateCrossAnalysisInsights(
    screen: ScreenAnalysis,
    app: ApplicationAnalysis,
    intent: IntentAnalysis,
    system: SystemAnalysis,
    history: HistoricalAnalysis
  ): ContextInsight[] {
    const insights: ContextInsight[] = [];
    
    // Performance-UI complexity correlation
    if (screen.complexity > 0.7 && system.performanceScore < 0.5) {
      insights.push({
        type: 'performance',
        description: 'High UI complexity may be causing performance issues',
        confidence: ConfidenceLevel.MEDIUM,
        actionable: true,
        recommendation: 'Consider simplifying UI interactions or improving system performance'
      });
    }
    
    // Intent-capability mismatch
    if (intent.goalComplexity === 'very_complex' && history.recentSuccessRate < 0.6) {
      insights.push({
        type: 'capability',
        description: 'Complex goals may exceed current automation capabilities',
        confidence: ConfidenceLevel.HIGH,
        actionable: true,
        recommendation: 'Break down complex goals into simpler sub-tasks'
      });
    }
    
    return insights;
  }

  private generateActionRecommendations(
    screen: ScreenAnalysis,
    app: ApplicationAnalysis,
    intent: IntentAnalysis,
    system: SystemAnalysis,
    history: HistoricalAnalysis
  ): ActionRecommendation[] {
    const recommendations: ActionRecommendation[] = [];
    
    // Screen-based recommendations
    if (screen.interactionOpportunities.length > 0) {
      const topOpportunity = screen.interactionOpportunities[0];
      recommendations.push({
        type: 'interaction',
        priority: 'high',
        description: `Consider interacting with ${topOpportunity.type} element`,
        expectedOutcome: 'Advance toward user goal',
        confidence: topOpportunity.confidence
      });
    }
    
    // Performance-based recommendations
    if (system.performanceScore < 0.5) {
      recommendations.push({
        type: 'optimization',
        priority: 'medium',
        description: 'System performance is degraded - consider optimization',
        expectedOutcome: 'Improved automation speed and reliability',
        confidence: ConfidenceLevel.HIGH
      });
    }
    
    return recommendations;
  }

  private identifyContextualRisks(
    screen: ScreenAnalysis,
    app: ApplicationAnalysis,
    intent: IntentAnalysis,
    system: SystemAnalysis,
    history: HistoricalAnalysis
  ): ContextualRisk[] {
    const risks: ContextualRisk[] = [];
    
    // System instability risk
    if (system.stability === 'critical' || system.stability === 'unstable') {
      risks.push({
        type: 'system',
        severity: system.stability === 'critical' ? 'high' : 'medium',
        description: 'System instability may cause automation failures',
        probability: 0.7,
        mitigation: 'Monitor system resources and reduce automation load if necessary'
      });
    }
    
    // Complexity risk
    if (screen.complexity > 0.8 && intent.goalComplexity === 'very_complex') {
      risks.push({
        type: 'complexity',
        severity: 'medium',
        description: 'High UI and goal complexity may lead to errors',
        probability: 0.5,
        mitigation: 'Use more conservative automation strategies'
      });
    }
    
    return risks;
  }

  private generateContextHash(
    screen: ScreenAnalysis,
    app: ApplicationAnalysis,
    intent: IntentAnalysis,
    system: SystemAnalysis,
    history: HistoricalAnalysis
  ): string {
    // Simple hash generation for context caching
    const data = {
      activeApp: app.activeApplication,
      elementCount: screen.elementCount,
      goalHash: intent.primaryGoal.slice(0, 20),
      perfScore: Math.round(system.performanceScore * 100),
      successRate: Math.round(history.recentSuccessRate * 100)
    };
    
    return btoa(JSON.stringify(data)).slice(0, 16);
  }
}

// ============================================================================
// TYPE DEFINITIONS FOR CONTEXT ANALYSIS
// ============================================================================

export interface ContextAnalysis {
  timestamp: Date;
  processingTime: number;
  overallConfidence: ConfidenceLevel;
  screen: ScreenAnalysis;
  application: ApplicationAnalysis;
  intent: IntentAnalysis;
  system: SystemAnalysis;
  history: HistoricalAnalysis;
  insights: ContextInsight[];
  recommendations: ActionRecommendation[];
  riskFactors: ContextualRisk[];
  contextHash: string;
}

export interface ScreenAnalysis {
  elementCount: number;
  interactableCount: number;
  activeWindow: string;
  complexity: number;
  interactionOpportunities: InteractionOpportunity[];
  layoutPatterns: LayoutPattern[];
  confidence: ConfidenceLevel;
}

export interface ApplicationAnalysis {
  activeApplication: string;
  processCount: number;
  highResourceProcesses: Array<{pid: number; name: string; cpuUsage: number; memoryMB: number}>;
  systemLoad: SystemLoadCategory;
  memoryPressure: MemoryPressure;
  performanceImpact: number;
  confidence: ConfidenceLevel;
}

export interface IntentAnalysis {
  primaryGoal: string;
  subGoalCount: number;
  goalComplexity: GoalComplexity;
  constraintSeverity: ConstraintSeverity;
  preferenceConflicts: PreferenceConflict[];
  predictedActions: string[];
  confidence: ConfidenceLevel;
}

export interface SystemAnalysis {
  performanceScore: number;
  bottlenecks: PerformanceBottleneck[];
  resourceAvailability: ResourceAvailability;
  optimizationOpportunities: OptimizationOpportunity[];
  stability: SystemStability;
  confidence: ConfidenceLevel;
}

export interface HistoricalAnalysis {
  recentSuccessRate: number;
  strongPatterns: PatternInfo[];
  weakPatterns: PatternInfo[];
  trendAnalysis: TrendAnalysis;
  learningInsights: string[];
  dataQuality: DataQuality;
  confidence: ConfidenceLevel;
}

// Supporting types
export interface InteractionOpportunity {
  elementId: string;
  type: string;
  priority: number;
  confidence: ConfidenceLevel;
}

export interface LayoutPattern {
  type: string;
  confidence: number;
  elements: string[];
}

export type SystemLoadCategory = 'low' | 'medium' | 'high' | 'critical';
export type MemoryPressure = 'low' | 'medium' | 'high' | 'critical';
export type GoalComplexity = 'simple' | 'moderate' | 'complex' | 'very_complex';
export type ConstraintSeverity = 'none' | 'low' | 'medium' | 'high';

export interface PreferenceConflict {
  preference1: string;
  preference2: string;
  severity: string;
  resolution: string;
}

export interface PerformanceBottleneck {
  type: string;
  severity: string;
  value: number;
  recommendation: string;
}

export interface ResourceAvailability {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
}

export interface OptimizationOpportunity {
  type: string;
  description: string;
  impact: string;
  effort: string;
}

export type SystemStability = 'stable' | 'moderate' | 'unstable' | 'critical';

export interface TrendAnalysis {
  successTrend: 'improving' | 'stable' | 'declining';
  performanceTrend: 'improving' | 'stable' | 'declining';
  complexityTrend: 'increasing' | 'stable' | 'decreasing';
}

export type DataQuality = 'high' | 'medium' | 'low';

export interface ContextInsight {
  type: string;
  description: string;
  confidence: ConfidenceLevel;
  actionable: boolean;
  recommendation: string;
}

export interface ActionRecommendation {
  type: string;
  priority: string;
  description: string;
  expectedOutcome: string;
  confidence: ConfidenceLevel;
}

export interface ContextualRisk {
  type: string;
  severity: string;
  description: string;
  probability: number;
  mitigation: string;
}