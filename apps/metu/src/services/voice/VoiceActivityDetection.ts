/**
 * Voice Activity Detection (VAD) Service
 * 
 * This service provides:
 * - Real-time voice activity detection using WebRTC VAD
 * - Audio buffer management for continuous listening
 * - Silence detection and speech segment isolation
 * - Background noise filtering and suppression
 * - Adaptive threshold adjustment for different environments
 */

import { EventEmitter } from 'events';

export interface VADConfig {
    sampleRate: number;
    frameSize: number;
    aggressiveness: 0 | 1 | 2 | 3; // VAD aggressiveness level
    minSpeechLength: number; // Minimum speech duration in ms
    maxSilenceLength: number; // Maximum silence duration in ms
    energyThreshold: number; // Energy threshold for voice detection
    bufferSize: number; // Audio buffer size
}

export interface VADEvents {
    'voiceStart': () => void;
    'voiceEnd': (audioBuffer: Float32Array) => void;
    'voiceContinue': (audioChunk: Float32Array) => void;
    'silence': () => void;
    'error': (error: Error) => void;
}

export class VoiceActivityDetection extends EventEmitter {
    private config: VADConfig;
    private audioContext: AudioContext | null = null;
    private mediaStream: MediaStream | null = null;
    private analyser: AnalyserNode | null = null;
    private scriptProcessor: ScriptProcessorNode | null = null;
    private workletNode: AudioWorkletNode | null = null;

    private isListening = false;
    private isSpeaking = false;
    private speechStartTime = 0;
    private silenceStartTime = 0;

    private audioBuffer: Float32Array[] = [];
    private energyHistory: number[] = [];
    private adaptiveThreshold = 0;

    private rafId: number | null = null;

    constructor(config: Partial<VADConfig> = {}) {
        super();

        this.config = {
            sampleRate: 16000,
            frameSize: 1024,
            aggressiveness: 2,
            minSpeechLength: 300, // 300ms
            maxSilenceLength: 1500, // 1.5s
            energyThreshold: 0.01,
            bufferSize: 4096,
            ...config
        };

        this.adaptiveThreshold = this.config.energyThreshold;
    }

    /**
     * Initialize the VAD system with microphone access
     */
    async initialize(): Promise<void> {
        try {
            // Create audio context
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
                sampleRate: this.config.sampleRate
            });

            // Load VAD audio worklet if available
            try {
                await this.audioContext.audioWorklet.addModule('/audio-worklets/vad-processor.js');
                console.log('✅ VAD Audio Worklet loaded');
            } catch (error) {
                console.log('⚠️ Audio Worklet not available, using ScriptProcessor fallback');
            }

