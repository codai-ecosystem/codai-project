/**
 * Enhanced Glass MCP Client
 * 
 * Provides advanced Windows automation capabilities through Glass MCP integration.
 * Supports multi-device control, automation workflows, and screen management.
 */

import { EventEmitter } from 'events';

// Glass MCP Tool Interfaces (matching the available MCP tools)
export interface WindowInfo {
    handle: number;
    title: string;
    className?: string;
    processId?: number;
    isVisible?: boolean;
    bounds?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

export interface DeviceCommand {
    action: 'window_list' | 'window_focus' | 'window_send_text' | 'window_extract_text' |
    'clipboard_get_text' | 'clipboard_set_text' | 'custom_automation';
    parameters: Record<string, any>;
    target?: string;
    timeout?: number;
}

export interface CommandResult {
    success: boolean;
    data: any;
    error?: string;
    timestamp: number;
    executionTime: number;
}

export interface AutomationStep extends DeviceCommand {
    id: string;
    name: string;
    required: boolean;
    delay?: number;
    retries?: number;
    condition?: {
        type: 'window_exists' | 'text_contains' | 'custom';
        value: any;
    };
}

export interface AutomationWorkflow {
    id: string;
    name: string;
    description: string;
    steps: AutomationStep[];
    parallel?: boolean;
    maxDuration?: number;
}

export interface WorkflowResult {
    workflowId: string;
    success: boolean;
    steps: Array<{
        stepId: string;
        result: CommandResult;
        skipped?: boolean;
    }>;
    totalTime: number;
    failedAt?: string;
}

export interface DeviceAutomationCapabilities {
    windowManagement: boolean;
    textAutomation: boolean;
    clipboardAccess: boolean;
    multiMonitorSupport: boolean;
    screenCapture: boolean;
    processControl: boolean;
}

/**
 * Enhanced Glass MCP Client for advanced Windows automation
 */
export class EnhancedGlassMCPClient extends EventEmitter {
    private isConnected: boolean = false;
    private capabilities: DeviceAutomationCapabilities;
    private activeWorkflows: Map<string, { workflow: AutomationWorkflow; startTime: number }> = new Map();

    constructor() {
        super();
        this.capabilities = {
            windowManagement: true,
            textAutomation: true,
            clipboardAccess: true,
            multiMonitorSupport: true,
            screenCapture: false, // Will be implemented in future phases
            processControl: false  // Will be implemented in future phases
        };
    }

    /**
     * Initialize Glass MCP connection
     */
    async initialize(): Promise<boolean> {
        try {
            // Test connection with a simple window list command
            const testResult = await this.executeGlassMCPCommand('window_list', {});
            this.isConnected = testResult.success;

            if (this.isConnected) {
                this.emit('connected');
                console.log('✅ Enhanced Glass MCP Client initialized successfully');
            } else {
                this.emit('error', new Error('Failed to initialize Glass MCP connection'));
            }

            return this.isConnected;
        } catch (error) {
            this.emit('error', error);
            return false;
        }
    }

    /**
     * Get current device capabilities
     */
    getCapabilities(): DeviceAutomationCapabilities {
        return { ...this.capabilities };
    }

    /**
     * Execute a device command
     */
    async controlDevice(deviceId: string, command: DeviceCommand): Promise<CommandResult> {
        const startTime = Date.now();

        try {
            if (!this.isConnected) {
                throw new Error('Glass MCP client not connected');
            }

            // Execute command via Glass MCP
            const result = await this.executeGlassMCPCommand(command.action, command.parameters);

            const commandResult: CommandResult = {
                success: result.success,
                data: result.data,
                error: result.error,
                timestamp: Date.now(),
                executionTime: Date.now() - startTime
            };

            this.emit('commandExecuted', { deviceId, command, result: commandResult });
            return commandResult;

        } catch (error) {
            const commandResult: CommandResult = {
                success: false,
                data: null,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: Date.now(),
                executionTime: Date.now() - startTime
            };

            this.emit('commandFailed', { deviceId, command, error: commandResult.error });
            return commandResult;
        }
    }

