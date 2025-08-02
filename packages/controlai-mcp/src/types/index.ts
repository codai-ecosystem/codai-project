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

// Advanced Analytics interfaces
export interface AdvancedAnalytics {
    projectTrends: ProjectTrendData[];
    agentPerformanceMetrics: AgentMetrics[];
    resourceUtilization: ResourceMetrics;
    predictiveInsights: PredictiveData[];
    customReports: ReportTemplate[];
    timeSeriesData: TimeSeriesData[];
}

export interface ProjectTrendData {
    projectId: string;
    projectName: string;
    completionTrend: TimeSeriesPoint[];
    velocityMetrics: VelocityData;
    bottleneckAnalysis: BottleneckData[];
    riskIndicators: RiskIndicator[];
    milestoneProgress: MilestoneProgress[];
}

export interface AgentMetrics {
    agentId: string;
    agentName: string;
    performanceScore: number; // 0-100
    taskCompletionRate: number; // 0-100
    averageTaskDuration: number; // hours
    qualityScore: number; // 0-100
    utilizationRate: number; // 0-100
    collaborationScore: number; // 0-100
    specializations: AgentSpecialization[];
    improvementAreas: string[];
}

export interface ResourceMetrics {
    totalCapacity: number;
    currentUtilization: number; // 0-100
    peakUtilization: number; // 0-100
    averageUtilization: number; // 0-100
    resourceAllocation: ResourceAllocation[];
    bottlenecks: ResourceBottleneck[];
    optimizationOpportunities: OptimizationOpportunity[];
}

export interface PredictiveData {
    type: PredictionType;
    confidence: number; // 0-100
    timeHorizon: number; // days
    prediction: string;
    factors: PredictionFactor[];
    recommendations: string[];
    riskLevel: RiskLevel;
}

export interface ReportTemplate {
    id: string;
    name: string;
    description: string;
    type: ReportType;
    parameters: ReportParameter[];
    schedule?: ReportSchedule;
    format: ReportFormat[];
    recipients: string[];
}

export interface TimeSeriesData {
    timestamp: Date;
    metric: string;
    value: number;
    metadata?: Record<string, unknown>;
}

export interface TimeSeriesPoint {
    timestamp: Date;
    value: number;
    metadata?: Record<string, unknown>;
}

export interface VelocityData {
    averageTasksPerDay: number;
    averageCompletionTime: number; // hours
    throughput: number; // tasks per week
    cycleTime: number; // hours
    leadTime: number; // hours
    velocityTrend: TimeSeriesPoint[];
}

export interface BottleneckData {
    type: BottleneckType;
    severity: Severity;
    description: string;
    affectedResources: string[];
    impact: string;
    suggestedActions: string[];
    estimatedResolutionTime: number; // hours
}

export interface RiskIndicator {
    type: RiskType;
    level: RiskLevel;
    description: string;
    probability: number; // 0-100
    impact: number; // 0-100
    mitigation: string[];
    owner?: string;
}

export interface MilestoneProgress {
    milestoneId: string;
    name: string;
    targetDate: Date;
    currentProgress: number; // 0-100
    predictedCompletion: Date;
    isOnTrack: boolean;
    risks: string[];
}

export interface AgentSpecialization {
    capability: AgentCapability;
    proficiencyLevel: number; // 0-100
    experiencePoints: number;
    certifications: string[];
    recentProjects: string[];
}

export interface ResourceAllocation {
    resourceType: string;
    allocated: number;
    available: number;
    utilized: number; // 0-100
    trend: TimeSeriesPoint[];
}

export interface ResourceBottleneck {
    resourceType: string;
    severity: Severity;
    description: string;
    suggestedActions: string[];
    estimatedImpact: string;
}

export interface OptimizationOpportunity {
    type: OptimizationType;
    description: string;
    potentialImprovement: string;
    implementationEffort: ImplementationEffort;
    priority: Priority;
    estimatedROI: number; // percentage
}

export interface PredictionFactor {
    name: string;
    weight: number; // 0-100
    currentValue: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    impact: 'positive' | 'negative' | 'neutral';
}

export interface ReportParameter {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date' | 'enum';
    required: boolean;
    defaultValue?: unknown;
    options?: string[];
    description: string;
}

