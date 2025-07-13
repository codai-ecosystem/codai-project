'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Voice State Type
type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

// Message Type
interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Settings Type
interface Settings {
  voiceEnabled: boolean;
  volume: number;
  language: string;
  theme: 'light' | 'dark';
}

// Simple Icon Components (to avoid the lucide-react type issues)
const MicIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
);

const MicOffIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 5.586l12.828 12.828M19 11a7 7 0 01-1.71 4.584m-1.007.5A6.965 6.965 0 0112 18m0 0c-1.732 0-3.383-.532-4.766-1.439M12 18v4m0 0H8m4 0h4M9.88 9.88A3 3 0 1012 6v.17M15 11a3 3 0 01-.17 1" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const BrainIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const VolumeIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M11 5L6 9H2v6h4l5 4V5z" />
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l1.5 5L12 7l-5.5 1.5L5 14l-1.5-5L-2 8l5.5-1.5L5 3zM19 12l-1 3-3-1 3-1 1-3z" />
  </svg>
);

// Voice Controls Component
const VoiceControls = ({ 
  voiceState, 
  onToggleListening, 
  onToggleSettings,
  isEnabled = true 
}: {
  voiceState: VoiceState;
  onToggleListening: () => void;
  onToggleSettings: () => void;
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
        return 'Click to start';
    }
  };

  const getStateColor = () => {
    switch (voiceState) {
      case 'listening':
        return 'text-green-300 border-green-500/30 bg-green-500/10 voice-glow';
      case 'processing':
        return 'text-blue-300 border-blue-500/30 bg-blue-500/10 voice-glow-blue';
      case 'speaking':
        return 'text-purple-300 border-purple-500/30 bg-purple-500/10 voice-glow-purple';
      default:
        return 'text-slate-300 border-slate-600/30 bg-slate-700/50';
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.button
        onClick={onToggleListening}
        disabled={!isEnabled}
        className={`relative w-24 h-24 rounded-full border-2 backdrop-blur-md transition-all duration-300 ${getStateColor()} ${
          isEnabled ? 'hover:scale-105 active:scale-95 cursor-pointer' : 'opacity-50 cursor-not-allowed'
        }`}
        whileHover={isEnabled ? { scale: 1.05 } : {}}
        whileTap={isEnabled ? { scale: 0.95 } : {}}
        animate={voiceState === 'listening' ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.2 }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {getVoiceIcon()}
        </div>
        
        {/* Pulse animation for listening state */}
        {voiceState === 'listening' && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-green-500/50"
            animate={{ scale: [1, 1.5, 2], opacity: [0.5, 0.2, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.button>

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
      <motion.button
        onClick={onToggleSettings}
        className="voice-button-secondary"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <SettingsIcon />
        <span className="ml-2">Settings</span>
      </motion.button>
    </div>
  );
};

// Audio Visualizer Component
const AudioVisualizer = ({ isActive }: { isActive: boolean }) => {
  return (
    <div className="flex items-end justify-center gap-1 h-16">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className={`w-1 bg-gradient-to-t from-primary-500 to-primary-300 rounded-full ${
            isActive ? 'audio-bar' : 'opacity-30'
          }`}
          initial={{ height: 4 }}
          animate={isActive ? {
            height: [4, Math.random() * 40 + 8, 4],
            opacity: [0.3, 1, 0.3]
          } : { height: 4, opacity: 0.3 }}
          transition={{
            duration: 0.5 + Math.random() * 0.5,
            repeat: isActive ? Infinity : 0,
            ease: "easeInOut",
            delay: i * 0.05
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
        return '🗣️';
      default:
        return '🤖';
    }
  };

  return (
    <motion.div
      className="text-8xl mb-4"
      animate={state === 'speaking' ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 0.5, repeat: state === 'speaking' ? Infinity : 0 }}
    >
      {getCharacterEmoji()}
    </motion.div>
  );
};

// Main METU Application
export default function MetuVoiceAI() {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [showSettings, setShowSettings] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [settings, setSettings] = useState<Settings>({
    voiceEnabled: true,
    volume: 0.8,
    language: 'en-US',
    theme: 'dark'
  });

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
    if (!settings.voiceEnabled) return;

    if (voiceState === 'idle') {
      setVoiceState('listening');
      
      // Simulate voice recognition flow
      setTimeout(() => {
        setVoiceState('processing');
        
        // Add user message
        const userMessage: Message = {
          id: Date.now().toString(),
          type: 'user',
          content: "Hello METU, how are you today?",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        
        setTimeout(() => {
          setVoiceState('speaking');
          
          // Add assistant response
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: "Hello! I'm doing great, thank you for asking. I'm here and ready to help you with any questions or tasks you might have. How can I assist you today?",
            timestamp: new Date()
          };
          setMessages(prev => [...prev, assistantMessage]);
          
          setTimeout(() => {
            setVoiceState('idle');
          }, 3000);
        }, 2000);
      }, 2000);
    } else if (voiceState === 'listening') {
      setVoiceState('idle');
    }
  }, [voiceState, settings.voiceEnabled]);

  const handleToggleSettings = useCallback(() => {
    setShowSettings(prev => !prev);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.header 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <SparklesIcon />
            </motion.div>
            <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 bg-clip-text text-transparent">
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
        </motion.header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Character & Voice Controls */}
          <motion.div 
            className="lg:col-span-1 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
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
                isEnabled={settings.voiceEnabled}
              />
            </div>

            {/* Audio Visualizer */}
            <div className="voice-card">
              <h3 className="text-lg font-semibold text-slate-100 mb-4 text-center">
                Audio Activity
              </h3>
              <AudioVisualizer isActive={voiceState === 'listening' || voiceState === 'speaking'} />
            </div>
          </motion.div>

          {/* Conversation Panel */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="voice-card h-96 p-0 overflow-hidden">
              <div className="p-4 border-b border-slate-600/30">
                <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                  <span>💬</span>
                  Conversation
                </h3>
              </div>
              
              <div className="p-4 h-80 overflow-y-auto space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <div className="text-6xl mb-4 opacity-50">🤖</div>
                    <p className="text-sm">Start a conversation with METU</p>
                    <p className="text-xs mt-2">Click the microphone to begin</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex gap-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                            message.type === 'user' 
                              ? 'bg-primary-500/20 text-primary-300' 
                              : 'bg-slate-700/50 text-slate-300'
                          }`}>
                            {message.type === 'user' ? '👤' : '🤖'}
                          </div>
                          
                          <div className={`rounded-lg p-3 ${
                            message.type === 'user'
                              ? 'bg-primary-500/20 text-primary-100 border border-primary-500/30'
                              : 'bg-slate-700/50 text-slate-100 border border-slate-600/30'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs opacity-60 mt-1">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
            >
              <motion.div
                className="voice-card max-w-md w-full"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-slate-100">Settings</h3>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-200">Voice Recognition</label>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, voiceEnabled: !prev.voiceEnabled }))}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        settings.voiceEnabled ? 'bg-primary-500' : 'bg-slate-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        settings.voiceEnabled ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>

                  <div>
                    <label className="text-slate-200 block mb-2">Volume: {Math.round(settings.volume * 100)}%</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.volume}
                      onChange={(e) => setSettings(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
                      className="w-full accent-primary-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-200 block mb-2">Language</label>
                    <select
                      value={settings.language}
                      onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
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
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.footer 
          className="text-center mt-12 text-slate-500 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <p>METU Voice AI • Next.js + Tailwind CSS • Built with ❤️</p>
        </motion.footer>
      </div>
    </div>
  );
}
