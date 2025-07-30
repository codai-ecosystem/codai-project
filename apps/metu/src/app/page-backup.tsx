'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AzureOpenAIRealtimeService } from '../services/voice/AzureOpenAIRealtimeService';
import { DirectAzureOpenAIClient } from '../services/azure/DirectAzureOpenAIClient';
import { AudioSettings } from '../components/settings/AudioSettings';
import { audioDeviceManager } from '../services/audio/AudioDeviceManager';
import { SettingsService } from '../services/SettingsService';

interface VoiceMessage {
  id: string;
  text: string;
  type: 'user' | 'assistant';
  timestamp: Date;
  audioUrl?: string;
}

interface VoiceState {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  isConnected: boolean;
  canInterrupt: boolean;
  conversationActive: boolean;
  voiceActivityLevel: number;
  error: string | null;
}

interface Settings {
  language: string;
  confidenceThreshold: number;
  autoStartListening: boolean;
  enableNotifications: boolean;
  theme: string;
  voiceSpeed: number;
  enableKeywordWakeup: boolean;
  wakeupKeyword: string;
  selectedInputDevice: string;
  selectedOutputDevice: string;
  audioGain: number;
  noiseCancellation: boolean;
  responseStreamingEnabled: boolean;
}

// Improved Azure OpenAI Voice Service with proper audio handling
class AzureRealtimeVoiceService {
  private webSocket: WebSocket | null = null;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private isRecording: boolean = false;
  private audioChunks: Blob[] = [];
  private callbacks: { [key: string]: Function[] } = {};
  private isInitialized: boolean = false;
  private connectionResolver: ((value: void) => void) | null = null;
  private connectionRejector: ((reason?: any) => void) | null = null;
  private settings: Settings;

  constructor(settings: Settings) {
    this.settings = settings;
  }

  async initialize(): Promise<void> {
    console.log('🚀 Initializing METU Voice Service...');

    try {
      // Initialize AudioContext
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('✅ AudioContext ready (state:', this.audioContext.state, ')');

      // Get microphone access
      await this.setupAudioDevices();

      // Connect to Azure OpenAI
      await this.connectToAzureOpenAI();

      this.isInitialized = true;
      console.log('✅ METU Voice Service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize voice service:', error);
      throw error;
    }
  }

