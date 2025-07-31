import { CBDDatabaseAdapter } from './CBDDatabaseAdapter.js';
import {
    Project,
    Task,
    Agent,
    ProjectStatus,
    TaskStatus,
    AgentStatus
} from '../types/index.js';

/**
 * Database Service for ControlAI MCP
 * 
 * Now uses CBD (Codai Better Database) for consistency with MemorAI and ecosystem.
 * Maintains the same interface as the original SQLite implementation for compatibility.
 */
export class DatabaseService {
    private adapter: CBDDatabaseAdapter;
    private isInitialized = false;

    constructor(cbdUrl?: string) {
        this.adapter = new CBDDatabaseAdapter(cbdUrl);
    }

    async initialize(): Promise<void> {
        try {
            console.log('[ControlAI] Initializing CBD database connection...');
            
            // Test CBD service connectivity
            const isConnected = await this.adapter.testConnection();
            if (!isConnected) {
                throw new Error('Failed to connect to CBD service at localhost:4180');
            }

            console.log('[ControlAI] CBD database connection established successfully');
            this.isInitialized = true;
        } catch (error) {
            console.error('[ControlAI] Database initialization failed:', error);
            throw error;
        }
    }

    // ========================================
    // PROJECT MANAGEMENT METHODS
    // ========================================

    async createProject(project: Omit<Project, 'createdAt' | 'updatedAt'>): Promise<Project> {
        this.ensureInitialized();
        return await this.adapter.createProject(project);
    }

    async getProject(id: string): Promise<Project | null> {
        this.ensureInitialized();
        return await this.adapter.getProject(id);
    }

    async getAllProjects(): Promise<Project[]> {
        this.ensureInitialized();
        return await this.adapter.getAllProjects();
    }

