import { useState, useEffect, useCallback, useRef } from 'react';
import type { VoiceMessage, VoiceState } from './types/voice';
import './App.css';

// Settings Type
interface Settings {
  voiceEnabled: boolean;
  volume: number;
  language: string;
  theme: 'light' | 'dark';
}

// Simple Icon Components
const MicIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
);

const MicOffIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 5.586A2 2 0 015 7v6a3 3 0 104.5 2.6V17h3v-1.4A3 3 0 0012 13V7a3 3 0 10-6 0v.414L5.586 5.586zM17 12a7.98 7.98 0 01-2.07 5.24M15 12a5.99 5.99 0 01-1.07 3.44M13 12v5" />
  </svg>
);

const VolumeIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M11 5L6 9H2v6h4l5 4V5z" />
  </svg>
);

const BrainIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l7 7-7 7M13 3l7 7-7 7" />
  </svg>
);

// Voice Controls Component
const VoiceControls = ({
  voiceState,
  onToggleListening,
  onToggleSettings,
  onTestSpeak,
  isEnabled = true
}: {
  voiceState: VoiceState;
  onToggleListening: () => void;
  onToggleSettings: () => void;
  onTestSpeak?: () => void;
  isEnabled?: boolean;
}) => {
  const getVoiceIcon = () => {
    switch (voiceState) {
      case 'listening':
        return <MicIcon />;
      case 'processing':
        return <BrainIcon />;
      case 'speaking':
        return <VolumeIcon />;
      default:
        return <MicOffIcon />;
    }
  };

  const getStateText = () => {
    switch (voiceState) {
      case 'listening':
        return 'Listening...';
      case 'processing':
        return 'Processing...';
      case 'speaking':
        return 'Speaking...';
      default:
        return 'Ready to listen';
    }
  };

  const getStateColor = () => {
    switch (voiceState) {
      case 'listening':
        return 'text-green-400 border-green-500/50 bg-green-500/10';
      case 'processing':
        return 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10';
      case 'speaking':
        return 'text-blue-400 border-blue-500/50 bg-blue-500/10';
      default:
        return 'text-slate-300 border-slate-600/30 bg-slate-700/50';
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={onToggleListening}
        disabled={!isEnabled}
        className={`relative w-24 h-24 rounded-full border-2 backdrop-blur-md transition-all duration-300 ${getStateColor()} ${isEnabled ? 'hover:scale-105 active:scale-95 cursor-pointer' : 'opacity-50 cursor-not-allowed'
          } ${voiceState === 'listening' ? 'animate-pulse' : ''}`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {getVoiceIcon()}
        </div>

        {/* Pulse ring for listening state */}
        {voiceState === 'listening' && (
          <div className="absolute inset-0 rounded-full border-2 border-green-500/50 animate-ping" />
        )}
      </button>

      <div className="text-center">
        <p className={`text-sm font-medium ${getStateColor().split(' ')[0]}`}>
          {getStateText()}
        </p>

        {voiceState === 'idle' && (
          <p className="text-xs text-slate-400 mt-1">
            Press Ctrl+Space or click to activate
          </p>
        )}
      </div>

      {/* Settings Button */}
      <button
        onClick={onToggleSettings}
        className="voice-button-secondary hover:scale-105 transition-transform"
      >
        <SettingsIcon />
        <span className="ml-2">Settings</span>
      </button>

      {/* Test Speak Button */}
      {onTestSpeak && (
        <button
          onClick={onTestSpeak}
          className="voice-button-secondary hover:scale-105 transition-transform"
        >
          <VolumeIcon />
          <span className="ml-2">Test Voice</span>
        </button>
      )}
    </div>
  );
};

// Audio Visualizer Component
const AudioVisualizer = ({ isActive }: { isActive: boolean }) => {
  return (
    <div className="flex items-end justify-center gap-1 h-16">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className={`w-1 bg-gradient-to-t from-blue-500 to-blue-300 rounded-full transition-all duration-500 ${isActive ? 'audio-bar animate-pulse' : 'opacity-30'
            }`}
          style={{
            height: isActive ? `${Math.random() * 60 + 4}px` : '4px',
            animationDelay: `${i * 0.1}s`
          }}
        />
      ))}
    </div>
  );
};

