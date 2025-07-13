import { describe, it, expect } from 'vitest'
import type {
    Message,
    TranslationSettings,
    CallState,
    Language,
    TranslationResult,
    VoiceSettings,
    VideoCallParticipant,
    RealTimeTranslation,
    ConnectionState
} from './index'

describe('SunAI Types', () => {
    it('should define Message interface correctly', () => {
        const message: Message = {
            id: '1',
            content: 'Hello world',
            translation: 'Hola mundo',
            language: 'en',
            timestamp: new Date(),
            isUser: true,
        }

        expect(message).toHaveProperty('id')
        expect(message).toHaveProperty('content')
        expect(message).toHaveProperty('translation')
        expect(message).toHaveProperty('language')
        expect(message).toHaveProperty('timestamp')
        expect(message).toHaveProperty('isUser')
        expect(typeof message.id).toBe('string')
        expect(typeof message.content).toBe('string')
        expect(typeof message.translation).toBe('string')
        expect(typeof message.language).toBe('string')
        expect(message.timestamp).toBeInstanceOf(Date)
        expect(typeof message.isUser).toBe('boolean')
    })

    it('should define TranslationSettings interface correctly', () => {
        const settings: TranslationSettings = {
            sourceLanguage: 'en',
            targetLanguage: 'es',
            autoTranslate: true,
            showOriginal: false,
        }

        expect(settings).toHaveProperty('sourceLanguage')
        expect(settings).toHaveProperty('targetLanguage')
        expect(settings).toHaveProperty('autoTranslate')
        expect(settings).toHaveProperty('showOriginal')
        expect(typeof settings.sourceLanguage).toBe('string')
        expect(typeof settings.targetLanguage).toBe('string')
        expect(typeof settings.autoTranslate).toBe('boolean')
        expect(typeof settings.showOriginal).toBe('boolean')
    })

    it('should define CallState interface correctly', () => {
        const callState: CallState = {
            isInCall: true,
            isMuted: false,
            isVideoOn: true,
            isScreenSharing: false,
            participants: 3,
        }

        expect(callState).toHaveProperty('isInCall')
        expect(callState).toHaveProperty('isMuted')
        expect(callState).toHaveProperty('isVideoOn')
        expect(callState).toHaveProperty('isScreenSharing')
        expect(callState).toHaveProperty('participants')
        expect(typeof callState.isInCall).toBe('boolean')
        expect(typeof callState.isMuted).toBe('boolean')
        expect(typeof callState.isVideoOn).toBe('boolean')
        expect(typeof callState.isScreenSharing).toBe('boolean')
        expect(typeof callState.participants).toBe('number')
    })

    it('should define Language interface correctly', () => {
        const language: Language = {
            code: 'en',
            name: 'English',
            nativeName: 'English',
            flag: '🇺🇸',
        }

        expect(language).toHaveProperty('code')
        expect(language).toHaveProperty('name')
        expect(language).toHaveProperty('nativeName')
        expect(language).toHaveProperty('flag')
        expect(typeof language.code).toBe('string')
        expect(typeof language.name).toBe('string')
        expect(typeof language.nativeName).toBe('string')
        expect(typeof language.flag).toBe('string')
    })

    it('should define TranslationResult interface correctly', () => {
        const result: TranslationResult = {
            text: 'Translated text',
            confidence: 0.95,
            sourceLanguage: 'en',
            targetLanguage: 'es',
            processingTime: 250,
        }

        expect(result).toHaveProperty('text')
        expect(result).toHaveProperty('confidence')
        expect(result).toHaveProperty('sourceLanguage')
        expect(result).toHaveProperty('targetLanguage')
        expect(result).toHaveProperty('processingTime')
        expect(typeof result.text).toBe('string')
        expect(typeof result.confidence).toBe('number')
        expect(typeof result.sourceLanguage).toBe('string')
        expect(typeof result.targetLanguage).toBe('string')
        expect(typeof result.processingTime).toBe('number')
        expect(result.confidence).toBeGreaterThanOrEqual(0)
        expect(result.confidence).toBeLessThanOrEqual(1)
    })

    it('should define VoiceSettings interface correctly', () => {
        const voiceSettings: VoiceSettings = {
            isListening: true,
            language: 'en-US',
            continuous: true,
            interimResults: false,
        }

        expect(voiceSettings).toHaveProperty('isListening')
        expect(voiceSettings).toHaveProperty('language')
        expect(voiceSettings).toHaveProperty('continuous')
        expect(voiceSettings).toHaveProperty('interimResults')
        expect(typeof voiceSettings.isListening).toBe('boolean')
        expect(typeof voiceSettings.language).toBe('string')
        expect(typeof voiceSettings.continuous).toBe('boolean')
        expect(typeof voiceSettings.interimResults).toBe('boolean')
    })

    it('should define VideoCallParticipant interface correctly', () => {
        const participant: VideoCallParticipant = {
            id: 'participant-1',
            name: 'John Doe',
            isVideoOn: true,
            isMuted: false,
            language: 'en',
        }

        expect(participant).toHaveProperty('id')
        expect(participant).toHaveProperty('name')
        expect(participant).toHaveProperty('isVideoOn')
        expect(participant).toHaveProperty('isMuted')
        expect(participant).toHaveProperty('language')
        expect(typeof participant.id).toBe('string')
        expect(typeof participant.name).toBe('string')
        expect(typeof participant.isVideoOn).toBe('boolean')
        expect(typeof participant.isMuted).toBe('boolean')
        expect(typeof participant.language).toBe('string')
    })

    it('should define RealTimeTranslation interface correctly', () => {
        const translation: RealTimeTranslation = {
            originalText: 'Hello',
            translatedText: 'Hola',
            sourceLanguage: 'en',
            targetLanguage: 'es',
            timestamp: new Date(),
            confidence: 0.98,
            participantId: 'user-1',
        }

        expect(translation).toHaveProperty('originalText')
        expect(translation).toHaveProperty('translatedText')
        expect(translation).toHaveProperty('sourceLanguage')
        expect(translation).toHaveProperty('targetLanguage')
        expect(translation).toHaveProperty('timestamp')
        expect(translation).toHaveProperty('confidence')
        expect(translation).toHaveProperty('participantId')
        expect(typeof translation.originalText).toBe('string')
        expect(typeof translation.translatedText).toBe('string')
        expect(typeof translation.sourceLanguage).toBe('string')
        expect(typeof translation.targetLanguage).toBe('string')
        expect(translation.timestamp).toBeInstanceOf(Date)
        expect(typeof translation.confidence).toBe('number')
        expect(typeof translation.participantId).toBe('string')
    })

    it('should define ConnectionState interface correctly', () => {
        const connectionState: ConnectionState = {
            isConnected: true,
            participantCount: 4,
            roomId: 'room-123',
            quality: 'excellent',
            latency: 25,
        }

        expect(connectionState).toHaveProperty('isConnected')
        expect(connectionState).toHaveProperty('participantCount')
        expect(connectionState).toHaveProperty('roomId')
        expect(connectionState).toHaveProperty('quality')
        expect(connectionState).toHaveProperty('latency')
        expect(typeof connectionState.isConnected).toBe('boolean')
        expect(typeof connectionState.participantCount).toBe('number')
        expect(typeof connectionState.roomId).toBe('string')
        expect(['excellent', 'good', 'fair', 'poor']).toContain(connectionState.quality)
        expect(typeof connectionState.latency).toBe('number')
    })
})
