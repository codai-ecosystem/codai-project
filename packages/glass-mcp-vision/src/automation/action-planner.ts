/**
 * 🧠 Intelligent Action Planner for Glass MCP Vision
 * Context-aware action planning with intelligent decision making,
 * task decomposition, and execution strategy optimization
 * 
 * Features:
 * - Context-aware action sequence planning
 * - Multi-step task decomposition with dependency management
 * - Intelligent element interaction strategy selection
 * - Adaptive retry mechanisms with backoff strategies
 * - Goal-oriented planning with success criteria validation
 * - Performance optimization and resource management
 * 
 * @version 9.0.0
 * @author Glass MCP Vision Team
 */

import { performance } from 'perf_hooks';
import { DetectedElement, ElementType, InteractionMethod, PopupInfo, PopupPriority } from './element-detector';

// Core interfaces for action planning
export interface ActionPlan {
  id: string;
  goal: ActionGoal;
  steps: ActionStep[];
  estimatedDuration: number;
  confidence: number;
  prerequisites: ActionPrerequisite[];
  fallbackStrategies: FallbackStrategy[];
  metadata: ActionPlanMetadata;
}

export interface ActionGoal {
  description: string;
  type: GoalType;
  targetElement?: DetectedElement;
  targetValue?: string;
  successCriteria: SuccessCriterion[];
  priority: GoalPriority;
  timeout: number;
}

export enum GoalType {
  CLICK_ELEMENT = 'click_element',
  TYPE_TEXT = 'type_text',
  SELECT_OPTION = 'select_option',
  NAVIGATE_TO = 'navigate_to',
  WAIT_FOR_ELEMENT = 'wait_for_element',
  DISMISS_POPUP = 'dismiss_popup',
  FILL_FORM = 'fill_form',
  EXTRACT_DATA = 'extract_data',
  VERIFY_STATE = 'verify_state',
  COMPLEX_WORKFLOW = 'complex_workflow'
}

export interface ActionStep {
  id: string;
  sequence: number;
  action: ActionType;
  targetElement?: DetectedElement;
  parameters: ActionParameters;
  expectedOutcome: ExpectedOutcome;
  retry: RetryConfiguration;
  dependencies: string[]; // IDs of prerequisite steps
  alternatives: AlternativeAction[];
  validation: StepValidation;
}

export enum ActionType {
  CLICK = 'click',
  DOUBLE_CLICK = 'double_click',
  RIGHT_CLICK = 'right_click',
  TYPE_TEXT = 'type_text',
  CLEAR_TEXT = 'clear_text',
  SELECT_OPTION = 'select_option',
  CHECK_CHECKBOX = 'check_checkbox',
  UNCHECK_CHECKBOX = 'uncheck_checkbox',
  SELECT_RADIO = 'select_radio',
  HOVER = 'hover',
  DRAG_DROP = 'drag_drop',
  SCROLL = 'scroll',
  PRESS_KEY = 'press_key',
  WAIT = 'wait',
  VERIFY = 'verify',
  CAPTURE_SCREENSHOT = 'capture_screenshot',
  EXTRACT_TEXT = 'extract_text'
}

export interface ActionParameters {
  text?: string;
  coordinates?: { x: number; y: number };
  keys?: string[];
  timeout?: number;
  scrollDirection?: 'up' | 'down' | 'left' | 'right';
  scrollAmount?: number;
  dragTarget?: DetectedElement;
  verificationCriteria?: VerificationCriterion[];
  retryOnFailure?: boolean;
  customData?: Map<string, any>;
}

export interface ExpectedOutcome {
  stateChanges: StateChange[];
  newElements: ElementExpectation[];
  disappearingElements: string[]; // Element IDs
  performanceThresholds: PerformanceThreshold[];
  successIndicators: SuccessIndicator[];
}

export interface StateChange {
  elementId: string;
  property: string;
  expectedValue: any;
  tolerance?: number;
}

export interface ElementExpectation {
  type: ElementType;
  properties: Partial<DetectedElement['properties']>;
  location?: 'near' | 'inside' | 'after' | 'before';
  referenceElementId?: string;
  timeout: number;
}

export interface PerformanceThreshold {
  metric: 'response_time' | 'cpu_usage' | 'memory_usage';
  threshold: number;
  unit: string;
}

export interface SuccessIndicator {
  type: 'element_state' | 'text_content' | 'visual_indicator' | 'system_state';
  criteria: string;
  validation: ValidationMethod;
}

export enum ValidationMethod {
  EXACT_MATCH = 'exact_match',
  CONTAINS = 'contains',
  REGEX_MATCH = 'regex_match',
  VISUAL_COMPARISON = 'visual_comparison',
  THRESHOLD_CHECK = 'threshold_check'
}

export interface RetryConfiguration {
  maxAttempts: number;
  backoffStrategy: BackoffStrategy;
  initialDelay: number;
  maxDelay: number;
  retryConditions: RetryCondition[];
}

export enum BackoffStrategy {
  LINEAR = 'linear',
  EXPONENTIAL = 'exponential',
  FIXED = 'fixed',
  CUSTOM = 'custom'
}

export interface RetryCondition {
  errorType: string;
  shouldRetry: boolean;
  customDelay?: number;
}

