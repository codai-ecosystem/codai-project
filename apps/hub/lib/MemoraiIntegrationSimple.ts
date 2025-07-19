/**
 * Simplified Memorai Integration Service for Hub App
 * Demonstrates basic memorai integration with project management
 */

import { memorai } from '@codai/memorai'

// Hub-specific types
interface HubProject {
  id: string;
  name: string;
  description: string;
  status: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  progress: number;
  startDate: Date;
  dueDate: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

class HubMemoraiService {
  private initialized = false;
  private projects: Map<string, HubProject> = new Map();

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Initialize memorai service
      await memorai.initialize();
      
      this.initialized = true;
      console.log('Hub Memorai Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Hub Memorai Service:', error);
      throw error;
    }
  }

  // Project Operations
  async createProject(projectData: Omit<HubProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<HubProject> {
    await this.initialize();

    const project: HubProject = {
      id: `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...projectData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Store in memory (simplified for demo)
    this.projects.set(project.id, project);

    try {
      // Store project in AI memory for intelligent search
      await memorai.storeMemory({
        content: `Project: ${project.name}. Description: ${project.description}. Status: ${project.status}. Priority: ${project.priority}. Tags: ${project.tags.join(', ')}`,
        metadata: { 
          projectId: project.id,
          tags: project.tags,
          type: 'project',
          status: project.status,
          priority: project.priority
        },
        userId: 'hub-system',
        agentId: 'hub-projects',
        tags: ['project', ...project.tags]
      });
    } catch (error) {
      console.warn('Failed to store project in AI memory:', error);
    }

    return project;
  }

  async getProject(projectId: string): Promise<HubProject | null> {
    await this.initialize();
    return this.projects.get(projectId) || null;
  }

  async updateProject(projectId: string, updates: Partial<HubProject>): Promise<HubProject | null> {
    await this.initialize();

    const project = this.projects.get(projectId);
    if (!project) return null;

    const updatedProject = {
      ...project,
      ...updates,
      updatedAt: new Date()
    };

    this.projects.set(projectId, updatedProject);

    try {
      // Update AI memory
      await memorai.storeMemory({
        content: `Updated Project: ${updatedProject.name}. Description: ${updatedProject.description}. Status: ${updatedProject.status}. Priority: ${updatedProject.priority}. Progress: ${updatedProject.progress}%`,
        metadata: { 
          projectId: updatedProject.id,
          tags: updatedProject.tags,
          type: 'project',
          status: updatedProject.status,
          priority: updatedProject.priority,
          action: 'update'
        },
        userId: 'hub-system',
        agentId: 'hub-projects',
        tags: ['project', 'update', ...updatedProject.tags]
      });
    } catch (error) {
      console.warn('Failed to update project in AI memory:', error);
    }
    
    return updatedProject;
  }

  async deleteProject(projectId: string): Promise<boolean> {
    await this.initialize();

    const deleted = this.projects.delete(projectId);
    
    if (deleted) {
      try {
        // Note: In a real implementation, you would use memorai.deleteMemory or similar
        console.log(`Project ${projectId} deleted from memory storage`);
      } catch (error) {
        console.warn('Failed to remove project from AI memory:', error);
      }
    }
    
    return deleted;
  }

  async listProjects(filters?: {
    status?: string;
    priority?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ projects: HubProject[]; total: number }> {
    await this.initialize();

    let projectList = Array.from(this.projects.values());
    
    // Apply filters
    if (filters?.status) {
      projectList = projectList.filter(p => p.status === filters.status);
    }
    
    if (filters?.priority) {
      projectList = projectList.filter(p => p.priority === filters.priority);
    }

    // Sort by creation date (newest first)
    projectList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Apply pagination
    const total = projectList.length;
    if (filters?.offset) {
      projectList = projectList.slice(filters.offset);
    }
    if (filters?.limit) {
      projectList = projectList.slice(0, filters.limit);
    }

    return { projects: projectList, total };
  }

  // Search and AI Operations
  async searchProjects(query: string): Promise<HubProject[]> {
    await this.initialize();

    try {
      // Use memorai's AI-powered search
      const searchResult = await memorai.searchMemories({
        query,
        agentId: 'hub-projects',
        tags: ['project'],
        limit: 20
      });

      if (searchResult.success && searchResult.data) {
        const projectIds = searchResult.data
          .map(result => result.metadata?.projectId)
          .filter(Boolean);
        
        const projects: HubProject[] = [];
        for (const projectId of projectIds) {
          const project = this.projects.get(projectId);
          if (project) projects.push(project);
        }

        return projects;
      }
    } catch (error) {
      console.warn('AI search failed, falling back to simple search:', error);
    }

    // Fallback to simple text search
    const allProjects = Array.from(this.projects.values());
    const searchTerms = query.toLowerCase().split(' ');
    
    return allProjects.filter(project => {
      const searchText = `${project.name} ${project.description} ${project.tags.join(' ')}`.toLowerCase();
      return searchTerms.some(term => searchText.includes(term));
    });
  }

  // File Operations (simplified demo)
  async uploadProjectFile(projectId: string, file: File, category: string = 'documents'): Promise<string> {
    await this.initialize();

    try {
      const fileName = `projects/${projectId}/${category}/${Date.now()}-${file.name}`;
      
      // For demo purposes, we'll simulate file upload
      const uploadResult = await memorai.uploadFile({
        file: new Uint8Array(await file.arrayBuffer()),
        filename: fileName,
        mimeType: file.type,
        metadata: { projectId, category }
      }, 'hub-system');

      if (uploadResult.success && uploadResult.data) {
        // Store file reference in memory
        await memorai.storeMemory({
          content: `File uploaded: ${file.name} for project ${projectId} in category ${category}`,
          metadata: { 
            projectId,
            fileName: uploadResult.data.filename,
            category,
            type: 'file'
          },
          userId: 'hub-system',
          agentId: 'hub-files',
          tags: ['file', category, projectId]
        });

        return uploadResult.data.url || fileName;
      }
    } catch (error) {
      console.warn('File upload failed:', error);
    }

    return `demo-url-${Date.now()}`;
  }

  async getProjectFiles(projectId: string): Promise<any[]> {
    await this.initialize();

    try {
      const searchResult = await memorai.searchMemories({
        query: `files for project ${projectId}`,
        agentId: 'hub-files',
        tags: ['file', projectId],
        limit: 50
      });

      if (searchResult.success && searchResult.data) {
        return searchResult.data.map(result => ({
          id: result.id,
          fileName: result.metadata?.fileName || 'unknown',
          category: result.metadata?.category || 'documents',
          createdAt: result.createdAt
        }));
      }
    } catch (error) {
      console.warn('Failed to get project files:', error);
    }

    return [];
  }

  // Health check
  async getHealth(): Promise<{ status: string; details: any }> {
    try {
      const health = await memorai.getHealth();
      return {
        status: 'healthy',
        details: {
          memorai: health,
          projects: this.projects.size,
          initialized: this.initialized
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: { error: error.message }
      };
    }
  }
}

// Export singleton instance
export const hubMemoraiService = new HubMemoraiService();
export default hubMemoraiService;
