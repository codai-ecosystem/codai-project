// ============================================================================
// Shape Recognition Corrector - AI-Powered Drawing Shape Analysis
// ============================================================================

import {
  ShapeRecognition,
  RecognizedShape,
  ShapeAlternative,
  ShapeQuality,
  ShapeType,
  DrawingCorrection,
  CorrectionType,
  CorrectionSeverity,
  Position,
  BoundaryBox
} from '../types/drawing-types';
import { ConfidenceLevel } from '../intelligence/intelligence-types';
import { ScreenCaptureEngine } from '../vision/screen-capture-engine';
import { ObjectDetectionEngine } from '../vision/object-detection-engine';

/**
 * Shape Recognition Corrector for Glass MCP
 * 
 * Provides AI-powered shape analysis with:
 * - Real-time shape recognition and classification
 * - Shape quality assessment and correction suggestions
 * - Geometric accuracy analysis
 * - Multi-modal shape detection (visual + pattern)
 */
export class ShapeRecognitionCorrector {
  private readonly screenCapture: ScreenCaptureEngine;
  private readonly objectDetection: ObjectDetectionEngine;
  
  private readonly recognitionCache = new Map<string, ShapeRecognition>();
  private readonly correctionHistory = new Map<string, DrawingCorrection[]>();
  
  private readonly qualityThresholds = {
    completeness: 0.8,
    accuracy: 0.7,
    regularity: 0.6,
    clarity: 0.75
  };

  constructor() {
    this.screenCapture = ScreenCaptureEngine.getInstance();
    this.objectDetection = ObjectDetectionEngine.getInstance();
  }

  /**
   * Recognize and analyze shapes in a drawing area
   */
  async recognizeShapes(
    drawingRegion: BoundaryBox,
    expectedShapes?: ShapeType[]
  ): Promise<ShapeRecognition> {
    try {
      // Capture the drawing region
      const screenCapture = await this.screenCapture.captureRegion({
        x: drawingRegion.topLeft.x,
        y: drawingRegion.topLeft.y,
        width: drawingRegion.bottomRight.x - drawingRegion.topLeft.x,
        height: drawingRegion.bottomRight.y - drawingRegion.topLeft.y
      });

      // Detect objects in the captured region
      const detectionResult = await this.objectDetection.detectObjects(
        screenCapture.imageData,
        {
          model: 'general-detector',
          confidence: 0.3,
          includeGeneral: true,
          maxDetections: 20
        }
      );

      // Analyze and classify shapes
      const recognizedShapes = await this.analyzeDetectedShapes(
        detectionResult.objects,
        expectedShapes
      );

      // Generate alternatives for ambiguous shapes
      const alternatives = await this.generateShapeAlternatives(recognizedShapes);

      // Calculate overall confidence
      const overallConfidence = this.calculateOverallConfidence(recognizedShapes);

      const recognition: ShapeRecognition = {
        detectedShapes: recognizedShapes,
        confidence: overallConfidence,
        alternatives,
        processingTime: Date.now() - screenCapture.timestamp
      };

      // Cache the recognition result
      const cacheKey = this.generateCacheKey(drawingRegion, expectedShapes);
      this.recognitionCache.set(cacheKey, recognition);

      return recognition;
    } catch (error) {
      console.error('Shape recognition failed:', error);
      return {
        detectedShapes: [],
        confidence: ConfidenceLevel.VERY_LOW,
        alternatives: [],
        processingTime: 0
      };
    }
  }

