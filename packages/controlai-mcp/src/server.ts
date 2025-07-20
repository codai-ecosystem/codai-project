#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListResourcesRequestSchema,
    ListToolsRequestSchema,
    ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import express from 'express';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

import { DatabaseService } from './database/DatabaseService.js';
import { AIService } from './ai/AIService.js';
import { CoordinationService } from './coordination/CoordinationService.js';
import {
    Project,
    Task,
    Agent,
    TaskStatus,
    AgentStatus,
    ProjectStatus,
    Priority,
    TaskCategory,
    AgentType,
    AgentCapability,
    WebSocketMessage,
    MessageType,
    ControlAIConfig
} from './types/index.js';

// Load environment variables
dotenv.config({ path: process.env.DOTENV_CONFIG_PATH });

// Configuration
const config: ControlAIConfig = {
    server: {
        port: parseInt(process.env.CONTROLAI_PORT || '7001'),
        host: process.env.CONTROLAI_HOST || 'localhost',
        cors: {
            origin: process.env.CONTROLAI_CORS_ORIGIN || '*',
        },
    },
    database: {
        path: process.env.CONTROLAI_DATABASE_PATH || undefined,
    },
    ai: {
        provider: 'azure-openai',
        endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
        apiKey: process.env.AZURE_OPENAI_API_KEY || '',
        deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o',
    },
    websocket: {
        enabled: process.env.CONTROLAI_WEBSOCKET_ENABLED === 'true' || false,
        heartbeatInterval: 30000,
    },
};

/**
 * Enterprise AI Project Management MCP Server
 * 
 * Provides intelligent task management, multi-agent coordination,
 * and real-time project monitoring capabilities.
 */
class ControlAIMCPServer {
    private server: Server;
    private database: DatabaseService;
    private aiService: AIService;
    private coordinationService: CoordinationService;
    private httpServer?: express.Application;
    private wsServer?: WebSocketServer;
    private clients: Set<any> = new Set();

    constructor() {
        this.server = new Server(
            {
                name: 'controlai-mcp',
                version: '1.0.0',
            },
            {
                capabilities: {
                    resources: {},
                    tools: {},
                },
            }
        );

        this.database = new DatabaseService();
        this.aiService = new AIService();
        this.coordinationService = new CoordinationService(this.database, this.aiService);

        this.setupHandlers();
    }

