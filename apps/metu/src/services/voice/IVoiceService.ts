import { EventEmitter } from 'events';

export interface VoiceSettings {
    provider: 'mock' | 'romai' | 'azure' | 'google' | 'openai';
    voice: string;
    speed: number;
    pitch: number;
    volume: number;
    language?: string;
    gender?: 'male' | 'female' | 'neutral';
    customSettings?: Record<string, any>;
}

export interface VoiceCommand {
    id: string;
    text: string;
    confidence: number;
    language: string;
    timestamp: Date;
    alternatives?: Array<{
        text: string;
        confidence: number;
    }>;
    metadata?: Record<string, any>;
}

export interface VoiceResponse {
    id: string;
    text: string;
    audioUrl?: string;
    audioBuffer?: ArrayBuffer;
    duration?: number;
    language: string;
    timestamp: Date;
    metadata?: Record<string, any>;
}

export interface VoiceProvider {
    name: string;
    displayName: string;
    isAvailable: boolean;
    supportedLanguages: string[];
    supportedVoices: Array<{
        id: string;
        name: string;
        language: string;
        gender: 'male' | 'female' | 'neutral';
        preview?: string;
    }>;
    capabilities: {
        speechToText: boolean;
        textToSpeech: boolean;
        realTimeProcessing: boolean;
        customVoices: boolean;
        emotionalTones: boolean;
        backgroundNoise: boolean;
    };
}

export interface VoiceState {
    isListening: boolean;
    isSpeaking: boolean;
    isProcessing: boolean;
    currentProvider: string;
    currentVoice: string;
    currentLanguage: string;
    volume: number;
    lastActivity: Date;
    error?: string;
}

export interface VoiceServiceEvents {
    'state:changed': (state: VoiceState) => void;
    'listening:started': () => void;
    'listening:stopped': () => void;
    'command:received': (command: VoiceCommand) => void;
    'speaking:started': (response: VoiceResponse) => void;
    'speaking:finished': (response: VoiceResponse) => void;
    'processing:started': (text: string) => void;
    'processing:finished': (response: VoiceResponse) => void;
    'error': (error: Error) => void;
    'provider:changed': (provider: string) => void;
    'voice:changed': (voice: string) => void;
    'language:changed': (language: string) => void;
}

export interface IVoiceService extends EventEmitter {
    // Core functionality
    initialize(settings?: Partial<VoiceSettings>): Promise<void>;
    destroy(): Promise<void>;

    // Speech recognition
    startListening(): Promise<void>;
    stopListening(): Promise<void>;
    processAudioData(audioData: ArrayBuffer): Promise<VoiceCommand | null>;

    // Text-to-speech
    speak(text: string, options?: Partial<VoiceSettings>): Promise<VoiceResponse>;
    stopSpeaking(): Promise<void>;
    preloadText(text: string): Promise<void>;

    // State management
    getState(): VoiceState;
    isListening(): boolean;
    isSpeaking(): boolean;
    isProcessing(): boolean;

    // Configuration
    getSettings(): VoiceSettings;
    updateSettings(settings: Partial<VoiceSettings>): Promise<void>;
    getAvailableProviders(): Promise<VoiceProvider[]>;
    switchProvider(provider: string): Promise<void>;

    // Voice management
    getAvailableVoices(provider?: string): Promise<VoiceProvider['supportedVoices']>;
    switchVoice(voiceId: string): Promise<void>;
    testVoice(voiceId: string, testText?: string): Promise<VoiceResponse>;

    // Language support
    getSupportedLanguages(): string[];
    switchLanguage(language: string): Promise<void>;
    detectLanguage(text: string): Promise<string>;

    // Advanced features
    setVolume(volume: number): Promise<void>;
    adjustSpeed(speed: number): Promise<void>;
    adjustPitch(pitch: number): Promise<void>;

    // Audio utilities
    playAudioBuffer(buffer: ArrayBuffer): Promise<void>;
    exportAudio(text: string, format?: 'wav' | 'mp3' | 'ogg'): Promise<ArrayBuffer>;

    // Provider-specific features
    enableBackgroundNoiseReduction(enabled: boolean): Promise<void>;
    setEmotionalTone(tone: string): Promise<void>;
    calibrateMicrophone(): Promise<void>;