  /**
   * Generate shape quality corrections
   */
  async generateShapeCorrections(
    recognizedShape: RecognizedShape,
    targetQuality?: Partial<ShapeQuality>
  ): Promise<DrawingCorrection[]> {
    const corrections: DrawingCorrection[] = [];
    const quality = recognizedShape.quality;
    const target = { ...this.qualityThresholds, ...targetQuality };

    // Completeness corrections
    if (quality.completeness < target.completeness) {
      corrections.push(await this.createCompletenessCorrection(recognizedShape, target));
    }

    // Accuracy corrections  
    if (quality.accuracy < target.accuracy) {
      corrections.push(await this.createAccuracyCorrection(recognizedShape, target));
    }

    // Regularity corrections
    if (quality.regularity < target.regularity) {
      corrections.push(await this.createRegularityCorrection(recognizedShape, target));
    }

    // Clarity corrections
    if (quality.clarity < target.clarity) {
      corrections.push(await this.createClarityCorrection(recognizedShape, target));
    }

    // Store correction history
    this.correctionHistory.set(recognizedShape.type, corrections);

    return corrections;
  }

  /**
   * Analyze geometric properties of shapes
   */
  async analyzeGeometricAccuracy(
    recognizedShape: RecognizedShape,
    idealParameters?: any
  ): Promise<GeometricAnalysis> {
    const analysis: GeometricAnalysis = {
      shapeType: recognizedShape.type,
      accuracy: recognizedShape.quality.accuracy,
      deviations: await this.calculateGeometricDeviations(recognizedShape),
      recommendations: await this.generateGeometricRecommendations(recognizedShape),
      correctionRequired: recognizedShape.quality.accuracy < this.qualityThresholds.accuracy
    };

    // Shape-specific analysis
    switch (recognizedShape.type) {
      case ShapeType.CIRCLE:
        analysis.circleAnalysis = await this.analyzeCircle(recognizedShape);
        break;
      case ShapeType.RECTANGLE:
        analysis.rectangleAnalysis = await this.analyzeRectangle(recognizedShape);
        break;
      case ShapeType.LINE:
        analysis.lineAnalysis = await this.analyzeLine(recognizedShape);
        break;
    }

    return analysis;
  }

  /**
   * Suggest shape improvements based on recognition results
   */
  async suggestShapeImprovements(
    recognition: ShapeRecognition,
    targetShapes?: ShapeType[]
  ): Promise<ShapeImprovement[]> {
    const improvements: ShapeImprovement[] = [];

    for (const shape of recognition.detectedShapes) {
      const shapeImprovements = await this.analyzeShapeForImprovements(shape);
      improvements.push(...shapeImprovements);
    }

    // Check for missing shapes
    if (targetShapes) {
      const missingShapes = await this.identifyMissingShapes(recognition, targetShapes);
      for (const missingShape of missingShapes) {
        improvements.push({
          type: 'missing_shape',
          shapeType: missingShape,
          priority: 'high',
          description: `Missing required shape: ${missingShape}`,
          suggestedActions: [
            `Draw a ${missingShape}`,
            'Ensure proper positioning',
            'Maintain consistent style'
          ],
          estimatedEffort: 'medium'
        });
      }
    }

    return improvements.sort((a, b) => this.priorityWeight(b.priority) - this.priorityWeight(a.priority));
  }

  /**
   * Real-time shape validation during drawing
   */
  async validateShapeInRealTime(
    drawingRegion: BoundaryBox,
    expectedShape: ShapeType,
    progressCallback?: (progress: ShapeValidationProgress) => void
  ): Promise<ShapeValidationResult> {
    const validationStart = Date.now();
    
    try {
      // Continuous recognition during drawing
      const recognition = await this.recognizeShapes(drawingRegion, [expectedShape]);
      
      // Find the best matching shape
      const bestMatch = this.findBestShapeMatch(recognition.detectedShapes, expectedShape);
      
      // Calculate validation metrics
      const validation: ShapeValidationResult = {
        isValid: bestMatch !== null && bestMatch.confidence > 0.6,
        matchedShape: bestMatch,
        confidence: bestMatch?.confidence || 0,
        qualityScore: bestMatch?.quality.overallScore || 0,
        deviations: bestMatch ? await this.calculateShapeDeviations(bestMatch, expectedShape) : [],
        recommendations: bestMatch ? await this.generateValidationRecommendations(bestMatch, expectedShape) : [],
        processingTime: Date.now() - validationStart
      };

      // Provide progress feedback
      if (progressCallback) {
        progressCallback({
          completionPercentage: this.calculateShapeCompletion(bestMatch, expectedShape),
          currentQuality: validation.qualityScore,
          nextRecommendation: validation.recommendations[0] || 'Continue drawing',
          validationPassing: validation.isValid
        });
      }

      return validation;
    } catch (error) {
      console.error('Real-time shape validation failed:', error);
      return {
        isValid: false,
        matchedShape: null,
        confidence: 0,
        qualityScore: 0,
        deviations: [],
        recommendations: ['Validation failed - please retry'],
        processingTime: Date.now() - validationStart
      };
    }
  }

