/**
 * 🧠 Core Intelligence Types for Glass MCP Vision
 * Foundational interfaces and types for intelligent action system
 * Shared across context analysis, decision making, error recovery, and learning
 * 
 * Features:
 * - Comprehensive type definitions for all intelligence components
 * - Shared enums and constants for system-wide consistency
 * - Interface definitions for component communication
 * - Configuration types for system customization
 * 
 * @version 9.0.0
 * @author Glass MCP Vision Team
 */

// Core context analysis interfaces
export interface ContextSnapshot {
  id: string;
  timestamp: number;
  systemContext: SystemContext;
  applicationContext: ApplicationContext;
  userContext: UserContext;
  environmentContext: EnvironmentContext;
  confidence: number;
  metadata: ContextMetadata;
}

export interface SystemContext {
  processLoad: number;
  memoryUsage: number;
  diskSpace: number;
  networkConnectivity: NetworkStatus;
  activeWindows: WindowInfo[];
  systemTime: number;
  timeZone: string;
  systemResources: ResourceMetrics;
}

export interface ApplicationContext {
  activeApplication: ApplicationInfo;
  applicationHistory: ApplicationInfo[];
  applicationCapabilities: string[];
  applicationState: ApplicationState;
  openDocuments: DocumentInfo[];
  recentActions: ActionHistory[];
}

export interface UserContext {
  interactionPatterns: InteractionPattern[];
  preferences: UserPreferences;
  currentTask: TaskContext;
  behaviorProfile: BehaviorProfile;
  workingSession: SessionInfo;
  expertise: ExpertiseLevel;
}

export interface EnvironmentContext {
  workingDirectory: string;
  environmentVariables: Map<string, string>;
  installedSoftware: SoftwareInfo[];
  hardwareCapabilities: HardwareInfo;
  securityConstraints: SecurityConstraint[];
  organizationalPolicies: PolicyInfo[];
}

export interface ContextMetadata {
  analysisVersion: string;
  analysisTime: number;
  dataQuality: DataQuality;
  uncertaintyFactors: UncertaintyFactor[];
  validityPeriod: number;
  confidenceBreakdown: ConfidenceBreakdown;
}

// Decision making interfaces
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

export interface DecisionConstraint {
  id: string;
  type: ConstraintType;
  description: string;
  value: any;
  mandatory: boolean;
  weight: number;
}

export interface DecisionResponse {
  requestId: string;
  selectedOption: DecisionOption;
  confidence: number;
  reasoning: DecisionReasoning;
  alternativeOptions: AlternativeOption[];
  riskAssessment: RiskAssessment;
  executionPlan: ExecutionPlan;
  metadata: DecisionMetadata;
}

export interface DecisionOption {
  id: string;
  name: string;
  description: string;
  expectedOutcome: ExpectedOutcome;
  estimatedCost: Cost;
  riskLevel: RiskLevel;
  prerequisites: Prerequisite[];
  reversibility: ReversibilityInfo;
}

export interface DecisionCriterion {
  name: string;
  weight: number; // 0-1
  type: CriterionType;
  measurable: boolean;
  threshold?: number;
  evaluationMethod: EvaluationMethod;
}

export interface DecisionReasoning {
  primaryFactors: ReasoningFactor[];
  tradeoffs: Tradeoff[];
  assumptions: Assumption[];
  uncertainties: Uncertainty[];
  riskMitigation: RiskMitigation[];
  learningOpportunities: LearningOpportunity[];
}

// Error recovery interfaces
export interface ErrorContext {
  id: string;
  timestamp: number;
  errorType: ErrorType;
  errorMessage: string;
  stackTrace?: string;
  systemState: SystemContext;
  actionContext: ActionContext;
  severity: ErrorSeverity;
  recoverability: RecoverabilityAssessment;
}

