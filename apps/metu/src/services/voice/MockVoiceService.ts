import {
    BaseVoiceService,
    VoiceSettings,
    VoiceCommand,
    VoiceResponse,
    VoiceProvider
} from './IVoiceService';

export class MockVoiceService extends BaseVoiceService {
    private listeningTimeout?: NodeJS.Timeout;
    private speakingTimeout?: NodeJS.Timeout;
    private mockAudioContext?: AudioContext;

    constructor(initialSettings: Partial<VoiceSettings> = {}) {
        super({
            provider: 'mock',
            voice: 'mock-voice',
            speed: 1.0,
            pitch: 1.0,
            volume: 0.8,
            language: 'en',
            ...initialSettings
        });
    }

    async initialize(settings?: Partial<VoiceSettings>): Promise<void> {
        if (this.isInitialized) {
            return;
        }

        if (settings) {
            await this.updateSettings(settings);
        }

        // Initialize mock audio context for web environments
        if (typeof window !== 'undefined' && window.AudioContext) {
            this.mockAudioContext = new AudioContext();
        }

        this.isInitialized = true;
        console.log('MockVoiceService initialized');
    }

    async destroy(): Promise<void> {
        if (!this.isInitialized) {
            return;
        }

        await this.stopListening();
        await this.stopSpeaking();

        if (this.mockAudioContext) {
            await this.mockAudioContext.close();
            this.mockAudioContext = undefined;
        }

        if (this.listeningTimeout) {
            clearTimeout(this.listeningTimeout);
            this.listeningTimeout = undefined;
        }

        if (this.speakingTimeout) {
            clearTimeout(this.speakingTimeout);
            this.speakingTimeout = undefined;
        }

        this.isInitialized = false;
        console.log('MockVoiceService destroyed');
    }

    async startListening(): Promise<void> {
        if (!this.isInitialized) {
            throw new Error('Voice service not initialized');
        }

        if (this.state.isListening) {
            return;
        }

        this.updateState({ isListening: true });
        this.emit('listening:started');

        // Simulate voice recognition with a delay
        this.listeningTimeout = setTimeout(() => {
            this.simulateVoiceCommand();
        }, 2000 + Math.random() * 3000); // 2-5 seconds

        console.log('Mock voice listening started');
    }

    async stopListening(): Promise<void> {
        if (!this.state.isListening) {
            return;
        }

        if (this.listeningTimeout) {
            clearTimeout(this.listeningTimeout);
            this.listeningTimeout = undefined;
        }

        this.updateState({ isListening: false });
        this.emit('listening:stopped');

        console.log('Mock voice listening stopped');
    }

    async processAudioData(audioData: ArrayBuffer): Promise<VoiceCommand | null> {
        if (!this.isInitialized) {
            throw new Error('Voice service not initialized');
        }

        this.updateState({ isProcessing: true });
        this.emit('processing:started', 'Processing audio data...');

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

        // Simulate recognition results
        const commands = this.getMockCommands();
        const randomCommand = commands[Math.floor(Math.random() * commands.length)];

        const command = this.createVoiceCommand(
            randomCommand.text,
            0.8 + Math.random() * 0.2, // 0.8-1.0 confidence
            randomCommand.alternatives
        );

        this.updateState({ isProcessing: false });
        this.emit('command:received', command);

        return command;
    }

    async speak(text: string, options?: Partial<VoiceSettings>): Promise<VoiceResponse> {
        if (!this.isInitialized) {
            throw new Error('Voice service not initialized');
        }

        if (this.state.isSpeaking) {
            await this.stopSpeaking();
        }

        const effectiveSettings = { ...this.settings, ...options };

        this.updateState({ isSpeaking: true });
        this.emit('speaking:started', this.createVoiceResponse(text));

        // Calculate speaking duration based on text length and speed
        const wordsPerMinute = 150 * effectiveSettings.speed;
        const wordCount = text.split(' ').length;
        const duration = Math.max(1000, (wordCount / wordsPerMinute) * 60 * 1000);

        // Generate mock audio buffer
        const audioBuffer = this.generateMockAudio(text, duration / 1000);

        const response = this.createVoiceResponse(
            text,
            undefined, // No URL for mock
            audioBuffer,
            duration / 1000
        );

        // Simulate speaking with timeout
        return new Promise((resolve) => {
            this.speakingTimeout = setTimeout(async () => {
                this.updateState({ isSpeaking: false });
                this.emit('speaking:finished', response);

                // Play mock audio if possible
                if (audioBuffer && this.mockAudioContext) {
                    try {
                        await this.playMockAudio(audioBuffer);
                    } catch (error) {
                        console.warn('Could not play mock audio:', error);
                    }
                }

                resolve(response);
            }, duration);
        });
    }

