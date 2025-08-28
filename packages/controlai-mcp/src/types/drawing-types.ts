// ============================================================================
// Drawing Types - Type definitions for advanced drawing engine
// ============================================================================

import { ConfidenceLevel } from '../intelligence/intelligence-types';

// ============================================================================
// CORE DRAWING TYPES
// ============================================================================

export interface DrawingContext {
  id: string;
  canvasId: string;
  targetShape: TargetShape;
  constraints: DrawingConstraints;
  preferences: DrawingPreferences;
  environment: DrawingEnvironment;
}

export interface TargetShape {
  type: ShapeType;
  parameters: ShapeParameters;
  expectedElements: number;
  qualityRequirements: QualityRequirements;
  visualReference?: any;
}

export enum ShapeType {
  LINE = 'line',
  CIRCLE = 'circle',
  RECTANGLE = 'rectangle',
  ELLIPSE = 'ellipse',
  POLYGON = 'polygon',
  CURVE = 'curve',
  FREEFORM = 'freeform',
  COMPOSITE = 'composite'
}

export interface ShapeParameters {
  dimensions: Dimensions;
  position: Position;
  rotation?: number;
  style: DrawingStyle;
  controlPoints?: Position[];
}

export interface Dimensions {
  width: number;
  height: number;
  radius?: number;
  thickness?: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface DrawingStyle {
  color: string;
  thickness: number;
  opacity: number;
  pattern: LinePattern;
  fillColor?: string;
}

export enum LinePattern {
  SOLID = 'solid',
  DASHED = 'dashed',
  DOTTED = 'dotted',
  DASH_DOT = 'dash-dot'
}

export interface QualityRequirements {
  minAccuracy: number;
  minSmoothness: number;
  maxDeviation: number;
  completionThreshold: number;
}

export interface DrawingConstraints {
  boundaryBox: BoundaryBox;
  allowedShapes: ShapeType[];
  maxExecutionTime: number;
  qualityThreshold: number;
  correctionEnabled: boolean;
}

export interface BoundaryBox {
  topLeft: Position;
  bottomRight: Position;
}

export interface DrawingPreferences {
  speed: DrawingSpeed;
  precision: PrecisionLevel;
  feedbackLevel: FeedbackLevel;
  autoCorrection: boolean;
  visualFeedback: boolean;
}

export enum DrawingSpeed {
  VERY_SLOW = 'very_slow',
  SLOW = 'slow',
  NORMAL = 'normal',
  FAST = 'fast',
  VERY_FAST = 'very_fast'
}

export enum PrecisionLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high'
}

export enum FeedbackLevel {
  NONE = 'none',
  BASIC = 'basic',
  DETAILED = 'detailed',
  VERBOSE = 'verbose',
  EXCELLENT = 'excellent',
  GOOD = 'good',
  WARNING = 'warning',
  CRITICAL = 'critical'
}

export interface DrawingEnvironment {
  screenResolution: { width: number; height: number };
  dpi: number;
  colorDepth: number;
  supportedFeatures: string[];
}

// ============================================================================
// DRAWING COMMANDS
// ============================================================================

export interface DrawingCommand {
  id: string;
  type: CommandType;
  parameters: CommandParameters;
  timing: CommandTiming;
  validation: CommandValidation;
}

export enum CommandType {
  MOVE = 'move',
  DRAW_LINE = 'draw_line',
  DRAW_CIRCLE = 'draw_circle',
  DRAW_RECTANGLE = 'draw_rectangle',
  DRAW_CURVE = 'draw_curve',
  DRAW_ARC = 'draw_arc',
  FILL_SHAPE = 'fill_shape',
  SET_STYLE = 'set_style',
  BEGIN_PATH = 'begin_path',
  END_PATH = 'end_path'
}

export interface CommandParameters {
  coordinates?: Position;
  startPoint?: Position;
  endPoint?: Position;
  center?: Position;
  radius?: number;
  topLeft?: Position;
  bottomRight?: Position;
  controlPoints?: Position[];
  style?: DrawingStyle;
  [key: string]: any;
}

export interface CommandTiming {
  delay: number;
  duration: number;
  acceleration: AccelerationType;
}

export enum AccelerationType {
  LINEAR = 'linear',
  EASE_IN = 'ease_in',
  EASE_OUT = 'ease_out',
  EASE_IN_OUT = 'ease_in_out',
  SMOOTH = 'smooth'
}

export interface CommandValidation {
  required: boolean;
  preconditions: string[];
  postconditions: string[];
  errorHandling: ErrorHandlingStrategy;
}

export enum ErrorHandlingStrategy {
  IGNORE = 'ignore',
  RETRY = 'retry',
  ABORT = 'abort',
  RECOVER = 'recover'
}

// ============================================================================
// DRAWING STATE
// ============================================================================

export interface DrawingState {
  id: string;
  context: DrawingContext;
  startTime: Date;
  targetShape: TargetShape;
  currentProgress: number;
  appliedCorrections: DrawingCorrection[];
  feedbackHistory: VisualFeedback[];
  screenHistory: any[];
  qualityScore: number;
  status: DrawingStatus;
}

