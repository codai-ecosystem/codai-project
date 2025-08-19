'use client'

import React, { useState } from 'react'
import {
  ClipboardCheck,
  Search,
  Filter,
  Grid,
  List,
  Star,
  Clock,
  Users,
  Play,
  Award,
  Bookmark,
  Heart,
  Share2,
  Download,
  Eye,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Check,
  X,
  ArrowRight,
  BarChart3,
  Target,
  Zap,
  Brain,
  Globe,
  Video,
  FileText,
  Headphones,
  Code,
  Palette,
  Calculator,
  Microscope,
  Music,
  Camera,
  TrendingUp,
  Calendar,
  BookOpen,
  Tag,
  Info,
  ExternalLink,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Timer,
  Trophy,
  Medal,
  Percent,
  Hash,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Flag,
  RotateCcw,
  PlayCircle,
  PauseCircle,
  StopCircle,
  FastForward,
  SkipForward,
  Volume2,
  VolumeX,
  Settings,
  HelpCircle,
  Lightbulb,
  Layers,
  PieChart,
  LineChart,
  Activity
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function AssessmentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)

  const assessmentStats = [
    { icon: ClipboardCheck, label: 'Total Assessments', value: '247', change: '+23', color: 'text-blue-600' },
    { icon: Trophy, label: 'Completed', value: '89', change: '+12', color: 'text-green-600' },
    { icon: Target, label: 'Average Score', value: '84%', change: '+3%', color: 'text-purple-600' },
    { icon: Award, label: 'Certificates Earned', value: '34', change: '+8', color: 'text-yellow-600' }
  ]

  const assessmentCategories = [
    { id: 'all', name: 'All Assessments', icon: Grid, count: 247, color: 'bg-gray-500' },
    { id: 'ai-ml', name: 'AI & Machine Learning', icon: Brain, count: 34, color: 'bg-purple-500' },
    { id: 'web-dev', name: 'Web Development', icon: Code, count: 45, color: 'bg-blue-500' },
    { id: 'data-science', name: 'Data Science', icon: BarChart3, count: 28, color: 'bg-green-500' },
    { id: 'design', name: 'Design & UX', icon: Palette, count: 19, color: 'bg-pink-500' },
    { id: 'business', name: 'Business Skills', icon: Target, count: 32, color: 'bg-orange-500' },
    { id: 'cybersecurity', name: 'Cybersecurity', icon: Zap, count: 21, color: 'bg-red-500' },
    { id: 'mobile', name: 'Mobile Development', icon: Globe, count: 18, color: 'bg-indigo-500' },
    { id: 'devops', name: 'DevOps & Cloud', icon: Activity, count: 26, color: 'bg-teal-500' },
    { id: 'general', name: 'General Knowledge', icon: Lightbulb, count: 24, color: 'bg-yellow-500' }
  ]

  const assessments = [
    {
      id: 1,
      title: 'Machine Learning Fundamentals Quiz',
      description: 'Test your understanding of core machine learning concepts, algorithms, and best practices.',
      category: 'ai-ml',
      type: 'quiz',
      difficulty: 'intermediate',
      duration: 45,
      questionsCount: 25,
      passingScore: 80,
      attempts: 2,
      maxAttempts: 3,
      bestScore: 87,
      lastScore: 87,
      status: 'completed',
      thumbnail: '🤖',
      course: 'Complete Machine Learning Bootcamp',
      instructor: 'Dr. Sarah Chen',
      lastAttempt: '2 days ago',
      averageScore: 76,
      passRate: 68,
      tags: ['ML', 'Algorithms', 'Python'],
      hasTimer: true,
      hasCertificate: true,
      isRequired: true,
      weight: 25,
      feedback: 'Excellent understanding of supervised learning concepts. Consider reviewing unsupervised learning techniques.',
      nextAssessment: 'Deep Learning Practical Test',
      prerequisites: ['Python Basics', 'Statistics']
    },
    {
      id: 2,
      title: 'React Component Architecture Assessment',
      description: 'Practical coding assessment covering React components, hooks, and state management patterns.',
      category: 'web-dev',
      type: 'practical',
      difficulty: 'advanced',
      duration: 120,
      questionsCount: 8,
      passingScore: 75,
      attempts: 0,
      maxAttempts: 2,
      bestScore: null,
      lastScore: null,
      status: 'not-started',
      thumbnail: '⚛️',
      course: 'React & Next.js Full Stack Development',
      instructor: 'Prof. Alex Rodriguez',
      lastAttempt: null,
      averageScore: 82,
      passRate: 73,
      tags: ['React', 'Components', 'State Management'],
      hasTimer: true,
      hasCertificate: true,
      isRequired: true,
      weight: 35,
      feedback: null,
      nextAssessment: 'Next.js Performance Optimization',
      prerequisites: ['JavaScript ES6', 'React Basics']
    },
    {
      id: 3,
      title: 'Data Visualization with Python',
      description: 'Create interactive charts and dashboards using matplotlib, seaborn, and plotly libraries.',
      category: 'data-science',
      type: 'project',
      difficulty: 'intermediate',
      duration: 180,
      questionsCount: 5,
      passingScore: 70,
      attempts: 1,
      maxAttempts: 3,
      bestScore: 92,
      lastScore: 92,
      status: 'completed',
      thumbnail: '📊',
      course: 'Data Science with Python',
      instructor: 'Dr. Emily Watson',
      lastAttempt: '1 week ago',
      averageScore: 79,
      passRate: 81,
      tags: ['Python', 'Visualization', 'Charts'],
      hasTimer: false,
      hasCertificate: true,
      isRequired: false,
      weight: 30,
      feedback: 'Outstanding work on interactive visualizations. Your dashboard design shows excellent UX awareness.',
      nextAssessment: 'Statistical Analysis Project',
      prerequisites: ['Pandas Basics', 'Data Cleaning']
    },
    {
      id: 4,
      title: 'UX Research Methods Evaluation',
      description: 'Comprehensive assessment of user research methodologies, interview techniques, and usability testing.',
      category: 'design',
      type: 'case-study',
      difficulty: 'intermediate',
      duration: 90,
      questionsCount: 12,
      passingScore: 75,
      attempts: 1,
      maxAttempts: 2,
      bestScore: 78,
      lastScore: 78,
      status: 'passed',
      thumbnail: '🎨',
      course: 'UX/UI Design Fundamentals',
      instructor: 'Maria Gonzalez',
      lastAttempt: '3 days ago',
      averageScore: 74,
      passRate: 67,
      tags: ['UX Research', 'Usability', 'User Testing'],
      hasTimer: true,
      hasCertificate: false,
      isRequired: true,
      weight: 20,
      feedback: 'Good grasp of research methods. Work on improving stakeholder interview techniques.',
      nextAssessment: 'Design System Creation',
      prerequisites: ['Design Thinking']
    },
    {
      id: 5,
      title: 'Cybersecurity Incident Response Simulation',
      description: 'Real-world scenario simulation testing incident detection, analysis, and response procedures.',
      category: 'cybersecurity',
      type: 'simulation',
      difficulty: 'advanced',
      duration: 150,
      questionsCount: 15,
      passingScore: 85,
      attempts: 0,
      maxAttempts: 2,
      bestScore: null,
      lastScore: null,
      status: 'locked',
      thumbnail: '🔒',
      course: 'Cybersecurity Specialist',
      instructor: 'Dr. Michael Zhang',
      lastAttempt: null,
      averageScore: 77,
      passRate: 54,
      tags: ['Security', 'Incident Response', 'Forensics'],
      hasTimer: true,
      hasCertificate: true,
      isRequired: true,
      weight: 40,
      feedback: null,
      nextAssessment: 'Penetration Testing Lab',
      prerequisites: ['Network Security', 'Risk Assessment']
    },
    {
      id: 6,
      title: 'Digital Marketing Campaign Analysis',
      description: 'Analyze real marketing campaigns and create optimization strategies based on performance data.',
      category: 'business',
      type: 'case-study',
      difficulty: 'intermediate',
      duration: 100,
      questionsCount: 10,
      passingScore: 70,
      attempts: 2,
      maxAttempts: 3,
      bestScore: 83,
      lastScore: 71,
      status: 'in-progress',
      thumbnail: '📈',
      course: 'Digital Marketing Mastery',
      instructor: 'James Thompson',
      lastAttempt: '5 hours ago',
      averageScore: 75,
      passRate: 72,
      tags: ['Marketing', 'Analytics', 'ROI'],
      hasTimer: true,
      hasCertificate: false,
      isRequired: false,
      weight: 25,
      feedback: 'Good analytical skills. Focus on improving conversion optimization strategies.',
      nextAssessment: 'Social Media Strategy Design',
      prerequisites: ['Marketing Fundamentals']
    }
  ]

  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === 'all' || assessment.category === selectedCategory
    const matchesType = selectedType === 'all' || assessment.type === selectedType
    const matchesDifficulty = selectedDifficulty === 'all' || assessment.difficulty === selectedDifficulty
    const matchesStatus = selectedStatus === 'all' || assessment.status === selectedStatus

    return matchesSearch && matchesCategory && matchesType && matchesDifficulty && matchesStatus
  })

  const sortedAssessments = [...filteredAssessments].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        if (!a.lastAttempt && !b.lastAttempt) return 0
        if (!a.lastAttempt) return 1
        if (!b.lastAttempt) return -1
        return new Date(b.lastAttempt) - new Date(a.lastAttempt)
      case 'score':
        return (b.bestScore || 0) - (a.bestScore || 0)
      case 'difficulty':
        const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 }
        return difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty]
      case 'duration':
        return a.duration - b.duration
      default:
        return 0
    }
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'passed':
        return 'text-green-600 bg-green-100'
      case 'failed':
        return 'text-red-600 bg-red-100'
      case 'in-progress':
        return 'text-blue-600 bg-blue-100'
      case 'locked':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-yellow-600 bg-yellow-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'passed':
        return <CheckCircle className="h-4 w-4" />
      case 'failed':
        return <XCircle className="h-4 w-4" />
      case 'in-progress':
        return <Timer className="h-4 w-4" />
      case 'locked':
        return <Lock className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'quiz':
        return <ClipboardCheck className="h-4 w-4" />
      case 'practical':
        return <Code className="h-4 w-4" />
      case 'project':
        return <Layers className="h-4 w-4" />
      case 'case-study':
        return <FileText className="h-4 w-4" />
      case 'simulation':
        return <PlayCircle className="h-4 w-4" />
      default:
        return <HelpCircle className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <ClipboardCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Assessments
                </h1>
                <p className="text-sm text-gray-600">Test your knowledge and track progress</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search assessments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm w-80"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
              >
                <Filter className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Assessment Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {assessmentStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100 hover:border-blue-200 transition-all"
            >
              <div className="flex items-center justify-between">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <span className="text-green-600 text-sm font-medium">{stat.change}</span>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                <p className="text-gray-600 text-sm">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Categories */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {assessmentCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-3 p-3 rounded-lg text-left transition-all ${selectedCategory === category.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'hover:bg-gray-50 text-gray-700'
                  }`}
              >
                <div className={`w-8 h-8 ${category.color} rounded-lg flex items-center justify-center`}>
                  <category.icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{category.name}</div>
                  <div className="text-xs text-gray-500">{category.count} assessments</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100 mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="quiz">Quiz</option>
                  <option value="practical">Practical</option>
                  <option value="project">Project</option>
                  <option value="case-study">Case Study</option>
                  <option value="simulation">Simulation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="not-started">Not Started</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="passed">Passed</option>
                  <option value="failed">Failed</option>
                  <option value="locked">Locked</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="recent">Most Recent</option>
                  <option value="score">Highest Score</option>
                  <option value="difficulty">Difficulty</option>
                  <option value="duration">Duration</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">View</label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                      }`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                      }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Assessments Grid */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {sortedAssessments.length} Assessment{sortedAssessments.length !== 1 ? 's' : ''} Found
              </h2>
              <p className="text-gray-600 text-sm">
                {selectedCategory !== 'all' && `in ${assessmentCategories.find(c => c.id === selectedCategory)?.name}`}
              </p>
            </div>
          </div>

          <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-4'}`}>
            {sortedAssessments.map((assessment) => (
              <motion.div
                key={assessment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-all group cursor-pointer"
              >
                {viewMode === 'grid' ? (
                  <div>
                    {/* Assessment Header */}
                    <div className="relative p-6 bg-gradient-to-br from-blue-500 to-purple-600">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white text-2xl">
                          {assessment.thumbnail}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(assessment.status)}`}>
                            {getStatusIcon(assessment.status)}
                            <span className="capitalize">{assessment.status.replace('-', ' ')}</span>
                          </span>
                          {assessment.isRequired && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                              Required
                            </span>
                          )}
                        </div>
                      </div>
                      <h3 className="font-bold text-white text-lg mb-2 group-hover:text-yellow-200 transition-colors">
                        {assessment.title}
                      </h3>
                      <p className="text-white/80 text-sm mb-3">{assessment.course}</p>
                      <div className="flex items-center space-x-4 text-white/80 text-sm">
                        <div className="flex items-center space-x-1">
                          {getTypeIcon(assessment.type)}
                          <span className="capitalize">{assessment.type.replace('-', ' ')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{assessment.duration}min</span>
                        </div>
                      </div>
                    </div>

                    {/* Assessment Body */}
                    <div className="p-6">
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{assessment.description}</p>

                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center space-x-2">
                          <Hash className="h-4 w-4" />
                          <span>{assessment.questionsCount} questions</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Target className="h-4 w-4" />
                          <span>{assessment.passingScore}% to pass</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RotateCcw className="h-4 w-4" />
                          <span>{assessment.attempts}/{assessment.maxAttempts} attempts</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Percent className="h-4 w-4" />
                          <span>Weight: {assessment.weight}%</span>
                        </div>
                      </div>

                      {/* Score Display */}
                      {assessment.bestScore !== null && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-600">Best Score</span>
                            <span className={`font-bold ${assessment.bestScore >= assessment.passingScore ? 'text-green-600' : 'text-red-600'
                              }`}>
                              {assessment.bestScore}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${assessment.bestScore >= assessment.passingScore
                                  ? 'bg-gradient-to-r from-green-500 to-green-600'
                                  : 'bg-gradient-to-r from-red-500 to-red-600'
                                }`}
                              style={{ width: `${assessment.bestScore}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Performance Stats */}
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="h-4 w-4" />
                          <span>Avg: {assessment.averageScore}%</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-4 w-4" />
                          <span>Pass rate: {assessment.passRate}%</span>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {assessment.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {tag}
                          </span>
                        ))}
                        {assessment.tags.length > 3 && (
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                            +{assessment.tags.length - 3} more
                          </span>
                        )}
                      </div>

                      {/* Feedback */}
                      {assessment.feedback && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                          <div className="flex items-start space-x-2">
                            <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <p className="text-blue-800 text-sm">{assessment.feedback}</p>
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      <button
                        className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${assessment.status === 'locked'
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : assessment.status === 'completed' || assessment.status === 'passed'
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : assessment.status === 'in-progress'
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-purple-600 text-white hover:bg-purple-700'
                          }`}
                        disabled={assessment.status === 'locked'}
                      >
                        {assessment.status === 'locked' ? 'Prerequisites Required' :
                          assessment.status === 'completed' || assessment.status === 'passed' ? 'Retake Assessment' :
                            assessment.status === 'in-progress' ? 'Continue Assessment' :
                              'Start Assessment'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-6 p-4">
                    <div className="w-24 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0">
                      {assessment.thumbnail}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 truncate">{assessment.title}</h3>
                        <div className="flex items-center space-x-2">
                          <span className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(assessment.status)}`}>
                            {getStatusIcon(assessment.status)}
                            <span className="capitalize">{assessment.status.replace('-', ' ')}</span>
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {assessment.course} • {assessment.duration}min • {assessment.questionsCount} questions
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Pass: {assessment.passingScore}%</span>
                        {assessment.bestScore !== null && (
                          <span className={`font-medium ${assessment.bestScore >= assessment.passingScore ? 'text-green-600' : 'text-red-600'
                            }`}>
                            Best: {assessment.bestScore}%
                          </span>
                        )}
                        <button className={`px-4 py-1 rounded text-sm transition-colors ${assessment.status === 'locked'
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}>
                          {assessment.status === 'locked' ? 'Locked' : 'Start'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {sortedAssessments.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No assessments found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('all')
                  setSelectedType('all')
                  setSelectedDifficulty('all')
                  setSelectedStatus('all')
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-blue-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <ClipboardCheck className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                StudiAI Assessments
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Test your knowledge and validate your learning progress
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <a href="#" className="hover:text-blue-600 transition-colors">All Assessments</a>
              <a href="#" className="hover:text-blue-600 transition-colors">My Results</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Certificates</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Study Tips</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
