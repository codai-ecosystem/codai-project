'use client';

import { useCallback, useEffect, useState } from 'react';

export interface TTSSettings {
  enabled: boolean;
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
  language: string;
}

const DEFAULT_SETTINGS: TTSSettings = {
  enabled: true,
  voice: 'ro-RO-AlinaNeural',
  rate: 1.0,
  pitch: 1.0,
  volume: 0.8,
  language: 'ro-RO',
};

export default function useTTS() {
  const [settings, setSettings] = useState<TTSSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load settings from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('dexai-tts-settings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        } catch (error) {
          console.error('Error loading TTS settings:', error);
        }
      }
    }
  }, []);

  // Save settings to localStorage
  const updateSettings = useCallback((newSettings: Partial<TTSSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('dexai-tts-settings', JSON.stringify(updatedSettings));
    }
  }, [settings]);

  // Speak text using Azure OpenAI TTS
  const speakText = useCallback(async (text: string) => {
    if (!settings.enabled || !text.trim()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          voice: settings.voice,
          speed: settings.rate,
          pitch: settings.pitch,
          language: settings.language,
        }),
      });

      if (!response.ok) {
        throw new Error(`TTS API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Check if there's an error in the response
      if (data.error) {
        console.warn('TTS service unavailable:', data.error);
        // Fall back to browser speech synthesis
        throw new Error(data.error);
      }
      
      // Check if audio data is available
      if (!data.audioBase64 || data.audioBase64.length === 0) {
        console.warn('No audio data received from TTS service');
        throw new Error('No audio data received');
      }

      // Convert base64 to blob
      const audioData = atob(data.audioBase64);
      const audioArray = new Uint8Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        audioArray[i] = audioData.charCodeAt(i);
      }
      const audioBlob = new Blob([audioArray], { type: 'audio/mp3' });
      
      // Create audio URL and play
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      // Apply volume setting
      audio.volume = settings.volume;
      
      // Play audio
      await audio.play();
      
      // Clean up URL after playing
      audio.addEventListener('ended', () => {
        URL.revokeObjectURL(audioUrl);
      });

    } catch (error) {
      console.error('TTS Error:', error);
      setError(error instanceof Error ? error.message : 'Unknown TTS error');
      
      // Fallback to browser's built-in speech synthesis if available
      if ('speechSynthesis' in window && text.length < 200) {
        try {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'ro-RO';
          utterance.rate = settings.rate;
          utterance.pitch = settings.pitch;
          utterance.volume = settings.volume;
          
          speechSynthesis.speak(utterance);
        } catch (fallbackError) {
          console.error('Fallback TTS also failed:', fallbackError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [settings]);

  // Stop any ongoing speech
  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    setIsLoading(false);
  }, []);

  // Test the TTS with a sample phrase
  const testTTS = useCallback(async () => {
    await speakText('Salut! Aceasta este o testare a vocii românești.');
  }, [speakText]);

  return {
    settings,
    updateSettings,
    speakText,
    stopSpeaking,
    testTTS,
    isLoading,
    error,
    isEnabled: settings.enabled,
  };
}