    async stopSpeaking(): Promise<void> {
        if (!this.state.isSpeaking) {
            return;
        }

        if (this.speakingTimeout) {
            clearTimeout(this.speakingTimeout);
            this.speakingTimeout = undefined;
        }

        this.updateState({ isSpeaking: false });
        console.log('Mock voice speaking stopped');
    }

    async getAvailableProviders(): Promise<VoiceProvider[]> {
        return [
            {
                name: 'mock',
                displayName: 'Mock Voice Provider',
                isAvailable: true,
                supportedLanguages: ['en', 'ro', 'es', 'fr', 'de'],
                supportedVoices: [
                    {
                        id: 'mock-voice-en-male',
                        name: 'Mock Male Voice (English)',
                        language: 'en',
                        gender: 'male',
                        preview: 'Hello, this is a preview of the mock male voice.'
                    },
                    {
                        id: 'mock-voice-en-female',
                        name: 'Mock Female Voice (English)',
                        language: 'en',
                        gender: 'female',
                        preview: 'Hello, this is a preview of the mock female voice.'
                    },
                    {
                        id: 'mock-voice-ro-male',
                        name: 'Mock Male Voice (Romanian)',
                        language: 'ro',
                        gender: 'male',
                        preview: 'Salut, aceasta este o previzualizare a vocii masculine mock.'
                    },
                    {
                        id: 'mock-voice-ro-female',
                        name: 'Mock Female Voice (Romanian)',
                        language: 'ro',
                        gender: 'female',
                        preview: 'Salut, aceasta este o previzualizare a vocii feminine mock.'
                    }
                ],
                capabilities: {
                    speechToText: true,
                    textToSpeech: true,
                    realTimeProcessing: true,
                    customVoices: false,
                    emotionalTones: false,
                    backgroundNoise: true
                }
            }
        ];
    }

    async switchProvider(provider: string): Promise<void> {
        if (provider !== 'mock') {
            throw new Error(`Mock service cannot switch to provider: ${provider}`);
        }

        await this.updateSettings({ provider });
    }

    async getAvailableVoices(provider?: string): Promise<VoiceProvider['supportedVoices']> {
        const providers = await this.getAvailableProviders();
        const mockProvider = providers.find(p => p.name === 'mock');
        return mockProvider?.supportedVoices || [];
    }

    async switchVoice(voiceId: string): Promise<void> {
        const availableVoices = await this.getAvailableVoices();
        const voice = availableVoices.find(v => v.id === voiceId);

        if (!voice) {
            throw new Error(`Voice not found: ${voiceId}`);
        }

        await this.updateSettings({
            voice: voiceId,
            language: voice.language
        });

        console.log(`Switched to mock voice: ${voice.name}`);
    }

    async getHealthStatus(): Promise<{
        provider: string;
        status: 'healthy' | 'degraded' | 'offline';
        latency: number;
        errorRate: number;
        lastCheck: Date;
    }> {
        return {
            provider: 'mock',
            status: 'healthy',
            latency: Math.random() * 100, // Random latency 0-100ms
            errorRate: Math.random() * 0.05, // Random error rate 0-5%
            lastCheck: new Date()
        };
    }

    // Private methods
    private simulateVoiceCommand(): void {
        if (!this.state.isListening) {
            return;
        }

        const commands = this.getMockCommands();
        const randomCommand = commands[Math.floor(Math.random() * commands.length)];

        const command = this.createVoiceCommand(
            randomCommand.text,
            0.85 + Math.random() * 0.15, // 0.85-1.0 confidence
            randomCommand.alternatives
        );

        this.emit('command:received', command);

        // Continue listening for more commands
        if (this.state.isListening) {
            this.listeningTimeout = setTimeout(() => {
                this.simulateVoiceCommand();
            }, 3000 + Math.random() * 5000); // 3-8 seconds
        }
    }

