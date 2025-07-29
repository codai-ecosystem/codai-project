/**
 * Continuous Listening Service
 * 
 * This service orchestrates continuous voice detection and real-time conversation management:
 * - Integrates VAD with Azure OpenAI Realtime API
 * - Manages conversation state and context
 * - Handles interruptions and real-time responses
 * - Provides WebSocket-based streaming for low latency
 * - Manages audio buffering and processing pipeline
 */

import { EventEmitter } from 'events';
import { VoiceActivityDetection, VADConfig } from './VoiceActivityDetection';
import { AzureOpenAIRealtimeService } from './AzureOpenAIRealtimeService';
import { DirectAzureOpenAIClient } from '../azure/DirectAzureOpenAIClient';
import { audioDeviceManager } from '../audio/AudioDeviceManager';

export interface ContinuousListeningConfig {
    vadConfig?: Partial<VADConfig>;
    azureOpenAI: {
        apiKey: string;
        endpoint: string;
        deploymentName: string;
        apiVersion: string;
    };
    conversationConfig: {
        maxContextLength: number;
        responseTimeout: number;
        interruptionEnabled: boolean;
        autoResponse: boolean;
    };
    audioConfig: {
        outputDeviceId?: string;
        inputDeviceId?: string;
        playbackVolume: number;
        microphoneGain: number;
    };
}

export interface ConversationMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    audioData?: ArrayBuffer;
    duration?: number;
}

export interface ListeningState {
    isActive: boolean;          // Overall listening state
    isDetectingVoice: boolean;  // VAD is running
    isUserSpeaking: boolean;    // User is currently speaking
    isProcessing: boolean;      // Processing user input
    isAssistantSpeaking: boolean; // Assistant is responding
    canInterrupt: boolean;      // Can interrupt assistant
    error?: string;
}

export interface ContinuousListeningEvents {
    'stateChange': (state: ListeningState) => void;
    'userSpeechStart': () => void;
    'userSpeechEnd': (audioData: Float32Array) => void;
    'transcriptionReceived': (text: string) => void;
    'assistantResponseStart': () => void;
    'assistantResponseEnd': () => void;
    'conversationUpdate': (message: ConversationMessage) => void;
    'error': (error: Error) => void;
}

export class ContinuousListeningService extends EventEmitter {
    private config: ContinuousListeningConfig;
    private vad: VoiceActivityDetection;
    private realtimeService: AzureOpenAIRealtimeService;
    private directClient: DirectAzureOpenAIClient;

    private state: ListeningState = {
        isActive: false,
        isDetectingVoice: false,
        isUserSpeaking: false,
        isProcessing: false,
        isAssistantSpeaking: false,
        canInterrupt: false
    };

    private conversationHistory: ConversationMessage[] = [];
    private currentSpeechBuffer: Float32Array | null = null;
    private responseTimeoutId: NodeJS.Timeout | null = null;

    // Audio context for playback
    private audioContext: AudioContext | null = null;
    private audioQueue: ArrayBuffer[] = [];
    private isPlayingAudio = false;

    constructor(config: ContinuousListeningConfig) {
        super();
        this.config = config;

        // Initialize VAD
        this.vad = new VoiceActivityDetection(config.vadConfig);

        // Initialize Azure OpenAI services
        this.realtimeService = new AzureOpenAIRealtimeService(config.azureOpenAI);
        this.directClient = new DirectAzureOpenAIClient();

        this.setupEventHandlers();
    }

    /**
     * Setup event handlers for all services
     */
    private setupEventHandlers(): void {
        // VAD event handlers
        this.vad.on('voiceStart', () => {
            this.handleUserSpeechStart();
        });

        this.vad.on('voiceEnd', (audioBuffer: Float32Array) => {
            this.handleUserSpeechEnd(audioBuffer);
        });

        this.vad.on('error', (error: Error) => {
            this.handleError(error);
        });

        // Realtime service event handlers
        this.realtimeService.on('connected', () => {
            console.log('✅ Realtime service connected');
            this.updateState({ isActive: true });
        });

        this.realtimeService.on('disconnected', () => {
            console.log('🔌 Realtime service disconnected');
            this.updateState({ isActive: false });
        });

        this.realtimeService.on('transcriptionReceived', (text: string) => {
            this.handleTranscriptionReceived(text);
        });

        this.realtimeService.on('responseStarted', () => {
            this.handleAssistantResponseStart();
        });

        this.realtimeService.on('audioReceived', (audioData: ArrayBuffer) => {
            this.handleAssistantAudioReceived(audioData);
        });

        this.realtimeService.on('responseCompleted', (text: string) => {
            this.handleAssistantResponseComplete(text);
        });

        this.realtimeService.on('error', (error: Error) => {
            this.handleError(error);
        });
    }

