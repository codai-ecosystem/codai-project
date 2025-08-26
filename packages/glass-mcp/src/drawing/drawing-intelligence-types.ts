/**
 * Glass MCP v7.0 - Drawing Intelligence Types
 * 
 * Comprehensive TypeScript interfaces for AI-powered drawing intelligence
 * integrating 2025 AI patterns with Windows Graphics APIs and machine learning.
 * 
 * Built on research findings:
 * - Microsoft Direct2D hardware-accelerated 2D graphics
 * - Windows Machine Learning (WinML) with ONNX Runtime
 * - 2025 AI drawing trends: shape recognition, path optimization, creative assistance
 * - Windows AI Foundry 2025 integration patterns
 * 
 * @version 7.0.0-alpha.1
 * @since 2025-08-26
 */

// ============================================================================
// CORE GEOMETRIC TYPES
// ============================================================================

/**
 * 2D point in drawing coordinate system
 */
export interface Point2D {
  x: number;
  y: number;
  pressure?: number; // For pressure-sensitive input
  timestamp?: number; // For temporal analysis
}

/**
 * Vector representation for geometric calculations
 */
export interface Vector2D {
  x: number;
  y: number;
  magnitude: number;
  angle: number; // In radians
}

/**
 * Bounding rectangle for spatial analysis
 */
