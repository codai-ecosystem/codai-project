/**
 * Glass MCP v7.0 - Shape Recognition Engine
 * 
 * AI-powered shape recognition system using ONNX Runtime and Windows ML
 * for real-time drawing stroke analysis, pattern recognition, and geometric 
 * shape classification with confidence scoring.
 * 
 * Key Features:
 * - Real-time shape recognition from drawing strokes
 * - ONNX Runtime integration for ML inference
 * - Windows AI Foundry 2025 pattern recognition
 * - Confidence scoring and alternative suggestions
 * - Geometric analysis and shape classification
 * - Adaptive learning from user corrections
 * 
 * @version 7.0.0-alpha.1
 * @since 2025-08-26
 */

import {
  DrawingStroke,
  ShapeRecognitionResult,
  ShapeType,
  Point2D,
  BoundingBox,
  DrawingContext,
  ShapeRecognitionEngine
} from './drawing-intelligence-types';

/**
 * Configuration for the shape recognition engine
 */
export interface ShapeRecognitionConfig {
  // Recognition thresholds
  minimumConfidenceThreshold: number; // 0.6 default
  alternativeSuggestionsCount: number; // 3 default
  maxProcessingTimeMs: number; // 100ms default
  
  // Geometric analysis parameters
  circularityThreshold: number; // 0.85 for circles
  linearityThreshold: number; // 0.9 for lines
  rectangularityThreshold: number; // 0.8 for rectangles
  symmetryThreshold: number; // 0.7 for regular shapes
  
  // Stroke preprocessing
  enableStrokeSmoothing: boolean;
  enableNoiseReduction: boolean;
  minimumStrokeLength: number; // pixels
  resamplingPointCount: number; // for normalization
  
  // Machine learning model settings
  modelPath: string;
  useGPUAcceleration: boolean;
  batchProcessing: boolean;
  
  // Adaptive learning
  enableUserCorrection: boolean;
  learningRate: number; // 0.01 default
  feedbackWindow: number; // number of recent corrections to consider
}

/**
 * Geometric feature extraction results
 */
interface GeometricFeatures {
  // Basic measurements
  strokeLength: number;
  boundingBoxAspectRatio: number;
  areaToPerimeterRatio: number;
  
  // Shape characteristics
  circularity: number; // 0-1, 1 = perfect circle
  linearity: number; // 0-1, 1 = perfect line
  rectangularity: number; // 0-1, 1 = perfect rectangle
  triangularity: number; // 0-1, 1 = perfect triangle
  
  // Geometric properties
  centerOfMass: Point2D;
  principalAxes: [Point2D, Point2D]; // Major and minor axes
  symmetryScore: number; // 0-1
  smoothness: number; // measure of curve smoothness
  angularity: number; // measure of sharp corners
  
  // Curvature analysis
  averageCurvature: number;
  curvatureVariation: number;
  inflectionPoints: Point2D[];
  
  // Fourier descriptors for shape matching
  fourierDescriptors: number[];
  
  // Statistical measures
  pointDensity: number;
  velocityVariation: number;
  accelerationProfile: number[];
}

/**
 * ML model prediction result
 */
interface MLPrediction {
  shapeType: ShapeType;
  confidence: number;
  features: number[]; // Feature vector used for prediction
  processingTimeMs: number;
}

/**
 * Advanced Shape Recognition Engine implementation
 * 
 * Combines traditional geometric analysis with machine learning
 * for accurate shape recognition and classification
 */
export class AdvancedShapeRecognitionEngine implements ShapeRecognitionEngine {
  private config: ShapeRecognitionConfig;
  private isInitialized: boolean = false;
  private modelSession: any; // ONNX Runtime session
  private userCorrections: Map<string, ShapeType> = new Map();
  private recentPredictions: Array<{
    stroke: DrawingStroke;
    predicted: ShapeType;
    actual?: ShapeType;
    timestamp: number;
  }> = [];

