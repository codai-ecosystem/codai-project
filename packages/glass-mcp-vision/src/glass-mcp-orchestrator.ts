/**
 * Glass MCP v9.0.0 Main Orchestrator
 * 
 * Central coordinator that manages all subsystems and provides a unified API
 * for comprehensive visual automation capabilities.
 * 
 * Integrates:
 * - Phase 1: Screen Vision Engine (capture, OCR, object detection)
 * - Phase 2: UI Automation Integration (element detection, action planning)
 * - Phase 3: Intelligent Action System (context analysis, decision making)
 * - Phase 4: Advanced Drawing Engine (visual feedback, shape recognition)
 */

import { EventEmitter } from 'events';

// Phase 1 - Vision Components
import { ScreenCaptureEngine } from './vision/screen-capture-engine.js';
import { OCRAnalysisEngine } from './vision/ocr-analysis-engine.js';
import { ObjectDetectionEngine } from './vision/object-detection-engine.js';
import { VisualIntelligenceCoordinator } from './vision/visual-intelligence-coordinator.js';

// Phase 2 - Automation Components
import { UIAutomationBridge } from './automation/ui-automation-bridge.js';
import { ElementDetector } from './automation/element-detector.js';
import { ActionPlanner } from './automation/action-planner.js';
import { PopupHandler } from './automation/popup-handler.js';

// Phase 3 - Intelligence Components
import { ContextAnalyzer } from './intelligence/context-analyzer.js';
import { DecisionEngine } from './intelligence/decision-engine.js';
import { ErrorRecoverySystem } from './intelligence/error-recovery.js';
import { LearningSystem } from './intelligence/learning-system.js';

// Phase 4 - Drawing Components
import { VisualFeedbackDrawer } from './drawing/visual-feedback-drawer.js';
import { ShapeRecognitionCorrector } from './drawing/shape-recognition-corrector.js';
import { PathOptimizationEngine } from './drawing/path-optimization-engine.js';

// Types
import type { 
    ScreenCapture,
    Rectangle
} from './vision/screen-capture-engine.js';
import type {
    UIElement
} from './automation/ui-automation-bridge.js';
import type {
    ActionContext,
    DecisionResponse,
    LearningContext
} from './intelligence/intelligence-types.js';
import type {
    DrawingContext,
    DrawingCommand,
    PathOptimization
} from './types/drawing-types.js';

/**
 * Configuration for Glass MCP Orchestrator
 */
export interface GlassMCPConfig {
    // Vision Configuration
    vision: {
        enableScreenCapture: boolean;
        captureQuality: 'high' | 'medium' | 'low';
        enableOCR: boolean;
        ocrLanguages: string[];
        enableObjectDetection: boolean;
        detectionThreshold: number;
    };
    
    // Automation Configuration
    automation: {
        enableUIAutomation: boolean;
        automationTimeout: number;
        retryAttempts: number;
        enablePopupHandling: boolean;
        popupTimeout: number;
    };
    
    // Intelligence Configuration
    intelligence: {
        enableContextAnalysis: boolean;
        enableDecisionEngine: boolean;
        enableLearning: boolean;
        confidenceThreshold: number;
        learningRate: number;
    };
    
    // Drawing Configuration
    drawing: {
        enableVisualFeedback: boolean;
        enableShapeRecognition: boolean;
        enablePathOptimization: boolean;
        drawingPrecision: number;
        optimizationLevel: 'basic' | 'advanced' | 'expert';
    };
    
    // Performance Configuration
    performance: {
        maxConcurrentOperations: number;
        cacheSize: number;
        enablePerformanceMonitoring: boolean;
        memoryThresholdMB: number;
    };
}

/**
 * System status information
 */
export interface SystemStatus {
    status: 'initializing' | 'ready' | 'busy' | 'error' | 'shutdown';
    uptime: number;
    componentsStatus: {
        vision: boolean;
        automation: boolean;
        intelligence: boolean;
        drawing: boolean;
    };
    performance: {
        memoryUsageMB: number;
        cpuUsagePercent: number;
        activeOperations: number;
    };
    lastError?: string;
    capabilities: string[];
}