    async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
        this.ensureInitialized();
        return await this.adapter.updateProject(id, updates);
    }

    async deleteProject(id: string): Promise<boolean> {
        this.ensureInitialized();
        return await this.adapter.deleteProject(id);
    }

    // ========================================
    // TASK MANAGEMENT METHODS
    // ========================================

    async createTask(task: Omit<Task, 'createdAt' | 'updatedAt'>): Promise<Task> {
        this.ensureInitialized();
        return await this.adapter.createTask(task);
    }

    async getTask(id: string): Promise<Task | null> {
        this.ensureInitialized();
        return await this.adapter.getTask(id);
    }

    async getTasksByProject(projectId: string): Promise<Task[]> {
        this.ensureInitialized();
        return await this.adapter.getTasksByProject(projectId);
    }

    async getAvailableTasks(): Promise<Task[]> {
        this.ensureInitialized();
        return await this.adapter.getAvailableTasks();
    }

    async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
        this.ensureInitialized();
        return await this.adapter.updateTask(id, updates);
    }

    async deleteTask(id: string): Promise<boolean> {
        this.ensureInitialized();
        return await this.adapter.deleteTask(id);
    }

    // ========================================
    // AGENT MANAGEMENT METHODS
    // ========================================

    async registerAgent(agent: Omit<Agent, 'createdAt' | 'lastActiveAt'>): Promise<Agent> {
        this.ensureInitialized();
        return await this.adapter.registerAgent(agent);
    }

    async getAgent(id: string): Promise<Agent | null> {
        this.ensureInitialized();
        return await this.adapter.getAgent(id);
    }

    async getAllAgents(): Promise<Agent[]> {
        this.ensureInitialized();
        return await this.adapter.getAllAgents();
    }

    async updateAgent(id: string, updates: Partial<Agent>): Promise<Agent> {
        this.ensureInitialized();
        return await this.adapter.updateAgent(id, updates);
    }

    async deleteAgent(id: string): Promise<boolean> {
        this.ensureInitialized();
        return await this.adapter.deleteAgent(id);
    }

    // ========================================
    // WORKSPACE AND ANALYTICS METHODS
    // ========================================

    async getWorkspaceMetrics(workspaceId: string): Promise<any> {
        this.ensureInitialized();
        return await this.adapter.getWorkspaceMetrics(workspaceId);
    }

    async searchEntities(query: string, entityType?: string, limit: number = 100): Promise<any[]> {
        this.ensureInitialized();
        return await this.adapter.searchEntities(query, entityType, limit);
    }

    // ========================================
    // UTILITY METHODS
    // ========================================

    async healthCheck(): Promise<{ status: string; version: string; timestamp: string }> {
        if (!this.isInitialized) {
            return {
                status: 'not_initialized',
                version: 'unknown',
                timestamp: new Date().toISOString()
            };
        }
        return await this.adapter.healthCheck();
    }

    async getStats(): Promise<any> {
        this.ensureInitialized();
        return await this.adapter.getStats();
    }

    async close(): Promise<void> {
        // CBD uses HTTP connections, no explicit close needed
        console.log('[ControlAI] Database service closed');
        this.isInitialized = false;
    }

    // ========================================
    // PRIVATE HELPER METHODS
    // ========================================

    private ensureInitialized(): void {
        if (!this.isInitialized) {
            throw new Error('Database service not initialized. Call initialize() first.');
        }
    }

    // ========================================
    // MIGRATION UTILITY METHODS
    // ========================================

    /**
     * Get connection status and service information
     */
    async getConnectionInfo(): Promise<{
        connected: boolean;
        service: string;
        backend: string;
        version: string;
        url: string;
    }> {
        const health = await this.healthCheck();
        return {
            connected: this.isInitialized && health.status === 'healthy',
            service: 'controlai-mcp',
            backend: 'cbd-database',
            version: health.version,
            url: 'http://localhost:4180'
        };
    }

    /**
     * Test all database operations with sample data
     */
    async runIntegrationTest(): Promise<{
        success: boolean;
        results: { [key: string]: boolean };
        errors: { [key: string]: string };
    }> {
        const results: { [key: string]: boolean } = {};
        const errors: { [key: string]: string } = {};

        try {
            // Test project operations
            const testProject = await this.createProject({
                id: 'test-project-' + Date.now(),
                name: 'Integration Test Project',
                description: 'Test project for CBD integration',
                status: ProjectStatus.PLANNING,
                priority: 'medium',
                tags: ['test', 'integration'],
                metadata: { test: true }
            } as any);
            results['create_project'] = !!testProject;

            const retrievedProject = await this.getProject(testProject.id);
            results['get_project'] = !!retrievedProject && retrievedProject.id === testProject.id;

            // Test task operations
            const testTask = await this.createTask({
                id: 'test-task-' + Date.now(),
                projectId: testProject.id,
                title: 'Integration Test Task',
                description: 'Test task for CBD integration',
                status: TaskStatus.TODO,
                priority: 'medium',
                category: 'testing',
                estimatedHours: 1,
                dependencies: [],
                tags: ['test'],
                metadata: { test: true }
            } as any);
            results['create_task'] = !!testTask;

            const retrievedTask = await this.getTask(testTask.id);
            results['get_task'] = !!retrievedTask && retrievedTask.id === testTask.id;

            // Test agent operations
            const testAgent = await this.registerAgent({
                id: 'test-agent-' + Date.now(),
                name: 'Integration Test Agent',
                type: 'senior_developer',
                capabilities: ['programming', 'testing'],
                status: AgentStatus.AVAILABLE,
                workspaceId: 'test-workspace',
                maxConcurrentTasks: 1,
                performance: {
                    tasksCompleted: 0,
                    averageCompletionTime: 0,
                    qualityScore: 100,
                    reliabilityScore: 100,
                    efficiencyScore: 100,
                    successRate: 100,
                    lastUpdated: new Date()
                },
                metadata: { test: true }
            } as any);
            results['register_agent'] = !!testAgent;

            const retrievedAgent = await this.getAgent(testAgent.id);
            results['get_agent'] = !!retrievedAgent && retrievedAgent.id === testAgent.id;

            // Cleanup test data
            await this.deleteTask(testTask.id);
            await this.deleteAgent(testAgent.id);
            await this.deleteProject(testProject.id);

            const allPassed = Object.values(results).every(result => result === true);
            return {
                success: allPassed,
                results,
                errors
            };

        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            errors['integration_test'] = errorMsg;
            return {
                success: false,
                results,
                errors
            };
        }
    }
}
