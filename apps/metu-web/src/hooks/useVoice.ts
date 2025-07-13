// useVoice.ts - Custom hook for voice functionality
import { useState, useEffect, useCallback, useRef } from 'react';
import { VoiceService, VoiceSettings, VoiceMessage, VoiceState } from '../services/VoiceService';

export interface UseVoiceOptions {
  autoStart?: boolean;
  initialSettings?: Partial<VoiceSettings>;
}

export interface UseVoiceReturn {
  // State
  voiceState: VoiceState;
  messages: VoiceMessage[];
  isSupported: boolean;
  settings: VoiceSettings;

  // Actions
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string) => Promise<void>;
  stopSpeaking: () => void;
  updateSettings: (newSettings: Partial<VoiceSettings>) => void;
  clearMessages: () => void;

  // Voice service instance
  voiceService: VoiceService | null;
}

export function useVoice(options: UseVoiceOptions = {}): UseVoiceReturn {
  const { autoStart = false, initialSettings = {} } = options;

  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [isSupported, setIsSupported] = useState(false);
  const [settings, setSettings] = useState<VoiceSettings>({
    language: 'en-US',
    volume: 0.8,
    rate: 1.0,
    pitch: 1.0,
    enabled: true,
    ...initialSettings
  });

  const voiceServiceRef = useRef<VoiceService | null>(null);
  const isInitializedRef = useRef(false);

  // Initialize voice service
  useEffect(() => {
    if (typeof window === 'undefined' || isInitializedRef.current) return;

    const voiceService = new VoiceService();
    voiceServiceRef.current = voiceService;

    setIsSupported(voiceService.isSupported());

    // Set up callbacks
    voiceService.setCallbacks(
      (state: VoiceState) => {
        setVoiceState(state);
      },
      async (message: VoiceMessage) => {
        // Add user message
        setMessages(prev => [...prev, message]);

        try {
          // Process message and get AI response
          const response = await voiceService.processUserMessage(message.text);

          // Add AI response message
          const aiMessage: VoiceMessage = {
            id: (Date.now() + 1).toString(),
            text: response,
            timestamp: new Date(),
            type: 'assistant'
          };

          setMessages(prev => [...prev, aiMessage]);

          // Speak the response
          if (settings.enabled) {
            await voiceService.speak(response);
          }
        } catch (error) {
          console.error('Error processing voice message:', error);
          setVoiceState('error');
        }
      },
      (error: string) => {
        console.error('Voice service error:', error);
        setVoiceState('error');
      }
    );

    // Update settings
    voiceService.updateSettings(settings);

    isInitializedRef.current = true;

    // Cleanup
    return () => {
      voiceService.destroy();
      voiceServiceRef.current = null;
      isInitializedRef.current = false;
    };
  }, []);

  // Update settings when they change
  useEffect(() => {
    if (voiceServiceRef.current) {
      voiceServiceRef.current.updateSettings(settings);
    }
  }, [settings]);

  const startListening = useCallback(() => {
    if (voiceServiceRef.current && voiceState === 'idle') {
      const success = voiceServiceRef.current.startListening();
      if (!success) {
        setVoiceState('error');
      }
    }
  }, [voiceState]);

  const stopListening = useCallback(() => {
    if (voiceServiceRef.current) {
      voiceServiceRef.current.stopListening();
    }
  }, []);

  const speak = useCallback(async (text: string): Promise<void> => {
    if (voiceServiceRef.current) {
      try {
        await voiceServiceRef.current.speak(text);
      } catch (error) {
        console.error('Error speaking:', error);
        setVoiceState('error');
        throw error;
      }
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if (voiceServiceRef.current) {
      voiceServiceRef.current.stopSpeaking();
    }
  }, []);

  const updateSettings = useCallback((newSettings: Partial<VoiceSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Auto-start listening if requested
  useEffect(() => {
    if (autoStart && isSupported && voiceState === 'idle' && isInitializedRef.current) {
      startListening();
    }
  }, [autoStart, isSupported, voiceState, startListening]);

  return {
    voiceState,
    messages,
    isSupported,
    settings,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    updateSettings,
    clearMessages,
    voiceService: voiceServiceRef.current
  };
}
