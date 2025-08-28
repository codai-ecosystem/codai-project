/**
 * 🎼 Visual Intelligence Coordinator for Glass MCP Vision System
 * Master orchestrator for all vision components with intelligent coordination
 * 
 * Features:
 * - Unified vision pipeline orchestration
 * - Intelligent component coordination and optimization
 * - Context-aware analysis and decision making
 * - Performance monitoring and adaptive optimization
 * - Multi-modal data fusion and analysis
 * 
 * @version 9.0.0
 * @author Glass MCP Vision Team
 */

import { ScreenCaptureEngine, ScreenCapture, LiveCaptureSession } from './screen-capture-engine';
import { OCRAnalysisEngine, TextRecognitionResult, LayoutTextResult } from './ocr-analysis-engine';
import { ObjectDetectionEngine, DetectionResult, UIElement, DetectedObject } from './object-detection-engine';

export interface VisionAnalysisRequest {
  id: string;
  type: 'full-analysis' | 'ocr-only' | 'detection-only' | 'ui-elements' | 'text-layout';
  imageData?: ImageData;
  captureOptions?: CaptureRequestOptions;
  ocrOptions?: OCRRequestOptions;
  detectionOptions?: DetectionRequestOptions;
  priority: 'low' | 'normal' | 'high' | 'critical';
  timeout?: number;
}

export interface CaptureRequestOptions {
  source: 'display' | 'window' | 'region';
  displayId?: string;
  windowHandle?: number;
  region?: { x: number; y: number; width: number; height: number };
  quality?: number;
}

export interface OCRRequestOptions {
  language?: string | string[];
  detectLanguage?: boolean;
  preserveLayout?: boolean;
  extractTables?: boolean;
  extractLists?: boolean;
  recognizeHandwriting?: boolean;
}

export interface DetectionRequestOptions {
  model?: 'yolo-v8' | 'ui-detector' | 'general-detector';
  objectTypes?: string[];
  minConfidence?: number;
  includeUIElements?: boolean;
  includeGeneral?: boolean;
}

export interface VisionAnalysisResult {
  id: string;
  requestId: string;
  timestamp: number;
  type: string;
  screenCapture?: ScreenCapture;
  textResult?: TextRecognitionResult | LayoutTextResult;
  detectionResult?: DetectionResult;
  uiElements?: UIElement[];
  objects?: DetectedObject[];
  insights: VisionInsights;
  performance: VisionPerformance;
  confidence: number;
}

export interface VisionInsights {
  screenContext: ScreenContext;
  interactableElements: InteractableElement[];
  textContent: TextContentSummary;
  visualComplexity: VisualComplexityMetrics;
  recommendations: VisionRecommendation[];
}

export interface ScreenContext {
  applicationName?: string;
  windowTitle?: string;
  screenType: 'desktop' | 'application' | 'dialog' | 'browser' | 'game' | 'unknown';
  hasPopups: boolean;
  hasModals: boolean;
  isResponsive: boolean;
  layoutType: 'single-column' | 'multi-column' | 'grid' | 'complex';
}

export interface InteractableElement {
  id: string;
  type: string;
  label?: string;
  description?: string;
  boundingBox: { x: number; y: number; width: number; height: number };
  confidence: number;
  isClickable: boolean;
  isTypeable: boolean;
  isVisible: boolean;
  priority: number;
}

export interface TextContentSummary {
  totalCharacters: number;
  totalWords: number;
  languages: string[];
  hasStructuredContent: boolean;
  hasTables: boolean;
  hasLists: boolean;
  readingLevel: number;
  topics: string[];
}

export interface VisualComplexityMetrics {
  elementCount: number;
  colorComplexity: number;
  layoutComplexity: number;
  interactionComplexity: number;
  overallScore: number;
}

export interface VisionRecommendation {
  type: 'optimization' | 'interaction' | 'accessibility' | 'automation';
  priority: 'low' | 'medium' | 'high';
  description: string;
  action?: string;
  confidence: number;
}

export interface VisionPerformance {
  totalTime: number;
  captureTime: number;
  ocrTime: number;
  detectionTime: number;
  coordinationTime: number;
  memoryUsage: number;
  accuracy: number;
}

