import { CBDDatabaseAdapter } from './CBDDatabaseAdapter.js';
import { spawn, ChildProcess } from 'child_process';
import { join } from 'path';
import {
    Project,
    Task,
    Agent,
    ProjectStatus,
    TaskStatus,
    AgentStatus
} from '../types/index.js';

/**
 * Local in-memory database for fallback when CBD is not available
 */
class LocalMemoryDatabase {
    private projects: Map<string, Project> = new Map();
    private tasks: Map<string, Task> = new Map();
    private agents: Map<string, Agent> = new Map();

    async createProject(project: Project): Promise<Project> {
        this.projects.set(project.id, project);
        return project;
    }

    async getProject(id: string): Promise<Project | null> {
        return this.projects.get(id) || null;
    }

    async createTask(task: Task): Promise<Task> {
        this.tasks.set(task.id, task);
        return task;
    }

    async getTask(id: string): Promise<Task | null> {
        return this.tasks.get(id) || null;
    }

    async createAgent(agent: Agent): Promise<Agent> {
        this.agents.set(agent.id, agent);
        return agent;
    }

    async getAgent(id: string): Promise<Agent | null> {
        return this.agents.get(id) || null;
    }

    async getProjectTasks(projectId: string): Promise<Task[]> {
        return Array.from(this.tasks.values()).filter(task => task.projectId === projectId);
    }

    async getAgents(): Promise<Agent[]> {
        return Array.from(this.agents.values());
    }

    async updateTask(task: Task): Promise<Task> {
        this.tasks.set(task.id, task);
        return task;
    }

    async getProjects(): Promise<Project[]> {
        return Array.from(this.projects.values());
    }

    async deleteProject(id: string): Promise<boolean> {
        return this.projects.delete(id);
    }

    async deleteTask(id: string): Promise<boolean> {
        return this.tasks.delete(id);
    }

    async deleteAgent(id: string): Promise<boolean> {
        return this.agents.delete(id);
    }

    async updateProject(project: Project): Promise<Project> {
        this.projects.set(project.id, project);
        return project;
    }

    async updateAgent(agent: Agent): Promise<Agent> {
        this.agents.set(agent.id, agent);
        return agent;
    }

    // Helper method to get tasks for local search
    getTasks(): Task[] {
        return Array.from(this.tasks.values());
    }
}

/**
 * Database Service for ControlAI MCP
 * 
 * Automatically manages CBD service startup and connectivity.
 * Falls back to local in-memory storage if CBD unavailable.
 */
export class DatabaseService {
    private adapter: CBDDatabaseAdapter;
    private localDb: LocalMemoryDatabase;
    private isInitialized = false;
    private cbdProcess: ChildProcess | null = null;
    private maxRetries = 3;
    private retryDelay = 2000; // 2 seconds
    private useCBD = false;

    constructor(cbdUrl?: string) {
        this.adapter = new CBDDatabaseAdapter(cbdUrl);
        this.localDb = new LocalMemoryDatabase();
    }

    async initialize(): Promise<void> {
        try {
            console.log('[ControlAI] Initializing database connection...');

            // First, try to connect to existing CBD service
            let isConnected = await this.adapter.testConnection();

            if (!isConnected) {
                console.log('[ControlAI] CBD service not available, attempting to start local service...');

                // Try to start local CBD service
                const serviceStarted = await this.startCBDService();

                if (serviceStarted) {
                    // Wait a moment for service to initialize
                    await this.sleep(3000);

                    // Retry connection with backoff
                    isConnected = await this.retryConnection();
                } else {
                    console.log('[ControlAI] Failed to start CBD service, using local fallback mode');
                }
            }

            if (isConnected) {
                console.log('[ControlAI] CBD database connection established successfully');
                this.useCBD = true;
            } else {
                console.log('[ControlAI] Using local in-memory database (fallback mode)');
                this.useCBD = false;
            }

            this.isInitialized = true;
        } catch (error) {
            console.warn('[ControlAI] Database initialization warning:', error);
            console.log('[ControlAI] Continuing with local in-memory database');
            this.useCBD = false;
            this.isInitialized = true;
        }
    }

