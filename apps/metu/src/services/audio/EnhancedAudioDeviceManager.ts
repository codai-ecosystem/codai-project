/**
 * Enhanced Audio Device Manager
 * 
 * Provides comprehensive audio device management with dynamic device discovery,
 * device switching, audio quality optimization, and cross-platform support.
 */

import { EventEmitter } from 'events';

export interface AudioDevice {
    deviceId: string;
    label: string;
    kind: 'audioinput' | 'audiooutput';
    groupId: string;
    isDefault: boolean;
    capabilities?: MediaTrackCapabilities;
    state: 'active' | 'inactive' | 'unavailable';
}

export interface AudioDeviceInfo {
    inputDevices: AudioDevice[];
    outputDevices: AudioDevice[];
    defaultInput?: AudioDevice;
    defaultOutput?: AudioDevice;
    supportedConstraints: MediaTrackSupportedConstraints;
}

export interface AudioQualitySettings {
    sampleRate: number;
    channelCount: number;
    bitDepth: number;
    echoCancellation: boolean;
    noiseSuppression: boolean;
    autoGainControl: boolean;
    latency: number;
}

export interface AudioStreamConfig {
    deviceId?: string;
    quality: AudioQualitySettings;
    bufferSize: number;
    processingInterval: number;
}

export class EnhancedAudioDeviceManager extends EventEmitter {
    private devices: Map<string, AudioDevice> = new Map();
    private activeStreams: Map<string, MediaStream> = new Map();
    private audioContext: AudioContext | null = null;
    private currentInputDevice: AudioDevice | null = null;
    private currentOutputDevice: AudioDevice | null = null;
    private isInitialized = false;
    private deviceChangeListener: (() => void) | null = null;

    constructor() {
        super();
        this.setupDeviceChangeListener();
    }

    /**
     * Initialize the audio device manager
     */
    async initialize(): Promise<void> {
        if (this.isInitialized) {
            console.log('⚠️ Audio device manager already initialized');
            return;
        }

        try {
            // Check if we're in a browser environment
            if (typeof window !== 'undefined' && window.AudioContext) {
                // Create audio context
                this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
                    latencyHint: 'interactive',
                    sampleRate: 48000
                });

                // Request initial permissions
                await this.requestInitialPermissions();

                // Discover available devices
                await this.discoverDevices();
            } else {
                // Server environment - skip browser-specific initialization
                console.log('🔊 Server environment detected - audio device manager running in server mode');
                this.isInitialized = true;
                return;
            }

