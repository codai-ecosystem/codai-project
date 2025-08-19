'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Mic,
  MicOff,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Star,
  Target,
  Trophy,
  Award,
  BookOpen,
  Headphones,
  Speaker,
  Waves,
  BarChart3,
  TrendingUp,
  Calendar,
  Clock,
  User,
  Bot,
  Zap,
  Brain,
  Heart,
  Eye,
  Settings,
  Plus,
  Download,
  Upload,
  Save,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  PlayCircle,
  PauseCircle,
  Square,
  SkipForward,
  SkipBack,
  Volume1,
  VolumeOff,
  Repeat,
  Shuffle,
  Filter,
  Search,
  SortAsc,
  Grid3X3,
  List,
  Info,
  HelpCircle,
  Bookmark,
  Share2,
  Copy,
  Edit3,
  Trash2,
  MoreVertical,
  Activity,
  Gauge,
  LineChart,
  PieChart,
  Timer,
  Flame,
  Lightbulb,
  Shield,
  Lock,
  Globe,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: 'pronunciation' | 'accent' | 'clarity' | 'speed' | 'vocabulary' | 'conversation';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration: string;
  progress: number;
  completed: boolean;
  accuracy: number;
  attempts: number;
  lastSession: string;
  exercises: number;
  rating: number;
  tags: string[];
  level: number;
  prerequisite?: string;
}

interface TrainingSession {
  id: string;
  moduleId: string;
  startTime: string;
  duration: string;
  accuracy: number;
  improvements: string[];
  challenges: string[];
  score: number;
  quality: 'excellent' | 'good' | 'fair' | 'needs-work';
  status: 'completed' | 'in-progress' | 'paused';
}

interface VoiceMetrics {
  clarity: number;
  pronunciation: number;
  fluency: number;
  pace: number;
  volume: number;
  confidence: number;
}

