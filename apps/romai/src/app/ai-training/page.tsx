'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Play, 
  Pause, 
  Square, 
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Activity,
  Database,
  Cpu,
  Zap,
  Settings,
  FileText,
  BarChart3,
  Clock,
  Target,
  CheckCircle,
  AlertCircle,
  Info,
  Download,
  Upload,
  RefreshCw,
  Monitor,
  Flag,
  Globe
} from 'lucide-react';

interface TrainingSession {
  id: string;
  name: string;
  model_type: string;
  status: 'running' | 'paused' | 'completed' | 'failed' | 'pending';
  progress: number;
  current_epoch: number;
  total_epochs: number;
  current_loss: number;
  best_loss: number;
  learning_rate: number;
  batch_size: number;
  accuracy: number;
  cultural_accuracy: number;
  started_at: string;
  estimated_completion: string;
  gpu_usage: number;
  memory_usage: number;
}

interface TrainingDataset {
  id: string;
  name: string;
  type: 'romanian_text' | 'cultural_context' | 'mixed_language' | 'conversation';
  size: number;
  samples: number;
  quality_score: number;
  cultural_relevance: number;
  last_updated: string;
  status: 'ready' | 'processing' | 'error';
}

interface ModelConfiguration {
  architecture: string;
  parameters: number;
  layers: number;
  attention_heads: number;
  embedding_dimension: number;
  vocabulary_size: number;
  context_window: number;
  cultural_layers: number;
}

