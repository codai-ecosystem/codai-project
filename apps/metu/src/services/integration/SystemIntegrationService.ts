/**
 * System Integration Service
 * Phase 5.2: File operations, calendar, email, development tools integration
 */

import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import * as path from 'path';
import { getErrorMessage } from '../../utils/errorHandling';
import type {
    SystemIntegrationCommand,
    VoiceResponse
} from '../../types/voice-types';

export interface SystemIntegrationConfig {
    enabledIntegrations: string[];
    fileSystemAccess: boolean;
    developmentToolsAccess: boolean;
    calendarIntegration: boolean;
    emailIntegration: boolean;
    securityLevel: 'basic' | 'enhanced' | 'strict';
    confirmationRequired: boolean;
}

export interface FileOperation {
    type: 'read' | 'write' | 'delete' | 'move' | 'copy' | 'search' | 'create';
    path: string;
    content?: string;
    destination?: string;
    pattern?: string;
    recursive?: boolean;
}

export interface CalendarEvent {
    id?: string;
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    attendees?: string[];
    location?: string;
    reminders?: number[];
}

export interface TaskItem {
    id?: string;
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    dueDate?: Date;
    category?: string;
    completed: boolean;
    tags?: string[];
}

export interface EmailMessage {
    id?: string;
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    body: string;
    attachments?: string[];
    priority?: 'low' | 'normal' | 'high';
}

export interface DevelopmentAction {
    type: 'build' | 'test' | 'deploy' | 'debug' | 'analyze' | 'format' | 'commit';
    project?: string;
    target?: string;
    parameters?: Record<string, any>;
    workingDirectory?: string;
}

export class SystemIntegrationService extends EventEmitter {
    private config: SystemIntegrationConfig;
    private isActive: boolean = false;
    private integratedSystems: Set<string> = new Set();
    private commandHistory: Array<{ command: SystemIntegrationCommand; timestamp: number }> = [];

    constructor(config: SystemIntegrationConfig) {
        super();
        this.config = config;
    }

    // Utility method for error handling
    private getErrorMessage(error: unknown): string {
        return error instanceof Error ? error.message : 'Unknown error';
    }

    // File System Operations
    async executeFileOperation(operation: FileOperation): Promise<VoiceResponse> {
        try {
            if (!this.config.fileSystemAccess) {
                throw new Error('File system access is disabled');
            }

            let result: any;
            const startTime = Date.now();

            switch (operation.type) {
                case 'read':
                    result = await this.readFile(operation.path);
                    break;
                case 'write':
                    result = await this.writeFile(operation.path, operation.content || '');
                    break;
                case 'delete':
                    result = await this.deleteFile(operation.path);
                    break;
                case 'move':
                    result = await this.moveFile(operation.path, operation.destination || '');
                    break;
                case 'copy':
                    result = await this.copyFile(operation.path, operation.destination || '');
                    break;
                case 'search':
                    result = await this.searchFiles(operation.path, operation.pattern || '');
                    break;
                case 'create':
                    result = await this.createDirectory(operation.path);
                    break;
                default:
                    throw new Error(`Unsupported file operation: ${operation.type}`);
            }

            const response: VoiceResponse = {
                id: `file_${Date.now()}`,
                sessionId: '',
                type: 'action',
                content: `File operation '${operation.type}' completed successfully`,
                metadata: {
                    operation: operation.type,
                    path: operation.path,
                    result: result
                },
                timestamp: Date.now(),
                processingTime: Date.now() - startTime
            };

            this.emit('fileOperationCompleted', {
                operation: operation.type,
                path: operation.path,
                success: true,
                timestamp: Date.now()
            });

            return response;
        } catch (error) {
            console.error('File operation error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            const errorResponse: VoiceResponse = {
                id: `file_error_${Date.now()}`,
                sessionId: '',
                type: 'error',
                content: `File operation failed: ${errorMessage}`,
                metadata: {
                    operation: operation.type,
                    path: operation.path,
                    error: errorMessage
                },
                timestamp: Date.now()
            };

            this.emit('fileOperationFailed', {
                operation: operation.type,
                path: operation.path,
                error: errorMessage,
                timestamp: Date.now()
            });

            return errorResponse;
        }
    }

