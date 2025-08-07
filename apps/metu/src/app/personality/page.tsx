'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain,
  Heart,
  Smile,
  MessageCircle,
  User,
  Bot,
  Palette,
  Wand2,
  Settings,
  Volume2,
  Mic,
  Speaker,
  Headphones,
  Globe,
  Clock,
  Zap,
  Star,
  Award,
  Target,
  Activity,
  TrendingUp,
  Eye,
  Gauge,
  Waves,
  Plus,
  Minus,
  RotateCcw,
  Save,
  Download,
  Upload,
  Share2,
  Copy,
  Edit3,
  Trash2,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  Play,
  Pause,
  RefreshCw,
  Filter,
  Search,
  Info,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Shield,
  Lock,
  Unlock,
  Sparkles,
  Crown,
  Flame,
  Coffee,
  Moon,
  Sun,
  Music,
  Book,
  Briefcase,
  GameController2,
  Laptop,
  Smartphone,
  Monitor,
  Tablet,
  Gamepad,
  Timer,
  Calendar,
  MapPin,
  Languages,
  Smile as SmileIcon,
  Frown,
  Meh,
  Angry,
  Laugh,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

interface PersonalityTrait {
  id: string;
  name: string;
  description: string;
  value: number;
  category: 'communication' | 'behavior' | 'emotional' | 'professional';
  icon: any;
  color: string;
  examples: string[];
}

interface VoicePersonality {
  id: string;
  name: string;
  tone: string;
  pace: string;
  formality: string;
  enthusiasm: number;
  empathy: number;
  humor: number;
  professionalism: number;
  accent: string;
  pitch: string;
  examples: string[];
}

interface ConversationStyle {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  useCases: string[];
  enabled: boolean;
  customizable: boolean;
}

interface PersonalityPreset {
  id: string;
  name: string;
  description: string;
  category: 'professional' | 'casual' | 'creative' | 'academic' | 'support';
  traits: Record<string, number>;
  voiceSettings: Partial<VoicePersonality>;
  icon: any;
  color: string;
  popularity: number;
}

