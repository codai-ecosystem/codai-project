import { DatabaseService } from '../database/DatabaseService.js';
import { AIService } from '../ai/AIService.js';
import {
    Task,
    Agent,
    AgentStatus,
    AgentCapability
} from '../types/index.js';

/**
 * CoordinationService manages multi-agent coordination and conflict resolution
 */
export class CoordinationService {
    constructor(
        private database: DatabaseService,
        private aiService: AIService
    ) { }

    /**
     * Suggest the best agent for a task assignment
     */
    async suggestTaskAssignment(taskId: string): Promise<{
        suggestedAgent: Agent | null;
        confidence: number;
        reasoning: string;
        alternatives: Agent[];
    }> {
        const task = await this.database.getTask(taskId);
        if (!task) {
            throw new Error(`Task ${taskId} not found`);
        }

        // Get all available agents
        const allAgents = await this.database.getAllAgents();
        const availableAgents = allAgents.filter(agent =>
            agent.status === AgentStatus.AVAILABLE &&
            agent.maxConcurrentTasks > 0
        );

        if (availableAgents.length === 0) {
            return {
                suggestedAgent: null,
                confidence: 0,
                reasoning: 'No available agents found',
                alternatives: []
            };
        }

        // Use AI to get intelligent suggestions
        const taskDescription = `${task.title}: ${task.description}`;
        const agentSuggestions = await this.aiService.suggestTaskAssignment(taskDescription, availableAgents);

        // Get the best suggestion
        const bestSuggestion = agentSuggestions.length > 0 ? agentSuggestions[0] : null;

        // Find the suggested agent
        const suggestedAgent = bestSuggestion
            ? availableAgents.find(agent => agent.id === bestSuggestion.agentId)
            : null;

        // Get alternative agents (top 3 after the suggested one)
        const alternatives = availableAgents
            .filter(agent => agent.id !== suggestedAgent?.id)
            .sort((a, b) => this.calculateAgentScore(task, b) - this.calculateAgentScore(task, a))
            .slice(0, 3);

        return {
            suggestedAgent: suggestedAgent || null,
            confidence: bestSuggestion?.confidence || 0,
            reasoning: bestSuggestion?.reasoning || 'No suitable agent found',
            alternatives
        };
    }

    /**
     * Check for potential conflicts in task assignments
     */
    async detectConflicts(): Promise<{
        conflicts: Array<{
            type: 'overallocation' | 'capability_mismatch' | 'deadline_conflict';
            severity: 'low' | 'medium' | 'high';
            description: string;
            affectedTasks: string[];
            affectedAgents: string[];
            recommendations: string[];
        }>;
    }> {
        const conflicts: Array<{
            type: 'overallocation' | 'capability_mismatch' | 'deadline_conflict';
            severity: 'low' | 'medium' | 'high';
            description: string;
            affectedTasks: string[];
            affectedAgents: string[];
            recommendations: string[];
        }> = [];
        const allAgents = await this.database.getAllAgents();
        const allTasks = await this.database.getAvailableTasks();

        // Check for overallocation
        for (const agent of allAgents) {
            if (agent.status === AgentStatus.BUSY) {
                const assignedTasks = allTasks.filter(task => task.assignedAgentId === agent.id);
                if (assignedTasks.length > agent.maxConcurrentTasks) {
                    conflicts.push({
                        type: 'overallocation',
                        severity: 'high',
                        description: `Agent ${agent.name} is assigned ${assignedTasks.length} tasks but can only handle ${agent.maxConcurrentTasks}`,
                        affectedTasks: assignedTasks.map(t => t.id),
                        affectedAgents: [agent.id],
                        recommendations: [
                            'Reassign some tasks to other available agents',
                            'Increase agent concurrent task limit if possible',
                            'Prioritize tasks by business value'
                        ]
                    });
                }
            }
        }

        // Check for capability mismatches
        const assignedTasks = allTasks.filter(task => task.assignedAgentId);
        for (const task of assignedTasks) {
            const agent = allAgents.find(a => a.id === task.assignedAgentId);
            if (agent && !this.hasRequiredCapabilities(task, agent)) {
                conflicts.push({
                    type: 'capability_mismatch',
                    severity: 'medium',
                    description: `Task ${task.title} requires capabilities that agent ${agent.name} doesn't have`,
                    affectedTasks: [task.id],
                    affectedAgents: [agent.id],
                    recommendations: [
                        'Reassign task to agent with appropriate capabilities',
                        'Provide additional training or tools to the agent',
                        'Break down task into smaller, more focused subtasks'
                    ]
                });
            }
        }

        return { conflicts };
    }

    /**
     * Optimize task distribution across agents
     */
    async optimizeTaskDistribution(): Promise<{
        recommendations: Array<{
            taskId: string;
            currentAgent?: string;
            suggestedAgent: string;
            reason: string;
            expectedImprovement: string;
        }>;
    }> {
        const recommendations = [];
        const allAgents = await this.database.getAllAgents();
        const allTasks = await this.database.getAvailableTasks();

        // Find tasks that could be reassigned for better efficiency
        const assignedTasks = allTasks.filter(task => task.assignedAgentId);

        for (const task of assignedTasks) {
            const currentAgent = allAgents.find(a => a.id === task.assignedAgentId);
            if (!currentAgent) continue;

            const suggestion = await this.suggestTaskAssignment(task.id);

            // If the suggestion is different from current assignment and has high confidence
            if (suggestion.suggestedAgent &&
                suggestion.suggestedAgent.id !== currentAgent.id &&
                suggestion.confidence > 0.7) {

                recommendations.push({
                    taskId: task.id,
                    currentAgent: currentAgent.id,
                    suggestedAgent: suggestion.suggestedAgent.id,
                    reason: suggestion.reasoning,
                    expectedImprovement: this.calculateExpectedImprovement(task, currentAgent, suggestion.suggestedAgent)
                });
            }
        }

        return { recommendations };
    }