    private getMockCommands(): Array<{
        text: string;
        alternatives: Array<{ text: string; confidence: number }>;
    }> {
        const language = this.state.currentLanguage;

        if (language === 'ro') {
            return [
                {
                    text: 'Salut METU, cum ești?',
                    alternatives: [
                        { text: 'Salut METU, cum ești astăzi?', confidence: 0.9 },
                        { text: 'Salut METU, ce mai faci?', confidence: 0.8 }
                    ]
                },
                {
                    text: 'Ce pot să fac astăzi?',
                    alternatives: [
                        { text: 'Ce pot să fac azi?', confidence: 0.85 },
                        { text: 'Cu ce mă poți ajuta?', confidence: 0.8 }
                    ]
                },
                {
                    text: 'Mulțumesc pentru ajutor',
                    alternatives: [
                        { text: 'Mulțumesc mult', confidence: 0.9 },
                        { text: 'Îți mulțumesc', confidence: 0.85 }
                    ]
                },
                {
                    text: 'Schimbă limba în engleză',
                    alternatives: [
                        { text: 'Treci la engleză', confidence: 0.8 },
                        { text: 'Vreau engleza', confidence: 0.7 }
                    ]
                }
            ];
        } else {
            return [
                {
                    text: 'Hello METU, how are you?',
                    alternatives: [
                        { text: 'Hi METU, how are you doing?', confidence: 0.9 },
                        { text: 'Hey METU, what\'s up?', confidence: 0.8 }
                    ]
                },
                {
                    text: 'What can I do today?',
                    alternatives: [
                        { text: 'What should I work on?', confidence: 0.85 },
                        { text: 'How can you help me?', confidence: 0.8 }
                    ]
                },
                {
                    text: 'Thank you for your help',
                    alternatives: [
                        { text: 'Thanks for helping me', confidence: 0.9 },
                        { text: 'I appreciate your assistance', confidence: 0.85 }
                    ]
                },
                {
                    text: 'Change language to Romanian',
                    alternatives: [
                        { text: 'Switch to Romanian', confidence: 0.8 },
                        { text: 'I want Romanian language', confidence: 0.7 }
                    ]
                }
            ];
        }
    }

    private generateMockAudio(text: string, duration: number): ArrayBuffer {
        // Generate a simple mock audio buffer with sine wave
        const sampleRate = 44100;
        const samples = Math.floor(sampleRate * duration);
        const buffer = new ArrayBuffer(samples * 2); // 16-bit audio
        const view = new Int16Array(buffer);

        // Generate a simple sine wave with text-based frequency variation
        const baseFreq = 200; // Base frequency
        const textHash = this.simpleHash(text);
        const freqVariation = (textHash % 100) + 50; // 50-150 Hz variation

        for (let i = 0; i < samples; i++) {
            const time = i / sampleRate;
            const frequency = baseFreq + Math.sin(time * 2) * freqVariation;
            const amplitude = Math.sin(time * frequency * 2 * Math.PI) * 0.3;

            // Apply envelope to avoid clicks
            const envelope = Math.min(1, Math.min(time * 10, (duration - time) * 10));

            view[i] = Math.floor(amplitude * envelope * 32767);
        }

        return buffer;
    }

    private async playMockAudio(audioBuffer: ArrayBuffer): Promise<void> {
        if (!this.mockAudioContext) {
            return;
        }

        try {
            // Convert our simple buffer to Web Audio API format
            const samples = new Int16Array(audioBuffer);
            const audioBufferWeb = this.mockAudioContext.createBuffer(1, samples.length, 44100);
            const channelData = audioBufferWeb.getChannelData(0);

            // Convert 16-bit PCM to float
            for (let i = 0; i < samples.length; i++) {
                channelData[i] = samples[i] / 32767;
            }

            const source = this.mockAudioContext.createBufferSource();
            const gainNode = this.mockAudioContext.createGain();

            source.buffer = audioBufferWeb;
            gainNode.gain.value = this.settings.volume;

            source.connect(gainNode);
            gainNode.connect(this.mockAudioContext.destination);

            source.start();
        } catch (error) {
            console.warn('Failed to play mock audio:', error);
        }
    }

    private simpleHash(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }
}

export default MockVoiceService;
