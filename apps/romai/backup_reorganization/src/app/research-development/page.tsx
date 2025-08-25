'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Beaker,
  Brain,
  Lightbulb,
  Rocket,
  Code,
  Database,
  GitBranch,
  FileText,
  Users,
  Target,
  Calendar,
  TrendingUp,
  Flag,
  Globe,
  Microscope,
  Atom,
  CircuitBoard,
  Cpu,
  Network,
  Zap,
  Settings,
  Play,
  Pause,
  Square,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  ChevronRight,
  BookOpen,
  Award,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Layers,
  Fingerprint,
  Shield,
  Activity
} from 'lucide-react';

interface ResearchProject {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'testing' | 'completed' | 'paused';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  team_size: number;
  start_date: string;
  estimated_completion: string;
  category: string;
  technologies: string[];
  icon: React.ElementType;
  metrics: {
    accuracy_improvement: number;
    performance_gain: number;
    cultural_enhancement: number;
  };
}

interface DevelopmentTool {
  name: string;
  type: 'framework' | 'library' | 'platform' | 'tool';
  version: string;
  usage: number;
  status: 'active' | 'deprecated' | 'experimental';
  description: string;
  icon: React.ElementType;
}

interface Innovation {
  title: string;
  category: 'algorithm' | 'architecture' | 'dataset' | 'methodology';
  impact_score: number;
  date: string;
  description: string;
  applications: string[];
  icon: React.ElementType;
}

