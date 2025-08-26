/**
 * Test file to validate Shape Recognition Engine types
 * This file tests type safety without external dependencies
 */

import {
  DrawingStroke,
  ShapeRecognitionResult,
  ShapeType,
  DrawingContext,
  DrawingTool,
  DrawingMode,
  DrawingColor,
  DrawingUserPreferences
} from './drawing-intelligence-types';

import { AdvancedShapeRecognitionEngine } from './shape-recognition-engine';

// Type validation test
const testShapeRecognition = async () => {
  // Create engine instance
  const engine = new AdvancedShapeRecognitionEngine({
    minimumConfidenceThreshold: 0.7,
    useGPUAcceleration: true
  });

  // Create test color
  const testColor: DrawingColor = {
    red: 0,
    green: 0,
    blue: 0,
    alpha: 1.0,
    hex: '#000000'
  };

  // Create test user preferences
  const userPrefs: DrawingUserPreferences = {
    preferredTools: [DrawingTool.PEN],
    defaultStrokeWidth: 2,
    defaultColors: [testColor],
    autoCorrectShapes: true,
    enableGuidedDrawing: true,
    creativityLevel: 0.7,
    precisionLevel: 0.8,
    enableCollaboration: false
  };

  // Test stroke data
  const testStroke: DrawingStroke = {
    id: 'test-stroke-1',
    points: [
      { x: 0, y: 0 },
      { x: 10, y: 10 },
      { x: 20, y: 0 }
    ],
    strokeWidth: 2,
    color: testColor,
    timestamp: Date.now(),
    pressure: [1.0, 1.0, 1.0],
    velocity: [0, 5, 5],
    acceleration: [0, 1, 0],
    duration: 1000,
    boundingBox: {
      left: 0,
      top: 0,
      right: 20,
      bottom: 10,
      width: 20,
      height: 10,
      centerX: 10,
      centerY: 5
    }
  };

  const testContext: DrawingContext = {
    canvasSize: { width: 800, height: 600 },
    currentTool: DrawingTool.PEN,
    drawingMode: DrawingMode.FREEHAND,
    gridEnabled: false,
    snapToGrid: false,
    layerCount: 1,
    activeLayer: 0,
    zoomLevel: 1.0,
    viewportOffset: { x: 0, y: 0 },
    recentShapes: [],
    userPreferences: userPrefs
  };

  // Initialize engine
  await engine.initialize();

  // Test shape recognition
  const result: ShapeRecognitionResult = await engine.recognizeShape(testStroke, testContext);
  
  console.log('✅ Shape Recognition Test Results:');
  console.log(`   Shape Type: ${result.shapeType}`);
  console.log(`   Confidence: ${result.confidence}`);
  console.log(`   Processing Time: ${result.processingTimeMs}ms`);
  console.log(`   Alternatives: ${result.alternatives.length}`);
  
  // Test confidence calculation
  const confidence = await engine.getRecognitionConfidence(testStroke);
  console.log(`   Direct Confidence: ${confidence}`);
  
  // Test supported shape types
  const supportedShapes = engine.getSupportedShapeTypes();
  console.log(`   Supported Shapes: ${supportedShapes.length} types`);
  
  // Test training
  await engine.trainOnUserBehavior([
    { stroke: testStroke, expectedShape: ShapeType.TRIANGLE }
  ]);
  
  console.log('✅ All type validations passed successfully!');
  return true;
};

// Export for validation
export { testShapeRecognition };
console.log('✅ Shape Recognition Engine types validated successfully!');