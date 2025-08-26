/**
 * Glass MCP v7.0 - Core Automation System Types
 * 
 * Essential TypeScript interfaces for the Advanced Automation Engine.
 * Focused on core contracts and integration points between modules.
 * 
 * This modular approach separates concerns:
 * - Core types and interfaces (this file)
 * - Orchestration logic (automation-orchestrator.ts)
 * - Task execution (task-execution-engine.ts)
 * - Workflow management (workflow-manager.ts)
 * - Plugin system (plugin-architecture.ts)
 * - Monitoring (monitoring-system.ts)
 * 
 * Built with enterprise patterns:
 * - Single responsibility principle
 * - Clean separation of concerns
 * - Provider pattern for integration
 * - Event-driven architecture
 * 
 * @version 7.0.0-alpha.1
 * @since 2025-08-26
 */

// =====================================================
// Core Automation Engine Interface
// =====================================================

/**
 * Main automation engine interface
 */
export interface AdvancedAutomationEngine {
  // Core lifecycle methods
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  
  // Workflow orchestration
  executeWorkflow(workflow: AutomationWorkflow, context: AutomationContext): Promise<AutomationResult>;
  scheduleWorkflow(workflow: AutomationWorkflow, schedule: WorkflowSchedule): Promise<string>;
  cancelWorkflow(workflowId: string): Promise<void>;
  
  // Task execution
  executeTask(task: AutomationTask, context: AutomationContext): Promise<TaskResult>;
  executeBatch(tasks: AutomationTask[], context: AutomationContext): Promise<BatchResult>;
  
  // System management
  getSystemHealth(): Promise<SystemHealthReport>;
  getPerformanceMetrics(): Promise<PerformanceMetrics>;
  updateConfiguration(config: Partial<AutomationConfiguration>): Promise<void>;
  
  // Event handling
  addEventListener(type: AutomationEventType, handler: AutomationEventHandler): void;
  removeEventListener(type: AutomationEventType, handler: AutomationEventHandler): void;
  emitEvent(event: AutomationEvent): void;
}

// =====================================================
// Core Workflow Types
// =====================================================

/**
 * Automation workflow definition
 */
export interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  version: string;
  category: WorkflowCategory;
  
  // Workflow structure
  tasks: AutomationTask[];
  dependencies: WorkflowDependency[];
  
  // Execution settings
  executionMode: ExecutionMode;
  priority: WorkflowPriority;
  timeout: number;
  
  // Metadata
  creator: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

/**
 * Individual automation task
 */
export interface AutomationTask {
  id: string;
  name: string;
  description: string;
  type: TaskType;
  
  // Task definition
  operation: TaskOperation;
  parameters: TaskParameters;
  
  // Execution settings
  timeout: number;
  retryCount: number;
  priority: TaskPriority;
  
  // Dependencies
  dependencies: string[]; // Task IDs
  preconditions: TaskCondition[];
}

/**
 * Automation execution context
 */
export interface AutomationContext {
  // Execution environment
  sessionId: string;
  executionId: string;
  userId?: string;
  
  // System context
  screenResolution: { width: number; height: number };
  activeApplications: ApplicationInfo[];
  
  // Data context
  inputData: Record<string, any>;
  variables: Record<string, any>;
  
  // Configuration
  configuration: AutomationConfiguration;
  featureFlags: Record<string, boolean>;
}

// =====================================================
// Provider Integration Types
// =====================================================

/**
 * Task operation definition
 */
export interface TaskOperation {
  provider: ProviderType;
  method: string;
  parameters: Record<string, any>;
  configuration?: Record<string, any>;
}

/**
 * Task parameters
 */
export interface TaskParameters {
  input: Record<string, any>;
  configuration: Record<string, any>;
}

/**
 * Task condition for dependencies
 */
export interface TaskCondition {
  type: 'data' | 'system' | 'time' | 'user' | 'custom';
  expression: string;
  timeout?: number;
}

/**
 * Application information
 */
export interface ApplicationInfo {
  name: string;
  processId: number;
  windowHandle: number;
  path: string;
  version: string;
  isResponding: boolean;
}

// =====================================================
// Results and Outcomes
// =====================================================

/**
 * Automation workflow result
 */
export interface AutomationResult {
  workflowId: string;
  executionId: string;
  status: ExecutionStatus;
  
  // Execution details
  startTime: Date;
  endTime: Date;
  duration: number;
  
  // Task results
  taskResults: TaskResult[];
  completedTasks: number;
  failedTasks: number;
  
  // Output data
  outputData: Record<string, any>;
  
  // Error information
  errors: ExecutionError[];
  warnings: ExecutionWarning[];
}

/**
 * Individual task result
 */
export interface TaskResult {
  taskId: string;
  status: TaskStatus;
  
  // Execution details
  startTime: Date;
  endTime: Date;
  duration: number;
  attempts: number;
  
  // Output
  output: any;
  
  // Error information
  error?: ExecutionError;
  warnings: ExecutionWarning[];
}

/**
 * Batch execution result
 */
export interface BatchResult {
  batchId: string;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  results: TaskResult[];
  duration: number;
}

// =====================================================
// System Health and Performance
// =====================================================

/**
 * System health report
 */
export interface SystemHealthReport {
  overall: HealthStatus;
  timestamp: Date;
  uptime: number;
  
  // Component health
  components: ComponentHealthStatus[];
  
  // Resource utilization
  cpu: ResourceUtilization;
  memory: ResourceUtilization;
  
  // Recent issues
  recentErrors: BasicError[];
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  timestamp: Date;
  period: number; // in milliseconds
  