    private setupHandlers() {
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'create_project',
                        description: 'Create a new project with intelligent analysis and task breakdown',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                name: { type: 'string', description: 'Project name' },
                                description: { type: 'string', description: 'Detailed project description' },
                                priority: {
                                    type: 'string',
                                    enum: Object.values(Priority),
                                    description: 'Project priority level'
                                },
                                tags: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    description: 'Project tags for organization'
                                }
                            },
                            required: ['name', 'description'],
                        },
                    },
                    {
                        name: 'analyze_plan',
                        description: 'Intelligently analyze a project plan and break it down into tasks',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                projectId: { type: 'string', description: 'Project ID to analyze' },
                                plan: { type: 'string', description: 'Natural language project plan description' },
                            },
                            required: ['projectId', 'plan'],
                        },
                    },
                    {
                        name: 'get_project_status',
                        description: 'Get comprehensive status of a project including tasks and agent assignments',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                projectId: { type: 'string', description: 'Project ID to get status for' },
                            },
                            required: ['projectId'],
                        },
                    },
                    {
                        name: 'assign_task',
                        description: 'Intelligently assign a task to the most suitable agent',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                taskId: { type: 'string', description: 'Task ID to assign' },
                                agentId: { type: 'string', description: 'Specific agent ID (optional for manual assignment)' },
                            },
                            required: ['taskId'],
                        },
                    },
                    {
                        name: 'register_agent',
                        description: 'Register a new AI agent with the coordination system',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                name: { type: 'string', description: 'Agent name' },
                                type: {
                                    type: 'string',
                                    enum: Object.values(AgentType),
                                    description: 'Agent type'
                                },
                                capabilities: {
                                    type: 'array',
                                    items: {
                                        type: 'string',
                                        enum: Object.values(AgentCapability)
                                    },
                                    description: 'Agent capabilities'
                                },
                                workspaceId: { type: 'string', description: 'Workspace identifier' },
                                maxConcurrentTasks: { type: 'number', description: 'Maximum concurrent tasks', default: 1 },
                            },
                            required: ['name', 'type', 'capabilities', 'workspaceId'],
                        },
                    },
                    {
                        name: 'get_dashboard_data',
                        description: 'Get real-time dashboard data for project monitoring',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                workspaceId: { type: 'string', description: 'Workspace ID to get data for' },
                            },
                            required: ['workspaceId'],
                        },
                    },
                    {
                        name: 'update_task_status',
                        description: 'Update task status with intelligent notifications',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                taskId: { type: 'string', description: 'Task ID to update' },
                                status: {
                                    type: 'string',
                                    enum: Object.values(TaskStatus),
                                    description: 'New task status'
                                },
                                actualHours: { type: 'number', description: 'Actual hours spent (for completed tasks)' },
                                notes: { type: 'string', description: 'Status update notes' },
                            },
                            required: ['taskId', 'status'],
                        },
                    },
                ],
            };
        });

        // Handle tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            try {
                switch (name) {
                    case 'create_project': {
                        const project = await this.handleCreateProject(args);
                        return { content: [{ type: 'text', text: JSON.stringify(project, null, 2) }] };
                    }

                    case 'analyze_plan': {
                        const analysis = await this.handleAnalyzePlan(args);
                        return { content: [{ type: 'text', text: JSON.stringify(analysis, null, 2) }] };
                    }

                    case 'get_project_status': {
                        const status = await this.handleGetProjectStatus(args);
                        return { content: [{ type: 'text', text: JSON.stringify(status, null, 2) }] };
                    }

                    case 'assign_task': {
                        const assignment = await this.handleAssignTask(args);
                        return { content: [{ type: 'text', text: JSON.stringify(assignment, null, 2) }] };
                    }

                    case 'register_agent': {
                        const agent = await this.handleRegisterAgent(args);
                        return { content: [{ type: 'text', text: JSON.stringify(agent, null, 2) }] };
                    }

                    case 'get_dashboard_data': {
                        const dashboard = await this.handleGetDashboardData(args);
                        return { content: [{ type: 'text', text: JSON.stringify(dashboard, null, 2) }] };
                    }

                    case 'update_task_status': {
                        const result = await this.handleUpdateTaskStatus(args);
                        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
                    }

                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                return {
                    content: [{
                        type: 'text',
                        text: `Error executing ${name}: ${errorMessage}`
                    }],
                    isError: true
                };
            }
        });

        // List resources
        this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
            return {
                resources: [
                    {
                        uri: 'controlai://projects',
                        mimeType: 'application/json',
                        name: 'All Projects',
                        description: 'List of all projects in the system',
                    },
                    {
                        uri: 'controlai://agents',
                        mimeType: 'application/json',
                        name: 'All Agents',
                        description: 'List of all registered agents',
                    },
                    {
                        uri: 'controlai://tasks/available',
                        mimeType: 'application/json',
                        name: 'Available Tasks',
                        description: 'Tasks available for assignment',
                    },
                ],
            };
        });

        // Read resources
        this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
            const { uri } = request.params;

            switch (uri) {
                case 'controlai://projects': {
                    const projects = await this.database.getAllProjects();
                    return {
                        contents: [
                            {
                                uri,
                                mimeType: 'application/json',
                                text: JSON.stringify(projects, null, 2),
                            },
                        ],
                    };
                }

                case 'controlai://agents': {
                    const agents = await this.database.getAllAgents();
                    return {
                        contents: [
                            {
                                uri,
                                mimeType: 'application/json',
                                text: JSON.stringify(agents, null, 2),
                            },
                        ],
                    };
                }

                case 'controlai://tasks/available': {
                    const tasks = await this.database.getAvailableTasks();
                    return {
                        contents: [
                            {
                                uri,
                                mimeType: 'application/json',
                                text: JSON.stringify(tasks, null, 2),
                            },
                        ],
                    };
                }

                default:
                    throw new Error(`Unknown resource: ${uri}`);
            }
        });
    }

    // Tool handlers
    private async handleCreateProject(args: any): Promise<Project> {
        const { name, description, priority = Priority.MEDIUM, tags = [] } = args;

        const project: Omit<Project, 'createdAt' | 'updatedAt'> = {
            id: uuidv4(),
            name,
            description,
            status: ProjectStatus.PLANNING,
            priority,
            tags,
            metadata: {}
        };

        const createdProject = await this.database.createProject(project);

        // Broadcast project creation
        this.broadcast({
            type: MessageType.PROJECT_CREATED,
            payload: createdProject,
            timestamp: new Date()
        });

        return createdProject;
    }

    private async handleAnalyzePlan(args: any) {
        const { projectId, plan } = args;

        const project = await this.database.getProject(projectId);
        if (!project) {
            throw new Error(`Project ${projectId} not found`);
        }

        // Use AI service to analyze the plan and create tasks
        const analysis = await this.aiService.analyzePlan(plan);
        const tasks: Task[] = [];

        for (const taskSuggestion of analysis.suggestedTasks) {
            const task: Omit<Task, 'createdAt' | 'updatedAt'> = {
                id: uuidv4(),
                projectId,
                title: taskSuggestion.title,
                description: taskSuggestion.description,
                status: TaskStatus.TODO,
                priority: taskSuggestion.priority,
                category: taskSuggestion.category,
                estimatedHours: taskSuggestion.estimatedHours,
                dependencies: [],
                tags: taskSuggestion.tags || [],
                metadata: {
                    aiGenerated: true,
                    confidence: taskSuggestion.confidence
                }
            };

            const createdTask = await this.database.createTask(task);
            tasks.push(createdTask);
        }

        // Update project status to active if it was in planning
        if (project.status === ProjectStatus.PLANNING) {
            await this.database.updateProject(projectId, { status: ProjectStatus.ACTIVE });
        }

        // Broadcast plan analysis completion
        this.broadcast({
            type: MessageType.PLAN_ANALYZED,
            payload: { projectId, analysis, tasks },
            timestamp: new Date()
        });

        return { analysis, tasks };
    }

    private async handleGetProjectStatus(args: any) {
        const { projectId } = args;

        const project = await this.database.getProject(projectId);
        if (!project) {
            throw new Error(`Project ${projectId} not found`);
        }

        const tasks = await this.database.getTasksByProject(projectId);

        // Calculate project metrics
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter((t: Task) => t.status === TaskStatus.COMPLETED).length;
        const inProgressTasks = tasks.filter((t: Task) => t.status === TaskStatus.IN_PROGRESS).length;
        const todoTasks = tasks.filter((t: Task) => t.status === TaskStatus.TODO).length;
        const blockedTasks = tasks.filter((t: Task) => t.status === TaskStatus.BLOCKED).length;

        const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        const totalEstimated = tasks.reduce((sum: number, task: Task) => sum + (task.estimatedHours || 0), 0);
        const totalActual = tasks.reduce((sum: number, task: Task) => sum + (task.actualHours || 0), 0);

        return {
            project,
            tasks,
            metrics: {
                totalTasks,
                completedTasks,
                inProgressTasks,
                todoTasks,
                blockedTasks,
                progress: Math.round(progress * 100) / 100,
                totalEstimatedHours: totalEstimated,
                totalActualHours: totalActual
            }
        };
    }

    private async handleAssignTask(args: any) {
        const { taskId, agentId } = args;

        const task = await this.database.getTask(taskId);
        if (!task) {
            throw new Error(`Task ${taskId} not found`);
        }

        let targetAgent: Agent | null = null;

        if (agentId) {
            // Manual assignment to specific agent
            targetAgent = await this.database.getAgent(agentId);
            if (!targetAgent) {
                throw new Error(`Agent ${agentId} not found`);
            }
        } else {
            // Use coordination service for intelligent assignment
            const suggestion = await this.coordinationService.suggestTaskAssignment(taskId);
            if (suggestion.suggestedAgent) {
                targetAgent = await this.database.getAgent(suggestion.suggestedAgent.id);
            }
        }

        if (!targetAgent) {
            throw new Error('No suitable agent found for task assignment');
        }

        // Update task assignment
        await this.database.updateTask(taskId, {
            assignedAgentId: targetAgent.id,
            status: TaskStatus.ASSIGNED
        });

        // Update agent current task
        await this.database.updateAgent(targetAgent.id, {
            currentTaskId: taskId,
            status: AgentStatus.BUSY
        });

        const assignment = {
            taskId,
            agentId: targetAgent.id,
            agentName: targetAgent.name,
            assignedAt: new Date()
        };

        // Broadcast task assignment
        this.broadcast({
            type: MessageType.TASK_ASSIGNED,
            payload: assignment,
            timestamp: new Date()
        });

        return assignment;
    }

    private async handleRegisterAgent(args: any): Promise<Agent> {
        const {
            name,
            type,
            capabilities,
            workspaceId,
            maxConcurrentTasks = 1
        } = args;

        const agent: Omit<Agent, 'createdAt' | 'lastActiveAt'> = {
            id: uuidv4(),
            name,
            type,
            capabilities,
            status: AgentStatus.AVAILABLE,
            workspaceId,
            maxConcurrentTasks,
            performance: {
                tasksCompleted: 0,
                averageCompletionTime: 0,
                qualityScore: 100,
                reliabilityScore: 100,
                efficiencyScore: 100,
                successRate: 100,
                lastUpdated: new Date()
            },
            metadata: {}
        };

        const registeredAgent = await this.database.registerAgent(agent);

        // Broadcast agent registration
        this.broadcast({
            type: MessageType.AGENT_REGISTERED,
            payload: registeredAgent,
            timestamp: new Date()
        });

        return registeredAgent;
    }

    private async handleGetDashboardData(args: any) {
        const { workspaceId } = args;

        const agents = await this.database.getAllAgents();
        const workspaceAgents = agents.filter((a: Agent) => a.workspaceId === workspaceId);

        const projects = await this.database.getAllProjects();
        const availableTasks = await this.database.getAvailableTasks();

        // Calculate workspace metrics
        const activeAgents = workspaceAgents.filter((a: Agent) => a.status !== AgentStatus.OFFLINE).length;
        const busyAgents = workspaceAgents.filter((a: Agent) => a.status === AgentStatus.BUSY).length;
        const availableAgents = workspaceAgents.filter((a: Agent) => a.status === AgentStatus.AVAILABLE).length;

        const activeProjects = projects.filter((p: Project) => p.status === ProjectStatus.ACTIVE).length;
        const completedProjects = projects.filter((p: Project) => p.status === ProjectStatus.COMPLETED).length;

        return {
            workspaceId,
            metrics: {
                totalAgents: workspaceAgents.length,
                activeAgents,
                busyAgents,
                availableAgents,
                totalProjects: projects.length,
                activeProjects,
                completedProjects,
                availableTasks: availableTasks.length
            },
            agents: workspaceAgents,
            recentProjects: projects.slice(0, 10),
            availableTasks: availableTasks.slice(0, 20)
        };
    }

    private async handleUpdateTaskStatus(args: any) {
        const { taskId, status, actualHours, notes } = args;

        const task = await this.database.getTask(taskId);
        if (!task) {
            throw new Error(`Task ${taskId} not found`);
        }

        const updates: Partial<Task> = { status };

        if (status === TaskStatus.IN_PROGRESS && !task.startedAt) {
            updates.startedAt = new Date();
        }

        if (status === TaskStatus.COMPLETED) {
            updates.completedAt = new Date();
            if (actualHours !== undefined) {
                updates.actualHours = actualHours;
            }
        }

        const updatedTask = await this.database.updateTask(taskId, updates);

        // Update agent status if task is completed
        if (status === TaskStatus.COMPLETED && task.assignedAgentId) {
            const agent = await this.database.getAgent(task.assignedAgentId);
            if (agent) {
                // Update agent performance metrics
                const newTasksCompleted = agent.performance.tasksCompleted + 1;
                const completionTime = actualHours || task.estimatedHours || 0;
                const avgTime = (agent.performance.averageCompletionTime * agent.performance.tasksCompleted + completionTime) / newTasksCompleted;

                await this.database.updateAgent(task.assignedAgentId, {
                    status: AgentStatus.AVAILABLE,
                    currentTaskId: undefined,
                    performance: {
                        ...agent.performance,
                        tasksCompleted: newTasksCompleted,
                        averageCompletionTime: avgTime,
                        lastUpdated: new Date()
                    }
                });
            }
        }

        const result = {
            task: updatedTask,
            notes,
            updatedAt: new Date()
        };

        // Broadcast task status update
        this.broadcast({
            type: MessageType.TASK_STATUS_UPDATED,
            payload: result,
            timestamp: new Date()
        });

        return result;
    }

    // WebSocket broadcasting
    private broadcast(message: WebSocketMessage) {
        if (!this.wsServer || this.clients.size === 0) return;

        const messageStr = JSON.stringify(message);
        this.clients.forEach(client => {
            if (client.readyState === 1) { // WebSocket.OPEN
                client.send(messageStr);
            }
        });
    }

    // Initialize HTTP server with WebSocket support
    private async startHTTPServer() {
        if (!config.server.port) return;

        this.httpServer = express();
        this.httpServer.use(cors(config.server.cors));
        this.httpServer.use(express.json());

        // Health check endpoint
        this.httpServer.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                service: 'controlai-mcp',
                version: '1.0.0',
                timestamp: new Date().toISOString()
            });
        });

        // Start HTTP server only if not in pure MCP mode
        const isMCPMode = process.argv.includes('--mcp') || process.stdin.isTTY === false;

        if (!isMCPMode) {
            try {
                const server = this.httpServer.listen(config.server.port, config.server.host, () => {
                    console.log(`ControlAI MCP Server running on http://${config.server.host}:${config.server.port}`);
                });

                server.on('error', (error: NodeJS.ErrnoException) => {
                    if (error.code === 'EADDRINUSE') {
                        console.warn(`Port ${config.server.port} is in use, continuing with MCP-only mode`);
                    } else {
                        console.error('HTTP Server error:', error);
                    }
                });

                // Set up WebSocket server
                if (config.websocket.enabled) {
                    this.wsServer = new WebSocketServer({ server });

                    this.wsServer.on('connection', (ws) => {
                        console.log('WebSocket client connected');
                        this.clients.add(ws);

                        ws.on('close', () => {
                            console.log('WebSocket client disconnected');
                            this.clients.delete(ws);
                        });

                        ws.on('error', (error) => {
                            console.error('WebSocket error:', error);
                            this.clients.delete(ws);
                        });

                        // Send initial connection message
                        ws.send(JSON.stringify({
                            type: MessageType.CONNECTION_ESTABLISHED,
                            payload: { message: 'Connected to ControlAI MCP' },
                            timestamp: new Date()
                        }));
                    });

                    // Heartbeat to keep connections alive
                    setInterval(() => {
                        this.broadcast({
                            type: MessageType.HEARTBEAT,
                            payload: { timestamp: Date.now() },
                            timestamp: new Date()
                        });
                    }, config.websocket.heartbeatInterval);
                }
            } catch (error) {
                console.warn('Failed to start HTTP/WebSocket server, continuing with MCP-only mode:', error);
            }
        } else {
            console.log('Running in MCP-only mode (no HTTP/WebSocket server)');
        }
    }

    async start() {
        try {
            console.log('Initializing ControlAI MCP Server...');

            // Initialize database
            await this.database.initialize();
            console.log('Database initialized successfully');

            // Start HTTP server if port is configured and not in MCP-only mode
            const isMCPMode = process.argv.includes('--mcp') || process.stdin.isTTY === false;
            if (config.server.port && !isMCPMode) {
                try {
                    await this.startHTTPServer();
                } catch (error) {
                    console.warn('HTTP server startup failed, continuing with MCP-only mode:', error);
                }
            } else if (isMCPMode) {
                console.log('Running in MCP-only mode');
            }

            // Start MCP server transport
            const transport = new StdioServerTransport();
            await this.server.connect(transport);

            console.log('ControlAI MCP Server started successfully');
            console.log('Configuration:');
            console.log(`- Database: ${config.database.path || 'Default location'}`);
            console.log(`- AI Provider: ${config.ai.provider}`);
            console.log(`- HTTP Server: ${config.server.port ? `http://${config.server.host}:${config.server.port}` : 'Disabled'}`);
            console.log(`- WebSocket: ${config.websocket.enabled ? 'Enabled' : 'Disabled'}`);

        } catch (error) {
            console.error('Failed to start ControlAI MCP Server:', error);
            process.exit(1);
        }
    }

    async shutdown() {
        console.log('Shutting down ControlAI MCP Server...');

        if (this.database) {
            await this.database.close();
        }

        if (this.wsServer) {
            this.wsServer.close();
        }

        console.log('ControlAI MCP Server shut down complete');
    }
}

