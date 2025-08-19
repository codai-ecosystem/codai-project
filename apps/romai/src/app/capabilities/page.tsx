'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Zap,
  Globe,
  MessageSquare,
  FileText,
  Search,
  Lightbulb,
  Target,
  Cpu,
  Database,
  Eye,
  Mic,
  Image,
  Video,
  Music,
  Code,
  BookOpen,
  Calculator,
  PieChart,
  TrendingUp,
  Shield,
  Clock,
  Infinity,
  Sparkles,
  Flag,
  Heart,
  Star,
  Award,
  Rocket,
  Gem,
  Crown,
  FlaskConical,
  Atom,
  Dna,
  Waves,
  CircuitBoard
} from 'lucide-react';

interface Capability {
  id: string;
  name: string;
  description: string;
  category: string;
  accuracy: number;
  cultural_accuracy: number;
  speed: number;
  status: 'active' | 'beta' | 'coming_soon';
  icon: React.ElementType;
  examples: string[];
  technical_details: {
    model_type: string;
    parameters: string;
    training_data: string;
    processing_time: string;
  };
}

interface CapabilityCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  color: string;
  capabilities: Capability[];
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  icon: React.ElementType;
  description: string;
}

export default function Capabilities() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCapability, setSelectedCapability] = useState<Capability | null>(null);

  const performanceMetrics: PerformanceMetric[] = [
    {
      name: 'Overall AGI Score',
      value: 94.8,
      unit: '%',
      trend: 'up',
      icon: Brain,
      description: 'Comprehensive artificial general intelligence performance'
    },
    {
      name: 'Romanian Processing',
      value: 97.2,
      unit: '%',
      trend: 'up',
      icon: Flag,
      description: 'Romanian language understanding and generation accuracy'
    },
    {
      name: 'Cultural Intelligence',
      value: 92.6,
      unit: '%',
      trend: 'up',
      icon: Heart,
      description: 'Understanding of Romanian cultural context and nuances'
    },
    {
      name: 'Reasoning Speed',
      value: 1.3,
      unit: 'ms',
      trend: 'down',
      icon: Zap,
      description: 'Average response time for complex reasoning tasks'
    },
    {
      name: 'Multi-Modal Integration',
      value: 89.4,
      unit: '%',
      trend: 'up',
      icon: Cpu,
      description: 'Cross-modal understanding and processing capability'
    },
    {
      name: 'Learning Efficiency',
      value: 96.1,
      unit: '%',
      trend: 'up',
      icon: TrendingUp,
      description: 'Ability to learn and adapt from new information'
    }
  ];

  const capabilityCategories: CapabilityCategory[] = [
    {
      id: 'language',
      name: 'Language Processing',
      icon: MessageSquare,
      description: 'Advanced Romanian and multilingual capabilities',
      color: 'from-red-500 to-red-600',
      capabilities: [
        {
          id: 'romanian_nlp',
          name: 'Romanian Natural Language Processing',
          description: 'Deep understanding of Romanian grammar, syntax, and semantics',
          category: 'language',
          accuracy: 97.2,
          cultural_accuracy: 96.8,
          speed: 98.5,
          status: 'active',
          icon: Flag,
          examples: [
            'Complex Romanian text analysis and summarization',
            'Romanian poetry and literature generation',
            'Cultural context interpretation in Romanian texts',
            'Regional dialect and colloquialism understanding'
          ],
          technical_details: {
            model_type: 'Transformer + Cultural Layers',
            parameters: '2.1B dedicated Romanian parameters',
            training_data: '847M Romanian cultural expressions',
            processing_time: '1.2ms average'
          }
        },
        {
          id: 'translation',
          name: 'Advanced Translation Engine',
          description: 'Context-aware translation preserving cultural nuances',
          category: 'language',
          accuracy: 95.8,
          cultural_accuracy: 94.2,
          speed: 97.1,
          status: 'active',
          icon: Globe,
          examples: [
            'Romanian ↔ English with cultural preservation',
            'Technical document translation',
            'Literary translation maintaining style',
            'Real-time conversation translation'
          ],
          technical_details: {
            model_type: 'Neural Machine Translation',
            parameters: '1.8B translation parameters',
            training_data: 'Parallel corpora + cultural alignment',
            processing_time: '0.8ms per token'
          }
        },
        {
          id: 'conversation',
          name: 'Intelligent Conversation',
          description: 'Natural, context-aware Romanian conversations',
          category: 'language',
          accuracy: 94.6,
          cultural_accuracy: 93.1,
          speed: 96.8,
          status: 'active',
          icon: MessageSquare,
          examples: [
            'Long-form Romanian conversations',
            'Cultural topic discussions',
            'Professional communication assistance',
            'Educational dialogue systems'
          ],
          technical_details: {
            model_type: 'Conversational AI',
            parameters: '1.5B dialogue parameters',
            training_data: 'Romanian conversation datasets',
            processing_time: '1.1ms response time'
          }
        }
      ]
    },
    {
      id: 'reasoning',
      name: 'Advanced Reasoning',
      icon: Brain,
      description: 'Complex problem-solving and logical reasoning',
      color: 'from-yellow-500 to-yellow-600',
      capabilities: [
        {
          id: 'logical_reasoning',
          name: 'Logical & Mathematical Reasoning',
          description: 'Advanced logical problem-solving and mathematical computation',
          category: 'reasoning',
          accuracy: 96.4,
          cultural_accuracy: 91.2,
          speed: 94.7,
          status: 'active',
          icon: Calculator,
          examples: [
            'Complex mathematical proofs',
            'Logical puzzle solving',
            'Statistical analysis and interpretation',
            'Romanian educational problem-solving'
          ],
          technical_details: {
            model_type: 'Reasoning-Enhanced Transformer',
            parameters: '1.2B reasoning parameters',
            training_data: 'Mathematical and logical datasets',
            processing_time: '2.1ms for complex problems'
          }
        },
        {
          id: 'causal_reasoning',
          name: 'Causal & Strategic Reasoning',
          description: 'Understanding cause-effect relationships and strategic planning',
          category: 'reasoning',
          accuracy: 93.8,
          cultural_accuracy: 92.5,
          speed: 92.3,
          status: 'active',
          icon: Target,
          examples: [
            'Business strategy analysis',
            'Causal relationship identification',
            'Decision tree optimization',
            'Romanian market analysis'
          ],
          technical_details: {
            model_type: 'Causal Inference Model',
            parameters: '980M causal parameters',
            training_data: 'Strategic planning datasets',
            processing_time: '1.8ms analysis time'
          }
        },
        {
          id: 'creative_reasoning',
          name: 'Creative Problem Solving',
          description: 'Innovative solutions and creative thinking approaches',
          category: 'reasoning',
          accuracy: 91.5,
          cultural_accuracy: 94.7,
          speed: 89.6,
          status: 'active',
          icon: Lightbulb,
          examples: [
            'Creative writing in Romanian',
            'Innovative business solutions',
            'Artistic concept development',
            'Cultural event planning'
          ],
          technical_details: {
            model_type: 'Creative Reasoning Network',
            parameters: '1.1B creative parameters',
            training_data: 'Creative works and innovation datasets',
            processing_time: '2.5ms for creative tasks'
          }
        }
      ]
    },
    {
      id: 'multimodal',
      name: 'Multi-Modal Intelligence',
      icon: Eye,
      description: 'Vision, audio, and cross-modal understanding',
      color: 'from-orange-500 to-orange-600',
      capabilities: [
        {
          id: 'vision_understanding',
          name: 'Advanced Vision Processing',
          description: 'Image understanding with Romanian cultural context',
          category: 'multimodal',
          accuracy: 92.3,
          cultural_accuracy: 89.7,
          speed: 91.8,
          status: 'active',
          icon: Eye,
          examples: [
            'Romanian cultural artifact recognition',
            'Traditional costume identification',
            'Landscape and architecture analysis',
            'Document and text extraction'
          ],
          technical_details: {
            model_type: 'Vision Transformer + Cultural Layers',
            parameters: '1.4B vision parameters',
            training_data: 'Romanian visual culture datasets',
            processing_time: '15ms per image'
          }
        },
        {
          id: 'audio_processing',
          name: 'Romanian Audio Intelligence',
          description: 'Speech recognition and audio understanding in Romanian',
          category: 'multimodal',
          accuracy: 95.1,
          cultural_accuracy: 93.4,
          speed: 94.2,
          status: 'active',
          icon: Mic,
          examples: [
            'Romanian speech-to-text',
            'Accent and dialect recognition',
            'Music and cultural audio analysis',
            'Real-time voice translation'
          ],
          technical_details: {
            model_type: 'Audio Transformer',
            parameters: '890M audio parameters',
            training_data: 'Romanian speech and audio corpora',
            processing_time: '50ms per second of audio'
          }
        },
        {
          id: 'cross_modal',
          name: 'Cross-Modal Synthesis',
          description: 'Integration across text, vision, and audio modalities',
          category: 'multimodal',
          accuracy: 88.9,
          cultural_accuracy: 87.2,
          speed: 86.5,
          status: 'beta',
          icon: CircuitBoard,
          examples: [
            'Image captioning in Romanian',
            'Audio-visual scene understanding',
            'Multi-modal content generation',
            'Cultural event documentation'
          ],
          technical_details: {
            model_type: 'Multi-Modal Fusion Network',
            parameters: '1.6B cross-modal parameters',
            training_data: 'Aligned multi-modal datasets',
            processing_time: '25ms cross-modal inference'
          }
        }
      ]
    },
    {
      id: 'knowledge',
      name: 'Knowledge & Research',
      icon: BookOpen,
      description: 'Information processing and knowledge synthesis',
      color: 'from-red-600 to-red-700',
      capabilities: [
        {
          id: 'knowledge_synthesis',
          name: 'Knowledge Synthesis',
          description: 'Integration and synthesis of complex information',
          category: 'knowledge',
          accuracy: 94.7,
          cultural_accuracy: 92.8,
          speed: 93.5,
          status: 'active',
          icon: Database,
          examples: [
            'Research paper synthesis',
            'Romanian historical analysis',
            'Cross-domain knowledge integration',
            'Educational content creation'
          ],
          technical_details: {
            model_type: 'Knowledge Graph Neural Network',
            parameters: '1.3B knowledge parameters',
            training_data: 'Academic and cultural knowledge bases',
            processing_time: '1.9ms synthesis time'
          }
        },
        {
          id: 'research_assistance',
          name: 'Intelligent Research Assistant',
          description: 'Advanced research support and analysis capabilities',
          category: 'knowledge',
          accuracy: 93.2,
          cultural_accuracy: 91.6,
          speed: 95.1,
          status: 'active',
          icon: Search,
          examples: [
            'Academic research assistance',
            'Romanian cultural research',
            'Market research and analysis',
            'Scientific literature review'
          ],
          technical_details: {
            model_type: 'Research-Optimized Transformer',
            parameters: '1.1B research parameters',
            training_data: 'Academic and research databases',
            processing_time: '1.4ms query processing'
          }
        }
      ]
    },
    {
      id: 'specialized',
      name: 'Specialized Applications',
      icon: Rocket,
      description: 'Domain-specific and emerging capabilities',
      color: 'from-yellow-600 to-yellow-700',
      capabilities: [
        {
          id: 'code_generation',
          name: 'Intelligent Code Generation',
          description: 'Advanced programming and software development assistance',
          category: 'specialized',
          accuracy: 91.8,
          cultural_accuracy: 88.4,
          speed: 96.3,
          status: 'active',
          icon: Code,
          examples: [
            'Romanian-commented code generation',
            'Software architecture design',
            'Code optimization and debugging',
            'Technical documentation in Romanian'
          ],
          technical_details: {
            model_type: 'Code-Specialized Transformer',
            parameters: '950M code parameters',
            training_data: 'Programming datasets + Romanian tech docs',
            processing_time: '1.6ms per code block'
          }
        },
        {
          id: 'business_intelligence',
          name: 'Business Intelligence',
          description: 'Romanian market analysis and business insights',
          category: 'specialized',
          accuracy: 89.6,
          cultural_accuracy: 94.3,
          speed: 92.1,
          status: 'active',
          icon: PieChart,
          examples: [
            'Romanian market trend analysis',
            'Business strategy optimization',
            'Financial modeling and forecasting',
            'Cultural market insights'
          ],
          technical_details: {
            model_type: 'Business Intelligence Network',
            parameters: '780M business parameters',
            training_data: 'Romanian market and business data',
            processing_time: '2.3ms analysis time'
          }
        },
        {
          id: 'quantum_processing',
          name: 'Quantum-Enhanced Processing',
          description: 'Experimental quantum computing integration',
          category: 'specialized',
          accuracy: 85.2,
          cultural_accuracy: 82.7,
          speed: 78.9,
          status: 'beta',
          icon: Atom,
          examples: [
            'Quantum optimization algorithms',
            'Complex system simulation',
            'Advanced cryptographic analysis',
            'Quantum machine learning'
          ],
          technical_details: {
            model_type: 'Quantum-Classical Hybrid',
            parameters: '32-qubit quantum processor',
            training_data: 'Quantum algorithm datasets',
            processing_time: '50ms quantum operations'
          }
        }
      ]
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Capabilities Overview', icon: Brain },
    { id: 'performance', label: 'Performance Metrics', icon: TrendingUp },
    { id: 'categories', label: 'Capability Categories', icon: Cpu },
    { id: 'demonstrations', label: 'Live Demonstrations', icon: Sparkles },
    { id: 'benchmarks', label: 'Benchmarks & Comparisons', icon: Award },
    { id: 'roadmap', label: 'Development Roadmap', icon: Rocket }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'beta': return 'text-yellow-600 bg-yellow-100';
      case 'coming_soon': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Star className="w-4 h-4" />;
      case 'beta': return <FlaskConical className="w-4 h-4" />;
      case 'coming_soon': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default: return <TrendingUp className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50">
      {/* Enhanced Header */}
      <motion.div
        className="bg-white/80 backdrop-blur-sm border-b border-red-200/50 sticky top-0 z-40"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-yellow-500 rounded-lg flex items-center justify-center">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-red-600 to-yellow-600 bg-clip-text text-transparent">
                  RomAI Capabilities
                </h1>
                <p className="text-sm text-gray-600">Advanced Romanian AGI Features</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <Brain className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">AGI Score: 94.8%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Flag className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Romanian: 97.2%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">1.3ms Response</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabbed Navigation */}
      <div className="bg-white/50 backdrop-blur-sm border-b border-red-200/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${selectedTab === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {selectedTab === 'overview' && (
            <>
              {/* AGI Capabilities Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-red-200/50 shadow-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Romanian AGI Excellence</h3>
                  </div>

                  <div className="space-y-4">
                    <p className="text-gray-700">
                      RomAI represents the pinnacle of Romanian artificial general intelligence, combining
                      advanced reasoning capabilities with deep cultural understanding.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <Flag className="w-5 h-5 text-red-600" />
                          <span className="font-semibold text-red-900">Cultural Intelligence</span>
                        </div>
                        <p className="text-sm text-red-700">Deep understanding of Romanian culture, traditions, and contextual nuances</p>
                      </div>

                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <Zap className="w-5 h-5 text-yellow-600" />
                          <span className="font-semibold text-yellow-900">Lightning Fast</span>
                        </div>
                        <p className="text-sm text-yellow-700">Sub-millisecond response times for real-time AI interactions</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-yellow-200/50 shadow-sm"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                      <Gem className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Core Strengths</h3>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-gray-700">Advanced Romanian language processing (97.2% accuracy)</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-gray-700">Multi-modal intelligence (vision, audio, text)</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-gray-700">Complex reasoning and problem-solving</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      <span className="text-gray-700">Cultural context preservation</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                      <span className="text-gray-700">Real-time learning and adaptation</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Capability Categories Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {capabilityCategories.map((category, index) => {
                  const Icon = category.icon;
                  return (
                    <motion.div
                      key={category.id}
                      className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-red-200/50 shadow-sm cursor-pointer hover:shadow-md transition-all duration-200"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <div className="flex items-center space-x-3 mb-4">
                        <div className={`w-10 h-10 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      </div>

                      <p className="text-gray-600 text-sm mb-4">{category.description}</p>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">{category.capabilities.length} capabilities</span>
                        <div className="flex items-center space-x-1">
                          {category.capabilities.slice(0, 3).map((cap, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${cap.status === 'active' ? 'bg-green-500' :
                                  cap.status === 'beta' ? 'bg-yellow-500' : 'bg-gray-400'
                                }`}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Quick Stats */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-red-200/50 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Capability Statistics</h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900">{capabilityCategories.reduce((acc, cat) => acc + cat.capabilities.length, 0)}</h4>
                    <p className="text-sm text-gray-600">Total Capabilities</p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Star className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900">{capabilityCategories.reduce((acc, cat) => acc + cat.capabilities.filter(c => c.status === 'active').length, 0)}</h4>
                    <p className="text-sm text-gray-600">Active Features</p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FlaskConical className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900">{capabilityCategories.reduce((acc, cat) => acc + cat.capabilities.filter(c => c.status === 'beta').length, 0)}</h4>
                    <p className="text-sm text-gray-600">Beta Features</p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Flag className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900">🇷🇴</h4>
                    <p className="text-sm text-gray-600">Romanian First</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {selectedTab === 'performance' && (
            <>
              {/* Performance Metrics Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {performanceMetrics.map((metric, index) => {
                  const Icon = metric.icon;
                  return (
                    <motion.div
                      key={metric.name}
                      className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-red-200/50 shadow-sm"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-yellow-500 rounded-lg flex items-center justify-center">
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="font-semibold text-gray-900">{metric.name}</h3>
                        </div>
                        {getTrendIcon(metric.trend)}
                      </div>

                      <div className="mb-3">
                        <div className="flex items-baseline space-x-1">
                          <span className="text-3xl font-bold text-gray-900">{metric.value}</span>
                          <span className="text-lg text-gray-600">{metric.unit}</span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600">{metric.description}</p>

                      {metric.name.includes('%') && (
                        <div className="mt-4">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div
                              className="bg-gradient-to-r from-red-500 to-yellow-500 h-2 rounded-full"
                              style={{ width: `${metric.value}%` }}
                              initial={{ width: 0 }}
                              animate={{ width: `${metric.value}%` }}
                              transition={{ duration: 1, delay: index * 0.2 }}
                            />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Performance Comparison Chart */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-red-200/50 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Comparison</h3>

                <div className="space-y-6">
                  {performanceMetrics.slice(0, 4).map((metric, index) => (
                    <div key={metric.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">{metric.name}</span>
                        <span className="text-sm text-gray-600">{metric.value}{metric.unit}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <motion.div
                          className="bg-gradient-to-r from-red-500 to-yellow-500 h-3 rounded-full"
                          style={{ width: `${metric.name.includes('ms') ? 100 - metric.value : metric.value}%` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${metric.name.includes('ms') ? 100 - metric.value : metric.value}%` }}
                          transition={{ duration: 1, delay: index * 0.2 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {selectedTab === 'categories' && (
            <>
              {/* Capability Categories Detail */}
              <div className="space-y-8">
                {capabilityCategories.map((category, categoryIndex) => {
                  const CategoryIcon = category.icon;
                  return (
                    <motion.div
                      key={category.id}
                      className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-red-200/50 shadow-sm"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: categoryIndex * 0.1 }}
                    >
                      <div className="flex items-center space-x-3 mb-6">
                        <div className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center`}>
                          <CategoryIcon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{category.name}</h3>
                          <p className="text-gray-600">{category.description}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {category.capabilities.map((capability, capIndex) => {
                          const CapIcon = capability.icon;
                          return (
                            <motion.div
                              key={capability.id}
                              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                              whileHover={{ scale: 1.02 }}
                              onClick={() => setSelectedCapability(capability)}
                            >
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">
                                  <CapIcon className="w-5 h-5 text-white" />
                                </div>
                                <h4 className="font-semibold text-gray-900 text-sm">{capability.name}</h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(capability.status)}`}>
                                  {getStatusIcon(capability.status)}
                                  <span className="ml-1">{capability.status.replace('_', ' ')}</span>
                                </span>
                              </div>

                              <p className="text-gray-600 text-sm mb-3">{capability.description}</p>

                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div>
                                  <p className="text-gray-500">Accuracy</p>
                                  <p className="font-semibold">{capability.accuracy}%</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Cultural</p>
                                  <p className="font-semibold">{capability.cultural_accuracy}%</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Speed</p>
                                  <p className="font-semibold">{capability.speed}%</p>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}

          {/* Other tabs content will be implemented in subsequent updates */}
          {!['overview', 'performance', 'categories'].includes(selectedTab) && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-red-200/50 shadow-sm text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {tabs.find(tab => tab.id === selectedTab)?.label} Features
              </h3>
              <p className="text-gray-600 mb-4">
                Advanced {tabs.find(tab => tab.id === selectedTab)?.label.toLowerCase()} capabilities coming soon.
              </p>
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-yellow-500 rounded-lg flex items-center justify-center mx-auto">
                {React.createElement(tabs.find(tab => tab.id === selectedTab)?.icon || Brain, {
                  className: "w-8 h-8 text-white"
                })}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Capability Detail Modal */}
      {selectedCapability && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSelectedCapability(null)}
        >
          <motion.div
            className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-yellow-500 rounded-lg flex items-center justify-center">
                  {React.createElement(selectedCapability.icon, { className: "w-6 h-6 text-white" })}
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{selectedCapability.name}</h3>
              </div>
              <button
                onClick={() => setSelectedCapability(null)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <p className="text-gray-700 mb-6">{selectedCapability.description}</p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-900 mb-1">Accuracy</h4>
                <p className="text-2xl font-bold text-red-700">{selectedCapability.accuracy}%</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-900 mb-1">Cultural</h4>
                <p className="text-2xl font-bold text-yellow-700">{selectedCapability.cultural_accuracy}%</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h4 className="font-semibold text-orange-900 mb-1">Speed</h4>
                <p className="text-2xl font-bold text-orange-700">{selectedCapability.speed}%</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Use Cases & Examples</h4>
                <div className="space-y-2">
                  {selectedCapability.examples.map((example, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-gray-700">{example}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Technical Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Model Type</p>
                    <p className="font-semibold">{selectedCapability.technical_details.model_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Parameters</p>
                    <p className="font-semibold">{selectedCapability.technical_details.parameters}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Training Data</p>
                    <p className="font-semibold">{selectedCapability.technical_details.training_data}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Processing Time</p>
                    <p className="font-semibold">{selectedCapability.technical_details.processing_time}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Footer */}
      <motion.footer
        className="bg-white/80 backdrop-blur-sm border-t border-red-200/50 mt-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-lg border border-red-200">
              <Brain className="w-8 h-8 text-red-600 mb-3" />
              <h3 className="font-semibold text-red-900 mb-2">Advanced AGI</h3>
              <p className="text-red-700 text-sm">State-of-the-art artificial general intelligence with Romanian cultural understanding and advanced reasoning capabilities.</p>
            </div>
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
              <Flag className="w-8 h-8 text-yellow-600 mb-3" />
              <h3 className="font-semibold text-yellow-900 mb-2">Romanian First</h3>
              <p className="text-yellow-700 text-sm">Built specifically for Romanian language and culture, providing authentic and contextually accurate AI interactions.</p>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
              <Rocket className="w-8 h-8 text-orange-600 mb-3" />
              <h3 className="font-semibold text-orange-900 mb-2">Cutting Edge</h3>
              <p className="text-orange-700 text-sm">Continuously evolving capabilities with quantum-enhanced processing and multi-modal intelligence integration.</p>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
