export interface Project {
    id: string;
    name: string;
    description: string;
    status: ProjectStatus;
    priority: Priority;
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
    tags: string[];
    metadata: Record<string, unknown>;
}

export interface Task {
    id: string;
    projectId: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: Priority;
    category: TaskCategory;
    estimatedHours?: number;
    actualHours?: number;
    assignedAgentId?: string;
    dependencies: string[]; // Task IDs
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
    startedAt?: Date;
    completedAt?: Date;
    dueDate?: Date;
    metadata: Record<string, any>;
}

export interface Agent {
    id: string;
    name: string;
    type: AgentType;
    capabilities: AgentCapability[];
    status: AgentStatus;
    currentTaskId?: string;
    workspaceId: string;
    maxConcurrentTasks: number;
    performance: AgentPerformance;
    lastActiveAt: Date;
    createdAt: Date;
    metadata: Record<string, any>;
}

export interface TaskAssignment {
    id: string;
    taskId: string;
    agentId: string;
    status: AssignmentStatus;
    assignedAt: Date;
    startedAt?: Date;
    completedAt?: Date;
    notes?: string;
    quality?: number; // 0-100
}

export interface TaskDependency {
    id: string;
    taskId: string;
    dependsOnTaskId: string;
    type: DependencyType;
    createdAt: Date;
}

export interface AgentSession {
    id: string;
    agentId: string;
    workspaceId: string;
    status: SessionStatus;
    startedAt: Date;
    lastActiveAt: Date;
    endedAt?: Date;
    tasksCompleted: number;
    tasksInProgress: string[];
}

// Enums
export enum ProjectStatus {
    PLANNING = 'planning',
    ACTIVE = 'active',
    IN_PROGRESS = 'in_progress',
    ON_HOLD = 'on_hold',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
}

export enum TaskStatus {
    TODO = 'todo',
    ASSIGNED = 'assigned',
    IN_PROGRESS = 'in_progress',
    BLOCKED = 'blocked',
    REVIEW = 'review',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
}

export enum Priority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
}

export enum TaskCategory {
    DEVELOPMENT = 'development',
    TESTING = 'testing',
    DOCUMENTATION = 'documentation',
    RESEARCH = 'research',
    PLANNING = 'planning',
    DEPLOYMENT = 'deployment',
    MAINTENANCE = 'maintenance',
    REVIEW = 'review'
}

export enum AgentType {
    SENIOR_DEVELOPER = 'senior_developer',
    QA_ENGINEER = 'qa_engineer',
    DEVOPS_ENGINEER = 'devops_engineer',
    UX_DESIGNER = 'ux_designer',
    SECURITY_ENGINEER = 'security_engineer',
    PROJECT_MANAGER = 'project_manager',
    DATA_SCIENTIST = 'data_scientist',
    GENERIC = 'generic'
}

export enum AgentCapability {
    PROGRAMMING = 'programming',
    JAVASCRIPT = 'javascript',
    TYPESCRIPT = 'typescript',
    REACT = 'react',
    NODE_JS = 'node_js',
    PYTHON = 'python',
    TESTING = 'testing',
    DEPLOYMENT = 'deployment',
    ANALYSIS = 'analysis',
    DESIGN = 'design',
    RESEARCH = 'research',
    SECURITY = 'security',
    UI_UX = 'ui_ux',
    DEVOPS = 'devops',
    DATABASES = 'databases',
    MACHINE_LEARNING = 'machine_learning',
    DOCUMENTATION = 'documentation',
    CODE_REVIEW = 'code_review',
    PROJECT_MANAGEMENT = 'project_management'
}

export enum AgentStatus {
    AVAILABLE = 'available',
    BUSY = 'busy',
    OFFLINE = 'offline',
    BLOCKED = 'blocked'
}

export enum AssignmentStatus {
    ASSIGNED = 'assigned',
    ACCEPTED = 'accepted',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled'
}

export enum DependencyType {
    BLOCKS = 'blocks',
    DEPENDS_ON = 'depends_on',
    RELATED = 'related'
}