// Handle graceful shutdown
let server: ControlAIMCPServer | null = null;

process.on('SIGINT', async () => {
    if (server) {
        await server.shutdown();
    }
    process.exit(0);
});

process.on('SIGTERM', async () => {
    if (server) {
        await server.shutdown();
    }
    process.exit(0);
});

// Check command line arguments
const args = process.argv.slice(2);
const isHelpMode = args.includes('--help') || args.includes('-h');

if (isHelpMode) {
    console.log(`
🤖 ControlAI MCP Server v1.0.1

Enterprise AI Project Management MCP Server for multi-agent coordination

USAGE:
  controlai-mcp                 Start the MCP server
  controlai-mcp --help         Show this help message

FEATURES:
  🎯 Intelligent project creation with AI analysis
  📊 Dynamic task breakdown and assignment
  🤝 Multi-agent coordination and conflict resolution  
  📈 Real-time dashboard and progress tracking
  🔧 Enterprise-grade SQLite persistence
  ⚡ WebSocket real-time updates

MCP TOOLS:
  create_project              Create projects with intelligent analysis
  analyze_plan               Break down project plans into tasks
  assign_task                Intelligently assign tasks to agents
  get_project_status         Get comprehensive project status
  update_task_status         Update task status with notifications
  register_agent             Register new AI agents
  get_dashboard_data         Get real-time dashboard data

ENVIRONMENT VARIABLES:
  AZURE_OPENAI_API_KEY       Azure OpenAI API key
  AZURE_OPENAI_ENDPOINT      Azure OpenAI endpoint URL
  AZURE_OPENAI_DEPLOYMENT_NAME  Deployment name (default: gpt-4o)
  AZURE_OPENAI_API_VERSION   API version (default: 2024-02-01)
  DOTENV_CONFIG_PATH         Path to .env file (optional)

For more information: https://github.com/codai-ecosystem/codai-project
  `);
    process.exit(0);
} else {
    // Start the server only if not in help mode
    server = new ControlAIMCPServer();
    server.start().catch(error => {
        console.error('Fatal error starting server:', error);
        process.exit(1);
    });
}