  // ============================================================================
  // SHAPE ANALYSIS METHODS
  // ============================================================================

  private async analyzeDetectedShapes(
    detectedObjects: any[],
    expectedShapes?: ShapeType[]
  ): Promise<RecognizedShape[]> {
    const recognizedShapes: RecognizedShape[] = [];

    for (const obj of detectedObjects) {
      const shapeType = this.classifyObjectAsShape(obj, expectedShapes);
      if (shapeType) {
        const recognizedShape = await this.createRecognizedShape(obj, shapeType);
        recognizedShapes.push(recognizedShape);
      }
    }

    return recognizedShapes;
  }

  private classifyObjectAsShape(obj: any, expectedShapes?: ShapeType[]): ShapeType | null {
    const label = obj.label.toLowerCase();
    
    // Direct label matching
    if (label.includes('circle')) return ShapeType.CIRCLE;
    if (label.includes('rectangle') || label.includes('square')) return ShapeType.RECTANGLE;
    if (label.includes('line')) return ShapeType.LINE;
    if (label.includes('ellipse') || label.includes('oval')) return ShapeType.ELLIPSE;
    if (label.includes('polygon')) return ShapeType.POLYGON;
    
    // Geometric analysis for ambiguous objects
    if (expectedShapes && expectedShapes.length > 0) {
      return this.classifyByGeometry(obj, expectedShapes);
    }
    
    return ShapeType.FREEFORM;
  }

  private classifyByGeometry(obj: any, expectedShapes: ShapeType[]): ShapeType {
    const bbox = obj.boundingBox;
    const aspectRatio = bbox.width / bbox.height;
    const area = bbox.width * bbox.height;
    
    // Simple geometric heuristics
    if (expectedShapes.includes(ShapeType.CIRCLE) && Math.abs(aspectRatio - 1) < 0.2) {
      return ShapeType.CIRCLE;
    }
    
    if (expectedShapes.includes(ShapeType.RECTANGLE) && (aspectRatio > 1.2 || aspectRatio < 0.8)) {
      return ShapeType.RECTANGLE;
    }
    
    if (expectedShapes.includes(ShapeType.LINE) && (bbox.width > bbox.height * 3 || bbox.height > bbox.width * 3)) {
      return ShapeType.LINE;
    }
    
    return expectedShapes[0]; // Default to first expected shape
  }

  private async createRecognizedShape(obj: any, shapeType: ShapeType): Promise<RecognizedShape> {
    const quality = await this.assessShapeQuality(obj, shapeType);
    
    return {
      type: shapeType,
      confidence: obj.confidence,
      boundingBox: {
        topLeft: { x: obj.boundingBox.x, y: obj.boundingBox.y },
        bottomRight: { 
          x: obj.boundingBox.x + obj.boundingBox.width, 
          y: obj.boundingBox.y + obj.boundingBox.height 
        }
      },
      parameters: await this.extractShapeParameters(obj, shapeType),
      quality
    };
  }

  private async assessShapeQuality(obj: any, shapeType: ShapeType): Promise<ShapeQuality> {
    // Simplified quality assessment - in practice would use advanced computer vision
    const completeness = obj.confidence; // Use confidence as proxy
    const accuracy = this.calculateShapeAccuracy(obj, shapeType);
    const regularity = this.calculateShapeRegularity(obj, shapeType);
    const clarity = obj.confidence * 0.9; // Slightly lower than completeness
    
    return {
      completeness,
      accuracy,
      regularity,
      clarity,
      overallScore: (completeness + accuracy + regularity + clarity) / 4
    };
  }