    /**
     * Start continuous listening
     */
    async startListening(): Promise<void> {
        try {
            console.log('🎤 Starting continuous listening service...');

            // Initialize audio context
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

            // Set up audio devices
            await this.configureAudioDevices();

            // Initialize and start VAD
            await this.vad.initialize();
            await this.vad.startListening();

            // Connect to Azure OpenAI Realtime service
            await this.realtimeService.connect();

            this.updateState({
                isActive: true,
                isDetectingVoice: true
            });

            console.log('✅ Continuous listening service started');

        } catch (error) {
            console.error('❌ Failed to start continuous listening:', error);
            this.handleError(error as Error);
            throw error;
        }
    }

    /**
     * Stop continuous listening
     */
    async stopListening(): Promise<void> {
        try {
            console.log('🛑 Stopping continuous listening service...');

            // Stop VAD
            this.vad.stopListening();

            // Disconnect realtime service
            await this.realtimeService.disconnect();

            // Clear any pending timeouts
            if (this.responseTimeoutId) {
                clearTimeout(this.responseTimeoutId);
                this.responseTimeoutId = null;
            }

            // Stop any playing audio
            this.stopAudioPlayback();

            this.updateState({
                isActive: false,
                isDetectingVoice: false,
                isUserSpeaking: false,
                isProcessing: false,
                isAssistantSpeaking: false,
                canInterrupt: false
            });

            console.log('✅ Continuous listening service stopped');

        } catch (error) {
            console.error('❌ Error stopping continuous listening:', error);
            this.handleError(error as Error);
        }
    }

    /**
     * Interrupt current assistant response
     */
    async interrupt(): Promise<void> {
        if (!this.state.canInterrupt) {
            console.log('⚠️ Interruption not allowed in current state');
            return;
        }

        try {
            console.log('✋ Interrupting assistant response...');

            // Stop audio playback
            this.stopAudioPlayback();

            // Interrupt realtime service if method exists
            if (this.realtimeService && 'interrupt' in this.realtimeService) {
                await (this.realtimeService as any).interrupt();
            }

            this.updateState({
                isAssistantSpeaking: false,
                isProcessing: false,
                canInterrupt: false
            });

            console.log('✅ Assistant response interrupted');

        } catch (error) {
            console.error('❌ Error interrupting assistant:', error);
            this.handleError(error as Error);
        }
    }

    /**
     * Handle user speech start
     */
    private handleUserSpeechStart(): void {
        console.log('🗣️ User started speaking');

        // If assistant is speaking and interruption is enabled, interrupt
        if (this.state.isAssistantSpeaking && this.config.conversationConfig.interruptionEnabled) {
            this.interrupt();
        }

        this.updateState({ isUserSpeaking: true });
        this.emit('userSpeechStart');
    }

    /**
     * Handle user speech end
     */
    private async handleUserSpeechEnd(audioBuffer: Float32Array): Promise<void> {
        console.log('🔚 User finished speaking');

        this.currentSpeechBuffer = audioBuffer;

        this.updateState({
            isUserSpeaking: false,
            isProcessing: true
        });

        this.emit('userSpeechEnd', audioBuffer);

        try {
            // Send audio to realtime service for processing
            await (this.realtimeService as any).sendAudio?.(audioBuffer);

            // Set response timeout
            this.setResponseTimeout();

        } catch (error) {
            console.error('❌ Error processing user speech:', error);
            this.handleError(error as Error);
        }
    }

    /**
     * Handle transcription received
     */
    private handleTranscriptionReceived(text: string): void {
        console.log('📝 Transcription received:', text);

        // Add user message to conversation history
        const userMessage: ConversationMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: text,
            timestamp: new Date(),
            audioData: this.currentSpeechBuffer?.buffer as ArrayBuffer
        };

        this.conversationHistory.push(userMessage);
        this.emit('conversationUpdate', userMessage);
        this.emit('transcriptionReceived', text);