// METU Character Component
const MetuCharacter = ({ state }: { state: VoiceState }) => {
  const getCharacterEmoji = () => {
    switch (state) {
      case 'listening':
        return '👂';
      case 'processing':
        return '🧠';
      case 'speaking':
        return '💬';
      default:
        return '🤖';
    }
  };

  return (
    <div className={`text-8xl mb-4 transition-transform duration-500 ${state === 'speaking' ? 'animate-bounce' : ''
      }`}>
      {getCharacterEmoji()}
    </div>
  );
};

// Mock Voice Service for Electron compatibility
class MockVoiceService {
  private onStateChange?: (state: VoiceState) => void;
  private onMessage?: (message: VoiceMessage) => void;
  private currentState: VoiceState = 'idle';

  setCallbacks(
    onStateChange: (state: VoiceState) => void,
    onMessage: (message: VoiceMessage) => void
  ) {
    this.onStateChange = onStateChange;
    this.onMessage = onMessage;
  }

  startListening(): boolean {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      this.currentState = 'listening';
      this.onStateChange?.(this.currentState);

      // Simulate voice recognition after 3 seconds
      setTimeout(() => {
        this.currentState = 'processing';
        this.onStateChange?.(this.currentState);

        setTimeout(() => {
          const message: VoiceMessage = {
            id: Date.now().toString(),
            text: 'Hello METU, how are you today?',
            timestamp: new Date(),
            type: 'user'
          };
          this.onMessage?.(message);
        }, 1000);
      }, 3000);

      return true;
    }
    return false;
  }

  stopListening() {
    this.currentState = 'idle';
    this.onStateChange?.(this.currentState);
  }

  async speak(text: string): Promise<void> {
    this.currentState = 'speaking';
    this.onStateChange?.(this.currentState);

    return new Promise((resolve) => {
      setTimeout(() => {
        this.currentState = 'idle';
        this.onStateChange?.(this.currentState);
        resolve();
      }, text.length * 50);
    });
  }

  stopSpeaking() {
    this.currentState = 'idle';
    this.onStateChange?.(this.currentState);
  }

  isSupported(): boolean {
    return typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }
}