  private calculateShapeAccuracy(obj: any, shapeType: ShapeType): number {
    // Geometric accuracy based on shape type
    const bbox = obj.boundingBox;
    const aspectRatio = bbox.width / bbox.height;
    
    switch (shapeType) {
      case ShapeType.CIRCLE:
        // Circle should have aspect ratio close to 1
        return Math.max(0, 1 - Math.abs(aspectRatio - 1));
      case ShapeType.RECTANGLE:
        // Rectangle accuracy based on edge straightness (simplified)
        return Math.min(1, obj.confidence + 0.1);
      case ShapeType.LINE:
        // Line should be elongated
        const elongation = Math.max(aspectRatio, 1 / aspectRatio);
        return Math.min(1, elongation / 5);
      default:
        return obj.confidence;
    }
  }

  private calculateShapeRegularity(obj: any, shapeType: ShapeType): number {
    // Simplified regularity calculation
    // In practice would analyze edge smoothness, corner consistency, etc.
    return Math.min(1, obj.confidence + 0.05);
  }

  private async extractShapeParameters(obj: any, shapeType: ShapeType): Promise<any> {
    const bbox = obj.boundingBox;
    const center = {
      x: bbox.x + bbox.width / 2,
      y: bbox.y + bbox.height / 2
    };
    
    switch (shapeType) {
      case ShapeType.CIRCLE:
        return {
          dimensions: {
            radius: Math.min(bbox.width, bbox.height) / 2
          },
          position: center,
          style: { color: '#000000', thickness: 2, opacity: 1, pattern: 'solid' }
        };
      case ShapeType.RECTANGLE:
        return {
          dimensions: {
            width: bbox.width,
            height: bbox.height
          },
          position: { x: bbox.x, y: bbox.y },
          style: { color: '#000000', thickness: 2, opacity: 1, pattern: 'solid' }
        };
      default:
        return {
          dimensions: { width: bbox.width, height: bbox.height },
          position: center,
          style: { color: '#000000', thickness: 2, opacity: 1, pattern: 'solid' }
        };
    }
  }

  // ============================================================================
  // CORRECTION GENERATION
  // ============================================================================

  private async createCompletenessCorrection(
    shape: RecognizedShape,
    target: any
  ): Promise<DrawingCorrection> {
    return {
      id: `completeness-${Date.now()}`,
      type: CorrectionType.SHAPE,
      severity: CorrectionSeverity.MEDIUM,
      description: `Shape completeness is ${(shape.quality.completeness * 100).toFixed(1)}% (target: ${(target.completeness * 100).toFixed(1)}%)`,
      correctionActions: [
        'Complete unfinished edges',
        'Fill gaps in the shape outline',
        'Ensure shape is fully closed'
      ],
      expectedImprovement: target.completeness - shape.quality.completeness,
      autoApplicable: false
    };
  }

  private async createAccuracyCorrection(
    shape: RecognizedShape,
    target: any
  ): Promise<DrawingCorrection> {
    return {
      id: `accuracy-${Date.now()}`,
      type: CorrectionType.SHAPE,
      severity: CorrectionSeverity.HIGH,
      description: `Shape accuracy needs improvement (${(shape.quality.accuracy * 100).toFixed(1)}%)`,
      correctionActions: [
        'Improve geometric precision',
        'Correct shape proportions',
        'Align with reference measurements'
      ],
      expectedImprovement: target.accuracy - shape.quality.accuracy,
      autoApplicable: true
    };
  }

  private async createRegularityCorrection(
    shape: RecognizedShape,
    target: any
  ): Promise<DrawingCorrection> {
    return {
      id: `regularity-${Date.now()}`,
      type: CorrectionType.SMOOTHING,
      severity: CorrectionSeverity.LOW,
      description: `Shape regularity can be improved (${(shape.quality.regularity * 100).toFixed(1)}%)`,
      correctionActions: [
        'Smooth irregular edges',
        'Maintain consistent curvature',
        'Apply symmetry corrections'
      ],
      expectedImprovement: target.regularity - shape.quality.regularity,
      autoApplicable: true
    };
  }