    /**
     * Execute complex automation workflows
     */
    async automateWorkflow(deviceId: string, workflow: AutomationWorkflow): Promise<WorkflowResult> {
        const startTime = Date.now();
        const workflowId = workflow.id;

        try {
            // Register active workflow
            this.activeWorkflows.set(workflowId, { workflow, startTime });
            this.emit('workflowStarted', { deviceId, workflowId, workflow });

            const results: WorkflowResult['steps'] = [];

            if (workflow.parallel) {
                // Execute steps in parallel
                const promises = workflow.steps.map(async (step) => {
                    await this.delayIfNeeded(step.delay);
                    const result = await this.executeStepWithRetries(deviceId, step);
                    return { stepId: step.id, result };
                });

                const parallelResults = await Promise.allSettled(promises);

                parallelResults.forEach((promiseResult, index) => {
                    if (promiseResult.status === 'fulfilled') {
                        results.push(promiseResult.value);
                    } else {
                        results.push({
                            stepId: workflow.steps[index].id,
                            result: {
                                success: false,
                                data: null,
                                error: promiseResult.reason.message,
                                timestamp: Date.now(),
                                executionTime: 0
                            }
                        });
                    }
                });

            } else {
                // Execute steps sequentially
                for (const step of workflow.steps) {
                    // Check workflow timeout
                    if (workflow.maxDuration && (Date.now() - startTime) > workflow.maxDuration) {
                        results.push({
                            stepId: step.id,
                            result: {
                                success: false,
                                data: null,
                                error: 'Workflow timeout exceeded',
                                timestamp: Date.now(),
                                executionTime: 0
                            }
                        });
                        break;
                    }

                    // Apply delay if specified
                    await this.delayIfNeeded(step.delay);

                    // Check step condition
                    if (step.condition && !(await this.checkStepCondition(step.condition))) {
                        results.push({
                            stepId: step.id,
                            result: {
                                success: true,
                                data: null,
                                timestamp: Date.now(),
                                executionTime: 0
                            },
                            skipped: true
                        });
                        continue;
                    }

                    // Execute step with retries
                    const stepResult = await this.executeStepWithRetries(deviceId, step);
                    results.push({ stepId: step.id, result: stepResult });

                    // Fail fast for required steps
                    if (!stepResult.success && step.required) {
                        const workflowResult: WorkflowResult = {
                            workflowId,
                            success: false,
                            steps: results,
                            totalTime: Date.now() - startTime,
                            failedAt: step.id
                        };

                        this.activeWorkflows.delete(workflowId);
                        this.emit('workflowFailed', { deviceId, workflowResult });
                        return workflowResult;
                    }
                }
            }

            const workflowResult: WorkflowResult = {
                workflowId,
                success: results.every(r => r.skipped || r.result.success),
                steps: results,
                totalTime: Date.now() - startTime
            };

            this.activeWorkflows.delete(workflowId);
            this.emit('workflowCompleted', { deviceId, workflowResult });
            return workflowResult;

        } catch (error) {
            const workflowResult: WorkflowResult = {
                workflowId,
                success: false,
                steps: [],
                totalTime: Date.now() - startTime,
                failedAt: 'initialization'
            };

            this.activeWorkflows.delete(workflowId);
            this.emit('workflowFailed', { deviceId, workflowResult, error });
            return workflowResult;
        }
    }

    /**
     * Get list of all windows on the target device
     */
    async getWindowList(deviceId?: string): Promise<WindowInfo[]> {
        const result = await this.controlDevice(deviceId || 'local', {
            action: 'window_list',
            parameters: {}
        });

        if (result.success && Array.isArray(result.data)) {
            return result.data.map((window: any) => ({
                handle: window.handle,
                title: window.title,
                className: window.className,
                processId: window.processId,
                isVisible: window.isVisible,
                bounds: window.bounds
            }));
        }

        return [];
    }

    /**
     * Focus a specific window
     */
    async focusWindow(title: string, exact: boolean = false): Promise<CommandResult> {
        return await this.controlDevice('local', {
            action: 'window_focus',
            parameters: { title, exact }
        });
    }

    /**
     * Send text to a specific window
     */
    async sendTextToWindow(title: string, text: string, exact: boolean = false): Promise<CommandResult> {
        return await this.controlDevice('local', {
            action: 'window_send_text',
            parameters: { title, text, exact }
        });
    }

    /**
     * Extract text from a window
     */
    async extractTextFromWindow(title: string, exact: boolean = false): Promise<CommandResult> {
        return await this.controlDevice('local', {
            action: 'window_extract_text',
            parameters: { title, exact }
        });
    }

    /**
     * Get clipboard content
     */
    async getClipboardText(): Promise<string | null> {
        const result = await this.controlDevice('local', {
            action: 'clipboard_get_text',
            parameters: {}
        });

        return result.success ? result.data : null;
    }

    /**
     * Set clipboard content
     */
    async setClipboardText(text: string): Promise<boolean> {
        const result = await this.controlDevice('local', {
            action: 'clipboard_set_text',
            parameters: { text }
        });

        return result.success;
    }