export interface BoundingBox {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

/**
 * Color representation with alpha channel
 */
export interface DrawingColor {
  red: number; // 0-255
  green: number; // 0-255
  blue: number; // 0-255
  alpha: number; // 0-1
  hex: string;
}

// Type aliases for compatibility with Drawing Automation Engine
export type Color = DrawingColor;
export type ActionType = DrawingActionType;

/**
 * Canvas information for drawing automation
 */
export interface DrawingCanvasInfo {
  width: number;
  height: number;
  scale: number;
  offsetX: number;
  offsetY: number;
  backgroundColor: DrawingColor;
  dpi: number;
  format: 'RGB' | 'RGBA' | 'ARGB';
}

// ============================================================================
// SHAPE RECOGNITION TYPES
// ============================================================================

/**
 * Recognized shape types for AI classification
 */
export enum ShapeType {
  UNKNOWN = 'unknown',
  POINT = 'point',
  LINE = 'line',
  CIRCLE = 'circle',
  ELLIPSE = 'ellipse',
  RECTANGLE = 'rectangle',
  SQUARE = 'square',
  TRIANGLE = 'triangle',
  POLYGON = 'polygon',
  CURVE = 'curve',
  BEZIER_CURVE = 'bezier_curve',
  ARC = 'arc',
  PATH = 'path',
  FREEHAND = 'freehand',
  TEXT = 'text',
  ARROW = 'arrow',
  CONNECTOR = 'connector'
}

/**
 * Shape recognition confidence and metrics
 */
export interface ShapeRecognitionResult {
  shapeType: ShapeType;
  confidence: number; // 0-1
  alternatives: Array<{
    shapeType: ShapeType;
    confidence: number;
  }>;
  processingTimeMs: number;
  boundingBox: BoundingBox;
  metadata: Record<string, any>;
}

/**
 * Drawing stroke captured from user input
 */
export interface DrawingStroke {
  id: string;
  points: Point2D[];
  strokeWidth: number;
  color: DrawingColor;
  timestamp: number;
  pressure: number[];
  velocity: number[];
  acceleration: number[];
  boundingBox: BoundingBox;
  duration: number; // milliseconds
}

/**
 * Recognized geometric shape with properties
 */
export interface RecognizedShape {
  id: string;
  type: ShapeType;
  confidence: number;
  originalStroke: DrawingStroke;
  optimizedGeometry: GeometricShape;
  recognitionResult: ShapeRecognitionResult;
  timestamp: number;
  metadata: ShapeMetadata;
}

/**
 * Shape-specific metadata
 */
export interface ShapeMetadata {
  area?: number;
  perimeter?: number;
  symmetry?: number; // 0-1
  regularity?: number; // 0-1
  orientation?: number; // radians
  aspectRatio?: number;
  curvature?: number;
  smoothness?: number; // 0-1
}

// ============================================================================
// GEOMETRIC SHAPE DEFINITIONS
// ============================================================================

/**
 * Base interface for all geometric shapes
 */
export interface GeometricShape {
  id: string;
  type: ShapeType;
  boundingBox: BoundingBox;
  center: Point2D;
  color: DrawingColor;
  strokeWidth: number;
  fillColor?: DrawingColor;
  metadata: ShapeMetadata;
}

export interface LineShape extends GeometricShape {
  type: ShapeType.LINE;
  startPoint: Point2D;
  endPoint: Point2D;
  length: number;
  angle: number;
}

export interface CircleShape extends GeometricShape {
  type: ShapeType.CIRCLE;
  radius: number;
  circumference: number;
  area: number;
}

export interface RectangleShape extends GeometricShape {
  type: ShapeType.RECTANGLE | ShapeType.SQUARE;
  corners: [Point2D, Point2D, Point2D, Point2D];
  width: number;
  height: number;
  area: number;
  isSquare: boolean;
}

export interface EllipseShape extends GeometricShape {
  type: ShapeType.ELLIPSE;
  radiusX: number;
  radiusY: number;
  rotation: number;
  area: number;
}

export interface PolygonShape extends GeometricShape {
  type: ShapeType.POLYGON | ShapeType.TRIANGLE;
  vertices: Point2D[];
  sides: number;
  isRegular: boolean;
  area: number;
  perimeter: number;
}

export interface CurveShape extends GeometricShape {
  type: ShapeType.CURVE | ShapeType.BEZIER_CURVE;
  controlPoints: Point2D[];
  bezierPoints?: Point2D[];
  smoothness: number;
  curvature: number;
}

export interface PathShape extends GeometricShape {
  type: ShapeType.PATH;
  segments: PathSegment[];
  totalLength: number;
  isClosed: boolean;
  isSmooth: boolean;
}

// ============================================================================
// PATH OPTIMIZATION TYPES
// ============================================================================

/**
 * Path segment types for complex paths
 */
export enum PathSegmentType {
  MOVE_TO = 'moveTo',
  LINE_TO = 'lineTo',
  CURVE_TO = 'curveTo',
  QUADRATIC_CURVE_TO = 'quadraticCurveTo',
  BEZIER_CURVE_TO = 'bezierCurveTo',
  ARC_TO = 'arcTo',
  CLOSE_PATH = 'closePath'
}

/**
 * Individual path segment
 */
export interface PathSegment {
  type: PathSegmentType;
  points: Point2D[];
  controlPoints?: Point2D[];
  radius?: number;
  startAngle?: number;
  endAngle?: number;
  clockwise?: boolean;
}

/**
 * Path optimization configuration
 */
export interface PathOptimizationConfig {
  smoothingFactor: number; // 0-1
  simplificationTolerance: number;
  angleThreshold: number; // degrees
  minimumSegmentLength: number;
  preserveCorners: boolean;
  enableSmoothing: boolean;
  enableAngleCorrection: boolean;
  enableLineSnapping: boolean;
}

/**
 * Path optimization result
 */
export interface PathOptimizationResult {
  originalPath: PathShape;
  optimizedPath: PathShape;
  optimizations: OptimizationAction[];
  qualityMetrics: PathQualityMetrics;
  processingTimeMs: number;
  improvementPercentage: number;
}

/**
 * Types of path optimizations
 */
export enum OptimizationType {
  SMOOTHING = 'smoothing',
  SIMPLIFICATION = 'simplification',
  ANGLE_CORRECTION = 'angle_correction',
  LINE_SNAPPING = 'line_snapping',
  CURVE_FITTING = 'curve_fitting',
  NOISE_REDUCTION = 'noise_reduction'
}

/**
 * Individual optimization action
 */
export interface OptimizationAction {
  type: OptimizationType;
  description: string;
  affectedSegments: number[];
  confidence: number;
  improvementScore: number;
  parameters?: Record<string, any>; // For optimization parameters
}

/**
 * Path quality metrics
 */
export interface PathQualityMetrics {
  smoothness: number; // 0-1
  accuracy: number; // 0-1
  complexity: number; // 0-1
  pointCount: number;
  totalLength: number;
  curvatureVariation: number;
  sharpCorners: number;
  redundantPoints: number;
}

// ============================================================================
// AI INTELLIGENCE ENGINE INTEGRATION
// ============================================================================

/**
 * Drawing context for AI analysis
 */
export interface DrawingContext {
  canvasSize: { width: number; height: number };
  currentTool: DrawingTool;
  drawingMode: DrawingMode;
  gridEnabled: boolean;
  snapToGrid: boolean;
  layerCount: number;
  activeLayer: number;
  zoomLevel: number;
  viewportOffset: Point2D;
  selectionArea?: BoundingBox;
  recentShapes: RecognizedShape[];
  userPreferences: DrawingUserPreferences;
  canvas?: DrawingCanvasInfo; // Canvas information for automation
  selectedTool?: string; // Selected tool name for compatibility
}

/**
 * Drawing tools available
 */
export enum DrawingTool {
  PEN = 'pen',
  PENCIL = 'pencil',
  BRUSH = 'brush',
  MARKER = 'marker',
  ERASER = 'eraser',
  SHAPE_TOOL = 'shape_tool',
  TEXT_TOOL = 'text_tool',
  SELECTION_TOOL = 'selection_tool',
  MOVE_TOOL = 'move_tool'
}

/**
 * Drawing modes
 */
export enum DrawingMode {
  FREEHAND = 'freehand',
  SHAPE_RECOGNITION = 'shape_recognition',
  GUIDED_DRAWING = 'guided_drawing',
  TEMPLATE_MODE = 'template_mode',
  COLLABORATIVE = 'collaborative'
}

/**
 * User drawing preferences
 */
export interface DrawingUserPreferences {
  preferredTools: DrawingTool[];
  defaultStrokeWidth: number;
  defaultColors: DrawingColor[];
  autoCorrectShapes: boolean;
  showGridByDefault: boolean;
  enableSmartAssist: boolean;
  recognitionSensitivity: number; // 0-1
  optimizationLevel: number; // 0-1
  creativeStylePreference: CreativeStyle;
}

/**
 * Creative styles for artistic assistance
 */
export enum CreativeStyle {
  TECHNICAL = 'technical',
  ARTISTIC = 'artistic',
  SKETCHY = 'sketchy',
  CLEAN = 'clean',
  HAND_DRAWN = 'hand_drawn',
  ARCHITECTURAL = 'architectural',
  COMIC = 'comic',
  CALLIGRAPHY = 'calligraphy',
  EXPRESSIVE = 'expressive' // Add expressive style
}

// ============================================================================
// CREATIVE ASSISTANCE TYPES
// ============================================================================

/**
 * Artistic intent analysis result
 */
export interface ArtisticIntentResult {
  intentType: ArtisticIntent;
  confidence: number;
  suggestions: CreativeSuggestion[];
  styleAnalysis: StyleAnalysis;
  contextAnalysis: CreativeContextAnalysis;
}

/**
 * Types of artistic intent
 */
export enum ArtisticIntent {
  SKETCH = 'sketch',
  DIAGRAM = 'diagram',
  ILLUSTRATION = 'illustration',
  TECHNICAL_DRAWING = 'technical_drawing',
  ARTISTIC_EXPRESSION = 'artistic_expression',
  NOTE_TAKING = 'note_taking',
  WIREFRAME = 'wireframe',
  FLOWCHART = 'flowchart',
  MIND_MAP = 'mind_map',
  ANNOTATION = 'annotation',
  ARTISTIC_CREATION = 'artistic_creation' // Add artistic creation intent
}

/**
 * Creative suggestion from AI
 */
export interface CreativeSuggestion {
  id: string;
  type: SuggestionType;
  title: string;
  description: string;
  confidence: number;
  applicableShapes: string[]; // Shape IDs
  actionRequired: SuggestionAction;
  previewData?: any;
  benefits: string[];
}

/**
 * Types of creative suggestions
 */
export enum SuggestionType {
  SHAPE_IMPROVEMENT = 'shape_improvement',
  COMPOSITION_ENHANCEMENT = 'composition_enhancement',
  STYLE_RECOMMENDATION = 'style_recommendation',
  COLOR_SUGGESTION = 'color_suggestion',
  COMPLETION_ASSISTANCE = 'completion_assistance',
  SYMMETRY_CORRECTION = 'symmetry_correction',
  PROPORTION_ADJUSTMENT = 'proportion_adjustment',
  LAYOUT_OPTIMIZATION = 'layout_optimization'
}

/**
 * Action to apply suggestion
 */
export interface SuggestionAction {
  type: 'modify_shape' | 'add_shape' | 'change_color' | 'adjust_position' | 'apply_style';
  parameters: Record<string, any>;
  reversible: boolean;
  complexity: 'simple' | 'moderate' | 'complex';
}

/**
 * Style analysis of drawing
 */
export interface StyleAnalysis {
  dominantStyle: CreativeStyle;
  styleConfidence: number;
  styleElements: StyleElement[];
  consistencyScore: number;
  maturityLevel: number; // 0-1, beginner to expert
}

/**
 * Individual style element
 */
export interface StyleElement {
  type: string;
  presence: number; // 0-1
  quality: number; // 0-1
  examples: string[]; // Shape IDs demonstrating this element
}

/**
 * Creative context analysis
 */
export interface CreativeContextAnalysis {
  drawingPurpose: ArtisticIntent;
  targetAudience: string;
  complexityLevel: number; // 0-1
  completionPercentage: number; // 0-1
  focusAreas: BoundingBox[];
  improvementOpportunities: string[];
  strengthAreas: string[];
}

// ============================================================================
// MACHINE LEARNING MODEL TYPES
// ============================================================================

/**
 * AI model configuration for drawing intelligence
 */
export interface DrawingAIModelConfig {
  shapeRecognitionModel: ModelConfig;
  pathOptimizationModel: ModelConfig;
  styleClassificationModel: ModelConfig;
  intentPredictionModel: ModelConfig;
  creativeAssistanceModel: ModelConfig;
}

/**
 * Individual ML model configuration
 */
export interface ModelConfig {
  modelPath: string;
  modelType: 'onnx' | 'tensorflowjs' | 'pytorch';
  inputShape: number[];
  outputShape: number[];
  preprocessingRequired: boolean;
  executionProvider: 'cpu' | 'gpu' | 'npu' | 'auto';
  modelVersion: string;
  lastUpdated: string;
  performanceMetrics?: ModelPerformanceMetrics;
}

/**
 * Model performance metrics
 */
export interface ModelPerformanceMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  inferenceTimeMs: number;
  memoryUsageMB: number;
  benchmarkDate: string;
}