export interface AlternativeAction {
  action: ActionType;
  parameters: ActionParameters;
  condition: string; // When to use this alternative
  confidence: number;
}

export interface StepValidation {
  preConditions: ValidationRule[];
  postConditions: ValidationRule[];
  skipValidation: boolean;
  customValidator?: string;
}

export interface ValidationRule {
  type: ValidationType;
  target: string; // Element ID or property path
  operator: ValidationOperator;
  expectedValue: any;
  tolerance?: number;
}

export enum ValidationType {
  ELEMENT_EXISTS = 'element_exists',
  ELEMENT_VISIBLE = 'element_visible',
  ELEMENT_ENABLED = 'element_enabled',
  TEXT_CONTENT = 'text_content',
  ATTRIBUTE_VALUE = 'attribute_value',
  CUSTOM = 'custom'
}

export enum ValidationOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  MATCHES = 'matches'
}

export interface SuccessCriterion {
  description: string;
  type: CriterionType;
  validation: ValidationRule;
  weight: number; // 0-1, for weighted success calculation
}

export enum CriterionType {
  MANDATORY = 'mandatory',
  OPTIONAL = 'optional',
  BONUS = 'bonus'
}

export enum GoalPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export interface ActionPrerequisite {
  type: PrerequisiteType;
  description: string;
  validation: ValidationRule;
  canSkip: boolean;
}

export enum PrerequisiteType {
  ELEMENT_AVAILABLE = 'element_available',
  APPLICATION_STATE = 'application_state',
  SYSTEM_STATE = 'system_state',
  USER_PERMISSION = 'user_permission',
  NETWORK_CONNECTIVITY = 'network_connectivity'
}

export interface FallbackStrategy {
  id: string;
  description: string;
  trigger: FallbackTrigger;
  alternativePlan: ActionPlan;
  confidence: number;
}

export interface FallbackTrigger {
  condition: TriggerCondition;
  threshold: number;
  maxFailures: number;
}

export enum TriggerCondition {
  STEP_FAILURE = 'step_failure',
  TIMEOUT = 'timeout',
  ELEMENT_NOT_FOUND = 'element_not_found',
  UNEXPECTED_STATE = 'unexpected_state',
  PERFORMANCE_DEGRADATION = 'performance_degradation'
}

export interface ActionPlanMetadata {
  createdAt: number;
  estimatedComplexity: ComplexityLevel;
  requiredCapabilities: string[];
  riskAssessment: RiskAssessment;
  tags: string[];
  customData: Map<string, any>;
}

export enum ComplexityLevel {
  SIMPLE = 'simple',
  MODERATE = 'moderate',
  COMPLEX = 'complex',
  EXPERT = 'expert'
}

export interface RiskAssessment {
  overallRisk: RiskLevel;
  riskFactors: RiskFactor[];
  mitigation: string[];
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface RiskFactor {
  factor: string;
  impact: RiskLevel;
  probability: number; // 0-1
  mitigation?: string;
}

// Configuration and options
export interface ActionPlannerOptions {
  maxPlanningTime: number;
  defaultTimeout: number;
  enableIntelligentRetry: boolean;
  enablePerformanceOptimization: boolean;
  riskTolerance: RiskLevel;
  complexityPreference: ComplexityLevel;
  enableFallbackStrategies: boolean;
  maxFallbackDepth: number;
  enableLearning: boolean;
  learningDataPath?: string;
}

// Planning context interface
export interface PlanningContext {
  currentState: SystemState;
  availableElements: DetectedElement[];
  userPreferences: UserPreferences;
  applicationContext: ApplicationContext;
  environmentConstraints: EnvironmentConstraint[];
  historicalData: HistoricalData;
}

export interface SystemState {
  focusedElement?: DetectedElement;
  activeWindows: DetectedElement[];
  modals: DetectedElement[];
  popups: DetectedElement[];
  systemLoad: number;
  availableMemory: number;
}

export interface UserPreferences {
  preferredInteractionSpeed: 'slow' | 'normal' | 'fast';
  enableAnimations: boolean;
  accessibilityMode: boolean;
  confirmActions: boolean;
  debugMode: boolean;
}

export interface ApplicationContext {
  name: string;
  version?: string;
  capabilities: string[];
  limitations: string[];
  knownIssues: string[];
}

export interface EnvironmentConstraint {
  type: ConstraintType;
  description: string;
  impact: ImpactLevel;
  workaround?: string;
}

export enum ConstraintType {
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  ACCESSIBILITY = 'accessibility',
  NETWORK = 'network',
  HARDWARE = 'hardware'
}

export enum ImpactLevel {
  MINIMAL = 'minimal',
  MODERATE = 'moderate',
  SIGNIFICANT = 'significant',
  BLOCKING = 'blocking'
}

export interface HistoricalData {
  successfulPlans: ActionPlanSummary[];
  failedPlans: ActionPlanSummary[];
  performanceMetrics: PlanningPerformanceMetrics;
  learnedPatterns: LearnedPattern[];
}

export interface ActionPlanSummary {
  goalType: GoalType;
  complexity: ComplexityLevel;
  duration: number;
  successRate: number;
  commonFailures: string[];
}

export interface PlanningPerformanceMetrics {
  averagePlanningTime: number;
  averageExecutionTime: number;
  successRate: number;
  optimizationImpact: number;
}

export interface LearnedPattern {
  pattern: string;
  confidence: number;
  applicationContext: string[];
  successRate: number;
  recommendedActions: string[];
}

export interface VerificationCriterion {
  type: string;
  value: any;
  tolerance?: number;
}

/**
 * Intelligent Action Planner
 * Provides comprehensive action planning with context awareness and optimization
 */
export class ActionPlanner {
  private static instance: ActionPlanner | null = null;
  private isInitialized: boolean = false;
  private options: ActionPlannerOptions;
  private planningHistory: Map<string, ActionPlan[]>;
  private performanceMetrics: PlanningPerformanceMetrics;

