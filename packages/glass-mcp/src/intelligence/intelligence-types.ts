// ============================================================================
// Complete Intelligence Types for Glass MCP Visual Automation
// ============================================================================

// ============================================================================
// ENUMS AND BASIC TYPES
// ============================================================================

export enum DecisionType {
  AUTOMATION = 'automation',
  UI_INTERACTION = 'ui_interaction',
  ERROR_RECOVERY = 'error_recovery',
  LEARNING = 'learning',
  OPTIMIZATION = 'optimization'
}

export enum DecisionPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ConstraintType {
  RESOURCE = 'resource',
  TIME = 'time',
  PERMISSION = 'permission',
  SAFETY = 'safety',
  PERFORMANCE = 'performance'
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum RecoveryType {
  RETRY = 'retry',
  ROLLBACK = 'rollback',
  ALTERNATIVE = 'alternative',
  ESCALATION = 'escalation',
  ABORT = 'abort'
}

export enum LearningType {
  SUCCESS_PATTERN = 'success_pattern',
  FAILURE_PATTERN = 'failure_pattern',
  OPTIMIZATION = 'optimization',
  ADAPTATION = 'adaptation'
}

export enum ConfidenceLevel {
  VERY_LOW = 'very_low',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high'
}

// ============================================================================
// BASIC SUPPORTING INTERFACES
// ============================================================================

export interface Cost {
  timeMs: number;
  cpuUsage: number;
  memoryMB: number;
  riskScore: number;
}

export interface ExpectedOutcome {
  description: string;
  probability: number;
  confidence: ConfidenceLevel;
  expectedValue: number;
}

export interface Prerequisite {
  id: string;
  description: string;
  required: boolean;
  validated: boolean;
}

export interface ReversibilityInfo {
  isReversible: boolean;
  reversalSteps: string[];
  reversalCost: Cost;
  dataLoss: boolean;
}

export interface AlternativeOption {
  id: string;
  description: string;
  feasibility: number;
  cost: Cost;
  expectedOutcome: ExpectedOutcome;
}

export interface RiskFactor {
  id: string;
  description: string;
  impact: number;
  probability: number;
  category: string;
}

export interface RiskMitigation {
  riskId: string;
  strategy: string;
  effectiveness: number;
  cost: Cost;
}

export interface RiskAssessment {
  overallRisk: number;
  riskFactors: RiskFactor[];
  mitigation: RiskMitigation[];
  acceptableThreshold: number;
}

export interface ValidationRule {
  id: string;
  condition: string;
  expectedValue: any;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'exists';
}

export interface ValidationCriteria {
  rules: ValidationRule[];
  timeout: number;
  retryCount: number;
}

export interface ExecutionStep {
  id: string;
  description: string;
  order: number;
  duration: number;
  dependencies: string[];
  validation: ValidationCriteria;
}

export interface Checkpoint {
  stepId: string;
  validationRules: ValidationRule[];
  rollbackTrigger: boolean;
}

export interface RollbackStep {
  id: string;
  triggerStepId: string;
  actions: string[];
  validation: ValidationCriteria;
}

export interface ExecutionPlan {
  steps: ExecutionStep[];
  totalDuration: number;
  checkpoints: Checkpoint[];
  rollbackPlan: RollbackStep[];
}

export interface DecisionMetadata {
  createdAt: Date;
  createdBy: string;
  version: string;
  tags: string[];
  relatedDecisions: string[];
}

export interface DecisionConstraint {
  id: string;
  type: ConstraintType;
  description: string;
  value: any;
  mandatory: boolean;
  weight: number;
}

// ============================================================================
// REASONING AND ANALYSIS TYPES
// ============================================================================

export interface Evidence {
  source: string;
  data: any;
  reliability: number;
  timestamp: Date;
}

export interface ReasoningFactor {
  id: string;
  description: string;
  weight: number;
  evidence: Evidence[];
  confidence: ConfidenceLevel;
}

export interface Tradeoff {
  factor1: string;
  factor2: string;
  relationship: 'competing' | 'complementary' | 'neutral';
  impact: number;
}

export interface Assumption {
  id: string;
  description: string;
  confidence: ConfidenceLevel;
  validationMethod: string;
  criticalness: number;
}

export interface Uncertainty {
  factor: string;
  range: [number, number];
  distribution: 'uniform' | 'normal' | 'exponential';
  impact: number;
}

export interface LearningOpportunity {
  scenario: string;
  dataPoints: string[];
  expectedInsight: string;
  priority: number;
}

// ============================================================================
// CONTEXT AND ENVIRONMENT TYPES
// ============================================================================

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CursorInfo {
  position: [number, number];
  visible: boolean;
  shape: string;
}

export interface UIElement {
  id: string;
  type: string;
  bounds: Rectangle;
  properties: Record<string, any>;
  interactable: boolean;
}

export interface WindowInfo {
  handle: number;
  title: string;
  processId: number;
  bounds: Rectangle;
  isActive: boolean;
  zOrder: number;
}

export interface ScreenState {
  resolution: [number, number];
  activeWindows: WindowInfo[];
  cursor: CursorInfo;
  visibleElements: UIElement[];
  screenshot: string; // base64
}

export interface ProcessInfo {
  pid: number;
  name: string;
  cpuUsage: number;
  memoryMB: number;
}

export interface ApplicationState {
  activeApplication: string;
  runningProcesses: ProcessInfo[];
  systemLoad: number;
  memoryUsage: number;
}

export interface UserIntent {
  primaryGoal: string;
  subGoals: string[];
  context: string;
  constraints: string[];
  preferences: Record<string, any>;
}

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkActivity: number;
  timestamp: Date;
}

