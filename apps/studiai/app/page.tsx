'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Brain,
  Award,
  TrendingUp,
  Activity,
  Clock,
  Users,
  Settings,
  ChevronRight,
  Star,
  ArrowRight,
  Zap
} from 'lucide-react'

interface AppMetric {
  id: string
  title: string
  value: string
  change: string
  trend: 'up' | 'down' | 'stable'
  icon: string
  color: string
}

interface FeatureCard {
  id: string
  title: string
  description: string
  icon: string
  status: 'active' | 'beta' | 'coming-soon'
}

export default function StudiAIPage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'analytics' | 'settings'>('overview')

  const [metrics] = useState<AppMetric[]>([
    {
      id: '1',
      title: 'Active Users',
      value: '12.4K',
      change: '+8.2%',
      trend: 'up',
      icon: 'BookOpen',
      color: 'blue'
    },
    {
      id: '2',
      title: 'Performance',
      value: '98.5%',
      change: '+2.1%',
      trend: 'up',
      icon: 'Brain',
      color: 'green'
    },
    {
      id: '3',
      title: 'Features',
      value: '4',
      change: '0%',
      trend: 'stable',
      icon: 'Award',
      color: 'blue'
    },
    {
      id: '4',
      title: 'Satisfaction',
      value: '4.9/5',
      change: '+0.2',
      trend: 'up',
      icon: 'TrendingUp',
      color: 'purple'
    }
  ])

  const [featureCards] = useState<FeatureCard[]>([
    {
      id: '1',
      title: 'AI Tutoring',
      description: 'Advanced ai tutoring capabilities with AI optimization',
      icon: 'BookOpen',
      status: 'active'
    },
    {
      id: '2',
      title: 'Learning Analytics',
      description: 'Advanced learning analytics capabilities with AI optimization',
      icon: 'Brain',
      status: 'active'
    },
    {
      id: '3',
      title: 'Assessment',
      description: 'Advanced assessment capabilities with AI optimization',
      icon: 'Award',
      status: 'active'
    },
    {
      id: '4',
      title: 'Progress Tracking',
      description: 'Advanced progress tracking capabilities with AI optimization',
      icon: 'TrendingUp',
      status: 'active'
    }
  ])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Enhanced tab change handler
  const handleTabChange = async (tab: 'overview' | 'features' | 'analytics' | 'settings') => {
    setActiveTab(tab)
    console.log('StudiAI: Tab changed to', tab)
  }

  // Education interaction simulation functions
  const simulateStartLesson = async () => {
    const studentId = 'demo_student_001'
    const lessonId = 'lesson_' + Math.random().toString(36).substr(2, 9)
    const courseId = 'course_math_101'

    console.log('StudiAI: Lesson start logged successfully', { studentId, lessonId, courseId })
  }

  const simulateCompleteAssessment = async () => {
    const studentId = 'demo_student_001'
    const assessmentId = 'assessment_' + Math.random().toString(36).substr(2, 9)
    const score = Math.floor(Math.random() * 40) + 60 // 60-100 score

    console.log('StudiAI: Assessment completion logged successfully', { studentId, assessmentId, score })
  }

  const simulateProgressUpdate = async () => {
    const studentId = 'demo_student_001'
    const progressData = {
      subject: 'Mathematics',
      completedLessons: Math.floor(Math.random() * 20) + 10,
      totalLessons: 30,
      averageScore: Math.floor(Math.random() * 30) + 70,
      timeSpent: Math.floor(Math.random() * 60) + 30, // minutes
      skillsImproved: ['algebra', 'geometry', 'statistics'].slice(0, Math.floor(Math.random() * 3) + 1)
    }

    console.log('StudiAI: Student progress logged successfully', { studentId, progressData })
  }

  const simulateAITutoring = async () => {
    const studentId = 'demo_student_001'
    const tutorData = {
      query: 'Help me understand quadratic equations',
      response: 'A quadratic equation is a polynomial equation of degree 2...',
      helpful: true,
      difficulty: 'intermediate',
      subject: 'algebra'
    }

    console.log('StudiAI: AI tutoring interaction logged successfully', { studentId, tutorData })
  }

  const simulateCollaboration = async () => {
    const studentId = 'demo_student_001'
    const collaborationData = {
      type: 'peer_discussion',
      topicId: 'calculus_derivatives',
      participants: ['student_002', 'student_003'],
      duration: Math.floor(Math.random() * 30) + 15, // 15-45 minutes
      messagesExchanged: Math.floor(Math.random() * 20) + 5
    }

    console.log('StudiAI: Collaboration activity logged successfully', { studentId, collaborationData })
  }

  const renderIcon = (iconName: string, className: string = "w-6 h-6") => {
    const iconMap: { [key: string]: any } = {
      BookOpen,
      Brain,
      Award,
      TrendingUp,
      Activity,
      Clock,
      Users,
      Settings,
      Star,
      Zap
    }

    const IconComponent = iconMap[iconName]
    return IconComponent ? <IconComponent className={className} /> : null
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/20'
      case 'beta': return 'text-yellow-400 bg-yellow-400/20'
      case 'coming-soon': return 'text-gray-400 bg-gray-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -100, 50, 0],
            scale: [1, 1.2, 0.8, 1]
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            x: [0, -50, 100, 0],
            y: [0, 50, -100, 0],
            scale: [1, 0.8, 1.2, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, delay: 5 }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                {renderIcon('BookOpen', 'w-8 h-8 text-white')}
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  StudiAI
                </h1>
                <p className="text-sm text-gray-400">AI Learning Platform</p>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center space-x-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="text-sm text-gray-400">
                {currentTime.toLocaleTimeString()}
              </div>
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm font-medium">Live</span>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          className="flex justify-center space-x-1 bg-white/5 backdrop-blur-lg rounded-2xl p-1 max-w-2xl mx-auto border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {(['overview', 'features', 'analytics', 'settings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${activeTab === tab
                ? 'bg-blue-500/30 text-blue-300 shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center"
              >
                <h2 className="text-2xl font-bold text-blue-400 mb-4">Educational platform with AI-powered learning and assessment tools</h2>
                <p className="text-gray-300 text-lg max-w-3xl mx-auto">
                  Experience the power of AI-driven technology with our advanced platform designed for modern businesses and developers.
                </p>
              </motion.div>

              {/* LogAI Integration Demonstration */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl rounded-2xl border border-blue-500/20 p-6"
              >
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-blue-400 mb-2">🎓 LogAI Education Integration Live Demo</h3>
                  <p className="text-gray-300">Experience comprehensive education activity logging with AI-powered insights</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <button
                    onClick={simulateStartLesson}
                    className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl p-4 transition-all duration-300 group"
                  >
                    <BookOpen className="w-6 h-6 text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <div className="text-sm font-medium text-blue-300">Start Lesson</div>
                    <div className="text-xs text-gray-400 mt-1">Log learning activity</div>
                  </button>

                  <button
                    onClick={simulateCompleteAssessment}
                    className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-xl p-4 transition-all duration-300 group"
                  >
                    <Award className="w-6 h-6 text-green-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <div className="text-sm font-medium text-green-300">Complete Test</div>
                    <div className="text-xs text-gray-400 mt-1">Log assessment results</div>
                  </button>

                  <button
                    onClick={simulateProgressUpdate}
                    className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-xl p-4 transition-all duration-300 group"
                  >
                    <TrendingUp className="w-6 h-6 text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <div className="text-sm font-medium text-purple-300">Track Progress</div>
                    <div className="text-xs text-gray-400 mt-1">Log student advancement</div>
                  </button>

                  <button
                    onClick={simulateAITutoring}
                    className="bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 rounded-xl p-4 transition-all duration-300 group"
                  >
                    <Brain className="w-6 h-6 text-yellow-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <div className="text-sm font-medium text-yellow-300">AI Tutoring</div>
                    <div className="text-xs text-gray-400 mt-1">Log AI interactions</div>
                  </button>

                  <button
                    onClick={simulateCollaboration}
                    className="bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-xl p-4 transition-all duration-300 group"
                  >
                    <Users className="w-6 h-6 text-cyan-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <div className="text-sm font-medium text-cyan-300">Collaborate</div>
                    <div className="text-xs text-gray-400 mt-1">Log peer interactions</div>
                  </button>
                </div>

                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-400">
                    🚀 Check browser console for LogAI education logging confirmations
                  </p>
                </div>
              </motion.div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric, index) => (
                  <motion.div
                    key={metric.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-${metric.color}-500/20`}>
                        {renderIcon(metric.icon, `w-6 h-6 text-${metric.color}-400`)}
                      </div>
                      <div className={`flex items-center space-x-1 text-${metric.trend === 'up' ? 'green' : metric.trend === 'down' ? 'red' : 'gray'}-400`}>
                        <TrendingUp className={`w-4 h-4 ${metric.trend === 'down' ? 'rotate-180' : ''}`} />
                        <span className="text-sm font-medium">{metric.change}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">{metric.value}</h3>
                      <p className="text-gray-300 font-medium">{metric.title}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'features' && (
            <motion.div
              key="features"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid md:grid-cols-2 gap-6">
                {featureCards.map((feature, index) => (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-xl bg-blue-500/20">
                          {renderIcon(feature.icon, 'w-6 h-6 text-blue-400')}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                          <p className="text-gray-400 text-sm mt-1">{feature.description}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(feature.status)}`}>
                        {feature.status.replace('-', ' ')}
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all font-medium text-sm flex items-center gap-2">
                        Learn More
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {(activeTab === 'analytics' || activeTab === 'settings') && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center"
            >
              <h2 className="text-2xl font-bold text-blue-400 mb-4">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Panel
              </h2>
              <p className="text-gray-300 mb-6">
                {activeTab === 'analytics'
                  ? 'Advanced analytics and insights for your platform usage and performance metrics.'
                  : 'Configure your platform settings and preferences for optimal performance.'
                }
              </p>
              <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all font-medium">
                Coming Soon
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        .glassmorphism {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  )
}
