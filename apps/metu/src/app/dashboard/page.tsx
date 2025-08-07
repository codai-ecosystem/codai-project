'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Play,
  Pause,
  Square,
  MessageSquare,
  Settings,
  User,
  Activity,
  TrendingUp,
  Clock,
  Calendar,
  Headphones,
  Radio,
  Zap,
  Brain,
  Waves,
  BarChart3,
  Users,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  ArrowRight,
  Star,
  Heart,
  Bookmark,
  Share2,
  Download,
  Upload,
  Sliders,
  Database,
  Cloud,
  Shield,
  Bell,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Info,
  RefreshCw
} from 'lucide-react';

interface VoiceSession {
  id: string;
  title: string;
  duration: string;
  timestamp: string;
  status: 'completed' | 'in-progress' | 'paused';
  interactions: number;
  quality: 'excellent' | 'good' | 'fair';
  deviceType: 'desktop' | 'mobile' | 'tablet';
}

interface VoiceMetrics {
  totalSessions: number;
  totalDuration: string;
  averageSessionLength: string;
  successRate: number;
  voiceAccuracy: number;
  responsiveness: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: string;
  color: string;
}

export default function MetuDashboard() {
  const [activeVoiceSession, setActiveVoiceSession] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [voiceLevel, setVoiceLevel] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Simulate voice level animation
  useEffect(() => {
    if (activeVoiceSession) {
      const interval = setInterval(() => {
        setVoiceLevel(Math.random() * 100);
      }, 100);

      return () => clearInterval(interval);
    } else {
      setVoiceLevel(0);
    }
  }, [activeVoiceSession]);

  const voiceMetrics: VoiceMetrics = {
    totalSessions: 1247,
    totalDuration: '156h 23m',
    averageSessionLength: '7m 32s',
    successRate: 94.8,
    voiceAccuracy: 96.2,
    responsiveness: 98.7
  };

  const recentSessions: VoiceSession[] = [
    {
      id: '1',
      title: 'Daily Productivity Check',
      duration: '12m 45s',
      timestamp: '2 hours ago',
      status: 'completed',
      interactions: 23,
      quality: 'excellent',
      deviceType: 'desktop'
    },
    {
      id: '2',
      title: 'Project Planning Discussion',
      duration: '8m 12s',
      timestamp: '5 hours ago',
      status: 'completed',
      interactions: 15,
      quality: 'good',
      deviceType: 'mobile'
    },
    {
      id: '3',
      title: 'Quick Question Session',
      duration: '3m 28s',
      timestamp: '1 day ago',
      status: 'completed',
      interactions: 7,
      quality: 'excellent',
      deviceType: 'tablet'
    },
    {
      id: '4',
      title: 'Research and Analysis',
      duration: '15m 36s',
      timestamp: '2 days ago',
      status: 'completed',
      interactions: 31,
      quality: 'good',
      deviceType: 'desktop'
    },
    {
      id: '5',
      title: 'Creative Brainstorming',
      duration: '20m 14s',
      timestamp: '3 days ago',
      status: 'completed',
      interactions: 42,
      quality: 'excellent',
      deviceType: 'desktop'
    }
  ];

  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: 'Start Voice Session',
      description: 'Begin a new voice conversation',
      icon: <Mic className="w-6 h-6" />,
      action: 'start-session',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: '2',
      title: 'Voice Training',
      description: 'Improve voice recognition',
      icon: <Brain className="w-6 h-6" />,
      action: 'training',
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: '3',
      title: 'Session History',
      description: 'View past conversations',
      icon: <Clock className="w-6 h-6" />,
      action: 'history',
      color: 'from-green-500 to-teal-600'
    },
    {
      id: '4',
      title: 'Voice Settings',
      description: 'Configure audio preferences',
      icon: <Settings className="w-6 h-6" />,
      action: 'settings',
      color: 'from-orange-500 to-red-600'
    },
    {
      id: '5',
      title: 'Analytics Dashboard',
      description: 'View detailed metrics',
      icon: <BarChart3 className="w-6 h-6" />,
      action: 'analytics',
      color: 'from-cyan-500 to-blue-600'
    },
    {
      id: '6',
      title: 'AI Personality',
      description: 'Customize assistant behavior',
      icon: <User className="w-6 h-6" />,
      action: 'personality',
      color: 'from-pink-500 to-rose-600'
    }
  ];

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'desktop': return <Monitor className="w-4 h-4" />;
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'fair': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

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
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    METU Voice AI
                  </h1>
                  <p className="text-gray-600 text-sm">
                    Advanced Voice Assistant Dashboard
                  </p>
                </div>
              </div>
              
              {/* Live Status Indicator */}
              <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full">
                <div className={`w-2 h-2 rounded-full ${activeVoiceSession ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                <span className="text-sm font-medium text-gray-700">
                  {activeVoiceSession ? 'Active Session' : 'Ready'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right text-sm text-gray-600">
                <div className="font-medium">{currentTime.toLocaleTimeString()}</div>
                <div className="text-xs">{currentTime.toLocaleDateString()}</div>
              </div>
              
              <button 
                onClick={() => setActiveVoiceSession(!activeVoiceSession)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                  activeVoiceSession 
                    ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                }`}
              >
                {activeVoiceSession ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{activeVoiceSession ? 'Stop Session' : 'Start Session'}</span>
              </button>
              
              <button className="bg-white/70 backdrop-blur-sm border border-blue-200 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200 flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>

          {/* Voice Level Visualizer */}
          {activeVoiceSession && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 pt-4 border-t border-blue-100"
            >
              <div className="flex items-center justify-center space-x-1">
                {Array.from({ length: 20 }, (_, i) => (
                  <div
                    key={i}
                    className={`w-2 rounded-full transition-all duration-100 ${
                      voiceLevel > (i * 5) ? 'bg-blue-500' : 'bg-gray-200'
                    }`}
                    style={{ height: `${Math.max(4, (voiceLevel > (i * 5) ? voiceLevel / 5 : 4))}px` }}
                  />
                ))}
              </div>
            </motion.div>
          )}
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
              { name: 'Dashboard', href: '/metu', current: true },
              { name: 'Conversations', href: '/metu/conversations', current: false },
              { name: 'Training', href: '/metu/training', current: false },
              { name: 'Analytics', href: '/metu/analytics', current: false },
              { name: 'Personality', href: '/metu/personality', current: false },
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Voice Metrics Dashboard */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8"
        >
          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{voiceMetrics.totalSessions.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Duration</p>
                <p className="text-2xl font-bold text-gray-900">{voiceMetrics.totalDuration}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Session</p>
                <p className="text-2xl font-bold text-gray-900">{voiceMetrics.averageSessionLength}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{voiceMetrics.successRate}%</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Voice Accuracy</p>
                <p className="text-2xl font-bold text-gray-900">{voiceMetrics.voiceAccuracy}%</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Mic className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Responsiveness</p>
                <p className="text-2xl font-bold text-gray-900">{voiceMetrics.responsiveness}%</p>
              </div>
              <div className="p-3 bg-pink-100 rounded-lg">
                <Zap className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <Zap className="w-5 h-5 text-blue-600" />
              <span>Quick Actions</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  className="group p-4 bg-white/50 rounded-lg border border-blue-50 hover:shadow-lg transition-all duration-300 text-left"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 bg-gradient-to-br ${action.color} text-white rounded-lg group-hover:scale-110 transition-transform duration-200`}>
                      {action.icon}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors duration-200" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recent Sessions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          
          {/* Sessions List */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span>Recent Sessions</span>
              </h2>
              <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1">
                <span>View All</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {recentSessions.map((session) => (
                <div key={session.id} className="p-4 bg-white/50 rounded-lg border border-blue-50 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{session.title}</h3>
                    <div className="flex items-center space-x-2">
                      {getDeviceIcon(session.deviceType)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQualityColor(session.quality)}`}>
                        {session.quality}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Duration:</span>
                      <br />
                      {session.duration}
                    </div>
                    <div>
                      <span className="font-medium">Interactions:</span>
                      <br />
                      {session.interactions}
                    </div>
                    <div>
                      <span className="font-medium">When:</span>
                      <br />
                      {session.timestamp}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Voice AI Status */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <Brain className="w-5 h-5 text-blue-600" />
              <span>AI Assistant Status</span>
            </h2>

            <div className="space-y-6">
              {/* Current Session Info */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <h3 className="font-semibold text-gray-900 mb-3">Current Session</h3>
                {activeVoiceSession ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className="text-sm font-medium text-green-600">Active & Listening</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Duration:</span>
                      <span className="text-sm font-medium text-gray-900">2m 34s</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Interactions:</span>
                      <span className="text-sm font-medium text-gray-900">7</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600">No active session. Click "Start Session" to begin.</p>
                )}
              </div>

              {/* System Health */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">System Health</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Voice Recognition</span>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-green-600">Optimal</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Audio Processing</span>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-green-600">Running</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">AI Response Engine</span>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-green-600">Ready</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Network Connection</span>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-green-600">Strong</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Statistics */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Today's Activity</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white/50 rounded-lg border border-blue-50">
                    <div className="text-xl font-bold text-blue-600">8</div>
                    <div className="text-xs text-gray-600">Sessions</div>
                  </div>
                  <div className="text-center p-3 bg-white/50 rounded-lg border border-blue-50">
                    <div className="text-xl font-bold text-green-600">67m</div>
                    <div className="text-xs text-gray-600">Talk Time</div>
                  </div>
                  <div className="text-center p-3 bg-white/50 rounded-lg border border-blue-50">
                    <div className="text-xl font-bold text-purple-600">142</div>
                    <div className="text-xs text-gray-600">Interactions</div>
                  </div>
                  <div className="text-center p-3 bg-white/50 rounded-lg border border-blue-50">
                    <div className="text-xl font-bold text-orange-600">97%</div>
                    <div className="text-xs text-gray-600">Accuracy</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modern Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white mt-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">METU Voice AI</h3>
              <p className="text-blue-200 mb-6 max-w-md">
                Experience the future of voice interaction with our advanced AI assistant. 
                Natural conversations, intelligent responses, and seamless voice recognition.
              </p>
              <div className="flex space-x-4">
                <button className="bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-all duration-200">
                  <Mic className="w-5 h-5" />
                </button>
                <button className="bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-all duration-200">
                  <Brain className="w-5 h-5" />
                </button>
                <button className="bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-all duration-200">
                  <Waves className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Voice Features</h4>
              <ul className="space-y-2 text-blue-200">
                <li><a href="#" className="hover:text-white transition-colors duration-200">Continuous Listening</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Voice Training</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Multi-Language</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Noise Cancellation</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">AI Capabilities</h4>
              <ul className="space-y-2 text-blue-200">
                <li><a href="#" className="hover:text-white transition-colors duration-200">Natural Language</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Context Awareness</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Personality Modes</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Learning Engine</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-blue-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-blue-200 text-sm">
              © 2025 METU Voice AI. Revolutionizing human-AI voice interaction.
            </p>
            <div className="mt-4 md:mt-0">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                🎤 {activeVoiceSession ? 'Session Active' : 'Ready to Talk'}
              </span>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
