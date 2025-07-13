
export interface Project {
  id: string;
  name: string;
  status: 'planning' | 'active' | 'completed';
  progress: number;
  tasks: Task[];
}

export interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
}

export class ProjectManagementFlow {
  async createProject(name: string): Promise<Project> {
    return {
      id: this.generateId(),
      name,
      status: 'planning',
      progress: 0,
      tasks: []
    };
  }

  async addTask(projectId: string, title: string): Promise<Task> {
    return {
      id: this.generateId(),
      title,
      status: 'todo',
      priority: 'medium'
    };
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

export const projectManagementFlow = new ProjectManagementFlow();
