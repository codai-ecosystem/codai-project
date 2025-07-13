/**
 * Hub Service - AI-Powered Project Management & Collaboration Platform
 * Complete project management with AI automation, team coordination, and analytics
 */

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  progress: number;
  startDate: Date;
  dueDate: Date;
  teamMembers: TeamMember[];
  tasks: Task[];
  milestones: Milestone[];
  budget: {
    allocated: number;
    spent: number;
    remaining: number;
  };
  tags: string[];
  aiInsights: {
    riskScore: number;
    recommendations: string[];
    automatedTasks: number;
    predictedCompletion: Date;
  };
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  availability: 'AVAILABLE' | 'BUSY' | 'AWAY' | 'OFFLINE';
  skills: string[];
  workload: number; // Percentage
  currentTasks: string[];
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'BLOCKED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  assignee?: TeamMember;
  reporter: TeamMember;
  estimatedHours: number;
  actualHours: number;
  dueDate: Date;
  tags: string[];
  dependencies: string[];
  aiSuggestions: {
    estimatedCompletion: Date;
    riskFactors: string[];
    automationOpportunities: string[];
  };
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  status: 'PENDING' | 'ACHIEVED' | 'DELAYED' | 'CANCELLED';
  tasks: string[];
  progress: number;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'DEVELOPMENT' | 'DESIGN' | 'MARKETING' | 'OPERATIONS' | 'CUSTOM';
  stages: WorkflowStage[];
  automationRules: AutomationRule[];
  estimatedDuration: number;
  usageCount: number;
}

interface WorkflowStage {
  id: string;
  name: string;
  description: string;
  type: 'TASK' | 'REVIEW' | 'APPROVAL' | 'AUTOMATED';
  requiredSkills: string[];
  estimatedHours: number;
  automationCapable: boolean;
}

interface AutomationRule {
  id: string;
  trigger: string;
  condition: string;
  action: string;
  enabled: boolean;
}

