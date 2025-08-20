#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListResourcesRequestSchema,
    ListToolsRequestSchema,
    ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { TalentAIServices, JobStatus, CandidateStatus, EmployeeStatus } from './services/TalentAIServices.js';
import { logger } from './utils/logger.js';

class TalentAIMCPServer {
    private server: Server;
    private talentAIServices: TalentAIServices;

    constructor() {
        this.talentAIServices = new TalentAIServices();

        this.server = new Server(
            {
                name: 'talentai-mcp',
                version: '1.0.0',
            },
            {
                capabilities: {
                    tools: {},
                    resources: {},
                },
            }
        );

        this.setupToolHandlers();
        this.setupResourceHandlers();

        // Error handling
        this.server.onerror = (error) => {
            logger.error('TalentAI MCP Server error:', error);
        };

        process.on('SIGINT', async () => {
            await this.cleanup();
            process.exit(0);
        });
    }

    private setupToolHandlers(): void {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'analyze_candidate_profile',
                        description: 'Analyze candidate resume/profile using AI for job compatibility',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                name: {
                                    type: 'string',
                                    description: 'Candidate name',
                                },
                                resumeText: {
                                    type: 'string',
                                    description: 'Resume content text (optional)',
                                },
                                jobDescription: {
                                    type: 'string',
                                    description: 'Job description to match against (optional)',
                                },
                                skills: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    description: 'List of candidate skills',
                                },
                            },
                            required: ['name'],
                        },
                    },
                    {
                        name: 'generate_interview_questions',
                        description: 'Generate comprehensive interview questions based on job requirements',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                jobTitle: {
                                    type: 'string',
                                    description: 'Position title for the interview',
                                },
                                requirements: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    description: 'List of job requirements and skills needed',
                                },
                                candidateBackground: {
                                    type: 'string',
                                    description: 'Brief candidate background for tailored questions (optional)',
                                },
                            },
                            required: ['jobTitle', 'requirements'],
                        },
                    },
                    {
                        name: 'analyze_team_composition',
                        description: 'Analyze team composition and suggest improvements for effectiveness',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                teamName: {
                                    type: 'string',
                                    description: 'Name of the team to analyze',
                                },
                                members: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            name: { type: 'string', description: 'Team member name' },
                                            role: { type: 'string', description: 'Role/position' },
                                            skills: { type: 'array', items: { type: 'string' }, description: 'List of skills' },
                                            experience: { type: 'number', description: 'Years of experience' },
                                            performance: { type: 'number', description: 'Performance rating (1-10, optional)' },
                                        },
                                        required: ['name', 'role', 'skills', 'experience'],
                                    },
                                    description: 'Array of team members with their details',
                                },
                                objectives: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    description: 'Team objectives and goals (optional)',
                                },
                            },
                            required: ['teamName', 'members'],
                        },
                    },
                    {
                        name: 'generate_performance_plan',
                        description: 'Generate a comprehensive performance improvement plan for an employee',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                name: {
                                    type: 'string',
                                    description: 'Employee name',
                                },
                                position: {
                                    type: 'string',
                                    description: 'Employee position/role',
                                },
                                currentPerformance: {
                                    type: 'number',
                                    description: 'Current performance rating (1-10)',
                                },
                                targetPerformance: {
                                    type: 'number',
                                    description: 'Target performance rating (1-10)',
                                },
                                areas: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    description: 'Areas needing improvement',
                                },
                                timeline: {
                                    type: 'string',
                                    description: 'Timeline for improvement (e.g., "90 days", "6 months")',
                                },
                            },
                            required: ['name', 'position', 'currentPerformance', 'targetPerformance', 'areas', 'timeline'],
                        },
                    },
                    {
                        name: 'get_talent_analytics',
                        description: 'Get comprehensive talent management analytics and insights',
                        inputSchema: {
                            type: 'object',
                            properties: {},
                        },
                    },
                    {
                        name: 'validate_job_posting',
                        description: 'Validate and suggest improvements for job posting content',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                title: {
                                    type: 'string',
                                    description: 'Job title',
                                },
                                description: {
                                    type: 'string',
                                    description: 'Job description content',
                                },
                                requirements: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    description: 'List of job requirements',
                                },
                                salaryRange: {
                                    type: 'string',
                                    description: 'Salary range (optional)',
                                },
                            },
                            required: ['title', 'description', 'requirements'],
                        },
                    },
                    {
                        name: 'calculate_hiring_metrics',
                        description: 'Calculate key hiring and recruitment metrics',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                timeToHireData: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            position: { type: 'string' },
                                            daysToHire: { type: 'number' },
                                        },
                                        required: ['position', 'daysToHire'],
                                    },
                                    description: 'Array of positions with time-to-hire data',
                                },
                                candidateData: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            position: { type: 'string' },
                                            source: { type: 'string' },
                                            status: { type: 'string' },
                                        },
                                        required: ['position', 'source', 'status'],
                                    },
                                    description: 'Array of candidate application data',
                                },
                            },
                            required: [],
                        },
                    },
                    {
                        name: 'get_talent_insights',
                        description: 'Get AI-powered insights and recommendations for talent management',
                        inputSchema: {
                            type: 'object',
                            properties: {},
                        },
                    },
                ],
            };
        });

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            try {
                const { name, arguments: args } = request.params;

                switch (name) {
                    case 'analyze_candidate_profile': {
                        const candidateData = args as {
                            name: string;
                            resumeText?: string;
                            jobDescription?: string;
                            skills?: string[];
                        };

                        const analysis = await this.talentAIServices.analyzeCandidateProfile(candidateData);

                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        candidate: candidateData.name,
                                        compatibilityScore: analysis.score,
                                        keywordMatch: analysis.keywordMatch,
                                        strengths: analysis.strengths,
                                        concerns: analysis.concerns,
                                        recommendations: analysis.recommendations,
                                        aiAnalysis: analysis.analysis,
                                    }, null, 2),
                                },
                            ],
                        };
                    }

                    case 'generate_interview_questions': {
                        const { jobTitle, requirements, candidateBackground } = args as {
                            jobTitle: string;
                            requirements: string[];
                            candidateBackground?: string;
                        };

                        const questions = await this.talentAIServices.generateInterviewQuestions(
                            jobTitle,
                            requirements,
                            candidateBackground
                        );

                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        jobTitle,
                                        interviewQuestions: questions,
                                        totalQuestions: Object.values(questions).flat().length,
                                    }, null, 2),
                                },
                            ],
                        };
                    }

                    case 'analyze_team_composition': {
                        const teamData = args as {
                            teamName: string;
                            members: Array<{
                                name: string;
                                role: string;
                                skills: string[];
                                experience: number;
                                performance?: number;
                            }>;
                            objectives?: string[];
                        };

                        const analysis = await this.talentAIServices.analyzeTeamComposition(teamData);

                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        team: teamData.teamName,
                                        teamSize: teamData.members.length,
                                        analysis: {
                                            strengths: analysis.strengths,
                                            gaps: analysis.gaps,
                                            recommendations: analysis.recommendations,
                                            diversityScore: analysis.diversityScore,
                                            skillCoverage: analysis.skillCoverage,
                                            riskFactors: analysis.riskFactors,
                                        },
                                    }, null, 2),
                                },
                            ],
                        };
                    }

                    case 'generate_performance_plan': {
                        const employeeData = args as {
                            name: string;
                            position: string;
                            currentPerformance: number;
                            targetPerformance: number;
                            areas: string[];
                            timeline: string;
                        };

                        const plan = await this.talentAIServices.generatePerformancePlan(employeeData);

                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        employee: employeeData.name,
                                        position: employeeData.position,
                                        performanceGap: employeeData.targetPerformance - employeeData.currentPerformance,
                                        timeline: employeeData.timeline,
                                        improvementPlan: plan,
                                    }, null, 2),
                                },
                            ],
                        };
                    }

                    case 'get_talent_analytics': {
                        const analytics = await this.talentAIServices.getTalentAnalytics();

                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        overview: {
                                            openPositions: analytics.openPositions,
                                            totalCandidates: analytics.totalCandidates,
                                            averageTimeToHire: `${analytics.averageTimeToHire} days`,
                                        },
                                        insights: {
                                            topSkillsInDemand: analytics.topSkillsInDemand,
                                            departmentBreakdown: analytics.departmentBreakdown,
                                            performanceDistribution: analytics.performanceDistribution,
                                            turnoverRisk: analytics.turnoverRisk,
                                        },
                                    }, null, 2),
                                },
                            ],
                        };
                    }

                    case 'validate_job_posting': {
                        const { title, description, requirements, salaryRange } = args as {
                            title: string;
                            description: string;
                            requirements: string[];
                            salaryRange?: string;
                        };

                        // Basic validation logic
                        const validation = {
                            isValid: true,
                            warnings: [] as string[],
                            suggestions: [] as string[],
                        };

                        if (title.length < 5) {
                            validation.warnings.push('Job title is very short - consider being more descriptive');
                        }

                        if (description.length < 100) {
                            validation.warnings.push('Job description is quite brief - consider adding more details');
                        }

                        if (requirements.length < 3) {
                            validation.warnings.push('Consider adding more specific requirements');
                        }

                        if (!salaryRange) {
                            validation.suggestions.push('Consider including salary range to attract more candidates');
                        }

                        validation.suggestions.push('Include company benefits and culture information');
                        validation.suggestions.push('Specify remote work options if applicable');
                        validation.suggestions.push('Add growth and development opportunities');

                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        jobTitle: title,
                                        validation,
                                        recommendedImprovements: validation.suggestions,
                                    }, null, 2),
                                },
                            ],
                        };
                    }

                    case 'calculate_hiring_metrics': {
                        const { timeToHireData = [], candidateData = [] } = args as {
                            timeToHireData?: Array<{ position: string; daysToHire: number }>;
                            candidateData?: Array<{ position: string; source: string; status: string }>;
                        };

                        const avgTimeToHire = timeToHireData.length > 0
                            ? timeToHireData.reduce((sum, item) => sum + item.daysToHire, 0) / timeToHireData.length
                            : 0;

                        const sourceAnalysis = candidateData.reduce((acc, candidate) => {
                            acc[candidate.source] = (acc[candidate.source] || 0) + 1;
                            return acc;
                        }, {} as Record<string, number>);

                        const conversionRate = candidateData.length > 0
                            ? (candidateData.filter(c => c.status === 'hired').length / candidateData.length) * 100
                            : 0;

                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        metrics: {
                                            averageTimeToHire: `${avgTimeToHire.toFixed(1)} days`,
                                            totalApplications: candidateData.length,
                                            conversionRate: `${conversionRate.toFixed(1)}%`,
                                            topSources: Object.entries(sourceAnalysis)
                                                .sort(([, a], [, b]) => b - a)
                                                .slice(0, 5),
                                        },
                                        insights: [
                                            'Focus on top-performing recruitment sources',
                                            'Optimize interview process to reduce time-to-hire',
                                            'Improve candidate experience to boost conversion rates',
                                        ],
                                    }, null, 2),
                                },
                            ],
                        };
                    }

                    case 'get_talent_insights': {
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        availableCapabilities: [
                                            'AI-powered candidate profile analysis',
                                            'Dynamic interview question generation',
                                            'Team composition analysis and optimization',
                                            'Performance improvement plan creation',
                                            'Comprehensive talent analytics',
                                            'Job posting validation and optimization',
                                            'Hiring metrics calculation and insights',
                                        ],
                                        hrStatuses: {
                                            jobStatuses: Object.values(JobStatus),
                                            candidateStatuses: Object.values(CandidateStatus),
                                            employeeStatuses: Object.values(EmployeeStatus),
                                        },
                                        features: {
                                            'AI Analysis': 'Leverage Azure OpenAI for intelligent HR insights',
                                            'Performance Management': 'Create data-driven improvement plans',
                                            'Team Optimization': 'Analyze and enhance team effectiveness',
                                            'Recruitment Efficiency': 'Optimize hiring processes and metrics',
                                            'Talent Analytics': 'Comprehensive workforce analytics and reporting',
                                        },
                                    }, null, 2),
                                },
                            ],
                        };
                    }

                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
            } catch (error) {
                logger.error(`Tool execution error: ${error}`);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                        },
                    ],
                };
            }
        });
    }

    private setupResourceHandlers(): void {
        this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
            return {
                resources: [
                    {
                        uri: 'talentai://analytics',
                        mimeType: 'application/json',
                        name: 'Talent Analytics Dashboard',
                        description: 'Comprehensive talent management analytics and insights',
                    },
                    {
                        uri: 'talentai://hr-statuses',
                        mimeType: 'application/json',
                        name: 'HR Status Types',
                        description: 'Available status classifications for jobs, candidates, and employees',
                    },
                ],
            };
        });

        this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
            const uri = request.params.uri;

            switch (uri) {
                case 'talentai://analytics': {
                    const analytics = await this.talentAIServices.getTalentAnalytics();
                    return {
                        contents: [
                            {
                                uri,
                                mimeType: 'application/json',
                                text: JSON.stringify({
                                    dashboard: analytics,
                                    capabilities: [
                                        'Candidate profile analysis with AI scoring',
                                        'Interview question generation',
                                        'Team composition optimization',
                                        'Performance improvement planning',
                                        'Recruitment metrics and analytics',
                                    ],
                                    lastUpdated: new Date().toISOString(),
                                }, null, 2),
                            },
                        ],
                    };
                }

                case 'talentai://hr-statuses': {
                    return {
                        contents: [
                            {
                                uri,
                                mimeType: 'application/json',
                                text: JSON.stringify({
                                    statusTypes: {
                                        jobStatuses: Object.values(JobStatus),
                                        candidateStatuses: Object.values(CandidateStatus),
                                        employeeStatuses: Object.values(EmployeeStatus),
                                    },
                                    statusDescriptions: {
                                        jobs: {
                                            [JobStatus.DRAFT]: 'Job posting is being prepared',
                                            [JobStatus.ACTIVE]: 'Job posting is live and accepting applications',
                                            [JobStatus.PAUSED]: 'Job posting is temporarily paused',
                                            [JobStatus.CLOSED]: 'Job posting is closed, position filled',
                                            [JobStatus.CANCELLED]: 'Job posting was cancelled',
                                        },
                                        candidates: {
                                            [CandidateStatus.APPLIED]: 'Candidate has submitted application',
                                            [CandidateStatus.SCREENING]: 'Initial screening in progress',
                                            [CandidateStatus.INTERVIEWING]: 'Candidate is in interview process',
                                            [CandidateStatus.OFFER_EXTENDED]: 'Job offer has been extended',
                                            [CandidateStatus.HIRED]: 'Candidate was successfully hired',
                                            [CandidateStatus.REJECTED]: 'Candidate was not selected',
                                            [CandidateStatus.WITHDRAWN]: 'Candidate withdrew from process',
                                        },
                                        employees: {
                                            [EmployeeStatus.ACTIVE]: 'Employee is actively working',
                                            [EmployeeStatus.INACTIVE]: 'Employee is temporarily inactive',
                                            [EmployeeStatus.ON_LEAVE]: 'Employee is on approved leave',
                                            [EmployeeStatus.TERMINATED]: 'Employee has been terminated',
                                        },
                                    },
                                }, null, 2),
                            },
                        ],
                    };
                }

                default:
                    throw new Error(`Resource not found: ${uri}`);
            }
        });
    }

    private async cleanup(): Promise<void> {
        logger.info('Cleaning up TalentAI MCP Server...');
        await this.talentAIServices.cleanupExpiredData();
    }

    async run(): Promise<void> {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        logger.info('TalentAI MCP Server running on stdio');
    }
}

const server = new TalentAIMCPServer();
server.run().catch(console.error);