    // Calendar Integration
    async createCalendarEvent(event: CalendarEvent): Promise<VoiceResponse> {
        try {
            if (!this.config.calendarIntegration) {
                throw new Error('Calendar integration is disabled');
            }

            // In a real implementation, this would integrate with actual calendar APIs
            // For now, we'll simulate the operation
            const eventId = `event_${Date.now()}`;
            const createdEvent = { ...event, id: eventId };

            const response: VoiceResponse = {
                id: `calendar_${Date.now()}`,
                sessionId: '',
                type: 'action',
                content: `Calendar event "${event.title}" created successfully`,
                metadata: {
                    eventId,
                    event: createdEvent,
                    type: 'calendar_create'
                },
                timestamp: Date.now()
            };

            this.emit('calendarEventCreated', {
                eventId,
                title: event.title,
                startTime: event.startTime,
                timestamp: Date.now()
            });

            return response;
        } catch (error) {
            console.error('Calendar operation error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            return {
                id: `calendar_error_${Date.now()}`,
                sessionId: '',
                type: 'error',
                content: `Calendar operation failed: ${errorMessage}`,
                timestamp: Date.now()
            };
        }
    }

    async getCalendarEvents(
        startDate: Date,
        endDate: Date
    ): Promise<CalendarEvent[]> {
        try {
            if (!this.config.calendarIntegration) {
                throw new Error('Calendar integration is disabled');
            }

            // Mock calendar events for demonstration
            const events: CalendarEvent[] = [
                {
                    id: 'event_1',
                    title: 'METU Development Meeting',
                    description: 'Weekly development sync',
                    startTime: new Date(),
                    endTime: new Date(Date.now() + 3600000),
                    attendees: ['team@codai.com'],
                    location: 'Virtual'
                }
            ];

            this.emit('calendarEventsRetrieved', {
                count: events.length,
                startDate,
                endDate,
                timestamp: Date.now()
            });

            return events;
        } catch (error) {
            console.error('Calendar retrieval error:', error);
            return [];
        }
    }

    // Task Management
    async createTask(task: TaskItem): Promise<VoiceResponse> {
        try {
            const taskId = `task_${Date.now()}`;
            const createdTask = { ...task, id: taskId };

            const response: VoiceResponse = {
                id: `task_${Date.now()}`,
                sessionId: '',
                type: 'action',
                content: `Task "${task.title}" created with ${task.priority} priority`,
                metadata: {
                    taskId,
                    task: createdTask,
                    type: 'task_create'
                },
                timestamp: Date.now()
            };

            this.emit('taskCreated', {
                taskId,
                title: task.title,
                priority: task.priority,
                timestamp: Date.now()
            });

            return response;
        } catch (error) {
            console.error('Task creation error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            return {
                id: `task_error_${Date.now()}`,
                sessionId: '',
                type: 'error',
                content: `Task creation failed: ${errorMessage}`,
                timestamp: Date.now()
            };
        }
    }

    async getTasks(filter?: {
        priority?: string;
        category?: string;
        completed?: boolean;
    }): Promise<TaskItem[]> {
        try {
            // Mock tasks for demonstration
            let tasks: TaskItem[] = [
                {
                    id: 'task_1',
                    title: 'Complete Phase 5 Implementation',
                    description: 'Finish advanced features and system integration',
                    priority: 'high',
                    dueDate: new Date(Date.now() + 86400000),
                    category: 'development',
                    completed: false,
                    tags: ['metu', 'phase5']
                },
                {
                    id: 'task_2',
                    title: 'Update Documentation',
                    description: 'Document new voice features and system integration',
                    priority: 'medium',
                    category: 'documentation',
                    completed: false,
                    tags: ['docs', 'voice']
                }
            ];

            // Apply filters
            if (filter) {
                if (filter.priority) {
                    tasks = tasks.filter(t => t.priority === filter.priority);
                }
                if (filter.category) {
                    tasks = tasks.filter(t => t.category === filter.category);
                }
                if (filter.completed !== undefined) {
                    tasks = tasks.filter(t => t.completed === filter.completed);
                }
            }

            this.emit('tasksRetrieved', {
                count: tasks.length,
                filter,
                timestamp: Date.now()
            });

            return tasks;
        } catch (error) {
            console.error('Task retrieval error:', error);
            return [];
        }
    }