    private async startCBDService(): Promise<boolean> {
        try {
            const cbdPackagePath = process.env.CBD_PACKAGE_PATH || this.findCBDPackage();

            if (!cbdPackagePath) {
                console.log('[ControlAI] CBD package not found locally, checking npm...');
                return await this.startCBDViaNPM();
            }

            console.log('[ControlAI] Starting local CBD service...');

            this.cbdProcess = spawn('npm', ['run', 'service'], {
                cwd: cbdPackagePath,
                stdio: ['ignore', 'pipe', 'pipe'],
                shell: true,
                detached: false
            });

            if (this.cbdProcess.stdout) {
                this.cbdProcess.stdout.on('data', (data) => {
                    console.log(`[CBD] ${data.toString().trim()}`);
                });
            }

            if (this.cbdProcess.stderr) {
                this.cbdProcess.stderr.on('data', (data) => {
                    console.error(`[CBD] ${data.toString().trim()}`);
                });
            }

            this.cbdProcess.on('exit', (code) => {
                console.log(`[CBD] Service exited with code ${code}`);
                this.cbdProcess = null;
            });

            return true;
        } catch (error) {
            console.error('[ControlAI] Failed to start CBD service:', error);
            return false;
        }
    }

    private async startCBDViaNPM(): Promise<boolean> {
        try {
            console.log('[ControlAI] Starting CBD service via npm...');

            this.cbdProcess = spawn('npx', ['cbd-service'], {
                stdio: ['ignore', 'pipe', 'pipe'],
                shell: true,
                detached: false
            });

            if (this.cbdProcess.stdout) {
                this.cbdProcess.stdout.on('data', (data) => {
                    console.log(`[CBD-NPX] ${data.toString().trim()}`);
                });
            }

            if (this.cbdProcess.stderr) {
                this.cbdProcess.stderr.on('data', (data) => {
                    console.error(`[CBD-NPX] ${data.toString().trim()}`);
                });
            }

            return true;
        } catch (error) {
            console.error('[ControlAI] Failed to start CBD via npm:', error);
            return false;
        }
    }

    private findCBDPackage(): string | null {
        try {
            const possiblePaths = [
                join(process.cwd(), '..', '..', 'packages', 'cbd'),
                join(process.cwd(), '..', 'packages', 'cbd'),
                join(process.cwd(), 'packages', 'cbd'),
                join(__dirname, '..', '..', '..', 'cbd'),
                join(__dirname, '..', '..', '..', '..', 'cbd'),
                process.env.CBD_PACKAGE_PATH
            ].filter(Boolean);

            for (const path of possiblePaths) {
                try {
                    const packageJsonPath = join(path!, 'package.json');
                    const fs = require('fs');
                    if (fs.existsSync(packageJsonPath)) {
                        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
                        if (packageJson.name === '@codai/cbd') {
                            console.log(`[ControlAI] Found CBD package at: ${path}`);
                            return path!;
                        }
                    }
                } catch (err) {
                    // Continue searching
                }
            }

            return null;
        } catch (error) {
            console.error('[ControlAI] Error finding CBD package:', error);
            return null;
        }
    }