// ============================================================================
// DRAWING AUTOMATION TYPES
// ============================================================================

/**
 * Automated drawing action
 */
export interface DrawingAction {
  id: string;
  type: DrawingActionType;
  description: string;
  targetElements: string[]; // IDs of shapes/strokes to act upon
  parameters: ActionParameters;
  executionOrder: number;
  dependencies: string[]; // IDs of actions that must complete first
  reversible: boolean;
  estimatedDurationMs: number;
  priority?: number; // Priority for execution order
}

/**
 * Types of drawing actions
 */
export enum DrawingActionType {
  DRAW_SHAPE = 'draw_shape',
  DRAW_STROKE = 'draw_stroke',
  MODIFY_SHAPE = 'modify_shape',
  DELETE_SHAPE = 'delete_shape',
  MOVE_SHAPE = 'move_shape',
  ROTATE_SHAPE = 'rotate_shape',
  SCALE_SHAPE = 'scale_shape',
  CHANGE_COLOR = 'change_color',
  CHANGE_STROKE = 'change_stroke',
  GROUP_SHAPES = 'group_shapes',
  UNGROUP_SHAPES = 'ungroup_shapes',
  ALIGN_SHAPES = 'align_shapes',
  DISTRIBUTE_SHAPES = 'distribute_shapes',
  APPLY_STYLE = 'apply_style',
  COMPLETE_SHAPE = 'complete_shape',
  OPTIMIZE_PATH = 'optimize_path',
  VALIDATE_QUALITY = 'validate_quality'
}

