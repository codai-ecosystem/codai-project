import { getErrorMessage } from '../../utils/errorHandling';

export interface AudioDevice {
    deviceId: string;
    label: string;
    kind: 'audioinput' | 'audiooutput';
    groupId: string;
    isDefault?: boolean;
    capabilities?: MediaTrackCapabilities;
}

export interface AudioDeviceConstraints {
    deviceId?: string;
    sampleRate?: number;
    channelCount?: number;
    echoCancellation?: boolean;
    noiseSuppression?: boolean;
    autoGainControl?: boolean;
    volume?: number;
}

export interface AudioDeviceStatus {
    inputDevice: AudioDevice | null;
    outputDevice: AudioDevice | null;
    inputLevel: number;
    outputLevel: number;
    isInputActive: boolean;
    isOutputActive: boolean;
    sampleRate: number;
    latency: number;
}

export interface AudioDeviceManagerEvents {
    devicesChanged: (devices: AudioDevice[]) => void;
    deviceConnected: (device: AudioDevice) => void;
    deviceDisconnected: (deviceId: string) => void;
    inputLevelChanged: (level: number) => void;
    outputLevelChanged: (level: number) => void;
    error: (error: string) => void;
}

export class AudioDeviceManager {
    private inputDevices: AudioDevice[] = [];
    private outputDevices: AudioDevice[] = [];
    private selectedInputDevice: string | null = null;
    private selectedOutputDevice: string | null = null;
    private eventListeners: Partial<AudioDeviceManagerEvents> = {};
    private isInitialized = false;

    // Enhanced audio monitoring
    private inputStream: MediaStream | null = null;
    private outputContext: AudioContext | null = null;
    private inputAnalyzer: AnalyserNode | null = null;
    private outputAnalyzer: AnalyserNode | null = null;
    private inputLevelMonitor: number | null = null;
    private outputLevelMonitor: number | null = null;
    private inputLevel = 0;
    private outputLevel = 0;

    constructor() {
        this.initializeDeviceMonitoring();
    }

    private async initializeDeviceMonitoring(): Promise<void> {
        try {
            // Request microphone permission to enumerate devices properly
            await navigator.mediaDevices.getUserMedia({ audio: true });

            // Listen for device changes
            navigator.mediaDevices.addEventListener('devicechange', this.handleDeviceChange.bind(this));

            // Initial device enumeration
            await this.refreshDevices();
            this.isInitialized = true;
        } catch (error) {
            this.emit('error', `Failed to initialize audio device manager: ${getErrorMessage(error)}`);
        }
    }

    private async handleDeviceChange(): Promise<void> {
        try {
            await this.refreshDevices();
            this.emit('devicesChanged', [...this.inputDevices, ...this.outputDevices]);
        } catch (error) {
            this.emit('error', `Error handling device change: ${getErrorMessage(error)}`);
        }
    }

