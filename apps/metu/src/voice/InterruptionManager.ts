import type {
    VoiceInterruption
} from '@/types/voice'

import type { VoiceEngine } from './VoiceEngine'

/**
 * Revolutionary Interruption Manager
 * 
 * This is the core innovation that makes natural conversation possible:
 * - Detects when user wants to interrupt AI speech
 * - Analyzes interruption context and intent
 * - Gracefully handles conversation flow
 * - Preserves context across interruptions
 */
export class InterruptionManager {
    private interruptionHistory: VoiceInterruption[] = []
    private lastInterruption: number = 0

    constructor(_voiceEngine: VoiceEngine) {
        // VoiceEngine reference available but not actively used yet
        // Reserved for advanced interruption features
    }

    /**
     * Handle user interruption - the heart of natural conversation
     */
    async handleInterruption(userInput: string): Promise<VoiceInterruption> {
        const timestamp = Date.now()

        console.log('⚡ Processing interruption:', userInput)

        // Analyze the interruption
        const interruptionType = this.analyzeInterruptionType(userInput)
        // const context = this.getCurrentContext() // TODO: Use context for enhanced interruption analysis

        // Create interruption record
        const interruption: VoiceInterruption = {
            timestamp,
            userInput,
            aiResponse: '', // Will be filled by AI response
            contextPreserved: true,
            interruptionType
        }

        // Handle based on interruption type
        switch (interruptionType) {
            case 'polite':
                await this.handlePoliteInterruption(interruption)
                break

            case 'urgent':
                await this.handleUrgentInterruption(interruption)
                break

            case 'correction':
                await this.handleCorrectionInterruption(interruption)
                break

            case 'question':
                await this.handleQuestionInterruption(interruption)
                break
        }

        // Store interruption for learning
        this.storeInterruption(interruption)

        return interruption
    }

    /**
     * Analyze the type of interruption based on user input
     */
    private analyzeInterruptionType(input: string): VoiceInterruption['interruptionType'] {
        const lowerInput = input.toLowerCase().trim()

        // Urgent interruptions
        if (this.containsUrgentKeywords(lowerInput)) {
            return 'urgent'
        }

        // Polite interruptions
        if (this.containsPoliteKeywords(lowerInput)) {
            return 'polite'
        }

        // Corrections
        if (this.containsCorrectionKeywords(lowerInput)) {
            return 'correction'
        }

        // Questions
        if (this.isQuestion(lowerInput)) {
            return 'question'
        }

        // Default to polite
        return 'polite'
    }

    /**
     * Check for urgent interruption keywords
     */
    private containsUrgentKeywords(input: string): boolean {
        const urgentKeywords = [
            'stop', 'wait', 'hold on', 'pause',
            'emergency', 'urgent', 'important',
            'no', 'wrong', 'mistake'
        ]

        return urgentKeywords.some(keyword => input.includes(keyword))
    }

    /**
     * Check for polite interruption keywords
     */
    private containsPoliteKeywords(input: string): boolean {
        const politeKeywords = [
            'excuse me', 'sorry', 'pardon',
            'actually', 'let me', 'can i',
            'may i', 'if i may'
        ]

        return politeKeywords.some(keyword => input.includes(keyword))
    }

    /**
     * Check for correction keywords
     */
    private containsCorrectionKeywords(input: string): boolean {
        const correctionKeywords = [
            'no that\'s not', 'actually', 'correction',
            'i meant', 'not that', 'wrong',
            'that\'s incorrect', 'mistake'
        ]

        return correctionKeywords.some(keyword => input.includes(keyword))
    }

    /**
     * Check if input is a question
     */
    private isQuestion(input: string): boolean {
        return input.includes('?') ||
            input.startsWith('what') ||
            input.startsWith('how') ||
            input.startsWith('why') ||
            input.startsWith('when') ||
            input.startsWith('where') ||
            input.startsWith('who') ||
            input.startsWith('can') ||
            input.startsWith('could') ||
            input.startsWith('would') ||
            input.startsWith('should') ||
            input.startsWith('is') ||
            input.startsWith('are') ||
            input.startsWith('do') ||
            input.startsWith('does')
    }

    /**
     * Handle polite interruption
     */
    private async handlePoliteInterruption(interruption: VoiceInterruption): Promise<void> {
        console.log('🙏 Handling polite interruption')

        // Acknowledge the interruption politely
        const responses = [
            'Yes, go ahead.',
            'Of course, what did you want to say?',
            'Sorry, please continue.',
            'I\'m listening.',
            'Yes?'
        ]

        const response = this.selectRandomResponse(responses)
        interruption.aiResponse = response

        // Brief pause before responding
        await this.delay(200)
    }