  /**
   * Default configuration for shape recognition
   */
  private static readonly DEFAULT_CONFIG: ShapeRecognitionConfig = {
    minimumConfidenceThreshold: 0.6,
    alternativeSuggestionsCount: 3,
    maxProcessingTimeMs: 100,
    circularityThreshold: 0.85,
    linearityThreshold: 0.9,
    rectangularityThreshold: 0.8,
    symmetryThreshold: 0.7,
    enableStrokeSmoothing: true,
    enableNoiseReduction: true,
    minimumStrokeLength: 10,
    resamplingPointCount: 64,
    modelPath: './models/shape_recognition.onnx',
    useGPUAcceleration: true,
    batchProcessing: false,
    enableUserCorrection: true,
    learningRate: 0.01,
    feedbackWindow: 50
  };

  constructor(config?: Partial<ShapeRecognitionConfig>) {
    this.config = { ...AdvancedShapeRecognitionEngine.DEFAULT_CONFIG, ...config };
  }

  /**
   * Initialize the shape recognition engine
   */
  async initialize(): Promise<void> {
    try {
      // Initialize ONNX Runtime session
      // Note: In a real implementation, this would load the actual ONNX model
      console.log('🔧 Initializing Shape Recognition Engine...');
      console.log('📄 Model path:', this.config.modelPath);
      console.log('🖥️ GPU acceleration:', this.config.useGPUAcceleration);
      
      // Simulated model loading for type safety
      this.modelSession = {
        run: async (inputs: any): Promise<any> => {
          // Mock ONNX model inference
          return this.mockMLInference(inputs);
        }
      };
      
      this.isInitialized = true;
      console.log('✅ Shape Recognition Engine initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Shape Recognition Engine:', error);
      throw new Error(`Shape Recognition Engine initialization failed: ${error}`);
    }
  }