export interface ActionHistory {
  timestamp: Date;
  action: string;
  target: string;
  outcome: 'success' | 'failure' | 'partial';
  duration: number;
}

export interface PatternInfo {
  pattern: string;
  frequency: number;
  successRate: number;
  lastSeen: Date;
}

export interface HistoricalContext {
  recentActions: ActionHistory[];
  successPatterns: PatternInfo[];
  failurePatterns: PatternInfo[];
  learningInsights: string[];
}

export interface ContextSnapshot {
  timestamp: Date;
  screenState: ScreenState;
  applicationState: ApplicationState;
  userIntent: UserIntent;
  systemMetrics: SystemMetrics;
  historicalContext: HistoricalContext;
}

// ============================================================================
// ERROR AND RECOVERY TYPES
// ============================================================================

export interface EnvironmentInfo {
  windowTitle: string;
  processName: string;
  screenResolution: [number, number];
  activeElements: string[];
}

export interface ActionContext {
  targetElement: string;
  actionType: string;
  parameters: Record<string, any>;
  environment: EnvironmentInfo;
}

export interface RecoverabilityAssessment {
  canRecover: boolean;
  recoveryStrategies: RecoveryStrategy[];
  estimatedRecoveryTime: number;
  dataLossRisk: number;
}

export interface ErrorDetails {
  message: string;
  code: string;
  stack?: string;
  userFriendlyMessage: string;
  category: string;
}

export interface SideEffect {
  description: string;
  probability: number;
  severity: ErrorSeverity;
  mitigation: string;
}

export interface RecoveryPrerequisite {
  id: string;
  description: string;
  validationMethod: string;
  required: boolean;
}

export interface RecoveryParameters {
  maxRetries: number;
  timeout: number;
  rollbackOnFailure: boolean;
  notifyOnRecovery: boolean;
}

export interface RecoveryMetrics {
  timeToRecovery: number;
  resourcesUsed: Cost;
  dataRecovered: number;
  confidenceScore: number;
}

export interface RecoveryOutcome {
  success: boolean;
  description: string;
  metrics: RecoveryMetrics;
  lessonsLearned: string[];
}

// Forward declare RecoveryStep to avoid circular dependency
export interface RecoveryStep {
  id: string;
  description: string;
  order: number;
  parameters: RecoveryParameters;
  expectedOutcome: RecoveryOutcome;
  validation: ValidationCriteria;
}

export interface RecoveryStrategy {
  id: string;
  type: RecoveryType;
  description: string;
  applicability: number;
  successRate: number;
  sideEffects: SideEffect[];
  prerequisites: RecoveryPrerequisite[];
  steps: RecoveryStep[];
}

export interface ErrorContext {
  errorId: string;
  timestamp: Date;
  severity: ErrorSeverity;
  actionContext: ActionContext;
  errorDetails: ErrorDetails;
  recoverability: RecoverabilityAssessment;
}

// ============================================================================
// LEARNING SYSTEM TYPES
// ============================================================================

export interface LearningFactor {
  name: string;
  value: any;
  impact: number;
  category: string;
}

export interface LearningContext {
  scenario: string;
  outcome: 'success' | 'failure' | 'partial';
  factors: LearningFactor[];
  insights: string[];
  applicability: string[];
}