export enum DrawingStatus {
  INITIALIZING = 'initializing',
  ACTIVE = 'active',
  PAUSED = 'paused',
  CORRECTING = 'correcting',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// ============================================================================
// VISUAL FEEDBACK
// ============================================================================

export interface VisualFeedback {
  timestamp: Date;
  drawingId: string;
  shapeAccuracy: number;
  positionAccuracy: number;
  sizeAccuracy: number;
  overallQuality: number;
  level: FeedbackLevel;
  suggestions: string[];
  corrections: string[];
  nextRecommendedAction: string;
}

export interface RealTimeAnalysis {
  timestamp: Date;
  screenCapture: any;
  detectedElements: DetectedElement[];
  qualityMetrics: QualityMetrics;
  intentAlignment: IntentAlignment;
  recommendations: string[];
  completionPercentage: number;
  nextSuggestedAction: string;
}

export interface DetectedElement {
  id: string;
  type: ShapeType;
  confidence: number;
  boundingBox: BoundaryBox;
  properties: ElementProperties;
}

export interface ElementProperties {
  position: Position;
  dimensions: Dimensions;
  style: DrawingStyle;
  quality: number;
  [key: string]: any;
}

export interface QualityMetrics {
  accuracy: number;
  smoothness: number;
  completeness: number;
  consistency: number;
  overallScore: number;
}

export interface IntentAlignment {
  shapeMatch: number;
  positionMatch: number;
  sizeMatch: number;
  styleMatch: number;
  overallMatch: number;
}

// ============================================================================
// DRAWING CORRECTIONS
// ============================================================================

export interface DrawingCorrection {
  id: string;
  type: CorrectionType;
  severity: CorrectionSeverity;
  description: string;
  correctionActions: string[];
  expectedImprovement: number;
  autoApplicable: boolean;
}

export enum CorrectionType {
  SHAPE = 'shape',
  POSITION = 'position',
  SIZE = 'size',
  STYLE = 'style',
  SMOOTHING = 'smoothing',
  ALIGNMENT = 'alignment',
  PROPORTION = 'proportion',
  IMMEDIATE = 'immediate'
}

export enum CorrectionSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// ============================================================================
// VISUALIZATION
// ============================================================================

export enum VisualizationType {
  OVERLAY = 'overlay',
  HIGHLIGHT = 'highlight',
  ANNOTATION = 'annotation',
  HEATMAP = 'heatmap',
  TRAJECTORY = 'trajectory',
  COMPARISON = 'comparison'
}

export interface Visualization {
  id: string;
  type: VisualizationType;
  data: VisualizationData;
  style: VisualizationStyle;
  duration: number;
  interactive: boolean;
}

export interface VisualizationData {
  elements: VisualElement[];
  metadata: { [key: string]: any };
  timestamps: Date[];
}

export interface VisualElement {
  id: string;
  type: string;
  geometry: any;
  properties: { [key: string]: any };
}

export interface VisualizationStyle {
  colors: { [key: string]: string };
  opacity: number;
  strokeWidth: number;
  animation: AnimationStyle;
}

export interface AnimationStyle {
  enabled: boolean;
  duration: number;
  easing: string;
  loop: boolean;
}

// ============================================================================
// PATH OPTIMIZATION
// ============================================================================

export interface PathOptimization {
  originalPath: Path;
  optimizedPath: Path;
  improvements: OptimizationImprovement[];
  metrics: OptimizationMetrics;
}

export interface Path {
  points: Position[];
  curves: CurveSegment[];
  totalLength: number;
  boundingBox: BoundaryBox;
}

export interface CurveSegment {
  startPoint: Position;
  endPoint: Position;
  controlPoints: Position[];
  type: CurveType;
}

export enum CurveType {
  LINEAR = 'linear',
  QUADRATIC = 'quadratic',
  CUBIC = 'cubic',
  BEZIER = 'bezier',
  SPLINE = 'spline'
}

export interface OptimizationImprovement {
  type: OptimizationType;
  description: string;
  impact: number;
  beforeValue: number;
  afterValue: number;
}

export enum OptimizationType {
  SMOOTHING = 'smoothing',
  SIMPLIFICATION = 'simplification',
  ACCELERATION = 'acceleration',
  PRECISION = 'precision',
  EFFICIENCY = 'efficiency'
}

export interface OptimizationMetrics {
  smoothnessImprovement: number;
  lengthReduction: number;
  pointReduction: number;
  executionTimeReduction: number;
  qualityScore: number;
}

// ============================================================================
// SHAPE RECOGNITION
// ============================================================================

export interface ShapeRecognition {
  detectedShapes: RecognizedShape[];
  confidence: ConfidenceLevel;
  alternatives: ShapeAlternative[];
  processingTime: number;
}

export interface RecognizedShape {
  type: ShapeType;
  confidence: number;
  boundingBox: BoundaryBox;
  parameters: ShapeParameters;
  quality: ShapeQuality;
}

export interface ShapeAlternative {
  type: ShapeType;
  confidence: number;
  reason: string;
}

export interface ShapeQuality {
  completeness: number;
  accuracy: number;
  regularity: number;
  clarity: number;
  overallScore: number;
}

// ============================================================================
// PERFORMANCE METRICS
// ============================================================================

export interface DrawingPerformanceMetrics {
  executionTime: number;
  accuracy: number;
  efficiency: number;
  resourceUsage: ResourceUsage;
  userSatisfaction: number;
}

export interface ResourceUsage {
  cpuUsage: number;
  memoryUsage: number;
  networkUsage: number;
  diskUsage: number;
}

// All interfaces and enums are exported by default through their export declarations above