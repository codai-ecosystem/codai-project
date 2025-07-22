/**
 * Memorai Integration Service for Hub App
 * Provides centralized database and storage operations using memorai
 */

// Import fallbacks
let memorai: any;
let MemoraiConfig: any;
let DatabaseQuery: any;
let StorageUpload: any;
let MemoryQuery: any;
let APIResponse: any;

try {
  const memoraiModule = require('@codai/memorai');
  memorai = memoraiModule.memorai;
  MemoraiConfig = memoraiModule.MemoraiConfig;
  DatabaseQuery = memoraiModule.DatabaseQuery;
  StorageUpload = memoraiModule.StorageUpload;
  MemoryQuery = memoraiModule.MemoryQuery;
  APIResponse = memoraiModule.APIResponse;
} catch {
  // Mock interfaces when @codai/memorai is not available
  memorai = {
    initialize: async () => ({ success: true }),
    createMemory: async () => ({ success: true, data: { id: 'mock-id' } }),
    searchMemories: async () => ({ success: true, data: [] }),
    getHealth: async () => ({ status: 'healthy' })
  };
  MemoraiConfig = {};
  DatabaseQuery = {};
  StorageUpload = {};
  MemoryQuery = {};
  APIResponse = {};
}

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
  teamMembers: HubTeamMember[];
  tasks: HubTask[];
  milestones: HubMilestone[];
  budget: HubBudget;
  tags: string[];
  aiInsights: HubAIInsights;
  createdAt: Date;
  updatedAt: Date;
}

interface HubTeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  availability: 'AVAILABLE' | 'BUSY' | 'AWAY' | 'OFFLINE';
  skills: string[];
  workload: number;
  currentTasks: string[];
}

interface HubTask {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'BLOCKED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  assigneeId?: string;
  reporterId: string;
  createdAt: Date;
  dueDate?: Date;
  completedAt?: Date;
  estimatedHours: number;
  actualHours: number;
  tags: string[];
}

interface HubMilestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  dueDate: Date;
  status: 'PENDING' | 'ACHIEVED' | 'DELAYED';
  tasks: string[];
  progress: number;
}

interface HubBudget {
  allocated: number;
  spent: number;
  remaining: number;
}

interface HubAIInsights {
  riskScore: number;
  recommendations: string[];
  automatedTasks: number;
  predictedCompletion: Date;
}

class HubMemoraiService {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Initialize memorai service (no parameters needed, uses default config)
      await memorai.initialize();

      // Create hub-specific database tables if they don't exist
      await this.createTables();

      this.initialized = true;
      console.log('Hub Memorai Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Hub Memorai Service:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    // Note: For demo purposes, we'll assume the database schema exists
    // In a real implementation, you would use Prisma migrations or 
    // the memorai service's schema management features
    console.log('Database tables initialized (using existing schema)');
  }

