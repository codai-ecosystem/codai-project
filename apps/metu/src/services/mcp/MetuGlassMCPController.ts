/**
 * METU Glass MCP Device Controller
 * 
 * Integrates Glass MCP functionality into the METU device server architecture.
 * Provides advanced Windows automation capabilities through the device discovery system.
 */

import { EventEmitter } from 'events';
import { EnhancedGlassMCPClient, AutomationWorkflow, CommandResult, WorkflowResult } from './EnhancedGlassMCPClient';
import { GlassMCPIntegrationService, createGlassMCPIntegrationService } from './GlassMCPIntegrationService';

export interface DeviceAutomationRequest {
    deviceId: string;
    type: 'single_command' | 'workflow';
    command?: {
        action: string;
        parameters: Record<string, any>;
    };
    workflow?: AutomationWorkflow;
    timeout?: number;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface DeviceAutomationResponse {
    requestId: string;
    deviceId: string;
    success: boolean;
    type: 'command_result' | 'workflow_result';
    result?: CommandResult | WorkflowResult;
    error?: string;
    timestamp: number;
    executionTime: number;
}

export interface AutomationCapabilities {
    windowManagement: boolean;
    textAutomation: boolean;
    clipboardAccess: boolean;
    workflowExecution: boolean;
    multiStepAutomation: boolean;
    crossApplicationAutomation: boolean;
}

/**
 * METU Glass MCP Device Controller
 * Coordinates Glass MCP automation with the device server system
 */
export class MetuGlassMCPController extends EventEmitter {
    private glassMCPClient: EnhancedGlassMCPClient;
    private glassMCPService: GlassMCPIntegrationService;
    private isInitialized: boolean = false;
    private automationQueue: Map<string, DeviceAutomationRequest> = new Map();
    private activeAutomations: Map<string, { request: DeviceAutomationRequest; startTime: number }> = new Map();
    private capabilities: AutomationCapabilities;

    constructor() {
        super();

        this.glassMCPClient = new EnhancedGlassMCPClient();
        this.glassMCPService = createGlassMCPIntegrationService(this.glassMCPClient);

        this.capabilities = {
            windowManagement: true,
            textAutomation: true,
            clipboardAccess: true,
            workflowExecution: true,
            multiStepAutomation: true,
            crossApplicationAutomation: true
        };

        this.setupEventHandlers();
    }

    /**
     * Initialize the Glass MCP controller
     */
    async initialize(): Promise<boolean> {
        try {
            console.log('🚀 Initializing METU Glass MCP Controller...');

            // Initialize Glass MCP integration service
            const serviceInitialized = await this.glassMCPService.initialize();

            if (!serviceInitialized) {
                console.warn('⚠️ Glass MCP service initialization failed - some features may not work');
            }

            this.isInitialized = true;
            this.emit('initialized', {
                success: true,
                capabilities: this.capabilities,
                glassMCPAvailable: serviceInitialized
            });

            console.log('✅ METU Glass MCP Controller initialized successfully');
            return true;

        } catch (error) {
            console.error('❌ Failed to initialize METU Glass MCP Controller:', error);
            this.emit('error', error);
            return false;
        }
    }

    /**
     * Execute automation request
     */
    async executeAutomation(request: DeviceAutomationRequest): Promise<DeviceAutomationResponse> {
        const requestId = this.generateRequestId();
        const startTime = Date.now();

        try {
            if (!this.isInitialized) {
                throw new Error('Glass MCP controller not initialized');
            }

            // Add to active automations
            this.activeAutomations.set(requestId, { request, startTime });
            this.emit('automationStarted', { requestId, request });

            let result: CommandResult | WorkflowResult;
            let responseType: 'command_result' | 'workflow_result';

            if (request.type === 'single_command' && request.command) {
                // Execute single command
                result = await this.glassMCPClient.controlDevice(request.deviceId, {
                    action: request.command.action as any,
                    parameters: request.command.parameters
                });
                responseType = 'command_result';

            } else if (request.type === 'workflow' && request.workflow) {
                // Execute workflow
                result = await this.glassMCPClient.automateWorkflow(request.deviceId, request.workflow);
                responseType = 'workflow_result';

            } else {
                throw new Error('Invalid automation request: missing command or workflow');
            }

            const response: DeviceAutomationResponse = {
                requestId,
                deviceId: request.deviceId,
                success: result.success,
                type: responseType,
                result,
                timestamp: Date.now(),
                executionTime: Date.now() - startTime
            };

            // Remove from active automations
            this.activeAutomations.delete(requestId);
            this.emit('automationCompleted', { requestId, response });

            return response;

        } catch (error) {
            const response: DeviceAutomationResponse = {
                requestId,
                deviceId: request.deviceId,
                success: false,
                type: request.type === 'workflow' ? 'workflow_result' : 'command_result',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: Date.now(),
                executionTime: Date.now() - startTime
            };

            this.activeAutomations.delete(requestId);
            this.emit('automationFailed', { requestId, response, error });

            return response;
        }
    }

    /**
     * Get list of windows on target device
     */
    async getDeviceWindows(deviceId: string): Promise<DeviceAutomationResponse> {
        const request: DeviceAutomationRequest = {
            deviceId,
            type: 'single_command',
            command: {
                action: 'window_list',
                parameters: {}
            }
        };

        return await this.executeAutomation(request);
    }

    /**
     * Focus a window on target device
     */
    async focusDeviceWindow(deviceId: string, windowTitle: string, exact: boolean = false): Promise<DeviceAutomationResponse> {
        const request: DeviceAutomationRequest = {
            deviceId,
            type: 'single_command',
            command: {
                action: 'window_focus',
                parameters: { title: windowTitle, exact }
            }
        };

        return await this.executeAutomation(request);
    }

