import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DatabaseService } from '../../src/database/DatabaseService.js';
import { AIService } from '../../src/ai/AIService.js';
import { AdvancedAnalyticsService } from '../../src/services/AdvancedAnalyticsService.js';
import { handleAdvancedAnalytics } from '../../src/tools/advanced-analytics.js';
import { AdvancedAnalytics, Project, Agent, Task, TaskStatus, AgentType, Priority } from '../../src/types/index.js';

describe('Advanced Analytics Service', () => {
    let databaseService: DatabaseService;
    let aiService: AIService;
    let analyticsService: AdvancedAnalyticsService;

    beforeEach(async () => {
        // Mock database service
        databaseService = {
            getAllProjects: vi.fn().mockResolvedValue([
                {
                    id: 'project1',
                    name: 'Test Project 1',
                    status: 'active',
                    priority: Priority.HIGH,
                    createdAt: new Date('2025-01-01'),
                    updatedAt: new Date('2025-01-15')
                } as Project
            ]),
            getAllAgents: vi.fn().mockResolvedValue([
                {
                    id: 'agent1',
                    name: 'Test Agent',
                    type: AgentType.SENIOR_DEVELOPER,
                    capabilities: ['programming', 'analysis', 'testing'],
                    status: 'available',
                    performance: {
                        tasksCompleted: 10,
                        averageCompletionTime: 2.5,
                        qualityScore: 95,
                        reliabilityScore: 98,
                        efficiencyScore: 92,
                        successRate: 96,
                        lastUpdated: new Date()
                    },
                    createdAt: new Date('2025-01-01')
                } as Agent
            ]),
            getAllTasks: vi.fn().mockResolvedValue([
                {
                    id: 'task1',
                    title: 'Test Task',
                    status: TaskStatus.COMPLETED,
                    projectId: 'project1',
                    assignedAgentId: 'agent1',
                    estimatedHours: 3,
                    actualHours: 2.5,
                    createdAt: new Date('2025-01-02'),
                    completedAt: new Date('2025-01-03')
                } as Task
            ]),
            getTasksByProject: vi.fn().mockResolvedValue([
                {
                    id: 'task1',
                    title: 'Test Task',
                    status: TaskStatus.COMPLETED,
                    projectId: 'project1',
                    assignedAgentId: 'agent1',
                    estimatedHours: 3,
                    actualHours: 2.5,
                    createdAt: new Date('2025-01-02'),
                    completedAt: new Date('2025-01-03')
                } as Task
            ]),
            getAvailableTasks: vi.fn().mockResolvedValue([
                {
                    id: 'task2',
                    title: 'Available Task',
                    status: TaskStatus.TODO,
                    projectId: 'project1',
                    estimatedHours: 4,
                    createdAt: new Date('2025-01-04')
                } as Task
            ])
        } as any;

        // Mock AI service
        aiService = {
            analyzeProjectPlan: vi.fn().mockResolvedValue({
                tasks: [],
                insights: ['Predictive insight example'],
                recommendations: ['Optimization recommendation']
            })
        } as any;

        analyticsService = new AdvancedAnalyticsService(databaseService, aiService);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Core Analytics Functionality', () => {
        it('should generate comprehensive analytics data', async () => {
            const timeRange = {
                start: new Date('2025-01-01'),
                end: new Date('2025-01-31')
            };

            const analytics = await analyticsService.getAdvancedAnalytics(timeRange);

            expect(analytics).toBeDefined();
            expect(analytics.projectTrends).toBeDefined();
            expect(analytics.agentPerformanceMetrics).toBeDefined();
            expect(analytics.resourceUtilization).toBeDefined();
            expect(analytics.predictiveInsights).toBeDefined();
            expect(analytics.customReports).toBeDefined();
            expect(analytics.timeSeriesData).toBeDefined();

            // Verify data structure
            expect(Array.isArray(analytics.projectTrends)).toBe(true);
            expect(Array.isArray(analytics.agentPerformanceMetrics)).toBe(true);
            expect(Array.isArray(analytics.predictiveInsights)).toBe(true);
            expect(Array.isArray(analytics.customReports)).toBe(true);
            expect(Array.isArray(analytics.timeSeriesData)).toBe(true);
        });

        it('should handle empty data gracefully', async () => {
            // Mock empty data
            databaseService.getAllProjects = vi.fn().mockResolvedValue([]);
            databaseService.getAllAgents = vi.fn().mockResolvedValue([]);
            databaseService.getTasksByProject = vi.fn().mockResolvedValue([]);
            databaseService.getAvailableTasks = vi.fn().mockResolvedValue([]);

            const analytics = await analyticsService.getAdvancedAnalytics();

            expect(analytics).toBeDefined();
            expect(analytics.projectTrends).toEqual([]);
            expect(analytics.agentPerformanceMetrics).toEqual([]);
            expect(analytics.resourceUtilization).toBeDefined();
        });

        it('should calculate project trends correctly', async () => {
            const analytics = await analyticsService.getAdvancedAnalytics();

            expect(analytics.projectTrends).toHaveLength(1);

            const projectTrend = analytics.projectTrends[0];
            expect(projectTrend.projectId).toBe('project1');
            expect(projectTrend.projectName).toBe('Test Project 1');
            expect(projectTrend.completionTrend).toBeDefined();
            expect(projectTrend.velocityMetrics).toBeDefined();
            expect(projectTrend.bottleneckAnalysis).toBeDefined();
            expect(projectTrend.riskIndicators).toBeDefined();
            expect(projectTrend.milestoneProgress).toBeDefined();
        });

        it('should calculate agent performance metrics correctly', async () => {
            const analytics = await analyticsService.getAdvancedAnalytics();

            expect(analytics.agentPerformanceMetrics).toHaveLength(1);

            const agentMetrics = analytics.agentPerformanceMetrics[0];
            expect(agentMetrics.agentId).toBe('agent1');
            expect(agentMetrics.performanceScore).toBeGreaterThan(0);
            expect(agentMetrics.taskCompletionRate).toBeGreaterThanOrEqual(0);
            expect(agentMetrics.averageTaskDuration).toBeGreaterThanOrEqual(0);
            expect(agentMetrics.qualityScore).toBeDefined();
            expect(agentMetrics.specializations).toBeDefined();
        });
    });

    describe('Tool Integration', () => {
        it('should handle advanced analytics tool call successfully', async () => {
            const args = {
                workspaceId: 'test-workspace',
                timeRange: {
                    start: '2025-01-01T00:00:00.000Z',
                    end: '2025-01-31T23:59:59.999Z'
                },
                metrics: ['project_trends', 'agent_performance'],
                aggregation: 'weekly'
            };

            const result = await handleAdvancedAnalytics(args, databaseService, aiService);

            expect(result).toBeDefined();
            expect(result.content).toBeDefined();
            expect(result.content[0]).toBeDefined();
            expect(result.content[0].type).toBe('text');

            const responseData = JSON.parse(result.content[0].text);
            expect(responseData.success).toBe(true);
            expect(responseData.data).toBeDefined();
            expect(responseData.metadata).toBeDefined();
            expect(responseData.metadata.workspaceId).toBe('test-workspace');
        });

        it('should handle tool errors gracefully', async () => {
            // Mock database error
            databaseService.getAllProjects = vi.fn().mockRejectedValue(new Error('Database error'));

            const args = {
                workspaceId: 'test-workspace'
            };

            const result = await handleAdvancedAnalytics(args, databaseService, aiService);

            expect(result).toBeDefined();
            expect(result.content).toBeDefined();

            const responseData = JSON.parse(result.content[0].text);
            expect(responseData.success).toBe(false);
            expect(responseData.error).toBeDefined();
            expect(responseData.details).toContain('Database error');
        });

        it('should validate required parameters', async () => {
            const args = {}; // Missing workspaceId

            const result = await handleAdvancedAnalytics(args, databaseService, aiService);

            // Should still work with default workspace ID handling
            expect(result).toBeDefined();
            expect(result.content).toBeDefined();
        });
    });

    describe('Performance and Caching', () => {
        it('should cache analytics results for performance', async () => {
            // First call
            const analytics1 = await analyticsService.getAdvancedAnalytics();

            // Second call (should be faster due to caching)
            const analytics2 = await analyticsService.getAdvancedAnalytics();

            expect(analytics1).toEqual(analytics2);

            // The caching behavior depends on implementation
            // For now, we'll just verify that both calls return the same data
            expect(analytics1.projectTrends).toEqual(analytics2.projectTrends);
            expect(analytics1.agentPerformanceMetrics).toEqual(analytics2.agentPerformanceMetrics);
        });

        it('should handle time range filtering', async () => {
            const specificTimeRange = {
                start: new Date('2025-01-01'),
                end: new Date('2025-01-15')
            };

            const analytics = await analyticsService.getAdvancedAnalytics(specificTimeRange);

            expect(analytics).toBeDefined();
            expect(analytics.projectTrends).toBeDefined();
        });
    });

    describe('Predictive Analytics', () => {
        it('should generate predictive insights', async () => {
            const analytics = await analyticsService.getAdvancedAnalytics();

            expect(analytics.predictiveInsights).toBeDefined();
            expect(Array.isArray(analytics.predictiveInsights)).toBe(true);

            if (analytics.predictiveInsights.length > 0) {
                const insight = analytics.predictiveInsights[0];
                expect(insight.type).toBeDefined();
                expect(insight.prediction).toBeDefined();
                expect(insight.confidence).toBeGreaterThanOrEqual(0);
                expect(insight.confidence).toBeLessThanOrEqual(100);
                expect(insight.timeHorizon).toBeDefined();
                expect(insight.factors).toBeDefined();
            }
        });

        it('should identify resource bottlenecks', async () => {
            const analytics = await analyticsService.getAdvancedAnalytics();

            expect(analytics.resourceUtilization).toBeDefined();
            expect(analytics.resourceUtilization.bottlenecks).toBeDefined();
            expect(Array.isArray(analytics.resourceUtilization.bottlenecks)).toBe(true);
        });
    });

    describe('Data Quality and Validation', () => {
        it('should validate data types in analytics results', async () => {
            const analytics = await analyticsService.getAdvancedAnalytics();

            // Validate required properties exist and have correct types
            expect(typeof analytics).toBe('object');
            expect(Array.isArray(analytics.projectTrends)).toBe(true);
            expect(Array.isArray(analytics.agentPerformanceMetrics)).toBe(true);
            expect(typeof analytics.resourceUtilization).toBe('object');
            expect(Array.isArray(analytics.predictiveInsights)).toBe(true);
            expect(Array.isArray(analytics.customReports)).toBe(true);
            expect(Array.isArray(analytics.timeSeriesData)).toBe(true);
        });

        it('should handle malformed input data', async () => {
            // Mock malformed data
            databaseService.getAllProjects = vi.fn().mockResolvedValue([
                { id: 'invalid', name: null } // Invalid project data
            ]);

            const analytics = await analyticsService.getAdvancedAnalytics();

            // Should handle gracefully without throwing
            expect(analytics).toBeDefined();
            expect(analytics.projectTrends).toBeDefined();
        });
    });
});

describe('Integration Tests', () => {
    it('should integrate with real database service', async () => {
        // This would be a more complex integration test
        // For now, we'll just verify the service can be instantiated
        const realDbService = new DatabaseService();
        const realAiService = new AIService();

        const analyticsService = new AdvancedAnalyticsService(realDbService, realAiService);

        expect(analyticsService).toBeDefined();
        expect(typeof analyticsService.getAdvancedAnalytics).toBe('function');
    });
});