export enum SessionStatus {
    ACTIVE = 'active',
    IDLE = 'idle',
    ENDED = 'ended'
}

// Performance metrics
export interface AgentPerformance {
    tasksCompleted: number;
    averageCompletionTime: number; // in hours
    qualityScore: number; // 0-100
    reliabilityScore: number; // 0-100
    efficiencyScore: number; // 0-100
    successRate: number; // 0-100
    lastUpdated: Date;
}

// Dashboard data interface
export interface DashboardData {
    workspaceId: string;
    metrics: {
        totalAgents: number;
        activeAgents: number;
        busyAgents: number;
        availableAgents: number;
        totalProjects: number;
        activeProjects: number;
        completedProjects: number;
        availableTasks: number;
    };
    agents: Agent[];
    recentProjects: Project[];
    availableTasks: Task[];
}

// AI Analysis results
export interface TaskAnalysis {
    complexity: number; // 0-100
    estimatedHours: number;
    suggestedCategory: TaskCategory;
    suggestedPriority: Priority;
    requiredCapabilities: AgentCapability[];
    potentialRisks: string[];
    dependencies: string[];
    confidence: number; // 0-100
}

export interface PlanAnalysis {
    tasks: TaskAnalysis[];
    suggestedTasks: TaskSuggestion[];
    projectComplexity: number;
    estimatedDuration: number;
    suggestedAgents: AgentType[];
    riskAssessment: string[];
    recommendations: string[];
}

// Task and Agent suggestions
export interface TaskSuggestion {
    title: string;
    description: string;
    priority: Priority;
    category: TaskCategory;
    estimatedHours?: number;
    tags?: string[];
    confidence: number;
}

export interface AgentSuggestion {
    agentId: string;
    agentName: string;
    confidence: number;
    reasoning: string;
}

// WebSocket message types
export interface WebSocketMessage {
    type: MessageType;
    payload: unknown;
    timestamp: Date;
}

export enum MessageType {
    CONNECTION_ESTABLISHED = 'connection_established',
    HEARTBEAT = 'heartbeat',
    PROJECT_CREATED = 'project_created',
    PROJECT_UPDATED = 'project_updated',
    TASK_CREATED = 'task_created',
    TASK_ASSIGNED = 'task_assigned',
    TASK_STATUS_UPDATED = 'task_status_updated',
    AGENT_REGISTERED = 'agent_registered',
    AGENT_STATUS_UPDATED = 'agent_status_updated',
    PLAN_ANALYZED = 'plan_analyzed',
    CONFLICT_DETECTED = 'conflict_detected',
    OPTIMIZATION_SUGGESTED = 'optimization_suggested'
}

// WebSocket message types (legacy)
export interface LegacyWebSocketMessage {
    type: WebSocketMessageType;
    payload: unknown;
    timestamp: Date;
}

export enum WebSocketMessageType {
    TASK_CREATED = 'task_created',
    TASK_UPDATED = 'task_updated',
    TASK_ASSIGNED = 'task_assigned',
    TASK_COMPLETED = 'task_completed',
    AGENT_REGISTERED = 'agent_registered',
    AGENT_STATUS_CHANGED = 'agent_status_changed',
    PROJECT_CREATED = 'project_created',
    PROJECT_UPDATED = 'project_updated',
    SYSTEM_ALERT = 'system_alert'
}

// Configuration types
export interface ControlAIConfig {
    server: {
        port: number;
        host: string;
        cors: {
            origin: string;
        };
    };
    database: {
        path?: string;
    };
    ai: {
        provider: string;
        endpoint: string;
        apiKey: string;
        deploymentName: string;
    };
    websocket: {
        enabled: boolean;
        heartbeatInterval: number;
    };
    agents?: {
        maxConcurrentTasks: number;
        heartbeatInterval: number;
        inactiveThreshold: number;
    };
    dashboard?: {
        enabled: boolean;
        port: number;
    };
}
