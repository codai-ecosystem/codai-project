// Glass MCP v7.0 - Vision System Types
// TypeScript interfaces for screen vision and AI automation

export interface ImageBuffer {
  data: Buffer;
  width: number;
  height: number;
  format: 'png' | 'jpg' | 'bmp' | 'webp';
  timestamp: Date;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface OCRResult {
  text: string;
  confidence: number;
  textBlocks: TextBlock[];
  language: string;
  processingTime: number;
}

export interface TextBlock {
  text: string;
  bounds: Rectangle;
  confidence: number;
  lines: TextLine[];
}

export interface TextLine {
  text: string;
  bounds: Rectangle;
  confidence: number;
  words: Word[];
}

export interface Word {
  text: string;
  bounds: Rectangle;
  confidence: number;
}

export interface TextLocation {
  text: string;
  bounds: Rectangle;
  confidence: number;
}

export interface UIElement {
  name: string;
  controlType: string;
  bounds: Rectangle;
  isEnabled: boolean;
  automationId?: string;
  confidence: number;
  children?: UIElement[];
  properties?: Record<string, any>;
}

export interface DialogInfo {
  title: string;
  type: 'Error' | 'Warning' | 'Information' | 'Confirmation' | 'Question';
  windowHandle: number;
  processName: string;
  confidence: number;
  buttons?: ButtonInfo[];
  content?: string;
}

export interface ButtonInfo {
  text: string;
  bounds: Rectangle;
  type: 'OK' | 'Cancel' | 'Yes' | 'No' | 'Apply' | 'Close' | 'Retry' | 'Ignore';
  isDefault: boolean;
}

export interface ChangeResult {
  hasChanged: boolean;
  changePercentage: number;
  changedRegions: Rectangle[];
  changeType: 'content' | 'ui' | 'popup' | 'error' | 'window';
  confidence: number;
}

export interface ScreenCapture {
  image: ImageBuffer;
  elements: UIElement[];
  timestamp: Date;
  screenIndex: number;
  resolution: { width: number; height: number };
}

export interface VisionAnalysis {
  screenshot: ImageBuffer;
  ocrResult: OCRResult;
  uiElements: UIElement[];
  dialogs: DialogInfo[];
  confidence: number;
  processingTime: number;
}

export interface ClickTarget {
  element: UIElement;
  coordinates: Point;
  confidence: number;
  clickType: 'left' | 'right' | 'double' | 'middle';
  validation?: ClickValidation;
}

export interface ClickValidation {
  expectedChange: 'window' | 'dialog' | 'content' | 'navigation';
  timeout: number;
  retryCount: number;
}

export interface DrawingCanvas {
  bounds: Rectangle;
  tools: ToolPalette;
  colors: ColorPalette;
  currentTool?: string;
  currentColor?: string;
  zoomLevel: number;
}

export interface ToolPalette {
  bounds: Rectangle;
  tools: DrawingTool[];
  activeTool?: DrawingTool;
}

export interface DrawingTool {
  name: string;
  type: 'brush' | 'pencil' | 'eraser' | 'fill' | 'line' | 'rectangle' | 'circle' | 'text';
  bounds: Rectangle;
  isSelected: boolean;
  properties?: Record<string, any>;
}

export interface ColorPalette {
  bounds: Rectangle;
  colors: Color[];
  activeColor?: Color;
}

export interface Color {
  rgb: { r: number; g: number; b: number };
  hex: string;
  bounds: Rectangle;
  isSelected: boolean;
}

export interface DrawingPath {
  points: Point[];
  tool: string;
  color: string;
  thickness: number;
  style: 'solid' | 'dashed' | 'dotted';
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  steps: AutomationStep[];
  conditions: WorkflowCondition[];
  errorHandling: ErrorHandlingStrategy;
  metadata: WorkflowMetadata;
}

export interface AutomationStep {
  id: string;
  type: 'click' | 'type' | 'wait' | 'screenshot' | 'validate' | 'condition' | 'loop';
  target?: UIElement | Point | string;
  parameters?: Record<string, any>;
  validation?: StepValidation;
  timeout: number;
}

export interface WorkflowCondition {
  type: 'element_exists' | 'text_contains' | 'dialog_appears' | 'screen_changes';
  criteria: any;
  action: 'continue' | 'skip' | 'retry' | 'abort';
}

export interface StepValidation {
  type: 'screenshot' | 'element_state' | 'text_content' | 'dialog_response';
  expected: any;
  timeout: number;
}

export interface ErrorHandlingStrategy {
  onTimeout: 'retry' | 'skip' | 'abort';
  onElementNotFound: 'retry' | 'skip' | 'abort';
  onDialogAppears: 'handle' | 'ignore' | 'abort';
  maxRetries: number;
  retryDelay: number;
}

export interface WorkflowMetadata {
  created: Date;
  modified: Date;
  author: string;
  version: string;
  tags: string[];
  successRate?: number;
  averageExecutionTime?: number;
}

export interface AIIntelligence {
  contextUnderstanding: ContextAnalysis;
  decisionMaking: DecisionEngine;
  learning: LearningSystem;
}

export interface ContextAnalysis {
  applicationContext: ApplicationContext;
  taskContext: TaskContext;
  userIntent: UserIntent;
  confidence: number;
}

export interface ApplicationContext {
  name: string;
  type: 'browser' | 'office' | 'media' | 'development' | 'system' | 'other';
  version?: string;
  state: 'active' | 'inactive' | 'minimized' | 'maximized';
  capabilities: string[];
}

export interface TaskContext {
  currentTask: string;
  progress: number;
  estimatedCompletion: number;
  blockers: string[];
  suggestions: string[];
}

export interface UserIntent {
  goal: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  context: Record<string, any>;
  preferences: UserPreferences;
}

export interface UserPreferences {
  automationLevel: 'minimal' | 'moderate' | 'aggressive';
  confirmationRequired: boolean;
  errorNotifications: boolean;
  performanceMode: 'accuracy' | 'speed' | 'balanced';
}

export interface DecisionEngine {
  shouldClick: (element: UIElement, context: ContextAnalysis) => Promise<ClickDecision>;
  handlePopup: (dialog: DialogInfo, context: ContextAnalysis) => Promise<PopupAction>;
  resolveConflict: (options: ConflictOptions) => Promise<Resolution>;
}

export interface ClickDecision {
  shouldClick: boolean;
  confidence: number;
  reasoning: string;
  alternatives: ClickTarget[];
}

export interface PopupAction {
  action: 'dismiss' | 'accept' | 'cancel' | 'read' | 'wait';
  targetButton?: ButtonInfo;
  reasoning: string;
  confidence: number;
}

export interface ConflictOptions {
  type: 'multiple_targets' | 'ambiguous_action' | 'competing_priorities';
  options: any[];
  context: ContextAnalysis;
}

export interface Resolution {
  selectedOption: any;
  reasoning: string;
  confidence: number;
  fallbackOptions: any[];
}

export interface LearningSystem {
  learnFromSuccess: (workflow: AutomationWorkflow, metrics: ExecutionMetrics) => Promise<void>;
  learnFromFailure: (error: AutomationError, context: ContextAnalysis) => Promise<void>;
  adaptToChange: (change: UIChange, adaptation: AdaptationStrategy) => Promise<void>;
}

export interface ExecutionMetrics {
  startTime: Date;
  endTime: Date;
  stepsCompleted: number;
  stepsSkipped: number;
  errorCount: number;
  successRate: number;
  averageStepTime: number;
}

export interface AutomationError {
  type: 'element_not_found' | 'timeout' | 'unexpected_dialog' | 'permission_denied' | 'system_error';
  message: string;
  step: AutomationStep;
  context: ContextAnalysis;
  timestamp: Date;
  recoverable: boolean;
}

export interface UIChange {
  type: 'element_moved' | 'element_removed' | 'new_element' | 'layout_change' | 'style_change';
  before: UIElement | null;
  after: UIElement | null;
  impact: 'low' | 'medium' | 'high';
}

export interface AdaptationStrategy {
  type: 'update_selector' | 'find_alternative' | 'ignore_change' | 'require_user_input';
  parameters: Record<string, any>;
  confidence: number;
  testable: boolean;
}

export interface PerformanceMetrics {
  captureTime: number;
  ocrTime: number;
  analysisTime: number;
  totalTime: number;
  memoryUsage: number;
  cpuUsage: number;
  accuracyScore: number;
}

export interface VisionEngineConfig {
  azureVision?: {
    endpoint: string;
    apiKey: string;
    region: string;
  };
  tesseract?: {
    languages: string[];
    ocrEngineMode: number;
    pageSegMode: number;
  };
  performance?: {
    maxImageSize: number;
    compressionQuality: number;
    parallelProcessing: boolean;
  };
  automation?: {
    defaultTimeout: number;
    retryAttempts: number;
    clickDelay: number;
    typeDelay: number;
  };
}