  private async createClarityCorrection(
    shape: RecognizedShape,
    target: any
  ): Promise<DrawingCorrection> {
    return {
      id: `clarity-${Date.now()}`,
      type: CorrectionType.STYLE,
      severity: CorrectionSeverity.LOW,
      description: `Shape clarity needs enhancement (${(shape.quality.clarity * 100).toFixed(1)}%)`,
      correctionActions: [
        'Increase line thickness',
        'Improve contrast',
        'Remove background noise'
      ],
      expectedImprovement: target.clarity - shape.quality.clarity,
      autoApplicable: true
    };
  }

  // ============================================================================
  // GEOMETRIC ANALYSIS
  // ============================================================================

  private async calculateGeometricDeviations(shape: RecognizedShape): Promise<GeometricDeviation[]> {
    const deviations: GeometricDeviation[] = [];
    
    switch (shape.type) {
      case ShapeType.CIRCLE:
        const circleDeviations = await this.calculateCircleDeviations(shape);
        deviations.push(...circleDeviations);
        break;
      case ShapeType.RECTANGLE:
        const rectDeviations = await this.calculateRectangleDeviations(shape);
        deviations.push(...rectDeviations);
        break;
    }
    
    return deviations;
  }

  private async calculateCircleDeviations(shape: RecognizedShape): Promise<GeometricDeviation[]> {
    const deviations: GeometricDeviation[] = [];
    
    // Check if it's actually circular
    const bbox = shape.boundingBox;
    const width = bbox.bottomRight.x - bbox.topLeft.x;
    const height = bbox.bottomRight.y - bbox.topLeft.y;
    const aspectRatio = width / height;
    
    if (Math.abs(aspectRatio - 1) > 0.1) {
      deviations.push({
        type: 'aspect_ratio',
        severity: 'medium',
        description: `Circle aspect ratio is ${aspectRatio.toFixed(2)} (should be 1.0)`,
        expectedValue: 1.0,
        actualValue: aspectRatio,
        correctionSuggestion: 'Adjust width and height to be equal'
      });
    }
    
    return deviations;
  }

  private async calculateRectangleDeviations(shape: RecognizedShape): Promise<GeometricDeviation[]> {
    const deviations: GeometricDeviation[] = [];
    
    // Check for square vs rectangle
    const bbox = shape.boundingBox;
    const width = bbox.bottomRight.x - bbox.topLeft.x;
    const height = bbox.bottomRight.y - bbox.topLeft.y;
    const aspectRatio = width / height;
    
    // Check if corners are properly aligned (simplified)
    if (shape.quality.accuracy < 0.8) {
      deviations.push({
        type: 'corner_alignment',
        severity: 'low',
        description: 'Rectangle corners may not be perfectly aligned',
        expectedValue: 90,
        actualValue: 85, // Estimated
        correctionSuggestion: 'Ensure corners are at 90-degree angles'
      });
    }
    
    return deviations;
  }

  private async generateGeometricRecommendations(shape: RecognizedShape): Promise<string[]> {
    const recommendations: string[] = [];
    
    if (shape.quality.accuracy < 0.7) {
      recommendations.push('Focus on geometric precision');
    }
    
    if (shape.quality.regularity < 0.6) {
      recommendations.push('Maintain consistent shape proportions');
    }
    
    return recommendations;
  }

  // ============================================================================
  // SHAPE-SPECIFIC ANALYSIS
  // ============================================================================