/**
 * Parameters for drawing actions
 */
export interface ActionParameters {
  [key: string]: any;
  position?: Point2D;
  size?: { width: number; height: number };
  rotation?: number;
  color?: DrawingColor;
  strokeWidth?: number;
  fillColor?: DrawingColor;
  alignment?: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';
  distribution?: 'horizontal' | 'vertical';
  style?: CreativeStyle;
  optimizationConfig?: PathOptimizationConfig;
}

/**
 * Multi-step drawing workflow
 */
export interface DrawingWorkflow {
  id: string;
  name: string;
  description: string;
  actions: DrawingAction[];
  prerequisites: string[];
  expectedOutcomes: string[];
  estimatedDurationMs: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: WorkflowCategory;
}

/**
 * Workflow categories
 */
export enum WorkflowCategory {
  BASIC_SHAPES = 'basic_shapes',
  TECHNICAL_DRAWING = 'technical_drawing',
  ARTISTIC_CREATION = 'artistic_creation',
  DIAGRAM_CREATION = 'diagram_creation',
  ANNOTATION = 'annotation',
  TEMPLATE_APPLICATION = 'template_application',
  STYLE_APPLICATION = 'style_application',
  OPTIMIZATION = 'optimization'
}

// ============================================================================
// PERFORMANCE AND METRICS TYPES
// ============================================================================