  private async setupAudioDevices(): Promise<void> {
    console.log('🎤 Enumerating audio devices...');

    try {
      // Request media devices
      console.log('📱 Requesting media devices...');
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      const audioOutputs = devices.filter(device => device.kind === 'audiooutput');

      console.log(`📱 Found ${devices.length} media devices`);
      console.log(`🎤 Input devices: ${audioInputs.length}`);
      console.log(`🔊 Output devices: ${audioOutputs.length}`);

      // Get user media
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: this.settings.noiseCancellation,
          autoGainControl: true,
          sampleRate: 24000 // Azure OpenAI requires 24kHz
        }
      });

      console.log('✅ Audio devices enumerated');
    } catch (error) {
      console.error('❌ Error setting up audio devices:', error);
      throw error;
    }
  }

  private async connectToAzureOpenAI(): Promise<void> {
    console.log('🔗 Connecting to Azure OpenAI...');

    return new Promise((resolve, reject) => {
      this.connectionResolver = resolve;
      this.connectionRejector = reject;

      console.log('🔗 Starting Azure OpenAI connection...');

      // Get configuration from environment variables
      const apiKey = process.env.NEXT_PUBLIC_AZURE_OPENAI_KEY || process.env.AZURE_OPENAI_KEY;
      const endpoint = process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT || process.env.AZURE_OPENAI_ENDPOINT;
      const deployment = process.env.NEXT_PUBLIC_AZURE_OPENAI_GPT4O_DEPLOYMENT || process.env.AZURE_OPENAI_GPT4O_DEPLOYMENT || 'gpt-4o-realtime';

      console.log('Settings check:', {
        hasApiKey: !!apiKey,
        hasEndpoint: !!endpoint,
        apiKeyLength: apiKey?.length || 0,
        endpoint: endpoint,
        deployment: deployment
      });

      if (!apiKey || !endpoint) {
        const error = new Error('Azure OpenAI credentials not found. Please check environment variables.');
        console.error('❌', error.message);
        reject(error);
        return;
      }

      // Create WebSocket connection
      const wsUrl = `wss://${endpoint.replace('https://', '').replace('http://', '')}/openai/realtime?api-version=2024-10-01-preview&deployment=${deployment}`;
      console.log('🌐 Connecting to:', wsUrl);
      console.log('🔑 Using API key:', apiKey.substring(0, 8) + '...');

      try {
        this.webSocket = new WebSocket(wsUrl);
        console.log('📡 WebSocket created, waiting for connection...');

        this.webSocket.onopen = () => {
          console.log('✅ WebSocket connected to Azure OpenAI');

          // Send authentication and configuration
          this.webSocket?.send(JSON.stringify({
            type: 'session.update',
            session: {
              modalities: ['text', 'audio'],
              instructions: 'You are METU, a helpful voice AI assistant. Respond naturally and conversationally.',
              voice: 'alloy',
              input_audio_format: 'pcm16',
              output_audio_format: 'pcm16',
              input_audio_transcription: {
                model: 'whisper-1'
              },
              turn_detection: {
                type: 'server_vad',
                threshold: 0.5,
                prefix_padding_ms: 300,
                silence_duration_ms: 200
              },
              tool_choice: 'auto',
              temperature: 0.8
            }
          }));

          resolve();
        };

        this.webSocket.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          reject(new Error('Failed to connect to Azure OpenAI WebSocket'));
        };

        this.webSocket.onclose = (event) => {
          console.log('🔌 WebSocket closed:', event.code, event.reason);
          this.handleConnectionClosed();
        };

        this.webSocket.onmessage = (event) => {
          this.handleWebSocketMessage(event.data);
        };

      } catch (error) {
        console.error('❌ Error creating WebSocket:', error);
        reject(error);
      }
    });
  }

  private handleWebSocketMessage(rawData: string): void {
    try {
      const data = JSON.parse(rawData);
      console.log('📨 Received:', data.type, data);

      switch (data.type) {
        case 'session.created':
          console.log('✅ Session created:', data.session);
          break;
        case 'session.updated':
          console.log('✅ Session updated');
          break;
        case 'response.audio.delta':
          this.handleAudioResponse(data.delta);
          break;
        case 'response.text.delta':
          this.handleTextResponse(data.delta, true);
          break;
        case 'response.text.done':
          this.handleTextResponse(data.text, false);
          break;
        case 'input_audio_buffer.speech_started':
          this.handleSpeechStarted();
          break;
        case 'input_audio_buffer.speech_stopped':
          this.handleSpeechStopped();
          break;
        case 'conversation.item.created':
          this.handleConversationItemCreated(data.item);
          break;
        case 'error':
          console.error('❌ Azure OpenAI error:', data.error);

          // Handle session expiration specifically
          if (data.error.code === 'session_expired') {
            console.log('🔄 Session expired, attempting to reconnect...');
            this.emit('sessionExpired');
            // Close current connection and reconnect
            if (this.webSocket) {
              this.webSocket.close();
              this.webSocket = null;
            }
            // Auto-reconnect after a short delay
            setTimeout(() => {
              this.connectToAzureOpenAI()
                .then(() => {
                  console.log('✅ Session renewed successfully');
                  this.emit('reconnected');
                })
                .catch((error) => {
                  console.error('❌ Failed to renew session:', error);
                  this.emit('error', error);
                });
            }, 3000);
          } else {
            this.emit('error', new Error(data.error.message));
            if (this.connectionRejector) {
              this.connectionRejector(new Error(data.error.message));
              this.connectionResolver = null;
              this.connectionRejector = null;
            }
          }
          break;
      }
    } catch (error) {
      console.error('❌ Error parsing WebSocket message:', error);
    }
  }

  private handleAudioResponse(audioDelta: string): void {
    if (this.settings.responseStreamingEnabled && audioDelta && audioDelta.length > 0) {
      try {
        // Validate base64 string first
        if (!this.isValidBase64(audioDelta)) {
          console.warn('⚠️ Invalid base64 audio data received, skipping');
          return;
        }

        // Azure OpenAI returns base64-encoded PCM16 audio data at 24kHz
        // We need to convert this raw PCM data to a proper WAV format for decoding
        const pcmData = this.base64ToPCM16(audioDelta);

        // Ensure we have valid PCM data
        if (pcmData.byteLength === 0) {
          console.warn('⚠️ Empty PCM data, skipping audio playback');
          return;
        }

        const wavBuffer = this.createWAVBuffer(pcmData, 24000, 1); // 24kHz, mono

        // Play audio with speed and pitch control
        this.playAudioWithSpeedPitch(wavBuffer, this.settings.voiceSpeed, 1.0);
      } catch (error) {
        console.error('❌ Error handling audio response:', error);
        console.error('Audio delta length:', audioDelta?.length || 0);
        console.error('Error details:', error);
      }
    }
  }

  private isValidBase64(str: string): boolean {
    try {
      // Basic validation - check if string can be decoded
      if (str.length === 0) return false;
      // Check if string contains only valid base64 characters
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      if (!base64Regex.test(str)) return false;
      // Try to decode
      atob(str);
      return true;
    } catch (error) {
      return false;
    }
  }

  private base64ToPCM16(base64Data: string): ArrayBuffer {
    try {
      // Decode base64 to binary string
      const binaryString = atob(base64Data);
      const length = binaryString.length;

      if (length === 0) {
        console.warn('⚠️ Base64 decoded to empty string');
        return new ArrayBuffer(0);
      }

      const buffer = new ArrayBuffer(length);
      const view = new Uint8Array(buffer);

      // Convert binary string to ArrayBuffer
      for (let i = 0; i < length; i++) {
        view[i] = binaryString.charCodeAt(i);
      }

      return buffer;
    } catch (error) {
      console.error('❌ Error decoding base64 audio data:', error);
      throw new Error('Failed to decode base64 audio data');
    }
  }

  private createWAVBuffer(pcmData: ArrayBuffer, sampleRate: number, channels: number): ArrayBuffer {
    const pcmLength = pcmData.byteLength;

    // Validate PCM data
    if (pcmLength === 0) {
      console.warn('⚠️ Cannot create WAV buffer from empty PCM data');
      return new ArrayBuffer(44); // Return minimal WAV header
    }

    const wavLength = 44 + pcmLength; // WAV header is 44 bytes
    const buffer = new ArrayBuffer(wavLength);
    const view = new DataView(buffer);

    // WAV Header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');                          // ChunkID
    view.setUint32(4, wavLength - 8, true);         // ChunkSize
    writeString(8, 'WAVE');                         // Format
    writeString(12, 'fmt ');                        // Subchunk1ID
    view.setUint32(16, 16, true);                   // Subchunk1Size (PCM = 16)
    view.setUint16(20, 1, true);                    // AudioFormat (PCM = 1)
    view.setUint16(22, channels, true);             // NumChannels
    view.setUint32(24, sampleRate, true);           // SampleRate
    view.setUint32(28, sampleRate * channels * 2, true); // ByteRate
    view.setUint16(32, channels * 2, true);         // BlockAlign
    view.setUint16(34, 16, true);                   // BitsPerSample
    writeString(36, 'data');                        // Subchunk2ID
    view.setUint32(40, pcmLength, true);            // Subchunk2Size

    // Copy PCM data
    const pcmView = new Uint8Array(pcmData);
    const wavView = new Uint8Array(buffer, 44);
    wavView.set(pcmView);

    return buffer;
  }

  private async playAudioWithSpeedPitch(buffer: ArrayBuffer, speed: number = 1.0, pitch: number = 1.0): Promise<void> {
    if (!this.audioContext) {
      console.error('❌ AudioContext not available');
      return;
    }

    // Check if buffer has minimum size for valid audio
    if (buffer.byteLength < 44) {
      console.warn('⚠️ Audio buffer too small, skipping playback');
      return;
    }

    try {
      // Resume AudioContext if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Create a copy of the buffer to avoid issues with decodeAudioData
      const bufferCopy = buffer.slice(0);

      // Validate WAV header before decoding
      const view = new Uint8Array(bufferCopy, 0, 12);
      const riffHeader = String.fromCharCode(...view.slice(0, 4));
      const waveHeader = String.fromCharCode(...view.slice(8, 12));

      if (riffHeader !== 'RIFF' || waveHeader !== 'WAVE') {
        console.error('❌ Invalid WAV header:', { riffHeader, waveHeader });
        return;
      }

      // Decode the audio data with enhanced error handling
      const audioBuffer = await this.audioContext.decodeAudioData(bufferCopy);

      // Validate decoded audio buffer
      if (audioBuffer.length === 0) {
        console.warn('⚠️ Decoded audio buffer is empty');
        return;
      }

      if (audioBuffer.numberOfChannels === 0) {
        console.warn('⚠️ Decoded audio buffer has no channels');
        return;
      }

      // Create audio source
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;

      // Apply speed and pitch (in Web Audio API, these are linked via playbackRate)
      const effectiveRate = Math.max(0.25, Math.min(4.0, speed * pitch)); // Clamp to reasonable range
      source.playbackRate.value = effectiveRate;

      // Create a gain node for volume control
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = Math.max(0, Math.min(2.0, this.settings.audioGain || 1.0)); // Clamp gain

      // Create dynamics compressor to prevent distortion
      const compressor = this.audioContext.createDynamicsCompressor();
      compressor.threshold.value = -24;
      compressor.knee.value = 30;
      compressor.ratio.value = 12;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.25;

      // Connect the audio graph
      source.connect(gainNode);
      gainNode.connect(compressor);
      compressor.connect(this.audioContext.destination);

      source.onended = () => {
        // Clean up resources
        try {
          source.disconnect();
          gainNode.disconnect();
          compressor.disconnect();
        } catch (e) {
          // Ignore cleanup errors
        }
      };

      // Play the audio
      source.start();

      console.log(`🎵 Playing audio: ${audioBuffer.duration.toFixed(2)}s at ${effectiveRate}x speed`);

    } catch (error) {
      if (error instanceof DOMException && error.name === 'EncodingError') {
        console.error('❌ Audio encoding error - invalid audio format:', error);
        console.error('Buffer size:', buffer.byteLength, 'bytes');
        // Log first few bytes for debugging
        const view = new Uint8Array(buffer, 0, Math.min(16, buffer.byteLength));
        console.error('Buffer header:', Array.from(view).map(b => b.toString(16).padStart(2, '0')).join(' '));
      } else {
        console.error('❌ Error playing audio with speed/pitch control:', error);
      }
    }
  }

  private handleTextResponse(text: string, isPartial: boolean): void {
    this.emit('response', {
      id: this.generateId(),
      text,
      type: 'assistant',
      timestamp: new Date(),
      isPartial
    });
  }

  private handleSpeechStarted(): void {
    console.log('🎤 Speech started');
    this.emit('speechStarted');
  }

  private handleSpeechStopped(): void {
    console.log('🔇 Speech stopped');
    this.emit('speechStopped');
  }

  private handleConversationItemCreated(item: any): void {
    console.log('💬 Conversation item created:', item);
    this.emit('conversationItemCreated', item);
  }

  private handleConnectionClosed(): void {
    console.log('🔌 Connection closed');
    this.emit('disconnected');
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Voice control methods
  async startListening(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Voice service not initialized');
    }

    if (!this.mediaStream) {
      throw new Error('Media stream not available');
    }

    try {
      console.log('🎤 Starting voice listening...');

      // Set up MediaRecorder if not already configured
      if (!this.mediaRecorder) {
        this.mediaRecorder = new MediaRecorder(this.mediaStream, {
          mimeType: 'audio/webm;codecs=opus'
        });

        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.audioChunks.push(event.data);
          }
        };

        this.mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          this.audioChunks = [];

          // Convert to base64 and send to Azure OpenAI
          const arrayBuffer = await audioBlob.arrayBuffer();
          const base64Audio = this.arrayBufferToBase64(arrayBuffer);

          if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
            this.webSocket.send(JSON.stringify({
              type: 'input_audio_buffer.append',
              audio: base64Audio
            }));

            // Commit the audio buffer
            this.webSocket.send(JSON.stringify({
              type: 'input_audio_buffer.commit'
            }));
          }
        };
      }

      this.isRecording = true;
      this.mediaRecorder.start(100); // Capture in 100ms chunks
      this.emit('listeningStarted');

    } catch (error) {
      console.error('❌ Failed to start listening:', error);
      throw error;
    }
  }

  async stopListening(): Promise<void> {
    try {
      console.log('🛑 Stopping voice listening...');

      if (this.mediaRecorder && this.isRecording) {
        this.mediaRecorder.stop();
        this.isRecording = false;
      }

      this.emit('listeningStopped');

    } catch (error) {
      console.error('❌ Failed to stop listening:', error);
      throw error;
    }
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // Event system
  on(event: string, callback: Function): void {
    if (!this.callbacks[event]) this.callbacks[event] = [];
    this.callbacks[event].push(callback);
  }

  off(event: string, callback: Function): void {
    if (this.callbacks[event]) {
      this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
    }
  }

  private emit(event: string, data?: any): void {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => callback(data));
    }
  }

  // Utility methods for checking service state
  isReady(): boolean {
    return this.isInitialized &&
      this.webSocket !== null &&
      this.webSocket.readyState === WebSocket.OPEN &&
      this.audioContext !== null;
  }

  hasVoiceDetection(): boolean {
    return this.isInitialized;
  }

  getConnectionState(): string {
    if (!this.webSocket) return 'disconnected';
    switch (this.webSocket.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'closed';
      default: return 'unknown';
    }
  }

  async destroy(): Promise<void> {
    if (this.webSocket) {
      this.webSocket.close();
      this.webSocket = null;
    }

    // Clean up MediaRecorder
    if (this.mediaRecorder) {
      if (this.isRecording) {
        this.mediaRecorder.stop();
      }
      this.mediaRecorder = null;
      this.isRecording = false;
    }

    // Clean up media stream
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }

    this.callbacks = {};
    this.isInitialized = false;
  }
}