export default function AITraining() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([
    {
      id: '1',
      name: 'Romanian Cultural Model v2.1',
      model_type: 'Cultural Language Model',
      status: 'running',
      progress: 67.3,
      current_epoch: 134,
      total_epochs: 200,
      current_loss: 0.0847,
      best_loss: 0.0823,
      learning_rate: 0.0001,
      batch_size: 32,
      accuracy: 94.7,
      cultural_accuracy: 92.1,
      started_at: '2025-08-07T10:30:00Z',
      estimated_completion: '2025-08-07T18:45:00Z',
      gpu_usage: 87.3,
      memory_usage: 12.4
    },
    {
      id: '2',
      name: 'Advanced Reasoning Enhancement',
      model_type: 'Reasoning Model',
      status: 'paused',
      progress: 45.2,
      current_epoch: 90,
      total_epochs: 200,
      current_loss: 0.1234,
      best_loss: 0.1198,
      learning_rate: 0.00005,
      batch_size: 16,
      accuracy: 87.4,
      cultural_accuracy: 89.6,
      started_at: '2025-08-06T14:15:00Z',
      estimated_completion: '2025-08-08T09:30:00Z',
      gpu_usage: 0,
      memory_usage: 0
    },
    {
      id: '3',
      name: 'Multi-Modal Romanian AI',
      model_type: 'Multi-Modal Model',
      status: 'completed',
      progress: 100,
      current_epoch: 150,
      total_epochs: 150,
      current_loss: 0.0456,
      best_loss: 0.0456,
      learning_rate: 0.0001,
      batch_size: 24,
      accuracy: 96.2,
      cultural_accuracy: 94.8,
      started_at: '2025-08-05T08:00:00Z',
      estimated_completion: '2025-08-06T23:15:00Z',
      gpu_usage: 0,
      memory_usage: 0
    }
  ]);

  const [datasets] = useState<TrainingDataset[]>([
    {
      id: '1',
      name: 'Romanian Literature Corpus',
      type: 'romanian_text',
      size: 2.4, // GB
      samples: 1250000,
      quality_score: 96.8,
      cultural_relevance: 98.2,
      last_updated: '2025-08-07T09:00:00Z',
      status: 'ready'
    },
    {
      id: '2',
      name: 'Cultural Expressions Dataset',
      type: 'cultural_context',
      size: 1.8,
      samples: 847000,
      quality_score: 94.5,
      cultural_relevance: 99.1,
      last_updated: '2025-08-06T16:30:00Z',
      status: 'ready'
    },
    {
      id: '3',
      name: 'Conversational Romanian',
      type: 'conversation',
      size: 3.2,
      samples: 2100000,
      quality_score: 92.3,
      cultural_relevance: 91.7,
      last_updated: '2025-08-07T11:15:00Z',
      status: 'processing'
    },
    {
      id: '4',
      name: 'Mixed Language Context',
      type: 'mixed_language',
      size: 1.5,
      samples: 680000,
      quality_score: 89.7,
      cultural_relevance: 87.4,
      last_updated: '2025-08-05T20:45:00Z',
      status: 'ready'
    }
  ]);

  const [modelConfig] = useState<ModelConfiguration>({
    architecture: 'Transformer + Cultural Layers',
    parameters: 7800000000, // 7.8B parameters
    layers: 32,
    attention_heads: 32,
    embedding_dimension: 4096,
    vocabulary_size: 65000,
    context_window: 8192,
    cultural_layers: 8
  });

  const tabs = [
    { id: 'overview', label: 'Training Overview', icon: BarChart3 },
    { id: 'sessions', label: 'Training Sessions', icon: Brain },
    { id: 'datasets', label: 'Datasets', icon: Database },
    { id: 'models', label: 'Model Architecture', icon: Cpu },
    { id: 'monitoring', label: 'Real-time Monitoring', icon: Monitor },
    { id: 'optimization', label: 'Optimization', icon: TrendingUp }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-600 bg-green-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Play className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleTrainingAction = (sessionId: string, action: 'start' | 'pause' | 'stop') => {
    setTrainingSessions(prev => 
      prev.map(session => {
        if (session.id === sessionId) {
          switch (action) {
            case 'start':
              return { ...session, status: 'running' as const };
            case 'pause':
              return { ...session, status: 'paused' as const };
            case 'stop':
              return { ...session, status: 'pending' as const, progress: 0 };
            default:
              return session;
          }
        }
        return session;
      })
    );
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
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-red-600 to-yellow-600 bg-clip-text text-transparent">
                  AI Training Management
                </h1>
                <p className="text-sm text-gray-600">Romanian AGI Model Development</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">{trainingSessions.filter(s => s.status === 'running').length} Active</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">{datasets.length} Datasets</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Flag className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Romanian AI</span>
                </div>
              </div>
              
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <RefreshCw className="w-4 h-4" />
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
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    selectedTab === tab.id
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
              {/* Training Overview Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-red-200/50 shadow-sm"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-red-800 font-semibold text-sm">Active Training</h3>
                      <p className="text-3xl font-bold text-red-900 mt-1">
                        {trainingSessions.filter(s => s.status === 'running').length}
                      </p>
                      <p className="text-sm text-red-600 mt-1">Sessions running</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-yellow-200/50 shadow-sm"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-yellow-800 font-semibold text-sm">Model Parameters</h3>
                      <p className="text-3xl font-bold text-yellow-900 mt-1">7.8B</p>
                      <p className="text-sm text-yellow-600 mt-1">Total parameters</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50 shadow-sm"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-orange-800 font-semibold text-sm">Training Data</h3>
                      <p className="text-3xl font-bold text-orange-900 mt-1">9.2GB</p>
                      <p className="text-sm text-orange-600 mt-1">Romanian datasets</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <Database className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-red-200/50 shadow-sm"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-red-800 font-semibold text-sm">Cultural Accuracy</h3>
                      <p className="text-3xl font-bold text-red-900 mt-1">94.8%</p>
                      <p className="text-sm text-red-600 mt-1">Average across models</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                      <Flag className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Current Training Status */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-red-200/50 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Training Sessions</h3>
                
                <div className="space-y-4">
                  {trainingSessions.slice(0, 2).map((session, index) => (
                    <motion.div
                      key={session.id}
                      className="border border-gray-200 rounded-lg p-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-semibold text-gray-900">{session.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(session.status)}`}>
                            {getStatusIcon(session.status)}
                            <span className="ml-1">{session.status.charAt(0).toUpperCase() + session.status.slice(1)}</span>
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleTrainingAction(session.id, session.status === 'running' ? 'pause' : 'start')}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            {session.status === 'running' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleTrainingAction(session.id, 'stop')}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Square className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                        <div className="text-sm">
                          <p className="text-gray-600">Progress</p>
                          <p className="font-semibold">{session.progress.toFixed(1)}%</p>
                        </div>
                        <div className="text-sm">
                          <p className="text-gray-600">Epoch</p>
                          <p className="font-semibold">{session.current_epoch}/{session.total_epochs}</p>
                        </div>
                        <div className="text-sm">
                          <p className="text-gray-600">Loss</p>
                          <p className="font-semibold">{session.current_loss.toFixed(4)}</p>
                        </div>
                        <div className="text-sm">
                          <p className="text-gray-600">Cultural Accuracy</p>
                          <p className="font-semibold">{session.cultural_accuracy}%</p>
                        </div>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          className="bg-gradient-to-r from-red-500 to-yellow-500 h-2 rounded-full"
                          style={{ width: `${session.progress}%` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${session.progress}%` }}
                          transition={{ duration: 1, delay: index * 0.2 }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-red-200/50 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <motion.button
                    className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-red-300 transition-all duration-200 hover:shadow-md group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                      <Play className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900 group-hover:text-red-700">Start Training</p>
                      <p className="text-sm text-gray-500">New session</p>
                    </div>
                  </motion.button>

                  <motion.button
                    className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-yellow-300 transition-all duration-200 hover:shadow-md group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                      <Upload className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900 group-hover:text-yellow-700">Upload Dataset</p>
                      <p className="text-sm text-gray-500">Add training data</p>
                    </div>
                  </motion.button>

                  <motion.button
                    className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-orange-300 transition-all duration-200 hover:shadow-md group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900 group-hover:text-orange-700">Configure Model</p>
                      <p className="text-sm text-gray-500">Architecture setup</p>
                    </div>
                  </motion.button>

                  <motion.button
                    className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-red-300 transition-all duration-200 hover:shadow-md group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                      <Download className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900 group-hover:text-red-700">Export Model</p>
                      <p className="text-sm text-gray-500">Download trained</p>
                    </div>
                  </motion.button>
                </div>
              </div>
            </>
          )}

          {selectedTab === 'sessions' && (
            <>
              {/* All Training Sessions */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-red-200/50 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">All Training Sessions</h3>
                  <motion.button
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-yellow-500 text-white rounded-lg hover:from-red-600 hover:to-yellow-600 transition-colors flex items-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Play className="w-4 h-4" />
                    <span>New Session</span>
                  </motion.button>
                </div>

                <div className="space-y-4">
                  {trainingSessions.map((session, index) => (
                    <motion.div
                      key={session.id}
                      className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-semibold text-gray-900">{session.name}</h4>
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                            {session.model_type}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(session.status)}`}>
                            {getStatusIcon(session.status)}
                            <span className="ml-1">{session.status.charAt(0).toUpperCase() + session.status.slice(1)}</span>
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleTrainingAction(session.id, session.status === 'running' ? 'pause' : 'start')}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            {session.status === 'running' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleTrainingAction(session.id, 'stop')}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Square className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                        <div className="text-sm">
                          <p className="text-gray-600">Progress</p>
                          <p className="font-semibold">{session.progress.toFixed(1)}%</p>
                        </div>
                        <div className="text-sm">
                          <p className="text-gray-600">Epoch</p>
                          <p className="font-semibold">{session.current_epoch}/{session.total_epochs}</p>
                        </div>
                        <div className="text-sm">
                          <p className="text-gray-600">Loss</p>
                          <p className="font-semibold">{session.current_loss.toFixed(4)}</p>
                        </div>
                        <div className="text-sm">
                          <p className="text-gray-600">Accuracy</p>
                          <p className="font-semibold">{session.accuracy}%</p>
                        </div>
                        <div className="text-sm">
                          <p className="text-gray-600">Cultural</p>
                          <p className="font-semibold">{session.cultural_accuracy}%</p>
                        </div>
                        <div className="text-sm">
                          <p className="text-gray-600">GPU Usage</p>
                          <p className="font-semibold">{session.gpu_usage}%</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Training Progress</span>
                          <span className="font-medium">{session.progress.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            className="bg-gradient-to-r from-red-500 to-yellow-500 h-2 rounded-full"
                            style={{ width: `${session.progress}%` }}
                            initial={{ width: 0 }}
                            animate={{ width: `${session.progress}%` }}
                            transition={{ duration: 1, delay: index * 0.2 }}
                          />
                        </div>
                      </div>

                      {session.status === 'running' && (
                        <div className="mt-4 text-sm text-gray-600">
                          <p>Started: {new Date(session.started_at).toLocaleString()}</p>
                          <p>Estimated completion: {new Date(session.estimated_completion).toLocaleString()}</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </>
          )}

          {selectedTab === 'datasets' && (
            <>
              {/* Training Datasets */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-red-200/50 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Training Datasets</h3>
                  <motion.button
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-yellow-500 text-white rounded-lg hover:from-red-600 hover:to-yellow-600 transition-colors flex items-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Dataset</span>
                  </motion.button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {datasets.map((dataset, index) => (
                    <motion.div
                      key={dataset.id}
                      className="border border-gray-200 rounded-lg p-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900">{dataset.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          dataset.status === 'ready' ? 'bg-green-100 text-green-800' :
                          dataset.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {dataset.status.charAt(0).toUpperCase() + dataset.status.slice(1)}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Type</span>
                          <span className="font-medium">{dataset.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Size</span>
                          <span className="font-medium">{dataset.size} GB</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Samples</span>
                          <span className="font-medium">{dataset.samples.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Quality Score</span>
                          <span className="font-medium">{dataset.quality_score}%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Cultural Relevance</span>
                          <span className="font-medium flex items-center space-x-1">
                            <Flag className="w-3 h-3 text-red-500" />
                            <span>{dataset.cultural_relevance}%</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Last Updated</span>
                          <span className="font-medium">{new Date(dataset.last_updated).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center space-x-2">
                        <button className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 transition-colors">
                          Use for Training
                        </button>
                        <button className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors">
                          Preview
                        </button>
                        <button className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors">
                          Download
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Other tabs content will be implemented in subsequent updates */}
          {!['overview', 'sessions', 'datasets'].includes(selectedTab) && (
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
              <h3 className="font-semibold text-red-900 mb-2">Advanced AI Training</h3>
              <p className="text-red-700 text-sm">State-of-the-art model training with Romanian cultural intelligence and advanced reasoning capabilities.</p>
            </div>
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
              <Database className="w-8 h-8 text-yellow-600 mb-3" />
              <h3 className="font-semibold text-yellow-900 mb-2">Rich Training Data</h3>
              <p className="text-yellow-700 text-sm">Comprehensive Romanian datasets with cultural context, literature, and conversational data for authentic AI training.</p>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
              <Monitor className="w-8 h-8 text-orange-600 mb-3" />
              <h3 className="font-semibold text-orange-900 mb-2">Real-time Monitoring</h3>
              <p className="text-orange-700 text-sm">Live training progress tracking with performance metrics, cultural accuracy, and optimization insights.</p>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
