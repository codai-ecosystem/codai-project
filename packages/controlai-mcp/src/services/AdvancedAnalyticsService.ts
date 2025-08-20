import { DatabaseService } from '../database/DatabaseService.js';
import { AIService } from '../ai/AIService.js';
import {
    AdvancedAnalytics,
    ProjectTrendData,
    AgentMetrics,
    ResourceMetrics,
    PredictiveData,
    ReportTemplate,
    TimeSeriesData,
    TimeSeriesPoint,
    VelocityData,
    BottleneckData,
    RiskIndicator,
    MilestoneProgress,
    AgentSpecialization,
    ResourceAllocation,
    ResourceBottleneck,
    OptimizationOpportunity,
    PredictionFactor,
    PredictionType,
    RiskLevel,
    RiskType,
    BottleneckType,
    Severity,
    OptimizationType,
    ImplementationEffort,
    ReportType,
    ReportFormat,
    Task,
    Agent,
    Project,
    TaskStatus,
    AgentCapability,
    Priority
} from '../types/index.js';

/**
 * Advanced Analytics Service for ControlAI MCP
 * Provides comprehensive analytics, reporting, and predictive insights
 */
export class AdvancedAnalyticsService {
    private metricsCache: Map<string, { data: any; timestamp: number; ttl: number }>;
    private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

    constructor(
        private database: DatabaseService,
        private aiService: AIService
    ) {
        this.metricsCache = new Map();
    }