    /**
     * Calculate agent score for a specific task
     */
    private calculateAgentScore(task: Task, agent: Agent): number {
        let score = 0;

        // Capability match score (0-40 points)
        const capabilityScore = this.calculateCapabilityScore(task, agent);
        score += capabilityScore * 0.4;

        // Performance score (0-30 points)
        const performanceScore = Math.min(agent.performance.successRate / 100, 1) * 30;
        score += performanceScore;

        // Availability score (0-20 points)
        const availabilityScore = agent.status === AgentStatus.AVAILABLE ? 20 :
            agent.status === AgentStatus.BUSY ? 5 : 0;
        score += availabilityScore;

        // Workload score (0-10 points) - prefer agents with lighter workload
        const workloadScore = Math.max(0, 10 - (agent.maxConcurrentTasks * 2));
        score += workloadScore;

        return score;
    }

    /**
     * Calculate capability match score
     */
    private calculateCapabilityScore(task: Task, agent: Agent): number {
        // This is a simplified scoring system
        // In a real implementation, you would have more sophisticated matching logic

        const requiredCapabilities = this.inferRequiredCapabilities(task);
        const matchingCapabilities = agent.capabilities.filter(cap =>
            requiredCapabilities.includes(cap)
        );

        if (requiredCapabilities.length === 0) return 100;

        return (matchingCapabilities.length / requiredCapabilities.length) * 100;
    }

    /**
     * Infer required capabilities from task
     */
    private inferRequiredCapabilities(task: Task): AgentCapability[] {
        const capabilities: AgentCapability[] = [];

        // Simple keyword-based inference
        const description = (task.description + ' ' + task.title).toLowerCase();

        if (description.includes('code') || description.includes('programming') || description.includes('development')) {
            capabilities.push(AgentCapability.PROGRAMMING);
        }

        if (description.includes('test') || description.includes('testing') || description.includes('qa')) {
            capabilities.push(AgentCapability.TESTING);
        }

        if (description.includes('deploy') || description.includes('deployment') || description.includes('devops')) {
            capabilities.push(AgentCapability.DEPLOYMENT);
        }

        if (description.includes('analyze') || description.includes('analysis') || description.includes('data')) {
            capabilities.push(AgentCapability.ANALYSIS);
        }

        if (description.includes('design') || description.includes('ui') || description.includes('ux')) {
            capabilities.push(AgentCapability.DESIGN);
        }

        if (description.includes('research') || description.includes('investigate')) {
            capabilities.push(AgentCapability.RESEARCH);
        }

        if (description.includes('document') || description.includes('documentation') || description.includes('write')) {
            capabilities.push(AgentCapability.DOCUMENTATION);
        }

        if (description.includes('review') || description.includes('feedback') || description.includes('audit')) {
            capabilities.push(AgentCapability.CODE_REVIEW);
        }

        // Default to general programming if no specific capabilities detected
        if (capabilities.length === 0) {
            capabilities.push(AgentCapability.PROGRAMMING);
        }

        return capabilities;
    }

    /**
     * Check if agent has required capabilities for task
     */
    private hasRequiredCapabilities(task: Task, agent: Agent): boolean {
        const required = this.inferRequiredCapabilities(task);
        return required.some(cap => agent.capabilities.includes(cap));
    }

    /**
     * Calculate expected improvement from reassignment
     */
    private calculateExpectedImprovement(
        task: Task,
        currentAgent: Agent,
        suggestedAgent: Agent
    ): string {
        const currentScore = this.calculateAgentScore(task, currentAgent);
        const suggestedScore = this.calculateAgentScore(task, suggestedAgent);

        const improvement = ((suggestedScore - currentScore) / currentScore) * 100;

        if (improvement > 20) {
            return `Significant improvement expected (${Math.round(improvement)}% better match)`;
        } else if (improvement > 10) {
            return `Moderate improvement expected (${Math.round(improvement)}% better match)`;
        } else {
            return `Minor improvement expected (${Math.round(improvement)}% better match)`;
        }
    }

    /**
     * Get coordination metrics and insights
     */
    async getCoordinationMetrics(): Promise<{
        totalAgents: number;
        activeAgents: number;
        utilizationRate: number;
        averageTasksPerAgent: number;
        conflictCount: number;
        optimizationOpportunities: number;
    }> {
        const allAgents = await this.database.getAllAgents();
        const allTasks = await this.database.getAvailableTasks();
        const conflicts = await this.detectConflicts();
        const optimizations = await this.optimizeTaskDistribution();

        const activeAgents = allAgents.filter(a => a.status !== AgentStatus.OFFLINE);
        const busyAgents = allAgents.filter(a => a.status === AgentStatus.BUSY);
        const assignedTasks = allTasks.filter(t => t.assignedAgentId);

        return {
            totalAgents: allAgents.length,
            activeAgents: activeAgents.length,
            utilizationRate: activeAgents.length > 0 ? (busyAgents.length / activeAgents.length) * 100 : 0,
            averageTasksPerAgent: activeAgents.length > 0 ? assignedTasks.length / activeAgents.length : 0,
            conflictCount: conflicts.conflicts.length,
            optimizationOpportunities: optimizations.recommendations.length
        };
    }
}