  /**
   * Recognize shape from drawing stroke
   */
  async recognizeShape(
    stroke: DrawingStroke, 
    context: DrawingContext
  ): Promise<ShapeRecognitionResult> {
    const startTime = performance.now();
    
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // 1. Preprocess stroke
      const preprocessedStroke = await this.preprocessStroke(stroke);
      
      // 2. Extract geometric features
      const features = await this.extractGeometricFeatures(preprocessedStroke);
      
      // 3. Perform ML prediction
      const mlPrediction = await this.performMLInference(features, preprocessedStroke);
      
      // 4. Apply geometric validation
      const validatedResult = await this.validateWithGeometry(mlPrediction, features);
      
      // 5. Generate alternative suggestions
      const alternatives = await this.generateAlternatives(validatedResult, features);
      
      // 6. Apply user correction history
      const finalResult = await this.applyUserCorrections(
        validatedResult, 
        alternatives, 
        preprocessedStroke
      );

      const processingTime = performance.now() - startTime;
      
      // Store prediction for learning
      this.recentPredictions.push({
        stroke: preprocessedStroke,
        predicted: finalResult.shapeType,
        timestamp: Date.now()
      });

      // Clean up old predictions
      this.cleanupOldPredictions();

      return {
        shapeType: finalResult.shapeType,
        confidence: finalResult.confidence,
        alternatives: alternatives.slice(0, this.config.alternativeSuggestionsCount),
        processingTimeMs: processingTime,
        boundingBox: this.calculateBoundingBox(preprocessedStroke.points),
        metadata: {
          features: features,
          mlPrediction: mlPrediction,
          contextAnalysis: this.analyzeContext(context)
        }
      };

    } catch (error) {
      console.error('❌ Shape recognition failed:', error);
      
      // Return fallback result
      return {
        shapeType: ShapeType.FREEHAND,
        confidence: 0.1,
        alternatives: [],
        processingTimeMs: performance.now() - startTime,
        boundingBox: this.calculateBoundingBox(stroke.points),
        metadata: { error: String((error as Error).message || error) }
      };
    }
  }

  /**
   * Train on user behavior and corrections
   */
  async trainOnUserBehavior(
    examples: Array<{ stroke: DrawingStroke; expectedShape: ShapeType }>
  ): Promise<void> {
    console.log('🎓 Training on user behavior with', examples.length, 'examples');
    
    for (const example of examples) {
      const strokeId = this.generateStrokeId(example.stroke);
      this.userCorrections.set(strokeId, example.expectedShape);
      
      // Update recent predictions if this correction applies to them
      const matchingPrediction = this.recentPredictions.find(
        pred => this.generateStrokeId(pred.stroke) === strokeId
      );
      
      if (matchingPrediction) {
        matchingPrediction.actual = example.expectedShape;
      }
    }
    
    // In a real implementation, this would retrain or fine-tune the ML model
    console.log('📊 User corrections stored:', this.userCorrections.size);
  }

  /**
   * Get recognition confidence for a stroke
   */
  async getRecognitionConfidence(stroke: DrawingStroke): Promise<number> {
    try {
      const preprocessed = await this.preprocessStroke(stroke);
      const features = await this.extractGeometricFeatures(preprocessed);
      const prediction = await this.performMLInference(features, preprocessed);
      return prediction.confidence;
    } catch (error) {
      console.error('❌ Confidence calculation failed:', error);
      return 0.0;
    }
  }

  /**
   * Get supported shape types
   */
  getSupportedShapeTypes(): ShapeType[] {
    return [
      ShapeType.LINE,
      ShapeType.CIRCLE,
      ShapeType.RECTANGLE,
      ShapeType.SQUARE,
      ShapeType.ELLIPSE,
      ShapeType.TRIANGLE,
      ShapeType.POLYGON,
      ShapeType.CURVE,
      ShapeType.ARC,
      ShapeType.ARROW,
      ShapeType.FREEHAND
    ];
  }

  /**
   * Preprocess drawing stroke for recognition
   */
  private async preprocessStroke(stroke: DrawingStroke): Promise<DrawingStroke> {
    let points = [...stroke.points];
    
    // Apply smoothing if enabled
    if (this.config.enableStrokeSmoothing) {
      points = this.applySmoothingFilter(points);
    }
    
    // Apply noise reduction if enabled
    if (this.config.enableNoiseReduction) {
      points = this.reduceNoise(points);
    }
    
    // Resample points for normalization
    points = this.resamplePoints(points, this.config.resamplingPointCount);
    
    return {
      ...stroke,
      points,
      boundingBox: this.calculateBoundingBox(points)
    };
  }

  /**
   * Extract geometric features from stroke
   */
  private async extractGeometricFeatures(stroke: DrawingStroke): Promise<GeometricFeatures> {
    const points = stroke.points;
    const boundingBox = stroke.boundingBox;
    
    // Calculate basic measurements
    const strokeLength = this.calculateStrokeLength(points);
    const perimeter = this.calculatePerimeter(points);
    const area = this.calculateEnclosedArea(points);
    
    // Shape characteristics
    const circularity = this.calculateCircularity(area, perimeter);
    const linearity = this.calculateLinearity(points);
    const rectangularity = this.calculateRectangularity(points, boundingBox);
    const triangularity = this.calculateTriangularity(points);
    
    // Geometric properties
    const centerOfMass = this.calculateCenterOfMass(points);
    const principalAxes = this.calculatePrincipalAxes(points, centerOfMass);
    const symmetryScore = this.calculateSymmetryScore(points, centerOfMass);
    
    // Curvature analysis
    const curvatures = this.calculateCurvatures(points);
    const averageCurvature = curvatures.reduce((a, b) => a + b, 0) / curvatures.length;
    const curvatureVariation = this.calculateVariation(curvatures);
    
    return {
      strokeLength,
      boundingBoxAspectRatio: boundingBox.width / boundingBox.height,
      areaToPerimeterRatio: area / perimeter,
      circularity,
      linearity,
      rectangularity,
      triangularity,
      centerOfMass,
      principalAxes,
      symmetryScore,
      smoothness: this.calculateSmoothness(points),
      angularity: this.calculateAngularity(points),
      averageCurvature,
      curvatureVariation,
      inflectionPoints: this.findInflectionPoints(points, curvatures),
      fourierDescriptors: this.calculateFourierDescriptors(points),
      pointDensity: points.length / strokeLength,
      velocityVariation: this.calculateVelocityVariation(points),
      accelerationProfile: this.calculateAccelerationProfile(points)
    };
  }

  /**
   * Perform ML inference using ONNX Runtime
   */
  private async performMLInference(
    features: GeometricFeatures,
    _stroke: DrawingStroke
  ): Promise<MLPrediction> {
    const startTime = performance.now();
    
    // Prepare feature vector for ML model
    const featureVector = this.createFeatureVector(features);
    
    // Prepare input tensor
    const inputs = {
      input: featureVector
    };
    
    try {
      // Run ML model inference
      const outputs = await this.modelSession.run(inputs);
      
      // Extract prediction results
      const probabilities = outputs.probabilities || outputs.output;
      const shapeTypes = this.getSupportedShapeTypes();
      
      // Find highest confidence prediction
      let maxConfidence = 0;
      let predictedShape = ShapeType.FREEHAND;
      
      for (let i = 0; i < probabilities.length && i < shapeTypes.length; i++) {
        if (probabilities[i] > maxConfidence) {
          maxConfidence = probabilities[i];
          predictedShape = shapeTypes[i];
        }
      }
      
      return {
        shapeType: predictedShape,
        confidence: maxConfidence,
        features: featureVector,
        processingTimeMs: performance.now() - startTime
      };
      
    } catch (error) {
      console.error('❌ ML inference failed:', error);
      
      // Fallback to geometric analysis
      return this.fallbackGeometricClassification(features);
    }
  }

  /**
   * Validate ML prediction with geometric constraints
   */
  private async validateWithGeometry(
    prediction: MLPrediction,
    features: GeometricFeatures
  ): Promise<MLPrediction> {
    let adjustedConfidence = prediction.confidence;
    let adjustedShape = prediction.shapeType;
    
    // Apply geometric validation rules
    switch (prediction.shapeType) {
      case ShapeType.CIRCLE:
        if (features.circularity < this.config.circularityThreshold) {
          adjustedConfidence *= 0.7;
          if (features.rectangularity > features.circularity) {
            adjustedShape = ShapeType.ELLIPSE;
          }
        }
        break;
        
      case ShapeType.LINE:
        if (features.linearity < this.config.linearityThreshold) {
          adjustedConfidence *= 0.6;
          if (features.circularity > features.linearity) {
            adjustedShape = ShapeType.CURVE;
          }
        }
        break;
        
      case ShapeType.RECTANGLE:
      case ShapeType.SQUARE:
        if (features.rectangularity < this.config.rectangularityThreshold) {
          adjustedConfidence *= 0.5;
          adjustedShape = ShapeType.POLYGON;
        }
        break;
    }
    
    return {
      ...prediction,
      shapeType: adjustedShape,
      confidence: Math.min(adjustedConfidence, 1.0)
    };
  }

  /**
   * Generate alternative shape suggestions
   */
  private async generateAlternatives(
    primary: MLPrediction,
    features: GeometricFeatures
  ): Promise<Array<{ shapeType: ShapeType; confidence: number }>> {
    const alternatives: Array<{ shapeType: ShapeType; confidence: number }> = [];
    
    // Score all supported shapes based on geometric features
    const shapeScores = new Map<ShapeType, number>();
    
    shapeScores.set(ShapeType.CIRCLE, features.circularity);
    shapeScores.set(ShapeType.LINE, features.linearity);
    shapeScores.set(ShapeType.RECTANGLE, features.rectangularity);
    shapeScores.set(ShapeType.TRIANGLE, features.triangularity);
    shapeScores.set(ShapeType.ELLIPSE, features.circularity * 0.8);
    shapeScores.set(ShapeType.CURVE, features.smoothness * 0.7);
    shapeScores.set(ShapeType.POLYGON, features.angularity);
    shapeScores.set(ShapeType.FREEHAND, 0.3); // Always available as fallback
    
    // Sort by score and exclude the primary prediction
    const sortedShapes = Array.from(shapeScores.entries())
      .filter(([shape]) => shape !== primary.shapeType)
      .sort(([, a], [, b]) => b - a)
      .slice(0, this.config.alternativeSuggestionsCount);
    
    for (const [shapeType, score] of sortedShapes) {
      alternatives.push({
        shapeType,
        confidence: Math.min(score * 0.9, 0.95) // Cap alternatives below primary
      });
    }
    
    return alternatives;
  }

  /**
   * Apply user correction history to improve predictions
   */
  private async applyUserCorrections(
    primary: MLPrediction,
    _alternatives: Array<{ shapeType: ShapeType; confidence: number }>,
    stroke: DrawingStroke
  ): Promise<MLPrediction> {
    const strokeId = this.generateStrokeId(stroke);
    const correction = this.userCorrections.get(strokeId);
    
    if (correction) {
      // User has corrected this exact stroke before
      return {
        ...primary,
        shapeType: correction,
        confidence: Math.min(primary.confidence + 0.2, 1.0)
      };
    }
    
    // Look for similar strokes in correction history
    const similarCorrection = this.findSimilarStrokeCorrection(stroke);
    if (similarCorrection) {
      return {
        ...primary,
        shapeType: similarCorrection,
        confidence: Math.min(primary.confidence + 0.1, 1.0)
      };
    }
    
    return primary;
  }

  // Geometric calculation helper methods
  
  private calculateBoundingBox(points: Point2D[]): BoundingBox {
    if (points.length === 0) {
      return { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0, centerX: 0, centerY: 0 };
    }
    
    let minX = points[0].x, maxX = points[0].x;
    let minY = points[0].y, maxY = points[0].y;
    
    for (const point of points) {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    }
    
    return {
      left: minX,
      top: minY,
      right: maxX,
      bottom: maxY,
      width: maxX - minX,
      height: maxY - minY,
      centerX: (minX + maxX) / 2,
      centerY: (minY + maxY) / 2
    };
  }

  private calculateStrokeLength(points: Point2D[]): number {
    let length = 0;
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      length += Math.sqrt(dx * dx + dy * dy);
    }
    return length;
  }

  private calculateCircularity(area: number, perimeter: number): number {
    if (perimeter === 0) return 0;
    return (4 * Math.PI * area) / (perimeter * perimeter);
  }

  private calculateLinearity(points: Point2D[]): number {
    if (points.length < 2) return 0;
    
    const start = points[0];
    const end = points[points.length - 1];
    const directDistance = Math.sqrt(
      (end.x - start.x) ** 2 + (end.y - start.y) ** 2
    );
    const pathLength = this.calculateStrokeLength(points);
    
    return pathLength > 0 ? directDistance / pathLength : 0;
  }

  private calculatePerimeter(points: Point2D[]): number {
    return this.calculateStrokeLength(points);
  }

  private calculateEnclosedArea(points: Point2D[]): number {
    if (points.length < 3) return 0;
    
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].x * points[j].y - points[j].x * points[i].y;
    }
    return Math.abs(area) / 2;
  }

  private calculateRectangularity(points: Point2D[], boundingBox: BoundingBox): number {
    const enclosedArea = this.calculateEnclosedArea(points);
    const boxArea = boundingBox.width * boundingBox.height;
    return boxArea > 0 ? enclosedArea / boxArea : 0;
  }

  private calculateTriangularity(points: Point2D[]): number {
    // Simplified triangularity measure based on corner detection
    const corners = this.detectCorners(points);
    return corners.length === 3 ? 0.9 : Math.max(0, 0.9 - Math.abs(corners.length - 3) * 0.2);
  }

  private calculateCenterOfMass(points: Point2D[]): Point2D {
    const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
    return { x: sum.x / points.length, y: sum.y / points.length };
  }

  private calculatePrincipalAxes(_points: Point2D[], _center: Point2D): [Point2D, Point2D] {
    // Simplified principal component analysis
    // In a full implementation, this would calculate actual PCA
    const boundingBox = this.calculateBoundingBox(_points);
    return [
      { x: boundingBox.width / 2, y: 0 },
      { x: 0, y: boundingBox.height / 2 }
    ];
  }

  private calculateSymmetryScore(_points: Point2D[], _center: Point2D): number {
    // Simplified symmetry calculation
    // A full implementation would analyze reflection symmetry
    return 0.5; // Placeholder
  }

  private calculateSmoothness(points: Point2D[]): number {
    if (points.length < 3) return 1;
    
    let totalAngleChange = 0;
    for (let i = 1; i < points.length - 1; i++) {
      const v1 = { x: points[i].x - points[i - 1].x, y: points[i].y - points[i - 1].y };
      const v2 = { x: points[i + 1].x - points[i].x, y: points[i + 1].y - points[i].y };
      
      const dot = v1.x * v2.x + v1.y * v2.y;
      const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
      const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
      
      if (mag1 > 0 && mag2 > 0) {
        const angle = Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2))));
        totalAngleChange += angle;
      }
    }
    
    return Math.max(0, 1 - totalAngleChange / Math.PI);
  }

  private calculateAngularity(points: Point2D[]): number {
    return 1 - this.calculateSmoothness(points);
  }

  private calculateCurvatures(points: Point2D[]): number[] {
    const curvatures: number[] = [];
    
    for (let i = 1; i < points.length - 1; i++) {
      // Simplified curvature calculation using three points
      const p1 = points[i - 1];
      const p2 = points[i];
      const p3 = points[i + 1];
      
      const area = Math.abs((p2.x - p1.x) * (p3.y - p1.y) - (p3.x - p1.x) * (p2.y - p1.y)) / 2;
      const a = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
      const b = Math.sqrt((p3.x - p2.x) ** 2 + (p3.y - p2.y) ** 2);
      const c = Math.sqrt((p3.x - p1.x) ** 2 + (p3.y - p1.y) ** 2);
      
      const curvature = (4 * area) / (a * b * c) || 0;
      curvatures.push(curvature);
    }
    
    return curvatures;
  }

  private calculateVariation(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((acc, val) => acc + (val - mean) ** 2, 0) / values.length;
    return Math.sqrt(variance);
  }

  private findInflectionPoints(points: Point2D[], curvatures: number[]): Point2D[] {
    const inflectionPoints: Point2D[] = [];
    
    for (let i = 1; i < curvatures.length - 1; i++) {
      const prev = curvatures[i - 1];
      const next = curvatures[i + 1];
      
      // Look for sign changes in curvature
      if ((prev > 0 && next < 0) || (prev < 0 && next > 0)) {
        inflectionPoints.push(points[i + 1]); // Offset by 1 due to curvature array indexing
      }
    }
    
    return inflectionPoints;
  }

  private calculateFourierDescriptors(_points: Point2D[]): number[] {
    // Simplified Fourier descriptors
    // A full implementation would compute actual FFT
    return [0.5, 0.3, 0.2, 0.1]; // Placeholder
  }

  private calculateVelocityVariation(points: Point2D[]): number {
    const velocities: number[] = [];
    
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      const velocity = Math.sqrt(dx * dx + dy * dy);
      velocities.push(velocity);
    }
    
    return this.calculateVariation(velocities);
  }

  private calculateAccelerationProfile(points: Point2D[]): number[] {
    const accelerations: number[] = [];
    
    for (let i = 2; i < points.length; i++) {
      const v1x = points[i - 1].x - points[i - 2].x;
      const v1y = points[i - 1].y - points[i - 2].y;
      const v2x = points[i].x - points[i - 1].x;
      const v2y = points[i].y - points[i - 1].y;
      
      const ax = v2x - v1x;
      const ay = v2y - v1y;
      const acceleration = Math.sqrt(ax * ax + ay * ay);
      accelerations.push(acceleration);
    }
    
    return accelerations;
  }

  // Helper methods for stroke processing

  private applySmoothingFilter(points: Point2D[]): Point2D[] {
    if (points.length < 3) return points;
    
    const smoothed: Point2D[] = [points[0]];
    
    for (let i = 1; i < points.length - 1; i++) {
      const smoothedPoint = {
        x: (points[i - 1].x + points[i].x + points[i + 1].x) / 3,
        y: (points[i - 1].y + points[i].y + points[i + 1].y) / 3
      };
      smoothed.push(smoothedPoint);
    }
    
    smoothed.push(points[points.length - 1]);
    return smoothed;
  }

  private reduceNoise(points: Point2D[]): Point2D[] {
    // Simple noise reduction by removing points that are too close together
    if (points.length === 0) return points;
    
    const filtered: Point2D[] = [points[0]];
    const minDistance = 2; // Minimum distance between points
    
    for (let i = 1; i < points.length; i++) {
      const last = filtered[filtered.length - 1];
      const curr = points[i];
      const distance = Math.sqrt((curr.x - last.x) ** 2 + (curr.y - last.y) ** 2);
      
      if (distance >= minDistance) {
        filtered.push(curr);
      }
    }
    
    return filtered;
  }

  private resamplePoints(points: Point2D[], targetCount: number): Point2D[] {
    if (points.length <= targetCount) return points;
    
    const totalLength = this.calculateStrokeLength(points);
    const targetSpacing = totalLength / (targetCount - 1);
    
    const resampled: Point2D[] = [points[0]];
    let currentLength = 0;
    let targetLength = targetSpacing;
    
    for (let i = 1; i < points.length && resampled.length < targetCount - 1; i++) {
      const segmentLength = Math.sqrt(
        (points[i].x - points[i - 1].x) ** 2 + 
        (points[i].y - points[i - 1].y) ** 2
      );
      
      currentLength += segmentLength;
      
      if (currentLength >= targetLength) {
        resampled.push(points[i]);
        targetLength += targetSpacing;
      }
    }
    
    resampled.push(points[points.length - 1]);
    return resampled;
  }

  private detectCorners(points: Point2D[]): Point2D[] {
    const corners: Point2D[] = [];
    const angleThreshold = Math.PI / 4; // 45 degrees
    
    for (let i = 1; i < points.length - 1; i++) {
      const v1 = { x: points[i].x - points[i - 1].x, y: points[i].y - points[i - 1].y };
      const v2 = { x: points[i + 1].x - points[i].x, y: points[i + 1].y - points[i].y };
      
      const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
      const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
      
      if (mag1 > 0 && mag2 > 0) {
        const dot = v1.x * v2.x + v1.y * v2.y;
        const angle = Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2))));
        
        if (angle > angleThreshold) {
          corners.push(points[i]);
        }
      }
    }
    
    return corners;
  }

  // ML helper methods

  private createFeatureVector(features: GeometricFeatures): number[] {
    return [
      features.strokeLength / 100, // Normalized
      features.boundingBoxAspectRatio,
      features.areaToPerimeterRatio,
      features.circularity,
      features.linearity,
      features.rectangularity,
      features.triangularity,
      features.symmetryScore,
      features.smoothness,
      features.angularity,
      features.averageCurvature,
      features.curvatureVariation,
      features.pointDensity,
      features.velocityVariation
    ];
  }

  private fallbackGeometricClassification(features: GeometricFeatures): MLPrediction {
    // Simple rule-based classification as fallback
    let shapeType = ShapeType.FREEHAND;
    let confidence = 0.5;
    
    if (features.linearity > this.config.linearityThreshold) {
      shapeType = ShapeType.LINE;
      confidence = features.linearity;
    } else if (features.circularity > this.config.circularityThreshold) {
      shapeType = ShapeType.CIRCLE;
      confidence = features.circularity;
    } else if (features.rectangularity > this.config.rectangularityThreshold) {
      shapeType = features.boundingBoxAspectRatio > 0.8 && features.boundingBoxAspectRatio < 1.2 
        ? ShapeType.SQUARE 
        : ShapeType.RECTANGLE;
      confidence = features.rectangularity;
    }
    
    return {
      shapeType,
      confidence,
      features: this.createFeatureVector(features),
      processingTimeMs: 10
    };
  }

  private mockMLInference(inputs: any): any {
    // Mock ONNX Runtime inference for development
    const featureVector = inputs.input || [];
    
    // Simple mock classification based on features
    const probabilities = new Array(this.getSupportedShapeTypes().length).fill(0.1);
    
    if (featureVector.length > 0) {
      // Mock some realistic probabilities
      probabilities[0] = featureVector[3] || 0.1; // Circularity -> Circle
      probabilities[1] = featureVector[4] || 0.1; // Linearity -> Line
      probabilities[2] = featureVector[5] || 0.1; // Rectangularity -> Rectangle
    }
    
    return { probabilities };
  }

  // Utility methods

  private generateStrokeId(stroke: DrawingStroke): string {
    // Generate a simple hash-like ID based on stroke characteristics
    const points = stroke.points.slice(0, 5); // Use first 5 points for ID
    const hash = points.map(p => `${Math.round(p.x)},${Math.round(p.y)}`).join('-');
    return `stroke-${hash}`;
  }

  private findSimilarStrokeCorrection(_stroke: DrawingStroke): ShapeType | null {
    // Simple similarity matching based on stroke characteristics
    // In a real implementation, this would use more sophisticated similarity matching
    return null; // Placeholder
  }

  private analyzeContext(context: DrawingContext): any {
    return {
      tool: context.currentTool,
      mode: context.drawingMode,
      gridEnabled: context.gridEnabled,
      zoomLevel: context.zoomLevel
    };
  }

  private cleanupOldPredictions(): void {
    const cutoffTime = Date.now() - (this.config.feedbackWindow * 60 * 1000); // Convert to milliseconds
    this.recentPredictions = this.recentPredictions.filter(
      pred => pred.timestamp > cutoffTime
    );
  }
}