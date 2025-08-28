import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import {
    Project,
    Task,
    Agent,
    ProjectStatus,
    TaskStatus,
    AgentStatus
} from '../types/index.js';

/**
 * CBD Database Adapter for ControlAI MCP
 * 
 * Provides HTTP client integration with CBD (Codai Better Database) service
 * maintaining compatibility with existing DatabaseService interface.
 * 
 * Follows the same pattern as MemorAI MCP for consistency across ecosystem.
 */
export class CBDDatabaseAdapter {
    private baseURL: string;
    private client: AxiosInstance;

    constructor(baseURL: string = 'http://localhost:4180') {
        this.baseURL = baseURL;
        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
                'X-Client': 'controlai-mcp-v2.0.0'
            }
        });

        // Add request/response interceptors for logging and error handling
        this.client.interceptors.request.use(
            (config: any) => {
                console.log(`[CBD] ${config.method?.toUpperCase()} ${config.url}`);
                return config;
            },
            (error: AxiosError) => {
                console.error('[CBD] Request error:', error);
                return Promise.reject(error);
            }
        );

        this.client.interceptors.response.use(
            (response: AxiosResponse) => {
                console.log(`[CBD] Response ${response.status} from ${response.config.url}`);
                return response;
            },
            (error: AxiosError) => {
                console.error('[CBD] Response error:', error.response?.status, error.message);
                return Promise.reject(error);
            }
        );
    }

    /**
     * Test CBD service connectivity
     */
    async testConnection(): Promise<boolean> {
        try {
            const response = await this.client.get('/health');
            return response.status === 200;
        } catch (error) {
            console.error('[CBD] Connection test failed:', error);
            return false;
        }
    }

    /**
     * Generate unique ID for entities
     */
    private generateId(): string {
        return uuidv4();
    }

    // ========================================
    // PROJECT MANAGEMENT METHODS
    // ========================================

    async createProject(project: Omit<Project, 'createdAt' | 'updatedAt'>): Promise<Project> {
        try {
            const projectData = {
                ...project,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Store project as a memory entry in CBD
            const memoryData = {
                agentId: 'controlai-system',
                content: JSON.stringify(projectData),
                metadata: {
                    entityType: 'project',
                    entityId: project.id,
                    name: project.name,
                    status: project.status,
                    priority: project.priority,
                    tags: project.tags,
                    project: 'controlai-projects'
                }
            };

            const response = await this.client.post('/api/data/memories', memoryData);
            return projectData as Project;
        } catch (error) {
            console.error('[CBD] Failed to create project:', error);
            throw new Error(`Failed to create project: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getProject(id: string): Promise<Project | null> {
        try {
            // Search by project ID in content since metadata search has syntax limitations
            const response = await this.client.post('/api/search/memories', {
                query: id,
                limit: 10
            });

            // CBD returns { data: { memories: [...] } }
            const searchResult = response.data.data || {};
            if (searchResult.memories && searchResult.memories.length > 0) {
                // Find the exact project by checking metadata
                const projectMemory = searchResult.memories.find((memory: any) =>
                    memory.metadata?.entityType === 'project' &&
                    memory.metadata?.entityId === id
                );

                if (projectMemory) {
                    return JSON.parse(projectMemory.content);
                }
            }
            return null;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                return null;
            }
            console.error('[CBD] Failed to get project:', error);
            throw new Error(`Failed to get project: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getAllProjects(): Promise<Project[]> {
        try {
            // Use generic search and filter by metadata
            const response = await this.client.post('/api/search/memories', {
                query: 'controlai-projects',
                limit: 1000
            });

            // CBD returns { data: { memories: [...] } }
            const searchResult = response.data.data || {};
            if (searchResult.memories) {
                // Filter for project entities only
                const projectMemories = searchResult.memories.filter((memory: any) =>
                    memory.metadata?.entityType === 'project'
                );
                return projectMemories.map((memory: any) => JSON.parse(memory.content));
            }
            return [];
        } catch (error) {
            console.error('[CBD] Failed to get all projects:', error);
            throw new Error(`Failed to get all projects: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
        try {
            const updateData = {
                ...updates,
                updatedAt: new Date()
            };

            const response = await this.client.put(`/api/data/projects/${id}`, updateData);
            return response.data.project;
        } catch (error) {
            console.error('[CBD] Failed to update project:', error);
            throw new Error(`Failed to update project: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async deleteProject(id: string): Promise<boolean> {
        try {
            await this.client.delete(`/api/data/projects/${id}`);
            return true;
        } catch (error) {
            console.error('[CBD] Failed to delete project:', error);
            return false;
        }
    }

    // ========================================
    // TASK MANAGEMENT METHODS
    // ========================================

    async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
        try {
            const taskData: Task = {
                ...task,
                id: this.generateId(),
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Store task as a memory entry in CBD
            const memoryData = {
                agentId: 'controlai-system',
                content: JSON.stringify(taskData),
                metadata: {
                    entityType: 'task',
                    entityId: taskData.id,
                    title: task.title,
                    status: task.status,
                    priority: task.priority,
                    projectId: task.projectId,
                    assignedAgentId: task.assignedAgentId,
                    project: 'controlai-tasks'
                }
            };

            const response = await this.client.post('/api/data/memories', memoryData);
            return taskData as Task;
        } catch (error) {
            console.error('[CBD] Failed to create task:', error);
            throw new Error(`Failed to create task: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getTask(id: string): Promise<Task | null> {
        try {
            const response = await this.client.get(`/api/data/tasks/${id}`);
            return response.data.task || null;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                return null;
            }
            console.error('[CBD] Failed to get task:', error);
            throw new Error(`Failed to get task: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getTasksByProject(projectId: string): Promise<Task[]> {
        try {
            const response = await this.client.post('/api/search/tasks', {
                query: `entityType:task AND projectId:${projectId}`,
                limit: 1000
            });
            return response.data.results || [];
        } catch (error) {
            console.error('[CBD] Failed to get tasks by project:', error);
            throw new Error(`Failed to get tasks by project: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getAvailableTasks(): Promise<Task[]> {
        try {
            const response = await this.client.post('/api/search/tasks', {
                query: `entityType:task AND status:${TaskStatus.TODO}`,
                limit: 1000
            });
            return response.data.results || [];
        } catch (error) {
            console.error('[CBD] Failed to get available tasks:', error);
            throw new Error(`Failed to get available tasks: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
        try {
            const updateData = {
                ...updates,
                updatedAt: new Date()
            };

            const response = await this.client.put(`/api/data/tasks/${id}`, updateData);
            return response.data.task;
        } catch (error) {
            console.error('[CBD] Failed to update task:', error);
            throw new Error(`Failed to update task: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async deleteTask(id: string): Promise<boolean> {
        try {
            await this.client.delete(`/api/data/tasks/${id}`);
            return true;
        } catch (error) {
            console.error('[CBD] Failed to delete task:', error);
            return false;
        }
    }

    // ========================================
    // AGENT MANAGEMENT METHODS
    // ========================================

    async registerAgent(agent: Omit<Agent, 'createdAt' | 'lastActiveAt'>): Promise<Agent> {
        try {
            const agentData = {
                ...agent,
                entityType: 'agent',
                createdAt: new Date(),
                lastActiveAt: new Date()
            };

            const response = await this.client.post('/api/data/agents', agentData);
            return response.data.agent;
        } catch (error) {
            console.error('[CBD] Failed to register agent:', error);
            throw new Error(`Failed to register agent: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getAgent(id: string): Promise<Agent | null> {
        try {
            const response = await this.client.get(`/api/data/agents/${id}`);
            return response.data.agent || null;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                return null;
            }
            console.error('[CBD] Failed to get agent:', error);
            throw new Error(`Failed to get agent: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getAllAgents(): Promise<Agent[]> {
        try {
            const response = await this.client.post('/api/search/agents', {
                query: 'entityType:agent',
                limit: 1000
            });
            return response.data.results || [];
        } catch (error) {
            console.error('[CBD] Failed to get all agents:', error);
            throw new Error(`Failed to get all agents: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async updateAgent(id: string, updates: Partial<Agent>): Promise<Agent> {
        try {
            const updateData = {
                ...updates,
                lastActiveAt: new Date()
            };

            const response = await this.client.put(`/api/data/agents/${id}`, updateData);
            return response.data.agent;
        } catch (error) {
            console.error('[CBD] Failed to update agent:', error);
            throw new Error(`Failed to update agent: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async deleteAgent(id: string): Promise<boolean> {
        try {
            await this.client.delete(`/api/data/agents/${id}`);
            return true;
        } catch (error) {
            console.error('[CBD] Failed to delete agent:', error);
            return false;
        }
    }

    // ========================================
    // WORKSPACE AND ANALYTICS METHODS
    // ========================================

    async getWorkspaceMetrics(workspaceId: string): Promise<any> {
        try {
            const response = await this.client.post('/api/search/metrics', {
                query: `workspaceId:${workspaceId}`,
                aggregations: ['count', 'status_distribution', 'performance_metrics']
            });
            return response.data.metrics || {};
        } catch (error) {
            console.error('[CBD] Failed to get workspace metrics:', error);
            throw new Error(`Failed to get workspace metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async searchEntities(query: string, entityType?: string, limit: number = 100): Promise<any[]> {
        try {
            const searchQuery = entityType ? `${query} AND entityType:${entityType}` : query;
            const response = await this.client.post('/api/search/entities', {
                query: searchQuery,
                limit
            });
            return response.data.results || [];
        } catch (error) {
            console.error('[CBD] Failed to search entities:', error);
            throw new Error(`Failed to search entities: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // ========================================
    // UTILITY METHODS
    // ========================================

    async healthCheck(): Promise<{ status: string; version: string; timestamp: string }> {
        try {
            const response = await this.client.get('/health');
            return response.data;
        } catch (error) {
            console.error('[CBD] Health check failed:', error);
            return {
                status: 'error',
                version: 'unknown',
                timestamp: new Date().toISOString()
            };
        }
    }

    async getStats(): Promise<any> {
        try {
            const response = await this.client.get('/stats');
            return response.data;
        } catch (error) {
            console.error('[CBD] Failed to get stats:', error);
            return {};
        }
    }
}

export default CBDDatabaseAdapter;
