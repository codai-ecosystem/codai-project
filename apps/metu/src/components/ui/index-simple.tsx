// 🎯 METU UI COMPONENTS - Simple Local Version
// Voice AI-specific components with inline styles for immediate testing

import React from 'react'

// ==================== UTILITY FUNCTIONS ====================

export function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ')
}

// ==================== BASIC UI COMPONENTS ====================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading,
  className,
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean
  hover?: boolean
}

export const Card: React.FC<CardProps> = ({
  children,
  glass,
  hover,
  className,
  ...props
}) => {
  const baseClasses = 'rounded-xl border p-6 transition-all duration-200'
  const glassClasses = glass
    ? 'bg-white/10 backdrop-blur-md border-white/20'
    : 'bg-white border-gray-200'
  const hoverClasses = hover ? 'hover:shadow-lg hover:-translate-y-1' : ''

  return (
    <div
      className={cn(baseClasses, glassClasses, hoverClasses, className)}
      {...props}
    >
      {children}
    </div>
  )
}

// ==================== VOICE INTERFACE COMPONENTS ====================

interface VoiceControlsProps {
  isListening: boolean
  onStartListening: () => void
  onStopListening: () => void
  disabled?: boolean
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  isListening,
  onStartListening,
  onStopListening,
  disabled
}) => {
  return (
    <div className="flex items-center gap-4">
      <Button
        onClick={isListening ? onStopListening : onStartListening}
        variant={isListening ? 'danger' : 'primary'}
        size="lg"
        disabled={disabled}
        className={cn(
          'w-16 h-16 rounded-full text-2xl shadow-lg hover:shadow-xl transition-all duration-300',
          isListening && 'animate-pulse'
        )}
      >
        {isListening ? '⏹️' : '🎤'}
      </Button>

      <span className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium',
        isListening ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
      )}>
        <div className={cn(
          'w-2 h-2 rounded-full',
          isListening ? 'bg-emerald-500' : 'bg-gray-500'
        )} />
        {isListening ? 'Listening' : 'Idle'}
      </span>
    </div>
  )
}

// ==================== CHARACTER STATE INDICATOR ====================

interface CharacterStateProps {
  state: 'idle' | 'listening' | 'speaking' | 'processing'
  size?: 'sm' | 'md' | 'lg'
}

export const CharacterState: React.FC<CharacterStateProps> = ({ state, size = 'md' }) => {
  const stateConfig = {
    idle: { color: 'bg-gray-400', animation: '', label: 'Idle' },
    listening: { color: 'bg-blue-500', animation: 'animate-pulse', label: 'Listening' },
    speaking: { color: 'bg-green-500', animation: 'animate-bounce', label: 'Speaking' },
    processing: { color: 'bg-yellow-500', animation: 'animate-spin', label: 'Processing' },
  }

  const config = stateConfig[state]
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  }

  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        'rounded-full transition-colors duration-300',
        sizeClasses[size],
        config.color,
        config.animation
      )} />
      <span className="text-sm font-medium text-gray-700 capitalize">
        {config.label}
      </span>
    </div>
  )
}

// ==================== REALTIME TEXT DISPLAY ====================

interface RealtimeTextDisplayProps {
  text: string
  confidence: number
  isListening: boolean
  className?: string
}

export const RealtimeTextDisplay: React.FC<RealtimeTextDisplayProps> = ({
  text,
  confidence,
  isListening,
  className
}) => {
  return (
    <Card
      glass
      className={cn(
        'min-h-[60px] flex items-center justify-center transition-all duration-300',
        isListening ? 'border-blue-500/50 bg-blue-50/20' : 'border-gray-200',
        className
      )}
    >
      <div className="text-center space-y-2">
        {text ? (
          <p className="text-lg font-medium text-gray-900 animate-fade-in">
            {text}
          </p>
        ) : (
          <p className="text-gray-500">
            {isListening ? 'Listening... Say something!' : 'Press the microphone to start'}
          </p>
        )}

        {text && (
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs text-gray-500">Confidence:</span>
            <div className="flex-1 bg-gray-200 rounded-full h-1.5 max-w-[100px]">
              <div
                style={{ width: `${confidence * 100}%` }}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  confidence > 0.8 ? 'bg-green-500' :
                    confidence > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                )}
              />
            </div>
            <span className="text-xs text-gray-600">{Math.round(confidence * 100)}%</span>
          </div>
        )}
      </div>
    </Card>
  )
}

