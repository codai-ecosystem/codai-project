import OpenAI from 'openai';
import dotenv from 'dotenv';
import {
    TaskAnalysis,
    PlanAnalysis,
    TaskCategory,
    Priority,
    AgentType,
    AgentCapability
} from '../types/index.js';

// Load environment variables
dotenv.config({ path: process.env.DOTENV_CONFIG_PATH });

export class AIService {
    private client: OpenAI;
    private deploymentName: string;

    constructor() {
        const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
        const apiKey = process.env.AZURE_OPENAI_API_KEY;
        this.deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o';

        if (!endpoint || !apiKey) {
            throw new Error('Azure OpenAI configuration is missing. Please set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY environment variables.');
        }

        this.client = new OpenAI({
            apiKey,
            baseURL: `${endpoint}/openai/deployments/${this.deploymentName}`,
            defaultQuery: { 'api-version': '2024-10-21' },
            defaultHeaders: {
                'api-key': apiKey,
            },
        });
    }

    async analyzePlan(planText: string): Promise<PlanAnalysis> {
        const prompt = `Analyze the following project plan and break it down into structured tasks with detailed analysis:

PLAN:
${planText}

Please provide a comprehensive analysis in the following JSON format:
{
  "tasks": [
    {
      "title": "Task title",
      "description": "Detailed task description",
      "complexity": 0-100,
      "estimatedHours": number,
      "suggestedCategory": "development|testing|documentation|research|planning|deployment|maintenance|review",
      "suggestedPriority": "low|medium|high|critical",
      "requiredCapabilities": ["javascript", "typescript", "react", etc.],
      "potentialRisks": ["risk1", "risk2"],
      "dependencies": ["dependency task titles"],
      "confidence": 0-100
    }
  ],
  "projectComplexity": 0-100,
  "estimatedDuration": hours,
  "suggestedAgents": ["senior_developer", "qa_engineer", etc.],
  "riskAssessment": ["risk1", "risk2"],
  "recommendations": ["rec1", "rec2"]
}

Focus on:
1. Breaking down complex tasks into smaller, actionable items
2. Identifying technical dependencies between tasks
3. Assessing complexity realistically
4. Matching tasks to appropriate agent capabilities
5. Identifying potential risks and blockers
6. Providing accurate time estimates`;

        try {
            const response = await this.client.chat.completions.create({
                model: this.deploymentName,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 4000,
                temperature: 0.1
            });

            const content = response.choices[0]?.message?.content?.trim();
            if (!content) {
                throw new Error('No response from AI service');
            }

            // Try to parse JSON response
            const analysis = JSON.parse(content) as PlanAnalysis;

            // Validate and transform the response
            return this.validatePlanAnalysis(analysis);
        } catch (error) {
            console.error('Error analyzing plan:', error);

            // Fallback: create a basic analysis
            return this.createFallbackAnalysis(planText);
        }
    }

    async analyzeTask(taskDescription: string, projectContext?: string): Promise<TaskAnalysis> {
        const prompt = `Analyze the following task and provide detailed analysis:

TASK: ${taskDescription}
${projectContext ? `PROJECT CONTEXT: ${projectContext}` : ''}

Provide analysis in this JSON format:
{
  "complexity": 0-100,
  "estimatedHours": number,
  "suggestedCategory": "development|testing|documentation|research|planning|deployment|maintenance|review",
  "suggestedPriority": "low|medium|high|critical",
  "requiredCapabilities": ["capability1", "capability2"],
  "potentialRisks": ["risk1", "risk2"],
  "dependencies": ["dependency1", "dependency2"],
  "confidence": 0-100
}

Consider:
1. Technical complexity and scope
2. Required skills and expertise
3. Time estimation based on similar tasks
4. Potential blockers and risks
5. Dependencies on other work
6. Priority based on impact and urgency`;

        try {
            const response = await this.client.chat.completions.create({
                model: this.deploymentName,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 1000,
                temperature: 0.1
            });

            const content = response.choices[0]?.message?.content?.trim();
            if (!content) {
                throw new Error('No response from AI service');
            }

            const analysis = JSON.parse(content) as TaskAnalysis;
            return this.validateTaskAnalysis(analysis);
        } catch (error) {
            console.error('Error analyzing task:', error);

            // Fallback: create a basic analysis
            return this.createFallbackTaskAnalysis(taskDescription);
        }
    }

    async suggestTaskAssignment(taskDescription: string, availableAgents: { id: string; capabilities: AgentCapability[]; performance: any }[]): Promise<{ agentId: string; confidence: number; reasoning: string }[]> {
        const prompt = `Given the following task and available agents, suggest the best assignment:

TASK: ${taskDescription}

AVAILABLE AGENTS:
${availableAgents.map(agent => `
- Agent ${agent.id}: 
  Capabilities: ${agent.capabilities.join(', ')}
  Performance: Quality ${agent.performance.qualityScore}/100, Efficiency ${agent.performance.efficiencyScore}/100
`).join('')}

Provide suggestions in JSON format:
[
  {
    "agentId": "agent_id",
    "confidence": 0-100,
    "reasoning": "Why this agent is suitable"
  }
]

Consider:
1. Matching task requirements to agent capabilities
2. Agent performance history
3. Current workload if available
4. Skill level alignment with task complexity`;

        try {
            const response = await this.client.chat.completions.create({
                model: this.deploymentName,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 1000,
                temperature: 0.2
            });

            const content = response.choices[0]?.message?.content?.trim();
            if (!content) {
                throw new Error('No response from AI service');
            }

            return JSON.parse(content);
        } catch (error) {
            console.error('Error suggesting task assignment:', error);

            // Fallback: simple capability matching
            return availableAgents.map(agent => ({
                agentId: agent.id,
                confidence: Math.min(90, agent.performance.qualityScore || 50),
                reasoning: `Agent with capabilities: ${agent.capabilities.join(', ')}`
            })).sort((a, b) => b.confidence - a.confidence);
        }
    }