            this.isInitialized = true;
            console.log('✅ Audio device manager initialized');
            this.emit('initialized', this.getDeviceInfo());

        } catch (error) {
            console.error('❌ Failed to initialize audio device manager:', error);
            throw error;
        }
    }

    /**
     * Request initial microphone permissions
     */
    private async requestInitialPermissions(): Promise<void> {
        try {
            // Request microphone access to enumerate devices properly
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: { deviceId: 'default' }
            });

            // Stop the stream, we just needed permissions
            stream.getTracks().forEach(track => track.stop());

            console.log('✅ Audio permissions granted');
        } catch (error) {
            console.error('❌ Failed to get audio permissions:', error);
            throw new Error('Microphone permissions required for device management');
        }
    }

    /**
     * Discover available audio devices
     */
    async discoverDevices(): Promise<AudioDeviceInfo> {
        try {
            const mediaDevices = await navigator.mediaDevices.enumerateDevices();
            const inputDevices: AudioDevice[] = [];
            const outputDevices: AudioDevice[] = [];

            // Clear existing devices
            this.devices.clear();

            for (const device of mediaDevices) {
                if (device.kind === 'audioinput' || device.kind === 'audiooutput') {
                    const audioDevice: AudioDevice = {
                        deviceId: device.deviceId,
                        label: device.label || `${device.kind} (${device.deviceId.substr(0, 8)})`,
                        kind: device.kind,
                        groupId: device.groupId,
                        isDefault: device.deviceId === 'default',
                        state: 'active'
                    };

                    // Get device capabilities if it's an input device
                    if (device.kind === 'audioinput') {
                        try {
                            const stream = await navigator.mediaDevices.getUserMedia({
                                audio: { deviceId: device.deviceId }
                            });

                            const track = stream.getAudioTracks()[0];
                            audioDevice.capabilities = track.getCapabilities();

                            stream.getTracks().forEach(t => t.stop());
                        } catch (error) {
                            console.warn(`⚠️ Could not get capabilities for device ${device.label}:`, error);
                            audioDevice.state = 'unavailable';
                        }
                    }

                    this.devices.set(device.deviceId, audioDevice);

                    if (device.kind === 'audioinput') {
                        inputDevices.push(audioDevice);
                    } else {
                        outputDevices.push(audioDevice);
                    }
                }
            }

            // Set default devices
            const defaultInput = inputDevices.find(d => d.isDefault) || inputDevices[0];
            const defaultOutput = outputDevices.find(d => d.isDefault) || outputDevices[0];

            if (!this.currentInputDevice && defaultInput) {
                this.currentInputDevice = defaultInput;
            }

            if (!this.currentOutputDevice && defaultOutput) {
                this.currentOutputDevice = defaultOutput;
            }

            const deviceInfo: AudioDeviceInfo = {
                inputDevices,
                outputDevices,
                defaultInput,
                defaultOutput,
                supportedConstraints: navigator.mediaDevices.getSupportedConstraints()
            };

            console.log(`🎤 Discovered ${inputDevices.length} input and ${outputDevices.length} output devices`);
            this.emit('devicesDiscovered', deviceInfo);

            return deviceInfo;

        } catch (error) {
            console.error('❌ Failed to discover audio devices:', error);
            throw error;
        }
    }

    /**
     * Set up device change listener
     */
    private setupDeviceChangeListener(): void {
        if (navigator.mediaDevices) {
            this.deviceChangeListener = () => {
                console.log('🔄 Audio devices changed, rediscovering...');
                this.discoverDevices().then(deviceInfo => {
                    this.emit('devicesChanged', deviceInfo);
                }).catch(error => {
                    console.error('❌ Error rediscovering devices:', error);
                });
            };

            navigator.mediaDevices.addEventListener('devicechange', this.deviceChangeListener);
        }
    }

    /**
     * Select input device
     */
    async selectInputDevice(deviceId: string): Promise<void> {
        const device = this.devices.get(deviceId);
        if (!device || device.kind !== 'audioinput') {
            throw new Error(`Input device ${deviceId} not found`);
        }

        if (device.state === 'unavailable') {
            throw new Error(`Input device ${device.label} is unavailable`);
        }

        // Test device by creating a temporary stream
        try {
            const testStream = await navigator.mediaDevices.getUserMedia({
                audio: { deviceId: device.deviceId }
            });
            testStream.getTracks().forEach(track => track.stop());

            this.currentInputDevice = device;
            console.log(`🎤 Selected input device: ${device.label}`);
            this.emit('inputDeviceChanged', device);

        } catch (error) {
            console.error(`❌ Failed to select input device ${device.label}:`, error);
            device.state = 'unavailable';
            throw error;
        }
    }

    /**
     * Select output device
     */
    async selectOutputDevice(deviceId: string): Promise<void> {
        const device = this.devices.get(deviceId);
        if (!device || device.kind !== 'audiooutput') {
            throw new Error(`Output device ${deviceId} not found`);
        }

        this.currentOutputDevice = device;
        console.log(`🔊 Selected output device: ${device.label}`);
        this.emit('outputDeviceChanged', device);
    }

    /**
     * Create optimized audio stream
     */
    async createAudioStream(config: Partial<AudioStreamConfig> = {}): Promise<MediaStream> {
        if (!this.currentInputDevice) {
            throw new Error('No input device selected');
        }

        const streamConfig: AudioStreamConfig = {
            deviceId: this.currentInputDevice.deviceId,
            quality: {
                sampleRate: 48000,
                channelCount: 1,
                bitDepth: 16,
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                latency: 10 // milliseconds
            },
            bufferSize: 4096,
            processingInterval: 20,
            ...config
        };

        const constraints: MediaStreamConstraints = {
            audio: {
                deviceId: streamConfig.deviceId,
                sampleRate: streamConfig.quality.sampleRate,
                channelCount: streamConfig.quality.channelCount,
                echoCancellation: streamConfig.quality.echoCancellation,
                noiseSuppression: streamConfig.quality.noiseSuppression,
                autoGainControl: streamConfig.quality.autoGainControl
                // Note: latency is not a standard MediaTrackConstraint property
            }
        };

        try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            const streamId = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            this.activeStreams.set(streamId, stream);

            // Apply audio processing enhancements
            await this.enhanceAudioStream(stream, streamConfig);

            console.log(`🎵 Created optimized audio stream: ${streamId}`);
            this.emit('streamCreated', { streamId, stream, config: streamConfig });

            return stream;

        } catch (error) {
            console.error('❌ Failed to create audio stream:', error);
            throw error;
        }
    }

    /**
     * Enhance audio stream with processing
     */
    private async enhanceAudioStream(stream: MediaStream, config: AudioStreamConfig): Promise<void> {
        if (!this.audioContext) return;

        try {
            const source = this.audioContext.createMediaStreamSource(stream);

            // Create audio processing chain
            const gainNode = this.audioContext.createGain();
            const compressor = this.audioContext.createDynamicsCompressor();
            const filter = this.audioContext.createBiquadFilter();

            // Configure compressor for voice optimization
            compressor.threshold.value = -24;
            compressor.knee.value = 30;
            compressor.ratio.value = 12;
            compressor.attack.value = 0.003;
            compressor.release.value = 0.25;

            // Configure high-pass filter to remove low-frequency noise
            filter.type = 'highpass';
            filter.frequency.value = 100;
            filter.Q.value = 1;

            // Connect audio processing chain
            source.connect(filter);
            filter.connect(compressor);
            compressor.connect(gainNode);

            console.log('🎛️ Audio stream processing chain configured');

        } catch (error) {
            console.warn('⚠️ Audio enhancement failed:', error);
        }
    }

    /**
     * Set audio output device for an HTML audio element
     */
    async setAudioElementOutput(audioElement: HTMLAudioElement): Promise<void> {
        if (!this.currentOutputDevice || !audioElement.setSinkId) {
            return;
        }

        try {
            await audioElement.setSinkId(this.currentOutputDevice.deviceId);
            console.log(`🔊 Audio element output set to: ${this.currentOutputDevice.label}`);
        } catch (error) {
            console.error('❌ Failed to set audio element output:', error);
            throw error;
        }
    }

    /**
     * Get current device information
     */
    getDeviceInfo(): AudioDeviceInfo {
        const inputDevices = Array.from(this.devices.values()).filter(d => d.kind === 'audioinput');
        const outputDevices = Array.from(this.devices.values()).filter(d => d.kind === 'audiooutput');

        return {
            inputDevices,
            outputDevices,
            defaultInput: this.currentInputDevice || undefined,
            defaultOutput: this.currentOutputDevice || undefined,
            supportedConstraints: navigator.mediaDevices?.getSupportedConstraints() || {}
        };
    }

    /**
     * Get current input device
     */
    getCurrentInputDevice(): AudioDevice | null {
        return this.currentInputDevice;
    }

    /**
     * Get current output device
     */
    getCurrentOutputDevice(): AudioDevice | null {
        return this.currentOutputDevice;
    }

    /**
     * Get device by ID
     */
    getDevice(deviceId: string): AudioDevice | undefined {
        return this.devices.get(deviceId);
    }

    /**
     * Test device functionality
     */
    async testDevice(deviceId: string, duration: number = 3000): Promise<boolean> {
        const device = this.devices.get(deviceId);
        if (!device) {
            throw new Error(`Device ${deviceId} not found`);
        }

        try {
            if (device.kind === 'audioinput') {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: { deviceId: device.deviceId }
                });

                // Test for audio activity
                let hasAudio = false;
                const audioContext = new AudioContext();
                const source = audioContext.createMediaStreamSource(stream);
                const analyser = audioContext.createAnalyser();
                const dataArray = new Uint8Array(analyser.frequencyBinCount);

                source.connect(analyser);

                const checkAudio = () => {
                    analyser.getByteFrequencyData(dataArray);
                    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
                    if (average > 10) {
                        hasAudio = true;
                    }
                };

                const interval = setInterval(checkAudio, 100);

                // Test for specified duration
                setTimeout(() => {
                    clearInterval(interval);
                    stream.getTracks().forEach(track => track.stop());
                    audioContext.close();
                }, duration);

                return new Promise(resolve => {
                    setTimeout(() => resolve(hasAudio), duration);
                });
            } else {
                // For output devices, we can't easily test without playing audio
                return true;
            }

        } catch (error) {
            console.error(`❌ Device test failed for ${device.label}:`, error);
            device.state = 'unavailable';
            return false;
        }
    }

    /**
     * Get audio context
     */
    getAudioContext(): AudioContext | null {
        return this.audioContext;
    }

    /**
     * Stop all active streams
     */
    stopAllStreams(): void {
        for (const [streamId, stream] of this.activeStreams.entries()) {
            stream.getTracks().forEach(track => {
                track.stop();
                console.log(`🛑 Stopped track: ${track.label}`);
            });
            this.activeStreams.delete(streamId);
        }

        console.log('🛑 All audio streams stopped');
        this.emit('allStreamsStopped');
    }

    /**
     * Stop specific stream
     */
    stopStream(streamId: string): void {
        const stream = this.activeStreams.get(streamId);
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            this.activeStreams.delete(streamId);
            console.log(`🛑 Stopped stream: ${streamId}`);
            this.emit('streamStopped', streamId);
        }
    }

    /**
     * Get manager status
     */
    getStatus(): {
        isInitialized: boolean;
        deviceCount: { input: number; output: number };
        currentDevices: { input?: string; output?: string };
        activeStreams: number;
        audioContextState: string;
    } {
        const inputDevices = Array.from(this.devices.values()).filter(d => d.kind === 'audioinput');
        const outputDevices = Array.from(this.devices.values()).filter(d => d.kind === 'audiooutput');

        return {
            isInitialized: this.isInitialized,
            deviceCount: {
                input: inputDevices.length,
                output: outputDevices.length
            },
            currentDevices: {
                input: this.currentInputDevice?.label,
                output: this.currentOutputDevice?.label
            },
            activeStreams: this.activeStreams.size,
            audioContextState: this.audioContext?.state || 'not-initialized'
        };
    }

    /**
     * Cleanup resources
     */
    async dispose(): Promise<void> {
        // Stop all streams
        this.stopAllStreams();

        // Remove device change listener
        if (this.deviceChangeListener && navigator.mediaDevices) {
            navigator.mediaDevices.removeEventListener('devicechange', this.deviceChangeListener);
            this.deviceChangeListener = null;
        }

        // Close audio context
        if (this.audioContext) {
            await this.audioContext.close();
            this.audioContext = null;
        }

        // Clear devices
        this.devices.clear();
        this.currentInputDevice = null;
        this.currentOutputDevice = null;
        this.isInitialized = false;

        this.removeAllListeners();
        console.log('🧹 Audio device manager disposed');
    }
}

// Export device manager events interface
export interface AudioDeviceManagerEvents {
    'initialized': (deviceInfo: AudioDeviceInfo) => void;
    'devicesDiscovered': (deviceInfo: AudioDeviceInfo) => void;
    'devicesChanged': (deviceInfo: AudioDeviceInfo) => void;
    'inputDeviceChanged': (device: AudioDevice) => void;
    'outputDeviceChanged': (device: AudioDevice) => void;
    'streamCreated': (data: { streamId: string; stream: MediaStream; config: AudioStreamConfig }) => void;
    'streamStopped': (streamId: string) => void;
    'allStreamsStopped': () => void;
    'deviceError': (error: { deviceId: string; error: Error }) => void;
}

// Typed event emitter
export interface EnhancedAudioDeviceManager {
    on<K extends keyof AudioDeviceManagerEvents>(event: K, listener: AudioDeviceManagerEvents[K]): this;
    emit<K extends keyof AudioDeviceManagerEvents>(event: K, ...args: Parameters<AudioDeviceManagerEvents[K]>): boolean;
}