        // Clear speech buffer
        this.currentSpeechBuffer = null;
    }

    /**
     * Handle assistant response start
     */
    private handleAssistantResponseStart(): void {
        console.log('🤖 Assistant started responding');

        // Clear response timeout
        if (this.responseTimeoutId) {
            clearTimeout(this.responseTimeoutId);
            this.responseTimeoutId = null;
        }

        this.updateState({
            isProcessing: false,
            isAssistantSpeaking: true,
            canInterrupt: this.config.conversationConfig.interruptionEnabled
        });

        this.emit('assistantResponseStart');
    }

    /**
     * Handle assistant audio received
     */
    private handleAssistantAudioReceived(audioData: ArrayBuffer): void {
        // Queue audio for playback
        this.audioQueue.push(audioData);

        // Start playback if not already playing
        if (!this.isPlayingAudio) {
            this.playNextAudio();
        }
    }

    /**
     * Handle assistant response complete
     */
    private handleAssistantResponseComplete(text: string): void {
        console.log('✅ Assistant response complete:', text);

        // Add assistant message to conversation history
        const assistantMessage: ConversationMessage = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: text,
            timestamp: new Date()
        };

        this.conversationHistory.push(assistantMessage);
        this.emit('conversationUpdate', assistantMessage);

        this.updateState({
            isAssistantSpeaking: false,
            canInterrupt: false
        });

        this.emit('assistantResponseEnd');
    }

    /**
     * Configure audio input/output devices
     */
    private async configureAudioDevices(): Promise<void> {
        try {
            // Set input device if specified
            if (this.config.audioConfig.inputDeviceId) {
                await audioDeviceManager.setInputDevice(this.config.audioConfig.inputDeviceId);
            }

            // Set output device if specified
            if (this.config.audioConfig.outputDeviceId) {
                await audioDeviceManager.setOutputDevice(this.config.audioConfig.outputDeviceId);
            }

            console.log('✅ Audio devices configured');

        } catch (error) {
            console.error('❌ Error configuring audio devices:', error);
            throw error;
        }
    }

    /**
     * Play next audio in queue
     */
    private async playNextAudio(): Promise<void> {
        if (this.audioQueue.length === 0 || !this.audioContext) {
            this.isPlayingAudio = false;
            return;
        }

        this.isPlayingAudio = true;

        try {
            const audioData = this.audioQueue.shift()!;
            const audioBuffer = await this.audioContext.decodeAudioData(audioData);

            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();

            source.buffer = audioBuffer;
            gainNode.gain.value = this.config.audioConfig.playbackVolume;

            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            source.onended = () => {
                // Play next audio in queue
                this.playNextAudio();
            };

            source.start();

        } catch (error) {
            console.error('❌ Error playing audio:', error);
            this.isPlayingAudio = false;
            this.playNextAudio(); // Try next audio
        }
    }

    /**
     * Stop audio playback
     */
    private stopAudioPlayback(): void {
        this.audioQueue = [];
        this.isPlayingAudio = false;

        // Note: Individual audio sources will stop naturally or can be tracked separately
    }

    /**
     * Set response timeout
     */
    private setResponseTimeout(): void {
        if (this.responseTimeoutId) {
            clearTimeout(this.responseTimeoutId);
        }

        this.responseTimeoutId = setTimeout(() => {
            console.log('⏰ Response timeout - no response from assistant');
            this.updateState({
                isProcessing: false,
                error: 'Response timeout - please try again'
            });
        }, this.config.conversationConfig.responseTimeout);
    }

    /**
     * Update state and emit change event
     */
    private updateState(newState: Partial<ListeningState>): void {
        const prevState = { ...this.state };
        this.state = { ...this.state, ...newState };

        // Clear error if state is changing positively
        if (newState.isActive || newState.isProcessing) {
            this.state.error = undefined;
        }

        this.emit('stateChange', this.state);

        console.log('📊 State updated:', {
            from: prevState,
            to: this.state
        });
    }

    /**
     * Handle errors
     */
    private handleError(error: Error): void {
        console.error('❌ Continuous listening error:', error);

        this.updateState({
            error: error.message,
            isProcessing: false,
            isAssistantSpeaking: false,
            canInterrupt: false
        });

        this.emit('error', error);
    }

    /**
     * Get current conversation history
     */
    getConversationHistory(): ConversationMessage[] {
        return [...this.conversationHistory];
    }

    /**
     * Clear conversation history
     */
    clearConversationHistory(): void {
        this.conversationHistory = [];
        console.log('🧹 Conversation history cleared');
    }

    /**
     * Get current listening state
     */
    getState(): ListeningState {
        return { ...this.state };
    }

    /**
     * Get VAD statistics
     */
    getVADStatistics() {
        return this.vad.getStatistics();
    }

    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<ContinuousListeningConfig>): void {
        this.config = { ...this.config, ...newConfig };
        console.log('⚙️ Configuration updated:', newConfig);
    }

    /**
     * Cleanup resources
     */
    dispose(): void {
        this.stopListening();

        this.vad.dispose();
        this.realtimeService.disconnect();

        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }

        this.removeAllListeners();
        console.log('🧹 Continuous listening service disposed');
    }
}

// Type definitions for event emitter
export interface ContinuousListeningService {
    on<K extends keyof ContinuousListeningEvents>(event: K, listener: ContinuousListeningEvents[K]): this;
    emit<K extends keyof ContinuousListeningEvents>(event: K, ...args: Parameters<ContinuousListeningEvents[K]>): boolean;
}
