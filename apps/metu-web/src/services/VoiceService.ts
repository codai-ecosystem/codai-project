// VoiceService.ts - Next.js compatible voice recognition and synthesis

// TypeScript declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

export interface VoiceSettings {
  language: string;
  volume: number;
  rate: number;
  pitch: number;
  enabled: boolean;
}

export interface VoiceMessage {
  id: string;
  text: string;
  timestamp: Date;
  type: 'user' | 'assistant';
}

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

export class VoiceService {
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private isListening = false;
  private settings: VoiceSettings = {
    language: 'en-US',
    volume: 0.8,
    rate: 1.0,
    pitch: 1.0,
    enabled: true
  };

  private onStateChange?: (state: VoiceState) => void;
  private onMessage?: (message: VoiceMessage) => void;
  private onError?: (error: string) => void;

  constructor() {
    // Only initialize in browser environment
    if (typeof window !== 'undefined') {
      this.initializeSpeechRecognition();
      this.initializeSpeechSynthesis();
    }
  }

  private initializeSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      return;
    }

    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.recognition = new SpeechRecognitionClass();

    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = this.settings.language;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.onStateChange?.('listening');
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        const message: VoiceMessage = {
          id: Date.now().toString(),
          text: finalTranscript.trim(),
          timestamp: new Date(),
          type: 'user'
        };
        this.onMessage?.(message);
        this.onStateChange?.('processing');
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.isListening = false;
      this.onStateChange?.('error');
      this.onError?.(`Speech recognition error: ${event.error}`);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.onStateChange) {
        this.onStateChange('idle');
      }
    };
  }

  private initializeSpeechSynthesis() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    }
  }

  public setCallbacks(
    onStateChange: (state: VoiceState) => void,
    onMessage: (message: VoiceMessage) => void,
    onError: (error: string) => void
  ) {
    this.onStateChange = onStateChange;
    this.onMessage = onMessage;
    this.onError = onError;
  }

  public updateSettings(newSettings: Partial<VoiceSettings>) {
    this.settings = { ...this.settings, ...newSettings };

    if (this.recognition) {
      this.recognition.lang = this.settings.language;
    }
  }

  public startListening(): boolean {
    if (!this.settings.enabled || !this.recognition || this.isListening) {
      return false;
    }

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      this.onError?.(`Failed to start listening: ${error}`);
      return false;
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  public speak(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis || !this.settings.enabled) {
        reject(new Error('Speech synthesis not available'));
        return;
      }

      // Cancel any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.settings.language;
      utterance.volume = this.settings.volume;
      utterance.rate = this.settings.rate;
      utterance.pitch = this.settings.pitch;

      utterance.onstart = () => {
        this.onStateChange?.('speaking');
      };

      utterance.onend = () => {
        this.onStateChange?.('idle');
        resolve();
      };

      utterance.onerror = (event) => {
        this.onStateChange?.('error');
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      this.synthesis.speak(utterance);
    });
  }

  public stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.onStateChange?.('idle');
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' &&
      (('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window)) &&
      ('speechSynthesis' in window);
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];
    return this.synthesis.getVoices();
  }

  public async processUserMessage(message: string): Promise<string> {
    // Simulate AI processing - in real implementation, this would call an AI service
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Generate contextual responses
    const responses = [
      "I understand what you're saying. How can I help you further?",
      "That's interesting! Tell me more about that.",
      "I'm here to assist you. What would you like to do next?",
      "Thanks for sharing that with me. Is there anything specific you need help with?",
      "I'm processing your request. Let me provide you with the best response I can.",
      "Great question! Let me think about that for a moment and give you a helpful answer."
    ];

    // Simple context-aware responses
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! I'm METU, your AI voice assistant. I'm excited to help you today. What can I assist you with?";
    } else if (lowerMessage.includes('help')) {
      return "I'm here to help! I can assist with questions, provide information, help with tasks, or just have a conversation. What would you like to do?";
    } else if (lowerMessage.includes('weather')) {
      return "I'd love to help with weather information! While I don't have access to real-time weather data right now, I can help you find reliable weather sources or assist with other questions.";
    } else if (lowerMessage.includes('time')) {
      const now = new Date();
      return `The current time is ${now.toLocaleTimeString()}. Is there anything else you'd like to know?`;
    } else if (lowerMessage.includes('thank')) {
      return "You're very welcome! I'm always happy to help. Is there anything else you'd like to talk about?";
    }

    return responses[Math.floor(Math.random() * responses.length)];
  }

  public destroy() {
    this.stopListening();
    this.stopSpeaking();
    this.recognition = null;
    this.synthesis = null;
  }
}