    private async refreshDevices(): Promise<void> {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();

            const newInputDevices: AudioDevice[] = [];
            const newOutputDevices: AudioDevice[] = [];

            for (const device of devices) {
                if (device.kind === 'audioinput') {
                    const audioDevice: AudioDevice = {
                        deviceId: device.deviceId,
                        label: device.label || `Microphone ${newInputDevices.length + 1}`,
                        kind: device.kind,
                        groupId: device.groupId,
                        isDefault: device.deviceId === 'default'
                    };

                    // Try to get device capabilities
                    try {
                        const stream = await navigator.mediaDevices.getUserMedia({
                            audio: { deviceId: { exact: device.deviceId } }
                        });
                        const track = stream.getAudioTracks()[0];
                        audioDevice.capabilities = track.getCapabilities();
                        track.stop();
                    } catch (error) {
                        console.warn('Could not get capabilities for input device:', device.label);
                    }

                    newInputDevices.push(audioDevice);
                } else if (device.kind === 'audiooutput') {
                    const audioDevice: AudioDevice = {
                        deviceId: device.deviceId,
                        label: device.label || `Speaker ${newOutputDevices.length + 1}`,
                        kind: device.kind,
                        groupId: device.groupId,
                        isDefault: device.deviceId === 'default'
                    };

                    newOutputDevices.push(audioDevice);
                }
            }

            // Check for newly connected devices
            newInputDevices.forEach(newDevice => {
                if (!this.inputDevices.find(d => d.deviceId === newDevice.deviceId)) {
                    this.emit('deviceConnected', newDevice);
                }
            });

            newOutputDevices.forEach(newDevice => {
                if (!this.outputDevices.find(d => d.deviceId === newDevice.deviceId)) {
                    this.emit('deviceConnected', newDevice);
                }
            });

            // Check for disconnected devices
            this.inputDevices.forEach(oldDevice => {
                if (!newInputDevices.find(d => d.deviceId === oldDevice.deviceId)) {
                    this.emit('deviceDisconnected', oldDevice.deviceId);
                }
            });

            this.outputDevices.forEach(oldDevice => {
                if (!newOutputDevices.find(d => d.deviceId === oldDevice.deviceId)) {
                    this.emit('deviceDisconnected', oldDevice.deviceId);
                }
            });

            this.inputDevices = newInputDevices;
            this.outputDevices = newOutputDevices;

            // Set default devices if none selected
            if (!this.selectedInputDevice && this.inputDevices.length > 0) {
                const defaultDevice = this.inputDevices.find(d => d.isDefault) || this.inputDevices[0];
                this.selectedInputDevice = defaultDevice.deviceId;
            }

            if (!this.selectedOutputDevice && this.outputDevices.length > 0) {
                const defaultDevice = this.outputDevices.find(d => d.isDefault) || this.outputDevices[0];
                this.selectedOutputDevice = defaultDevice.deviceId;
            }

        } catch (error) {
            this.emit('error', `Failed to refresh devices: ${getErrorMessage(error)}`);
        }
    }

    private emit<K extends keyof AudioDeviceManagerEvents>(
        event: K,
        data: Parameters<AudioDeviceManagerEvents[K]>[0]
    ): void {
        const handler = this.eventListeners[event];
        if (handler) {
            (handler as any)(data);
        }
    }

    // Public API methods
    public async getInputDevices(): Promise<AudioDevice[]> {
        if (!this.isInitialized) {
            await this.initializeDeviceMonitoring();
        }
        return [...this.inputDevices];
    }

    public async getOutputDevices(): Promise<AudioDevice[]> {
        if (!this.isInitialized) {
            await this.initializeDeviceMonitoring();
        }
        return [...this.outputDevices];
    }

    public async getAllDevices(): Promise<AudioDevice[]> {
        return [...await this.getInputDevices(), ...await this.getOutputDevices()];
    }

    public getSelectedInputDevice(): string | null {
        return this.selectedInputDevice;
    }

    public getSelectedOutputDevice(): string | null {
        return this.selectedOutputDevice;
    }

    public async setInputDevice(deviceId: string, constraints: AudioDeviceConstraints = {}): Promise<boolean> {
        try {
            const device = this.inputDevices.find(d => d.deviceId === deviceId);
            if (!device) {
                throw new Error(`Input device with ID ${deviceId} not found`);
            }

            // Stop current input stream if active
            if (this.inputStream) {
                this.inputStream.getTracks().forEach(track => track.stop());
                this.inputStream = null;
            }

            // Build media constraints
            const mediaConstraints: MediaStreamConstraints = {
                audio: {
                    deviceId: deviceId === 'default' ? undefined : { exact: deviceId },
                    sampleRate: constraints.sampleRate || 24000,
                    channelCount: constraints.channelCount || 1,
                    echoCancellation: constraints.echoCancellation ?? true,
                    noiseSuppression: constraints.noiseSuppression ?? true,
                    autoGainControl: constraints.autoGainControl ?? true
                }
            };

            // Test the device by creating a media stream
            this.inputStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);

            this.selectedInputDevice = deviceId;

            // Setup input monitoring
            await this.setupInputMonitoring();

            return true;
        } catch (error) {
            this.emit('error', `Failed to set input device: ${getErrorMessage(error)}`);
            return false;
        }
    }

    public async setOutputDevice(deviceId: string): Promise<boolean> {
        try {
            const device = this.outputDevices.find(d => d.deviceId === deviceId);
            if (!device) {
                throw new Error(`Output device with ID ${deviceId} not found`);
            }

            this.selectedOutputDevice = deviceId;

            // Setup output context if needed
            if (!this.outputContext) {
                this.outputContext = new (window.AudioContext || (window as any).webkitAudioContext)({
                    sampleRate: 24000
                });
            }

            // Try to set sink ID if supported
            if ('setSinkId' in this.outputContext.destination) {
                try {
                    await (this.outputContext.destination as any).setSinkId(deviceId);
                } catch (error) {
                    console.warn('Could not set output device sink:', error);
                }
            }

            // Setup output monitoring
            await this.setupOutputMonitoring();

            return true;
        } catch (error) {
            this.emit('error', `Failed to set output device: ${getErrorMessage(error)}`);
            return false;
        }
    }

    public async createInputStream(constraints?: MediaTrackConstraints): Promise<MediaStream> {
        try {
            const audioConstraints: MediaTrackConstraints = {
                deviceId: this.selectedInputDevice ? { exact: this.selectedInputDevice } : undefined,
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                ...constraints
            };

            return await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
        } catch (error) {
            throw new Error(`Failed to create input stream: ${getErrorMessage(error)}`);
        }
    }

    public async testInputDevice(deviceId: string): Promise<boolean> {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: { deviceId: { exact: deviceId } }
            });

            // Test for 1 second
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Clean up
            stream.getTracks().forEach(track => track.stop());

            return true;
        } catch (error) {
            this.emit('error', `Input device test failed: ${getErrorMessage(error)}`);
            return false;
        }
    }

    public on<K extends keyof AudioDeviceManagerEvents>(
        event: K,
        handler: AudioDeviceManagerEvents[K]
    ): void {
        this.eventListeners[event] = handler;
    }

    public off<K extends keyof AudioDeviceManagerEvents>(event: K): void {
        delete this.eventListeners[event];
    }

    public cleanup(): void {
        // Stop monitoring
        if (this.inputLevelMonitor) {
            clearInterval(this.inputLevelMonitor);
            this.inputLevelMonitor = null;
        }

        if (this.outputLevelMonitor) {
            clearInterval(this.outputLevelMonitor);
            this.outputLevelMonitor = null;
        }

        // Stop input stream
        if (this.inputStream) {
            this.inputStream.getTracks().forEach(track => track.stop());
            this.inputStream = null;
        }

        // Close audio context
        if (this.outputContext && this.outputContext.state !== 'closed') {
            this.outputContext.close();
            this.outputContext = null;
        }

        // Remove device change listener
        if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
            navigator.mediaDevices.removeEventListener('devicechange', this.handleDeviceChange.bind(this));
        }

        this.eventListeners = {};
        this.inputAnalyzer = null;
        this.outputAnalyzer = null;
    }

    /**
     * Get current device status
     */
    public getDeviceStatus(): AudioDeviceStatus {
        return {
            inputDevice: this.inputDevices.find(d => d.deviceId === this.selectedInputDevice) || null,
            outputDevice: this.outputDevices.find(d => d.deviceId === this.selectedOutputDevice) || null,
            inputLevel: this.inputLevel,
            outputLevel: this.outputLevel,
            isInputActive: this.inputStream !== null && this.inputStream.active,
            isOutputActive: this.outputContext !== null && this.outputContext.state === 'running',
            sampleRate: this.outputContext?.sampleRate || 24000,
            latency: this.outputContext?.baseLatency || 0
        };
    }

    /**
     * Setup input level monitoring
     */
    private async setupInputMonitoring(): Promise<void> {
        if (!this.inputStream || !this.outputContext) {
            // Create output context if it doesn't exist
            if (!this.outputContext) {
                this.outputContext = new (window.AudioContext || (window as any).webkitAudioContext)({
                    sampleRate: 24000
                });
            }
        }

        if (!this.inputStream) {
            return;
        }

        try {
            const source = this.outputContext!.createMediaStreamSource(this.inputStream);
            this.inputAnalyzer = this.outputContext!.createAnalyser();
            this.inputAnalyzer.fftSize = 256;

            source.connect(this.inputAnalyzer);

            // Start monitoring
            if (this.inputLevelMonitor) {
                clearInterval(this.inputLevelMonitor);
            }

            this.inputLevelMonitor = window.setInterval(() => {
                this.updateInputLevel();
            }, 50); // 20fps

        } catch (error) {
            console.warn('Could not setup input monitoring:', error);
        }
    }

    /**
     * Setup output level monitoring
     */
    private async setupOutputMonitoring(): Promise<void> {
        if (!this.outputContext) {
            return;
        }

        try {
            this.outputAnalyzer = this.outputContext.createAnalyser();
            this.outputAnalyzer.fftSize = 256;

            // Note: Output monitoring would need to be connected to actual audio output
            // For now, we'll just create the analyzer

            // Start monitoring
            if (this.outputLevelMonitor) {
                clearInterval(this.outputLevelMonitor);
            }

            this.outputLevelMonitor = window.setInterval(() => {
                this.updateOutputLevel();
            }, 50); // 20fps

        } catch (error) {
            console.warn('Could not setup output monitoring:', error);
        }
    }

    /**
     * Update input level measurement
     */
    private updateInputLevel(): void {
        if (!this.inputAnalyzer) return;

        const dataArray = new Uint8Array(this.inputAnalyzer.frequencyBinCount);
        this.inputAnalyzer.getByteFrequencyData(dataArray);

        // Calculate RMS level
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i] * dataArray[i];
        }

        const newLevel = Math.sqrt(sum / dataArray.length) / 255;

        if (Math.abs(newLevel - this.inputLevel) > 0.01) {
            this.inputLevel = newLevel;
            this.emit('inputLevelChanged', this.inputLevel);
        }
    }

    /**
     * Update output level measurement
     */
    private updateOutputLevel(): void {
        if (!this.outputAnalyzer) return;

        const dataArray = new Uint8Array(this.outputAnalyzer.frequencyBinCount);
        this.outputAnalyzer.getByteFrequencyData(dataArray);

        // Calculate RMS level
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i] * dataArray[i];
        }

        const newLevel = Math.sqrt(sum / dataArray.length) / 255;

        if (Math.abs(newLevel - this.outputLevel) > 0.01) {
            this.outputLevel = newLevel;
            this.emit('outputLevelChanged', this.outputLevel);
        }
    }

    /**
     * Get recommended input device
     */
    public async getRecommendedInputDevice(): Promise<AudioDevice | null> {
        const devices = await this.getInputDevices();

        if (devices.length === 0) {
            return null;
        }

        // Prefer devices with good capabilities
        for (const device of devices) {
            if (device.capabilities) {
                const caps = device.capabilities;

                // Check for good sample rate support
                if (caps.sampleRate &&
                    (caps.sampleRate as any).min <= 24000 &&
                    (caps.sampleRate as any).max >= 24000) {
                    return device;
                }
            }
        }

        // Fallback to default device
        return devices.find(d => d.isDefault) || devices[0];
    }

    /**
     * Get recommended output device
     */
    public async getRecommendedOutputDevice(): Promise<AudioDevice | null> {
        const devices = await this.getOutputDevices();

        if (devices.length === 0) {
            return null;
        }

        // Prefer default device for output
        return devices.find(d => d.isDefault) || devices[0];
    }

    public isSupported(): boolean {
        return typeof navigator !== 'undefined' &&
            'mediaDevices' in navigator &&
            'getUserMedia' in navigator.mediaDevices &&
            'enumerateDevices' in navigator.mediaDevices;
    }
}

// Singleton instance
export const audioDeviceManager = new AudioDeviceManager();