export interface ReportSchedule {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    time: string; // HH:MM format
    timezone: string;
    enabled: boolean;
}

// Enums for Analytics
export enum PredictionType {
    PROJECT_COMPLETION = 'project_completion',
    RESOURCE_DEMAND = 'resource_demand',
    BOTTLENECK_EMERGENCE = 'bottleneck_emergence',
    QUALITY_DEGRADATION = 'quality_degradation',
    TEAM_PERFORMANCE = 'team_performance'
}

export enum RiskLevel {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
}

export enum RiskType {
    SCHEDULE = 'schedule',
    RESOURCE = 'resource',
    QUALITY = 'quality',
    TECHNICAL = 'technical',
    BUSINESS = 'business'
}

export enum ReportType {
    DASHBOARD = 'dashboard',
    EXECUTIVE_SUMMARY = 'executive_summary',
    DETAILED_ANALYSIS = 'detailed_analysis',
    TREND_REPORT = 'trend_report',
    PERFORMANCE_REVIEW = 'performance_review'
}

export enum ReportFormat {
    PDF = 'pdf',
    CSV = 'csv',
    JSON = 'json',
    HTML = 'html',
    EXCEL = 'excel'
}

export enum BottleneckType {
    RESOURCE_CONSTRAINT = 'resource_constraint',
    SKILL_GAP = 'skill_gap',
    PROCESS_INEFFICIENCY = 'process_inefficiency',
    DEPENDENCY_DELAY = 'dependency_delay',
    QUALITY_ISSUE = 'quality_issue'
}

export enum Severity {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
}

export enum OptimizationType {
    RESOURCE_REALLOCATION = 'resource_reallocation',
    PROCESS_IMPROVEMENT = 'process_improvement',
    SKILL_DEVELOPMENT = 'skill_development',
    TOOL_UPGRADE = 'tool_upgrade',
    WORKFLOW_OPTIMIZATION = 'workflow_optimization'
}

export enum ImplementationEffort {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    VERY_HIGH = 'very_high'
}

// Security interfaces
export interface SecurityModule {
    authentication: AuthenticationConfig;
    authorization: AuthorizationConfig;
    auditLogging: AuditConfig;
    dataEncryption: EncryptionConfig;
    rateAbusePrevention: RateLimitConfig;
}

export interface AuthenticationConfig {
    providers: AuthProvider[];
    sessionTimeout: number; // minutes
    maxFailedAttempts: number;
    lockoutDuration: number; // minutes
    requireMFA: boolean;
    passwordPolicy: PasswordPolicy;
}

export interface AuthProvider {
    name: string;
    type: 'oauth2' | 'saml' | 'ldap' | 'local';
    config: Record<string, unknown>;
    enabled: boolean;
    priority: number;
}

export interface AuthorizationConfig {
    rbacEnabled: boolean;
    roles: Role[];
    permissions: Permission[];
    defaultRole: string;
    inheritanceEnabled: boolean;
}

export interface Role {
    id: string;
    name: string;
    description: string;
    permissions: string[];
    inheritsFrom?: string[];
    isSystem: boolean;
}

export interface Permission {
    id: string;
    name: string;
    description: string;
    resource: string;
    action: string;
    scope?: string;
}

export interface AuditConfig {
    enabled: boolean;
    retentionDays: number;
    categories: AuditCategory[];
    realTimeAlerts: boolean;
    exportFormats: string[];
}

export interface AuditCategory {
    name: string;
    enabled: boolean;
    logLevel: 'info' | 'warn' | 'error';
    includePayload: boolean;
}

export interface EncryptionConfig {
    algorithm: string;
    keySize: number;
    rotationInterval: number; // days
    encryptAtRest: boolean;
    encryptInTransit: boolean;
    keyManagement: KeyManagementConfig;
}

export interface KeyManagementConfig {
    provider: 'local' | 'aws-kms' | 'azure-kv' | 'hashicorp-vault';
    config: Record<string, unknown>;
    backupEnabled: boolean;
}

export interface RateLimitConfig {
    enabled: boolean;
    windowMs: number;
    maxRequests: number;
    skipSuccessfulRequests: boolean;
    skipFailedRequests: boolean;
}

export interface PasswordPolicy {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    preventReuse: number; // number of previous passwords to check
    expirationDays?: number;
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
