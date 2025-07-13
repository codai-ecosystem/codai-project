import type { Message, Candidate, AIResponse } from '../types'

export class TalentAIService {
    private apiKey: string
    private baseUrl: string

    constructor(apiKey: string = 'demo', baseUrl: string = '/api') {
        this.apiKey = apiKey
        this.baseUrl = baseUrl
    }

    async generateAIResponse(message: string, context?: any): Promise<AIResponse> {
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000))

            const response: AIResponse = {
                message: this.generateContextualResponse(message, context),
                suggestions: this.generateSuggestions(message),
                confidence: 0.85,
                context: context || {}
            }

            return response
        } catch (error) {
            throw new Error('Failed to generate AI response')
        }
    }

    private generateContextualResponse(message: string, context?: any): string {
        const lowerMessage = message.toLowerCase()

        if (lowerMessage.includes('prompt engineer')) {
            return 'I understand you\'re looking for prompt engineers. These professionals are crucial for AI development. Would you like me to help you create a comprehensive job description with specific requirements for prompt engineering skills?'
        }

        if (lowerMessage.includes('frontend') || lowerMessage.includes('react')) {
            return 'For frontend development roles, especially React positions, I recommend focusing on component architecture, state management, and modern development practices. Shall I suggest some technical interview questions?'
        }

        if (lowerMessage.includes('backend') || lowerMessage.includes('api')) {
            return 'Backend development roles require strong system design skills. I can help you evaluate candidates based on their API development experience, database knowledge, and scalability understanding.'
        }

        if (lowerMessage.includes('senior') || lowerMessage.includes('lead')) {
            return 'For senior and leadership positions, we should assess both technical depth and mentoring capabilities. Would you like me to create a comprehensive evaluation framework?'
        }

        return 'I can help you refine your job requirements and create an effective screening process. What specific skills or experience level are you targeting for this role?'
    }

    private generateSuggestions(message: string): string[] {
        const suggestions = [
            'Create detailed job description',
            'Define technical requirements',
            'Set up screening questions',
            'Schedule initial interviews'
        ]

        const lowerMessage = message.toLowerCase()

        if (lowerMessage.includes('prompt engineer')) {
            return [
                'Review AI/ML portfolios',
                'Test prompt optimization skills',
                'Assess LLM understanding',
                'Evaluate creative problem-solving'
            ]
        }

        if (lowerMessage.includes('senior')) {
            return [
                'Review system design experience',
                'Assess leadership capabilities',
                'Check mentoring background',
                'Evaluate architecture decisions'
            ]
        }

        return suggestions
    }

    async searchCandidates(criteria: {
        skills?: string[]
        experience?: number
        location?: string
        availability?: string
    }): Promise<Candidate[]> {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500))

        const mockCandidates: Candidate[] = [
            {
                id: '1',
                name: 'Alice Johnson',
                email: 'alice@example.com',
                skills: ['JavaScript', 'TypeScript', 'React', 'Prompt Engineering'],
                experience: 6,
                rating: 4.8,
                status: 'available',
                portfolio: 'https://alicejohnson.dev'
            },
            {
                id: '2',
                name: 'Bob Chen',
                email: 'bob@example.com',
                skills: ['Python', 'AI/ML', 'Prompt Engineering', 'LangChain'],
                experience: 4,
                rating: 4.6,
                status: 'available',
                resumeUrl: 'https://example.com/bob-resume.pdf'
            },
            {
                id: '3',
                name: 'Carol Davis',
                email: 'carol@example.com',
                skills: ['TypeScript', 'Node.js', 'React', 'System Design'],
                experience: 8,
                rating: 4.9,
                status: 'interviewing',
                portfolio: 'https://caroldavis.com'
            }
        ]

        // Filter candidates based on criteria
        let filteredCandidates = mockCandidates

        if (criteria.skills && criteria.skills.length > 0) {
            filteredCandidates = filteredCandidates.filter(candidate =>
                criteria.skills!.some(skill =>
                    candidate.skills.some(candidateSkill =>
                        candidateSkill.toLowerCase().includes(skill.toLowerCase())
                    )
                )
            )
        }

        if (criteria.experience) {
            filteredCandidates = filteredCandidates.filter(
                candidate => candidate.experience >= criteria.experience!
            )
        }

        return filteredCandidates
    }

    formatMessage(content: string, isBot: boolean): Message {
        return {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            content,
            isBot,
            timestamp: new Date()
        }
    }

    validateJobRequirements(requirements: string[]): {
        isValid: boolean
        issues: string[]
        suggestions: string[]
    } {
        const issues: string[] = []
        const suggestions: string[] = []

        if (requirements.length === 0) {
            issues.push('No requirements specified')
            suggestions.push('Add at least 3-5 key requirements')
        }

        if (requirements.length > 15) {
            issues.push('Too many requirements may discourage candidates')
            suggestions.push('Focus on 5-10 essential requirements')
        }

        const hasExperience = requirements.some(req =>
            req.toLowerCase().includes('year') || req.toLowerCase().includes('experience')
        )

        if (!hasExperience) {
            suggestions.push('Consider adding experience level requirements')
        }

        const hasTechnicalSkills = requirements.some(req =>
            ['javascript', 'python', 'react', 'typescript', 'api', 'database']
                .some(tech => req.toLowerCase().includes(tech))
        )

        if (!hasTechnicalSkills) {
            suggestions.push('Include specific technical skills required')
        }

        return {
            isValid: issues.length === 0,
            issues,
            suggestions
        }
    }
}
