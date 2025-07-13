import type { Message, TranslationSettings, RealTimeTranslation } from '../types'
import type { SpeechRecognition, SpeechRecognitionEvent, SpeechRecognitionErrorEvent } from '../types/speech'

export class SunAISpeechService {
    private recognition: SpeechRecognition | null = null
    private synthesis: SpeechSynthesis | null = null
    private isListening = false
    private isSupported = false

    constructor() {
        this.initializeSpeechAPIs()
    }

    private initializeSpeechAPIs() {
        // Check for Speech Recognition support
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
            this.recognition = new SpeechRecognition()
            this.setupSpeechRecognition()
        }

        // Check for Speech Synthesis support
        if ('speechSynthesis' in window) {
            this.synthesis = window.speechSynthesis
        }

        this.isSupported = !!(this.recognition && this.synthesis)
    }

    private setupSpeechRecognition() {
        if (!this.recognition) return

        this.recognition.continuous = true
        this.recognition.interimResults = true
        this.recognition.maxAlternatives = 1

        this.recognition.onstart = () => {
            this.isListening = true
            console.log('Speech recognition started')
        }

        this.recognition.onend = () => {
            this.isListening = false
            console.log('Speech recognition ended')
        }

        this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('Speech recognition error:', event.error)
            this.isListening = false
        }
    }

    async startListening(
        language: string = 'en-US',
        onResult: (text: string, isFinal: boolean) => void,
        onError?: (error: string) => void
    ): Promise<void> {
        if (!this.recognition) {
            throw new Error('Speech recognition not supported')
        }

        if (this.isListening) {
            this.stopListening()
        }

        this.recognition.lang = this.getLanguageCode(language)

        this.recognition.onresult = (event: SpeechRecognitionEvent) => {
            const results = event.results
            const lastResult = results[results.length - 1]
            const transcript = lastResult[0].transcript
            const isFinal = lastResult.isFinal

            onResult(transcript, isFinal)
        }

        this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            if (onError) {
                onError(event.error)
            }
        }

        try {
            this.recognition.start()
        } catch (error) {
            throw new Error(`Failed to start speech recognition: ${error}`)
        }
    }

    stopListening(): void {
        if (this.recognition && this.isListening) {
            this.recognition.stop()
        }
    }

    async speakText(
        text: string,
        language: string = 'en-US',
        options: {
            rate?: number
            pitch?: number
            volume?: number
            voice?: string
        } = {}
    ): Promise<void> {
        if (!this.synthesis) {
            throw new Error('Speech synthesis not supported')
        }

        return new Promise((resolve, reject) => {
            const utterance = new SpeechSynthesisUtterance(text)

            utterance.lang = this.getLanguageCode(language)
            utterance.rate = options.rate || 1
            utterance.pitch = options.pitch || 1
            utterance.volume = options.volume || 1

            // Set voice if specified
            if (options.voice) {
                const voices = this.synthesis!.getVoices()
                const selectedVoice = voices.find(voice =>
                    voice.name === options.voice || voice.lang === language
                )
                if (selectedVoice) {
                    utterance.voice = selectedVoice
                }
            }

            utterance.onend = () => resolve()
            utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`))

            this.synthesis!.speak(utterance)
        })
    }

    getAvailableVoices(): SpeechSynthesisVoice[] {
        if (!this.synthesis) return []
        return this.synthesis.getVoices()
    }

    getVoicesForLanguage(language: string): SpeechSynthesisVoice[] {
        const langCode = this.getLanguageCode(language)
        return this.getAvailableVoices().filter(voice =>
            voice.lang.startsWith(langCode.split('-')[0])
        )
    }

    private getLanguageCode(language: string): string {
        // Map common language codes to speech API codes
        const languageMap: Record<string, string> = {
            'en': 'en-US',
            'es': 'es-ES',
            'fr': 'fr-FR',
            'de': 'de-DE',
            'it': 'it-IT',
            'pt': 'pt-PT',
            'ru': 'ru-RU',
            'ja': 'ja-JP',
            'ko': 'ko-KR',
            'zh': 'zh-CN',
            'ar': 'ar-SA',
            'ro': 'ro-RO',
            'nl': 'nl-NL',
            'sv': 'sv-SE',
            'da': 'da-DK',
            'no': 'nb-NO',
            'fi': 'fi-FI',
            'pl': 'pl-PL',
            'cs': 'cs-CZ'
        }

        return languageMap[language] || language
    }

    async transcribeAudio(
        audioBlob: Blob,
        language: string = 'en'
    ): Promise<string> {
        // This would typically use a more sophisticated speech-to-text service
        // For now, we'll simulate the transcription
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve('[Transcribed audio content]')
            }, 1000)
        })
    }

    async translateAndSpeak(
        text: string,
        fromLang: string,
        toLang: string,
        translationService: any
    ): Promise<RealTimeTranslation> {
        try {
            // Get translation
            const translationResult = await translationService.translateText(text, fromLang, toLang)

            // Speak the translated text
            await this.speakText(translationResult.text, toLang)

            return {
                originalText: text,
                translatedText: translationResult.text,
                sourceLanguage: fromLang,
                targetLanguage: toLang,
                timestamp: new Date(),
                confidence: translationResult.confidence,
                participantId: 'local'
            }
        } catch (error) {
            throw new Error(`Translation and speech failed: ${error}`)
        }
    }

    createVoiceMessage(text: string, language: string, isUser: boolean): Message {
        return {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            content: text,
            language,
            timestamp: new Date(),
            isUser,
            type: 'voice'
        }
    }

    isListeningActive(): boolean {
        return this.isListening
    }

    isSpeechSupported(): boolean {
        return this.isSupported
    }

    isSpeechRecognitionSupported(): boolean {
        return !!this.recognition
    }

    isSpeechSynthesisSupported(): boolean {
        return !!this.synthesis
    }

    // Audio recording functionality
    private mediaRecorder: MediaRecorder | null = null
    private audioChunks: Blob[] = []

    async startRecording(): Promise<void> {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            this.mediaRecorder = new MediaRecorder(stream)
            this.audioChunks = []

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data)
                }
            }

            this.mediaRecorder.start()
        } catch (error) {
            throw new Error(`Failed to start recording: ${error}`)
        }
    }

    async stopRecording(): Promise<Blob> {
        return new Promise((resolve, reject) => {
            if (!this.mediaRecorder) {
                reject(new Error('No active recording'))
                return
            }

            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' })
                resolve(audioBlob)
            }

            this.mediaRecorder.stop()

            // Stop all tracks
            if (this.mediaRecorder.stream) {
                this.mediaRecorder.stream.getTracks().forEach(track => track.stop())
            }
        })
    }

    isRecording(): boolean {
        return this.mediaRecorder?.state === 'recording'
    }

    // Real-time speech processing
    async processRealTimeSpeech(
        settings: TranslationSettings,
        onTranslation: (translation: RealTimeTranslation) => void
    ): Promise<void> {
        if (!this.isSpeechRecognitionSupported()) {
            throw new Error('Speech recognition not supported')
        }

        await this.startListening(
            settings.sourceLanguage,
            async (text, isFinal) => {
                if (isFinal && text.trim()) {
                    try {
                        const translation: RealTimeTranslation = {
                            originalText: text,
                            translatedText: `[Translated]: ${text}`, // Mock translation
                            sourceLanguage: settings.sourceLanguage,
                            targetLanguage: settings.targetLanguage,
                            timestamp: new Date(),
                            confidence: Math.random() * 0.2 + 0.8,
                            participantId: 'local'
                        }

                        onTranslation(translation)

                        // Optionally speak the translation
                        if (settings.autoPlayTranslation) {
                            await this.speakText(translation.translatedText, settings.targetLanguage)
                        }
                    } catch (error) {
                        console.error('Real-time speech processing error:', error)
                    }
                }
            },
            (error) => {
                console.error('Speech recognition error:', error)
            }
        )
    }

    // Voice activity detection
    async detectVoiceActivity(stream: MediaStream): Promise<boolean> {
        return new Promise((resolve) => {
            const audioContext = new AudioContext()
            const source = audioContext.createMediaStreamSource(stream)
            const analyser = audioContext.createAnalyser()

            analyser.fftSize = 256
            source.connect(analyser)

            const bufferLength = analyser.frequencyBinCount
            const dataArray = new Uint8Array(bufferLength)

            const checkAudio = () => {
                analyser.getByteFrequencyData(dataArray)

                // Calculate average volume
                const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength

                // If average volume is above threshold, voice is detected
                const hasVoice = average > 20 // Adjust threshold as needed
                resolve(hasVoice)
            }

            setTimeout(checkAudio, 100)
        })
    }
}