export default function HomePage() {
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    isProcessing: false,
    isSpeaking: false,
    isConnected: false,
    canInterrupt: false,
    conversationActive: false,
    voiceActivityLevel: 0,
    error: null
  });
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    // Voice settings
    language: 'en-US',
    confidenceThreshold: 0.7,
    autoStartListening: true,
    enableNotifications: true,
    theme: 'dark',
    voiceSpeed: 1.0,
    enableKeywordWakeup: true,
    wakeupKeyword: 'Hey METU',

    // Audio device settings
    selectedInputDevice: 'default',
    selectedOutputDevice: 'default',
    audioGain: 1.0,
    noiseCancellation: true,
    responseStreamingEnabled: true
  });

  const voiceServiceRef = useRef<AzureRealtimeVoiceService | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize voice service
  useEffect(() => {
    let mounted = true;

    const initializeService = async () => {
      if (voiceServiceRef.current) return;

      try {
        console.log('🔧 Setting up voice service...');
        const service = new AzureRealtimeVoiceService(settings);
        voiceServiceRef.current = service;

        // Set up event listeners
        service.on('response', (message: VoiceMessage) => {
          if (!mounted) return;
          setMessages(prev => [...prev, message]);
        });

        service.on('error', (error: Error) => {
          if (!mounted) return;
          console.error('Voice service error:', error);
          setVoiceState(prev => ({ ...prev, error: error.message, isConnected: false }));
        });

        service.on('connected', () => {
          if (!mounted) return;
          setVoiceState(prev => ({ ...prev, isConnected: true, error: null }));
        });

        service.on('disconnected', () => {
          if (!mounted) return;
          setVoiceState(prev => ({ ...prev, isConnected: false }));
        });

        // Initialize the service
        await service.initialize();

        if (mounted) {
          setIsInitialized(true);
          setVoiceState(prev => ({ ...prev, isConnected: true, error: null }));
        }
      } catch (error: any) {
        if (mounted) {
          console.error('Failed to initialize voice service:', error);
          setVoiceState(prev => ({ ...prev, error: error.message, isConnected: false }));
        }
      }
    };

    initializeService();

    return () => {
      mounted = false;
      if (voiceServiceRef.current) {
        voiceServiceRef.current.destroy();
        voiceServiceRef.current = null;
      }
    };
  }, []);

  // Voice control functions
  const startListening = useCallback(async () => {
    if (!voiceServiceRef.current || !isInitialized) {
      console.warn('Voice service not initialized');
      return;
    }

    try {
      setVoiceState(prev => ({ ...prev, isListening: true, error: null }));
      await voiceServiceRef.current.startListening();
    } catch (error: any) {
      console.error('Failed to start listening:', error);
      setVoiceState(prev => ({ ...prev, isListening: false, error: error.message }));
    }
  }, [isInitialized]);

  const stopListening = useCallback(async () => {
    if (!voiceServiceRef.current) {
      console.warn('Voice service not available');
      return;
    }

    try {
      setVoiceState(prev => ({ ...prev, isListening: false }));
      await voiceServiceRef.current.stopListening();
    } catch (error: any) {
      console.error('Failed to stop listening:', error);
      setVoiceState(prev => ({ ...prev, error: error.message }));
    }
  }, []);

  // Clear conversation function
  const clearConversation = useCallback(() => {
    setMessages([]);
  }, []);

  // Toggle settings function
  const toggleSettings = useCallback(() => {
    setShowSettings(prev => !prev);
  }, []);

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20 animate-gradient-x"></div>
      <div className="absolute inset-0 opacity-50">
        <div className="w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:60px_60px]"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="text-center py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent mb-4">
              🎤 METU Voice AI
            </h1>
            <p className="text-xl text-gray-300 mb-6">
              Advanced Voice Assistant with Azure OpenAI GPT-4o Realtime
            </p>

            {/* Connection Status */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-full backdrop-blur-md ${voiceState.isConnected
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}>
                <div className={`w-3 h-3 rounded-full ${voiceState.isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                  }`}></div>
                <span className="font-medium" data-testid="connection-status">
                  {voiceState.isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              {voiceState.isListening && (
                <div className="flex items-center space-x-2 px-4 py-2 rounded-full backdrop-blur-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></div>
                  <span className="font-medium">Listening</span>
                </div>
              )}

              {voiceState.isSpeaking && (
                <div className="flex items-center space-x-2 px-4 py-2 rounded-full backdrop-blur-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  <div className="w-3 h-3 rounded-full bg-purple-400 animate-pulse"></div>
                  <span className="font-medium">Speaking</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full px-4 gap-6">
          {/* Left Column - Character and Audio Visualizer */}
          <div className="lg:w-1/3 flex flex-col space-y-6">
            {/* METU Character */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-2xl">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 relative">
                  <div className={`w-full h-full rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center text-6xl transition-all duration-300 ${voiceState.isListening ? 'animate-pulse scale-110' : ''
                    } ${voiceState.isSpeaking ? 'animate-bounce' : ''}`}>
                    🤖
                  </div>
                  {voiceState.isConnected && (
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">METU</h2>
                <p className="text-gray-300 text-sm">Your AI Voice Assistant</p>
              </div>
            </div>

            {/* Audio Visualizer */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-2xl" data-testid="audio-visualizer">
              <h3 className="text-xl font-semibold text-white mb-4">Audio Activity</h3>
              <div className="h-32 flex items-center justify-center">
                {voiceState.isListening || voiceState.isSpeaking ? (
                  <div className="flex items-end space-x-1 h-16">
                    {Array.from({ length: 20 }, (_, i) => (
                      <div
                        key={i}
                        className={`w-2 bg-gradient-to-t from-purple-500 to-indigo-400 rounded-full transition-all duration-150 ${voiceState.isListening ? 'animate-pulse' : ''
                          }`}
                        style={{
                          height: Math.random() * 100 + 20 + '%',
                          animationDelay: `${i * 50}ms`
                        }}
                      ></div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 text-center">
                    <div className="text-3xl mb-2">🎵</div>
                    <p className="text-sm">Audio visualization appears here</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Center Column - Conversation */}
          <div className="lg:w-1/2 flex flex-col">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl flex-1 flex flex-col">
              <div className="p-6 border-b border-white/20">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-white">Conversation</h2>
                  <button
                    onClick={clearConversation}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors border border-red-500/30"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto min-h-[400px]" data-testid="conversation-messages">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <div className="text-6xl mb-4">👋</div>
                    <h3 className="text-xl font-semibold mb-2 text-white">Welcome to METU!</h3>
                    <p className="mb-4">Start speaking to begin your conversation with the AI assistant.</p>
                    {!isInitialized && (
                      <div className="mt-4">
                        <div className="inline-flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
                          <span>Initializing voice services...</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                      >
                        <div
                          className={`max-w-md px-4 py-3 rounded-2xl backdrop-blur-md ${message.type === 'user'
                              ? 'bg-blue-500/20 text-blue-100 border border-blue-500/30'
                              : 'bg-purple-500/20 text-purple-100 border border-purple-500/30'
                            }`}
                        >
                          <p className="mb-1">{message.text}</p>
                          <p className="text-xs opacity-75">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Controls */}
          <div className="lg:w-1/3 flex flex-col space-y-6">
            {/* Voice Controls */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-2xl" data-testid="voice-controls">
              <h3 className="text-xl font-semibold text-white mb-4">Voice Controls</h3>

              <div className="space-y-3">
                <button
                  onClick={startListening}
                  disabled={!isInitialized || voiceState.isListening}
                  className={`w-full px-6 py-3 rounded-xl font-medium transition-all duration-200 ${!isInitialized || voiceState.isListening
                      ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed border border-gray-500/30'
                      : 'bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30 hover:scale-105'
                    }`}
                  data-testid="start-listening-button"
                >
                  🎤 Start Listening
                </button>

                <button
                  onClick={stopListening}
                  disabled={!isInitialized || !voiceState.isListening}
                  className={`w-full px-6 py-3 rounded-xl font-medium transition-all duration-200 ${!isInitialized || !voiceState.isListening
                      ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed border border-gray-500/30'
                      : 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 hover:scale-105'
                    }`}
                  data-testid="stop-listening-button"
                >
                  🛑 Stop Listening
                </button>

                <button
                  onClick={toggleSettings}
                  className="w-full px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-xl font-medium transition-all duration-200 border border-purple-500/30 hover:scale-105"
                  data-testid="settings-button"
                >
                  ⚙️ Settings
                </button>
              </div>
            </div>

            {/* Quick Settings */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-2xl" data-testid="settings-panel">
              <h3 className="text-xl font-semibold text-white mb-4">Quick Settings</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Voice Speed: {settings.voiceSpeed.toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={settings.voiceSpeed}
                    onChange={(e) => setSettings(prev => ({ ...prev, voiceSpeed: parseFloat(e.target.value) }))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                    data-testid="voice-speed-slider"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Audio Gain: {settings.audioGain.toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="2.0"
                    step="0.1"
                    value={settings.audioGain}
                    onChange={(e) => setSettings(prev => ({ ...prev, audioGain: parseFloat(e.target.value) }))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                    data-testid="audio-gain-slider"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-300">Noise Cancellation</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.noiseCancellation}
                      onChange={(e) => setSettings(prev => ({ ...prev, noiseCancellation: e.target.checked }))}
                      className="sr-only peer"
                      data-testid="noise-cancellation-toggle"
                    />
                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-300">Response Streaming</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.responseStreamingEnabled}
                      onChange={(e) => setSettings(prev => ({ ...prev, responseStreamingEnabled: e.target.checked }))}
                      className="sr-only peer"
                      data-testid="response-streaming-toggle"
                    />
                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {voiceState.error && (
          <div className="fixed bottom-4 left-4 right-4 max-w-2xl mx-auto">
            <div className="bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-200 px-6 py-4 rounded-xl shadow-2xl">
              <div className="flex items-center">
                <span className="text-2xl mr-3">⚠️</span>
                <div>
                  <p className="font-medium">Voice Service Error</p>
                  <p className="text-sm opacity-90">{voiceState.error}</p>
                </div>
                <button
                  onClick={() => setVoiceState(prev => ({ ...prev, error: null }))}
                  className="ml-auto text-red-200 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Settings Panel */}
        <AudioSettings 
          isOpen={showSettings} 
          onClose={() => setShowSettings(false)} 
        />

        {/* Footer */}
        <footer className="text-center py-6 px-4">
          <p className="text-sm text-gray-400">
            Powered by Azure OpenAI GPT-4o Realtime API | CODAI Ecosystem
          </p>
        </footer>
      </div>
    </main>
  );
}