    private async retryConnection(): Promise<boolean> {
        for (let i = 0; i < this.maxRetries; i++) {
            try {
                console.log(`[ControlAI] Attempting connection retry ${i + 1}/${this.maxRetries}...`);

                const isConnected = await this.adapter.testConnection();
                if (isConnected) {
                    console.log('[ControlAI] CBD connection established on retry');
                    return true;
                }

                if (i < this.maxRetries - 1) {
                    await this.sleep(this.retryDelay * (i + 1));
                }
            } catch (error) {
                console.log(`[ControlAI] Retry ${i + 1} failed:`, error);
            }
        }

        return false;
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async cleanup(): Promise<void> {
        try {
            if (this.cbdProcess) {
                console.log('[ControlAI] Shutting down CBD service...');
                this.cbdProcess.kill('SIGTERM');

                await this.sleep(2000);

                if (this.cbdProcess && !this.cbdProcess.killed) {
                    this.cbdProcess.kill('SIGKILL');
                }

                this.cbdProcess = null;
            }
        } catch (error) {
            console.error('[ControlAI] Error during cleanup:', error);
        }
    }

    // ========================================
    // PROJECT MANAGEMENT METHODS WITH FALLBACK
    // ========================================

    async createProject(project: Omit<Project, 'createdAt' | 'updatedAt'>): Promise<Project> {
        this.ensureInitialized();
        const fullProject = {
            ...project,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        if (this.useCBD) {
            return await this.adapter.createProject(fullProject);
        } else {
            return this.localDb.createProject(fullProject);
        }
    }

    async getProject(id: string): Promise<Project | null> {
        this.ensureInitialized();
        if (this.useCBD) {
            return await this.adapter.getProject(id);
        } else {
            return this.localDb.getProject(id);
        }
    }

    async getAllProjects(): Promise<Project[]> {
        this.ensureInitialized();
        if (this.useCBD) {
            return await this.adapter.getAllProjects();
        } else {
            return this.localDb.getProjects();
        }
    }

    async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
        this.ensureInitialized();
        const updatedProject = {
            ...updates,
            id,
            updatedAt: new Date()
        } as Project;

        if (this.useCBD) {
            return await this.adapter.updateProject(id, updates);
        } else {
            const existing = await this.localDb.getProject(id);
            if (!existing) {
                throw new Error(`Project ${id} not found`);
            }
            const merged = { ...existing, ...updatedProject };
            return this.localDb.updateProject(merged);
        }
    }

    async deleteProject(id: string): Promise<boolean> {
        this.ensureInitialized();
        if (this.useCBD) {
            return await this.adapter.deleteProject(id);
        } else {
            return await this.localDb.deleteProject(id);
        }
    }

    // ========================================
    // TASK MANAGEMENT METHODS WITH FALLBACK
    // ========================================

    async createTask(task: Omit<Task, 'createdAt' | 'updatedAt'>): Promise<Task> {
        this.ensureInitialized();
        const fullTask = {
            ...task,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        if (this.useCBD) {
            return await this.adapter.createTask(fullTask);
        } else {
            return this.localDb.createTask(fullTask);
        }
    }

    async getTask(id: string): Promise<Task | null> {
        this.ensureInitialized();
        if (this.useCBD) {
            return await this.adapter.getTask(id);
        } else {
            return this.localDb.getTask(id);
        }
    }

    async getTasksByProject(projectId: string): Promise<Task[]> {
        this.ensureInitialized();
        if (this.useCBD) {
            return await this.adapter.getTasksByProject(projectId);
        } else {
            return this.localDb.getProjectTasks(projectId);
        }
    }

    async getAvailableTasks(): Promise<Task[]> {
        this.ensureInitialized();
        if (this.useCBD) {
            return await this.adapter.getAvailableTasks();
        } else {
            const allTasks = this.localDb.getTasks();
            return allTasks.filter(task =>
                task.status === TaskStatus.TODO ||
                task.status === TaskStatus.ASSIGNED
            );
        }
    }

    async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
        this.ensureInitialized();
        const updatedTask = {
            ...updates,
            id,
            updatedAt: new Date()
        } as Task;

        if (this.useCBD) {
            return await this.adapter.updateTask(id, updates);
        } else {
            const existing = await this.localDb.getTask(id);
            if (!existing) {
                throw new Error(`Task ${id} not found`);
            }
            const merged = { ...existing, ...updatedTask };
            return this.localDb.updateTask(merged);
        }
    }

    async deleteTask(id: string): Promise<boolean> {
        this.ensureInitialized();
        if (this.useCBD) {
            return await this.adapter.deleteTask(id);
        } else {
            return await this.localDb.deleteTask(id);
        }
    }

    // ========================================
    // AGENT MANAGEMENT METHODS WITH FALLBACK
    // ========================================

    async registerAgent(agent: Omit<Agent, 'createdAt' | 'lastActiveAt'>): Promise<Agent> {
        this.ensureInitialized();
        const fullAgent = {
            ...agent,
            createdAt: new Date(),
            lastActiveAt: new Date()
        };

        if (this.useCBD) {
            return await this.adapter.registerAgent(fullAgent);
        } else {
            return this.localDb.createAgent(fullAgent);
        }
    }

    async getAgent(id: string): Promise<Agent | null> {
        this.ensureInitialized();
        if (this.useCBD) {
            return await this.adapter.getAgent(id);
        } else {
            return this.localDb.getAgent(id);
        }
    }

    async getAllAgents(): Promise<Agent[]> {
        this.ensureInitialized();
        if (this.useCBD) {
            return await this.adapter.getAllAgents();
        } else {
            return this.localDb.getAgents();
        }
    }

    async updateAgent(id: string, updates: Partial<Agent>): Promise<Agent> {
        this.ensureInitialized();
        const updatedAgent = {
            ...updates,
            id,
            lastActiveAt: new Date()
        } as Agent;

        if (this.useCBD) {
            return await this.adapter.updateAgent(id, updates);
        } else {
            const existing = await this.localDb.getAgent(id);
            if (!existing) {
                throw new Error(`Agent ${id} not found`);
            }
            const merged = { ...existing, ...updatedAgent };
            return this.localDb.updateAgent(merged);
        }
    }

    async deleteAgent(id: string): Promise<boolean> {
        this.ensureInitialized();
        if (this.useCBD) {
            return await this.adapter.deleteAgent(id);
        } else {
            return await this.localDb.deleteAgent(id);
        }
    }

    // ========================================
    // WORKSPACE AND ANALYTICS METHODS WITH FALLBACK
    // ========================================

    async getWorkspaceMetrics(workspaceId: string): Promise<any> {
        this.ensureInitialized();
        if (this.useCBD) {
            return await this.adapter.getWorkspaceMetrics(workspaceId);
        } else {
            const projects = await this.localDb.getProjects();
            const tasks = this.localDb.getTasks();
            const agents = await this.localDb.getAgents();

            return {
                workspaceId,
                metrics: {
                    totalProjects: projects.length,
                    activeProjects: projects.filter(p => p.status === 'active').length,
                    completedProjects: projects.filter(p => p.status === 'completed').length,
                    totalTasks: tasks.length,
                    completedTasks: tasks.filter(t => t.status === 'completed').length,
                    totalAgents: agents.length,
                    activeAgents: agents.filter(a => a.status === 'available').length
                }
            };
        }
    }

    async searchEntities(query: string, entityType?: string, limit: number = 100): Promise<any[]> {
        this.ensureInitialized();
        if (this.useCBD) {
            return await this.adapter.searchEntities(query, entityType, limit);
        } else {
            const results: any[] = [];
            const queryLower = query.toLowerCase();

            if (!entityType || entityType === 'project') {
                const projects = await this.localDb.getProjects();
                results.push(...projects.filter(p =>
                    p.name.toLowerCase().includes(queryLower) ||
                    p.description.toLowerCase().includes(queryLower)
                ).slice(0, limit));
            }

            if (!entityType || entityType === 'task') {
                const tasks = this.localDb.getTasks();
                results.push(...tasks.filter(t =>
                    t.title.toLowerCase().includes(queryLower) ||
                    t.description.toLowerCase().includes(queryLower)
                ).slice(0, limit));
            }

            if (!entityType || entityType === 'agent') {
                const agents = await this.localDb.getAgents();
                results.push(...agents.filter(a =>
                    a.name.toLowerCase().includes(queryLower)
                ).slice(0, limit));
            }

            return results.slice(0, limit);
        }
    }

    // ========================================
    // UTILITY METHODS
    // ========================================

    async healthCheck(): Promise<{ status: string; version: string; timestamp: string; mode: string }> {
        if (!this.isInitialized) {
            return {
                status: 'not_initialized',
                version: '2.1.0',
                timestamp: new Date().toISOString(),
                mode: 'unknown'
            };
        }

        if (this.useCBD) {
            try {
                const health = await this.adapter.healthCheck();
                return {
                    ...health,
                    mode: 'CBD Service'
                };
            } catch (error) {
                return {
                    status: 'error',
                    version: '2.1.0',
                    timestamp: new Date().toISOString(),
                    mode: 'CBD Service (error)'
                };
            }
        } else {
            return {
                status: 'healthy',
                version: '2.1.0',
                timestamp: new Date().toISOString(),
                mode: 'Local In-Memory (Fallback)'
            };
        }
    }

    private ensureInitialized(): void {
        if (!this.isInitialized) {
            throw new Error('DatabaseService not initialized. Call initialize() first.');
        }
    }

    getDatabaseMode(): string {
        this.ensureInitialized();
        return this.useCBD ? 'CBD Service' : 'Local In-Memory (Fallback)';
    }

    isUsingCBD(): boolean {
        return this.useCBD;
    }
}
