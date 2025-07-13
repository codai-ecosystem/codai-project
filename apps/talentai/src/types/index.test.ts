import { describe, it, expect } from 'vitest'
import type { Message, Candidate, JobPost, Interview, AIResponse } from './index'

describe('TalentAI Types', () => {
    it('should define Message interface correctly', () => {
        const message: Message = {
            id: '1',
            content: 'Test message',
            isBot: false,
            timestamp: new Date(),
        }

        expect(message).toHaveProperty('id')
        expect(message).toHaveProperty('content')
        expect(message).toHaveProperty('isBot')
        expect(message).toHaveProperty('timestamp')
        expect(typeof message.id).toBe('string')
        expect(typeof message.content).toBe('string')
        expect(typeof message.isBot).toBe('boolean')
        expect(message.timestamp).toBeInstanceOf(Date)
    })

    it('should define Candidate interface correctly', () => {
        const candidate: Candidate = {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            skills: ['JavaScript', 'TypeScript', 'React'],
            experience: 5,
            rating: 4.5,
            status: 'available',
            resumeUrl: 'https://example.com/resume.pdf',
            portfolio: 'https://johndoe.dev',
        }

        expect(candidate).toHaveProperty('id')
        expect(candidate).toHaveProperty('name')
        expect(candidate).toHaveProperty('email')
        expect(candidate).toHaveProperty('skills')
        expect(candidate).toHaveProperty('experience')
        expect(candidate).toHaveProperty('rating')
        expect(candidate).toHaveProperty('status')
        expect(Array.isArray(candidate.skills)).toBe(true)
        expect(['available', 'interviewing', 'hired']).toContain(candidate.status)
    })

    it('should define JobPost interface correctly', () => {
        const jobPost: JobPost = {
            id: '1',
            title: 'Senior Prompt Engineer',
            description: 'We are looking for a senior prompt engineer...',
            requirements: ['5+ years experience', 'TypeScript', 'AI/ML knowledge'],
            salaryRange: {
                min: 80000,
                max: 120000,
                currency: 'USD',
            },
            location: 'San Francisco, CA',
            remote: true,
            type: 'full-time',
            status: 'published',
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        expect(jobPost).toHaveProperty('id')
        expect(jobPost).toHaveProperty('title')
        expect(jobPost).toHaveProperty('description')
        expect(jobPost).toHaveProperty('requirements')
        expect(jobPost).toHaveProperty('salaryRange')
        expect(jobPost).toHaveProperty('location')
        expect(jobPost).toHaveProperty('remote')
        expect(jobPost).toHaveProperty('type')
        expect(jobPost).toHaveProperty('status')
        expect(Array.isArray(jobPost.requirements)).toBe(true)
        expect(typeof jobPost.salaryRange).toBe('object')
        expect(['full-time', 'part-time', 'contract']).toContain(jobPost.type)
        expect(['draft', 'published', 'closed']).toContain(jobPost.status)
    })

    it('should define Interview interface correctly', () => {
        const interview: Interview = {
            id: '1',
            candidateId: 'candidate-1',
            jobPostId: 'job-1',
            scheduledAt: new Date(),
            duration: 60,
            type: 'video',
            status: 'scheduled',
            feedback: 'Great candidate with strong technical skills',
            score: 8.5,
        }

        expect(interview).toHaveProperty('id')
        expect(interview).toHaveProperty('candidateId')
        expect(interview).toHaveProperty('jobPostId')
        expect(interview).toHaveProperty('scheduledAt')
        expect(interview).toHaveProperty('duration')
        expect(interview).toHaveProperty('type')
        expect(interview).toHaveProperty('status')
        expect(['phone', 'video', 'in-person']).toContain(interview.type)
        expect(['scheduled', 'completed', 'cancelled']).toContain(interview.status)
    })

    it('should define AIResponse interface correctly', () => {
        const aiResponse: AIResponse = {
            message: 'Based on your requirements, I recommend...',
            suggestions: ['Review portfolio', 'Schedule technical interview'],
            confidence: 0.85,
            context: {
                role: 'Prompt Engineer',
                company: 'TechCorp',
                requirements: ['TypeScript', 'AI/ML', '5+ years'],
            },
        }

        expect(aiResponse).toHaveProperty('message')
        expect(aiResponse).toHaveProperty('suggestions')
        expect(aiResponse).toHaveProperty('confidence')
        expect(aiResponse).toHaveProperty('context')
        expect(typeof aiResponse.message).toBe('string')
        expect(Array.isArray(aiResponse.suggestions)).toBe(true)
        expect(typeof aiResponse.confidence).toBe('number')
        expect(aiResponse.confidence).toBeGreaterThanOrEqual(0)
        expect(aiResponse.confidence).toBeLessThanOrEqual(1)
    })
})