export interface RecoveryStrategy {
  id: string;
  name: string;
  description: string;
  applicableErrors: ErrorType[];
  recoverySteps: RecoveryStep[];
  successProbability: number;
  estimatedTime: number;
  sideEffects: SideEffect[];
  prerequisites: RecoveryPrerequisite[];
}

export interface RecoveryStep {
  id: string;
  sequence: number;
  action: RecoveryAction;
  parameters: RecoveryParameters;
  expectedOutcome: RecoveryOutcome;
  rollbackPlan?: RollbackPlan;
  validation: ValidationStep;
  timeout: number;
}

export interface RecoveryResult {
  strategyId: string;
  success: boolean;
  executionTime: number;
  stepsCompleted: number;
  finalState: RecoveryState;
  lessonsLearned: LessonLearned[];
  recommendations: Recommendation[];
  metadata: RecoveryMetadata;
}

// Learning system interfaces
export interface LearningPattern {
  id: string;
  type: PatternType;
  description: string;
  confidence: number;
  supportingEvidence: Evidence[];
  applicableContexts: ContextPattern[];
  learnedAt: number;
  lastReinforced: number;
  usageCount: number;
  successRate: number;
}

export interface PerformanceMetrics {
  actionSuccessRate: number;
  averageExecutionTime: number;
  errorRate: number;
  userSatisfactionScore: number;
  systemEfficiency: number;
  learningEffectiveness: number;
  adaptabilityScore: number;
  timestamp: number;
}

export interface LearningObjective {
  id: string;
  name: string;
  description: string;
  targetMetric: string;
  currentValue: number;
  targetValue: number;
  deadline?: number;
  priority: ObjectivePriority;
  strategies: LearningStrategy[];
}

export interface KnowledgeBase {
  patterns: Map<string, LearningPattern>;
  rules: Map<string, InferenceRule>;
  facts: Map<string, Fact>;
  relationships: Map<string, Relationship>;
  metadata: KnowledgeMetadata;
  version: string;
  lastUpdated: number;
}

// Shared enums and types
export enum DecisionType {
  ACTION_SELECTION = 'action_selection',
  STRATEGY_CHOICE = 'strategy_choice',
  RESOURCE_ALLOCATION = 'resource_allocation',
  PRIORITY_ASSIGNMENT = 'priority_assignment',
  ESCALATION_DECISION = 'escalation_decision',
  OPTIMIZATION_CHOICE = 'optimization_choice',
  RISK_MITIGATION = 'risk_mitigation'
}

export enum DecisionPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum CriterionType {
  PERFORMANCE = 'performance',
  RELIABILITY = 'reliability',
  EFFICIENCY = 'efficiency',
  SAFETY = 'safety',
  COST = 'cost',
  USER_SATISFACTION = 'user_satisfaction',
  MAINTAINABILITY = 'maintainability'
}

export enum EvaluationMethod {
  QUANTITATIVE = 'quantitative',
  QUALITATIVE = 'qualitative',
  COMPARATIVE = 'comparative',
  THRESHOLD = 'threshold',
  WEIGHTED_SCORE = 'weighted_score'
}

export enum ErrorType {
  SYSTEM_ERROR = 'system_error',
  APPLICATION_ERROR = 'application_error',
  USER_ERROR = 'user_error',
  NETWORK_ERROR = 'network_error',
  TIMEOUT_ERROR = 'timeout_error',
  PERMISSION_ERROR = 'permission_error',
  RESOURCE_ERROR = 'resource_error',
  CONFIGURATION_ERROR = 'configuration_error'
}

export enum ErrorSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFORMATIONAL = 'informational'
}

export enum RecoveryAction {
  RETRY = 'retry',
  FALLBACK = 'fallback',
  RESTART = 'restart',
  ROLLBACK = 'rollback',
  ESCALATE = 'escalate',
  IGNORE = 'ignore',
  NOTIFY = 'notify',
  LOG = 'log'
}

