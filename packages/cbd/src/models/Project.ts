/**
 * Project Model for CBD Universal Database
 * Represents external project configurations for ecosystem integration
 */

export interface Project {
    id: string;
    name: string;
    description?: string;
    ownerId: string;
    apiKeys: string[];
    databases: {
        document?: boolean;
        vector?: boolean;
        graph?: boolean;
        keyValue?: boolean;
        timeSeries?: boolean;
        fileStorage?: boolean;
    };
    permissions: {
        read: boolean;
        write: boolean;
        admin: boolean;
    };
    rateLimit: {
        requestsPerMinute: number;
        requestsPerHour: number;
    };
    status: 'active' | 'suspended' | 'deleted';
    createdAt: Date;
    updatedAt: Date;
    lastUsed?: Date;
    metadata: Record<string, any>;
}

export interface ProjectCreateRequest {
    name: string;
    description?: string;
    databases?: {
        document?: boolean;
        vector?: boolean;
        graph?: boolean;
        keyValue?: boolean;
        timeSeries?: boolean;
        fileStorage?: boolean;
    };
    permissions?: {
        read?: boolean;
        write?: boolean;
        admin?: boolean;
    };
    rateLimit?: {
        requestsPerMinute?: number;
        requestsPerHour?: number;
    };
    metadata?: Record<string, any>;
}

/**
 * In-memory project storage for Phase 1 implementation
 * TODO: Replace with proper database storage in Phase 2
 */
export class ProjectStorage {
    private projects: Map<string, Project> = new Map();
    private projectsByOwner: Map<string, string[]> = new Map();

    async createProject(ownerId: string, projectData: ProjectCreateRequest): Promise<Project> {
        const projectId = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const project: Project = {
            id: projectId,
            name: projectData.name,
            description: projectData.description,
            ownerId,
            apiKeys: [],
            databases: {
                document: projectData.databases?.document ?? true,
                vector: projectData.databases?.vector ?? false,
                graph: projectData.databases?.graph ?? false,
                keyValue: projectData.databases?.keyValue ?? false,
                timeSeries: projectData.databases?.timeSeries ?? false,
                fileStorage: projectData.databases?.fileStorage ?? false,
            },
            permissions: {
                read: projectData.permissions?.read ?? true,
                write: projectData.permissions?.write ?? true,
                admin: projectData.permissions?.admin ?? false,
            },
            rateLimit: {
                requestsPerMinute: projectData.rateLimit?.requestsPerMinute ?? 1000,
                requestsPerHour: projectData.rateLimit?.requestsPerHour ?? 50000,
            },
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
            metadata: projectData.metadata || {}
        };

        this.projects.set(projectId, project);

        // Update owner index
        const ownerProjects = this.projectsByOwner.get(ownerId) || [];
        ownerProjects.push(projectId);
        this.projectsByOwner.set(ownerId, ownerProjects);

        return project;
    }

    async getProject(projectId: string): Promise<Project | null> {
        return this.projects.get(projectId) || null;
    }

    async getProjectsByOwner(ownerId: string): Promise<Project[]> {
        const projectIds = this.projectsByOwner.get(ownerId) || [];
        return projectIds
            .map(id => this.projects.get(id))
            .filter((project): project is Project => project !== undefined);
    }

    async updateProject(projectId: string, updates: Partial<Project>): Promise<Project | null> {
        const project = this.projects.get(projectId);
        if (!project) return null;

        const updatedProject = {
            ...project,
            ...updates,
            updatedAt: new Date()
        };

        this.projects.set(projectId, updatedProject);
        return updatedProject;
    }

    async deleteProject(projectId: string): Promise<boolean> {
        const project = this.projects.get(projectId);
        if (!project) return false;

        // Remove from owner index
        const ownerProjects = this.projectsByOwner.get(project.ownerId) || [];
        const updatedOwnerProjects = ownerProjects.filter(id => id !== projectId);
        this.projectsByOwner.set(project.ownerId, updatedOwnerProjects);

        // Mark as deleted (soft delete)
        project.status = 'deleted';
        project.updatedAt = new Date();
        this.projects.set(projectId, project);

        return true;
    }

    async getAllProjects(): Promise<Project[]> {
        return Array.from(this.projects.values()).filter(p => p.status !== 'deleted');
    }

    async addApiKeyToProject(projectId: string, apiKeyId: string): Promise<boolean> {
        const project = this.projects.get(projectId);
        if (!project) return false;

        if (!project.apiKeys.includes(apiKeyId)) {
            project.apiKeys.push(apiKeyId);
            project.updatedAt = new Date();
            this.projects.set(projectId, project);
        }

        return true;
    }

    async removeApiKeyFromProject(projectId: string, apiKeyId: string): Promise<boolean> {
        const project = this.projects.get(projectId);
        if (!project) return false;

        project.apiKeys = project.apiKeys.filter(id => id !== apiKeyId);
        project.updatedAt = new Date();
        this.projects.set(projectId, project);

        return true;
    }

    async updateLastUsed(projectId: string): Promise<void> {
        const project = this.projects.get(projectId);
        if (project) {
            project.lastUsed = new Date();
            this.projects.set(projectId, project);
        }
    }

    async getProjectStats(): Promise<{
        total: number;
        active: number;
        suspended: number;
        byDatabase: Record<string, number>;
    }> {
        const projects = Array.from(this.projects.values());

        return {
            total: projects.length,
            active: projects.filter(p => p.status === 'active').length,
            suspended: projects.filter(p => p.status === 'suspended').length,
            byDatabase: {
                document: projects.filter(p => p.databases.document).length,
                vector: projects.filter(p => p.databases.vector).length,
                graph: projects.filter(p => p.databases.graph).length,
                keyValue: projects.filter(p => p.databases.keyValue).length,
                timeSeries: projects.filter(p => p.databases.timeSeries).length,
                fileStorage: projects.filter(p => p.databases.fileStorage).length,
            }
        };
    }
}