  private async analyzeCircle(shape: RecognizedShape): Promise<CircleAnalysis> {
    const bbox = shape.boundingBox;
    const width = bbox.bottomRight.x - bbox.topLeft.x;
    const height = bbox.bottomRight.y - bbox.topLeft.y;
    const aspectRatio = width / height;
    
    return {
      aspectRatio,
      isCircular: Math.abs(aspectRatio - 1) < 0.1,
      estimatedRadius: Math.min(width, height) / 2,
      centerPoint: {
        x: bbox.topLeft.x + width / 2,
        y: bbox.topLeft.y + height / 2
      },
      quality: shape.quality.accuracy
    };
  }

  private async analyzeRectangle(shape: RecognizedShape): Promise<RectangleAnalysis> {
    const bbox = shape.boundingBox;
    const width = bbox.bottomRight.x - bbox.topLeft.x;
    const height = bbox.bottomRight.y - bbox.topLeft.y;
    
    return {
      width,
      height,
      aspectRatio: width / height,
      isSquare: Math.abs(width - height) < 5, // 5 pixel tolerance
      cornerAccuracy: shape.quality.regularity,
      edgeStraightness: shape.quality.accuracy
    };
  }

  private async analyzeLine(shape: RecognizedShape): Promise<LineAnalysis> {
    const bbox = shape.boundingBox;
    const width = bbox.bottomRight.x - bbox.topLeft.x;
    const height = bbox.bottomRight.y - bbox.topLeft.y;
    
    return {
      length: Math.sqrt(width * width + height * height),
      thickness: Math.min(width, height),
      straightness: shape.quality.regularity,
      angle: Math.atan2(height, width) * (180 / Math.PI)
    };
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private async generateShapeAlternatives(shapes: RecognizedShape[]): Promise<ShapeAlternative[]> {
    const alternatives: ShapeAlternative[] = [];
    
    for (const shape of shapes) {
      if (shape.confidence < 0.7) {
        // Generate alternative interpretations for low-confidence shapes
        const alternativeTypes = this.getAlternativeShapeTypes(shape);
        for (const altType of alternativeTypes) {
          alternatives.push({
            type: altType,
            confidence: shape.confidence * 0.8, // Lower confidence for alternatives
            reason: `Alternative interpretation based on geometric analysis`
          });
        }
      }
    }
    
    return alternatives;
  }

  private getAlternativeShapeTypes(shape: RecognizedShape): ShapeType[] {
    const alternatives: ShapeType[] = [];
    const bbox = shape.boundingBox;
    const aspectRatio = (bbox.bottomRight.x - bbox.topLeft.x) / (bbox.bottomRight.y - bbox.topLeft.y);
    
    // Suggest alternatives based on geometry
    if (Math.abs(aspectRatio - 1) < 0.3) {
      if (shape.type !== ShapeType.CIRCLE) alternatives.push(ShapeType.CIRCLE);
      if (shape.type !== ShapeType.RECTANGLE) alternatives.push(ShapeType.RECTANGLE);
    }
    
    if (aspectRatio > 2 || aspectRatio < 0.5) {
      if (shape.type !== ShapeType.LINE) alternatives.push(ShapeType.LINE);
      if (shape.type !== ShapeType.RECTANGLE) alternatives.push(ShapeType.RECTANGLE);
    }
    
    return alternatives;
  }

  private calculateOverallConfidence(shapes: RecognizedShape[]): ConfidenceLevel {
    if (shapes.length === 0) return ConfidenceLevel.VERY_LOW;
    
    const avgConfidence = shapes.reduce((sum, shape) => sum + shape.confidence, 0) / shapes.length;
    
    if (avgConfidence > 0.9) return ConfidenceLevel.VERY_HIGH;
    if (avgConfidence > 0.7) return ConfidenceLevel.HIGH;
    if (avgConfidence > 0.5) return ConfidenceLevel.MEDIUM;
    if (avgConfidence > 0.3) return ConfidenceLevel.LOW;
    return ConfidenceLevel.VERY_LOW;
  }

  private generateCacheKey(region: BoundaryBox, expectedShapes?: ShapeType[]): string {
    const regionStr = `${region.topLeft.x},${region.topLeft.y}-${region.bottomRight.x},${region.bottomRight.y}`;
    const shapesStr = expectedShapes?.join(',') || 'any';
    return `${regionStr}:${shapesStr}`;
  }

  private async analyzeShapeForImprovements(shape: RecognizedShape): Promise<ShapeImprovement[]> {
    const improvements: ShapeImprovement[] = [];
    
    if (shape.quality.overallScore < 0.7) {
      improvements.push({
        type: 'quality_improvement',
        shapeType: shape.type,
        priority: 'medium',
        description: `Improve overall quality (${(shape.quality.overallScore * 100).toFixed(1)}%)`,
        suggestedActions: [
          'Redraw with more precision',
          'Use drawing guides',
          'Increase line thickness'
        ],
        estimatedEffort: 'low'
      });
    }
    
    return improvements;
  }

  private async identifyMissingShapes(
    recognition: ShapeRecognition,
    targetShapes: ShapeType[]
  ): Promise<ShapeType[]> {
    const detectedTypes = new Set(recognition.detectedShapes.map((s: RecognizedShape) => s.type));
    return targetShapes.filter(type => !detectedTypes.has(type));
  }

  private findBestShapeMatch(shapes: RecognizedShape[], expectedType: ShapeType): RecognizedShape | null {
    const matches = shapes.filter(shape => shape.type === expectedType);
    if (matches.length === 0) return null;
    
    return matches.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    );
  }

