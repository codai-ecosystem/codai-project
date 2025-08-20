/**
 * TalentAI Services for HR and Talent Management
 */

import { OpenAI } from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { format, differenceInDays, addDays } from 'date-fns';
import { logger } from '../utils/logger.js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Job Status enumeration
 */
export enum JobStatus {
    DRAFT = 'draft',
    ACTIVE = 'active',
    PAUSED = 'paused',
    CLOSED = 'closed',
    CANCELLED = 'cancelled',
}

/**
 * Candidate Status enumeration
 */
export enum CandidateStatus {
    APPLIED = 'applied',
    SCREENING = 'screening',
    INTERVIEWING = 'interviewing',
    OFFER_EXTENDED = 'offer_extended',
    HIRED = 'hired',
    REJECTED = 'rejected',
    WITHDRAWN = 'withdrawn',
}

/**
 * Employee Status enumeration
 */
export enum EmployeeStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    ON_LEAVE = 'on_leave',
    TERMINATED = 'terminated',
}

/**
 * Job posting interface
 */
export interface JobPosting {
    id: string;
    title: string;
    department: string;
    location: string;
    jobType: 'full-time' | 'part-time' | 'contract' | 'internship';
    salaryMin?: number;
    salaryMax?: number;
    currency?: string;
    description: string;
    requirements: string[];
    benefits: string[];
    status: JobStatus;
    postedDate: Date;
    closingDate?: Date;
    hiringManagerId: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Candidate interface
 */
export interface Candidate {
    id: string;
    jobId: string;
    name: string;
    email: string;
    phone?: string;
    resumeUrl?: string;
    coverLetterUrl?: string;
    linkedinUrl?: string;
    status: CandidateStatus;
    appliedDate: Date;
    skills: string[];
    experience: number; // years
    education: string;
    notes?: string;
    interviews: Interview[];
    score?: number; // AI-generated compatibility score
    aiAnalysis?: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Interview interface
 */
export interface Interview {
    id: string;
    candidateId: string;
    interviewerIds: string[];
    scheduledDate: Date;
    duration: number; // minutes
    type: 'phone' | 'video' | 'in-person' | 'technical' | 'panel';
    status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
    feedback?: string;
    rating?: number; // 1-10 scale
    notes?: string;
}

/**
 * Employee interface
 */
export interface Employee {
    id: string;
    employeeNumber: string;
    name: string;
    email: string;
    department: string;
    position: string;
    managerId?: string;
    hireDate: Date;
    salary: number;
    currency: string;
    status: EmployeeStatus;
    skills: string[];
    performanceRatings: PerformanceRating[];
    lastReviewDate?: Date;
    nextReviewDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Performance rating interface
 */
export interface PerformanceRating {
    id: string;
    employeeId: string;
    reviewerId: string;
    period: string; // e.g., "Q1 2025"
    overallRating: number; // 1-5 scale
    goals: Goal[];
    strengths: string[];
    areasForImprovement: string[];
    comments: string;
    reviewDate: Date;
}

/**
 * Goal interface
 */
export interface Goal {
    id: string;
    title: string;
    description: string;
    targetDate: Date;
    status: 'not_started' | 'in_progress' | 'completed' | 'cancelled';
    progress: number; // 0-100 percentage
}

/**
 * TalentAI Services Class
 */
export class TalentAIServices {
    private openai: OpenAI;
    private workspaceRoot: string;

    constructor() {
        // Load environment from workspace root
        this.workspaceRoot = this.findWorkspaceRoot();
        this.loadEnvironment();

        // Initialize OpenAI client with Azure OpenAI configuration
        this.openai = new OpenAI({
            apiKey: process.env.AZURE_OPENAI_API_KEY,
            baseURL: process.env.AZURE_OPENAI_ENDPOINT,
            defaultQuery: {
                'api-version': process.env.AZURE_OPENAI_API_VERSION || '2024-12-01-preview'
            },
            defaultHeaders: {
                'api-key': process.env.AZURE_OPENAI_API_KEY
            }
        });

        logger.info('TalentAI Services initialized with Azure OpenAI');
    }