/**
 * Unified action request for the orchestrator
 */
export interface ActionRequest {
    type: 'visual' | 'automation' | 'drawing' | 'analysis';
    action: string;
    parameters: Record<string, any>;
    context?: ActionContext;
    priority: 'low' | 'medium' | 'high' | 'critical';
    timeout?: number;
}

/**
 * Unified action result from the orchestrator
 */
export interface ActionResult {
    success: boolean;
    result: any;
    error?: string;
    metadata: {
        executionTime: number;
        componentsUsed: string[];
        confidence: number;
        learningData?: any;
    };
}

/**
 * Main Glass MCP Orchestrator
 * 
 * Coordinates all subsystems and provides unified API for visual automation
 */
export class GlassMCPOrchestrator extends EventEmitter {
    private config: GlassMCPConfig;
    private status: SystemStatus;
    private initializationTime: number;
    
    // Phase 1 - Vision Components
    private screenCapture?: ScreenCaptureEngine;
    private ocrEngine?: OCRAnalysisEngine;
    private objectDetection?: ObjectDetectionEngine;
    private visionCoordinator?: VisualIntelligenceCoordinator;
    
    // Phase 2 - Automation Components
    private uiAutomation?: UIAutomationBridge;
    private elementDetector?: ElementDetector;
    private actionPlanner?: ActionPlanner;
    private popupHandler?: PopupHandler;
    
    // Phase 3 - Intelligence Components
    private contextAnalyzer?: ContextAnalyzer;
    private decisionEngine?: DecisionEngine;
    private errorRecovery?: ErrorRecoverySystem;
    private learningSystem?: LearningSystem;
    
    // Phase 4 - Drawing Components
    private visualDrawer?: VisualFeedbackDrawer;
    private shapeRecognition?: ShapeRecognitionCorrector;
    private pathOptimization?: PathOptimizationEngine;
    
    // Internal state
    private activeOperations: Map<string, Promise<any>>;
    private operationCounter: number;

    constructor(config: Partial<GlassMCPConfig> = {}) {
        super();
        
        this.initializationTime = Date.now();
        this.activeOperations = new Map();
        this.operationCounter = 0;
        
        // Merge with default configuration
        this.config = this.mergeWithDefaults(config);
        
        // Initialize status
        this.status = {
            status: 'initializing',
            uptime: 0,
            componentsStatus: {
                vision: false,
                automation: false,
                intelligence: false,
                drawing: false
            },
            performance: {
                memoryUsageMB: 0,
                cpuUsagePercent: 0,
                activeOperations: 0
            },
            capabilities: []
        };
    }