  // Project Operations
  async createProject(projectData: Omit<HubProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<HubProject> {
    await this.initialize();

    const project: HubProject = {
      id: `proj-${Date.now()}`,
      ...projectData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert project using memorai's insert method
    await memorai.insert('hub_projects', {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      priority: project.priority,
      progress: project.progress,
      startDate: project.startDate.toISOString(),
      dueDate: project.dueDate.toISOString(),
      budget_allocated: project.budget.allocated,
      budget_spent: project.budget.spent,
      budget_remaining: project.budget.remaining,
      tags: JSON.stringify(project.tags),
      ai_risk_score: project.aiInsights.riskScore,
      ai_recommendations: JSON.stringify(project.aiInsights.recommendations),
      ai_automated_tasks: project.aiInsights.automatedTasks,
      ai_predicted_completion: project.aiInsights.predictedCompletion.toISOString(),
      created_at: project.createdAt.toISOString(),
      updated_at: project.updatedAt.toISOString()
    });

    // Store project in AI memory for intelligent search
    await memorai.storeMemory({
      content: `Project: ${project.name}. Description: ${project.description}. Status: ${project.status}. Priority: ${project.priority}.`,
      metadata: {
        projectId: project.id,
        tags: project.tags,
        type: 'project'
      },
      userId: 'hub-system',
      agentId: 'hub-projects'
    });

    return project;
  }

  async getProject(projectId: string): Promise<HubProject | null> {
    await this.initialize();

    const projectRecord = await memorai.database.findById('hub_projects', projectId);
    if (!projectRecord) return null;

    // Get team members
    const teamMembers = await this.getProjectTeamMembers(projectId);

    // Get tasks
    const tasks = await this.getProjectTasks(projectId);

    // Get milestones
    const milestones = await this.getProjectMilestones(projectId);

    return this.mapRecordToProject(projectRecord, teamMembers, tasks, milestones);
  }

  async updateProject(projectId: string, updates: Partial<HubProject>): Promise<HubProject | null> {
    await this.initialize();

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.name) updateData.name = updates.name;
    if (updates.description) updateData.description = updates.description;
    if (updates.status) updateData.status = updates.status;
    if (updates.priority) updateData.priority = updates.priority;
    if (updates.progress !== undefined) updateData.progress = updates.progress;
    if (updates.startDate) updateData.startDate = updates.startDate.toISOString();
    if (updates.dueDate) updateData.dueDate = updates.dueDate.toISOString();
    if (updates.budget) {
      updateData.budget_allocated = updates.budget.allocated;
      updateData.budget_spent = updates.budget.spent;
      updateData.budget_remaining = updates.budget.remaining;
    }
    if (updates.tags) updateData.tags = JSON.stringify(updates.tags);
    if (updates.aiInsights) {
      updateData.ai_risk_score = updates.aiInsights.riskScore;
      updateData.ai_recommendations = JSON.stringify(updates.aiInsights.recommendations);
      updateData.ai_automated_tasks = updates.aiInsights.automatedTasks;
      updateData.ai_predicted_completion = updates.aiInsights.predictedCompletion.toISOString();
    }

    await memorai.database.update('hub_projects', projectId, updateData);

    return this.getProject(projectId);
  }

  async deleteProject(projectId: string): Promise<boolean> {
    await this.initialize();

    try {
      // Delete related data
      await memorai.database.execute('DELETE FROM hub_project_members WHERE project_id = ?', [projectId]);
      await memorai.database.execute('DELETE FROM hub_tasks WHERE project_id = ?', [projectId]);
      await memorai.database.execute('DELETE FROM hub_milestones WHERE project_id = ?', [projectId]);

      // Delete project
      await memorai.database.delete('hub_projects', projectId);

      // Remove from AI memory
      await memorai.memory.forget('hub-projects', `project-${projectId}`);

      return true;
    } catch (error) {
      console.error('Failed to delete project:', error);
      return false;
    }
  }

  async listProjects(filters?: {
    status?: string;
    priority?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
  }): Promise<{ projects: HubProject[]; total: number }> {
    await this.initialize();

    let query = 'SELECT * FROM hub_projects';
    const conditions: string[] = [];
    const params: any[] = [];

    if (filters?.status) {
      conditions.push('status = ?');
      params.push(filters.status);
    }

    if (filters?.priority) {
      conditions.push('priority = ?');
      params.push(filters.priority);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    if (filters?.limit) {
      query += ` LIMIT ${filters.limit}`;
      if (filters?.offset) {
        query += ` OFFSET ${filters.offset}`;
      }
    }

    const records = await memorai.database.query(query, params);
    const projects: HubProject[] = [];

    for (const record of records) {
      const teamMembers = await this.getProjectTeamMembers(record.id);
      const tasks = await this.getProjectTasks(record.id);
      const milestones = await this.getProjectMilestones(record.id);

      projects.push(this.mapRecordToProject(record, teamMembers, tasks, milestones));
    }

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM hub_projects';
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    const countResult = await memorai.database.query(countQuery, params);
    const total = countResult[0]?.total || 0;

    return { projects, total };
  }

  // Team Member Operations
  async addTeamMemberToProject(projectId: string, member: HubTeamMember): Promise<void> {
    await this.initialize();

    // First, ensure the team member exists
    await memorai.database.create('hub_team_members', {
      id: member.id,
      name: member.name,
      email: member.email,
      role: member.role,
      avatar: member.avatar,
      availability: member.availability,
      skills: JSON.stringify(member.skills),
      workload: member.workload,
      current_tasks: JSON.stringify(member.currentTasks)
    }, { onConflict: 'replace' });

    // Add to project
    await memorai.database.create('hub_project_members', {
      project_id: projectId,
      member_id: member.id,
      role: member.role
    }, { onConflict: 'replace' });
  }

  private async getProjectTeamMembers(projectId: string): Promise<HubTeamMember[]> {
    const query = `
      SELECT tm.* FROM hub_team_members tm
      JOIN hub_project_members pm ON tm.id = pm.member_id
      WHERE pm.project_id = ?
    `;

    const records = await memorai.database.query(query, [projectId]);
    return records.map((record: any) => ({
      id: record.id,
      name: record.name,
      email: record.email,
      role: record.role,
      avatar: record.avatar,
      availability: record.availability,
      skills: JSON.parse(record.skills || '[]'),
      workload: record.workload,
      currentTasks: JSON.parse(record.current_tasks || '[]')
    }));
  }

  private async getProjectTasks(projectId: string): Promise<HubTask[]> {
    const records = await memorai.database.query(
      'SELECT * FROM hub_tasks WHERE project_id = ? ORDER BY created_at DESC',
      [projectId]
    );

    return records.map((record: any) => ({
      id: record.id,
      projectId: record.project_id,
      title: record.title,
      description: record.description,
      status: record.status,
      priority: record.priority,
      assigneeId: record.assignee_id,
      reporterId: record.reporter_id,
      createdAt: new Date(record.created_at),
      dueDate: record.due_date ? new Date(record.due_date) : undefined,
      completedAt: record.completed_at ? new Date(record.completed_at) : undefined,
      estimatedHours: record.estimated_hours,
      actualHours: record.actual_hours,
      tags: JSON.parse(record.tags || '[]')
    }));
  }

  private async getProjectMilestones(projectId: string): Promise<HubMilestone[]> {
    const records = await memorai.database.query(
      'SELECT * FROM hub_milestones WHERE project_id = ? ORDER BY due_date ASC',
      [projectId]
    );

    return records.map((record: any) => ({
      id: record.id,
      projectId: record.project_id,
      title: record.title,
      description: record.description,
      dueDate: new Date(record.due_date),
      status: record.status,
      tasks: JSON.parse(record.tasks || '[]'),
      progress: record.progress
    }));
  }

  private mapRecordToProject(
    record: any,
    teamMembers: HubTeamMember[],
    tasks: HubTask[],
    milestones: HubMilestone[]
  ): HubProject {
    return {
      id: record.id,
      name: record.name,
      description: record.description,
      status: record.status,
      priority: record.priority,
      progress: record.progress,
      startDate: new Date(record.startDate),
      dueDate: new Date(record.dueDate),
      teamMembers,
      tasks,
      milestones,
      budget: {
        allocated: record.budget_allocated,
        spent: record.budget_spent,
        remaining: record.budget_remaining
      },
      tags: JSON.parse(record.tags || '[]'),
      aiInsights: {
        riskScore: record.ai_risk_score,
        recommendations: JSON.parse(record.ai_recommendations || '[]'),
        automatedTasks: record.ai_automated_tasks,
        predictedCompletion: new Date(record.ai_predicted_completion)
      },
      createdAt: new Date(record.created_at),
      updatedAt: new Date(record.updated_at)
    };
  }

  // Search and AI Operations
  async searchProjects(query: string): Promise<HubProject[]> {
    await this.initialize();

    // Use memorai's AI-powered search
    const searchResults = await memorai.memory.recall('hub-projects', query);
    const projectIds = searchResults.map((result: any) => result.metadata?.projectId).filter(Boolean);

    const projects: HubProject[] = [];
    for (const projectId of projectIds) {
      const project = await this.getProject(projectId);
      if (project) projects.push(project);
    }

    return projects;
  }

  // File Operations
  async uploadProjectFile(projectId: string, file: File, category: string = 'documents'): Promise<string> {
    await this.initialize();

    const fileName = `projects/${projectId}/${category}/${Date.now()}-${file.name}`;
    const uploadResult = await memorai.storage.upload(file, fileName);

    // Store file reference in memory for search
    await memorai.memory.store('hub-files',
      `File: ${file.name} for project ${projectId} in category ${category}`,
      {
        projectId,
        fileName,
        category,
        type: 'file'
      }
    );

    return uploadResult.url;
  }

  async getProjectFiles(projectId: string): Promise<any[]> {
    await this.initialize();

    const files = await memorai.storage.list(`projects/${projectId}/`);
    return files;
  }
}

// Export singleton instance
export const hubMemoraiService = new HubMemoraiService();
export default hubMemoraiService;