export default function TrainingPage() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isTraining, setIsTraining] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [showMetrics, setShowMetrics] = useState(false);

  const trainingModules: TrainingModule[] = [
    {
      id: '1',
      title: 'English Pronunciation Fundamentals',
      description: 'Master the basic sounds and phonetics of English pronunciation with interactive exercises and real-time feedback.',
      category: 'pronunciation',
      difficulty: 'beginner',
      duration: '45 min',
      progress: 85,
      completed: false,
      accuracy: 78.5,
      attempts: 12,
      lastSession: '2 hours ago',
      exercises: 25,
      rating: 4.6,
      tags: ['phonetics', 'basics', 'IPA', 'sounds'],
      level: 1,
    },
    {
      id: '2',
      title: 'American Accent Training',
      description: 'Develop authentic American accent patterns through guided practice with native speaker models and pronunciation drills.',
      category: 'accent',
      difficulty: 'intermediate',
      duration: '60 min',
      progress: 45,
      completed: false,
      accuracy: 82.3,
      attempts: 8,
      lastSession: '1 day ago',
      exercises: 32,
      rating: 4.8,
      tags: ['american', 'accent', 'intonation', 'rhythm'],
      level: 2,
      prerequisite: '1'
    },
    {
      id: '3',
      title: 'Voice Clarity Enhancement',
      description: 'Improve speech clarity and articulation through targeted exercises focusing on consonant and vowel precision.',
      category: 'clarity',
      difficulty: 'intermediate',
      duration: '35 min',
      progress: 92,
      completed: true,
      accuracy: 94.2,
      attempts: 15,
      lastSession: '3 hours ago',
      exercises: 18,
      rating: 4.9,
      tags: ['clarity', 'articulation', 'precision', 'enunciation'],
      level: 2,
    },
    {
      id: '4',
      title: 'Speaking Speed Optimization',
      description: 'Find your optimal speaking pace for clear communication while maintaining natural flow and comprehension.',
      category: 'speed',
      difficulty: 'beginner',
      duration: '25 min',
      progress: 67,
      completed: false,
      accuracy: 71.8,
      attempts: 9,
      lastSession: '5 hours ago',
      exercises: 15,
      rating: 4.4,
      tags: ['pace', 'timing', 'rhythm', 'flow'],
      level: 1,
    },
    {
      id: '5',
      title: 'Business Vocabulary Mastery',
      description: 'Expand your professional vocabulary with industry-specific terms and practice using them in context.',
      category: 'vocabulary',
      difficulty: 'advanced',
      duration: '75 min',
      progress: 23,
      completed: false,
      accuracy: 86.7,
      attempts: 4,
      lastSession: '2 days ago',
      exercises: 45,
      rating: 4.7,
      tags: ['business', 'professional', 'vocabulary', 'context'],
      level: 3,
      prerequisite: '2'
    },
    {
      id: '6',
      title: 'Advanced Conversation Skills',
      description: 'Master complex conversation patterns, interruption handling, and natural dialogue flow in various scenarios.',
      category: 'conversation',
      difficulty: 'expert',
      duration: '90 min',
      progress: 8,
      completed: false,
      accuracy: 89.4,
      attempts: 2,
      lastSession: '1 week ago',
      exercises: 35,
      rating: 4.9,
      tags: ['conversation', 'dialogue', 'scenarios', 'advanced'],
      level: 4,
      prerequisite: '5'
    }
  ];

  const recentSessions: TrainingSession[] = [
    {
      id: '1',
      moduleId: '3',
      startTime: '2 hours ago',
      duration: '12m 35s',
      accuracy: 94.2,
      improvements: ['Consonant clarity', 'Voice projection', 'Pace consistency'],
      challenges: ['Word endings', 'Complex consonant clusters'],
      score: 92,
      quality: 'excellent',
      status: 'completed'
    },
    {
      id: '2',
      moduleId: '1',
      startTime: '4 hours ago',
      duration: '18m 22s',
      accuracy: 78.5,
      improvements: ['Vowel sounds', 'Stress patterns'],
      challenges: ['Diphthongs', 'Weak forms'],
      score: 76,
      quality: 'good',
      status: 'completed'
    },
    {
      id: '3',
      moduleId: '4',
      startTime: '6 hours ago',
      duration: '8m 45s',
      accuracy: 71.8,
      improvements: ['Reading pace', 'Natural pauses'],
      challenges: ['Maintaining speed', 'Breath control'],
      score: 68,
      quality: 'fair',
      status: 'completed'
    }
  ];

  const currentMetrics: VoiceMetrics = {
    clarity: 87.5,
    pronunciation: 82.3,
    fluency: 79.8,
    pace: 85.2,
    volume: 91.4,
    confidence: 76.9
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-blue-600 bg-blue-100';
      case 'advanced': return 'text-orange-600 bg-orange-100';
      case 'expert': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'pronunciation': return <Volume2 className="w-5 h-5" />;
      case 'accent': return <Globe className="w-5 h-5" />;
      case 'clarity': return <Eye className="w-5 h-5" />;
      case 'speed': return <Gauge className="w-5 h-5" />;
      case 'vocabulary': return <BookOpen className="w-5 h-5" />;
      case 'conversation': return <Bot className="w-5 h-5" />;
      default: return <GraduationCap className="w-5 h-5" />;
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'fair': return 'text-yellow-600 bg-yellow-100';
      case 'needs-work': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredModules = trainingModules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || module.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const selectedModuleData = trainingModules.find(m => m.id === selectedModule);

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
                Voice Training
              </h1>
              <p className="text-gray-600 mt-1">
                Improve your voice skills with personalized training modules
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Create Custom Module</span>
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
              { name: 'Training', href: '/metu/training', current: true },
              { name: 'Analytics', href: '/metu/analytics', current: false },
              { name: 'Personality', href: '/metu/personality', current: false },
              { name: 'Integrations', href: '/metu/integrations', current: false },
              { name: 'Settings', href: '/metu/settings', current: false },
            ].map((tab) => (
              <a
                key={tab.name}
                href={tab.href}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${tab.current
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

        {/* Current Metrics Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100 p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span>Current Voice Metrics</span>
            </h2>
            <button
              onClick={() => setShowMetrics(!showMetrics)}
              className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <span className="text-sm">Details</span>
              <ChevronDown className={`w-4 h-4 transform transition-transform duration-200 ${showMetrics ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(currentMetrics).map(([metric, value]) => (
              <div key={metric} className="text-center p-4 bg-white/50 rounded-lg border border-blue-50">
                <div className="flex justify-center mb-2">
                  {metric === 'clarity' && <Eye className="w-6 h-6 text-blue-600" />}
                  {metric === 'pronunciation' && <Volume2 className="w-6 h-6 text-green-600" />}
                  {metric === 'fluency' && <Waves className="w-6 h-6 text-purple-600" />}
                  {metric === 'pace' && <Gauge className="w-6 h-6 text-orange-600" />}
                  {metric === 'volume' && <Speaker className="w-6 h-6 text-red-600" />}
                  {metric === 'confidence' && <Brain className="w-6 h-6 text-indigo-600" />}
                </div>
                <div className="text-2xl font-bold text-gray-900">{value.toFixed(1)}%</div>
                <div className="text-sm text-gray-600 capitalize">{metric}</div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${value >= 90 ? 'bg-green-500' :
                        value >= 75 ? 'bg-blue-500' :
                          value >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {showMetrics && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100"
            >
              <h3 className="font-semibold text-gray-900 mb-3">Metric Breakdown & Recommendations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Strong Areas:</strong>
                  <ul className="mt-1 space-y-1 text-gray-600">
                    <li>• Volume control ({currentMetrics.volume}%)</li>
                    <li>• Speech clarity ({currentMetrics.clarity}%)</li>
                    <li>• Speaking pace ({currentMetrics.pace}%)</li>
                  </ul>
                </div>
                <div>
                  <strong>Areas for Improvement:</strong>
                  <ul className="mt-1 space-y-1 text-gray-600">
                    <li>• Voice confidence ({currentMetrics.confidence}%)</li>
                    <li>• Speech fluency ({currentMetrics.fluency}%)</li>
                    <li>• Pronunciation precision ({currentMetrics.pronunciation}%)</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100 p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search training modules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50"
              >
                <option value="all">All Categories</option>
                <option value="pronunciation">Pronunciation</option>
                <option value="accent">Accent</option>
                <option value="clarity">Clarity</option>
                <option value="speed">Speed</option>
                <option value="vocabulary">Vocabulary</option>
                <option value="conversation">Conversation</option>
              </select>

              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50"
              >
                <option value="all">All Difficulties</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>

              <div className="flex border border-gray-200 rounded-lg bg-white/50">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white/50 rounded-lg border border-blue-50">
              <div className="text-2xl font-bold text-blue-600">{filteredModules.length}</div>
              <div className="text-sm text-gray-600">Available Modules</div>
            </div>
            <div className="text-center p-3 bg-white/50 rounded-lg border border-blue-50">
              <div className="text-2xl font-bold text-green-600">
                {filteredModules.filter(m => m.completed).length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center p-3 bg-white/50 rounded-lg border border-blue-50">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(filteredModules.reduce((total, m) => total + m.progress, 0) / filteredModules.length)}%
              </div>
              <div className="text-sm text-gray-600">Avg Progress</div>
            </div>
            <div className="text-center p-3 bg-white/50 rounded-lg border border-blue-50">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(filteredModules.reduce((total, m) => total + m.accuracy, 0) / filteredModules.length)}%
              </div>
              <div className="text-sm text-gray-600">Avg Accuracy</div>
            </div>
          </div>
        </motion.div>

        {/* Training Modules */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Modules List/Grid */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  <span>Training Modules</span>
                </h2>
                <span className="text-sm text-gray-500">{filteredModules.length} modules</span>
              </div>

              <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} max-h-[700px] overflow-y-auto`}>
                {filteredModules.map((module) => (
                  <div
                    key={module.id}
                    className={`p-4 rounded-lg border transition-all duration-300 cursor-pointer ${selectedModule === module.id
                        ? 'bg-blue-50 border-blue-200 shadow-md'
                        : 'bg-white/50 border-blue-50 hover:bg-blue-25 hover:border-blue-100'
                      }`}
                    onClick={() => setSelectedModule(module.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(module.category)}
                        <div>
                          <h3 className="font-semibold text-gray-900">{module.title}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(module.difficulty)}`}>
                              {module.difficulty}
                            </span>
                            <span className="text-sm text-gray-500">Level {module.level}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {module.completed && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                        <span className="text-sm font-medium text-gray-700">{module.progress}%</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{module.description}</p>

                    <div className="space-y-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${module.completed ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                          style={{ width: `${module.progress}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-3">
                          <span className="text-gray-500">⏱️ {module.duration}</span>
                          <span className="text-gray-500">📋 {module.exercises} exercises</span>
                          <span className="text-gray-500">🎯 {module.accuracy}% accuracy</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-gray-600">{module.rating}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{module.attempts} attempts</span>
                        <span>Last: {module.lastSession}</span>
                      </div>
                    </div>

                    {module.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {module.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                        {module.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{module.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {module.prerequisite && (
                      <div className="mt-2 text-xs text-orange-600 flex items-center space-x-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>Requires completion of previous module</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Module Details & Recent Sessions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Selected Module Details */}
            {selectedModuleData ? (
              <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Module Details</h3>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200">
                      <Bookmark className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">{selectedModuleData.title}</h4>
                    <p className="text-sm text-gray-600">{selectedModuleData.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Duration:</span>
                      <br />
                      {selectedModuleData.duration}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Exercises:</span>
                      <br />
                      {selectedModuleData.exercises}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Difficulty:</span>
                      <br />
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedModuleData.difficulty)}`}>
                        {selectedModuleData.difficulty}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Rating:</span>
                      <br />
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span>{selectedModuleData.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700">Progress:</span>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${selectedModuleData.completed ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                        style={{ width: `${selectedModuleData.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{selectedModuleData.progress}% complete</span>
                      <span>{selectedModuleData.accuracy}% accuracy</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-blue-100">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium flex items-center justify-center space-x-2"
                        onClick={() => setIsTraining(true)}
                      >
                        <Play className="w-4 h-4" />
                        <span>Start Training</span>
                      </button>
                      <button className="bg-green-100 text-green-600 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors duration-200 text-sm font-medium">
                        Preview
                      </button>
                      <button className="bg-purple-100 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors duration-200 text-sm font-medium">
                        Download
                      </button>
                      <button className="bg-orange-100 text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-200 transition-colors duration-200 text-sm font-medium">
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100 p-6">
                <div className="text-center py-12">
                  <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Module</h3>
                  <p className="text-gray-600">
                    Choose a training module to view details and start your voice improvement journey.
                  </p>
                </div>
              </div>
            )}

            {/* Recent Training Sessions */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span>Recent Sessions</span>
              </h3>

              <div className="space-y-3">
                {recentSessions.map((session) => {
                  const moduleTitle = trainingModules.find(m => m.id === session.moduleId)?.title || 'Unknown Module';
                  return (
                    <div key={session.id} className="p-3 bg-white/50 rounded-lg border border-blue-50">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">{moduleTitle}</h4>
                          <p className="text-xs text-gray-500">{session.startTime} • {session.duration}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQualityColor(session.quality)}`}>
                          {session.quality}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Score: {session.score}%</span>
                        <span className="text-gray-600">Accuracy: {session.accuracy}%</span>
                      </div>

                      <div className="mt-2 text-xs text-gray-500">
                        <div>✅ {session.improvements.join(', ')}</div>
                        <div>⚠️ {session.challenges.join(', ')}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button className="w-full mt-4 bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm font-medium">
                View All Sessions
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modern Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white mt-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">METU Voice Training</h3>
              <p className="text-blue-200 mb-6 max-w-md">
                Enhance your voice skills with our comprehensive training modules.
                From pronunciation basics to advanced conversation techniques.
              </p>
              <div className="flex space-x-4">
                <button className="bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-all duration-200">
                  <GraduationCap className="w-5 h-5" />
                </button>
                <button className="bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-all duration-200">
                  <Mic className="w-5 h-5" />
                </button>
                <button className="bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-all duration-200">
                  <Trophy className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Training Categories</h4>
              <ul className="space-y-2 text-blue-200">
                <li><a href="#" className="hover:text-white transition-colors duration-200">Pronunciation</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Accent Training</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Speech Clarity</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Vocabulary Building</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Progress Tracking</h4>
              <ul className="space-y-2 text-blue-200">
                <li><a href="#" className="hover:text-white transition-colors duration-200">Voice Metrics</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Improvement Analytics</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Session History</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Achievement Badges</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-blue-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-blue-200 text-sm">
              © 2025 METU Training. Improve your voice, unlock your potential.
            </p>
            <div className="mt-4 md:mt-0">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                🎯 {Math.round(currentMetrics.clarity)}% Current Performance
              </span>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