    /**
     * Initialize the orchestrator and all subsystems
     */
    public async initialize(): Promise<void> {
        try {
            this.emit('status', 'Initializing Glass MCP v9.0.0...');
            
            // Initialize components in phases
            await this.initializePhase1Vision();
            await this.initializePhase2Automation();
            await this.initializePhase3Intelligence();
            await this.initializePhase4Drawing();
            
            // Update status
            this.status.status = 'ready';
            this.updateCapabilities();
            
            this.emit('initialized', {
                version: '9.0.0',
                capabilities: this.status.capabilities,
                initializationTime: Date.now() - this.initializationTime
            });
            
        } catch (error) {
            this.status.status = 'error';
            this.status.lastError = error instanceof Error ? error.message : 'Unknown initialization error';
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * Initialize Phase 1 - Vision Components
     */
    private async initializePhase1Vision(): Promise<void> {
        if (!this.config.vision.enableScreenCapture && 
            !this.config.vision.enableOCR && 
            !this.config.vision.enableObjectDetection) {
            return;
        }

        try {
            if (this.config.vision.enableScreenCapture) {
                this.screenCapture = ScreenCaptureEngine.getInstance();
                await this.screenCapture.initialize();
            }

            if (this.config.vision.enableOCR) {
                this.ocrEngine = OCRAnalysisEngine.getInstance();
                await this.ocrEngine.initialize();
            }

            if (this.config.vision.enableObjectDetection) {
                this.objectDetection = ObjectDetectionEngine.getInstance();
                await this.objectDetection.initialize();
            }

            // Initialize vision coordinator if any vision component is enabled
            if (this.screenCapture || this.ocrEngine || this.objectDetection) {
                this.visionCoordinator = VisualIntelligenceCoordinator.getInstance();
                await this.visionCoordinator.initialize();
            }

            this.status.componentsStatus.vision = true;
            this.emit('phase-complete', 'Vision components initialized');
            
        } catch (error) {
            this.emit('phase-error', { phase: 'vision', error });
            throw new Error(`Vision initialization failed: ${error}`);
        }
    }

    /**
     * Initialize Phase 2 - Automation Components
     */
    private async initializePhase2Automation(): Promise<void> {
        if (!this.config.automation.enableUIAutomation) {
            return;
        }

        try {
            this.uiAutomation = UIAutomationBridge.getInstance();
            await this.uiAutomation.initialize();

            this.elementDetector = ElementDetector.getInstance();
            await this.elementDetector.initialize();

            this.actionPlanner = ActionPlanner.getInstance();
            await this.actionPlanner.initialize();

            if (this.config.automation.enablePopupHandling) {
                this.popupHandler = PopupHandler.getInstance();
                await this.popupHandler.initialize();
            }

            this.status.componentsStatus.automation = true;
            this.emit('phase-complete', 'Automation components initialized');
            
        } catch (error) {
            this.emit('phase-error', { phase: 'automation', error });
            throw new Error(`Automation initialization failed: ${error}`);
        }
    }

    /**
     * Initialize Phase 3 - Intelligence Components
     */
    private async initializePhase3Intelligence(): Promise<void> {
        if (!this.config.intelligence.enableContextAnalysis && 
            !this.config.intelligence.enableDecisionEngine && 
            !this.config.intelligence.enableLearning) {
            return;
        }

        try {
            if (this.config.intelligence.enableContextAnalysis) {
                this.contextAnalyzer = ContextAnalyzer.getInstance();
                await this.contextAnalyzer.initialize();
            }

            if (this.config.intelligence.enableDecisionEngine) {
                this.decisionEngine = DecisionEngine.getInstance();
                await this.decisionEngine.initialize();
            }

            this.errorRecovery = ErrorRecoverySystem.getInstance();
            await this.errorRecovery.initialize();

            if (this.config.intelligence.enableLearning) {
                this.learningSystem = LearningSystem.getInstance();
                await this.learningSystem.initialize();
            }

            this.status.componentsStatus.intelligence = true;
            this.emit('phase-complete', 'Intelligence components initialized');
            
        } catch (error) {
            this.emit('phase-error', { phase: 'intelligence', error });
            throw new Error(`Intelligence initialization failed: ${error}`);
        }
    }

    /**
     * Initialize Phase 4 - Drawing Components
     */
    private async initializePhase4Drawing(): Promise<void> {
        if (!this.config.drawing.enableVisualFeedback && 
            !this.config.drawing.enableShapeRecognition && 
            !this.config.drawing.enablePathOptimization) {
            return;
        }

        try {
            if (this.config.drawing.enableVisualFeedback) {
                this.visualDrawer = VisualFeedbackDrawer.getInstance();
                await this.visualDrawer.initialize();
            }

            if (this.config.drawing.enableShapeRecognition) {
                this.shapeRecognition = ShapeRecognitionCorrector.getInstance();
                await this.shapeRecognition.initialize();
            }

            if (this.config.drawing.enablePathOptimization) {
                this.pathOptimization = PathOptimizationEngine.getInstance();
                await this.pathOptimization.initialize();
            }

            this.status.componentsStatus.drawing = true;
            this.emit('phase-complete', 'Drawing components initialized');
            
        } catch (error) {
            this.emit('phase-error', { phase: 'drawing', error });
            throw new Error(`Drawing initialization failed: ${error}`);
        }
    }

    /**
     * Execute a unified action request
     */
    public async executeAction(request: ActionRequest): Promise<ActionResult> {
        const operationId = `op_${++this.operationCounter}`;
        const startTime = Date.now();
        
        try {
            // Validate system is ready
            if (this.status.status !== 'ready') {
                throw new Error(`System not ready: ${this.status.status}`);
            }

            // Check operation limits
            if (this.activeOperations.size >= this.config.performance.maxConcurrentOperations) {
                throw new Error('Maximum concurrent operations reached');
            }

            // Create operation promise
            const operation = this.processActionRequest(request, operationId);
            this.activeOperations.set(operationId, operation);
            
            // Update status
            this.status.status = 'busy';
            this.status.performance.activeOperations = this.activeOperations.size;

            // Execute with timeout
            const timeoutMs = request.timeout || 30000;
            const result = await Promise.race([
                operation,
                this.createTimeoutPromise(timeoutMs)
            ]);

            // Clean up
            this.activeOperations.delete(operationId);
            this.status.performance.activeOperations = this.activeOperations.size;
            
            if (this.activeOperations.size === 0) {
                this.status.status = 'ready';
            }

            const executionTime = Date.now() - startTime;
            
            return {
                success: true,
                result: result.data,
                metadata: {
                    executionTime,
                    componentsUsed: result.componentsUsed,
                    confidence: result.confidence,
                    learningData: result.learningData
                }
            };

        } catch (error) {
            // Clean up on error
            this.activeOperations.delete(operationId);
            this.status.performance.activeOperations = this.activeOperations.size;
            
            if (this.activeOperations.size === 0) {
                this.status.status = 'ready';
            }

            const executionTime = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            // Attempt error recovery if available
            if (this.errorRecovery) {
                try {
                    await this.errorRecovery.handleError({
                        error: errorMessage,
                        context: request.context,
                        action: request.action
                    });
                } catch (recoveryError) {
                    // Recovery failed, continue with original error
                }
            }

            return {
                success: false,
                result: null,
                error: errorMessage,
                metadata: {
                    executionTime,
                    componentsUsed: [],
                    confidence: 0
                }
            };
        }
    }

    /**
     * Process the action request based on type
     */
    private async processActionRequest(
        request: ActionRequest, 
        operationId: string
    ): Promise<{ data: any; componentsUsed: string[]; confidence: number; learningData?: any }> {
        
        const componentsUsed: string[] = [];
        let confidence = 1.0;
        let learningData: any = null;

        // Analyze context if available
        let context = request.context;
        if (this.contextAnalyzer && !context) {
            context = await this.contextAnalyzer.analyzeCurrentContext();
            componentsUsed.push('ContextAnalyzer');
        }

        // Make decision if decision engine available
        let decision: DecisionResult | null = null;
        if (this.decisionEngine && context) {
            decision = await this.decisionEngine.makeDecision({
                context,
                availableActions: [request.action],
                constraints: request.parameters.constraints || []
            });
            componentsUsed.push('DecisionEngine');
            confidence = decision.confidence;
        }

        // Execute based on action type
        let result: any;
        
        switch (request.type) {
            case 'visual':
                result = await this.executeVisualAction(request, context);
                break;
                
            case 'automation':
                result = await this.executeAutomationAction(request, context, decision);
                break;
                
            case 'drawing':
                result = await this.executeDrawingAction(request, context);
                break;
                
            case 'analysis':
                result = await this.executeAnalysisAction(request, context);
                break;
                
            default:
                throw new Error(`Unknown action type: ${request.type}`);
        }

        // Learn from the operation if learning system available
        if (this.learningSystem) {
            learningData = await this.learningSystem.learnFromOutcome({
                action: request.action,
                result,
                success: true,
                context: context || {},
                executionTime: 0 // Will be calculated by caller
            });
            componentsUsed.push('LearningSystem');
        }

        return {
            data: result,
            componentsUsed,
            confidence,
            learningData
        };
    }

    /**
     * Execute visual-type actions
     */
    private async executeVisualAction(request: ActionRequest, context?: IntelligenceContext): Promise<any> {
        switch (request.action) {
            case 'captureScreen':
                if (!this.screenCapture) throw new Error('Screen capture not enabled');
                return await this.screenCapture.captureDisplay(request.parameters.display || 'primary');
                
            case 'analyzeText':
                if (!this.ocrEngine) throw new Error('OCR not enabled');
                return await this.ocrEngine.analyzeImage(request.parameters.imageData);
                
            case 'detectObjects':
                if (!this.objectDetection) throw new Error('Object detection not enabled');
                return await this.objectDetection.detectObjects(request.parameters.imageData);
                
            case 'analyzeVisual':
                if (!this.visionCoordinator) throw new Error('Vision coordinator not available');
                return await this.visionCoordinator.performCompleteAnalysis(request.parameters.region);
                
            default:
                throw new Error(`Unknown visual action: ${request.action}`);
        }
    }

    /**
     * Execute automation-type actions
     */
    private async executeAutomationAction(
        request: ActionRequest, 
        context?: IntelligenceContext, 
        decision?: DecisionResult | null
    ): Promise<any> {
        switch (request.action) {
            case 'findElement':
                if (!this.elementDetector) throw new Error('Element detector not available');
                return await this.elementDetector.findElement(request.parameters.selector);
                
            case 'planAction':
                if (!this.actionPlanner) throw new Error('Action planner not available');
                return await this.actionPlanner.planAction({
                    type: request.parameters.actionType,
                    target: request.parameters.target,
                    parameters: request.parameters.actionParameters,
                    context: context
                } as AutomationTask);
                
            case 'handlePopup':
                if (!this.popupHandler) throw new Error('Popup handler not available');
                return await this.popupHandler.handlePopup(request.parameters.strategy || 'auto');
                
            case 'click':
                if (!this.uiAutomation) throw new Error('UI automation not available');
                return await this.uiAutomation.clickElement(request.parameters.selector);
                
            default:
                throw new Error(`Unknown automation action: ${request.action}`);
        }
    }

    /**
     * Execute drawing-type actions
     */
    private async executeDrawingAction(request: ActionRequest, context?: IntelligenceContext): Promise<any> {
        switch (request.action) {
            case 'drawWithFeedback':
                if (!this.visualDrawer) throw new Error('Visual drawer not available');
                return await this.visualDrawer.drawWithRealTimeAnalysis(
                    request.parameters.commands,
                    request.parameters.targetRegion
                );
                
            case 'recognizeShape':
                if (!this.shapeRecognition) throw new Error('Shape recognition not available');
                return await this.shapeRecognition.recognizeAndCorrectShape(
                    request.parameters.drawnPath,
                    request.parameters.targetShape
                );
                
            case 'optimizePath':
                if (!this.pathOptimization) throw new Error('Path optimization not available');
                return await this.pathOptimization.optimizePath(request.parameters.path);
                
            default:
                throw new Error(`Unknown drawing action: ${request.action}`);
        }
    }

    /**
     * Execute analysis-type actions
     */
    private async executeAnalysisAction(request: ActionRequest, context?: IntelligenceContext): Promise<any> {
        switch (request.action) {
            case 'analyzeContext':
                if (!this.contextAnalyzer) throw new Error('Context analyzer not available');
                return await this.contextAnalyzer.analyzeCurrentContext();
                
            case 'makeDecision':
                if (!this.decisionEngine) throw new Error('Decision engine not available');
                return await this.decisionEngine.makeDecision(request.parameters);
                
            default:
                throw new Error(`Unknown analysis action: ${request.action}`);
        }
    }

    /**
     * Get current system status
     */
    public getStatus(): SystemStatus {
        this.status.uptime = Date.now() - this.initializationTime;
        this.status.performance.memoryUsageMB = process.memoryUsage().heapUsed / 1024 / 1024;
        this.status.performance.activeOperations = this.activeOperations.size;
        
        return { ...this.status };
    }

    /**
     * Shutdown the orchestrator gracefully
     */
    public async shutdown(): Promise<void> {
        this.status.status = 'shutdown';
        
        // Wait for active operations to complete or timeout
        const shutdownTimeout = 5000;
        const activeOps = Array.from(this.activeOperations.values());
        
        if (activeOps.length > 0) {
            await Promise.race([
                Promise.all(activeOps),
                new Promise(resolve => setTimeout(resolve, shutdownTimeout))
            ]);
        }

        // Shutdown components
        await this.shutdownComponents();
        
        this.emit('shutdown', {
            uptime: Date.now() - this.initializationTime,
            operationsCompleted: this.operationCounter
        });
    }

    /**
     * Merge configuration with defaults
     */
    private mergeWithDefaults(config: Partial<GlassMCPConfig>): GlassMCPConfig {
        const defaults: GlassMCPConfig = {
            vision: {
                enableScreenCapture: true,
                captureQuality: 'high',
                enableOCR: true,
                ocrLanguages: ['en', 'ro'],
                enableObjectDetection: true,
                detectionThreshold: 0.7
            },
            automation: {
                enableUIAutomation: true,
                automationTimeout: 10000,
                retryAttempts: 3,
                enablePopupHandling: true,
                popupTimeout: 5000
            },
            intelligence: {
                enableContextAnalysis: true,
                enableDecisionEngine: true,
                enableLearning: true,
                confidenceThreshold: 0.8,
                learningRate: 0.1
            },
            drawing: {
                enableVisualFeedback: true,
                enableShapeRecognition: true,
                enablePathOptimization: true,
                drawingPrecision: 1.0,
                optimizationLevel: 'advanced'
            },
            performance: {
                maxConcurrentOperations: 5,
                cacheSize: 100,
                enablePerformanceMonitoring: true,
                memoryThresholdMB: 512
            }
        };

        return {
            vision: { ...defaults.vision, ...config.vision },
            automation: { ...defaults.automation, ...config.automation },
            intelligence: { ...defaults.intelligence, ...config.intelligence },
            drawing: { ...defaults.drawing, ...config.drawing },
            performance: { ...defaults.performance, ...config.performance }
        };
    }

    /**
     * Update system capabilities based on initialized components
     */
    private updateCapabilities(): void {
        const capabilities: string[] = [];
        
        if (this.status.componentsStatus.vision) {
            capabilities.push(
                'screen-capture', 'ocr-analysis', 'object-detection', 'visual-intelligence'
            );
        }
        
        if (this.status.componentsStatus.automation) {
            capabilities.push(
                'ui-automation', 'element-detection', 'action-planning', 'popup-handling'
            );
        }
        
        if (this.status.componentsStatus.intelligence) {
            capabilities.push(
                'context-analysis', 'decision-making', 'error-recovery', 'adaptive-learning'
            );
        }
        
        if (this.status.componentsStatus.drawing) {
            capabilities.push(
                'visual-feedback-drawing', 'shape-recognition', 'path-optimization'
            );
        }
        
        this.status.capabilities = capabilities;
    }

    /**
     * Create timeout promise for operations
     */
    private createTimeoutPromise(timeoutMs: number): Promise<never> {
        return new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error(`Operation timed out after ${timeoutMs}ms`));
            }, timeoutMs);
        });
    }

    /**
     * Shutdown all components gracefully
     */
    private async shutdownComponents(): Promise<void> {
        const shutdownPromises: Promise<void>[] = [];

        // Add shutdown calls for components that have shutdown methods
        if (this.learningSystem?.shutdown) {
            shutdownPromises.push(this.learningSystem.shutdown());
        }
        if (this.errorRecovery?.shutdown) {
            shutdownPromises.push(this.errorRecovery.shutdown());
        }

        // Wait for all shutdowns to complete
        await Promise.allSettled(shutdownPromises);
    }
}

/**
 * Create and initialize a Glass MCP Orchestrator with default configuration
 */
export async function createGlassMCPOrchestrator(
    config?: Partial<GlassMCPConfig>
): Promise<GlassMCPOrchestrator> {
    const orchestrator = new GlassMCPOrchestrator(config);
    await orchestrator.initialize();
    return orchestrator;
}