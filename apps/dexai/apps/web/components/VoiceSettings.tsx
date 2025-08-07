'use client'

import React from 'react';

import { useEffect, useState } from 'react';

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

export default function VoiceSettings() {
  const [settings, setSettings] = useState<TTSSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('dexai-tts-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (error) {
        console.error('Error loading TTS settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = (newSettings: TTSSettings) => {
    setSettings(newSettings);
    localStorage.setItem('dexai-tts-settings', JSON.stringify(newSettings));
  };

  // Test TTS with current settings
  const testVoice = async () => {
    if (!settings.enabled) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: 'Salut! Aceasta este o testare a vocii românești.',
          settings,
        }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.volume = settings.volume;
        audio.play();
      }
    } catch (error) {
      console.error('Error testing voice:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Setări Pronunție AI
        </h3>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => saveSettings({ ...settings, enabled: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Activat</span>
        </label>
      </div>

      {settings.enabled && (
        <div className="space-y-4">
          {/* Voice Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Voce:
            </label>
            <select
              value={settings.voice}
              onChange={(e) => saveSettings({ ...settings, voice: e.target.value })}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="ro-RO-AlinaNeural">Alina (Feminină)</option>
              <option value="ro-RO-EmilNeural">Emil (Masculină)</option>
            </select>
          </div>

          {/* Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Viteză: {settings.rate.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={settings.rate}
              onChange={(e) => saveSettings({ ...settings, rate: parseFloat(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>Lent</span>
              <span>Rapid</span>
            </div>
          </div>

          {/* Pitch */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Înălțime: {settings.pitch.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={settings.pitch}
              onChange={(e) => saveSettings({ ...settings, pitch: parseFloat(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>Grav</span>
              <span>Acut</span>
            </div>
          </div>

          {/* Volume */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Volum: {Math.round(settings.volume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.volume}
              onChange={(e) => saveSettings({ ...settings, volume: parseFloat(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>Silențios</span>
              <span>Tare</span>
            </div>
          </div>

          {/* Test Button */}
          <div className="pt-2">
            <button
              onClick={testVoice}
              disabled={isLoading}
              className="w-full rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                  <span>Testează...</span>
                </div>
              ) : (
                '🎤 Testează Vocea'
              )}
            </button>
          </div>

          {/* Info */}
          <div className="rounded bg-blue-50 p-3 dark:bg-blue-900/20">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              💡 Utilizăm Azure OpenAI TTS pentru pronunția în română. 
              Vocile sunt optimizate pentru limba română și oferă o calitate superioară.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