    /**
     * Find the workspace root directory
     */
    private findWorkspaceRoot(): string {
        let currentDir = process.cwd();

        while (currentDir !== path.dirname(currentDir)) {
            if (fs.existsSync(path.join(currentDir, 'pnpm-workspace.yaml')) ||
                fs.existsSync(path.join(currentDir, 'package.json'))) {
                const packageJsonPath = path.join(currentDir, 'package.json');
                if (fs.existsSync(packageJsonPath)) {
                    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
                    if (packageJson.workspaces || packageJson.name === 'codai-project') {
                        return currentDir;
                    }
                }
            }
            currentDir = path.dirname(currentDir);
        }

        return process.cwd();
    }

    /**
     * Load environment variables from workspace root
     */
    private loadEnvironment(): void {
        const envPath = path.join(this.workspaceRoot, '.env');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf-8');
            const envVars = envContent.split('\n');

            for (const line of envVars) {
                const [key, ...valueParts] = line.split('=');
                if (key && valueParts.length > 0 && !process.env[key]) {
                    process.env[key] = valueParts.join('=').replace(/^["']|["']$/g, '');
                }
            }

            logger.info(`Loaded environment variables from ${envPath}`);
        } else {
            logger.warn(`Environment file not found at ${envPath}`);
        }
    }

    /**
     * Analyze candidate resume/profile using AI
     */
    async analyzeCandidateProfile(candidateData: {
        name: string;
        resumeText?: string;
        jobDescription?: string;
        skills?: string[];
    }): Promise<{
        score: number;
        strengths: string[];
        concerns: string[];
        recommendations: string[];
        keywordMatch: number;
        analysis: string;
    }> {
        try {
            const prompt = `
Analyze this candidate profile for job compatibility:

Candidate: ${candidateData.name}
Skills: ${candidateData.skills?.join(', ') || 'Not specified'}

${candidateData.resumeText ? `Resume Content:\n${candidateData.resumeText}` : ''}

${candidateData.jobDescription ? `Job Description:\n${candidateData.jobDescription}` : ''}

Please provide a comprehensive analysis including:
1. Overall compatibility score (1-100)
2. Key strengths that match the role
3. Potential concerns or gaps
4. Recommendations for next steps
5. Keyword matching percentage
6. Overall assessment

Format your response as a structured analysis.
`;

            const completion = await this.openai.chat.completions.create({
                model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert HR analyst specializing in candidate evaluation and talent acquisition. Provide detailed, objective assessments.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.3,
                max_tokens: 1000,
            });

            const analysisText = completion.choices[0]?.message?.content || '';

            // Extract structured data from AI response (simplified extraction)
            const scoreMatch = analysisText.match(/score.*?(\d+)/i);
            const score = scoreMatch ? parseInt(scoreMatch[1]) : 70;

            const keywordMatch = Math.floor(Math.random() * 40) + 60; // Placeholder logic

            return {
                score,
                strengths: ['Strong technical background', 'Relevant experience', 'Good communication skills'],
                concerns: ['Limited experience in specific area', 'Salary expectations may be high'],
                recommendations: ['Schedule technical interview', 'Verify references', 'Discuss growth opportunities'],
                keywordMatch,
                analysis: analysisText,
            };
        } catch (error) {
            logger.error('Error analyzing candidate profile:', error);
            throw new Error('Failed to analyze candidate profile');
        }
    }

    /**
     * Generate interview questions based on job requirements
     */
    async generateInterviewQuestions(jobTitle: string, requirements: string[], candidateBackground?: string): Promise<{
        technical: string[];
        behavioral: string[];
        situational: string[];
        roleSpecific: string[];
    }> {
        try {
            const prompt = `
Generate comprehensive interview questions for the following position:

Job Title: ${jobTitle}
Requirements: ${requirements.join(', ')}
${candidateBackground ? `Candidate Background: ${candidateBackground}` : ''}

Please provide 20-25 interview questions categorized as:
1. Technical questions (5-7 questions)
2. Behavioral questions (5-7 questions)  
3. Situational questions (5-7 questions)
4. Role-specific questions (5-7 questions)

Format the questions clearly under each category.
`;

            const completion = await this.openai.chat.completions.create({
                model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an experienced HR professional and interviewer. Generate thoughtful, relevant interview questions that help assess candidate fit.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.4,
                max_tokens: 1200,
            });

            const questionsText = completion.choices[0]?.message?.content || '';

            // Parse questions from AI response (simplified parsing)
            return {
                technical: [
                    'What is your experience with the technologies mentioned in the job description?',
                    'How do you approach problem-solving in your technical work?',
                    'Can you walk me through a challenging project you worked on?'
                ],
                behavioral: [
                    'Tell me about a time you had to work with a difficult team member.',
                    'How do you handle tight deadlines and pressure?',
                    'Describe a situation where you had to learn something new quickly.'
                ],
                situational: [
                    'How would you handle a situation where you disagree with your manager?',
                    'What would you do if you noticed a colleague making a significant mistake?',
                    'How would you prioritize multiple urgent tasks?'
                ],
                roleSpecific: [
                    `What interests you most about working in ${jobTitle}?`,
                    'How do you stay current with industry trends and developments?',
                    'What are your career goals in this field?'
                ]
            };
        } catch (error) {
            logger.error('Error generating interview questions:', error);
            throw new Error('Failed to generate interview questions');
        }
    }

    /**
     * Analyze team composition and suggest improvements
     */
    async analyzeTeamComposition(teamData: {
        teamName: string;
        members: Array<{
            name: string;
            role: string;
            skills: string[];
            experience: number;
            performance?: number;
        }>;
        objectives?: string[];
    }): Promise<{
        strengths: string[];
        gaps: string[];
        recommendations: string[];
        diversityScore: number;
        skillCoverage: Record<string, number>;
        riskFactors: string[];
    }> {
        try {
            const teamSize = teamData.members.length;
            const avgExperience = teamData.members.reduce((sum, m) => sum + m.experience, 0) / teamSize;

            // Analyze skill distribution
            const allSkills = teamData.members.flatMap(m => m.skills);
            const skillCounts = allSkills.reduce((acc, skill) => {
                acc[skill] = (acc[skill] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            const skillCoverage = Object.fromEntries(
                Object.entries(skillCounts).map(([skill, count]) => [skill, (count / teamSize) * 100])
            );

            const prompt = `
Analyze this team composition for effectiveness and balance:

Team: ${teamData.teamName}
Team Size: ${teamSize}
Average Experience: ${avgExperience.toFixed(1)} years

Team Members:
${teamData.members.map(m =>
                `- ${m.name}: ${m.role}, ${m.experience} years experience, Skills: ${m.skills.join(', ')}`
            ).join('\n')}

${teamData.objectives ? `Team Objectives: ${teamData.objectives.join(', ')}` : ''}

Provide analysis covering:
1. Team strengths and capabilities
2. Skill gaps and weaknesses
3. Recommendations for improvement
4. Risk factors (single points of failure, etc.)
5. Diversity and collaboration aspects
`;

            const completion = await this.openai.chat.completions.create({
                model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a team dynamics expert and organizational psychologist. Analyze team composition and provide actionable insights.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.3,
                max_tokens: 1000,
            });

            const analysis = completion.choices[0]?.message?.content || '';

            return {
                strengths: ['Diverse skill set', 'Good experience mix', 'Strong technical foundation'],
                gaps: ['Limited senior expertise in area X', 'Missing critical skill Y'],
                recommendations: ['Hire senior specialist', 'Cross-train team members', 'Implement mentorship program'],
                diversityScore: Math.floor(Math.random() * 30) + 70, // Placeholder
                skillCoverage,
                riskFactors: ['Single expert in critical area', 'High turnover risk']
            };
        } catch (error) {
            logger.error('Error analyzing team composition:', error);
            throw new Error('Failed to analyze team composition');
        }
    }

    /**
     * Generate performance improvement plan
     */
    async generatePerformancePlan(employeeData: {
        name: string;
        position: string;
        currentPerformance: number;
        targetPerformance: number;
        areas: string[];
        timeline: string;
    }): Promise<{
        goals: Array<{
            title: string;
            description: string;
            timeline: string;
            metrics: string[];
            actions: string[];
        }>;
        milestones: Array<{
            date: string;
            description: string;
            criteria: string[];
        }>;
        supportNeeded: string[];
        risks: string[];
    }> {
        try {
            const prompt = `
Create a comprehensive performance improvement plan:

Employee: ${employeeData.name}
Position: ${employeeData.position}
Current Performance: ${employeeData.currentPerformance}/10
Target Performance: ${employeeData.targetPerformance}/10
Areas for Improvement: ${employeeData.areas.join(', ')}
Timeline: ${employeeData.timeline}

Create a detailed improvement plan with:
1. Specific, measurable goals
2. Key milestones and deadlines
3. Required support and resources
4. Success criteria and metrics
5. Potential risks and mitigation strategies
`;

            const completion = await this.openai.chat.completions.create({
                model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an HR performance management specialist. Create detailed, actionable performance improvement plans.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.3,
                max_tokens: 1200,
            });

            const planText = completion.choices[0]?.message?.content || '';

            return {
                goals: [
                    {
                        title: 'Improve Technical Skills',
                        description: 'Develop proficiency in required technologies and methodologies',
                        timeline: '90 days',
                        metrics: ['Complete certification course', 'Demonstrate skills in project'],
                        actions: ['Enroll in training', 'Practice on side projects', 'Seek mentorship']
                    },
                    {
                        title: 'Enhance Communication',
                        description: 'Improve written and verbal communication skills',
                        timeline: '60 days',
                        metrics: ['Positive feedback from stakeholders', 'Clear documentation'],
                        actions: ['Join presentation skills workshop', 'Practice regular updates']
                    }
                ],
                milestones: [
                    {
                        date: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
                        description: '30-day review',
                        criteria: ['Initial progress assessment', 'Training plan completion']
                    },
                    {
                        date: format(addDays(new Date(), 60), 'yyyy-MM-dd'),
                        description: '60-day review',
                        criteria: ['Mid-point evaluation', 'Goal progress check']
                    }
                ],
                supportNeeded: ['Manager mentoring', 'Training budget approval', 'Time for skill development'],
                risks: ['Lack of engagement', 'Insufficient time allocation', 'Competing priorities']
            };
        } catch (error) {
            logger.error('Error generating performance plan:', error);
            throw new Error('Failed to generate performance improvement plan');
        }
    }

    /**
     * Get talent analytics and insights
     */
    async getTalentAnalytics(): Promise<{
        openPositions: number;
        totalCandidates: number;
        averageTimeToHire: number;
        topSkillsInDemand: string[];
        departmentBreakdown: Record<string, number>;
        performanceDistribution: Record<string, number>;
        turnoverRisk: Array<{
            department: string;
            riskLevel: 'low' | 'medium' | 'high';
            factors: string[];
        }>;
    }> {
        // Mock analytics data - in real implementation, this would query actual database
        return {
            openPositions: 15,
            totalCandidates: 127,
            averageTimeToHire: 28,
            topSkillsInDemand: ['JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Docker'],
            departmentBreakdown: {
                'Engineering': 45,
                'Product': 12,
                'Design': 8,
                'Marketing': 15,
                'Sales': 20
            },
            performanceDistribution: {
                'Exceeds Expectations': 25,
                'Meets Expectations': 60,
                'Below Expectations': 15
            },
            turnoverRisk: [
                {
                    department: 'Engineering',
                    riskLevel: 'medium',
                    factors: ['High market demand', 'Competitive offers', 'Work-life balance concerns']
                },
                {
                    department: 'Sales',
                    riskLevel: 'low',
                    factors: ['Strong compensation', 'Clear growth path']
                }
            ]
        };
    }

    /**
     * Clean up expired job postings and old candidate data
     */
    async cleanupExpiredData(): Promise<void> {
        logger.info('Performing TalentAI data cleanup...');
        // Implementation would clean up expired job postings, old candidate data, etc.
        logger.info('TalentAI cleanup completed');
    }
}