// Main METU Application
export default function MetuVoiceAI() {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [showSettings, setShowSettings] = useState(false);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [appSettings, setAppSettings] = useState<Settings>({
    voiceEnabled: true,
    volume: 0.8,
    language: 'en-US',
    theme: 'dark'
  });

  const voiceServiceRef = useRef<MockVoiceService>(new MockVoiceService());

  // Initialize voice service
  useEffect(() => {
    const voiceService = voiceServiceRef.current;

    voiceService.setCallbacks(
      (state: VoiceState) => {
        setVoiceState(state);
      },
      async (message: VoiceMessage) => {
        setMessages(prev => [...prev, message]);

        // Simulate AI response
        setTimeout(async () => {
          const response: VoiceMessage = {
            id: (Date.now() + 1).toString(),
            text: "Hello! I'm doing great, thank you for asking. I'm here and ready to help you with any questions or tasks you might have. How can I assist you today?",
            timestamp: new Date(),
            type: 'assistant'
          };

          setMessages(prev => [...prev, response]);

          // Speak the response
          if (appSettings.voiceEnabled) {
            await voiceService.speak(response.text);
          }
        }, 1000);
      }
    );
  }, [appSettings.voiceEnabled]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.code === 'Space') {
        event.preventDefault();
        handleToggleListening();
      }

      if (event.key === 'Escape') {
        setShowSettings(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [voiceState]);

  const handleToggleListening = useCallback(() => {
    if (!voiceServiceRef.current.isSupported()) {
      alert('Voice recognition is not supported in this browser');
      return;
    }

    if (!appSettings.voiceEnabled) return;

    if (voiceState === 'idle') {
      voiceServiceRef.current.startListening();
    } else if (voiceState === 'listening') {
      voiceServiceRef.current.stopListening();
    } else if (voiceState === 'speaking') {
      voiceServiceRef.current.stopSpeaking();
    }
  }, [voiceState, appSettings.voiceEnabled]);

  const handleToggleSettings = useCallback(() => {
    setShowSettings(prev => !prev);
  }, []);

  const handleTestSpeak = useCallback(async () => {
    try {
      await voiceServiceRef.current.speak('Hello! I am METU, your voice-powered AI assistant. How can I help you today?');
    } catch (error) {
      console.error('Error during test speech:', error);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8 opacity-0 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center animate-spin-slow">
              <SparklesIcon />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              METU Voice AI
            </h1>
          </div>
          <p className="text-slate-400 text-lg">
            Intelligent Conversational Assistant
          </p>
          <div className="flex items-center justify-center gap-2 mt-2 text-sm text-slate-500">
            <span>⚡</span>
            <span>Powered by Advanced AI • Real-time Voice Recognition</span>
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Character & Voice Controls */}
          <div className="lg:col-span-1 space-y-6 opacity-0 animate-slide-in-left">
            {/* Character */}
            <div className="voice-card text-center">
              <MetuCharacter state={voiceState} />
              <h2 className="text-2xl font-bold text-slate-100 mb-2">METU</h2>
              <p className="text-slate-400">Your AI Assistant</p>
            </div>

            {/* Voice Controls */}
            <div className="voice-card">
              <VoiceControls
                voiceState={voiceState}
                onToggleListening={handleToggleListening}
                onToggleSettings={handleToggleSettings}
                onTestSpeak={handleTestSpeak}
                isEnabled={appSettings.voiceEnabled}
              />
            </div>

            {/* Audio Visualizer */}
            <div className="voice-card">
              <h3 className="text-lg font-semibold text-slate-100 mb-4 text-center">
                Audio Activity
              </h3>
              <AudioVisualizer isActive={voiceState === 'listening' || voiceState === 'speaking'} />
            </div>
          </div>

          {/* Conversation Panel */}
          <div className="lg:col-span-2 opacity-0 animate-slide-in-right">
            <div className="voice-card h-96 p-0 overflow-hidden">
              <div className="p-4 border-b border-slate-600/30 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                  <span>💬</span>
                  Conversation
                  {!voiceServiceRef.current.isSupported() && (
                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">
                      Voice not supported
                    </span>
                  )}
                </h3>
                {messages.length > 0 && (
                  <button
                    onClick={clearMessages}
                    className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="p-4 h-80 overflow-y-auto space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <div className="text-6xl mb-4 opacity-50">🤖</div>
                    <p className="text-sm">Start a conversation with METU</p>
                    {voiceServiceRef.current.isSupported() ? (
                      <p className="text-xs mt-2">Click the microphone to begin</p>
                    ) : (
                      <div className="text-center mt-2">
                        <p className="text-xs text-red-400">Voice recognition not supported in this browser</p>
                        <p className="text-xs text-slate-500">Try using Chrome, Edge, or Safari</p>
                      </div>
                    )}
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex opacity-0 animate-message-in ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] p-3 rounded-lg transition-all duration-300 hover:scale-102 ${message.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-slate-100'
                        }`}>
                        <div className="flex items-start gap-2">
                          <span className="text-lg">{message.type === 'user' ? '👤' : '🤖'}</span>
                          <div>
                            <p className="text-sm">{message.text}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div
              className="voice-card max-w-md w-full max-h-[80vh] overflow-y-auto animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-100">Settings</h2>
                <button
                  onClick={handleToggleSettings}
                  className="text-slate-400 hover:text-slate-200 text-2xl transition-colors hover:scale-110"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-slate-200">Voice Recognition</label>
                  <button
                    onClick={() => setAppSettings(prev => ({ ...prev, voiceEnabled: !prev.voiceEnabled }))}
                    className={`w-12 h-6 rounded-full transition-all duration-300 ${appSettings.voiceEnabled ? 'bg-blue-500' : 'bg-slate-600'
                      }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 ${appSettings.voiceEnabled ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                  </button>
                </div>

                <div>
                  <label className="text-slate-200 block mb-2">Volume: {Math.round(appSettings.volume * 100)}%</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={appSettings.volume}
                    onChange={(e) => setAppSettings(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
                    className="w-full accent-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-200 block mb-2">Language</label>
                  <select
                    value={appSettings.language}
                    onChange={(e) => setAppSettings(prev => ({ ...prev, language: e.target.value }))}
                    className="voice-input w-full"
                  >
                    <option value="en-US">English (US)</option>
                    <option value="en-GB">English (UK)</option>
                    <option value="es-ES">Spanish</option>
                    <option value="fr-FR">French</option>
                    <option value="de-DE">German</option>
                    <option value="ja-JP">Japanese</option>
                    <option value="zh-CN">Chinese</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
