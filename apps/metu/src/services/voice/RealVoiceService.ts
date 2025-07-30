/// <reference path="../../types/web-speech-api.d.ts" />

import { getErrorMessage } from '../../utils/errorHandling';
import { AudioDeviceManager } from '../audio/AudioDeviceManager';
import { SpeechRecognitionService, type SpeechRecognitionResult } from './SpeechRecognitionService';
import { AzureOpenAIRealtimeService, type AzureOpenAIConfig } from './AzureOpenAIRealtimeService';
import type { VoiceState, VoiceMessage } from '../../types/voice';

export interface RealVoiceServiceEvents {
    stateChange: (state: VoiceState) => void;
    message: (message: VoiceMessage) => void;
    error: (error: string) => void;
    deviceChange: () => void;
    configChange: () => void;
}

export interface VoiceServiceConfig {
    continuous: boolean;
    interimResults: boolean;
    language: string;
    autoStart: boolean;
    enableAudioFeedback: boolean;
    noiseSuppressionLevel: number;
    echoCancellation: boolean;
    autoGainControl: boolean;
}

export class RealVoiceService {
    private audioDeviceManager: AudioDeviceManager;
    private speechRecognition: SpeechRecognitionService;
    private azureRealtimeService: AzureOpenAIRealtimeService | null = null;
    private eventListeners: Partial<RealVoiceServiceEvents> = {};
    private currentState: VoiceState = 'idle';
    private isInitialized = false;
    private config: VoiceServiceConfig = {
        continuous: false,
        interimResults: true,
        language: 'en-US',
        autoStart: false,
        enableAudioFeedback: true,
        noiseSuppressionLevel: 0.8,
        echoCancellation: true,
        autoGainControl: true
    };

    constructor() {
        this.audioDeviceManager = new AudioDeviceManager();
        this.speechRecognition = new SpeechRecognitionService();

        // Initialize Azure OpenAI Realtime Service with environment variables from Electron API
        const electronAPI = (window as any).electronAPI;
        const azureConfig: AzureOpenAIConfig = {
            apiKey: electronAPI?.env?.AZURE_OPENAI_API_KEY || '',
            endpoint: electronAPI?.env?.AZURE_OPENAI_ENDPOINT || '',
            deploymentName: electronAPI?.env?.AZURE_OPENAI_GPT4O_DEPLOYMENT || 'gpt-4o-realtime',
            apiVersion: '2024-12-01-preview'
        };

        if (azureConfig.apiKey && azureConfig.endpoint) {
            this.azureRealtimeService = new AzureOpenAIRealtimeService(azureConfig);
        } else {
            console.warn('Azure OpenAI credentials not found. Voice responses will be limited.');
        }

        this.initializeServices();
    }

    private async initializeServices(): Promise<void> {
        try {
            // Set up audio device manager events
            this.audioDeviceManager.on('devicesChanged', () => {
                this.emit('deviceChange');
            });

            this.audioDeviceManager.on('error', (error) => {
                this.emit('error', `Audio device error: ${error}`);
            });

            // Set up speech recognition events
            this.speechRecognition.on('start', () => {
                this.setState('listening');
            });

            this.speechRecognition.on('end', () => {
                if (this.currentState === 'listening') {
                    this.setState('idle');
                }
            });

            this.speechRecognition.on('result', (result) => {
                this.handleSpeechResult(result);
            });

            this.speechRecognition.on('error', (error) => {
                this.emit('error', `Speech recognition error: ${error}`);
                this.setState('idle');
            });

            // Set up Azure OpenAI Realtime service events if available
            if (this.azureRealtimeService) {
                this.azureRealtimeService.on('connected', () => {
                    console.log('✅ Azure OpenAI Realtime service connected');
                });

                this.azureRealtimeService.on('audioResponse', (audioData: ArrayBuffer) => {
                    this.setState('speaking');
                    this.playAudioResponse(audioData);
                });

                this.azureRealtimeService.on('textResponse', (text: string) => {
                    this.emit('message', {
                        id: Date.now().toString(),
                        type: 'assistant',
                        text: text,
                        timestamp: new Date(),
                        confidence: 1.0
                    });
                });

                this.azureRealtimeService.on('error', (error: string) => {
                    this.emit('error', `Azure Realtime service error: ${error}`);
                    this.setState('idle');
                });

                // Connect to Azure Realtime service
                await this.azureRealtimeService.connect();
            }

            // Configure speech recognition
            this.speechRecognition.setLanguage(this.config.language as any);
            this.speechRecognition.setContinuous(this.config.continuous);
            this.speechRecognition.setInterimResults(this.config.interimResults);

            this.isInitialized = true;
        } catch (error) {
            this.emit('error', `Failed to initialize voice service: ${getErrorMessage(error)}`);
        }
    }