export default function ResearchDevelopment() {
  const [selectedTab, setSelectedTab] = useState('projects');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const researchProjects: ResearchProject[] = [
    {
      id: 'romanian-llm',
      name: 'Advanced Romanian LLM',
      description: 'Next-generation large language model specifically trained for Romanian language understanding, cultural context, and nuanced communication.',
      status: 'active',
      priority: 'critical',
      progress: 78,
      team_size: 12,
      start_date: '2024-11-15',
      estimated_completion: '2025-09-30',
      category: 'Natural Language Processing',
      technologies: ['PyTorch', 'Transformers', 'CUDA', 'Romanian Corpus'],
      icon: Brain,
      metrics: {
        accuracy_improvement: 23.4,
        performance_gain: 15.8,
        cultural_enhancement: 42.1
      }
    },
    {
      id: 'cultural-ai',
      name: 'Cultural Intelligence Engine',
      description: 'AI system for deep understanding of Romanian traditions, customs, regional variations, and cultural nuances.',
      status: 'testing',
      priority: 'high',
      progress: 89,
      team_size: 8,
      start_date: '2024-09-01',
      estimated_completion: '2025-08-15',
      category: 'Cultural AI',
      technologies: ['Knowledge Graphs', 'Neural Networks', 'Ethnographic Data'],
      icon: Flag,
      metrics: {
        accuracy_improvement: 34.7,
        performance_gain: 8.2,
        cultural_enhancement: 67.3
      }
    },
    {
      id: 'quantum-nlp',
      name: 'Quantum NLP Processing',
      description: 'Quantum-enhanced natural language processing for exponentially faster Romanian text analysis and generation.',
      status: 'planning',
      priority: 'medium',
      progress: 15,
      team_size: 6,
      start_date: '2025-01-10',
      estimated_completion: '2026-03-30',
      category: 'Quantum Computing',
      technologies: ['Qiskit', 'Quantum Circuits', 'Hybrid Algorithms'],
      icon: Atom,
      metrics: {
        accuracy_improvement: 12.1,
        performance_gain: 89.4,
        cultural_enhancement: 5.7
      }
    },
    {
      id: 'multimodal-romanian',
      name: 'Multimodal Romanian AI',
      description: 'Integrated AI system combining text, speech, vision, and cultural context for comprehensive Romanian communication.',
      status: 'active',
      priority: 'high',
      progress: 56,
      team_size: 15,
      start_date: '2024-12-01',
      estimated_completion: '2025-11-15',
      category: 'Multimodal AI',
      technologies: ['Vision Transformers', 'Speech Recognition', 'Cross-modal Learning'],
      icon: Network,
      metrics: {
        accuracy_improvement: 28.9,
        performance_gain: 22.3,
        cultural_enhancement: 31.6
      }
    },
    {
      id: 'edge-deployment',
      name: 'Edge AI Romanian Processing',
      description: 'Optimized Romanian AI models for edge deployment, enabling offline cultural intelligence and language processing.',
      status: 'active',
      priority: 'medium',
      progress: 34,
      team_size: 5,
      start_date: '2025-02-01',
      estimated_completion: '2025-10-30',
      category: 'Edge Computing',
      technologies: ['TensorFlow Lite', 'ONNX', 'Mobile Optimization'],
      icon: Cpu,
      metrics: {
        accuracy_improvement: 8.7,
        performance_gain: 156.2,
        cultural_enhancement: 18.4
      }
    },
    {
      id: 'ethical-ai',
      name: 'Ethical Romanian AI Framework',
      description: 'Comprehensive framework ensuring ethical AI development with respect for Romanian cultural values and privacy.',
      status: 'completed',
      priority: 'high',
      progress: 100,
      team_size: 7,
      start_date: '2024-08-01',
      estimated_completion: '2025-01-31',
      category: 'AI Ethics',
      technologies: ['Fairness Metrics', 'Privacy Preservation', 'Bias Detection'],
      icon: Shield,
      metrics: {
        accuracy_improvement: 5.2,
        performance_gain: 3.1,
        cultural_enhancement: 78.9
      }
    }
  ];

  const developmentTools: DevelopmentTool[] = [
    {
      name: 'RomAI Framework',
      type: 'framework',
      version: '2.4.1',
      usage: 98,
      status: 'active',
      description: 'Core Romanian AI development framework with cultural intelligence modules',
      icon: Brain
    },
    {
      name: 'Cultural Context Engine',
      type: 'library',
      version: '1.8.3',
      usage: 87,
      status: 'active',
      description: 'Library for Romanian cultural context understanding and processing',
      icon: Flag
    },
    {
      name: 'Romanian Corpus Platform',
      type: 'platform',
      version: '3.1.0',
      usage: 94,
      status: 'active',
      description: 'Comprehensive Romanian language data platform with regional variations',
      icon: Database
    },
    {
      name: 'Quantum NLP Toolkit',
      type: 'tool',
      version: '0.3.2',
      usage: 23,
      status: 'experimental',
      description: 'Experimental toolkit for quantum-enhanced natural language processing',
      icon: Atom
    },
    {
      name: 'Multimodal Integration Hub',
      type: 'platform',
      version: '1.5.7',
      usage: 76,
      status: 'active',
      description: 'Platform for integrating text, speech, vision, and cultural data',
      icon: Network
    },
    {
      name: 'Edge Optimization Suite',
      type: 'tool',
      version: '2.2.4',
      usage: 65,
      status: 'active',
      description: 'Tools for optimizing Romanian AI models for edge deployment',
      icon: Cpu
    }
  ];

  const innovations: Innovation[] = [
    {
      title: 'Cultural Context Embeddings',
      category: 'algorithm',
      impact_score: 9.2,
      date: '2025-07-15',
      description: 'Novel embedding technique that captures Romanian cultural nuances in vector space',
      applications: ['Language Understanding', 'Cultural Translation', 'Context-Aware AI'],
      icon: Lightbulb
    },
    {
      title: 'Regional Dialect Architecture',
      category: 'architecture',
      impact_score: 8.7,
      date: '2025-06-28',
      description: 'Modular architecture supporting all Romanian regional dialects and variations',
      applications: ['Regional AI', 'Dialect Processing', 'Cultural Preservation'],
      icon: CircuitBoard
    },
    {
      title: 'Romanian Cultural Dataset v3.0',
      category: 'dataset',
      impact_score: 9.1,
      date: '2025-07-02',
      description: 'Comprehensive dataset covering traditions, customs, and cultural expressions',
      applications: ['Cultural AI Training', 'Tradition Recognition', 'Cultural Analytics'],
      icon: Database
    },
    {
      title: 'Hybrid Quantum-Classical NLP',
      category: 'methodology',
      impact_score: 8.9,
      date: '2025-05-20',
      description: 'Revolutionary approach combining quantum and classical computing for NLP',
      applications: ['Fast Processing', 'Complex Analysis', 'Quantum Advantage'],
      icon: Atom
    }
  ];

  const tabs = [
    { id: 'projects', label: 'Research Projects', icon: Beaker },
    { id: 'tools', label: 'Development Tools', icon: Code },
    { id: 'innovations', label: 'Recent Innovations', icon: Lightbulb },
    { id: 'publications', label: 'Publications', icon: FileText },
    { id: 'collaboration', label: 'Collaboration', icon: Users },
    { id: 'roadmap', label: 'Research Roadmap', icon: Target }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'testing': return 'text-blue-600 bg-blue-100';
      case 'planning': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-purple-600 bg-purple-100';
      case 'paused': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getToolStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'experimental': return 'text-blue-600';
      case 'deprecated': return 'text-red-600';
      default: return 'text-gray-600';
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
                <Beaker className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-red-600 to-yellow-600 bg-clip-text text-transparent">
                  Research & Development
                </h1>
                <p className="text-sm text-gray-600">Romanian AI Innovation & Research Hub</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <Beaker className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">6 Active Projects</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Brain className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">4 Innovations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">53 Researchers</span>
                </div>
              </div>

              <button className="px-4 py-2 bg-gradient-to-r from-red-500 to-yellow-500 text-white rounded-lg hover:from-red-600 hover:to-yellow-600 transition-colors">
                <Plus className="w-4 h-4 inline mr-2" />
                New Project
              </button>
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
          {selectedTab === 'projects' && (
            <>
              {/* Research Projects */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Active Research Projects</h2>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search projects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="testing">Testing</option>
                    <option value="planning">Planning</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {researchProjects
                  .filter(project =>
                    (filterStatus === 'all' || project.status === filterStatus) &&
                    project.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((project, index) => {
                    const Icon = project.icon;
                    return (
                      <motion.div
                        key={project.id}
                        className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-red-200/50 shadow-sm"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-yellow-500 rounded-lg flex items-center justify-center">
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{project.name}</h3>
                              <p className="text-sm text-gray-600">{project.category}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                              {project.status}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                              {project.priority}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">{project.description}</p>

                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium text-gray-900">{project.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div
                              className="bg-gradient-to-r from-red-500 to-yellow-500 h-2 rounded-full"
                              style={{ width: `${project.progress}%` }}
                              initial={{ width: 0 }}
                              animate={{ width: `${project.progress}%` }}
                              transition={{ duration: 1, delay: index * 0.2 }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="text-center">
                            <p className="text-xs text-gray-600">Accuracy</p>
                            <p className="text-sm font-semibold text-green-600">+{project.metrics.accuracy_improvement}%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-600">Performance</p>
                            <p className="text-sm font-semibold text-blue-600">+{project.metrics.performance_gain}%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-600">Cultural</p>
                            <p className="text-sm font-semibold text-red-600">+{project.metrics.cultural_enhancement}%</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>{project.team_size} members</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>Due {project.estimated_completion}</span>
                            </div>
                          </div>
                          <button className="text-red-600 hover:text-red-700">
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex flex-wrap gap-1">
                            {project.technologies.slice(0, 3).map((tech) => (
                              <span key={tech} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                {tech}
                              </span>
                            ))}
                            {project.technologies.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                +{project.technologies.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            </>
          )}

          {selectedTab === 'tools' && (
            <>
              {/* Development Tools */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {developmentTools.map((tool, index) => {
                  const Icon = tool.icon;
                  return (
                    <motion.div
                      key={tool.name}
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
                          <div>
                            <h3 className="font-semibold text-gray-900">{tool.name}</h3>
                            <p className="text-sm text-gray-600">v{tool.version}</p>
                          </div>
                        </div>
                        <span className={`text-sm font-medium ${getToolStatusColor(tool.status)}`}>
                          {tool.status}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-4">{tool.description}</p>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Usage</span>
                          <span className="font-medium text-gray-900">{tool.usage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            className="bg-gradient-to-r from-red-500 to-yellow-500 h-2 rounded-full"
                            style={{ width: `${tool.usage}%` }}
                            initial={{ width: 0 }}
                            animate={{ width: `${tool.usage}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${tool.type === 'framework' ? 'bg-blue-100 text-blue-800' :
                            tool.type === 'library' ? 'bg-green-100 text-green-800' :
                              tool.type === 'platform' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                          }`}>
                          {tool.type}
                        </span>
                        <div className="flex items-center space-x-2">
                          <button className="p-1 text-gray-500 hover:text-gray-700">
                            <Download className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-500 hover:text-gray-700">
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}

          {selectedTab === 'innovations' && (
            <>
              {/* Recent Innovations */}
              <div className="space-y-6">
                {innovations.map((innovation, index) => {
                  const Icon = innovation.icon;
                  return (
                    <motion.div
                      key={innovation.title}
                      className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-red-200/50 shadow-sm"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-yellow-500 rounded-lg flex items-center justify-center">
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{innovation.title}</h3>
                            <p className="text-sm text-gray-600">{innovation.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Impact Score</p>
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="font-semibold text-gray-900">{innovation.impact_score}/10</span>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${innovation.category === 'algorithm' ? 'bg-blue-100 text-blue-800' :
                              innovation.category === 'architecture' ? 'bg-green-100 text-green-800' :
                                innovation.category === 'dataset' ? 'bg-purple-100 text-purple-800' :
                                  'bg-orange-100 text-orange-800'
                            }`}>
                            {innovation.category}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4">{innovation.description}</p>

                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Applications:</h4>
                        <div className="flex flex-wrap gap-2">
                          {innovation.applications.map((app) => (
                            <span key={app} className="px-3 py-1 bg-red-50 text-red-700 text-sm rounded-full border border-red-200">
                              {app}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}

          {/* Other tabs placeholder */}
          {!['projects', 'tools', 'innovations'].includes(selectedTab) && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-red-200/50 shadow-sm text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {tabs.find(tab => tab.id === selectedTab)?.label} Section
              </h3>
              <p className="text-gray-600 mb-4">
                Advanced {tabs.find(tab => tab.id === selectedTab)?.label.toLowerCase()} features coming soon.
              </p>
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-yellow-500 rounded-lg flex items-center justify-center mx-auto">
                {React.createElement(tabs.find(tab => tab.id === selectedTab)?.icon || Beaker, {
                  className: "w-8 h-8 text-white"
                })}
              </div>
            </div>
          )}
        </motion.div>
      </div>

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
              <Beaker className="w-8 h-8 text-red-600 mb-3" />
              <h3 className="font-semibold text-red-900 mb-2">Cutting-edge Research</h3>
              <p className="text-red-700 text-sm">Leading the future of Romanian AI with innovative research projects and breakthrough technologies.</p>
            </div>
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
              <Brain className="w-8 h-8 text-yellow-600 mb-3" />
              <h3 className="font-semibold text-yellow-900 mb-2">Cultural Intelligence</h3>
              <p className="text-yellow-700 text-sm">Deep understanding of Romanian culture, traditions, and linguistic nuances through advanced AI research.</p>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
              <Rocket className="w-8 h-8 text-orange-600 mb-3" />
              <h3 className="font-semibold text-orange-900 mb-2">Innovation Pipeline</h3>
              <p className="text-orange-700 text-sm">Continuous innovation with quantum computing, multimodal AI, and next-generation language models.</p>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
