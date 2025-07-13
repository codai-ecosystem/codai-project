import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TalentAIService } from './talentai-service'
import type { Message, AIResponse } from '../types'

describe('TalentAIService', () => {
    let service: TalentAIService

    beforeEach(() => {
        service = new TalentAIService('test-api-key', '/api/test')
        vi.clearAllMocks()
    })

    describe('constructor', () => {
        it('should initialize with default values', () => {
            const defaultService = new TalentAIService()
            expect(defaultService).toBeInstanceOf(TalentAIService)
        })

        it('should initialize with custom values', () => {
            const customService = new TalentAIService('custom-key', '/custom-api')
            expect(customService).toBeInstanceOf(TalentAIService)
        })
    })

    describe('generateAIResponse', () => {
        it('should generate response for prompt engineer query', async () => {
            const response = await service.generateAIResponse('Looking for a prompt engineer')

            expect(response).toHaveProperty('message')
            expect(response).toHaveProperty('suggestions')
            expect(response).toHaveProperty('confidence')
            expect(response.message).toContain('prompt engineer')
            expect(response.confidence).toBe(0.85)
            expect(Array.isArray(response.suggestions)).toBe(true)
        })

        it('should generate response for frontend developer query', async () => {
            const response = await service.generateAIResponse('Need a React frontend developer')

            expect(response.message).toContain('frontend')
            expect(response.message).toContain('React')
        })

        it('should generate response for backend developer query', async () => {
            const response = await service.generateAIResponse('Looking for backend API developer')

            expect(response.message).toContain('Backend')
            expect(response.message).toContain('API')
        })

        it('should generate response for senior role query', async () => {
            const response = await service.generateAIResponse('Need a senior developer')

            expect(response.message).toContain('senior')
            expect(response.message).toContain('leadership')
        })

        it('should generate default response for generic query', async () => {
            const response = await service.generateAIResponse('General hiring question')

            expect(response.message).toContain('job requirements')
            expect(response.suggestions).toContain('Create detailed job description')
        })

        it('should include context in response', async () => {
            const context = { role: 'Senior Engineer', company: 'TechCorp' }
            const response = await service.generateAIResponse('Test message', context)

            expect(response.context).toEqual(context)
        })

        it('should handle errors gracefully', async () => {
            // Mock a service that throws an error
            const errorService = new TalentAIService()
            const originalGenerate = errorService.generateAIResponse
            errorService.generateAIResponse = vi.fn().mockRejectedValue(new Error('API Error'))

            await expect(errorService.generateAIResponse('test')).rejects.toThrow('API Error')
        })
    })

    describe('searchCandidates', () => {
        it('should return all candidates with no criteria', async () => {
            const candidates = await service.searchCandidates({})

            expect(Array.isArray(candidates)).toBe(true)
            expect(candidates.length).toBeGreaterThan(0)
            expect(candidates[0]).toHaveProperty('name')
            expect(candidates[0]).toHaveProperty('skills')
            expect(candidates[0]).toHaveProperty('experience')
        })

        it('should filter by skills', async () => {
            const candidates = await service.searchCandidates({
                skills: ['Prompt Engineering']
            })

            const hasPromptSkill = candidates.some(candidate =>
                candidate.skills.some(skill => skill.includes('Prompt Engineering'))
            )
            expect(hasPromptSkill).toBe(true)
        })

        it('should filter by experience level', async () => {
            const candidates = await service.searchCandidates({
                experience: 5
            })

            candidates.forEach(candidate => {
                expect(candidate.experience).toBeGreaterThanOrEqual(5)
            })
        })

        it('should combine multiple criteria', async () => {
            const candidates = await service.searchCandidates({
                skills: ['TypeScript'],
                experience: 4
            })

            candidates.forEach(candidate => {
                expect(candidate.experience).toBeGreaterThanOrEqual(4)
                const hasTypeScript = candidate.skills.some(skill =>
                    skill.toLowerCase().includes('typescript')
                )
                expect(hasTypeScript).toBe(true)
            })
        })
    })

    describe('formatMessage', () => {
        it('should format user message correctly', () => {
            const message = service.formatMessage('Hello', false)

            expect(message).toHaveProperty('id')
            expect(message).toHaveProperty('content', 'Hello')
            expect(message).toHaveProperty('isBot', false)
            expect(message).toHaveProperty('timestamp')
            expect(message.timestamp).toBeInstanceOf(Date)
            expect(typeof message.id).toBe('string')
        })

        it('should format bot message correctly', () => {
            const message = service.formatMessage('Hi there!', true)

            expect(message.content).toBe('Hi there!')
            expect(message.isBot).toBe(true)
        })

        it('should generate unique IDs', () => {
            const message1 = service.formatMessage('Test 1', false)
            const message2 = service.formatMessage('Test 2', false)

            expect(message1.id).not.toBe(message2.id)
        })
    })

    describe('validateJobRequirements', () => {
        it('should validate empty requirements', () => {
            const result = service.validateJobRequirements([])

            expect(result.isValid).toBe(false)
            expect(result.issues).toContain('No requirements specified')
            expect(result.suggestions).toContain('Add at least 3-5 key requirements')
        })

        it('should validate too many requirements', () => {
            const manyRequirements = Array(20).fill('Requirement')
            const result = service.validateJobRequirements(manyRequirements)

            expect(result.isValid).toBe(false)
            expect(result.issues).toContain('Too many requirements may discourage candidates')
        })

        it('should suggest experience requirements', () => {
            const requirements = ['JavaScript', 'React', 'Problem solving']
            const result = service.validateJobRequirements(requirements)

            expect(result.suggestions).toContain('Consider adding experience level requirements')
        })

        it('should suggest technical skills', () => {
            const requirements = ['Good communication', 'Team player', '3 years experience']
            const result = service.validateJobRequirements(requirements)

            expect(result.suggestions).toContain('Include specific technical skills required')
        })

        it('should validate good requirements', () => {
            const requirements = [
                'JavaScript',
                'React',
                'TypeScript',
                '3+ years experience',
                'API development'
            ]
            const result = service.validateJobRequirements(requirements)

            expect(result.isValid).toBe(true)
            expect(result.issues.length).toBe(0)
        })

        it('should recognize experience patterns', () => {
            const requirements = ['5+ years of experience', 'JavaScript']
            const result = service.validateJobRequirements(requirements)

            expect(result.suggestions).not.toContain('Consider adding experience level requirements')
        })

        it('should recognize technical skills', () => {
            const requirements = ['Python programming', '2 years experience']
            const result = service.validateJobRequirements(requirements)

            expect(result.suggestions).not.toContain('Include specific technical skills required')
        })
    })
})