/**
 * Drawing intelligence performance metrics
 */
export interface DrawingIntelligenceMetrics {
  shapeRecognitionAccuracy: number;
  pathOptimizationEfficiency: number;
  creativeSuggestionRelevance: number;
  userSatisfactionScore: number;
  averageProcessingTimeMs: number;
  memoryUsageMB: number;
  gpuUtilization: number;
  totalShapesProcessed: number;
  totalOptimizationsPerformed: number;
  totalSuggestionsProvided: number;
  userAcceptanceRate: number; // For suggestions
}

/**
 * Real-time performance monitoring
 */
export interface PerformanceMonitor {
  currentFPS: number;
  averageFPS: number;
  memoryUsage: number;
  cpuUsage: number;
  gpuUsage: number;
  networkLatency: number;
  errorRate: number;
  lastErrorTime?: number;
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
}

// ============================================================================
// EVENT TYPES
// ============================================================================

/**
 * Drawing intelligence events
 */
export enum DrawingIntelligenceEventType {
  STROKE_STARTED = 'stroke_started',
  STROKE_IN_PROGRESS = 'stroke_in_progress',
  STROKE_COMPLETED = 'stroke_completed',
  SHAPE_RECOGNIZED = 'shape_recognized',
  PATH_OPTIMIZED = 'path_optimized',
  SUGGESTION_GENERATED = 'suggestion_generated',
  SUGGESTION_APPLIED = 'suggestion_applied',
  SUGGESTION_REJECTED = 'suggestion_rejected',
  WORKFLOW_STARTED = 'workflow_started',
  WORKFLOW_COMPLETED = 'workflow_completed',
  ERROR_OCCURRED = 'error_occurred',
  PERFORMANCE_UPDATE = 'performance_update'
}

/**
 * Event data structure
 */