  private async calculateShapeDeviations(shape: RecognizedShape, expectedType: ShapeType): Promise<string[]> {
    const deviations: string[] = [];
    
    if (shape.quality.accuracy < 0.7) {
      deviations.push('Shape accuracy below target');
    }
    
    if (shape.quality.completeness < 0.8) {
      deviations.push('Shape appears incomplete');
    }
    
    return deviations;
  }

  private async generateValidationRecommendations(
    shape: RecognizedShape,
    expectedType: ShapeType
  ): Promise<string[]> {
    const recommendations: string[] = [];
    
    if (shape.quality.accuracy < 0.7) {
      recommendations.push('Improve geometric accuracy');
    }
    
    if (shape.confidence < 0.6) {
      recommendations.push('Make shape more distinct');
    }
    
    return recommendations;
  }

  private calculateShapeCompletion(shape: RecognizedShape | null, expectedType: ShapeType): number {
    if (!shape) return 0;
    return shape.quality.completeness * 100;
  }

  private priorityWeight(priority: string): number {
    switch (priority) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  }
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface GeometricAnalysis {
  shapeType: ShapeType;
  accuracy: number;
  deviations: GeometricDeviation[];
  recommendations: string[];
  correctionRequired: boolean;
  circleAnalysis?: CircleAnalysis;
  rectangleAnalysis?: RectangleAnalysis;
  lineAnalysis?: LineAnalysis;
}

export interface GeometricDeviation {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  expectedValue: number;
  actualValue: number;
  correctionSuggestion: string;
}

export interface CircleAnalysis {
  aspectRatio: number;
  isCircular: boolean;
  estimatedRadius: number;
  centerPoint: Position;
  quality: number;
}

export interface RectangleAnalysis {
  width: number;
  height: number;
  aspectRatio: number;
  isSquare: boolean;
  cornerAccuracy: number;
  edgeStraightness: number;
}

export interface LineAnalysis {
  length: number;
  thickness: number;
  straightness: number;
  angle: number;
}

export interface ShapeImprovement {
  type: string;
  shapeType: ShapeType;
  priority: 'low' | 'medium' | 'high';
  description: string;
  suggestedActions: string[];
  estimatedEffort: 'low' | 'medium' | 'high';
}

export interface ShapeValidationResult {
  isValid: boolean;
  matchedShape: RecognizedShape | null;
  confidence: number;
  qualityScore: number;
  deviations: string[];
  recommendations: string[];
  processingTime: number;
}

export interface ShapeValidationProgress {
  completionPercentage: number;
  currentQuality: number;
  nextRecommendation: string;
  validationPassing: boolean;
}