// ==================== AUDIO VISUALIZER ====================

interface AudioVisualizerProps {
  audioData: number[]
  isListening: boolean
  isSpeaking: boolean
  className?: string
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  audioData,
  isListening,
  isSpeaking,
  className
}) => {
  return (
    <Card className={cn('p-4 bg-gradient-to-r from-blue-50 to-purple-50', className)}>
      <div className="flex items-end justify-center space-x-1 h-16">
        {audioData.map((value, index) => (
          <div
            key={index}
            style={{
              height: Math.max(4, value * 60),
              backgroundColor: isSpeaking ? '#10b981' : isListening ? '#3b82f6' : '#6b7280'
            }}
            className="w-2 rounded-full transition-all duration-100"
          />
        ))}
      </div>

      <div className="text-center mt-3">
        <p className="text-xs text-gray-600">
          {isSpeaking ? 'AI Speaking' : isListening ? 'Audio Input' : 'Silent'}
        </p>
      </div>
    </Card>
  )
}

// ==================== METU CHARACTER ENHANCED ====================

interface MetuCharacterProps {
  state: 'idle' | 'listening' | 'speaking' | 'processing'
  audioActivity: number
  className?: string
}

export const MetuCharacter: React.FC<MetuCharacterProps> = ({
  state,
  audioActivity,
  className
}) => {
  const getCharacterConfig = () => {
    switch (state) {
      case 'listening':
        return {
          scale: 1 + audioActivity * 0.1,
          gradient: 'from-blue-400 to-blue-600',
          shadow: 'shadow-blue-500/50',
          animation: 'animate-pulse'
        }
      case 'speaking':
        return {
          scale: 1 + audioActivity * 0.15,
          gradient: 'from-green-400 to-green-600',
          shadow: 'shadow-green-500/50',
          animation: 'animate-bounce'
        }
      case 'processing':
        return {
          scale: 1.05,
          gradient: 'from-yellow-400 to-yellow-600',
          shadow: 'shadow-yellow-500/50',
          animation: 'animate-spin'
        }
      default:
        return {
          scale: 1,
          gradient: 'from-gray-400 to-gray-600',
          shadow: 'shadow-gray-500/30',
          animation: ''
        }
    }
  }

  const config = getCharacterConfig()

  return (
    <div className={cn('relative', className)}>
      <div
        style={{ transform: `scale(${config.scale})` }}
        className={cn(
          'w-32 h-32 rounded-full bg-gradient-to-br transition-transform duration-200',
          config.gradient,
          config.shadow,
          'shadow-2xl border-4 border-white',
          'flex items-center justify-center text-4xl',
          config.animation
        )}
      >
        🤖
      </div>

      {/* Audio ring visualization */}
      {(state === 'listening' || state === 'speaking') && (
        <div
          style={{
            transform: 'scale(1.2)',
            opacity: 0.6,
            animation: 'ring-pulse 1.5s infinite ease-in-out'
          }}
          className={cn(
            'absolute inset-0 rounded-full border-2',
            state === 'listening' ? 'border-blue-400' : 'border-green-400'
          )}
        />
      )}
    </div>
  )
}

// ==================== CONVERSATION PANEL ====================

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  confidence?: number
}

interface ConversationPanelProps {
  isOpen: boolean
  onToggle: () => void
  messages: Message[]
  onClearHistory: () => void
  onExportHistory: () => void
}