export interface DrawingIntelligenceEvent {
  type: DrawingIntelligenceEventType;
  timestamp: number;
  data: any;
  source: 'user_input' | 'ai_engine' | 'optimization' | 'automation' | 'system';
  sessionId: string;
  correlationId?: string;
}

// ============================================================================
// INTEGRATION INTERFACES
// ============================================================================

/**
 * Main Drawing Intelligence Engine interface
 */
export interface DrawingIntelligenceEngine {
  // Core functionality
  recognizeShape(stroke: DrawingStroke, context: DrawingContext): Promise<ShapeRecognitionResult>;
  optimizePath(path: PathShape, config: PathOptimizationConfig): Promise<PathOptimizationResult>;
  analyzeArtisticIntent(drawing: RecognizedShape[], context: DrawingContext): Promise<ArtisticIntentResult>;
  generateCreativeSuggestions(drawing: RecognizedShape[], intent: ArtisticIntentResult): Promise<CreativeSuggestion[]>;
  
  // Automation
  executeDrawingAction(action: DrawingAction, context: DrawingContext): Promise<void>;
  executeWorkflow(workflow: DrawingWorkflow, context: DrawingContext): Promise<void>;
  
  // Performance and monitoring
  getPerformanceMetrics(): DrawingIntelligenceMetrics;
  getHealthStatus(): PerformanceMonitor;
  
  // Configuration
  updateConfiguration(config: Partial<DrawingAIModelConfig>): void;
  
  // Event handling
  addEventListener(type: DrawingIntelligenceEventType, handler: (event: DrawingIntelligenceEvent) => void): void;
  removeEventListener(type: DrawingIntelligenceEventType, handler: (event: DrawingIntelligenceEvent) => void): void;
}

/**
 * Shape Recognition Engine interface
 */
export interface ShapeRecognitionEngine {
  recognizeShape(stroke: DrawingStroke, context: DrawingContext): Promise<ShapeRecognitionResult>;
  trainOnUserBehavior(examples: Array<{ stroke: DrawingStroke; expectedShape: ShapeType }>): Promise<void>;
  getRecognitionConfidence(stroke: DrawingStroke): Promise<number>;
  getSupportedShapeTypes(): ShapeType[];
}

/**
 * Path Optimization Engine interface
 */
export interface PathOptimizationEngine {
  optimizePath(path: PathShape, config: PathOptimizationConfig): Promise<PathOptimizationResult>;
  simplifyPath(path: PathShape, tolerance: number): Promise<PathShape>;
  smoothPath(path: PathShape, factor: number): Promise<PathShape>;
  correctAngles(path: PathShape, threshold: number): Promise<PathShape>;
  analyzePathQuality(path: PathShape): Promise<PathQualityMetrics>;
}

/**
 * Creative Assistance Engine interface
 */
export interface CreativeAssistanceEngine {
  analyzeArtisticIntent(shapes: RecognizedShape[], context: DrawingContext): Promise<ArtisticIntentResult>;
  generateSuggestions(intent: ArtisticIntentResult, shapes: RecognizedShape[]): Promise<CreativeSuggestion[]>;
  applyStyleToDrawing(shapes: RecognizedShape[], style: CreativeStyle): Promise<RecognizedShape[]>;
  analyzeDrawingComposition(shapes: RecognizedShape[]): Promise<StyleAnalysis>;
  learnFromUserFeedback(suggestion: CreativeSuggestion, accepted: boolean): Promise<void>;
}

/**
 * Drawing Automation Engine interface
 */
export interface DrawingAutomationEngine {
  planWorkflow(intent: ArtisticIntent, context: DrawingContext): Promise<DrawingWorkflow>;
  executeAction(action: DrawingAction, context: DrawingContext): Promise<void>;
  executeWorkflow(workflow: DrawingWorkflow, context: DrawingContext): Promise<void>;
  validateAction(action: DrawingAction, context: DrawingContext): Promise<boolean>;
  rollbackAction(actionId: string): Promise<void>;
}

// Export all types for external use
// Note: All types are already exported individually above