    // Health and monitoring
    getHealthStatus(): Promise<{
        provider: string;
        status: 'healthy' | 'degraded' | 'offline';
        latency: number;
        errorRate: number;
        lastCheck: Date;
    }>;

    // Event methods (from EventEmitter)
    on<K extends keyof VoiceServiceEvents>(event: K, listener: VoiceServiceEvents[K]): this;
    off<K extends keyof VoiceServiceEvents>(event: K, listener: VoiceServiceEvents[K]): this;
    emit<K extends keyof VoiceServiceEvents>(event: K, ...args: Parameters<VoiceServiceEvents[K]>): boolean;
}

export abstract class BaseVoiceService extends EventEmitter implements IVoiceService {
    protected settings: VoiceSettings;
    protected state: VoiceState;
    protected isInitialized = false;

    constructor(initialSettings: Partial<VoiceSettings> = {}) {
        super();

        this.settings = {
            provider: 'mock',
            voice: 'default',
            speed: 1.0,
            pitch: 1.0,
            volume: 0.8,
            language: 'en',
            ...initialSettings
        };

        this.state = {
            isListening: false,
            isSpeaking: false,
            isProcessing: false,
            currentProvider: this.settings.provider,
            currentVoice: this.settings.voice,
            currentLanguage: this.settings.language || 'en',
            volume: this.settings.volume,
            lastActivity: new Date()
        };
    }

    // Abstract methods that must be implemented by concrete classes
    abstract initialize(settings?: Partial<VoiceSettings>): Promise<void>;
    abstract destroy(): Promise<void>;
    abstract startListening(): Promise<void>;
    abstract stopListening(): Promise<void>;
    abstract processAudioData(audioData: ArrayBuffer): Promise<VoiceCommand | null>;
    abstract speak(text: string, options?: Partial<VoiceSettings>): Promise<VoiceResponse>;
    abstract stopSpeaking(): Promise<void>;
    abstract getAvailableProviders(): Promise<VoiceProvider[]>;
    abstract switchProvider(provider: string): Promise<void>;
    abstract getAvailableVoices(provider?: string): Promise<VoiceProvider['supportedVoices']>;
    abstract switchVoice(voiceId: string): Promise<void>;

    // Common implementation
    getState(): VoiceState {
        return { ...this.state };
    }

    isListening(): boolean {
        return this.state.isListening;
    }

    isSpeaking(): boolean {
        return this.state.isSpeaking;
    }

    isProcessing(): boolean {
        return this.state.isProcessing;
    }

    getSettings(): VoiceSettings {
        return { ...this.settings };
    }

    async updateSettings(settings: Partial<VoiceSettings>): Promise<void> {
        const oldSettings = { ...this.settings };
        this.settings = { ...this.settings, ...settings };

        // Update state if relevant settings changed
        if (settings.provider && settings.provider !== oldSettings.provider) {
            this.state.currentProvider = settings.provider;
            this.emit('provider:changed', settings.provider);
        }

        if (settings.voice && settings.voice !== oldSettings.voice) {
            this.state.currentVoice = settings.voice;
            this.emit('voice:changed', settings.voice);
        }

        if (settings.language && settings.language !== oldSettings.language) {
            this.state.currentLanguage = settings.language;
            this.emit('language:changed', settings.language);
        }

        if (settings.volume !== undefined) {
            this.state.volume = settings.volume;
        }

        this.updateLastActivity();
        this.emit('state:changed', this.getState());
    }

    async preloadText(text: string): Promise<void> {
        // Default implementation - can be overridden by providers
        return Promise.resolve();
    }

