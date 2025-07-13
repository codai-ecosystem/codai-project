import type {
    Message,
    TranslationResult,
    Language,
    TranslationSettings,
    RealTimeTranslation,
    ConnectionState
} from '../types'

export class SunAITranslationService {
    private apiKey: string
    private baseUrl: string
    private supportedLanguages: Language[]

    constructor(apiKey: string = 'demo', baseUrl: string = '/api') {
        this.apiKey = apiKey
        this.baseUrl = baseUrl
        this.supportedLanguages = this.initializeSupportedLanguages()
    }

    private initializeSupportedLanguages(): Language[] {
        return [
            { code: 'auto', name: 'Auto Detect' },
            { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
            { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
            { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
            { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
            { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
            { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
            { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
            { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
            { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
            { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
            { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
            { code: 'ro', name: 'Romanian', nativeName: 'Română', flag: '🇷🇴' },
            { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
            { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
            { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰' },
            { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴' },
            { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮' },
            { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
            { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿' },
        ]
    }

    getSupportedLanguages(): Language[] {
        return this.supportedLanguages
    }

    getLanguageByCode(code: string): Language | undefined {
        return this.supportedLanguages.find(lang => lang.code === code)
    }

    async translateText(
        text: string,
        fromLang: string,
        toLang: string
    ): Promise<TranslationResult> {
        const startTime = Date.now()

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200))

            // Mock translation logic
            const translatedText = this.mockTranslate(text, fromLang, toLang)
            const processingTime = Date.now() - startTime

            return {
                text: translatedText,
                confidence: Math.random() * 0.2 + 0.8, // 0.8-1.0 confidence
                sourceLanguage: fromLang,
                targetLanguage: toLang,
                processingTime
            }
        } catch (error) {
            throw new Error(`Translation failed: ${error}`)
        }
    }

    private mockTranslate(text: string, fromLang: string, toLang: string): string {
        // Mock translation database
        const translations: Record<string, Record<string, string>> = {
            'Hello': {
                'es': 'Hola',
                'fr': 'Bonjour',
                'de': 'Hallo',
                'it': 'Ciao',
                'pt': 'Olá',
                'ru': 'Привет',
                'ja': 'こんにちは',
                'ko': '안녕하세요',
                'zh': '你好',
                'ar': 'مرحبا',
                'ro': 'Salut'
            },
            'How are you?': {
                'es': '¿Cómo estás?',
                'fr': 'Comment allez-vous?',
                'de': 'Wie geht es dir?',
                'it': 'Come stai?',
                'pt': 'Como você está?',
                'ru': 'Как дела?',
                'ja': '元気ですか？',
                'ko': '어떻게 지내세요?',
                'zh': '你好吗？',
                'ar': 'كيف حالك؟',
                'ro': 'Ce mai faci?'
            },
            'Thank you': {
                'es': 'Gracias',
                'fr': 'Merci',
                'de': 'Danke',
                'it': 'Grazie',
                'pt': 'Obrigado',
                'ru': 'Спасибо',
                'ja': 'ありがとう',
                'ko': '감사합니다',
                'zh': '谢谢',
                'ar': 'شكرا',
                'ro': 'Mulțumesc'
            }
        }

        // Check for exact matches
        const exactMatch = translations[text]?.[toLang]
        if (exactMatch) {
            return exactMatch
        }

        // Simulate AI translation for unknown phrases
        const targetLang = this.getLanguageByCode(toLang)
        return `[AI Translated to ${targetLang?.name || toLang}]: ${text}`
    }

    async translateRealTime(
        text: string,
        settings: TranslationSettings,
        participantId: string
    ): Promise<RealTimeTranslation> {
        const translationResult = await this.translateText(
            text,
            settings.sourceLanguage,
            settings.targetLanguage
        )

        return {
            originalText: text,
            translatedText: translationResult.text,
            sourceLanguage: settings.sourceLanguage,
            targetLanguage: settings.targetLanguage,
            timestamp: new Date(),
            confidence: translationResult.confidence,
            participantId
        }
    }

    detectLanguage(text: string): Promise<string> {
        // Simple language detection mock
        return new Promise(resolve => {
            setTimeout(() => {
                // Mock language detection based on common patterns
                if (/^[a-zA-Z\s.,!?]+$/.test(text)) {
                    if (text.includes('que') || text.includes('está')) resolve('es')
                    else if (text.includes('vous') || text.includes('comment')) resolve('fr')
                    else if (text.includes('wie') || text.includes('ist')) resolve('de')
                    else resolve('en')
                } else if (/[\u4e00-\u9fff]/.test(text)) {
                    resolve('zh')
                } else if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) {
                    resolve('ja')
                } else if (/[\u0600-\u06ff]/.test(text)) {
                    resolve('ar')
                } else {
                    resolve('en')
                }
            }, 100)
        })
    }

    formatMessage(content: string, isUser: boolean, language: string): Message {
        return {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            content,
            language,
            timestamp: new Date(),
            isUser
        }
    }

    validateTranslationSettings(settings: TranslationSettings): {
        isValid: boolean
        issues: string[]
        suggestions: string[]
    } {
        const issues: string[] = []
        const suggestions: string[] = []

        if (!settings.sourceLanguage) {
            issues.push('Source language not specified')
            suggestions.push('Select a source language or use auto-detect')
        }

        if (!settings.targetLanguage) {
            issues.push('Target language not specified')
            suggestions.push('Select a target language for translation')
        }

        if (settings.sourceLanguage === settings.targetLanguage && settings.sourceLanguage !== 'auto') {
            issues.push('Source and target languages are the same')
            suggestions.push('Choose different source and target languages')
        }

        const sourceValid = this.supportedLanguages.some(lang => lang.code === settings.sourceLanguage)
        if (!sourceValid && settings.sourceLanguage !== 'auto') {
            issues.push('Unsupported source language')
            suggestions.push('Choose from supported languages list')
        }

        const targetValid = this.supportedLanguages.some(lang => lang.code === settings.targetLanguage)
        if (!targetValid) {
            issues.push('Unsupported target language')
            suggestions.push('Choose from supported languages list')
        }

        return {
            isValid: issues.length === 0,
            issues,
            suggestions
        }
    }

    getTranslationQuality(confidence: number): 'excellent' | 'good' | 'fair' | 'poor' {
        if (confidence >= 0.9) return 'excellent'
        if (confidence >= 0.8) return 'good'
        if (confidence >= 0.7) return 'fair'
        return 'poor'
    }

    estimateTranslationTime(textLength: number): number {
        // Estimate translation time based on text length
        const baseTime = 200 // Base processing time in ms
        const timePerChar = 2 // Additional time per character
        return baseTime + (textLength * timePerChar)
    }

    createConnectionState(participantCount: number, roomId: string): ConnectionState {
        return {
            isConnected: true,
            participantCount,
            roomId,
            quality: participantCount <= 2 ? 'excellent' : participantCount <= 4 ? 'good' : 'fair',
            latency: Math.floor(Math.random() * 50) + 10 // 10-60ms
        }
    }
}