    private async playAudioResponse(audioData: ArrayBuffer): Promise<void> {
        try {
            if (!this.audioDeviceManager) {
                console.warn('Audio device manager not available');
                return;
            }

            // Create audio context if not exists
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

            // Decode audio data
            const audioBuffer = await audioContext.decodeAudioData(audioData);

            // Create audio source
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;

            // Connect to destination
            source.connect(audioContext.destination);

            // Play audio
            source.start();

            // Set state back to idle when playback ends
            source.onended = () => {
                this.setState('idle');
            };
        } catch (error) {
            console.error('Error playing audio response:', error);
            this.setState('idle');
        }
    }

    private setState(newState: VoiceState): void {
        if (this.currentState !== newState) {
            this.currentState = newState;
            this.emit('stateChange', newState);
        }
    }

    private async handleSpeechResult(result: SpeechRecognitionResult): Promise<void> {
        try {
            if (!result.isFinal) {
                // Handle interim results if needed
                return;
            }

            const transcript = result.transcript.trim();
            if (!transcript) {
                return;
            }

            // Create user message
            const userMessage: VoiceMessage = {
                id: Date.now().toString(),
                text: transcript,
                timestamp: new Date(),
                type: 'user',
                confidence: result.confidence
            };

            this.emit('message', userMessage);

            // Process with Azure realtime service if available (audio-based)
            if (this.azureRealtimeService) {
                try {
                    this.setState('processing');
                    // Note: For realtime service, we should send audio directly instead of text
                    // The transcript from speech recognition will be handled by the audio stream
                    console.log('📝 User transcript:', transcript);
                    // The audio processing is handled elsewhere in the microphone recording
                } catch (error) {
                    this.emit('error', `Failed to process voice input: ${getErrorMessage(error)}`);
                    this.setState('idle');
                }
            } else {
                // Fallback to simple echo response
                const echoMessage: VoiceMessage = {
                    id: (Date.now() + 1).toString(),
                    text: `I heard you say: "${transcript}". However, Azure voice service is not available.`,
                    timestamp: new Date(),
                    type: 'assistant'
                };

                this.emit('message', echoMessage);
                this.setState('idle');
            }
        } catch (error) {
            this.emit('error', `Error handling speech result: ${getErrorMessage(error)}`);
            this.setState('idle');
        }
    }

    private emit<K extends keyof RealVoiceServiceEvents>(
        event: K,
        ...args: Parameters<RealVoiceServiceEvents[K]>
    ): void {
        const handler = this.eventListeners[event];
        if (handler) {
            (handler as any)(...args);
        }
    }

    // Public API methods
    public async startListening(): Promise<boolean> {
        try {
            if (!this.isInitialized) {
                await this.initializeServices();
            }

            if (this.currentState === 'listening') {
                return true;
            }

            const success = await this.speechRecognition.startListening();
            if (success) {
                this.setState('listening');
            }

            return success;
        } catch (error) {
            this.emit('error', `Failed to start listening: ${getErrorMessage(error)}`);
            return false;
        }
    }

    public stopListening(): void {
        try {
            this.speechRecognition.stopListening();
            if (this.currentState === 'listening') {
                this.setState('idle');
            }
        } catch (error) {
            this.emit('error', `Failed to stop listening: ${getErrorMessage(error)}`);
        }
    }

    public async speak(text: string): Promise<void> {
        try {
            if (this.azureRealtimeService) {
                // For GPT-4o-realtime, text-to-speech is handled by the audio response events
                console.log('🔊 Text to speak:', text);
                // The realtime service handles audio output automatically
                // Text responses are converted to audio by the service
            } else {
                // Fallback to browser speech synthesis
                if ('speechSynthesis' in window) {
                    this.setState('speaking');
                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.onend = () => this.setState('idle');
                    utterance.onerror = (event) => {
                        this.emit('error', `Speech synthesis error: ${event.error}`);
                        this.setState('idle');
                    };
                    window.speechSynthesis.speak(utterance);
                } else {
                    throw new Error('Speech synthesis not supported');
                }
            }
        } catch (error) {
            this.emit('error', `Failed to speak: ${getErrorMessage(error)}`);
            this.setState('idle');
        }
    }