    async generateTaskRecommendations(projectId: string, completedTasks: string[], availableTasks: string[]): Promise<{
        nextTasks: string[];
        reasoning: string;
        suggestions: string[];
    }> {
        const prompt = `Based on completed tasks and available tasks, recommend the next best tasks to work on:

COMPLETED TASKS:
${completedTasks.map(task => `- ${task}`).join('\n')}

AVAILABLE TASKS:
${availableTasks.map(task => `- ${task}`).join('\n')}

Provide recommendations in JSON format:
{
  "nextTasks": ["task1", "task2", "task3"],
  "reasoning": "Explanation of why these tasks should be prioritized",
  "suggestions": ["suggestion1", "suggestion2"]
}

Consider:
1. Logical progression and dependencies
2. Critical path analysis
3. Risk mitigation
4. Resource optimization
5. Business value delivery`;

        try {
            const response = await this.client.chat.completions.create({
                model: this.deploymentName,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 1000,
                temperature: 0.2
            });

            const content = response.choices[0]?.message?.content?.trim();
            if (!content) {
                throw new Error('No response from AI service');
            }

            return JSON.parse(content);
        } catch (error) {
            console.error('Error generating task recommendations:', error);

            // Fallback: simple prioritization
            return {
                nextTasks: availableTasks.slice(0, 3),
                reasoning: 'Prioritized based on order and availability',
                suggestions: ['Focus on completing high-priority tasks first', 'Consider task dependencies']
            };
        }
    }

    private validatePlanAnalysis(analysis: any): PlanAnalysis {
        return {
            tasks: (analysis.tasks || []).map((task: any) => this.validateTaskAnalysis(task)),
            suggestedTasks: [], // Will be populated by the caller based on tasks analysis
            projectComplexity: Math.max(0, Math.min(100, analysis.projectComplexity || 50)),
            estimatedDuration: Math.max(0, analysis.estimatedDuration || 1),
            suggestedAgents: Array.isArray(analysis.suggestedAgents) ? analysis.suggestedAgents : [AgentType.GENERIC],
            riskAssessment: Array.isArray(analysis.riskAssessment) ? analysis.riskAssessment : [],
            recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations : []
        };
    }

    private validateTaskAnalysis(analysis: any): TaskAnalysis {
        return {
            complexity: Math.max(0, Math.min(100, analysis.complexity || 50)),
            estimatedHours: Math.max(0.5, analysis.estimatedHours || 2),
            suggestedCategory: this.validateTaskCategory(analysis.suggestedCategory),
            suggestedPriority: this.validatePriority(analysis.suggestedPriority),
            requiredCapabilities: Array.isArray(analysis.requiredCapabilities)
                ? analysis.requiredCapabilities.filter((cap: string) => Object.values(AgentCapability).includes(cap as AgentCapability))
                : [AgentCapability.JAVASCRIPT],
            potentialRisks: Array.isArray(analysis.potentialRisks) ? analysis.potentialRisks : [],
            dependencies: Array.isArray(analysis.dependencies) ? analysis.dependencies : [],
            confidence: Math.max(0, Math.min(100, analysis.confidence || 70))
        };
    }

    private validateTaskCategory(category: string): TaskCategory {
        return Object.values(TaskCategory).includes(category as TaskCategory)
            ? category as TaskCategory
            : TaskCategory.DEVELOPMENT;
    }

    private validatePriority(priority: string): Priority {
        return Object.values(Priority).includes(priority as Priority)
            ? priority as Priority
            : Priority.MEDIUM;
    }

    private createFallbackAnalysis(planText: string): PlanAnalysis {
        // Create a basic analysis when AI fails
        const taskCount = planText.split(/\n/).filter(line => line.trim()).length;

        return {
            tasks: [{
                complexity: 50,
                estimatedHours: 4,
                suggestedCategory: TaskCategory.DEVELOPMENT,
                suggestedPriority: Priority.MEDIUM,
                requiredCapabilities: [AgentCapability.JAVASCRIPT, AgentCapability.TYPESCRIPT],
                potentialRisks: ['Task complexity may vary'],
                dependencies: [],
                confidence: 60
            }],
            suggestedTasks: [], // Will be populated by the caller based on tasks analysis
            projectComplexity: Math.min(100, taskCount * 10),
            estimatedDuration: taskCount * 2,
            suggestedAgents: [AgentType.SENIOR_DEVELOPER],
            riskAssessment: ['Manual analysis needed'],
            recommendations: ['Break down complex tasks', 'Review dependencies carefully']
        };
    }

    private createFallbackTaskAnalysis(taskDescription: string): TaskAnalysis {
        const wordCount = taskDescription.split(' ').length;
        const complexity = Math.min(100, wordCount * 2);

        return {
            complexity,
            estimatedHours: Math.max(1, complexity / 25),
            suggestedCategory: TaskCategory.DEVELOPMENT,
            suggestedPriority: Priority.MEDIUM,
            requiredCapabilities: [AgentCapability.JAVASCRIPT],
            potentialRisks: ['Needs detailed analysis'],
            dependencies: [],
            confidence: 50
        };
    }
}