    /**
     * Create predefined automation workflows
     */
    createCommonWorkflows(): { [key: string]: AutomationWorkflow } {
        return {
            focusAndType: {
                id: 'focus-and-type',
                name: 'Focus Window and Type Text',
                description: 'Focus a specific window and send text to it',
                steps: [
                    {
                        id: 'focus',
                        name: 'Focus Window',
                        action: 'window_focus',
                        parameters: {},
                        required: true
                    },
                    {
                        id: 'type',
                        name: 'Send Text',
                        action: 'window_send_text',
                        parameters: {},
                        required: true,
                        delay: 500
                    }
                ]
            },

            copyFromWindowToClipboard: {
                id: 'copy-window-to-clipboard',
                name: 'Copy Window Text to Clipboard',
                description: 'Extract text from a window and copy to clipboard',
                steps: [
                    {
                        id: 'extract',
                        name: 'Extract Text',
                        action: 'window_extract_text',
                        parameters: {},
                        required: true
                    },
                    {
                        id: 'copy',
                        name: 'Copy to Clipboard',
                        action: 'clipboard_set_text',
                        parameters: {},
                        required: true
                    }
                ]
            }
        };
    }

    /**
     * Stop all active workflows
     */
    async stopAllWorkflows(): Promise<void> {
        const activeWorkflowIds = Array.from(this.activeWorkflows.keys());
        this.activeWorkflows.clear();

        this.emit('allWorkflowsStopped', { stoppedWorkflows: activeWorkflowIds });
    }

    /**
     * Get active workflow status
     */
    getActiveWorkflows(): Array<{ id: string; name: string; runningTime: number }> {
        return Array.from(this.activeWorkflows.entries()).map(([id, { workflow, startTime }]) => ({
            id,
            name: workflow.name,
            runningTime: Date.now() - startTime
        }));
    }

    /**
     * Private: Execute Glass MCP command (abstraction layer)
     */
    private async executeGlassMCPCommand(action: string, parameters: Record<string, any>): Promise<{
        success: boolean;
        data: any;
        error?: string;
    }> {
        // This is where we would integrate with the actual Glass MCP tools
        // For now, we'll simulate the interface

        try {
            // Import the Glass MCP tools dynamically
            // Placeholder for MCP tool functions - would normally import from actual MCP package
            const glassMCPTools = {
                mcp_glassmcp_window_list: () => Promise.resolve([]),
                mcp_glassmcp_window_focus: () => Promise.resolve(true),
                mcp_glassmcp_window_send_text: () => Promise.resolve(true),
                mcp_glassmcp_window_extract_text: () => Promise.resolve(''),
                mcp_glassmcp_clipboard_get_text: () => Promise.resolve(''),
                mcp_glassmcp_clipboard_set_text: () => Promise.resolve(true)
            };

            switch (action) {
                case 'window_list':
                    // Call actual Glass MCP window list
                    return { success: true, data: [] }; // Placeholder

                case 'window_focus':
                    // Call actual Glass MCP window focus
                    return { success: true, data: null };

                case 'window_send_text':
                    // Call actual Glass MCP send text
                    return { success: true, data: null };

                case 'window_extract_text':
                    // Call actual Glass MCP extract text
                    return { success: true, data: '' };

                case 'clipboard_get_text':
                    // Call actual Glass MCP clipboard get
                    return { success: true, data: '' };

                case 'clipboard_set_text':
                    // Call actual Glass MCP clipboard set
                    return { success: true, data: null };

                default:
                    throw new Error(`Unsupported action: ${action}`);
            }
        } catch (error) {
            return {
                success: false,
                data: null,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Private: Execute step with retry logic
     */
    private async executeStepWithRetries(deviceId: string, step: AutomationStep): Promise<CommandResult> {
        const maxRetries = step.retries || 1;
        let lastError: string = '';

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const result = await this.controlDevice(deviceId, step);

                if (result.success) {
                    return result;
                }

                lastError = result.error || 'Unknown error';

                if (attempt < maxRetries) {
                    // Wait before retry
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                }

            } catch (error) {
                lastError = error instanceof Error ? error.message : 'Unknown error';
            }
        }

        return {
            success: false,
            data: null,
            error: `Failed after ${maxRetries} attempts: ${lastError}`,
            timestamp: Date.now(),
            executionTime: 0
        };
    }

    /**
     * Private: Check step condition
     */
    private async checkStepCondition(condition: AutomationStep['condition']): Promise<boolean> {
        if (!condition) return true;

        try {
            switch (condition.type) {
                case 'window_exists':
                    const windows = await this.getWindowList();
                    return windows.some(w => w.title.includes(condition.value));

                case 'text_contains':
                    const clipboardText = await this.getClipboardText();
                    return clipboardText ? clipboardText.includes(condition.value) : false;

                case 'custom':
                    // Custom condition logic would go here
                    return true;

                default:
                    return true;
            }
        } catch (error) {
            console.warn('Condition check failed:', error);
            return false;
        }
    }

    /**
     * Private: Apply delay if specified
     */
    private async delayIfNeeded(delay?: number): Promise<void> {
        if (delay && delay > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    /**
     * Cleanup and disconnect
     */
    async disconnect(): Promise<void> {
        await this.stopAllWorkflows();
        this.isConnected = false;
        this.emit('disconnected');
    }
}

// Export singleton instance
export const enhancedGlassMCPClient = new EnhancedGlassMCPClient();