interface HubMetrics {
  activeProjects: number;
  completedProjects: number;
  totalTeamMembers: number;
  averageProjectCompletion: number;
  onTimeDelivery: number;
  budgetVariance: number;
  teamUtilization: number;
  automationSavings: number;
  riskProjects: number;
  upcomingDeadlines: number;
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export class HubService {
  private static instance: HubService;
  private projects: Map<string, Project> = new Map();
  private teamMembers: Map<string, TeamMember> = new Map();
  private workflows: Map<string, WorkflowTemplate> = new Map();

  static getInstance(): HubService {
    if (!HubService.instance) {
      HubService.instance = new HubService();
    }
    return HubService.instance;
  }

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Initialize sample team members
    const sampleMembers: TeamMember[] = [
      {
        id: 'tm-001',
        name: 'Alex Johnson',
        email: 'alex.johnson@company.com',
        role: 'Project Manager',
        avatar: '/avatars/alex.jpg',
        availability: 'AVAILABLE',
        skills: ['Project Management', 'Agile', 'Risk Management'],
        workload: 75,
        currentTasks: ['task-001', 'task-003']
      },
      {
        id: 'tm-002',
        name: 'Sarah Chen',
        email: 'sarah.chen@company.com',
        role: 'Full Stack Developer',
        avatar: '/avatars/sarah.jpg',
        availability: 'BUSY',
        skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
        workload: 90,
        currentTasks: ['task-002', 'task-004', 'task-005']
      },
      {
        id: 'tm-003',
        name: 'Michael Rodriguez',
        email: 'michael.rodriguez@company.com',
        role: 'UX Designer',
        avatar: '/avatars/michael.jpg',
        availability: 'AVAILABLE',
        skills: ['UI Design', 'User Research', 'Prototyping'],
        workload: 60,
        currentTasks: ['task-006']
      },
      {
        id: 'tm-004',
        name: 'Emily Watson',
        email: 'emily.watson@company.com',
        role: 'DevOps Engineer',
        avatar: '/avatars/emily.jpg',
        availability: 'AWAY',
        skills: ['Docker', 'Kubernetes', 'CI/CD', 'AWS'],
        workload: 80,
        currentTasks: ['task-007', 'task-008']
      }
    ];

    sampleMembers.forEach(member => {
      this.teamMembers.set(member.id, member);
    });

    // Initialize sample workflow templates
    const sampleWorkflows: WorkflowTemplate[] = [
      {
        id: 'wf-001',
        name: 'Web Application Development',
        description: 'Complete workflow for developing web applications',
        category: 'DEVELOPMENT',
        stages: [
          {
            id: 'stage-001',
            name: 'Requirements Analysis',
            description: 'Gather and analyze project requirements',
            type: 'TASK',
            requiredSkills: ['Business Analysis'],
            estimatedHours: 16,
            automationCapable: false
          },
          {
            id: 'stage-002',
            name: 'UI/UX Design',
            description: 'Create user interface and experience design',
            type: 'TASK',
            requiredSkills: ['UI Design', 'UX Design'],
            estimatedHours: 40,
            automationCapable: true
          },
          {
            id: 'stage-003',
            name: 'Frontend Development',
            description: 'Implement frontend components',
            type: 'TASK',
            requiredSkills: ['React', 'TypeScript'],
            estimatedHours: 80,
            automationCapable: true
          },
          {
            id: 'stage-004',
            name: 'Backend Development',
            description: 'Develop API and backend services',
            type: 'TASK',
            requiredSkills: ['Node.js', 'Database'],
            estimatedHours: 60,
            automationCapable: true
          },
          {
            id: 'stage-005',
            name: 'Testing & QA',
            description: 'Comprehensive testing and quality assurance',
            type: 'REVIEW',
            requiredSkills: ['Testing', 'QA'],
            estimatedHours: 32,
            automationCapable: true
          },
          {
            id: 'stage-006',
            name: 'Deployment',
            description: 'Deploy to production environment',
            type: 'AUTOMATED',
            requiredSkills: ['DevOps', 'CI/CD'],
            estimatedHours: 8,
            automationCapable: true
          }
        ],
        automationRules: [
          {
            id: 'rule-001',
            trigger: 'task_completed',
            condition: 'stage == "Frontend Development"',
            action: 'create_automated_tests',
            enabled: true
          },
          {
            id: 'rule-002',
            trigger: 'milestone_reached',
            condition: 'progress >= 80',
            action: 'schedule_deployment',
            enabled: true
          }
        ],
        estimatedDuration: 240,
        usageCount: 15
      }
    ];

    sampleWorkflows.forEach(workflow => {
      this.workflows.set(workflow.id, workflow);
    });

    // Initialize sample projects
    const sampleProjects: Project[] = [
      {
        id: 'proj-001',
        name: 'CodAI Platform Enhancement',
        description: 'Major enhancement to the CodAI ecosystem with new AI features',
        status: 'ACTIVE',
        priority: 'HIGH',
        progress: 65,
        startDate: new Date('2024-01-15'),
        dueDate: new Date('2024-03-30'),
        teamMembers: [sampleMembers[0], sampleMembers[1], sampleMembers[2]],
        tasks: [],
        milestones: [
          {
            id: 'ms-001',
            title: 'Phase 1 Complete',
            description: 'Complete all Phase 1 applications',
            dueDate: new Date('2024-02-15'),
            status: 'ACHIEVED',
            tasks: ['task-001', 'task-002'],
            progress: 100
          },
          {
            id: 'ms-002',
            title: 'Phase 2 Complete',
            description: 'Complete all Phase 2 applications',
            dueDate: new Date('2024-03-15'),
            status: 'PENDING',
            tasks: ['task-003', 'task-004'],
            progress: 70
          }
        ],
        budget: {
          allocated: 250000,
          spent: 162500,
          remaining: 87500
        },
        tags: ['AI', 'Platform', 'Enhancement'],
        aiInsights: {
          riskScore: 25,
          recommendations: [
            'Consider adding more testing resources for Phase 2',
            'Monitor API rate limits as usage scales',
            'Schedule performance review before Phase 3'
          ],
          automatedTasks: 12,
          predictedCompletion: new Date('2024-03-28')
        }
      },
      {
        id: 'proj-002',
        name: 'Mobile Experience Optimization',
        description: 'Optimize all applications for mobile devices',
        status: 'PLANNING',
        priority: 'MEDIUM',
        progress: 15,
        startDate: new Date('2024-02-01'),
        dueDate: new Date('2024-05-30'),
        teamMembers: [sampleMembers[2], sampleMembers[3]],
        tasks: [],
        milestones: [],
        budget: {
          allocated: 150000,
          spent: 15000,
          remaining: 135000
        },
        tags: ['Mobile', 'UX', 'Optimization'],
        aiInsights: {
          riskScore: 10,
          recommendations: [
            'Start with most-used applications first',
            'Consider progressive web app approach',
            'Implement responsive design patterns'
          ],
          automatedTasks: 3,
          predictedCompletion: new Date('2024-05-25')
        }
      }
    ];

    sampleProjects.forEach(project => {
      this.projects.set(project.id, project);
    });
  }