export interface LiveVisionSession {
  id: string;
  isActive: boolean;
  captureSession: LiveCaptureSession;
  analysisOptions: VisionAnalysisRequest;
  onAnalysis: (result: VisionAnalysisResult) => void;
  start(): Promise<void>;
  stop(): Promise<void>;
  updateOptions(options: Partial<VisionAnalysisRequest>): Promise<void>;
}

export interface VisionSystemMetrics {
  requestsProcessed: number;
  averageResponseTime: number;
  accuracyRate: number;
  errorRate: number;
  cacheHitRate: number;
  memoryUsage: number;
  uptime: number;
}

/**
 * Master Visual Intelligence Coordinator
 * Orchestrates all vision components for comprehensive screen understanding
 */
export class VisualIntelligenceCoordinator {
  private static instance: VisualIntelligenceCoordinator;
  private isInitialized: boolean = false;
  private screenEngine: ScreenCaptureEngine;
  private ocrEngine: OCRAnalysisEngine;
  private detectionEngine: ObjectDetectionEngine;
  
  private requestQueue: Map<string, VisionAnalysisRequest> = new Map();
  private resultCache: Map<string, VisionAnalysisResult> = new Map();
  private activeSessions: Map<string, LiveVisionSession> = new Map();
  private systemMetrics: VisionSystemMetrics;

  private constructor() {
    this.screenEngine = ScreenCaptureEngine.getInstance();
    this.ocrEngine = OCRAnalysisEngine.getInstance();
    this.detectionEngine = ObjectDetectionEngine.getInstance();
    
    this.systemMetrics = {
      requestsProcessed: 0,
      averageResponseTime: 0,
      accuracyRate: 0,
      errorRate: 0,
      cacheHitRate: 0,
      memoryUsage: 0,
      uptime: Date.now()
    };
  }

  /**
   * Get singleton instance of Visual Intelligence Coordinator
   */
  public static getInstance(): VisualIntelligenceCoordinator {
    if (!VisualIntelligenceCoordinator.instance) {
      VisualIntelligenceCoordinator.instance = new VisualIntelligenceCoordinator();
    }
    return VisualIntelligenceCoordinator.instance;
  }