    public stopSpeaking(): void {
        try {
            if (this.azureRealtimeService) {
                // For realtime service, we could implement interruption here if needed
                console.log('🛑 Stop speaking requested for realtime service');
            }
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
            if (this.currentState === 'speaking') {
                this.setState('idle');
            }
        } catch (error) {
            this.emit('error', `Failed to stop speaking: ${getErrorMessage(error)}`);
        }
    }

    public getCurrentState(): VoiceState {
        return this.currentState;
    }

    public async getInputDevices() {
        return await this.audioDeviceManager.getInputDevices();
    }

    public async getOutputDevices() {
        return await this.audioDeviceManager.getOutputDevices();
    }

    public async setInputDevice(deviceId: string): Promise<boolean> {
        const success = await this.audioDeviceManager.setInputDevice(deviceId);
        if (success) {
            this.emit('configChange');
        }
        return success;
    }

    public async setOutputDevice(deviceId: string): Promise<boolean> {
        const success = await this.audioDeviceManager.setOutputDevice(deviceId);
        if (success && this.azureRealtimeService) {
            // For realtime service, output device is managed by the audio context
            console.log('🔊 Output device changed for realtime service:', deviceId);
            this.emit('configChange');
        }
        return success;
    }

    public getSelectedInputDevice(): string | null {
        return this.audioDeviceManager.getSelectedInputDevice();
    }

    public getSelectedOutputDevice(): string | null {
        return this.audioDeviceManager.getSelectedOutputDevice();
    }

    public updateConfig(newConfig: Partial<VoiceServiceConfig>): void {
        this.config = { ...this.config, ...newConfig };

        // Update speech recognition settings
        if (newConfig.language) {
            this.speechRecognition.setLanguage(newConfig.language as any);
        }
        if (newConfig.continuous !== undefined) {
            this.speechRecognition.setContinuous(newConfig.continuous);
        }
        if (newConfig.interimResults !== undefined) {
            this.speechRecognition.setInterimResults(newConfig.interimResults);
        }

        this.emit('configChange');
    }

    public getConfig(): VoiceServiceConfig {
        return { ...this.config };
    }

    public getCapabilities() {
        return {
            speechRecognition: this.speechRecognition.getCapabilities(),
            azureRealtime: this.azureRealtimeService ? {
                realTimeAudio: true,
                bidirectionalStreaming: true,
                voiceActivityDetection: true,
                mcpIntegration: true
            } : null,
            audioDevices: {
                supportsDeviceSelection: this.audioDeviceManager.isSupported(),
                supportsDeviceMonitoring: true
            }
        };
    }

    public isSupported(): boolean {
        return this.speechRecognition.isSupported() && this.audioDeviceManager.isSupported();
    }

    public isInitializedService(): boolean {
        return this.isInitialized;
    }

    public hasAzureVoiceService(): boolean {
        return this.azureRealtimeService !== null;
    }

    public getConversationHistory() {
        // For realtime service, conversation history is managed differently
        // Return empty array for now, or implement session-based history
        return [];
    }

    public clearConversationHistory(): void {
        // For realtime service, we could end current session and start new one
        if (this.azureRealtimeService) {
            console.log('🔄 Conversation history clear requested for realtime service');
            // Could implement session restart here if needed
        }
    }

    public setSystemMessage(message: string): void {
        // For realtime service, system message is set during session configuration
        if (this.azureRealtimeService) {
            console.log('📝 System message update requested for realtime service:', message);
            // Could implement dynamic system message update here if needed
        }
    }

    public on<K extends keyof RealVoiceServiceEvents>(
        event: K,
        handler: RealVoiceServiceEvents[K]
    ): void {
        this.eventListeners[event] = handler;
    }

    public off<K extends keyof RealVoiceServiceEvents>(event: K): void {
        delete this.eventListeners[event];
    }

    public cleanup(): void {
        this.stopListening();
        this.stopSpeaking();
        this.speechRecognition.cleanup();
        this.audioDeviceManager.cleanup();
        if (this.azureRealtimeService) {
            this.azureRealtimeService.disconnect();
        }
        this.eventListeners = {};
    }
}

// Singleton instance
export const realVoiceService = new RealVoiceService();