  // Project Management Methods
  async createProject(projectData: Partial<Project>): Promise<Project> {
    const project: Project = {
      id: generateUUID(),
      name: projectData.name || 'Untitled Project',
      description: projectData.description || '',
      status: projectData.status || 'PLANNING',
      priority: projectData.priority || 'MEDIUM',
      progress: 0,
      startDate: projectData.startDate || new Date(),
      dueDate: projectData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      teamMembers: projectData.teamMembers || [],
      tasks: [],
      milestones: [],
      budget: projectData.budget || { allocated: 0, spent: 0, remaining: 0 },
      tags: projectData.tags || [],
      aiInsights: {
        riskScore: 0,
        recommendations: [],
        automatedTasks: 0,
        predictedCompletion: projectData.dueDate || new Date()
      }
    };

    this.projects.set(project.id, project);

    // Generate AI insights
    await this.generateAIInsights(project.id);

    return project;
  }

  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProject(projectId: string): Promise<Project | null> {
    return this.projects.get(projectId) || null;
  }

  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project | null> {
    const project = this.projects.get(projectId);
    if (!project) return null;

    const updatedProject = { ...project, ...updates };
    this.projects.set(projectId, updatedProject);

    // Regenerate AI insights if significant changes
    if (updates.status || updates.dueDate || updates.teamMembers) {
      await this.generateAIInsights(projectId);
    }

    return updatedProject;
  }

  async deleteProject(projectId: string): Promise<boolean> {
    return this.projects.delete(projectId);
  }

  // Team Management Methods
  async getTeamMembers(): Promise<TeamMember[]> {
    return Array.from(this.teamMembers.values());
  }

  async getTeamMember(memberId: string): Promise<TeamMember | null> {
    return this.teamMembers.get(memberId) || null;
  }

  async updateTeamMember(memberId: string, updates: Partial<TeamMember>): Promise<TeamMember | null> {
    const member = this.teamMembers.get(memberId);
    if (!member) return null;

    const updatedMember = { ...member, ...updates };
    this.teamMembers.set(memberId, updatedMember);
    return updatedMember;
  }

  // Workflow Management Methods
  async getWorkflowTemplates(): Promise<WorkflowTemplate[]> {
    return Array.from(this.workflows.values());
  }

  async getWorkflowTemplate(workflowId: string): Promise<WorkflowTemplate | null> {
    return this.workflows.get(workflowId) || null;
  }

  async applyWorkflowTemplate(projectId: string, workflowId: string): Promise<boolean> {
    const project = this.projects.get(projectId);
    const workflow = this.workflows.get(workflowId);

    if (!project || !workflow) return false;

    // Create tasks from workflow stages
    const tasks: Task[] = workflow.stages.map((stage, index) => ({
      id: generateUUID(),
      title: stage.name,
      description: stage.description,
      status: index === 0 ? 'TODO' : 'TODO',
      priority: 'MEDIUM',
      assignee: undefined,
      reporter: project.teamMembers[0],
      estimatedHours: stage.estimatedHours,
      actualHours: 0,
      dueDate: new Date(Date.now() + (index + 1) * 7 * 24 * 60 * 60 * 1000),
      tags: [workflow.category],
      dependencies: index > 0 ? [workflow.stages[index - 1].id] : [],
      aiSuggestions: {
        estimatedCompletion: new Date(Date.now() + stage.estimatedHours * 60 * 60 * 1000),
        riskFactors: [],
        automationOpportunities: stage.automationCapable ? ['Automated testing', 'Code generation'] : []
      }
    }));

    project.tasks = tasks;
    this.projects.set(projectId, project);

    return true;
  }