    /**
     * Handle urgent interruption
     */
    private async handleUrgentInterruption(interruption: VoiceInterruption): Promise<void> {
        console.log('🚨 Handling urgent interruption')

        // Immediate acknowledgment
        const responses = [
            'Yes, what is it?',
            'I\'m stopping. What\'s wrong?',
            'Okay, I\'m listening.',
            'What\'s the matter?',
            'I\'ve stopped. Go ahead.'
        ]

        const response = this.selectRandomResponse(responses)
        interruption.aiResponse = response

        // No delay for urgent interruptions
    }

    /**
     * Handle correction interruption
     */
    private async handleCorrectionInterruption(interruption: VoiceInterruption): Promise<void> {
        console.log('✏️ Handling correction interruption')

        const responses = [
            'Oh, I see. Please correct me.',
            'You\'re right, what should it be?',
            'I apologize. What\'s the correct information?',
            'Thank you for the correction. Please go ahead.',
            'I understand. What did you mean to say?'
        ]

        const response = this.selectRandomResponse(responses)
        interruption.aiResponse = response

        await this.delay(150)
    }

    /**
     * Handle question interruption
     */
    private async handleQuestionInterruption(interruption: VoiceInterruption): Promise<void> {
        console.log('❓ Handling question interruption')

        const responses = [
            'What\'s your question?',
            'Yes, what would you like to know?',
            'I\'m here to help. What\'s your question?',
            'Go ahead with your question.',
            'What did you want to ask?'
        ]

        const response = this.selectRandomResponse(responses)
        interruption.aiResponse = response

        await this.delay(100)
    }

    /**
     * Select a random response to avoid repetition
     */
    private selectRandomResponse(responses: string[]): string {
        const randomIndex = Math.floor(Math.random() * responses.length)
        return responses[randomIndex] || responses[0] || 'I understand'
    }

    /**
     * Store interruption for learning and analytics
     */
    private storeInterruption(interruption: VoiceInterruption): void {
        this.interruptionHistory.push(interruption)

        // Keep only last 50 interruptions
        if (this.interruptionHistory.length > 50) {
            this.interruptionHistory.shift()
        }

        this.lastInterruption = interruption.timestamp

        // Log for analytics
        console.log(`📊 Interruption stored: ${interruption.interruptionType}`)
    }

    /**
     * Get interruption statistics
     */
    getInterruptionStats() {
        const totalInterruptions = this.interruptionHistory.length

        if (totalInterruptions === 0) {
            return {
                total: 0,
                byType: {},
                averageGap: 0,
                lastInterruption: 0
            }
        }

        // Count by type
        const byType = this.interruptionHistory.reduce((acc, interruption) => {
            acc[interruption.interruptionType] = (acc[interruption.interruptionType] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        // Calculate average gap between interruptions
        let totalGap = 0
        for (let i = 1; i < this.interruptionHistory.length; i++) {
            const gap = this.interruptionHistory[i]!.timestamp - this.interruptionHistory[i - 1]!.timestamp
            totalGap += gap
        }
        const averageGap = totalInterruptions > 1 ? totalGap / (totalInterruptions - 1) : 0

        return {
            total: totalInterruptions,
            byType,
            averageGap,
            lastInterruption: this.lastInterruption
        }
    }

    /**
     * Check if user is interrupting frequently (might indicate confusion)
     */
    isInterruptingFrequently(): boolean {
        const recentInterruptions = this.interruptionHistory.filter(
            interruption => Date.now() - interruption.timestamp < 60000 // Last minute
        )

        return recentInterruptions.length > 3
    }

    /**
     * Get personalized interruption handling strategy
     */
    getPersonalizedStrategy(): string {
        const stats = this.getInterruptionStats()

        if (stats.total === 0) {
            return 'default'
        }

        // If user interrupts frequently with questions, they might need more explanation
        if (stats.byType.question && stats.byType.question > stats.total * 0.6) {
            return 'explanatory'
        }

        // If user makes many corrections, they might prefer more accuracy
        if (stats.byType.correction && stats.byType.correction > stats.total * 0.4) {
            return 'careful'
        }

        // If user is generally polite, use polite responses
        if (stats.byType.polite && stats.byType.polite > stats.total * 0.5) {
            return 'polite'
        }

        return 'adaptive'
    }

    /**
     * Simple delay utility
     */
    private async delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    /**
     * Reset interruption history (useful for new conversations)
     */
    reset(): void {
        this.interruptionHistory = []
        this.lastInterruption = 0
        console.log('🔄 Interruption manager reset')
    }

    /**
     * Update current context (called by conversation manager)
     */
    updateContext(_context: string): void {
        // Context management will be implemented when needed
        // For now, we acknowledge the context update request
    }
}