  /**
   * Initialize the visual intelligence coordination system
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('🎼 Initializing Visual Intelligence Coordinator...');
      
      // Initialize all vision components
      await this.screenEngine.initialize();
      await this.ocrEngine.initialize();
      await this.detectionEngine.initialize();
      
      // Setup coordination pipeline
      await this.setupCoordinationPipeline();
      
      // Start system monitoring
      this.startSystemMonitoring();
      
      this.isInitialized = true;
      console.log('✅ Visual Intelligence Coordinator initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Visual Intelligence Coordinator:', error);
      throw new Error(`Vision coordinator initialization failed: ${error}`);
    }
  }

  /**
   * Perform comprehensive vision analysis
   */
  public async analyzeVision(request: VisionAnalysisRequest): Promise<VisionAnalysisResult> {
    await this.ensureInitialized();
    const startTime = performance.now();

    try {
      // Generate result ID and add to queue
      const resultId = this.generateResultId();
      this.requestQueue.set(request.id, request);

      console.log(`🔍 Starting vision analysis: ${request.type} (Priority: ${request.priority})`);
      
      // Check cache first
      const cacheKey = this.generateCacheKey(request);
      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        console.log('⚡ Returning cached vision analysis result');
        return cached;
      }

      // Capture screen if needed
      const captureStart = performance.now();
      const screenCapture = await this.handleScreenCapture(request);
      const captureTime = performance.now() - captureStart;

      // Coordinate parallel analysis based on request type
      const analysisStart = performance.now();
      const { textResult, detectionResult } = await this.coordinateParallelAnalysis(
        screenCapture, 
        request
      );
      const analysisTime = performance.now() - analysisStart;

      // Generate insights and recommendations
      const insightsStart = performance.now();
      const insights = await this.generateVisionInsights(screenCapture, textResult, detectionResult);
      const insightsTime = performance.now() - insightsStart;

      const totalTime = performance.now() - startTime;

      // Create comprehensive result
      const result: VisionAnalysisResult = {
        id: resultId,
        requestId: request.id,
        timestamp: Date.now(),
        type: request.type,
        screenCapture,
        textResult,
        detectionResult,
        uiElements: detectionResult?.uiElements || [],
        objects: detectionResult?.objects || [],
        insights,
        performance: {
          totalTime,
          captureTime,
          ocrTime: textResult ? analysisTime * 0.6 : 0, // Estimate
          detectionTime: detectionResult ? analysisTime * 0.4 : 0, // Estimate
          coordinationTime: insightsTime,
          memoryUsage: this.getMemoryUsage(),
          accuracy: this.calculateOverallAccuracy(textResult, detectionResult)
        },
        confidence: this.calculateOverallConfidence(insights, textResult, detectionResult)
      };

      // Cache the result
      this.setCachedResult(cacheKey, result);
      
      // Update system metrics
      this.updateSystemMetrics(result);
      
      // Remove from queue
      this.requestQueue.delete(request.id);

      console.log(`✅ Vision analysis completed in ${totalTime.toFixed(2)}ms (Confidence: ${result.confidence.toFixed(2)}%)`);
      return result;

    } catch (error) {
      this.systemMetrics.errorRate++;
      this.requestQueue.delete(request.id);
      console.error('❌ Vision analysis failed:', error);
      throw new Error(`Vision analysis failed: ${error}`);
    }
  }

  /**
   * Analyze current screen with default settings
   */
  public async analyzeCurrentScreen(): Promise<VisionAnalysisResult> {
    const request: VisionAnalysisRequest = {
      id: this.generateRequestId(),
      type: 'full-analysis',
      captureOptions: { source: 'display' },
      priority: 'normal'
    };

    return this.analyzeVision(request);
  }

  /**
   * Extract text from screen with OCR
   */
  public async extractScreenText(options?: OCRRequestOptions): Promise<TextRecognitionResult> {
    const request: VisionAnalysisRequest = {
      id: this.generateRequestId(),
      type: 'ocr-only',
      captureOptions: { source: 'display' },
      ocrOptions: options,
      priority: 'normal'
    };

    const result = await this.analyzeVision(request);
    return result.textResult as TextRecognitionResult;
  }

  /**
   * Detect objects and UI elements on screen
   */
  public async detectScreenObjects(options?: DetectionRequestOptions): Promise<DetectionResult> {
    const request: VisionAnalysisRequest = {
      id: this.generateRequestId(),
      type: 'detection-only',
      captureOptions: { source: 'display' },
      detectionOptions: options,
      priority: 'normal'
    };

    const result = await this.analyzeVision(request);
    return result.detectionResult!;
  }

  /**
   * Find UI elements for automation
   */
  public async findUIElements(elementTypes?: string[]): Promise<UIElement[]> {
    const options: DetectionRequestOptions = {
      includeUIElements: true,
      includeGeneral: false,
      objectTypes: elementTypes
    };

    const detectionResult = await this.detectScreenObjects(options);
    return detectionResult.uiElements;
  }

  /**
   * Start a live vision analysis session
   */
  public async startLiveVisionSession(
    analysisOptions: VisionAnalysisRequest,
    onAnalysis: (result: VisionAnalysisResult) => void,
    frameRate: number = 10
  ): Promise<LiveVisionSession> {
    await this.ensureInitialized();

    try {
      const sessionId = this.generateSessionId();
      console.log(`🎬 Starting live vision session: ${sessionId}`);

      // Create capture session
      const region = analysisOptions.captureOptions?.region || 
        { x: 0, y: 0, width: 1920, height: 1080 };
      
      const captureSession = await this.screenEngine.startLiveCapture(
        region,
        frameRate,
        async (frame) => {
          try {
            const analysisRequest: VisionAnalysisRequest = {
              ...analysisOptions,
              id: this.generateRequestId(),
              imageData: frame.imageData
            };
            
            const result = await this.analyzeVision(analysisRequest);
            onAnalysis(result);
          } catch (error) {
            console.error('Live vision analysis error:', error);
          }
        }
      );

      const session: LiveVisionSession = {
        id: sessionId,
        isActive: false,
        captureSession,
        analysisOptions,
        onAnalysis,

        async start() {
          await captureSession.start();
          session.isActive = true;
          console.log(`▶️ Live vision session started: ${sessionId}`);
        },

        async stop() {
          await captureSession.stop();
          session.isActive = false;
          VisualIntelligenceCoordinator.instance.activeSessions.delete(sessionId);
          console.log(`⏹️ Live vision session stopped: ${sessionId}`);
        },

        async updateOptions(newOptions: Partial<VisionAnalysisRequest>) {
          Object.assign(analysisOptions, newOptions);
          console.log(`🔧 Live vision session options updated: ${sessionId}`);
        }
      };

      this.activeSessions.set(sessionId, session);
      return session;

    } catch (error) {
      console.error('❌ Failed to start live vision session:', error);
      throw new Error(`Live vision session failed: ${error}`);
    }
  }

  /**
   * Get current system performance metrics
   */
  public getSystemMetrics(): VisionSystemMetrics {
    return {
      ...this.systemMetrics,
      uptime: Date.now() - this.systemMetrics.uptime
    };
  }

  /**
   * Get processing queue status
   */
  public getQueueStatus(): { pending: number; active: number } {
    return {
      pending: this.requestQueue.size,
      active: this.activeSessions.size
    };
  }

  /**
   * Clear all caches
   */
  public clearCaches(): void {
    this.resultCache.clear();
    this.screenEngine.clearCache?.();
    this.ocrEngine.clearCache();
    this.detectionEngine.clearCache();
    console.log('🧹 All vision caches cleared');
  }

  /**
   * Cleanup and dispose of all resources
   */
  public async dispose(): Promise<void> {
    // Stop all active sessions
    for (const session of this.activeSessions.values()) {
      await session.stop();
    }
    this.activeSessions.clear();

    // Clear all caches and queues
    this.requestQueue.clear();
    this.resultCache.clear();

    // Dispose of all engines
    await this.screenEngine.dispose();
    await this.ocrEngine.dispose();
    await this.detectionEngine.dispose();

    this.isInitialized = false;
    console.log('🧹 Visual Intelligence Coordinator disposed');
  }

  // Private implementation methods

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  private async setupCoordinationPipeline(): Promise<void> {
    console.log('🔧 Setting up vision coordination pipeline...');
    // Setup component coordination and optimization
  }

  private startSystemMonitoring(): void {
    console.log('📊 Starting vision system monitoring...');
    
    // Monitor system performance every 30 seconds
    setInterval(() => {
      this.updateSystemMetrics();
    }, 30000);
  }

  private async handleScreenCapture(request: VisionAnalysisRequest): Promise<ScreenCapture> {
    if (request.imageData) {
      // Convert ImageData to ScreenCapture format
      return {
        id: this.generateCaptureId(),
        timestamp: Date.now(),
        imageData: request.imageData,
        bounds: { x: 0, y: 0, width: request.imageData.width, height: request.imageData.height },
        metadata: {
          captureMethod: 'provided',
          colorSpace: 'rgba',
          bitDepth: 32,
          quality: 100
        }
      };
    }

    const options = request.captureOptions!;
    
    switch (options.source) {
      case 'display':
        return this.screenEngine.captureDisplay();
      case 'window':
        if (!options.windowHandle) {
          throw new Error('Window handle required for window capture');
        }
        const windowInfo = { 
          handle: options.windowHandle, 
          title: '', 
          processName: '', 
          bounds: { x: 0, y: 0, width: 800, height: 600 },
          isVisible: true,
          isMinimized: false
        };
        return this.screenEngine.captureWindow(windowInfo);
      case 'region':
        if (!options.region) {
          throw new Error('Region required for region capture');
        }
        return this.screenEngine.captureRegion(options.region);
      default:
        throw new Error(`Unsupported capture source: ${options.source}`);
    }
  }

  private async coordinateParallelAnalysis(
    screenCapture: ScreenCapture,
    request: VisionAnalysisRequest
  ): Promise<{ textResult?: TextRecognitionResult; detectionResult?: DetectionResult }> {
    const promises: Promise<any>[] = [];
    
    // OCR Analysis
    if (['full-analysis', 'ocr-only', 'text-layout'].includes(request.type)) {
      promises.push(
        this.ocrEngine.recognizeText(screenCapture.imageData, request.ocrOptions)
      );
    } else {
      promises.push(Promise.resolve(undefined));
    }
    
    // Object Detection
    if (['full-analysis', 'detection-only', 'ui-elements'].includes(request.type)) {
      promises.push(
        this.detectionEngine.detectObjects(screenCapture.imageData, request.detectionOptions)
      );
    } else {
      promises.push(Promise.resolve(undefined));
    }

    const [textResult, detectionResult] = await Promise.all(promises);
    
    return { textResult, detectionResult };
  }

  private async generateVisionInsights(
    screenCapture: ScreenCapture,
    textResult?: TextRecognitionResult,
    detectionResult?: DetectionResult
  ): Promise<VisionInsights> {
    console.log('🧠 Generating vision insights...');
    
    // Analyze screen context
    const screenContext = await this.analyzeScreenContext(screenCapture, detectionResult);
    
    // Extract interactable elements
    const interactableElements = this.extractInteractableElements(detectionResult);
    
    // Summarize text content
    const textContent = this.summarizeTextContent(textResult);
    
    // Calculate visual complexity
    const visualComplexity = this.calculateVisualComplexity(detectionResult, textResult);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      screenContext, 
      interactableElements, 
      textContent, 
      visualComplexity
    );

    return {
      screenContext,
      interactableElements,
      textContent,
      visualComplexity,
      recommendations
    };
  }

  private async analyzeScreenContext(
    screenCapture: ScreenCapture,
    detectionResult?: DetectionResult
  ): Promise<ScreenContext> {
    // Analyze screen context based on detection results
    const hasPopups = detectionResult?.uiElements.some(el => 
      ['popup', 'dialog', 'notification'].includes(el.uiType)
    ) || false;

    const hasModals = detectionResult?.uiElements.some(el => 
      el.uiType === 'dialog'
    ) || false;

    return {
      screenType: 'application', // Would be determined by analysis
      hasPopups,
      hasModals,
      isResponsive: false, // Would be determined by analysis
      layoutType: 'single-column' // Would be determined by analysis
    };
  }

  private extractInteractableElements(detectionResult?: DetectionResult): InteractableElement[] {
    if (!detectionResult) return [];

    return detectionResult.uiElements
      .filter(el => el.attributes.isInteractive)
      .map((el, index) => ({
        id: el.id,
        type: el.uiType,
        label: el.name,
        boundingBox: el.boundingBox,
        confidence: el.confidence,
        isClickable: ['button', 'hyperlink', 'menuitem'].includes(el.uiType),
        isTypeable: ['textbox', 'combobox'].includes(el.uiType),
        isVisible: el.attributes.isVisible,
        priority: this.calculateElementPriority(el)
      }));
  }

  private summarizeTextContent(textResult?: TextRecognitionResult): TextContentSummary {
    if (!textResult) {
      return {
        totalCharacters: 0,
        totalWords: 0,
        languages: [],
        hasStructuredContent: false,
        hasTables: false,
        hasLists: false,
        readingLevel: 0,
        topics: []
      };
    }

    const words = textResult.text.split(/\s+/).filter(word => word.length > 0);
    
    return {
      totalCharacters: textResult.text.length,
      totalWords: words.length,
      languages: [textResult.language],
      hasStructuredContent: textResult.layout.paragraphs.length > 1,
      hasTables: false, // Would be determined by layout analysis
      hasLists: false, // Would be determined by layout analysis
      readingLevel: this.calculateReadingLevel(textResult.text),
      topics: this.extractTopics(textResult.text)
    };
  }

  private calculateVisualComplexity(
    detectionResult?: DetectionResult,
    textResult?: TextRecognitionResult
  ): VisualComplexityMetrics {
    const elementCount = (detectionResult?.objects.length || 0) + (detectionResult?.uiElements.length || 0);
    const textComplexity = textResult ? Math.min(textResult.text.length / 1000, 1) : 0;
    
    return {
      elementCount,
      colorComplexity: 0.5, // Would be calculated from image analysis
      layoutComplexity: Math.min(elementCount / 20, 1),
      interactionComplexity: Math.min((detectionResult?.uiElements.length || 0) / 10, 1),
      overallScore: (textComplexity + Math.min(elementCount / 20, 1)) / 2
    };
  }

  private generateRecommendations(
    screenContext: ScreenContext,
    interactableElements: InteractableElement[],
    textContent: TextContentSummary,
    visualComplexity: VisualComplexityMetrics
  ): VisionRecommendation[] {
    const recommendations: VisionRecommendation[] = [];

    // Performance recommendations
    if (visualComplexity.overallScore > 0.8) {
      recommendations.push({
        type: 'optimization',
        priority: 'high',
        description: 'High visual complexity detected. Consider simplifying the interface.',
        confidence: 0.8
      });
    }

    // Interaction recommendations
    if (interactableElements.length > 20) {
      recommendations.push({
        type: 'interaction',
        priority: 'medium',
        description: 'Many interactive elements detected. Prioritize primary actions.',
        confidence: 0.7
      });
    }

    // Accessibility recommendations
    if (textContent.totalCharacters > 0 && interactableElements.length > 0) {
      recommendations.push({
        type: 'accessibility',
        priority: 'medium',
        description: 'Ensure all interactive elements have proper text labels.',
        confidence: 0.9
      });
    }

    return recommendations;
  }

  private calculateElementPriority(element: UIElement): number {
    // Calculate element priority based on type and attributes
    const typePriority = {
      'button': 0.9,
      'textbox': 0.8,
      'hyperlink': 0.7,
      'menuitem': 0.6,
      'checkbox': 0.5,
      'radiobutton': 0.5
    };
    
    return (typePriority[element.uiType as keyof typeof typePriority] || 0.3) * element.confidence;
  }

  private calculateReadingLevel(text: string): number {
    // Simple reading level calculation (placeholder)
    const words = text.split(/\s+/);
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    return Math.min(avgWordLength / 5, 1);
  }

  private extractTopics(text: string): string[] {
    // Simple topic extraction (placeholder)
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of'];
    const words = text.toLowerCase().split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.includes(word));
    
    const frequency = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }

  private calculateOverallAccuracy(
    textResult?: TextRecognitionResult,
    detectionResult?: DetectionResult
  ): number {
    const textAccuracy = textResult ? textResult.confidence : 1;
    const detectionAccuracy = detectionResult ? detectionResult.performance.averageConfidence : 1;
    
    return (textAccuracy + detectionAccuracy) / 2;
  }

  private calculateOverallConfidence(
    insights: VisionInsights,
    textResult?: TextRecognitionResult,
    detectionResult?: DetectionResult
  ): number {
    let confidence = 0.8; // Base confidence
    
    if (textResult) {
      confidence = (confidence + textResult.confidence) / 2;
    }
    
    if (detectionResult) {
      confidence = (confidence + detectionResult.performance.averageConfidence) / 2;
    }
    
    // Adjust based on insights quality
    if (insights.interactableElements.length > 0) {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 1) * 100;
  }

  // Utility methods for ID generation and caching

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateResultId(): string {
    return `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCaptureId(): string {
    return `capture_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCacheKey(request: VisionAnalysisRequest): string {
    // Generate cache key based on request parameters
    const keyData = {
      type: request.type,
      captureOptions: request.captureOptions,
      ocrOptions: request.ocrOptions,
      detectionOptions: request.detectionOptions
    };
    return `vision_${JSON.stringify(keyData)}`;
  }

  private getCachedResult(key: string): VisionAnalysisResult | undefined {
    const cached = this.resultCache.get(key);
    if (cached && Date.now() - cached.timestamp < 30000) { // 30 second cache
      this.systemMetrics.cacheHitRate++;
      return cached;
    }
    return undefined;
  }

  private setCachedResult(key: string, result: VisionAnalysisResult): void {
    // Keep cache size reasonable
    if (this.resultCache.size > 100) {
      const oldestKey = this.resultCache.keys().next().value;
      if (oldestKey) {
        this.resultCache.delete(oldestKey);
      }
    }
    this.resultCache.set(key, result);
  }

  private getMemoryUsage(): number {
    // Get current memory usage (placeholder)
    return 0;
  }

  private updateSystemMetrics(result?: VisionAnalysisResult): void {
    this.systemMetrics.requestsProcessed++;
    
    if (result) {
      // Update running averages
      this.systemMetrics.averageResponseTime = 
        (this.systemMetrics.averageResponseTime + result.performance.totalTime) / 2;
      this.systemMetrics.accuracyRate = 
        (this.systemMetrics.accuracyRate + result.performance.accuracy) / 2;
    }
    
    this.systemMetrics.memoryUsage = this.getMemoryUsage();
  }
}

// Export singleton instance
export const visualIntelligenceCoordinator = VisualIntelligenceCoordinator.getInstance();