    // Email Integration
    async sendEmail(email: EmailMessage): Promise<VoiceResponse> {
        try {
            if (!this.config.emailIntegration) {
                throw new Error('Email integration is disabled');
            }

            // In a real implementation, this would integrate with email APIs
            const emailId = `email_${Date.now()}`;

            const response: VoiceResponse = {
                id: `email_${Date.now()}`,
                sessionId: '',
                type: 'action',
                content: `Email sent successfully to ${email.to.join(', ')}`,
                metadata: {
                    emailId,
                    recipients: email.to.length,
                    subject: email.subject,
                    type: 'email_send'
                },
                timestamp: Date.now()
            };

            this.emit('emailSent', {
                emailId,
                to: email.to,
                subject: email.subject,
                timestamp: Date.now()
            });

            return response;
        } catch (error) {
            console.error('Email sending error:', error);
            const errorMessage = this.getErrorMessage(error);

            return {
                id: `email_error_${Date.now()}`,
                sessionId: '',
                type: 'error',
                content: `Email sending failed: ${errorMessage}`,
                timestamp: Date.now()
            };
        }
    }

    // Development Tools Integration
    async executeDevelopmentAction(action: DevelopmentAction): Promise<VoiceResponse> {
        try {
            if (!this.config.developmentToolsAccess) {
                throw new Error('Development tools access is disabled');
            }

            const startTime = Date.now();
            let result: any;

            switch (action.type) {
                case 'build':
                    result = await this.executeBuild(action);
                    break;
                case 'test':
                    result = await this.executeTests(action);
                    break;
                case 'deploy':
                    result = await this.executeDeploy(action);
                    break;
                case 'debug':
                    result = await this.startDebugSession(action);
                    break;
                case 'analyze':
                    result = await this.analyzeCode(action);
                    break;
                case 'format':
                    result = await this.formatCode(action);
                    break;
                case 'commit':
                    result = await this.commitChanges(action);
                    break;
                default:
                    throw new Error(`Unsupported development action: ${action.type}`);
            }

            const response: VoiceResponse = {
                id: `dev_${Date.now()}`,
                sessionId: '',
                type: 'action',
                content: `Development action '${action.type}' completed successfully`,
                metadata: {
                    action: action.type,
                    result: result,
                    project: action.project
                },
                timestamp: Date.now(),
                processingTime: Date.now() - startTime
            };

            this.emit('developmentActionCompleted', {
                action: action.type,
                project: action.project,
                success: true,
                timestamp: Date.now()
            });

            return response;
        } catch (error) {
            console.error('Development action error:', error);

            return {
                id: `dev_error_${Date.now()}`,
                sessionId: '',
                type: 'error',
                content: `Development action failed: ${getErrorMessage(error)}`,
                metadata: {
                    action: action.type,
                    error: getErrorMessage(error)
                },
                timestamp: Date.now()
            };
        }
    }

    // System Status and Monitoring
    async getSystemStatus(): Promise<{
        integrations: Record<string, boolean>;
        health: 'healthy' | 'warning' | 'error';
        uptime: number;
        lastActivity: number;
    }> {
        return {
            integrations: {
                fileSystem: this.config.fileSystemAccess,
                calendar: this.config.calendarIntegration,
                email: this.config.emailIntegration,
                developmentTools: this.config.developmentToolsAccess
            },
            health: this.isActive ? 'healthy' : 'error',
            uptime: this.isActive ? Date.now() - (this.commandHistory[0]?.timestamp || Date.now()) : 0,
            lastActivity: this.commandHistory[this.commandHistory.length - 1]?.timestamp || 0
        };
    }

    async startSystemIntegration(): Promise<void> {
        if (this.isActive) {
            return;
        }

        try {
            this.isActive = true;

            // Initialize enabled integrations
            for (const integration of this.config.enabledIntegrations) {
                await this.initializeIntegration(integration);
                this.integratedSystems.add(integration);
            }

            this.emit('systemIntegrationStarted', {
                enabledIntegrations: Array.from(this.integratedSystems),
                timestamp: Date.now()
            });

            console.log('✅ System Integration Service started successfully');
        } catch (error) {
            console.error('❌ Error starting System Integration Service:', error);
            this.isActive = false;
            throw error;
        }
    }