export interface LearningPattern {
  id: string;
  type: LearningType;
  pattern: string;
  confidence: ConfidenceLevel;
  applicability: string[];
  evidence: Evidence[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// DECISION SYSTEM INTERFACES
// ============================================================================

export interface DecisionOption {
  id: string;
  description: string;
  feasibility: number;
  alternativeOptions: AlternativeOption[];
  riskAssessment: RiskAssessment;
  executionPlan: ExecutionPlan;
  metadata: DecisionMetadata;
}

export interface DecisionCriterion {
  id: string;
  name: string;
  weight: number;
  expectedOutcome: ExpectedOutcome;
  estimatedCost: Cost;
  successProbability: number;
  prerequisites: Prerequisite[];
  reversibility: ReversibilityInfo;
}

export interface DecisionRequest {
  id: string;
  type: DecisionType;
  context: ContextSnapshot;
  options: DecisionOption[];
  constraints: DecisionConstraint[];
  criteria: DecisionCriterion[];
  timeout: number;
  priority: DecisionPriority;
}

export interface DecisionReasoning {
  primaryFactors: ReasoningFactor[];
  tradeoffs: Tradeoff[];
  assumptions: Assumption[];
  uncertainties: Uncertainty[];
  riskMitigation: RiskMitigation[];
  learningOpportunities: LearningOpportunity[];
}

export interface OptionRanking {
  optionId: string;
  score: number;
  rank: number;
  reasoning: string;
}

export interface DecisionResponse {
  requestId: string;
  selectedOptionId: string;
  confidence: ConfidenceLevel;
  reasoning: DecisionReasoning;
  alternativeRanking: OptionRanking[];
  warnings: string[];
  recommendations: string[];
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export class IntelligenceUtils {
  static calculateConfidence(factors: ReasoningFactor[]): ConfidenceLevel {
    if (!factors.length) return ConfidenceLevel.MEDIUM;

    const avgConfidence = factors.reduce((sum, f) => {
      const confValue = this.confidenceToNumber(f.confidence);
      return sum + (confValue * f.weight);
    }, 0) / factors.reduce((sum, f) => sum + f.weight, 0);

    return this.numberToConfidence(avgConfidence);
  }

  static confidenceToNumber(confidence: ConfidenceLevel): number {
    switch (confidence) {
      case ConfidenceLevel.VERY_LOW: return 0.1;
      case ConfidenceLevel.LOW: return 0.3;
      case ConfidenceLevel.MEDIUM: return 0.5;
      case ConfidenceLevel.HIGH: return 0.7;
      case ConfidenceLevel.VERY_HIGH: return 0.9;
      default: return 0.5;
    }
  }

  static numberToConfidence(value: number): ConfidenceLevel {
    if (value <= 0.2) return ConfidenceLevel.VERY_LOW;
    if (value <= 0.4) return ConfidenceLevel.LOW;
    if (value <= 0.6) return ConfidenceLevel.MEDIUM;
    if (value <= 0.8) return ConfidenceLevel.HIGH;
    return ConfidenceLevel.VERY_HIGH;
  }

  static calculateRiskScore(factors: RiskFactor[]): number {
    if (!factors.length) return 0;
    return factors.reduce((total, factor) => 
      total + (factor.impact * factor.probability), 0
    ) / factors.length;
  }

  static validateDecisionRequest(request: DecisionRequest): string[] {
    const errors: string[] = [];
    
    if (!request.id) errors.push('Decision ID is required');
    if (!request.options.length) errors.push('At least one option is required');
    if (request.timeout <= 0) errors.push('Timeout must be positive');
    
    return errors;
  }

  static prioritizeOptions(options: DecisionOption[]): OptionRanking[] {
    return options
      .map((option, index) => ({
        optionId: option.id,
        score: this.calculateOptionScore(option),
        rank: index + 1,
        reasoning: `Feasibility: ${option.feasibility}, Risk: ${option.riskAssessment.overallRisk}`
      }))
      .sort((a, b) => b.score - a.score)
      .map((option, index) => ({ ...option, rank: index + 1 }));
  }

  private static calculateOptionScore(option: DecisionOption): number {
    const riskPenalty = option.riskAssessment.overallRisk * 0.3;
    const feasibilityBonus = option.feasibility * 0.7;
    return feasibilityBonus - riskPenalty;
  }

  static createContextSnapshot(
    screenState: ScreenState,
    applicationState: ApplicationState,
    userIntent: UserIntent,
    systemMetrics: SystemMetrics,
    historicalContext: HistoricalContext
  ): ContextSnapshot {
    return {
      timestamp: new Date(),
      screenState,
      applicationState,
      userIntent,
      systemMetrics,
      historicalContext
    };
  }

  static assessRecoverability(
    error: ErrorDetails,
    context: ActionContext,
    severity: ErrorSeverity
  ): RecoverabilityAssessment {
    // Basic recoverability assessment logic
    const canRecover = severity !== ErrorSeverity.CRITICAL;
    const recoveryStrategies: RecoveryStrategy[] = [];
    
    if (canRecover) {
      recoveryStrategies.push({
        id: 'retry-strategy',
        type: RecoveryType.RETRY,
        description: 'Retry the failed action',
        applicability: 0.8,
        successRate: 0.6,
        sideEffects: [],
        prerequisites: [],
        steps: []
      });
    }

    return {
      canRecover,
      recoveryStrategies,
      estimatedRecoveryTime: canRecover ? 1000 : 0,
      dataLossRisk: severity === ErrorSeverity.CRITICAL ? 0.8 : 0.1
    };
  }
}

// ============================================================================
// TYPE GUARDS AND VALIDATION
// ============================================================================

export const TypeGuards = {
  isDecisionRequest: (obj: any): obj is DecisionRequest => {
    return obj && 
           typeof obj.id === 'string' &&
           typeof obj.type === 'string' &&
           Array.isArray(obj.options) &&
           Array.isArray(obj.constraints);
  },

  isErrorContext: (obj: any): obj is ErrorContext => {
    return obj &&
           typeof obj.errorId === 'string' &&
           obj.timestamp instanceof Date &&
           typeof obj.severity === 'string';
  },

  isLearningPattern: (obj: any): obj is LearningPattern => {
    return obj &&
           typeof obj.id === 'string' &&
           typeof obj.type === 'string' &&
           typeof obj.pattern === 'string';
  }
};