    /**
     * Send text to a window on target device
     */
    async sendTextToDeviceWindow(deviceId: string, windowTitle: string, text: string, exact: boolean = false): Promise<DeviceAutomationResponse> {
        const request: DeviceAutomationRequest = {
            deviceId,
            type: 'single_command',
            command: {
                action: 'window_send_text',
                parameters: { title: windowTitle, text, exact }
            }
        };

        return await this.executeAutomation(request);
    }

    /**
     * Extract text from a window on target device
     */
    async extractTextFromDeviceWindow(deviceId: string, windowTitle: string, exact: boolean = false): Promise<DeviceAutomationResponse> {
        const request: DeviceAutomationRequest = {
            deviceId,
            type: 'single_command',
            command: {
                action: 'window_extract_text',
                parameters: { title: windowTitle, exact }
            }
        };

        return await this.executeAutomation(request);
    }

    /**
     * Get clipboard content from target device
     */
    async getDeviceClipboard(deviceId: string): Promise<DeviceAutomationResponse> {
        const request: DeviceAutomationRequest = {
            deviceId,
            type: 'single_command',
            command: {
                action: 'clipboard_get_text',
                parameters: {}
            }
        };

        return await this.executeAutomation(request);
    }

    /**
     * Set clipboard content on target device
     */
    async setDeviceClipboard(deviceId: string, text: string): Promise<DeviceAutomationResponse> {
        const request: DeviceAutomationRequest = {
            deviceId,
            type: 'single_command',
            command: {
                action: 'clipboard_set_text',
                parameters: { text }
            }
        };

        return await this.executeAutomation(request);
    }

    /**
     * Execute predefined workflow on target device
     */
    async executeWorkflow(deviceId: string, workflowName: string, parameters: Record<string, any> = {}): Promise<DeviceAutomationResponse> {
        const commonWorkflows = this.glassMCPService.createCommonAutomationWorkflows();
        const workflow = (commonWorkflows as any)[workflowName];

        if (!workflow) {
            throw new Error(`Unknown workflow: ${workflowName}`);
        }

        // Customize workflow with parameters
        const customizedWorkflow = this.customizeWorkflow(workflow, parameters);

        const request: DeviceAutomationRequest = {
            deviceId,
            type: 'workflow',
            workflow: customizedWorkflow
        };

        return await this.executeAutomation(request);
    }

    /**
     * Create custom automation workflow
     */
    async createCustomWorkflow(deviceId: string, workflow: AutomationWorkflow): Promise<DeviceAutomationResponse> {
        const request: DeviceAutomationRequest = {
            deviceId,
            type: 'workflow',
            workflow
        };

        return await this.executeAutomation(request);
    }

    /**
     * Get automation capabilities
     */
    getCapabilities(): AutomationCapabilities {
        return { ...this.capabilities };
    }

    /**
     * Get controller status
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            capabilities: this.capabilities,
            activeAutomations: this.activeAutomations.size,
            queuedAutomations: this.automationQueue.size,
            glassMCPStatus: this.glassMCPService.getStatus(),
            activeWorkflows: Array.from(this.activeAutomations.entries()).map(([id, { request, startTime }]) => ({
                requestId: id,
                deviceId: request.deviceId,
                type: request.type,
                runningTime: Date.now() - startTime
            }))
        };
    }

    /**
     * Stop all active automations
     */
    async stopAllAutomations(): Promise<void> {
        // Stop Glass MCP workflows
        await this.glassMCPClient.stopAllWorkflows();

        // Clear local tracking
        const stoppedAutomations = Array.from(this.activeAutomations.keys());
        this.activeAutomations.clear();
        this.automationQueue.clear();

        this.emit('allAutomationsStopped', { stoppedAutomations });
    }

    /**
     * Private: Setup event handlers
     */
    private setupEventHandlers(): void {
        // Glass MCP Client events
        this.glassMCPClient.on('commandExecuted', (data) => {
            this.emit('commandExecuted', data);
        });

        this.glassMCPClient.on('workflowCompleted', (data) => {
            this.emit('workflowCompleted', data);
        });

        this.glassMCPClient.on('workflowFailed', (data) => {
            this.emit('workflowFailed', data);
        });

        // Glass MCP Service events
        this.glassMCPService.on('warning', (message) => {
            this.emit('warning', message);
        });

        this.glassMCPService.on('error', (error) => {
            this.emit('error', error);
        });
    }

    /**
     * Private: Generate unique request ID
     */
    private generateRequestId(): string {
        return `automation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Private: Customize workflow with parameters
     */
    private customizeWorkflow(workflow: AutomationWorkflow, parameters: Record<string, any>): AutomationWorkflow {
        const customizedWorkflow = { ...workflow };

        // Apply parameters to workflow steps
        customizedWorkflow.steps = workflow.steps.map(step => ({
            ...step,
            parameters: { ...step.parameters, ...parameters }
        }));

        return customizedWorkflow;
    }

    /**
     * Cleanup and shutdown
     */
    async shutdown(): Promise<void> {
        console.log('🛑 Shutting down METU Glass MCP Controller...');

        await this.stopAllAutomations();
        await this.glassMCPClient.disconnect();
        await this.glassMCPService.shutdown();

        this.removeAllListeners();
        this.isInitialized = false;

        console.log('✅ METU Glass MCP Controller shutdown complete');
    }
}

// Export singleton instance
export const metuGlassMCPController = new MetuGlassMCPController();