export const ConversationPanel: React.FC<ConversationPanelProps> = ({
  isOpen,
  onToggle,
  messages,
  onClearHistory,
  onExportHistory
}) => {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onToggle}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-96 bg-white border-l border-gray-200 z-50 p-6 overflow-y-auto">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Conversation History</h2>
            <Button variant="ghost" size="sm" onClick={onToggle}>
              ✕
            </Button>
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {messages.length} messages
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onExportHistory}>
                Export
              </Button>
              <Button variant="danger" size="sm" onClick={onClearHistory}>
                Clear
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="space-y-3">
            {messages.map((message) => (
              <Card
                key={message.id}
                className={cn(
                  'p-3',
                  message.type === 'user'
                    ? 'bg-blue-50 border-blue-200 ml-8'
                    : 'bg-gray-50 border-gray-200 mr-8'
                )}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {message.type === 'user' ? 'You' : 'METU'}
                    </p>
                    <p className="text-gray-700">{message.content}</p>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    {message.timestamp.toLocaleTimeString()}
                    {message.confidence && (
                      <div className="mt-1">
                        {Math.round(message.confidence * 100)}%
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}

            {messages.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No conversations yet. Start talking!
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// ==================== SETTINGS PANEL ====================

interface SettingsData {
  language: string
  confidenceThreshold: number
  autoStartListening: boolean
  enableNotifications: boolean
  theme: 'light' | 'dark' | 'auto'
  voiceSpeed: number
  enableKeywordWakeup: boolean
  wakeupKeyword: string
  selectedInputDevice: string
  selectedOutputDevice: string
  audioGain: number
  noiseCancellation: boolean
  echoCancellation: boolean
}

interface SettingsPanelProps {
  isOpen: boolean
  onToggle: () => void
  settings: SettingsData
  onSettingsChange: (settings: SettingsData) => void
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onToggle,
  settings,
  onSettingsChange
}) => {
  const [activeTab, setActiveTab] = React.useState('general')

  const updateSetting = <K extends keyof SettingsData>(
    key: K,
    value: SettingsData[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value })
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onToggle}
      />

      {/* Panel */}
      <div className="fixed top-0 left-0 h-full w-96 bg-white border-r border-gray-200 z-50 p-6 overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">METU Settings</h2>
            <Button variant="ghost" size="sm" onClick={onToggle}>
              ✕
            </Button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'general', label: 'General', icon: '⚙️' },
                { id: 'voice', label: 'Voice', icon: '🎤' },
                { id: 'audio', label: 'Audio', icon: '🔊' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200',
                    'flex items-center gap-2',
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Settings Content */}
          <div className="space-y-4">
            {activeTab === 'general' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Language
                  </label>
                  <input
                    type="text"
                    value={settings.language}
                    onChange={(e) => updateSetting('language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confidence Threshold: {Math.round(settings.confidenceThreshold * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.confidenceThreshold}
                    onChange={(e) => updateSetting('confidenceThreshold', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.autoStartListening}
                    onChange={(e) => updateSetting('autoStartListening', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Auto-start listening</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.enableNotifications}
                    onChange={(e) => updateSetting('enableNotifications', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable notifications</span>
                </label>
              </div>
            )}

            {activeTab === 'voice' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Voice Speed: {settings.voiceSpeed}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={settings.voiceSpeed}
                    onChange={(e) => updateSetting('voiceSpeed', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.enableKeywordWakeup}
                    onChange={(e) => updateSetting('enableKeywordWakeup', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable keyword wakeup</span>
                </label>

                {settings.enableKeywordWakeup && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Wakeup Keyword
                    </label>
                    <input
                      type="text"
                      value={settings.wakeupKeyword}
                      onChange={(e) => updateSetting('wakeupKeyword', e.target.value)}
                      placeholder="e.g., Hey METU"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'audio' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Audio Gain: {Math.round(settings.audioGain * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={settings.audioGain}
                    onChange={(e) => updateSetting('audioGain', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.noiseCancellation}
                    onChange={(e) => updateSetting('noiseCancellation', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Noise cancellation</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.echoCancellation}
                    onChange={(e) => updateSetting('echoCancellation', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Echo cancellation</span>
                </label>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="ghost" onClick={onToggle}>
              Close
            </Button>
            <Button variant="primary" onClick={onToggle}>
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