export enum PatternType {
  BEHAVIOR = 'behavior',
  PERFORMANCE = 'performance',
  ERROR = 'error',
  SUCCESS = 'success',
  CONTEXT = 'context',
  DECISION = 'decision',
  OPTIMIZATION = 'optimization'
}

export enum RiskLevel {
  MINIMAL = 'minimal',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ExpertiseLevel {
  NOVICE = 'novice',
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export enum NetworkStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  LIMITED = 'limited',
  METERED = 'metered',
  UNKNOWN = 'unknown'
}

export enum ObjectivePriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

// Supporting interfaces
export interface WindowInfo {
  handle: number;
  title: string;
  processName: string;
  isVisible: boolean;
  bounds: Rectangle;
  zIndex: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ApplicationInfo {
  name: string;
  version: string;
  processId: number;
  windowHandle: number;
  startTime: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface ApplicationState {
  isResponding: boolean;
  currentView: string;
  loadedModules: string[];
  openDialogs: string[];
  lastActivity: number;
  resources: ResourceUsage;
}

export interface ResourceMetrics {
  cpu: CPUMetrics;
  memory: MemoryMetrics;
  disk: DiskMetrics;
  network: NetworkMetrics;
}

export interface CPUMetrics {
  usage: number;
  cores: number;
  frequency: number;
  temperature?: number;
}

export interface MemoryMetrics {
  total: number;
  used: number;
  available: number;
  committed: number;
}

export interface DiskMetrics {
  total: number;
  used: number;
  free: number;
  readSpeed: number;
  writeSpeed: number;
}

export interface NetworkMetrics {
  bandwidth: number;
  latency: number;
  packetLoss: number;
  connectionCount: number;
}

export interface DocumentInfo {
  path: string;
  name: string;
  type: string;
  lastModified: number;
  size: number;
  isModified: boolean;
}

export interface ActionHistory {
  timestamp: number;
  action: string;
  target: string;
  result: ActionResult;
  duration: number;
  context: string;
}

export interface ActionResult {
  success: boolean;
  errorMessage?: string;
  returnValue?: any;
  sideEffects?: string[];
}

export interface InteractionPattern {
  type: string;
  frequency: number;
  lastOccurrence: number;
  context: string[];
  successRate: number;
  averageDuration: number;
}

export interface UserPreferences {
  automationLevel: AutomationLevel;
  confirmationRequirements: ConfirmationSettings;
  timeoutSettings: TimeoutPreferences;
  qualitySettings: QualityPreferences;
  accessibilitySettings: AccessibilitySettings;
}

export enum AutomationLevel {
  MINIMAL = 'minimal',
  MODERATE = 'moderate',
  HIGH = 'high',
  MAXIMUM = 'maximum'
}

export interface ConfirmationSettings {
  highRiskActions: boolean;
  dataModification: boolean;
  systemChanges: boolean;
  fileOperations: boolean;
  networkOperations: boolean;
}

export interface TimeoutPreferences {
  defaultTimeout: number;
  networkTimeout: number;
  userInteractionTimeout: number;
  systemOperationTimeout: number;
}

export interface QualityPreferences {
  accuracyThreshold: number;
  speedPriority: number; // 0-1, 0=accuracy first, 1=speed first
  reliabilityRequirement: number;
  errorTolerance: number;
}

export interface AccessibilitySettings {
  screenReaderSupport: boolean;
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  keyboardNavigation: boolean;
}

export interface TaskContext {
  id: string;
  name: string;
  description: string;
  startTime: number;
  estimatedDuration: number;
  progress: number;
  subTasks: TaskInfo[];
  dependencies: string[];
}

export interface TaskInfo {
  id: string;
  name: string;
  status: TaskStatus;
  progress: number;
  startTime?: number;
  endTime?: number;
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface BehaviorProfile {
  workingHours: TimeRange[];
  commonApplications: string[];
  productivityPatterns: ProductivityPattern[];
  errorPatterns: ErrorPattern[];
  learningPreferences: LearningPreference[];
}

export interface TimeRange {
  start: string; // HH:MM format
  end: string; // HH:MM format
  daysOfWeek: number[]; // 0=Sunday, 1=Monday, etc.
}

export interface ProductivityPattern {
  timeOfDay: string;
  productivityScore: number;
  commonTasks: string[];
  averageTaskDuration: number;
}

export interface ErrorPattern {
  errorType: string;
  frequency: number;
  commonCauses: string[];
  recoverabilityScore: number;
  userFrustrationLevel: number;
}

export interface LearningPreference {
  style: LearningStyle;
  feedback: FeedbackPreference;
  adaptationSpeed: AdaptationSpeed;
  explainabilityRequirement: ExplainabilityLevel;
}

export enum LearningStyle {
  OBSERVATIONAL = 'observational',
  INTERACTIVE = 'interactive',
  GUIDED = 'guided',
  AUTONOMOUS = 'autonomous'
}

export enum FeedbackPreference {
  IMMEDIATE = 'immediate',
  PERIODIC = 'periodic',
  ON_DEMAND = 'on_demand',
  MINIMAL = 'minimal'
}

export enum AdaptationSpeed {
  SLOW = 'slow',
  MODERATE = 'moderate',
  FAST = 'fast',
  IMMEDIATE = 'immediate'
}

export enum ExplainabilityLevel {
  NONE = 'none',
  BASIC = 'basic',
  DETAILED = 'detailed',
  COMPREHENSIVE = 'comprehensive'
}

export interface SessionInfo {
  id: string;
  startTime: number;
  expectedDuration: number;
  sessionType: SessionType;
  objectives: string[];
  constraints: SessionConstraint[];
  quality: SessionQuality;
}

export enum SessionType {
  WORK = 'work',
  LEARNING = 'learning',
  MAINTENANCE = 'maintenance',
  EXPLORATION = 'exploration',
  TESTING = 'testing'
}

export interface SessionConstraint {
  type: ConstraintType;
  value: any;
  flexible: boolean;
  priority: number;
}

export enum ConstraintType {
  TIME = 'time',
  RESOURCE = 'resource',
  QUALITY = 'quality',
  RISK = 'risk',
  SCOPE = 'scope'
}

export interface SessionQuality {
  targetAccuracy: number;
  targetSpeed: number;
  targetReliability: number;
  targetUserSatisfaction: number;
}

export interface SoftwareInfo {
  name: string;
  version: string;
  vendor: string;
  installPath: string;
  capabilities: string[];
  limitations: string[];
}

export interface HardwareInfo {
  cpu: string;
  memory: number;
  storage: StorageInfo[];
  display: DisplayInfo[];
  inputDevices: InputDevice[];
  networkAdapters: NetworkAdapter[];
}

export interface StorageInfo {
  type: StorageType;
  capacity: number;
  available: number;
  speed: number;
}

export enum StorageType {
  HDD = 'hdd',
  SSD = 'ssd',
  NVME = 'nvme',
  NETWORK = 'network'
}

export interface DisplayInfo {
  resolution: Resolution;
  dpi: number;
  colorDepth: number;
  refreshRate: number;
  isPrimary: boolean;
}

export interface Resolution {
  width: number;
  height: number;
}

export interface InputDevice {
  type: InputDeviceType;
  name: string;
  capabilities: string[];
  isConnected: boolean;
}

export enum InputDeviceType {
  KEYBOARD = 'keyboard',
  MOUSE = 'mouse',
  TOUCHPAD = 'touchpad',
  TOUCHSCREEN = 'touchscreen',
  STYLUS = 'stylus',
  VOICE = 'voice'
}

export interface NetworkAdapter {
  name: string;
  type: NetworkType;
  speed: number;
  isConnected: boolean;
  ipAddress?: string;
}

export enum NetworkType {
  ETHERNET = 'ethernet',
  WIFI = 'wifi',
  CELLULAR = 'cellular',
  BLUETOOTH = 'bluetooth'
}

export interface SecurityConstraint {
  type: SecurityConstraintType;
  level: SecurityLevel;
  description: string;
  enforcement: EnforcementLevel;
  exceptions: SecurityException[];
}

export enum SecurityConstraintType {
  ACCESS_CONTROL = 'access_control',
  DATA_PROTECTION = 'data_protection',
  NETWORK_SECURITY = 'network_security',
  AUDIT_LOGGING = 'audit_logging',
  ENCRYPTION = 'encryption'
}

export enum SecurityLevel {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted',
  TOP_SECRET = 'top_secret'
}

export enum EnforcementLevel {
  ADVISORY = 'advisory',
  WARNING = 'warning',
  BLOCKING = 'blocking',
  CRITICAL = 'critical'
}

export interface SecurityException {
  condition: string;
  justification: string;
  approver: string;
  expirationDate?: number;
}

export interface PolicyInfo {
  id: string;
  name: string;
  type: PolicyType;
  rules: PolicyRule[];
  enforcement: EnforcementLevel;
  scope: PolicyScope;
}

export enum PolicyType {
  SECURITY = 'security',
  PRIVACY = 'privacy',
  COMPLIANCE = 'compliance',
  OPERATIONAL = 'operational',
  QUALITY = 'quality'
}

export interface PolicyRule {
  condition: string;
  action: PolicyAction;
  parameters: Map<string, any>;
  exceptions: PolicyException[];
}

export enum PolicyAction {
  ALLOW = 'allow',
  DENY = 'deny',
  REQUIRE_APPROVAL = 'require_approval',
  LOG_ONLY = 'log_only',
  WARN = 'warn'
}

export interface PolicyException {
  condition: string;
  action: PolicyAction;
  justification: string;
}

export interface PolicyScope {
  users: string[];
  applications: string[];
  resources: string[];
  timeFrames: TimeRange[];
}

// Additional utility interfaces
export interface DataQuality {
  completeness: number; // 0-1
  accuracy: number; // 0-1
  consistency: number; // 0-1
  timeliness: number; // 0-1
  reliability: number; // 0-1
}

export interface UncertaintyFactor {
  source: string;
  type: UncertaintyType;
  magnitude: number; // 0-1
  impact: ImpactLevel;
}

export enum UncertaintyType {
  DATA_MISSING = 'data_missing',
  DATA_OUTDATED = 'data_outdated',
  DATA_CONFLICTING = 'data_conflicting',
  MODEL_LIMITATION = 'model_limitation',
  EXTERNAL_DEPENDENCY = 'external_dependency'
}

export enum ImpactLevel {
  NEGLIGIBLE = 'negligible',
  MINOR = 'minor',
  MODERATE = 'moderate',
  MAJOR = 'major',
  CRITICAL = 'critical'
}

export interface ConfidenceBreakdown {
  overall: number;
  components: Map<string, number>;
  factors: ConfidenceFactor[];
  methodology: string;
}

export interface ConfidenceFactor {
  name: string;
  contribution: number; // -1 to 1
  weight: number; // 0-1
  description: string;
}

export interface ResourceUsage {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  handles: number;
  threads: number;
}

// Export utility functions for type checking and validation
export class IntelligenceTypeUtils {
  /**
   * Validate a context snapshot for completeness and consistency
   */
  public static validateContextSnapshot(context: ContextSnapshot): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Check required fields
    if (!context.id || context.id.trim().length === 0) {
      result.errors.push('Context snapshot ID is required');
      result.isValid = false;
    }

    if (context.timestamp <= 0) {
      result.errors.push('Context snapshot timestamp must be positive');
      result.isValid = false;
    }

    if (context.confidence < 0 || context.confidence > 1) {
      result.errors.push('Context confidence must be between 0 and 1');
      result.isValid = false;
    }

    // Check system context
    if (context.systemContext) {
      if (context.systemContext.processLoad < 0 || context.systemContext.processLoad > 1) {
        result.warnings.push('System process load should be between 0 and 1');
      }
      
      if (context.systemContext.memoryUsage < 0 || context.systemContext.memoryUsage > 1) {
        result.warnings.push('Memory usage should be between 0 and 1');
      }
    } else {
      result.errors.push('System context is required');
      result.isValid = false;
    }

    return result;
  }

  /**
   * Calculate confidence score based on multiple factors
   */
  public static calculateConfidence(factors: ConfidenceFactor[]): number {
    if (factors.length === 0) return 0;

    const weightedSum = factors.reduce((sum, factor) => {
      return sum + (factor.contribution * factor.weight);
    }, 0);

    const totalWeight = factors.reduce((sum, factor) => sum + factor.weight, 0);
    
    if (totalWeight === 0) return 0;

    const confidence = weightedSum / totalWeight;
    return Math.max(0, Math.min(1, confidence)); // Clamp to [0, 1]
  }

  /**
   * Merge multiple context snapshots with weighted averaging
   */
  public static mergeContextSnapshots(
    snapshots: ContextSnapshot[], 
    weights?: number[]
  ): ContextSnapshot | null {
    if (snapshots.length === 0) return null;
    if (snapshots.length === 1) return snapshots[0];

    // Use equal weights if not provided
    const actualWeights = weights || snapshots.map(() => 1 / snapshots.length);
    
    if (actualWeights.length !== snapshots.length) {
      throw new Error('Weights array length must match snapshots array length');
    }

    // Normalize weights
    const totalWeight = actualWeights.reduce((sum, w) => sum + w, 0);
    const normalizedWeights = actualWeights.map(w => w / totalWeight);

    // Create merged snapshot
    const mergedSnapshot: ContextSnapshot = {
      id: `merged_${Date.now()}`,
      timestamp: Date.now(),
      systemContext: this.mergeSystemContexts(snapshots.map(s => s.systemContext), normalizedWeights),
      applicationContext: snapshots[0].applicationContext, // Use first snapshot's app context
      userContext: snapshots[0].userContext, // Use first snapshot's user context
      environmentContext: snapshots[0].environmentContext, // Use first snapshot's env context
      confidence: this.calculateWeightedAverage(
        snapshots.map(s => s.confidence), 
        normalizedWeights
      ),
      metadata: {
        analysisVersion: '1.0.0',
        analysisTime: Date.now(),
        dataQuality: {
          completeness: 0.8,
          accuracy: 0.8,
          consistency: 0.8,
          timeliness: 0.9,
          reliability: 0.8
        },
        uncertaintyFactors: [],
        validityPeriod: 300000, // 5 minutes
        confidenceBreakdown: {
          overall: 0.8,
          components: new Map(),
          factors: [],
          methodology: 'weighted_merge'
        }
      }
    };

    return mergedSnapshot;
  }

  private static mergeSystemContexts(contexts: SystemContext[], weights: number[]): SystemContext {
    return {
      processLoad: this.calculateWeightedAverage(contexts.map(c => c.processLoad), weights),
      memoryUsage: this.calculateWeightedAverage(contexts.map(c => c.memoryUsage), weights),
      diskSpace: this.calculateWeightedAverage(contexts.map(c => c.diskSpace), weights),
      networkConnectivity: contexts[0].networkConnectivity, // Use first context
      activeWindows: contexts[0].activeWindows, // Use first context
      systemTime: Date.now(),
      timeZone: contexts[0].timeZone,
      systemResources: contexts[0].systemResources // Use first context
    };
  }

  private static calculateWeightedAverage(values: number[], weights: number[]): number {
    if (values.length !== weights.length) {
      throw new Error('Values and weights arrays must have same length');
    }

    const weightedSum = values.reduce((sum, value, index) => sum + value * weights[index], 0);
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Export default utility instance
export const intelligenceTypeUtils = new IntelligenceTypeUtils();
export default IntelligenceTypeUtils;