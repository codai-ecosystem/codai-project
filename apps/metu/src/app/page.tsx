'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ContinuousListeningService, ListeningState, ConversationMessage } from '../services/voice/ContinuousListeningService';
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

export default function Home() {
  // State management
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [listeningState, setListeningState] = useState<ListeningState>({
    isActive: false,
    isDetectingVoice: false,
    isUserSpeaking: false,
    isProcessing: false,
    isAssistantSpeaking: false,
    canInterrupt: false
  });
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Service refs
  const continuousListeningRef = useRef<ContinuousListeningService | null>(null);
  const settingsRef = useRef<SettingsService | null>(null);

  // Initialize services
  useEffect(() => {
    const initializeServices = async () => {
      try {
        // Initialize settings service
        settingsRef.current = SettingsService.getInstance();

        // Initialize continuous listening service with configuration
        const continuousListeningConfig = {
          vadConfig: {
            sampleRate: 16000,
            frameSize: 512,
            aggressiveness: 2 as const,
            minSpeechLength: 250,
            maxSilenceLength: 500,
            energyThreshold: 0.01,
            bufferSize: 1024
          },
          azureOpenAI: {
            apiKey: process.env.NEXT_PUBLIC_AZURE_OPENAI_API_KEY || '',
            endpoint: process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT || '',
            deploymentName: process.env.NEXT_PUBLIC_AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o-realtime-preview',
            apiVersion: process.env.NEXT_PUBLIC_AZURE_OPENAI_API_VERSION || '2024-10-01-preview'
          },
          conversationConfig: {
            maxContextLength: 8000,
            responseTimeout: 30000,
            interruptionEnabled: true,
            autoResponse: true
          },
          audioConfig: {
            playbackVolume: 0.8,
            microphoneGain: 1.0
          }
        };

        continuousListeningRef.current = new ContinuousListeningService(continuousListeningConfig);

        // Set up event listeners
        const service = continuousListeningRef.current;

        service.on('stateChange', (newState: ListeningState) => {
          setListeningState(newState);
        });

        service.on('conversationUpdate', (message: ConversationMessage) => {
          setMessages(prev => [...prev, message]);
        });

        service.on('error', (error: Error) => {
          setError(error.message);
          console.error('Continuous listening error:', error);
        });

        // Service is ready after construction, no initialize method needed

      } catch (err) {
        console.error('Failed to initialize services:', err);
        setError('Failed to initialize voice services');
      }
    };

    initializeServices();

    // Cleanup on unmount
    return () => {
      if (continuousListeningRef.current) {
        continuousListeningRef.current.dispose();
      }
    };
  }, []);

  // Start continuous listening
  const startListening = useCallback(async () => {
    if (continuousListeningRef.current && !listeningState.isActive) {
      try {
        await continuousListeningRef.current.startListening();
        setError(null);
      } catch (err) {
        console.error('Failed to start listening:', err);
        setError('Failed to start continuous listening');
      }
    }
  }, [listeningState.isActive]);

  // Stop continuous listening
  const stopListening = useCallback(async () => {
    if (continuousListeningRef.current && listeningState.isActive) {
      try {
        await continuousListeningRef.current.stopListening();
        setError(null);
      } catch (err) {
        console.error('Failed to stop listening:', err);
        setError('Failed to stop continuous listening');
      }
    }
  }, [listeningState.isActive]);

  // Interrupt conversation
  const interruptConversation = useCallback(async () => {
    if (continuousListeningRef.current && listeningState.canInterrupt) {
      try {
        await continuousListeningRef.current.interrupt();
        setError(null);
      } catch (err) {
        console.error('Failed to interrupt conversation:', err);
        setError('Failed to interrupt conversation');
      }
    }
  }, [listeningState.canInterrupt]);

  // Clear conversation function
  const clearConversation = useCallback(() => {
    if (continuousListeningRef.current) {
      continuousListeningRef.current.clearConversationHistory();
    }
    setMessages([]);
  }, []);

  // Toggle settings function
  const toggleSettings = useCallback(() => {
    setShowSettings(prev => !prev);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20"></div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="absolute right-0 top-0 h-full w-96 bg-slate-800/95 backdrop-blur-md border-l border-white/10">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Settings</h2>
                <button
                  onClick={toggleSettings}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <AudioSettings />
            </div>
          </div>
        </div>
      )}

      <main className="relative z-10 flex min-h-screen flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-6 border-b border-white/10 backdrop-blur-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <h1 className="text-2xl font-bold text-white">METU</h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${listeningState.isActive ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
              <span className="text-sm text-gray-300">
                {listeningState.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSettings}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/40 rounded-lg backdrop-blur-sm">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Voice Status Indicator */}
          <div className="mb-8">
            <div className="relative">
              <div className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-sm border border-white/10 flex items-center justify-center transition-all duration-300 ${listeningState.isDetectingVoice ? 'scale-110 shadow-2xl shadow-blue-500/25' : 'scale-100'
                }`}>
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center transition-all duration-300 ${listeningState.isDetectingVoice ? 'animate-pulse' : ''
                  }`}>
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
              </div>

              {/* Voice Activity Indicators */}
              {listeningState.isUserSpeaking && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <span className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full">
                    You&apos;re speaking
                  </span>
                </div>
              )}

              {listeningState.isAssistantSpeaking && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <span className="px-3 py-1 bg-purple-500 text-white text-xs rounded-full">
                    METU is speaking
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Status Text */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-white mb-2">
              {listeningState.isActive
                ? listeningState.isDetectingVoice
                  ? 'Listening...'
                  : 'Ready to Listen'
                : 'Voice Assistant Inactive'
              }
            </h2>
            <p className="text-gray-400 max-w-md">
              {listeningState.isActive
                ? "I'm continuously listening for your voice. Speak naturally and I'll respond."
                : 'Click the button below to start continuous voice interaction.'
              }
            </p>
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center space-x-4 mb-8">
            <button
              onClick={listeningState.isActive ? stopListening : startListening}
              className={`px-8 py-4 rounded-xl font-semibold text-white shadow-lg transition-all duration-300 transform hover:scale-105 ${listeningState.isActive
                ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 shadow-red-500/25'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-blue-500/25'
                }`}
            >
              {listeningState.isActive ? 'Stop Listening' : 'Start Listening'}
            </button>

            {listeningState.canInterrupt && (
              <button
                onClick={interruptConversation}
                className="px-6 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-500/25 transition-all duration-300 transform hover:scale-105"
              >
                Interrupt
              </button>
            )}

            {messages.length > 0 && (
              <button
                onClick={clearConversation}
                className="px-6 py-4 rounded-xl font-semibold text-gray-300 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Clear
              </button>
            )}
          </div>

          {/* Conversation History */}
          {messages.length > 0 && (
            <div className="w-full max-w-2xl bg-slate-800/30 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Conversation</h3>
              <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-4 py-2 rounded-lg ${message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-gray-100'
                      }`}>
                      <p className="text-sm">{message.content}</p>
                      <span className="text-xs opacity-70 block mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
}