  // Strategy patterns for different goal types
  private static readonly PLANNING_STRATEGIES: Partial<{ [key in GoalType]: {
    complexity: ComplexityLevel;
    defaultTimeout: number;
    retryAttempts: number;
  } }> = {
    [GoalType.CLICK_ELEMENT]: {
      complexity: ComplexityLevel.SIMPLE,
      defaultTimeout: 5000,
      retryAttempts: 3,
    },
    [GoalType.TYPE_TEXT]: {
      complexity: ComplexityLevel.SIMPLE,
      defaultTimeout: 10000,
      retryAttempts: 2,
    },
    [GoalType.DISMISS_POPUP]: {
      complexity: ComplexityLevel.MODERATE,
      defaultTimeout: 15000,
      retryAttempts: 5,
    },
    [GoalType.FILL_FORM]: {
      complexity: ComplexityLevel.COMPLEX,
      defaultTimeout: 60000,
      retryAttempts: 3,
    },
    [GoalType.COMPLEX_WORKFLOW]: {
      complexity: ComplexityLevel.EXPERT,
      defaultTimeout: 300000,
      retryAttempts: 2,
    },
  };

  private constructor(options?: Partial<ActionPlannerOptions>) {
    this.options = {
      maxPlanningTime: 30000,
      defaultTimeout: 15000,
      enableIntelligentRetry: true,
      enablePerformanceOptimization: true,
      riskTolerance: RiskLevel.MEDIUM,
      complexityPreference: ComplexityLevel.MODERATE,
      enableFallbackStrategies: true,
      maxFallbackDepth: 3,
      enableLearning: true,
      ...options,
    };

    this.planningHistory = new Map();
    this.performanceMetrics = {
      averagePlanningTime: 0,
      averageExecutionTime: 0,
      successRate: 0,
      optimizationImpact: 0,
    };
  }

  /**
   * Get singleton instance of ActionPlanner
   */
  public static getInstance(options?: Partial<ActionPlannerOptions>): ActionPlanner {
    if (!ActionPlanner.instance) {
      ActionPlanner.instance = new ActionPlanner(options);
    }
    return ActionPlanner.instance;
  }