  // AI-Powered Insights and Analytics
  async generateAIInsights(projectId: string): Promise<void> {
    const project = this.projects.get(projectId);
    if (!project) return;

    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 1000));

    const riskFactors = [];
    let riskScore = 0;

    // Analyze timeline risk
    const timeRemaining = project.dueDate.getTime() - Date.now();
    const progressRatio = project.progress / 100;
    const expectedProgress = Math.min(100, ((Date.now() - project.startDate.getTime()) / (project.dueDate.getTime() - project.startDate.getTime())) * 100);

    if (project.progress < expectedProgress - 20) {
      riskScore += 30;
      riskFactors.push('Project is behind schedule');
    }

    // Analyze budget risk
    const budgetUsed = (project.budget.spent / project.budget.allocated) * 100;
    if (budgetUsed > project.progress + 10) {
      riskScore += 25;
      riskFactors.push('Budget spending exceeds progress');
    }

    // Analyze team workload
    const avgWorkload = project.teamMembers.reduce((sum, member) => sum + member.workload, 0) / project.teamMembers.length;
    if (avgWorkload > 85) {
      riskScore += 20;
      riskFactors.push('Team is overloaded');
    }

    const recommendations = [];
    if (riskScore > 50) {
      recommendations.push('Consider extending timeline or adding resources');
    }
    if (budgetUsed > 80) {
      recommendations.push('Review budget allocation and spending');
    }
    if (avgWorkload > 80) {
      recommendations.push('Balance workload across team members');
    }

    // Predict completion date
    const remainingWork = 100 - project.progress;
    const currentVelocity = Math.max(1, project.progress / Math.max(1, (Date.now() - project.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)));
    const weeksToComplete = remainingWork / currentVelocity;
    const predictedCompletion = new Date(Date.now() + weeksToComplete * 7 * 24 * 60 * 60 * 1000);

    project.aiInsights = {
      riskScore: Math.min(100, riskScore),
      recommendations,
      automatedTasks: project.tasks?.filter(task => task.aiSuggestions.automationOpportunities.length > 0).length || 0,
      predictedCompletion
    };

    this.projects.set(projectId, project);
  }

  async getHubMetrics(): Promise<HubMetrics> {
    const projects = Array.from(this.projects.values());
    const teamMembers = Array.from(this.teamMembers.values());

    const activeProjects = projects.filter(p => p.status === 'ACTIVE').length;
    const completedProjects = projects.filter(p => p.status === 'COMPLETED').length;
    const totalProjects = projects.length;

    const averageProgress = totalProjects > 0
      ? projects.reduce((sum, p) => sum + p.progress, 0) / totalProjects
      : 0;

    const onTimeProjects = projects.filter(p =>
      p.status === 'COMPLETED' ||
      (p.aiInsights.predictedCompletion <= p.dueDate)
    ).length;

    const onTimeDelivery = totalProjects > 0 ? (onTimeProjects / totalProjects) * 100 : 0;

    const totalBudgetAllocated = projects.reduce((sum, p) => sum + p.budget.allocated, 0);
    const totalBudgetSpent = projects.reduce((sum, p) => sum + p.budget.spent, 0);
    const budgetVariance = totalBudgetAllocated > 0
      ? ((totalBudgetSpent - totalBudgetAllocated) / totalBudgetAllocated) * 100
      : 0;

    const teamUtilization = teamMembers.length > 0
      ? teamMembers.reduce((sum, m) => sum + m.workload, 0) / teamMembers.length
      : 0;

    const automationSavings = projects.reduce((sum, p) => sum + (p.aiInsights.automatedTasks * 4), 0); // 4 hours saved per automated task

    const riskProjects = projects.filter(p => p.aiInsights.riskScore > 50).length;

    const upcomingDeadlines = projects.filter(p => {
      const daysUntilDue = (p.dueDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000);
      return daysUntilDue <= 7 && daysUntilDue > 0;
    }).length;

    return {
      activeProjects,
      completedProjects,
      totalTeamMembers: teamMembers.length,
      averageProjectCompletion: averageProgress,
      onTimeDelivery,
      budgetVariance,
      teamUtilization,
      automationSavings,
      riskProjects,
      upcomingDeadlines
    };
  }

  // Collaboration Features
  async getTeamAvailability(): Promise<Array<{
    member: TeamMember;
    availability: string;
    nextAvailable: Date;
    currentCapacity: number;
  }>> {
    const members = Array.from(this.teamMembers.values());

    return members.map(member => ({
      member,
      availability: member.availability,
      nextAvailable: member.availability === 'AVAILABLE'
        ? new Date()
        : new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000),
      currentCapacity: Math.max(0, 100 - member.workload)
    }));
  }

  async optimizeTaskAssignment(projectId: string): Promise<Array<{
    taskId: string;
    recommendedAssignee: TeamMember;
    confidence: number;
    reasoning: string;
  }>> {
    const project = this.projects.get(projectId);
    if (!project || !project.tasks) return [];

    const unassignedTasks = project.tasks.filter(task => !task.assignee);
    const availableMembers = project.teamMembers.filter(member => member.workload < 90);

    return unassignedTasks.map(task => {
      // Simple matching algorithm based on skills and workload
      const scores = availableMembers.map(member => {
        const skillMatch = task.tags.some(tag =>
          member.skills.some(skill => skill.toLowerCase().includes(tag.toLowerCase()))
        );
        const workloadScore = (100 - member.workload) / 100;
        const availabilityScore = member.availability === 'AVAILABLE' ? 1 : 0.5;

        return {
          member,
          score: (skillMatch ? 0.5 : 0) + (workloadScore * 0.3) + (availabilityScore * 0.2),
          reasoning: `Skill match: ${skillMatch ? 'Yes' : 'No'}, Workload: ${member.workload}%, Available: ${member.availability}`
        };
      });

      const best = scores.reduce((prev, current) =>
        prev.score > current.score ? prev : current
      );

      return {
        taskId: task.id,
        recommendedAssignee: best.member,
        confidence: Math.round(best.score * 100),
        reasoning: best.reasoning
      };
    });
  }
}