  // Execution metrics
  totalWorkflowsExecuted: number;
  successfulWorkflows: number;
  failedWorkflows: number;
  averageWorkflowDuration: number;
  
  // Task metrics
  totalTasksExecuted: number;
  successfulTasks: number;
  failedTasks: number;
  averageTaskDuration: number;
  
  // Resource metrics
  averageCpuUsage: number;
  averageMemoryUsage: number;
}

// =====================================================
// Configuration
// =====================================================

/**
 * Automation configuration
 */
export interface AutomationConfiguration {
  // System configuration
  maxConcurrentWorkflows: number;
  maxConcurrentTasks: number;
  defaultTimeout: number;
  defaultRetryCount: number;
  
  // Provider configuration
  providers: Record<string, ProviderConfiguration>;
  
  // Performance configuration
  performanceSettings: PerformanceSettings;
}

/**
 * Provider configuration
 */
export interface ProviderConfiguration {
  enabled: boolean;
  settings: Record<string, any>;
  timeout: number;
  retryCount: number;
}

/**
 * Performance settings
 */
export interface PerformanceSettings {
  enableCaching: boolean;
  cacheSize: number;
  enableOptimizations: boolean;
  maxResourceUsage: ResourceLimits;
}

/**
 * Resource limits
 */
export interface ResourceLimits {
  maxCpuUsage: number; // 0-1
  maxMemoryUsage: number; // in MB
  maxDiskUsage: number; // in MB
}

// =====================================================
// Events
// =====================================================

/**
 * Automation event
 */
export interface AutomationEvent {
  type: AutomationEventType;
  timestamp: Date;
  source: string;
  data: Record<string, any>;
  sessionId?: string;
  correlationId?: string;
}

export type AutomationEventHandler = (event: AutomationEvent) => void | Promise<void>;

// =====================================================
// Scheduling
// =====================================================

/**
 * Workflow schedule
 */
export interface WorkflowSchedule {
  type: 'immediate' | 'delayed' | 'recurring' | 'conditional';
  startTime?: Date;
  interval?: number; // milliseconds
  cronExpression?: string;
  condition?: string; // Conditional expression
}

// =====================================================
// Workflow Dependencies
// =====================================================

/**
 * Workflow dependency
 */
export interface WorkflowDependency {
  id: string;
  type: 'workflow' | 'service' | 'resource';
  required: boolean;
}

// =====================================================
// Supporting Types
// =====================================================

export interface ComponentHealthStatus {
  component: string;
  status: HealthStatus;
  lastCheck: Date;
  uptime: number;
  issues: string[];
}

export interface ResourceUtilization {
  current: number;
  average: number;
  peak: number;
  unit: string;
}

export interface ExecutionError {
  code: string;
  message: string;
  details?: Record<string, any>;
  recoverable: boolean;
  timestamp: Date;
}

export interface ExecutionWarning {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
}

export interface BasicError {
  type: string;
  message: string;
  timestamp: Date;
  count: number;
}

// =====================================================
// Enums
// =====================================================

export enum WorkflowCategory {
  DRAWING_AUTOMATION = 'drawing_automation',
  UI_AUTOMATION = 'ui_automation',
  DATA_PROCESSING = 'data_processing',
  VISUAL_ANALYSIS = 'visual_analysis',
  BUSINESS_PROCESS = 'business_process',
  TESTING = 'testing',
  CUSTOM = 'custom'
}

export enum TaskType {
  SCREEN_CAPTURE = 'screen_capture',
  OCR_EXTRACTION = 'ocr_extraction',
  UI_INTERACTION = 'ui_interaction',
  DRAWING_OPERATION = 'drawing_operation',
  AI_ANALYSIS = 'ai_analysis',
  DATA_TRANSFORMATION = 'data_transformation',
  VALIDATION = 'validation',
  NOTIFICATION = 'notification',
  CUSTOM = 'custom'
}

export enum ExecutionMode {
  SEQUENTIAL = 'sequential',
  PARALLEL = 'parallel',
  CONDITIONAL = 'conditional',
  HYBRID = 'hybrid'
}

export enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  PAUSED = 'paused'
}

export enum TaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
  CANCELLED = 'cancelled'
}

export enum ProviderType {
  SCREEN_VISION = 'screen_vision',
  AI_INTELLIGENCE = 'ai_intelligence', 
  DRAWING_INTELLIGENCE = 'drawing_intelligence',
  UI_AUTOMATION = 'ui_automation',
  FILE_SYSTEM = 'file_system',
  NETWORK = 'network',
  CUSTOM = 'custom'
}

export enum WorkflowPriority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  CRITICAL = 4,
  EMERGENCY = 5
}

export enum TaskPriority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  CRITICAL = 4
}

export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
  CRITICAL = 'critical',
  UNKNOWN = 'unknown'
}

export enum AutomationEventType {
  WORKFLOW_STARTED = 'workflow_started',
  WORKFLOW_COMPLETED = 'workflow_completed',
  WORKFLOW_FAILED = 'workflow_failed',
  WORKFLOW_CANCELLED = 'workflow_cancelled',
  TASK_STARTED = 'task_started',
  TASK_COMPLETED = 'task_completed',
  TASK_FAILED = 'task_failed',
  SYSTEM_EVENT = 'system_event',
  PROVIDER_EVENT = 'provider_event',
  ERROR_OCCURRED = 'error_occurred',
  PERFORMANCE_THRESHOLD = 'performance_threshold',
  CUSTOM_EVENT = 'custom_event'
}