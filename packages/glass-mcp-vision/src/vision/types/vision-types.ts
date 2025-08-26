/**
 * 🔮 Vision System Type Definitions for Glass MCP Vision
 * Comprehensive TypeScript interfaces for all vision components
 * 
 * @version 9.0.0
 * @author Glass MCP Vision Team
 */

// Re-export core vision interfaces
export * from './screen-capture-engine';
export * from './ocr-analysis-engine';
export * from './object-detection-engine';
export * from './visual-intelligence-coordinator';

// Additional shared types and utilities

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Color {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export interface VisionError extends Error {
  code: VisionErrorCode;
  component: 'screen-capture' | 'ocr' | 'object-detection' | 'coordinator';
  details?: any;
}

export enum VisionErrorCode {
  INITIALIZATION_FAILED = 'INITIALIZATION_FAILED',
  CAPTURE_FAILED = 'CAPTURE_FAILED',
  OCR_FAILED = 'OCR_FAILED',
  DETECTION_FAILED = 'DETECTION_FAILED',
  COORDINATION_FAILED = 'COORDINATION_FAILED',
  INVALID_INPUT = 'INVALID_INPUT',
  TIMEOUT = 'TIMEOUT',
  INSUFFICIENT_RESOURCES = 'INSUFFICIENT_RESOURCES',
  MODEL_NOT_LOADED = 'MODEL_NOT_LOADED',
  UNSUPPORTED_OPERATION = 'UNSUPPORTED_OPERATION'
}

export interface VisionConfiguration {
  screenCapture: ScreenCaptureConfig;
  ocr: OCRConfig;
  objectDetection: ObjectDetectionConfig;
  coordination: CoordinationConfig;
}

export interface ScreenCaptureConfig {
  defaultQuality: number;
  enableCaching: boolean;
  maxCacheSize: number;
  performanceMode: 'balanced' | 'performance' | 'quality';
}

export interface OCRConfig {
  defaultLanguage: string;
  enableLanguageDetection: boolean;
  enableLayoutPreservation: boolean;
  confidenceThreshold: number;
  enableCaching: boolean;
  maxCacheSize: number;
}

export interface ObjectDetectionConfig {
  defaultModel: string;
  confidenceThreshold: number;
  nmsThreshold: number;
  maxDetections: number;
  enableCaching: boolean;
  maxCacheSize: number;
}

export interface CoordinationConfig {
  enableParallelProcessing: boolean;
  maxConcurrentRequests: number;
  defaultTimeout: number;
  enableInsights: boolean;
  enableRecommendations: boolean;
}

export interface VisionCapabilities {
  screenCapture: ScreenCaptureCapabilities;
  ocr: OCRCapabilities;
  objectDetection: ObjectDetectionCapabilities;
  coordination: CoordinationCapabilities;
}

export interface ScreenCaptureCapabilities {
  supportsMultiDisplay: boolean;
  supportsWindowCapture: boolean;
  supportsRegionCapture: boolean;
  supportsLiveCapture: boolean;
  maxFrameRate: number;
  supportedFormats: string[];
}

export interface OCRCapabilities {
  supportedLanguages: string[];
  supportsHandwriting: boolean;
  supportsLayoutPreservation: boolean;
  supportsTableExtraction: boolean;
  supportsListExtraction: boolean;
  maxImageSize: Size;
  averageAccuracy: number;
}

export interface ObjectDetectionCapabilities {
  availableModels: string[];
  supportedObjectTypes: string[];
  supportedUIElements: string[];
  maxImageSize: Size;
  averageAccuracy: number;
  averageInferenceTime: number;
}

export interface CoordinationCapabilities {
  supportsLiveAnalysis: boolean;
  supportsParallelProcessing: boolean;
  supportsInsightGeneration: boolean;
  supportsRecommendations: boolean;
  maxConcurrentSessions: number;
}

// Utility functions for vision system

export class VisionUtils {
  /**
   * Check if a point is inside a rectangle
   */
  static isPointInRectangle(point: Point, rectangle: Rectangle): boolean {
    return point.x >= rectangle.x &&
           point.x <= rectangle.x + rectangle.width &&
           point.y >= rectangle.y &&
           point.y <= rectangle.y + rectangle.height;
  }

  /**
   * Calculate the intersection of two rectangles
   */
  static intersectRectangles(rect1: Rectangle, rect2: Rectangle): Rectangle | null {
    const left = Math.max(rect1.x, rect2.x);
    const top = Math.max(rect1.y, rect2.y);
    const right = Math.min(rect1.x + rect1.width, rect2.x + rect2.width);
    const bottom = Math.min(rect1.y + rect1.height, rect2.y + rect2.height);

    if (left < right && top < bottom) {
      return {
        x: left,
        y: top,
        width: right - left,
        height: bottom - top
      };
    }
    return null;
  }

  /**
   * Calculate the area of a rectangle
   */
  static rectangleArea(rectangle: Rectangle): number {
    return rectangle.width * rectangle.height;
  }

  /**
   * Calculate the distance between two points
   */
  static pointDistance(point1: Point, point2: Point): number {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculate the center point of a rectangle
   */
  static rectangleCenter(rectangle: Rectangle): Point {
    return {
      x: rectangle.x + rectangle.width / 2,
      y: rectangle.y + rectangle.height / 2
    };
  }

  /**
   * Check if two rectangles overlap
   */
  static rectanglesOverlap(rect1: Rectangle, rect2: Rectangle): boolean {
    return this.intersectRectangles(rect1, rect2) !== null;
  }

  /**
   * Scale a rectangle by a factor
   */
  static scaleRectangle(rectangle: Rectangle, scale: number): Rectangle {
    const center = this.rectangleCenter(rectangle);
    const newWidth = rectangle.width * scale;
    const newHeight = rectangle.height * scale;
    
    return {
      x: center.x - newWidth / 2,
      y: center.y - newHeight / 2,
      width: newWidth,
      height: newHeight
    };
  }

  /**
   * Convert RGB to hex color
   */
  static rgbToHex(color: Color): string {
    const r = Math.round(color.r).toString(16).padStart(2, '0');
    const g = Math.round(color.g).toString(16).padStart(2, '0');
    const b = Math.round(color.b).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }

  /**
   * Convert hex to RGB color
   */
  static hexToRgb(hex: string): Color | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * Create a vision error with proper typing
   */
  static createVisionError(
    message: string,
    code: VisionErrorCode,
    component: 'screen-capture' | 'ocr' | 'object-detection' | 'coordinator',
    details?: any
  ): VisionError {
    const error = new Error(message) as VisionError;
    error.code = code;
    error.component = component;
    error.details = details;
    return error;
  }

  /**
   * Validate vision configuration
   */
  static validateVisionConfiguration(config: Partial<VisionConfiguration>): string[] {
    const errors: string[] = [];

    if (config.screenCapture?.defaultQuality !== undefined) {
      if (config.screenCapture.defaultQuality < 0 || config.screenCapture.defaultQuality > 100) {
        errors.push('Screen capture quality must be between 0 and 100');
      }
    }

    if (config.ocr?.confidenceThreshold !== undefined) {
      if (config.ocr.confidenceThreshold < 0 || config.ocr.confidenceThreshold > 1) {
        errors.push('OCR confidence threshold must be between 0 and 1');
      }
    }

    if (config.objectDetection?.confidenceThreshold !== undefined) {
      if (config.objectDetection.confidenceThreshold < 0 || config.objectDetection.confidenceThreshold > 1) {
        errors.push('Object detection confidence threshold must be between 0 and 1');
      }
    }

    if (config.coordination?.maxConcurrentRequests !== undefined) {
      if (config.coordination.maxConcurrentRequests < 1) {
        errors.push('Max concurrent requests must be at least 1');
      }
    }

    return errors;
  }

  /**
   * Get default vision configuration
   */
  static getDefaultVisionConfiguration(): VisionConfiguration {
    return {
      screenCapture: {
        defaultQuality: 90,
        enableCaching: true,
        maxCacheSize: 50,
        performanceMode: 'balanced'
      },
      ocr: {
        defaultLanguage: 'en',
        enableLanguageDetection: true,
        enableLayoutPreservation: true,
        confidenceThreshold: 0.7,
        enableCaching: true,
        maxCacheSize: 100
      },
      objectDetection: {
        defaultModel: 'yolo-v8',
        confidenceThreshold: 0.5,
        nmsThreshold: 0.4,
        maxDetections: 100,
        enableCaching: true,
        maxCacheSize: 50
      },
      coordination: {
        enableParallelProcessing: true,
        maxConcurrentRequests: 10,
        defaultTimeout: 30000,
        enableInsights: true,
        enableRecommendations: true
      }
    };
  }

  /**
   * Get vision system capabilities
   */
  static getVisionCapabilities(): VisionCapabilities {
    return {
      screenCapture: {
        supportsMultiDisplay: true,
        supportsWindowCapture: true,
        supportsRegionCapture: true,
        supportsLiveCapture: true,
        maxFrameRate: 60,
        supportedFormats: ['png', 'jpg', 'bmp', 'gif']
      },
      ocr: {
        supportedLanguages: [
          'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko',
          'ar', 'hi', 'th', 'vi', 'tr', 'pl', 'nl', 'sv', 'da', 'no'
        ],
        supportsHandwriting: true,
        supportsLayoutPreservation: true,
        supportsTableExtraction: true,
        supportsListExtraction: true,
        maxImageSize: { width: 8192, height: 8192 },
        averageAccuracy: 0.938
      },
      objectDetection: {
        availableModels: ['yolo-v8', 'ui-detector', 'general-detector'],
        supportedObjectTypes: [
          'person', 'vehicle', 'animal', 'object', 'building', 'nature'
        ],
        supportedUIElements: [
          'button', 'textbox', 'label', 'checkbox', 'radiobutton', 'combobox',
          'listbox', 'menuitem', 'toolbar', 'window', 'dialog', 'popup'
        ],
        maxImageSize: { width: 4096, height: 4096 },
        averageAccuracy: 0.89,
        averageInferenceTime: 150
      },
      coordination: {
        supportsLiveAnalysis: true,
        supportsParallelProcessing: true,
        supportsInsightGeneration: true,
        supportsRecommendations: true,
        maxConcurrentSessions: 5
      }
    };
  }

  /**
   * Format vision performance metrics for display
   */
  static formatPerformanceMetrics(metrics: any): string {
    const lines: string[] = [];
    
    if (metrics.totalTime !== undefined) {
      lines.push(`Total Time: ${metrics.totalTime.toFixed(2)}ms`);
    }
    
    if (metrics.captureTime !== undefined) {
      lines.push(`Capture Time: ${metrics.captureTime.toFixed(2)}ms`);
    }
    
    if (metrics.ocrTime !== undefined) {
      lines.push(`OCR Time: ${metrics.ocrTime.toFixed(2)}ms`);
    }
    
    if (metrics.detectionTime !== undefined) {
      lines.push(`Detection Time: ${metrics.detectionTime.toFixed(2)}ms`);
    }
    
    if (metrics.accuracy !== undefined) {
      lines.push(`Accuracy: ${(metrics.accuracy * 100).toFixed(1)}%`);
    }
    
    if (metrics.confidence !== undefined) {
      lines.push(`Confidence: ${metrics.confidence.toFixed(1)}%`);
    }
    
    return lines.join(', ');
  }
}

// Export default configuration
export const DEFAULT_VISION_CONFIG = VisionUtils.getDefaultVisionConfiguration();
export const VISION_CAPABILITIES = VisionUtils.getVisionCapabilities();