            // Get microphone access
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: this.config.sampleRate,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            await this.setupAudioProcessing();
            console.log('✅ VAD system initialized');

        } catch (error) {
            console.error('❌ Failed to initialize VAD:', error);
            throw error;
        }
    }

    /**
     * Setup audio processing pipeline
     */
    private async setupAudioProcessing(): Promise<void> {
        if (!this.audioContext || !this.mediaStream) {
            throw new Error('Audio context or media stream not available');
        }

        const source = this.audioContext.createMediaStreamSource(this.mediaStream);

        // Create analyser for frequency analysis
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = this.config.frameSize * 2;
        this.analyser.smoothingTimeConstant = 0.3;

        // Try to use Audio Worklet, fallback to ScriptProcessor
        try {
            this.workletNode = new AudioWorkletNode(this.audioContext, 'vad-processor', {
                processorOptions: {
                    frameSize: this.config.frameSize,
                    sampleRate: this.config.sampleRate
                }
            });

            this.workletNode.port.onmessage = (event) => {
                this.processAudioData(event.data);
            };

            source.connect(this.workletNode);
            this.workletNode.connect(this.analyser);

        } catch (error) {
            // Fallback to ScriptProcessor
            this.scriptProcessor = this.audioContext.createScriptProcessor(
                this.config.bufferSize, 1, 1
            );

            this.scriptProcessor.onaudioprocess = (event) => {
                const inputBuffer = event.inputBuffer.getChannelData(0);
                this.processAudioData(inputBuffer);
            };

            source.connect(this.scriptProcessor);
            this.scriptProcessor.connect(this.analyser);
        }

        this.analyser.connect(this.audioContext.destination);
    }

    /**
     * Start continuous voice activity detection
     */
    async startListening(): Promise<void> {
        if (this.isListening) {
            console.log('⚠️ VAD already listening');
            return;
        }

        if (!this.audioContext) {
            await this.initialize();
        }

        if (this.audioContext?.state === 'suspended') {
            await this.audioContext.resume();
        }

        this.isListening = true;
        this.isSpeaking = false;
        this.audioBuffer = [];
        this.energyHistory = [];

        // Start adaptive threshold calculation
        this.startAdaptiveThresholding();

        console.log('🎤 VAD started listening for voice activity');
    }

    /**
     * Stop voice activity detection
     */
    stopListening(): void {
        this.isListening = false;

        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }

        // If currently speaking, end the speech segment
        if (this.isSpeaking) {
            this.endSpeech();
        }

        console.log('🛑 VAD stopped listening');
    }

    /**
     * Process incoming audio data for voice activity detection
     */
    private processAudioData(audioData: Float32Array): void {
        if (!this.isListening) return;

        const energy = this.calculateEnergy(audioData);
        const isVoice = this.detectVoiceActivity(energy, audioData);

        const currentTime = Date.now();

        if (isVoice) {
            // Voice detected
            if (!this.isSpeaking) {
                // Start of speech
                this.isSpeaking = true;
                this.speechStartTime = currentTime;
                this.audioBuffer = [audioData.slice()];

                console.log('🗣️ Voice activity started');
                this.emit('voiceStart');
            } else {
                // Continue speech
                this.audioBuffer.push(audioData.slice());
                this.emit('voiceContinue', audioData);
            }

            this.silenceStartTime = 0;
        } else {
            // No voice detected
            if (this.isSpeaking) {
                if (this.silenceStartTime === 0) {
                    this.silenceStartTime = currentTime;
                }

                // Check if silence duration exceeds threshold
                const silenceDuration = currentTime - this.silenceStartTime;
                if (silenceDuration >= this.config.maxSilenceLength) {
                    this.endSpeech();
                } else {
                    // Still in speech segment, add to buffer
                    this.audioBuffer.push(audioData.slice());
                }
            } else {
                // Emit silence event periodically
                this.emit('silence');
            }
        }

        // Update energy history for adaptive thresholding
        this.updateEnergyHistory(energy);
    }

    /**
     * Calculate audio energy level
     */
    private calculateEnergy(audioData: Float32Array): number {
        let energy = 0;
        for (let i = 0; i < audioData.length; i++) {
            energy += audioData[i] * audioData[i];
        }
        return Math.sqrt(energy / audioData.length);
    }

    /**
     * Detect voice activity using multiple criteria
     */
    private detectVoiceActivity(energy: number, audioData: Float32Array): boolean {
        // Energy-based detection
        const energyDetection = energy > this.adaptiveThreshold;

        // Zero-crossing rate (for distinguishing speech from noise)
        const zcr = this.calculateZeroCrossingRate(audioData);
        const zcrDetection = zcr > 0.1 && zcr < 3.0; // Typical speech range

        // Spectral centroid (frequency content analysis)
        const spectralCentroid = this.calculateSpectralCentroid(audioData);
        const spectralDetection = spectralCentroid > 1000 && spectralCentroid < 4000; // Speech frequency range

        // Combine detection methods
        return energyDetection && (zcrDetection || spectralDetection);
    }

    /**
     * Calculate zero-crossing rate
     */
    private calculateZeroCrossingRate(audioData: Float32Array): number {
        let crossings = 0;
        for (let i = 1; i < audioData.length; i++) {
            if ((audioData[i] >= 0) !== (audioData[i - 1] >= 0)) {
                crossings++;
            }
        }
        return crossings / audioData.length * this.config.sampleRate;
    }

    /**
     * Calculate spectral centroid
     */
    private calculateSpectralCentroid(audioData: Float32Array): number {
        if (!this.analyser) return 0;

        const frequencyData = new Float32Array(this.analyser.frequencyBinCount);
        this.analyser.getFloatFrequencyData(frequencyData);

        let weightedSum = 0;
        let magnitudeSum = 0;

        for (let i = 0; i < frequencyData.length; i++) {
            const magnitude = Math.pow(10, frequencyData[i] / 20); // Convert dB to linear
            const frequency = i * this.config.sampleRate / (2 * frequencyData.length);

            weightedSum += frequency * magnitude;
            magnitudeSum += magnitude;
        }

        return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
    }

    /**
     * End current speech segment
     */
    private endSpeech(): void {
        if (!this.isSpeaking) return;

        const speechDuration = Date.now() - this.speechStartTime;

        // Only emit if speech was long enough
        if (speechDuration >= this.config.minSpeechLength && this.audioBuffer.length > 0) {
            // Combine audio buffer into single array
            const totalLength = this.audioBuffer.reduce((sum, chunk) => sum + chunk.length, 0);
            const combinedBuffer = new Float32Array(totalLength);

            let offset = 0;
            for (const chunk of this.audioBuffer) {
                combinedBuffer.set(chunk, offset);
                offset += chunk.length;
            }

            console.log(`🔚 Voice activity ended (${speechDuration}ms, ${combinedBuffer.length} samples)`);
            this.emit('voiceEnd', combinedBuffer);
        }

        this.isSpeaking = false;
        this.audioBuffer = [];
        this.silenceStartTime = 0;
    }

    /**
     * Update energy history for adaptive thresholding
     */
    private updateEnergyHistory(energy: number): void {
        this.energyHistory.push(energy);

        // Keep only recent history
        if (this.energyHistory.length > 100) {
            this.energyHistory.shift();
        }
    }

    /**
     * Start adaptive threshold calculation
     */
    private startAdaptiveThresholding(): void {
        const updateThreshold = () => {
            if (this.energyHistory.length >= 50) {
                // Calculate background noise level
                const sortedEnergies = [...this.energyHistory].sort((a, b) => a - b);
                const backgroundNoise = sortedEnergies[Math.floor(sortedEnergies.length * 0.1)]; // 10th percentile

                // Set adaptive threshold above background noise
                this.adaptiveThreshold = Math.max(
                    backgroundNoise * 3, // 3x background noise
                    this.config.energyThreshold // Minimum threshold
                );
            }

            if (this.isListening) {
                this.rafId = requestAnimationFrame(updateThreshold);
            }
        };

        this.rafId = requestAnimationFrame(updateThreshold);
    }

    /**
     * Get current VAD statistics
     */
    getStatistics(): {
        isListening: boolean;
        isSpeaking: boolean;
        currentThreshold: number;
        backgroundNoise: number;
        bufferSize: number;
    } {
        const sortedEnergies = [...this.energyHistory].sort((a, b) => a - b);
        const backgroundNoise = sortedEnergies.length > 0
            ? sortedEnergies[Math.floor(sortedEnergies.length * 0.1)]
            : 0;

        return {
            isListening: this.isListening,
            isSpeaking: this.isSpeaking,
            currentThreshold: this.adaptiveThreshold,
            backgroundNoise,
            bufferSize: this.audioBuffer.length
        };
    }

    /**
     * Cleanup resources
     */
    dispose(): void {
        this.stopListening();

        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }

        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }

        this.removeAllListeners();
        console.log('🧹 VAD resources cleaned up');
    }
}

// Declare types for event emitter
export interface VoiceActivityDetection {
    on<K extends keyof VADEvents>(event: K, listener: VADEvents[K]): this;
    emit<K extends keyof VADEvents>(event: K, ...args: Parameters<VADEvents[K]>): boolean;
}