  /**
   * Initialize the action planner
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      const startTime = performance.now();

      // Load historical data if learning is enabled
      if (this.options.enableLearning) {
        await this.loadHistoricalData();
      }

      this.isInitialized = true;
      const endTime = performance.now();
      
      console.log(`✅ Action Planner initialized in ${(endTime - startTime).toFixed(2)}ms`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to initialize Action Planner: ${errorMessage}`);
    }
  }

  /**
   * Create an action plan for a specific goal
   */
  public async createPlan(goal: ActionGoal, context: PlanningContext): Promise<ActionPlan> {
    this.ensureInitialized();
    const startTime = performance.now();

    try {
      // Analyze the goal and context
      const analysis = await this.analyzeGoalAndContext(goal, context);
      
      // Generate action steps based on goal type
      const steps = await this.generateActionSteps(goal, context, analysis);
      
      // Optimize the plan
      const optimizedSteps = this.options.enablePerformanceOptimization
        ? await this.optimizePlan(steps, context)
        : steps;
      
      // Create fallback strategies
      const fallbackStrategies = this.options.enableFallbackStrategies
        ? await this.createFallbackStrategies(goal, context)
        : [];
      
      // Assess prerequisites
      const prerequisites = await this.identifyPrerequisites(goal, context);
      
      // Calculate plan metadata
      const metadata = await this.calculatePlanMetadata(goal, optimizedSteps, context);

      const plan: ActionPlan = {
        id: this.generatePlanId(),
        goal,
        steps: optimizedSteps,
        estimatedDuration: this.calculateEstimatedDuration(optimizedSteps),
        confidence: this.calculatePlanConfidence(optimizedSteps, analysis),
        prerequisites,
        fallbackStrategies,
        metadata,
      };

      // Store plan in history
      this.storePlanInHistory(plan);

      const endTime = performance.now();
      this.updatePlanningMetrics(endTime - startTime);
      
      return plan;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to create action plan: ${errorMessage}`);
    }
  }

  /**
   * Create a plan to dismiss a specific popup
   */
  public async createPopupDismissalPlan(
    popup: DetectedElement,
    popupInfo: PopupInfo,
    context: PlanningContext
  ): Promise<ActionPlan> {
    const goal: ActionGoal = {
      description: `Dismiss ${popupInfo.popupType} popup`,
      type: GoalType.DISMISS_POPUP,
      targetElement: popup,
      successCriteria: [
        {
          description: 'Popup is no longer visible',
          type: CriterionType.MANDATORY,
          validation: {
            type: ValidationType.ELEMENT_EXISTS,
            target: popup.id,
            operator: ValidationOperator.EQUALS,
            expectedValue: false,
          },
          weight: 1.0,
        },
      ],
      priority: this.mapPopupPriorityToGoalPriority(popupInfo.priority),
      timeout: popupInfo.timeout || this.options.defaultTimeout,
    };

    return this.createPlan(goal, context);
  }

  /**
   * Create a plan for complex form filling
   */
  public async createFormFillingPlan(
    formData: Map<string, string>,
    context: PlanningContext
  ): Promise<ActionPlan> {
    const goal: ActionGoal = {
      description: 'Fill form with provided data',
      type: GoalType.FILL_FORM,
      successCriteria: [
        {
          description: 'All form fields populated correctly',
          type: CriterionType.MANDATORY,
          validation: {
            type: ValidationType.CUSTOM,
            target: 'form_validation',
            operator: ValidationOperator.EQUALS,
            expectedValue: true,
          },
          weight: 1.0,
        },
      ],
      priority: GoalPriority.HIGH,
      timeout: 60000,
    };

    const plan = await this.createPlan(goal, context);
    
    // Enhance plan with form-specific steps
    await this.enhanceFormFillingPlan(plan, formData, context);
    
    return plan;
  }

  /**
   * Optimize an existing plan based on performance data
   */
  public async optimizePlan(steps: ActionStep[], context: PlanningContext): Promise<ActionStep[]> {
    if (!this.options.enablePerformanceOptimization) {
      return steps;
    }

    const optimizedSteps = [...steps];

    // Apply learned optimizations
    for (let i = 0; i < optimizedSteps.length; i++) {
      const step = optimizedSteps[i];
      
      // Optimize timeouts based on historical data
      step.parameters.timeout = this.optimizeTimeout(step, context);
      
      // Optimize retry configurations
      step.retry = this.optimizeRetryConfiguration(step, context);
      
      // Add intelligent alternatives
      step.alternatives = await this.generateAlternatives(step, context);
    }

    // Remove redundant steps
    return this.removeRedundantSteps(optimizedSteps);
  }

  /**
   * Validate a plan before execution
   */
  public async validatePlan(plan: ActionPlan, context: PlanningContext): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      issues: [],
      warnings: [],
      recommendations: [],
    };

    // Check prerequisites
    for (const prerequisite of plan.prerequisites) {
      if (!await this.validatePrerequisite(prerequisite, context)) {
        result.issues.push(`Prerequisite not met: ${prerequisite.description}`);
        if (!prerequisite.canSkip) {
          result.isValid = false;
        }
      }
    }

    // Validate step dependencies
    for (const step of plan.steps) {
      for (const dependencyId of step.dependencies) {
        const dependency = plan.steps.find(s => s.id === dependencyId);
        if (!dependency) {
          result.issues.push(`Step ${step.id} has invalid dependency: ${dependencyId}`);
          result.isValid = false;
        }
      }
    }

    // Check for potential conflicts
    const conflicts = await this.detectStepConflicts(plan.steps, context);
    result.warnings.push(...conflicts);

    // Risk assessment
    if (plan.metadata.riskAssessment.overallRisk === RiskLevel.HIGH) {
      result.warnings.push('Plan has high risk level - consider fallback strategies');
    }

    return result;
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): PlanningPerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Get planning history for analysis
   */
  public getPlanningHistory(): Map<string, ActionPlan[]> {
    return new Map(this.planningHistory);
  }

  /**
   * Clear planning history
   */
  public clearHistory(): void {
    this.planningHistory.clear();
    console.log('🗑️ Action Planner history cleared');
  }

  /**
   * Dispose resources and cleanup
   */
  public dispose(): void {
    this.clearHistory();
    this.isInitialized = false;
    console.log('🔌 Action Planner disposed');
  }

  // Private helper methods

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('Action Planner not initialized. Call initialize() first.');
    }
  }

  private async analyzeGoalAndContext(goal: ActionGoal, context: PlanningContext): Promise<GoalAnalysis> {
    return {
      complexity: this.assessGoalComplexity(goal, context),
      feasibility: await this.assessGoalFeasibility(goal, context),
      risks: await this.assessGoalRisks(goal, context),
      resourceRequirements: this.calculateResourceRequirements(goal),
      estimatedSteps: this.estimateRequiredSteps(goal),
    };
  }

  private async generateActionSteps(
    goal: ActionGoal,
    context: PlanningContext,
    analysis: GoalAnalysis
  ): Promise<ActionStep[]> {
    const steps: ActionStep[] = [];
    const strategy = ActionPlanner.PLANNING_STRATEGIES[goal.type];

    switch (goal.type) {
      case GoalType.CLICK_ELEMENT:
        steps.push(...await this.generateClickSteps(goal, context));
        break;
        
      case GoalType.TYPE_TEXT:
        steps.push(...await this.generateTypeSteps(goal, context));
        break;
        
      case GoalType.DISMISS_POPUP:
        steps.push(...await this.generatePopupDismissalSteps(goal, context));
        break;
        
      case GoalType.FILL_FORM:
        steps.push(...await this.generateFormSteps(goal, context));
        break;
        
      default:
        steps.push(...await this.generateGenericSteps(goal, context));
    }

    // Add common validation steps
    steps.push(this.createValidationStep(goal));

    return steps;
  }

  private async generateClickSteps(goal: ActionGoal, context: PlanningContext): Promise<ActionStep[]> {
    if (!goal.targetElement) {
      throw new Error('Target element required for click goal');
    }

    return [
      {
        id: this.generateStepId(),
        sequence: 1,
        action: ActionType.CLICK,
        targetElement: goal.targetElement,
        parameters: {
          timeout: 5000,
          retryOnFailure: true,
        },
        expectedOutcome: {
          stateChanges: [
            {
              elementId: goal.targetElement.id,
              property: 'hasFocus',
              expectedValue: true,
            },
          ],
          newElements: [],
          disappearingElements: [],
          performanceThresholds: [
            {
              metric: 'response_time',
              threshold: 1000,
              unit: 'ms',
            },
          ],
          successIndicators: [
            {
              type: 'element_state',
              criteria: 'element_clicked',
              validation: ValidationMethod.EXACT_MATCH,
            },
          ],
        },
        retry: this.createDefaultRetryConfig(),
        dependencies: [],
        alternatives: [],
        validation: {
          preConditions: [
            {
              type: ValidationType.ELEMENT_EXISTS,
              target: goal.targetElement.id,
              operator: ValidationOperator.EQUALS,
              expectedValue: true,
            },
            {
              type: ValidationType.ELEMENT_ENABLED,
              target: goal.targetElement.id,
              operator: ValidationOperator.EQUALS,
              expectedValue: true,
            },
          ],
          postConditions: [],
          skipValidation: false,
        },
      },
    ];
  }

  private async generateTypeSteps(goal: ActionGoal, context: PlanningContext): Promise<ActionStep[]> {
    if (!goal.targetElement || !goal.targetValue) {
      throw new Error('Target element and value required for type goal');
    }

    return [
      {
        id: this.generateStepId(),
        sequence: 1,
        action: ActionType.CLICK,
        targetElement: goal.targetElement,
        parameters: { timeout: 3000 },
        expectedOutcome: this.createBasicExpectedOutcome(),
        retry: this.createDefaultRetryConfig(),
        dependencies: [],
        alternatives: [],
        validation: this.createBasicValidation(goal.targetElement.id),
      },
      {
        id: this.generateStepId(),
        sequence: 2,
        action: ActionType.CLEAR_TEXT,
        targetElement: goal.targetElement,
        parameters: { timeout: 2000 },
        expectedOutcome: this.createBasicExpectedOutcome(),
        retry: this.createDefaultRetryConfig(),
        dependencies: [],
        alternatives: [],
        validation: this.createBasicValidation(goal.targetElement.id),
      },
      {
        id: this.generateStepId(),
        sequence: 3,
        action: ActionType.TYPE_TEXT,
        targetElement: goal.targetElement,
        parameters: {
          text: goal.targetValue,
          timeout: 10000,
        },
        expectedOutcome: {
          stateChanges: [
            {
              elementId: goal.targetElement.id,
              property: 'value',
              expectedValue: goal.targetValue,
            },
          ],
          newElements: [],
          disappearingElements: [],
          performanceThresholds: [],
          successIndicators: [
            {
              type: 'text_content',
              criteria: goal.targetValue,
              validation: ValidationMethod.EXACT_MATCH,
            },
          ],
        },
        retry: this.createDefaultRetryConfig(),
        dependencies: [],
        alternatives: [],
        validation: this.createBasicValidation(goal.targetElement.id),
      },
    ];
  }

  private async generatePopupDismissalSteps(goal: ActionGoal, context: PlanningContext): Promise<ActionStep[]> {
    if (!goal.targetElement) {
      throw new Error('Target popup element required');
    }

    const steps: ActionStep[] = [];
    
    // Try to find dismiss button (OK, Cancel, Close, etc.)
    const dismissButtons = context.availableElements.filter(element =>
      element.type === ElementType.BUTTON &&
      this.isLikelyDismissButton(element.properties.name)
    );

    if (dismissButtons.length > 0) {
      // Click the most appropriate dismiss button
      const primaryButton = this.selectPrimaryDismissButton(dismissButtons);
      steps.push({
        id: this.generateStepId(),
        sequence: 1,
        action: ActionType.CLICK,
        targetElement: primaryButton,
        parameters: { timeout: 5000 },
        expectedOutcome: {
          stateChanges: [],
          newElements: [],
          disappearingElements: [goal.targetElement.id],
          performanceThresholds: [],
          successIndicators: [
            {
              type: 'element_state',
              criteria: 'popup_dismissed',
              validation: ValidationMethod.EXACT_MATCH,
            },
          ],
        },
        retry: this.createDefaultRetryConfig(),
        dependencies: [],
        alternatives: [
          {
            action: ActionType.PRESS_KEY,
            parameters: { keys: ['Escape'] },
            condition: 'button_click_failed',
            confidence: 0.7,
          },
        ],
        validation: this.createBasicValidation(primaryButton.id),
      });
    } else {
      // Fallback to keyboard shortcuts
      steps.push({
        id: this.generateStepId(),
        sequence: 1,
        action: ActionType.PRESS_KEY,
        parameters: { keys: ['Escape'], timeout: 3000 },
        expectedOutcome: {
          stateChanges: [],
          newElements: [],
          disappearingElements: [goal.targetElement.id],
          performanceThresholds: [],
          successIndicators: [
            {
              type: 'element_state',
              criteria: 'popup_dismissed',
              validation: ValidationMethod.EXACT_MATCH,
            },
          ],
        },
        retry: this.createDefaultRetryConfig(),
        dependencies: [],
        alternatives: [
          {
            action: ActionType.PRESS_KEY,
            parameters: { keys: ['Enter'] },
            condition: 'escape_failed',
            confidence: 0.5,
          },
        ],
        validation: {
          preConditions: [],
          postConditions: [],
          skipValidation: false,
        },
      });
    }

    return steps;
  }

  private async generateFormSteps(goal: ActionGoal, context: PlanningContext): Promise<ActionStep[]> {
    // This would be enhanced with actual form data in a real implementation
    const steps: ActionStep[] = [];
    
    // Find form elements
    const formElements = context.availableElements.filter(element =>
      [ElementType.TEXTBOX, ElementType.CHECKBOX, ElementType.COMBOBOX].includes(element.type)
    );

    let sequence = 1;
    for (const element of formElements) {
      if (element.type === ElementType.TEXTBOX && element.properties.isEnabled) {
        steps.push({
          id: this.generateStepId(),
          sequence: sequence++,
          action: ActionType.TYPE_TEXT,
          targetElement: element,
          parameters: {
            text: `sample_value_${element.properties.name}`,
            timeout: 10000,
          },
          expectedOutcome: this.createBasicExpectedOutcome(),
          retry: this.createDefaultRetryConfig(),
          dependencies: [],
          alternatives: [],
          validation: this.createBasicValidation(element.id),
        });
      }
    }

    return steps;
  }

  private async generateGenericSteps(goal: ActionGoal, context: PlanningContext): Promise<ActionStep[]> {
    return [
      {
        id: this.generateStepId(),
        sequence: 1,
        action: ActionType.WAIT,
        parameters: { timeout: 1000 },
        expectedOutcome: this.createBasicExpectedOutcome(),
        retry: this.createDefaultRetryConfig(),
        dependencies: [],
        alternatives: [],
        validation: {
          preConditions: [],
          postConditions: [],
          skipValidation: true,
        },
      },
    ];
  }

  private createValidationStep(goal: ActionGoal): ActionStep {
    return {
      id: this.generateStepId(),
      sequence: 999,
      action: ActionType.VERIFY,
      parameters: {
        verificationCriteria: goal.successCriteria.map(criterion => ({
          type: criterion.type,
          value: criterion.validation.expectedValue,
          tolerance: criterion.validation.tolerance,
        })),
        timeout: 5000,
      },
      expectedOutcome: this.createBasicExpectedOutcome(),
      retry: {
        maxAttempts: 1,
        backoffStrategy: BackoffStrategy.FIXED,
        initialDelay: 0,
        maxDelay: 0,
        retryConditions: [],
      },
      dependencies: [],
      alternatives: [],
      validation: {
        preConditions: [],
        postConditions: [],
        skipValidation: false,
      },
    };
  }

  private createDefaultRetryConfig(): RetryConfiguration {
    return {
      maxAttempts: this.options.enableIntelligentRetry ? 3 : 1,
      backoffStrategy: BackoffStrategy.EXPONENTIAL,
      initialDelay: 1000,
      maxDelay: 5000,
      retryConditions: [
        { errorType: 'ElementNotFound', shouldRetry: true },
        { errorType: 'ElementNotEnabled', shouldRetry: true },
        { errorType: 'Timeout', shouldRetry: true },
      ],
    };
  }

  private createBasicExpectedOutcome(): ExpectedOutcome {
    return {
      stateChanges: [],
      newElements: [],
      disappearingElements: [],
      performanceThresholds: [],
      successIndicators: [],
    };
  }

  private createBasicValidation(elementId: string): StepValidation {
    return {
      preConditions: [
        {
          type: ValidationType.ELEMENT_EXISTS,
          target: elementId,
          operator: ValidationOperator.EQUALS,
          expectedValue: true,
        },
      ],
      postConditions: [],
      skipValidation: false,
    };
  }

  private isLikelyDismissButton(buttonText: string): boolean {
    const dismissKeywords = ['ok', 'cancel', 'close', 'yes', 'no', 'apply', 'confirm', 'dismiss'];
    return dismissKeywords.some(keyword =>
      buttonText.toLowerCase().includes(keyword)
    );
  }

  private selectPrimaryDismissButton(buttons: DetectedElement[]): DetectedElement {
    // Prioritize OK, Apply, Confirm buttons over Cancel, Close
    const priorityOrder = ['ok', 'apply', 'confirm', 'yes', 'cancel', 'close', 'no'];
    
    for (const keyword of priorityOrder) {
      const button = buttons.find(b =>
        b.properties.name.toLowerCase().includes(keyword)
      );
      if (button) return button;
    }
    
    return buttons[0]; // Return first button if no priority match
  }

  // Additional helper methods for complexity assessment, optimization, etc.
  private assessGoalComplexity(goal: ActionGoal, context: PlanningContext): ComplexityLevel {
    const strategy = ActionPlanner.PLANNING_STRATEGIES[goal.type];
    return strategy?.complexity || ComplexityLevel.MODERATE;
  }

  private async assessGoalFeasibility(goal: ActionGoal, context: PlanningContext): Promise<number> {
    // Simplified feasibility assessment
    let feasibility = 0.8;
    
    if (goal.targetElement && !goal.targetElement.properties.isEnabled) {
      feasibility -= 0.3;
    }
    
    if (context.currentState?.systemLoad && context.currentState.systemLoad > 0.8) {
      feasibility -= 0.2;
    }
    
    return Math.max(0, feasibility);
  }

  private async assessGoalRisks(goal: ActionGoal, context: PlanningContext): Promise<RiskFactor[]> {
    const risks: RiskFactor[] = [];
    
    if (goal.type === GoalType.COMPLEX_WORKFLOW) {
      risks.push({
        factor: 'Complex workflow complexity',
        impact: RiskLevel.HIGH,
        probability: 0.4,
        mitigation: 'Use fallback strategies and incremental validation',
      });
    }
    
    return risks;
  }

  private calculateResourceRequirements(goal: ActionGoal): string[] {
    const requirements: string[] = ['ui_automation'];
    
    if (goal.type === GoalType.TYPE_TEXT) {
      requirements.push('keyboard_access');
    }
    
    if (goal.type === GoalType.DISMISS_POPUP) {
      requirements.push('popup_detection', 'event_handling');
    }
    
    return requirements;
  }

  private estimateRequiredSteps(goal: ActionGoal): number {
    const stepEstimates: { [key in GoalType]: number } = {
      [GoalType.CLICK_ELEMENT]: 1,
      [GoalType.TYPE_TEXT]: 3,
      [GoalType.SELECT_OPTION]: 2,
      [GoalType.NAVIGATE_TO]: 2,
      [GoalType.WAIT_FOR_ELEMENT]: 1,
      [GoalType.DISMISS_POPUP]: 2,
      [GoalType.FILL_FORM]: 8,
      [GoalType.EXTRACT_DATA]: 3,
      [GoalType.VERIFY_STATE]: 1,
      [GoalType.COMPLEX_WORKFLOW]: 15,
    };
    
    return stepEstimates[goal.type] || 3;
  }

  private async createFallbackStrategies(goal: ActionGoal, context: PlanningContext): Promise<FallbackStrategy[]> {
    // Simplified fallback strategy creation
    return [
      {
        id: this.generateStrategyId(),
        description: 'Retry with increased timeout',
        trigger: {
          condition: TriggerCondition.TIMEOUT,
          threshold: 1,
          maxFailures: 2,
        },
        alternativePlan: await this.createSimplifiedPlan(goal, context),
        confidence: 0.6,
      },
    ];
  }

  private async createSimplifiedPlan(goal: ActionGoal, context: PlanningContext): Promise<ActionPlan> {
    // Create a simplified version of the plan for fallback
    const simplifiedGoal = { ...goal, timeout: goal.timeout * 2 };
    return this.createPlan(simplifiedGoal, context);
  }

  private async identifyPrerequisites(goal: ActionGoal, context: PlanningContext): Promise<ActionPrerequisite[]> {
    const prerequisites: ActionPrerequisite[] = [];
    
    if (goal.targetElement) {
      prerequisites.push({
        type: PrerequisiteType.ELEMENT_AVAILABLE,
        description: 'Target element must be available and enabled',
        validation: {
          type: ValidationType.ELEMENT_ENABLED,
          target: goal.targetElement.id,
          operator: ValidationOperator.EQUALS,
          expectedValue: true,
        },
        canSkip: false,
      });
    }
    
    return prerequisites;
  }

  private async calculatePlanMetadata(
    goal: ActionGoal,
    steps: ActionStep[],
    context: PlanningContext
  ): Promise<ActionPlanMetadata> {
    return {
      createdAt: Date.now(),
      estimatedComplexity: this.assessGoalComplexity(goal, context),
      requiredCapabilities: this.calculateResourceRequirements(goal),
      riskAssessment: {
        overallRisk: RiskLevel.MEDIUM,
        riskFactors: await this.assessGoalRisks(goal, context),
        mitigation: ['Use retry mechanisms', 'Implement fallback strategies'],
      },
      tags: [goal.type, `priority_${goal.priority}`],
      customData: new Map(),
    };
  }

  private calculateEstimatedDuration(steps: ActionStep[]): number {
    return steps.reduce((total, step) => {
      const stepTimeout = step.parameters.timeout || 5000;
      const retryTime = step.retry.maxAttempts * step.retry.maxDelay;
      return total + stepTimeout + retryTime;
    }, 0);
  }

  private calculatePlanConfidence(steps: ActionStep[], analysis: GoalAnalysis): number {
    let confidence = analysis.feasibility;
    
    // Reduce confidence for complex plans
    if (steps.length > 10) {
      confidence *= 0.8;
    }
    
    // Increase confidence for plans with alternatives
    const stepsWithAlternatives = steps.filter(step => step.alternatives.length > 0);
    if (stepsWithAlternatives.length > steps.length * 0.5) {
      confidence *= 1.1;
    }
    
    return Math.min(1.0, confidence);
  }

  private storePlanInHistory(plan: ActionPlan): void {
    const goalTypeKey = plan.goal.type;
    if (!this.planningHistory.has(goalTypeKey)) {
      this.planningHistory.set(goalTypeKey, []);
    }
    
    const plans = this.planningHistory.get(goalTypeKey)!;
    plans.push(plan);
    
    // Keep only the last 50 plans per goal type
    if (plans.length > 50) {
      plans.splice(0, plans.length - 50);
    }
  }

  private optimizeTimeout(step: ActionStep, context: PlanningContext): number {
    // Base timeout optimization on historical data and system performance
    const baseTimeout = step.parameters.timeout || 5000;
    const systemLoadFactor = context.currentState?.systemLoad ? 
      1 + context.currentState.systemLoad : 1;
    
    return Math.round(baseTimeout * systemLoadFactor);
  }

  private optimizeRetryConfiguration(step: ActionStep, context: PlanningContext): RetryConfiguration {
    const config = step.retry;
    
    // Adjust retry attempts based on system performance
    if (context.currentState?.systemLoad && context.currentState.systemLoad > 0.8) {
      config.maxAttempts = Math.min(config.maxAttempts + 1, 5);
      config.maxDelay = Math.min(config.maxDelay * 1.5, 10000);
    }
    
    return config;
  }

  private async generateAlternatives(step: ActionStep, context: PlanningContext): Promise<AlternativeAction[]> {
    const alternatives: AlternativeAction[] = [];
    
    // Add keyboard alternative for click actions
    if (step.action === ActionType.CLICK && step.targetElement?.properties.isEnabled) {
      alternatives.push({
        action: ActionType.PRESS_KEY,
        parameters: { keys: ['Enter'] },
        condition: 'click_failed',
        confidence: 0.7,
      });
    }
    
    return alternatives;
  }

  private removeRedundantSteps(steps: ActionStep[]): ActionStep[] {
    // Remove consecutive wait steps
    const optimized: ActionStep[] = [];
    let lastWaitStep: ActionStep | null = null;
    
    for (const step of steps) {
      if (step.action === ActionType.WAIT) {
        if (lastWaitStep) {
          // Merge wait times
          lastWaitStep.parameters.timeout = (lastWaitStep.parameters.timeout || 0) + (step.parameters.timeout || 0);
        } else {
          lastWaitStep = step;
          optimized.push(step);
        }
      } else {
        lastWaitStep = null;
        optimized.push(step);
      }
    }
    
    return optimized;
  }

  private async loadHistoricalData(): Promise<void> {
    // Load historical performance data if available
    // This would connect to a persistent storage system
    console.log('📊 Loading historical planning data...');
  }

  private updatePlanningMetrics(planningTime: number): void {
    const currentCount = this.performanceMetrics.averagePlanningTime === 0 ? 0 : 1;
    const totalTime = this.performanceMetrics.averagePlanningTime * currentCount;
    
    this.performanceMetrics.averagePlanningTime = (totalTime + planningTime) / (currentCount + 1);
  }

  private async validatePrerequisite(prerequisite: ActionPrerequisite, context: PlanningContext): Promise<boolean> {
    // Simplified prerequisite validation
    return true; // Would implement actual validation logic
  }

  private async detectStepConflicts(steps: ActionStep[], context: PlanningContext): Promise<string[]> {
    // Detect potential conflicts between steps
    return []; // Would implement conflict detection
  }

  private mapPopupPriorityToGoalPriority(popupPriority: PopupPriority): GoalPriority {
    const mapping: { [key in PopupPriority]: GoalPriority } = {
      [PopupPriority.CRITICAL]: GoalPriority.CRITICAL,
      [PopupPriority.HIGH]: GoalPriority.HIGH,
      [PopupPriority.MEDIUM]: GoalPriority.MEDIUM,
      [PopupPriority.LOW]: GoalPriority.LOW,
      [PopupPriority.INFORMATIONAL]: GoalPriority.LOW,
    };
    
    return mapping[popupPriority];
  }

  private async enhanceFormFillingPlan(plan: ActionPlan, formData: Map<string, string>, context: PlanningContext): Promise<void> {
    // Enhance plan with actual form data
    // This would map form fields to provided data
  }

  private generatePlanId(): string {
    return `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateStepId(): string {
    return `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateStrategyId(): string {
    return `strategy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Supporting interfaces
interface GoalAnalysis {
  complexity: ComplexityLevel;
  feasibility: number;
  risks: RiskFactor[];
  resourceRequirements: string[];
  estimatedSteps: number;
}

interface ValidationResult {
  isValid: boolean;
  issues: string[];
  warnings: string[];
  recommendations: string[];
}

// Export default instance for easy access
export const actionPlanner = ActionPlanner.getInstance();
export default ActionPlanner;