    async stopSystemIntegration(): Promise<void> {
        if (!this.isActive) {
            return;
        }

        try {
            this.isActive = false;
            this.integratedSystems.clear();

            this.emit('systemIntegrationStopped', {
                timestamp: Date.now()
            });

            console.log('✅ System Integration Service stopped successfully');
        } catch (error) {
            console.error('❌ Error stopping System Integration Service:', error);
            throw error;
        }
    }

    // Private Helper Methods
    private async readFile(filePath: string): Promise<string> {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            return content;
        } catch (error) {
            throw new Error(`Failed to read file: ${getErrorMessage(error)}`);
        }
    }

    private async writeFile(filePath: string, content: string): Promise<void> {
        try {
            await fs.writeFile(filePath, content, 'utf-8');
        } catch (error) {
            throw new Error(`Failed to write file: ${getErrorMessage(error)}`);
        }
    }

    private async deleteFile(filePath: string): Promise<void> {
        try {
            await fs.unlink(filePath);
        } catch (error) {
            throw new Error(`Failed to delete file: ${getErrorMessage(error)}`);
        }
    }

    private async moveFile(source: string, destination: string): Promise<void> {
        try {
            await fs.rename(source, destination);
        } catch (error) {
            throw new Error(`Failed to move file: ${getErrorMessage(error)}`);
        }
    }

    private async copyFile(source: string, destination: string): Promise<void> {
        try {
            await fs.copyFile(source, destination);
        } catch (error) {
            throw new Error(`Failed to copy file: ${getErrorMessage(error)}`);
        }
    }

    private async searchFiles(directory: string, pattern: string): Promise<string[]> {
        try {
            const files = await fs.readdir(directory);
            return files.filter(file => file.includes(pattern));
        } catch (error) {
            throw new Error(`Failed to search files: ${getErrorMessage(error)}`);
        }
    }

    private async createDirectory(dirPath: string): Promise<void> {
        try {
            await fs.mkdir(dirPath, { recursive: true });
        } catch (error) {
            throw new Error(`Failed to create directory: ${getErrorMessage(error)}`);
        }
    }

    private async executeBuild(action: DevelopmentAction): Promise<any> {
        // Mock build execution
        return { success: true, buildTime: '2.3s', target: action.target };
    }

    private async executeTests(action: DevelopmentAction): Promise<any> {
        // Mock test execution
        return { success: true, passed: 15, failed: 0, duration: '1.2s' };
    }

    private async executeDeploy(action: DevelopmentAction): Promise<any> {
        // Mock deployment
        return { success: true, environment: action.target, deployId: `deploy_${Date.now()}` };
    }

    private async startDebugSession(action: DevelopmentAction): Promise<any> {
        // Mock debug session start
        return { success: true, debugPort: 9229, sessionId: `debug_${Date.now()}` };
    }

    private async analyzeCode(action: DevelopmentAction): Promise<any> {
        // Mock code analysis
        return {
            success: true,
            issues: 2,
            warnings: 5,
            suggestions: 8,
            coverage: '85%'
        };
    }

    private async formatCode(action: DevelopmentAction): Promise<any> {
        // Mock code formatting
        return { success: true, filesFormatted: 12, linesChanged: 156 };
    }

    private async commitChanges(action: DevelopmentAction): Promise<any> {
        // Mock git commit
        return {
            success: true,
            commitHash: `abc123${Date.now().toString().slice(-4)}`,
            filesChanged: 5
        };
    }

    private async initializeIntegration(integration: string): Promise<void> {
        // Initialize specific integrations
        console.log(`🔧 Initialized ${integration} integration`);
    }
}

// Export default configuration
export const defaultSystemIntegrationConfig: SystemIntegrationConfig = {
    enabledIntegrations: ['fileSystem', 'developmentTools', 'calendar', 'tasks'],
    fileSystemAccess: true,
    developmentToolsAccess: true,
    calendarIntegration: true,
    emailIntegration: false, // Disabled by default for security
    securityLevel: 'enhanced',
    confirmationRequired: true
};