    getSupportedLanguages(): string[] {
        return ['en', 'ro', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja'];
    }

    async switchLanguage(language: string): Promise<void> {
        await this.updateSettings({ language });
    }

    async detectLanguage(text: string): Promise<string> {
        // Simple language detection - can be enhanced with actual detection
        const romanianWords = ['și', 'cu', 'de', 'la', 'în', 'pe', 'pentru', 'sunt', 'este', 'am'];
        const romanianCount = romanianWords.filter(word =>
            text.toLowerCase().includes(word)
        ).length;

        return romanianCount > 2 ? 'ro' : 'en';
    }

    async setVolume(volume: number): Promise<void> {
        await this.updateSettings({ volume: Math.max(0, Math.min(1, volume)) });
    }

    async adjustSpeed(speed: number): Promise<void> {
        await this.updateSettings({ speed: Math.max(0.5, Math.min(2.0, speed)) });
    }

    async adjustPitch(pitch: number): Promise<void> {
        await this.updateSettings({ pitch: Math.max(0.5, Math.min(2.0, pitch)) });
    }

    async testVoice(voiceId: string, testText?: string): Promise<VoiceResponse> {
        const text = testText || this.getTestText();
        const oldVoice = this.settings.voice;

        try {
            await this.switchVoice(voiceId);
            const response = await this.speak(text);
            return response;
        } finally {
            await this.switchVoice(oldVoice);
        }
    }

    async playAudioBuffer(buffer: ArrayBuffer): Promise<void> {
        // Default implementation using Web Audio API
        if (typeof window !== 'undefined' && window.AudioContext) {
            const audioContext = new AudioContext();
            const audioBuffer = await audioContext.decodeAudioData(buffer.slice(0));
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            source.start();
        }
    }

    async exportAudio(text: string, format: 'wav' | 'mp3' | 'ogg' = 'wav'): Promise<ArrayBuffer> {
        const response = await this.speak(text);
        if (response.audioBuffer) {
            return response.audioBuffer;
        }
        throw new Error('Audio export not supported by current provider');
    }

    async enableBackgroundNoiseReduction(enabled: boolean): Promise<void> {
        await this.updateSettings({
            customSettings: {
                ...this.settings.customSettings,
                backgroundNoiseReduction: enabled
            }
        });
    }

    async setEmotionalTone(tone: string): Promise<void> {
        await this.updateSettings({
            customSettings: {
                ...this.settings.customSettings,
                emotionalTone: tone
            }
        });
    }

    async calibrateMicrophone(): Promise<void> {
        // Default implementation - can be overridden by providers
        return Promise.resolve();
    }

    async getHealthStatus(): Promise<{
        provider: string;
        status: 'healthy' | 'degraded' | 'offline';
        latency: number;
        errorRate: number;
        lastCheck: Date;
    }> {
        return {
            provider: this.settings.provider,
            status: 'healthy',
            latency: 0,
            errorRate: 0,
            lastCheck: new Date()
        };
    }

    // Helper methods
    protected updateState(updates: Partial<VoiceState>): void {
        this.state = { ...this.state, ...updates };
        this.updateLastActivity();
        this.emit('state:changed', this.getState());
    }

    protected updateLastActivity(): void {
        this.state.lastActivity = new Date();
    }

    protected generateId(): string {
        return Math.random().toString(36).substr(2, 9);
    }

    protected getTestText(): string {
        const texts = {
            'en': 'Hello, this is a test of the voice system.',
            'ro': 'Salut, acesta este un test al sistemului vocal.'
        };
        return texts[this.state.currentLanguage as keyof typeof texts] || texts['en'];
    }

    protected createVoiceCommand(
        text: string,
        confidence: number,
        alternatives: Array<{ text: string; confidence: number }> = []
    ): VoiceCommand {
        return {
            id: this.generateId(),
            text,
            confidence,
            language: this.state.currentLanguage,
            timestamp: new Date(),
            alternatives,
            metadata: {
                provider: this.settings.provider,
                voice: this.settings.voice
            }
        };
    }

    protected createVoiceResponse(
        text: string,
        audioUrl?: string,
        audioBuffer?: ArrayBuffer,
        duration?: number
    ): VoiceResponse {
        return {
            id: this.generateId(),
            text,
            audioUrl,
            audioBuffer,
            duration,
            language: this.state.currentLanguage,
            timestamp: new Date(),
            metadata: {
                provider: this.settings.provider,
                voice: this.settings.voice,
                speed: this.settings.speed,
                pitch: this.settings.pitch,
                volume: this.settings.volume
            }
        };
    }
}

export default IVoiceService;