    /**
     * Get comprehensive analytics data
     */
    async getAdvancedAnalytics(timeRange?: { start: Date; end: Date }): Promise<AdvancedAnalytics> {
        const cacheKey = `analytics-${timeRange?.start?.getTime()}-${timeRange?.end?.getTime()}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        const [
            projectTrends,
            agentMetrics,
            resourceUtilization,
            predictiveInsights,
            customReports,
            timeSeriesData
        ] = await Promise.all([
            this.getProjectTrends(timeRange),
            this.getAgentPerformanceMetrics(timeRange),
            this.getResourceUtilization(timeRange),
            this.generatePredictiveInsights(timeRange),
            this.getCustomReports(),
            this.getTimeSeriesData(timeRange)
        ]);

        const analytics: AdvancedAnalytics = {
            projectTrends,
            agentPerformanceMetrics: agentMetrics,
            resourceUtilization,
            predictiveInsights,
            customReports,
            timeSeriesData
        };

        this.setCachedData(cacheKey, analytics, this.CACHE_TTL);
        return analytics;
    }

    /**
     * Analyze project trends and performance
     */
    async getProjectTrends(timeRange?: { start: Date; end: Date }): Promise<ProjectTrendData[]> {
        const projects = await this.database.getAllProjects();
        const trends: ProjectTrendData[] = [];

        for (const project of projects) {
            const tasks = await this.database.getTasksByProject(project.id);
            const completionTrend = await this.calculateCompletionTrend(project, tasks, timeRange);
            const velocityMetrics = await this.calculateVelocityMetrics(project, tasks, timeRange);
            const bottlenecks = await this.analyzeBottlenecks(project, tasks);
            const risks = await this.assessProjectRisks(project, tasks);
            const milestones = await this.getMilestoneProgress(project, tasks);

            trends.push({
                projectId: project.id,
                projectName: project.name,
                completionTrend,
                velocityMetrics,
                bottleneckAnalysis: bottlenecks,
                riskIndicators: risks,
                milestoneProgress: milestones
            });
        }

        return trends;
    }

    /**
     * Get comprehensive agent performance metrics
     */
    async getAgentPerformanceMetrics(timeRange?: { start: Date; end: Date }): Promise<AgentMetrics[]> {
        const agents = await this.database.getAllAgents();
        const metrics: AgentMetrics[] = [];

        for (const agent of agents) {
            // Get all tasks and filter by agent and time range
            const allTasks = await this.database.getAvailableTasks();
            const tasks = allTasks.filter((t: Task) => t.assignedAgentId === agent.id);
            const completedTasks = tasks.filter((t: Task) => t.status === TaskStatus.COMPLETED);

            const performanceScore = this.calculatePerformanceScore(agent, tasks);
            const taskCompletionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;
            const avgDuration = this.calculateAverageTaskDuration(completedTasks);
            const qualityScore = await this.calculateQualityScore(agent, completedTasks);
            const utilizationRate = this.calculateUtilizationRate(agent, tasks, timeRange);
            const collaborationScore = await this.calculateCollaborationScore(agent, tasks);
            const specializations = await this.analyzeAgentSpecializations(agent, tasks);
            const improvementAreas = await this.identifyImprovementAreas(agent, tasks);

            metrics.push({
                agentId: agent.id,
                agentName: agent.name,
                performanceScore,
                taskCompletionRate,
                averageTaskDuration: avgDuration,
                qualityScore,
                utilizationRate,
                collaborationScore,
                specializations,
                improvementAreas
            });
        }

        return metrics;
    }

    /**
     * Analyze resource utilization and capacity
     */
    async getResourceUtilization(timeRange?: { start: Date; end: Date }): Promise<ResourceMetrics> {
        const agents = await this.database.getAllAgents();
        const tasks = await this.database.getAvailableTasks();
        const activeTasks = tasks.filter((t: Task) =>
            t.status === TaskStatus.IN_PROGRESS || t.status === TaskStatus.ASSIGNED
        );

        const totalCapacity = agents.reduce((sum, agent) => sum + agent.maxConcurrentTasks, 0);
        const currentUtilization = (activeTasks.length / totalCapacity) * 100;

        const resourceAllocation = await this.calculateResourceAllocation(agents, tasks, timeRange);
        const bottlenecks = await this.identifyResourceBottlenecks(agents, tasks);
        const optimizations = await this.findOptimizationOpportunities(agents, tasks);

        return {
            totalCapacity,
            currentUtilization,
            peakUtilization: await this.calculatePeakUtilization(timeRange),
            averageUtilization: await this.calculateAverageUtilization(timeRange),
            resourceAllocation,
            bottlenecks,
            optimizationOpportunities: optimizations
        };
    }

    /**
     * Generate predictive insights using AI
     */
    async generatePredictiveInsights(timeRange?: { start: Date; end: Date }): Promise<PredictiveData[]> {
        const insights: PredictiveData[] = [];

        // Project completion predictions
        const projects = await this.database.getAllProjects();
        for (const project of projects.filter(p => p.status === 'active')) {
            const tasks = await this.database.getTasksByProject(project.id);
            const completionPrediction = await this.predictProjectCompletion(project, tasks);
            insights.push(completionPrediction);
        }

        // Resource demand predictions
        const resourceDemand = await this.predictResourceDemand(timeRange);
        insights.push(resourceDemand);

        // Bottleneck predictions
        const bottleneckPredictions = await this.predictBottlenecks(timeRange);
        insights.push(...bottleneckPredictions);

        return insights;
    }

    /**
     * Calculate project completion trend
     */
    private async calculateCompletionTrend(
        project: Project,
        tasks: Task[],
        timeRange?: { start: Date; end: Date }
    ): Promise<TimeSeriesPoint[]> {
        const trend: TimeSeriesPoint[] = [];
        const startDate = timeRange?.start || new Date(project.createdAt);
        const endDate = timeRange?.end || new Date();

        // Generate daily completion percentage data
        const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

        for (let i = 0; i <= daysDiff; i++) {
            const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
            const completedByDate = tasks.filter(t =>
                t.status === TaskStatus.COMPLETED &&
                t.completedAt &&
                new Date(t.completedAt) <= date
            ).length;

            const completionPercentage = tasks.length > 0 ? (completedByDate / tasks.length) * 100 : 0;

            trend.push({
                timestamp: date,
                value: completionPercentage,
                metadata: { completedTasks: completedByDate, totalTasks: tasks.length }
            });
        }

        return trend;
    }

    /**
     * Calculate velocity metrics for a project
     */
    private async calculateVelocityMetrics(
        project: Project,
        tasks: Task[],
        timeRange?: { start: Date; end: Date }
    ): Promise<VelocityData> {
        const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED);
        const daysPeriod = timeRange ?
            Math.ceil((timeRange.end.getTime() - timeRange.start.getTime()) / (1000 * 60 * 60 * 24)) :
            Math.ceil((new Date().getTime() - new Date(project.createdAt).getTime()) / (1000 * 60 * 60 * 24));

        const averageTasksPerDay = daysPeriod > 0 ? completedTasks.length / daysPeriod : 0;
        const throughput = averageTasksPerDay * 7; // tasks per week

        const durations = completedTasks
            .filter(t => t.startedAt && t.completedAt)
            .map(t => {
                const start = new Date(t.startedAt!).getTime();
                const end = new Date(t.completedAt!).getTime();
                return (end - start) / (1000 * 60 * 60); // hours
            });

        const averageCompletionTime = durations.length > 0 ?
            durations.reduce((sum, d) => sum + d, 0) / durations.length : 0;

        // Generate velocity trend
        const velocityTrend = await this.calculateVelocityTrend(completedTasks, timeRange);

        return {
            averageTasksPerDay,
            averageCompletionTime,
            throughput,
            cycleTime: averageCompletionTime,
            leadTime: averageCompletionTime * 1.2, // Estimate including wait time
            velocityTrend
        };
    }

    /**
     * Analyze bottlenecks in project execution
     */
    private async analyzeBottlenecks(project: Project, tasks: Task[]): Promise<BottleneckData[]> {
        const bottlenecks: BottleneckData[] = [];

        // Identify blocked tasks
        const blockedTasks = tasks.filter(t => t.status === TaskStatus.BLOCKED);
        if (blockedTasks.length > 0) {
            bottlenecks.push({
                type: BottleneckType.DEPENDENCY_DELAY,
                severity: blockedTasks.length > 3 ? Severity.HIGH : Severity.MEDIUM,
                description: `${blockedTasks.length} tasks are currently blocked`,
                affectedResources: blockedTasks.map(t => t.id),
                impact: `Project completion may be delayed by ${blockedTasks.length * 2} days`,
                suggestedActions: [
                    'Review and resolve blocking dependencies',
                    'Consider alternative approaches for blocked tasks',
                    'Escalate to stakeholders if external dependencies'
                ],
                estimatedResolutionTime: blockedTasks.length * 4
            });
        }

        // Identify overallocated agents
        const agents = await this.database.getAllAgents();
        const assignedTasks = tasks.filter(t => t.assignedAgentId);

        for (const agent of agents) {
            const agentTasks = assignedTasks.filter(t => t.assignedAgentId === agent.id);
            if (agentTasks.length > agent.maxConcurrentTasks) {
                bottlenecks.push({
                    type: BottleneckType.RESOURCE_CONSTRAINT,
                    severity: Severity.HIGH,
                    description: `Agent ${agent.name} is overallocated with ${agentTasks.length} tasks`,
                    affectedResources: [agent.id],
                    impact: 'Task completion delays and potential quality issues',
                    suggestedActions: [
                        'Redistribute tasks to other available agents',
                        'Increase agent capacity if possible',
                        'Prioritize critical tasks'
                    ],
                    estimatedResolutionTime: 8
                });
            }
        }

        return bottlenecks;
    }

    /**
     * Cache management
     */
    private getCachedData(key: string): any | null {
        const cached = this.metricsCache.get(key);
        if (cached && Date.now() - cached.timestamp < cached.ttl) {
            return cached.data;
        }
        if (cached) {
            this.metricsCache.delete(key);
        }
        return null;
    }

    private setCachedData(key: string, data: any, ttl: number): void {
        this.metricsCache.set(key, {
            data,
            timestamp: Date.now(),
            ttl
        });
    }

    /**
     * Additional helper methods (simplified implementations)
     */
    private calculatePerformanceScore(agent: Agent, tasks: Task[]): number {
        return Math.min(100, agent.performance.successRate +
            (tasks.filter(t => t.status === TaskStatus.COMPLETED).length * 2));
    }

    private calculateAverageTaskDuration(completedTasks: Task[]): number {
        if (completedTasks.length === 0) return 0;

        const durations = completedTasks
            .filter(t => t.startedAt && t.completedAt)
            .map(t => {
                const start = new Date(t.startedAt!).getTime();
                const end = new Date(t.completedAt!).getTime();
                return (end - start) / (1000 * 60 * 60); // hours
            });

        return durations.length > 0 ?
            durations.reduce((sum, d) => sum + d, 0) / durations.length : 0;
    }

    private async calculateQualityScore(agent: Agent, completedTasks: Task[]): Promise<number> {
        // Simplified quality calculation based on task completion and agent performance
        return Math.min(100, agent.performance.qualityScore +
            (completedTasks.length > 0 ? 10 : 0));
    }

    private calculateUtilizationRate(agent: Agent, tasks: Task[], timeRange?: { start: Date; end: Date }): number {
        const activeTasks = tasks.filter(t =>
            t.status === TaskStatus.IN_PROGRESS || t.status === TaskStatus.ASSIGNED
        );
        return Math.min(100, (activeTasks.length / agent.maxConcurrentTasks) * 100);
    }

    private async calculateCollaborationScore(agent: Agent, tasks: Task[]): Promise<number> {
        // Simplified collaboration score based on task diversity and agent interactions
        const uniqueProjects = new Set(tasks.map(t => t.projectId)).size;
        return Math.min(100, agent.performance.reliabilityScore + (uniqueProjects * 5));
    }

    private async analyzeAgentSpecializations(agent: Agent, tasks: Task[]): Promise<AgentSpecialization[]> {
        return agent.capabilities.map(capability => ({
            capability,
            proficiencyLevel: Math.min(100, 70 + Math.random() * 30), // Simplified calculation
            experiencePoints: tasks.length * 10,
            certifications: [],
            recentProjects: tasks.slice(0, 5).map(t => t.projectId)
        }));
    }

    private async identifyImprovementAreas(agent: Agent, tasks: Task[]): Promise<string[]> {
        const areas: string[] = [];

        if (agent.performance.successRate < 80) {
            areas.push('Task completion consistency');
        }
        if (agent.performance.qualityScore < 85) {
            areas.push('Output quality improvement');
        }
        if (tasks.filter(t => t.status === TaskStatus.COMPLETED).length < 5) {
            areas.push('Experience in more project types');
        }

        return areas;
    }

    // Enhanced resource allocation calculation
    private async calculateResourceAllocation(agents: Agent[], tasks: Task[], timeRange?: { start: Date; end: Date }): Promise<ResourceAllocation[]> {
        const allocations: ResourceAllocation[] = [];

        for (const agent of agents) {
            const agentTasks = tasks.filter(t => t.assignedAgentId === agent.id);
            const activeTasks = agentTasks.filter(t =>
                t.status === TaskStatus.IN_PROGRESS || t.status === TaskStatus.ASSIGNED
            );
            const completedTasks = agentTasks.filter(t => t.status === TaskStatus.COMPLETED);

            // Calculate time allocation by capability
            const capabilityAllocation = new Map<AgentCapability, number>();
            agent.capabilities.forEach(cap => {
                const capabilityTasks = agentTasks.filter(t =>
                    t.tags?.some(tag => tag.toLowerCase().includes(cap.toLowerCase())) ||
                    t.description.toLowerCase().includes(cap.toLowerCase())
                );
                const timeSpent = capabilityTasks.reduce((sum, task) =>
                    sum + (task.actualHours || task.estimatedHours || 0), 0
                );
                capabilityAllocation.set(cap, timeSpent);
            });

            // Calculate time allocation by project
            const projectAllocation = new Map<string, number>();
            const projectTasks = new Map<string, Task[]>();

            agentTasks.forEach(task => {
                if (!projectTasks.has(task.projectId)) {
                    projectTasks.set(task.projectId, []);
                }
                projectTasks.get(task.projectId)!.push(task);
            });

            projectTasks.forEach((tasks, projectId) => {
                const totalTime = tasks.reduce((sum, task) =>
                    sum + (task.actualHours || task.estimatedHours || 0), 0
                );
                projectAllocation.set(projectId, totalTime);
            });

            // Calculate utilization metrics
            const totalCapacityHours = agent.maxConcurrentTasks * 8 * 5; // 8 hours/day, 5 days/week
            const totalAllocatedHours = agentTasks.reduce((sum, task) =>
                sum + (task.actualHours || task.estimatedHours || 0), 0
            );

            const utilizationPercentage = Math.min(100, (totalAllocatedHours / totalCapacityHours) * 100);
            const efficiency = completedTasks.length > 0 ?
                (completedTasks.filter(t => (t.actualHours || 0) <= (t.estimatedHours || 0)).length / completedTasks.length) * 100 : 100;

            allocations.push({
                agentId: agent.id,
                agentName: agent.name,
                totalCapacityHours,
                allocatedHours: totalAllocatedHours,
                utilizationPercentage,
                efficiency,
                workloadDistribution: {
                    capabilities: Object.fromEntries(capabilityAllocation),
                    projects: Object.fromEntries(projectAllocation),
                    priorities: this.calculatePriorityDistribution(agentTasks)
                },
                timeAllocation: {
                    activeWork: activeTasks.length * 8, // Estimated hours
                    plannedWork: agentTasks.filter(t => t.status === TaskStatus.TODO).length * 8,
                    overhead: totalAllocatedHours * 0.1 // 10% overhead estimate
                },
                capacityForecast: this.predictAgentCapacity(agent, agentTasks)
            });
        }

        return allocations;
    }

    private async identifyResourceBottlenecks(agents: Agent[], tasks: Task[]): Promise<ResourceBottleneck[]> {
        const bottlenecks: ResourceBottleneck[] = [];

        // Agent overutilization bottlenecks
        for (const agent of agents) {
            const agentTasks = tasks.filter(t => t.assignedAgentId === agent.id);
            const activeTasks = agentTasks.filter(t =>
                t.status === TaskStatus.IN_PROGRESS || t.status === TaskStatus.ASSIGNED
            );

            if (activeTasks.length > agent.maxConcurrentTasks) {
                const overutilization = ((activeTasks.length - agent.maxConcurrentTasks) / agent.maxConcurrentTasks) * 100;

                bottlenecks.push({
                    type: BottleneckType.RESOURCE_CONSTRAINT,
                    resourceType: 'agent',
                    resourceId: agent.id,
                    resourceName: agent.name,
                    severity: overutilization > 50 ? Severity.HIGH : Severity.MEDIUM,
                    utilizationRate: (activeTasks.length / agent.maxConcurrentTasks) * 100,
                    capacity: agent.maxConcurrentTasks,
                    demand: activeTasks.length,
                    impact: {
                        affectedTasks: activeTasks.map(t => t.id),
                        estimatedDelay: Math.ceil(overutilization / 25), // Days
                        qualityRisk: overutilization > 75 ? 'high' : 'medium'
                    },
                    recommendations: [
                        'Redistribute tasks to available agents',
                        'Consider increasing agent capacity',
                        'Prioritize critical tasks only',
                        overutilization > 75 ? 'Immediate intervention required' : 'Monitor closely'
                    ]
                });
            }
        }

        // Skill capability bottlenecks
        const capabilityDemand = new Map<AgentCapability, number>();
        const capabilitySupply = new Map<AgentCapability, number>();

        // Calculate demand
        tasks.forEach(task => {
            // Infer required capabilities from task description and tags
            Object.values(AgentCapability).forEach(capability => {
                if (task.description.toLowerCase().includes(capability.toLowerCase()) ||
                    task.tags?.some(tag => tag.toLowerCase().includes(capability.toLowerCase()))) {
                    capabilityDemand.set(capability, (capabilityDemand.get(capability) || 0) + 1);
                }
            });
        });

        // Calculate supply
        agents.forEach(agent => {
            agent.capabilities.forEach(capability => {
                capabilitySupply.set(capability, (capabilitySupply.get(capability) || 0) + agent.maxConcurrentTasks);
            });
        });

        // Identify capability bottlenecks
        capabilityDemand.forEach((demand, capability) => {
            const supply = capabilitySupply.get(capability) || 0;
            const utilizationRate = supply > 0 ? (demand / supply) * 100 : 100;

            if (utilizationRate > 80) {
                bottlenecks.push({
                    type: BottleneckType.SKILL_GAP,
                    resourceType: 'capability',
                    resourceId: capability,
                    resourceName: capability,
                    severity: utilizationRate > 95 ? Severity.HIGH : Severity.MEDIUM,
                    utilizationRate,
                    capacity: supply,
                    demand,
                    impact: {
                        affectedTasks: tasks.filter(t =>
                            t.description.toLowerCase().includes(capability.toLowerCase()) ||
                            t.tags?.some(tag => tag.toLowerCase().includes(capability.toLowerCase()))
                        ).map(t => t.id),
                        estimatedDelay: Math.ceil((utilizationRate - 80) / 10),
                        qualityRisk: utilizationRate > 95 ? 'high' : 'medium'
                    },
                    recommendations: [
                        `Train more agents in ${capability}`,
                        'Consider hiring specialists',
                        'Redistribute workload to agents with this capability',
                        'Implement cross-training programs'
                    ]
                });
            }
        });

        return bottlenecks;
    }

    private async findOptimizationOpportunities(agents: Agent[], tasks: Task[]): Promise<OptimizationOpportunity[]> {
        const opportunities: OptimizationOpportunity[] = [];

        // Agent load balancing opportunities
        const agentLoads = agents.map(agent => ({
            agent,
            load: tasks.filter(t => t.assignedAgentId === agent.id &&
                (t.status === TaskStatus.IN_PROGRESS || t.status === TaskStatus.ASSIGNED)).length,
            capacity: agent.maxConcurrentTasks
        }));

        const overloadedAgents = agentLoads.filter(al => al.load > al.capacity);
        const underutilizedAgents = agentLoads.filter(al => al.load < al.capacity * 0.6);

        if (overloadedAgents.length > 0 && underutilizedAgents.length > 0) {
            const redistributableTasks = overloadedAgents.reduce((sum, al) => sum + (al.load - al.capacity), 0);
            const availableCapacity = underutilizedAgents.reduce((sum, al) => sum + (al.capacity - al.load), 0);

            if (availableCapacity >= redistributableTasks) {
                opportunities.push({
                    type: OptimizationType.LOAD_BALANCING,
                    title: 'Task Redistribution Opportunity',
                    description: `Redistribute ${redistributableTasks} tasks from overloaded to underutilized agents`,
                    potentialImpact: {
                        efficiency: 15,
                        throughput: 10,
                        qualityImprovement: 8,
                        costReduction: 5
                    },
                    implementationEffort: ImplementationEffort.LOW,
                    estimatedROI: 150,
                    affectedResources: [
                        ...overloadedAgents.map(al => al.agent.id),
                        ...underutilizedAgents.map(al => al.agent.id)
                    ],
                    actionItems: [
                        'Identify tasks suitable for redistribution',
                        'Match task requirements with agent capabilities',
                        'Coordinate handover between agents',
                        'Monitor performance after redistribution'
                    ],
                    timeline: '1-2 days',
                    riskLevel: RiskLevel.LOW
                });
            }
        }

        // Skill specialization opportunities
        const agentCapabilityUsage = new Map<string, Map<AgentCapability, number>>();

        agents.forEach(agent => {
            const agentTasks = tasks.filter(t => t.assignedAgentId === agent.id);
            const capabilityUsage = new Map<AgentCapability, number>();

            agent.capabilities.forEach(capability => {
                const relevantTasks = agentTasks.filter(t =>
                    t.description.toLowerCase().includes(capability.toLowerCase()) ||
                    t.tags?.some(tag => tag.toLowerCase().includes(capability.toLowerCase()))
                );
                capabilityUsage.set(capability, relevantTasks.length);
            });

            agentCapabilityUsage.set(agent.id, capabilityUsage);
        });

        // Find underutilized capabilities
        agentCapabilityUsage.forEach((capabilityUsage, agentId) => {
            const agent = agents.find(a => a.id === agentId)!;
            const underutilizedCapabilities = agent.capabilities.filter(cap =>
                (capabilityUsage.get(cap) || 0) < 2
            );

            if (underutilizedCapabilities.length > 0) {
                opportunities.push({
                    type: OptimizationType.SPECIALIZATION,
                    title: `Capability Optimization for ${agent.name}`,
                    description: `Agent has underutilized capabilities: ${underutilizedCapabilities.join(', ')}`,
                    potentialImpact: {
                        efficiency: 12,
                        throughput: 8,
                        qualityImprovement: 15,
                        costReduction: 10
                    },
                    implementationEffort: ImplementationEffort.MEDIUM,
                    estimatedROI: 120,
                    affectedResources: [agentId],
                    actionItems: [
                        'Assign more tasks matching underutilized capabilities',
                        'Consider cross-training other agents',
                        'Evaluate if capabilities are still relevant',
                        'Update agent profile if capabilities are outdated'
                    ],
                    timeline: '1-2 weeks',
                    riskLevel: RiskLevel.LOW
                });
            }
        });

        // Process optimization opportunities
        const taskFlowPatterns = this.analyzeTaskFlowPatterns(tasks);
        if (taskFlowPatterns.inefficiencies.length > 0) {
            opportunities.push({
                type: OptimizationType.PROCESS_IMPROVEMENT,
                title: 'Task Flow Optimization',
                description: 'Identified inefficiencies in task execution patterns',
                potentialImpact: {
                    efficiency: 20,
                    throughput: 15,
                    qualityImprovement: 10,
                    costReduction: 12
                },
                implementationEffort: ImplementationEffort.HIGH,
                estimatedROI: 200,
                affectedResources: tasks.map(t => t.id),
                actionItems: [
                    'Streamline task dependencies',
                    'Implement parallel execution where possible',
                    'Optimize task handoff procedures',
                    'Automate routine task transitions'
                ],
                timeline: '2-4 weeks',
                riskLevel: RiskLevel.MEDIUM
            });
        }

        return opportunities;
    }

    private async calculatePeakUtilization(timeRange?: { start: Date; end: Date }): Promise<number> {
        const agents = await this.database.getAllAgents();
        const tasks = await this.database.getAvailableTasks();

        if (!timeRange) {
            // Default to last 30 days
            const end = new Date();
            const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
            timeRange = { start, end };
        }

        // Simulate daily utilization over the time range
        const daysDiff = Math.ceil((timeRange.end.getTime() - timeRange.start.getTime()) / (1000 * 60 * 60 * 24));
        let peakUtilization = 0;

        for (let i = 0; i <= daysDiff; i++) {
            const date = new Date(timeRange.start.getTime() + i * 24 * 60 * 60 * 1000);

            // Calculate utilization for this date
            const activeTasks = tasks.filter(task => {
                const taskStart = task.startedAt ? new Date(task.startedAt) : new Date(task.createdAt);
                const taskEnd = task.completedAt ? new Date(task.completedAt) : new Date();
                return taskStart <= date && date <= taskEnd;
            });

            const totalCapacity = agents.reduce((sum, agent) => sum + agent.maxConcurrentTasks, 0);
            const currentUtilization = totalCapacity > 0 ? (activeTasks.length / totalCapacity) * 100 : 0;

            peakUtilization = Math.max(peakUtilization, currentUtilization);
        }

        return Math.min(100, peakUtilization);
    }

    private async calculateAverageUtilization(timeRange?: { start: Date; end: Date }): Promise<number> {
        const agents = await this.database.getAllAgents();
        const tasks = await this.database.getAvailableTasks();

        if (!timeRange) {
            const end = new Date();
            const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
            timeRange = { start, end };
        }

        const daysDiff = Math.ceil((timeRange.end.getTime() - timeRange.start.getTime()) / (1000 * 60 * 60 * 24));
        let totalUtilization = 0;

        for (let i = 0; i <= daysDiff; i++) {
            const date = new Date(timeRange.start.getTime() + i * 24 * 60 * 60 * 1000);

            const activeTasks = tasks.filter(task => {
                const taskStart = task.startedAt ? new Date(task.startedAt) : new Date(task.createdAt);
                const taskEnd = task.completedAt ? new Date(task.completedAt) : new Date();
                return taskStart <= date && date <= taskEnd;
            });

            const totalCapacity = agents.reduce((sum, agent) => sum + agent.maxConcurrentTasks, 0);
            const currentUtilization = totalCapacity > 0 ? (activeTasks.length / totalCapacity) * 100 : 0;

            totalUtilization += currentUtilization;
        }

        return Math.min(100, totalUtilization / (daysDiff + 1));
    }

    private async predictProjectCompletion(project: Project, tasks: Task[]): Promise<PredictiveData> {
        const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED);
        const remainingTasks = tasks.filter(t => t.status !== TaskStatus.COMPLETED);
        const inProgressTasks = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS);

        // Calculate completion velocity
        const projectAge = Math.ceil((new Date().getTime() - new Date(project.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        const completionRate = projectAge > 0 ? completedTasks.length / projectAge : 0; // tasks per day

        // Estimate remaining time
        const estimatedDaysRemaining = completionRate > 0 ? Math.ceil(remainingTasks.length / completionRate) : null;

        // Calculate confidence based on multiple factors
        let confidence = 70; // Base confidence

        // Adjust confidence based on historical performance
        if (completedTasks.length >= 5) confidence += 10;
        if (inProgressTasks.length === 0 && remainingTasks.length > 5) confidence -= 15; // No momentum
        if (project.priority === Priority.HIGH) confidence += 5;

        // Assess risk factors
        const blockedTasks = tasks.filter(t => t.status === TaskStatus.BLOCKED);
        const overdueTasks = tasks.filter(t => {
            if (!t.estimatedHours || !t.startedAt) return false;
            const daysSinceStart = (new Date().getTime() - new Date(t.startedAt).getTime()) / (1000 * 60 * 60 * 24);
            const estimatedDays = t.estimatedHours / 8; // Assuming 8 hours per day
            return daysSinceStart > estimatedDays * 1.5; // 50% overdue threshold
        });

        const riskFactors: PredictionFactor[] = [];
        let riskLevel = RiskLevel.LOW;

        if (blockedTasks.length > 0) {
            riskFactors.push({
                factor: 'blocked_tasks',
                weight: 0.8,
                impact: `${blockedTasks.length} tasks are currently blocked`,
                likelihood: 'high'
            });
            riskLevel = RiskLevel.MEDIUM;
            confidence -= 10;
        }

        if (overdueTasks.length > 0) {
            riskFactors.push({
                factor: 'overdue_tasks',
                weight: 0.6,
                impact: `${overdueTasks.length} tasks are overdue`,
                likelihood: 'medium'
            });
            if (riskLevel === RiskLevel.LOW) riskLevel = RiskLevel.MEDIUM;
            confidence -= 5;
        }

        // Calculate task complexity factor
        const avgEstimatedHours = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0) / tasks.length;
        if (avgEstimatedHours > 16) { // High complexity tasks
            riskFactors.push({
                factor: 'task_complexity',
                weight: 0.4,
                impact: 'High complexity tasks may require more time',
                likelihood: 'medium'
            });
            confidence -= 5;
        }

        // Generate prediction text
        let prediction: string;
        if (estimatedDaysRemaining === null) {
            prediction = 'Unable to predict completion time - no progress data available';
            confidence = 20;
            riskLevel = RiskLevel.HIGH;
        } else if (estimatedDaysRemaining <= 7) {
            prediction = `Project likely to complete within ${estimatedDaysRemaining} days (on track)`;
        } else if (estimatedDaysRemaining <= 30) {
            prediction = `Project estimated to complete in ${estimatedDaysRemaining} days`;
        } else {
            prediction = `Project completion delayed - estimated ${estimatedDaysRemaining} days remaining`;
            riskLevel = RiskLevel.HIGH;
            confidence -= 15;
        }

        // Generate recommendations
        const recommendations: string[] = [];

        if (completionRate < 0.5 && remainingTasks.length > 10) {
            recommendations.push('Consider increasing team size or reducing scope');
        }
        if (blockedTasks.length > 0) {
            recommendations.push('Prioritize resolving blocked tasks');
        }
        if (overdueTasks.length > 0) {
            recommendations.push('Review and re-estimate overdue tasks');
        }
        if (inProgressTasks.length === 0 && remainingTasks.length > 0) {
            recommendations.push('Start working on queued tasks to maintain momentum');
        }
        if (recommendations.length === 0) {
            recommendations.push('Continue current pace and monitor progress');
        }

        return {
            type: PredictionType.PROJECT_COMPLETION,
            confidence: Math.max(10, Math.min(95, confidence)),
            timeHorizon: estimatedDaysRemaining || 30,
            prediction,
            factors: riskFactors,
            recommendations,
            riskLevel
        };
    }

    private async predictResourceDemand(timeRange?: { start: Date; end: Date }): Promise<PredictiveData> {
        const agents = await this.database.getAllAgents();
        const tasks = await this.database.getAvailableTasks();
        const projects = await this.database.getAllProjects();

        // Analyze historical patterns
        const activeTasks = tasks.filter(t =>
            t.status === TaskStatus.IN_PROGRESS || t.status === TaskStatus.ASSIGNED
        );
        const queuedTasks = tasks.filter(t => t.status === TaskStatus.TODO);

        // Calculate current utilization
        const totalCapacity = agents.reduce((sum, agent) => sum + agent.maxConcurrentTasks, 0);
        const currentUtilization = totalCapacity > 0 ? (activeTasks.length / totalCapacity) * 100 : 0;

        // Analyze project pipeline
        const activeProjects = projects.filter(p => p.status === 'active');
        const planningProjects = projects.filter(p => p.status === 'planning');

        // Predict demand increase based on queued work
        const demandIncrease = Math.min(100, (queuedTasks.length / totalCapacity) * 100);

        // Analyze skill demand patterns
        const skillDemand = new Map<AgentCapability, number>();
        [...activeTasks, ...queuedTasks].forEach(task => {
            Object.values(AgentCapability).forEach(capability => {
                if (task.description.toLowerCase().includes(capability.toLowerCase()) ||
                    task.tags?.some(tag => tag.toLowerCase().includes(capability.toLowerCase()))) {
                    skillDemand.set(capability, (skillDemand.get(capability) || 0) + 1);
                }
            });
        });

        // Find capacity gaps
        const capacityGaps: PredictionFactor[] = [];
        skillDemand.forEach((demand, capability) => {
            const availableAgents = agents.filter(a => a.capabilities.includes(capability));
            const supply = availableAgents.reduce((sum, a) => sum + a.maxConcurrentTasks, 0);
            const utilizationRate = supply > 0 ? (demand / supply) * 100 : 100;

            if (utilizationRate > 80) {
                capacityGaps.push({
                    factor: `${capability}_capacity`,
                    weight: utilizationRate / 100,
                    impact: `${capability} skill demand exceeds capacity by ${Math.round(utilizationRate - 100)}%`,
                    likelihood: utilizationRate > 100 ? 'high' : 'medium'
                });
            }
        });

        // Calculate confidence and risk level
        let confidence = 75;
        let riskLevel = RiskLevel.LOW;

        if (demandIncrease > 50) {
            confidence -= 15;
            riskLevel = RiskLevel.MEDIUM;
        }
        if (capacityGaps.length > 2) {
            confidence -= 10;
            riskLevel = RiskLevel.HIGH;
        }
        if (planningProjects.length > activeProjects.length) {
            confidence -= 5;
            if (riskLevel === RiskLevel.LOW) riskLevel = RiskLevel.MEDIUM;
        }

        // Generate prediction
        let prediction: string;
        if (demandIncrease < 20) {
            prediction = `Resource demand expected to remain stable (${Math.round(demandIncrease)}% increase)`;
        } else if (demandIncrease < 50) {
            prediction = `Moderate resource demand increase expected (${Math.round(demandIncrease)}% increase)`;
        } else {
            prediction = `Significant resource demand increase expected (${Math.round(demandIncrease)}% increase)`;
        }

        // Generate recommendations
        const recommendations: string[] = [];

        if (demandIncrease > 30) {
            recommendations.push('Plan for additional capacity within 2 weeks');
        }
        if (capacityGaps.length > 0) {
            recommendations.push('Address skill capacity gaps through hiring or training');
            recommendations.push(`Priority skills: ${Array.from(skillDemand.keys()).slice(0, 3).join(', ')}`);
        }
        if (currentUtilization > 85) {
            recommendations.push('Current utilization is high - monitor for overload');
        }
        if (planningProjects.length > 0) {
            recommendations.push('Prepare for project pipeline - resource demand will increase');
        }

        return {
            type: PredictionType.RESOURCE_DEMAND,
            confidence,
            timeHorizon: 14,
            prediction,
            factors: capacityGaps,
            recommendations,
            riskLevel
        };
    }

    private async predictBottlenecks(timeRange?: { start: Date; end: Date }): Promise<PredictiveData[]> {
        const agents = await this.database.getAllAgents();
        const tasks = await this.database.getAvailableTasks();
        const predictions: PredictiveData[] = [];

        // Predict agent overutilization
        const agentUtilizations = agents.map(agent => {
            const agentTasks = tasks.filter(t => t.assignedAgentId === agent.id);
            const activeTasks = agentTasks.filter(t =>
                t.status === TaskStatus.IN_PROGRESS || t.status === TaskStatus.ASSIGNED
            );
            const queuedTasks = agentTasks.filter(t => t.status === TaskStatus.TODO);

            const currentLoad = activeTasks.length;
            const futureLoad = currentLoad + queuedTasks.length;
            const utilizationTrend = futureLoad / agent.maxConcurrentTasks;

            return { agent, currentLoad, futureLoad, utilizationTrend };
        });

        // Identify agents at risk of overutilization
        const overloadRiskAgents = agentUtilizations.filter(au => au.utilizationTrend > 1.2);

        if (overloadRiskAgents.length > 0) {
            predictions.push({
                type: PredictionType.BOTTLENECK_RISK,
                confidence: 80,
                timeHorizon: 7,
                prediction: `${overloadRiskAgents.length} agents at risk of overutilization within 1 week`,
                factors: overloadRiskAgents.map(au => ({
                    factor: `agent_overload_${au.agent.name}`,
                    weight: Math.min(1, au.utilizationTrend - 1),
                    impact: `${au.agent.name} projected to be ${Math.round(au.utilizationTrend * 100)}% utilized`,
                    likelihood: au.utilizationTrend > 1.5 ? 'high' : 'medium'
                })),
                recommendations: [
                    'Redistribute tasks from overloaded agents',
                    'Consider temporary capacity increase',
                    'Prioritize and defer non-critical tasks',
                    'Monitor agent workload closely'
                ],
                riskLevel: overloadRiskAgents.some(au => au.utilizationTrend > 1.5) ? RiskLevel.HIGH : RiskLevel.MEDIUM
            });
        }

        // Predict skill bottlenecks
        const skillAnalysis = this.analyzeSkillBottleneckRisk(tasks, agents);
        if (skillAnalysis.riskLevel !== RiskLevel.LOW) {
            predictions.push({
                type: PredictionType.SKILL_BOTTLENECK,
                confidence: 75,
                timeHorizon: 14,
                prediction: `${skillAnalysis.riskSkills.length} skills at bottleneck risk`,
                factors: skillAnalysis.riskSkills.map(skill => ({
                    factor: `skill_bottleneck_${skill.capability}`,
                    weight: skill.riskWeight,
                    impact: `${skill.capability} demand exceeds capacity`,
                    likelihood: skill.riskWeight > 0.8 ? 'high' : 'medium'
                })),
                recommendations: [
                    'Cross-train agents in high-demand skills',
                    'Consider hiring specialists',
                    'Prioritize skill development programs',
                    'Review task assignment algorithms'
                ],
                riskLevel: skillAnalysis.riskLevel
            });
        }

        return predictions;
    }

    private async calculateVelocityTrend(completedTasks: Task[], timeRange?: { start: Date; end: Date }): Promise<TimeSeriesPoint[]> {
        const trend: TimeSeriesPoint[] = [];

        if (!timeRange) {
            const end = new Date();
            const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days
            timeRange = { start, end };
        }

        // Group completed tasks by week
        const weeklyData = new Map<string, Task[]>();
        completedTasks.forEach(task => {
            if (task.completedAt) {
                const completionDate = new Date(task.completedAt);
                if (completionDate >= timeRange!.start && completionDate <= timeRange!.end) {
                    const weekKey = this.getWeekKey(completionDate);
                    if (!weeklyData.has(weekKey)) {
                        weeklyData.set(weekKey, []);
                    }
                    weeklyData.get(weekKey)!.push(task);
                }
            }
        });

        // Generate time series points
        const weeks = this.generateWeekRange(timeRange.start, timeRange.end);
        weeks.forEach(week => {
            const weekKey = this.getWeekKey(week);
            const weekTasks = weeklyData.get(weekKey) || [];
            const tasksCompleted = weekTasks.length;
            const avgCompletionTime = weekTasks.length > 0 ?
                weekTasks.reduce((sum, t) => {
                    if (t.startedAt && t.completedAt) {
                        const duration = new Date(t.completedAt).getTime() - new Date(t.startedAt).getTime();
                        return sum + (duration / (1000 * 60 * 60)); // hours
                    }
                    return sum + (t.estimatedHours || 0);
                }, 0) / weekTasks.length : 0;

            trend.push({
                timestamp: week,
                value: tasksCompleted,
                metadata: {
                    averageCompletionTime: avgCompletionTime,
                    taskTypes: this.categorizeTaskTypes(weekTasks),
                    throughput: tasksCompleted / 7 // tasks per day
                }
            });
        });

        return trend;
    }

    private async assessProjectRisks(project: Project, tasks: Task[]): Promise<RiskIndicator[]> {
        const risks: RiskIndicator[] = [];

        // Schedule risk assessment
        const scheduleRisk = this.assessScheduleRisk(project, tasks);
        if (scheduleRisk.level !== RiskLevel.LOW) {
            risks.push(scheduleRisk);
        }

        // Resource risk assessment
        const resourceRisk = await this.assessResourceRisk(project, tasks);
        if (resourceRisk.level !== RiskLevel.LOW) {
            risks.push(resourceRisk);
        }

        // Quality risk assessment
        const qualityRisk = this.assessQualityRisk(project, tasks);
        if (qualityRisk.level !== RiskLevel.LOW) {
            risks.push(qualityRisk);
        }

        // Scope risk assessment
        const scopeRisk = this.assessScopeRisk(project, tasks);
        if (scopeRisk.level !== RiskLevel.LOW) {
            risks.push(scopeRisk);
        }

        return risks;
    }

    private async getMilestoneProgress(project: Project, tasks: Task[]): Promise<MilestoneProgress[]> {
        const milestones: MilestoneProgress[] = [];

        // Identify milestones from task metadata or tags
        const milestoneMap = new Map<string, Task[]>();

        tasks.forEach(task => {
            const milestoneTag = task.tags?.find(tag => tag.startsWith('milestone:'));
            if (milestoneTag) {
                const milestoneName = milestoneTag.replace('milestone:', '');
                if (!milestoneMap.has(milestoneName)) {
                    milestoneMap.set(milestoneName, []);
                }
                milestoneMap.get(milestoneName)!.push(task);
            }
        });

        // If no explicit milestones, create phase-based milestones
        if (milestoneMap.size === 0) {
            const taskCount = tasks.length;
            const phases = [
                { name: 'Planning Phase', end: Math.ceil(taskCount * 0.2) },
                { name: 'Development Phase', end: Math.ceil(taskCount * 0.7) },
                { name: 'Testing Phase', end: Math.ceil(taskCount * 0.9) },
                { name: 'Delivery Phase', end: taskCount }
            ];

            let taskIndex = 0;
            phases.forEach(phase => {
                const phaseTasks = tasks.slice(taskIndex, phase.end);
                milestoneMap.set(phase.name, phaseTasks);
                taskIndex = phase.end;
            });
        }

        // Calculate progress for each milestone
        milestoneMap.forEach((milestoneTasks, milestoneName) => {
            const completedTasks = milestoneTasks.filter(t => t.status === TaskStatus.COMPLETED);
            const inProgressTasks = milestoneTasks.filter(t => t.status === TaskStatus.IN_PROGRESS);
            const totalTasks = milestoneTasks.length;

            const progressPercentage = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;

            // Estimate completion date
            const remainingTasks = totalTasks - completedTasks.length;
            const averageCompletionRate = this.calculateCompletionRate(milestoneTasks);
            const estimatedDaysToComplete = averageCompletionRate > 0 ?
                Math.ceil(remainingTasks / averageCompletionRate) : null;

            const estimatedCompletionDate = estimatedDaysToComplete ?
                new Date(Date.now() + estimatedDaysToComplete * 24 * 60 * 60 * 1000) : null;

            // Determine status
            let status: 'on_track' | 'at_risk' | 'delayed' = 'on_track';
            if (progressPercentage < 50 && inProgressTasks.length === 0) {
                status = 'at_risk';
            }
            if (estimatedDaysToComplete && estimatedDaysToComplete > 30) {
                status = 'delayed';
            }

            milestones.push({
                name: milestoneName,
                description: `${milestoneName} containing ${totalTasks} tasks`,
                targetDate: estimatedCompletionDate,
                progressPercentage,
                status,
                tasksCompleted: completedTasks.length,
                tasksTotal: totalTasks,
                criticalPath: this.identifyCriticalPath(milestoneTasks),
                dependencies: this.extractDependencies(milestoneTasks),
                risks: this.assessMilestoneRisks(milestoneTasks)
            });
        });

        return milestones.sort((a, b) => a.progressPercentage - b.progressPercentage);
    }

    private async getCustomReports(): Promise<ReportTemplate[]> {
        return [
            {
                id: 'weekly-performance',
                name: 'Weekly Performance Report',
                description: 'Comprehensive weekly performance analytics for teams and projects',
                type: ReportType.PERFORMANCE,
                schedule: 'weekly',
                recipients: ['project-managers', 'team-leads'],
                sections: [
                    'Project Progress Summary',
                    'Agent Performance Metrics',
                    'Resource Utilization Analysis',
                    'Upcoming Milestones',
                    'Risk Assessment',
                    'Recommendations'
                ],
                parameters: {
                    timeRange: 'last_7_days',
                    includeCharts: true,
                    includeDetailedMetrics: true,
                    format: ReportFormat.PDF
                }
            },
            {
                id: 'monthly-trends',
                name: 'Monthly Trends Analysis',
                description: 'Strategic analysis of project trends and organizational performance',
                type: ReportType.ANALYTICS,
                schedule: 'monthly',
                recipients: ['executives', 'department-heads'],
                sections: [
                    'Organizational Performance Overview',
                    'Project Portfolio Health',
                    'Resource Capacity Planning',
                    'Skill Development Recommendations',
                    'Strategic Insights',
                    'Growth Opportunities'
                ],
                parameters: {
                    timeRange: 'last_30_days',
                    includeComparisons: true,
                    includePredictions: true,
                    format: ReportFormat.PDF
                }
            },
            {
                id: 'project-health-check',
                name: 'Project Health Check',
                description: 'Detailed assessment of individual project status and risks',
                type: ReportType.PROJECT_STATUS,
                schedule: 'on-demand',
                recipients: ['project-managers', 'stakeholders'],
                sections: [
                    'Project Overview',
                    'Timeline Analysis',
                    'Resource Allocation',
                    'Quality Metrics',
                    'Risk Assessment',
                    'Recommendations',
                    'Action Items'
                ],
                parameters: {
                    projectId: 'variable',
                    includeTaskDetails: true,
                    includeAgentPerformance: true,
                    format: ReportFormat.PDF
                }
            }
        ];
    }

    private async getTimeSeriesData(timeRange?: { start: Date; end: Date }): Promise<TimeSeriesData[]> {
        const timeSeries: TimeSeriesData[] = [];

        if (!timeRange) {
            const end = new Date();
            const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
            timeRange = { start, end };
        }

        // Task completion time series
        const tasks = await this.database.getAvailableTasks();
        const completionSeries = await this.generateTaskCompletionTimeSeries(tasks, timeRange);
        timeSeries.push(completionSeries);

        // Resource utilization time series
        const utilizationSeries = await this.generateResourceUtilizationTimeSeries(timeRange);
        timeSeries.push(utilizationSeries);

        // Quality metrics time series
        const qualitySeries = await this.generateQualityMetricsTimeSeries(tasks, timeRange);
        timeSeries.push(qualitySeries);

        return timeSeries;
    }

    /**
     * Export analytics data in various formats
     */
    async exportAnalytics(format: ReportFormat, options?: any): Promise<Buffer | string> {
        const analytics = await this.getAdvancedAnalytics();

        switch (format) {
            case ReportFormat.JSON:
                return JSON.stringify(analytics, null, 2);
            case ReportFormat.CSV:
                return this.convertToCSV(analytics);
            case ReportFormat.PDF:
                return await this.generatePDF(analytics);
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }

    private convertToCSV(analytics: AdvancedAnalytics): string {
        // Simplified CSV conversion
        let csv = 'Type,Metric,Value\n';

        analytics.agentPerformanceMetrics.forEach(agent => {
            csv += `Agent,${agent.agentName} Performance,${agent.performanceScore}\n`;
            csv += `Agent,${agent.agentName} Completion Rate,${agent.taskCompletionRate}\n`;
        });

        analytics.projectTrends.forEach(project => {
            csv += `Project,${project.projectName} Velocity,${project.velocityMetrics.averageTasksPerDay}\n`;
        });

        return csv;
    }

    private async generatePDF(analytics: AdvancedAnalytics): Promise<Buffer> {
        // PDF generation would require a library like puppeteer or pdfkit
        // For now, return a placeholder
        return Buffer.from('PDF Analytics Report - Implementation Required');
    }

    /**
     * Get real-time analytics updates
     */
    async getRealtimeUpdate(): Promise<Partial<AdvancedAnalytics>> {
        const [agentMetrics, resourceUtilization] = await Promise.all([
            this.getAgentPerformanceMetrics(),
            this.getResourceUtilization()
        ]);

        return {
            agentPerformanceMetrics: agentMetrics,
            resourceUtilization
        };
    }

    /**
     * Clear analytics cache
     */
    clearCache(): void {
        this.metricsCache.clear();
    }

    /**
     * Get cache statistics
     */
    getCacheStats(): { size: number; hitRate: number } {
        return {
            size: this.metricsCache.size,
            hitRate: 0.85 // Placeholder - would need actual hit/miss tracking
        };
    }

    // Additional helper methods for enhanced analytics

    private calculatePriorityDistribution(tasks: Task[]): Record<string, number> {
        const distribution: Record<string, number> = {};
        Object.values(Priority).forEach(priority => {
            distribution[priority] = tasks.filter(t => t.priority === priority).length;
        });
        return distribution;
    }

    private predictAgentCapacity(agent: Agent, tasks: Task[]): { nextWeek: number; nextMonth: number } {
        const currentLoad = tasks.filter(t =>
            t.status === TaskStatus.IN_PROGRESS || t.status === TaskStatus.ASSIGNED
        ).length;

        const completionRate = tasks.filter(t => t.status === TaskStatus.COMPLETED).length / 7; // per day
        const nextWeekCapacity = Math.max(0, agent.maxConcurrentTasks - (currentLoad - completionRate * 7));
        const nextMonthCapacity = Math.max(0, agent.maxConcurrentTasks - (currentLoad - completionRate * 30));

        return {
            nextWeek: Math.round(nextWeekCapacity),
            nextMonth: Math.round(nextMonthCapacity)
        };
    }

    private analyzeTaskFlowPatterns(tasks: Task[]): { inefficiencies: string[]; suggestions: string[] } {
        const inefficiencies: string[] = [];
        const suggestions: string[] = [];

        // Analyze task status transitions
        const blockedTasks = tasks.filter(t => t.status === TaskStatus.BLOCKED);
        const longRunningTasks = tasks.filter(t => {
            if (!t.startedAt || t.status !== TaskStatus.IN_PROGRESS) return false;
            const daysSinceStart = (Date.now() - new Date(t.startedAt).getTime()) / (1000 * 60 * 60 * 24);
            const estimatedDays = (t.estimatedHours || 8) / 8;
            return daysSinceStart > estimatedDays * 2;
        });

        if (blockedTasks.length > tasks.length * 0.1) {
            inefficiencies.push('High percentage of blocked tasks');
            suggestions.push('Review dependency management processes');
        }

        if (longRunningTasks.length > 0) {
            inefficiencies.push('Tasks running significantly over estimates');
            suggestions.push('Improve estimation accuracy and task breakdown');
        }

        return { inefficiencies, suggestions };
    }

    private analyzeSkillBottleneckRisk(tasks: Task[], agents: Agent[]): {
        riskSkills: Array<{ capability: AgentCapability; riskWeight: number }>;
        riskLevel: RiskLevel;
    } {
        const skillDemand = new Map<AgentCapability, number>();
        const skillSupply = new Map<AgentCapability, number>();

        // Calculate demand
        tasks.forEach(task => {
            Object.values(AgentCapability).forEach(capability => {
                if (task.description.toLowerCase().includes(capability.toLowerCase()) ||
                    task.tags?.some(tag => tag.toLowerCase().includes(capability.toLowerCase()))) {
                    skillDemand.set(capability, (skillDemand.get(capability) || 0) + 1);
                }
            });
        });

        // Calculate supply
        agents.forEach(agent => {
            agent.capabilities.forEach(capability => {
                skillSupply.set(capability, (skillSupply.get(capability) || 0) + 1);
            });
        });

        // Identify risk skills
        const riskSkills: Array<{ capability: AgentCapability; riskWeight: number }> = [];
        skillDemand.forEach((demand, capability) => {
            const supply = skillSupply.get(capability) || 0;
            const ratio = supply > 0 ? demand / supply : 1;
            if (ratio > 0.8) {
                riskSkills.push({ capability, riskWeight: Math.min(1, ratio) });
            }
        });

        const riskLevel = riskSkills.length > 3 ? RiskLevel.HIGH :
            riskSkills.length > 1 ? RiskLevel.MEDIUM : RiskLevel.LOW;

        return { riskSkills, riskLevel };
    }

    private getWeekKey(date: Date): string {
        const year = date.getFullYear();
        const week = this.getWeekNumber(date);
        return `${year}-W${week.toString().padStart(2, '0')}`;
    }

    private getWeekNumber(date: Date): number {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    }

    private generateWeekRange(start: Date, end: Date): Date[] {
        const weeks: Date[] = [];
        const current = new Date(start);

        // Move to start of week (Monday)
        current.setDate(current.getDate() - ((current.getDay() + 6) % 7));

        while (current <= end) {
            weeks.push(new Date(current));
            current.setDate(current.getDate() + 7);
        }

        return weeks;
    }

    private categorizeTaskTypes(tasks: Task[]): Record<string, number> {
        const categories: Record<string, number> = {};

        tasks.forEach(task => {
            const category = task.category || 'general';
            categories[category] = (categories[category] || 0) + 1;
        });

        return categories;
    }

    private assessScheduleRisk(project: Project, tasks: Task[]): RiskIndicator {
        const overdueTasks = tasks.filter(t => {
            if (!t.estimatedHours || !t.startedAt) return false;
            const daysSinceStart = (Date.now() - new Date(t.startedAt).getTime()) / (1000 * 60 * 60 * 24);
            const estimatedDays = t.estimatedHours / 8;
            return daysSinceStart > estimatedDays * 1.5;
        });

        const riskLevel = overdueTasks.length > tasks.length * 0.2 ? RiskLevel.HIGH :
            overdueTasks.length > tasks.length * 0.1 ? RiskLevel.MEDIUM : RiskLevel.LOW;

        return {
            type: RiskType.SCHEDULE_DELAY,
            level: riskLevel,
            probability: overdueTasks.length / tasks.length,
            impact: 'Project timeline may be delayed',
            description: `${overdueTasks.length} tasks are overdue or at risk`,
            mitigation: [
                'Review and re-estimate overdue tasks',
                'Increase resources for critical path items',
                'Consider scope reduction if necessary'
            ],
            owner: 'project-manager'
        };
    }

    private async assessResourceRisk(project: Project, tasks: Task[]): Promise<RiskIndicator> {
        const agents = await this.database.getAllAgents();
        const assignedTasks = tasks.filter(t => t.assignedAgentId);
        const unassignedTasks = tasks.filter(t => !t.assignedAgentId && t.status === TaskStatus.TODO);

        const overloadedAgents = agents.filter(agent => {
            const agentTasks = assignedTasks.filter(t => t.assignedAgentId === agent.id);
            return agentTasks.length > agent.maxConcurrentTasks;
        });

        const riskLevel = unassignedTasks.length > 10 || overloadedAgents.length > 0 ?
            RiskLevel.HIGH : RiskLevel.LOW;

        return {
            type: RiskType.RESOURCE_SHORTAGE,
            level: riskLevel,
            probability: overloadedAgents.length / agents.length,
            impact: 'Resource constraints may delay project completion',
            description: `${overloadedAgents.length} agents overloaded, ${unassignedTasks.length} tasks unassigned`,
            mitigation: [
                'Redistribute workload among available agents',
                'Consider bringing in additional resources',
                'Prioritize critical tasks for immediate assignment'
            ],
            owner: 'resource-manager'
        };
    }

    private assessQualityRisk(project: Project, tasks: Task[]): RiskIndicator {
        const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED);
        const qualityIssues = completedTasks.filter(t =>
            t.metadata?.qualityScore && t.metadata.qualityScore < 80
        );

        const riskLevel = qualityIssues.length > completedTasks.length * 0.2 ? RiskLevel.HIGH :
            qualityIssues.length > completedTasks.length * 0.1 ? RiskLevel.MEDIUM : RiskLevel.LOW;

        return {
            type: RiskType.QUALITY_DEGRADATION,
            level: riskLevel,
            probability: qualityIssues.length / completedTasks.length,
            impact: 'Project deliverables may not meet quality standards',
            description: `${qualityIssues.length} tasks completed with quality concerns`,
            mitigation: [
                'Implement additional quality checkpoints',
                'Provide training on quality standards',
                'Review and improve quality metrics'
            ],
            owner: 'quality-assurance'
        };
    }

    private assessScopeRisk(project: Project, tasks: Task[]): RiskIndicator {
        const recentlyAddedTasks = tasks.filter(t => {
            const daysSinceCreation = (Date.now() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60 * 24);
            return daysSinceCreation < 7; // Tasks added in last week
        });

        const scopeGrowth = recentlyAddedTasks.length / tasks.length;
        const riskLevel = scopeGrowth > 0.2 ? RiskLevel.HIGH :
            scopeGrowth > 0.1 ? RiskLevel.MEDIUM : RiskLevel.LOW;

        return {
            type: RiskType.SCOPE_CREEP,
            level: riskLevel,
            probability: scopeGrowth,
            impact: 'Project scope expansion may affect timeline and budget',
            description: `${recentlyAddedTasks.length} tasks added recently (${Math.round(scopeGrowth * 100)}% scope growth)`,
            mitigation: [
                'Implement change control process',
                'Review and approve scope changes formally',
                'Assess impact of new requirements on timeline'
            ],
            owner: 'project-manager'
        };
    }

    private calculateCompletionRate(tasks: Task[]): number {
        const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED);
        if (completedTasks.length === 0) return 0;

        // Calculate average completion rate over the task history
        const projectStart = Math.min(...tasks.map(t => new Date(t.createdAt).getTime()));
        const daysSinceStart = (Date.now() - projectStart) / (1000 * 60 * 60 * 24);

        return daysSinceStart > 0 ? completedTasks.length / daysSinceStart : 0;
    }

    private identifyCriticalPath(tasks: Task[]): string[] {
        // Simplified critical path identification
        // In a real implementation, this would use proper critical path method (CPM)
        const dependentTasks = tasks.filter(t => t.dependencies && t.dependencies.length > 0);
        const criticalTasks = dependentTasks
            .sort((a, b) => (b.estimatedHours || 0) - (a.estimatedHours || 0))
            .slice(0, Math.min(3, dependentTasks.length));

        return criticalTasks.map(t => t.id);
    }

    private extractDependencies(tasks: Task[]): string[] {
        const allDependencies = new Set<string>();
        tasks.forEach(task => {
            if (task.dependencies) {
                task.dependencies.forEach(dep => allDependencies.add(dep));
            }
        });
        return Array.from(allDependencies);
    }

    private assessMilestoneRisks(tasks: Task[]): string[] {
        const risks: string[] = [];

        const blockedTasks = tasks.filter(t => t.status === TaskStatus.BLOCKED);
        if (blockedTasks.length > 0) {
            risks.push(`${blockedTasks.length} blocked tasks may delay milestone`);
        }

        const unassignedTasks = tasks.filter(t => !t.assignedAgentId && t.status === TaskStatus.TODO);
        if (unassignedTasks.length > tasks.length * 0.3) {
            risks.push('High percentage of unassigned tasks');
        }

        return risks;
    }

    private async generateTaskCompletionTimeSeries(tasks: Task[], timeRange: { start: Date; end: Date }): Promise<TimeSeriesData> {
        const dataPoints: TimeSeriesPoint[] = [];
        const daysDiff = Math.ceil((timeRange.end.getTime() - timeRange.start.getTime()) / (1000 * 60 * 60 * 24));

        for (let i = 0; i <= daysDiff; i++) {
            const date = new Date(timeRange.start.getTime() + i * 24 * 60 * 60 * 1000);
            const completedByDate = tasks.filter(t =>
                t.status === TaskStatus.COMPLETED &&
                t.completedAt &&
                new Date(t.completedAt) <= date
            ).length;

            dataPoints.push({
                timestamp: date,
                value: completedByDate,
                metadata: { type: 'cumulative_completions' }
            });
        }

        return {
            id: 'task-completion-trend',
            name: 'Task Completion Trend',
            description: 'Cumulative task completions over time',
            dataPoints,
            aggregation: 'daily',
            unit: 'tasks'
        };
    }

    private async generateResourceUtilizationTimeSeries(timeRange: { start: Date; end: Date }): Promise<TimeSeriesData> {
        const agents = await this.database.getAllAgents();
        const tasks = await this.database.getAvailableTasks();
        const dataPoints: TimeSeriesPoint[] = [];
        const daysDiff = Math.ceil((timeRange.end.getTime() - timeRange.start.getTime()) / (1000 * 60 * 60 * 24));

        for (let i = 0; i <= daysDiff; i++) {
            const date = new Date(timeRange.start.getTime() + i * 24 * 60 * 60 * 1000);
            const activeTasks = tasks.filter(task => {
                const taskStart = task.startedAt ? new Date(task.startedAt) : new Date(task.createdAt);
                const taskEnd = task.completedAt ? new Date(task.completedAt) : new Date();
                return taskStart <= date && date <= taskEnd;
            });

            const totalCapacity = agents.reduce((sum, agent) => sum + agent.maxConcurrentTasks, 0);
            const utilization = totalCapacity > 0 ? (activeTasks.length / totalCapacity) * 100 : 0;

            dataPoints.push({
                timestamp: date,
                value: utilization,
                metadata: {
                    activeTasks: activeTasks.length,
                    totalCapacity,
                    type: 'utilization_percentage'
                }
            });
        }

        return {
            id: 'resource-utilization-trend',
            name: 'Resource Utilization Trend',
            description: 'Daily resource utilization percentage',
            dataPoints,
            aggregation: 'daily',
            unit: 'percentage'
        };
    }

    private async generateQualityMetricsTimeSeries(tasks: Task[], timeRange: { start: Date; end: Date }): Promise<TimeSeriesData> {
        const dataPoints: TimeSeriesPoint[] = [];
        const weeks = this.generateWeekRange(timeRange.start, timeRange.end);

        weeks.forEach(week => {
            const weekEnd = new Date(week.getTime() + 7 * 24 * 60 * 60 * 1000);
            const weekTasks = tasks.filter(t => {
                if (!t.completedAt) return false;
                const completionDate = new Date(t.completedAt);
                return completionDate >= week && completionDate < weekEnd;
            });

            const qualityScores = weekTasks
                .map(t => t.metadata?.qualityScore)
                .filter(score => score !== undefined) as number[];

            const averageQuality = qualityScores.length > 0 ?
                qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length : 0;

            dataPoints.push({
                timestamp: week,
                value: averageQuality,
                metadata: {
                    tasksCompleted: weekTasks.length,
                    tasksWithQualityData: qualityScores.length,
                    type: 'average_quality_score'
                }
            });
        });

        return {
            id: 'quality-metrics-trend',
            name: 'Quality Metrics Trend',
            description: 'Weekly average quality scores',
            dataPoints,
            aggregation: 'weekly',
            unit: 'score'
        };
    }
}