export default function PersonalityPage() {
  const [selectedPreset, setSelectedPreset] = useState<string | null>('professional');
  const [activeTab, setActiveTab] = useState<'traits' | 'voice' | 'conversation' | 'presets'>('traits');
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const personalityTraits: PersonalityTrait[] = [
    {
      id: 'friendliness',
      name: 'Friendliness',
      description: 'How warm and approachable the AI appears in conversations',
      value: 85,
      category: 'communication',
      icon: Heart,
      color: 'pink',
      examples: ['Warm greetings', 'Encouraging responses', 'Personal interest']
    },
    {
      id: 'formality',
      name: 'Formality',
      description: 'Level of professional language and structured communication',
      value: 70,
      category: 'professional',
      icon: Briefcase,
      color: 'blue',
      examples: ['Professional language', 'Structured responses', 'Respectful tone']
    },
    {
      id: 'enthusiasm',
      name: 'Enthusiasm',
      description: 'Energy level and excitement shown in responses',
      value: 75,
      category: 'emotional',
      icon: Zap,
      color: 'yellow',
      examples: ['Excited responses', 'Dynamic language', 'Motivational tone']
    },
    {
      id: 'patience',
      name: 'Patience',
      description: 'Willingness to repeat, clarify, and provide detailed explanations',
      value: 90,
      category: 'behavior',
      icon: Clock,
      color: 'green',
      examples: ['Detailed explanations', 'Repeated clarifications', 'Understanding tone']
    },
    {
      id: 'creativity',
      name: 'Creativity',
      description: 'Tendency to provide innovative solutions and imaginative responses',
      value: 65,
      category: 'behavior',
      icon: Palette,
      color: 'purple',
      examples: ['Creative solutions', 'Imaginative examples', 'Artistic references']
    },
    {
      id: 'humor',
      name: 'Humor',
      description: 'Use of appropriate jokes, wordplay, and light-hearted interactions',
      value: 55,
      category: 'communication',
      icon: Laugh,
      color: 'orange',
      examples: ['Appropriate jokes', 'Wordplay', 'Light-hearted comments']
    },
    {
      id: 'empathy',
      name: 'Empathy',
      description: 'Ability to understand and respond to emotional context',
      value: 88,
      category: 'emotional',
      icon: Heart,
      color: 'red',
      examples: ['Emotional understanding', 'Supportive responses', 'Compassionate tone']
    },
    {
      id: 'assertiveness',
      name: 'Assertiveness',
      description: 'Confidence in providing opinions and making recommendations',
      value: 72,
      category: 'professional',
      icon: Target,
      color: 'indigo',
      examples: ['Confident recommendations', 'Clear opinions', 'Direct communication']
    }
  ];

  const voicePersonalities: VoicePersonality[] = [
    {
      id: 'professional',
      name: 'Professional Assistant',
      tone: 'Neutral and composed',
      pace: 'Moderate',
      formality: 'Formal',
      enthusiasm: 60,
      empathy: 75,
      humor: 30,
      professionalism: 95,
      accent: 'Standard American',
      pitch: 'Medium',
      examples: [
        'Good morning. How may I assist you today?',
        'I understand your concern. Let me provide you with the information you need.',
        'Based on the data, I recommend the following course of action.'
      ]
    },
    {
      id: 'friendly',
      name: 'Friendly Companion',
      tone: 'Warm and conversational',
      pace: 'Relaxed',
      formality: 'Casual',
      enthusiasm: 85,
      empathy: 90,
      humor: 70,
      professionalism: 60,
      accent: 'Neutral',
      pitch: 'Slightly higher',
      examples: [
        'Hey there! What can I help you with today?',
        'That sounds interesting! Tell me more about it.',
        'No worries, we\'ll figure this out together!'
      ]
    },
    {
      id: 'academic',
      name: 'Academic Expert',
      tone: 'Thoughtful and analytical',
      pace: 'Deliberate',
      formality: 'Semi-formal',
      enthusiasm: 70,
      empathy: 65,
      humor: 40,
      professionalism: 85,
      accent: 'Standard',
      pitch: 'Lower',
      examples: [
        'Let\'s examine this concept from multiple perspectives.',
        'The research indicates several interesting patterns.',
        'This raises an important question about methodology.'
      ]
    }
  ];

  const conversationStyles: ConversationStyle[] = [
    {
      id: 'collaborative',
      name: 'Collaborative Problem Solving',
      description: 'Works together with users to find solutions through dialogue',
      characteristics: ['Asks clarifying questions', 'Builds on user input', 'Suggests alternatives'],
      useCases: ['Complex projects', 'Creative tasks', 'Decision making'],
      enabled: true,
      customizable: true
    },
    {
      id: 'instructional',
      name: 'Instructional Teaching',
      description: 'Provides step-by-step guidance and educational explanations',
      characteristics: ['Clear structure', 'Progressive complexity', 'Examples and practice'],
      useCases: ['Learning new skills', 'Technical training', 'Process guidance'],
      enabled: true,
      customizable: true
    },
    {
      id: 'consultative',
      name: 'Consultative Advisory',
      description: 'Acts as an expert consultant providing recommendations',
      characteristics: ['Expert insights', 'Strategic thinking', 'Best practices'],
      useCases: ['Business decisions', 'Strategic planning', 'Expert advice'],
      enabled: false,
      customizable: true
    },
    {
      id: 'supportive',
      name: 'Supportive Coaching',
      description: 'Provides emotional support and motivational guidance',
      characteristics: ['Encouraging tone', 'Personal growth focus', 'Motivational language'],
      useCases: ['Personal development', 'Goal achievement', 'Wellness support'],
      enabled: true,
      customizable: false
    }
  ];

  const personalityPresets: PersonalityPreset[] = [
    {
      id: 'professional',
      name: 'Professional Assistant',
      description: 'Ideal for business environments and formal communications',
      category: 'professional',
      traits: {
        friendliness: 70,
        formality: 95,
        enthusiasm: 60,
        patience: 85,
        creativity: 50,
        humor: 25,
        empathy: 75,
        assertiveness: 80
      },
      voiceSettings: {
        tone: 'Professional and composed',
        pace: 'Moderate',
        formality: 'Formal'
      },
      icon: Briefcase,
      color: 'blue',
      popularity: 85
    },
    {
      id: 'creative',
      name: 'Creative Partner',
      description: 'Perfect for brainstorming and innovative problem-solving',
      category: 'creative',
      traits: {
        friendliness: 85,
        formality: 40,
        enthusiasm: 90,
        patience: 80,
        creativity: 95,
        humor: 75,
        empathy: 70,
        assertiveness: 60
      },
      voiceSettings: {
        tone: 'Energetic and inspiring',
        pace: 'Variable',
        formality: 'Casual'
      },
      icon: Palette,
      color: 'purple',
      popularity: 72
    },
    {
      id: 'supportive',
      name: 'Supportive Coach',
      description: 'Designed for personal development and emotional support',
      category: 'support',
      traits: {
        friendliness: 95,
        formality: 50,
        enthusiasm: 75,
        patience: 95,
        creativity: 65,
        humor: 60,
        empathy: 95,
        assertiveness: 55
      },
      voiceSettings: {
        tone: 'Warm and encouraging',
        pace: 'Gentle',
        formality: 'Casual'
      },
      icon: Heart,
      color: 'pink',
      popularity: 78
    },
    {
      id: 'academic',
      name: 'Academic Tutor',
      description: 'Optimized for learning, research, and educational discussions',
      category: 'academic',
      traits: {
        friendliness: 75,
        formality: 80,
        enthusiasm: 70,
        patience: 90,
        creativity: 75,
        humor: 45,
        empathy: 65,
        assertiveness: 75
      },
      voiceSettings: {
        tone: 'Knowledgeable and clear',
        pace: 'Thoughtful',
        formality: 'Semi-formal'
      },
      icon: Book,
      color: 'green',
      popularity: 68
    }
  ];

  const getTraitColor = (color: string) => {
    switch (color) {
      case 'pink': return 'text-pink-600 bg-pink-100';
      case 'blue': return 'text-blue-600 bg-blue-100';
      case 'yellow': return 'text-yellow-600 bg-yellow-100';
      case 'green': return 'text-green-600 bg-green-100';
      case 'purple': return 'text-purple-600 bg-purple-100';
      case 'orange': return 'text-orange-600 bg-orange-100';
      case 'red': return 'text-red-600 bg-red-100';
      case 'indigo': return 'text-indigo-600 bg-indigo-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPresetColor = (color: string) => {
    switch (color) {
      case 'blue': return 'from-blue-500 to-blue-600';
      case 'purple': return 'from-purple-500 to-purple-600';
      case 'pink': return 'from-pink-500 to-pink-600';
      case 'green': return 'from-green-500 to-green-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const selectedPresetData = personalityPresets.find(p => p.id === selectedPreset);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                AI Personality
              </h1>
              <p className="text-gray-600 mt-1">
                Customize your AI assistant's personality and communication style
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsCustomizing(!isCustomizing)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2"
              >
                <Wand2 className="w-4 h-4" />
                <span>{isCustomizing ? 'Save Changes' : 'Customize'}</span>
              </button>
              <button className="bg-white/70 backdrop-blur-sm border border-blue-200 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200 flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white/60 backdrop-blur-sm border-b border-blue-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { name: 'Dashboard', href: '/metu', current: false },
              { name: 'Conversations', href: '/metu/conversations', current: false },
              { name: 'Training', href: '/metu/training', current: false },
              { name: 'Analytics', href: '/metu/analytics', current: false },
              { name: 'Personality', href: '/metu/personality', current: true },
              { name: 'Integrations', href: '/metu/integrations', current: false },
              { name: 'Settings', href: '/metu/settings', current: false },
            ].map((tab) => (
              <a
                key={tab.name}
                href={tab.href}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  tab.current
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </a>
            ))}
          </nav>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Personality Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100 p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {[
                { id: 'traits', name: 'Personality Traits', icon: Brain },
                { id: 'voice', name: 'Voice Settings', icon: Volume2 },
                { id: 'conversation', name: 'Conversation Style', icon: MessageCircle },
                { id: 'presets', name: 'Presets', icon: Star }
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>
            
            {selectedPresetData && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">Current:</span>
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${getPresetColor(selectedPresetData.color)}`}>
                    <selectedPresetData.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium text-gray-900">{selectedPresetData.name}</span>
                </div>
              </div>
            )}
          </div>

          {/* Personality Traits Tab */}
          {activeTab === 'traits' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {personalityTraits.map((trait) => {
                  const IconComponent = trait.icon;
                  return (
                    <div key={trait.id} className="p-4 bg-white/50 rounded-lg border border-blue-50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${getTraitColor(trait.color)}`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{trait.name}</h3>
                            <p className="text-sm text-gray-600">{trait.description}</p>
                          </div>
                        </div>
                        <span className="text-lg font-bold text-gray-900">{trait.value}%</span>
                      </div>

                      <div className="space-y-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full bg-${trait.color}-500`}
                            style={{ width: `${trait.value}%` }}
                          />
                        </div>

                        {isCustomizing && (
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={trait.value}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                        )}

                        <div className="text-xs text-gray-500">
                          <strong>Examples:</strong> {trait.examples.join(', ')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                  <Lightbulb className="w-4 h-4 text-blue-600" />
                  <span>Personality Balance Tips</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <ul className="space-y-1">
                    <li>• High formality works well for business contexts</li>
                    <li>• Balance humor with professionalism for best results</li>
                    <li>• Empathy should be high for supportive conversations</li>
                  </ul>
                  <ul className="space-y-1">
                    <li>• Creativity enhances problem-solving capabilities</li>
                    <li>• Patience is crucial for educational interactions</li>
                    <li>• Assertiveness helps in decision-making scenarios</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Voice Settings Tab */}
          {activeTab === 'voice' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  {voicePersonalities.map((voice) => (
                    <div key={voice.id} className="p-4 bg-white/50 rounded-lg border border-blue-50">
                      <h3 className="font-semibold text-gray-900 mb-2">{voice.name}</h3>
                      <p className="text-sm text-gray-600 mb-4">{voice.tone}</p>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <span className="text-xs font-medium text-gray-500">Pace:</span>
                          <div className="text-sm text-gray-900">{voice.pace}</div>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-500">Formality:</span>
                          <div className="text-sm text-gray-900">{voice.formality}</div>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-500">Accent:</span>
                          <div className="text-sm text-gray-900">{voice.accent}</div>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-500">Pitch:</span>
                          <div className="text-sm text-gray-900">{voice.pitch}</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-xs font-medium text-gray-500">Voice Characteristics:</span>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex justify-between text-sm">
                            <span>Enthusiasm:</span>
                            <span>{voice.enthusiasm}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Empathy:</span>
                            <span>{voice.empathy}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Humor:</span>
                            <span>{voice.humor}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Professional:</span>
                            <span>{voice.professionalism}%</span>
                          </div>
                        </div>
                      </div>

                      <button className="mt-4 w-full bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm font-medium flex items-center justify-center space-x-2">
                        <Play className="w-4 h-4" />
                        <span>Preview Voice</span>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="space-y-6">
                  <div className="p-4 bg-white/50 rounded-lg border border-blue-50">
                    <h3 className="font-semibold text-gray-900 mb-4">Voice Examples</h3>
                    <div className="space-y-3">
                      {voicePersonalities[0].examples.map((example, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-start justify-between">
                            <p className="text-sm text-gray-700 flex-1">{example}</p>
                            <button className="ml-2 p-1 text-gray-400 hover:text-blue-600">
                              <Play className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-white/50 rounded-lg border border-blue-50">
                    <h3 className="font-semibold text-gray-900 mb-4">Custom Voice Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Speaking Speed</label>
                        <input type="range" min="0.5" max="2" step="0.1" className="w-full" />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Slow</span>
                          <span>Normal</span>
                          <span>Fast</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Voice Pitch</label>
                        <input type="range" min="-10" max="10" step="1" className="w-full" />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Lower</span>
                          <span>Normal</span>
                          <span>Higher</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Emphasis Level</label>
                        <input type="range" min="0" max="100" step="5" className="w-full" />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Subtle</span>
                          <span>Normal</span>
                          <span>Strong</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Conversation Style Tab */}
          {activeTab === 'conversation' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {conversationStyles.map((style) => (
                  <div key={style.id} className="p-4 bg-white/50 rounded-lg border border-blue-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{style.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{style.description}</p>
                      </div>
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={style.enabled}
                          className="form-checkbox h-4 w-4 text-blue-600"
                        />
                      </label>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className="text-xs font-medium text-gray-500">Characteristics:</span>
                        <ul className="text-sm text-gray-700 mt-1 space-y-1">
                          {style.characteristics.map((char, index) => (
                            <li key={index}>• {char}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <span className="text-xs font-medium text-gray-500">Best for:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {style.useCases.map((useCase, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {useCase}
                            </span>
                          ))}
                        </div>
                      </div>

                      {style.customizable && (
                        <button className="w-full bg-purple-100 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors duration-200 text-sm font-medium">
                          Customize Style
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4 text-green-600" />
                  <span>Conversation Style Recommendations</span>
                </h3>
                <div className="text-sm text-gray-600">
                  <p className="mb-2">Based on your current personality settings, we recommend:</p>
                  <ul className="space-y-1">
                    <li>• <strong>Collaborative Problem Solving</strong> for creative tasks and brainstorming</li>
                    <li>• <strong>Instructional Teaching</strong> for learning and skill development</li>
                    <li>• <strong>Supportive Coaching</strong> for personal growth conversations</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Presets Tab */}
          {activeTab === 'presets' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {personalityPresets.map((preset) => {
                  const IconComponent = preset.icon;
                  return (
                    <div 
                      key={preset.id} 
                      className={`p-6 rounded-lg border-2 transition-all duration-300 cursor-pointer ${
                        selectedPreset === preset.id
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-blue-100 bg-white/50 hover:border-blue-200'
                      }`}
                      onClick={() => setSelectedPreset(preset.id)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-3 rounded-lg bg-gradient-to-r ${getPresetColor(preset.color)}`}>
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{preset.name}</h3>
                            <p className="text-sm text-gray-600">{preset.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm text-gray-600">{preset.popularity}%</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <span className="text-xs font-medium text-gray-500">Key Traits:</span>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {Object.entries(preset.traits).slice(0, 4).map(([trait, value]) => (
                              <div key={trait} className="flex justify-between text-sm">
                                <span className="capitalize">{trait}:</span>
                                <span className="font-medium">{value}%</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span className="text-xs font-medium text-gray-500">Voice Style:</span>
                          <p className="text-sm text-gray-700 mt-1">{preset.voiceSettings.tone}</p>
                        </div>

                        {selectedPreset === preset.id && (
                          <div className="pt-3 border-t border-blue-200">
                            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium">
                              Apply This Preset
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                  <Crown className="w-4 h-4 text-yellow-600" />
                  <span>Create Custom Preset</span>
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Save your current personality configuration as a custom preset for easy switching between different contexts.
                </p>
                <button className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg hover:bg-yellow-200 transition-colors duration-200 text-sm font-medium">
                  Create New Preset
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <span>Quick Actions</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-center">
              <Download className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">Export Settings</span>
            </button>
            <button className="p-4 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-200 text-center">
              <Upload className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">Import Settings</span>
            </button>
            <button className="p-4 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors duration-200 text-center">
              <RotateCcw className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">Reset to Default</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Modern Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white mt-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">METU Personality</h3>
              <p className="text-blue-200 mb-6 max-w-md">
                Customize your AI assistant's personality to match your communication style and preferences. 
                Create the perfect digital companion for any context.
              </p>
              <div className="flex space-x-4">
                <button className="bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-all duration-200">
                  <Brain className="w-5 h-5" />
                </button>
                <button className="bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-all duration-200">
                  <Heart className="w-5 h-5" />
                </button>
                <button className="bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-all duration-200">
                  <Wand2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Personality Features</h4>
              <ul className="space-y-2 text-blue-200">
                <li><a href="#" className="hover:text-white transition-colors duration-200">Trait Customization</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Voice Personalities</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Conversation Styles</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Preset Templates</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Customization Tools</h4>
              <ul className="space-y-2 text-blue-200">
                <li><a href="#" className="hover:text-white transition-colors duration-200">Advanced Settings</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Import/Export</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Custom Presets</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Voice Preview</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-blue-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-blue-200 text-sm">
              © 2025 METU Personality. Your AI, your way.
            </p>
            <div className="mt-4 md:mt-0">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                🎭 {selectedPresetData?.name || 'Custom'} Active
              </span>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
